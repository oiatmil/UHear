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
    imageIsExist: false,
    image: 'none', // 유통기한 이미지 주소.
    productNameIsExist: false,
    productName: 'none',
    //~IsExist state는 Tts의 반복을 막기 위해 사용함. 그러나 imageIsExist는 큰 효과를 모르겠음.
  };

  returnImageData = image => {
    if (!this.state.imageIsExist) {
      this.setState({image: image});
      this.state.imageIsExist = true;
      Tts.stop();
      Tts.speak('유통기한 데이터가 맞는지 확인 중입니다.');
    }
  };

  returnBarcodeData = data => {
    if (!this.state.productNameIsExist) {
      this.setState({productName: data});
      this.state.productNameIsExist = true;
      Tts.stop();
      Tts.speak(`찾은 상품명은 ${data}입니다.`);
    }
  };

  handlePressPicture = () => {
    console.log('Go to picture ');
    this.state.imageIsExist = false;
    this.props.navigation.navigate('ExpiryDateScreen', {
      returnImageData: this.returnImageData,
    });
  };

  handlePressBarcode = () => {
    console.log('Go to Barcode');
    this.state.productNameIsExist = false;
    this.props.navigation.navigate('BarcodeScreen', {
      returnBarcodeData: this.returnBarcodeData,
    });
  };

  speak = (index1, index2) => {
    Tts.stop();
    if (index1 === 0 && index2 === 1) {
      this.state.imageIsExist = false;
      this.props.navigation.navigate('ExpiryDateScreen', {
        returnImageData: this.returnImageData,
      });
    }
    if (index1 === 2 && index2 === 1) {
      this.state.productNameIsExist = false;
      this.props.navigation.navigate('BarcodeScreen', {
        returnBarcodeData: this.returnBarcodeData,
      });
    }
    if ((index1 === 1 && index2 === 0) || (index1 === 1 && index2 === 2))
      Tts.speak('홈 화면입니다.');
  };

  componentDidMount() {
    Tts.speak(
      '유희얼입니다... 왼쪽으로 스와이프하면 유통기한, 오른쪽으로 스와이프하면 바코드를 알 수 있습니다.',
    );
  }

  render() {
    const {image, productName, pausePreview} = this.state;
    return (
      <SwipeableViews
        style={styles.mainMenu}
        index={1}
        onChangeIndex={this.speak}>
        <View
          style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
          value={0}>
          <Pressable onPress={this.handlePressPicture} style={styles.btn}>
            <Text style={styles.txt}>{image}</Text>
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
            <Text style={styles.txt}>{productName}</Text>
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
