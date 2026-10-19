
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
require("dotenv").config();
console.log("JWT_SECRET đã được nạp:", Boolean(process.env.JWT_SECRET));
const cloudinary = require("./cloudinary");
const User = require("./models/User");
const Post = require("./models/Post");

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
            return cb(new Error("Chỉ chấp nhận ảnh JPG, PNG hoặc WebP"));
        }
        cb(null, true);
    }
});

function uploadToCloudinary(buffer) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: "hehe-art", resource_type: "image" },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        ).end(buffer);
    });
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Đã kết nối MongoDB!"))
    .catch(error => console.error("❌ Lỗi kết nối MongoDB:", error));

app.get("/", (req, res) => {
    res.send("HEHE ART BACKEND - MULTI USER");
});

// Đăng ký
app.post("/api/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ thông tin!"
            });
        }

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({
                message: "Tên tài khoản đã tồn tại!"
            });
        }

        const newUser = new User({ username, password });
        await newUser.save();

        res.status(201).json({ message: "Đăng ký thành công!" });
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
});

// Đăng nhập
app.post("/api/login", async (req, res) => {
    console.log("🔥 ĐÃ NHẬN REQUEST LOGIN");
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ thông tin!"
            });
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({
                message: "Tài khoản không tồn tại!"
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                message: "Mật khẩu không đúng!"
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Đăng nhập thành công!",
            token,
            user: {
                id: user._id,
                username: user.username
            }
        });
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
});

// Xác thực JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Bạn chưa đăng nhập!"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(403).json({
            message: "Phiên đăng nhập đã hết hạn hoặc không hợp lệ!"
        });
    }
}

// Đăng tranh lên Cloudinary, lưu thông tin vào MongoDB
app.post("/api/posts", authenticateToken, upload.single("image"), async (req, res) => {
    let uploadedPublicId;

    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Bạn chưa chọn ảnh!"
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(401).json({
                message: "Tài khoản không tồn tại!"
            });
        }

        const result = await uploadToCloudinary(req.file.buffer);
        uploadedPublicId = result.public_id;

        const newPost = new Post({
            author: user._id,
            imageUrl: result.secure_url,
            caption: req.body.caption || ""
        });

        await newPost.save();
        await newPost.populate("author", "username");

        res.status(201).json({
            message: "Đăng tranh thành công!",
            post: newPost
        });
    } catch (error) {
        console.error("Lỗi upload:", error);

        // Nếu lưu MongoDB thất bại, thử xóa ảnh vừa tải lên
        if (uploadedPublicId) {
            try {
                await cloudinary.uploader.destroy(uploadedPublicId);
            } catch (cleanupError) {
                console.error("Không thể dọn ảnh:", cleanupError);
            }
        }

        res.status(500).json({
            message: "Không thể đăng tranh. Vui lòng thử lại!"
        });
    }
});

// Lấy tất cả bài đăng cho trang chủ
app.get("/api/posts", async (req, res) => {
    try {
        console.log("📥 Đang lấy danh sách tranh...");

        const posts = await Post.find()
            .populate("author", "username")
            .sort({ createdAt: -1 });

        console.log("✅ Số bài đăng tìm được:", posts.length);
        res.json(posts);
    } catch (err) {
        console.error("❌ LỖI API /api/posts:", err);

        res.status(500).json({
            message: "Lỗi tải tranh",
            error: err.message
        });
    }
});
// Lấy bài đăng của tài khoản hiện tại
app.get("/api/my-posts", authenticateToken, async (req, res) => {
    try {
        const posts = await Post.find({ author: req.userId })
            .populate("author", "username")
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        console.error("Lỗi lấy bài đăng cá nhân:", error);
        res.status(500).json({ message: "Lỗi tải bài đăng cá nhân!" });
    }
});

// Báo lỗi upload rõ ràng hơn
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        return res.status(400).json({
            message: error.code === "LIMIT_FILE_SIZE"
                ? "Ảnh không được vượt quá 5 MB!"
                : "Lỗi khi nhận file ảnh!"
        });
    }

    if (error.message?.startsWith("Chỉ chấp nhận ảnh")) {
        return res.status(400).json({ message: error.message });
    }

    console.error(error);
    res.status(500).json({ message: "Lỗi server!" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

