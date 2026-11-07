const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// 託管靜態檔案
app.use(express.static('.'));

// 記錄房間狀態
const rooms = {};

io.on('connection', (socket) => {
    console.log(`使用者連線: ${socket.id}`);

    // 創建房間
    socket.on('createRoom', (roomCode) => {
        if (!roomCode) {
            socket.emit('errorMsg', '房號不能為空！');
            return;
        }
        
        socket.join(roomCode);
        rooms[roomCode] = { players: [socket.id] };
        console.log(`房間已創建: ${roomCode} 由 ${socket.id}`);
        socket.emit('roomCreated', roomCode);
    });

    // 加入房間
    socket.on('joinRoom', (roomCode) => {
        const room = io.sockets.adapter.rooms.get(roomCode);
        
        if (!room) {
            socket.emit('errorMsg', '房間不存在！請先創建房間。');
            return;
        }

        if (room.size >= 2) {
            socket.emit('errorMsg', '房間人數已滿（雙人對戰已齊集）！');
            return;
        }

        socket.join(roomCode);
        if (!rooms[roomCode]) {
            rooms[roomCode] = { players: [] };
        }
        if (!rooms[roomCode].players.includes(socket.id)) {
            rooms[roomCode].players.push(socket.id);
        }

        console.log(`使用者 ${socket.id} 加入房間: ${roomCode}。當前人數: ${room.size}`);

        // 當雙方齊集（剛好2人）時，正式啟動遊戲
        if (room.size === 2) {
            io.to(roomCode).emit('gameStart');
            console.log(`房間 ${roomCode} 雙方已齊集，遊戲正式開始！`);
        }
    });

    // 同步出牌/佈署動作
    socket.on('playCardData', (data) => {
        if (!data || !data.roomCode) return;
        socket.to(data.roomCode).emit('opponentPlayed', { 
            card: data.card, 
            zone: data.zone 
        });
    });

    // 攻擊與血量同步事件（必須確認房間內有2人方可攻擊）
    socket.on('attackAction', (data) => {
        if (!data || !data.roomCode) return;
        const room = io.sockets.adapter.rooms.get(data.roomCode);
        
        if (room && room.size === 2) {
            io.to(data.roomCode).emit('battleUpdate', {
                attacker: socket.id,
                damage: data.damage,
                isCorrect: data.isCorrect
            });
        } else {
            socket.emit('errorMsg', '⚠️ 尚有對手未加入, 請等待所有人齊集後方可發動攻擊！');
        }
    });

    // 斷線處理
    socket.on('disconnect', () => {
        console.log(`使用者離線: ${socket.id}`);
        for (const code in rooms) {
            if (rooms[code].players) {
                rooms[code].players = rooms[code].players.filter(id => id !== socket.id);
                if (rooms[code].players.length === 0) {
                    delete rooms[code];
                }
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`英魂決 TCG 伺服器已成功啟動！`);
    console.log(`請在瀏覽器開啟: http://localhost:${PORT}`);
    console.log(`=================================`);
});
