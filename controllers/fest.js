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

exports.getEvents = (req, res) => {
  const idsArray = req.body.ids.split(",");
  var eventArray = [];
  let index = 0;

  idsArray.forEach((id) => {
    client
      .query(`SELECT * FROM fest where fest_id='${id}'`)
      .then((data) => {
        let festData = data.rows[0];

        eventArray[index] = festData;
        index++;

        if (index == idsArray.length) {
          res.status(200).json({
            data: eventArray,
          });
        }
      })
      .catch((err) => {
        res.status(400).json({
          error: `11${err}`,
        });
      });
  });
};

exports.register = (req, res) => {
  const eventId = req.id;
  const userId = req.userId;

  client
    .query(`SELECT is_verified FROM users where user_id='${userId}'`)
    .then((data) => {
      res.status(200).json({
        data: `${data}`,
      });
    })
    .catch((err) => {
      res.status(400).json({
        error: `11${err}`,
      });
    });
};

exports.unregister = (req, res) => {
  //TODO
};
