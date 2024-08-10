const TextSchema = require('../models/textSchema');
const FileSchema = require('../models/fileSchema');
const path = require('path');



exports.changeTextSchema = async (req, res) => {
    try {
        const data = JSON.parse(req.body.data);
        console.log(data.name, data.removeAttachment);
        const textSchema = await TextSchema.findOne({name: data.name});
        
        textSchema.content = data.content;
        textSchema.lastUpdatedAt = Date.now();
        console.log(req.file);
        const fileSchema = await FileSchema.findOne({textSchema: textSchema});
        
        if(data.removeAttachment == false) {
            console.log("1");
            fileSchema.filename = ' ';
            fileSchema.path = ' ';
            fileSchema.contentType = ' ';
            fileSchema.lastUpdatedAt = Date.now();
            // delete old file schema
        }
        else{
            console.log("3");
            fileSchema.filename = req.file.originalname;
            fileSchema.path = req.file.path;
            fileSchema.contentType = req.file.mimetype;
            fileSchema.lastUpdatedAt = Date.now();
        }
        
        console.log(fileSchema);
        // const file = new FileSchema({
        //     filename: req.file.filename,
        //     path: req.file.path,
        //     contentType: req.file.mimeType,
        //     parent: textSchema,
        //     lastUpdatedAt: Date.now()
        // });

        await textSchema.save();
        await fileSchema.save();

        // return res.status(200).json({ message: "Successfully updated team", textSchema });
        return res.status(200).json({ message: "Successfully updated team" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.createTextSchema = async (req, res) => {
    try {

        const textSchema = new TextSchema({
            name: 'termsandconditions',
            content: '"termsandconditions"'
        });

        await textSchema.save();

        const lSchema = new TextSchema({
            name: 'leaderboard',
            content: '"Leaderboard"'
        });


        const r = new TextSchema({
            name: 'rule',
            content: '"Rule"'
        });

        const news = new TextSchema({
            name: 'news',
            content: '"Rule"'
        });

        const prize = new TextSchema({
            name: 'prize',
            content: '"Prize"'
        });

        await lSchema.save();
        await r.save();
        await news.save();
        await prize.save();

        return res.status(201).json(textSchema);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


exports.getSchema = async (req, res) => {
    try {
        const name = req.params.name;
        const textSchema = await TextSchema.findOne({ name: name });
        const fileSchema = await FileSchema.findOne({ textSchema: textSchema});
        return res.status(200).json({textSchema, fileSchema});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.migrateParentWithName = async (req, res) => {
    try {
        const fileSchema = await FileSchema.find({});
        for(let i=0; i<fileSchema.length; i++) {
            const textSchema = await TextSchema.findOne({name: fileSchema[i].parent});
            fileSchema[i].textSchema = textSchema;
            await fileSchema[i].save();
        }
        return res.status(200).json({ message: "Successfully updated FileSchema" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.createFileSchema = async (req, res) => {
    try {
        const textSchema = await TextSchema.findOne({ name: req.params.name });
        const fileSchema = new FileSchema({
            filename: ' ',
            path: ' ',
            contentType: ' ',
            textSchema: textSchema,
            lastUpdatedAt: Date.now()
        });

        await fileSchema.save();

        return res.status(201).json(fileSchema);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.downloadAttachment = async (req, res) => {
    try {
        const id = req.params.id;
        const fileSchema = await FileSchema.findById(id);
        res.download(fileSchema.path, fileSchema.filename);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


exports.viewAttachment = async (req, res) => {
    try {
        const id = req.params.id;
        const fileSchema = await FileSchema.findById(id);
        const filePath = path.resolve(fileSchema.path);
        res.sendFile(filePath, {
            headers: {
                'Content-Type': fileSchema.contentType,
                'Content-Disposition': 'inline'
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};