var modeRef = firebase.database().ref('mode');
modeRef.on('value', function (v) {
    mode = v.val();
    modes = ["sideboard", "game", "title", "freetext"];
    _.each(modes, function (ele, idx, list) {
        $("#" + ele).hide();
    });
    if (_.contains(modes, mode)) {
        $("#" + mode).show();
    }
});
firebase.database().ref('player1').on('value', function (v) {
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
    var handElt = $("#p1hand");
    handElt.empty();
    fillHand(handElt, v.val());
});
firebase.database().ref('player2').on('value', function (v) {
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
    var handElt = $("#p2hand");
    handElt.empty();
    fillHand(handElt, v.val());
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
