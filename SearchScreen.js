import React, { useEffect, useState,useContext } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Modal, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import { GlobalContext } from '../context'; 
let socket;

export default function SearchScreen({navigation}) {
  const {newSocket, setNewSocket,user, setUser } = useContext(GlobalContext);
  const [receiverId, setReceiverId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const initialize = async () => {
      const token = await AsyncStorage.getItem('token');
      try {
        const res = await axios.get("http://192.168.120.75:5000/fetch", {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.data.status === 'verified') {
          setUser(res.data.user);

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

  const handleSearchQuery = async (query) => {
    setSearchQuery(query);
    console.log(query);
    try {
      const res = await axios.get("http://192.168.120.75:5000/search", {
        params: { username: query },
      });
      if (res.data.status === 'success') {
        setSearchResult(res.data.user);
      }
    } catch (e) {
      console.error('Error searching users:', e);
    }
  };
  const checkStatus = async (receiverId) => {
    try {
      const res = await axios.post('http://192.168.120.75:5000/checkStatus', {
        senderId: user._id,
        receiverId: receiverId
      });
    if(res.data.status==="Request is accepted")
      navigation.navigate('ChatScreen',{
    receiverId,
    senderId: user._id
      });
    else if(res.data.status==='delivered')
      Alert.alert("Error","Message already Sent");
    else
      setModalVisibility(true);
    } catch (e) {
      console.error('Error sending permission request:', e);
    }
  };
  const RequestPermission = async () => {
    console.log(receiverId);
    try {
      const res = await axios.post('http://192.168.120.75:5000/Notification', {
        senderId: user._id,
        receiverId: receiverId
      });
    if(res.data.status==='Message already sent')
      Alert.alert("Error","Request already sent");
    else
      Alert.alert("Successfull","Request Sent Successfully");
    } catch (e) {
      console.error('Error sending permission request:', e);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'lightgrey' }}>
      <View style={styles.head}>
        <Text style={styles.headText}>{user.username}</Text>
        
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.text}
          placeholder='Search for Users...'
          value={searchQuery}
          onChangeText={handleSearchQuery}
        />
      </View>
      {searchQuery.length > 0 ? (
        <FlatList
          style={styles.searchList}
          data={searchResult}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.searchElement}
              onPress={() => {
                setReceiverId(item._id);
                checkStatus(item._id);
              }}
            >
              <Text style={{backgroundColor:'rgba(0,0,256,0.5)',borderRadius:10,paddingHorizontal:10,paddingVertical:15,color:'white'}}>{item.username}</Text>
            </TouchableOpacity>
          )}
        />
      ) : null}
      <Modal
        visible={modalVisibility}
        transparent={true}
        onRequestClose={() => setModalVisibility(false)}
        animationType='slide'
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={styles.modalContainer}>
            <Text style={{ textAlign: 'center',marginBottom: 10, fontSize: 18, fontWeight: 'bold', borderBottomWidth: 2 }}>
              Access Permission
            </Text>
            <Text style={{ width:'85%', top: 10, left: 15, fontSize: 16 }}>Permission required to chat with the User!!</Text>
            <View style={{ flexDirection: 'row', top: 25, left: 10 }}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  RequestPermission();
                  setModalVisibility(false);
                  Alert.alert("Successfull", "Request Sent Successfully");
                }}
              >
                <Text style={styles.buttonText}>Request</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => setModalVisibility(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    margin: 15,
    marginRight: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0,0,256,0.5)'
  },
  buttonText: {
    color: 'white'
  },
  modalContainer: {
    top: 200,
    left: 50,
    height: 240,
    width: 280,
    paddingTop: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 10
  },
  searchElement: {
    
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    width: '85%',
    left: 20,
    backgroundColor: 'white',
    borderRadius: 10
  },
  searchList: {
    
    top: 50
  },
  searchContainer: {

    flexDirection: 'row'
  },
  text: {
    top: 20,
    width: '70%',
    marginLeft: 50,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  searchButton: {
    top: 20,
    left: 10,
    backgroundColor: 'white',
    paddingHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 10
  },
  headText: {
    color:'white',
    top: 45,
    fontSize: 20,
    fontWeight: 'bold',
    justifyContent: 'center',
    textAlign: 'center'
  },
  head: {
    height: 100,
    backgroundColor: 'rgba(0,0,256,0.5)'
  }
});
