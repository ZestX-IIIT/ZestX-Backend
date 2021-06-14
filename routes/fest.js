const express = require("express");
const {
  getList,
  register,
  unregister,
  getEvents,
} = require("../controllers/fest");
const { verifyToken } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/getlist", getList);
router.post("/register", verifyToken, register);
router.post("/unregister", verifyToken, unregister);
router.post("/getevents", verifyToken, getEvents);

module.exports = router;
