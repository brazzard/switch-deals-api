const { getGamesEurope, parseNSUID, Region, getPrices, getShopsEurope } = require('nintendo-switch-eshop');
const express = require('express');
const Game = require('../models/game');
const router = express.Router();

router.get('/', paginatedResults(Game), (req, res) => {
    res.send(res.paginatedResults)
});

router.post('/', (req, res) => {
    // fetchGamesData()
    // res.send()
    fetchFullGamesData()
    res.send()

})

function paginatedResults(model) {
    return async (req, res, next) => {
        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)

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
            sortQuery[sort] = 1
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
    console.log(games)

    const gameIDs = games.map(g => parseNSUID(g, Region.EUROPE))

    const priceData = await getPrices("RU", gameIDs)
    const discountPrices = priceData.prices.filter(p => p.discount_price);

    const gamesOnSale = []


    discountPrices.forEach(gamePrice => {
        const gameIndex = games.findIndex(g => parseNSUID(g, Region.EUROPE) == gamePrice.title_id)
        if (gameIndex == -1) {
            games[gameIndex].price_data = gamePrice
        }
    })

    console.log(games)

    // discountPrices.forEach(price => {
    //     const game = games.find(g => parseNSUID(g, Region.EUROPE) == price.title_id);
    //     if (game) {
    //         game.price_data = price;
    //         gamesOnSale.push(game);
    //     }
    // })
    console.log(gamesOnSale)
    console.log(`Found ${gamesOnSale.length} games on sale`)

}

const fetchGamesData = () => {
    getGamesEurope()
        .then( games => {
            console.log("Next amount of games: " + games.length + " have been parsed")
            console.log(games)
            saveToDB(games)
            console.log('Games are fetched')
        })
        .catch( err => {
            console.log(err)
        })
}

function saveToDB(games) {
    games.forEach(g => {
        const game = new Game({
            name: g.title,
            price: g.price_regular_f,
            game_categories: g.game_categories_txt,
            image: g.image_url,
            publisher: g.publisher,
            url: g.url

        });
        game.save();
    })
}

module.exports = router;