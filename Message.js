import React, { useContext, useEffect, useLayoutEffect } from 'react'
import {View, Text, StyleSheet, TextInput, Button, Pressable, FlatList} from 'react-native';
import {GlobalContext} from '../context';
import MessageComponent from '../components/MessageComponent';
import {socket} from '../utils';

export default function Message({route}) {

  const {groupName, id} = route.params;
  const {inputMessage, setInputMessage, username, allGroupChats, setAllGroupChats} = useContext(GlobalContext);
  const handleSendMessage = () => {
    const Time = {
      hrs:
      new Date().getHours() < 10 ?
      `0${new Date().getHours()}` :
      new Date().getHours(),
      min:
      new Date().getMinutes() < 10 ?
      `0${new Date().getMinutes()}` :
      new Date().getMinutes()
    };
    if(username){
      socket.emit("newChatMessage", {
       inputMessage,
       GroupIdentifier: id,
       Time,
       username
      });
      setInputMessage('');
    }
  }

  useLayoutEffect(() => {
    socket.emit('findGroup',id);
  },[])

  useEffect(() => {
    socket.on('foundGroup',(allChats) => setAllGroupChats(allChats))
  },[socket])
  return (
    <View style={styles.container}>
      <View style={styles.head}>
      <Text style={styles.headText}>{groupName}</Text>
      </View>

      <View style={styles.messagesContainer}>
        <FlatList
        data={allGroupChats}
        renderItem={({item}) => <MessageComponent item={item} username={username} />}
        keyExtractor={(item) => item.id}
        />
      </View>

      <View>
        <View style={styles.textContainer}>
        <TextInput 
        style={styles.text}
        placeholder='Write a message...'
        value={inputMessage}
        onChangeText={(text) => setInputMessage(text)}
        />
        <Pressable style={styles.button} onPress={() => handleSendMessage()}>
          <Text style={{color:'white'}}>Send</Text>
        </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'lightgrey',
    flex: 1, 
  },
  head: {
    width: '100%',
    height: '10%',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1, 
    padding: 10,
  },
  textContainer: {
    
    bottom:0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 10,
    
  },
  text: {
    flex: 1, 
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
  },
  button: {
    marginLeft: 10,
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
});
