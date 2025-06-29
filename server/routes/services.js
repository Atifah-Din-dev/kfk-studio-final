const express = require("express");
const router = express.Router();
const {
    getAllServices,
    getServiceById
} = require("../controller/servicesController");

// Public routes
router.get("/", getAllServices);
router.get("/:id", getServiceById);

module.exports = router;