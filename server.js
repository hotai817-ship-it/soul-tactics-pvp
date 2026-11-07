const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

// 生成每張卡10條題目的輔助函式
function generate10Questions(topic, cardName) {
    let qs = [];
    for (let i = 1; i <= 10; i++) {
        qs.push({
            q: `關於【${cardName}】(${topic})之歷史考驗第 ${i} 題：下列敘述何者正確？`,
            opts: [
                `A. 此乃該時期之核心典章與重要政績表現`,
                `B. 此為無關緊要之民間傳說`,
                `C. 此乃後世文人杜撰之虛構情節`
            ],
            correctIndex: 0
        });
    }
    return qs;
}

// 20 位歷史人物卡
const HERO_CARDS = [
    { id: "h_0", dynasty: "秦", name: "秦始皇", type: "人物", skill: "六合一統", desc: "祖龍之威，橫掃六合", questions: generate10Questions("秦朝統一", "秦始皇") },
    { id: "h_1", dynasty: "秦", name: "李斯", type: "人物", skill: "書同文", desc: "法家智囊，統整度量衡", questions: generate10Questions("秦代制度", "李斯") },
    { id: "h_2", dynasty: "西漢", name: "漢武帝", type: "人物", skill: "雄才大略", desc: "北擊匈奴，獨尊儒術", questions: generate10Questions("西漢盛世", "漢武帝") },
    { id: "h_3", dynasty: "西漢", name: "張騫", type: "人物", skill: "鑿空西域", desc: "打通絲路，連結歐亞", questions: generate10Questions("西域交往", "張騫") },
    { id: "h_4", dynasty: "西漢", name: "霍去病", type: "人物", skill: "封狼居胥", desc: "匈奴未滅，無以家為", questions: generate10Questions("漢匈戰爭", "霍去病") },
    { id: "h_5", dynasty: "西漢", name: "司馬遷", type: "人物", skill: "史記千秋", desc: "究天人之際，成一家之言", questions: generate10Questions("史學巨著", "司馬遷") },
    { id: "h_6", dynasty: "東漢", name: "班超", type: "人物", skill: "投筆從戎", desc: "經營西域，威震遠邦", questions: generate10Questions("東漢經略", "班超") },
    { id: "h_7", dynasty: "東漢", name: "蔡倫", type: "人物", skill: "造紙改良", desc: "改良造紙，文化傳揚", questions: generate10Questions("古代科技", "蔡倫") },
    { id: "h_8", dynasty: "三國", name: "諸葛亮", type: "人物", skill: "隆中對策", desc: "鞠躬盡瘁，死而後已", questions: generate10Questions("三國政略", "諸葛亮") },
    { id: "h_9", dynasty: "三國", name: "曹操", type: "人物", skill: "屯田霸業", desc: "挾天子以令諸侯", questions: generate10Questions("曹魏基業", "曹操") },
    { id: "h_10", dynasty: "北朝", name: "北魏孝文帝", type: "人物", skill: "全面漢化", desc: "遷都洛陽，移風易俗", questions: generate10Questions("北魏漢化", "北魏孝文帝") },
    { id: "h_11", dynasty: "北朝", name: "馮太后", type: "人物", skill: "均田定祿", desc: "女主臨朝，推行改革", questions: generate10Questions("北朝改革", "馮太后") },
    { id: "h_12", dynasty: "隋", name: "隋文帝", type: "人物", skill: "開皇之治", desc: "結束分裂，創立隋制", questions: generate10Questions("隋代統一", "隋文帝") },
    { id: "h_13", dynasty: "隋", name: "高熲", type: "人物", skill: "開皇律令", desc: "佐助文帝，參贊機務", questions: generate10Questions("隋代法制", "高熲") },
    { id: "h_14", dynasty: "唐", name: "唐太宗", type: "人物", skill: "貞觀之治", desc: "納諫如流，天可汗", questions: generate10Questions("唐代貞觀", "唐太宗") },
    { id: "h_15", dynasty: "唐", name: "魏徵", type: "人物", skill: "犯顏直諫", desc: "以人為鏡，明得失", questions: generate10Questions("諫諍風氣", "魏徵") },
    { id: "h_16", dynasty: "唐", name: "武則天", type: "人物", skill: "承先啟後", desc: "改周稱帝，開科拔寒", questions: generate10Questions("武周政治", "武則天") },
    { id: "h_17", dynasty: "唐", name: "唐玄宗", type: "人物", skill: "開元盛世", desc: "前期勵精，後期怠政", questions: generate10Questions("盛唐興衰", "唐玄宗") },
    { id: "h_18", dynasty: "唐", name: "狄仁傑", type: "人物", skill: "匡扶唐室", desc: "明察秋毫，舉賢任能", questions: generate10Questions("唐代吏治", "狄仁傑") },
    { id: "h_19", dynasty: "唐", name: "郭子儀", type: "人物", skill: "再造唐朝", desc: "平定安史，功蓋天下", questions: generate10Questions("安史平亂", "郭子儀")}
];

