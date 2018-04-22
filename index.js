const express = require('express');
const router = express.Router();
const commandLineArgs = require('command-line-args');
const fs = require('fs');
const requireTree = require("require-tree");
const bodyParser = require('body-parser');
const async = require('async');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');

const app = express();

// Body Parser Middleware
app.use(bodyParser.json());

// CORS Middleware
app.use(cors());

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

var optionsDefinitions = [{
        name: "mongodb",
        alias: 'm',
        type: String,
        defaultValue: null
    },
    {
        name: "redis",
        alias: 'r',
        type: String,
        defaultValue: null
    },
    {
        name: "couchbase",
        alias: 'c',
        type: String,
        defaultValue: null
    },
    {
        name: "postgresql",
        alias: 'g',
        type: String,
        defaultValue: null
    },
    {
        name: "port",
        alias: 'p',
        type: String,
        defaultValue: "3000"
    },
    {
        name: "host",
        alias: 'h',
        type: String,
        defaultValue: "127.0.0.1"
    },
    {
        name: "secret",
        alias: 's',
        type: String,
        defaultValue: "mysecret"
    }
]

var routes = {
    POST: "",
    GET: ""
}
var args = commandLineArgs(optionsDefinitions);
var host = args.host;
var port = args.port;

//var defaultApiFile = "const express = require('express');\nconst database = require('../config/database');\nconst router = express.Router();\nmodule.exports = router;"
var defaultApiFile = "const express = require('express');\nconst router = express.Router();\nmodule.exports = router;"

fs.stat('./apis', (errApis, statsApis) => {
    if (errApis) {
        fs.mkdir('./apis', (err) => {
            if (!err) {
                let value = 'module.exports.demo = {\nconf: {\nhandler : demo,\ninsecure : true\n},\nmethod : "GET"\n}\nfunction demo(req, reply) {\nreply.json({success : 200})\n}'
                fs.writeFile('./apis/demo.js', value, (errDemo) => {
                    if (!errDemo)
                        console.log("apis folder made successfully");

                });
            }
        });
    }
    fs.stat('./config', (errConf, statsConf) => {
        if (errConf)
            fs.mkdirSync('./config');

        fs.stat('./routes', (errRoutes, statsRoutes) => {
            if (errRoutes)
                fs.mkdirSync('./routes')

            start();
        });
    })

})

function start() {
    initDbs(() => {
        requireTree("./apis/", {
            each: initapis
        });

        fs.writeFile('./routes/apis.js', defaultApiFile, (err) => {
            if (err) throw err;
            console.log("Routes Get File Created")
            init();
        })
    })
}

function initapis(functions, filename, path) {
    for (var i in functions) {
        var key = i;
        var data = defaultApiFile.split("\n");
        let routerProfile;
        if (functions[key].method == 'GET') {
//            console.log("key ",key,path,filename);
            //routerProfile = "\nrouter.get('/" + key + "'," + functions[key].conf.handler + ")"
            routerProfile = "const "+key+" = require('../apis/"+filename+"') \nrouter.get('/" + key + "', " + key +"."+key+".conf.handler)"
            routes.GET = routes.GET + '/apis/' + key + '\n';
        } else if (functions[key].method == 'POST') {
            routerProfile = "const "+key+" = require('../apis/"+filename+"') \nrouter.post('/" + key + "', " + key +"."+key+".conf.handler)"
            routes.POST = routes.POST + '/apis/' + key + '\n';
        }
        data.splice(data.length - 1, 0, routerProfile);
        defaultApiFile = data.join("\n");
    }
}

function init() {
    let get = require('./routes/apis');
    app.use('/apis', get);

    app.listen(port, () => {
        console.log('Server started ' + args.host + ':' + port);
    });
    console.log("GET : {\n" + routes.GET + "}\nPOST : {\n" + routes.POST + "}");
}

function initDbs(cb) {
    let dbFileVal = "";
    if (args.mongodb) {
        let mongo = {
            database: args.mongodb,
            secret: 'yoursecret'
        }
        dbFileVal = dbFileVal + "const mongoose = require('mongoose');\n"
        dbFileVal = dbFileVal + "module.exports.mongo = mongoose.connect('mongodb://" + mongo.database + "');\nmongoose.connection.on('connected', () => {console.log('Connected to mongodb " + mongo.database + "');});\nmongoose.connection.on('error', () => {console.log('Connection Error mongodb " + mongo.database + "'); process.exit();});\n"
    }
    if(args.couchbase) {
    dbFileVal = dbFileVal + "const couchbase =  require('couchbase');\n"
    dbFileVal = dbFileVal + "module.exports.couchbase = new couchbase.Cluster('"+args.couchbase+"?detailed_errcodes=1');\nconsole.log('Couchbase Connected');\n";
    }
    if(args.redis) {
    dbFileVal = dbFileVal + "const Redis = require('ioredis');\n"
    let redis = {
        host : args.redis.split(':')[0],
        port: args.redis.split(':')[1]
    }
    dbFileVal = dbFileVal + "module.exports.redis = new Redis({'host' : '"+redis.host+"','port' : "+redis.port+"})\n";
    }
    if(args.postgresql) {
    dbFileVal = dbFileVal + "const pg = require('pg');\n"
    let postgres = {
        "host": args.postgresql.split(':')[0],
            "port": args.postgresql.split(':')[1],
            "database": args.postgresql.split(':')[2],
            "user": args.postgresql.split(':')[3],
            "password": args.postgresql.split(':')[4],
            "idleTimeoutMillis": "30000"
        }
    let pool = 'new pg.Pool(postgres);'
    dbFileVal = dbFileVal + "let postgres = "+JSON.stringify(postgres)+"\nmodule.exports.postgrePool = "+pool+"\n";
    }
    fs.writeFile('./config/database.js', dbFileVal, (err) => {
        if (err) throw err;
        console.log("Database File Created");
        cb();
    })
}
