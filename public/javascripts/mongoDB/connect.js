const MongoClient = require('mongodb').MongoClient;



function mongoDB_Obj(url){
    this.user = url.user;
    this.pws = url.pws;
    this.host = url.host;
    this.post = url.post;
    this.database = url.database;
    if (!this.user){
        console.error("必须填写用户名！");
        return;
    }else if (!this.pws){
        console.error("必须填写密码！");
        return;
    }else if (!this.host){
        this.host = "127.0.0.1";
    }else if (!this.post){
        this.post = "";
    }else if (!this.database){
        this.database = "";
    }
    const connect = new connect_(this.user,this.pws,this.host,this.post,this.database);

    this.collection = async (name) => {
        return await connect.connect(collection,{name});
    }
    this.insertMany = async (obj,collectionName) => {
        return await connect.connect(insertMany,{obj,collectionName});
    }
    this.insertOne = async (obj,collectionName) => {
        return await connect.connect(insertOne,{obj,collectionName});
    }
    this.find = async (obj,collectionName,limit) => {
        return await connect.connect(find,{obj,collectionName,limit});
    }
    this.aggregate = async (obj,collectionName) => {
        return await connect.connect(aggregate,{obj,collectionName});
    }
    this.estimatedDocumentCount = async (obj,collectionName) => {
        return await connect.connect(estimatedDocumentCount,{obj,collectionName});
    }
    this.updateOne = async (obj,collectionName,set,upsert,multi) => {
        return await connect.connect(updateOne,{obj,collectionName,set,upsert,multi})
    }
    this.deleteOne = async (obj,collectionName) => {
        return await connect.connect(deleteOne,{obj,collectionName});
    }
    this.deleteMany = async (obj,collectionName) => {
        return await connect.connect(deleteMany,{obj,collectionName});
    }

    function connect_(user,pws,host,post,database){
        this.url = `mongodb://${user}:${pws}@${host}${post?":"+post:""}/${database}`;
        const dbName = database?database:user;
        this.connect = async (fc,obj,res)=>{
            let conn = null;
            let a = null;
            try{
                conn = await MongoClient.connect(this.url,{useUnifiedTopology:true});
                console.log("数据库已连接！");
                const dbase = conn.db(dbName);
                a = await fc(obj, dbase, res);
                return a;
            } catch (err){
                console.error(`错误: ${err}`);
            } finally {
                if (conn != null) {
                    conn.close()
                    console.log("数据库已断开！");
                }
            }
        }
    }

}
function collection(obj,dbase){
    const {name} = obj;
    if (!(typeof name === "string" && name)){
        console.log('请输入String类型的集合名');
        return;
    }

    dbase.createCollection(name).then(result=>{
        console.log(`创建集合: ${name} 成功！`);
        return result;
    },err=>{
        console.log(`创建集合: ${name} 失败！`);
        console.log(err);
    });
};
async function insertMany(obj_,dbase){
    const {obj,collectionName} = obj_;
    if (!(typeof obj === "object" && obj)){
        console.log('请输入object类型的集合名');
        return;
    }
    return dbase.collection(collectionName).insertMany(obj).then(result=>{
        console.log(`集合 ${collectionName} 插入数据成功！`);
        console.log(obj);
        return {result:result.result,ops:result.ops};
    },err=>{
        console.log(`集合 ${collectionName} 插入数据失败！`);
        console.log(err);
    })
};
async function insertOne(obj_,dbase){
    const {obj,collectionName} = obj_;
    if (!(typeof obj === "object" && obj)){
        console.log('请输入object类型的集合名');
        return;
    }
    return dbase.collection(collectionName).insertOne(obj).then(result=>{
        console.log(`集合 ${collectionName} 插入数据成功！`);
        console.log(obj);
        return {result:result.result,ops:result.ops};
    },err=>{
        console.log(`集合 ${collectionName} 插入数据失败！`);
        console.log(err);
    })
};
// function updateInsert(obj_,dbase)

async function find(obj_,dbase){
    const {obj={},collectionName,limit=0} = obj_;
    if (!(typeof obj === "object" && obj)){
        console.log('请输入object类型的查询条件');
        return;
    }
    return dbase.collection(collectionName).find(obj).limit(limit).toArray().then(result=>{
        console.log("集合：");
        console.log(collectionName);
        console.log("查询条件：");
        console.log(obj);
        if (result.length===0){
            console.log(`查询失败！未查询到该条件下的数据！`);
        }else {
            console.log("查询成功！")
            result.forEach((value,index,arr)=>{
                console.log(value);
                console.log(typeof value._id);
            })
        }
        return result;
    },err=>{
        console.log(`查询失败！`);
        console.log(err);
    });
};


async function aggregate(obj_,dbase){
    const {obj={},collectionName} = obj_;
    if (!(typeof obj === "object" && obj)){
        console.log('请输入object类型的聚合查询条件');
        return;
    }
    let a = null;
    return dbase.collection(collectionName).aggregate(obj).toArray().then(result=>{
        console.log("查询成功！");
        result.forEach((value,index,arr)=>{
            console.log(value);
        })
        return result;
    },err=>{
        console.log(`查询失败！`);
        console.log(err);
    });
}
async function estimatedDocumentCount(obj_,dbase){
    const {obj={},collectionName} = obj_;
    return dbase.collection(collectionName).estimatedDocumentCount(obj);
}
async function updateOne(obj_,dbase){
    const {obj={},collectionName,set,upsert=false,multi=false} = obj_;
    if (!set){
        console.log("修改参数set不能为空。");
        return false;
    }
    return dbase.collection(collectionName).updateOne(obj,{$set:set},upsert,multi);
}
async function deleteOne(obj_,dbase){
    const {obj={},collectionName} = obj_;
    if ((!obj && typeof obj!=="object")){
        console.log("删除参数不能为空并且必须是一个object对象，否则可能会删除集合中所有的数据！");
        return false;
    }
    try{
        return dbase.collection(collectionName).deleteOne(obj);
    }catch (err){
        return err;
    }
}
async function deleteMany(obj_,dbase){
    const {obj={},collectionName} = obj_;
    if ((!obj && typeof obj!=="object")){
        console.log("删除参数不能为空并且必须是一个object对象，否则可能会删除集合中所有的数据！");
        return false;
    }
    try{
        return dbase.collection(collectionName).deleteMany(obj);
    }catch (err){
        return err;
    }
}

module.exports = mongoDB_Obj