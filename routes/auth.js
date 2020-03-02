const router = require('express').Router();
const userService = require('../services/user.service');
const contactService = require('../services/contact.service');
const verifService = require('../services/verif.service');
const passport = require('../middleware/passport');
const awsService = require('../services/aws.service');


// todo reset password
router.post('/reset', (req, res, next) => {
    const email = req.query.email;
    res.status(200).end();
});


router.put('/users/:userId', async (req, res, next) => {
    const userId = req.params.userId;
    const update = req.body;
    try {
        const result = await userService.updateById(userId, update);
        res.status(200).json({data: result});
    } catch (err) {
        next(err);
    }
});

router.get('/users/:userId', async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const result = await userService.findById(userId);
        res.status(200).json({data: result});
    } catch (err) {
        next(err);
    }
});

/*
 * Get current user in session
 */
router.get('/init', async (req, res, next) => {
    const sessionUser = req.user;
    let result = null;
    if (sessionUser) {
        result = await userService.findById(sessionUser._id);
    }
    res.status(200).json({data: result});
});

/*
 * A user sign up with email and password in the response body. Response might
 * be a 400 error because account with same email already exist, or a 201 saved
 * user with password hidden.
 *
 * req.body(url-form-encoded) ==> { email: <String>, password: <String> }
 * res ==> (400) : { errors: [{ msg: <String> }] }
 *     ==> (201) : { data: <User> }
 */
router.post('/signup', async (req, res, next) => {
    const user = req.body;
    try {
        const found = await userService.findByEmail(user.email);
        if (found) {
            res.status(400).json({errors: [{msg: 'Account with same email exists.'}]});
        } else {
            const profile = await contactService.generateDefaultProfile(user);
            user.profile = profile._id;
            const savedUser = await userService.save(user);
            await awsService.rekognition.createCollection(savedUser._id.toString());
            await userService.createUngrouped(savedUser._id.toString());
            await verifService.sendVerifEmail(savedUser._id, savedUser.email);
            res.status(201).json({data: savedUser});
        }
    } catch (err) {
        next(err);
    }
});

/*
 * A user sign in to the system with email and password in the response body. Response
 * might be a 400 error because of incorrect username or password, or a 200 retrieved
 * user with password hidden. For user whose email is not verified, sign in is allowed
 * but no other operation is allowed before email get verified.
 *
 * req.body(url-form-encoded) ==> { email: <String>, password: <String> }
 * res ==> (400) : { errors: [{ msg: <String> }] } or
 *     ==> (200) : { data: <User> }
 */
router.post('/signin', (req, res, next) => {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).json({
                errors: [
                    {msg: 'Username or password is incorrect'}
                ]
            });
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.status(200).json({
                data: user
            });
        });
    })(req, res, next);
});

// USER SIGN OUT THE SYSTEM
router.post('/signout', (req, res, next) => {
    req.logout();
    res.status(200).end();
});

/*
 * A request of sending a verification email, this request can be made immediately
 * after a user is successfully signed up, but also can be sent by user to require
 * verification again because the previous link is expired or he want to change his
 * email.
 *
 * req.body ==> null
 * res ==> (200) : { data: { <Result<Mailer.SendEmail>> }
 */
router.post('/users/:userId/verif', async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const user = await userService.findById(userId);
        const result = await verifService.sendVerifEmail(user._id, user.email);
        res.status(201).json({data: result});
    } catch (err) {
        next(err);
    }
});

/*
 * A get request sent from browser because user clicked the link in the verification
 * email. After verified, the account will be given a AWS rekognition collection for
 * indexing faces.
 *
 * req.query ==> { token: <String> }
 * res ==> (200) :  todo: send json and see what happens.
 */
router.get('/users/:userId/verif/:verifId', async (req, res, next) => {
    const token = req.query.token;
    const verifId = req.params.verifId;
    const userId = req.params.userId;
    try {
        const verif = await verifService.findById(verifId);
        if (verif && verif.userId.toString() === userId &&
            verif.token === token && Date.now() <= new Date(verif.expiredAt.toString()).getTime()) {
            await verifService.deleteById(verifId);
            await userService.makeVerifiedById(userId);

            req.app.io.sockets.emit('verified', userId);

            res.status(200).send('<p>Your account has been successfully activated.</p>');
        } else {
            res.status(400).send('<p>Invalid Operation.</p>')
        }
    } catch (err) {
        next(err);
    }
});

module.exports = router;
