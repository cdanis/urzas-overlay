var deckLine = /^(\d+) ?x? *(.*)$/g;

function parseDeck(text, deck, output, sideboard, callback, requestor) {
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
                if (name.includes("/")) {
                    name = name.split("/")[0].trim();
                }
                counts[name.toLowerCase()] = count;
                names.push(name);
            }
        }
    }
    doRequest(names, counts, deck, output, sideboard, callback, 0, requestor);
}

function doRequest(names, counts, deck, output, sideboard, callback, page, requestor) {
    requestor("https://api.magicthegathering.io/v1/cards?page=" + page + "&name=" + names.join("|"),
        function (data) {
            for (i = 0; i < data.cards.length; i++) {
                var card = data.cards[i];
                if (counts.hasOwnProperty(card.name.toLowerCase())) {
                    var name = card.name;
                    var cost = card.manaCost || "";
                    var altCost = "";
                    if (card.layout == "split") {
                        name = card.names.join("//");
                        var altCostMatch = card.originalText.match(new RegExp("//\n" + card.names[1] + "\n([^\n]+)"));
                        if (altCostMatch && altCostMatch.length > 1) {
                            altCost = altCostMatch[1];
                        }
                    }
                    var cardOut = {
                        name: name,
                        type: card.type,
                        plateBackground: getNameplateBackgroundColor(card),
                        cost: cost,
                        altCost: altCost,
                        count: counts[card.name.toLowerCase()],
                        inhand: 0,
                        sideboard: sideboard
                    };
                    if (altCost) {
                        cardOut.altCost = altCost;
                    }
                    deck.push(cardOut);
                    delete counts[card.name.toLowerCase()];
                }
            }
            if (deck.length != names.length) {
                if (page > 20) {
                    output("Ended up with wrong number of cards");
                    deck = [];
                    callback();
                } else {
                    doRequest(names, counts, deck, output, sideboard, callback, page + 1, requestor);
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
        },
        function () {
            output("Request failed");
            deck = [];
            callback();
        });
}

if (typeof window !== "undefined") {

    firebase.database().ref('player1').on('value', function (v) {
        $("#p1").find(".name").text(v.val().name);
    });
    firebase.database().ref('player2').on('value', function (v) {
        $("#p2").find(".name").text(v.val().name);
    });
    firebase.database().ref('p1deck').on('value', function (v) {
        if (v.val()) {
            var p1 = $("#p1");
            fillDeck(p1.find(".deck"), v.val());
            p1.find(".maindeck").val(getDeckText(v.val(), false));
            p1.find(".sideboard").val(getDeckText(v.val(), true));
        }
    });
    firebase.database().ref('p2deck').on('value', function (v) {
        if (v.val()) {
            var p2 = $("#p2");
            fillDeck(p2.find(".deck"), v.val());
            p2.find(".maindeck").val(getDeckText(v.val(), false));
            p2.find(".sideboard").val(getDeckText(v.val(), true));
        }
    });

    $(function () {
        $(".import").click(function () {
            var output = $(this).siblings(".output");
            output.empty();
            output.append($("<div>Importing...</div>"));
            var outputFun = function (text) {
                output.append($("<div class='error'>" + text + "</div>"));
            };
            var maindeck = [];
            var sideboard = [];
            var importButton = $(this);
            var requestor = function (url, succ, fail) {
                $.get(url, succ).fail(fail);
            };
            parseDeck(importButton.siblings("textarea.maindeck").val(), maindeck, outputFun, false, function () {
                parseDeck(importButton.siblings("textarea.sideboard").val(), sideboard, outputFun, true, function () {
                    if (maindeck && sideboard) {
                        firebase.database().ref(importButton.data("player")).set(maindeck.concat(sideboard));
                        output.append($("<div>Import ok!</div>"));
                    } else {
                        output.append($("<div class='error'>Errors, not imported</div>"));
                    }
                }, requestor);
            }, requestor);
        });
    });
}

function getNameplateBackgroundColor(card) {
    if (card.type && card.type.includes('Land')) {
        if (card.supertypes && card.supertypes.includes('Basic')) {
            // Basic land
            return basicLandNameToBackgroundColorType(card.name);
        } else {
            // Nonbasic land
            return 'land';
        }
    } else if (card.colors && card.colors.length > 0) {
        if (card.colors.length >= 2) {
            // Multicolor
            return 'multicolor';
        } else {
            // Single color
            return card.colors[0].toLowerCase();
        }
    } else {
        if (card.types && card.types.includes('Artifact')) {
            // Artifact
            return 'artifact';
        } else {
            // Colorless
            return 'colorless';
        }
    }
}

function basicLandNameToBackgroundColorType(basicLandName) {
    switch (basicLandName) {
        case 'Plains':
            return 'white';
        case 'Island':
            return 'blue';
        case 'Swamp':
            return 'black';
        case 'Mountain':
            return 'red';
        case 'Forest':
            return 'green';
        default:
            return 'unknown';
    }
}

(function (exports) {

    exports.import = function (player, maindeckText, sideboardText, firebase, requestor, finished) {
        var maindeck = [];
        var sideboard = [];
        var output = "";
        var outputFun = function (text) {
            output += text;
        };
        parseDeck(maindeckText, maindeck, outputFun, false, function () {
            parseDeck(sideboardText, sideboard, outputFun, true, function () {
                if (maindeck && sideboard) {
                    firebase.database().ref(player + "deck").set(maindeck.concat(sideboard), function (error) {
                        if (error) {
                            finished("Error writing to database: " + error);
                        } else {
                            finished("Import ok! " + output);
                        }
                    });
                } else {
                    finished("Errors, not imported. " + output);
                }
            }, requestor);
        }, requestor);
    };

}(typeof exports === 'undefined' ? this.deckimport = {} : exports));