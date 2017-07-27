const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

mongoose.Promise = global.Promise; 
mongoose.connect('mongodb://localhost/url_shortener', {
	useMongoClient: true
});
app.use(express.static('public'));

// MONGOOSE CONFIG
const siteSchema = new mongoose.Schema({
	long: String,
	short: String
});

const Site = mongoose.model('Site', siteSchema);

// Site.create({
// 	long: 'test',
// 	short: 'test'
// });

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

app.get('/new/:url', (req, res) => {
	Site.create({
		long: req.params.url,
		short: 'test'
	});
	res.send('hi');
});

app.listen(port, () => console.log('Server started'));

// User inputs URL
// Generate random, short string from URL
// Save short URL and long URL under same document in database
// Display short URL and long URL to user
// When someone goes to the short URL from app, redirect to long URL