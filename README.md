# tus-express

Fork of Ben Stahl's [tus-node-server](https://github.com/tus/tus-node-server). Adapted for use in express.js middlewares.

## Quick Start

#### Build a middleware
```javascript
// In your express.js app...
const directory = '/path/to/directory'
const tus = require('tus-express');
const uploadHandlers = new tus.Handlers();
uploadHandlers.datastore = new tus.FileStore({ directory: directory, path: 'tmp' });

// CORE PROTOCOLS (HEAD, PATCH, OPTIONS)
// NOTE: "uploadHandlers.handle(req, res)" will always return a promise.

router.head('/api/upload/:fileName', (req, res, next) => {
  // The handler expects either a req.fileName or a req.params.fileName,
  // otherwise it will just create a random string and lose the
  // original filename.
  uploadHandlers.handle(req, res)
    .then(done => {
      // Additional operations go here
      done(); // Make sure to call done to end the response
    })
    .catch(next);
  });
});

router.options('/api/upload/*', (req, res, next) => {
  uploadHandlers.handle(req, res)
    .then(done => {
      done();
    })
    .catch(next);
  });
});

router.patch('/api/upload/:fileName', (req, res, next) => {
  uploadHandlers.handle(req, res)
    .then(done => {
      done();
    })
    .catch(next);
  });
});


// EXTENSION (POST)

router.post('/api/upload', (req, res, next) => {
  uploadHandlers.handle(req, res)
    .then(done => {
      done();
    })
    .catch(next);
  });
});


// QUICK NOTE: On the client side, make sure to have a slash at the end of the "endpoint" option.
// For example, the Web API:
// {
//   ...options
//   endpoint: "http://localhost:3000/api/upload/",
//   ...options
// }
// ALSO, remember to catch errors after "uploadHandlers.handle(req, res)".
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
