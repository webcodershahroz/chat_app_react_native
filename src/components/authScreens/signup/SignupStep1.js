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

function SignupStep1({navigation}) {
  const [username, setUsername] = useState('');
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [fetchResponse, setFetchResponse] = useState('');
  const [loading, setLoading] = useState(false);
  async function validateUsername(text) {
    setUsername(text);
  }
  const handleFirstNext = async () => {
    if (username.length > 4) {
      setLoading(true)
      try {
        await fetch('https://greetings-backend.vercel.app/auth/existsUsername', {
          method: 'POST',
          body: JSON.stringify({username}),
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then(res => res.json())
          .then(async data => {
            if (data.success === 1) {
              setIsUsernameValid(true);
              await AsyncStorage.removeItem('temp-account');
              await AsyncStorage.setItem(
                'temp-account',
                JSON.stringify({username}),
              );

              navigation.navigate('SignUpStep2');
            } else {
              setFetchResponse(data.message);
              setIsUsernameValid(false);
            }
          });
          setLoading(false)
        } catch (error) {
        setLoading(false)
        Alert.alert('Internet Error', "Check your internet connection and than try again", [{text: 'Try Again',onPress:()=>{},style:'cancel'}]);

      }
    }
  };
  return (
    <>
      <SafeAreaView style={styles.mainView}>
        <Text style={styles.textMain}>Enter username to continue</Text>
        <View>
          <TextInput
            onChangeText={text => validateUsername(text)}
            style={styles.input}
            value={username}
            placeholderTextColor={'black'}
            placeholder="Username"></TextInput>
          {isUsernameValid || username.length < 4 ? (
            ''
          ) : (
            <Text style={{color: 'red', marginLeft: 14}}>{fetchResponse}</Text>
          )}
        </View>

        <View style={styles.btnView}>
          <Pressable
            disabled={username.length < 4}
            style={[styles.btn, username.length>4? {backgroundColor: 'black'}:{backgroundColor: 'grey'}]}
            onPress={() => handleFirstNext()}>
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
    borderRadius: 6,
    height: 50,
    margin: 5,
    justifyContent:'center',alignItems:'center'
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
    marginBottom: 13,
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
  forgetPass: {
    textAlign: 'center',
    margin: 10,
    color: 'black',
    textDecorationLine: 'underline',
  },
});

export default SignupStep1;
// uploadBtn: {
//   color: 'white',
//   textAlign: 'center',
//   backgroundColor: 'black',
//   textAlignVertical: 'bottom',
//   height: 200,
//   width: 200,
//   fontSize: 20,
//   paddingBottom: 160,
//   marginTop: 130,
//   opacity: 0.3,
// },
