const client = require("../configs/database");
const path = require('path');
const jwt = require("jsonwebtoken");

exports.getDetails = (req, res) => {
    client.query(`SELECT * FROM users where email = '${req.email}'`).then((data) => {
        const userData = data.rows;
        
        const filteredData = userData.map((item) => {
            return{
                userId: item.user_id,
                userName: item.user_name,
                email: item.email,
                mobile: item.mobile,
                festIds: item.fest_id,
                isAdmin: item.is_admin,
                isVerified: item.is_verified,
            };
        });

        // console.log(filteredData);

        res.status(200).json({
            message: "successfull!",
            data: filteredData,
        });
    }).catch((err) => {
        res.status(400).json({
            error: `${err}`,
        });
    });
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