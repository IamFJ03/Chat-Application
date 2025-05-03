import React,{useState} from 'react'
import Icons from 'react-native-vector-icons/MaterialIcons'
import {View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import axios from 'axios';

export default function NotificationScreen({route, navigation}) {
  const {notifications:initialNotifications, newSocket} = route.params;

  const [status, setStatus] = useState("");
  const [senderId, setSenderId] = useState("");
  const [notification,setNotification] = useState(initialNotifications);
  const handlePermission = async (status,senderId, receiverId) => {
    try{
      const res = await axios.post('http:192.168.120.75:5000/permission',{
        status, senderId, receiverId
      });
      if(res.data.status==="Successfull")
        setNotification((prev) => prev.filter((notification) => notification.senderId!== senderId))
    }
    catch(e){

    }
  }
  return (
    <View style={{flex:1, backgroundColor:'lightgrey'}}>
        <View style={styles.head}>
          <Icons name={'arrow-back'} size={30} color={'black'} style={{top:50,left:10}} onPress={() => navigation.navigate('Tab')}/>
          <Text style={styles.headText}>Notifications</Text>
        </View>
        <FlatList 
        data={notification}
        keyExtractor={(item)=> item._id}
        renderItem={({item}) => 
        <View style={styles.messageContainer}>
          <Text style={{fontWeight:'bold',fontSize:16,marginBottom:10}}>{item.sender} is asking permission to chat with you</Text>
          <Text>
            Permission type:  {item.type}
          </Text>
          <View style={{flexDirection:'row'}}>
          <TouchableOpacity style={styles.button} onPress={() => {
            
            handlePermission("Accept",item.senderId,item.receiverId);
            }}>
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => {
            handlePermission("Decline",item.senderId,item.receiverId);
            }}>
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
          </View>
          
        </View>
        }
        />
    </View>
  )
}

const styles= StyleSheet.create({
  head:{
    flexDirection:'row',
    height:100,
    backgroundColor:'white'
  },
  headText:{
    top:50,
    fontSize:20,
    fontWeight:'bold',
    left:80
  },
  messageContainer:{
    top:20,
    left:20,
    height:200,
    width:'85%',
    backgroundColor:'white',
    borderRadius:10,
    elevation:20,
    paddingVertical:20,
    paddingHorizontal:20
  },
  button:{
    top:20,
    width:100,
    backgroundColor:'#007bff',
    paddingVertical:10,
    paddingHorizontal:20,
    marginLeft:20,
    borderRadius:10
  },
  buttonText:{
    color:'white'
  }
})