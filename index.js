const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');

require('dotenv').config()

const app = express();

app.set('views', __dirname + '/views');
app.engine('hbs', exphbs({defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', 'hbs')

app.use(bodyParser.urlencoded({extended: true}))
app.use(session({
    secret: "secret",
    resave:false,
    saveUninitialized:false,
    cookie: { maxAge: 60000 }
}))
app.use(express.static(__dirname + '/public'));
app.use(require('./controllers'));

app.use(function(req, res, next){
    res.status(404);
  
    // respond with html page
    if (req.accepts('html')) {
      res.render('404', { url: req.url });
      return;
    }
  
    // respond with json
    if (req.accepts('json')) {
      res.send({ error: 'Not found' });
      return;
    }
  
    // default to plain-text. send()
    res.type('txt').send('Not found');
});

const port = process.env.PORT || 80;

app.listen(port, function(){
    console.log("Listening on port " + port);
})