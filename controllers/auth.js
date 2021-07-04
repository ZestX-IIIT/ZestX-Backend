const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const client = require("../configs/database");
require("dotenv").config();
const { transporter, supporter } = require("../configs/mailer");

const baseurl_for_user_verification = "https://zestx.netlify.app/general/user_verification.html?token=";
const baseurl_for_reset_password = "https://zestx.netlify.app/general/reset_password.html?token=";

exports.forgotPasswordForHomepage = (req, res) => {
  let userEmail = req.email;
  mailSenderToSetPassword(userEmail, res);
}

exports.forgotPasswordForSignIn = async (req, res) => {
  let userEmail = req.body.email;

  try {
    const data = await client.query(
      'SELECT * FROM users WHERE email=$1', [userEmail]
    );
    if (data.rows.length == 0)
      return res.status(400).json({
        message: "Enter valid email-id!",
      });

    mailSenderToSetPassword(userEmail, res);

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

    if (userDetails.length != 0)
      return res.status(400).json({
        error: "User already exists",
      });

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

    let mailOptions = {
      from: "verify.zestx@gmail.com",
      to: `${user.email}`,
      subject: "Confirmation mail",
      html: `click <a href=${link}>here</a> to confirm your mail`,
    };

    await transporter.sendMail(mailOptions);

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

    if (userDetails.length == 0)
      return res.status(400).json({
        error: "User does not exists, Please sign up!",
      });

    const userId = userData.rows[0].user_id;

    const result = await bcrypt.compare(password, userDetails[0].password);
    if (!result)
      return res.status(444).json({
        error: "Incorrect password!",
      });

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

async function mailSenderToSetPassword(email, res) {
  try {
    const token = jwt.sign(
      {
        email: email,
      },
      process.env.SECRET_KEY
    );

    let link = baseurl_for_reset_password + token;

    let mailOptions = {
      from: "help.zestx@gmail.com",
      to: `${email}`,
      subject: "New Password",
      html: `click <a href=${link}>here</a> to set your new password.`,
    };

    await supporter.sendMail(mailOptions);

    return res.status(200).json({
      message: "mail sent successfully!",
    });

  } catch (error) {
    return res.status(500).json({
      error: `${error}`,
    });
  }
}
