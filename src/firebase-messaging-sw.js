importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

firebaseConfig = {
  apiKey: "AIzaSyAT9pdOV03_g00fARjZV1dkU5c3bRDRk-c",
    authDomain: "fcmpush-1149a.firebaseapp.com",
    databaseURL: "https://fcmpush-1149a.firebaseio.com",
    projectId: "fcmpush-1149a",
    storageBucket: "fcmpush-1149a.appspot.com",
    messagingSenderId: "361523844211",
    appId: "1:361523844211:web:6d3a27b55db21db5508606",
    measurementId: "G-NZ719E5GX9"
}

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {

  console.log("Received background message ", payload);

  const notificationTitle = payload.data.title;
  const notificationBody = {
    body: payload.data.data,
  };

  self.registration.showNotification(notificationTitle, notificationBody);
});
