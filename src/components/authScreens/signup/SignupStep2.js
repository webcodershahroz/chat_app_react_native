import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState} from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  View,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';

function SignupStep2({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);
  const [loading, setLoading] = useState(false);

  function validateEmailAndSetEmail(text) {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    setEmail(text);
    if (reg.test(text) === false) {
      setIsEmailValid(false);
    } else {
      setIsEmailValid(true);
    }
  }
  function validatePasswordAndSetPassword(text) {
    let checkPass = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
    setPassword(text);
    if (checkPass.test(text)) {
      setIsPasswordStrong(true);
    } else {
      setIsPasswordStrong(false);
    }
  }
  const handleSecondNext = async () => {
    setLoading(true);
    try {
      await fetch('https://greetings-backend.vercel.app/auth/existsEmail', {
        method: 'POST',
        body: JSON.stringify({email}),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(res => res.json())
        .then(async data => {
          if (data.success === 1) {
            let tempAccount = JSON.parse(
              await AsyncStorage.getItem('temp-account'),
            );

            tempAccount = {...tempAccount, email, password};
            await AsyncStorage.setItem(
              'temp-account',
              JSON.stringify(tempAccount),
            );
            navigation.navigate('SignUpStep3', {email});
          } else {
            Alert.alert(
              'Email already exists',
              `${email} is already used by another account. Try to use another one`,
              [{text: 'Try again', onPress: () => {}, style: 'cancel'}],
            );
          }
        });
    } catch (error) {
      Alert.alert(
        'Internet Error',
        'Check your internet connection and than try again',
        [{text: 'Try Again', onPress: () => {}, style: 'cancel'}],
      );
    }
    setLoading(false);
  };
  return (
    <>
      <SafeAreaView style={styles.mainView}>
        <Text style={styles.textMain}>Enter Email and Password</Text>
        <View>
          <View>
            <TextInput
              onChangeText={text => validateEmailAndSetEmail(text)}
              style={styles.input}
              placeholderTextColor={'black'}
              value={email}
              placeholder="Email"></TextInput>
            {isEmailValid || email.length === 0 ? (
              ''
            ) : (
              <Text style={{color: 'red', marginLeft: 14}}>
                Please enter a valid email
              </Text>
            )}
          </View>
          <View>
            <TextInput
              onChangeText={text => validatePasswordAndSetPassword(text)}
              style={styles.input}
              placeholderTextColor={'black'}
              value={password}
              textContentType={'password'}
              secureTextEntry={true}
              placeholder="Password"></TextInput>
            {isPasswordStrong || password.length === 0 ? (
              ''
            ) : (
              <Text style={{color: 'red', marginLeft: 4}}>
                Password must be of 8 character. Including letter, numbers,
                alpabets
              </Text>
            )}
          </View>
        </View>
        <View style={styles.btnView}>
          <Pressable
            disabled={!(isEmailValid && isPasswordStrong)}
            style={[
              styles.btn,
              isEmailValid && isPasswordStrong
                ? {backgroundColor: 'black'}
                : {backgroundColor: 'grey'},
            ]}
            onPress={() => handleSecondNext()}>
            <View>
              {loading ? (
                <ActivityIndicator size={'large'} />
              ) : (
                <Text style={styles.next}>Next</Text>
              )}
            </View>
          </Pressable>
        </View>
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.forgetPass}>Already have an account?</Text>
        </Pressable>
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
    color: 'black',
    height: 50,
    marginVertical: 10,
    backgroundColor: 'white',
    padding: 10,
    shadowColor: 'black',
    elevation: 5,
    borderRadius: 5,
    fontSize: 19,
  },
  mainView: {
    margin: 10,
    flex: 1,
  },
  forgetPass: {
    textAlign: 'center',
    margin: 10,
    color: 'black',
    textDecorationLine: 'underline',
  },
});

export default SignupStep2;
