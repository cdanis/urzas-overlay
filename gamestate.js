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

// Gatherer card images are low-res and blocky and ugly, so if we can, we want to use magiccards.info images.
// We need to translate from what Gatherer calls the set to what magiccards.info calls the set, though.
var gathererToMagiccardsInfo = [];
$.get("https://api.magicthegathering.io/v1/sets",
    function(data) {
        gathererToMagiccardsInfo = _.object(
            _.map(data.sets, function(x) { return x.gathererCode || x.code; }),
            _.map(data.sets, function(x) { return x.magicCardsInfoCode; }));
    });

function fillFeaturedCard(cardName, featuredCardSelector, handSelector) {
    if (cardName != "") {
        $(handSelector).hide();
        // exact match on the name, because autocomplete in director.html should have
        // put an exact name there for us
        $.get("https://api.magicthegathering.io/v1/cards?name=\"" + cardName + "\"",
            function (data) {
                if (data.cards && data.cards.length > 0) {
                    var card = data.cards[0];
                    imageUrl = card.imageUrl;
                    if (card.set && card.number) {
                        // not all cards have a number (e.g. LEA Lightning Bolt)
                        imageUrl = ("http://magiccards.info/scans/en/" + gathererToMagiccardsInfo[card.set]
                                    + "/" + card.number + ".jpg").toLowerCase();
                    }
                    $(featuredCardSelector + " .img").attr("src", imageUrl);
                    $(featuredCardSelector + " .cardName").text(card.name);
                    $(featuredCardSelector + " .cardType").text(card.types.join(" "));
                    $(featuredCardSelector + " .rarityAndSet").text(card.rarity + ", " + card.setName);
                }
            });
        $(featuredCardSelector).show();
    } else {
        $(handSelector).show();
        $(featuredCardSelector).hide();
    }
}

firebase.database().ref('player1').on('value', function (v) {
    $(".p1.life").text(v.val().life);
    var poison = v.val().poison;
    var poisonElt = $(".p1.poison");
    poisonElt.text(v.val().poison);
    poisonElt.toggle(!!v.val().poison);
    $(".p1.name").text(v.val().name);
    $(".p1.deck").text(v.val().deck);
    $(".p1.wins").text(v.val().gamewins);
    fillFeaturedCard(v.val().featuredcard, ".p1.featuredcard", ".p1.hand");
});
firebase.database().ref('p1deck').on('value', function (v) {
    var handElt = $(".p1.hand");
    handElt.empty();
    fillHand(handElt, v.val());
    showSideboard($(".p1.sideboard"), v.val());
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
    fillFeaturedCard(v.val().featuredcard, ".p2.featuredcard", ".p2.hand");
});
firebase.database().ref('p2deck').on('value', function (v) {
    var handElt = $(".p2.hand");
    handElt.empty();
    fillHand(handElt, v.val());
    showSideboard($(".p2.sideboard"), v.val());
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
