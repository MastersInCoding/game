const User = require('../models/user');


exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}, 'name email points teams');

        // const user = await User.findById('663c61443b88eac6aa8dbde7');
        // console.log(user.teams.length);

        // const usersWithTeamsCount = users.map(user => {
        // const numberOfTeams = user.teams.length;
        // return { user: user, numberOfTeams: numberOfTeams };
        // });
        // const usersWithSmallTeams = users.filter(user => user.teams.length < 5);

        // res.json(usersWithTeamsCount);
        // users.forEach(user => {
        //     console.log(user.name+" "+user.teams.length+ " "+user.points+" "+user.id);
            
        // })
        return res.status(200).json({users : users});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Login function
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user by email
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).send('Invalid email or password');
        }
        // Check password
        if (user.password !== password) {
            return res.status(401).send('Invalid email or password');
        }
        // Set session data
        req.session.userId = user.id;
        if(user.role === 'admin') {
            return res.redirect('admin.html');
        }
        else {
            const redirectUrl = '/home.html?name=' + user.name.split(' ')[0] + '&email=' + user.email;
            return res.redirect(redirectUrl);
        }
        
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).send('Error logging in');
    }
};

exports.getByEmail = async (req, res) => {
    const { email } = req.query;
    try {
        // Find user by email
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).send('Invalid email');
        }
        const username = {
            "name": user.name,
            "email": user.email
        };
        res.json({message: "found user", username: username});
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).send('Error logging in');
    }
};

// Sign up function
exports.signup = async (req, res) => {
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const user = await User.findOne({ email: email });
    if (user) {
        return res.status(401).send('Invalid email');
    }
    const newUser = new User({
        email: email,
        name: name,
        password: password,
    });
    newUser.save()
        .then(() => {
            const redirectUrl = '/home.html?name=' + newUser.name.split(' ')[0] + '&email=' + newUser.email;
            req.session.userId = newUser._id;
            res.redirect(redirectUrl);
        })
        .catch(err => {
            console.error('Error creating user ', err);
            res.status(500).send('Error creating usesr');
        });
};


exports.findByEmailId = async (req, res) => {
    const { email } = req.body;
    User.findOne( {email : email})
        .then(user => {
            if(user){
                // console.log(user);
                const redirectUrl = '/login2.html?name=' + user.name.split(' ')[0] + '&email=' + user.email;
                return res.status(200).redirect(redirectUrl);
            }
            else{
                return res.status(200).redirect('/signup.html?email=' + email);
            }
        })
        .catch(err => {
            console.error('Error Searching for user ', err);
            res.status(500).send('Error Searching for user');
        });
  };

  exports.logout = async (req, res) => {
    req.session.destroy();
    return res.sendFile('index.html', { root: 'public' });
  };

  exports.makeAdmin = async (req, res) => {
    const user = await User.findOne({email: req.params.id});
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    user.role = 'admin';
    await user.save();
    return res.status(200).json({ message: 'Successfully'});
  };

  exports.changeName = async (req, res) => {
    const { email, newName } = req.body;

    const user = await User.findOneAndUpdate(
        { email },
        { name: newName },
        { new: true } // Return the updated document
      );

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ message: 'Name updated successfully'});

  };

  exports.changeEmail = async (req, res) => {
    const { currentEmail, newEmail } = req.body;

    try {
        // Find the user by current email and update the email
        const existingUser = await User.findOne({email: newEmail});
        if(existingUser){
            return res.status(404).json({ error: 'Email already exists' });
        }
        const user = await User.findOneAndUpdate(
        { email: currentEmail },
        { email: newEmail },
        { new: true } // Return the updated document
        );

        if (!user) {
        return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({ message: 'Email updated successfully' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    
  };



  exports.resetPassword = async (req, res) => {
    return res.redirect('/resetpass.html');
  };

  exports.confirmResetPass = async (req, res) => {
    // logic for sending mail
    return res.redirect('/confirmNewPass.html?token='+req.query.token);
  };


  exports.privacyPolicy = async (req, res) => {
    // logic for sending mail
    return res.redirect('/privacypolicy.html');
  };

  exports.termsAndConditions = async (req, res) => {
    // logic for sending mail
    return res.redirect('/termsandconditions.html');
  };
