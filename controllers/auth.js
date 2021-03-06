const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const client = require("../configs/database");
const handlebars = require('handlebars');
require("dotenv").config();
const { transporter, supporter, readHTMLFile } = require("../configs/mailer");
const { passValidator } = require("../helper/password_validator");
const { validateEmail } = require("../helper/mail_verifier");

const baseurl_for_user_verification = "https://zestx.netlify.app/user_verification.html?token=";
const baseurl_for_reset_password = "https://zestx.netlify.app/reset_password.html?token=";

exports.forgotPasswordForSignIn = async (req, res) => {
  let userEmail = req.body.email;

  if (!validateEmail(userEmail)) {
    return res.status(404).json({
      error: "Invalid email",
    });
  }

  try {
    const data = await client.query(
      'SELECT * FROM users WHERE email=$1', [userEmail]
    );

    if (data.rows.length == 0) {
      return res.status(400).json({
        message: "Invalid email!",
      });
    }

    const token = jwt.sign(
      {
        email: userEmail,
      },
      process.env.SECRET_KEY
    );

    let link = baseurl_for_reset_password + token;

    readHTMLFile(__dirname + '/forgot_password_mail.html', function (err, html) {
      var template = handlebars.compile(html);
      var replacements = {
        tokenLink: `${link}`
      };
      var resetPasswordMail = template(replacements);
      let mailOptions = {
        from: "help.zestx@gmail.com",
        to: `${userEmail}`,
        subject: "Reset Password",
        html: resetPasswordMail,
      };

      supporter.sendMail(mailOptions);
    });

    return res.status(200).json({
      message: "Mail Sent Successfully!",
    });

  } catch (error) {
    return res.status(500).json({
      error: `${error}`,
    });
  }
}

exports.signUp = async (req, res) => {
  const { user_name, email, password, mobile } = req.body;

  try {
    const userData = await client.query(
      'SELECT * FROM users WHERE email=$1', [email]
    );
    const userDetails = userData.rows;

    if (userDetails.length != 0) {
      return res.status(400).json({
        error: "User already exists",
      });
    }

    if (!validateEmail(email)) {
      return res.status(404).json({
        error: "Invalid email",
      });
    }

    let passwordValidate = passValidator(password);

    if (!passwordValidate[0]) {
      return res.status(444).json({
        error: `${passwordValidate[1]}`,
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = {
      username: user_name,
      email,
      password: hash,
      mobile,
    };

    await client.query(
      'INSERT INTO users (user_name, email, password, mobile, is_verified, is_admin) VALUES ($1, $2, $3, $4, false, false)', [user.username, user.email, user.password, user.mobile]
    );
    const currentUserData = await client.query(
      'SELECT * FROM users where email=$1', [user.email]
    );
    const userId = currentUserData.rows[0].user_id;

    const token = jwt.sign(
      {
        email: email,
        userId: userId,
      },
      process.env.SECRET_KEY
    );

    let link = baseurl_for_user_verification + token;

    readHTMLFile(__dirname + '/user_verification_mail.html', function (err, html) {
      var template = handlebars.compile(html);
      var replacements = {
        username: `${user_name}`,
        tokenLink: `${link}`
      };
      var userVerificationMail = template(replacements);
      let mailOptions = {
        from: "verify.zestx@gmail.com",
        to: `${user.email}`,
        subject: "Confirmation mail",
        html: userVerificationMail,
      };

      transporter.sendMail(mailOptions);

    });

    return res.status(200).json({
      message: "User added successfully",
      data: `${token}`,
    });

  } catch (err) {
    return res.status(500).json({
      error: `${err}`,
    });
  }
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userData = await client.query(
      'SELECT * FROM users WHERE email=$1', [email]
    );

    const userDetails = userData.rows;

    if (userDetails.length == 0) {
      return res.status(400).json({
        error: "User does not exists, Please sign up!",
      });
    }

    if (!validateEmail(email)) {
      return res.status(404).json({
        error: "Invalid email",
      });
    }

    const userId = userData.rows[0].user_id;

    const result = await bcrypt.compare(password, userDetails[0].password);
    if (!result) {
      return res.status(444).json({
        error: "Incorrect password!",
      });
    }

    const token = jwt.sign(
      {
        email: email,
        userId: userId,
      },
      process.env.SECRET_KEY
    );

    return res.status(200).json({
      message: "User signed in successfully",
      token: token,
    });

  } catch (err) {
    return res.status(500).json({
      error: `${err}`,
    });
  }
};

