const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const User = require('./Mongo');
const http = require('http').Server(app);
const cors = require('cors');
const socketIO = require('socket.io')(http,{
    cors : {
        origin : 'http://192.168.36.75:5000',
    },
});

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cors())

let chatGroups = [];

function createUniqueId(){
    return Math.random().toString(20).substring(2,10);
} 

socketIO.on('connection',(socket) =>{
    console.log(`${socket.id} user is connected`)
    
    socket.on('getAllGroups', () => {
        socket.emit('groupList', chatGroups)
    })

    socket.on('createNewGroup',(groupName) => {
        chatGroups.unshift({
            id: chatGroups.length + 1,
            groupName,
            messages: [],
        });
        socket.emit('groupList', chatGroups)
    });
    socket.on('findGroup', (id) => {
        const filteredGroup = chatGroups.filter(item => item.id === id)
        socket.emit('foundGroup', filteredGroup[0].messages)
    })
    socket.on('newChatMessage',(data) => {
     const { username, GroupIdentifier, Time, inputMessage } = data;
     const filteredGroup = chatGroups.filter(item => item.id === GroupIdentifier);
     const newMessage = {
        id: createUniqueId(),
        text: inputMessage,
        username,
        time: `${Time.hrs}:${Time.min}`
     }

     socket.to(filteredGroup[0].inputMessage).emit('groupMessage', newMessage);
     filteredGroup[0].messages.push(newMessage)
     socket.emit('groupList', chatGroups);
     socket.emit("foundGroup", filteredGroup[0].messages);
    })
});

app.post('/Login',async (req,res) => {
    const {username} = req.body;
    try{
        const check = await User.findOne({username});
        if(check){
            const user = {username: check.username}
            const token = jwt.sign(user,'iamFJ',{expiresIn: '2h'}, (err, token) => {
                res.json({status:"Authentication Succesfull",token});
            })
        }
        else{
            res.json({status:"User not found"});
        }
    }
    catch(e){
        return res.status(500).json({ error: "Internal Server Error", details: e.message });
    }
})

function authenticateToken(req, res, next){
    const authHeader = req.headers['authorization'];
    if(!authHeader)
        res.status(505).json({error:"Not found"});
    const token = authHeader.split(' ')[1];
    if(!token){
        return res.status(401).json({ message: "Token is missing from Authorization header" });
    }
    jwt.verify(token,'iamFJ',(err, user) => {
      if(err)
        return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    req.token = token;
    next();
    })
}

app.post('/Signin', async (req,res) =>{
    const {username} = req.body;
    try{
        const check = await User.findOne({username});
        if(check)
            res.json({status:"User Already Exists"})
        else{
        const newUser = await User.create({ username })
        res.json({status:"User Created", credential:newUser})
        }
    }
    catch(e){
        console.log(e);
    }
})

app.get('/fetch',authenticateToken, (req, res) => {
    const username = req.user.username;
    res.json({user:username});
})

http.listen(5000, '192.168.36.75', () => 
 console.log("Server started")
)