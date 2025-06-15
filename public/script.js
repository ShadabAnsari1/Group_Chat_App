const socket = io();
let userName = 'Guest';

// Get username from server and register it
fetch('/auth/me')
  .then(res => res.json())
  .then(data => {
    userName = data.name;
    socket.emit('register user', userName);
  });

// Handle form + image input
const form = document.getElementById('form');
const input = document.getElementById('input');
const imageInput = document.getElementById('imageInput');
const messages = document.getElementById('messages');

// Handle text message submit
form.addEventListener('submit', (e) => {
  e.preventDefault();  // Prevent form refresh
  const msg = input.value.trim();
  if (msg) {
    socket.emit('chat message', msg);
    input.value = '';
  }
});

// Handle image selection
imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target.result;
      socket.emit('chat image', base64);
    };
    reader.readAsDataURL(file);
  }
});

// ✅ Display incoming text messages
socket.on('chat message', (msg) => {
  const item = document.createElement('li');
  const [name, ...rest] = msg.split(': ');
  const text = rest.join(': ');
  item.innerHTML = `<strong style="color:${stringToColor(name)}">${name}</strong>: ${text}`;
  messages.appendChild(item);
  item.scrollIntoView();
});

// ✅ Display incoming image messages
socket.on('chat image', (data) => {
  const item = document.createElement('li');
  item.innerHTML = `<strong style="color:${stringToColor(data.name)}">${data.name}</strong>:<br>
                    <img src="${data.image}" style="max-width: 200px; max-height: 200px;">`;
  messages.appendChild(item);
  item.scrollIntoView();
});

// ✅ Generate a consistent color per username
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}
// const socket = io();
// let userName = 'Guest';

// // ✅ Get username from server and register it
// fetch('/auth/me')
//   .then(res => res.json())
//   .then(data => {
//     userName = data.name;
//     socket.emit('register user', userName);
//   });

// // ✅ Handle form submit (Enter or Send button)
// const form = document.getElementById('form');
// const input = document.getElementById('input');
// const messages = document.getElementById('messages');

// form.addEventListener('submit', (e) => {
//   e.preventDefault();  // Prevent form refresh
//   const msg = input.value.trim();
//   if (msg) {
//     socket.emit('chat message', msg);
//     input.value = '';
//   }
// });

// // ✅ Receive and display messages with color per user
// socket.on('chat message', (msg) => {
//   const item = document.createElement('li');
//   const [name, ...rest] = msg.split(': ');
//   const text = rest.join(': ');
//   item.innerHTML = `<strong style="color:${stringToColor(name)}">${name}</strong>: ${text}`;
//   messages.appendChild(item);
//   item.scrollIntoView();
// });

// // ✅ Generate a consistent color per username
// function stringToColor(str) {
//   let hash = 0;
//   for (let i = 0; i < str.length; i++) {
//     hash = str.charCodeAt(i) + ((hash << 5) - hash);
//   }
//   const hue = hash % 360;
//   return `hsl(${hue}, 70%, 50%)`;
// }