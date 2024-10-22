const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require('../utilities/inventory-validation')

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory detail page based on inventory id
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId));

// Route to build inventory management page 
router.get("/", utilities.checkLogin, utilities.authorizeUserAccess, utilities.handleErrors(invController.buildInvManagement));

// Route to build inventory management add classiciation page 
router.get("/classification", utilities.checkLogin, utilities.authorizeUserAccess, utilities.handleErrors(invController.buildInvAddClassification));

// Process the classification data
router.post('/classification', utilities.checkLogin, utilities.authorizeUserAccess, invValidate.classificationRules(), invValidate.checkInventoryClassification, utilities.handleErrors(invController.addClassification))

// Route to build inventory management add inventory page 
router.get("/inventory", utilities.checkLogin, utilities.authorizeUserAccess, utilities.handleErrors(invController.buildAddInventory));

// Process the inventory data
router.post('/inventory', utilities.checkLogin, utilities.authorizeUserAccess, invValidate.inventoryRules(), invValidate.checkInventory, utilities.handleErrors(invController.addInventory))

//Get the classification ID
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

//Get the inventory ID
router.get("/edit/:inventory_id", utilities.handleErrors(invController.buildEditInventory))

//Update Inventory Item
router.post("/update/", utilities.checkLogin, utilities.authorizeUserAccess, invValidate.inventoryRules(), invValidate.checkUpdateData, utilities.handleErrors(invController.updateInventory))

//Delete Inventory Item
router.get("/delete/:inventory_id", utilities.checkLogin, utilities.authorizeUserAccess, utilities.handleErrors(invController.buildDeleteInventory))

//Delete Inventory Item post
router.post("/delete/", utilities.checkLogin, utilities.authorizeUserAccess, utilities.handleErrors(invController.deleteInventory))


module.exports = router;