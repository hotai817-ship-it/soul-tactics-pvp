const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

function generate10QuestionsFromExcel(name, dynasty, primaryQ, primaryAns) {
    let qs = [];
    let wrongOpts1 = [
        `與${dynasty}時期歷史文獻記載完全相反`,
        `係後世民間傳說中虛構杜撰之情節`,
        `與當時典章制度及社會發展全無關聯`
    ];
    let opts1 = [primaryAns, wrongOpts1[0], wrongOpts1[1], wrongOpts1[2]].sort(() => Math.random() - 0.5);
    qs.push({
        q: primaryQ,
        opts: opts1.map((o, i) => `${['A', 'B', 'C', 'D'][i]}. ${o}`),
        correctIndex: opts1.indexOf(primaryAns)
    });

    for (let i = 2; i <= 10; i++) {
        let stdAns = `${dynasty}代歷史發展之核心常識`;
        let wOpts = [
            `與${name}之生平事蹟毫無交集`,
            `屬於後代文人附會之虛構故事`,
            `違背當時社會政治與經濟客觀規律`
        ];
        let opts = [stdAns, wOpts[0], wOpts[1], wOpts[2]].sort(() => Math.random() - 0.5);
        qs.push({
            q: `關於【${name}】(${dynasty})之歷史考驗第 ${i} 題：下列相關敘述何者最符合歷史原貌？`,
            opts: opts.map((o, idx) => `${['A', 'B', 'C', 'D'][idx]}. ${o}`),
            correctIndex: opts.indexOf(stdAns)
        });
    }
    return qs;
}

const HERO_CARDS = [
    { id: "h_0", dynasty: "秦", name: "秦始皇", type: "人物", skill: "六合一統", desc: "祖龍之威，橫掃六合", questions: generate10QuestionsFromExcel("秦始皇", "秦", "秦王政自認為「XX三皇，XX五帝」，於是把三「皇」五「帝」名稱合稱為「皇帝」", "功過三皇，德兼五帝") },
    { id: "h_1", dynasty: "秦", name: "高級軍吏俑", type: "人物", skill: "衝鋒陷陣", desc: "百戰精銳，威震沙場", questions: generate10QuestionsFromExcel("高級軍吏俑", "秦", "高級軍吏俑又俗稱為「XX俑」", "將軍俑") },
    { id: "h_2", dynasty: "西漢", name: "李廣", type: "人物", skill: "李廣難封", desc: "但使龍城飛將在", questions: generate10Questions("李廣", "西漢") },
    { id: "h_3", dynasty: "西漢", name: "霍去病", type: "人物", skill: "封狼居胥", desc: "匈奴未滅，無以家為", questions: generate10QuestionsFromExcel("霍去病", "西漢", "墓前的XXXX的石像，象徵着他的不朽功勳。", "馬踏匈奴") },
    { id: "h_4", dynasty: "西漢", name: "漢武帝", type: "人物", skill: "雄才大略", desc: "北擊匈奴，獨尊儒術", questions: generate10QuestionsFromExcel("漢武帝", "西漢", "武帝採納主父偃的建議，頒行「XXX」，規定諸侯王除以嫡長子繼承王位外...", "推恩令") },
    { id: "h_5", dynasty: "西漢", name: "漢高祖", type: "人物", skill: "知人善任", desc: "知人善任、堅韌不拔", questions: generate10QuestionsFromExcel("漢高祖", "西漢", "劉邦在秦朝滅亡後，進入咸陽時，與當地百姓XXXX，內容為「殺人者死，傷人及盜抵罪」", "約法三章") },
    { id: "h_6", dynasty: "秦", name: "趙高", type: "人物", skill: "指鹿為馬", desc: "為禍之源，沙丘之變", questions: generate10QuestionsFromExcel("趙高", "秦", "前210年，秦始皇在沙丘駕崩時，趙高與公子胡亥、丞相李斯合謀更改秦始皇遺詔...", "沙丘之變") },
    { id: "h_7", dynasty: "秦", name: "蒙恬", type: "人物", skill: "築長城防匈奴", desc: "北擊匈奴，威震邊塞", questions: generate10Questions("蒙恬", "秦朝") },
    { id: "h_8", dynasty: "西漢", name: "蕭何", type: "人物", skill: "月下追韓信", desc: "漢初三傑，運籌帷幄", questions: generate10QuestionsFromExcel("蕭何", "西漢", "蕭何曾月下追何人？", "韓信") },
    { id: "h_9", dynasty: "西楚", name: "項羽", type: "人物", skill: "破釜沉舟", desc: "西楚霸王，烏江自刎", questions: generate10QuestionsFromExcel("項羽", "西楚", "項羽在哪裏自刎而死？", "烏江") },
    { id: "h_10", dynasty: "西漢", name: "張良", type: "人物", skill: "謀聖智謀", desc: "運籌帷幄之中，決勝千里之外", questions: generate10Questions("張良", "西漢") },
    { id: "h_11", dynasty: "春秋", name: "孔子", type: "人物", skill: "至聖先師", desc: "仁義禮智信，有教無類", questions: generate10Questions("孔子", "春秋") },
    { id: "h_12", dynasty: "戰國", name: "孟子", type: "人物", skill: "亞聖浩然", desc: "民貴君輕，捨生取義", questions: generate10Questions("孟子", "戰國") },
    { id: "h_13", dynasty: "春秋", name: "齊桓公", type: "人物", skill: "九合諸侯", desc: "尊王攘夷，春秋五霸", questions: generate10Questions("齊桓公", "春秋") },
    { id: "h_14", dynasty: "唐", name: "唐太宗", type: "人物", skill: "貞觀之治", desc: "納諫如流，天可汗", questions: generate10Questions("唐太宗", "唐朝") },
    { id: "h_15", dynasty: "唐", name: "魏徵", type: "人物", skill: "犯顏直諫", desc: "以人為鏡，明得失", questions: generate10Questions("魏徵", "唐朝") },
    { id: "h_16", dynasty: "唐", name: "武則天", type: "人物", skill: "承先啟後", desc: "改周稱帝，開科拔寒", questions: generate10Questions("武則天", "唐朝") },
    { id: "h_17", dynasty: "唐", name: "唐玄宗", type: "人物", skill: "開元盛世", desc: "前期勵精，後期怠政", questions: generate10Questions("唐玄宗", "唐朝") },
    { id: "h_18", dynasty: "唐", name: "狄仁傑", type: "人物", skill: "匡扶唐室", desc: "明察秋毫，舉賢任能", questions: generate10Questions("狄仁傑", "唐朝") },
    { id: "h_19", dynasty: "唐", name: "郭子儀", type: "人物", skill: "再造唐朝", desc: "平定安史，功蓋天下", questions: generate10Questions("郭子儀", "唐朝")}
];

