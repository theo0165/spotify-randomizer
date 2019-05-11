const express = require('express');
const exphbs = require('express-handlebars');

const app = express();

app.set('views', __dirname + '/views');
app.engine('handlebars', exphbs({defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', 'handlebars')

app.use(express.static(__dirname + '/public'));
app.use(require('./controllers'));

const port = process.env.PORT || 80;

app.listen(port, function(){
    console.log("Listening on port " + port);
})