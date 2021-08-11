import React from 'react';
import {
  View,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Button,
  Text,
  Image
} from 'react-native';
import {RectButton} from 'react-native-gesture-handler';
import SwipeableViews from 'react-swipeable-views-native';
import {RNCamera} from 'react-native-camera';
import PendingView from './PendingView';
import Tts from 'react-native-tts';
import TesseractOcr, {LANG_KOREAN, useEventListener} from 'react-native-tesseract-ocr';

const DEFAULT_HEIGHT=500;
const DEFAULT_WIDTH=600;

class MainScreen extends React.Component {
  state = {
    pausePreview: false,
    image: 'none', // 유통기한 이미지 주소.
  };
  //const [text, setText] = useState('');

  returnData = async(image) => {
    this.setState({image: image});
    console.log('image:',image);
    // try {
    //     //const tesseractOptions = {};
    //     var recognizedText = TesseractOcr.recognize(image,LANG_KOREAN,tesseractOptions);
    //     //console.log('나는 어떻게나올까',recognizedText);
    //     //if recognizedText 에 유통기한이라는 글자 있으면 그 뒤에 말을 setText로 삼고 그것을 변수로 두고 읽기
    //     // if (recognizedText.includes('짧다')){
    //     //   recognizedText = "유통기한 찾았다.";
    //     //   setText(recognizedText);
    //     // }
    //     //setText(recognizedText);
    //     //Speech.speak(recognizedText, {language : 'ko'});
    //   } catch (err) {
    //     console.error(err);
    //     setText('');
    //   }
  };

  handlePressPicture = () => {
    console.log('Go to picture ');
    this.props.navigation.navigate('ExpiryDateScreen', {
      returnData: this.returnData,
    });
  };

  handlePressBarcode = () => {
    console.log('Go to Barcode');
    this.props.navigation.navigate('BarcodeScreen');
  };

  speak = (index1, index2) => {
    Tts.stop();
    if (index1 === 0 && index2 === 1)
      this.props.navigation.navigate('ExpiryDateScreen', {
        returnData: this.returnData,
      });
    if (index1 === 2 && index2 === 1)
      this.props.navigation.navigate('BarcodeScreen');
    if ((index1 === 1 && index2 === 0) || (index1 === 1 && index2 === 2))
      Tts.speak('홈 화면입니다.');
  };

  componentDidMount() {
    Tts.speak(
      '유희얼입니다.왼쪽으로 스와이프하면 유통기한, 오른쪽으로 스와이프하면 바코드를 알 수 있습니다.',
    );
  }

  render() {
    const {image, pausePreview} = this.state;
    return (
      <SwipeableViews
        style={styles.mainMenu}
        index={1}
        onChangeIndex={this.speak}>
        <View
          style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
          value={0}>
              {image && (
                    <View style={styles.imageContainer}>
                        <Image style={styles.image} source={{uri:image}} />
                        <Text>{image}</Text>
                    </View>
                )}
        </View>
        <View
          style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
          value={1}>
          <Text style={styles.txt}>Uhear이에요</Text>
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
