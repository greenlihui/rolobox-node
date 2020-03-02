const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const USER_DEFAULT_AVATAR_FILENAME = require('../app-config').USER_DEFAULT_AVATAR_FILENAME;

const contactSchema = mongoose.Schema({
    name: {
        first: String,
        last: String
    },
    phones: [{
        label: String,
        number: {
            type: String,
            // XXX-XXX-XXXX or XXX.XXX.XXXX or XXX XXX XXXX
            match: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
        }
    }],
    emails: [{
        label: String,
        address: {
            type: String,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Invalid Email Format'
            ]
        }
    }],
    occupation: {
        company: String,
        position: String
    },
    socials: [{
        platform: String,
        username: String
    }],
    faces: {
        avatar: {
            type: String,
            default: USER_DEFAULT_AVATAR_FILENAME
        },
        list: [{
            type: ObjectId,
            ref: 'Face'
        }]
    },
    group: {
        type: ObjectId,
        ref: 'Group'
    }
}, {toJSON: {virtuals: true, versionKey: false}});

contactSchema.virtual('name.full').get(function () {
    return this.name.first + ' ' + this.name.last;
});

// Delete a contact will trigger deleting faces of that contacts
contactSchema.pre('remove', {document: true}, function (next) {
    require('../models/face.model').find({_id: {$in: this.faces.list}}).then(faces => {
        Promise.all(faces.map(face => face.remove())).then(_ => next());
    });
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
