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

// 1. 歷史人物卡片陣列
const HERO_CARDS = [
    { id: "h_0", dynasty: "秦", name: "秦始皇", type: "人物", skill: "六合一統", desc: "祖龍之威，橫掃六合" },
    { id: "h_1", dynasty: "秦", name: "高級軍吏俑", type: "人物", skill: "衝鋒陷陣", desc: "百戰精銳，威震沙場" },
    { id: "h_2", dynasty: "西漢", name: "李廣", type: "人物", skill: "李廣難封", desc: "但使龍城飛將在" },
    { id: "h_3", dynasty: "西漢", name: "霍去病", type: "人物", skill: "封狼居胥", desc: "匈奴未滅，無以家為" },
    { id: "h_4", dynasty: "西漢", name: "漢武帝", type: "人物", skill: "雄才大略", desc: "北擊匈奴，獨尊儒術" },
    { id: "h_5", dynasty: "西漢", name: "漢高祖", type: "人物", skill: "知人善任", desc: "知人善任、堅韌不拔" },
    { id: "h_6", dynasty: "秦", name: "趙高", type: "人物", skill: "指鹿為馬", desc: "為禍之源，沙丘之變" },
    { id: "h_7", dynasty: "秦", name: "蒙恬", type: "人物", skill: "築長城防匈奴", desc: "北擊匈奴，威震邊塞" },
    { id: "h_8", dynasty: "西漢", name: "蕭何", type: "人物", skill: "月下追韓信", desc: "漢初三傑，運籌帷幄" },
    { id: "h_9", dynasty: "西楚", name: "項羽", type: "人物", skill: "破釜沉舟", desc: "西楚霸王，烏江自刎" },
    { id: "h_10", dynasty: "西漢", name: "張良", type: "人物", skill: "謀聖智謀", desc: "運籌帷幄之中，決勝千里之外" },
    { id: "h_11", dynasty: "春秋", name: "孔子", type: "人物", skill: "至聖先師", desc: "仁義禮智信，有教無類" },
    { id: "h_12", dynasty: "戰國", name: "孟子", type: "人物", skill: "亞聖浩然", desc: "民貴君輕，捨生取義" },
    { id: "h_13", dynasty: "春秋", name: "齊桓公", type: "人物", skill: "九合諸侯", desc: "尊王攘夷，春秋五霸" },
    { id: "h_14", dynasty: "唐", name: "唐太宗", type: "人物", skill: "貞觀之治", desc: "納諫如流，天可汗" },
    { id: "h_15", dynasty: "唐", name: "魏徵", type: "人物", skill: "犯顏直諫", desc: "以人為鏡，明得失" },
    { id: "h_16", dynasty: "唐", name: "武則天", type: "人物", skill: "承先啟後", desc: "改周稱帝，開科拔寒" },
    { id: "h_17", dynasty: "唐", name: "唐玄宗", type: "人物", skill: "開元盛世", desc: "前期勵精，後期怠政" },
    { id: "h_18", dynasty: "唐", name: "狄仁傑", type: "人物", skill: "匡扶唐室", desc: "明察秋毫，舉賢任能" },
    { id: "h_19", dynasty: "唐", name: "郭子儀", type: "人物", skill: "再造唐朝", desc: "平定安史，功蓋天下" }
];

