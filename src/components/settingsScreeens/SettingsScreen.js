import React, {useLayoutEffect, useRef, useState} from 'react';
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
  Alert,
} from 'react-native';
import myPic from '../../img/mypic.png';
import chatLogo from '../../img/chat-logo-lg.png';
import accountLogo from '../../img/account-logo-lg.png';
import {useMyContext} from '../../context/context';
import AsyncStorage from '@react-native-async-storage/async-storage';

function SettingsScreen({navigation, route}) {
  const [searchEnabled, setSearchEnabled] = useState(false);
  const {isLogin, setIsLogin,setContacts} = useMyContext();
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Settings',
      // headerRight: () => (
      //   <View style={{flexDirection: 'row', alignItems: 'center'}}>
      //     {/* <Pressable style={styles.search}>
      //       <TextInput
      //         style={styles.searchText}
      //         placeholderTextColor={'grey'}
      //         placeholder="Search settings"></TextInput>
      //     </Pressable> */}
      //     <Pressable
      //       onPress={() => {
      //         if (Keyboard.isVisible) Keyboard.dismiss();
      //       }}>
      //       <Image
      //         source={require('../../img/search-lg.png')}
      //         style={styles.searchIcon}></Image>
      //     </Pressable>
      //   </View>
      // ),
    });
  }, [navigation]);

  async function handleLogout() {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout. Backup before logout',
      [
        {
          text: 'Logout',

          onPress: async () => {
            await AsyncStorage.clear()
            await setContacts([])
            await AsyncStorage.setItem(
              'isLoggedIn',
              JSON.stringify({login: false, details: {}}),
              async () => {
                await setIsLogin({login: false, details: {}});
              },
            );
          },
        },
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
      ],
    );
  }
  return (
    <>
      <SafeAreaView>
        <ScrollView>
          <Pressable
            onPress={() => {
              navigation.navigate('ThemeSettingScreen');
            }}>
            <View style={styles.textView}>
              <Image style={styles.img} source={chatLogo}></Image>
              <Text style={styles.text}>Theme</Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => {
              navigation.navigate('AccountSettingScreen');
            }}>
            <View style={styles.textView}>
              <Image style={styles.img} source={accountLogo}></Image>
              <Text style={styles.text}>Account</Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => {
              handleLogout();
            }}>
            <View style={styles.textView}>
              {/* <Image style={styles.img} source={}></Image> */}
              <Text style={[styles.text, {marginLeft:25, color: 'red'}]}>Log out</Text>
            </View>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  search: {
    width: Dimensions.get('window').width - 120,
    backgroundColor: 'white',
    elevation: 40,
    height: 45,
    shadowColor: 'black',
    borderRadius: 5,
    marginRight: 10,
  },
  searchText: {
    fontSize: 20,
    paddingHorizontal: 9,
    color: 'black',
  },
  text: {
    fontSize: 20,
    color: 'black',
  },
  searchIcon: {
    height: 30,
    width: 30,
    marginHorizontal: 5,
  },
  textView: {
    // backgroundColor:'white',
    borderBottomWidth: 1,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
  },
  img: {
    width: 30,
    height: 30,
    marginHorizontal: 20,
  },
});

export default SettingsScreen;
