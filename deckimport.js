var deckLine = /^(\d+) ?x? *(.*)$/g;

function parseDeck(text, deck, output, sideboard, callback) {
    var lines = text.split("\n");
    var names = [];
    var counts = {};
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line.length > 0) {
            deckLine.lastIndex = 0;
            var match = deckLine.exec(line);
            if (match) {
                var count = parseInt(match[1]);
                var name = match[2];
                counts[name.toLowerCase()] = count;
                names.push(name);
            }
        }
    }
    doRequest(names, counts, deck, output, sideboard, callback, 0);
}

function doRequest(names, counts, deck, output, sideboard, callback, page) {
    $.get("https://api.magicthegathering.io/v1/cards?page=" + page + "&name=" + names.join("|"),
        function (data) {
            for (i = 0; i < data.cards.length; i++) {
                var card = data.cards[i];
                if (counts.hasOwnProperty(card.name.toLowerCase())) {
                    var color;
                    if (!card.colorIdentity) {
                        color = "C";
                    } else if (card.colorIdentity.length == 1) {
                        color = card.colorIdentity[0];
                    } else {
                        color = "M";
                    }
                    deck.push({
                        name: card.name,
                        color: color,
                        cost: card.manaCost || "",
                        count: counts[card.name.toLowerCase()],
                        inhand: 0,
                        sideboard: sideboard
                    });
                    delete counts[card.name.toLowerCase()];
                }
            }
            if (deck.length != names.length) {
                if (page > 20) {
                    output.append($("<div class='error'>Ended up with wrong number of cards</div>"));
                    deck = [];
                    callback();
                } else {
                    doRequest(names, counts, deck, output, sideboard, callback, page + 1);
                }
            } else {
                deck.sort(function (c1, c2) {
                    if (c1.name < c2.name) {
                        return -1;
                    } else if (c2.name < c1.name) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                callback();
            }
        })
        .fail(function () {
            output.append($("<div class='error'>Request failed</div>"));
            deck = [];
            callback();
        });
}

firebase.database().ref('player1').on('value', function (v) {
    $("#p1").find(".name").text(v.val().name);
});
firebase.database().ref('player2').on('value', function (v) {
    $("#p2").find(".name").text(v.val().name);
});
firebase.database().ref('p1deck').on('value', function (v) {
    if (v.val()) {
        fillDeck($("#p1").find(".deck"), v.val());
    }
});
firebase.database().ref('p2deck').on('value', function (v) {
    if (v.val()) {
        fillDeck($("#p2").find(".deck"), v.val());
    }
});

$(function () {
    $(".import").click(function () {
        var output = $(this).siblings(".output");
        output.empty();
        output.append($("<div>Importing...</div>"));
        var maindeck = [];
        var sideboard = [];
        var importButton = $(this);
        parseDeck(importButton.siblings("textarea.maindeck").val(), maindeck, output, false, function () {
            parseDeck(importButton.siblings("textarea.sideboard").val(), sideboard, output, true, function () {
                if (maindeck && sideboard) {
                    firebase.database().ref(importButton.data("player")).set(maindeck.concat(sideboard));
                    output.append($("<div>Import ok!</div>"));
                } else {
                    output.append($("<div class='error'>Errors, not imported</div>"));
                }
            });
        });
    });
});