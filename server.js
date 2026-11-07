const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('.'));

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('createRoom', (roomCode) => {
        socket.join(roomCode);
        socket.emit('roomCreated', roomCode);
    });

    socket.on('joinRoom', (roomCode) => {
        const room = io.sockets.adapter.rooms.get(roomCode);
        if (room && room.size === 1) {
            socket.join(roomCode);
            io.to(roomCode).emit('gameStart');
        } else {
            socket.emit('errorMsg', '房間不存在或人數已滿！');
        }
    });

    socket.on('playCardData', (data) => {
        socket.to(data.roomCode).emit('opponentPlayed', { card: data.card });
    });

    // 嚴格廣播攻擊與血量同步事件至房間內所有人
    socket.on('attackAction', (data) => {
        io.to(data.roomCode).emit('battleUpdate', {
            attacker: socket.id,
            damage: data.damage,
            isCorrect: data.isCorrect
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
