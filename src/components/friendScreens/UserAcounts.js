import React, {useContext, useLayoutEffect, useState} from 'react';
import {
  Text,
  StyleSheet,
  View,
  Pressable,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import myPic from '../../img/mypic.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jestConfig from '../../../jest.config';
import { useMyContext } from '../../context/context';

function UserAccounts({navigation, route}) {
  const [userContacts, setUserContacts] = useState(null);
  const [element, setelement] = useState(route.params.element);
  const [sendFriendRequest, setSendFriendRequest] = useState('Add Friend');
  const {setContacts} = useMyContext()

  useLayoutEffect(() => {
    navigation.setOptions({
      title: element.username || "User Profile",
    });
  });
  function handleSendFriendRequest() {
    setSendFriendRequest('Requested');
    //Adding more logic soon
  }
  //function to add user contact 
  async function handleFirstMessage(element) {
    // AsyncStorage.clear()
    const foundContacts = JSON.parse(await AsyncStorage.getItem('user-contacts'));
    if(foundContacts){
        const isUserExists = await foundContacts.find( item => item.email === element.email || element.id)
        if(!isUserExists){
          const newData = [...foundContacts,element]
          await AsyncStorage.setItem('user-contacts',JSON.stringify(newData))
        }
        navigation.navigate('Messages',{element})
      }
      else{
        const newData = [element]
        await AsyncStorage.setItem('user-contacts',JSON.stringify(newData))
        navigation.navigate('Messages',{element})
    }
  }
  return (
    <>
      <SafeAreaView>
        <ScrollView>
          <View style={styles.profilePicContainer}>
            <Image source={{uri:element.pic||element.picUrl}} style={styles.img} />
          </View>
          <Text style={styles.nameStyle}>{element.name}</Text>
          {/* <View style={{flexDirection:'row'}}> */}
          <View style={{flexDirection: 'row'}}>
            <Pressable style={styles.btn} onPress={handleSendFriendRequest}>
              <Text style={styles.btnText}>{sendFriendRequest}</Text>
            </Pressable>
            <Pressable
              style={styles.btn}
              onPress={() => handleFirstMessage(element)}>
              <Text style={styles.btnText}>Message</Text>
            </Pressable>
          </View>
          {/* </View> */}
          <View style={{padding: 10}}>
            <Text style={styles.textHeading}>Email</Text>
            <Text style={{...styles.textPara, padding: 10}}>
              {element.email||element.id}
            </Text>
            <View style={{padding: 10}}>
              <Text style={styles.textHeading}>About</Text>
              <Text style={{...styles.textPara, padding: 10}}>
                Assalamoalikum , Welcome to greetings
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  profilePicContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  img: {
    height: 200,
    width: 200,
    borderRadius: 100,
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
  nameStyle: {
    textAlign: 'center',
    fontSize: 25,
    color: 'black',
  },
  btn: {
    backgroundColor: 'black',
    borderRadius: 6,
    height: 30,
    margin: 10,
    width: '45%',
  },
  btnText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    // textAlignVertical: 'center',
  },
});

export default UserAccounts;