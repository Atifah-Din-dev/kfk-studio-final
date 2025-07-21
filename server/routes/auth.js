// server/routes/auth.js
// Routes for customer authentication, including registration, login, and profile management

const express = require("express");
const router = express.Router();
const {
    register,
    login,
    forgotPassword,
    resetPassword,
    getCustomerProfile,
    updateProfile,
    changePassword,
    uploadProfileImage
} = require("../controller/authController");
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../uploads/profile-images"));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, req.customer.id + "_" + Date.now() + ext);
    }
});
const upload = multer({ storage });

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/profile", auth, getCustomerProfile);
router.put("/profile", auth, updateProfile);
router.put("/change-password", auth, changePassword);
router.post("/profile-image", auth, upload.single("profileImage"), uploadProfileImage);

module.exports = router;
