const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    filename:{
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        required: true
    },
    parent : {
        type: String,
        required: true,
        unique: true
    },
    lastUpdatedAt : {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('FileSchema', FileSchema);