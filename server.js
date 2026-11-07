const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 託管靜態檔案
app.use(express.static('.'));

const rooms = {};

io.on('connection', (socket) => {
    console.log(`玩家連線: ${socket.id}`);

    socket.on('createRoom', (roomCode) => {
        if (rooms[roomCode]) {
            socket.emit('errorMsg', '此房間已存在，請加入或更換房號！');
        } else {
            rooms[roomCode] = [socket.id];
            socket.join(roomCode);
            socket.emit('roomCreated', roomCode);
            console.log(`房間建立: ${roomCode} 由 ${socket.id}`);
        }
    });

    socket.on('joinRoom', (roomCode) => {
        if (!rooms[roomCode]) {
            socket.emit('errorMsg', '房間不存在，請先創建戰局！');
        } else if (rooms[roomCode].length >= 2) {
            socket.emit('errorMsg', '房間已滿，請加入其他戰局！');
        } else {
            rooms[roomCode].push(socket.id);
            socket.join(roomCode);
            io.to(roomCode).emit('gameStart');
            console.log(`雙方齊集，房間 ${roomCode} 開始對戰`);
        }
    });

    socket.on('playCardData', (data) => {
        socket.to(data.roomCode).emit('opponentPlayed', {
            zone: data.zone,
            card: data.card
        });
    });

    socket.on('attackAction', (data) => {
        io.to(data.roomCode).emit('battleUpdate', {
            attacker: socket.id,
            damage: data.damage,
            isCorrect: data.isCorrect
        });
    });

    socket.on('disconnect', () => {
        console.log(`玩家離線: ${socket.id}`);
        for (let code in rooms) {
            rooms[code] = rooms[code].filter(id => id !== socket.id);
            if (rooms[code].length === 0) {
                delete rooms[code];
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`「英魂決 TCG」伺服器已在 http://localhost:${PORT} 啟動`);
});
