# ApiEnvAuto

The ApiEnvAuto library will help setup api environment. All users have to do is right apis and the respective routes will be created automatically. Also this library supports the following DB connections 
1. MongoDb
2. Couchbase
3. Redis
4. Postgresql


## Usage

Using npm:
```shell
$ sudo apt-get update
$ sudo apt-get upgrade
$ sudo apt-get install git
$ git clone https://github.com/nehasalian15/api-env-auto.git
$ npm i -g npm
$ npm install
```

Start without any db connections:
```shell
$ node index.js
```
Result:
```shell
Database File Created
Routes Get File Created
GET : {
/apis/demo   // this is the api route path fot get apis
}
POST : {
}
Server started 127.0.0.1:3000
```

For Redis db connections:
```shell
$ node index.js -r <ip-address>:<port>
```
Example:
```shell
$ node index.js -r 127.0.0.1:6379
```

For Postgresql db connections:
```shell
$ node index.js -g <ip-address>:<port>:<database>:<username>:<password>
```
Example:
```shell
$ node index.js -g 127.0.0.1:5432:postgres:postgres:password
```

For Couchbase db connections:
```shell
$ node index.js -c <ip-address>
```
Example:
```shell
$ node index.js -c 127.0.0.1
```
For mongo db connections:
```shell
$ node index.js -m <ip-address>/<db_name>
```
Example:
```shell
$ node index.js -m 127.0.0.1/db_name

Apis :
```js
// To write new apis, go in apis folder and add your api file.
const config = require('../config/database.js')

// Postgresql Usage
var pool = config.postgrePool;

// Redis Usage
config.redis.get(key, (err,resp) =>{})

module.exports.demo = {
	conf: {
		handler : demo,
		insecure : true // later this feature will be added to make secure api
	},
	method : "GET" // Set value as POST to make post apis
}

function demo(req, reply) {
	reply.json({
		success : 200
	})
}
// this sample demo.js file will be made on setting up the environment for the first time.
```

## Options
-p : Port Number, Default : 3000
-h : Host Name, Default : 127.0.0.1
-s : Secret Key, Default : mysecret
-g : For Postgresql DB Connection
-c : For Couchbase DB Connection
-r : For Redis DB Connection
-m : For MongoDB Connection
