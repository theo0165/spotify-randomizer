const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');

const app = express();

app.set('views', __dirname + '/views');
app.engine('hbs', exphbs({defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', 'hbs')

app.use(session({
    secret: "secret",
    resave:false,
    saveUninitialized:false,
    cookie: { maxAge: 60000 }
}))
app.use(express.static(__dirname + '/public'));
app.use(require('./controllers'));

const port = process.env.PORT || 80;

app.listen(port, function(){
    console.log("Listening on port " + port);
})