import React, { useContext,useEffect } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import {FontAwesome} from '@expo/vector-icons';
import {GlobalContext} from '../context';
import {useNavigation} from '@react-navigation/native'

export default function GroupList({ item }) {
  useEffect(() => {
    if (item.messages && item.messages.length > 0) {
      setMessages(item.messages[item.messages.length - 1]);
    } else {
      setMessages({ text: '', time: 'Now' }); 
    }
  }, [item.messages]);
  const navigation = useNavigation();
  const {messages, setMessages} = useContext(GlobalContext);
  const handleNavigation = () => {
    navigation.navigate('Message',{
      groupName: item.groupName,
      id: item.id
    });
  }
  return (
    <View style={styles.container}>
      <Pressable style={styles.frame} onPress={() => {
        handleNavigation();
        console.log(item.groupName)}}>
        <View>
        <FontAwesome name='group' size={24} color={'black'} style={{top:10}}/>
        </View>
        
        <View>
        <Text style={styles.text}>{item.groupName}</Text>
        <Text style={{marginLeft:15,fontSize:12,fontWeight:'condensed'}}> {messages?.text? messages.text : 'Tap to start messaging'}</Text>
        </View>

        <View>
        <Text style={styles.time}> {messages?.time? messages.time : 'Now'} </Text>
        </View>
        
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  time:{
   left:60
  },
  text:{
    fontSize:16,
    fontWeight:'bold',
    marginLeft:20
  },
  container:{
    width:'97%',
    padding:5
  },
  frame:{
    flexDirection:'row',
    backgroundColor:'white',
    marginLeft:15,
    top:20,
    padding:15,
    borderRadius:10
  }
});
