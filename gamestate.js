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

var sets;
// Gatherer card images are low-res and blocky and ugly, so if we can, we want to use magiccards.info images.
// We need to translate from what Gatherer calls the set to what magiccards.info calls the set, though.
var gathererToMagiccardsInfo = [];
$.get("https://api.magicthegathering.io/v1/sets",
    function(data) {
        data.sets = _.sortBy(data.sets, function (x) {
            return (x.type == "promo" ? "p" : "") + x.releaseDate;
        });
        sets = _.map(data.sets, function (x) {
            return x.code;
        });

        gathererToMagiccardsInfo = _.object(
            sets,
            // If there's no magicCardsInfoCode, give up and return the normal code; fixes Kaladesh.
            _.map(data.sets, function(x) { return x.magicCardsInfoCode || x.code; }));
    });

function fillFeaturedCard(cardName, featuredCardSelector, handSelector) {
    if (cardName != "") {
        // exact match on the name, because autocomplete in director.html should have
        // put an exact name there for us
        $.get("https://api.magicthegathering.io/v1/cards?name=\"" + cardName + "\"",
            function (data) {
                if (data.cards && data.cards.length > 0) {
                    data.cards = _.sortBy(data.cards, function (c) {
                        return sets.indexOf(c.set);
                    });
                    var card = data.cards[0];
                    imageUrl = card.imageUrl;
                    if (card.set && card.number) {
                        // not all cards have a number (e.g. LEA Lightning Bolt)
                        imageUrl = ("http://magiccards.info/scans/en/" + gathererToMagiccardsInfo[card.set]
                                    + "/" + card.number + ".jpg").toLowerCase();
                    }
                    var img = $(featuredCardSelector).find(".img");
                    img.attr("src", imageUrl);
                    img.on("load", function () {
                        $(featuredCardSelector).find(".cardName").text(card.name);
                        $(featuredCardSelector).find(".cardType").text(card.types.join(" "));
                        $(featuredCardSelector).find(".rarityAndSet").text(card.rarity + ", " + card.setName);
                        $(featuredCardSelector).removeClass("offscreen");
                    });
                    img.on("error", function () {
                        if ($(this).attr("src") != card.imageUrl) {
                            // fall back to Gatherer if we unexpectedly have to
                            $(this).attr("src", card.imageUrl)
                        } else {
                            // Gatherer failed too, sandwich time
                            $(this).attr("src", "back.jpg");
                        }
                    });
                }
            });
    } else {
        $(featuredCardSelector).addClass("offscreen");
        $(featuredCardSelector).find(".img").off("load");
        $(featuredCardSelector).find(".img").off("error");
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
