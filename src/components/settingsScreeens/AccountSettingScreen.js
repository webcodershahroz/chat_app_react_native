import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {
  Text,
  StyleSheet,
  TextInput,
  View,
  Pressable,
  Image,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import dp from '../../img/dp.jpg';
import loadingGif from '../../img/loadingGif.gif';

function AccountSettingScreen({navigation, route}) {
  // const [image, setImage] = useState("https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg");
  const [defaultStatus] = useState('Assalamoalikum, Welcome to Greetings');
  const [loginDetails, setLoginDetails] = useState();
  const [isloading, setIsLoading] = useState(false);
  useEffect(() => {
    async function getLoginDetails() {
      try {
        const currentUser = JSON.parse(
          await AsyncStorage.getItem('currentUser'),
        );
        setLoginDetails(currentUser);
        return currentUser;
      } catch (error) {}
    }
    getLoginDetails();
  }, []);

  function addImage() {
    const options = {
      title: 'Select Image',
      allowsEditing: false,
      quality: 0.9,
      noData: true,
      maxWidth: 1200,
      maxHeight: 1200,
      mediaType: 'photo',
    };
    launchImageLibrary(options, async res => {
      if (res.assets && res.assets.length > 0) {
        setIsLoading(true);

        const image = res.assets[0];
        const data = new FormData();
        data.append('file', {
          uri: image.uri,
          type: image.type,
          name: image.fileName,
        });
        data.append('upload_preset', 'chat-app');
        data.append('cloud_name', 'dcapbaqct');

        try {
          const response = await fetch(
            'https://api.cloudinary.com/v1_1/dcapbaqct/image/upload',
            {
              method: 'POST',
              body: data,
            },
          );
          const result = await response.json();
          // console.log(result);
          if (result.secure_url) {
            try {
              await fetch('https://greetings-backend.vercel.app/updateImage', {
                method: 'POST',
                body: JSON.stringify({
                  email: loginDetails.email,
                  picUrl: result.secure_url,
                }),
                headers: {
                  'Content-Type': 'application/json',
                },
              })
                .then(res => res.json())
                .then(async data => {
                  const currentUser = JSON.parse(
                    await AsyncStorage.getItem('currentUser'),
                  );
                  currentUser.pic = result.secure_url;
                  AsyncStorage.setItem(
                    'currentUser',
                    JSON.stringify(currentUser),
                  );
                  navigation.goBack()
                  setIsLoading(false);
                });
            } catch (error) {
              setIsLoading(false);
              Alert.alert(
                'Internet Error',
                'Check your internet connection and than try again',
              );
            }
          } else {
            setIsLoading(false);
            Alert.alert('Error Uploading Image', result.message);
          }
        } catch (err) {
          setIsLoading(false);
          Alert.alert(
            'Internet Error',
            'Check your internet connection and than try again',
          );
          console.log(err);
        }
      }
    });
  }

  return (
    <>
      <SafeAreaView>
        <KeyboardAvoidingView>
          {loginDetails ? (
            <ScrollView>
              <View style={styles.profilePicContainer}>
                <Pressable onPress={addImage}>
                  <View style={styles.mainProfilePic}>
                    {isloading ? (
                      <ActivityIndicator
                        size={'large'}
                        style={{marginTop: 70}}></ActivityIndicator>
                    ) : (
                      <>
                        <Image
                          source={{uri: loginDetails.pic}}
                          style={styles.img}
                        />
                        <Text style={styles.uploadBtn}>
                          {loginDetails.pic ===
                          'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg'
                            ? 'Upload Image'
                            : 'Edit Image'}
                        </Text>
                      </>
                    )}
                  </View>
                </Pressable>
              </View>
              <Text style={styles.userNameStyle}>{loginDetails.username}</Text>
              <View style={{padding: 10}}>
                <Text style={styles.textHeading}>Name</Text>
                <TextInput
                  style={{
                    ...styles.textPara,
                    borderBottomWidth: 1,
                    borderBottomColor: 'green',
                  }}>
                  {loginDetails.name}
                </TextInput>
              </View>
              <View style={{padding: 10}}>
                <Text style={styles.textHeading}>Email</Text>
                <Text style={{...styles.textPara, padding: 10}}>
                  {loginDetails.email}
                </Text>
              </View>
              <View style={{padding: 10}}>
                <Text style={styles.textHeading}>About</Text>
                <TextInput
                  style={{
                    ...styles.textPara,
                    borderBottomWidth: 1,
                    borderBottomColor: 'green',
                  }}>
                  {loginDetails.status ? loginDetails.status : defaultStatus}
                </TextInput>
              </View>
            </ScrollView>
          ) : (
            <Text style={{color: 'black', textAlign: 'center', margin: 7}}>
              Something went wrong, Try again
            </Text>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  mainProfilePic: {
    borderColor: 'black',
    // backgroundColor:'gray',
    borderWidth: 0.5,
    height: 200,
    width: 200,
    borderRadius: 100,
    overflow: 'hidden',
  },
  profilePicContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  uploadBtn: {
    color: 'white',
    textAlign: 'center',
    backgroundColor: 'black',
    textAlignVertical: 'bottom',
    height: 200,
    width: 200,
    fontSize: 15,
    paddingBottom: 160,
    marginTop: 130,
    opacity: 0.5,
    position: 'absolute',
  },
  img: {
    height: 200,
    width: 200,
  },
  textHeading: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
  textPara: {
    paddingBottom: 1,
    fontSize: 15,
    color: 'black',
  },
  userNameStyle: {
    textAlign: 'center',
    fontSize: 25,
    color: 'black',
  },
});

export default AccountSettingScreen;
