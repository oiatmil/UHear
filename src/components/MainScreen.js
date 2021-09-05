import React from 'react';
import {View, Pressable, StyleSheet, Text, Image} from 'react-native';
import SwipeableViews from 'react-swipeable-views-native';
import Tts from 'react-native-tts';

//제품명 및 유통기한 인식 후 제공되는 이미지 크기
const DEFAULT_HEIGHT = 500;
const DEFAULT_WIDTH = 600;

class MainScreen extends React.Component {
  state = {
    image: '', // 유통기한이나 제품명을 인식했을 때 스크린에 표시할 이미지 주소

    //유통기한 데이터 처리를 위한 state
    expiryDateIsExist: false, //ExpiryDateScreen에서 날짜 데이터를 가지고 돌아왔는지 확인
    // ExpiryDateScreen에서 가져온 날짜 데이터는 유통기한일 수도 있고, 제조일자 일수도 있으므로 MainScreen에서 한번 더 판별하기 위한 state를 둔다.
    returned_date: '', // 유통기한으로 추정되는 데이터
    returned_string: [], // 유통기한이 있을 수도 있는 문자열
    expdate_speak: '', // 유통기한으로 확정된 데이터와 안내 문구 함께 저장

    //제품명 데이터 처리를 위한 state
    productNameIsExist: false, //BarcodeScreen에서 제품명 데이터를 가지고 돌아왔는지 확인
    productName_speak: '', // 제품명으로 확정된 데이터와 안내 문구 함께 저장

    help_num: 0, // 앱 사용 방법 안내 음성
    currentViewIndex: 1,
  };

  // ExpiryDateScreen에서 데이터를 전달 받아 처리.
  returnExpiryDateData = (image, returned_date, returned_string) => {
    Tts.stop();

    if (!this.state.expiryDateIsExist) {
      this.setState({
        image: image,
        returned_date: returned_date,
        returned_string: returned_string,
        expiryDateIsExist: true,
      });

      this.check_ExpiryDate();
    }
  };

  // ExpiryDateScreen에서 가져온 날짜가 유통기한이 맞는지 확인하기 위해.
  check_ExpiryDate = () => {
    var {returned_string} = this.state;
    var v = '';
    var arr = [];

    // ExpiryDateScreen이 보낸 문자열(returned_string)에서 날짜 데이터가 있는지 확인.
    for (var i in returned_string) {
      if ((v = this.identifyDate(returned_string[i])) != '-1') {
        arr.push(v);
      }
    }

    // 위에서 찾은 날짜데이터들(arr)을 비교하여 유통기한 판별
    this.findExpdateData(arr);
  };

