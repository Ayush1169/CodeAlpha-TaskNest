const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    role: {
        type: String,
        enum: ['admin', 'member'],
        default: 'member'
    },
})

userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', userSchema)