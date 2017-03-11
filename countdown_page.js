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
        });
    } else {
        $(".countdown").text("");
    }

});
