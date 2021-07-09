const express = require("express");
const router = express.Router();

const { signUp, signIn, forgotPasswordForSignIn } = require("../controllers/auth");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/forgotpasswordsignin", forgotPasswordForSignIn);

module.exports = router;