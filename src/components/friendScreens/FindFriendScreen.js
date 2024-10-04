import React, {useLayoutEffect, useState} from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
// import myPic from '../../img/mypic.png';
// import Logo from '../../img/logo.jpg';

function FindFriendScreen({navigation, route}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [foundResults, setFoundResults] = useState([]);
  async function findFriends(text) {
    setLoading(true)
    try {
      await fetch('https://greetings-backend.vercel.app/auth/findFriends', {
        method: 'POST',
        body: JSON.stringify({username: text}),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(res => res.json())
        .then(async data => {
          if (data.success === 0) {
            setFoundResults([])
            setError(data.message)
          } else {
            setError('');
            setFoundResults(data);
          }
        });
    } catch (error) {
      Alert.alert(
        'Internet Error',
        'Check your internet connection and than try again',
        [{text: 'Try Again', onPress: () => {}, style: 'cancel'}],
      );
    }
    setLoading(false)
  }
  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
      headerRight: () => (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Pressable style={styles.search}>
            <TextInput
              style={styles.searchText}
              placeholder="Search..."
              placeholderTextColor={'grey'}
              onChangeText={text => findFriends(text)}></TextInput>
          </Pressable>
          <Pressable
            onPress={() => {
              if (Keyboard.isVisible) Keyboard.dismiss();
            }}>
            <Image
              source={require('../../img/search-lg.png')}
              style={styles.searchIcon}></Image>
          </Pressable>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <>
      <SafeAreaView>
        <Text style={{textAlign:'center',color:'black'}}>{error}</Text>
        <ScrollView>
          {foundResults &&
            foundResults.map(element => {
              return (
                <Pressable
                  key={element.email}
                  onPress={() => {
                    navigation.navigate('UserAccounts', {element});
                  }}>
                  <View style={styles.mainContact}>
                    <View style={styles.contact}>
                      <Image
                        source={{uri:element.pic}}
                        style={styles.img}></Image>
                      <View style={styles.contactDetail}>
                        <Text style={styles.contactName}>
                          {element.username}
                        </Text>
                        <Text style={styles.contactMsg}>{element.name}</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })}
        </ScrollView>
        {loading ? <ActivityIndicator size={'large'} /> : ''}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  search: {
    width: Dimensions.get('window').width - 105,
    backgroundColor: 'white',
    elevation: 50,
    height: 30,
    shadowColor: 'black',
    borderRadius: 5,
    marginRight: 10,
  },
  searchText: {
    color: 'black',
    fontSize: 15,
    paddingVertical:0,
    paddingHorizontal: 9,
  },
  text: {
    textAlign: 'center',
    margin: 10,
  },
  img: {
    width: 60,
    height: 60,
    borderRadius: 30,
    margin: 5,
    borderWidth: 0.66,
    borderColor: 'orange',
  },
  mainContact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
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
    fontWeight: '900',
    fontSize: 20,
  },
  contactMsg: {
    color: 'black',
    fontSize: 15,
  },
  searchIcon: {
    height: 20,
    width: 20,
    marginHorizontal: 5,
  },
});

export default FindFriendScreen;
