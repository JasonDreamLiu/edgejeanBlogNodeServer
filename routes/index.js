const express = require('express');
const router = express.Router();
const mongoDB = require('../public/javascripts/mongoDB/connect');
const mongoose = require('mongoose');
// const {FetchData} = require('../public/javascripts/AxiosMannage/index');

const db = new mongoDB({
    user: "edgejeanblog",
    pws: "sdd19961103",
    host: "118.25.150.243",
    database: "edgejeanblog"
})

/* GET home page. */
router.get('/', function (req, res, next) {
    // FetchData("https://blog.csdn.net/")
    res.render('index', {title: 'Express'});
});
router.post('/connect/select', async (req, res) => {
    const obj = req.body;
    console.log(obj);
    const a = await db.find({title: {"$in": obj}}, "tb_bookmarks");
    console.log(a);
    res.send(a);
})
router.get('/connect/selIsBookmarkTitle', async (req, res) => {
    const obj = req.query.title;
    console.log(obj);
    const a = await db.find({title:obj}, "tb_bookmarks");
    console.log(a);
    res.send(a.length>0?true:false);
})
router.get('/connect/selBookmarkTitles', async (req, res) => {
    const obj = req.query.title;
    const a = await db.find({title:{$regex:obj,$options:"$i"}}, "tb_bookmarks",10);
    let list = []

    a.forEach(item=>{
        list.push({value:item.title});
    })
    res.send(list);
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
router.get('/connect/aggregatePagination', async (req, res) => {
    let {page,pagesize} = req.query;
    page = Number(page);
    pagesize = Number(pagesize);
    console.log(pagesize,(page-1)*pagesize);
    res.send(await db.aggregate([
        {
            $lookup: {
                from: "tb_bookmarks",
                localField: "bookmark_id",
                foreignField: "_id",
                as: "tb_bookmark_title"
            }
        },
        {
            $unwind: "$tb_bookmark_title"
        },
        {
            $project : {
                name : 1 ,
                url : 1,
                tb_bookmark_title:1
            }
        }
    ], "tb_bookmarks_types",pagesize,(page-1)*pagesize));
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
    let sus = {};
    sus.exist = await db.find({title: {"$in": bookmarkTitles.list}}, "tb_bookmarks");
    sus.exist.forEach(item => {
        try{
            bookmarkTitles.objs = bookmarkTitles.objs.filter(item_=>item_.title!==item.title);
        }catch (err){
            console.error(`错误: ${err}`);
        }
    });
    const a = await db.insertMany(bookmarkTitles.objs,"tb_bookmarks");
    console.log("aaa",a);
    if (a&&a.result.ok){
        sus.result = {
            success:true,
            insertOkInt:a.result.n,
            insertDatas:a.ops
        }
    }else{
        sus.result = {
            success:false
        }
    }
    res.json(sus);
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
router.post('/connect/addBookmarks', async (req, res) => {
    let datas = [];
    let types = [];
    req.body.forEach(item=>{
        if (datas[item.title]!==undefined){
            datas[item.title].push({
                name:item.name,
                url:item.url
            })
        }else {
            datas[item.title] = [{
                name:item.name,
                url:item.url
            }]
        }
    })
    // datas.forEach((item,index)=>{
    //     // const a = await db.find({title:index}, "tb_bookmarks");
    //     console.log(index);
    // })
    for (let key in datas){
        let a = await db.find({title:key}, "tb_bookmarks");
        if (a.length===0){
            a = await db.insertOne({title:key},"tb_bookmarks");
        }
        if (a[0]){
            a = a[0]._id;
        }else{
            a = a._id
        }
        for (let key1 in datas[key]){
            await types.push(Object.assign(datas[key][key1],{bookmark_id:a}));
        }
    }

    let sus = {
    }
    const a = await db.insertMany(types,"tb_bookmarks_types");
    if (a&&a.result.ok){
        sus.result = {
            success:true,
            insertOkInt:a.result.n,
            insertDatas:a.ops
        }
    }else{
        sus.result = {
            success:false
        }
    }
    res.send(sus);
})

module.exports = router;
