import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import MainScreen from './MainScreen';
import ExpiryDateScreen from './ExpiryDateScreen';
import BarcodeScreen from './BarcodeScreen';

const Stack = createStackNavigator();

const CameraStack = () => {
  return (
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

const ExpiryDateScreenAnimation = {
  gestureDirection: 'horizontal',
  cardStyleInterpolator: ({current, layouts}) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, layouts.screen.width],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
    };
  },
};

export default CameraStack;
