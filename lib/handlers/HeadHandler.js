'use strict';

const BaseHandler = require('./BaseHandler');
const EXPOSED_HEADERS = require('../constants').EXPOSED_HEADERS;

class HeadHandler extends BaseHandler {
  /**
   * Send the uploaded file offset or 404.
   *
   * @param  {object} req http.incomingMessage
   * @param  {object} res http.ServerResponse
   * @return {function}
   */
  *send(req, res, options) {
    const filename = options.filename;
    if (!filename) {
      return yield super.send(res, 400, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' }, 'Invalid file name');
    }

    return yield this.store.getOffset(filename)
      .then(stats => {
        res.setHeader('Upload-Offset', stats.size);
        res.setHeader('Cache-Control', 'no-store');
      }, (err) => {
        // This is not really an error, it just means that no
        // file was found and new file can be created.
        console.log(`${filename} does not exist`);

        const headers = {
          'Cache-Control': 'no-store',
          'Content-Length': 0,
          'Access-Control-Expose-Headers': EXPOSED_HEADERS,
        };

        res.writeHead(404, headers);
      })
      .then(() => res.end);
  }
}

module.exports = HeadHandler;
