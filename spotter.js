var spotterControlTemplate = _.template(`
<div class="cardControl <% if (count > 0) { %>inHand<% } %>" 
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

function createSpotterControl(card, player, index) {
    var control = $(
        spotterControlTemplate(
            {name: card.name, count: card.inhand, player: player, index: index}));
    control.find(".minus").click(function () {
        decrementCard(player, index);
    });
    control.find(".plus").click(function () {
        incrementCard(player, index);
    });
    return control;
}

function createSpotterControls(cards, deck, player) {
    cards.empty();
    for (var i = 0; i < deck.length; i++) {
        var card = deck[i];
        cards.append(createSpotterControl(card, player, i));
    }
}

firebase.database().ref('player1').on('value', function (v) {
    $("#p1").text(v.val().name);
});
firebase.database().ref('p1deck').on('value', function (v) {
    createSpotterControls($("#cards1"), v.val(), 1);
});
firebase.database().ref('player2').on('value', function (v) {
    $("#p2").text(v.val().name);
});
firebase.database().ref('p2deck').on('value', function (v) {
    createSpotterControls($("#cards2"), v.val(), 2);
});

$(function () {
    $("#p1").click(function () {
        $("#p1").addClass("selected");
        $("#p2").removeClass("selected");
        $("#cards1").show();
        $("#cards2").hide();
    });
    $("#p2").click(function () {
        $("#p2").addClass("selected");
        $("#p1").removeClass("selected");
        $("#cards2").show();
        $("#cards1").hide();
    });
});