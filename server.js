// server.js - 《英魂決》WebSocket 即時對戰伺服器
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});
// 讓伺服器自動讀取並顯示同資料夾的 index.html
// server.js - 《英魂決》WebSocket 即時對戰伺服器
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// 💡 1. 載入同資料夾的靜態網頁檔案
app.use(express.static(__dirname));

// 💡 2. 確保用戶造訪根目錄 (/) 時，精準回傳 index.html 畫面
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// 儲存對戰房間狀態
const rooms = {};

io.on('connection', (socket) => {
    console.log(`玩家連線: ${socket.id}`);
    
    // (下方其餘的 socket 監聽與事件保持不變...)
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`《英魂決》伺服器已在 port ${PORT} 啟動`);
});


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
