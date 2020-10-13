const express = require('express');
const router = express.Router();
const mongoDB = require('../public/javascripts/mongoDB/connect');
const mongoose = require('mongoose');

const db = new mongoDB({
  user:"edgejeanblog",
  pws:"sdd19961103",
  host:"118.25.150.243",
  database:"edgejeanblog"
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
// router.get('/connect/addCollection/:name', (req, res) => {
//   res.render('index', { title: req.params.name });
//   db.collection(req.params.name);
// })
router.get('/connect/sel/:name', (req, res) => {
  res.send(db.find({},req.params.name));
})
router.post('/connect/addBookmarks',(req,res)=>{
  res.render('index', {title: req.params.name});
  const {collectionName, name} = req.params;
  db.insert({
    name
  }, collectionName);
})
router.post('/connect/addBookmarksTypes',(req,res)=>{
  res.send();
  const {collectionName,name,url,bookmarkid} = req.params;
  db.insert({
    name,
    url,
    bookmark_id:mongoose.Types.ObjectId(bookmarkid)
  },collectionName);
})

module.exports = router;
