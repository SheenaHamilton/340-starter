const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

async function getClassificationName(classification_id) {
    try {
        const sql = `SELECT classification_name 
                     FROM public.classification 
                     WHERE classification_id = $1`
        const data = await pool.query(sql, [classification_id])
        return data.rows[0].classification_name
    } catch (error) {
        console.error("getClassificationName error " + error)
    }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const sql = `SELECT * FROM public.inventory AS i 
                     JOIN public.classification AS c 
                     ON i.classification_id = c.classification_id 
                    WHERE i.classification_id = $1`
        const data = await pool.query(sql, [classification_id])
        return data.rows
    } catch (error) {
        console.error("getclassificationsbyid error " + error)
    }
}

/* ***************************
 *  Get inventory item by inventory_id
 * ************************** */
async function getInventoryByInvId(inv_id) {
    try {
        const sql = `SELECT * FROM public.inventory 
                     WHERE inv_id = $1`
        const data = await pool.query(sql, [inv_id])
        return data.rows[0]
    } catch (error) {
        console.error("getInventoryByInvId error " + error)
    }
}

/* ***************************
 *  Get inventory items
 * ************************** */
async function getInventory() {
    try {
        const sql = `SELECT * FROM public.inventory`
        const data = await pool.query(sql)
        return data.rows
    } catch (error) {
        console.error("getInventory error " + error)
    }
}

/* ***************************
 *  Check the classification table to see if the enterred classification exists
 * ************************** */
async function checkExistingClassification(classification_name) {
    try {
        const sql = "SELECT * FROM classification WHERE classification_name = $1"
        const classification = await pool.query(sql, [classification_name])
        return classification.rowCount
    } catch (error) {
        return error.message
    }
}

/* *****************************
*   Add new classification
* *************************** */
async function addClassification(classification_name) {
    try {
        const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
        return await pool.query(sql, [classification_name])
    } catch (error) {
        return error.message
    }
}

/* *****************************
*   Add new inventory
* *************************** */
async function addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) {
    try {
        const sql = "INSERT INTO inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles,inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *"

        //theses are temporary since there is no imge upload at the time.
        const noImageT = '/images/vehicles/no-image-tn.png'
        const noImage = '/images/vehicles/no-image.png'

        return await pool.query(sql, [inv_make, inv_model, inv_year, inv_description, noImage, noImageT, inv_price, inv_miles, inv_color, classification_id])
    } catch (error) {
        return error.message
    }
}

/* *****************************
*   Update inventory
* *************************** */
async function updateInventory(inv_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id) {
    try {
        const sql =
            "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
        const data = await pool.query(sql, [
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            classification_id,
            inv_id
        ])
        return data.rows[0]
    } catch (error) {
        console.error("model error: " + error)
    }
}

/* *****************************
*   Delete inventory
* *************************** */
async function deleteInventory(inv_id) {
    try {
        const sql =
            "DELETE FROM public.inventory WHERE inv_id = $1 RETURNING *"
        const data = await pool.query(sql, [
            inv_id
        ])
        return data
    } catch (error) {
        new Error("Delete Inventory Error")
    }
}

/* ***************************
 *  Check the classification table to see if the entered classification exists
 * ************************** */
async function checkExistingClassificationId(classification_id) {
    try {
        const sql = "SELECT * FROM classification WHERE classification_id = $1"
        const classification = await pool.query(sql, [classification_id])
        return classification.rowCount
    } catch (error) {
        return error.message
    }
}

module.exports = { getClassifications, getInventoryByClassificationId, getInventoryByInvId, checkExistingClassification, addClassification, addInventory, checkExistingClassificationId, getClassificationName, updateInventory, deleteInventory, getInventory };
