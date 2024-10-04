import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useRef, useState} from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  View,
  SafeAreaView,
  Image,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import {useMyContext} from '../../context/context';

function VideoCall({navigation, route}) {
  const CameraRef1 = useRef(null);
  const CameraRef2 = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [element, setElement] = useState(route.params.element);
  const [isCamera, setIsCamera] = useState(true);
  const [callStatus, setcallStatus] = useState('ringing');
  const {handleSendMessage} = useMyContext();
  const [rotateCamera, setRotateCamera] = useState('front');
  const [callDuration, setCallDuration] = useState(0);

  const changeCamera = () => {
    setRotateCamera(prevValue => {
      if (prevValue === 'front') {
        return 'back';
      }
      else{
        return 'front'
      }
    });
  };
  const mute = () => {
    setIsMuted(prevValue => !prevValue);
  };
  const diableCamera = () => {
    setIsCamera(prevValue => !prevValue);
  };
  const endCall = () => {
    handleSendMessage(
      element,
      (call = 'video-call'),
      navigation,
      callDuration,
    );
  };
  useEffect(() => {
    setTimeout(() => {
      setcallStatus('ongoing');
      let newDuration = 0;
      setInterval(() => {
        setCallDuration(newDuration + 1);
        newDuration++;
      }, 1000);
    }, 5000);
  }, []);
  return (
    <>
      <SafeAreaView style={{flex: 1, backgroundColor: 'grey'}}>
        {isCamera ? (
          <RNCamera
          ref={CameraRef1}
          captureAudio={true}
          style={{ flex: 1 }}
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
        ) : (
          ''
        )}
        <View style={styles.endToEndView}>
          <Image
            source={require('../../img/lock.png')}
            style={styles.lockImg}
          />
          <Text style={styles.text}>End-to-end encrypted</Text>
        </View>
        <Text
          style={[
            styles.endToEndView,
            {marginVertical: 50, fontSize: 16},
            styles.text,
          ]}>
          {callStatus === 'ongoing'
            ? `00:${callDuration < 10 ? `0${callDuration}` : `${callDuration}`}`
            : 'Ringing...'}
        </Text>

        <View style={styles.bottonMenu}>
          <Pressable
            onPress={() => {
              changeCamera();
            }}>
            <Image
              style={styles.bottomMenuImg}
              source={require('../../img/rotate-around-camera.png')}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              mute();
            }}>
            <Image
              style={styles.bottomMenuImg}
              source={
                isMuted
                  ? require('../../img/mic-mute-32.png')
                  : require('../../img/mic.png')
              }
            />
          </Pressable>
          <Pressable
            onPress={() => {
              diableCamera();
            }}>
            <Image
              style={styles.bottomMenuImg}
              source={
                isCamera
                  ? require('../../img/camera-no.png')
                  : require('../../img/camera.png')
              }
            />
          </Pressable>
          <Pressable
            onPress={async () => {
              // await takePicture();
              endCall();
            }}>
            <Image
              style={styles.bottomMenuImg}
              source={require('../../img/end-call.png')}
            />
          </Pressable>
        </View>
        <View style={styles.reciverView}>
          {callStatus === 'ongoing' ? (
            <RNCamera
              ref={CameraRef2}
              captureAudio={false}
              style={{flex: 1}}
              type={RNCamera.Constants.Type.front}
              androidCameraPermissionOptions={{
                title: 'Permission to use camera',
                message: 'We need your permission to use your camera',
                buttonPositive: 'Ok',
                buttonNegative: 'Cancel',
              }}
            />
          ) : (
            ''
          )}
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

export default VideoCall;
