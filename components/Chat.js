import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform, Modal } from 'react-native';

import { GiftedChat } from 'react-native-gifted-chat';
import DocumentPicker from 'react-native-document-picker';
import KeepAwake from 'react-native-keep-awake';
import Video from 'react-native-video';
// At the top where our imports are...
import VideoPlayer from 'react-native-video-controls';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from "uuid";

import Context from '../context';

const Chat = () => {
  const callListenerId = useRef(uuidv4());

  const { cometChat, selectedConversation, user, callType, setCallType } = useContext(Context);

  const [messages, setMessages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [callSettings, setCallSettings] = useState(null);

  useEffect(() => {
    console.log(callType);
    if (callType && selectedConversation) {
      initialCall();
    }
  }, [callType]);

  useEffect(() => {
    if (selectedConversation) {
      // get list of messages.
      loadMessages();
      // listen for messages.
      listenForMessages();
    }
    return () => {
      if (selectedConversation) {
        const conversationId = selectedConversation && selectedConversation.guid ? selectedConversation.guid : selectedConversation.uid ? selectedConversation.uid : null;
        if (conversationId) {
          cometChat.removeMessageListener();
        }
        setCallType(null);
        setMessages(() => []);
        cometChat.removeCallListener(callListenerId);
      }
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (selectedFile && selectedFile.name && selectedFile.uri) {
      sendMediaMessageCometChat();
    }
  }, [selectedFile]);

  useEffect(() => {
    if (cometChat) {
      listenForCall();
    }
  }, [cometChat]);

  const rejectCall = (status, call) => {
    if (status && call) {
      cometChat.rejectCall(call.sessionId, status).then(
        call => {
          console.log("Call rejected successfully", call);
          setCallSettings(null);
          setCallType(null);
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
      },
      onError: error => {
        console.log("Error :", error);
        /* hiding/closing the call screen can be done here. */
        setCallSettings(null);
        setCallType(null);
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
      Alert.alert(
        "Confirm",
        "You are having a call?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => rejectCall(cometChat.CALL_STATUS.REJECTED, call)
          },
          { text: "OK", onPress: () => acceptCall(call) }
        ]
      );
    }
  };

  const listenForCall = () => {
    cometChat.addCallListener(
      callListenerId,
      new cometChat.CallListener({
        onIncomingCallReceived(call) {
          console.log("Incoming call:", call);
          confirmCall(call);
        },
        onOutgoingCallAccepted(call) {
          console.log("Outgoing call accepted:", call);
          startCall(call);
        },
        onOutgoingCallRejected(call) {
          console.log("Outgoing call rejected:", call);
          setCallSettings(null);
          setCallType(null);
        },
        onIncomingCallCancelled(call) {
          console.log("Incoming call calcelled:", call);
          setCallSettings(null);
          setCallType(null);
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
        // perform action on success. Like show your calling screen.
      },
      error => {
        console.log("Call initialization failed with exception:", error);
      }
    );
  };

  const isValidMessage = (message) => {
    return message &&
      message.id &&
      (message.text || message.type === 'file') &&
      message.sentAt &&
      message.sender &&
      message.sender.uid &&
      message.sender.name &&
      message.sender.avatar &&
      message.category &&
      message.category === 'message'
  };

  const isVideo = (url) => url && url.includes('mp4');

  const isAudio = (url) => url && url.includes('mp3');

  const transformSingleMessage = (message) => {
    if (isValidMessage(message)) {
      let transformedMessage = {
        _id: message.id,
        createdAt: new Date(message.sentAt),
        user: {
          _id: message.sender.uid,
          name: message.sender.name,
          avatar: message.sender.avatar,
        },
      }
      if (message.text) {
        transformedMessage.text = message.text;
      }
      if (message.type === 'file' && message.data && message.data.url) {
        if (isVideo(message.data.url)) {
          transformedMessage.video = message.data.url;
        } else if (isAudio(message.data.url)) {
          transformedMessage.audio = message.data.url;
        } else {
          transformedMessage.image = message.data.url;
        }
      }
      return transformedMessage;
    }
    return message;
  };

  const transformMessages = (messages) => {
    if (messages && messages.length !== 0) {
      const transformedMessages = [];
      for (const message of messages) {
        if (isValidMessage(message)) {
          transformedMessages.push(transformSingleMessage(message));
        }
      }
      return transformedMessages.sort(function (a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(b.createdAt) - new Date(a.createdAt);
      });;
    }
    return [];
  };

  /**
   * listen for messages
   */
  const listenForMessages = () => {
    const conversationId = selectedConversation && selectedConversation.guid ? selectedConversation.guid : selectedConversation.uid ? selectedConversation.uid : null;
    if (conversationId) {
      cometChat.addMessageListener(
        conversationId,
        new cometChat.MessageListener({
          onTextMessageReceived: (message) => {
            // set state.
            setMessages(previousMessages => GiftedChat.append(previousMessages, [transformSingleMessage(message)]))
          },
          onMediaMessageReceived: mediaMessage => {
            // Handle media message
            // set state.
            setMessages(previousMessages => GiftedChat.append(previousMessages, [transformSingleMessage(mediaMessage)]))
          },
        })
      );
    }
  }

  const loadMessages = () => {
    const limit = 50;
    const messageRequestBuilder = new cometChat.MessagesRequestBuilder().setLimit(limit)
    if (selectedConversation.contactType === 1) {
      messageRequestBuilder.setGUID(selectedConversation.guid);
    } else if (selectedConversation.contactType === 0) {
      messageRequestBuilder.setUID(selectedConversation.uid);
    }
    const messagesRequest = messageRequestBuilder.build();
    messagesRequest
      .fetchPrevious()
      .then((messages) => {
        setMessages(() => transformMessages(messages));
      })
      .catch((error) => { });
  };

  const sendMediaMessageCometChat = () => {
    const receiverID = getReceiverId();
    const receiverType = getReceiverType();
    const messageType = cometChat.MESSAGE_TYPE.FILE;

    if (receiverID && receiverType) {
      const mediaMessage = new cometChat.MediaMessage(
        receiverID,
        selectedFile,
        messageType,
        receiverType
      );

      cometChat.sendMediaMessage(mediaMessage).then(
        message => {
          // Message sent successfully.
          const transformedSingleMessage = transformSingleMessage(message);
          setMessages(previousMessages => GiftedChat.append(previousMessages, [transformedSingleMessage]))
        },
        error => {
          // Handle exception.
        }
      );
    }
  };

  const getReceiverId = () => {
    if (selectedConversation && selectedConversation.guid) {
      return selectedConversation.guid;
    }
    if (selectedConversation && selectedConversation.uid) {
      return selectedConversation.uid;
    }
    return null;
  };

  const getReceiverType = () => {
    if (selectedConversation && selectedConversation.guid) {
      return cometChat.RECEIVER_TYPE.GROUP;
    }
    return cometChat.RECEIVER_TYPE.USER;
  };

  const sendMessageCometChat = (messages) => {
    if (messages && messages.length !== 0) {
      const receiverID = getReceiverId();
      const receiverType = getReceiverType();
      if (receiverID && receiverType) {
        const messageText = messages[0].text;
        const textMessage = new cometChat.TextMessage(
          receiverID,
          messageText,
          receiverType
        );
        cometChat.sendMessage(textMessage).then(
          message => {
            setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
          },
          error => {
            console.log(error);
          }
        );
      }
    }
  };

  const showMessage = (title, message) => {
    Alert.alert(
      title,
      message
    );
  };

  const onSend = useCallback((messages = []) => {
    sendMessageCometChat(messages);
  }, [])

  const isValidFile = (name) => {
    return name && (name.includes('jpg') || name.includes('mp3') || name.includes('mp4'));
  }

  const onSelect = async () => {
    // Pick a single file
    try {
      const resArr = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      const res = resArr && resArr.length !== 0 ? resArr[0] : null;
      if (res && res.name && res.uri && isValidFile(res.name)) {
        const file = {
          name: res.name,
          uri: res.uri.replace("file://", ""),
        };
        setSelectedFile(() => file);
      } else {
        showMessage('Error', 'You just can upload image, audio and video files (jpg, mp3, and mp4)');
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err
      }
    }
  };

  const renderActions = () => {
    return (
      <TouchableOpacity style={styles.select} onPress={onSelect}>
        <Text style={styles.selectLabel}>Select</Text>
      </TouchableOpacity>
    );
  };

  const getSource = (message) => {
    if (message && message.currentMessage) {
      return message.currentMessage.audio ? message.currentMessage.audio : message.currentMessage.video ? message.currentMessage.video : null;
    }
    return null;
  }

  const renderVideo = (message) => {
    const source = getSource(message);
    if (source) {
      return (
        <View style={styles.videoContainer} key={message.currentMessage._id}>
          {Platform.OS === 'ios' ? <Video
            style={styles.videoElement}
            shouldPlay
            height={156}
            width={242}
            muted={true}
            source={{ uri: source }}
            allowsExternalPlayback={false}></Video> : <VideoPlayer
            style={styles.videoElement}
            source={{ uri: source }}
          />}
        </View>
      );
    }
    return <></>;
  };

  if (callSettings) {
    return (
      <Modal animated animationType="fade">
        <View style={{ height: '100%', width: '100%', position: 'relative' }}>
          <KeepAwake />
          <cometChat.CallingComponent
            callsettings={callSettings}
          />
        </View>
      </Modal>
    );
  }

  if (!callSettings) {
    return (
      <>
        <View style={{ backgroundColor: '#fff', flex: 1 }}>
          <GiftedChat
            scrollToBottom
            messages={messages}
            onSend={messages => onSend(messages)}
            user={{
              _id: user.uid,
              name: user.name,
              avatar: user.avatar,
            }}
            renderActions={renderActions}
            renderMessageVideo={renderVideo}
            renderMessageAudio={renderVideo}
          />
        </View>
      </>
    )
  }
};

const styles = StyleSheet.create({
  select: {
    alignSelf: 'center',
    paddingLeft: 8,
  },
  selectLabel: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  videoContainer: {
    position: 'relative',
    height: 156,
    width: 250
  },
  videoElement: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 150,
    width: 242,
    borderRadius: 20,
    margin: 4,
  }
});

export default Chat;