const SUPPORT_CARDS = [
    { id: "s_0", dynasty: "秦", name: "焚書坑儒", type: "輔助", skill: "箝制思想", desc: "輔助秦始皇/李斯", questions: generate10QuestionsFromExcel("焚書坑儒", "秦", "焚書政令下，如果有人想要學習法令，就以XX為師。", "秦吏") },
    { id: "s_1", dynasty: "秦", name: "統一度量衝", type: "輔助", skill: "車同軌", desc: "統一法制、統一民心", questions: generate10QuestionsFromExcel("統一度量衝", "秦", "秦始皇統一度量衡時，會在標準的度量衡上刻製XX，以昭示統一的標準", "銘文") },
    { id: "s_2", dynasty: "秦", name: "統一文字", type: "輔助", skill: "小篆隸書", desc: "化繁為簡，統一文字", questions: generate10QuestionsFromExcel("統一文字", "秦", "相傳，XX整理民間字體，化繁為簡，化圓為方，對小篆進行改良", "程邈") },
    { id: "s_3", dynasty: "秦", name: "萬里長城", type: "輔助", skill: "固若金湯", desc: "防禦外敵，永固邊防", questions: generate10QuestionsFromExcel("萬里長城", "秦", "秦始皇修築「萬里長城」主要是為了抵禦哪個外族？", "匈奴") },
    { id: "s_4", dynasty: "秦", name: "指鹿為馬", type: "輔助", skill: "顛倒是非", desc: "趙高胡亥，混淆黑白", questions: generate10QuestionsFromExcel("指鹿為馬", "秦", "成語「指鹿為馬」比喻什麼？", "顛倒是非、混淆黑白") },
    { id: "s_5", dynasty: "秦", name: "推行郡縣制度", type: "輔助", skill: "收歸中央", desc: "郡縣制與上計制度", questions: generate10QuestionsFromExcel("推行郡縣制度", "秦", "為了監控地方官員，秦採用「XX」制度。朝庭規定地方官員須每年向中央報告...", "上計") },
    { id: "s_6", dynasty: "秦", name: "統一貨幣", type: "輔助", skill: "半兩錢", desc: "圓形方孔，便利流通", questions: generate10QuestionsFromExcel("統一貨幣", "秦", "半兩錢在全國流通，除了方便換算和貿易，亦有助商業發展及徵納XX。", "賦稅") },
    { id: "s_7", dynasty: "秦", name: "重農輕商", type: "輔助", skill: "土地私有", desc: "確立土地自由買賣", questions: generate10QuestionsFromExcel("重農輕商", "秦", "秦始皇統一天下後，正式確立土地私有制，容許土地XXXX。", "自由買賣") },
    { id: "s_8", dynasty: "秦", name: "開鑿運河", type: "輔助", skill: "靈渠漕運", desc: "平定南越，軍糧運輸", questions: generate10QuestionsFromExcel("開鑿運河", "秦", "靈渠的開鑿解決了當時軍糧運輸的困難，促使秦軍成征服西甌，平定XX。", "南越") },
    { id: "s_9", dynasty: "秦", name: "修築道路", type: "輔助", skill: "直道馳道", desc: "軍用道路，快速調兵", questions: generate10QuestionsFromExcel("修築道路", "秦", "XX於蒙恬攻打匈奴時修築，路線直，行車快，方便快速調兵，是通往北方的軍用道路。", "直道") },
    { id: "s_10", dynasty: "秦", name: "徒木立信", type: "輔助", skill: "商鞅變法", desc: "言行一致，信守承諾", questions: generate10QuestionsFromExcel("徒木立信", "秦", "成語「徒木立信」比喻什麼？", "言行一致、信守承諾、說到做到") },
    { id: "s_11", dynasty: "西漢", name: "推恩令", type: "輔助", skill: "削弱諸侯", desc: "巧分封國，不費一兵", questions: generate10Questions("推恩令", "西漢") },
    { id: "s_12", dynasty: "西漢", name: "和親制度", type: "輔助", skill: "姻親關係", desc: "漢族公主嫁給外族", questions: generate10QuestionsFromExcel("和親制度", "西漢", "「和親政策」讓漢族公主嫁給外族，建立XX關係。", "姻親") },
    { id: "s_13", dynasty: "西漢", name: "士人政府", type: "輔助", skill: "獨尊儒術", desc: "儒生治理國家政務", questions: generate10QuestionsFromExcel("士人政府", "西漢", "士人政府內的官員大多都是XX，他們自然擁護獨尊儒術的方針。", "儒生") },
    { id: "s_14", dynasty: "西漢", name: "五經博士", type: "輔助", skill: "罷黜百家", desc: "設立五經博士傳授儒學", questions: generate10QuestionsFromExcel("五經博士", "西漢", "誰人建議漢武帝罷黜百家，獨尊儒術？", "董仲舒") },
    { id: "s_15", dynasty: "西漢", name: "輪台罪己詔", type: "輔助", skill: "反思休養", desc: "禁苛暴止擅賦力本農", questions: generate10QuestionsFromExcel("輪台罪己詔", "西漢", "公元前89年，XXX等上書漢武帝，建議在輪台戍兵以備匈奴...", "桑弘羊") },
    { id: "s_16", dynasty: "東漢", name: "黨錮之禍", type: "輔助", skill: "清議士人", desc: "士族不滿，宦官專權", questions: generate10Questions("黨錮之禍", "東漢") },
    { id: "s_17", dynasty: "東漢", name: "黃巾之亂", type: "輔助", skill: "太平道興", desc: "蒼天已死黃天當立", questions: generate10Questions("黃巾之亂", "東漢") },
    { id: "s_18", dynasty: "三國", name: "赤壁之戰", type: "輔助", skill: "三分天下", desc: "火燒連環，奠定鼎足", questions: generate10Questions("赤壁之戰", "三國") },
    { id: "s_19", 三國: "屯田制", type: "輔助", skill: "休養生息", desc: "軍國足食，兵農合一", questions: generate10Questions("屯田制", "三國") },
    { id: "s_20", dynasty: "北朝", name: "均田制", type: "輔助", skill: "授田於民", desc: "保障生計，恢復農業", questions: generate10Questions("均田制", "北朝") },
    { id: "s_21", dynasty: "北朝", name: "三長制", type: "輔助", skill: "整頓戶籍", desc: "五家為鄰，嚴密管治", questions: generate10Questions("三長制", "北朝") },
    { id: "s_22", dynasty: "北朝", name: "租調制", type: "輔助", skill: "明定稅額", desc: "減輕負擔，穩定稅收", questions: generate10Questions("租調制", "北朝") },
    { id: "s_23", dynasty: "隋", name: "三省六部制", type: "輔助", skill: "分工協作", desc: "決策行政，分權制衡", questions: generate10Questions("三省六部制", "隋唐") },
    { id: "s_24", dynasty: "隋", name: "大運河", type: "輔助", skill: "南糧北運", desc: "貫通南北，水路交通", questions: generate10Questions("大運河", "隋唐") },
    { id: "s_25", dynasty: "唐", name: "科舉制度", type: "輔助", skill: "進士明經", desc: "打破門第，選拔人才", questions: generate10Questions("科舉制度", "唐朝") },
    { id: "s_26", dynasty: "唐", name: "府兵制", type: "輔助", skill: "兵農合一", desc: "輪番宿衛，內重外輕", questions: generate10Questions("府兵制", "唐朝") },
    { id: "s_27", dynasty: "唐", name: "租庸調制", type: "輔助", skill: "納粟代役", desc: "輕徭薄賦，以民為本", questions: generate10Questions("租庸調制", "唐朝") },
    { id: "s_28", dynasty: "唐", name: "安史之亂", type: "輔助", skill: "盛極而衰", desc: "藩鎮割據，轉捩之局", questions: generate10Questions("安史之亂", "唐朝") },
    { id: "s_29", dynasty: "唐", name: "兩稅法", type: "輔助", skill: "量出為入", desc: "楊炎建議，夏秋納稅", questions: generate10Questions("兩稅法", "唐朝") }
];

