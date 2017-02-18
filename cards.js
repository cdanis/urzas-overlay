function toCost(text, altText) {
    var cost = "&nbsp;";
    if (text) {
        var r = /\{([^\}]+)\}/g;
        var match;
        while (match = r.exec(text)) {
            cost += "<i class='ms ms-cost ms-" + match[1].replace(/\//g, "") +
                ((match[1].includes("/") && !match[1].includes("/P")) ? " ms-split" : "") +
                "'></i>";
        }
    }
    if (altText) {
        cost += "/" + toCost(altText).substring("&nbsp;".length);
    }
    return cost;
}

function fillDeck(outputElt, deck, sideboard) {
    outputElt.empty();
    deck = _.sortBy(deck, function (card) {
        return (card.type.includes("Land") ? "_" : "") + card.name;
    });
    for (var i = 0; i < deck.length; i++) {
        var card = deck[i];
        if (typeof sideboard == "undefined" || card.sideboard == sideboard) {
            var cardElt = $("<div>", {"class": `card bg-${card.plateBackground}`});
            cardElt.append($(`<span class="card-name">${card.count}x ${card.name}</span>`));
            var costElt = $("<span>", {"class": "mana"});
            costElt.html(toCost(card.cost && ("" + card.cost), card.altCost));
            cardElt.prepend(costElt);
            outputElt.append(cardElt);
        }
    }
}

function getDeckText(deck, sideboard) {
    var output = "";
    deck = _.sortBy(deck, function (card) {
        return (card.type.includes("Land") ? "_" : "") + card.name;
    });
    for (var i = 0; i < deck.length; i++) {
        var card = deck[i];
        if (typeof sideboard == "undefined" || card.sideboard == sideboard) {
            output += `${card.count}x ${card.name}\n`;
        }
    }
    return output;
}

var animationQueues = new Map();
var animatingElements = [];

function createCardElt(card) {
    cardElt = $("<div>", {"class": `card bg-${card.plateBackground}`});
    cardElt.append($(`<span class="card-name">${card.name}</span>`));
    cardElt.data("cardName", card.name);
    var costElt = $("<span>", {"class": "mana"});
    costElt.html(toCost(card.cost && ("" + card.cost), card.altCost));
    cardElt.prepend(costElt);
    return cardElt;
}

function fillHand(outputElt, deck) {
    deck = _.sortBy(deck, function (card) {
        return (card.type.includes("Land") ? "_" : "") + card.name;
    });
    if (document.hidden || $(outputElt).is(":hidden")) {
        outputElt.empty();
        for (var i = 0; i < deck.length; i++) {
            var card = deck[i];
            for (var j = 0; j < card.inhand; j++) {
                outputElt.append(createCardElt(card));
            }
        }
    } else {
        if (animatingElements.includes(outputElt[0])) {
            if (!animationQueues.has(outputElt[0])) {
                animationQueues.set(outputElt[0], []);
            }
            animationQueues.get(outputElt[0]).push(function () {
                fillHand(outputElt, deck);
            });
            return;
        }
        animatingElements.push(outputElt[0]);
        var cardPositions = new Map();
        var currentCards = outputElt.find(".card").toArray();
        for (var i = 0; i < currentCards.length; i++) {
            cardPositions.set(currentCards[i], currentCards[i].getBoundingClientRect().top);
        }
        var insertionPoint = 0;
        var transitioningElements = 0;
        for (i = 0; i < deck.length; i++) {
            var card = deck[i];
            for (var j = 0; j < card.inhand; j++) {
                var exists = false;
                var cardElt;
                for (var k = 0; k < currentCards.length; k++) {
                    if ($(currentCards[k]).data("cardName") == card.name) {
                        exists = true;
                        cardElt = currentCards.splice(k, 1)[0];
                        break;
                    }
                }
                if (!exists) {
                    cardElt = createCardElt(card);
                    cardElt.addClass("entering");
                    transitioningElements++;
                }
                if (insertionPoint == 0) {
                    outputElt.prepend(cardElt);
                } else {
                    outputElt.children().eq(insertionPoint - 1).after(cardElt);
                }
                insertionPoint++;
            }
        }
        for (i = 0; i < currentCards.length; i++) {
            var leavingCard = $(currentCards[i]);
            leavingCard.css("top", cardPositions.get(currentCards[i]) + "px");
            leavingCard.addClass("leaving");
            cardPositions.delete(currentCards[i]);
            transitioningElements++;
        }
        window.requestAnimationFrame(function () {
            for (var [card, oldPosition] of cardPositions) {
                var newPosition = card.getBoundingClientRect().top;
                var cardElt = $(card);
                cardElt.css("transform", "translateY(" + (oldPosition - newPosition) + "px)");
                cardElt.css("transition-duration", "0s");
                transitioningElements++;
            }
            window.requestAnimationFrame(function () {
                outputElt.find(".card").removeClass("entering");
                for (var card of cardPositions.keys()) {
                    var cardElt = $(card);
                    cardElt.css("transform", "");
                    cardElt.css("transition-duration", "");
                }
            });
        });
        if (transitioningElements > 0) {
            var transitionedElements = 0;
            outputElt.on("transitionend", function (event) {
                var target = $(event.target);
                if (target.hasClass("leaving")) {
                    target.remove();
                }
                transitionedElements++;
                if (transitioningElements == transitionedElements) {
                    outputElt.off("transitionend");
                    animatingElements.splice(animatingElements.indexOf(outputElt[0]), 1);
                    var queue = animationQueues.get(outputElt[0]);
                    if (queue && queue.length > 0) {
                        queue.shift()();
                    }
                }
            });
        } else {
            animatingElements.splice(animatingElements.indexOf(outputElt[0]), 1);
            var queue = animationQueues.get(outputElt[0]);
            if (queue && queue.length > 0) {
                queue.shift()();
            }
        }
    }
}
