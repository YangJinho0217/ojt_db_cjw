const nodemailer = require('nodemailer');
const cryptojs = require('crypto');
require('dotenv').config();

exports.emailSend = async function(to) {

    // /* 회원가입 이메일 전송을 위한 계정 세팅 */
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const password = randomPassword()

    /* 이메일 전송 function */
    try {

        await transporter.sendMail({
            from : 'yagsill@dasvers.com',
            to : to,
            subject : 'DAS SDL 이메일 인증',
            text : 'DAS SDL 이메일 인증 비밀번호 입니다 : ' + password
        })
        
        const result = {
            resultCode : 200,
            resultMsg : 'success',
            data : password
        }

        return result;

    } catch (error) {
        const result = {
            resultCode : 401,
            resultMsg : error
        }

        return result;
    }

};

function randomPassword() {

    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    const charLength = chars.length;
    let result = '';
    for ( var i = 0; i < charLength; i++ ) {
        result += chars.charAt(Math.floor(Math.random() * charLength));
    }

    return result;

}

/* 비밀번호 암호화 */
exports.encryptPassword = async function(password) {
    const keyAl = process.env.CRYPTO;
    const cryptoKey = process.env.ENCRYPT_KEY;
    const cipher = cryptojs.createCipher(keyAl, cryptoKey);
    let result = cipher.update(password, 'utf8', 'base64');
    result += cipher.final('base64');
    return result;
}
  
/* 비밀번호 복호화 */
exports.decryptPassword = async function(password) {
    const keyAl = process.env.CRYPTO;
    const cryptoKey = process.env.ENCRYPT_KEY;
    const decipher = cryptojs.createDecipher(keyAl, cryptoKey);
    let result = decipher.update(password, 'base64', 'utf8');
    result += decipher.final('utf8');
    return result;
}

