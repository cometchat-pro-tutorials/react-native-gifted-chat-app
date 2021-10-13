/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState } from 'react';

import { TouchableOpacity, Image, Alert, StyleSheet, View, Platform, PermissionsAndroid, Text } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './components/Login';
import SignUp from './components/SignUp';
import Home from './components/Home';
import CreateGroup from './components/CreateGroup';
import Chat from './components/Chat';
import ManageGroup from './components/ManageGroup';
import AddGroupMembers from './components/AddGroupMembers';
import RemoveGroupMembers from './components/RemoveGroupMembers';

import Context from './context';
// import environment variables.
import { cometChatConfig } from './env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// import icons
import audioCallIcon from './images/audioCall.png';
import videoCallIcon from './images/videoCall.png';
import settingsIcon from './images/settings.png';

const Stack = createNativeStackNavigator();

const App = () => {
  const [cometChat, setCometChat] = useState(null);
  const [user, setUser] = useState(null);
  const [callType, setCallType] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    initCometChat();
    initAuthenticatedUser();
    getPermissions();
  }, []);

  const initCometChat = async () => {
    const { CometChat } = await import('@cometchat-pro/react-native-chat');
    const appID = `${cometChatConfig.cometChatAppId}`;
    const region = `${cometChatConfig.cometChatRegion}`;
    const appSetting = new CometChat.AppSettingsBuilder().subscribePresenceForAllUsers().setRegion(region).build();
    CometChat.init(appID, appSetting).then(
      () => {
        console.log('CometChat was initialized successfully');
        setCometChat(() => CometChat);
      },
      error => {
      }
    );
  };

  const initAuthenticatedUser = async () => {
    const authenticatedUser = await AsyncStorage.getItem('auth');
    setUser(() => authenticatedUser ? JSON.parse(authenticatedUser) : null);
  };

  const getPermissions = async () => {
    if (Platform.OS === 'android') {
      let granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
      }
    }
  };

  const createGroup = (navigation) => () => {
    navigation.navigate('Create Group');
  };

  const manageGroup = (navigation) => () => {
    navigation.navigate('Manage Group')
  };

  const handleLogout = (navigation) => {
    cometChat.logout().then(
      () => {
        console.log("Logout completed successfully");
        AsyncStorage.removeItem('auth');
        setUser(null);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }]
        });
      }, error => {
        console.log("Logout failed with exception:", { error });
      }
    );
  };

  const logout = (navigation) => () => {
    Alert.alert(
      "Confirm",
      "Do you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { text: "OK", onPress: () => handleLogout(navigation) }
      ]
    );
  };

  const startAudioCall = () => {
    if (cometChat && selectedConversation) {
      setCallType(cometChat.CALL_TYPE.AUDIO);
    }
  };

  const startVideoCall = () => {
    if (cometChat && selectedConversation) {
      setCallType(cometChat.CALL_TYPE.VIDEO);
    }
  };

  const renderChatHeaderTitle = () => {
    if (selectedConversation && selectedConversation.name) {
      return (
        <View style={styles.chatHeaderTitleContainer}>
          <Text style={styles.chatHeaderTitle}>{selectedConversation.name}</Text>
          {selectedConversation.status && <Text style={[styles.chatHeaderTitle, styles.chatHeaderStatus]}> - {selectedConversation.status}</Text>}
        </View>
      );
    }
    return <Text style={styles.chatHeaderTitle}>Chat</Text>;
  };

  const renderChatHeaderRight = (navigation) => {
    if (selectedConversation && selectedConversation.contactType === 1 && selectedConversation.owner === user.uid) {
      return (
        <View style={styles.chatHeaderActions}>
          <TouchableOpacity onPress={startAudioCall}>
            <Image
              style={{ width: 24, height: 24, marginRight: 8 }}
              source={audioCallIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={startVideoCall}>
            <Image
              style={{ width: 32, height: 24, marginRight: 8 }}
              source={videoCallIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={manageGroup(navigation)}>
            <Image
              style={{ width: 24, height: 24 }}
              source={settingsIcon}
            />
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.chatHeaderActions}>
        <TouchableOpacity onPress={startAudioCall}>
          <Image
            style={{ width: 24, height: 24, marginRight: 8 }}
            source={audioCallIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={startVideoCall}>
          <Image
            style={{ width: 32, height: 24 }}
            source={videoCallIcon}
          />
        </TouchableOpacity>
      </View>
    );
  }

  if (user) {
    return (
      <Context.Provider value={{ cometChat, user, setUser, selectedConversation, setSelectedConversation, callType, setCallType }}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={Home} options={({ navigation }) => ({
              headerLeft: () => (
                <TouchableOpacity onPress={logout(navigation)}>
                  <Image
                    style={{ width: 24, height: 24, marginRight: 8 }}
                    source={{
                      uri: 'https://findicons.com/files/icons/2711/free_icons_for_windows8_metro/512/exit.png'
                    }}
                  />
                </TouchableOpacity>
              ),
              headerRight: () => (
                <TouchableOpacity onPress={createGroup(navigation)}>
                  <Image
                    style={{ width: 24, height: 24 }}
                    source={{
                      uri: 'https://cdn2.iconfinder.com/data/icons/ios-7-icons/50/plus-512.png'
                    }}
                  />
                </TouchableOpacity>
              ),
            })} />
            <Stack.Screen name="Create Group" component={CreateGroup} />
            <Stack.Screen name="Chat" component={Chat} options={({ navigation }) => ({
              headerTitle: () => renderChatHeaderTitle(),
              headerRight: () => renderChatHeaderRight(navigation),
            })} />
            <Stack.Screen name="Manage Group" component={ManageGroup} />
            <Stack.Screen name="Add Members" component={AddGroupMembers} />
            <Stack.Screen name="Remove Members" component={RemoveGroupMembers} />
          </Stack.Navigator>
        </NavigationContainer>
      </Context.Provider>
    );
  }

  return (
    <Context.Provider value={{ cometChat, user, setUser }}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={Login}
          />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
      </NavigationContainer>
    </Context.Provider>
  );
};

const styles = StyleSheet.create({
  chatHeaderActions: {
    flexDirection: 'row'
  },
  chatHeaderTitleContainer: {
    flexDirection: 'row'
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  chatHeaderStatus: {
    textTransform: 'capitalize'
  }
});

export default App;
