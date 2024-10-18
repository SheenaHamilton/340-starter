const showpwd = document.querySelector("#showpwd");

showpwd.addEventListener("click", function () {
    const pswdInput = document.getElementById("account_password");
    const eyeIcon = document.getElementById("showpwd");
    const type = pswdInput.getAttribute("type");

    eyeIcon.classList.toggle("hide");

    if (type == "password") {
        pswdInput.setAttribute("type", "text");
        showpwd.innerHTML = "Hide Password";
    } else {
        pswdInput.setAttribute("type", "password");
        showpwd.innerHTML = "Show Password";
    }
});