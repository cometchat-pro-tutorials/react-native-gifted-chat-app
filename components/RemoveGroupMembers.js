import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, FlatList, Image, Alert, ActivityIndicator } from 'react-native';

import Context from '../context';

const RemoveGroupMembers = () => {
  const { cometChat, selectedConversation } = useContext(Context);

  const [keyword, setKeyword] = useState('');
  // data that will be shown on the list, data could be the list of users, or the list of groups.
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    searchGroupMembers();
  }, [cometChat, keyword]);

  const searchGroupMembers = (userList) => {
    const GUID = selectedConversation.guid;
    const limit = 30;
    const groupMemberRequestBuilder = new cometChat.GroupMembersRequestBuilder(GUID)
      .setLimit(limit)
    const groupMemberRequest = keyword ? groupMemberRequestBuilder.setSearchKeyword(keyword).build() : groupMemberRequestBuilder.build();
    groupMemberRequest.fetchNext().then(
      groupMembers => {
        setData(() => groupMembers);
      },
      error => {
      }
    );
  };

  const onKeywordChanged = (keyword) => {
    setKeyword(() => keyword);
  };

  const showMessage = (title, message) => {
    Alert.alert(
      title,
      message
    );
  };

  const shouldRemoveMember = (selectedUser) => {
    return selectedUser && selectedUser.uid && selectedConversation && selectedConversation.guid;
  };

  const handleRemoveMember = (selectedUser) => {
    if (shouldRemoveMember(selectedUser)) {
      setIsLoading(true);
      const GUID = selectedUser.guid;
      const UID = selectedUser.uid;

      cometChat.kickGroupMember(GUID, UID).then(
        response => {
          setIsLoading(false);
          showMessage('Info', `${selectedUser.name} was removed from the group successfully`);
          searchGroupMembers();
        },
        error => {
        }
      );
    }
  };

  const selectItem = (item) => () => {
    // logic adding a new member to the selected group will be handled in here.
    Alert.alert(
      "Confirm",
      `Do you want remove ${item.name} from the group?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { text: "OK", onPress: () => handleRemoveMember(item) }
      ]
    );
  };

  const renderItems = ({ item }) => {
    return (
      <TouchableOpacity style={styles.listItem} onPress={selectItem(item)}>
        <Image
          style={styles.listItemImage}
          source={{
            uri: item.avatar ? item.avatar : item.icon
          }}
        />
        <Text style={styles.listItemLabel}>{item.name}</Text>
      </TouchableOpacity>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          autoCapitalize='none'
          onChangeText={onKeywordChanged}
          placeholder="Search..."
          placeholderTextColor="#000"
          style={styles.input}
        />
      </View>
      <View style={styles.list}>
        <FlatList
          data={data}
          renderItem={renderItems}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    backgroundColor: '#fff',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center'
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
    flexDirection: 'column',
  },
  inputContainer: {
    marginTop: 8,
  },
  input: {
    borderColor: '#000',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginHorizontal: 8,
    padding: 12,
  },
  list: {
    flex: 1,
  },
  listItem: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  listItemImage: {
    width: 32,
    height: 32,
    marginRight: 8
  },
  listItemLabel: {
    fontSize: 16,
  }
});

export default RemoveGroupMembers;