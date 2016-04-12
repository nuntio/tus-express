# tus-node-server

Fork of Ben Stahl's [tus-node-server](https://github.com/tus/tus-node-server). Adapted for use as an express.js middleware.

## Installation

Not published.

## Quick Start

#### Build a middleware
```javascript
// ...
// In your express.js app:

const path = require('path');
const tmpPath = path.join(__dirname, '/file');

const tus = require('tus-node-server');
const tusMiddleware = new tus.Handlers();
tusMiddleware.datastore = new tus.FileStore({ path: tmpPath });

app.all('/upload', tusMiddleware, (req, res, next) {
  res.end(); // res.end() must be called
})
// ...
```

#### Create a file
```bash
$ curl -X POST -I 'http://localhost:3000/upload' \
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
