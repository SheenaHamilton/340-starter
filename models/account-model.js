const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
    try {
        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
        return error.message
    }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1"
        const email = await pool.query(sql, [account_email])
        return email.rowCount
    } catch (error) {
        return error.message
    }
}

/* **********************
 *   Check for existing email besides the current account
 * ********************* */
async function checkUpdatedEmail(account_email, account_id) {
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1 AND account_id != $2"
        const email = await pool.query(sql, [account_email, account_id])
        return email.rowCount
    } catch (error) {
        return error.message
    }
}


/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
    try {
        const result = await pool.query(
            'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
            [account_email])
        return result.rows[0]
    } catch (error) {
        return new Error("No matching email found")
    }
}


/* ***************************
 *  Get Account item by account_id
 * ************************** */
async function getAccountByActId(account_id) {
    try {
        const sql = `SELECT * FROM public.account 
                     WHERE account_id = $1`
        const data = await pool.query(sql, [account_id])
        return data.rows[0]
    } catch (error) {
        console.error("getAccountByActId error " + error)
    }
}

/* ***************************
 *  Update the account information by account_id
 * ************************** */
async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
    try {
        const sql = `UPDATE public.account 
                     SET  account_firstname = $1, account_lastname = $2, account_email = $3
                     WHERE account_id = $4`
        const data = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
        return data
    } catch (error) {
        console.error("updateAccount error " + error)
    }
}

/* ***************************
 *  Update the account information by account_id
 * ************************** */
async function updatePassword(account_id, account_password) {
    try {
        const sql = `UPDATE public.account 
                     SET  account_password = $1
                     WHERE account_id = $2`
        const data = await pool.query(sql, [account_password, account_id])
        return data
    } catch (error) {
        console.error("updatePassword error " + error)
    }
}

/* ***************************
 *  Add the test drive appointment
 * ************************** */
async function addTestDrive(account_id, inv_id, apt_date, apt_time) {
    try {
        const sql = "INSERT INTO appointment (account_id, inv_id, apt_date, apt_time) VALUES ($1, $2, $3, $4) RETURNING *"
        return await pool.query(sql, [account_id, inv_id, apt_date, apt_time])
    } catch (error) {
        return error.message
    }
}

/* ***************************
 *  Get the users test drive appointments
 * ************************** */
async function getUserTestDrives(account_id) {
    try {
        const sql = "SELECT a.account_id, a.account_lastname, a.account_firstname, i.inv_id, i.inv_year, i.inv_make, i.inv_model, ap.apt_id, TO_CHAR(ap.apt_date, 'Mon DD, YYYY') apt_date, TO_CHAR(ap.apt_time,'HH:MI') apt_time FROM appointment ap INNER JOIN inventory i ON i.inv_id = ap.inv_id INNER JOIN account a ON a.account_id = ap.account_id WHERE a.account_id = $1 AND apt_date >= current_date ORDER BY ap.apt_date asc,ap.apt_time asc"
        const data = await pool.query(sql, [account_id])
        return data.rows
    } catch (error) {
        return error.message
    }
}

/* ***************************
 *  Get all test drive appointments
 * ************************** */
async function getAllTestDrives() {
    try {
        const sql = "SELECT a.account_id, a.account_lastname, a.account_firstname, i.inv_id, i.inv_year, i.inv_make, i.inv_model, ap.apt_id, TO_CHAR(ap.apt_date, 'Mon DD, YYYY') apt_date, TO_CHAR(ap.apt_time,'HH:MI') apt_time FROM appointment ap INNER JOIN inventory i ON i.inv_id = ap.inv_id INNER JOIN account a ON a.account_id = ap.account_id WHERE apt_date >= current_date ORDER BY ap.apt_date asc,ap.apt_time asc"
        const data = await pool.query(sql)
        return data.rows
    } catch (error) {
        return error.message
    }
}

/* ***************************
 *  Cancel Appointment
 * ************************** */
async function cancelTestDrive(apt_id) {
    try {
        const sql = "DELETE FROM appointment WHERE apt_id = $1 RETURNING *"
        return await pool.query(sql, [apt_id])
    } catch (error) {
        return error.message
    }
}

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, getAccountByActId, checkUpdatedEmail, updateAccount, updatePassword, addTestDrive, getUserTestDrives, getAllTestDrives, cancelTestDrive };