  //날짜가 맞는지 검사
  identifyDate = inputStr => {
    var str = String(inputStr).replace(/[^0-9]/g, '');
    var index = 0;
    if ((index = str.indexOf('2')) != -1) {
      str = str.substring(index, str.length);
    }

    //2020년 유통기한에 대한 처리
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

  // 유통기한 날짜를 찾고 확정 짓는다.
  findExpdateData = detectedDateArray => {
    let date = '';
    const {returned_date} = this.state;
    console.log('findExpdate');

    //detectedDateArray에 요소가 있다는 것은 날짜데이터가 있다는 것임으로.
    if (detectedDateArray.length) {
      console.log('here!');
      let duplicated = [];
      for (var i in detectedDateArray) {
        duplicated.push(0);
      }

      for (var i in detectedDateArray) {
        for (var j in detectedDateArray) {
          if (detectedDateArray[i] == detectedDateArray[j]) {
            duplicated[i] += 1;
          }
        }
      }

      let max = Math.max(...duplicated);

      for (var i in duplicated) {
        if (max == duplicated[i]) {
          date = detectedDateArray[i];
          break;
        }
      }

      //ExpiryDateScreen에서 가져온 인자 중 전자와 후자 날짜 대소비교해서 더 미래의 것을 유통기한으로 판단.
      if (returned_date > date) date = returned_date;
    } else {
      //detectedDateArray에 요소가 없으면 ExpiryDateScreen에서 가져온 날짜(returned_date)가 유통기한.
      date = returned_date;
    }

    let expdateArray = date.split('-');
    this.setState({
      expdate_speak: `제품의 유통기한은 ${expdateArray[0]}년 ${expdateArray[1]}월 ${expdateArray[2]}일 까지입니다.`,
    });
    Tts.stop();
    Tts.speak(
      `${this.state.expdate_speak} 다시 듣기를 원하시면 화면을 한 번 터치해주세요.`,
    );
  };

  //터치 이벤트 발생 시 유통기한 안내음성을 재생할 수 있는 콜백함수
  replay_expdate = () => {
    const {expdate_speak, expiryDateIsExist} = this.state;

    if (expiryDateIsExist) {
      Tts.stop();
      Tts.speak(expdate_speak);
    }
  };

  // BarcodeScreen에서 데이터를 전달 받아 처리.
  returnBarcodeData = (image, productName_speak) => {
    if (!this.state.productNameIsExist) {
      this.setState({
        productName_speak: productName_speak,
        image: image,
        productNameIsExist: true,
      });
      Tts.stop();
      Tts.speak(
        `${productName_speak} 다시 듣기를 원하시면 화면을 한 번 터치해주세요.`,
      );
    }
  };

  //터치 이벤트 발생 시 제품명 안내음성을 재생할 수 있는 콜백함수
  replay_barcode = () => {
    const {productName_speak} = this.state;
    if (this.state.productNameIsExist) {
      Tts.stop();
      Tts.speak(productName_speak);
    }
  };

  //어플 사용 방법 안내 음성
  speak_help = () => {
    const {help_num} = this.state;

    this.setState({
      help_num: help_num + 1 > 3 ? 1 : help_num + 1,
    });

    Tts.stop();

    switch (help_num) {
      case 1:
        Tts.speak(
          '윗면과 아랫면이 있는 제품의 경우 윗면이나 아랫면을 먼저 보여주시면 더 빨리 찾으실 수 있습니다.',
        );
        break;
      case 2:
        Tts.speak('카메라는 밝은 곳에서 실행해야 인식이 잘 됩니다.');
        break;
      case 3:
        Tts.speak(
          '제품의 유통기한 글자가 바래졌을 경우 인식이 어려울 수 있습니다.',
        );
        break;
    }
  };

  speak_home = () => {
    Tts.stop();
    Tts.speak(
      '유희얼입니다. 왼쪽으로 스와이프 시 유통기한, 오른쪽으로 스와이프 시 바코드를 알 수 있습니다.' +
        '주의사항 듣기를 원하시면 화면을 길게 눌러주세요.',
    );
  };

  // 뒤로가기 이벤트 발생 시 샐행되는 함수. BarcodeScreen과 ExpiryDateScreen에 각각 주어짐.
  returnCheck = () => {
    this.changeScreen(1, 0); //자동으로 뷰전환시킴.
  };

  //스와이프(뷰 전환) 시 실행되는 함수.
  changeScreen = (current, previous) => {
    Tts.stop();
    this.setState({currentViewIndex: current});

    // 유통기한 뷰로 이동할 때
    if (current === 0 && previous === 1) {
      this.state.expiryDateIsExist = false;
      this.props.navigation.navigate('ExpiryDateScreen', {
        returnExpiryDateData: this.returnExpiryDateData,
        returnCheck: this.returnCheck,
      });
    }

    // 제품명 뷰로 이동할 때
    if (current === 2 && previous === 1) {
      this.state.productNameIsExist = false;
      this.props.navigation.navigate('BarcodeScreen', {
        returnBarcodeData: this.returnBarcodeData,
        returnCheck: this.returnCheck,
      });
    }

    // 제품명, 유통기한 스크린(뷰)에서 홈화면으로 돌아왔을 때
    if (
      (current === 1 && previous === 0) ||
      (current === 1 && previous === 2)
    ) {
      Tts.speak('홈 화면입니다.');
      this.setState({image: '', expdate_speak: '', productName_speak: ''});
    }
  };

  //앱 실행 시 제일 먼저 들리는 안내 음성.
  componentDidMount() {
    Tts.speak(
      '유희얼입니다. 왼쪽으로 스와이프 시 유통기한, 오른쪽으로 스와이프 시 바코드를 알 수 있습니다.' +
        '주의사항 듣기를 원하시면 화면을 길게 눌러주세요.',
    );
  }

  render() {
    const {image, expdate_speak, productName_speak, currentViewIndex} =
      this.state;
    return (
      <SwipeableViews
        style={styles.mainMenu}
        index={currentViewIndex}
        onChangeIndex={this.changeScreen}>
        <View
          style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
          value={0}>
          <Pressable onPress={this.replay_expdate} style={styles.btn}>
            <View style={styles.imageContainer}>
              <Image style={styles.image} source={{uri: image}} />
              <Text>{expdate_speak}</Text>
            </View>
          </Pressable>
        </View>
        <View
          style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
          value={1}>
          <Pressable
            onLongPress={this.speak_help}
            style={styles.btn}
            onPress={this.speak_home}>
            <Image style={styles.home_image} source={require('./sample.jpg')} />
          </Pressable>
        </View>
        <View
          style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
          value={2}>
          <Pressable onPress={this.replay_barcode} style={styles.btn}>
            <View style={styles.imageContainer}>
              <Image style={styles.image} source={{uri: image}} />
              <Text>{productName_speak}</Text>
            </View>
          </Pressable>
        </View>
      </SwipeableViews>
    );
  }
}

const styles = StyleSheet.create({
  mainMenu: {
    backgroundColor: 'white',
    flex: 1,
  },
  btn: {
    backgroundColor: '#FFE89A',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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
  home_image: {
    marginVertical: 15,
    height: '100%',
    width: '100%',
  },
});

export default MainScreen;
