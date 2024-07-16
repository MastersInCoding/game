const Events = require('../models/events');
const Team = require('../models/team');
const Player = require('../models/players');


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

exports.updateEvent = async (req, res) => {
    try {
        const id = req.params.id;
        const name = req.params.name;
        const eventExist = await Events.find({name: name});
        if(eventExist.length > 0) {
            return res.status(204).json({ message: 'Event already exists' });  // Event already exists, hence cannot update it. 400 Bad Request status code.  // If event already exists, we return a 400 Bad Request status code.  // If the event does not exist, we continue with the update operation.  // If the event does not exist, we return a 404 Not Found status code.  // If the event does exist, we continue with the update operation.  // If the event does exist, we return a 404 Not Found status code.  // If the event does exist, we continue with the update operation.  // If the event does exist, we return a 404 Not Found status code.  // If the event does exist, we continue with the update operation.  // If the event does exist, we return a 404 Not Found status code.
        }
        const event = await Events.findByIdAndUpdate(id, { name: name });
        if(!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        return res.status(200).json(event);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

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

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Events.findById(req.params.id);
        if(!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        console.log(event);
        if(event.active) {
            return res.status(204).json({status: 204, message: "Cannot delete active event" });
        }
        await Events.findByIdAndDelete(req.params.id)
        return res.status(200).json({status: 200, message: "Event deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.migratePlayerWithEvent = async (req, res) => {
    try {
        console.log("Y");
        const player = await Player.find({});
        player.forEach(async (p) => {
            console.log()
            const event = await Events.findOne({name: p.event});
            if(event){
                p.eventId = event._id;
                await p.save();
                console.log(p)
            }
        })
        return res.status(200).json({ message: "Event updated successfully" , players: player});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.migrateTeamWithEvent = async (req, res) => {
    try {
        const team = await Team.find();
        team.forEach(async (p) => {
            const event = await Events.findOne({name: p.event});
            if(event){
                p.eventId = event._id;
                await p.save();
            }
        })
        return res.status(200).json({ message: "Event updated successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};