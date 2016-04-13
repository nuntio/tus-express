'use strict';

const BaseHandler = require('./BaseHandler');

class HeadHandler extends BaseHandler {
  /**
   * Send the uploaded file offset or 404.
   *
   * @param  {object} req http.incomingMessage
   * @param  {object} res http.ServerResponse
   * @return {function}
   */
  *send(req, res) {
    const fileName = req.fileName || req.params.fileName;
    if (!fileName) {
      return yield super.send(res, 400, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' }, 'Invalid file name');
    }

    return yield this.store.getOffset(fileName)
      .then(stats => {
        res.setHeader('Upload-Offset', stats.size.toString());
        res.setHeader('Cache-Control', 'no-store');
        return res.end;
      }, () => {
        // This is not really an error, it just means that no
        // file was found and new file can be created.
        console.log(`${fileName} does not exist`);
        super.send(res, 404, { 'Cache-Control': 'no-store' });
      });
  }
}

module.exports = HeadHandler;
