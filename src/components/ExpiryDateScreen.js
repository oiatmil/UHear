import React from 'react';
import {View, StyleSheet, Text, Platform} from 'react-native';
import {RNCamera} from 'react-native-camera';
//import RNMlKit from 'react-native-firebase-mlkit'; //Android의 경우 firebase-mlkit 설치 후 주석 풀고 사용.
import Tts from 'react-native-tts';

class ExpiryDateScreen extends React.Component {
  state = {
    canDetectText: true, // 현재 글자 인식을 할 수 있는지
    textBlocks: [], // FirebaseMLKit가 찾은 글자 데이터 저장
    cloudBlocks: [],
    foundExpiryDate: false, // 유통기한(날짜) 찾았는지 여부.
    time: 1, // 안내음성 재생을 위한 타이머
    time_speak: false,
    detectedDateArray: [],
    leftedString: [], //유통기한이 될 수도 있는 후보 문자열들.
  };

  // 카메라 설정
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

  //카메라가 글자를 인식 할 수 있는 상황 일 때 자동으로 실행됨
  textRecognized = object => {
    // if (!this.state.time_speak)
    //   //유통기한을 읽은 뒤에도 타이머가 멈추지 않고 다른 면 찍어달라고 음성 나오는 경우 방지
    //   var timer = this.state.time++;

    this.speak_help();

    //Android의 경우 시간 내 인식하지 못하면 글자인식을 멈추고 내부적으로 사진을 찍어 날짜 데이터가 있는지 확인.
    if (this.state.time % 6 == 0 && Platform.OS == 'android') {
      this.setState({canDetectText: false});
      this.takePictureforAndroid('유통기한을 찾고 있습니다.');
      return;
    }

    const {textBlocks} = object;
    this.setState({textBlocks: textBlocks});

    //글자가 존재할 때
    if (textBlocks.length) {
      textBlocks.map(({value}) => {
        let detectDateResult = this.detectDate(value);

        if (detectDateResult != '-1') {
          this.setState(state => ({
            detectedDateArray: [...state.detectedDateArray, detectDateResult],
          }));

          //같은 문자열에 두개의 날짜(유통기한, 제조일자)가 있을 수 있으므로 후에 재검사를 하기 위해 leftedString에 저장.
          let leftedValue = String(value).substring(
            String(value).indexOf('\n'),
            String(value).length,
          );
          this.setState(state => ({
            leftedString: [...state.leftedString, leftedValue],
          }));

          //detectedDateArray에 들어가는 데이터 수를 변경 함으로써 유통기한 데이터의 정확도를 높일 수 있음.
          if (this.state.detectedDateArray.length == 5) {
            this.setState({canDetectText: false});
            this.findExpdate();
          }
        }
      });
    }
  };

  // 문자 인식 타이머 설정과 ios의 경우 안내음성.
  speak_help = () => {
    const {time} = this.state;
    this.setState({time: time + 1});
    if (time % 35 == 0 && Platform.OS == 'ios')
      Tts.speak('사물의 다른 면을 찍어주세요.');
  };

  // 날짜 데이터 찾기
  detectDate = value => {
    var str = String(value).replace(/[^0-9]/g, '');
    var index = 0;
    if ((index = str.indexOf('2')) != -1) {
      str = str.substring(index, str.length);
    }

    // 유통기한 데이터는 2로 시작해야 함.
    if (!str.startsWith('2')) {
      return '-1';
    }
    // 2020년 유통기한에 대한 처리
    if (str.startsWith('20') && parseInt(str.substring(2, 4)) < 13) {
      str = '20' + str;
    }
    // 여섯 자리 유통기한 포맷의 경우 여덟 자리 포맷으로 수정.
    str = !str.startsWith('20') ? '20' + str : str;
    // 여덟자리인지 확인. (자리 수가 모자라서 월일을 빼는 경우가 없도록.)
    if (str.substr(0, 8).length != 8) {
      return '-1';
    }

    var year = str.substring(0, 4);
    var month = str.substring(4, 6);
    var date = str.substring(6, 8);

    //Date.parse() 를 할 수 있는 포맷으로 전환.
    str = `${year}-${month}-${date}`;

    //Date.parse()를 통해 유효한 날짜 데이터인지 확인.
    if (isNaN(Date.parse(str))) {
      return '-1';
    }

    return str;
  };

