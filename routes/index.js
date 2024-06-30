const express = require('express');
const router = express.Router();
// Import nodemailer module
const nodemailer = require('nodemailer');
const User = require('../models/user');
const crypto = require('crypto');



// Create a transporter object using SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'saifalaman@gmail.com', // Your email address
        pass: 'zhrvscqpufmneckv' // Your email password or app-specific password
    }
});

const userController = require('../controllers/userController');
const teamController = require('../controllers/teamController');
const playerController = require('../controllers/playerController');
const settingsController = require('../controllers/settingsController');


// Home page route
router.get('/index.html', (req, res) => {
    if (!req.session.userId) {
        return res.sendFile('index.html', { root: 'public' });
    }
    next();
  
});


router.get('/login1', (req, res) => {
        return res.redirect('login.html');  
});

router.get('/users', userController.getUsers);
router.post('/login', userController.login);
router.get('/getByEmail', userController.getByEmail);
router.get('/logout', userController.logout);
router.post('/changeEmail', userController.changeEmail);
router.post('/changeName', userController.changeName);
router.post('/createAccount', userController.signup);
router.post('/findByEmailId', userController.findByEmailId);
router.get('/resetPasswordPage', userController.resetPassword);
router.get('/confirmNewPass', userController.confirmResetPass);
router.get('/privacyPolicy', userController.privacyPolicy);
router.get('/termsAndConditions', userController.termsAndConditions);


// router.get('/my-team', teamController.myTeam);
router.post('/team', teamController.team);
router.post('/saveSelectedUsers', teamController.saveSelectedUsers);
router.get('/getteams/:id', teamController.getTeams);
router.get('/getTeamDetails/:id', teamController.getTeamDetails);
router.put('/updateTeam', teamController.updateTeam);
router.delete('/deleteTeam', teamController.deleteTeam);
router.get('/getTeams', teamController.getAllTeams);
router.get('/getTeamsByUser/:id', teamController.getTeamByUserId);
router.get('/download-csv', teamController.downloadTeamDataInCSVFile);


// router.get('/addPlayer', playerController.addPlayer);
router.get('/players', playerController.getPlayers);
router.get('/players/:userEmail', playerController.getPlayersByUser);
// router.get('/deleteAllPlayer', playerController.deleteAllPlayer);
router.get('/admin', playerController.getAdmin);
router.delete('/deletePlayer/:id', playerController.deletePlayer);
router.put('/updatePlayer', playerController.updatePlayer);
router.get('/player/:id', playerController.getPlayerById);
router.post('/savePlayer', playerController.savePlayer);
// router.post('/saveSelectedPlayers', playerController.saveSelectedPlayers);
// router.put('/updateTeam', teamController.updateTeam);


router.post('/settings/changeTeamCreations', settingsController.changeTeamCreations);
router.get('/settings', settingsController.getSettings);

router.get('/makeAdmin/:id', userController.makeAdmin);

router.post('/resetPasswordLink', async (req, res) => {

    const email = req.body.email;

    const user = await User.findOne( {email : email})
    if (!user) {
        return res.status(404).send('User not found');
    }

    

    // Generate a unique reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    user.resetToken = resetToken;
    user.password = user.password;
    await user.save();

    // Save the reset token to the session
    req.session.resetToken = resetToken;

    // Send the password reset link via email
    const resetLink = `http://15.207.88.203:3000/confirmNewPass?token=${resetToken}`;
    // Define email options
    let mailOptions = {
        from: 'saifalaman@gmail.com', // Sender email address
        to: email, // Recipient email address
        subject: 'Password Reset', // Email subject
        text: `Click this link to reset your password: ${resetLink}`// Email body (plain text)
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error:', error);
            return res.status(500).send('Error sending email');
        }
        res.send('Password reset email sent');
    });   

});

router.post('/reset-password', async(req, res) => {
    const {token, password} = req.body;
    const user = await User.findOne({ resetToken: token });
    if (!user) {
        return res.status(404).send('Invalid or expired token');
    }

    user.password = password;
    // user.email =
    user.resetToken = undefined;
    await user.save();


    // Clear the reset token from the session
    req.session.resetToken = undefined;

    res.send('Password reset successfully');
})

module.exports = router;
