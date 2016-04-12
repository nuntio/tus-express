'use strict';

/**
 * @fileOverview
 * Based store for all DataStore classes.
 *
 * @author Ben Stahl <bhstahl@gmail.com>
 */

const File = require('../models/File');

class DataStore {
  constructor(options) {
    if (!options || !options.path) {
      throw new Error('Store must have a path');
    }
    this.path = options.path.replace(/^\//, '');
  }

  get extensions() {
    if (!this._extensions) {
      return null;
    }
    return this._extensions.join();
  }

  set extensions(extensionsArray) {
    if (!Array.isArray(extensionsArray)) {
      throw new Error('DataStore extensions must be an array');
    }
    this._extensions = extensionsArray;
  }

  /**
   * Called in POST requests. This method just creates a
   * file, implementing the creation extension.
   *
   * http://tus.io/protocols/resumable-upload.html#creation
   *
   * @param  {object} file File model.
   */
  create(file) {
    if (!(file instanceof File)) {
      throw new Error(`${file} is not a File`);
    }
    console.log(`[DataStore] create: ${file.id}`);
  }

  /**
   * Called in PATCH requests. This method should write data
   * to the DataStore file, and possibly implement the
   * concatenation extension.
   *
   * http://tus.io/protocols/resumable-upload.html#concatenation
   *
   * @param  {object} req http.incomingMessage
   */
  write(req) {
    console.log('[DataStore] write');
  }

  /**
   * Called in HEAD requests. This method should return the bytes
   * writen to the DataStore, for the client to know where to resume
   * the upload.
   *
   * @param  {string} id     filename
   * @return {Promise}       bytes written
   */
  getOffset(id) {
    return new Promise((resolve, reject) => {
      if (!id) {
        return reject('No file ID');
      }

      return resolve({ size: 0 });
    });
  }
}

module.exports = DataStore;
