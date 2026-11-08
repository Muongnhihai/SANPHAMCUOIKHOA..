function Dangnhap() {
    const username = document.getElementById("email").value.trim();
    const password = document.getElementById("pass").value;
    const message = document.getElementById("message");

    if (!username || !password) {
        message.textContent = "Vui lòng nhập đầy đủ thông tin!";
        return;
    }

    fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .then(async response => {
        const data = await response.json();

        console.log("STATUS:", response.status);
        console.log("DATA:", data);

        if (response.ok) {
            message.textContent = data.message;
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.user.username);
            localStorage.setItem("userId", data.user.id);

            setTimeout(() => {
                window.location.href = "../../index.html";
            }, 500);
        } else {
            message.textContent = data.message;
        }
    })
    .catch(error => {
        console.error(error);
        message.textContent = "Không thể kết nối đến server!";
    });
}
function SignIn() {
            window.location.href="./Dangky.html";
        }