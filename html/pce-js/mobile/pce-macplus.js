// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
try {
  this['Module'] = Module;
  Module.test;
} catch(e) {
  this['Module'] = Module = {};
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  if (!Module['arguments']) {
    Module['arguments'] = process['argv'].slice(2);
  }
  module.exports = Module;
}
if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  Module['read'] = read;
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (!Module['arguments']) {
    if (typeof scriptArgs != 'undefined') {
      Module['arguments'] = scriptArgs;
    } else if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
  this['Module'] = Module;
}
if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  if (!Module['print']) {
    Module['print'] = function(x) {
      console.log(x);
    };
  }
  if (!Module['printErr']) {
    Module['printErr'] = function(x) {
      console.log(x);
    };
  }
  this['Module'] = Module;
}
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (!Module['arguments']) {
    if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  if (!Module['print']) {
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  Module['load'] = importScripts;
}
if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL) {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
if (!Module['preRun']) Module['preRun'] = [];
if (!Module['postRun']) Module['postRun'] = [];
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    type.flatIndexes = type.fields.map(function(field) {
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        size = Types.types[field].flatSize;
        alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2 + 2*i;
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+(((low)>>>(0))))+((+(((high)>>>(0))))*(+(4294967296)))) : ((+(((low)>>>(0))))+((+(((high)|(0))))*(+(4294967296))))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function abort(text) {
  Module.print(text + ':\n' + (new Error).stack);
  ABORT = true;
  throw "Assertion: " + text;
}
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = globalScope['Module']['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,((Math.min((+(Math.floor((value)/(+(4294967296))))), (+(4294967295))))|0)>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, or (2) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 33554432;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATINIT__ = []; // functions called during startup
var __ATMAIN__ = []; // functions called when main() is to be run
var __ATEXIT__ = []; // functions called during shutdown
var runtimeInitialized = false;
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function addPreRun(func) {
  if (!Module['preRun']) Module['preRun'] = [];
  else if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
  Module['preRun'].push(func);
}
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 63496;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });
var _stdout;
var _stdin;
var _stderr;
var _stdout = _stdout=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var _stdin = _stdin=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var _stderr = _stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,131,3,0,0,0,0,0,0,130,2,0,0,44,0,0,0,132,4,0,0,4,0,0,0,134,6,0,0,48,0,0,1,132,4,0,0,80,0,0,1,130,2,0,0,46,0,0,1,131,3,0,0,88,0,0,1,134,6,0,0,12,0,0,0,1,2,0,0,24,0,0,0,138,2,0,0,18,0,0,0,129,2,0,0,0,0,0,0,139,2,0,0,20,0,0,0,130,2,0,0,2,0,0,0,2,2,0,0,26,0,0,0,131,2,0,0,4,0,0,0,3,2,0,0,28,0,0,0,132,2,0,0,6,0,0,0,4,2,0,0,30,0,0,0,133,2,0,0,8,0,0,0,5,2,0,0,32,0,0,0,134,2,0,0,10,0,0,0,6,2,0,0,34,0,0,0,135,2,0,0,12,0,0,0,7,2,0,0,36,0,0,0,136,2,0,0,14,0,0,0,8,2,0,0,38,0,0,0,137,2,0,0,16,0,0,1,144,2,0,0,84,0,0,1,135,2,0,0,56,0,0,1,145,2,0,0,86,0,0,1,136,2,0,0,58,0,0,1,146,2,0,0,88,0,0,1,137,2,0,0,60,0,0,1,147,2,0,0,90,0,0,1,138,2,0,0,62,0,0,1,129,2,0,0,22,0,0,1,139,2,0,0,64,0,0,1,130,2,0,0,46,0,0,1,140,2,0,0,66,0,0,1,131,2,0,0,48,0,0,1,141,2,0,0,68,0,0,1,132,2,0,0,50,0,0,1,142,2,0,0,70,0,0,1,133,2,0,0,52,0,0,1,143,2,0,0,72,0,0,1,134,2,0,0,54,0,0,80,0,0,0,0,92,0,0,38,0,0,0,72,0,0,0,8,0,0,0,8,0,0,0,0,168,0,0,248,213,0,0,1,168,0,0,208,213,0,0,2,168,0,0,32,213,0,0,3,168,0,0,176,212,0,0,4,168,0,0,64,212,0,0,5,168,0,0,16,212,0,0,6,168,0,0,224,211,0,0,7,168,0,0,160,211,0,0,8,168,0,0,112,211,0,0,9,168,0,0,88,211,0,0,10,168,0,0,56,211,0,0,11,168,0,0,32,211,0,0,12,168,0,0,144,210,0,0,13,168,0,0,40,210,0,0,14,168,0,0,224,209,0,0,15,168,0,0,184,209,0,0,16,168,0,0,128,209,0,0,17,168,0,0,104,209,0,0,18,168,0,0,72,209,0,0,19,168,0,0,48,209,0,0,20,168,0,0,224,208,0,0,21,168,0,0,200,208,0,0,22,168,0,0,16,208,0,0,23,168,0,0,152,207,0,0,24,168,0,0,48,207,0,0,25,168,0,0,160,206,0,0,26,168,0,0,56,206,0,0,27,168,0,0,32,206,0,0,28,168,0,0,0,206,0,0,29,168,0,0,232,205,0,0,31,168,0,0,144,205,0,0,32,168,0,0,112,205,0,0,33,168,0,0,224,204,0,0,34,168,0,0,40,204,0,0,35,168,0,0,16,204,0,0,38,168,0,0,232,203,0,0,39,168,0,0,192,203,0,0,40,168,0,0,168,203,0,0,41,168,0,0,80,203,0,0,42,168,0,0,40,203,0,0,43,168,0,0,8,203,0,0,44,168,0,0,192,202,0,0,45,168,0,0,240,201,0,0,46,168,0,0,192,201,0,0,47,168,0,0,176,201,0,0,48,168,0,0,152,201,0,0,49,168,0,0,136,201,0,0,51,168,0,0,104,201,0,0,52,168,0,0,40,201,0,0,53,168,0,0,24,201,0,0,54,168,0,0,232,200,0,0,55,168,0,0,216,200,0,0,56,168,0,0,112,200,0,0,57,168,0,0,248,199,0,0,58,168,0,0,224,199,0,0,59,168,0,0,192,199,0,0,60,168,0,0,152,199,0,0,61,168,0,0,136,199,0,0,62,168,0,0,104,199,0,0,63,168,0,0,72,199,0,0,64,168,0,0,8,199,0,0,65,168,0,0,232,198,0,0,66,168,0,0,136,198,0,0,67,168,0,0,48,198,0,0,68,168,0,0,40,198,0,0,69,168,0,0,24,198,0,0,70,168,0,0,8,198,0,0,71,168,0,0,248,197,0,0,72,168,0,0,232,197,0,0,73,168,0,0,216,197,0,0,74,168,0,0,184,197,0,0,75,168,0,0,168,197,0,0,76,168,0,0,64,197,0,0,77,168,0,0,240,196,0,0,78,168,0,0,184,196,0,0,79,168,0,0,72,196,0,0,80,168,0,0,224,195,0,0,81,168,0,0,72,195,0,0,82,168,0,0,240,194,0,0,83,168,0,0,112,194,0,0,84,168,0,0,24,194,0,0,85,168,0,0,248,193,0,0,86,168,0,0,152,193,0,0,88,168,0,0,40,193,0,0,89,168,0,0,16,193,0,0,90,168,0,0,224,192,0,0,91,168,0,0,168,192,0,0,92,168,0,0,144,192,0,0,93,168,0,0,128,192,0,0,94,168,0,0,120,192,0,0,95,168,0,0,88,192,0,0,96,168,0,0,48,192,0,0,97,168,0,0,232,191,0,0,98,168,0,0,112,191,0,0,99,168,0,0,96,191,0,0,100,168,0,0,72,191,0,0,101,168,0,0,48,191,0,0,102,168,0,0,24,191,0,0,103,168,0,0,232,190,0,0,104,168,0,0,200,190,0,0,105,168,0,0,168,190,0,0,106,168,0,0,152,190,0,0,107,168,0,0,80,190,0,0,108,168,0,0,8,190,0,0,109,168,0,0,232,189,0,0,110,168,0,0,200,189,0,0,111,168,0,0,160,189,0,0,112,168,0,0,136,189,0,0,113,168,0,0,104,189,0,0,114,168,0,0,72,189,0,0,115,168,0,0,24,189,0,0,116,168,0,0,8,189,0,0,117,168,0,0,192,188,0,0,118,168,0,0,96,188,0,0,119,168,0,0,72,188,0,0,120,168,0,0,32,188,0,0,121,168,0,0,16,188,0,0,122,168,0,0,224,187,0,0,123,168,0,0,192,187,0,0,124,168,0,0,176,187,0,0,125,168,0,0,144,187,0,0,125,168,0,0,120,187,0,0,126,168,0,0,48,187,0,0,127,168,0,0,240,186,0,0,128,168,0,0,224,186,0,0,129,168,0,0,208,186,0,0,130,168,0,0,200,186,0,0,131,168,0,0,176,186,0,0,132,168,0,0,144,186,0,0,133,168,0,0,120,186,0,0,134,168,0,0,88,186,0,0,135,168,0,0,64,186,0,0,136,168,0,0,0,186,0,0,137,168,0,0,176,185,0,0,138,168,0,0,160,185,0,0,139,168,0,0,128,185,0,0,140,168,0,0,112,185,0,0,141,168,0,0,96,185,0,0,142,168,0,0,80,185,0,0,143,168,0,0,64,185,0,0,144,168,0,0,48,185,0,0,145,168,0,0,40,185,0,0,146,168,0,0,8,185,0,0,147,168,0,0,176,184,0,0,148,168,0,0,136,184,0,0,149,168,0,0,112,184,0,0,150,168,0,0,104,184,0,0,151,168,0,0,96,184,0,0,152,168,0,0,64,184,0,0,153,168,0,0,48,184,0,0,154,168,0,0,24,184,0,0,155,168,0,0,16,184,0,0,156,168,0,0,232,183,0,0,157,168,0,0,160,183,0,0,158,168,0,0,144,183,0,0,159,168,0,0,120,183,0,0,160,168,0,0,112,183,0,0,161,168,0,0,96,183,0,0,162,168,0,0,64,183,0,0,163,168,0,0,48,183,0,0,164,168,0,0,240,182,0,0,165,168,0,0,224,182,0,0,166,168,0,0,152,182,0,0,167,168,0,0,104,182,0,0,168,168,0,0,88,182,0,0,169,168,0,0,64,182,0,0,170,168,0,0,48,182,0,0,171,168,0,0,32,182,0,0,172,168,0,0,16,182,0,0,173,168,0,0,0,182,0,0,174,168,0,0,232,181,0,0,175,168,0,0,216,181,0,0,176,168,0,0,184,181,0,0,177,168,0,0,80,181,0,0,178,168,0,0,32,181,0,0,179,168,0,0,224,180,0,0,180,168,0,0,200,180,0,0,181,168,0,0,80,180,0,0,182,168,0,0,248,179,0,0,183,168,0,0,136,179,0,0,184,168,0,0,72,179,0,0,185,168,0,0,56,179,0,0,186,168,0,0,240,178,0,0,187,168,0,0,168,178,0,0,188,168,0,0,144,178,0,0,189,168,0,0,104,178,0,0,190,168,0,0,56,178,0,0,191,168,0,0,40,178,0,0,192,168,0,0,16,178,0,0,193,168,0,0,0,178,0,0,194,168,0,0,240,177,0,0,195,168,0,0,224,177,0,0,196,168,0,0,192,177,0,0,197,168,0,0,72,177,0,0,198,168,0,0,56,177,0,0,199,168,0,0,24,177,0,0,200,168,0,0,8,177,0,0,201,168,0,0,248,176,0,0,202,168,0,0,224,176,0,0,203,168,0,0,184,176,0,0,204,168,0,0,144,176,0,0,205,168,0,0,128,176,0,0,206,168,0,0,88,176,0,0,207,168,0,0,0,176,0,0,208,168,0,0,232,175,0,0,209,168,0,0,208,175,0,0,210,168,0,0,192,175,0,0,211,168,0,0,176,175,0,0,212,168,0,0,144,175,0,0,213,168,0,0,128,175,0,0,214,168,0,0,88,175,0,0,215,168,0,0,72,175,0,0,216,168,0,0,16,175,0,0,217,168,0,0,152,174,0,0,218,168,0,0,144,174,0,0,219,168,0,0,112,174,0,0,220,168,0,0,104,174,0,0,221,168,0,0,88,174,0,0,222,168,0,0,32,174,0,0,223,168,0,0,24,174,0,0,224,168,0,0,232,173,0,0,225,168,0,0,216,173,0,0,226,168,0,0,112,173,0,0,227,168,0,0,48,173,0,0,228,168,0,0,24,173,0,0,229,168,0,0,248,172,0,0,230,168,0,0,240,172,0,0,231,168,0,0,232,172,0,0,232,168,0,0,200,172,0,0,233,168,0,0,184,172,0,0,234,168,0,0,152,172,0,0,235,168,0,0,144,172,0,0,236,168,0,0,112,172,0,0,237,168,0,0,40,172,0,0,238,168,0,0,24,172,0,0,239,168,0,0,240,171,0,0,240,168,0,0,224,171,0,0,241,168,0,0,200,171,0,0,242,168,0,0,168,171,0,0,243,168,0,0,152,171,0,0,244,168,0,0,128,171,0,0,245,168,0,0,112,171,0,0,246,168,0,0,72,171,0,0,247,168,0,0,24,171,0,0,248,168,0,0,16,171,0,0,249,168,0,0,248,170,0,0,250,168,0,0,240,170,0,0,251,168,0,0,232,170,0,0,252,168,0,0,216,170,0,0,253,168,0,0,208,170,0,0,254,168,0,0,168,170,0,0,255,168,0,0,152,170,0,0,0,169,0,0,136,170,0,0,1,169,0,0,32,170,0,0,2,169,0,0,16,170,0,0,3,169,0,0,240,169,0,0,4,169,0,0,224,169,0,0,5,169,0,0,208,169,0,0,6,169,0,0,184,169,0,0,7,169,0,0,168,169,0,0,8,169,0,0,112,169,0,0,9,169,0,0,104,169,0,0,10,169,0,0,40,169,0,0,11,169,0,0,208,168,0,0,12,169,0,0,192,168,0,0,13,169,0,0,160,168,0,0,14,169,0,0,152,168,0,0,15,169,0,0,144,168,0,0,16,169,0,0,120,168,0,0,17,169,0,0,104,168,0,0,18,169,0,0,48,168,0,0,19,169,0,0,32,168,0,0,20,169,0,0,0,168,0,0,21,169,0,0,200,167,0,0,22,169,0,0,96,167,0,0,23,169,0,0,48,167,0,0,24,169,0,0,16,167,0,0,25,169,0,0,0,167,0,0,26,169,0,0,160,166,0,0,27,169,0,0,40,166,0,0,28,169,0,0,152,165,0,0,29,169,0,0,128,165,0,0,30,169,0,0,80,165,0,0,31,169,0,0,8,165,0,0,32,169,0,0,240,164,0,0,33,169,0,0,200,164,0,0,34,169,0,0,152,164,0,0,35,169,0,0,136,164,0,0,36,169,0,0,96,164,0,0,37,169,0,0,80,164,0,0,38,169,0,0,56,164,0,0,39,169,0,0,40,164,0,0,40,169,0,0,232,163,0,0,41,169,0,0,152,163,0,0,42,169,0,0,136,163,0,0,43,169,0,0,104,163,0,0,44,169,0,0,88,163,0,0,45,169,0,0,72,163,0,0,46,169,0,0,32,163,0,0,47,169,0,0,248,162,0,0,48,169,0,0,216,162,0,0,49,169,0,0,136,162,0,0,50,169,0,0,104,162,0,0,51,169,0,0,24,162,0,0,52,169,0,0,0,162,0,0,53,169,0,0,224,161,0,0,54,169,0,0,208,161,0,0,55,169,0,0,192,161,0,0,56,169,0,0,168,161,0,0,57,169,0,0,152,161,0,0,58,169,0,0,128,161,0,0,59,169,0,0,96,161,0,0,60,169,0,0,48,161,0,0,61,169,0,0,8,161,0,0,62,169,0,0,0,161,0,0,63,169,0,0,224,160,0,0,64,169,0,0,208,160,0,0,65,169,0,0,192,160,0,0,66,169,0,0,168,160,0,0,67,169,0,0,112,160,0,0,68,169,0,0,88,160,0,0,69,169,0,0,72,160,0,0,70,169,0,0,40,160,0,0,71,169,0,0,248,159,0,0,72,169,0,0,232,159,0,0,73,169,0,0,200,159,0,0,74,169,0,0,184,159,0,0,75,169,0,0,168,159,0,0,76,169,0,0,144,159,0,0,77,169,0,0,128,159,0,0,78,169,0,0,104,159,0,0,79,169,0,0,88,159,0,0,80,169,0,0,40,159,0,0,81,169,0,0,8,159,0,0,82,169,0,0,248,158,0,0,83,169,0,0,208,158,0,0,84,169,0,0,192,158,0,0,85,169,0,0,176,158,0,0,86,169,0,0,152,158,0,0,87,169,0,0,136,158,0,0,88,169,0,0,112,158,0,0,89,169,0,0,96,158,0,0,90,169,0,0,80,158,0,0,91,169,0,0,40,158,0,0,92,169,0,0,24,158,0,0,93,169,0,0,248,157,0,0,94,169,0,0,232,157,0,0,95,169,0,0,216,157,0,0,96,169,0,0,192,157,0,0,97,169,0,0,176,157,0,0,98,169,0,0,144,157,0,0,99,169,0,0,112,157,0,0,100,169,0,0,96,157,0,0,101,169,0,0,48,157,0,0,102,169,0,0,32,157,0,0,103,169,0,0,0,157,0,0,104,169,0,0,240,156,0,0,105,169,0,0,224,156,0,0,106,169,0,0,200,156,0,0,107,169,0,0,184,156,0,0,108,169,0,0,136,156,0,0,109,169,0,0,120,156,0,0,110,169,0,0,112,156,0,0,111,169,0,0,80,156,0,0,112,169,0,0,64,156,0,0,113,169,0,0,32,156,0,0,114,169,0,0,16,156,0,0,115,169,0,0,0,156,0,0,116,169,0,0,240,155,0,0,117,169,0,0,224,155,0,0,118,169,0,0,176,155,0,0,119,169,0,0,160,155,0,0,120,169,0,0,144,155,0,0,121,169,0,0,80,155,0,0,122,169,0,0,24,155,0,0,123,169,0,0,224,154,0,0,124,169,0,0,200,154,0,0,125,169,0,0,168,154,0,0,126,169,0,0,96,154,0,0,127,169,0,0,224,153,0,0,128,169,0,0,168,153,0,0,129,169,0,0,144,153,0,0,130,169,0,0,104,153,0,0,131,169,0,0,56,153,0,0,132,169,0,0,32,153,0,0,133,169,0,0,0,153,0,0,134,169,0,0,232,152,0,0,135,169,0,0,200,152,0,0,136,169,0,0,176,152,0,0,137,169,0,0,160,152,0,0,138,169,0,0,128,152,0,0,139,169,0,0,112,152,0,0,140,169,0,0,80,152,0,0,141,169,0,0,248,151,0,0,142,169,0,0,200,151,0,0,143,169,0,0,176,151,0,0,144,169,0,0,160,151,0,0,145,169,0,0,144,151,0,0,146,169,0,0,120,151,0,0,147,169,0,0,80,151,0,0,148,169,0,0,48,151,0,0,149,169,0,0,32,151,0,0,150,169,0,0,216,150,0,0,151,169,0,0,176,150,0,0,152,169,0,0,152,150,0,0,153,169,0,0,120,150,0,0,154,169,0,0,104,150,0,0,155,169,0,0,88,150,0,0,156,169,0,0,64,150,0,0,157,169,0,0,48,150,0,0,158,169,0,0,0,150,0,0,159,169,0,0,240,149,0,0,160,169,0,0,128,149,0,0,161,169,0,0,104,149,0,0,162,169,0,0,88,149,0,0,163,169,0,0,56,149,0,0,164,169,0,0,40,149,0,0,165,169,0,0,24,149,0,0,166,169,0,0,0,149,0,0,167,169,0,0,240,148,0,0,168,169,0,0,176,148,0,0,169,169,0,0,160,148,0,0,170,169,0,0,136,148,0,0,171,169,0,0,104,148,0,0,172,169,0,0,88,148,0,0,173,169,0,0,56,148,0,0,174,169,0,0,40,148,0,0,175,169,0,0,24,148,0,0,176,169,0,0,0,148,0,0,177,169,0,0,240,147,0,0,178,169,0,0,200,147,0,0,179,169,0,0,184,147,0,0,180,169,0,0,152,147,0,0,181,169,0,0,104,147,0,0,182,169,0,0,88,147,0,0,183,169,0,0,48,147,0,0,184,169,0,0,32,147,0,0,185,169,0,0,16,147,0,0,186,169,0,0,248,146,0,0,187,169,0,0,240,146,0,0,188,169,0,0,200,146,0,0,189,169,0,0,184,146,0,0,190,169,0,0,152,146,0,0,191,169,0,0,80,146,0,0,192,169,0,0,64,146,0,0,193,169,0,0,40,146,0,0,194,169,0,0,32,146,0,0,195,169,0,0,16,146,0,0,196,169,0,0,248,145,0,0,197,169,0,0,232,145,0,0,198,169,0,0,208,145,0,0,199,169,0,0,192,145,0,0,200,169,0,0,152,145,0,0,201,169,0,0,136,145,0,0,202,169,0,0,128,145,0,0,203,169,0,0,96,145,0,0,204,169,0,0,88,145,0,0,205,169,0,0,72,145,0,0,206,169,0,0,56,145,0,0,207,169,0,0,40,145,0,0,208,169,0,0,248,144,0,0,209,169,0,0,232,144,0,0,210,169,0,0,208,144,0,0,211,169,0,0,160,144,0,0,212,169,0,0,152,144,0,0,213,169,0,0,128,144,0,0,214,169,0,0,120,144,0,0,215,169,0,0,104,144,0,0,216,169,0,0,80,144,0,0,217,169,0,0,64,144,0,0,218,169,0,0,48,144,0,0,219,169,0,0,40,144,0,0,220,169,0,0,8,144,0,0,221,169,0,0,184,143,0,0,222,169,0,0,160,143,0,0,223,169,0,0,120,143,0,0,224,169,0,0,80,143,0,0,225,169,0,0,32,143,0,0,226,169,0,0,224,142,0,0,227,169,0,0,152,142,0,0,228,169,0,0,48,142,0,0,229,169,0,0,24,142,0,0,230,169,0,0,248,141,0,0,231,169,0,0,208,141,0,0,232,169,0,0,192,141,0,0,233,169,0,0,168,141,0,0,234,169,0,0,144,141,0,0,235,169,0,0,120,141,0,0,235,169,0,0,104,141,0,0,236,169,0,0,88,141,0,0,236,169,0,0,64,141,0,0,237,169,0,0,56,141,0,0,238,169,0,0,16,141,0,0,239,169,0,0,232,140,0,0,240,169,0,0,184,140,0,0,241,169,0,0,152,140,0,0,242,169,0,0,144,140,0,0,243,169,0,0,136,140,0,0,244,169,0,0,120,140,0,0,245,169,0,0,56,140,0,0,246,169,0,0,240,139,0,0,247,169,0,0,224,139,0,0,248,169,0,0,200,139,0,0,249,169,0,0,144,139,0,0,250,169,0,0,120,139,0,0,251,169,0,0,88,139,0,0,252,169,0,0,72,139,0,0,253,169,0,0,56,139,0,0,254,169,0,0,40,139,0,0,255,169,0,0,16,139,0,0,0,170,0,0,200,138,0,0,1,170,0,0,184,138,0,0,3,170,0,0,160,138,0,0,4,170,0,0,88,138,0,0,5,170,0,0,72,138,0,0,6,170,0,0,40,138,0,0,7,170,0,0,24,138,0,0,8,170,0,0,8,138,0,0,9,170,0,0,248,137,0,0,10,170,0,0,224,137,0,0,11,170,0,0,160,137,0,0,12,170,0,0,144,137,0,0,13,170,0,0,120,137,0,0,14,170,0,0,64,137,0,0,15,170,0,0,48,137,0,0,16,170,0,0,16,137,0,0,17,170,0,0,0,137,0,0,18,170,0,0,240,136,0,0,19,170,0,0,224,136,0,0,20,170,0,0,200,136,0,0,21,170,0,0,144,136,0,0,22,170,0,0,128,136,0,0,23,170,0,0,104,136,0,0,24,170,0,0,56,136,0,0,25,170,0,0,40,136,0,0,26,170,0,0,8,136,0,0,27,170,0,0,248,135,0,0,28,170,0,0,232,135,0,0,29,170,0,0,216,135,0,0,30,170,0,0,192,135,0,0,31,170,0,0,128,135,0,0,33,170,0,0,120,135,0,0,34,170,0,0,88,135,0,0,35,170,0,0,40,135,0,0,36,170,0,0,24,135,0,0,37,170,0,0,8,135,0,0,38,170,0,0,232,134,0,0,39,170,0,0,216,134,0,0,40,170,0,0,200,134,0,0,41,170,0,0,176,134,0,0,42,170,0,0,144,134,0,0,43,170,0,0,128,134,0,0,44,170,0,0,64,134,0,0,45,170,0,0,248,133,0,0,46,170,0,0,232,133,0,0,47,170,0,0,216,133,0,0,48,170,0,0,184,133,0,0,49,170,0,0,168,133,0,0,50,170,0,0,152,133,0,0,51,170,0,0,128,133,0,0,52,170,0,0,72,133,0,0,53,170,0,0,56,133,0,0,54,170,0,0,32,133,0,0,55,170,0,0,240,132,0,0,56,170,0,0,224,132,0,0,57,170,0,0,208,132,0,0,58,170,0,0,176,132,0,0,59,170,0,0,168,132,0,0,60,170,0,0,152,132,0,0,61,170,0,0,128,132,0,0,62,170,0,0,56,132,0,0,63,170,0,0,40,132,0,0,64,170,0,0,16,132,0,0,65,170,0,0,232,131,0,0,66,170,0,0,208,131,0,0,67,170,0,0,176,131,0,0,68,170,0,0,144,131,0,0,69,170,0,0,88,131,0,0,70,170,0,0,32,131,0,0,71,170,0,0,224,130,0,0,72,170,0,0,168,130,0,0,73,170,0,0,144,130,0,0,74,170,0,0,112,130,0,0,75,170,0,0,40,130,0,0,76,170,0,0,16,130,0,0,77,170,0,0,248,129,0,0,78,170,0,0,200,129,0,0,79,170,0,0,168,129,0,0,80,170,0,0,152,129,0,0,81,170,0,0,128,129,0,0,82,170,0,0,96,129,0,0,96,170,0,0,80,129,0,0,97,170,0,0,56,129,0,0,98,170,0,0,24,129,0,0,99,170,0,0,240,128,0,0,100,170,0,0,224,128,0,0,101,170,0,0,192,128,0,0,102,170,0,0,176,128,0,0,103,170,0,0,152,128,0,0,104,170,0,0,88,128,0,0,0,0,0,0,0,0,0,0,0,160,0,0,8,164,0,0,1,160,0,0,144,212,0,0,2,160,0,0,0,190,0,0,3,160,0,0,248,175,0,0,4,160,0,0,16,162,0,0,5,160,0,0,168,150,0,0,6,160,0,0,136,139,0,0,7,160,0,0,240,127,0,0,8,160,0,0,112,122,0,0,9,160,0,0,0,119,0,0,10,160,0,0,120,225,0,0,11,160,0,0,16,222,0,0,12,160,0,0,176,217,0,0,13,160,0,0,24,215,0,0,14,160,0,0,32,212,0,0,15,160,0,0,208,209,0,0,16,160,0,0,232,206,0,0,17,160,0,0,0,204,0,0,18,160,0,0,168,201,0,0,19,160,0,0,208,199,0,0,20,160,0,0,32,198,0,0,21,160,0,0,160,196,0,0,22,160,0,0,0,193,0,0,23,160,0,0,88,191,0,0,24,160,0,0,224,189,0,0,25,160,0,0,56,188,0,0,26,160,0,0,216,186,0,0,27,160,0,0,144,185,0,0,28,160,0,0,128,184,0,0,29,160,0,0,136,183,0,0,30,160,0,0,80,182,0,0,31,160,0,0,248,180,0,0,32,160,0,0,112,178,0,0,33,160,0,0,40,177,0,0,34,160,0,0,216,175,0,0,35,160,0,0,128,174,0,0,36,160,0,0,8,173,0,0,37,160,0,0,0,172,0,0,38,160,0,0,0,171,0,0,39,160,0,0,0,170,0,0,40,160,0,0,176,168,0,0,41,160,0,0,64,167,0,0,42,160,0,0,216,164,0,0,43,160,0,0,120,163,0,0,44,160,0,0,240,161,0,0,45,160,0,0,240,160,0,0,46,160,0,0,216,159,0,0,47,160,0,0,224,158,0,0,48,160,0,0,8,158,0,0,49,160,0,0,16,157,0,0,50,160,0,0,48,156,0,0,51,160,0,0,240,154,0,0,52,160,0,0,8,153,0,0,53,160,0,0,192,151,0,0,54,160,0,0,136,150,0,0,56,160,0,0,72,149,0,0,57,160,0,0,72,148,0,0,58,160,0,0,64,147,0,0,59,160,0,0,56,146,0,0,60,160,0,0,112,145,0,0,61,160,0,0,136,144,0,0,62,160,0,0,136,143,0,0,63,160,0,0,176,141,0,0,64,160,0,0,168,140,0,0,65,160,0,0,104,139,0,0,66,160,0,0,56,138,0,0,67,160,0,0,32,137,0,0,68,160,0,0,24,136,0,0,69,160,0,0,248,134,0,0,70,160,0,0,200,133,0,0,71,160,0,0,192,132,0,0,72,160,0,0,168,131,0,0,73,160,0,0,240,129,0,0,74,160,0,0,208,128,0,0,75,160,0,0,224,127,0,0,76,160,0,0,48,127,0,0,77,160,0,0,152,126,0,0,78,160,0,0,24,126,0,0,79,160,0,0,144,125,0,0,80,160,0,0,248,124,0,0,81,160,0,0,152,124,0,0,82,160,0,0,96,124,0,0,84,160,0,0,80,123,0,0,85,160,0,0,200,122,0,0,86,160,0,0,96,122,0,0,87,160,0,0,24,122,0,0,88,160,0,0,0,122,0,0,89,160,0,0,192,121,0,0,90,160,0,0,152,121,0,0,91,160,0,0,88,121,0,0,92,160,0,0,8,121,0,0,93,160,0,0,192,120,0,0,94,160,0,0,176,119,0,0,95,160,0,0,72,119,0,0,96,160,0,0,240,118,0,0,97,160,0,0,200,118,0,0,98,160,0,0,152,118,0,0,99,160,0,0,80,118,0,0,100,160,0,0,16,118,0,0,101,160,0,0,192,117,0,0,102,160,0,0,64,227,0,0,103,160,0,0,0,227,0,0,104,160,0,0,32,226,0,0,105,160,0,0,200,225,0,0,106,160,0,0,104,225,0,0,108,160,0,0,64,225,0,0,109,160,0,0,16,225,0,0,110,160,0,0,208,224,0,0,111,160,0,0,168,224,0,0,112,160,0,0,120,224,0,0,113,160,0,0,48,224,0,0,114,160,0,0,24,224,0,0,117,160,0,0,40,223,0,0,118,160,0,0,184,222,0,0,119,160,0,0,48,222,0,0,120,160,0,0,168,221,0,0,121,160,0,0,96,221,0,0,122,160,0,0,192,220,0,0,123,160,0,0,24,220,0,0,124,160,0,0,240,219,0,0,125,160,0,0,152,219,0,0,126,160,0,0,112,219,0,0,127,160,0,0,160,218,0,0,128,160,0,0,32,218,0,0,129,160,0,0,200,217,0,0,130,160,0,0,144,217,0,0,131,160,0,0,32,217,0,0,132,160,0,0,0,217,0,0,133,160,0,0,232,216,0,0,134,160,0,0,200,216,0,0,135,160,0,0,152,216,0,0,136,160,0,0,112,216,0,0,138,160,0,0,24,216,0,0,139,160,0,0,120,215,0,0,141,160,0,0,48,215,0,0,143,160,0,0,0,215,0,0,144,160,0,0,224,214,0,0,145,160,0,0,176,214,0,0,146,160,0,0,80,214,0,0,152,160,0,0,56,214,0,0,0,0,0,0,0,0,0,0,101,109,115,99,114,105,112,116,101,110,95,115,101,116,95,109,97,105,110,95,108,111,111,112,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,4,0,0,0,3,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,56,217,0,0,46,0,0,0,192,192,0,0,18,0,0,0,72,178,0,0,82,0,0,0,168,164,0,0,96,0,0,0,216,152,0,0,28,0,0,0,128,141,0,0,90,0,0,0,184,129,0,0,100,0,0,0,40,123,0,0,98,0,0,0,160,119,0,0,6,0,0,0,16,226,0,0,12,0,0,0,208,222,0,0,80,0,0,0,72,218,0,0,32,0,0,0,152,215,0,0,2,0,0,0,200,212,0,0,56,0,0,0,64,210,0,0,102,0,0,0,176,207,0,0,70,0,0,0,72,204,0,0,16,0,0,0,216,201,0,0,84,0,0,0,8,200,0,0,44,0,0,0,56,198,0,0,68,0,0,0,0,197,0,0,10,0,0,0,64,193,0,0,66,0,0,0,0,0,0,0,0,0,0,0,0,43,48,42,47,4,53,41,46,12,58,3,52,25,9,40,45,55,14,11,57,32,30,2,51,28,17,24,8,21,63,39,44,49,5,54,13,59,26,10,56,15,33,31,29,18,22,1,50,6,60,27,16,34,19,23,7,61,35,20,62,36,37,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,124,0,0,168,120,0,0,240,226,0,0,232,223,0,0,24,219,0,0,0,0,0,0,83,79,70,84,87,65,82,69,32,80,73,82,65,84,69,83,136,155,0,0,96,153,0,0,48,152,0,0,208,150,0,0,240,245,0,0,184,149,0,0,128,148,0,0,128,147,0,0,104,146,0,0,168,145,0,0,184,144,0,0,216,143,0,0,40,142,0,0,232,141,0,0,0,141,0,0,160,130,0,0,176,139,0,0,136,138,0,0,144,123,0,0,96,137,0,0,80,136,0,0,240,119,0,0,240,245,0,0,72,135,0,0,144,165,0,0,40,134,0,0,8,133,0,0,112,226,0,0,0,132,0,0,72,130,0,0,32,223,0,0,240,245,0,0,48,129,0,0,160,153,0,0,8,128,0,0,104,127,0,0,152,218,0,0,176,126,0,0,56,126,0,0,16,216,0,0,168,125,0,0,56,125,0,0,168,156,0,0,240,208,0,0,104,186,0,0,144,171,0,0,160,157,0,0,184,155,0,0,24,145,0,0,104,133,0,0,208,124,0,0,64,121,0,0,48,246,0,0,96,224,0,0,96,219,0,0,168,216,0,0,8,214,0,0,72,211,0,0,240,208,0,0,136,208,0,0,160,205,0,0,48,246,0,0,160,205,0,0,16,203,0,0,48,246,0,0,248,200,0,0,24,199,0,0,192,197,0,0,40,194,0,0,96,192,0,0,184,190,0,0,32,189,0,0,160,187,0,0,240,208,0,0,24,186,0,0,56,185,0,0,32,184,0,0,0,183,0,0,0,1,59,2,60,40,54,3,61,32,49,41,55,19,35,4,62,52,30,33,50,12,14,42,56,16,27,20,36,23,44,5,63,58,39,53,31,48,18,34,51,29,11,13,15,26,22,43,57,38,47,17,28,10,25,21,37,46,9,24,45,8,7,6,63,0,0,0,56,197,0,0,0,0,0,0,128,193,0,0,98,0,1,0,216,191,0,0,72,190,0,0,152,188,0,0,66,0,2,0,32,187,0,0,240,185,0,0,240,184,0,0,99,0,1,0,224,183,0,0,184,182,0,0,152,181,0,0,100,0,1,0,232,178,0,0,184,182,0,0,152,177,0,0,105,0,1,0,72,176,0,0,184,182,0,0,224,174,0,0,73,0,1,0,96,173,0,0,184,182,0,0,72,172,0,0,108,0,1,0,64,171,0,0,184,182,0,0,104,170,0,0,112,0,1,0,8,220,0,0,184,182,0,0,16,169,0,0,113,0,0,0,248,167,0,0,0,0,0,0,48,165,0,0,114,0,0,0,0,164,0,0,0,0,0,0,72,162,0,0,82,0,0,0,32,161,0,0,0,0,0,0,16,160,0,0,115,0,1,0,32,159,0,0,72,158,0,0,72,157,0,0,116,0,1,0,96,156,0,0,184,182,0,0,112,155,0,0,118,0,0,0,88,153,0,0,0,0,0,0,8,152,0,0,86,0,0,0,192,150,0,0,0,0,0,0,144,149,0,0,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,205,0,0,136,205,0,0,32,205,0,0,64,204,0,0,32,204,0,0,248,203,0,0,208,203,0,0,184,203,0,0,96,203,0,0,64,203,0,0,24,203,0,0,0,203,0,0,176,202,0,0,208,201,0,0,184,201,0,0,160,201,0,0,112,214,0,0,64,214,0,0,32,214,0,0,232,213,0,0,160,213,0,0,192,212,0,0,104,212,0,0,24,212,0,0,240,211,0,0,176,211,0,0,136,211,0,0,104,211,0,0,80,211,0,0,48,211,0,0,232,210,0,0,56,210,0,0,8,210,0,0,200,209,0,0,176,209,0,0,120,209,0,0,88,209,0,0,64,209,0,0,248,208,0,0,216,208,0,0,112,208,0,0,168,207,0,0,96,207,0,0,168,206,0,0,72,206,0,0,48,206,0,0,16,206,0,0,248,205,0,0,248,219,0,0,184,219,0,0,136,219,0,0,248,218,0,0,64,218,0,0,248,217,0,0,160,217,0,0,48,217,0,0,16,217,0,0,240,216,0,0,216,216,0,0,184,216,0,0,128,216,0,0,64,216,0,0,144,215,0,0,88,215,0,0,31,0,0,0,28,0,0,0,31,0,0,0,30,0,0,0,31,0,0,0,30,0,0,0,31,0,0,0,31,0,0,0,30,0,0,0,31,0,0,0,30,0,0,0,31,0,0,0,31,0,0,0,29,0,0,0,31,0,0,0,30,0,0,0,31,0,0,0,30,0,0,0,31,0,0,0,31,0,0,0,30,0,0,0,31,0,0,0,30,0,0,0,31,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,72,192,0,0,2,0,0,0,24,218,0,0,3,0,0,0,32,193,0,0,4,0,0,0,160,178,0,0,5,0,0,0,0,165,0,0,6,0,0,0,48,153,0,0,7,0,0,0,200,141,0,0,8,0,0,0,32,130,0,0,9,0,0,0,104,123,0,0,10,0,0,0,208,119,0,0,11,0,0,0,72,226,0,0,12,0,0,0,0,223,0,0,13,0,0,0,120,218,0,0,14,0,0,0,232,215,0,0,14,0,0,0,0,213,0,0,15,0,0,0,112,210,0,0,15,0,0,0,224,207,0,0,16,0,0,0,104,204,0,0,17,0,0,0,0,202,0,0,17,0,0,0,56,200,0,0,18,0,0,0,88,198,0,0,19,0,0,0,40,197,0,0,20,0,0,0,112,193,0,0,21,0,0,0,200,191,0,0,22,0,0,0,64,190,0,0,23,0,0,0,136,188,0,0,24,0,0,0,16,187,0,0,25,0,0,0,224,185,0,0,26,0,0,0,224,184,0,0,27,0,0,0,208,183,0,0,28,0,0,0,168,182,0,0,28,0,0,0,136,181,0,0,29,0,0,0,224,178,0,0,29,0,0,0,144,177,0,0,30,0,0,0,56,176,0,0,31,0,0,0,216,174,0,0,32,0,0,0,88,173,0,0,33,0,0,0,64,172,0,0,34,0,0,0,56,171,0,0,35,0,0,0,96,170,0,0,36,0,0,0,8,169,0,0,37,0,0,0,240,167,0,0,38,0,0,0,40,165,0,0,39,0,0,0,248,163,0,0,40,0,0,0,64,162,0,0,41,0,0,0,24,161,0,0,42,0,0,0,0,160,0,0,42,0,0,0,24,159,0,0,43,0,0,0,56,158,0,0,43,0,0,0,64,157,0,0,44,0,0,0,88,156,0,0,45,0,0,0,96,155,0,0,46,0,0,0,80,153,0,0,47,0,0,0,40,152,0,0,48,0,0,0,200,150,0,0,49,0,0,0,176,149,0,0,50,0,0,0,120,148,0,0,51,0,0,0,120,147,0,0,52,0,0,0,96,146,0,0,53,0,0,0,160,145,0,0,54,0,0,0,176,144,0,0,55,0,0,0,200,143,0,0,55,0,0,0,224,141,0,0,56,0,0,0,248,140,0,0,56,0,0,0,160,139,0,0,56,0,0,0,128,138,0,0,57,0,0,0,80,137,0,0,57,0,0,0,72,136,0,0,58,0,0,0,56,135,0,0,58,0,0,0,32,134,0,0,59,0,0,0,0,133,0,0,59,0,0,0,248,131,0,0,60,0,0,0,64,130,0,0,61,0,0,0,40,129,0,0,62,0,0,0,0,128,0,0,63,0,0,0,96,127,0,0,64,0,0,0,168,126,0,0,66,0,0,0,48,126,0,0,65,0,0,0,160,125,0,0,67,0,0,0,48,125,0,0,67,0,0,0,168,124,0,0,68,0,0,0,120,124,0,0,68,0,0,0,120,123,0,0,69,0,0,0,248,122,0,0,69,0,0,0,120,122,0,0,71,0,0,0,40,122,0,0,71,0,0,0,8,122,0,0,73,0,0,0,208,121,0,0,73,0,0,0,168,121,0,0,72,0,0,0,120,121,0,0,72,0,0,0,24,121,0,0,72,0,0,0,216,120,0,0,74,0,0,0,224,119,0,0,75,0,0,0,120,119,0,0,75,0,0,0,8,119,0,0,76,0,0,0,216,118,0,0,77,0,0,0,168,118,0,0,78,0,0,0,104,118,0,0,79,0,0,0,24,118,0,0,79,0,0,0,208,117,0,0,79,0,0,0,80,227,0,0,80,0,0,0,32,227,0,0,81,0,0,0,88,226,0,0,82,0,0,0,232,225,0,0,83,0,0,0,128,225,0,0,84,0,0,0,72,225,0,0,85,0,0,0,32,225,0,0,86,0,0,0,240,224,0,0,87,0,0,0,184,224,0,0,88,0,0,0,136,224,0,0,89,0,0,0,64,224,0,0,90,0,0,0,8,224,0,0,91,0,0,0,16,223,0,0,92,0,0,0,168,222,0,0,93,0,0,0,40,222,0,0,94,0,0,0,136,221,0,0,95,0,0,0,40,221,0,0,96,0,0,0,128,220,0,0,97,0,0,0,16,220,0,0,98,0,0,0,224,219,0,0,99,0,0,0,144,219,0,0,100,0,0,0,80,219,0,0,101,0,0,0,136,218,0,0,102,0,0,0,16,218,0,0,103,0,0,0,192,217,0,0,104,0,0,0,72,217,0,0,105,0,0,0,24,217,0,0,106,0,0,0,248,216,0,0,107,0,0,0,224,216,0,0,108,0,0,0,192,216,0,0,109,0,0,0,144,216,0,0,110,0,0,0,88,216,0,0,111,0,0,0,0,216,0,0,112,0,0,0,112,215,0,0,113,0,0,0,40,215,0,0,114,0,0,0,248,214,0,0,115,0,0,0,208,214,0,0,116,0,0,0,168,214,0,0,117,0,0,0,96,214,0,0,118,0,0,0,40,214,0,0,119,0,0,0,240,213,0,0,120,0,0,0,184,213,0,0,121,0,0,0,16,213,0,0,122,0,0,0,152,212,0,0,123,0,0,0,48,212,0,0,124,0,0,0,0,212,0,0,0,0,0,0,0,0,0,0,86,0,0,0,115,0,0,0,87,0,0,0,62,0,0,0,88,0,0,0,116,0,0,0,90,0,0,0,59,0,0,0,91,0,0,0,87,0,0,0,92,0,0,0,60,0,0,0,93,0,0,0,119,0,0,0,94,0,0,0,61,0,0,0,95,0,0,0,121,0,0,0,97,0,0,0,114,0,0,0,98,0,0,0,117,0,0,0,96,0,0,0,36,0,0,0,0,0,0,0,0,0,0,0,86,0,0,0,89,0,0,0,87,0,0,0,91,0,0,0,88,0,0,0,92,0,0,0,90,0,0,0,86,0,0,0,91,0,0,0,87,0,0,0,92,0,0,0,88,0,0,0,93,0,0,0,83,0,0,0,94,0,0,0,84,0,0,0,95,0,0,0,85,0,0,0,97,0,0,0,82,0,0,0,98,0,0,0,65,0,0,0,96,0,0,0,76,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,53,0,0,0,2,0,0,0,122,0,0,0,3,0,0,0,120,0,0,0,4,0,0,0,99,0,0,0,5,0,0,0,118,0,0,0,6,0,0,0,96,0,0,0,7,0,0,0,97,0,0,0,8,0,0,0,98,0,0,0,9,0,0,0,100,0,0,0,10,0,0,0,101,0,0,0,11,0,0,0,109,0,0,0,12,0,0,0,103,0,0,0,13,0,0,0,111,0,0,0,17,0,0,0,50,0,0,0,18,0,0,0,18,0,0,0,19,0,0,0,19,0,0,0,20,0,0,0,20,0,0,0,21,0,0,0,21,0,0,0,22,0,0,0,23,0,0,0,23,0,0,0,22,0,0,0,24,0,0,0,26,0,0,0,25,0,0,0,28,0,0,0,26,0,0,0,25,0,0,0,27,0,0,0,29,0,0,0,28,0,0,0,27,0,0,0,29,0,0,0,24,0,0,0,30,0,0,0,51,0,0,0,31,0,0,0,48,0,0,0,32,0,0,0,12,0,0,0,33,0,0,0,13,0,0,0,34,0,0,0,14,0,0,0,35,0,0,0,15,0,0,0,36,0,0,0,17,0,0,0,37,0,0,0,16,0,0,0,38,0,0,0,32,0,0,0,39,0,0,0,34,0,0,0,40,0,0,0,31,0,0,0,41,0,0,0,35,0,0,0,42,0,0,0,33,0,0,0,43,0,0,0,30,0,0,0,57,0,0,0,42,0,0,0,45,0,0,0,57,0,0,0,46,0,0,0,0,0,0,0,47,0,0,0,1,0,0,0,48,0,0,0,2,0,0,0,49,0,0,0,3,0,0,0,50,0,0,0,5,0,0,0,51,0,0,0,4,0,0,0,52,0,0,0,38,0,0,0,53,0,0,0,40,0,0,0,54,0,0,0,37,0,0,0,55,0,0,0,41,0,0,0,56,0,0,0,39,0,0,0,44,0,0,0,36,0,0,0,58,0,0,0,56,0,0,0,60,0,0,0,6,0,0,0,61,0,0,0,7,0,0,0,62,0,0,0,8,0,0,0,63,0,0,0,9,0,0,0,64,0,0,0,11,0,0,0,66,0,0,0,45,0,0,0,65,0,0,0,46,0,0,0,67,0,0,0,43,0,0,0,68,0,0,0,47,0,0,0,69,0,0,0,44,0,0,0,70,0,0,0,56,0,0,0,71,0,0,0,54,0,0,0,72,0,0,0,58,0,0,0,74,0,0,0,58,0,0,0,75,0,0,0,55,0,0,0,76,0,0,0,49,0,0,0,77,0,0,0,55,0,0,0,81,0,0,0,54,0,0,0,99,0,0,0,114,0,0,0,100,0,0,0,115,0,0,0,101,0,0,0,116,0,0,0,102,0,0,0,117,0,0,0,103,0,0,0,119,0,0,0,104,0,0,0,121,0,0,0,105,0,0,0,62,0,0,0,106,0,0,0,59,0,0,0,108,0,0,0,60,0,0,0,107,0,0,0,61,0,0,0,82,0,0,0,71,0,0,0,83,0,0,0,75,0,0,0,84,0,0,0,67,0,0,0,86,0,0,0,89,0,0,0,87,0,0,0,91,0,0,0,88,0,0,0,92,0,0,0,85,0,0,0,78,0,0,0,90,0,0,0,86,0,0,0,91,0,0,0,87,0,0,0,92,0,0,0,88,0,0,0,89,0,0,0,69,0,0,0,93,0,0,0,83,0,0,0,94,0,0,0,84,0,0,0,95,0,0,0,85,0,0,0,96,0,0,0,76,0,0,0,97,0,0,0,82,0,0,0,98,0,0,0,65,0,0,0,0,0,0,0,0,0,0,0,27,0,0,0,1,0,0,0,58,4,0,0,2,0,0,0,59,4,0,0,3,0,0,0,60,4,0,0,4,0,0,0,61,4,0,0,5,0,0,0,62,4,0,0,6,0,0,0,63,4,0,0,7,0,0,0,64,4,0,0,8,0,0,0,65,4,0,0,9,0,0,0,66,4,0,0,10,0,0,0,67,4,0,0,11,0,0,0,68,4,0,0,12,0,0,0,69,4,0,0,13,0,0,0,70,4,0,0,14,0,0,0,71,4,0,0,15,0,0,0,72,4,0,0,16,0,0,0,96,0,0,0,17,0,0,0,49,0,0,0,18,0,0,0,50,0,0,0,19,0,0,0,51,0,0,0,20,0,0,0,52,0,0,0,21,0,0,0,53,0,0,0,22,0,0,0,54,0,0,0,23,0,0,0,55,0,0,0,24,0,0,0,56,0,0,0,25,0,0,0,57,0,0,0,26,0,0,0,48,0,0,0,27,0,0,0,45,0,0,0,28,0,0,0,61,0,0,0,29,0,0,0,187,0,0,0,29,0,0,0,8,0,0,0,30,0,0,0,9,0,0,0,31,0,0,0,113,0,0,0,32,0,0,0].concat([119,0,0,0,33,0,0,0,101,0,0,0,34,0,0,0,114,0,0,0,35,0,0,0,116,0,0,0,36,0,0,0,121,0,0,0,37,0,0,0,117,0,0,0,38,0,0,0,105,0,0,0,39,0,0,0,111,0,0,0,40,0,0,0,112,0,0,0,41,0,0,0,91,0,0,0,42,0,0,0,93,0,0,0,43,0,0,0,13,0,0,0,44,0,0,0,57,4,0,0,45,0,0,0,97,0,0,0,46,0,0,0,115,0,0,0,47,0,0,0,100,0,0,0,48,0,0,0,102,0,0,0,49,0,0,0,103,0,0,0,50,0,0,0,104,0,0,0,51,0,0,0,106,0,0,0,52,0,0,0,107,0,0,0,53,0,0,0,108,0,0,0,54,0,0,0,59,0,0,0,55,0,0,0,186,0,0,0,55,0,0,0,39,0,0,0,56,0,0,0,92,0,0,0,57,0,0,0,220,0,0,0,57,0,0,0,225,4,0,0,58,0,0,0,60,0,0,0,59,0,0,0,122,0,0,0,60,0,0,0,120,0,0,0,61,0,0,0,99,0,0,0,62,0,0,0,118,0,0,0,63,0,0,0,98,0,0,0,64,0,0,0,110,0,0,0,66,0,0,0,109,0,0,0,65,0,0,0,44,0,0,0,67,0,0,0,46,0,0,0,68,0,0,0,47,0,0,0,69,0,0,0,229,4,0,0,70,0,0,0,224,4,0,0,71,0,0,0,227,4,0,0,73,0,0,0,227,4,0,0,72,0,0,0,226,4,0,0,75,0,0,0,1,5,0,0,74,0,0,0,32,0,0,0,76,0,0,0,230,4,0,0,77,0,0,0,231,4,0,0,78,0,0,0,231,4,0,0,79,0,0,0,118,4,0,0,80,0,0,0,228,4,0,0,81,0,0,0,83,4,0,0,82,0,0,0,84,4,0,0,83,0,0,0,85,4,0,0,84,0,0,0,86,4,0,0,85,0,0,0,95,4,0,0,86,0,0,0,96,4,0,0,87,0,0,0,97,4,0,0,88,0,0,0,87,4,0,0,89,0,0,0,92,4,0,0,90,0,0,0,93,4,0,0,91,0,0,0,94,4,0,0,92,0,0,0,89,4,0,0,93,0,0,0,90,4,0,0,94,0,0,0,91,4,0,0,95,0,0,0,88,4,0,0,96,0,0,0,98,4,0,0,97,0,0,0,99,4,0,0,98,0,0,0,73,4,0,0,99,0,0,0,74,4,0,0,100,0,0,0,75,4,0,0,101,0,0,0,127,0,0,0,102,0,0,0,77,4,0,0,103,0,0,0,78,4,0,0,104,0,0,0,82,4,0,0,105,0,0,0,80,4,0,0,106,0,0,0,81,4,0,0,107,0,0,0,79,4,0,0,108,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,1,0,101,0,0,0,0,0,0,0,1,0,229,0,0,0,0,0,0,0,18,0,0,0,1,0,37,0,0,0,0,0,0,0,1,0,165,0,0,0,0,0,0,0,19,0,0,0,1,0,39,0,0,0,0,0,0,0,1,0,167,0,0,0,0,0,0,0,20,0,0,0,1,0,41,0,0,0,0,0,0,0,1,0,169,0,0,0,0,0,0,0,21,0,0,0,1,0,43,0,0,0,0,0,0,0,1,0,171,0,0,0,0,0,0,0,22,0,0,0,1,0,47,0,0,0,0,0,0,0,1,0,175,0,0,0,0,0,0,0,23,0,0,0,1,0,45,0,0,0,0,0,0,0,1,0,173,0,0,0,0,0,0,0,24,0,0,0,1,0,53,0,0,0,0,0,0,0,1,0,181,0,0,0,0,0,0,0,25,0,0,0,1,0,57,0,0,0,0,0,0,0,1,0,185,0,0,0,0,0,0,0,26,0,0,0,1,0,51,0,0,0,0,0,0,0,1,0,179,0,0,0,0,0,0,0,27,0,0,0,1,0,59,0,0,0,0,0,0,0,1,0,187,0,0,0,0,0,0,0,28,0,0,0,1,0,55,0,0,0,0,0,0,0,1,0,183,0,0,0,0,0,0,0,29,0,0,0,1,0,49,0,0,0,0,0,0,0,1,0,177,0,0,0,0,0,0,0,30,0,0,0,1,0,103,0,0,0,0,0,0,0,1,0,231,0,0,0,0,0,0,0,31,0,0,0,1,0,97,0,0,0,0,0,0,0,1,0,225,0,0,0,0,0,0,0,32,0,0,0,1,0,25,0,0,0,0,0,0,0,1,0,153,0,0,0,0,0,0,0,33,0,0,0,1,0,27,0,0,0,0,0,0,0,1,0,155,0,0,0,0,0,0,0,34,0,0,0,1,0,29,0,0,0,0,0,0,0,1,0,157,0,0,0,0,0,0,0,35,0,0,0,1,0,31,0,0,0,0,0,0,0,1,0,159,0,0,0,0,0,0,0,36,0,0,0,1,0,35,0,0,0,0,0,0,0,1,0,163,0,0,0,0,0,0,0,37,0,0,0,1,0,33,0,0,0,0,0,0,0,1,0,161,0,0,0,0,0,0,0,38,0,0,0,1,0,65,0,0,0,0,0,0,0,1,0,193,0,0,0,0,0,0,0,39,0,0,0,1,0,69,0,0,0,0,0,0,0,1,0,197,0,0,0,0,0,0,0,40,0,0,0,1,0,63,0,0,0,0,0,0,0,1,0,191,0,0,0,0,0,0,0,41,0,0,0,1,0,71,0,0,0,0,0,0,0,1,0,199,0,0,0,0,0,0,0,42,0,0,0,1,0,67,0,0,0,0,0,0,0,1,0,195,0,0,0,0,0,0,0,43,0,0,0,1,0,61,0,0,0,0,0,0,0,1,0,189,0,0,0,0,0,0,0,57,0,0,0,1,0,85,0,0,0,0,0,0,0,1,0,213,0,0,0,0,0,0,0,44,0,0,0,1,0,73,0,0,0,0,0,0,0,1,0,201,0,0,0,0,0,0,0,45,0,0,0,1,0,115,0,0,0,0,0,0,0,1,0,243,0,0,0,0,0,0,0,46,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,129,0,0,0,0,0,0,0,47,0,0,0,1,0,3,0,0,0,0,0,0,0,1,0,131,0,0,0,0,0,0,0,48,0,0,0,1,0,5,0,0,0,0,0,0,0,1,0,133,0,0,0,0,0,0,0,49,0,0,0,1,0,7,0,0,0,0,0,0,0,1,0,135,0,0,0,0,0,0,0,50,0,0,0,1,0,11,0,0,0,0,0,0,0,1,0,139,0,0,0,0,0,0,0,51,0,0,0,1,0,9,0,0,0,0,0,0,0,1,0,137,0,0,0,0,0,0,0,52,0,0,0,1,0,77,0,0,0,0,0,0,0,1,0,205,0,0,0,0,0,0,0,53,0,0,0,1,0,81,0,0,0,0,0,0,0,1,0,209,0,0,0,0,0,0,0,54,0,0,0,1,0,75,0,0,0,0,0,0,0,1,0,203,0,0,0,0,0,0,0,55,0,0,0,1,0,83,0,0,0,0,0,0,0,1,0,211,0,0,0,0,0,0,0,56,0,0,0,1,0,79,0,0,0,0,0,0,0,1,0,207,0,0,0,0,0,0,0,58,0,0,0,1,0,113,0,0,0,0,0,0,0,1,0,241,0,0,0,0,0,0,0,70,0,0,0,1,0,113,0,0,0,0,0,0,0,1,0,241,0,0,0,0,0,0,0,60,0,0,0,1,0,13,0,0,0,0,0,0,0,1,0,141,0,0,0,0,0,0,0,61,0,0,0,1,0,15,0,0,0,0,0,0,0,1,0,143,0,0,0,0,0,0,0,62,0,0,0,1,0,17,0,0,0,0,0,0,0,1,0,145,0,0,0,0,0,0,0,63,0,0,0,1,0,19,0,0,0,0,0,0,0,1,0,147,0,0,0,0,0,0,0,64,0,0,0,1,0,23,0,0,0,0,0,0,0,1,0,151,0,0,0,0,0,0,0,66,0,0,0,1,0,91,0,0,0,0,0,0,0,1,0,219,0,0,0,0,0,0,0,65,0,0,0,1,0,93,0,0,0,0,0,0,0,1,0,221,0,0,0,0,0,0,0,67,0,0,0,1,0,87,0,0,0,0,0,0,0,1,0,215,0,0,0,0,0,0,0,68,0,0,0,1,0,95,0,0,0,0,0,0,0,1,0,223,0,0,0,0,0,0,0,69,0,0,0,1,0,89,0,0,0,0,0,0,0,1,0,217,0,0,0,0,0,0,0,71,0,0,0,1,0,117,0,0,0,0,0,0,0,1,0,245,0,0,0,0,0,0,0,81,0,0,0,1,0,117,0,0,0,0,0,0,0,1,0,245,0,0,0,0,0,0,0,75,0,0,0,1,0,111,0,0,0,0,0,0,0,1,0,239,0,0,0,0,0,0,0,77,0,0,0,1,0,105,0,0,0,0,0,0,0,1,0,233,0,0,0,0,0,0,0,76,0,0,0,1,0,99,0,0,0,0,0,0,0,1,0,227,0,0,0,0,0,0,0,82,0,0,0,2,0,121,15,0,0,0,0,0,0,2,0,121,143,0,0,0,0,0,0,83,0,0,0,3,0,113,121,27,0,0,0,0,0,3,0,121,155,241,0,0,0,0,0,84,0,0,0,3,0,113,121,5,0,0,0,0,0,3,0,121,133,241,0,0,0,0,0,85,0,0,0,2,0,121,29,0,0,0,0,0,0,2,0,121,157,0,0,0,0,0,0,86,0,0,0,2,0,121,51,0,0,0,0,0,0,2,0,121,179,0,0,0,0,0,0,87,0,0,0,2,0,121,55,0,0,0,0,0,0,2,0,121,183,0,0,0,0,0,0,88,0,0,0,2,0,121,57,0,0,0,0,0,0,2,0,121,185,0,0,0,0,0,0,89,0,0,0,3,0,113,121,13,0,0,0,0,0,3,0,121,141,241,0,0,0,0,0,90,0,0,0,2,0,121,45,0,0,0,0,0,0,2,0,121,173,0,0,0,0,0,0,91,0,0,0,2,0,121,47,0,0,0,0,0,0,2,0,121,175,0,0,0,0,0,0,92,0,0,0,2,0,121,49,0,0,0,0,0,0,2,0,121,177,0,0,0,0,0,0,93,0,0,0,2,0,121,39,0,0,0,0,0,0,2,0,121,167,0,0,0,0,0,0,94,0,0,0,2,0,121,41,0,0,0,0,0,0,2,0,121,169,0,0,0,0,0,0,95,0,0,0,2,0,121,43,0,0,0,0,0,0,2,0,121,171,0,0,0,0,0,0,96,0,0,0,2,0,121,25,0,0,0,0,0,0,2,0,121,153,0,0,0,0,0,0,97,0,0,0,2,0,121,37,0,0,0,0,0,0,2,0,121,165,0,0,0,0,0,0,98,0,0,0,2,0,121,3,0,0,0,0,0,0,2,0,121,131,0,0,0,0,0,0,105,0,0,0,2,0,121,27,0,0,0,0,0,0,2,0,121,155,0,0,0,0,0,0,106,0,0,0,2,0,121,13,0,0,0,0,0,0,2,0,121,141,0,0,0,0,0,0,108,0,0,0,2,0,121,5,0,0,0,0,0,0,2,0,121,133,0,0,0,0,0,0,107,0,0,0,2,0,121,17,0,0,0,0,0,0,2,0,121,145,0,0,0,0,0,0,100,0,0,0,2,0,121,103,0,0,0,0,0,0,2,0,121,231,0,0,0,0,0,0,103,0,0,0,2,0,121,111,0,0,0,0,0,0,2,0,121,239,0,0,0,0,0,0,101,0,0,0,2,0,121,105,0,0,0,0,0,0,2,0,121,233,0,0,0,0,0,0,104,0,0,0,2,0,121,115,0,0,0,0,0,0,2,0,121,243,0,0,0,0,0,0,99,0,0,0,2,0,121,101,0,0,0,0,0,0,2,0,121,101,0,0,0,0,0,0,102,0,0,0,2,0,121,107,0,0,0,0,0,0,2,0,121,235,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,1,0,101,0,0,0,0,0,0,0,1,0,229,0,0,0,0,0,0,0,18,0,0,0,1,0,39,0,0,0,0,0,0,0,1,0,167,0,0,0,0,0,0,0,19,0,0,0,1,0,39,0,0,0,0,0,0,0,1,0,167,0,0,0,0,0,0,0,20,0,0,0,1,0,41,0,0,0,0,0,0,0,1,0,169,0,0,0,0,0,0,0,21,0,0,0,1,0,43,0,0,0,0,0,0,0,1,0,171,0,0,0,0,0,0,0,22,0,0,0,1,0,47,0,0,0,0,0,0,0,1,0,175,0,0,0,0,0,0,0,23,0,0,0,1,0,45,0,0,0,0,0,0,0,1,0,173,0,0,0,0,0,0,0,24,0,0,0,1,0,53,0,0,0,0,0,0,0,1,0,181,0,0,0,0,0,0,0,25,0,0,0,1,0,57,0,0,0,0,0,0,0,1,0,185,0,0,0,0,0,0,0,26,0,0,0,1,0,51,0,0,0,0,0,0,0,1,0,179,0,0,0,0,0,0,0,27,0,0,0,1,0,59,0,0,0,0,0,0,0,1,0,187,0,0,0,0,0,0,0,28,0,0,0,1,0,55,0,0,0,0,0,0,0,1,0,183,0,0,0,0,0,0,0,29,0,0,0,1,0,49,0,0,0,0,0,0,0,1,0,177,0,0,0,0,0,0,0,30,0,0,0,1,0,103,0,0,0,0,0,0,0,1,0,231,0,0,0,0,0,0,0,31,0,0,0,1,0,97,0,0,0,0,0,0,0,1,0,225,0,0,0,0,0,0,0,32,0,0,0,1,0,25,0,0,0,0,0,0,0,1,0,153,0,0,0,0,0,0,0,33,0,0,0,1,0,27,0,0,0,0,0,0,0,1,0,155,0,0,0,0,0,0,0,34,0,0,0,1,0,29,0,0,0,0,0,0,0,1,0,157,0,0,0,0,0,0,0,35,0,0,0,1,0,31,0,0,0,0,0,0,0,1,0,159,0,0,0,0,0,0,0,36,0,0,0,1,0,35,0,0,0,0,0,0,0,1,0,163,0,0,0,0,0,0,0,37,0,0,0,1,0,33,0,0,0,0,0,0,0,1,0,161,0,0,0,0,0,0,0,38,0,0,0,1,0,65,0,0,0,0,0,0,0,1,0,193,0,0,0,0,0,0,0,39,0,0,0,1,0,69,0,0,0,0,0,0,0,1,0,197,0,0,0,0,0,0,0,40,0,0,0,1,0,63,0,0,0,0,0,0,0,1,0,191,0,0,0,0,0,0,0,41,0,0,0,1,0,71,0,0,0,0,0,0,0,1,0,199,0,0,0,0,0,0,0,42,0,0,0,1,0,67,0,0,0,0,0,0,0,1,0,195,0,0,0,0,0,0,0,43,0,0,0,1,0,61,0,0,0,0,0,0,0,1,0,189,0,0,0,0,0,0,0,44,0,0,0,1,0,85,0,0,0,0,0,0,0,1,0,213,0,0,0,0,0,0,0,45,0,0,0,1,0,115,0,0,0,0,0,0,0,1,0,243,0,0,0,0,0,0,0,46,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,129,0,0,0,0,0,0,0,47,0,0,0,1,0,3,0,0,0,0,0,0,0,1,0,131,0,0,0,0,0,0,0,48,0,0,0,1,0,5,0,0,0,0,0,0,0,1,0,133,0,0,0,0,0,0,0,49,0,0,0,1,0,7,0,0,0,0,0,0,0,1,0,135,0,0,0,0,0,0,0,50,0,0,0,1,0,11,0,0,0,0,0,0,0,1,0,139,0,0,0,0,0,0,0,51,0,0,0,1,0,9,0,0,0,0,0,0,0,1,0,137,0,0,0,0,0,0,0,52,0,0,0,1,0,77,0,0,0,0,0,0,0,1,0,205,0,0,0,0,0,0,0,53,0,0,0,1,0,81,0,0,0,0,0,0,0,1,0,209,0,0,0,0,0,0,0,54,0,0,0,1,0,75,0,0,0,0,0,0,0,1,0,203,0,0,0,0,0,0,0,55,0,0,0,1,0,83,0,0,0,0,0,0,0,1,0,211,0,0,0,0,0,0,0,56,0,0,0,1,0,79,0,0,0,0,0,0,0,1,0,207,0,0,0,0,0,0,0,57,0,0,0,1,0,73,0,0,0,0,0,0,0,1,0,201,0,0,0,0,0,0,0,58,0,0,0,1,0,113,0,0,0,0,0,0,0,1,0,241,0,0,0,0,0,0,0,70,0,0,0,1,0,113,0,0,0,0,0,0,0,1,0,241,0,0,0,0,0,0,0,59,0,0,0,1,0,13,0,0,0,0,0,0,0,1,0,141,0,0,0,0,0,0,0,60,0,0,0,1,0,15,0,0,0,0,0,0,0,1,0,143,0,0,0,0,0,0,0,61,0,0,0,1,0,17,0,0,0,0,0,0,0,1,0,145,0,0,0,0,0,0,0,62,0,0,0,1,0,19,0,0,0,0,0,0,0,1,0,147,0,0,0,0,0,0,0,63,0,0,0,1,0,23,0,0,0,0,0,0,0,1,0,151,0,0,0,0,0,0,0,64,0,0,0,1,0,91,0,0,0,0,0,0,0,1,0,219,0,0,0,0,0,0,0,66,0,0,0,1,0,93,0,0,0,0,0,0,0,1,0,221,0,0,0,0,0,0,0,65,0,0,0,1,0,87,0,0,0,0,0,0,0,1,0,215,0,0,0,0,0,0,0,67,0,0,0,1,0,95,0,0,0,0,0,0,0,1,0,223,0,0,0,0,0,0,0,68,0,0,0,1,0,89,0,0,0,0,0,0,0,1,0,217,0,0,0,0,0,0,0,69,0,0,0,1,0,21,0,0,0,0,0,0,0,1,0,149,0,0,0,0,0,0,0,71,0,0,0,1,0,117,0,0,0,0,0,0,0,1,0,245,0,0,0,0,0,0,0,81,0,0,0,1,0,117,0,0,0,0,0,0,0,1,0,245,0,0,0,0,0,0,0,75,0,0,0,1,0,111,0,0,0,0,0,0,0,1,0,239,0,0,0,0,0,0,0,77,0,0,0,1,0,99,0,0,0,0,0,0,0,1,0,227,0,0,0,0,0,0,0,76,0,0,0,1,0,105,0,0,0,0,0,0,0,1,0,233,0,0,0,0,0,0,0,82,0,0,0,2,0,121,15,0,0,0,0,0,0,2,0,121,143,0,0,0,0,0,0,83,0,0,0,3,0,113,121,27,0,0,0,0,0,3,0,121,155,241,0,0,0,0,0,84,0,0,0,3,0,113,121,5,0,0,0,0,0,3,0,121,133,241,0,0,0,0,0,85,0,0,0,2,0,121,29,0,0,0,0,0,0,2,0,121,157,0,0,0,0,0,0,86,0,0,0,2,0,121,51,0,0,0,0,0,0,2,0,121,179,0,0,0,0,0,0,87,0,0,0,2,0,121,55,0,0,0,0,0,0,2,0,121,183,0,0,0,0,0,0,88,0,0,0,2,0,121,57,0,0,0,0,0,0,2,0,121,185,0,0,0,0,0,0,89,0,0,0,3,0,113,121,13,0,0,0,0,0,3,0,121,141,241,0,0,0,0,0,90,0,0,0,2,0,121,45,0,0,0,0,0,0,2,0,121,173,0,0,0,0,0,0,91,0,0,0,2,0,121,47,0,0,0,0,0,0,2,0,121,175,0,0,0,0,0,0,92,0,0,0,2,0,121,49,0,0,0,0,0,0,2,0,121,177,0,0,0,0,0,0,93,0,0,0,2,0,121,39,0,0,0,0,0,0,2,0,121,167,0,0,0,0,0,0,94,0,0,0,2,0,121,41,0,0,0,0,0,0,2,0,121,169,0,0,0,0,0,0,95,0,0,0,2,0,121,43,0,0,0,0,0,0,2,0,121,171,0,0,0,0,0,0,96,0,0,0,2,0,121,25,0,0,0,0,0,0,2,0,121,153,0,0,0,0,0,0,97,0,0,0,2,0,121,37,0,0,0,0,0,0,2,0,121,165,0,0,0,0,0,0,98,0,0,0,2,0,121,3,0,0,0,0,0,0,2,0,121,131,0,0,0,0,0,0,105,0,0,0,2,0,121,27,0,0,0,0,0,0,2,0,121,155,0,0,0,0,0,0,106,0,0,0,2,0,121,13,0,0,0,0,0,0,2,0,121,141,0,0,0,0,0,0,108,0,0,0,2,0,121,5,0,0,0,0,0,0,2,0,121,133,0,0,0,0,0,0,107,0,0,0,2,0,121,17,0,0,0,0,0,0,2,0,121,145,0,0,0,0,0,0,100,0,0,0,2,0,121,103,0,0,0,0,0,0,2,0,121,231,0,0,0,0,0,0,103,0,0,0,2,0,121,111,0,0,0,0,0,0,2,0,121,239,0,0,0,0,0,0,101,0,0,0,2,0,121,105,0,0,0,0,0,0,2,0,121,233,0,0,0,0,0,0,104,0,0,0,2,0,121,115,0,0,0,0,0,0,2,0,121,243,0,0,0,0,0,0,99,0,0,0,2,0,121,101,0,0,0,0,0,0,2,0,121,229,0,0,0,0,0,0,102,0,0,0,2,0,121,107,0,0,0,0,0,0,2,0,121,235,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,86,0,0,0,2,0,121,51,0,0,0,0,0,0,2,0,121,179,0,0,0,0,0,0,87,0,0,0,2,0,121,55,0,0,0,0,0,0,2,0,121,183,0,0,0,0,0,0,88,0,0,0,2,0,121,57,0,0,0,0,0,0,2,0,121,185,0,0,0,0,0,0,90,0,0,0,2,0,121,45,0,0,0,0,0,0,2,0,121,173,0,0,0,0,0,0,91,0,0,0,2,0,121,47,0,0,0,0,0,0,2,0,121,175,0,0,0,0,0,0,92,0,0,0,2,0,121,49,0,0,0,0,0,0,2,0,121,177,0,0,0,0,0,0,93,0,0,0,2,0,121,39,0,0,0,0,0,0,2,0,121,167,0,0,0,0,0,0,94,0,0,0,2,0,121,41,0,0,0,0,0,0,2,0,121,169,0,0,0,0,0,0,95,0,0,0,2,0,121,43,0,0,0,0,0,0,2,0,121,171,0,0,0,0,0,0,97,0,0,0,2,0,121,37,0,0,0,0,0,0,2,0,121,165,0,0,0,0,0,0,98,0,0,0,2,0,121,3,0,0,0,0,0,0,2,0,121,131,0,0,0,0,0,0,96,0,0,0,2,0,121,25,0,0,0,0,0,0,2,0,121,153,0,0,0,0,0,0,100,0,0,0,2,0,121,103,0,0,0,0,0,0,2,0,121,231,0,0,0,0,0,0,105,0,0,0,2,0,121,27,0,0,0,0,0,0,2,0,121,155,0,0,0,0,0,0,101,0,0,0,2,0,121,105,0,0,0,0,0,0,2,0,121,233,0,0,0,0,0,0,106,0,0,0,2,0,121,13,0,0,0,0,0,0,2,0,121,141,0,0,0,0,0,0,108,0,0,0,2,0,121,5,0,0,0,0,0,0,2,0,121,133,0,0,0,0,0,0,103,0,0,0,2,0,121,111,0,0,0,0,0,0,2,0,121,239,0,0,0,0,0,0,107,0,0,0,2,0,121,17,0,0,0,0,0,0,2,0,121,145,0,0,0,0,0,0,104,0,0,0,2,0,121,115,0,0,0,0,0,0,2,0,121,243,0,0,0,0,0,0,99,0,0,0,2,0,121,101,0,0,0,0,0,0,2,0,121,101,0,0,0,0,0,0,102,0,0,0,2,0,121,107,0,0,0,0,0,0,2,0,121,235,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,86,0,0,0,2,0,121,103,0,0,0,0,0,0,2,0,121,231,0,0,0,0,0,0,87,0,0,0,2,0,121,27,0,0,0,0,0,0,2,0,121,155,0,0,0,0,0,0,88,0,0,0,2,0,121,105,0,0,0,0,0,0,2,0,121,233,0,0,0,0,0,0,90,0,0,0,2,0,121,13,0,0,0,0,0,0,2,0,121,141,0,0,0,0,0,0,91,0,0,0,2,0,121,25,0,0,0,0,0,0,2,0,121,153,0,0,0,0,0,0,92,0,0,0,2,0,121,5,0,0,0,0,0,0,2,0,121,133,0,0,0,0,0,0,93,0,0,0,2,0,121,111,0,0,0,0,0,0,2,0,121,239,0,0,0,0,0,0,94,0,0,0,2,0,121,17,0,0,0,0,0,0,2,0,121,145,0,0,0,0,0,0,95,0,0,0,2,0,121,115,0,0,0,0,0,0,2,0,121,243,0,0,0,0,0,0,97,0,0,0,2,0,121,101,0,0,0,0,0,0,2,0,121,101,0,0,0,0,0,0,98,0,0,0,2,0,121,107,0,0,0,0,0,0,2,0,121,235,0,0,0,0,0,0,96,0,0,0,1,0,73,0,0,0,0,0,0,0,1,0,201,0,0,0,0,0,0,0,100,0,0,0,2,0,121,51,0,0,0,0,0,0,2,0,121,179,0,0,0,0,0,0,105,0,0,0,2,0,121,55,0,0,0,0,0,0,2,0,121,183,0,0,0,0,0,0,101,0,0,0,2,0,121,57,0,0,0,0,0,0,2,0,121,185,0,0,0,0,0,0,106,0,0,0,2,0,121,45,0,0,0,0,0,0,2,0,121,173,0,0,0,0,0,0,108,0,0,0,2,0,121,49,0,0,0,0,0,0,2,0,121,177,0,0,0,0,0,0,103,0,0,0,2,0,121,39,0,0,0,0,0,0,2,0,121,167,0,0,0,0,0,0,107,0,0,0,2,0,121,41,0,0,0,0,0,0,2,0,121,169,0,0,0,0,0,0,104,0,0,0,2,0,121,43,0,0,0,0,0,0,2,0,121,171,0,0,0,0,0,0,99,0,0,0,2,0,121,37,0,0,0,0,0,0,2,0,121,165,0,0,0,0,0,0,102,0,0,0,2,0,121,3,0,0,0,0,0,0,2,0,121,131,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,230,41,1,0,14,17,1,0,52,248,0,0,102,223,0,0,150,198,0,0,0,0,0,0,230,41,1,0,14,17,1,0,52,248,0,0,102,223,0,0,150,198,0,0,0,0,0,0,150,151,154,155,157,158,159,166,167,171,172,173,174,175,178,179,180,181,182,183,185,186,187,188,189,190,191,203,205,206,207,211,214,215,217,218,219,220,221,222,223,229,230,231,233,234,235,236,237,238,239,242,243,244,245,246,247,249,250,251,252,253,254,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,1,255,255,2,3,255,4,5,6,255,255,255,255,255,255,7,8,255,255,255,9,10,11,12,13,255,255,14,15,16,17,18,19,255,20,21,22,23,24,25,26,255,255,255,255,255,255,255,255,255,255,255,27,255,28,29,30,255,255,255,31,255,255,32,33,255,34,35,36,37,38,39,40,255,255,255,255,255,41,42,43,255,44,45,46,47,48,49,50,255,255,51,52,53,54,55,56,255,57,58,59,60,61,62,63,240,1,0,0,180,1,0,0,6,2,0,0,0,0,0,0,178,0,0,0,106,0,0,0,82,1,0,0,32,0,0,0,194,0,0,0,92,0,0,0,46,0,0,0,0,0,0,0,178,0,0,0,106,0,0,0,82,1,0,0,32,0,0,0,230,1,0,0,170,1,0,0,122,0,0,0,0,0,0,0,178,0,0,0,106,0,0,0,82,1,0,0,32,0,0,0,50,1,0,0,118,1,0,0,168,1,0,0,0,0,0,0,178,0,0,0,106,0,0,0,82,1,0,0,32,0,0,0,84,0,0,0,146,0,0,0,228,1,0,0,24,1,0,0,178,0,0,0,106,0,0,0,82,1,0,0,32,0,0,0,8,1,0,0,230,0,0,0,158,1,0,0,0,0,0,0,178,0,0,0,106,0,0,0,82,1,0,0,32,0,0,0,96,0,0,0,48,0,0,0,2,2,0,0,0,0,0,0,178,0,0,0,106,0,0,0,82,1,0,0,32,0,0,0,182,1,0,0,248,1,0,0,26,1,0,0,0,0,0,0,178,0,0,0,106,0,0,0,82,1,0,0,32,0,0,0,154,0,0,0,0,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,0,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,0,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,0,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,0,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,0,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,0,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,0,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,154,0,0,0,12,1,0,0,10,0,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,10,0,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,10,0,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,10,0,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,10,0,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,10,0,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,10,0,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,10,0,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,12,1,0,0,144,1,0,0,130,0,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,130,0,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,130,0,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,130,0,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,130,0,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,130,0,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,130,0,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,130,0,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,144,1,0,0,14,0,0,0,164,1,0,0,116,0,0,0,52,0,0,0,0,0,0,0,0,0,0,0,202,0,0,0,16,1,0,0,44,1,0,0,112,1,0,0,202,1,0,0,100,0,0,0,0,0,0,0,0,0,0,0,202,0,0,0,16,1,0,0,124,1,0,0,174,1,0,0,252,1,0,0,166,1,0,0,0,0,0,0,0,0,0,0,202,0,0,0,16,1,0,0,188,0,0,0,124,0,0,0,42,0,0,0,54,1,0,0,0,0,0,0,0,0,0,0,202,0,0,0,16,1,0,0,238,0,0,0,170,0,0,0,94,0,0,0,72,1,0,0,0,0,0,0,0,0,0,0,202,0,0,0,242,1,0,0,24,0,0,0,98,0,0,0,32,1,0,0,244,1,0,0,0,0,0,0,0,0,0,0,202,0,0,0,16,1,0,0,0,0,0,0,0,0,0,0,4,2,0,0,214,1,0,0,0,0,0,0,0,0,0,0,202,0,0,0,16,1,0,0,0,0,0,0,74,1,0,0,28,0,0,0,84,1,0,0,0,0,0,0,0,0,0,0,202,0,0,0,16,1,0,0,56,1,0,0,242,0,0,0,86,0,0,0,58,0,0,0,210,1,0,0,154,1,0,0,66,1,0,0,142,0,0,0,56,1,0,0,242,0,0,0,86,0,0,0,86,1,0,0,210,1,0,0,154,1,0,0,66,1,0,0,182,0,0,0,56,1,0,0,242,0,0,0,86,0,0,0,198,0,0,0,210,1,0,0,154,1,0,0,66,1,0,0,42,1,0,0,56,1,0,0,242,0,0,0,86,0,0,0,198,1,0,0,210,1,0,0,154,1,0,0,66,1,0,0,162,1,0,0,56,1,0,0,242,0,0,0,86,0,0,0,98,1,0,0,210,1,0,0,154,1,0,0,66,1,0,0,128,1,0,0,56,1,0,0,242,0,0,0,86,0,0,0,82,0,0,0,210,1,0,0,154,1,0,0,66,1,0,0,222,0,0,0,56,1,0,0,242,0,0,0,86,0,0,0,196,0,0,0,210,1,0,0,154,1,0,0,66,1,0,0,112,0,0,0,56,1,0,0,242,0,0,0,86,0,0,0,226,0,0,0,210,1,0,0,154,1,0,0,66,1,0,0,134,1,0,0,200,1,0,0,200,1,0,0,200,1,0,0,200,1,0,0,36,1,0,0,36,1,0,0,36,1,0,0,36,1,0,0,114,0,0,0,114,0,0,0,114,0,0,0,114,0,0,0,218,1,0,0,218,1,0,0,218,1,0,0,218,1,0,0,78,0,0,0,78,0,0,0,78,0,0,0,78,0,0,0,176,1,0,0,176,1,0,0,176,1,0,0,176,1,0,0,20,1,0,0,20,1,0,0,20,1,0,0,20,1,0,0,88,0,0,0,88,0,0,0,88,0,0,0,88,0,0,0,228,0,0,0,228,0,0,0,228,0,0,0,228,0,0,0,66,0,0,0,66,0,0,0,66,0,0,0,66,0,0,0,206,1,0,0,206,1,0,0,206,1,0,0,206,1,0,0,52,1,0,0,52,1,0,0,52,1,0,0,52,1,0,0,126,0,0,0,126,0,0,0,126,0,0,0,126,0,0,0,156,0,0,0,156,0,0,0,156,0,0,0,156,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,96,1,0,0,96,1,0,0,96,1,0,0,96,1,0,0,234,0,0,0,234,0,0,0,234,0,0,0,234,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,234,0,0,0,234,0,0,0,234,0,0,0,234,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,234,0,0,0,234,0,0,0,234,0,0,0,234,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,234,0,0,0,234,0,0,0,234,0,0,0,234,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,234,0,0,0,234,0,0,0,234,0,0,0,234,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,234,0,0,0,234,0,0,0,234,0,0,0,234,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,234,0,0,0,234,0,0,0,234,0,0,0,234,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,234,0,0,0,234,0,0,0,234,0,0,0,234,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,250,0,0,0,68,1,0,0,110,0,0,0,146,1,0,0,80,0,0,0,26,0,0,0,226,1,0,0,212,1,0,0,250,0,0,0,68,1,0,0,110,0,0,0,146,1,0,0,80,0,0,0,26,0,0,0,226,1,0,0,212,1,0,0,250,0,0,0,68,1,0,0,110,0,0,0,146,1,0,0,80,0,0,0,26,0,0,0,226,1,0,0,212,1,0,0,250,0,0,0,68,1,0,0,110,0,0,0,146,1,0,0,80,0,0,0,26,0,0,0,226,1,0,0,212,1,0,0,250,0,0,0,68,1,0,0,110,0,0,0,146,1,0,0,80,0,0,0,26,0,0,0,226,1,0,0,212,1,0,0,250,0,0,0,68,1,0,0,110,0,0,0,146,1,0,0,80,0,0,0,26,0,0,0,226,1,0,0,212,1,0,0,250,0,0,0,68,1,0,0,110,0,0,0,146,1,0,0,80,0,0,0,26,0,0,0,226,1,0,0,212,1,0,0,250,0,0,0,68,1,0,0,110,0,0,0,146,1,0,0,80,0,0,0,26,0,0,0,226,1,0,0,212,1,0,0,184,1,0,0,250,1,0,0,44,0,0,0,232,0,0,0,76,0,0,0,134,0,0,0,216,0,0,0,206,0,0,0,184,1,0,0,250,1,0,0,44,0,0,0,232,0,0,0,76,0,0,0,134,0,0,0,216,0,0,0,206,0,0,0,184,1,0,0,250,1,0,0,44,0,0,0,232,0,0,0,76,0,0,0,134,0,0,0,216,0,0,0,206,0,0,0,184,1,0,0,250,1,0,0,44,0,0,0,232,0,0,0,76,0,0,0,134,0,0,0,216,0,0,0,206,0,0,0,184,1,0,0,250,1,0,0,44,0,0,0,232,0,0,0,76,0,0,0,134,0,0,0,216,0,0,0,206,0,0,0,184,1,0,0,250,1,0,0,44,0,0,0,232,0,0,0,76,0,0,0,134,0,0,0,216,0,0,0,206,0,0,0,184,1,0,0,250,1,0,0,44,0,0,0,232,0,0,0,76,0,0,0,134,0,0,0,216,0,0,0,206,0,0,0,184,1,0,0,250,1,0,0,44,0,0,0,232,0,0,0,76,0,0,0,134,0,0,0,216,0,0,0,206,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,120,1,0,0,178,1,0,0,246,1,0,0,222,1,0,0,214,0,0,0,10,1,0,0,224,1,0,0,60,0,0,0,120,1,0,0,178,1,0,0,246,1,0,0,222,1,0,0,214,0,0,0,10,1,0,0,224,1,0,0,60,0,0,0,120,1,0,0,178,1,0,0,246,1,0,0,222,1,0,0,214,0,0,0,10,1,0,0,224,1,0,0,60,0,0,0,120,1,0,0,178,1,0,0,246,1,0,0,222,1,0,0,214,0,0,0,10,1,0,0,224,1,0,0,60,0,0,0,120,1,0,0,178,1,0,0,246,1,0,0,222,1,0,0,214,0,0,0,10,1,0,0,224,1,0,0,60,0,0,0,120,1,0,0,178,1,0,0,246,1,0,0,222,1,0,0,214,0,0,0,10,1,0,0,224,1,0,0,60,0,0,0,120,1,0,0,178,1,0,0,246,1,0,0,222,1,0,0,214,0,0,0,10,1,0,0,224,1,0,0,60,0,0,0,120,1,0,0,178,1,0,0,246,1,0,0,222,1,0,0,214,0,0,0,10,1,0,0,224,1,0,0,60,0,0,0,144,0,0,0,218,0,0,0,30,0,0,0,234,1,0,0,70,1,0,0,252,0,0,0,190,1,0,0,208,1,0,0,144,0,0,0,218,0,0,0,30,0,0,0,234,1,0,0,70,1,0,0,252,0,0,0,190,1,0,0,208,1,0,0,144,0,0,0,218,0,0,0,30,0,0,0,234,1,0,0,70,1,0,0,252,0,0,0,190,1,0,0,208,1,0,0,144,0,0,0,218,0,0,0,30,0,0,0,234,1,0,0,70,1,0,0,252,0,0,0,190,1,0,0,208,1,0,0,144,0,0,0,218,0,0,0,30,0,0,0,234,1,0,0,70,1,0,0,252,0,0,0,190,1,0,0,208,1,0,0,144,0,0,0,218,0,0,0,30,0,0,0,234,1,0,0,70,1,0,0,252,0,0,0,190,1,0,0,208,1,0,0,144,0,0,0,218,0,0,0,30,0,0,0,234,1,0,0,70,1,0,0,252,0,0,0,190,1,0,0,208,1,0,0,144,0,0,0,218,0,0,0,30,0,0,0,234,1,0,0,70,1,0,0,252,0,0,0,190,1,0,0,208,1,0,0,110,1,0,0,46,1,0,0,16,0,0,0,34,0,0,0,204,0,0,0,38,1,0,0,168,0,0,0,62,0,0,0,110,1,0,0,46,1,0,0,16,0,0,0,34,0,0,0,204,0,0,0,38,1,0,0,168,0,0,0,62,0,0,0,110,1,0,0,46,1,0,0,16,0,0,0,34,0,0,0,204,0,0,0,38,1,0,0,168,0,0,0,62,0,0,0,110,1,0,0,46,1,0,0,16,0,0,0,34,0,0,0,204,0,0,0,38,1,0,0,168,0,0,0,62,0,0,0,110,1,0,0,46,1,0,0,16,0,0,0,34,0,0,0,204,0,0,0,38,1,0,0,168,0,0,0,62,0,0,0,110,1,0,0,46,1,0,0,16,0,0,0,34,0,0,0,204,0,0,0,38,1,0,0,168,0,0,0,62,0,0,0,110,1,0,0,46,1,0,0,16,0,0,0,34,0,0,0,204,0,0,0,38,1,0,0,168,0,0,0,62,0,0,0,110,1,0,0,46,1,0,0,16,0,0,0,34,0,0,0,204,0,0,0,38,1,0,0,168,0,0,0,62,0,0,0,176,0,0,0,102,0,0,0,20,0,0,0,40,0,0,0,36,0,0,0,248,0,0,0,184,0,0,0,204,1,0,0,176,0,0,0,102,0,0,0,20,0,0,0,14,1,0,0,36,0,0,0,248,0,0,0,184,0,0,0,50,0,0,0,176,0,0,0,102,0,0,0,20,0,0,0,166,0,0,0,36,0,0,0,248,0,0,0,184,0,0,0,74,0,0,0,176,0,0,0,102,0,0,0,20,0,0,0,172,1,0,0,36,0,0,0,248,0,0,0,184,0,0,0,22,1,0,0,176,0,0,0,102,0,0,0,20,0,0,0,0,0,0,0,36,0,0,0,248,0,0,0,184,0,0,0,0,0,0,0,176,0,0,0,102,0,0,0,20,0,0,0,0,0,0,0,36,0,0,0,248,0,0,0,184,0,0,0,0,0,0,0,176,0,0,0,102,0,0,0,20,0,0,0,0,0,0,0,36,0,0,0,248,0,0,0,184,0,0,0,0,0,0,0,176,0,0,0,102,0,0,0,20,0,0,0,0,0,0,0,36,0,0,0,248,0,0,0,184,0,0,0,0,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0])
.concat([18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,18,0,0,0,22,0,0,0,22,0,0,0,22,0,0,0,22,0,0,0,22,0,0,0,22,0,0,0,22,0,0,0,22,0,0,0,14,0,0,0,14,0,0,0,14,0,0,0,14,0,0,0,14,0,0,0,14,0,0,0,14,0,0,0,14,0,0,0,62,0,0,0,62,0,0,0,62,0,0,0,62,0,0,0,62,0,0,0,62,0,0,0,62,0,0,0,62,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,26,0,0,0,30,0,0,0,30,0,0,0,30,0,0,0,30,0,0,0,30,0,0,0,30,0,0,0,30,0,0,0,52,0,0,0,8,0,0,0,8,0,0,0,8,0,0,0,8,0,0,0,8,0,0,0,8,0,0,0,8,0,0,0,8,0,0,0,34,0,0,0,34,0,0,0,34,0,0,0,34,0,0,0,34,0,0,0,34,0,0,0,34,0,0,0,34,0,0,0,38,0,0,0,36,0,0,0,64,0,0,0,66,0,0,0,20,0,0,0,42,0,0,0,42,0,0,0,42,0,0,0,8,0,0,0,226,0,0,0,188,0,0,0,86,0,0,0,182,0,0,0,128,0,0,0,70,0,0,0,16,0,0,0,28,0,0,0,104,0,0,0,12,1,0,0,16,1,0,0,182,0,0,0,128,0,0,0,70,0,0,0,16,0,0,0,12,0,0,0,48,0,0,0,98,0,0,0,178,0,0,0,182,0,0,0,128,0,0,0,70,0,0,0,16,0,0,0,144,0,0,0,100,0,0,0,248,0,0,0,108,0,0,0,182,0,0,0,128,0,0,0,70,0,0,0,16,0,0,0,94,0,0,0,38,0,0,0,176,0,0,0,8,1,0,0,182,0,0,0,128,0,0,0,70,0,0,0,16,0,0,0,232,0,0,0,192,0,0,0,138,0,0,0,108,0,0,0,182,0,0,0,128,0,0,0,70,0,0,0,16,0,0,0,10,0,0,0,50,1,0,0,90,0,0,0,108,0,0,0,182,0,0,0,128,0,0,0,70,0,0,0,16,0,0,0,44,1,0,0,14,0,0,0,52,0,0,0,80,1,0,0,182,0,0,0,128,0,0,0,70,0,0,0,16,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,112,0,0,0,82,1,0,0,38,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,38,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,38,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,38,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,38,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,38,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,38,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,38,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,82,1,0,0,190,0,0,0,142,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,142,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,142,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,142,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,142,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,142,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,142,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,142,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,190,0,0,0,48,1,0,0,26,0,0,0,240,0,0,0,72,0,0,0,108,0,0,0,108,0,0,0,124,0,0,0,134,0,0,0,118,0,0,0,58,0,0,0,18,0,0,0,152,0,0,0,108,0,0,0,108,0,0,0,124,0,0,0,134,0,0,0,224,0,0,0,184,0,0,0,72,1,0,0,64,1,0,0,108,0,0,0,108,0,0,0,124,0,0,0,134,0,0,0,22,0,0,0,64,0,0,0,18,1,0,0,54,0,0,0,108,0,0,0,108,0,0,0,124,0,0,0,134,0,0,0,162,0,0,0,210,0,0,0,2,1,0,0,244,0,0,0,108,0,0,0,108,0,0,0,124,0,0,0,46,1,0,0,154,0,0,0,206,0,0,0,82,0,0,0,60,0,0,0,108,0,0,0,108,0,0,0,124,0,0,0,134,0,0,0,26,1,0,0,68,1,0,0,132,0,0,0,4,1,0,0,108,0,0,0,108,0,0,0,124,0,0,0,134,0,0,0,108,0,0,0,20,0,0,0,168,0,0,0,80,1,0,0,108,0,0,0,108,0,0,0,124,0,0,0,134,0,0,0,170,0,0,0,214,0,0,0,22,1,0,0,66,0,0,0,54,1,0,0,252,0,0,0,204,0,0,0,66,0,0,0,170,0,0,0,214,0,0,0,22,1,0,0,66,0,0,0,54,1,0,0,252,0,0,0,204,0,0,0,66,0,0,0,170,0,0,0,214,0,0,0,22,1,0,0,66,0,0,0,54,1,0,0,252,0,0,0,204,0,0,0,66,0,0,0,170,0,0,0,214,0,0,0,22,1,0,0,66,0,0,0,54,1,0,0,252,0,0,0,204,0,0,0,66,0,0,0,170,0,0,0,214,0,0,0,22,1,0,0,66,0,0,0,54,1,0,0,252,0,0,0,204,0,0,0,66,0,0,0,170,0,0,0,214,0,0,0,22,1,0,0,66,0,0,0,54,1,0,0,252,0,0,0,204,0,0,0,66,0,0,0,170,0,0,0,214,0,0,0,22,1,0,0,66,0,0,0,54,1,0,0,252,0,0,0,204,0,0,0,66,0,0,0,170,0,0,0,214,0,0,0,22,1,0,0,66,0,0,0,54,1,0,0,252,0,0,0,204,0,0,0,66,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,40,0,0,0,62,0,0,0,62,0,0,0,62,0,0,0,62,0,0,0,108,0,0,0,108,0,0,0,108,0,0,0,108,0,0,0,62,0,0,0,62,0,0,0,62,0,0,0,62,0,0,0,108,0,0,0,108,0,0,0,108,0,0,0,108,0,0,0,62,0,0,0,62,0,0,0,62,0,0,0,62,0,0,0,108,0,0,0,108,0,0,0,108,0,0,0,108,0,0,0,62,0,0,0,62,0,0,0,62,0,0,0,62,0,0,0,108,0,0,0,108,0,0,0,108,0,0,0,108,0,0,0,62,0,0,0,62,0,0,0,62,0,0,0,62,0,0,0,108,0,0,0,108,0,0,0,108,0,0,0,108,0,0,0,62,0,0,0,62,0,0,0,62,0,0,0,62,0,0,0,108,0,0,0,108,0,0,0,108,0,0,0,108,0,0,0,62,0,0,0,62,0,0,0,62,0,0,0,62,0,0,0,108,0,0,0,108,0,0,0,108,0,0,0,108,0,0,0,62,0,0,0,62,0,0,0,62,0,0,0,62,0,0,0,108,0,0,0,108,0,0,0,108,0,0,0,108,0,0,0,228,0,0,0,88,0,0,0,78,1,0,0,32,0,0,0,110,0,0,0,78,0,0,0,220,0,0,0,76,1,0,0,228,0,0,0,88,0,0,0,78,1,0,0,32,0,0,0,110,0,0,0,78,0,0,0,220,0,0,0,76,1,0,0,228,0,0,0,88,0,0,0,78,1,0,0,32,0,0,0,110,0,0,0,78,0,0,0,220,0,0,0,76,1,0,0,228,0,0,0,88,0,0,0,78,1,0,0,32,0,0,0,110,0,0,0,78,0,0,0,220,0,0,0,76,1,0,0,228,0,0,0,88,0,0,0,78,1,0,0,32,0,0,0,110,0,0,0,78,0,0,0,220,0,0,0,76,1,0,0,228,0,0,0,88,0,0,0,78,1,0,0,32,0,0,0,110,0,0,0,78,0,0,0,220,0,0,0,76,1,0,0,228,0,0,0,88,0,0,0,78,1,0,0,32,0,0,0,110,0,0,0,78,0,0,0,220,0,0,0,76,1,0,0,228,0,0,0,88,0,0,0,78,1,0,0,32,0,0,0,110,0,0,0,78,0,0,0,220,0,0,0,76,1,0,0,28,1,0,0,30,0,0,0,6,0,0,0,46,0,0,0,196,0,0,0,10,1,0,0,106,0,0,0,0,1,0,0,28,1,0,0,30,0,0,0,6,0,0,0,46,0,0,0,196,0,0,0,10,1,0,0,106,0,0,0,0,1,0,0,28,1,0,0,30,0,0,0,6,0,0,0,46,0,0,0,196,0,0,0,10,1,0,0,106,0,0,0,0,1,0,0,28,1,0,0,30,0,0,0,6,0,0,0,46,0,0,0,196,0,0,0,10,1,0,0,106,0,0,0,0,1,0,0,28,1,0,0,30,0,0,0,6,0,0,0,46,0,0,0,196,0,0,0,10,1,0,0,106,0,0,0,0,1,0,0,28,1,0,0,30,0,0,0,6,0,0,0,46,0,0,0,196,0,0,0,10,1,0,0,106,0,0,0,0,1,0,0,28,1,0,0,30,0,0,0,6,0,0,0,46,0,0,0,196,0,0,0,10,1,0,0,106,0,0,0,0,1,0,0,28,1,0,0,30,0,0,0,6,0,0,0,46,0,0,0,196,0,0,0,10,1,0,0,106,0,0,0,0,1,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,56,0,0,0,2,0,0,0,40,1,0,0,238,0,0,0,20,1,0,0,58,1,0,0,24,0,0,0,234,0,0,0,56,0,0,0,2,0,0,0,40,1,0,0,238,0,0,0,20,1,0,0,58,1,0,0,24,0,0,0,234,0,0,0,56,0,0,0,2,0,0,0,40,1,0,0,238,0,0,0,20,1,0,0,58,1,0,0,24,0,0,0,234,0,0,0,56,0,0,0,2,0,0,0,40,1,0,0,238,0,0,0,20,1,0,0,58,1,0,0,24,0,0,0,234,0,0,0,56,0,0,0,2,0,0,0,40,1,0,0,238,0,0,0,20,1,0,0,58,1,0,0,24,0,0,0,234,0,0,0,56,0,0,0,2,0,0,0,40,1,0,0,238,0,0,0,20,1,0,0,58,1,0,0,24,0,0,0,234,0,0,0,56,0,0,0,2,0,0,0,40,1,0,0,238,0,0,0,20,1,0,0,58,1,0,0,24,0,0,0,234,0,0,0,56,0,0,0,2,0,0,0,40,1,0,0,238,0,0,0,20,1,0,0,58,1,0,0,24,0,0,0,234,0,0,0,150,0,0,0,198,0,0,0,66,1,0,0,230,0,0,0,4,0,0,0,42,1,0,0,102,0,0,0,146,0,0,0,150,0,0,0,198,0,0,0,66,1,0,0,230,0,0,0,4,0,0,0,42,1,0,0,102,0,0,0,146,0,0,0,150,0,0,0,198,0,0,0,66,1,0,0,230,0,0,0,4,0,0,0,42,1,0,0,102,0,0,0,146,0,0,0,150,0,0,0,198,0,0,0,66,1,0,0,230,0,0,0,4,0,0,0,42,1,0,0,102,0,0,0,146,0,0,0,150,0,0,0,198,0,0,0,66,1,0,0,230,0,0,0,4,0,0,0,42,1,0,0,102,0,0,0,146,0,0,0,150,0,0,0,198,0,0,0,66,1,0,0,230,0,0,0,4,0,0,0,42,1,0,0,102,0,0,0,146,0,0,0,150,0,0,0,198,0,0,0,66,1,0,0,230,0,0,0,4,0,0,0,42,1,0,0,102,0,0,0,146,0,0,0,150,0,0,0,198,0,0,0,66,1,0,0,230,0,0,0,4,0,0,0,42,1,0,0,102,0,0,0,146,0,0,0,246,0,0,0,24,1,0,0,148,0,0,0,36,0,0,0,120,0,0,0,172,0,0,0,34,0,0,0,62,1,0,0,246,0,0,0,24,1,0,0,148,0,0,0,36,0,0,0,120,0,0,0,172,0,0,0,34,0,0,0,62,1,0,0,246,0,0,0,24,1,0,0,148,0,0,0,36,0,0,0,120,0,0,0,172,0,0,0,34,0,0,0,62,1,0,0,246,0,0,0,24,1,0,0,148,0,0,0,36,0,0,0,120,0,0,0,172,0,0,0,34,0,0,0,62,1,0,0,246,0,0,0,24,1,0,0,148,0,0,0,36,0,0,0,120,0,0,0,172,0,0,0,34,0,0,0,62,1,0,0,246,0,0,0,24,1,0,0,148,0,0,0,36,0,0,0,120,0,0,0,172,0,0,0,34,0,0,0,62,1,0,0,246,0,0,0,24,1,0,0,148,0,0,0,36,0,0,0,120,0,0,0,172,0,0,0,34,0,0,0,62,1,0,0,246,0,0,0,24,1,0,0,148,0,0,0,36,0,0,0,120,0,0,0,172,0,0,0,34,0,0,0,62,1,0,0,92,0,0,0,122,0,0,0,174,0,0,0,50,0,0,0,208,0,0,0,158,0,0,0,114,0,0,0,6,1,0,0,92,0,0,0,122,0,0,0,174,0,0,0,216,0,0,0,208,0,0,0,158,0,0,0,114,0,0,0,166,0,0,0,92,0,0,0,122,0,0,0,174,0,0,0,60,1,0,0,208,0,0,0,158,0,0,0,114,0,0,0,160,0,0,0,92,0,0,0,122,0,0,0,174,0,0,0,136,0,0,0,208,0,0,0,158,0,0,0,114,0,0,0,74,0,0,0,92,0,0,0,122,0,0,0,174,0,0,0,76,0,0,0,208,0,0,0,158,0,0,0,114,0,0,0,84,0,0,0,92,0,0,0,122,0,0,0,174,0,0,0,56,1,0,0,208,0,0,0,158,0,0,0,114,0,0,0,42,0,0,0,92,0,0,0,122,0,0,0,174,0,0,0,222,0,0,0,208,0,0,0,158,0,0,0,114,0,0,0,108,0,0,0,92,0,0,0,122,0,0,0,174,0,0,0,212,0,0,0,208,0,0,0,158,0,0,0,114,0,0,0,194,0,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,34,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,186,1,0,0,208,0,0,0,0,0,0,0,104,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,90,0,0,0,156,1,0,0,0,0,0,0,0,0,0,0,104,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,190,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,30,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,142,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,162,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,164,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,148,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,108,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,78,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,180,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,244,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1,0,0,60,1,0,0,60,1,0,0,60,1,0,0,60,1,0,0,232,1,0,0,232,1,0,0,232,1,0,0,232,1,0,0,220,1,0,0,220,1,0,0,220,1,0,0,220,1,0,0,70,0,0,0,70,0,0,0,70,0,0,0,70,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,186,0,0,0,40,1,0,0,40,1,0,0,40,1,0,0,40,1,0,0,174,0,0,0,174,0,0,0,174,0,0,0,174,0,0,0,136,1,0,0,136,1,0,0,136,1,0,0,136,1,0,0,254,1,0,0,254,1,0,0,254,1,0,0,254,1,0,0,138,1,0,0,138,1,0,0,138,1,0,0,138,1,0,0,140,0,0,0,140,0,0,0,140,0,0,0,140,0,0,0,6,1,0,0,6,1,0,0,6,1,0,0,6,1,0,0,150,1,0,0,150,1,0,0,150,1,0,0,150,1,0,0,72,0,0,0,72,0,0,0,72,0,0,0,72,0,0,0,76,1,0,0,76,1,0,0,76,1,0,0,76,1,0,0,130,1,0,0,130,1,0,0,130,1,0,0,130,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,236,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,108,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,126,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,212,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,195,0,0,2,0,0,0,40,180,0,0,2,0,0,0,200,166,0,0,10,0,0,0,0,0,0,0,0,0,0,0,48,214,0,0,18,0,0,0,64,222,0,0,16,0,0,0,208,196,0,0,12,0,0,0,48,181,0,0,12,0,0,0,112,167,0,0,14,0,0,0,40,155,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,80,0,0,0,1,0,0,0,8,0,0,0,0,2,0,0,2,0,0,0,0,160,5,0,80,0,0,0,1,0,0,0,9,0,0,0,0,2,0,0,2,0,0,0,0,178,5,0,81,0,0,0,1,0,0,0,9,0,0,0,0,2,0,0,2,0,0,0,0,196,5,0,82,0,0,0,1,0,0,0,9,0,0,0,0,2,0,0,2,0,0,0,0,214,5,0,83,0,0,0,1,0,0,0,9,0,0,0,0,2,0,0,2,0,0,0,0,64,6,0,80,0,0,0,1,0,0,0,10,0,0,0,0,2,0,0,2,0,0,0,0,84,6,0,81,0,0,0,1,0,0,0,10,0,0,0,0,2,0,0,2,0,0,0,0,104,6,0,82,0,0,0,1,0,0,0,10,0,0,0,0,2,0,0,2,0,0,0,0,124,6,0,83,0,0,0,1,0,0,0,10,0,0,0,0,2,0,0,2,0,0,0,0,224,6,0,80,0,0,0,1,0,0,0,11,0,0,0,0,2,0,0,2,0,0,0,0,246,6,0,81,0,0,0,1,0,0,0,11,0,0,0,0,2,0,0,2,0,0,0,0,12,7,0,82,0,0,0,1,0,0,0,11,0,0,0,0,2,0,0,2,0,0,0,0,34,7,0,83,0,0,0,1,0,0,0,11,0,0,0,0,2,0,0,2,0,0,0,0,0,10,0,80,0,0,0,2,0,0,0,8,0,0,0,0,2,0,0,2,0,0,0,0,64,11,0,80,0,0,0,2,0,0,0,9,0,0,0,0,2,0,0,2,0,0,0,0,100,11,0,81,0,0,0,2,0,0,0,9,0,0,0,0,2,0,0,2,0,0,0,0,136,11,0,82,0,0,0,2,0,0,0,9,0,0,0,0,2,0,0,2,0,0,0,0,172,11,0,83,0,0,0,2,0,0,0,9,0,0,0,0,2,0,0,2,0,0,0,0,128,12,0,80,0,0,0,2,0,0,0,10,0,0,0,0,2,0,0,2,0,0,0,0,168,12,0,81,0,0,0,2,0,0,0,10,0,0,0,0,2,0,0,2,0,0,0,0,208,12,0,82,0,0,0,2,0,0,0,10,0,0,0,0,2,0,0,2,0,0,0,0,248,12,0,83,0,0,0,2,0,0,0,10,0,0,0,0,2,0,0,2,0,0,0,0,192,13,0,80,0,0,0,2,0,0,0,11,0,0,0,0,2,0,0,2,0,0,0,0,236,13,0,81,0,0,0,2,0,0,0,11,0,0,0,0,2,0,0,2,0,0,0,0,24,14,0,82,0,0,0,2,0,0,0,11,0,0,0,0,2,0,0,2,0,0,0,0,68,14,0,83,0,0,0,2,0,0,0,11,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,2,0,40,0,0,0,1,0,0,0,8,0,0,0,0,2,0,0,2,0,0,0,0,208,2,0,40,0,0,0,1,0,0,0,9,0,0,0,0,2,0,0,2,0,0,0,0,0,5,0,40,0,0,0,2,0,0,0,8,0,0,0,0,2,0,0,2,0,0,0,0,160,5,0,40,0,0,0,2,0,0,0,9,0,0,0,0,2,0,0,2,0,0,0,0,0,10,0,80,0,0,0,2,0,0,0,8,0,0,0,0,2,0,0,2,0,0,0,0,64,11,0,80,0,0,0,2,0,0,0,9,0,0,0,0,2,0,0,2,0,0,0,0,128,12,0,80,0,0,0,2,0,0,0,10,0,0,0,0,2,0,0,2,0,0,0,0,192,18,0,80,0,0,0,2,0,0,0,15,0,0,0,0,2,0,0,2,128,0,0,0,128,22,0,80,0,0,0,2,0,0,0,18,0,0,0,0,2,0,0,2,128,0,0,0,0,45,0,80,0,0,0,2,0,0,0,36,0,0,0,0,2,0,0,2,128,0,0,0,64,19,0,77,0,0,0,2,0,0,0,8,0,0,0,0,4,0,0,2,128,0,0,0,233,3,0,77,0,0,0,1,0,0,0,26,0,0,0,128,0,0,0,1,128,0,0,0,210,7,0,77,0,0,0,2,0,0,0,26,0,0,0,128,0,0,0,1,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,66,85,83,69,0,0,0,0,67,77,80,46,76,0,0,0,118,105,100,101,111,0,0,0,83,116,97,99,107,83,112,97,99,101,0,0,0,0,0,0,83,116,97,114,116,82,105,103,104,116,0,0,0,0,0,0,110,111,110,101,0,0,0,0,42,42,42,32,82,65,77,32,110,111,116,32,102,111,117,110,100,32,97,116,32,48,48,48,48,48,48,10,0,0,0,0,67,77,80,65,46,87,0,0,77,111,118,101,72,72,105,0,83,117,112,101,114,82,105,103,104,116,0,0,0,0,0,0,42,42,42,32,117,110,107,110,111,119,110,32,99,112,117,32,109,111,100,101,108,32,40,37,115,41,10,0,0,0,0,0,69,79,82,46,66,0,0,0,77,97,120,65,112,112,108,90,111,110,101,0,0,0,0,0,45,40,65,37,117,41,0,0,77,101,116,97,82,105,103,104,116,0,0,0,0,0,0,0,109,111,100,101,108,61,37,115,32,115,112,101,101,100,61,37,100,10,0,0,0,0,0,0,67,77,80,77,46,66,0,0,80,117,114,103,101,83,112,97,99,101,0,0,0,0,0,0,65,108,116,82,105,103,104,116,0,0,0,0,0,0,0,0,67,80,85,58,0,0,0,0,69,79,82,46,87,0,0,0,77,97,120,66,108,111,99,107,0,0,0,0,0,0,0,0,83,112,97,99,101,0,0,0,115,112,101,101,100,0,0,0,67,77,80,77,46,87,0,0,72,70,83,68,105,115,112,97,116,99,104,0,0,0,0,0,68,101,108,101,116,101,0,0,65,108,116,0,0,0,0,0,99,112,117,0,0,0,0,0,115,111,110,121,58,32,99,104,115,32,101,114,114,111,114,32,40,98,108,107,61,37,108,117,44,32,108,98,97,61,37,108,117,41,10,0,0,0,0,0,69,79,82,46,76,0,0,0,78,77,82,101,109,111,118,101,0,0,0,0,0,0,0,0,115,99,115,105,58,32,114,101,97,100,32,101,114,114,111,114,32,97,116,32,37,108,117,32,43,32,37,108,117,10,0,0,65,108,116,76,101,102,116,0,97,108,116,101,114,110,97,116,101,32,115,111,117,110,100,32,98,117,102,102,101,114,10,0,67,77,80,77,46,76,0,0,101,109,117,46,105,119,109,46,114,111,0,0,0,0,0,0,78,77,73,110,115,116,97,108,108,0,0,0,0,0,0,0,101,109,117,46,101,120,105,116,0,0,0,0,0,0,0,0,70,57,0,0,0,0,0,0,33,61,0,0,0,0,0,0,77,111,100,101,0,0,0,0,123,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,109,97,105,110,32,115,111,117,110,100,32,98,117,102,102,101])
.concat([114,10,0,0,0,0,0,0,98,105,110,0,0,0,0,0,109,111,117,115,101,95,109,117,108,95,120,0,0,0,0,0,97,100,100,114,61,48,120,37,48,56,108,120,32,115,105,122,101,61,37,108,117,32,102,105,108,101,61,37,115,10,0,0,34,10,0,0,0,0,0,0,104,0,0,0,0,0,0,0,45,45,37,115,0,0,0,0,67,77,80,65,46,76,0,0,101,120,112,101,99,116,105,110,103,32,101,120,112,114,101,115,115,105,111,110,0,0,0,0,116,100,48,58,32,100,114,111,112,112,105,110,103,32,112,104,97,110,116,111,109,32,115,101,99,116,111,114,32,37,117,47,37,117,47,37,117,10,0,0,82,101,108,101,97,115,101,32,51,46,48,55,36,48,0,0,46,114,97,119,0,0,0,0,83,119,97,112,77,77,85,77,111,100,101,0,0,0,0,0,79,0,0,0,0,0,0,0,87,105,110,100,111,119,115,76,101,102,116,0,0,0,0,0,97,108,116,101,114,110,97,116,101,32,118,105,100,101,111,32,98,117,102,102,101,114,10,0,77,85,76,85,46,87,0,0,77,101,109,111,114,121,68,105,115,112,97,116,99,104,0,0,83,116,97,114,116,76,101,102,116,0,0,0,0,0,0,0,109,97,105,110,32,118,105,100,101,111,32,98,117,102,102,101,114,10,0,0,0,0,0,0,103,0,0,0,0,0,0,0,82,83,69,84,0,0,0,0,65,78,68,46,66,0,0,0,80,111,119,101,114,79,102,102,0,0,0,0,0,0,0,0,115,112,101,101,100,58,32,37,117,10,0,0,0,0,0,0,83,117,112,101,114,76,101,102,116,0,0,0,0,0,0,0,86,73,65,58,0,0,0,0,65,66,67,68,46,66,0,0,80,114,105,109,101,84,105,109,101,0,0,0,0,0,0,0,77,101,116,97,0,0,0,0,118,105,97,0,0,0,0,0,65,78,68,46,87,0,0,0,82,109,118,84,105,109,101,0,40,65,37,117,41,43,0,0,77,101,116,97,76,101,102,116,0,0,0,0,0,0,0,0,83,67,67,58,0,0,0,0,116,101,114,109,46,116,105,116,108,101,0,0,0,0,0,0,65,78,68,46,76,0,0,0,73,110,115,84,105,109,101,0,67,116,114,108,0,0,0,0,115,99,99,0,0,0,0,0,83,101,116,65,112,112,66,97,115,101,0,0,0,0,0,0,67,116,114,108,76,101,102,116,0,0,0,0,0,0,0,0,42,42,42,32,99,97,110,39,116,32,111,112,101,110,32,100,114,105,118,101,114,32,40,37,115,41,10,0,0,0,0,0,77,85,76,83,46,87,0,0,76,111,119,101,114,84,101,120,116,0,0,0,0,0,0,0,67,114,101,97,116,101,0,0,47,0,0,0,0,0,0,0,42,42,42,32,98,97,100,32,112,111,114,116,32,110,117,109,98,101,114,32,40,37,117,41,10,0,0,0,0,0,0,0,115,111,110,121,58,32,119,114,105,116,101,32,101,114,114,111,114,32,97,116,32,37,117,47,37,117,47,37,117,10,0,0,65,68,68,65,46,87,0,0,83,116,114,105,112,65,100,100,114,101,115,115,0,0,0,0,115,99,115,105,58,32,116,111,111,32,109,97,110,121,32,98,108,111,99,107,115,32,40,37,117,41,10,0,0,0,0,0,83,108,97,115,104,0,0,0,112,111,114,116,61,37,117,32,109,117,108,116,105,99,104,97,114,61,37,117,32,100,114,105,118,101,114,61,37,115,10,0,65,68,68,46,66,0,0,0,101,109,117,46,100,105,115,107,46,114,119,0,0,0,0,0,115,100,108,58,32,98,108,105,116,32,101,114,114,111,114,10,0,0,0,0,0,0,0,0,85,112,114,83,116,114,105,110,103,0,0,0,0,0,0,0,48,0,0,0,0,0,0,0,70,56,0,0,0,0,0,0,61,61,0,0,0,0,0,0,46,0,0,0,0,0,0,0,83,69,82,73,65,76,58,0,115,101,99,116,105,111,110,0,102,0,0,0,0,0,0,0,105,103,110,111,114,105,110,103,32,112,99,101,32,107,101,121,58,32,37,48,52,120,32,40,37,115,41,10,0,0,0,0,115,114,101,99,0,0,0,0,115,99,97,108,101,0,0,0,82,65,77,58,0,0,0,0,99,112,117,46,109,111,100,101,108,32,61,32,34,0,0,0,99,0,0,0,0,0,0,0,32,32,0,0,0,0,0,0,65,68,68,88,46,66,0,0,101,120,112,101,99,116,105,110,103,32,111,102,102,115,101,116,0,0,0,0,0,0,0,0,116,100,48,58,32,99,114,99,32,101,114,114,111,114,32,97,116,32,115,101,99,116,111,114,32,37,117,47,37,117,47,37,117,32,40,37,48,50,88,32,37,48,52,88,32,37,48,52,88,41,10,0,0,0,0,0,82,101,108,101,97,115,101,32,51,46,48,50,36,48,0,0,46,112,115,105,0,0,0,0,87,114,105,116,101,88,80,114,97,109,0,0,0,0,0,0,78,0,0,0,0,0,0,0,80,101,114,105,111,100,0,0,109,117,108,116,105,99,104,97,114,0,0,0,0,0,0,0,65,68,68,46,87,0,0,0,82,101,97,100,88,80,114,97,109,0,0,0,0,0,0,0,44,0,0,0,0,0,0,0,112,111,114,116,0,0,0,0,105,119,109,58,32,100,114,105,118,101,32,37,117,32,101,106,101,99,116,10,0,0,0,0,114,117,110,32,117,110,116,105,108,32,101,120,99,101,112,116,105,111,110,0,0,0,0,0,115,115,112,0,0,0,0,0,65,68,68,88,46,87,0,0,82,101,108,83,116,114,105,110,103,0,0,0,0,0,0,0,115,121,115,116,101,109,32,116,111,111,32,115,108,111,119,44,32,115,107,105,112,112,105,110,103,32,49,32,115,101,99,111,110,100,10,0,0,0,0,0,67,111,109,109,97,0,0,0,99,111,112,121,32,109,101,109,111,114,121,0,0,0,0,0,115,101,114,105,97,108,0,0,32,68,51,61,37,48,56,108,88,32,32,68,55,61,37,48,56,108,88,32,32,65,51,61,37,48,56,108,88,32,32,65,55,61,37,48,56,108,88,32,32,83,83,80,61,37,48,56,108,88,10,0,0,0,0,0,65,68,68,46,76,0,0,0,82,68,114,118,114,73,110,115,116,97,108,108,0,0,0,0,109,0,0,0,0,0,0,0,115,114,99,32,100,115,116,32,99,110,116,0,0,0,0,0,42,42,42,32,114,101,97,100,105,110,103,32,114,116,99,32,102,105,108,101,32,102,97,105,108,101,100,10,0,0,0,0,32,68,50,61,37,48,56,108,88,32,32,68,54,61,37,48,56,108,88,32,32,65,50,61,37,48,56,108,88,32,32,65,54,61,37,48,56,108,88,32,32,85,83,80,61,37,48,56,108,88,10,0,0,0,0,0,65,68,68,88,46,76,0,0,65,100,100,68,114,105,118,101,0,0,0,0,0,0,0,0,68,0,0,0,0,0,0,0,110,0,0,0,0,0,0,0,101,118,97,108,117,97,116,101,32,101,120,112,114,101,115,115,105,111,110,115,0,0,0,0,60,110,111,119,62,0,0,0,32,68,49,61,37,48,56,108,88,32,32,68,53,61,37,48,56,108,88,32,32,65,49,61,37,48,56,108,88,32,32,65,53,61,37,48,56,108,88,32,32,76,80,67,61,37,48,56,108,88,10,0,0,0,0,0,65,68,68,65,46,76,0,0,80,117,114,103,101,77,101,109,0,0,0,0,0,0,0,0,98,0,0,0,0,0,0,0,91,101,120,112,114,46,46,46,93,0,0,0,0,0,0,0,102,105,108,101,61,37,115,32,114,101,97,108,116,105,109,101,61,37,100,32,115,116,97,114,116,61,37,115,32,114,111,109,100,105,115,107,61,37,100,10,0,0,0,0,0,0,0,0,32,68,48,61,37,48,56,108,88,32,32,68,52,61,37,48,56,108,88,32,32,65,48,61,37,48,56,108,88,32,32,65,52,61,37,48,56,108,88,32,32,32,80,67,61,37,48,56,108,88,10,0,0,0,0,0,82,79,82,46,66,0,0,0,67,111,109,112,97,99,116,77,101,109,0,0,0,0,0,0,117,110,104,97,110,100,108,101,100,32,109,97,103,105,99,32,107,101,121,32,40,37,117,41,10,0,0,0,0,0,0,0,118,0,0,0,0,0,0,0,119,114,105,116,101,32,109,101,109,111,114,121,32,116,111,32,97,32,102,105,108,101,0,0,82,84,67,58,0,0,0,0,32,83,82,61,37,48,52,88,91,37,99,37,99,93,32,32,67,67,61,37,48,50,88,91,37,99,37,99,37,99,37,99,37,99,93,32,69,88,61,37,48,50,88,40,37,45,52,115,41,32,84,82,80,61,37,48,52,88,32,73,77,76,61,37,88,32,73,80,76,61,37,88,10,0,0,0,0,0,0,0,82,79,88,82,46,66,0,0,83,101,116,71,114,111,119,90,111,110,101,0,0,0,0,0,71,101,116,86,111,108,73,110,102,111,0,0,0,0,0,0,99,0,0,0,0,0,0,0,110,97,109,101,32,91,102,109,116,93,32,91,97,32,110,46,46,46,93,0,0,0,0,0,115,116,97,114,116,0,0,0,37,48,52,88,0,0,0,0,67,76,75,61,37,108,120,32,32,79,80,61,37,108,120,32,32,68,76,89,61,37,108,117,32,32,67,80,73,61,37,46,52,102,10,0,0,0,0,0,68,105,97,108,111,103,68,105,115,112,97,116,99,104,0,0,115,111,110,121,58,32,99,111,110,116,114,111,108,58,32,117,110,107,110,111,119,110,32,40,111,112,99,111,100,101,61,48,120,37,48,52,120,41,10,0,76,83,82,46,66,0,0,0,77,111,100,97,108,68,105,97,108,111,103,77,101,110,117,83,101,116,117,112,0,0,0,0,77,101,110,117,67,104,111,105,99,101,0,0,0,0,0,0,83,101,116,77,67,69,110,116,114,105,101,115,0,0,0,0,72,78,111,80,117,114,103,101,0,0,0,0,0,0,0,0,71,101,116,77,67,69,110,116,114,121,0,0,0,0,0,0,68,105,115,112,77,67,69,110,116,114,105,101,115,0,0,0,115,99,115,105,58,32,119,114,105,116,101,32,101,114,114,111,114,10,0,0,0,0,0,0,83,101,116,77,67,73,110,102,111,0,0,0,0,0,0,0,120,0,0,0,0,0,0,0,113,117,105,116,0,0,0,0,71,101,116,77,67,73,110,102,111,0,0,0,0,0,0,0,114,111,109,100,105,115,107,0,68,101,108,77,67,69,110,116,114,105,101,115,0,0,0,0,72,105,103,104,76,101,118,101,108,70,83,68,105,115,112,97,116,99,104,0,0,0,0,0,54,56,48,48,48,0,0,0,67,111,112,121,68,101,101,112,77,97,115,107,0,0,0,0,65,83,82,46,66,0,0,0,83,101,101,100,67,70,105,108,108,0,0,0,0,0,0,0,67,97,108,99,67,77,97,115,107,0,0,0,0,0,0,0,101,109,117,46,100,105,115,107,46,114,111,0,0,0,0,0,83,101,116,83,116,100,67,80,114,111,99,115,0,0,0,0,115,100,108,58,32,107,101,121,32,61,32,48,120,37,48,52,120,10,0,0,0,0,0,0,72,80,117,114,103,101,0,0,68,101,108,67,111,109,112,0,116,101,114,109,46,102,117,108,108,115,99,114,101,101,110,0,68,101,108,83,101,97,114,99,104,0,0,0,0,0,0,0,70,55,0,0,0,0,0,0,78,101,119,67,68,105,97,108,111,103,0,0,0,0,0,0,38,0,0,0,0,0,0,0,122,0,0,0,0,0,0,0,115,101,110,100,32,97,32,109,101,115,115,97,103,101,32,116,111,32,116,104,101,32,101,109,117,108,97,116,111,114,32,99,111,114,101,0,0,0,0,0,82,101,115,116,111,114,101,69,110,116,114,105,101,115,0,0,114,101,97,108,116,105,109,101,0,0,0,0,0,0,0,0,83,97,118,101,69,110,116,114,105,101,115,0,0,0,0,0,101,0,0,0,0,0,0,0,71,101,116,67,87,77,103,114,80,111,114,116,0,0,0,0,77,69,77,0,0,0,0,0,105,104,120,0,0,0,0,0,109,105,110,95,104,0,0,0,100,101,102,97,117,108,116,0,10,0,0,0,0,0,0,0,83,101,116,68,101,115,107,67,80,97,116,0,0,0,0,0,111,102,102,115,101,116,0,0,44,32,0,0,0,0,0,0,115,121,110,116,97,120,32,101,114,114,111,114,0,0,0,0,82,79,82,46,76,0,0,0,58,0,0,0,0,0,0,0,71,101,116,78,101,119,67,87,105,110,100,111,119,0,0,0,116,100,48,58,32,115,101,99,116,111,114,32,99,114,99,32,111,118,101,114,32,104,101,97,100,101,114,43,100,97,116,97,10,0,0,0,0,0,0,0,78,101,119,67,87,105,110,100,111,119,0,0,0,0,0,0,99,112,50,58,32,119,97,114,110,105,110,103,58,32,117,110,107,110,111,119,110,32,67,80,50,32,118,101,114,115,105,111,110,10,0,0,0,0,0,0,71,101,116,65,117,120,67,116,108,0,0,0,0,0,0,0,46,112,102,100,99,0,0,0,80,116,114,90,111,110,101,0,83,101,116,67,116,108,67,111,108,111,114,0,0,0,0,0,109,111,117,115,101,95,99,110,116,58,32,37,100,10,0,0,71,101,116,65,117,120,87,105,110,0,0,0,0,0,0,0,108,111,103,0,0,0,0,0,83,101,116,87,105,110,67,111,108,111,114,0,0,0,0,0,60,0,0,0,0,0,0,0,109,115,103,32,91,118,97,108,93,0,0,0,0,0,0,0,81,68,69,114,114,111,114,0,112,114,97,109,46,100,97,116,0,0,0,0,0,0,0,0,83,101,116,69,110,116,114,105,101,115,0,0,0,0,0,0,82,101,115,101,114,118,101,69,110,116,114,121,0,0,0,0,87,82,37,48,50,117,65,61,37,48,50,88,32,32,82,82,37,48,50,117,65,61,37,48,50,88,32,32,87,82,37,48,50,117,66,61,37,48,50,88,32,32,82,82,37,48,50,117,66,61,37,48,50,88,10,0,80,114,111,116,101,99,116,69,110,116,114,121,0,0,0,0,82,79,88,82,46,76,0,0,83,101,116,67,108,105,101,110,116,73,68,0,0,0,0,0,65,100,100,67,111,109,112,0,65,100,100,83,101,97,114,99,104,0,0,0,0,0,0,0,83,101,116,84,114,97,112,65,100,100,114,101,115,115,0,0,77,97,107,101,73,84,97,98,108,101,0,0,0,0,0,0,85,112,100,97,116,101,80,105,120,77,97,112,0,0,0,0,71,101,116,83,117,98,84,97,98,108,101,0,0,0,0,0,76,101,115,115,0,0,0,0,114,101,97,100,32,97,32,102,105,108,101,32,105,110,116,111,32,109,101,109,111,114,121,0,82,101,97,108,67,111,108,111,114,0,0,0,0,0,0,0,114,116,99,0,0,0,0,0,73,110,118,101,114,116,67,111,108,111,114,0,0,0,0,0,73,110,100,101,120,50,67,111,108,111,114,0,0,0,0,0,32,32,73,82,81,61,37,117,10,0,0,0,0,0,0,0,91,101,120,99,101,112,116,105,111,110,93,0,0,0,0,0,117,115,112,0,0,0,0,0,67,111,108,111,114,50,73,110,100,101,120,0,0,0,0,0,76,83,82,46,76,0,0,0,71,101,116,71,68,101,118,105,99,101,0,0,0,0,0,0,83,101,116,71,68,101,118,105,99,101,0,0,0,0,0,0,68,105,115,112,111,115,71,68,101,118,105,99,101,0,0,0,71,101,116,84,114,97,112,65,100,100,114,101,115,115,0,0,78,101,119,71,68,101,118,105,99,101,0,0,0,0,0,0,73,110,105,116,71,68,101,118,105,99,101,0,0,0,0,0,83,101,116,68,101,118,105,99,101,65,116,116,114,105,98,117,116,101,0,0,0,0,0,0,109,97,99,58,32,114,101,115,101,116,10,0,0,0,0,0,83,104,105,102,116,0,0,0,110,97,109,101,32,91,102,109,116,93,32,91,97,32,91,110,93,93,0,0,0,0,0,0,84,101,115,116,68,101,118,105,99,101,65,116,116,114,105,98,117,116,101,0,0,0,0,0,109,111,100,101,108,61,37,117,32,105,110,116,101,114,110,97,116,105,111,110,97,108,61,37,100,32,107,101,121,112,97,100,61,37,115,10,0,0,0,0,71,101,116,78,101,120,116,68,101,118,105,99,101,0,0,0,71,101,116,77,97,105,110,68,101,118,105,99,101,0,0,0,56,53,51,48,45,83,67,67,0,0,0,0,0,0,0,0,71,101,116,68,101,118,105,99,101,76,105,115,116,0,0,0,65,83,82,46,76,0,0,0,71,101,116,67,84,83,101,101,100,0,0,0,0,0,0,0,71,101,116,77,97,120,68,101,118,105,99,101,0,0,0,0,68,105,115,112,111,115,67,67,117,114,115,111,114,0,0,0,70,108,117,115,104,70,105,108,101,0,0,0,0,0,0,0,68,105,115,112,111,115,67,73,99,111,110,0,0,0,0,0,68,105,115,112,111,115,67,84,97,98,108,101,0,0,0,0,67,104,97,114,69,120,116,114,97,0,0,0,0,0,0,0,83,104,105,102,116,76,101,102,116,0,0,0,0,0,0,0,112,114,105,110,116,32,104,101,108,112,0,0,0,0,0,0,72,105,108,105,116,101,67,111,108,111,114,0,0,0,0,0,75,69,89,66,79,65,82,68,58,0,0,0,0,0,0,0,79,112,67,111,108,111,114,0,80,108,111,116,67,73,99,111,110,0,0,0,0,0,0,0,32,32,80,65,61,37,48,50,88,32,32,32,80,66,61,37,48,50,88,32,32,67,66,50,61,37,88,32,32,37,99,84,50,86,61,37,48,52,88,10,0,0,0,0,0,0,0,0,71,101,116,67,73,99,111,110,0,0,0,0,0,0,0,0,65,83,82,46,87,0,0,0,65,108,108,111,99,67,117,114,115,111,114,0,0,0,0,0,83,101,116,67,67,117,114,115,111,114,0,0,0,0,0,0,71,101,116,67,67,117,114,115,111,114,0,0,0,0,0,0,71,101,116,66,97,99,107,67,111,108,111,114,0,0,0,0,83,101,116,70,80,111,115,0,65,0,0,0,0,0,0,0,71,101,116,70,111,114,101,67,111,108,111,114,0,0,0,0,71,101,116,67,84,97,98,108,101,0,0,0,0,0,0,0,92,0,0,0,0,0,0,0,102,105,110,100,32,98,121,116,101,115,32,105,110,32,109,101,109,111,114,121,0,0,0,0,71,101,116,67,80,105,120,101,108,0,0,0,0,0,0,0,105,110,116,108,0,0,0,0,83,101,116,67,80,105,120,101,108,0,0,0,0,0,0,0,82,71,66,66,97,99,107,67,111,108,111,114,0,0,0,0,32,79,82,65,61,37,48,50,88,32,32,79,82,66,61,37,48,50,88,32,32,67,66,49,61,37,88,32,32,32,84,50,76,61,37,48,52,88,10,0,82,71,66,70,111,114,101,67,111,108,111,114,0,0,0,0,82,79,76,46,66,0,0,0,70,105,108,108,67,80,111,108,121,0,0,0,0,0,0,0,70,105,108,108,67,82,103,110,0,0,0,0,0,0,0,0,70,105,108,108,67,65,114,99,0,0,0,0,0,0,0,0,70,105,108,108,67,82,111,117,110,100,82,101,99,116,0,0,83,101,116,70,105,108,84,121,112,101,0,0,0,0,0,0,70,105,108,108,67,79,118,97,108,0,0,0,0,0,0,0,70,105,108,108,67,82,101,99,116,0,0,0,0,0,0,0,66,97,99,107,115,108,97,115,104,0,0,0,0,0,0,0,97,100,100,114,32,99,110,116,32,91,118,97,108,46,46,46,93,0,0,0,0,0,0,0,77,97,107,101,82,71,66,80,97,116,0,0,0,0,0,0,109,111,100,101,108,0,0,0,71,101,116,80,105,120,80,97,116,0,0,0,0,0,0,0,66,97,99,107,80,105,120,80,97,116,0,0,0,0,0,0,32,73,82,65,61,37,48,50,88,32,32,73,82,66,61,37,48,50,88,32,32,67,65,50,61,37,88,32,32,37,99,84,49,86,61,37,48,52,88,10,0,0,0,0,0,0,0,0,80,101,110,80,105,120,80,97,116,0,0,0,0,0,0,0,82,79,88,76,46,66,0,0,67,111,112,121,80,105,120,80,97,116,0,0,0,0,0,0,68,105,115,112,111,115,80,105,120,80,97,116,0,0,0,0,78,101,119,80,105,120,80,97,116,0,0,0,0,0,0,0,83,101,116,67,80,111,114,116,80,105,120,0,0,0,0,0,82,115,116,70,105,108,76,111,99,107,0,0,0,0,0,0,67,111,112,121,80,105,120,77,97,112,0,0,0,0,0,0,68,105,115,112,111,115,80,105,120,77,97,112,0,0,0,0,107,101,121,112,97,100,32,109,111,100,101,58,32,107,101,121,112,97,100,10,0,0,0,0,39,0,0,0,0,0,0,0,101,110,116,101,114,32,98,121,116,101,115,32,105,110,116,111,32,109,101,109,111,114,121,0,78,101,119,80,105,120,77,97,112,0,0,0,0,0,0,0,107,101,121,112,97,100,0,0,73,110,105,116,67,112,111,114,116,0,0,0,0,0,0,0,79,112,101,110,67,112,111,114,116,0,0,0,0,0,0,0,68,68,82,65,61,37,48,50,88,32,68,68,82,66,61,37,48,50,88,32,32,67,65,49,61,37,88,32,32,32,84,49,76,61,37,48,52,88,32,83,72,70,84,61,37,48,50,88,47,37,117,10,0,0,0,0,68,101,98,117,103,103,101,114,0,0,0,0,0,0,0,0,76,83,76,46,66,0,0,0,80,117,116,83,99,114,97,112,0,0,0,0,0,0,0,0,71,101,116,83,99,114,97,112,0,0,0,0,0,0,0,0,90,101,114,111,83,99,114,97,112,0,0,0,0,0,0,0,76,111,100,101,83,99,114,97,112,0,0,0,0,0,0,0,83,101,116,70,105,108,76,111,99,107,0,0,0,0,0,0,85,110,108,111,100,101,83,99,114,97,112,0,0,0,0,0,75,105,108,108,73,79,0,0,73,110,102,111,83,99,114,97,112,0,0,0,0,0,0,0,65,112,111,115,116,114,111,112,104,101,0,0,0,0,0,0,97,100,100,114,32,91,118,97,108,124,115,116,114,105,110,103,46,46,46,93,0,0,0,0,77,101,116,104,111,100,68,105,115,112,97,116,99,104,0,0,109,111,116,105,111,110,0,0,83,101,116,82,101,115,70,105,108,101,65,116,116,114,115,0,71,101,116,82,101,115,70,105,108,101,65,116,116,114,115,0,32,80,67,82,61,37,48,50,88,32,32,65,67,82,61,37,48,50,88,32,32,73,70,82,61,37,48,50,88,32,32,73,69,82,61,37,48,50,88,32,32,73,82,81,61,37,117,10,0,0,0,0,0,0,0,0,71,101,116,65,112,112,80,97,114,109,115,0,0,0,0,0,115,111,110,121,58,32,115,116,97,116,117,115,58,32,117,110,107,110,111,119,110,32,40,99,115,61,48,120,37,48,52,120,41,10,0,0,0,0,0,0,65,83,76,46,66,0,0,0,69,120,105,116,84,111,83,104,101,108,108,0,0,0,0,0,67,104,97,105,110,0,0,0,76,97,117,110,99,104,0,0,85,110,108,111,97,100,83,101,103,0,0,0,0,0,0,0,82,101,115,114,118,77,101,109,0,0,0,0,0,0,0,0,76,111,97,100,83,101,103,0,115,99,115,105,58,32,119,114,105,116,101,32,115,105,122,101,32,109,105,115,109,97,116,99,104,32,40,37,117,32,47,32,37,117,41,10,0,0,0,0,80,116,114,65,110,100,72,97,110,100,0,0,0,0,0,0,81,117,111,116,101,0,0,0,100,117,109,112,32,109,101,109,111,114,121,0,0,0,0,0,80,97,99,107,55,0,0,0,107,101,121,98,111,97,114,100,32,107,101,121,112,97,100,95,109,111,100,101,61,37,115,10,0,0,0,0,0,0,0,0,80,97,99,107,54,0,0,0,80,97,99,107,53,0,0,0,54,53,50,50,45,86,73,65,0,0,0,0,0,0,0,0,69,108,101,109,115,54,56,75,0,0,0,0,0,0,0,0,80,97,99,107,52,0,0,0,68,87,0,0,0,0,0,0,70,80,54,56,75,0,0,0,101,109,117,46,100,105,115,107,46,105,110,115,101,114,116,0,80,97,99,107,51,0,0,0,101,109,117,46,115,116,111,112,0,0,0,0,0,0,0,0,80,97,99,107,50,0,0,0,73,110,105,116,85,116,105,108,0,0,0,0,0,0,0,0,80,97,99,107,49,0,0,0,70,54,0,0,0,0,0,0,80,97,99,107,48,0,0,0,94,0,0,0,0,0,0,0,59,0,0,0,0,0,0,0,91,97,100,100,114,32,91,99,110,116,93,93,0,0,0,0,73,110,105,116,65,108,108,80,97,99,107,115,0,0,0,0,60,110,108,62,0,0,0,0,109,111,117,115,101,10,0,0,73,110,105,116,80,97,99,107,0,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,72,97,110,100,65,110,100,72,97,110,100,0,0,0,0,0,101,120,99,101,112,116,105,111,110,32,37,48,50,88,32,40,37,115,41,10,0,0,0,0,105,104,101,120,0,0,0,0,109,105,110,95,119,0,0,0,115,105,122,101,0,0,0,0,37,115,58,32,101,114,114,111,114,32,112,97,114,115,105,110,103,32,105,110,105,32,115,116,114,105,110,103,32,40,37,115,41,10,0,0,0,0,0,0,80,116,114,84,111,72,97,110,100,0,0,0,0,0,0,0,97,117,116,111,0,0,0,0,32,32,45,37,99,0,0,0,115,116,114,105,110,103,32,116,111,111,32,108,111,110,103,0,101,120,112,101,99,116,105,110,103,32,97,100,100,114,101,115,115,0,0,0,0,0,0,0,80,116,114,84,111,88,72,97,110,100,0,0,0,0,0,0,82,79,76,46,76,0,0,0,116,100,48,58,32,117,110,107,110,111,119,110,32,99,111,109,112,114,101,115,115,105,111,110,32,40,37,117,47,37,117,47,37,117,32,37,117,41,10,0,72,97,110,100,84,111,72,97,110,100,0,0,0,0,0,0,115,116,120,58,32,114,101,97,100,32,101,114,114,111,114,32,40,115,101,99,116,111,114,32,100,97,116,97,41,10,0,0,77,117,110,103,101,114,0,0,99,112,50,58,32,110,111,116,32,97,32,67,80,50,32,102,105,108,101,10,0,0,0,0,46,109,115,97,0,0,0,0,84,69,83,101,116,74,117,115,116,0,0,0,0,0,0,0,68,114,118,114,82,101,109,111,118,101,0,0,0,0,0,0,121,100,105,118,0,0,0,0,84,69,73,110,115,101,114,116,0,0,0,0,0,0,0,0,119,0,0,0,0,0,0,0,84,69,83,99,114,111,108,108,0,0,0,0,0,0,0,0,83,101,109,105,99,111,108,111,110,0,0,0,0,0,0,0,115,101,116,32,97,110,32,101,120,112,114,101,115,115,105,111,110,32,98,114,101,97,107,112,111,105,110,116,32,91,112,97,115,115,61,49,32,114,101,115,101,116,61,48,93,0,0,0,84,69,75,101,121,0,0,0,42,42,42,32,99,97,110,39,116,32,99,114,101,97,116,101,32,97,100,98,10,0,0,0,84,69,80,97,115,116,101,0,84,69,73,100,108,101,0,0,101,0,0,0,0,0,0,0,84,69,68,101,97,99,116,105,118,97,116,101,0,0,0,0,84,69,65,99,116,105,118,97,116,101,0,0,0,0,0,0,82,79,88,76,46,76,0,0,84,69,68,101,108,101,116,101,0,0,0,0,0,0,0,0,84,69,67,117,116,0,0,0,84,69,67,111,112,121,0,0,68,114,118,114,73,110,115,116,97,108,108,0,0,0,0,0,84,69,67,108,105,99,107,0,84,69,85,112,100,97,116,101,0,0,0,0,0,0,0,0,108,0,0,0,0,0,0,0,101,120,112,114,32,91,112,97,115,115,32,91,114,101,115,101,116,93,93,0,0,0,0,0,84,69,78,101,119,0,0,0,101,110,97,98,108,101,100,10,0,0,0,0,0,0,0,0,84,69,83,101,116,83,101,108,101,99,116,0,0,0,0,0,84,69,67,97,108,84,101,120,116,0,0,0,0,0,0,0,109,105,115,115,105,110,103,32,118,97,108,117,101,10,0,0,103,101,0,0,0,0,0,0,99,99,114,0,0,0,0,0,84,69,83,101,116,84,101,120,116,0,0,0,0,0,0,0,84,101,120,116,66,111,120,0,76,83,76,46,76,0,0,0,84,69,68,105,115,112,111,115,101,0,0,0,0,0,0,0,84,69,73,110,105,116,0,0,84,69,71,101,116,84,101,120,116,0,0,0,0,0,0,0,67,109,112,83,116,114,105,110,103,0,0,0,0,0,0,0,80,117,116,73,99,111,110,0,83,121,115,69,114,114,111,114,0,0,0,0,0,0,0,0,83,121,115,66,101,101,112,0,107,0,0,0,0,0,0,0,98,115,120,0,0,0,0,0,54,56,48,50,48,0,0,0,65,68,66,58,0,0,0,0,68,97,116,101,50,83,101,99,0,0,0,0,0,0,0,0,83,101,99,115,50,68,97,116,101,0,0,0,0,0,0,0,37,48,56,108,88,10,0,0,82,115,114,99,77,97,112,69,110,116,114,121,0,0,0,0,79,112,101,110,82,70,80,101,114,109,0,0,0,0,0,0,65,83,76,46,76,0,0,0,75,101,121,84,114,97,110,115,0,0,0,0,0,0,0,0,83,121,115,69,100,105,116,0,85,110,105,113,117,101,73,68,0,0,0,0,0,0,0,0,68,101,108,97,121,0,0,0,71,101,116,78,101,119,77,66,97,114,0,0,0,0,0,0,71,101,116,82,77,101,110,117,0,0,0,0,0,0,0,0,106,0,0,0,0,0,0,0,115,101,116,32,97,110,32,97,100,100,114,101,115,115,32,98,114,101,97,107,112,111,105,110,116,32,91,112,97,115,115,61,49,32,114,101,115,101,116,61,48,93,0,0,0,0,0,0,71,101,116,78,101,119,67,111,110,116,114,111,108,0,0,0,107,101,121,112,97,100,95,109,111,116,105,111,110,0,0,0,71,101,116,78,101,119,87,105,110,100,111,119,0,0,0,0,71,101,116,80,105,99,116,117,114,101,0,0,0,0,0,0,98,97,100,32,114,101,103,105,115,116,101,114,32,40,37,115,41,10,0,0,0,0,0,0,71,101,116,73,99,111,110,0,71,101,116,83,116,114,105,110,103,0,0,0,0,0,0,0,65,83,76,46,87,0,0,0,71,101,116,67,117,114,115,111,114,0,0,0,0,0,0,0,71,101,116,80,97,116,116,101,114,110,0,0,0,0,0,0,67,108,111,115,101,68,101,115,107,65,99,99,0,0,0,0,83,101,116,68,97,116,101,84,105,109,101,0,0,0,0,0,37,115,37,117,0,0,0,0,79,112,101,110,68,101,115,107,65,99,99,0,0,0,0,0,83,121,115,116,101,109,77,101,110,117,0,0,0,0,0,0,104,0,0,0,0,0,0,0,97,100,100,114,32,91,112,97,115,115,32,91,114,101,115,101,116,93,93,0,0,0,0,0,83,121,115,116,101,109,84,97,115,107,0,0,0,0,0,0,107,101,121,98,111,97,114,100,0,0,0,0,0,0,0,0,83,121,115,116,101,109,67,108,105,99,107,0,0,0,0,0,83,121,115,116,101,109,69,118,101,110,116,0,0,0,0,0,109,105,115,115,105,110,103,32,114,101,103,105,115,116,101,114,10,0,0,0,0,0,0,0,67,114,101,97,116,101,82,101,115,70,105,108,101,0,0,0,87,114,105,116,101,82,101,115,111,117,114,99,101,0,0,0,76,83,82,46,87,0,0,0,82,101,115,69,114,114,111,114,0,0,0,0,0,0,0,0,82,109,118,101,82,101,102,101,114,101,110,99,101,0,0,0,82,109,118,101,82,101,115,111,117,114,99,101,0,0,0,0,82,101,97,100,68,97,116,101,84,105,109,101,0,0,0,0,65,100,100,82,101,102,101,114,101,110,99,101,0,0,0,0,65,100,100,82,101,115,111,117,114,99,101,0,0,0,0,0,103,0,0,0,0,0,0,0,98,115,0,0,0,0,0,0,67,104,97,110,103,101,100,82,101,115,111,117,114,99,101,0,109,111,117,115,101,0,0,0,83,101,116,82,101,115,73,110,102,111,0,0,0,0,0,0,71,101,116,82,101,115,73,110,102,111,0,0,0,0,0,0,105,119,109,58,32,115,97,118,105,110,103,32,100,114,105,118,101,32,37,117,32,102,97,105,108,101,100,32,40,100,105,115,107,41,10,0,0,0,0,0,59,32,0,0,0,0,0,0,83,101,116,82,101,115,65,116,116,114,115,0,0,0,0,0,71,101,116,82,101,115,65,116,116,114,115,0,0,0,0,0,76,83,76,46,87,0,0,0,83,105,122,101,82,115,114,99,0,0,0,0,0,0,0,0,72,111,109,101,82,101,115,70,105,108,101,0,0,0,0,0,82,101,108,101,97,115,101,82,101,115,111,117,114,99,101,0,87,114,105,116,101,80,97,114,97,109,0,0,0,0,0,0,76,111,97,100,82,101,115,111,117,114,99,101,0,0,0,0,71,101,116,78,97,109,101,100,82,101,115,111,117,114,99,101,0,0,0,0,0,0,0,0,71,101,116,82,101,115,111,117,114,99,101,0,0,0,0,0,80,114,105,110,116,32,118,101,114,115,105,111,110,32,105,110,102,111,114,109,97,116,105,111,110,0,0,0,0,0,0,0,102,0,0,0,0,0,0,0,108,105,115,116,32,98,114,101,97,107,112,111,105,110,116,115,0,0,0,0,0,0,0,0,107,101,121,112,97,100,32,109,111,100,101,58,32,109,111,116,105,111,110,10,0,0,0,0,97,100,98,0,0,0,0,0,71,101,116,73,110,100,84,121,112,101,0,0,0,0,0,0,67,111,117,110,116,84,121,112,101,115,0,0,0,0,0,0,105,119,109,58,32,108,111,97,100,105,110,103,32,100,114,105,118,101,32,37,117,32,40,112,114,105,41,10,0,0,0,0,71,101,116,73,110,100,82,101,115,111,117,114,99,101,0,0,67,111,117,110,116,82,101,115,111,117,114,99,101,115,0,0,82,79,88,82,46,87,0,0,83,101,116,82,101,115,76,111,97,100,0,0,0,0,0,0,67,108,111,115,101,82,101,115,70,105,108,101,0,0,0,0,85,112,100,97,116,101,82,101,115,70,105,108,101,0,0,0,77,111,114,101,77,97,115,116,101,114,115,0,0,0,0,0,85,115,101,82,101,115,70,105,108,101,0,0,0,0,0,0,83,116,97,116,117,115,0,0,79,112,101,110,82,101,115,70,105,108,101,0,0,0,0,0,118,101,114,115,105,111,110,0,100,0,0,0,0,0,0,0,98,108,0,0,0,0,0,0,82,115,114,99,90,111,110,101,73,110,105,116,0,0,0,0,100,114,105,118,101,61,37,117,32,115,105,122,101,61,37,117,75,32,108,111,99,107,101,100,61,37,100,32,114,111,116,97,116,101,61,37,100,32,100,105,115,107,61,37,117,32,102,105,108,101,61,37,115,10,0,0,73,110,105,116,82,101,115,111,117,114,99,101,115,0,0,0,67,117,114,82,101,115,70,105,108,101,0,0,0,0,0,0,37,45,56,115,32,37,115,44,32,37,115,44,32,37,115,0,83,101,116,82,101,115,80,117,114,103,101,0,0,0,0,0,105,110,115,101,114,116,32,100,114,105,118,101,32,37,117,10,0,0,0,0,0,0,0,0,68,101,116,97,99,104,82,101,115,111,117,114,99,101,0,0,82,79,88,76,46,87,0,0,77,111,100,97,108,68,105,97,108,111,103,0,0,0,0,0,71,101,116,73,84,101,120,116,0,0,0,0,0,0,0,0,83,101,116,73,84,101,120,116,0,0,0,0,0,0,0,0,79,102,102,108,105,110,101,0,83,101,116,68,73,116,101,109,0,0,0,0,0,0,0,0,115,99,115,105,58,32,119,114,105,116,101,32,98,108,111,99,107,32,99,111,117,110,116,32,37,117,10,0,0,0,0,0,71,101,116,68,73,116,101,109,0,0,0,0,0,0,0,0,83,101,116,32,116,104,101,32,108,111,103,32,108,101,118,101,108,32,116,111,32,100,101,98,117,103,32,91,110,111,93,0,115,0,0,0,0,0,0,0,99,108,101,97,114,32,97,32,98,114,101,97,107,112,111,105,110,116,32,111,114,32,97,108,108,0,0,0,0,0,0,0,69,114,114,111,114,83,111,117,110,100,0,0,0,0,0,0,97,117,116,111,95,114,111,116,97,116,101,0,0,0,0,0,80,97,114,97,109,84,101,120,116,0,0,0,0,0,0,0,70,114,101,101,65,108,101,114,116,0,0,0,0,0,0,0,37,45,56,115,32,37,115,44,32,37,115,0,0,0,0,0,67,111,117,108,100,65,108,101,114,116,0,0,0,0,0,0,67,97,117,116,105,111,110,65,108,101,114,116,0,0,0,0,82,79,82,46,87,0,0,0,78,111,116,101,65,108,101,114,116,0,0,0,0,0,0,0,101,109,117,46,100,105,115,107,46,101,106,101,99,116,0,0,83,116,111,112,65,108,101,114,116,0,0,0,0,0,0,0,49,0,0,0,0,0,0,0,65,108,101,114,116,0,0,0,86,82,101,109,111,118,101,0,116,101,114,109,46,114,101,108,101,97,115,101,0,0,0,0,70,105,110,100,68,73,116,101,109,0,0,0,0,0,0,0,70,53,0,0,0,0,0,0,68,105,115,112,111,115,68,105,97,108,111,103,0,0,0,0,94,94,0,0,0,0,0,0,97,0,0,0,0,0,0,0,118,101,114,98,111,115,101,0,91,105,110,100,101,120,93,0,67,108,111,115,101,68,105,97,108,111,103,0,0,0,0,0,60,101,111,102,62,0,0,0,105,110,115,101,114,116,101,100,0,0,0,0,0,0,0,0,68,114,97,119,68,105,97,108,111,103,0,0,0,0,0,0,115,97,118,101,0,0,0,0,68,105,97,108,111,103,83,101,108,101,99,116,0,0,0,0,37,45,56,115,32,37,115,0,97,117,116,111,0,0,0,0,97,115,112,101,99,116,95,121,0,0,0,0,0,0,0,0,115,105,122,101,107,0,0,0,73,115,68,105,97,108,111,103,69,118,101,110,116,0,0,0,37,115,58,32,98,97,100,32,100,114,105,118,101,32,110,117,109,98,101,114,32,40,37,117,41,10,0,0,0,0,0,0,116,121,112,101,0,0,0,0,37,115,58,32,109,105,115,115,105,110,103,32,111,112,116,105,111,110,32,97,114,103,117,109,101,110,116,32,40,45,37,99,41,10,0,0,0,0,0,0,105,100,101,110,116,105,102,105,101,114,32,116,111,111,32,108,111,110,103,0,0,0,0,0,120,0,0,0,0,0,0,0,83,101,108,73,84,101,120,116,0,0,0,0,0,0,0,0,110,111,0,0,0,0,0,0,82,79,76,46,87,0,0,0,116,100,48,58,32,122,101,114,111,32,100,97,116,97,32,108,101,110,103,116,104,32,40,37,117,47,37,117,47,37,117,41,10,0,0,0,0,0,0,0,78,101,119,68,105,97,108,111,103,0,0,0,0,0,0,0,37,117,47,37,117,47,37,117,10,0,0,0,0,0,0,0,71,101,116,78,101,119,68,105,97,108,111,103,0,0,0,0,46,105,109,103,0,0,0,0,73,110,105,116,68,105,97,108,111,103,115,0,0,0,0,0,86,73,110,115,116,97,108,108,0,0,0,0,0,0,0,0,46,116,99,0,0,0,0,0,115,101,114,99,111,110,0,0,121,109,117,108,0,0,0,0,70,114,101,101,68,105,97,108,111,103,0,0,0,0,0,0,115,116,100,105,111,0,0,0,100,105,115,107,32,37,117,58,32,119,114,105,116,105,110,103,32,98,97,99,107,32,102,97,105,108,101,100,10,0,0,0,67,111,117,108,100,68,105,97,108,111,103,0,0,0,0,0,67,97,112,115,76,111,99,107,0,0,0,0,0,0,0,0,83,101,116,32,116,104,101,32,116,101,114,109,105,110,97,108,32,100,101,118,105,99,101,0,98,99,0,0,0,0,0,0,85,112,100,116,68,105,97,108,111,103,0,0,0,0,0,0,87,97,105,116,77,111,117,115,101,85,112,0,0,0,0,0,71,101,116,75,101,121,115,0,114,117,110,32,119,105,116,104,32,98,114,101,97,107,112,111,105,110,116,115,32,97,116,32,97,100,100,114,0,0,0,0,108,111,99,107,101,100,0,0,84,105,99,107,67,111,117,110,116,0,0,0,0,0,0,0,66,117,116,116,111,110,0,0,66,70,84,83,84,0,0,0,83,116,105,108,108,68,111,119,110,0,0,0,0,0,0,0,71,101,116,77,111,117,115,101,0,0,0,0,0,0,0,0,69,118,101,110,116,65,118,97,105,108,0,0,0,0,0,0,70,108,117,115,104,69,118,101,110,116,115,0,0,0,0,0,71,101,116,78,101,120,116,69,118,101,110,116,0,0,0,0,69,110,113,117,101,117,101,0,82,101,116,117,114,110,0,0,116,101,114,109,105,110,97,108,0,0,0,0,0,0,0,0,68,101,113,117,101,117,101,0,68,114,97,119,49,67,111,110,116,114,111,108,0,0,0,0,70,105,110,100,67,111,110,116,114,111,108,0,0,0,0,0,115,105,110,103,108,101,95,115,105,100,101,100,0,0,0,0,99,0,0,0,0,0,0,0,115,112,0,0,0,0,0,0,83,101,116,67,116,108,65,99,116,105,111,110,0,0,0,0,71,101,116,67,116,108,65,99,116,105,111,110,0,0,0,0,66,70,69,88,84,85,0,0,68,114,97,119,67,111,110,116,114,111,108,115,0,0,0,0,84,114,97,99,107,67,111,110,116,114,111,108,0,0,0,0,68,114,97,103,67,111,110,116,114,111,108,0,0,0,0,0,71,101,116,79,83,69,118,101,110,116,0,0,0,0,0,0,84,101,115,116,67,111,110,116,114,111,108,0,0,0,0,0,83,101,116,77,97,120,67,116,108,0,0,0,0,0,0,0,93,0,0,0,0,0,0,0,83,101,116,32,116,104,101,32,67,80,85,32,115,112,101,101,100,0,0,0,0,0,0,0,83,101,116,77,105,110,67,116,108,0,0,0,0,0,0,0,83,101,116,67,116,108,86,97,108,117,101,0,0,0,0,0,102,105,108,101,0,0,0,0,54,56,48,49,48,0,0,0,71,101,116,77,97,120,67,116,108,0,0,0,0,0,0,0,91,97,100,100,114,46,46,93,0,0,0,0,0,0,0,0,71,101,116,77,105,110,67,116,108,0,0,0,0,0,0,0,71,101,116,67,116,108,86,97,108,117,101,0,0,0,0,0,66,70,67,72,71,0,0,0,83,101,116,67,84,105,116,108,101,0,0,0,0,0,0,0,71,101,116,67,84,105,116,108,101,0,0,0,0,0,0,0,72,105,108,105,116,101,67,111,110,116,114,111,108,0,0,0,79,83,69,118,101,110,116,65,118,97,105,108,0,0,0,0,83,105,122,101,67,111,110,116,114,111,108,0,0,0,0,0,83,101,116,67,82,101,102,67,111,110,0,0,0,0,0,0,82,105,103,104,116,66,114,97,99,107,101,116,0,0,0,0,105,110,116,0,0,0,0,0,71,101,116,67,82,101,102,67,111,110,0,0,0,0,0,0,77,111,118,101,67,111,110,116,114,111,108,0,0,0,0,0,72,105,100,101,67,111,110,116,114,111,108,0,0,0,0,0,100,105,115,107,0,0,0,0,83,104,111,119,67,111,110,116,114,111,108,0,0,0,0,0,75,105,108,108,67,111,110,116,114,111,108,115,0,0,0,0,66,70,69,88,84,83,0,0,68,105,115,112,111,115,67,111,110,116,114,111,108,0,0,0,78,101,119,67,111,110,116,114,111,108,0,0,0,0,0,0,85,112,100,116,67,111,110,116,114,111,108,0,0,0,0,0,80,111,115,116,69,118,101,110,116,0,0,0,0,0,0,0,65,37,117,0,0,0,0,0,68,101,108,77,101,110,117,73,116,101,109,0,0,0,0,0,73,110,115,101,114,116,82,101,115,77,101,110,117,0,0,0,91,0,0,0,0,0,0,0,115,112,101,101,100,0,0,0,67,111,117,110,116,77,73,116,101,109,115,0,0,0,0,0,98,108,111,99,107,95,99,111,117,110,116,0,0,0,0,0,97,100,100,114,61,48,120,37,48,54,108,120,10,0,0,0,68,101,108,116,97,80,111,105,110,116,0,0,0,0,0,0,80,105,110,82,101,99,116,0,109,97,99,46,105,110,115,101,114,116,0,0,0,0,0,0,65,100,100,82,101,115,77,101,110,117,0,0,0,0,0,0,70,108,97,115,104,77,101,110,117,66,97,114,0,0,0,0,66,70,67,76,82,0,0,0,80,108,111,116,73,99,111,110,0,0,0,0,0,0,0,0,83,101,116,77,70,108,97,115,104,0,0,0,0,0,0,0,71,101,116,77,72,97,110,100,108,101,0,0,0,0,0,0,66,108,111,99,107,77,111,118,101,0,0,0,0,0,0,0,67,97,108,99,77,101,110,117,83,105,122,101,0,0,0,0,83,101,116,73,116,101,109,0,76,101,102,116,66,114,97,99])
.concat([107,101,116,0,0,0,0,0,78,101,118,101,114,32,115,116,111,112,32,114,117,110,110,105,110,103,32,91,110,111,93,0,71,101,116,73,116,101,109,0,98,108,111,99,107,95,115,116,97,114,116,0,0,0,0,0,73,87,77,58,0,0,0,0,67,104,101,99,107,73,116,101,109,0,0,0,0,0,0,0,83,101,116,73,116,109,77,97,114,107,0,0,0,0,0,0,32,32,32,32,32,0,0,0,71,101,116,73,116,109,77,97,114,107,0,0,0,0,0,0,105,119,109,58,32,115,97,118,105,110,103,32,100,114,105,118,101,32,37,117,32,102,97,105,108,101,100,32,40,112,114,105,41,10,0,0,0,0,0,0,83,101,116,73,116,109,83,116,121,108,101,0,0,0,0,0,66,70,83,69,84,0,0,0,71,101,116,73,116,109,83,116,121,108,101,0,0,0,0,0,83,101,116,73,116,109,73,99,111,110,0,0,0,0,0,0,71,101,116,73,116,109,73,99,111,110,0,0,0,0,0,0,83,101,116,65,112,112,108,76,105,109,105,116,0,0,0,0,77,101,110,117,75,101,121,0,77,101,110,117,83,101,108,101,99,116,0,0,0,0,0,0,112,0,0,0,0,0,0,0,110,111,45,109,111,110,105,116,111,114,0,0,0,0,0,0,83,101,116,77,101,110,117,66,97,114,0,0,0,0,0,0,100,114,105,118,101,61,37,117,32,118,99,104,115,61,37,108,117,47,37,108,117,47,37,108,117,10,0,0,0,0,0,0,71,101,116,77,101,110,117,66,97,114,0,0,0,0,0,0,105,119,109,0,0,0,0,0,52,0,0,0,0,0,0,0,68,105,115,97,98,108,101,73,116,101,109,0,0,0,0,0,37,48,52,88,32,0,0,0,69,110,97,98,108,101,73,116,101,109,0,0,0,0,0,0,72,105,108,105,116,101,77,101,110,117,0,0,0,0,0,0,36,0,0,0,0,0,0,0,68,114,97,119,77,101,110,117,66,97,114,0,0,0,0,0,68,101,108,101,116,101,77,101,110,117,0,0,0,0,0,0,73,110,115,101,114,116,77,101,110,117,0,0,0,0,0,0,73,110,105,116,65,112,112,108,90,111,110,101,0,0,0,0,67,108,101,97,114,77,101,110,117,66,97,114,0,0,0,0,67,111,110,116,114,111,108,0,65,112,112,101,110,100,77,101,110,117,0,0,0,0,0,0,117,110,107,110,111,119,110,32,67,80,85,32,109,111,100,101,108,32,40,37,115,41,10,0,111,0,0,0,0,0,0,0,83,116,97,114,116,32,114,117,110,110,105,110,103,32,105,109,109,101,100,105,97,116,101,108,121,32,91,110,111,93,0,0,68,105,115,112,111,115,77,101,110,117,0,0,0,0,0,0,118,105,115,105,98,108,101,95,115,0,0,0,0,0,0,0,78,101,119,77,101,110,117,0,105,100,61,37,117,32,100,114,105,118,101,61,37,117,32,118,101,110,100,111,114,61,34,37,115,34,32,112,114,111,100,117,99,116,61,34,37,115,34,10,0,0,0,0,0,0,0,0,117,110,104,97,110,100,108,101,100,32,104,111,111,107,32,40,37,48,52,88,41,10,0,0,73,110,105,116,77,101,110,117,115,0,0,0,0,0,0,0,37,48,56,108,88,32,32,37,115,10,0,0,0,0,0,0,71,101,116,87,105,110,100,111,119,80,105,99,0,0,0,0,115,111,110,121,32,100,114,105,118,101,114,32,97,116,32,48,120,37,48,54,108,120,10,0,83,101,116,87,105,110,100,111,119,80,105,99,0,0,0,0,40,91,37,115,44,32,37,115,44,32,37,115,37,115,93,44,32,37,115,41,0,0,0,0,67,108,111,115,101,87,105,110,100,111,119,0,0,0,0,0,70,105,110,100,87,105,110,100,111,119,0,0,0,0,0,0,71,114,111,119,87,105,110,100,111,119,0,0,0,0,0,0,69,109,112,116,121,72,97,110,100,108,101,0,0,0,0,0,86,97,108,105,100,82,101,99,116,0,0,0,0,0,0,0,86,97,108,105,100,82,103,110,0,0,0,0,0,0,0,0,42,42,42,32,99,111,109,109,105,116,32,101,114,114,111,114,32,102,111,114,32,100,114,105,118,101,32,37,117,10,0,0,115,99,115,105,58,32,117,110,107,110,111,119,110,32,99,111,109,109,97,110,100,32,40,37,48,50,88,41,10,0,0,0,73,110,118,97,108,82,101,99,116,0,0,0,0,0,0,0,73,0,0,0,0,0,0,0,114,117,110,0,0,0,0,0,79,112,101,110,0,0,0,0,118,105,115,105,98,108,101,95,104,0,0,0,0,0,0,0,80,67,69,68,73,83,75,0,73,110,118,97,108,82,103,110,0,0,0,0,0,0,0,0,68,114,97,103,84,104,101,82,103,110,0,0,0,0,0,0,45,0,0,0,0,0,0,0,68,114,97,103,87,105,110,100,111,119,0,0,0,0,0,0,70,114,111,110,116,87,105,110,100,111,119,0,0,0,0,0,40,91,37,115,44,32,37,115,93,44,32,37,115,37,115,44,32,37,115,41,0,0,0,0,69,110,100,85,112,100,97,116,101,0,0,0,0,0,0,0,66,101,103,105,110,85,112,100,97,116,101,0,0,0,0,0,101,109,117,46,100,105,115,107,46,99,111,109,109,105,116,0,101,109,117,46,101,120,105,116,0,0,0,0,0,0,0,0,83,101,110,100,66,101,104,105,110,100,0,0,0,0,0,0,72,85,110,108,111,99,107,0,116,101,114,109,46,115,99,114,101,101,110,115,104,111,116,0,66,114,105,110,103,84,111,70,114,111,110,116,0,0,0,0,70,52,0,0,0,0,0,0,83,101,108,101,99,116,87,105,110,100,111,119,0,0,0,0,99,111,109,109,105,116,0,0,124,0,0,0,0,0,0,0,117,0,0,0,0,0,0,0,83,101,116,32,116,104,101,32,108,111,103,32,108,101,118,101,108,32,116,111,32,101,114,114,111,114,32,91,110,111,93,0,84,114,97,99,107,71,111,65,119,97,121,0,0,0,0,0,118,105,115,105,98,108,101,95,99,0,0,0,0,0,0,0,58,32,0,0,0,0,0,0,112,114,111,100,117,99,116,0,83,105,122,101,87,105,110,100,111,119,0,0,0,0,0,0,108,111,97,100,0,0,0,0,72,105,108,105,116,101,87,105,110,100,111,119,0,0,0,0,37,48,56,108,88,58,32,117,110,100,101,102,105,110,101,100,32,111,112,101,114,97,116,105,111,110,58,32,37,48,52,108,88,32,91,37,48,52,88,32,37,48,52,88,32,37,48,52,88,32,37,48,52,88,32,37,48,52,88,93,10,0,0,0,102,105,108,101,61,37,115,32,102,111,114,109,97,116,61,98,105,110,97,114,121,32,97,100,100,114,61,48,120,37,48,56,108,120,10,0,0,0,0,0,97,115,112,101,99,116,95,120,0,0,0,0,0,0,0,0,115,105,122,101,109,0,0,0,77,111,118,101,87,105,110,100,111,119,0,0,0,0,0,0,100,114,105,118,101,0,0,0,37,115,58,32,117,110,107,110,111,119,110,32,111,112,116,105,111,110,32,40,45,37,99,41,10,0,0,0,0,0,0,0,114,111,109,115,47,112,99,101,45,99,111,110,102,105,103,46,99,102,103,0,0,0,0,0,42,42,42,32,37,115,32,91,37,115,93,10,0,0,0,0,98,58,32,117,110,107,110,111,119,110,32,99,111,109,109,97,110,100,0,0,0,0,0,0,83,101,116,87,84,105,116,108,101,0,0,0,0,0,0,0,102,97,108,115,101,0,0,0,37,115,37,115,37,48,56,88,0,0,0,0,0,0,0,0,115,100,108,0,0,0,0,0,116,100,48,58,32,99,114,99,32,101,114,114,111,114,32,97,116,32,115,101,99,116,111,114,32,37,117,47,37,117,47,37,117,32,40,110,111,32,100,97,116,97,41,10,0,0,0,0,71,101,116,87,84,105,116,108,101,0,0,0,0,0,0,0,83,101,116,87,82,101,102,67,111,110,0,0,0,0,0,0,32,37,48,50,88,0,0,0,46,105,109,100,0,0,0,0,71,101,116,87,82,101,102,67,111,110,0,0,0,0,0,0,72,76,111,99,107,0,0,0,46,112,114,105,0,0,0,0,45,45,0,0,0,0,0,0,120,100,105,118,0,0,0,0,72,105,100,101,87,105,110,100,111,119,0,0,0,0,0,0,112,116,121,0,0,0,0,0,113,101,100,58,32,117,110,107,110,111,119,110,32,102,101,97,116,117,114,101,115,32,40,48,120,37,48,56,108,108,120,41,10,0,0,0,0,0,0,0,100,105,115,107,32,37,117,58,32,119,114,105,116,105,110,103,32,98,97,99,107,32,102,100,99,32,105,109,97,103,101,10,0,0,0,0,0,0,0,0,83,104,111,119,87,105,110,100,111,119,0,0,0,0,0,0,99,111,109,109,105,116,105,110,103,32,100,114,105,118,101,32,37,117,10,0,0,0,0,0,121,0,0,0,0,0,0,0,113,117,105,101,116,0,0,0,68,105,115,112,111,115,87,105,110,100,111,119,0,0,0,0,100,105,115,107,0,0,0,0,80,67,69,0,0,0,0,0,78,101,119,87,105,110,100,111,119,0,0,0,0,0,0,0,73,110,105,116,87,105,110,100,111,119,115,0,0,0,0,0,37,48,56,108,88,58,32,101,120,99,101,112,116,105,111,110,32,37,48,50,88,32,40,37,115,41,32,73,87,61,37,48,52,88,10,0,0,0,0,0,67,104,101,99,107,85,112,100,97,116,101,0,0,0,0,0,71,101,116,87,77,103,114,80,111,114,116,0,0,0,0,0,42,37,117,0,0,0,0,0,68,114,97,119,78,101,119,0,83,97,118,101,79,108,100,0,80,97,105,110,116,66,101,104,105,110,100,0,0,0,0,0,82,101,99,111,118,101,114,72,97,110,100,108,101,0,0,0,80,97,105,110,116,79,110,101,0,0,0,0,0,0,0,0,67,108,105,112,65,98,111,118,101,0,0,0,0,0,0,0,42,42,42,32,99,111,109,109,105,116,32,101,114,114,111,114,58,32,98,97,100,32,100,114,105,118,101,32,40,37,115,41,10,0,0,0,0,0,0,0,116,0,0,0,0,0,0,0,83,101,116,32,116,104,101,32,67,80,85,32,109,111,100,101,108,0,0,0,0,0,0,0,67,97,108,99,86,66,101,104,105,110,100,0,0,0,0,0,42,42,42,32,108,111,97,100,105,110,103,32,100,114,105,118,101,32,48,120,37,48,50,120,32,102,97,105,108,101,100,32,40,99,111,119,41,10,0,0,118,101,110,100,111,114,0,0,67,97,108,99,86,105,115,0,83,104,111,119,72,105,100,101,0,0,0,0,0,0,0,0,49,0,0,0,0,0,0,0,97,100,98,45,107,98,100,58,32,116,97,108,107,32,50,10,0,0,0,0,0,0,0,0,115,114,0,0,0,0,0,0,83,101,116,83,116,114,105,110,103,0,0,0,0,0,0,0,78,101,119,83,116,114,105,110,103,0,0,0,0,0,0,0,37,115,37,117,37,115,0,0,68,114,97,103,71,114,97,121,82,103,110,0,0,0,0,0,68,114,97,119,71,114,111,119,73,99,111,110,0,0,0,0,83,101,116,70,111,110,116,76,111,99,107,0,0,0,0,0,82,101,97,108,108,111,99,72,97,110,100,108,101,0,0,0,82,101,97,108,70,111,110,116,0,0,0,0,0,0,0,0,70,77,83,119,97,112,70,111,110,116,0,0,0,0,0,0,42,42,42,32,99,111,109,109,105,116,32,102,97,105,108,101,100,32,102,111,114,32,97,116,32,108,101,97,115,116,32,111,110,101,32,100,105,115,107,10,0,0,0,0,0,0,0,0,114,0,0,0,0,0,0,0,83,101,116,32,116,104,101,32,108,111,103,32,102,105,108,101,32,110,97,109,101,32,91,110,111,110,101,93,0,0,0,0,71,101,116,70,78,117,109,0,100,114,105,118,101,0,0,0,71,101,116,70,78,97,109,101,0,0,0,0,0,0,0,0,73,110,105,116,70,111,110,116,115,0,0,0,0,0,0,0,54,56,48,48,48,0,0,0,116,101,114,109,46,114,101,108,101,97,115,101,0,0,0,0,80,114,71,108,117,101,0,0,77,97,112,80,111,108,121,0,80,67,0,0,0,0,0,0,77,97,112,82,103,110,0,0,77,97,112,82,101,99,116,0,77,97,112,80,116,0,0,0,72,97,110,100,108,101,90,111,110,101,0,0,0,0,0,0,83,99,97,108,101,80,116,0,76,97,121,111,117,116,0,0,99,111,109,109,105,116,105,110,103,32,97,108,108,32,100,114,105,118,101,115,10,0,0,0,101,0,0,0,0,0,0,0,108,111,103,0,0,0,0,0,68,114,97,119,80,105,99,116,117,114,101,0,0,0,0,0,114,119,0,0,0,0,0,0,98,0,0,0,0,0,0,0,105,100,0,0,0,0,0,0,75,105,108,108,80,105,99,116,117,114,101,0,0,0,0,0,67,108,111,115,101,80,105,99,116,117,114,101,0,0,0,0,103,98,0,0,0,0,0,0,79,112,101,110,80,105,99,116,117,114,101,0,0,0,0,0,80,105,99,67,111,109,109,101,110,116,0,0,0,0,0,0,60,69,65,62,40,37,48,50,88,41,0,0,0,0,0,0,83,116,100,67,111,109,109,101,110,116,0,0,0,0,0,0,83,79,78,89,58,0,0,0,83,116,100,80,117,116,80,105,99,0,0,0,0,0,0,0,83,99,114,111,108,108,82,101,99,116,0,0,0,0,0,0,71,101,116,72,97,110,100,108,101,83,105,122,101,0,0,0,68,37,117,0,0,0,0,0,83,116,100,71,101,116,80,105,99,0,0,0,0,0,0,0,83,116,100,84,120,77,101,97,115,0,0,0,0,0,0,0,97,108,108,0,0,0,0,0,119,0,0,0,0,0,0,0,65,100,100,32,97,110,32,105,110,105,32,115,116,114,105,110,103,32,97,102,116,101,114,32,116,104,101,32,99,111,110,102,105,103,32,102,105,108,101,0,67,111,112,121,66,105,116,115,0,0,0,0,0,0,0,0,114,111,0,0,0,0,0,0,100,101,118,105,99,101,0,0,83,116,100,66,105,116,115,0,83,101,116,83,116,100,80,114,111,99,115,0,0,0,0,0,101,109,117,46,115,116,111,112,0,0,0,0,0,0,0,0,82,101,99,116,73,110,82,103,110,0,0,0,0,0,0,0,80,116,73,110,82,103,110,0,37,115,37,115,37,48,50,88,40,80,67,44,32,37,115,37,117,37,115,42,37,117,41,0,88,111,114,82,103,110,0,0,68,105,102,102,82,103,110,0,85,110,105,111,110,82,103,110,0,0,0,0,0,0,0,0,83,101,116,72,97,110,100,108,101,83,105,122,101,0,0,0,83,101,99,116,82,103,110,0,115,116,100,105,111,58,102,105,108,101,61,0,0,0,0,0,69,113,117,97,108,82,103,110,0,0,0,0,0,0,0,0,101,106,101,99,116,105,110,103,32,100,114,105,118,101,32,37,108,117,10,0,0,0,0,0,113,0,0,0,0,0,0,0,105,110,105,45,97,112,112,101,110,100,0,0,0,0,0,0,69,109,112,116,121,82,103,110,0,0,0,0,0,0,0,0,100,114,105,118,101,61,37,117,32,116,121,112,101,61,37,115,32,98,108,111,99,107,115,61,37,108,117,32,99,104,115,61,37,108,117,47,37,108,117,47,37,108,117,32,37,115,32,102,105,108,101,61,37,115,10,0,97,100,100,114,61,48,120,37,48,54,108,120,32,115,105,122,101,61,48,120,37,108,120,10,0,0,0,0,0,0,0,0,73,110,115,101,116,82,103,110,0,0,0,0,0,0,0,0,79,102,115,101,116,82,103,110,0,0,0,0,0,0,0,0,101,109,95,115,116,101,112,95,116,105,109,101,95,109,97,120,95,117,115,101,99,32,37,100,10,0,0,0,0,0,0,0,82,101,99,116,82,103,110,0,83,101,116,82,101,99,82,103,110,0,0,0,0,0,0,0,105,119,109,58,32,115,97,118,105,110,103,32,100,114,105,118,101,32,37,117,10,0,0,0,37,115,37,48,56,108,88,40,80,67,41,0,0,0,0,0,83,101,116,69,109,112,116,121,82,103,110,0,0,0,0,0,67,111,112,121,82,103,110,0,67,108,111,115,101,82,103,110,0,0,0,0,0,0,0,0,68,105,115,112,111,115,72,97,110,100,108,101,0,0,0,0,79,112,101,110,82,103,110,0,68,105,115,112,111,115,82,103,110,0,0,0,0,0,0,0,42,42,42,32,100,105,115,107,32,101,106,101,99,116,32,101,114,114,111,114,58,32,110,111,32,115,117,99,104,32,100,105,115,107,32,40,37,108,117,41,10,0,0,0,0,0,0,0,84,97,98,0,0,0,0,0,65,100,100,32,97,110,32,105,110,105,32,115,116,114,105,110,103,32,98,101,102,111,114,101,32,116,104,101,32,99,111,110,102,105,103,32,102,105,108,101,0,0,0,0,0,0,0,0,78,101,119,82,103,110,0,0,42,42,42,32,108,111,97,100,105,110,103,32,100,114,105,118,101,32,48,120,37,48,50,120,32,102,97,105,108,101,100,10,0,0,0,0,0,0,0,0,83,67,83,73,58,0,0,0,66,105,116,77,97,112,84,111,82,101,103,105,111,110,0,0,70,105,108,108,82,103,110,0,51,0,0,0,0,0,0,0,117,110,107,110,111,119,110,32,99,111,109,112,111,110,101,110,116,32,40,37,115,41,10,0,73,110,118,101,114,82,103,110,0,0,0,0,0,0,0,0,69,114,97,115,101,82,103,110,0,0,0,0,0,0,0,0,37,115,37,115,37,48,52,88,0,0,0,0,0,0,0,0,80,97,105,110,116,82,103,110,0,0,0,0,0,0,0,0,70,114,97,109,101,82,103,110,0,0,0,0,0,0,0,0,83,116,100,82,103,110,0,0,78,101,119,72,97,110,100,108,101,0,0,0,0,0,0,0,85,110,112,97,99,107,66,105,116,115,0,0,0,0,0,0,87,114,105,116,101,0,0,0,80,97,99,107,66,105,116,115,0,0,0,0,0,0,0,0,42,42,42,32,100,105,115,107,32,101,106,101,99,116,32,101,114,114,111,114,58,32,98,97,100,32,100,114,105,118,101,32,40,37,115,41,10,0,0,0,66,97,99,107,115,112,97,99,101,0,0,0,0,0,0,0,105,110,105,45,112,114,101,102,105,120,0,0,0,0,0,0,79,102,102,115,101,116,80,111,108,121,0,0,0,0,0,0,116,101,108,101,100,105,115,107,0,0,0,0,0,0,0,0,115,105,122,101,0,0,0,0,75,105,108,108,80,111,108,121,0,0,0,0,0,0,0,0,67,108,111,115,101,80,103,111,110,0,0,0,0,0,0,0,109,97,114,107,58,32,80,67,61,37,48,54,108,88,10,0,118,105,97,0,0,0,0,0,79,112,101,110,80,111,108,121,0,0,0,0,0,0,0,0,115,111,110,121,32,100,114,105,118,101,114,32,110,111,116,32,102,111,117,110,100,10,0,0,70,105,108,108,80,111,108,121,0,0,0,0,0,0,0,0,46,87,0,0,0,0,0,0,73,110,118,101,114,116,80,111,108,121,0,0,0,0,0,0,69,114,97,115,101,80,111,108,121,0,0,0,0,0,0,0,80,97,105,110,116,80,111,108,121,0,0,0,0,0,0,0,71,101,116,80,116,114,83,105,122,101,0,0,0,0,0,0,70,114,97,109,101,80,111,108,121,0,0,0,0,0,0,0,83,116,100,80,111,108,121,0,115,101,116,116,105,110,103,32,114,101,97,100,111,110,108,121,32,100,114,105,118,101,32,37,108,117,10,0,0,0,0,0,115,99,115,105,58,32,115,101,116,32,32,56,58,32,37,48,52,108,88,32,60,45,32,37,48,50,88,10,0,0,0,0,61,0,0,0,0,0,0,0,65,100,100,32,97,32,100,105,114,101,99,116,111,114,121,32,116,111,32,116,104,101,32,115,101,97,114,99,104,32,112,97,116,104,0,0,0,0,0,0,65,110,103,108,101,70,114,111,109,83,108,111,112,101,0,0,112,115,105,0,0,0,0,0,115,99,115,105,0,0,0,0,80,116,84,111,65,110,103,108,101,0,0,0,0,0,0,0,70,105,108,108,65,114,99,0,115,99,99,0,0,0,0,0,73,110,118,101,114,116,65,114,99,0,0,0,0,0,0,0,69,114,97,115,101,65,114,99,0,0,0,0,0,0,0,0,46,76,0,0,0,0,0,0,80,97,105,110,116,65,114,99,0,0,0,0,0,0,0,0,70,114,97,109,101,65,114,99,0,0,0,0,0,0,0,0,101,109,117,46,99,112,117,46,115,112,101,101,100,46,115,116,101,112,0,0,0,0,0,0,107,101,121,109,97,112,0,0,83,116,100,65,114,99,0,0,83,101,116,80,116,114,83,105,122,101,0,0,0,0,0,0,116,101,114,109,46,101,115,99,97,112,101,0,0,0,0,0,83,108,111,112,101,70,114,111,109,65,110,103,108,101,0,0,70,51,0,0,0,0,0,0,70,105,108,108,79,118,97,108,0,0,0,0,0,0,0,0,115,101,116,116,105,110,103,32,114,101,97,100,47,119,114,105,116,101,32,100,114,105,118,101,32,37,108,117,10,0,0,0,38,38,0,0,0,0,0,0,69,113,117,97,108,0,0,0,112,97,116,104,0,0,0,0,73,110,118,101,114,116,79,118,97,108,0,0,0,0,0,0,112,102,100,99,45,97,117,116,111,0,0,0,0,0,0,0,37,115,58,37,108,117,58,32,37,115,0,0,0,0,0,0,100,114,105,118,101,61,37,117,32,100,101,108,97,121,61,37,108,117,10,0,0,0,0,0,69,114,97,115,101,79,118,97,108,0,0,0,0,0,0,0,80,97,105,110,116,79,118,97,108,0,0,0,0,0,0,0,109,101,109,0,0,0,0,0,102,105,108,101,61,37,115,32,102,111,114,109,97,116,61,115,114,101,99,10,0,0,0,0,101,115,99,97,112,101,0,0,98,97,115,101,0,0,0,0,70,114,97,109,101,79,118,97,108,0,0,0,0,0,0,0,100,114,105,118,101,61,37,117,32,116,121,112,101,61,99,111,119,32,102,105,108,101,61,37,115,10,0,0,0,0,0,0,37,115,58,32,109,105,115,115,105,110,103,32,111,112,116,105,111,110,32,97,114,103,117,109,101,110,116,32,40,37,115,41,10,0,0,0,0,0,0,0,91,37,48,54,108,88,93,32,0,0,0,0,0,0,0,0,99,0,0,0,0,0,0,0,83,116,100,79,118,97,108,0,48,0,0,0,0,0,0,0,37,115,37,115,37,48,50,88,40,65,37,117,44,32,37,115,37,117,37,115,42,37,117,41,0,0,0,0,0,0,0,0,119,97,118,0,0,0,0,0,116,100,48,58,32,116,114,97,99,107,32,99,114,99,32,40,37,48,50,88,32,37,48,52,88,41,10,0,0,0,0,0,83,99,114,105,112,116,85,116,105,108,0,0,0,0,0,0,115,116,120,58,32,114,101,97,100,32,101,114,114,111,114,32,40,115,101,99,116,111,114,32,104,101,97,100,101,114,41,10,0,0,0,0,0,0,0,0,112,115,105,58,32,117,110,107,110,111,119,110,32,118,101,114,115,105,111,110,32,40,37,108,117,41,10,0,0,0,0,0,100,99,52,50,58,32,116,97,103,32,99,104,101,99,107,115,117,109,32,101,114,114,111,114,10,0,0,0,0,0,0,0,70,105,108,108,82,111,117,110,100,82,101,99,116,0,0,0,46,105,109,97,0,0,0,0,73,110,118,101,114,82,111,117,110,100,82,101,99,116,0,0,46,112,98,105,116,0,0,0,68,105,115,112,111,115,80,116,114,0,0,0,0,0,0,0,119,98,0,0,0,0,0,0,45,0,0,0,0,0,0,0,120,109,117,108,0,0,0,0,69,114,97,115,101,82,111,117,110,100,82,101,99,116,0,0,115,101,114,99,111,110,0,0,99,111,109,109,105,116,0,0,99,111,109,109,105,116,0,0,99,111,109,109,105,116,0,0,80,97,105,110,116,82,111,117,110,100,82,101,99,116,0,0,115,101,116,116,105,110,103,32,105,119,109,32,100,114,105,118,101,32,37,108,117,32,116,111,32,114,101,97,100,45,111,110,108,121,10,0,0,0,0,0,45,0,0,0,0,0,0,0,48,98,0,0,0,0,0,0,83,101,116,32,116,104,101,32,99,111,110,102,105,103,32,102,105,108,101,32,110,97,109,101,32,91,110,111,110,101,93,0,70,114,97,109,101,82,111,117,110,100,82,101,99,116,0,0,112,102,100,99,0,0,0,0,83,79,78,89,58,0,0,0,83,116,100,82,82,101,99,116,0,0,0,0,0,0,0,0,69,109,112,116,121,82,101,99,116,0,0,0,0,0,0,0,99,112,117,0,0,0,0,0,80,116,73,110,82,101,99,116,0,0,0,0,0,0,0,0,80,116,50,82,101,99,116,0,40,65,37,117,41,0,0,0,85,110,105,111,110,82,101,99,116,0,0,0,0,0,0,0,83,101,99,116,82,101,99,116,0,0,0,0,0,0,0,0,73,110,115,101,116,82,101,99,116,0,0,0,0,0,0,0,78,101,119,80,116,114,0,0,79,102,102,115,101,116,82,101,99,116,0,0,0,0,0,0,83,101,116,82,101,99,116,0,115,101,116,116,105,110,103,32,97,108,108,32,105,119,109,32,100,114,105,118,101,115,32,116,111,32,114,101,97,100,45,111,110,108,121,10,0,0,0,0,69,113,117,97,108,82,101,99,116,0,0,0,0,0,0,0,77,105,110,117,115,0,0,0,48,120,0,0,0,0,0,0,115,116,114,105,110,103,0,0,114,98,0,0,0,0,0,0,105,109,100,0,0,0,0,0,105,110,115,101,114,116,95,100,101,108,97,121,95,37,117,0,70,105,108,108,82,101,99,116,0,0,0,0,0,0,0,0,73,110,118,101,114,82,101,99,116,0,0,0,0,0,0,0,100,105,115,97,115,115,101,109,98,108,101,0,0,0,0,0,97,100,98,45,107,98,100,58,32,116,97,108,107,32,37,117,10,0,0,0,0,0,0,0,108,112,99,0,0,0,0,0,69,114,97,115,101,82,101,99,116,0,0,0,0,0,0,0,80,97,105,110,116,82,101,99,116,0,0,0,0,0,0,0,37,115,37,117,47,37,115,37,117,0,0,0,0,0,0,0,70,114,97,109,101,82,101,99,116,0,0,0,0,0,0,0,83,116,100,82,101,99,116,0,85,110,105,109,112,108,101,109,101,110,116,101,100,0,0,0,77,97,120,77,101,109,0,0,80,101,110,78,111,114,109,97,108,0,0,0,0,0,0,0,80,101,110,80,97,116,0,0,115,101,116,116,105,110,103,32,105,119,109,32,100,114,105,118,101,32,37,108,117,32,116,111,32,114,101,97,100,47,119,114,105,116,101,10,0,0,0,0,48,0,0,0,0,0,0,0,102,97,108,115,101,0,0,0,99,111,110,102,105,103,0,0,80,101,110,77,111,100,101,0,105,109,97,103,101,100,105,115,107,0,0,0,0,0,0,0,102,111,114,109,97,116,95,104,100,95,97,115,95,100,100,0,80,101,110,83,105,122,101,0,71,101,116,80,101,110,0,0,91,91,45,93,97,100,100,114,32,91,99,110,116,93,93,0,83,101,116,80,101,110,83,116,97,116,101,0,0,0,0,0,71,101,116,80,101,110,83,116,97,116,101,0,0,0,0,0,37,115,37,117,45,37,115,37,117,0,0,0,0,0,0,0,83,104,111,119,80,101,110,0,72,105,100,101,80,101,110,0,83,104,117,116,100,111,119,110,0,0,0,0,0,0,0,0,70,114,101,101,77,101,109,0,77,111,118,101,0,0,0,0,107,98,100,58,32,117,110,107,110,111,119,110,32,99,111,109,109,97,110,100,32,40,37,48,50,88,41,10,0,0,0,0,77,111,118,101,84,111,0,0,115,101,116,116,105,110,103,32,97,108,108,32,105,119,109,32,100,114,105,118,101,115,32,116,111,32,114,101,97,100,47,119,114,105,116,101,10,0,0,0,57,0,0,0,0,0,0,0,116,114,117,101,0,0,0,0,83,101,116,32,116,104,101,32,100,105,115,107,32,100,101,108,97,121,32,91,51,48,93,0,76,105,110,101,0,0,0,0,100,99,52,50,0,0,0,0,105,110,115,101,114,116,95,100,101,108,97,121,0,0,0,0,76,105,110,101,84,111,0,0,83,116,100,76,105,110,101,0,117,0,0,0,0,0,0,0,79,83,68,105,115,112,97,116,99,104,0,0,0,0,0,0,83,112,97,99,101,69,120,116,114,97,0,0,0,0,0,0,67,104,97,114,87,105,100,116,104,0,0,0,0,0,0,0,83,116,114,105,110,103,87,105,100,116,104,0,0,0,0,0,71,101,116,70,111,110,116,73,110,102,111,0,0,0,0,0,83,101,116,90,111,110,101,0,35,37,115,37,48,52,88,0,84,101,120,116,83,105,122,101,0,0,0,0,0,0,0,0,84,101,120,116,77,111,100,101,0,0,0,0,0,0,0,0,73,87,77,32,100,114,105,118,101,32,37,117,58,32,108,111,99,107,101,100,61,37,100,10,0,0,0,0,0,0,0,0,56,0,0,0,0,0,0,0,100,101,102,105,110,101,100,0,100,114,105,118,101,32,100,101,108,97,121,0,0,0,0,0,84,101,120,116,70,97,99,101,0,0,0,0,0,0,0,0,99,112,50,0,0,0,0,0,101,120,101,99,117,116,101,32,99,110,116,32,105,110,115,116,114,117,99,116,105,111,110,115,32,91,49,93,0,0,0,0,115,111,110,121,0,0,0,0,84,101,120,116,70,111,110,116,0,0,0,0,0,0,0,0,79,82,73,46,66,0,0,0,84,101,120,116,87,105,100,116,104,0,0,0,0,0,0,0,99,108,111,99,107,0,0,0,79,82,73,46,87,0,0,0,68,114,97,119,84,101,120,116,0,0,0,0,0,0,0,0,79,82,73,46,76,0,0,0,68,114,97,119,83,116,114,105,110,103,0,0,0,0,0,0,67,77,80,50,46,66,0,0,67,82,40,37,117,41,0,0,68,114,97,119,67,104,97,114,0,0,0,0,0,0,0,0,67,72,75,50,46,66,0,0,83,116,100,84,101,120,116,0,69,113,117,97,108,80,116,0,71,101,116,90,111,110,101,0,83,101,116,80,116,0,0,0,65,78,68,73,46,66,0,0,83,117,98,80,116,0,0,0,65,78,68,73,46,87,0,0,32,9,0,0,0,0,0,0,43,49,0,0,0,0,0,0,55,0,0,0,0,0,0,0,41,0,0,0,0,0,0,0,100,105,115,107,45,100,101,108,97,121,0,0,0,0,0,0,65,100,100,80,116,0,0,0,65,78,68,73,46,76,0,0,97,110,97,100,105,115,107,0,10,0,0,0,0,0,0,0,42,42,42,32,115,101,116,116,105,110,103,32,115,111,117,110,100,32,100,114,105,118,101,114,32,102,97,105,108,101,100,32,40,37,115,41,10,0,0,0,67,108,111,115,101,67,80,111,114,116,0,0,0,0,0,0,67,77,80,50,46,87,0,0,67,108,111,115,101,80,111,114,116,0,0,0,0,0,0,0,116,0,0,0,0,0,0,0,67,72,75,50,46,87,0,0,66,97,99,107,80,97,116,0,83,85,66,73,46,66,0,0,67,108,105,112,82,101,99,116,0,0,0,0,0,0,0,0,83,85,66,73,46,87,0,0,86,66,82,0,0,0,0,0,71,101,116,67,108,105,112,0,105,119,109,58,32,108,111,97,100,105,110,103,32,100,114,105,118,101,32,37,117,32,102,97,105,108,101,100,10,0,0,0,83,85,66,73,46,76,0,0,83,101,116,67,108,105,112,0,67,77,80,50,46,76,0,0,83,101,116,79,114,105,103,105,110,0,0,0,0,0,0,0,67,72,75,50,46,76,0,0,73,110,105,116,90,111,110,101,0,0,0,0,0,0,0,0,77,111,118,101,80,111,114,116,84,111,0,0,0,0,0,0,65,68,68,73,46,66,0,0,80,111,114,116,83,105,122,101,0,0,0,0,0,0,0,0,65,68,68,73,46,87,0,0,58,0,0,0,0,0,0,0,45,49,0,0,0,0,0,0,54,0,0,0,0,0,0,0,40,0,0,0,0,0,0,0,83,101,116,32,116,104,101,32,100,105,115,107,32,100,101,108,97,121,32,102,111,114,32,100,114,105,118,101,32,49,32,91,51,48,93,0,0,0,0,0,83,101,116,80,66,105,116,115,0,0,0,0,0,0,0,0,65,68,68,73,46,76,0,0,112,97,114,116,105,116,105,111,110,0,0,0,0,0,0,0,32,32,0,0,0,0,0,0,102,117,108,108,115,99,114,101,101,110,0,0,0,0,0,0,60,110,111,110,101,62,0,0,71,101,116,80,111,114,116,0,66,84,83,84,0,0,0,0,83,101,116,80,111,114,116,0,112,114,105,110,116,32,115,116,97,116,117,115,32,40,99,112,117,124,109,101,109,124,115,99,99,124,118,105,97,41,0,0,66,67,72,71,0,0,0,0,71,114,97,102,68,101,118,105,99,101,0,0,0,0,0,0,50,0,0,0,0,0,0,0,66,67,76,82,0,0,0,0,71,108,111,98,97,108,84,111,76,111,99,97,108,0,0,0,66,83,69,84,0,0,0,0,68,70,67,0,0,0,0,0,76,111,99,97,108,84,111,71,108,111,98,97,108,0,0,0,69,79,82,73,46,66,0,0,79,112,101,110,80,111,114,116,0,0,0,0,0,0,0,0,69,79,82,73,46,87,0,0,112,99,101,37,48,52,117,46,112,112,109,0,0,0,0,0,73,110,105,116,71,114,97,102,0,0,0,0,0,0,0,0,69,79,82,73,46,76,0,0,71,101,116,70,80,111,115,0,73,110,105,116,80,111,114,116,0,0,0,0,0,0,0,0,67,77,80,73,46,66,0,0,82,101,97,100,0,0,0,0,70,105,120,82,111,117,110,100,0,0,0,0,0,0,0,0,67,77,80,73,46,87,0,0,49,0,0,0,0,0,0,0,101,109,117,46,99,112,117,46,115,112,101,101,100,46,115,116,101,112,0,0,0,0,0,0,53,0,0,0,0,0,0,0,100,101,108,97,121,0,0,0,76,111,87,111,114,100,0,0,67,77,80,73,46,76,0,0,113,101,100,0,0,0,0,0,32,32,32,0,0,0,0,0,97,100,100,114,61,48,120,37,48,54,108,88,32,108,111,119,112,97,115,115,61,37,108,117,32,100,114,105,118,101,114,61,37,115,10,0,0,0,0,0,72,105,87,111,114,100,0,0,77,79,86,83,46,66,0,0,70,105,120,82,97,116,105,111,0,0,0,0,0,0,0,0,91,119,104,97,116,93,0,0,77,79,86,83,46,87,0,0,70,105,120,77,117,108,0,0,101,109,117,46,101,120,105,116,0,0,0,0,0,0,0,0,77,79,86,83,46,76,0,0,76,111,110,103,77,117,108,0,80,67,69,32,82,79,77,32,101,120,116,101,110,115,105,111,110,32,97,116,32,48,120,37,48,54,108,120,10,0,0,0,83,70,67,0,0,0,0,0,83,116,117,102,102,72,101,120,0,0,0,0,0,0,0,0,77,79,86,69,46,66,0,0,71,101,116,80,105,120,101,108,0,0,0,0,0,0,0,0,77,79,86,69,46,76,0,0,67,111,108,111,114,66,105,116,0,0,0,0,0,0,0,0,69,106,101,99,116,0,0,0,66,97,99,107,67,111,108,111,114,0,0,0,0,0,0,0,70,111,114,101,67,111,108,111,114,0,0,0,0,0,0,0,78,69,71,88,46,66,0,0,116,101,114,109,46,114,101,108,101,97,115,101,0,0,0,0,115,99,115,105,58,32,103,101,116,32,32,56,58,32,37,48,52,108,88,32,45,62,32,37,48,50,88,10,0,0,0,0,101,109,117,46,114,101,115,101,116,0,0,0,0,0,0,0,52,0,0,0,0,0,0,0,33,0,0,0,0,0,0,0,100,105,115,107,45,100,101,108,97,121,45,49,0,0,0,0,82,97,110,100,111,109,0,0,78,69,71,88,46,87,0,0,112,99,101,0,0,0,0,0,32,37,48,50,88,0,0,0,83,79,85,78,68,58,0,0,119,97,114,110,105,110,103,58,32,100,101,108,97,121,32,61,61,32,48,32,97,116,32,37,48,56,108,120,10,0,0,0,87,97,105,116,78,101,120,116,69,118,101,110,116,0,0,0,78,69,71,88,46,76,0,0,69,83,67,0,0,0,0,0,114,98,0,0,0,0,0,0,66,105,116,67,108,114,0,0,115,0,0,0,0,0,0,0,114,98,0,0,0,0,0,0,114,43,98,0,0,0,0,0,66,105,116,83,101,116,0,0,66,105,116,84,115,116,0,0,67,76,82,46,66,0,0,0,66,105,116,83,104,105,102,116,0,0,0,0,0,0,0,0,67,76,82,46,87,0,0,0,66,105,116,79,114,0,0,0,67,76,82,46,76,0,0,0,63,0,0,0,0,0,0,0,101,109,117,46,99,112,117,46,115,112,101,101,100,0,0,0,114,101,112,111,114,116,95,107,101,121,115,0,0,0,0,0,66,105,116,78,111,116,0,0,78,69,71,46,66,0,0,0,80,54,10,37,117,32,37,117,10,37,117,10,0,0,0,0,73,110,105,116,81,117,101,117,101,0,0,0,0,0,0,0,66,105,116,88,111,114,0,0,78,69,71,46,87,0,0,0,70,50,0,0,0,0,0,0,66,105,116,65,110,100,0,0,78,69,71,46,76,0,0,0,99,111,109,109,105,116,0,0,109,97,99,46,105,110,115,101,114,116,0,0,0,0,0,0,124,124,0,0,0,0,0,0,101,109,117,46,112,97,117,115,101,46,116,111,103,103,108,101,0,0,0,0,0,0,0,0,51,0,0,0,0,0,0,0,126,0,0,0,0,0,0,0,80,114,105,110,116,32,117,115,97,103,101,32,105,110,102,111,114,109,97,116,105,111,110,0,79,98,115,99,117,114,101,67,117,114,115,111,114,0,0,0,42,42,42,32,110,111,32,116,101,114,109,105,110,97,108,32,102,111,117,110,100,10,0,0,78,79,84,46,66,0,0,0,100,111,115,101,109,117,0,0,60,110,111,110,101,62,0,0,60,45,0,0,0,0,0,0,32,9,0,0,0,0,0,0,100,114,105,118,101,114,0,0,73,78,84,82,0,0,0,0,83,104,105,101,108,100,67,117,114,115,111,114,0,0,0,0,78,79,84,46,87,0,0,0,37,45,57,115,32,0,0,0,70,111,110,116,68,105,115,112,97,116,99,104,0,0,0,0,103,101,116,32,111,114,32,115,101,116,32,97,32,114,101,103,105,115,116,101,114,0,0,0,78,79,84,46,76,0,0,0,102,105,108,101,61,37,115,32,102,111,114,109,97,116,61,105,104,101,120,10,0,0,0,0,110,117,108,108,0,0,0,0,97,100,100,114,101,115,115,0,83,104,111,119,67,117,114,115,111,114,0,0,0,0,0,0,77,79,86,69,46,87,0,0,42,42,42,32,99,111,119,32,102,97,105,108,101,100,32,40,100,114,105,118,101,61,37,117,32,102,105,108,101,61,37,115,41,10,0,0,0,0,0,0,37,115,58,32,117,110,107,110,111,119,110,32,111,112,116,105,111,110,32,40,37,115,41,10,0,0,0,0,0,0,0,0,112,99,101,45,109,97,99,112,108,117,115,58,32,115,105,103,110,97,108,32,37,100,10,0,115,0,0,0,0,0,0,0,72,105,100,101,67,117,114,115,111,114,0,0,0,0,0,0,78,66,67,68,46,66,0,0,114,0,0,0,0,0,0,0,121,101,115,0,0,0,0,0,37,117,0,0,0,0,0,0,110,117,108,108,0,0,0,0,116,100,48,58,32,104,101,97,100,101,114,32,99,114,99,32,40,37,48,52,88,32,37,48,52,88,41,10,0,0,0,0,83,101,116,67,117,114,115,111,114,0,0,0,0,0,0,0,109,102,109,0,0,0,0,0,115,116,120,58,32,114,101,97,100,32,101,114,114,111,114,32,40,116,114,97,99,107,32,104,101,97,100,101,114,41,10,0,112,115,105,58,32,111,114,112,104,97,110,101,100,32,97,108,116,101,114,110,97,116,101,32,115,101,99,116,111,114,10,0,112,102,100,99,58,32,117,110,107,110,111,119,110,32,118,101,114,115,105,111,110,32,40,37,108,117,41,10,0,0,0,0,100,99,52,50,58,32,100,97,116,97,32,99,104,101,99,107,115,117,109,32,101,114,114,111,114,10,0,0,0,0,0,0,73,110,105,116,67,117,114,115,111,114,0,0,0,0,0,0,32,45,0,0,0,0,0,0,83,87,65,80,0,0,0,0,112,97,114,115,101,32,101,114,114,111,114,32,98,101,102,111,114,101,0,0,0,0,0,0,46,105,109,97,103,101,0,0,112,114,105,58,32,117,110,107,110,111,119,110,32,118,101,114,115,105,111,110,32,110,117,109,98,101,114,32,40,37,117,41,10,0,0,0,0,0,0,0,83,101,116,73,116,101,109,67,109,100,0,0,0,0,0,0,112,114,105,58,32,117,110,107,110,111,119,110,32,118,101,114,115,105,111,110,32,110,117,109,98,101,114,32,40,37,108,117,41,10,0,0,0,0,0,0,69,88,84,46,87,0,0,0,45,0,0,0,0,0,0,0,99,104,97,114,45,112,116,121,58,32,37,115,10,0,0,0,83,101,116,86,111,108,0,0,119,114,105,116,101,0,0,0,109,115,121,115,0,0,0,0,71,101,116,73,116,101,109,67,109,100,0,0,0,0,0,0,69,88,84,46,76,0,0,0,112,111,115,105,120,0,0,0,119,98,0,0,0,0,0,0,114,43,98,0,0,0,0,0,114,0,0,0,0,0,0,0,70,105,120,68,105,118,0,0,69,88,84,66,46,76,0,0,101,109,117,46,118,105,100,101,111,46,98,114,105,103,104,116,110,101,115,115,0,0,0,0,101,109,117,46,115,116,111,112,0,0,0,0,0,0,0,0,50,0,0,0,0,0,0,0,37,0,0,0,0,0,0,0,104,101,108,112,0,0,0,0,85,115,101,114,68,101,108,97,121,0,0,0,0,0,0,0,42,42,42,32,117,110,107,110,111,119,110,32,116,101,114,109,105,110,97,108,32,100,114,105,118,101,114,58,32,37,115,10,0,0,0,0,0,0,0,0,84,83,84,46,66,0,0,0,105,109,97,103,101,0,0,0,116,114,117,101,0,0,0,0,45,62,0,0,0,0,0,0,108,111,119,112,97,115,115,0,84,82,65,80,0,0,0,0,70,114,97,99,68,105,118,0,84,83,84,46,87,0,0,0,70,114,97,99,77,117,108,0,114,101,103,32,91,118,97,108,93,0,0,0,0,0,0,0,84,83,84,46,76,0,0,0,70,114,97,99,83,113,114,116,0,0,0,0,0,0,0,0,70,114,97,99,83,105,110,0,68,37,117,58,68,37,117,0,70,114,97,99,67,111,115,0,77,85,76,85,46,76,0,0,88,50,70,114,97,99,0,0,68,73,86,85,46,76,0,0,70,114,97,99,50,88,0,0,71,101,116,86,111,108,0,0,88,50,70,105,120,0,0,0,70,105,120,50,88,0,0,0,101,109,117,46,115,116,111,112,0,0,0,0,0,0,0,0,116,101,114,109,46,103,114,97,98,0,0,0,0,0,0,0,49,0,0,0,0,0,0,0,47,0,0,0,0,0,0,0,117,115,97,103,101,58,32,112,99,101,45,109,97,99,112,108,117,115,32,91,111,112,116,105,111,110,115,93,0,0,0,0,70,114,97,99,50,70,105,120,0,0,0,0,0,0,0,0,42,42,42,32,115,101,116,116,105,110,103,32,117,112,32,110,117,108,108,32,116,101,114,109,105,110,97,108,32,102,97,105,108,101,100,10,0,0,0,0,77,79,86,69,0,0,0,0,114,97,109,0,0,0,0,0,37,115,32,37,48,50,88,0,115,111,117,110,100,0,0,0,65,86,69,67,0,0,0,0,70,105,120,50,70,114,97,99,0,0,0,0,0,0,0,0,85,78,76,75,0,0,0,0,97,0,0,0,0,0,0,0,70,105,120,50,76,111,110,103,0,0,0,0,0,0,0,0,114,0,0,0,0,0,0,0,97,100,98,45,107,98,100,58,32,108,105,115,116,101,110,32,37,117,10,0,0,0,0,0,76,73,78,75,0,0,0,0,112,99,0,0,0,0,0,0,76,111,110,103,50,70,105,120,0,0,0,0,0,0,0,0,84,82,65,80,0,0,0,0,114,98,0,0,0,0,0,0,84,69,83,116,121,108,101,78,101,119,0,0,0,0,0,0,77,79,86,69,67,0,0,0,85,83,80,0,0,0,0,0,84,69,68,105,115,112,97,116,99,104,0,0,0,0,0,0,84,69,71,101,116,79,102,102,115,101,116,0,0,0,0,0,84,82,65,80,86,0,0,0,116,101,114,109,105,110,97,108,0,0,0,0,0,0,0,0,84,114,97,99,107,66,111,120,0,0,0,0,0,0,0,0,70,108,117,115,104,86,111,108,0,0,0,0,0,0,0,0,90,111,111,109,87,105,110,100,111,119,0,0,0,0,0,0,114,97,109,0,0,0,0,0,83,101,101,100,70,105,108,108,0,0,0,0,0,0,0,0])
.concat([101,109,117,46,115,101,114,112,111,114,116,46,102,105,108,101,0,0,0,0,0,0,0,0,116,101,114,109,46,102,117,108,108,115,99,114,101,101,110,46,116,111,103,103,108,101,0,0,96,0,0,0,0,0,0,0,42,0,0,0,0,0,0,0,112,99,101,45,109,97,99,112,108,117,115,58,32,77,97,99,105,110,116,111,115,104,32,80,108,117,115,32,101,109,117,108,97,116,111,114,0,0,0,0,67,97,108,99,77,97,115,107,0,0,0,0,0,0,0,0,42,42,42,32,115,101,116,116,105,110,103,32,117,112,32,115,100,108,32,116,101,114,109,105,110,97,108,32,102,97,105,108,101,100,10,0,0,0,0,0,83,84,79,80,0,0,0,0,114,98,0,0,0,0,0,0,45,45,32,37,115,61,37,100,10,0,0,0,0,0,0,0,49,0,0,0,0,0,0,0,70,82,77,84,0,0,0,0,77,101,97,115,117,114,101,84,101,120,116,0,0,0,0,0,71,101,116,77,97,115,107,84,97,98,108,101,0,0,0,0,101,120,101,99,117,116,101,32,116,111,32,110,101,120,116,32,114,116,101,0,0,0,0,0,82,69,83,69,84,0,0,0,70,111,110,116,77,101,116,114,105,99,115,0,0,0,0,0,83,101,116,70,83,99,97,108,101,68,105,115,97,98,108,101,0,0,0,0,0,0,0,0,99,111,119,0,0,0,0,0,112,99,101,45,109,97,99,112,108,117,115,0,0,0,0,0,65,68,68,81,46,66,0,0,83,82,0,0,0,0,0,0,83,99,114,110,66,105,116,77,97,112,0,0,0,0,0,0,65,68,68,81,46,87,0,0,37,115,10,10,0,0,0,0,80,97,99,107,49,53,0,0,65,68,68,81,46,76,0,0,80,97,99,107,49,52,0,0,84,82,65,80,76,69,0,0,83,101,116,69,79,70,0,0,80,97,99,107,49,51,0,0,84,82,65,80,71,84,0,0,80,97,99,107,49,50,0,0,60,110,111,110,101,62,0,0,84,82,65,80,76,84,0,0,101,109,117,46,115,101,114,112,111,114,116,46,100,114,105,118,101,114,0,0,0,0,0,0,80,97,99,107,49,49,0,0,56,0,0,0,0,0,0,0,66,97,99,107,113,117,111,116,101,0,0,0,0,0,0,0,37,108,117,0,0,0,0,0,101,108,115,101,0,0,0,0,112,99,101,45,109,97,99,112,108,117,115,32,118,101,114,115,105,111,110,32,50,48,49,51,49,49,50,48,45,100,56,52,53,56,49,102,45,109,111,100,10,10,67,111,112,121,114,105,103,104,116,32,40,67,41,32,50,48,48,55,45,50,48,49,50,32,72,97,109,112,97,32,72,117,103,32,60,104,97,109,112,97,64,104,97,109,112,97,46,99,104,62,10,0,0,0,112,99,101,45,109,97,99,112,108,117,115,58,32,115,101,103,109,101,110,116,97,116,105,111,110,32,102,97,117,108,116,10,0,0,0,0,0,0,0,0,115,100,108,0,0,0,0,0,84,82,65,80,71,69,0,0,102,105,108,101,0,0,0,0,80,97,99,107,49,48,0,0,82,73,0,0,0,0,0,0,116,101,114,109,46,114,101,108,101,97,115,101,0,0,0,0,70,88,88,88,0,0,0,0,73,87,77,58,32,68,37,117,32,84,114,97,99,107,32,37,117,32,32,32,32,13,0,0,84,82,65,80,77,73,0,0,80,97,99,107,57,0,0,0,114,116,101,0,0,0,0,0,84,82,65,80,80,76,0,0,37,52,117,32,32,0,0,0,67,111,109,112,111,110,101,110,116,68,105,115,112,97,116,99,104,0,0,0,0,0,0,0,84,82,65,80,86,83,0,0,49,0,0,0,0,0,0,0,76,97,121,101,114,68,105,115,112,97,116,99,104,0,0,0,84,82,65,80,86,67,0,0,119,97,118,0,0,0,0,0,115,110,100,45,115,100,108,58,32,101,114,114,111,114,32,105,110,105,116,105,97,108,105,122,105,110,103,32,97,117,100,105,111,32,115,117,98,115,121,115,116,101,109,32,40,37,115,41,10,0,0,0,0,0,0,0,83,104,111,119,68,73,116,101,109,0,0,0,0,0,0,0,84,82,65,80,69,81,0,0,72,105,100,101,68,73,116,101,109,0,0,0,0,0,0,0,84,82,65,80,78,69,0,0,119,97,118,102,105,108,116,101,114,0,0,0,0,0,0,0,73,110,115,77,101,110,117,73,116,101,109,0,0,0,0,0,84,82,65,80,67,83,0,0,71,101,116,69,79,70,0,0,66,70,73,78,83,0,0,0,65,108,105,97,115,68,105,115,112,97,116,99,104,0,0,0,84,82,65,80,67,67,0,0,82,101,115,111,117,114,99,101,68,105,115,112,97,116,99,104,0,0,0,0,0,0,0,0,84,82,65,80,76,83,0,0,101,109,117,46,114,101,115,101,116,0,0,0,0,0,0,0,112,99,101,0,0,0,0,0,55,0,0,0,0,0,0,0,80,97,117,115,101,0,0,0,45,0,0,0,0,0,0,0,59,0,0,0,0,0,0,0,112,99,101,45,109,97,99,112,108,117,115,32,118,101,114,115,105,111,110,32,50,48,49,51,49,49,50,48,45,100,56,52,53,56,49,102,45,109,111,100,10,67,111,112,121,114,105,103,104,116,32,40,67,41,32,50,48,48,55,45,50,48,49,50,32,72,97,109,112,97,32,72,117,103,32,60,104,97,109,112,97,64,104,97,109,112,97,46,99,104,62,10,0,0,0,0,77,97,120,83,105,122,101,82,115,114,99,0,0,0,0,0,42,42,42,32,116,101,114,109,105,110,97,108,32,100,114,105,118,101,114,32,39,120,49,49,39,32,110,111,116,32,115,117,112,112,111,114,116,101,100,10,0,0,0,0,0,0,0,0,84,82,65,80,72,73,0,0,111,112,116,105,111,110,97,108,0,0,0,0,0,0,0,0,67,68,0,0,0,0,0,0,97,100,100,114,61,48,120,37,48,54,108,88,32,119,61,37,117,32,104,61,37,117,32,98,114,105,103,104,116,61,37,117,37,37,10,0,0,0,0,0,65,88,88,88,0,0,0,0,71,101,116,49,78,97,109,101,100,82,101,115,111,117,114,99,101,0,0,0,0,0,0,0,84,82,65,80,70,0,0,0,71,101,116,49,82,101,115,111,117,114,99,101,0,0,0,0,114,101,115,101,116,0,0,0,84,82,65,80,84,0,0,0,116,99,58,32,117,110,107,110,111,119,110,32,109,97,114,107,32,48,120,37,48,50,120,32,40,37,115,44,32,99,61,37,117,44,32,104,61,37,117,44,32,98,105,116,61,37,108,117,47,37,108,117,41,10,0,0,73,110,118,97,108,77,101,110,117,66,97,114,0,0,0,0,68,66,76,69,0,0,0,0,67,111,117,110,116,49,84,121,112,101,115,0,0,0,0,0,68,66,71,84,0,0,0,0,37,115,37,48,56,108,88,0,72,67,114,101,97,116,101,82,101,115,70,105,108,101,0,0,68,66,76,84,0,0,0,0,72,79,112,101,110,82,101,115,70,105,108,101,0,0,0,0,68,66,71,69,0,0,0,0,112,102,100,99,58,32,99,114,99,32,101,114,114,111,114,10,0,0,0,0,0,0,0,0,112,102,100,99,58,32,119,97,114,110,105,110,103,58,32,108,111,97,100,105,110,103,32,100,101,112,114,101,99,97,116,101,100,32,118,101,114,115,105,111,110,32,50,32,102,105,108,101,10,0,0,0,0,0,0,0,88,77,117,110,103,101,114,0,68,66,77,73,0,0,0,0,112,102,100,99,58,32,119,97,114,110,105,110,103,58,32,108,111,97,100,105,110,103,32,100,101,112,114,101,99,97,116,101,100,32,118,101,114,115,105,111,110,32,49,32,102,105,108,101,10,0,0,0,0,0,0,0,65,108,108,111,99,97,116,101,0,0,0,0,0,0,0,0,112,102,100,99,58,32,119,97,114,110,105,110,103,58,32,108,111,97,100,105,110,103,32,100,101,112,114,101,99,97,116,101,100,32,118,101,114,115,105,111,110,32,48,32,102,105,108,101,10,0,0,0,0,0,0,0,70,105,120,65,116,97,110,50,0,0,0,0,0,0,0,0,115,111,110,121,58,32,114,101,97,100,32,101,114,114,111,114,32,97,116,32,37,117,47,37,117,47,37,117,10,0,0,0,68,66,80,76,0,0,0,0,115,99,115,105,58,32,109,111,100,101,32,115,101,110,115,101,58,32,117,110,107,110,111,119,110,32,109,111,100,101,32,112,97,103,101,32,40,37,48,50,88,41,10,0,0,0,0,0,67,111,112,121,77,97,115,107,0,0,0,0,0,0,0,0,68,66,86,83,0,0,0,0,101,109,117,46,114,101,97,108,116,105,109,101,46,116,111,103,103,108,101,0,0,0,0,0,116,101,114,109,46,102,117,108,108,115,99,114,101,101,110,0,54,0,0,0,0,0,0,0,83,99,114,76,107,0,0,0,43,0,0,0,0,0,0,0,99,97,110,39,116,32,111,112,101,110,32,105,110,99,108,117,100,101,32,102,105,108,101,58,0,0,0,0,0,0,0,0,80,97,99,107,56,0,0,0,42,42,42,32,108,111,97,100,105,110,103,32,102,97,105,108,101,100,32,40,37,115,41,10,0,0,0,0,0,0,0,0,42,42,42,32,108,111,97,100,105,110,103,32,99,111,110,102,105,103,32,102,105,108,101,32,102,97,105,108,101,100,10,0,120,49,49,0,0,0,0,0,114,101,97,100,111,110,108,121,0,0,0,0,0,0,0,0,68,66,86,67,0,0,0,0,119,98,0,0,0,0,0,0,68,83,82,0,0,0,0,0,101,120,101,99,117,116,101,32,99,110,116,32,105,110,115,116,114,117,99,116,105,111,110,115,44,32,115,107,105,112,32,99,97,108,108,115,32,91,49,93,0,0,0,0,0,0,0,0,86,73,68,69,79,58,0,0,84,82,65,67,69,0,0,0,83,67,83,73,68,105,115,112,97,116,99,104,0,0,0,0,68,66,69,81,0,0,0,0,83,101,116,70,114,97,99,116,69,110,97,98,108,101,0,0,91,99,110,116,93,0,0,0,68,66,78,69,0,0,0,0,99,112,50,58,32,37,117,47,37,117,47,37,117,58,32,115,101,99,116,111,114,32,100,97,116,97,32,116,111,111,32,98,105,103,32,40,37,117,41,10,0,0,0,0,0,0,0,0,84,69,65,117,116,111,86,105,101,119,0,0,0,0,0,0,68,66,67,83,0,0,0,0,84,69,80,105,110,83,99,114,111,108,108,0,0,0,0,0,68,66,67,67,0,0,0,0,35,37,115,37,88,0,0,0,84,69,83,101,108,86,105,101,119,0,0,0,0,0,0,0,68,66,76,83,0,0,0,0,85,110,105,113,117,101,49,73,68,0,0,0,0,0,0,0,105,119,109,58,32,108,111,97,100,105,110,103,32,100,114,105,118,101,32,37,117,32,40,100,105,115,107,41,10,0,0,0,68,66,72,73,0,0,0,0,71,101,116,49,73,120,84,121,112,101,0,0,0,0,0,0,68,66,70,0,0,0,0,0,77,111,117,110,116,86,111,108,0,0,0,0,0,0,0,0,71,101,116,49,73,120,82,101,115,111,117,114,99,101,0,0,115,111,110,121,58,32,114,101,97,100,32,101,114,114,111,114,10,0,0,0,0,0,0,0,68,66,84,0,0,0,0,0,65,80,80,76,69,32,67,79,77,80,85,84,69,82,44,32,73,78,67,0,0,0,0,0,67,111,117,110,116,49,82,101,115,111,117,114,99,101,115,0,83,76,69,0,0,0,0,0,101,109,117,46,114,101,97,108,116,105,109,101,0,0,0,0,116,101,114,109,46,102,117,108,108,115,99,114,101,101,110,46,116,111,103,103,108,101,0,0,53,0,0,0,0,0,0,0,83,99,114,111,108,108,76,111,99,107,0,0,0,0,0,0,62,62,0,0,0,0,0,0,63,0,0,0,0,0,0,0,82,71,101,116,82,101,115,111,117,114,99,101,0,0,0,0,98,97,115,101,0,0,0,0,102,105,108,101,61,34,37,115,34,10,0,0,0,0,0,0,69,83,67,0,0,0,0,0,42,42,42,32,108,111,97,100,105,110,103,32,114,111,109,32,102,97,105,108,101,100,32,40,37,115,41,10,0,0,0,0,115,105,122,101,103,0,0,0,83,71,84,0,0,0,0,0,114,98,0,0,0,0,0,0,46,97,110,97,0,0,0,0,82,84,83,0,0,0,0,0,98,114,105,103,104,116,110,101,115,115,0,0,0,0,0,0,80,82,73,86,0,0,0,0,80,111,112,85,112,77,101,110,117,83,101,108,101,99,116,0,83,76,84,0,0,0,0,0,71,101,116,87,86,97,114,105,97,110,116,0,0,0,0,0,112,0,0,0,0,0,0,0,83,71,69,0,0,0,0,0,71,101,116,67,86,97,114,105,97,110,116,0,0,0,0,0,83,77,73,0,0,0,0,0,73,110,105,116,80,114,111,99,77,101,110,117,0,0,0,0,49,0,0,0,0,0,0,0,83,80,76,0,0,0,0,0,35,37,115,37,48,56,108,88,0,0,0,0,0,0,0,0,83,110,100,78,101,119,67,104,97,110,110,101,108,0,0,0,83,86,83,0,0,0,0,0,114,98,0,0,0,0,0,0,103,99,114,58,32,100,97,116,97,32,99,114,99,32,101,114,114,111,114,32,40,37,117,47,37,117,47,37,117,41,10,0,83,110,100,67,111,110,116,114,111,108,0,0,0,0,0,0,83,86,67,0,0,0,0,0,102,105,108,101,0,0,0,0,69,120,116,114,97,49,54,0,115,121,109,108,105,110,107,0,83,110,100,80,108,97,121,0,83,69,81,0,0,0,0,0,85,110,109,111,117,110,116,86,111,108,0,0,0,0,0,0,69,120,116,114,97,49,53,0,102,105,108,101,0,0,0,0,83,110,100,68,111,73,109,109,101,100,105,97,116,101,0,0,115,111,110,121,58,32,110,111,110,45,97,108,105,103,110,101,100,32,114,101,97,100,10,0,83,78,69,0,0,0,0,0,115,99,115,105,58,32,115,116,97,114,116,47,115,116,111,112,32,117,110,105,116,32,37,117,32,40,37,115,41,10,0,0,67,108,111,115,101,0,0,0,69,120,116,114,97,49,52,0,112,114,111,116,111,99,111,108,0,0,0,0,0,0,0,0,83,110,100,68,111,67,111,109,109,97,110,100,0,0,0,0,83,67,83,0,0,0,0,0,101,109,117,46,112,97,117,115,101,46,116,111,103,103,108,101,0,0,0,0,0,0,0,0,116,101,114,109,46,115,101,116,95,98,111,114,100,101,114,95,121,0,0,0,0,0,0,0,52,0,0,0,0,0,0,0,80,114,116,83,99,110,0,0,60,60,0,0,0,0,0,0,69,120,116,114,97,49,51,0,105,110,99,108,117,100,101,0,83,110,100,65,100,100,77,111,100,105,102,105,101,114,0,0,97,100,100,114,101,115,115,0,67,79,78,70,73,71,58,0,100,114,105,118,101,114,61,37,115,32,69,83,67,61,37,115,32,97,115,112,101,99,116,61,37,117,47,37,117,32,109,105,110,95,115,105,122,101,61,37,117,42,37,117,32,115,99,97,108,101,61,37,117,32,109,111,117,115,101,61,91,37,117,47,37,117,32,37,117,47,37,117,93,10,0,0,0,0,0,0,82,79,77,58,0,0,0,0,115,105,122,101,109,0,0,0,83,67,67,0,0,0,0,0,46,120,100,102,0,0,0,0,68,84,82,0,0,0,0,0,69,120,116,114,97,49,50,0,99,111,108,111,114,49,0,0,79,70,76,87,0,0,0,0,83,110,100,68,105,115,112,111,115,101,67,104,97,110,110,101,108,0,0,0,0,0,0,0,83,76,83,0,0,0,0,0,69,120,116,114,97,49,49,0,83,111,117,110,100,68,105,115,112,97,116,99,104,0,0,0,115,101,116,32,104,97,108,116,32,115,116,97,116,101,32,91,50,93,0,0,0,0,0,0,83,72,73,0,0,0,0,0,69,120,116,114,97,49,48,0,109,111,117,115,101,0,0,0,72,87,80,114,105,118,0,0,83,70,0,0,0,0,0,0,114,98,0,0,0,0,0,0,69,103,114,101,116,68,105,115,112,97,116,99,104,0,0,0,69,120,116,114,97,57,0,0,49,0,0,0,0,0,0,0,83,84,0,0,0,0,0,0,80,67,69,32,82,79,77,32,101,120,116,101,110,115,105,111,110,32,110,111,116,32,102,111,117,110,100,10,0,0,0,0,114,98,0,0,0,0,0,0,35,37,115,37,48,50,88,0,69,120,116,114,97,56,0,0,84,114,97,110,115,108,97,116,101,50,52,116,111,51,50,0,114,98,0,0,0,0,0,0,83,85,66,81,46,66,0,0,69,120,116,114,97,55,0,0,68,79,83,69,77,85,0,0,83,121,115,69,110,118,105,114,111,110,115,0,0,0,0,0,83,85,66,81,46,87,0,0,69,120,116,114,97,54,0,0,68,101,102,101,114,85,115,101,114,70,110,0,0,0,0,0,83,85,66,81,46,76,0,0,83,101,116,70,105,108,101,73,110,102,111,0,0,0,0,0,69,120,116,114,97,53,0,0,68,101,98,117,103,85,116,105,108,0,0,0,0,0,0,0,115,111,110,121,58,32,119,114,105,116,101,32,101,114,114,111,114,10,0,0,0,0,0,0,66,76,69,0,0,0,0,0,108,111,97,100,32,109,101,100,105,97,0,0,0,0,0,0,69,120,116,114,97,52,0,0,67,111,109,109,84,111,111,108,98,111,120,68,105,115,112,97,116,99,104,0,0,0,0,0,66,71,84,0,0,0,0,0,101,109,117,46,112,97,117,115,101,0,0,0,0,0,0,0,80,67,69,68,73,83,75,32,32,32,32,32,32,32,32,32,0,0,0,0,0,0,0,0,116,101,114,109,46,115,101,116,95,98,111,114,100,101,114,95,120,0,0,0,0,0,0,0,99,111,109,109,105,116,0,0,51,0,0,0,0,0,0,0,80,114,105,110,116,83,99,114,101,101,110,0,0,0,0,0,62,0,0,0,0,0,0,0,69,120,116,114,97,51,0,0,105,102,0,0,0,0,0,0,121,0,0,0,0,0,0,0,83,108,101,101,112,0,0,0,102,105,108,101,0,0,0,0,84,69,82,77,58,0,0,0,114,111,109,0,0,0,0,0,115,105,122,101,107,0,0,0,66,76,84,0,0,0,0,0,46,116,100,48,0,0,0,0,67,84,83,0,0,0,0,0,69,120,116,114,97,50,0,0,67,72,75,0,0,0,0,0,99,111,108,111,114,48,0,0,73,79,80,77,111,118,101,68,97,116,97,0,0,0,0,0,66,71,69,0,0,0,0,0,114,98,0,0,0,0,0,0,69,120,116,114,97,49,0,0,73,79,80,77,115,103,82,101,113,117,101,115,116,0,0,0,91,118,97,108,93,0,0,0,104,101,105,103,104,116,0,0,66,77,73,0,0,0,0,0,82,105,103,104,116,0,0,0,73,79,80,73,110,102,111,65,99,99,101,115,115,0,0,0,66,80,76,0,0,0,0,0,68,111,119,110,0,0,0,0,80,77,103,114,79,112,0,0,66,86,83,0,0,0,0,0,76,101,102,116,0,0,0,0,71,101,116,79,83,68,101,102,97,117,108,116,0,0,0,0,66,86,67,0,0,0,0,0,85,112,0,0,0,0,0,0,83,101,116,79,83,68,101,102,97,117,108,116,0,0,0,0,66,69,81,0,0,0,0,0,101,109,117,46,99,112,117,46,109,111,100,101,108,0,0,0,80,97,103,101,68,111,119,110,0,0,0,0,0,0,0,0,66,76,75,32,37,48,52,88,58,32,65,49,61,37,48,56,108,88,32,65,50,61,37,48,56,108,88,32,83,61,37,48,56,108,88,32,82,79,61,37,100,10,0,0,0,0,0,0,98,111,114,100,101,114,0,0,68,84,73,110,115,116,97,108,108,0,0,0,0,0,0,0,66,78,69,0,0,0,0,0,119,98,0,0,0,0,0,0,71,101,116,70,105,108,101,73,110,102,111,0,0,0,0,0,69,110,100,0,0,0,0,0,83,101,116,86,105,100,101,111,68,101,102,97,117,108,116,0,115,111,110,121,58,32,110,111,110,45,97,108,105,103,110,101,100,32,119,114,105,116,101,10,0,0,0,0,0,0,0,0,66,67,83,0,0,0,0,0,101,106,101,99,116,32,109,101,100,105,97,0,0,0,0,0,68,101,108,101,116,101,0,0,70,49,0,0,0,0,0,0,71,101,116,86,105,100,101,111,68,101,102,97,117,108,116,0,114,43,98,0,0,0,0,0,119,43,98,0,0,0,0,0,66,67,67,0,0,0,0,0,101,109,117,46,101,120,105,116,0,0,0,0,0,0,0,0,58,0,0,0,0,0,0,0,116,101,114,109,46,116,105,116,108,101,0,0,0,0,0,0,50,0,0,0,0,0,0,0,70,49,50,0,0,0,0,0,60,0,0,0,0,0,0,0,80,97,103,101,85,112,0,0,61,0,0,0,0,0,0,0,118,0,0,0,0,0,0,0,73,110,116,101,114,110,97,108,87,97,105,116,0,0,0,0,102,111,114,109,97,116,0,0,109,111,117,115,101,95,100,105,118,95,121,0,0,0,0,0,109,97,99,112,108,117,115,0,42,42,42,32,108,111,97,100,105,110,103,32,114,97,109,32,102,97,105,108,101,100,32,40,37,115,41,10,0,0,0,0,115,105,122,101,0,0,0,0,66,76,83,0,0,0,0,0,65,32,32,37,48,56,108,88,32,32,37,48,52,88,32,32,37,48,52,88,10,0,0,0,82,101,108,101,97,115,101,32,54,46,48,10,36,48,0,0,114,98,0,0,0,0,0,0,46,116,99,0,0,0,0,0,45,45,32,37,108,117,32,37,117,37,115,37,117,10,0,0,112,97,116,104,0,0,0,0,72,111,109,101,0,0,0,0,102,97,108,115,101,0,0,0,104,97,108,116,0,0,0,0,68,73,86,90,0,0,0,0,83,101,116,68,101,102,97,117,108,116,83,116,97,114,116,117,112,0,0,0,0,0,0,0,66,72,73,0,0,0,0,0,73,110,115,101,114,116,0,0,71,101,116,68,101,102,97,117,108,116,83,116,97,114,116,117,112,0,0,0,0,0,0,0,60,110,111,110,101,62,0,0,66,83,82,0,0,0,0,0,76,111,97,100,58,0,0,0,119,105,100,116,104,0,0,0,100,114,105,118,101,114,0,0,102,105,108,101,0,0,0,0,75,80,95,80,101,114,105,111,100,0,0,0,0,0,0,0,65,68,66,79,112,0,0,0,66,82,65,0,0,0,0,0,68,73,83,75,58,0,0,0,99,112,117,0,0,0,0,0,75,80,95,48,0,0,0,0,65,68,66,82,101,73,110,105,116,0,0,0,0,0,0,0,108,0,0,0,0,0,0,0,46,83,0,0,0,0,0,0,116,114,117,101,0,0,0,0,119,98,0,0,0,0,0,0,115,110,100,45,115,100,108,58,32,101,114,114,111,114,32,111,112,101,110,105,110,103,32,111,117,116,112,117,116,32,40,37,115,41,10,0,0,0,0,0,108,111,119,112,97,115,115,0,45,0,0,0,0,0,0,0,75,80,95,69,110,116,101,114,0,0,0,0,0,0,0,0,116,100,48,58,32,97,100,118,97,110,99,101,100,32,99,111,109,112,114,101,115,115,105,111,110,32,110,111,116,32,115,117,112,112,111,114,116,101,100,10,0,0,0,0,0,0,0,0,83,101,116,65,68,66,73,110,102,111,0,0,0,0,0,0,102,109,0,0,0,0,0,0,115,116,120,58,32,98,97,100,32,109,97,103,105,99,10,0,77,79,86,69,81,0,0,0,112,115,105,58,32,99,114,99,32,101,114,114,111,114,10,0,112,102,100,99,58,32,111,114,112,104,97,110,101,100,32,97,108,116,101,114,110,97,116,101,32,115,101,99,116,111,114,10,0,0,0,0,0,0,0,0,75,80,95,51,0,0,0,0,73,77,68,32,49,46,49,55,58,32,37,50,100,47,37,50,100,47,37,52,100,32,37,48,50,100,58,37,48,50,100,58,37,48,50,100,0,0,0,0,6,78,111,110,97,109,101,0,71,101,116,65,68,66,73,110,102,111,0,0,0,0,0,0,99,112,50,58,32,37,117,47,37,117,47,37,117,58,0,0,68,73,86,85,46,87,0,0,75,80,95,50,0,0,0,0,46,99,112,50,0,0,0,0,112,114,105,58,32,99,114,99,32,101,114,114,111,114,10,0,71,101,116,73,110,100,65,68,66,0,0,0,0,0,0,0,112,114,105,58,32,99,114,99,32,101,114,114,111,114,10,0,79,82,46,66,0,0,0,0,119,98,0,0,0,0,0,0,102,108,117,115,104,0,0,0,42,42,42,32,101,114,114,111,114,32,99,114,101,97,116,105,110,103,32,115,121,109,108,105,110,107,32,37,115,32,45,62,32,37,115,10,0,0,0,0,114,101,97,100,0,0,0,0,82,101,110,97,109,101,0,0,109,105,99,114,111,115,111,102,116,0,0,0,0,0,0,0,75,80,95,49,0,0,0,0,67,111,117,110,116,65,68,66,115,0,0,0,0,0,0,0,110,117,108,108,0,0,0,0,115,111,110,121,58,32,112,114,105,109,101,58,32,117,110,107,110,111,119,110,32,40,116,114,97,112,61,48,120,37,48,52,120,41,10,0,0,0,0,0,114,43,98,0,0,0,0,0,83,66,67,68,46,66,0,0,114,43,98,0,0,0,0,0,114,43,98,0,0,0,0,0,114,98,0,0,0,0,0,0,115,116,97,114,116,32,109,111,116,111,114,0,0,0,0,0,75,80,95,54,0,0,0,0,114,43,98,0,0,0,0,0,83,73,110,116,82,101,109,111,118,101,0,0,0,0,0,0,79,82,46,87,0,0,0,0,101,109,117,46,105,119,109,46,115,116,97,116,117,115,0,0,116,101,114,109,46,114,101,108,101,97,115,101,0,0,0,0,101,109,117,46,99,112,117,46,115,112,101,101,100,0,0,0,70,49,49,0,0,0,0,0,62,61,0,0,0,0,0,0,75,80,95,53,0,0,0,0,63,61,0,0,0,0,0,0,113,0,0,0,0,0,0,0,83,73,110,116,73,110,115,116,97,108,108,0,0,0,0,0,108,111,97,100,0,0,0,0,109,111,117,115,101,95,109,117,108,95,121,0,0,0,0,0,37,115,58,32,117,110,107,110,111,119,110,32,111,112,116,105,111,110,32,40,37,115,41,10,0,0,0,0,0,0,0,0,42,42,42,32,109,101,109,111,114,121,32,98,108,111,99,107,32,99,114,101,97,116,105,111,110,32,102,97,105,108,101,100,10,0,0,0,0,0,0,0,98,108,111,99,107,115,0,0,79,82,46,76,0,0,0,0,83,32,32,37,48,52,88,58,37,48,52,108,88,32,32,37,48,52,88,32,32,37,48,52,88,10,0,0,0,0,0,0,116,100,48,58,32,99,111,109,109,101,110,116,32,99,114,99,32,40,37,48,52,88,32,37,48,52,88,41,10,0,0,0,82,101,108,101,97,115,101,32,53,46,48,49,36,48,0,0,46,115,116,120,0,0,0,0,63,0,0,0,0,0,0,0,75,80,95,52,0,0,0,0,73,76,76,71,0,0,0,0,68,111,86,66,76,84,97,115,107,0,0,0,0,0,0,0,68,73,86,83,46,87,0,0,65,116,116,97,99,104,86,66,76,0,0,0,0,0,0,0,75,80,95,80,108,117,115,0,42,42,42,32,117,110,107,110,111,119,110,32,109,111,100,101,108,32,40,37,115,41,10,0,114,117,110,0,0,0,0,0,83,85,66,65,46,87,0,0,97,100,100,114,101,115,115,0,83,108,111,116,86,82,101,109,111,118,101,0,0,0,0,0,75,80,95,57,0,0,0,0,109,97,99,45,99,108,97,115,115,105,99,0,0,0,0,0,83,85,66,46,66,0,0,0,83,108,111,116,86,73,110,115,116,97,108,108,0,0,0,0,75,80,95,56,0,0,0,0,109,97,99,45,115,101,0,0,83,85,66,88,46,66,0,0,83,108,111,116,77,97,110,97,103,101,114,0,0,0,0,0,37,115,37,115,37,48,52,88,40,65,37,117,41,0,0,0,75,80,95,55,0,0,0,0,109,111,100,101,108,61,37,115,10,0,0,0,0,0,0,0,83,85,66,46,87,0,0,0,73,110,105,116,69,118,101,110,116,115,0,0,0,0,0,0,75,80,95,77,105,110,117,115,0,0,0,0,0,0,0,0,83,89,83,84,69,77,58,0,83,85,66,88,46,87,0,0,73,110,105,116,70,83,0,0,75,80,95,83,116,97,114,0,109,97,99,45,112,108,117,115,0,0,0,0,0,0,0,0,83,85,66,46,76,0,0,0,72,83,101,116,83,116,97,116,101,0,0,0,0,0,0,0,79,112,101,110,82,70,0,0,75,80,95,83,108,97,115,104,0,0,0,0,0,0,0,0,115,121,115,116,101,109,0,0,115,111,110,121,58,32,102,111,114,109,97,116,116,101,100,32,100,105,115,107,32,40,37,108,117,32,98,108,111,99,107,115,41,10,0,0,0,0,0,0,83,85,66,88,46,76,0,0,72,71,101,116,83,116,97,116,101,0,0,0,0,0,0,0,115,116,111,112,32,109,111,116,111,114,0,0,0,0,0,0,78,117,109,76,111,99,107,0,100,105,115,97,98,108,105,110,103,32,109,101,109,111,114,121,32,116,101,115,116,10,0,0,83,85,66,65,46,76,0,0,101,109,117,46,105,119,109,46,114,119,0,0,0,0,0,0,72,67,108,114,82,66,105,116,0,0,0,0,0,0,0,0,116,101,114,109,46,103,114,97,98,0,0,0,0,0,0,0,49,0,0,0,0,0,0,0,70,49,48,0,0,0,0,0,60,61,0,0,0,0,0,0,67,116,114,108,82,105,103,104,116,0,0,0,0,0,0,0,125,0,0,0,0,0,0,0,109,0,0,0,0,0,0,0,82,65,77,58,0,0,0,0,98,105,110,97,114,121,0,0,109,111,117,115,101,95,100,105,118,95,120,0,0,0,0,0,60,110,111,110,101,62,0,0,99,112,117,46,115,112,101,101,100,32,61,32,0,0,0,0,115,0,0,0,0,0,0,0,32,37,115,0,0,0,0,0,67,77,80,46,66,0,0,0,69,32,32,34,37,115,34,10,0,0,0,0,0,0,0,0,116,100,48,58,32,114,101,97,100,32,101,114,114,111,114,10,0,0,0,0,0,0,0,0,82,101,108,101,97,115,101,32,52,46,48,48,36,48,0,0,72,83,101,116,82,66,105,116,0,0,0,0,0,0,0,0,46,115,116,0,0,0,0,0,69,0,0,0,0,0,0,0,77,101,110,117,0,0,0,0,65,68,68,82,0,0,0,0,109,101,109,116,101,115,116,0,67,77,80,46,87,0,0,0,78,101,119,69,109,112,116,121,72,97,110,100,108,101,0,0,87,105,110,100,111,119,115,82,105,103,104,116,0,0,0,0,42,42,42,32,82,79,77,32,110,111,116,32,102,111,117,110,100,32,97,116,32,52,48,48,48,48,48,10,0,0,0,0,105,103,110,111,114,105,110,103,32,112,99,101,32,107,101,121,58,32,48,120,37,48,52,120,32,40,37,115,41,10,0,0,97,100,98,58,32,117,110,107,110,111,119,110,32,99,109,100,32,40,37,48,50,88,41,10,0,0,0,0,0,0,0,0])
, "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i64=_memset;
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:35,EIDRM:36,ECHRNG:37,EL2NSYNC:38,EL3HLT:39,EL3RST:40,ELNRNG:41,EUNATCH:42,ENOCSI:43,EL2HLT:44,EDEADLK:45,ENOLCK:46,EBADE:50,EBADR:51,EXFULL:52,ENOANO:53,EBADRQC:54,EBADSLT:55,EDEADLOCK:56,EBFONT:57,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:74,ELBIN:75,EDOTDOT:76,EBADMSG:77,EFTYPE:79,ENOTUNIQ:80,EBADFD:81,EREMCHG:82,ELIBACC:83,ELIBBAD:84,ELIBSCN:85,ELIBMAX:86,ELIBEXEC:87,ENOSYS:88,ENMFILE:89,ENOTEMPTY:90,ENAMETOOLONG:91,ELOOP:92,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:106,EPROTOTYPE:107,ENOTSOCK:108,ENOPROTOOPT:109,ESHUTDOWN:110,ECONNREFUSED:111,EADDRINUSE:112,ECONNABORTED:113,ENETUNREACH:114,ENETDOWN:115,ETIMEDOUT:116,EHOSTDOWN:117,EHOSTUNREACH:118,EINPROGRESS:119,EALREADY:120,EDESTADDRREQ:121,EMSGSIZE:122,EPROTONOSUPPORT:123,ESOCKTNOSUPPORT:124,EADDRNOTAVAIL:125,ENETRESET:126,EISCONN:127,ENOTCONN:128,ETOOMANYREFS:129,EPROCLIM:130,EUSERS:131,EDQUOT:132,ESTALE:133,ENOTSUP:134,ENOMEDIUM:135,ENOSHARE:136,ECASECLASH:137,EILSEQ:138,EOVERFLOW:139,ECANCELED:140,ENOTRECOVERABLE:141,EOWNERDEAD:142,ESTRPIPE:143};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  var __impure_ptr=allocate(1, "i32*", ALLOC_STATIC);var FS={currentPath:"/",nextInode:2,streams:[null],ignorePermissions:true,createFileHandle:function (stream, fd) {
        if (typeof stream === 'undefined') {
          stream = null;
        }
        if (!fd) {
          if (stream && stream.socket) {
            for (var i = 1; i < 64; i++) {
              if (!FS.streams[i]) {
                fd = i;
                break;
              }
            }
            assert(fd, 'ran out of low fds for sockets');
          } else {
            fd = Math.max(FS.streams.length, 64);
            for (var i = FS.streams.length; i < fd; i++) {
              FS.streams[i] = null; // Keep dense
            }
          }
        }
        // Close WebSocket first if we are about to replace the fd (i.e. dup2)
        if (FS.streams[fd] && FS.streams[fd].socket && FS.streams[fd].socket.close) {
          FS.streams[fd].socket.close();
        }
        FS.streams[fd] = stream;
        return fd;
      },removeFileHandle:function (fd) {
        FS.streams[fd] = null;
      },joinPath:function (parts, forceRelative) {
        var ret = parts[0];
        for (var i = 1; i < parts.length; i++) {
          if (ret[ret.length-1] != '/') ret += '/';
          ret += parts[i];
        }
        if (forceRelative && ret[0] == '/') ret = ret.substr(1);
        return ret;
      },absolutePath:function (relative, base) {
        if (typeof relative !== 'string') return null;
        if (base === undefined) base = FS.currentPath;
        if (relative && relative[0] == '/') base = '';
        var full = base + '/' + relative;
        var parts = full.split('/').reverse();
        var absolute = [''];
        while (parts.length) {
          var part = parts.pop();
          if (part == '' || part == '.') {
            // Nothing.
          } else if (part == '..') {
            if (absolute.length > 1) absolute.pop();
          } else {
            absolute.push(part);
          }
        }
        return absolute.length == 1 ? '/' : absolute.join('/');
      },analyzePath:function (path, dontResolveLastLink, linksVisited) {
        var ret = {
          isRoot: false,
          exists: false,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: false,
          parentPath: null,
          parentObject: null
        };
        path = FS.absolutePath(path);
        if (path == '/') {
          ret.isRoot = true;
          ret.exists = ret.parentExists = true;
          ret.name = '/';
          ret.path = ret.parentPath = '/';
          ret.object = ret.parentObject = FS.root;
        } else if (path !== null) {
          linksVisited = linksVisited || 0;
          path = path.slice(1).split('/');
          var current = FS.root;
          var traversed = [''];
          while (path.length) {
            if (path.length == 1 && current.isFolder) {
              ret.parentExists = true;
              ret.parentPath = traversed.length == 1 ? '/' : traversed.join('/');
              ret.parentObject = current;
              ret.name = path[0];
            }
            var target = path.shift();
            if (!current.isFolder) {
              ret.error = ERRNO_CODES.ENOTDIR;
              break;
            } else if (!current.read) {
              ret.error = ERRNO_CODES.EACCES;
              break;
            } else if (!current.contents.hasOwnProperty(target)) {
              ret.error = ERRNO_CODES.ENOENT;
              break;
            }
            current = current.contents[target];
            if (current.link && !(dontResolveLastLink && path.length == 0)) {
              if (linksVisited > 40) { // Usual Linux SYMLOOP_MAX.
                ret.error = ERRNO_CODES.ELOOP;
                break;
              }
              var link = FS.absolutePath(current.link, traversed.join('/'));
              ret = FS.analyzePath([link].concat(path).join('/'),
                                   dontResolveLastLink, linksVisited + 1);
              return ret;
            }
            traversed.push(target);
            if (path.length == 0) {
              ret.exists = true;
              ret.path = traversed.join('/');
              ret.object = current;
            }
          }
        }
        return ret;
      },findObject:function (path, dontResolveLastLink) {
        FS.ensureRoot();
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },createObject:function (parent, name, properties, canRead, canWrite) {
        if (!parent) parent = '/';
        if (typeof parent === 'string') parent = FS.findObject(parent);
        if (!parent) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent path must exist.');
        }
        if (!parent.isFolder) {
          ___setErrNo(ERRNO_CODES.ENOTDIR);
          throw new Error('Parent must be a folder.');
        }
        if (!parent.write && !FS.ignorePermissions) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent folder must be writeable.');
        }
        if (!name || name == '.' || name == '..') {
          ___setErrNo(ERRNO_CODES.ENOENT);
          throw new Error('Name must not be empty.');
        }
        if (parent.contents.hasOwnProperty(name)) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          throw new Error("Can't overwrite object.");
        }
        parent.contents[name] = {
          read: canRead === undefined ? true : canRead,
          write: canWrite === undefined ? false : canWrite,
          timestamp: Date.now(),
          inodeNumber: FS.nextInode++
        };
        for (var key in properties) {
          if (properties.hasOwnProperty(key)) {
            parent.contents[name][key] = properties[key];
          }
        }
        return parent.contents[name];
      },createFolder:function (parent, name, canRead, canWrite) {
        var properties = {isFolder: true, isDevice: false, contents: {}};
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createPath:function (parent, path, canRead, canWrite) {
        var current = FS.findObject(parent);
        if (current === null) throw new Error('Invalid parent.');
        path = path.split('/').reverse();
        while (path.length) {
          var part = path.pop();
          if (!part) continue;
          if (!current.contents.hasOwnProperty(part)) {
            FS.createFolder(current, part, canRead, canWrite);
          }
          current = current.contents[part];
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        properties.isFolder = false;
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createDataFile:function (parent, name, data, canRead, canWrite) {
        if (typeof data === 'string') {
          var dataArray = new Array(data.length);
          for (var i = 0, len = data.length; i < len; ++i) dataArray[i] = data.charCodeAt(i);
          data = dataArray;
        }
        var properties = {
          isDevice: false,
          contents: data.subarray ? data.subarray(0) : data // as an optimization, create a new array wrapper (not buffer) here, to help JS engines understand this object
        };
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile) {
        Browser.init();
        var fullname = FS.joinPath([parent, name], true);
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },createLink:function (parent, name, target, canRead, canWrite) {
        var properties = {isDevice: false, link: target};
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createDevice:function (parent, name, input, output) {
        if (!(input || output)) {
          throw new Error('A device must have at least one callback defined.');
        }
        var ops = {isDevice: true, input: input, output: output};
        return FS.createFile(parent, name, ops, Boolean(input), Boolean(output));
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },ensureRoot:function () {
        if (FS.root) return;
        // The main file system tree. All the contents are inside this.
        FS.root = {
          read: true,
          write: true,
          isFolder: true,
          isDevice: false,
          timestamp: Date.now(),
          inodeNumber: 1,
          contents: {}
        };
      },init:function (input, output, error) {
        // Make sure we initialize only once.
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        FS.ensureRoot();
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        input = input || Module['stdin'];
        output = output || Module['stdout'];
        error = error || Module['stderr'];
        // Default handlers.
        var stdinOverridden = true, stdoutOverridden = true, stderrOverridden = true;
        if (!input) {
          stdinOverridden = false;
          input = function() {
            if (!input.cache || !input.cache.length) {
              var result;
              if (typeof window != 'undefined' &&
                  typeof window.prompt == 'function') {
                // Browser.
                result = window.prompt('Input: ');
                if (result === null) result = String.fromCharCode(0); // cancel ==> EOF
              } else if (typeof readline == 'function') {
                // Command line.
                result = readline();
              }
              if (!result) result = '';
              input.cache = intArrayFromString(result + '\n', true);
            }
            return input.cache.shift();
          };
        }
        var utf8 = new Runtime.UTF8Processor();
        function simpleOutput(val) {
          if (val === null || val === 10) {
            output.printer(output.buffer.join(''));
            output.buffer = [];
          } else {
            output.buffer.push(utf8.processCChar(val));
          }
        }
        if (!output) {
          stdoutOverridden = false;
          output = simpleOutput;
        }
        if (!output.printer) output.printer = Module['print'];
        if (!output.buffer) output.buffer = [];
        if (!error) {
          stderrOverridden = false;
          error = simpleOutput;
        }
        if (!error.printer) error.printer = Module['print'];
        if (!error.buffer) error.buffer = [];
        // Create the temporary folder, if not already created
        try {
          FS.createFolder('/', 'tmp', true, true);
        } catch(e) {}
        // Create the I/O devices.
        var devFolder = FS.createFolder('/', 'dev', true, true);
        var stdin = FS.createDevice(devFolder, 'stdin', input);
        stdin.isTerminal = !stdinOverridden;
        var stdout = FS.createDevice(devFolder, 'stdout', null, output);
        stdout.isTerminal = !stdoutOverridden;
        var stderr = FS.createDevice(devFolder, 'stderr', null, error);
        stderr.isTerminal = !stderrOverridden;
        FS.createDevice(devFolder, 'tty', input, output);
        FS.createDevice(devFolder, 'null', function(){}, function(){});
        // Create default streams.
        FS.streams[1] = {
          path: '/dev/stdin',
          object: stdin,
          position: 0,
          isRead: true,
          isWrite: false,
          isAppend: false,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[2] = {
          path: '/dev/stdout',
          object: stdout,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[3] = {
          path: '/dev/stderr',
          object: stderr,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          error: false,
          eof: false,
          ungotten: []
        };
        // TODO: put these low in memory like we used to assert on: assert(Math.max(_stdin, _stdout, _stderr) < 15000); // make sure these are low, we flatten arrays with these
        HEAP32[((_stdin)>>2)]=1;
        HEAP32[((_stdout)>>2)]=2;
        HEAP32[((_stderr)>>2)]=3;
        // Other system paths
        FS.createPath('/', 'dev/shm/tmp', true, true); // temp files
        // Newlib initialization
        for (var i = FS.streams.length; i < Math.max(_stdin, _stdout, _stderr) + 4; i++) {
          FS.streams[i] = null; // Make sure to keep FS.streams dense
        }
        FS.streams[_stdin] = FS.streams[1];
        FS.streams[_stdout] = FS.streams[2];
        FS.streams[_stderr] = FS.streams[3];
        allocate([ allocate(
          [0, 0, 0, 0, _stdin, 0, 0, 0, _stdout, 0, 0, 0, _stderr, 0, 0, 0],
          'void*', ALLOC_NORMAL) ], 'void*', ALLOC_NONE, __impure_ptr);
      },quit:function () {
        if (!FS.init.initialized) return;
        // Flush any partially-printed lines in stdout and stderr. Careful, they may have been closed
        if (FS.streams[2] && FS.streams[2].object.output.buffer.length > 0) FS.streams[2].object.output(10);
        if (FS.streams[3] && FS.streams[3].object.output.buffer.length > 0) FS.streams[3].object.output(10);
      },standardizePath:function (path) {
        if (path.substr(0, 2) == './') path = path.substr(2);
        return path;
      },deleteFile:function (path) {
        path = FS.analyzePath(path);
        if (!path.parentExists || !path.exists) {
          throw 'Invalid path ' + path;
        }
        delete path.parentObject.contents[path.name];
      }};
  function _send(fd, buf, len, flags) {
      var info = FS.streams[fd];
      if (!info) return -1;
      info.sender(HEAPU8.subarray(buf, buf+len));
      return len;
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var contents = stream.object.contents;
        while (contents.length < offset) contents.push(0);
        for (var i = 0; i < nbyte; i++) {
          contents[offset + i] = HEAPU8[(((buf)+(i))|0)];
        }
        stream.object.timestamp = Date.now();
        return i;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (stream && ('socket' in stream)) {
          return _send(fildes, buf, nbyte, 0);
      } else if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        if (stream.object.isDevice) {
          if (stream.object.output) {
            for (var i = 0; i < nbyte; i++) {
              try {
                stream.object.output(HEAP8[(((buf)+(i))|0)]);
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
            }
            stream.object.timestamp = Date.now();
            return i;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var bytesWritten = _pwrite(fildes, buf, nbyte, stream.position);
          if (bytesWritten != -1) stream.position += bytesWritten;
          return bytesWritten;
        }
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  Module["_strlen"] = _strlen;
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }
  function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop) {
      Module['noExitRuntime'] = true;
      var steps = 0;
      var stepStart;
      var stepEnd;
      var sampleStep = false;
      function step_run(){
        // if (sampleStep) {
        //   console.log('yield time', new Date() - stepEnd);
        // }
        // steps++;
        // sampleStep = steps % 10 == 0
        // if (sampleStep) {
        //   console.log('step',steps)
        //   stepStart = new Date();
        // }
        Runtime.dynCall('v', func);
        // if (sampleStep) {
        //   stepEnd = new Date();
        //   console.log('step time',stepEnd - stepStart);
        // }
        // step_req();
        setTimeout(step_run);
      }
      function step_req() {
        // Browser.requestAnimationFrame(step_run);
        // 
        setTimeout(step_run);
      }
      step_run();
    }
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        function getMimetype(name) {
          return {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'bmp': 'image/bmp',
            'ogg': 'audio/ogg',
            'wav': 'audio/wav',
            'mp3': 'audio/mpeg'
          }[name.substr(name.lastIndexOf('.')+1)];
        }
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          if (Module["canvasFront"]) {
            var rect = Module["canvasFront"].getBoundingClientRect();
          } else {
            var rect = Module["canvas"].getBoundingClientRect();
          }
          var x = event.pageX - (window.scrollX + rect.left);
          var y = event.pageY - (window.scrollY + rect.top);
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};var SDL={defaults:{width:320,height:200,copyOnLock:true},version:null,surfaces:{},canvasPool:[],events:[],fonts:[null],audios:[null],music:{audio:null,volume:1},mixerFrequency:22050,mixerFormat:32784,mixerNumChannels:2,mixerChunkSize:1024,channelMinimumNumber:0,GL:false,keyboardState:null,keyboardMap:{},textInput:false,startTime:null,buttonState:0,modState:0,DOMButtons:[0,0,0],DOMEventToSDLEvent:{},keyCodes:{16:1249,17:1248,18:1250,33:1099,34:1102,37:1104,38:1106,39:1103,40:1105,46:127,96:1112,97:1113,98:1114,99:1115,100:1116,101:1117,102:1118,103:1119,104:1120,105:1121,112:1082,113:1083,114:1084,115:1085,116:1086,117:1087,118:1088,119:1089,120:1090,121:1091,122:1092,123:1093,173:45,188:44,190:46,191:47,192:96},scanCodes:{9:43,13:40,27:41,32:44,44:54,46:55,47:56,48:39,49:30,50:31,51:32,52:33,53:34,54:35,55:36,56:37,57:38,92:49,97:4,98:5,99:6,100:7,101:8,102:9,103:10,104:11,105:12,106:13,107:14,108:15,109:16,110:17,111:18,112:19,113:20,114:21,115:22,116:23,117:24,118:25,119:26,120:27,121:28,122:29,305:224,308:226},structs:{Rect:{__size__:16,x:0,y:4,w:8,h:12},PixelFormat:{__size__:36,format:0,palette:4,BitsPerPixel:8,BytesPerPixel:9,padding1:10,padding2:11,Rmask:12,Gmask:16,Bmask:20,Amask:24,Rloss:28,Gloss:29,Bloss:30,Aloss:31,Rshift:32,Gshift:33,Bshift:34,Ashift:35},KeyboardEvent:{__size__:16,type:0,windowID:4,state:8,repeat:9,padding2:10,padding3:11,keysym:12},keysym:{__size__:16,scancode:0,sym:4,mod:8,unicode:12},TextInputEvent:{__size__:264,type:0,windowID:4,text:8},MouseMotionEvent:{__size__:28,type:0,windowID:4,state:8,padding1:9,padding2:10,padding3:11,x:12,y:16,xrel:20,yrel:24},MouseButtonEvent:{__size__:20,type:0,windowID:4,button:8,state:9,padding1:10,padding2:11,x:12,y:16},ResizeEvent:{__size__:12,type:0,w:4,h:8},AudioSpec:{__size__:24,freq:0,format:4,channels:6,silence:7,samples:8,size:12,callback:16,userdata:20},version:{__size__:3,major:0,minor:1,patch:2}},loadRect:function (rect) {
        return {
          x: HEAP32[((rect + SDL.structs.Rect.x)>>2)],
          y: HEAP32[((rect + SDL.structs.Rect.y)>>2)],
          w: HEAP32[((rect + SDL.structs.Rect.w)>>2)],
          h: HEAP32[((rect + SDL.structs.Rect.h)>>2)]
        };
      },loadColorToCSSRGB:function (color) {
        var rgba = HEAP32[((color)>>2)];
        return 'rgb(' + (rgba&255) + ',' + ((rgba >> 8)&255) + ',' + ((rgba >> 16)&255) + ')';
      },loadColorToCSSRGBA:function (color) {
        var rgba = HEAP32[((color)>>2)];
        return 'rgba(' + (rgba&255) + ',' + ((rgba >> 8)&255) + ',' + ((rgba >> 16)&255) + ',' + (((rgba >> 24)&255)/255) + ')';
      },translateColorToCSSRGBA:function (rgba) {
        return 'rgba(' + (rgba&0xff) + ',' + (rgba>>8 & 0xff) + ',' + (rgba>>16 & 0xff) + ',' + (rgba>>>24)/0xff + ')';
      },translateRGBAToCSSRGBA:function (r, g, b, a) {
        return 'rgba(' + (r&0xff) + ',' + (g&0xff) + ',' + (b&0xff) + ',' + (a&0xff)/255 + ')';
      },translateRGBAToColor:function (r, g, b, a) {
        return r | g << 8 | b << 16 | a << 24;
      },makeSurface:function (width, height, flags, usePageCanvas, source, rmask, gmask, bmask, amask) {
        flags = flags || 0;
        var surf = _malloc(14*Runtime.QUANTUM_SIZE);  // SDL_Surface has 14 fields of quantum size
        var buffer = _malloc(width*height*4); // TODO: only allocate when locked the first time
        var pixelFormat = _malloc(18*Runtime.QUANTUM_SIZE);
        flags |= 1; // SDL_HWSURFACE - this tells SDL_MUSTLOCK that this needs to be locked
        //surface with SDL_HWPALETTE flag is 8bpp surface (1 byte)
        var is_SDL_HWPALETTE = flags & 0x00200000;  
        var bpp = is_SDL_HWPALETTE ? 1 : 4;
        HEAP32[((surf+Runtime.QUANTUM_SIZE*0)>>2)]=flags         // SDL_Surface.flags
        HEAP32[((surf+Runtime.QUANTUM_SIZE*1)>>2)]=pixelFormat // SDL_Surface.format TODO
        HEAP32[((surf+Runtime.QUANTUM_SIZE*2)>>2)]=width         // SDL_Surface.w
        HEAP32[((surf+Runtime.QUANTUM_SIZE*3)>>2)]=height        // SDL_Surface.h
        HEAP32[((surf+Runtime.QUANTUM_SIZE*4)>>2)]=width * bpp       // SDL_Surface.pitch, assuming RGBA or indexed for now,
                                                                                 // since that is what ImageData gives us in browsers
        HEAP32[((surf+Runtime.QUANTUM_SIZE*5)>>2)]=buffer      // SDL_Surface.pixels
        HEAP32[((surf+Runtime.QUANTUM_SIZE*6)>>2)]=0      // SDL_Surface.offset
        HEAP32[((pixelFormat + SDL.structs.PixelFormat.format)>>2)]=-2042224636 // SDL_PIXELFORMAT_RGBA8888
        HEAP32[((pixelFormat + SDL.structs.PixelFormat.palette)>>2)]=0 // TODO
        HEAP8[((pixelFormat + SDL.structs.PixelFormat.BitsPerPixel)|0)]=bpp * 8
        HEAP8[((pixelFormat + SDL.structs.PixelFormat.BytesPerPixel)|0)]=bpp
        HEAP32[((pixelFormat + SDL.structs.PixelFormat.Rmask)>>2)]=rmask || 0x000000ff
        HEAP32[((pixelFormat + SDL.structs.PixelFormat.Gmask)>>2)]=gmask || 0x0000ff00
        HEAP32[((pixelFormat + SDL.structs.PixelFormat.Bmask)>>2)]=bmask || 0x00ff0000
        HEAP32[((pixelFormat + SDL.structs.PixelFormat.Amask)>>2)]=amask || 0xff000000
        // Decide if we want to use WebGL or not
        var useWebGL = (flags & 0x04000000) != 0; // SDL_OPENGL
        SDL.GL = SDL.GL || useWebGL;
        var canvas;
        if (!usePageCanvas) {
          if (SDL.canvasPool.length > 0) {
            canvas = SDL.canvasPool.pop();
          } else {
            canvas = document.createElement('canvas');
          }
          canvas.width = width;
          canvas.height = height;
        } else {
          canvas = Module['canvas'];
        }
        var ctx = Browser.createContext(canvas, useWebGL, usePageCanvas);
        SDL.surfaces[surf] = {
          width: width,
          height: height,
          canvas: canvas,
          ctx: ctx,
          surf: surf,
          buffer: buffer,
          pixelFormat: pixelFormat,
          alpha: 255,
          flags: flags,
          locked: 0,
          usePageCanvas: usePageCanvas,
          source: source,
          isFlagSet: function (flag) {
            return flags & flag;
          }
        };
        return surf;
      },copyIndexedColorData:function (surfData, rX, rY, rW, rH) {
        // HWPALETTE works with palette
        // setted by SDL_SetColors
        if (!surfData.colors) {
          return;
        }
        var fullWidth  = Module['canvas'].width;
        var fullHeight = Module['canvas'].height;
        var startX  = rX || 0;
        var startY  = rY || 0;
        var endX    = (rW || (fullWidth - startX)) + startX;
        var endY    = (rH || (fullHeight - startY)) + startY;
        var buffer  = surfData.buffer;
        var data    = surfData.image.data;
        var colors  = surfData.colors;
        for (var y = startY; y < endY; ++y) {
          var indexBase = y * fullWidth;
          var colorBase = indexBase * 4;
          for (var x = startX; x < endX; ++x) {
            // HWPALETTE have only 256 colors (not rgba)
            var index = HEAPU8[((buffer + indexBase + x)|0)] * 3;
            var colorOffset = colorBase + x * 4;
            data[colorOffset   ] = colors[index   ];
            data[colorOffset +1] = colors[index +1];
            data[colorOffset +2] = colors[index +2];
            //unused: data[colorOffset +3] = color[index +3];
          }
        }
      },freeSurface:function (surf) {
        var info = SDL.surfaces[surf];
        if (!info) return; // surface has already been freed
        if (!info.usePageCanvas && info.canvas) SDL.canvasPool.push(info.canvas);
        _free(info.buffer);
        _free(info.pixelFormat);
        _free(surf);
        SDL.surfaces[surf] = null;
      },touchX:0,touchY:0,receiveEvent:function (event) {
        switch(event.type) {
          case 'touchstart':
            event.preventDefault();
            var touch = event.touches[0];
            touchX = touch.pageX;
            touchY = touch.pageY;
            var event = {
              type: 'mousedown',
              button: 0,
              pageX: touchX,
              pageY: touchY
            };
            SDL.DOMButtons[0] = 1;
            SDL.events.push(event);
            break;
          case 'touchmove':
            event.preventDefault();
            var touch = event.touches[0];
            touchX = touch.pageX;
            touchY = touch.pageY;
            event = {
              type: 'mousemove',
              button: 0,
              pageX: touchX,
              pageY: touchY
            };
            SDL.events.push(event);
            break;
          case 'touchend':
            event.preventDefault();
            event = {
              type: 'mouseup',
              button: 0,
              pageX: touchX,
              pageY: touchY
            };
            SDL.DOMButtons[0] = 0;
            SDL.events.push(event);
            break;
          case 'mousemove':
            if (Browser.pointerLock) {
              // workaround for firefox bug 750111
              if ('mozMovementX' in event) {
                event['movementX'] = event['mozMovementX'];
                event['movementY'] = event['mozMovementY'];
              }
              // workaround for Firefox bug 782777
              if (event['movementX'] == 0 && event['movementY'] == 0) {
                // ignore a mousemove event if it doesn't contain any movement info
                // (without pointer lock, we infer movement from pageX/pageY, so this check is unnecessary)
                event.preventDefault();
                return;
              }
            }
            // fall through
          case 'keydown': case 'keyup': case 'keypress': case 'mousedown': case 'mouseup': case 'DOMMouseScroll': case 'mousewheel':
            if (event.type == 'DOMMouseScroll' || event.type == 'mousewheel') {
              var button = (event.type == 'DOMMouseScroll' ? event.detail : -event.wheelDelta) > 0 ? 4 : 3;
              var event2 = {
                type: 'mousedown',
                button: button,
                pageX: event.pageX,
                pageY: event.pageY
              };
              SDL.events.push(event2);
              event = {
                type: 'mouseup',
                button: button,
                pageX: event.pageX,
                pageY: event.pageY
              };
            } else if (event.type == 'mousedown') {
              SDL.DOMButtons[event.button] = 1;
            } else if (event.type == 'mouseup') {
              // ignore extra ups, can happen if we leave the canvas while pressing down, then return,
              // since we add a mouseup in that case
              if (!SDL.DOMButtons[event.button]) {
                event.preventDefault();
                return;
              }
              SDL.DOMButtons[event.button] = 0;
            }
            if (event.type == 'keypress' && !SDL.textInput) {
              break;
            }
            SDL.events.push(event);
            break;
          case 'mouseout':
            // Un-press all pressed mouse buttons, because we might miss the release outside of the canvas
            for (var i = 0; i < 3; i++) {
              if (SDL.DOMButtons[i]) {
                SDL.events.push({
                  type: 'mouseup',
                  button: i,
                  pageX: event.pageX,
                  pageY: event.pageY
                });
                SDL.DOMButtons[i] = 0;
              }
            }
            break;
          case 'blur':
          case 'visibilitychange': {
            // Un-press all pressed keys: TODO
            for (var code in SDL.keyboardMap) {
              SDL.events.push({
                type: 'keyup',
                keyCode: SDL.keyboardMap[code]
              });
            }
            break;
          }
          case 'unload':
            if (Browser.mainLoop.runner) {
              SDL.events.push(event);
              // Force-run a main event loop, since otherwise this event will never be caught!
              Browser.mainLoop.runner();
            }
            return;
          case 'resize':
            SDL.events.push(event);
            break;
        }
        if (SDL.events.length >= 10000) {
          Module.printErr('SDL event queue full, dropping events');
          SDL.events = SDL.events.slice(0, 10000);
        }
        // manually triggered resize event doesn't have a preventDefault member
        if (event.preventDefault) {
          event.preventDefault();
        }
        return;
      },makeCEvent:function (event, ptr) {
        if (typeof event === 'number') {
          // This is a pointer to a native C event that was SDL_PushEvent'ed
          _memcpy(ptr, event, SDL.structs.KeyboardEvent.__size__); // XXX
          return;
        }
        switch(event.type) {
          case 'keydown': case 'keyup': {
            var down = event.type === 'keydown';
            //Module.print('Received key event: ' + event.keyCode);
            var key = event.keyCode;
            if (key >= 65 && key <= 90) {
              key += 32; // make lowercase for SDL
            } else {
              key = SDL.keyCodes[event.keyCode] || event.keyCode;
            }
            var scan;
            if (key >= 1024) {
              scan = key - 1024;
            } else {
              scan = SDL.scanCodes[key] || key;
            }
            var code = SDL.keyCodes[event.keyCode] || event.keyCode;
            HEAP8[(((SDL.keyboardState)+(code))|0)]=down;
            if (down) {
              SDL.keyboardMap[code] = event.keyCode; // save the DOM input, which we can use to unpress it during blur
            } else {
              delete SDL.keyboardMap[code];
            }
            // TODO: lmeta, rmeta, numlock, capslock, KMOD_MODE, KMOD_RESERVED
            SDL.modState = (HEAP8[(((SDL.keyboardState)+(1248))|0)] ? 0x0040 | 0x0080 : 0) | // KMOD_LCTRL & KMOD_RCTRL
              (HEAP8[(((SDL.keyboardState)+(1249))|0)] ? 0x0001 | 0x0002 : 0) | // KMOD_LSHIFT & KMOD_RSHIFT
              (HEAP8[(((SDL.keyboardState)+(1250))|0)] ? 0x0100 | 0x0200 : 0); // KMOD_LALT & KMOD_RALT
            HEAP32[(((ptr)+(SDL.structs.KeyboardEvent.type))>>2)]=SDL.DOMEventToSDLEvent[event.type]
            HEAP8[(((ptr)+(SDL.structs.KeyboardEvent.state))|0)]=down ? 1 : 0
            HEAP8[(((ptr)+(SDL.structs.KeyboardEvent.repeat))|0)]=0 // TODO
            HEAP32[(((ptr)+(SDL.structs.KeyboardEvent.keysym + SDL.structs.keysym.scancode))>>2)]=scan
            HEAP32[(((ptr)+(SDL.structs.KeyboardEvent.keysym + SDL.structs.keysym.sym))>>2)]=key
            HEAP32[(((ptr)+(SDL.structs.KeyboardEvent.keysym + SDL.structs.keysym.mod))>>2)]=SDL.modState
            HEAP32[(((ptr)+(SDL.structs.KeyboardEvent.keysym + SDL.structs.keysym.unicode))>>2)]=key
            break;
          }
          case 'keypress': {
            HEAP32[(((ptr)+(SDL.structs.TextInputEvent.type))>>2)]=SDL.DOMEventToSDLEvent[event.type]
            // Not filling in windowID for now
            var cStr = intArrayFromString(String.fromCharCode(event.charCode));
            for (var i = 0; i < cStr.length; ++i) {
              HEAP8[(((ptr)+(SDL.structs.TextInputEvent.text + i))|0)]=cStr[i];
            }
            break;
          }
          case 'mousedown': case 'mouseup':
            if (event.type == 'mousedown') {
              // SDL_BUTTON(x) is defined as (1 << ((x)-1)).  SDL buttons are 1-3,
              // and DOM buttons are 0-2, so this means that the below formula is
              // correct.
              SDL.buttonState |= 1 << event.button;
            } else if (event.type == 'mouseup') {
              SDL.buttonState &= ~(1 << event.button);
            }
            // fall through
          case 'mousemove': {
            Browser.calculateMouseEvent(event);
            if (event.type != 'mousemove') {
              var down = event.type === 'mousedown';
              HEAP32[(((ptr)+(SDL.structs.MouseButtonEvent.type))>>2)]=SDL.DOMEventToSDLEvent[event.type];
              HEAP8[(((ptr)+(SDL.structs.MouseButtonEvent.button))|0)]=event.button+1; // DOM buttons are 0-2, SDL 1-3
              HEAP8[(((ptr)+(SDL.structs.MouseButtonEvent.state))|0)]=down ? 1 : 0;
              HEAP32[(((ptr)+(SDL.structs.MouseButtonEvent.x))>>2)]=Browser.mouseX;
              HEAP32[(((ptr)+(SDL.structs.MouseButtonEvent.y))>>2)]=Browser.mouseY;
            } else {
              HEAP32[(((ptr)+(SDL.structs.MouseMotionEvent.type))>>2)]=SDL.DOMEventToSDLEvent[event.type];
              HEAP8[(((ptr)+(SDL.structs.MouseMotionEvent.state))|0)]=SDL.buttonState;
              HEAP32[(((ptr)+(SDL.structs.MouseMotionEvent.x))>>2)]=Browser.mouseX;
              HEAP32[(((ptr)+(SDL.structs.MouseMotionEvent.y))>>2)]=Browser.mouseY;
              HEAP32[(((ptr)+(SDL.structs.MouseMotionEvent.xrel))>>2)]=Browser.mouseMovementX;
              HEAP32[(((ptr)+(SDL.structs.MouseMotionEvent.yrel))>>2)]=Browser.mouseMovementY;
            }
            break;
          }
          case 'unload': {
            HEAP32[(((ptr)+(SDL.structs.KeyboardEvent.type))>>2)]=SDL.DOMEventToSDLEvent[event.type];
            break;
          }
          case 'resize': {
            HEAP32[(((ptr)+(SDL.structs.KeyboardEvent.type))>>2)]=SDL.DOMEventToSDLEvent[event.type];
            HEAP32[(((ptr)+(SDL.structs.ResizeEvent.w))>>2)]=event.w;
            HEAP32[(((ptr)+(SDL.structs.ResizeEvent.h))>>2)]=event.h;
            break;
          }
          default: throw 'Unhandled SDL event: ' + event.type;
        }
      },estimateTextWidth:function (fontData, text) {
        var h = fontData.size;
        var fontString = h + 'px ' + fontData.name;
        var tempCtx = SDL.ttfContext;
        tempCtx.save();
        tempCtx.font = fontString;
        var ret = tempCtx.measureText(text).width | 0;
        tempCtx.restore();
        return ret;
      },allocateChannels:function (num) { // called from Mix_AllocateChannels and init
        if (SDL.numChannels && SDL.numChannels >= num) return;
        SDL.numChannels = num;
        SDL.channels = [];
        for (var i = 0; i < num; i++) {
          SDL.channels[i] = {
            audio: null,
            volume: 1.0
          };
        }
      },setGetVolume:function (info, volume) {
        if (!info) return 0;
        var ret = info.volume * 128; // MIX_MAX_VOLUME
        if (volume != -1) {
          info.volume = volume / 128;
          if (info.audio) info.audio.volume = info.volume;
        }
        return ret;
      },debugSurface:function (surfData) {
        console.log('dumping surface ' + [surfData.surf, surfData.source, surfData.width, surfData.height]);
        var image = surfData.ctx.getImageData(0, 0, surfData.width, surfData.height);
        var data = image.data;
        var num = Math.min(surfData.width, surfData.height);
        for (var i = 0; i < num; i++) {
          console.log('   diagonal ' + i + ':' + [data[i*surfData.width*4 + i*4 + 0], data[i*surfData.width*4 + i*4 + 1], data[i*surfData.width*4 + i*4 + 2], data[i*surfData.width*4 + i*4 + 3]]);
        }
      }};function _SDL_GetMouseState(x, y) {
      if (x) HEAP32[((x)>>2)]=Browser.mouseX;
      if (y) HEAP32[((y)>>2)]=Browser.mouseY;
      return SDL.buttonState;
    }
  function _SDL_GetVideoInfo() {
      // %struct.SDL_VideoInfo = type { i32, i32, %struct.SDL_PixelFormat*, i32, i32 } - 5 fields of quantum size
      var ret = _malloc(5*Runtime.QUANTUM_SIZE);
      HEAP32[((ret+Runtime.QUANTUM_SIZE*0)>>2)]=0 // TODO
      HEAP32[((ret+Runtime.QUANTUM_SIZE*1)>>2)]=0 // TODO
      HEAP32[((ret+Runtime.QUANTUM_SIZE*2)>>2)]=0
      HEAP32[((ret+Runtime.QUANTUM_SIZE*3)>>2)]=Module["canvas"].width
      HEAP32[((ret+Runtime.QUANTUM_SIZE*4)>>2)]=Module["canvas"].height
      return ret;
    }
  function _emscripten_cancel_main_loop() {
      Browser.mainLoop.scheduler = null;
      Browser.mainLoop.shouldPause = true;
    }
  function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }
  Module["_strcat"] = _strcat;
  var _llvm_memset_p0i8_i32=_memset;
  function _fputs(s, stream) {
      // int fputs(const char *restrict s, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputs.html
      return _write(stream, s, _strlen(s));
    }
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr
      var ret = _write(stream, _fputc.ret, 1);
      if (ret == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return -1;
      } else {
        return chr;
      }
    }function _puts(s) {
      // int puts(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/puts.html
      // NOTE: puts() always writes an extra newline.
      var stdout = HEAP32[((_stdout)>>2)];
      var ret = _fputs(s, stdout);
      if (ret < 0) {
        return ret;
      } else {
        var newlineRet = _fputc(10, stdout);
        return (newlineRet < 0) ? -1 : ret + 1;
      }
    }
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
  function _strncmp(px, py, n) {
      var i = 0;
      while (i < n) {
        var x = HEAPU8[(((px)+(i))|0)];
        var y = HEAPU8[(((py)+(i))|0)];
        if (x == y && x == 0) return 0;
        if (x == 0) return -1;
        if (y == 0) return 1;
        if (x == y) {
          i ++;
          continue;
        } else {
          return x > y ? 1 : -1;
        }
      }
      return 0;
    }function _strcmp(px, py) {
      return _strncmp(px, py, TOTAL_MEMORY);
    }
  function _strdup(ptr) {
      var len = _strlen(ptr);
      var newStr = _malloc(len + 1);
      (_memcpy(newStr, ptr, len)|0);
      HEAP8[(((newStr)+(len))|0)]=0;
      return newStr;
    }
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      var flush = function(filedes) {
        // Right now we write all data directly, except for output devices.
        if (FS.streams[filedes] && FS.streams[filedes].object.output) {
          if (!FS.streams[filedes].object.isTerminal) { // don't flush terminals, it would cause a \n to also appear
            FS.streams[filedes].object.output(null);
          }
        }
      };
      try {
        if (stream === 0) {
          for (var i = 0; i < FS.streams.length; i++) if (FS.streams[i]) flush(i);
        } else {
          flush(stream);
        }
        return 0;
      } catch (e) {
        ___setErrNo(ERRNO_CODES.EIO);
        return -1;
      }
    }
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      function ExitStatus() {
        this.name = "ExitStatus";
        this.message = "Program terminated with exit(" + status + ")";
        this.status = status;
        Module.print('Exit Status: ' + status);
      };
      ExitStatus.prototype = new Error();
      ExitStatus.prototype.constructor = ExitStatus;
      exitRuntime();
      ABORT = true;
      throw new ExitStatus();
    }function _exit(status) {
      __exit(status);
    }
  var _llvm_va_start=undefined;
  function _llvm_va_end() {}
  function _isspace(chr) {
      return chr in { 32: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0 };
    }function __parseInt(str, endptr, base, min, max, bits, unsign) {
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
      // Check for a plus/minus sign.
      var multiplier = 1;
      if (HEAP8[(str)] == 45) {
        multiplier = -1;
        str++;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
      // Find base.
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            str++;
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
      // Get digits.
      var chr;
      var ret = 0;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          ret = ret * finalBase + digit;
          str++;
        }
      }
      // Apply sign.
      ret *= multiplier;
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str
      }
      // Unsign if needed.
      if (unsign) {
        if (Math.abs(ret) > max) {
          ret = max;
          ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          ret = unSign(ret, bits);
        }
      }
      // Validate range.
      if (ret > max || ret < min) {
        ret = ret > max ? max : min;
        ___setErrNo(ERRNO_CODES.ERANGE);
      }
      if (bits == 64) {
        return ((asm["setTempRet0"](((Math.min((+(Math.floor((ret)/(+(4294967296))))), (+(4294967295))))|0)>>>0),ret>>>0)|0);
      }
      return ret;
    }function _strtoul(str, endptr, base) {
      return __parseInt(str, endptr, base, 0, 4294967295, 32, true);  // ULONG_MAX.
    }
  function _atexit(func, arg) {
      __ATEXIT__.unshift({ func: func, arg: arg });
    }
  function _SDL_Init(what) {
      SDL.startTime = Date.now();
      // capture all key events. we just keep down and up, but also capture press to prevent default actions
      if (!Module['doNotCaptureKeyboard']) {
        document.addEventListener("keydown", SDL.receiveEvent);
        document.addEventListener("keyup", SDL.receiveEvent);
        document.addEventListener("keypress", SDL.receiveEvent);
        document.addEventListener("blur", SDL.receiveEvent);
        document.addEventListener("visibilitychange", SDL.receiveEvent);
      }
      window.addEventListener("unload", SDL.receiveEvent);
      SDL.keyboardState = _malloc(0x10000); // Our SDL needs 512, but 64K is safe for older SDLs
      _memset(SDL.keyboardState, 0, 0x10000);
      // Initialize this structure carefully for closure
      SDL.DOMEventToSDLEvent['keydown'] = 0x300 /* SDL_KEYDOWN */;
      SDL.DOMEventToSDLEvent['keyup'] = 0x301 /* SDL_KEYUP */;
      SDL.DOMEventToSDLEvent['keypress'] = 0x303 /* SDL_TEXTINPUT */;
      SDL.DOMEventToSDLEvent['mousedown'] = 0x401 /* SDL_MOUSEBUTTONDOWN */;
      SDL.DOMEventToSDLEvent['mouseup'] = 0x402 /* SDL_MOUSEBUTTONUP */;
      SDL.DOMEventToSDLEvent['mousemove'] = 0x400 /* SDL_MOUSEMOTION */;
      SDL.DOMEventToSDLEvent['unload'] = 0x100 /* SDL_QUIT */;
      SDL.DOMEventToSDLEvent['resize'] = 0x7001 /* SDL_VIDEORESIZE/SDL_EVENT_COMPAT2 */;
      return 0; // success
    }
  function _signal(sig, func) {
      // TODO
      return 0;
    }
  var ___dirent_struct_layout={__size__:1040,d_ino:0,d_name:4,d_off:1028,d_reclen:1032,d_type:1036};function _open(path, oflag, varargs) {
      // int open(const char *path, int oflag, ...);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/open.html
      // NOTE: This implementation tries to mimic glibc rather than strictly
      // following the POSIX standard.
      var mode = HEAP32[((varargs)>>2)];
      // Simplify flags.
      var accessMode = oflag & 3;
      var isWrite = accessMode != 0;
      var isRead = accessMode != 1;
      var isCreate = Boolean(oflag & 512);
      var isExistCheck = Boolean(oflag & 2048);
      var isTruncate = Boolean(oflag & 1024);
      var isAppend = Boolean(oflag & 8);
      // Verify path.
      var origPath = path;
      path = FS.analyzePath(Pointer_stringify(path));
      if (!path.parentExists) {
        ___setErrNo(path.error);
        return -1;
      }
      var target = path.object || null;
      var finalPath;
      // Verify the file exists, create if needed and allowed.
      if (target) {
        if (isCreate && isExistCheck) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          return -1;
        }
        if ((isWrite || isTruncate) && target.isFolder) {
          ___setErrNo(ERRNO_CODES.EISDIR);
          return -1;
        }
        if (isRead && !target.read || isWrite && !target.write) {
          ___setErrNo(ERRNO_CODES.EACCES);
          return -1;
        }
        if (isTruncate && !target.isDevice) {
          target.contents = [];
        } else {
          if (!FS.forceLoadFile(target)) {
            ___setErrNo(ERRNO_CODES.EIO);
            return -1;
          }
        }
        finalPath = path.path;
      } else {
        if (!isCreate) {
          ___setErrNo(ERRNO_CODES.ENOENT);
          return -1;
        }
        if (!path.parentObject.write) {
          ___setErrNo(ERRNO_CODES.EACCES);
          return -1;
        }
        target = FS.createDataFile(path.parentObject, path.name, [],
                                   mode & 0x100, mode & 0x80);  // S_IRUSR, S_IWUSR.
        finalPath = path.parentPath + '/' + path.name;
      }
      // Actually create an open stream.
      var id;
      if (target.isFolder) {
        var entryBuffer = 0;
        if (___dirent_struct_layout) {
          entryBuffer = _malloc(___dirent_struct_layout.__size__);
        }
        var contents = [];
        for (var key in target.contents) contents.push(key);
        id = FS.createFileHandle({
          path: finalPath,
          object: target,
          // An index into contents. Special values: -2 is ".", -1 is "..".
          position: -2,
          isRead: true,
          isWrite: false,
          isAppend: false,
          error: false,
          eof: false,
          ungotten: [],
          // Folder-specific properties:
          // Remember the contents at the time of opening in an array, so we can
          // seek between them relying on a single order.
          contents: contents,
          // Each stream has its own area for readdir() returns.
          currentEntry: entryBuffer
        });
      } else {
        id = FS.createFileHandle({
          path: finalPath,
          object: target,
          position: 0,
          isRead: isRead,
          isWrite: isWrite,
          isAppend: isAppend,
          error: false,
          eof: false,
          ungotten: []
        });
      }
      return id;
    }function _fopen(filename, mode) {
      // FILE *fopen(const char *restrict filename, const char *restrict mode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fopen.html
      var flags;
      mode = Pointer_stringify(mode);
      if (mode[0] == 'r') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 0;
        }
      } else if (mode[0] == 'w') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 512;
        flags |= 1024;
      } else if (mode[0] == 'a') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 512;
        flags |= 8;
      } else {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return 0;
      }
      var ret = _open(filename, flags, allocate([0x1FF, 0, 0, 0], 'i32', ALLOC_STACK));  // All creation permissions.
      return (ret == -1) ? 0 : ret;
    }
  function _recv(fd, buf, len, flags) {
      var info = FS.streams[fd];
      if (!info) return -1;
      if (!info.hasData()) {
        ___setErrNo(ERRNO_CODES.EAGAIN); // no data, and all sockets are nonblocking, so this is the right behavior
        return -1;
      }
      var buffer = info.inQueue.shift();
      if (len < buffer.length) {
        if (info.stream) {
          // This is tcp (reliable), so if not all was read, keep it
          info.inQueue.unshift(buffer.subarray(len));
        }
        buffer = buffer.subarray(0, len);
      }
      HEAPU8.set(buffer, buf);
      return buffer.length;
    }
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isRead) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var bytesRead = 0;
        while (stream.ungotten.length && nbyte > 0) {
          HEAP8[((buf++)|0)]=stream.ungotten.pop()
          nbyte--;
          bytesRead++;
        }
        var contents = stream.object.contents;
        var size = Math.min(contents.length - offset, nbyte);
        if (contents.subarray) { // typed array
          HEAPU8.set(contents.subarray(offset, offset+size), buf);
        } else
        if (contents.slice) { // normal array
          for (var i = 0; i < size; i++) {
            HEAP8[(((buf)+(i))|0)]=contents[offset + i]
          }
        } else {
          for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
            HEAP8[(((buf)+(i))|0)]=contents.get(offset + i)
          }
        }
        bytesRead += size;
        return bytesRead;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.streams[fildes];
      if (stream && ('socket' in stream)) {
        return _recv(fildes, buf, nbyte, 0);
      } else if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isRead) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var bytesRead;
        if (stream.object.isDevice) {
          if (stream.object.input) {
            bytesRead = 0;
            while (stream.ungotten.length && nbyte > 0) {
              HEAP8[((buf++)|0)]=stream.ungotten.pop()
              nbyte--;
              bytesRead++;
            }
            for (var i = 0; i < nbyte; i++) {
              try {
                var result = stream.object.input();
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
              if (result === undefined && bytesRead === 0) {
                ___setErrNo(ERRNO_CODES.EAGAIN);
                return -1;
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              HEAP8[(((buf)+(i))|0)]=result
            }
            return bytesRead;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var ungotSize = stream.ungotten.length;
          bytesRead = _pread(fildes, buf, nbyte, stream.position);
          if (bytesRead != -1) {
            stream.position += (stream.ungotten.length - ungotSize) + bytesRead;
          }
          return bytesRead;
        }
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) return 0;
      var bytesRead = _read(stream, ptr, bytesToRead);
      var streamObj = FS.streams[stream];
      if (bytesRead == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        if (bytesRead < bytesToRead) streamObj.eof = true;
        return Math.floor(bytesRead / size);
      }
    }
  function _close(fildes) {
      // int close(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/close.html
      if (FS.streams[fildes]) {
        if (FS.streams[fildes].currentEntry) {
          _free(FS.streams[fildes].currentEntry);
        }
        FS.streams[fildes] = null;
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }
  function _fsync(fildes) {
      // int fsync(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fsync.html
      if (FS.streams[fildes]) {
        // We write directly to the file system, so there's nothing to do here.
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fclose(stream) {
      // int fclose(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fclose.html
      _fsync(stream);
      return _close(stream);
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  Module["_memcmp"] = _memcmp;
  Module["_strcpy"] = _strcpy;
  function _lseek(fildes, offset, whence) {
      // off_t lseek(int fildes, off_t offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/lseek.html
      if (FS.streams[fildes] && !FS.streams[fildes].object.isDevice) {
        var stream = FS.streams[fildes];
        var position = offset;
        if (whence === 1) {  // SEEK_CUR.
          position += stream.position;
        } else if (whence === 2) {  // SEEK_END.
          position += stream.object.contents.length;
        }
        if (position < 0) {
          ___setErrNo(ERRNO_CODES.EINVAL);
          return -1;
        } else {
          stream.ungotten = [];
          stream.position = position;
          return position;
        }
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fseek(stream, offset, whence) {
      // int fseek(FILE *stream, long offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fseek.html
      var ret = _lseek(stream, offset, whence);
      if (ret == -1) {
        return -1;
      } else {
        FS.streams[stream].eof = false;
        return 0;
      }
    }
  function _ftell(stream) {
      // long ftell(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ftell.html
      if (FS.streams[stream]) {
        stream = FS.streams[stream];
        if (stream.object.isDevice) {
          ___setErrNo(ERRNO_CODES.ESPIPE);
          return -1;
        } else {
          return stream.position;
        }
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }
  function _truncate(path, length) {
      // int truncate(const char *path, off_t length);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/truncate.html
      // NOTE: The path argument may be a string, to simplify ftruncate().
      if (length < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        if (typeof path !== 'string') path = Pointer_stringify(path);
        var target = FS.findObject(path);
        if (target === null) return -1;
        if (target.isFolder) {
          ___setErrNo(ERRNO_CODES.EISDIR);
          return -1;
        } else if (target.isDevice) {
          ___setErrNo(ERRNO_CODES.EINVAL);
          return -1;
        } else if (!target.write) {
          ___setErrNo(ERRNO_CODES.EACCES);
          return -1;
        } else {
          var contents = target.contents;
          if (length < contents.length) contents.length = length;
          else while (length > contents.length) contents.push(0);
          target.timestamp = Date.now();
          return 0;
        }
      }
    }function _ftruncate(fildes, length) {
      // int ftruncate(int fildes, off_t length);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ftruncate.html
      if (FS.streams[fildes] && FS.streams[fildes].isWrite) {
        return _truncate(FS.streams[fildes].path, length);
      } else if (FS.streams[fildes]) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      // We use file descriptor numbers and FILE* streams interchangeably.
      return stream;
    }
  var _putc=_fputc;
  var ___pollfd_struct_layout={__size__:8,fd:0,events:4,revents:6};function _poll(fds, nfds, timeout) {
      // int poll(struct pollfd fds[], nfds_t nfds, int timeout);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/poll.html
      // NOTE: This is pretty much a no-op mimicking glibc.
      var offsets = ___pollfd_struct_layout;
      var nonzero = 0;
      for (var i = 0; i < nfds; i++) {
        var pollfd = fds + ___pollfd_struct_layout.__size__ * i;
        var fd = HEAP32[(((pollfd)+(offsets.fd))>>2)];
        var events = HEAP16[(((pollfd)+(offsets.events))>>1)];
        var revents = 0;
        if (FS.streams[fd]) {
          var stream = FS.streams[fd];
          if (events & 1) revents |= 1;
          if (events & 2) revents |= 2;
        } else {
          if (events & 4) revents |= 4;
        }
        if (revents) nonzero++;
        HEAP16[(((pollfd)+(offsets.revents))>>1)]=revents
      }
      return nonzero;
    }
  function _unlink(path) {
      // int unlink(const char *path);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/unlink.html
      path = FS.analyzePath(Pointer_stringify(path));
      if (!path.parentExists || !path.exists) {
        ___setErrNo(path.error);
        return -1;
      } else if (path.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (!path.object.write) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else {
        delete path.parentObject.contents[path.name];
        return 0;
      }
    }
  function _posix_openpt() {
  Module['printErr']('missing function: posix_openpt'); abort(-1);
  }
  function _symlink(path1, path2) {
      // int symlink(const char *path1, const char *path2);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/symlink.html
      var path = FS.analyzePath(Pointer_stringify(path2), true);
      if (!path.parentExists) {
        ___setErrNo(path.error);
        return -1;
      } else if (path.exists) {
        ___setErrNo(ERRNO_CODES.EEXIST);
        return -1;
      } else {
        FS.createLink(path.parentPath, path.name,
                      Pointer_stringify(path1), true, true);
        return 0;
      }
    }
  function _tcgetattr() {
  Module['printErr']('missing function: tcgetattr'); abort(-1);
  }
  function _tcsetattr() {
  Module['printErr']('missing function: tcsetattr'); abort(-1);
  }
  function _tcflush() {
  Module['printErr']('missing function: tcflush'); abort(-1);
  }
  var ___flock_struct_layout={__size__:16,l_type:0,l_whence:2,l_start:4,l_len:8,l_pid:12,l_xxx:14};function _fcntl(fildes, cmd, varargs, dup2) {
      // int fcntl(int fildes, int cmd, ...);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/fcntl.html
      if (!FS.streams[fildes]) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      var stream = FS.streams[fildes];
      switch (cmd) {
        case 0:
          var arg = HEAP32[((varargs)>>2)];
          if (arg < 0) {
            ___setErrNo(ERRNO_CODES.EINVAL);
            return -1;
          }
          var newStream = {};
          for (var member in stream) {
            newStream[member] = stream[member];
          }
          arg = dup2 ? arg : Math.max(arg, FS.streams.length); // dup2 wants exactly arg; fcntl wants a free descriptor >= arg
          FS.createFileHandle(newStream, arg);
          return arg;
        case 1:
        case 2:
          return 0;  // FD_CLOEXEC makes no sense for a single process.
        case 3:
          var flags = 0;
          if (stream.isRead && stream.isWrite) flags = 2;
          else if (!stream.isRead && stream.isWrite) flags = 1;
          else if (stream.isRead && !stream.isWrite) flags = 0;
          if (stream.isAppend) flags |= 8;
          // Synchronization and blocking flags are irrelevant to us.
          return flags;
        case 4:
          var arg = HEAP32[((varargs)>>2)];
          stream.isAppend = Boolean(arg | 8);
          // Synchronization and blocking flags are irrelevant to us.
          return 0;
        case 7:
        case 20:
          var arg = HEAP32[((varargs)>>2)];
          var offset = ___flock_struct_layout.l_type;
          // We're always unlocked.
          HEAP16[(((arg)+(offset))>>1)]=3
          return 0;
        case 8:
        case 9:
        case 21:
        case 22:
          // Pretend that the locking is successful.
          return 0;
        case 6:
        case 5:
          // These are for sockets. We don't have them fully implemented yet.
          ___setErrNo(ERRNO_CODES.EINVAL);
          return -1;
        default:
          ___setErrNo(ERRNO_CODES.EINVAL);
          return -1;
      }
      // Should never be reached. Only to silence strict warnings.
      return -1;
    }
  function _grantpt() {
  Module['printErr']('missing function: grantpt'); abort(-1);
  }
  function _unlockpt() {
  Module['printErr']('missing function: unlockpt'); abort(-1);
  }
  function _ptsname() {
  Module['printErr']('missing function: ptsname'); abort(-1);
  }
  Module["_tolower"] = _tolower; 
  Module["_strncasecmp"] = _strncasecmp; 
  Module["_strcasecmp"] = _strcasecmp;
  var ___tm_struct_layout={__size__:44,tm_sec:0,tm_min:4,tm_hour:8,tm_mday:12,tm_mon:16,tm_year:20,tm_wday:24,tm_yday:28,tm_isdst:32,tm_gmtoff:36,tm_zone:40};
  var ___tm_current=allocate(4*26, "i8", ALLOC_STATIC);
  var ___tm_timezones={};
  var __tzname=allocate(8, "i32*", ALLOC_STATIC);
  var __daylight=allocate(1, "i32*", ALLOC_STATIC);
  var __timezone=allocate(1, "i32*", ALLOC_STATIC);function _tzset() {
      // TODO: Use (malleable) environment variables instead of system settings.
      if (_tzset.called) return;
      _tzset.called = true;
      HEAP32[((__timezone)>>2)]=-(new Date()).getTimezoneOffset() * 60
      var winter = new Date(2000, 0, 1);
      var summer = new Date(2000, 6, 1);
      HEAP32[((__daylight)>>2)]=Number(winter.getTimezoneOffset() != summer.getTimezoneOffset())
      var winterName = 'GMT'; // XXX do not rely on browser timezone info, it is very unpredictable | winter.toString().match(/\(([A-Z]+)\)/)[1];
      var summerName = 'GMT'; // XXX do not rely on browser timezone info, it is very unpredictable | summer.toString().match(/\(([A-Z]+)\)/)[1];
      var winterNamePtr = allocate(intArrayFromString(winterName), 'i8', ALLOC_NORMAL);
      var summerNamePtr = allocate(intArrayFromString(summerName), 'i8', ALLOC_NORMAL);
      HEAP32[((__tzname)>>2)]=winterNamePtr
      HEAP32[(((__tzname)+(4))>>2)]=summerNamePtr
    }function _localtime_r(time, tmPtr) {
      _tzset();
      var offsets = ___tm_struct_layout;
      var date = new Date(HEAP32[((time)>>2)]*1000);
      HEAP32[(((tmPtr)+(offsets.tm_sec))>>2)]=date.getSeconds()
      HEAP32[(((tmPtr)+(offsets.tm_min))>>2)]=date.getMinutes()
      HEAP32[(((tmPtr)+(offsets.tm_hour))>>2)]=date.getHours()
      HEAP32[(((tmPtr)+(offsets.tm_mday))>>2)]=date.getDate()
      HEAP32[(((tmPtr)+(offsets.tm_mon))>>2)]=date.getMonth()
      HEAP32[(((tmPtr)+(offsets.tm_year))>>2)]=date.getFullYear()-1900
      HEAP32[(((tmPtr)+(offsets.tm_wday))>>2)]=date.getDay()
      var start = new Date(date.getFullYear(), 0, 1);
      var yday = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      HEAP32[(((tmPtr)+(offsets.tm_yday))>>2)]=yday
      HEAP32[(((tmPtr)+(offsets.tm_gmtoff))>>2)]=start.getTimezoneOffset() * 60
      var dst = Number(start.getTimezoneOffset() != date.getTimezoneOffset());
      HEAP32[(((tmPtr)+(offsets.tm_isdst))>>2)]=dst
      var timezone = 'GMT'; // XXX do not rely on browser timezone info, it is very unpredictable | date.toString().match(/\(([A-Z]+)\)/)[1];
      if (!(timezone in ___tm_timezones)) {
        ___tm_timezones[timezone] = allocate(intArrayFromString(timezone), 'i8', ALLOC_NORMAL);
      }
      HEAP32[(((tmPtr)+(offsets.tm_zone))>>2)]=___tm_timezones[timezone]
      return tmPtr;
    }function _localtime(time) {
      return _localtime_r(time, ___tm_current);
    }
  function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      if (!FS.streams[stream]) return -1;
      var streamObj = FS.streams[stream];
      if (streamObj.eof || streamObj.error) return -1;
      var ret = _read(stream, _fgetc.ret, 1);
      if (ret == 0) {
        streamObj.eof = true;
        return -1;
      } else if (ret == -1) {
        streamObj.error = true;
        return -1;
      } else {
        return HEAPU8[((_fgetc.ret)|0)];
      }
    }
  function _gmtime_r(time, tmPtr) {
      var date = new Date(HEAP32[((time)>>2)]*1000);
      var offsets = ___tm_struct_layout;
      HEAP32[(((tmPtr)+(offsets.tm_sec))>>2)]=date.getUTCSeconds()
      HEAP32[(((tmPtr)+(offsets.tm_min))>>2)]=date.getUTCMinutes()
      HEAP32[(((tmPtr)+(offsets.tm_hour))>>2)]=date.getUTCHours()
      HEAP32[(((tmPtr)+(offsets.tm_mday))>>2)]=date.getUTCDate()
      HEAP32[(((tmPtr)+(offsets.tm_mon))>>2)]=date.getUTCMonth()
      HEAP32[(((tmPtr)+(offsets.tm_year))>>2)]=date.getUTCFullYear()-1900
      HEAP32[(((tmPtr)+(offsets.tm_wday))>>2)]=date.getUTCDay()
      HEAP32[(((tmPtr)+(offsets.tm_gmtoff))>>2)]=0
      HEAP32[(((tmPtr)+(offsets.tm_isdst))>>2)]=0
      var start = new Date(date.getFullYear(), 0, 1);
      var yday = Math.round((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      HEAP32[(((tmPtr)+(offsets.tm_yday))>>2)]=yday
      var timezone = "GMT";
      if (!(timezone in ___tm_timezones)) {
        ___tm_timezones[timezone] = allocate(intArrayFromString(timezone), 'i8', ALLOC_NORMAL);
      }
      HEAP32[(((tmPtr)+(offsets.tm_zone))>>2)]=___tm_timezones[timezone]
      return tmPtr;
    }function _gmtime(time) {
      return _gmtime_r(time, ___tm_current);
    }
  var _tan=Math.tan;
  function _SDL_PauseAudio(pauseOn) {
      if (SDL.audio.paused !== pauseOn) {
        SDL.audio.timer = pauseOn ? SDL.audio.timer && clearInterval(SDL.audio.timer) : Browser.safeSetInterval(SDL.audio.caller, 1/35);
      }
      SDL.audio.paused = pauseOn;
    }function _SDL_CloseAudio() {
      if (SDL.audio) {
        _SDL_PauseAudio(1);
        _free(SDL.audio.buffer);
        SDL.audio = null;
      }
    }
  function _SDL_WasInit() {
      if (SDL.startTime === null) {
        _SDL_Init();
      }
      return 1;
    }
  function _SDL_InitSubSystem(flags) { return 0 }
  function _SDL_GetError() {
      if (!SDL.errorMessage) {
        SDL.errorMessage = allocate(intArrayFromString("unknown SDL-emscripten error"), 'i8', ALLOC_NORMAL);
      }
      return SDL.errorMessage;
    }
  function _SDL_OpenAudio(desired, obtained) {
      SDL.allocateChannels(32);
      SDL.audio = {
        freq: HEAPU32[(((desired)+(SDL.structs.AudioSpec.freq))>>2)],
        format: HEAPU16[(((desired)+(SDL.structs.AudioSpec.format))>>1)],
        channels: HEAPU8[(((desired)+(SDL.structs.AudioSpec.channels))|0)],
        samples: HEAPU16[(((desired)+(SDL.structs.AudioSpec.samples))>>1)],
        callback: HEAPU32[(((desired)+(SDL.structs.AudioSpec.callback))>>2)],
        userdata: HEAPU32[(((desired)+(SDL.structs.AudioSpec.userdata))>>2)],
        paused: true,
        timer: null
      };
      if (obtained) {
        HEAP32[(((obtained)+(SDL.structs.AudioSpec.freq))>>2)]=SDL.audio.freq; // no good way for us to know if the browser can really handle this
        HEAP16[(((obtained)+(SDL.structs.AudioSpec.format))>>1)]=33040; // float, signed, 16-bit
        HEAP8[(((obtained)+(SDL.structs.AudioSpec.channels))|0)]=SDL.audio.channels;
        HEAP8[(((obtained)+(SDL.structs.AudioSpec.silence))|0)]=HEAPU8[(((desired)+(SDL.structs.AudioSpec.silence))|0)]; // unclear if browsers can provide this
        HEAP16[(((obtained)+(SDL.structs.AudioSpec.samples))>>1)]=SDL.audio.samples;
        HEAP32[(((obtained)+(SDL.structs.AudioSpec.callback))>>2)]=SDL.audio.callback;
        HEAP32[(((obtained)+(SDL.structs.AudioSpec.userdata))>>2)]=SDL.audio.userdata;
      }
      var totalSamples = SDL.audio.samples*SDL.audio.channels;
      SDL.audio.bufferSize = totalSamples*2; // hardcoded 16-bit audio
      SDL.audio.buffer = _malloc(SDL.audio.bufferSize);
      SDL.audio.caller = function() {
        Runtime.dynCall('viii', SDL.audio.callback, [SDL.audio.userdata, SDL.audio.buffer, SDL.audio.bufferSize]);
        SDL.audio.pushAudio(SDL.audio.buffer, SDL.audio.bufferSize);
      };
      // Mozilla Audio API. TODO: Other audio APIs
      try {
        SDL.audio.mozOutput = new Audio();
        SDL.audio.mozOutput['mozSetup'](SDL.audio.channels, SDL.audio.freq); // use string attributes on mozOutput for closure compiler
        SDL.audio.mozBuffer = new Float32Array(totalSamples);
        SDL.audio.pushAudio = function(ptr, size) {
          var mozBuffer = SDL.audio.mozBuffer;
          for (var i = 0; i < totalSamples; i++) {
            mozBuffer[i] = (HEAP16[(((ptr)+(i*2))>>1)]) / 0x8000; // hardcoded 16-bit audio, signed (TODO: reSign if not ta2?)
          }
          SDL.audio.mozOutput['mozWriteAudio'](mozBuffer);
        }
      } catch(e) {
        SDL.audio = null;
      }
      if (!SDL.audio) return -1;
      return 0;
    }
  function _SDL_LockAudio() {}
  function _SDL_UnlockAudio() {}
  function _strtol(str, endptr, base) {
      return __parseInt(str, endptr, base, -2147483648, 2147483647, 32);  // LONG_MIN, LONG_MAX.
    }
  function _vfprintf(s, f, va_arg) {
      return _fprintf(s, f, HEAP32[((va_arg)>>2)]);
    }
  function _strchr(ptr, chr) {
      ptr--;
      do {
        ptr++;
        var val = HEAP8[(ptr)];
        if (val == chr) return ptr;
      } while (val);
      return 0;
    }
  function _usleep(useconds) {
      // int usleep(useconds_t useconds);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/usleep.html
      // We're single-threaded, so use a busy loop. Super-ugly.
      var msec = useconds / 1000;
      var start = Date.now();
      while (Date.now() - start < msec) {
        // Do nothing.
      }
      return 0;
    }
  var ___timespec_struct_layout={__size__:8,tv_sec:0,tv_nsec:4};function _nanosleep(rqtp, rmtp) {
      // int nanosleep(const struct timespec  *rqtp, struct timespec *rmtp);
      var seconds = HEAP32[(((rqtp)+(___timespec_struct_layout.tv_sec))>>2)];
      var nanoseconds = HEAP32[(((rqtp)+(___timespec_struct_layout.tv_nsec))>>2)];
      HEAP32[(((rmtp)+(___timespec_struct_layout.tv_sec))>>2)]=0
      HEAP32[(((rmtp)+(___timespec_struct_layout.tv_nsec))>>2)]=0
      return _usleep((seconds * 1e6) + (nanoseconds / 1000));
    }
  function _gettimeofday(ptr) {
      // %struct.timeval = type { i32, i32 }
      var now = Date.now();
      HEAP32[((ptr)>>2)]=Math.floor(now/1000); // seconds
      HEAP32[(((ptr)+(4))>>2)]=Math.floor((now-1000*Math.floor(now/1000))*1000); // microseconds
      return 0;
    }
  function _SDL_PollEvent(ptr) {
      if (SDL.events.length === 0) return 0;
      if (ptr) {
        SDL.makeCEvent(SDL.events.shift(), ptr);
      }
      return 1;
    }
  function _SDL_ShowCursor(toggle) {
      switch (toggle) {
        case 0: // SDL_DISABLE
          if (Browser.isFullScreen) { // only try to lock the pointer when in full screen mode
            Module['canvas'].requestPointerLock();
            return 0;
          } else { // else return SDL_ENABLE to indicate the failure
            return 1;
          }
          break;
        case 1: // SDL_ENABLE
          Module['canvas'].exitPointerLock();
          return 1;
          break;
        case -1: // SDL_QUERY
          return !Browser.pointerLock;
          break;
        default:
          console.log( "SDL_ShowCursor called with unknown toggle parameter value: " + toggle + "." );
          break;
      }
    }
  function _SDL_WM_GrabInput() {}
  function _SDL_WM_ToggleFullScreen(surf) {
      if (Browser.isFullScreen) {
        Module['canvas'].cancelFullScreen();
        return 1;
      } else {
        return 0;
      }
    }
  function _SDL_CreateRGBSurfaceFrom(pixels, width, height, depth, pitch, rmask, gmask, bmask, amask) {
      // TODO: Take into account depth and pitch parameters.
      var surface = SDL.makeSurface(width, height, 0, false, 'CreateRGBSurfaceFrom', rmask, gmask, bmask, amask);
      var surfaceData = SDL.surfaces[surface];
      var surfaceImageData = surfaceData.ctx.getImageData(0, 0, width, height);
      var surfacePixelData = surfaceImageData.data;
      // Fill pixel data to created surface.
      // Supports SDL_PIXELFORMAT_RGBA8888 and SDL_PIXELFORMAT_RGB888
      var channels = amask ? 4 : 3; // RGBA8888 or RGB888
      for (var pixelOffset = 0; pixelOffset < width*height; pixelOffset++) {
        surfacePixelData[pixelOffset*4+0] = HEAPU8[pixels + (pixelOffset*channels+0)]; // R
        surfacePixelData[pixelOffset*4+1] = HEAPU8[pixels + (pixelOffset*channels+1)]; // G
        surfacePixelData[pixelOffset*4+2] = HEAPU8[pixels + (pixelOffset*channels+2)]; // B
        surfacePixelData[pixelOffset*4+3] = amask ? HEAPU8[pixels + (pixelOffset*channels+3)] : 0xff; // A
      };
      surfaceData.ctx.putImageData(surfaceImageData, 0, 0);
      return surface;
    }
  function _SDL_UpperBlit(src, srcrect, dst, dstrect) {
      var srcData = SDL.surfaces[src];
      var dstData = SDL.surfaces[dst];
      var sr, dr;
      if (srcrect) {
        sr = SDL.loadRect(srcrect);
      } else {
        sr = { x: 0, y: 0, w: srcData.width, h: srcData.height };
      }
      if (dstrect) {
        dr = SDL.loadRect(dstrect);
      } else {
        dr = { x: 0, y: 0, w: -1, h: -1 };
      }
      dstData.ctx.drawImage(srcData.canvas, sr.x, sr.y, sr.w, sr.h, dr.x, dr.y, sr.w, sr.h);
      if (dst != SDL.screen) {
        // XXX As in IMG_Load, for compatibility we write out |pixels|
        console.log('WARNING: copying canvas data to memory for compatibility');
        _SDL_LockSurface(dst);
        dstData.locked--; // The surface is not actually locked in this hack
      }
      return 0;
    }
  function _SDL_FreeSurface(surf) {
      if (surf) SDL.freeSurface(surf);
    }
  function _SDL_Flip(surf) {
      // We actually do this in Unlock, since the screen surface has as its canvas
      // backing the page canvas element
    }
  function _SDL_SetVideoMode(width, height, depth, flags) {
      ['mousedown', 'mouseup', 'mousemove', 'DOMMouseScroll', 'mousewheel', 'mouseout'].forEach(function(event) {
        if (Module["canvasFront"]) {
          Module['canvasFront'].addEventListener(event, SDL.receiveEvent, true);
        } else {
          Module['canvas'].addEventListener(event, SDL.receiveEvent, true);
        }
      });
      Browser.setCanvasSize(width, height, true);
      // Free the old surface first.
      if (SDL.screen) {
        SDL.freeSurface(SDL.screen);
        SDL.screen = null;
      }
      SDL.screen = SDL.makeSurface(width, height, flags, true, 'screen');
      if (!SDL.addedResizeListener) {
        SDL.addedResizeListener = true;
        Browser.resizeListeners.push(function(w, h) {
          SDL.receiveEvent({
            type: 'resize',
            w: w,
            h: h
          });
        });
      }
      return SDL.screen;
    }
  function _SDL_WM_SetCaption(title, icon) {
      title = title && Pointer_stringify(title);
      icon = icon && Pointer_stringify(icon);
    }
  function _SDL_EnableKeyRepeat(delay, interval) {
      // TODO
    }
  function _SDL_EventState() {}
  function _abort() {
      ABORT = true;
      throw 'abort() at ' + (new Error().stack);
    }
  function ___errno_location() {
      return ___errno_state;
    }var ___errno=___errno_location;
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
 var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);
var Math_min = Math.min;
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module["dynCall_iiiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return Module["dynCall_iiiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.ctlz_i8|0;var o=env._stdout|0;var p=env._stdin|0;var q=env._stderr|0;var r=+env.NaN;var s=+env.Infinity;var t=0;var u=0;var v=0;var w=0;var x=0,y=0,z=0,A=0,B=0.0,C=0,D=0,E=0,F=0.0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=0;var O=0;var P=0;var Q=global.Math.floor;var R=global.Math.abs;var S=global.Math.sqrt;var T=global.Math.pow;var U=global.Math.cos;var V=global.Math.sin;var W=global.Math.tan;var X=global.Math.acos;var Y=global.Math.asin;var Z=global.Math.atan;var _=global.Math.atan2;var $=global.Math.exp;var aa=global.Math.log;var ab=global.Math.ceil;var ac=global.Math.imul;var ad=env.abort;var ae=env.assert;var af=env.asmPrintInt;var ag=env.asmPrintFloat;var ah=env.min;var ai=env.invoke_ii;var aj=env.invoke_viiiii;var ak=env.invoke_vi;var al=env.invoke_vii;var am=env.invoke_iiii;var an=env.invoke_viii;var ao=env.invoke_v;var ap=env.invoke_iiiii;var aq=env.invoke_iii;var ar=env.invoke_iiiiii;var as=env.invoke_viiii;var at=env._llvm_lifetime_end;var au=env._lseek;var av=env._fclose;var aw=env._SDL_EventState;var ax=env._strtoul;var ay=env._fflush;var az=env._SDL_GetMouseState;var aA=env._strtol;var aB=env._fputc;var aC=env._fwrite;var aD=env._ptsname;var aE=env._send;var aF=env._tcflush;var aG=env._fputs;var aH=env._emscripten_cancel_main_loop;var aI=env._SDL_UnlockAudio;var aJ=env._SDL_WasInit;var aK=env._read;var aL=env._fileno;var aM=env._fsync;var aN=env._signal;var aO=env._SDL_PauseAudio;var aP=env._SDL_LockAudio;var aQ=env._strcmp;var aR=env._strncmp;var aS=env._snprintf;var aT=env._fgetc;var aU=env._atexit;var aV=env._close;var aW=env._tcsetattr;var aX=env._strchr;var aY=env._tcgetattr;var aZ=env._poll;var a_=env.___setErrNo;var a$=env._grantpt;var a0=env._ftell;var a1=env._exit;var a2=env._sprintf;var a3=env._fcntl;var a4=env._SDL_ShowCursor;var a5=env._gmtime;var a6=env._symlink;var a7=env._localtime_r;var a8=env._ftruncate;var a9=env._recv;var ba=env._SDL_PollEvent;var bb=env._SDL_Init;var bc=env.__exit;var bd=env._SDL_WM_GrabInput;var be=env._llvm_va_end;var bf=env._tzset;var bg=env._SDL_CreateRGBSurfaceFrom;var bh=env._printf;var bi=env._unlockpt;var bj=env._pread;var bk=env._SDL_SetVideoMode;var bl=env._fopen;var bm=env._open;var bn=env._usleep;var bo=env._SDL_EnableKeyRepeat;var bp=env._puts;var bq=env._SDL_GetVideoInfo;var br=env._nanosleep;var bs=env._SDL_Flip;var bt=env._SDL_InitSubSystem;var bu=env._strdup;var bv=env._SDL_GetError;var bw=env.__formatString;var bx=env._gettimeofday;var by=env._vfprintf;var bz=env._SDL_WM_SetCaption;var bA=env._sbrk;var bB=env.___errno_location;var bC=env._SDL_CloseAudio;var bD=env._isspace;var bE=env._llvm_lifetime_start;var bF=env.__parseInt;var bG=env._SDL_OpenAudio;var bH=env._localtime;var bI=env._gmtime_r;var bJ=env._sysconf;var bK=env._fread;var bL=env._SDL_WM_ToggleFullScreen;var bM=env._abort;var bN=env._fprintf;var bO=env._tan;var bP=env.__reallyNegative;var bQ=env._posix_openpt;var bR=env._fseek;var bS=env._write;var bT=env._SDL_UpperBlit;var bU=env._truncate;var bV=env._emscripten_set_main_loop;var bW=env._unlink;var bX=env._pwrite;var bY=env._SDL_FreeSurface;var bZ=env._time;
// EMSCRIPTEN_START_FUNCS
function b9(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7>>3<<3;return b|0}function ca(){return i|0}function cb(a){a=a|0;i=a}function cc(a,b){a=a|0;b=b|0;if((t|0)==0){t=a;u=b}}function cd(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function ce(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function cf(a){a=a|0;G=a}function cg(a){a=a|0;H=a}function ch(a){a=a|0;I=a}function ci(a){a=a|0;J=a}function cj(a){a=a|0;K=a}function ck(a){a=a|0;L=a}function cl(a){a=a|0;M=a}function cm(a){a=a|0;N=a}function cn(a){a=a|0;O=a}function co(a){a=a|0;P=a}function cp(){}function cq(a,b){a=a|0;b=b|0;return}function cr(b){b=b|0;a[b+7|0]=0;return}function cs(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((d|0)!=3){f=0;return f|0}d=b+20|0;a[e+1|0]=c[d>>2]&255;a[e]=(c[d>>2]|0)>>>8&255;f=2;return f|0}function ct(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;if((d|0)!=3|f>>>0<2){return}if((a[e+1|0]|0)!=-2){return}f=a[e]&15;a[b+4|0]=f&255;e=b+20|0;c[e>>2]=f<<8|c[e>>2]&61695;return}function cu(a,b,d){a=a|0;b=b|0;d=d|0;c[a+92>>2]=b;c[a+96>>2]=d;return}function cv(a,b,d){a=a|0;b=b|0;d=d|0;c[a+100>>2]=b;c[a+104>>2]=d;return}function cw(a,b,d){a=a|0;b=b|0;d=d|0;c[a+112>>2]=b;c[a+116>>2]=d;return}function cx(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=a+24|0;e=c[d>>2]|0;f=0;while(1){if(f>>>0>=e>>>0){break}if((c[a+28+(f<<2)>>2]|0)==(b|0)){g=1;h=26;break}else{f=f+1|0}}if((h|0)==26){return g|0}if(e>>>0>15){g=1;return g|0}c[d>>2]=e+1;c[a+28+(e<<2)>>2]=b;g=0;return g|0}function cy(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;e=c[b+320>>2]|0;if((d|0)==0){d=c[2268]|0;if((d|0)!=0){f=e|0;g=9072;h=d;do{d=c[f>>2]|0;L52:do{if((d|0)!=0){i=g;j=e;k=d;l=h;while(1){if((k|0)==(l|0)){m=j;n=c[i+4>>2]|0;c[m>>2]=c[i>>2];c[m+4>>2]=n}n=j+8|0;m=c[n>>2]|0;if((m|0)==0){break L52}j=n;k=m;l=c[g>>2]|0}}}while(0);g=g+8|0;h=c[g>>2]|0;}while((h|0)!=0)}a[b+316|0]=0;return}else{h=c[2242]|0;if((h|0)!=0){g=e|0;f=8968;d=h;do{h=c[g>>2]|0;L36:do{if((h|0)!=0){l=f;k=e;j=h;i=d;while(1){if((j|0)==(i|0)){m=k;n=c[l+4>>2]|0;c[m>>2]=c[l>>2];c[m+4>>2]=n}n=k+8|0;m=c[n>>2]|0;if((m|0)==0){break L36}k=n;j=m;i=c[f>>2]|0}}}while(0);f=f+8|0;d=c[f>>2]|0;}while((d|0)!=0)}a[b+316|0]=1;return}}function cz(b){b=b|0;return a[b+316|0]|0}function cA(b){b=b|0;var e=0;e=a[b+5|0]|0;a[b+4|0]=e;vV(b+7|0,0,13);c[b+20>>2]=(e&255)<<8&3840|(d[b+6|0]|0)|24576;return}function cB(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;c[b>>2]=0;f=d&255;a[b+4|0]=f;a[b+5|0]=f;a[b+6|0]=e&255;vV(b+7|0,0,13);c[b+20>>2]=d<<8&3840|e&255|24576;c[b+24>>2]=0;c[b+28>>2]=158;c[b+32>>2]=56;c[b+36>>2]=94;c[b+40>>2]=130;c[b+44>>2]=2;return}function cC(){var b=0,d=0;b=vP(120)|0;if((b|0)==0){d=0;return d|0}a[b]=3;c[b+112>>2]=0;c[b+116>>2]=0;vV(b+1|0,0,5);vV(b+14|0,0,14);vV(b+92|0,0,17);d=b;return d|0}function cD(b){b=b|0;var d=0,e=0,f=0;d=b+24|0;if((c[d>>2]|0)!=0){e=0;do{f=c[b+28+(e<<2)>>2]|0;b0[c[f+28>>2]&1023](f);e=e+1|0;}while(e>>>0<(c[d>>2]|0)>>>0)}a[b|0]=3;a[b+1|0]=1;d=b+108|0;e=b+2|0;y=0;a[e]=y&255;y=y>>8;a[e+1|0]=y&255;y=y>>8;a[e+2|0]=y&255;y=y>>8;a[e+3|0]=y&255;vV(b+14|0,0,10);if((a[d]|0)==0){return}a[d]=0;d=c[b+116>>2]|0;if((d|0)==0){return}b1[d&511](c[b+112>>2]|0,0);return}function cE(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;f=e&3;e=b|0;if((a[e]|0)==f<<24>>24){return}g=b+16|0;c[g>>2]=(c[g>>2]|0)+783;L87:do{if((f<<24>>24|0)==3|(f<<24>>24|0)==0){g=a[b+5|0]|0;if((d[b+4|0]|0)>=(g&255)){break}h=a[b+2|0]|0;if((h&12)!=8){break}a[b+1|0]=0;i=h&255;h=i>>>4;j=c[b+24>>2]|0;k=0;while(1){if(k>>>0>=j>>>0){break L87}l=c[b+28+(k<<2)>>2]|0;if((d[l+4|0]|0)==(h|0)){break}else{k=k+1|0}}if((l|0)==0){break}b8[c[l+44>>2]&7](l,i&3,b+6|0,g&255)}}while(0);a[e]=f;e=b+108|0;do{if((a[e]|0)!=0){a[e]=0;l=c[b+116>>2]|0;if((l|0)==0){break}b1[l&511](c[b+112>>2]|0,0)}}while(0);if((f<<24>>24|0)==0){a[b+1|0]=0;a[b+4|0]=0;a[b+5|0]=0;a[b+14|0]=8;a[b+15|0]=0;return}else if((f<<24>>24|0)==1|(f<<24>>24|0)==2){if((a[b+1|0]|0)==0){a[b+14|0]=8;a[b+15|0]=0;return}l=b+4|0;k=a[l]|0;h=a[b+5|0]|0;a[b+14|0]=8;if((k&255)>=(h&255)){a[b+15|0]=-86;if((a[e]|0)==1){return}a[e]=1;e=c[b+116>>2]|0;if((e|0)==0){return}b1[e&511](c[b+112>>2]|0,1);return}e=k+1&255;a[l]=e;a[b+15|0]=a[(k&255)+(b+6)|0]|0;if((e&255)<(h&255)){return}h=d[b+2|0]|0;e=h>>>4;k=c[b+24>>2]|0;l=0;while(1){if(l>>>0>=k>>>0){m=102;break}n=c[b+28+(l<<2)>>2]|0;if((d[n+4|0]|0)==(e|0)){break}else{l=l+1|0}}if((m|0)==102){return}if((n|0)==0){return}b1[c[n+40>>2]&511](n,h&3);return}else if((f<<24>>24|0)==3){a[b+1|0]=1;a[b+4|0]=0;a[b+5|0]=0;a[b+14|0]=0;a[b+15|0]=0;c[b+20>>2]=0;return}else{return}}function cF(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;f=b+14|0;g=a[f]|0;if(g<<24>>24==0){if((a[b|0]|0)!=3){return}h=b+20|0;i=(c[h>>2]|0)+e|0;c[h>>2]=i;if(i>>>0<86170){return}c[h>>2]=0;h=a[b+3|0]|0;if(h<<24>>24==0){return}cG(b,h,1);if((d[b+4|0]|0)<(d[b+5|0]|0)){a[f]=8;a[b+15|0]=-86;return}if((a[b+108|0]|0)==0){return}a[f]=8;a[b+15|0]=-86;return}c[b+20>>2]=0;h=b+16|0;i=c[h>>2]|0;if(i>>>0>e>>>0){c[h>>2]=i-e;return}c[h>>2]=0;do{if((a[b+1|0]|0)==0){e=b+15|0;a[e]=a[e]<<1;i=g-1&255;a[f]=i;j=c[b+104>>2]|0;if((j|0)==0){k=i}else{if((b_[j&31](c[b+100>>2]|0)|0)<<24>>24!=0){a[e]=a[e]|1}k=a[f]|0}if(k<<24>>24!=0){break}if((a[b|0]|0)==0){cG(b,a[e]|0,0);break}j=b+5|0;i=a[j]|0;if((i&255)>=8){break}l=a[e]|0;a[j]=i+1&255;a[(i&255)+(b+6)|0]=l}else{l=c[b+96>>2]|0;if((l|0)==0){m=g;n=b+15|0}else{i=b+15|0;b1[l&511](c[b+92>>2]|0,(d[i]|0)>>>7);m=a[f]|0;n=i}a[n]=a[n]<<1;a[f]=m-1&255}}while(0);c[h>>2]=(c[h>>2]|0)+783;return}function cG(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;g=i;h=b+108|0;do{if((a[h]|0)!=0){a[h]=0;j=c[b+116>>2]|0;if((j|0)==0){break}b1[j&511](c[b+112>>2]|0,0)}}while(0);j=b+2|0;a[j]=e;a[b+4|0]=0;k=b+5|0;a[k]=0;l=e&255;m=l&15;L185:do{if((m|0)==0){n=b+24|0;if((c[n>>2]|0)!=0){o=0;do{p=c[b+28+(o<<2)>>2]|0;b0[c[p+28>>2]&1023](p);o=o+1|0;}while(o>>>0<(c[n>>2]|0)>>>0)}a[b|0]=3;n=b+1|0;a[n]=1;o=j;y=0;a[o]=y&255;y=y>>8;a[o+1|0]=y&255;y=y>>8;a[o+2|0]=y&255;y=y>>8;a[o+3|0]=y&255;vV(b+14|0,0,10);do{if((a[h]|0)!=0){a[h]=0;o=c[b+116>>2]|0;if((o|0)==0){break}b1[o&511](c[b+112>>2]|0,0)}}while(0);a[n]=1}else{o=l&12;if((o|0)==8){break}else if((o|0)==12){a[b+1|0]=1;o=l>>>4;p=c[b+24>>2]|0;q=0;while(1){if(q>>>0>=p>>>0){break L185}r=c[b+28+(q<<2)>>2]|0;if((d[r+4|0]|0)==(o|0)){break}else{q=q+1|0}}if((r|0)==0){break}a[k]=(b2[c[r+36>>2]&127](r,l&3,b+6|0)|0)&255;a[b+3|0]=e;break}if((m|0)!=1){d$(58272,(x=i,i=i+8|0,c[x>>2]=l,x)|0);break}a[b+1|0]=1;q=l>>>4;o=c[b+24>>2]|0;p=0;while(1){if(p>>>0>=o>>>0){break L185}s=c[b+28+(p<<2)>>2]|0;if((d[s+4|0]|0)==(q|0)){break}else{p=p+1|0}}if((s|0)==0){break}b0[c[s+32>>2]&1023](s)}}while(0);if((f|0)==0){i=g;return}f=l>>>4;l=b+24|0;s=c[l>>2]|0;if((s|0)==0){i=g;return}m=b+116|0;e=b+112|0;r=0;k=s;while(1){s=c[b+28+(r<<2)>>2]|0;do{if((a[s+7|0]|0)==0){t=k}else{if((d[s+4|0]|0)==(f|0)){t=k;break}if((c[s+20>>2]&8192|0)==0){t=k;break}if((a[h]|0)==1){t=k;break}a[h]=1;j=c[m>>2]|0;if((j|0)==0){t=k;break}b1[j&511](c[e>>2]|0,1);t=c[l>>2]|0}}while(0);s=r+1|0;if(s>>>0<t>>>0){r=s;k=t}else{break}}i=g;return}function cH(b,d){b=b|0;d=d|0;var e=0;e=c[b>>2]|0;if((d|0)!=0){return}a[e+48|0]=0;a[e+7|0]=(c[e+52>>2]|0)!=(c[e+56>>2]|0)|0;return}function cI(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;g=b+56|0;if(((c[g>>2]^d)&1|0)!=0){c[b+52>>2]=1}c[g>>2]=d;d=b+60|0;g=(c[d>>2]|0)+e|0;c[d>>2]=g;d=b+64|0;e=(c[d>>2]|0)+f|0;c[d>>2]=e;d=b+52|0;if((g|e|0)==0){h=c[d>>2]&255;i=b+7|0;a[i]=h;return}else{c[d>>2]=1;h=1;i=b+7|0;a[i]=h;return}}function cJ(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=c[b>>2]|0;if((d|0)!=0){return}d=e+48|0;if((a[d]|0)==0){return}a[d]=0;d=e+52|0;c[d>>2]=0;if((c[e+68>>2]|0)==(c[e+56>>2]|0)){f=0}else{c[d>>2]=1;f=1}g=c[e+72>>2]|0;h=e+60|0;i=c[h>>2]|0;c[h>>2]=i-g;h=c[e+76>>2]|0;j=e+64|0;e=c[j>>2]|0;c[j>>2]=e-h;if((i|0)==(g|0)&(e|0)==(h|0)){k=f}else{c[d>>2]=1;k=1}a[b+7|0]=k;return}function cK(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;g=c[b+320>>2]|0;while(1){h=c[g>>2]|0;j=(h|0)==0;if(j|(h|0)==(e|0)){break}else{g=g+8|0}}if(j){j=vd(e)|0;tD(2,58240,(x=i,i=i+16|0,c[x>>2]=e,c[x+8>>2]=(j|0)!=0?j:56240,x)|0);i=f;return}do{if((d|0)==1){j=b+56|0;e=c[j>>2]|0;h=e+1&255;k=b+52|0;if((h|0)==(c[k>>2]|0)){l=k;m=j;break}a[b+60+e|0]=a[g+4|0]|0;c[j>>2]=h;l=k;m=j}else if((d|0)==2){j=b+56|0;k=c[j>>2]|0;h=k+1&255;e=b+52|0;if((h|0)==(c[e>>2]|0)){l=e;m=j;break}a[b+60+k|0]=a[g+4|0]|-128;c[j>>2]=h;l=e;m=j}else{l=b+52|0;m=b+56|0}}while(0);a[b+7|0]=(c[l>>2]|0)!=(c[m>>2]|0)|0;i=f;return}function cL(a){a=a|0;var b=0;b=c[a>>2]|0;vQ(c[b+320>>2]|0);vQ(b);return}function cM(b){b=b|0;var d=0;d=c[b>>2]|0;cA(b);a[d+48|0]=0;c[d+52>>2]=0;c[d+56>>2]=0;return}function cN(b){b=b|0;var d=0;d=c[b>>2]|0;cr(b);a[d+48|0]=0;c[d+52>>2]=0;c[d+56>>2]=0;return}function cO(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;f=i;if((d|0)==0){g=c[b>>2]|0;h=g;j=g+48|0;if((a[j]|0)==0){k=g+52|0;l=c[k>>2]|0;m=c[g+56>>2]|0;if((l|0)==(m|0)){n=0;i=f;return n|0}g=a[h+60+l|0]|0;o=l+1&255;c[k>>2]=o;if((o|0)==(m|0)){p=255}else{m=a[h+60+o|0]|0;c[k>>2]=l+2&255;p=m&255}m=b+8|0;c[m>>2]=p|(g&255)<<8;q=m}else{q=b+8|0}a[j]=1;a[e]=(c[q>>2]|0)>>>8&255;a[e+1|0]=c[q>>2]&255;n=2;i=f;return n|0}else if((d|0)==2){a[e]=-1;a[e+1|0]=-1;d$(43400,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);n=2;i=f;return n|0}else if((d|0)!=3){d$(46864,(x=i,i=i+8|0,c[x>>2]=d,x)|0)}n=cs(b,d,e)|0;i=f;return n|0}function cP(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;var g=0;g=i;do{if((b|0)!=3){d$(50976,(x=i,i=i+8|0,c[x>>2]=b,x)|0);if(!((b|0)==2&(f|0)==2)){break}c[a+16>>2]=(d[e]|0)<<8|(d[e+1|0]|0);i=g;return}}while(0);ct(a,b,e,f);i=g;return}function cQ(){var b=0,d=0,e=0,f=0,g=0,h=0,i=0;b=vP(324)|0;d=b;if((b|0)==0){e=0;return e|0}cB(b,2,2);c[b>>2]=b;c[b+24>>2]=2;c[b+28>>2]=136;c[b+32>>2]=8;c[b+36>>2]=72;c[b+40>>2]=126;c[b+44>>2]=6;c[b+52>>2]=0;c[b+56>>2]=0;a[b+316|0]=0;f=0;while(1){g=f+1|0;if((c[9176+(f<<3)>>2]|0)==0){break}else{f=g}}f=g<<3;g=vP(f)|0;if((g|0)==0){h=0}else{i=g;vW(g|0,9176,f)|0;h=i}c[b+320>>2]=h;e=d;return e|0}function cR(a){a=a|0;vQ(c[a>>2]|0);return}function cS(a){a=a|0;var b=0;b=c[a>>2]|0;cA(a);vV(b+52|0,0,28);c[a+8>>2]=32896;return}function cT(a){a=a|0;var b=0;b=c[a>>2]|0;cr(a);vV(b+52|0,0,28);return}function cU(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0;if((d|0)!=0){f=cs(b,d,e)|0;return f|0}d=c[b>>2]|0;if((c[d+52>>2]|0)==0){f=0;return f|0}a[d+48|0]=1;g=d+68|0;c[g>>2]=c[d+56>>2];h=d+72|0;c[h>>2]=c[d+60>>2];i=d+76|0;c[i>>2]=c[d+64>>2];d=b+8|0;c[d>>2]=32896;if((c[g>>2]&1|0)==0){j=32896}else{c[d>>2]=128;j=128}g=c[h>>2]|0;if((g|0)<0){k=(g|0)<-63?65:g&127}else{k=(g|0)>63?63:g}g=k|j;c[d>>2]=g;j=c[i>>2]|0;if((j|0)<0){l=(j|0)<-63?65:j&127}else{l=(j|0)>63?63:j}j=l<<8|g&33023;c[d>>2]=j;a[e]=j>>>8&255;a[e+1|0]=c[d>>2]&255;f=2;return f|0}function cV(){var a=0,b=0;a=vP(80)|0;if((a|0)==0){b=0;return b|0}cB(a,3,1);c[a>>2]=a;c[a+24>>2]=304;c[a+28>>2]=224;c[a+32>>2]=314;c[a+36>>2]=78;c[a+40>>2]=80;vV(a+52|0,0,28);b=a;return b|0}function cW(a,b){a=a|0;b=b|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;f=i;i=i+264|0;g=f|0;sT(g,b);if((sV(g)|0)!=0){i=f;return}if((sV(g)|0)!=0){i=f;return}b=a+49|0;h=a+48|0;j=a+50|0;k=a+51|0;l=a+124|0;m=a+44|0;n=a+45|0;p=a+68|0;q=a+52|0;r=a+46|0;s=a+47|0;t=a+42|0;u=a+43|0;v=a+69|0;w=a+56|0;y=a+54|0;z=a+40|0;A=a+41|0;B=a+60|0;C=a+4624|0;D=a+4625|0;E=a+64|0;F=a+62|0;G=a+1424|0;H=a+8|0;I=a+4|0;L348:while(1){do{if((sW(g,46584)|0)==0){if((sW(g,45912)|0)!=0){tc(33464);nY(c[H>>2]|0,c[o>>2]|0);break}if((sW(g,45560)|0)==0){if((sW(g,45232)|0)==0){break L348}tc(36168);J=d[h]|0;K=d[j]|0;L=d[k]|0;M=d[l]|0;tb(35840,(x=i,i=i+40|0,c[x>>2]=d[b]|0,c[x+8>>2]=J,c[x+16>>2]=K,c[x+24>>2]=L,c[x+32>>2]=M,x)|0);M=d[n]|0;L=d[p]|0;K=e[q>>1]|0;J=d[r]|0;N=d[s]|0;tb(35544,(x=i,i=i+48|0,c[x>>2]=d[m]|0,c[x+8>>2]=M,c[x+16>>2]=L,c[x+24>>2]=K,c[x+32>>2]=J,c[x+40>>2]=N,x)|0);N=d[u]|0;J=d[v]|0;K=(c[w>>2]|0)!=0?42:32;L=e[y>>1]|0;tb(35248,(x=i,i=i+40|0,c[x>>2]=d[t]|0,c[x+8>>2]=N,c[x+16>>2]=J,c[x+24>>2]=K,c[x+32>>2]=L,x)|0);L=d[A]|0;K=e[B>>1]|0;tb(34976,(x=i,i=i+32|0,c[x>>2]=d[z]|0,c[x+8>>2]=L,c[x+16>>2]=0,c[x+24>>2]=K,x)|0);K=d[D]|0;L=(c[E>>2]|0)!=0?42:32;J=e[F>>1]|0;tb(34704,(x=i,i=i+40|0,c[x>>2]=d[C]|0,c[x+8>>2]=K,c[x+16>>2]=0,c[x+24>>2]=L,c[x+32>>2]=J,x)|0);break}else{tc(34464);tb(34136,(x=i,i=i+8|0,c[x>>2]=d[G]|0,x)|0);J=0;do{L=d[a+132+J|0]|0;K=d[a+148+J|0]|0;N=d[a+772+J|0]|0;M=d[a+788+J|0]|0;tb(33864,(x=i,i=i+64|0,c[x>>2]=J,c[x+8>>2]=L,c[x+16>>2]=J,c[x+24>>2]=K,c[x+32>>2]=J,c[x+40>>2]=N,c[x+48>>2]=J,c[x+56>>2]=M,x)|0);J=J+1|0;}while(J>>>0<16)}}else{cX(c[I>>2]|0)}}while(0);if((sV(g)|0)!=0){O=292;break}}if((O|0)==292){i=f;return}O=sU(g)|0;tb(44904,(x=i,i=i+8|0,c[x>>2]=O,x)|0);i=f;return}function cX(b){b=b|0;var d=0,f=0,g=0,j=0,k=0,l=0,m=0.0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;d=i;i=i+608|0;f=d|0;g=d+352|0;tc(33144);j=ia(b)|0;k=ib(b)|0;l=ic(b)|0;if((j|0)==0){m=1.0}else{m=+((l+k|0)>>>0>>>0)/+(j>>>0>>>0)}tb(32816,(x=i,i=i+32|0,c[x>>2]=k,c[x+8>>2]=j,c[x+16>>2]=l,h[x+24>>3]=m,x)|0);l=b+166|0;j=e[l>>1]|0;k=ig(b)|0;n=ih(b)|0;o=(ij(b)|0)&65535;p=(e[l>>1]|0)>>>8&7;l=c[b+364>>2]|0;tb(32648,(x=i,i=i+112|0,c[x>>2]=j,c[x+8>>2]=(j&32768|0)!=0?84:45,c[x+16>>2]=(j&8192|0)!=0?83:45,c[x+24>>2]=j&255,c[x+32>>2]=(j&1|0)!=0?67:45,c[x+40>>2]=(j&2|0)!=0?86:45,c[x+48>>2]=(j&4|0)!=0?90:45,c[x+56>>2]=(j&8|0)!=0?78:45,c[x+64>>2]=(j&16|0)!=0?88:45,c[x+72>>2]=k,c[x+80>>2]=n,c[x+88>>2]=o,c[x+96>>2]=p,c[x+104>>2]=l,x)|0);l=c[b+104>>2]|0;p=c[b+120>>2]|0;o=c[b+136>>2]|0;n=b+152|0;k=c[n>>2]|0;tb(32496,(x=i,i=i+40|0,c[x>>2]=c[b+88>>2],c[x+8>>2]=l,c[x+16>>2]=p,c[x+24>>2]=o,c[x+32>>2]=k,x)|0);k=c[b+92>>2]|0;o=c[b+108>>2]|0;p=c[b+124>>2]|0;l=c[b+140>>2]|0;j=ii(b,0)|0;tb(32344,(x=i,i=i+40|0,c[x>>2]=k,c[x+8>>2]=o,c[x+16>>2]=p,c[x+24>>2]=l,c[x+32>>2]=j,x)|0);j=c[b+112>>2]|0;l=c[b+128>>2]|0;p=c[b+144>>2]|0;o=b+334|0;k=b+148|0;q=c[((a[o]|0)==0?k:b+168|0)>>2]|0;tb(32216,(x=i,i=i+40|0,c[x>>2]=c[b+96>>2],c[x+8>>2]=j,c[x+16>>2]=l,c[x+24>>2]=p,c[x+32>>2]=q,x)|0);q=c[b+100>>2]|0;p=c[b+116>>2]|0;l=c[b+132>>2]|0;j=c[k>>2]|0;if((a[o]|0)!=0){r=j;tb(32080,(x=i,i=i+40|0,c[x>>2]=q,c[x+8>>2]=p,c[x+16>>2]=l,c[x+24>>2]=j,c[x+32>>2]=r,x)|0);s=c[n>>2]|0;fP(b,f,s);t=g|0;c4(t,f);u=c[n>>2]|0;tb(41704,(x=i,i=i+16|0,c[x>>2]=u,c[x+8>>2]=t,x)|0);i=d;return}r=c[b+172>>2]|0;tb(32080,(x=i,i=i+40|0,c[x>>2]=q,c[x+8>>2]=p,c[x+16>>2]=l,c[x+24>>2]=j,c[x+32>>2]=r,x)|0);s=c[n>>2]|0;fP(b,f,s);t=g|0;c4(t,f);u=c[n>>2]|0;tb(41704,(x=i,i=i+16|0,c[x>>2]=u,c[x+8>>2]=t,x)|0);i=d;return}function cY(b){b=b|0;var d=0,e=0,f=0;d=b+4680|0;tV(d);dE(b);dL(c[15610]|0,0);dL(c[15610]|0,0);if((c[d>>2]|0)!=0){tU();return}e=b+4676|0;f=b+3480|0;do{if((a[e]|0)!=0){do{t0(5e4)|0;vA(c[f>>2]|0);}while((a[e]|0)!=0)}dL(c[15610]|0,0);dL(c[15610]|0,0);}while((c[d>>2]|0)==0);tU();return}function cZ(a){a=a|0;var b=0;b=i;c[15714]=a;c[15722]=800;c[15720]=100;c[15718]=1e4;bh(44536,(x=i,i=i+8|0,c[x>>2]=1e4,x)|0)|0;tV(a+4680|0);dE(a);bp(6336)|0;bV(4,c[15720]|0,1)|0;i=b;return}function c_(a,b,c){a=a|0;b=b|0;c=c|0;return}function c$(){var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;b=i;i=i+16|0;d=b|0;e=b+8|0;az(d|0,e|0)|0;f=bq()|0;g=c[f+12>>2]|0;h=c[f+16>>2]|0;if((c[15722]|0)>0){j=0}else{i=b;return}while(1){do{if(((j|0)%100|0|0)==0){f=c[d>>2]|0;if((f|0)>(g|0)){k=g}else{k=(f|0)<0?0:f}c[d>>2]=k;f=c[e>>2]|0;if((f|0)>(h|0)){l=h}else{l=(f|0)<0?0:f}c[e>>2]=l;f=c[(c[15714]|0)+4>>2]|0;m=l&65535;if((c[f+36>>2]|0)>>>0>2089){n=f+32|0;a[(c[n>>2]|0)+2088|0]=(m&65535)>>>8&255;a[(c[n>>2]|0)+2089|0]=l&255}else{b3[c[f+24>>2]&63](c[f+4>>2]|0,2088,m)}m=c[(c[15714]|0)+4>>2]|0;f=c[e>>2]|0;n=f&65535;if((c[m+36>>2]|0)>>>0>2093){o=m+32|0;a[(c[o>>2]|0)+2092|0]=(n&65535)>>>8&255;a[(c[o>>2]|0)+2093|0]=f&255}else{b3[c[m+24>>2]&63](c[m+4>>2]|0,2092,n)}n=c[(c[15714]|0)+4>>2]|0;m=c[e>>2]|0;f=m&65535;if((c[n+36>>2]|0)>>>0>2097){o=n+32|0;a[(c[o>>2]|0)+2096|0]=(f&65535)>>>8&255;a[(c[o>>2]|0)+2097|0]=m&255}else{b3[c[n+24>>2]&63](c[n+4>>2]|0,2096,f)}f=c[(c[15714]|0)+4>>2]|0;n=c[d>>2]|0;m=n&65535;if((c[f+36>>2]|0)>>>0>2091){o=f+32|0;a[(c[o>>2]|0)+2090|0]=(m&65535)>>>8&255;a[(c[o>>2]|0)+2091|0]=n&255}else{b3[c[f+24>>2]&63](c[f+4>>2]|0,2090,m)}m=c[(c[15714]|0)+4>>2]|0;f=c[d>>2]|0;n=f&65535;if((c[m+36>>2]|0)>>>0>2095){o=m+32|0;a[(c[o>>2]|0)+2094|0]=(n&65535)>>>8&255;a[(c[o>>2]|0)+2095|0]=f&255}else{b3[c[m+24>>2]&63](c[m+4>>2]|0,2094,n)}n=c[(c[15714]|0)+4>>2]|0;m=c[d>>2]|0;f=m&65535;if((c[n+36>>2]|0)>>>0>2099){o=n+32|0;a[(c[o>>2]|0)+2098|0]=(f&65535)>>>8&255;a[(c[o>>2]|0)+2099|0]=m&255;break}else{b3[c[n+24>>2]&63](c[n+4>>2]|0,2098,f);break}}}while(0);dL(c[15610]|0,0);dL(c[15610]|0,0);f=c[15714]|0;if((c[f+4680>>2]|0)!=0){break}if((a[f+4676|0]|0)!=0){do{t0(5e4)|0;vA(c[(c[15714]|0)+3480>>2]|0);}while((a[(c[15714]|0)+4676|0]|0)!=0)}f=j+1|0;if((f|0)<(c[15722]|0)){j=f}else{p=343;break}}if((p|0)==343){i=b;return}tU();aH()|0;i=b;return}function c0(d,f){d=d|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;g=i;i=i+3032|0;h=g|0;j=g+8|0;k=g+16|0;l=g+1040|0;m=g+1392|0;n=g+1400|0;p=g+1408|0;q=g+1760|0;r=g+2016|0;s=g+2024|0;t=g+2032|0;u=g+2288|0;v=g+2640|0;w=g+2648|0;y=g+3e3|0;z=g+3008|0;A=g+3016|0;B=g+3024|0;C=d+3480|0;D=c[C>>2]|0;if((D|0)!=0){vA(D)}do{if((sW(f,43872)|0)==0){if((sW(f,40104)|0)!=0){c[B>>2]=1;s4(f,B)|0;if((s0(f)|0)==0){break}if((c[B>>2]|0)!=0){do{dL(d,1);D=(c[B>>2]|0)-1|0;c[B>>2]=D;}while((D|0)!=0)}cX(c[d+4>>2]|0);break}if((sW(f,31040)|0)!=0){if((sW(f,43872)|0)!=0){if((s4(f,A)|0)!=0){D=d+28|0;do{sR(D,sJ(c[A>>2]|0)|0)|0;}while((s4(f,A)|0)!=0)}if((s0(f)|0)==0){break}D=d+4680|0;tV(D);dE(d);E=d+4|0;F=d+28|0;L458:while(1){G=ia(c[E>>2]|0)|0;while(1){if((ia(c[E>>2]|0)|0)!=(G|0)){continue L458}dL(d,0);if((sS(F,0,c[(c[E>>2]|0)+152>>2]&16777215,c[o>>2]|0)|0)!=0){break L458}if((c[D>>2]|0)!=0){break L458}}}tU();break}if((sW(f,36920)|0)==0){if((s0(f)|0)==0){break}cY(d);break}if((s3(f,z)|0)==0){b[z>>1]=-1}if((s0(f)|0)==0){break}D=d+4|0;E=ie(c[D>>2]|0)|0;F=d+4680|0;tV(F);dE(d);G=d+28|0;while(1){H=ia(c[D>>2]|0)|0;do{if((ia(c[D>>2]|0)|0)!=(H|0)){break}dL(d,0);if((sS(G,0,c[(c[D>>2]|0)+152>>2]&16777215,c[o>>2]|0)|0)!=0){break}}while((c[F>>2]|0)==0);if((sS(G,0,c[(c[D>>2]|0)+152>>2]&16777215,c[o>>2]|0)|0)!=0){break}if((c[F>>2]|0)!=0){break}if((ie(c[D>>2]|0)|0)==(E|0)){continue}H=(b[z>>1]|0)==-1;I=ig(c[D>>2]|0)|0;if(H){J=379;break}if((I|0)==(e[z>>1]|0)){J=381;break}}if((J|0)==379){E=ih(c[D>>2]|0)|0;tb(36416,(x=i,i=i+16|0,c[x>>2]=I,c[x+8>>2]=E,x)|0)}else if((J|0)==381){E=ig(c[D>>2]|0)|0;F=ih(c[D>>2]|0)|0;tb(36416,(x=i,i=i+16|0,c[x>>2]=E,c[x+8>>2]=F,x)|0)}tU();break}if((sW(f,56160)|0)!=0){if((s3(f,y)|0)==0){b[y>>1]=2}if((s0(f)|0)==0){break}F=d+4|0;id(c[F>>2]|0,e[y>>1]|0);cX(c[F>>2]|0);break}if((sW(f,54088)|0)!=0){c[v>>2]=1;do{if((sW(f,54088)|0)!=0){c[v>>2]=2;if((sW(f,54088)|0)==0){break}do{c[v>>2]=(c[v>>2]|0)+1;}while((sW(f,54088)|0)!=0)}}while(0);s4(f,v)|0;if((s0(f)|0)==0){break}D=d+4|0;F=ie(c[D>>2]|0)|0;E=d+4680|0;tV(E);L505:do{if((c[v>>2]|0)!=0){G=w|0;H=d+28|0;K=w+8|0;do{L=c[D>>2]|0;fP(L,w,c[L+152>>2]|0);L=c[D>>2]|0;do{if((c[G>>2]&4|0)==0){M=ia(L)|0;while(1){if((ia(c[D>>2]|0)|0)!=(M|0)){break}dL(d,0);if((sS(H,0,c[(c[D>>2]|0)+152>>2]&16777215,c[o>>2]|0)|0)!=0){break L505}if((c[E>>2]|0)!=0){break L505}}if((ie(c[D>>2]|0)|0)==(F|0)){break}M=c[D>>2]|0;N=c[M+380>>2]|0;if((c[M+152>>2]|0)==(N|0)){break}do{dL(d,0);if((sS(H,0,c[(c[D>>2]|0)+152>>2]&16777215,c[o>>2]|0)|0)!=0){break L505}if((c[E>>2]|0)!=0){break L505}}while((c[(c[D>>2]|0)+152>>2]|0)!=(N|0))}else{N=c[K>>2]<<1;M=N+(c[L+152>>2]|0)|0;if((N|0)==0){break}do{dL(d,0);if((sS(H,0,c[(c[D>>2]|0)+152>>2]&16777215,c[o>>2]|0)|0)!=0){break L505}if((c[E>>2]|0)!=0){break L505}}while((c[(c[D>>2]|0)+152>>2]|0)!=(M|0))}}while(0);L=(c[v>>2]|0)-1|0;c[v>>2]=L;}while((L|0)!=0)}}while(0);tU();cX(c[D>>2]|0);break}if((sW(f,52640)|0)!=0){if((s0(f)|0)==0){break}dK(d);cX(c[d+4>>2]|0);break}if((sW(f,51984)|0)!=0){if((s0(f)|0)==0){break}E=d+4680|0;tV(E);F=d+4|0;H=d+28|0;K=u|0;while(1){G=ia(c[F>>2]|0)|0;do{if((ia(c[F>>2]|0)|0)!=(G|0)){break}dL(d,0);if((sS(H,0,c[(c[F>>2]|0)+152>>2]&16777215,c[o>>2]|0)|0)!=0){break}}while((c[E>>2]|0)==0);if((sS(H,0,c[(c[F>>2]|0)+152>>2]&16777215,c[o>>2]|0)|0)!=0){break}if((c[E>>2]|0)!=0){break}G=c[F>>2]|0;fP(G,u,c[G+152>>2]|0);if((c[K>>2]&8|0)!=0){J=426;break}}if((J|0)==426){cX(c[F>>2]|0)}tU();break}if((sW(f,50968)|0)!=0){K=t|0;if((sV(f)|0)!=0){cX(c[d+4>>2]|0);break}if((s_(f,K,256)|0)==0){sZ(f,37848);break}E=d+4|0;if((it(c[E>>2]|0,K,s)|0)!=0){tb(37592,(x=i,i=i+8|0,c[x>>2]=K,x)|0);break}if((sV(f)|0)!=0){tb(37344,(x=i,i=i+8|0,c[x>>2]=c[s>>2],x)|0);break}if((s4(f,s)|0)==0){sZ(f,37128);break}if((s0(f)|0)==0){break}H=c[E>>2]|0;D=c[s>>2]|0;iu(H,K,D)|0;cX(c[E>>2]|0);break}if((sW(f,49248)|0)!=0){if((sV(f)|0)==0){cW(d,sU(f)|0);break}else{cX(c[d+4>>2]|0);break}}if((sW(f,48032)|0)!=0){c[r>>2]=1;do{if((sW(f,48032)|0)!=0){c[r>>2]=2;if((sW(f,48032)|0)==0){break}do{c[r>>2]=(c[r>>2]|0)+1;}while((sW(f,48032)|0)!=0)}}while(0);s4(f,r)|0;if((s0(f)|0)==0){break}F=d+4680|0;tV(F);E=d+4|0;if((c[r>>2]|0)!=0){D=d+28|0;K=0;do{H=ia(c[E>>2]|0)|0;do{if((ia(c[E>>2]|0)|0)!=(H|0)){break}dL(d,0);if((sS(D,0,c[(c[E>>2]|0)+152>>2]&16777215,c[o>>2]|0)|0)!=0){break}}while((c[F>>2]|0)==0);K=K+1|0;}while(K>>>0<(c[r>>2]|0)>>>0)}tU();cX(c[E>>2]|0);break}if((sW(f,47416)|0)==0){O=1;i=g;return O|0}K=q|0;if(a[7784]|0){P=c[15716]|0}else{a[7784]=1;F=c[(c[d+4>>2]|0)+152>>2]|0;c[15716]=F;P=F}c[m>>2]=P;c[n>>2]=16;if((sW(f,42056)|0)==0){if((s4(f,m)|0)!=0){s4(f,n)|0}if((s0(f)|0)==0){break}if((c[n>>2]|0)==0){Q=c[m>>2]|0}else{F=d+4|0;D=p+8|0;H=0;G=c[m>>2]|0;while(1){fP(c[F>>2]|0,p,G);c4(K,p);tb(41704,(x=i,i=i+16|0,c[x>>2]=c[m>>2],c[x+8>>2]=K,x)|0);L=(c[m>>2]|0)+(c[D>>2]<<1)|0;c[m>>2]=L;M=H+1|0;if(M>>>0<(c[n>>2]|0)>>>0){H=M;G=L}else{Q=L;break}}}c[15716]=Q;break}G=t|0;c[h>>2]=P;c[j>>2]=16;if((s4(f,h)|0)!=0){s4(f,j)|0}if((s0(f)|0)==0){break}H=c[j>>2]|0;if(H>>>0>256){c[j>>2]=256;R=256}else{R=H}H=c[h>>2]|0;D=(R*-12|0)+H&-2;if(D>>>0>H>>>0){break}H=d+4|0;K=l+8|0;F=0;E=0;L=0;M=5;N=D;while(1){do{if((M|0)==0){c[k+(E<<2)>>2]=N;D=E+1&255;if((D|0)==(F|0)){S=0;T=L;U=F;V=F+1&255;break}else{S=0;T=L+1|0;U=D;V=F;break}}else{S=M-1|0;T=L;U=E;V=F}}while(0);fP(c[H>>2]|0,l,N);D=(c[K>>2]<<1)+N|0;if(D>>>0>(c[h>>2]|0)>>>0){break}else{F=V;E=U;L=T;M=S;N=D}}N=c[j>>2]|0;if(T>>>0>N>>>0){W=T+V-N&255}else{W=V}if((W|0)==(U|0)){break}else{X=W}do{N=c[k+(X<<2)>>2]|0;fP(c[H>>2]|0,l,N);c4(G,l);tb(41704,(x=i,i=i+16|0,c[x>>2]=N,c[x+8>>2]=G,x)|0);X=X+1&255;}while((X|0)!=(U|0))}else{sX(f,d+28|0)}}while(0);d=c[C>>2]|0;if((d|0)==0){O=0;i=g;return O|0}vv(d,43712,43392)|0;O=0;i=g;return O|0}function c1(a,b){a=a|0;b=b|0;tH(b,6952,12)|0;tI(b)|0;b=a+4|0;c[(c[b>>2]|0)+68>>2]=a;c[(c[b>>2]|0)+72>>2]=0;c[(c[b>>2]|0)+76>>2]=68;c[(c[b>>2]|0)+80>>2]=326;c[(c[b>>2]|0)+84>>2]=14;return}function c2(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,y=0,z=0,A=0;e=i;f=a+4|0;a=ii(c[f>>2]|0,0)|0;g=c[f>>2]|0;h=a&16777215;j=h+1|0;k=c[g+36>>2]|0;if(j>>>0<k>>>0){l=c[g+32>>2]|0;m=(d[l+h|0]|0)<<8|(d[l+j|0]|0);n=g;o=k}else{k=b6[c[g+12>>2]&63](c[g+4>>2]|0,h)|0;h=c[f>>2]|0;m=k;n=h;o=c[h+36>>2]|0}h=m&65535;m=a+2&16777215;k=m+1|0;if(k>>>0<o>>>0){g=c[n+32>>2]|0;p=(d[g+m|0]|0)<<8|(d[g+k|0]|0);q=n;r=o}else{o=b6[c[n+12>>2]&63](c[n+4>>2]|0,m)|0;m=c[f>>2]|0;p=o;q=m;r=c[m+36>>2]|0}m=p&65535;p=a+4&16777215;o=p+1|0;if(o>>>0<r>>>0){n=c[q+32>>2]|0;s=(d[n+p|0]|0)<<8|(d[n+o|0]|0);t=q;u=r}else{r=b6[c[q+12>>2]&63](c[q+4>>2]|0,p)|0;p=c[f>>2]|0;s=r;t=p;u=c[p+36>>2]|0}p=s&65535;s=a+6&16777215;r=s+1|0;if(r>>>0<u>>>0){q=c[t+32>>2]|0;v=(d[q+s|0]|0)<<8|(d[q+r|0]|0);w=t;y=u}else{u=b6[c[t+12>>2]&63](c[t+4>>2]|0,s)|0;s=c[f>>2]|0;v=u;w=s;y=c[s+36>>2]|0}s=v&65535;v=a+8&16777215;u=v+1|0;if(u>>>0<y>>>0){y=c[w+32>>2]|0;z=(d[y+v|0]|0)<<8|(d[y+u|0]|0);A=z&65535;tD(3,42408,(x=i,i=i+56|0,c[x>>2]=a,c[x+8>>2]=b,c[x+16>>2]=h,c[x+24>>2]=m,c[x+32>>2]=p,c[x+40>>2]=s,c[x+48>>2]=A,x)|0);i=e;return}else{z=b6[c[w+12>>2]&63](c[w+4>>2]|0,v)|0;A=z&65535;tD(3,42408,(x=i,i=i+56|0,c[x>>2]=a,c[x+8>>2]=b,c[x+16>>2]=h,c[x+24>>2]=m,c[x+32>>2]=p,c[x+40>>2]=s,c[x+48>>2]=A,x)|0);i=e;return}}function c3(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0;e=i;f=a+4|0;g=c[f>>2]|0;h=(ii(g,0)|0)&16777215;j=h+1|0;if(j>>>0<(c[g+36>>2]|0)>>>0){k=c[g+32>>2]|0;l=(d[k+h|0]|0)<<8|(d[k+j|0]|0)}else{l=b6[c[g+12>>2]&63](c[g+4>>2]|0,h)|0}if((b|0)==10){fp(a+2424|0);i=e;return}else if((b|0)==25|(b|0)==26|(b|0)==32|(b|0)==39|(b|0)==40|(b|0)==41|(b|0)==42|(b|0)==43|(b|0)==44|(b|0)==46){i=e;return}else if((b|0)==0){dK(a);i=e;return}else{a=ii(c[f>>2]|0,0)|0;h=ih(c[f>>2]|0)|0;tD(3,43072,(x=i,i=i+32|0,c[x>>2]=a,c[x+8>>2]=b,c[x+16>>2]=h,c[x+24>>2]=l&65535,x)|0);i=e;return}}function c4(b,d){b=b|0;d=d|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;f=i;i=i+256|0;g=f|0;h=g|0;a[b]=0;j=d+8|0;if((c[j>>2]|0)==0){k=0;l=529}else{m=g;n=0;do{a2(m|0,41360,(x=i,i=i+8|0,c[x>>2]=e[d+12+(n<<1)>>1]|0,x)|0)|0;vY(b|0,m|0)|0;n=n+1|0;o=c[j>>2]|0;}while(n>>>0<o>>>0);if(o>>>0<4){k=o;l=529}}if((l|0)==529){while(1){l=0;o=b+(vX(b|0)|0)|0;a[o]=a[41064]|0;a[o+1|0]=a[41065|0]|0;a[o+2|0]=a[41066|0]|0;a[o+3|0]=a[41067|0]|0;a[o+4|0]=a[41068|0]|0;a[o+5|0]=a[41069|0]|0;o=k+1|0;if(o>>>0<4){k=o;l=529}else{break}}}l=c[d>>2]|0;do{if((l&1|0)==0){if((l&4|0)!=0){k=b+(vX(b|0)|0)|0;y=62;a[k]=y&255;y=y>>8;a[k+1|0]=y&255;break}k=b+(vX(b|0)|0)|0;if((l&16|0)==0){y=32;a[k]=y&255;y=y>>8;a[k+1|0]=y&255;break}else{y=60;a[k]=y&255;y=y>>8;a[k+1|0]=y&255;break}}else{k=b+(vX(b|0)|0)|0;y=42;a[k]=y&255;y=y>>8;a[k+1|0]=y&255}}while(0);l=fx(e[d+12>>1]|0)|0;k=(l|0)==0?d+32|0:l;l=c[d+28>>2]|0;if((l|0)==1){o=g;n=d+96|0;a2(o|0,39352,(x=i,i=i+16|0,c[x>>2]=k,c[x+8>>2]=n,x)|0)|0;p=o}else if((l|0)==2){o=g;a2(o|0,39056,(x=i,i=i+24|0,c[x>>2]=k,c[x+8>>2]=d+96,c[x+16>>2]=d+160,x)|0)|0;p=o}else if((l|0)==3){o=g;a2(o|0,38720,(x=i,i=i+32|0,c[x>>2]=k,c[x+8>>2]=d+96,c[x+16>>2]=d+160,c[x+24>>2]=d+224,x)|0)|0;p=o}else if((l|0)==0){l=g;o=(vX(k|0)|0)+1|0;vW(l|0,k|0,o)|0;p=l}else{c[h>>2]=2960685;p=g}vY(b|0,p|0)|0;p=d+288|0;if((a[p]|0)==0){i=f;return}d=vX(b|0)|0;g=b+d|0;if(d>>>0<50){vV(g|0,32,50-d|0);q=b+50|0}else{q=g}a[q]=a[38120]|0;a[q+1|0]=a[38121|0]|0;a[q+2|0]=a[38122|0]|0;vY(q|0,p|0)|0;i=f;return}function c5(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;d=i;e=a;if((b|0)==4){tD(2,45216,(x=i,i=i+8|0,c[x>>2]=c[(c[a+4>>2]|0)+152>>2],x)|0);f=0;i=d;return f|0}else if((b|0)==2){eh(e,48848,54888)|0;f=0;i=d;return f|0}else if((b|0)==0){f=0;i=d;return f|0}else if((b|0)==3){g=a+2424|0;fq(g,1);fq(g,2);fq(g,3);fq(g,4);f=0;i=d;return f|0}else if((b|0)==1){eh(e,44200,54888)|0;f=0;i=d;return f|0}else{e=a+4|0;g=c[e>>2]|0;h=a+2628|0;c[h>>2]=c[g+88>>2];j=a+2632|0;c[j>>2]=c[g+120>>2];k=a+2636|0;c[k>>2]=c[g+124>>2];l=a+2640|0;c[l>>2]=c[g+152>>2];if((fs(a+2424|0,b)|0)==0){c[(c[e>>2]|0)+88>>2]=c[h>>2];c[(c[e>>2]|0)+120>>2]=c[j>>2];c[(c[e>>2]|0)+124>>2]=c[k>>2];iv(c[e>>2]|0,c[l>>2]|0);f=0;i=d;return f|0}else{d$(41664,(x=i,i=i+8|0,c[x>>2]=b,x)|0);f=1;i=d;return f|0}}return 0}function c6(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=i;if((d|0)==3){eh(b,40816,48472)|0;i=e;return 0}else if((d|0)==2){eh(b,40816,54144)|0;i=e;return 0}else if((d|0)==39){dB(b,7,1);dB(b,7,0);i=e;return 0}else if((d|0)==5){eh(b,40816,41336)|0;i=e;return 0}else if((d|0)==53|(d|0)==91){f=b+1744|0;g=c[f>>2]|0;do{if((g|0)!=0){if((a[g+280|0]|0)==0){d$(35432,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);dw(c[f>>2]|0,0);break}else{d$(38352,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);dw(c[f>>2]|0,1);break}}}while(0);f=b+1752|0;g=c[f>>2]|0;if((g|0)==0){i=e;return 0}if((cz(g)|0)==0){d$(38352,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);cy(c[f>>2]|0,1);i=e;return 0}else{d$(35432,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);cy(c[f>>2]|0,0);i=e;return 0}}else if((d|0)==4){eh(b,40816,44896)|0;i=e;return 0}else{tD(2,32576,(x=i,i=i+8|0,c[x>>2]=d,x)|0);i=e;return 0}return 0}function c7(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;d=i;e=b+20|0;a[e]=0;f=c[b+4>>2]|0;do{if((f|0)==0){g=594}else{h=p6(f,0)|0;if((h|0)==0){g=594;break}a[e]=1;d$(38416,(x=i,i=i+8|0,c[x>>2]=(c[b>>2]|0)+1,x)|0);j=h}}while(0);L762:do{if((g|0)==594){e=oH(c[b+8>>2]|0,c[b+12>>2]|0)|0;L764:do{if((e|0)!=0){L766:do{if((ot(e)|0)==6){k=0;l=c[(c[e+64>>2]|0)+68>>2]|0}else{f=oA(e)|0;if((f|0)==1600){m=2}else if((f|0)==800){m=1}else{break L764}f=qX()|0;if((f|0)==0){break L764}else{n=0;o=0}L772:while(1){h=o>>>4;p=12-h|0;if((h|0)==12){q=n}else{h=0;r=n;while(1){s=0;t=r;do{u=qx(o,h,s,512)|0;if((u|0)==0){g=606;break L772}q3(f,u,o,h)|0;if((oK(e,c[u+24>>2]|0,t,1)|0)!=0){g=607;break L772}t=t+1|0;s=s+1|0;}while(s>>>0<p>>>0);s=h+1|0;if(s>>>0<m>>>0){h=s;r=t}else{q=t;break}}}r=o+1|0;if(r>>>0<80){n=q;o=r}else{k=f;l=f;break L766}}if((g|0)==606){qY(f);break L764}else if((g|0)==607){qY(f);break L764}}}while(0);if((l|0)==0){break}r=p2(l)|0;qY(k);if((r|0)==0){break}d$(53648,(x=i,i=i+8|0,c[x>>2]=(c[b>>2]|0)+1,x)|0);j=r;break L762}}while(0);d$(48104,(x=i,i=i+8|0,c[x>>2]=(c[b>>2]|0)+1,x)|0);v=1;i=d;return v|0}}while(0);k=b+16|0;qc(c[k>>2]|0);c[k>>2]=j;a[b+92|0]=0;c[b+48>>2]=0;v=0;i=d;return v|0}function c8(d){d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,y=0,z=0;e=i;i=i+512|0;f=e|0;g=d+16|0;if((c[g>>2]|0)==0){h=1;i=e;return h|0}j=d|0;d$(44592,(x=i,i=i+8|0,c[x>>2]=(c[j>>2]|0)+1,x)|0);L797:do{if((a[d+20|0]|0)==0){k=oH(c[d+8>>2]|0,c[d+12>>2]|0)|0;do{if((k|0)!=0){l=pT(c[g>>2]|0)|0;if((l|0)==0){break}if((ot(k)|0)==6){m=c[k+64>>2]|0;n=m+68|0;qY(c[n>>2]|0);c[n>>2]=l;a[m+72|0]=1;break L797}m=f|0;n=oA(k)|0;if((n|0)==1600){o=2}else if((n|0)==800){o=1}else{qY(l);break}n=0;p=0;L814:while(1){q=12-(n>>>4)|0;r=0;s=p;do{t=0;while(1){if(t>>>0>=q>>>0){break}u=q_(l,n,r,t,0)|0;if((u|0)==0){vV(m|0,0,512)}else{v=b[u+10>>1]|0;w=v&65535;if((v&65535)<512){vV(f+w|0,0,512-w|0);y=w}else{y=512}w=c[u+24>>2]|0;vW(m|0,w|0,y)|0}if((oL(k,m,t+s|0,1)|0)==0){t=t+1|0}else{z=642;break L814}}s=s+q|0;r=r+1|0;}while(r>>>0<o>>>0);r=n+1|0;if(r>>>0<80){n=r;p=s}else{z=640;break}}if((z|0)==640){qY(l);break L797}else if((z|0)==642){qY(l);break}}}while(0);d$(38080,(x=i,i=i+8|0,c[x>>2]=(c[j>>2]|0)+1,x)|0);h=1;i=e;return h|0}else{k=c[d+4>>2]|0;if((k|0)!=0){if((p7(k,c[g>>2]|0,0)|0)==0){break}}d$(41088,(x=i,i=i+8|0,c[x>>2]=(c[j>>2]|0)+1,x)|0);h=1;i=e;return h|0}}while(0);a[d+92|0]=0;h=0;i=e;return h|0}function c9(a,b,d){a=a|0;b=b|0;d=d|0;c[a+320>>2]=b;c[a+324>>2]=d;return}function da(a,b){a=a|0;b=b|0;c[a+32>>2]=b;c[a+128>>2]=b;c[a+224>>2]=b;return}function db(a,b,d){a=a|0;b=b|0;d=d|0;if(b>>>0>=3){return}c[a+24+(b*96|0)+12>>2]=d;return}function dc(b,c){b=b|0;c=c|0;var d=0;if(c>>>0>2){d=1;return d|0}d=(a[b+24+(c*96|0)+21|0]|0)!=0|0;return d|0}function dd(b,c,d){b=b|0;c=c|0;d=d|0;if(c>>>0>2){return}a[b+24+(c*96|0)+21|0]=(d|0)!=0|0;return}function de(b,c,d){b=b|0;c=c|0;d=d|0;if(c>>>0>2){return}a[b+24+(c*96|0)+22|0]=(d|0)!=0|0;return}function df(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;g=b+20|0;h=c[g>>2]|0;if((f|0)==0){i=h}else{j=f;f=h;h=e;while(1){e=(((d[6616+(a[h]&63)|0]|0)<<10)+(f*31|0)|0)>>>5;k=j-1|0;if((k|0)==0){i=e;break}else{j=k;f=e;h=h+1|0}}}c[g>>2]=i;c[(c[b+312>>2]|0)+88>>2]=i;return}function dg(b){b=b|0;a[b|0]=0;a[b+1|0]=0;a[b+3|0]=0;a[b+4|0]=0;a[b+5|0]=127;a[b+6|0]=0;vV(b+8|0,0,39);c[b+48>>2]=80;c[b+52>>2]=1;vV(b+56|0,0,5);vV(b+64|0,0,24);c[b+88>>2]=65e3;c[b+92>>2]=0;c[b+96>>2]=0;c[b+100>>2]=0;c[b+104>>2]=783360;c[b+108>>2]=0;a[b+116|0]=0;c[b+120>>2]=1;c[b+124>>2]=0;c[b+128>>2]=0;c[b+132>>2]=1;vV(b+136|0,0,7);c[b+144>>2]=80;c[b+148>>2]=1;vV(b+152|0,0,5);vV(b+160|0,0,24);c[b+184>>2]=65e3;c[b+188>>2]=0;c[b+192>>2]=0;c[b+196>>2]=0;c[b+200>>2]=783360;c[b+204>>2]=0;a[b+212|0]=0;c[b+216>>2]=2;c[b+220>>2]=0;c[b+224>>2]=0;c[b+228>>2]=2;vV(b+232|0,0,7);c[b+240>>2]=80;c[b+244>>2]=1;vV(b+248|0,0,5);vV(b+256|0,0,24);c[b+280>>2]=65e3;c[b+284>>2]=0;c[b+288>>2]=0;c[b+292>>2]=0;c[b+296>>2]=783360;c[b+300>>2]=0;a[b+308|0]=0;c[b+312>>2]=b+24;a[b+316|0]=0;c[b+320>>2]=0;c[b+324>>2]=0;return}function dh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;if(b>>>0>2|d>>>0>2){e=1;return e|0}c[a+24+(b*96|0)+28>>2]=d;if((c[a+24+(b*96|0)+44>>2]|0)>>>0<d>>>0){e=0;return e|0}di(a+24+(b*96|0)|0,c[a+24+(b*96|0)+40>>2]|0,0);e=0;return e|0}function di(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;if((c[a+24>>2]|0)>>>0<=b>>>0){return}if((c[a+28>>2]|0)>>>0<=d>>>0){return}e=a+16|0;f=c[e>>2]|0;if((f|0)==0){g=qb()|0;c[e>>2]=g;h=g}else{h=f}f=qf(h,b,d,1)|0;if((f|0)==0){return}h=f+4|0;do{if((c[h>>2]|0)==0){if((p8(f,c[16136+((b>>>0>79?4:b>>>4)<<2)>>2]|0)|0)==0){break}return}}while(0);if((c[f>>2]|0)==0){pY(f,5e5)}c[a+40>>2]=b;c[a+44>>2]=d;c[a+48>>2]=f;f=c[h>>2]|0;c[a+56>>2]=f;h=a+52|0;if((c[h>>2]|0)>>>0<f>>>0){return}c[h>>2]=0;return}function dj(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if(d>>>0>2){return}f=b+24+(d*96|0)+4|0;vQ(c[f>>2]|0);c[f>>2]=0;a[b+24+(d*96|0)+20|0]=0;if((e|0)==0){return}d=(vX(e|0)|0)+1|0;b=vP(d)|0;if((b|0)==0){return}vW(b|0,e|0,d)|0;c[f>>2]=b;return}function dk(b,e){b=b|0;e=e|0;var f=0;f=e<<24>>24!=0;e=b+2|0;if((d[e]|0|0)==(f&1|0)){return}a[e]=f&1;if((a[b|0]&32)!=0){return}e=f?2:0;f=b+24+(e*96|0)|0;c[b+312>>2]=f;di(f,c[b+24+(e*96|0)+40>>2]|0,d[b+1|0]|0);return}function dl(b,e){b=b|0;e=e|0;var f=0,g=0;f=e<<24>>24!=0;e=b+1|0;g=f&1;if((d[e]|0|0)==(g|0)){return}a[e]=f&1;f=c[b+312>>2]|0;if((c[f+44>>2]|0)==(g|0)){return}di(f,c[f+40>>2]|0,g);return}function dm(b,d){b=b|0;d=d|0;var e=0,f=0;if(d>>>0>2){return}e=b+24+(d*96|0)|0;f=b+24+(d*96|0)+34|0;if((a[f]|0)!=0){return}if((c7(e)|0)!=0){return}a[f]=1;di(e,c[b+24+(d*96|0)+40>>2]|0,c[b+24+(d*96|0)+44>>2]|0);return}function dn(b,f){b=b|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;if((f&1|0)==0){g=0;return g|0}ds(b,f>>>9&15);f=d[b|0]|0;h=f&192;if((h|0)==0){if((f&16|0)==0){g=-1;return g|0}i=b+13|0;j=a[i]|0;a[i]=0;g=j;return g|0}else if((h|0)==64){j=a[b+4|0]&31|a[b+3|0]&96;i=c[b+312>>2]|0;k=((a[b+1|0]|0)!=0?8:0)|f&7;if((k|0)==3){l=(a[i+35|0]|0)!=0|0;m=753}else if((k|0)==0){l=(a[i+32|0]|0)==0|0;m=753}else if((k|0)==6){l=(c[i+28>>2]|0)>>>0>1|0;m=753}else if((k|0)==9){f=a[i+21|0]|0;do{if((a[i+20|0]|0)==0){n=oH(c[i+8>>2]|0,c[i+12>>2]|0)|0;if((n|0)==0){o=f;break}o=(ov(n)|0)==0?f:1}else{o=f}}while(0);l=(o|0)==0|0;m=753}else if((k|0)==1){o=i+33|0;f=a[o]|0;a[o]=0;l=f<<24>>24==0|0;m=753}else if((k|0)==8){l=(a[i+34|0]|0)==0|0;m=753}else if((k|0)==2){l=(a[i+36|0]|0)==0|0;m=753}else if((k|0)==10){l=(c[i+40>>2]|0)!=0|0;m=753}else if((k|0)==11){if((c[i+28>>2]|0)==1){f=ac(((65536-(c[i+88>>2]|0)|0)*120|0)>>>15,c[i+60>>2]|0)|0;p=(f>>>0)/((c[i+64>>2]|0)>>>0)|0}else{p=(((c[i+52>>2]|0)*120|0)>>>0)/((c[i+56>>2]|0)>>>0)|0}l=p&1^1;m=753}else if((k|0)==4|(k|0)==5|(k|0)==7|(k|0)==12|(k|0)==14){g=j;return g|0}do{if((m|0)==753){if((l|0)==0){g=j}else{break}return g|0}}while(0);g=j|-128;return g|0}else if((h|0)==128){h=a[b+5|0]|0;return((e[b+14>>1]|0)<256?h|-128:h&127)|0}else{g=0;return g|0}return 0}function dp(a,b,d){a=a|0;b=b|0;d=d|0;c[a+288>>2]=b;c[a+292>>2]=d;return}function dq(a,b,d){a=a|0;b=b|0;d=d|0;c[a+296>>2]=b;c[a+300>>2]=d;return}function dr(a,b,d){a=a|0;b=b|0;d=d|0;c[a+276>>2]=b;c[a+284>>2]=(d|0)==0?10880:12944;return 0}function ds(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;f=i;g=e&15;if((g|0)==2){e=b|0;a[e]=a[e]&-3;h=e}else if((g|0)==1){e=b|0;a[e]=a[e]|1;h=e}else if((g|0)==3){e=b|0;a[e]=a[e]|2;h=e}else if((g|0)==5){e=b|0;a[e]=a[e]|4;h=e}else if((g|0)==4){e=b|0;a[e]=a[e]&-5;h=e}else if((g|0)==0){e=b|0;a[e]=a[e]&-2;h=e}else if((g|0)==6){e=b|0;a[e]=a[e]&-9;h=e}else if((g|0)==7){e=b|0;a[e]=a[e]|8;h=e}else if((g|0)==8){e=b|0;a[e]=a[e]&-17;j=b+3|0;a[j]=a[j]&-33;h=e}else if((g|0)==9){e=b|0;a[e]=a[e]|16;j=b+3|0;a[j]=a[j]|32;h=e}else if((g|0)==10){e=b|0;a[e]=a[e]&-33;j=(a[b+2|0]|0)!=0?2:0;k=b+24+(j*96|0)|0;c[b+312>>2]=k;di(k,c[b+24+(j*96|0)+40>>2]|0,d[b+1|0]|0);h=e}else if((g|0)==11){e=b|0;a[e]=a[e]|32;j=b+120|0;c[b+312>>2]=j;di(j,c[b+160>>2]|0,d[b+1|0]|0);h=e}else if((g|0)==12){e=b|0;a[e]=a[e]&-65;h=e}else if((g|0)==13){e=b|0;a[e]=a[e]|64;h=e}else if((g|0)==14){e=b|0;a[e]=a[e]&127;h=e}else if((g|0)==15){g=b|0;a[g]=a[g]|-128;h=g}else{h=b|0}g=a[h]|0;if((g&8)==0){l=g}else{e=g&255;g=((a[b+1|0]|0)!=0?4:0)|e&3;j=e&4;e=(j|0)!=0;k=j>>>2;j=c[b+312>>2]|0;do{if((g|0)==0){a[j+32|0]=(k^1)&255}else if((g|0)==1){if((k|0)!=0){break}m=j+40|0;n=c[m>>2]|0;do{if((a[j+32|0]|0)==0){if((n|0)==0){o=0;break}p=n-1|0;c[m>>2]=p;o=p}else{p=n+1|0;if(p>>>0>=(c[j+24>>2]|0)>>>0){o=n;break}c[m>>2]=p;o=p}}while(0);a[j+33|0]=1;di(j,o,c[j+44>>2]|0);n=c[m>>2]|0;tb(51944,(x=i,i=i+16|0,c[x>>2]=(c[j>>2]|0)+1,c[x+8>>2]=n,x)|0)}else if((g|0)==2){n=j+36|0;p=k^1;if((a[n]|0)==(p|0)){q=0}else{a[n]=p&255;q=0}while(1){if(q>>>0>=3){r=0;break}if((a[b+24+(q*96|0)+36|0]|0)==0){q=q+1|0}else{r=1;break}}m=b+316|0;if((a[m]|0)==r<<24>>24){break}a[m]=r;m=c[b+324>>2]|0;if((m|0)==0){break}b1[m&511](c[b+320>>2]|0,r)}else if((g|0)==3){if(!e){break}a[j+34|0]=0;d$(31928,(x=i,i=i+8|0,c[x>>2]=(c[j>>2]|0)+1,x)|0);if((a[j+92|0]|0)==0){break}c8(j)|0}else if((g|0)==4){if(!e){break}a[j+35|0]=0}}while(0);l=a[h]|0}if(l<<24>>24<=-1){i=f;return}l=b+5|0;a[l]=a[l]|64;l=b+6|0;if((a[l]|0)==0){i=f;return}a[l]=0;l=c[b+312>>2]|0;b=l+76|0;do{if((c[b>>2]|0)>>>0>(c[l+56>>2]|0)>>>0){if((a[l+22|0]|0)==0){break}h=c[l+48>>2]|0;j=l+52|0;e=c[j>>2]|0;p9(h,e)|0;c[j>>2]=0}}while(0);c[b>>2]=0;i=f;return}function dt(e,f,g){e=e|0;f=f|0;g=g|0;if((f&1|0)==0){return}ds(e,f>>>9&15);f=d[e|0]|0;if((f&192|0)!=192){return}if((f&16|0)==0){a[e+4|0]=g;return}f=e+6|0;if((a[f]|0)==0){a[f]=1;c[e+8>>2]=0;c[(c[e+312>>2]|0)+76>>2]=0}b[e+14>>1]=g&255|-256;return}function du(e,f){e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;g=c[e+312>>2]|0;if((a[g+36|0]|0)==0){return}h=g+84|0;i=(c[h>>2]|0)+(f*5e5|0)|0;f=c[g+80>>2]|0;j=(i>>>0)/(f>>>0)|0;c[h>>2]=(i>>>0)%(f>>>0)|0;f=g+56|0;i=c[f>>2]|0;if((i|0)==0){k=0}else{h=g+52|0;l=(c[h>>2]|0)+j|0;while(1){if(l>>>0<i>>>0){break}else{l=l-i|0}}c[h>>2]=l;k=i}i=c[g+64>>2]|0;do{if((i|0)!=0){l=g+60|0;h=(c[l>>2]|0)+j|0;c[l>>2]=h;if(h>>>0<i>>>0){break}c[l>>2]=h-i}}while(0);i=e+6|0;L1063:do{if((a[i]|0)==0){if((d[e|0]|0)>=64){break}j=c[g+48>>2]|0;if((j|0)==0|(k|0)==0){break}h=g+68|0;l=c[h>>2]|0;m=c[j+8>>2]|0;j=g+52|0;if((l|0)==(c[j>>2]|0)){break}n=e+12|0;o=e+16|0;p=e+13|0;q=128>>>((l&7)>>>0)&255;r=l>>>3;l=a[n]|0;while(1){s=l<<1;t=(a[m+r|0]&q)<<24>>24!=0;a[n]=t&1|s;do{if(t){c[o>>2]=0}else{u=(c[o>>2]|0)+1|0;c[o>>2]=u;if(u>>>0<=7){break}c[o>>2]=0;a[n]=s|1}}while(0);s=(c[h>>2]|0)+1|0;c[h>>2]=s;do{if(s>>>0<(c[f>>2]|0)>>>0){if(q<<24>>24==1){v=r+1|0;w=-128;x=s;break}else{v=r;w=(q&255)>>>1;x=s;break}}else{c[h>>2]=0;v=0;w=-128;x=0}}while(0);s=a[n]|0;if(s<<24>>24<0){a[p]=s;a[n]=0;y=0;z=c[h>>2]|0}else{y=s;z=x}if((z|0)==(c[j>>2]|0)){break}else{q=w;r=v;l=y}}}else{l=g+48|0;r=c[l>>2]|0;if((r|0)==0|(k|0)==0){break}q=g+72|0;j=c[q>>2]|0;h=c[r+8>>2]|0;r=g+52|0;n=e+8|0;p=e+14|0;o=e+12|0;m=g+92|0;s=g+76|0;t=j>>>3;u=128>>>((j&7)>>>0)&255;A=j;L1087:while(1){j=h+t|0;B=u;C=A;while(1){if((C|0)==(c[r>>2]|0)){break L1063}if((c[n>>2]|0)==0){D=b[p>>1]|0;if((D&65535)<256){break L1087}E=D&255;a[o]=E;c[n>>2]=8;b[p>>1]=0;F=E}else{F=a[o]|0}if(F<<24>>24<0){G=a[j]|B}else{G=a[j]&~B}a[j]=G;a[m]=1;a[o]=a[o]<<1;c[n>>2]=(c[n>>2]|0)-1;H=(c[q>>2]|0)+1|0;c[q>>2]=H;c[s>>2]=(c[s>>2]|0)+1;if(H>>>0>=(c[f>>2]|0)>>>0){I=855;break}if(B<<24>>24==1){I=858;break}B=(B&255)>>>1;C=H}if((I|0)==855){I=0;c[q>>2]=0;t=0;u=-128;A=0;continue}else if((I|0)==858){I=0;t=t+1|0;u=-128;A=H;continue}}A=e+5|0;a[A]=a[A]&-65;c[n>>2]=0;a[i]=0;do{if((c[s>>2]|0)>>>0>(c[f>>2]|0)>>>0){if((a[g+22|0]|0)==0){break}A=c[l>>2]|0;u=c[r>>2]|0;p9(A,u)|0;c[r>>2]=0}}while(0);c[s>>2]=0}}while(0);f=c[g+52>>2]|0;c[g+68>>2]=f;c[g+72>>2]=f;return}function dv(){var b=0,d=0;b=vP(304)|0;if((b|0)==0){d=0;return d|0}a[b+264|0]=0;c[b>>2]=0;c[b+4>>2]=0;vV(b+268|0,0,13);vV(b+288|0,0,16);c[b+284>>2]=10880;d=b;return d|0}function dw(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;e=c[b+284>>2]|0;if((d|0)==0){d=c[3758]|0;if((d|0)!=0){f=15032;g=d;do{d=e;while(1){h=c[d>>2]|0;if((h|0)==0){break}if((h|0)==(g|0)){i=896;break}else{d=d+24|0}}if((i|0)==896){i=0;h=d;j=f;c[h>>2]=c[j>>2];c[h+4>>2]=c[j+4>>2];c[h+8>>2]=c[j+8>>2];c[h+12>>2]=c[j+12>>2];c[h+16>>2]=c[j+16>>2];c[h+20>>2]=c[j+20>>2]}f=f+24|0;g=c[f>>2]|0;}while((g|0)!=0)}a[b+280|0]=1;return}else{g=c[3896]|0;if((g|0)!=0){f=15584;j=g;do{g=e;while(1){h=c[g>>2]|0;if((h|0)==0){break}if((h|0)==(j|0)){i=889;break}else{g=g+24|0}}if((i|0)==889){i=0;d=g;h=f;c[d>>2]=c[h>>2];c[d+4>>2]=c[h+4>>2];c[d+8>>2]=c[h+8>>2];c[d+12>>2]=c[h+12>>2];c[d+16>>2]=c[h+16>>2];c[d+20>>2]=c[h+20>>2]}f=f+24|0;j=c[f>>2]|0;}while((j|0)!=0)}a[b+280|0]=0;return}}function dx(b,c){b=b|0;c=c|0;a[b+264|0]=c;return}function dy(d,e,f){d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;if((f|0)==2){h=71}else{h=(f|0)==3?75:f}f=c[d+284>>2]|0;while(1){j=c[f>>2]|0;k=(j|0)==0;if(k|(j|0)==(h|0)){break}else{f=f+24|0}}if(k){k=vd(h)|0;tD(2,31640,(x=i,i=i+16|0,c[x>>2]=h,c[x+8>>2]=(k|0)!=0?k:51656,x)|0);i=g;return}if((e|0)==1){k=b[f+4>>1]|0;h=k&65535;if(k<<16>>16==0){i=g;return}k=d+4|0;j=d|0;l=0;m=c[k>>2]|0;while(1){if(m>>>0>255){n=m}else{a[((c[j>>2]|0)+m&255)+(d+8)|0]=a[f+6+l|0]|0;o=(c[k>>2]|0)+1|0;c[k>>2]=o;n=o}o=l+1|0;if(o>>>0<h>>>0){l=o;m=n}else{break}}i=g;return}else if((e|0)==2){e=b[f+14>>1]|0;n=e&65535;if(e<<16>>16==0){i=g;return}e=d+4|0;m=d|0;l=0;h=c[e>>2]|0;while(1){if(h>>>0>255){p=h}else{a[((c[m>>2]|0)+h&255)+(d+8)|0]=a[f+16+l|0]|0;k=(c[e>>2]|0)+1|0;c[e>>2]=k;p=k}k=l+1|0;if(k>>>0<n>>>0){l=k;h=p}else{break}}i=g;return}else{i=g;return}}function dz(b,d){b=b|0;d=d|0;var e=0,f=0;e=i;f=d&255;if((f|0)==22){c[b>>2]=0;c[b+4>>2]=1;a[b+8|0]=(c[b+276>>2]<<1&14|1)&255;c[b+268>>2]=0;c[b+272>>2]=1;i=e;return}else if((f|0)==16){c[b+268>>2]=1958400;c[b+272>>2]=1;i=e;return}else if((f|0)==20){c[b+268>>2]=0;c[b+272>>2]=1;i=e;return}else{d$(47248,(x=i,i=i+8|0,c[x>>2]=f,x)|0);i=e;return}}function dA(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;if((a[b+264|0]|0)==0){return}e=b+272|0;if((c[e>>2]|0)==0){return}f=b+4|0;g=c[f>>2]|0;if((g|0)!=0){h=b|0;i=c[b+292>>2]|0;if((i|0)==0){j=g}else{b1[i&511](c[b+288>>2]|0,a[(c[h>>2]|0)+(b+8)|0]|0);j=c[f>>2]|0}c[h>>2]=(c[h>>2]|0)+1&255;c[f>>2]=j-1;c[e>>2]=0;c[b+268>>2]=0;return}j=b+268|0;f=c[j>>2]|0;if(f>>>0>d>>>0){c[j>>2]=f-d;return}d=c[b+292>>2]|0;if((d|0)!=0){b1[d&511](c[b+288>>2]|0,123)}c[e>>2]=0;return}function dB(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0;g=1<<e;if((f|0)==0){f=b+4652|0;e=(d[f]|0)&(g^255)&255;a[f]=e;h=e}else{e=b+4652|0;f=(d[e]|0|g)&255;a[e]=f;h=f}f=h&255;h=0;while(1){e=f>>>1;if((e|0)==0){break}else{f=e;h=h+1|0}}ix(c[b+4>>2]|0,h);return}function dC(d,e){d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;if(e<<24>>24==0){return}do{if((fr(d+2424|0)|0)!=0){e=d+4|0;f=c[e>>2]|0;if((b[f+166>>1]&1792)==1792){break}g=(c[f+148>>2]|0)-4|0;h=c[f+152>>2]|0;i=g&16777215;j=i+3|0;if(j>>>0<(c[f+36>>2]|0)>>>0){k=f+32|0;a[(c[k>>2]|0)+i|0]=h>>>24&255;a[(c[k>>2]|0)+(i+1)|0]=h>>>16&255;a[(c[k>>2]|0)+(i+2)|0]=h>>>8&255;a[(c[k>>2]|0)+j|0]=h&255}else{b3[c[f+28>>2]&63](c[f+4>>2]|0,i,h)}c[(c[e>>2]|0)+148>>2]=g;iv(c[e>>2]|0,c[d+2468>>2]|0)}}while(0);e=d+36|0;mY(e,0);mY(e,1);return}function dD(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0;e=i;i=i+400|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=e+32|0;l=e+40|0;m=e+48|0;n=e+56|0;o=e+64|0;p=e+72|0;q=e+80|0;r=e+112|0;s=e+120|0;t=e+128|0;u=e+136|0;v=e+144|0;w=e+152|0;y=e+160|0;z=e+168|0;A=e+176|0;B=e+184|0;C=e+192|0;D=e+200|0;E=e+208|0;F=e+216|0;G=e+224|0;H=e+232|0;I=e+240|0;J=e+248|0;K=e+256|0;L=e+264|0;M=e+272|0;N=e+280|0;O=e+288|0;P=e+296|0;Q=e+304|0;R=e+312|0;S=e+320|0;T=e+328|0;U=e+336|0;V=e+344|0;W=e+352|0;X=e+360|0;Y=e+368|0;Z=e+376|0;_=e+384|0;$=e+392|0;aa=b+3480|0;c[aa>>2]=0;ab=b+3476|0;c[ab>>2]=0;c[b+4632>>2]=0;a[b+4652|0]=0;a[b+4676|0]=0;c[b+4680>>2]=0;ad=b+4684|0;vV(b+4656|0,0,14);c[ad>>2]=1;ae=b+4688|0;c[ae>>2]=1;af=b+4696|0;c[af>>2]=0;c[b+4692>>2]=0;vV(b+4712|0,0,24);sE(b+28|0);ag=um(d,0,57744)|0;ux((ag|0)==0?d:ag,35208,$,57680)|0;tF(2,57648,57592,(x=i,i=i+8|0,c[x>>2]=c[$>>2],x)|0);ag=c[$>>2]|0;do{if((aQ(ag|0,57680)|0)==0){c[b>>2]=1}else{if((aQ(ag|0,57536)|0)==0){c[b>>2]=2;break}if((aQ(ag|0,57488)|0)==0){c[b>>2]=4;break}else{tD(0,57416,(x=i,i=i+8|0,c[x>>2]=ag,x)|0);c[b>>2]=1;break}}}while(0);ag=nX()|0;$=b+8|0;c[$>>2]=ag;ah=b;nP(ag,ah,24,2,18,4,38,10);ag=b+12|0;tj(c[$>>2]|0,d,ag)|0;tk(c[$>>2]|0,d)|0;c[ag>>2]=nQ(c[$>>2]|0,0)|0;ai=nQ(c[$>>2]|0,4194304)|0;aj=b+16|0;c[aj>>2]=ai;ak=b+20|0;c[ak>>2]=0;al=b+24|0;c[al>>2]=0;am=c[ag>>2]|0;do{if((am|0)==0){tD(0,30184,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0)}else{if((ai|0)==0){tD(0,58208,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);break}an=nV(am)|0;c[ak>>2]=an;nJ(an,6291456);if((nK(c[ak>>2]|0)|0)>>>0>2097152){nL(c[ak>>2]|0,2097152)}an=nV(c[aj>>2]|0)|0;c[al>>2]=an;nJ(an,0);c[b+4628>>2]=0;uw(d,58160,_,1)|0;if((c[_>>2]|0)!=0){break}tF(2,57976,57840,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);an=c[b>>2]|0;if((an&1|0)!=0){n5(c[$>>2]|0,686,4194304);break}if((an&6|0)==0){break}n5(c[$>>2]|0,3324,1464619843)}}while(0);_=um(d,0,30480)|0;ux(_,35208,Y,43704)|0;uu(_,30432,Z,0)|0;_=c[Z>>2]|0;tF(2,30392,30328,(x=i,i=i+16|0,c[x>>2]=c[Y>>2],c[x+8>>2]=_,x)|0);_=io()|0;al=b+4|0;c[al>>2]=_;if((_|0)!=0){if((dJ(b,c[Y>>2]|0)|0)!=0){tD(0,30248,(x=i,i=i+8|0,c[x>>2]=c[Y>>2],x)|0)}h5(c[al>>2]|0,c[$>>2]|0,26,12,22,12,26,16);h7(c[al>>2]|0,ah,180);h8(c[al>>2]|0,ah,36);h9(c[al>>2]|0,0);al=c[Z>>2]|0;c[ad>>2]=al;c[ae>>2]=al}al=um(d,0,31152)|0;ut(al,57456,W,15720448)|0;ut(al,45176,X,8192)|0;al=c[X>>2]|0;tF(2,31112,44472,(x=i,i=i+16|0,c[x>>2]=c[W>>2],c[x+8>>2]=al,x)|0);al=b+36|0;mU(al,9);mP(al,ah,236);mL(al,ah,286);mM(al,ah,288);ae=nU(c[W>>2]|0,c[X>>2]|0,0)|0;if((ae|0)!=0){nF(ae,al,4,32,10,28,2,20);nZ(c[$>>2]|0,ae,1)}ae=um(d,0,31248)|0;ut(ae,57456,U,8388608)|0;ut(ae,45176,V,4194304)|0;ae=c[V>>2]|0;tF(2,31200,44472,(x=i,i=i+16|0,c[x>>2]=c[U>>2],c[x+8>>2]=ae,x)|0);ae=b+128|0;na(ae);m3(ae,ah,44);nf(ae,3672e3,3672e3,3672e3);X=nU(c[U>>2]|0,c[V>>2]|0,0)|0;if((X|0)!=0){nF(X,ah,30,0,0,30,0,0);nZ(c[$>>2]|0,X,1)}X=b+3488|0;fc(X);ff(X,ae,0);X=b+4056|0;fc(X);ff(X,ae,1);X=um(d,0,32072)|0;if((X|0)!=0){V=X;do{uu(V,31920,R,0)|0;uu(V,31872,S,1)|0;ux(V,49640,T,0)|0;X=c[S>>2]|0;U=c[T>>2]|0;tF(2,31616,31488,(x=i,i=i+24|0,c[x>>2]=c[R>>2],c[x+8>>2]=X,c[x+16>>2]=(U|0)!=0?U:48384,x)|0);V=um(d,V,32072)|0;U=c[R>>2]|0;do{if(U>>>0>1){tD(0,31360,(x=i,i=i+8|0,c[x>>2]=U,x)|0)}else{X=c[S>>2]|0;ne(ae,U,X,X);X=c[T>>2]|0;if((X|0)==0){break}if((fd(b+3488+((c[R>>2]|0)*568|0)|0,X)|0)==0){break}tD(0,31288,(x=i,i=i+8|0,c[x>>2]=c[T>>2],x)|0)}}while(0);}while((V|0)!=0)}V=um(d,0,34096)|0;ux(V,40320,N,33816)|0;uw(V,33408,P,1)|0;uw(V,33096,Q,0)|0;ux(V,32800,O,0)|0;V=c[P>>2]|0;T=c[O>>2]|0;R=c[Q>>2]|0;tF(2,32640,32448,(x=i,i=i+32|0,c[x>>2]=c[N>>2],c[x+8>>2]=V,c[x+16>>2]=(T|0)!=0?T:32336,c[x+24>>2]=R,x)|0);c[b+4672>>2]=bu(c[N>>2]|0)|0;R=b+1428|0;eE(R);ed(R,ah,96);ee(R,ah,116);ef(R,c[P>>2]|0);if((eF(R,c[N>>2]|0)|0)!=0){tD(0,32184,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0)}if((c[Q>>2]|0)!=0){a[b+1548|0]=0;a[b+1549|0]=6;a[b+1550|0]=-1;a[b+1551|0]=-53}Q=c[O>>2]|0;if((Q|0)==0){eG(R,0,1)}else{eL(R,Q)}Q=b+1744|0;c[Q>>2]=0;R=b|0;do{if((c[R>>2]&1|0)!=0){O=um(d,0,37800)|0;uu(O,35208,K,1)|0;uw(O,34936,L,0)|0;uw(O,37544,M,0)|0;O=c[L>>2]|0;N=(c[M>>2]|0)!=0?35800:35504;tF(2,34664,34392,(x=i,i=i+24|0,c[x>>2]=c[K>>2],c[x+8>>2]=O,c[x+16>>2]=N,x)|0);N=dv()|0;c[Q>>2]=N;if((N|0)==0){break}O=c[K>>2]|0;P=c[L>>2]|0;dr(N,O,P)|0;dw(c[Q>>2]|0,c[M>>2]|0);dp(c[Q>>2]|0,al,330);dq(c[Q>>2]|0,ah,22);mO(al,c[Q>>2]|0,140);mN(al,c[Q>>2]|0,164)}}while(0);Q=b+1748|0;c[Q>>2]=0;M=b+1756|0;c[M>>2]=0;L=b+1752|0;c[L>>2]=0;do{if((c[R>>2]&6|0)!=0){K=um(d,0,38376)|0;uw(K,38040,H,1)|0;uw(K,37800,I,1)|0;uw(K,37544,J,0)|0;tF(2,37304,37080,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);K=cC()|0;c[Q>>2]=K;if((K|0)==0){tD(0,36880,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);break}P=al;cu(K,P,250);cv(c[Q>>2]|0,P,20);cw(c[Q>>2]|0,ah,200);do{if((c[H>>2]|0)!=0){tF(2,37304,36368,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);P=cV()|0;c[M>>2]=P;if((P|0)==0){break}K=c[Q>>2]|0;O=P|0;cx(K,O)|0}}while(0);if((c[I>>2]|0)==0){break}tF(2,37304,36120,(x=i,i=i+8|0,c[x>>2]=(c[J>>2]|0)!=0?35800:35504,x)|0);O=cQ()|0;c[L>>2]=O;if((O|0)==0){break}cy(O,c[J>>2]|0);O=c[Q>>2]|0;K=c[L>>2]|0;cx(O,K)|0}}while(0);L=b+3484|0;c[L>>2]=ti(d)|0;Q=um(d,0,41328)|0;J=b+1760|0;dg(J);c9(J,ah,218);da(J,c[L>>2]|0);tF(2,41024,40776,(x=i,i=i+8|0,c[x>>2]=13631488,x)|0);I=um(Q,0,43664)|0;if((I|0)!=0){M=0;H=I;do{uu(H,43664,E,M)|0;uu(H,40576,F,c[E>>2]|0)|0;ux(H,40320,G,0)|0;uw(H,40088,A,0)|0;uw(H,39896,B,0)|0;uw(H,39296,D,0)|0;uw(H,39008,C,0)|0;I=(c[A>>2]|0)!=0?400:800;al=c[B>>2]|0;R=c[C>>2]|0;K=c[F>>2]|0;O=c[G>>2]|0;tF(2,41024,38632,(x=i,i=i+48|0,c[x>>2]=c[E>>2],c[x+8>>2]=I,c[x+16>>2]=al,c[x+24>>2]=R,c[x+32>>2]=K,c[x+40>>2]=(O|0)!=0?O:48384,x)|0);dh(J,(c[E>>2]|0)-1|0,(c[A>>2]|0)!=0?1:2)|0;db(J,(c[E>>2]|0)-1|0,c[F>>2]|0);dj(J,(c[E>>2]|0)-1|0,c[G>>2]|0);dd(J,(c[E>>2]|0)-1|0,c[B>>2]|0);de(J,(c[E>>2]|0)-1|0,c[C>>2]|0);if((c[D>>2]|0)!=0){dm(J,(c[E>>2]|0)-1|0)}M=(c[E>>2]|0)+1|0;H=um(Q,H,43664)|0;}while((H|0)!=0)}H=um(d,0,45528)|0;do{if((H|0)!=0){ut(H,57456,t,5767168)|0;ut(H,45176,u,524288)|0;Q=c[u>>2]|0;tF(2,44864,44472,(x=i,i=i+16|0,c[x>>2]=c[t>>2],c[x+8>>2]=Q,x)|0);Q=b+2088|0;eO(Q);eI(Q,c[L>>2]|0);E=nU(c[t>>2]|0,c[u>>2]|0,0)|0;if((E|0)==0){break}nF(E,Q,28,8,0,36,32,0);nZ(c[$>>2]|0,E,1);E=um(H,0,44168)|0;if((E|0)==0){break}else{ao=E}do{uu(ao,43880,v,0)|0;uu(ao,43664,w,0)|0;ux(ao,43360,y,43032)|0;ux(ao,42360,z,42016)|0;E=c[w>>2]|0;M=c[y>>2]|0;J=c[z>>2]|0;tF(2,44864,41616,(x=i,i=i+32|0,c[x>>2]=c[v>>2],c[x+8>>2]=E,c[x+16>>2]=M,c[x+24>>2]=J,x)|0);eP(Q,c[v>>2]|0,c[w>>2]|0);eJ(Q,c[v>>2]|0,c[y>>2]|0);eK(Q,c[v>>2]|0,c[z>>2]|0);ao=um(H,ao,44168)|0;}while((ao|0)!=0)}}while(0);ao=q|0;q=um(d,0,47672)|0;uu(q,47384,r,30)|0;uw(q,47104,p,0)|0;H=b+2424|0;fn(H,(q|0)!=0|0);e$(H,c[$>>2]|0);e0(H,c[L>>2]|0);a[b+2484|0]=c[p>>2]&255;if((q|0)!=0){if((c[15690]&1|0)==0){a2(ao|0,46800,(x=i,i=i+8|0,c[x>>2]=1,x)|0)|0;p=c[r>>2]|0;uu(q,ao,s,p)|0;ap=c[s>>2]|0}else{p=c[15692]|0;c[s>>2]=p;ap=p}fo(H,0,ap);ap=c[s>>2]|0;tF(2,46544,45856,(x=i,i=i+16|0,c[x>>2]=1,c[x+8>>2]=ap,x)|0);if((c[15690]&2|0)==0){a2(ao|0,46800,(x=i,i=i+8|0,c[x>>2]=2,x)|0)|0;ap=c[r>>2]|0;uu(q,ao,s,ap)|0;aq=c[s>>2]|0}else{ap=c[15693]|0;c[s>>2]=ap;aq=ap}fo(H,1,aq);aq=c[s>>2]|0;tF(2,46544,45856,(x=i,i=i+16|0,c[x>>2]=2,c[x+8>>2]=aq,x)|0);if((c[15690]&4|0)==0){a2(ao|0,46800,(x=i,i=i+8|0,c[x>>2]=3,x)|0)|0;aq=c[r>>2]|0;uu(q,ao,s,aq)|0;ar=c[s>>2]|0}else{aq=c[15694]|0;c[s>>2]=aq;ar=aq}fo(H,2,ar);ar=c[s>>2]|0;tF(2,46544,45856,(x=i,i=i+16|0,c[x>>2]=3,c[x+8>>2]=ar,x)|0);if((c[15690]&8|0)==0){a2(ao|0,46800,(x=i,i=i+8|0,c[x>>2]=4,x)|0)|0;ar=c[r>>2]|0;uu(q,ao,s,ar)|0;as=c[s>>2]|0}else{ar=c[15695]|0;c[s>>2]=ar;as=ar}fo(H,3,as);as=c[s>>2]|0;tF(2,46544,45856,(x=i,i=i+16|0,c[x>>2]=4,c[x+8>>2]=as,x)|0)}as=b+2644|0;fD(as);do{if((c[ag>>2]|0)!=0){s=um(d,0,50904)|0;H=nK(c[ag>>2]|0)|0;ar=H>>>0<768?0:H-768|0;c[m>>2]=ar;ut(s,57456,m,ar)|0;ut(s,50584,n,6e3)|0;ux(s,49640,o,0)|0;s=c[n>>2]|0;ar=c[o>>2]|0;tF(2,49160,48752,(x=i,i=i+24|0,c[x>>2]=c[m>>2],c[x+8>>2]=s,c[x+16>>2]=(ar|0)!=0?ar:48384,x)|0);ar=c[m>>2]|0;s=b+4644|0;c[s>>2]=ar;c[b+4648>>2]=ar-23552;ar=nG(c[ag>>2]|0)|0;ft(as,ar+(c[s>>2]|0)|0);fE(as,c[n>>2]|0);s=c[o>>2]|0;if((s|0)==0){break}if((fF(as,s)|0)==0){break}tD(0,47952,(x=i,i=i+8|0,c[x>>2]=c[o>>2],x)|0)}}while(0);o=tl(d,c[15608]|0)|0;c[aa>>2]=o;if((o|0)!=0){ve(o,ah,74);vf(c[aa>>2]|0,ah,34);vg(c[aa>>2]|0,ah,4)}if((c[ag>>2]|0)==0){at=c[$>>2]|0;au=tu(at,d)|0;av=c[aa>>2]|0;aw=vv(av,31208,51528)|0;ax=b+4700|0;c[ax>>2]=0;ay=b+4704|0;c[ay>>2]=0;az=t1(ay)|0;c[af>>2]=0;i=e;return}o=um(d,0,30136)|0;as=nK(c[ag>>2]|0)|0;ag=as>>>0<22784?0:as-22784|0;ut(o,57456,f,ag)|0;uu(o,56264,g,512)|0;uu(o,55472,h,342)|0;ut(o,55400,k,0)|0;ut(o,54720,l,16777215)|0;uu(o,54024,j,1e3)|0;o=c[g>>2]|0;as=c[h>>2]|0;n=((c[j>>2]|0)>>>0)/10|0;tF(2,53432,52544,(x=i,i=i+32|0,c[x>>2]=c[f>>2],c[x+8>>2]=o,c[x+16>>2]=as,c[x+24>>2]=n,x)|0);n=c[f>>2]|0;f=b+4636|0;c[f>>2]=n;if((ag|0)==(n|0)&n>>>0>32767){c[b+4640>>2]=ag-32768}else{c[b+4640>>2]=n}n=fL(c[g>>2]|0,c[h>>2]|0)|0;c[ab>>2]=n;if((n|0)==0){at=c[$>>2]|0;au=tu(at,d)|0;av=c[aa>>2]|0;aw=vv(av,31208,51528)|0;ax=b+4700|0;c[ax>>2]=0;ay=b+4704|0;c[ay>>2]=0;az=t1(ay)|0;c[af>>2]=0;i=e;return}fH(n,ah,242);dN(b,c[f>>2]|0);ah=c[aa>>2]|0;if((ah|0)!=0){fM(c[ab>>2]|0,ah);ah=c[aa>>2]|0;vt(ah,512,342)|0}fJ(c[ab>>2]|0,c[k>>2]|0,c[l>>2]|0);fK(c[ab>>2]|0,((((c[j>>2]|0)*255|0)+500|0)>>>0)/1e3|0);if((ac((c[g>>2]|0)>>>3,c[h>>2]|0)|0)==0){at=c[$>>2]|0;au=tu(at,d)|0;av=c[aa>>2]|0;aw=vv(av,31208,51528)|0;ax=b+4700|0;c[ax>>2]=0;ay=b+4704|0;c[ay>>2]=0;az=t1(ay)|0;c[af>>2]=0;i=e;return}else{aA=0}do{n3(c[$>>2]|0,(c[f>>2]|0)+aA|0,-1);aA=aA+1|0;}while(aA>>>0<(ac((c[g>>2]|0)>>>3,c[h>>2]|0)|0)>>>0);at=c[$>>2]|0;au=tu(at,d)|0;av=c[aa>>2]|0;aw=vv(av,31208,51528)|0;ax=b+4700|0;c[ax>>2]=0;ay=b+4704|0;c[ay>>2]=0;az=t1(ay)|0;c[af>>2]=0;i=e;return}function dE(a){a=a|0;var b=0;c[a+4700>>2]=0;b=a+4704|0;c[b>>2]=0;t1(b)|0;c[a+4696>>2]=0;return}function dF(a){a=a|0;var b=0,c=0,d=0;b=vP(4736)|0;c=b;if((b|0)==0){d=0}else{dD(c,a);d=c}return d|0}function dG(b,d){b=b|0;d=d|0;var e=0;e=(d|0)!=0;a[b+4676|0]=e&1;if(e){return}c[b+4700>>2]=0;e=b+4704|0;c[e>>2]=0;t1(e)|0;c[b+4696>>2]=0;return}function dH(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;if(b>>>0>1){i=e;return}c[a+4688+(b<<2)>>2]=d;d=c[a+4688>>2]|0;b=c[a+4692>>2]|0;if((b|0)==0){f=d}else{f=(d|0)==0|b>>>0<d>>>0?b:d}d=a+4684|0;if((f|0)==(c[d>>2]|0)){i=e;return}d$(31080,(x=i,i=i+8|0,c[x>>2]=f,x)|0);ef(a+1428|0,(f|0)!=1|0);c[d>>2]=f;f=a+4696|0;c[f>>2]=0;c[a+4700>>2]=0;d=a+4704|0;c[d>>2]=0;t1(d)|0;c[f>>2]=0;i=e;return}function dI(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=c[a+3480>>2]|0;if((e|0)==0){f=1;return f|0}f=vv(e,b,d)|0;return f|0}function dJ(a,b){a=a|0;b=b|0;var d=0;if((aQ(b|0,43704)|0)==0){ip(c[a+4>>2]|0);d=0;return d|0}if((aQ(b|0,40328)|0)==0){iq(c[a+4>>2]|0);d=0;return d|0}if((aQ(b|0,37296)|0)!=0){d=1;return d|0}ir(c[a+4>>2]|0);d=0;return d|0}function dK(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;e=b+4632|0;if((c[e>>2]|0)!=0){i=d;return}c[e>>2]=1;d$(34320,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);a[b+4652|0]=0;vV(b+4656|0,0,14);do{if((c[b>>2]&1|0)==0){d3(b,0);f=b+16|0;g=c[f>>2]|0;if((g|0)==0){break}if((c[g+40>>2]|0)>>>0<=7){break}h=b+4|0;j=c[h>>2]|0;k=nO(g,0)|0;if((c[j+36>>2]|0)>>>0>3){g=j+32|0;a[c[g>>2]|0]=k>>>24&255;a[(c[g>>2]|0)+1|0]=k>>>16&255;a[(c[g>>2]|0)+2|0]=k>>>8&255;a[(c[g>>2]|0)+3|0]=k&255}else{b3[c[j+28>>2]&63](c[j+4>>2]|0,0,k)}k=c[h>>2]|0;h=nO(c[f>>2]|0,4)|0;if((c[k+36>>2]|0)>>>0>7){f=k+32|0;a[(c[f>>2]|0)+4|0]=h>>>24&255;a[(c[f>>2]|0)+5|0]=h>>>16&255;a[(c[f>>2]|0)+6|0]=h>>>8&255;a[(c[f>>2]|0)+7|0]=h&255;break}else{b3[c[k+28>>2]&63](c[k+4>>2]|0,4,h);break}}else{d3(b,1)}}while(0);h=b+36|0;m8(h);a[b+4624|0]=-9;k=b+4625|0;a[k]=-1;mZ(h,-9);m_(h,a[k]|0);fy(b+2424|0);eS(b+2088|0);nx(b+128|0);k=c[b+1748>>2]|0;if((k|0)!=0){cD(k)}iK(c[b+4>>2]|0);c[b+4700>>2]=0;k=b+4704|0;c[k>>2]=0;t1(k)|0;c[b+4696>>2]=0;c[e>>2]=0;i=d;return}function dL(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;e=i;if((d|0)==0){f=c[(c[b+4>>2]|0)+372>>2]|0;g=(f|0)==0?1:f}else{g=d}d=c[b+4684>>2]|0;if((d|0)==0){h=(c[b+4696>>2]|0)+g|0;j=1}else{h=g;j=d}iM(c[b+4>>2]|0,h);fw(b+2644|0,h);h=b+4712|0;d=v2(c[h>>2]|0,c[h+4>>2]|0,g,0)|0;c[h>>2]=d;c[h+4>>2]=G;h=b+4720|0;d=(c[h>>2]|0)+g|0;c[h>>2]=d;g=b+4724|0;f=c[g>>2]|0;if(d>>>0<j>>>0){k=f}else{l=f;f=d;do{l=l+1|0;f=f-j|0;}while(f>>>0>=j>>>0);c[g>>2]=l;c[h>>2]=f;k=l}if(k>>>0<10){i=e;return}l=(k>>>0)/10|0;k=b+36|0;m9(k,l);f=b+1748|0;h=c[f>>2]|0;j=l*10|0;if((h|0)!=0){cF(h,j)}du(b+1760|0,l);c[g>>2]=(c[g>>2]|0)-j;g=b+4728|0;l=(c[g>>2]|0)+j|0;c[g>>2]=l;if(l>>>0<256){i=e;return}fO(c[b+3476>>2]|0,l);fk(b+3488|0,c[g>>2]|0);fk(b+4056|0,c[g>>2]|0);l=c[b+1744>>2]|0;if((l|0)!=0){dA(l,c[g>>2]|0)}l=b+4732|0;j=(c[l>>2]|0)+(c[g>>2]|0)|0;c[l>>2]=j;c[g>>2]=0;if(j>>>0<8192){i=e;return}j=c[b+3480>>2]|0;if((j|0)!=0){vA(j)}do{if((c[f>>2]|0)==0){j=b+4656|0;g=c[j>>2]|0;if((g+1|0)>>>0>2){h=b+4668|0;d=b+4625|0;m=a[d]|0;n=(a[h]|0)==0?m|16:m&-17;a[d]=n;if((g|0)>0){m=n^16;a[d]=m;o=g-2|0;p=m}else{o=g+2|0;p=n}c[j>>2]=o;m_(k,p);nu(b+128|0,a[h]|0);a[h]=(a[h]|0)==0|0}h=b+4660|0;j=c[h>>2]|0;if((j+1|0)>>>0<=2){break}n=b+4669|0;g=b+4625|0;m=a[g]|0;d=(a[n]|0)==0?m|32:m&-33;a[g]=d;if((j|0)>0){q=j-2|0;r=d}else{m=d^32;a[g]=m;q=j+2|0;r=m}c[h>>2]=q;m_(k,r);nv(b+128|0,a[n]|0);a[n]=(a[n]|0)==0|0}}while(0);eN(b+1428|0,c[l>>2]|0);r=b+4700|0;k=(c[r>>2]|0)+(c[l>>2]|0)|0;c[r>>2]=k;do{if(k>>>0>31333){c[r>>2]=k-31334;q=t1(b+4704|0)|0;do{if(q>>>0<4e3){p=b+4708|0;o=(c[p>>2]|0)+(4e3-q)|0;c[p>>2]=o;if((o|0)<=0){s=o;t=p;break}p=b+4696|0;c[p>>2]=(c[p>>2]|0)+1;u=o;v=1150}else{o=b+4708|0;p=(c[o>>2]|0)+(4e3-q)|0;c[o>>2]=p;if((p|0)>=0){u=p;v=1150;break}o=b+4696|0;f=c[o>>2]|0;if((f|0)==0){u=p;v=1150;break}c[o>>2]=f-1;u=p;v=1150}}while(0);do{if((v|0)==1150){q=b+4708|0;if((u|0)<=9999){s=u;t=q;break}t0(u)|0;s=c[q>>2]|0;t=q}}while(0);if((s|0)>=-1e6){break}d$(32008,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);c[t>>2]=(c[t>>2]|0)+1e6}}while(0);c[l>>2]=0;i=e;return}function dM(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;i=i+376|0;g=f|0;if(e<<24>>24==0){i=f;return}e=b+36|0;mX(e,0);mX(e,1);fG(b+2644|0);e=b+8|0;h=b+4644|0;j=0;while(1){k=j+1|0;a[g+j|0]=n$(c[e>>2]|0,k+(c[h>>2]|0)|0)|0;if(k>>>0<370){j=k}else{break}}if((c[b>>2]&4|0)==0){df(b+1760|0,g|0,370);i=f;return}j=(d[7096+(a[g|0]&63)|0]|0)*370|0;if(j>>>0<370){l=1}else{l=j>>>0>11839?31:(j>>>0)/370|0}j=(((((31-l|0)*223|0)+15|0)>>>0)/30|0)+32|0;l=c[b+3476>>2]|0;if((l|0)==0){i=f;return}if((c[l+28>>2]|0)==(j|0)){i=f;return}fK(l,j);i=f;return}function dN(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=a+12|0;do{if((nK(c[d>>2]|0)|0)>>>0>b>>>0){e=(nG(c[d>>2]|0)|0)+b|0}else{f=nQ(c[a+8>>2]|0,b)|0;if((f|0)!=0){g=nG(f)|0;h=nI(f)|0;e=g+(h-(c[a+4636>>2]|0))|0;break}fI(c[a+3476>>2]|0,0);return}}while(0);fI(c[a+3476>>2]|0,e);return}function dO(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;if((b|0)==3){e=a;c6(e,d)|0;return}e=c[a+1744>>2]|0;if((e|0)!=0){dy(e,b,d)}e=c[a+1752>>2]|0;if((e|0)==0){return}cK(e,b,d);return}function dP(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0;g=b+4676|0;if((a[g]|0)!=0){if((f|0)==0){return}a[g]=0;c[b+4700>>2]=0;g=b+4704|0;c[g>>2]=0;t1(g)|0;c[b+4696>>2]=0;return}g=c[b+1756>>2]|0;if((g|0)!=0){cI(g,f,d,e);return}g=b+4664|0;if(((f&2^2)&(c[g>>2]^f)|0)!=0){h=c[b+3480>>2]|0;vv(h,51920,51400)|0}h=b+4625|0;i=a[h]|0;j=(f&1|0)==0?i|8:i&-9;a[h]=j;if(j<<24>>24!=i<<24>>24){m_(b+36|0,j)}j=b+4656|0;c[j>>2]=(c[j>>2]|0)+d;d=b+4660|0;c[d>>2]=(c[d>>2]|0)+e;c[g>>2]=f;return}function dQ(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;e=b<<24>>24!=0;b=e?4:0;c[a+4692>>2]=b;f=c[a+4688>>2]|0;if(e){g=(f|0)==0|b>>>0<f>>>0?b:f}else{g=f}f=a+4684|0;if((g|0)==(c[f>>2]|0)){i=d;return}d$(31080,(x=i,i=i+8|0,c[x>>2]=g,x)|0);ef(a+1428|0,(g|0)!=1|0);c[f>>2]=g;g=a+4696|0;c[g>>2]=0;c[a+4700>>2]=0;f=a+4704|0;c[f>>2]=0;t1(f)|0;c[g>>2]=0;i=d;return}function dR(b,c){b=b|0;c=c|0;var d=0,e=0,f=0;d=b+4625|0;e=a[d]|0;f=c<<24>>24==0?e|8:e&-9;a[d]=f;m_(b+36|0,f);return}function dS(b,c){b=b|0;c=c|0;var d=0,e=0,f=0;d=b+4625|0;e=a[d]|0;f=c<<24>>24==0?e&-2:e|1;a[d]=f;m_(b+36|0,f);return}function dT(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=b+4652|0;f=a[e]|0;g=d<<24>>24==0?f&-5:f|4;a[e]=g;e=g&255;g=0;while(1){f=e>>>1;if((f|0)==0){break}else{e=f;g=g+1|0}}ix(c[b+4>>2]|0,g);return}function dU(a){a=a|0;c[15612]=1;return}function dV(a,b){a=a|0;b=b|0;var c=0;if((b|0)==2097150){c=nq(a+128|0)|0}else if((b|0)==2097148){c=nr(a+128|0)|0}else if((b|0)==2097146){c=nm(a+128|0)|0}else if((b|0)==2097144){c=nn(a+128|0)|0}else{c=-1}return c|0}function dW(a,b,c){a=a|0;b=b|0;c=c|0;if((b|0)==4194301){nt(a+128|0,c);return}else if((b|0)==4194297){np(a+128|0,c);return}else if((b|0)==4194303){ns(a+128|0,c);return}else if((b|0)==4194299){no(a+128|0,c);return}else{return}}function dX(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=b+4652|0;f=a[e]|0;g=d<<24>>24==0?f&-3:f|2;a[e]=g;e=g&255;g=0;while(1){f=e>>>1;if((f|0)==0){break}else{e=f;g=g+1|0}}ix(c[b+4>>2]|0,g);return}function dY(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0;e=i;f=b;g=b+4624|0;h=a[g]|0;j=d&255;if(h<<24>>24==d<<24>>24){i=e;return}a[g]=d;g=(h^d)&255;do{if((g&16|0)!=0){h=c[b>>2]|0;if((h&1|0)!=0){d3(f,j>>>4&1);break}if((h&6|0)==0){break}dk(b+1760|0,(d&255)>>>4&1)}}while(0);if((g&32|0)!=0){dl(b+1760|0,(d&255)>>>5&1)}if((g&64|0)!=0){if((j&64|0)==0){d$(30952,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);k=b+4640|0}else{d$(31016,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);k=b+4636|0}dN(f,c[k>>2]|0)}do{if((g&8|0)!=0){if((c[b>>2]&1|0)==0){break}k=nG(c[b+12>>2]|0)|0;if((j&8|0)==0){d$(30592,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);l=b+4648|0}else{d$(30712,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);l=b+4644|0}ft(b+2644|0,k+(c[l>>2]|0)|0)}}while(0);if((g&7|0)==0){i=e;return}fu(b+2644|0,j&7);i=e;return}function dZ(b,d){b=b|0;d=d|0;var e=0,f=0;e=b+4625|0;f=a[e]|0;if(f<<24>>24==d<<24>>24){return}a[e]=d;eM(b+1428|0,d);if((f^d)<<24>>24<0){fv(b+2644|0,(d&255)>>>7&255^1)}f=c[b+1748>>2]|0;if((f|0)==0){return}cE(f,(d&255)>>>4&3);return}function d_(a,b){a=a|0;b=b|0;if(b<<24>>24==0){return}dK(a);return}function d$(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;i=i+16|0;e=d|0;f=c[15610]|0;if((f|0)==0){g=0}else{g=(ii(c[f+4>>2]|0,0)|0)&16777215}tD(3,46048,(x=i,i=i+8|0,c[x>>2]=g,x)|0);g=e;c[g>>2]=b;c[g+4>>2]=0;tE(3,a,e|0);i=d;return}function d0(){tT(0,1);return}function d1(a,b,d){a=a|0;b=b|0;d=d|0;return(it(c[a+4>>2]|0,b,d)|0)!=0|0}function d2(a,b,d){a=a|0;b=b|0;d=d|0;return(iu(c[a+4>>2]|0,b,d)|0)!=0|0}function d3(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=a+4628|0;e=(b|0)!=0;if((c[d>>2]|0)==(e&1|0)){return}b=a+8|0;f=c[b>>2]|0;if(e){n_(f,c[a+12>>2]|0);nZ(c[b>>2]|0,c[a+24>>2]|0,0);nZ(c[b>>2]|0,c[a+20>>2]|0,0);h6(c[a+4>>2]|0,0,0);c[d>>2]=1;return}else{n_(f,c[a+24>>2]|0);n_(c[b>>2]|0,c[a+20>>2]|0);f=a+12|0;nZ(c[b>>2]|0,c[f>>2]|0,0);b=c[a+4>>2]|0;a=nG(c[f>>2]|0)|0;h6(b,a,nK(c[f>>2]|0)|0);c[d>>2]=0;return}}function d4(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;do{if(b>>>0<4194304){d=c[a+12>>2]|0;if((d|0)==0){break}e=nK(d)|0;if((e|0)==0){break}d=(b>>>0)%(e>>>0)|0;if((d|0)!=(b|0)){f=d;g=1304}}else{if(b>>>0>=5767168){break}d=c[a+16>>2]|0;if((d|0)==0){break}e=nK(d)|0;if((e|0)==0){break}d=((b>>>0)%(e>>>0)|0)+4194304|0;if((d|0)!=(b|0)){f=d;g=1304}}}while(0);if((g|0)==1304){h=n$(c[a+8>>2]|0,f)|0;return h|0}if((b-5767168|0)>>>0<524288){h=0;return h|0}f=b-12582912|0;if(f>>>0<2097152){h=dn(a+1760|0,f)|0;return h|0}else{h=(b&15728640|0)==13631488?-86:0;return h|0}return 0}function d5(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;do{if(b>>>0<4194304){d=c[a+12>>2]|0;if((d|0)==0){e=0;break}f=nK(d)|0;if((f|0)==0){e=0;break}d=(b>>>0)%(f>>>0)|0;if((d|0)==(b|0)){e=0}else{g=d;h=1322}}else{if(b>>>0>=5767168){e=0;break}d=c[a+16>>2]|0;if((d|0)==0){e=0;break}f=nK(d)|0;if((f|0)==0){e=0;break}d=((b>>>0)%(f>>>0)|0)+4194304|0;if((d|0)==(b|0)){e=0}else{g=d;h=1322}}}while(0);if((h|0)==1322){e=n0(c[a+8>>2]|0,g)|0}return e|0}function d6(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;do{if(b>>>0<4194304){d=c[a+12>>2]|0;if((d|0)==0){e=0;break}f=nK(d)|0;if((f|0)==0){e=0;break}d=(b>>>0)%(f>>>0)|0;if((d|0)==(b|0)){e=0}else{g=d;h=1332}}else{if(b>>>0>=5767168){e=0;break}d=c[a+16>>2]|0;if((d|0)==0){e=0;break}f=nK(d)|0;if((f|0)==0){e=0;break}d=((b>>>0)%(f>>>0)|0)+4194304|0;if((d|0)==(b|0)){e=0}else{g=d;h=1332}}}while(0);if((h|0)==1332){e=n1(c[a+8>>2]|0,g)|0}return e|0}function d7(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;do{if(b>>>0<4194304){e=c[a+12>>2]|0;if((e|0)==0){return}f=nK(e)|0;if((f|0)==0){return}e=(b>>>0)%(f>>>0)|0;if((e|0)!=(b|0)){g=e;h=1342;break}return}else{if(b>>>0>=5767168){i=b;break}e=c[a+16>>2]|0;if((e|0)==0){i=b;break}f=nK(e)|0;if((f|0)==0){i=b;break}e=((b>>>0)%(f>>>0)|0)+4194304|0;if((e|0)==(b|0)){i=b}else{g=e;h=1342}}}while(0);if((h|0)==1342){n3(c[a+8>>2]|0,g,d);i=g}if(!((i-5767168|0)>>>0>524287&i>>>0>12582911&i>>>0<14680064)){return}dt(a+1760|0,i-12582912|0,d);return}function d8(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;do{if(b>>>0<4194304){e=c[a+12>>2]|0;if((e|0)==0){return}f=nK(e)|0;if((f|0)==0){return}e=(b>>>0)%(f>>>0)|0;if((e|0)!=(b|0)){g=e;break}return}else{if(b>>>0>=5767168){return}e=c[a+16>>2]|0;if((e|0)==0){return}f=nK(e)|0;if((f|0)==0){return}e=((b>>>0)%(f>>>0)|0)+4194304|0;if((e|0)!=(b|0)){g=e;break}return}}while(0);n4(c[a+8>>2]|0,g,d);return}function d9(a){a=a|0;tT(0,1);aC(51840,32,1,c[q>>2]|0)|0;ay(c[q>>2]|0)|0;a=c[15610]|0;if((a|0)==0){a1(1)}if((c[a+4>>2]|0)==0){a1(1)}cW(a,56328);a1(1)}function ea(a){a=a|0;tT(0,1);bN(c[q>>2]|0,49872,(x=i,i=i+8|0,c[x>>2]=a,x)|0)|0;ay(c[q>>2]|0)|0;a1(1)}function eb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,r=0;d=i;i=i+8|0;e=d|0;tm();tn(c[q>>2]|0,0,2)|0;f=uk(0)|0;c[15696]=f;if((f|0)==0){g=1;i=d;return g|0}up(62736);tw(c[q>>2]|0,3);f=te(a,b,e,7160)|0;do{if((f|0)==-1){tD(2,52352,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);h=42592;j=1402}else{k=42592;l=f;while(1){if((l|0)<0){g=1;j=1412;break}if((l|0)==86){j=1383;break}else if((l|0)==115){uy(62736,58016,c[c[e>>2]>>2]|0,33496)|0;m=k}else if((l|0)==73){uy(62736,c[c[e>>2]>>2]|0,33496,0)|0;m=k}else if((l|0)==0){j=1400;break}else if((l|0)==98){c[15690]=c[15690]|1;c[15692]=ax(c[c[e>>2]>>2]|0,0,0)|0;m=k}else if((l|0)==66){n=ax(c[c[e>>2]>>2]|0,0,0)|0;if((n|0)==0|n>>>0>3){j=1386;break}r=n-1|0;c[15690]=c[15690]|1<<r;c[62768+(r<<2)>>2]=ax(c[(c[e>>2]|0)+4>>2]|0,0,0)|0;m=k}else if((l|0)==112){uy(62736,31696,c[c[e>>2]>>2]|0,30792)|0;m=k}else if((l|0)==105){if((t2(c[15696]|0,c[c[e>>2]>>2]|0)|0)==0){m=k}else{j=1391;break}}else if((l|0)==63){j=1382;break}else if((l|0)==99){m=c[c[e>>2]>>2]|0}else if((l|0)==108){tv(c[c[e>>2]>>2]|0,3)|0;m=k}else if((l|0)==113){tw(c[q>>2]|0,0);m=k}else if((l|0)==114|(l|0)==82){m=k}else if((l|0)==116){c[15608]=c[c[e>>2]>>2];m=k}else if((l|0)==100){tQ(c[c[e>>2]>>2]|0)|0;m=k}else if((l|0)==118){tw(c[q>>2]|0,3);m=k}else{g=1;j=1410;break}r=te(a,b,e,7160)|0;if((r|0)==-1){j=1401;break}else{k=m;l=r}}if((j|0)==1386){l=c[q>>2]|0;k=c[b>>2]|0;bN(l|0,39408,(x=i,i=i+16|0,c[x>>2]=k,c[x+8>>2]=n,x)|0)|0;g=1;i=d;return g|0}else if((j|0)==1383){aC(51744,93,1,c[o>>2]|0)|0;ay(c[o>>2]|0)|0;g=0;i=d;return g|0}else if((j|0)==1400){k=c[c[e>>2]>>2]|0;bN(c[q>>2]|0,57168,(x=i,i=i+16|0,c[x>>2]=c[b>>2],c[x+8>>2]=k,x)|0)|0;g=1;i=d;return g|0}else if((j|0)==1401){tD(2,52352,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);if((m|0)==0){break}else{h=m;j=1402;break}}else if((j|0)==1382){td(51272,50792,7160);ay(c[o>>2]|0)|0;g=0;i=d;return g|0}else if((j|0)==1391){k=c[c[e>>2]>>2]|0;bN(c[q>>2]|0,36464,(x=i,i=i+16|0,c[x>>2]=c[b>>2],c[x+8>>2]=k,x)|0)|0;g=1;i=d;return g|0}else if((j|0)==1410){i=d;return g|0}else if((j|0)==1412){i=d;return g|0}}}while(0);do{if((j|0)==1402){tF(2,54584,53928,(x=i,i=i+8|0,c[x>>2]=h,x)|0);if((t6(c[15696]|0,h)|0)==0){break}tD(0,53304,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);g=1;i=d;return g|0}}while(0);h=um(c[15696]|0,0,56008)|0;j=(h|0)==0?c[15696]|0:h;if((uz(62736,j,1)|0)==0){aU(2)|0;bb(0)|0;tS(j)|0;aN(2,210)|0;aN(11,416)|0;aN(15,408)|0;s9(c[p>>2]|0,c[o>>2]|0);c[15610]=dF(j)|0;tG(62472);tx(62472,14,c[15610]|0);ty(62472,74,c[15610]|0);tz(62472,c[(c[15610]|0)+8>>2]|0,26);tA(62472,c[(c[15610]|0)+8>>2]|0,12);tB(62472,0);s1(c[15610]|0,20,36);c1(c[15610]|0,62472);dK(c[15610]|0);cZ(c[15610]|0);a1(1);return 0}else{g=1;i=d;return g|0}return 0}function ec(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;d=b;while(1){b=a[d]|0;if((b-48&255)<=9){e=d;f=0;g=b;h=1420;break}if(b<<24>>24==0){i=0;j=d;break}else{d=d+1|0}}if((h|0)==1420){while(1){h=0;d=(g<<24>>24)-48+(f*10|0)|0;b=e+1|0;k=a[b]|0;if((k-48&255)<10){e=b;f=d;g=k;h=1420}else{i=d;j=b;break}}}g=j;while(1){j=a[g]|0;if((j-48&255)<=9){l=g;m=0;n=j;h=1430;break}if(j<<24>>24==0){o=0;p=g;break}else{g=g+1|0}}if((h|0)==1430){while(1){h=0;g=(n<<24>>24)-48+(m*10|0)|0;j=l+1|0;f=a[j]|0;if((f-48&255)<10){l=j;m=g;n=f;h=1430}else{o=g;p=j;break}}}n=p;while(1){p=a[n]|0;if((p-48&255)<=9){q=n;r=0;s=p;h=1434;break}if(p<<24>>24==0){t=0;u=n;break}else{n=n+1|0}}if((h|0)==1434){while(1){h=0;n=(s<<24>>24)-48+(r*10|0)|0;p=q+1|0;m=a[p]|0;if((m-48&255)<10){q=p;r=n;s=m;h=1434}else{t=n;u=p;break}}}s=u;while(1){u=a[s]|0;if((u-48&255)<=9){v=s;w=0;x=u;h=1438;break}if(u<<24>>24==0){y=0;z=s;break}else{s=s+1|0}}if((h|0)==1438){while(1){h=0;s=(x<<24>>24)-48+(w*10|0)|0;u=v+1|0;r=a[u]|0;if((r-48&255)<10){v=u;w=s;x=r;h=1438}else{y=s;z=u;break}}}x=z;while(1){z=a[x]|0;if((z-48&255)<=9){A=x;B=0;C=z;h=1442;break}if(z<<24>>24==0){D=0;E=x;break}else{x=x+1|0}}if((h|0)==1442){while(1){h=0;x=(C<<24>>24)-48+(B*10|0)|0;z=A+1|0;w=a[z]|0;if((w-48&255)<10){A=z;B=x;C=w;h=1442}else{D=x;E=z;break}}}C=E;while(1){E=a[C]|0;if((E-48&255)<=9){F=C;G=0;H=E;h=1446;break}if(E<<24>>24==0){I=0;break}else{C=C+1|0}}if((h|0)==1446){while(1){h=0;C=(H<<24>>24)-48+(G*10|0)|0;E=F+1|0;B=a[E]|0;if((B-48&255)<10){F=E;G=C;H=B;h=1446}else{I=C;break}}}h=(o|0)==0?0:o-1|0;o=(t|0)==0?0:t-1|0;do{if(i>>>0<1904|h>>>0>11){J=0}else{t=i-1904|0;H=t&3;G=((t>>>2)*1461|0)+(H*365|0)+((H|0)!=0)|0;t=(H|0)==0?7736:7688;if((h|0)==0){K=G}else{H=G;G=0;while(1){F=(c[t+(G<<2)>>2]|0)+H|0;C=G+1|0;if(C>>>0<h>>>0){H=F;G=C}else{K=F;break}}}if((c[t+(h<<2)>>2]|0)>>>0<=o>>>0){J=0;break}J=(K+o|0)*86400|0}}while(0);if(y>>>0>23|D>>>0>59|I>>>0>59){L=0;M=L+J|0;return M|0}L=(((y*60|0)+D|0)*60|0)+I|0;M=L+J|0;return M|0}function ed(a,b,d){a=a|0;b=b|0;d=d|0;c[a+292>>2]=b;c[a+296>>2]=d;return}function ee(a,b,d){a=a|0;b=b|0;d=d|0;c[a+304>>2]=b;c[a+308>>2]=d;return}function ef(a,b){a=a|0;b=b|0;c[a+284>>2]=(b|0)!=0;return}function eg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;do{if(b>>>0<4194304){e=c[a+12>>2]|0;if((e|0)==0){return}f=nK(e)|0;if((f|0)==0){return}e=(b>>>0)%(f>>>0)|0;if((e|0)!=(b|0)){g=e;break}return}else{if(b>>>0>=5767168){return}e=c[a+16>>2]|0;if((e|0)==0){return}f=nK(e)|0;if((f|0)==0){return}e=((b>>>0)%(f>>>0)|0)+4194304|0;if((e|0)!=(b|0)){g=e;break}return}}while(0);n5(c[a+8>>2]|0,g,d);return}function eh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=(a|0)==0?c[15610]|0:a;if((b|0)==0){f=1;return f|0}a=(d|0)==0?62968:d;d=6432;while(1){g=c[d>>2]|0;if((g|0)==0){break}if((tJ(g,b)|0)==0){d=d+8|0}else{h=1476;break}}if((h|0)==1476){f=b2[c[d+4>>2]&127](e,b,a)|0;return f|0}d=c[e+3480>>2]|0;do{if((d|0)!=0){e=vv(d,b,a)|0;if((e|0)>-1){f=e}else{break}return f|0}}while(0);f=1;return f|0}function ei(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;b=i;if((dJ(a,d)|0)==0){e=0;i=b;return e|0}tD(0,41512,(x=i,i=i+8|0,c[x>>2]=d,x)|0);e=1;i=b;return e|0}function ej(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;b=i;i=i+8|0;e=b|0;if((tK(d,e)|0)==0){dH(a,0,c[e>>2]|0);f=0}else{f=1}i=b;return f|0}function ek(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;b=i;i=i+8|0;e=b|0;if((tL(d,e)|0)!=0){f=1;i=b;return f|0}d=(c[e>>2]|0)+(c[a+4684>>2]|0)|0;g=(d|0)<1?1:d;c[e>>2]=g;dH(a,0,g);f=0;i=b;return f|0}function el(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;d=i;i=i+16|0;f=d|0;g=d+8|0;c[f>>2]=e;if((aQ(e|0,44088)|0)==0){tD(2,43808,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);if((oO(c[b+3484>>2]|0)|0)==0){h=0;i=d;return h|0}tD(0,43568,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);h=1;i=d;return h|0}e=b+3484|0;b=0;L1910:while(1){do{if((a[c[f>>2]|0]|0)==0){h=b;j=1509;break L1910}if((tO(f,g,48248,47872)|0)!=0){break L1910}tD(2,42968,(x=i,i=i+8|0,c[x>>2]=c[g>>2],x)|0);}while((oP(c[e>>2]|0,c[g>>2]|0,42264,0)|0)==0);tD(0,41896,(x=i,i=i+8|0,c[x>>2]=c[g>>2],x)|0);b=1}if((j|0)==1509){i=d;return h|0}tD(0,43232,(x=i,i=i+8|0,c[x>>2]=c[f>>2],x)|0);h=1;i=d;return h|0}function em(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;d=i;i=i+16|0;f=d|0;g=d+8|0;c[f>>2]=e;if((a[e]|0)==0){h=0;i=d;return h|0}e=b+3484|0;while(1){if((tO(f,g,48248,47872)|0)!=0){break}b=oH(c[e>>2]|0,c[g>>2]|0)|0;j=c[g>>2]|0;if((b|0)==0){tD(0,44712,(x=i,i=i+8|0,c[x>>2]=j,x)|0)}else{tD(2,44352,(x=i,i=i+8|0,c[x>>2]=j,x)|0);j=c[e>>2]|0;oG(j,b)|0;oE(b)}if((a[c[f>>2]|0]|0)==0){h=0;k=1523;break}}if((k|0)==1523){i=d;return h|0}tD(0,45072,(x=i,i=i+8|0,c[x>>2]=c[f>>2],x)|0);h=1;i=d;return h|0}function en(a,b,d){a=a|0;b=b|0;d=d|0;return(tf(c[a+3484>>2]|0,d,1)|0)!=0|0}function eo(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;b=i;i=i+8|0;e=b|0;if((tK(d,e)|0)!=0){f=1;i=b;return f|0}d=oH(c[a+3484>>2]|0,c[e>>2]|0)|0;if((d|0)==0){f=0;i=b;return f|0}tD(2,45392,(x=i,i=i+8|0,c[x>>2]=c[e>>2],x)|0);ow(d,1);f=0;i=b;return f|0}function ep(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;b=i;i=i+8|0;e=b|0;if((tK(d,e)|0)!=0){f=1;i=b;return f|0}d=oH(c[a+3484>>2]|0,c[e>>2]|0)|0;if((d|0)==0){f=0;i=b;return f|0}tD(2,45752,(x=i,i=i+8|0,c[x>>2]=c[e>>2],x)|0);ow(d,0);f=0;i=b;return f|0}function eq(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;b=i;i=i+8|0;e=b|0;if((tK(d,e)|0)!=0){f=1;i=b;return f|0}d=c[e>>2]|0;if((d|0)==0){tD(2,46704,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);g=a+1760|0;dd(g,0,1);dd(g,1,1);dd(g,2,1);f=0;i=b;return f|0}else{tD(2,46432,(x=i,i=i+8|0,c[x>>2]=d,x)|0);dd(a+1760|0,(c[e>>2]|0)-1|0,1);f=0;i=b;return f|0}return 0}function er(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;b=i;i=i+8|0;e=b|0;if((tK(d,e)|0)!=0){f=1;i=b;return f|0}d=c[e>>2]|0;if((d|0)==0){tD(2,47288,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);g=a+1760|0;dd(g,0,0);dd(g,1,0);dd(g,2,0);f=0;i=b;return f|0}else{tD(2,47016,(x=i,i=i+8|0,c[x>>2]=d,x)|0);dd(a+1760|0,(c[e>>2]|0)-1|0,0);f=0;i=b;return f|0}return 0}function es(a,b,d){a=a|0;b=b|0;d=d|0;d=i;b=a+1760|0;a=dc(b,0)|0;tb(47552,(x=i,i=i+16|0,c[x>>2]=1,c[x+8>>2]=a,x)|0);a=dc(b,1)|0;tb(47552,(x=i,i=i+16|0,c[x>>2]=2,c[x+8>>2]=a,x)|0);a=dc(b,2)|0;tb(47552,(x=i,i=i+16|0,c[x>>2]=3,c[x+8>>2]=a,x)|0);i=d;return 0}function et(a,b,d){a=a|0;b=b|0;d=d|0;c[a+4680>>2]=2;tC(62472,1);return 0}function eu(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;b=i;i=i+8|0;e=b|0;if((tM(d,e)|0)==0){dG(a,c[e>>2]|0);f=0}else{f=1}i=b;return f|0}function ev(b,c,d){b=b|0;c=c|0;d=d|0;dG(b,(a[b+4676|0]|0)==0|0);return 0}function ew(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;b=i;i=i+8|0;e=b|0;if((tM(d,e)|0)!=0){f=1;i=b;return f|0}dH(a,0,(c[e>>2]|0)!=0|0);f=0;i=b;return f|0}function ex(a,b,d){a=a|0;b=b|0;d=d|0;if((c[a+4688>>2]|0)==0){dH(a,0,1);return 0}else{dH(a,0,0);return 0}return 0}function ey(a,b,c){a=a|0;b=b|0;c=c|0;dK(a);return 0}function ez(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;b=i;i=i+16|0;e=b|0;f=b+8|0;c[e>>2]=d;if((tO(e,f,48248,47872)|0)!=0){g=1;i=b;return g|0}d=c[f>>2]|0;if(d>>>0>1){g=1;i=b;return g|0}g=(fd(a+3488+(d*568|0)|0,c[e>>2]|0)|0)!=0|0;i=b;return g|0}function eA(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;b=i;i=i+16|0;e=b|0;f=b+8|0;c[e>>2]=d;if((tO(e,f,48248,47872)|0)!=0){g=1;i=b;return g|0}d=c[f>>2]|0;if(d>>>0>1){g=1;i=b;return g|0}g=(fe(a+3488+(d*568|0)|0,c[e>>2]|0)|0)!=0|0;i=b;return g|0}function eB(a,b,d){a=a|0;b=b|0;d=d|0;dI(a,49032,48672)|0;c[a+4680>>2]=1;return 0}function eC(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;b=i;i=i+8|0;e=b|0;if((tK(d,e)|0)!=0){f=1;i=b;return f|0}d=c[e>>2]|0;if(d>>>0>999){g=255}else{g=(d<<8>>>0)/1e3|0}c[e>>2]=g;fK(c[a+3476>>2]|0,g);f=0;i=b;return f|0}function eD(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;d=i;i=i+8|0;f=d|0;do{if((a[e]|0)==0){g=b+2424|0;if((a[b+2426|0]|0)==0){h=0;break}fq(g,1);fq(g,2);fq(g,3);h=0}else{if((tK(e,f)|0)!=0){h=1;break}if((a[b+2426|0]|0)==0){g=c[f>>2]|0;dm(b+1760|0,(g|0)==0?0:g-1|0);h=0;break}else{fq(b+2424|0,c[f>>2]|0);h=0;break}}}while(0);i=d;return h|0}function eE(b){b=b|0;c[b+304>>2]=0;c[b+308>>2]=0;a[b+312|0]=0;vV(b|0,0,258);vV(b+260|0,0,20);vV(b+283|0,0,18);a[b+16|0]=-88;a[b+19|0]=34;a[b+30|0]=100;a[b+8|0]=24;a[b+9|0]=-120;a[b+11|0]=32;return}function eF(b,c){b=b|0;c=c|0;var d=0,e=0;d=bl(c|0,46784)|0;if((d|0)==0){e=1;return e|0}c=(bK(b|0,1,256,d|0)|0)==256;av(d|0)|0;if(!c){e=1;return e|0}a[b+256|0]=-128;a[b+257|0]=0;e=0;return e|0}function eG(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0;f=bZ(0)|0;c[a+260>>2]=f+2082844800;if((e|0)==0){e=((d[a+237|0]|0)<<8|(d[a+238|0]|0))<<8;g=e|(d[a+239|0]|0);c[a+264>>2]=-2082844800-f+b-((e&8388608|0)==0?g:g|-16777216);return}else{c[a+264>>2]=b;return}}function eH(a,b){a=a|0;b=b|0;return 0}function eI(a,b){a=a|0;b=b|0;c[a+332>>2]=b;return}function eJ(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;e=c&7;c=a[d]|0;if(c<<24>>24==0){a[b+76+(e<<5)+8|0]=32;f=d}else{a[b+76+(e<<5)+8|0]=c;f=d+1|0}d=a[f]|0;if(d<<24>>24==0){a[b+76+(e<<5)+9|0]=32;g=f}else{a[b+76+(e<<5)+9|0]=d;g=f+1|0}f=a[g]|0;if(f<<24>>24==0){a[b+76+(e<<5)+10|0]=32;h=g}else{a[b+76+(e<<5)+10|0]=f;h=g+1|0}g=a[h]|0;if(g<<24>>24==0){a[b+76+(e<<5)+11|0]=32;i=h}else{a[b+76+(e<<5)+11|0]=g;i=h+1|0}h=a[i]|0;if(h<<24>>24==0){a[b+76+(e<<5)+12|0]=32;j=i}else{a[b+76+(e<<5)+12|0]=h;j=i+1|0}i=a[j]|0;if(i<<24>>24==0){a[b+76+(e<<5)+13|0]=32;k=j}else{a[b+76+(e<<5)+13|0]=i;k=j+1|0}j=a[k]|0;if(j<<24>>24==0){a[b+76+(e<<5)+14|0]=32;l=k}else{a[b+76+(e<<5)+14|0]=j;l=k+1|0}k=a[l]|0;l=b+76+(e<<5)+15|0;if(k<<24>>24==0){m=32;a[l]=m;return}else{m=k;a[l]=m;return}}function eK(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0;e=c&7;c=0;f=d;while(1){d=a[f]|0;if(d<<24>>24==0){a[b+76+(e<<5)+16+c|0]=32;g=f}else{a[b+76+(e<<5)+16+c|0]=d;g=f+1|0}d=c+1|0;if(d>>>0<16){c=d;f=g}else{break}}return}function eL(a,b){a=a|0;b=b|0;var e=0,f=0,g=0;if((b|0)==0){c[a+260>>2]=(bZ(0)|0)+2082844800;c[a+264>>2]=0;return}else{e=ec(b)|0;b=bZ(0)|0;c[a+260>>2]=b+2082844800;f=((d[a+237|0]|0)<<8|(d[a+238|0]|0))<<8;g=f|(d[a+239|0]|0);c[a+264>>2]=e-2082844800-b-((f&8388608|0)==0?g:g|-16777216);return}}function eM(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;f=b+283|0;g=a[f]|0;h=e&255;a[f]=e;if((h&4|0)!=0){c[b+272>>2]=0;c[b+268>>2]=0;c[b+276>>2]=0;return}if(((h&2^2)&((g^e)&255)|0)==0){return}g=b+268|0;h=b+282|0;f=a[h]|0;if((c[g>>2]|0)!=0){i=(f&255)>>>7;a[b+300|0]=i;j=c[b+296>>2]|0;if((j|0)==0){k=f}else{b1[j&511](c[b+292>>2]|0,i);k=a[h]|0}a[h]=k<<1|(k&255)>>>7;k=b+276|0;i=(c[k>>2]|0)+1|0;c[k>>2]=i;if(i>>>0<=7){return}c[k>>2]=0;c[g>>2]=0;c[b+272>>2]=0;return}k=f<<1;f=k|e&1;a[h]=f;e=b+276|0;i=(c[e>>2]|0)+1|0;c[e>>2]=i;if(i>>>0<=7){return}i=b+272|0;j=c[i>>2]|0;do{if((j|0)==1){l=a[b+280|0]|0;m=l&255;do{if(l<<24>>24==53){a[b+256|0]=k&-128}else{if((a[b+256|0]|0)<0){break}if((m&227|0)==1){n=m>>>2<<3&24;o=b+260|0;c[o>>2]=c[o>>2]&~(255<<n)|(f&255)<<n;break}if((m&243|0)==33){a[b+(m>>>2&3|8)|0]=f;break}if(l<<24>>24==49){a[b+257|0]=f;break}if((m&195|0)!=65){break}a[b+(m>>>2&15|16)|0]=f}}while(0);c[i>>2]=0}else if((j|0)==2){a[b+281|0]=f;m=a[b+280|0]|0;if(m<<24>>24<0){a[h]=a[b+((m&255)<<5&224|(k&255)>>>2&31)|0]|0;c[i>>2]=0;c[g>>2]=1;break}else{c[i>>2]=3;break}}else if((j|0)==0){a[b+280|0]=f;m=f&255;if((m&120|0)==56){c[i>>2]=2;break}if((m&128|0)==0){c[i>>2]=1;break}l=m>>>2;do{if((m&227|0)==129){a[h]=(c[b+260>>2]|0)>>>((l<<3&24)>>>0)&255}else{if((m&243|0)==161){a[h]=a[b+(l&3|8)|0]|0;break}if((m&195|0)==193){a[h]=a[b+(l&15|16)|0]|0;break}else{a[h]=0;break}}}while(0);c[i>>2]=0;c[g>>2]=1}else if((j|0)==3){if((a[b+256|0]|0)>=0){a[b+(d[b+280|0]<<5&224|(d[b+281|0]|0)>>>2&31)|0]=f}c[i>>2]=0}}while(0);c[e>>2]=0;return}function eN(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b+260|0;g=c[f>>2]|0;if((c[b+284>>2]|0)==0){h=b+288|0;i=(c[h>>2]|0)+e|0;c[h>>2]=i;if(i>>>0>7833600){c[h>>2]=i-7833600;i=g+1|0;c[f>>2]=i;j=i}else{j=g}i=b+264|0;h=j+(c[i>>2]|0)|0;c[f>>2]=h;c[i>>2]=0;k=h}else{h=(bZ(0)|0)+2082844800|0;i=(d[b+237|0]<<8|d[b+238|0])<<8;j=i|d[b+239|0];e=((i&8388608|0)==0?j:j|-16777216)+h+(c[b+264>>2]|0)|0;c[f>>2]=e;k=e}if((k|0)==(g|0)){return}g=b+312|0;do{if((a[g]|0)!=1){a[g]=1;k=c[b+308>>2]|0;if((k|0)==0){break}b1[k&511](c[b+304>>2]|0,1);if((a[g]|0)!=0){break}return}}while(0);a[g]=0;g=c[b+308>>2]|0;if((g|0)==0){return}b1[g&511](c[b+304>>2]|0,0);return}function eO(b){b=b|0;var d=0;a[b+9|0]=0;a[b+10|0]=0;a[b+11|0]=0;c[b+16>>2]=0;c[b+20>>2]=0;c[b+40>>2]=0;c[b+44>>2]=0;d=b;c[d>>2]=0;c[d+4>>2]=0;c[b+48>>2]=4096;c[b+52>>2]=vP(4096)|0;c[b+60>>2]=4080;c[b+64>>2]=4;c[b+68>>2]=0;c[b+72>>2]=0;c[b+76>>2]=0;c[b+108>>2]=0;c[b+140>>2]=0;c[b+172>>2]=0;c[b+204>>2]=0;c[b+236>>2]=0;c[b+268>>2]=0;c[b+300>>2]=0;c[b+332>>2]=0;return}function eP(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=d&7;c[b+76+(f<<5)>>2]=1;c[b+76+(f<<5)+4>>2]=e;e=b+76+(f<<5)+8|0;d=e|0;y=541410128;a[d]=y&255;y=y>>8;a[d+1|0]=y&255;y=y>>8;a[d+2|0]=y&255;y=y>>8;a[d+3|0]=y&255;d=e+4|0;y=538976288;a[d]=y&255;y=y>>8;a[d+1|0]=y&255;y=y>>8;a[d+2|0]=y&255;y=y>>8;a[d+3|0]=y&255;d=b+76+(f<<5)+16|0;vW(d|0,55208,16)|0;return}function eQ(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;g=(c[b+60>>2]&e)>>>((c[b+64>>2]|0)>>>0);do{if((g|0)==3){h=a[b+8|0]&15}else if((g|0)==2){h=a[b+7|0]|0}else if((g|0)==4){h=a[b+9|0]|0}else if((g|0)==5){e=b+11|0;j=a[e]|0;k=(((d[b+9|0]|0)>>>2^a[b+8|0])&7)==0?j|8:j&-9;a[e]=k;h=k}else if((g|0)==0){h=a[b+5|0]|0}else if((g|0)==32){k=b;if((c[k>>2]|0)!=5){h=0;break}e=b+40|0;j=c[e>>2]|0;l=c[b+44>>2]|0;if(j>>>0>=l>>>0){h=0;break}m=a[(c[b+52>>2]|0)+j|0]|0;n=j+1|0;c[e>>2]=n;if(n>>>0<l>>>0){h=m;break}c[k>>2]=7;k=b+9|0;a[k]=a[k]&-125|108;a[b+5|0]=0;h=m}else if((g|0)==7){h=-1}else if((g|0)==6|(g|0)==38){m=b;if((c[m>>2]|0)!=5){h=0;break}k=b+40|0;l=c[k>>2]|0;n=c[b+44>>2]|0;if(l>>>0>=n>>>0){h=0;break}e=a[(c[b+52>>2]|0)+l|0]|0;j=l+1|0;c[k>>2]=j;if(j>>>0<n>>>0){h=e;break}c[m>>2]=7;m=b+9|0;a[m]=a[m]&-125|108;a[b+5|0]=0;h=e}else if((g|0)==1){h=a[b+6|0]|0}else{d$(49048,(x=i,i=i+16|0,c[x>>2]=g,c[x+8>>2]=255,x)|0);h=-1}}while(0);i=f;return h|0}function eR(a,b,c){a=a|0;b=b|0;c=c|0;return}function eS(b){b=b|0;var d=0;a[b+9|0]=0;a[b+10|0]=0;d=b;c[d>>2]=0;c[d+4>>2]=0;a[b+11|0]=8;a[b+12|0]=0;c[b+16>>2]=0;c[b+20>>2]=0;c[b+40>>2]=0;c[b+44>>2]=0;c[b+68>>2]=0;c[b+72>>2]=0;return}function eT(b){b=b|0;var d=0;c[b>>2]=7;d=b+9|0;a[d]=a[d]&-125|108;a[b+5|0]=0;return}function eU(b){b=b|0;var d=0;c[b>>2]=7;d=b+9|0;a[d]=a[d]&-125|108;a[b+5|0]=0;return}function eV(b){b=b|0;var d=0;c[b+40>>2]=0;c[b+44>>2]=0;c[b>>2]=6;d=b+9|0;a[d]=a[d]&-125|96;return}function eW(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;f=i;g=b;h=(c[b+60>>2]&d)>>>((c[b+64>>2]|0)>>>0);if((h|0)==2){d=b+7|0;j=e&255;k=a[d]^e;a[d]=e;d=b;l=c[d>>2]|0;L2205:do{if((l|0)==0){if((e&1&k)<<24>>24==0){break}c[d>>2]=1;a[b+5|0]=a[b+4|0]|0;m=b+6|0;a[m]=a[m]|64}else if((l|0)==5){if((e&2&k)<<24>>24==0){break}if((c[b+40>>2]|0)>>>0>=(c[b+44>>2]|0)>>>0){break}m=b+11|0;a[m]=a[m]|64}else if((l|0)==6){if((e&2&k)<<24>>24==0){break}if((c[b+40>>2]|0)>>>0>=(c[b+44>>2]|0)>>>0){break}m=b+11|0;a[m]=a[m]|64}else if((l|0)==2){if((k&255&(j&1^1)|0)==0){break}m=a[b+4|0]|0;n=m&127;if(n<<24>>24!=0&(m&1)==0){m=n;n=0;while(1){o=n+1|0;p=(m&255)>>>1;if(p<<24>>24!=0&(p&1)==0){m=p;n=o}else{q=o;break}}}else{q=0}c[b+56>>2]=q;n=b+6|0;a[n]=a[n]&-9;n=q&7;do{if((c[g+76+(n<<5)>>2]|0)!=0){m=c[g+76+(n<<5)+4>>2]|0;if((m|0)==65535){break}if((oH(c[b+332>>2]|0,m)|0)==0){break}c[d>>2]=4;m=b+9|0;a[m]=a[m]&-125|104;c[b+16>>2]=0;c[b+20>>2]=16;break L2205}}while(0);c[d>>2]=0;n=b+9|0;a[n]=a[n]&-125}}while(0);if((k&255&(j&2^2)|0)==0){i=f;return}j=b+11|0;a[j]=a[j]&-65;i=f;return}else if((h|0)==1){j=e&-97;k=b+6|0;d=j&255;q=a[k]^j;a[k]=j;j=b;k=c[j>>2]|0;if((k|0)==1){if((e&4&q)<<24>>24==0){i=f;return}c[j>>2]=2;i=f;return}else if((k|0)==4){l=q&255;if((e&16&q)<<24>>24!=0){n=b+16|0;m=c[n>>2]|0;o=b+20|0;if(m>>>0<(c[o>>2]|0)>>>0){a[g+24+m|0]=a[b+4|0]|0;p=(c[n>>2]|0)+1|0;c[n>>2]=p;r=p}else{r=m}do{if((r|0)==1){m=a[b+24|0]|0;p=b+68|0;c[p>>2]=0;c[b+72>>2]=0;n=m&255;if((n|0)==0){c[o>>2]=6;c[p>>2]=396;break}else if((n|0)==3){c[o>>2]=6;c[p>>2]=348;break}else if((n|0)==4){c[o>>2]=6;c[p>>2]=172;break}else if((n|0)==8){c[o>>2]=6;c[p>>2]=220;break}else if((n|0)==10){c[o>>2]=6;c[p>>2]=492;break}else if((n|0)==18){c[o>>2]=6;c[p>>2]=448;break}else if((n|0)==21){c[o>>2]=6;c[p>>2]=22;break}else if((n|0)==26){c[o>>2]=6;c[p>>2]=346;break}else if((n|0)==27){c[o>>2]=6;c[p>>2]=444;break}else if((n|0)==37){c[o>>2]=10;c[p>>2]=200;break}else if((n|0)==40){c[o>>2]=10;c[p>>2]=150;break}else if((n|0)==42){c[o>>2]=10;c[p>>2]=512;break}else if((n|0)==47){c[o>>2]=10;c[p>>2]=290;break}else if((n|0)==60){c[o>>2]=6;c[p>>2]=358;break}else{d$(41928,(x=i,i=i+8|0,c[x>>2]=n,x)|0);c[j>>2]=7;n=b+9|0;a[n]=a[n]&-125|108;a[b+5|0]=2;break}}}while(0);o=b+9|0;a[o]=a[o]&-33}if((l&(d&16^16)|0)==0){i=f;return}if((c[b+16>>2]|0)>>>0<(c[b+20>>2]|0)>>>0){l=b+9|0;a[l]=a[l]|32;i=f;return}l=c[b+68>>2]|0;if((l|0)==0){c[j>>2]=7;o=b+9|0;a[o]=a[o]&-125|108;a[b+5|0]=2;i=f;return}else{b0[l&1023](g);i=f;return}}else if((k|0)==8){if((e&16&q)<<24>>24!=0){l=b+9|0;a[l]=a[l]&-33}if((q&255&(d&16^16)|0)==0){i=f;return}c[j>>2]=0;l=b+9|0;a[l]=a[l]&-125;i=f;return}else if((k|0)==5){if((e&16&q)<<24>>24!=0){l=b+9|0;a[l]=a[l]&-33}if((q&255&(d&16^16)|0)==0){i=f;return}l=b+40|0;o=(c[l>>2]|0)+1|0;c[l>>2]=o;if(o>>>0<(c[b+44>>2]|0)>>>0){a[b+5|0]=a[(c[b+52>>2]|0)+o|0]|0;o=b+9|0;a[o]=a[o]|32;i=f;return}else{c[j>>2]=7;o=b+9|0;a[o]=a[o]&-125|108;a[b+5|0]=0;i=f;return}}else if((k|0)==6){o=q&255;if((e&16&q)<<24>>24!=0){l=b+40|0;r=c[l>>2]|0;if(r>>>0<(c[b+44>>2]|0)>>>0){a[(c[b+52>>2]|0)+r|0]=a[b+4|0]|0;c[l>>2]=(c[l>>2]|0)+1}l=b+9|0;a[l]=a[l]&-33}if((o&(d&16^16)|0)==0){i=f;return}if((c[b+40>>2]|0)>>>0<(c[b+44>>2]|0)>>>0){o=b+9|0;a[o]=a[o]|32;i=f;return}else{c[j>>2]=7;o=b+9|0;a[o]=a[o]&-125|108;a[b+5|0]=2;i=f;return}}else if((k|0)==7){if((e&16&q)<<24>>24!=0){k=b+9|0;a[k]=a[k]&-33}if((q&255&(d&16^16)|0)==0){i=f;return}c[j>>2]=8;j=b+9|0;a[j]=a[j]|124;a[b+5|0]=0;i=f;return}else{i=f;return}}else if((h|0)==3){j=b+8|0;d=a[j]|0;a[j]=e;if((e&2&(d^2))<<24>>24==0){i=f;return}d=b;j=c[d>>2]|0;if((j|0)==5){c[d>>2]=7;q=b+9|0;a[q]=a[q]&-125|108;a[b+5|0]=0;i=f;return}else if((j|0)==6){c[d>>2]=7;d=b+9|0;a[d]=a[d]&-125|108;a[b+5|0]=0;i=f;return}else{i=f;return}}else if((h|0)==4){a[b+10|0]=e;i=f;return}else if((h|0)==5){d=b+11|0;a[d]=a[d]|64;i=f;return}else if((h|0)==32){d=b;if((c[d>>2]|0)!=6){i=f;return}j=b+40|0;q=c[j>>2]|0;k=b+44|0;if(q>>>0>=(c[k>>2]|0)>>>0){i=f;return}a[(c[b+52>>2]|0)+q|0]=e;q=(c[j>>2]|0)+1|0;c[j>>2]=q;if(q>>>0<(c[k>>2]|0)>>>0){i=f;return}k=c[b+72>>2]|0;if((k|0)==0){c[d>>2]=7;d=b+9|0;a[d]=a[d]&-125|108;a[b+5|0]=2;i=f;return}else{b0[k&1023](g);i=f;return}}else if((h|0)==0){a[b+4|0]=e;i=f;return}else if((h|0)==6|(h|0)==7){i=f;return}else{d$(45424,(x=i,i=i+16|0,c[x>>2]=h,c[x+8>>2]=e&255,x)|0);i=f;return}}function eX(b){b=b|0;var d=0,e=0;d=b+52|0;vV(c[d>>2]|0,0,13);a[c[d>>2]|0]=-16;c[b+40>>2]=0;c[b+44>>2]=13;c[b>>2]=5;e=b+9|0;a[e]=a[e]&-125|100;a[b+5|0]=a[c[d>>2]|0]|0;return}function eY(b){b=b|0;var c=0;c=a[b+28|0]|0;fa(b,((d[b+25|0]|0)<<8&7936|(d[b+26|0]|0))<<8|(d[b+27|0]|0),c<<24>>24==0?256:c&255);return}function eZ(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0;d=i;e=a[b+28|0]|0;f=e<<24>>24==0?256:e&255;e=f<<9;g=b+48|0;do{if((c[g>>2]|0)>>>0<e>>>0){h=b+52|0;j=vR(c[h>>2]|0,e)|0;if((j|0)!=0){c[h>>2]=j;c[g>>2]=e;break}d$(38872,(x=i,i=i+8|0,c[x>>2]=f,x)|0);c[b>>2]=7;j=b+9|0;a[j]=a[j]&-125|108;a[b+5|0]=2;i=d;return}}while(0);c[b+40>>2]=0;c[b+44>>2]=e;c[b+72>>2]=362;c[b>>2]=6;e=b+9|0;a[e]=a[e]&-125|96;i=d;return}function e_(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0;e=b+76+((c[b+56>>2]&7)<<5)|0;f=(c[e>>2]|0)==0?0:e;e=b+52|0;vV(c[e>>2]|0,0,256);if((f|0)!=0){g=f+8|0;h=(c[e>>2]|0)+8|0;i=g|0;j=g+4|0;g=d[j]|d[j+1|0]<<8|d[j+2|0]<<16|d[j+3|0]<<24|0;j=h|0;y=d[i]|d[i+1|0]<<8|d[i+2|0]<<16|d[i+3|0]<<24|0;a[j]=y&255;y=y>>8;a[j+1|0]=y&255;y=y>>8;a[j+2|0]=y&255;y=y>>8;a[j+3|0]=y&255;j=h+4|0;y=g;a[j]=y&255;y=y>>8;a[j+1|0]=y&255;y=y>>8;a[j+2|0]=y&255;y=y>>8;a[j+3|0]=y&255;j=(c[e>>2]|0)+16|0;g=f+16|0;vW(j|0,g|0,16)|0}a[(c[e>>2]|0)+4|0]=32;c[b+40>>2]=0;g=a[b+28|0]|0;c[b+44>>2]=(g&255)<36?g&255:36;c[b>>2]=5;g=b+9|0;a[g]=a[g]&-125|100;a[b+5|0]=a[c[e>>2]|0]|0;return}function e$(a,b){a=a|0;b=b|0;c[a+4>>2]=b;return}function e0(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function e1(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;f=c[b+56>>2]&7;do{if((c[b+76+(f<<5)>>2]|0)!=0){g=c[b+76+(f<<5)+4>>2]|0;if((g|0)==65535){break}h=oH(c[b+332>>2]|0,g)|0;if((h|0)==0){break}g=b+52|0;vV(c[g>>2]|0,0,512);j=b+40|0;c[j>>2]=0;k=b+44|0;c[k>>2]=0;l=d[b+26|0]|0;m=l&63;do{if((m|0)==48){a[c[g>>2]|0]=48;a[(c[g>>2]|0)+1|0]=33;n=(c[g>>2]|0)+14|0;vW(n|0,53776,20)|0;c[k>>2]=34}else if((m|0)==3){a[c[g>>2]|0]=3;a[(c[g>>2]|0)+1|0]=22;c[k>>2]=24}else if((m|0)==4){a[c[g>>2]|0]=4;a[(c[g>>2]|0)+1|0]=22;a[(c[g>>2]|0)+2|0]=0;nM(c[g>>2]|0,3,c[h+32>>2]&65535);a[(c[g>>2]|0)+5|0]=c[h+36>>2]&255;nM(c[g>>2]|0,20,3600);c[k>>2]=32}else if((m|0)==1){a[c[g>>2]|0]=1;a[(c[g>>2]|0)+1|0]=10;c[k>>2]=12}else{d$(53096,(x=i,i=i+8|0,c[x>>2]=l,x)|0);if((c[k>>2]|0)!=0){break}c[b>>2]=7;n=b+9|0;a[n]=a[n]&-125|108;a[b+5|0]=2;i=e;return}}while(0);c[b>>2]=5;k=b+9|0;a[k]=a[k]&-125|100;a[b+5|0]=a[(c[g>>2]|0)+(c[j>>2]|0)|0]|0;i=e;return}}while(0);c[b>>2]=7;f=b+9|0;a[f]=a[f]&-125|108;a[b+5|0]=2;i=e;return}function e2(b){b=b|0;var d=0,e=0,f=0;d=i;e=a[b+28|0]&3;if((e|0)==2){f=55808}else if((e|0)==3){f=55136}else if((e|0)==0){f=57816}else if((e|0)==1){f=56984}else{f=0}d$(54384,(x=i,i=i+16|0,c[x>>2]=c[b+56>>2],c[x+8>>2]=f,x)|0);c[b>>2]=7;f=b+9|0;a[f]=a[f]&-125|108;a[b+5|0]=0;i=d;return}function e3(b){b=b|0;var d=0,e=0,f=0;d=c[b+56>>2]&7;do{if((c[b+76+(d<<5)>>2]|0)!=0){e=c[b+76+(d<<5)+4>>2]|0;if((e|0)==65535){break}f=oH(c[b+332>>2]|0,e)|0;if((f|0)==0){break}e=oA(f)|0;f=b+52|0;nN(c[f>>2]|0,0,e-1|0);nN(c[f>>2]|0,4,512);c[b+40>>2]=0;c[b+44>>2]=8;c[b>>2]=5;e=b+9|0;a[e]=a[e]&-125|100;a[b+5|0]=a[c[f>>2]|0]|0;return}}while(0);c[b>>2]=7;d=b+9|0;a[d]=a[d]&-125|108;a[b+5|0]=2;return}function e4(a){a=a|0;fa(a,(((d[a+26|0]|0)<<8|(d[a+27|0]|0))<<8|(d[a+28|0]|0))<<8|(d[a+29|0]|0),(d[a+31|0]|0)<<8|(d[a+32|0]|0));return}function e5(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0;e=i;f=(d[b+31|0]|0)<<8|(d[b+32|0]|0);g=f<<9;h=b+48|0;do{if((c[h>>2]|0)>>>0<g>>>0){j=b+52|0;k=vR(c[j>>2]|0,g)|0;if((k|0)!=0){c[j>>2]=k;c[h>>2]=g;break}d$(38872,(x=i,i=i+8|0,c[x>>2]=f,x)|0);c[b>>2]=7;k=b+9|0;a[k]=a[k]&-125|108;a[b+5|0]=2;i=e;return}}while(0);c[b+40>>2]=0;c[b+44>>2]=g;c[b+72>>2]=520;c[b>>2]=6;g=b+9|0;a[g]=a[g]&-125|96;i=e;return}function e6(b){b=b|0;var d=0,e=0;d=c[b+56>>2]&7;do{if((c[b+76+(d<<5)>>2]|0)!=0){e=c[b+76+(d<<5)+4>>2]|0;if((e|0)==65535){break}if((oH(c[b+332>>2]|0,e)|0)==0){break}c[b+40>>2]=0;c[b+44>>2]=0;c[b>>2]=7;e=b+9|0;a[e]=a[e]&-125|108;a[b+5|0]=0;return}}while(0);c[b>>2]=7;d=b+9|0;a[d]=a[d]&-125|108;a[b+5|0]=2;return}function e7(b){b=b|0;var d=0,e=0;d=b+52|0;vV(c[d>>2]|0,0,512);c[b+40>>2]=0;c[b+44>>2]=4;c[b>>2]=5;e=b+9|0;a[e]=a[e]&-125|100;a[b+5|0]=a[c[d>>2]|0]|0;return}function e8(a){a=a|0;e9(a,(((d[a+26|0]|0)<<8|(d[a+27|0]|0))<<8|(d[a+28|0]|0))<<8|(d[a+29|0]|0),(d[a+31|0]|0)<<8|(d[a+32|0]|0));return}function e9(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;g=c[b+56>>2]&7;do{if((c[b+76+(g<<5)>>2]|0)!=0){h=c[b+76+(g<<5)+4>>2]|0;if((h|0)==65535){break}j=oH(c[b+332>>2]|0,h)|0;if((j|0)==0){break}h=e<<9;k=b+40|0;l=c[k>>2]|0;if((h|0)!=(l|0)){d$(36032,(x=i,i=i+16|0,c[x>>2]=h,c[x+8>>2]=l,x)|0);c[b>>2]=7;l=b+9|0;a[l]=a[l]&-125|108;a[b+5|0]=2;i=f;return}if((oL(j,c[b+52>>2]|0,d,e)|0)==0){c[k>>2]=0;c[b+44>>2]=0;c[b+72>>2]=0;c[b>>2]=7;k=b+9|0;a[k]=a[k]&-125|108;a[b+5|0]=0;i=f;return}else{d$(33024,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);c[b>>2]=7;k=b+9|0;a[k]=a[k]&-125|108;a[b+5|0]=2;i=f;return}}}while(0);c[b>>2]=7;e=b+9|0;a[e]=a[e]&-125|108;a[b+5|0]=2;i=f;return}function fa(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;g=c[b+56>>2]&7;do{if((c[b+76+(g<<5)>>2]|0)!=0){h=c[b+76+(g<<5)+4>>2]|0;if((h|0)==65535){break}j=oH(c[b+332>>2]|0,h)|0;if((j|0)==0){break}h=e<<9;k=b+48|0;l=b+52|0;m=c[l>>2]|0;do{if((c[k>>2]|0)>>>0<h>>>0){n=vR(m,h)|0;if((n|0)!=0){c[l>>2]=n;c[k>>2]=h;o=n;break}d$(31448,(x=i,i=i+8|0,c[x>>2]=e,x)|0);c[b>>2]=7;n=b+9|0;a[n]=a[n]&-125|108;a[b+5|0]=2;i=f;return}else{o=m}}while(0);if((oK(j,o,d,e)|0)==0){c[b+40>>2]=0;c[b+44>>2]=h;c[b>>2]=5;m=b+9|0;a[m]=a[m]&-125|100;a[b+5|0]=a[c[b+52>>2]|0]|0;i=f;return}else{d$(30552,(x=i,i=i+16|0,c[x>>2]=d,c[x+8>>2]=e,x)|0);c[b>>2]=7;m=b+9|0;a[m]=a[m]&-125|108;a[b+5|0]=2;i=f;return}}}while(0);c[b>>2]=7;e=b+9|0;a[e]=a[e]&-125|108;a[b+5|0]=2;i=f;return}function fb(b){b=b|0;var c=0;c=a[b+28|0]|0;e9(b,((d[b+25|0]|0)<<8&7936|(d[b+26|0]|0))<<8|(d[b+27|0]|0),c<<24>>24==0?256:c&255);return}function fc(a){a=a|0;c[a+300>>2]=0;c[a+304>>2]=0;c[a+564>>2]=0;vV(a|0,0,44);return}function fd(a,b){a=a|0;b=b|0;var d=0;d=a+564|0;a=c[d>>2]|0;if((a|0)!=0){po(a)}a=pu(b)|0;c[d>>2]=a;return(a|0)==0|0}function fe(a,b){a=a|0;b=b|0;var d=0;d=tY(44320,b)|0;b=a+564|0;a=c[b>>2]|0;if((a|0)!=0){po(a)}a=pu(d)|0;c[b>>2]=a;vQ(d);return(a|0)==0|0}function ff(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=a|0;c[e>>2]=b;f=a+4|0;c[f>>2]=d;g=a;m4(b,d,g,270);nb(b,d,g,254);nc(b,d,g,308);nd(b,d,g,2);nw(c[e>>2]|0,c[f>>2]|0,1);return}function fg(a,b){a=a|0;b=b|0;fm(a);return}function fh(a,b){a=a|0;b=b|0;fl(a);return}function fi(a,b){a=a|0;b=b|0;var d=0,e=0;d=a+32|0;e=b&255;if((c[d>>2]|0)==(e|0)){return}c[d>>2]=b<<24>>24!=0;ps(c[a+564>>2]|0,e)|0;return}function fj(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0;g=f>>>1;c[a+12>>2]=b;c[a+16>>2]=d;c[a+20>>2]=e;c[a+24>>2]=g;pt(c[a+564>>2]|0,b,e,d,g)|0;return}function fk(a,b){a=a|0;b=b|0;var d=0,e=0;fl(a);fm(a);d=a|0;nw(c[d>>2]|0,c[a+4>>2]|0,1);e=a+8|0;a=(c[e>>2]|0)+(b*15|0)|0;c[e>>2]=a;ny(c[d>>2]|0,a>>>5);c[e>>2]=c[e>>2]&31;return}function fl(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;d=b+304|0;e=c[d>>2]|0;do{if((e|0)!=0){f=b+300|0;g=pq(c[b+564>>2]|0,(c[f>>2]|0)+(b+308)|0,e)|0;c[f>>2]=(c[f>>2]|0)+g;h=c[d>>2]|0;c[d>>2]=h-g;if((h|0)==(g|0)){c[f>>2]=0}if((h|0)==(g|0)){break}return}}while(0);e=b|0;g=b+4|0;L2483:do{if((nj(c[e>>2]|0,c[g>>2]|0)|0)==0){h=b+300|0;f=b+564|0;while(1){i=nh(c[e>>2]|0,c[g>>2]|0)|0;a[(c[d>>2]|0)+(c[h>>2]|0)+(b+308)|0]=i;i=(c[d>>2]|0)+1|0;c[d>>2]=i;j=c[h>>2]|0;if(!((j+i|0)>>>0<256|(i|0)==0)){k=pq(c[f>>2]|0,b+308+j|0,i)|0;c[h>>2]=(c[h>>2]|0)+k;i=c[d>>2]|0;c[d>>2]=i-k;if((i|0)==(k|0)){c[h>>2]=0}if((i|0)!=(k|0)){break}}if((nj(c[e>>2]|0,c[g>>2]|0)|0)!=0){break L2483}}return}}while(0);g=c[d>>2]|0;if((g|0)==0){return}e=b+300|0;h=pq(c[b+564>>2]|0,(c[e>>2]|0)+(b+308)|0,g)|0;c[e>>2]=(c[e>>2]|0)+h;g=c[d>>2]|0;c[d>>2]=g-h;if((g|0)!=(h|0)){return}c[e>>2]=0;return}function fm(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;d=b+36|0;e=b|0;f=b+4|0;if((ni(c[e>>2]|0,c[f>>2]|0)|0)!=0){return}g=b+40|0;h=b+564|0;while(1){if((c[g>>2]|0)==0){c[d>>2]=0;i=pp(c[h>>2]|0,b+44|0,256)|0;j=(c[g>>2]|0)+i|0;c[g>>2]=j;if((j|0)==0){k=2007;break}}ng(c[e>>2]|0,c[f>>2]|0,a[(c[d>>2]|0)+(b+44)|0]|0);c[d>>2]=(c[d>>2]|0)+1;c[g>>2]=(c[g>>2]|0)-1;if((ni(c[e>>2]|0,c[f>>2]|0)|0)!=0){k=2005;break}}if((k|0)==2005){return}else if((k|0)==2007){return}}function fn(b,d){b=b|0;d=d|0;a[b|0]=0;a[b+1|0]=0;a[b+2|0]=(d|0)!=0|0;c[b+64>>2]=0;vV(b+4|0,0,57);return}function fo(a,b,d){a=a|0;b=b|0;d=d|0;if(b>>>0>=4){return}c[a+12+(b<<2)>>2]=d;c[a+28+(b<<2)>>2]=d;return}function fp(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,y=0;d=i;if((a[b+2|0]|0)==0){i=d;return}e=b+1|0;if((a[e]|0)!=0){i=d;return}a[e]=1;e=b+132|0;c[e>>2]=0;f=b+136|0;c[f>>2]=0;g=b+4|0;do{if((n1(c[g>>2]|0,16252928)|0)==1346585944){if((n1(c[g>>2]|0,16252936)|0)>>>0<4){h=2018;break}c[b+44>>2]=(n1(c[g>>2]|0,16252944)|0)+16252928;c[b+48>>2]=(n1(c[g>>2]|0,16252948)|0)+16252928;c[b+52>>2]=(n1(c[g>>2]|0,16252952)|0)+16252928;j=(n1(c[g>>2]|0,16252940)|0)+16252928|0;c[e>>2]=j;if((j|0)==0){break}tF(2,43992,48880,(x=i,i=i+8|0,c[x>>2]=j,x)|0);j=4194304;k=1048576;L2531:while(1){l=j+1|0;m=k-1|0;do{if((n0(c[g>>2]|0,j)|0)<<16>>16==1326){if((n1(c[g>>2]|0,j+2|0)|0)!=1399811705){break}n=j-18|0;if((n0(c[g>>2]|0,n)|0)<<16>>16==20224){h=2027;break L2531}}}while(0);if((m|0)==0){h=2024;break}else{j=l;k=m}}do{if((h|0)==2027){c[f>>2]=n;if((n|0)==0){break}tF(2,43992,41736,(x=i,i=i+8|0,c[x>>2]=n,x)|0);k=c[f>>2]|0;if((k|0)==0){i=d;return}if((c[e>>2]|0)==0){i=d;return}j=0;o=b+140|0;p=k;while(1){k=(j<<1)+8|0;q=(n0(c[g>>2]|0,k+p|0)|0)&65535;r=(c[f>>2]|0)+q|0;q=n0(c[g>>2]|0,(c[e>>2]|0)+k|0)|0;k=c[e>>2]|0;a[o]=n$(c[g>>2]|0,r)|0;s=r+1|0;a[o+1|0]=n$(c[g>>2]|0,s)|0;t=r+2|0;a[o+2|0]=n$(c[g>>2]|0,t)|0;u=r+3|0;a[o+3|0]=n$(c[g>>2]|0,u)|0;v=r+4|0;a[o+4|0]=n$(c[g>>2]|0,v)|0;w=r+5|0;a[o+5|0]=n$(c[g>>2]|0,w)|0;y=k+(q&65535)|0;n2(c[g>>2]|0,r,78);n2(c[g>>2]|0,s,-7);n2(c[g>>2]|0,t,y>>>24&255);n2(c[g>>2]|0,u,y>>>16&255);n2(c[g>>2]|0,v,y>>>8&255);n2(c[g>>2]|0,w,y&255);y=j+1|0;if(y>>>0>=5){break}j=y;o=o+6|0;p=c[f>>2]|0}i=d;return}else if((h|0)==2024){c[f>>2]=0}}while(0);tF(0,43992,45256,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);i=d;return}else{h=2018}}while(0);if((h|0)==2018){c[e>>2]=0}tF(0,43992,54904,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);i=d;return}function fq(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;if((a[b|0]|0)==0){i=e;return}if((d|0)==0|d>>>0>4){i=e;return}f=oH(c[b+8>>2]|0,d)|0;if((f|0)==0){i=e;return}g=b+4|0;b=n1(c[g>>2]|0,308)|0;if(d>>>0<5){h=(d*66|0)+8+b|0}else{h=b}b=h+3|0;if((n$(c[g>>2]|0,b)|0)<<24>>24!=0){i=e;return}tF(2,43992,38752,(x=i,i=i+8|0,c[x>>2]=d,x)|0);n3(c[g>>2]|0,b,1);b=(oA(f)|0)>>>0<1600;d=c[g>>2]|0;j=h+18|0;if(b){n3(d,j,0)}else{n3(d,j,-1)}n3(c[g>>2]|0,h+19|0,-1);j=(ov(f)|0)==0;f=c[g>>2]|0;g=h+2|0;if(j){n3(f,g,0);i=e;return}else{n3(f,g,-1);i=e;return}}function fr(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;if((a[b|0]|0)==0){d=0;return d|0}e=b+8|0;f=b+4|0;g=0;h=0;L2586:while(1){i=h;do{if(i>>>0>=4){d=g;break L2586}j=b+28+(i<<2)|0;k=c[j>>2]|0;do{if((k|0)!=0){l=k-1|0;c[j>>2]=l;if((l|0)!=0){break}fq(b,i+1|0)}}while(0);i=i+1|0;}while((oH(c[e>>2]|0,i)|0)==0);j=n1(c[f>>2]|0,308)|0;if((i|0)!=0&i>>>0<5){m=(i*66|0)+8+j|0}else{m=j}g=(n$(c[f>>2]|0,m+3|0)|0)<<24>>24==1?1:g;h=i}return d|0}function fs(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0;e=i;i=i+560|0;f=e|0;g=e+8|0;h=e+16|0;j=e+24|0;k=e+32|0;l=e+544|0;if((d|0)==17){m=b+4|0;n=b+208|0;o=(n0(c[m>>2]|0,(c[n>>2]|0)+6|0)|0)&65535;p=n0(c[m>>2]|0,(c[n>>2]|0)+22|0)|0;q=p&65535;if(p<<16>>16==0|(p&65535)>4){c[b+204>>2]=-56;r=n0(c[m>>2]|0,(c[n>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[n>>2]|0)+16|0,-56);if((r&512)!=0){s=0;i=e;return s|0}r=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,r)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}r=n1(c[m>>2]|0,308)|0;t=(p&65535)<5;if(t){u=(q*66|0)+8+r|0}else{u=r}r=u+3|0;if((n$(c[m>>2]|0,r)|0)<<24>>24==0){c[b+204>>2]=-65;u=n0(c[m>>2]|0,(c[n>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[n>>2]|0)+16|0,-65);if((u&512)!=0){s=0;i=e;return s|0}u=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,u)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}n3(c[m>>2]|0,r,2);r=o&255;if((r|0)==3){u=k|0;p=l|0;v=(n0(c[m>>2]|0,(c[n>>2]|0)+44|0)|0)&15;if((v|0)==1){w=n1(c[m>>2]|0,(c[n>>2]|0)+46|0)|0}else if((v|0)==0){w=n1(c[m>>2]|0,(c[b+212>>2]|0)+16|0)|0}else if((v|0)==3){v=n1(c[m>>2]|0,(c[n>>2]|0)+46|0)|0;w=(n1(c[m>>2]|0,(c[b+212>>2]|0)+16|0)|0)+v|0}else{w=0}v=n1(c[m>>2]|0,(c[n>>2]|0)+36|0)|0;y=(n1(c[m>>2]|0,(c[n>>2]|0)+32|0)|0)&16777215;z=oH(c[b+8>>2]|0,q)|0;if((z|0)==0){c[b+204>>2]=-65;A=n0(c[m>>2]|0,(c[n>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[n>>2]|0)+16|0,-65);if((A&512)!=0){s=0;i=e;return s|0}A=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,A)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}if((ov(z)|0)!=0){c[b+204>>2]=-44;A=n0(c[m>>2]|0,(c[n>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[n>>2]|0)+16|0,-44);if((A&512)!=0){s=0;i=e;return s|0}A=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,A)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}do{if((v&511|0)==0){if((w&511|0)!=0){break}vV(p|0,0,12);A=(n0(c[m>>2]|0,770)|0)&65535;B=v>>>9;C=b+56|0;D=w>>>9;E=l+1|0;F=l+2|0;G=l+3|0;H=l+4|0;I=l+5|0;J=l+6|0;K=l+7|0;L=l+8|0;M=l+9|0;N=l+10|0;O=l+11|0;P=0;while(1){if(P>>>0>=B>>>0){Q=2145;break}R=(P<<9)+y|0;S=0;do{a[k+S|0]=n$(c[m>>2]|0,R+S|0)|0;S=S+1|0;}while(S>>>0<512);S=c[C>>2]|0;L2650:do{if((S|0)==0){n4(c[m>>2]|0,770,P+A&65535);a[p]=n$(c[m>>2]|0,764)|0;a[E]=n$(c[m>>2]|0,765)|0;a[F]=n$(c[m>>2]|0,766)|0;a[G]=n$(c[m>>2]|0,767)|0;a[H]=n$(c[m>>2]|0,768)|0;a[I]=n$(c[m>>2]|0,769)|0;a[J]=n$(c[m>>2]|0,770)|0;a[K]=n$(c[m>>2]|0,771)|0;a[L]=n$(c[m>>2]|0,772)|0;a[M]=n$(c[m>>2]|0,773)|0;a[N]=n$(c[m>>2]|0,774)|0;a[O]=n$(c[m>>2]|0,775)|0}else{R=P*12|0;T=0;U=S;while(1){V=n$(c[m>>2]|0,U+R+T|0)|0;a[l+T|0]=V;n3(c[m>>2]|0,T+764|0,V);V=T+1|0;if(V>>>0>=12){break L2650}T=V;U=c[C>>2]|0}}}while(0);if((fB(z,u,p,P+D|0)|0)==0){P=P+1|0}else{Q=2143;break}}if((Q|0)==2145){n5(c[m>>2]|0,(c[n>>2]|0)+40|0,v);P=b+212|0;D=(n1(c[m>>2]|0,(c[P>>2]|0)+16|0)|0)+v|0;n5(c[m>>2]|0,(c[P>>2]|0)+16|0,D);c[b+204>>2]=0;D=n0(c[m>>2]|0,(c[n>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[n>>2]|0)+16|0,0);if((D&512)!=0){s=0;i=e;return s|0}D=n1(c[m>>2]|0,308)|0;c[P>>2]=n1(c[m>>2]|0,D)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}else if((Q|0)==2143){d$(55104,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);c[b+204>>2]=-1;D=n0(c[m>>2]|0,(c[n>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[n>>2]|0)+16|0,-1);if((D&512)!=0){s=0;i=e;return s|0}D=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,D)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}}}while(0);d$(55768,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);c[b+204>>2]=-50;v=n0(c[m>>2]|0,(c[n>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[n>>2]|0)+16|0,-50);if((v&512)!=0){s=0;i=e;return s|0}v=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,v)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}else if((r|0)==2){r=k|0;v=l|0;p=(n0(c[m>>2]|0,(c[n>>2]|0)+44|0)|0)&15;if((p|0)==0){W=n1(c[m>>2]|0,(c[b+212>>2]|0)+16|0)|0}else if((p|0)==1){W=n1(c[m>>2]|0,(c[n>>2]|0)+46|0)|0}else if((p|0)==3){p=n1(c[m>>2]|0,(c[n>>2]|0)+46|0)|0;W=(n1(c[m>>2]|0,(c[b+212>>2]|0)+16|0)|0)+p|0}else{W=0}p=n1(c[m>>2]|0,(c[n>>2]|0)+36|0)|0;u=(n1(c[m>>2]|0,(c[n>>2]|0)+32|0)|0)&16777215;z=n0(c[m>>2]|0,(c[n>>2]|0)+44|0)|0;y=oH(c[b+8>>2]|0,q)|0;if((y|0)==0){c[b+204>>2]=-65;w=n0(c[m>>2]|0,(c[n>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[n>>2]|0)+16|0,-65);if((w&512)!=0){s=0;i=e;return s|0}w=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,w)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}if((z&64)!=0){c[b+204>>2]=0;z=n0(c[m>>2]|0,(c[n>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[n>>2]|0)+16|0,0);if((z&512)!=0){s=0;i=e;return s|0}z=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,z)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}do{if((W&511|0)==0){if((p&511|0)!=0){break}z=p>>>9;L2696:do{if((z|0)!=0){w=W>>>9;D=y+64|0;P=b+56|0;C=l+1|0;O=l+2|0;N=l+3|0;M=l+4|0;L=l+5|0;K=l+6|0;J=l+7|0;I=l+8|0;H=l+9|0;G=l+10|0;F=l+11|0;E=0;while(1){A=E+w|0;if((ot(y)|0)==6){if((fC(oA(y)|0,A,f,g,h)|0)!=0){break}B=c[D>>2]|0;X=c[f>>2]|0;Y=c[g>>2]|0;Z=c[h>>2]|0;oe(B,v,12,X,Y,Z,0)|0;c[j>>2]=512;if((od(c[D>>2]|0,r,j,X,Y,Z,0)|0)!=0){Q=2108;break}}else{vV(v|0,0,12);if((oK(y,r,A,1)|0)!=0){break}}A=(E<<9)+u|0;B=0;do{n3(c[m>>2]|0,A+B|0,a[k+B|0]|0);B=B+1|0;}while(B>>>0<512);n3(c[m>>2]|0,764,a[v]|0);n3(c[m>>2]|0,765,a[C]|0);n3(c[m>>2]|0,766,a[O]|0);n3(c[m>>2]|0,767,a[N]|0);n3(c[m>>2]|0,768,a[M]|0);n3(c[m>>2]|0,769,a[L]|0);n3(c[m>>2]|0,770,a[K]|0);n3(c[m>>2]|0,771,a[J]|0);n3(c[m>>2]|0,772,a[I]|0);n3(c[m>>2]|0,773,a[H]|0);n3(c[m>>2]|0,774,a[G]|0);n3(c[m>>2]|0,775,a[F]|0);B=c[P>>2]|0;if((B|0)!=0){A=E*12|0;n3(c[m>>2]|0,B+A|0,a[v]|0);n3(c[m>>2]|0,(A|1)+(c[P>>2]|0)|0,a[C]|0);n3(c[m>>2]|0,(A|2)+(c[P>>2]|0)|0,a[O]|0);n3(c[m>>2]|0,(A|3)+(c[P>>2]|0)|0,a[N]|0);n3(c[m>>2]|0,A+4+(c[P>>2]|0)|0,a[M]|0);n3(c[m>>2]|0,A+5+(c[P>>2]|0)|0,a[L]|0);n3(c[m>>2]|0,A+6+(c[P>>2]|0)|0,a[K]|0);n3(c[m>>2]|0,A+7+(c[P>>2]|0)|0,a[J]|0);n3(c[m>>2]|0,A+8+(c[P>>2]|0)|0,a[I]|0);n3(c[m>>2]|0,A+9+(c[P>>2]|0)|0,a[H]|0);n3(c[m>>2]|0,A+10+(c[P>>2]|0)|0,a[G]|0);n3(c[m>>2]|0,A+11+(c[P>>2]|0)|0,a[F]|0)}E=E+1|0;if(E>>>0>=z>>>0){break L2696}}if((Q|0)==2108){d$(53056,(x=i,i=i+24|0,c[x>>2]=X,c[x+8>>2]=Y,c[x+16>>2]=Z,x)|0)}d$(53744,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);c[b+204>>2]=-1;E=n0(c[m>>2]|0,(c[n>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[n>>2]|0)+16|0,-1);if((E&512)!=0){s=0;i=e;return s|0}E=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,E)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}}while(0);z=n1(c[m>>2]|0,308)|0;if(t){_=(q*66|0)+8+z|0}else{_=z}n3(c[m>>2]|0,_+3|0,2);n5(c[m>>2]|0,(c[n>>2]|0)+40|0,p);z=b+212|0;E=(n1(c[m>>2]|0,(c[z>>2]|0)+16|0)|0)+p|0;n5(c[m>>2]|0,(c[z>>2]|0)+16|0,E);c[b+204>>2]=0;E=n0(c[m>>2]|0,(c[n>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[n>>2]|0)+16|0,0);if((E&512)!=0){s=0;i=e;return s|0}E=n1(c[m>>2]|0,308)|0;c[z>>2]=n1(c[m>>2]|0,E)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}}while(0);d$(54352,(x=i,i=i+1|0,i=i+7>>3<<3,c[x>>2]=0,x)|0);c[b+204>>2]=-50;p=n0(c[m>>2]|0,(c[n>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[n>>2]|0)+16|0,-50);if((p&512)!=0){s=0;i=e;return s|0}p=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,p)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}else{d$(56904,(x=i,i=i+8|0,c[x>>2]=o,x)|0);c[b+204>>2]=-17;o=n0(c[m>>2]|0,(c[n>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[n>>2]|0)+16|0,-17);if((o&512)!=0){s=0;i=e;return s|0}o=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,o)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}}else if((d|0)==18){m=b+4|0;o=b+208|0;n=(n0(c[m>>2]|0,(c[o>>2]|0)+26|0)|0)&65535;if((n|0)==1){c[b+204>>2]=-27;p=c[m>>2]|0;_=(c[o>>2]|0)+6|0;n0(p,_)|0;n4(c[m>>2]|0,(c[o>>2]|0)+16|0,-27);s=0;i=e;return s|0}else if((n|0)==5){_=n0(c[m>>2]|0,(c[o>>2]|0)+22|0)|0;if(_<<16>>16==0|(_&65535)>4){c[b+204>>2]=-56;p=n0(c[m>>2]|0,(c[o>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[o>>2]|0)+16|0,-56);if((p&512)!=0){s=0;i=e;return s|0}p=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,p)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}p=b+204|0;if((oH(c[b+8>>2]|0,_&65535)|0)==0){c[p>>2]=-64;_=n0(c[m>>2]|0,(c[o>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[o>>2]|0)+16|0,-64);if((_&512)!=0){s=0;i=e;return s|0}_=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,_)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}else{c[p>>2]=0;p=n0(c[m>>2]|0,(c[o>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[o>>2]|0)+16|0,0);if((p&512)!=0){s=0;i=e;return s|0}p=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,p)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}}else if((n|0)==7){p=n0(c[m>>2]|0,(c[o>>2]|0)+22|0)|0;_=p&65535;if(p<<16>>16==0|(p&65535)>4){c[b+204>>2]=-56;q=n0(c[m>>2]|0,(c[o>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[o>>2]|0)+16|0,-56);if((q&512)!=0){s=0;i=e;return s|0}q=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,q)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}q=n1(c[m>>2]|0,308)|0;if((p&65535)<5){$=(_*66|0)+8+q|0}else{$=q}n3(c[m>>2]|0,$+3|0,0);n3(c[m>>2]|0,$+2|0,0);n3(c[m>>2]|0,$+18|0,0);c[b+204>>2]=0;$=n0(c[m>>2]|0,(c[o>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[o>>2]|0)+16|0,0);if(($&512)!=0){s=0;i=e;return s|0}$=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,$)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}else if((n|0)==8){c[b+56>>2]=(n1(c[m>>2]|0,(c[o>>2]|0)+28|0)|0)&16777215;c[b+204>>2]=0;$=n0(c[m>>2]|0,(c[o>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[o>>2]|0)+16|0,0);if(($&512)!=0){s=0;i=e;return s|0}$=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,$)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}else if((n|0)==9){c[b+204>>2]=-56;$=n0(c[m>>2]|0,(c[o>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[o>>2]|0)+16|0,-56);if(($&512)!=0){s=0;i=e;return s|0}$=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,$)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}else if((n|0)==6){$=n0(c[m>>2]|0,(c[o>>2]|0)+22|0)|0;q=$&65535;_=n0(c[m>>2]|0,(c[o>>2]|0)+28|0)|0;p=_&65535;if($<<16>>16==0|($&65535)>4){c[b+204>>2]=-56;t=n0(c[m>>2]|0,(c[o>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[o>>2]|0)+16|0,-56);if((t&512)!=0){s=0;i=e;return s|0}t=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,t)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}t=oH(c[b+8>>2]|0,q)|0;if((t|0)==0){c[b+204>>2]=-64;Z=n0(c[m>>2]|0,(c[o>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[o>>2]|0)+16|0,-64);if((Z&512)!=0){s=0;i=e;return s|0}Z=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,Z)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}if((a[t+56|0]|0)!=0){c[b+204>>2]=-44;Z=n0(c[m>>2]|0,(c[o>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[o>>2]|0)+16|0,-44);if((Z&512)!=0){s=0;i=e;return s|0}Z=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,Z)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}do{if(_<<16>>16==0){Q=2182}else{if(p>>>0>(c[b+64>>2]|0)>>>0){Q=2182;break}aa=c[b+68+((p<<1)-2<<2)>>2]|0}}while(0);do{if((Q|0)==2182){p=oA(t)|0;if((ot(t)|0)!=6){aa=p;break}aa=_<<16>>16==1?800:1600}}while(0);if((fA(t,aa)|0)!=0){c[b+204>>2]=-50;t=n0(c[m>>2]|0,(c[o>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[o>>2]|0)+16|0,-50);if((t&512)!=0){s=0;i=e;return s|0}t=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,t)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}t=n1(c[m>>2]|0,308)|0;if(($&65535)<5){ab=(q*66|0)+8+t|0}else{ab=t}n4(c[m>>2]|0,ab+18|0,aa&65535);n4(c[m>>2]|0,ab+20|0,aa>>>16&65535);c[b+204>>2]=0;aa=n0(c[m>>2]|0,(c[o>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[o>>2]|0)+16|0,0);if((aa&512)!=0){s=0;i=e;return s|0}aa=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,aa)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}else if((n|0)==21){fz(b);s=0;i=e;return s|0}else if((n|0)==22){fz(b);s=0;i=e;return s|0}else if((n|0)==23){aa=n0(c[m>>2]|0,(c[o>>2]|0)+22|0)|0;if(aa<<16>>16==0|(aa&65535)>4){c[b+204>>2]=-56;ab=n0(c[m>>2]|0,(c[o>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[o>>2]|0)+16|0,-56);if((ab&512)!=0){s=0;i=e;return s|0}ab=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,ab)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}else{ab=(aa&65535)-1|0;n5(c[m>>2]|0,(c[o>>2]|0)+28|0,(ab<<3&8|ab>>>1&1)<<8|4);c[b+204>>2]=0;ab=n0(c[m>>2]|0,(c[o>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[o>>2]|0)+16|0,0);if((ab&512)!=0){s=0;i=e;return s|0}ab=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,ab)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}}else if((n|0)==21315){ab=k|0;aa=l|0;t=n0(c[m>>2]|0,(c[o>>2]|0)+22|0)|0;q=n0(c[m>>2]|0,(c[o>>2]|0)+28|0)|0;$=q&65535;_=n1(c[m>>2]|0,(c[o>>2]|0)+30|0)|0;Q=n1(c[m>>2]|0,(c[o>>2]|0)+34|0)|0;if(t<<16>>16==0|(t&65535)>4){c[b+204>>2]=-56;p=n0(c[m>>2]|0,(c[o>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[o>>2]|0)+16|0,-56);if((p&512)!=0){s=0;i=e;return s|0}p=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,p)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}p=oH(c[b+8>>2]|0,t&65535)|0;if((p|0)==0){c[b+204>>2]=-64;t=n0(c[m>>2]|0,(c[o>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[o>>2]|0)+16|0,-64);if((t&512)!=0){s=0;i=e;return s|0}t=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,t)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}if((a[p+56|0]|0)!=0){c[b+204>>2]=-44;t=n0(c[m>>2]|0,(c[o>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[o>>2]|0)+16|0,-44);if((t&512)!=0){s=0;i=e;return s|0}t=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,t)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}do{if(q<<16>>16!=0){if($>>>0>(c[b+64>>2]|0)>>>0){break}t=c[b+68+(($<<1)-2<<2)>>2]|0;do{if(t>>>0<1120){ac=-2}else{if(t>>>0<1520){ac=0;break}if(t>>>0<2240){ac=-1;break}ac=t>>>0<5760?1:253}}while(0);if((fA(p,t)|0)!=0){c[b+204>>2]=-50;Z=n0(c[m>>2]|0,(c[o>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[o>>2]|0)+16|0,-50);if((Z&512)!=0){s=0;i=e;return s|0}Z=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,Z)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}Z=_&16777215;vV(aa|0,0,12);L2880:do{if((t|0)!=0){L2882:do{if(ac>>>0>1){Y=l+1|0;X=l+2|0;v=l+3|0;u=l+4|0;r=l+5|0;y=l+6|0;j=l+7|0;h=l+8|0;g=l+9|0;f=l+10|0;W=l+11|0;E=Q&16777215;z=0;F=Z;while(1){P=0;do{a[k+P|0]=n$(c[m>>2]|0,P+F|0)|0;P=P+1|0;}while(P>>>0<512);a[aa]=n$(c[m>>2]|0,E)|0;a[Y]=n$(c[m>>2]|0,E+1|0)|0;a[X]=n$(c[m>>2]|0,E+2|0)|0;a[v]=n$(c[m>>2]|0,E+3|0)|0;a[u]=n$(c[m>>2]|0,E+4|0)|0;a[r]=n$(c[m>>2]|0,E+5|0)|0;a[y]=n$(c[m>>2]|0,E+6|0)|0;a[j]=n$(c[m>>2]|0,E+7|0)|0;a[h]=n$(c[m>>2]|0,E+8|0)|0;a[g]=n$(c[m>>2]|0,E+9|0)|0;a[f]=n$(c[m>>2]|0,E+10|0)|0;a[W]=n$(c[m>>2]|0,E+11|0)|0;if((fB(p,ab,aa,z)|0)!=0){break L2882}P=z+1|0;if(P>>>0<t>>>0){E=E+12|0;z=P;F=F+512|0}else{break L2880}}}else{F=0;z=Z;while(1){E=0;do{a[k+E|0]=n$(c[m>>2]|0,E+z|0)|0;E=E+1|0;}while(E>>>0<512);if((fB(p,ab,aa,F)|0)!=0){break L2882}E=F+1|0;if(E>>>0<t>>>0){F=E;z=z+512|0}else{break L2880}}}}while(0);c[b+204>>2]=-1;z=n0(c[m>>2]|0,(c[o>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[o>>2]|0)+16|0,-1);if((z&512)!=0){s=0;i=e;return s|0}z=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,z)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}}while(0);c[b+204>>2]=0;t=n0(c[m>>2]|0,(c[o>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[o>>2]|0)+16|0,0);if((t&512)!=0){s=0;i=e;return s|0}t=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,t)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}}while(0);c[b+204>>2]=-50;aa=n0(c[m>>2]|0,(c[o>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[o>>2]|0)+16|0,-50);if((aa&512)!=0){s=0;i=e;return s|0}aa=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,aa)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}else{d$(32872,(x=i,i=i+8|0,c[x>>2]=n,x)|0);c[b+204>>2]=-17;n=n0(c[m>>2]|0,(c[o>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[o>>2]|0)+16|0,-17);if((n&512)!=0){s=0;i=e;return s|0}n=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,n)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}}else if((d|0)==16){a[b|0]=1;if((fr(b)|0)==0){s=0;i=e;return s|0}c[b+216>>2]=c[b+44>>2];s=0;i=e;return s|0}else if((d|0)==19){m=b+4|0;n=b+208|0;o=(n0(c[m>>2]|0,(c[n>>2]|0)+26|0)|0)&65535;if((o|0)==6){aa=n0(c[m>>2]|0,(c[n>>2]|0)+22|0)|0;ab=(n0(c[m>>2]|0,(c[n>>2]|0)+28|0)|0)&65535;p=n1(c[m>>2]|0,(c[n>>2]|0)+30|0)|0;if(aa<<16>>16==0|(aa&65535)>4){c[b+204>>2]=-56;k=n0(c[m>>2]|0,(c[n>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[n>>2]|0)+16|0,-56);if((k&512)!=0){s=0;i=e;return s|0}k=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,k)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}k=oH(c[b+8>>2]|0,aa&65535)|0;if((k|0)==0){c[b+204>>2]=-64;aa=n0(c[m>>2]|0,(c[n>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[n>>2]|0)+16|0,-64);if((aa&512)!=0){s=0;i=e;return s|0}aa=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,aa)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}aa=oA(k)|0;Q=b+68|0;l=b+64|0;do{if((ot(k)|0)==6){c[l>>2]=4;c[Q>>2]=800;ac=b+72|0;c[ac>>2]=-2130050992;c[b+76>>2]=1600;_=b+80|0;c[_>>2]=-2113273776;c[b+84>>2]=1440;$=b+88|0;c[$>>2]=-2113339312;c[b+92>>2]=2880;q=b+96|0;c[q>>2]=-1844314032;if(aa>>>0<1120){c[ac>>2]=-1056309168;ad=4;break}if(aa>>>0<1520){c[$>>2]=-1039597488;ad=4;break}if(aa>>>0<2240){c[_>>2]=-1039531952;ad=4;break}if((a[b+60|0]|0)==0){c[l>>2]=1;c[Q>>2]=2880;c[ac>>2]=-770572208;ad=1;break}else{c[q>>2]=-770572208;ad=4;break}}else{c[l>>2]=1;c[Q>>2]=aa;c[b+72>>2]=0;ad=1}}while(0);aa=ab>>>0>ad>>>0?ad:ab;ab=c[m>>2]|0;if((aa|0)==0){ae=ab}else{ad=0;Q=ab;while(1){ab=(ad<<3)+p|0;l=ad<<1;n5(Q,ab,c[b+68+(l<<2)>>2]|0);n5(c[m>>2]|0,ab+4|0,c[b+68+((l|1)<<2)>>2]|0);l=ad+1|0;ab=c[m>>2]|0;if(l>>>0<aa>>>0){ad=l;Q=ab}else{ae=ab;break}}}n4(ae,(c[n>>2]|0)+28|0,aa&65535);c[b+204>>2]=0;aa=n0(c[m>>2]|0,(c[n>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[n>>2]|0)+16|0,0);if((aa&512)!=0){s=0;i=e;return s|0}aa=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,aa)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}else if((o|0)==8){aa=n0(c[m>>2]|0,(c[n>>2]|0)+22|0)|0;ae=aa&65535;if(aa<<16>>16==0|(aa&65535)>4){c[b+204>>2]=-56;Q=n0(c[m>>2]|0,(c[n>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[n>>2]|0)+16|0,-56);if((Q&512)!=0){s=0;i=e;return s|0}Q=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,Q)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}if((oH(c[b+8>>2]|0,ae)|0)==0){c[b+204>>2]=-64;Q=n0(c[m>>2]|0,(c[n>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[n>>2]|0)+16|0,-64);if((Q&512)!=0){s=0;i=e;return s|0}Q=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,Q)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}Q=n1(c[m>>2]|0,308)|0;if((aa&65535)<5){af=(ae*66|0)+8+Q|0}else{af=Q}Q=0;do{ae=Q<<1;aa=n0(c[m>>2]|0,ae+af|0)|0;n4(c[m>>2]|0,ae+28+(c[n>>2]|0)|0,aa);Q=Q+1|0;}while(Q>>>0<11);c[b+204>>2]=0;Q=n0(c[m>>2]|0,(c[n>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[n>>2]|0)+16|0,0);if((Q&512)!=0){s=0;i=e;return s|0}Q=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,Q)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0;s=0;i=e;return s|0}else{c[b+204>>2]=-18;Q=n0(c[m>>2]|0,(c[n>>2]|0)+6|0)|0;n4(c[m>>2]|0,(c[n>>2]|0)+16|0,-18);if((Q&512)==0){Q=n1(c[m>>2]|0,308)|0;c[b+212>>2]=n1(c[m>>2]|0,Q)|0;c[b+216>>2]=n1(c[m>>2]|0,2300)|0}d$(35912,(x=i,i=i+8|0,c[x>>2]=o,x)|0);s=0;i=e;return s|0}}else if((d|0)==20){s=0;i=e;return s|0}else{s=1;i=e;return s|0}return 0}function ft(a,b){a=a|0;b=b|0;c[a+4>>2]=b;return}function fu(a,b){a=a|0;b=b|0;c[a+764>>2]=b;return}function fv(a,b){a=a|0;b=b|0;var d=0;d=(b|0)!=0|0;b=a+760|0;if((c[b>>2]|0)==(d|0)){return}c[b>>2]=d;return}function fw(a,f){a=a|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;g=a+760|0;if((c[g>>2]|0)==0){return}h=a+4|0;if((c[h>>2]|0)==0){return}i=a+12|0;j=c[i>>2]|0;if(j>>>0>369){return}k=a+756|0;l=(c[k>>2]|0)+f|0;c[k>>2]=l;if(l>>>0<=351){return}c[k>>2]=(l>>>0)%352|0;k=8-(c[a+764>>2]|0)|0;f=a+8|0;m=a+820|0;n=a+824|0;o=(l>>>0)/352|0;l=j;while(1){if(l>>>0>=370){p=2386;break}j=c[f>>2]|0;do{if((c[g>>2]|0)==0){q=32768}else{r=(d[(c[h>>2]|0)+(j<<1)|0]|0)<<8;if(r>>>0<32768){q=32768-(((32768-r|0)>>>0)/(k>>>0)|0)|0;break}else{q=(((r-32768|0)>>>0)/(k>>>0)|0)+32768|0;break}}}while(0);r=j+1|0;c[f>>2]=r>>>0>369?0:r;r=q&65535;if((q|0)!=(e[m>>1]|0|0)){b[m>>1]=r;c[n>>2]=1}b[a+16+(l<<1)>>1]=r;r=(c[i>>2]|0)+1|0;c[i>>2]=r;s=o-1|0;if((s|0)==0){p=2389;break}else{o=s;l=r}}if((p|0)==2389){return}else if((p|0)==2386){return}}function fx(a){a=a|0;var b=0,d=0,f=0,g=0,h=0,i=0;if((a&61440|0)!=40960){b=0;return b|0}d=(a&2048|0)==0;f=d?63743:64511;g=d?5208:400;d=0;while(1){h=c[g+(d<<3)+4>>2]|0;if((h|0)==0){b=0;i=2397;break}if((((e[g+(d<<3)>>1]|0)^a)&f|0)==0){b=h;i=2396;break}else{d=d+1|0}}if((i|0)==2397){return b|0}else if((i|0)==2396){return b|0}return 0}function fy(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;d=b+1|0;do{if((a[d]|0)!=0){e=b+136|0;f=c[e>>2]|0;if((f|0)==0){break}if((c[b+132>>2]|0)==0){break}g=b+4|0;h=0;i=b+140|0;j=f;while(1){f=(n0(c[g>>2]|0,j+8+(h<<1)|0)|0)&65535;k=(c[e>>2]|0)+f|0;n2(c[g>>2]|0,k,a[i]|0);n2(c[g>>2]|0,k+1|0,a[i+1|0]|0);n2(c[g>>2]|0,k+2|0,a[i+2|0]|0);n2(c[g>>2]|0,k+3|0,a[i+3|0]|0);n2(c[g>>2]|0,k+4|0,a[i+4|0]|0);n2(c[g>>2]|0,k+5|0,a[i+5|0]|0);k=h+1|0;if(k>>>0>=5){break}h=k;i=i+6|0;j=c[e>>2]|0}a[d]=0}}while(0);a[b|0]=0;c[b+28>>2]=c[b+12>>2];c[b+32>>2]=c[b+16>>2];c[b+36>>2]=c[b+20>>2];c[b+40>>2]=c[b+24>>2];return}function fz(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0;b=a+4|0;d=a+208|0;e=n0(c[b>>2]|0,(c[d>>2]|0)+22|0)|0;if(e<<16>>16==0|(e&65535)>4){c[a+204>>2]=-56;f=n0(c[b>>2]|0,(c[d>>2]|0)+6|0)|0;n4(c[b>>2]|0,(c[d>>2]|0)+16|0,-56);if((f&512)!=0){return}f=n1(c[b>>2]|0,308)|0;c[a+212>>2]=n1(c[b>>2]|0,f)|0;c[a+216>>2]=n1(c[b>>2]|0,2300)|0;return}f=c[a+48>>2]|0;g=c[a+52>>2]|0;h=oH(c[a+8>>2]|0,e&65535)|0;do{if((h|0)==0){i=f}else{e=oA(h)|0;if((e|0)==800|(e|0)==1600|(e|0)==1440|(e|0)==2880){i=f;break}i=g}}while(0);n5(c[b>>2]|0,(c[d>>2]|0)+28|0,i);c[a+204>>2]=0;i=n0(c[b>>2]|0,(c[d>>2]|0)+6|0)|0;n4(c[b>>2]|0,(c[d>>2]|0)+16|0,0);if((i&512)!=0){return}i=n1(c[b>>2]|0,308)|0;c[a+212>>2]=n1(c[b>>2]|0,i)|0;c[a+216>>2]=n1(c[b>>2]|0,2300)|0;return}function fA(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;d=i;i=i+512|0;e=d|0;if((ot(a)|0)!=6){if((oA(a)|0)!=(b|0)){f=1;i=d;return f|0}g=e|0;vV(g|0,0,512);if((b|0)==0){f=0;i=d;return f|0}else{h=0}while(1){oL(a,g,h,1)|0;j=h+1|0;if(j>>>0<b>>>0){h=j}else{f=0;break}}i=d;return f|0}h=c[a+64>>2]|0;g=h;j=e|0;vV(j|0,0,12);do{if(b>>>0<1120){k=1;l=2428}else{if(b>>>0<1520){m=2}else{if(b>>>0<2240){k=2;l=2428;break}m=b>>>0<5760?3:255}oh(g)|0;e=(m|0)==2;if((m-2|0)>>>0>=2){f=1;i=d;return f|0}n6(g,e?2:32770);n=e?9:18;e=0;do{o=0;while(1){p=o+1|0;oi(g,e,0,e,0,p,512,0)|0;if(p>>>0<n>>>0){o=p}else{q=0;break}}do{q=q+1|0;oi(g,e,1,e,1,q,512,0)|0;}while(q>>>0<n>>>0);e=e+1|0;}while(e>>>0<80)}}while(0);if((l|0)==2428){oh(g)|0;n6(g,3);l=h+68|0;h=13;q=0;do{h=(((q&15|0)==0)<<31>>31)+h|0;if((h|0)!=0){m=0;do{b=0;do{oi(g,q,m,q,m,b,512,0)|0;e=q_(c[l>>2]|0,q,m,b,1)|0;if((e|0)!=0){qN(e,j,12)|0}b=b+1|0;}while(b>>>0<h>>>0);m=m+1|0;}while(m>>>0<k>>>0)}q=q+1|0;}while(q>>>0<80)}q=oA(a)|0;d$(57752,(x=i,i=i+8|0,c[x>>2]=q,x)|0);f=0;i=d;return f|0}function fB(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;f=i;i=i+32|0;g=f|0;h=f+8|0;j=f+16|0;k=f+24|0;if((ot(a)|0)!=6){l=(oL(a,b,e,1)|0)!=0|0;i=f;return l|0}if((fC(oA(a)|0,e,g,h,j)|0)!=0){l=1;i=f;return l|0}e=oA(a)|0;if(e>>>0<1120|(e-1520|0)>>>0<720){e=a+64|0;m=c[e>>2]|0;n=c[g>>2]|0;o=c[h>>2]|0;p=c[j>>2]|0;og(m,d,12,n,o,p,0)|0;q=n;r=o;s=p;t=e}else{q=c[g>>2]|0;r=c[h>>2]|0;s=c[j>>2]|0;t=a+64|0}c[k>>2]=512;if((of(c[t>>2]|0,b,k,q,r,s,0)|0)==0){l=0;i=f;return l|0}d$(31392,(x=i,i=i+24|0,c[x>>2]=q,c[x+8>>2]=r,c[x+16>>2]=s,x)|0);l=1;i=f;return l|0}function fC(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;L3127:do{if(a>>>0<1120){h=1}else{do{if(a>>>0<1520){c[f>>2]=((b>>>0)%9|0)+1;c[e>>2]=((b>>>0)/9|0)&1;j=(b>>>0)/18|0}else{if(a>>>0<2240){h=0;break L3127}if(a>>>0<5760){c[f>>2]=((b>>>0)%18|0)+1;c[e>>2]=((b>>>0)/18|0)&1;j=(b>>>0)/36|0;break}d$(30488,(x=i,i=i+16|0,c[x>>2]=a,c[x+8>>2]=b,x)|0);k=1;i=g;return k|0}}while(0);c[d>>2]=j;k=0;i=g;return k|0}}while(0);j=h?1:2;c[d>>2]=0;a=j*192|0;do{if(a>>>0>b>>>0){l=12;m=b}else{n=b-a|0;c[d>>2]=16;o=j*176|0;if(n>>>0<o>>>0){l=11;m=n;break}p=n-o|0;c[d>>2]=32;o=j*160|0;if(p>>>0<o>>>0){l=10;m=p;break}n=p-o|0;c[d>>2]=48;o=j*144|0;if(n>>>0<o>>>0){l=9;m=n;break}p=n-o|0;c[d>>2]=64;if(p>>>0<j<<7>>>0){l=8;m=p;break}c[d>>2]=80;k=1;i=g;return k|0}}while(0);c[f>>2]=(m>>>0)%(l>>>0)|0;c[e>>2]=((m>>>0)/(l>>>0)|0)&(h&1^1);h=(m>>>0)/((ac(l,j)|0)>>>0)|0;c[d>>2]=(c[d>>2]|0)+h;k=0;i=g;return k|0}function fD(a){a=a|0;c[a+756>>2]=0;c[a+760>>2]=0;c[a+764>>2]=0;vV(a|0,0,16);c[a+768>>2]=8e3;sf(a+772|0);b[a+820>>1]=-32768;c[a+824>>2]=0;c[a+828>>2]=60;return}function fE(a,b){a=a|0;b=b|0;c[a+768>>2]=b;sh(a+772|0,b,22255);return}function fF(a,b){a=a|0;b=b|0;var d=0,e=0;d=a|0;a=c[d>>2]|0;if((a|0)!=0){sk(a)}a=sp(b)|0;c[d>>2]=a;if((a|0)==0){e=1;return e|0}if((sm(a,1,22255,0)|0)==0){e=0;return e|0}sk(c[d>>2]|0);c[d>>2]=0;e=1;return e|0}function fG(a){a=a|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;f=i;i=i+8192|0;g=f|0;h=a+4|0;if((c[h>>2]|0)==0){i=f;return}j=a|0;if((c[j>>2]|0)==0){i=f;return}k=a+12|0;l=c[k>>2]|0;L3169:do{if(l>>>0<370){m=a+760|0;if((c[m>>2]|0)==0){if((c[a+828>>2]|0)>>>0>59&(l|0)==0){break}n=a+820|0;if((b[n>>1]|0)!=-32768){c[a+824>>2]=1}o=a+8|0;p=370-l|0;q=l;do{if(q>>>0>=370){break}b[a+16+(q<<1)>>1]=-32768;r=(c[o>>2]|0)+1|0;c[o>>2]=r>>>0>369?0:r;q=(c[k>>2]|0)+1|0;c[k>>2]=q;p=p-1|0;}while((p|0)!=0);b[n>>1]=-32768;break}p=8-(c[a+764>>2]|0)|0;q=a+8|0;o=a+820|0;r=a+824|0;s=370-l|0;t=l;do{if(t>>>0>=370){break L3169}u=c[q>>2]|0;do{if((c[m>>2]|0)==0){v=32768}else{w=d[(c[h>>2]|0)+(u<<1)|0]<<8;if(w>>>0<32768){v=32768-(((32768-w|0)>>>0)/(p>>>0)|0)|0;break}else{v=(((w-32768|0)>>>0)/(p>>>0)|0)+32768|0;break}}}while(0);w=u+1|0;c[q>>2]=w>>>0>369?0:w;w=v&65535;if((v|0)!=(e[o>>1]|0)){b[o>>1]=w;c[r>>2]=1}b[a+16+(t<<1)>>1]=w;t=(c[k>>2]|0)+1|0;c[k>>2]=t;s=s-1|0;}while((s|0)!=0)}}while(0);v=a+824|0;h=a+828|0;l=c[h>>2]|0;do{if((c[v>>2]|0)==0){if(l>>>0>=60){break}s=l+1|0;c[h>>2]=s;if(s>>>0<60){x=2519}}else{if(l>>>0>59){s=c[j>>2]|0;vV(g|0,0,8192);t=g|0;sl(s,t,4096)|0}c[h>>2]=0;x=2519}}while(0);if((x|0)==2519){if((c[a+768>>2]|0)==0){y=a+16|0}else{x=a+16|0;r6(a+772|0,x,x,c[k>>2]|0,1,0);y=x}x=c[j>>2]|0;j=c[k>>2]|0;sl(x,y,j)|0}c[v>>2]=0;c[a+8>>2]=16;c[k>>2]=0;c[a+756>>2]=0;i=f;return}function fH(a,b,d){a=a|0;b=b|0;d=d|0;c[a+52>>2]=b;c[a+56>>2]=d;return}function fI(a,b){a=a|0;b=b|0;c[a>>2]=b;return}function fJ(b,c,d){b=b|0;c=c|0;d=d|0;a[b+32|0]=c>>>16&255;a[b+35|0]=d>>>16&255;a[b+33|0]=c>>>8&255;a[b+36|0]=d>>>8&255;a[b+34|0]=c&255;a[b+37|0]=d&255;a[b+12|0]=1;return}function fK(b,d){b=b|0;d=d|0;var e=0;e=d>>>0>255?255:d;d=b+28|0;if((c[d>>2]|0)==(e|0)){return}a[b+12|0]=1;c[d>>2]=e;return}function fL(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=vP(60)|0;f=e;if((e|0)==0){g=0;return g|0}c[e>>2]=0;c[e+44>>2]=0;c[e+4>>2]=b;c[e+8>>2]=d;a[e+12|0]=0;c[e+16>>2]=8;h=vP(ac((b+7|0)>>>3,d)|0)|0;c[e+20>>2]=h;do{if((h|0)!=0){d=vP(b*24|0)|0;c[e+24>>2]=d;if((d|0)==0){break}c[e+28>>2]=255;a[e+32|0]=0;a[e+33|0]=0;a[e+34|0]=0;a[e+35|0]=-1;a[e+36|0]=-1;a[e+37|0]=-1;c[e+40>>2]=0;a[e+48|0]=0;c[e+52>>2]=0;c[e+56>>2]=0;g=f;return g|0}}while(0);vQ(e);g=0;return g|0}function fM(a,b){a=a|0;b=b|0;c[a+44>>2]=b;if((b|0)==0){return}vt(b,c[a+4>>2]|0,c[a+8>>2]|0)|0;return}function fN(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;e=i;i=i+16|0;f=e|0;g=e+8|0;h=b+44|0;j=c[h>>2]|0;if((j|0)==0){i=e;return}k=b|0;if((c[k>>2]|0)==0){i=e;return}l=c[b+28>>2]|0;m=f|0;a[m]=(((ac(d[b+32|0]|0,l)|0)>>>0)/255|0)&255;n=g|0;a[n]=(((ac(d[b+35|0]|0,l)|0)>>>0)/255|0)&255;o=f+1|0;a[o]=(((ac(d[b+33|0]|0,l)|0)>>>0)/255|0)&255;p=g+1|0;a[p]=(((ac(d[b+36|0]|0,l)|0)>>>0)/255|0)&255;q=f+2|0;a[q]=(((ac(d[b+34|0]|0,l)|0)>>>0)/255|0)&255;f=g+2|0;a[f]=(((ac(d[b+37|0]|0,l)|0)>>>0)/255|0)&255;l=b+4|0;g=b+8|0;vx(j,c[l>>2]|0,c[g>>2]|0);j=c[b+24>>2]|0;r=c[g>>2]|0;L3240:do{if((r|0)==0){s=b+12|0}else{t=b+16|0;u=b+12|0;v=c[k>>2]|0;w=c[b+20>>2]|0;x=0;y=r;while(1){z=y-x|0;A=c[t>>2]|0;B=z>>>0>A>>>0?A:z;z=ac(((c[l>>2]|0)+7|0)>>>3,B)|0;if((a[u]|0)==0){if((vZ(w|0,v|0,z|0)|0)==0){C=y}else{D=2557}}else{D=2557}if((D|0)==2557){D=0;vW(w|0,v|0,z)|0;A=z<<3;if((A|0)!=0){E=0;F=0;while(1){if((d[w+(F>>>3)|0]&128>>>((F&7)>>>0)|0)==0){a[j+E|0]=a[n]|0;a[j+(E+1)|0]=a[p]|0;a[j+(E+2)|0]=a[f]|0}else{a[j+E|0]=a[m]|0;a[j+(E+1)|0]=a[o]|0;a[j+(E+2)|0]=a[q]|0}G=F+1|0;if(G>>>0<A>>>0){E=E+3|0;F=G}else{break}}}vy(c[h>>2]|0,j,x,B);C=c[g>>2]|0}F=B+x|0;if(F>>>0>=C>>>0){s=u;break L3240}v=v+z|0;w=w+z|0;x=F;y=C}}}while(0);a[s]=0;vz(c[h>>2]|0);i=e;return}function fO(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=b+40|0;f=c[e>>2]|0;g=f+d|0;c[e>>2]=g;if(g>>>0<120384){return}do{if(f>>>0<120384){fN(b);g=b+48|0;if((a[g]|0)==1){break}a[g]=1;g=c[b+56>>2]|0;if((g|0)==0){break}b1[g&511](c[b+52>>2]|0,1)}}while(0);f=c[e>>2]|0;if(f>>>0<=130239){return}g=b+48|0;do{if((a[g]|0)==0){h=f}else{a[g]=0;d=c[b+56>>2]|0;if((d|0)==0){h=f;break}b1[d&511](c[b+52>>2]|0,0);h=c[e>>2]|0}}while(0);c[e>>2]=h-130240;return}function fP(e,f,g){e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;h=i;i=i+16|0;j=h|0;k=e+36|0;l=e+32|0;m=e+8|0;n=e+4|0;e=0;do{o=e+g&16777215;if(o>>>0<(c[k>>2]|0)>>>0){p=a[(c[l>>2]|0)+o|0]|0}else{p=b6[c[m>>2]&63](c[n>>2]|0,o)|0}a[j+e|0]=p;e=e+1|0;}while(e>>>0<16);e=j|0;c[f>>2]=0;c[f+4>>2]=g;a[f+288|0]=0;g=a[e]|0;p=a[j+1|0]|0;b[f+12>>1]=(g&255)<<8|p&255;n=f+8|0;c[n>>2]=1;b1[c[20856+(((p&255)>>>6|(g&255)<<2)<<2)>>2]&511](f,e);if((c[n>>2]|0)==0){i=h;return}else{q=0}do{e=q<<1;b[f+12+(q<<1)>>1]=(d[j+e|0]|0)<<8|(d[j+(e|1)|0]|0);q=q+1|0;}while(q>>>0<(c[n>>2]|0)>>>0);i=h;return}function fQ(e,f){e=e|0;f=f|0;var g=0,h=0,j=0;g=i;h=(b[e+12>>1]&63)==60;j=e+32|0;a[j]=a[47696]|0;a[j+1|0]=a[47697|0]|0;a[j+2|0]=a[47698|0]|0;a[j+3|0]=a[47699|0]|0;a[j+4|0]=a[47700|0]|0;a[j+5|0]=a[47701|0]|0;c[e+28>>2]=2;j=d[f+3|0]|0;a2(e+96|0,54944,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=j,x)|0)|0;j=e+8|0;c[j>>2]=(c[j>>2]|0)+1;j=e+160|0;if(h){h=j;y=5391171;a[h]=y&255;y=y>>8;a[h+1|0]=y&255;y=y>>8;a[h+2|0]=y&255;y=y>>8;a[h+3|0]=y&255;i=g;return}else{ik(e,j,f,a[f+1|0]&63,8);i=g;return}}function fR(e,f){e=e|0;f=f|0;var g=0,h=0,j=0;g=i;h=(b[e+12>>1]&63)==60;j=e+32|0;a[j]=a[47728]|0;a[j+1|0]=a[47729|0]|0;a[j+2|0]=a[47730|0]|0;a[j+3|0]=a[47731|0]|0;a[j+4|0]=a[47732|0]|0;a[j+5|0]=a[47733|0]|0;c[e+28>>2]=2;j=((d[f+2|0]|0)<<8|(d[f+3|0]|0))&65535;a2(e+96|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=j,x)|0)|0;j=e+8|0;c[j>>2]=(c[j>>2]|0)+1;j=e+160|0;if(h){a[j]=a[51552]|0;a[j+1|0]=a[51553|0]|0;a[j+2|0]=a[51554|0]|0;h=e|0;c[h>>2]=c[h>>2]|1;i=g;return}else{ik(e,j,f,a[f+1|0]&63,16);i=g;return}}function fS(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[47752]|0;a[g+1|0]=a[47753|0]|0;a[g+2|0]=a[47754|0]|0;a[g+3|0]=a[47755|0]|0;a[g+4|0]=a[47756|0]|0;a[g+5|0]=a[47757|0]|0;c[b+28>>2]=2;g=(((d[e+2|0]|0)<<8|(d[e+3|0]|0))<<8|(d[e+4|0]|0))<<8|(d[e+5|0]|0);a2(b+96|0,54160,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=g,x)|0)|0;g=b+8|0;c[g>>2]=(c[g>>2]|0)+2;ik(b,b+160|0,e,a[e+1|0]&63,32);i=f;return}function fT(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;g=b+8|0;h=c[g>>2]|0;j=a[e+(h<<1)|0]|0;c[g>>2]=h+1;h=b+32|0;if((j&8)==0){a[h]=a[47776]|0;a[h+1|0]=a[47777|0]|0;a[h+2|0]=a[47778|0]|0;a[h+3|0]=a[47779|0]|0;a[h+4|0]=a[47780|0]|0;a[h+5|0]=a[47781|0]|0;a[h+6|0]=a[47782|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,8);j=b+160|0;g=d[e+2|0]|0;k=(g&128|0)!=0?34848:32296;l=g>>>4&7;a2(j|0,37712,(x=i,i=i+16|0,c[x>>2]=k,c[x+8>>2]=l,x)|0)|0;m=b|0;n=c[m>>2]|0;o=n|128;c[m>>2]=o;i=f;return}else{a[h]=a[47808]|0;a[h+1|0]=a[47809|0]|0;a[h+2|0]=a[47810|0]|0;a[h+3|0]=a[47811|0]|0;a[h+4|0]=a[47812|0]|0;a[h+5|0]=a[47813|0]|0;a[h+6|0]=a[47814|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,8);h=b+160|0;l=d[e+2|0]|0;e=(l&128|0)!=0?34848:32296;k=l>>>4&7;a2(h|0,37712,(x=i,i=i+16|0,c[x>>2]=e,c[x+8>>2]=k,x)|0)|0;m=b|0;n=c[m>>2]|0;o=n|128;c[m>>2]=o;i=f;return}}function fU(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;h=b[e+12>>1]|0;j=e+32|0;if((h&56)==8){k=j;l=k|0;y=1163284301;a[l]=y&255;y=y>>8;a[l+1|0]=y&255;y=y>>8;a[l+2|0]=y&255;y=y>>8;a[l+3|0]=y&255;l=k+4|0;y=5713488;a[l]=y&255;y=y>>8;a[l+1|0]=y&255;y=y>>8;a[l+2|0]=y&255;y=y>>8;a[l+3|0]=y&255;c[e+28>>2]=2;l=e+96|0;k=((d[f+2|0]|0)<<8|(d[f+3|0]|0))&65535;m=(k&32768|0)!=0;n=m?56440:63e3;o=(m?-k|0:k)&65535;k=h&7;a2(l|0,57568,(x=i,i=i+32|0,c[x>>2]=n,c[x+8>>2]=41400,c[x+16>>2]=o,c[x+24>>2]=k,x)|0)|0;k=e+8|0;c[k>>2]=(c[k>>2]|0)+1;k=e+160|0;o=(d[f]|0)>>>1&7;a2(k|0,44048,(x=i,i=i+8|0,c[x>>2]=o,x)|0)|0;i=g;return}else{a[j]=a[48400]|0;a[j+1|0]=a[48401|0]|0;a[j+2|0]=a[48402|0]|0;a[j+3|0]=a[48403|0]|0;a[j+4|0]=a[48404|0]|0;c[e+28>>2]=2;j=e+96|0;o=(d[f]|0)>>>1&7;a2(j|0,44048,(x=i,i=i+8|0,c[x>>2]=o,x)|0)|0;ik(e,e+160|0,f,a[f+1|0]&63,8);i=g;return}}function fV(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;h=b[e+12>>1]|0;j=e+32|0;if((h&56)==8){k=j;l=k|0;y=1163284301;a[l]=y&255;y=y>>8;a[l+1|0]=y&255;y=y>>8;a[l+2|0]=y&255;y=y>>8;a[l+3|0]=y&255;l=k+4|0;y=4992592;a[l]=y&255;y=y>>8;a[l+1|0]=y&255;y=y>>8;a[l+2|0]=y&255;y=y>>8;a[l+3|0]=y&255;c[e+28>>2]=2;l=e+96|0;k=((d[f+2|0]|0)<<8|(d[f+3|0]|0))&65535;m=(k&32768|0)!=0;n=m?56440:63e3;o=(m?-k|0:k)&65535;k=h&7;a2(l|0,57568,(x=i,i=i+32|0,c[x>>2]=n,c[x+8>>2]=41400,c[x+16>>2]=o,c[x+24>>2]=k,x)|0)|0;k=e+8|0;c[k>>2]=(c[k>>2]|0)+1;k=e+160|0;o=(d[f]|0)>>>1&7;a2(k|0,44048,(x=i,i=i+8|0,c[x>>2]=o,x)|0)|0;i=g;return}else{a[j]=a[48448]|0;a[j+1|0]=a[48449|0]|0;a[j+2|0]=a[48450|0]|0;a[j+3|0]=a[48451|0]|0;a[j+4|0]=a[48452|0]|0;c[e+28>>2]=2;j=e+96|0;o=(d[f]|0)>>>1&7;a2(j|0,44048,(x=i,i=i+8|0,c[x>>2]=o,x)|0)|0;ik(e,e+160|0,f,a[f+1|0]&63,8);i=g;return}}function fW(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;h=e+12|0;j=e+32|0;if((b[h>>1]&56)==8){k=j;l=k|0;y=1163284301;a[l]=y&255;y=y>>8;a[l+1|0]=y&255;y=y>>8;a[l+2|0]=y&255;y=y>>8;a[l+3|0]=y&255;l=k+4|0;y=5713488;a[l]=y&255;y=y>>8;a[l+1|0]=y&255;y=y>>8;a[l+2|0]=y&255;y=y>>8;a[l+3|0]=y&255;c[e+28>>2]=2;l=e+96|0;k=(d[f]|0)>>>1&7;a2(l|0,44048,(x=i,i=i+8|0,c[x>>2]=k,x)|0)|0;k=e+160|0;l=((d[f+2|0]|0)<<8|(d[f+3|0]|0))&65535;m=(l&32768|0)!=0;n=m?56440:63e3;o=(m?-l|0:l)&65535;l=b[h>>1]&7;a2(k|0,57568,(x=i,i=i+32|0,c[x>>2]=n,c[x+8>>2]=41400,c[x+16>>2]=o,c[x+24>>2]=l,x)|0)|0;l=e+8|0;c[l>>2]=(c[l>>2]|0)+1;i=g;return}else{a[j]=a[48480]|0;a[j+1|0]=a[48481|0]|0;a[j+2|0]=a[48482|0]|0;a[j+3|0]=a[48483|0]|0;a[j+4|0]=a[48484|0]|0;c[e+28>>2]=2;j=e+96|0;l=(d[f]|0)>>>1&7;a2(j|0,44048,(x=i,i=i+8|0,c[x>>2]=l,x)|0)|0;ik(e,e+160|0,f,a[f+1|0]&63,8);i=g;return}}function fX(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;h=e+12|0;j=e+32|0;if((b[h>>1]&56)==8){k=j;l=k|0;y=1163284301;a[l]=y&255;y=y>>8;a[l+1|0]=y&255;y=y>>8;a[l+2|0]=y&255;y=y>>8;a[l+3|0]=y&255;l=k+4|0;y=4992592;a[l]=y&255;y=y>>8;a[l+1|0]=y&255;y=y>>8;a[l+2|0]=y&255;y=y>>8;a[l+3|0]=y&255;c[e+28>>2]=2;l=e+96|0;k=(d[f]|0)>>>1&7;a2(l|0,44048,(x=i,i=i+8|0,c[x>>2]=k,x)|0)|0;k=e+160|0;l=((d[f+2|0]|0)<<8|(d[f+3|0]|0))&65535;m=(l&32768|0)!=0;n=m?56440:63e3;o=(m?-l|0:l)&65535;l=b[h>>1]&7;a2(k|0,57568,(x=i,i=i+32|0,c[x>>2]=n,c[x+8>>2]=41400,c[x+16>>2]=o,c[x+24>>2]=l,x)|0)|0;l=e+8|0;c[l>>2]=(c[l>>2]|0)+1;i=g;return}else{a[j]=a[48504]|0;a[j+1|0]=a[48505|0]|0;a[j+2|0]=a[48506|0]|0;a[j+3|0]=a[48507|0]|0;a[j+4|0]=a[48508|0]|0;c[e+28>>2]=2;j=e+96|0;l=(d[f]|0)>>>1&7;a2(j|0,44048,(x=i,i=i+8|0,c[x>>2]=l,x)|0)|0;ik(e,e+160|0,f,a[f+1|0]&63,8);i=g;return}}function fY(e,f){e=e|0;f=f|0;var g=0,h=0,j=0;g=i;h=(b[e+12>>1]&63)==60;j=e+32|0;a[j]=a[47848]|0;a[j+1|0]=a[47849|0]|0;a[j+2|0]=a[47850|0]|0;a[j+3|0]=a[47851|0]|0;a[j+4|0]=a[47852|0]|0;a[j+5|0]=a[47853|0]|0;a[j+6|0]=a[47854|0]|0;c[e+28>>2]=2;j=d[f+3|0]|0;a2(e+96|0,54944,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=j,x)|0)|0;j=e+8|0;c[j>>2]=(c[j>>2]|0)+1;j=e+160|0;if(h){h=j;y=5391171;a[h]=y&255;y=y>>8;a[h+1|0]=y&255;y=y>>8;a[h+2|0]=y&255;y=y>>8;a[h+3|0]=y&255;i=g;return}else{ik(e,j,f,a[f+1|0]&63,8);i=g;return}}function fZ(e,f){e=e|0;f=f|0;var g=0,h=0,j=0;g=i;h=(b[e+12>>1]&63)==60;j=e+32|0;a[j]=a[47864]|0;a[j+1|0]=a[47865|0]|0;a[j+2|0]=a[47866|0]|0;a[j+3|0]=a[47867|0]|0;a[j+4|0]=a[47868|0]|0;a[j+5|0]=a[47869|0]|0;a[j+6|0]=a[47870|0]|0;c[e+28>>2]=2;j=((d[f+2|0]|0)<<8|(d[f+3|0]|0))&65535;a2(e+96|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=j,x)|0)|0;j=e+8|0;c[j>>2]=(c[j>>2]|0)+1;j=e+160|0;if(h){a[j]=a[51552]|0;a[j+1|0]=a[51553|0]|0;a[j+2|0]=a[51554|0]|0;h=e|0;c[h>>2]=c[h>>2]|1;i=g;return}else{ik(e,j,f,a[f+1|0]&63,16);i=g;return}}function f_(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[47928]|0;a[g+1|0]=a[47929|0]|0;a[g+2|0]=a[47930|0]|0;a[g+3|0]=a[47931|0]|0;a[g+4|0]=a[47932|0]|0;a[g+5|0]=a[47933|0]|0;a[g+6|0]=a[47934|0]|0;c[b+28>>2]=2;g=(((d[e+2|0]|0)<<8|(d[e+3|0]|0))<<8|(d[e+4|0]|0))<<8|(d[e+5|0]|0);a2(b+96|0,54160,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=g,x)|0)|0;g=b+8|0;c[g>>2]=(c[g>>2]|0)+2;ik(b,b+160|0,e,a[e+1|0]&63,32);i=f;return}function f$(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;g=b+8|0;h=c[g>>2]|0;j=a[e+(h<<1)|0]|0;c[g>>2]=h+1;h=b+32|0;if((j&8)==0){a[h]=a[48008]|0;a[h+1|0]=a[48009|0]|0;a[h+2|0]=a[48010|0]|0;a[h+3|0]=a[48011|0]|0;a[h+4|0]=a[48012|0]|0;a[h+5|0]=a[48013|0]|0;a[h+6|0]=a[48014|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,16);j=b+160|0;g=d[e+2|0]|0;k=(g&128|0)!=0?34848:32296;l=g>>>4&7;a2(j|0,37712,(x=i,i=i+16|0,c[x>>2]=k,c[x+8>>2]=l,x)|0)|0;m=b|0;n=c[m>>2]|0;o=n|128;c[m>>2]=o;i=f;return}else{a[h]=a[48040]|0;a[h+1|0]=a[48041|0]|0;a[h+2|0]=a[48042|0]|0;a[h+3|0]=a[48043|0]|0;a[h+4|0]=a[48044|0]|0;a[h+5|0]=a[48045|0]|0;a[h+6|0]=a[48046|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,16);h=b+160|0;l=d[e+2|0]|0;e=(l&128|0)!=0?34848:32296;k=l>>>4&7;a2(h|0,37712,(x=i,i=i+16|0,c[x>>2]=e,c[x+8>>2]=k,x)|0)|0;m=b|0;n=c[m>>2]|0;o=n|128;c[m>>2]=o;i=f;return}}function f0(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[48056]|0;a[g+1|0]=a[48057|0]|0;a[g+2|0]=a[48058|0]|0;a[g+3|0]=a[48059|0]|0;a[g+4|0]=a[48060|0]|0;a[g+5|0]=a[48061|0]|0;a[g+6|0]=a[48062|0]|0;c[b+28>>2]=2;g=d[e+3|0]|0;a2(b+96|0,54944,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=g,x)|0)|0;g=b+8|0;c[g>>2]=(c[g>>2]|0)+1;ik(b,b+160|0,e,a[e+1|0]&63,8);i=f;return}function f1(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[48080]|0;a[g+1|0]=a[48081|0]|0;a[g+2|0]=a[48082|0]|0;a[g+3|0]=a[48083|0]|0;a[g+4|0]=a[48084|0]|0;a[g+5|0]=a[48085|0]|0;a[g+6|0]=a[48086|0]|0;c[b+28>>2]=2;g=((d[e+2|0]|0)<<8|(d[e+3|0]|0))&65535;a2(b+96|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=g,x)|0)|0;g=b+8|0;c[g>>2]=(c[g>>2]|0)+1;ik(b,b+160|0,e,a[e+1|0]&63,16);i=f;return}function f2(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[48136]|0;a[g+1|0]=a[48137|0]|0;a[g+2|0]=a[48138|0]|0;a[g+3|0]=a[48139|0]|0;a[g+4|0]=a[48140|0]|0;a[g+5|0]=a[48141|0]|0;a[g+6|0]=a[48142|0]|0;c[b+28>>2]=2;g=(((d[e+2|0]|0)<<8|(d[e+3|0]|0))<<8|(d[e+4|0]|0))<<8|(d[e+5|0]|0);a2(b+96|0,54160,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=g,x)|0)|0;g=b+8|0;c[g>>2]=(c[g>>2]|0)+2;ik(b,b+160|0,e,a[e+1|0]&63,32);i=f;return}function f3(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;g=b+8|0;h=c[g>>2]|0;j=a[e+(h<<1)|0]|0;c[g>>2]=h+1;h=b+32|0;if((j&8)==0){a[h]=a[48152]|0;a[h+1|0]=a[48153|0]|0;a[h+2|0]=a[48154|0]|0;a[h+3|0]=a[48155|0]|0;a[h+4|0]=a[48156|0]|0;a[h+5|0]=a[48157|0]|0;a[h+6|0]=a[48158|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,32);j=b+160|0;g=d[e+2|0]|0;k=(g&128|0)!=0?34848:32296;l=g>>>4&7;a2(j|0,37712,(x=i,i=i+16|0,c[x>>2]=k,c[x+8>>2]=l,x)|0)|0;m=b|0;n=c[m>>2]|0;o=n|128;c[m>>2]=o;i=f;return}else{a[h]=a[48176]|0;a[h+1|0]=a[48177|0]|0;a[h+2|0]=a[48178|0]|0;a[h+3|0]=a[48179|0]|0;a[h+4|0]=a[48180|0]|0;a[h+5|0]=a[48181|0]|0;a[h+6|0]=a[48182|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,32);h=b+160|0;l=d[e+2|0]|0;e=(l&128|0)!=0?34848:32296;k=l>>>4&7;a2(h|0,37712,(x=i,i=i+16|0,c[x>>2]=e,c[x+8>>2]=k,x)|0)|0;m=b|0;n=c[m>>2]|0;o=n|128;c[m>>2]=o;i=f;return}}function f4(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[48216]|0;a[g+1|0]=a[48217|0]|0;a[g+2|0]=a[48218|0]|0;a[g+3|0]=a[48219|0]|0;a[g+4|0]=a[48220|0]|0;a[g+5|0]=a[48221|0]|0;a[g+6|0]=a[48222|0]|0;c[b+28>>2]=2;g=d[e+3|0]|0;a2(b+96|0,54944,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=g,x)|0)|0;g=b+8|0;c[g>>2]=(c[g>>2]|0)+1;ik(b,b+160|0,e,a[e+1|0]&63,8);i=f;return}function f5(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[48240]|0;a[g+1|0]=a[48241|0]|0;a[g+2|0]=a[48242|0]|0;a[g+3|0]=a[48243|0]|0;a[g+4|0]=a[48244|0]|0;a[g+5|0]=a[48245|0]|0;a[g+6|0]=a[48246|0]|0;c[b+28>>2]=2;g=((d[e+2|0]|0)<<8|(d[e+3|0]|0))&65535;a2(b+96|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=g,x)|0)|0;g=b+8|0;c[g>>2]=(c[g>>2]|0)+1;ik(b,b+160|0,e,a[e+1|0]&63,16);i=f;return}function f6(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[48336]|0;a[g+1|0]=a[48337|0]|0;a[g+2|0]=a[48338|0]|0;a[g+3|0]=a[48339|0]|0;a[g+4|0]=a[48340|0]|0;a[g+5|0]=a[48341|0]|0;a[g+6|0]=a[48342|0]|0;c[b+28>>2]=2;g=(((d[e+2|0]|0)<<8|(d[e+3|0]|0))<<8|(d[e+4|0]|0))<<8|(d[e+5|0]|0);a2(b+96|0,54160,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=g,x)|0)|0;g=b+8|0;c[g>>2]=(c[g>>2]|0)+2;ik(b,b+160|0,e,a[e+1|0]&63,32);i=f;return}function f7(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[36208]|0;a[g+1|0]=a[36209|0]|0;a[g+2|0]=a[36210|0]|0;c[b+28>>2]=1;g=((d[e]|0)<<8|(d[e+1|0]|0))&65535;a2(b+96|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=g,x)|0)|0;i=f;return}function f8(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[48400]|0;a[g+1|0]=a[48401|0]|0;a[g+2|0]=a[48402|0]|0;a[g+3|0]=a[48403|0]|0;a[g+4|0]=a[48404|0]|0;c[b+28>>2]=2;g=d[e+3|0]|0;a2(b+96|0,54944,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=g,x)|0)|0;g=b+8|0;c[g>>2]=(c[g>>2]|0)+1;ik(b,b+160|0,e,a[e+1|0]&63,8);i=f;return}function f9(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[48448]|0;a[g+1|0]=a[48449|0]|0;a[g+2|0]=a[48450|0]|0;a[g+3|0]=a[48451|0]|0;a[g+4|0]=a[48452|0]|0;c[b+28>>2]=2;g=d[e+3|0]|0;a2(b+96|0,54944,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=g,x)|0)|0;g=b+8|0;c[g>>2]=(c[g>>2]|0)+1;ik(b,b+160|0,e,a[e+1|0]&63,8);i=f;return}function ga(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[48480]|0;a[g+1|0]=a[48481|0]|0;a[g+2|0]=a[48482|0]|0;a[g+3|0]=a[48483|0]|0;a[g+4|0]=a[48484|0]|0;c[b+28>>2]=2;g=d[e+3|0]|0;a2(b+96|0,54944,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=g,x)|0)|0;g=b+8|0;c[g>>2]=(c[g>>2]|0)+1;ik(b,b+160|0,e,a[e+1|0]&63,8);i=f;return}function gb(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[48504]|0;a[g+1|0]=a[48505|0]|0;a[g+2|0]=a[48506|0]|0;a[g+3|0]=a[48507|0]|0;a[g+4|0]=a[48508|0]|0;c[b+28>>2]=2;g=d[e+3|0]|0;a2(b+96|0,54944,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=g,x)|0)|0;g=b+8|0;c[g>>2]=(c[g>>2]|0)+1;ik(b,b+160|0,e,a[e+1|0]&63,8);i=f;return}function gc(e,f){e=e|0;f=f|0;var g=0,h=0,j=0;g=i;h=(b[e+12>>1]&63)==60;j=e+32|0;a[j]=a[48536]|0;a[j+1|0]=a[48537|0]|0;a[j+2|0]=a[48538|0]|0;a[j+3|0]=a[48539|0]|0;a[j+4|0]=a[48540|0]|0;a[j+5|0]=a[48541|0]|0;a[j+6|0]=a[48542|0]|0;c[e+28>>2]=2;j=d[f+3|0]|0;a2(e+96|0,54944,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=j,x)|0)|0;j=e+8|0;c[j>>2]=(c[j>>2]|0)+1;j=e+160|0;if(h){h=j;y=5391171;a[h]=y&255;y=y>>8;a[h+1|0]=y&255;y=y>>8;a[h+2|0]=y&255;y=y>>8;a[h+3|0]=y&255;i=g;return}else{ik(e,j,f,a[f+1|0]&63,8);i=g;return}}function gd(e,f){e=e|0;f=f|0;var g=0,h=0,j=0;g=i;h=(b[e+12>>1]&63)==60;j=e+32|0;a[j]=a[48560]|0;a[j+1|0]=a[48561|0]|0;a[j+2|0]=a[48562|0]|0;a[j+3|0]=a[48563|0]|0;a[j+4|0]=a[48564|0]|0;a[j+5|0]=a[48565|0]|0;a[j+6|0]=a[48566|0]|0;c[e+28>>2]=2;j=((d[f+2|0]|0)<<8|(d[f+3|0]|0))&65535;a2(e+96|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=j,x)|0)|0;j=e+8|0;c[j>>2]=(c[j>>2]|0)+1;j=e+160|0;if(h){a[j]=a[51552]|0;a[j+1|0]=a[51553|0]|0;a[j+2|0]=a[51554|0]|0;h=e|0;c[h>>2]=c[h>>2]|1;i=g;return}else{ik(e,j,f,a[f+1|0]&63,16);i=g;return}}function ge(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[48600]|0;a[g+1|0]=a[48601|0]|0;a[g+2|0]=a[48602|0]|0;a[g+3|0]=a[48603|0]|0;a[g+4|0]=a[48604|0]|0;a[g+5|0]=a[48605|0]|0;a[g+6|0]=a[48606|0]|0;c[b+28>>2]=2;g=(((d[e+2|0]|0)<<8|(d[e+3|0]|0))<<8|(d[e+4|0]|0))<<8|(d[e+5|0]|0);a2(b+96|0,54160,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=g,x)|0)|0;g=b+8|0;c[g>>2]=(c[g>>2]|0)+2;ik(b,b+160|0,e,a[e+1|0]&63,32);i=f;return}function gf(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[48632]|0;a[g+1|0]=a[48633|0]|0;a[g+2|0]=a[48634|0]|0;a[g+3|0]=a[48635|0]|0;a[g+4|0]=a[48636|0]|0;a[g+5|0]=a[48637|0]|0;a[g+6|0]=a[48638|0]|0;c[b+28>>2]=2;g=d[e+3|0]|0;a2(b+96|0,54944,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=g,x)|0)|0;g=b+8|0;c[g>>2]=(c[g>>2]|0)+1;ik(b,b+160|0,e,a[e+1|0]&63,8);i=f;return}function gg(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[48664]|0;a[g+1|0]=a[48665|0]|0;a[g+2|0]=a[48666|0]|0;a[g+3|0]=a[48667|0]|0;a[g+4|0]=a[48668|0]|0;a[g+5|0]=a[48669|0]|0;a[g+6|0]=a[48670|0]|0;c[b+28>>2]=2;g=((d[e+2|0]|0)<<8|(d[e+3|0]|0))&65535;a2(b+96|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=g,x)|0)|0;g=b+8|0;c[g>>2]=(c[g>>2]|0)+1;ik(b,b+160|0,e,a[e+1|0]&63,16);i=f;return}function gh(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[48728]|0;a[g+1|0]=a[48729|0]|0;a[g+2|0]=a[48730|0]|0;a[g+3|0]=a[48731|0]|0;a[g+4|0]=a[48732|0]|0;a[g+5|0]=a[48733|0]|0;a[g+6|0]=a[48734|0]|0;c[b+28>>2]=2;g=(((d[e+2|0]|0)<<8|(d[e+3|0]|0))<<8|(d[e+4|0]|0))<<8|(d[e+5|0]|0);a2(b+96|0,54160,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=g,x)|0)|0;g=b+8|0;c[g>>2]=(c[g>>2]|0)+2;ik(b,b+160|0,e,a[e+1|0]&63,32);i=f;return}function gi(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;g=b+8|0;h=c[g>>2]|0;j=a[e+(h<<1)|0]|0;c[g>>2]=h+1;h=b+32|0;a[h]=a[48800]|0;a[h+1|0]=a[48801|0]|0;a[h+2|0]=a[48802|0]|0;a[h+3|0]=a[48803|0]|0;a[h+4|0]=a[48804|0]|0;a[h+5|0]=a[48805|0]|0;a[h+6|0]=a[48806|0]|0;c[b+28>>2]=2;h=b+96|0;if((j&8)==0){ik(b,h,e,a[e+1|0]&63,8);j=b+160|0;g=d[e+2|0]|0;k=(g&128|0)!=0?34848:32296;l=g>>>4&7;a2(j|0,37712,(x=i,i=i+16|0,c[x>>2]=k,c[x+8>>2]=l,x)|0)|0;m=b|0;n=c[m>>2]|0;o=n|64;c[m>>2]=o;i=f;return}else{l=d[e+2|0]|0;k=(l&128|0)!=0?34848:32296;j=l>>>4&7;a2(h|0,37712,(x=i,i=i+16|0,c[x>>2]=k,c[x+8>>2]=j,x)|0)|0;ik(b,b+160|0,e,a[e+1|0]&63,8);m=b|0;n=c[m>>2]|0;o=n|64;c[m>>2]=o;i=f;return}}function gj(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;g=b+8|0;h=c[g>>2]|0;j=a[e+(h<<1)|0]|0;c[g>>2]=h+1;h=b+32|0;a[h]=a[48832]|0;a[h+1|0]=a[48833|0]|0;a[h+2|0]=a[48834|0]|0;a[h+3|0]=a[48835|0]|0;a[h+4|0]=a[48836|0]|0;a[h+5|0]=a[48837|0]|0;a[h+6|0]=a[48838|0]|0;c[b+28>>2]=2;h=b+96|0;if((j&8)==0){ik(b,h,e,a[e+1|0]&63,16);j=b+160|0;g=d[e+2|0]|0;k=(g&128|0)!=0?34848:32296;l=g>>>4&7;a2(j|0,37712,(x=i,i=i+16|0,c[x>>2]=k,c[x+8>>2]=l,x)|0)|0;m=b|0;n=c[m>>2]|0;o=n|64;c[m>>2]=o;i=f;return}else{l=d[e+2|0]|0;k=(l&128|0)!=0?34848:32296;j=l>>>4&7;a2(h|0,37712,(x=i,i=i+16|0,c[x>>2]=k,c[x+8>>2]=j,x)|0)|0;ik(b,b+160|0,e,a[e+1|0]&63,16);m=b|0;n=c[m>>2]|0;o=n|64;c[m>>2]=o;i=f;return}}function gk(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;g=b+8|0;h=c[g>>2]|0;j=a[e+(h<<1)|0]|0;c[g>>2]=h+1;h=b+32|0;a[h]=a[48864]|0;a[h+1|0]=a[48865|0]|0;a[h+2|0]=a[48866|0]|0;a[h+3|0]=a[48867|0]|0;a[h+4|0]=a[48868|0]|0;a[h+5|0]=a[48869|0]|0;a[h+6|0]=a[48870|0]|0;c[b+28>>2]=2;h=b+96|0;if((j&8)==0){ik(b,h,e,a[e+1|0]&63,32);j=b+160|0;g=d[e+2|0]|0;k=(g&128|0)!=0?34848:32296;l=g>>>4&7;a2(j|0,37712,(x=i,i=i+16|0,c[x>>2]=k,c[x+8>>2]=l,x)|0)|0;m=b|0;n=c[m>>2]|0;o=n|64;c[m>>2]=o;i=f;return}else{l=d[e+2|0]|0;k=(l&128|0)!=0?34848:32296;j=l>>>4&7;a2(h|0,37712,(x=i,i=i+16|0,c[x>>2]=k,c[x+8>>2]=j,x)|0)|0;ik(b,b+160|0,e,a[e+1|0]&63,32);m=b|0;n=c[m>>2]|0;o=n|64;c[m>>2]=o;i=f;return}}function gl(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;y=5262666;a[e]=y&255;y=y>>8;a[e+1|0]=y&255;y=y>>8;a[e+2|0]=y&255;y=y>>8;a[e+3|0]=y&255;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,0);d=b|0;c[d>>2]=c[d>>2]|2;return}function gm(b,e){b=b|0;e=e|0;var f=0,g=0;f=b+32|0;a[f]=a[48936]|0;a[f+1|0]=a[48937|0]|0;a[f+2|0]=a[48938|0]|0;a[f+3|0]=a[48939|0]|0;a[f+4|0]=a[48940|0]|0;a[f+5|0]=a[48941|0]|0;a[f+6|0]=a[48942|0]|0;c[b+28>>2]=2;f=e+1|0;ik(b,b+96|0,e,a[f]&63,8);g=((d[e]|0)<<8|(d[f]|0))&65535;ik(b,b+160|0,e,g>>>3&56|g>>>9&7,8);return}function gn(b,e){b=b|0;e=e|0;var f=0,g=0;f=b+32|0;a[f]=a[48960]|0;a[f+1|0]=a[48961|0]|0;a[f+2|0]=a[48962|0]|0;a[f+3|0]=a[48963|0]|0;a[f+4|0]=a[48964|0]|0;a[f+5|0]=a[48965|0]|0;a[f+6|0]=a[48966|0]|0;c[b+28>>2]=2;f=e+1|0;ik(b,b+96|0,e,a[f]&63,32);g=((d[e]|0)<<8|(d[f]|0))&65535;ik(b,b+160|0,e,g>>>3&56|g>>>9&7,32);return}function go(b,e){b=b|0;e=e|0;var f=0,g=0,h=0;f=i;g=b+32|0;h=g|0;y=1163284301;a[h]=y&255;y=y>>8;a[h+1|0]=y&255;y=y>>8;a[h+2|0]=y&255;y=y>>8;a[h+3|0]=y&255;h=g+4|0;y=4992577;a[h]=y&255;y=y>>8;a[h+1|0]=y&255;y=y>>8;a[h+2|0]=y&255;y=y>>8;a[h+3|0]=y&255;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,32);a2(b+160|0,40688,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function gp(b,e){b=b|0;e=e|0;var f=0,g=0;f=b+32|0;a[f]=a[49792]|0;a[f+1|0]=a[49793|0]|0;a[f+2|0]=a[49794|0]|0;a[f+3|0]=a[49795|0]|0;a[f+4|0]=a[49796|0]|0;a[f+5|0]=a[49797|0]|0;a[f+6|0]=a[49798|0]|0;c[b+28>>2]=2;f=e+1|0;ik(b,b+96|0,e,a[f]&63,16);g=((d[e]|0)<<8|(d[f]|0))&65535;ik(b,b+160|0,e,g>>>3&56|g>>>9&7,16);return}function gq(b,e){b=b|0;e=e|0;var f=0,g=0,h=0;f=i;g=b+32|0;h=g|0;y=1163284301;a[h]=y&255;y=y>>8;a[h+1|0]=y&255;y=y>>8;a[h+2|0]=y&255;y=y>>8;a[h+3|0]=y&255;h=g+4|0;y=5713473;a[h]=y&255;y=y>>8;a[h+1|0]=y&255;y=y>>8;a[h+2|0]=y&255;y=y>>8;a[h+3|0]=y&255;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,16);a2(b+160|0,40688,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function gr(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[49024]|0;a[e+1|0]=a[49025|0]|0;a[e+2|0]=a[49026|0]|0;a[e+3|0]=a[49027|0]|0;a[e+4|0]=a[49028|0]|0;a[e+5|0]=a[49029|0]|0;a[e+6|0]=a[49030|0]|0;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,8);d=b|0;c[d>>2]=c[d>>2]|32;return}function gs(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[49136]|0;a[e+1|0]=a[49137|0]|0;a[e+2|0]=a[49138|0]|0;a[e+3|0]=a[49139|0]|0;a[e+4|0]=a[49140|0]|0;a[e+5|0]=a[49141|0]|0;a[e+6|0]=a[49142|0]|0;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,16);d=b|0;c[d>>2]=c[d>>2]|32;return}function gt(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[49216]|0;a[e+1|0]=a[49217|0]|0;a[e+2|0]=a[49218|0]|0;a[e+3|0]=a[49219|0]|0;a[e+4|0]=a[49220|0]|0;a[e+5|0]=a[49221|0]|0;a[e+6|0]=a[49222|0]|0;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,32);d=b|0;c[d>>2]=c[d>>2]|32;return}function gu(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[49792]|0;a[e+1|0]=a[49793|0]|0;a[e+2|0]=a[49794|0]|0;a[e+3|0]=a[49795|0]|0;a[e+4|0]=a[49796|0]|0;a[e+5|0]=a[49797|0]|0;a[e+6|0]=a[49798|0]|0;c[b+28>>2]=2;e=b+96|0;a[e]=a[51552]|0;a[e+1|0]=a[51553|0]|0;a[e+2|0]=a[51554|0]|0;ik(b,b+160|0,d,a[d+1|0]&63,16);return}function gv(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;y=4933699;a[g]=y&255;y=y>>8;a[g+1|0]=y&255;y=y>>8;a[g+2|0]=y&255;y=y>>8;a[g+3|0]=y&255;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,16);a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function gw(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;y=4277580;a[g]=y&255;y=y>>8;a[g+1|0]=y&255;y=y>>8;a[g+2|0]=y&255;y=y>>8;a[g+3|0]=y&255;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,32);a2(b+160|0,40688,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function gx(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[49288]|0;a[e+1|0]=a[49289|0]|0;a[e+2|0]=a[49290|0]|0;a[e+3|0]=a[49291|0]|0;a[e+4|0]=a[49292|0]|0;a[e+5|0]=a[49293|0]|0;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,8);return}function gy(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[49312]|0;a[e+1|0]=a[49313|0]|0;a[e+2|0]=a[49314|0]|0;a[e+3|0]=a[49315|0]|0;a[e+4|0]=a[49316|0]|0;a[e+5|0]=a[49317|0]|0;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,16);return}function gz(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[49328]|0;a[e+1|0]=a[49329|0]|0;a[e+2|0]=a[49330|0]|0;a[e+3|0]=a[49331|0]|0;a[e+4|0]=a[49332|0]|0;a[e+5|0]=a[49333|0]|0;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,32);return}function gA(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[49792]|0;a[e+1|0]=a[49793|0]|0;a[e+2|0]=a[49794|0]|0;a[e+3|0]=a[49795|0]|0;a[e+4|0]=a[49796|0]|0;a[e+5|0]=a[49797|0]|0;a[e+6|0]=a[49798|0]|0;c[b+28>>2]=2;e=b+96|0;y=5391171;a[e]=y&255;y=y>>8;a[e+1|0]=y&255;y=y>>8;a[e+2|0]=y&255;y=y>>8;a[e+3|0]=y&255;ik(b,b+160|0,d,a[d+1|0]&63,16);d=b|0;c[d>>2]=c[d>>2]|64;return}function gB(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[49384]|0;a[e+1|0]=a[49385|0]|0;a[e+2|0]=a[49386|0]|0;a[e+3|0]=a[49387|0]|0;a[e+4|0]=a[49388|0]|0;a[e+5|0]=a[49389|0]|0;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,8);return}function gC(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[49432]|0;a[e+1|0]=a[49433|0]|0;a[e+2|0]=a[49434|0]|0;a[e+3|0]=a[49435|0]|0;a[e+4|0]=a[49436|0]|0;a[e+5|0]=a[49437|0]|0;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,16);return}function gD(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[49456]|0;a[e+1|0]=a[49457|0]|0;a[e+2|0]=a[49458|0]|0;a[e+3|0]=a[49459|0]|0;a[e+4|0]=a[49460|0]|0;a[e+5|0]=a[49461|0]|0;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,32);return}function gE(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[49792]|0;a[e+1|0]=a[49793|0]|0;a[e+2|0]=a[49794|0]|0;a[e+3|0]=a[49795|0]|0;a[e+4|0]=a[49796|0]|0;a[e+5|0]=a[49797|0]|0;a[e+6|0]=a[49798|0]|0;c[b+28>>2]=2;ik(b,b+96|0,d,a[d+1|0]&63,16);d=b+160|0;y=5391171;a[d]=y&255;y=y>>8;a[d+1|0]=y&255;y=y>>8;a[d+2|0]=y&255;y=y>>8;a[d+3|0]=y&255;return}function gF(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[49600]|0;a[e+1|0]=a[49601|0]|0;a[e+2|0]=a[49602|0]|0;a[e+3|0]=a[49603|0]|0;a[e+4|0]=a[49604|0]|0;a[e+5|0]=a[49605|0]|0;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,8);return}function gG(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[49672]|0;a[e+1|0]=a[49673|0]|0;a[e+2|0]=a[49674|0]|0;a[e+3|0]=a[49675|0]|0;a[e+4|0]=a[49676|0]|0;a[e+5|0]=a[49677|0]|0;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,16);return}function gH(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[49728]|0;a[e+1|0]=a[49729|0]|0;a[e+2|0]=a[49730|0]|0;a[e+3|0]=a[49731|0]|0;a[e+4|0]=a[49732|0]|0;a[e+5|0]=a[49733|0]|0;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,32);return}function gI(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[49792]|0;a[e+1|0]=a[49793|0]|0;a[e+2|0]=a[49794|0]|0;a[e+3|0]=a[49795|0]|0;a[e+4|0]=a[49796|0]|0;a[e+5|0]=a[49797|0]|0;a[e+6|0]=a[49798|0]|0;c[b+28>>2]=2;ik(b,b+96|0,d,a[d+1|0]&63,16);d=b+160|0;a[d]=a[51552]|0;a[d+1|0]=a[51553|0]|0;a[d+2|0]=a[51554|0]|0;d=b|0;c[d>>2]=c[d>>2]|1;return}function gJ(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[49920]|0;a[e+1|0]=a[49921|0]|0;a[e+2|0]=a[49922|0]|0;a[e+3|0]=a[49923|0]|0;a[e+4|0]=a[49924|0]|0;a[e+5|0]=a[49925|0]|0;a[e+6|0]=a[49926|0]|0;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,8);d=b|0;c[d>>2]=c[d>>2]|32;return}function gK(d,e){d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;g=b[d+12>>1]|0;h=d+32|0;if((g&56)==0){a[h]=a[50168]|0;a[h+1|0]=a[50169|0]|0;a[h+2|0]=a[50170|0]|0;a[h+3|0]=a[50171|0]|0;a[h+4|0]=a[50172|0]|0;c[d+28>>2]=1;j=d+96|0;k=g&7;a2(j|0,44048,(x=i,i=i+8|0,c[x>>2]=k,x)|0)|0;i=f;return}else{k=h;y=4277584;a[k]=y&255;y=y>>8;a[k+1|0]=y&255;y=y>>8;a[k+2|0]=y&255;y=y>>8;a[k+3|0]=y&255;c[d+28>>2]=1;ik(d,d+96|0,e,a[e+1|0]&63,32);i=f;return}}function gL(b,d){b=b|0;d=d|0;var f=0,g=0,h=0,j=0,k=0;f=i;g=e[b+12>>1]|0;h=g>>>3&7;if((h|0)==4){j=b+32|0;k=j|0;y=1163284301;a[k]=y&255;y=y>>8;a[k+1|0]=y&255;y=y>>8;a[k+2|0]=y&255;y=y>>8;a[k+3|0]=y&255;k=j+4|0;y=5713485;a[k]=y&255;y=y>>8;a[k+1|0]=y&255;y=y>>8;a[k+2|0]=y&255;y=y>>8;a[k+3|0]=y&255;c[b+28>>2]=2;h4(b,b+96|0,d,25,16);ik(b,b+160|0,d,a[d+1|0]&63,16);i=f;return}else if((h|0)==0){h=b+32|0;a[h]=a[50304]|0;a[h+1|0]=a[50305|0]|0;a[h+2|0]=a[50306|0]|0;a[h+3|0]=a[50307|0]|0;a[h+4|0]=a[50308|0]|0;a[h+5|0]=a[50309|0]|0;c[b+28>>2]=1;a2(b+96|0,44048,(x=i,i=i+8|0,c[x>>2]=g&7,x)|0)|0;i=f;return}else{g=b+32|0;h=g|0;y=1163284301;a[h]=y&255;y=y>>8;a[h+1|0]=y&255;y=y>>8;a[h+2|0]=y&255;y=y>>8;a[h+3|0]=y&255;h=g+4|0;y=5713485;a[h]=y&255;y=y>>8;a[h+1|0]=y&255;y=y>>8;a[h+2|0]=y&255;y=y>>8;a[h+3|0]=y&255;c[b+28>>2]=2;h4(b,b+96|0,d,24,16);ik(b,b+160|0,d,a[d+1|0]&63,16);i=f;return}}function gM(b,d){b=b|0;d=d|0;var f=0,g=0,h=0,j=0,k=0;f=i;g=e[b+12>>1]|0;h=g>>>3&7;if((h|0)==4){j=b+32|0;k=j|0;y=1163284301;a[k]=y&255;y=y>>8;a[k+1|0]=y&255;y=y>>8;a[k+2|0]=y&255;y=y>>8;a[k+3|0]=y&255;k=j+4|0;y=4992589;a[k]=y&255;y=y>>8;a[k+1|0]=y&255;y=y>>8;a[k+2|0]=y&255;y=y>>8;a[k+3|0]=y&255;c[b+28>>2]=2;h4(b,b+96|0,d,25,32);ik(b,b+160|0,d,a[d+1|0]&63,32);i=f;return}else if((h|0)==0){h=b+32|0;a[h]=a[50376]|0;a[h+1|0]=a[50377|0]|0;a[h+2|0]=a[50378|0]|0;a[h+3|0]=a[50379|0]|0;a[h+4|0]=a[50380|0]|0;a[h+5|0]=a[50381|0]|0;c[b+28>>2]=1;a2(b+96|0,44048,(x=i,i=i+8|0,c[x>>2]=g&7,x)|0)|0;i=f;return}else{g=b+32|0;h=g|0;y=1163284301;a[h]=y&255;y=y>>8;a[h+1|0]=y&255;y=y>>8;a[h+2|0]=y&255;y=y>>8;a[h+3|0]=y&255;h=g+4|0;y=4992589;a[h]=y&255;y=y>>8;a[h+1|0]=y&255;y=y>>8;a[h+2|0]=y&255;y=y>>8;a[h+3|0]=y&255;c[b+28>>2]=2;h4(b,b+96|0,d,24,32);ik(b,b+160|0,d,a[d+1|0]&63,32);i=f;return}}function gN(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;h=b[e+12>>1]|0;j=e+32|0;if((h&56)==0){a[j]=a[50424]|0;a[j+1|0]=a[50425|0]|0;a[j+2|0]=a[50426|0]|0;a[j+3|0]=a[50427|0]|0;a[j+4|0]=a[50428|0]|0;a[j+5|0]=a[50429|0]|0;a[j+6|0]=a[50430|0]|0;c[e+28>>2]=1;k=e+96|0;l=h&7;a2(k|0,44048,(x=i,i=i+8|0,c[x>>2]=l,x)|0)|0;l=e|0;c[l>>2]=c[l>>2]|128;i=g;return}else{l=j;y=4277580;a[l]=y&255;y=y>>8;a[l+1|0]=y&255;y=y>>8;a[l+2|0]=y&255;y=y>>8;a[l+3|0]=y&255;c[e+28>>2]=2;ik(e,e+96|0,f,a[f+1|0]&63,32);l=e+160|0;e=(d[f]|0)>>>1&7;a2(l|0,40688,(x=i,i=i+8|0,c[x>>2]=e,x)|0)|0;i=g;return}}function gO(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[50552]|0;a[e+1|0]=a[50553|0]|0;a[e+2|0]=a[50554|0]|0;a[e+3|0]=a[50555|0]|0;a[e+4|0]=a[50556|0]|0;a[e+5|0]=a[50557|0]|0;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,8);return}function gP(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[50608]|0;a[e+1|0]=a[50609|0]|0;a[e+2|0]=a[50610|0]|0;a[e+3|0]=a[50611|0]|0;a[e+4|0]=a[50612|0]|0;a[e+5|0]=a[50613|0]|0;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,16);return}function gQ(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[50640]|0;a[e+1|0]=a[50641|0]|0;a[e+2|0]=a[50642|0]|0;a[e+3|0]=a[50643|0]|0;a[e+4|0]=a[50644|0]|0;a[e+5|0]=a[50645|0]|0;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,32);return}function gR(d,e){d=d|0;e=e|0;var f=0,g=0,h=0;f=d+32|0;if((b[d+12>>1]|0)==19196){g=f;h=g|0;y=1162628169;a[h]=y&255;y=y>>8;a[h+1|0]=y&255;y=y>>8;a[h+2|0]=y&255;y=y>>8;a[h+3|0]=y&255;h=g+4|0;y=4997447;a[h]=y&255;y=y>>8;a[h+1|0]=y&255;y=y>>8;a[h+2|0]=y&255;y=y>>8;a[h+3|0]=y&255;c[d+28>>2]=0;h=d|0;c[h>>2]=c[h>>2]|4;return}else{h=f;y=5456212;a[h]=y&255;y=y>>8;a[h+1|0]=y&255;y=y>>8;a[h+2|0]=y&255;y=y>>8;a[h+3|0]=y&255;c[d+28>>2]=1;ik(d,d+96|0,e,a[e+1|0]&63,8);return}}function gS(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;h=i;j=f+8|0;k=c[j>>2]|0;l=k<<1;m=(d[g+l|0]|0)<<8;n=m|(d[g+(l|1)|0]|0);c[j>>2]=k+1;k=f+14|0;b[k>>1]=n;n=f+32|0;a[n]=a[50688]|0;a[n+1|0]=a[50689|0]|0;a[n+2|0]=a[50690|0]|0;a[n+3|0]=a[50691|0]|0;a[n+4|0]=a[50692|0]|0;a[n+5|0]=a[50693|0]|0;a[n+6|0]=a[50694|0]|0;c[f+28>>2]=2;ik(f,f+96|0,g,a[g+1|0]&63,32);g=f+160|0;n=e[k>>1]|0;if((m&1024)==0){m=n>>>12&7;a2(g|0,44048,(x=i,i=i+8|0,c[x>>2]=m,x)|0)|0;o=f|0;p=c[o>>2]|0;q=p|128;c[o>>2]=q;i=h;return}else{m=n&7;k=n>>>12&7;a2(g|0,50672,(x=i,i=i+16|0,c[x>>2]=m,c[x+8>>2]=k,x)|0)|0;o=f|0;p=c[o>>2]|0;q=p|128;c[o>>2]=q;i=h;return}}function gT(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;h=i;j=f+8|0;k=c[j>>2]|0;l=k<<1;m=(d[g+l|0]|0)<<8;n=m|(d[g+(l|1)|0]|0);c[j>>2]=k+1;k=f+14|0;b[k>>1]=n;n=f+32|0;if((m&1024)==0){a[n]=a[50704]|0;a[n+1|0]=a[50705|0]|0;a[n+2|0]=a[50706|0]|0;a[n+3|0]=a[50707|0]|0;a[n+4|0]=a[50708|0]|0;a[n+5|0]=a[50709|0]|0;a[n+6|0]=a[50710|0]|0;c[f+28>>2]=2;ik(f,f+96|0,g,a[g+1|0]&63,32);m=f+160|0;j=e[k>>1]|0;l=j&7;o=j>>>12&7;a2(m|0,50672,(x=i,i=i+16|0,c[x>>2]=l,c[x+8>>2]=o,x)|0)|0;p=f|0;q=c[p>>2]|0;r=q|128;c[p>>2]=r;i=h;return}else{o=n;n=o|0;y=1431718212;a[n]=y&255;y=y>>8;a[n+1|0]=y&255;y=y>>8;a[n+2|0]=y&255;y=y>>8;a[n+3|0]=y&255;n=o+4|0;y=4992588;a[n]=y&255;y=y>>8;a[n+1|0]=y&255;y=y>>8;a[n+2|0]=y&255;y=y>>8;a[n+3|0]=y&255;c[f+28>>2]=2;ik(f,f+96|0,g,a[g+1|0]&63,32);g=f+160|0;n=e[k>>1]|0;k=n&7;o=n>>>12&7;a2(g|0,50672,(x=i,i=i+16|0,c[x>>2]=k,c[x+8>>2]=o,x)|0)|0;p=f|0;q=c[p>>2]|0;r=q|128;c[p>>2]=r;i=h;return}}function gU(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0;g=i;h=e+32|0;if((b[e+12>>1]&56)==0){a[h]=a[36208]|0;a[h+1|0]=a[36209|0]|0;a[h+2|0]=a[36210|0]|0;c[e+28>>2]=1;j=e+96|0;k=((d[f]|0)<<8|(d[f+1|0]|0))&65535;a2(j|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=k,x)|0)|0;i=g;return}else{k=h;h=k|0;y=1163284301;a[h]=y&255;y=y>>8;a[h+1|0]=y&255;y=y>>8;a[h+2|0]=y&255;y=y>>8;a[h+3|0]=y&255;h=k+4|0;y=5713485;a[h]=y&255;y=y>>8;a[h+1|0]=y&255;y=y>>8;a[h+2|0]=y&255;y=y>>8;a[h+3|0]=y&255;c[e+28>>2]=2;h4(e,e+160|0,f,24,16);ik(e,e+96|0,f,a[f+1|0]&63,16);i=g;return}}function gV(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0;g=i;h=e+32|0;if((b[e+12>>1]&56)==0){a[h]=a[36208]|0;a[h+1|0]=a[36209|0]|0;a[h+2|0]=a[36210|0]|0;c[e+28>>2]=1;j=e+96|0;k=((d[f]|0)<<8|(d[f+1|0]|0))&65535;a2(j|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=k,x)|0)|0;i=g;return}else{k=h;h=k|0;y=1163284301;a[h]=y&255;y=y>>8;a[h+1|0]=y&255;y=y>>8;a[h+2|0]=y&255;y=y>>8;a[h+3|0]=y&255;h=k+4|0;y=4992589;a[h]=y&255;y=y>>8;a[h+1|0]=y&255;y=y>>8;a[h+2|0]=y&255;y=y>>8;a[h+3|0]=y&255;c[e+28>>2]=2;h4(e,e+160|0,f,24,32);ik(e,e+96|0,f,a[f+1|0]&63,32);i=g;return}}function gW(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=i;h=b[e+12>>1]|0;j=h&65535;if((h<<16>>16|0)==20081){k=e+32|0;y=5263182;a[k]=y&255;y=y>>8;a[k+1|0]=y&255;y=y>>8;a[k+2|0]=y&255;y=y>>8;a[k+3|0]=y&255;c[e+28>>2]=0;i=g;return}else if((h<<16>>16|0)==20080){k=e+32|0;a[k]=a[51472]|0;a[k+1|0]=a[51473|0]|0;a[k+2|0]=a[51474|0]|0;a[k+3|0]=a[51475|0]|0;a[k+4|0]=a[51476|0]|0;a[k+5|0]=a[51477|0]|0;c[e+28>>2]=0;k=e|0;c[k>>2]=c[k>>2]|1;i=g;return}else if((h<<16>>16|0)==20082){k=e+32|0;a[k]=a[51368]|0;a[k+1|0]=a[51369|0]|0;a[k+2|0]=a[51370|0]|0;a[k+3|0]=a[51371|0]|0;a[k+4|0]=a[51372|0]|0;c[e+28>>2]=1;k=((d[f+2|0]|0)<<8|(d[f+3|0]|0))&65535;a2(e+96|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=k,x)|0)|0;k=e+8|0;c[k>>2]=(c[k>>2]|0)+1;k=e|0;c[k>>2]=c[k>>2]|1;i=g;return}else if((h<<16>>16|0)==20085){k=e+32|0;y=5461074;a[k]=y&255;y=y>>8;a[k+1|0]=y&255;y=y>>8;a[k+2|0]=y&255;y=y>>8;a[k+3|0]=y&255;c[e+28>>2]=0;k=e|0;c[k>>2]=c[k>>2]|16;i=g;return}else if((h<<16>>16|0)==20083){k=e+32|0;y=4543570;a[k]=y&255;y=y>>8;a[k+1|0]=y&255;y=y>>8;a[k+2|0]=y&255;y=y>>8;a[k+3|0]=y&255;c[e+28>>2]=0;k=e|0;c[k>>2]=c[k>>2]|9;i=g;return}else if((h<<16>>16|0)==20091){k=e+8|0;c[k>>2]=(c[k>>2]|0)+1;k=e+32|0;a[k]=a[51064]|0;a[k+1|0]=a[51065|0]|0;a[k+2|0]=a[51066|0]|0;a[k+3|0]=a[51067|0]|0;a[k+4|0]=a[51068|0]|0;a[k+5|0]=a[51069|0]|0;c[e+28>>2]=2;k=f+2|0;l=d[k]|0;a2(e+96|0,37712,(x=i,i=i+16|0,c[x>>2]=(l&128|0)!=0?34848:32296,c[x+8>>2]=l>>>4&7,x)|0)|0;l=e+160|0;m=((d[k]|0)<<8|(d[f+3|0]|0))&4095;if((m|0)==2048){k=e|0;n=c[k>>2]|64;c[k>>2]=n;o=51072;p=n;q=2816}else if((m|0)==2049){n=e|0;k=c[n>>2]|64;c[n>>2]=k;o=48088;p=k;q=2816}else if((m|0)==1){k=e|0;n=c[k>>2]|64;c[k>>2]=n;o=48512;p=n;q=2816}else if((m|0)==0){n=e|0;k=c[n>>2]|64;c[n>>2]=k;o=48912;p=k;q=2816}else{a2(l|0,47784,(x=i,i=i+8|0,c[x>>2]=m,x)|0)|0;m=e|0;k=c[m>>2]|64;c[m>>2]=k;r=k;s=m}if((q|0)==2816){m=o;o=l;y=d[m]|d[m+1|0]<<8|d[m+2|0]<<16|d[m+3|0]<<24|0;a[o]=y&255;y=y>>8;a[o+1|0]=y&255;y=y>>8;a[o+2|0]=y&255;y=y>>8;a[o+3|0]=y&255;r=p;s=e|0}c[s>>2]=r|64;i=g;return}else if((h<<16>>16|0)==20084){r=e+32|0;y=4478034;a[r]=y&255;y=y>>8;a[r+1|0]=y&255;y=y>>8;a[r+2|0]=y&255;y=y>>8;a[r+3|0]=y&255;c[e+28>>2]=1;r=((d[f+2|0]|0)<<8|(d[f+3|0]|0))&65535;a2(e+96|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=r,x)|0)|0;r=e+8|0;c[r>>2]=(c[r>>2]|0)+1;r=e|0;c[r>>2]=c[r>>2]|80;i=g;return}else if((h<<16>>16|0)==20090){r=e+8|0;c[r>>2]=(c[r>>2]|0)+1;r=e+32|0;a[r]=a[51064]|0;a[r+1|0]=a[51065|0]|0;a[r+2|0]=a[51066|0]|0;a[r+3|0]=a[51067|0]|0;a[r+4|0]=a[51068|0]|0;a[r+5|0]=a[51069|0]|0;c[e+28>>2]=2;r=e+96|0;s=f+2|0;p=((d[s]|0)<<8|(d[f+3|0]|0))&4095;if((p|0)==1){o=e|0;c[o>>2]=c[o>>2]|64;t=48512;q=2808}else if((p|0)==2048){o=e|0;c[o>>2]=c[o>>2]|64;t=51072;q=2808}else if((p|0)==2049){o=e|0;c[o>>2]=c[o>>2]|64;t=48088;q=2808}else if((p|0)==0){o=e|0;c[o>>2]=c[o>>2]|64;t=48912;q=2808}else{a2(r|0,47784,(x=i,i=i+8|0,c[x>>2]=p,x)|0)|0;p=e|0;c[p>>2]=c[p>>2]|64;u=p}if((q|0)==2808){q=t;t=r;y=d[q]|d[q+1|0]<<8|d[q+2|0]<<16|d[q+3|0]<<24|0;a[t]=y&255;y=y>>8;a[t+1|0]=y&255;y=y>>8;a[t+2|0]=y&255;y=y>>8;a[t+3|0]=y&255;u=e|0}t=d[s]|0;a2(e+160|0,37712,(x=i,i=i+16|0,c[x>>2]=(t&128|0)!=0?34848:32296,c[x+8>>2]=t>>>4&7,x)|0)|0;c[u>>2]=c[u>>2]|64;i=g;return}else if((h<<16>>16|0)==20086){u=e+32|0;a[u]=a[51112]|0;a[u+1|0]=a[51113|0]|0;a[u+2|0]=a[51114|0]|0;a[u+3|0]=a[51115|0]|0;a[u+4|0]=a[51116|0]|0;a[u+5|0]=a[51117|0]|0;c[e+28>>2]=0;u=e|0;c[u>>2]=c[u>>2]|32;i=g;return}else if((h<<16>>16|0)==20087){h=e+32|0;y=5395538;a[h]=y&255;y=y>>8;a[h+1|0]=y&255;y=y>>8;a[h+2|0]=y&255;y=y>>8;a[h+3|0]=y&255;c[e+28>>2]=0;i=g;return}else{if((j&48|0)==0){h=e+32|0;a[h]=a[51032]|0;a[h+1|0]=a[51033|0]|0;a[h+2|0]=a[51034|0]|0;a[h+3|0]=a[51035|0]|0;a[h+4|0]=a[51036|0]|0;c[e+28>>2]=1;h=e+96|0;u=j&15;a2(h|0,54944,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=u,x)|0)|0;i=g;return}u=j&56;if((u|0)==24){h=e+32|0;a[h]=a[50936]|0;a[h+1|0]=a[50937|0]|0;a[h+2|0]=a[50938|0]|0;a[h+3|0]=a[50939|0]|0;a[h+4|0]=a[50940|0]|0;c[e+28>>2]=1;h=e+96|0;t=j&7;a2(h|0,40688,(x=i,i=i+8|0,c[x>>2]=t,x)|0)|0;i=g;return}else if((u|0)==32){t=e+32|0;a[t]=a[50880]|0;a[t+1|0]=a[50881|0]|0;a[t+2|0]=a[50882|0]|0;a[t+3|0]=a[50883|0]|0;a[t+4|0]=a[50884|0]|0;c[e+28>>2]=2;a2(e+96|0,40688,(x=i,i=i+8|0,c[x>>2]=j&7,x)|0)|0;t=e+160|0;y=5264213;a[t]=y&255;y=y>>8;a[t+1|0]=y&255;y=y>>8;a[t+2|0]=y&255;y=y>>8;a[t+3|0]=y&255;t=e|0;c[t>>2]=c[t>>2]|1;i=g;return}else if((u|0)==16){t=e+32|0;a[t]=a[51e3]|0;a[t+1|0]=a[51001|0]|0;a[t+2|0]=a[51002|0]|0;a[t+3|0]=a[51003|0]|0;a[t+4|0]=a[51004|0]|0;c[e+28>>2]=2;a2(e+96|0,40688,(x=i,i=i+8|0,c[x>>2]=j&7,x)|0)|0;t=((d[f+2|0]|0)<<8|(d[f+3|0]|0))&65535;a2(e+160|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=t,x)|0)|0;t=e+8|0;c[t>>2]=(c[t>>2]|0)+1;i=g;return}else if((u|0)==40){u=e+32|0;a[u]=a[50880]|0;a[u+1|0]=a[50881|0]|0;a[u+2|0]=a[50882|0]|0;a[u+3|0]=a[50883|0]|0;a[u+4|0]=a[50884|0]|0;c[e+28>>2]=2;u=e+96|0;y=5264213;a[u]=y&255;y=y>>8;a[u+1|0]=y&255;y=y>>8;a[u+2|0]=y&255;y=y>>8;a[u+3|0]=y&255;a2(e+160|0,40688,(x=i,i=i+8|0,c[x>>2]=j&7,x)|0)|0;j=e|0;c[j>>2]=c[j>>2]|1;i=g;return}else{j=e+32|0;a[j]=a[36208]|0;a[j+1|0]=a[36209|0]|0;a[j+2|0]=a[36210|0]|0;c[e+28>>2]=1;j=((d[f]|0)<<8|(d[f+1|0]|0))&65535;a2(e+96|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=j,x)|0)|0;i=g;return}}}function gX(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;y=5395274;a[e]=y&255;y=y>>8;a[e+1|0]=y&255;y=y>>8;a[e+2|0]=y&255;y=y>>8;a[e+3|0]=y&255;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,0);d=b|0;c[d>>2]=c[d>>2]|4;return}function gY(b,d){b=b|0;d=d|0;var e=0,f=0;e=i;f=b+32|0;a[f]=a[51544]|0;a[f+1|0]=a[51545|0]|0;a[f+2|0]=a[51546|0]|0;a[f+3|0]=a[51547|0]|0;a[f+4|0]=a[51548|0]|0;a[f+5|0]=a[51549|0]|0;a[f+6|0]=a[51550|0]|0;c[b+28>>2]=2;f=(a[d]&255)>>>1&7;a2(b+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=f<<16>>16==0?8:f&65535,x)|0)|0;ik(b,b+160|0,d,a[d+1|0]&63,8);i=e;return}function gZ(b,d){b=b|0;d=d|0;var e=0,f=0;e=i;f=b+32|0;a[f]=a[51576]|0;a[f+1|0]=a[51577|0]|0;a[f+2|0]=a[51578|0]|0;a[f+3|0]=a[51579|0]|0;a[f+4|0]=a[51580|0]|0;a[f+5|0]=a[51581|0]|0;a[f+6|0]=a[51582|0]|0;c[b+28>>2]=2;f=(a[d]&255)>>>1&7;a2(b+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=f<<16>>16==0?8:f&65535,x)|0)|0;ik(b,b+160|0,d,a[d+1|0]&63,16);i=e;return}function g_(b,d){b=b|0;d=d|0;var e=0,f=0;e=i;f=b+32|0;a[f]=a[51600]|0;a[f+1|0]=a[51601|0]|0;a[f+2|0]=a[51602|0]|0;a[f+3|0]=a[51603|0]|0;a[f+4|0]=a[51604|0]|0;a[f+5|0]=a[51605|0]|0;a[f+6|0]=a[51606|0]|0;c[b+28>>2]=2;f=(a[d]&255)>>>1&7;a2(b+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=f<<16>>16==0?8:f&65535,x)|0)|0;ik(b,b+160|0,d,a[d+1|0]&63,32);i=e;return}function g$(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0;h=i;j=f+12|0;k=e[j>>1]|0;l=k>>>8&15;m=k&63;if(l>>>0>1){n=f|0;c[n>>2]=c[n>>2]|32}if((m|0)==60){n=c[7432+(l<<2)>>2]|0;o=f+32|0;v_(o|0,n|0)|0;c[f+28>>2]=0;n=f|0;c[n>>2]=c[n>>2]|128;i=h;return}else if((m|0)==59){v_(f+32|0,c[7432+(l<<2)>>2]|0)|0;c[f+28>>2]=1;n=(((d[g+2|0]|0)<<8|(d[g+3|0]|0))<<8|(d[g+4|0]|0))<<8|(d[g+5|0]|0);a2(f+96|0,54160,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=n,x)|0)|0;n=f+8|0;c[n>>2]=(c[n>>2]|0)+2;n=f|0;c[n>>2]=c[n>>2]|128;i=h;return}else if((m|0)==58){v_(f+32|0,c[7432+(l<<2)>>2]|0)|0;c[f+28>>2]=1;m=((d[g+2|0]|0)<<8|(d[g+3|0]|0))&65535;a2(f+96|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=m,x)|0)|0;m=f+8|0;c[m>>2]=(c[m>>2]|0)+1;m=f|0;c[m>>2]=c[m>>2]|128;i=h;return}else{if((k&56|0)==8){k=c[7560+(l<<2)>>2]|0;m=f+32|0;v_(m|0,k|0)|0;c[f+28>>2]=2;k=f+96|0;m=b[j>>1]&7;a2(k|0,44048,(x=i,i=i+8|0,c[x>>2]=m,x)|0)|0;m=f+160|0;k=f+8|0;j=c[k>>2]|0;n=j<<1;o=(d[g+n|0]|0)<<8|(d[g+(n|1)|0]|0);c[k>>2]=j+1;j=o&65535;o=(c[f+4>>2]|0)+2+((j&32768|0)!=0?j|-65536:j)|0;a2(m|0,52760,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=o,x)|0)|0;o=f|0;c[o>>2]=c[o>>2]|2;i=h;return}else{o=c[7496+(l<<2)>>2]|0;l=f+32|0;v_(l|0,o|0)|0;c[f+28>>2]=1;ik(f,f+96|0,g,a[g+1|0]&63,8);i=h;return}}}function g0(b,d){b=b|0;d=d|0;var e=0,f=0;e=i;f=b+32|0;a[f]=a[54984]|0;a[f+1|0]=a[54985|0]|0;a[f+2|0]=a[54986|0]|0;a[f+3|0]=a[54987|0]|0;a[f+4|0]=a[54988|0]|0;a[f+5|0]=a[54989|0]|0;a[f+6|0]=a[54990|0]|0;c[b+28>>2]=2;f=(a[d]&255)>>>1&7;a2(b+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=f<<16>>16==0?8:f&65535,x)|0)|0;ik(b,b+160|0,d,a[d+1|0]&63,8);i=e;return}function g1(b,d){b=b|0;d=d|0;var e=0,f=0;e=i;f=b+32|0;a[f]=a[55024]|0;a[f+1|0]=a[55025|0]|0;a[f+2|0]=a[55026|0]|0;a[f+3|0]=a[55027|0]|0;a[f+4|0]=a[55028|0]|0;a[f+5|0]=a[55029|0]|0;a[f+6|0]=a[55030|0]|0;c[b+28>>2]=2;f=(a[d]&255)>>>1&7;a2(b+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=f<<16>>16==0?8:f&65535,x)|0)|0;ik(b,b+160|0,d,a[d+1|0]&63,16);i=e;return}function g2(b,d){b=b|0;d=d|0;var e=0,f=0;e=i;f=b+32|0;a[f]=a[55056]|0;a[f+1|0]=a[55057|0]|0;a[f+2|0]=a[55058|0]|0;a[f+3|0]=a[55059|0]|0;a[f+4|0]=a[55060|0]|0;a[f+5|0]=a[55061|0]|0;a[f+6|0]=a[55062|0]|0;c[b+28>>2]=2;f=(a[d]&255)>>>1&7;a2(b+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=f<<16>>16==0?8:f&65535,x)|0)|0;ik(b,b+160|0,d,a[d+1|0]&63,32);i=e;return}function g3(b,f){b=b|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,y=0,z=0;g=i;h=(e[b+12>>1]|0)>>>8&15;j=f+1|0;k=a[j]|0;if(k<<24>>24==0){l=c[7624+(h<<2)>>2]|0;m=b+32|0;v_(m|0,l|0)|0;c[b+28>>2]=1;l=b+96|0;n=b+8|0;o=c[n>>2]|0;p=o<<1;q=(d[f+p|0]|0)<<8|(d[f+(p|1)|0]|0);c[n>>2]=o+1;o=q&65535;q=(c[b+4>>2]|0)+2+((o&32768|0)!=0?o|-65536:o)|0;a2(l|0,52760,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=q,x)|0)|0;q=(vX(m|0)|0)+(b+32)|0;a[q]=a[45296]|0;a[q+1|0]=a[45297|0]|0;a[q+2|0]=a[45298|0]|0;r=(h|0)==1;s=b|0;t=c[s>>2]|0;u=r?4:2;v=t|u;w=h>>>0>1;y=v|32;z=w?y:v;c[s>>2]=z;i=g;return}q=b+32|0;v_(q|0,c[7624+(h<<2)>>2]|0)|0;c[b+28>>2]=1;m=b+96|0;if(k<<24>>24==-1){k=b+8|0;l=c[k>>2]|0;o=l<<1;n=(((d[f+o|0]|0)<<8|(d[f+(o|1)|0]|0))<<8|(d[f+(o+2)|0]|0))<<8|(d[f+(o+3)|0]|0);c[k>>2]=l+2;l=(c[b+4>>2]|0)+2+n|0;a2(m|0,52760,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=l,x)|0)|0;l=(vX(q|0)|0)+(b+32)|0;a[l]=a[45600]|0;a[l+1|0]=a[45601|0]|0;a[l+2|0]=a[45602|0]|0;l=b|0;c[l>>2]=c[l>>2]|128;r=(h|0)==1;s=b|0;t=c[s>>2]|0;u=r?4:2;v=t|u;w=h>>>0>1;y=v|32;z=w?y:v;c[s>>2]=z;i=g;return}else{l=d[j]|0;j=(c[b+4>>2]|0)+2+((l&128|0)!=0?l|-256:l)|0;a2(m|0,52760,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=j,x)|0)|0;j=(vX(q|0)|0)+(b+32)|0;a[j]=a[56368]|0;a[j+1|0]=a[56369|0]|0;a[j+2|0]=a[56370|0]|0;r=(h|0)==1;s=b|0;t=c[s>>2]|0;u=r?4:2;v=t|u;w=h>>>0>1;y=v|32;z=w?y:v;c[s>>2]=z;i=g;return}}function g4(b,f){b=b|0;f=f|0;var g=0,h=0;g=i;h=b+32|0;a[h]=a[56552]|0;a[h+1|0]=a[56553|0]|0;a[h+2|0]=a[56554|0]|0;a[h+3|0]=a[56555|0]|0;a[h+4|0]=a[56556|0]|0;a[h+5|0]=a[56557|0]|0;c[b+28>>2]=2;h=e[b+12>>1]|0;a2(b+96|0,54160,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=(h&128|0)!=0?h|-256:h&255,x)|0)|0;a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[f]|0)>>>1&7,x)|0)|0;i=g;return}function g5(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[56776]|0;a[g+1|0]=a[56777|0]|0;a[g+2|0]=a[56778|0]|0;a[g+3|0]=a[56779|0]|0;a[g+4|0]=a[56780|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,8);a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function g6(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[57032]|0;a[g+1|0]=a[57033|0]|0;a[g+2|0]=a[57034|0]|0;a[g+3|0]=a[57035|0]|0;a[g+4|0]=a[57036|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,16);a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function g7(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[57248]|0;a[g+1|0]=a[57249|0]|0;a[g+2|0]=a[57250|0]|0;a[g+3|0]=a[57251|0]|0;a[g+4|0]=a[57252|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,32);a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function g8(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[56704]|0;a[g+1|0]=a[56705|0]|0;a[g+2|0]=a[56706|0]|0;a[g+3|0]=a[56707|0]|0;a[g+4|0]=a[56708|0]|0;a[g+5|0]=a[56709|0]|0;a[g+6|0]=a[56710|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,16);a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function g9(b,f){b=b|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;h=b+12|0;j=e[h>>1]|0;k=j>>>3&7;if((k|0)==1){l=b+32|0;a[l]=a[56952]|0;a[l+1|0]=a[56953|0]|0;a[l+2|0]=a[56954|0]|0;a[l+3|0]=a[56955|0]|0;a[l+4|0]=a[56956|0]|0;a[l+5|0]=a[56957|0]|0;a[l+6|0]=a[56958|0]|0;c[b+28>>2]=2;l=b+96|0;m=j&7;a2(l|0,30304,(x=i,i=i+8|0,c[x>>2]=m,x)|0)|0;m=b+160|0;l=(e[h>>1]|0)>>>9&7;a2(m|0,30304,(x=i,i=i+8|0,c[x>>2]=l,x)|0)|0;l=b|0;c[l>>2]=c[l>>2]|32;i=g;return}else if((k|0)==0){k=b+32|0;a[k]=a[56952]|0;a[k+1|0]=a[56953|0]|0;a[k+2|0]=a[56954|0]|0;a[k+3|0]=a[56955|0]|0;a[k+4|0]=a[56956|0]|0;a[k+5|0]=a[56957|0]|0;a[k+6|0]=a[56958|0]|0;c[b+28>>2]=2;a2(b+96|0,44048,(x=i,i=i+8|0,c[x>>2]=j&7,x)|0)|0;a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[f]|0)>>>1&7,x)|0)|0;j=b|0;c[j>>2]=c[j>>2]|32;i=g;return}else{j=b+32|0;a[j]=a[56776]|0;a[j+1|0]=a[56777|0]|0;a[j+2|0]=a[56778|0]|0;a[j+3|0]=a[56779|0]|0;a[j+4|0]=a[56780|0]|0;c[b+28>>2]=2;a2(b+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[f]|0)>>>1&7,x)|0)|0;ik(b,b+160|0,f,a[f+1|0]&63,8);i=g;return}}function ha(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0;g=i;h=e+32|0;if((b[e+12>>1]&48)>>>0<16){a[h]=a[36208]|0;a[h+1|0]=a[36209|0]|0;a[h+2|0]=a[36210|0]|0;c[e+28>>2]=1;j=e+96|0;k=((d[f]|0)<<8|(d[f+1|0]|0))&65535;a2(j|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=k,x)|0)|0;i=g;return}else{a[h]=a[57032]|0;a[h+1|0]=a[57033|0]|0;a[h+2|0]=a[57034|0]|0;a[h+3|0]=a[57035|0]|0;a[h+4|0]=a[57036|0]|0;c[e+28>>2]=2;h=e+96|0;k=(d[f]|0)>>>1&7;a2(h|0,44048,(x=i,i=i+8|0,c[x>>2]=k,x)|0)|0;ik(e,e+160|0,f,a[f+1|0]&63,16);i=g;return}}function hb(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0;g=i;h=e+32|0;if((b[e+12>>1]&48)>>>0<16){a[h]=a[36208]|0;a[h+1|0]=a[36209|0]|0;a[h+2|0]=a[36210|0]|0;c[e+28>>2]=1;j=e+96|0;k=((d[f]|0)<<8|(d[f+1|0]|0))&65535;a2(j|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=k,x)|0)|0;i=g;return}else{a[h]=a[57248]|0;a[h+1|0]=a[57249|0]|0;a[h+2|0]=a[57250|0]|0;a[h+3|0]=a[57251|0]|0;a[h+4|0]=a[57252|0]|0;c[e+28>>2]=2;h=e+96|0;k=(d[f]|0)>>>1&7;a2(h|0,44048,(x=i,i=i+8|0,c[x>>2]=k,x)|0)|0;ik(e,e+160|0,f,a[f+1|0]&63,32);i=g;return}}function hc(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[57384]|0;a[g+1|0]=a[57385|0]|0;a[g+2|0]=a[57386|0]|0;a[g+3|0]=a[57387|0]|0;a[g+4|0]=a[57388|0]|0;a[g+5|0]=a[57389|0]|0;a[g+6|0]=a[57390|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,16);a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function hd(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[57504]|0;a[g+1|0]=a[57505|0]|0;a[g+2|0]=a[57506|0]|0;a[g+3|0]=a[57507|0]|0;a[g+4|0]=a[57508|0]|0;a[g+5|0]=a[57509|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,8);a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function he(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[57608]|0;a[g+1|0]=a[57609|0]|0;a[g+2|0]=a[57610|0]|0;a[g+3|0]=a[57611|0]|0;a[g+4|0]=a[57612|0]|0;a[g+5|0]=a[57613|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,16);a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function hf(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[57696]|0;a[g+1|0]=a[57697|0]|0;a[g+2|0]=a[57698|0]|0;a[g+3|0]=a[57699|0]|0;a[g+4|0]=a[57700|0]|0;a[g+5|0]=a[57701|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,32);a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function hg(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[57448]|0;a[g+1|0]=a[57449|0]|0;a[g+2|0]=a[57450|0]|0;a[g+3|0]=a[57451|0]|0;a[g+4|0]=a[57452|0]|0;a[g+5|0]=a[57453|0]|0;a[g+6|0]=a[57454|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,16);a2(b+160|0,40688,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function hh(b,f){b=b|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;h=b+12|0;j=e[h>>1]|0;k=j>>>3&7;if((k|0)==0){l=b+32|0;a[l]=a[57544]|0;a[l+1|0]=a[57545|0]|0;a[l+2|0]=a[57546|0]|0;a[l+3|0]=a[57547|0]|0;a[l+4|0]=a[57548|0]|0;a[l+5|0]=a[57549|0]|0;a[l+6|0]=a[57550|0]|0;c[b+28>>2]=2;l=b+96|0;m=j&7;a2(l|0,44048,(x=i,i=i+8|0,c[x>>2]=m,x)|0)|0;m=b+160|0;l=(d[f]|0)>>>1&7;a2(m|0,44048,(x=i,i=i+8|0,c[x>>2]=l,x)|0)|0;l=b|0;c[l>>2]=c[l>>2]|32;i=g;return}else if((k|0)==1){k=b+32|0;a[k]=a[57544]|0;a[k+1|0]=a[57545|0]|0;a[k+2|0]=a[57546|0]|0;a[k+3|0]=a[57547|0]|0;a[k+4|0]=a[57548|0]|0;a[k+5|0]=a[57549|0]|0;a[k+6|0]=a[57550|0]|0;c[b+28>>2]=2;a2(b+96|0,30304,(x=i,i=i+8|0,c[x>>2]=j&7,x)|0)|0;a2(b+160|0,30304,(x=i,i=i+8|0,c[x>>2]=(e[h>>1]|0)>>>9&7,x)|0)|0;h=b|0;c[h>>2]=c[h>>2]|32;i=g;return}else{h=b+32|0;a[h]=a[57504]|0;a[h+1|0]=a[57505|0]|0;a[h+2|0]=a[57506|0]|0;a[h+3|0]=a[57507|0]|0;a[h+4|0]=a[57508|0]|0;a[h+5|0]=a[57509|0]|0;c[b+28>>2]=2;a2(b+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[f]|0)>>>1&7,x)|0)|0;ik(b,b+160|0,f,a[f+1|0]&63,8);i=g;return}}function hi(b,f){b=b|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;h=b+12|0;j=e[h>>1]|0;k=j>>>3&7;if((k|0)==0){l=b+32|0;a[l]=a[57656]|0;a[l+1|0]=a[57657|0]|0;a[l+2|0]=a[57658|0]|0;a[l+3|0]=a[57659|0]|0;a[l+4|0]=a[57660|0]|0;a[l+5|0]=a[57661|0]|0;a[l+6|0]=a[57662|0]|0;c[b+28>>2]=2;l=b+96|0;m=j&7;a2(l|0,44048,(x=i,i=i+8|0,c[x>>2]=m,x)|0)|0;m=b+160|0;l=(d[f]|0)>>>1&7;a2(m|0,44048,(x=i,i=i+8|0,c[x>>2]=l,x)|0)|0;l=b|0;c[l>>2]=c[l>>2]|32;i=g;return}else if((k|0)==1){k=b+32|0;a[k]=a[57656]|0;a[k+1|0]=a[57657|0]|0;a[k+2|0]=a[57658|0]|0;a[k+3|0]=a[57659|0]|0;a[k+4|0]=a[57660|0]|0;a[k+5|0]=a[57661|0]|0;a[k+6|0]=a[57662|0]|0;c[b+28>>2]=2;a2(b+96|0,30304,(x=i,i=i+8|0,c[x>>2]=j&7,x)|0)|0;a2(b+160|0,30304,(x=i,i=i+8|0,c[x>>2]=(e[h>>1]|0)>>>9&7,x)|0)|0;h=b|0;c[h>>2]=c[h>>2]|32;i=g;return}else{h=b+32|0;a[h]=a[57608]|0;a[h+1|0]=a[57609|0]|0;a[h+2|0]=a[57610|0]|0;a[h+3|0]=a[57611|0]|0;a[h+4|0]=a[57612|0]|0;a[h+5|0]=a[57613|0]|0;c[b+28>>2]=2;a2(b+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[f]|0)>>>1&7,x)|0)|0;ik(b,b+160|0,f,a[f+1|0]&63,16);i=g;return}}function hj(b,f){b=b|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;h=b+12|0;j=e[h>>1]|0;k=j>>>3&7;if((k|0)==0){l=b+32|0;a[l]=a[57792]|0;a[l+1|0]=a[57793|0]|0;a[l+2|0]=a[57794|0]|0;a[l+3|0]=a[57795|0]|0;a[l+4|0]=a[57796|0]|0;a[l+5|0]=a[57797|0]|0;a[l+6|0]=a[57798|0]|0;c[b+28>>2]=2;l=b+96|0;m=j&7;a2(l|0,44048,(x=i,i=i+8|0,c[x>>2]=m,x)|0)|0;m=b+160|0;l=(d[f]|0)>>>1&7;a2(m|0,44048,(x=i,i=i+8|0,c[x>>2]=l,x)|0)|0;l=b|0;c[l>>2]=c[l>>2]|32;i=g;return}else if((k|0)==1){k=b+32|0;a[k]=a[57792]|0;a[k+1|0]=a[57793|0]|0;a[k+2|0]=a[57794|0]|0;a[k+3|0]=a[57795|0]|0;a[k+4|0]=a[57796|0]|0;a[k+5|0]=a[57797|0]|0;a[k+6|0]=a[57798|0]|0;c[b+28>>2]=2;a2(b+96|0,30304,(x=i,i=i+8|0,c[x>>2]=j&7,x)|0)|0;a2(b+160|0,30304,(x=i,i=i+8|0,c[x>>2]=(e[h>>1]|0)>>>9&7,x)|0)|0;h=b|0;c[h>>2]=c[h>>2]|32;i=g;return}else{h=b+32|0;a[h]=a[57696]|0;a[h+1|0]=a[57697|0]|0;a[h+2|0]=a[57698|0]|0;a[h+3|0]=a[57699|0]|0;a[h+4|0]=a[57700|0]|0;a[h+5|0]=a[57701|0]|0;c[b+28>>2]=2;a2(b+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[f]|0)>>>1&7,x)|0)|0;ik(b,b+160|0,f,a[f+1|0]&63,32);i=g;return}}function hk(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[57864]|0;a[g+1|0]=a[57865|0]|0;a[g+2|0]=a[57866|0]|0;a[g+3|0]=a[57867|0]|0;a[g+4|0]=a[57868|0]|0;a[g+5|0]=a[57869|0]|0;a[g+6|0]=a[57870|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,32);a2(b+160|0,40688,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function hl(a,b){a=a|0;b=b|0;var d=0;b=i;i=i+16|0;d=b|0;a2(d|0,32808,(x=i,i=i+8|0,c[x>>2]=e[a+12>>1]|0,x)|0)|0;v_(a+32|0,d|0)|0;c[a+28>>2]=0;d=a|0;c[d>>2]=c[d>>2]|4;i=b;return}function hm(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[58048]|0;a[g+1|0]=a[58049|0]|0;a[g+2|0]=a[58050|0]|0;a[g+3|0]=a[58051|0]|0;a[g+4|0]=a[58052|0]|0;a[g+5|0]=a[58053|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,8);a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function hn(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[58168]|0;a[g+1|0]=a[58169|0]|0;a[g+2|0]=a[58170|0]|0;a[g+3|0]=a[58171|0]|0;a[g+4|0]=a[58172|0]|0;a[g+5|0]=a[58173|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,16);a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function ho(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[30128]|0;a[g+1|0]=a[30129|0]|0;a[g+2|0]=a[30130|0]|0;a[g+3|0]=a[30131|0]|0;a[g+4|0]=a[30132|0]|0;a[g+5|0]=a[30133|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,32);a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function hp(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[30216]|0;a[g+1|0]=a[30217|0]|0;a[g+2|0]=a[30218|0]|0;a[g+3|0]=a[30219|0]|0;a[g+4|0]=a[30220|0]|0;a[g+5|0]=a[30221|0]|0;a[g+6|0]=a[30222|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,16);a2(b+160|0,40688,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function hq(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0;h=i;j=f+12|0;k=b[j>>1]|0;l=f+32|0;if((k&56)==8){a[l]=a[30352]|0;a[l+1|0]=a[30353|0]|0;a[l+2|0]=a[30354|0]|0;a[l+3|0]=a[30355|0]|0;a[l+4|0]=a[30356|0]|0;a[l+5|0]=a[30357|0]|0;a[l+6|0]=a[30358|0]|0;c[f+28>>2]=2;m=f+96|0;n=k&7;a2(m|0,31176,(x=i,i=i+8|0,c[x>>2]=n,x)|0)|0;n=f+160|0;m=(e[j>>1]|0)>>>9&7;a2(n|0,31176,(x=i,i=i+8|0,c[x>>2]=m,x)|0)|0;i=h;return}else{a[l]=a[30280]|0;a[l+1|0]=a[30281|0]|0;a[l+2|0]=a[30282|0]|0;a[l+3|0]=a[30283|0]|0;a[l+4|0]=a[30284|0]|0;a[l+5|0]=a[30285|0]|0;c[f+28>>2]=2;l=f+96|0;m=(d[g]|0)>>>1&7;a2(l|0,44048,(x=i,i=i+8|0,c[x>>2]=m,x)|0)|0;ik(f,f+160|0,g,a[g+1|0]&63,8);i=h;return}}function hr(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0;h=i;j=f+12|0;k=b[j>>1]|0;l=f+32|0;if((k&56)==8){a[l]=a[30440]|0;a[l+1|0]=a[30441|0]|0;a[l+2|0]=a[30442|0]|0;a[l+3|0]=a[30443|0]|0;a[l+4|0]=a[30444|0]|0;a[l+5|0]=a[30445|0]|0;a[l+6|0]=a[30446|0]|0;c[f+28>>2]=2;m=f+96|0;n=k&7;a2(m|0,31176,(x=i,i=i+8|0,c[x>>2]=n,x)|0)|0;n=f+160|0;m=(e[j>>1]|0)>>>9&7;a2(n|0,31176,(x=i,i=i+8|0,c[x>>2]=m,x)|0)|0;i=h;return}else{a[l]=a[30400]|0;a[l+1|0]=a[30401|0]|0;a[l+2|0]=a[30402|0]|0;a[l+3|0]=a[30403|0]|0;a[l+4|0]=a[30404|0]|0;a[l+5|0]=a[30405|0]|0;c[f+28>>2]=2;l=f+96|0;m=(d[g]|0)>>>1&7;a2(l|0,44048,(x=i,i=i+8|0,c[x>>2]=m,x)|0)|0;ik(f,f+160|0,g,a[g+1|0]&63,16);i=h;return}}function hs(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0;h=i;j=f+12|0;k=b[j>>1]|0;l=f+32|0;if((k&56)==8){a[l]=a[30616]|0;a[l+1|0]=a[30617|0]|0;a[l+2|0]=a[30618|0]|0;a[l+3|0]=a[30619|0]|0;a[l+4|0]=a[30620|0]|0;a[l+5|0]=a[30621|0]|0;a[l+6|0]=a[30622|0]|0;c[f+28>>2]=2;m=f+96|0;n=k&7;a2(m|0,31176,(x=i,i=i+8|0,c[x>>2]=n,x)|0)|0;n=f+160|0;m=(e[j>>1]|0)>>>9&7;a2(n|0,31176,(x=i,i=i+8|0,c[x>>2]=m,x)|0)|0;i=h;return}else{a[l]=a[30528]|0;a[l+1|0]=a[30529|0]|0;a[l+2|0]=a[30530|0]|0;a[l+3|0]=a[30531|0]|0;a[l+4|0]=a[30532|0]|0;a[l+5|0]=a[30533|0]|0;c[f+28>>2]=2;l=f+96|0;m=(d[g]|0)>>>1&7;a2(l|0,44048,(x=i,i=i+8|0,c[x>>2]=m,x)|0)|0;ik(f,f+160|0,g,a[g+1|0]&63,32);i=h;return}}function ht(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[30816]|0;a[g+1|0]=a[30817|0]|0;a[g+2|0]=a[30818|0]|0;a[g+3|0]=a[30819|0]|0;a[g+4|0]=a[30820|0]|0;a[g+5|0]=a[30821|0]|0;a[g+6|0]=a[30822|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,32);a2(b+160|0,40688,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function hu(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[31056]|0;a[g+1|0]=a[31057|0]|0;a[g+2|0]=a[31058|0]|0;a[g+3|0]=a[31059|0]|0;a[g+4|0]=a[31060|0]|0;a[g+5|0]=a[31061|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,8);a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function hv(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[31160]|0;a[g+1|0]=a[31161|0]|0;a[g+2|0]=a[31162|0]|0;a[g+3|0]=a[31163|0]|0;a[g+4|0]=a[31164|0]|0;a[g+5|0]=a[31165|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,16);a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function hw(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[31224]|0;a[g+1|0]=a[31225|0]|0;a[g+2|0]=a[31226|0]|0;a[g+3|0]=a[31227|0]|0;a[g+4|0]=a[31228|0]|0;a[g+5|0]=a[31229|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,32);a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function hx(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[30976]|0;a[g+1|0]=a[30977|0]|0;a[g+2|0]=a[30978|0]|0;a[g+3|0]=a[30979|0]|0;a[g+4|0]=a[30980|0]|0;a[g+5|0]=a[30981|0]|0;a[g+6|0]=a[30982|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,16);a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function hy(b,f){b=b|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;h=b+12|0;j=e[h>>1]|0;k=j>>>3&7;if((k|0)==1){l=b+32|0;a[l]=a[31120]|0;a[l+1|0]=a[31121|0]|0;a[l+2|0]=a[31122|0]|0;a[l+3|0]=a[31123|0]|0;a[l+4|0]=a[31124|0]|0;a[l+5|0]=a[31125|0]|0;a[l+6|0]=a[31126|0]|0;c[b+28>>2]=2;l=b+96|0;m=j&7;a2(l|0,30304,(x=i,i=i+8|0,c[x>>2]=m,x)|0)|0;m=b+160|0;l=(e[h>>1]|0)>>>9&7;a2(m|0,30304,(x=i,i=i+8|0,c[x>>2]=l,x)|0)|0;l=b|0;c[l>>2]=c[l>>2]|32;i=g;return}else if((k|0)==0){k=b+32|0;a[k]=a[31120]|0;a[k+1|0]=a[31121|0]|0;a[k+2|0]=a[31122|0]|0;a[k+3|0]=a[31123|0]|0;a[k+4|0]=a[31124|0]|0;a[k+5|0]=a[31125|0]|0;a[k+6|0]=a[31126|0]|0;c[b+28>>2]=2;a2(b+96|0,44048,(x=i,i=i+8|0,c[x>>2]=j&7,x)|0)|0;a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[f]|0)>>>1&7,x)|0)|0;j=b|0;c[j>>2]=c[j>>2]|32;i=g;return}else{j=b+32|0;a[j]=a[31056]|0;a[j+1|0]=a[31057|0]|0;a[j+2|0]=a[31058|0]|0;a[j+3|0]=a[31059|0]|0;a[j+4|0]=a[31060|0]|0;a[j+5|0]=a[31061|0]|0;c[b+28>>2]=2;a2(b+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[f]|0)>>>1&7,x)|0)|0;ik(b,b+160|0,f,a[f+1|0]&63,8);i=g;return}}function hz(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;j=f+12|0;k=(e[j>>1]|0)>>>3&7;if((k|0)==1){l=f+32|0;y=4675653;a[l]=y&255;y=y>>8;a[l+1|0]=y&255;y=y>>8;a[l+2|0]=y&255;y=y>>8;a[l+3|0]=y&255;c[f+28>>2]=2;l=f+96|0;m=(d[g]|0)>>>1&7;a2(l|0,40688,(x=i,i=i+8|0,c[x>>2]=m,x)|0)|0;m=f+160|0;l=b[j>>1]&7;a2(m|0,40688,(x=i,i=i+8|0,c[x>>2]=l,x)|0)|0;i=h;return}else if((k|0)==0){k=f+32|0;y=4675653;a[k]=y&255;y=y>>8;a[k+1|0]=y&255;y=y>>8;a[k+2|0]=y&255;y=y>>8;a[k+3|0]=y&255;c[f+28>>2]=2;a2(f+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[g]|0)>>>1&7,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else{j=f+32|0;a[j]=a[31160]|0;a[j+1|0]=a[31161|0]|0;a[j+2|0]=a[31162|0]|0;a[j+3|0]=a[31163|0]|0;a[j+4|0]=a[31164|0]|0;a[j+5|0]=a[31165|0]|0;c[f+28>>2]=2;a2(f+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[g]|0)>>>1&7,x)|0)|0;ik(f,f+160|0,g,a[g+1|0]&63,16);i=h;return}}function hA(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;j=f+12|0;k=(e[j>>1]|0)>>>3&7;if((k|0)==1){l=f+32|0;y=4675653;a[l]=y&255;y=y>>8;a[l+1|0]=y&255;y=y>>8;a[l+2|0]=y&255;y=y>>8;a[l+3|0]=y&255;c[f+28>>2]=2;l=f+96|0;m=(d[g]|0)>>>1&7;a2(l|0,44048,(x=i,i=i+8|0,c[x>>2]=m,x)|0)|0;m=f+160|0;l=b[j>>1]&7;a2(m|0,40688,(x=i,i=i+8|0,c[x>>2]=l,x)|0)|0;i=h;return}else if((k|0)==0){k=f+32|0;a[k]=a[36208]|0;a[k+1|0]=a[36209|0]|0;a[k+2|0]=a[36210|0]|0;c[f+28>>2]=1;k=((d[g]|0)<<8|(d[g+1|0]|0))&65535;a2(f+96|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=k,x)|0)|0;i=h;return}else{k=f+32|0;a[k]=a[31224]|0;a[k+1|0]=a[31225|0]|0;a[k+2|0]=a[31226|0]|0;a[k+3|0]=a[31227|0]|0;a[k+4|0]=a[31228|0]|0;a[k+5|0]=a[31229|0]|0;c[f+28>>2]=2;a2(f+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[g]|0)>>>1&7,x)|0)|0;ik(f,f+160|0,g,a[g+1|0]&63,32);i=h;return}}function hB(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[31320]|0;a[g+1|0]=a[31321|0]|0;a[g+2|0]=a[31322|0]|0;a[g+3|0]=a[31323|0]|0;a[g+4|0]=a[31324|0]|0;a[g+5|0]=a[31325|0]|0;a[g+6|0]=a[31326|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,16);a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function hC(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[31520]|0;a[g+1|0]=a[31521|0]|0;a[g+2|0]=a[31522|0]|0;a[g+3|0]=a[31523|0]|0;a[g+4|0]=a[31524|0]|0;a[g+5|0]=a[31525|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,8);a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function hD(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[31888]|0;a[g+1|0]=a[31889|0]|0;a[g+2|0]=a[31890|0]|0;a[g+3|0]=a[31891|0]|0;a[g+4|0]=a[31892|0]|0;a[g+5|0]=a[31893|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,16);a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function hE(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[32136]|0;a[g+1|0]=a[32137|0]|0;a[g+2|0]=a[32138|0]|0;a[g+3|0]=a[32139|0]|0;a[g+4|0]=a[32140|0]|0;a[g+5|0]=a[32141|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,32);a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function hF(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[31424]|0;a[g+1|0]=a[31425|0]|0;a[g+2|0]=a[31426|0]|0;a[g+3|0]=a[31427|0]|0;a[g+4|0]=a[31428|0]|0;a[g+5|0]=a[31429|0]|0;a[g+6|0]=a[31430|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,16);a2(b+160|0,40688,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function hG(b,f){b=b|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;h=b+12|0;j=e[h>>1]|0;k=j>>>3&7;if((k|0)==1){l=b+32|0;a[l]=a[31728]|0;a[l+1|0]=a[31729|0]|0;a[l+2|0]=a[31730|0]|0;a[l+3|0]=a[31731|0]|0;a[l+4|0]=a[31732|0]|0;a[l+5|0]=a[31733|0]|0;a[l+6|0]=a[31734|0]|0;c[b+28>>2]=2;l=b+96|0;m=j&7;a2(l|0,30304,(x=i,i=i+8|0,c[x>>2]=m,x)|0)|0;m=b+160|0;l=(e[h>>1]|0)>>>9&7;a2(m|0,30304,(x=i,i=i+8|0,c[x>>2]=l,x)|0)|0;l=b|0;c[l>>2]=c[l>>2]|32;i=g;return}else if((k|0)==0){k=b+32|0;a[k]=a[31728]|0;a[k+1|0]=a[31729|0]|0;a[k+2|0]=a[31730|0]|0;a[k+3|0]=a[31731|0]|0;a[k+4|0]=a[31732|0]|0;a[k+5|0]=a[31733|0]|0;a[k+6|0]=a[31734|0]|0;c[b+28>>2]=2;a2(b+96|0,44048,(x=i,i=i+8|0,c[x>>2]=j&7,x)|0)|0;a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[f]|0)>>>1&7,x)|0)|0;j=b|0;c[j>>2]=c[j>>2]|32;i=g;return}else{j=b+32|0;a[j]=a[31520]|0;a[j+1|0]=a[31521|0]|0;a[j+2|0]=a[31522|0]|0;a[j+3|0]=a[31523|0]|0;a[j+4|0]=a[31524|0]|0;a[j+5|0]=a[31525|0]|0;c[b+28>>2]=2;a2(b+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[f]|0)>>>1&7,x)|0)|0;ik(b,b+160|0,f,a[f+1|0]&63,8);i=g;return}}function hH(b,f){b=b|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;h=b+12|0;j=e[h>>1]|0;k=j>>>3&7;if((k|0)==1){l=b+32|0;a[l]=a[31984]|0;a[l+1|0]=a[31985|0]|0;a[l+2|0]=a[31986|0]|0;a[l+3|0]=a[31987|0]|0;a[l+4|0]=a[31988|0]|0;a[l+5|0]=a[31989|0]|0;a[l+6|0]=a[31990|0]|0;c[b+28>>2]=2;l=b+96|0;m=j&7;a2(l|0,30304,(x=i,i=i+8|0,c[x>>2]=m,x)|0)|0;m=b+160|0;l=(e[h>>1]|0)>>>9&7;a2(m|0,30304,(x=i,i=i+8|0,c[x>>2]=l,x)|0)|0;l=b|0;c[l>>2]=c[l>>2]|32;i=g;return}else if((k|0)==0){k=b+32|0;a[k]=a[31984]|0;a[k+1|0]=a[31985|0]|0;a[k+2|0]=a[31986|0]|0;a[k+3|0]=a[31987|0]|0;a[k+4|0]=a[31988|0]|0;a[k+5|0]=a[31989|0]|0;a[k+6|0]=a[31990|0]|0;c[b+28>>2]=2;a2(b+96|0,44048,(x=i,i=i+8|0,c[x>>2]=j&7,x)|0)|0;a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[f]|0)>>>1&7,x)|0)|0;j=b|0;c[j>>2]=c[j>>2]|32;i=g;return}else{j=b+32|0;a[j]=a[31888]|0;a[j+1|0]=a[31889|0]|0;a[j+2|0]=a[31890|0]|0;a[j+3|0]=a[31891|0]|0;a[j+4|0]=a[31892|0]|0;a[j+5|0]=a[31893|0]|0;c[b+28>>2]=2;a2(b+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[f]|0)>>>1&7,x)|0)|0;ik(b,b+160|0,f,a[f+1|0]&63,16);i=g;return}}function hI(b,f){b=b|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;h=b+12|0;j=e[h>>1]|0;k=j>>>3&7;if((k|0)==0){l=b+32|0;a[l]=a[32272]|0;a[l+1|0]=a[32273|0]|0;a[l+2|0]=a[32274|0]|0;a[l+3|0]=a[32275|0]|0;a[l+4|0]=a[32276|0]|0;a[l+5|0]=a[32277|0]|0;a[l+6|0]=a[32278|0]|0;c[b+28>>2]=2;l=b+96|0;m=j&7;a2(l|0,44048,(x=i,i=i+8|0,c[x>>2]=m,x)|0)|0;m=b+160|0;l=(d[f]|0)>>>1&7;a2(m|0,44048,(x=i,i=i+8|0,c[x>>2]=l,x)|0)|0;l=b|0;c[l>>2]=c[l>>2]|32;i=g;return}else if((k|0)==1){k=b+32|0;a[k]=a[32272]|0;a[k+1|0]=a[32273|0]|0;a[k+2|0]=a[32274|0]|0;a[k+3|0]=a[32275|0]|0;a[k+4|0]=a[32276|0]|0;a[k+5|0]=a[32277|0]|0;a[k+6|0]=a[32278|0]|0;c[b+28>>2]=2;a2(b+96|0,30304,(x=i,i=i+8|0,c[x>>2]=j&7,x)|0)|0;a2(b+160|0,30304,(x=i,i=i+8|0,c[x>>2]=(e[h>>1]|0)>>>9&7,x)|0)|0;h=b|0;c[h>>2]=c[h>>2]|32;i=g;return}else{h=b+32|0;a[h]=a[32136]|0;a[h+1|0]=a[32137|0]|0;a[h+2|0]=a[32138|0]|0;a[h+3|0]=a[32139|0]|0;a[h+4|0]=a[32140|0]|0;a[h+5|0]=a[32141|0]|0;c[b+28>>2]=2;a2(b+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[f]|0)>>>1&7,x)|0)|0;ik(b,b+160|0,f,a[f+1|0]&63,32);i=g;return}}function hJ(b,e){b=b|0;e=e|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[32400]|0;a[g+1|0]=a[32401|0]|0;a[g+2|0]=a[32402|0]|0;a[g+3|0]=a[32403|0]|0;a[g+4|0]=a[32404|0]|0;a[g+5|0]=a[32405|0]|0;a[g+6|0]=a[32406|0]|0;c[b+28>>2]=2;ik(b,b+96|0,e,a[e+1|0]&63,32);a2(b+160|0,40688,(x=i,i=i+8|0,c[x>>2]=(d[e]|0)>>>1&7,x)|0)|0;i=f;return}function hK(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;j=f+12|0;k=(e[j>>1]|0)>>>3&7;if((k|0)==7){l=f+32|0;a[l]=a[32552]|0;a[l+1|0]=a[32553|0]|0;a[l+2|0]=a[32554|0]|0;a[l+3|0]=a[32555|0]|0;a[l+4|0]=a[32556|0]|0;a[l+5|0]=a[32557|0]|0;c[f+28>>2]=2;l=f+96|0;m=(d[g]|0)>>>1&7;a2(l|0,44048,(x=i,i=i+8|0,c[x>>2]=m,x)|0)|0;m=f+160|0;l=b[j>>1]&7;a2(m|0,44048,(x=i,i=i+8|0,c[x>>2]=l,x)|0)|0;i=h;return}else if((k|0)==1){l=f+32|0;a[l]=a[32912]|0;a[l+1|0]=a[32913|0]|0;a[l+2|0]=a[32914|0]|0;a[l+3|0]=a[32915|0]|0;a[l+4|0]=a[32916|0]|0;a[l+5|0]=a[32917|0]|0;c[f+28>>2]=2;l=(a[g]&255)>>>1&7;a2(f+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=l<<16>>16==0?8:l&65535,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==4){l=f+32|0;a[l]=a[33168]|0;a[l+1|0]=a[33169|0]|0;a[l+2|0]=a[33170|0]|0;a[l+3|0]=a[33171|0]|0;a[l+4|0]=a[33172|0]|0;a[l+5|0]=a[33173|0]|0;c[f+28>>2]=2;a2(f+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[g]|0)>>>1&7,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==3){l=f+32|0;a[l]=a[32552]|0;a[l+1|0]=a[32553|0]|0;a[l+2|0]=a[32554|0]|0;a[l+3|0]=a[32555|0]|0;a[l+4|0]=a[32556|0]|0;a[l+5|0]=a[32557|0]|0;c[f+28>>2]=2;l=(a[g]&255)>>>1&7;a2(f+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=l<<16>>16==0?8:l&65535,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==0){l=f+32|0;a[l]=a[33168]|0;a[l+1|0]=a[33169|0]|0;a[l+2|0]=a[33170|0]|0;a[l+3|0]=a[33171|0]|0;a[l+4|0]=a[33172|0]|0;a[l+5|0]=a[33173|0]|0;c[f+28>>2]=2;l=(a[g]&255)>>>1&7;a2(f+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=l<<16>>16==0?8:l&65535,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==6){l=f+32|0;a[l]=a[32728]|0;a[l+1|0]=a[32729|0]|0;a[l+2|0]=a[32730|0]|0;a[l+3|0]=a[32731|0]|0;a[l+4|0]=a[32732|0]|0;a[l+5|0]=a[32733|0]|0;a[l+6|0]=a[32734|0]|0;c[f+28>>2]=2;a2(f+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[g]|0)>>>1&7,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;l=f|0;c[l>>2]=c[l>>2]|32;i=h;return}else if((k|0)==5){l=f+32|0;a[l]=a[32912]|0;a[l+1|0]=a[32913|0]|0;a[l+2|0]=a[32914|0]|0;a[l+3|0]=a[32915|0]|0;a[l+4|0]=a[32916|0]|0;a[l+5|0]=a[32917|0]|0;c[f+28>>2]=2;a2(f+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[g]|0)>>>1&7,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==2){k=f+32|0;a[k]=a[32728]|0;a[k+1|0]=a[32729|0]|0;a[k+2|0]=a[32730|0]|0;a[k+3|0]=a[32731|0]|0;a[k+4|0]=a[32732|0]|0;a[k+5|0]=a[32733|0]|0;a[k+6|0]=a[32734|0]|0;c[f+28>>2]=2;k=(a[g]&255)>>>1&7;a2(f+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=k<<16>>16==0?8:k&65535,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;j=f|0;c[j>>2]=c[j>>2]|32;i=h;return}else{j=f+32|0;a[j]=a[36208]|0;a[j+1|0]=a[36209|0]|0;a[j+2|0]=a[36210|0]|0;c[f+28>>2]=1;j=((d[g]|0)<<8|(d[g+1|0]|0))&65535;a2(f+96|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=j,x)|0)|0;i=h;return}}function hL(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0;h=i;j=f+12|0;k=(e[j>>1]|0)>>>3&7;if((k|0)==1){l=f+32|0;a[l]=a[37904]|0;a[l+1|0]=a[37905|0]|0;a[l+2|0]=a[37906|0]|0;a[l+3|0]=a[37907|0]|0;a[l+4|0]=a[37908|0]|0;a[l+5|0]=a[37909|0]|0;c[f+28>>2]=2;l=f+96|0;m=(a[g]&255)>>>1&7;n=m<<16>>16==0?8:m&65535;a2(l|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=n,x)|0)|0;n=f+160|0;l=b[j>>1]&7;a2(n|0,44048,(x=i,i=i+8|0,c[x>>2]=l,x)|0)|0;i=h;return}else if((k|0)==5){l=f+32|0;a[l]=a[37904]|0;a[l+1|0]=a[37905|0]|0;a[l+2|0]=a[37906|0]|0;a[l+3|0]=a[37907|0]|0;a[l+4|0]=a[37908|0]|0;a[l+5|0]=a[37909|0]|0;c[f+28>>2]=2;a2(f+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[g]|0)>>>1&7,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==2){l=f+32|0;a[l]=a[38480]|0;a[l+1|0]=a[38481|0]|0;a[l+2|0]=a[38482|0]|0;a[l+3|0]=a[38483|0]|0;a[l+4|0]=a[38484|0]|0;a[l+5|0]=a[38485|0]|0;a[l+6|0]=a[38486|0]|0;c[f+28>>2]=2;l=(a[g]&255)>>>1&7;a2(f+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=l<<16>>16==0?8:l&65535,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;l=f|0;c[l>>2]=c[l>>2]|32;i=h;return}else if((k|0)==3){l=f+32|0;a[l]=a[39104]|0;a[l+1|0]=a[39105|0]|0;a[l+2|0]=a[39106|0]|0;a[l+3|0]=a[39107|0]|0;a[l+4|0]=a[39108|0]|0;a[l+5|0]=a[39109|0]|0;c[f+28>>2]=2;l=(a[g]&255)>>>1&7;a2(f+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=l<<16>>16==0?8:l&65535,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==0){l=f+32|0;a[l]=a[34768]|0;a[l+1|0]=a[34769|0]|0;a[l+2|0]=a[34770|0]|0;a[l+3|0]=a[34771|0]|0;a[l+4|0]=a[34772|0]|0;a[l+5|0]=a[34773|0]|0;c[f+28>>2]=2;l=(a[g]&255)>>>1&7;a2(f+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=l<<16>>16==0?8:l&65535,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==7){l=f+32|0;a[l]=a[39104]|0;a[l+1|0]=a[39105|0]|0;a[l+2|0]=a[39106|0]|0;a[l+3|0]=a[39107|0]|0;a[l+4|0]=a[39108|0]|0;a[l+5|0]=a[39109|0]|0;c[f+28>>2]=2;a2(f+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[g]|0)>>>1&7,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==6){l=f+32|0;a[l]=a[38480]|0;a[l+1|0]=a[38481|0]|0;a[l+2|0]=a[38482|0]|0;a[l+3|0]=a[38483|0]|0;a[l+4|0]=a[38484|0]|0;a[l+5|0]=a[38485|0]|0;a[l+6|0]=a[38486|0]|0;c[f+28>>2]=2;a2(f+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[g]|0)>>>1&7,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;l=f|0;c[l>>2]=c[l>>2]|32;i=h;return}else if((k|0)==4){k=f+32|0;a[k]=a[34768]|0;a[k+1|0]=a[34769|0]|0;a[k+2|0]=a[34770|0]|0;a[k+3|0]=a[34771|0]|0;a[k+4|0]=a[34772|0]|0;a[k+5|0]=a[34773|0]|0;c[f+28>>2]=2;a2(f+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[g]|0)>>>1&7,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else{j=f+32|0;a[j]=a[36208]|0;a[j+1|0]=a[36209|0]|0;a[j+2|0]=a[36210|0]|0;c[f+28>>2]=1;j=((d[g]|0)<<8|(d[g+1|0]|0))&65535;a2(f+96|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=j,x)|0)|0;i=h;return}}function hM(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;j=f+12|0;k=(e[j>>1]|0)>>>3&7;if((k|0)==7){l=f+32|0;a[l]=a[33552]|0;a[l+1|0]=a[33553|0]|0;a[l+2|0]=a[33554|0]|0;a[l+3|0]=a[33555|0]|0;a[l+4|0]=a[33556|0]|0;a[l+5|0]=a[33557|0]|0;c[f+28>>2]=2;l=f+96|0;m=(d[g]|0)>>>1&7;a2(l|0,44048,(x=i,i=i+8|0,c[x>>2]=m,x)|0)|0;m=f+160|0;l=b[j>>1]&7;a2(m|0,44048,(x=i,i=i+8|0,c[x>>2]=l,x)|0)|0;i=h;return}else if((k|0)==2){l=f+32|0;a[l]=a[33936]|0;a[l+1|0]=a[33937|0]|0;a[l+2|0]=a[33938|0]|0;a[l+3|0]=a[33939|0]|0;a[l+4|0]=a[33940|0]|0;a[l+5|0]=a[33941|0]|0;a[l+6|0]=a[33942|0]|0;c[f+28>>2]=2;l=(a[g]&255)>>>1&7;a2(f+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=l<<16>>16==0?8:l&65535,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;l=f|0;c[l>>2]=c[l>>2]|32;i=h;return}else if((k|0)==5){l=f+32|0;a[l]=a[34192]|0;a[l+1|0]=a[34193|0]|0;a[l+2|0]=a[34194|0]|0;a[l+3|0]=a[34195|0]|0;a[l+4|0]=a[34196|0]|0;a[l+5|0]=a[34197|0]|0;c[f+28>>2]=2;a2(f+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[g]|0)>>>1&7,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==0){l=f+32|0;a[l]=a[34496]|0;a[l+1|0]=a[34497|0]|0;a[l+2|0]=a[34498|0]|0;a[l+3|0]=a[34499|0]|0;a[l+4|0]=a[34500|0]|0;a[l+5|0]=a[34501|0]|0;c[f+28>>2]=2;l=(a[g]&255)>>>1&7;a2(f+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=l<<16>>16==0?8:l&65535,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==4){l=f+32|0;a[l]=a[34496]|0;a[l+1|0]=a[34497|0]|0;a[l+2|0]=a[34498|0]|0;a[l+3|0]=a[34499|0]|0;a[l+4|0]=a[34500|0]|0;a[l+5|0]=a[34501|0]|0;c[f+28>>2]=2;a2(f+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[g]|0)>>>1&7,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==1){l=f+32|0;a[l]=a[34192]|0;a[l+1|0]=a[34193|0]|0;a[l+2|0]=a[34194|0]|0;a[l+3|0]=a[34195|0]|0;a[l+4|0]=a[34196|0]|0;a[l+5|0]=a[34197|0]|0;c[f+28>>2]=2;l=(a[g]&255)>>>1&7;a2(f+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=l<<16>>16==0?8:l&65535,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==6){l=f+32|0;a[l]=a[33936]|0;a[l+1|0]=a[33937|0]|0;a[l+2|0]=a[33938|0]|0;a[l+3|0]=a[33939|0]|0;a[l+4|0]=a[33940|0]|0;a[l+5|0]=a[33941|0]|0;a[l+6|0]=a[33942|0]|0;c[f+28>>2]=2;a2(f+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[g]|0)>>>1&7,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;l=f|0;c[l>>2]=c[l>>2]|32;i=h;return}else if((k|0)==3){k=f+32|0;a[k]=a[33552]|0;a[k+1|0]=a[33553|0]|0;a[k+2|0]=a[33554|0]|0;a[k+3|0]=a[33555|0]|0;a[k+4|0]=a[33556|0]|0;a[k+5|0]=a[33557|0]|0;c[f+28>>2]=2;k=(a[g]&255)>>>1&7;a2(f+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=k<<16>>16==0?8:k&65535,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else{j=f+32|0;a[j]=a[36208]|0;a[j+1|0]=a[36209|0]|0;a[j+2|0]=a[36210|0]|0;c[f+28>>2]=1;j=((d[g]|0)<<8|(d[g+1|0]|0))&65535;a2(f+96|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=j,x)|0)|0;i=h;return}}function hN(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[34768]|0;a[e+1|0]=a[34769|0]|0;a[e+2|0]=a[34770|0]|0;a[e+3|0]=a[34771|0]|0;a[e+4|0]=a[34772|0]|0;a[e+5|0]=a[34773|0]|0;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,16);return}function hO(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0;h=i;j=f+12|0;k=(e[j>>1]|0)>>>3&7;if((k|0)==1){l=f+32|0;a[l]=a[35616]|0;a[l+1|0]=a[35617|0]|0;a[l+2|0]=a[35618|0]|0;a[l+3|0]=a[35619|0]|0;a[l+4|0]=a[35620|0]|0;a[l+5|0]=a[35621|0]|0;c[f+28>>2]=2;l=f+96|0;m=(a[g]&255)>>>1&7;n=m<<16>>16==0?8:m&65535;a2(l|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=n,x)|0)|0;n=f+160|0;l=b[j>>1]&7;a2(n|0,44048,(x=i,i=i+8|0,c[x>>2]=l,x)|0)|0;i=h;return}else if((k|0)==5){l=f+32|0;a[l]=a[35616]|0;a[l+1|0]=a[35617|0]|0;a[l+2|0]=a[35618|0]|0;a[l+3|0]=a[35619|0]|0;a[l+4|0]=a[35620|0]|0;a[l+5|0]=a[35621|0]|0;c[f+28>>2]=2;a2(f+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[g]|0)>>>1&7,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==2){l=f+32|0;a[l]=a[35312]|0;a[l+1|0]=a[35313|0]|0;a[l+2|0]=a[35314|0]|0;a[l+3|0]=a[35315|0]|0;a[l+4|0]=a[35316|0]|0;a[l+5|0]=a[35317|0]|0;a[l+6|0]=a[35318|0]|0;c[f+28>>2]=2;l=(a[g]&255)>>>1&7;a2(f+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=l<<16>>16==0?8:l&65535,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;l=f|0;c[l>>2]=c[l>>2]|32;i=h;return}else if((k|0)==3){l=f+32|0;a[l]=a[35032]|0;a[l+1|0]=a[35033|0]|0;a[l+2|0]=a[35034|0]|0;a[l+3|0]=a[35035|0]|0;a[l+4|0]=a[35036|0]|0;a[l+5|0]=a[35037|0]|0;c[f+28>>2]=2;l=(a[g]&255)>>>1&7;a2(f+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=l<<16>>16==0?8:l&65535,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==0){l=f+32|0;a[l]=a[35952]|0;a[l+1|0]=a[35953|0]|0;a[l+2|0]=a[35954|0]|0;a[l+3|0]=a[35955|0]|0;a[l+4|0]=a[35956|0]|0;a[l+5|0]=a[35957|0]|0;c[f+28>>2]=2;l=(a[g]&255)>>>1&7;a2(f+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=l<<16>>16==0?8:l&65535,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==7){l=f+32|0;a[l]=a[35032]|0;a[l+1|0]=a[35033|0]|0;a[l+2|0]=a[35034|0]|0;a[l+3|0]=a[35035|0]|0;a[l+4|0]=a[35036|0]|0;a[l+5|0]=a[35037|0]|0;c[f+28>>2]=2;a2(f+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[g]|0)>>>1&7,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==6){l=f+32|0;a[l]=a[35312]|0;a[l+1|0]=a[35313|0]|0;a[l+2|0]=a[35314|0]|0;a[l+3|0]=a[35315|0]|0;a[l+4|0]=a[35316|0]|0;a[l+5|0]=a[35317|0]|0;a[l+6|0]=a[35318|0]|0;c[f+28>>2]=2;a2(f+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[g]|0)>>>1&7,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;l=f|0;c[l>>2]=c[l>>2]|32;i=h;return}else if((k|0)==4){k=f+32|0;a[k]=a[35952]|0;a[k+1|0]=a[35953|0]|0;a[k+2|0]=a[35954|0]|0;a[k+3|0]=a[35955|0]|0;a[k+4|0]=a[35956|0]|0;a[k+5|0]=a[35957|0]|0;c[f+28>>2]=2;a2(f+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[g]|0)>>>1&7,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else{j=f+32|0;a[j]=a[36208]|0;a[j+1|0]=a[36209|0]|0;a[j+2|0]=a[36210|0]|0;c[f+28>>2]=1;j=((d[g]|0)<<8|(d[g+1|0]|0))&65535;a2(f+96|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=j,x)|0)|0;i=h;return}}function hP(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;j=f+12|0;k=(e[j>>1]|0)>>>3&7;if((k|0)==7){l=f+32|0;a[l]=a[39544]|0;a[l+1|0]=a[39545|0]|0;a[l+2|0]=a[39546|0]|0;a[l+3|0]=a[39547|0]|0;a[l+4|0]=a[39548|0]|0;a[l+5|0]=a[39549|0]|0;c[f+28>>2]=2;l=f+96|0;m=(d[g]|0)>>>1&7;a2(l|0,44048,(x=i,i=i+8|0,c[x>>2]=m,x)|0)|0;m=f+160|0;l=b[j>>1]&7;a2(m|0,44048,(x=i,i=i+8|0,c[x>>2]=l,x)|0)|0;i=h;return}else if((k|0)==2){l=f+32|0;a[l]=a[38792]|0;a[l+1|0]=a[38793|0]|0;a[l+2|0]=a[38794|0]|0;a[l+3|0]=a[38795|0]|0;a[l+4|0]=a[38796|0]|0;a[l+5|0]=a[38797|0]|0;a[l+6|0]=a[38798|0]|0;c[f+28>>2]=2;l=(a[g]&255)>>>1&7;a2(f+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=l<<16>>16==0?8:l&65535,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;l=f|0;c[l>>2]=c[l>>2]|32;i=h;return}else if((k|0)==5){l=f+32|0;a[l]=a[38160]|0;a[l+1|0]=a[38161|0]|0;a[l+2|0]=a[38162|0]|0;a[l+3|0]=a[38163|0]|0;a[l+4|0]=a[38164|0]|0;a[l+5|0]=a[38165|0]|0;c[f+28>>2]=2;a2(f+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[g]|0)>>>1&7,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==0){l=f+32|0;a[l]=a[37640]|0;a[l+1|0]=a[37641|0]|0;a[l+2|0]=a[37642|0]|0;a[l+3|0]=a[37643|0]|0;a[l+4|0]=a[37644|0]|0;a[l+5|0]=a[37645|0]|0;c[f+28>>2]=2;l=(a[g]&255)>>>1&7;a2(f+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=l<<16>>16==0?8:l&65535,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==4){l=f+32|0;a[l]=a[37640]|0;a[l+1|0]=a[37641|0]|0;a[l+2|0]=a[37642|0]|0;a[l+3|0]=a[37643|0]|0;a[l+4|0]=a[37644|0]|0;a[l+5|0]=a[37645|0]|0;c[f+28>>2]=2;a2(f+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[g]|0)>>>1&7,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==1){l=f+32|0;a[l]=a[38160]|0;a[l+1|0]=a[38161|0]|0;a[l+2|0]=a[38162|0]|0;a[l+3|0]=a[38163|0]|0;a[l+4|0]=a[38164|0]|0;a[l+5|0]=a[38165|0]|0;c[f+28>>2]=2;l=(a[g]&255)>>>1&7;a2(f+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=l<<16>>16==0?8:l&65535,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==6){l=f+32|0;a[l]=a[38792]|0;a[l+1|0]=a[38793|0]|0;a[l+2|0]=a[38794|0]|0;a[l+3|0]=a[38795|0]|0;a[l+4|0]=a[38796|0]|0;a[l+5|0]=a[38797|0]|0;a[l+6|0]=a[38798|0]|0;c[f+28>>2]=2;a2(f+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[g]|0)>>>1&7,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;l=f|0;c[l>>2]=c[l>>2]|32;i=h;return}else if((k|0)==3){k=f+32|0;a[k]=a[39544]|0;a[k+1|0]=a[39545|0]|0;a[k+2|0]=a[39546|0]|0;a[k+3|0]=a[39547|0]|0;a[k+4|0]=a[39548|0]|0;a[k+5|0]=a[39549|0]|0;c[f+28>>2]=2;k=(a[g]&255)>>>1&7;a2(f+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=k<<16>>16==0?8:k&65535,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else{j=f+32|0;a[j]=a[36208]|0;a[j+1|0]=a[36209|0]|0;a[j+2|0]=a[36210|0]|0;c[f+28>>2]=1;j=((d[g]|0)<<8|(d[g+1|0]|0))&65535;a2(f+96|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=j,x)|0)|0;i=h;return}}function hQ(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0;h=i;j=f+12|0;k=(e[j>>1]|0)>>>3&7;if((k|0)==1){l=f+32|0;a[l]=a[37184]|0;a[l+1|0]=a[37185|0]|0;a[l+2|0]=a[37186|0]|0;a[l+3|0]=a[37187|0]|0;a[l+4|0]=a[37188|0]|0;a[l+5|0]=a[37189|0]|0;c[f+28>>2]=2;l=f+96|0;m=(a[g]&255)>>>1&7;n=m<<16>>16==0?8:m&65535;a2(l|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=n,x)|0)|0;n=f+160|0;l=b[j>>1]&7;a2(n|0,44048,(x=i,i=i+8|0,c[x>>2]=l,x)|0)|0;i=h;return}else if((k|0)==5){l=f+32|0;a[l]=a[37184]|0;a[l+1|0]=a[37185|0]|0;a[l+2|0]=a[37186|0]|0;a[l+3|0]=a[37187|0]|0;a[l+4|0]=a[37188|0]|0;a[l+5|0]=a[37189|0]|0;c[f+28>>2]=2;a2(f+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[g]|0)>>>1&7,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==2){l=f+32|0;a[l]=a[36960]|0;a[l+1|0]=a[36961|0]|0;a[l+2|0]=a[36962|0]|0;a[l+3|0]=a[36963|0]|0;a[l+4|0]=a[36964|0]|0;a[l+5|0]=a[36965|0]|0;a[l+6|0]=a[36966|0]|0;c[f+28>>2]=2;l=(a[g]&255)>>>1&7;a2(f+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=l<<16>>16==0?8:l&65535,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;l=f|0;c[l>>2]=c[l>>2]|32;i=h;return}else if((k|0)==7){l=f+32|0;a[l]=a[36592]|0;a[l+1|0]=a[36593|0]|0;a[l+2|0]=a[36594|0]|0;a[l+3|0]=a[36595|0]|0;a[l+4|0]=a[36596|0]|0;a[l+5|0]=a[36597|0]|0;c[f+28>>2]=2;a2(f+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[g]|0)>>>1&7,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==3){l=f+32|0;a[l]=a[36592]|0;a[l+1|0]=a[36593|0]|0;a[l+2|0]=a[36594|0]|0;a[l+3|0]=a[36595|0]|0;a[l+4|0]=a[36596|0]|0;a[l+5|0]=a[36597|0]|0;c[f+28>>2]=2;l=(a[g]&255)>>>1&7;a2(f+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=l<<16>>16==0?8:l&65535,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==0){l=f+32|0;a[l]=a[37384]|0;a[l+1|0]=a[37385|0]|0;a[l+2|0]=a[37386|0]|0;a[l+3|0]=a[37387|0]|0;a[l+4|0]=a[37388|0]|0;a[l+5|0]=a[37389|0]|0;c[f+28>>2]=2;l=(a[g]&255)>>>1&7;a2(f+96|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=l<<16>>16==0?8:l&65535,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else if((k|0)==6){l=f+32|0;a[l]=a[36960]|0;a[l+1|0]=a[36961|0]|0;a[l+2|0]=a[36962|0]|0;a[l+3|0]=a[36963|0]|0;a[l+4|0]=a[36964|0]|0;a[l+5|0]=a[36965|0]|0;a[l+6|0]=a[36966|0]|0;c[f+28>>2]=2;a2(f+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[g]|0)>>>1&7,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;l=f|0;c[l>>2]=c[l>>2]|32;i=h;return}else if((k|0)==4){k=f+32|0;a[k]=a[37384]|0;a[k+1|0]=a[37385|0]|0;a[k+2|0]=a[37386|0]|0;a[k+3|0]=a[37387|0]|0;a[k+4|0]=a[37388|0]|0;a[k+5|0]=a[37389|0]|0;c[f+28>>2]=2;a2(f+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(d[g]|0)>>>1&7,x)|0)|0;a2(f+160|0,44048,(x=i,i=i+8|0,c[x>>2]=b[j>>1]&7,x)|0)|0;i=h;return}else{j=f+32|0;a[j]=a[36208]|0;a[j+1|0]=a[36209|0]|0;a[j+2|0]=a[36210|0]|0;c[f+28>>2]=1;j=((d[g]|0)<<8|(d[g+1|0]|0))&65535;a2(f+96|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=j,x)|0)|0;i=h;return}}function hR(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[37640]|0;a[e+1|0]=a[37641|0]|0;a[e+2|0]=a[37642|0]|0;a[e+3|0]=a[37643|0]|0;a[e+4|0]=a[37644|0]|0;a[e+5|0]=a[37645|0]|0;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,16);return}function hS(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[37904]|0;a[e+1|0]=a[37905|0]|0;a[e+2|0]=a[37906|0]|0;a[e+3|0]=a[37907|0]|0;a[e+4|0]=a[37908|0]|0;a[e+5|0]=a[37909|0]|0;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,16);return}function hT(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[38160]|0;a[e+1|0]=a[38161|0]|0;a[e+2|0]=a[38162|0]|0;a[e+3|0]=a[38163|0]|0;a[e+4|0]=a[38164|0]|0;a[e+5|0]=a[38165|0]|0;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,16);return}function hU(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[38480]|0;a[e+1|0]=a[38481|0]|0;a[e+2|0]=a[38482|0]|0;a[e+3|0]=a[38483|0]|0;a[e+4|0]=a[38484|0]|0;a[e+5|0]=a[38485|0]|0;a[e+6|0]=a[38486|0]|0;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,16);d=b|0;c[d>>2]=c[d>>2]|32;return}function hV(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[38792]|0;a[e+1|0]=a[38793|0]|0;a[e+2|0]=a[38794|0]|0;a[e+3|0]=a[38795|0]|0;a[e+4|0]=a[38796|0]|0;a[e+5|0]=a[38797|0]|0;a[e+6|0]=a[38798|0]|0;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,16);d=b|0;c[d>>2]=c[d>>2]|32;return}function hW(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[39104]|0;a[e+1|0]=a[39105|0]|0;a[e+2|0]=a[39106|0]|0;a[e+3|0]=a[39107|0]|0;a[e+4|0]=a[39108|0]|0;a[e+5|0]=a[39109|0]|0;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,16);return}function hX(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[39544]|0;a[e+1|0]=a[39545|0]|0;a[e+2|0]=a[39546|0]|0;a[e+3|0]=a[39547|0]|0;a[e+4|0]=a[39548|0]|0;a[e+5|0]=a[39549|0]|0;c[b+28>>2]=1;ik(b,b+96|0,d,a[d+1|0]&63,16);return}function hY(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[39928]|0;a[e+1|0]=a[39929|0]|0;a[e+2|0]=a[39930|0]|0;a[e+3|0]=a[39931|0]|0;a[e+4|0]=a[39932|0]|0;a[e+5|0]=a[39933|0]|0;c[b+28>>2]=1;h4(b,b+96|0,d,33,8);return}function hZ(b,d){b=b|0;d=d|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[40152]|0;a[g+1|0]=a[40153|0]|0;a[g+2|0]=a[40154|0]|0;a[g+3|0]=a[40155|0]|0;a[g+4|0]=a[40156|0]|0;a[g+5|0]=a[40157|0]|0;a[g+6|0]=a[40158|0]|0;c[b+28>>2]=2;h4(b,b+96|0,d,33,8);a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(e[b+14>>1]|0)>>>12&7,x)|0)|0;i=f;return}function h_(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[40400]|0;a[e+1|0]=a[40401|0]|0;a[e+2|0]=a[40402|0]|0;a[e+3|0]=a[40403|0]|0;a[e+4|0]=a[40404|0]|0;a[e+5|0]=a[40405|0]|0;c[b+28>>2]=1;h4(b,b+96|0,d,33,8);return}function h$(b,d){b=b|0;d=d|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[40616]|0;a[g+1|0]=a[40617|0]|0;a[g+2|0]=a[40618|0]|0;a[g+3|0]=a[40619|0]|0;a[g+4|0]=a[40620|0]|0;a[g+5|0]=a[40621|0]|0;a[g+6|0]=a[40622|0]|0;c[b+28>>2]=2;h4(b,b+96|0,d,33,8);a2(b+160|0,44048,(x=i,i=i+8|0,c[x>>2]=(e[b+14>>1]|0)>>>12&7,x)|0)|0;i=f;return}function h0(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[40864]|0;a[e+1|0]=a[40865|0]|0;a[e+2|0]=a[40866|0]|0;a[e+3|0]=a[40867|0]|0;a[e+4|0]=a[40868|0]|0;a[e+5|0]=a[40869|0]|0;c[b+28>>2]=1;h4(b,b+96|0,d,33,8);return}function h1(b,d){b=b|0;d=d|0;var e=0;e=b+32|0;a[e]=a[41144]|0;a[e+1|0]=a[41145|0]|0;a[e+2|0]=a[41146|0]|0;a[e+3|0]=a[41147|0]|0;a[e+4|0]=a[41148|0]|0;a[e+5|0]=a[41149|0]|0;c[b+28>>2]=1;h4(b,b+96|0,d,33,8);return}function h2(b,d){b=b|0;d=d|0;var f=0,g=0;f=i;g=b+32|0;a[g]=a[52232]|0;a[g+1|0]=a[52233|0]|0;a[g+2|0]=a[52234|0]|0;a[g+3|0]=a[52235|0]|0;a[g+4|0]=a[52236|0]|0;a[g+5|0]=a[52237|0]|0;c[b+28>>2]=2;a2(b+96|0,44048,(x=i,i=i+8|0,c[x>>2]=(e[b+14>>1]|0)>>>12&7,x)|0)|0;h4(b,b+160|0,d,33,8);i=f;return}function h3(a,b){a=a|0;b=b|0;var d=0;b=i;i=i+16|0;d=b|0;a2(d|0,32808,(x=i,i=i+8|0,c[x>>2]=e[a+12>>1]|0,x)|0)|0;v_(a+32|0,d|0)|0;c[a+28>>2]=0;d=a|0;c[d>>2]=c[d>>2]|4;i=b;return}function h4(f,g,h,j,k){f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,z=0,A=0;l=i;i=i+16|0;m=l|0;n=l+8|0;if((j|0)==6){o=(d[h]|0)>>>1&7;a2(g|0,44048,(x=i,i=i+8|0,c[x>>2]=o,x)|0)|0;i=l;return}else if((j|0)==28){o=g;y=5264213;a[o]=y&255;y=y>>8;a[o+1|0]=y&255;y=y>>8;a[o+2|0]=y&255;y=y>>8;a[o+3|0]=y&255;i=l;return}else if((j|0)==29){o=((d[h+2|0]|0)<<8|(d[h+3|0]|0))&4095;if((o|0)==0){p=f|0;c[p>>2]=c[p>>2]|64;q=48912}else if((o|0)==1){p=f|0;c[p>>2]=c[p>>2]|64;q=48512}else if((o|0)==2048){p=f|0;c[p>>2]=c[p>>2]|64;q=51072}else if((o|0)==2049){p=f|0;c[p>>2]=c[p>>2]|64;q=48088}else{a2(g|0,47784,(x=i,i=i+8|0,c[x>>2]=o,x)|0)|0;o=f|0;c[o>>2]=c[o>>2]|64;i=l;return}o=q;q=g;y=d[o]|d[o+1|0]<<8|d[o+2|0]<<16|d[o+3|0]<<24|0;a[q]=y&255;y=y>>8;a[q+1|0]=y&255;y=y>>8;a[q+2|0]=y&255;y=y>>8;a[q+3|0]=y&255;i=l;return}else if((j|0)==2){q=((d[h+2|0]|0)<<8|(d[h+3|0]|0))&65535;a2(g|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=q,x)|0)|0;i=l;return}else if((j|0)==31){q=e[f+14>>1]|0;a2(g|0,50672,(x=i,i=i+16|0,c[x>>2]=q&7,c[x+8>>2]=q>>>12&7,x)|0)|0;i=l;return}else if((j|0)==32|(j|0)==34){a2(g|0,44048,(x=i,i=i+8|0,c[x>>2]=(e[f+14>>1]|0)>>>12&7,x)|0)|0;i=l;return}else if((j|0)==33){q=f+8|0;o=c[q>>2]|0;p=o<<1;r=(d[h+p|0]|0)<<8|(d[h+(p|1)|0]|0);p=o+1|0;c[q>>2]=p;b[f+12+(p<<1)>>1]=r;ik(f,g,h,a[h+1|0]&63,8);r=vX(g|0)|0;a[g+r|0]=32;p=r+2|0;q=g+p|0;a[g+(r+1)|0]=123;r=f+14|0;o=e[r>>1]|0;s=o>>>6;if((o&2048|0)==0){o=s&31;a2(q|0,49944,(x=i,i=i+8|0,c[x>>2]=o,x)|0)|0}else{o=s&7;a2(q|0,44048,(x=i,i=i+8|0,c[x>>2]=o,x)|0)|0}o=(vX(q|0)|0)+p|0;p=o+1|0;q=g+p|0;a[g+o|0]=58;o=b[r>>1]|0;r=o&31;s=(r|0)==0?32:r;if((o&32)==0){a2(q|0,49944,(x=i,i=i+8|0,c[x>>2]=s,x)|0)|0}else{o=s&7;a2(q|0,44048,(x=i,i=i+8|0,c[x>>2]=o,x)|0)|0}o=g+((vX(q|0)|0)+p)|0;y=125;a[o]=y&255;y=y>>8;a[o+1|0]=y&255;i=l;return}else if((j|0)==8){a2(g|0,40688,(x=i,i=i+8|0,c[x>>2]=(d[h]|0)>>>1&7,x)|0)|0;i=l;return}else if((j|0)==5){a2(g|0,44048,(x=i,i=i+8|0,c[x>>2]=b[f+12>>1]&7,x)|0)|0;i=l;return}else if((j|0)==0){a[g]=0;i=l;return}else if((j|0)==13){a2(g|0,30304,(x=i,i=i+8|0,c[x>>2]=(e[f+12>>1]|0)>>>9&7,x)|0)|0;i=l;return}else if((j|0)==14){o=((d[h+2|0]|0)<<8|(d[h+3|0]|0))&65535;p=(o&32768|0)!=0;q=b[f+12>>1]&7;a2(g|0,57568,(x=i,i=i+32|0,c[x>>2]=p?56440:63e3,c[x+8>>2]=41400,c[x+16>>2]=(p?-o|0:o)&65535,c[x+24>>2]=q,x)|0)|0;q=f+8|0;c[q>>2]=(c[q>>2]|0)+1;i=l;return}else if((j|0)==17){q=(((d[h+2|0]|0)<<8|(d[h+3|0]|0))<<8|(d[h+4|0]|0))<<8|(d[h+5|0]|0);a2(g|0,54160,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=q,x)|0)|0;q=f+8|0;c[q>>2]=(c[q>>2]|0)+2;i=l;return}else if((j|0)==18){q=(a[h]&255)>>>1&7;a2(g|0,53600,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=q<<16>>16==0?8:q&65535,x)|0)|0;i=l;return}else if((j|0)==25){q=d[h+2|0]|0;o=d[h+3|0]|0;c[m>>2]=1;a[g]=0;p=(((((((q&65535)>>>2&1|q&2|((((((((o&65535)>>>2&1|o&2|((q<<8|o)<<1|o&1)<<2)<<1|(o&65535)>>>3&1)<<1|(o&65535)>>>4&1)<<1|(o&65535)>>>5&1)<<1|(o&65535)>>>6&1)<<1|(o&65535)>>>7)<<1|q&1)<<2)<<1|(q&65535)>>>3&1)<<1|(q&65535)>>>4&1)<<1|(q&65535)>>>5&1)<<1|(q&65535)>>>6&1)<<1|(q&65535)>>>7)&65535;q=0;o=0;s=0;while(1){if((q|0)!=8|(s|0)==0){t=s}else{il(g,o,s,m);t=0}r=(t|0)==0;do{if((1<<q&p|0)==0){if(r){u=0;v=o;break}il(g,o,t,m);u=0;v=o}else{u=t+1|0;v=r?q:o}}while(0);r=q+1|0;if(r>>>0<16){q=r;o=v;s=u}else{break}}if((u|0)!=0){il(g,v,u,m)}m=f+8|0;c[m>>2]=(c[m>>2]|0)+1;i=l;return}else if((j|0)==26){m=g;y=5391171;a[m]=y&255;y=y>>8;a[m+1|0]=y&255;y=y>>8;a[m+2|0]=y&255;y=y>>8;a[m+3|0]=y&255;i=l;return}else if((j|0)==27){a[g]=a[51552]|0;a[g+1|0]=a[51553|0]|0;a[g+2|0]=a[51554|0]|0;i=l;return}else if((j|0)==4){m=((d[h]|0)<<8|(d[h+1|0]|0))&65535;ik(f,g,h,m>>>3&56|m>>>9&7,k);i=l;return}else if((j|0)==7){a2(g|0,40688,(x=i,i=i+8|0,c[x>>2]=b[f+12>>1]&7,x)|0)|0;i=l;return}else if((j|0)==1){m=((d[h]|0)<<8|(d[h+1|0]|0))&65535;a2(g|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=m,x)|0)|0;i=l;return}else if((j|0)==19){m=b[f+12>>1]&15;a2(g|0,54944,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=m,x)|0)|0;i=l;return}else if((j|0)==20){m=e[f+12>>1]|0;a2(g|0,54160,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=(m&128|0)!=0?m|-256:m&255,x)|0)|0;i=l;return}else if((j|0)==23){m=f+8|0;u=c[m>>2]|0;v=u<<1;s=(((d[h+v|0]|0)<<8|(d[h+(v|1)|0]|0))<<8|(d[h+(v+2)|0]|0))<<8|(d[h+(v+3)|0]|0);c[m>>2]=u+2;u=(c[f+4>>2]|0)+2+s|0;a2(g|0,52760,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=u,x)|0)|0;i=l;return}else if((j|0)==11){a2(g|0,31176,(x=i,i=i+8|0,c[x>>2]=(e[f+12>>1]|0)>>>9&7,x)|0)|0;i=l;return}else if((j|0)==12){a2(g|0,30304,(x=i,i=i+8|0,c[x>>2]=b[f+12>>1]&7,x)|0)|0;i=l;return}else if((j|0)==21){u=d[h+1|0]|0;s=(c[f+4>>2]|0)+2+((u&128|0)!=0?u|-256:u)|0;a2(g|0,52760,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=s,x)|0)|0;i=l;return}else if((j|0)==22){s=f+8|0;u=c[s>>2]|0;m=u<<1;v=(d[h+m|0]|0)<<8|(d[h+(m|1)|0]|0);c[s>>2]=u+1;u=v&65535;v=(c[f+4>>2]|0)+2+((u&32768|0)!=0?u|-65536:u)|0;a2(g|0,52760,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=v,x)|0)|0;i=l;return}else if((j|0)==3){ik(f,g,h,a[h+1|0]&63,k);i=l;return}else if((j|0)==15){k=d[h+3|0]|0;a2(g|0,54944,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=k,x)|0)|0;k=f+8|0;c[k>>2]=(c[k>>2]|0)+1;i=l;return}else if((j|0)==16){k=((d[h+2|0]|0)<<8|(d[h+3|0]|0))&65535;a2(g|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=k,x)|0)|0;k=f+8|0;c[k>>2]=(c[k>>2]|0)+1;i=l;return}else if((j|0)==10){a2(g|0,31176,(x=i,i=i+8|0,c[x>>2]=b[f+12>>1]&7,x)|0)|0;i=l;return}else if((j|0)==9){k=d[h+2|0]|0;a2(g|0,37712,(x=i,i=i+16|0,c[x>>2]=(k&128|0)!=0?34848:32296,c[x+8>>2]=k>>>4&7,x)|0)|0;i=l;return}else if((j|0)==24){k=(d[h+2|0]|0)<<8|(d[h+3|0]|0);c[n>>2]=1;a[g]=0;h=k&65535;k=0;v=0;u=0;while(1){if((k|0)!=8|(u|0)==0){w=u}else{il(g,v,u,n);w=0}s=(w|0)==0;do{if((1<<k&h|0)==0){if(s){z=0;A=v;break}il(g,v,w,n);z=0;A=v}else{z=w+1|0;A=s?k:v}}while(0);s=k+1|0;if(s>>>0<16){k=s;v=A;u=z}else{break}}if((z|0)!=0){il(g,A,z,n)}n=f+8|0;c[n>>2]=(c[n>>2]|0)+1;i=l;return}else if((j|0)==30){j=e[f+14>>1]|0;a2(g|0,50672,(x=i,i=i+16|0,c[x>>2]=j&7,c[x+8>>2]=j>>>12&7,x)|0)|0;i=l;return}else{a[g]=0;i=l;return}}function h5(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[a+4>>2]=b;c[a+8>>2]=d;c[a+12>>2]=e;c[a+16>>2]=f;c[a+20>>2]=g;c[a+24>>2]=h;c[a+28>>2]=i;return}function h6(a,b,d){a=a|0;b=b|0;d=d|0;c[a+32>>2]=b;c[a+36>>2]=(b|0)==0?0:d;return}function h7(a,b,d){a=a|0;b=b|0;d=d|0;c[a+40>>2]=b;c[a+44>>2]=d;return}function h8(a,b,d){a=a|0;b=b|0;d=d|0;c[a+60>>2]=b;c[a+64>>2]=d;return}function h9(a,b){a=a|0;b=b|0;var d=0;d=a|0;a=c[d>>2]|0;c[d>>2]=(b|0)==0?a|1:a&-2;return}function ia(a){a=a|0;return c[a+392>>2]|0}function ib(a){a=a|0;return c[a+396>>2]|0}function ic(a){a=a|0;return c[a+372>>2]|0}function id(b,c){b=b|0;c=c|0;a[b+335|0]=c&3;return}function ie(a){a=a|0;return c[a+376>>2]|0}function ig(a){a=a|0;return c[a+384>>2]|0}function ih(a){a=a|0;return c[a+388>>2]|0}function ii(a,b){a=a|0;b=b|0;var d=0;if(b>>>0>31){d=0;return d|0}d=c[a+200+(((c[a+196>>2]|0)-b&31)<<2)>>2]|0;return d|0}function ij(a){a=a|0;return b[a+328>>1]|0}function ik(a,b,e,f,g){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;h=i;j=f>>>3&7;if((j|0)==1){k=f&7;a2(b|0,40688,(x=i,i=i+8|0,c[x>>2]=k,x)|0)|0;i=h;return}else if((j|0)==5){k=a+8|0;l=c[k>>2]|0;m=l<<1;n=((d[e+m|0]|0)<<8|(d[e+(m|1)|0]|0))&65535;c[k>>2]=l+1;l=(n&32768|0)!=0;a2(b|0,57568,(x=i,i=i+32|0,c[x>>2]=l?56440:63e3,c[x+8>>2]=41400,c[x+16>>2]=(l?-n|0:n)&65535,c[x+24>>2]=f&7,x)|0)|0;i=h;return}else if((j|0)==3){a2(b|0,31176,(x=i,i=i+8|0,c[x>>2]=f&7,x)|0)|0;i=h;return}else if((j|0)==0){a2(b|0,44048,(x=i,i=i+8|0,c[x>>2]=f&7,x)|0)|0;i=h;return}else if((j|0)==2){a2(b|0,46616,(x=i,i=i+8|0,c[x>>2]=f&7,x)|0)|0;i=h;return}else if((j|0)==6){n=a+8|0;l=c[n>>2]|0;k=l<<1;m=((d[e+k|0]|0)<<8|(d[e+(k|1)|0]|0))&65535;c[n>>2]=l+1;if((m&256|0)!=0){im(a,b,e);i=h;return}l=(m&128|0)!=0;a2(b|0,46088,(x=i,i=i+64|0,c[x>>2]=l?56440:63e3,c[x+8>>2]=41400,c[x+16>>2]=(l?-m|0:m)&255,c[x+24>>2]=f&7,c[x+32>>2]=(m&32768|0)!=0?34848:32296,c[x+40>>2]=m>>>12&7,c[x+48>>2]=(m&2048|0)!=0?45600:45296,c[x+56>>2]=1<<(m>>>9&3),x)|0)|0;if((m&1536|0)==0){i=h;return}m=a|0;c[m>>2]=c[m>>2]|128;i=h;return}else if((j|0)==7){m=f&7;if((m|0)==0){l=a+8|0;n=c[l>>2]|0;k=n<<1;o=((d[e+k|0]|0)<<8|(d[e+(k|1)|0]|0))&65535;c[l>>2]=n+1;n=(o&32768|0)!=0;l=n?56440:63e3;k=(n?-o|0:o)&65535;a2(b|0,44960,(x=i,i=i+24|0,c[x>>2]=l,c[x+8>>2]=41400,c[x+16>>2]=k,x)|0)|0;i=h;return}else if((m|0)==1){k=a+8|0;l=c[k>>2]|0;o=l<<1;n=((d[e+o|0]|0)<<8|(d[e+(o|1)|0]|0))&65535;o=l+1|0;c[k>>2]=o;p=o<<1;o=((d[e+p|0]|0)<<8|(d[e+(p|1)|0]|0))&65535;c[k>>2]=l+2;a2(b|0,52760,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=o|n<<16,x)|0)|0;i=h;return}else if((m|0)==2){n=a+8|0;o=c[n>>2]|0;l=o<<1;k=((d[e+l|0]|0)<<8|(d[e+(l|1)|0]|0))&65535;c[n>>2]=o+1;o=(c[a+4>>2]|0)+2+((k&32768|0)!=0?k|-65536:k)|0;a2(b|0,44616,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=o,x)|0)|0;i=h;return}else if((m|0)==3){o=a+8|0;k=c[o>>2]|0;n=k<<1;l=((d[e+n|0]|0)<<8|(d[e+(n|1)|0]|0))&65535;c[o>>2]=k+1;if((l&256|0)!=0){im(a,b,e);i=h;return}k=(l&128|0)!=0;a2(b|0,44240,(x=i,i=i+56|0,c[x>>2]=k?56440:63e3,c[x+8>>2]=41400,c[x+16>>2]=(k?-l|0:l)&255,c[x+24>>2]=(l&32768|0)!=0?34848:32296,c[x+32>>2]=l>>>12&7,c[x+40>>2]=(l&2048|0)!=0?45600:45296,c[x+48>>2]=1<<(l>>>9&3),x)|0)|0;if((l&1536|0)==0){i=h;return}l=a|0;c[l>>2]=c[l>>2]|128;i=h;return}else if((m|0)==4){if((g|0)==8){m=a+8|0;l=c[m>>2]|0;k=d[e+(l<<1|1)|0]|0;c[m>>2]=l+1;a2(b|0,54944,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=k,x)|0)|0;i=h;return}else if((g|0)==16){k=a+8|0;l=c[k>>2]|0;m=l<<1;o=((d[e+m|0]|0)<<8|(d[e+(m|1)|0]|0))&65535;c[k>>2]=l+1;a2(b|0,47512,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=o,x)|0)|0;i=h;return}else if((g|0)==32){g=a+8|0;a=c[g>>2]|0;o=a<<1;l=((d[e+o|0]|0)<<8|(d[e+(o|1)|0]|0))&65535;o=a+1|0;c[g>>2]=o;k=o<<1;o=((d[e+k|0]|0)<<8|(d[e+(k|1)|0]|0))&65535;c[g>>2]=a+2;a2(b|0,54160,(x=i,i=i+16|0,c[x>>2]=41400,c[x+8>>2]=o|l<<16,x)|0)|0;i=h;return}else{i=h;return}}else{a2(b|0,43960,(x=i,i=i+8|0,c[x>>2]=f&63,x)|0)|0;i=h;return}}else if((j|0)==4){a2(b|0,30304,(x=i,i=i+8|0,c[x>>2]=f&7,x)|0)|0;i=h;return}else{a2(b|0,43960,(x=i,i=i+8|0,c[x>>2]=f&63,x)|0)|0;i=h;return}}function il(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+32|0;h=g|0;j=d>>>0<8;k=j?d:d-8|0;d=j?32296:34848;if((c[f>>2]|0)==0){j=b+(vX(b|0)|0)|0;y=47;a[j]=y&255;y=y>>8;a[j+1|0]=y&255}if(e>>>0>2){j=h|0;l=e-1+k|0;a2(j|0,47184,(x=i,i=i+32|0,c[x>>2]=d,c[x+8>>2]=k,c[x+16>>2]=d,c[x+24>>2]=l,x)|0)|0;m=h|0;n=vY(b|0,m|0)|0;c[f>>2]=0;i=g;return}l=h|0;if((e|0)==2){e=k+1|0;a2(l|0,46928,(x=i,i=i+32|0,c[x>>2]=d,c[x+8>>2]=k,c[x+16>>2]=d,c[x+24>>2]=e,x)|0)|0;m=h|0;n=vY(b|0,m|0)|0;c[f>>2]=0;i=g;return}else{a2(l|0,37712,(x=i,i=i+16|0,c[x>>2]=d,c[x+8>>2]=k,x)|0)|0;m=h|0;n=vY(b|0,m|0)|0;c[f>>2]=0;i=g;return}}function im(f,g,h){f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,y=0,z=0,A=0,B=0,C=0;j=i;i=i+32|0;k=j|0;l=j+16|0;m=l|0;n=i;i=i+16|0;o=n|0;p=i;i=i+16|0;q=p|0;r=i;i=i+16|0;s=e[f+14>>1]|0;t=(s&64|0)==0;do{if((s&128|0)==0){u=e[f+12>>1]|0;v=k;if((u&56|0)==56){a[v]=a[43744]|0;a[v+1|0]=a[43745|0]|0;a[v+2|0]=a[43746|0]|0;break}else{w=u&7;a2(v|0,40688,(x=i,i=i+8|0,c[x>>2]=w,x)|0)|0;break}}else{b[k>>1]=45}}while(0);if(t){t=l;w=(s&32768|0)!=0?34848:32296;v=s>>>12&7;u=(s&2048|0)!=0?45600:45296;a2(t|0,43464,(x=i,i=i+24|0,c[x>>2]=w,c[x+8>>2]=v,c[x+16>>2]=u,x)|0)|0}else{b[m>>1]=45}m=s>>>9&3;u=r|0;if((m|0)==0){a[u]=0}else{r=1<<m;a2(u|0,43144,(x=i,i=i+8|0,c[x>>2]=r,x)|0)|0}r=s>>>4&3;if((r|0)==0|(r|0)==1){b[o>>1]=45}else if((r|0)==2){m=f+8|0;v=c[m>>2]|0;w=v<<1;t=((d[h+w|0]|0)<<8|(d[h+(w|1)|0]|0))&65535;c[m>>2]=v+1;v=(t&32768|0)!=0;if(v){y=-t&65535}else{y=t}a2(n|0,44960,(x=i,i=i+24|0,c[x>>2]=v?56440:63e3,c[x+8>>2]=41400,c[x+16>>2]=y,x)|0)|0}else if((r|0)==3){r=f+8|0;y=c[r>>2]|0;v=y<<1;t=((d[h+v|0]|0)<<8|(d[h+(v|1)|0]|0))&65535;v=y+1|0;c[r>>2]=v;m=v<<1;v=((d[h+m|0]|0)<<8|(d[h+(m|1)|0]|0))&65535;c[r>>2]=y+2;y=v|t<<16;t=(y|0)<0;a2(n|0,42680,(x=i,i=i+24|0,c[x>>2]=t?56440:63e3,c[x+8>>2]=41400,c[x+16>>2]=t?-y|0:y,x)|0)|0}y=s&3;if((y|0)==0|(y|0)==1){b[q>>1]=45}else if((y|0)==2){t=f+8|0;n=c[t>>2]|0;v=n<<1;r=((d[h+v|0]|0)<<8|(d[h+(v|1)|0]|0))&65535;c[t>>2]=n+1;n=(r&32768|0)!=0;if(n){z=-r&65535}else{z=r}a2(p|0,44960,(x=i,i=i+24|0,c[x>>2]=n?56440:63e3,c[x+8>>2]=41400,c[x+16>>2]=z,x)|0)|0}else if((y|0)==3){y=f+8|0;z=c[y>>2]|0;n=z<<1;r=((d[h+n|0]|0)<<8|(d[h+(n|1)|0]|0))&65535;n=z+1|0;c[y>>2]=n;t=n<<1;n=((d[h+t|0]|0)<<8|(d[h+(t|1)|0]|0))&65535;c[y>>2]=z+2;z=n|r<<16;r=(z|0)<0;a2(p|0,42680,(x=i,i=i+24|0,c[x>>2]=r?56440:63e3,c[x+8>>2]=41400,c[x+16>>2]=r?-z|0:z,x)|0)|0}if((s&4|0)==0){a2(g|0,41776,(x=i,i=i+40|0,c[x>>2]=k,c[x+8>>2]=o,c[x+16>>2]=l,c[x+24>>2]=u,c[x+32>>2]=q,x)|0)|0;A=f|0;B=c[A>>2]|0;C=B|128;c[A>>2]=C;i=j;return}else{a2(g|0,42096,(x=i,i=i+40|0,c[x>>2]=k,c[x+8>>2]=o,c[x+16>>2]=l,c[x+24>>2]=u,c[x+32>>2]=q,x)|0)|0;A=f|0;B=c[A>>2]|0;C=B|128;c[A>>2]=C;i=j;return}}function io(){var d=0,e=0,f=0,g=0,h=0;d=vP(4528)|0;e=d;if((d|0)==0){f=0;return f|0}g=d+334|0;vV(d|0,0,50);vV(d+52|0,0,36);a[g]=1;a[d+335|0]=2;c[d+364>>2]=0;a[d+368|0]=0;c[d+372>>2]=1;c[d+376>>2]=0;c[d+380>>2]=0;c[d+384>>2]=0;c[d+388>>2]=30176;c[d+392>>2]=0;c[d+396>>2]=0;iN(e);b[d+166>>1]=8192;h=d+148|0;vV(d+88|0,0,64);if((a[g]|0)==0){c[h>>2]=0;c[d+172>>2]=0}else{c[d+168>>2]=0;c[h>>2]=0}c[d+152>>2]=0;vV(d+176|0,0,156);f=e;return f|0}function ip(a){a=a|0;c[a>>2]=0;iN(a);return}function iq(a){a=a|0;c[a>>2]=2;iN(a);return}function ir(a){a=a|0;c[a>>2]=7;lo(a);return}function is(d,e){d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;f=d+166|0;if(((b[f>>1]^e)&8192)==0){g=e&-22753;b[f>>1]=g;return}h=e&8192;i=d+334|0;j=d+148|0;k=c[j>>2]|0;if((a[i]|0)==0){l=d+168|0;c[l>>2]=k;m=l;n=d+172|0}else{l=d+172|0;c[l>>2]=k;m=d+168|0;n=l}c[j>>2]=c[(h<<16>>16!=0?n:m)>>2];a[i]=(h&65535)>>>13&255;g=e&-22753;b[f>>1]=g;return}function it(f,g,h){f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;i=(a[g]|0)==37?g+1|0:g;if((aQ(i|0,51008)|0)==0){c[h>>2]=c[f+152>>2];j=0;return j|0}if((aQ(i|0,46888)|0)==0){c[h>>2]=c[f+200+((c[f+196>>2]&31)<<2)>>2];j=0;return j|0}g=a[i]|0;do{if(g<<24>>24==111){if((a[i+1|0]|0)!=112){break}k=a[i+2|0]|0;if((k-48&255)<10){l=i;m=0;n=k;while(1){o=(m*10|0)-48+(n<<24>>24)|0;p=a[l+3|0]|0;if((p-48&255)<10){l=l+1|0;m=o;n=p}else{break}}q=o<<1;r=p}else{q=0;r=k}if(r<<24>>24!=0){j=1;return j|0}n=(c[f+152>>2]|0)+q&16777215;m=n+1|0;if(m>>>0<(c[f+36>>2]|0)>>>0){l=c[f+32>>2]|0;s=d[l+n|0]<<8|d[l+m|0]}else{s=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}c[h>>2]=s&65535;j=0;return j|0}}while(0);if((aQ(i|0,43424)|0)==0){c[h>>2]=e[f+166>>1]|0;j=0;return j|0}if((aQ(i|0,40112)|0)==0){c[h>>2]=c[f+148>>2];j=0;return j|0}if((aQ(i|0,37152)|0)==0){c[h>>2]=b[f+166>>1]&255;j=0;return j|0}if((aQ(i|0,34168)|0)==0){c[h>>2]=c[((a[f+334|0]|0)==0?f+148|0:f+168|0)>>2];j=0;return j|0}if((aQ(i|0,31976)|0)==0){c[h>>2]=c[((a[f+334|0]|0)==0?f+172|0:f+148|0)>>2];j=0;return j|0}if((g<<24>>24|0)==100|(g<<24>>24|0)==68){t=100}else if((g<<24>>24|0)==97|(g<<24>>24|0)==65){t=97}else{j=1;return j|0}g=i+1|0;s=a[g]|0;if((s-48&255)<10){q=0;r=g;p=s;while(1){u=(q*10|0)-48+(p<<24>>24)|0;v=r+1|0;s=a[v]|0;if((s-48&255)<10){q=u;r=v;p=s}else{break}}w=r;x=u&7;y=v}else{w=i;x=0;y=g}if((t|0)==97){z=f+120+(x<<2)|0}else{z=f+88+(x<<2)|0}x=c[z>>2]|0;c[h>>2]=x;z=a[y]|0;if(z<<24>>24==46){y=a[w+2|0]|0;if((y|0)==98|(y|0)==66){c[h>>2]=x&255}else if((y|0)==119|(y|0)==87){c[h>>2]=x&65535}else if(!((y|0)==108|(y|0)==76)){j=1;return j|0}A=a[w+3|0]|0}else{A=z}j=A<<24>>24!=0|0;return j|0}function iu(d,e,f){d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;g=(a[e]|0)==37?e+1|0:e;if((aQ(g|0,51008)|0)==0){iv(d,f);h=0;return h|0}if((aQ(g|0,43424)|0)==0){e=f&65535;i=d+166|0;if(((b[i>>1]^e)&8192)!=0){j=e&8192;k=d+334|0;l=d+148|0;m=c[l>>2]|0;if((a[k]|0)==0){n=d+168|0;c[n>>2]=m;o=n;p=d+172|0}else{n=d+172|0;c[n>>2]=m;o=d+168|0;p=n}c[l>>2]=c[(j<<16>>16!=0?p:o)>>2];a[k]=(j&65535)>>>13&255}b[i>>1]=e&-22753;h=0;return h|0}if((aQ(g|0,40112)|0)==0){c[d+148>>2]=f;h=0;return h|0}if((aQ(g|0,37152)|0)==0){e=d+166|0;b[e>>1]=b[e>>1]&-256|f&255;h=0;return h|0}if((aQ(g|0,34168)|0)==0){if((a[d+334|0]|0)==0){c[d+148>>2]=f;h=0;return h|0}else{c[d+168>>2]=f;h=0;return h|0}}if((aQ(g|0,31976)|0)==0){if((a[d+334|0]|0)==0){c[d+172>>2]=f;h=0;return h|0}else{c[d+148>>2]=f;h=0;return h|0}}e=a[g]|0;if((e<<24>>24|0)==100|(e<<24>>24|0)==68){q=100}else if((e<<24>>24|0)==97|(e<<24>>24|0)==65){q=97}else{h=1;return h|0}e=g+1|0;i=a[e]|0;if((i-48&255)<10){j=0;k=e;e=i;while(1){r=(j*10|0)-48+(e<<24>>24)|0;o=k+1|0;s=a[o]|0;if((s-48&255)<10){j=r;k=o;e=s}else{break}}t=k;u=r&7;v=s}else{t=g;u=0;v=i}if(v<<24>>24==46){i=a[t+2|0]|0;if((i|0)==119|(i|0)==87){w=65535}else if((i|0)==108|(i|0)==76){w=-1}else if((i|0)==98|(i|0)==66){w=255}else{h=1;return h|0}x=w;y=a[t+3|0]|0}else{x=-1;y=v}if(y<<24>>24!=0){h=1;return h|0}if((q|0)==97){q=d+120+(u<<2)|0;c[q>>2]=c[q>>2]&~x|x&f;h=0;return h|0}else{q=d+88+(u<<2)|0;c[q>>2]=c[q>>2]&~x|x&f;h=0;return h|0}return 0}function iv(e,f){e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;g=e+156|0;c[g>>2]=f;do{if((f&1|0)==0){h=e+164|0;b[e+162>>1]=b[h>>1]|0;i=f&16777215;j=i+1|0;if(j>>>0<(c[e+36>>2]|0)>>>0){k=c[e+32>>2]|0;l=d[k+i|0]<<8|d[k+j|0]}else{l=b6[c[e+12>>2]&63](c[e+4>>2]|0,i)|0}b[h>>1]=l;if((a[e+336|0]|0)==0){c[g>>2]=(c[g>>2]|0)+2;h=e+152|0;c[h>>2]=(c[h>>2]|0)+2;break}else{iy(e);break}}else{iA(e,f,0,0)}}while(0);l=c[g>>2]|0;if((l&1|0)!=0){iA(e,l,0,0);m=e+152|0;c[m>>2]=f;return}h=e+164|0;b[e+162>>1]=b[h>>1]|0;i=l&16777215;l=i+1|0;if(l>>>0<(c[e+36>>2]|0)>>>0){j=c[e+32>>2]|0;n=d[j+i|0]<<8|d[j+l|0]}else{n=b6[c[e+12>>2]&63](c[e+4>>2]|0,i)|0}b[h>>1]=n;if((a[e+336|0]|0)==0){c[g>>2]=(c[g>>2]|0)+2;g=e+152|0;c[g>>2]=(c[g>>2]|0)+2;m=e+152|0;c[m>>2]=f;return}else{iy(e);m=e+152|0;c[m>>2]=f;return}}function iw(e){e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;f=e+376|0;c[f>>2]=(c[f>>2]|0)+1;f=e+152|0;c[e+380>>2]=c[f>>2];c[e+384>>2]=0;c[e+388>>2]=31048;g=e+166|0;if((b[g>>1]&8192)==0){h=e+334|0;i=e+148|0;j=c[i>>2]|0;if((a[h]|0)==0){c[e+168>>2]=j;k=c[e+172>>2]|0}else{c[e+172>>2]=j;k=j}c[i>>2]=k;a[h]=1}b[g>>1]=9984;g=e+36|0;h=c[g>>2]|0;if(h>>>0>3){k=c[e+32>>2]|0;l=((d[k]<<8|d[k+1|0])<<8|d[k+2|0])<<8|d[k+3|0];m=h}else{h=b6[c[e+16>>2]&63](c[e+4>>2]|0,0)|0;l=h;m=c[g>>2]|0}c[e+148>>2]=l;if(m>>>0>7){m=c[e+32>>2]|0;n=((d[m+4|0]<<8|d[m+5|0])<<8|d[m+6|0])<<8|d[m+7|0]}else{n=b6[c[e+16>>2]&63](c[e+4>>2]|0,4)|0}m=e+156|0;c[m>>2]=n;do{if((n&1|0)==0){l=e+164|0;b[e+162>>1]=b[l>>1]|0;h=n&16777215;k=h+1|0;if(k>>>0<(c[g>>2]|0)>>>0){i=c[e+32>>2]|0;o=d[i+h|0]<<8|d[i+k|0]}else{o=b6[c[e+12>>2]&63](c[e+4>>2]|0,h)|0}b[l>>1]=o;if((a[e+336|0]|0)==0){c[m>>2]=(c[m>>2]|0)+2;c[f>>2]=(c[f>>2]|0)+2;break}else{iy(e);break}}else{iA(e,n,0,0)}}while(0);n=c[m>>2]|0;if((n&1|0)!=0){iA(e,n,0,0);p=c[m>>2]|0;q=p-4|0;c[f>>2]=q;r=e+372|0;s=c[r>>2]|0;t=s+64|0;c[r>>2]=t;return}o=e+164|0;b[e+162>>1]=b[o>>1]|0;l=n&16777215;n=l+1|0;if(n>>>0<(c[g>>2]|0)>>>0){g=c[e+32>>2]|0;u=d[g+l|0]<<8|d[g+n|0]}else{u=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[o>>1]=u;if((a[e+336|0]|0)==0){c[m>>2]=(c[m>>2]|0)+2;c[f>>2]=(c[f>>2]|0)+2;p=c[m>>2]|0;q=p-4|0;c[f>>2]=q;r=e+372|0;s=c[r>>2]|0;t=s+64|0;c[r>>2]=t;return}else{iy(e);p=c[m>>2]|0;q=p-4|0;c[f>>2]=q;r=e+372|0;s=c[r>>2]|0;t=s+64|0;c[r>>2]=t;return}}function ix(b,d){b=b|0;d=d|0;var e=0;do{if((d|0)!=0){e=b+335|0;a[e]=a[e]&-2;if((d|0)!=7){break}if((c[b+364>>2]|0)==7){break}a[b+368|0]=1}}while(0);c[b+364>>2]=d;return}function iy(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;a[b+336|0]=0;iz(b,2,0,30120);d=b+148|0;e=c[d>>2]|0;f=e-4|0;g=f&16777215;h=g+3|0;i=b+36|0;if(h>>>0<(c[i>>2]|0)>>>0){j=b+32|0;a[(c[j>>2]|0)+g|0]=0;a[(c[j>>2]|0)+(g+1)|0]=0;a[(c[j>>2]|0)+(g+2)|0]=0;a[(c[j>>2]|0)+h|0]=0}else{b3[c[b+28>>2]&63](c[b+4>>2]|0,g,0)}c[d>>2]=f;f=e-8|0;e=f&16777215;g=e+3|0;if(g>>>0<(c[i>>2]|0)>>>0){i=b+32|0;a[(c[i>>2]|0)+e|0]=0;a[(c[i>>2]|0)+(e+1)|0]=0;a[(c[i>>2]|0)+(e+2)|0]=0;a[(c[i>>2]|0)+g|0]=0;c[d>>2]=f;k=b+372|0;l=c[k>>2]|0;m=l+62|0;c[k>>2]=m;return}else{b3[c[b+28>>2]&63](c[b+4>>2]|0,e,0);c[d>>2]=f;k=b+372|0;l=c[k>>2]|0;m=l+62|0;c[k>>2]=m;return}}function iz(e,f,g,h){e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;i=f&255;f=e+376|0;c[f>>2]=(c[f>>2]|0)+1;f=e+152|0;c[e+380>>2]=c[f>>2];c[e+384>>2]=i;c[e+388>>2]=h;h=c[e+80>>2]|0;if((h|0)!=0){b1[h&511](c[e+68>>2]|0,i)}if((i|0)!=7&(i-32|0)>>>0>15){b[e+332>>1]=0}h=e+166|0;j=b[h>>1]|0;k=j&1823|8192;if((j&8192)==0){l=e+334|0;m=e+148|0;n=c[m>>2]|0;if((a[l]|0)==0){c[e+168>>2]=n;o=c[e+172>>2]|0}else{c[e+172>>2]=n;o=n}c[m>>2]=o;a[l]=1}b[h>>1]=k;if((c[e>>2]&2|0)==0){p=c[e+148>>2]|0;q=e+36|0}else{k=i<<2;h=(g<<12|k)&65535;g=e+148|0;l=(c[g>>2]|0)-2|0;o=l&16777215;m=o+1|0;n=e+36|0;if(m>>>0<(c[n>>2]|0)>>>0){r=e+32|0;a[(c[r>>2]|0)+o|0]=(h&65535)>>>8&255;a[(c[r>>2]|0)+m|0]=k&255}else{b3[c[e+24>>2]&63](c[e+4>>2]|0,o,h)}c[g>>2]=l;p=l;q=n}n=c[f>>2]|0;l=e+148|0;g=p-4|0;h=g&16777215;o=h+3|0;if(o>>>0<(c[q>>2]|0)>>>0){k=e+32|0;a[(c[k>>2]|0)+h|0]=n>>>24&255;a[(c[k>>2]|0)+(h+1)|0]=n>>>16&255;a[(c[k>>2]|0)+(h+2)|0]=n>>>8&255;a[(c[k>>2]|0)+o|0]=n&255}else{b3[c[e+28>>2]&63](c[e+4>>2]|0,h,n)}c[l>>2]=g;g=p-6|0;p=g&16777215;n=p+1|0;if(n>>>0<(c[q>>2]|0)>>>0){h=e+32|0;a[(c[h>>2]|0)+p|0]=(j&65535)>>>8&255;a[(c[h>>2]|0)+n|0]=j&255}else{b3[c[e+24>>2]&63](c[e+4>>2]|0,p,j)}c[l>>2]=g;g=(c[e+176>>2]|0)+(i<<2)&16777215;i=g+3|0;if(i>>>0<(c[q>>2]|0)>>>0){l=c[e+32>>2]|0;s=((d[l+g|0]<<8|d[l+(g+1)|0])<<8|d[l+(g+2)|0])<<8|d[l+i|0]}else{s=b6[c[e+16>>2]&63](c[e+4>>2]|0,g)|0}g=e+156|0;c[g>>2]=s;do{if((s&1|0)==0){i=e+164|0;b[e+162>>1]=b[i>>1]|0;l=s&16777215;j=l+1|0;if(j>>>0<(c[q>>2]|0)>>>0){p=c[e+32>>2]|0;t=d[p+l|0]<<8|d[p+j|0]}else{t=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[i>>1]=t;if((a[e+336|0]|0)==0){c[g>>2]=(c[g>>2]|0)+2;c[f>>2]=(c[f>>2]|0)+2;break}else{iy(e);break}}else{iA(e,s,0,0)}}while(0);t=c[g>>2]|0;if((t&1|0)!=0){iA(e,t,0,0);c[f>>2]=s;return}i=e+164|0;b[e+162>>1]=b[i>>1]|0;l=t&16777215;t=l+1|0;if(t>>>0<(c[q>>2]|0)>>>0){q=c[e+32>>2]|0;u=d[q+l|0]<<8|d[q+t|0]}else{u=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[i>>1]=u;if((a[e+336|0]|0)==0){c[g>>2]=(c[g>>2]|0)+2;c[f>>2]=(c[f>>2]|0)+2;c[f>>2]=s;return}else{iy(e);c[f>>2]=s;return}}function iA(d,e,f,g){d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;iz(d,3,8,58152);h=b[d+160>>1]|0;i=d+148|0;j=c[i>>2]|0;k=j-2|0;l=k&16777215;m=l+1|0;n=d+36|0;if(m>>>0<(c[n>>2]|0)>>>0){o=d+32|0;a[(c[o>>2]|0)+l|0]=(h&65535)>>>8&255;a[(c[o>>2]|0)+m|0]=h&255}else{b3[c[d+24>>2]&63](c[d+4>>2]|0,l,h)}c[i>>2]=k;k=j-6|0;h=k&16777215;l=h+3|0;if(l>>>0<(c[n>>2]|0)>>>0){m=d+32|0;a[(c[m>>2]|0)+h|0]=e>>>24&255;a[(c[m>>2]|0)+(h+1)|0]=e>>>16&255;a[(c[m>>2]|0)+(h+2)|0]=e>>>8&255;a[(c[m>>2]|0)+l|0]=e&255}else{b3[c[d+28>>2]&63](c[d+4>>2]|0,h,e)}c[i>>2]=k;k=(g|0)==0?16:0;g=(f|0)==0?k:k|8;k=j-8|0;j=k&16777215;f=j+1|0;if(f>>>0<(c[n>>2]|0)>>>0){n=d+32|0;a[(c[n>>2]|0)+j|0]=0;a[(c[n>>2]|0)+f|0]=g&255;c[i>>2]=k;p=d+372|0;q=c[p>>2]|0;r=q+64|0;c[p>>2]=r;return}else{b3[c[d+24>>2]&63](c[d+4>>2]|0,j,g);c[i>>2]=k;p=d+372|0;q=c[p>>2]|0;r=q+64|0;c[p>>2]=r;return}}function iB(a){a=a|0;var b=0;b=c[a+76>>2]|0;if((b|0)!=0){b1[b&511](c[a+68>>2]|0,e[a+160>>1]|0)}iz(a,4,0,57360);b=a+372|0;c[b>>2]=(c[b>>2]|0)+62;return}function iC(a){a=a|0;var b=0;iz(a,5,0,56168);b=a+372|0;c[b>>2]=(c[b>>2]|0)+66;return}function iD(a){a=a|0;var b=0;iz(a,6,0,55392);b=a+372|0;c[b>>2]=(c[b>>2]|0)+68;return}function iE(a){a=a|0;var b=0;iz(a,7,0,54728);b=a+372|0;c[b>>2]=(c[b>>2]|0)+68;return}function iF(a){a=a|0;var b=0;iz(a,8,0,54040);b=a+372|0;c[b>>2]=(c[b>>2]|0)+62;return}function iG(a){a=a|0;var b=0;iz(a,10,0,52584);b=a+372|0;c[b>>2]=(c[b>>2]|0)+62;return}function iH(a){a=a|0;var b=0;iz(a,11,0,51936);b=a+372|0;c[b>>2]=(c[b>>2]|0)+62;return}function iI(a){a=a|0;var b=0;iz(a,14,0,51408);b=a+372|0;c[b>>2]=(c[b>>2]|0)+62;return}function iJ(a,b){a=a|0;b=b|0;iz(a,b+32|0,0,50592);b=a+372|0;c[b>>2]=(c[b>>2]|0)+62;return}function iK(d){d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;e=d+48|0;if((a[e]|0)!=0){return}a[e]=1;f=d+44|0;g=c[f>>2]|0;if((g|0)!=0){b1[g&511](c[d+40>>2]|0,1)}g=d+166|0;h=d+334|0;i=a[h]|0;do{if((b[g>>1]&8192)==0){j=d+148|0;k=c[j>>2]|0;if(i<<24>>24==0){c[d+168>>2]=k}else{c[d+172>>2]=k}a[h]=1;b[g>>1]=8192;vV(d+88|0,0,60);c[j>>2]=0;l=j;m=3617}else{j=d+148|0;b[g>>1]=8192;vV(d+88|0,0,60);c[j>>2]=0;if(i<<24>>24!=0){l=j;m=3617;break}c[j>>2]=0;c[d+172>>2]=0}}while(0);if((m|0)==3617){c[d+168>>2]=0;c[l>>2]=0}a[d+335|0]=0;a[d+336|0]=0;vV(d+176|0,0,16);iw(d);if((a[e]|0)==0){return}a[e]=0;e=c[f>>2]|0;if((e|0)==0){return}b1[e&511](c[d+40>>2]|0,0);return}function iL(d){d=d|0;var f=0,g=0,h=0,i=0;f=c[d+152>>2]|0;g=d+196|0;h=(c[g>>2]|0)+1|0;c[g>>2]=h;c[d+200+((h&31)<<2)>>2]=f;a[d+336|0]=0;f=d+166|0;h=d+332|0;b[h>>1]=b[f>>1]|0;g=b[d+162>>1]|0;b[d+160>>1]=g;b0[c[d+400+((g&65535)>>>6<<2)>>2]&1023](d);g=d+392|0;c[g>>2]=(c[g>>2]|0)+1;if((b[h>>1]|0)<0){iz(d,9,0,53440);h=d+372|0;c[h>>2]=(c[h>>2]|0)+62}h=d+368|0;if((a[h]|0)!=0){iz(d,31,0,50912);b[f>>1]=b[f>>1]|1792;g=d+372|0;c[g>>2]=(c[g>>2]|0)+62;a[h]=0;return}h=c[d+364>>2]|0;if((h|0)==0){return}if(((e[f>>1]|0)>>>8&7)>>>0>=h>>>0){return}g=c[d+56>>2]|0;do{if((g|0)!=0){i=b6[g&63](c[d+52>>2]|0,h)|0;if(i>>>0>=256){break}iz(d,i,0,49648);b[f>>1]=(b[f>>1]&-1793&65535|h<<8&1792)&65535;i=d+372|0;c[i>>2]=(c[i>>2]|0)+62;return}}while(0);iz(d,h+24|0,0,50912);b[f>>1]=(b[f>>1]&-1793&65535|h<<8&1792)&65535;h=d+372|0;c[h>>2]=(c[h>>2]|0)+62;return}function iM(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;e=i;f=b+372|0;g=b+396|0;h=b+335|0;j=d;d=c[f>>2]|0;while(1){if(j>>>0<d>>>0){k=j;l=d;break}m=j-d|0;c[g>>2]=(c[g>>2]|0)+d;c[f>>2]=0;if((a[h]|0)!=0){n=3651;break}iL(b);o=c[f>>2]|0;if((o|0)==0){n=3647;break}else{j=m;d=o}}if((n|0)==3647){d=c[q>>2]|0;j=c[b+152>>2]|0;bN(d|0,49168,(x=i,i=i+8|0,c[x>>2]=j,x)|0)|0;j=c[q>>2]|0;ay(j|0)|0;k=m;l=c[f>>2]|0}else if((n|0)==3651){i=e;return}c[g>>2]=(c[g>>2]|0)+k;c[f>>2]=l-k;i=e;return}function iN(a){a=a|0;var b=0,d=0;b=0;do{d=c[16504+(b<<2)>>2]|0;c[a+400+(b<<2)>>2]=(d|0)==0?388:d;b=b+1|0;}while(b>>>0<1024);c[a+4496>>2]=388;c[a+4500>>2]=272;c[a+4504>>2]=272;c[a+4508>>2]=272;c[a+4512>>2]=272;c[a+4516>>2]=272;c[a+4520>>2]=272;c[a+4524>>2]=272;return}function iO(f,g){f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;h=f+156|0;i=c[h>>2]|0;if((i&1|0)!=0){iA(f,i,0,0);return}j=f+164|0;k=f+162|0;b[k>>1]=b[j>>1]|0;l=i&16777215;i=l+1|0;m=f+36|0;if(i>>>0<(c[m>>2]|0)>>>0){n=c[f+32>>2]|0;o=d[n+l|0]<<8|d[n+i|0]}else{o=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[j>>1]=o;l=f+336|0;if((a[l]|0)!=0){iy(f);return}i=(c[h>>2]|0)+2|0;c[h>>2]=i;n=f+152|0;p=(c[n>>2]|0)+2|0;c[n>>2]=p;q=e[k>>1]|0;r=(q&32768|0)!=0?q|-65536:q;if((g|0)!=0){g=f+372|0;c[g>>2]=(c[g>>2]|0)+12;if((i&1|0)!=0){iA(f,i,0,0);return}b[k>>1]=o;o=i&16777215;i=o+1|0;do{if(i>>>0<(c[m>>2]|0)>>>0){g=c[f+32>>2]|0;b[j>>1]=d[g+o|0]<<8|d[g+i|0]}else{g=b6[c[f+12>>2]&63](c[f+4>>2]|0,o)|0;q=(a[l]|0)==0;b[j>>1]=g;if(q){break}iy(f);return}}while(0);c[h>>2]=(c[h>>2]|0)+2;c[n>>2]=(c[n>>2]|0)+2;return}o=f+88+((b[f+160>>1]&7)<<2)|0;i=c[o>>2]|0;q=i+65535&65535;c[o>>2]=q|i&-65536;i=f+372|0;o=c[i>>2]|0;if((q|0)==65535){c[i>>2]=o+14;q=c[h>>2]|0;if((q&1|0)!=0){iA(f,q,0,0);return}b[k>>1]=b[j>>1]|0;g=q&16777215;q=g+1|0;if(q>>>0<(c[m>>2]|0)>>>0){s=c[f+32>>2]|0;t=d[s+g|0]<<8|d[s+q|0]}else{t=b6[c[f+12>>2]&63](c[f+4>>2]|0,g)|0}b[j>>1]=t;if((a[l]|0)==0){c[h>>2]=(c[h>>2]|0)+2;c[n>>2]=(c[n>>2]|0)+2;return}else{iy(f);return}}c[i>>2]=o+10;o=r+p|0;c[h>>2]=o;if((o&1|0)!=0){iA(f,o,0,0);return}b[k>>1]=b[j>>1]|0;p=o&16777215;o=p+1|0;if(o>>>0<(c[m>>2]|0)>>>0){r=c[f+32>>2]|0;u=d[r+p|0]<<8|d[r+o|0]}else{u=b6[c[f+12>>2]&63](c[f+4>>2]|0,p)|0}b[j>>1]=u;if((a[l]|0)!=0){iy(f);return}p=(c[h>>2]|0)+2|0;c[h>>2]=p;c[n>>2]=(c[n>>2]|0)+2;if((p&1|0)!=0){iA(f,p,0,0);return}b[k>>1]=u;u=p&16777215;p=u+1|0;do{if(p>>>0<(c[m>>2]|0)>>>0){k=c[f+32>>2]|0;b[j>>1]=d[k+u|0]<<8|d[k+p|0]}else{k=b6[c[f+12>>2]&63](c[f+4>>2]|0,u)|0;o=(a[l]|0)==0;b[j>>1]=k;if(o){break}iy(f);return}}while(0);f=c[h>>2]|0;c[h>>2]=f+2;c[n>>2]=f-2;return}function iP(e,f){e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;g=e+372|0;c[g>>2]=(c[g>>2]|0)+4;g=b[e+160>>1]&63;if((b5[c[20600+(g<<2)>>2]&127](e,g,509,8)|0)!=0){return}if((mQ(e,((f|0)!=0)<<31>>31)|0)!=0){return}f=e+156|0;g=c[f>>2]|0;if((g&1|0)!=0){iA(e,g,0,0);return}h=e+164|0;b[e+162>>1]=b[h>>1]|0;i=g&16777215;g=i+1|0;if(g>>>0<(c[e+36>>2]|0)>>>0){j=c[e+32>>2]|0;k=d[j+i|0]<<8|d[j+g|0]}else{k=b6[c[e+12>>2]&63](c[e+4>>2]|0,i)|0}b[h>>1]=k;if((a[e+336|0]|0)==0){c[f>>2]=(c[f>>2]|0)+2;f=e+152|0;c[f>>2]=(c[f>>2]|0)+2;return}else{iy(e);return}}function iQ(a){a=a|0;var b=0;iB(a);b=a+372|0;c[b>>2]=(c[b>>2]|0)+2;return}function iR(f){f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;g=f+160|0;h=b[g>>1]&63;if((b5[c[20600+(h<<2)>>2]&127](f,h,2020,32)|0)!=0){return}if((c[f+340>>2]|0)!=2){iB(f);return}h=f+372|0;c[h>>2]=(c[h>>2]|0)+4;c[f+120+(((e[g>>1]|0)>>>9&7)<<2)>>2]=c[f+344>>2];g=f+156|0;h=c[g>>2]|0;if((h&1|0)!=0){iA(f,h,0,0);return}i=f+164|0;b[f+162>>1]=b[i>>1]|0;j=h&16777215;h=j+1|0;if(h>>>0<(c[f+36>>2]|0)>>>0){k=c[f+32>>2]|0;l=d[k+j|0]<<8|d[k+h|0]}else{l=b6[c[f+12>>2]&63](c[f+4>>2]|0,j)|0}b[i>>1]=l;if((a[f+336|0]|0)==0){c[g>>2]=(c[g>>2]|0)+2;g=f+152|0;c[g>>2]=(c[g>>2]|0)+2;return}else{iy(f);return}}function iS(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;f=i;i=i+8|0;g=f|0;h=e+156|0;j=c[h>>2]|0;if((j&1|0)!=0){iA(e,j,0,0);i=f;return}k=e+164|0;l=e+162|0;b[l>>1]=b[k>>1]|0;m=j&16777215;j=m+1|0;n=e+36|0;if(j>>>0<(c[n>>2]|0)>>>0){o=c[e+32>>2]|0;p=d[o+m|0]<<8|d[o+j|0]}else{p=b6[c[e+12>>2]&63](c[e+4>>2]|0,m)|0}b[k>>1]=p;m=e+336|0;if((a[m]|0)!=0){iy(e);i=f;return}j=(c[h>>2]|0)+2|0;c[h>>2]=j;o=e+152|0;c[o>>2]=(c[o>>2]|0)+2;q=b[l>>1]|0;r=b[e+160>>1]&63;if((r|0)==60){s=e+372|0;c[s>>2]=(c[s>>2]|0)+20;if((j&1|0)!=0){iA(e,j,0,0);i=f;return}b[l>>1]=p;p=j&16777215;j=p+1|0;do{if(j>>>0<(c[n>>2]|0)>>>0){s=c[e+32>>2]|0;b[k>>1]=d[s+p|0]<<8|d[s+j|0]}else{s=b6[c[e+12>>2]&63](c[e+4>>2]|0,p)|0;t=(a[m]|0)==0;b[k>>1]=s;if(t){break}iy(e);i=f;return}}while(0);c[h>>2]=(c[h>>2]|0)+2;c[o>>2]=(c[o>>2]|0)+2;p=e+166|0;j=b[p>>1]|0;b[p>>1]=(j|q)&31|j&-256;i=f;return}if((b5[c[20600+(r<<2)>>2]&127](e,r,509,8)|0)!=0){i=f;return}if((mI(e,g)|0)!=0){i=f;return}r=a[g]|q&255;q=e+372|0;c[q>>2]=(c[q>>2]|0)+8;l7(e,15,r);q=c[h>>2]|0;if((q&1|0)!=0){iA(e,q,0,0);i=f;return}b[l>>1]=b[k>>1]|0;l=q&16777215;q=l+1|0;if(q>>>0<(c[n>>2]|0)>>>0){n=c[e+32>>2]|0;u=d[n+l|0]<<8|d[n+q|0]}else{u=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[k>>1]=u;if((a[m]|0)==0){c[h>>2]=(c[h>>2]|0)+2;c[o>>2]=(c[o>>2]|0)+2;mQ(e,r)|0;i=f;return}else{iy(e);i=f;return}}function iT(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;f=i;i=i+8|0;g=f|0;h=e+160|0;if((b[h>>1]&63)==60){if((a[e+334|0]|0)==0){iF(e);i=f;return}j=e+156|0;k=c[j>>2]|0;if((k&1|0)!=0){iA(e,k,0,0);i=f;return}l=e+164|0;m=e+162|0;b[m>>1]=b[l>>1]|0;n=k&16777215;k=n+1|0;o=e+36|0;if(k>>>0<(c[o>>2]|0)>>>0){p=c[e+32>>2]|0;q=d[p+n|0]<<8|d[p+k|0]}else{q=b6[c[e+12>>2]&63](c[e+4>>2]|0,n)|0}b[l>>1]=q;n=e+336|0;if((a[n]|0)!=0){iy(e);i=f;return}k=(c[j>>2]|0)+2|0;c[j>>2]=k;p=e+152|0;r=(c[p>>2]|0)+2|0;c[p>>2]=r;s=b[m>>1]|0;t=e+372|0;c[t>>2]=(c[t>>2]|0)+20;if((k&1|0)!=0){iA(e,k,0,0);i=f;return}b[m>>1]=q;q=k&16777215;m=q+1|0;do{if(m>>>0<(c[o>>2]|0)>>>0){t=c[e+32>>2]|0;b[l>>1]=d[t+q|0]<<8|d[t+m|0];u=k;v=r}else{t=b6[c[e+12>>2]&63](c[e+4>>2]|0,q)|0;w=(a[n]|0)==0;b[l>>1]=t;if(w){u=c[j>>2]|0;v=c[p>>2]|0;break}iy(e);i=f;return}}while(0);c[j>>2]=u+2;c[p>>2]=v+2;is(e,(b[e+166>>1]|s)&-22753);i=f;return}s=e+156|0;v=c[s>>2]|0;if((v&1|0)!=0){iA(e,v,0,0);i=f;return}p=e+164|0;u=e+162|0;b[u>>1]=b[p>>1]|0;j=v&16777215;v=j+1|0;l=e+36|0;if(v>>>0<(c[l>>2]|0)>>>0){n=c[e+32>>2]|0;x=d[n+j|0]<<8|d[n+v|0]}else{x=b6[c[e+12>>2]&63](c[e+4>>2]|0,j)|0}b[p>>1]=x;x=e+336|0;if((a[x]|0)!=0){iy(e);i=f;return}c[s>>2]=(c[s>>2]|0)+2;j=e+152|0;c[j>>2]=(c[j>>2]|0)+2;v=b[u>>1]|0;n=b[h>>1]&63;if((b5[c[20600+(n<<2)>>2]&127](e,n,509,16)|0)!=0){i=f;return}if((mJ(e,g)|0)!=0){i=f;return}n=b[g>>1]|v;v=e+372|0;c[v>>2]=(c[v>>2]|0)+8;l8(e,15,n);v=c[s>>2]|0;if((v&1|0)!=0){iA(e,v,0,0);i=f;return}b[u>>1]=b[p>>1]|0;u=v&16777215;v=u+1|0;if(v>>>0<(c[l>>2]|0)>>>0){l=c[e+32>>2]|0;y=d[l+u|0]<<8|d[l+v|0]}else{y=b6[c[e+12>>2]&63](c[e+4>>2]|0,u)|0}b[p>>1]=y;if((a[x]|0)==0){c[s>>2]=(c[s>>2]|0)+2;c[j>>2]=(c[j>>2]|0)+2;mR(e,n)|0;i=f;return}else{iy(e);i=f;return}}function iU(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=i;i=i+8|0;h=g|0;j=f+156|0;k=c[j>>2]|0;if((k&1|0)!=0){iA(f,k,0,0);i=g;return}l=f+164|0;m=f+162|0;b[m>>1]=b[l>>1]|0;n=k&16777215;k=n+1|0;o=f+36|0;if(k>>>0<(c[o>>2]|0)>>>0){p=c[f+32>>2]|0;q=d[p+n|0]<<8|d[p+k|0]}else{q=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[l>>1]=q;n=f+336|0;if((a[n]|0)!=0){iy(f);i=g;return}k=(c[j>>2]|0)+2|0;c[j>>2]=k;p=f+152|0;c[p>>2]=(c[p>>2]|0)+2;r=b[m>>1]|0;if((k&1|0)!=0){iA(f,k,0,0);i=g;return}b[m>>1]=q;q=k&16777215;k=q+1|0;do{if(k>>>0<(c[o>>2]|0)>>>0){s=c[f+32>>2]|0;b[l>>1]=d[s+q|0]<<8|d[s+k|0]}else{s=b6[c[f+12>>2]&63](c[f+4>>2]|0,q)|0;t=(a[n]|0)==0;b[l>>1]=s;if(t){break}iy(f);i=g;return}}while(0);c[j>>2]=(c[j>>2]|0)+2;c[p>>2]=(c[p>>2]|0)+2;q=e[m>>1]|(r&65535)<<16;r=b[f+160>>1]&63;if((b5[c[20600+(r<<2)>>2]&127](f,r,509,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}r=q|c[h>>2];h=f+372|0;c[h>>2]=(c[h>>2]|0)+16;l9(f,15,r);h=c[j>>2]|0;if((h&1|0)!=0){iA(f,h,0,0);i=g;return}b[m>>1]=b[l>>1]|0;m=h&16777215;h=m+1|0;if(h>>>0<(c[o>>2]|0)>>>0){o=c[f+32>>2]|0;u=d[o+m|0]<<8|d[o+h|0]}else{u=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[l>>1]=u;if((a[n]|0)==0){c[j>>2]=(c[j>>2]|0)+2;c[p>>2]=(c[p>>2]|0)+2;mS(f,r)|0;i=g;return}else{iy(f);i=g;return}}function iV(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;g=i;i=i+8|0;h=g|0;j=f+160|0;k=e[j>>1]|0;l=k&56;if((l|0)==8){m=f+156|0;n=c[m>>2]|0;if((n&1|0)!=0){iA(f,n,0,0);i=g;return}o=f+164|0;p=f+162|0;b[p>>1]=b[o>>1]|0;q=n&16777215;n=q+1|0;r=f+36|0;if(n>>>0<(c[r>>2]|0)>>>0){s=c[f+32>>2]|0;t=d[s+q|0]<<8|d[s+n|0]}else{t=b6[c[f+12>>2]&63](c[f+4>>2]|0,q)|0}b[o>>1]=t;t=f+336|0;if((a[t]|0)!=0){iy(f);i=g;return}c[m>>2]=(c[m>>2]|0)+2;q=f+152|0;c[q>>2]=(c[q>>2]|0)+2;n=e[p>>1]|0;s=((n&32768|0)!=0?n|-65536:n)+(c[f+120+((b[j>>1]&7)<<2)>>2]|0)|0;n=s&16777215;u=c[r>>2]|0;if(n>>>0<u>>>0){v=a[(c[f+32>>2]|0)+n|0]|0;w=u}else{u=b6[c[f+8>>2]&63](c[f+4>>2]|0,n)|0;v=u;w=c[r>>2]|0}u=s+2&16777215;if(u>>>0<w>>>0){x=a[(c[f+32>>2]|0)+u|0]|0}else{x=b6[c[f+8>>2]&63](c[f+4>>2]|0,u)|0}u=f+372|0;c[u>>2]=(c[u>>2]|0)+16;u=f+88+(((e[j>>1]|0)>>>9&7)<<2)|0;c[u>>2]=c[u>>2]&-65536|(x&255|(v&255)<<8)&65535;v=c[m>>2]|0;if((v&1|0)!=0){iA(f,v,0,0);i=g;return}b[p>>1]=b[o>>1]|0;p=v&16777215;v=p+1|0;if(v>>>0<(c[r>>2]|0)>>>0){r=c[f+32>>2]|0;y=d[r+p|0]<<8|d[r+v|0]}else{y=b6[c[f+12>>2]&63](c[f+4>>2]|0,p)|0}b[o>>1]=y;if((a[t]|0)==0){c[m>>2]=(c[m>>2]|0)+2;c[q>>2]=(c[q>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}else if((l|0)==0){l=c[f+88+((k&7)<<2)>>2]|0;q=1<<(c[f+88+((k>>>9&7)<<2)>>2]&31);m=f+372|0;c[m>>2]=(c[m>>2]|0)+6;m=f+166|0;t=b[m>>1]|0;b[m>>1]=(q&l|0)==0?t|4:t&-5;t=f+156|0;l=c[t>>2]|0;if((l&1|0)!=0){iA(f,l,0,0);i=g;return}q=f+164|0;b[f+162>>1]=b[q>>1]|0;m=l&16777215;l=m+1|0;if(l>>>0<(c[f+36>>2]|0)>>>0){y=c[f+32>>2]|0;z=d[y+m|0]<<8|d[y+l|0]}else{z=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[q>>1]=z;if((a[f+336|0]|0)==0){c[t>>2]=(c[t>>2]|0)+2;t=f+152|0;c[t>>2]=(c[t>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}else{t=k&63;if((b5[c[20600+(t<<2)>>2]&127](f,t,4092,8)|0)!=0){i=g;return}if((mI(f,h)|0)!=0){i=g;return}t=1<<(c[f+88+(((e[j>>1]|0)>>>9&7)<<2)>>2]&7);j=f+372|0;c[j>>2]=(c[j>>2]|0)+4;j=f+166|0;k=b[j>>1]|0;b[j>>1]=(t&d[h]|0)==0?k|4:k&-5;k=f+156|0;h=c[k>>2]|0;if((h&1|0)!=0){iA(f,h,0,0);i=g;return}t=f+164|0;b[f+162>>1]=b[t>>1]|0;j=h&16777215;h=j+1|0;if(h>>>0<(c[f+36>>2]|0)>>>0){z=c[f+32>>2]|0;A=d[z+j|0]<<8|d[z+h|0]}else{A=b6[c[f+12>>2]&63](c[f+4>>2]|0,j)|0}b[t>>1]=A;if((a[f+336|0]|0)==0){c[k>>2]=(c[k>>2]|0)+2;k=f+152|0;c[k>>2]=(c[k>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}}function iW(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;g=i;i=i+8|0;h=g|0;j=f+160|0;k=e[j>>1]|0;l=k>>>3&7;if((l|0)==0){m=f+88+((k&7)<<2)|0;n=c[m>>2]|0;o=1<<(c[f+88+((k>>>9&7)<<2)>>2]&31);p=f+372|0;c[p>>2]=(c[p>>2]|0)+8;c[m>>2]=o^n;m=f+166|0;p=b[m>>1]|0;b[m>>1]=(o&n|0)==0?p|4:p&-5;p=f+156|0;n=c[p>>2]|0;if((n&1|0)!=0){iA(f,n,0,0);i=g;return}o=f+164|0;b[f+162>>1]=b[o>>1]|0;m=n&16777215;n=m+1|0;if(n>>>0<(c[f+36>>2]|0)>>>0){q=c[f+32>>2]|0;r=d[q+m|0]<<8|d[q+n|0]}else{r=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[o>>1]=r;if((a[f+336|0]|0)==0){c[p>>2]=(c[p>>2]|0)+2;p=f+152|0;c[p>>2]=(c[p>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}else if((l|0)==1){l=f+156|0;p=c[l>>2]|0;if((p&1|0)!=0){iA(f,p,0,0);i=g;return}r=f+164|0;o=f+162|0;b[o>>1]=b[r>>1]|0;m=p&16777215;p=m+1|0;n=f+36|0;if(p>>>0<(c[n>>2]|0)>>>0){q=c[f+32>>2]|0;s=d[q+m|0]<<8|d[q+p|0]}else{s=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[r>>1]=s;s=f+336|0;if((a[s]|0)!=0){iy(f);i=g;return}c[l>>2]=(c[l>>2]|0)+2;m=f+152|0;c[m>>2]=(c[m>>2]|0)+2;p=e[o>>1]|0;q=((p&32768|0)!=0?p|-65536:p)+(c[f+120+((b[j>>1]&7)<<2)>>2]|0)|0;p=q&16777215;t=c[n>>2]|0;if(p>>>0<t>>>0){u=a[(c[f+32>>2]|0)+p|0]|0;v=t}else{t=b6[c[f+8>>2]&63](c[f+4>>2]|0,p)|0;u=t;v=c[n>>2]|0}t=q+2&16777215;if(t>>>0<v>>>0){w=a[(c[f+32>>2]|0)+t|0]|0;x=v}else{v=b6[c[f+8>>2]&63](c[f+4>>2]|0,t)|0;w=v;x=c[n>>2]|0}v=q+4&16777215;if(v>>>0<x>>>0){y=a[(c[f+32>>2]|0)+v|0]|0;z=x}else{x=b6[c[f+8>>2]&63](c[f+4>>2]|0,v)|0;y=x;z=c[n>>2]|0}x=q+6&16777215;if(x>>>0<z>>>0){A=a[(c[f+32>>2]|0)+x|0]|0}else{A=b6[c[f+8>>2]&63](c[f+4>>2]|0,x)|0}x=f+372|0;c[x>>2]=(c[x>>2]|0)+24;c[f+88+(((e[j>>1]|0)>>>9&7)<<2)>>2]=A&255|(y&255|(w&255|(u&255)<<8)<<8)<<8;u=c[l>>2]|0;if((u&1|0)!=0){iA(f,u,0,0);i=g;return}b[o>>1]=b[r>>1]|0;o=u&16777215;u=o+1|0;if(u>>>0<(c[n>>2]|0)>>>0){n=c[f+32>>2]|0;B=d[n+o|0]<<8|d[n+u|0]}else{B=b6[c[f+12>>2]&63](c[f+4>>2]|0,o)|0}b[r>>1]=B;if((a[s]|0)==0){c[l>>2]=(c[l>>2]|0)+2;c[m>>2]=(c[m>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}else{m=k&63;if((b5[c[20600+(m<<2)>>2]&127](f,m,508,8)|0)!=0){i=g;return}if((mI(f,h)|0)!=0){i=g;return}m=1<<(c[f+88+(((e[j>>1]|0)>>>9&7)<<2)>>2]&7);j=d[h]|0;h=f+372|0;c[h>>2]=(c[h>>2]|0)+8;h=f+166|0;k=b[h>>1]|0;b[h>>1]=(m&j|0)==0?k|4:k&-5;k=f+156|0;h=c[k>>2]|0;if((h&1|0)!=0){iA(f,h,0,0);i=g;return}l=f+164|0;b[f+162>>1]=b[l>>1]|0;s=h&16777215;h=s+1|0;if(h>>>0<(c[f+36>>2]|0)>>>0){B=c[f+32>>2]|0;C=d[B+s|0]<<8|d[B+h|0]}else{C=b6[c[f+12>>2]&63](c[f+4>>2]|0,s)|0}b[l>>1]=C;if((a[f+336|0]|0)==0){c[k>>2]=(c[k>>2]|0)+2;k=f+152|0;c[k>>2]=(c[k>>2]|0)+2;mQ(f,(j^m)&255)|0;i=g;return}else{iy(f);i=g;return}}}function iX(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;g=i;i=i+8|0;h=g|0;j=f+160|0;k=e[j>>1]|0;l=k>>>3&7;if((l|0)==1){m=f+156|0;n=c[m>>2]|0;if((n&1|0)!=0){iA(f,n,0,0);i=g;return}o=f+164|0;p=f+162|0;b[p>>1]=b[o>>1]|0;q=n&16777215;n=q+1|0;r=f+36|0;if(n>>>0<(c[r>>2]|0)>>>0){s=c[f+32>>2]|0;t=d[s+q|0]<<8|d[s+n|0]}else{t=b6[c[f+12>>2]&63](c[f+4>>2]|0,q)|0}b[o>>1]=t;t=f+336|0;if((a[t]|0)!=0){iy(f);i=g;return}c[m>>2]=(c[m>>2]|0)+2;q=f+152|0;c[q>>2]=(c[q>>2]|0)+2;n=e[j>>1]|0;s=e[p>>1]|0;u=((s&32768|0)!=0?s|-65536:s)+(c[f+120+((n&7)<<2)>>2]|0)|0;s=c[f+88+((n>>>9&7)<<2)>>2]|0;n=s>>>8&255;v=u&16777215;if(v>>>0<(c[r>>2]|0)>>>0){a[(c[f+32>>2]|0)+v|0]=n}else{b3[c[f+20>>2]&63](c[f+4>>2]|0,v,n)}n=s&255;s=u+2&16777215;if(s>>>0<(c[r>>2]|0)>>>0){a[(c[f+32>>2]|0)+s|0]=n}else{b3[c[f+20>>2]&63](c[f+4>>2]|0,s,n)}n=f+372|0;c[n>>2]=(c[n>>2]|0)+16;n=c[m>>2]|0;if((n&1|0)!=0){iA(f,n,0,0);i=g;return}b[p>>1]=b[o>>1]|0;p=n&16777215;n=p+1|0;if(n>>>0<(c[r>>2]|0)>>>0){r=c[f+32>>2]|0;w=d[r+p|0]<<8|d[r+n|0]}else{w=b6[c[f+12>>2]&63](c[f+4>>2]|0,p)|0}b[o>>1]=w;if((a[t]|0)==0){c[m>>2]=(c[m>>2]|0)+2;c[q>>2]=(c[q>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}else if((l|0)==0){l=f+88+((k&7)<<2)|0;q=c[l>>2]|0;m=1<<(c[f+88+((k>>>9&7)<<2)>>2]&31);t=f+372|0;c[t>>2]=(c[t>>2]|0)+10;t=f+166|0;w=b[t>>1]|0;b[t>>1]=(m&q|0)==0?w|4:w&-5;c[l>>2]=q&~m;m=f+156|0;q=c[m>>2]|0;if((q&1|0)!=0){iA(f,q,0,0);i=g;return}l=f+164|0;b[f+162>>1]=b[l>>1]|0;w=q&16777215;q=w+1|0;if(q>>>0<(c[f+36>>2]|0)>>>0){t=c[f+32>>2]|0;x=d[t+w|0]<<8|d[t+q|0]}else{x=b6[c[f+12>>2]&63](c[f+4>>2]|0,w)|0}b[l>>1]=x;if((a[f+336|0]|0)==0){c[m>>2]=(c[m>>2]|0)+2;m=f+152|0;c[m>>2]=(c[m>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}else{m=k&63;if((b5[c[20600+(m<<2)>>2]&127](f,m,508,8)|0)!=0){i=g;return}if((mI(f,h)|0)!=0){i=g;return}m=1<<(c[f+88+(((e[j>>1]|0)>>>9&7)<<2)>>2]&7);j=d[h]|0;h=f+372|0;c[h>>2]=(c[h>>2]|0)+8;h=f+166|0;k=b[h>>1]|0;b[h>>1]=(m&j|0)==0?k|4:k&-5;k=f+156|0;h=c[k>>2]|0;if((h&1|0)!=0){iA(f,h,0,0);i=g;return}x=f+164|0;b[f+162>>1]=b[x>>1]|0;l=h&16777215;h=l+1|0;if(h>>>0<(c[f+36>>2]|0)>>>0){w=c[f+32>>2]|0;y=d[w+l|0]<<8|d[w+h|0]}else{y=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[x>>1]=y;if((a[f+336|0]|0)==0){c[k>>2]=(c[k>>2]|0)+2;k=f+152|0;c[k>>2]=(c[k>>2]|0)+2;mQ(f,(m^255)&j&255)|0;i=g;return}else{iy(f);i=g;return}}}function iY(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;g=i;i=i+8|0;h=g|0;j=f+160|0;k=e[j>>1]|0;l=k>>>3&7;if((l|0)==0){m=f+88+((k&7)<<2)|0;n=c[m>>2]|0;o=1<<(c[f+88+((k>>>9&7)<<2)>>2]&31);p=f+372|0;c[p>>2]=(c[p>>2]|0)+8;p=f+166|0;q=b[p>>1]|0;b[p>>1]=(o&n|0)==0?q|4:q&-5;c[m>>2]=o|n;n=f+156|0;o=c[n>>2]|0;if((o&1|0)!=0){iA(f,o,0,0);i=g;return}m=f+164|0;b[f+162>>1]=b[m>>1]|0;q=o&16777215;o=q+1|0;if(o>>>0<(c[f+36>>2]|0)>>>0){p=c[f+32>>2]|0;r=d[p+q|0]<<8|d[p+o|0]}else{r=b6[c[f+12>>2]&63](c[f+4>>2]|0,q)|0}b[m>>1]=r;if((a[f+336|0]|0)==0){c[n>>2]=(c[n>>2]|0)+2;n=f+152|0;c[n>>2]=(c[n>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}else if((l|0)==1){l=f+156|0;n=c[l>>2]|0;if((n&1|0)!=0){iA(f,n,0,0);i=g;return}r=f+164|0;m=f+162|0;b[m>>1]=b[r>>1]|0;q=n&16777215;n=q+1|0;o=f+36|0;if(n>>>0<(c[o>>2]|0)>>>0){p=c[f+32>>2]|0;s=d[p+q|0]<<8|d[p+n|0]}else{s=b6[c[f+12>>2]&63](c[f+4>>2]|0,q)|0}b[r>>1]=s;s=f+336|0;if((a[s]|0)!=0){iy(f);i=g;return}c[l>>2]=(c[l>>2]|0)+2;q=f+152|0;c[q>>2]=(c[q>>2]|0)+2;n=e[j>>1]|0;p=e[m>>1]|0;t=((p&32768|0)!=0?p|-65536:p)+(c[f+120+((n&7)<<2)>>2]|0)|0;p=c[f+88+((n>>>9&7)<<2)>>2]|0;n=p>>>24&255;u=t&16777215;if(u>>>0<(c[o>>2]|0)>>>0){a[(c[f+32>>2]|0)+u|0]=n}else{b3[c[f+20>>2]&63](c[f+4>>2]|0,u,n)}n=p>>>16&255;u=t+2&16777215;if(u>>>0<(c[o>>2]|0)>>>0){a[(c[f+32>>2]|0)+u|0]=n}else{b3[c[f+20>>2]&63](c[f+4>>2]|0,u,n)}n=p>>>8&255;u=t+4&16777215;if(u>>>0<(c[o>>2]|0)>>>0){a[(c[f+32>>2]|0)+u|0]=n}else{b3[c[f+20>>2]&63](c[f+4>>2]|0,u,n)}n=p&255;p=t+6&16777215;if(p>>>0<(c[o>>2]|0)>>>0){a[(c[f+32>>2]|0)+p|0]=n}else{b3[c[f+20>>2]&63](c[f+4>>2]|0,p,n)}n=f+372|0;c[n>>2]=(c[n>>2]|0)+24;n=c[l>>2]|0;if((n&1|0)!=0){iA(f,n,0,0);i=g;return}b[m>>1]=b[r>>1]|0;m=n&16777215;n=m+1|0;if(n>>>0<(c[o>>2]|0)>>>0){o=c[f+32>>2]|0;v=d[o+m|0]<<8|d[o+n|0]}else{v=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[r>>1]=v;if((a[s]|0)==0){c[l>>2]=(c[l>>2]|0)+2;c[q>>2]=(c[q>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}else{q=k&63;if((b5[c[20600+(q<<2)>>2]&127](f,q,508,8)|0)!=0){i=g;return}if((mI(f,h)|0)!=0){i=g;return}q=1<<(c[f+88+(((e[j>>1]|0)>>>9&7)<<2)>>2]&7);j=d[h]|0;h=f+372|0;c[h>>2]=(c[h>>2]|0)+8;h=f+166|0;k=b[h>>1]|0;b[h>>1]=(q&j|0)==0?k|4:k&-5;k=f+156|0;h=c[k>>2]|0;if((h&1|0)!=0){iA(f,h,0,0);i=g;return}l=f+164|0;b[f+162>>1]=b[l>>1]|0;s=h&16777215;h=s+1|0;if(h>>>0<(c[f+36>>2]|0)>>>0){v=c[f+32>>2]|0;w=d[v+s|0]<<8|d[v+h|0]}else{w=b6[c[f+12>>2]&63](c[f+4>>2]|0,s)|0}b[l>>1]=w;if((a[f+336|0]|0)==0){c[k>>2]=(c[k>>2]|0)+2;k=f+152|0;c[k>>2]=(c[k>>2]|0)+2;mQ(f,(j|q)&255)|0;i=g;return}else{iy(f);i=g;return}}}function iZ(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;f=i;i=i+8|0;g=f|0;h=e+156|0;j=c[h>>2]|0;if((j&1|0)!=0){iA(e,j,0,0);i=f;return}k=e+164|0;l=e+162|0;b[l>>1]=b[k>>1]|0;m=j&16777215;j=m+1|0;n=e+36|0;if(j>>>0<(c[n>>2]|0)>>>0){o=c[e+32>>2]|0;p=d[o+m|0]<<8|d[o+j|0]}else{p=b6[c[e+12>>2]&63](c[e+4>>2]|0,m)|0}b[k>>1]=p;m=e+336|0;if((a[m]|0)!=0){iy(e);i=f;return}j=(c[h>>2]|0)+2|0;c[h>>2]=j;o=e+152|0;c[o>>2]=(c[o>>2]|0)+2;q=b[l>>1]|0;r=b[e+160>>1]&63;if((r|0)==60){s=e+372|0;c[s>>2]=(c[s>>2]|0)+20;if((j&1|0)!=0){iA(e,j,0,0);i=f;return}b[l>>1]=p;p=j&16777215;j=p+1|0;do{if(j>>>0<(c[n>>2]|0)>>>0){s=c[e+32>>2]|0;b[k>>1]=d[s+p|0]<<8|d[s+j|0]}else{s=b6[c[e+12>>2]&63](c[e+4>>2]|0,p)|0;t=(a[m]|0)==0;b[k>>1]=s;if(t){break}iy(e);i=f;return}}while(0);c[h>>2]=(c[h>>2]|0)+2;c[o>>2]=(c[o>>2]|0)+2;p=e+166|0;b[p>>1]=b[p>>1]&(q&31|-256);i=f;return}if((b5[c[20600+(r<<2)>>2]&127](e,r,509,8)|0)!=0){i=f;return}if((mI(e,g)|0)!=0){i=f;return}r=a[g]&(q&255);q=e+372|0;c[q>>2]=(c[q>>2]|0)+8;l7(e,15,r);q=c[h>>2]|0;if((q&1|0)!=0){iA(e,q,0,0);i=f;return}b[l>>1]=b[k>>1]|0;l=q&16777215;q=l+1|0;if(q>>>0<(c[n>>2]|0)>>>0){n=c[e+32>>2]|0;u=d[n+l|0]<<8|d[n+q|0]}else{u=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[k>>1]=u;if((a[m]|0)==0){c[h>>2]=(c[h>>2]|0)+2;c[o>>2]=(c[o>>2]|0)+2;mQ(e,r)|0;i=f;return}else{iy(e);i=f;return}}function i_(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;f=i;i=i+8|0;g=f|0;h=e+160|0;if((b[h>>1]&63)==60){if((a[e+334|0]|0)==0){iF(e);i=f;return}j=e+156|0;k=c[j>>2]|0;if((k&1|0)!=0){iA(e,k,0,0);i=f;return}l=e+164|0;m=e+162|0;b[m>>1]=b[l>>1]|0;n=k&16777215;k=n+1|0;o=e+36|0;if(k>>>0<(c[o>>2]|0)>>>0){p=c[e+32>>2]|0;q=d[p+n|0]<<8|d[p+k|0]}else{q=b6[c[e+12>>2]&63](c[e+4>>2]|0,n)|0}b[l>>1]=q;n=e+336|0;if((a[n]|0)!=0){iy(e);i=f;return}k=(c[j>>2]|0)+2|0;c[j>>2]=k;p=e+152|0;r=(c[p>>2]|0)+2|0;c[p>>2]=r;s=b[m>>1]|0;t=e+372|0;c[t>>2]=(c[t>>2]|0)+20;if((k&1|0)!=0){iA(e,k,0,0);i=f;return}b[m>>1]=q;q=k&16777215;m=q+1|0;do{if(m>>>0<(c[o>>2]|0)>>>0){t=c[e+32>>2]|0;b[l>>1]=d[t+q|0]<<8|d[t+m|0];u=k;v=r}else{t=b6[c[e+12>>2]&63](c[e+4>>2]|0,q)|0;w=(a[n]|0)==0;b[l>>1]=t;if(w){u=c[j>>2]|0;v=c[p>>2]|0;break}iy(e);i=f;return}}while(0);c[j>>2]=u+2;c[p>>2]=v+2;is(e,b[e+166>>1]&s);i=f;return}s=e+156|0;v=c[s>>2]|0;if((v&1|0)!=0){iA(e,v,0,0);i=f;return}p=e+164|0;u=e+162|0;b[u>>1]=b[p>>1]|0;j=v&16777215;v=j+1|0;l=e+36|0;if(v>>>0<(c[l>>2]|0)>>>0){n=c[e+32>>2]|0;x=d[n+j|0]<<8|d[n+v|0]}else{x=b6[c[e+12>>2]&63](c[e+4>>2]|0,j)|0}b[p>>1]=x;x=e+336|0;if((a[x]|0)!=0){iy(e);i=f;return}c[s>>2]=(c[s>>2]|0)+2;j=e+152|0;c[j>>2]=(c[j>>2]|0)+2;v=b[u>>1]|0;n=b[h>>1]&63;if((b5[c[20600+(n<<2)>>2]&127](e,n,509,16)|0)!=0){i=f;return}if((mJ(e,g)|0)!=0){i=f;return}n=b[g>>1]&v;v=e+372|0;c[v>>2]=(c[v>>2]|0)+8;l8(e,15,n);v=c[s>>2]|0;if((v&1|0)!=0){iA(e,v,0,0);i=f;return}b[u>>1]=b[p>>1]|0;u=v&16777215;v=u+1|0;if(v>>>0<(c[l>>2]|0)>>>0){l=c[e+32>>2]|0;y=d[l+u|0]<<8|d[l+v|0]}else{y=b6[c[e+12>>2]&63](c[e+4>>2]|0,u)|0}b[p>>1]=y;if((a[x]|0)==0){c[s>>2]=(c[s>>2]|0)+2;c[j>>2]=(c[j>>2]|0)+2;mR(e,n)|0;i=f;return}else{iy(e);i=f;return}}function i$(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=i;i=i+8|0;h=g|0;j=f+156|0;k=c[j>>2]|0;if((k&1|0)!=0){iA(f,k,0,0);i=g;return}l=f+164|0;m=f+162|0;b[m>>1]=b[l>>1]|0;n=k&16777215;k=n+1|0;o=f+36|0;if(k>>>0<(c[o>>2]|0)>>>0){p=c[f+32>>2]|0;q=d[p+n|0]<<8|d[p+k|0]}else{q=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[l>>1]=q;n=f+336|0;if((a[n]|0)!=0){iy(f);i=g;return}k=(c[j>>2]|0)+2|0;c[j>>2]=k;p=f+152|0;c[p>>2]=(c[p>>2]|0)+2;r=b[m>>1]|0;if((k&1|0)!=0){iA(f,k,0,0);i=g;return}b[m>>1]=q;q=k&16777215;k=q+1|0;do{if(k>>>0<(c[o>>2]|0)>>>0){s=c[f+32>>2]|0;b[l>>1]=d[s+q|0]<<8|d[s+k|0]}else{s=b6[c[f+12>>2]&63](c[f+4>>2]|0,q)|0;t=(a[n]|0)==0;b[l>>1]=s;if(t){break}iy(f);i=g;return}}while(0);c[j>>2]=(c[j>>2]|0)+2;c[p>>2]=(c[p>>2]|0)+2;q=e[m>>1]|(r&65535)<<16;r=b[f+160>>1]&63;if((b5[c[20600+(r<<2)>>2]&127](f,r,509,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}r=c[h>>2]&q;q=f+372|0;c[q>>2]=(c[q>>2]|0)+16;l9(f,15,r);q=c[j>>2]|0;if((q&1|0)!=0){iA(f,q,0,0);i=g;return}b[m>>1]=b[l>>1]|0;m=q&16777215;q=m+1|0;if(q>>>0<(c[o>>2]|0)>>>0){o=c[f+32>>2]|0;u=d[o+m|0]<<8|d[o+q|0]}else{u=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[l>>1]=u;if((a[n]|0)==0){c[j>>2]=(c[j>>2]|0)+2;c[p>>2]=(c[p>>2]|0)+2;mS(f,r)|0;i=g;return}else{iy(f);i=g;return}}function i0(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;f=i;i=i+8|0;g=f|0;h=e+156|0;j=c[h>>2]|0;if((j&1|0)!=0){iA(e,j,0,0);i=f;return}k=e+164|0;l=e+162|0;b[l>>1]=b[k>>1]|0;m=j&16777215;j=m+1|0;n=e+36|0;if(j>>>0<(c[n>>2]|0)>>>0){o=c[e+32>>2]|0;p=d[o+m|0]<<8|d[o+j|0]}else{p=b6[c[e+12>>2]&63](c[e+4>>2]|0,m)|0}b[k>>1]=p;p=e+336|0;if((a[p]|0)!=0){iy(e);i=f;return}c[h>>2]=(c[h>>2]|0)+2;m=e+152|0;c[m>>2]=(c[m>>2]|0)+2;j=b[l>>1]&255;o=b[e+160>>1]&63;if((b5[c[20600+(o<<2)>>2]&127](e,o,509,8)|0)!=0){i=f;return}if((mI(e,g)|0)!=0){i=f;return}o=a[g]|0;g=o-j&255;q=e+372|0;c[q>>2]=(c[q>>2]|0)+8;mn(e,g,j,o);o=c[h>>2]|0;if((o&1|0)!=0){iA(e,o,0,0);i=f;return}b[l>>1]=b[k>>1]|0;l=o&16777215;o=l+1|0;if(o>>>0<(c[n>>2]|0)>>>0){n=c[e+32>>2]|0;r=d[n+l|0]<<8|d[n+o|0]}else{r=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[k>>1]=r;if((a[p]|0)==0){c[h>>2]=(c[h>>2]|0)+2;c[m>>2]=(c[m>>2]|0)+2;mQ(e,g)|0;i=f;return}else{iy(e);i=f;return}}function i1(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;f=i;i=i+8|0;g=f|0;h=e+156|0;j=c[h>>2]|0;if((j&1|0)!=0){iA(e,j,0,0);i=f;return}k=e+164|0;l=e+162|0;b[l>>1]=b[k>>1]|0;m=j&16777215;j=m+1|0;n=e+36|0;if(j>>>0<(c[n>>2]|0)>>>0){o=c[e+32>>2]|0;p=d[o+m|0]<<8|d[o+j|0]}else{p=b6[c[e+12>>2]&63](c[e+4>>2]|0,m)|0}b[k>>1]=p;p=e+336|0;if((a[p]|0)!=0){iy(e);i=f;return}c[h>>2]=(c[h>>2]|0)+2;m=e+152|0;c[m>>2]=(c[m>>2]|0)+2;j=b[l>>1]|0;o=b[e+160>>1]&63;if((b5[c[20600+(o<<2)>>2]&127](e,o,509,16)|0)!=0){i=f;return}if((mJ(e,g)|0)!=0){i=f;return}o=b[g>>1]|0;g=o-j&65535;q=e+372|0;c[q>>2]=(c[q>>2]|0)+8;mo(e,g,j,o);o=c[h>>2]|0;if((o&1|0)!=0){iA(e,o,0,0);i=f;return}b[l>>1]=b[k>>1]|0;l=o&16777215;o=l+1|0;if(o>>>0<(c[n>>2]|0)>>>0){n=c[e+32>>2]|0;r=d[n+l|0]<<8|d[n+o|0]}else{r=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[k>>1]=r;if((a[p]|0)==0){c[h>>2]=(c[h>>2]|0)+2;c[m>>2]=(c[m>>2]|0)+2;mR(e,g)|0;i=f;return}else{iy(e);i=f;return}}function i2(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=i;i=i+8|0;h=g|0;j=f+156|0;k=c[j>>2]|0;if((k&1|0)!=0){iA(f,k,0,0);i=g;return}l=f+164|0;m=f+162|0;b[m>>1]=b[l>>1]|0;n=k&16777215;k=n+1|0;o=f+36|0;if(k>>>0<(c[o>>2]|0)>>>0){p=c[f+32>>2]|0;q=d[p+n|0]<<8|d[p+k|0]}else{q=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[l>>1]=q;n=f+336|0;if((a[n]|0)!=0){iy(f);i=g;return}k=(c[j>>2]|0)+2|0;c[j>>2]=k;p=f+152|0;c[p>>2]=(c[p>>2]|0)+2;r=b[m>>1]|0;if((k&1|0)!=0){iA(f,k,0,0);i=g;return}b[m>>1]=q;q=k&16777215;k=q+1|0;do{if(k>>>0<(c[o>>2]|0)>>>0){s=c[f+32>>2]|0;b[l>>1]=d[s+q|0]<<8|d[s+k|0]}else{s=b6[c[f+12>>2]&63](c[f+4>>2]|0,q)|0;t=(a[n]|0)==0;b[l>>1]=s;if(t){break}iy(f);i=g;return}}while(0);c[j>>2]=(c[j>>2]|0)+2;c[p>>2]=(c[p>>2]|0)+2;q=e[m>>1]|(r&65535)<<16;r=b[f+160>>1]&63;if((b5[c[20600+(r<<2)>>2]&127](f,r,509,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}r=c[h>>2]|0;h=r-q|0;k=f+372|0;c[k>>2]=(c[k>>2]|0)+16;mp(f,h,q,r);r=c[j>>2]|0;if((r&1|0)!=0){iA(f,r,0,0);i=g;return}b[m>>1]=b[l>>1]|0;m=r&16777215;r=m+1|0;if(r>>>0<(c[o>>2]|0)>>>0){o=c[f+32>>2]|0;u=d[o+m|0]<<8|d[o+r|0]}else{u=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[l>>1]=u;if((a[n]|0)==0){c[j>>2]=(c[j>>2]|0)+2;c[p>>2]=(c[p>>2]|0)+2;mS(f,h)|0;i=g;return}else{iy(f);i=g;return}}function i3(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;f=i;i=i+8|0;g=f|0;h=e+156|0;j=c[h>>2]|0;if((j&1|0)!=0){iA(e,j,0,0);i=f;return}k=e+164|0;l=e+162|0;b[l>>1]=b[k>>1]|0;m=j&16777215;j=m+1|0;n=e+36|0;if(j>>>0<(c[n>>2]|0)>>>0){o=c[e+32>>2]|0;p=d[o+m|0]<<8|d[o+j|0]}else{p=b6[c[e+12>>2]&63](c[e+4>>2]|0,m)|0}b[k>>1]=p;p=e+336|0;if((a[p]|0)!=0){iy(e);i=f;return}c[h>>2]=(c[h>>2]|0)+2;m=e+152|0;c[m>>2]=(c[m>>2]|0)+2;j=b[l>>1]&255;o=b[e+160>>1]&63;if((b5[c[20600+(o<<2)>>2]&127](e,o,509,8)|0)!=0){i=f;return}if((mI(e,g)|0)!=0){i=f;return}o=a[g]|0;g=o+j&255;q=e+372|0;c[q>>2]=(c[q>>2]|0)+8;ma(e,g,j,o);o=c[h>>2]|0;if((o&1|0)!=0){iA(e,o,0,0);i=f;return}b[l>>1]=b[k>>1]|0;l=o&16777215;o=l+1|0;if(o>>>0<(c[n>>2]|0)>>>0){n=c[e+32>>2]|0;r=d[n+l|0]<<8|d[n+o|0]}else{r=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[k>>1]=r;if((a[p]|0)==0){c[h>>2]=(c[h>>2]|0)+2;c[m>>2]=(c[m>>2]|0)+2;mQ(e,g)|0;i=f;return}else{iy(e);i=f;return}}function i4(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;f=i;i=i+8|0;g=f|0;h=e+156|0;j=c[h>>2]|0;if((j&1|0)!=0){iA(e,j,0,0);i=f;return}k=e+164|0;l=e+162|0;b[l>>1]=b[k>>1]|0;m=j&16777215;j=m+1|0;n=e+36|0;if(j>>>0<(c[n>>2]|0)>>>0){o=c[e+32>>2]|0;p=d[o+m|0]<<8|d[o+j|0]}else{p=b6[c[e+12>>2]&63](c[e+4>>2]|0,m)|0}b[k>>1]=p;p=e+336|0;if((a[p]|0)!=0){iy(e);i=f;return}c[h>>2]=(c[h>>2]|0)+2;m=e+152|0;c[m>>2]=(c[m>>2]|0)+2;j=b[l>>1]|0;o=b[e+160>>1]&63;if((b5[c[20600+(o<<2)>>2]&127](e,o,509,16)|0)!=0){i=f;return}if((mJ(e,g)|0)!=0){i=f;return}o=b[g>>1]|0;g=o+j&65535;q=e+372|0;c[q>>2]=(c[q>>2]|0)+8;mb(e,g,j,o);o=c[h>>2]|0;if((o&1|0)!=0){iA(e,o,0,0);i=f;return}b[l>>1]=b[k>>1]|0;l=o&16777215;o=l+1|0;if(o>>>0<(c[n>>2]|0)>>>0){n=c[e+32>>2]|0;r=d[n+l|0]<<8|d[n+o|0]}else{r=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[k>>1]=r;if((a[p]|0)==0){c[h>>2]=(c[h>>2]|0)+2;c[m>>2]=(c[m>>2]|0)+2;mR(e,g)|0;i=f;return}else{iy(e);i=f;return}}function i5(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=i;i=i+8|0;h=g|0;j=f+156|0;k=c[j>>2]|0;if((k&1|0)!=0){iA(f,k,0,0);i=g;return}l=f+164|0;m=f+162|0;b[m>>1]=b[l>>1]|0;n=k&16777215;k=n+1|0;o=f+36|0;if(k>>>0<(c[o>>2]|0)>>>0){p=c[f+32>>2]|0;q=d[p+n|0]<<8|d[p+k|0]}else{q=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[l>>1]=q;n=f+336|0;if((a[n]|0)!=0){iy(f);i=g;return}k=(c[j>>2]|0)+2|0;c[j>>2]=k;p=f+152|0;c[p>>2]=(c[p>>2]|0)+2;r=b[m>>1]|0;if((k&1|0)!=0){iA(f,k,0,0);i=g;return}b[m>>1]=q;q=k&16777215;k=q+1|0;do{if(k>>>0<(c[o>>2]|0)>>>0){s=c[f+32>>2]|0;b[l>>1]=d[s+q|0]<<8|d[s+k|0]}else{s=b6[c[f+12>>2]&63](c[f+4>>2]|0,q)|0;t=(a[n]|0)==0;b[l>>1]=s;if(t){break}iy(f);i=g;return}}while(0);c[j>>2]=(c[j>>2]|0)+2;c[p>>2]=(c[p>>2]|0)+2;q=e[m>>1]|(r&65535)<<16;r=b[f+160>>1]&63;if((b5[c[20600+(r<<2)>>2]&127](f,r,509,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}r=c[h>>2]|0;h=r+q|0;k=f+372|0;c[k>>2]=(c[k>>2]|0)+16;mg(f,h,q,r);r=c[j>>2]|0;if((r&1|0)!=0){iA(f,r,0,0);i=g;return}b[m>>1]=b[l>>1]|0;m=r&16777215;r=m+1|0;if(r>>>0<(c[o>>2]|0)>>>0){o=c[f+32>>2]|0;u=d[o+m|0]<<8|d[o+r|0]}else{u=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[l>>1]=u;if((a[n]|0)==0){c[j>>2]=(c[j>>2]|0)+2;c[p>>2]=(c[p>>2]|0)+2;mS(f,h)|0;i=g;return}else{iy(f);i=g;return}}
function i6(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;f=i;i=i+8|0;g=f|0;h=e+160|0;j=e+156|0;k=c[j>>2]|0;l=(k&1|0)==0;if((b[h>>1]&56)==0){if(!l){iA(e,k,0,0);i=f;return}m=e+164|0;n=e+162|0;b[n>>1]=b[m>>1]|0;o=k&16777215;p=o+1|0;q=e+36|0;if(p>>>0<(c[q>>2]|0)>>>0){r=c[e+32>>2]|0;s=d[r+o|0]<<8|d[r+p|0]}else{s=b6[c[e+12>>2]&63](c[e+4>>2]|0,o)|0}b[m>>1]=s;o=e+336|0;if((a[o]|0)!=0){iy(e);i=f;return}p=(c[j>>2]|0)+2|0;c[j>>2]=p;r=e+152|0;t=(c[r>>2]|0)+2|0;c[r>>2]=t;u=1<<(b[n>>1]&31)&c[e+88+((b[h>>1]&7)<<2)>>2];v=e+372|0;c[v>>2]=(c[v>>2]|0)+10;v=e+166|0;w=b[v>>1]|0;b[v>>1]=(u|0)==0?w|4:w&-5;if((p&1|0)!=0){iA(e,p,0,0);i=f;return}b[n>>1]=s;s=p&16777215;n=s+1|0;do{if(n>>>0<(c[q>>2]|0)>>>0){w=c[e+32>>2]|0;b[m>>1]=d[w+s|0]<<8|d[w+n|0];x=p;y=t}else{w=b6[c[e+12>>2]&63](c[e+4>>2]|0,s)|0;u=(a[o]|0)==0;b[m>>1]=w;if(u){x=c[j>>2]|0;y=c[r>>2]|0;break}iy(e);i=f;return}}while(0);c[j>>2]=x+2;c[r>>2]=y+2;i=f;return}if(!l){iA(e,k,0,0);i=f;return}l=e+164|0;y=e+162|0;b[y>>1]=b[l>>1]|0;r=k&16777215;k=r+1|0;x=e+36|0;if(k>>>0<(c[x>>2]|0)>>>0){m=c[e+32>>2]|0;z=d[m+r|0]<<8|d[m+k|0]}else{z=b6[c[e+12>>2]&63](c[e+4>>2]|0,r)|0}b[l>>1]=z;z=e+336|0;if((a[z]|0)!=0){iy(e);i=f;return}c[j>>2]=(c[j>>2]|0)+2;r=e+152|0;c[r>>2]=(c[r>>2]|0)+2;k=b[y>>1]|0;m=b[h>>1]&63;if((b5[c[20600+(m<<2)>>2]&127](e,m,2044,8)|0)!=0){i=f;return}if((mI(e,g)|0)!=0){i=f;return}m=d[g]&1<<(k&7);k=e+372|0;c[k>>2]=(c[k>>2]|0)+8;k=e+166|0;g=b[k>>1]|0;b[k>>1]=(m|0)==0?g|4:g&-5;g=c[j>>2]|0;if((g&1|0)!=0){iA(e,g,0,0);i=f;return}b[y>>1]=b[l>>1]|0;y=g&16777215;g=y+1|0;if(g>>>0<(c[x>>2]|0)>>>0){x=c[e+32>>2]|0;A=d[x+y|0]<<8|d[x+g|0]}else{A=b6[c[e+12>>2]&63](c[e+4>>2]|0,y)|0}b[l>>1]=A;if((a[z]|0)==0){c[j>>2]=(c[j>>2]|0)+2;c[r>>2]=(c[r>>2]|0)+2;i=f;return}else{iy(e);i=f;return}}function i7(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;f=i;i=i+8|0;g=f|0;h=e+160|0;j=e+156|0;k=c[j>>2]|0;l=(k&1|0)==0;if((b[h>>1]&56)==0){if(!l){iA(e,k,0,0);i=f;return}m=e+164|0;n=e+162|0;b[n>>1]=b[m>>1]|0;o=k&16777215;p=o+1|0;q=e+36|0;if(p>>>0<(c[q>>2]|0)>>>0){r=c[e+32>>2]|0;s=d[r+o|0]<<8|d[r+p|0]}else{s=b6[c[e+12>>2]&63](c[e+4>>2]|0,o)|0}b[m>>1]=s;o=e+336|0;if((a[o]|0)!=0){iy(e);i=f;return}p=(c[j>>2]|0)+2|0;c[j>>2]=p;r=e+152|0;t=(c[r>>2]|0)+2|0;c[r>>2]=t;u=e+88+((b[h>>1]&7)<<2)|0;v=c[u>>2]|0;w=1<<(b[n>>1]&31);x=w^v;y=e+372|0;c[y>>2]=(c[y>>2]|0)+12;y=e+166|0;z=b[y>>1]|0;b[y>>1]=(w&v|0)==0?z|4:z&-5;if((p&1|0)!=0){iA(e,p,0,0);i=f;return}b[n>>1]=s;s=p&16777215;n=s+1|0;do{if(n>>>0<(c[q>>2]|0)>>>0){z=c[e+32>>2]|0;b[m>>1]=d[z+s|0]<<8|d[z+n|0];A=p;B=t}else{z=b6[c[e+12>>2]&63](c[e+4>>2]|0,s)|0;v=(a[o]|0)==0;b[m>>1]=z;if(v){A=c[j>>2]|0;B=c[r>>2]|0;break}iy(e);i=f;return}}while(0);c[j>>2]=A+2;c[r>>2]=B+2;c[u>>2]=x;i=f;return}if(!l){iA(e,k,0,0);i=f;return}l=e+164|0;x=e+162|0;b[x>>1]=b[l>>1]|0;u=k&16777215;k=u+1|0;B=e+36|0;if(k>>>0<(c[B>>2]|0)>>>0){r=c[e+32>>2]|0;C=d[r+u|0]<<8|d[r+k|0]}else{C=b6[c[e+12>>2]&63](c[e+4>>2]|0,u)|0}b[l>>1]=C;C=e+336|0;if((a[C]|0)!=0){iy(e);i=f;return}c[j>>2]=(c[j>>2]|0)+2;u=e+152|0;c[u>>2]=(c[u>>2]|0)+2;k=b[x>>1]&7;r=b[h>>1]&63;if((b5[c[20600+(r<<2)>>2]&127](e,r,508,8)|0)!=0){i=f;return}if((mI(e,g)|0)!=0){i=f;return}r=1<<k;k=d[g]|0;g=e+372|0;c[g>>2]=(c[g>>2]|0)+12;g=e+166|0;h=b[g>>1]|0;b[g>>1]=(r&k|0)==0?h|4:h&-5;h=c[j>>2]|0;if((h&1|0)!=0){iA(e,h,0,0);i=f;return}b[x>>1]=b[l>>1]|0;x=h&16777215;h=x+1|0;if(h>>>0<(c[B>>2]|0)>>>0){B=c[e+32>>2]|0;D=d[B+x|0]<<8|d[B+h|0]}else{D=b6[c[e+12>>2]&63](c[e+4>>2]|0,x)|0}b[l>>1]=D;if((a[C]|0)==0){c[j>>2]=(c[j>>2]|0)+2;c[u>>2]=(c[u>>2]|0)+2;mQ(e,(k^r)&255)|0;i=f;return}else{iy(e);i=f;return}}function i8(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;f=i;i=i+8|0;g=f|0;h=e+160|0;j=e+156|0;k=c[j>>2]|0;l=(k&1|0)==0;if((b[h>>1]&56)==0){if(!l){iA(e,k,0,0);i=f;return}m=e+164|0;n=e+162|0;b[n>>1]=b[m>>1]|0;o=k&16777215;p=o+1|0;q=e+36|0;if(p>>>0<(c[q>>2]|0)>>>0){r=c[e+32>>2]|0;s=d[r+o|0]<<8|d[r+p|0]}else{s=b6[c[e+12>>2]&63](c[e+4>>2]|0,o)|0}b[m>>1]=s;o=e+336|0;if((a[o]|0)!=0){iy(e);i=f;return}p=(c[j>>2]|0)+2|0;c[j>>2]=p;r=e+152|0;t=(c[r>>2]|0)+2|0;c[r>>2]=t;u=e+88+((b[h>>1]&7)<<2)|0;v=c[u>>2]|0;w=1<<(b[n>>1]&31);x=v&~w;y=e+372|0;c[y>>2]=(c[y>>2]|0)+14;y=e+166|0;z=b[y>>1]|0;b[y>>1]=(w&v|0)==0?z|4:z&-5;if((p&1|0)!=0){iA(e,p,0,0);i=f;return}b[n>>1]=s;s=p&16777215;n=s+1|0;do{if(n>>>0<(c[q>>2]|0)>>>0){z=c[e+32>>2]|0;b[m>>1]=d[z+s|0]<<8|d[z+n|0];A=p;B=t}else{z=b6[c[e+12>>2]&63](c[e+4>>2]|0,s)|0;v=(a[o]|0)==0;b[m>>1]=z;if(v){A=c[j>>2]|0;B=c[r>>2]|0;break}iy(e);i=f;return}}while(0);c[j>>2]=A+2;c[r>>2]=B+2;c[u>>2]=x;i=f;return}if(!l){iA(e,k,0,0);i=f;return}l=e+164|0;x=e+162|0;b[x>>1]=b[l>>1]|0;u=k&16777215;k=u+1|0;B=e+36|0;if(k>>>0<(c[B>>2]|0)>>>0){r=c[e+32>>2]|0;C=d[r+u|0]<<8|d[r+k|0]}else{C=b6[c[e+12>>2]&63](c[e+4>>2]|0,u)|0}b[l>>1]=C;C=e+336|0;if((a[C]|0)!=0){iy(e);i=f;return}c[j>>2]=(c[j>>2]|0)+2;u=e+152|0;c[u>>2]=(c[u>>2]|0)+2;k=b[x>>1]&7;r=b[h>>1]&63;if((b5[c[20600+(r<<2)>>2]&127](e,r,508,8)|0)!=0){i=f;return}if((mI(e,g)|0)!=0){i=f;return}r=1<<k;k=d[g]|0;g=e+372|0;c[g>>2]=(c[g>>2]|0)+12;g=e+166|0;h=b[g>>1]|0;b[g>>1]=(r&k|0)==0?h|4:h&-5;h=c[j>>2]|0;if((h&1|0)!=0){iA(e,h,0,0);i=f;return}b[x>>1]=b[l>>1]|0;x=h&16777215;h=x+1|0;if(h>>>0<(c[B>>2]|0)>>>0){B=c[e+32>>2]|0;D=d[B+x|0]<<8|d[B+h|0]}else{D=b6[c[e+12>>2]&63](c[e+4>>2]|0,x)|0}b[l>>1]=D;if((a[C]|0)==0){c[j>>2]=(c[j>>2]|0)+2;c[u>>2]=(c[u>>2]|0)+2;mQ(e,k&(r^255)&255)|0;i=f;return}else{iy(e);i=f;return}}function i9(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;f=i;i=i+8|0;g=f|0;h=e+160|0;j=e+156|0;k=c[j>>2]|0;l=(k&1|0)==0;if((b[h>>1]&56)==0){if(!l){iA(e,k,0,0);i=f;return}m=e+164|0;n=e+162|0;b[n>>1]=b[m>>1]|0;o=k&16777215;p=o+1|0;q=e+36|0;if(p>>>0<(c[q>>2]|0)>>>0){r=c[e+32>>2]|0;s=d[r+o|0]<<8|d[r+p|0]}else{s=b6[c[e+12>>2]&63](c[e+4>>2]|0,o)|0}b[m>>1]=s;o=e+336|0;if((a[o]|0)!=0){iy(e);i=f;return}p=(c[j>>2]|0)+2|0;c[j>>2]=p;r=e+152|0;t=(c[r>>2]|0)+2|0;c[r>>2]=t;u=e+88+((b[h>>1]&7)<<2)|0;v=c[u>>2]|0;w=1<<(b[n>>1]&31);x=w|v;y=e+372|0;c[y>>2]=(c[y>>2]|0)+12;y=e+166|0;z=b[y>>1]|0;b[y>>1]=(w&v|0)==0?z|4:z&-5;if((p&1|0)!=0){iA(e,p,0,0);i=f;return}b[n>>1]=s;s=p&16777215;n=s+1|0;do{if(n>>>0<(c[q>>2]|0)>>>0){z=c[e+32>>2]|0;b[m>>1]=d[z+s|0]<<8|d[z+n|0];A=p;B=t}else{z=b6[c[e+12>>2]&63](c[e+4>>2]|0,s)|0;v=(a[o]|0)==0;b[m>>1]=z;if(v){A=c[j>>2]|0;B=c[r>>2]|0;break}iy(e);i=f;return}}while(0);c[j>>2]=A+2;c[r>>2]=B+2;c[u>>2]=x;i=f;return}if(!l){iA(e,k,0,0);i=f;return}l=e+164|0;x=e+162|0;b[x>>1]=b[l>>1]|0;u=k&16777215;k=u+1|0;B=e+36|0;if(k>>>0<(c[B>>2]|0)>>>0){r=c[e+32>>2]|0;C=d[r+u|0]<<8|d[r+k|0]}else{C=b6[c[e+12>>2]&63](c[e+4>>2]|0,u)|0}b[l>>1]=C;C=e+336|0;if((a[C]|0)!=0){iy(e);i=f;return}c[j>>2]=(c[j>>2]|0)+2;u=e+152|0;c[u>>2]=(c[u>>2]|0)+2;k=b[x>>1]&7;r=b[h>>1]&63;if((b5[c[20600+(r<<2)>>2]&127](e,r,508,8)|0)!=0){i=f;return}if((mI(e,g)|0)!=0){i=f;return}r=1<<k;k=d[g]|0;g=e+372|0;c[g>>2]=(c[g>>2]|0)+12;g=e+166|0;h=b[g>>1]|0;b[g>>1]=(r&k|0)==0?h|4:h&-5;h=c[j>>2]|0;if((h&1|0)!=0){iA(e,h,0,0);i=f;return}b[x>>1]=b[l>>1]|0;x=h&16777215;h=x+1|0;if(h>>>0<(c[B>>2]|0)>>>0){B=c[e+32>>2]|0;D=d[B+x|0]<<8|d[B+h|0]}else{D=b6[c[e+12>>2]&63](c[e+4>>2]|0,x)|0}b[l>>1]=D;if((a[C]|0)==0){c[j>>2]=(c[j>>2]|0)+2;c[u>>2]=(c[u>>2]|0)+2;mQ(e,(k|r)&255)|0;i=f;return}else{iy(e);i=f;return}}function ja(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;f=i;i=i+8|0;g=f|0;h=e+156|0;j=c[h>>2]|0;if((j&1|0)!=0){iA(e,j,0,0);i=f;return}k=e+164|0;l=e+162|0;b[l>>1]=b[k>>1]|0;m=j&16777215;j=m+1|0;n=e+36|0;if(j>>>0<(c[n>>2]|0)>>>0){o=c[e+32>>2]|0;p=d[o+m|0]<<8|d[o+j|0]}else{p=b6[c[e+12>>2]&63](c[e+4>>2]|0,m)|0}b[k>>1]=p;m=e+336|0;if((a[m]|0)!=0){iy(e);i=f;return}j=(c[h>>2]|0)+2|0;c[h>>2]=j;o=e+152|0;c[o>>2]=(c[o>>2]|0)+2;q=b[l>>1]|0;r=b[e+160>>1]&63;if((r|0)==60){s=e+372|0;c[s>>2]=(c[s>>2]|0)+20;if((j&1|0)!=0){iA(e,j,0,0);i=f;return}b[l>>1]=p;p=j&16777215;j=p+1|0;do{if(j>>>0<(c[n>>2]|0)>>>0){s=c[e+32>>2]|0;b[k>>1]=d[s+p|0]<<8|d[s+j|0]}else{s=b6[c[e+12>>2]&63](c[e+4>>2]|0,p)|0;t=(a[m]|0)==0;b[k>>1]=s;if(t){break}iy(e);i=f;return}}while(0);c[h>>2]=(c[h>>2]|0)+2;c[o>>2]=(c[o>>2]|0)+2;p=e+166|0;j=b[p>>1]|0;b[p>>1]=(j^q)&31|j&-256;i=f;return}if((b5[c[20600+(r<<2)>>2]&127](e,r,509,8)|0)!=0){i=f;return}if((mI(e,g)|0)!=0){i=f;return}r=a[g]^q&255;q=e+372|0;c[q>>2]=(c[q>>2]|0)+8;l7(e,15,r);q=c[h>>2]|0;if((q&1|0)!=0){iA(e,q,0,0);i=f;return}b[l>>1]=b[k>>1]|0;l=q&16777215;q=l+1|0;if(q>>>0<(c[n>>2]|0)>>>0){n=c[e+32>>2]|0;u=d[n+l|0]<<8|d[n+q|0]}else{u=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[k>>1]=u;if((a[m]|0)==0){c[h>>2]=(c[h>>2]|0)+2;c[o>>2]=(c[o>>2]|0)+2;mQ(e,r)|0;i=f;return}else{iy(e);i=f;return}}function jb(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;f=i;i=i+8|0;g=f|0;h=e+160|0;if((b[h>>1]&63)==60){if((a[e+334|0]|0)==0){iF(e);i=f;return}j=e+156|0;k=c[j>>2]|0;if((k&1|0)!=0){iA(e,k,0,0);i=f;return}l=e+164|0;m=e+162|0;b[m>>1]=b[l>>1]|0;n=k&16777215;k=n+1|0;o=e+36|0;if(k>>>0<(c[o>>2]|0)>>>0){p=c[e+32>>2]|0;q=d[p+n|0]<<8|d[p+k|0]}else{q=b6[c[e+12>>2]&63](c[e+4>>2]|0,n)|0}b[l>>1]=q;n=e+336|0;if((a[n]|0)!=0){iy(e);i=f;return}k=(c[j>>2]|0)+2|0;c[j>>2]=k;p=e+152|0;r=(c[p>>2]|0)+2|0;c[p>>2]=r;s=b[m>>1]|0;t=e+372|0;c[t>>2]=(c[t>>2]|0)+20;if((k&1|0)!=0){iA(e,k,0,0);i=f;return}b[m>>1]=q;q=k&16777215;m=q+1|0;do{if(m>>>0<(c[o>>2]|0)>>>0){t=c[e+32>>2]|0;b[l>>1]=d[t+q|0]<<8|d[t+m|0];u=k;v=r}else{t=b6[c[e+12>>2]&63](c[e+4>>2]|0,q)|0;w=(a[n]|0)==0;b[l>>1]=t;if(w){u=c[j>>2]|0;v=c[p>>2]|0;break}iy(e);i=f;return}}while(0);c[j>>2]=u+2;c[p>>2]=v+2;is(e,(b[e+166>>1]^s)&-22753);i=f;return}s=e+156|0;v=c[s>>2]|0;if((v&1|0)!=0){iA(e,v,0,0);i=f;return}p=e+164|0;u=e+162|0;b[u>>1]=b[p>>1]|0;j=v&16777215;v=j+1|0;l=e+36|0;if(v>>>0<(c[l>>2]|0)>>>0){n=c[e+32>>2]|0;x=d[n+j|0]<<8|d[n+v|0]}else{x=b6[c[e+12>>2]&63](c[e+4>>2]|0,j)|0}b[p>>1]=x;x=e+336|0;if((a[x]|0)!=0){iy(e);i=f;return}c[s>>2]=(c[s>>2]|0)+2;j=e+152|0;c[j>>2]=(c[j>>2]|0)+2;v=b[u>>1]|0;n=b[h>>1]&63;if((b5[c[20600+(n<<2)>>2]&127](e,n,509,16)|0)!=0){i=f;return}if((mJ(e,g)|0)!=0){i=f;return}n=b[g>>1]^v;l8(e,15,n);v=e+372|0;c[v>>2]=(c[v>>2]|0)+8;v=c[s>>2]|0;if((v&1|0)!=0){iA(e,v,0,0);i=f;return}b[u>>1]=b[p>>1]|0;u=v&16777215;v=u+1|0;if(v>>>0<(c[l>>2]|0)>>>0){l=c[e+32>>2]|0;y=d[l+u|0]<<8|d[l+v|0]}else{y=b6[c[e+12>>2]&63](c[e+4>>2]|0,u)|0}b[p>>1]=y;if((a[x]|0)==0){c[s>>2]=(c[s>>2]|0)+2;c[j>>2]=(c[j>>2]|0)+2;mR(e,n)|0;i=f;return}else{iy(e);i=f;return}}function jc(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=i;i=i+8|0;h=g|0;j=f+156|0;k=c[j>>2]|0;if((k&1|0)!=0){iA(f,k,0,0);i=g;return}l=f+164|0;m=f+162|0;b[m>>1]=b[l>>1]|0;n=k&16777215;k=n+1|0;o=f+36|0;if(k>>>0<(c[o>>2]|0)>>>0){p=c[f+32>>2]|0;q=d[p+n|0]<<8|d[p+k|0]}else{q=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[l>>1]=q;n=f+336|0;if((a[n]|0)!=0){iy(f);i=g;return}k=(c[j>>2]|0)+2|0;c[j>>2]=k;p=f+152|0;c[p>>2]=(c[p>>2]|0)+2;r=b[m>>1]|0;if((k&1|0)!=0){iA(f,k,0,0);i=g;return}b[m>>1]=q;q=k&16777215;k=q+1|0;do{if(k>>>0<(c[o>>2]|0)>>>0){s=c[f+32>>2]|0;b[l>>1]=d[s+q|0]<<8|d[s+k|0]}else{s=b6[c[f+12>>2]&63](c[f+4>>2]|0,q)|0;t=(a[n]|0)==0;b[l>>1]=s;if(t){break}iy(f);i=g;return}}while(0);c[j>>2]=(c[j>>2]|0)+2;c[p>>2]=(c[p>>2]|0)+2;q=e[m>>1]|(r&65535)<<16;r=b[f+160>>1]&63;if((b5[c[20600+(r<<2)>>2]&127](f,r,509,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}r=c[h>>2]^q;q=f+372|0;c[q>>2]=(c[q>>2]|0)+12;l9(f,15,r);q=c[j>>2]|0;if((q&1|0)!=0){iA(f,q,0,0);i=g;return}b[m>>1]=b[l>>1]|0;m=q&16777215;q=m+1|0;if(q>>>0<(c[o>>2]|0)>>>0){o=c[f+32>>2]|0;u=d[o+m|0]<<8|d[o+q|0]}else{u=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[l>>1]=u;if((a[n]|0)==0){c[j>>2]=(c[j>>2]|0)+2;c[p>>2]=(c[p>>2]|0)+2;mS(f,r)|0;i=g;return}else{iy(f);i=g;return}}function jd(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;f=i;i=i+8|0;g=f|0;h=e+156|0;j=c[h>>2]|0;if((j&1|0)!=0){iA(e,j,0,0);i=f;return}k=e+164|0;l=e+162|0;b[l>>1]=b[k>>1]|0;m=j&16777215;j=m+1|0;n=e+36|0;if(j>>>0<(c[n>>2]|0)>>>0){o=c[e+32>>2]|0;p=d[o+m|0]<<8|d[o+j|0]}else{p=b6[c[e+12>>2]&63](c[e+4>>2]|0,m)|0}b[k>>1]=p;p=e+336|0;if((a[p]|0)!=0){iy(e);i=f;return}c[h>>2]=(c[h>>2]|0)+2;m=e+152|0;c[m>>2]=(c[m>>2]|0)+2;j=b[l>>1]&255;o=b[e+160>>1]&63;if((b5[c[20600+(o<<2)>>2]&127](e,o,2045,8)|0)!=0){i=f;return}if((mI(e,g)|0)!=0){i=f;return}o=e+372|0;c[o>>2]=(c[o>>2]|0)+8;o=a[g]|0;mk(e,o-j&255,j,o);o=c[h>>2]|0;if((o&1|0)!=0){iA(e,o,0,0);i=f;return}b[l>>1]=b[k>>1]|0;l=o&16777215;o=l+1|0;if(o>>>0<(c[n>>2]|0)>>>0){n=c[e+32>>2]|0;q=d[n+l|0]<<8|d[n+o|0]}else{q=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[k>>1]=q;if((a[p]|0)==0){c[h>>2]=(c[h>>2]|0)+2;c[m>>2]=(c[m>>2]|0)+2;i=f;return}else{iy(e);i=f;return}}function je(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;f=i;i=i+8|0;g=f|0;h=e+156|0;j=c[h>>2]|0;if((j&1|0)!=0){iA(e,j,0,0);i=f;return}k=e+164|0;l=e+162|0;b[l>>1]=b[k>>1]|0;m=j&16777215;j=m+1|0;n=e+36|0;if(j>>>0<(c[n>>2]|0)>>>0){o=c[e+32>>2]|0;p=d[o+m|0]<<8|d[o+j|0]}else{p=b6[c[e+12>>2]&63](c[e+4>>2]|0,m)|0}b[k>>1]=p;p=e+336|0;if((a[p]|0)!=0){iy(e);i=f;return}c[h>>2]=(c[h>>2]|0)+2;m=e+152|0;c[m>>2]=(c[m>>2]|0)+2;j=b[l>>1]|0;o=b[e+160>>1]&63;if((b5[c[20600+(o<<2)>>2]&127](e,o,2045,16)|0)!=0){i=f;return}if((mJ(e,g)|0)!=0){i=f;return}o=e+372|0;c[o>>2]=(c[o>>2]|0)+8;o=b[g>>1]|0;ml(e,o-j&65535,j,o);o=c[h>>2]|0;if((o&1|0)!=0){iA(e,o,0,0);i=f;return}b[l>>1]=b[k>>1]|0;l=o&16777215;o=l+1|0;if(o>>>0<(c[n>>2]|0)>>>0){n=c[e+32>>2]|0;q=d[n+l|0]<<8|d[n+o|0]}else{q=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[k>>1]=q;if((a[p]|0)==0){c[h>>2]=(c[h>>2]|0)+2;c[m>>2]=(c[m>>2]|0)+2;i=f;return}else{iy(e);i=f;return}}function jf(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=i;i=i+8|0;h=g|0;j=f+156|0;k=c[j>>2]|0;if((k&1|0)!=0){iA(f,k,0,0);i=g;return}l=f+164|0;m=f+162|0;b[m>>1]=b[l>>1]|0;n=k&16777215;k=n+1|0;o=f+36|0;if(k>>>0<(c[o>>2]|0)>>>0){p=c[f+32>>2]|0;q=d[p+n|0]<<8|d[p+k|0]}else{q=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[l>>1]=q;n=f+336|0;if((a[n]|0)!=0){iy(f);i=g;return}k=(c[j>>2]|0)+2|0;c[j>>2]=k;p=f+152|0;c[p>>2]=(c[p>>2]|0)+2;r=b[m>>1]|0;if((k&1|0)!=0){iA(f,k,0,0);i=g;return}b[m>>1]=q;q=k&16777215;k=q+1|0;do{if(k>>>0<(c[o>>2]|0)>>>0){s=c[f+32>>2]|0;b[l>>1]=d[s+q|0]<<8|d[s+k|0]}else{s=b6[c[f+12>>2]&63](c[f+4>>2]|0,q)|0;t=(a[n]|0)==0;b[l>>1]=s;if(t){break}iy(f);i=g;return}}while(0);c[j>>2]=(c[j>>2]|0)+2;c[p>>2]=(c[p>>2]|0)+2;q=e[m>>1]|(r&65535)<<16;r=b[f+160>>1]&63;if((b5[c[20600+(r<<2)>>2]&127](f,r,2045,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}r=f+372|0;c[r>>2]=(c[r>>2]|0)+12;r=c[h>>2]|0;mm(f,r-q|0,q,r);r=c[j>>2]|0;if((r&1|0)!=0){iA(f,r,0,0);i=g;return}b[m>>1]=b[l>>1]|0;m=r&16777215;r=m+1|0;if(r>>>0<(c[o>>2]|0)>>>0){o=c[f+32>>2]|0;u=d[o+m|0]<<8|d[o+r|0]}else{u=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[l>>1]=u;if((a[n]|0)==0){c[j>>2]=(c[j>>2]|0)+2;c[p>>2]=(c[p>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}function jg(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;g=i;i=i+8|0;h=g|0;if((c[f>>2]&2|0)==0){iB(f);j=f+372|0;c[j>>2]=(c[j>>2]|0)+2;i=g;return}j=f+156|0;k=c[j>>2]|0;if((k&1|0)!=0){iA(f,k,0,0);i=g;return}l=f+164|0;m=f+162|0;b[m>>1]=b[l>>1]|0;n=k&16777215;k=n+1|0;o=f+36|0;if(k>>>0<(c[o>>2]|0)>>>0){p=c[f+32>>2]|0;q=d[p+n|0]<<8|d[p+k|0]}else{q=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[l>>1]=q;q=f+336|0;if((a[q]|0)!=0){iy(f);i=g;return}c[j>>2]=(c[j>>2]|0)+2;n=f+152|0;c[n>>2]=(c[n>>2]|0)+2;k=f+160|0;p=e[m>>1]|0;r=p>>>12;do{if((p&2048|0)==0){s=b[k>>1]&63;if((b5[c[20600+(s<<2)>>2]&127](f,s,508,8)|0)!=0){i=g;return}if((mI(f,h)|0)!=0){i=g;return}s=r&7;t=a[h]|0;if((r&8|0)==0){u=f+88+(s<<2)|0;c[u>>2]=c[u>>2]&-256|t&255;break}else{u=t&255;c[f+120+(s<<2)>>2]=(u&128|0)!=0?u|-256:u;break}}else{u=r&7;if((r&8|0)==0){v=f+88+(u<<2)|0}else{v=f+120+(u<<2)|0}a[h]=c[v>>2]&255;u=b[k>>1]&63;if((b5[c[20600+(u<<2)>>2]&127](f,u,508,8)|0)!=0){i=g;return}if((mQ(f,a[h]|0)|0)==0){break}i=g;return}}while(0);h=f+372|0;c[h>>2]=(c[h>>2]|0)+4;h=c[j>>2]|0;if((h&1|0)!=0){iA(f,h,0,0);i=g;return}b[m>>1]=b[l>>1]|0;m=h&16777215;h=m+1|0;if(h>>>0<(c[o>>2]|0)>>>0){o=c[f+32>>2]|0;w=d[o+m|0]<<8|d[o+h|0]}else{w=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[l>>1]=w;if((a[q]|0)==0){c[j>>2]=(c[j>>2]|0)+2;c[n>>2]=(c[n>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}function jh(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;g=i;i=i+8|0;h=g|0;if((c[f>>2]&2|0)==0){iB(f);j=f+372|0;c[j>>2]=(c[j>>2]|0)+2;i=g;return}j=f+156|0;k=c[j>>2]|0;if((k&1|0)!=0){iA(f,k,0,0);i=g;return}l=f+164|0;m=f+162|0;b[m>>1]=b[l>>1]|0;n=k&16777215;k=n+1|0;o=f+36|0;if(k>>>0<(c[o>>2]|0)>>>0){p=c[f+32>>2]|0;q=d[p+n|0]<<8|d[p+k|0]}else{q=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[l>>1]=q;q=f+336|0;if((a[q]|0)!=0){iy(f);i=g;return}c[j>>2]=(c[j>>2]|0)+2;n=f+152|0;c[n>>2]=(c[n>>2]|0)+2;k=f+160|0;p=e[m>>1]|0;r=p>>>12;do{if((p&2048|0)==0){s=b[k>>1]&63;if((b5[c[20600+(s<<2)>>2]&127](f,s,508,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}s=r&7;t=b[h>>1]|0;if((r&8|0)==0){u=f+88+(s<<2)|0;c[u>>2]=c[u>>2]&-65536|t&65535;break}else{u=t&65535;c[f+120+(s<<2)>>2]=(u&32768|0)==0?u:u|-65536;break}}else{u=r&7;if((r&8|0)==0){v=f+88+(u<<2)|0}else{v=f+120+(u<<2)|0}b[h>>1]=c[v>>2]&65535;u=b[k>>1]&63;if((b5[c[20600+(u<<2)>>2]&127](f,u,508,16)|0)!=0){i=g;return}if((mR(f,b[h>>1]|0)|0)==0){break}i=g;return}}while(0);h=f+372|0;c[h>>2]=(c[h>>2]|0)+4;h=c[j>>2]|0;if((h&1|0)!=0){iA(f,h,0,0);i=g;return}b[m>>1]=b[l>>1]|0;m=h&16777215;h=m+1|0;if(h>>>0<(c[o>>2]|0)>>>0){o=c[f+32>>2]|0;w=d[o+m|0]<<8|d[o+h|0]}else{w=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[l>>1]=w;if((a[q]|0)==0){c[j>>2]=(c[j>>2]|0)+2;c[n>>2]=(c[n>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}function ji(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;i=i+8|0;h=g|0;if((c[f>>2]&2|0)==0){iB(f);j=f+372|0;c[j>>2]=(c[j>>2]|0)+2;i=g;return}j=f+156|0;k=c[j>>2]|0;if((k&1|0)!=0){iA(f,k,0,0);i=g;return}l=f+164|0;m=f+162|0;b[m>>1]=b[l>>1]|0;n=k&16777215;k=n+1|0;o=f+36|0;if(k>>>0<(c[o>>2]|0)>>>0){p=c[f+32>>2]|0;q=d[p+n|0]<<8|d[p+k|0]}else{q=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[l>>1]=q;q=f+336|0;if((a[q]|0)!=0){iy(f);i=g;return}c[j>>2]=(c[j>>2]|0)+2;n=f+152|0;c[n>>2]=(c[n>>2]|0)+2;k=f+160|0;p=e[m>>1]|0;r=p>>>12;do{if((p&2048|0)==0){s=b[k>>1]&63;if((b5[c[20600+(s<<2)>>2]&127](f,s,508,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}s=r&7;t=c[h>>2]|0;if((r&8|0)==0){c[f+88+(s<<2)>>2]=t;break}else{c[f+120+(s<<2)>>2]=t;break}}else{t=r&7;if((r&8|0)==0){u=f+88+(t<<2)|0}else{u=f+120+(t<<2)|0}c[h>>2]=c[u>>2];t=b[k>>1]&63;if((b5[c[20600+(t<<2)>>2]&127](f,t,508,32)|0)!=0){i=g;return}if((mS(f,c[h>>2]|0)|0)==0){break}i=g;return}}while(0);h=f+372|0;c[h>>2]=(c[h>>2]|0)+4;h=c[j>>2]|0;if((h&1|0)!=0){iA(f,h,0,0);i=g;return}b[m>>1]=b[l>>1]|0;m=h&16777215;h=m+1|0;if(h>>>0<(c[o>>2]|0)>>>0){o=c[f+32>>2]|0;v=d[o+m|0]<<8|d[o+h|0]}else{v=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[l>>1]=v;if((a[q]|0)==0){c[j>>2]=(c[j>>2]|0)+2;c[n>>2]=(c[n>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}function jj(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g|0;j=f+160|0;k=b[j>>1]&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4095,8)|0)!=0){i=g;return}if((mI(f,h)|0)!=0){i=g;return}k=e[j>>1]|0;j=k>>>3&56|k>>>9&7;if((b5[c[20600+(j<<2)>>2]&127](f,j,509,8)|0)!=0){i=g;return}if((mQ(f,a[h]|0)|0)!=0){i=g;return}j=f+372|0;c[j>>2]=(c[j>>2]|0)+4;l7(f,15,a[h]|0);h=f+156|0;j=c[h>>2]|0;if((j&1|0)!=0){iA(f,j,0,0);i=g;return}k=f+164|0;b[f+162>>1]=b[k>>1]|0;l=j&16777215;j=l+1|0;if(j>>>0<(c[f+36>>2]|0)>>>0){m=c[f+32>>2]|0;n=d[m+l|0]<<8|d[m+j|0]}else{n=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[k>>1]=n;if((a[f+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=f+152|0;c[h>>2]=(c[h>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}function jk(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g|0;j=f+160|0;k=b[j>>1]&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4095,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}k=e[j>>1]|0;j=k>>>3&56|k>>>9&7;if((b5[c[20600+(j<<2)>>2]&127](f,j,509,32)|0)!=0){i=g;return}if((mS(f,c[h>>2]|0)|0)!=0){i=g;return}j=f+372|0;c[j>>2]=(c[j>>2]|0)+4;l9(f,15,c[h>>2]|0);h=f+156|0;j=c[h>>2]|0;if((j&1|0)!=0){iA(f,j,0,0);i=g;return}k=f+164|0;b[f+162>>1]=b[k>>1]|0;l=j&16777215;j=l+1|0;if(j>>>0<(c[f+36>>2]|0)>>>0){m=c[f+32>>2]|0;n=d[m+l|0]<<8|d[m+j|0]}else{n=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[k>>1]=n;if((a[f+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=f+152|0;c[h>>2]=(c[h>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}function jl(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g|0;j=f+160|0;k=b[j>>1]&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4095,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}c[f+120+(((e[j>>1]|0)>>>9&7)<<2)>>2]=c[h>>2];h=f+372|0;c[h>>2]=(c[h>>2]|0)+4;h=f+156|0;j=c[h>>2]|0;if((j&1|0)!=0){iA(f,j,0,0);i=g;return}k=f+164|0;b[f+162>>1]=b[k>>1]|0;l=j&16777215;j=l+1|0;if(j>>>0<(c[f+36>>2]|0)>>>0){m=c[f+32>>2]|0;n=d[m+l|0]<<8|d[m+j|0]}else{n=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[k>>1]=n;if((a[f+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=f+152|0;c[h>>2]=(c[h>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}function jm(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g|0;j=f+160|0;k=b[j>>1]&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4095,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}k=e[j>>1]|0;j=k>>>3&56|k>>>9&7;if((b5[c[20600+(j<<2)>>2]&127](f,j,509,16)|0)!=0){i=g;return}if((mR(f,b[h>>1]|0)|0)!=0){i=g;return}j=f+372|0;c[j>>2]=(c[j>>2]|0)+4;l8(f,15,b[h>>1]|0);h=f+156|0;j=c[h>>2]|0;if((j&1|0)!=0){iA(f,j,0,0);i=g;return}k=f+164|0;b[f+162>>1]=b[k>>1]|0;l=j&16777215;j=l+1|0;if(j>>>0<(c[f+36>>2]|0)>>>0){m=c[f+32>>2]|0;n=d[m+l|0]<<8|d[m+j|0]}else{n=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[k>>1]=n;if((a[f+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=f+152|0;c[h>>2]=(c[h>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}function jn(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g|0;j=f+160|0;k=b[j>>1]&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4095,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}k=e[h>>1]|0;c[f+120+(((e[j>>1]|0)>>>9&7)<<2)>>2]=(k&32768|0)!=0?k|-65536:k;k=f+372|0;c[k>>2]=(c[k>>2]|0)+4;k=f+156|0;j=c[k>>2]|0;if((j&1|0)!=0){iA(f,j,0,0);i=g;return}h=f+164|0;b[f+162>>1]=b[h>>1]|0;l=j&16777215;j=l+1|0;if(j>>>0<(c[f+36>>2]|0)>>>0){m=c[f+32>>2]|0;n=d[m+l|0]<<8|d[m+j|0]}else{n=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[h>>1]=n;if((a[f+336|0]|0)==0){c[k>>2]=(c[k>>2]|0)+2;k=f+152|0;c[k>>2]=(c[k>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}function jo(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+8|0;g=f|0;h=b[e+160>>1]&63;if((b5[c[20600+(h<<2)>>2]&127](e,h,509,8)|0)!=0){i=f;return}if((mI(e,g)|0)!=0){i=f;return}h=d[g]|0;g=e+166|0;j=b[g>>1]|0;k=-(((j&65535)>>>4&1)+h|0)|0;if((k&255|0)==0){l=j}else{m=j&-5;b[g>>1]=m;l=m}m=e+372|0;c[m>>2]=(c[m>>2]|0)+8;m=k&128;j=(m|0)==0?l&-9:l|8;l=(m&h|0)==0?j&-3:j|2;b[g>>1]=((h|k)&128|0)==0?l&-18:l|17;l=e+156|0;h=c[l>>2]|0;if((h&1|0)!=0){iA(e,h,0,0);i=f;return}g=e+164|0;b[e+162>>1]=b[g>>1]|0;j=h&16777215;h=j+1|0;if(h>>>0<(c[e+36>>2]|0)>>>0){m=c[e+32>>2]|0;n=d[m+j|0]<<8|d[m+h|0]}else{n=b6[c[e+12>>2]&63](c[e+4>>2]|0,j)|0}b[g>>1]=n;if((a[e+336|0]|0)==0){c[l>>2]=(c[l>>2]|0)+2;l=e+152|0;c[l>>2]=(c[l>>2]|0)+2;mQ(e,k&255)|0;i=f;return}else{iy(e);i=f;return}}function jp(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;i=i+8|0;h=g|0;j=b[f+160>>1]&63;if((b5[c[20600+(j<<2)>>2]&127](f,j,509,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}j=e[h>>1]|0;h=f+166|0;k=b[h>>1]|0;l=-(((k&65535)>>>4&1)+j|0)|0;if((l&65535|0)==0){m=k}else{n=k&-5;b[h>>1]=n;m=n}n=f+372|0;c[n>>2]=(c[n>>2]|0)+8;n=l&32768;k=(n|0)==0?m&-9:m|8;m=(n&j|0)==0?k&-3:k|2;b[h>>1]=((j|l)&32768|0)==0?m&-18:m|17;m=f+156|0;j=c[m>>2]|0;if((j&1|0)!=0){iA(f,j,0,0);i=g;return}h=f+164|0;b[f+162>>1]=b[h>>1]|0;k=j&16777215;j=k+1|0;if(j>>>0<(c[f+36>>2]|0)>>>0){n=c[f+32>>2]|0;o=d[n+k|0]<<8|d[n+j|0]}else{o=b6[c[f+12>>2]&63](c[f+4>>2]|0,k)|0}b[h>>1]=o;if((a[f+336|0]|0)==0){c[m>>2]=(c[m>>2]|0)+2;m=f+152|0;c[m>>2]=(c[m>>2]|0)+2;mR(f,l&65535)|0;i=g;return}else{iy(f);i=g;return}}function jq(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;i=i+8|0;g=f|0;h=b[e+160>>1]&63;if((b5[c[20600+(h<<2)>>2]&127](e,h,509,32)|0)!=0){i=f;return}if((mK(e,g)|0)!=0){i=f;return}h=c[g>>2]|0;g=-h|0;j=e+166|0;k=b[j>>1]|0;l=(k&65535)>>>4&1;m=g-l|0;if((l|0)==(g|0)){n=k}else{g=k&-5;b[j>>1]=g;n=g}g=e+372|0;c[g>>2]=(c[g>>2]|0)+10;g=(m|0)<0?n|8:n&-9;n=(h&m|0)<0?g|2:g&-3;b[j>>1]=(h|m|0)<0?n|17:n&-18;n=e+156|0;h=c[n>>2]|0;if((h&1|0)!=0){iA(e,h,0,0);i=f;return}j=e+164|0;b[e+162>>1]=b[j>>1]|0;g=h&16777215;h=g+1|0;if(h>>>0<(c[e+36>>2]|0)>>>0){k=c[e+32>>2]|0;o=d[k+g|0]<<8|d[k+h|0]}else{o=b6[c[e+12>>2]&63](c[e+4>>2]|0,g)|0}b[j>>1]=o;if((a[e+336|0]|0)==0){c[n>>2]=(c[n>>2]|0)+2;n=e+152|0;c[n>>2]=(c[n>>2]|0)+2;mS(e,m)|0;i=f;return}else{iy(e);i=f;return}}function jr(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+8|0;g=f|0;do{if((c[e>>2]&2|0)!=0){if((a[e+334|0]|0)!=0){break}iF(e);i=f;return}}while(0);h=b[e+160>>1]&63;if((b5[c[20600+(h<<2)>>2]&127](e,h,509,16)|0)!=0){i=f;return}if((mJ(e,g)|0)!=0){i=f;return}b[g>>1]=b[e+166>>1]&-22753;h=e+372|0;c[h>>2]=(c[h>>2]|0)+4;h=e+156|0;j=c[h>>2]|0;if((j&1|0)!=0){iA(e,j,0,0);i=f;return}k=e+164|0;b[e+162>>1]=b[k>>1]|0;l=j&16777215;j=l+1|0;if(j>>>0<(c[e+36>>2]|0)>>>0){m=c[e+32>>2]|0;n=d[m+l|0]<<8|d[m+j|0]}else{n=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[k>>1]=n;if((a[e+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=e+152|0;c[h>>2]=(c[h>>2]|0)+2;h=b[g>>1]|0;mR(e,h)|0;i=f;return}else{iy(e);i=f;return}}function js(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+8|0;h=g|0;j=f+160|0;k=b[j>>1]&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4093,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}k=c[f+88+(((e[j>>1]|0)>>>9&7)<<2)>>2]|0;do{if((k&32768|0)==0){j=e[h>>1]|0;if((j&32768|0)!=0|(k&65535)>>>0>j>>>0){j=f+166|0;b[j>>1]=b[j>>1]&-9;j=f+372|0;c[j>>2]=(c[j>>2]|0)+14;break}j=f+372|0;c[j>>2]=(c[j>>2]|0)+14;j=f+156|0;l=c[j>>2]|0;if((l&1|0)!=0){iA(f,l,0,0);i=g;return}m=f+164|0;b[f+162>>1]=b[m>>1]|0;n=l&16777215;l=n+1|0;if(l>>>0<(c[f+36>>2]|0)>>>0){o=c[f+32>>2]|0;p=d[o+n|0]<<8|d[o+l|0]}else{p=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[m>>1]=p;if((a[f+336|0]|0)==0){c[j>>2]=(c[j>>2]|0)+2;j=f+152|0;c[j>>2]=(c[j>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}else{j=f+166|0;b[j>>1]=b[j>>1]|8;j=f+372|0;c[j>>2]=(c[j>>2]|0)+14}}while(0);iD(f);i=g;return}function jt(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=b[e+160>>1]&63;if((b5[c[20600+(g<<2)>>2]&127](e,g,509,8)|0)!=0){i=f;return}if((mI(e,f|0)|0)!=0){i=f;return}g=e+372|0;c[g>>2]=(c[g>>2]|0)+4;g=e+166|0;b[g>>1]=b[g>>1]&-16|4;g=e+156|0;h=c[g>>2]|0;if((h&1|0)!=0){iA(e,h,0,0);i=f;return}j=e+164|0;b[e+162>>1]=b[j>>1]|0;k=h&16777215;h=k+1|0;if(h>>>0<(c[e+36>>2]|0)>>>0){l=c[e+32>>2]|0;m=d[l+k|0]<<8|d[l+h|0]}else{m=b6[c[e+12>>2]&63](c[e+4>>2]|0,k)|0}b[j>>1]=m;if((a[e+336|0]|0)==0){c[g>>2]=(c[g>>2]|0)+2;g=e+152|0;c[g>>2]=(c[g>>2]|0)+2;mQ(e,0)|0;i=f;return}else{iy(e);i=f;return}}function ju(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=b[e+160>>1]&63;if((b5[c[20600+(g<<2)>>2]&127](e,g,509,16)|0)!=0){i=f;return}if((mJ(e,f|0)|0)!=0){i=f;return}g=e+372|0;c[g>>2]=(c[g>>2]|0)+4;g=e+166|0;b[g>>1]=b[g>>1]&-16|4;g=e+156|0;h=c[g>>2]|0;if((h&1|0)!=0){iA(e,h,0,0);i=f;return}j=e+164|0;b[e+162>>1]=b[j>>1]|0;k=h&16777215;h=k+1|0;if(h>>>0<(c[e+36>>2]|0)>>>0){l=c[e+32>>2]|0;m=d[l+k|0]<<8|d[l+h|0]}else{m=b6[c[e+12>>2]&63](c[e+4>>2]|0,k)|0}b[j>>1]=m;if((a[e+336|0]|0)==0){c[g>>2]=(c[g>>2]|0)+2;g=e+152|0;c[g>>2]=(c[g>>2]|0)+2;mR(e,0)|0;i=f;return}else{iy(e);i=f;return}}function jv(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=b[e+160>>1]&63;if((b5[c[20600+(g<<2)>>2]&127](e,g,509,32)|0)!=0){i=f;return}if((mK(e,f|0)|0)!=0){i=f;return}g=e+372|0;c[g>>2]=(c[g>>2]|0)+6;g=e+166|0;b[g>>1]=b[g>>1]&-16|4;g=e+156|0;h=c[g>>2]|0;if((h&1|0)!=0){iA(e,h,0,0);i=f;return}j=e+164|0;b[e+162>>1]=b[j>>1]|0;k=h&16777215;h=k+1|0;if(h>>>0<(c[e+36>>2]|0)>>>0){l=c[e+32>>2]|0;m=d[l+k|0]<<8|d[l+h|0]}else{m=b6[c[e+12>>2]&63](c[e+4>>2]|0,k)|0}b[j>>1]=m;if((a[e+336|0]|0)==0){c[g>>2]=(c[g>>2]|0)+2;g=e+152|0;c[g>>2]=(c[g>>2]|0)+2;mS(e,0)|0;i=f;return}else{iy(e);i=f;return}}function jw(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+8|0;g=f|0;if((c[e>>2]&2|0)==0){iB(e);h=e+372|0;c[h>>2]=(c[h>>2]|0)+2;i=f;return}h=b[e+160>>1]&63;if((b5[c[20600+(h<<2)>>2]&127](e,h,509,16)|0)!=0){i=f;return}if((mJ(e,g)|0)!=0){i=f;return}b[g>>1]=b[e+166>>1]&31;h=e+372|0;c[h>>2]=(c[h>>2]|0)+4;h=e+156|0;j=c[h>>2]|0;if((j&1|0)!=0){iA(e,j,0,0);i=f;return}k=e+164|0;b[e+162>>1]=b[k>>1]|0;l=j&16777215;j=l+1|0;if(j>>>0<(c[e+36>>2]|0)>>>0){m=c[e+32>>2]|0;n=d[m+l|0]<<8|d[m+j|0]}else{n=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[k>>1]=n;if((a[e+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=e+152|0;c[h>>2]=(c[h>>2]|0)+2;h=b[g>>1]|0;mR(e,h)|0;i=f;return}else{iy(e);i=f;return}}function jx(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+8|0;g=f|0;h=b[e+160>>1]&63;if((b5[c[20600+(h<<2)>>2]&127](e,h,509,8)|0)!=0){i=f;return}if((mI(e,g)|0)!=0){i=f;return}h=d[g]|0;g=-h|0;j=e+372|0;c[j>>2]=(c[j>>2]|0)+4;j=g&128;k=e+166|0;l=b[k>>1]|0;m=(j|0)==0?l&-9:l|8;l=(j&h|0)==0?m&-3:m|2;m=(g&255|0)==0?l|4:l&-5;b[k>>1]=((h|g)&128|0)==0?m&-18:m|17;m=e+156|0;h=c[m>>2]|0;if((h&1|0)!=0){iA(e,h,0,0);i=f;return}k=e+164|0;b[e+162>>1]=b[k>>1]|0;l=h&16777215;h=l+1|0;if(h>>>0<(c[e+36>>2]|0)>>>0){j=c[e+32>>2]|0;n=d[j+l|0]<<8|d[j+h|0]}else{n=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[k>>1]=n;if((a[e+336|0]|0)==0){c[m>>2]=(c[m>>2]|0)+2;m=e+152|0;c[m>>2]=(c[m>>2]|0)+2;mQ(e,g&255)|0;i=f;return}else{iy(e);i=f;return}}function jy(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;i=i+8|0;h=g|0;j=b[f+160>>1]&63;if((b5[c[20600+(j<<2)>>2]&127](f,j,509,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}j=e[h>>1]|0;h=-j|0;k=f+372|0;c[k>>2]=(c[k>>2]|0)+4;k=h&32768;l=f+166|0;m=b[l>>1]|0;n=(k|0)==0?m&-9:m|8;m=(k&j|0)==0?n&-3:n|2;n=(h&65535|0)==0?m|4:m&-5;b[l>>1]=((j|h)&32768|0)==0?n&-18:n|17;n=f+156|0;j=c[n>>2]|0;if((j&1|0)!=0){iA(f,j,0,0);i=g;return}l=f+164|0;b[f+162>>1]=b[l>>1]|0;m=j&16777215;j=m+1|0;if(j>>>0<(c[f+36>>2]|0)>>>0){k=c[f+32>>2]|0;o=d[k+m|0]<<8|d[k+j|0]}else{o=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[l>>1]=o;if((a[f+336|0]|0)==0){c[n>>2]=(c[n>>2]|0)+2;n=f+152|0;c[n>>2]=(c[n>>2]|0)+2;mR(f,h&65535)|0;i=g;return}else{iy(f);i=g;return}}function jz(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+8|0;g=f|0;h=b[e+160>>1]&63;if((b5[c[20600+(h<<2)>>2]&127](e,h,509,32)|0)!=0){i=f;return}if((mK(e,g)|0)!=0){i=f;return}h=c[g>>2]|0;g=-h|0;j=e+372|0;c[j>>2]=(c[j>>2]|0)+6;j=e+166|0;k=b[j>>1]|0;l=(g|0)<0?k|8:k&-9;k=(h&g|0)<0?l|2:l&-3;l=(h|0)==0?k|4:k&-5;b[j>>1]=(h|g|0)<0?l|17:l&-18;l=e+156|0;h=c[l>>2]|0;if((h&1|0)!=0){iA(e,h,0,0);i=f;return}j=e+164|0;b[e+162>>1]=b[j>>1]|0;k=h&16777215;h=k+1|0;if(h>>>0<(c[e+36>>2]|0)>>>0){m=c[e+32>>2]|0;n=d[m+k|0]<<8|d[m+h|0]}else{n=b6[c[e+12>>2]&63](c[e+4>>2]|0,k)|0}b[j>>1]=n;if((a[e+336|0]|0)==0){c[l>>2]=(c[l>>2]|0)+2;l=e+152|0;c[l>>2]=(c[l>>2]|0)+2;mS(e,g)|0;i=f;return}else{iy(e);i=f;return}}function jA(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;h=b[e+160>>1]&63;if((b5[c[20600+(h<<2)>>2]&127](e,h,4093,16)|0)!=0){i=f;return}if((mJ(e,g)|0)!=0){i=f;return}h=e+372|0;c[h>>2]=(c[h>>2]|0)+12;h=e+166|0;b[h>>1]=b[h>>1]&-256|b[g>>1]&31;g=e+156|0;h=c[g>>2]|0;if((h&1|0)!=0){iA(e,h,0,0);i=f;return}j=e+164|0;b[e+162>>1]=b[j>>1]|0;k=h&16777215;h=k+1|0;if(h>>>0<(c[e+36>>2]|0)>>>0){l=c[e+32>>2]|0;m=d[l+k|0]<<8|d[l+h|0]}else{m=b6[c[e+12>>2]&63](c[e+4>>2]|0,k)|0}b[j>>1]=m;if((a[e+336|0]|0)==0){c[g>>2]=(c[g>>2]|0)+2;g=e+152|0;c[g>>2]=(c[g>>2]|0)+2;i=f;return}else{iy(e);i=f;return}}function jB(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+8|0;g=f|0;h=b[e+160>>1]&63;if((b5[c[20600+(h<<2)>>2]&127](e,h,509,8)|0)!=0){i=f;return}if((mI(e,g)|0)!=0){i=f;return}h=~a[g];g=e+372|0;c[g>>2]=(c[g>>2]|0)+4;l7(e,15,h);g=e+156|0;j=c[g>>2]|0;if((j&1|0)!=0){iA(e,j,0,0);i=f;return}k=e+164|0;b[e+162>>1]=b[k>>1]|0;l=j&16777215;j=l+1|0;if(j>>>0<(c[e+36>>2]|0)>>>0){m=c[e+32>>2]|0;n=d[m+l|0]<<8|d[m+j|0]}else{n=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[k>>1]=n;if((a[e+336|0]|0)==0){c[g>>2]=(c[g>>2]|0)+2;g=e+152|0;c[g>>2]=(c[g>>2]|0)+2;mQ(e,h)|0;i=f;return}else{iy(e);i=f;return}}function jC(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+8|0;g=f|0;h=b[e+160>>1]&63;if((b5[c[20600+(h<<2)>>2]&127](e,h,509,16)|0)!=0){i=f;return}if((mJ(e,g)|0)!=0){i=f;return}h=~b[g>>1];g=e+372|0;c[g>>2]=(c[g>>2]|0)+4;l8(e,15,h);g=e+156|0;j=c[g>>2]|0;if((j&1|0)!=0){iA(e,j,0,0);i=f;return}k=e+164|0;b[e+162>>1]=b[k>>1]|0;l=j&16777215;j=l+1|0;if(j>>>0<(c[e+36>>2]|0)>>>0){m=c[e+32>>2]|0;n=d[m+l|0]<<8|d[m+j|0]}else{n=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[k>>1]=n;if((a[e+336|0]|0)==0){c[g>>2]=(c[g>>2]|0)+2;g=e+152|0;c[g>>2]=(c[g>>2]|0)+2;mR(e,h)|0;i=f;return}else{iy(e);i=f;return}}function jD(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+8|0;g=f|0;h=b[e+160>>1]&63;if((b5[c[20600+(h<<2)>>2]&127](e,h,509,32)|0)!=0){i=f;return}if((mK(e,g)|0)!=0){i=f;return}h=~c[g>>2];g=e+372|0;c[g>>2]=(c[g>>2]|0)+6;l9(e,15,h);g=e+156|0;j=c[g>>2]|0;if((j&1|0)!=0){iA(e,j,0,0);i=f;return}k=e+164|0;b[e+162>>1]=b[k>>1]|0;l=j&16777215;j=l+1|0;if(j>>>0<(c[e+36>>2]|0)>>>0){m=c[e+32>>2]|0;n=d[m+l|0]<<8|d[m+j|0]}else{n=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[k>>1]=n;if((a[e+336|0]|0)==0){c[g>>2]=(c[g>>2]|0)+2;g=e+152|0;c[g>>2]=(c[g>>2]|0)+2;mS(e,h)|0;i=f;return}else{iy(e);i=f;return}}function jE(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;if((a[e+334|0]|0)==0){iF(e);i=f;return}h=b[e+160>>1]&63;if((b5[c[20600+(h<<2)>>2]&127](e,h,4093,16)|0)!=0){i=f;return}if((mJ(e,g)|0)!=0){i=f;return}h=e+372|0;c[h>>2]=(c[h>>2]|0)+12;is(e,b[g>>1]&-22753);g=e+156|0;h=c[g>>2]|0;if((h&1|0)!=0){iA(e,h,0,0);i=f;return}j=e+164|0;b[e+162>>1]=b[j>>1]|0;k=h&16777215;h=k+1|0;if(h>>>0<(c[e+36>>2]|0)>>>0){l=c[e+32>>2]|0;m=d[l+k|0]<<8|d[l+h|0]}else{m=b6[c[e+12>>2]&63](c[e+4>>2]|0,k)|0}b[j>>1]=m;if((a[e+336|0]|0)==0){c[g>>2]=(c[g>>2]|0)+2;g=e+152|0;c[g>>2]=(c[g>>2]|0)+2;i=f;return}else{iy(e);i=f;return}}function jF(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+8|0;g=f|0;h=b[e+160>>1]&63;if((b5[c[20600+(h<<2)>>2]&127](e,h,509,8)|0)!=0){i=f;return}if((mI(e,g)|0)!=0){i=f;return}h=e+166|0;j=b[h>>1]|0;k=((j&65535)>>>4&1)+(d[g]|0)&65535;g=-k&65535;l=(g&15)==0?g:-6-k&65535;k=(l&240)==0?l:l-96&65535;l=k&65535;g=(l&65280|0)==0?j&-18:j|17;b[h>>1]=(l&255|0)==0?g:g&-5;g=e+372|0;c[g>>2]=(c[g>>2]|0)+6;g=e+156|0;l=c[g>>2]|0;if((l&1|0)!=0){iA(e,l,0,0);i=f;return}h=e+164|0;b[e+162>>1]=b[h>>1]|0;j=l&16777215;l=j+1|0;if(l>>>0<(c[e+36>>2]|0)>>>0){m=c[e+32>>2]|0;n=d[m+j|0]<<8|d[m+l|0]}else{n=b6[c[e+12>>2]&63](c[e+4>>2]|0,j)|0}b[h>>1]=n;if((a[e+336|0]|0)==0){c[g>>2]=(c[g>>2]|0)+2;g=e+152|0;c[g>>2]=(c[g>>2]|0)+2;g=k&255;mQ(e,g)|0;i=f;return}else{iy(e);i=f;return}}function jG(f){f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;g=e[f+160>>1]|0;if((g&56|0)==0){h=f+88+((g&7)<<2)|0;i=c[h>>2]|0;j=i<<16|i>>>16;i=f+372|0;c[i>>2]=(c[i>>2]|0)+4;l9(f,15,j);c[h>>2]=j;j=f+156|0;h=c[j>>2]|0;if((h&1|0)!=0){iA(f,h,0,0);return}i=f+164|0;b[f+162>>1]=b[i>>1]|0;k=h&16777215;h=k+1|0;if(h>>>0<(c[f+36>>2]|0)>>>0){l=c[f+32>>2]|0;m=d[l+k|0]<<8|d[l+h|0]}else{m=b6[c[f+12>>2]&63](c[f+4>>2]|0,k)|0}b[i>>1]=m;if((a[f+336|0]|0)==0){c[j>>2]=(c[j>>2]|0)+2;j=f+152|0;c[j>>2]=(c[j>>2]|0)+2;return}else{iy(f);return}}j=g&63;if((b5[c[20600+(j<<2)>>2]&127](f,j,2020,32)|0)!=0){return}if((c[f+340>>2]|0)!=2){iB(f);return}j=f+372|0;c[j>>2]=(c[j>>2]|0)+12;j=c[f+344>>2]|0;g=f+148|0;m=(c[g>>2]|0)-4|0;i=m&16777215;k=i+3|0;h=f+36|0;if(k>>>0<(c[h>>2]|0)>>>0){l=f+32|0;a[(c[l>>2]|0)+i|0]=j>>>24&255;a[(c[l>>2]|0)+(i+1)|0]=j>>>16&255;a[(c[l>>2]|0)+(i+2)|0]=j>>>8&255;a[(c[l>>2]|0)+k|0]=j&255}else{b3[c[f+28>>2]&63](c[f+4>>2]|0,i,j)}c[g>>2]=m;m=f+156|0;g=c[m>>2]|0;if((g&1|0)!=0){iA(f,g,0,0);return}j=f+164|0;b[f+162>>1]=b[j>>1]|0;i=g&16777215;g=i+1|0;if(g>>>0<(c[h>>2]|0)>>>0){h=c[f+32>>2]|0;n=d[h+i|0]<<8|d[h+g|0]}else{n=b6[c[f+12>>2]&63](c[f+4>>2]|0,i)|0}b[j>>1]=n;if((a[f+336|0]|0)==0){c[m>>2]=(c[m>>2]|0)+2;m=f+152|0;c[m>>2]=(c[m>>2]|0)+2;return}else{iy(f);return}}function jH(f){f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;g=f+160|0;h=e[g>>1]|0;i=h>>>3&7;if((i|0)==0){j=f+88+((h&7)<<2)|0;h=c[j>>2]|0;k=(h&128|0)!=0?h|65280:h&255;h=f+372|0;c[h>>2]=(c[h>>2]|0)+4;l8(f,15,k&65535);c[j>>2]=c[j>>2]&-65536|k&65535;k=f+156|0;j=c[k>>2]|0;if((j&1|0)!=0){iA(f,j,0,0);return}h=f+164|0;b[f+162>>1]=b[h>>1]|0;l=j&16777215;j=l+1|0;if(j>>>0<(c[f+36>>2]|0)>>>0){m=c[f+32>>2]|0;n=d[m+l|0]<<8|d[m+j|0]}else{n=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[h>>1]=n;if((a[f+336|0]|0)==0){c[k>>2]=(c[k>>2]|0)+2;k=f+152|0;c[k>>2]=(c[k>>2]|0)+2;return}else{iy(f);return}}else if((i|0)==4){i=f+156|0;k=c[i>>2]|0;if((k&1|0)!=0){iA(f,k,0,0);return}n=f+164|0;h=f+162|0;b[h>>1]=b[n>>1]|0;l=k&16777215;k=l+1|0;j=f+36|0;if(k>>>0<(c[j>>2]|0)>>>0){m=c[f+32>>2]|0;o=d[m+l|0]<<8|d[m+k|0]}else{o=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[n>>1]=o;o=f+336|0;if((a[o]|0)!=0){iy(f);return}c[i>>2]=(c[i>>2]|0)+2;l=f+152|0;c[l>>2]=(c[l>>2]|0)+2;k=b[h>>1]|0;m=c[f+120+((b[g>>1]&7)<<2)>>2]|0;do{if(k<<16>>16==0){p=0}else{if((c[f>>2]&1|0)!=0){p=k;break}if((m&1|0)==0){p=k;break}iA(f,m,1,1);return}}while(0);k=f+32|0;q=f+372|0;r=f+24|0;s=f+4|0;t=0;u=p;p=m;while(1){if((u&1)==0){v=p}else{m=p-2|0;if(t>>>0<8){w=f+120+((7-t&7)<<2)|0}else{w=f+88+((15-t&7)<<2)|0}x=c[w>>2]|0;y=x&65535;z=m&16777215;A=z+1|0;if(A>>>0<(c[j>>2]|0)>>>0){a[(c[k>>2]|0)+z|0]=(y&65535)>>>8&255;a[(c[k>>2]|0)+A|0]=x&255}else{b3[c[r>>2]&63](c[s>>2]|0,z,y)}c[q>>2]=(c[q>>2]|0)+4;v=m}m=t+1|0;if(m>>>0<16){t=m;u=(u&65535)>>>1;p=v}else{break}}c[f+120+((b[g>>1]&7)<<2)>>2]=v;c[q>>2]=(c[q>>2]|0)+8;q=c[i>>2]|0;if((q&1|0)!=0){iA(f,q,0,0);return}b[h>>1]=b[n>>1]|0;h=q&16777215;q=h+1|0;if(q>>>0<(c[j>>2]|0)>>>0){j=c[k>>2]|0;B=d[j+h|0]<<8|d[j+q|0]}else{B=b6[c[f+12>>2]&63](c[s>>2]|0,h)|0}b[n>>1]=B;if((a[o]|0)==0){c[i>>2]=(c[i>>2]|0)+2;c[l>>2]=(c[l>>2]|0)+2;return}else{iy(f);return}}else{l=f+156|0;i=c[l>>2]|0;if((i&1|0)!=0){iA(f,i,0,0);return}o=f+164|0;B=f+162|0;b[B>>1]=b[o>>1]|0;n=i&16777215;i=n+1|0;h=f+36|0;if(i>>>0<(c[h>>2]|0)>>>0){s=c[f+32>>2]|0;C=d[s+n|0]<<8|d[s+i|0]}else{C=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[o>>1]=C;C=f+336|0;if((a[C]|0)!=0){iy(f);return}c[l>>2]=(c[l>>2]|0)+2;n=f+152|0;c[n>>2]=(c[n>>2]|0)+2;i=b[B>>1]|0;s=b[g>>1]&63;if((b5[c[20600+(s<<2)>>2]&127](f,s,484,16)|0)!=0){return}if((c[f+340>>2]|0)!=2){iB(f);return}s=c[f+344>>2]|0;do{if(i<<16>>16==0){D=0}else{if((c[f>>2]&1|0)!=0){D=i;break}if((s&1|0)==0){D=i;break}iA(f,s,1,1);return}}while(0);i=f+32|0;g=f+372|0;q=f+24|0;j=f+4|0;k=0;v=D;D=s;while(1){if((v&1)==0){E=D}else{s=k&7;if(k>>>0<8){F=f+88+(s<<2)|0}else{F=f+120+(s<<2)|0}s=c[F>>2]|0;p=s&65535;u=D&16777215;t=u+1|0;if(t>>>0<(c[h>>2]|0)>>>0){a[(c[i>>2]|0)+u|0]=(p&65535)>>>8&255;a[(c[i>>2]|0)+t|0]=s&255}else{b3[c[q>>2]&63](c[j>>2]|0,u,p)}c[g>>2]=(c[g>>2]|0)+4;E=D+2|0}p=k+1|0;if(p>>>0<16){k=p;v=(v&65535)>>>1;D=E}else{break}}c[g>>2]=(c[g>>2]|0)+8;g=c[l>>2]|0;if((g&1|0)!=0){iA(f,g,0,0);return}b[B>>1]=b[o>>1]|0;B=g&16777215;g=B+1|0;if(g>>>0<(c[h>>2]|0)>>>0){h=c[i>>2]|0;G=d[h+B|0]<<8|d[h+g|0]}else{G=b6[c[f+12>>2]&63](c[j>>2]|0,B)|0}b[o>>1]=G;if((a[C]|0)==0){c[l>>2]=(c[l>>2]|0)+2;c[n>>2]=(c[n>>2]|0)+2;return}else{iy(f);return}}}function jI(f){f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;g=f+160|0;h=e[g>>1]|0;i=h>>>3&7;if((i|0)==4){j=f+156|0;k=c[j>>2]|0;if((k&1|0)!=0){iA(f,k,0,0);return}l=f+164|0;m=f+162|0;b[m>>1]=b[l>>1]|0;n=k&16777215;k=n+1|0;o=f+36|0;if(k>>>0<(c[o>>2]|0)>>>0){p=c[f+32>>2]|0;q=d[p+n|0]<<8|d[p+k|0]}else{q=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[l>>1]=q;q=f+336|0;if((a[q]|0)!=0){iy(f);return}c[j>>2]=(c[j>>2]|0)+2;n=f+152|0;c[n>>2]=(c[n>>2]|0)+2;k=b[m>>1]|0;p=c[f+120+((b[g>>1]&7)<<2)>>2]|0;do{if(k<<16>>16==0){r=0}else{if((c[f>>2]&1|0)!=0){r=k;break}if((p&1|0)==0){r=k;break}iA(f,p,1,1);return}}while(0);k=f+32|0;s=f+372|0;t=f+28|0;u=f+4|0;v=0;w=r;r=p;while(1){if((w&1)==0){x=r}else{p=r-4|0;if(v>>>0<8){y=f+120+((7-v&7)<<2)|0}else{y=f+88+((15-v&7)<<2)|0}z=c[y>>2]|0;A=p&16777215;B=A+3|0;if(B>>>0<(c[o>>2]|0)>>>0){a[(c[k>>2]|0)+A|0]=z>>>24&255;a[(c[k>>2]|0)+(A+1)|0]=z>>>16&255;a[(c[k>>2]|0)+(A+2)|0]=z>>>8&255;a[(c[k>>2]|0)+B|0]=z&255}else{b3[c[t>>2]&63](c[u>>2]|0,A,z)}c[s>>2]=(c[s>>2]|0)+8;x=p}p=v+1|0;if(p>>>0<16){v=p;w=(w&65535)>>>1;r=x}else{break}}c[f+120+((b[g>>1]&7)<<2)>>2]=x;c[s>>2]=(c[s>>2]|0)+8;s=c[j>>2]|0;if((s&1|0)!=0){iA(f,s,0,0);return}b[m>>1]=b[l>>1]|0;m=s&16777215;s=m+1|0;if(s>>>0<(c[o>>2]|0)>>>0){o=c[k>>2]|0;C=d[o+m|0]<<8|d[o+s|0]}else{C=b6[c[f+12>>2]&63](c[u>>2]|0,m)|0}b[l>>1]=C;if((a[q]|0)==0){c[j>>2]=(c[j>>2]|0)+2;c[n>>2]=(c[n>>2]|0)+2;return}else{iy(f);return}}else if((i|0)==0){i=f+88+((h&7)<<2)|0;h=c[i>>2]|0;n=(h&32768|0)!=0?h|-65536:h&65535;h=f+372|0;c[h>>2]=(c[h>>2]|0)+4;l9(f,15,n);c[i>>2]=n;n=f+156|0;i=c[n>>2]|0;if((i&1|0)!=0){iA(f,i,0,0);return}h=f+164|0;b[f+162>>1]=b[h>>1]|0;j=i&16777215;i=j+1|0;if(i>>>0<(c[f+36>>2]|0)>>>0){q=c[f+32>>2]|0;D=d[q+j|0]<<8|d[q+i|0]}else{D=b6[c[f+12>>2]&63](c[f+4>>2]|0,j)|0}b[h>>1]=D;if((a[f+336|0]|0)==0){c[n>>2]=(c[n>>2]|0)+2;n=f+152|0;c[n>>2]=(c[n>>2]|0)+2;return}else{iy(f);return}}else{n=f+156|0;D=c[n>>2]|0;if((D&1|0)!=0){iA(f,D,0,0);return}h=f+164|0;j=f+162|0;b[j>>1]=b[h>>1]|0;i=D&16777215;D=i+1|0;q=f+36|0;if(D>>>0<(c[q>>2]|0)>>>0){C=c[f+32>>2]|0;E=d[C+i|0]<<8|d[C+D|0]}else{E=b6[c[f+12>>2]&63](c[f+4>>2]|0,i)|0}b[h>>1]=E;E=f+336|0;if((a[E]|0)!=0){iy(f);return}c[n>>2]=(c[n>>2]|0)+2;i=f+152|0;c[i>>2]=(c[i>>2]|0)+2;D=b[j>>1]|0;C=b[g>>1]&63;if((b5[c[20600+(C<<2)>>2]&127](f,C,484,32)|0)!=0){return}if((c[f+340>>2]|0)!=2){iB(f);return}C=c[f+344>>2]|0;do{if(D<<16>>16==0){F=0}else{if((c[f>>2]&1|0)!=0){F=D;break}if((C&1|0)==0){F=D;break}iA(f,C,1,1);return}}while(0);D=f+32|0;g=f+372|0;l=f+28|0;m=f+4|0;u=0;s=F;F=C;while(1){if((s&1)==0){G=F}else{C=u&7;if(u>>>0<8){H=f+88+(C<<2)|0}else{H=f+120+(C<<2)|0}C=c[H>>2]|0;o=F&16777215;k=o+3|0;if(k>>>0<(c[q>>2]|0)>>>0){a[(c[D>>2]|0)+o|0]=C>>>24&255;a[(c[D>>2]|0)+(o+1)|0]=C>>>16&255;a[(c[D>>2]|0)+(o+2)|0]=C>>>8&255;a[(c[D>>2]|0)+k|0]=C&255}else{b3[c[l>>2]&63](c[m>>2]|0,o,C)}c[g>>2]=(c[g>>2]|0)+8;G=F+4|0}C=u+1|0;if(C>>>0<16){u=C;s=(s&65535)>>>1;F=G}else{break}}c[g>>2]=(c[g>>2]|0)+8;g=c[n>>2]|0;if((g&1|0)!=0){iA(f,g,0,0);return}b[j>>1]=b[h>>1]|0;j=g&16777215;g=j+1|0;if(g>>>0<(c[q>>2]|0)>>>0){q=c[D>>2]|0;I=d[q+j|0]<<8|d[q+g|0]}else{I=b6[c[f+12>>2]&63](c[m>>2]|0,j)|0}b[h>>1]=I;if((a[E]|0)==0){c[n>>2]=(c[n>>2]|0)+2;c[i>>2]=(c[i>>2]|0)+2;return}else{iy(f);return}}}function jJ(a){a=a|0;b0[c[a+4496+(((b[a+160>>1]&65535)>>>3&7)<<2)>>2]&1023](a);return}function jK(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;h=b[e+160>>1]&63;if((b5[c[20600+(h<<2)>>2]&127](e,h,509,8)|0)!=0){i=f;return}if((mI(e,g)|0)!=0){i=f;return}h=e+372|0;c[h>>2]=(c[h>>2]|0)+8;l7(e,15,a[g]|0);g=e+156|0;h=c[g>>2]|0;if((h&1|0)!=0){iA(e,h,0,0);i=f;return}j=e+164|0;b[e+162>>1]=b[j>>1]|0;k=h&16777215;h=k+1|0;if(h>>>0<(c[e+36>>2]|0)>>>0){l=c[e+32>>2]|0;m=d[l+k|0]<<8|d[l+h|0]}else{m=b6[c[e+12>>2]&63](c[e+4>>2]|0,k)|0}b[j>>1]=m;if((a[e+336|0]|0)==0){c[g>>2]=(c[g>>2]|0)+2;g=e+152|0;c[g>>2]=(c[g>>2]|0)+2;i=f;return}else{iy(e);i=f;return}}function jL(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;h=b[e+160>>1]&63;if((b5[c[20600+(h<<2)>>2]&127](e,h,509,16)|0)!=0){i=f;return}if((mJ(e,g)|0)!=0){i=f;return}h=e+372|0;c[h>>2]=(c[h>>2]|0)+8;l8(e,15,b[g>>1]|0);g=e+156|0;h=c[g>>2]|0;if((h&1|0)!=0){iA(e,h,0,0);i=f;return}j=e+164|0;b[e+162>>1]=b[j>>1]|0;k=h&16777215;h=k+1|0;if(h>>>0<(c[e+36>>2]|0)>>>0){l=c[e+32>>2]|0;m=d[l+k|0]<<8|d[l+h|0]}else{m=b6[c[e+12>>2]&63](c[e+4>>2]|0,k)|0}b[j>>1]=m;if((a[e+336|0]|0)==0){c[g>>2]=(c[g>>2]|0)+2;g=e+152|0;c[g>>2]=(c[g>>2]|0)+2;i=f;return}else{iy(e);i=f;return}}function jM(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;h=b[e+160>>1]&63;if((b5[c[20600+(h<<2)>>2]&127](e,h,509,32)|0)!=0){i=f;return}if((mK(e,g)|0)!=0){i=f;return}h=e+372|0;c[h>>2]=(c[h>>2]|0)+8;l9(e,15,c[g>>2]|0);g=e+156|0;h=c[g>>2]|0;if((h&1|0)!=0){iA(e,h,0,0);i=f;return}j=e+164|0;b[e+162>>1]=b[j>>1]|0;k=h&16777215;h=k+1|0;if(h>>>0<(c[e+36>>2]|0)>>>0){l=c[e+32>>2]|0;m=d[l+k|0]<<8|d[l+h|0]}else{m=b6[c[e+12>>2]&63](c[e+4>>2]|0,k)|0}b[j>>1]=m;if((a[e+336|0]|0)==0){c[g>>2]=(c[g>>2]|0)+2;g=e+152|0;c[g>>2]=(c[g>>2]|0)+2;i=f;return}else{iy(e);i=f;return}}function jN(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;g=i;i=i+8|0;h=g|0;j=b[f+160>>1]|0;if(j<<16>>16!=19196){k=j&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,509,8)|0)!=0){i=g;return}if((mI(f,h)|0)!=0){i=g;return}k=a[h]|0;h=f+372|0;c[h>>2]=(c[h>>2]|0)+8;l7(f,15,k);h=f+156|0;j=c[h>>2]|0;if((j&1|0)!=0){iA(f,j,0,0);i=g;return}l=f+164|0;b[f+162>>1]=b[l>>1]|0;m=j&16777215;j=m+1|0;if(j>>>0<(c[f+36>>2]|0)>>>0){n=c[f+32>>2]|0;o=d[n+m|0]<<8|d[n+j|0]}else{o=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[l>>1]=o;if((a[f+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=f+152|0;c[h>>2]=(c[h>>2]|0)+2;h=k|-128;mQ(f,h)|0;i=g;return}else{iy(f);i=g;return}}h=c[f+64>>2]|0;do{if((h|0)!=0){k=f+152|0;o=c[k>>2]|0;l=f+164|0;if((b6[h&63](c[f+60>>2]|0,e[l>>1]|0)|0)!=0){break}if((c[k>>2]|0)==(o|0)){o=f+156|0;m=c[o>>2]|0;if((m&1|0)!=0){iA(f,m,0,0);i=g;return}j=f+162|0;b[j>>1]=b[l>>1]|0;n=m&16777215;m=n+1|0;p=f+36|0;if(m>>>0<(c[p>>2]|0)>>>0){q=c[f+32>>2]|0;r=d[q+n|0]<<8|d[q+m|0]}else{r=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[l>>1]=r;n=f+336|0;if((a[n]|0)!=0){iy(f);i=g;return}m=(c[o>>2]|0)+2|0;c[o>>2]=m;q=(c[k>>2]|0)+2|0;c[k>>2]=q;if((m&1|0)!=0){iA(f,m,0,0);i=g;return}b[j>>1]=r;j=m&16777215;s=j+1|0;do{if(s>>>0<(c[p>>2]|0)>>>0){t=c[f+32>>2]|0;b[l>>1]=d[t+j|0]<<8|d[t+s|0];u=m;v=q}else{t=b6[c[f+12>>2]&63](c[f+4>>2]|0,j)|0;w=(a[n]|0)==0;b[l>>1]=t;if(w){u=c[o>>2]|0;v=c[k>>2]|0;break}iy(f);i=g;return}}while(0);c[o>>2]=u+2;c[k>>2]=v+2}l=f+372|0;c[l>>2]=(c[l>>2]|0)+8;i=g;return}}while(0);iB(f);i=g;return}function jO(f){f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;g=f+160|0;h=(e[g>>1]|0)>>>3&7;if((h|0)==0){iB(f);i=f+372|0;c[i>>2]=(c[i>>2]|0)+2;return}else if((h|0)==3){h=f+156|0;i=c[h>>2]|0;if((i&1|0)!=0){iA(f,i,0,0);return}j=f+164|0;k=f+162|0;b[k>>1]=b[j>>1]|0;l=i&16777215;i=l+1|0;m=f+36|0;if(i>>>0<(c[m>>2]|0)>>>0){n=c[f+32>>2]|0;o=d[n+l|0]<<8|d[n+i|0]}else{o=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[j>>1]=o;o=f+336|0;if((a[o]|0)!=0){iy(f);return}c[h>>2]=(c[h>>2]|0)+2;l=f+152|0;c[l>>2]=(c[l>>2]|0)+2;i=b[k>>1]|0;n=c[f+120+((b[g>>1]&7)<<2)>>2]|0;do{if(i<<16>>16==0){p=0}else{if((c[f>>2]&1|0)!=0){p=i;break}if((n&1|0)==0){p=i;break}iA(f,n,1,0);return}}while(0);i=f+32|0;q=f+372|0;r=f+12|0;s=f+4|0;t=0;u=p;p=n;while(1){if((u&1)==0){v=p}else{n=p&16777215;w=n+1|0;if(w>>>0<(c[m>>2]|0)>>>0){x=c[i>>2]|0;y=d[x+n|0]<<8|d[x+w|0]}else{y=b6[c[r>>2]&63](c[s>>2]|0,n)|0}n=y&65535;w=(n&32768|0)!=0?n|-65536:n;n=t&7;if(t>>>0<8){c[f+88+(n<<2)>>2]=w}else{c[f+120+(n<<2)>>2]=w}c[q>>2]=(c[q>>2]|0)+4;v=p+2|0}w=t+1|0;if(w>>>0<16){t=w;u=(u&65535)>>>1;p=v}else{break}}c[f+120+((b[g>>1]&7)<<2)>>2]=v;c[q>>2]=(c[q>>2]|0)+12;q=c[h>>2]|0;if((q&1|0)!=0){iA(f,q,0,0);return}b[k>>1]=b[j>>1]|0;k=q&16777215;q=k+1|0;if(q>>>0<(c[m>>2]|0)>>>0){m=c[i>>2]|0;z=d[m+k|0]<<8|d[m+q|0]}else{z=b6[c[r>>2]&63](c[s>>2]|0,k)|0}b[j>>1]=z;if((a[o]|0)==0){c[h>>2]=(c[h>>2]|0)+2;c[l>>2]=(c[l>>2]|0)+2;return}else{iy(f);return}}else{l=f+156|0;h=c[l>>2]|0;if((h&1|0)!=0){iA(f,h,0,0);return}o=f+164|0;z=f+162|0;b[z>>1]=b[o>>1]|0;j=h&16777215;h=j+1|0;k=f+36|0;if(h>>>0<(c[k>>2]|0)>>>0){s=c[f+32>>2]|0;A=d[s+j|0]<<8|d[s+h|0]}else{A=b6[c[f+12>>2]&63](c[f+4>>2]|0,j)|0}b[o>>1]=A;A=f+336|0;if((a[A]|0)!=0){iy(f);return}c[l>>2]=(c[l>>2]|0)+2;j=f+152|0;c[j>>2]=(c[j>>2]|0)+2;h=b[z>>1]|0;s=b[g>>1]&63;if((b5[c[20600+(s<<2)>>2]&127](f,s,2028,16)|0)!=0){return}if((c[f+340>>2]|0)!=2){iB(f);return}s=c[f+344>>2]|0;do{if(h<<16>>16==0){B=0}else{if((c[f>>2]&1|0)!=0){B=h;break}if((s&1|0)==0){B=h;break}iA(f,s,1,0);return}}while(0);h=f+32|0;g=f+372|0;r=f+12|0;q=f+4|0;m=0;i=B;B=s;while(1){if((i&1)==0){C=B}else{s=B&16777215;v=s+1|0;if(v>>>0<(c[k>>2]|0)>>>0){p=c[h>>2]|0;D=d[p+s|0]<<8|d[p+v|0]}else{D=b6[c[r>>2]&63](c[q>>2]|0,s)|0}s=D&65535;v=(s&32768|0)!=0?s|-65536:s;s=m&7;if(m>>>0<8){c[f+88+(s<<2)>>2]=v}else{c[f+120+(s<<2)>>2]=v}c[g>>2]=(c[g>>2]|0)+4;C=B+2|0}v=m+1|0;if(v>>>0<16){m=v;i=(i&65535)>>>1;B=C}else{break}}c[g>>2]=(c[g>>2]|0)+12;g=c[l>>2]|0;if((g&1|0)!=0){iA(f,g,0,0);return}b[z>>1]=b[o>>1]|0;z=g&16777215;g=z+1|0;if(g>>>0<(c[k>>2]|0)>>>0){k=c[h>>2]|0;E=d[k+z|0]<<8|d[k+g|0]}else{E=b6[c[r>>2]&63](c[q>>2]|0,z)|0}b[o>>1]=E;if((a[A]|0)==0){c[l>>2]=(c[l>>2]|0)+2;c[j>>2]=(c[j>>2]|0)+2;return}else{iy(f);return}}}function jP(f){f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;g=f+160|0;h=(e[g>>1]|0)>>>3&7;if((h|0)==3){i=f+156|0;j=c[i>>2]|0;if((j&1|0)!=0){iA(f,j,0,0);return}k=f+164|0;l=f+162|0;b[l>>1]=b[k>>1]|0;m=j&16777215;j=m+1|0;n=f+36|0;if(j>>>0<(c[n>>2]|0)>>>0){o=c[f+32>>2]|0;p=d[o+m|0]<<8|d[o+j|0]}else{p=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[k>>1]=p;p=f+336|0;if((a[p]|0)!=0){iy(f);return}c[i>>2]=(c[i>>2]|0)+2;m=f+152|0;c[m>>2]=(c[m>>2]|0)+2;j=b[l>>1]|0;o=c[f+120+((b[g>>1]&7)<<2)>>2]|0;do{if(j<<16>>16==0){q=0}else{if((c[f>>2]&1|0)!=0){q=j;break}if((o&1|0)==0){q=j;break}iA(f,o,1,0);return}}while(0);j=f+32|0;r=f+372|0;s=f+16|0;t=f+4|0;u=q;q=o;o=0;while(1){if((u&1)==0){v=q}else{w=q&16777215;x=w+3|0;if(x>>>0<(c[n>>2]|0)>>>0){y=c[j>>2]|0;z=((d[y+w|0]<<8|d[y+(w+1)|0])<<8|d[y+(w+2)|0])<<8|d[y+x|0]}else{z=b6[c[s>>2]&63](c[t>>2]|0,w)|0}w=o&7;if(o>>>0<8){c[f+88+(w<<2)>>2]=z}else{c[f+120+(w<<2)>>2]=z}c[r>>2]=(c[r>>2]|0)+8;v=q+4|0}w=o+1|0;if(w>>>0<16){u=(u&65535)>>>1;q=v;o=w}else{break}}c[f+120+((b[g>>1]&7)<<2)>>2]=v;c[r>>2]=(c[r>>2]|0)+12;r=c[i>>2]|0;if((r&1|0)!=0){iA(f,r,0,0);return}b[l>>1]=b[k>>1]|0;l=r&16777215;r=l+1|0;if(r>>>0<(c[n>>2]|0)>>>0){n=c[j>>2]|0;A=d[n+l|0]<<8|d[n+r|0]}else{A=b6[c[f+12>>2]&63](c[t>>2]|0,l)|0}b[k>>1]=A;if((a[p]|0)==0){c[i>>2]=(c[i>>2]|0)+2;c[m>>2]=(c[m>>2]|0)+2;return}else{iy(f);return}}else if((h|0)==0){iB(f);h=f+372|0;c[h>>2]=(c[h>>2]|0)+2;return}else{h=f+156|0;m=c[h>>2]|0;if((m&1|0)!=0){iA(f,m,0,0);return}i=f+164|0;p=f+162|0;b[p>>1]=b[i>>1]|0;A=m&16777215;m=A+1|0;k=f+36|0;if(m>>>0<(c[k>>2]|0)>>>0){l=c[f+32>>2]|0;B=d[l+A|0]<<8|d[l+m|0]}else{B=b6[c[f+12>>2]&63](c[f+4>>2]|0,A)|0}b[i>>1]=B;B=f+336|0;if((a[B]|0)!=0){iy(f);return}c[h>>2]=(c[h>>2]|0)+2;A=f+152|0;c[A>>2]=(c[A>>2]|0)+2;m=b[p>>1]|0;l=b[g>>1]&63;if((b5[c[20600+(l<<2)>>2]&127](f,l,2028,32)|0)!=0){return}if((c[f+340>>2]|0)!=2){iB(f);return}l=c[f+344>>2]|0;do{if(m<<16>>16==0){C=0}else{if((c[f>>2]&1|0)!=0){C=m;break}if((l&1|0)==0){C=m;break}iA(f,l,1,0);return}}while(0);m=f+32|0;g=f+372|0;t=f+16|0;r=f+4|0;n=C;C=l;l=0;while(1){if((n&1)==0){D=C}else{j=C&16777215;v=j+3|0;if(v>>>0<(c[k>>2]|0)>>>0){o=c[m>>2]|0;E=((d[o+j|0]<<8|d[o+(j+1)|0])<<8|d[o+(j+2)|0])<<8|d[o+v|0]}else{E=b6[c[t>>2]&63](c[r>>2]|0,j)|0}j=l&7;if(l>>>0<8){c[f+88+(j<<2)>>2]=E}else{c[f+120+(j<<2)>>2]=E}c[g>>2]=(c[g>>2]|0)+8;D=C+4|0}j=l+1|0;if(j>>>0<16){n=(n&65535)>>>1;C=D;l=j}else{break}}c[g>>2]=(c[g>>2]|0)+12;g=c[h>>2]|0;if((g&1|0)!=0){iA(f,g,0,0);return}b[p>>1]=b[i>>1]|0;p=g&16777215;g=p+1|0;if(g>>>0<(c[k>>2]|0)>>>0){k=c[m>>2]|0;F=d[k+p|0]<<8|d[k+g|0]}else{F=b6[c[f+12>>2]&63](c[r>>2]|0,p)|0}b[i>>1]=F;if((a[B]|0)==0){c[h>>2]=(c[h>>2]|0)+2;c[A>>2]=(c[A>>2]|0)+2;return}else{iy(f);return}}}function jQ(f){f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0;g=f+160|0;h=e[g>>1]|0;if((h|0)==20080){if((a[f+334|0]|0)==0){iF(f);return}i=f+372|0;j=c[i>>2]|0;if((c[f>>2]&8|0)==0){c[i>>2]=j+132;iK(f);return}c[i>>2]=j+4;j=f+156|0;i=c[j>>2]|0;if((i&1|0)!=0){iA(f,i,0,0);return}k=f+164|0;b[f+162>>1]=b[k>>1]|0;l=i&16777215;i=l+1|0;if(i>>>0<(c[f+36>>2]|0)>>>0){m=c[f+32>>2]|0;n=d[m+l|0]<<8|d[m+i|0]}else{n=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[k>>1]=n;if((a[f+336|0]|0)==0){c[j>>2]=(c[j>>2]|0)+2;j=f+152|0;c[j>>2]=(c[j>>2]|0)+2;return}else{iy(f);return}}else if((h|0)==20083){j=f+334|0;if((a[j]|0)==0){iF(f);return}n=f+148|0;k=c[n>>2]|0;l=k&16777215;i=l+1|0;m=f+36|0;o=c[m>>2]|0;if(i>>>0<o>>>0){p=c[f+32>>2]|0;q=d[p+l|0]<<8|d[p+i|0];r=o}else{o=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0;q=o;r=c[m>>2]|0}o=k+2&16777215;l=o+3|0;if(l>>>0<r>>>0){r=c[f+32>>2]|0;s=((d[r+o|0]<<8|d[r+(o+1)|0])<<8|d[r+(o+2)|0])<<8|d[r+l|0]}else{s=b6[c[f+16>>2]&63](c[f+4>>2]|0,o)|0}o=f|0;do{if((c[o>>2]&2|0)!=0){l=k+6&16777215;r=l+1|0;if(r>>>0<(c[m>>2]|0)>>>0){i=c[f+32>>2]|0;t=d[i+l|0]<<8|d[i+r|0]}else{t=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}l=(t&65535)>>>12;if((l|0)==0|(l|0)==8){break}iI(f);return}}while(0);is(f,q);q=f+152|0;c[q>>2]=s;t=f+156|0;c[t>>2]=s;do{if((c[o>>2]&2|0)==0){l=k+6|0;if((a[j]|0)==0){c[f+172>>2]=l;break}else{c[n>>2]=l;break}}else{l=k+8|0;if((a[j]|0)==0){c[f+172>>2]=l;break}else{c[n>>2]=l;break}}}while(0);n=f+372|0;c[n>>2]=(c[n>>2]|0)+20;if((s&1|0)!=0){iA(f,s,0,0);return}n=f+164|0;j=f+162|0;b[j>>1]=b[n>>1]|0;k=s&16777215;o=k+1|0;if(o>>>0<(c[m>>2]|0)>>>0){l=c[f+32>>2]|0;u=d[l+k|0]<<8|d[l+o|0]}else{u=b6[c[f+12>>2]&63](c[f+4>>2]|0,k)|0}b[n>>1]=u;k=f+336|0;if((a[k]|0)!=0){iy(f);return}o=(c[t>>2]|0)+2|0;c[t>>2]=o;c[q>>2]=(c[q>>2]|0)+2;if((o&1|0)!=0){iA(f,o,0,0);return}b[j>>1]=u;u=o&16777215;j=u+1|0;do{if(j>>>0<(c[m>>2]|0)>>>0){l=c[f+32>>2]|0;b[n>>1]=d[l+u|0]<<8|d[l+j|0];v=o}else{l=b6[c[f+12>>2]&63](c[f+4>>2]|0,u)|0;r=(a[k]|0)==0;b[n>>1]=l;if(r){v=c[t>>2]|0;break}iy(f);return}}while(0);c[t>>2]=v+2;c[q>>2]=s;return}else if((h|0)==20081){s=f+372|0;c[s>>2]=(c[s>>2]|0)+4;s=f+156|0;q=c[s>>2]|0;if((q&1|0)!=0){iA(f,q,0,0);return}v=f+164|0;b[f+162>>1]=b[v>>1]|0;t=q&16777215;q=t+1|0;if(q>>>0<(c[f+36>>2]|0)>>>0){n=c[f+32>>2]|0;w=d[n+t|0]<<8|d[n+q|0]}else{w=b6[c[f+12>>2]&63](c[f+4>>2]|0,t)|0}b[v>>1]=w;if((a[f+336|0]|0)==0){c[s>>2]=(c[s>>2]|0)+2;s=f+152|0;c[s>>2]=(c[s>>2]|0)+2;return}else{iy(f);return}}else if((h|0)==20082){if((a[f+334|0]|0)==0){iF(f);return}s=f+156|0;w=c[s>>2]|0;if((w&1|0)!=0){iA(f,w,0,0);return}v=f+164|0;t=f+162|0;b[t>>1]=b[v>>1]|0;q=w&16777215;w=q+1|0;n=f+36|0;if(w>>>0<(c[n>>2]|0)>>>0){k=c[f+32>>2]|0;x=d[k+q|0]<<8|d[k+w|0]}else{x=b6[c[f+12>>2]&63](c[f+4>>2]|0,q)|0}b[v>>1]=x;x=f+336|0;if((a[x]|0)!=0){iy(f);return}c[s>>2]=(c[s>>2]|0)+2;q=f+152|0;c[q>>2]=(c[q>>2]|0)+2;is(f,b[t>>1]|0);w=f+372|0;c[w>>2]=(c[w>>2]|0)+4;w=f+335|0;a[w]=a[w]|1;w=c[s>>2]|0;if((w&1|0)!=0){iA(f,w,0,0);return}b[t>>1]=b[v>>1]|0;t=w&16777215;w=t+1|0;if(w>>>0<(c[n>>2]|0)>>>0){n=c[f+32>>2]|0;y=d[n+t|0]<<8|d[n+w|0]}else{y=b6[c[f+12>>2]&63](c[f+4>>2]|0,t)|0}b[v>>1]=y;if((a[x]|0)==0){c[s>>2]=(c[s>>2]|0)+2;c[q>>2]=(c[q>>2]|0)+2;return}else{iy(f);return}}else if((h|0)==20084){if((c[f>>2]&2|0)==0){iB(f);q=f+372|0;c[q>>2]=(c[q>>2]|0)+2;return}q=f+156|0;s=c[q>>2]|0;if((s&1|0)!=0){iA(f,s,0,0);return}x=f+164|0;y=f+162|0;b[y>>1]=b[x>>1]|0;v=s&16777215;s=v+1|0;t=f+36|0;if(s>>>0<(c[t>>2]|0)>>>0){w=c[f+32>>2]|0;z=d[w+v|0]<<8|d[w+s|0]}else{z=b6[c[f+12>>2]&63](c[f+4>>2]|0,v)|0}b[x>>1]=z;z=f+336|0;if((a[z]|0)!=0){iy(f);return}c[q>>2]=(c[q>>2]|0)+2;v=f+152|0;c[v>>2]=(c[v>>2]|0)+2;s=e[y>>1]|0;w=f+148|0;n=c[w>>2]|0;k=n&16777215;u=k+3|0;if(u>>>0<(c[t>>2]|0)>>>0){o=c[f+32>>2]|0;A=((d[o+k|0]<<8|d[o+(k+1)|0])<<8|d[o+(k+2)|0])<<8|d[o+u|0]}else{A=b6[c[f+16>>2]&63](c[f+4>>2]|0,k)|0}c[q>>2]=A;c[w>>2]=n+4+((s&32768|0)!=0?s|-65536:s);s=f+372|0;c[s>>2]=(c[s>>2]|0)+16;if((A&1|0)!=0){iA(f,A,0,0);return}b[y>>1]=b[x>>1]|0;s=A&16777215;A=s+1|0;if(A>>>0<(c[t>>2]|0)>>>0){n=c[f+32>>2]|0;B=d[n+s|0]<<8|d[n+A|0]}else{B=b6[c[f+12>>2]&63](c[f+4>>2]|0,s)|0}b[x>>1]=B;if((a[z]|0)!=0){iy(f);return}s=(c[q>>2]|0)+2|0;c[q>>2]=s;c[v>>2]=(c[v>>2]|0)+2;if((s&1|0)!=0){iA(f,s,0,0);return}b[y>>1]=B;B=s&16777215;y=B+1|0;do{if(y>>>0<(c[t>>2]|0)>>>0){A=c[f+32>>2]|0;b[x>>1]=d[A+B|0]<<8|d[A+y|0];C=s}else{A=b6[c[f+12>>2]&63](c[f+4>>2]|0,B)|0;n=(a[z]|0)==0;b[x>>1]=A;if(n){C=c[q>>2]|0;break}iy(f);return}}while(0);c[q>>2]=C+2;c[v>>2]=C-2;return}else if((h|0)==20085){C=f+148|0;v=c[C>>2]|0;q=v&16777215;x=q+3|0;z=f+36|0;if(x>>>0<(c[z>>2]|0)>>>0){B=c[f+32>>2]|0;D=((d[B+q|0]<<8|d[B+(q+1)|0])<<8|d[B+(q+2)|0])<<8|d[B+x|0]}else{D=b6[c[f+16>>2]&63](c[f+4>>2]|0,q)|0}q=f+156|0;c[q>>2]=D;c[C>>2]=v+4;v=f+372|0;c[v>>2]=(c[v>>2]|0)+16;if((D&1|0)!=0){iA(f,D,0,0);return}v=f+164|0;C=f+162|0;b[C>>1]=b[v>>1]|0;x=D&16777215;D=x+1|0;if(D>>>0<(c[z>>2]|0)>>>0){B=c[f+32>>2]|0;E=d[B+x|0]<<8|d[B+D|0]}else{E=b6[c[f+12>>2]&63](c[f+4>>2]|0,x)|0}b[v>>1]=E;x=f+336|0;if((a[x]|0)!=0){iy(f);return}D=(c[q>>2]|0)+2|0;c[q>>2]=D;B=f+152|0;c[B>>2]=(c[B>>2]|0)+2;if((D&1|0)!=0){iA(f,D,0,0);return}b[C>>1]=E;E=D&16777215;C=E+1|0;do{if(C>>>0<(c[z>>2]|0)>>>0){s=c[f+32>>2]|0;b[v>>1]=d[s+E|0]<<8|d[s+C|0];F=D}else{s=b6[c[f+12>>2]&63](c[f+4>>2]|0,E)|0;y=(a[x]|0)==0;b[v>>1]=s;if(y){F=c[q>>2]|0;break}iy(f);return}}while(0);c[q>>2]=F+2;c[B>>2]=F-2;return}else if((h|0)==20086){F=f+156|0;B=c[F>>2]|0;if((B&1|0)!=0){iA(f,B,0,0);return}q=f+164|0;b[f+162>>1]=b[q>>1]|0;v=B&16777215;B=v+1|0;if(B>>>0<(c[f+36>>2]|0)>>>0){x=c[f+32>>2]|0;G=d[x+v|0]<<8|d[x+B|0]}else{G=b6[c[f+12>>2]&63](c[f+4>>2]|0,v)|0}b[q>>1]=G;if((a[f+336|0]|0)!=0){iy(f);return}c[F>>2]=(c[F>>2]|0)+2;F=f+152|0;c[F>>2]=(c[F>>2]|0)+2;if((b[f+166>>1]&2)==0){F=f+372|0;c[F>>2]=(c[F>>2]|0)+4;return}else{iE(f);return}}else if((h|0)==20087){F=f+148|0;G=c[F>>2]|0;q=G&16777215;v=q+1|0;B=f+36|0;x=c[B>>2]|0;if(v>>>0<x>>>0){H=a[(c[f+32>>2]|0)+v|0]|0;I=x}else{x=(b6[c[f+12>>2]&63](c[f+4>>2]|0,q)|0)&255;H=x;I=c[B>>2]|0}x=f+166|0;b[x>>1]=b[x>>1]&-256|H&31;H=G+2&16777215;x=H+3|0;if(x>>>0<I>>>0){I=c[f+32>>2]|0;J=((d[I+H|0]<<8|d[I+(H+1)|0])<<8|d[I+(H+2)|0])<<8|d[I+x|0]}else{J=b6[c[f+16>>2]&63](c[f+4>>2]|0,H)|0}H=f+156|0;c[H>>2]=J;c[F>>2]=G+6;G=f+372|0;c[G>>2]=(c[G>>2]|0)+20;if((J&1|0)!=0){iA(f,J,0,0);return}G=f+164|0;F=f+162|0;b[F>>1]=b[G>>1]|0;x=J&16777215;J=x+1|0;if(J>>>0<(c[B>>2]|0)>>>0){I=c[f+32>>2]|0;K=d[I+x|0]<<8|d[I+J|0]}else{K=b6[c[f+12>>2]&63](c[f+4>>2]|0,x)|0}b[G>>1]=K;x=f+336|0;if((a[x]|0)!=0){iy(f);return}J=(c[H>>2]|0)+2|0;c[H>>2]=J;I=f+152|0;c[I>>2]=(c[I>>2]|0)+2;if((J&1|0)!=0){iA(f,J,0,0);return}b[F>>1]=K;K=J&16777215;F=K+1|0;do{if(F>>>0<(c[B>>2]|0)>>>0){q=c[f+32>>2]|0;b[G>>1]=d[q+K|0]<<8|d[q+F|0];L=J}else{q=b6[c[f+12>>2]&63](c[f+4>>2]|0,K)|0;v=(a[x]|0)==0;b[G>>1]=q;if(v){L=c[H>>2]|0;break}iy(f);return}}while(0);c[H>>2]=L+2;c[I>>2]=L-2;return}else if((h|0)==20090){L=f|0;if((c[L>>2]&2|0)==0){iB(f);I=f+372|0;c[I>>2]=(c[I>>2]|0)+2;return}I=f+334|0;if((a[I]|0)==0){iF(f);return}H=f+156|0;G=c[H>>2]|0;if((G&1|0)!=0){iA(f,G,0,0);return}x=f+164|0;K=f+162|0;b[K>>1]=b[x>>1]|0;J=G&16777215;G=J+1|0;F=f+36|0;if(G>>>0<(c[F>>2]|0)>>>0){B=c[f+32>>2]|0;M=d[B+J|0]<<8|d[B+G|0]}else{M=b6[c[f+12>>2]&63](c[f+4>>2]|0,J)|0}b[x>>1]=M;M=f+336|0;if((a[M]|0)!=0){iy(f);return}c[H>>2]=(c[H>>2]|0)+2;J=f+152|0;c[J>>2]=(c[J>>2]|0)+2;G=e[K>>1]|0;B=G&4095;v=G>>>12;do{if((B|0)==0){N=c[f+180>>2]&3}else if((B|0)==1){N=c[f+184>>2]&3}else if((B|0)==2){if((c[L>>2]&4|0)!=0){N=c[f+176>>2]|0;break}iB(f);G=f+372|0;c[G>>2]=(c[G>>2]|0)+2;return}else if((B|0)==2048){N=c[((a[I]|0)==0?f+148|0:f+168|0)>>2]|0}else if((B|0)==2049){N=c[f+176>>2]|0}else if((B|0)==2050){if((c[L>>2]&4|0)!=0){N=c[f+176>>2]|0;break}iB(f);G=f+372|0;c[G>>2]=(c[G>>2]|0)+2;return}else{iB(f);return}}while(0);L=v&7;if((v&8|0)==0){c[f+88+(L<<2)>>2]=N}else{c[f+120+(L<<2)>>2]=N}N=f+372|0;c[N>>2]=(c[N>>2]|0)+12;N=c[H>>2]|0;if((N&1|0)!=0){iA(f,N,0,0);return}b[K>>1]=b[x>>1]|0;K=N&16777215;N=K+1|0;if(N>>>0<(c[F>>2]|0)>>>0){F=c[f+32>>2]|0;O=d[F+K|0]<<8|d[F+N|0]}else{O=b6[c[f+12>>2]&63](c[f+4>>2]|0,K)|0}b[x>>1]=O;if((a[M]|0)==0){c[H>>2]=(c[H>>2]|0)+2;c[J>>2]=(c[J>>2]|0)+2;return}else{iy(f);return}}else if((h|0)==20091){J=f|0;if((c[J>>2]&2|0)==0){iB(f);H=f+372|0;c[H>>2]=(c[H>>2]|0)+2;return}H=f+334|0;if((a[H]|0)==0){iF(f);return}M=f+156|0;O=c[M>>2]|0;if((O&1|0)!=0){iA(f,O,0,0);return}x=f+164|0;K=f+162|0;b[K>>1]=b[x>>1]|0;N=O&16777215;O=N+1|0;F=f+36|0;if(O>>>0<(c[F>>2]|0)>>>0){L=c[f+32>>2]|0;P=d[L+N|0]<<8|d[L+O|0]}else{P=b6[c[f+12>>2]&63](c[f+4>>2]|0,N)|0}b[x>>1]=P;N=f+336|0;if((a[N]|0)!=0){iy(f);return}O=(c[M>>2]|0)+2|0;c[M>>2]=O;L=f+152|0;v=(c[L>>2]|0)+2|0;c[L>>2]=v;B=e[K>>1]|0;I=B&4095;G=B>>>12;B=G&7;if((G&8|0)==0){Q=f+88+(B<<2)|0}else{Q=f+120+(B<<2)|0}B=c[Q>>2]|0;do{if((I|0)==0){c[f+180>>2]=B&3}else if((I|0)==1){c[f+184>>2]=B&3}else if((I|0)==2){if((c[J>>2]&4|0)!=0){c[f+188>>2]=B;break}iB(f);Q=f+372|0;c[Q>>2]=(c[Q>>2]|0)+2;return}else if((I|0)==2048){if((a[H]|0)==0){c[f+148>>2]=B;break}else{c[f+168>>2]=B;break}}else if((I|0)==2049){c[f+176>>2]=B}else if((I|0)==2050){if((c[J>>2]&4|0)!=0){c[f+188>>2]=B;break}iB(f);Q=f+372|0;c[Q>>2]=(c[Q>>2]|0)+2;return}else{iB(f);return}}while(0);B=f+372|0;c[B>>2]=(c[B>>2]|0)+10;if((O&1|0)!=0){iA(f,O,0,0);return}b[K>>1]=P;P=O&16777215;K=P+1|0;do{if(K>>>0<(c[F>>2]|0)>>>0){B=c[f+32>>2]|0;b[x>>1]=d[B+P|0]<<8|d[B+K|0];R=O;S=v}else{B=b6[c[f+12>>2]&63](c[f+4>>2]|0,P)|0;J=(a[N]|0)==0;b[x>>1]=B;if(J){R=c[M>>2]|0;S=c[L>>2]|0;break}iy(f);return}}while(0);c[M>>2]=R+2;c[L>>2]=S+2;return}else{S=h>>>3&7;if((S|0)==0|(S|0)==1){L=f+156|0;R=c[L>>2]|0;if((R&1|0)!=0){iA(f,R,0,0);return}M=f+164|0;b[f+162>>1]=b[M>>1]|0;x=R&16777215;R=x+1|0;if(R>>>0<(c[f+36>>2]|0)>>>0){N=c[f+32>>2]|0;T=d[N+x|0]<<8|d[N+R|0]}else{T=b6[c[f+12>>2]&63](c[f+4>>2]|0,x)|0}b[M>>1]=T;if((a[f+336|0]|0)==0){c[L>>2]=(c[L>>2]|0)+2;L=f+152|0;c[L>>2]=(c[L>>2]|0)+2;iJ(f,b[g>>1]&15);return}else{iy(f);return}}else if((S|0)==2){L=f+156|0;T=c[L>>2]|0;if((T&1|0)!=0){iA(f,T,0,0);return}M=f+164|0;x=f+162|0;b[x>>1]=b[M>>1]|0;R=T&16777215;T=R+1|0;N=f+36|0;if(T>>>0<(c[N>>2]|0)>>>0){P=c[f+32>>2]|0;U=d[P+R|0]<<8|d[P+T|0]}else{U=b6[c[f+12>>2]&63](c[f+4>>2]|0,R)|0}b[M>>1]=U;U=f+336|0;if((a[U]|0)!=0){iy(f);return}c[L>>2]=(c[L>>2]|0)+2;R=f+152|0;c[R>>2]=(c[R>>2]|0)+2;T=b[g>>1]&7;g=e[x>>1]|0;P=f+372|0;c[P>>2]=(c[P>>2]|0)+16;P=f+148|0;v=(c[P>>2]|0)-4|0;c[P>>2]=v;O=f+120+(T<<2)|0;T=c[O>>2]|0;K=v&16777215;v=K+3|0;if(v>>>0<(c[N>>2]|0)>>>0){F=f+32|0;a[(c[F>>2]|0)+K|0]=T>>>24&255;a[(c[F>>2]|0)+(K+1)|0]=T>>>16&255;a[(c[F>>2]|0)+(K+2)|0]=T>>>8&255;a[(c[F>>2]|0)+v|0]=T&255}else{b3[c[f+28>>2]&63](c[f+4>>2]|0,K,T)}c[O>>2]=c[P>>2];c[P>>2]=(c[P>>2]|0)+((g&32768|0)!=0?g|-65536:g);g=c[L>>2]|0;if((g&1|0)!=0){iA(f,g,0,0);return}b[x>>1]=b[M>>1]|0;x=g&16777215;g=x+1|0;if(g>>>0<(c[N>>2]|0)>>>0){N=c[f+32>>2]|0;V=d[N+x|0]<<8|d[N+g|0]}else{V=b6[c[f+12>>2]&63](c[f+4>>2]|0,x)|0}b[M>>1]=V;if((a[U]|0)==0){c[L>>2]=(c[L>>2]|0)+2;c[R>>2]=(c[R>>2]|0)+2;return}else{iy(f);return}}else if((S|0)==3){R=f+120+((h&7)<<2)|0;L=c[R>>2]|0;do{if((c[f>>2]&1|0)==0){if((L&1|0)==0){break}iA(f,L,1,0);return}}while(0);U=f+372|0;c[U>>2]=(c[U>>2]|0)+12;U=f+148|0;c[U>>2]=L;V=L&16777215;L=V+3|0;M=f+36|0;if(L>>>0<(c[M>>2]|0)>>>0){x=c[f+32>>2]|0;W=((d[x+V|0]<<8|d[x+(V+1)|0])<<8|d[x+(V+2)|0])<<8|d[x+L|0]}else{W=b6[c[f+16>>2]&63](c[f+4>>2]|0,V)|0}c[R>>2]=W;c[U>>2]=(c[U>>2]|0)+4;U=f+156|0;W=c[U>>2]|0;if((W&1|0)!=0){iA(f,W,0,0);return}R=f+164|0;b[f+162>>1]=b[R>>1]|0;V=W&16777215;W=V+1|0;if(W>>>0<(c[M>>2]|0)>>>0){M=c[f+32>>2]|0;X=d[M+V|0]<<8|d[M+W|0]}else{X=b6[c[f+12>>2]&63](c[f+4>>2]|0,V)|0}b[R>>1]=X;if((a[f+336|0]|0)==0){c[U>>2]=(c[U>>2]|0)+2;U=f+152|0;c[U>>2]=(c[U>>2]|0)+2;return}else{iy(f);return}}else if((S|0)==4){if((a[f+334|0]|0)==0){iF(f);return}c[f+168>>2]=c[f+120+((h&7)<<2)>>2];U=f+372|0;c[U>>2]=(c[U>>2]|0)+4;U=f+156|0;X=c[U>>2]|0;if((X&1|0)!=0){iA(f,X,0,0);return}R=f+164|0;b[f+162>>1]=b[R>>1]|0;V=X&16777215;X=V+1|0;if(X>>>0<(c[f+36>>2]|0)>>>0){W=c[f+32>>2]|0;Y=d[W+V|0]<<8|d[W+X|0]}else{Y=b6[c[f+12>>2]&63](c[f+4>>2]|0,V)|0}b[R>>1]=Y;if((a[f+336|0]|0)==0){c[U>>2]=(c[U>>2]|0)+2;U=f+152|0;c[U>>2]=(c[U>>2]|0)+2;return}else{iy(f);return}}else if((S|0)==5){if((a[f+334|0]|0)==0){iF(f);return}c[f+120+((h&7)<<2)>>2]=c[f+168>>2];h=f+372|0;c[h>>2]=(c[h>>2]|0)+4;h=f+156|0;S=c[h>>2]|0;if((S&1|0)!=0){iA(f,S,0,0);return}U=f+164|0;b[f+162>>1]=b[U>>1]|0;Y=S&16777215;S=Y+1|0;if(S>>>0<(c[f+36>>2]|0)>>>0){R=c[f+32>>2]|0;Z=d[R+Y|0]<<8|d[R+S|0]}else{Z=b6[c[f+12>>2]&63](c[f+4>>2]|0,Y)|0}b[U>>1]=Z;if((a[f+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=f+152|0;c[h>>2]=(c[h>>2]|0)+2;return}else{iy(f);return}}else{iB(f);h=f+372|0;c[h>>2]=(c[h>>2]|0)+2;return}}}function jR(e){e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;f=b[e+160>>1]&63;if((b5[c[20600+(f<<2)>>2]&127](e,f,2020,32)|0)!=0){return}if((c[e+340>>2]|0)!=2){iB(e);return}f=e+372|0;c[f>>2]=(c[f>>2]|0)+16;f=e+156|0;g=c[f>>2]|0;h=e+344|0;i=c[h>>2]|0;c[f>>2]=i;if((i&1|0)!=0){iA(e,i,0,0);return}j=e+164|0;k=e+162|0;b[k>>1]=b[j>>1]|0;l=i&16777215;i=l+1|0;m=e+36|0;if(i>>>0<(c[m>>2]|0)>>>0){n=c[e+32>>2]|0;o=d[n+l|0]<<8|d[n+i|0]}else{o=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[j>>1]=o;o=e+336|0;if((a[o]|0)!=0){iy(e);return}c[f>>2]=(c[f>>2]|0)+2;l=e+152|0;c[l>>2]=(c[l>>2]|0)+2;i=g-2|0;g=e+148|0;n=(c[g>>2]|0)-4|0;p=n&16777215;q=p+3|0;if(q>>>0<(c[m>>2]|0)>>>0){r=e+32|0;a[(c[r>>2]|0)+p|0]=i>>>24&255;a[(c[r>>2]|0)+(p+1)|0]=i>>>16&255;a[(c[r>>2]|0)+(p+2)|0]=i>>>8&255;a[(c[r>>2]|0)+q|0]=i&255}else{b3[c[e+28>>2]&63](c[e+4>>2]|0,p,i)}c[g>>2]=n;n=c[f>>2]|0;if((n&1|0)!=0){iA(e,n,0,0);return}b[k>>1]=b[j>>1]|0;k=n&16777215;n=k+1|0;if(n>>>0<(c[m>>2]|0)>>>0){m=c[e+32>>2]|0;s=d[m+k|0]<<8|d[m+n|0]}else{s=b6[c[e+12>>2]&63](c[e+4>>2]|0,k)|0}b[j>>1]=s;if((a[o]|0)==0){c[f>>2]=(c[f>>2]|0)+2;c[l>>2]=c[h>>2];return}else{iy(e);return}}function jS(e){e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;f=b[e+160>>1]&63;if((b5[c[20600+(f<<2)>>2]&127](e,f,2020,32)|0)!=0){return}if((c[e+340>>2]|0)!=2){iB(e);return}f=e+372|0;c[f>>2]=(c[f>>2]|0)+8;f=e+344|0;g=c[f>>2]|0;h=e+156|0;c[h>>2]=g;if((g&1|0)!=0){iA(e,g,0,0);return}i=e+164|0;j=e+162|0;b[j>>1]=b[i>>1]|0;k=g&16777215;g=k+1|0;l=e+36|0;if(g>>>0<(c[l>>2]|0)>>>0){m=c[e+32>>2]|0;n=d[m+k|0]<<8|d[m+g|0]}else{n=b6[c[e+12>>2]&63](c[e+4>>2]|0,k)|0}b[i>>1]=n;k=e+336|0;if((a[k]|0)!=0){iy(e);return}g=(c[h>>2]|0)+2|0;c[h>>2]=g;m=e+152|0;c[m>>2]=(c[m>>2]|0)+2;if((g&1|0)!=0){iA(e,g,0,0);return}b[j>>1]=n;n=g&16777215;g=n+1|0;do{if(g>>>0<(c[l>>2]|0)>>>0){j=c[e+32>>2]|0;b[i>>1]=d[j+n|0]<<8|d[j+g|0]}else{j=b6[c[e+12>>2]&63](c[e+4>>2]|0,n)|0;o=(a[k]|0)==0;b[i>>1]=j;if(o){break}iy(e);return}}while(0);c[h>>2]=(c[h>>2]|0)+2;c[m>>2]=c[f>>2];return}function jT(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+8|0;g=f|0;h=b[e+160>>1]|0;j=(h&65535)>>>9&7;k=h&63;if((b5[c[20600+(k<<2)>>2]&127](e,k,509,8)|0)!=0){i=f;return}if((mI(e,g)|0)!=0){i=f;return}k=j<<24>>24==0?8:j;j=a[g]|0;g=j+k&255;h=e+372|0;c[h>>2]=(c[h>>2]|0)+8;ma(e,g,k,j);j=e+156|0;k=c[j>>2]|0;if((k&1|0)!=0){iA(e,k,0,0);i=f;return}h=e+164|0;b[e+162>>1]=b[h>>1]|0;l=k&16777215;k=l+1|0;if(k>>>0<(c[e+36>>2]|0)>>>0){m=c[e+32>>2]|0;n=d[m+l|0]<<8|d[m+k|0]}else{n=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[h>>1]=n;if((a[e+336|0]|0)==0){c[j>>2]=(c[j>>2]|0)+2;j=e+152|0;c[j>>2]=(c[j>>2]|0)+2;mQ(e,g)|0;i=f;return}else{iy(e);i=f;return}}function jU(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;f=i;i=i+8|0;g=f|0;h=b[e+160>>1]|0;j=h&65535;if((j&56|0)==8){k=j>>>9&7;l=e+120+((j&7)<<2)|0;m=c[l>>2]|0;n=e+372|0;c[n>>2]=(c[n>>2]|0)+8;n=e+156|0;o=c[n>>2]|0;if((o&1|0)!=0){iA(e,o,0,0);i=f;return}p=e+164|0;b[e+162>>1]=b[p>>1]|0;q=o&16777215;o=q+1|0;if(o>>>0<(c[e+36>>2]|0)>>>0){r=c[e+32>>2]|0;s=d[r+q|0]<<8|d[r+o|0]}else{s=b6[c[e+12>>2]&63](c[e+4>>2]|0,q)|0}b[p>>1]=s;if((a[e+336|0]|0)==0){c[n>>2]=(c[n>>2]|0)+2;n=e+152|0;c[n>>2]=(c[n>>2]|0)+2;c[l>>2]=m+((k|0)==0?8:k);i=f;return}else{iy(e);i=f;return}}k=(h&65535)>>>9&7;h=j&63;if((b5[c[20600+(h<<2)>>2]&127](e,h,509,16)|0)!=0){i=f;return}if((mJ(e,g)|0)!=0){i=f;return}h=k<<16>>16==0?8:k;k=b[g>>1]|0;g=k+h&65535;j=e+372|0;c[j>>2]=(c[j>>2]|0)+8;mb(e,g,h,k);k=e+156|0;h=c[k>>2]|0;if((h&1|0)!=0){iA(e,h,0,0);i=f;return}j=e+164|0;b[e+162>>1]=b[j>>1]|0;m=h&16777215;h=m+1|0;if(h>>>0<(c[e+36>>2]|0)>>>0){l=c[e+32>>2]|0;t=d[l+m|0]<<8|d[l+h|0]}else{t=b6[c[e+12>>2]&63](c[e+4>>2]|0,m)|0}b[j>>1]=t;if((a[e+336|0]|0)==0){c[k>>2]=(c[k>>2]|0)+2;k=e+152|0;c[k>>2]=(c[k>>2]|0)+2;mR(e,g)|0;i=f;return}else{iy(e);i=f;return}}function jV(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;if((j&56|0)==8){k=j>>>9&7;l=f+120+((j&7)<<2)|0;m=c[l>>2]|0;n=f+372|0;c[n>>2]=(c[n>>2]|0)+12;n=f+156|0;o=c[n>>2]|0;if((o&1|0)!=0){iA(f,o,0,0);i=g;return}p=f+164|0;b[f+162>>1]=b[p>>1]|0;q=o&16777215;o=q+1|0;if(o>>>0<(c[f+36>>2]|0)>>>0){r=c[f+32>>2]|0;s=d[r+q|0]<<8|d[r+o|0]}else{s=b6[c[f+12>>2]&63](c[f+4>>2]|0,q)|0}b[p>>1]=s;if((a[f+336|0]|0)==0){c[n>>2]=(c[n>>2]|0)+2;n=f+152|0;c[n>>2]=(c[n>>2]|0)+2;c[l>>2]=m+((k|0)==0?8:k);i=g;return}else{iy(f);i=g;return}}k=j>>>9&7;m=j&63;if((b5[c[20600+(m<<2)>>2]&127](f,m,509,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}m=(k|0)==0?8:k;k=c[h>>2]|0;h=k+m|0;j=f+372|0;c[j>>2]=(c[j>>2]|0)+12;mg(f,h,m,k);k=f+156|0;m=c[k>>2]|0;if((m&1|0)!=0){iA(f,m,0,0);i=g;return}j=f+164|0;b[f+162>>1]=b[j>>1]|0;l=m&16777215;m=l+1|0;if(m>>>0<(c[f+36>>2]|0)>>>0){n=c[f+32>>2]|0;t=d[n+l|0]<<8|d[n+m|0]}else{t=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[j>>1]=t;if((a[f+336|0]|0)==0){c[k>>2]=(c[k>>2]|0)+2;k=f+152|0;c[k>>2]=(c[k>>2]|0)+2;mS(f,h)|0;i=g;return}else{iy(f);i=g;return}}function jW(a){a=a|0;if((b[a+160>>1]&56)==8){iO(a,1);return}else{iP(a,1);return}}function jX(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+8|0;g=f|0;h=b[e+160>>1]|0;j=(h&65535)>>>9&7;k=h&63;if((b5[c[20600+(k<<2)>>2]&127](e,k,509,8)|0)!=0){i=f;return}if((mI(e,g)|0)!=0){i=f;return}k=j<<24>>24==0?8:j;j=a[g]|0;g=j-k&255;h=e+372|0;c[h>>2]=(c[h>>2]|0)+8;mn(e,g,k,j);j=e+156|0;k=c[j>>2]|0;if((k&1|0)!=0){iA(e,k,0,0);i=f;return}h=e+164|0;b[e+162>>1]=b[h>>1]|0;l=k&16777215;k=l+1|0;if(k>>>0<(c[e+36>>2]|0)>>>0){m=c[e+32>>2]|0;n=d[m+l|0]<<8|d[m+k|0]}else{n=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[h>>1]=n;if((a[e+336|0]|0)==0){c[j>>2]=(c[j>>2]|0)+2;j=e+152|0;c[j>>2]=(c[j>>2]|0)+2;mQ(e,g)|0;i=f;return}else{iy(e);i=f;return}}function jY(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;f=i;i=i+8|0;g=f|0;h=b[e+160>>1]|0;j=h&65535;if((j&56|0)==8){k=j>>>9&7;l=e+120+((j&7)<<2)|0;m=c[l>>2]|0;n=e+372|0;c[n>>2]=(c[n>>2]|0)+8;n=e+156|0;o=c[n>>2]|0;if((o&1|0)!=0){iA(e,o,0,0);i=f;return}p=e+164|0;b[e+162>>1]=b[p>>1]|0;q=o&16777215;o=q+1|0;if(o>>>0<(c[e+36>>2]|0)>>>0){r=c[e+32>>2]|0;s=d[r+q|0]<<8|d[r+o|0]}else{s=b6[c[e+12>>2]&63](c[e+4>>2]|0,q)|0}b[p>>1]=s;if((a[e+336|0]|0)==0){c[n>>2]=(c[n>>2]|0)+2;n=e+152|0;c[n>>2]=(c[n>>2]|0)+2;c[l>>2]=m-((k|0)==0?8:k);i=f;return}else{iy(e);i=f;return}}k=(h&65535)>>>9&7;h=j&63;if((b5[c[20600+(h<<2)>>2]&127](e,h,509,16)|0)!=0){i=f;return}if((mJ(e,g)|0)!=0){i=f;return}h=k<<16>>16==0?8:k;k=b[g>>1]|0;g=k-h&65535;j=e+372|0;c[j>>2]=(c[j>>2]|0)+8;mo(e,g,h,k);k=e+156|0;h=c[k>>2]|0;if((h&1|0)!=0){iA(e,h,0,0);i=f;return}j=e+164|0;b[e+162>>1]=b[j>>1]|0;m=h&16777215;h=m+1|0;if(h>>>0<(c[e+36>>2]|0)>>>0){l=c[e+32>>2]|0;t=d[l+m|0]<<8|d[l+h|0]}else{t=b6[c[e+12>>2]&63](c[e+4>>2]|0,m)|0}b[j>>1]=t;if((a[e+336|0]|0)==0){c[k>>2]=(c[k>>2]|0)+2;k=e+152|0;c[k>>2]=(c[k>>2]|0)+2;mR(e,g)|0;i=f;return}else{iy(e);i=f;return}}function jZ(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;if((j&56|0)==8){k=j>>>9&7;l=f+120+((j&7)<<2)|0;m=c[l>>2]|0;n=f+372|0;c[n>>2]=(c[n>>2]|0)+12;n=f+156|0;o=c[n>>2]|0;if((o&1|0)!=0){iA(f,o,0,0);i=g;return}p=f+164|0;b[f+162>>1]=b[p>>1]|0;q=o&16777215;o=q+1|0;if(o>>>0<(c[f+36>>2]|0)>>>0){r=c[f+32>>2]|0;s=d[r+q|0]<<8|d[r+o|0]}else{s=b6[c[f+12>>2]&63](c[f+4>>2]|0,q)|0}b[p>>1]=s;if((a[f+336|0]|0)==0){c[n>>2]=(c[n>>2]|0)+2;n=f+152|0;c[n>>2]=(c[n>>2]|0)+2;c[l>>2]=m-((k|0)==0?8:k);i=g;return}else{iy(f);i=g;return}}k=j>>>9&7;m=j&63;if((b5[c[20600+(m<<2)>>2]&127](f,m,509,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}m=(k|0)==0?8:k;k=c[h>>2]|0;h=k-m|0;j=f+372|0;c[j>>2]=(c[j>>2]|0)+12;mp(f,h,m,k);k=f+156|0;m=c[k>>2]|0;if((m&1|0)!=0){iA(f,m,0,0);i=g;return}j=f+164|0;b[f+162>>1]=b[j>>1]|0;l=m&16777215;m=l+1|0;if(m>>>0<(c[f+36>>2]|0)>>>0){n=c[f+32>>2]|0;t=d[n+l|0]<<8|d[n+m|0]}else{t=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[j>>1]=t;if((a[f+336|0]|0)==0){c[k>>2]=(c[k>>2]|0)+2;k=f+152|0;c[k>>2]=(c[k>>2]|0)+2;mS(f,h)|0;i=g;return}else{iy(f);i=g;return}}function j_(a){a=a|0;if((b[a+160>>1]&56)==8){iO(a,0);return}else{iP(a,0);return}}function j$(a){a=a|0;var c=0,d=0;c=e[a+166>>1]|0;if((c&1|0)==0){d=c>>>2&1^1}else{d=0}if((b[a+160>>1]&56)==8){iO(a,d);return}else{iP(a,d);return}}function j0(a){a=a|0;var c=0,d=0;c=e[a+166>>1]|0;if((c&1|0)==0){d=c>>>2&1}else{d=1}if((b[a+160>>1]&56)==8){iO(a,d);return}else{iP(a,d);return}}function j1(a){a=a|0;var c=0;c=(b[a+166>>1]&1^1)&65535;if((b[a+160>>1]&56)==8){iO(a,c);return}else{iP(a,c);return}}function j2(a){a=a|0;var c=0;c=b[a+166>>1]&1;if((b[a+160>>1]&56)==8){iO(a,c);return}else{iP(a,c);return}}function j3(a){a=a|0;var c=0;c=((e[a+166>>1]|0)>>>2&1^1)&65535;if((b[a+160>>1]&56)==8){iO(a,c);return}else{iP(a,c);return}}function j4(a){a=a|0;var c=0;c=(e[a+166>>1]|0)>>>2&1;if((b[a+160>>1]&56)==8){iO(a,c);return}else{iP(a,c);return}}function j5(a){a=a|0;var c=0;c=((e[a+166>>1]|0)>>>1&1^1)&65535;if((b[a+160>>1]&56)==8){iO(a,c);return}else{iP(a,c);return}}function j6(a){a=a|0;var c=0;c=(e[a+166>>1]|0)>>>1&1;if((b[a+160>>1]&56)==8){iO(a,c);return}else{iP(a,c);return}}function j7(a){a=a|0;var c=0;c=((e[a+166>>1]|0)>>>3&1^1)&65535;if((b[a+160>>1]&56)==8){iO(a,c);return}else{iP(a,c);return}}function j8(a){a=a|0;var c=0;c=(e[a+166>>1]|0)>>>3&1;if((b[a+160>>1]&56)==8){iO(a,c);return}else{iP(a,c);return}}function j9(a){a=a|0;var c=0,d=0;c=e[a+166>>1]|0;d=(c>>>3^c>>>1)&1^1;if((b[a+160>>1]&56)==8){iO(a,d);return}else{iP(a,d);return}}function ka(a){a=a|0;var c=0,d=0;c=e[a+166>>1]|0;d=(c>>>3^c>>>1)&1;if((b[a+160>>1]&56)==8){iO(a,d);return}else{iP(a,d);return}}function kb(a){a=a|0;var c=0,d=0;c=e[a+166>>1]|0;if(((c>>>3^c>>>1)&1|0)==0){d=c>>>2&1^1}else{d=0}if((b[a+160>>1]&56)==8){iO(a,d);return}else{iP(a,d);return}}function kc(a){a=a|0;var c=0,d=0;c=e[a+166>>1]|0;if(((c>>>3^c>>>1)&1|0)==0){d=c>>>2&1}else{d=1}if((b[a+160>>1]&56)==8){iO(a,d);return}else{iP(a,d);return}}function kd(a){a=a|0;lm(a,1);return}function ke(d){d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;e=((b[d+160>>1]&255)!=0?2:4)+(c[d+152>>2]|0)|0;f=d+148|0;g=(c[f>>2]|0)-4|0;h=g&16777215;i=h+3|0;if(i>>>0<(c[d+36>>2]|0)>>>0){j=d+32|0;a[(c[j>>2]|0)+h|0]=e>>>24&255;a[(c[j>>2]|0)+(h+1)|0]=e>>>16&255;a[(c[j>>2]|0)+(h+2)|0]=e>>>8&255;a[(c[j>>2]|0)+i|0]=e&255;c[f>>2]=g;lm(d,1);return}else{b3[c[d+28>>2]&63](c[d+4>>2]|0,h,e);c[f>>2]=g;lm(d,1);return}}function kf(a){a=a|0;var b=0,c=0;b=e[a+166>>1]|0;if((b&1|0)!=0){c=0;lm(a,c);return}c=b>>>2&1^1;lm(a,c);return}function kg(a){a=a|0;var b=0,c=0;b=e[a+166>>1]|0;if((b&1|0)==0){c=b>>>2&1}else{c=1}lm(a,c);return}function kh(a){a=a|0;lm(a,(b[a+166>>1]&1^1)&65535);return}function ki(a){a=a|0;lm(a,b[a+166>>1]&1);return}function kj(a){a=a|0;lm(a,((e[a+166>>1]|0)>>>2&1^1)&65535);return}function kk(a){a=a|0;lm(a,(e[a+166>>1]|0)>>>2&1);return}function kl(a){a=a|0;lm(a,((e[a+166>>1]|0)>>>1&1^1)&65535);return}function km(a){a=a|0;lm(a,(e[a+166>>1]|0)>>>1&1);return}function kn(a){a=a|0;lm(a,((e[a+166>>1]|0)>>>3&1^1)&65535);return}function ko(a){a=a|0;lm(a,(e[a+166>>1]|0)>>>3&1);return}function kp(a){a=a|0;var b=0;b=e[a+166>>1]|0;lm(a,(b>>>3^b>>>1)&1^1);return}function kq(a){a=a|0;var b=0;b=e[a+166>>1]|0;lm(a,(b>>>3^b>>>1)&1);return}function kr(a){a=a|0;var b=0,c=0;b=e[a+166>>1]|0;if(((b>>>3^b>>>1)&1|0)!=0){c=0;lm(a,c);return}c=b>>>2&1^1;lm(a,c);return}function ks(a){a=a|0;var b=0,c=0;b=e[a+166>>1]|0;if(((b>>>3^b>>>1)&1|0)!=0){c=1;lm(a,c);return}c=b>>>2&1;lm(a,c);return}function kt(f){f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;g=f+160|0;h=e[g>>1]|0;i=(h&128|0)!=0?h|-256:h&255;h=f+372|0;c[h>>2]=(c[h>>2]|0)+4;l9(f,15,i);c[f+88+(((e[g>>1]|0)>>>9&7)<<2)>>2]=i;i=f+156|0;g=c[i>>2]|0;if((g&1|0)!=0){iA(f,g,0,0);return}h=f+164|0;b[f+162>>1]=b[h>>1]|0;j=g&16777215;g=j+1|0;if(g>>>0<(c[f+36>>2]|0)>>>0){k=c[f+32>>2]|0;l=d[k+j|0]<<8|d[k+g|0]}else{l=b6[c[f+12>>2]&63](c[f+4>>2]|0,j)|0}b[h>>1]=l;if((a[f+336|0]|0)==0){c[i>>2]=(c[i>>2]|0)+2;i=f+152|0;c[i>>2]=(c[i>>2]|0)+2;return}else{iy(f);return}}function ku(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;k=j&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4093,8)|0)!=0){i=g;return}if((mI(f,h)|0)!=0){i=g;return}k=f+88+((j>>>9&7)<<2)|0;j=d[h]|c[k>>2];h=f+372|0;c[h>>2]=(c[h>>2]|0)+8;l7(f,15,j&255);h=f+156|0;l=c[h>>2]|0;if((l&1|0)!=0){iA(f,l,0,0);i=g;return}m=f+164|0;b[f+162>>1]=b[m>>1]|0;n=l&16777215;l=n+1|0;if(l>>>0<(c[f+36>>2]|0)>>>0){o=c[f+32>>2]|0;p=d[o+n|0]<<8|d[o+l|0]}else{p=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[m>>1]=p;if((a[f+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=f+152|0;c[h>>2]=(c[h>>2]|0)+2;c[k>>2]=c[k>>2]&-256|j&255;i=g;return}else{iy(f);i=g;return}}function kv(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;k=j&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4093,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}k=f+88+((j>>>9&7)<<2)|0;j=e[h>>1]|c[k>>2];h=f+372|0;c[h>>2]=(c[h>>2]|0)+8;l8(f,15,j&65535);h=f+156|0;l=c[h>>2]|0;if((l&1|0)!=0){iA(f,l,0,0);i=g;return}m=f+164|0;b[f+162>>1]=b[m>>1]|0;n=l&16777215;l=n+1|0;if(l>>>0<(c[f+36>>2]|0)>>>0){o=c[f+32>>2]|0;p=d[o+n|0]<<8|d[o+l|0]}else{p=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[m>>1]=p;if((a[f+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=f+152|0;c[h>>2]=(c[h>>2]|0)+2;c[k>>2]=c[k>>2]&-65536|j&65535;i=g;return}else{iy(f);i=g;return}}function kw(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;k=j&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4093,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}k=f+88+((j>>>9&7)<<2)|0;j=c[h>>2]|c[k>>2];h=f+372|0;c[h>>2]=(c[h>>2]|0)+10;l9(f,15,j);h=f+156|0;l=c[h>>2]|0;if((l&1|0)!=0){iA(f,l,0,0);i=g;return}m=f+164|0;b[f+162>>1]=b[m>>1]|0;n=l&16777215;l=n+1|0;if(l>>>0<(c[f+36>>2]|0)>>>0){o=c[f+32>>2]|0;p=d[o+n|0]<<8|d[o+l|0]}else{p=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[m>>1]=p;if((a[f+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=f+152|0;c[h>>2]=(c[h>>2]|0)+2;c[k>>2]=j;i=g;return}else{iy(f);i=g;return}}function kx(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;k=j&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4093,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}k=f+88+((j>>>9&7)<<2)|0;j=c[k>>2]|0;l=b[h>>1]|0;h=l&65535;if(l<<16>>16==0){l=f+156|0;m=c[l>>2]|0;if((m&1|0)!=0){iA(f,m,0,0);i=g;return}n=f+164|0;b[f+162>>1]=b[n>>1]|0;o=m&16777215;m=o+1|0;if(m>>>0<(c[f+36>>2]|0)>>>0){p=c[f+32>>2]|0;q=d[p+o|0]<<8|d[p+m|0]}else{q=b6[c[f+12>>2]&63](c[f+4>>2]|0,o)|0}b[n>>1]=q;if((a[f+336|0]|0)==0){c[l>>2]=(c[l>>2]|0)+2;l=f+152|0;c[l>>2]=(c[l>>2]|0)+2;iC(f);i=g;return}else{iy(f);i=g;return}}l=(j>>>0)/(h>>>0)|0;if(l>>>0>65535){q=f+166|0;b[q>>1]=b[q>>1]&-4|2}else{c[k>>2]=((j>>>0)%(h>>>0)|0)<<16|l&65535;l8(f,15,l&65535)}l=f+372|0;c[l>>2]=(c[l>>2]|0)+144;l=f+156|0;h=c[l>>2]|0;if((h&1|0)!=0){iA(f,h,0,0);i=g;return}j=f+164|0;b[f+162>>1]=b[j>>1]|0;k=h&16777215;h=k+1|0;if(h>>>0<(c[f+36>>2]|0)>>>0){q=c[f+32>>2]|0;r=d[q+k|0]<<8|d[q+h|0]}else{r=b6[c[f+12>>2]&63](c[f+4>>2]|0,k)|0}b[j>>1]=r;if((a[f+336|0]|0)==0){c[l>>2]=(c[l>>2]|0)+2;l=f+152|0;c[l>>2]=(c[l>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}function ky(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=i;i=i+24|0;h=g|0;j=g+8|0;k=g+16|0;l=e[f+160>>1]|0;if((l&48|0)!=0){m=c[f+88+((l>>>9&7)<<2)>>2]|0;n=l&63;if((b5[c[20600+(n<<2)>>2]&127](f,n,508,8)|0)!=0){i=g;return}if((mI(f,k)|0)!=0){i=g;return}n=(d[k]|m)&255;m=f+372|0;c[m>>2]=(c[m>>2]|0)+8;l7(f,15,n);m=f+156|0;k=c[m>>2]|0;if((k&1|0)!=0){iA(f,k,0,0);i=g;return}o=f+164|0;b[f+162>>1]=b[o>>1]|0;p=k&16777215;k=p+1|0;if(k>>>0<(c[f+36>>2]|0)>>>0){q=c[f+32>>2]|0;r=d[q+p|0]<<8|d[q+k|0]}else{r=b6[c[f+12>>2]&63](c[f+4>>2]|0,p)|0}b[o>>1]=r;if((a[f+336|0]|0)==0){c[m>>2]=(c[m>>2]|0)+2;m=f+152|0;c[m>>2]=(c[m>>2]|0)+2;mQ(f,n)|0;i=g;return}else{iy(f);i=g;return}}n=l&7;m=l>>>9&7;if((l&8|0)==0){s=m;t=n}else{s=m|32;t=n|32}if((b5[c[20600+(t<<2)>>2]&127](f,t,17,8)|0)!=0){i=g;return}if((mI(f,h)|0)!=0){i=g;return}if((b5[c[20600+(s<<2)>>2]&127](f,s,17,8)|0)!=0){i=g;return}if((mI(f,j)|0)!=0){i=g;return}s=a[j]|0;j=a[h]|0;h=f+166|0;t=b[h>>1]|0;n=((s&255)-(j&255)&65535)-((t&65535)>>>4&1)&65535;m=(s&15)>>>0<(j&15)>>>0?n-6&65535:n;n=(m&65535)>159?m-96&65535:m;m=f+372|0;c[m>>2]=(c[m>>2]|0)+10;m=n&65535;j=(m&65280|0)==0?t&-18:t|17;b[h>>1]=(m&255|0)==0?j:j&-5;j=f+156|0;m=c[j>>2]|0;if((m&1|0)!=0){iA(f,m,0,0);i=g;return}h=f+164|0;b[f+162>>1]=b[h>>1]|0;t=m&16777215;m=t+1|0;if(m>>>0<(c[f+36>>2]|0)>>>0){s=c[f+32>>2]|0;u=d[s+t|0]<<8|d[s+m|0]}else{u=b6[c[f+12>>2]&63](c[f+4>>2]|0,t)|0}b[h>>1]=u;if((a[f+336|0]|0)==0){c[j>>2]=(c[j>>2]|0)+2;j=f+152|0;c[j>>2]=(c[j>>2]|0)+2;j=n&255;mQ(f,j)|0;i=g;return}else{iy(f);i=g;return}}function kz(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;k=c[f+88+((j>>>9&7)<<2)>>2]|0;l=j&63;if((b5[c[20600+(l<<2)>>2]&127](f,l,508,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}l=(e[h>>1]|k)&65535;k=f+372|0;c[k>>2]=(c[k>>2]|0)+8;l8(f,15,l);k=f+156|0;h=c[k>>2]|0;if((h&1|0)!=0){iA(f,h,0,0);i=g;return}j=f+164|0;b[f+162>>1]=b[j>>1]|0;m=h&16777215;h=m+1|0;if(h>>>0<(c[f+36>>2]|0)>>>0){n=c[f+32>>2]|0;o=d[n+m|0]<<8|d[n+h|0]}else{o=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[j>>1]=o;if((a[f+336|0]|0)==0){c[k>>2]=(c[k>>2]|0)+2;k=f+152|0;c[k>>2]=(c[k>>2]|0)+2;mR(f,l)|0;i=g;return}else{iy(f);i=g;return}}function kA(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;k=c[f+88+((j>>>9&7)<<2)>>2]|0;l=j&63;if((b5[c[20600+(l<<2)>>2]&127](f,l,508,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}l=c[h>>2]|k;k=f+372|0;c[k>>2]=(c[k>>2]|0)+10;l9(f,15,l);k=f+156|0;h=c[k>>2]|0;if((h&1|0)!=0){iA(f,h,0,0);i=g;return}j=f+164|0;b[f+162>>1]=b[j>>1]|0;m=h&16777215;h=m+1|0;if(h>>>0<(c[f+36>>2]|0)>>>0){n=c[f+32>>2]|0;o=d[n+m|0]<<8|d[n+h|0]}else{o=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[j>>1]=o;if((a[f+336|0]|0)==0){c[k>>2]=(c[k>>2]|0)+2;k=f+152|0;c[k>>2]=(c[k>>2]|0)+2;mS(f,l)|0;i=g;return}else{iy(f);i=g;return}}function kB(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;k=j&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4093,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}k=f+88+((j>>>9&7)<<2)|0;j=c[k>>2]|0;l=b[h>>1]|0;if(l<<16>>16==0){m=f+156|0;n=c[m>>2]|0;if((n&1|0)!=0){iA(f,n,0,0);i=g;return}o=f+164|0;b[f+162>>1]=b[o>>1]|0;p=n&16777215;n=p+1|0;if(n>>>0<(c[f+36>>2]|0)>>>0){q=c[f+32>>2]|0;r=d[q+p|0]<<8|d[q+n|0]}else{r=b6[c[f+12>>2]&63](c[f+4>>2]|0,p)|0}b[o>>1]=r;if((a[f+336|0]|0)==0){c[m>>2]=(c[m>>2]|0)+2;m=f+152|0;c[m>>2]=(c[m>>2]|0)+2;iC(f);i=g;return}else{iy(f);i=g;return}}m=j>>>31;r=(j|0)<0?-j|0:j;if(l<<16>>16>-1){s=0;t=l}else{j=-l&65535;b[h>>1]=j;s=1;t=j}j=t&65535;t=(r>>>0)/(j>>>0)|0;h=(r>>>0)%(j>>>0)|0;if((m|0)==0){u=h}else{u=-h&65535}h=(s|0)==(m|0)?t:-t|0;t=f+372|0;c[t>>2]=(c[t>>2]|0)+162;t=h&-32768;if((t|0)==0|(t|0)==(-32768|0)){c[k>>2]=u<<16|h&65535;l8(f,15,h&65535)}else{h=f+166|0;b[h>>1]=b[h>>1]&-4|2}h=f+156|0;u=c[h>>2]|0;if((u&1|0)!=0){iA(f,u,0,0);i=g;return}k=f+164|0;b[f+162>>1]=b[k>>1]|0;t=u&16777215;u=t+1|0;if(u>>>0<(c[f+36>>2]|0)>>>0){m=c[f+32>>2]|0;v=d[m+t|0]<<8|d[m+u|0]}else{v=b6[c[f+12>>2]&63](c[f+4>>2]|0,t)|0}b[k>>1]=v;if((a[f+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=f+152|0;c[h>>2]=(c[h>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}function kC(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;k=j&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4093,8)|0)!=0){i=g;return}if((mI(f,h)|0)!=0){i=g;return}k=f+88+((j>>>9&7)<<2)|0;j=c[k>>2]|0;l=a[h]|0;h=j-(l&255)|0;m=f+372|0;c[m>>2]=(c[m>>2]|0)+8;mn(f,h&255,l,j&255);j=f+156|0;l=c[j>>2]|0;if((l&1|0)!=0){iA(f,l,0,0);i=g;return}m=f+164|0;b[f+162>>1]=b[m>>1]|0;n=l&16777215;l=n+1|0;if(l>>>0<(c[f+36>>2]|0)>>>0){o=c[f+32>>2]|0;p=d[o+n|0]<<8|d[o+l|0]}else{p=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[m>>1]=p;if((a[f+336|0]|0)==0){c[j>>2]=(c[j>>2]|0)+2;j=f+152|0;c[j>>2]=(c[j>>2]|0)+2;c[k>>2]=c[k>>2]&-256|h&255;i=g;return}else{iy(f);i=g;return}}function kD(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;k=j&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4095,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}k=f+88+((j>>>9&7)<<2)|0;j=c[k>>2]|0;l=b[h>>1]|0;h=j-(l&65535)|0;m=f+372|0;c[m>>2]=(c[m>>2]|0)+8;mo(f,h&65535,l,j&65535);j=f+156|0;l=c[j>>2]|0;if((l&1|0)!=0){iA(f,l,0,0);i=g;return}m=f+164|0;b[f+162>>1]=b[m>>1]|0;n=l&16777215;l=n+1|0;if(l>>>0<(c[f+36>>2]|0)>>>0){o=c[f+32>>2]|0;p=d[o+n|0]<<8|d[o+l|0]}else{p=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[m>>1]=p;if((a[f+336|0]|0)==0){c[j>>2]=(c[j>>2]|0)+2;j=f+152|0;c[j>>2]=(c[j>>2]|0)+2;c[k>>2]=c[k>>2]&-65536|h&65535;i=g;return}else{iy(f);i=g;return}}function kE(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;k=j&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4095,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}k=f+88+((j>>>9&7)<<2)|0;j=c[k>>2]|0;l=c[h>>2]|0;h=j-l|0;m=f+372|0;c[m>>2]=(c[m>>2]|0)+10;mp(f,h,l,j);j=f+156|0;l=c[j>>2]|0;if((l&1|0)!=0){iA(f,l,0,0);i=g;return}m=f+164|0;b[f+162>>1]=b[m>>1]|0;n=l&16777215;l=n+1|0;if(l>>>0<(c[f+36>>2]|0)>>>0){o=c[f+32>>2]|0;p=d[o+n|0]<<8|d[o+l|0]}else{p=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[m>>1]=p;if((a[f+336|0]|0)==0){c[j>>2]=(c[j>>2]|0)+2;j=f+152|0;c[j>>2]=(c[j>>2]|0)+2;c[k>>2]=h;i=g;return}else{iy(f);i=g;return}}function kF(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;k=j&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4095,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}k=e[h>>1]|0;h=f+120+((j>>>9&7)<<2)|0;j=c[h>>2]|0;l=f+372|0;c[l>>2]=(c[l>>2]|0)+8;l=f+156|0;m=c[l>>2]|0;if((m&1|0)!=0){iA(f,m,0,0);i=g;return}n=f+164|0;b[f+162>>1]=b[n>>1]|0;o=m&16777215;m=o+1|0;if(m>>>0<(c[f+36>>2]|0)>>>0){p=c[f+32>>2]|0;q=d[p+o|0]<<8|d[p+m|0]}else{q=b6[c[f+12>>2]&63](c[f+4>>2]|0,o)|0}b[n>>1]=q;if((a[f+336|0]|0)==0){c[l>>2]=(c[l>>2]|0)+2;l=f+152|0;c[l>>2]=(c[l>>2]|0)+2;c[h>>2]=j-((k&32768|0)!=0?k|-65536:k);i=g;return}else{iy(f);i=g;return}}function kG(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=i;i=i+24|0;h=g|0;j=g+8|0;k=g+16|0;l=e[f+160>>1]|0;if((l&48|0)!=0){m=c[f+88+((l>>>9&7)<<2)>>2]|0;n=l&63;if((b5[c[20600+(n<<2)>>2]&127](f,n,508,8)|0)!=0){i=g;return}if((mI(f,k)|0)!=0){i=g;return}n=a[k]|0;k=(n&255)-m&255;o=f+372|0;c[o>>2]=(c[o>>2]|0)+8;mn(f,k,m&255,n);n=f+156|0;m=c[n>>2]|0;if((m&1|0)!=0){iA(f,m,0,0);i=g;return}o=f+164|0;b[f+162>>1]=b[o>>1]|0;p=m&16777215;m=p+1|0;if(m>>>0<(c[f+36>>2]|0)>>>0){q=c[f+32>>2]|0;r=d[q+p|0]<<8|d[q+m|0]}else{r=b6[c[f+12>>2]&63](c[f+4>>2]|0,p)|0}b[o>>1]=r;if((a[f+336|0]|0)==0){c[n>>2]=(c[n>>2]|0)+2;n=f+152|0;c[n>>2]=(c[n>>2]|0)+2;mQ(f,k)|0;i=g;return}else{iy(f);i=g;return}}k=l&7;n=l>>>9&7;if((l&8|0)==0){s=n;t=k}else{s=n|32;t=k|32}if((b5[c[20600+(t<<2)>>2]&127](f,t,17,8)|0)!=0){i=g;return}if((mI(f,h)|0)!=0){i=g;return}if((b5[c[20600+(s<<2)>>2]&127](f,s,17,8)|0)!=0){i=g;return}if((mI(f,j)|0)!=0){i=g;return}s=a[j]|0;j=a[h]|0;h=(s-j&255)-((e[f+166>>1]|0)>>>4&1)&255;t=f+372|0;c[t>>2]=(c[t>>2]|0)+8;mq(f,h,j,s);s=f+156|0;j=c[s>>2]|0;if((j&1|0)!=0){iA(f,j,0,0);i=g;return}t=f+164|0;b[f+162>>1]=b[t>>1]|0;k=j&16777215;j=k+1|0;if(j>>>0<(c[f+36>>2]|0)>>>0){n=c[f+32>>2]|0;u=d[n+k|0]<<8|d[n+j|0]}else{u=b6[c[f+12>>2]&63](c[f+4>>2]|0,k)|0}b[t>>1]=u;if((a[f+336|0]|0)==0){c[s>>2]=(c[s>>2]|0)+2;s=f+152|0;c[s>>2]=(c[s>>2]|0)+2;mQ(f,h)|0;i=g;return}else{iy(f);i=g;return}}function kH(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=i;i=i+24|0;h=g|0;j=g+8|0;k=g+16|0;l=e[f+160>>1]|0;if((l&48|0)!=0){m=c[f+88+((l>>>9&7)<<2)>>2]|0;n=l&63;if((b5[c[20600+(n<<2)>>2]&127](f,n,508,16)|0)!=0){i=g;return}if((mJ(f,k)|0)!=0){i=g;return}n=b[k>>1]|0;k=(n&65535)-m&65535;o=f+372|0;c[o>>2]=(c[o>>2]|0)+8;mo(f,k,m&65535,n);n=f+156|0;m=c[n>>2]|0;if((m&1|0)!=0){iA(f,m,0,0);i=g;return}o=f+164|0;b[f+162>>1]=b[o>>1]|0;p=m&16777215;m=p+1|0;if(m>>>0<(c[f+36>>2]|0)>>>0){q=c[f+32>>2]|0;r=d[q+p|0]<<8|d[q+m|0]}else{r=b6[c[f+12>>2]&63](c[f+4>>2]|0,p)|0}b[o>>1]=r;if((a[f+336|0]|0)==0){c[n>>2]=(c[n>>2]|0)+2;n=f+152|0;c[n>>2]=(c[n>>2]|0)+2;mR(f,k)|0;i=g;return}else{iy(f);i=g;return}}k=l&7;n=l>>>9&7;if((l&8|0)==0){s=n;t=k}else{s=n|32;t=k|32}if((b5[c[20600+(t<<2)>>2]&127](f,t,17,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}if((b5[c[20600+(s<<2)>>2]&127](f,s,17,16)|0)!=0){i=g;return}if((mJ(f,j)|0)!=0){i=g;return}s=b[j>>1]|0;j=b[h>>1]|0;h=(s-j&65535)-((e[f+166>>1]|0)>>>4&1)&65535;t=f+372|0;c[t>>2]=(c[t>>2]|0)+8;mr(f,h,j,s);s=f+156|0;j=c[s>>2]|0;if((j&1|0)!=0){iA(f,j,0,0);i=g;return}t=f+164|0;b[f+162>>1]=b[t>>1]|0;k=j&16777215;j=k+1|0;if(j>>>0<(c[f+36>>2]|0)>>>0){n=c[f+32>>2]|0;u=d[n+k|0]<<8|d[n+j|0]}else{u=b6[c[f+12>>2]&63](c[f+4>>2]|0,k)|0}b[t>>1]=u;if((a[f+336|0]|0)==0){c[s>>2]=(c[s>>2]|0)+2;s=f+152|0;c[s>>2]=(c[s>>2]|0)+2;mR(f,h)|0;i=g;return}else{iy(f);i=g;return}}function kI(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=i;i=i+24|0;h=g|0;j=g+8|0;k=g+16|0;l=e[f+160>>1]|0;if((l&48|0)!=0){m=c[f+88+((l>>>9&7)<<2)>>2]|0;n=l&63;if((b5[c[20600+(n<<2)>>2]&127](f,n,508,32)|0)!=0){i=g;return}if((mK(f,k)|0)!=0){i=g;return}n=c[k>>2]|0;k=n-m|0;o=f+372|0;c[o>>2]=(c[o>>2]|0)+12;mp(f,k,m,n);n=f+156|0;m=c[n>>2]|0;if((m&1|0)!=0){iA(f,m,0,0);i=g;return}o=f+164|0;b[f+162>>1]=b[o>>1]|0;p=m&16777215;m=p+1|0;if(m>>>0<(c[f+36>>2]|0)>>>0){q=c[f+32>>2]|0;r=d[q+p|0]<<8|d[q+m|0]}else{r=b6[c[f+12>>2]&63](c[f+4>>2]|0,p)|0}b[o>>1]=r;if((a[f+336|0]|0)==0){c[n>>2]=(c[n>>2]|0)+2;n=f+152|0;c[n>>2]=(c[n>>2]|0)+2;mS(f,k)|0;i=g;return}else{iy(f);i=g;return}}k=l&7;n=l>>>9&7;if((l&8|0)==0){s=n;t=k}else{s=n|32;t=k|32}if((b5[c[20600+(t<<2)>>2]&127](f,t,17,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}if((b5[c[20600+(s<<2)>>2]&127](f,s,17,32)|0)!=0){i=g;return}if((mK(f,j)|0)!=0){i=g;return}s=c[j>>2]|0;j=c[h>>2]|0;h=s-j-((e[f+166>>1]|0)>>>4&1)|0;t=f+372|0;c[t>>2]=(c[t>>2]|0)+12;ms(f,h,j,s);s=f+156|0;j=c[s>>2]|0;if((j&1|0)!=0){iA(f,j,0,0);i=g;return}t=f+164|0;b[f+162>>1]=b[t>>1]|0;k=j&16777215;j=k+1|0;if(j>>>0<(c[f+36>>2]|0)>>>0){n=c[f+32>>2]|0;u=d[n+k|0]<<8|d[n+j|0]}else{u=b6[c[f+12>>2]&63](c[f+4>>2]|0,k)|0}b[t>>1]=u;if((a[f+336|0]|0)==0){c[s>>2]=(c[s>>2]|0)+2;s=f+152|0;c[s>>2]=(c[s>>2]|0)+2;mS(f,h)|0;i=g;return}else{iy(f);i=g;return}}function kJ(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;k=j&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4095,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}k=f+120+((j>>>9&7)<<2)|0;j=c[k>>2]|0;l=c[h>>2]|0;h=f+372|0;c[h>>2]=(c[h>>2]|0)+10;h=f+156|0;m=c[h>>2]|0;if((m&1|0)!=0){iA(f,m,0,0);i=g;return}n=f+164|0;b[f+162>>1]=b[n>>1]|0;o=m&16777215;m=o+1|0;if(m>>>0<(c[f+36>>2]|0)>>>0){p=c[f+32>>2]|0;q=d[p+o|0]<<8|d[p+m|0]}else{q=b6[c[f+12>>2]&63](c[f+4>>2]|0,o)|0}b[n>>1]=q;if((a[f+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=f+152|0;c[h>>2]=(c[h>>2]|0)+2;c[k>>2]=j-l;i=g;return}else{iy(f);i=g;return}}function kK(a){a=a|0;b[a+328>>1]=b[a+160>>1]|0;iG(a);return}function kL(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g|0;j=f+160|0;k=b[j>>1]&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4093,8)|0)!=0){i=g;return}if((mI(f,h)|0)!=0){i=g;return}k=c[f+88+(((e[j>>1]|0)>>>9&7)<<2)>>2]|0;j=f+372|0;c[j>>2]=(c[j>>2]|0)+4;j=a[h]|0;mk(f,k-(j&255)&255,j,k&255);k=f+156|0;j=c[k>>2]|0;if((j&1|0)!=0){iA(f,j,0,0);i=g;return}h=f+164|0;b[f+162>>1]=b[h>>1]|0;l=j&16777215;j=l+1|0;if(j>>>0<(c[f+36>>2]|0)>>>0){m=c[f+32>>2]|0;n=d[m+l|0]<<8|d[m+j|0]}else{n=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[h>>1]=n;if((a[f+336|0]|0)==0){c[k>>2]=(c[k>>2]|0)+2;k=f+152|0;c[k>>2]=(c[k>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}function kM(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g|0;j=f+160|0;k=b[j>>1]&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4095,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}k=c[f+88+(((e[j>>1]|0)>>>9&7)<<2)>>2]|0;j=f+372|0;c[j>>2]=(c[j>>2]|0)+4;j=b[h>>1]|0;ml(f,k-(j&65535)&65535,j,k&65535);k=f+156|0;j=c[k>>2]|0;if((j&1|0)!=0){iA(f,j,0,0);i=g;return}h=f+164|0;b[f+162>>1]=b[h>>1]|0;l=j&16777215;j=l+1|0;if(j>>>0<(c[f+36>>2]|0)>>>0){m=c[f+32>>2]|0;n=d[m+l|0]<<8|d[m+j|0]}else{n=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[h>>1]=n;if((a[f+336|0]|0)==0){c[k>>2]=(c[k>>2]|0)+2;k=f+152|0;c[k>>2]=(c[k>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}function kN(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g|0;j=f+160|0;k=b[j>>1]&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4095,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}k=c[f+88+(((e[j>>1]|0)>>>9&7)<<2)>>2]|0;j=f+372|0;c[j>>2]=(c[j>>2]|0)+6;j=c[h>>2]|0;mm(f,k-j|0,j,k);k=f+156|0;j=c[k>>2]|0;if((j&1|0)!=0){iA(f,j,0,0);i=g;return}h=f+164|0;b[f+162>>1]=b[h>>1]|0;l=j&16777215;j=l+1|0;if(j>>>0<(c[f+36>>2]|0)>>>0){m=c[f+32>>2]|0;n=d[m+l|0]<<8|d[m+j|0]}else{n=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[h>>1]=n;if((a[f+336|0]|0)==0){c[k>>2]=(c[k>>2]|0)+2;k=f+152|0;c[k>>2]=(c[k>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}function kO(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g|0;j=f+160|0;k=b[j>>1]&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4095,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}k=e[h>>1]|0;h=(k&32768|0)!=0?k|-65536:k;k=c[f+120+(((e[j>>1]|0)>>>9&7)<<2)>>2]|0;j=f+372|0;c[j>>2]=(c[j>>2]|0)+8;mm(f,k-h|0,h,k);k=f+156|0;h=c[k>>2]|0;if((h&1|0)!=0){iA(f,h,0,0);i=g;return}j=f+164|0;b[f+162>>1]=b[j>>1]|0;l=h&16777215;h=l+1|0;if(h>>>0<(c[f+36>>2]|0)>>>0){m=c[f+32>>2]|0;n=d[m+l|0]<<8|d[m+h|0]}else{n=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[j>>1]=n;if((a[f+336|0]|0)==0){c[k>>2]=(c[k>>2]|0)+2;k=f+152|0;c[k>>2]=(c[k>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}function kP(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;g=i;i=i+24|0;h=g|0;j=g+8|0;k=g+16|0;l=f+160|0;m=e[l>>1]|0;if((m&56|0)!=8){n=c[f+88+((m>>>9&7)<<2)>>2]|0;o=m&63;if((b5[c[20600+(o<<2)>>2]&127](f,o,509,8)|0)!=0){i=g;return}if((mI(f,k)|0)!=0){i=g;return}o=(d[k]^n)&255;n=f+372|0;c[n>>2]=(c[n>>2]|0)+8;l7(f,15,o);n=f+156|0;k=c[n>>2]|0;if((k&1|0)!=0){iA(f,k,0,0);i=g;return}p=f+164|0;b[f+162>>1]=b[p>>1]|0;q=k&16777215;k=q+1|0;if(k>>>0<(c[f+36>>2]|0)>>>0){r=c[f+32>>2]|0;s=d[r+q|0]<<8|d[r+k|0]}else{s=b6[c[f+12>>2]&63](c[f+4>>2]|0,q)|0}b[p>>1]=s;if((a[f+336|0]|0)==0){c[n>>2]=(c[n>>2]|0)+2;n=f+152|0;c[n>>2]=(c[n>>2]|0)+2;mQ(f,o)|0;i=g;return}else{iy(f);i=g;return}}o=m&7|24;if((b5[c[20600+(o<<2)>>2]&127](f,o,8,8)|0)!=0){i=g;return}if((mI(f,h)|0)!=0){i=g;return}o=(e[l>>1]|0)>>>9&7|24;if((b5[c[20600+(o<<2)>>2]&127](f,o,8,8)|0)!=0){i=g;return}if((mI(f,j)|0)!=0){i=g;return}o=f+372|0;c[o>>2]=(c[o>>2]|0)+16;o=a[j]|0;j=a[h]|0;mk(f,o-j&255,j,o);o=f+156|0;j=c[o>>2]|0;if((j&1|0)!=0){iA(f,j,0,0);i=g;return}h=f+164|0;b[f+162>>1]=b[h>>1]|0;l=j&16777215;j=l+1|0;if(j>>>0<(c[f+36>>2]|0)>>>0){m=c[f+32>>2]|0;t=d[m+l|0]<<8|d[m+j|0]}else{t=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[h>>1]=t;if((a[f+336|0]|0)==0){c[o>>2]=(c[o>>2]|0)+2;o=f+152|0;c[o>>2]=(c[o>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}function kQ(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;g=i;i=i+24|0;h=g|0;j=g+8|0;k=g+16|0;l=f+160|0;m=e[l>>1]|0;if((m&56|0)!=8){n=c[f+88+((m>>>9&7)<<2)>>2]|0;o=m&63;if((b5[c[20600+(o<<2)>>2]&127](f,o,509,16)|0)!=0){i=g;return}if((mJ(f,k)|0)!=0){i=g;return}o=(e[k>>1]^n)&65535;n=f+372|0;c[n>>2]=(c[n>>2]|0)+8;l8(f,15,o);n=f+156|0;k=c[n>>2]|0;if((k&1|0)!=0){iA(f,k,0,0);i=g;return}p=f+164|0;b[f+162>>1]=b[p>>1]|0;q=k&16777215;k=q+1|0;if(k>>>0<(c[f+36>>2]|0)>>>0){r=c[f+32>>2]|0;s=d[r+q|0]<<8|d[r+k|0]}else{s=b6[c[f+12>>2]&63](c[f+4>>2]|0,q)|0}b[p>>1]=s;if((a[f+336|0]|0)==0){c[n>>2]=(c[n>>2]|0)+2;n=f+152|0;c[n>>2]=(c[n>>2]|0)+2;mR(f,o)|0;i=g;return}else{iy(f);i=g;return}}o=m&7|24;if((b5[c[20600+(o<<2)>>2]&127](f,o,8,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}o=(e[l>>1]|0)>>>9&7|24;if((b5[c[20600+(o<<2)>>2]&127](f,o,8,16)|0)!=0){i=g;return}if((mJ(f,j)|0)!=0){i=g;return}o=f+372|0;c[o>>2]=(c[o>>2]|0)+12;o=b[j>>1]|0;j=b[h>>1]|0;ml(f,o-j&65535,j,o);o=f+156|0;j=c[o>>2]|0;if((j&1|0)!=0){iA(f,j,0,0);i=g;return}h=f+164|0;b[f+162>>1]=b[h>>1]|0;l=j&16777215;j=l+1|0;if(j>>>0<(c[f+36>>2]|0)>>>0){m=c[f+32>>2]|0;t=d[m+l|0]<<8|d[m+j|0]}else{t=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[h>>1]=t;if((a[f+336|0]|0)==0){c[o>>2]=(c[o>>2]|0)+2;o=f+152|0;c[o>>2]=(c[o>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}function kR(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;g=i;i=i+24|0;h=g|0;j=g+8|0;k=g+16|0;l=f+160|0;m=e[l>>1]|0;if((m&56|0)!=8){n=c[f+88+((m>>>9&7)<<2)>>2]|0;o=m&63;if((b5[c[20600+(o<<2)>>2]&127](f,o,509,32)|0)!=0){i=g;return}if((mK(f,k)|0)!=0){i=g;return}o=c[k>>2]^n;n=f+372|0;c[n>>2]=(c[n>>2]|0)+12;l9(f,15,o);n=f+156|0;k=c[n>>2]|0;if((k&1|0)!=0){iA(f,k,0,0);i=g;return}p=f+164|0;b[f+162>>1]=b[p>>1]|0;q=k&16777215;k=q+1|0;if(k>>>0<(c[f+36>>2]|0)>>>0){r=c[f+32>>2]|0;s=d[r+q|0]<<8|d[r+k|0]}else{s=b6[c[f+12>>2]&63](c[f+4>>2]|0,q)|0}b[p>>1]=s;if((a[f+336|0]|0)==0){c[n>>2]=(c[n>>2]|0)+2;n=f+152|0;c[n>>2]=(c[n>>2]|0)+2;mS(f,o)|0;i=g;return}else{iy(f);i=g;return}}o=m&7|24;if((b5[c[20600+(o<<2)>>2]&127](f,o,8,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}o=(e[l>>1]|0)>>>9&7|24;if((b5[c[20600+(o<<2)>>2]&127](f,o,8,32)|0)!=0){i=g;return}if((mK(f,j)|0)!=0){i=g;return}o=f+372|0;c[o>>2]=(c[o>>2]|0)+20;o=c[j>>2]|0;j=c[h>>2]|0;mm(f,o-j|0,j,o);o=f+156|0;j=c[o>>2]|0;if((j&1|0)!=0){iA(f,j,0,0);i=g;return}h=f+164|0;b[f+162>>1]=b[h>>1]|0;l=j&16777215;j=l+1|0;if(j>>>0<(c[f+36>>2]|0)>>>0){m=c[f+32>>2]|0;t=d[m+l|0]<<8|d[m+j|0]}else{t=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[h>>1]=t;if((a[f+336|0]|0)==0){c[o>>2]=(c[o>>2]|0)+2;o=f+152|0;c[o>>2]=(c[o>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}function kS(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g|0;j=f+160|0;k=b[j>>1]&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4095,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}k=c[f+120+(((e[j>>1]|0)>>>9&7)<<2)>>2]|0;j=f+372|0;c[j>>2]=(c[j>>2]|0)+8;j=c[h>>2]|0;mm(f,k-j|0,j,k);k=f+156|0;j=c[k>>2]|0;if((j&1|0)!=0){iA(f,j,0,0);i=g;return}h=f+164|0;b[f+162>>1]=b[h>>1]|0;l=j&16777215;j=l+1|0;if(j>>>0<(c[f+36>>2]|0)>>>0){m=c[f+32>>2]|0;n=d[m+l|0]<<8|d[m+j|0]}else{n=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[h>>1]=n;if((a[f+336|0]|0)==0){c[k>>2]=(c[k>>2]|0)+2;k=f+152|0;c[k>>2]=(c[k>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}function kT(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;k=j&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4093,8)|0)!=0){i=g;return}if((mI(f,h)|0)!=0){i=g;return}k=f+88+((j>>>9&7)<<2)|0;j=d[h]&c[k>>2];h=f+372|0;c[h>>2]=(c[h>>2]|0)+4;l7(f,15,j&255);h=f+156|0;l=c[h>>2]|0;if((l&1|0)!=0){iA(f,l,0,0);i=g;return}m=f+164|0;b[f+162>>1]=b[m>>1]|0;n=l&16777215;l=n+1|0;if(l>>>0<(c[f+36>>2]|0)>>>0){o=c[f+32>>2]|0;p=d[o+n|0]<<8|d[o+l|0]}else{p=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[m>>1]=p;if((a[f+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=f+152|0;c[h>>2]=(c[h>>2]|0)+2;c[k>>2]=c[k>>2]&-256|j;i=g;return}else{iy(f);i=g;return}}function kU(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;k=j&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4093,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}k=f+88+((j>>>9&7)<<2)|0;j=e[h>>1]&c[k>>2];h=f+372|0;c[h>>2]=(c[h>>2]|0)+4;l8(f,15,j&65535);h=f+156|0;l=c[h>>2]|0;if((l&1|0)!=0){iA(f,l,0,0);i=g;return}m=f+164|0;b[f+162>>1]=b[m>>1]|0;n=l&16777215;l=n+1|0;if(l>>>0<(c[f+36>>2]|0)>>>0){o=c[f+32>>2]|0;p=d[o+n|0]<<8|d[o+l|0]}else{p=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[m>>1]=p;if((a[f+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=f+152|0;c[h>>2]=(c[h>>2]|0)+2;c[k>>2]=c[k>>2]&-65536|j;i=g;return}else{iy(f);i=g;return}}function kV(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;k=j&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4093,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}k=f+88+((j>>>9&7)<<2)|0;j=c[h>>2]&c[k>>2];h=f+372|0;c[h>>2]=(c[h>>2]|0)+6;l9(f,15,j);h=f+156|0;l=c[h>>2]|0;if((l&1|0)!=0){iA(f,l,0,0);i=g;return}m=f+164|0;b[f+162>>1]=b[m>>1]|0;n=l&16777215;l=n+1|0;if(l>>>0<(c[f+36>>2]|0)>>>0){o=c[f+32>>2]|0;p=d[o+n|0]<<8|d[o+l|0]}else{p=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[m>>1]=p;if((a[f+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=f+152|0;c[h>>2]=(c[h>>2]|0)+2;c[k>>2]=j;i=g;return}else{iy(f);i=g;return}}function kW(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;k=j&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4093,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}k=f+88+((j>>>9&7)<<2)|0;j=ac(e[h>>1]|0,c[k>>2]&65535)|0;h=f+372|0;c[h>>2]=(c[h>>2]|0)+74;l9(f,15,j);h=f+156|0;l=c[h>>2]|0;if((l&1|0)!=0){iA(f,l,0,0);i=g;return}m=f+164|0;b[f+162>>1]=b[m>>1]|0;n=l&16777215;l=n+1|0;if(l>>>0<(c[f+36>>2]|0)>>>0){o=c[f+32>>2]|0;p=d[o+n|0]<<8|d[o+l|0]}else{p=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[m>>1]=p;if((a[f+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=f+152|0;c[h>>2]=(c[h>>2]|0)+2;c[k>>2]=j;i=g;return}else{iy(f);i=g;return}}function kX(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;g=i;i=i+24|0;h=g|0;j=g+8|0;k=g+16|0;l=e[f+160>>1]|0;if((l&48|0)!=0){m=c[f+88+((l>>>9&7)<<2)>>2]|0;n=l&63;if((b5[c[20600+(n<<2)>>2]&127](f,n,508,8)|0)!=0){i=g;return}if((mI(f,k)|0)!=0){i=g;return}n=d[k]&m&255;m=f+372|0;c[m>>2]=(c[m>>2]|0)+4;l7(f,15,n);m=f+156|0;k=c[m>>2]|0;if((k&1|0)!=0){iA(f,k,0,0);i=g;return}o=f+164|0;b[f+162>>1]=b[o>>1]|0;p=k&16777215;k=p+1|0;if(k>>>0<(c[f+36>>2]|0)>>>0){q=c[f+32>>2]|0;r=d[q+p|0]<<8|d[q+k|0]}else{r=b6[c[f+12>>2]&63](c[f+4>>2]|0,p)|0}b[o>>1]=r;if((a[f+336|0]|0)==0){c[m>>2]=(c[m>>2]|0)+2;m=f+152|0;c[m>>2]=(c[m>>2]|0)+2;mQ(f,n)|0;i=g;return}else{iy(f);i=g;return}}n=l&7;m=l>>>9&7;if((l&8|0)==0){s=m;t=n}else{s=m|32;t=n|32}if((b5[c[20600+(t<<2)>>2]&127](f,t,17,8)|0)!=0){i=g;return}if((mI(f,h)|0)!=0){i=g;return}if((b5[c[20600+(s<<2)>>2]&127](f,s,17,8)|0)!=0){i=g;return}if((mI(f,j)|0)!=0){i=g;return}s=a[h]|0;h=a[j]|0;j=f+166|0;t=b[j>>1]|0;n=((h&255)+(s&255)&65535)+((t&65535)>>>4&1)&65535;m=((h&15)+(s&15)|0)>9?n+6&65535:n;if((m&65535)>159){u=m+96&65535;v=t|17}else{u=m;v=t&-18}b[j>>1]=(u&255)==0?v:v&-5;v=f+372|0;c[v>>2]=(c[v>>2]|0)+6;v=f+156|0;j=c[v>>2]|0;if((j&1|0)!=0){iA(f,j,0,0);i=g;return}t=f+164|0;b[f+162>>1]=b[t>>1]|0;m=j&16777215;j=m+1|0;if(j>>>0<(c[f+36>>2]|0)>>>0){n=c[f+32>>2]|0;w=d[n+m|0]<<8|d[n+j|0]}else{w=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[t>>1]=w;if((a[f+336|0]|0)==0){c[v>>2]=(c[v>>2]|0)+2;v=f+152|0;c[v>>2]=(c[v>>2]|0)+2;v=u&255;mQ(f,v)|0;i=g;return}else{iy(f);i=g;return}}function kY(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;k=j>>>3&7;if((k|0)==1){l=f+120+((j>>>9&7)<<2)|0;m=c[l>>2]|0;n=f+120+((j&7)<<2)|0;c[l>>2]=c[n>>2];c[n>>2]=m;m=f+372|0;c[m>>2]=(c[m>>2]|0)+10;m=f+156|0;n=c[m>>2]|0;if((n&1|0)!=0){iA(f,n,0,0);i=g;return}l=f+164|0;b[f+162>>1]=b[l>>1]|0;o=n&16777215;n=o+1|0;if(n>>>0<(c[f+36>>2]|0)>>>0){p=c[f+32>>2]|0;q=d[p+o|0]<<8|d[p+n|0]}else{q=b6[c[f+12>>2]&63](c[f+4>>2]|0,o)|0}b[l>>1]=q;if((a[f+336|0]|0)==0){c[m>>2]=(c[m>>2]|0)+2;m=f+152|0;c[m>>2]=(c[m>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}else if((k|0)==0){k=f+88+((j>>>9&7)<<2)|0;m=c[k>>2]|0;q=f+88+((j&7)<<2)|0;c[k>>2]=c[q>>2];c[q>>2]=m;m=f+372|0;c[m>>2]=(c[m>>2]|0)+10;m=f+156|0;q=c[m>>2]|0;if((q&1|0)!=0){iA(f,q,0,0);i=g;return}k=f+164|0;b[f+162>>1]=b[k>>1]|0;l=q&16777215;q=l+1|0;if(q>>>0<(c[f+36>>2]|0)>>>0){o=c[f+32>>2]|0;r=d[o+l|0]<<8|d[o+q|0]}else{r=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[k>>1]=r;if((a[f+336|0]|0)==0){c[m>>2]=(c[m>>2]|0)+2;m=f+152|0;c[m>>2]=(c[m>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}else{m=c[f+88+((j>>>9&7)<<2)>>2]|0;r=j&63;if((b5[c[20600+(r<<2)>>2]&127](f,r,508,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}r=e[h>>1]&m&65535;m=f+372|0;c[m>>2]=(c[m>>2]|0)+4;l8(f,15,r);m=f+156|0;h=c[m>>2]|0;if((h&1|0)!=0){iA(f,h,0,0);i=g;return}j=f+164|0;b[f+162>>1]=b[j>>1]|0;k=h&16777215;h=k+1|0;if(h>>>0<(c[f+36>>2]|0)>>>0){l=c[f+32>>2]|0;s=d[l+k|0]<<8|d[l+h|0]}else{s=b6[c[f+12>>2]&63](c[f+4>>2]|0,k)|0}b[j>>1]=s;if((a[f+336|0]|0)==0){c[m>>2]=(c[m>>2]|0)+2;m=f+152|0;c[m>>2]=(c[m>>2]|0)+2;mR(f,r)|0;i=g;return}else{iy(f);i=g;return}}}function kZ(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;k=j>>>9&7;if((j&56|0)==8){l=f+88+(k<<2)|0;m=c[l>>2]|0;n=f+120+((j&7)<<2)|0;c[l>>2]=c[n>>2];c[n>>2]=m;m=f+372|0;c[m>>2]=(c[m>>2]|0)+10;m=f+156|0;n=c[m>>2]|0;if((n&1|0)!=0){iA(f,n,0,0);i=g;return}l=f+164|0;b[f+162>>1]=b[l>>1]|0;o=n&16777215;n=o+1|0;if(n>>>0<(c[f+36>>2]|0)>>>0){p=c[f+32>>2]|0;q=d[p+o|0]<<8|d[p+n|0]}else{q=b6[c[f+12>>2]&63](c[f+4>>2]|0,o)|0}b[l>>1]=q;if((a[f+336|0]|0)==0){c[m>>2]=(c[m>>2]|0)+2;m=f+152|0;c[m>>2]=(c[m>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}m=c[f+88+(k<<2)>>2]|0;k=j&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,508,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}k=c[h>>2]&m;m=f+372|0;c[m>>2]=(c[m>>2]|0)+6;l9(f,15,k);m=f+156|0;h=c[m>>2]|0;if((h&1|0)!=0){iA(f,h,0,0);i=g;return}j=f+164|0;b[f+162>>1]=b[j>>1]|0;q=h&16777215;h=q+1|0;if(h>>>0<(c[f+36>>2]|0)>>>0){l=c[f+32>>2]|0;r=d[l+q|0]<<8|d[l+h|0]}else{r=b6[c[f+12>>2]&63](c[f+4>>2]|0,q)|0}b[j>>1]=r;if((a[f+336|0]|0)==0){c[m>>2]=(c[m>>2]|0)+2;m=f+152|0;c[m>>2]=(c[m>>2]|0)+2;mS(f,k)|0;i=g;return}else{iy(f);i=g;return}}function k_(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;k=j&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4093,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}k=f+88+((j>>>9&7)<<2)|0;j=c[k>>2]|0;l=b[h>>1]|0;if(l<<16>>16>-1){m=0;n=l}else{o=-l&65535;b[h>>1]=o;m=1;n=o}if((j&32768|0)==0){p=j&65535;q=0}else{p=(j^65535)+1&65535;q=1}j=ac(n&65535,p&65535)|0;p=(m|0)==(q|0)?j:-j|0;j=f+372|0;c[j>>2]=(c[j>>2]|0)+74;l9(f,15,p);j=f+156|0;q=c[j>>2]|0;if((q&1|0)!=0){iA(f,q,0,0);i=g;return}m=f+164|0;b[f+162>>1]=b[m>>1]|0;n=q&16777215;q=n+1|0;if(q>>>0<(c[f+36>>2]|0)>>>0){o=c[f+32>>2]|0;r=d[o+n|0]<<8|d[o+q|0]}else{r=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[m>>1]=r;if((a[f+336|0]|0)==0){c[j>>2]=(c[j>>2]|0)+2;j=f+152|0;c[j>>2]=(c[j>>2]|0)+2;c[k>>2]=p;i=g;return}else{iy(f);i=g;return}}function k$(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;k=j&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4093,8)|0)!=0){i=g;return}if((mI(f,h)|0)!=0){i=g;return}k=f+88+((j>>>9&7)<<2)|0;j=c[k>>2]|0;l=a[h]|0;h=(l&255)+j|0;m=f+372|0;c[m>>2]=(c[m>>2]|0)+4;ma(f,h&255,l,j&255);j=f+156|0;l=c[j>>2]|0;if((l&1|0)!=0){iA(f,l,0,0);i=g;return}m=f+164|0;b[f+162>>1]=b[m>>1]|0;n=l&16777215;l=n+1|0;if(l>>>0<(c[f+36>>2]|0)>>>0){o=c[f+32>>2]|0;p=d[o+n|0]<<8|d[o+l|0]}else{p=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[m>>1]=p;if((a[f+336|0]|0)==0){c[j>>2]=(c[j>>2]|0)+2;j=f+152|0;c[j>>2]=(c[j>>2]|0)+2;c[k>>2]=c[k>>2]&-256|h&255;i=g;return}else{iy(f);i=g;return}}function k0(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;k=j&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4095,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}k=f+88+((j>>>9&7)<<2)|0;j=c[k>>2]|0;l=b[h>>1]|0;h=(l&65535)+j|0;m=f+372|0;c[m>>2]=(c[m>>2]|0)+4;mb(f,h&65535,l,j&65535);j=f+156|0;l=c[j>>2]|0;if((l&1|0)!=0){iA(f,l,0,0);i=g;return}m=f+164|0;b[f+162>>1]=b[m>>1]|0;n=l&16777215;l=n+1|0;if(l>>>0<(c[f+36>>2]|0)>>>0){o=c[f+32>>2]|0;p=d[o+n|0]<<8|d[o+l|0]}else{p=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[m>>1]=p;if((a[f+336|0]|0)==0){c[j>>2]=(c[j>>2]|0)+2;j=f+152|0;c[j>>2]=(c[j>>2]|0)+2;c[k>>2]=c[k>>2]&-65536|h&65535;i=g;return}else{iy(f);i=g;return}}function k1(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;k=j&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4095,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}k=f+88+((j>>>9&7)<<2)|0;j=c[k>>2]|0;l=c[h>>2]|0;h=l+j|0;m=f+372|0;c[m>>2]=(c[m>>2]|0)+6;mg(f,h,l,j);j=f+156|0;l=c[j>>2]|0;if((l&1|0)!=0){iA(f,l,0,0);i=g;return}m=f+164|0;b[f+162>>1]=b[m>>1]|0;n=l&16777215;l=n+1|0;if(l>>>0<(c[f+36>>2]|0)>>>0){o=c[f+32>>2]|0;p=d[o+n|0]<<8|d[o+l|0]}else{p=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[m>>1]=p;if((a[f+336|0]|0)==0){c[j>>2]=(c[j>>2]|0)+2;j=f+152|0;c[j>>2]=(c[j>>2]|0)+2;c[k>>2]=h;i=g;return}else{iy(f);i=g;return}}function k2(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;k=j&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4095,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}k=e[h>>1]|0;h=f+120+((j>>>9&7)<<2)|0;j=c[h>>2]|0;l=f+372|0;c[l>>2]=(c[l>>2]|0)+8;l=f+156|0;m=c[l>>2]|0;if((m&1|0)!=0){iA(f,m,0,0);i=g;return}n=f+164|0;b[f+162>>1]=b[n>>1]|0;o=m&16777215;m=o+1|0;if(m>>>0<(c[f+36>>2]|0)>>>0){p=c[f+32>>2]|0;q=d[p+o|0]<<8|d[p+m|0]}else{q=b6[c[f+12>>2]&63](c[f+4>>2]|0,o)|0}b[n>>1]=q;if((a[f+336|0]|0)==0){c[l>>2]=(c[l>>2]|0)+2;l=f+152|0;c[l>>2]=(c[l>>2]|0)+2;c[h>>2]=((k&32768|0)!=0?k|-65536:k)+j;i=g;return}else{iy(f);i=g;return}}function k3(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=i;i=i+24|0;h=g|0;j=g+8|0;k=g+16|0;l=e[f+160>>1]|0;if((l&48|0)!=0){m=c[f+88+((l>>>9&7)<<2)>>2]|0;n=l&63;if((b5[c[20600+(n<<2)>>2]&127](f,n,508,8)|0)!=0){i=g;return}if((mI(f,k)|0)!=0){i=g;return}n=a[k]|0;k=(n&255)+m&255;o=f+372|0;c[o>>2]=(c[o>>2]|0)+8;ma(f,k,m&255,n);n=f+156|0;m=c[n>>2]|0;if((m&1|0)!=0){iA(f,m,0,0);i=g;return}o=f+164|0;b[f+162>>1]=b[o>>1]|0;p=m&16777215;m=p+1|0;if(m>>>0<(c[f+36>>2]|0)>>>0){q=c[f+32>>2]|0;r=d[q+p|0]<<8|d[q+m|0]}else{r=b6[c[f+12>>2]&63](c[f+4>>2]|0,p)|0}b[o>>1]=r;if((a[f+336|0]|0)==0){c[n>>2]=(c[n>>2]|0)+2;n=f+152|0;c[n>>2]=(c[n>>2]|0)+2;mQ(f,k)|0;i=g;return}else{iy(f);i=g;return}}k=l&7;n=l>>>9&7;if((l&8|0)==0){s=n;t=k}else{s=n|32;t=k|32}if((b5[c[20600+(t<<2)>>2]&127](f,t,17,8)|0)!=0){i=g;return}if((mI(f,h)|0)!=0){i=g;return}if((b5[c[20600+(s<<2)>>2]&127](f,s,17,8)|0)!=0){i=g;return}if((mI(f,j)|0)!=0){i=g;return}s=a[h]|0;h=a[j]|0;j=(h+s&255)+((e[f+166>>1]|0)>>>4&1)&255;t=f+372|0;c[t>>2]=(c[t>>2]|0)+8;mh(f,j,s,h);h=f+156|0;s=c[h>>2]|0;if((s&1|0)!=0){iA(f,s,0,0);i=g;return}t=f+164|0;b[f+162>>1]=b[t>>1]|0;k=s&16777215;s=k+1|0;if(s>>>0<(c[f+36>>2]|0)>>>0){n=c[f+32>>2]|0;u=d[n+k|0]<<8|d[n+s|0]}else{u=b6[c[f+12>>2]&63](c[f+4>>2]|0,k)|0}b[t>>1]=u;if((a[f+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=f+152|0;c[h>>2]=(c[h>>2]|0)+2;mQ(f,j)|0;i=g;return}else{iy(f);i=g;return}}function k4(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=i;i=i+24|0;h=g|0;j=g+8|0;k=g+16|0;l=e[f+160>>1]|0;if((l&48|0)!=0){m=c[f+88+((l>>>9&7)<<2)>>2]|0;n=l&63;if((b5[c[20600+(n<<2)>>2]&127](f,n,508,16)|0)!=0){i=g;return}if((mJ(f,k)|0)!=0){i=g;return}n=b[k>>1]|0;k=(n&65535)+m&65535;o=f+372|0;c[o>>2]=(c[o>>2]|0)+8;mb(f,k,m&65535,n);n=f+156|0;m=c[n>>2]|0;if((m&1|0)!=0){iA(f,m,0,0);i=g;return}o=f+164|0;b[f+162>>1]=b[o>>1]|0;p=m&16777215;m=p+1|0;if(m>>>0<(c[f+36>>2]|0)>>>0){q=c[f+32>>2]|0;r=d[q+p|0]<<8|d[q+m|0]}else{r=b6[c[f+12>>2]&63](c[f+4>>2]|0,p)|0}b[o>>1]=r;if((a[f+336|0]|0)==0){c[n>>2]=(c[n>>2]|0)+2;n=f+152|0;c[n>>2]=(c[n>>2]|0)+2;mR(f,k)|0;i=g;return}else{iy(f);i=g;return}}k=l&7;n=l>>>9&7;if((l&8|0)==0){s=n;t=k}else{s=n|32;t=k|32}if((b5[c[20600+(t<<2)>>2]&127](f,t,17,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}if((b5[c[20600+(s<<2)>>2]&127](f,s,17,16)|0)!=0){i=g;return}if((mJ(f,j)|0)!=0){i=g;return}s=b[h>>1]|0;h=b[j>>1]|0;j=(h+s&65535)+((e[f+166>>1]|0)>>>4&1)&65535;t=f+372|0;c[t>>2]=(c[t>>2]|0)+8;mi(f,j,s,h);h=f+156|0;s=c[h>>2]|0;if((s&1|0)!=0){iA(f,s,0,0);i=g;return}t=f+164|0;b[f+162>>1]=b[t>>1]|0;k=s&16777215;s=k+1|0;if(s>>>0<(c[f+36>>2]|0)>>>0){n=c[f+32>>2]|0;u=d[n+k|0]<<8|d[n+s|0]}else{u=b6[c[f+12>>2]&63](c[f+4>>2]|0,k)|0}b[t>>1]=u;if((a[f+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=f+152|0;c[h>>2]=(c[h>>2]|0)+2;mR(f,j)|0;i=g;return}else{iy(f);i=g;return}}function k5(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=i;i=i+24|0;h=g|0;j=g+8|0;k=g+16|0;l=e[f+160>>1]|0;if((l&48|0)!=0){m=c[f+88+((l>>>9&7)<<2)>>2]|0;n=l&63;if((b5[c[20600+(n<<2)>>2]&127](f,n,508,32)|0)!=0){i=g;return}if((mK(f,k)|0)!=0){i=g;return}n=c[k>>2]|0;k=n+m|0;o=f+372|0;c[o>>2]=(c[o>>2]|0)+12;mg(f,k,m,n);n=f+156|0;m=c[n>>2]|0;if((m&1|0)!=0){iA(f,m,0,0);i=g;return}o=f+164|0;b[f+162>>1]=b[o>>1]|0;p=m&16777215;m=p+1|0;if(m>>>0<(c[f+36>>2]|0)>>>0){q=c[f+32>>2]|0;r=d[q+p|0]<<8|d[q+m|0]}else{r=b6[c[f+12>>2]&63](c[f+4>>2]|0,p)|0}b[o>>1]=r;if((a[f+336|0]|0)==0){c[n>>2]=(c[n>>2]|0)+2;n=f+152|0;c[n>>2]=(c[n>>2]|0)+2;mS(f,k)|0;i=g;return}else{iy(f);i=g;return}}k=l&7;n=l>>>9&7;if((l&8|0)==0){s=n;t=k}else{s=n|32;t=k|32}if((b5[c[20600+(t<<2)>>2]&127](f,t,17,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}if((b5[c[20600+(s<<2)>>2]&127](f,s,17,32)|0)!=0){i=g;return}if((mK(f,j)|0)!=0){i=g;return}s=c[h>>2]|0;h=c[j>>2]|0;j=h+s+((e[f+166>>1]|0)>>>4&1)|0;t=f+372|0;c[t>>2]=(c[t>>2]|0)+12;mj(f,j,s,h);h=f+156|0;s=c[h>>2]|0;if((s&1|0)!=0){iA(f,s,0,0);i=g;return}t=f+164|0;b[f+162>>1]=b[t>>1]|0;k=s&16777215;s=k+1|0;if(s>>>0<(c[f+36>>2]|0)>>>0){n=c[f+32>>2]|0;u=d[n+k|0]<<8|d[n+s|0]}else{u=b6[c[f+12>>2]&63](c[f+4>>2]|0,k)|0}b[t>>1]=u;if((a[f+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=f+152|0;c[h>>2]=(c[h>>2]|0)+2;mS(f,j)|0;i=g;return}else{iy(f);i=g;return}}function k6(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;g=i;i=i+8|0;h=g|0;j=e[f+160>>1]|0;k=j&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4095,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}k=f+120+((j>>>9&7)<<2)|0;j=c[k>>2]|0;l=c[h>>2]|0;h=f+372|0;c[h>>2]=(c[h>>2]|0)+6;h=f+156|0;m=c[h>>2]|0;if((m&1|0)!=0){iA(f,m,0,0);i=g;return}n=f+164|0;b[f+162>>1]=b[n>>1]|0;o=m&16777215;m=o+1|0;if(m>>>0<(c[f+36>>2]|0)>>>0){p=c[f+32>>2]|0;q=d[p+o|0]<<8|d[p+m|0]}else{q=b6[c[f+12>>2]&63](c[f+4>>2]|0,o)|0}b[n>>1]=q;if((a[f+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=f+152|0;c[h>>2]=(c[h>>2]|0)+2;c[k>>2]=l+j;i=g;return}else{iy(f);i=g;return}}function k7(f){f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;g=e[f+160>>1]|0;h=g>>>3&3;if((h|0)==1){i=f+88+((g&7)<<2)|0;j=c[i>>2]|0;k=g>>>9&7;do{if((g&32|0)==0){l=(k|0)==0?8:k;m=2872}else{n=c[f+88+(k<<2)>>2]&63;if((n|0)!=0){l=n;m=2872;break}n=f+166|0;b[n>>1]=b[n>>1]&-2;o=j&255;p=0}}while(0);L3640:do{if((m|0)==2872){if(l>>>0<8){k=j&255;n=k>>>(l>>>0)&255;q=f+166|0;r=b[q>>1]|0;if((1<<l-1&k|0)==0){b[q>>1]=r&-18;o=n;p=l;break}else{b[q>>1]=r|17;o=n;p=l;break}}do{if((l|0)==8){if((j&128|0)==0){break}n=f+166|0;b[n>>1]=b[n>>1]|17;o=0;p=8;break L3640}}while(0);n=f+166|0;b[n>>1]=b[n>>1]&-18;o=0;p=l}}while(0);l=f+372|0;c[l>>2]=(p<<1)+6+(c[l>>2]|0);l7(f,14,o);l=f+156|0;p=c[l>>2]|0;if((p&1|0)!=0){iA(f,p,0,0);return}j=f+164|0;b[f+162>>1]=b[j>>1]|0;n=p&16777215;p=n+1|0;if(p>>>0<(c[f+36>>2]|0)>>>0){r=c[f+32>>2]|0;s=d[r+n|0]<<8|d[r+p|0]}else{s=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[j>>1]=s;if((a[f+336|0]|0)==0){c[l>>2]=(c[l>>2]|0)+2;l=f+152|0;c[l>>2]=(c[l>>2]|0)+2;c[i>>2]=c[i>>2]&-256|o&255;return}else{iy(f);return}}else if((h|0)==3){o=f+88+((g&7)<<2)|0;i=c[o>>2]|0;l=i&255;s=g>>>9&7;if((g&32|0)==0){t=(s|0)==0?8:s}else{t=c[f+88+(s<<2)>>2]&63}s=t&7;L3671:do{if((s|0)==0){do{if((t|0)!=0){if((i&128|0)==0){break}j=f+166|0;b[j>>1]=b[j>>1]|1;u=l;break L3671}}while(0);j=f+166|0;b[j>>1]=b[j>>1]&-2;u=l}else{j=i&255;n=j<<8-s|j>>>(s>>>0);j=n&255;p=f+166|0;r=b[p>>1]|0;if((n&128|0)==0){b[p>>1]=r&-2;u=j;break}else{b[p>>1]=r|1;u=j;break}}}while(0);s=f+372|0;c[s>>2]=(t<<1)+6+(c[s>>2]|0);l7(f,14,u);s=f+156|0;t=c[s>>2]|0;if((t&1|0)!=0){iA(f,t,0,0);return}i=f+164|0;b[f+162>>1]=b[i>>1]|0;l=t&16777215;t=l+1|0;if(t>>>0<(c[f+36>>2]|0)>>>0){j=c[f+32>>2]|0;v=d[j+l|0]<<8|d[j+t|0]}else{v=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[i>>1]=v;if((a[f+336|0]|0)==0){c[s>>2]=(c[s>>2]|0)+2;s=f+152|0;c[s>>2]=(c[s>>2]|0)+2;c[o>>2]=c[o>>2]&-256|u&255;return}else{iy(f);return}}else if((h|0)==2){u=f+88+((g&7)<<2)|0;o=c[u>>2]&255;s=f+166|0;v=(e[s>>1]|0)>>>4;i=g>>>9&7;if((g&32|0)==0){w=(i|0)==0?8:i;x=v&1;m=2891}else{l=c[f+88+(i<<2)>>2]&63;i=v&1;if((l|0)==0){y=o;z=i;A=0}else{w=l;x=i;m=2891}}if((m|0)==2891){i=0;l=o;o=x;while(1){x=(l&65535)>>>1|o<<7;v=i+1|0;t=l&1;if(v>>>0<w>>>0){i=v;l=x;o=t}else{y=x;z=t;A=w;break}}}w=f+372|0;c[w>>2]=(A<<1)+6+(c[w>>2]|0);l7(f,14,y&255);w=b[s>>1]|0;b[s>>1]=z<<16>>16==0?w&-18:w|17;w=f+156|0;z=c[w>>2]|0;if((z&1|0)!=0){iA(f,z,0,0);return}s=f+164|0;b[f+162>>1]=b[s>>1]|0;A=z&16777215;z=A+1|0;if(z>>>0<(c[f+36>>2]|0)>>>0){o=c[f+32>>2]|0;B=d[o+A|0]<<8|d[o+z|0]}else{B=b6[c[f+12>>2]&63](c[f+4>>2]|0,A)|0}b[s>>1]=B;if((a[f+336|0]|0)==0){c[w>>2]=(c[w>>2]|0)+2;w=f+152|0;c[w>>2]=(c[w>>2]|0)+2;c[u>>2]=c[u>>2]&-256|y&255;return}else{iy(f);return}}else if((h|0)==0){h=g&7;y=g>>>9&7;do{if((g&32|0)==0){u=f+88+(h<<2)|0;C=(y|0)==0?8:y;D=u;E=c[u>>2]|0;m=2853}else{u=c[f+88+(y<<2)>>2]&63;w=f+88+(h<<2)|0;B=c[w>>2]|0;if((u|0)!=0){C=u;D=w;E=B;m=2853;break}u=f+166|0;b[u>>1]=b[u>>1]&-2;F=B&255;G=0;H=w}}while(0);do{if((m|0)==2853){h=E&255;y=(E&128|0)!=0;if(C>>>0<8){g=(y?h|65280:h)>>>(C>>>0)&255;w=f+166|0;B=b[w>>1]|0;if((1<<C-1&h|0)==0){b[w>>1]=B&-18;F=g;G=C;H=D;break}else{b[w>>1]=B|17;F=g;G=C;H=D;break}}else{g=f+166|0;B=b[g>>1]|0;if(y){b[g>>1]=B|17;F=-1;G=C;H=D;break}else{b[g>>1]=B&-18;F=0;G=C;H=D;break}}}}while(0);D=f+372|0;c[D>>2]=(G<<1)+6+(c[D>>2]|0);l7(f,14,F);D=f+156|0;G=c[D>>2]|0;if((G&1|0)!=0){iA(f,G,0,0);return}C=f+164|0;b[f+162>>1]=b[C>>1]|0;E=G&16777215;G=E+1|0;if(G>>>0<(c[f+36>>2]|0)>>>0){m=c[f+32>>2]|0;I=d[m+E|0]<<8|d[m+G|0]}else{I=b6[c[f+12>>2]&63](c[f+4>>2]|0,E)|0}b[C>>1]=I;if((a[f+336|0]|0)==0){c[D>>2]=(c[D>>2]|0)+2;D=f+152|0;c[D>>2]=(c[D>>2]|0)+2;c[H>>2]=c[H>>2]&-256|F&255;return}else{iy(f);return}}else{iB(f);F=f+372|0;c[F>>2]=(c[F>>2]|0)+2;return}}function k8(f){f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;g=e[f+160>>1]|0;h=g>>>3&3;if((h|0)==0){i=f+88+((g&7)<<2)|0;j=c[i>>2]|0;k=g>>>9&7;do{if((g&32|0)==0){l=(k|0)==0?8:k;m=(j&32768|0)!=0;n=2941}else{o=c[f+88+(k<<2)>>2]&63;if((o|0)==0){p=f+166|0;b[p>>1]=b[p>>1]&-2;q=j&65535;r=0;break}p=(j&32768|0)!=0;if(o>>>0<16){l=o;m=p;n=2941;break}s=f+166|0;t=b[s>>1]|0;if(p){b[s>>1]=t|17;q=-1;r=o;break}else{b[s>>1]=t&-18;q=0;r=o;break}}}while(0);do{if((n|0)==2941){k=j&65535;o=(m?j|-65536:k)>>>(l>>>0)&65535;t=f+166|0;s=b[t>>1]|0;if((1<<l-1&k|0)==0){b[t>>1]=s&-18;q=o;r=l;break}else{b[t>>1]=s|17;q=o;r=l;break}}}while(0);l=f+372|0;c[l>>2]=(r<<1)+6+(c[l>>2]|0);l8(f,14,q);l=f+156|0;r=c[l>>2]|0;if((r&1|0)!=0){iA(f,r,0,0);return}j=f+164|0;b[f+162>>1]=b[j>>1]|0;m=r&16777215;r=m+1|0;if(r>>>0<(c[f+36>>2]|0)>>>0){o=c[f+32>>2]|0;u=d[o+m|0]<<8|d[o+r|0]}else{u=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[j>>1]=u;if((a[f+336|0]|0)==0){c[l>>2]=(c[l>>2]|0)+2;l=f+152|0;c[l>>2]=(c[l>>2]|0)+2;c[i>>2]=c[i>>2]&-65536|q&65535;return}else{iy(f);return}}else if((h|0)==1){q=f+88+((g&7)<<2)|0;i=c[q>>2]|0;l=g>>>9&7;L3782:do{if((g&32|0)==0){v=(l|0)==0?8:l;n=2960}else{u=c[f+88+(l<<2)>>2]&63;if((u|0)==0){j=f+166|0;b[j>>1]=b[j>>1]&-2;w=i&65535;x=0;break}if(u>>>0<16){v=u;n=2960;break}do{if((u|0)==16){if((i&32768|0)==0){break}j=f+166|0;b[j>>1]=b[j>>1]|17;w=0;x=16;break L3782}}while(0);j=f+166|0;b[j>>1]=b[j>>1]&-18;w=0;x=u}}while(0);do{if((n|0)==2960){l=i&65535;j=l>>>(v>>>0)&65535;m=f+166|0;r=b[m>>1]|0;if((1<<v-1&l|0)==0){b[m>>1]=r&-18;w=j;x=v;break}else{b[m>>1]=r|17;w=j;x=v;break}}}while(0);v=f+372|0;c[v>>2]=(x<<1)+6+(c[v>>2]|0);l8(f,14,w);v=f+156|0;x=c[v>>2]|0;if((x&1|0)!=0){iA(f,x,0,0);return}i=f+164|0;b[f+162>>1]=b[i>>1]|0;j=x&16777215;x=j+1|0;if(x>>>0<(c[f+36>>2]|0)>>>0){r=c[f+32>>2]|0;y=d[r+j|0]<<8|d[r+x|0]}else{y=b6[c[f+12>>2]&63](c[f+4>>2]|0,j)|0}b[i>>1]=y;if((a[f+336|0]|0)==0){c[v>>2]=(c[v>>2]|0)+2;v=f+152|0;c[v>>2]=(c[v>>2]|0)+2;c[q>>2]=c[q>>2]&-65536|w&65535;return}else{iy(f);return}}else if((h|0)==2){w=f+88+((g&7)<<2)|0;q=c[w>>2]&65535;v=g>>>9&7;if((g&32|0)==0){y=f+166|0;z=(v|0)==0?8:v;A=y;B=(e[y>>1]|0)>>>4;n=2978}else{y=c[f+88+(v<<2)>>2]&63;v=f+166|0;i=(e[v>>1]|0)>>>4;if((y|0)==0){C=i;D=q;E=0;F=v}else{z=y;A=v;B=i;n=2978}}if((n|0)==2978){n=B;B=0;i=q;while(1){q=n<<15|(i&65535)>>>1;v=B+1|0;if(v>>>0<z>>>0){n=i;B=v;i=q}else{C=i;D=q;E=z;F=A;break}}}A=f+372|0;c[A>>2]=(E<<1)+6+(c[A>>2]|0);l8(f,14,D);A=b[F>>1]|0;b[F>>1]=(C&1)==0?A&-18:A|17;A=f+156|0;C=c[A>>2]|0;if((C&1|0)!=0){iA(f,C,0,0);return}F=f+164|0;b[f+162>>1]=b[F>>1]|0;E=C&16777215;C=E+1|0;if(C>>>0<(c[f+36>>2]|0)>>>0){z=c[f+32>>2]|0;G=d[z+E|0]<<8|d[z+C|0]}else{G=b6[c[f+12>>2]&63](c[f+4>>2]|0,E)|0}b[F>>1]=G;if((a[f+336|0]|0)==0){c[A>>2]=(c[A>>2]|0)+2;A=f+152|0;c[A>>2]=(c[A>>2]|0)+2;c[w>>2]=c[w>>2]&-65536|D&65535;return}else{iy(f);return}}else if((h|0)==3){h=f+88+((g&7)<<2)|0;D=c[h>>2]|0;w=D&65535;A=g>>>9&7;if((g&32|0)==0){H=(A|0)==0?8:A}else{H=c[f+88+(A<<2)>>2]&63}L3839:do{if((H&15|0)==0){do{if((H|0)!=0){if((D&32768|0)==0){break}A=f+166|0;b[A>>1]=b[A>>1]|1;I=w;break L3839}}while(0);u=f+166|0;b[u>>1]=b[u>>1]&-2;I=w}else{u=D&65535;A=u<<16-H|u>>>(H>>>0);u=A&65535;g=f+166|0;G=b[g>>1]|0;if((A&32768|0)==0){b[g>>1]=G&-2;I=u;break}else{b[g>>1]=G|1;I=u;break}}}while(0);D=f+372|0;c[D>>2]=(H<<1)+6+(c[D>>2]|0);l8(f,14,I);D=f+156|0;H=c[D>>2]|0;if((H&1|0)!=0){iA(f,H,0,0);return}w=f+164|0;b[f+162>>1]=b[w>>1]|0;u=H&16777215;H=u+1|0;if(H>>>0<(c[f+36>>2]|0)>>>0){G=c[f+32>>2]|0;J=d[G+u|0]<<8|d[G+H|0]}else{J=b6[c[f+12>>2]&63](c[f+4>>2]|0,u)|0}b[w>>1]=J;if((a[f+336|0]|0)==0){c[D>>2]=(c[D>>2]|0)+2;D=f+152|0;c[D>>2]=(c[D>>2]|0)+2;c[h>>2]=c[h>>2]&-65536|I&65535;return}else{iy(f);return}}else{iB(f);I=f+372|0;c[I>>2]=(c[I>>2]|0)+2;return}}function k9(f){f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;g=e[f+160>>1]|0;h=g>>>3&3;if((h|0)==1){i=f+88+((g&7)<<2)|0;j=c[i>>2]|0;k=g>>>9&7;do{if((g&32|0)==0){l=(k|0)==0?8:k;m=3049}else{n=c[f+88+(k<<2)>>2]&63;if((n|0)==0){o=f+166|0;b[o>>1]=b[o>>1]&-2;p=j;q=0;break}if(n>>>0<32){l=n;m=3049;break}o=f+166|0;r=b[o>>1]|0;if((n|0)==32&(j|0)<0){b[o>>1]=r|17;p=0;q=32;break}else{b[o>>1]=r&-18;p=0;q=n;break}}}while(0);do{if((m|0)==3049){k=j>>>(l>>>0);n=f+166|0;r=b[n>>1]|0;if((1<<l-1&j|0)==0){b[n>>1]=r&-18;p=k;q=l;break}else{b[n>>1]=r|17;p=k;q=l;break}}}while(0);l=f+372|0;c[l>>2]=(q<<1)+8+(c[l>>2]|0);l9(f,14,p);l=f+156|0;q=c[l>>2]|0;if((q&1|0)!=0){iA(f,q,0,0);return}j=f+164|0;b[f+162>>1]=b[j>>1]|0;k=q&16777215;q=k+1|0;if(q>>>0<(c[f+36>>2]|0)>>>0){r=c[f+32>>2]|0;s=d[r+k|0]<<8|d[r+q|0]}else{s=b6[c[f+12>>2]&63](c[f+4>>2]|0,k)|0}b[j>>1]=s;if((a[f+336|0]|0)==0){c[l>>2]=(c[l>>2]|0)+2;l=f+152|0;c[l>>2]=(c[l>>2]|0)+2;c[i>>2]=p;return}else{iy(f);return}}else if((h|0)==2){p=f+88+((g&7)<<2)|0;i=c[p>>2]|0;l=g>>>9&7;if((g&32|0)==0){s=f+166|0;t=(l|0)==0?8:l;u=s;v=(e[s>>1]|0)>>>4&1;m=3066}else{s=c[f+88+(l<<2)>>2]&63;l=f+166|0;j=(e[l>>1]|0)>>>4&1;if((s|0)==0){w=j;x=i;y=0;z=l}else{t=s;u=l;v=j;m=3066}}if((m|0)==3066){j=v;v=0;l=i;while(1){i=l&1;s=j<<31|l>>>1;k=v+1|0;if(k>>>0<t>>>0){j=i;v=k;l=s}else{w=i;x=s;y=t;z=u;break}}}u=f+372|0;c[u>>2]=(y<<1)+8+(c[u>>2]|0);l9(f,14,x);u=b[z>>1]|0;b[z>>1]=(w|0)==0?u&-18:u|17;u=f+156|0;w=c[u>>2]|0;if((w&1|0)!=0){iA(f,w,0,0);return}z=f+164|0;b[f+162>>1]=b[z>>1]|0;y=w&16777215;w=y+1|0;if(w>>>0<(c[f+36>>2]|0)>>>0){t=c[f+32>>2]|0;A=d[t+y|0]<<8|d[t+w|0]}else{A=b6[c[f+12>>2]&63](c[f+4>>2]|0,y)|0}b[z>>1]=A;if((a[f+336|0]|0)==0){c[u>>2]=(c[u>>2]|0)+2;u=f+152|0;c[u>>2]=(c[u>>2]|0)+2;c[p>>2]=x;return}else{iy(f);return}}else if((h|0)==3){x=f+88+((g&7)<<2)|0;p=c[x>>2]|0;u=g>>>9&7;if((g&32|0)==0){B=(u|0)==0?8:u}else{B=c[f+88+(u<<2)>>2]&63}u=B&31;do{if((u|0)==0){A=f+166|0;z=b[A>>1]|0;if((B|0)!=0&(p|0)<0){b[A>>1]=z|1;C=p;break}else{b[A>>1]=z&-2;C=p;break}}else{z=p<<32-u|p>>>(u>>>0);A=f+166|0;y=b[A>>1]|0;if((z|0)<0){b[A>>1]=y|1;C=z;break}else{b[A>>1]=y&-2;C=z;break}}}while(0);u=f+372|0;c[u>>2]=(B<<1)+8+(c[u>>2]|0);l9(f,14,C);u=f+156|0;B=c[u>>2]|0;if((B&1|0)!=0){iA(f,B,0,0);return}p=f+164|0;b[f+162>>1]=b[p>>1]|0;z=B&16777215;B=z+1|0;if(B>>>0<(c[f+36>>2]|0)>>>0){y=c[f+32>>2]|0;D=d[y+z|0]<<8|d[y+B|0]}else{D=b6[c[f+12>>2]&63](c[f+4>>2]|0,z)|0}b[p>>1]=D;if((a[f+336|0]|0)==0){c[u>>2]=(c[u>>2]|0)+2;u=f+152|0;c[u>>2]=(c[u>>2]|0)+2;c[x>>2]=C;return}else{iy(f);return}}else if((h|0)==0){h=f+88+((g&7)<<2)|0;C=c[h>>2]|0;x=g>>>9&7;do{if((g&32|0)==0){u=(x|0)==0?8:x;D=C>>>(u>>>0);if((C|0)<0){E=u;F=D;m=3029}else{G=D;H=u;m=3030}}else{u=c[f+88+(x<<2)>>2]&63;if((u|0)==0){D=f+166|0;b[D>>1]=b[D>>1]&-2;I=C;J=0;break}D=(C|0)<0;if(u>>>0<32){p=C>>>(u>>>0);if(D){E=u;F=p;m=3029;break}else{G=p;H=u;m=3030;break}}p=f+166|0;z=b[p>>1]|0;if(D){b[p>>1]=z|17;I=-1;J=u;break}else{b[p>>1]=z&-18;I=0;J=u;break}}}while(0);if((m|0)==3029){G=-1<<32-E|F;H=E;m=3030}do{if((m|0)==3030){E=f+166|0;F=b[E>>1]|0;if((1<<H-1&C|0)==0){b[E>>1]=F&-18;I=G;J=H;break}else{b[E>>1]=F|17;I=G;J=H;break}}}while(0);H=f+372|0;c[H>>2]=(J<<1)+8+(c[H>>2]|0);l9(f,14,I);H=f+156|0;J=c[H>>2]|0;if((J&1|0)!=0){iA(f,J,0,0);return}G=f+164|0;b[f+162>>1]=b[G>>1]|0;C=J&16777215;J=C+1|0;if(J>>>0<(c[f+36>>2]|0)>>>0){m=c[f+32>>2]|0;K=d[m+C|0]<<8|d[m+J|0]}else{K=b6[c[f+12>>2]&63](c[f+4>>2]|0,C)|0}b[G>>1]=K;if((a[f+336|0]|0)==0){c[H>>2]=(c[H>>2]|0)+2;H=f+152|0;c[H>>2]=(c[H>>2]|0)+2;c[h>>2]=I;return}else{iy(f);return}}else{iB(f);I=f+372|0;c[I>>2]=(c[I>>2]|0)+2;return}}function la(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+8|0;g=f|0;h=b[e+160>>1]&63;if((b5[c[20600+(h<<2)>>2]&127](e,h,508,16)|0)!=0){i=f;return}if((mJ(e,g)|0)!=0){i=f;return}h=b[g>>1]|0;j=(h&65535)>>>1|h&-32768;h=e+372|0;c[h>>2]=(c[h>>2]|0)+8;l8(e,14,j);h=e+166|0;k=b[h>>1]|0;b[h>>1]=(b[g>>1]&1)==0?k&-18:k|17;k=e+156|0;g=c[k>>2]|0;if((g&1|0)!=0){iA(e,g,0,0);i=f;return}h=e+164|0;b[e+162>>1]=b[h>>1]|0;l=g&16777215;g=l+1|0;if(g>>>0<(c[e+36>>2]|0)>>>0){m=c[e+32>>2]|0;n=d[m+l|0]<<8|d[m+g|0]}else{n=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[h>>1]=n;if((a[e+336|0]|0)==0){c[k>>2]=(c[k>>2]|0)+2;k=e+152|0;c[k>>2]=(c[k>>2]|0)+2;mR(e,j)|0;i=f;return}else{iy(e);i=f;return}}function lb(f){f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;g=e[f+160>>1]|0;h=g>>>3&3;if((h|0)==1){i=f+88+((g&7)<<2)|0;j=c[i>>2]|0;k=g>>>9&7;do{if((g&32|0)==0){l=(k|0)==0?8:k;m=3153}else{n=c[f+88+(k<<2)>>2]&63;if((n|0)!=0){l=n;m=3153;break}n=f+166|0;b[n>>1]=b[n>>1]&-2;o=j&255;p=0}}while(0);L4010:do{if((m|0)==3153){if(l>>>0<8){k=j&255;n=k<<l&255;q=f+166|0;r=b[q>>1]|0;if((1<<8-l&k|0)==0){b[q>>1]=r&-18;o=n;p=l;break}else{b[q>>1]=r|17;o=n;p=l;break}}do{if((l|0)==8){if((j&1|0)==0){break}n=f+166|0;b[n>>1]=b[n>>1]|17;o=0;p=8;break L4010}}while(0);n=f+166|0;b[n>>1]=b[n>>1]&-18;o=0;p=l}}while(0);l=f+372|0;c[l>>2]=(p<<1)+6+(c[l>>2]|0);l7(f,14,o);l=f+156|0;p=c[l>>2]|0;if((p&1|0)!=0){iA(f,p,0,0);return}j=f+164|0;b[f+162>>1]=b[j>>1]|0;n=p&16777215;p=n+1|0;if(p>>>0<(c[f+36>>2]|0)>>>0){r=c[f+32>>2]|0;s=d[r+n|0]<<8|d[r+p|0]}else{s=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[j>>1]=s;if((a[f+336|0]|0)==0){c[l>>2]=(c[l>>2]|0)+2;l=f+152|0;c[l>>2]=(c[l>>2]|0)+2;c[i>>2]=c[i>>2]&-256|o&255;return}else{iy(f);return}}else if((h|0)==2){o=f+88+((g&7)<<2)|0;i=c[o>>2]&255;l=g>>>9&7;if((g&32|0)==0){s=f+166|0;t=(l|0)==0?8:l;u=s;v=(e[s>>1]|0)>>>4&1;m=3172}else{s=c[f+88+(l<<2)>>2]&63;l=f+166|0;j=(e[l>>1]|0)>>>4&1;if((s|0)==0){w=i;x=j;y=0;z=l}else{t=s;u=l;v=j;m=3172}}if((m|0)==3172){j=0;l=i;i=v;while(1){v=l<<1|i;s=j+1|0;n=(l&65535)>>>7&1;if(s>>>0<t>>>0){j=s;l=v;i=n}else{w=v;x=n;y=t;z=u;break}}}u=f+372|0;c[u>>2]=(y<<1)+6+(c[u>>2]|0);l7(f,14,w&255);u=b[z>>1]|0;b[z>>1]=x<<16>>16==0?u&-18:u|17;u=f+156|0;x=c[u>>2]|0;if((x&1|0)!=0){iA(f,x,0,0);return}z=f+164|0;b[f+162>>1]=b[z>>1]|0;y=x&16777215;x=y+1|0;if(x>>>0<(c[f+36>>2]|0)>>>0){t=c[f+32>>2]|0;A=d[t+y|0]<<8|d[t+x|0]}else{A=b6[c[f+12>>2]&63](c[f+4>>2]|0,y)|0}b[z>>1]=A;if((a[f+336|0]|0)==0){c[u>>2]=(c[u>>2]|0)+2;u=f+152|0;c[u>>2]=(c[u>>2]|0)+2;c[o>>2]=c[o>>2]&-256|w&255;return}else{iy(f);return}}else if((h|0)==3){w=f+88+((g&7)<<2)|0;o=c[w>>2]|0;u=o&255;A=g>>>9&7;if((g&32|0)==0){B=(A|0)==0?8:A}else{B=c[f+88+(A<<2)>>2]&63}A=B&7;L4065:do{if((A|0)==0){do{if((B|0)!=0){if((o&1|0)==0){break}z=f+166|0;b[z>>1]=b[z>>1]|1;C=u;break L4065}}while(0);z=f+166|0;b[z>>1]=b[z>>1]&-2;C=u}else{z=o&255;y=z>>>((8-A|0)>>>0)|z<<A;z=y&255;x=f+166|0;t=b[x>>1]|0;if((y&1|0)==0){b[x>>1]=t&-2;C=z;break}else{b[x>>1]=t|1;C=z;break}}}while(0);A=f+372|0;c[A>>2]=(B<<1)+6+(c[A>>2]|0);l7(f,14,C);A=f+156|0;B=c[A>>2]|0;if((B&1|0)!=0){iA(f,B,0,0);return}o=f+164|0;b[f+162>>1]=b[o>>1]|0;u=B&16777215;B=u+1|0;if(B>>>0<(c[f+36>>2]|0)>>>0){z=c[f+32>>2]|0;D=d[z+u|0]<<8|d[z+B|0]}else{D=b6[c[f+12>>2]&63](c[f+4>>2]|0,u)|0}b[o>>1]=D;if((a[f+336|0]|0)==0){c[A>>2]=(c[A>>2]|0)+2;A=f+152|0;c[A>>2]=(c[A>>2]|0)+2;c[w>>2]=c[w>>2]&-256|C&255;return}else{iy(f);return}}else if((h|0)==0){h=f+88+((g&7)<<2)|0;C=c[h>>2]|0;w=g>>>9&7;do{if((g&32|0)==0){E=(w|0)==0?8:w;m=3130}else{A=c[f+88+(w<<2)>>2]&63;if((A|0)!=0){E=A;m=3130;break}A=f+166|0;b[A>>1]=b[A>>1]&-4;F=C&255;G=0}}while(0);do{if((m|0)==3130){if(E>>>0<8){w=C&255;g=w<<E&255;A=f+166|0;D=b[A>>1]|0;o=(1<<8-E&w|0)==0?D&-18:D|17;b[A>>1]=o;D=255<<7-E&255;w=D&C;if((w|0)==0|(w|0)==(D|0)){b[A>>1]=o&-3;F=g;G=E;break}else{b[A>>1]=o|2;F=g;G=E;break}}do{if((E|0)==8){if((C&1|0)==0){m=3137;break}g=f+166|0;o=b[g>>1]|17;b[g>>1]=o;H=o}else{m=3137}}while(0);if((m|0)==3137){o=f+166|0;g=b[o>>1]&-18;b[o>>1]=g;H=g}g=f+166|0;if((C&255|0)==0){b[g>>1]=H&-3;F=0;G=E;break}else{b[g>>1]=H|2;F=0;G=E;break}}}while(0);E=f+372|0;c[E>>2]=(G<<1)+6+(c[E>>2]|0);l7(f,12,F);E=f+156|0;G=c[E>>2]|0;if((G&1|0)!=0){iA(f,G,0,0);return}H=f+164|0;b[f+162>>1]=b[H>>1]|0;C=G&16777215;G=C+1|0;if(G>>>0<(c[f+36>>2]|0)>>>0){m=c[f+32>>2]|0;I=d[m+C|0]<<8|d[m+G|0]}else{I=b6[c[f+12>>2]&63](c[f+4>>2]|0,C)|0}b[H>>1]=I;if((a[f+336|0]|0)==0){c[E>>2]=(c[E>>2]|0)+2;E=f+152|0;c[E>>2]=(c[E>>2]|0)+2;c[h>>2]=c[h>>2]&-256|F&255;return}else{iy(f);return}}else{iB(f);F=f+372|0;c[F>>2]=(c[F>>2]|0)+2;return}}function lc(f){f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;g=e[f+160>>1]|0;h=g>>>3&3;if((h|0)==0){i=f+88+((g&7)<<2)|0;j=c[i>>2]|0;k=g>>>9&7;do{if((g&32|0)==0){l=(k|0)==0?8:k;m=3222}else{n=c[f+88+(k<<2)>>2]&63;if((n|0)==0){o=f+166|0;b[o>>1]=b[o>>1]&-4;p=j&65535;q=0;break}if(n>>>0<16){l=n;m=3222;break}do{if((n|0)==16){if((j&1|0)==0){m=3228;break}o=f+166|0;r=b[o>>1]|17;b[o>>1]=r;s=r}else{m=3228}}while(0);if((m|0)==3228){r=f+166|0;o=b[r>>1]&-18;b[r>>1]=o;s=o}o=f+166|0;if((j&65535|0)==0){b[o>>1]=s&-3;p=0;q=n;break}else{b[o>>1]=s|2;p=0;q=n;break}}}while(0);do{if((m|0)==3222){s=j&65535;k=s<<l&65535;o=f+166|0;r=b[o>>1]|0;t=(1<<16-l&s|0)==0?r&-18:r|17;b[o>>1]=t;r=65535<<15-l&65535;s=r&j;if((s|0)==0|(s|0)==(r|0)){b[o>>1]=t&-3;p=k;q=l;break}else{b[o>>1]=t|2;p=k;q=l;break}}}while(0);l=f+372|0;c[l>>2]=(q<<1)+6+(c[l>>2]|0);l8(f,12,p);l=f+156|0;q=c[l>>2]|0;if((q&1|0)!=0){iA(f,q,0,0);return}j=f+164|0;b[f+162>>1]=b[j>>1]|0;k=q&16777215;q=k+1|0;if(q>>>0<(c[f+36>>2]|0)>>>0){t=c[f+32>>2]|0;u=d[t+k|0]<<8|d[t+q|0]}else{u=b6[c[f+12>>2]&63](c[f+4>>2]|0,k)|0}b[j>>1]=u;if((a[f+336|0]|0)==0){c[l>>2]=(c[l>>2]|0)+2;l=f+152|0;c[l>>2]=(c[l>>2]|0)+2;c[i>>2]=c[i>>2]&-65536|p&65535;return}else{iy(f);return}}else if((h|0)==2){p=f+88+((g&7)<<2)|0;i=c[p>>2]&65535;l=g>>>9&7;if((g&32|0)==0){u=f+166|0;v=(l|0)==0?8:l;w=u;x=(e[u>>1]|0)>>>4&1;m=3263}else{u=c[f+88+(l<<2)>>2]&63;l=f+166|0;j=(e[l>>1]|0)>>>4&1;if((u|0)==0){y=j;z=i;A=0;B=l}else{v=u;w=l;x=j;m=3263}}if((m|0)==3263){j=x;x=0;l=i;while(1){i=(l&65535)>>>15;u=j|l<<1;k=x+1|0;if(k>>>0<v>>>0){j=i;x=k;l=u}else{y=i;z=u;A=v;B=w;break}}}w=f+372|0;c[w>>2]=(A<<1)+6+(c[w>>2]|0);l8(f,14,z);w=b[B>>1]|0;b[B>>1]=y<<16>>16==0?w&-18:w|17;w=f+156|0;y=c[w>>2]|0;if((y&1|0)!=0){iA(f,y,0,0);return}B=f+164|0;b[f+162>>1]=b[B>>1]|0;A=y&16777215;y=A+1|0;if(y>>>0<(c[f+36>>2]|0)>>>0){v=c[f+32>>2]|0;C=d[v+A|0]<<8|d[v+y|0]}else{C=b6[c[f+12>>2]&63](c[f+4>>2]|0,A)|0}b[B>>1]=C;if((a[f+336|0]|0)==0){c[w>>2]=(c[w>>2]|0)+2;w=f+152|0;c[w>>2]=(c[w>>2]|0)+2;c[p>>2]=c[p>>2]&-65536|z&65535;return}else{iy(f);return}}else if((h|0)==1){z=f+88+((g&7)<<2)|0;p=c[z>>2]|0;w=g>>>9&7;L4188:do{if((g&32|0)==0){D=(w|0)==0?8:w;m=3245}else{C=c[f+88+(w<<2)>>2]&63;if((C|0)==0){B=f+166|0;b[B>>1]=b[B>>1]&-2;E=p&65535;F=0;break}if(C>>>0<16){D=C;m=3245;break}do{if((C|0)==16){if((p&1|0)==0){break}B=f+166|0;b[B>>1]=b[B>>1]|17;E=0;F=16;break L4188}}while(0);n=f+166|0;b[n>>1]=b[n>>1]&-18;E=0;F=C}}while(0);do{if((m|0)==3245){w=p&65535;n=w<<D&65535;B=f+166|0;A=b[B>>1]|0;if((1<<16-D&w|0)==0){b[B>>1]=A&-18;E=n;F=D;break}else{b[B>>1]=A|17;E=n;F=D;break}}}while(0);D=f+372|0;c[D>>2]=(F<<1)+6+(c[D>>2]|0);l8(f,14,E);D=f+156|0;F=c[D>>2]|0;if((F&1|0)!=0){iA(f,F,0,0);return}p=f+164|0;b[f+162>>1]=b[p>>1]|0;m=F&16777215;F=m+1|0;if(F>>>0<(c[f+36>>2]|0)>>>0){n=c[f+32>>2]|0;G=d[n+m|0]<<8|d[n+F|0]}else{G=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[p>>1]=G;if((a[f+336|0]|0)==0){c[D>>2]=(c[D>>2]|0)+2;D=f+152|0;c[D>>2]=(c[D>>2]|0)+2;c[z>>2]=c[z>>2]&-65536|E&65535;return}else{iy(f);return}}else if((h|0)==3){h=f+88+((g&7)<<2)|0;E=c[h>>2]|0;z=E&65535;D=g>>>9&7;if((g&32|0)==0){H=(D|0)==0?8:D}else{H=c[f+88+(D<<2)>>2]&63}D=H&15;L4223:do{if((D|0)==0){do{if((H|0)!=0){if((E&1|0)==0){break}g=f+166|0;b[g>>1]=b[g>>1]|1;I=z;break L4223}}while(0);C=f+166|0;b[C>>1]=b[C>>1]&-2;I=z}else{C=E&65535;g=C>>>((16-D|0)>>>0)|C<<D;C=g&65535;G=f+166|0;p=b[G>>1]|0;if((g&1|0)==0){b[G>>1]=p&-2;I=C;break}else{b[G>>1]=p|1;I=C;break}}}while(0);D=f+372|0;c[D>>2]=(H<<1)+6+(c[D>>2]|0);l8(f,14,I);D=f+156|0;H=c[D>>2]|0;if((H&1|0)!=0){iA(f,H,0,0);return}E=f+164|0;b[f+162>>1]=b[E>>1]|0;z=H&16777215;H=z+1|0;if(H>>>0<(c[f+36>>2]|0)>>>0){C=c[f+32>>2]|0;J=d[C+z|0]<<8|d[C+H|0]}else{J=b6[c[f+12>>2]&63](c[f+4>>2]|0,z)|0}b[E>>1]=J;if((a[f+336|0]|0)==0){c[D>>2]=(c[D>>2]|0)+2;D=f+152|0;c[D>>2]=(c[D>>2]|0)+2;c[h>>2]=c[h>>2]&-65536|I&65535;return}else{iy(f);return}}else{iB(f);I=f+372|0;c[I>>2]=(c[I>>2]|0)+2;return}}function ld(f){f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;g=e[f+160>>1]|0;h=g>>>3&3;if((h|0)==2){i=g>>>9&7;if((g&32|0)==0){j=(i|0)==0?8:i}else{j=c[f+88+(i<<2)>>2]&63}i=f+88+((g&7)<<2)|0;k=c[i>>2]|0;l=f+166|0;m=(e[l>>1]|0)>>>4&1;if((j|0)==0){n=m;o=k}else{p=m;m=0;q=k;while(1){k=q>>>31;r=p|q<<1;s=m+1|0;if(s>>>0<j>>>0){p=k;m=s;q=r}else{n=k;o=r;break}}}q=f+372|0;c[q>>2]=(j<<1)+8+(c[q>>2]|0);l9(f,14,o);q=b[l>>1]|0;b[l>>1]=(n|0)==0?q&-18:q|17;q=f+156|0;n=c[q>>2]|0;if((n&1|0)!=0){iA(f,n,0,0);return}l=f+164|0;b[f+162>>1]=b[l>>1]|0;j=n&16777215;n=j+1|0;if(n>>>0<(c[f+36>>2]|0)>>>0){m=c[f+32>>2]|0;t=d[m+j|0]<<8|d[m+n|0]}else{t=b6[c[f+12>>2]&63](c[f+4>>2]|0,j)|0}b[l>>1]=t;if((a[f+336|0]|0)==0){c[q>>2]=(c[q>>2]|0)+2;q=f+152|0;c[q>>2]=(c[q>>2]|0)+2;c[i>>2]=o;return}else{iy(f);return}}else if((h|0)==1){o=f+88+((g&7)<<2)|0;i=c[o>>2]|0;q=g>>>9&7;L4272:do{if((g&32|0)==0){u=(q|0)==0?8:q;v=3336}else{t=c[f+88+(q<<2)>>2]&63;if((t|0)==0){l=f+166|0;b[l>>1]=b[l>>1]&-2;w=i;x=0;break}if(t>>>0<32){u=t;v=3336;break}do{if((t|0)==32){if((i&1|0)==0){break}l=f+166|0;b[l>>1]=b[l>>1]|17;w=0;x=32;break L4272}}while(0);l=f+166|0;b[l>>1]=b[l>>1]&-18;w=0;x=t}}while(0);do{if((v|0)==3336){q=i<<u;l=f+166|0;j=b[l>>1]|0;if((1<<32-u&i|0)==0){b[l>>1]=j&-18;w=q;x=u;break}else{b[l>>1]=j|17;w=q;x=u;break}}}while(0);u=f+372|0;c[u>>2]=(x<<1)+8+(c[u>>2]|0);l9(f,14,w);u=f+156|0;x=c[u>>2]|0;if((x&1|0)!=0){iA(f,x,0,0);return}i=f+164|0;b[f+162>>1]=b[i>>1]|0;q=x&16777215;x=q+1|0;if(x>>>0<(c[f+36>>2]|0)>>>0){j=c[f+32>>2]|0;y=d[j+q|0]<<8|d[j+x|0]}else{y=b6[c[f+12>>2]&63](c[f+4>>2]|0,q)|0}b[i>>1]=y;if((a[f+336|0]|0)==0){c[u>>2]=(c[u>>2]|0)+2;u=f+152|0;c[u>>2]=(c[u>>2]|0)+2;c[o>>2]=w;return}else{iy(f);return}}else if((h|0)==3){w=f+88+((g&7)<<2)|0;o=c[w>>2]|0;u=g>>>9&7;if((g&32|0)==0){z=(u|0)==0?8:u}else{z=c[f+88+(u<<2)>>2]&63}u=z&31;L4309:do{if((u|0)==0){do{if((z|0)!=0){if((o&1|0)==0){break}y=f+166|0;b[y>>1]=b[y>>1]|1;A=o;break L4309}}while(0);t=f+166|0;b[t>>1]=b[t>>1]&-2;A=o}else{t=o>>>((32-u|0)>>>0)|o<<u;y=f+166|0;i=b[y>>1]|0;if((t&1|0)==0){b[y>>1]=i&-2;A=t;break}else{b[y>>1]=i|1;A=t;break}}}while(0);u=f+372|0;c[u>>2]=(z<<1)+8+(c[u>>2]|0);l9(f,14,A);u=f+156|0;z=c[u>>2]|0;if((z&1|0)!=0){iA(f,z,0,0);return}o=f+164|0;b[f+162>>1]=b[o>>1]|0;t=z&16777215;z=t+1|0;if(z>>>0<(c[f+36>>2]|0)>>>0){i=c[f+32>>2]|0;B=d[i+t|0]<<8|d[i+z|0]}else{B=b6[c[f+12>>2]&63](c[f+4>>2]|0,t)|0}b[o>>1]=B;if((a[f+336|0]|0)==0){c[u>>2]=(c[u>>2]|0)+2;u=f+152|0;c[u>>2]=(c[u>>2]|0)+2;c[w>>2]=A;return}else{iy(f);return}}else if((h|0)==0){h=f+88+((g&7)<<2)|0;A=c[h>>2]|0;w=g>>>9&7;do{if((g&32|0)==0){C=(w|0)==0?8:w;v=3313}else{u=c[f+88+(w<<2)>>2]&63;if((u|0)==0){B=f+166|0;b[B>>1]=b[B>>1]&-4;D=A;E=0;break}if(u>>>0<32){C=u;v=3313;break}do{if((u|0)==32){if((A&1|0)==0){v=3319;break}B=f+166|0;o=b[B>>1]|17;b[B>>1]=o;F=o}else{v=3319}}while(0);if((v|0)==3319){o=f+166|0;B=b[o>>1]&-18;b[o>>1]=B;F=B}B=f+166|0;if((A|0)==0){b[B>>1]=F&-3;D=0;E=u;break}else{b[B>>1]=F|2;D=0;E=u;break}}}while(0);do{if((v|0)==3313){F=A<<C;w=-1<<31-C;g=f+166|0;B=b[g>>1]|0;o=(1<<32-C&A|0)==0?B&-18:B|17;b[g>>1]=o;B=w&A;if((B|0)==0|(B|0)==(w|0)){b[g>>1]=o&-3;D=F;E=C;break}else{b[g>>1]=o|2;D=F;E=C;break}}}while(0);C=f+372|0;c[C>>2]=(E<<1)+8+(c[C>>2]|0);l9(f,12,D);C=f+156|0;E=c[C>>2]|0;if((E&1|0)!=0){iA(f,E,0,0);return}A=f+164|0;b[f+162>>1]=b[A>>1]|0;v=E&16777215;E=v+1|0;if(E>>>0<(c[f+36>>2]|0)>>>0){F=c[f+32>>2]|0;G=d[F+v|0]<<8|d[F+E|0]}else{G=b6[c[f+12>>2]&63](c[f+4>>2]|0,v)|0}b[A>>1]=G;if((a[f+336|0]|0)==0){c[C>>2]=(c[C>>2]|0)+2;C=f+152|0;c[C>>2]=(c[C>>2]|0)+2;c[h>>2]=D;return}else{iy(f);return}}else{iB(f);D=f+372|0;c[D>>2]=(c[D>>2]|0)+2;return}}function le(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;i=i+8|0;h=g|0;j=b[f+160>>1]&63;if((b5[c[20600+(j<<2)>>2]&127](f,j,508,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}j=e[h>>1]<<1;k=j&65535;l=f+372|0;c[l>>2]=(c[l>>2]|0)+8;l8(f,12,k);l=b[h>>1]|0;h=f+166|0;m=b[h>>1]|0;n=l<<16>>16<0?m|17:m&-18;b[h>>1]=((l&65535^j)&32768|0)==0?n&-3:n|2;n=f+156|0;j=c[n>>2]|0;if((j&1|0)!=0){iA(f,j,0,0);i=g;return}l=f+164|0;b[f+162>>1]=b[l>>1]|0;h=j&16777215;j=h+1|0;if(j>>>0<(c[f+36>>2]|0)>>>0){m=c[f+32>>2]|0;o=d[m+h|0]<<8|d[m+j|0]}else{o=b6[c[f+12>>2]&63](c[f+4>>2]|0,h)|0}b[l>>1]=o;if((a[f+336|0]|0)==0){c[n>>2]=(c[n>>2]|0)+2;n=f+152|0;c[n>>2]=(c[n>>2]|0)+2;mR(f,k)|0;i=g;return}else{iy(f);i=g;return}}function lf(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;i=i+8|0;h=g|0;j=b[f+160>>1]&63;if((b5[c[20600+(j<<2)>>2]&127](f,j,508,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}j=(e[h>>1]|0)>>>1;k=f+372|0;c[k>>2]=(c[k>>2]|0)+8;l8(f,14,j);k=f+166|0;l=b[k>>1]|0;b[k>>1]=(b[h>>1]&1)==0?l&-18:l|17;l=f+156|0;h=c[l>>2]|0;if((h&1|0)!=0){iA(f,h,0,0);i=g;return}k=f+164|0;b[f+162>>1]=b[k>>1]|0;m=h&16777215;h=m+1|0;if(h>>>0<(c[f+36>>2]|0)>>>0){n=c[f+32>>2]|0;o=d[n+m|0]<<8|d[n+h|0]}else{o=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[k>>1]=o;if((a[f+336|0]|0)==0){c[l>>2]=(c[l>>2]|0)+2;l=f+152|0;c[l>>2]=(c[l>>2]|0)+2;mR(f,j)|0;i=g;return}else{iy(f);i=g;return}}function lg(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+8|0;g=f|0;h=b[e+160>>1]&63;if((b5[c[20600+(h<<2)>>2]&127](e,h,508,16)|0)!=0){i=f;return}if((mJ(e,g)|0)!=0){i=f;return}h=b[g>>1]<<1;j=e+372|0;c[j>>2]=(c[j>>2]|0)+8;l8(e,14,h);j=e+166|0;k=b[j>>1]|0;b[j>>1]=(b[g>>1]|0)<0?k|17:k&-18;k=e+156|0;g=c[k>>2]|0;if((g&1|0)!=0){iA(e,g,0,0);i=f;return}j=e+164|0;b[e+162>>1]=b[j>>1]|0;l=g&16777215;g=l+1|0;if(g>>>0<(c[e+36>>2]|0)>>>0){m=c[e+32>>2]|0;n=d[m+l|0]<<8|d[m+g|0]}else{n=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[j>>1]=n;if((a[e+336|0]|0)==0){c[k>>2]=(c[k>>2]|0)+2;k=e+152|0;c[k>>2]=(c[k>>2]|0)+2;mR(e,h)|0;i=f;return}else{iy(e);i=f;return}}function lh(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;i=i+8|0;h=g|0;j=b[f+160>>1]&63;if((b5[c[20600+(j<<2)>>2]&127](f,j,508,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}j=f+166|0;k=(e[h>>1]|0)>>>1|(e[j>>1]|0)>>>4<<15;l=f+372|0;c[l>>2]=(c[l>>2]|0)+8;l8(f,14,k);l=b[j>>1]|0;b[j>>1]=(b[h>>1]&1)==0?l&-18:l|17;l=f+156|0;h=c[l>>2]|0;if((h&1|0)!=0){iA(f,h,0,0);i=g;return}j=f+164|0;b[f+162>>1]=b[j>>1]|0;m=h&16777215;h=m+1|0;if(h>>>0<(c[f+36>>2]|0)>>>0){n=c[f+32>>2]|0;o=d[n+m|0]<<8|d[n+h|0]}else{o=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[j>>1]=o;if((a[f+336|0]|0)==0){c[l>>2]=(c[l>>2]|0)+2;l=f+152|0;c[l>>2]=(c[l>>2]|0)+2;mR(f,k)|0;i=g;return}else{iy(f);i=g;return}}function li(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;i=i+8|0;h=g|0;j=b[f+160>>1]&63;if((b5[c[20600+(j<<2)>>2]&127](f,j,508,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}j=f+166|0;k=b[h>>1]<<1|(e[j>>1]|0)>>>4&1;l=f+372|0;c[l>>2]=(c[l>>2]|0)+8;l8(f,14,k);l=b[j>>1]|0;b[j>>1]=(b[h>>1]|0)<0?l|17:l&-18;l=f+156|0;h=c[l>>2]|0;if((h&1|0)!=0){iA(f,h,0,0);i=g;return}j=f+164|0;b[f+162>>1]=b[j>>1]|0;m=h&16777215;h=m+1|0;if(h>>>0<(c[f+36>>2]|0)>>>0){n=c[f+32>>2]|0;o=d[n+m|0]<<8|d[n+h|0]}else{o=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[j>>1]=o;if((a[f+336|0]|0)==0){c[l>>2]=(c[l>>2]|0)+2;l=f+152|0;c[l>>2]=(c[l>>2]|0)+2;mR(f,k)|0;i=g;return}else{iy(f);i=g;return}}function lj(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+8|0;g=f|0;h=b[e+160>>1]&63;if((b5[c[20600+(h<<2)>>2]&127](e,h,508,16)|0)!=0){i=f;return}if((mJ(e,g)|0)!=0){i=f;return}h=b[g>>1]|0;j=(h&65535)>>>1|h<<15;h=e+372|0;c[h>>2]=(c[h>>2]|0)+8;l8(e,14,j);h=e+166|0;k=b[h>>1]|0;b[h>>1]=(b[g>>1]&1)==0?k&-2:k|1;k=e+156|0;g=c[k>>2]|0;if((g&1|0)!=0){iA(e,g,0,0);i=f;return}h=e+164|0;b[e+162>>1]=b[h>>1]|0;l=g&16777215;g=l+1|0;if(g>>>0<(c[e+36>>2]|0)>>>0){m=c[e+32>>2]|0;n=d[m+l|0]<<8|d[m+g|0]}else{n=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[h>>1]=n;if((a[e+336|0]|0)==0){c[k>>2]=(c[k>>2]|0)+2;k=e+152|0;c[k>>2]=(c[k>>2]|0)+2;mR(e,j)|0;i=f;return}else{iy(e);i=f;return}}function lk(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;i=i+8|0;h=g|0;j=b[f+160>>1]&63;if((b5[c[20600+(j<<2)>>2]&127](f,j,508,16)|0)!=0){i=g;return}if((mJ(f,h)|0)!=0){i=g;return}j=e[h>>1]|0;h=j>>>15;k=(j<<1|h)&65535;j=f+372|0;c[j>>2]=(c[j>>2]|0)+8;l8(f,14,k);j=f+166|0;l=b[j>>1]|0;b[j>>1]=(h|0)==0?l&-2:l|1;l=f+156|0;h=c[l>>2]|0;if((h&1|0)!=0){iA(f,h,0,0);i=g;return}j=f+164|0;b[f+162>>1]=b[j>>1]|0;m=h&16777215;h=m+1|0;if(h>>>0<(c[f+36>>2]|0)>>>0){n=c[f+32>>2]|0;o=d[n+m|0]<<8|d[n+h|0]}else{o=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[j>>1]=o;if((a[f+336|0]|0)==0){c[l>>2]=(c[l>>2]|0)+2;l=f+152|0;c[l>>2]=(c[l>>2]|0)+2;mR(f,k)|0;i=g;return}else{iy(f);i=g;return}}function ll(a){a=a|0;b[a+330>>1]=b[a+160>>1]|0;iH(a);return}function lm(f,g){f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;h=f+152|0;i=(c[h>>2]|0)+2|0;j=f+160|0;k=e[j>>1]|0;l=(k&128|0)!=0?k|-256:k&255;do{if((l|0)==0){k=f+156|0;m=c[k>>2]|0;if((m&1|0)!=0){iA(f,m,0,0);return}n=f+164|0;o=f+162|0;b[o>>1]=b[n>>1]|0;p=m&16777215;m=p+1|0;if(m>>>0<(c[f+36>>2]|0)>>>0){q=c[f+32>>2]|0;r=d[q+p|0]<<8|d[q+m|0]}else{r=b6[c[f+12>>2]&63](c[f+4>>2]|0,p)|0}b[n>>1]=r;if((a[f+336|0]|0)==0){c[k>>2]=(c[k>>2]|0)+2;c[h>>2]=(c[h>>2]|0)+2;k=e[o>>1]|0;s=(k&32768|0)!=0?k|-65536:k;break}iy(f);return}else{s=l}}while(0);do{if((g|0)==0){l=f+372|0;c[l>>2]=((b[j>>1]&255)==0?12:8)+(c[l>>2]|0);t=c[f+156>>2]|0}else{l=f+372|0;c[l>>2]=(c[l>>2]|0)+10;l=i+s|0;r=f+156|0;c[r>>2]=l;if((l&1|0)!=0){iA(f,l,0,0);return}k=f+164|0;b[f+162>>1]=b[k>>1]|0;o=l&16777215;l=o+1|0;if(l>>>0<(c[f+36>>2]|0)>>>0){n=c[f+32>>2]|0;u=d[n+o|0]<<8|d[n+l|0]}else{u=b6[c[f+12>>2]&63](c[f+4>>2]|0,o)|0}b[k>>1]=u;if((a[f+336|0]|0)==0){k=(c[r>>2]|0)+2|0;c[r>>2]=k;c[h>>2]=(c[h>>2]|0)+2;t=k;break}iy(f);return}}while(0);u=f+156|0;if((t&1|0)!=0){iA(f,t,0,0);return}s=f+164|0;b[f+162>>1]=b[s>>1]|0;i=t&16777215;t=i+1|0;if(t>>>0<(c[f+36>>2]|0)>>>0){j=c[f+32>>2]|0;v=d[j+i|0]<<8|d[j+t|0]}else{v=b6[c[f+12>>2]&63](c[f+4>>2]|0,i)|0}b[s>>1]=v;if((a[f+336|0]|0)==0){v=c[u>>2]|0;c[u>>2]=v+2;c[h>>2]=v-2;return}else{iy(f);return}}function ln(e,f){e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;g=b[e+160>>1]&7;do{if((g|0)==4){h=c[e+156>>2]|0}else if((g|0)==2){i=e+156|0;j=c[i>>2]|0;if((j&1|0)!=0){iA(e,j,0,0);return}k=e+164|0;b[e+162>>1]=b[k>>1]|0;l=j&16777215;j=l+1|0;if(j>>>0<(c[e+36>>2]|0)>>>0){m=c[e+32>>2]|0;n=d[m+l|0]<<8|d[m+j|0]}else{n=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[k>>1]=n;if((a[e+336|0]|0)==0){k=(c[i>>2]|0)+2|0;c[i>>2]=k;i=e+152|0;c[i>>2]=(c[i>>2]|0)+2;h=k;break}iy(e);return}else if((g|0)==3){k=e+156|0;i=c[k>>2]|0;if((i&1|0)!=0){iA(e,i,0,0);return}l=e+164|0;j=e+162|0;b[j>>1]=b[l>>1]|0;m=i&16777215;i=m+1|0;o=e+36|0;if(i>>>0<(c[o>>2]|0)>>>0){p=c[e+32>>2]|0;q=d[p+m|0]<<8|d[p+i|0]}else{q=b6[c[e+12>>2]&63](c[e+4>>2]|0,m)|0}b[l>>1]=q;m=e+336|0;if((a[m]|0)!=0){iy(e);return}i=(c[k>>2]|0)+2|0;c[k>>2]=i;p=e+152|0;c[p>>2]=(c[p>>2]|0)+2;if((i&1|0)!=0){iA(e,i,0,0);return}b[j>>1]=q;j=i&16777215;i=j+1|0;do{if(i>>>0<(c[o>>2]|0)>>>0){r=c[e+32>>2]|0;b[l>>1]=d[r+j|0]<<8|d[r+i|0]}else{r=b6[c[e+12>>2]&63](c[e+4>>2]|0,j)|0;s=(a[m]|0)==0;b[l>>1]=r;if(s){break}iy(e);return}}while(0);l=(c[k>>2]|0)+2|0;c[k>>2]=l;c[p>>2]=(c[p>>2]|0)+2;h=l}else{l=e+372|0;c[l>>2]=(c[l>>2]|0)+2;iB(e);return}}while(0);q=e+156|0;if((h&1|0)!=0){iA(e,h,0,0);return}g=e+164|0;b[e+162>>1]=b[g>>1]|0;n=h&16777215;h=n+1|0;if(h>>>0<(c[e+36>>2]|0)>>>0){l=c[e+32>>2]|0;t=d[l+n|0]<<8|d[l+h|0]}else{t=b6[c[e+12>>2]&63](c[e+4>>2]|0,n)|0}b[g>>1]=t;if((a[e+336|0]|0)!=0){iy(e);return}c[q>>2]=(c[q>>2]|0)+2;q=e+152|0;c[q>>2]=(c[q>>2]|0)+2;if((f|0)==0){f=e+372|0;c[f>>2]=(c[f>>2]|0)+4;return}else{iE(e);return}}function lo(a){a=a|0;var b=0,d=0;iN(a);b=0;do{d=c[24952+(b<<2)>>2]|0;if((d|0)!=0){c[a+400+(b<<2)>>2]=d}b=b+1|0;}while(b>>>0<1024);c[a+4496>>2]=494;return}function lp(e){e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;f=e+88+((b[e+160>>1]&7)<<2)|0;g=c[f>>2]|0;h=(g&128|0)!=0?g|-256:g&255;g=e+372|0;c[g>>2]=(c[g>>2]|0)+4;l9(e,15,h);g=e+156|0;i=c[g>>2]|0;if((i&1|0)!=0){iA(e,i,0,0);return}j=e+164|0;b[e+162>>1]=b[j>>1]|0;k=i&16777215;i=k+1|0;if(i>>>0<(c[e+36>>2]|0)>>>0){l=c[e+32>>2]|0;m=d[l+k|0]<<8|d[l+i|0]}else{m=b6[c[e+12>>2]&63](c[e+4>>2]|0,k)|0}b[j>>1]=m;if((a[e+336|0]|0)==0){c[g>>2]=(c[g>>2]|0)+2;g=e+152|0;c[g>>2]=(c[g>>2]|0)+2;c[f>>2]=h;return}else{iy(e);return}}function lq(f){f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;g=f+160|0;h=(e[g>>1]|0)>>>9&3;i=f+156|0;j=c[i>>2]|0;if((j&1|0)!=0){iA(f,j,0,0);return}k=f+164|0;l=f+162|0;b[l>>1]=b[k>>1]|0;m=j&16777215;j=m+1|0;n=f+36|0;if(j>>>0<(c[n>>2]|0)>>>0){o=c[f+32>>2]|0;p=d[o+m|0]<<8|d[o+j|0]}else{p=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[k>>1]=p;p=f+336|0;if((a[p]|0)!=0){iy(f);return}c[i>>2]=(c[i>>2]|0)+2;m=f+152|0;c[m>>2]=(c[m>>2]|0)+2;if((b[l>>1]&2047)!=0){j=f+372|0;c[j>>2]=(c[j>>2]|0)+2;iB(f);return}j=b[g>>1]&63;if((b5[c[20600+(j<<2)>>2]&127](f,j,2020,8)|0)!=0){return}if((c[f+340>>2]|0)!=2){j=f+372|0;c[j>>2]=(c[j>>2]|0)+2;iB(f);return}j=(h|0)==0;do{if(j){g=f+344|0;o=c[g>>2]|0;q=o&16777215;r=c[n>>2]|0;if(q>>>0<r>>>0){s=a[(c[f+32>>2]|0)+q|0]|0;t=o;u=r}else{r=b6[c[f+8>>2]&63](c[f+4>>2]|0,q)|0;s=r;t=c[g>>2]|0;u=c[n>>2]|0}g=s&255;r=t+1&16777215;if(r>>>0<u>>>0){v=a[(c[f+32>>2]|0)+r|0]|0}else{v=b6[c[f+8>>2]&63](c[f+4>>2]|0,r)|0}r=v&255;w=(r&128|0)!=0?r|-256:r;x=(g&128|0)!=0?g|-256:g}else{g=f+344|0;r=c[g>>2]|0;q=r&16777215;if((h|0)!=1){o=q+3|0;y=c[n>>2]|0;if(o>>>0<y>>>0){z=c[f+32>>2]|0;A=((d[z+q|0]<<8|d[z+(q+1)|0])<<8|d[z+(q+2)|0])<<8|d[z+o|0];B=r;C=y}else{y=b6[c[f+16>>2]&63](c[f+4>>2]|0,q)|0;A=y;B=c[g>>2]|0;C=c[n>>2]|0}y=B+4&16777215;o=y+3|0;if(o>>>0<C>>>0){z=c[f+32>>2]|0;w=((d[z+y|0]<<8|d[z+(y+1)|0])<<8|d[z+(y+2)|0])<<8|d[z+o|0];x=A;break}else{w=b6[c[f+16>>2]&63](c[f+4>>2]|0,y)|0;x=A;break}}y=q+1|0;o=c[n>>2]|0;if(y>>>0<o>>>0){z=c[f+32>>2]|0;D=d[z+q|0]<<8|d[z+y|0];E=r;F=o}else{o=b6[c[f+12>>2]&63](c[f+4>>2]|0,q)|0;D=o;E=c[g>>2]|0;F=c[n>>2]|0}g=D&65535;o=E+2&16777215;q=o+1|0;if(q>>>0<F>>>0){r=c[f+32>>2]|0;G=d[r+o|0]<<8|d[r+q|0]}else{G=b6[c[f+12>>2]&63](c[f+4>>2]|0,o)|0}o=G&65535;w=(o&32768|0)!=0?o|-65536:o;x=(g&32768|0)!=0?g|-65536:g}}while(0);G=b[l>>1]|0;F=G&65535;E=F>>>12&7;do{if((F&32768|0)==0){D=c[f+88+(E<<2)>>2]|0;if(j){H=(D&128|0)!=0?D|-256:D&255;break}if((h|0)!=1){H=D;break}H=(D&32768|0)!=0?D|-65536:D&65535}else{H=c[f+120+(E<<2)>>2]|0}}while(0);E=H^-2147483648;if(E>>>0<(x^-2147483648)>>>0){I=1}else{I=E>>>0>(w^-2147483648)>>>0}E=f+166|0;h=b[E>>1]|0;j=(H|0)==(x|0)|(H|0)==(w|0)?h|4:h&-5;b[E>>1]=I?j|1:j&-2;j=f+372|0;c[j>>2]=(c[j>>2]|0)+14;if(!((G&2048)==0|I^1)){iD(f);return}I=c[i>>2]|0;if((I&1|0)!=0){iA(f,I,0,0);return}b[l>>1]=b[k>>1]|0;l=I&16777215;I=l+1|0;if(I>>>0<(c[n>>2]|0)>>>0){n=c[f+32>>2]|0;J=d[n+l|0]<<8|d[n+I|0]}else{J=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[k>>1]=J;if((a[p]|0)==0){c[i>>2]=(c[i>>2]|0)+2;c[m>>2]=(c[m>>2]|0)+2;return}else{iy(f);return}}function lr(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+8|0;h=g|0;j=f+160|0;k=b[j>>1]&63;if((b5[c[20600+(k<<2)>>2]&127](f,k,4093,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}k=c[f+88+(((e[j>>1]|0)>>>9&7)<<2)>>2]|0;do{if((k|0)<0){j=f+166|0;b[j>>1]=b[j>>1]|8}else{j=c[h>>2]|0;if((j|0)<0|k>>>0>j>>>0){j=f+166|0;b[j>>1]=b[j>>1]&-9;break}j=f+372|0;c[j>>2]=(c[j>>2]|0)+14;j=f+156|0;l=c[j>>2]|0;if((l&1|0)!=0){iA(f,l,0,0);i=g;return}m=f+164|0;b[f+162>>1]=b[m>>1]|0;n=l&16777215;l=n+1|0;if(l>>>0<(c[f+36>>2]|0)>>>0){o=c[f+32>>2]|0;p=d[o+n|0]<<8|d[o+l|0]}else{p=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[m>>1]=p;if((a[f+336|0]|0)==0){c[j>>2]=(c[j>>2]|0)+2;j=f+152|0;c[j>>2]=(c[j>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}}while(0);iD(f);i=g;return}function ls(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;h=b[e+160>>1]&63;if((b5[c[20600+(h<<2)>>2]&127](e,h,4093,8)|0)!=0){i=f;return}if((mI(e,g)|0)!=0){i=f;return}h=e+372|0;c[h>>2]=(c[h>>2]|0)+8;l7(e,15,a[g]|0);g=e+156|0;h=c[g>>2]|0;if((h&1|0)!=0){iA(e,h,0,0);i=f;return}j=e+164|0;b[e+162>>1]=b[j>>1]|0;k=h&16777215;h=k+1|0;if(h>>>0<(c[e+36>>2]|0)>>>0){l=c[e+32>>2]|0;m=d[l+k|0]<<8|d[l+h|0]}else{m=b6[c[e+12>>2]&63](c[e+4>>2]|0,k)|0}b[j>>1]=m;if((a[e+336|0]|0)==0){c[g>>2]=(c[g>>2]|0)+2;g=e+152|0;c[g>>2]=(c[g>>2]|0)+2;i=f;return}else{iy(e);i=f;return}}function lt(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;h=b[e+160>>1]&63;if((b5[c[20600+(h<<2)>>2]&127](e,h,4095,16)|0)!=0){i=f;return}if((mJ(e,g)|0)!=0){i=f;return}h=e+372|0;c[h>>2]=(c[h>>2]|0)+8;l8(e,15,b[g>>1]|0);g=e+156|0;h=c[g>>2]|0;if((h&1|0)!=0){iA(e,h,0,0);i=f;return}j=e+164|0;b[e+162>>1]=b[j>>1]|0;k=h&16777215;h=k+1|0;if(h>>>0<(c[e+36>>2]|0)>>>0){l=c[e+32>>2]|0;m=d[l+k|0]<<8|d[l+h|0]}else{m=b6[c[e+12>>2]&63](c[e+4>>2]|0,k)|0}b[j>>1]=m;if((a[e+336|0]|0)==0){c[g>>2]=(c[g>>2]|0)+2;g=e+152|0;c[g>>2]=(c[g>>2]|0)+2;i=f;return}else{iy(e);i=f;return}}function lu(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;h=b[e+160>>1]&63;if((b5[c[20600+(h<<2)>>2]&127](e,h,4095,32)|0)!=0){i=f;return}if((mK(e,g)|0)!=0){i=f;return}h=e+372|0;c[h>>2]=(c[h>>2]|0)+8;l9(e,15,c[g>>2]|0);g=e+156|0;h=c[g>>2]|0;if((h&1|0)!=0){iA(e,h,0,0);i=f;return}j=e+164|0;b[e+162>>1]=b[j>>1]|0;k=h&16777215;h=k+1|0;if(h>>>0<(c[e+36>>2]|0)>>>0){l=c[e+32>>2]|0;m=d[l+k|0]<<8|d[l+h|0]}else{m=b6[c[e+12>>2]&63](c[e+4>>2]|0,k)|0}b[j>>1]=m;if((a[e+336|0]|0)==0){c[g>>2]=(c[g>>2]|0)+2;g=e+152|0;c[g>>2]=(c[g>>2]|0)+2;i=f;return}else{iy(e);i=f;return}}function lv(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;g=i;i=i+8|0;h=g|0;j=f+156|0;k=c[j>>2]|0;if((k&1|0)!=0){iA(f,k,0,0);i=g;return}l=f+164|0;m=f+162|0;b[m>>1]=b[l>>1]|0;n=k&16777215;k=n+1|0;o=f+36|0;if(k>>>0<(c[o>>2]|0)>>>0){p=c[f+32>>2]|0;q=d[p+n|0]<<8|d[p+k|0]}else{q=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[l>>1]=q;q=f+336|0;if((a[q]|0)!=0){iy(f);i=g;return}c[j>>2]=(c[j>>2]|0)+2;n=f+152|0;c[n>>2]=(c[n>>2]|0)+2;k=e[m>>1]|0;if((k&33544|0)!=0){p=f+372|0;c[p>>2]=(c[p>>2]|0)+2;iB(f);i=g;return}p=(k&2048|0)!=0;r=k&7;s=b[f+160>>1]&63;if((b5[c[20600+(s<<2)>>2]&127](f,s,4093,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}s=c[h>>2]|0;h=0;t=f+88+((k>>>12&7)<<2)|0;u=c[t>>2]|0;v=0;if(p){w=(s&-2147483648|0)==0&(h&0|0)==0;x=(u&-2147483648|0)==0&(v&0|0)==0;y=x?v:v|-1;z=x?u:u|0;A=w?h:h|-1;B=w?s:s|0}else{y=v;z=u;A=h;B=s}s=wc(z,y,B,A)|0;A=s;B=G;y=B;c[t>>2]=A;do{if((k&1024|0)==0){t=f+166|0;z=b[t>>1]|0;h=(y|0)<0?z|8:z&-9;z=(B|s|0)==0?h|4:h&-5;b[t>>1]=z;if((y|0)==((p&(A|0)<0)<<31>>31|0)){h=z&-3;b[t>>1]=h;C=h;break}else{h=z|2;b[t>>1]=h;C=h;break}}else{c[f+88+(r<<2)>>2]=y;h=f+166|0;t=b[h>>1]|0;z=(y|0)<0?t|8:t&-9;t=((B|s|0)==0?z|4:z&-7)&-3;b[h>>1]=t;C=t}}while(0);s=f+372|0;c[s>>2]=(c[s>>2]|0)+74;b[f+166>>1]=C&-2;C=c[j>>2]|0;if((C&1|0)!=0){iA(f,C,0,0);i=g;return}b[m>>1]=b[l>>1]|0;m=C&16777215;C=m+1|0;if(C>>>0<(c[o>>2]|0)>>>0){o=c[f+32>>2]|0;D=d[o+m|0]<<8|d[o+C|0]}else{D=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[l>>1]=D;if((a[q]|0)==0){c[j>>2]=(c[j>>2]|0)+2;c[n>>2]=(c[n>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}function lw(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;g=i;i=i+8|0;h=g|0;j=f+156|0;k=c[j>>2]|0;if((k&1|0)!=0){iA(f,k,0,0);i=g;return}l=f+164|0;m=f+162|0;b[m>>1]=b[l>>1]|0;n=k&16777215;k=n+1|0;o=f+36|0;if(k>>>0<(c[o>>2]|0)>>>0){p=c[f+32>>2]|0;q=d[p+n|0]<<8|d[p+k|0]}else{q=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[l>>1]=q;q=f+336|0;if((a[q]|0)!=0){iy(f);i=g;return}c[j>>2]=(c[j>>2]|0)+2;n=f+152|0;c[n>>2]=(c[n>>2]|0)+2;k=e[m>>1]|0;if((k&33544|0)!=0){p=f+372|0;c[p>>2]=(c[p>>2]|0)+2;iB(f);i=g;return}p=(k&2048|0)!=0;r=k>>>12&7;s=k&7;t=b[f+160>>1]&63;if((b5[c[20600+(t<<2)>>2]&127](f,t,4093,32)|0)!=0){i=g;return}if((mK(f,h)|0)!=0){i=g;return}t=f+88+(r<<2)|0;u=c[t>>2]|0;v=c[h>>2]|0;if((v|0)==0){iC(f);i=g;return}if(p){if((v|0)<0){w=-v|0;c[h>>2]=w;x=w}else{x=v}y=v>>>31;z=u>>>31;A=(u|0)<0?-u|0:u;B=x}else{y=0;z=0;A=u;B=v}L4884:do{if((k&1024|0)==0){C=(A>>>0)/(B>>>0)|0;D=(A>>>0)%(B>>>0)|0;E=z;F=3803}else{v=c[f+88+(s<<2)>>2]|0;do{if(p){x=v>>>31;if((v|0)>=0){H=x;I=v;J=u;break}H=x;I=((u|0)==0)+~v|0;J=-u|0}else{H=z;I=v;J=u}}while(0);v=J|0;x=I|0;w=B;h=0;K=wd(v,x,w,h)|0;L=G;M=K;N=we(v,x,w,h)|0;h=N;do{if(p){N=0;if(L>>>0>N>>>0|L>>>0==N>>>0&K>>>0>-2147483648>>>0){break}if(!((K|0)==(-2147483648|0)&(L|0)==0&(y|0)==(H|0))){C=M;D=h;E=H;F=3803;break L4884}}else{N=1;if(L>>>0<N>>>0|L>>>0==N>>>0&K>>>0<0>>>0){C=M;D=h;E=H;F=3803;break L4884}}}while(0);h=f+166|0;b[h>>1]=b[h>>1]|2}}while(0);if((F|0)==3803){F=(y|0)==(E|0)?C:-C|0;c[t>>2]=F;if((s|0)!=(r|0)){c[f+88+(s<<2)>>2]=(E|0)==0?D:-D|0}l9(f,15,F)}F=f+372|0;c[F>>2]=(c[F>>2]|0)+144;F=c[j>>2]|0;if((F&1|0)!=0){iA(f,F,0,0);i=g;return}b[m>>1]=b[l>>1]|0;m=F&16777215;F=m+1|0;if(F>>>0<(c[o>>2]|0)>>>0){o=c[f+32>>2]|0;O=d[o+m|0]<<8|d[o+F|0]}else{O=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[l>>1]=O;if((a[q]|0)==0){c[j>>2]=(c[j>>2]|0)+2;c[n>>2]=(c[n>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}function lx(a){a=a|0;var b=0;b=e[a+160>>1]|0;if(((b&63)-58|0)>>>0<3){ln(a,1);return}if((b&56|0)==8){iO(a,1);return}else{iP(a,1);return}}function ly(a){a=a|0;var b=0;b=e[a+160>>1]|0;if(((b&63)-58|0)>>>0<3){ln(a,0);return}if((b&56|0)==8){iO(a,0);return}else{iP(a,0);return}}function lz(a){a=a|0;var b=0,c=0;b=e[a+166>>1]|0;if((b&1|0)==0){c=b>>>2&1^1}else{c=0}b=e[a+160>>1]|0;if(((b&63)-58|0)>>>0<3){ln(a,c);return}if((b&56|0)==8){iO(a,c);return}else{iP(a,c);return}}function lA(a){a=a|0;var b=0,c=0;b=e[a+166>>1]|0;if((b&1|0)==0){c=b>>>2&1}else{c=1}b=e[a+160>>1]|0;if(((b&63)-58|0)>>>0<3){ln(a,c);return}if((b&56|0)==8){iO(a,c);return}else{iP(a,c);return}}function lB(a){a=a|0;var c=0,d=0;c=(b[a+166>>1]&1^1)&65535;d=e[a+160>>1]|0;if(((d&63)-58|0)>>>0<3){ln(a,c);return}if((d&56|0)==8){iO(a,c);return}else{iP(a,c);return}}function lC(a){a=a|0;var c=0,d=0;c=b[a+166>>1]&1;d=e[a+160>>1]|0;if(((d&63)-58|0)>>>0<3){ln(a,c);return}if((d&56|0)==8){iO(a,c);return}else{iP(a,c);return}}function lD(a){a=a|0;var b=0,c=0;b=((e[a+166>>1]|0)>>>2&1^1)&65535;c=e[a+160>>1]|0;if(((c&63)-58|0)>>>0<3){ln(a,b);return}if((c&56|0)==8){iO(a,b);return}else{iP(a,b);return}}function lE(a){a=a|0;var b=0,c=0;b=(e[a+166>>1]|0)>>>2&1;c=e[a+160>>1]|0;if(((c&63)-58|0)>>>0<3){ln(a,b);return}if((c&56|0)==8){iO(a,b);return}else{iP(a,b);return}}function lF(a){a=a|0;var b=0,c=0;b=((e[a+166>>1]|0)>>>1&1^1)&65535;c=e[a+160>>1]|0;if(((c&63)-58|0)>>>0<3){ln(a,b);return}if((c&56|0)==8){iO(a,b);return}else{iP(a,b);return}}function lG(a){a=a|0;var b=0,c=0;b=(e[a+166>>1]|0)>>>1&1;c=e[a+160>>1]|0;if(((c&63)-58|0)>>>0<3){ln(a,b);return}if((c&56|0)==8){iO(a,b);return}else{iP(a,b);return}}function lH(a){a=a|0;var b=0,c=0;b=((e[a+166>>1]|0)>>>3&1^1)&65535;c=e[a+160>>1]|0;if(((c&63)-58|0)>>>0<3){ln(a,b);return}if((c&56|0)==8){iO(a,b);return}else{iP(a,b);return}}function lI(a){a=a|0;var b=0,c=0;b=(e[a+166>>1]|0)>>>3&1;c=e[a+160>>1]|0;if(((c&63)-58|0)>>>0<3){ln(a,b);return}if((c&56|0)==8){iO(a,b);return}else{iP(a,b);return}}function lJ(a){a=a|0;var b=0,c=0;b=e[a+166>>1]|0;c=(b>>>3^b>>>1)&1^1;b=e[a+160>>1]|0;if(((b&63)-58|0)>>>0<3){ln(a,c);return}if((b&56|0)==8){iO(a,c);return}else{iP(a,c);return}}function lK(a){a=a|0;var b=0,c=0;b=e[a+166>>1]|0;c=(b>>>3^b>>>1)&1;b=e[a+160>>1]|0;if(((b&63)-58|0)>>>0<3){ln(a,c);return}if((b&56|0)==8){iO(a,c);return}else{iP(a,c);return}}function lL(a){a=a|0;var b=0,c=0;b=e[a+166>>1]|0;if(((b>>>3^b>>>1)&1|0)==0){c=b>>>2&1^1}else{c=0}b=e[a+160>>1]|0;if(((b&63)-58|0)>>>0<3){ln(a,c);return}if((b&56|0)==8){iO(a,c);return}else{iP(a,c);return}}function lM(a){a=a|0;var b=0,c=0;b=e[a+166>>1]|0;if(((b>>>3^b>>>1)&1|0)==0){c=b>>>2&1}else{c=1}b=e[a+160>>1]|0;if(((b&63)-58|0)>>>0<3){ln(a,c);return}if((b&56|0)==8){iO(a,c);return}else{iP(a,c);return}}function lN(a){a=a|0;mf(a,1);return}function lO(d){d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;e=b[d+160>>1]&255;if((e|0)==255){f=(c[d+152>>2]|0)+6|0}else if((e|0)==0){f=(c[d+152>>2]|0)+4|0}else{f=(c[d+152>>2]|0)+2|0}e=d+148|0;g=(c[e>>2]|0)-4|0;h=g&16777215;i=h+3|0;if(i>>>0<(c[d+36>>2]|0)>>>0){j=d+32|0;a[(c[j>>2]|0)+h|0]=f>>>24&255;a[(c[j>>2]|0)+(h+1)|0]=f>>>16&255;a[(c[j>>2]|0)+(h+2)|0]=f>>>8&255;a[(c[j>>2]|0)+i|0]=f&255;c[e>>2]=g;mf(d,1);return}else{b3[c[d+28>>2]&63](c[d+4>>2]|0,h,f);c[e>>2]=g;mf(d,1);return}}function lP(a){a=a|0;var b=0,c=0;b=e[a+166>>1]|0;if((b&1|0)==0){c=b>>>2&1^1}else{c=0}mf(a,c);return}function lQ(a){a=a|0;var b=0,c=0;b=e[a+166>>1]|0;if((b&1|0)==0){c=b>>>2&1}else{c=1}mf(a,c);return}function lR(a){a=a|0;mf(a,(b[a+166>>1]&1^1)&65535);return}function lS(a){a=a|0;mf(a,b[a+166>>1]&1);return}function lT(a){a=a|0;mf(a,((e[a+166>>1]|0)>>>2&1^1)&65535);return}function lU(a){a=a|0;mf(a,(e[a+166>>1]|0)>>>2&1);return}function lV(a){a=a|0;mf(a,((e[a+166>>1]|0)>>>1&1^1)&65535);return}function lW(a){a=a|0;mf(a,(e[a+166>>1]|0)>>>1&1);return}function lX(a){a=a|0;mf(a,((e[a+166>>1]|0)>>>3&1^1)&65535);return}function lY(a){a=a|0;mf(a,(e[a+166>>1]|0)>>>3&1);return}function lZ(a){a=a|0;var b=0;b=e[a+166>>1]|0;mf(a,(b>>>3^b>>>1)&1^1);return}function l_(a){a=a|0;var b=0;b=e[a+166>>1]|0;mf(a,(b>>>3^b>>>1)&1);return}function l$(a){a=a|0;var b=0,c=0;b=e[a+166>>1]|0;if(((b>>>3^b>>>1)&1|0)!=0){c=0;mf(a,c);return}c=b>>>2&1^1;mf(a,c);return}function l0(a){a=a|0;var b=0,c=0;b=e[a+166>>1]|0;if(((b>>>3^b>>>1)&1|0)!=0){c=1;mf(a,c);return}c=b>>>2&1;mf(a,c);return}function l1(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;if((md(e,g,2021)|0)!=0){h=e+372|0;c[h>>2]=(c[h>>2]|0)+2;iB(e);i=f;return}l9(e,15,c[g>>2]<<32-(c[e+352>>2]|0));g=e+156|0;h=c[g>>2]|0;if((h&1|0)!=0){iA(e,h,0,0);i=f;return}j=e+164|0;b[e+162>>1]=b[j>>1]|0;k=h&16777215;h=k+1|0;if(h>>>0<(c[e+36>>2]|0)>>>0){l=c[e+32>>2]|0;m=d[l+k|0]<<8|d[l+h|0]}else{m=b6[c[e+12>>2]&63](c[e+4>>2]|0,k)|0}b[j>>1]=m;if((a[e+336|0]|0)==0){c[g>>2]=(c[g>>2]|0)+2;g=e+152|0;c[g>>2]=(c[g>>2]|0)+2;i=f;return}else{iy(e);i=f;return}}function l2(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g|0;if((md(f,h,2021)|0)!=0){j=f+372|0;c[j>>2]=(c[j>>2]|0)+2;iB(f);i=g;return}j=f+162|0;k=(e[j>>1]|0)>>>12&7;l=32-(c[f+352>>2]|0)|0;m=-1>>>(l>>>0)&c[h>>2];c[h>>2]=m;l9(f,15,m<<l);c[f+88+(k<<2)>>2]=m;m=f+156|0;k=c[m>>2]|0;if((k&1|0)!=0){iA(f,k,0,0);i=g;return}l=f+164|0;b[j>>1]=b[l>>1]|0;j=k&16777215;k=j+1|0;if(k>>>0<(c[f+36>>2]|0)>>>0){h=c[f+32>>2]|0;n=d[h+j|0]<<8|d[h+k|0]}else{n=b6[c[f+12>>2]&63](c[f+4>>2]|0,j)|0}b[l>>1]=n;if((a[f+336|0]|0)==0){c[m>>2]=(c[m>>2]|0)+2;m=f+152|0;c[m>>2]=(c[m>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}function l3(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;if((md(e,g,485)|0)!=0){h=e+372|0;c[h>>2]=(c[h>>2]|0)+2;iB(e);i=f;return}h=c[g>>2]|0;if((me(e,~h)|0)!=0){g=e+372|0;c[g>>2]=(c[g>>2]|0)+2;iB(e);i=f;return}l9(e,15,h<<32-(c[e+352>>2]|0));h=e+156|0;g=c[h>>2]|0;if((g&1|0)!=0){iA(e,g,0,0);i=f;return}j=e+164|0;b[e+162>>1]=b[j>>1]|0;k=g&16777215;g=k+1|0;if(g>>>0<(c[e+36>>2]|0)>>>0){l=c[e+32>>2]|0;m=d[l+k|0]<<8|d[l+g|0]}else{m=b6[c[e+12>>2]&63](c[e+4>>2]|0,k)|0}b[j>>1]=m;if((a[e+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=e+152|0;c[h>>2]=(c[h>>2]|0)+2;i=f;return}else{iy(e);i=f;return}}function l4(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+8|0;h=g|0;if((md(f,h,2021)|0)!=0){j=f+372|0;c[j>>2]=(c[j>>2]|0)+2;iB(f);i=g;return}j=f+162|0;k=(e[j>>1]|0)>>>12&7;l=32-(c[f+352>>2]|0)|0;m=-1>>>(l>>>0);n=c[h>>2]|0;if((-2147483648>>>(l>>>0)&n|0)==0){o=m&n}else{o=n|~m}c[h>>2]=o;l9(f,15,o<<l);c[f+88+(k<<2)>>2]=o;o=f+156|0;k=c[o>>2]|0;if((k&1|0)!=0){iA(f,k,0,0);i=g;return}l=f+164|0;b[j>>1]=b[l>>1]|0;j=k&16777215;k=j+1|0;if(k>>>0<(c[f+36>>2]|0)>>>0){h=c[f+32>>2]|0;p=d[h+j|0]<<8|d[h+k|0]}else{p=b6[c[f+12>>2]&63](c[f+4>>2]|0,j)|0}b[l>>1]=p;if((a[f+336|0]|0)==0){c[o>>2]=(c[o>>2]|0)+2;o=f+152|0;c[o>>2]=(c[o>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}function l5(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;if((md(e,g,485)|0)!=0){h=e+372|0;c[h>>2]=(c[h>>2]|0)+2;iB(e);i=f;return}if((me(e,0)|0)!=0){h=e+372|0;c[h>>2]=(c[h>>2]|0)+2;iB(e);i=f;return}l9(e,15,c[g>>2]<<32-(c[e+352>>2]|0));g=e+156|0;h=c[g>>2]|0;if((h&1|0)!=0){iA(e,h,0,0);i=f;return}j=e+164|0;b[e+162>>1]=b[j>>1]|0;k=h&16777215;h=k+1|0;if(h>>>0<(c[e+36>>2]|0)>>>0){l=c[e+32>>2]|0;m=d[l+k|0]<<8|d[l+h|0]}else{m=b6[c[e+12>>2]&63](c[e+4>>2]|0,k)|0}b[j>>1]=m;if((a[e+336|0]|0)==0){c[g>>2]=(c[g>>2]|0)+2;g=e+152|0;c[g>>2]=(c[g>>2]|0)+2;i=f;return}else{iy(e);i=f;return}}function l6(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;if((md(e,g,485)|0)!=0){h=e+372|0;c[h>>2]=(c[h>>2]|0)+2;iB(e);i=f;return}if((me(e,-1)|0)!=0){h=e+372|0;c[h>>2]=(c[h>>2]|0)+2;iB(e);i=f;return}l9(e,15,c[g>>2]<<32-(c[e+352>>2]|0));g=e+156|0;h=c[g>>2]|0;if((h&1|0)!=0){iA(e,h,0,0);i=f;return}j=e+164|0;b[e+162>>1]=b[j>>1]|0;k=h&16777215;h=k+1|0;if(h>>>0<(c[e+36>>2]|0)>>>0){l=c[e+32>>2]|0;m=d[l+k|0]<<8|d[l+h|0]}else{m=b6[c[e+12>>2]&63](c[e+4>>2]|0,k)|0}b[j>>1]=m;if((a[e+336|0]|0)==0){c[g>>2]=(c[g>>2]|0)+2;g=e+152|0;c[g>>2]=(c[g>>2]|0)+2;i=f;return}else{iy(e);i=f;return}}function l7(a,c,d){a=a|0;c=c|0;d=d|0;var f=0;if(d<<24>>24==0){f=4}else{f=d<<24>>24<0?8:0}d=c&255;c=a+166|0;b[c>>1]=((e[c>>1]|0)&(d^65535)|f&d)&65535;return}function l8(a,c,d){a=a|0;c=c|0;d=d|0;var f=0;if(d<<16>>16==0){f=4}else{f=d<<16>>16<0?8:0}d=c&255;c=a+166|0;b[c>>1]=((e[c>>1]|0)&(d^65535)|f&d)&65535;return}function l9(a,c,d){a=a|0;c=c|0;d=d|0;var f=0;if((d|0)==0){f=4}else{f=d>>31&8}d=c&255;c=a+166|0;b[c>>1]=((e[c>>1]|0)&(d^65535)|f&d)&65535;return}function ma(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=a+166|0;a=b[f>>1]|0;g=c<<24>>24==0?a|4:a&-5;b[f>>1]=g;a=(d&255)>>>7;d=(e&255)>>>7;do{if(c<<24>>24>-1){e=(d|a|0)==0?0:17;if((d&a|0)==0){h=e;break}h=e|2}else{e=(d&a|0)==0?8:25;if((d|a|0)!=0){h=e;break}h=e|2}}while(0);b[f>>1]=g&-28|h;return}function mb(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=a+166|0;a=b[f>>1]|0;g=c<<16>>16==0?a|4:a&-5;b[f>>1]=g;a=(d&65535)>>>15;d=(e&65535)>>>15;do{if(c<<16>>16>-1){e=(d|a|0)==0?0:17;if((d&a|0)==0){h=e;break}h=e|2}else{e=(d&a|0)==0?8:25;if((d|a|0)!=0){h=e;break}h=e|2}}while(0);b[f>>1]=g&-28|h;return}function mc(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g|0;if((md(f,h,2021)|0)!=0){j=f+372|0;c[j>>2]=(c[j>>2]|0)+2;iB(f);i=g;return}j=f+162|0;k=c[f+88+(((e[j>>1]|0)>>>12&7)<<2)>>2]|0;c[h>>2]=k;if((me(f,k)|0)!=0){h=f+372|0;c[h>>2]=(c[h>>2]|0)+2;iB(f);i=g;return}l9(f,15,k<<32-(c[f+352>>2]|0));k=f+156|0;h=c[k>>2]|0;if((h&1|0)!=0){iA(f,h,0,0);i=g;return}l=f+164|0;b[j>>1]=b[l>>1]|0;j=h&16777215;h=j+1|0;if(h>>>0<(c[f+36>>2]|0)>>>0){m=c[f+32>>2]|0;n=d[m+j|0]<<8|d[m+h|0]}else{n=b6[c[f+12>>2]&63](c[f+4>>2]|0,j)|0}b[l>>1]=n;if((a[f+336|0]|0)==0){c[k>>2]=(c[k>>2]|0)+2;k=f+152|0;c[k>>2]=(c[k>>2]|0)+2;i=g;return}else{iy(f);i=g;return}}function md(e,f,g){e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;h=e+156|0;i=c[h>>2]|0;if((i&1|0)!=0){iA(e,i,0,0);j=1;return j|0}k=e+164|0;l=e+162|0;b[l>>1]=b[k>>1]|0;m=i&16777215;i=m+1|0;n=e+36|0;if(i>>>0<(c[n>>2]|0)>>>0){o=c[e+32>>2]|0;p=d[o+m|0]<<8|d[o+i|0]}else{p=b6[c[e+12>>2]&63](c[e+4>>2]|0,m)|0}b[k>>1]=p;if((a[e+336|0]|0)!=0){iy(e);j=1;return j|0}c[h>>2]=(c[h>>2]|0)+2;h=e+152|0;c[h>>2]=(c[h>>2]|0)+2;h=b[l>>1]|0;l=h&65535;p=l>>>6;if((l&2048|0)==0){q=p&31}else{q=c[e+88+((p&7)<<2)>>2]|0}if((h&32)==0){r=l}else{r=c[e+88+((l&7)<<2)>>2]|0}l=r&31;r=(l|0)==0?32:l;l=b[e+160>>1]&63;if((b5[c[20600+(l<<2)>>2]&127](e,l,g,8)|0)!=0){j=1;return j|0}g=e+348|0;c[g>>2]=q;l=e+352|0;c[l>>2]=r;h=c[e+340>>2]|0;do{if((h|0)==2){p=c[e+344>>2]|0;k=q>>>3;c[f>>2]=0;m=c[l>>2]|0;if((m|0)==0){break}i=e+32|0;o=e+8|0;s=e+4|0;t=m;m=e+356|0;u=((q|0)<0?k|-536870912:k)+p|0;p=c[g>>2]|0;while(1){k=p&7;v=8-k|0;w=v>>>0>t>>>0?t:v;x=v-w|0;v=u&16777215;if(v>>>0<(c[n>>2]|0)>>>0){y=a[(c[i>>2]|0)+v|0]|0}else{y=b6[c[o>>2]&63](c[s>>2]|0,v)|0}a[m]=y;c[f>>2]=(255<<x&255>>>(k>>>0)&(y&255))>>>(x>>>0)|c[f>>2]<<w;if((t|0)==(w|0)){break}else{t=t-w|0;m=m+1|0;u=u+1|0;p=w+k|0}}}else if((h|0)==1){p=c[e+88+((c[e+344>>2]&7)<<2)>>2]|0;u=q+r&31;if((u|0)==0){z=p}else{z=p>>>((32-u|0)>>>0)|p<<u}c[f>>2]=z}else{j=1;return j|0}}while(0);z=e+372|0;c[z>>2]=(c[z>>2]|0)+18;j=0;return j|0}function me(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;f=c[b+340>>2]|0;if((f|0)==1){g=b+88+((c[b+344>>2]&7)<<2)|0;h=32-(c[b+352>>2]|0)|0;i=-1>>>(h>>>0);j=h-(c[b+348>>2]|0)&31;if((j|0)==0){k=i;l=e}else{h=32-j|0;k=i>>>(h>>>0)|i<<j;l=e>>>(h>>>0)|e<<j}c[g>>2]=c[g>>2]&~k|k&l;m=0;return m|0}else if((f|0)==2){f=c[b+348>>2]|0;l=f>>>3;k=c[b+352>>2]|0;if((k|0)==0){m=0;return m|0}g=b+36|0;j=b+32|0;h=b+20|0;i=b+4|0;n=k;k=b+356|0;o=(c[b+344>>2]|0)+((f|0)<0?l|-536870912:l)|0;l=f;while(1){f=l&7;b=8-f|0;p=b>>>0>n>>>0?n:b;q=b-p|0;b=255<<q&255>>>(f>>>0);r=n-p|0;s=((b^255)&(d[k]|0)|e>>>((r-q|0)>>>0)&b)&255;b=o&16777215;if(b>>>0<(c[g>>2]|0)>>>0){a[(c[j>>2]|0)+b|0]=s}else{b3[c[h>>2]&63](c[i>>2]|0,b,s)}if((n|0)==(p|0)){m=0;break}else{n=r;k=k+1|0;o=o+1|0;l=p+f|0}}return m|0}else{m=1;return m|0}return 0}function mf(f,g){f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;h=f+152|0;i=(c[h>>2]|0)+2|0;j=f+160|0;k=e[j>>1]|0;l=(k&128|0)!=0?k|-256:k&255;do{if((l|0)==0){k=f+156|0;m=c[k>>2]|0;if((m&1|0)!=0){iA(f,m,0,0);return}n=f+164|0;o=f+162|0;b[o>>1]=b[n>>1]|0;p=m&16777215;m=p+1|0;if(m>>>0<(c[f+36>>2]|0)>>>0){q=c[f+32>>2]|0;r=d[q+p|0]<<8|d[q+m|0]}else{r=b6[c[f+12>>2]&63](c[f+4>>2]|0,p)|0}b[n>>1]=r;if((a[f+336|0]|0)==0){c[k>>2]=(c[k>>2]|0)+2;c[h>>2]=(c[h>>2]|0)+2;k=e[o>>1]|0;s=(k&32768|0)!=0?k|-65536:k;break}iy(f);return}else{if((l&255|0)!=255){s=l;break}k=f+156|0;o=c[k>>2]|0;if((o&1|0)!=0){iA(f,o,0,0);return}n=f+164|0;p=f+162|0;b[p>>1]=b[n>>1]|0;m=o&16777215;o=m+1|0;q=f+36|0;if(o>>>0<(c[q>>2]|0)>>>0){t=c[f+32>>2]|0;u=d[t+m|0]<<8|d[t+o|0]}else{u=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[n>>1]=u;m=f+336|0;if((a[m]|0)!=0){iy(f);return}o=(c[k>>2]|0)+2|0;c[k>>2]=o;c[h>>2]=(c[h>>2]|0)+2;t=b[p>>1]|0;if((o&1|0)!=0){iA(f,o,0,0);return}b[p>>1]=u;v=o&16777215;o=v+1|0;do{if(o>>>0<(c[q>>2]|0)>>>0){w=c[f+32>>2]|0;b[n>>1]=d[w+v|0]<<8|d[w+o|0]}else{w=b6[c[f+12>>2]&63](c[f+4>>2]|0,v)|0;x=(a[m]|0)==0;b[n>>1]=w;if(x){break}iy(f);return}}while(0);c[k>>2]=(c[k>>2]|0)+2;c[h>>2]=(c[h>>2]|0)+2;s=e[p>>1]|(t&65535)<<16}}while(0);do{if((g|0)==0){u=f+372|0;c[u>>2]=((b[j>>1]&255)==0?12:8)+(c[u>>2]|0);y=c[f+156>>2]|0}else{u=f+372|0;c[u>>2]=(c[u>>2]|0)+10;u=i+s|0;l=f+156|0;c[l>>2]=u;if((u&1|0)!=0){iA(f,u,0,0);return}r=f+164|0;b[f+162>>1]=b[r>>1]|0;n=u&16777215;u=n+1|0;if(u>>>0<(c[f+36>>2]|0)>>>0){m=c[f+32>>2]|0;z=d[m+n|0]<<8|d[m+u|0]}else{z=b6[c[f+12>>2]&63](c[f+4>>2]|0,n)|0}b[r>>1]=z;if((a[f+336|0]|0)==0){r=(c[l>>2]|0)+2|0;c[l>>2]=r;c[h>>2]=(c[h>>2]|0)+2;y=r;break}iy(f);return}}while(0);z=f+156|0;if((y&1|0)!=0){iA(f,y,0,0);return}s=f+164|0;b[f+162>>1]=b[s>>1]|0;i=y&16777215;y=i+1|0;if(y>>>0<(c[f+36>>2]|0)>>>0){j=c[f+32>>2]|0;A=d[j+i|0]<<8|d[j+y|0]}else{A=b6[c[f+12>>2]&63](c[f+4>>2]|0,i)|0}b[s>>1]=A;if((a[f+336|0]|0)==0){A=c[z>>2]|0;c[z>>2]=A+2;c[h>>2]=A-2;return}else{iy(f);return}}function mg(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=a+166|0;a=b[f>>1]|0;g=(c|0)==0?a|4:a&-5;b[f>>1]=g;a=d>>>31;d=e>>>31;do{if((c|0)>-1){e=(d|a|0)==0?0:17;if((d&a|0)==0){h=e;break}h=e|2}else{e=(d&a|0)==0?8:25;if((d|a|0)!=0){h=e;break}h=e|2}}while(0);b[f>>1]=g&-28|h;return}function mh(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var f=0,g=0;f=(d&255)>>>7;d=(e&255)>>>7;do{if(c<<24>>24>-1){e=(d|f|0)==0?0:17;if((d&f|0)==0){g=e;break}g=e|2}else{e=(d&f|0)==0?8:25;if((d|f|0)!=0){g=e;break}g=e|2}}while(0);f=a+166|0;a=b[f>>1]&-28|g;b[f>>1]=c<<24>>24==0?a:a&-5;return}function mi(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var f=0,g=0;f=(d&65535)>>>15;d=(e&65535)>>>15;do{if(c<<16>>16>-1){e=(d|f|0)==0?0:17;if((d&f|0)==0){g=e;break}g=e|2}else{e=(d&f|0)==0?8:25;if((d|f|0)!=0){g=e;break}g=e|2}}while(0);f=a+166|0;a=b[f>>1]&-28|g;b[f>>1]=c<<16>>16==0?a:a&-5;return}function mj(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var f=0,g=0;f=d>>>31;d=e>>>31;do{if((c|0)>-1){e=(d|f|0)==0?0:17;if((d&f|0)==0){g=e;break}g=e|2}else{e=(d&f|0)==0?8:25;if((d|f|0)!=0){g=e;break}g=e|2}}while(0);f=a+166|0;a=b[f>>1]&-28|g;b[f>>1]=(c|0)==0?a:a&-5;return}function mk(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var f=0,g=0;f=d<<24>>24<0;d=e<<24>>24>-1;do{if(c<<24>>24>-1){e=f&d?17:0;if(f|d){g=e;break}g=e|2}else{e=f|d?25:8;if(!(f&d)){g=e;break}g=e|2}}while(0);d=a+166|0;a=b[d>>1]&-16|g&15;b[d>>1]=c<<24>>24==0?a|4:a;return}function ml(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var f=0,g=0;f=d<<16>>16<0;d=e<<16>>16>-1;do{if(c<<16>>16>-1){e=f&d?17:0;if(f|d){g=e;break}g=e|2}else{e=f|d?25:8;if(!(f&d)){g=e;break}g=e|2}}while(0);d=a+166|0;a=b[d>>1]&-16|g&15;b[d>>1]=c<<16>>16==0?a|4:a;return}function mm(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var f=0,g=0;f=(d|0)<0;d=(e|0)>-1;do{if((c|0)>-1){e=f&d?17:0;if(f|d){g=e;break}g=e|2}else{e=f|d?25:8;if(!(f&d)){g=e;break}g=e|2}}while(0);d=a+166|0;a=b[d>>1]&-16|g&15;b[d>>1]=(c|0)==0?a|4:a;return}function mn(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var f=0,g=0;f=d<<24>>24<0;d=e<<24>>24>-1;do{if(c<<24>>24>-1){e=f&d?17:0;if(f|d){g=e;break}g=e|2}else{e=f|d?25:8;if(!(f&d)){g=e;break}g=e|2}}while(0);d=a+166|0;a=b[d>>1]&-32|g&31;b[d>>1]=c<<24>>24==0?a|4:a;return}function mo(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var f=0,g=0;f=d<<16>>16<0;d=e<<16>>16>-1;do{if(c<<16>>16>-1){e=f&d?17:0;if(f|d){g=e;break}g=e|2}else{e=f|d?25:8;if(!(f&d)){g=e;break}g=e|2}}while(0);d=a+166|0;a=b[d>>1]&-32|g&31;b[d>>1]=c<<16>>16==0?a|4:a;return}function mp(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var f=0,g=0;f=(d|0)<0;d=(e|0)>-1;do{if((c|0)>-1){e=f&d?17:0;if(f|d){g=e;break}g=e|2}else{e=f|d?25:8;if(!(f&d)){g=e;break}g=e|2}}while(0);d=a+166|0;a=b[d>>1]&-32|g&31;b[d>>1]=(c|0)==0?a|4:a;return}function mq(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var f=0,g=0;f=d<<24>>24<0;d=e<<24>>24>-1;do{if(c<<24>>24>-1){e=f&d?17:0;if(f|d){g=e;break}g=e|2}else{e=f|d?25:8;if(!(f&d)){g=e;break}g=e|2}}while(0);d=a+166|0;a=b[d>>1]&-28|g&27;b[d>>1]=c<<24>>24==0?a:a&-5;return}function mr(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var f=0,g=0;f=d<<16>>16<0;d=e<<16>>16>-1;do{if(c<<16>>16>-1){e=f&d?17:0;if(f|d){g=e;break}g=e|2}else{e=f|d?25:8;if(!(f&d)){g=e;break}g=e|2}}while(0);d=a+166|0;a=b[d>>1]&-28|g&27;b[d>>1]=c<<16>>16==0?a:a&-5;return}function ms(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var f=0,g=0;f=(d|0)<0;d=(e|0)>-1;do{if((c|0)>-1){e=f&d?17:0;if(f|d){g=e;break}g=e|2}else{e=f|d?25:8;if(!(f&d)){g=e;break}g=e|2}}while(0);d=a+166|0;a=b[d>>1]&-28|g&27;b[d>>1]=(c|0)==0?a:a&-5;return}function mt(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;if((d&1|0)==0){iB(a);f=1;return f|0}else{c[a+340>>2]=1;c[a+344>>2]=b&7;f=0;return f|0}return 0}function mu(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;if((d&2|0)==0){iB(a);f=1;return f|0}else{c[a+340>>2]=1;c[a+344>>2]=b&7|8;f=0;return f|0}return 0}function mv(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;if((d&4|0)==0){iB(a);f=1;return f|0}else{c[a+340>>2]=2;c[a+344>>2]=c[a+120+((b&7)<<2)>>2];f=0;return f|0}return 0}function mw(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;if((d&8|0)==0){iB(a);f=1;return f|0}else{c[a+340>>2]=2;d=a+120+((b&7)<<2)|0;b=c[d>>2]|0;c[a+344>>2]=b;c[d>>2]=b+(e>>>3);f=0;return f|0}return 0}function mx(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;if((d&8|0)==0){iB(a);f=1;return f|0}else{c[a+340>>2]=2;d=a+148|0;b=c[d>>2]|0;c[a+344>>2]=b;c[d>>2]=b+((e|0)==8?2:e>>>3);f=0;return f|0}return 0}function my(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;if((d&16|0)==0){iB(a);f=1;return f|0}else{c[a+340>>2]=2;d=a+120+((b&7)<<2)|0;b=(c[d>>2]|0)-(e>>>3)|0;c[a+344>>2]=b;c[d>>2]=b;b=a+372|0;c[b>>2]=(c[b>>2]|0)+2;f=0;return f|0}return 0}function mz(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;if((d&16|0)==0){iB(a);f=1;return f|0}else{c[a+340>>2]=2;d=a+148|0;b=(c[d>>2]|0)-((e|0)==8?2:e>>>3)|0;c[a+344>>2]=b;c[d>>2]=b;b=a+372|0;c[b>>2]=(c[b>>2]|0)+2;f=0;return f|0}return 0}function mA(f,g,h,i){f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0;if((h&32|0)==0){iB(f);j=1;return j|0}h=f+156|0;i=c[h>>2]|0;if((i&1|0)!=0){iA(f,i,0,0);j=1;return j|0}k=f+164|0;l=f+162|0;b[l>>1]=b[k>>1]|0;m=i&16777215;i=m+1|0;if(i>>>0<(c[f+36>>2]|0)>>>0){n=c[f+32>>2]|0;o=d[n+m|0]<<8|d[n+i|0]}else{o=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[k>>1]=o;if((a[f+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=f+152|0;c[h>>2]=(c[h>>2]|0)+2;c[f+340>>2]=2;h=e[l>>1]|0;c[f+344>>2]=((h&32768|0)!=0?h|-65536:h)+(c[f+120+((g&7)<<2)>>2]|0);g=f+372|0;c[g>>2]=(c[g>>2]|0)+4;j=0;return j|0}else{iy(f);j=1;return j|0}return 0}function mB(e,f,g,h){e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if((g&64|0)==0){iB(e);i=1;return i|0}g=e+156|0;h=c[g>>2]|0;if((h&1|0)!=0){iA(e,h,0,0);i=1;return i|0}j=e+164|0;k=e+162|0;b[k>>1]=b[j>>1]|0;l=h&16777215;h=l+1|0;if(h>>>0<(c[e+36>>2]|0)>>>0){m=c[e+32>>2]|0;n=d[m+l|0]<<8|d[m+h|0]}else{n=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[j>>1]=n;if((a[e+336|0]|0)!=0){iy(e);i=1;return i|0}c[g>>2]=(c[g>>2]|0)+2;g=e+152|0;c[g>>2]=(c[g>>2]|0)+2;c[e+340>>2]=2;g=c[e+120+((f&7)<<2)>>2]|0;f=e+344|0;c[f>>2]=g;n=b[k>>1]|0;do{if((c[e>>2]&4|0)==0){o=0}else{k=n&65535;if((k&256|0)==0){o=k>>>9&3;break}i=mT(e,k)|0;return i|0}}while(0);k=n&65535;j=((k&128|0)!=0?k|-256:k&255)+g|0;c[f>>2]=j;g=k>>>12&7;if((k&32768|0)==0){p=e+88+(g<<2)|0}else{p=e+120+(g<<2)|0}g=c[p>>2]|0;if((n&2048)==0){q=(g&32768|0)!=0?g|-65536:g&65535}else{q=g}c[f>>2]=j+(q<<o);o=e+372|0;c[o>>2]=(c[o>>2]|0)+6;i=0;return i|0}function mC(f,g,h,i){f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0;if((h&128|0)==0){iB(f);j=1;return j|0}h=f+156|0;i=c[h>>2]|0;if((i&1|0)!=0){iA(f,i,0,0);j=1;return j|0}g=f+164|0;k=f+162|0;b[k>>1]=b[g>>1]|0;l=i&16777215;i=l+1|0;if(i>>>0<(c[f+36>>2]|0)>>>0){m=c[f+32>>2]|0;n=d[m+l|0]<<8|d[m+i|0]}else{n=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[g>>1]=n;if((a[f+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=f+152|0;c[h>>2]=(c[h>>2]|0)+2;c[f+340>>2]=2;h=e[k>>1]|0;c[f+344>>2]=(h&32768|0)!=0?h|-65536:h;h=f+372|0;c[h>>2]=(c[h>>2]|0)+4;j=0;return j|0}else{iy(f);j=1;return j|0}return 0}function mD(f,g,h,i){f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;if((h&256|0)==0){iB(f);j=1;return j|0}h=f+156|0;i=c[h>>2]|0;if((i&1|0)!=0){iA(f,i,0,0);j=1;return j|0}g=f+164|0;k=f+162|0;b[k>>1]=b[g>>1]|0;l=i&16777215;i=l+1|0;m=f+36|0;if(i>>>0<(c[m>>2]|0)>>>0){n=c[f+32>>2]|0;o=d[n+l|0]<<8|d[n+i|0]}else{o=b6[c[f+12>>2]&63](c[f+4>>2]|0,l)|0}b[g>>1]=o;l=f+336|0;if((a[l]|0)!=0){iy(f);j=1;return j|0}i=(c[h>>2]|0)+2|0;c[h>>2]=i;n=f+152|0;c[n>>2]=(c[n>>2]|0)+2;c[f+340>>2]=2;p=f+344|0;c[p>>2]=e[k>>1]|0;if((i&1|0)!=0){iA(f,i,0,0);j=1;return j|0}b[k>>1]=o;o=i&16777215;i=o+1|0;do{if(i>>>0<(c[m>>2]|0)>>>0){q=c[f+32>>2]|0;b[g>>1]=d[q+o|0]<<8|d[q+i|0]}else{q=b6[c[f+12>>2]&63](c[f+4>>2]|0,o)|0;r=(a[l]|0)==0;b[g>>1]=q;if(r){break}iy(f);j=1;return j|0}}while(0);c[h>>2]=(c[h>>2]|0)+2;c[n>>2]=(c[n>>2]|0)+2;c[p>>2]=e[k>>1]|c[p>>2]<<16;p=f+372|0;c[p>>2]=(c[p>>2]|0)+8;j=0;return j|0}function mE(f,g,h,i){f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0;if((h&512|0)==0){iB(f);j=1;return j|0}c[f+340>>2]=2;h=f+156|0;i=c[h>>2]|0;g=f+344|0;c[g>>2]=i-2;if((i&1|0)!=0){iA(f,i,0,0);j=1;return j|0}k=f+164|0;l=f+162|0;b[l>>1]=b[k>>1]|0;m=i&16777215;i=m+1|0;if(i>>>0<(c[f+36>>2]|0)>>>0){n=c[f+32>>2]|0;o=d[n+m|0]<<8|d[n+i|0]}else{o=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[k>>1]=o;if((a[f+336|0]|0)==0){c[h>>2]=(c[h>>2]|0)+2;h=f+152|0;c[h>>2]=(c[h>>2]|0)+2;h=e[l>>1]|0;c[g>>2]=((h&32768|0)!=0?h|-65536:h)+(c[g>>2]|0);g=f+372|0;c[g>>2]=(c[g>>2]|0)+4;j=0;return j|0}else{iy(f);j=1;return j|0}return 0}function mF(e,f,g,h){e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if((g&1024|0)==0){iB(e);i=1;return i|0}c[e+340>>2]=2;g=e+156|0;h=c[g>>2]|0;f=e+344|0;c[f>>2]=h-2;if((h&1|0)!=0){iA(e,h,0,0);i=1;return i|0}j=e+164|0;k=e+162|0;b[k>>1]=b[j>>1]|0;l=h&16777215;h=l+1|0;if(h>>>0<(c[e+36>>2]|0)>>>0){m=c[e+32>>2]|0;n=d[m+l|0]<<8|d[m+h|0]}else{n=b6[c[e+12>>2]&63](c[e+4>>2]|0,l)|0}b[j>>1]=n;if((a[e+336|0]|0)!=0){iy(e);i=1;return i|0}c[g>>2]=(c[g>>2]|0)+2;g=e+152|0;c[g>>2]=(c[g>>2]|0)+2;g=b[k>>1]|0;do{if((c[e>>2]&4|0)==0){o=0}else{k=g&65535;if((k&256|0)==0){o=k>>>9&3;break}i=mT(e,k)|0;return i|0}}while(0);k=g&65535;n=((k&128|0)!=0?k|-256:k&255)+(c[f>>2]|0)|0;c[f>>2]=n;j=k>>>12&7;if((k&32768|0)==0){p=e+88+(j<<2)|0}else{p=e+120+(j<<2)|0}j=c[p>>2]|0;if((g&2048)==0){q=(j&32768|0)!=0?j|-65536:j&65535}else{q=j}c[f>>2]=n+(q<<o);o=e+372|0;c[o>>2]=(c[o>>2]|0)+6;i=0;return i|0}function mG(f,g,h,i){f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;if((h&2048|0)==0){iB(f);j=1;return j|0}h=f+156|0;g=c[h>>2]|0;if((g&1|0)!=0){iA(f,g,0,0);j=1;return j|0}k=f+164|0;l=f+162|0;b[l>>1]=b[k>>1]|0;m=g&16777215;g=m+1|0;n=f+36|0;if(g>>>0<(c[n>>2]|0)>>>0){o=c[f+32>>2]|0;p=d[o+m|0]<<8|d[o+g|0]}else{p=b6[c[f+12>>2]&63](c[f+4>>2]|0,m)|0}b[k>>1]=p;m=f+336|0;if((a[m]|0)!=0){iy(f);j=1;return j|0}g=(c[h>>2]|0)+2|0;c[h>>2]=g;o=f+152|0;c[o>>2]=(c[o>>2]|0)+2;c[f+340>>2]=0;q=e[l>>1]|0;r=f+344|0;c[r>>2]=q;if((i|0)==32){if((g&1|0)!=0){iA(f,g,0,0);j=1;return j|0}b[l>>1]=p;p=g&16777215;g=p+1|0;do{if(g>>>0<(c[n>>2]|0)>>>0){s=c[f+32>>2]|0;b[k>>1]=d[s+p|0]<<8|d[s+g|0]}else{s=b6[c[f+12>>2]&63](c[f+4>>2]|0,p)|0;t=(a[m]|0)==0;b[k>>1]=s;if(t){break}iy(f);j=1;return j|0}}while(0);c[h>>2]=(c[h>>2]|0)+2;c[o>>2]=(c[o>>2]|0)+2;c[r>>2]=e[l>>1]|c[r>>2]<<16;l=f+372|0;c[l>>2]=(c[l>>2]|0)+8;j=0;return j|0}else if((i|0)==16){i=f+372|0;c[i>>2]=(c[i>>2]|0)+4;j=0;return j|0}else{c[r>>2]=q&255;q=f+372|0;c[q>>2]=(c[q>>2]|0)+4;j=0;return j|0}return 0}function mH(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;iB(a);return 1}function mI(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=c[b+340>>2]|0;if((e|0)==1){f=c[b+344>>2]|0;if(f>>>0<8){a[d]=c[b+88+((f&7)<<2)>>2]&255;g=0;return g|0}else{iB(b);g=1;return g|0}}else if((e|0)==2){f=c[b+344>>2]&16777215;if(f>>>0<(c[b+36>>2]|0)>>>0){h=a[(c[b+32>>2]|0)+f|0]|0}else{h=b6[c[b+8>>2]&63](c[b+4>>2]|0,f)|0}a[d]=h;h=b+372|0;c[h>>2]=(c[h>>2]|0)+4;if((a[b+336|0]|0)==0){g=0;return g|0}iy(b);g=1;return g|0}else if((e|0)==0){a[d]=c[b+344>>2]&255;g=0;return g|0}else{iB(b);g=1;return g|0}return 0}function mJ(e,f){e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0;g=c[e+340>>2]|0;if((g|0)==2){h=c[e+344>>2]|0;do{if((h&1|0)!=0){if((c[e>>2]&1|0)!=0){break}iA(e,h,1,0);i=1;return i|0}}while(0);j=h&16777215;h=j+1|0;if(h>>>0<(c[e+36>>2]|0)>>>0){k=c[e+32>>2]|0;l=d[k+j|0]<<8|d[k+h|0]}else{l=b6[c[e+12>>2]&63](c[e+4>>2]|0,j)|0}b[f>>1]=l;l=e+372|0;c[l>>2]=(c[l>>2]|0)+4;if((a[e+336|0]|0)==0){i=0;return i|0}iy(e);i=1;return i|0}else if((g|0)==0){b[f>>1]=c[e+344>>2]&65535;i=0;return i|0}else if((g|0)==1){g=c[e+344>>2]|0;do{if(g>>>0<8){m=e+88+((g&7)<<2)|0}else{if(g>>>0<16){m=e+120+((g&7)<<2)|0;break}iB(e);i=1;return i|0}}while(0);b[f>>1]=c[m>>2]&65535;i=0;return i|0}else{iB(e);i=1;return i|0}return 0}function mK(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0;f=c[b+340>>2]|0;if((f|0)==2){g=c[b+344>>2]|0;do{if((g&1|0)!=0){if((c[b>>2]&1|0)!=0){break}iA(b,g,1,0);h=1;return h|0}}while(0);i=g&16777215;g=i+3|0;if(g>>>0<(c[b+36>>2]|0)>>>0){j=c[b+32>>2]|0;k=((d[j+i|0]<<8|d[j+(i+1)|0])<<8|d[j+(i+2)|0])<<8|d[j+g|0]}else{k=b6[c[b+16>>2]&63](c[b+4>>2]|0,i)|0}c[e>>2]=k;k=b+372|0;c[k>>2]=(c[k>>2]|0)+8;if((a[b+336|0]|0)==0){h=0;return h|0}iy(b);h=1;return h|0}else if((f|0)==1){k=c[b+344>>2]|0;do{if(k>>>0<8){l=b+88+((k&7)<<2)|0}else{if(k>>>0<16){l=b+120+((k&7)<<2)|0;break}iB(b);h=1;return h|0}}while(0);c[e>>2]=c[l>>2];h=0;return h|0}else if((f|0)==0){c[e>>2]=c[b+344>>2];h=0;return h|0}else{iB(b);h=1;return h|0}return 0}function mL(a,b,d){a=a|0;b=b|0;d=d|0;c[a+36>>2]=b;c[a+40>>2]=d;return}function mM(a,b,d){a=a|0;b=b|0;d=d|0;c[a+48>>2]=b;c[a+52>>2]=d;return}function mN(a,b,d){a=a|0;b=b|0;d=d|0;c[a+60>>2]=b;c[a+64>>2]=d;return}function mO(a,b,d){a=a|0;b=b|0;d=d|0;c[a+72>>2]=b;c[a+76>>2]=d;return}function mP(a,b,d){a=a|0;b=b|0;d=d|0;c[a+80>>2]=b;c[a+84>>2]=d;return}function mQ(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=c[b+340>>2]|0;if((e|0)==0){iB(b);f=1;return f|0}else if((e|0)==1){g=c[b+344>>2]|0;if(g>>>0<8){h=b+88+((g&7)<<2)|0;c[h>>2]=c[h>>2]&-256|d&255;f=0;return f|0}else{iB(b);f=1;return f|0}}else if((e|0)==2){e=c[b+344>>2]&16777215;if(e>>>0<(c[b+36>>2]|0)>>>0){a[(c[b+32>>2]|0)+e|0]=d}else{b3[c[b+20>>2]&63](c[b+4>>2]|0,e,d)}d=b+372|0;c[d>>2]=(c[d>>2]|0)+4;if((a[b+336|0]|0)==0){f=0;return f|0}iy(b);f=1;return f|0}else{iB(b);f=1;return f|0}return 0}function mR(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=c[b+340>>2]|0;if((e|0)==1){f=c[b+344>>2]|0;if(f>>>0<8){g=b+88+((f&7)<<2)|0;c[g>>2]=c[g>>2]&-65536|d&65535;h=0;return h|0}if(f>>>0<16){g=d&65535;c[b+120+((f&7)<<2)>>2]=(g&32768|0)==0?g:g|-65536;h=0;return h|0}else{iB(b);h=1;return h|0}}else if((e|0)==2){g=c[b+344>>2]|0;do{if((g&1|0)!=0){if((c[b>>2]&1|0)!=0){break}iA(b,g,1,1);h=1;return h|0}}while(0);f=g&16777215;g=f+1|0;if(g>>>0<(c[b+36>>2]|0)>>>0){i=b+32|0;a[(c[i>>2]|0)+f|0]=(d&65535)>>>8&255;a[(c[i>>2]|0)+g|0]=d&255}else{b3[c[b+24>>2]&63](c[b+4>>2]|0,f,d)}d=b+372|0;c[d>>2]=(c[d>>2]|0)+4;if((a[b+336|0]|0)==0){h=0;return h|0}iy(b);h=1;return h|0}else if((e|0)==0){iB(b);h=1;return h|0}else{iB(b);h=1;return h|0}return 0}function mS(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=c[b+340>>2]|0;if((e|0)==2){f=c[b+344>>2]|0;do{if((f&1|0)!=0){if((c[b>>2]&1|0)!=0){break}iA(b,f,1,1);g=1;return g|0}}while(0);h=f&16777215;f=h+3|0;if(f>>>0<(c[b+36>>2]|0)>>>0){i=b+32|0;a[(c[i>>2]|0)+h|0]=d>>>24&255;a[(c[i>>2]|0)+(h+1)|0]=d>>>16&255;a[(c[i>>2]|0)+(h+2)|0]=d>>>8&255;a[(c[i>>2]|0)+f|0]=d&255}else{b3[c[b+28>>2]&63](c[b+4>>2]|0,h,d)}h=b+372|0;c[h>>2]=(c[h>>2]|0)+8;if((a[b+336|0]|0)==0){g=0;return g|0}iy(b);g=1;return g|0}else if((e|0)==1){h=c[b+344>>2]|0;if(h>>>0<8){c[b+88+((h&7)<<2)>>2]=d;g=0;return g|0}if(h>>>0<16){c[b+120+((h&7)<<2)>>2]=d;g=0;return g|0}else{iB(b);g=1;return g|0}}else if((e|0)==0){iB(b);g=1;return g|0}else{iB(b);g=1;return g|0}return 0}function mT(f,g){f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;h=(g&64|0)!=0;if((g&128|0)!=0){c[f+344>>2]=0}i=g>>>9&3;do{if(h){j=0}else{k=g>>>12&7;if((g&32768|0)==0){l=f+88+(k<<2)|0}else{l=f+120+(k<<2)|0}k=c[l>>2]|0;if((g&2048|0)!=0){j=k;break}j=(k&32768|0)!=0?k|-65536:k&65535}}while(0);l=g>>>4&3;do{if((l|0)==3){k=f+156|0;m=c[k>>2]|0;if((m&1|0)!=0){iA(f,m,0,0);n=1;return n|0}o=f+164|0;p=f+162|0;b[p>>1]=b[o>>1]|0;q=m&16777215;m=q+1|0;r=f+36|0;if(m>>>0<(c[r>>2]|0)>>>0){s=c[f+32>>2]|0;t=d[s+q|0]<<8|d[s+m|0]}else{t=b6[c[f+12>>2]&63](c[f+4>>2]|0,q)|0}b[o>>1]=t;q=f+336|0;if((a[q]|0)!=0){iy(f);n=1;return n|0}m=(c[k>>2]|0)+2|0;c[k>>2]=m;s=f+152|0;c[s>>2]=(c[s>>2]|0)+2;u=b[p>>1]|0;if((m&1|0)!=0){iA(f,m,0,0);n=1;return n|0}b[p>>1]=t;v=m&16777215;m=v+1|0;do{if(m>>>0<(c[r>>2]|0)>>>0){w=c[f+32>>2]|0;b[o>>1]=d[w+v|0]<<8|d[w+m|0]}else{w=b6[c[f+12>>2]&63](c[f+4>>2]|0,v)|0;x=(a[q]|0)==0;b[o>>1]=w;if(x){break}iy(f);n=1;return n|0}}while(0);c[k>>2]=(c[k>>2]|0)+2;c[s>>2]=(c[s>>2]|0)+2;y=e[p>>1]|(u&65535)<<16}else if((l|0)==2){o=f+156|0;q=c[o>>2]|0;if((q&1|0)!=0){iA(f,q,0,0);n=1;return n|0}v=f+164|0;m=f+162|0;b[m>>1]=b[v>>1]|0;r=q&16777215;q=r+1|0;if(q>>>0<(c[f+36>>2]|0)>>>0){x=c[f+32>>2]|0;z=d[x+r|0]<<8|d[x+q|0]}else{z=b6[c[f+12>>2]&63](c[f+4>>2]|0,r)|0}b[v>>1]=z;if((a[f+336|0]|0)==0){c[o>>2]=(c[o>>2]|0)+2;o=f+152|0;c[o>>2]=(c[o>>2]|0)+2;o=e[m>>1]|0;y=(o&32768|0)!=0?o|-65536:o;break}iy(f);n=1;return n|0}else if((l|0)==0){iB(f);n=1;return n|0}else{y=0}}while(0);if((g&7|0)==0){l=f+344|0;c[l>>2]=y+(j<<i)+(c[l>>2]|0);n=0;return n|0}l=g&3;do{if((l|0)==3){z=f+156|0;t=c[z>>2]|0;if((t&1|0)!=0){iA(f,t,0,0);n=1;return n|0}o=f+164|0;m=f+162|0;b[m>>1]=b[o>>1]|0;v=t&16777215;t=v+1|0;r=f+36|0;if(t>>>0<(c[r>>2]|0)>>>0){q=c[f+32>>2]|0;A=d[q+v|0]<<8|d[q+t|0]}else{A=b6[c[f+12>>2]&63](c[f+4>>2]|0,v)|0}b[o>>1]=A;v=f+336|0;if((a[v]|0)!=0){iy(f);n=1;return n|0}t=(c[z>>2]|0)+2|0;c[z>>2]=t;q=f+152|0;c[q>>2]=(c[q>>2]|0)+2;x=b[m>>1]|0;if((t&1|0)!=0){iA(f,t,0,0);n=1;return n|0}b[m>>1]=A;w=t&16777215;t=w+1|0;do{if(t>>>0<(c[r>>2]|0)>>>0){B=c[f+32>>2]|0;b[o>>1]=d[B+w|0]<<8|d[B+t|0]}else{B=b6[c[f+12>>2]&63](c[f+4>>2]|0,w)|0;C=(a[v]|0)==0;b[o>>1]=B;if(C){break}iy(f);n=1;return n|0}}while(0);c[z>>2]=(c[z>>2]|0)+2;c[q>>2]=(c[q>>2]|0)+2;D=e[m>>1]|(x&65535)<<16}else if((l|0)==0){iB(f);n=1;return n|0}else if((l|0)==2){o=f+156|0;v=c[o>>2]|0;if((v&1|0)!=0){iA(f,v,0,0);n=1;return n|0}w=f+164|0;t=f+162|0;b[t>>1]=b[w>>1]|0;r=v&16777215;v=r+1|0;if(v>>>0<(c[f+36>>2]|0)>>>0){u=c[f+32>>2]|0;E=d[u+r|0]<<8|d[u+v|0]}else{E=b6[c[f+12>>2]&63](c[f+4>>2]|0,r)|0}b[w>>1]=E;if((a[f+336|0]|0)==0){c[o>>2]=(c[o>>2]|0)+2;o=f+152|0;c[o>>2]=(c[o>>2]|0)+2;o=e[t>>1]|0;D=(o&32768|0)!=0?o|-65536:o;break}iy(f);n=1;return n|0}else{D=0}}while(0);if((g&4|0)==0){g=f+344|0;E=y+(j<<i)+(c[g>>2]|0)&16777215;l=E+3|0;if(l>>>0<(c[f+36>>2]|0)>>>0){A=c[f+32>>2]|0;F=((d[A+E|0]<<8|d[A+(E+1)|0])<<8|d[A+(E+2)|0])<<8|d[A+l|0]}else{F=b6[c[f+16>>2]&63](c[f+4>>2]|0,E)|0}c[g>>2]=F+D;n=0;return n|0}if(h){iB(f);n=1;return n|0}h=f+344|0;F=(c[h>>2]|0)+y&16777215;y=F+3|0;if(y>>>0<(c[f+36>>2]|0)>>>0){g=c[f+32>>2]|0;G=((d[g+F|0]<<8|d[g+(F+1)|0])<<8|d[g+(F+2)|0])<<8|d[g+y|0]}else{G=b6[c[f+16>>2]&63](c[f+4>>2]|0,F)|0}c[h>>2]=D+(j<<i)+G;n=0;return n|0}function mU(b,d){b=b|0;d=d|0;c[b>>2]=d;c[b+48>>2]=0;c[b+52>>2]=0;a[b+56|0]=0;c[b+60>>2]=0;c[b+64>>2]=0;a[b+68|0]=0;vV(b+4|0,0,41);vV(b+72|0,0,17);return}function mV(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0;if((a[b+12|0]&28)!=28){e=0;return e|0}f=b+10|0;g=d[f]|0;h=g>>>7;i=h&255;a[f]=(g<<1|h)&255;h=b+11|0;g=(a[h]|0)+1&7;a[h]=g;if(g<<24>>24!=0){e=i;return e|0}g=b+14|0;h=a[g]|0;f=h&123|4;j=(f&a[b+15|0])<<24>>24==0?f:h|-124;a[g]=j;g=(j&255)>>>7;j=b+88|0;if((a[j]|0)==g<<24>>24){e=i;return e|0}a[j]=g;j=c[b+84>>2]|0;if((j|0)==0){e=i;return e|0}b1[j&511](c[b+80>>2]|0,g);e=i;return e|0}function mW(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;if((a[b+12|0]&28)!=12){return}e=b+10|0;a[e]=a[e]<<1|d<<24>>24!=0;d=b+11|0;e=(a[d]|0)+1&7;a[d]=e;d=b+14|0;do{if(e<<24>>24==0){f=a[d]|0;g=f&123|4;h=b+15|0;i=(g&a[h])<<24>>24==0?g:f|-124;a[d]=i;f=(i&255)>>>7;i=b+88|0;if((a[i]|0)==f<<24>>24){j=h;k=i;break}a[i]=f;g=c[b+84>>2]|0;if((g|0)==0){j=h;k=i;break}b1[g&511](c[b+80>>2]|0,f);j=h;k=i}else{j=b+15|0;k=b+88|0}}while(0);e=a[d]|0;i=e&111|16;h=(i&a[j])<<24>>24==0?i:e|-112;a[d]=h;d=(h&255)>>>7;if((a[k]|0)==d<<24>>24){return}a[k]=d;k=c[b+84>>2]|0;if((k|0)==0){return}b1[k&511](c[b+80>>2]|0,d);return}function mX(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=b+32|0;f=(a[e]|0)!=0;g=d<<24>>24!=0;a[e]=g&1;if(!(f^g)){return}if((g&1|0)!=(a[b+13|0]&1|0)){return}g=b+14|0;f=a[g]|0;e=f&125|2;d=(e&a[b+15|0])<<24>>24==0?e:f|-126;a[g]=d;g=(d&255)>>>7;d=b+88|0;if((a[d]|0)==g<<24>>24){return}a[d]=g;d=c[b+84>>2]|0;if((d|0)==0){return}b1[d&511](c[b+80>>2]|0,g);return}function mY(b,e){b=b|0;e=e|0;var f=0,g=0,h=0;f=b+33|0;g=a[f]|0;h=e<<24>>24!=0;a[f]=h&1;f=d[b+13|0]|0;if((f&8|0)!=0){return}if(!(g<<24>>24!=0^h)){return}if(h^(f&4|0)!=0){return}f=b+14|0;h=a[f]|0;g=h&126|1;e=(g&a[b+15|0])<<24>>24==0?g:h|-127;a[f]=e;f=(e&255)>>>7;e=b+88|0;if((a[e]|0)==f<<24>>24){return}a[e]=f;e=c[b+84>>2]|0;if((e|0)==0){return}b1[e&511](c[b+80>>2]|0,f);return}function mZ(b,d){b=b|0;d=d|0;var e=0,f=0;a[b+6|0]=d;e=a[b+8|0]|0;f=c[b+40>>2]|0;if((f|0)==0){return}b1[f&511](c[b+36>>2]|0,a[b+4|0]&e|~e&d);return}function m_(b,d){b=b|0;d=d|0;var e=0,f=0;a[b+7|0]=d;e=a[b+9|0]|0;f=c[b+52>>2]|0;if((f|0)==0){return}b1[f&511](c[b+48>>2]|0,a[b+5|0]&e|~e&d);return}function m$(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;if((a[b+12|0]&28)!=12){return}a[b+10|0]=d;a[b+11|0]=0;d=b+14|0;e=a[d]|0;f=e&123|4;g=(f&a[b+15|0])<<24>>24==0?f:e|-124;a[d]=g;d=(g&255)>>>7;g=b+88|0;if((a[g]|0)==d<<24>>24){return}a[g]=d;g=c[b+84>>2]|0;if((g|0)==0){return}b1[g&511](c[b+80>>2]|0,d);return}function m0(d,f){d=d|0;f=f|0;var g=0,h=0,i=0,j=0;g=f>>>((c[d>>2]|0)>>>0);if((g|0)==15){f=a[d+8|0]|0;h=a[d+6|0]&~f|f&a[d+4|0];return h|0}else if((g|0)==2){h=a[d+9|0]|0;return h|0}else if((g|0)==5){h=(e[d+18>>1]|0)>>>8&255;return h|0}else if((g|0)==4){f=d+14|0;i=a[f]&63;j=(a[d+15|0]&i)<<24>>24==0?i:i|-128;a[f]=j;f=(j&255)>>>7;j=d+88|0;do{if((a[j]|0)!=f<<24>>24){a[j]=f;i=c[d+84>>2]|0;if((i|0)==0){break}b1[i&511](c[d+80>>2]|0,f)}}while(0);h=b[d+18>>1]&255;return h|0}else if((g|0)==6){h=b[d+16>>1]&255;return h|0}else if((g|0)==13){h=a[d+14|0]|0;return h|0}else if((g|0)==14){h=a[d+15|0]|-128;return h|0}else if((g|0)==8){f=d+14|0;j=a[f]&95;i=(a[d+15|0]&j)<<24>>24==0?j:j|-128;a[f]=i;f=(i&255)>>>7;i=d+88|0;do{if((a[i]|0)!=f<<24>>24){a[i]=f;j=c[d+84>>2]|0;if((j|0)==0){break}b1[j&511](c[d+80>>2]|0,f)}}while(0);h=b[d+26>>1]&255;return h|0}else if((g|0)==3){h=a[d+8|0]|0;return h|0}else if((g|0)==7){h=(e[d+16>>1]|0)>>>8&255;return h|0}else if((g|0)==0){f=d+14|0;i=a[f]&103;j=(a[d+15|0]&i)<<24>>24==0?i:i|-128;a[f]=j;f=(j&255)>>>7;j=d+88|0;do{if((a[j]|0)!=f<<24>>24){a[j]=f;i=c[d+84>>2]|0;if((i|0)==0){break}b1[i&511](c[d+80>>2]|0,f)}}while(0);f=a[d+9|0]|0;h=a[d+7|0]&~f|f&a[d+5|0];return h|0}else if((g|0)==11){h=a[d+12|0]|0;return h|0}else if((g|0)==12){h=a[d+13|0]|0;return h|0}else if((g|0)==1){f=d+14|0;j=a[f]&124;i=(a[d+15|0]&j)<<24>>24==0?j:j|-128;a[f]=i;f=(i&255)>>>7;i=d+88|0;do{if((a[i]|0)!=f<<24>>24){a[i]=f;j=c[d+84>>2]|0;if((j|0)==0){break}b1[j&511](c[d+80>>2]|0,f)}}while(0);f=a[d+8|0]|0;h=a[d+6|0]&~f|f&a[d+4|0];return h|0}else if((g|0)==9){h=(e[d+26>>1]|0)>>>8&255;return h|0}else if((g|0)==10){g=d+14|0;f=a[g]&123;i=(a[d+15|0]&f)<<24>>24==0?f:f|-128;a[g]=i;g=(i&255)>>>7;i=d+88|0;do{if((a[i]|0)!=g<<24>>24){a[i]=g;f=c[d+84>>2]|0;if((f|0)==0){break}b1[f&511](c[d+80>>2]|0,g)}}while(0);a[d+11|0]=0;h=a[d+10|0]|0;return h|0}else{h=-86;return h|0}return 0}function m1(a,b){a=a|0;b=b|0;return(m0(a,b)|0)&255|0}function m2(a,b){a=a|0;b=b|0;return(m0(a,b)|0)&255|0}function m3(a,b,d){a=a|0;b=b|0;d=d|0;c[a+1288>>2]=b;c[a+1292>>2]=d;return}function m4(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;if(b>>>0>=2){return}c[a+4+(b*640|0)+608>>2]=d;c[a+4+(b*640|0)+612>>2]=e;return}function m5(e,f,g){e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0;h=f>>>((c[e>>2]|0)>>>0);if((h|0)==12){a[e+13|0]=g;f=d[e+12|0]|0;do{if((f&28|0)==0){i=(g&-32)<<24>>24!=-64|0}else{if((f&16|0)==0){i=1;break}i=a[e+10|0]&1}}while(0);f=e+68|0;if(i<<24>>24==(a[f]|0)){return}a[f]=i;f=c[e+64>>2]|0;if((f|0)==0){return}b1[f&511](c[e+60>>2]|0,i);return}else if((h|0)==8){i=e+24|0;b[i>>1]=b[i>>1]&-256|g&255;return}else if((h|0)==3){a[e+8|0]=g;i=c[e+40>>2]|0;if((i|0)==0){return}b1[i&511](c[e+36>>2]|0,a[e+6|0]&~g|a[e+4|0]&g);return}else if((h|0)==15){a[e+4|0]=g;i=a[e+8|0]|0;f=c[e+40>>2]|0;if((f|0)!=0){b1[f&511](c[e+36>>2]|0,a[e+6|0]&~i|i&g)}i=e+14|0;f=a[i]&124;j=(a[e+15|0]&f)<<24>>24==0?f:f|-128;a[i]=j;i=(j&255)>>>7;j=e+88|0;if((a[j]|0)==i<<24>>24){return}a[j]=i;j=c[e+84>>2]|0;if((j|0)==0){return}b1[j&511](c[e+80>>2]|0,i);return}else if((h|0)==0){a[e+5|0]=g;i=a[e+9|0]|0;j=c[e+52>>2]|0;if((j|0)!=0){b1[j&511](c[e+48>>2]|0,a[e+7|0]&~i|i&g)}i=e+14|0;j=a[i]&103;f=(a[e+15|0]&j)<<24>>24==0?j:j|-128;a[i]=f;i=(f&255)>>>7;f=e+88|0;if((a[f]|0)==i<<24>>24){return}a[f]=i;f=c[e+84>>2]|0;if((f|0)==0){return}b1[f&511](c[e+80>>2]|0,i);return}else if((h|0)==11){a[e+12|0]=g;if((g&28)==0){a[e+11|0]=0}i=g&255;do{if((i&28|0)==0){k=(a[e+13|0]&-32)<<24>>24!=-64|0}else{if((i&16|0)==0){k=1;break}k=a[e+10|0]&1}}while(0);i=e+68|0;if(k<<24>>24==(a[i]|0)){return}a[i]=k;i=c[e+64>>2]|0;if((i|0)==0){return}b1[i&511](c[e+60>>2]|0,k);return}else if((h|0)==6){k=e+16|0;b[k>>1]=b[k>>1]&-256|g&255;return}else if((h|0)==1){a[e+4|0]=g;k=a[e+8|0]|0;i=c[e+40>>2]|0;if((i|0)!=0){b1[i&511](c[e+36>>2]|0,a[e+6|0]&~k|k&g)}k=e+14|0;i=a[k]&124;f=(a[e+15|0]&i)<<24>>24==0?i:i|-128;a[k]=f;k=(f&255)>>>7;f=e+88|0;if((a[f]|0)==k<<24>>24){return}a[f]=k;f=c[e+84>>2]|0;if((f|0)==0){return}b1[f&511](c[e+80>>2]|0,k);return}else if((h|0)==5){k=e+16|0;f=b[k>>1]&255|(g&255)<<8;b[k>>1]=f;b[e+18>>1]=f;if((a[e+12|0]&64)==0){c[e+20>>2]=1}f=e+14|0;k=a[f]&63;i=(a[e+15|0]&k)<<24>>24==0?k:k|-128;a[f]=i;f=(i&255)>>>7;i=e+88|0;if((a[i]|0)==f<<24>>24){return}a[i]=f;i=c[e+84>>2]|0;if((i|0)==0){return}b1[i&511](c[e+80>>2]|0,f);return}else if((h|0)==7){f=e+16|0;b[f>>1]=b[f>>1]&255|(g&255)<<8;return}else if((h|0)==14){f=g&127;if(g<<24>>24>-1){i=e+15|0;k=a[i]&(f^127);a[i]=k;l=k}else{k=e+15|0;i=a[k]|f;a[k]=i;l=i}i=e+14|0;k=a[i]|0;f=k&127;j=(f&l)<<24>>24==0?f:k|-128;a[i]=j;i=(j&255)>>>7;j=e+88|0;if((a[j]|0)==i<<24>>24){return}a[j]=i;j=c[e+84>>2]|0;if((j|0)==0){return}b1[j&511](c[e+80>>2]|0,i);return}else if((h|0)==4){i=e+16|0;b[i>>1]=b[i>>1]&-256|g&255;return}else if((h|0)==2){a[e+9|0]=g;i=c[e+52>>2]|0;if((i|0)==0){return}b1[i&511](c[e+48>>2]|0,a[e+7|0]&~g|a[e+5|0]&g);return}else if((h|0)==13){i=e+14|0;j=a[i]&(g^127);k=j&127;f=(k&a[e+15|0])<<24>>24==0?k:j|-128;a[i]=f;i=(f&255)>>>7;f=e+88|0;if((a[f]|0)==i<<24>>24){return}a[f]=i;f=c[e+84>>2]|0;if((f|0)==0){return}b1[f&511](c[e+80>>2]|0,i);return}else if((h|0)==9){i=e+24|0;f=b[i>>1]&255|(g&255)<<8;b[i>>1]=f;b[e+26>>1]=f;if((a[e+12|0]&32)==0){c[e+28>>2]=1}f=e+14|0;i=a[f]&95;j=(a[e+15|0]&i)<<24>>24==0?i:i|-128;a[f]=j;f=(j&255)>>>7;j=e+88|0;if((a[j]|0)==f<<24>>24){return}a[j]=f;j=c[e+84>>2]|0;if((j|0)==0){return}b1[j&511](c[e+80>>2]|0,f);return}else if((h|0)==10){h=e+14|0;f=a[h]&123;j=e+15|0;i=(a[j]&f)<<24>>24==0?f:f|-128;a[h]=i;f=(i&255)>>>7;i=e+88|0;do{if((a[i]|0)!=f<<24>>24){a[i]=f;k=c[e+84>>2]|0;if((k|0)==0){break}b1[k&511](c[e+80>>2]|0,f)}}while(0);a[e+10|0]=g;a[e+11|0]=0;if((a[e+12|0]&28)!=28){return}f=c[e+76>>2]|0;if((f|0)==0){return}b1[f&511](c[e+72>>2]|0,g);g=a[h]|0;f=g&123|4;k=(f&a[j])<<24>>24==0?f:g|-124;a[h]=k;h=(k&255)>>>7;if((a[i]|0)==h<<24>>24){return}a[i]=h;i=c[e+84>>2]|0;if((i|0)==0){return}b1[i&511](c[e+80>>2]|0,h);return}else{return}}function m6(a,b,c){a=a|0;b=b|0;c=c|0;m5(a,b,c&255);return}function m7(a,b,c){a=a|0;b=b|0;c=c|0;m5(a,b,c&255);return}function m8(b){b=b|0;var d=0,e=0,f=0,g=0;a[b+4|0]=0;d=b+5|0;a[d]=0;e=b+14|0;vV(b+8|0,0,24);f=c[b+40>>2]|0;if((f|0)==0){g=0}else{b1[f&511](c[b+36>>2]|0,a[b+6|0]|0);g=a[b+9|0]|0}f=c[b+52>>2]|0;if((f|0)!=0){b1[f&511](c[b+48>>2]|0,a[b+7|0]&~g|a[d]&g)}g=a[e]|0;d=g&127;f=(a[b+15|0]&d)<<24>>24==0?d:g|-128;a[e]=f;e=(f&255)>>>7;f=b+88|0;if((a[f]|0)==e<<24>>24){return}a[f]=e;f=c[b+84>>2]|0;if((f|0)==0){return}b1[f&511](c[b+80>>2]|0,e);return}function m9(d,e){d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;f=d+18|0;g=b[f>>1]|0;h=g&65535;do{if(h>>>0>e>>>0|g<<16>>16==0){b[f>>1]=h-e&65535}else{if((a[d+12|0]&64)==0){b[f>>1]=h-e&65535;i=d+20|0;if((c[i>>2]|0)==0){break}c[i>>2]=0;i=d+14|0;j=a[i]|0;k=j&63|64;l=(k&a[d+15|0])<<24>>24==0?k:j|-64;a[i]=l;i=(l&255)>>>7;l=d+88|0;if((a[l]|0)==i<<24>>24){break}a[l]=i;l=c[d+84>>2]|0;if((l|0)==0){break}b1[l&511](c[d+80>>2]|0,i);break}i=e-h|0;l=d+14|0;j=a[l]|0;k=j&63|64;m=(k&a[d+15|0])<<24>>24==0?k:j|-64;a[l]=m;l=(m&255)>>>7;m=d+88|0;do{if((a[m]|0)!=l<<24>>24){a[m]=l;j=c[d+84>>2]|0;if((j|0)==0){break}b1[j&511](c[d+80>>2]|0,l)}}while(0);l=b[d+16>>1]|0;if(l<<16>>16==0){n=i&65535;o=0}else{m=l&65535;n=(i>>>0)%(m>>>0)|0;o=m}b[f>>1]=o-n&65535}}while(0);n=d+26|0;o=b[n>>1]|0;f=o&65535;if(f>>>0>e>>>0|o<<16>>16==0){b[n>>1]=f-e&65535;return}if((a[d+12|0]&32)!=0){return}b[n>>1]=f-e&65535;e=d+28|0;if((c[e>>2]|0)==0){return}c[e>>2]=0;e=d+14|0;f=a[e]|0;n=f&95|32;o=(n&a[d+15|0])<<24>>24==0?n:f|-96;a[e]=o;e=(o&255)>>>7;o=d+88|0;if((a[o]|0)==e<<24>>24){return}a[o]=e;o=c[d+84>>2]|0;if((o|0)==0){return}b1[o&511](c[d+80>>2]|0,e);return}function na(b){b=b|0;c[b>>2]=0;c[b+1284>>2]=0;a[b+38|0]=1;a[b+39|0]=1;c[b+56>>2]=0;c[b+60>>2]=16384;c[b+64>>2]=0;c[b+68>>2]=1;c[b+72>>2]=0;c[b+76>>2]=1;c[b+80>>2]=0;c[b+84>>2]=0;c[b+88>>2]=0;c[b+348>>2]=0;c[b+352>>2]=0;vV(b+612|0,0,32);a[b+678|0]=1;a[b+679|0]=1;c[b+696>>2]=0;c[b+700>>2]=16384;c[b+704>>2]=0;c[b+708>>2]=1;c[b+712>>2]=0;c[b+716>>2]=1;c[b+720>>2]=0;c[b+724>>2]=0;c[b+728>>2]=0;c[b+988>>2]=0;c[b+992>>2]=0;vV(b+1252|0,0,32);c[b+1288>>2]=0;c[b+1292>>2]=0;a[b+1296|0]=0;return}function nb(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;if(b>>>0>=2){return}c[a+4+(b*640|0)+616>>2]=d;c[a+4+(b*640|0)+620>>2]=e;return}function nc(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;if(b>>>0>=2){return}c[a+4+(b*640|0)+624>>2]=d;c[a+4+(b*640|0)+628>>2]=e;return}function nd(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;if(b>>>0>=2){return}c[a+4+(b*640|0)+632>>2]=d;c[a+4+(b*640|0)+636>>2]=e;return}function ne(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;if(b>>>0>1){return}c[a+4+(b*640|0)+60>>2]=0;c[a+4+(b*640|0)+64>>2]=(d|0)==0?1:d;c[a+4+(b*640|0)+68>>2]=0;c[a+4+(b*640|0)+72>>2]=(e|0)==0?1:e;return}function nf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;c[a+1284>>2]=b;c[a+80>>2]=d;c[a+720>>2]=e;return}function ng(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;f=d&1;d=b+4+(f*640|0)+344|0;g=c[d>>2]|0;if((g+1&255|0)==(c[b+4+(f*640|0)+348>>2]|0)){return}a[b+4+(f*640|0)+352+g|0]=e;c[d>>2]=(c[d>>2]|0)+1&255;return}function nh(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=d&1;d=b+4+(e*640|0)+84|0;f=c[d>>2]|0;if((c[b+4+(e*640|0)+80>>2]|0)==(f|0)){g=0;return g|0}h=a[b+4+(e*640|0)+88+f|0]|0;c[d>>2]=f+1&255;g=h;return g|0}function ni(a,b){a=a|0;b=b|0;var d=0;d=b&1;return((c[a+4+(d*640|0)+344>>2]|0)+1&255|0)==(c[a+4+(d*640|0)+348>>2]|0)|0}function nj(a,b){a=a|0;b=b|0;var d=0;d=b&1;return(c[a+4+(d*640|0)+80>>2]|0)==(c[a+4+(d*640|0)+84>>2]|0)|0}function nk(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;g=d&1;do{if((e|0)==1){a[b+4+(g*640|0)+1|0]=f;nS(b,g,0)}else if((e|0)==3){a[b+4+(g*640|0)+3|0]=f;if((f&16)==0){break}d=b+4+(g*640|0)+16|0;a[d]=a[d]|16;h=5106}else if((e|0)==4){a[b+4+(g*640|0)+4|0]=f;nT(b,g)}else if((e|0)==5){d=b+4+(g*640|0)+5|0;i=a[d]|0;a[d]=f;do{if(((i^f)&2)!=0){d=c[b+4+(g*640|0)+628>>2]|0;if((d|0)==0){break}b1[d&511](c[b+4+(g*640|0)+624>>2]|0,(f&255)>>>1&1)}}while(0);nT(b,g);h=5106}else if((e|0)==8){i=b+4+(g*640|0)+8|0;a[i]=f;d=b+4+(g*640|0)+16|0;a[d]=a[d]&-5;j=b+4+(g*640|0)+34|0;a[j]=0;k=b+23|0;l=a[k]&((g|0)==0?-17:-3);a[k]=l;do{if((a[b+13|0]&8)==0){k=b+1296|0;if((a[k]|0)==0){break}a[k]=0;k=c[b+1292>>2]|0;if((k|0)==0){break}b1[k&511](c[b+1288>>2]|0,0)}else{k=l<<24>>24!=0|0;m=b+1296|0;if((a[m]|0)==k<<24>>24){break}a[m]=k;m=c[b+1292>>2]|0;if((m|0)==0){break}b1[m&511](c[b+1288>>2]|0,k)}}while(0);l=b+4+(g*640|0)+68|0;k=c[l>>2]|0;if((k|0)==0){h=5106;break}m=b+4+(g*640|0)+80|0;n=c[m>>2]|0;if((n+1&255|0)==(c[b+4+(g*640|0)+84>>2]|0)){h=5106;break}if((a[j]|0)!=0){a[d]=a[d]|64;h=5106;break}c[l>>2]=k-1;k=a[i]|0;a[b+4+(g*640|0)+88+n|0]=k;c[m>>2]=(c[m>>2]|0)+1&255;m=c[b+4+(g*640|0)+620>>2]|0;if((m|0)!=0){b1[m&511](c[b+4+(g*640|0)+616>>2]|0,k)}a[d]=a[d]|4;a[j]=1;nS(b,g,2);h=5106}else if((e|0)==9){k=b+13|0;m=a[k]|0;a[k]=f;a[b+653|0]=f;if((f&8&(m^8))<<24>>24==0){break}nS(b,0,0);nS(b,1,0);h=5106}else if((e|0)==10){a[b+4+(g*640|0)+10|0]=f}else if((e|0)==11){a[b+4+(g*640|0)+11|0]=f}else if((e|0)==12){a[b+4+(g*640|0)+12|0]=f;nT(b,g)}else if((e|0)==13){a[b+4+(g*640|0)+13|0]=f;nT(b,g)}else if((e|0)==14){a[b+4+(g*640|0)+14|0]=f;nT(b,g)}else if((e|0)==15){a[b+4+(g*640|0)+15|0]=f;a[b+4+(g*640|0)+31|0]=f}else if((e|0)==2){a[b+6|0]=f;a[b+646|0]=f;a[b+22|0]=f;a[b+662|0]=f}else if((e|0)==0){a[b+4+(g*640|0)|0]=f;m=f&255;k=m&7;n=b|0;c[n>>2]=k;l=m>>>3&7;if((l|0)==2){m=b+23|0;o=a[m]&((g|0)==0?-9:-2);a[m]=o;a[b+4+(g*640|0)+32|0]=0;if((a[b+13|0]&8)!=0){m=o<<24>>24!=0|0;o=b+1296|0;if((a[o]|0)==m<<24>>24){h=5106;break}a[o]=m;o=c[b+1292>>2]|0;if((o|0)==0){h=5106;break}b1[o&511](c[b+1288>>2]|0,m);h=5106;break}m=b+1296|0;if((a[m]|0)==0){return}a[m]=0;m=c[b+1292>>2]|0;if((m|0)==0){h=5106;break}b1[m&511](c[b+1288>>2]|0,0);h=5106;break}else if((l|0)==1){c[n>>2]=k|8;return}else if((l|0)==5){l=b+23|0;k=a[l]&((g|0)==0?-17:-3);a[l]=k;if((a[b+13|0]&8)==0){l=b+1296|0;if((a[l]|0)==0){h=5106;break}a[l]=0;l=c[b+1292>>2]|0;if((l|0)==0){h=5106;break}b1[l&511](c[b+1288>>2]|0,0);h=5106;break}else{l=k<<24>>24!=0|0;k=b+1296|0;if((a[k]|0)==l<<24>>24){h=5106;break}a[k]=l;k=c[b+1292>>2]|0;if((k|0)==0){h=5106;break}b1[k&511](c[b+1288>>2]|0,l);h=5106;break}}else{return}}else{a[(e&15)+(b+4+(g*640|0))|0]=f;h=5106}}while(0);do{if((h|0)==5106){if((e|0)!=0){break}return}}while(0);c[b>>2]=0;return}function nl(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=e&1;do{if((f|0)==2){e=a[b+22|0]|0;if((g|0)==0){h=e;break}i=d[b+23|0]|0;do{if((i&32|0)==0){if((i&16|0)!=0){j=24;break}if((i&8|0)!=0){j=90;break}if((i&4|0)!=0){j=36;break}if((i&2|0)!=0){j=0;break}j=(i&1|0)==0?102:66}else{j=60}}while(0);i=e&255;if((a[b+13|0]&16)==0){h=(j&14|i&241)&255;break}else{h=(j|i)&112;break}}else if((f|0)==3){if((g|0)!=0){h=0;break}h=a[b+23|0]|0}else if((f|0)==8){i=b+4+(g*640|0)+24|0;k=a[i]|0;l=b+4+(g*640|0)+16|0;a[l]=a[l]&-2;m=b+4+(g*640|0)+35|0;a[m]=1;n=b+23|0;o=a[n]&((g|0)==0?-33:-5);a[n]=o;do{if((a[b+13|0]&8)==0){n=b+1296|0;if((a[n]|0)==0){break}a[n]=0;n=c[b+1292>>2]|0;if((n|0)==0){break}b1[n&511](c[b+1288>>2]|0,0)}else{n=o<<24>>24!=0|0;p=b+1296|0;if((a[p]|0)==n<<24>>24){break}a[p]=n;p=c[b+1292>>2]|0;if((p|0)==0){break}b1[p&511](c[b+1288>>2]|0,n)}}while(0);o=b+4+(g*640|0)+348|0;e=c[o>>2]|0;if((c[b+4+(g*640|0)+344>>2]|0)==(e|0)){h=k;break}n=b+4+(g*640|0)+60|0;p=c[n>>2]|0;if((p|0)==0){h=k;break}if((a[m]|0)==0){h=k;break}c[n>>2]=p-1;a[i]=a[b+4+(g*640|0)+352+e|0]|0;c[o>>2]=e+1&255;e=c[b+4+(g*640|0)+612>>2]|0;if((e|0)!=0){b1[e&511](c[b+4+(g*640|0)+608>>2]|0,1)}a[l]=a[l]|1;a[m]=0;nS(b,g,4);h=k}else if((f|0)==0){e=a[b+4+(g*640|0)+32|0]|0;h=a[b+4+(g*640|0)+33|0]&e|a[b+4+(g*640|0)+16|0]&~e}else{h=a[(f&15)+(b+4+(g*640|0)+16)|0]|0}}while(0);c[b>>2]=0;return h|0}function nm(a){a=a|0;return nl(a,0,c[a>>2]|0)|0}function nn(a){a=a|0;return nl(a,1,c[a>>2]|0)|0}function no(a,b){a=a|0;b=b|0;nk(a,0,c[a>>2]|0,b);return}function np(a,b){a=a|0;b=b|0;nk(a,1,c[a>>2]|0,b);return}function nq(a){a=a|0;return nl(a,0,8)|0}function nr(a){a=a|0;return nl(a,1,8)|0}function ns(a,b){a=a|0;b=b|0;nk(a,0,8,b);return}function nt(a,b){a=a|0;b=b|0;nk(a,1,8,b);return}function nu(b,c){b=b|0;c=c|0;var d=0,e=0,f=0;d=b+20|0;e=a[d]|0;f=c<<24>>24==0?e|8:e&-9;a[d]=f;if((a[b+19|0]&-6&(f^e))<<24>>24==0){return}nS(b,0,1);return}function nv(b,c){b=b|0;c=c|0;var d=0,e=0,f=0;d=b+660|0;e=a[d]|0;f=c<<24>>24==0?e|8:e&-9;a[d]=f;if((a[b+659|0]&-6&(f^e))<<24>>24==0){return}nS(b,1,1);return}function nw(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0;e=c&1;c=b+4+(e*640|0)+16|0;f=a[c]|0;g=d<<24>>24==0?f|32:f&-33;a[c]=g;if((a[b+4+(e*640|0)+15|0]&-6&(g^f))<<24>>24==0){return}nS(b,e,1);return}function nx(b){b=b|0;var d=0;c[b>>2]=0;d=0;do{a[b+20+d|0]=0;a[b+4+d|0]=0;a[b+660+d|0]=0;a[b+644+d|0]=0;d=d+1|0;}while(d>>>0<16);d=b+20|0;a[d]=a[d]|4;d=b+21|0;a[d]=a[d]|1;a[b+36|0]=0;c[b+84>>2]=0;c[b+88>>2]=0;c[b+348>>2]=0;c[b+352>>2]=0;vV(b+40|0,0,16);d=b+660|0;a[d]=a[d]|4;d=b+661|0;a[d]=a[d]|1;a[b+676|0]=0;c[b+724>>2]=0;c[b+728>>2]=0;c[b+988>>2]=0;c[b+992>>2]=0;vV(b+680|0,0,16);d=c[b+632>>2]|0;if((d|0)!=0){b1[d&511](c[b+628>>2]|0,0)}d=c[b+1272>>2]|0;if((d|0)!=0){b1[d&511](c[b+1268>>2]|0,0)}d=b+1296|0;if((a[d]|0)==0){return}a[d]=0;d=c[b+1292>>2]|0;if((d|0)==0){return}b1[d&511](c[b+1288>>2]|0,0);return}function ny(a,b){a=a|0;b=b|0;nR(a,0,b);nR(a,1,b);return}function nz(a,b){a=a|0;b=b|0;return 0}function nA(a,b){a=a|0;b=b|0;return 0}function nB(a,b){a=a|0;b=b|0;return 0}function nC(a,b,c){a=a|0;b=b|0;c=c|0;return}function nD(a,b,c){a=a|0;b=b|0;c=c|0;return}function nE(a,b,c){a=a|0;b=b|0;c=c|0;return}function nF(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0;c[a+24>>2]=b;b=a|0;c[b>>2]=d;j=a+4|0;c[j>>2]=e;k=a+8|0;c[k>>2]=f;l=a+12|0;c[l>>2]=g;m=a+16|0;c[m>>2]=h;n=a+20|0;c[n>>2]=i;if((c[a+44>>2]|0)!=0){return}if((d|0)==0){c[b>>2]=20}if((e|0)==0){c[j>>2]=42}if((f|0)==0){c[k>>2]=6}if((g|0)==0){c[l>>2]=8}if((h|0)==0){c[m>>2]=6}if((i|0)!=0){return}c[n>>2]=18;return}function nG(a){a=a|0;return c[a+44>>2]|0}function nH(b,c){b=b|0;c=c|0;a[b+29|0]=(c|0)!=0|0;return}function nI(a){a=a|0;return c[a+32>>2]|0}function nJ(a,b){a=a|0;b=b|0;c[a+32>>2]=b;c[a+36>>2]=b-1+(c[a+40>>2]|0);return}function nK(a){a=a|0;return c[a+40>>2]|0}function nL(a,b){a=a|0;b=b|0;c[a+40>>2]=b;c[a+36>>2]=b-1+(c[a+32>>2]|0);return}function nM(b,c,d){b=b|0;c=c|0;d=d|0;a[b+c|0]=(d&65535)>>>8&255;a[b+(c+1)|0]=d&255;return}function nN(b,c,d){b=b|0;c=c|0;d=d|0;a[b+c|0]=d>>>24&255;a[b+(c+1)|0]=d>>>16&255;a[b+(c+2)|0]=d>>>8&255;a[b+(c+3)|0]=d&255;return}function nO(a,b){a=a|0;b=b|0;var e=0;e=c[a+44>>2]|0;return(((d[e+b|0]|0)<<8|(d[e+(b+1)|0]|0))<<8|(d[e+(b+2)|0]|0))<<8|(d[e+(b+3)|0]|0)|0}function nP(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[a+24>>2]=b;c[a+28>>2]=d;c[a+32>>2]=e;c[a+36>>2]=f;c[a+40>>2]=g;c[a+44>>2]=h;c[a+48>>2]=i;return}function nQ(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=b+8|0;f=c[e>>2]|0;do{if((f|0)!=0){g=c[f>>2]|0;if((a[g+28|0]|0)==0){break}if((c[g+32>>2]|0)>>>0>d>>>0){break}if((c[g+36>>2]|0)>>>0<d>>>0){break}else{h=g}return h|0}}while(0);f=c[b>>2]|0;if((f|0)==0){h=0;return h|0}g=0;i=c[b+4>>2]|0;L6582:while(1){j=c[i>>2]|0;do{if((a[j+28|0]|0)!=0){if((c[j+32>>2]|0)>>>0>d>>>0){break}if((c[j+36>>2]|0)>>>0>=d>>>0){break L6582}}}while(0);b=g+1|0;if(b>>>0<f>>>0){g=b;i=i+8|0}else{h=0;k=5226;break}}if((k|0)==5226){return h|0}c[e>>2]=i;h=j;return h|0}function nR(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;f=b+4+(d*640|0)+52|0;g=c[f>>2]|0;if(g>>>0>e>>>0){c[f>>2]=g-e;return}h=e-g|0;g=c[b+4+(d*640|0)+56>>2]|0;if(h>>>0>g>>>0){i=(h>>>0)%(g>>>0)|0}else{i=h}c[f>>2]=g-i;i=c[b+4+(d*640|0)+64>>2]|0;g=b+4+(d*640|0)+60|0;c[g>>2]=i;f=c[b+4+(d*640|0)+72>>2]|0;h=b+4+(d*640|0)+68|0;c[h>>2]=f;e=b+4+(d*640|0)+348|0;j=c[e>>2]|0;do{if((c[b+4+(d*640|0)+344>>2]|0)==(j|0)|(i|0)==0){k=f}else{l=b+4+(d*640|0)+35|0;if((a[l]|0)==0){k=f;break}c[g>>2]=i-1;a[b+4+(d*640|0)+24|0]=a[b+4+(d*640|0)+352+j|0]|0;c[e>>2]=j+1&255;m=c[b+4+(d*640|0)+612>>2]|0;if((m|0)!=0){b1[m&511](c[b+4+(d*640|0)+608>>2]|0,1)}m=b+4+(d*640|0)+16|0;a[m]=a[m]|1;a[l]=0;nS(b,d,4);k=c[h>>2]|0}}while(0);if((k|0)==0){return}j=b+4+(d*640|0)+80|0;e=c[j>>2]|0;if((e+1&255|0)==(c[b+4+(d*640|0)+84>>2]|0)){return}i=b+4+(d*640|0)+34|0;if((a[i]|0)!=0){g=b+4+(d*640|0)+16|0;a[g]=a[g]|64;return}c[h>>2]=k-1;k=a[b+4+(d*640|0)+8|0]|0;a[b+4+(d*640|0)+88+e|0]=k;c[j>>2]=(c[j>>2]|0)+1&255;j=c[b+4+(d*640|0)+620>>2]|0;if((j|0)!=0){b1[j&511](c[b+4+(d*640|0)+616>>2]|0,k)}k=b+4+(d*640|0)+16|0;a[k]=a[k]|4;a[i]=1;nS(b,d,2);return}function nS(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=e&255;do{if((f&1|0)!=0){if((a[b+4+(d*640|0)+1|0]&1)==0){break}e=b+23|0;a[e]=a[e]|((d|0)==0?8:1);a[b+4+(d*640|0)+32|0]=a[b+4+(d*640|0)+15|0]|0;a[b+4+(d*640|0)+33|0]=a[b+4+(d*640|0)+16|0]|0}}while(0);do{if((f&2|0)!=0){if((a[b+4+(d*640|0)+1|0]&2)==0){break}e=b+23|0;a[e]=a[e]|((d|0)==0?16:2)}}while(0);do{if((f&4|0)!=0){if((a[b+4+(d*640|0)+1|0]&24)!=16){break}e=b+23|0;a[e]=a[e]|((d|0)==0?32:4)}}while(0);if((a[b+13|0]&8)==0){d=b+1296|0;if((a[d]|0)==0){return}a[d]=0;d=c[b+1292>>2]|0;if((d|0)==0){return}b1[d&511](c[b+1288>>2]|0,0);return}else{d=(a[b+23|0]|0)!=0|0;f=b+1296|0;if((a[f]|0)==d<<24>>24){return}a[f]=d;f=c[b+1292>>2]|0;if((f|0)==0){return}b1[f&511](c[b+1288>>2]|0,d);return}}function nT(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;e=(d[a+4+(b*640|0)+5|0]|0)>>>5&3;if((e|0)==3){f=8}else if((e|0)==2){f=6}else if((e|0)==0){f=5}else if((e|0)==1){f=7}else{f=0}c[a+4+(b*640|0)+44>>2]=f;e=d[a+4+(b*640|0)+4|0]|0;g=e&3;if((g|0)==3){h=2}else if((g|0)==0|(g|0)==1){h=g}else if((g|0)==2){h=0}else{h=0}c[a+4+(b*640|0)+40>>2]=h;g=e>>>2&3;if((g|0)==1){i=2}else if((g|0)==3){i=4}else if((g|0)==2){i=3}else{i=0}c[a+4+(b*640|0)+48>>2]=i;g=e>>>6;if((g|0)==3){j=128}else if((g|0)==1){j=32}else if((g|0)==2){j=64}else if((g|0)==0){j=2}else{j=0}g=(i|0)==0?2:j;j=d[a+4+(b*640|0)+14|0]|0;if((j&1|0)==0){c[a+4+(b*640|0)+56>>2]=16384;k=0}else{if((j&2|0)==0){l=a+4+(b*640|0)+76|0}else{l=a+1284|0}j=c[l>>2]|0;l=ac(((d[a+4+(b*640|0)+13|0]|0)<<8|(d[a+4+(b*640|0)+12|0]|0))+2|0,g)|0;c[a+4+(b*640|0)+56>>2]=(ac(l,f+1+i|0)|0)+((h|0)==0?0:l);k=(j>>>0)/(l>>>0)|0}c[a+4+(b*640|0)+36>>2]=k;l=c[a+4+(b*640|0)+636>>2]|0;if((l|0)==0){return}b$[l&3](c[a+4+(b*640|0)+632>>2]|0,k,h,f,i);return}function nU(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;f=vP(48)|0;g=f;if((f|0)==0){h=0;return h|0}do{if((e|0)==0){c[f+44>>2]=0;i=0}else{j=vP(d+16|0)|0;c[f+44>>2]=j;if((j|0)!=0){i=j;break}vQ(f);h=0;return h|0}}while(0);vV(f|0,0,24);c[f+24>>2]=f;a[f+28|0]=1;a[f+29|0]=0;a[f+30|0]=(i|0)!=0|0;c[f+32>>2]=b;c[f+36>>2]=b-1+d;c[f+40>>2]=d;h=g;return h|0}function nV(b){b=b|0;var c=0,d=0,e=0,f=0;c=vP(48)|0;if((c|0)==0){d=0;return d|0}e=c;f=b;vW(c|0,f|0,48)|0;a[c+30|0]=0;a[c+28|0]=1;d=e;return d|0}function nW(a,b){a=a|0;b=b|0;var d=0;d=c[a+44>>2]|0;if((d|0)==0){return}vV(d|0,b|0,c[a+40>>2]|0);return}function nX(){var a=0,b=0;a=vP(56)|0;if((a|0)==0){b=0;return b|0}vV(a|0,0,52);c[a+52>>2]=-1;b=a;return b|0}function nY(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;e=i;f=b|0;if((c[f>>2]|0)==0){i=e;return}g=b+4|0;b=0;do{h=c[(c[g>>2]|0)+(b<<3)>>2]|0;j=c[h+32>>2]|0;k=c[h+36>>2]|0;l=c[h+40>>2]|0;m=(a[h+29|0]|0)!=0|0;bN(d|0,55640,(x=i,i=i+40|0,c[x>>2]=b,c[x+8>>2]=j,c[x+16>>2]=k,c[x+24>>2]=l,c[x+32>>2]=m,x)|0)|0;b=b+1|0;}while(b>>>0<(c[f>>2]|0)>>>0);i=e;return}function nZ(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;if((b|0)==0){return}e=a+4|0;f=a|0;g=vR(c[e>>2]|0,(c[f>>2]<<3)+8|0)|0;h=g;if((g|0)==0){return}c[e>>2]=h;e=c[f>>2]|0;c[f>>2]=e+1;c[h+(e<<3)>>2]=b;c[h+(e<<3)+4>>2]=(d|0)!=0;vV(a+8|0,0,16);return}function n_(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;d=c[a+4>>2]|0;e=a|0;f=c[e>>2]|0;if((f|0)==0){g=0}else{h=0;i=0;j=f;while(1){f=d+(i<<3)|0;if((c[f>>2]|0)==(b|0)){k=h;l=j}else{m=f;f=d+(h<<3)|0;n=c[m+4>>2]|0;c[f>>2]=c[m>>2];c[f+4>>2]=n;k=h+1|0;l=c[e>>2]|0}n=i+1|0;if(n>>>0<l>>>0){h=k;i=n;j=l}else{g=k;break}}}c[e>>2]=g;vV(a+8|0,0,16);return}function n$(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;e=b+12|0;f=c[e>>2]|0;do{if((f|0)==0){g=5350}else{h=c[f>>2]|0;if((a[h+28|0]|0)==0){g=5350;break}if((c[h+32>>2]|0)>>>0>d>>>0){g=5350;break}if((c[h+36>>2]|0)>>>0<d>>>0){g=5350}else{i=h;g=5357}}}while(0);L6740:do{if((g|0)==5350){f=c[b>>2]|0;if((f|0)==0){break}h=0;j=c[b+4>>2]|0;L6743:while(1){k=c[j>>2]|0;do{if((a[k+28|0]|0)!=0){if((c[k+32>>2]|0)>>>0>d>>>0){break}if((c[k+36>>2]|0)>>>0>=d>>>0){break L6743}}}while(0);l=h+1|0;if(l>>>0<f>>>0){h=l;j=j+8|0}else{break L6740}}c[e>>2]=j;i=k;g=5357}}while(0);do{if((g|0)==5357){if((i|0)==0){break}k=d-(c[i+32>>2]|0)|0;e=c[i>>2]|0;if((e|0)==0){m=a[(c[i+44>>2]|0)+k|0]|0;return m|0}else{m=b6[e&63](c[i+24>>2]|0,k)|0;return m|0}}}while(0);i=c[b+28>>2]|0;if((i|0)==0){m=c[b+52>>2]&255;return m|0}else{m=b6[i&63](c[b+24>>2]|0,d)|0;return m|0}return 0}function n0(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;f=b+12|0;g=c[f>>2]|0;do{if((g|0)==0){h=5373}else{i=c[g>>2]|0;if((a[i+28|0]|0)==0){h=5373;break}if((c[i+32>>2]|0)>>>0>e>>>0){h=5373;break}if((c[i+36>>2]|0)>>>0<e>>>0){h=5373}else{j=i;h=5380}}}while(0);L6769:do{if((h|0)==5373){g=c[b>>2]|0;if((g|0)==0){break}i=0;k=c[b+4>>2]|0;L6772:while(1){l=c[k>>2]|0;do{if((a[l+28|0]|0)!=0){if((c[l+32>>2]|0)>>>0>e>>>0){break}if((c[l+36>>2]|0)>>>0>=e>>>0){break L6772}}}while(0);m=i+1|0;if(m>>>0<g>>>0){i=m;k=k+8|0}else{break L6769}}c[f>>2]=k;j=l;h=5380}}while(0);do{if((h|0)==5380){if((j|0)==0){break}l=e+1|0;if(l>>>0>(c[j+36>>2]|0)>>>0){f=((n$(b,e)|0)&255)<<8;n=f|(n$(b,l)|0)&255;return n|0}l=e-(c[j+32>>2]|0)|0;f=c[j+4>>2]|0;if((f|0)==0){i=c[j+44>>2]|0;n=d[i+l|0]<<8|d[i+(l+1)|0];return n|0}else{n=b6[f&63](c[j+24>>2]|0,l)|0;return n|0}}}while(0);j=c[b+32>>2]|0;if((j|0)==0){n=c[b+52>>2]&65535;return n|0}else{n=b6[j&63](c[b+24>>2]|0,e)|0;return n|0}return 0}function n1(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;f=b+12|0;g=c[f>>2]|0;do{if((g|0)==0){h=5399}else{i=c[g>>2]|0;if((a[i+28|0]|0)==0){h=5399;break}if((c[i+32>>2]|0)>>>0>e>>>0){h=5399;break}if((c[i+36>>2]|0)>>>0<e>>>0){h=5399}else{j=i;h=5406}}}while(0);L6802:do{if((h|0)==5399){g=c[b>>2]|0;if((g|0)==0){break}i=0;k=c[b+4>>2]|0;L6805:while(1){l=c[k>>2]|0;do{if((a[l+28|0]|0)!=0){if((c[l+32>>2]|0)>>>0>e>>>0){break}if((c[l+36>>2]|0)>>>0>=e>>>0){break L6805}}}while(0);m=i+1|0;if(m>>>0<g>>>0){i=m;k=k+8|0}else{break L6802}}c[f>>2]=k;j=l;h=5406}}while(0);do{if((h|0)==5406){if((j|0)==0){break}l=e+3|0;if(l>>>0>(c[j+36>>2]|0)>>>0){f=((n$(b,e)|0)&255)<<24;i=((n$(b,e+1|0)|0)&255)<<16|f;f=i|((n$(b,e+2|0)|0)&255)<<8;n=f|(n$(b,l)|0)&255;return n|0}l=e-(c[j+32>>2]|0)|0;f=c[j+8>>2]|0;if((f|0)==0){i=c[j+44>>2]|0;n=d[i+(l+1)|0]<<16|d[i+l|0]<<24|d[i+(l+2)|0]<<8|d[i+(l+3)|0];return n|0}else{n=b6[f&63](c[j+24>>2]|0,l)|0;return n|0}}}while(0);j=c[b+36>>2]|0;if((j|0)==0){n=c[b+52>>2]|0;return n|0}else{n=b6[j&63](c[b+24>>2]|0,e)|0;return n|0}return 0}function n2(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;f=b+8|0;g=c[f>>2]|0;do{if((g|0)==0){h=5425}else{i=c[g>>2]|0;if((a[i+28|0]|0)==0){h=5425;break}if((c[i+32>>2]|0)>>>0>d>>>0){h=5425;break}if((c[i+36>>2]|0)>>>0<d>>>0){h=5425}else{j=i;h=5432}}}while(0);L6835:do{if((h|0)==5425){g=c[b>>2]|0;if((g|0)==0){break}i=0;k=c[b+4>>2]|0;L6838:while(1){l=c[k>>2]|0;do{if((a[l+28|0]|0)!=0){if((c[l+32>>2]|0)>>>0>d>>>0){break}if((c[l+36>>2]|0)>>>0>=d>>>0){break L6838}}}while(0);m=i+1|0;if(m>>>0<g>>>0){i=m;k=k+8|0}else{break L6835}}c[f>>2]=k;j=l;h=5432}}while(0);do{if((h|0)==5432){if((j|0)==0){break}l=d-(c[j+32>>2]|0)|0;f=c[j+12>>2]|0;if((f|0)==0){a[(c[j+44>>2]|0)+l|0]=e;return}else{b3[f&63](c[j+24>>2]|0,l,e);return}}}while(0);j=c[b+40>>2]|0;if((j|0)==0){return}b3[j&63](c[b+24>>2]|0,d,e);return}function n3(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;f=b+16|0;g=c[f>>2]|0;do{if((g|0)==0){h=5447}else{i=c[g>>2]|0;if((a[i+28|0]|0)==0){h=5447;break}if((c[i+32>>2]|0)>>>0>d>>>0){h=5447;break}if((c[i+36>>2]|0)>>>0<d>>>0){h=5447}else{j=i;h=5454}}}while(0);L6863:do{if((h|0)==5447){g=c[b>>2]|0;if((g|0)==0){break}i=0;k=c[b+4>>2]|0;L6866:while(1){l=c[k>>2]|0;do{if((a[l+28|0]|0)!=0){if((c[l+32>>2]|0)>>>0>d>>>0){break}if((c[l+36>>2]|0)>>>0>=d>>>0){break L6866}}}while(0);m=i+1|0;if(m>>>0<g>>>0){i=m;k=k+8|0}else{break L6863}}c[f>>2]=k;j=l;h=5454}}while(0);do{if((h|0)==5454){if((j|0)==0){break}if((a[j+29|0]|0)!=0){return}l=d-(c[j+32>>2]|0)|0;f=c[j+12>>2]|0;if((f|0)==0){a[(c[j+44>>2]|0)+l|0]=e;return}else{b3[f&63](c[j+24>>2]|0,l,e);return}}}while(0);j=c[b+40>>2]|0;if((j|0)==0){return}b3[j&63](c[b+24>>2]|0,d,e);return}function n4(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;f=b+16|0;g=c[f>>2]|0;do{if((g|0)==0){h=5471}else{i=c[g>>2]|0;if((a[i+28|0]|0)==0){h=5471;break}if((c[i+32>>2]|0)>>>0>d>>>0){h=5471;break}if((c[i+36>>2]|0)>>>0<d>>>0){h=5471}else{j=i;h=5478}}}while(0);L6894:do{if((h|0)==5471){g=c[b>>2]|0;if((g|0)==0){break}i=0;k=c[b+4>>2]|0;L6897:while(1){l=c[k>>2]|0;do{if((a[l+28|0]|0)!=0){if((c[l+32>>2]|0)>>>0>d>>>0){break}if((c[l+36>>2]|0)>>>0>=d>>>0){break L6897}}}while(0);m=i+1|0;if(m>>>0<g>>>0){i=m;k=k+8|0}else{break L6894}}c[f>>2]=k;j=l;h=5478}}while(0);do{if((h|0)==5478){if((j|0)==0){break}l=d+1|0;if(l>>>0>(c[j+36>>2]|0)>>>0){n3(b,d,(e&65535)>>>8&255);n3(b,l,e&255);return}if((a[j+29|0]|0)!=0){return}l=d-(c[j+32>>2]|0)|0;f=c[j+16>>2]|0;if((f|0)==0){i=j+44|0;a[(c[i>>2]|0)+l|0]=(e&65535)>>>8&255;a[(c[i>>2]|0)+(l+1)|0]=e&255;return}else{b3[f&63](c[j+24>>2]|0,l,e);return}}}while(0);j=c[b+44>>2]|0;if((j|0)==0){return}b3[j&63](c[b+24>>2]|0,d,e);return}function n5(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;f=b+16|0;g=c[f>>2]|0;do{if((g|0)==0){h=5498}else{i=c[g>>2]|0;if((a[i+28|0]|0)==0){h=5498;break}if((c[i+32>>2]|0)>>>0>d>>>0){h=5498;break}if((c[i+36>>2]|0)>>>0<d>>>0){h=5498}else{j=i;h=5505}}}while(0);L6929:do{if((h|0)==5498){g=c[b>>2]|0;if((g|0)==0){break}i=0;k=c[b+4>>2]|0;L6932:while(1){l=c[k>>2]|0;do{if((a[l+28|0]|0)!=0){if((c[l+32>>2]|0)>>>0>d>>>0){break}if((c[l+36>>2]|0)>>>0>=d>>>0){break L6932}}}while(0);m=i+1|0;if(m>>>0<g>>>0){i=m;k=k+8|0}else{break L6929}}c[f>>2]=k;j=l;h=5505}}while(0);do{if((h|0)==5505){if((j|0)==0){break}l=d+3|0;if(l>>>0>(c[j+36>>2]|0)>>>0){n3(b,d,e>>>24&255);n3(b,d+1|0,e>>>16&255);n3(b,d+2|0,e>>>8&255);n3(b,l,e&255);return}if((a[j+29|0]|0)!=0){return}l=d-(c[j+32>>2]|0)|0;f=c[j+20>>2]|0;if((f|0)==0){i=j+44|0;a[(c[i>>2]|0)+l|0]=e>>>24&255;a[(c[i>>2]|0)+(l+1)|0]=e>>>16&255;a[(c[i>>2]|0)+(l+2)|0]=e>>>8&255;a[(c[i>>2]|0)+(l+3)|0]=e&255;return}else{b3[f&63](c[j+24>>2]|0,l,e);return}}}while(0);j=c[b+48>>2]|0;if((j|0)==0){return}b3[j&63](c[b+24>>2]|0,d,e);return}function n6(a,b){a=a|0;b=b|0;c[a+76>>2]=b;return}function n7(a,b){a=a|0;b=b|0;return(((d[a+b|0]|0)<<8|(d[a+(b+1)|0]|0))<<8|(d[a+(b+2)|0]|0))<<8|(d[a+(b+3)|0]|0)|0}function n8(b,c,d){b=b|0;c=c|0;d=d|0;a[b+c|0]=d>>>24&255;a[b+(c+1)|0]=d>>>16&255;a[b+(c+2)|0]=d>>>8&255;a[b+(c+3)|0]=d&255;return}function n9(a,b){a=a|0;b=b|0;return(((d[a+(b+3)|0]|0)<<8|(d[a+(b+2)|0]|0))<<8|(d[a+(b+1)|0]|0))<<8|(d[a+b|0]|0)|0}function oa(a,b){a=a|0;b=b|0;var c=0,e=0,f=0,g=0,h=0,i=0,j=0;c=d[a+(b+7)|0]|0;e=c<<8|0>>>24|(d[a+(b+6)|0]|0);f=e<<8|0>>>24|(d[a+(b+5)|0]|0);g=f<<8|0>>>24|(d[a+(b+4)|0]|0);h=g<<8|0>>>24|(d[a+(b+3)|0]|0);i=h<<8|0>>>24|(d[a+(b+2)|0]|0);j=i<<8|0>>>24|(d[a+(b+1)|0]|0);return(G=((((((0<<8|c>>>24)<<8|e>>>24)<<8|f>>>24)<<8|g>>>24)<<8|h>>>24)<<8|i>>>24)<<8|j>>>24|0,j<<8|0>>>24|(d[a+b|0]|0))|0}function ob(b,c,d){b=b|0;c=c|0;d=d|0;a[b+c|0]=d&255;a[b+(c+1)|0]=d>>>8&255;a[b+(c+2)|0]=d>>>16&255;a[b+(c+3)|0]=d>>>24&255;return}function oc(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;a[b+c|0]=d&255;a[b+(c+1)|0]=(d>>>8|e<<24)&255;a[b+(c+2)|0]=(d>>>16|e<<16)&255;a[b+(c+3)|0]=(d>>>24|e<<8)&255;a[b+(c+4)|0]=e&255;a[b+(c+5)|0]=(e>>>8|0<<24)&255;a[b+(c+6)|0]=(e>>>16|0<<16)&255;a[b+(c+7)|0]=(e>>>24|0<<8)&255;return}function od(a,b,d,f,g,h,i){a=a|0;b=b|0;d=d|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0;j=c[a+68>>2]|0;if((j|0)==0){c[d>>2]=0;k=1;return k|0}a=q_(j,f,g,h,i)|0;if((a|0)==0){c[d>>2]=0;k=1;return k|0}i=a+20|0;h=qA(a,c[i>>2]|0)|0;if((h|0)==0){c[i>>2]=0;l=a}else{l=h}h=c[d>>2]|0;g=e[l+10>>1]|0;if(h>>>0>g>>>0){c[d>>2]=g;m=32;n=g}else{m=0;n=h}if((n|0)!=0){h=c[l+24>>2]|0;vW(b|0,h|0,n)|0}n=c[l+12>>2]|0;l=(n&8|0)==0?m:m|2;m=(n&1|0)==0?l:l|4;l=(n&2|0)==0?m:m|8;m=(n&4|0)==0?l:l|16;if((c[a>>2]|0)==0){k=m;return k|0}c[i>>2]=(c[i>>2]|0)+1;k=m;return k|0}function oe(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0;vV(b|0,0,d|0);i=c[a+68>>2]|0;if((i|0)==0){j=0;return j|0}a=q_(i,e,f,g,h)|0;if((a|0)==0){j=0;return j|0}h=a+20|0;g=qA(a,c[h>>2]|0)|0;if((g|0)==0){c[h>>2]=0;k=a}else{k=g}j=qR(k,b,d)|0;return j|0}function of(b,d,f,g,h,i,j){b=b|0;d=d|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0;k=c[b+68>>2]|0;if((k|0)==0){c[f>>2]=0;l=1;return l|0}if((a[b+56|0]|0)!=0){l=64;return l|0}m=q_(k,g,h,i,j)|0;if((m|0)==0){c[f>>2]=0;l=1;return l|0}j=m+12|0;if((c[j>>2]&8|0)!=0){l=2;return l|0}a[b+72|0]=1;b=c[f>>2]|0;i=e[m+10>>1]|0;if(b>>>0>i>>>0){c[f>>2]=i;n=32;o=i}else{n=0;o=b}if((o|0)!=0){b=c[m+24>>2]|0;vW(b|0,d|0,o)|0}c[j>>2]=c[j>>2]&-3;j=m|0;o=c[j>>2]|0;if((o|0)==0){l=n;return l|0}qy(o);c[j>>2]=0;c[m+20>>2]=0;l=n;return l|0}function og(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0;j=c[b+68>>2]|0;do{if((j|0)==0){k=0}else{if((a[b+56|0]|0)!=0){k=0;break}l=q_(j,f,g,h,i)|0;if((l|0)==0){k=0;break}a[b+72|0]=1;k=qN(l,d,e)|0}}while(0);return k|0}function oh(b){b=b|0;var d=0,e=0;d=c[b+68>>2]|0;if((d|0)==0){e=1;return e|0}if((a[b+56|0]|0)!=0){e=1;return e|0}q0(d);c[b+28>>2]=0;a[b+72|0]=1;e=0;return e|0}function oi(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0;k=c[b+68>>2]|0;if((k|0)==0){l=1;return l|0}if((a[b+56|0]|0)!=0){l=1;return l|0}m=q4(k,d,e,1)|0;if((m|0)==0){l=1;return l|0}a[b+72|0]=1;e=qx(f,g,h,i)|0;if((e|0)==0){l=1;return l|0}qB(e,j);if((qU(m,e)|0)==0){qE(e,c[b+76>>2]|0);m=b+28|0;c[m>>2]=(c[m>>2]|0)+1;l=0;return l|0}else{qy(e);l=1;return l|0}return 0}function oj(d,f,g){d=d|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;h=vP(88)|0;if((h|0)==0){i=0;return i|0}j=h;oD(j,h,0,0,0,0);ou(j,6);ow(j,g);c[h+4>>2]=350;c[h+8>>2]=48;c[h+12>>2]=2;c[h+20>>2]=30;a[h+72|0]=0;c[h+76>>2]=2;c[h+80>>2]=f;c[h+84>>2]=0;g=qs(d,f)|0;c[h+68>>2]=g;if((g|0)==0){ok(j);i=0;return i|0}h=b[g>>1]|0;f=h&65535;if(h<<16>>16==0){i=j;return i|0}h=c[g+4>>2]|0;g=0;d=0;k=0;while(1){l=c[h+(k<<2)>>2]|0;m=b[l+2>>1]|0;n=m&65535;o=n+g|0;if(m<<16>>16==0){p=d}else{m=c[l+4>>2]|0;l=d;q=0;while(1){r=(e[(c[m+(q<<2)>>2]|0)+2>>1]|0)+l|0;s=q+1|0;if(s>>>0<n>>>0){l=r;q=s}else{p=r;break}}}q=k+1|0;if(q>>>0<f>>>0){g=o;d=p;k=q}else{break}}if((o|0)==0|(p|0)==0){i=j;return i|0}k=(((((o>>>0)/(f>>>0)|0)>>>1)+o|0)>>>0)/(f>>>0)|0;d=(((((p>>>0)/(o>>>0)|0)>>>1)+p|0)>>>0)/(o>>>0)|0;if((ox(j,p,f,k,d)|0)!=0){i=j;return i|0}oy(j,f,k,d);i=j;return i|0}function ok(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;d=i;e=c[b+64>>2]|0;L7083:do{if((a[e+72|0]|0)!=0){f=c[q>>2]|0;g=b+24|0;h=c[g>>2]|0;bN(f|0,42912,(x=i,i=i+8|0,c[x>>2]=h,x)|0)|0;h=e+84|0;do{if((c[h>>2]|0)!=0){f=e+68|0;if((c[f>>2]|0)==0){break}if((ov(e)|0)!=0){break}if((qv(c[h>>2]|0,c[f>>2]|0,c[e+80>>2]|0)|0)==0){break L7083}}}while(0);h=c[q>>2]|0;f=c[g>>2]|0;bN(h|0,39728,(x=i,i=i+8|0,c[x>>2]=f,x)|0)|0}}while(0);b=c[e+68>>2]|0;if((b|0)==0){j=e+84|0;k=j;l=c[k>>2]|0;vQ(l);vQ(e);i=d;return}qY(b);j=e+84|0;k=j;l=c[k>>2]|0;vQ(l);vQ(e);i=d;return}function ol(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;f=i;i=i+32|0;g=f|0;h=f+8|0;j=f+16|0;k=f+24|0;l=c[a+64>>2]|0;a=l;m=l+68|0;if((e|0)==0){n=0;i=f;return n|0}else{o=d;p=e;q=b}while(1){if((q5(c[m>>2]|0,o,g,h,j)|0)!=0){n=1;r=5634;break}c[k>>2]=512;b=(od(a,q,k,c[g>>2]|0,c[h>>2]|0,c[j>>2]|0,1)|0)==0;if(!(b&(c[k>>2]|0)==512)){n=1;r=5637;break}b=p-1|0;if((b|0)==0){n=0;r=5636;break}else{o=o+1|0;p=b;q=q+512|0}}if((r|0)==5636){i=f;return n|0}else if((r|0)==5634){i=f;return n|0}else if((r|0)==5637){i=f;return n|0}return 0}function om(d,e,f,g){d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;h=i;i=i+24|0;j=h|0;k=h+8|0;l=h+16|0;L7107:do{if((a[d+56|0]|0)==0){m=c[d+64>>2]|0;n=m+68|0;o=m+56|0;if((g|0)==0){p=0;break}q=m+72|0;m=f;r=g;s=e;while(1){if((q5(c[n>>2]|0,m,j,k,l)|0)!=0){p=1;break L7107}t=c[n>>2]|0;if((t|0)==0){p=1;break L7107}if((a[o]|0)!=0){p=1;break L7107}u=q_(t,c[j>>2]|0,c[k>>2]|0,c[l>>2]|0,1)|0;if((u|0)==0){p=1;break L7107}t=u+12|0;if((c[t>>2]&8|0)!=0){p=1;break L7107}a[q]=1;v=b[u+10>>1]|0;if((v&65535)<512){if(v<<16>>16==0){w=0;x=32}else{y=v&65535;z=32;A=5648}}else{y=512;z=0;A=5648}if((A|0)==5648){A=0;v=c[u+24>>2]|0;vW(v|0,s|0,y)|0;w=y;x=z}c[t>>2]=c[t>>2]&-3;t=u|0;v=c[t>>2]|0;if((v|0)!=0){qy(v);c[t>>2]=0;c[u+20>>2]=0}if(!((x|0)==0&(w|0)==512)){p=1;break L7107}u=r-1|0;if((u|0)==0){p=0;break}else{m=m+1|0;r=u;s=s+512|0}}}else{p=1}}while(0);i=h;return p|0}function on(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;e=c[b+64>>2]|0;if((aQ(d|0,46408)|0)!=0){f=1;return f|0}d=e+84|0;if((c[d>>2]|0)==0){f=1;return f|0}b=e+68|0;if((c[b>>2]|0)==0){f=1;return f|0}if((ov(e)|0)!=0){f=1;return f|0}if((qv(c[d>>2]|0,c[b>>2]|0,c[e+80>>2]|0)|0)!=0){f=1;return f|0}a[e+72|0]=0;f=0;return f|0}function oo(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;do{if((b|0)==0){e=qt(a)|0;if((e|0)!=0){f=e;break}e=qr(a)|0;if((e|0)==0){g=0}else{f=e;break}return g|0}else{f=b}}while(0);do{if((d|0)==0){b=bl(a|0,57008)|0;if((b|0)!=0){h=0;i=b;break}j=bl(a|0,55432)|0;k=1;l=5674}else{j=bl(a|0,55432)|0;k=d;l=5674}}while(0);do{if((l|0)==5674){if((j|0)==0){g=0}else{h=k;i=j;break}return g|0}}while(0);j=oj(i,f,h)|0;av(i|0)|0;if((j|0)==0){g=0;return g|0}i=c[j+64>>2]|0;h=vP((vX(a|0)|0)+1|0)|0;c[i+84>>2]=h;if((h|0)!=0){v_(h|0,a|0)|0}oF(j,a);g=j;return g|0}function op(a){a=a|0;return qt(a)|0}function oq(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;g=0;if(d>>>0>g>>>0|d>>>0==g>>>0&c>>>0>2147483647>>>0){h=1;return h|0}if((bR(a|0,c|0,0)|0)!=0){h=1;return h|0}c=bK(b|0,1,e|0,a|0)|0;a=c;g=0;if(!(g>>>0<f>>>0|g>>>0==f>>>0&a>>>0<e>>>0)){h=0;return h|0}d=v3(e,f,a,g)|0;vV(b+c|0,0,d|0);h=0;return h|0}function or(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;g=0;if(d>>>0>g>>>0|d>>>0==g>>>0&c>>>0>2147483647>>>0){h=1;return h|0}if((bR(a|0,c|0,0)|0)!=0){h=1;return h|0}h=((aC(b|0,1,e|0,a|0)|0)!=(e|0)|0!=(f|0))&1;return h|0}function os(a,b){a=a|0;b=b|0;c[a+24>>2]=b;return}function ot(a){a=a|0;return c[a>>2]|0}function ou(a,b){a=a|0;b=b|0;c[a>>2]=b;return}function ov(b){b=b|0;return(a[b+56|0]|0)!=0|0}function ow(b,c){b=b|0;c=c|0;a[b+56|0]=(c|0)!=0|0;return}function ox(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;do{if((b|0)==0){g=ac(ac(e,d)|0,f)|0;if((g|0)==0){h=1}else{i=g;break}return h|0}else{i=b}}while(0);do{if((d|0)==0){b=(f|0)==0?63:f;g=(e|0)==0?16:e;j=b;k=(i>>>0)/((ac(b,g)|0)>>>0)|0;l=g}else{g=(f|0)==0;if((e|0)==0){b=g?63:f;j=b;k=d;l=(i>>>0)/((ac(b,d)|0)>>>0)|0;break}if(!g){j=f;k=d;l=e;break}j=(i>>>0)/((ac(e,d)|0)>>>0)|0;k=d;l=e}}while(0);c[a+28>>2]=i;c[a+32>>2]=k;c[a+36>>2]=l;c[a+40>>2]=j;h=0;return h|0}function oy(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;c[a+44>>2]=b;c[a+48>>2]=d;c[a+52>>2]=e;return}function oz(a){a=a|0;return c[a+24>>2]|0}function oA(a){a=a|0;return c[a+28>>2]|0}function oB(a,b){a=a|0;b=b|0;var d=0,e=0;if((bR(a|0,0,2)|0)!=0){d=1;return d|0}e=a0(a|0)|0;if((e|0)==-1){d=1;return d|0}c[b>>2]=e;c[b+4>>2]=(e|0)<0?-1:0;d=0;return d|0}function oC(a,b,c){a=a|0;b=b|0;c=c|0;ay(a|0)|0;return(a8(aL(a|0)|0,b|0)|0)!=0|0}function oD(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0;vV(b|0,0,28);if((e|0)==0){i=ac(ac(g,f)|0,h)|0;if((i|0)==0){j=h;k=g;l=f;m=0}else{n=i;o=5731}}else{n=e;o=5731}do{if((o|0)==5731){if((f|0)==0){e=(h|0)==0?63:h;i=(g|0)==0?16:g;j=e;k=i;l=(n>>>0)/((ac(e,i)|0)>>>0)|0;m=n;break}i=(h|0)==0;if((g|0)==0){e=i?63:h;j=e;k=(n>>>0)/((ac(e,f)|0)>>>0)|0;l=f;m=n;break}if(!i){j=h;k=g;l=f;m=n;break}j=(n>>>0)/((ac(g,f)|0)>>>0)|0;k=g;l=f;m=n}}while(0);c[b+28>>2]=m;c[b+32>>2]=l;c[b+36>>2]=k;c[b+40>>2]=j;c[b+44>>2]=l;c[b+48>>2]=k;c[b+52>>2]=j;a[b+56|0]=0;c[b+60>>2]=0;c[b+64>>2]=d;return}function oE(a){a=a|0;var b=0;if((a|0)==0){return}vQ(c[a+60>>2]|0);b=c[a+4>>2]|0;if((b|0)==0){return}b0[b&1023](a);return}function oF(a,b){a=a|0;b=b|0;var d=0;d=a+60|0;a=c[d>>2]|0;if((a|0)!=0){vQ(a)}if((b|0)==0){c[d>>2]=0;return}a=vP((vX(b|0)|0)+1|0)|0;c[d>>2]=a;if((a|0)==0){return}v_(a|0,b|0)|0;return}function oG(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=a|0;e=c[d>>2]|0;if((e|0)==0){f=0;g=0;c[d>>2]=g;return f|0}h=a+4|0;a=0;i=0;j=0;k=e;while(1){e=c[h>>2]|0;l=c[e+(i<<2)>>2]|0;if((l|0)==(b|0)){m=j;n=1;o=k}else{c[e+(j<<2)>>2]=l;m=j+1|0;n=a;o=c[d>>2]|0}l=i+1|0;if(l>>>0<o>>>0){a=n;i=l;j=m;k=o}else{f=n;g=m;break}}c[d>>2]=g;return f|0}function oH(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=a+4|0;e=c[a>>2]|0;a=0;while(1){if(a>>>0>=e>>>0){f=0;g=13;break}h=c[(c[d>>2]|0)+(a<<2)>>2]|0;if((c[h+24>>2]|0)==(b|0)){f=h;g=14;break}else{a=a+1|0}}if((g|0)==13){return f|0}else if((g|0)==14){return f|0}return 0}function oI(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;e=i;i=i+512|0;f=e|0;g=f|0;h=b+8|0;j=c[h>>2]|0;L18:do{if((j|0)!=0){if((b5[j&127](b,g,0,1)|0)!=0){break}if((a[f+510|0]|0)!=85){break}if((a[f+511|0]|0)==-86){k=0;l=0;m=0;n=0}else{break}while(1){o=l<<4;do{if((a[f+(o+446)|0]&127)==0){p=d[f+(o+448)|0]|0;q=a[f+(o+447)|0]|0;r=p&63;s=((d[f+(o+457)|0]<<8|d[f+(o+456)|0])<<8|d[f+(o+455)|0])<<8|d[f+(o+454)|0];t=d[f+(o+452)|0]|0;u=t&63;v=((d[f+(o+461)|0]<<8|d[f+(o+460)|0])<<8|d[f+(o+459)|0])<<8|d[f+(o+458)|0];if((r|0)==0|(u|0)==0|(s|0)==0|(v|0)==0){w=n;x=m;y=k;break}z=r-1|0;r=u-1|0;u=s-1+v|0;if(!(s>>>0>z>>>0&u>>>0>r>>>0)){w=n;x=m;y=k;break}v=p<<2&768|d[f+(o+449)|0];p=0;A=u-r|0;r=0;u=t<<2&768|d[f+(o+453)|0];t=0;B=d[f+(o+451)|0]|0;C=0;D=wc(B,C,v,p)|0;E=G;F=wc(u,t,q&255,0)|0;q=G;if((D|0)==(F|0)&(E|0)==(q|0)){w=n;x=m;y=k;break}H=wc(u,t,s-z|0,0)|0;z=G;s=wc(A,r,v,p)|0;p=G;v=v3(D,E,F,q)|0;q=G;F=v3(s,p,H,z)|0;z=wa(F,G,v,q)|0;q=z;v=z|0;z=G&0;F=wc(v,z,u,t)|0;t=G;if((F|0)==0&(t|0)==0){I=k}else{u=wc(v,z,B,C)|0;C=v3(A,r,u,G)|0;u=wa(C,G,F,t)|0;t=u;if((t|0)==0){w=n;x=m;y=0;break}if((q|0)==0){w=n;x=m;y=t;break}else{I=t}}if(!((m|0)==0|(m|0)==(I|0))){break L18}if((n|0)==0|(n|0)==(q|0)){w=q;x=I;y=I}else{break L18}}else{w=n;x=m;y=k}}while(0);o=l+1|0;if(o>>>0<4){k=y;l=o;m=x;n=w}else{break}}if((x|0)==0|(w|0)==0){break}o=b+28|0;q=c[o>>2]|0;t=ac(w,x)|0;u=(q>>>0)/(t>>>0)|0;do{if((q|0)==0){F=ac(u,t)|0;if((F|0)!=0){J=F;break}i=e;return 0}else{J=q}}while(0);if((u|0)==0){K=(J>>>0)/(t>>>0)|0}else{K=u}c[o>>2]=J;c[b+32>>2]=K;c[b+36>>2]=x;c[b+40>>2]=w;i=e;return 0}}while(0);w=c[h>>2]|0;do{if((w|0)!=0){if((b5[w&127](b,g,0,1)|0)!=0){break}if((a[f+510|0]|0)!=85){break}if((a[f+511|0]|0)!=-86){break}if((d[f+12|0]<<8|d[f+11|0])<<16>>16!=512){break}x=d[f+27|0]<<8|d[f+26|0];K=x&65535;J=d[f+25|0]<<8|d[f+24|0];n=J&65535;if(x<<16>>16==0|(x&65535)>255){break}if(J<<16>>16==0|(J&65535)>255){break}J=b+28|0;x=c[J>>2]|0;m=ac(n,K)|0;l=(x>>>0)/(m>>>0)|0;do{if((x|0)==0){y=ac(l,m)|0;if((y|0)!=0){L=y;break}i=e;return 0}else{L=x}}while(0);if((l|0)==0){M=(L>>>0)/(m>>>0)|0}else{M=l}c[J>>2]=L;c[b+32>>2]=M;c[b+36>>2]=K;c[b+40>>2]=n;i=e;return 0}}while(0);M=c[h>>2]|0;do{if((M|0)!=0){if((b5[M&127](b,g,0,1)|0)!=0){break}if((d[f+508|0]<<8|d[f+509|0])<<16>>16==-9538){N=0;O=0}else{break}while(1){P=d[f+N|0]<<8^O;Q=d[f+(N|1)|0]|0;h=N+2|0;if(h>>>0<512){N=h;O=P^Q}else{break}}if((P|0)!=(Q|0)){break}if((((d[f+128|0]<<8|d[f+129|0])<<8|d[f+130|0])<<8|d[f+131|0]|0)!=1){break}if(((d[f+140|0]<<8|d[f+141|0])&65535)>8){break}n=d[f+422|0]<<8|d[f+423|0];K=n&65535;J=d[f+436|0]<<8|d[f+437|0];l=J&65535;m=d[f+438|0]<<8|d[f+439|0];h=m&65535;L=b+28|0;w=c[L>>2]|0;do{if((w|0)==0){x=ac(ac(l,K)|0,h)|0;if((x|0)!=0){R=x;break}i=e;return 0}else{R=w}}while(0);do{if(n<<16>>16==0){w=m<<16>>16==0?63:h;x=J<<16>>16==0?16:l;S=w;T=(R>>>0)/((ac(w,x)|0)>>>0)|0;U=x}else{x=m<<16>>16==0;if(J<<16>>16==0){w=x?63:h;S=w;T=K;U=(R>>>0)/((ac(w,K)|0)>>>0)|0;break}if(!x){S=h;T=K;U=l;break}S=(R>>>0)/((ac(l,K)|0)>>>0)|0;T=K;U=l}}while(0);c[L>>2]=R;c[b+32>>2]=T;c[b+36>>2]=U;c[b+40>>2]=S;i=e;return 0}}while(0);S=b+28|0;U=c[S>>2]|0;if((U|0)==320){c[S>>2]=320;c[b+32>>2]=40;c[b+36>>2]=1;c[b+40>>2]=8;i=e;return 0}else if((U|0)==360){c[S>>2]=360;c[b+32>>2]=40;c[b+36>>2]=1;c[b+40>>2]=9;i=e;return 0}else if((U|0)==640){c[S>>2]=640;c[b+32>>2]=40;c[b+36>>2]=2;c[b+40>>2]=8;i=e;return 0}else if((U|0)==720){c[S>>2]=720;c[b+32>>2]=40;c[b+36>>2]=2;c[b+40>>2]=9;i=e;return 0}else if((U|0)==800){c[S>>2]=800;c[b+32>>2]=40;c[b+36>>2]=2;c[b+40>>2]=10;i=e;return 0}else if((U|0)==1440){c[S>>2]=1440;c[b+32>>2]=80;c[b+36>>2]=2;c[b+40>>2]=9;i=e;return 0}else if((U|0)==1600){c[S>>2]=1600;c[b+32>>2]=80;c[b+36>>2]=2;c[b+40>>2]=10;i=e;return 0}else if((U|0)==2400){c[S>>2]=2400;c[b+32>>2]=80;c[b+36>>2]=2;c[b+40>>2]=15;i=e;return 0}else if((U|0)==2880){c[S>>2]=2880;c[b+32>>2]=80;c[b+36>>2]=2;c[b+40>>2]=18;i=e;return 0}else if((U|0)==5760){c[S>>2]=5760;c[b+32>>2]=80;c[b+36>>2]=2;c[b+40>>2]=36;i=e;return 0}else{T=b+32|0;R=c[T>>2]|0;f=b+36|0;Q=c[f>>2]|0;P=b+40|0;b=c[P>>2]|0;do{if((U|0)==0){O=ac(ac(Q,R)|0,b)|0;if((O|0)!=0){V=O;break}i=e;return 0}else{V=U}}while(0);do{if((R|0)==0){U=(b|0)==0?63:b;O=(Q|0)==0?16:Q;W=U;X=(V>>>0)/((ac(U,O)|0)>>>0)|0;Y=O}else{O=(b|0)==0;if((Q|0)==0){U=O?63:b;W=U;X=R;Y=(V>>>0)/((ac(U,R)|0)>>>0)|0;break}if(!O){W=b;X=R;Y=Q;break}W=(V>>>0)/((ac(Q,R)|0)>>>0)|0;X=R;Y=Q}}while(0);c[S>>2]=V;c[T>>2]=X;c[f>>2]=Y;c[P>>2]=W;i=e;return 0}return 0}function oJ(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;do{if((o1(a)|0)==0){if((pb(a)|0)!=0){e=o6(a,d)|0;break}if((oW(a)|0)!=0){e=oV(a,d)|0;break}f=op(a)|0;if((f|0)!=0){e=oo(a,f,d)|0;break}f=qr(a)|0;if((f|0)==12|(f|0)==0){e=pe(a,b,c,d)|0;break}else{e=oo(a,f,d)|0;break}}else{e=o0(a,d)|0}}while(0);return e|0}function oK(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=c[a+8>>2]|0;if((f|0)==0){g=1;return g|0}g=b5[f&127](a,b,d,e)|0;return g|0}function oL(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=c[a+12>>2]|0;if((f|0)==0){g=1;return g|0}g=b5[f&127](a,b,d,e)|0;return g|0}function oM(){var a=0,b=0;a=vP(8)|0;if((a|0)==0){b=0;return b|0}c[a>>2]=0;c[a+4>>2]=0;b=a;return b|0}function oN(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0;d=a|0;e=c[d>>2]|0;f=a+4|0;a=b+24|0;g=0;while(1){if(g>>>0>=e>>>0){break}if((c[(c[(c[f>>2]|0)+(g<<2)>>2]|0)+24>>2]|0)==(c[a>>2]|0)){h=1;i=135;break}else{g=g+1|0}}if((i|0)==135){return h|0}i=e+1|0;e=vR(c[f>>2]|0,i<<2)|0;g=e;if((e|0)==0){h=1;return h|0}c[g+(c[d>>2]<<2)>>2]=b;c[d>>2]=i;c[f>>2]=g;h=0;return h|0}function oO(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;b=a|0;d=c[b>>2]|0;if((d|0)==0){e=0;return e|0}f=a+4|0;a=0;g=0;h=d;while(1){d=c[(c[f>>2]|0)+(a<<2)>>2]|0;i=c[d+20>>2]|0;if((i|0)==0){j=g;k=h}else{l=(b2[i&127](d,55256,63016)|0)==0?g:1;j=l;k=c[b>>2]|0}l=a+1|0;if(l>>>0<k>>>0){a=l;g=j;h=k}else{e=j;break}}return e|0}function oP(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;f=a+4|0;g=c[a>>2]|0;a=0;while(1){if(a>>>0>=g>>>0){h=1;i=153;break}j=c[(c[f>>2]|0)+(a<<2)>>2]|0;if((c[j+24>>2]|0)==(b|0)){break}else{a=a+1|0}}if((i|0)==153){return h|0}if((j|0)==0){h=1;return h|0}i=c[j+20>>2]|0;if((i|0)==0){h=1;return h|0}h=b2[i&127](j,d,(e|0)==0?63016:e)|0;return h|0}function oQ(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return 1}function oR(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;d=i;i=i+32|0;e=d|0;if((oq(a,e,0,0,23,0)|0)!=0){f=0;i=d;return f|0}if((vZ(e|0,55e3,7)|0)!=0){f=0;i=d;return f|0}g=n9(e,15)|0;h=n9(e,7)|0;j=n9(e,11)|0;k=n9(e,19)|0;if(k>>>0<23){f=0;i=d;return f|0}e=vP(80)|0;if((e|0)==0){f=0;i=d;return f|0}l=e;oD(l,e,0,g,h,j);ou(l,4);ow(l,b);c[e+4>>2]=372;c[e+8>>2]=32;c[e+12>>2]=28;b=e+72|0;c[b>>2]=k;c[b+4>>2]=0;c[e+68>>2]=a;f=l;i=d;return f|0}function oS(a){a=a|0;var b=0;b=c[a+64>>2]|0;av(c[b+68>>2]|0)|0;vQ(b);return}function oT(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((e+d|0)>>>0>(c[a+28>>2]|0)>>>0){f=1;return f|0}g=c[a+64>>2]|0;a=g+72|0;h=d;d=v2(c[a>>2]|0,c[a+4>>2]|0,h<<9|0>>>23,0<<9|h>>>23)|0;h=e;f=(oq(c[g+68>>2]|0,b,d,G,h<<9|0>>>23,0<<9|h>>>23)|0)!=0|0;return f|0}function oU(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;if((a[b+56|0]|0)!=0){g=1;return g|0}if((f+e|0)>>>0>(c[b+28>>2]|0)>>>0){g=1;return g|0}h=c[b+64>>2]|0;b=h+72|0;i=e;e=v2(c[b>>2]|0,c[b+4>>2]|0,i<<9|0>>>23,0<<9|i>>>23)|0;i=f;f=h+68|0;if((or(c[f>>2]|0,d,e,G,i<<9|0>>>23,0<<9|i>>>23)|0)!=0){g=1;return g|0}ay(c[f>>2]|0)|0;g=0;return g|0}function oV(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0;do{if((b|0)==0){c=bl(a|0,50400|0)|0;if((c|0)!=0){d=0;e=c;break}f=bl(a|0,56976|0)|0;g=1;h=188}else{f=bl(a|0,56976|0)|0;g=b;h=188}}while(0);do{if((h|0)==188){if((f|0)==0){i=0}else{d=g;e=f;break}return i|0}}while(0);f=oR(e,d)|0;if((f|0)==0){av(e|0)|0;i=0;return i|0}else{oF(f,a);i=f;return i|0}return 0}function oW(a){a=a|0;var b=0,c=0,d=0,e=0;b=i;i=i+8|0;c=bl(a|0,56976)|0;if((c|0)==0){d=0;i=b;return d|0}a=b|0;if((oq(c,a,0,0,8,0)|0)==0){e=(vZ(a|0,55e3,7)|0)==0|0}else{e=0}av(c|0)|0;d=e;i=b;return d|0}function oX(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;d=i;i=i+32|0;e=d|0;if((bK(e|0,1,32,a|0)|0)!=32){f=0;i=d;return f|0}if((n7(e,0)|0)!=1346981191){f=0;i=d;return f|0}if((n7(e,4)|0)!=0){f=0;i=d;return f|0}if((n7(e,28)|0)!=512){f=0;i=d;return f|0}g=n7(e,12)|0;h=n7(e,16)|0;j=n7(e,20)|0;k=n7(e,24)|0;l=vP(80)|0;if((l|0)==0){f=0;i=d;return f|0}m=l;oD(m,l,g,h,j,k);ou(m,3);ow(m,b);c[l+68>>2]=a;c[l+4>>2]=68;c[l+8>>2]=54;c[l+12>>2]=44;c[l+16>>2]=50;c[l+20>>2]=24;c[l+72>>2]=n7(e,8)|0;c[l+76>>2]=n7(e,28)|0;f=m;i=d;return f|0}function oY(a){a=a|0;var b=0;b=c[a+64>>2]|0;a=c[b+68>>2]|0;if((a|0)==0){vQ(b);return}av(a|0)|0;vQ(b);return}function oZ(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=c[a+64>>2]|0;if((e+d|0)>>>0>(c[f+28>>2]|0)>>>0){g=1;return g|0}a=d;d=v2(c[f+72>>2]|0,0,a<<9|0>>>23,0<<9|a>>>23)|0;a=e;g=(oq(c[f+68>>2]|0,b,d,G,a<<9|0>>>23,0<<9|a>>>23)|0)!=0|0;return g|0}function o_(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;g=c[b+64>>2]|0;if((a[b+56|0]|0)!=0){h=1;return h|0}if((f+e|0)>>>0>(c[b+28>>2]|0)>>>0){h=1;return h|0}b=e;e=v2(c[g+72>>2]|0,0,b<<9|0>>>23,0<<9|b>>>23)|0;b=f;f=g+68|0;if((or(c[f>>2]|0,d,e,G,b<<9|0>>>23,0<<9|b>>>23)|0)!=0){h=1;return h|0}ay(c[f>>2]|0)|0;h=0;return h|0}function o$(a,b,c){a=a|0;b=b|0;c=c|0;return(aQ(b|0,46400)|0)!=0|0}function o0(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0;do{if((b|0)==0){c=bl(a|0,56968|0)|0;if((c|0)!=0){d=0;e=c;break}f=bl(a|0,54976|0)|0;g=1;h=240}else{f=bl(a|0,54976|0)|0;g=b;h=240}}while(0);do{if((h|0)==240){if((f|0)==0){i=0}else{d=g;e=f;break}return i|0}}while(0);f=oX(e,d)|0;if((f|0)==0){av(e|0)|0;i=0;return i|0}else{oF(f,a);i=f;return i|0}return 0}function o1(a){a=a|0;var b=0,c=0,d=0,e=0;b=i;i=i+8|0;c=bl(a|0,54976)|0;if((c|0)==0){d=0;i=b;return d|0}a=b|0;if((oq(c,a,0,0,4,0)|0)==0){e=(n7(a,0)|0)==1346981191|0}else{e=0}av(c|0)|0;d=e;i=b;return d|0}function o2(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,r=0,s=0,t=0,u=0,v=0,w=0,y=0,z=0;e=i;f=vP(4280)|0;if((f|0)==0){g=0;i=e;return g|0}h=f+4276|0;c[h>>2]=b;c[f+68>>2]=0;j=f+4264|0;c[j>>2]=0;k=f+4268|0;c[k>>2]=0;l=f+4272|0;c[l>>2]=0;m=f+152|0;do{if((oq(b,m,0,0,4096,0)|0)==0){if((n9(m,0)|0)!=4474193){break}n=f+4248|0;a[n]=0;o=f+72|0;c[o>>2]=n9(m,4)|0;p=f+76|0;c[p>>2]=n9(m,8)|0;r=n9(m,12)|0;c[f+80>>2]=r;s=c[o>>2]|0;t=s-1|0;if((t&s|0)!=0){break}u=c[p>>2]|0;if((u-1&u|0)!=0|(r|0)==0){break}r=f+128|0;c[r>>2]=ac(u,s)|0;s=f+136|0;c[s>>2]=t;c[s+4>>2]=0;t=oa(m,16)|0;u=f+88|0;c[u>>2]=t;c[u+4>>2]=G;t=oa(m,24)|0;p=f+96|0;c[p>>2]=t;c[p+4>>2]=G;p=oa(m,32)|0;t=G;v=f+104|0;c[v>>2]=p;c[v+4>>2]=t;w=c[u>>2]&-6;y=c[u+4>>2]|0;if(!((w|0)==0&(y|0)==0)){u=c[q>>2]|0;z=42872;bN(u|0,z|0,(x=i,i=i+16|0,c[x>>2]=w,c[x+8>>2]=y,x)|0)|0;break}if(!((p|0)==0&(t|0)==0)){a[n]=1;c[v>>2]=0;c[v+4>>2]=0;oc(m,32,0,0)}v=oa(m,40)|0;t=f+112|0;c[t>>2]=v;c[t+4>>2]=G;v=f+4256|0;c[v>>2]=0;c[v+4>>2]=0;v=oa(m,48)|0;p=G;y=f+120|0;c[y>>2]=v;c[y+4>>2]=p;if(!((c[s>>2]&c[t>>2]|0)==0&(c[s+4>>2]&c[t+4>>2]|0)==0)){break}if(!((v&511|0)==0&(p&0|0)==0)){break}p=f+144|0;if((oB(c[h>>2]|0,p)|0)!=0){break}v=c[o>>2]|0;w=v2(c[p>>2]|0,c[p+4>>2]|0,-1,-1)|0;z=v2(w,G,v,0)|0;v=G&~c[s+4>>2];c[p>>2]=z&~c[s>>2];c[p+4>>2]=v;do{if((a[n]|0)!=0&(d|0)==0){if((or(c[h>>2]|0,m,0,0,4096,0)|0)==0){v=c[h>>2]|0;ay(v|0)|0;break}vQ(f);g=0;i=e;return g|0}}while(0);n=f;oD(n,f,(c[y>>2]|0)>>>9|c[y+4>>2]<<23,0,0,0);ou(n,7);ow(n,d);c[f+4>>2]=450;c[f+8>>2]=68;c[f+12>>2]=16;v=c[r>>2]|0;p=vP(v)|0;c[j>>2]=p;do{if((p|0)!=0){s=vP(v)|0;c[k>>2]=s;if((s|0)==0){break}s=vP(c[o>>2]|0)|0;c[l>>2]=s;if((s|0)==0){break}if((oq(c[h>>2]|0,p,c[t>>2]|0,c[t+4>>2]|0,v,0)|0)==0){oI(n)|0;g=n;i=e;return g|0}s=c[f+64>>2]|0;z=c[s+68>>2]|0;if((z|0)!=0){oE(z)}vQ(c[s+4272>>2]|0);vQ(c[s+4268>>2]|0);vQ(c[s+4264>>2]|0);z=c[s+4276>>2]|0;av(z|0)|0;vQ(s);g=0;i=e;return g|0}}while(0);n=c[f+64>>2]|0;v=c[n+68>>2]|0;if((v|0)!=0){oE(v)}vQ(c[n+4272>>2]|0);vQ(c[n+4268>>2]|0);vQ(c[n+4264>>2]|0);v=c[n+4276>>2]|0;av(v|0)|0;vQ(n);g=0;i=e;return g|0}}while(0);vQ(f);g=0;i=e;return g|0}function o3(a){a=a|0;var b=0;b=c[a+64>>2]|0;a=c[b+68>>2]|0;if((a|0)!=0){oE(a)}vQ(c[b+4272>>2]|0);vQ(c[b+4268>>2]|0);vQ(c[b+4264>>2]|0);av(c[b+4276>>2]|0)|0;vQ(b);return}function o4(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;f=i;i=i+8|0;g=f|0;if((e+d|0)>>>0>(c[a+28>>2]|0)>>>0){h=1;i=f;return h|0}j=c[a+64>>2]|0;a=j;k=j+72|0;l=j+4276|0;if((e|0)==0){h=0;i=f;return h|0}m=j+68|0;j=d;d=e;e=b;L358:while(1){b=(c[k>>2]|0)>>>9;n=b-((j>>>0)%(b>>>0)|0)|0;b=n>>>0>d>>>0?d:n;n=j;c[g>>2]=n<<9|0>>>23;c[g+4>>2]=0<<9|n>>>23;if((pc(a,g,0)|0)!=0){h=1;o=309;break}n=c[g>>2]|0;p=c[g+4>>2]|0;do{if((n|0)==0&(p|0)==0){q=c[m>>2]|0;if((q|0)==0){r=b<<9;vV(e|0,0,r|0);s=r;break}if((oK(q,e,j,b)|0)!=0){h=1;o=306;break L358}s=b<<9}else{q=b<<9;if((oq(c[l>>2]|0,e,n,p,q,0)|0)==0){s=q}else{h=1;o=307;break L358}}}while(0);if((d|0)==(b|0)){h=0;o=308;break}else{j=b+j|0;d=d-b|0;e=e+s|0}}if((o|0)==306){i=f;return h|0}else if((o|0)==307){i=f;return h|0}else if((o|0)==308){i=f;return h|0}else if((o|0)==309){i=f;return h|0}return 0}function o5(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;f=i;i=i+8|0;g=f|0;if((e+d|0)>>>0>(c[a+28>>2]|0)>>>0){h=1;i=f;return h|0}j=c[a+64>>2]|0;a=j;k=j+72|0;l=j+4276|0;if((e|0)==0){h=0;i=f;return h|0}else{m=d;n=e;o=b}while(1){b=(c[k>>2]|0)>>>9;e=b-((m>>>0)%(b>>>0)|0)|0;b=e>>>0>n>>>0?n:e;e=m;c[g>>2]=e<<9|0>>>23;c[g+4>>2]=0<<9|e>>>23;if((pc(a,g,1)|0)!=0){h=1;p=320;break}e=b<<9;if((or(c[l>>2]|0,o,c[g>>2]|0,c[g+4>>2]|0,e,0)|0)!=0){h=1;p=318;break}if((n|0)==(b|0)){h=0;p=319;break}else{m=b+m|0;n=n-b|0;o=o+e|0}}if((p|0)==318){i=f;return h|0}else if((p|0)==319){i=f;return h|0}else if((p|0)==320){i=f;return h|0}return 0}function o6(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0;do{if((b|0)==0){c=bl(a|0,56960|0)|0;if((c|0)!=0){d=0;e=c;break}f=bl(a|0,54936|0)|0;g=1;h=326}else{f=bl(a|0,54936|0)|0;g=b;h=326}}while(0);do{if((h|0)==326){if((f|0)==0){i=0}else{d=g;e=f;break}return i|0}}while(0);f=o2(e,d)|0;if((f|0)==0){av(e|0)|0;i=0;return i|0}else{oF(f,a);i=f;return i|0}return 0}function o7(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return 1}function o8(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;d=bl(b|0,56960)|0;do{if((d|0)==0){if((c[a>>2]|0)==7){e=c[(c[a+64>>2]|0)+72>>2]|0}else{e=0}f=c[a+28>>2]|0;g=bl(b|0,50392)|0;if((g|0)==0){h=0;return h|0}i=pa(g,f,e)|0;av(g|0)|0;if((i|0)==0){break}else{h=0}return h|0}else{av(d|0)|0}}while(0);d=bl(b|0,56960)|0;do{if((d|0)==0){e=bl(b|0,54936)|0;if((e|0)==0){h=0}else{j=1;k=e;break}return h|0}else{j=0;k=d}}while(0);d=o2(k,j)|0;if((d|0)==0){av(k|0)|0;h=0;return h|0}oF(d,b);k=c[d+64>>2]|0;c[k+68>>2]=a;c[d+16>>2]=10;c[d+20>>2]=14;c[d+24>>2]=c[a+24>>2];j=k+152|0;e=oa(j,16)|0;i=(c[a>>2]|0)==1;oc(j,16,(i?5:1)|e,(i?0:0)|G);i=a+60|0;e=c[i>>2]|0;if((e|0)==0){l=0}else{l=vX(e|0)|0}e=l>>>0>1024?0:l;ob(j,56,64);ob(j,60,e);if((e|0)!=0){l=k+216|0;g=c[i>>2]|0;vW(l|0,g|0,e)|0}e=k+4276|0;if((or(c[e>>2]|0,j,0,0,4096,0)|0)==0){j=c[e>>2]|0;ay(j|0)|0}ox(d,c[a+28>>2]|0,c[a+32>>2]|0,c[a+36>>2]|0,c[a+40>>2]|0)|0;oy(d,c[a+44>>2]|0,c[a+48>>2]|0,c[a+52>>2]|0);oF(d,b);h=d;return h|0}function o9(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;if((aQ(b|0,46392)|0)!=0){e=1;return e|0}b=c[a+64>>2]|0;a=b+68|0;if((c[a>>2]|0)==0){e=1;return e|0}d=b+128|0;f=c[d>>2]|0;g=f>>>3;h=b+72|0;i=(c[h>>2]|0)>>>9;do{if((g|0)==0){j=f;k=b+4276|0;l=b+4264|0}else{m=b+4264|0;n=ac(i,g)|0;o=b+136|0;p=b+4256|0;q=b+4276|0;r=b+4268|0;s=b+4272|0;t=0;u=0;L443:while(1){v=u<<3;w=oa(c[m>>2]|0,v)|0;x=G;if((w|0)==0&(x|0)==0){y=t+n|0}else{z=w&~c[o>>2];w=x&~c[o+4>>2];if((c[p>>2]|0)==(z|0)&(c[p+4>>2]|0)==(w|0)){A=0;B=t}else{if((oq(c[q>>2]|0,c[r>>2]|0,z,w,c[d>>2]|0,0)|0)!=0){e=1;C=380;break}c[p>>2]=z;c[p+4>>2]=w;A=0;B=t}while(1){w=oa(c[r>>2]|0,A<<3)|0;z=G;if((w|0)==0&(z|0)==0){D=B+i|0}else{if((oq(c[q>>2]|0,c[s>>2]|0,w&~c[o>>2],z&~c[o+4>>2],c[h>>2]|0,0)|0)!=0){e=1;C=381;break L443}z=B+i|0;w=c[a>>2]|0;x=c[w+28>>2]|0;if((oL(w,c[s>>2]|0,B,z>>>0>x>>>0?x-B|0:i)|0)==0){D=z}else{e=1;C=382;break L443}}z=A+1|0;if(z>>>0<g>>>0){A=z;B=D}else{break}}oc(c[m>>2]|0,v,0,0);y=D}z=u+1|0;if(z>>>0<g>>>0){t=y;u=z}else{C=375;break}}if((C|0)==380){return e|0}else if((C|0)==381){return e|0}else if((C|0)==382){return e|0}else if((C|0)==375){j=c[d>>2]|0;k=q;l=m;break}}}while(0);C=b+112|0;if((or(c[k>>2]|0,c[l>>2]|0,c[C>>2]|0,c[C+4>>2]|0,j,0)|0)!=0){e=1;return e|0}ay(c[k>>2]|0)|0;j=v2(c[d>>2]|0,0,c[C>>2]|0,c[C+4>>2]|0)|0;C=G;d=b+144|0;c[d>>2]=j;c[d+4>>2]=C;oC(c[k>>2]|0,j,C)|0;e=0;return e|0}
function vM(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+32|0;d=b|0;e=b+16|0;f=b+24|0;g=a|0;h=a+64|0;j=a+68|0;vD(g,c[h>>2]|0,c[j>>2]|0,e,f);k=ac(c[h>>2]|0,c[e>>2]|0)|0;l=ac(c[j>>2]|0,c[f>>2]|0)|0;m=a+180|0;n=a+184|0;if((vO(a,(c[m>>2]|0)+k+(c[a+188>>2]|0)|0,(c[n>>2]|0)+l+(c[a+192>>2]|0)|0)|0)!=0){i=b;return}l=vG(g,c[a+76>>2]|0,c[h>>2]|0,c[j>>2]|0,c[e>>2]|0,c[f>>2]|0)|0;j=c[e>>2]|0;e=ac(c[a+132>>2]|0,j)|0;h=c[f>>2]|0;f=ac(c[a+136>>2]|0,h)|0;g=ac(c[a+140>>2]|0,j)|0;j=ac(c[a+144>>2]|0,h)|0;h=bg(l+(((ac(f,k)|0)+e|0)*3|0)|0,g|0,j|0,24,k*3|0|0,255,65280,16711680,0)|0;c[d>>2]=(c[m>>2]|0)+e;c[d+4>>2]=(c[n>>2]|0)+f;if((h|0)==0){i=b;return}f=a+152|0;if((bT(h|0,0,c[f>>2]|0,d|0)|0)!=0){d=c[q>>2]|0;aC(31544,16,1,d|0)|0}bY(h|0);bs(c[f>>2]|0)|0;i=b;return}function vN(d){d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,r=0,s=0,t=0,u=0,v=0,w=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;e=i;i=i+48|0;f=e|0;if((ba(f|0)|0)==0){i=e;return}g=f|0;h=f+16|0;j=d+200|0;k=d+204|0;l=d+197|0;m=d|0;n=f+20|0;o=d+196|0;p=d+168|0;r=d+152|0;s=f+8|0;t=d+164|0;u=d+24|0;d=f+20|0;v=f+24|0;w=0;do{y=c[g>>2]|0;L6746:do{if((y|0)==1025){z=a[s]|0;A=z&255;if((A|0)==2){B=2}else if((A|0)==0){break}else{B=z<<24>>24==3?1:A-1|0}A=c[t>>2]|1<<B;c[t>>2]=A;if((a[o]|0)==0){break}if((c[u>>2]|0)==0){break}vF(m,0,0,A)}else if((y|0)==1024){A=c[d>>2]|0;z=c[v>>2]|0;if((a[o]|0)==0){break}if((c[u>>2]|0)==0){break}C=(az(0,0)|0)&255;D=C&1;vF(m,A,z,(C&4|0)==0?D:D|2)}else if((y|0)==768){D=c[h>>2]|0;if((D|0)==1094){vu(m,0)|0;break}else if((D|0)==96){E=4951}do{if((E|0)==4951){E=0;if((b[n>>1]&64)==0){break}a[o]=0;a4(1)|0;F;if((a[p]|0)!=0){C=c[r>>2]|0;if((C|0)!=0){bL(C|0)|0}a[p]=0}vB(m,36248,39160)|0;break L6746}}while(0);C=c[j>>2]|0;z=0;while(1){if(z>>>0>=C>>>0){E=4960;break}G=c[k>>2]|0;if((c[G+(z<<3)>>2]|0)==(D|0)){break}else{z=z+1|0}}if((E|0)==4960){E=0;C=c[q>>2]|0;bN(C|0,33240,(x=i,i=i+8|0,c[x>>2]=D,x)|0)|0;break}C=c[G+(z<<3)+4>>2]|0;A=(C|0)==0;if((a[l]|0)!=0|A){H=c[q>>2]|0;bN(H|0,33240,(x=i,i=i+8|0,c[x>>2]=D,x)|0)|0;if(A){break}}vC(m,1,C);if((D|0)!=1107){break}vC(m,2,C)}else if((y|0)==1026){C=a[s]|0;A=C&255;if((A|0)==0){break}else if((A|0)==2){I=2}else{I=C<<24>>24==3?1:A-1|0}A=c[t>>2]&~(1<<I);c[t>>2]=A;if((a[o]|0)==0){a[o]=1;a4(0)|0;J;break}if((c[u>>2]|0)==0){break}vF(m,0,0,A)}else if((y|0)==256){a[o]=0;a4(1)|0;K;vB(m,42168,39160)|0}else if((y|0)==769){A=c[h>>2]|0;C=c[j>>2]|0;H=0;while(1){if(H>>>0>=C>>>0){break L6746}L=c[k>>2]|0;if((c[L+(H<<3)>>2]|0)==(A|0)){break}else{H=H+1|0}}C=c[L+(H<<3)+4>>2]|0;if((A|0)==1094|(C|0)==0){break}if((A|0)==1107){vC(m,1,C)}vC(m,2,C)}}while(0);w=w+1|0;}while((ba(f|0)|0)!=0&w>>>0<8);i=e;return}function vO(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0;f=b+152|0;g=c[f>>2]|0;if((g|0)!=0){do{if((c[b+156>>2]|0)==(d|0)){if((c[b+160>>2]|0)==(e|0)){h=0}else{break}return h|0}}while(0);bY(g|0)}c[f>>2]=0;g=(a[b+168|0]|0)==0?134217729:142606337;i=c[b+172>>2]|0;if((i|0)==4){j=bk(d|0,e|0,32,g|0)|0;c[f>>2]=j;c[b+176>>2]=4;k=j;l=4999}else if((i|0)==2){i=bk(d|0,e|0,16,g|0)|0;c[f>>2]=i;c[b+176>>2]=2;k=i;l=4999}else{l=5e3}if((l|0)==4999){if((k|0)==0){l=5e3}}do{if((l|0)==5e3){k=bk(d|0,e|0,16,g|0)|0;c[f>>2]=k;c[b+176>>2]=2;if((k|0)==0){h=1}else{break}return h|0}}while(0);c[b+156>>2]=d;c[b+160>>2]=e;h=0;return h|0}function vP(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0;do{if(a>>>0<245){if(a>>>0<11){b=16}else{b=a+11&-8}d=b>>>3;e=c[15758]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=63072+(h<<2)|0;j=63072+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[15758]=e&~(1<<g)}else{if(l>>>0<(c[15762]|0)>>>0){bM();return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{bM();return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(b>>>0<=(c[15760]|0)>>>0){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=63072+(p<<2)|0;m=63072+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[15758]=e&~(1<<r)}else{if(l>>>0<(c[15762]|0)>>>0){bM();return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{bM();return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[15760]|0;if((l|0)!=0){q=c[15763]|0;d=l>>>3;l=d<<1;f=63072+(l<<2)|0;k=c[15758]|0;h=1<<d;do{if((k&h|0)==0){c[15758]=k|h;s=f;t=63072+(l+2<<2)|0}else{d=63072+(l+2<<2)|0;g=c[d>>2]|0;if(g>>>0>=(c[15762]|0)>>>0){s=g;t=d;break}bM();return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[15760]=m;c[15763]=e;n=i;return n|0}l=c[15759]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[63336+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[15762]|0;if(r>>>0<i>>>0){bM();return 0}e=r+b|0;m=e;if(r>>>0>=e>>>0){bM();return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break}else{w=l;x=k}}else{w=g;x=q}while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){bM();return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){bM();return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){bM();return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{bM();return 0}}}while(0);L6895:do{if((e|0)!=0){f=d+28|0;i=63336+(c[f>>2]<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[15759]=c[15759]&~(1<<c[f>>2]);break L6895}else{if(e>>>0<(c[15762]|0)>>>0){bM();return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break L6895}}}while(0);if(v>>>0<(c[15762]|0)>>>0){bM();return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[15762]|0)>>>0){bM();return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[15762]|0)>>>0){bM();return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b)>>2]=p;f=c[15760]|0;if((f|0)!=0){e=c[15763]|0;i=f>>>3;f=i<<1;q=63072+(f<<2)|0;k=c[15758]|0;g=1<<i;do{if((k&g|0)==0){c[15758]=k|g;y=q;z=63072+(f+2<<2)|0}else{i=63072+(f+2<<2)|0;l=c[i>>2]|0;if(l>>>0>=(c[15762]|0)>>>0){y=l;z=i;break}bM();return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[15760]=p;c[15763]=m}f=d+8|0;if((f|0)==0){o=b;break}else{n=f}return n|0}else{if(a>>>0>4294967231){o=-1;break}f=a+11|0;g=f&-8;k=c[15759]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=14-(h|f|l)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[63336+(A<<2)>>2]|0;L6943:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break L6943}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[63336+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break}else{p=r;m=i;q=e}}}if((K|0)==0){o=g;break}if(J>>>0>=((c[15760]|0)-g|0)>>>0){o=g;break}q=K;m=c[15762]|0;if(q>>>0<m>>>0){bM();return 0}p=q+g|0;k=p;if(q>>>0>=p>>>0){bM();return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break}else{M=B;N=j}}else{M=d;N=r}while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<m>>>0){bM();return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<m>>>0){bM();return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){bM();return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{bM();return 0}}}while(0);L6993:do{if((e|0)!=0){i=K+28|0;m=63336+(c[i>>2]<<2)|0;do{if((K|0)==(c[m>>2]|0)){c[m>>2]=L;if((L|0)!=0){break}c[15759]=c[15759]&~(1<<c[i>>2]);break L6993}else{if(e>>>0<(c[15762]|0)>>>0){bM();return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break L6993}}}while(0);if(L>>>0<(c[15762]|0)>>>0){bM();return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[15762]|0)>>>0){bM();return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[15762]|0)>>>0){bM();return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);do{if(J>>>0<16){e=J+g|0;c[K+4>>2]=e|3;i=q+(e+4)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[q+(g|4)>>2]=J|1;c[q+(J+g)>>2]=J;i=J>>>3;if(J>>>0<256){e=i<<1;m=63072+(e<<2)|0;r=c[15758]|0;j=1<<i;do{if((r&j|0)==0){c[15758]=r|j;O=m;P=63072+(e+2<<2)|0}else{i=63072+(e+2<<2)|0;d=c[i>>2]|0;if(d>>>0>=(c[15762]|0)>>>0){O=d;P=i;break}bM();return 0}}while(0);c[P>>2]=k;c[O+12>>2]=k;c[q+(g+8)>>2]=O;c[q+(g+12)>>2]=m;break}e=p;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=14-(d|r|i)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=63336+(Q<<2)|0;c[q+(g+28)>>2]=Q;c[q+(g+20)>>2]=0;c[q+(g+16)>>2]=0;m=c[15759]|0;l=1<<Q;if((m&l|0)==0){c[15759]=m|l;c[j>>2]=e;c[q+(g+24)>>2]=j;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}l=J<<R;m=c[j>>2]|0;while(1){if((c[m+4>>2]&-8|0)==(J|0)){break}S=m+16+(l>>>31<<2)|0;j=c[S>>2]|0;if((j|0)==0){T=5156;break}else{l=l<<1;m=j}}if((T|0)==5156){if(S>>>0<(c[15762]|0)>>>0){bM();return 0}else{c[S>>2]=e;c[q+(g+24)>>2]=m;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}}l=m+8|0;j=c[l>>2]|0;i=c[15762]|0;if(m>>>0<i>>>0){bM();return 0}if(j>>>0<i>>>0){bM();return 0}else{c[j+12>>2]=e;c[l>>2]=e;c[q+(g+8)>>2]=j;c[q+(g+12)>>2]=m;c[q+(g+24)>>2]=0;break}}}while(0);q=K+8|0;if((q|0)==0){o=g;break}else{n=q}return n|0}}while(0);K=c[15760]|0;if(o>>>0<=K>>>0){S=K-o|0;J=c[15763]|0;if(S>>>0>15){R=J;c[15763]=R+o;c[15760]=S;c[R+(o+4)>>2]=S|1;c[R+K>>2]=S;c[J+4>>2]=o|3}else{c[15760]=0;c[15763]=0;c[J+4>>2]=K|3;S=J+(K+4)|0;c[S>>2]=c[S>>2]|1}n=J+8|0;return n|0}J=c[15761]|0;if(o>>>0<J>>>0){S=J-o|0;c[15761]=S;J=c[15764]|0;K=J;c[15764]=K+o;c[K+(o+4)>>2]=S|1;c[J+4>>2]=o|3;n=J+8|0;return n|0}do{if((c[15698]|0)==0){J=bJ(8)|0;if((J-1&J|0)==0){c[15700]=J;c[15699]=J;c[15701]=-1;c[15702]=2097152;c[15703]=0;c[15869]=0;c[15698]=(bZ(0)|0)&-16^1431655768;break}else{bM();return 0}}}while(0);J=o+48|0;S=c[15700]|0;K=o+47|0;R=S+K|0;Q=-S|0;S=R&Q;if(S>>>0<=o>>>0){n=0;return n|0}O=c[15868]|0;do{if((O|0)!=0){P=c[15866]|0;L=P+S|0;if(L>>>0<=P>>>0|L>>>0>O>>>0){n=0}else{break}return n|0}}while(0);L7085:do{if((c[15869]&4|0)==0){O=c[15764]|0;L7087:do{if((O|0)==0){T=5186}else{L=O;P=63480;while(1){U=P|0;M=c[U>>2]|0;if(M>>>0<=L>>>0){V=P+4|0;if((M+(c[V>>2]|0)|0)>>>0>L>>>0){break}}M=c[P+8>>2]|0;if((M|0)==0){T=5186;break L7087}else{P=M}}if((P|0)==0){T=5186;break}L=R-(c[15761]|0)&Q;if(L>>>0>=2147483647){W=0;break}m=bA(L|0)|0;e=(m|0)==((c[U>>2]|0)+(c[V>>2]|0)|0);X=e?m:-1;Y=e?L:0;Z=m;_=L;T=5195}}while(0);do{if((T|0)==5186){O=bA(0)|0;if((O|0)==-1){W=0;break}g=O;L=c[15699]|0;m=L-1|0;if((m&g|0)==0){$=S}else{$=S-g+(m+g&-L)|0}L=c[15866]|0;g=L+$|0;if(!($>>>0>o>>>0&$>>>0<2147483647)){W=0;break}m=c[15868]|0;if((m|0)!=0){if(g>>>0<=L>>>0|g>>>0>m>>>0){W=0;break}}m=bA($|0)|0;g=(m|0)==(O|0);X=g?O:-1;Y=g?$:0;Z=m;_=$;T=5195}}while(0);L7107:do{if((T|0)==5195){m=-_|0;if((X|0)!=-1){aa=Y;ab=X;T=5206;break L7085}do{if((Z|0)!=-1&_>>>0<2147483647&_>>>0<J>>>0){g=c[15700]|0;O=K-_+g&-g;if(O>>>0>=2147483647){ac=_;break}if((bA(O|0)|0)==-1){bA(m|0)|0;W=Y;break L7107}else{ac=O+_|0;break}}else{ac=_}}while(0);if((Z|0)==-1){W=Y}else{aa=ac;ab=Z;T=5206;break L7085}}}while(0);c[15869]=c[15869]|4;ad=W;T=5203}else{ad=0;T=5203}}while(0);do{if((T|0)==5203){if(S>>>0>=2147483647){break}W=bA(S|0)|0;Z=bA(0)|0;if(!((Z|0)!=-1&(W|0)!=-1&W>>>0<Z>>>0)){break}ac=Z-W|0;Z=ac>>>0>(o+40|0)>>>0;Y=Z?W:-1;if((Y|0)!=-1){aa=Z?ac:ad;ab=Y;T=5206}}}while(0);do{if((T|0)==5206){ad=(c[15866]|0)+aa|0;c[15866]=ad;if(ad>>>0>(c[15867]|0)>>>0){c[15867]=ad}ad=c[15764]|0;L7127:do{if((ad|0)==0){S=c[15762]|0;if((S|0)==0|ab>>>0<S>>>0){c[15762]=ab}c[15870]=ab;c[15871]=aa;c[15873]=0;c[15767]=c[15698];c[15766]=-1;S=0;do{Y=S<<1;ac=63072+(Y<<2)|0;c[63072+(Y+3<<2)>>2]=ac;c[63072+(Y+2<<2)>>2]=ac;S=S+1|0;}while(S>>>0<32);S=ab+8|0;if((S&7|0)==0){ae=0}else{ae=-S&7}S=aa-40-ae|0;c[15764]=ab+ae;c[15761]=S;c[ab+(ae+4)>>2]=S|1;c[ab+(aa-36)>>2]=40;c[15765]=c[15702]}else{S=63480;while(1){af=c[S>>2]|0;ag=S+4|0;ah=c[ag>>2]|0;if((ab|0)==(af+ah|0)){T=5218;break}ac=c[S+8>>2]|0;if((ac|0)==0){break}else{S=ac}}do{if((T|0)==5218){if((c[S+12>>2]&8|0)!=0){break}ac=ad;if(!(ac>>>0>=af>>>0&ac>>>0<ab>>>0)){break}c[ag>>2]=ah+aa;ac=c[15764]|0;Y=(c[15761]|0)+aa|0;Z=ac;W=ac+8|0;if((W&7|0)==0){ai=0}else{ai=-W&7}W=Y-ai|0;c[15764]=Z+ai;c[15761]=W;c[Z+(ai+4)>>2]=W|1;c[Z+(Y+4)>>2]=40;c[15765]=c[15702];break L7127}}while(0);if(ab>>>0<(c[15762]|0)>>>0){c[15762]=ab}S=ab+aa|0;Y=63480;while(1){aj=Y|0;if((c[aj>>2]|0)==(S|0)){T=5228;break}Z=c[Y+8>>2]|0;if((Z|0)==0){break}else{Y=Z}}do{if((T|0)==5228){if((c[Y+12>>2]&8|0)!=0){break}c[aj>>2]=ab;S=Y+4|0;c[S>>2]=(c[S>>2]|0)+aa;S=ab+8|0;if((S&7|0)==0){ak=0}else{ak=-S&7}S=ab+(aa+8)|0;if((S&7|0)==0){al=0}else{al=-S&7}S=ab+(al+aa)|0;Z=S;W=ak+o|0;ac=ab+W|0;_=ac;K=S-(ab+ak)-o|0;c[ab+(ak+4)>>2]=o|3;do{if((Z|0)==(c[15764]|0)){J=(c[15761]|0)+K|0;c[15761]=J;c[15764]=_;c[ab+(W+4)>>2]=J|1}else{if((Z|0)==(c[15763]|0)){J=(c[15760]|0)+K|0;c[15760]=J;c[15763]=_;c[ab+(W+4)>>2]=J|1;c[ab+(J+W)>>2]=J;break}J=aa+4|0;X=c[ab+(J+al)>>2]|0;if((X&3|0)==1){$=X&-8;V=X>>>3;L7172:do{if(X>>>0<256){U=c[ab+((al|8)+aa)>>2]|0;Q=c[ab+(aa+12+al)>>2]|0;R=63072+(V<<1<<2)|0;do{if((U|0)!=(R|0)){if(U>>>0<(c[15762]|0)>>>0){bM();return 0}if((c[U+12>>2]|0)==(Z|0)){break}bM();return 0}}while(0);if((Q|0)==(U|0)){c[15758]=c[15758]&~(1<<V);break}do{if((Q|0)==(R|0)){am=Q+8|0}else{if(Q>>>0<(c[15762]|0)>>>0){bM();return 0}m=Q+8|0;if((c[m>>2]|0)==(Z|0)){am=m;break}bM();return 0}}while(0);c[U+12>>2]=Q;c[am>>2]=U}else{R=S;m=c[ab+((al|24)+aa)>>2]|0;P=c[ab+(aa+12+al)>>2]|0;do{if((P|0)==(R|0)){O=al|16;g=ab+(J+O)|0;L=c[g>>2]|0;if((L|0)==0){e=ab+(O+aa)|0;O=c[e>>2]|0;if((O|0)==0){an=0;break}else{ao=O;ap=e}}else{ao=L;ap=g}while(1){g=ao+20|0;L=c[g>>2]|0;if((L|0)!=0){ao=L;ap=g;continue}g=ao+16|0;L=c[g>>2]|0;if((L|0)==0){break}else{ao=L;ap=g}}if(ap>>>0<(c[15762]|0)>>>0){bM();return 0}else{c[ap>>2]=0;an=ao;break}}else{g=c[ab+((al|8)+aa)>>2]|0;if(g>>>0<(c[15762]|0)>>>0){bM();return 0}L=g+12|0;if((c[L>>2]|0)!=(R|0)){bM();return 0}e=P+8|0;if((c[e>>2]|0)==(R|0)){c[L>>2]=P;c[e>>2]=g;an=P;break}else{bM();return 0}}}while(0);if((m|0)==0){break}P=ab+(aa+28+al)|0;U=63336+(c[P>>2]<<2)|0;do{if((R|0)==(c[U>>2]|0)){c[U>>2]=an;if((an|0)!=0){break}c[15759]=c[15759]&~(1<<c[P>>2]);break L7172}else{if(m>>>0<(c[15762]|0)>>>0){bM();return 0}Q=m+16|0;if((c[Q>>2]|0)==(R|0)){c[Q>>2]=an}else{c[m+20>>2]=an}if((an|0)==0){break L7172}}}while(0);if(an>>>0<(c[15762]|0)>>>0){bM();return 0}c[an+24>>2]=m;R=al|16;P=c[ab+(R+aa)>>2]|0;do{if((P|0)!=0){if(P>>>0<(c[15762]|0)>>>0){bM();return 0}else{c[an+16>>2]=P;c[P+24>>2]=an;break}}}while(0);P=c[ab+(J+R)>>2]|0;if((P|0)==0){break}if(P>>>0<(c[15762]|0)>>>0){bM();return 0}else{c[an+20>>2]=P;c[P+24>>2]=an;break}}}while(0);aq=ab+(($|al)+aa)|0;ar=$+K|0}else{aq=Z;ar=K}J=aq+4|0;c[J>>2]=c[J>>2]&-2;c[ab+(W+4)>>2]=ar|1;c[ab+(ar+W)>>2]=ar;J=ar>>>3;if(ar>>>0<256){V=J<<1;X=63072+(V<<2)|0;P=c[15758]|0;m=1<<J;do{if((P&m|0)==0){c[15758]=P|m;as=X;at=63072+(V+2<<2)|0}else{J=63072+(V+2<<2)|0;U=c[J>>2]|0;if(U>>>0>=(c[15762]|0)>>>0){as=U;at=J;break}bM();return 0}}while(0);c[at>>2]=_;c[as+12>>2]=_;c[ab+(W+8)>>2]=as;c[ab+(W+12)>>2]=X;break}V=ac;m=ar>>>8;do{if((m|0)==0){au=0}else{if(ar>>>0>16777215){au=31;break}P=(m+1048320|0)>>>16&8;$=m<<P;J=($+520192|0)>>>16&4;U=$<<J;$=(U+245760|0)>>>16&2;Q=14-(J|P|$)+(U<<$>>>15)|0;au=ar>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=63336+(au<<2)|0;c[ab+(W+28)>>2]=au;c[ab+(W+20)>>2]=0;c[ab+(W+16)>>2]=0;X=c[15759]|0;Q=1<<au;if((X&Q|0)==0){c[15759]=X|Q;c[m>>2]=V;c[ab+(W+24)>>2]=m;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}if((au|0)==31){av=0}else{av=25-(au>>>1)|0}Q=ar<<av;X=c[m>>2]|0;while(1){if((c[X+4>>2]&-8|0)==(ar|0)){break}aw=X+16+(Q>>>31<<2)|0;m=c[aw>>2]|0;if((m|0)==0){T=5301;break}else{Q=Q<<1;X=m}}if((T|0)==5301){if(aw>>>0<(c[15762]|0)>>>0){bM();return 0}else{c[aw>>2]=V;c[ab+(W+24)>>2]=X;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}}Q=X+8|0;m=c[Q>>2]|0;$=c[15762]|0;if(X>>>0<$>>>0){bM();return 0}if(m>>>0<$>>>0){bM();return 0}else{c[m+12>>2]=V;c[Q>>2]=V;c[ab+(W+8)>>2]=m;c[ab+(W+12)>>2]=X;c[ab+(W+24)>>2]=0;break}}}while(0);n=ab+(ak|8)|0;return n|0}}while(0);Y=ad;W=63480;while(1){ax=c[W>>2]|0;if(ax>>>0<=Y>>>0){ay=c[W+4>>2]|0;az=ax+ay|0;if(az>>>0>Y>>>0){break}}W=c[W+8>>2]|0}W=ax+(ay-39)|0;if((W&7|0)==0){aA=0}else{aA=-W&7}W=ax+(ay-47+aA)|0;ac=W>>>0<(ad+16|0)>>>0?Y:W;W=ac+8|0;_=ab+8|0;if((_&7|0)==0){aB=0}else{aB=-_&7}_=aa-40-aB|0;c[15764]=ab+aB;c[15761]=_;c[ab+(aB+4)>>2]=_|1;c[ab+(aa-36)>>2]=40;c[15765]=c[15702];c[ac+4>>2]=27;c[W>>2]=c[15870];c[W+4>>2]=c[63484>>2];c[W+8>>2]=c[63488>>2];c[W+12>>2]=c[63492>>2];c[15870]=ab;c[15871]=aa;c[15873]=0;c[15872]=W;W=ac+28|0;c[W>>2]=7;if((ac+32|0)>>>0<az>>>0){_=W;while(1){W=_+4|0;c[W>>2]=7;if((_+8|0)>>>0<az>>>0){_=W}else{break}}}if((ac|0)==(Y|0)){break}_=ac-ad|0;W=Y+(_+4)|0;c[W>>2]=c[W>>2]&-2;c[ad+4>>2]=_|1;c[Y+_>>2]=_;W=_>>>3;if(_>>>0<256){K=W<<1;Z=63072+(K<<2)|0;S=c[15758]|0;m=1<<W;do{if((S&m|0)==0){c[15758]=S|m;aC=Z;aD=63072+(K+2<<2)|0}else{W=63072+(K+2<<2)|0;Q=c[W>>2]|0;if(Q>>>0>=(c[15762]|0)>>>0){aC=Q;aD=W;break}bM();return 0}}while(0);c[aD>>2]=ad;c[aC+12>>2]=ad;c[ad+8>>2]=aC;c[ad+12>>2]=Z;break}K=ad;m=_>>>8;do{if((m|0)==0){aE=0}else{if(_>>>0>16777215){aE=31;break}S=(m+1048320|0)>>>16&8;Y=m<<S;ac=(Y+520192|0)>>>16&4;W=Y<<ac;Y=(W+245760|0)>>>16&2;Q=14-(ac|S|Y)+(W<<Y>>>15)|0;aE=_>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=63336+(aE<<2)|0;c[ad+28>>2]=aE;c[ad+20>>2]=0;c[ad+16>>2]=0;Z=c[15759]|0;Q=1<<aE;if((Z&Q|0)==0){c[15759]=Z|Q;c[m>>2]=K;c[ad+24>>2]=m;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}if((aE|0)==31){aF=0}else{aF=25-(aE>>>1)|0}Q=_<<aF;Z=c[m>>2]|0;while(1){if((c[Z+4>>2]&-8|0)==(_|0)){break}aG=Z+16+(Q>>>31<<2)|0;m=c[aG>>2]|0;if((m|0)==0){T=5336;break}else{Q=Q<<1;Z=m}}if((T|0)==5336){if(aG>>>0<(c[15762]|0)>>>0){bM();return 0}else{c[aG>>2]=K;c[ad+24>>2]=Z;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}}Q=Z+8|0;_=c[Q>>2]|0;m=c[15762]|0;if(Z>>>0<m>>>0){bM();return 0}if(_>>>0<m>>>0){bM();return 0}else{c[_+12>>2]=K;c[Q>>2]=K;c[ad+8>>2]=_;c[ad+12>>2]=Z;c[ad+24>>2]=0;break}}}while(0);ad=c[15761]|0;if(ad>>>0<=o>>>0){break}_=ad-o|0;c[15761]=_;ad=c[15764]|0;Q=ad;c[15764]=Q+o;c[Q+(o+4)>>2]=_|1;c[ad+4>>2]=o|3;n=ad+8|0;return n|0}}while(0);c[(bB()|0)>>2]=12;n=0;return n|0}function vQ(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[15762]|0;if(b>>>0<e>>>0){bM()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){bM()}h=f&-8;i=a+(h-8)|0;j=i;L10:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){bM()}if((n|0)==(c[15763]|0)){p=a+(h-4)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[15760]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256){k=c[a+(l+8)>>2]|0;s=c[a+(l+12)>>2]|0;t=63072+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){bM()}if((c[k+12>>2]|0)==(n|0)){break}bM()}}while(0);if((s|0)==(k|0)){c[15758]=c[15758]&~(1<<p);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){bM()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}bM()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24)>>2]|0;v=c[a+(l+12)>>2]|0;do{if((v|0)==(t|0)){w=a+(l+20)|0;x=c[w>>2]|0;if((x|0)==0){y=a+(l+16)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){bM()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8)>>2]|0;if(w>>>0<e>>>0){bM()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){bM()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{bM()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28)|0;m=63336+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[15759]=c[15759]&~(1<<c[v>>2]);q=n;r=o;break L10}else{if(p>>>0<(c[15762]|0)>>>0){bM()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break L10}}}while(0);if(A>>>0<(c[15762]|0)>>>0){bM()}c[A+24>>2]=p;t=c[a+(l+16)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[15762]|0)>>>0){bM()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[15762]|0)>>>0){bM()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){bM()}A=a+(h-4)|0;e=c[A>>2]|0;if((e&1|0)==0){bM()}do{if((e&2|0)==0){if((j|0)==(c[15764]|0)){B=(c[15761]|0)+r|0;c[15761]=B;c[15764]=q;c[q+4>>2]=B|1;if((q|0)==(c[15763]|0)){c[15763]=0;c[15760]=0}if(B>>>0<=(c[15765]|0)>>>0){return}vS(0)|0;return}if((j|0)==(c[15763]|0)){B=(c[15760]|0)+r|0;c[15760]=B;c[15763]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;L115:do{if(e>>>0<256){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=63072+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[15762]|0)>>>0){bM()}if((c[u+12>>2]|0)==(j|0)){break}bM()}}while(0);if((g|0)==(u|0)){c[15758]=c[15758]&~(1<<C);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[15762]|0)>>>0){bM()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}bM()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16)>>2]|0;t=c[a+(h|4)>>2]|0;do{if((t|0)==(b|0)){p=a+(h+12)|0;v=c[p>>2]|0;if((v|0)==0){m=a+(h+8)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break}else{F=k;G=m}}else{F=v;G=p}while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[15762]|0)>>>0){bM()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[15762]|0)>>>0){bM()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){bM()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{bM()}}}while(0);if((f|0)==0){break}t=a+(h+20)|0;u=63336+(c[t>>2]<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[15759]=c[15759]&~(1<<c[t>>2]);break L115}else{if(f>>>0<(c[15762]|0)>>>0){bM()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break L115}}}while(0);if(E>>>0<(c[15762]|0)>>>0){bM()}c[E+24>>2]=f;b=c[a+(h+8)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[15762]|0)>>>0){bM()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[15762]|0)>>>0){bM()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[15763]|0)){H=B;break}c[15760]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256){d=r<<1;e=63072+(d<<2)|0;A=c[15758]|0;E=1<<r;do{if((A&E|0)==0){c[15758]=A|E;I=e;J=63072+(d+2<<2)|0}else{r=63072+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[15762]|0)>>>0){I=h;J=r;break}bM()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=14-(E|J|d)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=63336+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[15759]|0;d=1<<K;do{if((r&d|0)==0){c[15759]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{if((K|0)==31){L=0}else{L=25-(K>>>1)|0}A=H<<L;J=c[I>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(H|0)){break}M=J+16+(A>>>31<<2)|0;E=c[M>>2]|0;if((E|0)==0){N=131;break}else{A=A<<1;J=E}}if((N|0)==131){if(M>>>0<(c[15762]|0)>>>0){bM()}else{c[M>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=J+8|0;B=c[A>>2]|0;E=c[15762]|0;if(J>>>0<E>>>0){bM()}if(B>>>0<E>>>0){bM()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=J;c[q+24>>2]=0;break}}}while(0);q=(c[15766]|0)-1|0;c[15766]=q;if((q|0)==0){O=63488}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[15766]=-1;return}function vR(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;if((a|0)==0){d=vP(b)|0;return d|0}if(b>>>0>4294967231){c[(bB()|0)>>2]=12;d=0;return d|0}if(b>>>0<11){e=16}else{e=b+11&-8}f=vT(a-8|0,e)|0;if((f|0)!=0){d=f+8|0;return d|0}f=vP(b)|0;if((f|0)==0){d=0;return d|0}e=c[a-4>>2]|0;g=(e&-8)-((e&3|0)==0?8:4)|0;e=g>>>0<b>>>0?g:b;vW(f|0,a|0,e)|0;vQ(a);d=f;return d|0}function vS(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;do{if((c[15698]|0)==0){b=bJ(8)|0;if((b-1&b|0)==0){c[15700]=b;c[15699]=b;c[15701]=-1;c[15702]=2097152;c[15703]=0;c[15869]=0;c[15698]=(bZ(0)|0)&-16^1431655768;break}else{bM();return 0}}}while(0);if(a>>>0>=4294967232){d=0;return d|0}b=c[15764]|0;if((b|0)==0){d=0;return d|0}e=c[15761]|0;do{if(e>>>0>(a+40|0)>>>0){f=c[15700]|0;g=ac((((-40-a-1+e+f|0)>>>0)/(f>>>0)|0)-1|0,f)|0;h=b;i=63480;while(1){j=c[i>>2]|0;if(j>>>0<=h>>>0){if((j+(c[i+4>>2]|0)|0)>>>0>h>>>0){k=i;break}}j=c[i+8>>2]|0;if((j|0)==0){k=0;break}else{i=j}}if((c[k+12>>2]&8|0)!=0){break}i=bA(0)|0;h=k+4|0;if((i|0)!=((c[k>>2]|0)+(c[h>>2]|0)|0)){break}j=bA(-(g>>>0>2147483646?-2147483648-f|0:g)|0)|0;l=bA(0)|0;if(!((j|0)!=-1&l>>>0<i>>>0)){break}j=i-l|0;if((i|0)==(l|0)){break}c[h>>2]=(c[h>>2]|0)-j;c[15866]=(c[15866]|0)-j;h=c[15764]|0;m=(c[15761]|0)-j|0;j=h;n=h+8|0;if((n&7|0)==0){o=0}else{o=-n&7}n=m-o|0;c[15764]=j+o;c[15761]=n;c[j+(o+4)>>2]=n|1;c[j+(m+4)>>2]=40;c[15765]=c[15702];d=(i|0)!=(l|0)|0;return d|0}}while(0);if((c[15761]|0)>>>0<=(c[15765]|0)>>>0){d=0;return d|0}c[15765]=-1;d=0;return d|0}function vT(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=a+4|0;e=c[d>>2]|0;f=e&-8;g=a;h=g+f|0;i=h;j=c[15762]|0;if(g>>>0<j>>>0){bM();return 0}k=e&3;if(!((k|0)!=1&g>>>0<h>>>0)){bM();return 0}l=g+(f|4)|0;m=c[l>>2]|0;if((m&1|0)==0){bM();return 0}if((k|0)==0){if(b>>>0<256){n=0;return n|0}do{if(f>>>0>=(b+4|0)>>>0){if((f-b|0)>>>0>c[15700]<<1>>>0){break}else{n=a}return n|0}}while(0);n=0;return n|0}if(f>>>0>=b>>>0){k=f-b|0;if(k>>>0<=15){n=a;return n|0}c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|3;c[l>>2]=c[l>>2]|1;vU(g+b|0,k);n=a;return n|0}if((i|0)==(c[15764]|0)){k=(c[15761]|0)+f|0;if(k>>>0<=b>>>0){n=0;return n|0}l=k-b|0;c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=l|1;c[15764]=g+b;c[15761]=l;n=a;return n|0}if((i|0)==(c[15763]|0)){l=(c[15760]|0)+f|0;if(l>>>0<b>>>0){n=0;return n|0}k=l-b|0;if(k>>>0>15){c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|1;c[g+l>>2]=k;o=g+(l+4)|0;c[o>>2]=c[o>>2]&-2;p=g+b|0;q=k}else{c[d>>2]=e&1|l|2;e=g+(l+4)|0;c[e>>2]=c[e>>2]|1;p=0;q=0}c[15760]=q;c[15763]=p;n=a;return n|0}if((m&2|0)!=0){n=0;return n|0}p=(m&-8)+f|0;if(p>>>0<b>>>0){n=0;return n|0}q=p-b|0;e=m>>>3;L336:do{if(m>>>0<256){l=c[g+(f+8)>>2]|0;k=c[g+(f+12)>>2]|0;o=63072+(e<<1<<2)|0;do{if((l|0)!=(o|0)){if(l>>>0<j>>>0){bM();return 0}if((c[l+12>>2]|0)==(i|0)){break}bM();return 0}}while(0);if((k|0)==(l|0)){c[15758]=c[15758]&~(1<<e);break}do{if((k|0)==(o|0)){r=k+8|0}else{if(k>>>0<j>>>0){bM();return 0}s=k+8|0;if((c[s>>2]|0)==(i|0)){r=s;break}bM();return 0}}while(0);c[l+12>>2]=k;c[r>>2]=l}else{o=h;s=c[g+(f+24)>>2]|0;t=c[g+(f+12)>>2]|0;do{if((t|0)==(o|0)){u=g+(f+20)|0;v=c[u>>2]|0;if((v|0)==0){w=g+(f+16)|0;x=c[w>>2]|0;if((x|0)==0){y=0;break}else{z=x;A=w}}else{z=v;A=u}while(1){u=z+20|0;v=c[u>>2]|0;if((v|0)!=0){z=v;A=u;continue}u=z+16|0;v=c[u>>2]|0;if((v|0)==0){break}else{z=v;A=u}}if(A>>>0<j>>>0){bM();return 0}else{c[A>>2]=0;y=z;break}}else{u=c[g+(f+8)>>2]|0;if(u>>>0<j>>>0){bM();return 0}v=u+12|0;if((c[v>>2]|0)!=(o|0)){bM();return 0}w=t+8|0;if((c[w>>2]|0)==(o|0)){c[v>>2]=t;c[w>>2]=u;y=t;break}else{bM();return 0}}}while(0);if((s|0)==0){break}t=g+(f+28)|0;l=63336+(c[t>>2]<<2)|0;do{if((o|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[15759]=c[15759]&~(1<<c[t>>2]);break L336}else{if(s>>>0<(c[15762]|0)>>>0){bM();return 0}k=s+16|0;if((c[k>>2]|0)==(o|0)){c[k>>2]=y}else{c[s+20>>2]=y}if((y|0)==0){break L336}}}while(0);if(y>>>0<(c[15762]|0)>>>0){bM();return 0}c[y+24>>2]=s;o=c[g+(f+16)>>2]|0;do{if((o|0)!=0){if(o>>>0<(c[15762]|0)>>>0){bM();return 0}else{c[y+16>>2]=o;c[o+24>>2]=y;break}}}while(0);o=c[g+(f+20)>>2]|0;if((o|0)==0){break}if(o>>>0<(c[15762]|0)>>>0){bM();return 0}else{c[y+20>>2]=o;c[o+24>>2]=y;break}}}while(0);if(q>>>0<16){c[d>>2]=p|c[d>>2]&1|2;y=g+(p|4)|0;c[y>>2]=c[y>>2]|1;n=a;return n|0}else{c[d>>2]=c[d>>2]&1|b|2;c[g+(b+4)>>2]=q|3;d=g+(p|4)|0;c[d>>2]=c[d>>2]|1;vU(g+b|0,q);n=a;return n|0}return 0}function vU(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;d=a;e=d+b|0;f=e;g=c[a+4>>2]|0;L412:do{if((g&1|0)==0){h=c[a>>2]|0;if((g&3|0)==0){return}i=d+(-h|0)|0;j=i;k=h+b|0;l=c[15762]|0;if(i>>>0<l>>>0){bM()}if((j|0)==(c[15763]|0)){m=d+(b+4)|0;if((c[m>>2]&3|0)!=3){n=j;o=k;break}c[15760]=k;c[m>>2]=c[m>>2]&-2;c[d+(4-h)>>2]=k|1;c[e>>2]=k;return}m=h>>>3;if(h>>>0<256){p=c[d+(8-h)>>2]|0;q=c[d+(12-h)>>2]|0;r=63072+(m<<1<<2)|0;do{if((p|0)!=(r|0)){if(p>>>0<l>>>0){bM()}if((c[p+12>>2]|0)==(j|0)){break}bM()}}while(0);if((q|0)==(p|0)){c[15758]=c[15758]&~(1<<m);n=j;o=k;break}do{if((q|0)==(r|0)){s=q+8|0}else{if(q>>>0<l>>>0){bM()}t=q+8|0;if((c[t>>2]|0)==(j|0)){s=t;break}bM()}}while(0);c[p+12>>2]=q;c[s>>2]=p;n=j;o=k;break}r=i;m=c[d+(24-h)>>2]|0;t=c[d+(12-h)>>2]|0;do{if((t|0)==(r|0)){u=16-h|0;v=d+(u+4)|0;w=c[v>>2]|0;if((w|0)==0){x=d+u|0;u=c[x>>2]|0;if((u|0)==0){y=0;break}else{z=u;A=x}}else{z=w;A=v}while(1){v=z+20|0;w=c[v>>2]|0;if((w|0)!=0){z=w;A=v;continue}v=z+16|0;w=c[v>>2]|0;if((w|0)==0){break}else{z=w;A=v}}if(A>>>0<l>>>0){bM()}else{c[A>>2]=0;y=z;break}}else{v=c[d+(8-h)>>2]|0;if(v>>>0<l>>>0){bM()}w=v+12|0;if((c[w>>2]|0)!=(r|0)){bM()}x=t+8|0;if((c[x>>2]|0)==(r|0)){c[w>>2]=t;c[x>>2]=v;y=t;break}else{bM()}}}while(0);if((m|0)==0){n=j;o=k;break}t=d+(28-h)|0;l=63336+(c[t>>2]<<2)|0;do{if((r|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[15759]=c[15759]&~(1<<c[t>>2]);n=j;o=k;break L412}else{if(m>>>0<(c[15762]|0)>>>0){bM()}i=m+16|0;if((c[i>>2]|0)==(r|0)){c[i>>2]=y}else{c[m+20>>2]=y}if((y|0)==0){n=j;o=k;break L412}}}while(0);if(y>>>0<(c[15762]|0)>>>0){bM()}c[y+24>>2]=m;r=16-h|0;t=c[d+r>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[15762]|0)>>>0){bM()}else{c[y+16>>2]=t;c[t+24>>2]=y;break}}}while(0);t=c[d+(r+4)>>2]|0;if((t|0)==0){n=j;o=k;break}if(t>>>0<(c[15762]|0)>>>0){bM()}else{c[y+20>>2]=t;c[t+24>>2]=y;n=j;o=k;break}}else{n=a;o=b}}while(0);a=c[15762]|0;if(e>>>0<a>>>0){bM()}y=d+(b+4)|0;z=c[y>>2]|0;do{if((z&2|0)==0){if((f|0)==(c[15764]|0)){A=(c[15761]|0)+o|0;c[15761]=A;c[15764]=n;c[n+4>>2]=A|1;if((n|0)!=(c[15763]|0)){return}c[15763]=0;c[15760]=0;return}if((f|0)==(c[15763]|0)){A=(c[15760]|0)+o|0;c[15760]=A;c[15763]=n;c[n+4>>2]=A|1;c[n+A>>2]=A;return}A=(z&-8)+o|0;s=z>>>3;L511:do{if(z>>>0<256){g=c[d+(b+8)>>2]|0;t=c[d+(b+12)>>2]|0;h=63072+(s<<1<<2)|0;do{if((g|0)!=(h|0)){if(g>>>0<a>>>0){bM()}if((c[g+12>>2]|0)==(f|0)){break}bM()}}while(0);if((t|0)==(g|0)){c[15758]=c[15758]&~(1<<s);break}do{if((t|0)==(h|0)){B=t+8|0}else{if(t>>>0<a>>>0){bM()}m=t+8|0;if((c[m>>2]|0)==(f|0)){B=m;break}bM()}}while(0);c[g+12>>2]=t;c[B>>2]=g}else{h=e;m=c[d+(b+24)>>2]|0;l=c[d+(b+12)>>2]|0;do{if((l|0)==(h|0)){i=d+(b+20)|0;p=c[i>>2]|0;if((p|0)==0){q=d+(b+16)|0;v=c[q>>2]|0;if((v|0)==0){C=0;break}else{D=v;E=q}}else{D=p;E=i}while(1){i=D+20|0;p=c[i>>2]|0;if((p|0)!=0){D=p;E=i;continue}i=D+16|0;p=c[i>>2]|0;if((p|0)==0){break}else{D=p;E=i}}if(E>>>0<a>>>0){bM()}else{c[E>>2]=0;C=D;break}}else{i=c[d+(b+8)>>2]|0;if(i>>>0<a>>>0){bM()}p=i+12|0;if((c[p>>2]|0)!=(h|0)){bM()}q=l+8|0;if((c[q>>2]|0)==(h|0)){c[p>>2]=l;c[q>>2]=i;C=l;break}else{bM()}}}while(0);if((m|0)==0){break}l=d+(b+28)|0;g=63336+(c[l>>2]<<2)|0;do{if((h|0)==(c[g>>2]|0)){c[g>>2]=C;if((C|0)!=0){break}c[15759]=c[15759]&~(1<<c[l>>2]);break L511}else{if(m>>>0<(c[15762]|0)>>>0){bM()}t=m+16|0;if((c[t>>2]|0)==(h|0)){c[t>>2]=C}else{c[m+20>>2]=C}if((C|0)==0){break L511}}}while(0);if(C>>>0<(c[15762]|0)>>>0){bM()}c[C+24>>2]=m;h=c[d+(b+16)>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[15762]|0)>>>0){bM()}else{c[C+16>>2]=h;c[h+24>>2]=C;break}}}while(0);h=c[d+(b+20)>>2]|0;if((h|0)==0){break}if(h>>>0<(c[15762]|0)>>>0){bM()}else{c[C+20>>2]=h;c[h+24>>2]=C;break}}}while(0);c[n+4>>2]=A|1;c[n+A>>2]=A;if((n|0)!=(c[15763]|0)){F=A;break}c[15760]=A;return}else{c[y>>2]=z&-2;c[n+4>>2]=o|1;c[n+o>>2]=o;F=o}}while(0);o=F>>>3;if(F>>>0<256){z=o<<1;y=63072+(z<<2)|0;C=c[15758]|0;b=1<<o;do{if((C&b|0)==0){c[15758]=C|b;G=y;H=63072+(z+2<<2)|0}else{o=63072+(z+2<<2)|0;d=c[o>>2]|0;if(d>>>0>=(c[15762]|0)>>>0){G=d;H=o;break}bM()}}while(0);c[H>>2]=n;c[G+12>>2]=n;c[n+8>>2]=G;c[n+12>>2]=y;return}y=n;G=F>>>8;do{if((G|0)==0){I=0}else{if(F>>>0>16777215){I=31;break}H=(G+1048320|0)>>>16&8;z=G<<H;b=(z+520192|0)>>>16&4;C=z<<b;z=(C+245760|0)>>>16&2;o=14-(b|H|z)+(C<<z>>>15)|0;I=F>>>((o+7|0)>>>0)&1|o<<1}}while(0);G=63336+(I<<2)|0;c[n+28>>2]=I;c[n+20>>2]=0;c[n+16>>2]=0;o=c[15759]|0;z=1<<I;if((o&z|0)==0){c[15759]=o|z;c[G>>2]=y;c[n+24>>2]=G;c[n+12>>2]=n;c[n+8>>2]=n;return}if((I|0)==31){J=0}else{J=25-(I>>>1)|0}I=F<<J;J=c[G>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(F|0)){break}K=J+16+(I>>>31<<2)|0;G=c[K>>2]|0;if((G|0)==0){L=437;break}else{I=I<<1;J=G}}if((L|0)==437){if(K>>>0<(c[15762]|0)>>>0){bM()}c[K>>2]=y;c[n+24>>2]=J;c[n+12>>2]=n;c[n+8>>2]=n;return}K=J+8|0;L=c[K>>2]|0;I=c[15762]|0;if(J>>>0<I>>>0){bM()}if(L>>>0<I>>>0){bM()}c[L+12>>2]=y;c[K>>2]=y;c[n+8>>2]=L;c[n+12>>2]=J;c[n+24>>2]=0;return}function vV(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+e|0;if((e|0)>=20){d=d&255;e=b&3;g=d|d<<8|d<<16|d<<24;h=f&~3;if(e){e=b+4-e|0;while((b|0)<(e|0)){a[b]=d;b=b+1|0}}while((b|0)<(h|0)){c[b>>2]=g;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}}function vW(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function vX(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function vY(b,c){b=b|0;c=c|0;var d=0,e=0;d=b+(vX(b)|0)|0;do{a[d+e|0]=a[c+e|0];e=e+1|0}while(a[c+(e-1)|0]|0);return b|0}function vZ(a,b,c){a=a|0;b=b|0;c=c|0;var e=0,f=0,g=0;while((e|0)<(c|0)){f=d[a+e|0]|0;g=d[b+e|0]|0;if((f|0)!=(g|0))return((f|0)>(g|0)?1:-1)|0;e=e+1|0}return 0}function v_(b,c){b=b|0;c=c|0;var d=0;do{a[b+d|0]=a[c+d|0];d=d+1|0}while(a[c+(d-1)|0]|0);return b|0}function v$(a){a=a|0;if((a|0)<65)return a|0;if((a|0)>90)return a|0;return a-65+97|0}function v0(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0;while(e>>>0<d>>>0){f=v$(a[b+e|0]|0)|0;g=v$(a[c+e|0]|0)|0;if((f|0)==(g|0)&(f|0)==0)return 0;if((f|0)==0)return-1;if((g|0)==0)return 1;if((f|0)==(g|0)){e=e+1|0;continue}else{return(f>>>0>g>>>0?1:-1)|0}}return 0}function v1(a,b){a=a|0;b=b|0;return v0(a,b,-1)|0}function v2(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=a+c>>>0;return(G=b+d+(e>>>0<a>>>0|0)>>>0,e|0)|0}function v3(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=b-d>>>0;e=b-d-(c>>>0>a>>>0|0)>>>0;return(G=e,a-c>>>0|0)|0}function v4(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){G=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}G=a<<c-32;return 0}function v5(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){G=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}G=0;return b>>>c-32|0}function v6(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){G=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}G=(b|0)<0?-1:0;return b>>c-32|0}function v7(b){b=b|0;var c=0;c=a[n+(b>>>24)|0]|0;if((c|0)<8)return c|0;c=a[n+(b>>16&255)|0]|0;if((c|0)<8)return c+8|0;c=a[n+(b>>8&255)|0]|0;if((c|0)<8)return c+16|0;return(a[n+(b&255)|0]|0)+24|0}function v8(b){b=b|0;var c=0;c=a[m+(b&255)|0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)|0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)|0]|0;if((c|0)<8)return c+16|0;return(a[m+(b>>>24)|0]|0)+24|0}function v9(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;c=a&65535;d=b&65535;e=ac(d,c)|0;f=a>>>16;a=(e>>>16)+(ac(d,f)|0)|0;d=b>>>16;b=ac(d,c)|0;return(G=(a>>>16)+(ac(d,f)|0)+(((a&65535)+b|0)>>>16)|0,a+b<<16|e&65535|0)|0}function wa(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b>>31|((b|0)<0?-1:0)<<1;f=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;g=d>>31|((d|0)<0?-1:0)<<1;h=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;i=v3(e^a,f^b,e,f)|0;b=G;a=g^e;e=h^f;f=v3((wf(i,b,v3(g^c,h^d,g,h)|0,G,0)|0)^a,G^e,a,e)|0;return(G=G,f)|0}function wb(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;h=b>>31|((b|0)<0?-1:0)<<1;j=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;k=e>>31|((e|0)<0?-1:0)<<1;l=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;m=v3(h^a,j^b,h,j)|0;b=G;a=v3(k^d,l^e,k,l)|0;wf(m,b,a,G,g)|0;a=v3(c[g>>2]^h,c[g+4>>2]^j,h,j)|0;j=G;i=f;return(G=j,a)|0}function wc(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;a=c;c=v9(e,a)|0;f=G;return(G=(ac(b,a)|0)+(ac(d,e)|0)+f|f&0,c|0|0)|0}function wd(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=wf(a,b,c,d,0)|0;return(G=G,e)|0}function we(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+8|0;g=f|0;wf(a,b,d,e,g)|0;i=f;return(G=c[g+4>>2]|0,c[g>>2]|0)|0}function wf(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,H=0,I=0,J=0,K=0,L=0,M=0;g=a;h=b;i=h;j=d;k=e;l=k;if((i|0)==0){m=(f|0)!=0;if((l|0)==0){if(m){c[f>>2]=(g>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(g>>>0)/(j>>>0)>>>0;return(G=n,o)|0}else{if(!m){n=0;o=0;return(G=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;n=0;o=0;return(G=n,o)|0}}m=(l|0)==0;do{if((j|0)==0){if(m){if((f|0)!=0){c[f>>2]=(i>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(i>>>0)/(j>>>0)>>>0;return(G=n,o)|0}if((g|0)==0){if((f|0)!=0){c[f>>2]=0;c[f+4>>2]=(i>>>0)%(l>>>0)}n=0;o=(i>>>0)/(l>>>0)>>>0;return(G=n,o)|0}p=l-1|0;if((p&l|0)==0){if((f|0)!=0){c[f>>2]=a|0;c[f+4>>2]=p&i|b&0}n=0;o=i>>>((v8(l|0)|0)>>>0);return(G=n,o)|0}p=(v7(l|0)|0)-(v7(i|0)|0)|0;if(p>>>0<=30){q=p+1|0;r=31-p|0;s=q;t=i<<r|g>>>(q>>>0);u=i>>>(q>>>0);v=0;w=g<<r;break}if((f|0)==0){n=0;o=0;return(G=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(G=n,o)|0}else{if(!m){r=(v7(l|0)|0)-(v7(i|0)|0)|0;if(r>>>0<=31){q=r+1|0;p=31-r|0;x=r-31>>31;s=q;t=g>>>(q>>>0)&x|i<<p;u=i>>>(q>>>0)&x;v=0;w=g<<p;break}if((f|0)==0){n=0;o=0;return(G=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(G=n,o)|0}p=j-1|0;if((p&j|0)!=0){x=(v7(j|0)|0)+33-(v7(i|0)|0)|0;q=64-x|0;r=32-x|0;y=r>>31;z=x-32|0;A=z>>31;s=x;t=r-1>>31&i>>>(z>>>0)|(i<<r|g>>>(x>>>0))&A;u=A&i>>>(x>>>0);v=g<<q&y;w=(i<<q|g>>>(z>>>0))&y|g<<r&x-33>>31;break}if((f|0)!=0){c[f>>2]=p&g;c[f+4>>2]=0}if((j|0)==1){n=h|b&0;o=a|0|0;return(G=n,o)|0}else{p=v8(j|0)|0;n=i>>>(p>>>0)|0;o=i<<32-p|g>>>(p>>>0)|0;return(G=n,o)|0}}}while(0);if((s|0)==0){B=w;C=v;D=u;E=t;F=0;H=0}else{g=d|0|0;d=k|e&0;e=v2(g,d,-1,-1)|0;k=G;i=w;w=v;v=u;u=t;t=s;s=0;while(1){I=w>>>31|i<<1;J=s|w<<1;j=u<<1|i>>>31|0;a=u>>>31|v<<1|0;v3(e,k,j,a)|0;b=G;h=b>>31|((b|0)<0?-1:0)<<1;K=h&1;L=v3(j,a,h&g,(((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1)&d)|0;M=G;b=t-1|0;if((b|0)==0){break}else{i=I;w=J;v=M;u=L;t=b;s=K}}B=I;C=J;D=M;E=L;F=0;H=K}K=C;C=0;if((f|0)!=0){c[f>>2]=E;c[f+4>>2]=D}n=(K|0)>>>31|(B|C)<<1|(C<<1|K>>>31)&0|F;o=(K<<1|0>>>31)&-2|H;return(G=n,o)|0}function wg(a,b){a=a|0;b=b|0;return b_[a&31](b|0)|0}function wh(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;b$[a&3](b|0,c|0,d|0,e|0,f|0)}function wi(a,b){a=a|0;b=b|0;b0[a&1023](b|0)}function wj(a,b,c){a=a|0;b=b|0;c=c|0;b1[a&511](b|0,c|0)}function wk(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return b2[a&127](b|0,c|0,d|0)|0}function wl(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;b3[a&63](b|0,c|0,d|0)}function wm(a){a=a|0;b4[a&7]()}function wn(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return b5[a&127](b|0,c|0,d|0,e|0)|0}function wo(a,b,c){a=a|0;b=b|0;c=c|0;return b6[a&63](b|0,c|0)|0}function wp(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return b7[a&7](b|0,c|0,d|0,e|0,f|0)|0}function wq(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;b8[a&7](b|0,c|0,d|0,e|0)}function wr(a){a=a|0;ad(0);return 0}function ws(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ad(1)}function wt(a){a=a|0;ad(2)}function wu(a,b){a=a|0;b=b|0;ad(3)}function wv(a,b,c){a=a|0;b=b|0;c=c|0;ad(4);return 0}function ww(a,b,c){a=a|0;b=b|0;c=c|0;ad(5)}function wx(){ad(6)}function wy(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ad(7);return 0}function wz(a,b){a=a|0;b=b|0;ad(8);return 0}function wA(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ad(9);return 0}function wB(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ad(10)}
// EMSCRIPTEN_END_FUNCS
var b_=[wr,wr,sq,wr,pP,wr,u9,wr,vK,wr,ss,wr,pH,wr,pL,wr,pF,wr,pv,wr,mV,wr,wr,wr,wr,wr,wr,wr,wr,wr,wr,wr];var b$=[ws,ws,fj,ws];var b0=[wt,wt,cL,wt,kr,wt,st,wt,cN,wt,jl,wt,lq,wt,jo,wt,k1,wt,ll,wt,k9,wt,eV,wt,jK,wt,kz,wt,jR,wt,kV,wt,iY,wt,k2,wt,lb,wt,pI,wt,la,wt,jD,wt,kE,wt,i$,wt,je,wt,lg,wt,jr,wt,vI,wt,cr,wt,jW,wt,kS,wt,k6,wt,vr,wt,km,wt,oY,wt,lQ,wt,l_,wt,li,wt,kG,wt,kh,wt,ky,wt,j7,wt,i6,wt,jV,wt,kk,wt,lv,wt,i_,wt,jH,wt,jd,wt,jL,wt,jw,wt,k8,wt,sM,wt,iW,wt,lE,wt,kw,wt,ka,wt,kf,wt,jq,wt,pG,wt,lH,wt,i2,wt,jC,wt,kp,wt,lI,wt,jn,wt,vb,wt,kH,wt,cM,wt,pM,wt,lX,wt,j_,wt,kT,wt,i7,wt,lD,wt,e4,wt,pf,wt,jj,wt,kq,wt,cA,wt,ls,wt,lB,wt,lC,wt,lh,wt,k5,wt,jG,wt,eU,wt,lT,wt,k7,wt,iV,wt,lG,wt,j0,wt,ld,wt,lR,wt,jB,wt,ly,wt,l2,wt,iZ,wt,j9,wt,j1,wt,e3,wt,js,wt,k3,wt,kJ,wt,lu,wt,dU,wt,mc,wt,kP,wt,kI,wt,kU,wt,eY,wt,j8,wt,cS,wt,kb,wt,kl,wt,jb,wt,kF,wt,kt,wt,l3,wt,jF,wt,l4,wt,jU,wt,lL,wt,pw,wt,lc,wt,ku,wt,kY,wt,lK,wt,kK,wt,lM,wt,l1,wt,lY,wt,ja,wt,kQ,wt,jk,wt,lf,wt,iR,wt,lx,wt,kj,wt,lk,wt,i9,wt,ji,wt,sK,wt,lz,wt,jM,wt,e6,wt,ke,wt,k4,wt,lS,wt,j2,wt,jt,wt,k0,wt,cR,wt,i3,wt,ko,wt,jE,wt,jT,wt,cT,wt,lN,wt,vM,wt,vc,wt,jZ,wt,kv,wt,kX,wt,jI,wt,jQ,wt,l$,wt,lF,wt,lJ,wt,iX,wt,jS,wt,j$,wt,sO,wt,e1,wt,eX,wt,ok,wt,ks,wt,j5,wt,vN,wt,e7,wt,lr,wt,fb,wt,l5,wt,k$,wt,ju,wt,vl,wt,oS,wt,i4,wt,kL,wt,u4,wt,jx,wt,l6,wt,j6,wt,l0,wt,iQ,wt,kc,wt,lU,wt,lW,wt,eT,wt,lA,wt,jm,wt,kx,wt,pQ,wt,lZ,wt,ea,wt,jY,wt,lw,wt,jc,wt,d9,wt,j4,wt,jp,wt,jA,wt,i5,wt,i1,wt,lj,wt,jy,wt,ki,wt,kM,wt,iT,wt,jg,wt,kC,wt,lt,wt,e2,wt,kZ,wt,e_,wt,o3,wt,sr,wt,j3,wt,kd,wt,jv,wt,le,wt,kn,wt,k_,wt,jX,wt,kB,wt,jP,wt,uZ,wt,kg,wt,lP,wt,kO,wt,kR,wt,kA,wt,i8,wt,i0,wt,lO,wt,kW,wt,eZ,wt,lp,wt,iS,wt,jJ,wt,jN,wt,kN,wt,jh,wt,kD,wt,jz,wt,lV,wt,e5,wt,jf,wt,jO,wt,iU,wt,e8,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt,wt];var b1=[wu,wu,hn,wu,hy,wu,hf,wu,fQ,wu,gf,wu,f0,wu,gj,wu,fX,wu,gz,wu,gW,wu,gF,wu,hs,wu,gs,wu,fY,wu,he,wu,g8,wu,hI,wu,hF,wu,f9,wu,g3,wu,h$,wu,dT,wu,hg,wu,f1,wu,hN,wu,gk,wu,gI,wu,hm,wu,gy,wu,gR,wu,g4,wu,gG,wu,g$,wu,c2,wu,fW,wu,gu,wu,hX,wu,hY,wu,ha,wu,cJ,wu,gQ,wu,hZ,wu,fT,wu,g6,wu,gh,wu,hK,wu,f8,wu,dS,wu,f2,wu,f5,wu,hA,wu,fZ,wu,hj,wu,f7,wu,g9,wu,gm,wu,hQ,wu,dC,wu,gx,wu,hG,wu,hL,wu,gv,wu,cH,wu,fV,wu,cq,wu,gU,wu,gw,wu,hW,wu,ge,wu,dz,wu,gq,wu,f4,wu,hB,wu,hE,wu,hu,wu,gA,wu,gO,wu,sL,wu,hP,wu,hV,wu,gJ,wu,dx,wu,hT,wu,gX,wu,gY,wu,hH,wu,hM,wu,ga,wu,f3,wu,d_,wu,fU,wu,gC,wu,hl,wu,fS,wu,gp,wu,gd,wu,h2,wu,hh,wu,hv,wu,dR,wu,sQ,wu,g2,wu,gP,wu,hO,wu,gK,wu,h1,wu,gZ,wu,hS,wu,dQ,wu,hb,wu,h0,wu,gB,wu,fR,wu,g5,wu,hx,wu,gc,wu,ht,wu,dX,wu,hp,wu,gt,wu,dM,wu,gM,wu,hC,wu,f6,wu,mW,wu,g1,wu,fh,wu,hk,wu,gL,wu,gV,wu,hR,wu,gb,wu,hi,wu,f_,wu,fg,wu,f$,wu,gH,wu,hq,wu,g_,wu,hD,wu,gS,wu,hd,wu,dY,wu,dZ,wu,h3,wu,sN,wu,go,wu,ho,wu,hz,wu,gi,wu,gN,wu,gr,wu,gg,wu,fi,wu,g0,wu,h_,wu,hr,wu,hU,wu,hJ,wu,gE,wu,hw,wu,gT,wu,c3,wu,gD,wu,m$,wu,hc,wu,g7,wu,gl,wu,gn,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu,wu];var b2=[wv,wv,eu,wv,u8,wv,eq,wv,pD,wv,eC,wv,er,wv,o9,wv,ey,wv,ej,wv,d1,wv,px,wv,o$,wv,sn,wv,em,wv,on,wv,et,wv,py,wv,d2,wv,sC,wv,sD,wv,u1,wv,eA,wv,ei,wv,va,wv,pi,wv,pR,wv,pz,wv,ev,wv,vJ,wv,pJ,wv,sP,wv,pK,wv,eD,wv,eB,wv,ex,wv,cO,wv,eh,wv,pO,wv,cU,wv,es,wv,ek,wv,ez,wv,su,wv,vL,wv,en,wv,pN,wv,cs,wv,el,wv,ep,wv,eo,wv,ew,wv,wv,wv,wv,wv,wv,wv,wv,wv,wv,wv,wv,wv,wv,wv,wv,wv,wv,wv,wv,wv,wv,wv,wv,wv];var b3=[ww,ww,m6,ww,d7,ww,nD,ww,nC,ww,eg,ww,n3,ww,c_,ww,n5,ww,nE,ww,m7,ww,dB,ww,sw,ww,n4,ww,m5,ww,dW,ww,eR,ww,dO,ww,eW,ww,d8,ww,n2,ww,ww,ww,ww,ww,ww,ww,ww,ww,ww,ww,ww,ww,ww,ww,ww,ww,ww,ww,ww,ww,ww,ww];var b4=[wx,wx,d0,wx,c$,wx,wx,wx];var b5=[wy,wy,om,wy,vn,wy,sv,wy,mA,wy,o7,wy,ph,wy,mu,wy,o5,wy,u_,wy,mG,wy,mt,wy,u$,wy,mx,wy,oU,wy,my,wy,oT,wy,mB,wy,mD,wy,mC,wy,mw,wy,mH,wy,o_,wy,so,wy,ol,wy,oQ,wy,mz,wy,oZ,wy,u6,wy,vm,wy,u5,wy,mv,wy,mE,wy,mF,wy,o4,wy,u0,wy,pg,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy,wy];var b6=[wz,wz,d5,wz,m0,wz,nB,wz,eH,wz,m2,wz,n0,wz,c0,wz,pA,wz,d6,wz,nz,wz,n1,wz,d4,wz,n$,wz,eQ,wz,dV,wz,m1,wz,pB,wz,c5,wz,pj,wz,pl,wz,nA,wz,wz,wz,wz,wz,wz,wz,wz,wz,wz,wz,wz,wz,wz,wz,wz,wz,wz,wz,wz,wz];var b7=[wA,wA,pk,wA,pC,wA,wA,wA];var b8=[wB,wB,ct,wB,dP,wB,cP,wB];return{_memcmp:vZ,_strncasecmp:v0,_strcat:vY,_free:vQ,_main:eb,_realloc:vR,_tolower:v$,_strlen:vX,_memset:vV,_malloc:vP,_memcpy:vW,_strcasecmp:v1,_strcpy:v_,runPostSets:cp,stackAlloc:b9,stackSave:ca,stackRestore:cb,setThrew:cc,setTempRet0:cf,setTempRet1:cg,setTempRet2:ch,setTempRet3:ci,setTempRet4:cj,setTempRet5:ck,setTempRet6:cl,setTempRet7:cm,setTempRet8:cn,setTempRet9:co,dynCall_ii:wg,dynCall_viiiii:wh,dynCall_vi:wi,dynCall_vii:wj,dynCall_iiii:wk,dynCall_viii:wl,dynCall_v:wm,dynCall_iiiii:wn,dynCall_iii:wo,dynCall_iiiiii:wp,dynCall_viiii:wq}})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_ii": invoke_ii, "invoke_viiiii": invoke_viiiii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_iiii": invoke_iiii, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_iiiii": invoke_iiiii, "invoke_iii": invoke_iii, "invoke_iiiiii": invoke_iiiiii, "invoke_viiii": invoke_viiii, "_llvm_lifetime_end": _llvm_lifetime_end, "_lseek": _lseek, "_fclose": _fclose, "_SDL_EventState": _SDL_EventState, "_strtoul": _strtoul, "_fflush": _fflush, "_SDL_GetMouseState": _SDL_GetMouseState, "_strtol": _strtol, "_fputc": _fputc, "_fwrite": _fwrite, "_ptsname": _ptsname, "_send": _send, "_tcflush": _tcflush, "_fputs": _fputs, "_emscripten_cancel_main_loop": _emscripten_cancel_main_loop, "_SDL_UnlockAudio": _SDL_UnlockAudio, "_SDL_WasInit": _SDL_WasInit, "_read": _read, "_fileno": _fileno, "_fsync": _fsync, "_signal": _signal, "_SDL_PauseAudio": _SDL_PauseAudio, "_SDL_LockAudio": _SDL_LockAudio, "_strcmp": _strcmp, "_strncmp": _strncmp, "_snprintf": _snprintf, "_fgetc": _fgetc, "_atexit": _atexit, "_close": _close, "_tcsetattr": _tcsetattr, "_strchr": _strchr, "_tcgetattr": _tcgetattr, "_poll": _poll, "___setErrNo": ___setErrNo, "_grantpt": _grantpt, "_ftell": _ftell, "_exit": _exit, "_sprintf": _sprintf, "_fcntl": _fcntl, "_SDL_ShowCursor": _SDL_ShowCursor, "_gmtime": _gmtime, "_symlink": _symlink, "_localtime_r": _localtime_r, "_ftruncate": _ftruncate, "_recv": _recv, "_SDL_PollEvent": _SDL_PollEvent, "_SDL_Init": _SDL_Init, "__exit": __exit, "_SDL_WM_GrabInput": _SDL_WM_GrabInput, "_llvm_va_end": _llvm_va_end, "_tzset": _tzset, "_SDL_CreateRGBSurfaceFrom": _SDL_CreateRGBSurfaceFrom, "_printf": _printf, "_unlockpt": _unlockpt, "_pread": _pread, "_SDL_SetVideoMode": _SDL_SetVideoMode, "_fopen": _fopen, "_open": _open, "_usleep": _usleep, "_SDL_EnableKeyRepeat": _SDL_EnableKeyRepeat, "_puts": _puts, "_SDL_GetVideoInfo": _SDL_GetVideoInfo, "_nanosleep": _nanosleep, "_SDL_Flip": _SDL_Flip, "_SDL_InitSubSystem": _SDL_InitSubSystem, "_strdup": _strdup, "_SDL_GetError": _SDL_GetError, "__formatString": __formatString, "_gettimeofday": _gettimeofday, "_vfprintf": _vfprintf, "_SDL_WM_SetCaption": _SDL_WM_SetCaption, "_sbrk": _sbrk, "___errno_location": ___errno_location, "_SDL_CloseAudio": _SDL_CloseAudio, "_isspace": _isspace, "_llvm_lifetime_start": _llvm_lifetime_start, "__parseInt": __parseInt, "_SDL_OpenAudio": _SDL_OpenAudio, "_localtime": _localtime, "_gmtime_r": _gmtime_r, "_sysconf": _sysconf, "_fread": _fread, "_SDL_WM_ToggleFullScreen": _SDL_WM_ToggleFullScreen, "_abort": _abort, "_fprintf": _fprintf, "_tan": _tan, "__reallyNegative": __reallyNegative, "_posix_openpt": _posix_openpt, "_fseek": _fseek, "_write": _write, "_SDL_UpperBlit": _SDL_UpperBlit, "_truncate": _truncate, "_emscripten_set_main_loop": _emscripten_set_main_loop, "_unlink": _unlink, "_pwrite": _pwrite, "_SDL_FreeSurface": _SDL_FreeSurface, "_time": _time, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "_stdout": _stdout, "_stdin": _stdin, "_stderr": _stderr }, buffer);
var _memcmp = Module["_memcmp"] = asm["_memcmp"];
var _strncasecmp = Module["_strncasecmp"] = asm["_strncasecmp"];
var _strcat = Module["_strcat"] = asm["_strcat"];
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _tolower = Module["_tolower"] = asm["_tolower"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _strcasecmp = Module["_strcasecmp"] = asm["_strcasecmp"];
var _strcpy = Module["_strcpy"] = asm["_strcpy"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };
// TODO: strip out parts of this we do not need
//======= begin closure i64 code =======
// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */
var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };
  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.
    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };
  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.
  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};
  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }
    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };
  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };
  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };
  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }
    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }
    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));
    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };
  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.
  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;
  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);
  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);
  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);
  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);
  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);
  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);
  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };
  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };
  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }
    if (this.isZero()) {
      return '0';
    }
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }
    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));
    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);
      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };
  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };
  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };
  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };
  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };
  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };
  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };
  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };
  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }
    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }
    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };
  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };
  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.
    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;
    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;
    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };
  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };
  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }
    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }
    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }
    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.
    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;
    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;
    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };
  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }
    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }
    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));
      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);
      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }
      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }
      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };
  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };
  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };
  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };
  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };
  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };
  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };
  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };
  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };
  //======= begin jsbn =======
  var navigator = { appName: 'Modern Browser' }; // polyfill a little
  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/
  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */
  // Basic JavaScript BN library - subset useful for RSA encryption.
  // Bits per digit
  var dbits;
  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);
  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }
  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }
  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.
  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }
  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);
  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;
  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }
  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }
  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }
  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }
  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }
  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }
  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }
  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }
  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }
  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }
  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }
  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }
  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }
  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }
  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }
  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }
  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }
  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }
  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }
  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }
  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }
  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }
  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;
  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }
  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }
  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }
  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }
  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }
  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }
  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;
  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }
  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }
  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }
  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;
  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;
  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);
  // jsbn2 stuff
  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }
  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }
  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }
  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }
  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }
  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }
  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }
  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }
  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;
  //======= end jsbn =======
  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();
//======= end closure i64 code =======
// === Auto-generated postamble setup entry stuff ===
Module['callMain'] = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(!Module['preRun'] || Module['preRun'].length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  var ret;
  var initialStackTop = STACKTOP;
  try {
    ret = Module['_main'](argc, argv, 0);
  }
  catch(e) {
    if (e.name == 'ExitStatus') {
      return e.status;
    } else if (e == 'SimulateInfiniteLoop') {
      Module['noExitRuntime'] = true;
    } else {
      throw e;
    }
  } finally {
    STACKTOP = initialStackTop;
  }
  return ret;
}
function run(args) {
  args = args || Module['arguments'];
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return 0;
  }
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    var toRun = Module['preRun'];
    Module['preRun'] = [];
    for (var i = toRun.length-1; i >= 0; i--) {
      toRun[i]();
    }
    if (runDependencies > 0) {
      // a preRun added a dependency, run will be called later
      return 0;
    }
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    var ret = 0;
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      ret = Module['callMain'](args);
      if (!Module['noExitRuntime']) {
        exitRuntime();
      }
    }
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length > 0) {
        Module['postRun'].pop()();
      }
    }
    return ret;
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
    return 0;
  } else {
    return doRun();
  }
}
Module['run'] = Module.run = run;
// {{PRE_RUN_ADDITIONS}}
(function() {
function assert(check, msg) {
  if (!check) throw msg + new Error().stack;
}
Module['FS_createPath']('/', 'roms', true, true);
    function DataRequest() {}
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.requests[name] = this;
      },
      send: function() {}
    };
    var filePreload0 = new DataRequest();
    filePreload0.open('GET', 'roms/kidpix.dsk', true);
    filePreload0.responseType = 'arraybuffer';
    filePreload0.onload = function() {
      var arrayBuffer = filePreload0.response;
      assert(arrayBuffer, 'Loading file roms/kidpix.dsk failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/roms', 'kidpix.dsk', byteArray, true, true, function() {
        Module['removeRunDependency']('fp roms/kidpix.dsk');
      });
    };
    Module['addRunDependency']('fp roms/kidpix.dsk');
    filePreload0.send(null);
    var filePreload1 = new DataRequest();
    filePreload1.open('GET', 'roms/mac-plus.rom', true);
    filePreload1.responseType = 'arraybuffer';
    filePreload1.onload = function() {
      var arrayBuffer = filePreload1.response;
      assert(arrayBuffer, 'Loading file roms/mac-plus.rom failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/roms', 'mac-plus.rom', byteArray, true, true, function() {
        Module['removeRunDependency']('fp roms/mac-plus.rom');
      });
    };
    Module['addRunDependency']('fp roms/mac-plus.rom');
    filePreload1.send(null);
    var filePreload2 = new DataRequest();
    filePreload2.open('GET', 'roms/macplus-pcex.rom', true);
    filePreload2.responseType = 'arraybuffer';
    filePreload2.onload = function() {
      var arrayBuffer = filePreload2.response;
      assert(arrayBuffer, 'Loading file roms/macplus-pcex.rom failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/roms', 'macplus-pcex.rom', byteArray, true, true, function() {
        Module['removeRunDependency']('fp roms/macplus-pcex.rom');
      });
    };
    Module['addRunDependency']('fp roms/macplus-pcex.rom');
    filePreload2.send(null);
    var filePreload3 = new DataRequest();
    filePreload3.open('GET', 'roms/pce-config.cfg', true);
    filePreload3.responseType = 'arraybuffer';
    filePreload3.onload = function() {
      var arrayBuffer = filePreload3.response;
      assert(arrayBuffer, 'Loading file roms/pce-config.cfg failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/roms', 'pce-config.cfg', byteArray, true, true, function() {
        Module['removeRunDependency']('fp roms/pce-config.cfg');
      });
    };
    Module['addRunDependency']('fp roms/pce-config.cfg');
    filePreload3.send(null);
    var filePreload4 = new DataRequest();
    filePreload4.open('GET', 'roms/pram-mac-plus.dat', true);
    filePreload4.responseType = 'arraybuffer';
    filePreload4.onload = function() {
      var arrayBuffer = filePreload4.response;
      assert(arrayBuffer, 'Loading file roms/pram-mac-plus.dat failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/roms', 'pram-mac-plus.dat', byteArray, true, true, function() {
        Module['removeRunDependency']('fp roms/pram-mac-plus.dat');
      });
    };
    Module['addRunDependency']('fp roms/pram-mac-plus.dat');
    filePreload4.send(null);
    var filePreload5 = new DataRequest();
    filePreload5.open('GET', 'roms/pram.dat', true);
    filePreload5.responseType = 'arraybuffer';
    filePreload5.onload = function() {
      var arrayBuffer = filePreload5.response;
      assert(arrayBuffer, 'Loading file roms/pram.dat failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/roms', 'pram.dat', byteArray, true, true, function() {
        Module['removeRunDependency']('fp roms/pram.dat');
      });
    };
    Module['addRunDependency']('fp roms/pram.dat');
    filePreload5.send(null);
    var filePreload6 = new DataRequest();
    filePreload6.open('GET', 'roms/ser_a.out', true);
    filePreload6.responseType = 'arraybuffer';
    filePreload6.onload = function() {
      var arrayBuffer = filePreload6.response;
      assert(arrayBuffer, 'Loading file roms/ser_a.out failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/roms', 'ser_a.out', byteArray, true, true, function() {
        Module['removeRunDependency']('fp roms/ser_a.out');
      });
    };
    Module['addRunDependency']('fp roms/ser_a.out');
    filePreload6.send(null);
    var filePreload7 = new DataRequest();
    filePreload7.open('GET', 'roms/ser_b.out', true);
    filePreload7.responseType = 'arraybuffer';
    filePreload7.onload = function() {
      var arrayBuffer = filePreload7.response;
      assert(arrayBuffer, 'Loading file roms/ser_b.out failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/roms', 'ser_b.out', byteArray, true, true, function() {
        Module['removeRunDependency']('fp roms/ser_b.out');
      });
    };
    Module['addRunDependency']('fp roms/ser_b.out');
    filePreload7.send(null);
    var filePreload8 = new DataRequest();
    filePreload8.open('GET', 'roms/st11.dsk', true);
    filePreload8.responseType = 'arraybuffer';
    filePreload8.onload = function() {
      var arrayBuffer = filePreload8.response;
      assert(arrayBuffer, 'Loading file roms/st11.dsk failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/roms', 'st11.dsk', byteArray, true, true, function() {
        Module['removeRunDependency']('fp roms/st11.dsk');
      });
    };
    Module['addRunDependency']('fp roms/st11.dsk');
    filePreload8.send(null);
    if (!Module.expectedDataFileDownloads) {
      Module.expectedDataFileDownloads = 0;
      Module.finishedDataFileDownloads = 0;
    }
    Module.expectedDataFileDownloads++;
    var PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    var PACKAGE_NAME = '/Users/jfriend/dev/pcejs/build/bin/pce-macplus.data';
    var REMOTE_PACKAGE_NAME = 'pce-macplus.data';
    var PACKAGE_UUID = '243a50e8-1f89-4d06-a6bc-afe13ee2d272';
    function fetchRemotePackage(packageName, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        if (event.loaded && event.total) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: event.total
            };
          } else {
            Module.dataFileDownloads[url].loaded = event.loaded;
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
          var data = Module.dataFileDownloads[download];
            total += data.total;
            loaded += data.loaded;
            num++;
          }
          total = Math.ceil(total * Module.expectedDataFileDownloads/num);
          Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
        } else if (!Module.dataFileDownloads) {
          Module['setStatus']('Downloading data...');
        }
      };
      xhr.onload = function(event) {
        var packageData = xhr.response;
        callback(packageData);
      };
      xhr.send(null);
    };
    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
        curr = DataRequest.prototype.requests['roms/kidpix.dsk'];
        var data = byteArray.subarray(0, 1474560);
        var ptr = Module['_malloc'](1474560);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 1474560);
        curr.onload();
        curr = DataRequest.prototype.requests['roms/mac-plus.rom'];
        var data = byteArray.subarray(1474560, 1605632);
        var ptr = Module['_malloc'](131072);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 131072);
        curr.onload();
        curr = DataRequest.prototype.requests['roms/macplus-pcex.rom'];
        var data = byteArray.subarray(1605632, 1606458);
        var ptr = Module['_malloc'](826);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 826);
        curr.onload();
        curr = DataRequest.prototype.requests['roms/pce-config.cfg'];
        var data = byteArray.subarray(1606458, 1614196);
        var ptr = Module['_malloc'](7738);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 7738);
        curr.onload();
        curr = DataRequest.prototype.requests['roms/pram-mac-plus.dat'];
        var data = byteArray.subarray(1614196, 1614452);
        var ptr = Module['_malloc'](256);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 256);
        curr.onload();
        curr = DataRequest.prototype.requests['roms/pram.dat'];
        var data = byteArray.subarray(1614452, 1614708);
        var ptr = Module['_malloc'](256);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 256);
        curr.onload();
        curr = DataRequest.prototype.requests['roms/ser_a.out'];
        var data = byteArray.subarray(1614708, 1614708);
        var ptr = Module['_malloc'](0);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 0);
        curr.onload();
        curr = DataRequest.prototype.requests['roms/ser_b.out'];
        var data = byteArray.subarray(1614708, 1614708);
        var ptr = Module['_malloc'](0);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 0);
        curr.onload();
        curr = DataRequest.prototype.requests['roms/st11.dsk'];
        var data = byteArray.subarray(1614708, 3089268);
        var ptr = Module['_malloc'](1474560);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 1474560);
        curr.onload();
                Module['removeRunDependency']('datafile_/Users/jfriend/dev/pcejs/build/bin/pce-macplus.data');
    };
    Module['addRunDependency']('datafile_/Users/jfriend/dev/pcejs/build/bin/pce-macplus.data');
    function handleError(error) {
      console.error('package error:', error);
    };
    if (!Module.preloadResults)
      Module.preloadResults = {};
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      fetchRemotePackage(REMOTE_PACKAGE_NAME, processPackageData, handleError);
})();
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
  // {{MODULE_ADDITIONS}}