var modeRef = firebase.database().ref('mode');
modeRef.on('value', function (v) {
    var modes = v.val();
    for (mode in modes) {
        if (modes.hasOwnProperty(mode)) {
            $("#" + mode).toggleClass("inactive", !modes[mode]);
            if (mode == "chyron") {
                if (modes[mode] == "single") {
                    $("#chyronSingle").css("opacity", 1);
                    $("#chyronLeft").css("opacity", 0);
                    $("#chyronRight").css("opacity", 0);
                    $("#chyron").find(".logo").css("opacity", 0);
                } else {
                    $("#chyronSingle").css("opacity", 0);
                    $("#chyronLeft").css("opacity", 1);
                    $("#chyronRight").css("opacity", 1);
                    $("#chyron").find(".logo").css("opacity", 1);
                }
            }
        }
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

function fillFeaturedCard(cardName, featuredCardSelector) {
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
                    var imageUrl = card.imageUrl;
                    if (card.set && card.number) {
                        // not all cards have a number (e.g. LEA Lightning Bolt)
                        imageUrl = ("http://magiccards.info/scans/en/" + gathererToMagiccardsInfo[card.set]
                                    + "/" + card.number + ".jpg").toLowerCase();
                    }
                    var setReq = Promise.resolve(null);
                    if (card.set) {
                        setReq = $.get("https://api.magicthegathering.io/v1/sets/" + card.set);
                    }
                    var img = $(featuredCardSelector).find(".img");
                    img.attr("src", imageUrl);
                    img.one("load", function () {
                        setReq.done(function (data) {
                            $(featuredCardSelector).find(".rarityAndSet").text(
                                card.rarity + ", " + card.setName +
                                (data && data.set ? " (" + data.set.releaseDate.substring(0, 4) + ")" : ""));
                            $(featuredCardSelector).removeClass("offscreen");
                        })
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

function updateValue(elt, newValue, toggleOnZero) {
    if (!elt.text() || elt.text() != newValue) {
        var event;
        var duration;
        if (elt.css("transition-duration") != "0s") {
            event = "transitionend";
            duration = elt.css("transition-duration");
        } else if (elt.css("animation-duration") != "0s") {
            event = "animationend";
            duration = elt.css("animation-duration");
        }
        if (event) {
            duration = parseFloat(duration.substring(0, duration.length - 1)) * 1000;
            elt.off(event);
            elt.addClass("updating");
            var fallback;
            var update = function () {
                elt.text(newValue == "inf" ? "∞" : newValue);
                elt.removeClass("updating");
                elt.off(event);
                if (toggleOnZero) {
                    elt.toggle(newValue == "inf" || !!parseInt(newValue));
                }
                clearTimeout(fallback);
            };
            fallback = setTimeout(update, duration);
            elt.on(event, update);
        } else {
            elt.text(newValue);
        }
    }
}

// Update life totals, with debouncing
var updateP1Numbers = _.debounce(function(v) {
    updateValue($(".p1.life"), v.val().life);
    updateValue($(".p1.poison"), v.val().poison, true);
    if (v.val().gamewins > 0) {
        updateValue($(".p1.wins"), v.val().gamewins);
    } else {
        $(".p1.wins").text(v.val().gamewins);
    }
}, 1000);

var updateP2Numbers = _.debounce(function(v) {
    updateValue($(".p2.life"), v.val().life);
    updateValue($(".p2.poison"), v.val().poison, true);
    if (v.val().gamewins > 0) {
        updateValue($(".p2.wins"), v.val().gamewins);
    } else {
        $(".p2.wins").text(v.val().gamewins);
    }
}, 1000);

firebase.database().ref('player1').on('value', function (v) {
    updateP1Numbers(v);
    $(".p1.name").text(v.val().name);
    $(".p1.deck").text(v.val().deck);
    fillFeaturedCard(v.val().featuredcard, ".p1.featuredcard");
});
firebase.database().ref('p1deck').on('value', function (v) {
    var handElt = $(".p1.hand");
    fillHand(handElt, v.val());
    fillDeck($(".p1.sideboard"), v.val(), true);
});
firebase.database().ref('player2').on('value', function (v) {
    updateP2Numbers(v);
    $(".p2.name").text(v.val().name);
    $(".p2.deck").text(v.val().deck);
    fillFeaturedCard(v.val().featuredcard, ".p2.featuredcard");
});
firebase.database().ref('p2deck').on('value', function (v) {
    var handElt = $(".p2.hand");
    fillHand(handElt, v.val());
    fillDeck($(".p2.sideboard"), v.val(), true);
});
firebase.database().ref('chyron').on('value', function (v) {
    var single = $("#chyronSingle");
    single.text(v.val().single);
    single.removeData("Emoji");
    single.Emoji({path: 'https://rodrigopolo.github.io/jqueryemoji/img/apple72/'});
    $("#chyronLeft").text(v.val().left);
    $("#chyronRight").text(v.val().right);
});
