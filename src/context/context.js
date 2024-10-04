import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import notifee, {AndroidImportance, AndroidVisibility} from '@notifee/react-native';
import seenImg from '../img/messageNotifier/seen.png';
import sentImg from '../img/messageNotifier/sent.png';
import deliveredImg from '../img/messageNotifier/delivered.png';
import pendingSent from '../img/messageNotifier/notSent.png';
import messaging from '@react-native-firebase/messaging';
import {Alert} from 'react-native';
import Pusher from 'pusher-js';
import pusherJs from 'pusher-js';
import PushNotification from 'react-native-push-notification';

// import { useNavigation } from '@react-navigation/native';
// import deliveredImg from '../../img/messageNotifier/delivered.png';
// import seenImg from '../../img/messageNotifier/seen.png';
const MyContexts = createContext();

const LoginContextProvider = ({children}) => {
  // const navigation = useNavigation()
  const [isLogin, setIsLogin] = useState({login: false});
  const [isLoading, setIsLoading] = useState(true);
  const [messagesFromDB, setMessagesFromDB] = useState([]);
  const [message, setMessage] = useState('');
  const [contacts, setContacts] = useState([]);
  // const [activeContacts,setActiveContacts] =useState([])
  const pusherRef = useRef(null);
  const channelRef = useRef(null);
  const addUserToContacts = async (data, sender) => {
    await fetch('https://greetings-backend.vercel.app/getContactDetails', {
      method: 'POST',
      body: JSON.stringify({email: sender}),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async res => await res.json())
      .then(async result => {
        // console.log(result.userData);
        if (result.success === 1) {
          const foundContacts = JSON.parse(
            await AsyncStorage.getItem('user-contacts'),
          );
          if (foundContacts) {
            const isUserExists = await foundContacts.find(
              item => item.email === result.userData.email,
            );
            if (!isUserExists) {
              const newData = [...foundContacts, result.userData];
              await AsyncStorage.setItem(
                'user-contacts',
                JSON.stringify(newData),
              );
              const newContact = {
                id: result.userData.email,
                name: result.userData.name,
                lastMessage: data.message[0].message,
                time: data.message[0].time,
                picUrl: result.userData.pic,
              };
              console.log(newContact);
              const newContactState = [...contacts, newContact];
              setContacts(newContactState);
            }
          } else if (foundContacts === null) {
            const newData = [result.userData];
            await AsyncStorage.setItem(
              'user-contacts',
              JSON.stringify(newData),
            );
            const newContact = {
              id: result.userData.email,
              name: result.userData.name,
              lastMessage: data.message[0].message,
              time: data.message[0].time,
              picUrl: result.userData.pic,
            };
            console.log(newContact);
            const newContactState = [newContact];
            setContacts(newContactState);
          }
        }
      });
  };

  useEffect(() => {
    async function getLoginState() {
      try {
        const check = JSON.parse(await AsyncStorage.getItem('isLoggedIn'));
        if (check !== null && check.login === true) {
          setIsLogin(check);
        } else {
          setIsLogin({login: false});
        }
      } catch (error) {
        console.error('Error fetching login state:', error);
      } finally {
        // Set isLoading to false once the login state is fetched
        setIsLoading(false);
      }
    }

    getLoginState();
  }, []);
  const generateId = () => {
    const char = ['a', 'b', 'c', 'e', 'f', 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    let id = '';
    let i = 0;
    while (i < 6) {
      const ranNum = char[Math.floor(Math.random() * char.length)];
      id = id + ranNum;
      i++;
    }
    return id;
  };
  const getCurrentUser = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('currentUser');
      return jsonValue != null ? JSON.parse(jsonValue).email : null;
    } catch (error) {
      console.error('Failed to retrieve the email from storage:', error);
    }
  };



  const handleSendMessage = async (element, call, navigation, callDuration) => {
    //setting date and time for new message send
    if (message.length > 0 || call === 'voice-call' || call === 'video-call') {
      const date = new Date();
      const month = date.getMonth();
      const day = date.getDate();
      const year = date.getFullYear();
      const newDate = `${day}/${month}/${year}`;
      const time = `${date.getHours()}:${
        date.getMinutes() < 10
          ? `0${date.getMinutes()}`
          : `${date.getMinutes()}`
      }`;
      //sending messages
      var msgDetail;
      if (call === 'voice-call') {
        msgDetail = {
          id: generateId(),
          date: newDate,
          time: time,
          msgStyle: 'right',
          duration: `00:${
            callDuration < 10 ? `0${callDuration}` : `${callDuration}`
          }`,
          message: 'Voice Call',
        };
      }
      if (call === 'video-call') {
        msgDetail = {
          id: generateId(),
          date: newDate,
          time: time,
          msgStyle: 'right',
          duration: `00:${
            callDuration < 10 ? `0${callDuration}` : `${callDuration}`
          }`,
          message: 'Video Call',
        };
      } else if (message.length > 0) {
        msgDetail = {
          id: generateId(),
          date: newDate,
          time: time,
          msgStyle: 'right',
          message: message,
          status: pendingSent,
        };
      }
      var newAsyncMsgStorage = [];
      const asyncMsgStorage = await JSON.parse(
        await AsyncStorage.getItem(`message${element.id || element.email}`),
      );

      if (asyncMsgStorage !== null) {
        newAsyncMsgStorage = [...asyncMsgStorage, msgDetail];
      } else if (asyncMsgStorage === null) {
        newAsyncMsgStorage = [msgDetail];
      }
      await AsyncStorage.setItem(
        `message${element.id || element.email}`,
        JSON.stringify(newAsyncMsgStorage),
      );
      setMessagesFromDB(newAsyncMsgStorage);
      if (call === 'voice-call' || call === 'video-call') {
        navigation.goBack(null);
      }
      setMessage('');
      const sender = await getCurrentUser();
      const reciver = element.id ? element.id.trim() : element.email.trim();
      const messagesArray = [msgDetail];
      try {
        await fetch('https://greetings-backend.vercel.app/sendMessage', {
          method: 'POST',
          body: JSON.stringify({
            message:messagesArray,
            sender,
            reciver
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then(res => res.json())
          .then(async data => {
            console.log(data)
            const asyncMsgStorage = JSON.parse(
              await AsyncStorage.getItem(
                `message${element.id || element.email}`,
              ),
            );
            await asyncMsgStorage.map(item => {
              if (item.id === msgDetail.id) {
                item.status = sentImg;
              }
            });
            await AsyncStorage.setItem(
              `message${element.id || element.email}`,
              JSON.stringify(asyncMsgStorage),
            );
            setMessagesFromDB(asyncMsgStorage);
          });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const setUnreadMessages = async data => {
    if (contacts.length > 0) {
      const UnreadMessages = {
        sender,
      };
      contacts.map(async item => {
        if (item.id === data.sender) {
          item.unRead = true;
          item.msgCounts = item.msgCounts + 1;
          item.lastMessage = data.message.message;
          await AsyncStorage.setItem(
            `unread-messages${data.sender}`,
            JSON.stringify({
              sender: data.sender,
              unRead: item.unRead,
              msgCounts: item.msgCounts,
            }),
          );
        }
      });
      setContacts(contacts);
    }
  };

  const handleReciveMessage = async (data, sender) => {
    console.log('message recived', data);
    try {
      await addUserToContacts(data, sender);
      // await displayMessageNotification(data.message[0], sender);
      let newAsyncMsgStorage = [];
      const key = `message${sender}`;
      const asyncMsgStorage = await JSON.parse(await AsyncStorage.getItem(key)); 
      await data.message.forEach(async item => {
        let msgDetail;
        if (item.duration) {
          msgDetail = {
            id: item.id,
            date: item.date,
            time: item.time,
            msgStyle: 'left',
            duration: item.duration,
            message: item.message,
          };
        } else {
          msgDetail = {
            id: item.id,
            date: item.date,
            time: item.time,
            msgStyle: 'left',
            message: item.message,
          };
        }
        
          if (asyncMsgStorage !== null) {
            const isExists = await asyncMsgStorage.find(
              asyncMsgItem => asyncMsgItem.id === msgDetail.id,
            );
            if (!isExists) {
              newAsyncMsgStorage = [...asyncMsgStorage, msgDetail];
            }
          } else if (asyncMsgStorage === null) {
            newAsyncMsgStorage = [msgDetail];
          }
        });
        if (contacts.length > 0) {
          contacts.map(async con => {
            if (con.id === sender) {
              con.unRead = true;
              con.msgCounts = con.msgCounts + 1;
              con.lastMessage = data.message[0].message;
              con.status = ""
              setContacts(contacts);
            }
          });
        }
      console.log("newAsyncMsgStorage",newAsyncMsgStorage);
      // var newAsyncMsgStorage = [];

      await AsyncStorage.setItem(key, JSON.stringify(newAsyncMsgStorage));
      setMessagesFromDB(newAsyncMsgStorage);
    } catch (error) {
      console.log(error.message);
    }
  };

  async function displayMessageNotification(data, sender) {
    
    PushNotification.createChannel(
      {
        channelId: "greetings-channel", // (required)
        channelName: "Message Notification", // (required)
        channelDescription: "Show message notifications", // (optional) default: undefined.
        playSound: true, // (optional) default: true
        soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
        importance: 4, // (optional) default: 4. Int value of the Android notification importance
        vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
        
      },
      (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
    );
    PushNotification.localNotification({
      /* Android Only Properties */
      channelId: "greetings-channel", // (required) channelId for Android 8.0 and higher
    
      /* iOS and Android properties */
      title:sender, // (optional)
      message: data.message, // (required)
      playSound: true, // (optional) default: true
      soundName: 'default', // (optional) Sound to play on notification
      // largeIcon: , 
    });
  }
  async function notifyMessageRecived(data) {
    console.log('notifymessagerecived', data);
    try {
      const key = `message${data.reciver}`;
      let asyncMsgStorage = await AsyncStorage.getItem(key);
      asyncMsgStorage = await JSON.parse(asyncMsgStorage);
      await asyncMsgStorage.forEach(async item => {
        // const isExists = await data.message.find(msg => msg.id === item.id)?
        if (item.id === data.message[0].id) {
          item.status = deliveredImg; // Update to delivered image
        }
      });
      // Store the updated array back to AsyncStorage
      await AsyncStorage.setItem(key, JSON.stringify(asyncMsgStorage));
      // // Update the state
      setMessagesFromDB(asyncMsgStorage);
    } catch (error) {
      console.log(error);
    }
  }
  async function pendingMessages() {
    const sender = await getCurrentUser();
    let pendingMessages = [];
    try {
      const foundContacts = await JSON.parse(
        await AsyncStorage.getItem('user-contacts'),
      );
      if (foundContacts != null) {
        foundContacts.forEach(async element => {
          const foundMessagesOfContact = await JSON.parse(
            await AsyncStorage.getItem(`message${element.email}`),
          );
          if (foundMessagesOfContact !== null) {
            foundMessagesOfContact.forEach(async msgElement => {
              if (msgElement.msgStyle === 'right') {
                if (
                  msgElement.status === sentImg ||
                  msgElement.status === pendingSent
                ) {
                  pendingMessages.push({
                    message: msgElement,
                    sender,
                    reciver: element.email,
                  });
                }
              }
            });
            console.log(pendingMessages);
            if (pendingMessages.length > 0) {
              try {
                await fetch(
                  'https://greetings-backend.vercel.app/sendPendingMessages',
                  {
                    method: 'POST',
                    body: JSON.stringify({
                      message: pendingMessages,
                      sender,
                      reciver: element.email,
                    }),
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  },
                )
                  .then(res => res.json())
                  .then(async data => {
                    // console.log(data);
                    const asyncMsgStorage = JSON.parse(
                      await AsyncStorage.getItem(
                        `message${element.id || element.email}`,
                      ),
                    );
                    await asyncMsgStorage.map(item => {
                      pendingMessages.forEach(msgElement => {
                        if (item.id === msgElement.id) {
                          item.status = sentImg;
                        }
                      });
                    });
                    await AsyncStorage.setItem(
                      `message${element.id || element.email}`,
                      JSON.stringify(asyncMsgStorage),
                    );
                    setMessagesFromDB(asyncMsgStorage);
                  });
              } catch (error) {
                console.log(error);
              }
            }
          }
        });
      }
    } catch (error) {}
  }
  async function pendingMessagesRecived(data) {
    try {
      const foundContacts = await JSON.parse(
        await AsyncStorage.getItem('user-contacts'),
      );
      await handleReciveMessage(data.message);
      // if (foundContacts != null) {
      //   foundContacts.forEach(async element => {
      //     const foundMessagesOfContact = await JSON.parse(
      //       await AsyncStorage.getItem(`message${element.email}`),
      //     );
      //   });
      // }
    } catch (error) {}
    //     foundMessagesOfContact.forEach(async msgElement=>{
    //       const msgExists = await foundMessagesOfContact.find(
    //         item => msgElement.id === data.message.id,
    //       );
    //       if (msgExists) {
    //         try {
    //           await fetch(
    //             'https://greetings-backend.vercel.app/messageRecived',
    //             {
    //               method: 'POST',
    //               body: JSON.stringify({
    //                 message: data.message,
    //                 sender: data.sender,
    //                 reciver: data.reciver,
    //               }),
    //               headers: {'Content-Type': 'application/json'},
    //             },
    //           );
    //         } catch (error) {
    //           console.log(error.message);
    //         }
    //       } else {
    //         await handleReciveMessage(data);
    //         try {
    //           await fetch(
    //             'https://greetings-backend.vercel.app/messageRecived',
    //             {
    //               method: 'POST',
    //               body: JSON.stringify({
    //                 message: data.message,
    //                 sender: data.sender,
    //                 reciver: data.reciver,
    //               }),
    //               headers: {'Content-Type': 'application/json'},
    //             },
    //           );
    //         } catch (error) {
    //           console.log(error.message);
    //         }

    //       }
    //     })
  }
  return (
    <MyContexts.Provider
      value={{
        handleSendMessage,
        handleReciveMessage,
        messagesFromDB,
        setMessagesFromDB,
        generateId,
        isLogin,
        setIsLogin,
        isLoading,
        message,
        setMessage,
        displayMessageNotification,
        notifyMessageRecived,
        pusherRef,
        channelRef,
        contacts,
        setContacts,
        getCurrentUser,
        pendingMessages,
        pendingMessagesRecived,
        // activeContacts,
        // setActiveContacts
      }}>
      {children}
    </MyContexts.Provider>
  );
};

export const useMyContext =  () => {return useContext(MyContexts)};
export default LoginContextProvider;
