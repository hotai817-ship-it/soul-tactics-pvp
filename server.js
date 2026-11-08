const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    pingTimeout: 60000,
    pingInterval: 25000
});

app.use(express.static(__dirname));

const MONSTER_DB = [
    { hp: 12, pts: 10, name: "史萊姆", emoji: "💧" },
    { hp: 15, pts: 10, name: "草行鳥", emoji: "🌿" },
    { hp: 18, pts: 10, name: "小石怪", emoji: "🪨" },
    { hp: 24, pts: 15, name: "微風狐", emoji: "🌪️" },
    { hp: 25, pts: 15, name: "火焰犬", emoji: "🔥" },
    { hp: 27, pts: 15, name: "紫晶獸", emoji: "🔮" },
    { hp: 32, pts: 15, name: "巨鉗蟹", emoji: "🦀" },
    { hp: 36, pts: 20, name: "雷電球", emoji: "⚡" },
    { hp: 42, pts: 20, name: "暗影狼", emoji: "🌑" },
    { hp: 45, pts: 20, name: "聖光駒", emoji: "✨" },
    { hp: 48, pts: 20, name: "巨力熊", emoji: "🐻" },
    { hp: 54, pts: 25, name: "幻影蛇", emoji: "🐍" },
    { hp: 56, pts: 25, name: "鐵甲龜", emoji: "🐢" },
    { hp: 63, pts: 25, name: "猛毒蛙", emoji: "🐸" },
    { hp: 64, pts: 30, name: "晶岩龍", emoji: "💎" },
    { hp: 72, pts: 30, name: "暴風鷲", emoji: "🦅" },
    { hp: 81, pts: 40, name: "烈焰魔龍", emoji: "🐉" }
];

// 隨機發 1~9 的數字卡
function drawNumberCard() {
    return Math.floor(Math.random() * 9) + 1;
}

// ==========================================
// 🛡️ 絕對保底系統：確保每回合手牌「必定有解」
// ==========================================
function checkAndFixHands(room) {
    if (!room || room.state.fieldMonsters.length === 0) return;
    
    room.players.forEach(pid => {
        let pData = room.state.playerData[pid];
        if (!pData || pData.hand.length < 2) return;

        let hasValidPair = false;
        // 檢查手牌中是否有任兩張相乘等於場上的幻獸
        for (let i = 0; i < pData.hand.length; i++) {
            for (let j = i + 1; j < pData.hand.length; j++) {
                const product = pData.hand[i] * pData.hand[j];
                if (room.state.fieldMonsters.some(m => m.hp === product)) {
                    hasValidPair = true;
                    break;
                }
            }
            if (hasValidPair) break;
        }

        // 如果玩家完全沒有可以打敗幻獸的牌，系統強制替換 2 張牌給他
        if (!hasValidPair) {
            const target = room.state.fieldMonsters[Math.floor(Math.random() * room.state.fieldMonsters.length)];
            let possiblePairs = [];
            for (let i = 1; i <= 9; i++) {
                if (target.hp % i === 0 && target.hp / i <= 9) {
                    possiblePairs.push([i, target.hp / i]);
                }
            }
            if (possiblePairs.length > 0) {
                const pair = possiblePairs[Math.floor(Math.random() * possiblePairs.length)];
                let indices = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5).slice(0, 2);
                pData.hand[indices[0]] = pair[0];
                pData.hand[indices[1]] = pair[1];
            }
        }
    });
}

// ==========================================
// ⏱️ 15 秒回合倒數計時系統
// ==========================================
function startTurnTimer(room, roomId) {
    if (room.timer) clearTimeout(room.timer);
    
    room.timer = setTimeout(() => {
        if (rooms[roomId]) { 
            io.to(roomId).emit('play_sound', { type: 'fail' });
            io.to(roomId).emit('battle_log', { msg: `⏱️ 15秒時間到！動作太慢，自動放棄回合。` });
            switchTurn(rooms[roomId], roomId);
        }
    }, 15000);
}
// ==========================================

let rooms = {};

io.on('connection', (socket) => {
    socket.on('create_room', (roomId) => {
        if (!roomId || typeof roomId !== 'string') return socket.emit('error_msg', '房號不正確！');
        roomId = roomId.trim();
        if (rooms[roomId]) return socket.emit('error_msg', '房間已存在，請直接加入！');
        
        let shuffledMonsters = [...MONSTER_DB].sort(() => Math.random() - 0.5);
        
        rooms[roomId] = {
            players: [socket.id],
            timer: null, 
            state: {
                turn: socket.id,
                fieldMonsters: shuffledMonsters.splice(0, 3),
                monsterDeck: shuffledMonsters,
                playerData: { [socket.id]: { score: 0, hand: Array.from({length: 5}, drawNumberCard) } }
            }
        };
        
        checkAndFixHands(rooms[roomId]); // 建房立刻檢查保底
        socket.join(roomId);
        socket.emit('room_created', roomId);
    });

    socket.on('join_room', (roomId) => {
        if (!roomId || !rooms[roomId]) return socket.emit('error_msg', '房間不存在！');
        roomId = roomId.trim();
        const room = rooms[roomId];
        if (room.players.length >= 2) return socket.emit('error_msg', '房間已滿！');
        if (room.players.includes(socket.id)) return;

        room.players.push(socket.id);
        room.state.playerData[socket.id] = { score: 0, hand: Array
