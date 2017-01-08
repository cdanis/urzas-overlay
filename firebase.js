// Initialize Firebase
firebase.initializeApp(config);
firebase.auth().signInWithEmailAndPassword(firebaseUsername, firebasePassword).catch(function (error) {
    console.log(error);
});
