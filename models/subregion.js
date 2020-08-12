const mongoose = require('mongoose');

const SubregionSchema = mongoose.Schema({
    code: String,
    country: String,
    currency: String,
    region: Number
})

module.exports = mongoose.model('Subregion', SubregionSchema)