// ✅ Connect to the server using Socket.IO
const socket = io();

// ✅ Handle form submit
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

form.addEventListener('submit', (e) => {
  e.preventDefault();  // Prevent form from refreshing page
  if (input.value) {
    socket.emit('chat message', input.value);  // Send message to server
    input.value = '';  // Clear input box
  }
});

// ✅ Receive messages and add to list
socket.on('chat message', (msg) => {
  const item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});