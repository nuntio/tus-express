/* eslint-disable consistent-return */
'use strict';

const fs = require('fs');
const path = require('path');

const DataStore = require('./DataStore');

const MASK = '0777';
const IGNORED_MKDIR_ERROR = 'EEXIST';

/**
 * @fileOverview
 * Store using local filesystem.
 *
 * @author Ben Stahl <bhstahl@gmail.com>
 */

class FileStore extends DataStore {
  constructor(options) {
    super(options);

    if (!options.directory) {
      throw new Error('FileStore must have a directory');
    }

    this.directory = options.directory;

    this.extensions = ['creation'];
    this._checkOrCreateDirectory();
  }

  /**
   *  Ensure the directory exists.
   */
  _checkOrCreateDirectory() {
    fs.mkdir(path.join(this.directory, this.path), MASK, (error) => {
      if (error && error.code !== IGNORED_MKDIR_ERROR) {
        throw error;
      }
    });
  }

  /**
   * Create an empty file.
   *
   * @param  {File} file
   * @return {Promise}
   */
  create(file) {
    super.create(file);
    return new Promise((resolve, reject) => {
      fs.open(path.join(this.directory, this.path, file.id), 'w', (err, fd) => {
        if (err) {
          console.log(err);
          return reject(err);
        }

        fs.close(fd, (exception) => {
          if (exception) {
            return reject(exception);
          }

          resolve();
        });
      });
    });
  }

  write(req, fileName, offset) {
    return new Promise((resolve, reject) => {
      const filePath = path.join(this.directory, this.path, fileName);
      const options = {
        flags: 'r+',
        start: offset,
      };

      const stream = fs.createWriteStream(filePath, options);

      if (!stream) {
        return reject('unable to create write stream');
      }

      let newOffset = 0;
      req.on('data', (buffer) => {
        newOffset += buffer.length;
      });

      req.on('end', () => {
        console.log(`${newOffset} bytes written to ${filePath}`);
        // The new offset MUST be the sum of the offset before the
        // PATCH request and the number of bytes received and
        // processed or stored during the current PATCH request.
        newOffset += offset;
        resolve(newOffset);
      });

      stream.on('error', (e) => {
        reject(e);
      });

      req.pipe(stream);
    });
  }

  /**
   * Return file stats, if they exist
   *
   * @param  {string} fileName name of the file
   * @return {object} fs stats
   */
  getOffset(fileName) {
    return new Promise((resolve, reject) => {
      fs.stat(path.join(this.directory, this.path, fileName), (error, stats) => {
        if (error) {
          console.log(`tus-express info: Could not find file at ${path.join(this.directory, this.path, fileName)}`);
          reject(error);
        }

        resolve(stats);
      });
    });
  }
}

module.exports = FileStore;
