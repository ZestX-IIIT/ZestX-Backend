const client = require("../configs/database");
const jwt = require("jsonwebtoken");

exports.getDetails = (req, res) => {
    //TODO
};

exports.updateDetails = (req, res) => {
    //TODO
};

exports.verifyUser = (req, res) => {

    const userToken = req.userId;

    var userEmail = jwt.decode(userToken).email;
    var boolvalue = true;

    client
    .query(`UPDATE users SET is_verified=${boolvalue} where email='${userEmail}'`)
    .then((data) => {
        res.status(200).json({
            message: "user verified successfully!",
            data: `${data}`
        });
    })
    .catch((err) => {
        res.status(400).json({
            error: `${err}`,
        });
    });

}