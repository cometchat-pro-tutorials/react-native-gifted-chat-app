import React, { useEffect, useState, useRef } from 'react';

import { TouchableOpacity, Image, Alert, StyleSheet, View, Platform, PermissionsAndroid, Text, Modal } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import KeepAwake from 'react-native-keep-awake';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from "uuid";

import Login from './components/Login';
import SignUp from './components/SignUp';
import Home from './components/Home';
import CreateGroup from './components/CreateGroup';
import Chat from './components/Chat';
import ManageGroup from './components/ManageGroup';
import AddGroupMembers from './components/AddGroupMembers';
import RemoveGroupMembers from './components/RemoveGroupMembers';

import Context from './context';

import { cometChatConfig } from './env';

// import icons
import audioCallIcon from './images/audioCall.png';
import videoCallIcon from './images/videoCall.png';
import settingsIcon from './images/settings.png';

const Stack = createNativeStackNavigator();

const App = () => {
  const callListenerId = useRef(uuidv4());

  const [cometChat, setCometChat] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);

  const [callType, setCallType] = useState(null);
  const [callSettings, setCallSettings] = useState(null);
  const [call, setCall] = useState(null);
  const [isSomeoneCalling, setIsSomeoneCalling] = useState(false);

  useEffect(() => {
    initCometChat();
    initAuthenticatedUser();
    getPermissions();
    return () => {
      setCallType(null);
      setCall(null);
      setCallSettings(null);
      setIsSomeoneCalling(false);
      cometChat.removeUserListener(userOnlineListenerId);
    }
  }, []);

  useEffect(() => {
    if (cometChat) {
      listenForCall();
    }
  }, [cometChat]);

  useEffect(() => {
    if (callType && selectedConversation) {
      initialCall();
    }
  }, [callType]);

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

  const rejectCall = (status, call) => {
    if (status && call) {
      cometChat.rejectCall(call.sessionId, status).then(
        call => {
          console.log("Call rejected successfully", call);
          setCallSettings(null);
          setCallType(null);
          setCall(null);
          setIsSomeoneCalling(false);
        },
        error => {
          console.log("Call rejection failed with error:", error);
        }
      );
    }
  };

  const startCall = (call) => {
    const sessionId = call.sessionId;
    const callType = call.type;
    const callListener = new cometChat.OngoingCallListener({
      onUserJoined: user => {
        /* Notification received here if another user joins the call. */
        console.log("User joined call:", user);
        /* this method can be use to display message or perform any actions if someone joining the call */
      },
      onUserLeft: user => {
        /* Notification received here if another user left the call. */
        console.log("User left call:", user);
        /* this method can be use to display message or perform any actions if someone leaving the call */
      },
      onUserListUpdated: userList => {
        console.log("user list:", userList);
      },
      onCallEnded: call => {
        /* Notification received here if current ongoing call is ended. */
        console.log("Call ended:", call);
        /* hiding/closing the call screen can be done here. */
        const status = cometChat.CALL_STATUS.CANCELLED;
        rejectCall(status, call.sessionId);
        setCallSettings(null);
        setCallType(null);
        setCall(null);
        setIsSomeoneCalling(false);
      },
      onError: error => {
        console.log("Error :", error);
        /* hiding/closing the call screen can be done here. */
        setCallSettings(null);
        setCallType(null);
        setCall(null);
        setIsSomeoneCalling(false);
      },
      onAudioModesUpdated: (audioModes) => {
        console.log("audio modes:", audioModes);
      },
    });
    const callSettings = new cometChat.CallSettingsBuilder()
      .setSessionID(sessionId)
      .enableDefaultLayout(true)
      .setIsAudioOnlyCall(callType == cometChat.CALL_TYPE.AUDIO ? true : false)
      .setCallEventListener(callListener)
      .build();
    setCallSettings(() => callSettings);
  };

  const acceptCall = (call) => {
    if (call) {
      cometChat.acceptCall(call.sessionId).then(
        call => {
          console.log("Call accepted successfully:", call);
          // start the call using the startCall() method
          startCall(call);
          setIsSomeoneCalling(false);
        },
        error => {
          console.log("Call acceptance failed with error", error);
          // handle exception
        }
      );
    }
  };

  const confirmCall = (call) => {
    if (call) {
      setIsSomeoneCalling(true);
    }
  };

  const listenForCall = () => {
    cometChat.addCallListener(
      callListenerId,
      new cometChat.CallListener({
        onIncomingCallReceived(call) {
          console.log("Incoming call:", call);
          const callInitiatorUid = call.callInitiator.uid;
          if (callInitiatorUid && callInitiatorUid !== user.uid) {
            setCall(call);
            confirmCall(call);
          }
        },
        onOutgoingCallAccepted(call) {
          console.log("Outgoing call accepted:", call);
          startCall(call);
        },
        onOutgoingCallRejected(call) {
          console.log("Outgoing call rejected:", call);
          setCallSettings(null);
          setCallType(null);
          setCall(null);
          setIsSomeoneCalling(null);
        },
        onIncomingCallCancelled(call) {
          console.log("Incoming call calcelled:", call);
          setCallSettings(null);
          setCallType(null);
          setCall(null);
          setIsSomeoneCalling(null);
        }
      })
    );
  };

  const isGroup = () => {
    return selectedConversation && selectedConversation.guid;
  };

  const initialCall = () => {
    const receiverID = isGroup() ? selectedConversation.guid : selectedConversation.uid;
    const receiverType = isGroup() ? cometChat.RECEIVER_TYPE.GROUP : cometChat.RECEIVER_TYPE.USER;

    const call = new cometChat.Call(receiverID, callType, receiverType);

    cometChat.initiateCall(call).then(
      outGoingCall => {
        console.log("Call initiated successfully:", outGoingCall);
        setCall(outGoingCall);
        // perform action on success. Like show your calling screen.
      },
      error => {
        console.log("Call initialization failed with exception:", error);
      }
    );
  };

  const cancelCall = () => {
    const status = cometChat.CALL_STATUS.CANCELLED;
    rejectCall(status, call);
  };

  const handleRejectCall = () => {
    const status = cometChat.CALL_STATUS.REJECTED;
    rejectCall(status, call);
  };

  const handleAcceptCall = () => {
    acceptCall(call);
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

  if (callType && selectedConversation && !callSettings) {
    return (
      <Modal animated animationType="fade">
        <View style={styles.waitingForCallContainer}>
          <Text style={styles.waitingForCallContainerTitle}>Calling {selectedConversation.name}...</Text>
          <View style={styles.waitingForCallImageContainer}>
            <Image style={{ width: 128, height: 128 }} source={{ uri: selectedConversation.avatar }}></Image>
          </View>
          <TouchableOpacity style={styles.cancelCallBtn} onPress={cancelCall}>
            <Text style={styles.cancelCallLabel}>Cancel Call</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  if (callSettings) {
    return (
      <Modal animated animationType="fade">
        <View style={styles.callingScreenContainer}>
          <KeepAwake />
          <cometChat.CallingComponent
            callsettings={callSettings}
          />
        </View>
      </Modal>
    );
  }

  if (user && !callSettings) {
    return (
      <Context.Provider value={{ cometChat, user, setUser, selectedConversation, setSelectedConversation }}>
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
        {isSomeoneCalling && call && <Modal animated animationType="fade">
        <View style={styles.waitingForCallContainer}>
          <Text style={styles.waitingForCallContainerTitle}>You are having a call from {call.sender.name}</Text>
          <View style={styles.waitingForCallImageContainer}>
            <Image style={{ width: 128, height: 128 }} source={{ uri: call.sender.avatar }}></Image>
          </View>
          <TouchableOpacity style={styles.acceptCallBtn} onPress={handleAcceptCall}>
            <Text style={styles.acceptCallLabel}>Accept Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelCallBtn} onPress={handleRejectCall}>
            <Text style={styles.cancelCallLabel}>Reject Call</Text>
          </TouchableOpacity>
        </View>
      </Modal>}
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
  },
  callingScreenContainer: {
    height: '100%',
    position: 'relative',
    width: '100%',
  },
  waitingForCallContainer: {
    flexDirection: 'column',
    height: '100%',
    position: 'relative',
    width: '100%',
    flex: 1,
    paddingTop: 128
  },
  waitingForCallContainerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingVertical: 12,
    textAlign: 'center',
  },
  waitingForCallImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelCallBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    fontSize: 16,
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 16,
  },
  cancelCallLabel: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  acceptCallBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    fontSize: 16,
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 16,
  },
  acceptCallLabel: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});

export default App;
