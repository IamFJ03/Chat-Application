import { Platform } from "react-native";
import {io} from 'socket.io-client';

export const BaseUrl = 
Platform.OS ==="android" ? "http://192.168.36.75:5000" : "http://localhost:5000";
export const socket = io.connect('http://192.168.36.75:5000')