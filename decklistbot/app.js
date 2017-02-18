var express = require('express');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var bodyParser = require('body-parser');
var deckimport = require('./deckimport.js');
var firebase = require("firebase-admin");

var app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.post('/', function (req, response) {
    var respUrl = req.body.response_url;
    var query = req.body.text.trim().split(" ");
    var player = query[0];
    var link = query[1];
    request(link, function (error, response, body) {
        var $ = cheerio.load(body);
        var mainboard = "";
        var sideboard = "";
        $(".row.board-container .member").each(function (i, elem) {
            var cardData = $(this).find("a.qty");
            var card = `${cardData.data("qty")}x ${cardData.data("name")}\n`;
            if ($(elem).attr("id").includes("boardContainer-side-")) {
                sideboard += card;
            } else {
                mainboard += card;
            }
        });
        var inSideboard = false;
        $(".tab-pane.active .deck-view-decklist tr").each(function (i, elem) {
            var header = $(elem).find(".deck-header");
            if (header.length) {
                if (header.text().includes("Sideboard")) {
                    inSideboard = true;
                }
            } else {
                var cardText = $(elem).find(".deck-col-qty").text().replace(/\n/g, "").trim() +
                    " " + $(elem).find(".deck-col-card").text().replace(/\n/g, "").trim() +
                    "\n";
                if (inSideboard) {
                    sideboard += cardText;
                } else {
                    mainboard += cardText;
                }
            }
        });
        deckimport.import(player, mainboard, sideboard, firebase, function (url, succ, fail) {
                request(url, function (error, response, body) {
                    if (error) {
                        fail();
                    } else {
                        try {
                            succ(JSON.parse(body));
                        } catch (e) {
                            fail();
                        }
                    }
                });
            },
            function (resp) {
                console.log(respUrl);
                request({uri: respUrl, method: "POST", json: true, body: {response_type: "in_channel", text: resp}},
                    function (error, response, body) {
                        if (error) {
                            console.log(error);
                        }
                        console.log(response);
                        console.log(body);
                    });
            });
    });
    response.json({'response_type': 'in_channel', 'text': 'Importing decklist...'});
});

app.get('/_ah/health', function (req, response) {
    response.send("ok");
});

firebase.initializeApp({
    credential: firebase.credential.cert(require("./account.json")),
    databaseURL: "https://urzaslunchbreak.firebaseio.com",
});

module.exports = app;