// 30 張輔助卡
const SUPPORT_CARDS = [
    { id: "s_0", dynasty: "秦", name: "萬里長城", type: "輔助", skill: "固若金湯", desc: "防禦外敵，永固邊防", questions: generate10Questions("秦代防禦", "萬里長城") },
    { id: "s_1", dynasty: "秦", name: "統一度量衡", type: "輔助", skill: "車同軌", desc: "規範制度，經濟聯結", questions: generate10Questions("秦代經濟", "統一度量衡") },
    { id: "s_2", dynasty: "西漢", name: "推恩令", type: "輔助", skill: "削弱諸侯", desc: "巧分封國，不費一兵", questions: generate10Questions("漢代政治", "推恩令") },
    { id: "s_3", dynasty: "西漢", name: "鹽鐵專賣", type: "輔助", skill: "國家財政", desc: "增加國庫，充實財源", questions: generate10Questions("西漢財經", "鹽鐵專賣") },
    { id: "s_4", dynasty: "西漢", name: "太學制度", type: "輔助", skill: "尊師重道", desc: "興辦官學，培育儒生", questions: generate10Questions("漢代文教", "太學制度") },
    { id: "s_5", dynasty: "西漢", name: "刺史制度", type: "輔助", skill: "監察地方", desc: "加強中央對地方掌控", questions: generate10Questions("西漢監察", "刺史制度") },
    { id: "s_6", dynasty: "東漢", name: "黨錮之禍", type: "輔助", skill: "清議士人", desc: "士族不滿，宦官專權", questions: generate10Questions("東漢黨錮", "黨錮之禍") },
    { id: "s_7", dynasty: "東漢", name: "黃巾之亂", type: "輔助", skill: "民變四起", desc: "蒼天已死，太平道興", questions: generate10Questions("東漢末年", "黃巾之亂") },
    { id: "s_8", dynasty: "三國", name: "赤壁之戰", type: "輔助", skill: "三分天下", desc: "火燒連環，奠定鼎足", questions: generate10Questions("三國戰史", "赤壁之戰") },
    { id: "s_9", dynasty: "三國", name: "屯田制", type: "輔助", skill: "休養生息", desc: "軍國足食，兵農合一", questions: generate10Questions("三國經濟", "屯田制") },
    { id: "s_10", dynasty: "北朝", name: "均田制", type: "輔助", skill: "授田於民", desc: "保障生計，恢復農業", questions: generate10Questions("北朝經濟", "均田制") },
    { id: "s_11", dynasty: "北朝", name: "三長制", type: "輔助", skill: "整頓戶籍", desc: "五家為鄰，嚴密管治", questions: generate10Questions("北朝制度", "三長制") },
    { id: "s_12", dynasty: "北朝", name: "租調制", type: "輔助", skill: "明定稅額", desc: "減輕負擔，穩定稅收", questions: generate10Questions("北朝賦稅", "租調制") },
    { id: "s_13", dynasty: "隋", name: "三省六部制", type: "輔助", skill: "分工協作", desc: "決策行政，分權制衡", questions: generate10Questions("隋唐政制", "三省六部制") },
    { id: "s_14", dynasty: "隋", name: "大運河", type: "輔助", skill: "南糧北運", desc: "貫通南北，水路交通", questions: generate10Questions("隋代水利", "大運河") },
    { id: "s_15", dynasty: "隋", name: "義倉官倉", type: "輔助", skill: "積穀防饑", desc: "儲糧備荒，渡過天災", questions: generate10Questions("隋代倉儲", "義倉官倉") },
    { id: "s_16", dynasty: "隋", name: "大索貌閱", type: "輔助", skill: "清查隱戶", desc: "核實身分，增加賦稅", questions: generate10Questions("隋代戶籍", "大索貌閱") },
    { id: "s_17", dynasty: "唐", name: "政事堂", type: "輔助", skill: "三省合議", desc: "提高效率，真正宰相", questions: generate10Questions("唐代政制", "政事堂") },
    { id: "s_18", dynasty: "唐", name: "科舉制度", type: "輔助", skill: "進士明經", desc: "打破門第，選拔人才", questions: generate10Questions("唐代科舉", "科舉制度") },
    { id: "s_19", dynasty: "唐", name: "府兵制", type: "輔助", skill: "兵農合一", desc: "輪番宿衛，內重外輕", questions: generate10Questions("唐代兵制", "府兵制") },
    { id: "s_20", dynasty: "唐", name: "租庸調制", type: "輔助", skill: "納粟代役", desc: "輕徭薄賦，以民為本", questions: generate10Questions("唐代稅制", "租庸調制") },
    { id: "s_21", dynasty: "唐", name: "文成公主入藏", type: "輔助", skill: "漢藏和親", desc: "傳播文化，民族友好", questions: generate10Questions("唐代外交", "文成公主入藏") },
    { id: "s_22", dynasty: "唐", name: "天可汗", type: "輔助", skill: "四夷賓服", desc: "威震西域，萬邦來朝", questions: generate10Questions("盛唐聲威", "天可汗") },
    { id: "s_23", dynasty: "唐", name: "募兵制", type: "輔助", skill: "長征健兒", desc: "兵農分離，防衛邊疆", questions: generate10Questions("唐代兵改", "募兵制") },
    { id: "s_24", dynasty: "唐", name: "十大兵鎮", type: "輔助", skill: "節度使權", desc: "外重內輕，埋下隱患", questions: generate10Questions("唐代軍鎮", "十大兵鎮") },
    { id: "s_25", dynasty: "唐", name: "安史之亂", type: "輔助", skill: "盛極而衰", desc: "藩鎮割據，轉捩之局", questions: generate10Questions("安史之亂", "安史之亂") },
    { id: "s_26", dynasty: "唐", name: "兩稅法", type: "輔助", skill: "量出為入", desc: "楊炎建議，夏秋納稅", questions: generate10Questions("唐代財經", "兩稅法") },
    { id: "s_27", dynasty: "唐", name: "元和中興", type: "輔助", skill: "討伐藩鎮", desc: "憲宗勵政，威望稍振", questions: generate10Questions("唐代中興", "元和中興") },
    { id: "s_28", dynasty: "唐", name: "甘露之變", type: "輔助", skill: "宦官專權", desc: "朝臣謀誅，宦官操柄", questions: generate10Questions("宦官之禍", "甘露之變") },
    { id: "s_29", dynasty: "唐", name: "黃巢之亂", type: "輔助", skill: "民變瓦解", desc: "戰火遍野，唐室將亡", questions: generate10Questions("唐末民變", "黃巢之亂") }
];

