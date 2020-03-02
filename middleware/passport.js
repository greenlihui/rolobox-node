const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const userService = require('../services/user.service');

const User = require('../models/user.model');
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await userService.findByEmail(email);
        if (!user) {
            return done(null, false);
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return done(null, false);
        }
        return done(null, user.toJSON());
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

module.exports = passport;
