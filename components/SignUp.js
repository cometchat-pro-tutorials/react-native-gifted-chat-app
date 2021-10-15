import React, { useState, useContext } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';

// import environment variables.
import { cometChatConfig } from '../env';
// import Context to get shared data.
import Context from "../context";
// import validator to validate user's information.
import validator from "validator";
// import firebase authentication.
import { auth, createUserWithEmailAndPassword } from "../firebase";

const SignUp = () => {
  const { cometChat } = useContext(Context);

  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onFullnameChanged = (fullname) => {
    setFullname(() => fullname);
  };

  const onEmailChanged = (email) => {
    setEmail(() => email);
  };

  const onPasswordChanged = (password) => {
    setPassword(() => password);
  };

  const onConfirmPasswordChanged = (confirmPassword) => {
    setConfirmPassword(() => confirmPassword);
  };

  const generateAvatar = () => {
    // hardcode list of user's avatars for the demo purpose.
    const avatars = [
      'https://data-us.cometchat.io/assets/images/avatars/captainamerica.png',
      'https://data-us.cometchat.io/assets/images/avatars/cyclops.png',
      'https://data-us.cometchat.io/assets/images/avatars/ironman.png',
      'https://data-us.cometchat.io/assets/images/avatars/spiderman.png',
      'https://data-us.cometchat.io/assets/images/avatars/wolverine.png'
    ];
    const avatarPosition = Math.floor(Math.random() * avatars.length);
    return avatars[avatarPosition];
  }

  const showMessage = (title, message) => {
    Alert.alert(
      title,
      message
    );
  };

  const isSignupValid = ({ fullname, email, password, confirmPassword }) => {
    if (validator.isEmpty(fullname)) {
      showMessage('Error', 'Please input your full name');
      return false;
    }
    if (validator.isEmpty(email) || !validator.isEmail(email)) {
      showMessage('Error', 'Please input your email');
      return false;
    }
    if (validator.isEmpty(password)) {
      showMessage('Error', 'Please input your password');
      return false;
    }
    if (validator.isEmpty(confirmPassword)) {
      showMessage('Error', 'Please input your confirm password');
      return false;
    }
    if (password !== confirmPassword) {
      showMessage('Error', 'Your confirm password must be matched with your password');
      return false;
    }
    return true;
  };

  const register = () => {
    if (isSignupValid({ fullname, email, password, confirmPassword })) {
      setIsLoading(true);
      // generate user's avatar.
      const userAvatar = generateAvatar();
      // call firebase to to register a new account.
      createUserWithEmailAndPassword(auth, email, password).then((userCrendentials) => {
        if (userCrendentials) {
          const firebaseUid = userCrendentials._tokenResponse.localId;
          // cometchat auth key
          const authKey = `${cometChatConfig.cometChatAuthKey}`;
          // call cometchat service to register a new account.
          const user = new cometChat.User(firebaseUid);
          user.setName(fullname);
          user.setAvatar(userAvatar);

          cometChat.createUser(user, authKey).then(
            user => {
              showMessage('Info', `${userCrendentials.user.email} was created successfully! Please sign in with your created account`);
              setIsLoading(false);
            }, error => {
              console.log(error);
              setIsLoading(false);
            }
          )
        }
      }).catch((error) => {
        console.log(error);
        setIsLoading(false);
        showMessage('Error', 'Fail to create you account. Your account might be existed.');
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        autoCapitalize='none'
        onChangeText={onFullnameChanged}
        placeholder="Full name"
        placeholderTextColor="#ccc"
        style={styles.input}
      />
      <TextInput
        autoCapitalize='none'
        onChangeText={onEmailChanged}
        placeholder="Email"
        placeholderTextColor="#ccc"
        style={styles.input}
      />
      <TextInput
        autoCapitalize='none'
        onChangeText={onPasswordChanged}
        placeholder="Password"
        placeholderTextColor="#ccc"
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        autoCapitalize='none'
        onChangeText={onConfirmPasswordChanged}
        placeholder="Confirm Password"
        placeholderTextColor="#ccc"
        secureTextEntry
        style={styles.input}
      />
      <TouchableOpacity style={styles.register} onPress={register}>
        <Text style={styles.registerLabel}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center'
  },
  input: {
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 12,
  },
  register: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    fontSize: 16,
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 16,
  },
  registerLabel: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});

export default SignUp;