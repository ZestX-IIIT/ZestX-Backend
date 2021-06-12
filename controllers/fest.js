const client = require("../configs/database");

exports.getList = (req, res) => {
  client
    .query(`SELECT * FROM fest`)
    .then((data) => {
      const festData = data.rows;

      res.status(200).json({
        data: festData,
      });
    })
    .catch((err) => {
      res.status(400).json({
        error: `11${err}`,
      });
    });
};

exports.feedback = (req, res) => {
  //TODO
};

exports.register = (req, res) => {
  //TODO
};

exports.unregister = (req, res) => {
  //TODO
};