const ALL_CARDS = [...HERO_CARDS, ...SUPPORT_CARDS];

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
            socket.emit('error_msg', '找不到此房間，請確認房號是否正確！');
            return;
        }
        if (room.players.length >= 2) {
            socket.emit('error_msg', '此房間人數已滿！');
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

    // 玩家點選手牌時，隨機抽該張卡的 1 條題目
    socket.on('get_card_question', ({ roomId, cardIndex }) => {
        const room = rooms[roomId];
        if (!room || room.turn !== socket.id) return;

        const pState = room.state[socket.id];
        if (cardIndex < 0 || cardIndex >= pState.hand.length) return;

        const card = pState.hand[cardIndex];
        const randomQ = card.questions[Math.floor(Math.random() * card.questions.length)];

        socket.emit('show_card_question', {
            cardIndex,
            qData: {
                cardName: card.name,
                q: randomQ.q,
                opts: randomQ.opts,
                correctIndex: randomQ.correctIndex
            }
        });
    });

    // 答題後處理出牌邏輯（每張卡使用一個回合，答對成功部署，答錯則消耗回合但未能完全發揮或直接送入墓地）
    socket.on('play_card_with_answer', ({ roomId, cardIndex, answerCorrect }) => {
        const room = rooms[roomId];
        if (!room || room.turn !== socket.id) return;

        const pState = room.state[socket.id];
        if (cardIndex < 0 || cardIndex >= pState.hand.length) return;

        const card = pState.hand.splice(cardIndex, 1)[0];
        const opSocket = room.players.find(p => p.id !== socket.id);
        const opState = room.state[opSocket.id];

        if (answerCorrect) {
            if (card.type === "人物") {
                if (pState.active) {
                    pState.hand.push(pState.active);
                }
                pState.active = card;
            } else if (card.type === "輔助") {
                pState.supportArea.push(card);
                // 輔助卡答對時額外對對手造成 20 點戰術傷害
                opState.hp -= 20;
                if (opState.hp < 0) opState.hp = 0;
            }
            io.to(roomId).emit('battle_log', { 
                msg: `【${socket.id === room.players[0].id ? '玩家1' : '玩家2'}】打出【${card.name}】歷史考驗【答對】！成功部署並激發戰技！` 
            });
        } else {
            io.to(roomId).emit('battle_log', { 
                msg: `【${socket.id === room.players[0].id ? '玩家1' : '玩家2'}】打出【${card.name}】歷史考驗【答錯】！卡片耗損失效！` 
            });
        }

        if (opState.hp <= 0) {
            io.to(roomId).emit('game_over', { winner: socket.id });
            delete rooms[roomId];
            return;
        }

        // 結束出牌回合，換給對手並補 2 張牌
        room.turn = opSocket.id;
        const nextState = room.state[opSocket.id];
        nextState.hand.push(...getRandomCards(2));
        io.to(roomId).emit('battle_log', { msg: `回合結束，對手獲得 2 張補給卡牌。` });
        broadcastGameState(roomId);
    });

    socket.on('attack', ({ roomId, answerCorrect }) => {
        const room = rooms[roomId];
        if (!room || room.turn !== socket.id) return;

        const pState = room.state[socket.id];
        const opSocket = room.players.find(p => p.id !== socket.id);
        const opState = room.state[opSocket.id];

        if (!pState.active) {
            socket.emit('error_msg', '請先部署歷史人物才能發動攻擊！');
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
            room.turn = opSocket.id;
            const nextState = room.state[opSocket.id];
            nextState.hand.push(...getRandomCards(2));
            io.to(roomId).emit('battle_log', { msg: `攻擊完成，回合結束。對手獲得 2 張補給卡牌。` });
            broadcastGameState(roomId);
        }
    });

    socket.on('end_turn', (roomId) => {
        const room = rooms[roomId];
        if (!room || room.turn !== socket.id) return;

        const nextSocket = room.players.find(p => p.id !== socket.id);
        room.turn = nextSocket.id;

        const nextState = room.state[nextSocket.id];
        nextState.hand.push(...getRandomCards(2));

        io.to(roomId).emit('battle_log', { msg: `玩家結束回合，對手獲得 2 張補給卡牌。` });
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
