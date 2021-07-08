const nodemailer = require("nodemailer");
const fs = require('fs');
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

const readHTMLFile = function (path, callback) {
    fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
        callback(null, html);
    });
};

module.exports = { transporter, supporter, readHTMLFile };