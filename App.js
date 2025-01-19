import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import HomeScreen from './Screen/HomeScreen';
import MessageScreen from './Screen/Message';
import Chat from './Screen/ChatScreen';
import { NavigationContainer } from '@react-navigation/native';
import {createNativeStackNavigator } from '@react-navigation/native-stack';
import GlobalState from './context/index.js';
const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <GlobalState>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
        name='Home'
        component={HomeScreen}
        options={{headerShown:false}}
        />
        <Stack.Screen 
        name='Message'
        component={MessageScreen}
        options={{headerShown:false}}
        />
        <Stack.Screen 
        name='Chat'
        component={Chat}
        options={{headerShown:false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
    <StatusBar hidden={true} />
    </GlobalState>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
