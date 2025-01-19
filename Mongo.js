const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/ChatApp')
.then(() => {
    console.log("MongoDB connected")
})
.catch(() => {
    console.log("Connection Failed")
})

const UserAuthenticate = new mongoose.Schema({
    username:{
        type:String,
        require:true
    }
})

const User = new mongoose.model('collection1', UserAuthenticate)
module.exports = User;