var spotterControlTemplate = _.template(`
<div class="cardControl <% if (count > 0) { %>inHand<% } %> <% if (sideboard) { %>sideboard<% } %> <%= color %>" 
        id="card_<%= player %>_<%= index %>">
    <div class="minus button">-</div>
    <div class="name"><%= name %></div>
    <div class="count"><%= count %></div>
    <div class="plus button">+</div>
</div>
`);

function updateValue(player, index, newVal) {
    var updateVal = {};
    updateVal["p" + player + "deck/" + index + "/inhand"] = newVal;
    firebase.database().ref().update(updateVal);
}

function decrementCard(player, index) {
    var newVal = parseInt($("#card_" + player + "_" + index + " .count").text()) - 1;
    if (newVal < 0) {
        newVal = 0;
    }
    updateValue(player, index, newVal);
}

function incrementCard(player, index) {
    var newVal = parseInt($("#card_" + player + "_" + index + " .count").text()) + 1;
    updateValue(player, index, newVal);
}

function createSpotterControl(card, player) {
    var control = $(
        spotterControlTemplate(
            {
                name: card.name,
                count: card.inhand,
                color: card.color,
                sideboard: card.sideboard,
                player: player,
                index: card.index
            }));
    control.find(".minus").click(function () {
        decrementCard(player, card.index);
    });
    control.find(".plus").click(function () {
        incrementCard(player, card.index);
    });
    control.find(".name").prepend("<span class='mana'>" + toCost(card.cost, card.altCost) + "</span>");
    return control;
}

function createSpotterControls(lands, cards, deck, player) {
    lands.empty();
    cards.empty();
    var deckSorted = _.sortBy(deck, function (card) {
        return card.name + (card.sideboard ? "s" : "");
    });
    var cardsCreated = [];

    function createControls(output, deck) {
        for (var i = 0; i < deck.length; i++) {
            var card = deck[i];
            if (cardsCreated.indexOf(card.name) != -1) {
                continue;
            }
            output.append(createSpotterControl(card, player));
            cardsCreated.push(card.name);
        }
    }

    createControls(lands, _.filter(deckSorted, function (card) {
        return card.type.includes("Land");
    }));
    createControls(cards, _.filter(deckSorted, function (card) {
        return !card.type.includes("Land");
    }));
}

function cardsInHand(deck) {
    return _.reduce(deck, function (memo, card) {
        return memo + card.inhand;
    }, 0);
}

var p1wins = 0;
var p2wins = 0;
function updateGame() {
    $("body").toggleClass("game1", p1wins + p2wins == 0);
}

firebase.database().ref('player1').on('value', function (v) {
    $("#p1").text(v.val().name);
    p1wins = v.val().gamewins;
    updateGame();
});
firebase.database().ref('p1deck').on('value', function (v) {
    var p1tab = $("#p1tab");
    var deck = _.map(v.val(), function(card, idx) { card['index'] = idx; return card; });
    createSpotterControls(p1tab.find(".lands"), p1tab.find(".cards"), deck, 1);
    p1tab.find(".total").text(cardsInHand(deck) + " in hand");
});
firebase.database().ref('player2').on('value', function (v) {
    $("#p2").text(v.val().name);
    p2wins = v.val().gamewins;
    updateGame();
});
firebase.database().ref('p2deck').on('value', function (v) {
    var p2tab = $("#p2tab");
    var deck = _.map(v.val(), function(card, idx) { card['index'] = idx; return card; });
    createSpotterControls(p2tab.find(".lands"), p2tab.find(".cards"), deck, 2);
    p2tab.find(".total").text(cardsInHand(deck) + " in hand");
});

$(function () {
    $("#p1").click(function () {
        $("#p1").addClass("selected");
        $("#p2").removeClass("selected");
        $("#p1tab").show();
        $("#p2tab").hide();
    });
    $("#p2").click(function () {
        $("#p2").addClass("selected");
        $("#p1").removeClass("selected");
        $("#p2tab").show();
        $("#p1tab").hide();
    });
    $(".reset").click(function () {
        firebase.database().ref($(this).data('player')).transaction(
            function (deck) {
                if (deck) {
                    for (var i = 0; i < deck.length; i++) {
                        deck[i].inhand = 0;
                    }
                }
                return deck;
            }
        );
    });
});