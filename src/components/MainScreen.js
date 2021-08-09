import React from 'react';
import {
  View,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Button,
  Text,
} from 'react-native';
import {RectButton} from 'react-native-gesture-handler';
import SwipeableViews from 'react-swipeable-views-native';
import {RNCamera} from 'react-native-camera';
import PendingView from './PendingView';
import Tts from 'react-native-tts';

class MainScreen extends React.Component {
  state = {
    pausePreview: false,
  };

  handlePressPicture = () => {
    console.log('Go to picture ');
    this.props.navigation.navigate('ExpiryDateScreen');
  };

  handlePressBarcode = () => {
    console.log('Go to Barcode');
    this.props.navigation.navigate('BarcodeScreen');
  };

  speak = (index1, index2) => {
    if (index1 === 0 && index2 === 1)
      this.props.navigation.navigate('ExpiryDateScreen');
    if (index1 === 2 && index2 === 1)
      this.props.navigation.navigate('BarcodeScreen');
    if ((index1 === 1 && index2 === 0) || (index1 === 1 && index2 === 2))
      Tts.speak('홈 화면입니다.');
  };

  render() {
    Tts.speak(
      '유희얼입니다.왼쪽으로 스와이프하면 유통기한, 오른쪽으로 스와이프하면 바코드를 알 수 있습니다.',
    );
    const {pausePreview} = this.state;
    return (
      <SwipeableViews
        style={styles.mainMenu}
        index={1}
        onChangeIndex={this.speak}>
        <View
          style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
          value={0}>
          <Pressable onPress={this.handlePressPicture} style={styles.btn}>
            <Text style={styles.txt}>아무데나 누르면 유통기한</Text>
          </Pressable>
        </View>
        <View
          style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
          value={1}>
          <Text style={styles.txt}>Uhear이에요.</Text>
        </View>
        <View
          style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
          value={2}>
          <Pressable onPress={this.handlePressBarcode} style={styles.btn}>
            <Text style={styles.txt}>아무데나 누르면 바코드</Text>
          </Pressable>
        </View>
      </SwipeableViews>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  button: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  mainMenu: {
    backgroundColor: 'white',
    flex: 1,
  },
  btn: {
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txt: {
    color: 'black',
    textAlign: 'center',
    fontSize: 20,
  },
  rectButton: {
    width: '100%',
    height: '100%',
    backgroundColor: 'blue',
  },
});

export default MainScreen;
