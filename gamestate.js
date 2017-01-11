var modeRef = firebase.database().ref('mode');
modeRef.on('value', function (v) {
    mode = v.val();
    modes = ["sideboard", "game", "title", "freetext", "featuredcard"];
    _.each(modes, function (ele, idx, list) {
        $("#" + ele).hide();
    });
    if (_.contains(modes, mode)) {
        $("#" + mode).show();
    }
});
firebase.database().ref('player1').on('value', function (v) {
    $(".p1.life").text(v.val().life);
    var poison = v.val().poison;
    var poisonElt = $(".p1.poison");
    poisonElt.text(v.val().poison);
    poisonElt.toggle(!!v.val().poison);
    $(".p1.name").text(v.val().name);
    $(".p1.deck").text(v.val().deck);
    $(".p1.wins").text(v.val().gamewins);
    $(".sideboard .left").text(v.val().sideboard.replace(/_/g, "\n"));
});
firebase.database().ref('p1deck').on('value', function (v) {
    var handElt = $(".p1.hand");
    handElt.empty();
    fillHand(handElt, v.val());
});
firebase.database().ref('player2').on('value', function (v) {
    $(".p2.life").text(v.val().life);
    var poison = v.val().poison;
    var poisonElt = $(".p2.poison");
    poisonElt.text(v.val().poison);
    poisonElt.toggle(!!v.val().poison);
    $(".p2.name").text(v.val().name);
    $(".p2.deck").text(v.val().deck);
    $(".p2.wins").text(v.val().gamewins);
    $(".sideboard .right").text(v.val().sideboard.replace(/_/g, "\n"));
});
firebase.database().ref('p2deck').on('value', function (v) {
    var handElt = $(".p2.hand");
    handElt.empty();
    fillHand(handElt, v.val());
});
firebase.database().ref('freetext').on('value', function (v) {
    $("#freetext").text(v.val());
});
firebase.database().ref('featuredcard').on('value', function (v) {
    $.get("https://api.magicthegathering.io/v1/cards?name=" + v.val(),
        function (data) {
            if (data.cards && data.cards.length > 0) {
                var card = data.cards[0];
                $(".featuredcard .img").attr("src", card.imageUrl);
                $(".featuredCard .cardName").text(card.name);
                $(".featuredCard .cardType").text(card.types.join(" "));
                $(".featuredCard .rarityAndSet").text(card.rarity + ", " + card.setName);
            }
        });
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
