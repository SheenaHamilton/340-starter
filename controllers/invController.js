const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = await invModel.getClassificationName(classification_id)
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
    const inv_id = req.params.invId
    const data = await invModel.getInventoryByInvId(inv_id)
    const detailPage = await utilities.buildInventoryDetail(data)
    let nav = await utilities.getNav()
    const invName = data[0].inv_year + ' ' + data[0].inv_make + ' ' + data[0].inv_model
    res.render("./inventory/detail", {
        title: invName,
        nav,
        detailPage,
    })
}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildInvManagement = async function (req, res) {
    const nav = await utilities.getNav()
    res.render("./inventory/management", { title: "Vehicle Management", nav, errors: null, })
}

/* ***************************
 *  Build inventory management classififcation view
 * ************************** */
invCont.buildInvAddClassification = async function (req, res) {
    const nav = await utilities.getNav()
    res.render("./inventory/add-classification", { title: "Add New Vehicle Classification", nav, errors: null, })
}


/* ****************************************
*  Process add classificaation
* *************************************** */
invCont.addClassification = async function (req, res) {

    const { classification_name } = req.body

    const addClassificationResult = await invModel.addClassification(classification_name)
    let nav = await utilities.getNav()

    if (addClassificationResult) {
        req.flash(
            "notice",
            `The classification ${classification_name} was added successfully.`
        )
        res.status(201).render("./inventory/management", {
            title: "Vehicle Management",
            nav,
            errors: null,
        })
    } else {
        req.flash("notice", "There was an error adding the classification.")
        res.status(501).render("/inventory/add-classification", {
            title: "Add New Vehicle Classification",
            nav,
            errors: null,
        })
    }
}

/* ***************************
 *  Build inventory management classififcation view
 * ************************** */
invCont.buildAddInventory = async function (req, res) {
    const nav = await utilities.getNav()
    const classifications = await utilities.buildClassificationSelect()
    res.render("./inventory/add-inventory", { title: "Add New Inventory", nav, classifications, errors: null, })
}

/* ****************************************
*  Process add inventory
* *************************************** */
invCont.addInventory = async function (req, res) {

    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body

    const addInventoryResult = await invModel.addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)

    let nav = await utilities.getNav()

    if (addInventoryResult) {
        req.flash(
            "notice",
            `The inventory item ${inv_year} ${inv_make} ${inv_model}, was added successfully.`
        )
        res.status(201).render("./inventory/management", {
            title: "Vehicle Management",
            nav,
            errors: null,
        })
    } else {
        let classifications = await utilities.buildClassificationSelect()
        req.flash("notice", `There was an error adding the inventory item ${inv_year} ${inv_make} ${inv_model}.`)
        res.status(501).render("/inventory/add-inventory", {
            title: "Add New Inventory",
            nav,
            errors: null,
            classifications,
            inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id,
        })
    }
}


module.exports = invCont