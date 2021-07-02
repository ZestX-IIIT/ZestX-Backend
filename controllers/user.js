const client = require("../configs/database");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();

var nodemailer = require("nodemailer");
const baseurl_for_user_verification =
  "https://whispering-ridge-40670.herokuapp.com/user/verifyuser/";

var supporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "help.zestx@gmail.com",
    pass: process.env.HELP_PASSWORD,
  },
});

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "verify.zestx@gmail.com",
    pass: process.env.VERIFY_PASSWORD,
  },
});

exports.forgotPasswordForHomepage = (req, res) => {

  let userEmail = req.email;
  let password = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
  let passwordString = password.toString();

  try {
    bcrypt.hash(passwordString, 10, async function (err, hash) {
      await client.query(
        `UPDATE users SET password='${hash}' where email='${userEmail}'`
      );
    });
    var mailOptions = {
      from: "help.zestx@gmail.com",
      to: `${userEmail}`,
      subject: "Forgot Password",
      html: `Your new password is <b>${passwordString}</b>. You can change it using change password option in profile section.`,
    };

    supporter.sendMail(mailOptions, function (error, info) {
      console.log("Email sent: " + info.response);
    });

    res.status(200).json({
      message: "new password sent successfully!",
    });

  } catch (error) {
    res.status(500).json({
      error: `${error}`,
    });
  }

}

exports.forgotPasswordForSignIn = async (req, res) => {

  let userEmail = req.body.email;
  let password = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
  let passwordString = password.toString();

  try {
    const data = await client.query(
      `SELECT * FROM users WHERE email='${userEmail}'`
    );
    if (data.rows.length == 0) {
      res.status(400).json({
        message: "Enter valid email-id!",
      });
    } else {
      bcrypt.hash(passwordString, 10, async function (err, hash) {
        await client.query(
          `UPDATE users SET password='${hash}' where email='${userEmail}'`
        );
      });
      var mailOptions = {
        from: "help.zestx@gmail.com",
        to: `${userEmail}`,
        subject: "New Password",
        html: `Your new password is <b>${passwordString}</b>. You can change it using change password option in profile section.`,
      };

      supporter.sendMail(mailOptions, function (error, info) {
        console.log("Email sent: " + info.response);
      });

      res.status(200).json({
        message: "new password sent successfully!",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: `${error}`,
    });
  }

}

exports.changePassword = async (req, res) => {
  const userId = req.userId;
  const { oldPassword, newPassword } = req.body;

  try {
    const data = await client.query(`SELECT * FROM users WHERE user_id='${userId}'`);

    bcrypt.compare(oldPassword, data.rows[0].password, function (err, result) {
      if (result) {
        bcrypt.hash(newPassword, 10, async function (err, hash) {
          await client.query(
            `UPDATE users SET password='${hash}' where user_id='${userId}'`
          );

          res.status(200).json({
            message: "password updated successfully!",
          });
        });
      } else {
        res.status(400).json({
          message: "Incorrect password!",
        });
      }
    });
  } catch (err1) {
    res.status(500).json({
      error: `${err1}`,
    });
  }
}

exports.getDetails = async (req, res) => {
  try {
    const data = await client.query(
      `SELECT * FROM users where user_id = '${req.userId}'`
    );
    const userData = data.rows[0];

    res.status(200).json({
      data: userData,
    });
  } catch (err) {
    res.status(500).json({
      error: `${err}`,
    });
  }
};

exports.userDetails = async (req, res) => {
  const adminEmail = req.email;

  const idsArray = req.body.ids.split(",");
  var usersArray = [];
  let index = 0;
  try {
    const data1 = await client.query(
      `SELECT * FROM users where email = '${adminEmail}'`
    );

    if (isEligible3(data1)) {
      for (const id of idsArray) {
        const data = await client.query(
          `SELECT * FROM users where user_id = '${id}'`
        );
        let userData = data.rows[0];

        usersArray[index] = userData;
        index++;
      }
      res.status(200).json({
        data: usersArray,
      });
    } else {
      res.status(400).json({
        err: "You have no access!",
      });
    }
  } catch (err) {
    res.status(500).json({
      error: `${err}`,
    });
  }
};

exports.exUserDetails = async (req, res) => {
  const adminEmail = req.email;

  const idsArray = req.body.ids.split(",");
  var usersArray = [];
  let index = 0;
  try {
    const data1 = await client.query(
      `SELECT * FROM users where email = '${adminEmail}'`
    );

    if (isEligible3(data1)) {
      for (const id of idsArray) {
        const data = await client.query(
          `SELECT * FROM external_users where userid = '${id}'`
        );
        let userData = data.rows[0];

        usersArray[index] = userData;
        index++;
      }
      res.status(200).json({
        data: usersArray,
      });
    } else {
      res.status(400).json({
        err: "You have no access!",
      });
    }
  } catch (err) {
    res.status(500).json({
      error: `${err}`,
    });
  }
};

exports.updateDetails = async (req, res) => {
  const boolvalue = false;
  const userEmail = req.email;
  const userId = req.userId;
  const { user_name, email, password, mobile } = req.body;
  try {
    const data = await client.query(`SELECT * FROM users WHERE user_id='${userId}'`);

    if (userEmail == email) {
      bcrypt.compare(password, data.rows[0].password, async function (err, result) {
        if (result) {
          await client.query(
            `UPDATE users SET user_name='${user_name}', mobile='${mobile}' where user_id='${userId}'`
          );

          res.status(200).json({
            message: "details updated successfully!",
          });
        } else {
          res.status(400).json({
            message: "Incorrect password!",
          });
        }
      });
    } else {
      bcrypt.compare(password, data.rows[0].password, async function (err, result) {
        if (result) {
          await client.query(
            `UPDATE users SET user_name='${user_name}', email='${email}', mobile='${mobile}', is_verified='${boolvalue}' where user_id='${userId}'`
          );
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
            to: `${email}`,
            subject: "Confirmation mail",
            html: `click <a href=${link}>here</a> to confirm your mail`,
          };

          transporter.sendMail(mailOptions, function (error, info) {
            console.log("Email sent: " + info.response);
          });
          res.status(222).json({
            message: "details updated successfully!",
            token: `${token}`,
          });
        } else {
          res.status(400).json({
            message: "Incorrect password!",
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

exports.verifyUser = async (req, res) => {
  const userToken = req.userToken;

  var userId = jwt.decode(userToken).userId;
  var boolvalue = true;

  try {
    await client.query(
      `UPDATE users SET is_verified=${boolvalue} where user_id='${userId}'`
    );
    var options = {
      root: path.join(__dirname),
    };

    var fileName = "user_verified.html";
    res.status(200).sendFile(fileName, options, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Sent:", fileName);
      }
    });
  } catch (err) {
    res.status(500).json({
      error: `${err2}`,
    });
  }
};

function isEligible3(userData) {
  const boolvalue = userData.rows[0].is_admin;

  if (!boolvalue) return false;

  return true;
};