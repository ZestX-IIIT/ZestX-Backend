const client = require("../configs/database");
const path = require('path');
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
        
        var options = {
            root: path.join(__dirname)
        };
          
        var fileName = 'user_verified.html';
        res.status(200).sendFile(fileName, options, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('Sent:', fileName);
            }
        });
    })
    .catch((err) => {
        res.status(400).json({
            error: `${err}`,
        });
    });

}