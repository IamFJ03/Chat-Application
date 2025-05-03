import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlobalContext } from '../context';

export default function Messages({ item }) {
  const { user } = useContext(GlobalContext);
  const isSender = item.senderId == user._id;
  return (
    <View style={styles.messageContainer}>
    {isSender ? (
      <View style={{alignSelf:'flex-end', right:30,backgroundColor:'rgba(0,0,256,0.5)',padding:10,borderRadius:10,marginBottom:20,maxWidth:'80%'}}>
      
      <Text style={{color:'white'}}>{item.content}</Text>
      <Text style={{alignSelf:'flex-end',color:'white',fontSize:10}}>{item.timestamp}</Text>
    </View>
    ) : (
      <View style={{alignSelf:'flex-start',left:10,backgroundColor:'white',padding:10,borderRadius:10,marginBottom:20,maxWidth:'80%'}}>
        <Text style={{fontSize:10,color:'grey'}}>~{item.sender}</Text>
      <Text style={styles.messages}>{item.content}</Text>
      <Text style={{alignSelf:'flex-end',fontSize:10}}>{item.timestamp}</Text>
      </View>
    )
    }
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    top: 10,
  },
  messages: {
    fontSize:15
  },
});
