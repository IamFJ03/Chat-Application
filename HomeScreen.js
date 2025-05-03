import React,{useState, useEffect, useContext} from 'react';
import {View,Text, StyleSheet, FlatList, TouchableOpacity, Alert} from 'react-native';
import { GlobalContext } from '../context';
import AntDesign from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
let socket;

export default function HomeScreen({navigation}) {
  const {user, setUser, newSocket, setNewSocket} = useContext(GlobalContext);
  const [chatUsers, setChatUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    const initialize = async () => {
      const token = await AsyncStorage.getItem('token');
      try {
        const res = await axios.get("http://192.168.120.75:5000/fetch", {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.data.status === 'verified') {
          console.log(res.data.chatUsers);
          console.log(res.data.chatUsers.messages)
          setUser(res.data.user);
          console.log(res.data.user.profilePicture);
          const filteredUsers = res.data.chatUsers.map(item => {
            const chatPartner = item.Person1._id === res.data.user._id ? item.Person2 : item.Person1;
            const lastMessage = item.messages?.[item.messages.length - 1] || null;
            return {
              ...chatPartner,
              lastMessage,
            };
          });
          

          setChatUsers(filteredUsers);

          if (!socket) {
            socket = io('http://192.168.120.75:5000');
            setNewSocket(socket);
            socket.emit('register', res.data.user._id); 
            console.log(`Socket registered for user: ${res.data.user._id}`);

            socket.on('receiveNotification', ({notification}) => {
              console.log("New Notification:", notification.type);
              setNotifications((prev) => [...prev, notification]);
            });
          }
        }
      } catch (e) {
        console.error('Error during initialization:', e);
      }
    };

    initialize();

    return () => {
      if (socket) {
        socket.disconnect(); 
        socket = null;
      }
    };
  }, []);

  const redirect = async (receiverId) => {
    try{
      const res = await axios.post("http://192.168.120.75:5000/checkStatus",{
        senderId: user._id,
        receiverId: receiverId
      });
      if(res.data.status==="Request is accepted")
        navigation.navigate('ChatScreen',{
      receiverId,
      senderId: user._id
        });
      else
      Alert.alert("Error","Something went wrong");
    }
    catch(e){
      console.log("Error:",e);
    }
  }

  return (
    <View style={{flex: 1, backgroundColor:'lightgrey'}}>
      <View style={styles.head}>
        <Text style={styles.headText}>MessToC</Text>
        <AntDesign name={'notification'} size={25} color={'white'} style={{alignSelf:'flex-end',top:18,right:15}} onPress={() => navigation.navigate('Notification',{
                  notifications
                })}/>
      </View>
      <FlatList
      data={chatUsers}
      keyExtractor={(item) => item._id.toString()}
      renderItem={({item}) => (
        <TouchableOpacity style={styles.userRecords} onPress={() => redirect(item._id)}>
          <View style={{flexDirection:'row'}}>
        <Text style={{color:'black', fontSize:17, fontWeight:'bold'}}>{item.username}</Text>
        <Text style={{color:'black',alignSelf:'flex-end', left:190}}>{item.lastMessage?.timestamp || ''}</Text>
        </View>
        <Text style={{color:'black'}}>{item.lastMessage?.content}</Text>
        </TouchableOpacity>
      )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  userRecords:{
   top:20,
   width:'95%',
   height:80,
   marginTop:5,
   marginLeft:10,
   backgroundColor:'white',
   borderRadius:5,
   paddingVertical:20,
   paddingHorizontal:10
  },
  headText:{
    fontSize:25,
    fontWeight:'condensed',
    color:'white',
    top:45,
    left:35
  },
  head:{
    height:100,
    width:'100%',
    backgroundColor:'rgba(0,0,256,0.5)'
  }
})