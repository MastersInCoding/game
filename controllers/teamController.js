const User = require('../models/user');
const Team = require('../models/team');
const Player = require('../models/players');
const XLSX = require('xlsx');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;



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

    const existingTeam = await Team.findOne({ name: { $regex: `^${teamName}$`, $options: 'i' } });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team name already exists' });
    }

    const selectedUsers = await Player.find({ _id: { $in: selectedUserIds } });

    if (!selectedUsers || selectedUsers.length === 0) {
      return res.status(404).json({ message: 'No users found with the provided IDs' });
    }


    const createdByUser = await User.findOne({email: createdBy});


  const populatedUsers = selectedUsers.map(user => ({
    id: user._id,
    points: user.points,
    name: user.name
}));


  const newTeam = new Team({
      name: teamName,
      createdBy: createdByUser.id,
      users: populatedUsers, // Assign the populatedUsers array
      totalPoints: selectedUsers.reduce((total, user) => total + user.points, 0), // Calculate totalPoints
      createdOn: Date.now()
  });

    newTeam.save()
     .then((updatedTeam) => {
      if(updatedTeam) {
        selectedUsers.forEach(async user => {
          user.teams.push(updatedTeam._id);
          await user.save();
        });
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
    const team = await Team.findById(req.params.id).populate('users'); 
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    const userNames = team.users.map(user => ({
      id: user.id, 
      name: user.name, 
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

        const existingTeam = await Team.findOne({ name: { $regex: `^${teamName}$`, $options: 'i' } });
        if (existingTeam) {
          return res.status(400).json({ message: 'Team name already exists' });
        }

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ error: "Team not found" });
        }
        const usersToAdd = await Player.find({ _id: { $in: selectedUserIds } });
        const selectedUserObjectIds = usersToAdd.map(user => user._id.toString());
        const usersToRemove = team.users.filter(user => !selectedUserObjectIds.includes(user.id.toString()));
        const users = usersToAdd.map(user => ({
          id: user._id,
          points: user.points,
          name: user.name
      }));
        team.users =  users;
        team.name = teamName;
        team.totalPoints = usersToAdd.reduce((total, user) => total + user.points, 0);

      
        await team.save();


        for (const userId of usersToRemove) {

          const user = await Player.findById(userId);
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
        const users = await Player.find({ _id: { $in: team.users } });
        users.forEach(async user => {
          const u = await Player.findById(user.id);
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

exports.getAllTeams = async (req, res) => {
  try {
      const teams = await Team.aggregate([
        {
          $group: {
            _id: "$createdBy",
            numTeams: { $sum: 1 },
            teams: { $push: "$$ROOT" }
          }
        },
        {
          $project: {
            createdBy: "$_id",
            numTeams: 1,
            teams: 1
          }
        }
      ]);
      if (!teams) {
        return res.status(404).json({ message: 'Teams not found.' });
      }
      for(let team of teams) {
        const user = await User.findById(team.createdBy);
        team.createdBy = user.name;
      }
      res.status(200).json(teams.map(team => ({createdBy: team.createdBy, numTeams: team.numTeams, id: team._id})));
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
}


exports.getTeamByUserId = async (req, res) => {
  try {
      const user = await User.findById(req.params.id)
      if(!user){
        return res.status(404).json({ message: 'User not found.' });
      }
      const teams = await Team.find({'createdBy' : user._id});
      if (!teams) {
        return res.status(404).json({ message: 'Teams not found.' });
      }
      res.status(200).json({
        teams: teams,
        user: {
          name: user.name,
          email: user.email
        }
      });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
}


exports.downloadTeamDataInCSVFile = async (req, res) => {
  try {
    const teams = await Team.aggregate([
      {
        $group: {
          _id: "$createdBy",
          numTeams: { $sum: 1 },
          teams: { $push: "$$ROOT" }
        }
      },
      {
        $project: {
          createdBy: "$_id",
          numTeams: 1,
          teams: 1
        }
      }
    ]);
    if (!teams) {
      return res.status(404).json({ message: 'Teams not found.' });
    }
    teamsAndPlayersData = [];
    const userDataPromises = [];

  
    for(let team of teams) {
      if(team == null  || team == undefined) {
        continue;
      }
      userDataPromises.push(
        User.findById(team.createdBy).then(user => {
          team.createdBy = user.name;
          return { name: user.name, email: user.email };
        })
      );
      team.teams.forEach( t => {
        var i = 0;
        t.users.forEach(player => {
          if(i == 0){
            teamsAndPlayersData.push({
              name: t.name,
              player: player.name
            });
  
            i++;
          }
          else{
            teamsAndPlayersData.push({
              name: '',
              player: player.name
            });
          }
        });
      })
      
    }

    const userData = await Promise.all(userDataPromises);
    const uniqueUserData = Array.from(new Set(userData.map(u => u.email)))
    .map(email => {
      return userData.find(u => u.email === email);
    });
    console.log(userData);
    // Define the CSV file path
    const csvFilePath = 'teams_and_users.xlsx';

    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.json_to_sheet(teamsAndPlayersData);
    const ws2 = XLSX.utils.json_to_sheet(uniqueUserData);

    XLSX.utils.book_append_sheet(wb, ws1, 'Teams and Players');    
    XLSX.utils.book_append_sheet(wb, ws2, 'Users');

    console.log(ws1);

    XLSX.writeFile(wb, csvFilePath);

    console.log(csvFilePath);

    // return res.download(csvFilePath);
    return res.download(csvFilePath, 'teams_and_users.xlsx', (err) => {
      if (err) {
        throw new Error('Error sending file');
      } else {
        console.log('File sent');
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('An error occurred while generating the CSV file.');
  }
}

// exports.getAllTeams = async (req, res) => {
//   try {
//       const teams = await Team.find({});
//       if (!teams) {
//         return res.status(404).json({ message: 'Teams not found.' });
//       }
      
//       res.status(200).json(teams);
//   } catch (error) {
//       res.status(500).json({ message: error.message });
//   }
// }