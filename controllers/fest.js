const client = require("../configs/database");

exports.getList = async (req, res) => {
  try {
    const data = await client.query(`SELECT * FROM fest`);
    const festData = data.rows;

    res.status(200).json({
      data: festData,
    });
  } catch (err) {
    res.status(500).json({
      error: `${err}`,
    });
  }
};

exports.getEvents = async (req, res) => {
  const idsArray = req.body.ids.split(",");
  var eventArray = [];
  let index = 0;

  try {
    for (const id of idsArray) {
      const data = await client.query(
        `SELECT * FROM fest where fest_id='${id}'`
      );
      let festData = data.rows[0];

      eventArray[index] = festData;
      index++;
    }
    res.status(200).json({
      data: eventArray,
    });
  } catch (err) {
    res.status(500).json({
      error: `${err}`,
    });
  }
};

exports.register = async (req, res) => {
  const eventId = req.body.id;
  const userId = req.userId;

  try {
    const data = await client.query(
      `SELECT * FROM users where user_id='${userId}'`
    );

    if (isEligibleForRegister(data, eventId)) {
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
    res.status(500).json({
      error: `${err}`,
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

    if (isEligibleForUnregister(data, eventId)) {
      await client.query(
        `UPDATE users SET fest_id = array_remove(fest_id, '${eventId}') WHERE user_id='${userId}';`
      );

      await client.query(
        `UPDATE fest SET user_id= array_remove(user_id, '${userId}') WHERE fest_id='${eventId}';`
      );

      res.status(200).json({
        message: "user unregistered successfully!",
      });
    } else {
      res.status(400).json({
        err: "user not eligible",
      });
    }
  } catch (err) {
    res.status(500).json({
      error: `${err}`,
    });
  }
};

function isEligibleForRegister(userData, festId) {
  const boolvalue = userData.rows[0].is_verified;

  if (!boolvalue) return false;

  const festIdsList = userData.rows[0].fest_id;

  if (festIdsList == null) return true;
  if (festIdsList.includes(`${festId}`)) return false;

  return true;
}

function isEligibleForUnregister(userData, festId) {
  const festIdsList = userData.rows[0].fest_id;

  if (festIdsList.length == 0) return false;
  if (festIdsList.includes(`${festId}`)) return true;

  return false;
}

