import React,{useContext, useEffect, useState} from 'react'
import {View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList} from 'react-native';
import {GlobalContext} from '../context';
import Message from './Messages';
import axios from 'axios';

export default function ChatScreen({route}) {
  const {newSocket, setNewSocket, user} = useContext(GlobalContext);
  const {receiverId,senderId} = route.params;
  const [username, setUsername] = useState("");
  const [mesg, setMesg] = useState("");
  const [allMessages, setAllMessages] = useState([]);

  useEffect(() => {
   newSocket.emit('findReceiver',{receiverId});
   
   const handleReceiverName = (username) =>{
    setUsername(username)
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
    backgroundColor: 'rgba(0,0,256,0.5)'
  },
  headText: {
    color:'white',
    top: 45,
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