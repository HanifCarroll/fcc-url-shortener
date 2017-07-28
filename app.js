const express = require('express');
const mongoose = require('mongoose');
const validUrl = require('valid-url');
const shortid = require('shortid');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

// Mongoose Config
mongoose.Promise = global.Promise; 
const dbUrl = process.env.MONGOLAB_URI;
mongoose.connect(dbUrl, {
	useMongoClient: true
});

const siteSchema = new mongoose.Schema({
	long: {
		type: String,
		unique: true
	},
	short: {
		type: String,
		unique: true
	}
});

const Site = mongoose.model('Site', siteSchema);

// Routes

// Homepage
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

// New shortcut creation
app.get('/new/:url*', async (req, res) => {
	const fullUrl = req.originalUrl.replace('/new/', '');

	// Check to see if url is valid
	if (!validUrl.isWebUri(fullUrl)) {
		res.send({ 'error': 'That is not a valid URL!  Check the format guideline on the homepage.'});
	}
	
	// Look to see if site exists in database
	await Site.findOne({ 'long': fullUrl}).then(site => {
		// If the site exists, don't do anything.
		if (site) {
			res.send({
				'Original URL': site.long,
				'Shortened URL': site.short
			});
		}
	});

	// If the site doesn't exist, then create an entry
	const newSite = {
		long: fullUrl,
		short: `${req.headers.host}/${shortid.generate()}`
	};

	Site.create(newSite, (err, res) => {
		if (err) {
			console.log(err);
		} else {
			console.log(res);
		}
	});

	// Show them the newly created object.
	res.send({
				'Original URL': newSite.long,
				'Shortened URL': newSite.short
	});
});

// Redirect route
app.get('/:url', async (req, res) => {
	// Lookup the short URL in the database
	const site = await Site.findOne({ 'short': `${req.headers.host}/${req.params.url}` }, (err, res) => {
		if (err) {
			console.log(err);
		} else {
			console.log(res);
		}
	});
	if (site) {
		res.redirect(site.long);
	} else {
		res.send({ 'error': 'That ID is not in the database.'});
	}
	
});

app.listen(port, () => console.log('Server started'));