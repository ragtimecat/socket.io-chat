const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

console.log(path.join(__dirname, 'public'))
//set static folder
app.use(express.static(path.join(__dirname, 'public')));

//run when a client connects
io.on('connection', socket => {
  console.log('new websockets connection');
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on ${PORT}`));