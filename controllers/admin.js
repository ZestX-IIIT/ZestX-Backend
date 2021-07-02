const client = require("../configs/database");
require('dotenv').config();

exports.userDetails = async (req, res) => {
    const adminEmail = req.email;

    const idsArray = req.body.ids.split(",");
    var usersArray = [];
    let index = 0;
    try {
        const data1 = await client.query(
            `SELECT * FROM users where email = '${adminEmail}'`
        );

        if (isEligible3(data1)) {
            for (const id of idsArray) {
                const data = await client.query(
                    `SELECT * FROM users where user_id = '${id}'`
                );
                let userData = data.rows[0];

                usersArray[index] = userData;
                index++;
            }
            res.status(200).json({
                data: usersArray,
            });
        } else {
            res.status(400).json({
                err: "You have no access!",
            });
        }
    } catch (err) {
        res.status(500).json({
            error: `${err}`,
        });
    }
};

exports.exUserDetails = async (req, res) => {
    const adminEmail = req.email;

    const idsArray = req.body.ids.split(",");
    var usersArray = [];
    let index = 0;
    try {
        const data1 = await client.query(
            `SELECT * FROM users where email = '${adminEmail}'`
        );

        if (isEligible3(data1)) {
            for (const id of idsArray) {
                const data = await client.query(
                    `SELECT * FROM external_users where userid = '${id}'`
                );
                let userData = data.rows[0];

                usersArray[index] = userData;
                index++;
            }
            res.status(200).json({
                data: usersArray,
            });
        } else {
            res.status(400).json({
                err: "You have no access!",
            });
        }
    } catch (err) {
        res.status(500).json({
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
        res.status(500).json({
            error: `${err}`,
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
        res.status(500).json({
            error: `${err}`,
        });
    }
};

exports.removeUser = async (req, res) => {
    const adminEmail = req.email;
    const { userId, eventId } = req.body;
    try {
        const data1 = await client.query(
            `SELECT * FROM users where email = '${adminEmail}'`
        );

        if (isEligible3(data1)) {
            await client.query(
                `UPDATE users SET fest_id = array_remove(fest_id, '${eventId}') WHERE user_id='${userId}';`
            );

            await client.query(
                `UPDATE fest SET user_id= array_remove(user_id, '${userId}') WHERE fest_id='${eventId}';`
            );

            res.status(200).json({
                message: "user removed successfully!",
            });
        } else {
            res.status(400).json({
                err: "You have no access!",
            });
        }
    } catch (err) {
        res.status(500).json({
            error: `${err}`,
        });
    }
};

exports.removeExternalUser = async (req, res) => {
    const adminEmail = req.email;
    const { userId, eventId } = req.body;
    try {
        const data1 = await client.query(
            `SELECT * FROM users where email = '${adminEmail}'`
        );

        if (isEligible3(data1)) {
            await client.query(
                `DELETE from external_users where userid = '${userId}';`
            );

            await client.query(
                `UPDATE fest SET external_user_id= array_remove(external_user_id, '${userId}') WHERE fest_id='${eventId}';`
            );

            res.status(200).json({
                message: "user removed successfully!",
            });
        } else {
            res.status(400).json({
                err: "You have no access!",
            });
        }
    } catch (err) {
        res.status(500).json({
            error: `${err}`,
        });
    }
};

function isEligible3(userData) {
    const boolvalue = userData.rows[0].is_admin;

    if (!boolvalue) return false;

    return true;
};