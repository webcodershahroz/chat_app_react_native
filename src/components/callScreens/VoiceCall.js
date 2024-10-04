import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useState} from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  View,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { useMyContext } from '../../context/context';
import dp from '../../img/dp.jpg';

function VoiceCall({navigation, route}) {
  const [element, setElement] = useState(route.params.element);
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setcallStatus] = useState('ringing');
  const [callDuration, setCallDuration] = useState(0)
  const {handleSendMessage} = useMyContext();

  useEffect(() => {
    setTimeout(() => {
      setcallStatus('ongoing');
      let newDuration = 0;
      setInterval( () => {
         setCallDuration(newDuration + 1);
        newDuration++;
      }, 1000);
    }, 5000);
  }, []);
  const mute = () => {
    setIsMuted(prevValue => !prevValue);
  };
  const endCall = () => {
    handleSendMessage(element,call = "voice-call",navigation,callDuration)
  };
  return (
    <>
      <SafeAreaView style={{height: Dimensions.get('window').height - 40}}>
        <View style={styles.endToEndView}>
          <Image
            source={require('../../img/lock.png')}
            style={styles.lockImg}
          />
          <Text style={styles.text}>End-to-end encrypted</Text>
        </View>
        <Text style={[styles.text, {fontSize: 40, fontWeight: 'bold'}]}>
          {element.name}
        </Text>
        <View>
          <Image style={styles.userImg} source={dp} />
          <Text style={[styles.text, {fontSize: 16}]}>
            {callStatus === 'ongoing'
              ? `00:${
                  callDuration < 10 ? `0${callDuration}` : `${callDuration}`
                }`
              : 'Ringing...'}
          </Text>
        </View>
        <View style={styles.bottonMenu}>
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
              endCall();
            }}>
            <Image
              style={styles.bottomMenuImg}
              source={require('../../img/end-call.png')}
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
  },
  endToEndView: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 20,
  },
  text: {textAlign: 'center', color: 'black'},
  userImg: {
    height: 150,
    width: 150,
    borderRadius: 100,
    alignSelf: 'center',
    marginTop: 30,
    marginHorizontal: 30,
    marginBottom: 5,
  },
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
});

export default VoiceCall;
