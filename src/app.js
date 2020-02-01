const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const path = require('path')
const Filter = require('bad-words')
const {generateMessage, generateLocation} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')
const app = express()

const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname,'../public')
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket)=>{
    console.log('New connection!')

    socket.on('join',({username, room}, callback)=>{
        const {error, user} = addUser({id:socket.id, username,room})

        if(error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('sendMessage', generateMessage('admin','Hello world'))
        socket.broadcast.to(user.room).emit('sendMessage',generateMessage('admin',`${user.username} has joined`))

        io.to(user.room).emit('RoomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    
    socket.on('recvMessage',(message,callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profane message')
        }
        io.to(user.room).emit('sendMessage',generateMessage(user.username,message))
        callback()
    })

    socket.on('location',(pos,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('sendLocation',generateLocation(user.username,`https://google.com/maps?q=${pos.lat},${pos.long}`))
        callback()
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('sendMessage', generateMessage('admin',`${user.username} has left`))
            io.to(user.room).emit('RoomData', {
                room: user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })
})

const port = process.env.PORT || 3000
server.listen(port, (req,res)=>{
    console.log('Server is up')
})