import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  RefreshControlBase,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import PendingView from './PendingView';
import Tts from 'react-native-tts';
import { stat } from 'react-native-fs';



class ExpiryDateScreen extends React.Component {
  state = {
    pausePreview: false,
    canDetectText: true,
    textBlocks: [],
    numbbber: 1,
    utong_speak:''
  };

  renderCamera() {
    const {canDetectText} = this.state;
    const {navigation} = this.props;
    return (
      <RNCamera
        style={{width: '100%', height: '100%'}}
        type={RNCamera.Constants.Type.back}
        autoFocus={RNCamera.Constants.AutoFocus.on}
        captureAudio={false}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        ref={ref => {
          this.camera = ref;
        }}
        onTextRecognized={canDetectText ? this.textRecognized : null}>
        {!!canDetectText && this.renderTextBlocks()}
      </RNCamera>
    );
  }

  textRecognized = object => {
    if (this.state.utong_speak == '')//유통기한 음성이 여러번 나오는 경우를 방지.
      var timer  = this.state.numbbber++;//시간 안에 유통기한 인식 못 했을 때 나오는 음성.
    console.log(timer);
    if(timer % 10 == 0)
      Tts.speak('사물의 다른 면을 찍어주세요.');
    const {textBlocks} = object;
    this.setState({textBlocks});
    //console.log(textBlocks);
  };

  renderTextBlocks = () => (
    <View pointerEvents="none">
      {this.state.textBlocks.map(this.renderTextBlock)}
    </View>
  );

  renderTextBlock = ({bounds, value}) => { //여기서 화면을 전환하는 동작도 필요할듯... 재귀로다가 4번...
    this.logTextData(value);
    return (
      <React.Fragment key={value + bounds.origin.x}>
        <Text
          style={[
            styles.textBlock,
            {left: bounds.origin.x, top: bounds.origin.y},
          ]}>
          {value}
        </Text>
      </React.Fragment>
    );
  };

  // 숫자 데이터 중 날짜에 해당하는 내용만 골라내는 알고리즘. 상품에 2나 20자로 시작하는 데이터를 아무거나 읽어 처리할 수 있음으로 개선 필요. 개별 파일을 만들어 처리하는 등 개선 필요.
  logTextData = value => {
    console.log('value: ', value);
    var str = String(value).replace(/[^0-9]/g, '');
    if (str.includes('20') || str.includes('28')) { //0이 8로 찍히는 경우 대비
      if (str.length >= 7)
      {
        if (str.includes('8'))
        {
          str = (str[str.indexOf('28')+ 1] == '8') ? str.replace(str[str.indexOf('28') + 1],'0') : str;
          str = (str[str.indexOf('28')+ 5] == '8') ? str.replace(str[str.indexOf('28') + 5],'0') : str;
          str = (str[str.indexOf('28')+ 7] == '8') ? str.replace(str[str.indexOf('28') + 7],'0') : str;
        }
        str = str.substring(str.indexOf('20'), str.indexOf('20') + 8);
        console.log('substring:',str);// 20이 포함되어있기만 해도 그 인덱스부터 8글자
        //추가로 해야할 것 : 20부터 해서 8글자가 맞는 숫자형식으로 이루어져있어야함. ex)월은 첫글자가 0~1..
        str = str.substr(0, 8);
        if (this.state.utong_speak == '')//유통기한 알려주는 음성 한번만 나오도록
        {
          this.state.utong_speak = '제품의 유통기한은'+str.substring(0,4)+'년'+str.substring(4,6)+'월'+str.substring(6,8)+'일 까지입니다.';
          Tts.speak(this.state.utong_speak+'다시 듣기를 원하시면 화면을 한 번 터치해주세요.');
        }
        this.takePicture();
      }
    } else if (str.startsWith('2')) {
      str = str.substr(0.6);
    } else {
      str = 'Not Expiry Date Data';
    }

    console.log('data: ', str);
  };

  takePicture = () => {
    const options = {quality: 0.5, base64: true};
    try {
      this.camera.takePictureAsync(options).then(data => {
        this.goBack(data.uri, this.state.utong_speak);
      });
    } catch (error) {
      console.error(error);
    }
  };

  goBack = (image, utong_speak) => {
    const {navigation, route} = this.props;
    route.params.returnImageData(image, utong_speak);
    navigation.goBack();
  };

  componentDidMount() {
    Tts.speak('유통기한 카메라 입니다.');
  }

  render() {
    const {pausePreview} = this.state;
    return <View style={styles.container}>{this.renderCamera()}</View>;
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
  textBlock: {
    color: '#F00',
    position: 'absolute',
    textAlign: 'center',
    fontSize: 40,
    backgroundColor: 'transparent',
  },
});

export default ExpiryDateScreen;
