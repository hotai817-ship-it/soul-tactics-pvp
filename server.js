const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    pingTimeout: 60000,
    pingInterval: 25000
});

app.use(express.static(__dirname));

// ==========================================
// 🏫 六年級學生名冊資料庫 (請在此處修改)
// ==========================================
const STUDENT_DB = {
    "6A-01": "陳大文",
    "6A-02": "王小明",
    "6A-03": "林美玲",
    "6B-15": "張志強",
    "6B-16": "黃雅婷"
};

// ==========================================
// 📊 戰績數據庫 (以 JSON 檔案持久化儲存)
// 記錄學生的「最佳剩餘時間」(越高代表解題越快)
// ==========================================
const RECORDS_FILE = path.join(__dirname, 'atlantis_records.json');
let RECORDS_DB = {};
if (fs.existsSync(RECORDS_FILE)) {
    RECORDS_DB = JSON.parse(fs.readFileSync(RECORDS_FILE));
}

function saveRecords() {
    fs.writeFileSync(RECORDS_FILE, JSON.stringify(RECORDS_DB, null, 2));
}

// 接收前端傳來的通關成績
io.on('connection', (socket) => {
    // 學生登入驗證
    socket.on('verify_student', ({ className, studentNo }) => {
        const key = `${className}-${studentNo}`;
        const name = STUDENT_DB[key];
        if (name) socket.emit('student_verified', { name });
        else socket.emit('student_not_found');
    });

    // 記錄破關成績
    socket.on('submit_record', ({ identity, timeRemaining }) => {
        if (!identity || timeRemaining === undefined) return;
        const key = `${identity.className}-${identity.studentNo}`;
        
        // 如果是第一次過關，或是這次的成績(剩餘時間)比以前更好，就更新紀錄
        if (!RECORDS_DB[key] || timeRemaining > RECORDS_DB[key].bestTime) {
            RECORDS_DB[key] = { 
                name: identity.name, 
                bestTime: timeRemaining, 
                date: new Date().toLocaleString('zh-HK', { timeZone: 'Asia/Hong_Kong' })
            };
            saveRecords();
        }
    });
});

// ==========================================
// 🏆 建立教師專用排行榜網頁路由 (/dashboard)
// ==========================================
app.get('/dashboard', (req, res) => {
    let tableRows = '';
    // 依據「最佳剩餘時間」由大到小排序 (剩餘時間越多 = 越快破關)
    const sortedRecords = Object.entries(RECORDS_DB).sort((a, b) => b[1].bestTime - a[1].bestTime);
    
    sortedRecords.forEach(([id, data], index) => {
        // 將秒數轉換為 mm:ss 格式
        let m = Math.floor(data.bestTime / 60);
        let s = data.bestTime % 60;
        let timeStr = `${m}分 ${s < 10 ? '0' : ''}${s}秒`;

        tableRows += `
            <tr style="background: ${index % 2 === 0 ? '#f0f9ff' : '#ffffff'};">
                <td style="padding:15px; border:1px solid #bae6fd; text-align:center; font-weight:bold;">${index + 1}</td>
                <td style="padding:15px; border:1px solid #bae6fd; text-align:center;">${id.split('-')[0]}</td>
                <td style="padding:15px; border:1px solid #bae6fd; text-align:center;">${id.split('-')[1]}</td>
                <td style="padding:15px; border:1px solid #bae6fd; text-align:center; font-weight:bold; color:#0369a1;">${data.name}</td>
                <td style="padding:15px; border:1px solid #bae6fd; text-align:center; font-weight:bold; color:#059669; font-size:1.2rem;">${timeStr}</td>
                <td style="padding:15px; border:1px solid #bae6fd; text-align:center; font-size:0.9rem; color:#64748b;">${data.date}</td>
            </tr>`;
    });

    const html = `
        <!DOCTYPE html>
        <html lang="zh-Hant">
        <head>
            <meta charset="UTF-8"><title>亞特蘭提斯 - 戰績排行榜</title>
            <style>
                body { font-family: 'PingFang TC', sans-serif; background: #0f172a; padding: 30px; margin: 0; color: #333; }
                .container { max-width: 900px; margin: auto; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,229,255,0.2); border: 2px solid #0ea5e9; }
                h1 { text-align: center; color: #0284c7; margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; }
                th { background: #0ea5e9; color: white; padding: 15px; font-size: 1.1rem; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🔱 亞特蘭提斯密室 - 精英通關排行榜 🔱</h1>
                <p style="text-align:center; color:#64748b;">排名依據：過關時的剩餘時間 (剩餘時間越多，代表解題越快)</p>
                <table>
                    <tr>
                        <th>排名</th><th>班別</th><th>學號</th><th>學生姓名</th><th>最佳剩餘時間</th><th>達成時間</th>
                    </tr>
                    ${tableRows || '<tr><td colspan="6" style="text-align:center; padding:30px; color:#64748b;">目前尚無探險家成功逃脫記錄</td></tr>'}
                </table>
            </div>
        </body>
        </html>
    `;
    res.send(html);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`《亞特蘭提斯密室》伺服器已啟動於 Port ${PORT}！`);
});
