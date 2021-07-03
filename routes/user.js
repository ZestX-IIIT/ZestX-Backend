const express = require("express");
const {
  getDetails,
  updateDetails,
  verifyUser,
  changePassword,
  forgotPassword
} = require("../controllers/user");
const { verifyToken } = require("../middlewares/authMiddleware");
const { userIdParam } = require("../middlewares/userMiddleware");
const router = express.Router();

router.param("userToken", userIdParam);

router.get("/getdetails", verifyToken, getDetails);
router.post("/updatedetails", verifyToken, updateDetails);
router.post("/changepassword", verifyToken, changePassword);
router.get("/verifyuser/:userToken", verifyUser);
router.post("/forgotpassword", forgotPassword);

module.exports = router;
