const client = require("../configs/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const handlebars = require('handlebars');
const { transporter, readHTMLFile } = require("../configs/mailer");
const { passValidator } = require("../helper/password_validator");
const { validateEmail } = require("../helper/mail_verifier");
require('dotenv').config();
const baseurl_for_user_verification = "https://zestx.netlify.app/user_verification.html?token=";

exports.changePassword = async (req, res) => {
  const userId = req.userId;
  const { oldPassword, newPassword } = req.body;

  try {
    const data = await client.query('SELECT * FROM users where user_id = $1', [userId]);

    const result = await bcrypt.compare(oldPassword, data.rows[0].password);

    if (!result) {
      return res.status(400).json({
        message: "Incorrect password!",
      });
    }

    let passwordValidate = passValidator(newPassword);

    if (!passwordValidate[0]) {
      return res.status(444).json({
        error: `${passwordValidate[1]}`,
      });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await client.query(
      'UPDATE users SET password=$1 where user_id=$2', [hash, userId]
    );

    return res.status(200).json({
      message: "password updated successfully!",
    });


  } catch (err) {
    return res.status(500).json({
      error: `${err}`,
    });
  }
}

exports.forgotPassword = async (req, res) => {

  const { password, userToken } = req.body;
  try {
    const decoded = await jwt.verify(userToken, process.env.SECRET_KEY);
    let userEmail = decoded.email;

    let passwordValidate = passValidator(password);

    if (!passwordValidate[0]) {
      return res.status(444).json({
        error: `${passwordValidate[1]}`,
      });
    }

    const hash = await bcrypt.hash(password, 10);
    await client.query(
      'UPDATE users SET password=$1 where email=$2', [hash, userEmail]
    );

    return res.status(200).json({
      message: "password updated successfully!",
    });

  } catch (err) {
    return res.status(500).json({
      error: `${err}`,
    });
  }
}

exports.getDetails = async (req, res) => {

  const userId = req.userId;
  try {
    const data = await client.query(
      'SELECT * FROM users where user_id = $1', [userId]
    );
    const userData = data.rows[0];

    return res.status(200).json({
      data: userData,
    });
  } catch (err) {
    return res.status(500).json({
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
    const data = await client.query('SELECT * FROM users where user_id = $1', [userId]);

    if (userEmail == email) {
      const result = await bcrypt.compare(password, data.rows[0].password);
      if (!result) {
        return res.status(400).json({
          message: "Incorrect password!",
        });
      }

      await client.query(
        'UPDATE users SET user_name=$1, mobile=$2 where user_id=$3', [user_name, mobile, userId]
      );

      return res.status(200).json({
        message: "details updated successfully!",
      });

    } else {
      const result = await bcrypt.compare(password, data.rows[0].password);
      if (!result) {
        return res.status(400).json({
          message: "Incorrect password!",
        });
      }

      const userData = await client.query(
        'SELECT * FROM users WHERE email=$1', [email]
      );
      const userDetails = userData.rows;

      if (userDetails.length != 0) {
        return res.status(444).json({
          error: "User already exists",
        });
      }

      if (!validateEmail(email)) {
        return res.status(404).json({
          error: "Invalid email",
        });
      }

      await client.query(
        'UPDATE users SET user_name=$1, email=$2, mobile=$3, is_verified=$4 where user_id=$5', [user_name, email, mobile, boolvalue, userId]
      );
      const token = jwt.sign(
        {
          email: email,
          userId: userId,
        },
        process.env.SECRET_KEY
      );
      var link = baseurl_for_user_verification + token;

      readHTMLFile(__dirname + '/user_verification_mail.html', function (err, html) {
        var template = handlebars.compile(html);
        var replacements = {
          username: `${user_name}`,
          tokenLink: `${link}`
        };
        var userVerificationMail = template(replacements);
        let mailOptions = {
          from: "verify.zestx@gmail.com",
          to: `${email}`,
          subject: "Confirmation mail",
          html: userVerificationMail,
        };

        transporter.sendMail(mailOptions);
      });

      return res.status(222).json({
        message: "details updated successfully!",
        token: `${token}`,
      });

    }
  } catch (err) {
    return res.status(500).json({
      error: `${err}`,
    });
  }
};

exports.verifyUser = async (req, res) => {
  const userToken = req.userToken;
  let boolvalue = true;

  try {
    const decoded = await jwt.verify(userToken, process.env.SECRET_KEY);
    let userId = decoded.userId;
    await client.query(
      'UPDATE users SET is_verified=$1 where user_id=$2', [boolvalue, userId]
    );

    return res.status(200).json({
      message: "User verified successfully!",
    });

  } catch (err) {
    return res.status(500).json({
      error: `${err}`,
    });
  }
};

