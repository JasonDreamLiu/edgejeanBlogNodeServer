var express = require('express');
var router = express.Router();
const mongoDB = require('../public/javascripts/mongoDB/connect');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
