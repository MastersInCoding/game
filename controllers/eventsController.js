const Events = require('../models/events');


exports.changeEvent = async (req, res) => {
    try {
       
        const selectedValue = req.body.selectedValue;
        console.log(req.body)
        const event = await Events.findOne({active: true});
        if(event){
            event.active = false;
            event.lastUpdatedAt = Date.now();
            await event.save();
        }
        const newEvent = await Events.findOneAndUpdate({name: selectedValue}, { lastUpdatedAt: Date.now(), active : true});
        console.log(newEvent);

        return res.status(200).json({ message: "Successfully updated team", event: newEvent, code: 200 });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


exports.createEvent = async (req, res) => {
    try {
        const name = req.body.name;
        // await Events.findOneAndDelete({});

        // const s = await Events.find({});
        // console.log(s);
        // console.log(name);
        const existingEvent = await Events.findOne({name: name});
        // console.log(existingEvent);
        if (existingEvent) {
            return res.status(400).json({ message: 'Event already exists' });
        }
        const events = new Events({
            name: name,
            lastUpdatedAt: Date.now(),
        });

        await events.save();

        return res.status(201).json(events);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
}

exports.getEvents = async (req, res) => {
    try {
        const events = await Events.find({});
        return res.status(200).json(events);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.getCurrentEvent = async (req, res) => {
    try {
        const event = await Events.findOne({active: true});
        return res.status(200).json(event);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};