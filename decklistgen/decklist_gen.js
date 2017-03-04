var fs = require('fs');
var firebase = require('firebase');
var moment = require('moment');
var spliceString = require('splice-string');

function gen() {
    console.log("Generating decklist page...");
    var config = {
        apiKey: "AIzaSyDqDSKWpdJJIDBIX5Xq7w24hYss0zliBp8",
        authDomain: "urzaslunchbreak.firebaseapp.com",
        databaseURL: "https://urzaslunchbreak.firebaseio.com",
        storageBucket: "",
    };

    firebase.initializeApp(config);

    firebase.database().ref().once('value', function (v) {
        console.log("Read values from database.");
        var decklistHtml = fs.readFileSync("../decklist.html", "utf8");
        decklistHtml = spliceString(decklistHtml, decklistHtml.indexOf("<!-- DATE -->"), 0,
            `<div class="date">${moment().format("MMMM Do YYYY")}</div>`);
        var startScript = decklistHtml.indexOf("<!-- SCRIPT_START -->");
        var endScript = decklistHtml.indexOf("<!-- SCRIPT_END -->");
        var data = v.val();
        var script = `<script type="text/javascript">
        $(function() {
            var p1 = $("#p1");
            var p2 = $("#p2");
            p1.find(".player-name").text("${data.player1.name}");
            p2.find(".player-name").text("${data.player2.name}");
            p1.find(".deck-name").text("${data.player1.deck}");
            p2.find(".deck-name").text("${data.player2.deck}");
            fillDeck(p1.find(".deck"), ${JSON.stringify(data.p1deck)}, false);
            fillDeck(p1.find(".side"), ${JSON.stringify(data.p1deck)}, true);
            fillDeck(p2.find(".deck"), ${JSON.stringify(data.p2deck)}, false);
            fillDeck(p2.find(".side"), ${JSON.stringify(data.p2deck)}, true);            
        })
        </script>`;
        decklistHtml = spliceString(decklistHtml, startScript, endScript - startScript, script);

        fs.writeFileSync(`../decklist-${moment().format("YYYY-MM-DD")}.html`, decklistHtml);
        console.log(`Wrote to decklist-${moment().format("YYYY-MM-DD")}.html`);
    });
}

module.exports = function () {
    gen();
};
require('make-runnable');