const express = require("express");
const { userDetails, exUserDetails, ongoingEvents, addUser, removeUser, removeExternalUser } = require("../controllers/admin");
const { verifyAdmin } = require("../middlewares/adminMiddleware.js");
const router = express.Router();

router.post("/userdetails", verifyAdmin, userDetails);
router.post("/exuserdetails", verifyAdmin, exUserDetails);
router.get("/ongoingevents", ongoingEvents);
router.post("/adduser", verifyAdmin, addUser);
router.post("/removeuser", verifyAdmin, removeUser);
router.post("/removeexuser", verifyAdmin, removeExternalUser);

module.exports = router;
