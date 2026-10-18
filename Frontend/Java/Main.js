async function loadGallery() {
    const gallery = document.getElementById("artGallery");
    if (!gallery) {
        console.log("Trang này không có phần tử #artGallery");
        return;
    }

    try {
        const res = await fetch("http://localhost:3000/api/posts");
        if (!res.ok) throw new Error("HTTP " + res.status);

        const posts = await res.json();
        console.log("Dữ liệu bài đăng:", posts);

        gallery.replaceChildren();

        posts.forEach(post => {
            const card = document.createElement("article");
            card.className = "art-card";

            const img = document.createElement("img");
            img.src = post.imageUrl;
            img.alt = "Tranh";
            img.onerror = () => console.error("Không tải được ảnh:", post.imageUrl);

            const author = document.createElement("p");
            const username = typeof post.author === "object"
                ? post.author?.username
                : post.author;

author.textContent = "@" + (username || post.username || "unknown");
author.textContent = "@" + (username || "unknown");
            card.append(img, author);
            gallery.append(card);
        });
    } catch (err) {
        console.error("Không tải được Gallery:", err);
    }
}

loadGallery();
const lightbox = document.getElementById("artLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxAuthor = document.getElementById("lightboxAuthor");
const closeLightbox = document.getElementById("closeLightbox");

document.getElementById("artGallery").addEventListener("click", function (e) {
    const img = e.target.closest(".art-card img");
    if (!img) return;

    const card = img.closest(".art-card");
    const author = card?.querySelector(".art-author");

    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt || "Tranh phóng to";
    lightboxAuthor.textContent = author?.textContent || "";

    lightbox.classList.add("active");
});

function closeArtLightbox() {
    lightbox.classList.remove("active");
    lightboxImage.src = "";
}

closeLightbox.addEventListener("click", closeArtLightbox);

lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeArtLightbox();
});

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeArtLightbox();
});