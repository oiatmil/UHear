import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import MainScreen from './MainScreen'
import PictureScreen from './PictureScreen'
import BarcodeScreen from './BarcodeScreen'

const Stack = createStackNavigator();

const CameraStack = () =>{
    return(
        <Stack.Navigator
        screenOptions = {{
            headerStyle:{
                backgroundColor: '#035',
            },
            headerTintColor: '#fd0',          
        }}>
            <Stack.Screen 
            name='Uhear' 
            component={MainScreen}></Stack.Screen>
            <Stack.Screen name='PictureScreen'
            component={PictureScreen}></Stack.Screen>
            <Stack.Screen name='BarcodeScreen'
            component={BarcodeScreen}></Stack.Screen>
        </Stack.Navigator>
    );
} 

export default CameraStack;