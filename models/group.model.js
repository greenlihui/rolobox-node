const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Contact = require('./contact.model');


const groupSchema = mongoose.Schema({
    owner: {
        type: ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        require: true
    },
    color: {
        type: String,
        default: '#4154AF',
        match: [
            /^#(?:[0-9a-f]{3}){1,2}$/i,
            'Invalid Hex Color Format'
        ]
    }
}, {toJSON: {virtuals: true, versionKey: false}});

groupSchema.virtual('numContacts', {
    ref: 'Contact',
    localField: '_id',
    foreignField: 'group',
    count: true
});

groupSchema.index({owner: 1, name: 1}, {unique: true});

// Delete a group will trigger deleting contacts in that group
groupSchema.pre('remove', {document: true}, function (next) {
    Contact.find({group: this._id}).then(contacts => {
        Promise.all(contacts.map(contact => contact.remove())).then(_ => next());
    });
});

const Group = mongoose.model('Group', groupSchema);

Group.on('index', function (err) {
    if (err) {
        console.log('Mongoose: Error in creating index for Group', err);
    } else {
        console.log('Mongoose: Successfully created index for Group');
    }
});

module.exports = Group;