// 2. 輔助卡片陣列
const SUPPORT_CARDS = [
    { id: "s_0", dynasty: "秦", name: "焚書坑儒", type: "輔助", skill: "箝制思想", desc: "對手扣除 25 點生命" },
    { id: "s_1", dynasty: "秦", name: "統一度量衝", type: "輔助", skill: "車同軌", desc: "高級防禦：恢復 30 點生命" },
    { id: "s_2", dynasty: "秦", name: "統一文字", type: "輔助", skill: "小篆隸書", desc: "一般策略：恢復 20 點生命" },
    { id: "s_3", dynasty: "秦", name: "萬里長城", type: "輔助", skill: "固若金湯", desc: "高級防禦：恢復 30 點生命" },
    { id: "s_4", dynasty: "秦", name: "指鹿為馬", type: "輔助", skill: "顛倒是非", desc: "對手扣除 25 點生命" },
    { id: "s_5", dynasty: "秦", name: "推行郡縣制度", type: "輔助", skill: "收歸中央", desc: "其他策略：恢復 25 點生命" },
    { id: "s_6", dynasty: "秦", name: "統一貨幣", type: "輔助", skill: "半兩錢", desc: "一般策略：恢復 20 點生命" },
    { id: "s_7", dynasty: "秦", name: "重農輕商", type: "輔助", skill: "土地私有", desc: "其他策略：恢復 25 點生命" },
    { id: "s_8", dynasty: "秦", name: "開鑿運河", type: "輔助", skill: "靈渠漕運", desc: "一般策略：恢復 20 點生命" },
    { id: "s_9", dynasty: "秦", name: "修築道路", type: "輔助", skill: "直道馳道", desc: "一般策略：恢復 20 點生命" },
    { id: "s_10", dynasty: "秦", name: "徒木立信", type: "輔助", skill: "商鞅變法", desc: "高級防禦：恢復 30 點生命" },
    { id: "s_11", dynasty: "西漢", name: "推恩令", type: "輔助", skill: "削弱諸侯", desc: "其他策略：恢復 25 點生命" },
    { id: "s_12", dynasty: "西漢", name: "和親制度", type: "輔助", skill: "姻親關係", desc: "高級防禦：恢復 30 點生命" },
    { id: "s_13", dynasty: "西漢", name: "士人政府", type: "輔助", skill: "獨尊儒術", desc: "其他策略：恢復 25 點生命" },
    { id: "s_14", dynasty: "西漢", name: "五經博士", type: "輔助", skill: "罷黜百家", desc: "一般策略：恢復 20 點生命" },
    { id: "s_15", dynasty: "西漢", name: "輪台罪己詔", type: "輔助", skill: "反思休養", desc: "大幅恢復：恢復 40 點生命" },
    { id: "s_16", dynasty: "東漢", name: "黨錮之禍", type: "輔助", skill: "清議士人", desc: "策略生效：恢復 15 點生命" },
    { id: "s_17", dynasty: "東漢", name: "黃巾之亂", type: "輔助", skill: "太平道興", desc: "對手扣除 25 點生命" },
    { id: "s_18", dynasty: "三國", name: "赤壁之戰", type: "輔助", skill: "三分天下", desc: "對手扣除 25 點生命" },
    { id: "s_19", dynasty: "三國", name: "屯田制", type: "輔助", skill: "休養生息", desc: "高級防禦：恢復 30 點生命" },
    { id: "s_20", dynasty: "北朝", name: "均田制", type: "輔助", skill: "授田於民", desc: "高級防禦：恢復 30 點生命" },
    { id: "s_21", dynasty: "北朝", name: "三長制", type: "輔助", skill: "整頓戶籍", desc: "一般策略：恢復 20 點生命" },
    { id: "s_22", dynasty: "北朝", name: "租調制", type: "輔助", skill: "明定稅額", desc: "一般策略：恢復 20 點生命" },
    { id: "s_23", dynasty: "隋", name: "三省六部制", type: "輔助", skill: "分工協作", desc: "高級防禦：恢復 30 點生命" },
    { id: "s_24", dynasty: "隋", name: "大運河", type: "輔助", skill: "南糧北運", desc: "大幅恢復：恢復 35 點生命" },
    { id: "s_25", dynasty: "唐", name: "科舉制度", type: "輔助", skill: "進士明經", desc: "高級防禦：恢復 30 點生命" },
    { id: "s_26", dynasty: "唐", name: "府兵制", type: "輔助", skill: "兵農合一", desc: "其他策略：恢復 25 點生命" },
    { id: "s_27", dynasty: "唐", name: "租庸調制", type: "輔助", skill: "納粟代役", desc: "其他策略：恢復 25 點生命" },
    { id: "s_28", dynasty: "唐", name: "安史之亂", type: "輔助", skill: "盛極而衰", desc: "對手扣除 25 點生命" },
    { id: "s_29", dynasty: "唐", name: "兩稅法", type: "輔助", skill: "量出為入", desc: "其他策略：恢復 25 點生命" }
];

