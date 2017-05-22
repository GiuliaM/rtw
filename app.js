var express = require('express'); // Express web server framework
var bodyParser = require('body-parser'); // parses the body of an http-request to JSON
var request = require('superagent');

var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

//app looks in the static folder
app.use('/static', express.static('./static'));

//translate all x-www-form-urlencoded to JSON
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
    res.render('index', {
        items: []
    });
});

app.post('/', function(req, res) {
    var apiUrl = 'https://api.spotify.com/v1/search?type=track&q=' + req.body.searchQuery;

    request
        .get(apiUrl)
        .end(function(err, spotifyData) {
            if(err) {
                console.log(err);
                return res.send(err);
            }

            res.render('index', {
                items: spotifyData.body.tracks.items
            });
        });
});

app.listen(3000, function() {
    console.log('server listening on port 3000');
});
