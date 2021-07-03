const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "verify.zestx@gmail.com",
        pass: process.env.VERIFY_PASSWORD,
    },
});

const supporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "help.zestx@gmail.com",
        pass: process.env.HELP_PASSWORD,
    },
});

module.exports = { transporter, supporter };