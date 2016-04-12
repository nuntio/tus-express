'use strict';

/**
 * @fileOverview
 * TUS Protocol 1.0.0 Server Implementation.
 *
 * @author Ben Stahl <bhstahl@gmail.com>
 */

const co = require('co');

const DataStore = require('./stores/DataStore');

const OptionsHandler = require('./handlers/OptionsHandler');
const PostHandler = require('./handlers/PostHandler');
const HeadHandler = require('./handlers/HeadHandler');
const PatchHandler = require('./handlers/PatchHandler');
const TUS_RESUMABLE = require('./constants').TUS_RESUMABLE;

class TusHandlers {

  constructor() {
    this.handlers = {};
  }

  /**
   * Return the data store
   * @return {DataStore}
   */
  get datastore() {
    return this._datastore;
  }

  /**
   * Ensure store is a DataStore and add file create API handler
   *
   * @param  {DataStore} store Store for uploaded files
   */
  set datastore(store) {
    if (!(store instanceof DataStore)) {
      throw new Error(`${store} is not a DataStore`);
    }

    this._datastore = store;

    this.handlers = {
      OPTIONS: new OptionsHandler(store),
      POST: new PostHandler(store),
      HEAD: new HeadHandler(store),
      PATCH: new PatchHandler(store),
    };
  }

  /**
   * Middleware to be plugged into express for all types of requests.
   *
   * @param  {object} req http.incomingMessage
   * @param  {object} res http.ServerResponse
   * @return {ServerResponse}
   */
  handle(req, res, next) {
    console.info(`${req.method} ${req.url}`);
    // Allow overriding the HTTP method. The reason for this is
    // that some libraries/environments do not support PATCH and
    // DELETE requests, e.g. Flash in a browser and parts of Java
    if (req.headers['x-http-method-override']) {
      req.method = req.headers['x-http-method-override'].toUpperCase();
    }

    // The Tus-Resumable header MUST be included in every request and
    // response except for OPTIONS requests. The value MUST be the version
    // of the protocol used by the Client or the Server.
    res.setHeader('Tus-Resumable', TUS_RESUMABLE);
    if (req.method !== 'OPTIONS' && req.headers['tus-resumable'] !== TUS_RESUMABLE) {
      res.writeHead(412, {}, 'Precondition Failed');
      res.end();
      return Promise.reject(new Error('Invalid tus header'));
    }

    if (req.headers.origin) {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    }

    // Handle POST, HEAD, PATCH, OPTIONS requests
    if (this.handlers[req.method]) {
      return co(this.handlers[req.method].send(req, res));
    }

    const err = new Error('Not found');
    err.status = 404;
    return Promise.reject(err);
  }

}

module.exports = TusHandlers;
