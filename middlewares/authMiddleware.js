const jwt = require("jsonwebtoken");
const client = require("../configs/database");

exports.verifyToken = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(404).json({
      message: "Token not found",
    });
  }

  try {
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);

    const userEmail = decoded.email;
    const userId = decoded.userId;

    const data = await client
      .query(`SELECT * FROM users where user_id = '${userId}'`);

    if (data.rows.length == 0) {
      return res.status(400).json({
        message: "Invalid token",
      });
    }

    req.email = userEmail;
    req.userId = userId;
    next();

  } catch (err) {
    return res.status(500).json({
      message: `${err}`,
    });
  }

};
