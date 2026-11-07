// server.js - 《英魂決》WebSocket 即時對戰伺服器
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// 1. 設定靜態檔案目錄，讓伺服器能讀取 index.html 等前端檔案
app.use(express.static(__dirname));

// 2. 確保用戶造訪網址時，精準回傳 index.html 遊戲畫面
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// 儲存對戰房間狀態
const rooms = {};

io.on('connection', (socket) => {
    console.log(`玩家連線: ${socket.id}`);

    // 建立房間
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
        console.log(`房間建立: ${roomCode}`);
    });

    // 加入房間
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
        
        // 通知雙方對戰開始
        io.to(roomCode).emit('gameStart', { players: room.players });
        console.log(`玩家加入房間: ${roomCode}`);
    });

    // 玩家出牌同步
    socket.on('playCardData', ({ roomCode, card }) => {
        const room = rooms[roomCode];
        if (!room) return;
        socket.to(roomCode).emit('opponentPlayed', { card, playerId: socket.id });
    });

    // 攻擊與答題同步
    socket.on('attackAction', ({ roomCode, damage, isCorrect }) => {
        const room = rooms[roomCode];
        if (!room) return;
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
