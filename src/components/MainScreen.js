import React from 'react';
import {View, Pressable, StyleSheet,Button, Text} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';
import SwipeableViews from 'react-swipeable-views-native';

class MainScreen extends React.Component{

    handlePressPicture = () =>{
        console.log('Go to picture ');
        this.props.navigation.navigate('PictureScreen');
    }

    handlePressBarcode = () =>{
        console.log('Go to Barcode');
        this.props.navigation.navigate('BarcodeScreen');
    }

    render(){
        return(
            <SwipeableViews style={styles.mainMenu} index={1}>
            <View style = {{flex : 1, alignItems : 'center', justifyContent : 'center',}} value={0}>
            <Pressable onPress={this.handlePressPicture}
                style={styles.btn}>
                   <Text style={styles.txt}>유통기한</Text>
            </Pressable>
          </View>
            <View style = {{flex : 1, alignItems : 'center', justifyContent : 'center',}} value={1} >
            <Text style={styles.txt} >HomeScreen입니다.</Text>
          </View>
          <View style = {{flex : 1, alignItems : 'center', justifyContent : 'center',}} value={2}>
            <Pressable onPress={this.handlePressBarcode}
                style={styles.btn}>
                   <Text style={styles.txt}>바코드</Text>
            </Pressable>
          </View>
            </SwipeableViews>
        );
    }
}

const styles = StyleSheet.create({
    mainMenu:{
        backgroundColor: 'white',
        flex: 1,
    },
    btn:{
        backgroundColor: 'white',
        width:'100%',
        height:'100%',
        alignItems : 'center',
        justifyContent : 'center'
    },
    txt:{
        color: 'black',
        textAlign: 'center',
        fontSize: 20
    },
    rectButton: {
        width:'100%',
        height: '100%',
        backgroundColor: 'blue',
        },
});

export default MainScreen;