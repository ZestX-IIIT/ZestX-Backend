const client = require("../configs/database");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

var nodemailer = require("nodemailer");
const baseurl_for_user_verification =
  "https://whispering-ridge-40670.herokuapp.com/user/verifyuser/";

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "verify.zestx@gmail.com",
    pass: "opznfpdfkndofxre",
  },
});

exports.getDetails = (req, res) => {
  client
    .query(`SELECT * FROM users where email = '${req.email}'`)
    .then((data) => {
      const userData = data.rows;

      const filteredData = userData.map((item) => {
        return {
          userId: item.user_id,
          userName: item.user_name,
          email: item.email,
          mobile: item.mobile,
          festIds: item.fest_id,
          isAdmin: item.is_admin,
          isVerified: item.is_verified,
        };
      });

      res.status(200).json({
        data: filteredData,
      });
    })
    .catch((err) => {
      res.status(400).json({
        error: `44${err}`,
      });
    });
};

exports.updateDetails = (req, res) => {
  const boolvalue = false;
  const userEmail = req.email;
  const userId = req.userId;
  const { user_name, email, password, mobile } = req.body;

  if (userEmail == email) {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        res.status(500).json({
          error: "Internal server error",
        });
      } else {
        client
          .query(
            `UPDATE users SET user_name='${user_name}', password='${hash}', mobile='${mobile}' where email='${userEmail}'`
          )
          .then((data) => {
            res.status(200).json({
              message: "updated successfully!",
              data: `${data}`,
            });
          })
          .catch((err2) => {
            res.status(400).json({
              error: `22${err2}`,
            });
          });
      }
    });
  } else {
    bcrypt.hash(password, 10, (err3, hash) => {
      if (err3) {
        res.status(500).json({
          error: `33${err3}`,
        });
      } else {
        client
          .query(
            `UPDATE users SET user_name='${user_name}', email='${email}', password='${hash}', mobile='${mobile}', is_verified='${boolvalue}' where user_id='${userId}'`
          )
          .then((data) => {
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
              if (error) {
                console.log(error);
              } else {
                console.log("Email sent: " + info.response);
              }
            });
            res.status(222).json({
              message: "updated successfully!",
              token: `${token}`,
            });
          })
          .catch((err1) => {
            res.status(400).json({
              error: `11${err1}`,
            });
          });
      }
    });
  }
};

exports.verifyUser = (req, res) => {
  const userToken = req.userId;

  var userEmail = jwt.decode(userToken).email;
  var boolvalue = true;

  client
    .query(
      `UPDATE users SET is_verified=${boolvalue} where email='${userEmail}'`
    )
    .then((data) => {
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
    })
    .catch((err2) => {
      res.status(400).json({
        error: `${err2}`,
      });
    });
};
