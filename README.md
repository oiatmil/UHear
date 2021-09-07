# UHear

### **UHear**은 시각장애인 소비자를 위한 유통기한 및 제품명 음성안내 앱입니다.

<br>

**[iOS]**
<br>

<img src="./readme/expdate-ios.gif" width=35%/> <img src="./readme/barcode-ios.gif" width=35%/>

<br>

**[Android]**
<br>

<img src="./readme/expdate-android.gif" width=35%/> <img src="./readme/barcode-android.gif" width=35%/>

<br>

**[시연영상]**  
<a href="https://www.youtube.com/watch?v=wOdCu0C2UhQ">youtube</a>

## 앱 설치

### 📌 iOS

1. 코드 복사
   ```sh
   git clone https://github.com/oiatmil/UHear.git
   ```
2. UHear 폴더에서 NPM packages 설치
   ```sh
   npm install
   ```
3. pod 설치
   ```sh
   cd ios && pod install && cd ..
   ```
4. Xcode에서 시뮬레이터 기기 선택하고 실행

### 📌 Android

1. 코드 복사
   ```sh
   git clone https://github.com/oiatmil/UHear.git
   ```
2. Uhear 폴더 내에서 yarn install 로 필요한 모듈 깔기
   ```sh
   yarn install
   ```
3. android studio에서 Uhear폴더 open 후 sync project with gradle files

###

4. src/components/ExpiryDateScreen.js 의 import RNMlkit from 'react-native-firebase-mlkit' 주석해제

###

5.  ```sh
    yarn add react-native-firebase-mlkit
    ```

###

6. android studio에서 시뮬레이셜 돌릴 android 기기 연결

###

7.  ```sh
    npx react-native run-android
    ```

## 개발 환경

IDE : Visual Studio Code / Android Studio / Swift  
라이브러리 : React-native  
사용 언어 : HTML / CSS / JavaScript  
SDK : firebase MLKit / Google Cloud Vision  
개발 서버와 연결 : Node.js  
협업 툴 : git / Google Drive

###

<img src="./readme/DE.png" width=60% style="margin:5% 0% 0%"/>

## 라이브러리

<a href="https://github.com/react-native-camera/react-native-camera">React Native Camera</a>  
<a href="https://github.com/ak1394/react-native-tts">React Native TTS</a>  
<a href="https://github.com/mateuscgs/react-native-firebase-mlkit">react-native-firebase-mlkit</a>  
<a href="https://reactnavigation.org/">React Navigation</a>  
<a href="https://github.com/software-mansion/react-native-gesture-handler">React Native Gesture Handler</a>  
<a href="https://github.com/oliviertassinari/react-swipeable-views">react-swipeable-views</a>

## Contributors

<a href="https://github.com/oiatmil"><img src="https://avatars.githubusercontent.com/u/75559067?v=4" style="width: 3%"> 이수민</img></a>  
<a href="https://github.com/dimplehh"><img src="https://avatars.githubusercontent.com/u/57757760?v=4" style="width: 3%"> 이현희</img></a>
