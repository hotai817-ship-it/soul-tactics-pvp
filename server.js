const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

const ALL_CARDS = [
  { id: "card_0", dynasty: "秦", name: "秦始皇", hp: 200, category: "人物", trait: "祖龍之威", skill: "六合一統", skill_detail: "攻擊30" },
  { id: "card_1", dynasty: "秦", name: "高級軍吏俑", hp: 100, category: "人物", trait: "", skill: "衝鋒陷陣", skill_detail: "攻擊10" },
  { id: "card_6", dynasty: "西漢", name: "李廣", hp: 120, category: "人物", trait: "李廣難封", skill: "精誠所至", skill_detail: "攻擊30" },
  { id: "card_7", dynasty: "西漢", name: "霍去病", hp: 120, category: "人物", trait: "千里奔襲", skill: "馬踏匈奴", skill_detail: "攻擊30" },
  { id: "card_8", dynasty: "西漢", name: "漢武帝", hp: 180, category: "人物", trait: "好大喜功", skill: "豐功偉績", skill_detail: "攻擊40" }
];

let rooms = {};

io.on('connection', (socket) => {
    console.log(`玩家連線: ${socket.id}`);

    socket.on('create_room', (roomId) => {
        if (!roomId || roomId.trim() === "") {
            socket.emit('error_msg', '請輸入有效的房間號碼！');
            return;
        }
        roomId = roomId.trim();
        if (rooms[roomId]) {
            socket.emit('error_msg', '此房間號碼已被使用！');
            return;
        }

        socket.join(roomId);
        rooms[roomId] = {
            players: [socket],
            state: {},
            turn: null
        };
        socket.emit('room_created', roomId);
    });

    socket.on('join_room', (roomId) => {
        if (!roomId || roomId.trim() === "") {
            socket.emit('error_msg', '請輸入有效的房間號碼！');
            return;
        }
        roomId = roomId.trim();
        const room = rooms[roomId];
        if (!room) {
            socket.emit('error_msg', '找不到此房間，請確認房號！');
            return;
        }
        if (room.players.length >= 2) {
            socket.emit('error_msg', '此房間已滿！');
            return;
        }

        const hostSocket = room.players[0];
        socket.join(roomId);
        room.players.push(socket);

        room.state = {
            [hostSocket.id]: { hp: 300, energy: 1, hand: getRandomCards(5), active: null },
            [socket.id]: { hp: 300, energy: 1, hand: getRandomCards(5), active: null }
        };
        room.turn = hostSocket.id; // 房主先手

        io.to(roomId).emit('game_start', { roomId });
        broadcastGameState(roomId);
    });

    socket.on('play_card', ({ roomId, cardIndex }) => {
        const room = rooms[roomId];
        if (!room || room.turn !== socket.id) return;

        const pState = room.state[socket.id];
        if (cardIndex < 0 || cardIndex >= pState.hand.length) return;

        const card = pState.hand.splice(cardIndex, 1)[0];
        if (card.hp > 0 && !pState.active) {
            pState.active = card;
        } else {
            pState.hand.push(card); // 若不符合部署條件則放回手牌
        }
        broadcastGameState(roomId);
    });

    socket.on('attack', ({ roomId, answerCorrect }) => {
        const room = rooms[roomId];
        if (!room || room.turn !== socket.id) return;

        const pState = room.state[socket.id];
        const opSocket = room.players.find(p => p.id !== socket.id);
        const opState = room.state[opSocket.id];

        if (!pState.active) {
            socket.emit('error_msg', '場上尚無主戰英雄可發動攻擊！');
            return;
        }

        // 答對造成 80 點傷害，答錯造成 40 點傷害
        let dmg = answerCorrect ? 80 : 40;
        opState.hp -= dmg;
        if (opState.hp < 0) opState.hp = 0;

        io.to(roomId).emit('battle_log', { 
            msg: `【${pState.active.name}】發動攻擊！歷史考題${answerCorrect ? '【答對】(暴擊 80 點)' : '【答錯】(普通 40 點)'}，造成 ${dmg} 點英魂傷害！` 
        });

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

        const nextSocket = room.players.find(p => p.id !== socket.id);
        room.turn = nextSocket.id;

        // 換手時補充能量與抽卡
        const nextState = room.state[nextSocket.id];
        nextState.energy += 1;
        if (nextState.hand.length < 7) {
            nextState.hand.push(getRandomCards(1)[0]);
        }

        io.to(roomId).emit('battle_log', { msg: `輪次交替，進入對手回合。` });
        broadcastGameState(roomId);
    });

    socket.on('disconnect', () => {
        console.log(`玩家斷線: ${socket.id}`);
        for (let roomId in rooms) {
            let room = rooms[roomId];
            if (room.players.includes(socket)) {
                room.players = room.players.filter(p => p !== socket);
                if (room.players.length === 0) {
                    delete rooms[roomId];
                } else {
                    io.to(roomId).emit('error_msg', '對手已斷線離開遊戲。');
                }
            }
        }
    });
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
    if (!room || room.players.length < 2) return;
    room.players.forEach(p => {
        const opId = room.players.find(x => x.id !== p.id).id;
        p.emit('game_state_update', {
            myState: room.state[p.id],
            opState: room.state[opId],
            isMyTurn: room.turn === p.id
        });
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`《英魂決》對戰伺服器運行於 port ${PORT}`));
