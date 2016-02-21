// app.get('/blend', function (req, res) {
//
//     // https://instagr.in/blend
//     var blend = instagrin + "/blend/"
//
//     request(blend, function (err, res, html) {
//
//         console.log("Requests all this links: ")
//
//         if (!err && res.statusCode == 200) {
//
//             var $ = cheerio.load(html)
//
//             // Get each blend url and request it.
//
//             $('.blend-title a').each( function (i, elem){
//
//                 url = $(this).attr("href")
//
//                 console.log(instagrin + url)
//
//                 request(instagrin + '/' + url, function (err, res, html) {
//
//                     if (!err && res.statusCode == 200) {
//
//                         console.log("Save all this tokens on 'txt/tokens.txt'")
//
//                         var $ = cheerio.load(html)
//
//                         // Get each access_toekn
//
//                         $('.next_url span').each( function (i, elem){
//
//                             var at = /access_token=(.*)\&count/.exec( $(this).text() )
//                             if(at) at = at[1]
//
//                             console.log(at)
//
//                             fs.appendFile('txt/tokens.txt', at + "\n", function(err){
//
//                             })
//
//                         })
//                     } else console.log(err)
//                 })
//             })
//
//         } else console.log(err)
//     })
//
//     res.end("Check console!")
// })
//
// app.get('/read/:what', function (res, req) {
//
//     var what = req.params.what
//
//     if(what == "urls") {
//
//         // Read .txt and for eachline call FollowInsta or FollowToken
//
//         fs.readFile('txt/' + what + '.txt', {encoding: 'utf-8', flag: 'rs'}, function(e, data) {
//             if (e) return console.log(e)
//             else { console.log("File readed.") }
//
//             data = data.split("\n").slice(0, -1)
//
//             for (var i in data) {
//
//                 url = data[i]
//
//                 console.log(i + " > " + url)
//
//                 followInsta(url)
//             }
//         })
//
//     } else if (what == "tokens") {
//
//         fs.readFile('txt/tokens.txt', {encoding: 'utf-8', flag: 'rs'}, function(e, data) {
//             if (e) return console.log(e)
//             else { console.log("File readed.") }
//
//             data = data.split("\n").slice(0, -1)
//
//             // For every line in txt file
//             for (var i in data) {
//
//                 // get the url
//                 url = data[i]
//                 // Call follow with Token
//                 followToken(url)
//             }
//         })
//     } else res.end("Bad :what parameter")
//
//     res.end("Check console and 'txt/" + what + ".txt'")
//
// })
//
// app.get('/readtokens', function (res, req) {
//
//     fs.readFile('txt/tokens.txt', {encoding: 'utf-8', flag: 'rs'}, function(e, data) {
//         if (e) return console.log(e)
//         else { console.log("File readed.") }
//
//         data = data.split("\n").slice(0, -1)
//
//         // For every line in txt file
//         for (var i in data) {
//
//             // get the url
//             url = data[i]
//             // Call follow with Token
//             followToken(url)
//         }
//     })
//
//     res.end("Check console and 'txt/tokens.txt'")
//
// })
//
//
// function followInsta (url) {
//
//         // Request url and get at
//
//         request(url, function (err, res, html) {
//
//             if (!err && res.statusCode == 200) {
//
//                 // Get with cheerio(jQuery for serverside)
//                 // $('.next_url')
//
//                 var $ = cheerio.load(html)
//
//                 var access_token
//                 $('.next_url').filter(function(){
//                        var data = $(this)
//                        access_token = data.text()
//                 })
//
//                 // Regex /=(.*)&c/ with base64 decode
//                 var at = /=(.*)&c/.exec(decode(access_token))
//                 if(at) at = at[1]
//
//                 // Call follow with Token
//                 followToken(at)
//             }
//         })
// }
//
// // to implement: Proxy the instagram requests for bypassing 20req/h
// function followToken(at) {
//
//     if (at) {
//         // Access instagram api with 'at' access_token
//         insta.use({
//             access_token: at,
//         })
//
//         // Do the request via instagram api for follow {user_id}
//         insta.set_user_relationship('{user_id}', 'follow', function (err, result, remaining, limit) {
//             if(err) {
//                 console.log("Error " + err.code + ": "  + err.error_message)
//             } else {
//                 console.log("Result: ")
//                 console.log(result)
//                 console.log("-------")
//             }
//         })
//     }
// }
//
// var port = process.env.PORT || 3000
//
// app.listen(port, function () {
//   console.log('Magic happens on port %d', port)
// })
//
// exports = module.exports = app
