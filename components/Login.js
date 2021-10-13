import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';

// import environment variables.
import { cometChatConfig } from '../env';
// import Context to get shared data from React context.
import Context from "../context";
// import firebase authentication and real time database.
import { auth, signInWithEmailAndPassword } from "../firebase";
// import validator to validate user's credentials.
import validator from "validator";
// import async storage.
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = (props) => {
  const { navigation } = props;

  // get shared data from context.
  const { setUser, cometChat } = useContext(Context);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      setIsLoading(false);
    }
  }, []);

  const onEmailChanged = (email) => {
    setEmail(() => email);
  };

  const onPasswordChanged = (password) => {
    setPassword(() => password);
  };

  const isUserCredentialsValid = (email, password) => {
    return validator.isEmail(email) && password;
  };

  const showMessage = (title, message) => {
    Alert.alert(
      title,
      message
    );
  };

  const login = () => {
    if (isUserCredentialsValid(email, password)) {
      setIsLoading(true);
      // if the user's credentials are valid, call Firebase authentication service.
      signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
        const firebaseUid = userCredential.user.uid;
        // login cometchat.
        cometChat.login(firebaseUid, `${cometChatConfig.cometChatAuthKey}`).then(
          user => {
            // User loged in successfully.
            // save authenticated user to local storage.
            AsyncStorage.setItem('auth', JSON.stringify(user));
            // save authenticated user to context.
            setUser(user);
            // navigate to the home page
            navigation.navigate('Home');
          },
          error => {
            // User login failed, check error and take appropriate action.
            setIsLoading(false);
            showMessage('Error', 'Your username or password is not correct');
          }
        );
      })
        .catch((error) => {
          // hide loading indicator.
          setIsLoading(false);
          alert(`Your user's name or password is not correct`);
        });
    } else {
      setIsLoading(false);
      showMessage('Error', 'Your username or password is not correct');
    }
  };

  const register = () => {
    navigation.navigate('SignUp');
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
      <TouchableOpacity style={styles.login} onPress={login}>
        <Text style={styles.loginLabel}>Login</Text>
      </TouchableOpacity>
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
  login: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    fontSize: 16,
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 16,
  },
  loginLabel: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  register: {
    backgroundColor: '#fff',
    fontSize: 16,
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 16,
  },
  registerLabel: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase'
  }
});

export default Login;