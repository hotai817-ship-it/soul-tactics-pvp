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

// 幻獸資料庫
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

// ==========================================
// 🧠 智能抽牌系統 (確保手牌能對應幻獸)
// ==========================================

// 1. 取得目前場上幻獸的所有合法因數 (1~9)
function getValidFactorsForField(fieldMonsters) {
    let factors = [];
    fieldMonsters.forEach(monster => {
        for (let i = 1; i <= 9; i++) {
            if (monster.hp % i === 0 && monster.hp / i <= 9) {
                factors.push(i);
            }
        }
    });
    return factors;
}

// 2. 智能抽卡：80% 機率抽出有用的因數，20% 隨機
function drawSmartCard(fieldMonsters) {
    const validFactors = getValidFactorsForField(fieldMonsters);
    // 如果場上還有幻獸，且落入 80% 的機率
    if (validFactors.length > 0 && Math.random() < 0.8) {
        return validFactors[Math.floor(Math.random() * validFactors.length)];
    }
    // 否則給予隨機 1~9 卡片
    return Math.floor(Math.random() * 9) + 1;
}

// 3. 生成起手牌：保證初始 5 張牌中，絕對有一組可以直接擊敗場上的某隻幻獸
function generateInitialHand(fieldMonsters) {
    let hand = [];
    if (fieldMonsters.length > 0) {
        // 隨機鎖定場上一隻幻獸
        const target = fieldMonsters[Math.floor(Math.random() * fieldMonsters.length)];
        let possiblePairs = [];
        for (let i = 1; i <= 9; i++) {
            if (target.hp % i === 0 && target.hp / i <= 9) {
                possiblePairs.push([i, target.hp / i]);
            }
        }
        // 塞入一組必定能解題的配對
        if (possiblePairs.length > 0) {
            const pair = possiblePairs[Math.floor(Math.random() * possiblePairs.length)];
            hand.push(pair[0], pair[1]);
        }
    }
    
    // 剩下的 3 張牌使用智能補牌
    while (hand.length < 5) {
        hand.push(drawSmartCard(fieldMonsters));
    }
    
    // 洗牌，讓保底牌位置隨機
    return hand.sort(() => Math.random() - 0.5);
}

// ==========================================

let rooms = {};

