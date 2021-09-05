import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {RNCamera} from 'react-native-camera';
import Tts from 'react-native-tts';

class BarcodeScreen extends React.Component {
  state = {
    canDetectBarcode: true, // 현재 바코드 인식을 할 수 있는지
    barcodes: [], // FirebaseMLKit가 찾은 바코드 데이터 저장
    foundBarcode: false, // 제품명 찾았는지 여부
    time: 1, // 안내음성 재생을 위한 타이머
    image: '', // 바코드 인식 시 찍히는 사진 주소 저장
  };

  // 카메라 설정
  renderCamera() {
    const {canDetectBarcode} = this.state;
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
        onGoogleVisionBarcodesDetected={
          canDetectBarcode ? this.barcodeRecognized : null
        }
        googleVisionBarcodeMode={
          RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeMode.ALTERNATE
        }
        googleVisionBarcodeType={
          RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType.ALL
        }>
        {!!canDetectBarcode && this.renderBarcodes()}
      </RNCamera>
    );
  }

  //카메라가 바코드를 인식 할 수 있는 상황 일 때 자동으로 실행
  barcodeRecognized = object => {
    const {barcodes} = object;
    this.setState({barcodes});

    //일정시간 바코드를 인식하지 못할 때 안내음성 재생
    this.speak_help();

    //바코드가 인식되었을 때
    if (barcodes.length) {
      this.setState({image: barcodes[0].uri});
      this.findProductName(barcodes[0].data);
    }
  };

  // 제품명 카메라 안내음성
  speak_help = () => {
    const {time} = this.state;
    this.setState({time: time + 1});
    if (time % 35 == 0) Tts.speak('사물의 다른 면을 찍어주세요.');
  };

  // html 파싱을 통해 인식된 바코드의 제품명 검색
  findProductName = data => {
    var barcode = String(data);
    var productName = '';

    this.setState({foundBarcode: true});

    fetch(`https://www.beepscan.com/barcode/${barcode}`)
      .then(response => response.text())
      .then(text => {
        // 바코드에 매치되는 상품명을 찾지 못한경우.
        if (
          text.includes(`<meta content="${barcode} : " name="description" />`)
        ) {
          this.goBack('바코드에 해당하는 상품 정보가 없습니다.');
          return;
        }

        // 바코드로 상풍명을 찾아 productName에 저장.
        var str = `<meta content="${barcode} : `;
        productName = text
          .substring(
            text.indexOf(str) + str.length,
            text.indexOf('," name="description" />'),
          )
          .replace(/[^ㄱ-힣a\s]/g, '');
        this.goBack(`찾은 상품명은 ${productName}입니다.`);
      });
  };

  // MainScreen에 데이터를 보내고 돌아가기.
  goBack = barcode_speak => {
    const {navigation, route} = this.props;
    route.params.returnBarcodeData(this.state.image, barcode_speak);
    navigation.goBack();
  };

  componentDidMount() {
    Tts.speak('바코드 카메라 입니다. ');
  }

  // renderBarcodes와 renderBarcode는 바코드 인식의 시각적 표현을 위함.
  renderBarcodes = () => {
    return (
      <View pointerEvents="none">
        {this.state.barcodes.map(this.renderBarcode)}
      </View>
    );
  };

  renderBarcode = ({bounds, data, type}) => {
    return (
      <React.Fragment key={data + bounds.origin.x}>
        <View
          style={[
            styles.text,
            {...bounds.size, left: bounds.origin.x, top: bounds.origin.y},
          ]}>
          <Text style={[styles.textBlock]}>{`${data} ${type}`}</Text>
        </View>
      </React.Fragment>
    );
  };

  render() {
    return <View style={styles.container}>{this.renderCamera()}</View>;
  }

  //카메라에서 아무것도 찍지 않고 goback했을때
  componentWillUnmount() {
    if (!this.state.foundBarcode) this.props.route.params.returnCheck();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  text: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: '#F00',
    justifyContent: 'center',
  },
  textBlock: {
    color: '#F00',
    position: 'absolute',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
});

export default BarcodeScreen;
