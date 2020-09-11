const { getGamesEurope, parseNSUID, Region, getPrices, getShopsEurope } = require('nintendo-switch-eshop');
const express = require('express');
const Game = require('../models/game');
const Subregion = require('../models/subregion');
const router = express.Router();
// const fs = require('fs');

router.get('/', paginatedResults(Game), (req, res) => {
    res.send(res.paginatedResults)
});

router.post('/', (req, res) => {
    fetchFullGamesData()
    res.send()

})

function paginatedResults(model) {
    return async (req, res, next) => {
        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)
        // const subregion = req.headers.subregion

        const startIndex = (page - 1) * limit
        const endIndex = page * limit 

        const results = {}
        let filterQuery = {}
        let sortQuery = {}

        const { price } = req.query
        if (price) {
            filterQuery.price = price
        }
        const { sort } = req.query
        if (sort) {
            sortQuery.sort = 1
        }
        
        
        if (endIndex < await model.countDocuments(filterQuery).exec()) {
            results.next = {
                page:  page + 1,
                limit: limit
            }
        }
        
        if (startIndex > 0) {
            results.previous = {
                page:  page - 1,
                limit: limit
            }
        }

        try {
            results.results = await model.find(filterQuery)
                                         .sort(sortQuery)
                                         .select(subregionQuery)
                                         .limit(limit)
                                         .skip(startIndex)
                                         .exec()
            res.paginatedResults = results
            next()
        } catch (err) {
            res.status(500).json({ message: e.message })
        }
    }
}

const fetchFullGamesData = async () => {

    const games = await getGamesEurope()
    // JSON.parse(fs.readFileSync("./games.json").toString());

    console.log(games)

    const gameIDs = games.map(g => parseNSUID(g, Region.EUROPE))
    const subregions = await Subregion.find({region: 2}).exec()

    const priceData = await subregionPrices(subregions, gameIDs)
    // JSON.parse(fs.readFileSync("./prices.json").toString());

    console.log(priceData)

    const gamesObjects = await priceMapper(priceData, games)
    const gamesWithLanguages = await languageMapper(gamesObjects)

    saveToDB(gamesWithLanguages)
    console.log(gamesWithLanguages)
}

function saveToDB(games) {
    games.forEach(g => {
        const game = new Game({
            name: g.title,
            default_price: g.price_regular_f,
            game_categories: g.game_categories_txt,
            image: g.image_url,
            publisher: g.publisher,
            url: g.url,
            current_price: g.current_price,
            regular_price: g.regular_price,
            has_discount: g.price_has_discount_b,
            language_availability: g.languages,
            discount_percentage: g.price_discount_percentage_f,
            release_date: g.date_from,
            age_rating: g.age_rating_sorting_i,
            players: g.players_to,
            short_desсription: g.excerpt,
            banner: g.wishlist_email_banner640w_image_url_s,
            popularity: g.popularity
        });
        game.save();
    })
}

async function subregionPrices(subregions, gameIDs) {
    const priceData = {}
    for(const s of subregions){
        const priceResult = await getPrices(s.code, gameIDs)
                priceData[s.code] = priceResult
                console.log(priceData)
        }
    return priceData
}

async function priceMapper(priceData, games) {
    games.forEach(game => {
        const regionPrices = {}
        for (const subregion in priceData) {
            const gamePrice = priceData[subregion].prices.find(p => parseNSUID(game, Region.EUROPE) == p.title_id)
            if (gamePrice) {
                regionPrices[subregion] = gamePrice
            }
        }

        const regularPrices = {}
        const currentPrices = {}
        for (const regionPrice in regionPrices) {
            if (regionPrices[regionPrice].hasOwnProperty('regular_price')) {
                regularPrices[regionPrice] = regionPrices[regionPrice].regular_price.raw_value
                if (regionPrices[regionPrice].hasOwnProperty('discount_price')) {
                    currentPrices[regionPrice] = regionPrices[regionPrice].discount_price.raw_value
                } else {
                    currentPrices[regionPrice] = regionPrices[regionPrice].regular_price.raw_value
                }
            } 
        }

        game.regular_price = regularPrices
        game.current_price = currentPrices
    })
    
    return games
}

async function languageMapper(games) {
    games.forEach(game => {
        game.languages = game.language_availability[0].split(",")
    })
    return games
}

module.exports = router;