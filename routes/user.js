const express = require("express");
const {
  getDetails,
  updateDetails,
  verifyUser,
  userDetails,
  exUserDetails,
} = require("../controllers/user");
const { verifyToken } = require("../middlewares/authMiddleware");
const { userIdParam } = require("../middlewares/userMiddleware");
const router = express.Router();

router.param("userToken", userIdParam);

router.get("/getdetails", verifyToken, getDetails);
router.post("/updatedetails", verifyToken, updateDetails);
router.post("/userdetails", verifyToken, userDetails);
router.post("/exuserdetails", verifyToken, exUserDetails);
router.get("/verifyuser/:userToken", verifyUser);

module.exports = router;
