const express = require('express')
const cors = require('cors')
const app = express()
const User = require('./Mongo');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const http = require('http');
const {Server} = require('socket.io');
const server = http.createServer(app);
const io = new Server(server);
const {notify, message} = require('./Notification');
const connectDB = require('./connection');
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cors())
app.use('/uploads',express.static(path.join(__dirname,'uploads')));

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    }
});

const upload = multer({storage: storage});

let notific = [];
connectDB();
app.post('/Login',async (req,res) => {
    const {username} = req.body;
    try{
    const check = await User.findOne({username});
    if(check){
        const user = {username: check.username, _id: check._id}
        const token = jwt.sign(user, 'iamFJ', {expiresIn:'2h'}, (err, token) => {
            res.json({status:'Authenticated',token})
        })
    }
    else
    res.json({status:"User Not Found"});
    }
    catch(e){

    }
})

function Authentication(req,res,next){
    const authHeader = req.headers['authorization'];
    if(!authHeader)
        res.status(500).json({error:"Internal Error"});
    const token = authHeader.split(' ')[1];
    if(!token)
        return res.status(401).json({ message: "Token is missing from Authorization header" });
    jwt.verify(token,'iamFJ',(err,user) => {
        if(err)
            return res.status(505).json({error:"Not Found"});
        req.user = user;
        req.token = token;
        next();
    })
}

app.post('/SignIn', async (req,res) => {
    const {username} = req.body;
    const check = await User.findOne({username});
    if(check){
        console.log(username);
        res.json({message:"Already Exist"});
    }
    else{
        const newUser = await User.create({username:username});
        res.json({message:"User Created",user:newUser})
    }
});

app.post('/upload-image', upload.single('image'), async (req, res) => {
    console.log("You are a fool",req.file)
    try{
      const insert = await User.findOneAndUpdate({username: req.body.username},
         {profilePicture: req.file.path},
        {new: true}
    );
      if(insert)
        res.json({status:"Profile Picture Updated", upload: insert});
    }
    catch(error){
        res.status(404).json({status:"Internal Server Error"});
    }
  });

app.get('/fetch',Authentication, async (req,res)=>{
    const username = req.user;
    const find = await message.find({
        $or:[
            {Person1: username._id},
            {Person2: username._id}
        ]
    })
    .populate('Person1', 'username profilePicture')
    .populate('Person2', 'username profilePicture')

    if(find){
        console.log(find);
    res.json({status:"verified",user:username, chatUsers: find});
    }
})
app.get('/fetch-User', Authentication, async (req, res)=>{
    const user = req.user;
    try{
    const find = await User.findOne({username: user.username});
    if(find){
        console.log(find);
        res.json({status:"User Found", data: find});
    }
    else console.log("There might be some issue");
}
catch(error){
    res.status(404).json({status:"Internal Server Error"});
}
})

app.post('/update', Authentication, async (req, res)=> {
    const id = req.user._id;
    console.log(id);
    const newUsername = req.body.newUsername;
    const about = req.body.about;
    const number = req.body.number;
    console.log("Backend");
    try{
        const updated = await User.findOneAndUpdate({_id: id},
            {username: newUsername, about: about, number: number},
            {new : true}
        )
        console.log(updated);
        if(updated){
            res.json({status:"Congo it's done", newData: updated});
        }
    }
    catch(error){
        res.status(404).json({error:"Inter Server Error"});
    }
})

app.get('/search', async (req,res) => {
    const {username} = req.query;
    try{
    const check = await User.find({username: {$regex: username, $options: 'i'} });
    if(check && username.length > 0)
        res.json({status:"success",user:check})
    else
        res.json({status:"no results", user:[] });
}
catch(e){
    res.status(505).json({error:"Internal Error"});
}
})

