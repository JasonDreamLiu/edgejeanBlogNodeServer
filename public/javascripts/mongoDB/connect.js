var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://edgejeanblog:sdd19961103@118.25.150.243/edgejeanblog";

function connect(user,pws,host,post,database){
    this.url = `mongodb://${user}:${pws}@${host}${post?":"+post:""}/${database}`;
    const dbName = database?database:user;
    this.connect = (fc,obj)=>{
        MongoClient.connect(this.url, { useNewUrlParser:true }, (err, db) => {
            if (err) throw err;
            console.log("数据库已创建！");
            if (typeof fc === "function"){
                fc(obj,db,dbName);
            }else {
                db.close();
            }
        });
    }
}

export default function mongoDB_Obj(url){
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
    let connect = new connect(this.user,this.pws,this.host,this.post,this.database);

    this.collection = (name) => {
        connect.connect(collection,{name});
    }
}

function collection(obj,db,dbName){
    const {name} = obj;
    if (!(typeof name === "string" && name))
        return;
    const dbase = db.db(dbName);
    dbase.createCollection(name,(err,res)=>{
        if (err) throw err;
        console.log(`创建集合：${name}`);
        db.close();
    });
};