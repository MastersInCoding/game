const User = require('../models/user');
const Team = require('../models/team');


exports.team = async (req, res) => {
    try {
        const { name, users, createdBy } = req.body;
    
        // Check if the team exceeds the points limit
        const totalPoints = await User.aggregate([
          { $match: { _id: { $in: users } } },
          { $group: { _id: null, totalPoints: { $sum: '$points' } } }
        ]);
    
        if (totalPoints.length > 0 && totalPoints[0].totalPoints > 300) {
          return res.status(400).json({ message: 'Team exceeds 300 points limit.' });
        }
    
        const team = new Team({ name, users, createdBy });
        const selectedUsers = await User.find({ _id: { $in: users } });
        const alreadyIn5Team = selectedUsers.map(u => u.teams.length === 5 ? u.name : u);
        if(alreadyIn5Team.length > 0) {
          return res.status(500).json({ message: 'error saving team', alreadyIn5Team: alreadyIn5Team});
        }
        await team.save();
    
        return res.status(201).json(team);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
};


exports.saveSelectedUsers = async (req, res) => {
  try {
    const { createdBy, selectedUserIds, teamName } = req.body;

    const selectedUsers = await User.find({ _id: { $in: selectedUserIds } });

    if (!selectedUsers || selectedUsers.length === 0) {
      return res.status(404).json({ message: 'No users found with the provided IDs' });
    }

    const newTeam = new Team();
    const createdByUser = await User.findOne({email: createdBy});

    // Add selected users to the team's users array
    newTeam.users = [...selectedUsers];
    newTeam.createdBy = createdByUser._id;
    newTeam.totalPoints = selectedUsers.reduce((total, user) => total + user.points, 0);
    newTeam.createdOn = Date.now();
    newTeam.name = teamName;

    // Save the updated team document
    newTeam.save()
     .then((updatedTeam) => {
      if(updatedTeam) {
        selectedUsers.forEach(async user => {
          user.teams.push(updatedTeam._id);
          await user.save();
        });
        // Send response after all operations are completed
        return res.status(200).json({ message: 'Selected users added to the team successfully' });
      }
     })
     .catch(err => {
        console.error('Error saving team:', err);
        return res.status(500).json({ message: 'Error saving team' });
      });


  } catch (error) {
    console.error('Error saving selected users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getTeamDetails = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('users').populate('createdBy'); // Populate createdBy field
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    const userNames = team.users.map(user => ({
      id: user._id, 
      name: user.name, 
      teamSize: user.teams.length,
      points: user.points
    }));

    const createdByUser = await User.findById(team.createdBy);

    const message = {
      id: team._id,
      name: team.name,
      users: userNames,
      createdBy: createdByUser.name,
      createdOn: team.createdOn,
      totalPoints: team.totalPoints
    };

    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.getTeams = async (req, res) => {
    try {
        const user = await User.findOne({email: req.params.id});
        const teams = await Team.find({'createdBy' : user._id});
        if (!teams) {
          return res.status(404).json({ message: 'Teams not found.' });
        }
        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.updateTeam = async (req, res) => {
    try {
        const { selectedUserIds, teamName, teamId } = req.body;
    
        const team = await Team.findById(teamId).populate('users');

        if (!team) {
            return res.status(404).json({ error: "Team not found" });
        }
        const usersToAdd = await User.find({ _id: { $in: selectedUserIds } });
        const usersToRemove = team.users.filter(user => !selectedUserIds.includes(user.id));

        team.users =  usersToAdd.map(user => user._id);
        team.name = teamName;
        team.totalPoints = usersToAdd.reduce((total, user) => total + user.points, 0);

      
        await team.save();

        for (const user of usersToRemove) {
          user.teams = user.teams.filter(id => id.toString() !== teamId);
          await user.save();
        }

        return res.status(200).json({ message: "Team updated successfully" });
    } catch (error) {
        console.error('Error updating team:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

exports.deleteTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.body.teamId);
        if (!team) {
          return res.status(404).json({ message: 'Team not found.' });
        }
        const users = await User.find({ _id: { $in: team.users } });
        users.forEach(async user => {
          const u = await User.findById(user.id);
            if (u) {
                u.teams = u.teams.filter(id => id.toString() !== team.id.toString());
                await u.save();
            }
        })
        const deleteDocument = await Team.findByIdAndDelete(team.id);
        if(deleteDocument){
          res.json({ message: 'Team deleted successfully.' });
        }
        
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
}

exports.myTeam = async (req, res) => {
    // logic for sending mail
    return res.redirect('/team.html');
  };
