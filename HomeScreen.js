import React, { useContext, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, TouchableOpacity,Alert } from 'react-native';
import { GlobalContext } from '../context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function HomeScreen({navigation}) {
  const { showLoginView, setShowLoginView, username, setUsername } = useContext(GlobalContext);
  useEffect(() => {
    const initialize = async () =>{
     const token = await AsyncStorage.getItem("token");
     const res = await axios.get("http:192.168.36.75:5000/fetch",{
      headers:{
        'Authorization': `Bearer${token}`
      }
     });
     
    }
    initialize();
  },[])
  const handleLogin = async () => {
    try {
      const res = await axios.post("http:192.168.36.75:5000/Login", {
        username,
      });
  
      if (res.data.status === "Authentication Succesfull") {
        await AsyncStorage.setItem("token",res.data.token);
        navigation.navigate('Chat');
      } else {
        Alert.alert("Error", "User not found");
      }
    } catch (error) {
      console.error("Error during login:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };
  const handleSignin = async () => {
    try{
      const res = await axios.post("http:192.168.36.75:5000/Signin",{
        username
      });
      if(res.data.status === "User Already Exists")
        Alert.alert("User Already Exists");
      else
        Alert.alert("User Created, login to continue...");
    }
    catch(e){
      res.status(500).json({error:"Inter Server error"});
    }
  }
  return (
    <View>
      {showLoginView ? (
        <View style={styles.authenticate}>
          <Text style={styles.name}>Enter Your Username</Text>
          <TextInput
          style={styles.authenticateName}
            placeholder="Enter your Username"
            value={username}
            onChangeText={(text) => setUsername(text)}
          />
          <View style={styles.Buttons}>
            <Pressable style={styles.buttonContainer} onPress={() => {
              console.log('Register pressed')
              handleSignin()
            }
            }>
              <Text style={styles.buttonText1}>Register</Text>
            </Pressable>
            <Pressable style={styles.buttonContainer} onPress={() => 
              {
                handleLogin()
                }
                }>
              <Text style={styles.buttonText1}>Login</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.ContentInfo}>
          <Text style={styles.title}>Connect, Grow, Inspire</Text>
          <Text style={styles.subtitle}>Chat with your close ones around the world</Text>
          <TouchableOpacity onPress={() => setShowLoginView(true)} style={styles.button}>
            <View>
              <Text style={styles.buttonText}>Get Started</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ContentInfo: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authenticate: {
    marginTop:'20%',
    marginLeft:'15%',
    width:'65%'
  },
  name:{
    fontSize:20,
    fontWeight:'bold',
    paddingBottom:25
  },
  authenticateName:{
    fontSize:15,
    borderColor:'black',
    borderWidth:1,
    borderRadius:20,
  },
  buttonContainer:{
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '50%',
    marginRight: 10
  },
  buttonText1:{
    fontSize:14,
    color:'white'
  },
  Buttons:{
    marginTop:10,
    flexDirection:'row'
  }
});