// 3. 題庫 (僅保留攻擊戰技用)
const CARD_QUESTIONS_DB = {
    "秦始皇": [
        { q: "秦王政滅六國統一天下後，認為自己「德兼三皇，功過五帝」，因此創立了什麼稱號？", opts: ["A. 天子", "B. 皇帝", "C. 霸王", "D. 單于"], correctIndex: 1 },
        { q: "秦始皇為了加強中央集權，在地方上廢除了西周以來的分封制，全面推行什麼制度？", opts: ["A. 郡縣制", "B. 行省制", "C. 察舉制", "D. 三省六部制"], correctIndex: 0 }
    ],
    "高級軍吏俑": [
        { q: "在秦始皇陵兵馬俑中，級別最高、數量最少，俗稱為「將軍俑」的是哪一種俑？", opts: ["A. 跪射俑", "B. 高級軍吏俑", "C. 騎兵俑", "D. 武士俑"], correctIndex: 1 }
    ],
    "李廣": [
        { q: "漢朝名將李廣以英勇善戰著稱，匈奴人對他十分敬畏，稱他為什麼？", opts: ["A. 飛將軍", "B. 冠軍侯", "C. 戰神", "D. 天可汗"], correctIndex: 0 }
    ],
    "霍去病": [
        { q: "西漢名將霍去病曾率軍深入漠北，大破匈奴，並在何處舉行祭天大典，史稱「封狼居胥」？", opts: ["A. 泰山", "B. 祁連山", "C. 狼居胥山", "D. 陰山"], correctIndex: 2 }
    ],
    "漢武帝": [
        { q: "漢武帝採納了董仲舒的建議，實施了哪一項影響中國兩千多年的文化政策？", opts: ["A. 焚書坑儒", "B. 罷黜百家，獨尊儒術", "C. 崇尚黃老", "D. 提倡佛法"], correctIndex: 1 }
    ],
    "漢高祖": [
        { q: "劉邦率軍攻入咸陽後，廢除秦朝苛法，與關中百姓訂立了什麼約定？", opts: ["A. 約法三章", "B. 削藩策", "C. 輕徭薄賦", "D. 均田令"], correctIndex: 0 }
    ],
    "趙高": [
        { q: "秦始皇死後，宦官趙高聯合李斯偽造詔書，逼死公子扶蘇，改立胡亥為帝，史稱什麼事件？", opts: ["A. 玄武門之變", "B. 沙丘之變", "C. 陳橋兵變", "D. 靖難之役"], correctIndex: 1 }
    ],
    "蒙恬": [
        { q: "秦始皇統一六國後，派哪一位將領率領大軍北擊匈奴，並修築萬里長城？", opts: ["A. 白起", "B. 王翦", "C. 蒙恬", "D. 章邯"], correctIndex: 2 }
    ],
    "蕭何": [
        { q: "「成也蕭何，敗也蕭何」這句俗語，與哪一位漢初軍事天才的命運息息相關？", opts: ["A. 張良", "B. 韓信", "C. 陳平", "D. 彭越"], correctIndex: 1 }
    ],
    "項羽": [
        { q: "在鉅鹿之戰中，項羽命令士兵砸破鍋子、鑿沉船隻，以示決死一戰，衍生出哪一句成語？", opts: ["A. 破釜沉舟", "B. 背水一戰", "C. 四面楚歌", "D. 十面埋伏"], correctIndex: 0 }
    ],
    "張良": [
        { q: "張良是「漢初三傑」之一，他在漢高祖劉邦建立漢朝的過程中主要擔任什麼角色？", opts: ["A. 統帥大軍", "B. 籌集糧草", "C. 出謀劃策 (謀士)", "D. 衝鋒陷陣"], correctIndex: 2 }
    ],
    "孔子": [
        { q: "孔子創立了儒家學派，其思想的核心概念是什麼？", opts: ["A. 兼愛", "B. 仁", "C. 無為", "D. 法治"], correctIndex: 1 }
    ],
    "孟子": [
        { q: "孟子是戰國時期儒家的代表人物，他提出了哪一種政治主張？", opts: ["A. 民貴君輕", "B. 嚴刑峻法", "C. 無為而治", "D. 兼愛非攻"], correctIndex: 0 }
    ],
    "齊桓公": [
        { q: "齊桓公提出的哪一個口號，成功團結了中原諸侯，抵禦外族入侵，成為春秋首霸？", opts: ["A. 遠交近攻", "B. 尊王攘夷", "C. 合縱連橫", "D. 挾天子以令諸侯"], correctIndex: 1 }
    ],
    "唐太宗": [
        { q: "唐太宗李世民在位期間，政治清明，經濟繁榮，史稱為什麼？", opts: ["A. 文景之治", "B. 開皇之治", "C. 貞觀之治", "D. 開元盛世"], correctIndex: 2 }
    ],
    "魏徵": [
        { q: "魏徵以敢於直言進諫著稱，唐太宗曾將他比喻為什麼，表示能藉此「明得失」？", opts: ["A. 銅鏡", "B. 人鏡", "C. 歷史", "D. 寶劍"], correctIndex: 1 }
    ],
    "武則天": [
        { q: "武則天在位期間，為了打擊關隴門閥，大力發展了哪一項制度來提拔寒門人才？", opts: ["A. 九品中正制", "B. 察舉制", "C. 科舉制 (開創殿試)", "D. 世卿世祿制"], correctIndex: 2 }
    ],
    "唐玄宗": [
        { q: "唐玄宗統治前期，唐朝達到了極盛，史稱為什麼？", opts: ["A. 貞觀之治", "B. 開元盛世", "C. 元嘉之治", "D. 康乾盛世"], correctIndex: 1 }
    ],
    "狄仁傑": [
        { q: "狄仁傑是武則天時期的著名宰相，他以什麼才能最為後世所熟知？", opts: ["A. 領兵打仗", "B. 賦詩作詞", "C. 斷案如神、明察秋毫", "D. 發明創造"], correctIndex: 2 }
    ],
    "郭子儀": [
        { q: "在安史之亂中，哪一位唐朝將領力挽狂瀾，收復了長安、洛陽，對平定叛亂有極大貢獻？", opts: ["A. 岳飛", "B. 郭子儀", "C. 韓信", "D. 衛青"], correctIndex: 1 }
    ]
};

