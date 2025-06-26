const mongoose = require('mongoose')
const project = require('./project')
const { notify } = require('.')

const taskSchema = new mongoose.Schema({
    title: String,
    description: String,
    status: {
        type: String,
        enum: ['To Do', 'In progress', "Done"],
        default: "To Do"
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
},

    createdAt: {
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model("Task", taskSchema)