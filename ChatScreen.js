import React,{useContext, useEffect, useState} from 'react'
import {View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image} from 'react-native';
import {GlobalContext} from '../context';
import Message from './Messages';
import Ionicons from 'react-native-vector-icons/Ionicons';
import UserProfile from '../assets/UserProfile.png';
import axios from 'axios';

export default function ChatScreen({route}) {
  const {newSocket, setNewSocket, user} = useContext(GlobalContext);
  const {receiverId,senderId} = route.params;
  const [username, setUsername] = useState("");
  const [dP, setDP] = useState("");
  const [mesg, setMesg] = useState("");
  const [allMessages, setAllMessages] = useState([]);

  useEffect(() => {
   newSocket.emit('findReceiver',{receiverId});
   
   const handleReceiverName = (item) =>{
    setUsername(item.username);
    console.log("Profile Picture:",item.profilePicture);
    setDP(item.profilePicture);
   }
   newSocket.on('getReceiverName',handleReceiverName);

   newSocket.emit('receiver',{receiverId,senderId});

   newSocket.on('receiveMessage',(data) => {
    if (data && data.id) {
      setAllMessages((prev) => [...prev, data]); 
    } else {
      console.warn("Received invalid message:", data);
    }
    });

    

  return () => {
    newSocket.off('getReceiverName', handleReceiverName);
    newSocket.off('receiveMessage');
  };
},[]);

  const handleMessage = async () => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    const time = {
      hrs: new Date().getHours() < 10 ?
           `0${new Date().getHours()}` :
           new Date().getHours(),
      min: new Date().getMinutes() < 10 ?
          `0${new Date().getMinutes()}` :
           new Date().getMinutes()
    }
    const newMessage = {
      id,
      timestamp: `${time.hrs}:${time.min}`,
      content: mesg,
      senderId,
      receiverId,
      user: user.username,
    };
  
    setAllMessages((prev) => [...prev, newMessage]);
    try{
      const res = await axios.post('http:192.168.120.75:5000/sendMessage',{
        id,
        senderId,
        receiverId,
        mesg,
        user: user.username,
        timestamp: `${time.hrs}:${time.min}`,
      });
      if(res.data.status==="Message Sent"){
        console.log("Message Sent");
      }
    }
    catch(e){

    }
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.head}>
      
        
        {dP ?
        (
        <Image source={dP ? { uri: `http://192.168.120.75:5000/${dP}` } : UserProfile} style={styles.dp} />
        )
      :
      (
        <Ionicons name='person' color={'white'} size={35} style={styles.userProfile}/>
      )
      }
        <Text style={styles.headText}>{username}</Text>
      </View>
      <View style={{flex:1}}>
        <FlatList 
        data={allMessages}
        keyExtractor={(item)=>item.id}
        renderItem={({item}) =>
        <Message item={item}/>
        }
        />
      </View>
      <View style={styles.textContainer}>
        <TextInput 
        placeholder='Write message'
        style={styles.text}
        value={mesg}
        onChangeText={(text)=> setMesg(text)}
        />
        <TouchableOpacity style={styles.button} onPress={() => {
          handleMessage()
          setMesg("");
          }
          }>
          <Text style={{color:'white'}}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  userProfile:{
    top:35,
    left:20,
    height: 50,
    width: 50,
    borderRadius:20,
    paddingVertical:5,
    paddingHorizontal:5,
    borderWidth: 1,
    borderColor:'white'
  },
  dp:{
    top:35,
    left:20,
    height: 50,
    width: 50,
    borderRadius:20
  },
  textContainer: {
    bottom:0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  
  container: {
    backgroundColor: 'lightgrey',
    flex: 1, 
  },
  head: {
    height: 100,
    flexDirection:'row',
    backgroundColor: 'rgba(0,0,256,0.5)'
  },
  headText: {
    color:'white',
    top: 45,
    left:30,
    fontSize: 20,
    fontWeight: 'bold',
    justifyContent: 'center',
    textAlign: 'center'
  },
  text:{
    left:10,
    borderWidth: 1,
    borderRadius:5,
    width:'80%',
    backgroundColor:'white'
  },
  button:{
    left:15,
    paddingVertical:10,
    paddingHorizontal:10,
    backgroundColor:'rgba(0,0,256,0.5)',
    borderRadius:10
  }
})