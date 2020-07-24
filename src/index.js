const express = require('express');
const path = require('path')
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { createMsg, createLocationMsg } = require('./utils/messages');
const { addUser, getUser, removeUser, getUsersInRoom} = require('./utils/users');

const app = express();

// Create a server. If this isn't done, Express does it behind the scenes anyways
const server = http.createServer(app)

// Socketio expects to take in a server in the 'socketio()' function.
const io = socketio(server)

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '../public')

io.on('connection', (socket) => {
    console.log("Connection established")
    socket.on('joinRoom', ({ username, room }, callback) => {
        // 'socket.id' is the id provided by the 'socket' object from 'io.on(socket)'
        const { error, user } = addUser(socket.id, username, room)

        if (error) return callback(error)

        socket.join(user.room)
        socket.emit('eventMsg', createMsg('Admin', `Welcome ${user.username}`))
        socket.broadcast.to(user.room).emit('eventMsg', createMsg('Admin', `${user.username} has joined in!`))
        io.to(user.room).emit('roomInfo', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        // Let the client know they joined a room by calling the callback
        callback()
    })

    socket.on('sendMsg', (userMessage, callback) => {
        const filter = new Filter()
        const user = getUser(socket.id)

        // Check for profanity aka "bad words" :D
        if (filter.isProfane(userMessage)) {
            return callback("Admin: Seems like you used a naughty word. Shame on you")
        }
        // emit userMessage to all connected clients
        // io.emit('eventMsg', createMsg(userMessage))
        io.to(user.room).emit('eventMsg', createMsg(user.username, userMessage))
        // callback received as an "Acknowledgement" from the client 'chat.js'. Arguments passed can be accessed on the client
        callback()
    })

    socket.on('shareLocation', (lat, long, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('showLocation', createLocationMsg(user.username, `https://google.com/maps?q=${lat},${long}`))
        callback()
    })

    // 'disconnect' is a built-in event in socket.io. This will run whenever a client gets disconnected
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('eventMsg', createMsg('Admin', `${user.username} has left the "${user.room}" room`))
            io.to(user.room).emit('roomInfo', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

// Serve the index.html
app.use(express.static(publicPath))

server.listen(port);