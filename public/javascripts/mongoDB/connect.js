const MongoClient = require('mongodb').MongoClient;

// var url = "mongodb://edgejeanblog:sdd19961103@118.25.150.243/edgejeanblog";


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

    this.collection = (name) => {
        let a = connect.connect(collection,{name});
    }
    this.insert = (obj,collectionName) => {
        let a = connect.connect(insert,{obj,collectionName});
    }
    this.find = (obj,collectionName) => {
        return connect.connect(find,{obj,collectionName});
    }

    function connect_(user,pws,host,post,database){
        this.url = `mongodb://${user}:${pws}@${host}${post?":"+post:""}/${database}`;
        const dbName = database?database:user;
        this.connect = async (fc,obj,res)=>{
            let conn = null;
            let a = null;
            try{
                conn = await MongoClient.connect(this.url);
                console.log("数据库已连接！");
                const dbase = conn.db(dbName);
                a = fc(obj, dbase, res);
            } catch (err){
                console.error(`错误: ${err}`);
            } finally {
                if (conn != null) conn.close();
                return a;
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
    },err=>{
        console.log(`创建集合: ${name} 失败！`);
        console.log(err);
    });
};
function insert(obj_,dbase){
    const {obj,collectionName} = obj_;
    if (!(typeof obj === "object" && obj)){
        console.log('请输入object类型的集合名');
        return;
    }
    dbase.collection(collectionName).insert(obj).then(result=>{
        console.log(`集合 ${collectionName} 插入数据成功！`);
        console.log(obj);
    },err=>{
        console.log(`集合 ${collectionName} 插入数据失败！`);
        console.log(err);
    })
};

async function find(obj_,dbase){
    const {obj={},collectionName} = obj_;
    if (!(typeof obj === "object" && obj)){
        console.log('请输入object类型的集合名');
        return;
    }
    let a = null;
    return dbase.collection(collectionName).find(obj).toArray().then(result=>{
        console.log("查询成功！");
        result.forEach((value,index,arr)=>{
            console.log(value);
        })
        return result;
    },err=>{
        console.log(`查询失败！`);
        console.log(err);
    });
    // return a;
};

module.exports = mongoDB_Obj