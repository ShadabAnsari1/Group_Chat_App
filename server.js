const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session + Passport
app.use(session({
  secret: 'simplechatsecret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Routes
app.get('/', (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/chat');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => res.redirect('/chat')
);

app.get('/chat', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

app.get('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  });
});

app.get('/auth/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ name: req.user.displayName });
  } else {
    res.json({ name: 'Guest' });
  }
});

//  Socket.IO with text + image handling
io.on('connection', (socket) => {
  let userName = 'Unknown User';

  socket.on('register user', (name) => {
    userName = name;
  });

  socket.on('chat message', (msg) => {
    const fullMsg = `${userName}: ${msg}`;
    io.emit('chat message', fullMsg);

    // Optional: log text messages (will disappear on Render restarts)
    const filename = `logs/${userName.replace(/\s+/g, '_')}.log`;
    fs.appendFile(filename, fullMsg + '\n', (err) => {
      if (err) console.error('❌ Failed to write log:', err);
    });
  });

  // ✅ Handle image messages
  socket.on('chat image', (base64) => {
    io.emit('chat image', { name: userName, image: base64 });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
// const express = require('express');
// const session = require('express-session');
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const http = require('http');
// const socketio = require('socket.io');
// const path = require('path');
// const fs = require('fs');
// require('dotenv').config();//

// const app = express();
// const server = http.createServer(app);
// const io = socketio(server);

// // Static files
// app.use(express.static(path.join(__dirname, 'public')));

// // Session + Passport
// app.use(session({
//   secret: 'simplechatsecret',
//   resave: false,
//   saveUninitialized: false
// }));
// app.use(passport.initialize());
// app.use(passport.session());

// // Google OAuth
// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
// clientSecret: process.env.GOOGLE_CLIENT_SECRET,
// callbackURL: process.env.GOOGLE_CALLBACK_URL
// }, (accessToken, refreshToken, profile, done) => {
//   return done(null, profile);
// }));
// passport.serializeUser((user, done) => done(null, user));
// passport.deserializeUser((user, done) => done(null, user));

// // Routes
// app.get('/', (req, res) => {
//   if (req.isAuthenticated()) return res.redirect('/chat');
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// app.get('/auth/google',
//   passport.authenticate('google', { scope: ['profile', 'email'] })
// );

// app.get('/auth/google/callback',
//   passport.authenticate('google', { failureRedirect: '/' }),
//   (req, res) => res.redirect('/chat')
// );

// app.get('/chat', (req, res) => {
//   if (!req.isAuthenticated()) return res.redirect('/');
//   res.sendFile(path.join(__dirname, 'public', 'chat.html'));
// });

// app.get('/logout', (req, res) => {
//   req.logout(() => {
//     req.session.destroy(() => {
//       res.redirect('/');
//     });
//   });
// });

// app.get('/auth/me', (req, res) => {
//   if (req.isAuthenticated()) {
//     res.json({ name: req.user.displayName });
//   } else {
//     res.json({ name: 'Guest' });
//   }
// });


// // Socket.IO with per-user chat log
// io.on('connection', (socket) => {
//   let userName = 'Unknown User';

//   socket.on('register user', (name) => {
//     userName = name;
//   });

//   socket.on('chat message', (msg) => {
//     const fullMsg = `${userName}: ${msg}`;
//     io.emit('chat message', fullMsg);

//     const filename = `logs/${userName.replace(/\s+/g, '_')}.log`;
//     fs.appendFile(filename, fullMsg + '\n', (err) => {
//       if (err) console.error('❌ Failed to write log:', err);
//     });
//   });
// });

// // Start server
// server.listen(3000, () => {
//   console.log('🚀 Server running at http://localhost:3000');
// });