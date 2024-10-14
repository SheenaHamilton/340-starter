const inventoryModel = require("../models/inventory-model")
const utilities = require(".")

const { body, validationResult } = require("express-validator")
const validate = {}


/*  **********************************
  *  Add Classification Validation Rules
  * ********************************* */
validate.classificationRules = () => {
    return [
        // valid classification name is required
        body("classification_name")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Please provide a classification name.") // on error this message is sent.
            .matches(/^[a-zA-Z0-9]+$/)
            .withMessage('The classification name must be an alphanumeric value with no spaces.') // on error this message is sent.
            .custom(async (classification_name) => {
                const classificationExists = await inventoryModel.checkExistingClassification(classification_name)
                if (classificationExists) {
                    throw new Error(`The classification: ${classification_name}, already exists. Please use a different name.`)
                }
            }),
    ]
}

/* ******************************
 * Check data and return errors or continue
 * ***************************** */
validate.checkInventoryClassification = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            errors,
            title: "Add New Vehicle Classification",
            nav,
            classification_name,
        })
        return
    }
    next()
}


/*  **********************************
  *  Add Inventory Validation Rules
  * ********************************* */
validate.inventoryRules = () => {
    return [
        // valid inv_make is required
        body("inv_make")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Please provide the make."), // on error this message is sent.

        // valid inv_model is required
        body("inv_model")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Please provide the model."), // on error this message is sent.

        // valid inv_year is required
        body("inv_year")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 4 })
            .isInt()
            .withMessage("Please provide the year (YYYY)."), // on error this message is sent.

        // valid inv_descriptionis required
        body("inv_description")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Please provide a description for the vehicle."), // on error this message is sent.

        // valid inv_image is required
        body("inv_image")
            .trim()
            .escape()
            .notEmpty()
            //.matches(/^[a-z_-\s0-9.]+$/)
            .isLength({ min: 2 })
            .withMessage("Please provide the image path."), // on error this message is sent.

        // valid inv_thumbnailis required
        body("inv_thumbnail")
            .trim()
            .escape()
            .notEmpty()
            //.matches(/^[a-z_-\s0-9.]+$/)
            .isLength({ min: 2 })
            .withMessage("Please provide the thumbnail path."), // on error this message is sent.

        // valid inv_price is required
        body("inv_price")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .withMessage("Please provide the vehicle price."), // on error this message is sent.

        // valid inv_miles is required
        body("inv_miles")
            .trim()
            .escape()
            .notEmpty()
            .isInt()
            .withMessage("Please provide the current odometer in miles."), // on error this message is sent.

        // valid inv_color is required
        body("inv_color")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Please provide the vehicle color."), // on error this message is sent.

        // valid classification is required
        body("classification_id")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide the vehicle classification.") // on error this message is sent.
            .custom(async (clasification_id) => {
                const classificationIDExists = await inventoryModel.checkExistingClassificationId(clasification_id)
                if (!classificationIDExists) {
                    throw new Error(`The classification does not exists. Please use a different selection.`)
                }
            })
    ]
}

/* ******************************
 * Check data and return errors or continue
 * ***************************** */
validate.checkInventory = async (req, res, next) => {
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classifications = await utilities.buildClassificationSelect()
        res.render("inventory/add-inventory", {
            errors,
            title: "Add New Inventory",
            nav,
            classifications,
            inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
        })
        return
    }
    next()
}

module.exports = validate