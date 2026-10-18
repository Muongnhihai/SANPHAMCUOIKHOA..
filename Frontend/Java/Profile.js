const username = localStorage.getItem("username");

if (username) {

    document.getElementById("username").textContent = username;

    document.getElementById("nickname").textContent =
        "@" + username;

    const firstLetter =
        username.charAt(0).toUpperCase();

    document.getElementById("avatar").textContent =
        firstLetter;

    document.getElementById("miniAvatar").textContent =
        firstLetter;
}



function goToUpload() {

    window.location.href = "./Upload.html";

}