const { header } = require("express-validator")
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
    const headerLinks = await utilities.getAccountHeaderLinks(res.locals)

    const className = await invModel.getClassificationName(classification_id)
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        headerLinks,
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
    const headerLinks = await utilities.getAccountHeaderLinks(res.locals)
    const invName = data.inv_year + ' ' + data.inv_make + ' ' + data.inv_model
    res.render("./inventory/detail", {
        title: invName,
        nav,
        headerLinks,
        detailPage,
    })
}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildInvManagement = async function (req, res) {
    const nav = await utilities.getNav()
    const headerLinks = await utilities.getAccountHeaderLinks(res.locals)
    const classifications = await utilities.buildClassificationSelect()

    res.render("./inventory/management", {
        title: "Vehicle Management",
        nav,
        headerLinks,
        classifications,
        errors: null,
    })

}

/* ***************************
 *  Build inventory management classififcation view
 * ************************** */
invCont.buildInvAddClassification = async function (req, res) {
    const nav = await utilities.getNav()
    const headerLinks = await utilities.getAccountHeaderLinks(res.locals)
    res.render("./inventory/add-classification", {
        title: "Add New Vehicle Classification",
        nav,
        headerLinks,
        errors: null,
    })
}


/* ****************************************
*  Process add classificaation
* *************************************** */
invCont.addClassification = async function (req, res) {

    const { classification_name } = req.body

    const addClassificationResult = await invModel.addClassification(classification_name)
    let nav = await utilities.getNav()
    const headerLinks = await utilities.getAccountHeaderLinks(res.locals)
    const classifications = await utilities.buildClassificationSelect()

    if (addClassificationResult) {
        req.flash(
            "notice",
            `The classification ${classification_name} was added successfully.`
        )
        res.status(201).render("./inventory/management", {
            title: "Vehicle Management",
            nav,
            headerLinks,
            classifications,
            errors: null,
        })
    } else {
        req.flash("notice", "There was an error adding the classification.")
        res.status(501).render("/inventory/add-classification", {
            title: "Add New Vehicle Classification",
            nav,
            headerLinks,
            errors: null,
        })
    }
}

/* ***************************
 *  Build inventory management classififcation view
 * ************************** */
invCont.buildAddInventory = async function (req, res) {
    const nav = await utilities.getNav()
    const headerLinks = await utilities.getAccountHeaderLinks(res.locals)
    const classifications = await utilities.buildClassificationSelect()
    res.render("./inventory/add-inventory", {
        title: "Add New Inventory",
        nav,
        headerLinks,
        classifications,
        errors: null,
    })
}

/* ****************************************
*  Process add inventory
* *************************************** */
invCont.addInventory = async function (req, res) {

    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body

    const addInventoryResult = await invModel.addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
    let classifications = await utilities.buildClassificationSelect()
    let nav = await utilities.getNav()
    const headerLinks = await utilities.getAccountHeaderLinks(res.locals)

    if (addInventoryResult) {
        req.flash(
            "notice",
            `The inventory item ${inv_year} ${inv_make} ${inv_model}, was added successfully.`
        )
        res.status(201).render("./inventory/management", {
            title: "Vehicle Management",
            nav,
            headerLinks,
            classifications,
            errors: null,
        })
    } else {
        req.flash("error", `There was an error adding the inventory item ${inv_year} ${inv_make} ${inv_model}.`)
        res.status(501).render("./inventory/add-inventory", {
            title: "Add New Inventory",
            nav,
            headerLinks,
            errors: null,
            classifications,
            inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id,
        })
    }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id) {
        return res.json(invData)
    } else {
        next(new Error("No data returned"))
    }
}

invCont.buildEditInventory = async function (req, res) {
    const inventory_id = parseInt(req.params.inventory_id)
    const nav = await utilities.getNav()
    const headerLinks = await utilities.getAccountHeaderLinks(res.locals)
    const itemData = await invModel.getInventoryByInvId(inventory_id)
    const classifications = await utilities.buildClassificationSelect(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    res.render("./inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        headerLinks,
        classifications,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_description: itemData.inv_description,
        inv_image: itemData.inv_image,
        inv_thumbnail: itemData.inv_thumbnail,
        inv_price: itemData.inv_price,
        inv_miles: itemData.inv_miles,
        inv_color: itemData.inv_color,
        classification_id: itemData.classification_id,
    })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
    let nav = await utilities.getNav()
    const headerLinks = await utilities.getAccountHeaderLinks(res.locals)
    const { inv_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id, } = req.body

    const updateResult = await invModel.updateInventory(inv_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id)

    if (updateResult) {
        const itemName = updateResult.inv_make + " " + updateResult.inv_model
        req.flash("notice", `The ${itemName} was successfully updated.`)
        res.redirect("/inv/")
    } else {
        const classifications = await utilities.buildClassificationSelect(classification_id)
        const itemName = `${inv_make} ${inv_model}`
        req.flash("error", "Sorry, the insert failed.")
        res.status(501).render("inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            headerLinks,
            classificationSelect: classifications,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        })
    }
}


/* ***************************
 *  Build View: Delete Inventory Data
 * ************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
    const inventory_id = parseInt(req.params.inventory_id)
    const nav = await utilities.getNav()
    const headerLinks = await utilities.getAccountHeaderLinks(res.locals)
    const itemData = await invModel.getInventoryByInvId(inventory_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    res.render("./inventory/delete-confirm", {
        title: "Delete " + itemName,
        nav,
        headerLinks,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_price: itemData.inv_price,
    })
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
    let nav = await utilities.getNav()
    const headerLinks = await utilities.getAccountHeaderLinks(res.locals)
    const { inv_id, inv_make, inv_model, inv_price, inv_year } = req.body

    const deleteResult = await invModel.deleteInventory(inv_id)
    const itemName = `${inv_make} ${inv_model}`

    if (deleteResult) {
        req.flash("notice", `The vehicle: ${itemName} was successfully deleted.`)
        res.redirect("/inv/")
    } else {
        req.flash("error", "Sorry, the delete failed.")
        res.status(501).render("inventory/delete-confirm", {
            title: "Delete " + itemName,
            nav,
            headerLinks,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_price,
        })
    }
}

module.exports = invCont