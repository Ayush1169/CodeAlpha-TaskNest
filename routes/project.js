const mongoose = require('mongoose')
const projectSchema = new mongoose.Schema({
    name: String,
    description: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model('Project', projectSchema)