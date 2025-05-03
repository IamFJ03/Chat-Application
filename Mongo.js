const mongoose = require('mongoose')
const connectDB = require('./connection');



const UserAuthenticate = new mongoose.Schema({
    profilePicture:
    {
        type:String,
        required: false
    },

    username:
    {
        type:String,
        required:true
    },
    about:{
        type: String,
        required: false
    },
    number:{
        type:String,
        required: false
    }
})

const User = new mongoose.model('collection2', UserAuthenticate)
module.exports = User;