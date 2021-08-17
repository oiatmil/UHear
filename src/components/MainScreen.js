import React from 'react';
import {
  View,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Button,
  Text,
  Image,
} from 'react-native';
import {RectButton} from 'react-native-gesture-handler';
import SwipeableViews from 'react-swipeable-views-native';
import {RNCamera} from 'react-native-camera';
import PendingView from './PendingView';
import Tts from 'react-native-tts';
import RNMlKit from 'react-native-firebase-mlkit';
import {ImagePicker, Permissions} from 'expo';
import uuid from 'uuid';
import TesseractOcr, {
  LANG_KOREAN,
  useEventListener,
} from 'react-native-tesseract-ocr';

const DEFAULT_HEIGHT = 500;
const DEFAULT_WIDTH = 600;

class MainScreen extends React.Component {
  state = {
    pausePreview: false,
    imageIsExist: false,
    image: 'none', // 유통기한 이미지 주소.
    expdate_speak: '',
    barcode_speak: '',
    productNameIsExist: false,
    fullTextAnnotation: 'none',
    help_num: 0,
  };

  returnImageData = (image, expdate_speak) => {
    if (!this.state.imageIsExist) {
      this.setState({image: image, expdate_speak: expdate_speak});
      Tts.stop();
      Tts.speak(
        `${this.state.expdate_speak} 다시 듣기를 원하시면 화면을 한 번 터치해주세요.`,
      );
      this.state.imageIsExist = true;
      this.readImageData(image);
    }
  };

  readImageData = async function (image){ //사진을 불러온 뒤 글자를 읽는 부분.
    console.log('data.uri:', image);
    const cloudTextRecognition = await RNMlKit.cloudTextRecognition(image);
    console.log('Text Recognition Cloud: ', cloudTextRecognition);
  };

  replay_expdate = () => {
    const {expdate_speak} = this.state;
    if (this.state.imageIsExist) {
      //Image가 있다는 것은 유통기한을 찾았음을 의미하므로
      Tts.stop();
      Tts.speak(expdate_speak); //이 때 화면을 클릭하면 유통기한을 다시 읽어줌.
    }
  };

  returnBarcodeData = barcode_speak => {
    if (!this.state.productNameIsExist) {
      this.setState({barcode_speak: barcode_speak});
      Tts.stop();
      Tts.speak(
        `${barcode_speak} 다시 듣기를 원하시면 화면을 한 번 터치해주세요.`,
      );
      this.state.productNameIsExist = true;
    }
  };

  replay_barcode = () => {
    const {barcode_speak} = this.state;
    if (this.state.productNameIsExist) {
      Tts.stop();
      Tts.speak(barcode_speak);
    }
  };

  speak_help = () => {
    //누를 때마다 새로운 주의사항 말해줌.
    this.state.help_num++;
    this.state.help_num =
      this.state.help_num >= 4
        ? (this.state.help_num = 1)
        : this.state.help_num;
    console.log(this.state.help_num);
    Tts.stop();
    if (this.state.help_num == 1)
      Tts.speak(
        '윗면과 아랫면이 있는 제품의 경우 윗면이나 아랫면을 먼저 보여주시면 더 빨리 찾으실 수 있습니다.',
      );
    if (this.state.help_num == 2)
      Tts.speak('카메라는 밝은 곳에서 실행해야 인식이 잘 됩니다.');
    if (this.state.help_num == 3)
      Tts.speak(
        '제품의 유통기한 글자가 바래졌을 경우 인식이 어려울 수 있습니다.',
      );
  };

  changeScreen = (index1, index2) => {
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
      '유희얼입니다. 왼쪽으로 스와이프 시 유통기한, 오른쪽으로 스와이프 시 바코드를 알 수 있습니다.' +
        '주의사항 듣기를 원하시면 화면을 길게 눌러주세요.',
    );
  }

  render() {
    const {image, expdate_speak, barcode_speak} = this.state;
    return (
      <SwipeableViews
        style={styles.mainMenu}
        index={1}
        onChangeIndex={this.changeScreen}>
        <View
          style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
          value={0}>
          <Pressable onPress={this.replay_expdate} style={styles.btn}>
            {image && (
              <View style={styles.imageContainer}>
                <Image style={styles.image} source={{uri: image}} />
                <Text>{expdate_speak}</Text>
              </View>
            )}
          </Pressable>
        </View>
        <View
          style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
          value={1}>
          <Pressable onLongPress={this.speak_help} style={styles.btn}>
            <Text style={styles.txt}>Uhear이에요</Text>
          </Pressable>
        </View>
        <View
          style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
          value={2}>
          <Pressable onPress={this.replay_barcode} style={styles.btn}>
            <Text style={styles.txt}>{barcode_speak}</Text>
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
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    marginVertical: 15,
    height: DEFAULT_HEIGHT / 2.5,
    width: DEFAULT_WIDTH / 2.5,
  },
});

export default MainScreen;
