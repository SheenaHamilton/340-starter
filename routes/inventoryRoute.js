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
router.get("/", utilities.handleErrors(invController.buildInvManagement));

// Route to build inventory management add classiciation page 
router.get("/classification", utilities.handleErrors(invController.buildInvAddClassification));

// Process the classification data
router.post('/classification', invValidate.classificationRules(), invValidate.checkInventoryClassification, utilities.handleErrors(invController.addClassification))

// Route to build inventory management add inventory page 
router.get("/inventory", utilities.handleErrors(invController.buildAddInventory));

// Process the inventory data
router.post('/inventory', invValidate.inventoryRules(), invValidate.checkInventory, utilities.handleErrors(invController.addInventory))

module.exports = router;