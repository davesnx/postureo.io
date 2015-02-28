var express       = require('express');
var fs            = require('fs');
var http          = require('http');
var request       = require('request');
var cheerio       = require('cheerio');
var google        = require('google');
var insta         = require('instagram-node').instagram({});
var base64_decode = require('base64').decode;
var app           = express();

var instagrin = "https://instagr.in/";

// to implement: Proxy the google requests for bypassing Google restiction
app.get('/scrape', function (req, res) {

    // The same search via CLI if install google in global mode
    // "google -q 'site:instagr.in intext:recent?access_token -p 1 -n 10"

    google.resultsPerPage = 25;
    var nextCounter = 0;
    
    var query = 'site:"instagr.in" intext:"recent?access_token"';

    google(query, function (err, next, links) {

      if (err) { console.error(err.error_message); }

      if (links) {

        for (var i = 0; i < links.length; ++i) {

          // console.log(links[i].link);

          // Write links in .txt
          fs.appendFile('txt/access_tokens.txt', links[i].link + "\n", function(err){
                console.log(links[i].link + ' added');
          });
        }
        
        if (nextCounter < 4) {
          nextCounter += 1;
          if (next) next();
        }

       } 
    });
});

app.get('/blend', function (req, res) {
    
    // https://instagr.in/blend
    var blend = instagrin + "blend/";

    request(blend, function (err, res, html) {

        if (!err && res.statusCode == 200) {

            var $ = cheerio.load(html);

            // Get each blend url and request it.

            $('.blend-title a').each( function (i, elem){
                
                url = $(this).attr("href");

                request(instagrin + url, function (err, res, html) {

                    if (!err && res.statusCode == 200) {

                        var $ = cheerio.load(html);

                        // Get each access_toekn

                        $('.next_url span').each( function (i, elem){

                            var at = /access_token=(.*)\&count/.exec( $(this).text() );
                            if(at) at = at[1];

                            // console.log(at);

                            fs.appendFile('blend_urls.txt', at + "\n", function(err){

                            });

                        });
                    } else console.log(err);
                });
            });

        } else console.log(err);
    });
});

app.get('/readFile', function() {

    fs.readFile('txt/access_tokens.txt', {encoding: 'utf-8', flag: 'rs'}, function(e, data) {
        if (e) return console.log(e);
        else { console.log("File readed."); }

        data = data.split("\n").slice(0, -1);

        for (var i in data) {

            url = data[i];

            console.log(i + " > " + url);

            followInsta(url);
        }
    });

});

app.get('/readBlend', function() {

    fs.readFile('txt/100_blend_urls.txt', {encoding: 'utf-8', flag: 'rs'}, function(e, data) {
        if (e) return console.log(e);
        else { console.log("File readed."); }

        data = data.split("\n").slice(0, -1);

        // For every line in txt file
        for (var i in data) {

            // get the url
            url = data[i];
            // Call follow with Token
            followToken(url);

        }
    });

});


function followInsta (url) {

        request(url, function (err, res, html) {

            if (!err && res.statusCode == 200) {

                // Get with cheerio(jQuery for serverside) 
                // $('.next_url')

                var $ = cheerio.load(html);

                var access_token;
                $('.next_url').filter(function(){
                       var data = $(this);
                       access_token = data.text();
                });

                // Regex /=(.*)&c/ with base64 decode
                var at = /=(.*)&c/.exec(base64_decode(access_token));
                if(at) at = at[1];
                
                // Call follow with Token
                followToken(at);     
            }
        })
}

// to implement: Proxy the instagram requests for bypassing 20req/h
function followToken(at) {

    if (at) {
        // Access instagram api with 'at' acces_token
        insta.use({
            access_token: at,
        });

        // Do the request via instagram api for follow {user_id}
        insta.set_user_relationship('{user_id}', 'follow', function (err, result, remaining, limit) {
            if(err) {
                console.log("Error " + err.code + ": "  + err.error_message);
            } else {
                console.log("Result: ");
                console.log(result);
                console.log("-------");
            }                        
        });
    }
}

var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('Magic happens on port %d', port);
});

exports = module.exports = app;
