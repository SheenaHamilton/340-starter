const form = document.querySelector("#updateAccount")
form.addEventListener("change", function () {
    const updateBtn = document.querySelector("#updateActButton")
    updateBtn.removeAttribute("disabled")
})

const formPassword = document.querySelector("#updateAccountPassword")
formPassword.addEventListener("change", function () {
    const updateBtn = document.querySelector("#updatePasswordButton")
    updateBtn.removeAttribute("disabled")
})