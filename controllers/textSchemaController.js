const TextSchema = require('../models/textSchema');


exports.changeTextSchema = async (req, res) => {
    try {
        const { name, content } = req.body;

        const textSchema = await TextSchema.findOne({name: name});

        textSchema.content = content;
        textSchema.lastUpdatedAt = Date.now();

        await textSchema.save();

        return res.status(200).json({ message: "Successfully updated team", textSchema });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.createTextSchema = async (req, res) => {
    try {

        const textSchema = new TextSchema({
            name: 'termsandconditions',
            content: '"Prize"'
        });

        await textSchema.save();

        // const lSchema = new TextSchema({
        //     name: 'leaderboard',
        //     content: '"Leaderboard"'
        // });


        // const r = new TextSchema({
        //     name: 'rule',
        //     content: '"Rule"'
        // });

        // await lSchema.save();
        // await r.save();

        return res.status(201).json(textSchema);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


exports.getSchema = async (req, res) => {
    try {
        const name = req.params.name;
        const textSchema = await TextSchema.findOne({ name: name });
        return res.status(200).json(textSchema);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};