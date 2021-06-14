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
          error: `1${err}`,
        });
      });
  });
};

exports.register = async (req, res) => {
  const eventId = req.body.id;
  const userId = req.userId;

  try {
    const data = await client.query(
      `SELECT * FROM users where user_id='${userId}'`
    );

    if (isEligible(data, eventId)) {
      await client.query(
        `UPDATE users SET fest_id = fest_id || '{${eventId}}' where user_id='${userId}';`
      );

      await client.query(
        `UPDATE fest SET user_id = user_id || '{${userId}}' where fest_id='${eventId}';`
      );

      res.status(200).json({
        message: "user registered successfully!",
      });
    } else {
      res.status(400).json({
        err: "user not eligible",
      });
    }
  } catch (err) {
    res.status(400).json({
      error: `1${err}`,
    });
  }
};

exports.unregister = async (req, res) => {
  const eventId = req.body.id;
  const userId = req.userId;

  try {
    const data = await client.query(
      `SELECT * FROM users where user_id='${userId}'`
    );

    const userName = data.rows[0].user_name;

    if (isEligible2(data, eventId)) {
      await client.query(
        `UPDATE users SET fest_id = fest_id || '{${eventId}}' where user_id='${userId}';`
      );

      await client.query(
        `UPDATE fest SET user_id_name = user_id_name || '{${userId},${userName}}' where fest_id='${eventId}';`
      );

      res.status(200).json({
        message: "user registered successfully!",
      });
    } else {
      res.status(400).json({
        err: "user not eligible",
      });
    }
  } catch (err) {
    res.status(400).json({
      error: `1${err}`,
    });
  }
};

function isEligible(userData, festId) {
  const boolvalue = userData.rows[0].is_verified;

  if (!boolvalue) return false;

  const festIdsList = userData.rows[0].fest_id;

  if (festIdsList.includes(festId)) return false;

  return true;
}

function isEligible2(userData, festId) {
  const boolvalue = userData.rows[0].is_verified;

  if (!boolvalue) return false;

  const festIdsList = userData.rows[0].fest_id;

  if (!festIdsList.includes(festId)) return false;

  return true;
}
