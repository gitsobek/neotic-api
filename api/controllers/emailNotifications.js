const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'dziala'
    })
})

router.post('/', (req, res, next) => {
    const email = req.body;
})

module.exports = router;