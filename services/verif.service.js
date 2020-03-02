const Verif = require('../models/verif.model');
const uuid = require('uuid/v1');
const mailer = require('../middleware/mailer');
const config = require('../app-config');

const APP_DOMAIN = config.APP_DOMAIN;
const APP_NAME = config.APP_NAME;
const API_PREFIX = config.API_PREFIX;

function save(verif) {
    return (new Verif(verif)).save();
}

async function sendVerifEmail(userId, email) {
    const verif = {
        userId: userId,
        expiredAt: Date.now() + 5 * 60 * 1000,
        token: uuid()
    };
    const saved = await save(verif);
    const link = APP_DOMAIN + API_PREFIX + 'users/' + userId +
        '/verif/' + saved._id + '?token=' + saved.token;
    const mailOptions = {
        from: 'greenlihui@gmail.com',
        to: email,
        subject: APP_NAME + ': Verify Your Account',
        text: 'Please click the link below to verify your account.\n' +
            link + '\nIt will be expired in 5 minutes.'
    };
    return mailer.sendMail(mailOptions);
}

function findById(id) {
    return Verif.findById(id).exec();
}

function deleteById(id) {
    return Verif.findByIdAndDelete(id).exec();
}

module.exports = {
    save: save,
    sendVerifEmail: sendVerifEmail,
    findById: findById,
    deleteById: deleteById
};
