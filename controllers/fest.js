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

    if (notEligibleForRegister(data, eventId))
      return res.status(400).json({
        err: "user not eligible",
      });

    await client.query(
      "UPDATE users SET fest_id = fest_id || '{$1}' where user_id=$2", [eventId, userId]
    );

    await client.query(
      "UPDATE fest SET user_id = user_id || '{$1}' where fest_id=$2", [userId, eventId]
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

    if (notEligibleForUnregister(data, eventId))
      return res.status(400).json({
        err: "user not eligible",
      });

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

function notEligibleForRegister(userData, festId) {
  const isVerified = userData.rows[0].is_verified;
  if (!isVerified) return true;

  const festIdsList = userData.rows[0].fest_id;
  if (festIdsList == null) return false;
  else if (festIdsList.includes(`${festId}`)) return true;
  else return false;

}

function notEligibleForUnregister(userData, festId) {
  const festIdsList = userData.rows[0].fest_id;

  if (festIdsList.length == 0) return true;
  else if (festIdsList.includes(`${festId}`)) return false;
  else return true;
}