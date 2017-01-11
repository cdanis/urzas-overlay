var cards;

window.mtgjsoncallback = function (data, name) {
    cards = data;
};

var deckLine = /^(\d+)x? *(.*)$/g;

function parseDeck(text, output, sideboard) {
    var error = false;
    var deck = [];
    var lines = text.split("\n");
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line.length > 0) {
            deckLine.lastIndex = 0;
            var match = deckLine.exec(line);
            if (match) {
                var count = parseInt(match[1]);
                var name = match[2];
                var found = false;
                for (cardName in cards) {
                    if (cards.hasOwnProperty(cardName) &&
                        cardName.toLowerCase() == name.toLowerCase()) {
                        var card = cards[cardName];
                        deck.push({
                            name: cardName,
                            cost: card.manaCost ? card.manaCost.replace(/[{}]/g, "") : "",
                            count: count,
                            inhand: 0,
                            sideboard: sideboard
                        });
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    output.append($("<div class='error'>Not found: " + name + "</div>"));
                    error = true;
                }
            }
        }
    }
    return error ? false : deck;
}

firebase.database().ref('player1').on('value', function (v) {
    $("#p1").find(".name").text(v.val().name);
});
firebase.database().ref('player2').on('value', function (v) {
    $("#p2").find(".name").text(v.val().name);
});
firebase.database().ref('p1deck').on('value', function (v) {
    fillDeck($("#p1").find(".deck"), v.val());
});
firebase.database().ref('p2deck').on('value', function (v) {
    fillDeck($("#p2").find(".deck"), v.val());
});

$(function () {
    $(".import").click(function () {
        var output = $(this).siblings(".output");
        output.empty();
        var maindeck = parseDeck($(this).siblings("textarea.maindeck").val(), output, false);
        var sideboard = parseDeck($(this).siblings("textarea.sideboard").val(), output, true);
        if (maindeck && sideboard) {
            firebase.database().ref($(this).data("player")).set(maindeck.concat(sideboard));
            output.append($("<div>Import ok!</div>"));
        } else {
            output.append($("<div class='error'>Errors, not imported</div>"));
        }
    });
});