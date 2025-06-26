const mongoose = require('mongoose')
const commentSchema = new mongoose.Schema({
    text: String,
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    craetedAt: {
        type: Date,
        default: Date.now
    }
})
module.exports = mongoose.model('Comment', commentSchema)