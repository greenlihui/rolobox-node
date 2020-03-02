const multer = require('multer');
const uuid = require('uuid/v1');

const LOCAL_IMAGES_FOLDER = require('../app-config').LOCAL_IMAGES_FOLDER;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, LOCAL_IMAGES_FOLDER)
    },
    filename: function (req, file, cb) {
        cb(null, uuid());
    },
});
const uploader = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

module.exports = uploader;
