const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const client = require("../configs/database");
require("dotenv").config();
var nodemailer = require("nodemailer");

const baseurl_for_user_verification =
  "https://whispering-ridge-40670.herokuapp.com/user/verifyuser/";

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "verify.zestx@gmail.com",
    pass: process.env.VERIFY_PASSWORD,
  },
});

exports.signUp = async (req, res) => {
  const { user_name, email, password, mobile } = req.body;

  try {
    const data = await client.query(
      `SELECT *FROM users where email = '${email}'`
    );
    const userData = data.rows;

    if (userData.length != 0) {
      res.status(400).json({
        error: "User already exists",
      });
    } else {
      bcrypt.hash(password, 10, async (err, hash) => {
        const user = {
          username: user_name,
          email,
          password: hash,
          mobile,
        };

        await client.query(
          `INSERT INTO users (user_name, email, password, mobile, is_verified, is_admin) VALUES ('${user.username}', '${user.email}', '${user.password}', '${user.mobile}', false, false);`
        );
        const data1 = await client.query(
          `SELECT * FROM users where email = '${user.email}'`
        );
        const userId = data1.rows[0].user_id;

        const token = jwt.sign(
          {
            email: email,
            userId: userId,
          },
          "" + process.env.SECRET_KEY
        );

        var link = baseurl_for_user_verification + token;

        var mailOptions = {
          from: "verify.zestx@gmail.com",
          to: `${user.email}`,
          subject: "Confirmation mail",
          html: `click <a href=${link}>here</a> to confirm your mail`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          console.log("Email sent: " + info.response);
        });
        res.status(200).json({
          message: "User added successfully",
          data: `${token}`,
        });
      });
    }
  } catch (err1) {
    res.status(500).json({
      error: `${err1}`,
    });
  }
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const data = await client.query(
      `SELECT *FROM users where email = '${email}'`
    );

    const userData = data.rows;

    if (userData.length == 0) {
      res.status(400).json({
        error: "User does not exists, Please sign up!",
      });
    } else {
      const userId = data.rows[0].user_id;
      bcrypt.compare(password, userData[0].password, (err, result) => {
        if (result) {
          const token = jwt.sign(
            {
              email: email,
              userId: userId,
            },
            "" + process.env.SECRET_KEY
          );

          res.status(200).json({
            message: "User signed in successfully",
            token: token,
          });
        } else {
          res.status(444).json({
            error: "Enter correct password!",
          });
        }
      });
    }
  } catch (err1) {
    res.status(500).json({
      error: `${err1}`,
    });
  }
};
