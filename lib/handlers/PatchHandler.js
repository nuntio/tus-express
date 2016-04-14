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
  *send(req, res, options) {
    const filename = options.filename;
    if (!filename) {
      return yield super.send(res, 404, { 'Content-Type': 'text/plain' }, 'Invalid file name');
    }

    let offset = req.headers['upload-offset'];
    // The request MUST include a Upload-Offset header
    if (!offset) {
      return yield super.send(res, 400, { 'Content-Type': 'text/plain' }, 'Upload-Offset header not included');
    }

    offset = parseInt(offset, 10);
    // The value MUST be a non-negative integer.
    if (isNaN(offset) || offset < 0) {
      return yield super.send(res, 400, { 'Content-Type': 'text/plain' }, 'Upload-Offset must be non-negative');
    }

    const fileStats = yield this.store.getOffset(filename);
    // The Upload-Offset header’s value MUST be equal to the current offset of the resource
    if (offset !== fileStats.size) {
      return yield super.send(res, 409, { 'Content-Type': 'text/plain' }, 'Upload-Offset does not match');
    }

    return yield this.store.write(req, filename, offset)
      .then(newOffset => super.send(res, 204, { 'Upload-Offset': newOffset }));
  }
}

module.exports = PatchHandler;
