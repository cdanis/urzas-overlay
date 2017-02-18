var modeRef = firebase.database().ref('mode');
modeRef.on('value', function (v) {
    $("#mode").val(v.val());
});
firebase.database().ref('player1').on('value', function (v) {
    if (v.val()) {
        $("#player1_name").val(v.val().name);
        $("#player1_deck").val(v.val().deck);
        $("#player1_life").val(v.val().life);
        $("#player1_poison").val(v.val().poison);
        $("#player1_gamewins").val(v.val().gamewins);
        $("#player1_featuredcard").val(v.val().featuredcard);

    }
});
firebase.database().ref('player2').on('value', function (v) {
    if (v.val()) {
        $("#player2_name").val(v.val().name);
        $("#player2_deck").val(v.val().deck);
        $("#player2_life").val(v.val().life);
        $("#player2_poison").val(v.val().poison);
        $("#player2_gamewins").val(v.val().gamewins);
        $("#player2_featuredcard").val(v.val().featuredcard);
    }
});
firebase.database().ref('chyron').on('value', function (v) {
    $("#chyron_single").val(v.val().single);
    $("#chyron_left").val(v.val().left);
    $("#chyron_right").val(v.val().right);
});

function adjustValue(amount) {
    var input = $(this).siblings("input");
    input.val((parseInt(input.val()) || 0) + amount).change();
}

$(function () {
    $("#player1_featuredcard, #player2_featuredcard").autocomplete({
        minLength: 3,
        source: function(request, response) {
            $.get("https://api.magicthegathering.io/v1/cards?name=" + request.term,
                function(data) {
                    response(_.uniq(_.map(data.cards, function(x) { return x.name })))
                })
        },
        select: function(event, ui) {
            firebase.database().ref($(this).attr("id").replace("_", "/")).set(ui.item.value);
        },
    });
    $("#mode").change(function () {
        firebase.database().ref('mode').set($(this).val());
    });
    // don't stomp on the autocomplete change eventhandler
    $("input[id!='player1_featuredcard'][id!='player2_featuredcard'], textarea").change(function () {
        firebase.database().ref($(this).attr("id").replace("_", "/")).set($(this).val());
    });
    $(".clear").click(function () {
        var input = $(this).siblings("input");
        input.val("");
        firebase.database().ref(input.attr("id").replace("_", "/")).set(input.val());
    });
    $(".plus1").click(function () {
        adjustValue.call(this, 1);
    });
    $(".plus5").click(function () {
        adjustValue.call(this, 5);
    });
    $(".minus1").click(function () {
        adjustValue.call(this, -1);
    });
    $(".minus5").click(function () {
        adjustValue.call(this, -5);
    });
    $(".infinity").click(function () {
        var input = $(this).siblings("input");
        input.val("∞").change();
    });
    $(".win").click(function () {
        var values = {};
        values["player1/life"] = 20;
        values["player1/poison"] = 0;
        values["player2/life"] = 20;
        values["player2/poison"] = 0;
        values[$(this).data("winner") + "/gamewins"] =
            parseInt($(this).siblings(".gamewins").val()) + 1;
        firebase.database().ref().update(values);
    });
    $(".preset-option").click(function () {
        $(this).siblings("textarea").val($(this).text()).change();
    });
    $(".swap").click(function () {
        firebase.database().ref().transaction(function (data) {
            if (data) {
                var tmp = data.player1.name;
                data.player1.name = data.player2.name;
                data.player2.name = tmp;

                tmp = data.player1.deck;
                data.player1.deck = data.player2.deck;
                data.player2.deck = tmp;

                tmp = data.p1deck;
                data.p1deck = data.p2deck;
                data.p2deck = tmp;
            }
            return data;
        });
    });
});
