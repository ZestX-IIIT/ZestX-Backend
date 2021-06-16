const client = require("../configs/database");

exports.getList = async (req, res) => {
  try {
    const data = await client.query(`SELECT * FROM fest`);
    const festData = data.rows;

    res.status(200).json({
      data: festData,
    });
  } catch (err) {
    res.status(400).json({
      error: `1${err}`,
    });
  }
};

exports.getEvents = async (req, res) => {
  const idsArray = req.body.ids.split(",");
  var eventArray = [];
  let index = 0;

  try {
    idsArray.forEach(async (id) => {
      const data = await client.query(
        `SELECT * FROM fest where fest_id='${id}'`
      );
      let festData = data.rows[0];

      eventArray[index] = festData;
      index++;
    })
    res.status(200).json({
      data: eventArray,
    });

  } catch (err) {
    res.status(400).json({
      error: `1${err}`,
    });
  };

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

    if (isEligible2(data, eventId)) {
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
    res.status(400).json({
      error: `1${err}`,
    });
  }
};

exports.ongoingEvents = async (req, res) => {
  var today = Date.now();

  let eventArray = [];
  let index = 0;

  try {
    const data = await client.query(`SELECT * FROM fest`);
    const festData = data.rows;

    festData.map((event) => {
      let d = parseInt(event.end_date);

      if (today < d) {
        eventArray[index] = event;
        index++;
        console.log(today);
      }
    });

    res.status(200).json({
      data: eventArray,
    });
  } catch (err) {
    res.status(400).json({
      error: `1${err}`,
    });
  }
};

exports.addUser = async (req, res) => {
  const adminEmail = req.email;
  const { username, email, mobile, event_id } = req.body;
  try {
    const data = await client.query(
      `SELECT * FROM users where email = '${adminEmail}'`
    );
    if (isEligible3(data)) {
      await client.query(
        `INSERT INTO external_users (username, email, mobile) VALUES ('${username}', '${email}', '${mobile}');`
      );

      const data1 = await client.query(
        `SELECT userid FROM external_users where email = '${email}'`
      );

      let size = data1.rows.length;
      const userId = data1.rows[size - 1].userid;

      await client.query(
        `UPDATE fest SET external_user_id = external_user_id || '{${userId}}' where fest_id='${event_id}';`
      );

      res.status(200).json({
        data: "user registered successfully!",
      });
    } else {
      res.status(400).json({
        error: "You have no access!",
      });
    }
  } catch (err) {
    res.status(400).json({
      error: `1${err}`,
    });
  }
};

exports.removeUser = async (req, res) => {
  try {
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

function isEligible3(userData) {
  const boolvalue = userData.rows[0].is_admin;

  if (!boolvalue) return false;

  return true;
}
