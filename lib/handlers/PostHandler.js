'use strict';

const File = require('../models/File');
const BaseHandler = require('./BaseHandler');

class PostHandler extends BaseHandler {
  /**
   * Create a file in the DataStore.
   *
   * @param  {object} req http.incomingMessage
   * @param  {object} res http.ServerResponse
   * @return {function}
   */
  *send(req, res) {
    let length = req.headers['upload-length'];
    const deferredLength = req.headers['upload-defer-length'];
    // The request MUST include a Upload-Length or Upload-Defer-Length header
    if (!length && !deferredLength) {
      super.send(res, 400, { 'Content-Type': 'text/plain' }, 'Upload-Length or Upload-Defer-Length required');
      throw new Error('Upload-Length or Upload-Defer-Length required');
    }

    length = parseInt(length, 10);
    // The value MUST be a non-negative integer.
    if (isNaN(length) || length < 0) {
      super.send(res, 400, { 'Content-Type': 'text/plain' }, 'Upload-Length must be non-negative');
      throw new Error('Upload-Length must be non-negative');
    }

    if (!req.headers['upload-metadata']) {
      super.send(res, 400, { 'Content-Type': 'text/plain' }, 'Upload-Metadata (filename) must be provided');
      throw new Error('Original file name missing');
    }

    const metadata = req.headers['upload-metadata'].split(' ');

    if (metadata[0] !== 'filename') {
      super.send(res, 400, { 'Content-Type': 'text/plain' }, 'Invalid metadata');
      throw new Error('Invalid metadata');
    }

    req.originalName = metadata[1];

    const file = new File(length);
    return yield this.store.create(file)
      .then(location => {
        const url = `http://${req.headers.host}/${this.store.path}/${file.id}`;
        return super.send(res, 201, { Location: url });
      })
      .catch(error => {
        super.send(res, 404);
        // Let this bubble up to where handler is called
        throw error;
      });
  }
}

module.exports = PostHandler;
