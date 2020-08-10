const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: "OAuth2",
        user: "asdfasdf",
        clientId: "asdfasdf",
        clientSecret: "asdfasdf",
        refreshToken: "asdfasdf",
        accessToken: "asdfasdf"
    }
});

module.exports = transporter;
