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
            for (var j = 0; j < card.inhand; j++) {
                var cardElt = $("<div>", {"class": "card"});
                cardElt.text(card.name);
                var costElt = $("<span>", {"class": "mana"});
                costElt.html(toCost(card.cost && ("" + card.cost)));
                cardElt.append(costElt);
                handElt.append(cardElt);
            }
        }
    }
}
