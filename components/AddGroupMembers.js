import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, FlatList, Image, Alert, ActivityIndicator } from 'react-native';

import Context from '../context';

const AddGroupMembers = () => {
  const { cometChat, selectedConversation } = useContext(Context);

  const [keyword, setKeyword] = useState('');
  // data that will be shown on the list, data could be the list of users, or the list of groups.
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    searchUsers();
  }, [cometChat, keyword]);

  const shouldTransform = (groupMembers, userList) => {
    return groupMembers && groupMembers.length !== 0 && userList && userList.length !== 0;
  };

  const isGroupMember = (user, groupMembers) => {
    if (user && user.uid && groupMembers && groupMembers.length !== 0) {
      for (const member of groupMembers) {
        if (member && member.uid && member.uid === user.uid) {
          return true;
        }
      }
      return false;
    }
    return false;
  };

  const transformUsers = (groupMembers, userList) => {
    if (shouldTransform(groupMembers, userList)) {
      const transformedUsers = [];
      for (const user of userList) {
        if (!isGroupMember(user, groupMembers)) {
          transformedUsers.push(user);
        }
      }
      return transformedUsers;
    }
    return userList;
  };

  const searchGroupMembers = (userList) => {
    const GUID = selectedConversation.guid;
    const limit = 30;
    const groupMemberRequest = new cometChat.GroupMembersRequestBuilder(GUID)
      .setLimit(limit)
      .build();

    groupMemberRequest.fetchNext().then(
      groupMembers => {
        setData(() => transformUsers(groupMembers, userList));
      },
      error => {
      }
    );
  };

  const searchUsers = () => {
    if (cometChat) {
      const limit = 30;
      const usersRequestBuilder = new cometChat.UsersRequestBuilder().setLimit(limit);
      const usersRequest = keyword ? usersRequestBuilder.setSearchKeyword(keyword).build() : usersRequestBuilder.build();
      usersRequest.fetchNext().then(
        userList => {
          /* userList will be the list of User class. */
          /* retrived list can be used to display contact list. */
          searchGroupMembers(userList);
        },
        error => {
        }
      );
    }
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

  const shouldAddMember = (selectedUser) => {
    return selectedUser && selectedUser.uid && selectedConversation && selectedConversation.guid
  };

  const handleAddMember = (selectedUser) => {
    if (shouldAddMember(selectedUser)) {
      setIsLoading(true);
      const GUID = selectedConversation.guid;
      const membersList = [
        new cometChat.GroupMember(selectedUser.uid, cometChat.GROUP_MEMBER_SCOPE.PARTICIPANT),
      ];
      cometChat.addMembersToGroup(GUID, membersList, []).then(
        response => {
          setIsLoading(false);
          showMessage('Info', `${selectedUser.name} was added to the group successfully`);
          searchUsers();
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
      `Do you want add ${item.name} to the group?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { text: "OK", onPress: () => handleAddMember(item) }
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

export default AddGroupMembers;