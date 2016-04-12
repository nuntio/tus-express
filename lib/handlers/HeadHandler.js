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
      super.send(res, 404);
      throw new Error('File does not exist');
    }

    return yield this.store.getOffset(fileName)
      .then(stats => {
        res.setHeader('Upload-Offset', stats.size);
        res.setHeader('Cache-Control', 'no-store');
        return res.end;
      }).catch(error => {
        super.send(res, 404);
        // Let this bubble up to where handler is called
        throw error;
      });
  }
}

module.exports = HeadHandler;
