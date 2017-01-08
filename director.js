var modeRef = firebase.database().ref('mode');
modeRef.on('value', function (v) {
    $("#mode").val(v.val());
});
firebase.database().ref('player1').on('value', function (v) {
    $("#player1_name").val(v.val().name);
    $("#player1_deck").val(v.val().deck);
    $("#player1_life").val(v.val().life);
    $("#player1_poison").val(v.val().poison);
    $("#player1_gamewins").val(v.val().gamewins);
});
firebase.database().ref('player2').on('value', function (v) {
    $("#player2_name").val(v.val().name);
    $("#player2_deck").val(v.val().deck);
    $("#player2_life").val(v.val().life);
    $("#player2_poison").val(v.val().poison);
    $("#player2_gamewins").val(v.val().gamewins);
});
firebase.database().ref('freetext').on('value', function (v) {
    $("#freetext").val(v.val());
});

function adjustVaue(amount) {
    var input = $(this).siblings("input");
    input.val(parseInt(input.val()) + amount).change();
}

$(function () {
    $("#mode").change(function () {
        firebase.database().ref('mode').set($(this).val());
    });
    $("input").change(function () {
        firebase.database().ref($(this).attr("id").replace("_", "/")).set($(this).val());
    });
    $(".plus1").click(function () {
        adjustVaue.call(this, 1);
    });
    $(".plus2").click(function () {
        adjustVaue.call(this, 2);
    });
    $(".plus3").click(function () {
        adjustVaue.call(this, 3);
    });
    $(".minus1").click(function () {
        adjustVaue.call(this, -1);
    });
    $(".minus2").click(function () {
        adjustVaue.call(this, -2);
    });
    $(".minus3").click(function () {
        adjustVaue.call(this, -3);
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
});
