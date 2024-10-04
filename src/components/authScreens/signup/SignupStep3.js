import React, {useEffect, useState} from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  View,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import email from 'react-native-email';
import {useMyContext} from '../../../context/context';
function SignupStep3({navigation, route}) {
  const otpReciver = route.params.email;
  const [code, setCode] = useState('');
  const [otp, setOtp] = useState();
  const [isOTPValid, setIsOTPValid] = useState('');
  const [requestNewCodeTime, setRequestNewCodeTime] = useState(59);
  const [loading, setLoading] = useState(false);

  const {displayNotificationGreetings} = useMyContext();
  const handleThirdNext = async () => {
    setLoading(true);
    if (otp === code) {
      navigation.navigate('FinishSignup');
    } else {
      setIsOTPValid('Enter Valid OTP');
    }
    setLoading(false);
  };
  useEffect(() => {
    const stopTime = time => {
      clearInterval(time);
    };
    const sendOTPToEmail = async otp => {
      try {
        await fetch('https://greetings-backend.vercel.app/auth/verifyEmail', {
          method: 'POST',
          body: JSON.stringify({email: otpReciver, otp}),
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then(res => res.json())
          .then(async data => {
            Alert.alert('Verification', data.message, [
              {text: 'Ok', onPress: () => {}, style: 'cancel'},
            ]);
          });
      } catch (error) {
        Alert.alert(
          'Internet Error',
          'Check your internet connection and than try again',
          [{text: 'Try Again', onPress: () => {}, style: 'cancel'}],
        );
      }
    };
    const generateOTP = async () => {
      const char = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
      let otp = '';
      let i = 0;
      while (i < 6) {
        const ranNum = char[Math.floor(Math.random() * char.length)];
        otp = otp + ranNum;
        i++;
      }
      setOtp(otp);
      //send to email address
      await sendOTPToEmail(otp);
      // await displayNotificationGreetings(otp)

      const time = setInterval(() => {
        setRequestNewCodeTime(prevState => {
          if (prevState >= 1) {
            return prevState - 1;
          } else if (prevState <= 0) {
            return stopTime(time);
          }
        });
      }, 1000);
    };
    generateOTP();
  }, []);

  return (
    <>
      <SafeAreaView style={styles.mainView}>
        <Text style={styles.textMain}>
          Enter the code sent to your given email address
        </Text>
        <View>
          <TextInput
            onChangeText={text => setCode(text)}
            value={code}
            placeholderTextColor={'black'}
            keyboardType="number-pad"
            style={styles.input}
            placeholder="Code"></TextInput>
          <Text style={{color: 'red', marginLeft: 3}}>{isOTPValid}</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.resendText, {color: 'black'}]}>
            Did't recive the code. Request after 00:{requestNewCodeTime || '00'}
          </Text>
        </Pressable>
        <View style={styles.btnView}>
          <Pressable
            disabled={!code.length === 6}
            style={[
              styles.btn,
              code.length === 6
                ? {backgroundColor: 'black'}
                : {backgroundColor: 'grey'},
            ]}
            onPress={() => handleThirdNext()}>
            <View>
              {loading ? (
                <ActivityIndicator size={'large'} />
              ) : (
                <Text style={styles.next}>Confirm</Text>
              )}
            </View>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: 'black',
    borderRadius: 6,
    height: 50,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  next: {
    color: 'white',
    textAlign: 'center',
    padding: 7,
    fontSize: 25,
  },
  btnView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  textMain: {
    fontSize: 20,
    color: 'black',
    marginVertical: 20,
    marginHorizontal: 5,
  },
  input: {
    height: 50,
    marginBottom: 7,
    backgroundColor: 'white',
    padding: 10,
    shadowColor: 'black',
    elevation: 5,
    borderRadius: 5,
    fontSize: 19,
    color: 'black',
  },
  mainView: {
    margin: 10,
    flex: 1,
  },
});

export default SignupStep3;
