function Dangky() {
    const username = document.getElementById("email").value;
    const password = document.getElementById("pass").value;

    fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("message").textContent = data.message;
    })
    .catch(error => {
        console.error(error);
        document.getElementById("message").textContent = "Không kết nối được Backend!";
    });
}
function SignIn() {
            window.location.href="./Web.html";
        }
function showSupport() {
            window.location.href="https://www.facebook.com/muong.nhi.hai";
        }