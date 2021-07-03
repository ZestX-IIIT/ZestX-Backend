const client = require("../configs/database");
require('dotenv').config();

exports.userDetails = async (req, res) => {
    const idsArray = req.body.ids.split(",");
    let usersArray = [];
    let index = 0;
    try {
        for (const id of idsArray) {
            const data = await client.query(
                'SELECT * FROM users where user_id = $1', [id]
            );
            let userData = data.rows[0];

            usersArray[index] = userData;
            index++;
        }
        return res.status(200).json({
            data: usersArray,
        });

    } catch (err) {
        return res.status(500).json({
            error: `${err}`,
        });
    }
};

exports.exUserDetails = async (req, res) => {

    const idsArray = req.body.ids.split(",");
    var usersArray = [];
    let index = 0;
    try {

        for (const id of idsArray) {
            const data = await client.query(
                'SELECT * FROM external_users where userid=$1', [id]
            );
            let userData = data.rows[0];

            usersArray[index] = userData;
            index++;
        }
        return res.status(200).json({
            data: usersArray,
        });

    } catch (err) {
        return res.status(500).json({
            error: `${err}`,
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
            let endDateTimestamp = parseInt(event.end_date);

            if (today < endDateTimestamp) {
                eventArray[index] = event;
                index++;
            }
        });

        return res.status(200).json({
            data: eventArray,
        });
    } catch (err) {
        return res.status(500).json({
            error: `${err}`,
        });
    }
};

exports.addUser = async (req, res) => {
    const { username, email, mobile, event_id } = req.body;
    try {
        await client.query(
            'INSERT INTO external_users (username, email, mobile) VALUES ($1, $2, $3)', [username, email, mobile]
        );

        const data = await client.query(
            'SELECT userid FROM external_users where email=$1', [email]
        );

        let size = data.rows.length;
        const userId = data.rows[size - 1].userid;

        await client.query(
            `UPDATE fest SET external_user_id = external_user_id || '{${userId}}' where fest_id=$1`, [event_id]
        );

        return res.status(200).json({
            data: "user registered successfully!",
        });

    } catch (err) {
        return res.status(500).json({
            error: `${err}`,
        });
    }
};

exports.removeUser = async (req, res) => {
    const { userId, eventId } = req.body;
    try {
        await client.query(
            'UPDATE users SET fest_id = array_remove(fest_id, $1) WHERE user_id=$2', [eventId, userId]
        );

        await client.query(
            'UPDATE fest SET user_id= array_remove(user_id, $1) WHERE fest_id=$2', [userId, eventId]
        );

        return res.status(200).json({
            message: "user removed successfully!",
        });

    } catch (err) {
        return res.status(500).json({
            error: `${err}`,
        });
    }
};

exports.removeExternalUser = async (req, res) => {
    const { userId, eventId } = req.body;
    try {
        await client.query(
            'DELETE from external_users where userid=$1', [userId]
        );

        await client.query(
            'UPDATE fest SET external_user_id= array_remove(external_user_id, $1) WHERE fest_id=$2', [userId, eventId]
        );

        return res.status(200).json({
            message: "user removed successfully!",
        });
    } catch (err) {
        return res.status(500).json({
            error: `${err}`,
        });
    }
};
