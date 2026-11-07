const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

// --- 完整專屬卡牌題庫 (初中中國歷史程度) ---
const CARD_QUESTIONS_DB = {
    // ================= 歷史人物 =================
    "秦始皇": [
        { q: "秦王政滅六國統一天下後，認為自己「德兼三皇，功過五帝」，因此創立了什麼稱號？", opts: ["A. 天子", "B. 皇帝", "C. 霸王", "D. 單于"], correctIndex: 1 },
        { q: "秦始皇為了加強中央集權，在地方上廢除了西周以來的分封制，全面推行什麼制度？", opts: ["A. 郡縣制", "B. 行省制", "C. 察舉制", "D. 三省六部制"], correctIndex: 0 }
    ],
    "高級軍吏俑": [
        { q: "在秦始皇陵兵馬俑中，級別最高、數量最少，俗稱為「將軍俑」的是哪一種俑？", opts: ["A. 跪射俑", "B. 高級軍吏俑", "C. 騎兵俑", "D. 武士俑"], correctIndex: 1 }
    ],
    "李廣": [
        { q: "漢朝名將李廣以英勇善戰著稱，匈奴人對他十分敬畏，稱他為什麼？", opts: ["A. 飛將軍", "B. 冠軍侯", "C. 戰神", "D. 天可汗"], correctIndex: 0 },
        { q: "「桃李不言，下自成蹊」這句成語出自《史記》，是司馬遷用來讚美哪一位漢代名將的品格？", opts: ["A. 衛青", "B. 霍去病", "C. 李廣", "D. 韓信"], correctIndex: 2 }
    ],
    "霍去病": [
        { q: "西漢名將霍去病曾率軍深入漠北，大破匈奴，並在何處舉行祭天大典，史稱「封狼居胥」？", opts: ["A. 泰山", "B. 祁連山", "C. 狼居胥山", "D. 陰山"], correctIndex: 2 }
    ],
    "漢武帝": [
        { q: "漢武帝採納了董仲舒的建議，實施了哪一項影響中國兩千多年的文化政策？", opts: ["A. 焚書坑儒", "B. 罷黜百家，獨尊儒術", "C. 崇尚黃老", "D. 提倡佛法"], correctIndex: 1 },
        { q: "為了打擊地方諸侯王的勢力，漢武帝頒布了哪一項巧妙的法令，讓諸侯國越分越小？", opts: ["A. 削藩令", "B. 推恩令", "C. 鹽鐵專賣", "D. 告緡令"], correctIndex: 1 }
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
    ],

    // ================= 輔助卡與制度 =================
    "焚書坑儒": [
        { q: "秦始皇採納李斯的建議實行「焚書坑儒」，其根本目的是什麼？", opts: ["A. 發展農業", "B. 統一思想，鞏固統治", "C. 推廣法家學說", "D. 削弱六國貴族"], correctIndex: 1 }
    ],
    "統一度量衝": [
        { q: "秦始皇統一度量衡，這對當時的社會發展有什麼最直接的好處？", opts: ["A. 方便各地經濟交流與賦稅徵收", "B. 提高軍隊戰鬥力", "C. 促進文學藝術發展", "D. 改善水利工程"], correctIndex: 0 }
    ],
    "統一文字": [
        { q: "秦始皇下令統一全國文字，規定以哪一種字體作為官方標準？", opts: ["A. 楷書", "B. 小篆", "C. 甲骨文", "D. 行書"], correctIndex: 1 }
    ],
    "萬里長城": [
        { q: "秦朝修築萬里長城，主要是為了抵禦哪一個北方游牧民族的侵擾？", opts: ["A. 鮮卑", "B. 突厥", "C. 匈奴", "D. 契丹"], correctIndex: 2 }
    ],
    "指鹿為馬": [
        { q: "成語「指鹿為馬」源自於秦朝末年哪一位權臣測試朝臣忠誠度的荒謬行為？", opts: ["A. 李斯", "B. 趙高", "C. 呂不韋", "D. 董卓"], correctIndex: 1 }
    ],
    "推行郡縣制度": [
        { q: "秦朝推行郡縣制，郡守與縣令是由誰直接任免的？", opts: ["A. 地方推舉", "B. 皇帝直接任免", "C. 世襲繼承", "D. 考試選拔"], correctIndex: 1 }
    ],
    "統一貨幣": [
        { q: "秦始皇統一全國貨幣，規定全國通用的標準銅錢形狀是什麼？", opts: ["A. 刀形", "B. 布幣", "C. 圓形方孔", "D. 貝殼"], correctIndex: 2 }
    ],
    "重農輕商": [
        { q: "自商鞅變法以來，歷代封建王朝多奉行「重農抑商」政策，主要原因是什麼？", opts: ["A. 商人容易叛亂", "B. 農業是國家賦稅和兵役的根本保證", "C. 商業無法創造財富", "D. 受儒家思想影響"], correctIndex: 1 }
    ],
    "開鑿運河": [
        { q: "秦朝開鑿了「靈渠」，溝通了長江與珠江水系，主要是為了支援平定哪一地區的軍事行動？", opts: ["A. 匈奴", "B. 西域", "C. 南越 (百越)", "D. 遼東"], correctIndex: 2 }
    ],
    "修築道路": [
        { q: "秦始皇為了加強對全國的控制，並快速調動軍隊，下令修築了以咸陽為中心的什麼道路網？", opts: ["A. 絲綢之路", "B. 馳道與直道", "C. 茶馬古道", "D. 蜀道"], correctIndex: 1 }
    ],
    "徒木立信": [
        { q: "戰國時期，商鞅為了推行變法，在國都南門立了一根木頭，搬動者賞金五十，這被稱為什麼？", opts: ["A. 完璧歸趙", "B. 徒木立信", "C. 千金買骨", "D. 負荊請罪"], correctIndex: 1 }
    ],
    "推恩令": [
        { q: "漢武帝採納主父偃的建議頒布「推恩令」，其主要目的是什麼？", opts: ["A. 削弱諸侯王的勢力，加強中央集權", "B. 擴大諸侯王的封地", "C. 推廣儒家學說", "D. 增加國家稅收"], correctIndex: 0 }
    ],
    "和親制度": [
        { q: "漢初面對匈奴的強大威脅，為了爭取休養生息的時間，採取了什麼外交政策？", opts: ["A. 閉關鎖國", "B. 遠交近攻", "C. 和親政策", "D. 稱臣納貢"], correctIndex: 2 }
    ],
    "士人政府": [
        { q: "漢武帝獨尊儒術後，政府官員多由研習儒家經典的讀書人擔任，形成了所謂的什麼政府？", opts: ["A. 軍閥政府", "B. 士人政府", "C. 貴族政府", "D. 宦官政府"], correctIndex: 1 }
    ],
    "五經博士": [
        { q: "漢武帝在長安設立「太學」，並設置了什麼專門傳授儒家經典的教官？", opts: ["A. 翰林學士", "B. 國子監祭酒", "C. 五經博士", "D. 欽差大臣"], correctIndex: 2 }
    ],
    "輪台罪己詔": [
        { q: "漢武帝晚年因連年征戰導致民生凋敝，他頒布了中國歷史上著名的哪一份反省詔書？", opts: ["A. 討武曌檄", "B. 輪台罪己詔", "C. 奉天悲憤詔", "D. 罪己詔"], correctIndex: 1 }
    ],
    "黨錮之禍": [
        { q: "東漢末年，士人與太學生批評朝政，被宦官誣陷結黨營私而遭到逮捕禁錮，史稱什麼？", opts: ["A. 巫蠱之禍", "B. 黨錮之禍", "C. 沙丘之變", "D. 靖康之難"], correctIndex: 1 }
    ],
    "黃巾之亂": [
        { q: "東漢末年黃巾之亂的領導人張角，是藉由傳播哪一種宗教來組織群眾發動起義的？", opts: ["A. 佛教", "B. 基督教", "C. 太平道 (道教)", "D. 摩尼教"], correctIndex: 2 }
    ],
    "赤壁之戰": [
        { q: "赤壁之戰中，孫吳與劉備聯軍使用什麼戰術大敗曹操的軍隊，奠定了三分天下的基礎？", opts: ["A. 水淹七軍", "B. 火攻 (火燒連環船)", "C. 空城計", "D. 十面埋伏"], correctIndex: 1 }
    ],
    "屯田制": [
        { q: "三國時期，曹操為了讓軍隊有充足糧草並安置流民，實行了哪一項農業制度？", opts: ["A. 均田制", "B. 井田制", "C. 屯田制", "D. 租庸調制"], correctIndex: 2 }
    ],
    "均田制": [
        { q: "北魏孝文帝時期，為了解決土地兼併問題、保證國家稅收，頒布了哪一項土地制度？", opts: ["A. 屯田制", "B. 井田制", "C. 均田制", "D. 青苗法"], correctIndex: 2 }
    ],
    "三長制": [
        { q: "北魏時期，為配合均田制並清查隱瞞的戶口，設立了哪一項基層組織制度（鄰長、里長、黨長）？", opts: ["A. 保甲制", "B. 里甲制", "C. 三長制", "D. 猛安謀克制"], correctIndex: 2 }
    ],
    "租調制": [
        { q: "北魏實施的賦稅制度「租調制」中，「租」與「調」分別代表繳納什麼？", opts: ["A. 田租與戶稅 (絹帛等)", "B. 兵役與勞役", "C. 商業稅與關稅", "D. 人頭稅與鹽鐵稅"], correctIndex: 0 }
    ],
    "三省六部制": [
        { q: "隋唐時期確立了「三省六部制」，其中負責執行具體政務的是哪一省？", opts: ["A. 中書省", "B. 門下省", "C. 尚書省", "D. 秘書省"], correctIndex: 2 }
    ],
    "大運河": [
        { q: "隋煬帝開鑿大運河的主要歷史作用是什麼？", opts: ["A. 為了南下江南遊玩", "B. 加強南北交通與經濟文化交流", "C. 防禦匈奴入侵", "D. 解決黃河水患"], correctIndex: 1 }
    ],
    "科舉制度": [
        { q: "哪一個朝代創立了科舉制度，使平民百姓可以透過考試進入官僚體系？", opts: ["A. 漢朝", "B. 魏晉", "C. 隋朝", "D. 宋朝"], correctIndex: 2 }
    ],
    "府兵制": [
        { q: "唐朝前期實行的兵役制度是什麼，其最大特點是「兵農合一」？", opts: ["A. 募兵制", "B. 府兵制", "C. 衛所制", "D. 八旗制"], correctIndex: 1 }
    ],
    "租庸調制": [
        { q: "唐朝前期的賦稅制度「租庸調制」中，「庸」指的是什麼？", opts: ["A. 繳納穀物", "B. 繳納絹帛", "C. 納絹布代替勞役", "D. 繳納銅錢"], correctIndex: 2 }
    ],
    "安史之亂": [
        { q: "安史之亂導致唐朝出現了什麼嚴重的政治後遺症，最終加速了唐朝的滅亡？", opts: ["A. 宦官專權", "B. 外戚干政", "C. 藩鎮割據", "D. 諸侯兼併"], correctIndex: 2 }
    ],
    "兩稅法": [
        { q: "唐德宗時期，宰相楊炎建議改革稅制實行「兩稅法」，改以什麼作為徵收的主要標準？", opts: ["A. 按人頭徵收", "B. 按資產和土地徵收", "C. 按身高徵收", "D. 按軍功徵收"], correctIndex: 1 }
    ]
};

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
            // 原有題目
            { q: "秦王政自認為「XX三皇，XX五帝」，於是把三「皇」五「帝」名稱合稱為「皇帝」。請填空：", opts: ["A. 功過三皇，德兼五帝", "B. 德高三皇，功過五帝", "C. 德兼三皇，功過五帝", "D. 功德三皇五帝"], correctIndex: 0 },
            { q: "漢武帝採納主父偃的建議，頒行哪一項法令削弱諸侯王勢力？", opts: ["A. 削藩令", "B. 推恩令", "C. 漢律令", "D. 推恩法"], correctIndex: 1 },
            { q: "唐太宗在位期間政治清明，史稱為什麼？", opts: ["A. 開元之治", "B. 貞觀之治", "C. 文景之治", "D. 仁宣之治"], correctIndex: 1 },
            
            // 先秦時期
            { q: "中國歷史上第一個世襲制王朝是哪一個？", opts: ["A. 夏朝", "B. 商朝", "C. 周朝", "D. 秦朝"], correctIndex: 0 },
            { q: "西周時期為了鞏固統治，實行了哪一項重要的政治制度？", opts: ["A. 郡縣制", "B. 封建制", "C. 察舉制", "D. 科舉制"], correctIndex: 1 },
            { q: "「春秋五霸」中，最先稱霸的諸侯是誰？", opts: ["A. 晉文公", "B. 楚莊王", "C. 齊桓公", "D. 秦穆公"], correctIndex: 2 },
            { q: "孔子是哪一個學派的創始人？其核心思想為何？", opts: ["A. 道家，無為", "B. 法家，嚴刑", "C. 墨家，兼愛", "D. 儒家，仁"], correctIndex: 3 },
            { q: "戰國時期，秦國因為哪一場變法而迅速強大，奠定統一基礎？", opts: ["A. 吳起變法", "B. 王安石變法", "C. 商鞅變法", "D. 張居正改革"], correctIndex: 2 },

            // 秦漢時期
            { q: "秦始皇統一全國後，規定全國通用的標準文字是什麼？", opts: ["A. 大篆", "B. 小篆", "C. 隸書", "D. 楷書"], correctIndex: 1 },
            { q: "秦末爆發了中國歷史上第一次大規模的農民起義，領導者是誰？", opts: ["A. 項羽、劉邦", "B. 陳勝、吳廣", "C. 張角、張寶", "D. 黃巢、王仙芝"], correctIndex: 1 },
            { q: "漢初為了休養生息，推崇黃老之學，實行哪一種統治政策？", opts: ["A. 嚴刑峻法", "B. 獨尊儒術", "C. 無為而治", "D. 重農抑商"], correctIndex: 2 },
            { q: "漢武帝時期，派誰兩次出使西域，開闢了著名的「絲綢之路」？", opts: ["A. 班超", "B. 張騫", "C. 衛青", "D. 霍去病"], correctIndex: 1 },
            { q: "東漢是由誰建立的？他統治期間被稱為「光武中興」。", opts: ["A. 劉邦", "B. 劉徹", "C. 劉備", "D. 劉秀"], correctIndex: 3 },
            { q: "東漢末年，哪一場戰役奠定了三國鼎立的基礎？", opts: ["A. 官渡之戰", "B. 巨鹿之戰", "C. 赤壁之戰", "D. 淝水之戰"], correctIndex: 2 },
            { q: "東漢發明或改良了哪一項技術，對世界文明傳播產生巨大影響？", opts: ["A. 指南針", "B. 火藥", "C. 活字印刷", "D. 造紙術"], correctIndex: 3 },
            { q: "中國第一部紀傳體通史《史記》的作者是誰？", opts: ["A. 班固", "B. 司馬遷", "C. 司馬光", "D. 陳壽"], correctIndex: 1 },

            // 魏晉南北朝時期
            { q: "三國時期，魏國的建立者是誰？", opts: ["A. 曹操", "B. 曹丕", "C. 劉備", "D. 孫權"], correctIndex: 1 },
            { q: "北魏孝文帝為了促進民族融合，實行了哪一項重要改革？", opts: ["A. 建立府兵制", "B. 推行漢化政策", "C. 實行九品中正制", "D. 創立科舉制"], correctIndex: 1 },
            { q: "魏晉南北朝時期，為了選拔人才而實施的制度，最終導致「上品無寒門，下品無世族」的是？", opts: ["A. 察舉制", "B. 九品中正制", "C. 科舉制", "D. 徵辟制"], correctIndex: 1 },
            { q: "東晉十六國時期，哪一場戰役以少勝多，阻止了前秦南下統一？", opts: ["A. 官渡之戰", "B. 淝水之戰", "C. 牧野之戰", "D. 郾城之戰"], correctIndex: 1 },

            // 隋唐時期
            { q: "隋文帝楊堅結束了長期的分裂局面，他建立隋朝並統一全國是在哪一年？", opts: ["A. 220年", "B. 581年", "C. 589年", "D. 618年"], correctIndex: 2 },
            { q: "隋煬帝時期開鑿的哪一項重大工程，促進了南北經濟文化交流？", opts: ["A. 靈渠", "B. 鄭國渠", "C. 大運河", "D. 都江堰"], correctIndex: 2 },
            { q: "唐朝為打破世族壟斷，廣泛實施並完善了以考試選拔官員的制度是？", opts: ["A. 察舉制", "B. 九品中正制", "C. 科舉制", "D. 恩蔭制"], correctIndex: 2 },
            { q: "唐玄宗統治前期，唐朝國力達到鼎盛，史稱為什麼？", opts: ["A. 文景之治", "B. 貞觀之治", "C. 開元盛世", "D. 康乾盛世"], correctIndex: 2 },
            { q: "哪一場動亂成為唐朝由盛轉衰的轉捩點？", opts: ["A. 七國之亂", "B. 八王之亂", "C. 安史之亂", "D. 黃巢之亂"], correctIndex: 2 },
            { q: "中國歷史上唯一一位正統的女皇帝是誰？", opts: ["A. 呂后", "B. 武則天", "C. 慈禧太后", "D. 孝莊文皇后"], correctIndex: 1 },
            { q: "唐朝被譽為詩歌的黃金時代，被稱為「詩仙」的是哪位詩人？", opts: ["A. 杜甫", "B. 白居易", "C. 李白", "D. 王維"], correctIndex: 2 },
            { q: "唐太宗時，哪位公主和親吐蕃（今西藏），促進了漢藏友好？", opts: ["A. 王昭君", "B. 文成公主", "C. 太平公主", "D. 平陽公主"], correctIndex: 1 },

            // 宋元時期
            { q: "宋太祖趙匡胤是通過哪一場兵變奪取政權建立宋朝的？", opts: ["A. 玄武門之變", "B. 陳橋兵變", "C. 靖難之役", "D. 沙丘之變"], correctIndex: 1 },
            { q: "宋朝為防止武將專權，實行了哪一項基本國策？", opts: ["A. 重農抑商", "B. 休養生息", "C. 重文輕武", "D. 閉關鎖國"], correctIndex: 2 },
            { q: "北宋時期，誰發明了活字印刷術，大大提高了印刷效率？", opts: ["A. 蔡倫", "B. 畢昇", "C. 沈括", "D. 郭守敬"], correctIndex: 1 },
            { q: "南宋抗金名將，後來被以「莫須有」罪名遇害的是誰？", opts: ["A. 韓世忠", "B. 岳飛", "C. 文天祥", "D. 史可法"], correctIndex: 1 },
            { q: "建立蒙古帝國，被尊為「成吉思汗」的是誰？", opts: ["A. 忽必烈", "B. 鐵木真", "C. 完顏阿骨打", "D. 耶律阿保機"], correctIndex: 1 },
            { q: "元朝為了對遼闊的疆域進行有效管轄，開創了哪一項地方行政制度？", opts: ["A. 分封制", "B. 郡縣制", "C. 行省制度", "D. 猛安謀克制"], correctIndex: 2 },
            { q: "司馬光主持編纂的《資治通鑑》是一部什麼體裁的史書？", opts: ["A. 紀傳體通史", "B. 編年體通史", "C. 紀事本末體", "D. 斷代史"], correctIndex: 1 },

            // 明清時期
            { q: "明太祖朱元璋為了加強君主專制，廢除了哪一項實行了千餘年的制度？", opts: ["A. 丞相制度", "B. 科舉制度", "C. 郡縣制度", "D. 三省六部制"], correctIndex: 0 },
            { q: "明成祖時期，誰率領船隊七次下西洋，最遠到達非洲東海岸？", opts: ["A. 戚繼光", "B. 鄭成功", "C. 鄭和", "D. 汪直"], correctIndex: 2 },
            { q: "明朝特有的，直接聽命於皇帝的特務監視機構統稱為什麼？", opts: ["A. 樞密院", "B. 廠衛", "C. 軍機處", "D. 內閣"], correctIndex: 1 },
            { q: "清朝雍正帝時設立了哪一個機構，標誌著君主專制達到了頂峰？", opts: ["A. 內閣", "B. 南書房", "C. 軍機處", "D. 總理衙門"], correctIndex: 2 },
            { q: "清朝前期，為了防範西方殖民者，實行了嚴格限制對外貿易的政策是？", opts: ["A. 海禁與閉關鎖國", "B. 門戶開放", "C. 重農抑商", "D. 屯田制"], correctIndex: 0 },
            { q: "明末清初，率軍驅逐荷蘭人，收復台灣的民族英雄是誰？", opts: ["A. 戚繼光", "B. 鄭和", "C. 鄭成功", "D. 施琅"], correctIndex: 2 },
            
            // 近代史前奏及常識
            { q: "1840年爆發的哪一場戰爭，成為中國近代史的開端？", opts: ["A. 甲午戰爭", "B. 鴉片戰爭", "C. 八國聯軍之役", "D. 中法戰爭"], correctIndex: 1 },
            { q: "中國近代史上第一個不平等條約是？", opts: ["A. 《南京條約》", "B. 《北京條約》", "C. 《馬關條約》", "D. 《辛丑條約》"], correctIndex: 0 },
            { q: "19世紀中葉，由洪秀全領導的，席捲半個中國的農民起義是？", opts: ["A. 黃巾起義", "B. 李自成起義", "C. 太平天國運動", "D. 義和團運動"], correctIndex: 2 },
            { q: "晚清時期，李鴻章等人以「自強」、「求富」為口號發起的運動是？", opts: ["A. 洋務運動", "B. 戊戌變法", "C. 辛亥革命", "D. 新文化運動"], correctIndex: 0 },
            { q: "1894年中日甲午戰爭戰敗後，清政府被迫簽訂了割讓台灣的哪一個條約？", opts: ["A. 《南京條約》", "B. 《璦琿條約》", "C. 《辛丑條約》", "D. 《馬關條約》"], correctIndex: 3 },
            { q: "1911年爆發的哪一場革命，最終推翻了清朝的統治，結束了帝制？", opts: ["A. 戊戌變法", "B. 辛亥革命", "C. 國民革命", "D. 護國運動"], correctIndex: 1 },
            { q: "康有為、梁啟超在光緒帝支持下進行的政治改革史稱什麼？", opts: ["A. 洋務運動", "B. 戊戌變法(百日維新)", "C. 清末新政", "D. 預備立憲"], correctIndex: 1 },
            { q: "中國古代四大發明中，對世界航海事業產生決定性影響的是？", opts: ["A. 造紙術", "B. 印刷術", "C. 指南針", "D. 火藥"], correctIndex: 2 },
            { q: "以「均田免賦」為口號，推翻明朝統治的農民軍領袖是誰？", opts: ["A. 黃巢", "B. 陳勝", "C. 李自成", "D. 洪秀全"], correctIndex: 2 },
            { q: "清康熙時期，平定了哪三位藩王的叛亂，鞏固了國家統一？", opts: ["A. 三監之亂", "B. 七國之亂", "C. 安史之亂", "D. 三藩之亂"], correctIndex: 3 }
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
