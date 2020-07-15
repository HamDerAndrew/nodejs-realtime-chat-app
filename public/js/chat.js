// Connect to server with socket.io
const socket = io();
const form = document.getElementById('msgForm');
const userInput = document.getElementById('userMsg');

socket.on('welcomeMsg', (message) => {
    console.log("Welcome message: ", message)
})

form.addEventListener('submit', (event) => {
    event.preventDefault();
    socket.emit('sendMsg', userInput.value)
})

socket.on('sendMsg', (message) => {
    console.log(message)
})