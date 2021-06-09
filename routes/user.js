const express = require("express");
const {getDetails, updateDetails, verifyUser} = require("../controllers/user");
const { verifyToken } = require("../middlewares/authMiddleware");
const { userIdParam } = require("../middlewares/userMiddleware");
const router = express.Router();

router.param("userId", userIdParam);

router.get("/getdetails", verifyToken, getDetails);
router.post("/updatedetails", verifyToken, updateDetails);
router.get("/verifyuser/:userId", verifyUser);

module.exports = router;