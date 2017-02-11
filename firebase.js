// Initialize Firebase
firebase.initializeApp(config);

function signIn() {
    firebase.auth().signInWithRedirect(new firebase.auth.GoogleAuthProvider());
}

function signOut() {
    firebase.auth().signOut();
}

$(function () {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            var profilePicUrl = user.photoURL;
            if (!profilePicUrl && user.providerData && user.providerData.length > 0) {
                profilePicUrl = user.providerData[0].photoURL;
            }

            $("#user-pic").css("background-image", 'url(' + profilePicUrl + ')');
            $("#user-pic, #sign-out").show();
            $("#sign-in").hide();
        } else { // User is signed out!
            $("#user-name, #user-pic, #sign-out").hide();
            $("#sign-in").show();
        }
    });

    $("#sign-out").click(signOut);
    $("#sign-in").click(signIn);
});