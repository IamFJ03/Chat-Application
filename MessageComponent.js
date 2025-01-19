import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MessageComponent({ item, username }) {
  const userStatus = item.username !== username
  return (
    <View>
      {userStatus ?
        <View>
          <View style={styles.messageContainer}>
            <Text style={{marginBottom:10,fontWeight:'bold'}}>~{item.username}</Text>
            <Text>{item.text}</Text>
            <View>
              <Text>{item.time}</Text>
            </View>
          </View>
        </View>
        :
        <View style={{ alignSelf: 'flex-end' }}>
          <View style={styles.messageContainer1}>
            <Text style={styles.user}>~{item.username}</Text>
            <Text style={styles.message}>{item.text}</Text>
            <View>
              <Text style={styles.message}>{item.time}</Text>
            </View>
          </View>
        </View>}
    </View>
  )
}

const styles = StyleSheet.create({
  user: {
    color: 'white',
    fontWeight: 'bold',

    marginBottom: 10
  },
  message: {
    color: 'white'
  },
  messageContainer: {
    marginTop: 20,
    height: 'auto',
    alignSelf:'flex-start',
    maxWidth:'80%',
    padding: 10,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  messageContainer1: {
    marginTop: 20,
    height: 'auto',
    width: '80%',
    padding: 10,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: '#007bff',
  }
})