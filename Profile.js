import React,{useState, useEffect, useContext} from 'react'
import {View, Text, StyleSheet, Image, TouchableOpacity, Modal, TextInput} from 'react-native';
import UserProfile from '../assets/UserProfile.png';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { GlobalContext } from '../context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Profile() {
  const [newUsername, setNewUsername] = useState("");
  const [bio, setBio] = useState("");
  const [number, setNumber] = useState("");
  const [image, setImage] = useState(UserProfile);
  const [modalOpen, setModalOpen] = useState(false);
  const [firstModal, setFirstModal] = useState(false);
  const [secondModal, setSecondModal] = useState(false);
  const {user, setUser} = useContext(GlobalContext);
  const [userData, setUserData] = useState(null);
  useEffect(() => {
  const initialize = async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const {status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if(cameraStatus !== 'granted' || galleryStatus !== 'granted'){
        alert("Permission denied! You need to allow camera and gallery access.");
      }
  }
  initialize();
  
  fetchUserDetails();
  },[]);

  const fetchUserDetails = async () => {
    const token = await AsyncStorage.getItem('token');
    try{
        const res = await axios.get("http://192.168.120.75:5000/fetch-User",{
          headers:{
            'Authorization':`Bearer ${token}`
          }
        });
        if(res.data.status==="User Found"){
          console.log(res.data.data);
          setUserData(res.data.data);
           }
    }
    catch(e){
      console.log("Error",e);
    }
}
  const pickImage = async() => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    console.log("Image URL:",result.assets[0].uri)
    if(!result.canceled && result.assets?.length>0){
      const selectedURI = result.assets[0].uri;
      setImage(result.assets[0].uri);
      setModalOpen(false);
      upload(selectedURI);
      
    }
    else
        console.log("No Image is Selected");
  }
  const pickImageFromCamera = async ()=>{
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
      aspect: [4, 3]
    });
    console.log("Image URL:",result.assets[0].uri)
    if(!result.canceled && result.assets?.length>0){
      const selectedURI = result.assets[0].uri;
      setImage(result.assets[0].uri);
      
      setModalOpen(false);
      upload(selectedURI);
    }
    else
      console.log("No Image is Selected");
  }

  const upload = async (uri) => {
    console.log("Uploading image...");
    const formdata = new FormData();
    formdata.append('username', userData.username);
    formdata.append('image',{
      uri,
      name: 'profile.jpeg',
      type: 'image/jpeg'
    });
    try{
       const res = await axios.post("http:192.168.120.75:5000/upload-image", formdata, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      if(res.data.status=="Profile Picture Updated"){
        console.log("Cool it is uploaded check db", res.data.upload);
        fetchUserDetails();
      }
       }
    catch(e){
      console.log("Error",e);
    }
  }
  const save = async () => {
    console.log("Saving data...");
  
    const token = await AsyncStorage.getItem('token');
    try{
      const res = await axios.post("http://192.168.120.75:5000/update", {
        newUsername: newUsername,
        about: bio,
        number: number
      }, {
        headers:{
          'Authorization': `Bearer ${token}`
        }
      });
      if(res.data.status==="Congo it's done"){
        console.log("New Data:",res.data.newData);
        fetchUserDetails();
      }
    }
    catch(e){
      console.log("Error", e);
    }
  }
  return (  
    <View>
      <View style={styles.head}>
      <TouchableOpacity onPress={()=> {
        setModalOpen(true);
        setFirstModal(true);
      }
      }>
      <Image source={
        userData?.profilePicture 
        ? {uri:`http://192.168.120.75:5000/${userData.profilePicture}`}
        :
        typeof image === 'string' ? {uri: image} : image} style={styles.profileImage} />
      </TouchableOpacity>
      <View style={{flexDirection:'row',marginTop:100,left:20}}>
        <Text style={{color:'grey',fontSize:20}}>Profile Info:</Text>
        <TouchableOpacity onPress={() => {
          setModalOpen(true)
          setSecondModal(true)
        }}><Text style={{color:'grey',left:100, fontSize:20}}>Edit Info</Text></TouchableOpacity>
      </View>
      <View style={{flexDirection:'row',marginTop:40, marginLeft:20}}>
        <View style={{width:110}}>
        <Text style={styles.headLine}>Username:</Text>
        <Text style={styles.headLine}>About:</Text>
        <Text style={styles.headLine}>Phone Number:</Text>
        </View>
        <View style={{left:-30, width:150}}>
        <Text style={styles.userdata}>{userData? userData.username : 'Loading'}</Text>
        <Text style={styles.userdata}>{userData? userData.about : 'Loading'}</Text>
        <Text style={styles.userdata}>{userData? userData.number : 'Loading'}</Text>
        </View>
      </View>
      </View>
      
        <Modal visible={modalOpen} animationType='slide' transparent={true}>
          {firstModal ? (
            <View>
          <View style={styles.modalContainer}>
        <Icon name={'close'} size={35} color={'white'} onPress={() => {setModalOpen(false)
         setFirstModal(false);
        }
        } style={{top:10, left:10}} />
        </View>
        <View style={{top:440, left:50, flexDirection:'row'}}>
        <TouchableOpacity onPress={pickImageFromCamera}>
        <Icon name={'camera'} size={50} color={'white'}/>
        <Text style={{color:'white',left:-15}}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{width:120, marginLeft:75}} onPress={pickImage} >
        <Icon name={'album'} size={50} color={'white'}/>
        <Text style={{color:'white',left:-15 }}>Choose photo from Gallery</Text>
        </TouchableOpacity>
        </View>
        </View>
          )
        : secondModal ? (
<View style={{height:'100%', backgroundColor:'rgba(0,0,0,0.5)'}}>
        <View style={{backgroundColor:'white',height:400, top:400, borderRadius: 25}}>
            <Icon style={{top:10, left:10}} name={'close'} size={35} color={'black'} onPress={() => {
              setModalOpen(false)
              setSecondModal(false)
              }
              }/>
            <View style={{flexDirection:'row',marginTop:50,left: 10}}>
              <View style={{width:100}}>
                <Text style={{marginBottom:40}}>Username:</Text>
                <Text style={{marginBottom:40}}>Bio:</Text>
                <Text>Phone Number:</Text>
              </View>
              <View style={{top:-15}}>
              <TextInput 
              placeholder='Enter new Username'
              style={{marginBottom:20, width:250,borderBottomColor:'grey', borderBottomWidth:1}}
              onChangeText={(txt) => setNewUsername(txt)}
              />
              <TextInput 
              placeholder='Enter your Bio'
              style={{marginBottom:30, width:250,borderBottomColor:'grey', borderBottomWidth:1}}
              onChangeText={(txt) => setBio(txt)}
              />
              <TextInput 
              placeholder='Enter your Phone Number'
              style={{ width:250,borderBottomColor:'grey', borderBottomWidth:1}}
              onChangeText={(txt) => setNumber(txt)}
              />
              </View>
              
        </View>
        <TouchableOpacity style={styles.button} onPress={() => {save();
          setModalOpen(false);
          setSecondModal(false);
        }}>
          <Text style={{fontSize:17, color:'white', fontWeight:'bold'}}>Save</Text>
        </TouchableOpacity>
        </View>
        </View>
        ) : null}
        </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  button:{
    marginTop: 20,
    marginLeft: 130,
    borderRadius:5,
    backgroundColor:'rgba(0, 0, 256, 0.5)', 
    width:100, 
    height:50, 
    paddingHorizontal:25, 
    paddingVertical:10
  },

  headLine:{
    fontWeight: 'bold',
    fontSize:17,
    marginBottom:20,
  },
  userdata:{
    fontSize:17,
    left:100,
    marginBottom:20
  },
  modalContainer:{
       top:565,
       height: 200, 
       backgroundColor:'black',
       borderRadius:20
      },
      head:{
        height:150,
        width:'100%',
        backgroundColor: 'rgba(0,0,256,0.5)'
      },
      profileImage: {
        top:65,
        left:110,
        backgroundColor:'white',
        height: 180,
        width: 140,
        borderRadius:100
      }
})