function generate10Questions(cardName, dynasty) {
    let qs = [];
    for (let i = 1; i <= 10; i++) {
        let correctAns = `此乃${dynasty}時期之核心典章與重要歷史事實`;
        let wrongOpts = [
            `與${cardName}之生平與政策完全無關`,
            `係後世民間傳說中虛構杜撰的情節`,
            `違背當時社會政治與經濟發展客觀規律`
        ];
        let opts = [correctAns, wrongOpts[0], wrongOpts[1], wrongOpts[2]].sort(() => Math.random() - 0.5);
        qs.push({
            q: `關於【${cardName}】(${dynasty})之歷史考驗第 ${i} 題：下列相關敘述何者最符合歷史原貌？`,
            opts: opts.map((o, idx) => `${['A', 'B', 'C', 'D'][idx]}. ${o}`),
            correctIndex: opts.indexOf(correctAns)
        });
    }
    return qs;
}

const ALL_CARDS = [...HERO_CARDS, ...SUPPORT_CARDS];
let rooms = {};

io.on('connection', (socket) => {
    socket.on('create_room', (roomId) => {
        if (!roomId || roomId.trim() === "") { socket.emit('error_msg', '請輸入有效的房間號碼！'); return; }
        roomId = roomId.trim();
        if (rooms[roomId]) { socket.emit('error_msg', '此房間號碼已被使用！'); return; }
        socket.join(roomId);
        rooms[roomId] = { players: [socket], state: {}, turn: null };
        socket.emit('room_created', roomId);
    });

    socket.on('join_room', (roomId) => {
        if (!roomId || roomId.trim() === "") { socket.emit('error_msg', '請輸入有效的房間號碼！'); return; }
        roomId = roomId.trim();
        const room = rooms[roomId];
        if (!room) { socket.emit('error_msg', '找不到此房間！'); return; }
        if (room.players.length >= 2) { socket.emit('error_msg', '此房間人數已滿！'); return; }

        const hostSocket = room.players[0];
        socket.join(roomId);
        room.players.push(socket);

        // 新增 hasPlayedCard 狀態，管控每回合只能出一次牌
        room.state = {
            [hostSocket.id]: { hp: 300, hand: getRandomCards(5), active: null, supportArea: [], hasPlayedCard: false },
            [socket.id]: { hp: 300, hand: getRandomCards(5), active: null, supportArea: [], hasPlayedCard: false }
        };
        room.turn = hostSocket.id;

        io.to(roomId).emit('game_start', { roomId });
        broadcastGameState(roomId);
    });

    socket.on('get_card_question', ({ roomId, cardIndex }) => {
        const room = rooms[roomId];
        if (!room || room.turn !== socket.id) return;
        const pState = room.state[socket.id];
        
        // 防禦：如果這回合已經出過牌了，不准再抽題出牌
        if (pState.hasPlayedCard) {
            socket.emit('error_msg', '一回合只能點選部署一張卡片！請發動攻擊或結束回合。');
            return;
        }
        
        if (cardIndex < 0 || cardIndex >= pState.hand.length) return;

        const card = pState.hand[cardIndex];
        const randomQ = card.questions[Math.floor(Math.random() * card.questions.length)];

        socket.emit('show_card_question', {
            cardIndex,
            qData: { cardName: card.name, q: randomQ.q, opts: randomQ.opts, correctIndex: randomQ.correctIndex }
        });
    });

    socket.on('play_card_with_answer', ({ roomId, cardIndex, answerCorrect }) => {
        const room = rooms[roomId];
        if (!room || room.turn !== socket.id) return;
        const pState = room.state[socket.id];
        
        if (pState.hasPlayedCard || cardIndex < 0 || cardIndex >= pState.hand.length) return;

        // 消耗卡牌並標記為已出牌
        const card = pState.hand.splice(cardIndex, 1)[0];
        pState.hasPlayedCard = true; 
        
        const opSocket = room.players.find(p => p.id !== socket.id);
        const opState = room.state[opSocket.id];

        if (answerCorrect) {
            if (card.type === "人物") {
                // 修正：舊武將直接丟棄，不再塞回手牌導致數量暴增
                pState.active = card; 
            } else if (card.type === "輔助") {
                pState.supportArea.push(card);
                opState.hp -= 20;
                if (opState.hp < 0) opState.hp = 0;
            }
            io.to(roomId).emit('battle_log', { msg: `【${card.name}】歷史考驗【答對】！成功部署並發動效果！` });
        } else {
            io.to(roomId).emit('battle_log', { msg: `【${card.name}】歷史考驗【答錯】！卡片耗損失效！` });
        }

        if (opState.hp <= 0) {
            io.to(roomId).emit('game_over', { winner: socket.id });
            delete rooms[roomId];
            return;
        }

        // 修正：出牌後【保留在玩家回合】，讓玩家可以點主將發動攻擊
        broadcastGameState(roomId);
    });

    socket.on('get_attack_question', ({ roomId }) => {
        const room = rooms[roomId];
        if (!room || room.turn !== socket.id) return;
        
        const pState = room.state[socket.id];
        if (!pState.active) { socket.emit('error_msg', '請先部署歷史人物才能發動攻擊！'); return; }

        const questions = [
            { q: "秦王政自認為「XX三皇，XX五帝」，於是把三「皇」五「帝」名稱合稱為「皇帝」。請填空：", opts: ["A. 功過三皇，德兼五帝", "B. 德高三皇，功過五帝", "C. 德兼三皇，功過五帝", "D. 功德三皇五帝"], correctIndex: 0 },
            { q: "漢武帝採納主父偃的建議，頒行哪一項法令削弱諸侯王勢力？", opts: ["A. 削藩令", "B. 推恩令", "C. 漢律令", "D. 推恩法"], correctIndex: 1 },
            { q: "唐太宗在位期間政治清明，史稱為什麼？", opts: ["A. 開元之治", "B. 貞觀之治", "C. 文景之治", "D. 仁宣之治"], correctIndex: 1 }
        ];
        let q = questions[Math.floor(Math.random() * questions.length)];
        socket.emit('show_attack_question', { qData: q });
    });

    socket.on('attack', ({ roomId, answerCorrect }) => {
        const room = rooms[roomId];
        if (!room || room.turn !== socket.id) return;
        const pState = room.state[socket.id];
        const opSocket = room.players.find(p => p.id !== socket.id);
        const opState = room.state[opSocket.id];

        if (!pState.active) return;

        let dmg = answerCorrect ? 80 : 40;
        opState.hp -= dmg;
        if (opState.hp < 0) opState.hp = 0;

        io.to(roomId).emit('battle_log', { msg: `【${pState.active.name}】攻擊！答題${answerCorrect ? '【答對】(80傷)' : '【答錯】(40傷)'}` });

        if (opState.hp <= 0) {
            io.to(roomId).emit('game_over', { winner: socket.id });
            delete rooms[roomId];
        } else {
            // 攻擊完畢，正式切換回合
            room.turn = opSocket.id;
            pState.hasPlayedCard = false; // 重置狀態
            room.state[opSocket.id].hasPlayedCard = false; // 重置對手狀態
            room.state[opSocket.id].hand.push(...getRandomCards(2)); // 給對手補2張牌
            broadcastGameState(roomId);
        }
    });

    socket.on('end_turn', (roomId) => {
        const room = rooms[roomId];
        if (!room || room.turn !== socket.id) return;
        
        const pState = room.state[socket.id];
        pState.hasPlayedCard = false; // 重置狀態

        const nextSocket = room.players.find(p => p.id !== socket.id);
        room.turn = nextSocket.id;
        room.state[nextSocket.id].hasPlayedCard = false;
        room.state[nextSocket.id].hand.push(...getRandomCards(2));
        broadcastGameState(roomId);
    });

    socket.on('disconnect', () => {
        for (let roomId in rooms) {
            if (rooms[roomId].players.includes(socket)) {
                delete rooms[roomId];
                io.to(roomId)?.emit('error_msg', '對手已斷線。');
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
server.listen(PORT, () => console.log(`《英魂決》伺服器運行於 port ${PORT}`));
