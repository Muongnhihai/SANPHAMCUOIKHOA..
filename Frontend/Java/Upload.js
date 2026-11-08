const artFile = document.getElementById("artFile");
const imagePreview = document.getElementById("imagePreview");
const previewText = document.querySelector(".preview-container p");
const caption = document.getElementById("caption");
const uploadBtn = document.getElementById("uploadBtn");
const message = document.getElementById("message");

console.log("✅ Upload.js đã chạy");

artFile.addEventListener("change", () => {
    const file = artFile.files[0];
    if (!file) return;

    console.log("📁 Đã chọn:", file.name);

    if (!file.type.startsWith("image/")) {
        message.textContent = "❌ Vui lòng chọn file ảnh!";
        artFile.value = "";
        return;
    }

    const imageURL = URL.createObjectURL(file);
    imagePreview.src = imageURL;
    imagePreview.style.display = "block";
    previewText.style.display = "none";
    message.textContent = "";
});

uploadBtn.addEventListener("click", async () => {
    const file = artFile.files[0];

    if (!file) {
        message.textContent = "⚠️ Bạn chưa chọn ảnh!";
        return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
        message.textContent = "⚠️ Bạn chưa đăng nhập!";
        return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", caption.value);

    uploadBtn.disabled = true;
    message.textContent = "⏳ Đang đăng tranh...";

    try {
        const response = await fetch("http://localhost:3000/api/posts", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Đăng tranh thất bại!");
        }

        message.textContent = "✅ Đăng tranh thành công!";
        artFile.value = "";
        caption.value = "";
        imagePreview.src = "";
        imagePreview.style.display = "none";
        previewText.style.display = "block";

        setTimeout(() => {
            window.location.href = "./Profile.html";
        }, 1000);
    } catch (error) {
        console.error(error);
        message.textContent = "❌ " + error.message;
    }

    uploadBtn.disabled = false;
});