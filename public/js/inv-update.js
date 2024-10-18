const form = document.querySelector("#editInventory")
form.addEventListener("change", function () {
    const updateBtn = document.querySelector("#editInvbutton")
    updateBtn.removeAttribute("disabled")
})