const express = require('express');
const path = require('path')
const http = require('http');
const socketio = require('socket.io');

const app = express();

// Create a server. If this isn't done, Express does it behind the scenes anyways
const server = http.createServer(app)

// Socketio expects to take in a server in the 'socketio()' function.
const io = socketio(server)

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '../public')

io.on('connection', (socket) => {
    const message = 'Welcome good Sir / Madam'
    console.log("Connection established")
    socket.emit('welcomeMsg', message)

    socket.on('sendMsg', (userMessage) => {
        // emit userMessage to all connected clients
        io.emit('sendMsg', userMessage)
    })
})

// Serve the index.html
app.use(express.static(publicPath))

server.listen(port);