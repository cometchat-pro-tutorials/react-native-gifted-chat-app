# How to Build a React Native Gifted Chat App [with CometChat SDK]

Read the full tutorial here: [**>> How to Build a React Native Gifted Chat App [with CometChat SDK]**](https://www.cometchat.com/tutorials/#)

[Live Demo](https://www.dropbox.com/s/kbffa21aexp4dzd/rn-gifted-chat-app.mov?dl=0)

This example shows How to Build a React Native Gifted Chat App [with CometChat SDK]:

## Technology

This demo uses:

- @cometchat-pro/react-native-calls
- @cometchat-pro/react-native-chat
- @react-native-async-storage/async-storage
- @react-navigation/native
- react-native-image-picker
- react-native-get-random-values
- react-native-gifted-chat
- react-native-keep-awake
- react-native-safe-area-context
- react-native-screens
- react-native-video
- react-native-video-controls
- Firebase
- React
- React Native
- Uuid
- Validator

## Running the demo

To run the demo follow these steps:

1. [Head to CometChat Pro and create an account](https://app.cometchat.com/signup)
2. From the [dashboard](https://app.cometchat.com/apps), add a new app called **"react-native-gifted-chat-app"**
3. Select this newly added app from the list.
4. From the Quick Start copy the **APP_ID, APP_REGION and AUTH_KEY**. These will be used later.
5. Also copy the **REST_API_KEY** from the API & Auth Key tab.
6. Navigate to the Users tab, and delete all the default users and groups leaving it clean **(very important)**.
7. Download the repository [here](https://github.com/hieptl/react-native-gifted-chat-app/archive/main.zip) or by running `git clone https://github.com/hieptl/react-native-gifted-chat-app.git` and open it in a code editor.
8. [Head to Firebase and create a new project](https://console.firebase.google.com)
9. Create a file called **env.js** in the root folder of your project.
10. Import and inject your secret keys in the **env.js** file containing your CometChat and Firebase in this manner.

```js
export const fbConfig = {
  apiKey: xxx-xxx-xxx-xxx-xxx-xxx-xxx-xxx,
  authDomain: xxx-xxx-xxx-xxx-xxx-xxx-xxx-xxx,
  projectId: xxx-xxx-xxx-xxx-xxx-xxx-xxx-xxx,
  storageBucket: xxx-xxx-xxx-xxx-xxx-xxx-xxx-xxx,
  messagingSenderId: xxx-xxx-xxx-xxx-xxx-xxx-xxx-xxx,
  appId: xxx-xxx-xxx-xxx-xxx-xxx-xxx-xxx
};

export const cometChatConfig = {
  cometChatAppId: xxx-xxx-xxx-xxx-xxx-xxx-xxx-xxx,
  cometChatRegion: xxx-xxx-xxx-xxx-xxx-xxx-xxx-xxx,
  cometChatAuthKey: xxx-xxx-xxx-xxx-xxx-xxx-xxx-xxx,
  cometChatRestApiKey: xxx-xxx-xxx-xxx-xxx-xxx-xxx-xxx
};
```

11. cd to your root folder and hit npm i --force to install the packages.
12. Run cd to the ios folder then run pod install to install the pods. Once pods are installed run cd .. to go back to the root folder.
13. Run the app on iOS using npx react-native run-ios & on Android using npx react-native run-android
14. Make sure to include env.js in your gitIgnore file from being exposed online.
15. If you would like to test your application on IOS and you are using a Macbook - Apple Chip, you need to follow this link to configure your xcode and your ios project. [CometChat - Set up for IOS](https://prodocs.cometchat.com/docs/ios-setup)
16. If you would like to test your application on Android and you have to face with an issue related to ANDROIRD_ROOT_SDK. Please refer to this [link](https://stackoverflow.com/questions/27620262/sdk-location-not-found-define-location-with-sdk-dir-in-the-local-properties-fil) to get the solution.

Questions about running the demo? [Open an issue](https://github.com/hieptl/react-native-gifted-chat-app/issues). We're here to help ✌️

## Useful links

- 🏠 [CometChat Homepage](https://app.cometchat.com/signup)
- 🚀 [Create your free account](https://app.cometchat.com/apps)
- 📚 [Documentation](https://prodocs.cometchat.com)
- 👾 [GitHub](https://www.github.com/cometchat-pro)
- 🔥 [Firebase](https://console.firebase.google.com)
- 🔷 [React Native](https://reactnative.dev)