import React, { useState, useContext } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Image, Alert, ActivityIndicator } from 'react-native';

import Context from '../context';

const ManageGroup = (props) => {
  const { navigation } = props;

  const { cometChat, selectedConversation } = useContext(Context);

  const [isLoading, setIsLoading] = useState(false);

  const showMessage = (title, message) => {
    Alert.alert(
      title,
      message
    );
  };

  const handleDeleteGroup = () => {
    if (selectedConversation && selectedConversation.name && selectedConversation.guid) {
      setIsLoading(true);
      cometChat.deleteGroup(selectedConversation.guid).then(
        response => {
          setIsLoading(false);
          showMessage('Info', `${selectedConversation.name} was deleted successfully`);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }]
          });
        },
        error => {
          setIsLoading(false);
          showMessage('Error', `Failure to delete ${selectedConversation.name}`);
        }
      );
    }
  };

  const deleteGroup = () => {
    Alert.alert(
      "Confirm",
      `Do you want to delete group ${selectedConversation.name} ?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { text: "OK", onPress: () => handleDeleteGroup() }
      ]
    );
  };

  const removeMembers = () => {
    navigation.navigate('Remove Members');
  };

  const addMembers = () => {
    navigation.navigate('Add Members');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.option} onPress={deleteGroup}>
        <Image
          style={styles.optionImage}
          source={{
            uri: 'https://www.creativefabrica.com/wp-content/uploads/2019/02/Trash-Icon-by-Kanggraphic-580x386.jpg'
          }}
        />
        <Text style={styles.optionLabel}>Delete Group</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={removeMembers}>
        <Image
          style={styles.optionImage}
          source={{
            uri: 'https://cdn2.iconfinder.com/data/icons/mutuline-ui-essential/48/delete_user_remove-512.png'
          }}
        />
        <Text style={styles.optionLabel}>Remove Members</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={addMembers}>
        <Image
          style={styles.optionImage}
          source={{
            uri: 'https://cdn2.iconfinder.com/data/icons/mutuline-ui-essential/48/add_new_user-512.png'
          }}
        />
        <Text style={styles.optionLabel}>Add Members</Text>
      </TouchableOpacity>
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
  option: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  optionImage: {
    width: 32,
    height: 32,
    marginRight: 4
  }
});

export default ManageGroup;