import React from 'react';
import {View, TouchableOpacity, StyleSheet, Text} from 'react-native';
import {RNCamera} from 'react-native-camera';
import PendingView from './PendingView';
import Tts from 'react-native-tts';

class ExpiryDateScreen extends React.Component {
  state = {
    pausePreview: false,
    canDetectText: true,
    textBlocks: [],
  };

  renderCamera() {
    const {canDetectText} = this.state;
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
    const {textBlocks} = object;
    this.setState({textBlocks});
  };

  renderTextBlocks = () => (
    <View pointerEvents="none">
      {this.state.textBlocks.map(this.renderTextBlock)}
    </View>
  );

  renderTextBlock = ({bounds, value}) => {
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

    if (str.startsWith('20')) {
      str = str.substr(0, 8);
      this.takePicture();
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
        this.goBack(data.uri);
      });
    } catch (error) {
      console.error(error);
    }
  };

  goBack = image => {
    const {navigation, route} = this.props;
    route.params.returnData(image);
    navigation.goBack();
  };

  resumePicture = async function (camera) {
    await camera.resumePreview();
    this.setState({pausePreview: false});
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
