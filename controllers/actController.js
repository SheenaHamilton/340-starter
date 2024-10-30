const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { header } = require("express-validator")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    const headerLinks = await utilities.getAccountHeaderLinks(res.locals)
    res.render("./account/login", {
        title: "Login",
        nav,
        headerLinks,
        errors: null,
    })
}


/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    const headerLinks = await utilities.getAccountHeaderLinks(res.locals)

    res.render("./account/register", {
        title: "Register",
        nav,
        headerLinks,
        errors: null,
    })
}

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccountManagement(req, res, next) {
    let nav = await utilities.getNav()
    const headerLinks = await utilities.getAccountHeaderLinks(res.locals)
    const accountView = await utilities.buildAccountHome(res.locals)
    let testDriveData

    if (res.locals.accountData.account_type == 'Admin' || res.locals.accountData.account_type == 'Employee') {
        testDriveData = await accountModel.getAllTestDrives()
    } else {
        testDriveData = await accountModel.getUserTestDrives(res.locals.accountData.account_id)
    }
    const testDriveView = await utilities.buildTestDriveView(testDriveData)

    res.render("./account/account", {
        title: "Account Management",
        nav,
        headerLinks,
        accountView,
        testDriveView,
        errors: null,
    })
}

/* ****************************************
*  Deliver TestDrive view
* *************************************** */
async function buildTestDrive(req, res, next) {
    let nav = await utilities.getNav()
    const headerLinks = await utilities.getAccountHeaderLinks(res.locals)
    const vehicleSelect = await utilities.buildInventorySelect()
    const account_firstname = res.locals.accountData.account_firstname
    const account_lastname = res.locals.accountData.account_lastname
    const account_email = res.locals.accountData.account_email
    //TBD why need null vars, reg didn't need it
    res.render("./account/testdrive", {
        title: "Book a Test Drive",
        nav,
        headerLinks,
        errors: null,
        vehicleSelect: vehicleSelect,
        account_firstname,
        account_lastname,
        account_email,
        apt_date: null,
        apt_time: null,
    })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const headerLinks = await utilities.getAccountHeaderLinks(res.locals)
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')
        res.status(500).render("./account/register", {
            title: "Registration",
            nav,
            headerLinks,
            errors: null,
        })
    }

    const regResult = await accountModel.registerAccount(account_firstname, account_lastname, account_email, hashedPassword)

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you\'re registered ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            headerLinks,
            errors: null,
        })
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("./account/register", {
            title: "Registration",
            nav,
            headerLinks,
        })
    }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const headerLinks = await utilities.getAccountHeaderLinks(res.locals)

    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("./account/login", {
            title: "Login",
            nav,
            headerLinks,
            errors: null,
            account_email,
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
            if (process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
            } else {
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
            }
            return res.redirect("/account/")
        }
        else {
            req.flash("notice", "Please check your credentials and try again.")
            res.status(400).render("./account/login", {
                title: "Login",
                nav,
                headerLinks,
                errors: null,
                account_email,
            })
            return
        }
    } catch (error) {
        return new Error('Access Forbidden')
    }
}



/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildAccountUpdate(req, res, next) {
    let nav = await utilities.getNav()
    const headerLinks = await utilities.getAccountHeaderLinks(res.locals)
    const account_id = parseInt(req.params.account_id)
    const accountData = await accountModel.getAccountByActId(account_id)
    const accountName = `${accountData.account_firstname} ${accountData.account_lastname}`

    res.render("./account/update-account", {
        title: "Update Account: " + accountName,
        nav,
        headerLinks,
        errors: null,
        account_id: accountData.account_id,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
    })
}


/* ***************************
 *  Update Account Data
 * ************************** */
