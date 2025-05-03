import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Alert, Keyboard } from 'react-native';
import onBoard from '../assets/onBoard.png';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Authentication({ navigation }) {
  const [loginPageView, setLoginPageView] = useState(false);
  const [username, setUsername] = useState('');
  const [signIn, setSignIn] = useState(false);
  const [logIn, setLogIn] = useState(false);
  const [signInPageView, setSignInPageView] = useState(false);

  const handleSignIn = async () => {
    try{
     const res = await axios.post("http:192.168.120.75:5000/SignIn",{
      username
     });
     if(res.data.message==='Already Exist'){
      Alert.alert("Error","User Already Exist, Try Another Username");
      setLogIn(true);
      setUsername("");
     }
     else{
     Alert.alert("Succesfull","User Created, Login to Continue");
     setUsername("");
     setSignInPageView(false);
     }
    }
    catch(e){

    }
  }
  const handleLogin = async () => {
    try {
      const res = await axios.post('http://192.168.120.75:5000/Login', {
        username,
      });
      if (res.data.status === 'Authenticated') {
        await AsyncStorage.setItem('token', res.data.token);
        navigation.navigate('Tab');
      } else {
        Alert.alert('Not Found', 'Username does not exist');
        setUsername('');
        setSignIn(true);
        Keyboard.dismiss();
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during login. Please try again.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={onBoard} style={styles.image} />
      {loginPageView ? (
        signInPageView ? (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Enter Username:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Username"
              value={username}
              onChangeText={(text) => setUsername(text)}
            />
            <TouchableOpacity style={styles.button} onPress={handleSignIn}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
            {logIn && (
              <TouchableOpacity
              style={styles.signInLink}
              onPress={() => setSignInPageView(false)}
            >
              <Text style={styles.linkText}>Already have an Account? Log In</Text>
            </TouchableOpacity>
            )}
            
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Enter Username:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Username"
              value={username}
              onChangeText={(text) => setUsername(text)}
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            {signIn && (
              <TouchableOpacity
                style={styles.signInLink}
                onPress={() => setSignInPageView(true)}
              >
                <Text style={styles.linkText}>Don't have an account? Sign In</Text>
              </TouchableOpacity>
            )}
          </View>
        )
      ) : (
        <View style={styles.welcomeContainer}>
          <Text style={styles.title}>Connect, Grow, Inspire</Text>
          <Text style={styles.subtitle}>
            Chat with your close ones around the world
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setLoginPageView(true)}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  
  image: {
    marginTop: 50,
    marginLeft: 20,
    width: '100%',
    height: '60%',
  },
  title: {
    marginTop: '10%',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    width: '80%',
    textAlign: 'center',
    color: 'grey',
    marginLeft: '10%',
    marginTop: 10,
  },
  button: {
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: '#007bff',
    width: '50%',
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 15,
  },
  inputContainer: {
    marginLeft: '10%',
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textInput: {
    marginBottom: 10,
    width: '75%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  signInLink: {
    marginLeft: 20,
    marginTop: 20,
  },
  linkText: {
    color: 'grey',
  },
  welcomeContainer: {
    marginTop: '10%',
    alignItems: 'center',
  },
});