  // detectedDateArray에 들어온 날짜들 중 정확한 날짜를 찾기 위함.
  findExpdate = () => {
    const {detectedDateArray} = this.state;
    let date = '';

    this.setState({foundExpiryDate: true});

    //Android는 RNMLKit 라이브러리로 재검사함으로 ios와 다른 로직 구현.
    if (Platform.OS == 'android') {
      date = detectedDateArray[0];
      this.takePictureforAndroid(date);
    } else if (Platform.OS == 'ios') {
      let duplicated = [];
      for (var i in detectedDateArray) {
        duplicated.push(0);
      }

      /*
       detectedDateArray에 같은 데이터(날짜)가 있는 경우 duplicated의 수를 올림.
       가장 큰 수를 가진 duplicated 요소의 인덱스가 유통기한일 확률이 높은 날짜 데이터.
       날짜 데이터는 MainScreen에서 한 번 더 검사한다.
      */
      for (var i in detectedDateArray) {
        for (var j in detectedDateArray) {
          if (detectedDateArray[i] == detectedDateArray[j]) {
            duplicated[i] += 1;
          }
        }
      }

      let max = Math.max(...duplicated);

      for (var i = 0; i < duplicated.length; i++) {
        if (max == duplicated[i]) {
          date = detectedDateArray[i];
          break;
        }
      }
      this.takePictureforiOS(date);
    }
  };

  // iOS에서 유통기한으로 보이는 날짜 데이터를 찾을 시 실행됨.
  takePictureforiOS = date => {
    const {navigation, route} = this.props;
    const {leftedString} = this.state;
    navigation.goBack();
    //this.state.time_speak = true;
    const options = {quality: 0.5, base64: true};
    try {
      this.camera.takePictureAsync(options).then(data => {
        route.params.returnExpiryDateData(data.uri, date, leftedString);
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Android에서 유통기한으로 보이는 날짜 데이터를 찾을 시 실행됨.
  takePictureforAndroid = async function (expdate_speak) {
    const {navigation, route} = this.props;
    const {leftedString} = this.state;
    const options = {quality: 0.5, base64: true};
    const data = await this.camera.takePictureAsync(options);
    const source = data.uri;
    this.setState({time_speak: true});
    try {
      if (source && expdate_speak != '유통기한을 찾고 있습니다.') {
        route.params.returnExpiryDateData(
          data.uri,
          expdate_speak,
          leftedString,
        );
        navigation.goBack();
      }
      if (source && expdate_speak == '유통기한을 찾고 있습니다.')
        this.RNMLKitforAndroid(data.uri);
    } catch (error) {
      console.error(error);
    }
  };

  //Android에서 RNMLKit를 활용하여 이미지 속 날짜 검사.
  RNMLKitforAndroid = async function (image) {
    const {navigation, route} = this.props;
    const {leftedString, detectedDateArray} = this.state;
    console.log('data.uri:', image);
    Tts.speak('유통기한을 찾고 있습니다. 잠시 기다려주세요.');
    let expdate = '';
    try {
      //try-catch문으로 나눈 이유: cloudTextRecognition이 아무글자도 찾지 못할경우 오류나기때문에.
      const cloudBlocks = await RNMlKit.cloudTextRecognition(image);
      if (cloudBlocks.length) {
        cloudBlocks.map(({blockText}) => {
          var s = this.detectDate(blockText);
          console.log('string:', blockText);
          console.log('s:', s);
          if (s != -1) {
            if (!this.state.foundExpiryDate) {
              //처음 발견한 날짜를 expdate로 두고
              expdate = s;
              this.state.foundExpiryDate = true;
            } else {
              //두번째 발견한 날짜를 leftedString으로 둔다.
              this.setState(state => ({
                leftedString: [s],
              }));
            }
          }
        });
      }
      if (this.state.foundExpiryDate) {
        route.params.returnExpiryDateData(image, expdate, leftedString);
        navigation.goBack();
      }
      if (!this.state.foundExpiryDate) {
        Tts.speak('유통기한을 찾지 못했습니다. 사물의 다른 면을 보여주세요.');
        setTimeout(() => {
          this.state.canDetectText = true;
          this.setState({time_speak: false});
          this.state.time = 1;
        }, 5000);
      }
    } catch (error) {
      Tts.speak('유통기한을 찾지 못했습니다. 사물의 다른 면을 보여주세요.');
      setTimeout(() => {
        this.state.canDetectText = true;
        this.setState({time_speak: false});
        this.state.time = 1;
      }, 5000);
    }
  };

  componentDidMount() {
    Tts.speak(
      '유통기한 카메라 입니다. 사물을 한 뼘 정도 떨어뜨려 거리를 유지시켜주세요.',
    );
  }

  // renderTextBlocks와 renderTextBlock는 글자 인식의 시각적 표현을 위함.
  renderTextBlocks = () => (
    <View pointerEvents="none">
      {this.state.textBlocks.map(this.renderTextBlock)}
    </View>
  );

  renderTextBlock = ({bounds, value}) => {
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

  render() {
    return <View style={styles.container}>{this.renderCamera()}</View>;
  }

  // 카메라에서 아무것도 찍지 않고 goback했을때
  componentWillUnmount() {
    if (!this.state.foundExpiryDate) this.props.route.params.returnCheck();
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
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