io.on('connection', (socket) => {
    socket.on('create_room', (roomId) => {
        if (!roomId || typeof roomId !== 'string') {
            socket.emit('error_msg', '房號格式不正確！');
            return;
        }
        roomId = roomId.trim();
        if (rooms[roomId]) {
            socket.emit('error_msg', '房間已存在，請直接加入！');
            return;
        }
        
        let shuffledMonsters = [...MONSTER_DB].sort(() => Math.random() - 0.5);
        let initialField = shuffledMonsters.splice(0, 3);
        
        rooms[roomId] = {
            players: [socket.id],
            state: {
                turn: socket.id,
                fieldMonsters: initialField,
                monsterDeck: shuffledMonsters,
                playerData: {
                    // 使用智能系統生成起手牌
                    [socket.id]: { score: 0, hand: generateInitialHand(initialField) }
                }
            }
        };
        socket.join(roomId);
        socket.emit('room_created', roomId);
    });

    socket.on('join_room', (roomId) => {
        if (!roomId || !rooms[roomId]) {
            socket.emit('error_msg', '房間不存在！');
            return;
        }
        roomId = roomId.trim();
        const room = rooms[roomId];
        if (room.players.length >= 2) {
            socket.emit('error_msg', '房間已滿！');
            return;
        }
        if (room.players.includes(socket.id)) return;

        room.players.push(socket.id);
        // 使用智能系統生成第二位玩家的起手牌
        room.state.playerData[socket.id] = { score: 0, hand: generateInitialHand(room.state.fieldMonsters) };
        socket.join(roomId);

        io.to(roomId).emit('game_start', { roomId });
        updateGameState(roomId);
    });

    // 玩家發動攻擊
    socket.on('attack', ({ roomId, cardIndices, monsterIndex }) => {
        const room = rooms[roomId];
        if (!room || room.state.turn !== socket.id) return;
        
        const pData = room.state.playerData[socket.id];
        if (!pData || cardIndices.length !== 2 || monsterIndex === null) return;

        const num1 = pData.hand[cardIndices[0]];
        const num2 = pData.hand[cardIndices[1]];
        const targetMonster = room.state.fieldMonsters[monsterIndex];

        if (num1 === undefined || num2 === undefined || !targetMonster) return;

        // 乘法判定
        if (num1 * num2 === targetMonster.hp) {
            pData.score += targetMonster.pts;
            io.to(roomId).emit('play_sound', { type: 'success' });
            io.to(roomId).emit('battle_log', { msg: `✨ 討伐成功！${num1} × ${num2} = ${targetMonster.hp}，獲得 ${targetMonster.pts} 分！` });

            // 移除出過的兩張手牌
            cardIndices.sort((a, b) => b - a).forEach(idx => pData.hand.splice(idx, 1));
            
            // 移除並替換幻獸 (先替換幻獸，才能讓後續抽牌對應到新幻獸)
            room.state.fieldMonsters.splice(monsterIndex, 1);
            if (room.state.monsterDeck.length > 0) {
                room.state.fieldMonsters.push(room.state.monsterDeck.shift());
            }

            // 根據「更新後的場上幻獸」智能補充兩張牌
            pData.hand.push(
                drawSmartCard(room.state.fieldMonsters), 
                drawSmartCard(room.state.fieldMonsters)
            );

            checkWinCondition(room, roomId);
        } else {
            // 討伐失敗
            pData.score = Math.max(0, pData.score - 5);
            io.to(roomId).emit('play_sound', { type: 'fail' });
            io.to(roomId).emit('battle_log', { msg: `❌ 討伐失敗！${num1} × ${num2} 不等於 ${targetMonster.hp}，被幻獸反擊扣 5 分！` });
        }
        
        switchTurn(room, roomId);
    });

    // 棄牌重抽
    socket.on('discard', ({ roomId, cardIndex }) => {
        const room = rooms[roomId];
        if (!room || room.state.turn !== socket.id) return;
        
        const pData = room.state.playerData[socket.id];
        if (!pData || typeof cardIndex !== 'number') return;

        pData.hand.splice(cardIndex, 1)[0];
        
        // 棄牌後，必定使用智能補牌補充一張
        pData.hand.push(drawSmartCard(room.state.fieldMonsters));
        
        io.to(roomId).emit('play_sound', { type: 'draw' });
        io.to(roomId).emit('battle_log', { msg: `🔄 玩家棄牌並重新補給，回合結束。` });
        
        switchTurn(room, roomId);
    });

    socket.on('disconnect', () => {
        for (let roomId in rooms) {
            let room = rooms[roomId];
            if (room && room.players.includes(socket.id)) {
                io.to(roomId).emit('battle_log', { msg: `⚠️ 對手已斷線，遊戲結束。` });
                const winnerId = room.players.find(id => id !== socket.id) || socket.id;
                io.to(roomId).emit('game_over', { msg: '對手離開了，你獲得了勝利！' });
                delete rooms[roomId];
            }
        }
    });
});

function switchTurn(room, roomId) {
    if (!room) return;
    room.state.turn = room.players.find(id => id !== room.state.turn);
    updateGameState(roomId);
}

function checkWinCondition(room, roomId) {
    let isGameOver = false;
    let winnerId = null;

    room.players.forEach(pid => {
        if (room.state.playerData[pid].score >= 100) {
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
        if (winnerId === 'draw') {
            io.to(roomId).emit('game_over', { msg: '平手！你們都是優秀的幻獸大師！' });
        } else {
            io.to(roomId).emit('game_over', { msg: '達到 100 分或幻獸淨空，遊戲結束！', winner: winnerId });
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
    console.log(`《九九幻獸島》伺服器已在 port ${PORT} 啟動！`);
});
