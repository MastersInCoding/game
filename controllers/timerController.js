const Timer = require('../models/timer');

exports.getTimer = async (req, res) => {
    let timer = await Timer.findOne();
    if (!timer) {
        return res.status(404).json({ message: 'Timer not found' });
    }
    return res.status(200).json({ timer});
};

exports.updateTimer = async (req, res) => {
    try {
        const { endTime } = req.body;
        const timer = await Timer.findOne();
        timer.endTime = endTime;
        timer.lastUpdatedAt = Date.now();
        await timer.save();
        return res.status(200).json(timer);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.createTimer = async (req, res) => {
    try {
        const timer = await Timer.findOne();
        if(!timer){
            const newTimer = new Timer({
                endTime: Date.now() + 1000
            });
            await newTimer.save();
            return res.status(200).json(timer);
        }
        return res.status(409).json(timer);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};