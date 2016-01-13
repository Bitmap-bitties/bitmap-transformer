const fs = require('fs');
const os = require('os');
const EE = require('events').EventEmitter; //NEED?
const transformer = require('./transform'); //NEED?

// what are all these magic numbers? a few comments would help with readability
const START = 54;
const PIXEL_INDEX = 10;
const NUM_COL_INDEX = 46;
const DEPTH_INDEX = 28;
const NON_PAL_DEPTH = 32;
const BYTE = 8;

var endianness = os.endianness();
var ee = new EE(); //NEED?

//takes a bitmapObject with a file property and populates the rest of the object
var meta = function (bitmapObject){
  // this seems like a bit of an odd design, are callers of this method expecting it to mutate bitmapObject?
  // It seems like you should be returning a separate object rather than embedding the properties into the funciton argument
  
  //readfile in and process it
  fs.readFile(bitmapObject.path, function(err, bitmap) {
    if (err) return console.log( err.code );//eslint-disable-line
    //add buffer to bitmapObject
    //process the buffer into an object!
    bitmapObject.buffer = bitmap;
    bitmapObject.startPixelData = bitmapObject.buffer[`readUInt32${endianness}`](PIXEL_INDEX);
    bitmapObject.numColors = bitmapObject.buffer[`readUInt32${endianness}`](NUM_COL_INDEX);
    //handle palette/non-palette
    if (bitmapObject.numColors == 0){
      //go the non-palette rout
      bitmapObject.depth = bitmapObject.buffer[`readUInt16${endianness}`](DEPTH_INDEX);
      bitmapObject.endIndex = bitmapObject.buffer.length;
    } else {
      //go palette route
      bitmapObject.depth = NON_PAL_DEPTH;
      bitmapObject.endIndex = START + bitmapObject.numColors * (bitmapObject.depth/BYTE);
    }
    ee.emit('transform', bitmapObject);
  });
  //returns are primarily for testing
  return bitmapObject.buffer ? bitmapObject : setTimeout(function(){ return bitmapObject }, 10);//eslint-disable-line
};

// this is another case of a mutating method, maybe you should return a new bitmapObject which is transformed instead?
var transformObject = function(bitmapObject){
  transformer.colorGet(bitmapObject);
  transformer[bitmapObject.transform](bitmapObject.colors);
  transformer.updateBuffer(bitmapObject);
  //emit to write
  ee.emit('makeBuffer', bitmapObject);
  return bitmapObject.colors ? bitmapObject : setTimeout(function(){ return bitmapObject }, 10);//eslint-disable-line
};
var writeToFile = function(bitmapObject){
  fs.writeFile('./write-file.bmp', bitmapObject.buffer);
  console.log('file has been writtin');//eslint-disable-line
};

ee.on('transform', transformObject);
ee.on('makeBuffer', writeToFile);

module.exports.meta = meta;
module.exports.transformObject = transformObject;
module.exports.writeToFile = writeToFile;
