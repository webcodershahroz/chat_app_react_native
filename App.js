import React, {useContext, useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import HomeNavigator from './src/navigators/HomeNavigator';
import LoginNavigator from './src/navigators/LoginNavigator';
import LoginContextProvider, {
  useLogin,
  useMyContext,
} from './src/context/context';
import {ActivityIndicator, Image, StyleSheet, Text, View} from 'react-native';
import notifee, {AndroidImportance} from '@notifee/react-native';
import pusherJs from 'pusher-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';

function App({}) {
  return (
    <>
      <LoginContextProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </LoginContextProvider>
    </>
  );
}

const AppContent = () => {
  const {
    isLogin,
    isLoading,
    pusherRef,
    channelRef,
    getCurrentUser,
    handleReciveMessage,
    notifyMessageRecived,
    pendingMessages,
    displayMessageNotification,
    pendingMessagesRecived,
  } = useMyContext();

  const pushNotification = async () => {
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  };

  // const [activeUsers, setActiveUsers] = useState([])
  const connectToPusher = () => {
    const pusherInstance =
      pusherRef.current ||
      new pusherJs('b80a07f65d34ffabe87d', {cluster: 'ap2'});
    pusherRef.current = pusherInstance;
  };
  const subscribeToChannel = async () => {
    const currentUserEmail = await getCurrentUser();
    if (currentUserEmail !== null) {
      console.log('channelBinded');
      const channelName = `channel-${currentUserEmail}`;
      if (channelRef.current) {
        channelRef.current.unbind('receiveMessage');
        channelRef.current.unbind('messageRecived');
        channelRef.current.unbind('recivePendingMessages');
      }
      channelRef.current = await pusherRef.current.subscribe(channelName);
      channelRef.current.bind('receiveMessage', async data => {
        // console.log(data)
        await handleReciveMessage(data, data.sender);
        try {
          await fetch('https://greetings-backend.vercel.app/messageRecived', {
            method: 'POST',
            body: JSON.stringify({
              message: data.message,
              sender: data.sender,
              reciver: data.reciver,
            }),
            headers: {'Content-Type': 'application/json'},
          });
        } catch (error) {
          console.log('parseerror', error.message);
        }
        await displayMessageNotification(data.message[0], data.sender);
      });
      channelRef.current.bind('messageRecived', async data => {
        console.log('messageRecived', data);
        await notifyMessageRecived(data);
      });

      channelRef.current.bind('recivePendingMessages', async data => {
        console.log('pendingMessageRecived', data);
        await pendingMessagesRecived(data);
      });
    }
  };
  const addActiveUsers = async () => {
    const currentUserEmail = await getCurrentUser();
    if (currentUserEmail !== null) {
      const channelName = `channel-${currentUserEmail}`;
      await fetch('https://greetings-backend.vercel.app/userActive', {
        method: 'POST',
        body: JSON.stringify({
          userId: currentUserEmail,
          channelId: channelName,
        }),
        headers: {'Content-Type': 'application/json'},
      })
        .then(res => res.json())
        .then(async data => {
          console.log('activeUsers', data);
        });
    }
  };

  if (isLogin.login) {
    pushNotification();
    connectToPusher();
    subscribeToChannel();
    addActiveUsers();
  }
  useEffect(() => {
    // pendingMessages();
  }, []);

  if (isLoading) {
    //You can render a loading indicator or a splash screen here
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
        }}>
        <Text style={styles.appName}>Greetings</Text>
      </View>
    );
  }

  //Render the appropriate navigator based on the login state
  return isLogin.login ? <HomeNavigator /> : <LoginNavigator />;
};
const styles = StyleSheet.create({
  appName: {
    fontSize: 70,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    color: 'black',
  },
});
export default App;
