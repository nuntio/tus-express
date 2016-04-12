'use strict';

const BaseHandler = require('./BaseHandler');

class PatchHandler extends BaseHandler {
  /**
   * Write data to the DataStore and return the new offset.
   *
   * @param  {object} req http.incomingMessage
   * @param  {object} res http.ServerResponse
   * @return {function}
   */
  *send(req, res) {
    const re = new RegExp(`\\${this.store.path}\\/(\\w+)\/?`);
    const match = req.url.match(re);
    if (!match) {
      super.send(res, 404);
      throw new Error('File does not exist');
    }

    const fileName = match[1];

    let offset = req.headers['upload-offset'];
    // The request MUST include a Upload-Offset header
    if (!offset) {
      super.send(res, 400, { 'Content-Type': 'text/plain' }, 'Upload-Offset header not included');
      throw new Error('Upload-Offset header not included');
    }

    offset = parseInt(offset, 10);
    // The value MUST be a non-negative integer.
    if (isNaN(offset) || offset < 0) {
      super.send(res, 400, { 'Content-Type': 'text/plain' }, 'Upload-Offset must be non-negative');
      throw new Error('Upload-Offset must be non-negative');
    }

    const fileStats = yield this.store.getOffset(fileName);
    // The Upload-Offset header’s value MUST be equal to the current offset of the resource
    if (offset !== fileStats.size) {
      super.send(res, 409, { 'Content-Type': 'text/plain' }, 'Upload-Offset does not match');
      throw new Error('Upload-Offset does not match');
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

    return yield this.store.write(req, fileName, offset)
      .then(newOffset => super.send(res, 204, { 'Upload-Offset': newOffset }))
      .catch(error => {
        super.send(res, 404);
        // Let this bubble up to where handler is called
        throw error;
      });
  }
}

module.exports = PatchHandler;
