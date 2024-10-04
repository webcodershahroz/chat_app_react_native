import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
  Image,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
  ImageBackground,
  ScrollView,
  PermissionsAndroid,
  KeyboardAvoidingView,
  SafeAreaView,
  AppState,
} from 'react-native';
import Pusher from 'pusher-js';

import ChatBg from '../../img/chat-bg-lg.jpg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useMyContext} from '../../context/context';
import { useIsFocused } from '@react-navigation/native';
export default function Messagescreen({navigation, route}) {
  const scrollViewRef = useRef();
  // const [keyboardHeight, setKeyboardHeight] = useState(0);
  const dim = Dimensions.get('window');
  const [element, setElement] = useState(route.params.element);
  let [currentDate, setcurrentDate] = useState(null);
  let [currentUser, setcurrentUser] = useState(null);
  const [dropdown, setDropdown] = useState(false);
  // const pusherRef = useRef(null);
  // const channelRef = useRef(null);

  const {
    messagesFromDB,
    setMessagesFromDB,
    message,
    setMessage,
    handleSendMessage
  } = useMyContext();
  
  function renderDropdown() {
    setDropdown(prevDropDown => !prevDropDown);
  }
  const makeVideoCall = () => {
    navigation.navigate('VideoCall', {element});
  };
  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
      headerRight: () => (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Pressable
            onPress={() => {
              navigation.navigate('VoiceCall', {element});
            }}>
            <Image
              source={require('../../img/call.png')}
              style={styles.options}></Image>
          </Pressable>
          <Pressable
            onPress={() => {
              makeVideoCall();
            }}>
            <Image
              source={require('../../img/video-call.png')}
              style={styles.options}></Image>
          </Pressable>
          <Pressable onPress={renderDropdown}>
            <Image
              source={require('../../img/three-dots.png')}
              style={[styles.options, {marginRight: 0}]}></Image>
          </Pressable>
        </View>
      ),
      headerLeft: () => (
        <>
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={() => navigation.goBack()}>
            <Image
              source={require('../../img/back-arrow.png')}
              style={(styles.picBack, {height: 15, width: 15})}></Image>
            <Image
              source={{uri: element.picUrl || element.pic}}
              style={styles.picBack}></Image>
          </Pressable>
          <Pressable onPress={() => {navigation.navigate('UserAccounts',{element})}}>
            <ScrollView horizontal style={{width: 150}}>
              <Text style={{fontSize: 18, color: 'black', fontWeight: 400}}>
                {element.name}
              </Text>
            </ScrollView>
          </Pressable>
        </>
      ),
    });
  }, [navigation, element.name]);

  useEffect(() => {
    //get all the messages from async storage
    async function getMessages() {
      try {
        const AsyncMsgStorage = await JSON.parse(
          await AsyncStorage.getItem(`message${element.id || element.email}`)
        );
        await setMessagesFromDB(AsyncMsgStorage);
      } catch (error) {
        console.log(error)
      }
    }
    getMessages();
  }, []);

  const showDate = currentDate => {
    if (currentDate) {
      const day = currentDate.slice(1, 2);
      const month = currentDate.slice(3, 5);
      const year = currentDate.slice(6, 10);
      const d = new Date();
      const today = `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}`;
      const yesterday = `${d.getDate() - 1}/${d.getMonth()}/${d.getFullYear()}`;
      if (today === currentDate) return 'Today';
      if (yesterday === currentDate) return 'Yesterday';
      else return currentDate;
    }
  };

  const searchInChat = () => {};
  const deleteConversation = async () => {
    await AsyncStorage.removeItem(
      `message${element.id || element.email}`,
      async () => {
        await setMessagesFromDB();
      },
    );
    setDropdown(prevDropDown => !prevDropDown);
  };
  const mute = () => {};
  const block = () => {};
 
  return (
    <ImageBackground
      source={ChatBg}
      style={{
        resizeMode: 'contain',
        height: '100%',
        width: dim.width,
      }}>
      <SafeAreaView>
        {dropdown && (
          <View style={styles.dropdown}>
            <Pressable onPress={searchInChat()}>
              <Text style={styles.dropdownItem}>Search</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                deleteConversation();
              }}>
              <Text style={{...styles.dropdownItem, marginBottom: 9}}>
                Delete Conversation
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                mute();
              }}>
              <Text
                style={{
                  ...styles.dropdownItem,
                  borderBottomColor: 'gray',
                  borderTopWidth: 0.4,
                }}>
                Mute
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                block();
              }}>
              <Text style={{...styles.dropdownItem, color: 'red'}}>Block</Text>
            </Pressable>
          </View>
        )}
        <KeyboardAvoidingView style={{height: '100%'}}>
          <ScrollView
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current.scrollToEnd()}
            style={{marginBottom: 60}}>
            {messagesFromDB
              ? messagesFromDB.map((item, index) => {
                  const isNewDate =
                    currentDate === null || item.date !== currentDate;
                  currentDate = item.date;
                  return (
                    <View key={item.id}>
                      {isNewDate ? (
                        <Text style={styles.date}>{showDate(currentDate)}</Text>
                      ) : (
                        ''
                      )}
                      {item.duration ? (
                        <View
                          style={[
                            item.msgStyle === 'left'
                              ? styles.left
                              : styles.right,
                            styles.call,
                          ]}>
                          <Text
                            style={{
                              color:
                                item.msgStyle === 'left' ? 'black' : 'white',
                              fontSize: 20,
                              fontWeight: 'bold',
                            }}>
                            {item.message}
                          </Text>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginTop: 4,
                            }}>
                            <Text
                              style={{
                                color:
                                  item.msgStyle === 'left' ? 'black' : 'white'
                              }}>
                              {item.duration === '00:00'
                                ? 'Missed Call'
                                : item.duration}
                            </Text>
                            <Text
                              style={{
                                fontSize: 12,
                                color:
                                  item.msgStyle === 'right' ? '#e1e3e1' : '#5a5a5a',
                              }}>
                              {item.time}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        
                        <Text
                          key={item.id}
                          style={
                            item.msgStyle === 'right'
                              ? styles.right
                              : styles.left
                          }>
                          {item.message}{' '}
                          <Text
                            style={{
                              fontSize: 12,
                              color:
                                item.msgStyle === 'right'
                                  ? '#e1e3e1'
                                  : '#5a5a5a',
                            }}>
                            {item.time}
                          </Text>
                          {item.msgStyle === 'right' ? (
                            <Image
                              source={item.status}
                              style={styles.statusImg}></Image>
                          ) : (
                            ''
                          )}
                        </Text>
                      )}
                    </View>
                  );
                })
              : ''}
          </ScrollView>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              position: 'absolute',
              bottom: 0,
            }}>
            <TextInput
              onChangeText={text => setMessage(text)}
              value={message}
              placeholderTextColor={'grey'}
              style={styles.input}
              multiline={true}
              placeholder="Type Message..."></TextInput>
            <Pressable
              onPress={() => {
                handleSendMessage(
                  element,
                  (call = ''),
                  navigation,
                );
              }}>
              <Image
                source={require('../../img/send-icon.jpg')}
                style={styles.sendBtn}></Image>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
        {/* </View> */}
      </SafeAreaView>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  right: {
    backgroundColor: '#166624',
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: 'white',
    marginRight: 10,
    marginTop:5,
    borderRadius: 5,
    fontSize: 15,
    maxWidth: Dimensions.get('window').width / 2 + 120,
  },
  left: {
    backgroundColor: '#dee9e0',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: 'black',
    marginLeft: 10,
    marginTop: 5,
    borderRadius: 5,
    fontSize: 15,
    maxWidth: Dimensions.get('window').width / 2 + 120,
  },
  date: {
    backgroundColor: 'gray',
    paddingHorizontal: 10,
    alignSelf: 'center',
    paddingVertical: 2,
    color: 'white',
    textAlign: 'center',
    marginVertical: 5,
    borderRadius: 5,
    fontSize: 15,
  },
  unRead: {
    backgroundColor: 'gray',
    paddingHorizontal: 10,
    paddingVertical: 2,
    color: 'white',
    alignSelf: 'center',
    textAlign: 'center',
    marginVertical: 5,
    // marginHorizontal: '37%',
    borderRadius: 5,
    fontSize: 15,
  },
  input: {
  
    height: 50,
    margin: 5,
    backgroundColor: 'white',
    padding: 10,
    paddingLeft: 15,
    borderRadius: 10,
    color: 'black',
    width: Dimensions.get('window').width - 65,
    height:'auto',
    maxHeight:100
  },
  messageScreens: {
    height: Dimensions.get('window').height - 80,
    width: Dimensions.get('window').width,
    // marginBottom:400
  },
  sendBtn: {
    height: 50,
    width: 50,
    borderRadius: 25,
  },
  picBack: {
    height: 30,
    width: 30,
    marginHorizontal: 5,
    borderRadius: 25,
  },
  options: {
    height: 25,
    width: 25,
    marginHorizontal: 10,
    borderRadius: 25,
  },
  statusImg: {
    height: 20,
    width: 20,
  },
  dropdown: {
    backgroundColor: 'white',
    width: 220,
    position: 'absolute',
    zIndex: 7,
    right: 30,
    top: 3,
    padding: 10,
    elevation: 20,
    shadowColor: 'black',
    borderRadius: 10,
  },
  dropdownItem: {
    fontSize: 20,
    padding: 3,
    color: 'black',
    marginBottom: 2,
  },
  call: {
    height: 70,
    width: 160,
  },
});