const userSocketMap = new Map();
io.on('connection',(socket) => {
    console.log(`${socket.id} user is connected`);

    socket.on('register', async (userId) => {
        console.log(`Registering user: ${userId} with socket ID: ${socket.id}`);
        userSocketMap.set(userId,socket.id);

        const pendingNotification = await notify.find({
            receiverId: userId,
            status: { $in: ['pending','delivered']}
        });
        pendingNotification.forEach((notification) => {
            socket.emit('receiveNotification',{notification});
        });
        await notify.updateMany({receiverId: userId, status:'pending'},{status:'delivered'});
    });

    socket.on('findReceiver', async ({receiverId}) => {
        
        const found = await User.findOne({_id: receiverId});
        if(found){
            socket.emit('getReceiverName',{username: found.username, profilePicture: found.profilePicture});
        }
        else
        console.log("error");
    });
    socket.on('receiver', async ({ senderId, receiverId }) => {
        const retrieve = await message.findOne({
            $or: [
                {Person1: senderId, Person2: receiverId},
                {Person1: receiverId, Person2: senderId}
            ]
        });
    
        if (retrieve) {
            const messages = retrieve.messages

            messages.forEach((msg) =>{
                socket.emit('receiveMessage', msg);
            })
            
        } else {
            socket.emit('receiveMessage', []);
        }
    });
    

    socket.on('disconnect',()=>{
        console.log("User disconnected", socket.id);
    });
});
app.post('/checkStatus', async(req, res) => {
    const {senderId, receiverId} = req.body;
    const check = await notify.findOne({
        $or:[
        {senderId: senderId, receiverId: receiverId},
        {senderId: receiverId, receiverId: senderId}
    ]
});
    
    try{
      if(check){
        
        if(check.status==='Accept')
            res.json({status:"Request is accepted"});
        else if(check.status==='pending' || check.status==='delivered')
            res.json({status:'delivered'});
        else
            res.json({status:'declined'});
      }
    
      else
        res.json({status:"declined"});
      }
catch(e){

}
})
app.post('/Notification', async (req, res) => {
    const {senderId, receiverId} = req.body;
    const check = await notify.findOne({senderId: senderId, receiverId: receiverId});
    const sender = await User.findOne({_id:senderId});
    const receiver = await User.findOne({_id:receiverId});
    try{
      if(check && check.status==='Decline'){
        await notify.updateOne({senderId},{$set:{status:'delivered'} })
      }
      else{
      const newNotification = await notify.create({
        senderId: senderId,
        sender: sender.username,
        receiverId: receiverId,
        receiver: receiver.username,
        type: 'message-access',
        status:'pending',
        createdAt: new Date()
      });
      const receiverSocketId = userSocketMap.get(receiverId);
      console.log(receiverSocketId);
      if(receiverSocketId){
        io.to(receiverSocketId).emit('receiveNotification',{notification: newNotification});
        await notify.findByIdAndUpdate(newNotification._id,{status:'delivered'})
      }
      else
        console.log(`Receiver ${receiverId} is not connected`);
      res.json({status:"success"});
    }
}
    catch(e){
      console.log("Error in sending request",e);
      res.status(505).json({error:"Internal Server Error"});
    }
})

app.post('/sendMessage', async (req,res) => {
    
    const {id, senderId, receiverId, mesg, user, timestamp} = req.body;
    const check = await message.findOne({
        $or:[
            {Person1: senderId, Person2: receiverId},
            {Person1: receiverId, Person2: senderId}
        ]
    });
    console.log("sendMessage running...");
    const newMessage = {
        id: id,  
        sender: user,
        senderId: senderId,
        receiverId: receiverId,
        content: mesg,
        timestamp: timestamp,
        read: false
    };
    let updated;
    try{
        if(check){
            updated = await message.updateOne({
            $or:[
                {Person1: senderId, Person2: receiverId},
                {Person1: receiverId, Person2: senderId}
            ]
        },
         {
            $push:{
                messages:{
                    id:id,
                    sender:user,
                    senderId: senderId,
                    receiverId: receiverId,
                    content: mesg,
                    timestamp: timestamp,
                    read: false
                }
            }
         });
        }
        else{
                updated = await message.create({Person1: senderId, Person2: receiverId, messages:[{
                    id:id,
                    sender: user,
                    senderId: senderId,
                    receiverId: receiverId,
                    content: mesg,
                    timestamp: timestamp,
                    read: false
                    }]
                });
            }
        console.log(updated);
        if(updated)
            res.json({status:"Message Sent", sender: updated.senderId})
        const receiverSocketId = userSocketMap.get(receiverId);
        if(receiverSocketId)
            io.to(receiverSocketId).emit('receiveMessage',newMessage);
        else
           console.log('Receiver Not Connected');
    }
    catch(e){

    }
})

app.get('/getMessages', async (req, res) => {
    const { senderId, receiverId } = req.query;
    
    try {
        const chat = await message.findOne({
            $or: [
                { Person1: senderId, Person2: receiverId },
                { Person1: receiverId, Person2: senderId }
            ]
        });

        if (chat) {
            res.json({ messages: chat.messages });
        } else {
            res.json({ messages: [] });
        }
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.post('/permission', async (req, res) => {
    const {senderId,receiverId, status} = req.body;
    console.log(senderId);
    try{
        const updated = await notify.updateOne(
            { senderId, receiverId },
            { $set: { status } }
        );
       
        res.json({status:"Successfull"})
    }
    catch(e){
        res.status(505).json({error:"Internal Server Error"});
    }
})

server.listen(5000, '0.0.0.0', () => 
  console.log("Server Started")
)