import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import MainScreen from './MainScreen';
import ExpiryDateScreen from './ExpiryDateScreen';
import BarcodeScreen from './BarcodeScreen';

const Stack = createStackNavigator();

const CameraStack = () => {
  return (
    // 유통기한과 제품명 인식에 별개의 카메라를 사용하기 위해 각 screen을 분리.
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2A1D90',
        },
        headerTintColor: '#FFE89A',
      }}>
      <Stack.Screen name="Uhear" component={MainScreen}></Stack.Screen>
      <Stack.Screen
        name="ExpiryDateScreen"
        component={ExpiryDateScreen}
        options={{gestureDirection: 'horizontal-inverted'}}></Stack.Screen>
      <Stack.Screen
        name="BarcodeScreen"
        component={BarcodeScreen}></Stack.Screen>
    </Stack.Navigator>
  );
};

export default CameraStack;
