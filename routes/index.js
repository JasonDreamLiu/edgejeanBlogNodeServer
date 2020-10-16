const express = require('express');
const router = express.Router();
const mongoDB = require('../public/javascripts/mongoDB/connect');
const mongoose = require('mongoose');

const db = new mongoDB({
    user: "edgejeanblog",
    pws: "sdd19961103",
    host: "118.25.150.243",
    database: "edgejeanblog"
})

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});
router.post('/connect/selete', async (req, res) => {
    const obj = req.body;
    console.log(obj);
    const a = await db.find({title: {"$in": obj}}, "tb_bookmarks");
    console.log(a);
    res.send(a);
})
// router.get('/connect/addCollection/:name', (req, res) => {
//   res.render('index', { title: req.params.name });
//   db.collection(req.params.name);
// })
router.get('/connect/sel/:name', async (req, res) => {
    res.send(await db.find({}, req.params.name));
})
router.get('/connect/aggregate', async (req, res) => {
    res.send(await db.aggregate([
        {
            $lookup: {
                from: "tb_bookmarks_types",
                localField: "_id",
                foreignField: "bookmark_id",
                as: "children"
            }
        }
    ], "tb_bookmarks"));
})

router.get('/connect/selBookmarks', async (req, res) => {
    const {collectionName, name} = req.params;
    const a = await db.find({}, req.params.name);
    console.log(a);
    res.send(a);
})

router.post('/connect/addBookmarkTitles', async (req, res) => {
    let bookmarkTitles = {
        objs:[],
        list:[]
    };
    req.body.forEach(item=>{
        if (item.title){
            bookmarkTitles.list.push(item.title);
            bookmarkTitles.objs.push(item);
        }
    })
    this.sus = {};
    this.sus.exist = await db.find({title: {"$in": bookmarkTitles.list}}, "tb_bookmarks");
    this.sus.exist.forEach(item => {
        try{
            bookmarkTitles.objs = bookmarkTitles.objs.filter(item_=>item_.title!==item.title);
        }catch (err){
            console.error(`错误: ${err}`);
        }
    });
    const a = await db.insertMany(bookmarkTitles.objs,"tb_bookmarks");
    console.log("aaa",a);
    if (a&&a.result.ok){
        this.sus.result = {
            success:true,
            insertOkInt:a.result.n,
            insertDatas:a.ops
        }
    }
    res.json(this.sus);
})

router.post('/connect/addBookmarksTypes', async (req, res) => {
    const {collectionName, name, url, bookmarkid} = req.params;
    const a = await db.insertOne({
        name,
        url,
        bookmark_id: mongoose.Types.ObjectId(bookmarkid)
    }, collectionName);
    res.send(a);
})

module.exports = router;
