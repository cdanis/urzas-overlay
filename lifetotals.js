firebase.database().ref('player1').on('value', function (v) {
    if (v.val()) {
        $("#player1_name").text(v.val().name);
        $("#player1_life").text(v.val().life);

    }
});
firebase.database().ref('player2').on('value', function (v) {
    if (v.val()) {
        $("#player2_name").text(v.val().name);
        $("#player2_life").text(v.val().life);
    }
});

function adjustValue(amount) {
    var life = $(this).siblings(".life");
    var newAmount = parseInt(life.text()) + amount;
    firebase.database().ref($(life).attr("id").replace("_", "/")).set(newAmount);

}

$(function () {
    $(".plus1").click(function () {
        adjustValue.call(this, 1);
    });
    $(".plus2").click(function () {
        adjustValue.call(this, 2);
    });
    $(".plus3").click(function () {
        adjustValue.call(this, 3);
    });
    $(".minus1").click(function () {
        adjustValue.call(this, -1);
    });
    $(".minus2").click(function () {
        adjustValue.call(this, -2);
    });
    $(".minus3").click(function () {
        adjustValue.call(this, -3);
    });
});