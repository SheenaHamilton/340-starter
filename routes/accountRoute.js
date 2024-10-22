const express = require("express")
const router = new express.Router()
const actController = require("../controllers/actController")
const utilities = require("../utilities/")
const accountValidate = require('../utilities/account-validation')

// Route to build inventory by classification view
router.get("/login", utilities.handleErrors(actController.buildLogin));

// Process Login
router.post("/login", accountValidate.loginRules(), accountValidate.checkLoginData, utilities.handleErrors(actController.accountLogin));

// Route to build inventory by classification view
router.get("/register", utilities.handleErrors(actController.buildRegister));

// Process the registration data
router.post('/register', accountValidate.registationRules(), accountValidate.checkRegData, utilities.handleErrors(actController.registerAccount))

// Process the login attempt
router.post("/login", (req, res) => { res.status(200).send('login process') })

// Account View
router.get("/", utilities.checkLogin, utilities.handleErrors(actController.buildAccountManagement))

// Process the logout attempt
router.get("/logout", utilities.checkLogin, utilities.handleErrors(utilities.logout))

// Get the Account Update page
router.get("/update/:account_id", utilities.checkLogin, utilities.handleErrors(actController.buildAccountUpdate))

// Process the Account Update
router.post("/update/", utilities.checkLogin, accountValidate.accountUpdateRules(), accountValidate.checkUpdateData, utilities.handleErrors(actController.updateAccount))

// Process the Account Password Update
router.post("/updatePassword/", utilities.checkLogin, accountValidate.accountPasswordRules(), accountValidate.checkUpdatePassword, utilities.handleErrors(actController.updatePassword))

module.exports = router;