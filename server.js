const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

console.log(path.join(__dirname, 'public'))
//set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord Bot';

//run when a client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {

    const user = userJoin(socket.id, username, room);

    socket.join(user.room);
    //sends data to current client only
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord'));

    //Broadcast when a user connects
    //boradcast sends data to everyone except the current client
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `A ${user.username} has joined the chat`));

    //sends user and room info
    io.to(user.room).emit('roomusers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  //listen for chat message
  socket.on('chatMessage', message => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(user.username, message));
  });

  //Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (user) {
      //sends data to everyone including the current user
      io.to(user.room).emit('message', formatMessage(botName, `A ${user.username} has left the chat`));
      io.to(user.room).emit('roomusers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on ${PORT}`));