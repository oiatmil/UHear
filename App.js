import React, { Component } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import CameraStack from './src/components/CameraStack'

const App = () => {
  return (
    <NavigationContainer>
      <CameraStack></CameraStack>
    </NavigationContainer>
      );
    };
    
    export default App;