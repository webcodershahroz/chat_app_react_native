import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
  Text,
  StyleSheet,
  View,
  Pressable,
  Image,
  SafeAreaView,
  ScrollView,
  AppState,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import selectedPNG from '../../img/selected.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused} from '@react-navigation/native';
import pusherJs from 'pusher-js';
import {useMyContext} from '../../context/context';
import sentImg from '../../img/messageNotifier/sent.png';
import deliveredImg from '../../img/messageNotifier/delivered.png';
import pendingSent from '../../img/messageNotifier/notSent.png';

function ChatScreen({navigation, route}) {
  const isFocused = useIsFocused();
  const [dropdown, setDropdown] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const {contacts, setContacts} = useMyContext();

  // useEffect(() => {
  //   async function subscribeToReciveMessageChannel() {
  //     const email = await getCurrentUser();
  //     const senderChannelName = `channel-${email}`;
  //      if (!pusherRef1.current) {
  //        pusherRef1.current = new pusherJs('b80a07f65d34ffabe87d', {
  //          cluster: 'ap2',
  //        });
  //      }
  //      const channelName = `channel-${senderChannelName}`;
  //      channelRef1.current = await pusherRef1.current.subscribe(channelName);
  //      await channelRef1.current.bind('messageRecived', async data => {
  //        await notifyMessageRecived(data);
  //      });
  //   }
  //   subscribeToReciveMessageChannel();
  // });
  useEffect(() => {
    async function checkForDpUpdate() {
      const foundContacts = JSON.parse(
        await AsyncStorage.getItem('user-contacts'),
      );
      if (foundContacts) {
        await foundContacts.forEach(async element => {
          await fetch(
            'https://greetings-backend.vercel.app/getContactDetails',
            {
              method: 'POST',
              body: JSON.stringify({email: element.email}),
              headers: {
                'Content-Type': 'application/json',
              },
            },
          )
            .then(res => res.json())
            .then(async data => {
              if (element.pic !== data.userData.pic) {
                element.pic = data.userData.pic;
              }
            });
          await AsyncStorage.setItem(
            'user-contacts',
            JSON.stringify(foundContacts),
          );
        });
      }
    }
    checkForDpUpdate();
  }, []);

  const getCurrentUser = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('currentUser');
      return jsonValue != null ? JSON.parse(jsonValue).email : null;
    } catch (error) {
      console.error('Failed to retrieve the email from storage:', error);
    }
  };
  //dropdown
  const renderDropdown = () => {
    setDropdown(prevDropdown => !prevDropdown);
  };
  const deleteContact = async () => {
    const foundContacts = JSON.parse(
      await AsyncStorage.getItem('user-contacts'),
    );
    const newContact = foundContacts.filter(
      item => !selectedContacts.includes(item.email),
    );
    selectedContacts.forEach(async email => {
      await AsyncStorage.removeItem(`message${email}`);
    });
    await AsyncStorage.setItem('user-contacts', JSON.stringify(newContact));
    console.log('newcontact', newContact);
    var prevContact = [];

    if (newContact.length > 0) {
      await newContact.forEach(async element => {
        let lastMessage = '',
          time = '',
          status = '';

        const asyncMsgStorage = JSON.parse(
          await AsyncStorage.getItem(`message${element.email || element.id}`),
        );
        if (asyncMsgStorage !== null) {
          lastMessage = asyncMsgStorage[asyncMsgStorage.length - 1].message;
          time = asyncMsgStorage[asyncMsgStorage.length - 1].time;
          if (
            (asyncMsgStorage[asyncMsgStorage.length - 1].msgStyle = 'right')
          ) {
            status = asyncMsgStorage[asyncMsgStorage.length - 1].status;
          }
        }

        const newContact = {
          id: element.email,
          name: element.name,
          lastMessage: lastMessage,
          unRead: false,
          msgCounts: 0,
          time: time,
          picUrl: element.pic,
          status: status,
        };
        prevContact = [...prevContact, newContact];
        await setContacts(prevContact);
      });
    } else {
      await setContacts([]);
    }
    setSelectedContacts([]);
  };
  const pin = () => {};
  const mute = () => {};
  //elipse
  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
      headerLeft: () => (
        <>
          <Text style={{fontSize: 27, color: 'black', fontWeight: 'bold'}}>
            {selectedContacts.length
              ? `${selectedContacts.length} selected`
              : 'Greetings'}
          </Text>
        </>
      ),
      headerRight: () => (
        <>
          {selectedContacts.length ? (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Pressable
                onPress={() => {
                  mute();
                }}>
                <Image
                  source={require('../../img/mute.png')}
                  style={styles.options}></Image>
              </Pressable>
              <Pressable
                onPress={() => {
                  pin();
                }}>
                <Image
                  source={require('../../img/pin.png')}
                  style={styles.options}></Image>
              </Pressable>
              <Pressable
                onPress={() => {
                  deleteContact();
                }}>
                <Image
                  source={require('../../img/delete.png')}
                  style={styles.options}></Image>
              </Pressable>
            </View>
          ) : (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Pressable
                onPress={() => {
                  navigation.navigate('FindFriends');
                }}>
                <Image
                  source={require('../../img/add-contact.png')}
                  style={styles.options}></Image>
              </Pressable>
              <Pressable
                onPress={() => {
                  navigation.navigate('CameraView');
                }}>
                <Image
                  source={require('../../img/camera.png')}
                  style={styles.options}></Image>
              </Pressable>
              <Pressable
                onPress={() => {
                  navigation.navigate('Settings');
                }}>
                <Image
                  source={require('../../img/settings.png')}
                  style={[styles.options, {marginRight: 0}]}></Image>
              </Pressable>
            </View>
          )}
        </>
      ),
    });
  }, [selectedContacts, navigation]);
  //long press make selection
  function handleLongPress(element) {
    //removing if selected
    if (selectedContacts.includes(element.id)) {
      setSelectedContacts(
        selectedContacts.filter(id => {
          return id !== element.id;
        }),
      );
    }
    // adding to list selected contacts
    else {
      setSelectedContacts([...selectedContacts, element.id]);
    }
  }
  //navigate to message screen
  async function handleNavigationToMessage(element) {
    await setContacts(
      contacts.map(item => {
        if (item.id === element.id) {
          return {...item, unRead: false, msgCounts: 0};
        } else {
          return item;
        }
      }),
    );
    navigation.navigate('Messages', {element});
  }
  //function to get user contacts
  useEffect(() => {
    //get contacts of user
    async function getContacts() {
      var prevContact = [];
      const foundContacts = JSON.parse(
        await AsyncStorage.getItem('user-contacts'),
      );
      if (foundContacts)
        await foundContacts.forEach(async element => {
          let lastMessage = '',
            time = '',
            status = '';

          const asyncMsgStorage = JSON.parse(
            await AsyncStorage.getItem(`message${element.email || element.id}`),
          );
          if (asyncMsgStorage !== null) {
            lastMessage = await asyncMsgStorage[asyncMsgStorage.length - 1].message;
            time = await asyncMsgStorage[asyncMsgStorage.length - 1].time;
            if (
              (asyncMsgStorage[asyncMsgStorage.length - 1].msgStyle === 'right')
            ) {
              status = asyncMsgStorage[asyncMsgStorage.length - 1].status;
            }
          }

          const newContact = {
            id: element.email,
            name: element.name,
            lastMessage: lastMessage,
            unRead: false,
            msgCounts: 0,
            time: time,
            picUrl: element.pic,
            status: status,
          };
          // prevContact = [...prevContact, newContact];
          const contactExists = await contacts.find(item =>item.id === newContact.id);
          if(!contactExists){
            await setContacts(prevContact => [...prevContact,newContact])
          }else if(contacts.length>0){
            await contacts.map(async (con)=>{
              if(con.id === newContact.id){
                con.lastMessage = lastMessage;
                con.time= time;
              }
            
            })
          }
          
        });
    }
    getContacts();
  }, [isFocused,navigation]);

  return (
    <>
      <SafeAreaView style={{flex: 1}}>
        {dropdown && (
          <View style={styles.dropdown}>
            <Pressable
              onPress={() => {
                navigation.navigate('Settings');
                setDropdown(prevDropdown => !prevDropdown);
              }}>
              <Text style={styles.dropdownItem}>Settings</Text>
            </Pressable>
          </View>
        )}
        <ScrollView
          onPress={() => {
            setDropdown(prevDropdown => !prevDropdown);
          }}>
          {contacts.length > 0 ? (
            contacts.map(element => {
              return (
                <Pressable
                  key={element.id}
                  onLongPress={() => {
                    handleLongPress(element);
                  }}
                  onPress={() => {
                    selectedContacts.length > 0
                      ? handleLongPress(element)
                      : handleNavigationToMessage(element);
                  }}>
                  <View style={styles.mainContact}>
                    <View style={styles.contact}>
                      <Image
                        source={
                          selectedContacts.includes(element.id)
                            ? selectedPNG
                            : {uri: element.picUrl}
                        }
                        style={styles.img}></Image>
                      <View style={styles.contactDetail}>
                        <Text style={styles.contactName}>{element.name}</Text>
                        <Text
                          style={[
                            styles.contactMsg,
                            element.unRead === true && element.msgCounts > 0
                              ? {
                                  fontWeight: 900,
                                }
                              : {},
                          ]}>
                          {element.status ? (
                            <Image
                              source={element.status}
                              style={styles.statusImg}
                            />
                          ) : (
                            ''
                          )}

                          {element.lastMessage.length > 20 && element
                            ? `${element.lastMessage.slice(0, 20)}...`
                            : element.lastMessage}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: 'column',
                        justifyContent: 'space-evenly',
                        alignItems: 'center',
                        marginRight: 20,
                      }}>
                      <Text style={{fontSize: 13, color: 'black'}}>
                        {element.time}
                      </Text>
                      {element.msgCounts > 0 && element.unRead === true ? (
                        <Text style={styles.newMsgNotify}>
                          {element.msgCounts}
                        </Text>
                      ) : (
                        ''
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })
          ) : (
            <View
              style={{
                color: 'black',
                justifyContent: 'center',
                alignItems: 'center',
                height: Dimensions.get('window').height - 80,
              }}>
              <Text
                style={{
                  color: 'black',
                  fontSize: 20,
                }}>
                Go to{' '}
                <Image
                  source={require('../../img/add-contact.png')}
                  style={styles.options}></Image>{' '}
                to find friends
              </Text>
              <Text
                style={{
                  color: 'black',
                  fontSize: 20,
                  textAlign: 'center',
                }}>
                To change profile photo {'\n'} Go to{' '}
                <Image
                  source={require('../../img/settings.png')}
                  style={styles.options}
                />
                &rarr; <Text style={{fontWeight: 'bold'}}>Account</Text>
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  img: {
    width: 50,
    height: 50,
    borderRadius: 30,
    margin: 5,
    borderColor: 'black',
    borderWidth: 1,
  },
  mainContact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 5,
    // marginBottom:
    // backgroundColor: 'white',
  },
  contact: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactDetail: {
    marginLeft: 10,
  },
  contactName: {
    color: 'black',
    // fontWeight: '900',
    fontSize: 18,
  },
  contactMsg: {
    color: 'black',
    fontSize: 13,
  },
  newMsgNotify: {
    fontSize: 17,
    color: 'black',
    backgroundColor: 'green',
    borderRadius: 15,
    height: 30,
    width: 30,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  options: {
    height: 25,
    width: 25,
    marginHorizontal: 10,
    borderRadius: 25,
  },
  statusImg: {
    height: 15,
    width: 15,
    // marginHorizontal:
  },
  dropdown: {
    backgroundColor: 'white',
    width: 200,
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
});

export default ChatScreen;
