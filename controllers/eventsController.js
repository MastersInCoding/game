const Events = require('../models/events');


exports.changeEvent = async (req, res) => {
    try {
       
        const selectedValue = req.body.selectedValue
        const event = await Events.findOne({});

        event.name = selectedValue;
        event.lastUpdatedAt = Date.now();
        await event.save();

        return res.status(200).json({ message: "Successfully updated team", event, code: 200 });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


exports.createEvent = async (req, res) => {
    try {
        const events = new Events({
            lastUpdatedAt: Date.now(),
        });

        await events.save();

        return res.status(201).json(events);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}


exports.getEvents = async (req, res) => {
    try {
        const events = await Events.findOne({});
        return res.status(200).json(events);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};