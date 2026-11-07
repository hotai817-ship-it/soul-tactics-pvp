// server.js - 《英魂決》WebSocket 即時對戰伺服器
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(express.static(__dirname));

const rooms = {};

io.on('connection', (socket) => {
    console.log(`玩家連線: ${socket.id}`);

    socket.on('createRoom', (roomCode) => {
        if (rooms[roomCode]) {
            socket.emit('errorMsg', '房間代碼已存在！');
            return;
        }
        rooms[roomCode] = {
            players: [{ id: socket.id, hp: 60, card: null }],
            turn: socket.id
        };
        socket.join(roomCode);
        socket.emit('roomCreated', roomCode);
    });

    socket.on('joinRoom', (roomCode) => {
        const room = rooms[roomCode];
        if (!room) {
            socket.emit('errorMsg', '找不到此房間！');
            return;
        }
        if (room.players.length >= 2) {
            socket.emit('errorMsg', '房間已滿！');
            return;
        }
        room.players.push({ id: socket.id, hp: 60, card: null });
        socket.join(roomCode);
        io.to(roomCode).emit('gameStart', { players: room.players });
    });

    socket.on('playCardData', ({ roomCode, card }) => {
        socket.to(roomCode).emit('opponentPlayed', { card, playerId: socket.id });
    });

    socket.on('attackAction', ({ roomCode, damage, isCorrect }) => {
        io.to(roomCode).emit('battleUpdate', { attacker: socket.id, damage, isCorrect });
    });

    socket.on('disconnect', () => {
        console.log(`玩家離線: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`《英魂決》伺服器已在 port ${PORT} 啟動`);
});
