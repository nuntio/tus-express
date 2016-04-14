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
  *send(req, res, options) {
    let length = req.headers['upload-length'];
    const deferredLength = req.headers['upload-defer-length'];
    // The request MUST include a Upload-Length or Upload-Defer-Length header
    if (!length && !deferredLength) {
      return yield super.send(res, 400, { 'Content-Type': 'text/plain' }, 'Upload-Length or Upload-Defer-Length required');
    }

    length = parseInt(length, 10);
    // The value MUST be a non-negative integer.
    if (isNaN(length) || length < 0) {
      return yield super.send(res, 400, { 'Content-Type': 'text/plain' }, 'Upload-Length must be non-negative');
    }

    const metadata = this.normalizeMetadata(req.headers['upload-metadata']);

    const file = new File(length);
    let extension = '';
    if (metadata && metadata.filename) {
      const originalNameBuffer = new Buffer(metadata.filename, 'base64');
      let originalName = originalNameBuffer.toString();

      // Strip away extension
      const dotIdx = originalName.lastIndexOf('.');
      extension = originalName.substring(dotIdx);
      originalName = originalName.substring(0, dotIdx);

      file.id = originalName;
    }

    if (options.filename) {
      // If filename is provided by the server, then it should override the client's header
      file.id = options.filename;
    }

    file.id += extension;

    return yield this.store.create(file)
      .then(() => {
        let url;

        // If url is provided by the server, then it should override the default url.
        if (!options.url) url = `http://${req.headers.host}${req.url}${file.id}`;
        else url = options.url;

        return super.send(res, 201, { Location: url });
      });
  }

  normalizeMetadata(metadata) {
    if (!metadata) return null;

    const normalizeCommas = metadata.replace(', ', ',').replace(' ,', ',');

    const dataArray = normalizeCommas.split(',').map(data => data.split(' '));

    const dataObj = {};
    for (const data of dataArray) {
      dataObj[data[0]] = data[1];
    }

    return dataObj;
  }
}

module.exports = PostHandler;
