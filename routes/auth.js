const express = require("express");
const router = express.Router();

const { signUp, signIn, forgotPasswordForSignIn, forgotPasswordForHomepage } = require("../controllers/auth");

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/forgotpasswordsignin", forgotPasswordForSignIn);
router.get("/forgotpasswordhomepage", verifyToken, forgotPasswordForHomepage);

module.exports = router;