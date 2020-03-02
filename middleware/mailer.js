const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: "OAuth2",
        user: "greenlihui@gmail.com",
        clientId: "82922382937-upgghj42ta189ph94jo7f9q91g5gcnh5.apps.googleusercontent.com",
        clientSecret: "wAedqyMakYIzHTRx1VBcY7ON",
        refreshToken: "1//04RVeNtEqUMkxCgYIARAAGAQSNwF-L9IroLfrMiXg-jm3MOVcuuwu7Xcs08NN1b7_H5oGTM9-bo9HV88ggWn9n30bqNDyfXZPpdE",
        accessToken: "ya29.Il-7B8tACYtPfVlFIPEiHNwW5uJKIVJKmC6dWYQwdzVoas7uzXzOBfipbcW5Gvfrxd0Q630Qna04ID4uuB_bRyDgXNfyFcBtWAY19zFZs0ALZGlMw6OoyW6FxZ6otX2o2A"
    }
});

module.exports = transporter;
