var express = require('express');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var bodyParser = require('body-parser');
var firebase = require('firebase');
var deckimport = require('./deckimport.js');

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
            if ($(elem).attr("id").includes("boardContainer-side-")) {
                sideboard += $(elem).text().replace(/\n/g, "").trim() + "\n";
            } else {
                mainboard += $(elem).text().replace(/\n/g, "").trim() + "\n";
            }
        });
        deckimport.import(player, mainboard, sideboard, firebase, function (url, succ, fail) {
                request(url, function (error, response, body) {
                    if (error) {
                        fail();
                    } else {
                        succ(JSON.parse(body));
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
    apiKey: "AIzaSyDqDSKWpdJJIDBIX5Xq7w24hYss0zliBp8",
    authDomain: "urzaslunchbreak.firebaseapp.com",
    databaseURL: "https://urzaslunchbreak.firebaseio.com",
    storageBucket: ""
});
var firebaseUsername = "urzaslunch@gmail.com";
var firebasePassword = "ElkUtyDtI_tr";
firebase.auth().signInWithEmailAndPassword(firebaseUsername, firebasePassword);

module.exports = app;
