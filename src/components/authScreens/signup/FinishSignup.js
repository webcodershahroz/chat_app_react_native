import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState} from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  View,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {useMyContext} from '../../../context/context';

function FinishSignup({navigation}) {
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [name, setName] = useState('');
  const {isLogin, setIsLogin} = useMyContext();
  const [loading, setLoading] = useState(false);
  const {currentUser, setCurrentUser} = useMyContext();
  const finish = async () => {
    setLoading(true);
    let tempAccount = await JSON.parse(
      await AsyncStorage.getItem('temp-account'),
    );
    tempAccount = {...tempAccount, dateOfBirth, name};
    try {
      await fetch('https://greetings-backend.vercel.app/auth/signup', {
        method: 'POST',
        body: JSON.stringify(tempAccount),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(res => res.json())
        .then(async data => {
          if (data.success === 1) {
            try {
              await AsyncStorage.setItem(
                'isLoggedIn',
                JSON.stringify({login: true}),
                async () => {
                  await setIsLogin({login: true});
                },
              );
              //set current user
              await AsyncStorage.setItem('currentUser', JSON.stringify(data.details));

              setLoading(false);
            } catch (error) {
              setLoading(false);
              Alert.alert(
                'Something went wrong',
                'Please try again later',
                [{text: 'Try Again', onPress: () => {}, style: 'cancel'}],
              );
            }
          }
        });
    } catch (error) {
      setLoading(false);
      Alert.alert(
        'Internet Error',
        'Check your internet connection and than try again',
        [{text: 'Try Again', onPress: () => {}, style: 'cancel'}],
      );
    }
  };
  return (
    <>
      <DatePicker
        modal
        mode={'date'}
        open={open}
        date={date}
        onConfirm={date => {
          setOpen(false);
          setDateOfBirth(date.toString().slice(0, 15));
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
      <SafeAreaView style={styles.mainView}>
        <Text style={styles.textMain}>Enter Your details</Text>
        <View>
          <TextInput
            onChangeText={text => setName(text)}
            value={name}
            placeholderTextColor={'black'}
            style={styles.input}
            placeholder="Enter your name"></TextInput>
          {name.length > 2 || name.length === 0 ? (
            ''
          ) : (
            <Text style={{color: 'red', marginLeft: 14}}>
              Enter a valid name
            </Text>
          )}
        </View>

        <Pressable onPress={() => setOpen(true)}>
          <TextInput
            editable={false}
            style={styles.input}
            value={dateOfBirth}
            placeholderTextColor={'black'}
            placeholder="Date of Birth"></TextInput>
        </Pressable>

        <View style={styles.btnView}>
          <Pressable
            disabled={!(name.length > 2 && dateOfBirth.length)}
            style={[
              styles.btn,
              name.length > 2 && dateOfBirth.length
                ? {backgroundColor: 'black'}
                : {backgroundColor: 'grey'},
            ]}
            onPress={() => finish()}>
            <View>
              {loading ? (
                <ActivityIndicator size={'large'} />
              ) : (
                <Text style={styles.finish}>Finish</Text>
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
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finish: {
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
  resendText: {
    margin: 10,
    color: 'black',
    textDecorationLine: 'underline',
  },
});

export default FinishSignup;

{
  /* <View style={styles.logoContainer}>
              <Pressable onPress={addImage}>
                <View style={styles.mainLogo}>
                  {image === null ? (
                    <Text style={styles.uploadBtn}>Upload Image</Text>
                  ) : (
                    <Image source={myPic} style={styles.img} />
                  )}
                </View>
              </Pressable>
            </View> */
}
{
  /* <TextInput style={styles.input} placeholder="Password"></TextInput> */
}
{
  /* <TextInput
              style={styles.input}
              placeholder="Confirm password"></TextInput> */
}
{
  /* </ImageBackground> */
}

{
  /* <ImageBackground
        source={LoginBg}
        style={{resizeMode: 'contain', height: dim.height, width: dim.width}}> */
}
