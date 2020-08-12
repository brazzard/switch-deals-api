const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const gamesRoute = require('./routes/games');
const subregionRoute = require('./routes/subregions')
const Game = require('./models/game')
require('dotenv/config');

const app = express();
app.use(bodyParser.json());
app.use('/games', gamesRoute);
app.use('/subregions', subregionRoute)

app.listen(3000, () => {
    console.log('Server has started')
});

mongoose.connect(process.env.DB_CONNECTION, { useUnifiedTopology: true, useNewUrlParser: true  });
const db = mongoose.connection;

db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to DB'));