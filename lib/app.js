var PORT = 8080;
var express = require('express');
var app = express();

app.use(express.static('./public'));

app.set('view engine', 'jade');
app.set('views', './lib/views');

app.route('/')
    .get(function (req, res) {
        res.render('layout')
    });

var srv = app.listen(PORT, function () {
    console.log('Listening on ' + PORT);
});

app.use('/peerjs', require('peer').ExpressPeerServer(srv, {
    debug: true
}));