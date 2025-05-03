const mongoose = require('mongoose')
const connectDB = require('./connection');
const User = require('./Mongo');



const NotificationSchema = new mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User,
        required:true
    },
    sender:{
        type: String,
        required: true
    },
    receiverId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:User,
        required:true
    },
    receiver:{
        type: String,
        required: true
    },
    type: { 
        type: String, 
        enum: ['message-access', 'friend-request', 'comment', 'like'], 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'read', 'accepted', 'declined'], 
        default: 'pending' 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
})

const messageSchema = new mongoose.Schema({
    Person1:{
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required:true
    },
    Person2:{
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required:true
    },
    messages:[
        {
            id:{
                type:String,
                required:true,
            },
            sender:{
                type: String,
                required:true,
            },
            senderId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: User,
                required:true
            },
            receiverId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: User,
                required:true
            },
            content:{
                type:String,
                required: true
            },
            timestamp: {
                type: String, 
                required:true, 
            },
          
          read: {
            type: Boolean, 
            default: false,
          },
          type: {
            type: String,
            default: 'text',
          },
        }
    ]
})

const message = new mongoose.model('Message', messageSchema);
const notify = new mongoose.model('Notification', NotificationSchema);
module.exports = {notify, message};