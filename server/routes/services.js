// server/routes/services.js
// Routes for managing product services, including CRUD operations and image uploads

const express = require("express");
const router = express.Router();
const {
    getAllServices,
    getServiceById,
    updateService,
    uploadServiceImage
} = require("../controller/servicesController");
const upload = require("../middleware/serviceImageUpload");

router.get("/", getAllServices);

const { createService, deleteService } = require("../controller/servicesController");
router.post("/", createService);
router.delete("/:id", deleteService);

router.post("/upload", upload.single("image"), uploadServiceImage);

router.get("/:id", getServiceById);

router.put("/:id", updateService);

module.exports = router;
