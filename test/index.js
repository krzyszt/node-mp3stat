var assert = require('assert');
var mp3dat = require('../index.js');
var testFile = 'test/test.mp3';

assert(mp3dat, 'mp3dat failed to load');
assert(mp3dat.stat, 'there should be a stat method');
assert(mp3dat.stat instanceof Function, 'stat should be a Function');