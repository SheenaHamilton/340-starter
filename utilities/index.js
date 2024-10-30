const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}


/* ************************
 * Constructs the Account links on the page header
 ************************** */
Util.getAccountHeaderLinks = async function (locals) {
    let headerLinks
    if (locals.loggedin) {
        headerLinks = `
        <a title="Go to Account Management" href="/account">Welcome <span id='act-firstname'>${locals.accountData.account_firstname}</span></a>
        <a title="Logout of CSE Motors" href="/account/Logout">Logout</a>`
    } else {
        headerLinks = `<a title="Click to log in" href="/account/login">My Account</a>`
    }
    return headerLinks
}

/* ************************
 * Builds the Account page for logged in users based on their account type
 ************************** */
Util.buildAccountHome = async function (locals) {
    let accountHome = `
        <h2>Welcome ${locals.accountData.account_firstname}</h2>
        <hr>
        <div id='accountinfo'>
            <h3>Account Information:</h3>
            <p class='label'>First Name: <span class='datafield'>${locals.accountData.account_firstname}</span></p>
            <p class='label'>Last Name: <span class='datafield'>${locals.accountData.account_lastname}</span></p>
            <p class='label'>Email: <span class='datafield'>${locals.accountData.account_email}</span></p>
            <p class='label'>Account Type: <span class='datafield'>${locals.accountData.account_type}</span></p>
            <a class='button' href='/account/update/${locals.accountData.account_id}'>Update Account Information</a>
        </div >
        <hr>`
    if (locals.accountData.account_type == 'Admin' || locals.accountData.account_type == 'Employee') {
        accountHome += `
        
        <div id=invmanagement>
            <h3>Inventory Management Tools</h3>
            <a class='button' href='/inv'>Inventory Management</a>
        </div>
        <hr>`
    }
    else {
        accountHome += `
        <div id=testDrive>
            <h3>Ready to Drive?</h3>
            <a class='button' href='/account/testdrive'>Book a Test Drive</a>
        </div>
        <hr>`
    }
    return accountHome
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
    let grid
    if (data.length > 0) {
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id
                + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + 'details"><img src="' + vehicle.inv_thumbnail
                + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + ' on CSE Motors" /></a>'
            grid += '<div class="namePrice">'
            grid += '<hr />'
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
                + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
                + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$'
                + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else {
        grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}


/* **************************************
* Build the inventory detail view HTML
* ************************************ */
Util.buildInventoryDetail = async function (data, locals) {
    let detailPage = `
        <div id='inv_details'>
            <div id='inv_photos'>
                <img src='${data.inv_image}' alt='Image of ${data.inv_make}  ${data.inv_model}'/>
            </div>
            <div id="inv_desc"> 
                <h2>${data.inv_year} ${data.inv_make}  ${data.inv_model}</h2>
                <section id="price">
                    <p>Own it for <span>$${new Intl.NumberFormat('en-US').format(data.inv_price)}</span></p>
                </section>
                <section id="desc">
                    <p>Description: </p>
                    <p>${data.inv_description}</p>
                </section>
                <section id="details">
                <p>Odometer:  <span>${new Intl.NumberFormat('en-US').format(data.inv_miles)} miles</span></p>
                <p>Exterior Color: <span>${data.inv_color}</span></p>
                </section> 
                <section id="book">   
                `
    if (locals.loggedin) {
        if (locals.accountData.account_type == 'Client') {
            detailPage += `<p>Book a <a href='/account/testdrive'>Test Drive</a></p>`
        }
    } else {
        detailPage += `<p><a href='/account/testdrive'>Login </a> to book a Test Drive</p>`
    }
    detailPage += `    
                </section>  
            </div >
        </div>`

    return detailPage
}

/* ************************
 * Constructs the Classification HTML select
 ************************** */
Util.buildClassificationSelect = async function (classification = null) {
    let data = await invModel.getClassifications()
    let selectlist = `<label class='top' for="classification_id">Classification</label>
                      <select name="classification_id" id="classification_id" required>
                   <option value = "">Choose Classification</option>`
    data.rows.forEach((row) => {
        if (classification == row.classification_id) {
            selectlist += `<option value="${row.classification_id}" selected>${row.classification_name}</option>`
        }
        else {
            selectlist += `<option value="${row.classification_id}">${row.classification_name}</option>`
        }
    })
    selectlist += `</select>`
    return selectlist
}
/* ************************
 * Constructs the Vehicle HTML select
 ************************** */
Util.buildInventorySelect = async function (inv_id = null) {
    let data = await invModel.getInventory()
    let selectlist = `<label class='top' for="inv_id">Vehicle</label>
                      <select name="inv_id" id="inv_id" required>
                      <option value = "">Choose Vehicle</option>`
    data.forEach((row) => {
        if (inv_id == row.inv_id) {
            selectlist += `<option value="${row.inv_id}" selected>${row.inv_year} ${row.inv_make} ${row.inv_model}</option>`
        }
        else {
            selectlist += `<option value="${row.inv_id}">${row.inv_year} ${row.inv_make} ${row.inv_model}</option>`
        }
    })
    selectlist += `</select>`

    return selectlist
}

/* ************************
 * Builds the Test Drive appointment view for logged in users
 ************************** */
Util.buildTestDriveView = async function (testDriveAptData = null) {
    let testDriveHTML = ''
    if (testDriveAptData.length > 0) {
        testDriveHTML += ` 
        <h3>Upcoming Test Drive Appointments</h3>
        <div id='testdriveapt'>
            <div class='testdriveapts'>
                <span class='tableheader'>Account</span>
                <span class='tableheader'>Date</span>
                <span class='tableheader'>Vehicle</span>
                <span class='tableheader'></span>
            </div>
        `
        testDriveAptData.forEach((row) => {
            testDriveHTML += `  
            <div class='testdriveapts'>
                <span>${row.account_id}: ${row.account_lastname}, ${row.account_firstname}</span> 
                <span>${row.apt_date} ${row.apt_time}</span> 
                <span><a href='/inv/detail/${row.inv_id}'> ${row.inv_id}: ${row.inv_year} ${row.inv_make} ${row.inv_model}</a></span>
                <span><a class='buttonlink' href='/account/cancel/${row.apt_id}' title='Cancel'>Cancel</a></span>  
            </div>    `
        })
        testDriveHTML += ` </div>`
    }
    return testDriveHTML
}
/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
    if (req.cookies.jwt) {
        jwt.verify(
            req.cookies.jwt,
            process.env.ACCESS_TOKEN_SECRET,
            function (err, accountData) {
                if (err) {
                    req.flash("Please log in")
                    res.clearCookie("jwt")
                    return res.redirect("/account/login")
                }
                res.locals.accountData = accountData
                res.locals.loggedin = 1
                next()
            })
    } else {
        next()
    }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedin) {
        next()
    } else {
        req.flash("notice", "Please log in.")
        return res.redirect("/account/login")
    }
}

/* ****************************************
 *  Authorize users for site administrative areas
 * ************************************ */
Util.authorizeUserAccess = (req, res, next) => {
    const authorizedAccounts = ['Employee', 'Admin']
    if (authorizedAccounts.includes(res.locals.accountData.account_type)) {
        next()
    } else {
        req.flash("error", "Sorry, you are not authorized to access this area.")
        return res.redirect("/account/login")
    }
}

/* ****************************************
* Logout process
**************************************** */
Util.logout = (req, res, next) => {
    res.clearCookie("jwt")
    res.locals.accountData = ''
    res.locals.loggedin = 0
    req.flash("notice", "You have logged out successfully")
    return res.redirect("/")
}

module.exports = Util