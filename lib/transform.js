const BYTE = 8;
const RGB = 3;
const START = 54; // it would be helpful to add a comment to some of these constants so others can understand what they are for... is this the length of the image header?

// it looks like this is taking the pixels from an image and building up an array of arrays like [[rgba][rgba]...]
// this consumes a lot of memory since you're allocating an array for every pixel in the image. you might try to rewrite these methods so they operate directly on the buffer (or a copy of the buffer if needed)
var colorGet = function(obj){
  var temp = [];
  obj.colors = [];

  // should this 54 be START instead?
  for (var i = 54; i < obj.endIndex ; i++){ 
    temp.push(obj.buffer.readUInt8(i));
    if (temp.length === obj.depth/BYTE){
      obj.colors.push(temp);
      temp = [];
    }
  }
};

//because colors is a multidemensional array nested for loop
function updateBuffer(obj){
  for (var i = 0, offset=START ; i < obj.colors.length; i++){
    for (var j=0; j < obj.depth/BYTE ; j++, offset++){
      obj.buffer.writeUInt8(obj.colors[i][j], offset);
    }
  }
}

//invert!
function invert(colors){
  colors = colors.map(function(rgba){
    // this might be more concise and readable if you unrolled the loop. depending on the interpreter, it might also be faster. loops are great for variable sized things and for making code shorter and less repetitive, but in this case it just obfuscates what's going on. reasonable people will disagree on this...
    // rgba[0] = 255 - rgba[0]
    // rgba[1] = 255 - rgba[1]
    // rgba[2] = 255 - rgba[2]
    var i = 0;
    while (i < RGB){ //change colors, not alpha
      rgba[i] = 255 - rgba[i];
      i++;
    }

    // console.log(rgba[1]);
    return rgba;
  });
  return colors[1];
}
//red!
// what is colors here? it looks like it must be a 2 dimensional array
// what is this supposed to do? It looks like it just boosts the red and clamps the value. Is that what you want, or should it convert the whole image to red-scale?
function red(colors){
  colors = colors.map(function(rgba){
    var c = rgba[0] * 3;
    rgba[0] = (c <= 255) ? c : 255;

    return rgba;
  });
  return colors;
}
//gray!
// what is colors here? it looks like it must be a 2 dimensional array
function gray(colors){
  colors = colors.map(function(rgba){
    // RGB -> grayscale is usually implemented as a weighted sum since it's not a linear color system.
    //   check this wikipedia entry, specifically "Converting color to grayscale"
    //   https://en.wikipedia.org/wiki/Grayscale
    // const redWeight   = 0.2126
    // const greenWeight = 0.7152
    // const blueWeight  = 0.0722
    // var gray = (rgba[0] * redWeight) + (rgba[1] * greenWeight) + (rgba[2] * blueWeight);
    var gray = (rgba[0] + rgba[1] + rgba[2])/RGB;
    
    // unroll this loop?
    var i = 0;
    while (i < RGB){ //change colors, not alpha
      rgba[i] = gray;
      i++;
    }
    return rgba;
  });
  return colors;
}
module.exports.colorGet = colorGet;
module.exports.updateBuffer = updateBuffer;
module.exports.red = red;
module.exports.gray = gray;
module.exports.invert = invert;
