const express = require("express");
const {
  getList,
  register,
  unregister,
} = require("../controllers/fest");
const { verifyToken } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/getlist", verifyToken, getList);
router.post("/register", verifyToken, register);
router.post("/unregister", verifyToken, unregister);

module.exports = router;
