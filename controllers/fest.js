const client = require("../configs/database");

exports.getList = async (req, res) => {
  try {
    const data = await client.query(`SELECT * FROM fest`);
    const festData = data.rows;

    return res.status(200).json({
      data: festData,
    });
  } catch (err) {
    return res.status(500).json({
      error: `${err}`,
    });
  }
};

exports.register = async (req, res) => {
  const eventId = req.body.id;
  const userId = req.userId;

  try {
    const data = await client.query(
      'SELECT * FROM users where user_id = $1', [userId]
    );

    if (!isVerified(data)) {
      return res.status(400).json({
        err: "User not verified",
      });
    }

    if (isRegistered(data, eventId)) {
      return res.status(404).json({
        err: "User already registered",
      });
    }

    await client.query(
      `UPDATE users SET fest_id = fest_id || '{${eventId}}' where user_id=$1`, [userId]
    );

    await client.query(
      `UPDATE fest SET user_id = user_id || '{${userId}}' where fest_id=$1`, [eventId]
    );

    return res.status(200).json({
      message: "user registered successfully!",
    });

  } catch (err) {
    return res.status(500).json({
      error: `${err}`,
    });
  }
};

exports.unregister = async (req, res) => {
  const eventId = req.body.id;
  const userId = req.userId;

  try {
    const data = await client.query(
      'SELECT * FROM users where user_id = $1', [userId]
    );

    if (!isVerified(data)) {
      return res.status(400).json({
        err: "User not verified",
      });
    }

    if (!isRegistered(data, eventId)) {
      return res.status(404).json({
        err: "User not registered",
      });
    }

    await client.query(
      "UPDATE users SET fest_id = array_remove(fest_id, $1) WHERE user_id=$2", [eventId, userId]
    );

    await client.query(
      "UPDATE fest SET user_id= array_remove(user_id, $1) WHERE fest_id=$2", [userId, eventId]
    );

    return res.status(200).json({
      message: "user unregistered successfully!",
    });

  } catch (err) {
    return res.status(500).json({
      error: `${err}`,
    });
  }
};

function isVerified(userData) {
  const verified = userData.rows[0].is_verified;
  if (verified) {
    return true;
  }
  return false;
}

function isRegistered(userData, festId) {
  const festIdsList = userData.rows[0].fest_id;

  if (festIdsList == null) {
    return false;
  }

  else if (festIdsList.includes(`${festId}`)) {
    return true;
  }

  else return false;
}