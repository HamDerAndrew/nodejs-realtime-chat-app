const express = require('express');
const path = require('path')
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { createMsg, createLocationMsg } = require('./utils/messages');

const app = express();

// Create a server. If this isn't done, Express does it behind the scenes anyways
const server = http.createServer(app)

// Socketio expects to take in a server in the 'socketio()' function.
const io = socketio(server)

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '../public')

io.on('connection', (socket) => {
    console.log("Connection established")
    socket.on('joinRoom', ({ username, room }) => {
        console.log(username, room)
        socket.join(room)
        socket.emit('eventMsg', createMsg('Welcome my friend'))
        socket.broadcast.to(room).emit('eventMsg', createMsg(`${username} has joined in!`))
    })
    socket.on('sendMsg', (userMessage, callback) => {
        const filter = new Filter()

        // Check for profanity aka "bad words" :D
        if (filter.isProfane(userMessage)) {
            return callback("Seems like you used a naughty word. Shame on you")
        }
        // emit userMessage to all connected clients
        // io.emit('eventMsg', createMsg(userMessage))
        io.emit('eventMsg', createMsg(userMessage))
        // callback received as an "Acknowledgement" from the client 'chat.js'. Arguments passed can be accessed on the client
        callback()
    })

    socket.on('shareLocation', (lat, long, callback) => {
        io.emit('showLocation', createLocationMsg(`https://google.com/maps?q=${lat},${long}`))
        callback()
    })

    // 'disconnect' is a built-in event in socket.io. This will run whenever a client gets disconnected
    socket.on('disconnect', () => {
        io.emit('eventMsg', createMsg('User has disconnected'))
    })
})

// Serve the index.html
app.use(express.static(publicPath))

server.listen(port);