function getRandomQuestion(cardName, dynasty, cardType) {
    let qs = CARD_QUESTIONS_DB[cardName];
    if (!qs || qs.length === 0) {
        return {
            q: `關於【${cardName}】(${dynasty})的歷史考驗：下列敘述何者最符合歷史原貌？`,
            opts: [`A. 此選項符合該時期的歷史發展`, `B. 與其生平無關`, `C. 後世虛構情節`, `D. 違背客觀規律`],
            correctIndex: 0
        };
    }
    return qs[Math.floor(Math.random() * qs.length)];
}

const ALL_CARDS = [...HERO_CARDS, ...SUPPORT_CARDS];
let rooms = {};

io.on('connection', (socket) => {
    socket.on('create_room', (roomId) => {
        if (rooms[roomId]) {
            socket.emit('error_msg', '房間已存在，請直接加入！');
            return;
        }
        rooms[roomId] = {
            players: [socket.id],
            state: {
                [socket.id]: { hp: 300, hand: [], deck: [], active: null, supportArea: [], hasPlayedCard: false }
            },
            turn: socket.id
        };
        socket.join(roomId);
        socket.emit('room_created', roomId);
    });

    socket.on('join_room', (roomId) => {
        const room = rooms[roomId];
        if (!room) {
            socket.emit('error_msg', '房間不存在！');
            return;
        }
        if (room.players.length >= 2) {
            socket.emit('error_msg', '房間已滿！');
            return;
        }
        if (room.players.includes(socket.id)) return;

        room.players.push(socket.id);
        room.state[socket.id] = { hp: 300, hand: [], deck: [], active: null, supportArea: [], hasPlayedCard: false };
        socket.join(roomId);

        room.players.forEach(pid => {
            let shuffled = [...ALL_CARDS].sort(() => Math.random() - 0.5);
            room.state[pid].deck = shuffled;
            room.state[pid].hand = shuffled.splice(0, 5);
        });

        io.to(roomId).emit('game_start', { roomId });
        updateGameState(roomId);
    });

    // 點選手牌出牌（無論人物或輔助卡，直接放置/發動，不觸發問題）
    socket.on('play_card', ({ roomId, cardIndex }) => {
        const room = rooms[roomId];
        if (!room || room.turn !== socket.id) return;
        const pState = room.state[socket.id];
        if (pState.hasPlayedCard) {
            socket.emit('error_msg', '每回合只能出一張牌！');
            return;
        }
        const card = pState.hand[cardIndex];
        if (!card) return;

        if (card.type === '人物' && pState.active) {
            socket.emit('error_msg', '場上已有主戰人物，請先發動攻擊！');
            return;
        }

        pState.hasPlayedCard = true;
        pState.hand.splice(cardIndex, 1);

        const opId = room.players.find(id => id !== socket.id);
        const opState = room.state[opId];

        if (card.type === '人物') {
            pState.active = card;
            io.to(roomId).emit('battle_log', { msg: `[時空部署] 穿越時空者 ${socket.id.substring(4,8)} 成功召喚主戰人物【${card.name}】登場！` });
            io.to(roomId).emit('play_sound', { type: 'deploy' });
            updateGameState(roomId);
        } else {
            // 輔助卡直接發動效果，不需答題
            if (!pState.supportArea) pState.supportArea = [];
            pState.supportArea.push({ name: card.name });
            
            io.to(roomId).emit('battle_log', { msg: `[策略發動] 穿越時空者 ${socket.id.substring(4,8)} 成功發動【${card.name}】策略！` });
            io.to(roomId).emit('play_sound', { type: 'heal' });

            const cardName = card.name;
            if (cardName === '萬里長城' || cardName === '統一度量衝' || cardName === '徒木立信' || cardName === '和親制度' || cardName === '屯田制' || cardName === '均田制' || cardName === '三省六部制' || cardName === '科舉制度') {
                pState.hp = Math.min(300, pState.hp + 30);
                io.to(roomId).emit('battle_log', { msg: `🛡️ 防禦策略生效！恢復 30 點生命值。` });
            } else if (cardName === '輪台罪己詔') {
                pState.hp = Math.min(300, pState.hp + 40);
                io.to(roomId).emit('battle_log', { msg: `✨ 大幅恢復策略生效！恢復 40 點生命值。` });
            } else if (cardName === '大運河') {
                pState.hp = Math.min(300, pState.hp + 35);
                io.to(roomId).emit('battle_log', { msg: `✨ 大幅恢復策略生效！恢復 35 點生命值。` });
            } else if (cardName === '焚書坑儒' || cardName === '黃巾之亂' || cardName === '赤壁之戰' || cardName === '安史之亂' || cardName === '指鹿為馬') {
                if (opState) opState.hp = Math.max(0, opState.hp - 25);
                io.to(roomId).emit('play_sound', { type: 'attack_success' });
                io.to(roomId).emit('battle_log', { msg: `🔥 攻擊策略生效！對手扣除 25 點生命值。` });
            } else if (cardName === '黨錮之禍') {
                pState.hp = Math.min(300, pState.hp + 15);
                io.to(roomId).emit('battle_log', { msg: `✨ 策略生效！恢復 15 點生命值。` });
            } else {
                let healVal = (cardName === '統一文字' || cardName === '統一貨幣' || cardName === '開鑿運河' || cardName === '修築道路' || cardName === '五經博士' || cardName === '三長制' || cardName === '租調制') ? 20 : 25;
                pState.hp = Math.min(300, pState.hp + healVal);
                io.to(roomId).emit('battle_log', { msg: `✨ 策略生效！恢復 ${healVal} 點生命值。` });
            }

            if (opState && opState.hp <= 0) {
                opState.hp = 0;
                io.to(roomId).emit('game_over', { winner: socket.id });
                delete rooms[roomId];
                return;
            }

            switchTurnAndDraw(room, roomId);
        }
    });

    socket.on('get_attack_question', ({ roomId }) => {
        const room = rooms[roomId];
        if (!room || room.turn !== socket.id) return;
        const pState = room.state[socket.id];
        if (!pState.active) {
            socket.emit('error_msg', '您尚未部署主戰人物！');
            return;
        }
        let qData = getRandomQuestion(pState.active.name, pState.active.dynasty, '人物');
        socket.emit('show_attack_question', { qData });
    });

    socket.on('attack', ({ roomId, answerCorrect }) => {
        const room = rooms[roomId];
        if (!room || room.turn !== socket.id) return;
        const pState = room.state[socket.id];
        const opId = room.players.find(id => id !== socket.id);
        if (!opId || !room.state[opId]) return;
        const opState = room.state[opId];
        if (!pState.active) return;

        let damage = answerCorrect ? 60 : 20;
        opState.hp = Math.max(0, opState.hp - damage);

        if (answerCorrect) {
            io.to(roomId).emit('battle_log', { msg: `⚔️ 【${pState.active.name}】戰技激發成功！造成 60 點爆發傷害，隨後功成身退被棄掉！` });
            io.to(roomId).emit('play_sound', { type: 'attack_success' });
        } else {
            io.to(roomId).emit('battle_log', { msg: `⚠️ 【${pState.active.name}】戰技答題錯誤！造成微弱 20 點傷害，隨後被棄掉。` });
            io.to(roomId).emit('play_sound', { type: 'attack_fail' });
        }

        pState.active = null;

        if (opState.hp <= 0) {
            opState.hp = 0;
            io.to(roomId).emit('game_over', { winner: socket.id });
            delete rooms[roomId];
            return;
        }

        switchTurnAndDraw(room, roomId);
    });

    socket.on('disconnect', () => {
        for (let roomId in rooms) {
            let room = rooms[roomId];
            if (room && room.players.includes(socket.id)) {
                io.to(roomId).emit('battle_log', { msg: `⚠️ 對手已斷線，遊戲結束。` });
                const winnerId = room.players.find(id => id !== socket.id) || socket.id;
                io.to(roomId).emit('game_over', { winner: winnerId });
                delete rooms[roomId];
            }
        }
    });
});

