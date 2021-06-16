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
    res.status(400).json({
      error: `4${err}`,
    });
  }
};

exports.getuserdetailsbyids = async (req, res) => {
  // try {
  //   const data = await client.query(
  //     `SELECT * FROM users where user_id = '${req.userId}'`
  //   );
  //   const userData = data.rows[0];

  //   res.status(200).json({
  //     data: userData,
  //   });
  // } catch (err) {
  //   res.status(400).json({
  //     error: `4${err}`,
  //   });
  // }

  const idsArray = req.body.ids.split(",");
  var usersArray = [];
  let index = 0;

  try {
    idsArray.forEach(async (id) => {
      const data = await client.query(
        `SELECT * FROM users where user_id = '${id}'`
      );
      const userData = data.rows[0];
      usersArray[index] = userData;
      index++;
    })
    res.status(200).json({
      data: usersArray,
    });

  } catch (err) {
    res.status(400).json({
      error: `1${err}`,
    });
  };
};


exports.updateDetails = (req, res) => {
  const boolvalue = false;
  const userEmail = req.email;
  const userId = req.userId;
  const { user_name, email, password, mobile } = req.body;

  if (userEmail == email) {
    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        res.status(500).json({
          error: `1${err}`,
        });
      } else {
        try {
          await client.query(
            `UPDATE users SET user_name='${user_name}', password='${hash}', mobile='${mobile}' where email='${userEmail}'`
          );

          res.status(200).json({
            message: "details updated successfully!",
          });
        } catch (err1) {
          res.status(400).json({
            error: `2${err1}`,
          });
        }
      }
    });
  } else {
    bcrypt.hash(password, 10, async (err2, hash) => {
      if (err2) {
        res.status(500).json({
          error: `3${err2}`,
        });
      } else {
        try {
          await client.query(
            `UPDATE users SET user_name='${user_name}', email='${email}', password='${hash}', mobile='${mobile}', is_verified='${boolvalue}' where user_id='${userId}'`
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
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });
          res.status(222).json({
            message: "details updated successfully!",
            token: `${token}`,
          });
        } catch (err3) {
          res.status(400).json({
            error: `4${err3}`,
          });
        }
      }
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
    res.status(400).json({
      error: `${err2}`,
    });
  }
};
