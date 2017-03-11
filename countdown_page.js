var timeRef = firebase.database().ref('streamStart');
var timerId = null;
timeRef.on('value', function (v) {
    if (timerId) {
        window.clearInterval(timerId);
    }
    var streamStart = v.val();
    if ($.isNumeric(streamStart) && streamStart > 0) {
        timerId = countdown(streamStart, function (ts) {
            $(".countdown").text(ts.minutes + ":" + ("0" + ts.seconds).slice(-2));
            // Magic string for auto-starting OBS
            if (ts.value >= 0) {
                window.document.title = "ULB GO GO GO GO";
            } else {
                window.document.title = "countdown";
            }
        });
    } else {
        $(".countdown").text("");
    }

});
