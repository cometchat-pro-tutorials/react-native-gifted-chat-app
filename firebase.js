import { fbConfig } from "./env";

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: `${fbConfig.apiKey}`,
  authDomain: `${fbConfig.authDomain}`, 
  projectId: `${fbConfig.projectId}`,
  storageBucket: `${fbConfig.storageBucket}`,
  messagingSenderId: `${fbConfig.messagingSenderId}`,
  appId: `${fbConfig.appId}`,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword };