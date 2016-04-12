# tus-node-server

Fork of Ben Stahl's [tus-node-server](https://github.com/tus/tus-node-server)

## Installation

```npm install --save git+https://github.com/nuntio/tus-node-server#master```

## Quick Start

#### Build a server
```javascript
const tus = require('tus-node-server');

const server = new tus.Server();
server.datastore = new tus.FileStore({
  path: '/files'
});

const host = '127.0.0.1';
const port = 8000;
server.listen({ host, port }, () => {
  console.log(`[${new Date().toLocaleTimeString()}] tus server listening at http://${host}:${port}`);
});
```

#### Run the server
```bash
$ node server.js
```


#### Create a file
```bash
$ curl -X POST -I 'http://localhost:8000/files' \
               -H 'Tus-Resumable: 1.0.0' \
               -H 'Entity-Length: 12345678'

HTTP/1.1 201 Created
Tus-Resumable: 1.0.0
Access-Control-Expose-Headers: Upload-Offset, Location, Upload-Length, Tus-Version, Tus-Resumable, Tus-Max-Size, Tus-Extension, Upload-Metadata
Location: http://localhost:8000/files/2d70739670d3304cbb8d3f2203857fef
```

## Running Tests
```bash
$ npm test
```

## Update Coverage
```bash
$ npm run coveralls
```
