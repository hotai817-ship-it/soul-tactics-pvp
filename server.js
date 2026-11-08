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
        
        // 【變更】為了讓 300 分的目標可以達成，將幻獸牌庫數量直接加倍
        let shuffledMonsters = [...MONSTER_DB, ...MONSTER_DB].sort(() => Math.random() - 0.5);
        
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
        room.state.playerData[socket.id] = { score: 0, hand: Array.from({length: 5}, drawNumberCard) };
        
        checkAndFixHands(room); // 加入後檢查雙方保底
        socket.join(roomId);
        io.to(roomId).emit('game_start', { roomId });
        
        updateGameState(roomId);
        startTurnTimer(room, roomId); // 雙方到齊，開始15秒計時
    });

    socket.on('attack', ({ roomId, cardIndices, monsterIndex }) => {
        const room = rooms[roomId];
        if (!room || room.state.turn !== socket.id) return;
        
        const pData = room.state.playerData[socket.id];
        if (!pData || cardIndices.length !== 2 || monsterIndex === null) return;

        const num1 = pData.hand[cardIndices[0]];
        const num2 = pData.hand[cardIndices[1]];
        const targetMonster = room.state.fieldMonsters[monsterIndex];

        if (num1 === undefined || num2 === undefined || !targetMonster) return;

        clearTimeout(room.timer); // 動作有效，暫停計時

        if (num1 * num2 === targetMonster.hp) {
            pData.score += targetMonster.pts;
            io.to(roomId).emit('play_sound', { type: 'success' });
            io.to(roomId).emit('battle_log', { msg: `✨ 討伐成功！${num1} × ${num2} = ${targetMonster.hp}，獲得 ${targetMonster.pts} 分！` });

            cardIndices.sort((a, b) => b - a).forEach(idx => pData.hand.splice(idx, 1));
            pData.hand.push(drawNumberCard(), drawNumberCard());
            
            room.state.fieldMonsters.splice(monsterIndex, 1);
            if (room.state.monsterDeck.length > 0) room.state.fieldMonsters.push(room.state.monsterDeck.shift());

            // 場上怪物更新，再次檢查雙方手牌確保有解
            checkAndFixHands(room);
            checkWinCondition(room, roomId);
        } else {
            pData.score = Math.max(0, pData.score - 5);
            io.to(roomId).emit('play_sound', { type: 'fail' });
            io.to(roomId).emit('battle_log', { msg: `❌ 討伐失敗！${num1} × ${num2} 不等於 ${targetMonster.hp}，扣 5 分！` });
        }
        switchTurn(room, roomId);
    });

    socket.on('discard', ({ roomId, cardIndex }) => {
        const room = rooms[roomId];
        if (!room || room.state.turn !== socket.id) return;
        const pData = room.state.playerData[socket.id];
        if (!pData || typeof cardIndex !== 'number') return;

        clearTimeout(room.timer); // 動作有效，暫停計時

        pData.hand.splice(cardIndex, 1)[0];
        pData.hand.push(drawNumberCard());
        
        checkAndFixHands(room);
        io.to(roomId).emit('play_sound', { type: 'draw' });
        io.to(roomId).emit('battle_log', { msg: `🔄 玩家棄牌重抽，回合結束。` });
        
        switchTurn(room, roomId);
    });

    socket.on('disconnect', () => {
        for (let roomId in rooms) {
            let room = rooms[roomId];
            if (room && room.players.includes(socket.id)) {
                clearTimeout(room.timer); 
                io.to(roomId).emit('battle_log', { msg: `⚠️ 對手已斷線，遊戲結束。` });
                const winnerId = room.players.find(id => id !== socket.id) || socket.id;
                io.to(roomId).emit('game_over', { msg: '對手逃跑了，你獲得了勝利！' });
                delete rooms[roomId];
            }
        }
    });
});

function switchTurn(room, roomId) {
    if (!room) return;
    room.state.turn = room.players.find(id => id !== room.state.turn);
    updateGameState(roomId);
    startTurnTimer(room, roomId); // 換人後，重新啟動 15 秒計時器
}

function checkWinCondition(room, roomId) {
    let isGameOver = false;
    let winnerId = null;

    room.players.forEach(pid => {
        // 【變更】獲勝目標改為 300 分
        if (room.state.playerData[pid].score >= 300) {
            isGameOver = true;
            winnerId = pid;
        }
    });

    if (room.state.fieldMonsters.length === 0) {
        isGameOver = true;
        const p1 = room.players[0];
        const p2 = room.players[1];
        if (room.state.playerData[p1].score > room.state.playerData[p2].score) winnerId = p1;
        else if (room.state.playerData[p1].score < room.state.playerData[p2].score) winnerId = p2;
        else winnerId = 'draw';
    }

    if (isGameOver) {
        clearTimeout(room.timer); 
        if (winnerId === 'draw') {
            io.to(roomId).emit('game_over', { msg: '平手！你們都是優秀的幻獸大師！' });
        } else {
            // 【變更】結算文字顯示 300 分
            io.to(roomId).emit('game_over', { msg: '達到 300 分或幻獸淨空，遊戲結束！', winner: winnerId });
        }
        delete rooms[roomId];
    }
}

function updateGameState(roomId) {
    const room = rooms[roomId];
    if (!room) return;
    room.players.forEach(pid => {
        const opId = room.players.find(id => id !== pid);
        io.to(pid).emit('game_state_update', {
            myState: room.state.playerData[pid],
            opState: room.state.playerData[opId] || { score: 0, hand: [0,0,0,0,0] },
            fieldMonsters: room.state.fieldMonsters,
            monstersLeft: room.state.monsterDeck.length,
            isMyTurn: room.state.turn === pid
        });
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`《九九幻獸島》伺服器已啟動於 Port ${PORT}！`);
});
