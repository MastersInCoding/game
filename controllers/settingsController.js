const Settings = require('../models/settings');


exports.changeTeamCreations = async (req, res) => {
    try {
        const { showTeamCreation, id } = req.body;

        let settings;

        if (id) {
            settings = await Settings.findByIdAndUpdate(id, {
                isActive: showTeamCreation,
                lastUpdatedAt: Date.now()
            });

            if (!settings) {
                return res.status(404).json({ message: "Settings not found" });
            }
        } else {
            // If no ID provided, create a new Settings document
            settings = new Settings({
                isActive: showTeamCreation,
                lastUpdatedAt: Date.now(),
                name: 'Team Creation Settings'
            });

            await settings.save();
        }

        return res.status(200).json({ message: "Successfully updated team", settings });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


exports.getSettings = async (req, res) => {
    try {
        const settings = await Settings.findOne({});
        return res.status(200).json(settings);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};