import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../components/msgScreens/ChatScreen';
import Messagescreen from '../components/msgScreens/MessageScreen';
import FindFriendScreen from '../components/friendScreens/FindFriendScreen';
import SettingsScreen from '../components/settingsScreeens/SettingsScreen';
import AccountSettingScreen from '../components/settingsScreeens/AccountSettingScreen';
import ThemeSettingScreen from '../components/settingsScreeens/ThemeSettingScreen';
import UserAccounts from '../components/friendScreens/UserAcounts';
import VoiceCall from '../components/callScreens/VoiceCall';
import VideoCall from '../components/callScreens/VideoCall';
import CameraView from '../components/CameraView';

const Home = createNativeStackNavigator();

function HomeNavigator() {
  return (
    <>
      <Home.Navigator>
        <Home.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{title: 'Chats', orientation: 'portrait'}}
        />

        <Home.Screen
          name="Messages"
          component={Messagescreen}
          options={{orientation: 'portrait'}}
        />
        <Home.Screen
          name="FindFriends"
          component={FindFriendScreen}
          options={{orientation: 'portrait'}}
        />
        <Home.Screen
          name="Settings"
          component={SettingsScreen}
          soptions={{orientation: 'portrait'}}
        />
        <Home.Screen
          name="AccountSettingScreen"
          component={AccountSettingScreen}
          options={{title: 'Account Settings', orientation: 'portrait'}}
        />
        <Home.Screen
          name="ThemeSettingScreen"
          component={ThemeSettingScreen}
          options={{title: 'Select Theme', orientation: 'portrait'}}
        />
        <Home.Screen
          name="UserAccounts"
          component={UserAccounts}
          options={{orientation: 'portrait'}}
        />
        <Home.Screen
          name="VoiceCall"
          component={VoiceCall}
          options={{orientation: 'portrait', headerShown:false}}
        />
        <Home.Screen
          
          name="VideoCall"
          component={VideoCall}
          options={{orientation: 'portrait' , headerShown:false}}
        />
        <Home.Screen
          name="CameraView"
          component={CameraView}
          options={{orientation: 'portrait' , headerShown:false}}
        />
      </Home.Navigator>
    </>
  );
}

export default HomeNavigator;
