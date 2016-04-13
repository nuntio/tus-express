'use strict';

const DataStore = require('../stores/DataStore');
const EXPOSED_HEADERS = require('../constants').EXPOSED_HEADERS;

class BaseHandler {
  constructor(store) {
    if (!(store instanceof DataStore)) {
      throw new Error(`${store} is not a DataStore`);
    }
    this.store = store;
  }

  /**
   * Wrapper on http.ServerResponse.
   *
   * @param  {object} res http.ServerResponse
   * @param  {integer} status
   * @param  {object} headers
   * @param  {string} body
   * @return {ServerResponse}
   */
  send(res, status, headers, body) {
    headers = headers || {};
    body = body || '';
    headers = Object.assign(headers, {
      'Content-Length': body.length,
      'Access-Control-Expose-Headers': EXPOSED_HEADERS,
    });

    res.writeHead(status, headers);
    res.write(body);

    return Promise.resolve(res.end);
  }
}

module.exports = BaseHandler;
