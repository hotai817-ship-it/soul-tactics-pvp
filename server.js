const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

const ALL_CARDS = [
  { id: "card_0", dynasty: "秦", name: "秦始皇", type: "人物", skill: "六合一統", desc: "祖龍之威，橫掃六合" },
  { id: "card_1", dynasty: "秦", name: "高級軍吏俑", type: "人物", skill: "衝鋒陷陣", desc: "百戰精銳，威震沙場" },
  { id: "card_2", dynasty: "秦", name: "萬里長城", type: "輔助", skill: "固若金湯", desc: "防禦外敵，永固邊防" },
  { id: "card_3", dynasty: "西漢", name: "李廣", type: "人物", skill: "飛將軍", desc: "但使龍城飛将在，不教胡馬度陰山" },
  { id: "card_4", dynasty: "西漢", name: "霍去病", type: "人物", skill: "封狼居胥", desc: "匈奴未滅，無以家為" },
  { id: "card_5", dynasty: "西漢", name: "推恩令", type: "輔助", skill: "削弱諸侯", desc: "巧分封國，不費一兵一卒" },
  { id: "card_6", dynasty: "唐", name: "唐太宗", type: "人物", skill: "貞觀之治", desc: "以銅為鏡，可以正衣冠" },
  { id: "card_7", dynasty: "唐", name: "玄奘法師", type: "人物", skill: "西行取經", desc: "歷經九九藏真經" }
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
        rooms[roomId] = { players: [socket], state: {}, turn: null };
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
            [hostSocket.id]: { hp: 300, hand: getRandomCards(5), active: null, supportArea: [] },
            [socket.id]: { hp: 300, hand: getRandomCards(5), active: null, supportArea: [] }
        };
        room.turn = hostSocket.id;

        io.to(roomId).emit('game_start', { roomId });
        broadcastGameState(roomId);
    });

    // 玩家部署卡牌（人物放到主戰陣，輔助卡放到支援區）
    socket.on('play_card', ({ roomId, cardIndex }) => {
        const room = rooms[roomId];
        if (!room || room.turn !== socket.id) return;

        const pState = room.state[socket.id];
        if (cardIndex < 0 || cardIndex >= pState.hand.length) return;

        const card = pState.hand.splice(cardIndex, 1)[0];
        if (card.type === "人物") {
            if (!pState.active) {
                pState.active = card;
            } else {
                // 若已有主戰人物，可替換或放回手牌
                pState.hand.push(pState.active);
                pState.active = card;
            }
        } else if (card.type === "輔助") {
            pState.supportArea.push(card);
        }
        broadcastGameState(roomId);
    });

    // 答題完成後發動攻擊，攻擊完成後回合才結束並換人
    socket.on('attack', ({ roomId, answerCorrect }) => {
        const room = rooms[roomId];
        if (!room || room.turn !== socket.id) return;

        const pState = room.state[socket.id];
        const opSocket = room.players.find(p => p.id !== socket.id);
        const opState = room.state[opSocket.id];

        if (!pState.active) {
            socket.emit('error_msg', '請先選擇歷史人物放在戰陣上才能發動攻擊！');
            return;
        }

        let dmg = answerCorrect ? 80 : 40;
        opState.hp -= dmg;
        if (opState.hp < 0) opState.hp = 0;

        io.to(roomId).emit('battle_log', { 
            msg: `【${pState.active.name}】發動攻擊！歷史考題${answerCorrect ? '【答對】(暴擊 80 點)' : '【答錯】(普通 40 點)'}，對手受到 ${dmg} 點傷害！` 
        });

        if (opState.hp <= 0) {
            io.to(roomId).emit('game_over', { winner: socket.id });
            delete rooms[roomId];
        } else {
            // 攻擊完成，回合結束並切換給對手，隨機增發 2 張卡至下個玩家的卡庫
            room.turn = opSocket.id;
            const nextState = room.state[opSocket.id];
            const addedCards = getRandomCards(2);
            nextState.hand.push(...addedCards);
            io.to(roomId).emit('battle_log', { msg: `回合結束，對手獲得 2 張補給卡牌。` });
            broadcastGameState(roomId);
        }
    });

    // 主動結束回合（若不想攻擊或已攻擊完畢）
    socket.on('end_turn', (roomId) => {
        const room = rooms[roomId];
        if (!room || room.turn !== socket.id) return;

        const nextSocket = room.players.find(p => p.id !== socket.id);
        room.turn = nextSocket.id;

        // 隨機增發 2 張卡至手牌
        const nextState = room.state[nextSocket.id];
        nextState.hand.push(...getRandomCards(2));

        io.to(roomId).emit('battle_log', { msg: `玩家選擇結束回合，對手獲得 2 張補給卡牌。` });
        broadcastGameState(roomId);
    });

    socket.on('disconnect', () => {
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
