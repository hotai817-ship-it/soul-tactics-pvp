const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const ALL_CARDS = [
  { id: "card_0", dynasty: "秦", name: "秦始皇", hp: 200.0, category: "人物", trait: "祖龍之威", skill: "六合一統", skill_detail: "攻擊30", chaos: 1, harmony: 1 },
  { id: "card_1", dynasty: "秦", name: "高級軍吏俑", hp: 100.0, category: "人物", trait: "", skill: "衝鋒陷陣", skill_detail: "攻擊10", chaos: 0, harmony: 1 },
  { id: "card_6", dynasty: "西漢", name: "李廣", hp: 120.0, category: "人物", trait: "李廣難封", skill: "精誠所至", skill_detail: "攻擊30", chaos: 1, harmony: 0 },
  { id: "card_7", dynasty: "西漢", name: "霍去病", hp: 120.0, category: "人物", trait: "千里奔襲", skill: "馬踏匈奴", skill_detail: "攻擊30", chaos: 1, harmony: 0 },
  { id: "card_8", dynasty: "西漢", name: "漢武帝", hp: 180.0, category: "人物", trait: "好大喜功", skill: "豐功偉績", skill_detail: "攻擊40", chaos: 1, harmony: 1 }
];

let waitingPlayer = null;
let rooms = {};

io.on('connection', (socket) => {
    socket.on('find_game', () => {
        if (waitingPlayer && waitingPlayer !== socket) {
            const roomId = `room_${Date.now()}`;
            socket.join(roomId);
            waitingPlayer.join(roomId);

            rooms[roomId] = {
                players: [waitingPlayer, socket],
                state: {
                    [waitingPlayer.id]: { hp: 300, energyChaos: 1, energyHarmony: 1, hand: getRandomCards(5), active: null },
                    [socket.id]: { hp: 300, energyChaos: 1, energyHarmony: 1, hand: getRandomCards(5), active: null }
                },
                turn: waitingPlayer.id
            };

            io.to(roomId).emit('game_start', { roomId });
            broadcastGameState(roomId);
            waitingPlayer = null;
        } else {
            waitingPlayer = socket;
            socket.emit('waiting', '正在配對對手...');
        }
    });

    socket.on('play_card', ({ roomId, cardIndex }) => {
        const room = rooms[roomId];
        if (!room || room.turn !== socket.id) return;
        const pState = room.state[socket.id];
        const card = pState.hand.splice(cardIndex, 1)[0];
        if (card.hp > 0 && !pState.active) {
            pState.active = card;
        } else {
            pState.hand.push(card); // 若無效則放回
        }
        broadcastGameState(roomId);
    });

    socket.on('attack', ({ roomId, answerCorrect }) => {
        const room = rooms[roomId];
        if (!room || room.turn !== socket.id) return;
        const pState = room.state[socket.id];
        const opSocket = room.players.find(p => p.id !== socket.id);
        const opState = room.state[opSocket.id];

        if (!pState.active) return;

        // 生命值扣減處理：答對扣 80 點，答錯扣 40 點
        let dmg = answerCorrect ? 80 : 40;
        opState.hp -= dmg;
        if (opState.hp < 0) opState.hp = 0;

        io.to(roomId).emit('battle_log', { msg: `【${pState.active.name}】發動攻擊，造成 ${dmg} 點傷害！` });

        if (opState.hp <= 0) {
            io.to(roomId).emit('game_over', { winner: socket.id });
            delete rooms[roomId];
        } else {
            // 攻擊後自動切換回合
            room.turn = opSocket.id;
            broadcastGameState(roomId);
        }
    });

    socket.on('end_turn', (roomId) => {
        const room = rooms[roomId];
        if (!room || room.turn !== socket.id) return;
        room.turn = room.players.find(p => p.id !== socket.id).id;
        broadcastGameState(roomId);
    });

    socket.on('disconnect', () => { if (waitingPlayer === socket) waitingPlayer = null; });
});

function getRandomCards(count) {
    let res = [];
    for(let i=0; i<count; i++) {
        let card = ALL_CARDS[Math.floor(Math.random() * ALL_CARDS.length)];
        res.push(JSON.parse(JSON.stringify(card)));
    }
    return res;
}

function broadcastGameState(roomId) {
    const room = rooms[roomId];
    if (!room) return;
    room.players.forEach(p => {
        const opId = room.players.find(x => x.id !== p.id).id;
        p.emit('game_state_update', {
            myState: room.state[p.id],
            opState: room.state[opId],
            isMyTurn: room.turn === p.id
        });
    });
}

server.listen(3000, () => console.log('伺服器運行於 http://localhost:3000'));
