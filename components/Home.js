import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, FlatList, Image } from 'react-native';

import Context from '../context';

import 'react-native-get-random-values';
import { v4 as uuidv4 } from "uuid";

const Home = (props) => {
  const { navigation } = props;

  const { cometChat, setSelectedConversation } = useContext(Context);

  const [keyword, setKeyword] = useState('');
  // 0 is user, 1 is group.
  const [selectedType, setSelectedType] = useState(0);
  // data that will be shown on the list, data could be the list of users, or the list of groups.
  const [data, setData] = useState([]);

  useEffect(() => {
    if (selectedType === 0) {
      searchUsers();
    } else {
      searchGroups();
    }
  }, [cometChat, selectedType, keyword]);

  const searchUsers = () => {
    if (cometChat) {
      const limit = 30;
      const usersRequestBuilder = new cometChat.UsersRequestBuilder().setLimit(limit);
      const usersRequest = keyword ? usersRequestBuilder.setSearchKeyword(keyword).build() : usersRequestBuilder.build();
      usersRequest.fetchNext().then(
        userList => {
          /* userList will be the list of User class. */
          /* retrived list can be used to display contact list. */
          setData(() => userList);
        },
        error => {
        }
      );
    }
  };

  const searchGroups = () => {
    const limit = 30;
    const groupRequestBuilder = new cometChat.GroupsRequestBuilder().setLimit(limit);
    const groupsRequest = keyword ? groupRequestBuilder.setSearchKeyword(keyword).build() : groupRequestBuilder.build();
    groupsRequest.fetchNext().then(
      groupList => {
        /* groupList will be the list of Group class */
        /* you can display the list of groups available using groupList */
        setData(() => groupList);
      },
      error => {
      }
    );
  };

  const onKeywordChanged = (keyword) => {
    setKeyword(() => keyword);
  };

  const updateSelectedType = (selectedType) => () => {
    setSelectedType(() => selectedType);
  };

  const joinGroup = (item) => {
    if (item && item.guid && !item.hasJoined) {
      const GUID = item.guid;
      const password = "";
      const groupType = cometChat.GROUP_TYPE.PUBLIC;

      cometChat.joinGroup(GUID, groupType, password).then(
        group => {
        },
        error => {
        }
      );
    }
  };

  const selectItem = (item) => () => {
    // if item is a group. Join the group if the user has not joined before. 
    if (item && item.guid && !item.hasJoined) {
      joinGroup(item);
    }
    //
    setSelectedConversation({ ...item, contactType: selectedType });
    navigation.navigate('Chat');
  };

  const getKey = (item) => {
    if (item && item.uid) {
      return item.uid;
    }
    if (item && item.guid) {
      return item.guid;
    }
    return uuidv4();
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
      <View style={styles.searchActionContainer}>
        <TouchableOpacity style={[styles.searchActionBtn, styles.searchLeftActionBtn, selectedType === 0 && styles.searchActionBtnActive]} onPress={updateSelectedType(0)}>
          <Text style={[styles.searchActionLabel, selectedType === 0 && styles.searchActionLabelActive]}>User</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.searchActionBtn, styles.searchRightActionBtn, selectedType === 1 && styles.searchActionBtnActive]} onPress={updateSelectedType(1)}>
          <Text style={[styles.searchActionLabel, selectedType === 1 && styles.searchActionLabelActive]}>Group</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.list}>
        <FlatList
          data={data}
          renderItem={renderItems}
          keyExtractor={(item, index) => getKey(item)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  searchActionContainer: {
    borderRadius: 8,
    flexDirection: 'row',
    margin: 8,
  },
  searchActionBtn: {
    backgroundColor: '#fff',
    borderColor: '#000',
    flex: 1,
    fontSize: 16,
    padding: 8
  },
  searchLeftActionBtn: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    marginRight: 0,
  },
  searchRightActionBtn: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    marginLeft: 0,
  },
  searchActionBtnActive: {
    backgroundColor: '#60A5FA',
    borderColor: '#60A5FA',
    borderRadius: 8,
  },
  searchActionLabel: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
  },
  searchActionLabelActive: {
    color: '#fff',
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

export default Home;