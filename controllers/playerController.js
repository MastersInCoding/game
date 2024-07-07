const User = require('../models/user');
const Team = require('../models/team');
const Player = require('../models/players');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const { team } = require('./teamController');
const Events = require('../models/events');



exports.addPlayer = async (req, res) => {
    try {
        const workbook = xlsx.readFile(path.join(__dirname, 'datas.xlsx'));
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Convert data and save to MongoDB
        data.forEach(async (row) => {
            const newData = new Player({
                name: row['Name'],
                points: row['Points']
            });
            try {
                await newData.save();
            } catch (err) {
                console.error('Error saving data to MongoDB:', err);
            }
        });
        return res.status(200).json({player : player});
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message });
    }
};

// exports.deleteAllPlayer = async (req, res) => {
//     try {
//         await Player.deleteMany({});
//         console.log("All documents deleted successfully!");
//         res.status(200).json({message: "All documents deleted successfully!"});
//     } catch (error) {
//         console.error("Error deleting documents:", error);
//     } 
// };

exports.getPlayers = async (req, res) => {
    try {
        const players = await Player.find({}, 'name points teams').populate('teams').sort({ points: -1});
        return res.status(200).json({users : players});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.getPlayersEvent = async (req, res) => {
    try {
        const event = await Events.findOne({active: true});
        let players;
        if(event.name === 'US')
            players = await Player.find({}, 'name points teams').populate('teams').sort({ points: -1});
        else
            players = await Player.find({event : event.name}, 'name points teams').populate('teams').sort({ points: -1});
        return res.status(200).json({users : players});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.getPlayersByUser = async (req, res) => {
    try {
        const players = await Player.find({}, 'name points teams').populate('teams').sort({points: -1});
        const user = await User.findOne({email: req.params.userEmail});
        // console.log(user.)
        var showableUsers = [];
        players.forEach(async player => {
            var count = 0;
            
            // console.log(t.teams.length)
                // await player.teams.forEach(async a => {
                //     t = await Team.findById(a);
                //     // teams.push(t);
                //     if(t != null)
                //         if(player._id.toString() == '6643c561a722d1fa40a17dc0')
                //             console.log('Players', count);
                //     count++;
                // });
                
            if(player.teams.length < 5) {
                showableUsers.push(player);
            }
        })
        return res.status(200).json({showableUsers : showableUsers, allUsers : players});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


exports.saveSelectedPlayers = async (req, res) => {
    try {
        const { createdBy, selectedUserIds, teamName } = req.body;
    
        const selectedUsers = await Player.find({ _id: { $in: selectedUserIds } });
    
        if (!selectedUsers || selectedUsers.length === 0) {
          return res.status(404).json({ message: 'No player found with the provided IDs' });
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


exports.getAdmin = async (req, res) => {
    res.redirect('/admin.html');
};

exports.deletePlayer = async (req, res) => {
    try {
        const player = await Player.findByIdAndDelete(req.params.id);
        if(player){
            res.json({ message: 'Player deleted successfully.' });
        }
        else{
            res.status(500).send({message: 'Player not found'});
        }
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error'});
    }
};

exports.updatePlayer = async (req, res) => {
    try {
        const { playerName, points, playerId} = req.body;

        const player = await Player.findById(playerId);

        if(!player) {
            return res.status(404).json({ message: 'Player not found.' });
        }

        if(playerName !== player.name) {
            const existingUser = await Player.find({name: playerName});
            if(existingUser.length > 0) {
                return res.status(409).json({ message: 'Player Name already exists.' });
            }
        }
        

        player.name = playerName;
        player.points = points;

        await player.save();

        return res.status(200).json({ message: "Player updated successfully" });
        
    } catch (error) {
        console.error('Error updating team:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

exports.getPlayerById = async (req, res) => {
    try {

        const player = await Player.findById(req.params.id);

        if(!player) {
            return res.status(404).json({ message: 'Player not found.' });
        }

        return res.status(200).json( {
            id: player._id,
            name: player.name,
            points: player.points
        } );
        
    } catch (error) {
        console.error('Error updating team:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


exports.savePlayer = async (req, res) => {
    try {

        const {playerName, points} = req.body;
        const playerByName = await Player.find({name: playerName});
        
        if(playerByName.length > 0) {
            return res.status(409).json({ message: 'Player Name already exists.' });
        }
        
        const player = new Player({name: playerName, points});
        
        await player.save();

        return res.status(200).json({message: "Successfully saved player"});
        
    } catch (error) {
        console.error('Error updating team:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
};