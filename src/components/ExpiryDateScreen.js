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
import {stat} from 'react-native-fs';

class ExpiryDateScreen extends React.Component {
  state = {
    pausePreview: false,
    canDetectText: true,
    textBlocks: [],
    numbbber: 1,
    time_speak:false,
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
    if (!this.state.time_speak)//유통기한을 읽은 뒤에도 타이머가 멈추지 않고 다른 면 찍어달라고 음성 나오는 경우 방지
      var timer = this.state.numbbber++; //시간 안에 유통기한 인식 못 했을 때 나오는 음성.

    if (timer % 10 == 0) Tts.speak('사물의 다른 면을 찍어주세요.');
    const {textBlocks} = object;
    this.setState({textBlocks});
  };

  renderTextBlocks = () => (
    <View pointerEvents="none">
      {this.state.textBlocks.map(this.renderTextBlock)}
    </View>
  );

  renderTextBlock = ({bounds, value}) => {
    //여기서 화면을 전환하는 동작도 필요할듯... 재귀로다가 4번...
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

  logTextData = value => {
    //일단 나도 나름대로 수정해봤는데..
    console.log('value: ', value);
    var str = String(value).trim().replace(/[^0-9]/g, '');

    //유통기한 데이터는 2로 시작해야 함.
    if (!str.startsWith('2')) {
      return;
    }

    //2020년 유통기한에 대한 처리 (지금 시점에서 필요할지는 잘 모르겠음.)
    if (str.startsWith('20') && parseInt(str.substring(2, 4)) < 13) {
      str = '20' + str; // 이렇게 처리할 시, 2001~2012년도 사이 유통기한은 구할 수 없음.
    }

    // 여섯 자리 유통기한 포맷의 경우 여덟 자리 포맷으로 수정.
    str = !str.startsWith('20') ? '20' + str : str;

    // 여덟자리인지 확인. (자리 수가 모자라서 월일을 빼는 경우가 없도록.)
    if (str.substr(0, 8).length != 8) {
      return;
    }

    var year = str.substring(0, 4);
    var month = str.substring(4, 6);
    var date = str.substring(6, 8);

    //Date.parse() 를 할 수 있는 포맷으로 전환.
    str = `${year}-${month}-${date}`;

    //Date.parse()를 통해 유효한 날짜 데이터인지 확인.
    if (isNaN(Date.parse(str))) {
      return;
    }

    var expdate_speak = `제품의 유통기한은 ${year}년 ${month}월 ${date}일 까지입니다.`;
    this.takePicture(expdate_speak);
  };

  takePicture = async function (expdate_speak) {
    const {navigation, route} = this.props;
    const options = {quality: 0.5, base64: true};
    this.state.time_speak = true;
    const data = await this.camera.takePictureAsync(options);
    const source = data.uri;
    try {
      if (source){
        route.params.returnImageData(data.uri, expdate_speak);
        navigation.goBack();
      }
    } catch (error) {
      console.error(error);
    }
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