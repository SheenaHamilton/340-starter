const invModel = require("../models/inventory-model")
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
Util.buildInventoryDetail = async function (data) {
    let detailPage
    if (data.length > 0) {
        vehicle = data[0]
        detailPage = `
        <div id='inv_details'>
            <div id='inv_photos'>
                <img src='${vehicle.inv_image}' alt='Image of ${vehicle.inv_make}  ${vehicle.inv_model}'/>
            </div>
            <div id="inv_desc"> 
                <h2>${vehicle.inv_year} ${vehicle.inv_make}  ${vehicle.inv_model}</h2>
                <section id="price">
                    <p>Own it for <span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span></p>
                </section>
                <section id="desc">
                    <p>Description: </p>
                    <p>${vehicle.inv_description}</p>
                </section>
                <section id="details">
                <p>Odometer:  <span>${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)} miles</span></p>
                <p>Exterior Color: <span>${vehicle.inv_color}</span></p>
                </section>           
            </div >
        </div>`

    } else {
        detailPage = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return detailPage
}

/* ************************
 * Constructs the Classification HTML select
 ************************** */
Util.buildClassificationSelect = async function (req, res, next) {
    let data = await invModel.getClassifications()
    let selectlist = `<label class='top' for="classification_id">Classification</label>
                      <select name="classification_id" id="classification_id" required>
                      <option value = "">Choose Classification</option>`
    data.rows.forEach((row) => {
        selectlist += `<option value="${row.classification_id}">${row.classification_name}</option>`
    })
    selectlist += `</select>`
    return selectlist
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util