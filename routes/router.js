const express = require('express');
const router = express.Router();
const { fetchAvailableRooms } = require('../crawler/roomCrawler');

router.get('/', (req, res) => {
    res.send('Hello Asksuite World!');
});

//TODO implement endpoint here
router.post('/search', async (req, res) => {
    if (!req._body) {
        return res.status(400).send({ error: 'Invalid request' });
    }
    const { checkin, checkout } = req.body
    if (!checkin || !checkout || checkin >= checkout) {
        return res.status(400).send({ error: 'Invalid dates' });
    }

    try {
        const availableRooms = await fetchAvailableRooms(checkin,checkout);
        res.send(availableRooms)
    } catch (error) {
        res.status(500).send({
            status: 'error',
            statusCode:500,
            message: 'Error searching for available rooms',
            details: error.message,
        });
    }

})

module.exports = router;
