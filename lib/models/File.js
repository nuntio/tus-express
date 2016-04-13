'use strict';

const Uid = require('./Uid');

/**
 * @fileOverview
 * Model for File objects.
 *
 * @author Ben Stahl <bhstahl@gmail.com>
 */

class File {
  constructor(entityLength) {
    this.entityLength = entityLength;
    this.id = Uid.rand();
  }
}

module.exports = File;
