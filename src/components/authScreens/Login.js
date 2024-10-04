import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
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
import {useMyContext} from '../../context/context';
import {text} from '@fortawesome/fontawesome-svg-core';

function Login({navigation}) {
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [password, setPassword] = useState('');
  const {isLogin, setIsLogin} = useMyContext();
  const [loading, setLoading] = useState(false);
  function validateEmailAndSetEmail(text) {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(text) === false) {
      setIsEmailValid(false);
      setEmail(text);
    } else {
      setEmail(text);
      setIsEmailValid(true);
    }
  }
  async function doLogin() {
    //Authentication
    setLoading(true);
    try {
      await fetch('https://greetings-backend.vercel.app/auth/login', {
        method: 'POST',
        body: JSON.stringify({email, password}),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(res => res.json())
        .then(async data => {
          if (data.success === 0) {
            Alert.alert('Error', data.message, [
              {text: 'Try Again', onPress: () => {setLoading(false)}, style: 'cancel'},
            ]);
          } else if(data.success === 1) {
            try {
              await AsyncStorage.setItem(
                'isLoggedIn',
                JSON.stringify({login: true}),
                async () => {
                  await setIsLogin({login: true});
                },
              );
               //set current user
               await AsyncStorage.setItem(
                'currentUser',
                JSON.stringify(data.details)
              );
            } catch (error) {}
            // setLoading(false)
          }
        });
      setLoading(false);
    } catch (error) {
      Alert.alert(
        'Internet Error',
        'Check your internet connection and than try again',
        [{text: 'Try Again', onPress: () => {setLoading(false)}, style: 'cancel'}],
      );
    }
  }
  return (
    <>
      <SafeAreaView style={styles.mainView}>
        <View style={{marginBottom: 40}}>
          <Text style={styles.appName}>Greetings</Text>
          <Text style={styles.steps}>Login to continue</Text>
        </View>
        <View>
          <TextInput
            onChangeText={text => validateEmailAndSetEmail(text)}
            style={styles.input}
            value={email}
            placeholderTextColor={'grey'}
            textContentType={'emailAddress'}
            placeholder="Email"></TextInput>
          {isEmailValid || email.length === 0 ? (
            ''
          ) : (
            <Text style={{color: 'red', marginLeft: 14}}>
              Please enter a valid email
            </Text>
          )}
        </View>

        <TextInput
          onChangeText={text => setPassword(text)}
          style={styles.input}
          placeholderTextColor={'grey'}
          value={password}
          textContentType={'password'}
          secureTextEntry={true}
          placeholder="Password"></TextInput>
        <Text style={styles.forgetPass}>Forget your password?</Text>
        <View style={styles.btnView}>
          <Pressable
            disabled={!(isEmailValid && password.length > 0)}
            style={[
              styles.btn,
              isEmailValid && password.length > 0
                ? {backgroundColor: 'black'}
                : {backgroundColor: 'grey'},
            ]}
            onPress={() => doLogin()}>
            <View>
              {loading ? (
                <ActivityIndicator size={'large'} />
              ) : (
                <Text style={styles.text}>Login</Text>
              )}
            </View>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('SignUpStep1')}>
            <Text style={styles.forgetPass}>
              Don't have an account? Click to create now
            </Text>
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
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    textAlign: 'center',
    padding: 7,
    fontSize: 25,
  },
  input: {
    height: 50,
    margin: 12,
    backgroundColor: 'white',
    padding: 10,
    shadowColor: 'black',
    color: 'black',
    elevation: 5,
    borderRadius: 5,
  },
  mainView: {
    flex: 1,
    justifyContent: 'center',
  },
  backCol: {
    flex: 1,
  },
  forgetPass: {
    textAlign: 'center',
    margin: 10,
    color: 'black',
    textDecorationLine: 'underline',
  },
  appName: {
    fontSize: 50,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    color: 'black',
  },
  mainLogo: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    
  },
  steps: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
  },
});

export default Login;
