const express = require("express")
const router = new express.Router()
const actController = require("../controllers/actController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')

// Route to build inventory by classification view
router.get("/login", utilities.handleErrors(actController.buildLogin));

// Process Login
router.post("/login", regValidate.loginRules(), regValidate.checkLoginData, utilities.handleErrors(actController.buildLogin));

// Route to build inventory by classification view
router.get("/register", utilities.handleErrors(actController.buildRegister));

// Process the registration data
router.post('/register', regValidate.registationRules(), regValidate.checkRegData, utilities.handleErrors(actController.registerAccount))

// Process the login attempt
router.post("/login", (req, res) => { res.status(200).send('login process') })

module.exports = router;