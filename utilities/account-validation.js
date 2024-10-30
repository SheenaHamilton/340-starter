const accountModel = require("../models/account-model")
const utilities = require(".")

const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.registationRules = () => {
    return [
        // firstname is required and must be string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a first name."), // on error this message is sent.

        // lastname is required and must be string
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Please provide a last name."), // on error this message is sent.

        // valid email is required and cannot already exist in the database
        body("account_email")
            .trim()
            .isEmail()
            .normalizeEmail() // refer to validator.js docs
            .withMessage("A valid email is required.")
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email)
                if (emailExists) {
                    throw new Error("Email exists. Please log in or use different email")
                }
            }),

        // password is required and must be strong password
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
    ]
}

/*  **********************************
  *  Acccount Update Data Validation Rules
  * ********************************* */
validate.accountUpdateRules = () => {
    return [
        // firstname is required and must be string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a first name."), // on error this message is sent.

        // lastname is required and must be string
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Please provide a last name."), // on error this message is sent.

        // valid email is required and cannot already exist in the database
        body("account_email")
            .trim()
            .isEmail()
            .normalizeEmail() // refer to validator.js docs
            .withMessage("A valid email is required.")
            .custom(async (account_email, { req }) => {
                const account_id = req.body.account_id
                const emailExists = await accountModel.checkUpdatedEmail(account_email, account_id)
                if (emailExists) {
                    throw new Error("A different account with this email already exists. Please use a different email")
                }
            }),
    ]
}


/*  **********************************
  *  Acccount Update Password Validation Rules
  * ********************************* */
validate.accountPasswordRules = () => {
    return [
        // password is required and must be strong password
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
    ]
}


/*  **********************************
  *  Test Drive Validation Rules
  * ********************************* */
validate.testDriveRules = () => {
    return [
        // account ID is required
        body("inv_id")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please indicate a vehicle for the test drive."), // on error this message is sent.

        // Date is required 
        body("apt_date")
            .trim()
            .escape()
            .notEmpty()
            .isDate()
            .withMessage("Please select a date for the test drive."), // on error this message is sent.

        // time is required 
        body("apt_time")
            .trim()
            .escape()
            .notEmpty()
            .isTime()
            .withMessage("Please select a time for the test drive."), // on error this message is sent.

    ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const headerLinks = await utilities.getAccountHeaderLinks(res.locals)
        res.render("account/register", {
            errors,
            title: "Registration",
            nav,
            headerLinks,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}


/* ******************************
 * Check data and return errors or continue to update the account
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
    const { account_id, account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const headerLinks = await utilities.getAccountHeaderLinks(res.locals)
        const accountName = `${res.locals.accountData.account_firstname} ${res.locals.accountData.account_lastname}`

        res.render("account/update-account", {
            errors,
            title: "Update Account: " + accountName,
            nav,
            headerLinks,
            account_firstname,
            account_lastname,
            account_email,
            account_id,
        })
        return
    }
    next()
}

/* ******************************
 * Check data and return errors or continue to update the account
 * ***************************** */
validate.checkTestDrive = async (req, res, next) => {
    const { inv_id, apt_date, apt_time } = req.body
    let errors = []

    errors = validationResult(req)

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const headerLinks = await utilities.getAccountHeaderLinks(res.locals)
        const vehicleSelect = await utilities.buildInventorySelect(inv_id)
        const account_firstname = res.locals.accountData.account_firstname
        const account_lastname = res.locals.accountData.account_lastname
        const account_email = res.locals.accountData.account_email
        const account_id = res.locals.accountData.account_id

        res.render("account/testdrive", {
            errors,
            title: "Book a Test Drive",
            nav,
            headerLinks,
            account_id,
            apt_date,
            apt_time,
            vehicleSelect: vehicleSelect,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()

}

/* ******************************
 * Check data and return errors or continue to update the account
 * ***************************** */
validate.checkUpdatePassword = async (req, res, next) => {
    const { account_id, account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const headerLinks = await utilities.getAccountHeaderLinks(res.locals)
        const accountName = `${account_firstname} ${account_lastname}`

        res.render("account/update-account", {
            errors,
            title: "Update Account: " + accountName,
            nav,
            headerLinks,
            account_id,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()

}

/*  **********************************
  *  Login Data Validation Rules
  * ********************************* */
validate.loginRules = () => {
    return [
        // valid email is required and must already exist in the database
        body("account_email")
            .trim()
            .isEmail()
            .normalizeEmail() // refer to validator.js docs
            .withMessage("A valid email is required.")
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email)
                if (!emailExists) {
                    throw new Error("Password and email combination do not exist")
                }
            }),

        // password is required and must be strong password
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),

    ]
}

/* ******************************
 * Check data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
    const { account_email, account_password } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const headerLinks = await utilities.getAccountHeaderLinks(res.locals)
        res.render("account/login", {
            errors,
            title: "Login",
            nav,
            headerLinks,
            account_email,
        })
        return
    }
    next()
}

module.exports = validate