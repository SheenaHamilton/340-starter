const { resolveInclude } = require("ejs")
const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function (req, res) {
    const nav = await utilities.getNav()
    const headerLinks = await utilities.getAccountHeaderLinks(res.locals)

    res.render("index", {
        title: "Home",
        nav,
        headerLinks
    })
}

baseController.throwError = async function (req, res) {
    const nav = await utilities.getNav()
    const headerLinks = await utilities.getAccountHeaderLinks(res.locals)
    res.render("index-error", {
        title: "Home",
        nav,
        headerLinks
    })
}

module.exports = baseController