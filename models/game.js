const mongoose = require('mongoose');

const GameSchema = mongoose.Schema({
    name: String,
    price: Number,
    game_categories: [String],
    image: String,
    publisher: String,
    url: String
})

module.exports = mongoose.model('Game', GameSchema)