async function updateAccount(req, res, next) {
    let nav = await utilities.getNav()
    const headerLinks = await utilities.getAccountHeaderLinks(res.locals)
    const { account_id, account_firstname, account_lastname, account_email } = req.body
    const accountName = `${account_firstname} ${account_lastname}`

    const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email)

    if (updateResult) {
        const accountData = await accountModel.getAccountByActId(res.locals.accountData.account_id)
        delete accountData.account_password
        if (accountData) {
            try {
                const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
                if (process.env.NODE_ENV === 'development') {
                    res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
                } else {
                    res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
                }

                req.flash("notice", `The account for ${accountName} was successfully updated.`)
                res.redirect("/account/")

            } catch (error) {
                req.flash("notice", `The account for ${accountName} was successfully updated.`)
                req.flash("error", "Sorry, there was an issue with your session. Please log back in.")
                res.redirect('/account/logout')
            }
        }
    } else {
        req.flash("error", "Sorry, the account update failed.")
        res.status(500).render("./account/update-account", {
            title: "Update Account",
            nav,
            headerLinks,
            errors: null,
            account_id,
            account_firstname,
            account_lastname,
            account_email
        })
    }
}

/* ***************************
 *  Update Account Data
 * ************************** */
async function updatePassword(req, res, next) {
    let nav = await utilities.getNav()
    const headerLinks = await utilities.getAccountHeaderLinks(res.locals)
    const { account_id, account_firstname, account_lastname, account_email, account_password } = req.body
    const accountName = `${account_firstname} ${account_lastname}`

    // Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')
        res.status(500).render("./account/update", {
            title: "Update Account: " + accountName,
            nav,
            headerLinks,
            errors: null,
            account_id,
            account_firstname,
            account_lastname,
            account_email
        })
    }

    const updateResult = await accountModel.updatePassword(account_id, hashedPassword)

    if (updateResult) {
        req.flash("notice", `The password for the account ${accountName} was successfully updated.`)
        res.redirect("/account/")
    } else {
        req.flash("error", "Sorry, the account password update failed.")
        res.status(500).render("./account/update-account", {
            title: "Update Account: " + accountName,
            nav,
            headerLinks,
            errors: null,
            account_id,
            account_firstname,
            account_lastname,
            account_email
        })
    }
}


/* ****************************************
*  Process the test drive and book appt
* *************************************** */
async function bookTestDrive(req, res) {
    const { apt_date, apt_time, inv_id } = req.body
    const account_id = res.locals.accountData.account_id
    const aptResult = await accountModel.addTestDrive(account_id, inv_id, apt_date, apt_time)

    if (aptResult) {
        req.flash(
            "notice",
            `Congratulations, your test drive for ${apt_date} at ${apt_time} is booked!`
        )
        res.redirect("/account")
    } else {
        let nav = await utilities.getNav()
        const headerLinks = await utilities.getAccountHeaderLinks(res.locals)
        const vehicleSelect = await utilities.buildInventorySelect(inv_id)
        const account_firstname = res.locals.accountData.account_firstname
        const account_lastname = res.locals.accountData.account_lastname
        const account_email = res.locals.accountData.account_email

        //Add the default for inv_id on dropdown.
        req.flash("notice", "Sorry, the test drive booking has failed.")
        res.render("./account/testdrive", {
            title: "Book a Test Drive",
            nav,
            headerLinks,
            errors: null,
            vehicleSelect: vehicleSelect,
            account_firstname,
            account_lastname,
            account_email,
            apt_date,
            apt_time,
        })
    }
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
async function cancelTestDrive(req, res) {
    let nav = await utilities.getNav()
    const headerLinks = await utilities.getAccountHeaderLinks(res.locals)
    const apt_id = parseInt(req.params.apt_id)

    const deleteResult = await accountModel.cancelTestDrive(apt_id)

    if (deleteResult) {
        req.flash(
            "notice",
            `Your test drive was cancelled`
        )

    } else {
        req.flash("error", "Sorry, the cancellation failed.")
    }
    res.redirect("/account")
}



module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildAccountUpdate, updateAccount, updatePassword, buildTestDrive, bookTestDrive, cancelTestDrive }
