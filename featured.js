firebase.database().ref('p1deck').on('value', function (v) {
    fillDeck($("#player1_cards"), v.val(), undefined, false);
});

firebase.database().ref('p2deck').on('value', function (v) {
    fillDeck($("#player2_cards"), v.val(), undefined, false);
});

$(function () {
    $("#player1_cards").on("click", ".card", function () {
        var card = $(this).text().trim();
        $("#player1_featuredcard").val(card);
        firebase.database().ref("player1/featuredcard").set(card);
    });
    $("#player2_cards").on("click", ".card", function () {
        var card = $(this).text().trim();
        $("#player2_featuredcard").val(card);
        firebase.database().ref("player2/featuredcard").set(card);
    });
});
