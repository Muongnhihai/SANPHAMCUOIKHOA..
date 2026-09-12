const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Đã kết nối MongoDB!");
    })
    .catch((error) => {
        console.log("❌ Lỗi kết nối MongoDB:", error);
    });

app.get("/", (req, res) => {
    res.send("Hehe Art Backend đang chạy!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});