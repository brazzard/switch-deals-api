const { getShopsEurope } = require('nintendo-switch-eshop');
const express = require('express');
const Subregion = require('../models/subregion');
const router = express.Router();

router.get('/', async (req, res) => {
    const subregions = await getShopsEurope()

    subregions.forEach(s => {
        const subregion = new Subregion({
            code: s.code,
            country: s.country,
            currency: s.currency,
            region: s.region
        });
        subregion.save();
    })
    res.send(subregions)
})

module.exports = router