const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Invalid Email Format'
        ]
    },
    password: {
        type: String,
        required: true
    },
    status: {
        firstSignedIn: {
            type: Boolean,
            default: false
        },
        verified: {
            type: Boolean,
            default: false
        },
        locked: {
            type: Boolean,
            default: false
        },
        closed: {
            type: Boolean,
            default: false
        }
    },
    connections: {
        facebook: String,
        twitter: String,
        google: String
    },
    membership: {
        payments: String
    },
    profile: {
        type: ObjectId,
        ref: 'Contact'
    }
});

userSchema.index({email: 1}, {unique: true});

userSchema.set('toJSON', {
    versionKey: false,
    transform: function(doc, ret, options) {
        delete ret.password;
        return ret;
    }
});

const User = mongoose.model('User', userSchema);

User.on('index', function (err) {
    if (err) {
        console.log('Mongoose: Error in creating index for User', err);
    } else {
        console.log('Mongoose: Successfully created index for User');
    }
});

module.exports = User;
