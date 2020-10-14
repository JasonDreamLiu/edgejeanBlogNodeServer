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
router.get('/connect/sel/:name', async (req, res) => {
  res.send(await db.find({},req.params.name));
})
router.get('/connect/aggregate', async (req, res) => {
  res.send(await db.aggregate([
    {
      $lookup:{
        from:"tb_bookmarks_types",
        localField:"_id",
        foreignField:"bookmark_id",
        as:"children"
      }
    }
  ],"tb_bookmarks"));
})
router.get('/connect/selBookmarks', async (req, res) => {
  const {collectionName, name} = req.params;
  res.send(await db.find({},req.params.name));
})
router.post('/connect/addBookmarkTitles',async (req,res)=>{
  // res.render('index', {title: req.params.name});
  const {bookmarkTitles} = req.params;

  const a = await db.insert({
    bookmarkTitles
  }, 'tb_bookmarks');
  res.send(a);
})
router.post('/connect/addBookmarksTypes',async (req,res)=>{
  const {collectionName,name,url,bookmarkid} = req.params;
  const a = await db.insert({
    name,
    url,
    bookmark_id:mongoose.Types.ObjectId(bookmarkid)
  },collectionName);
  res.send(a);
})

module.exports = router;
