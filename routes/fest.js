const express = require("express");
const {
  getList,
  register,
  unregister,
  getEvents,
  ongoingEvents,
  addUser,
  removeUser,
} = require("../controllers/fest");
const { verifyToken } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/getlist", getList);
router.post("/register", verifyToken, register);
router.post("/unregister", verifyToken, unregister);
router.post("/getevents", verifyToken, getEvents);
router.get("/ongoingevents", ongoingEvents);
router.post("/adduser", verifyToken, addUser);
router.post("/removeuser", verifyToken, removeUser);

module.exports = router;
