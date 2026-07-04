const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Khởi tạo các biến lưu trữ
let totalExecute = 0;
let darkbeardServers = new Map(); 

// Tự động nhận diện tên Sea để hiển thị trên dữ liệu JSON cho đẹp
function getSeaName(placeId) {
    const id = String(placeId);
    if (id === "2753915549") return "Darkbeard Sea 1";
    if (id === "4442272183") return "Darkbeard Sea 2";
    if (id === "7449423635") return "Darkbeard Sea 3";
    return `Darkbeard (Place: ${id})`;
}

// 1. Cổng tiếp nhận dữ liệu từ tất cả các Sea gửi lên
app.post('/update-darkbeard', (req, res) => {
    console.log("➡️ [Web] Nhận yêu cầu POST từ Roblox:", req.body);

    const { jobid, players, placeId } = req.body;
    
    if (!jobid) {
        console.log("❌ [Lỗi Web] Từ chối do thiếu JobId");
        return res.status(400).send("Thiếu JobId");
    }

    totalExecute++; 

    // Nhận toàn bộ và lưu chuẩn cấu trúc cho script Auto Hop nhặt về mượt nhất
    darkbeardServers.set(jobid, {
        "placeId": Number(placeId) || 0,
        "jobId": jobid,
        "players": Number(players) || 1,
        "name": getSeaName(placeId),
        "updatedAt": Date.now()
    });

    console.log(`✅ [Web] Đã nạp thành công Server mới! JobId: ${jobid} | Sea: ${placeId}`);
    res.status(200).send("Cập nhật thành công Server!");
});

// 2. Cổng dành riêng cho Script Lua lấy dữ liệu về để Auto Hop
app.get('/api', (req, res) => {
    const darkbeardDataArray = Array.from(darkbeardServers.values());
    res.json(darkbeardDataArray);
});

// Cơ chế tự động xóa server khỏi danh sách sau 15 phút (Quét dọn mỗi 1 phút)
setInterval(() => {
    const now = Date.now();
    for (let [jobid, data] of darkbeardServers.entries()) {
        if (now - data.updatedAt > 15 * 60 * 1000) { 
            console.log(`🧹 [Web] Hết thời gian, xóa Server cũ: ${jobid}`);
            darkbeardServers.delete(jobid);
        }
    }
}, 60000); 

// 3. Trả về dữ liệu gốc (Đã loại bỏ hoàn toàn giao diện HTML)
app.get('/', (req, res) => {
    const darkbeardDataArray = Array.from(darkbeardServers.values());
    
    const finalData = {
        "Total Execute": totalExecute,
        "by": "tranduykhanh",
        "sea_filter": "All Seas",
        "total_darkbeard_servers": darkbeardDataArray.length,
        "darkbeard_data": darkbeardDataArray
    };

    // Trả về trực tiếp chuỗi JSON
    res.json(finalData);
});

app.listen(PORT, () => {
    console.log(`🚀 Web đang chạy tại port ${PORT} - Chế độ API (Thuần JSON)`);
});

