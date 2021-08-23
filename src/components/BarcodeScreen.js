import React from 'react';
import {View, TouchableOpacity, StyleSheet, Text} from 'react-native';
import {RNCamera} from 'react-native-camera';
import PendingView from './PendingView';
import Tts from 'react-native-tts';
import BarcodeData from '../../data/barcodeData.json';

class BarcodeScreen extends React.Component {
  state = {
    pausePreview: false,
    canDetectBarcode: true,
    barcodes: [],
    foundBarcode: false,
    numbbber: 1,
  };

  renderCamera() {
    const {canDetectBarcode} = this.state;
    console.log('canDetect:' + canDetectBarcode);
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

  barcodeRecognized = object => {
    const {barcodes} = object;
    if (!this.state.time_speak)
      //유통기한을 읽은 뒤에도 타이머가 멈추지 않고 다른 면 찍어달라고 음성 나오는 경우 방지
      var timer = this.state.numbbber++; //시간 안에 유통기한 인식 못 했을 때 나오는 음성.
    if (timer % 20 == 0) Tts.speak('사물의 다른 면을 찍어주세요.');
    this.setState({barcodes});
    if (barcodes.length) {
      this.findProductName(barcodes[0].data);
    }
  };

  //renderBarcodes와 renderBarcode는 없어도 무관. (시각적으로 영역 표시만 하는 역할임.)
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

  // 네트워크 연결 확인 필요.
  findProductName = data => {
    var barcode = String(data);
    canDetectBarcode = false;
    var productName = '';
    fetch(`https://www.beepscan.com/barcode/${barcode}`)
      .then(response => response.text())
      .then(text => {
        // 바코드에 매치되는 상품명을 찾지 못한경우.
        if (
          text.includes(`<meta content="${barcode} : " name="description" />`)
        ) {
          this.goBack('바코드에 해당하는 상품 정보가 없습니다.');
        }

        var str = `<meta content="${barcode} : `;
        productName = text
          .substring(
            text.indexOf(str) + str.length,
            text.indexOf('," name="description" />'),
          )
          .replace(/[^ㄱ-힣a\s]/g, '');

        this.setState({foundBarcode: true});
        this.goBack(`찾은 상품명은 ${productName}입니다.`);
      });
  };

  goBack = barcode_speak => {
    const {navigation, route} = this.props;
    route.params.returnBarcodeData(barcode_speak);
    navigation.goBack();
  };

  componentDidMount() {
    Tts.speak('바코드 카메라 입니다. ');
  }

  render() {
    return <View style={styles.container}>{this.renderCamera()}</View>;
  }

  componentWillUnmount() {
    if (!this.state.foundBarcode) this.props.route.params.returnCheck(); //카메라에서 아무것도 찍지 않고 goback했을때를 처리하기 위함
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
    //fontSize: 40,
    backgroundColor: 'transparent',
  },
});

export default BarcodeScreen;
