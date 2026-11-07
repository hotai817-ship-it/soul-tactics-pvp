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
        console.log(`Room created: ${roomCode} by ${socket.id}`);
    });

    socket.on('joinRoom', (roomCode) => {
        const room = io.sockets.adapter.rooms.get(roomCode);
        if (room) {
            if (room.size === 1) {
                socket.join(roomCode);
                console.log(`User ${socket.id} joined room: ${roomCode}. Total players: 2. Starting game!`);
                // 確保雙方玩家完全齊集後才啟動遊戲
                io.to(roomCode).emit('gameStart');
            } else if (room.size >= 2) {
                socket.emit('errorMsg', '房間人數已滿（雙人對戰已齊集）！');
            }
        } else {
            socket.emit('errorMsg', '房間不存在！請先創建房間。');
        }
    });

    socket.on('playCardData', (data) => {
        socket.to(data.roomCode).emit('opponentPlayed', { card: data.card, zone: data.zone });
    });

    // 嚴格檢查：必須雙方齊集（房間內剛好2人）才允許執行攻擊與扣血
    socket.on('attackAction', (data) => {
        const room = io.sockets.adapter.rooms.get(data.roomCode);
        if (room && room.size === 2) {
            io.to(data.roomCode).emit('battleUpdate', {
                attacker: socket.id,
                damage: data.damage,
                isCorrect: data.isCorrect
            });
        } else {
            socket.emit('errorMsg', '⚠️ 尚有對手未加入，請等待所有人齊集後方可發動攻擊！');
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
