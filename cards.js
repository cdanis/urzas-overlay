function toCost(text) {
    var cost = "&nbsp;";
    if (text) {
        for (var i = 0; i < text.length; i++) {
            var symbol = text[i];
            if (i + 2 < text.length && text[i + 1] == "/") {
                symbol += text[i + 2];
                i += 2;
            }
            cost += "<i class='ms ms-cost ms-" + symbol + "'></i>";
        }
    }
    return cost;
}

function fillHand(handElt, deck) {
    fillCards(handElt, deck, 1);
}

function fillDeck(deckElt, deck) {
    fillCards(deckElt, deck, 0);
}

function fillCards(outputElt, deck, minInHand) {
    outputElt.empty();
    for (var i = 0; i < deck.length; i++) {
        var card = deck[i];
        if (card.inhand >= minInHand) {
            for (var j = 0; j < card.inhand || (minInHand == 0 && j == 0); j++) {
                var cardElt = $("<div>", {"class": "card"});
                cardElt.text(card.name);
                var costElt = $("<span>", {"class": "mana"});
                costElt.html(toCost(card.cost && ("" + card.cost)));
                cardElt.append(costElt);
                outputElt.append(cardElt);
            }
        }
    }
}

function showSideboard(sideboardElt, deck) {
    var text = "";
    for (var i = 0; i < deck.length; i++) {
        var card = deck[i];
        if (card.sideboard) {
            text += card.count + " " + card.name + "\n";
        }
    }
    sideboardElt.text(text);
}