const jwt = require("jsonwebtoken");
const client = require("../configs/database");

exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  jwt.verify(token, "" + process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      res.status(500).json({
        error: `${err}`,
      });
    } else {
      const userEmail = decoded.email;
      const userId = decoded.userId;

      client
        .query(`SELECT *FROM users where user_id = '${userId}'`)
        .then((data) => {
          if (data.rows.length == 0) {
            res.status(400).json({
              message: "User does not exist",
            });
          } else {
            req.email = userEmail;
            req.userId = userId;
            next();
          }
        })
        .catch((err1) => {
          res.status(500).json({
            message: `${err1}`,
          });
        });
    }
  });
};