function switchTurnAndDraw(room, roomId) {
    room.turn = room.players.find(id => id !== room.turn);
    if (room.state[room.turn]) {
        room.state[room.turn].hasPlayedCard = false;
        let nextPlayerState = room.state[room.turn];
        
        for (let i = 0; i < 2; i++) {
            if (nextPlayerState.deck.length === 0) {
                nextPlayerState.deck = [...ALL_CARDS].sort(() => Math.random() - 0.5);
            }
            if (nextPlayerState.deck.length > 0) {
                nextPlayerState.hand.push(nextPlayerState.deck.shift());
            }
        }
    }
    io.to(roomId).emit('battle_log', { msg: `🔄 行動完畢，回合結束，輪到下一位穿越時空者（已補給 2 張卡牌）。` });
    updateGameState(roomId);
}

function updateGameState(roomId) {
    const room = rooms[roomId];
    if (!room) return;
    room.players.forEach(pid => {
        const opId = room.players.find(id => id !== pid);
        io.to(pid).emit('game_state_update', {
            myState: room.state[pid],
            opState: room.state[opId] || { hp: 300, active: null, supportArea: [] },
            isMyTurn: room.turn === pid
        });
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`《英魂決：時空交錯》伺服器已在 port ${PORT} 啟動！`);
});
