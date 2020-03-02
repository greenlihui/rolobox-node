const APP_DOMAIN = 'http://138.49.184.109:3000';
const APP_NAME = 'Phacebook';
const API_VERSION = 'v1';
const API_PREFIX = '/api/' + API_VERSION + '/';

const SECRET_KEY = 'The secret key for both cookie parser and express-session middleware';

const S3_BUCKET_NAME = 'capstone.hui';
const S3_BACKUP_PATH = '/home/ubuntu/s3-capstone-backup/';
const IMAGES_FOLDER = 'images/';
const FACES_THUMBNAIL_FOLDER = 'faces/';
const COMPRESSED_FOLDER = 'compressed/';
const LOCAL_IMAGES_FOLDER = S3_BACKUP_PATH + IMAGES_FOLDER;
const LOCAL_FACES_FOLDER = S3_BACKUP_PATH + FACES_THUMBNAIL_FOLDER;
const LOCAL_COMPRESSED_FOLDER = S3_BACKUP_PATH + COMPRESSED_FOLDER;
const USER_DEFAULT_AVATAR_FILENAME = 'default-m';

const FACE_MATCH_THRESHOLD = 95;

const DB_URI = 'mongodb://127.0.0.1:27017/capstone';

const BCRYPT_SALT_ROUNDS = 10;

module.exports = {
    APP_DOMAIN: APP_DOMAIN,
    APP_NAME: APP_NAME,
    API_VERSION: API_VERSION,
    API_PREFIX: API_PREFIX,
    S3_BUCKET_NAME: S3_BUCKET_NAME,
    SECRET_KEY: SECRET_KEY,
    S3_BACKUP_PATH: S3_BACKUP_PATH,
    IMAGES_FOLDER: IMAGES_FOLDER,
    COMPRESSED_FOLDER: COMPRESSED_FOLDER,
    FACES_THUMBNAIL_FOLDER: FACES_THUMBNAIL_FOLDER,
    LOCAL_IMAGES_FOLDER: LOCAL_IMAGES_FOLDER,
    LOCAL_COMPRESSED_FOLDER: LOCAL_COMPRESSED_FOLDER,
    LOCAL_FACES_FOLDER: LOCAL_FACES_FOLDER,
    FACE_MATCH_THRESHOLD: FACE_MATCH_THRESHOLD,
    DB_URI: DB_URI,
    BCRYPT_SALT_ROUNDS: BCRYPT_SALT_ROUNDS,
    USER_DEFAULT_AVATAR_FILENAME: USER_DEFAULT_AVATAR_FILENAME
};
