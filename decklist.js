var config = {
    apiKey: "AIzaSyDqDSKWpdJJIDBIX5Xq7w24hYss0zliBp8",
    authDomain: "urzaslunchbreak.firebaseapp.com",
    databaseURL: "https://urzaslunchbreak.firebaseio.com",
    storageBucket: "",
};

firebase.initializeApp(config);

firebase.database().ref('player1').on('value', function (v) {
    $("#p1").find(".player-name").text(v.val().name);
});
firebase.database().ref('player2').on('value', function (v) {
    $("#p2").find(".player-name").text(v.val().name);
});
firebase.database().ref('player1').on('value', function (v) {
    $("#p1").find(".deck-name").text(v.val().deck);
});
firebase.database().ref('player2').on('value', function (v) {
    $("#p2").find(".deck-name").text(v.val().deck);
});
firebase.database().ref('p1deck').on('value', function (v) {
    if (v.val()) {
        var p1 = $("#p1");
        fillDeck(p1.find(".deck"), v.val(), false);
        fillDeck(p1.find(".side"), v.val(), true);
    }
});
firebase.database().ref('p2deck').on('value', function (v) {
    if (v.val()) {
        var p2 = $("#p2");
        fillDeck(p2.find(".deck"), v.val(), false);
        fillDeck(p2.find(".side"), v.val(), true);
    }
});
