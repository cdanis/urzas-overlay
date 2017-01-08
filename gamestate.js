function toCost(text) {
    var cost = "&nbsp;";
    if (text) {
        for (var i = 0; i < text.length; i++) {
            cost += "<i class='ms ms-" + text[i] + "'></i>";
        }
    }
    return cost;
}

function fillHand(handElt, deck) {
    handElt.empty();
    for (var i = 0; i < deck.length; i++) {
        var card = deck[i];
        if (card.inhand) {
            var cardElt = $("<div>", {"class": "card"});
            cardElt.text(card.name);
            var costElt = $("<span>", {"class": "mana"});
            costElt.html(toCost(card.cost && ("" + card.cost)));
            cardElt.append(costElt);
            handElt.append(cardElt)
        }
    }
}

// Initialize Firebase
firebase.initializeApp(config);
firebase.auth().signInWithEmailAndPassword(firebaseUsername, firebasePassword).catch(function (error) {
    console.log(error);
});

var modeRef = firebase.database().ref('mode');
console.log(modeRef);
modeRef.on('value', function (v) {
    mode = v.val();
    console.log(mode);
    modes = ["sideboard", "game", "title", "freetext"];
    _.each(modes, function (ele, idx, list) {
        console.log(ele);
        $("#" + ele).hide();
    });
    if (_.contains(modes, mode)) {
        console.log(mode);
        $("#" + mode).show();
    }
});
firebase.database().ref('player1').on('value', function (v) {
    console.log(v.val());
    $(".left .life").text(v.val().life);
    var poison = v.val().poison;
    var poisonElt = $(".left .poison");
    poisonElt.text(v.val().poison);
    poisonElt.toggle(!!v.val().poison);
    $("#p1name").text(v.val().name);
    $("#p1deck").text(v.val().deck);
    $("#p1wins").text(v.val().gamewins);
    $(".sideboard .left").text(v.val().sideboard.replace(/_/g, "\n"));
});
firebase.database().ref('p1deck').on('value', function (v) {
    fillHand($("#p1hand"), v.val());
});
firebase.database().ref('player2').on('value', function (v) {
    console.log(v.val());
    $(".right .life").text(v.val().life);
    var poison = v.val().poison;
    var poisonElt = $(".right .poison");
    poisonElt.text(v.val().poison);
    poisonElt.toggle(!!v.val().poison);
    $("#p2name").text(v.val().name);
    $("#p2deck").text(v.val().deck);
    $("#p2wins").text(v.val().gamewins);
    $(".sideboard .right").text(v.val().sideboard.replace(/_/g, "\n"));
});
firebase.database().ref('p2deck').on('value', function (v) {
    fillHand($("#p2hand"), v.val());
});
firebase.database().ref('freetext').on('value', function (v) {
    $("#freetext").text(v.val());
});
var timerId = null;
firebase.database().ref('end_of_round_epoch_ms').on('value', function (v) {
    if (timerId) {
        window.clearInterval(timerId);
    }
    var end_of_round_epoch_ms = v.val();
    if ($.isNumeric(end_of_round_epoch_ms) && end_of_round_epoch_ms > 0) {
        timerId = countdown(end_of_round_epoch_ms, function (ts) {
            var timer = $(".scorebox.timer");
            timer.text(ts.minutes + ":" + ("0" + ts.seconds).slice(-2));
            if (ts.value > 0) {
                timer.addClass("overtime");
            } else {
                timer.removeClass("overtime");
            }
        });
    } else {
        $(".scorebox.timer").text("");
    }
});
