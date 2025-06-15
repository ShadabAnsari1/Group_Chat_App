const socket = io();
let userName = 'Guest';

// ✅ Get username from server and register it
fetch('/auth/me')
  .then(res => res.json())
  .then(data => {
    userName = data.name;
    socket.emit('register user', userName);
  });

// ✅ Handle form submit (Enter or Send button)
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

form.addEventListener('submit', (e) => {
  e.preventDefault();  // Prevent form refresh
  const msg = input.value.trim();
  if (msg) {
    socket.emit('chat message', msg);
    input.value = '';
  }
});

// ✅ Receive and display messages with color per user
socket.on('chat message', (msg) => {
  const item = document.createElement('li');
  const [name, ...rest] = msg.split(': ');
  const text = rest.join(': ');
  item.innerHTML = `<strong style="color:${stringToColor(name)}">${name}</strong>: ${text}`;
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