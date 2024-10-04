import React, {  } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../components//authScreens/Login';
import SignupStep1 from '../components/authScreens/signup/SignupStep1';
import SignupStep2 from '../components/authScreens/signup/SignupStep2';
import SignupStep3 from '../components/authScreens/signup/SignupStep3';
import FinishSignup from '../components/authScreens/signup/FinishSignup';

const LoginNav = createNativeStackNavigator();

function LoginNavigator({}) {
  return (
    <>
        <LoginNav.Navigator>
          <LoginNav.Screen
            name="Login"
            component={Login}
            options={{orientation:'portrait',headerShown:false}}
            
          />
          <LoginNav.Screen
            name="SignUpStep1"
            component={SignupStep1}
            options={{orientation:'portrait',headerShown:false}}
          />
          <LoginNav.Screen
            name="SignUpStep2"
            component={SignupStep2}
            options={{orientation:'portrait',headerShown:false}}
          />
          <LoginNav.Screen
            name="SignUpStep3"
            component={SignupStep3}
            options={{orientation:'portrait',headerShown:false}}
          />
          <LoginNav.Screen
            name="FinishSignup"
            component={FinishSignup}
            options={{orientation:'portrait',headerShown:false}}
          />
        </LoginNav.Navigator>
    </>
  );
}

export default LoginNavigator;
