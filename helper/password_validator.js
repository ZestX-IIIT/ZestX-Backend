const passwordValidator = require('password-validator');

let minLength = new passwordValidator();
let maxLength = new passwordValidator();
let uppercaseChar = new passwordValidator();
let lowercaseChar = new passwordValidator();
let digitContains = new passwordValidator();
let noSpaces = new passwordValidator();
let specialChar = new passwordValidator();

minLength.is().min(6);
maxLength.is().max(20);
uppercaseChar.has().uppercase();
lowercaseChar.has().lowercase();
digitContains.has().digits();
noSpaces.has().not().spaces();
specialChar.has().symbols();

exports.passValidator = function (password) {
    let boolValue = false;
    let message;

    if (!minLength.validate(`${password}`)) {
        message = 'Password should be minimum of 6 length!';
        return [boolValue, message];
    }

    if (!maxLength.validate(`${password}`)) {
        message = 'Password should be maximum of 20 length!';
        return [boolValue, message];
    }

    if (!uppercaseChar.validate(`${password}`)) {
        message = 'Password should contain atleast 1 uppercase letter!';
        return [boolValue, message];
    }

    if (!lowercaseChar.validate(`${password}`)) {
        message = 'Password should contain atleast 1 lowercase letter!';
        return [boolValue, message];
    }

    if (!digitContains.validate(`${password}`)) {
        message = 'Password should contain atleast 1 digit!';
        return [boolValue, message];
    }

    if (!noSpaces.validate(`${password}`)) {
        message = 'Password should not contain any spaces!';
        return [boolValue, message];
    }

    if (!specialChar.validate(`${password}`)) {
        message = 'Password should contain atleast 1 special character!';
        return [boolValue, message];
    }

    return [true, "Success"];

}