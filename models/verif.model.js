const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const verifSchema = mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: 'User'
    },
    expiredAt: Date,
    token: String
}, {toJSON: {versionKey: false}});

const Verif = mongoose.model('Verif', verifSchema);

module.exports = Verif;
