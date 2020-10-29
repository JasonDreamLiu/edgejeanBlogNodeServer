const express = require('express');
const router = express.Router();
const mongoDB = require('../public/javascripts/mongoDB/connect');
const mongoose = require('mongoose');
// const {FetchData} = require('../public/javascripts/AxiosMannage/index');

const db = new mongoDB({
    user: "***",
    pws: "***",
    host: "***",
    post: "***",
    database: "***"
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
    const a = await db.find({title: obj}, "tb_bookmarks");
    console.log(a);
    res.send(a.length > 0);
})
router.get('/connect/selBookmarkTitles', async (req, res) => {
    const obj = req.query.title;
    const a = await db.find({title: {$regex: obj, $options: "$i"}}, "tb_bookmarks", 10);
    let list = []

    a.forEach(item => {
        list.push({value: item.title});
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
    let {page, pagesize, bookmark_id = "", name = "", url = ""} = req.query;
    bookmark_id = bookmark_id ? mongoose.Types.ObjectId(bookmark_id) : bookmark_id
    page = Number(page);
    pagesize = Number(pagesize);
    let match = bookmark_id || name || url ? {} : null;
    let obj = []
    if (bookmark_id) {
        match.bookmark_id = bookmark_id;
    }
    if (name) {
        match.name = {$regex: name, $options: "$i"};
    }
    if (url) {
        match.url = {$regex: url, $options: "$i"};
    }
    obj.push({
        $match: {
            bookmark_id: {$ne: null}
        }
    })
    obj.push({
        $lookup: {
            from: "tb_bookmarks",
            localField: "bookmark_id",
            foreignField: "_id",
            as: "tb_bookmark_title"
        }
    })
    obj.push({
        $unwind: "$tb_bookmark_title"
    })
    obj.push({
        $project: {
            name: 1,
            url: 1,
            tb_bookmark_title: 1,
        }
    })
    if (pagesize) {
        if (!page) {
            page = 1;
        }
        obj.push({$skip: (page - 1) * pagesize}, {$limit: pagesize});
    }

    let a = await db.aggregate(obj, "tb_bookmarks_types");
    let total = await db.estimatedDocumentCount({}, "tb_bookmarks_types");
    console.log(obj);
    res.send({datas:a,total});
})
router.get('/connect/selBookmarks', async (req, res) => {
    const {collectionName, name} = req.params;
    const a = await db.find({}, req.params.name);
    console.log(a);
    res.send(a);
})
router.post('/connect/addBookmarkTitles', async (req, res) => {
    let bookmarkTitles = {
        objs: [],
        list: []
    };
    req.body.forEach(item => {
        if (item.title) {
            bookmarkTitles.list.push(item.title);
            bookmarkTitles.objs.push(item);
        }
    })
    let sus = {};
    sus.exist = await db.find({title: {"$in": bookmarkTitles.list}}, "tb_bookmarks");
    sus.exist.forEach(item => {
        try {
            bookmarkTitles.objs = bookmarkTitles.objs.filter(item_ => item_.title !== item.title);
        } catch (err) {
            console.error(`错误: ${err}`);
        }
    });
    const a = await db.insertMany(bookmarkTitles.objs, "tb_bookmarks");
    console.log("aaa", a);
    if (a && a.result.ok) {
        sus.result = {
            success: true,
            insertOkInt: a.result.n,
            insertDatas: a.ops
        }
    } else {
        sus.result = {
            success: false
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
    req.body.forEach(item => {
        if (datas[item.title] !== undefined) {
            datas[item.title].push({
                name: item.name,
                url: item.url
            })
        } else {
            datas[item.title] = [{
                name: item.name,
                url: item.url
            }]
        }
    })
    // datas.forEach((item,index)=>{
    //     // const a = await db.find({title:index}, "tb_bookmarks");
    //     console.log(index);
    // })
    for (let key in datas) {
        let a = await db.find({title: key}, "tb_bookmarks");
        if (a.length === 0) {
            a = await db.insertOne({title: key}, "tb_bookmarks");
        }
        if (a.result && a.result.ok>0) {
            a = a.ops[0]._id;
        } else {
            a = a[0]._id
        }
        for (let key1 in datas[key]) {
            await types.push(Object.assign(datas[key][key1], {bookmark_id: a}));
        }
    }

    let sus = {}
    const a = await db.insertMany(types, "tb_bookmarks_types");
    if (a && a.result.ok) {
        sus.result = {
            success: true,
            insertOkInt: a.result.n,
            insertDatas: a.ops
        }
    } else {
        sus.result = {
            success: false
        }
    }
    res.send(sus);
})
router.post('/connect/updateBookmarkTypes', async (req, res) => {
    const {data,id} = req.body;
    const {title,url,name} = data;
    let data_ = {};
    if (title){
        let a = await db.find({title: title}, "tb_bookmarks");
        if (a.length === 0) {
            a = await db.insertOne({title: title}, "tb_bookmarks");
        }
        if (a.result && a.result.ok>0) {
            a = a.ops[0]._id;
        } else {
            a = a[0]._id
        }
        data_.bookmark_id = a;
    }
    if (url){
        data_.url = url;
    }
    if (name){
        data_.name = name;
    }
    let sus = await db.updateOne({_id:mongoose.Types.ObjectId(id)},"tb_bookmarks_types",data_);

    res.send({result:sus.result,data:data_});
})
router.post('/connect/delBookmarksTypes', async (req, res) => {
    const {id} = req.body;
    if (!id){
        res.send({result:{ok:0},success:"id不能为空!"});
    }else {
        let sus = await db.deleteOne({_id:mongoose.Types.ObjectId(id)},"tb_bookmarks_types");
        console.log(sus);
        res.send({result:sus.result});
    }
})

module.exports = router;
