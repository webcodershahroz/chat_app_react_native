import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useRef, useState} from 'react';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
// import { request, PERMISSIONS } from 'react-native-permissions';

import {
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  View,
  SafeAreaView,
  Image,
  Platform,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
// import {useMyContext} from '../../context/context';

function CameraView({navigation, route}) {
  const CameraRef1 = useRef(null);
  const [rotateCamera, setRotateCamera] = useState('front');

  const changeCamera = () => {
    setRotateCamera(prevValue => {
      if (prevValue === 'front') {
        return 'back';
      } else {
        return 'front';
      }
    });
  };
  const takePicture = async () => {
    if (CameraRef1.current) {
      const options = {quality: 1, base64: true};
      const data = await CameraRef1.current.takePictureAsync(options);
      await CameraRoll.save(data.uri, {type: 'photo', album: 'YourAlbumName'});
    }
  };
  return (
    <>
      <SafeAreaView style={{flex: 1, backgroundColor: 'grey'}}>
        <RNCamera
          ref={CameraRef1}
          captureAudio={true}
          style={{flex: 1}}
          type={
            rotateCamera === 'front'
              ? RNCamera.Constants.Type.front
              : RNCamera.Constants.Type.back
          }
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          autoFocus={RNCamera.Constants.AutoFocus.on}
          flashMode={RNCamera.Constants.FlashMode.off} // Adjust as needed
          pictureSize="1920x1080" // Adjust picture size for quality
          playSoundOnCapture={false}
          useNativeZoom={true} // Enable native zoom for better quality
        />
        <View style={styles.bottonMenu}>
          <Pressable
            onPress={() => {
              changeCamera();
            }}>
            <Image
              style={styles.bottomMenuImg}
              source={require('../img/rotate-around-camera.png')}
            />
          </Pressable>
          <Pressable
            onPress={async () => {
              await takePicture();
            }}>
            <Image
              style={styles.bottomMenuImg}
              source={require('../img/camera.png')}
            />
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  lockImg: {
    height: 20,
    width: 20,
    margin: 5,
  },
  endToEndView: {
    alignItems: 'center',
    flexDirection: 'row',
    margin: 20,
    alignSelf: 'center',
    position: 'absolute',
    color: 'white',
  },
  text: {color: 'white'},
  bottonMenu: {
    backgroundColor: 'white',
    alignSelf: 'center',
    borderRadius: 20,
    height: 70,
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    flexDirection: 'row',
  },
  bottomMenuImg: {
    margin: 10,
    height: 40,
    width: 40,
  },
  reciverView: {
    height: 200,
    width: 140,
    backgroundColor: 'black',
    position: 'absolute',
    bottom: 80,
    right: 3,
    borderRadius: 10,
  },
});

export default CameraView;
