const mongoose = require('mongoose');

const GameSchema = mongoose.Schema({
    name: String,
    default_price: Number,
    game_categories: [String],
    image: String,
    publisher: String,
    url: String,
    regular_price: {},
    current_price: {},
    has_discount: { type: Boolean, default: false },
    language_availability: [String],
    discount_percentage: { type: Number, default: 0},
    release_date: String,
    age_rating: Number,
    players: Number,
    short_desсription: String,
    banner: String
})

module.exports = mongoose.model('Game', GameSchema)