// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
try {
  this['Module'] = Module;
  Module.test;
} catch (e) {
  this['Module'] = Module = {};
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE =
  typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL =
  !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
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
  Module['readBinary'] = function(filename) {
    return Module['read'](filename, true);
  };
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
    Module['print'] =
      TRY_USE_DUMP && typeof dump !== 'undefined'
        ? function(x) {
            dump(x);
          }
        : function(x) {
            // self.postMessage(x); // enable this if you want stdout to be sent as messages
          };
  }
  Module['load'] = importScripts;
}
if (
  !ENVIRONMENT_IS_WORKER &&
  !ENVIRONMENT_IS_WEB &&
  !ENVIRONMENT_IS_NODE &&
  !ENVIRONMENT_IS_SHELL
) {
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
  Module['print'] = function() {};
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
  stackSave: function() {
    return STACKTOP;
  },
  stackRestore: function(stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function(target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target / quantum) * quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return (
        '((((' +
        target +
        ')+' +
        (quantum - 1) +
        ')>>' +
        logg +
        ')<<' +
        logg +
        ')'
      );
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function(type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
    return type[type.length - 1] == '*';
  },
  isStructType: function isStructType(type) {
    if (isPointerType(type)) return false;
    if (isArrayType(type)) return true;
    if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
    // See comment in isStructPointerType()
    return type[0] == '%';
  },
  INT_TYPES: {i1: 0, i8: 0, i16: 0, i32: 0, i64: 0},
  FLOAT_TYPES: {float: 0, double: 0},
  or64: function(x, y) {
    var l = x | 0 | (y | 0);
    var h =
      (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function(x, y) {
    var l = (x | 0) & (y | 0);
    var h =
      (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function(x, y) {
    var l = (x | 0) ^ (y | 0);
    var h =
      (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function(type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      '%float': 4,
      '%double': 8,
    }['%' + type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length - 1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits / 8;
      }
    }
    return size;
  },
  getNativeFieldSize: function(type) {
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
  getAlignSize: function(type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(
      size || (type ? Runtime.getNativeFieldSize(type) : 0),
      Runtime.QUANTUM_SIZE
    );
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
        size = field.substr(1) | 0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' +
          field +
          ', in ' +
          type.name_ +
          ' :: ' +
          dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr - prev);
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
    type.needsFlattening = type.flatFactor != 1;
    return type.flatIndexes;
  },
  generateStructInfo: function(struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[
        typeName
      ];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr(
          'Number of named fields must match the type for ' +
            typeName +
            ': possibly duplicate struct names. Cannot return structInfo'
        );
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = {
        fields: struct.map(function(item) {
          return item[0];
        }),
      };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize,
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(
            item[key],
            type.fields[i],
            alignment[i]
          );
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function(sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function(func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2 + 2 * i;
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function(index) {
    Runtime.functionPointers[(index - 2) / 2] = null;
  },
  warnOnce: function(text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function(func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function() {
    var buffer = [];
    var needed = 0;
    this.processCChar = function(code) {
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
        ret = String.fromCharCode(
          ((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
        );
      }
      buffer.length = 0;
      return ret;
    };
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    };
  },
  stackAlloc: function(size) {
    var ret = STACKTOP;
    STACKTOP = (STACKTOP + size) | 0;
    STACKTOP = ((STACKTOP + 7) >> 3) << 3;
    return ret;
  },
  staticAlloc: function(size) {
    var ret = STATICTOP;
    STATICTOP = (STATICTOP + size) | 0;
    STATICTOP = ((STATICTOP + 7) >> 3) << 3;
    return ret;
  },
  dynamicAlloc: function(size) {
    var ret = DYNAMICTOP;
    DYNAMICTOP = (DYNAMICTOP + size) | 0;
    DYNAMICTOP = ((DYNAMICTOP + 7) >> 3) << 3;
    if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();
    return ret;
  },
  alignMemory: function(size, quantum) {
    var ret = (size =
      Math.ceil(size / (quantum ? quantum : 8)) * (quantum ? quantum : 8));
    return ret;
  },
  makeBigInt: function(low, high, unsigned) {
    var ret = unsigned
      ? +(low >>> 0) + +(high >>> 0) * +4294967296
      : +(low >>> 0) + +(high | 0) * +4294967296;
    return ret;
  },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0,
};
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue,
  tempInt,
  tempBigInt,
  tempInt2,
  tempBigInt2,
  tempPair,
  tempBigIntI,
  tempBigIntR,
  tempBigIntS,
  tempBigIntP,
  tempBigIntD;
var tempI64, tempI64b;
var tempRet0,
  tempRet1,
  tempRet2,
  tempRet3,
  tempRet4,
  tempRet5,
  tempRet6,
  tempRet7,
  tempRet8,
  tempRet9;
function abort(text) {
  Module.print(text + ':\n' + new Error().stack);
  ABORT = true;
  throw 'Assertion: ' + text;
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
Module['ccall'] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = globalScope['Module']['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch (e) {}
  assert(
    func,
    'Cannot call unknown function ' +
      ident +
      ' (perhaps LLVM optimizations or closure removed it?)'
  );
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length + 1);
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
  var cArgs = args
    ? args.map(function(arg) {
        return toC(arg, argTypes[i++]);
      })
    : [];
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
    return ccallFunc(
      func,
      returnType,
      argTypes,
      Array.prototype.slice.call(arguments)
    );
  };
}
Module['cwrap'] = cwrap;
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
  if (type.charAt(type.length - 1) === '*') type = 'i32'; // pointers are 32-bit
  switch (type) {
    case 'i1':
      HEAP8[ptr] = value;
      break;
    case 'i8':
      HEAP8[ptr] = value;
      break;
    case 'i16':
      HEAP16[ptr >> 1] = value;
      break;
    case 'i32':
      HEAP32[ptr >> 2] = value;
      break;
    case 'i64':
      (tempI64 = [
        value >>> 0,
        (Math.min(+Math.floor(value / +4294967296), +4294967295) | 0) >>> 0,
      ]),
        (HEAP32[ptr >> 2] = tempI64[0]),
        (HEAP32[(ptr + 4) >> 2] = tempI64[1]);
      break;
    case 'float':
      HEAPF32[ptr >> 2] = value;
      break;
    case 'double':
      HEAPF64[ptr >> 3] = value;
      break;
    default:
      abort('invalid type for setValue: ' + type);
  }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length - 1) === '*') type = 'i32'; // pointers are 32-bit
  switch (type) {
    case 'i1':
      return HEAP8[ptr];
    case 'i8':
      return HEAP8[ptr];
    case 'i16':
      return HEAP16[ptr >> 1];
    case 'i32':
      return HEAP32[ptr >> 2];
    case 'i64':
      return HEAP32[ptr >> 2];
    case 'float':
      return HEAPF32[ptr >> 2];
    case 'double':
      return HEAPF64[ptr >> 3];
    default:
      abort('invalid type for setValue: ' + type);
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
    ret = [
      _malloc,
      Runtime.stackAlloc,
      Runtime.staticAlloc,
      Runtime.dynamicAlloc,
    ][allocator === undefined ? ALLOC_STATIC : allocator](
      Math.max(size, singleType ? 1 : types.length)
    );
  }
  if (zeroinit) {
    var ptr = ret,
      stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[ptr >> 2] = 0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[ptr++ | 0] = 0;
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
  var i = 0,
    type,
    typeSize,
    previousType;
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
    setValue(ret + i, curr, type);
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
    t = HEAPU8[(ptr + i) | 0];
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
      curr = String.fromCharCode.apply(
        String,
        HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK))
      );
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(ptr + i) | 0];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x + 4095) >> 12) << 12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0,
  STATICTOP = 0,
  staticSealed = false; // static area
var STACK_BASE = 0,
  STACKTOP = 0,
  STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0,
  DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort(
    'Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, or (2) set Module.TOTAL_MEMORY before the program runs.'
  );
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 268435456;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(
  !!Int32Array &&
    !!Float64Array &&
    !!new Int32Array(1)['subarray'] &&
    !!new Int32Array(1)['set'],
  'Cannot fallback to non-typed array case: Code is too specialized'
);
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
assert(
  HEAPU8[0] === 255 && HEAPU8[3] === 0,
  'Typed arrays 2 must be run on a little-endian system'
);
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
  while (callbacks.length > 0) {
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
  var ret = new Runtime.UTF8Processor().processJSString(stringy);
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
    if (chr > 0xff) {
      chr &= 0xff;
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
    HEAP8[(buffer + i) | 0] = chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(buffer + i) | 0] = array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32
    ? 2 * Math.abs(1 << (bits - 1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
    : Math.pow(2, bits) + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half =
    bits <= 32
      ? Math.abs(1 << (bits - 1)) // abs is needed if bits == 32
      : Math.pow(2, bits - 1);
  if (value >= half && (bits <= 32 || value > half)) {
    // for huge values, we can hit the precision limit and always get true here. so don't do that
    // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
    // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2 * half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul'])
  Math['imul'] = function(a, b) {
    var ah = a >>> 16;
    var al = a & 0xffff;
    var bh = b >>> 16;
    var bl = b & 0xffff;
    return (al * bl + ((ah * bl + al * bh) << 16)) | 0;
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
var calledInit = false,
  calledRun = false;
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
Module['preloadedImages'] = {}; // maps url to image data
Module['preloadedAudios'] = {}; // maps url to audio data
function addPreRun(func) {
  if (!Module['preRun']) Module['preRun'] = [];
  else if (typeof Module['preRun'] == 'function')
    Module['preRun'] = [Module['preRun']];
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
      Browser.asyncLoad(
        filename,
        function(data) {
          applyData(data);
        },
        function(data) {
          throw 'could not load memory initializer ' + filename;
        }
      );
    }
  });
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 44984;
/* global initializers */ __ATINIT__.push({
  func: function() {
    runPostSets();
  },
});
var _stdout;
var _stdin;
var _stderr;
var _stdout = (_stdout = allocate(
  [0, 0, 0, 0, 0, 0, 0, 0],
  'i8',
  ALLOC_STATIC
));
var _stdin = (_stdin = allocate([0, 0, 0, 0, 0, 0, 0, 0], 'i8', ALLOC_STATIC));
var _stderr = (_stderr = allocate(
  [0, 0, 0, 0, 0, 0, 0, 0],
  'i8',
  ALLOC_STATIC
));
/* memory initializer */ allocate(
  [
    0,
    131,
    3,
    0,
    0,
    0,
    0,
    0,
    0,
    130,
    2,
    0,
    0,
    44,
    0,
    0,
    0,
    132,
    4,
    0,
    0,
    4,
    0,
    0,
    0,
    134,
    6,
    0,
    0,
    48,
    0,
    0,
    1,
    132,
    4,
    0,
    0,
    80,
    0,
    0,
    1,
    130,
    2,
    0,
    0,
    46,
    0,
    0,
    1,
    131,
    3,
    0,
    0,
    88,
    0,
    0,
    1,
    134,
    6,
    0,
    0,
    12,
    0,
    0,
    0,
    1,
    2,
    0,
    0,
    24,
    0,
    0,
    0,
    138,
    2,
    0,
    0,
    18,
    0,
    0,
    0,
    129,
    2,
    0,
    0,
    0,
    0,
    0,
    0,
    139,
    2,
    0,
    0,
    20,
    0,
    0,
    0,
    130,
    2,
    0,
    0,
    2,
    0,
    0,
    0,
    2,
    2,
    0,
    0,
    26,
    0,
    0,
    0,
    131,
    2,
    0,
    0,
    4,
    0,
    0,
    0,
    3,
    2,
    0,
    0,
    28,
    0,
    0,
    0,
    132,
    2,
    0,
    0,
    6,
    0,
    0,
    0,
    4,
    2,
    0,
    0,
    30,
    0,
    0,
    0,
    133,
    2,
    0,
    0,
    8,
    0,
    0,
    0,
    5,
    2,
    0,
    0,
    32,
    0,
    0,
    0,
    134,
    2,
    0,
    0,
    10,
    0,
    0,
    0,
    6,
    2,
    0,
    0,
    34,
    0,
    0,
    0,
    135,
    2,
    0,
    0,
    12,
    0,
    0,
    0,
    7,
    2,
    0,
    0,
    36,
    0,
    0,
    0,
    136,
    2,
    0,
    0,
    14,
    0,
    0,
    0,
    8,
    2,
    0,
    0,
    38,
    0,
    0,
    0,
    137,
    2,
    0,
    0,
    16,
    0,
    0,
    1,
    144,
    2,
    0,
    0,
    84,
    0,
    0,
    1,
    135,
    2,
    0,
    0,
    56,
    0,
    0,
    1,
    145,
    2,
    0,
    0,
    86,
    0,
    0,
    1,
    136,
    2,
    0,
    0,
    58,
    0,
    0,
    1,
    146,
    2,
    0,
    0,
    88,
    0,
    0,
    1,
    137,
    2,
    0,
    0,
    60,
    0,
    0,
    1,
    147,
    2,
    0,
    0,
    90,
    0,
    0,
    1,
    138,
    2,
    0,
    0,
    62,
    0,
    0,
    1,
    129,
    2,
    0,
    0,
    22,
    0,
    0,
    1,
    139,
    2,
    0,
    0,
    64,
    0,
    0,
    1,
    130,
    2,
    0,
    0,
    46,
    0,
    0,
    1,
    140,
    2,
    0,
    0,
    66,
    0,
    0,
    1,
    131,
    2,
    0,
    0,
    48,
    0,
    0,
    1,
    141,
    2,
    0,
    0,
    68,
    0,
    0,
    1,
    132,
    2,
    0,
    0,
    50,
    0,
    0,
    1,
    142,
    2,
    0,
    0,
    70,
    0,
    0,
    1,
    133,
    2,
    0,
    0,
    52,
    0,
    0,
    1,
    143,
    2,
    0,
    0,
    72,
    0,
    0,
    1,
    134,
    2,
    0,
    0,
    54,
    0,
    0,
    80,
    0,
    0,
    0,
    0,
    92,
    0,
    0,
    38,
    0,
    0,
    0,
    72,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    20,
    0,
    0,
    0,
    182,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    10,
    0,
    0,
    0,
    16,
    0,
    0,
    0,
    102,
    0,
    0,
    0,
    12,
    0,
    0,
    0,
    18,
    0,
    0,
    0,
    98,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    224,
    123,
    0,
    0,
    48,
    116,
    0,
    0,
    232,
    108,
    0,
    0,
    184,
    102,
    0,
    0,
    2,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    32,
    145,
    0,
    0,
    74,
    0,
    0,
    0,
    40,
    125,
    0,
    0,
    58,
    0,
    0,
    0,
    48,
    118,
    0,
    0,
    102,
    0,
    0,
    0,
    40,
    110,
    0,
    0,
    14,
    0,
    0,
    0,
    248,
    103,
    0,
    0,
    114,
    0,
    0,
    0,
    80,
    98,
    0,
    0,
    84,
    0,
    0,
    0,
    128,
    93,
    0,
    0,
    116,
    0,
    0,
    0,
    72,
    87,
    0,
    0,
    70,
    0,
    0,
    0,
    208,
    82,
    0,
    0,
    44,
    0,
    0,
    0,
    120,
    161,
    0,
    0,
    80,
    0,
    0,
    0,
    136,
    156,
    0,
    0,
    98,
    0,
    0,
    0,
    16,
    151,
    0,
    0,
    10,
    0,
    0,
    0,
    32,
    147,
    0,
    0,
    100,
    0,
    0,
    0,
    40,
    140,
    0,
    0,
    56,
    0,
    0,
    0,
    136,
    136,
    0,
    0,
    92,
    0,
    0,
    0,
    8,
    135,
    0,
    0,
    18,
    0,
    0,
    0,
    16,
    134,
    0,
    0,
    32,
    0,
    0,
    0,
    48,
    133,
    0,
    0,
    40,
    0,
    0,
    0,
    248,
    131,
    0,
    0,
    34,
    0,
    0,
    0,
    128,
    130,
    0,
    0,
    64,
    0,
    0,
    0,
    160,
    128,
    0,
    0,
    72,
    0,
    0,
    0,
    56,
    126,
    0,
    0,
    30,
    0,
    0,
    0,
    112,
    125,
    0,
    0,
    6,
    0,
    0,
    0,
    176,
    124,
    0,
    0,
    106,
    0,
    0,
    0,
    56,
    124,
    0,
    0,
    48,
    0,
    0,
    0,
    208,
    123,
    0,
    0,
    26,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    45,
    43,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    255,
    255,
    255,
    255,
    0,
    0,
    0,
    0,
    255,
    255,
    255,
    255,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    248,
    3,
    0,
    0,
    248,
    2,
    0,
    0,
    232,
    3,
    0,
    0,
    232,
    2,
    0,
    0,
    120,
    3,
    0,
    0,
    120,
    2,
    0,
    0,
    188,
    3,
    0,
    0,
    188,
    2,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    224,
    88,
    0,
    0,
    88,
    84,
    0,
    0,
    184,
    162,
    0,
    0,
    152,
    158,
    0,
    0,
    96,
    152,
    0,
    0,
    0,
    0,
    0,
    0,
    83,
    79,
    70,
    84,
    87,
    65,
    82,
    69,
    32,
    80,
    73,
    82,
    65,
    84,
    69,
    83,
    96,
    106,
    0,
    0,
    232,
    104,
    0,
    0,
    96,
    104,
    0,
    0,
    240,
    103,
    0,
    0,
    184,
    173,
    0,
    0,
    96,
    103,
    0,
    0,
    56,
    103,
    0,
    0,
    144,
    102,
    0,
    0,
    40,
    102,
    0,
    0,
    248,
    101,
    0,
    0,
    0,
    101,
    0,
    0,
    16,
    100,
    0,
    0,
    56,
    99,
    0,
    0,
    0,
    99,
    0,
    0,
    152,
    98,
    0,
    0,
    136,
    94,
    0,
    0,
    56,
    98,
    0,
    0,
    216,
    97,
    0,
    0,
    88,
    88,
    0,
    0,
    160,
    97,
    0,
    0,
    40,
    97,
    0,
    0,
    184,
    83,
    0,
    0,
    184,
    173,
    0,
    0,
    248,
    96,
    0,
    0,
    168,
    111,
    0,
    0,
    176,
    96,
    0,
    0,
    72,
    96,
    0,
    0,
    72,
    162,
    0,
    0,
    80,
    95,
    0,
    0,
    64,
    94,
    0,
    0,
    240,
    157,
    0,
    0,
    184,
    173,
    0,
    0,
    232,
    93,
    0,
    0,
    56,
    105,
    0,
    0,
    104,
    93,
    0,
    0,
    72,
    96,
    0,
    0,
    232,
    151,
    0,
    0,
    200,
    92,
    0,
    0,
    136,
    92,
    0,
    0,
    40,
    148,
    0,
    0,
    24,
    92,
    0,
    0,
    216,
    91,
    0,
    0,
    248,
    104,
    0,
    0,
    8,
    126,
    0,
    0,
    56,
    125,
    0,
    0,
    24,
    94,
    0,
    0,
    136,
    124,
    0,
    0,
    32,
    124,
    0,
    0,
    192,
    123,
    0,
    0,
    40,
    123,
    0,
    0,
    176,
    122,
    0,
    0,
    240,
    87,
    0,
    0,
    48,
    122,
    0,
    0,
    152,
    121,
    0,
    0,
    240,
    87,
    0,
    0,
    176,
    173,
    0,
    0,
    224,
    118,
    0,
    0,
    104,
    83,
    0,
    0,
    176,
    173,
    0,
    0,
    64,
    118,
    0,
    0,
    216,
    161,
    0,
    0,
    112,
    117,
    0,
    0,
    152,
    116,
    0,
    0,
    112,
    157,
    0,
    0,
    16,
    116,
    0,
    0,
    120,
    115,
    0,
    0,
    120,
    151,
    0,
    0,
    232,
    114,
    0,
    0,
    16,
    114,
    0,
    0,
    120,
    151,
    0,
    0,
    176,
    113,
    0,
    0,
    120,
    111,
    0,
    0,
    176,
    147,
    0,
    0,
    200,
    110,
    0,
    0,
    64,
    110,
    0,
    0,
    112,
    140,
    0,
    0,
    184,
    109,
    0,
    0,
    104,
    109,
    0,
    0,
    176,
    136,
    0,
    0,
    136,
    124,
    0,
    0,
    176,
    108,
    0,
    0,
    48,
    135,
    0,
    0,
    112,
    108,
    0,
    0,
    240,
    107,
    0,
    0,
    192,
    134,
    0,
    0,
    104,
    107,
    0,
    0,
    0,
    107,
    0,
    0,
    192,
    133,
    0,
    0,
    136,
    124,
    0,
    0,
    16,
    105,
    0,
    0,
    232,
    132,
    0,
    0,
    128,
    104,
    0,
    0,
    8,
    104,
    0,
    0,
    0,
    0,
    0,
    0,
    63,
    0,
    0,
    0,
    128,
    125,
    0,
    0,
    0,
    0,
    0,
    0,
    192,
    124,
    0,
    0,
    98,
    0,
    1,
    0,
    72,
    124,
    0,
    0,
    232,
    123,
    0,
    0,
    136,
    123,
    0,
    0,
    99,
    0,
    1,
    0,
    0,
    123,
    0,
    0,
    104,
    122,
    0,
    0,
    232,
    121,
    0,
    0,
    100,
    0,
    1,
    0,
    208,
    120,
    0,
    0,
    104,
    122,
    0,
    0,
    8,
    119,
    0,
    0,
    103,
    0,
    1,
    0,
    176,
    118,
    0,
    0,
    104,
    122,
    0,
    0,
    208,
    117,
    0,
    0,
    105,
    0,
    1,
    0,
    224,
    116,
    0,
    0,
    104,
    122,
    0,
    0,
    56,
    116,
    0,
    0,
    73,
    0,
    1,
    0,
    192,
    115,
    0,
    0,
    104,
    122,
    0,
    0,
    40,
    115,
    0,
    0,
    108,
    0,
    1,
    0,
    128,
    114,
    0,
    0,
    104,
    122,
    0,
    0,
    224,
    113,
    0,
    0,
    112,
    0,
    1,
    0,
    168,
    112,
    0,
    0,
    104,
    122,
    0,
    0,
    0,
    111,
    0,
    0,
    113,
    0,
    0,
    0,
    120,
    110,
    0,
    0,
    0,
    0,
    0,
    0,
    208,
    109,
    0,
    0,
    114,
    0,
    0,
    0,
    152,
    109,
    0,
    0,
    0,
    0,
    0,
    0,
    240,
    108,
    0,
    0,
    82,
    0,
    0,
    0,
    128,
    108,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    108,
    0,
    0,
    115,
    0,
    1,
    0,
    176,
    107,
    0,
    0,
    232,
    123,
    0,
    0,
    64,
    107,
    0,
    0,
    116,
    0,
    1,
    0,
    240,
    105,
    0,
    0,
    104,
    122,
    0,
    0,
    160,
    104,
    0,
    0,
    118,
    0,
    0,
    0,
    40,
    104,
    0,
    0,
    0,
    0,
    0,
    0,
    192,
    103,
    0,
    0,
    86,
    0,
    0,
    0,
    72,
    103,
    0,
    0,
    0,
    0,
    0,
    0,
    192,
    102,
    0,
    0,
    255,
    255,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    126,
    129,
    165,
    129,
    129,
    189,
    153,
    129,
    126,
    0,
    0,
    0,
    0,
    0,
    126,
    255,
    219,
    255,
    255,
    195,
    231,
    255,
    126,
    0,
    0,
    0,
    0,
    0,
    0,
    54,
    127,
    127,
    127,
    127,
    62,
    28,
    8,
    0,
    0,
    0,
    0,
    0,
    0,
    8,
    28,
    62,
    127,
    62,
    28,
    8,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    60,
    60,
    231,
    231,
    231,
    24,
    24,
    60,
    0,
    0,
    0,
    0,
    0,
    24,
    60,
    126,
    255,
    255,
    126,
    24,
    24,
    60,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    60,
    60,
    24,
    0,
    0,
    0,
    0,
    0,
    255,
    255,
    255,
    255,
    255,
    231,
    195,
    195,
    231,
    255,
    255,
    255,
    255,
    255,
    0,
    0,
    0,
    0,
    60,
    102,
    66,
    66,
    102,
    60,
    0,
    0,
    0,
    0,
    255,
    255,
    255,
    255,
    195,
    153,
    189,
    189,
    153,
    195,
    255,
    255,
    255,
    255,
    0,
    0,
    15,
    7,
    13,
    25,
    60,
    102,
    102,
    102,
    60,
    0,
    0,
    0,
    0,
    0,
    60,
    102,
    102,
    102,
    60,
    24,
    126,
    24,
    24,
    0,
    0,
    0,
    0,
    0,
    63,
    51,
    63,
    48,
    48,
    48,
    112,
    240,
    224,
    0,
    0,
    0,
    0,
    0,
    127,
    99,
    127,
    99,
    99,
    99,
    103,
    231,
    230,
    192,
    0,
    0,
    0,
    0,
    24,
    24,
    219,
    60,
    231,
    60,
    219,
    24,
    24,
    0,
    0,
    0,
    0,
    0,
    64,
    96,
    112,
    124,
    127,
    124,
    112,
    96,
    64,
    0,
    0,
    0,
    0,
    0,
    1,
    3,
    7,
    31,
    127,
    31,
    7,
    3,
    1,
    0,
    0,
    0,
    0,
    0,
    24,
    60,
    126,
    24,
    24,
    24,
    126,
    60,
    24,
    0,
    0,
    0,
    0,
    0,
    51,
    51,
    51,
    51,
    51,
    51,
    0,
    51,
    51,
    0,
    0,
    0,
    0,
    0,
    127,
    219,
    219,
    219,
    123,
    27,
    27,
    27,
    27,
    0,
    0,
    0,
    0,
    62,
    99,
    48,
    28,
    54,
    99,
    99,
    54,
    28,
    6,
    99,
    62,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    127,
    127,
    127,
    0,
    0,
    0,
    0,
    0,
    24,
    60,
    126,
    24,
    24,
    24,
    126,
    60,
    24,
    126,
    0,
    0,
    0,
    0,
    24,
    60,
    126,
    24,
    24,
    24,
    24,
    24,
    24,
    0,
    0,
    0,
    0,
    0,
    24,
    24,
    24,
    24,
    24,
    24,
    126,
    60,
    24,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    12,
    6,
    127,
    6,
    12,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    48,
    127,
    48,
    24,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    96,
    96,
    96,
    127,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    36,
    102,
    255,
    102,
    36,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    8,
    28,
    28,
    62,
    62,
    127,
    127,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    127,
    127,
    62,
    62,
    28,
    28,
    8,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    60,
    60,
    60,
    24,
    24,
    0,
    24,
    24,
    0,
    0,
    0,
    0,
    99,
    99,
    99,
    34,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    54,
    54,
    127,
    54,
    54,
    54,
    127,
    54,
    54,
    0,
    0,
    0,
    12,
    12,
    62,
    99,
    97,
    96,
    62,
    3,
    67,
    99,
    62,
    12,
    12,
    0,
    0,
    0,
    0,
    0,
    97,
    99,
    6,
    12,
    24,
    51,
    99,
    0,
    0,
    0,
    0,
    0,
    28,
    54,
    54,
    28,
    59,
    110,
    102,
    102,
    59,
    0,
    0,
    0,
    0,
    48,
    48,
    48,
    96,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    12,
    24,
    48,
    48,
    48,
    48,
    48,
    24,
    12,
    0,
    0,
    0,
    0,
    0,
    24,
    12,
    6,
    6,
    6,
    6,
    6,
    12,
    24,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    102,
    60,
    255,
    60,
    102,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    24,
    24,
    255,
    24,
    24,
    24,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    24,
    24,
    48,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    255,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    24,
    0,
    0,
    0,
    0,
    0,
    1,
    3,
    6,
    12,
    24,
    48,
    96,
    64,
    0,
    0,
    0,
    0,
    0,
    0,
    62,
    99,
    103,
    111,
    123,
    115,
    99,
    99,
    62,
    0,
    0,
    0,
    0,
    0,
    12,
    28,
    60,
    12,
    12,
    12,
    12,
    12,
    63,
    0,
    0,
    0,
    0,
    0,
    62,
    99,
    3,
    6,
    12,
    24,
    48,
    99,
    127,
    0,
    0,
    0,
    0,
    0,
    62,
    99,
    3,
    3,
    30,
    3,
    3,
    99,
    62,
    0,
    0,
    0,
    0,
    0,
    6,
    14,
    30,
    54,
    102,
    127,
    6,
    6,
    15,
    0,
    0,
    0,
    0,
    0,
    127,
    96,
    96,
    96,
    126,
    3,
    3,
    99,
    62,
    0,
    0,
    0,
    0,
    0,
    28,
    48,
    96,
    96,
    126,
    99,
    99,
    99,
    62,
    0,
    0,
    0,
    0,
    0,
    127,
    99,
    3,
    6,
    12,
    24,
    24,
    24,
    24,
    0,
    0,
    0,
    0,
    0,
    62,
    99,
    99,
    99,
    62,
    99,
    99,
    99,
    62,
    0,
    0,
    0,
    0,
    0,
    62,
    99,
    99,
    99,
    63,
    3,
    3,
    6,
    60,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    24,
    0,
    0,
    0,
    24,
    24,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    24,
    0,
    0,
    0,
    24,
    24,
    48,
    0,
    0,
    0,
    0,
    0,
    6,
    12,
    24,
    48,
    96,
    48,
    24,
    12,
    6,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    126,
    0,
    0,
    126,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    96,
    48,
    24,
    12,
    6,
    12,
    24,
    48,
    96,
    0,
    0,
    0,
    0,
    0,
    62,
    99,
    99,
    6,
    12,
    12,
    0,
    12,
    12,
    0,
    0,
    0,
    0,
    0,
    62,
    99,
    99,
    111,
    111,
    111,
    110,
    96,
    62,
    0,
    0,
    0,
    0,
    0,
    8,
    28,
    54,
    99,
    99,
    127,
    99,
    99,
    99,
    0,
    0,
    0,
    0,
    0,
    126,
    51,
    51,
    51,
    62,
    51,
    51,
    51,
    126,
    0,
    0,
    0,
    0,
    0,
    30,
    51,
    97,
    96,
    96,
    96,
    97,
    51,
    30,
    0,
    0,
    0,
    0,
    0,
    124,
    54,
    51,
    51,
    51,
    51,
    51,
    54,
    124,
    0,
    0,
    0,
    0,
    0,
    127,
    51,
    49,
    52,
    60,
    52,
    49,
    51,
    127,
    0,
    0,
    0,
    0,
    0,
    127,
    51,
    49,
    52,
    60,
    52,
    48,
    48,
    120,
    0,
    0,
    0,
    0,
    0,
    30,
    51,
    97,
    96,
    96,
    111,
    99,
    51,
    29,
    0,
    0,
    0,
    0,
    0,
    99,
    99,
    99,
    99,
    127,
    99,
    99,
    99,
    99,
    0,
    0,
    0,
    0,
    0,
    60,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    60,
    0,
    0,
    0,
    0,
    0,
    15,
    6,
    6,
    6,
    6,
    6,
    102,
    102,
    60,
    0,
    0,
    0,
    0,
    0,
    115,
    51,
    54,
    54,
    60,
    54,
    54,
    51,
    115,
    0,
    0,
    0,
    0,
    0,
    120,
    48,
    48,
    48,
    48,
    48,
    49,
    51,
    127,
    0,
    0,
    0,
    0,
    0,
    195,
    231,
    255,
    219,
    195,
    195,
    195,
    195,
    195,
    0,
    0,
    0,
    0,
    0,
    99,
    115,
    123,
    127,
    111,
    103,
    99,
    99,
    99,
    0,
    0,
    0,
    0,
    0,
    28,
    54,
    99,
    99,
    99,
    99,
    99,
    54,
    28,
    0,
    0,
    0,
    0,
    0,
    126,
    51,
    51,
    51,
    62,
    48,
    48,
    48,
    120,
    0,
    0,
    0,
    0,
    0,
    62,
    99,
    99,
    99,
    99,
    107,
    111,
    62,
    6,
    7,
    0,
    0,
    0,
    0,
    126,
    51,
    51,
    51,
    62,
    54,
    51,
    51,
    115,
    0,
    0,
    0,
    0,
    0,
    62,
    99,
    99,
    48,
    28,
    6,
    99,
    99,
    62,
    0,
    0,
    0,
    0,
    0,
    255,
    219,
    153,
    24,
    24,
    24,
    24,
    24,
    60,
    0,
    0,
    0,
    0,
    0,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    62,
    0,
    0,
    0,
    0,
    0,
    195,
    195,
    195,
    195,
    195,
    195,
    102,
    60,
    24,
    0,
    0,
    0,
    0,
    0,
    195,
    195,
    195,
    195,
    219,
    219,
    255,
    102,
    102,
    0,
    0,
    0,
    0,
    0,
    195,
    195,
    102,
    60,
    24,
    60,
    102,
    195,
    195,
    0,
    0,
    0,
    0,
    0,
    195,
    195,
    195,
    102,
    60,
    24,
    24,
    24,
    60,
    0,
    0,
    0,
    0,
    0,
    255,
    195,
    134,
    12,
    24,
    48,
    97,
    195,
    255,
    0,
    0,
    0,
    0,
    0,
    60,
    48,
    48,
    48,
    48,
    48,
    48,
    48,
    60,
    0,
    0,
    0,
    0,
    0,
    64,
    96,
    112,
    56,
    28,
    14,
    7,
    3,
    1,
    0,
    0,
    0,
    0,
    0,
    60,
    12,
    12,
    12,
    12,
    12,
    12,
    12,
    60,
    0,
    0,
    0,
    8,
    28,
    54,
    99,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    255,
    0,
    24,
    24,
    12,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    60,
    6,
    62,
    102,
    102,
    59,
    0,
    0,
    0,
    0,
    0,
    112,
    48,
    48,
    60,
    54,
    51,
    51,
    51,
    110,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    62,
    99,
    96,
    96,
    99,
    62,
    0,
    0,
    0,
    0,
    0,
    14,
    6,
    6,
    30,
    54,
    102,
    102,
    102,
    59,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    62,
    99,
    127,
    96,
    99,
    62,
    0,
    0,
    0,
    0,
    0,
    28,
    54,
    50,
    48,
    124,
    48,
    48,
    48,
    120,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    59,
    102,
    102,
    102,
    62,
    6,
    102,
    60,
    0,
    0,
    0,
    112,
    48,
    48,
    54,
    59,
    51,
    51,
    51,
    115,
    0,
    0,
    0,
    0,
    0,
    12,
    12,
    0,
    28,
    12,
    12,
    12,
    12,
    30,
    0,
    0,
    0,
    0,
    0,
    6,
    6,
    0,
    14,
    6,
    6,
    6,
    6,
    102,
    102,
    60,
    0,
    0,
    0,
    112,
    48,
    48,
    51,
    54,
    60,
    54,
    51,
    115,
    0,
    0,
    0,
    0,
    0,
    28,
    12,
    12,
    12,
    12,
    12,
    12,
    12,
    30,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    230,
    255,
    219,
    219,
    219,
    219,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    110,
    51,
    51,
    51,
    51,
    51,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    62,
    99,
    99,
    99,
    99,
    62,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    110,
    51,
    51,
    51,
    62,
    48,
    48,
    120,
    0,
    0,
    0,
    0,
    0,
    0,
    59,
    102,
    102,
    102,
    62,
    6,
    6,
    15,
    0,
    0,
    0,
    0,
    0,
    0,
    110,
    59,
    51,
    48,
    48,
    120,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    62,
    99,
    56,
    14,
    99,
    62,
    0,
    0,
    0,
    0,
    0,
    8,
    24,
    24,
    126,
    24,
    24,
    24,
    27,
    14,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    102,
    102,
    102,
    102,
    102,
    59,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    195,
    195,
    195,
    102,
    60,
    24,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    195,
    195,
    219,
    219,
    255,
    102,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    99,
    54,
    28,
    28,
    54,
    99,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    99,
    99,
    99,
    99,
    63,
    3,
    6,
    60,
    0,
    0,
    0,
    0,
    0,
    0,
    127,
    102,
    12,
    24,
    51,
    127,
    0,
    0,
    0,
    0,
    0,
    14,
    24,
    24,
    24,
    112,
    24,
    24,
    24,
    14,
    0,
    0,
    0,
    0,
    0,
    24,
    24,
    24,
    24,
    0,
    24,
    24,
    24,
    24,
    0,
    0,
    0,
    0,
    0,
    112,
    24,
    24,
    24,
    14,
    24,
    24,
    24,
    112,
    0,
    0,
    0,
    0,
    0,
    59,
    110,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    8,
    28,
    54,
    99,
    99,
    127,
    0,
    0,
    0,
    0,
    0,
    0,
    30,
    51,
    97,
    96,
    96,
    97,
    51,
    30,
    6,
    3,
    62,
    0,
    0,
    0,
    102,
    102,
    0,
    102,
    102,
    102,
    102,
    102,
    59,
    0,
    0,
    0,
    0,
    6,
    12,
    24,
    0,
    62,
    99,
    127,
    96,
    99,
    62,
    0,
    0,
    0,
    0,
    8,
    28,
    54,
    0,
    60,
    6,
    62,
    102,
    102,
    59,
    0,
    0,
    0,
    0,
    0,
    102,
    102,
    0,
    60,
    6,
    62,
    102,
    102,
    59,
    0,
    0,
    0,
    0,
    48,
    24,
    12,
    0,
    60,
    6,
    62,
    102,
    102,
    59,
    0,
    0,
    0,
    0,
    28,
    54,
    28,
    0,
    60,
    6,
    62,
    102,
    102,
    59,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    60,
    102,
    96,
    102,
    60,
    12,
    6,
    60,
    0,
    0,
    0,
    8,
    28,
    54,
    0,
    62,
    99,
    127,
    96,
    99,
    62,
    0,
    0,
    0,
    0,
    0,
    102,
    102,
    0,
    62,
    99,
    127,
    96,
    99,
    62,
    0,
    0,
    0,
    0,
    48,
    24,
    12,
    0,
    62,
    99,
    127,
    96,
    99,
    62,
    0,
    0,
    0,
    0,
    0,
    102,
    102,
    0,
    56,
    24,
    24,
    24,
    24,
    60,
    0,
    0,
    0,
    0,
    24,
    60,
    102,
    0,
    56,
    24,
    24,
    24,
    24,
    60,
    0,
    0,
    0,
    0,
    96,
    48,
    24,
    0,
    56,
    24,
    24,
    24,
    24,
    60,
    0,
    0,
    0,
    0,
    99,
    99,
    8,
    28,
    54,
    99,
    99,
    127,
    99,
    99,
    0,
    0,
    0,
    28,
    54,
    28,
    0,
    28,
    54,
    99,
    99,
    127,
    99,
    99,
    0,
    0,
    0,
    12,
    24,
    48,
    0,
    127,
    51,
    48,
    62,
    48,
    51,
    127,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    110,
    59,
    27,
    126,
    216,
    220,
    119,
    0,
    0,
    0,
    0,
    0,
    31,
    54,
    102,
    102,
    127,
    102,
    102,
    102,
    103,
    0,
    0,
    0,
    0,
    8,
    28,
    54,
    0,
    62,
    99,
    99,
    99,
    99,
    62,
    0,
    0,
    0,
    0,
    0,
    99,
    99,
    0,
    62,
    99,
    99,
    99,
    99,
    62,
    0,
    0,
    0,
    0,
    48,
    24,
    12,
    0,
    62,
    99,
    99,
    99,
    99,
    62,
    0,
    0,
    0,
    0,
    24,
    60,
    102,
    0,
    102,
    102,
    102,
    102,
    102,
    59,
    0,
    0,
    0,
    0,
    48,
    24,
    12,
    0,
    102,
    102,
    102,
    102,
    102,
    59,
    0,
    0,
    0,
    0,
    0,
    99,
    99,
    0,
    99,
    99,
    99,
    99,
    63,
    3,
    6,
    60,
    0,
    0,
    99,
    99,
    28,
    54,
    99,
    99,
    99,
    99,
    54,
    28,
    0,
    0,
    0,
    0,
    99,
    99,
    0,
    99,
    99,
    99,
    99,
    99,
    99,
    62,
    0,
    0,
    0,
    0,
    24,
    24,
    126,
    195,
    192,
    192,
    195,
    126,
    24,
    24,
    0,
    0,
    0,
    0,
    28,
    54,
    50,
    48,
    120,
    48,
    48,
    48,
    115,
    126,
    0,
    0,
    0,
    0,
    0,
    195,
    102,
    60,
    24,
    255,
    24,
    255,
    24,
    24,
    0,
    0,
    0,
    0,
    252,
    102,
    102,
    124,
    98,
    102,
    111,
    102,
    102,
    243,
    0,
    0,
    0,
    0,
    14,
    27,
    24,
    24,
    24,
    126,
    24,
    24,
    24,
    24,
    216,
    112,
    0,
    0,
    12,
    24,
    48,
    0,
    60,
    6,
    62,
    102,
    102,
    59,
    0,
    0,
    0,
    0,
    12,
    24,
    48,
    0,
    56,
    24,
    24,
    24,
    24,
    60,
    0,
    0,
    0,
    0,
    12,
    24,
    48,
    0,
    62,
    99,
    99,
    99,
    99,
    62,
    0,
    0,
    0,
    0,
    12,
    24,
    48,
    0,
    102,
    102,
    102,
    102,
    102,
    59,
    0,
    0,
    0,
    0,
    0,
    59,
    110,
    0,
    110,
    51,
    51,
    51,
    51,
    51,
    0,
    0,
    0,
    59,
    110,
    0,
    99,
    115,
    123,
    127,
    111,
    103,
    99,
    99,
    0,
    0,
    0,
    0,
    60,
    108,
    108,
    62,
    0,
    126,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    108,
    108,
    56,
    0,
    124,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    24,
    0,
    24,
    24,
    48,
    99,
    99,
    62,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    127,
    96,
    96,
    96,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    127,
    3,
    3,
    3,
    0,
    0,
    0,
    0,
    0,
    96,
    224,
    99,
    102,
    108,
    24,
    48,
    110,
    195,
    6,
    12,
    31,
    0,
    0,
    96,
    224,
    99,
    102,
    108,
    24,
    51,
    103,
    207,
    31,
    3,
    3,
    0,
    0,
    0,
    24,
    24,
    0,
    24,
    24,
    60,
    60,
    60,
    24,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    27,
    54,
    108,
    54,
    27,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    108,
    54,
    27,
    54,
    108,
    0,
    0,
    0,
    0,
    0,
    17,
    68,
    17,
    68,
    17,
    68,
    17,
    68,
    17,
    68,
    17,
    68,
    17,
    68,
    85,
    170,
    85,
    170,
    85,
    170,
    85,
    170,
    85,
    170,
    85,
    170,
    85,
    170,
    221,
    119,
    221,
    119,
    221,
    119,
    221,
    119,
    221,
    119,
    221,
    119,
    221,
    119,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    248,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    248,
    24,
    248,
    24,
    24,
    24,
    24,
    24,
    24,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    246,
    54,
    54,
    54,
    54,
    54,
    54,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    254,
    54,
    54,
    54,
    54,
    54,
    54,
    0,
    0,
    0,
    0,
    0,
    248,
    24,
    248,
    24,
    24,
    24,
    24,
    24,
    24,
    54,
    54,
    54,
    54,
    54,
    246,
    6,
    246,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    0,
    0,
    0,
    0,
    0,
    254,
    6,
    246,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    246,
    6,
    254,
    0,
    0,
    0,
    0,
    0,
    0,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    254,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    24,
    24,
    24,
    24,
    248,
    24,
    248,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    248,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    31,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    255,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    255,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    31,
    24,
    24,
    24,
    24,
    24,
    24,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    255,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    255,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    31,
    24,
    31,
    24,
    24,
    24,
    24,
    24,
    24,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    55,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    55,
    48,
    63,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    63,
    48,
    55,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    247,
    0,
    255,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    255,
    0,
    247,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    55,
    48,
    55,
    54,
    54,
    54,
    54,
    54,
    54,
    0,
    0,
    0,
    0,
    0,
    255,
    0,
    255,
    0,
    0,
    0,
    0,
    0,
    0,
    54,
    54,
    54,
    54,
    54,
    247,
    0,
    247,
    54,
    54,
    54,
    54,
    54,
    54,
    24,
    24,
    24,
    24,
    24,
    255,
    0,
    255,
    0,
    0,
    0,
    0,
    0,
    0,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    255,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    255,
    0,
    255,
    24,
    24,
    24,
    24,
    24,
    24,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    255,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    63,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    24,
    24,
    24,
    24,
    31,
    24,
    31,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    31,
    24,
    31,
    24,
    24,
    24,
    24,
    24,
    24,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    63,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    54,
    255,
    54,
    54,
    54,
    54,
    54,
    54,
    24,
    24,
    24,
    24,
    24,
    255,
    24,
    255,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    248,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    31,
    24,
    24,
    24,
    24,
    24,
    24,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    240,
    240,
    240,
    240,
    240,
    240,
    240,
    240,
    240,
    240,
    240,
    240,
    240,
    240,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    15,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    59,
    110,
    108,
    108,
    110,
    59,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    62,
    99,
    126,
    99,
    99,
    126,
    96,
    96,
    32,
    0,
    0,
    0,
    127,
    99,
    99,
    96,
    96,
    96,
    96,
    96,
    96,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    127,
    54,
    54,
    54,
    54,
    54,
    54,
    0,
    0,
    0,
    0,
    0,
    127,
    99,
    48,
    24,
    12,
    24,
    48,
    99,
    127,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    63,
    108,
    108,
    108,
    108,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    51,
    51,
    51,
    51,
    62,
    48,
    48,
    96,
    0,
    0,
    0,
    0,
    0,
    0,
    59,
    110,
    12,
    12,
    12,
    12,
    12,
    0,
    0,
    0,
    0,
    0,
    126,
    24,
    60,
    102,
    102,
    102,
    60,
    24,
    126,
    0,
    0,
    0,
    0,
    0,
    28,
    54,
    99,
    99,
    127,
    99,
    99,
    54,
    28,
    0,
    0,
    0,
    0,
    0,
    28,
    54,
    99,
    99,
    99,
    54,
    54,
    54,
    119,
    0,
    0,
    0,
    0,
    0,
    30,
    48,
    24,
    12,
    62,
    102,
    102,
    102,
    60,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    126,
    219,
    219,
    126,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    3,
    6,
    126,
    219,
    219,
    243,
    126,
    96,
    192,
    0,
    0,
    0,
    0,
    0,
    28,
    48,
    96,
    96,
    124,
    96,
    96,
    48,
    28,
    0,
    0,
    0,
    0,
    0,
    0,
    62,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    0,
    0,
    0,
    0,
    0,
    0,
    127,
    0,
    0,
    127,
    0,
    0,
    127,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    24,
    24,
    255,
    24,
    24,
    24,
    0,
    255,
    0,
    0,
    0,
    0,
    0,
    48,
    24,
    12,
    6,
    12,
    24,
    48,
    0,
    126,
    0,
    0,
    0,
    0,
    0,
    12,
    24,
    48,
    96,
    48,
    24,
    12,
    0,
    126,
    0,
    0,
    0,
    0,
    0,
    14,
    27,
    27,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    216,
    216,
    112,
    0,
    0,
    0,
    0,
    0,
    24,
    24,
    0,
    0,
    255,
    0,
    0,
    24,
    24,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    59,
    110,
    0,
    59,
    110,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    108,
    108,
    56,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    24,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    15,
    12,
    12,
    12,
    12,
    12,
    236,
    108,
    60,
    28,
    0,
    0,
    0,
    0,
    216,
    108,
    108,
    108,
    108,
    108,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    112,
    216,
    48,
    96,
    200,
    248,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    62,
    62,
    62,
    62,
    62,
    62,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    248,
    128,
    0,
    0,
    2,
    0,
    0,
    0,
    120,
    152,
    0,
    0,
    3,
    0,
    0,
    0,
    216,
    126,
    0,
    0,
    4,
    0,
    0,
    0,
    112,
    119,
    0,
    0,
    5,
    0,
    0,
    0,
    88,
    111,
    0,
    0,
    6,
    0,
    0,
    0,
    240,
    104,
    0,
    0,
    7,
    0,
    0,
    0,
    16,
    99,
    0,
    0,
    8,
    0,
    0,
    0,
    104,
    94,
    0,
    0,
    9,
    0,
    0,
    0,
    48,
    88,
    0,
    0,
    10,
    0,
    0,
    0,
    152,
    83,
    0,
    0,
    11,
    0,
    0,
    0,
    32,
    162,
    0,
    0,
    12,
    0,
    0,
    0,
    208,
    157,
    0,
    0,
    13,
    0,
    0,
    0,
    200,
    151,
    0,
    0,
    14,
    0,
    0,
    0,
    0,
    148,
    0,
    0,
    14,
    0,
    0,
    0,
    48,
    144,
    0,
    0,
    15,
    0,
    0,
    0,
    216,
    136,
    0,
    0,
    15,
    0,
    0,
    0,
    80,
    135,
    0,
    0,
    16,
    0,
    0,
    0,
    72,
    134,
    0,
    0,
    17,
    0,
    0,
    0,
    112,
    133,
    0,
    0,
    17,
    0,
    0,
    0,
    136,
    132,
    0,
    0,
    18,
    0,
    0,
    0,
    248,
    130,
    0,
    0,
    19,
    0,
    0,
    0,
    64,
    129,
    0,
    0,
    20,
    0,
    0,
    0,
    160,
    126,
    0,
    0,
    21,
    0,
    0,
    0,
    168,
    125,
    0,
    0,
    22,
    0,
    0,
    0,
    240,
    124,
    0,
    0,
    23,
    0,
    0,
    0,
    88,
    124,
    0,
    0,
    24,
    0,
    0,
    0,
    248,
    123,
    0,
    0,
    25,
    0,
    0,
    0,
    160,
    123,
    0,
    0,
    26,
    0,
    0,
    0,
    8,
    123,
    0,
    0,
    27,
    0,
    0,
    0,
    128,
    122,
    0,
    0,
    28,
    0,
    0,
    0,
    8,
    122,
    0,
    0,
    28,
    0,
    0,
    0,
    8,
    121,
    0,
    0,
    29,
    0,
    0,
    0,
    72,
    119,
    0,
    0,
    29,
    0,
    0,
    0,
    192,
    118,
    0,
    0,
    30,
    0,
    0,
    0,
    232,
    117,
    0,
    0,
    31,
    0,
    0,
    0,
    240,
    116,
    0,
    0,
    32,
    0,
    0,
    0,
    104,
    116,
    0,
    0,
    33,
    0,
    0,
    0,
    208,
    115,
    0,
    0,
    34,
    0,
    0,
    0,
    80,
    115,
    0,
    0,
    35,
    0,
    0,
    0,
    144,
    114,
    0,
    0,
    36,
    0,
    0,
    0,
    0,
    114,
    0,
    0,
    37,
    0,
    0,
    0,
    32,
    113,
    0,
    0,
    38,
    0,
    0,
    0,
    56,
    111,
    0,
    0,
    39,
    0,
    0,
    0,
    168,
    110,
    0,
    0,
    40,
    0,
    0,
    0,
    240,
    109,
    0,
    0,
    41,
    0,
    0,
    0,
    160,
    109,
    0,
    0,
    42,
    0,
    0,
    0,
    16,
    109,
    0,
    0,
    42,
    0,
    0,
    0,
    144,
    108,
    0,
    0,
    43,
    0,
    0,
    0,
    24,
    108,
    0,
    0,
    43,
    0,
    0,
    0,
    192,
    107,
    0,
    0,
    44,
    0,
    0,
    0,
    88,
    107,
    0,
    0,
    45,
    0,
    0,
    0,
    64,
    106,
    0,
    0,
    46,
    0,
    0,
    0,
    208,
    104,
    0,
    0,
    47,
    0,
    0,
    0,
    80,
    104,
    0,
    0,
    48,
    0,
    0,
    0,
    224,
    103,
    0,
    0,
    49,
    0,
    0,
    0,
    80,
    103,
    0,
    0,
    50,
    0,
    0,
    0,
    240,
    102,
    0,
    0,
    51,
    0,
    0,
    0,
    104,
    102,
    0,
    0,
    52,
    0,
    0,
    0,
    24,
    102,
    0,
    0,
    53,
    0,
    0,
    0,
    208,
    101,
    0,
    0,
    54,
    0,
    0,
    0,
    248,
    100,
    0,
    0,
    55,
    0,
    0,
    0,
    248,
    99,
    0,
    0,
    55,
    0,
    0,
    0,
    232,
    98,
    0,
    0,
    56,
    0,
    0,
    0,
    136,
    98,
    0,
    0,
    56,
    0,
    0,
    0,
    24,
    98,
    0,
    0,
    56,
    0,
    0,
    0,
    200,
    97,
    0,
    0,
    57,
    0,
    0,
    0,
    136,
    97,
    0,
    0,
    57,
    0,
    0,
    0,
    24,
    97,
    0,
    0,
    58,
    0,
    0,
    0,
    224,
    96,
    0,
    0,
    58,
    0,
    0,
    0,
    152,
    96,
    0,
    0,
    59,
    0,
    0,
    0,
    48,
    96,
    0,
    0,
    59,
    0,
    0,
    0,
    72,
    95,
    0,
    0,
    60,
    0,
    0,
    0,
    56,
    94,
    0,
    0,
    61,
    0,
    0,
    0,
    224,
    93,
    0,
    0,
    62,
    0,
    0,
    0,
    96,
    93,
    0,
    0,
    63,
    0,
    0,
    0,
    192,
    92,
    0,
    0,
    64,
    0,
    0,
    0,
    128,
    92,
    0,
    0,
    66,
    0,
    0,
    0,
    16,
    92,
    0,
    0,
    65,
    0,
    0,
    0,
    208,
    91,
    0,
    0,
    67,
    0,
    0,
    0,
    200,
    90,
    0,
    0,
    67,
    0,
    0,
    0,
    56,
    90,
    0,
    0,
    68,
    0,
    0,
    0,
    8,
    89,
    0,
    0,
    68,
    0,
    0,
    0,
    40,
    88,
    0,
    0,
    69,
    0,
    0,
    0,
    192,
    87,
    0,
    0,
    69,
    0,
    0,
    0,
    64,
    87,
    0,
    0,
    71,
    0,
    0,
    0,
    192,
    86,
    0,
    0,
    71,
    0,
    0,
    0,
    120,
    86,
    0,
    0,
    73,
    0,
    0,
    0,
    32,
    86,
    0,
    0,
    73,
    0,
    0,
    0,
    0,
    86,
    0,
    0,
    72,
    0,
    0,
    0,
    176,
    85,
    0,
    0,
    72,
    0,
    0,
    0,
    40,
    85,
    0,
    0,
    72,
    0,
    0,
    0,
    128,
    84,
    0,
    0,
    74,
    0,
    0,
    0,
    144,
    83,
    0,
    0,
    75,
    0,
    0,
    0,
    24,
    83,
    0,
    0,
    75,
    0,
    0,
    0,
    200,
    82,
    0,
    0,
    76,
    0,
    0,
    0,
    112,
    82,
    0,
    0,
    77,
    0,
    0,
    0,
    64,
    82,
    0,
    0,
    78,
    0,
    0,
    0,
    200,
    81,
    0,
    0,
    79,
    0,
    0,
    0,
    112,
    81,
    0,
    0,
    79,
    0,
    0,
    0,
    8,
    81,
    0,
    0,
    79,
    0,
    0,
    0,
    96,
    163,
    0,
    0,
    80,
    0,
    0,
    0,
    248,
    162,
    0,
    0,
    81,
    0,
    0,
    0,
    8,
    162,
    0,
    0,
    82,
    0,
    0,
    0,
    192,
    161,
    0,
    0,
    83,
    0,
    0,
    0,
    104,
    161,
    0,
    0,
    84,
    0,
    0,
    0,
    224,
    160,
    0,
    0,
    85,
    0,
    0,
    0,
    168,
    160,
    0,
    0,
    86,
    0,
    0,
    0,
    16,
    160,
    0,
    0,
    87,
    0,
    0,
    0,
    216,
    159,
    0,
    0,
    88,
    0,
    0,
    0,
    144,
    159,
    0,
    0,
    89,
    0,
    0,
    0,
    72,
    159,
    0,
    0,
    90,
    0,
    0,
    0,
    192,
    158,
    0,
    0,
    91,
    0,
    0,
    0,
    192,
    157,
    0,
    0,
    92,
    0,
    0,
    0,
    248,
    156,
    0,
    0,
    93,
    0,
    0,
    0,
    128,
    156,
    0,
    0,
    94,
    0,
    0,
    0,
    64,
    155,
    0,
    0,
    95,
    0,
    0,
    0,
    224,
    154,
    0,
    0,
    96,
    0,
    0,
    0,
    72,
    154,
    0,
    0,
    97,
    0,
    0,
    0,
    224,
    153,
    0,
    0,
    98,
    0,
    0,
    0,
    152,
    153,
    0,
    0,
    99,
    0,
    0,
    0,
    0,
    153,
    0,
    0,
    100,
    0,
    0,
    0,
    160,
    152,
    0,
    0,
    101,
    0,
    0,
    0,
    192,
    151,
    0,
    0,
    102,
    0,
    0,
    0,
    88,
    151,
    0,
    0,
    103,
    0,
    0,
    0,
    8,
    151,
    0,
    0,
    104,
    0,
    0,
    0,
    128,
    150,
    0,
    0,
    105,
    0,
    0,
    0,
    72,
    150,
    0,
    0,
    106,
    0,
    0,
    0,
    32,
    150,
    0,
    0,
    107,
    0,
    0,
    0,
    232,
    149,
    0,
    0,
    108,
    0,
    0,
    0,
    136,
    149,
    0,
    0,
    109,
    0,
    0,
    0,
    16,
    149,
    0,
    0,
    110,
    0,
    0,
    0,
    144,
    148,
    0,
    0,
    111,
    0,
    0,
    0,
    248,
    147,
    0,
    0,
    112,
    0,
    0,
    0,
    120,
    147,
    0,
    0,
    113,
    0,
    0,
    0,
    24,
    147,
    0,
    0,
    114,
    0,
    0,
    0,
    208,
    146,
    0,
    0,
    115,
    0,
    0,
    0,
    120,
    146,
    0,
    0,
    116,
    0,
    0,
    0,
    48,
    146,
    0,
    0,
    117,
    0,
    0,
    0,
    0,
    146,
    0,
    0,
    118,
    0,
    0,
    0,
    160,
    145,
    0,
    0,
    119,
    0,
    0,
    0,
    56,
    145,
    0,
    0,
    120,
    0,
    0,
    0,
    0,
    145,
    0,
    0,
    121,
    0,
    0,
    0,
    40,
    144,
    0,
    0,
    122,
    0,
    0,
    0,
    104,
    140,
    0,
    0,
    123,
    0,
    0,
    0,
    32,
    140,
    0,
    0,
    124,
    0,
    0,
    0,
    200,
    139,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    27,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    58,
    4,
    0,
    0,
    2,
    0,
    0,
    0,
    59,
    4,
    0,
    0,
    3,
    0,
    0,
    0,
    60,
    4,
    0,
    0,
    4,
    0,
    0,
    0,
    61,
    4,
    0,
    0,
    5,
    0,
    0,
    0,
    62,
    4,
    0,
    0,
    6,
    0,
    0,
    0,
    63,
    4,
    0,
    0,
    7,
    0,
    0,
    0,
    64,
    4,
    0,
    0,
    8,
    0,
    0,
    0,
    65,
    4,
    0,
    0,
    9,
    0,
    0,
    0,
    66,
    4,
    0,
    0,
    10,
    0,
    0,
    0,
    67,
    4,
    0,
    0,
    11,
    0,
    0,
    0,
    68,
    4,
    0,
    0,
    12,
    0,
    0,
    0,
    69,
    4,
    0,
    0,
    13,
    0,
    0,
    0,
    70,
    4,
    0,
    0,
    14,
    0,
    0,
    0,
    71,
    4,
    0,
    0,
    15,
    0,
    0,
    0,
    72,
    4,
    0,
    0,
    16,
    0,
    0,
    0,
    96,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    49,
    0,
    0,
    0,
    18,
    0,
    0,
    0,
    50,
    0,
    0,
    0,
    19,
    0,
    0,
    0,
    51,
    0,
    0,
    0,
    20,
    0,
    0,
    0,
    52,
    0,
    0,
    0,
    21,
    0,
    0,
    0,
    53,
    0,
    0,
    0,
    22,
    0,
    0,
    0,
    54,
    0,
    0,
    0,
    23,
    0,
    0,
    0,
    55,
    0,
    0,
    0,
    24,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    25,
    0,
    0,
    0,
    57,
    0,
    0,
    0,
    26,
    0,
    0,
    0,
    48,
    0,
    0,
    0,
    27,
    0,
    0,
    0,
    45,
    0,
    0,
    0,
    28,
    0,
    0,
    0,
    61,
    0,
    0,
    0,
    29,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    30,
    0,
    0,
    0,
    9,
    0,
    0,
    0,
    31,
    0,
    0,
    0,
    113,
    0,
    0,
    0,
    32,
    0,
    0,
    0,
    119,
    0,
    0,
    0,
    33,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    34,
    0,
    0,
    0,
    114,
    0,
    0,
    0,
    35,
    0,
    0,
    0,
    116,
    0,
    0,
    0,
    36,
    0,
    0,
    0,
    121,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    117,
    0,
    0,
    0,
    38,
    0,
    0,
    0,
    105,
    0,
    0,
    0,
    39,
    0,
    0,
    0,
    111,
    0,
    0,
    0,
    40,
    0,
    0,
    0,
    112,
    0,
    0,
    0,
    41,
    0,
    0,
    0,
    91,
    0,
    0,
    0,
    42,
    0,
    0,
    0,
    93,
    0,
    0,
    0,
    43,
    0,
    0,
    0,
    13,
    0,
    0,
    0,
    44,
    0,
    0,
    0,
    57,
    4,
    0,
    0,
    45,
    0,
    0,
    0,
    97,
    0,
    0,
    0,
    46,
    0,
    0,
    0,
    115,
    0,
    0,
    0,
    47,
    0,
    0,
    0,
    100,
    0,
    0,
    0,
    48,
    0,
    0,
    0,
    102,
    0,
    0,
    0,
    49,
    0,
    0,
    0,
    103,
    0,
    0,
    0,
    50,
    0,
    0,
    0,
    104,
    0,
    0,
    0,
    51,
    0,
    0,
    0,
    106,
    0,
    0,
    0,
    52,
    0,
    0,
    0,
    107,
    0,
    0,
    0,
    53,
    0,
    0,
    0,
    108,
    0,
    0,
    0,
    54,
    0,
    0,
    0,
    59,
    0,
    0,
    0,
    55,
    0,
    0,
    0,
    39,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    92,
    0,
    0,
    0,
    57,
    0,
    0,
    0,
    225,
    4,
    0,
    0,
    58,
    0,
    0,
    0,
    60,
    0,
    0,
    0,
    59,
    0,
    0,
    0,
    122,
    0,
    0,
    0,
    60,
    0,
    0,
    0,
    120,
    0,
    0,
    0,
    61,
    0,
    0,
    0,
    99,
    0,
    0,
    0,
    62,
    0,
    0,
    0,
    118,
    0,
    0,
    0,
    63,
    0,
    0,
    0,
    98,
    0,
    0,
    0,
    64,
    0,
    0,
    0,
    110,
    0,
    0,
    0,
    66,
    0,
    0,
    0,
    109,
    0,
    0,
    0,
    65,
    0,
    0,
    0,
    44,
    0,
    0,
    0,
    67,
    0,
    0,
    0,
    46,
    0,
    0,
    0,
    68,
    0,
    0,
    0,
    47,
    0,
    0,
    0,
    69,
    0,
    0,
    0,
    229,
    4,
    0,
    0,
    70,
    0,
    0,
    0,
    224,
    4,
    0,
    0,
    71,
    0,
    0,
    0,
    227,
    4,
    0,
    0,
    73,
    0,
    0,
    0,
    227,
    4,
    0,
    0,
    72,
    0,
    0,
    0,
    226,
    4,
    0,
    0,
    75,
    0,
    0,
    0,
    1,
    5,
    0,
    0,
    74,
    0,
    0,
    0,
    32,
    0,
    0,
    0,
    76,
    0,
    0,
    0,
    230,
    4,
    0,
    0,
    77,
    0,
    0,
    0,
    231,
    4,
    0,
    0,
    78,
    0,
    0,
    0,
    231,
    4,
    0,
    0,
    79,
    0,
    0,
    0,
    118,
    4,
    0,
    0,
    80,
    0,
    0,
    0,
    228,
    4,
    0,
    0,
    81,
    0,
    0,
    0,
    83,
    4,
    0,
    0,
    82,
    0,
    0,
    0,
    84,
    4,
    0,
    0,
    83,
    0,
    0,
    0,
    85,
    4,
    0,
    0,
    84,
    0,
    0,
    0,
    86,
    4,
    0,
    0,
    85,
    0,
    0,
    0,
    95,
    4,
    0,
    0,
    86,
    0,
    0,
    0,
    96,
    4,
    0,
    0,
    87,
    0,
    0,
    0,
    97,
    4,
    0,
    0,
    88,
    0,
    0,
    0,
    87,
    4,
    0,
    0,
    89,
    0,
    0,
    0,
    92,
    4,
    0,
    0,
    90,
    0,
    0,
    0,
    93,
    4,
    0,
    0,
    91,
    0,
    0,
    0,
    94,
    4,
    0,
    0,
    92,
    0,
    0,
    0,
    89,
    4,
    0,
    0,
    93,
    0,
    0,
    0,
    90,
    4,
    0,
    0,
    94,
    0,
    0,
    0,
    91,
    4,
    0,
    0,
    95,
    0,
    0,
    0,
    88,
    4,
    0,
    0,
    96,
    0,
    0,
    0,
    98,
    4,
    0,
    0,
    97,
    0,
    0,
    0,
    99,
    4,
    0,
    0,
    98,
    0,
    0,
    0,
    73,
    4,
    0,
    0,
    99,
    0,
    0,
    0,
    74,
    4,
    0,
    0,
    100,
    0,
    0,
    0,
    75,
    4,
    0,
    0,
    101,
    0,
    0,
    0,
    127,
    0,
    0,
    0,
    102,
    0,
    0,
    0,
    77,
    4,
    0,
    0,
    103,
    0,
    0,
    0,
    78,
    4,
    0,
    0,
    104,
    0,
    0,
    0,
    82,
    4,
    0,
    0,
    105,
    0,
    0,
    0,
    80,
    4,
    0,
    0,
    106,
    0,
    0,
    0,
    81,
    4,
    0,
    0,
    107,
    0,
    0,
    0,
    79,
    4,
    0,
    0,
    108,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    1,
    0,
    1,
    0,
    0,
    0,
    1,
    0,
    129,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    18,
    0,
    0,
    0,
    1,
    0,
    2,
    0,
    0,
    0,
    1,
    0,
    130,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    19,
    0,
    0,
    0,
    1,
    0,
    3,
    0,
    0,
    0,
    1,
    0,
    131,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    20,
    0,
    0,
    0,
    1,
    0,
    4,
    0,
    0,
    0,
    1,
    0,
    132,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    21,
    0,
    0,
    0,
    1,
    0,
    5,
    0,
    0,
    0,
    1,
    0,
    133,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    22,
    0,
    0,
    0,
    1,
    0,
    6,
    0,
    0,
    0,
    1,
    0,
    134,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    23,
    0,
    0,
    0,
    1,
    0,
    7,
    0,
    0,
    0,
    1,
    0,
    135,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    0,
    0,
    0,
    1,
    0,
    8,
    0,
    0,
    0,
    1,
    0,
    136,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    25,
    0,
    0,
    0,
    1,
    0,
    9,
    0,
    0,
    0,
    1,
    0,
    137,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    26,
    0,
    0,
    0,
    1,
    0,
    10,
    0,
    0,
    0,
    1,
    0,
    138,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    27,
    0,
    0,
    0,
    1,
    0,
    11,
    0,
    0,
    0,
    1,
    0,
    139,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    28,
    0,
    0,
    0,
    1,
    0,
    12,
    0,
    0,
    0,
    1,
    0,
    140,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    29,
    0,
    0,
    0,
    1,
    0,
    13,
    0,
    0,
    0,
    1,
    0,
    141,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    30,
    0,
    0,
    0,
    1,
    0,
    14,
    0,
    0,
    0,
    1,
    0,
    142,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    31,
    0,
    0,
    0,
    1,
    0,
    15,
    0,
    0,
    0,
    1,
    0,
    143,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    32,
    0,
    0,
    0,
    1,
    0,
    16,
    0,
    0,
    0,
    1,
    0,
    144,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    33,
    0,
    0,
    0,
    1,
    0,
    17,
    0,
    0,
    0,
    1,
    0,
    145,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    34,
    0,
    0,
    0,
    1,
    0,
    18,
    0,
    0,
    0,
    1,
    0,
    146,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    35,
    0,
    0,
    0,
    1,
    0,
    19,
    0,
    0,
    0,
    1,
    0,
    147,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    36,
    0,
    0,
    0,
    1,
    0,
    20,
    0,
    0,
    0,
    1,
    0,
    148,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    37,
    0,
    0,
    0,
    1,
    0,
    21,
    0,
    0,
    0,
    1,
    0,
    149,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    38,
    0,
    0,
    0,
    1,
    0,
    22,
    0,
    0,
    0,
    1,
    0,
    150,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    39,
    0,
    0,
    0,
    1,
    0,
    23,
    0,
    0,
    0,
    1,
    0,
    151,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    40,
    0,
    0,
    0,
    1,
    0,
    24,
    0,
    0,
    0,
    1,
    0,
    152,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    41,
    0,
    0,
    0,
    1,
    0,
    25,
    0,
    0,
    0,
    1,
    0,
    153,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    42,
    0,
    0,
    0,
    1,
    0,
    26,
    0,
    0,
    0,
    1,
    0,
    154,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    43,
    0,
    0,
    0,
    1,
    0,
    27,
    0,
    0,
    0,
    1,
    0,
    155,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    44,
    0,
    0,
    0,
    1,
    0,
    28,
    0,
    0,
    0,
    1,
    0,
    156,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    71,
    0,
    0,
    0,
    1,
    0,
    29,
    0,
    0,
    0,
    1,
    0,
    157,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    81,
    0,
    0,
    0,
    1,
    0,
    29,
    0,
    0,
    0,
    1,
    0,
    157,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    46,
    0,
    0,
    0,
    1,
    0,
    30,
    0,
    0,
    0,
    1,
    0,
    158,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    47,
    0,
    0,
    0,
    1,
    0,
    31,
    0,
    0,
    0,
    1,
    0,
    159,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    48,
    0,
    0,
    0,
    1,
    0,
    32,
    0,
    0,
    0,
    1,
    0,
    160,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    49,
    0,
    0,
    0,
    1,
    0,
    33,
    0,
    0,
    0,
    1,
    0,
    161,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    50,
    0,
    0,
    0,
    1,
    0,
    34,
    0,
    0,
    0,
    1,
    0,
    162,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    51,
    0,
    0,
    0,
    1,
    0,
    35,
    0,
    0,
    0,
    1,
    0,
    163,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    52,
    0,
    0,
    0,
    1,
    0,
    36,
    0,
    0,
    0,
    1,
    0,
    164,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    53,
    0,
    0,
    0,
    1,
    0,
    37,
    0,
    0,
    0,
    1,
    0,
    165,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    54,
    0,
    0,
    0,
    1,
    0,
    38,
    0,
    0,
    0,
    1,
    0,
    166,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    55,
    0,
    0,
    0,
    1,
    0,
    39,
    0,
    0,
    0,
    1,
    0,
    167,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    56,
    0,
    0,
    0,
    1,
    0,
    40,
    0,
    0,
    0,
    1,
    0,
    168,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    17,
    0,
    0,
    0,
    1,
    0,
    41,
    0,
    0,
    0,
    1,
    0,
    169,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    58,
    0,
    0,
    0,
    1,
    0,
    42,
    0,
    0,
    0,
    1,
    0,
    170,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    57,
    0,
    0,
    0,
    1,
    0,
    43,
    0,
    0,
    0,
    1,
    0,
    171,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    60,
    0,
    0,
    0,
    1,
    0,
    44,
    0,
    0,
    0,
    1,
    0,
    172,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    61,
    0,
    0,
    0,
    1,
    0,
    45,
    0,
    0,
    0,
    1,
    0,
    173,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    62,
    0,
    0,
    0,
    1,
    0,
    46,
    0,
    0,
    0,
    1,
    0,
    174,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    63,
    0,
    0,
    0,
    1,
    0,
    47,
    0,
    0,
    0,
    1,
    0,
    175,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    64,
    0,
    0,
    0,
    1,
    0,
    48,
    0,
    0,
    0,
    1,
    0,
    176,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    66,
    0,
    0,
    0,
    1,
    0,
    49,
    0,
    0,
    0,
    1,
    0,
    177,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    65,
    0,
    0,
    0,
    1,
    0,
    50,
    0,
    0,
    0,
    1,
    0,
    178,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    67,
    0,
    0,
    0,
    1,
    0,
    51,
    0,
    0,
    0,
    1,
    0,
    179,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    68,
    0,
    0,
    0,
    1,
    0,
    52,
    0,
    0,
    0,
    1,
    0,
    180,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    69,
    0,
    0,
    0,
    1,
    0,
    53,
    0,
    0,
    0,
    1,
    0,
    181,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    70,
    0,
    0,
    0,
    1,
    0,
    54,
    0,
    0,
    0,
    1,
    0,
    182,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    84,
    0,
    0,
    0,
    1,
    0,
    55,
    0,
    0,
    0,
    1,
    0,
    183,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    75,
    0,
    0,
    0,
    1,
    0,
    56,
    0,
    0,
    0,
    1,
    0,
    184,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    76,
    0,
    0,
    0,
    1,
    0,
    57,
    0,
    0,
    0,
    1,
    0,
    185,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    45,
    0,
    0,
    0,
    1,
    0,
    58,
    0,
    0,
    0,
    1,
    0,
    186,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    1,
    0,
    59,
    0,
    0,
    0,
    1,
    0,
    187,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    3,
    0,
    0,
    0,
    1,
    0,
    60,
    0,
    0,
    0,
    1,
    0,
    188,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    4,
    0,
    0,
    0,
    1,
    0,
    61,
    0,
    0,
    0,
    1,
    0,
    189,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    5,
    0,
    0,
    0,
    1,
    0,
    62,
    0,
    0,
    0,
    1,
    0,
    190,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    1,
    0,
    63,
    0,
    0,
    0,
    1,
    0,
    191,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    7,
    0,
    0,
    0,
    1,
    0,
    64,
    0,
    0,
    0,
    1,
    0,
    192,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    8,
    0,
    0,
    0,
    1,
    0,
    65,
    0,
    0,
    0,
    1,
    0,
    193,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    9,
    0,
    0,
    0,
    1,
    0,
    66,
    0,
    0,
    0,
    1,
    0,
    194,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    10,
    0,
    0,
    0,
    1,
    0,
    67,
    0,
    0,
    0,
    1,
    0,
    195,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    11,
    0,
    0,
    0,
    1,
    0,
    68,
    0,
    0,
    0,
    1,
    0,
    196,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    82,
    0,
    0,
    0,
    1,
    0,
    69,
    0,
    0,
    0,
    1,
    0,
    197,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    15,
    0,
    0,
    0,
    1,
    0,
    70,
    0,
    0,
    0,
    1,
    0,
    198,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    86,
    0,
    0,
    0,
    1,
    0,
    71,
    0,
    0,
    0,
    1,
    0,
    199,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    100,
    0,
    0,
    0,
    1,
    0,
    71,
    0,
    0,
    0,
    1,
    0,
    199,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    87,
    0,
    0,
    0,
    1,
    0,
    72,
    0,
    0,
    0,
    1,
    0,
    200,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    105,
    0,
    0,
    0,
    1,
    0,
    72,
    0,
    0,
    0,
    1,
    0,
    200,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    88,
    0,
    0,
    0,
    1,
    0,
    73,
    0,
    0,
    0,
    1,
    0,
    201,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    101,
    0,
    0,
    0,
    1,
    0,
    73,
    0,
    0,
    0,
    1,
    0,
    201,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    85,
    0,
    0,
    0,
    1,
    0,
    74,
    0,
    0,
    0,
    1,
    0,
    202,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    90,
    0,
    0,
    0,
    1,
    0,
    75,
    0,
    0,
    0,
    1,
    0,
    203,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    106,
    0,
    0,
    0,
    1,
    0,
    75,
    0,
    0,
    0,
    1,
    0,
    203,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    91,
    0,
    0,
    0,
    1,
    0,
    76,
    0,
    0,
    0,
    1,
    0,
    204,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    92,
    0,
    0,
    0,
    1,
    0,
    77,
    0,
    0,
    0,
    1,
    0,
    205,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    108,
    0,
    0,
    0,
    1,
    0,
    77,
    0,
    0,
    0,
    1,
    0,
    205,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    89,
    0,
    0,
    0,
    1,
    0,
    78,
    0,
    0,
    0,
    1,
    0,
    206,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    93,
    0,
    0,
    0,
    1,
    0,
    79,
    0,
    0,
    0,
    1,
    0,
    207,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    103,
    0,
    0,
    0,
    1,
    0,
    79,
    0,
    0,
    0,
    1,
    0,
    207,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    94,
    0,
    0,
    0,
    1,
    0,
    80,
    0,
    0,
    0,
    1,
    0,
    208,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    107,
    0,
    0,
    0,
    1,
    0,
    80,
    0,
    0,
    0,
    1,
    0,
    208,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    95,
    0,
    0,
    0,
    1,
    0,
    81,
    0,
    0,
    0,
    1,
    0,
    209,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    104,
    0,
    0,
    0,
    1,
    0,
    81,
    0,
    0,
    0,
    1,
    0,
    209,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    96,
    0,
    0,
    0,
    1,
    0,
    28,
    0,
    0,
    0,
    1,
    0,
    156,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    97,
    0,
    0,
    0,
    1,
    0,
    82,
    0,
    0,
    0,
    1,
    0,
    210,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    99,
    0,
    0,
    0,
    1,
    0,
    82,
    0,
    0,
    0,
    1,
    0,
    210,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    98,
    0,
    0,
    0,
    1,
    0,
    83,
    0,
    0,
    0,
    1,
    0,
    211,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    102,
    0,
    0,
    0,
    1,
    0,
    83,
    0,
    0,
    0,
    1,
    0,
    211,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    83,
    0,
    0,
    0,
    2,
    0,
    224,
    53,
    0,
    0,
    2,
    0,
    224,
    181,
    0,
    0,
    0,
    0,
    0,
    0,
    12,
    0,
    0,
    0,
    1,
    0,
    87,
    0,
    0,
    0,
    1,
    0,
    215,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    13,
    0,
    0,
    0,
    1,
    0,
    88,
    0,
    0,
    0,
    1,
    0,
    216,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    126,
    129,
    165,
    129,
    129,
    189,
    153,
    129,
    126,
    0,
    0,
    0,
    0,
    0,
    126,
    255,
    219,
    255,
    255,
    195,
    231,
    255,
    126,
    0,
    0,
    0,
    0,
    0,
    0,
    54,
    127,
    127,
    127,
    127,
    62,
    28,
    8,
    0,
    0,
    0,
    0,
    0,
    0,
    8,
    28,
    62,
    127,
    62,
    28,
    8,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    60,
    60,
    231,
    231,
    231,
    24,
    24,
    60,
    0,
    0,
    0,
    0,
    0,
    24,
    60,
    126,
    255,
    255,
    126,
    24,
    24,
    60,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    60,
    60,
    24,
    0,
    0,
    0,
    0,
    0,
    255,
    255,
    255,
    255,
    255,
    231,
    195,
    195,
    231,
    255,
    255,
    255,
    255,
    255,
    0,
    0,
    0,
    0,
    60,
    102,
    66,
    66,
    102,
    60,
    0,
    0,
    0,
    0,
    255,
    255,
    255,
    255,
    195,
    153,
    189,
    189,
    153,
    195,
    255,
    255,
    255,
    255,
    0,
    0,
    15,
    7,
    13,
    25,
    60,
    102,
    102,
    102,
    60,
    0,
    0,
    0,
    0,
    0,
    60,
    102,
    102,
    102,
    60,
    24,
    126,
    24,
    24,
    0,
    0,
    0,
    0,
    0,
    63,
    51,
    63,
    48,
    48,
    48,
    112,
    240,
    224,
    0,
    0,
    0,
    0,
    0,
    127,
    99,
    127,
    99,
    99,
    99,
    103,
    231,
    230,
    192,
    0,
    0,
    0,
    0,
    24,
    24,
    219,
    60,
    231,
    60,
    219,
    24,
    24,
    0,
    0,
    0,
    0,
    0,
    64,
    96,
    112,
    124,
    127,
    124,
    112,
    96,
    64,
    0,
    0,
    0,
    0,
    0,
    1,
    3,
    7,
    31,
    127,
    31,
    7,
    3,
    1,
    0,
    0,
    0,
    0,
    0,
    24,
    60,
    126,
    24,
    24,
    24,
    126,
    60,
    24,
    0,
    0,
    0,
    0,
    0,
    51,
    51,
    51,
    51,
    51,
    51,
    0,
    51,
    51,
    0,
    0,
    0,
    0,
    0,
    127,
    219,
    219,
    219,
    123,
    27,
    27,
    27,
    27,
    0,
    0,
    0,
    0,
    62,
    99,
    48,
    28,
    54,
    99,
    99,
    54,
    28,
    6,
    99,
    62,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    127,
    127,
    127,
    0,
    0,
    0,
    0,
    0,
    24,
    60,
    126,
    24,
    24,
    24,
    126,
    60,
    24,
    126,
    0,
    0,
    0,
    0,
    24,
    60,
    126,
    24,
    24,
    24,
    24,
    24,
    24,
    0,
    0,
    0,
    0,
    0,
    24,
    24,
    24,
    24,
    24,
    24,
    126,
    60,
    24,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    12,
    6,
    127,
    6,
    12,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    48,
    127,
    48,
    24,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    96,
    96,
    96,
    127,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    36,
    102,
    255,
    102,
    36,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    8,
    28,
    28,
    62,
    62,
    127,
    127,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    127,
    127,
    62,
    62,
    28,
    28,
    8,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    60,
    60,
    60,
    24,
    24,
    0,
    24,
    24,
    0,
    0,
    0,
    0,
    99,
    99,
    99,
    34,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    54,
    54,
    127,
    54,
    54,
    54,
    127,
    54,
    54,
    0,
    0,
    0,
    12,
    12,
    62,
    99,
    97,
    96,
    62,
    3,
    67,
    99,
    62,
    12,
    12,
    0,
    0,
    0,
    0,
    0,
    97,
    99,
    6,
    12,
    24,
    51,
    99,
    0,
    0,
    0,
    0,
    0,
    28,
    54,
    54,
    28,
    59,
    110,
    102,
    102,
    59,
    0,
    0,
    0,
    0,
    48,
    48,
    48,
    96,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    12,
    24,
    48,
    48,
    48,
    48,
    48,
    24,
    12,
    0,
    0,
    0,
    0,
    0,
    24,
    12,
    6,
    6,
    6,
    6,
    6,
    12,
    24,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    102,
    60,
    255,
    60,
    102,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    24,
    24,
    255,
    24,
    24,
    24,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    24,
    24,
    48,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    255,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
    24,
    0,
    0,
    0,
    0,
    0,
    1,
    3,
    6,
    12,
    24,
    48,
    96,
    64,
    0,
    0,
    0,
    0,
    0,
    0,
    62,
    99,
    103,
    111,
    123,
    115,
    99,
    99,
    62,
    0,
    0,
    0,
    0,
    0,
    12,
    28,
    60,
    12,
    12,
    12,
    12,
    12,
    63,
    0,
    0,
    0,
    0,
    0,
    62,
    99,
    3,
    6,
    12,
    24,
    48,
    99,
    127,
    0,
    0,
    0,
    0,
    0,
    62,
    99,
    3,
    3,
    30,
    3,
    3,
    99,
    62,
    0,
    0,
    0,
    0,
    0,
    6,
    14,
    30,
    54,
    102,
    127,
    6,
    6,
    15,
    0,
    0,
    0,
    0,
    0,
    127,
    96,
    96,
    96,
    126,
    3,
    3,
    99,
    62,
    0,
    0,
    0,
    0,
    0,
    28,
    48,
    96,
    96,
    126,
    99,
    99,
    99,
    62,
    0,
    0,
    0,
    0,
    0,
    127,
    99,
    3,
    6,
    12,
    24,
    24,
    24,
    24,
    0,
    0,
    0,
    0,
    0,
    62,
    99,
    99,
    99,
    62,
    99,
    99,
    99,
    62,
    0,
    0,
    0,
    0,
    0,
    62,
    99,
    99,
    99,
    63,
    3,
    3,
    6,
    60,
    0,
    0,
    0,
    0,
    0,
    0,
    24,
  ]
    .concat([
      24,
      0,
      0,
      0,
      24,
      24,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      24,
      24,
      0,
      0,
      0,
      24,
      24,
      48,
      0,
      0,
      0,
      0,
      0,
      6,
      12,
      24,
      48,
      96,
      48,
      24,
      12,
      6,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      126,
      0,
      0,
      126,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      96,
      48,
      24,
      12,
      6,
      12,
      24,
      48,
      96,
      0,
      0,
      0,
      0,
      0,
      62,
      99,
      99,
      6,
      12,
      12,
      0,
      12,
      12,
      0,
      0,
      0,
      0,
      0,
      62,
      99,
      99,
      111,
      111,
      111,
      110,
      96,
      62,
      0,
      0,
      0,
      0,
      0,
      8,
      28,
      54,
      99,
      99,
      127,
      99,
      99,
      99,
      0,
      0,
      0,
      0,
      0,
      126,
      51,
      51,
      51,
      62,
      51,
      51,
      51,
      126,
      0,
      0,
      0,
      0,
      0,
      30,
      51,
      97,
      96,
      96,
      96,
      97,
      51,
      30,
      0,
      0,
      0,
      0,
      0,
      124,
      54,
      51,
      51,
      51,
      51,
      51,
      54,
      124,
      0,
      0,
      0,
      0,
      0,
      127,
      51,
      49,
      52,
      60,
      52,
      49,
      51,
      127,
      0,
      0,
      0,
      0,
      0,
      127,
      51,
      49,
      52,
      60,
      52,
      48,
      48,
      120,
      0,
      0,
      0,
      0,
      0,
      30,
      51,
      97,
      96,
      96,
      111,
      99,
      51,
      29,
      0,
      0,
      0,
      0,
      0,
      99,
      99,
      99,
      99,
      127,
      99,
      99,
      99,
      99,
      0,
      0,
      0,
      0,
      0,
      60,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      60,
      0,
      0,
      0,
      0,
      0,
      15,
      6,
      6,
      6,
      6,
      6,
      102,
      102,
      60,
      0,
      0,
      0,
      0,
      0,
      115,
      51,
      54,
      54,
      60,
      54,
      54,
      51,
      115,
      0,
      0,
      0,
      0,
      0,
      120,
      48,
      48,
      48,
      48,
      48,
      49,
      51,
      127,
      0,
      0,
      0,
      0,
      0,
      195,
      231,
      255,
      219,
      195,
      195,
      195,
      195,
      195,
      0,
      0,
      0,
      0,
      0,
      99,
      115,
      123,
      127,
      111,
      103,
      99,
      99,
      99,
      0,
      0,
      0,
      0,
      0,
      28,
      54,
      99,
      99,
      99,
      99,
      99,
      54,
      28,
      0,
      0,
      0,
      0,
      0,
      126,
      51,
      51,
      51,
      62,
      48,
      48,
      48,
      120,
      0,
      0,
      0,
      0,
      0,
      62,
      99,
      99,
      99,
      99,
      107,
      111,
      62,
      6,
      7,
      0,
      0,
      0,
      0,
      126,
      51,
      51,
      51,
      62,
      54,
      51,
      51,
      115,
      0,
      0,
      0,
      0,
      0,
      62,
      99,
      99,
      48,
      28,
      6,
      99,
      99,
      62,
      0,
      0,
      0,
      0,
      0,
      255,
      219,
      153,
      24,
      24,
      24,
      24,
      24,
      60,
      0,
      0,
      0,
      0,
      0,
      99,
      99,
      99,
      99,
      99,
      99,
      99,
      99,
      62,
      0,
      0,
      0,
      0,
      0,
      195,
      195,
      195,
      195,
      195,
      195,
      102,
      60,
      24,
      0,
      0,
      0,
      0,
      0,
      195,
      195,
      195,
      195,
      219,
      219,
      255,
      102,
      102,
      0,
      0,
      0,
      0,
      0,
      195,
      195,
      102,
      60,
      24,
      60,
      102,
      195,
      195,
      0,
      0,
      0,
      0,
      0,
      195,
      195,
      195,
      102,
      60,
      24,
      24,
      24,
      60,
      0,
      0,
      0,
      0,
      0,
      255,
      195,
      134,
      12,
      24,
      48,
      97,
      195,
      255,
      0,
      0,
      0,
      0,
      0,
      60,
      48,
      48,
      48,
      48,
      48,
      48,
      48,
      60,
      0,
      0,
      0,
      0,
      0,
      64,
      96,
      112,
      56,
      28,
      14,
      7,
      3,
      1,
      0,
      0,
      0,
      0,
      0,
      60,
      12,
      12,
      12,
      12,
      12,
      12,
      12,
      60,
      0,
      0,
      0,
      8,
      28,
      54,
      99,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      255,
      0,
      24,
      24,
      12,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      60,
      6,
      62,
      102,
      102,
      59,
      0,
      0,
      0,
      0,
      0,
      112,
      48,
      48,
      60,
      54,
      51,
      51,
      51,
      110,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      62,
      99,
      96,
      96,
      99,
      62,
      0,
      0,
      0,
      0,
      0,
      14,
      6,
      6,
      30,
      54,
      102,
      102,
      102,
      59,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      62,
      99,
      127,
      96,
      99,
      62,
      0,
      0,
      0,
      0,
      0,
      28,
      54,
      50,
      48,
      124,
      48,
      48,
      48,
      120,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      59,
      102,
      102,
      102,
      62,
      6,
      102,
      60,
      0,
      0,
      0,
      112,
      48,
      48,
      54,
      59,
      51,
      51,
      51,
      115,
      0,
      0,
      0,
      0,
      0,
      12,
      12,
      0,
      28,
      12,
      12,
      12,
      12,
      30,
      0,
      0,
      0,
      0,
      0,
      6,
      6,
      0,
      14,
      6,
      6,
      6,
      6,
      102,
      102,
      60,
      0,
      0,
      0,
      112,
      48,
      48,
      51,
      54,
      60,
      54,
      51,
      115,
      0,
      0,
      0,
      0,
      0,
      28,
      12,
      12,
      12,
      12,
      12,
      12,
      12,
      30,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      230,
      255,
      219,
      219,
      219,
      219,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      110,
      51,
      51,
      51,
      51,
      51,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      62,
      99,
      99,
      99,
      99,
      62,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      110,
      51,
      51,
      51,
      62,
      48,
      48,
      120,
      0,
      0,
      0,
      0,
      0,
      0,
      59,
      102,
      102,
      102,
      62,
      6,
      6,
      15,
      0,
      0,
      0,
      0,
      0,
      0,
      110,
      59,
      51,
      48,
      48,
      120,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      62,
      99,
      56,
      14,
      99,
      62,
      0,
      0,
      0,
      0,
      0,
      8,
      24,
      24,
      126,
      24,
      24,
      24,
      27,
      14,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      102,
      102,
      102,
      102,
      102,
      59,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      195,
      195,
      195,
      102,
      60,
      24,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      195,
      195,
      219,
      219,
      255,
      102,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      99,
      54,
      28,
      28,
      54,
      99,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      99,
      99,
      99,
      99,
      63,
      3,
      6,
      60,
      0,
      0,
      0,
      0,
      0,
      0,
      127,
      102,
      12,
      24,
      51,
      127,
      0,
      0,
      0,
      0,
      0,
      14,
      24,
      24,
      24,
      112,
      24,
      24,
      24,
      14,
      0,
      0,
      0,
      0,
      0,
      24,
      24,
      24,
      24,
      0,
      24,
      24,
      24,
      24,
      0,
      0,
      0,
      0,
      0,
      112,
      24,
      24,
      24,
      14,
      24,
      24,
      24,
      112,
      0,
      0,
      0,
      0,
      0,
      59,
      110,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      8,
      28,
      54,
      99,
      99,
      127,
      0,
      0,
      0,
      0,
      0,
      0,
      30,
      51,
      97,
      96,
      96,
      97,
      51,
      30,
      6,
      3,
      62,
      0,
      0,
      0,
      102,
      102,
      0,
      102,
      102,
      102,
      102,
      102,
      59,
      0,
      0,
      0,
      0,
      6,
      12,
      24,
      0,
      62,
      99,
      127,
      96,
      99,
      62,
      0,
      0,
      0,
      0,
      8,
      28,
      54,
      0,
      60,
      6,
      62,
      102,
      102,
      59,
      0,
      0,
      0,
      0,
      0,
      102,
      102,
      0,
      60,
      6,
      62,
      102,
      102,
      59,
      0,
      0,
      0,
      0,
      48,
      24,
      12,
      0,
      60,
      6,
      62,
      102,
      102,
      59,
      0,
      0,
      0,
      0,
      28,
      54,
      28,
      0,
      60,
      6,
      62,
      102,
      102,
      59,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      60,
      102,
      96,
      102,
      60,
      12,
      6,
      60,
      0,
      0,
      0,
      8,
      28,
      54,
      0,
      62,
      99,
      127,
      96,
      99,
      62,
      0,
      0,
      0,
      0,
      0,
      102,
      102,
      0,
      62,
      99,
      127,
      96,
      99,
      62,
      0,
      0,
      0,
      0,
      48,
      24,
      12,
      0,
      62,
      99,
      127,
      96,
      99,
      62,
      0,
      0,
      0,
      0,
      0,
      102,
      102,
      0,
      56,
      24,
      24,
      24,
      24,
      60,
      0,
      0,
      0,
      0,
      24,
      60,
      102,
      0,
      56,
      24,
      24,
      24,
      24,
      60,
      0,
      0,
      0,
      0,
      96,
      48,
      24,
      0,
      56,
      24,
      24,
      24,
      24,
      60,
      0,
      0,
      0,
      0,
      99,
      99,
      8,
      28,
      54,
      99,
      99,
      127,
      99,
      99,
      0,
      0,
      0,
      28,
      54,
      28,
      0,
      28,
      54,
      99,
      99,
      127,
      99,
      99,
      0,
      0,
      0,
      12,
      24,
      48,
      0,
      127,
      51,
      48,
      62,
      48,
      51,
      127,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      110,
      59,
      27,
      126,
      216,
      220,
      119,
      0,
      0,
      0,
      0,
      0,
      31,
      54,
      102,
      102,
      127,
      102,
      102,
      102,
      103,
      0,
      0,
      0,
      0,
      8,
      28,
      54,
      0,
      62,
      99,
      99,
      99,
      99,
      62,
      0,
      0,
      0,
      0,
      0,
      99,
      99,
      0,
      62,
      99,
      99,
      99,
      99,
      62,
      0,
      0,
      0,
      0,
      48,
      24,
      12,
      0,
      62,
      99,
      99,
      99,
      99,
      62,
      0,
      0,
      0,
      0,
      24,
      60,
      102,
      0,
      102,
      102,
      102,
      102,
      102,
      59,
      0,
      0,
      0,
      0,
      48,
      24,
      12,
      0,
      102,
      102,
      102,
      102,
      102,
      59,
      0,
      0,
      0,
      0,
      0,
      99,
      99,
      0,
      99,
      99,
      99,
      99,
      63,
      3,
      6,
      60,
      0,
      0,
      99,
      99,
      28,
      54,
      99,
      99,
      99,
      99,
      54,
      28,
      0,
      0,
      0,
      0,
      99,
      99,
      0,
      99,
      99,
      99,
      99,
      99,
      99,
      62,
      0,
      0,
      0,
      0,
      24,
      24,
      126,
      195,
      192,
      192,
      195,
      126,
      24,
      24,
      0,
      0,
      0,
      0,
      28,
      54,
      50,
      48,
      120,
      48,
      48,
      48,
      115,
      126,
      0,
      0,
      0,
      0,
      0,
      195,
      102,
      60,
      24,
      255,
      24,
      255,
      24,
      24,
      0,
      0,
      0,
      0,
      252,
      102,
      102,
      124,
      98,
      102,
      111,
      102,
      102,
      243,
      0,
      0,
      0,
      0,
      14,
      27,
      24,
      24,
      24,
      126,
      24,
      24,
      24,
      24,
      216,
      112,
      0,
      0,
      12,
      24,
      48,
      0,
      60,
      6,
      62,
      102,
      102,
      59,
      0,
      0,
      0,
      0,
      12,
      24,
      48,
      0,
      56,
      24,
      24,
      24,
      24,
      60,
      0,
      0,
      0,
      0,
      12,
      24,
      48,
      0,
      62,
      99,
      99,
      99,
      99,
      62,
      0,
      0,
      0,
      0,
      12,
      24,
      48,
      0,
      102,
      102,
      102,
      102,
      102,
      59,
      0,
      0,
      0,
      0,
      0,
      59,
      110,
      0,
      110,
      51,
      51,
      51,
      51,
      51,
      0,
      0,
      0,
      59,
      110,
      0,
      99,
      115,
      123,
      127,
      111,
      103,
      99,
      99,
      0,
      0,
      0,
      0,
      60,
      108,
      108,
      62,
      0,
      126,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      56,
      108,
      108,
      56,
      0,
      124,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      24,
      24,
      0,
      24,
      24,
      48,
      99,
      99,
      62,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      127,
      96,
      96,
      96,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      127,
      3,
      3,
      3,
      0,
      0,
      0,
      0,
      0,
      96,
      224,
      99,
      102,
      108,
      24,
      48,
      110,
      195,
      6,
      12,
      31,
      0,
      0,
      96,
      224,
      99,
      102,
      108,
      24,
      51,
      103,
      207,
      31,
      3,
      3,
      0,
      0,
      0,
      24,
      24,
      0,
      24,
      24,
      60,
      60,
      60,
      24,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      27,
      54,
      108,
      54,
      27,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      108,
      54,
      27,
      54,
      108,
      0,
      0,
      0,
      0,
      0,
      17,
      68,
      17,
      68,
      17,
      68,
      17,
      68,
      17,
      68,
      17,
      68,
      17,
      68,
      85,
      170,
      85,
      170,
      85,
      170,
      85,
      170,
      85,
      170,
      85,
      170,
      85,
      170,
      221,
      119,
      221,
      119,
      221,
      119,
      221,
      119,
      221,
      119,
      221,
      119,
      221,
      119,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      248,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      248,
      24,
      248,
      24,
      24,
      24,
      24,
      24,
      24,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      246,
      54,
      54,
      54,
      54,
      54,
      54,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      254,
      54,
      54,
      54,
      54,
      54,
      54,
      0,
      0,
      0,
      0,
      0,
      248,
      24,
      248,
      24,
      24,
      24,
      24,
      24,
      24,
      54,
      54,
      54,
      54,
      54,
      246,
      6,
      246,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      0,
      0,
      0,
      0,
      0,
      254,
      6,
      246,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      246,
      6,
      254,
      0,
      0,
      0,
      0,
      0,
      0,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      254,
      0,
      0,
      0,
      0,
      0,
      0,
      24,
      24,
      24,
      24,
      24,
      248,
      24,
      248,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      248,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      31,
      0,
      0,
      0,
      0,
      0,
      0,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      255,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      255,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      31,
      24,
      24,
      24,
      24,
      24,
      24,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      255,
      0,
      0,
      0,
      0,
      0,
      0,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      255,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      31,
      24,
      31,
      24,
      24,
      24,
      24,
      24,
      24,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      55,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      55,
      48,
      63,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      63,
      48,
      55,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      247,
      0,
      255,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      255,
      0,
      247,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      55,
      48,
      55,
      54,
      54,
      54,
      54,
      54,
      54,
      0,
      0,
      0,
      0,
      0,
      255,
      0,
      255,
      0,
      0,
      0,
      0,
      0,
      0,
      54,
      54,
      54,
      54,
      54,
      247,
      0,
      247,
      54,
      54,
      54,
      54,
      54,
      54,
      24,
      24,
      24,
      24,
      24,
      255,
      0,
      255,
      0,
      0,
      0,
      0,
      0,
      0,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      255,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      255,
      0,
      255,
      24,
      24,
      24,
      24,
      24,
      24,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      255,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      63,
      0,
      0,
      0,
      0,
      0,
      0,
      24,
      24,
      24,
      24,
      24,
      31,
      24,
      31,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      31,
      24,
      31,
      24,
      24,
      24,
      24,
      24,
      24,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      63,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      255,
      54,
      54,
      54,
      54,
      54,
      54,
      24,
      24,
      24,
      24,
      24,
      255,
      24,
      255,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      248,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      31,
      24,
      24,
      24,
      24,
      24,
      24,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      240,
      240,
      240,
      240,
      240,
      240,
      240,
      240,
      240,
      240,
      240,
      240,
      240,
      240,
      15,
      15,
      15,
      15,
      15,
      15,
      15,
      15,
      15,
      15,
      15,
      15,
      15,
      15,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      59,
      110,
      108,
      108,
      110,
      59,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      62,
      99,
      126,
      99,
      99,
      126,
      96,
      96,
      32,
      0,
      0,
      0,
      127,
      99,
      99,
      96,
      96,
      96,
      96,
      96,
      96,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      127,
      54,
      54,
      54,
      54,
      54,
      54,
      0,
      0,
      0,
      0,
      0,
      127,
      99,
      48,
      24,
      12,
      24,
      48,
      99,
      127,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      63,
      108,
      108,
      108,
      108,
      56,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      51,
      51,
      51,
      51,
      62,
      48,
      48,
      96,
      0,
      0,
      0,
      0,
      0,
      0,
      59,
      110,
      12,
      12,
      12,
      12,
      12,
      0,
      0,
      0,
      0,
      0,
      126,
      24,
      60,
      102,
      102,
      102,
      60,
      24,
      126,
      0,
      0,
      0,
      0,
      0,
      28,
      54,
      99,
      99,
      127,
      99,
      99,
      54,
      28,
      0,
      0,
      0,
      0,
      0,
      28,
      54,
      99,
      99,
      99,
      54,
      54,
      54,
      119,
      0,
      0,
      0,
      0,
      0,
      30,
      48,
      24,
      12,
      62,
      102,
      102,
      102,
      60,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      126,
      219,
      219,
      126,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      3,
      6,
      126,
      219,
      219,
      243,
      126,
      96,
      192,
      0,
      0,
      0,
      0,
      0,
      28,
      48,
      96,
      96,
      124,
      96,
      96,
      48,
      28,
      0,
      0,
      0,
      0,
      0,
      0,
      62,
      99,
      99,
      99,
      99,
      99,
      99,
      99,
      0,
      0,
      0,
      0,
      0,
      0,
      127,
      0,
      0,
      127,
      0,
      0,
      127,
      0,
      0,
      0,
      0,
      0,
      0,
      24,
      24,
      24,
      255,
      24,
      24,
      24,
      0,
      255,
      0,
      0,
      0,
      0,
      0,
      48,
      24,
      12,
      6,
      12,
      24,
      48,
      0,
      126,
      0,
      0,
      0,
      0,
      0,
      12,
      24,
      48,
      96,
      48,
      24,
      12,
      0,
      126,
      0,
      0,
      0,
      0,
      0,
      14,
      27,
      27,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      216,
      216,
      112,
      0,
      0,
      0,
      0,
      0,
      24,
      24,
      0,
      0,
      255,
      0,
      0,
      24,
      24,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      59,
      110,
      0,
      59,
      110,
      0,
      0,
      0,
      0,
      0,
      0,
      56,
      108,
      108,
      56,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      24,
      24,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      24,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      15,
      12,
      12,
      12,
      12,
      12,
      236,
      108,
      60,
      28,
      0,
      0,
      0,
      0,
      216,
      108,
      108,
      108,
      108,
      108,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      112,
      216,
      48,
      96,
      200,
      248,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      62,
      62,
      62,
      62,
      62,
      62,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      0,
      2,
      2,
      1,
      1,
      1,
      0,
      2,
      2,
      0,
      0,
      0,
      0,
      112,
      0,
      0,
      0,
      110,
      0,
      0,
      0,
      116,
      0,
      0,
      0,
      114,
      0,
      0,
      0,
      120,
      0,
      0,
      0,
      118,
      0,
      0,
      0,
      122,
      0,
      0,
      0,
      56,
      1,
      0,
      0,
      100,
      0,
      0,
      0,
      56,
      1,
      0,
      0,
      96,
      0,
      0,
      0,
      98,
      0,
      0,
      0,
      106,
      0,
      0,
      0,
      108,
      0,
      0,
      0,
      102,
      0,
      0,
      0,
      104,
      0,
      0,
      0,
      66,
      0,
      0,
      0,
      56,
      1,
      0,
      0,
      70,
      0,
      0,
      0,
      68,
      0,
      0,
      0,
      74,
      0,
      0,
      0,
      72,
      0,
      0,
      0,
      78,
      0,
      0,
      0,
      76,
      0,
      0,
      0,
      44,
      1,
      0,
      0,
      58,
      1,
      0,
      0,
      60,
      1,
      0,
      0,
      62,
      1,
      0,
      0,
      48,
      1,
      0,
      0,
      50,
      1,
      0,
      0,
      52,
      1,
      0,
      0,
      54,
      1,
      0,
      0,
      68,
      1,
      0,
      0,
      70,
      1,
      0,
      0,
      64,
      1,
      0,
      0,
      66,
      1,
      0,
      0,
      76,
      1,
      0,
      0,
      78,
      1,
      0,
      0,
      72,
      1,
      0,
      0,
      74,
      1,
      0,
      0,
      110,
      1,
      0,
      0,
      108,
      1,
      0,
      0,
      114,
      1,
      0,
      0,
      112,
      1,
      0,
      0,
      118,
      1,
      0,
      0,
      116,
      1,
      0,
      0,
      122,
      1,
      0,
      0,
      120,
      1,
      0,
      0,
      248,
      1,
      0,
      0,
      246,
      1,
      0,
      0,
      8,
      1,
      0,
      0,
      4,
      1,
      0,
      0,
      254,
      1,
      0,
      0,
      252,
      1,
      0,
      0,
      12,
      1,
      0,
      0,
      250,
      1,
      0,
      0,
      6,
      2,
      0,
      0,
      156,
      1,
      0,
      0,
      218,
      1,
      0,
      0,
      216,
      1,
      0,
      0,
      214,
      1,
      0,
      0,
      226,
      1,
      0,
      0,
      224,
      1,
      0,
      0,
      40,
      2,
      0,
      0,
      84,
      1,
      0,
      0,
      86,
      1,
      0,
      0,
      88,
      1,
      0,
      0,
      90,
      1,
      0,
      0,
      186,
      1,
      0,
      0,
      240,
      1,
      0,
      0,
      188,
      1,
      0,
      0,
      82,
      1,
      0,
      0,
      100,
      1,
      0,
      0,
      102,
      1,
      0,
      0,
      132,
      1,
      0,
      0,
      134,
      1,
      0,
      0,
      136,
      1,
      0,
      0,
      126,
      1,
      0,
      0,
      128,
      1,
      0,
      0,
      130,
      1,
      0,
      0,
      238,
      0,
      0,
      0,
      236,
      0,
      0,
      0,
      150,
      0,
      0,
      0,
      240,
      0,
      0,
      0,
      244,
      0,
      0,
      0,
      242,
      0,
      0,
      0,
      248,
      0,
      0,
      0,
      246,
      0,
      0,
      0,
      234,
      0,
      0,
      0,
      232,
      0,
      0,
      0,
      204,
      0,
      0,
      0,
      208,
      0,
      0,
      0,
      206,
      0,
      0,
      0,
      212,
      0,
      0,
      0,
      210,
      0,
      0,
      0,
      214,
      0,
      0,
      0,
      34,
      0,
      0,
      0,
      16,
      1,
      0,
      0,
      30,
      0,
      0,
      0,
      32,
      0,
      0,
      0,
      22,
      1,
      0,
      0,
      28,
      1,
      0,
      0,
      36,
      0,
      0,
      0,
      38,
      0,
      0,
      0,
      26,
      0,
      0,
      0,
      28,
      0,
      0,
      0,
      58,
      0,
      0,
      0,
      54,
      0,
      0,
      0,
      56,
      0,
      0,
      0,
      62,
      0,
      0,
      0,
      64,
      0,
      0,
      0,
      60,
      0,
      0,
      0,
      190,
      1,
      0,
      0,
      190,
      1,
      0,
      0,
      190,
      1,
      0,
      0,
      190,
      1,
      0,
      0,
      190,
      1,
      0,
      0,
      190,
      1,
      0,
      0,
      190,
      1,
      0,
      0,
      190,
      1,
      0,
      0,
      2,
      1,
      0,
      0,
      2,
      1,
      0,
      0,
      2,
      1,
      0,
      0,
      2,
      1,
      0,
      0,
      2,
      1,
      0,
      0,
      2,
      1,
      0,
      0,
      2,
      1,
      0,
      0,
      2,
      1,
      0,
      0,
      32,
      1,
      0,
      0,
      32,
      1,
      0,
      0,
      32,
      1,
      0,
      0,
      32,
      1,
      0,
      0,
      32,
      1,
      0,
      0,
      32,
      1,
      0,
      0,
      32,
      1,
      0,
      0,
      32,
      1,
      0,
      0,
      34,
      1,
      0,
      0,
      34,
      1,
      0,
      0,
      34,
      1,
      0,
      0,
      34,
      1,
      0,
      0,
      34,
      1,
      0,
      0,
      34,
      1,
      0,
      0,
      34,
      1,
      0,
      0,
      34,
      1,
      0,
      0,
      56,
      1,
      0,
      0,
      56,
      1,
      0,
      0,
      56,
      1,
      0,
      0,
      56,
      1,
      0,
      0,
      56,
      1,
      0,
      0,
      56,
      1,
      0,
      0,
      188,
      0,
      0,
      0,
      56,
      1,
      0,
      0,
      56,
      1,
      0,
      0,
      56,
      1,
      0,
      0,
      56,
      1,
      0,
      0,
      56,
      1,
      0,
      0,
      56,
      1,
      0,
      0,
      56,
      1,
      0,
      0,
      56,
      1,
      0,
      0,
      56,
      1,
      0,
      0,
      30,
      2,
      0,
      0,
      32,
      2,
      0,
      0,
      26,
      2,
      0,
      0,
      28,
      2,
      0,
      0,
      22,
      2,
      0,
      0,
      24,
      2,
      0,
      0,
      154,
      1,
      0,
      0,
      20,
      2,
      0,
      0,
      34,
      2,
      0,
      0,
      36,
      2,
      0,
      0,
      52,
      2,
      0,
      0,
      48,
      2,
      0,
      0,
      50,
      2,
      0,
      0,
      44,
      2,
      0,
      0,
      46,
      2,
      0,
      0,
      42,
      2,
      0,
      0,
      132,
      0,
      0,
      0,
      130,
      0,
      0,
      0,
      132,
      0,
      0,
      0,
      128,
      0,
      0,
      0,
      140,
      0,
      0,
      0,
      138,
      0,
      0,
      0,
      136,
      0,
      0,
      0,
      134,
      0,
      0,
      0,
      126,
      0,
      0,
      0,
      124,
      0,
      0,
      0,
      86,
      0,
      0,
      0,
      84,
      0,
      0,
      0,
      82,
      0,
      0,
      0,
      92,
      0,
      0,
      0,
      90,
      0,
      0,
      0,
      88,
      0,
      0,
      0,
      200,
      0,
      0,
      0,
      200,
      0,
      0,
      0,
      200,
      0,
      0,
      0,
      200,
      0,
      0,
      0,
      200,
      0,
      0,
      0,
      200,
      0,
      0,
      0,
      200,
      0,
      0,
      0,
      200,
      0,
      0,
      0,
      220,
      1,
      0,
      0,
      198,
      0,
      0,
      0,
      10,
      2,
      0,
      0,
      12,
      2,
      0,
      0,
      14,
      2,
      0,
      0,
      0,
      2,
      0,
      0,
      2,
      2,
      0,
      0,
      4,
      2,
      0,
      0,
      152,
      0,
      0,
      0,
      154,
      0,
      0,
      0,
      156,
      0,
      0,
      0,
      158,
      0,
      0,
      0,
      144,
      0,
      0,
      0,
      146,
      0,
      0,
      0,
      148,
      0,
      0,
      0,
      80,
      0,
      0,
      0,
      160,
      0,
      0,
      0,
      162,
      0,
      0,
      0,
      182,
      0,
      0,
      0,
      184,
      0,
      0,
      0,
      186,
      0,
      0,
      0,
      176,
      0,
      0,
      0,
      178,
      0,
      0,
      0,
      180,
      0,
      0,
      0,
      24,
      1,
      0,
      0,
      18,
      1,
      0,
      0,
      158,
      1,
      0,
      0,
      30,
      1,
      0,
      0,
      38,
      1,
      0,
      0,
      8,
      2,
      0,
      0,
      46,
      1,
      0,
      0,
      40,
      1,
      0,
      0,
      244,
      1,
      0,
      0,
      242,
      1,
      0,
      0,
      228,
      1,
      0,
      0,
      232,
      1,
      0,
      0,
      230,
      1,
      0,
      0,
      236,
      1,
      0,
      0,
      234,
      1,
      0,
      0,
      238,
      1,
      0,
      0,
      56,
      1,
      0,
      0,
      56,
      1,
      0,
      0,
      92,
      1,
      0,
      0,
      94,
      1,
      0,
      0,
      104,
      1,
      0,
      0,
      106,
      1,
      0,
      0,
      206,
      1,
      0,
      0,
      208,
      1,
      0,
      0,
      56,
      1,
      0,
      0,
      56,
      1,
      0,
      0,
      142,
      1,
      0,
      0,
      138,
      1,
      0,
      0,
      140,
      1,
      0,
      0,
      146,
      1,
      0,
      0,
      148,
      1,
      0,
      0,
      144,
      1,
      0,
      0,
      230,
      0,
      0,
      0,
      228,
      0,
      0,
      0,
      226,
      0,
      0,
      0,
      224,
      0,
      0,
      0,
      222,
      0,
      0,
      0,
      220,
      0,
      0,
      0,
      56,
      1,
      0,
      0,
      218,
      0,
      0,
      0,
      216,
      0,
      0,
      0,
      216,
      0,
      0,
      0,
      216,
      0,
      0,
      0,
      216,
      0,
      0,
      0,
      216,
      0,
      0,
      0,
      216,
      0,
      0,
      0,
      216,
      0,
      0,
      0,
      216,
      0,
      0,
      0,
      8,
      0,
      0,
      0,
      250,
      0,
      0,
      0,
      10,
      0,
      0,
      0,
      12,
      0,
      0,
      0,
      14,
      0,
      0,
      0,
      16,
      0,
      0,
      0,
      18,
      0,
      0,
      0,
      20,
      0,
      0,
      0,
      22,
      0,
      0,
      0,
      24,
      0,
      0,
      0,
      40,
      0,
      0,
      0,
      42,
      0,
      0,
      0,
      44,
      0,
      0,
      0,
      46,
      0,
      0,
      0,
      48,
      0,
      0,
      0,
      50,
      0,
      0,
      0,
      170,
      1,
      0,
      0,
      56,
      1,
      0,
      0,
      180,
      1,
      0,
      0,
      178,
      1,
      0,
      0,
      162,
      1,
      0,
      0,
      160,
      1,
      0,
      0,
      168,
      1,
      0,
      0,
      166,
      1,
      0,
      0,
      184,
      1,
      0,
      0,
      182,
      1,
      0,
      0,
      26,
      1,
      0,
      0,
      36,
      1,
      0,
      0,
      174,
      1,
      0,
      0,
      172,
      1,
      0,
      0,
      14,
      1,
      0,
      0,
      20,
      1,
      0,
      0,
      150,
      0,
      0,
      0,
      148,
      0,
      0,
      0,
      154,
      0,
      0,
      0,
      152,
      0,
      0,
      0,
      140,
      0,
      0,
      0,
      156,
      0,
      0,
      0,
      138,
      0,
      0,
      0,
      158,
      0,
      0,
      0,
      162,
      0,
      0,
      0,
      160,
      0,
      0,
      0,
      126,
      0,
      0,
      0,
      130,
      0,
      0,
      0,
      128,
      0,
      0,
      0,
      134,
      0,
      0,
      0,
      132,
      0,
      0,
      0,
      136,
      0,
      0,
      0,
      72,
      0,
      0,
      0,
      74,
      0,
      0,
      0,
      68,
      0,
      0,
      0,
      70,
      0,
      0,
      0,
      80,
      0,
      0,
      0,
      82,
      0,
      0,
      0,
      76,
      0,
      0,
      0,
      78,
      0,
      0,
      0,
      18,
      0,
      0,
      0,
      18,
      0,
      0,
      0,
      18,
      0,
      0,
      0,
      18,
      0,
      0,
      0,
      18,
      0,
      0,
      0,
      18,
      0,
      0,
      0,
      18,
      0,
      0,
      0,
      18,
      0,
      0,
      0,
      248,
      127,
      0,
      0,
      52,
      0,
      0,
      0,
      64,
      120,
      0,
      0,
      52,
      0,
      0,
      0,
      72,
      112,
      0,
      0,
      254,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      56,
      148,
      0,
      0,
      198,
      1,
      0,
      0,
      0,
      157,
      0,
      0,
      202,
      1,
      0,
      0,
      0,
      129,
      0,
      0,
      164,
      1,
      0,
      0,
      224,
      120,
      0,
      0,
      164,
      1,
      0,
      0,
      192,
      112,
      0,
      0,
      200,
      1,
      0,
      0,
      16,
      106,
      0,
      0,
      142,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      80,
      97,
      0,
      0,
      96,
      92,
      0,
      0,
      72,
      86,
      0,
      0,
      40,
      82,
      0,
      0,
      152,
      160,
      0,
      0,
      192,
      154,
      0,
      0,
      56,
      150,
      0,
      0,
      96,
      146,
      0,
      0,
      160,
      139,
      0,
      0,
      120,
      136,
      0,
      0,
      248,
      134,
      0,
      0,
      248,
      133,
      0,
      0,
      8,
      133,
      0,
      0,
      216,
      131,
      0,
      0,
      112,
      130,
      0,
      0,
      224,
      127,
      0,
      0,
      248,
      0,
      0,
      0,
      250,
      0,
      0,
      0,
      252,
      0,
      0,
      0,
      254,
      0,
      0,
      0,
      128,
      0,
      0,
      0,
      48,
      0,
      0,
      0,
      50,
      0,
      0,
      0,
      246,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      2,
      1,
      0,
      0,
      20,
      1,
      0,
      0,
      22,
      1,
      0,
      0,
      24,
      1,
      0,
      0,
      14,
      1,
      0,
      0,
      16,
      1,
      0,
      0,
      18,
      1,
      0,
      0,
      76,
      1,
      0,
      0,
      146,
      0,
      0,
      0,
      202,
      0,
      0,
      0,
      200,
      0,
      0,
      0,
      198,
      0,
      0,
      0,
      144,
      0,
      0,
      0,
      196,
      0,
      0,
      0,
      194,
      0,
      0,
      0,
      150,
      0,
      0,
      0,
      148,
      0,
      0,
      0,
      168,
      0,
      0,
      0,
      132,
      0,
      0,
      0,
      164,
      0,
      0,
      0,
      162,
      0,
      0,
      0,
      130,
      0,
      0,
      0,
      158,
      0,
      0,
      0,
      40,
      0,
      0,
      0,
      42,
      0,
      0,
      0,
      240,
      0,
      0,
      0,
      242,
      0,
      0,
      0,
      234,
      0,
      0,
      0,
      38,
      0,
      0,
      0,
      228,
      0,
      0,
      0,
      230,
      0,
      0,
      0,
      34,
      0,
      0,
      0,
      36,
      0,
      0,
      0,
      128,
      1,
      0,
      0,
      124,
      1,
      0,
      0,
      60,
      0,
      0,
      0,
      58,
      0,
      0,
      0,
      122,
      1,
      0,
      0,
      106,
      1,
      0,
      0,
      158,
      1,
      0,
      0,
      174,
      1,
      0,
      0,
      178,
      1,
      0,
      0,
      176,
      1,
      0,
      0,
      182,
      1,
      0,
      0,
      180,
      1,
      0,
      0,
      186,
      1,
      0,
      0,
      184,
      1,
      0,
      0,
      190,
      1,
      0,
      0,
      188,
      1,
      0,
      0,
      146,
      1,
      0,
      0,
      150,
      1,
      0,
      0,
      148,
      1,
      0,
      0,
      154,
      1,
      0,
      0,
      152,
      1,
      0,
      0,
      156,
      1,
      0,
      0,
      86,
      1,
      0,
      0,
      86,
      1,
      0,
      0,
      86,
      1,
      0,
      0,
      86,
      1,
      0,
      0,
      86,
      1,
      0,
      0,
      86,
      1,
      0,
      0,
      86,
      1,
      0,
      0,
      86,
      1,
      0,
      0,
      84,
      1,
      0,
      0,
      84,
      1,
      0,
      0,
      84,
      1,
      0,
      0,
      84,
      1,
      0,
      0,
      84,
      1,
      0,
      0,
      84,
      1,
      0,
      0,
      84,
      1,
      0,
      0,
      84,
      1,
      0,
      0,
      218,
      0,
      0,
      0,
      218,
      0,
      0,
      0,
      218,
      0,
      0,
      0,
      218,
      0,
      0,
      0,
      218,
      0,
      0,
      0,
      218,
      0,
      0,
      0,
      218,
      0,
      0,
      0,
      218,
      0,
      0,
      0,
      180,
      0,
      0,
      0,
      180,
      0,
      0,
      0,
      180,
      0,
      0,
      0,
      180,
      0,
      0,
      0,
      180,
      0,
      0,
      0,
      180,
      0,
      0,
      0,
      180,
      0,
      0,
      0,
      180,
      0,
      0,
      0,
      120,
      0,
      0,
      0,
      122,
      0,
      0,
      0,
      118,
      0,
      0,
      0,
      176,
      0,
      0,
      0,
      176,
      0,
      0,
      0,
      176,
      0,
      0,
      0,
      124,
      0,
      0,
      0,
      176,
      0,
      0,
      0,
      126,
      0,
      0,
      0,
      176,
      0,
      0,
      0,
      136,
      0,
      0,
      0,
      176,
      0,
      0,
      0,
      134,
      0,
      0,
      0,
      140,
      0,
      0,
      0,
      142,
      0,
      0,
      0,
      138,
      0,
      0,
      0,
      208,
      1,
      0,
      0,
      208,
      1,
      0,
      0,
      208,
      1,
      0,
      0,
      208,
      1,
      0,
      0,
      208,
      1,
      0,
      0,
      208,
      1,
      0,
      0,
      208,
      1,
      0,
      0,
      208,
      1,
      0,
      0,
      208,
      1,
      0,
      0,
      208,
      1,
      0,
      0,
      208,
      1,
      0,
      0,
      208,
      1,
      0,
      0,
      208,
      1,
      0,
      0,
      208,
      1,
      0,
      0,
      208,
      1,
      0,
      0,
      208,
      1,
      0,
      0,
      140,
      1,
      0,
      0,
      142,
      1,
      0,
      0,
      140,
      1,
      0,
      0,
      144,
      1,
      0,
      0,
      132,
      1,
      0,
      0,
      134,
      1,
      0,
      0,
      136,
      1,
      0,
      0,
      138,
      1,
      0,
      0,
      26,
      1,
      0,
      0,
      130,
      1,
      0,
      0,
      166,
      1,
      0,
      0,
      168,
      1,
      0,
      0,
      170,
      1,
      0,
      0,
      160,
      1,
      0,
      0,
      162,
      1,
      0,
      0,
      164,
      1,
      0,
      0,
      226,
      0,
      0,
      0,
      224,
      0,
      0,
      0,
      224,
      0,
      0,
      0,
      224,
      0,
      0,
      0,
      224,
      0,
      0,
      0,
      224,
      0,
      0,
      0,
      224,
      0,
      0,
      0,
      224,
      0,
      0,
      0,
      222,
      0,
      0,
      0,
      220,
      0,
      0,
      0,
      212,
      0,
      0,
      0,
      210,
      0,
      0,
      0,
      198,
      1,
      0,
      0,
      88,
      1,
      0,
      0,
      208,
      0,
      0,
      0,
      206,
      0,
      0,
      0,
      66,
      1,
      0,
      0,
      64,
      1,
      0,
      0,
      62,
      1,
      0,
      0,
      60,
      1,
      0,
      0,
      58,
      1,
      0,
      0,
      56,
      1,
      0,
      0,
      54,
      1,
      0,
      0,
      74,
      1,
      0,
      0,
      70,
      1,
      0,
      0,
      68,
      1,
      0,
      0,
      192,
      0,
      0,
      0,
      190,
      0,
      0,
      0,
      40,
      1,
      0,
      0,
      38,
      1,
      0,
      0,
      188,
      0,
      0,
      0,
      34,
      1,
      0,
      0,
      216,
      0,
      0,
      0,
      216,
      0,
      0,
      0,
      216,
      0,
      0,
      0,
      216,
      0,
      0,
      0,
      216,
      0,
      0,
      0,
      216,
      0,
      0,
      0,
      216,
      0,
      0,
      0,
      216,
      0,
      0,
      0,
      214,
      0,
      0,
      0,
      214,
      0,
      0,
      0,
      214,
      0,
      0,
      0,
      214,
      0,
      0,
      0,
      214,
      0,
      0,
      0,
      214,
      0,
      0,
      0,
      214,
      0,
      0,
      0,
      214,
      0,
      0,
      0,
      80,
      0,
      0,
      0,
      78,
      0,
      0,
      0,
      84,
      0,
      0,
      0,
      82,
      0,
      0,
      0,
      88,
      0,
      0,
      0,
      86,
      0,
      0,
      0,
      92,
      0,
      0,
      0,
      90,
      0,
      0,
      0,
      96,
      0,
      0,
      0,
      94,
      0,
      0,
      0,
      62,
      0,
      0,
      0,
      66,
      0,
      0,
      0,
      64,
      0,
      0,
      0,
      70,
      0,
      0,
      0,
      68,
      0,
      0,
      0,
      72,
      0,
      0,
      0,
      4,
      0,
      0,
      0,
      6,
      0,
      0,
      0,
      8,
      0,
      0,
      0,
      10,
      0,
      0,
      0,
      12,
      0,
      0,
      0,
      176,
      0,
      0,
      0,
      176,
      0,
      0,
      0,
      14,
      0,
      0,
      0,
      176,
      0,
      0,
      0,
      176,
      0,
      0,
      0,
      176,
      0,
      0,
      0,
      176,
      0,
      0,
      0,
      176,
      0,
      0,
      0,
      176,
      0,
      0,
      0,
      176,
      0,
      0,
      0,
      176,
      0,
      0,
      0,
      112,
      1,
      0,
      0,
      112,
      1,
      0,
      0,
      112,
      1,
      0,
      0,
      112,
      1,
      0,
      0,
      120,
      1,
      0,
      0,
      118,
      1,
      0,
      0,
      116,
      1,
      0,
      0,
      114,
      1,
      0,
      0,
      110,
      1,
      0,
      0,
      108,
      1,
      0,
      0,
      96,
      1,
      0,
      0,
      94,
      1,
      0,
      0,
      92,
      1,
      0,
      0,
      102,
      1,
      0,
      0,
      100,
      1,
      0,
      0,
      98,
      1,
      0,
      0,
      36,
      1,
      0,
      0,
      176,
      0,
      0,
      0,
      32,
      1,
      0,
      0,
      186,
      0,
      0,
      0,
      44,
      1,
      0,
      0,
      46,
      1,
      0,
      0,
      244,
      0,
      0,
      0,
      42,
      1,
      0,
      0,
      48,
      1,
      0,
      0,
      48,
      1,
      0,
      0,
      48,
      1,
      0,
      0,
      48,
      1,
      0,
      0,
      48,
      1,
      0,
      0,
      48,
      1,
      0,
      0,
      82,
      1,
      0,
      0,
      80,
      1,
      0,
      0,
      0,
      128,
      2,
      0,
      40,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      8,
      0,
      0,
      0,
      0,
      2,
      0,
      0,
      2,
      0,
      0,
      0,
      0,
      208,
      2,
      0,
      40,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      9,
      0,
      0,
      0,
      0,
      2,
      0,
      0,
      2,
      0,
      0,
      0,
      0,
      0,
      5,
      0,
      40,
      0,
      0,
      0,
      2,
      0,
      0,
      0,
      8,
      0,
      0,
      0,
      0,
      2,
      0,
      0,
      2,
      0,
      0,
      0,
      0,
      160,
      5,
      0,
      40,
      0,
      0,
      0,
      2,
      0,
      0,
      0,
      9,
      0,
      0,
      0,
      0,
      2,
      0,
      0,
      2,
      0,
      0,
      0,
      0,
      0,
      10,
      0,
      80,
      0,
      0,
      0,
      2,
      0,
      0,
      0,
      8,
      0,
      0,
      0,
      0,
      2,
      0,
      0,
      2,
      0,
      0,
      0,
      0,
      64,
      11,
      0,
      80,
      0,
      0,
      0,
      2,
      0,
      0,
      0,
      9,
      0,
      0,
      0,
      0,
      2,
      0,
      0,
      2,
      0,
      0,
      0,
      0,
      192,
      18,
      0,
      80,
      0,
      0,
      0,
      2,
      0,
      0,
      0,
      15,
      0,
      0,
      0,
      0,
      2,
      0,
      0,
      2,
      128,
      0,
      0,
      0,
      128,
      22,
      0,
      80,
      0,
      0,
      0,
      2,
      0,
      0,
      0,
      18,
      0,
      0,
      0,
      0,
      2,
      0,
      0,
      2,
      128,
      0,
      0,
      0,
      0,
      45,
      0,
      80,
      0,
      0,
      0,
      2,
      0,
      0,
      0,
      36,
      0,
      0,
      0,
      0,
      2,
      0,
      0,
      2,
      128,
      0,
      0,
      0,
      64,
      19,
      0,
      77,
      0,
      0,
      0,
      2,
      0,
      0,
      0,
      8,
      0,
      0,
      0,
      0,
      4,
      0,
      0,
      2,
      128,
      0,
      0,
      0,
      233,
      3,
      0,
      77,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      26,
      0,
      0,
      0,
      128,
      0,
      0,
      0,
      1,
      128,
      0,
      0,
      0,
      210,
      7,
      0,
      77,
      0,
      0,
      0,
      2,
      0,
      0,
      0,
      26,
      0,
      0,
      0,
      128,
      0,
      0,
      0,
      1,
      128,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      112,
      158,
      0,
      0,
      120,
      157,
      0,
      0,
      232,
      156,
      0,
      0,
      96,
      156,
      0,
      0,
      200,
      173,
      0,
      0,
      128,
      136,
      0,
      0,
      0,
      135,
      0,
      0,
      8,
      134,
      0,
      0,
      16,
      133,
      0,
      0,
      0,
      0,
      0,
      0,
      120,
      123,
      0,
      0,
      200,
      122,
      0,
      0,
      80,
      122,
      0,
      0,
      192,
      121,
      0,
      0,
      104,
      120,
      0,
      0,
      240,
      118,
      0,
      0,
      88,
      118,
      0,
      0,
      152,
      117,
      0,
      0,
      192,
      116,
      0,
      0,
      32,
      116,
      0,
      0,
      160,
      115,
      0,
      0,
      48,
      124,
      0,
      0,
      240,
      114,
      0,
      0,
      200,
      123,
      0,
      0,
      80,
      125,
      0,
      0,
      168,
      124,
      0,
      0,
      72,
      114,
      0,
      0,
      192,
      113,
      0,
      0,
      96,
      112,
      0,
      0,
      216,
      110,
      0,
      0,
      96,
      110,
      0,
      0,
      200,
      109,
      0,
      0,
      0,
      0,
      0,
      0,
      232,
      131,
      0,
      0,
      0,
      0,
      0,
      0,
      120,
      130,
      0,
      0,
      0,
      0,
      0,
      0,
      48,
      128,
      0,
      0,
      0,
      0,
      0,
      0,
      48,
      126,
      0,
      0,
      0,
      0,
      0,
      0,
      80,
      125,
      0,
      0,
      0,
      0,
      0,
      0,
      168,
      124,
      0,
      0,
      2,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      48,
      124,
      0,
      0,
      1,
      0,
      0,
      0,
      232,
      131,
      0,
      0,
      1,
      0,
      0,
      0,
      120,
      130,
      0,
      0,
      1,
      0,
      0,
      0,
      48,
      128,
      0,
      0,
      1,
      0,
      0,
      0,
      48,
      126,
      0,
      0,
      1,
      0,
      0,
      0,
      80,
      125,
      0,
      0,
      1,
      0,
      0,
      0,
      168,
      124,
      0,
      0,
      1,
      0,
      0,
      0,
      200,
      123,
      0,
      0,
      1,
      0,
      0,
      0,
      48,
      124,
      0,
      0,
      2,
      0,
      0,
      0,
      232,
      131,
      0,
      0,
      2,
      0,
      0,
      0,
      120,
      130,
      0,
      0,
      2,
      0,
      0,
      0,
      48,
      128,
      0,
      0,
      2,
      0,
      0,
      0,
      48,
      126,
      0,
      0,
      2,
      0,
      0,
      0,
      80,
      125,
      0,
      0,
      2,
      0,
      0,
      0,
      168,
      124,
      0,
      0,
      2,
      0,
      0,
      0,
      200,
      123,
      0,
      0,
      2,
      0,
      0,
      0,
      48,
      124,
      0,
      0,
      16,
      98,
      0,
      0,
      192,
      97,
      0,
      0,
      72,
      97,
      0,
      0,
      16,
      97,
      0,
      0,
      40,
      96,
      0,
      0,
      216,
      94,
      0,
      0,
      248,
      93,
      0,
      0,
      152,
      93,
      0,
      0,
      48,
      93,
      0,
      0,
      168,
      92,
      0,
      0,
      48,
      92,
      0,
      0,
      0,
      92,
      0,
      0,
      200,
      153,
      0,
      0,
      112,
      153,
      0,
      0,
      240,
      152,
      0,
      0,
      88,
      152,
      0,
      0,
      128,
      151,
      0,
      0,
      48,
      151,
      0,
      0,
      224,
      150,
      0,
      0,
      88,
      150,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      48,
      150,
      0,
      0,
      16,
      150,
      0,
      0,
      216,
      149,
      0,
      0,
      88,
      149,
      0,
      0,
      248,
      148,
      0,
      0,
      112,
      148,
      0,
      0,
      184,
      147,
      0,
      0,
      72,
      147,
      0,
      0,
      8,
      147,
      0,
      0,
      144,
      146,
      0,
      0,
      88,
      146,
      0,
      0,
      32,
      146,
      0,
      0,
      224,
      145,
      0,
      0,
      144,
      145,
      0,
      0,
      48,
      145,
      0,
      0,
      240,
      144,
      0,
      0,
      31,
      6,
      0,
      0,
      9,
      0,
      0,
      0,
      94,
      0,
      0,
      0,
      31,
      2,
      0,
      0,
      9,
      0,
      0,
      0,
      14,
      0,
      0,
      0,
      191,
      10,
      0,
      0,
      2,
      0,
      0,
      0,
      166,
      0,
      0,
      0,
      63,
      5,
      0,
      0,
      9,
      0,
      0,
      0,
      100,
      0,
      0,
      0,
      191,
      13,
      0,
      0,
      6,
      0,
      0,
      0,
      176,
      0,
      0,
      0,
      255,
      7,
      0,
      0,
      2,
      0,
      0,
      0,
      120,
      0,
      0,
      0,
      255,
      15,
      0,
      0,
      3,
      0,
      0,
      0,
      194,
      0,
      0,
      0,
      255,
      8,
      0,
      0,
      1,
      0,
      0,
      0,
      34,
      0,
      0,
      0,
      255,
      4,
      0,
      0,
      2,
      0,
      0,
      0,
      164,
      0,
      0,
      0,
      255,
      3,
      0,
      0,
      3,
      0,
      0,
      0,
      108,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      48,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      170,
      0,
      170,
      0,
      0,
      170,
      170,
      170,
      0,
      0,
      170,
      0,
      170,
      170,
      85,
      0,
      170,
      170,
      170,
      85,
      85,
      85,
      85,
      85,
      255,
      85,
      255,
      85,
      85,
      255,
      255,
      255,
      85,
      85,
      255,
      85,
      255,
      255,
      255,
      85,
      255,
      255,
      255,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      126,
      129,
      165,
      129,
      189,
      153,
      129,
      126,
      126,
      255,
      219,
      255,
      195,
      231,
      255,
      126,
      108,
      254,
      254,
      254,
      124,
      56,
      16,
      0,
      16,
      56,
      124,
      254,
      124,
      56,
      16,
      0,
      56,
      124,
      56,
      254,
      254,
      214,
      16,
      56,
      16,
      16,
      56,
      124,
      254,
      124,
      16,
      56,
      0,
      0,
      24,
      60,
      60,
      24,
      0,
      0,
      255,
      255,
      231,
      195,
      195,
      231,
      255,
      255,
      0,
      60,
      102,
      66,
      66,
      102,
      60,
      0,
      255,
      195,
      153,
      189,
      189,
      153,
      195,
      255,
      15,
      3,
      5,
      125,
      132,
      132,
      132,
      120,
      60,
      66,
      66,
      66,
      60,
      24,
      126,
      24,
      63,
      33,
      63,
      32,
      32,
      96,
      224,
      192,
      63,
      33,
      63,
      33,
      35,
      103,
      230,
      192,
      24,
      219,
      60,
      231,
      231,
      60,
      219,
      24,
      128,
      224,
      248,
      254,
      248,
      224,
      128,
      0,
      2,
      14,
      62,
      254,
      62,
      14,
      2,
      0,
      24,
      60,
      126,
      24,
      24,
      126,
      60,
      24,
      36,
      36,
      36,
      36,
      36,
      0,
      36,
      0,
      127,
      146,
      146,
      114,
      18,
      18,
      18,
      0,
      62,
      99,
      56,
      68,
      68,
      56,
      204,
      120,
      0,
      0,
      0,
      0,
      126,
      126,
      126,
      0,
      24,
      60,
      126,
      24,
      126,
      60,
      24,
      255,
      16,
      56,
      124,
      84,
      16,
      16,
      16,
      0,
      16,
      16,
      16,
      84,
      124,
      56,
      16,
      0,
      0,
      24,
      12,
      254,
      12,
      24,
      0,
      0,
      0,
      48,
      96,
      254,
      96,
      48,
      0,
      0,
      0,
      0,
      64,
      64,
      64,
      126,
      0,
      0,
      0,
      36,
      102,
      255,
      102,
      36,
      0,
      0,
      0,
      16,
      56,
      124,
      254,
      254,
      0,
      0,
      0,
      254,
      254,
      124,
      56,
      16,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      16,
      56,
      56,
      16,
      16,
      0,
      16,
      0,
      36,
      36,
      36,
      0,
      0,
      0,
      0,
      0,
      36,
      36,
      126,
      36,
      126,
      36,
      36,
      0,
      24,
      62,
      64,
      60,
      2,
      124,
      24,
      0,
      0,
      98,
      100,
      8,
      16,
      38,
      70,
      0,
      48,
      72,
      48,
      86,
      136,
      136,
      118,
      0,
      16,
      16,
      32,
      0,
      0,
      0,
      0,
      0,
      16,
      32,
      64,
      64,
      64,
      32,
      16,
      0,
      32,
      16,
      8,
      8,
      8,
      16,
      32,
      0,
      0,
      68,
      56,
      254,
      56,
      68,
      0,
      0,
      0,
      16,
      16,
      124,
      16,
      16,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      16,
      16,
      32,
      0,
      0,
      0,
      126,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      16,
      16,
      0,
      0,
      2,
      4,
      8,
      16,
      32,
      64,
      0,
      60,
      66,
      70,
      74,
      82,
      98,
      60,
      0,
      16,
      48,
      80,
      16,
      16,
      16,
      124,
      0,
      60,
      66,
      2,
      12,
      48,
      66,
      126,
      0,
      60,
      66,
      2,
      28,
      2,
      66,
      60,
      0,
      8,
      24,
      40,
      72,
      254,
      8,
      28,
      0,
      126,
      64,
      124,
      2,
      2,
      66,
      60,
      0,
      28,
      32,
      64,
      124,
      66,
      66,
      60,
      0,
      126,
      66,
      4,
      8,
      16,
      16,
      16,
      0,
      60,
      66,
      66,
      60,
      66,
      66,
      60,
      0,
      60,
      66,
      66,
      62,
      2,
      4,
      56,
      0,
      0,
      16,
      16,
      0,
      0,
      16,
      16,
      0,
      0,
      16,
      16,
      0,
      0,
      16,
      16,
      32,
      8,
      16,
      32,
      64,
      32,
      16,
      8,
      0,
      0,
      0,
      126,
      0,
      0,
      126,
      0,
      0,
      16,
      8,
      4,
      2,
      4,
      8,
      16,
      0,
      60,
      66,
      2,
      4,
      8,
      0,
      8,
      0,
      60,
      66,
      94,
      82,
      94,
      64,
      60,
      0,
      24,
      36,
      66,
      66,
      126,
      66,
      66,
      0,
      124,
      34,
      34,
      60,
      34,
      34,
      124,
      0,
      28,
      34,
      64,
      64,
      64,
      34,
      28,
      0,
      120,
      36,
      34,
      34,
      34,
      36,
      120,
      0,
      126,
      34,
      40,
      56,
      40,
      34,
      126,
      0,
      126,
      34,
      40,
      56,
      40,
      32,
      112,
      0,
      28,
      34,
      64,
      64,
      78,
      34,
      30,
      0,
      66,
      66,
      66,
      126,
      66,
      66,
      66,
      0,
      56,
      16,
      16,
      16,
      16,
      16,
      56,
      0,
      14,
      4,
      4,
      4,
      68,
      68,
      56,
      0,
      98,
      36,
      40,
      48,
      40,
      36,
      99,
      0,
      112,
      32,
      32,
      32,
      32,
      34,
      126,
      0,
      99,
      85,
      73,
      65,
      65,
      65,
      65,
      0,
      98,
      82,
      74,
      70,
      66,
      66,
      66,
      0,
      24,
      36,
      66,
      66,
      66,
      36,
      24,
      0,
      124,
      34,
      34,
      60,
      32,
      32,
      112,
      0,
      60,
      66,
      66,
      66,
      74,
      60,
      3,
      0,
      124,
      34,
      34,
      60,
      40,
      36,
      114,
      0,
      60,
      66,
      64,
      60,
      2,
      66,
      60,
      0,
      127,
      73,
      8,
      8,
      8,
      8,
      28,
      0,
      66,
      66,
      66,
      66,
      66,
      66,
      60,
      0,
      65,
      65,
      65,
      65,
      34,
      20,
      8,
      0,
      65,
      65,
      65,
      73,
      73,
      73,
      54,
      0,
      65,
      34,
      20,
      8,
      20,
      34,
      65,
      0,
      65,
      34,
      20,
      8,
      8,
      8,
      28,
      0,
      127,
      66,
      4,
      8,
      16,
      33,
      127,
      0,
      120,
      64,
      64,
      64,
      64,
      64,
      120,
      0,
      128,
      64,
      32,
      16,
      8,
      4,
      2,
      0,
      120,
      8,
      8,
      8,
      8,
      8,
      120,
      0,
      16,
      40,
      68,
      130,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      255,
      16,
      16,
      8,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      60,
      2,
      62,
      66,
      63,
      0,
      96,
      32,
      32,
      46,
      49,
      49,
      46,
      0,
      0,
      0,
      60,
      66,
      64,
      66,
      60,
      0,
      6,
      2,
      2,
      58,
      70,
      70,
      59,
      0,
      0,
      0,
      60,
      66,
      126,
      64,
      60,
      0,
      12,
      18,
      16,
      56,
      16,
      16,
      56,
      0,
      0,
      0,
      61,
      66,
      66,
      62,
      2,
      124,
      96,
      32,
      44,
      50,
      34,
      34,
      98,
      0,
      16,
      0,
      48,
      16,
      16,
      16,
      56,
      0,
      2,
      0,
      6,
      2,
      2,
      66,
      66,
      60,
      96,
      32,
      36,
      40,
      48,
      40,
      38,
      0,
      48,
      16,
      16,
      16,
      16,
      16,
      56,
      0,
      0,
      0,
      118,
      73,
      73,
      73,
      73,
      0,
      0,
      0,
      92,
      98,
      66,
      66,
      66,
      0,
      0,
      0,
      60,
      66,
      66,
      66,
      60,
      0,
      0,
      0,
      108,
      50,
      50,
      44,
      32,
      112,
      0,
      0,
      54,
      76,
      76,
      52,
      4,
      14,
      0,
      0,
      108,
      50,
      34,
      32,
      112,
      0,
      0,
      0,
      62,
      64,
      60,
      2,
      124,
      0,
      16,
      16,
      124,
      16,
      16,
      18,
      12,
      0,
      0,
      0,
      66,
      66,
      66,
      70,
      58,
      0,
      0,
      0,
      65,
      65,
      34,
      20,
      8,
      0,
      0,
      0,
      65,
      73,
      73,
      73,
      54,
      0,
      0,
      0,
      68,
      40,
      16,
      40,
      68,
      0,
      0,
      0,
      66,
      66,
      66,
      62,
      2,
      124,
      0,
      0,
      124,
      8,
      16,
      32,
      124,
      0,
      12,
      16,
      16,
      96,
      16,
      16,
      12,
      0,
      16,
      16,
      16,
      0,
      16,
      16,
      16,
      0,
      48,
      8,
      8,
      6,
      8,
      8,
      48,
      0,
      50,
      76,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      8,
      20,
      34,
      65,
      65,
      127,
      0,
      60,
      66,
      64,
      66,
      60,
      12,
      2,
      60,
      0,
      68,
      0,
      68,
      68,
      68,
      62,
      0,
      12,
      0,
      60,
      66,
      126,
      64,
      60,
      0,
      60,
      66,
      56,
      4,
      60,
      68,
      62,
      0,
      66,
      0,
      56,
      4,
      60,
      68,
      62,
      0,
      48,
      0,
      56,
      4,
      60,
      68,
      62,
      0,
      16,
      0,
      56,
      4,
      60,
      68,
      62,
      0,
      0,
      0,
      60,
      64,
      64,
      60,
      6,
      28,
      60,
      66,
      60,
      66,
      126,
      64,
      60,
      0,
      66,
      0,
      60,
      66,
      126,
      64,
      60,
      0,
      48,
      0,
      60,
      66,
      126,
      64,
      60,
      0,
      36,
      0,
      24,
      8,
      8,
      8,
      28,
      0,
      124,
      130,
      48,
      16,
      16,
      16,
      56,
      0,
      48,
      0,
      24,
      8,
      8,
      8,
      28,
      0,
      66,
      24,
      36,
      66,
      126,
      66,
      66,
      0,
      24,
      24,
      0,
      60,
      66,
      126,
      66,
      0,
      12,
      0,
      124,
      32,
      56,
      32,
      124,
      0,
      0,
      0,
      51,
      12,
      63,
      68,
      59,
      0,
      31,
      36,
      68,
      127,
      68,
      68,
      71,
      0,
      24,
      36,
      0,
      60,
      66,
      66,
      60,
      0,
      0,
      66,
      0,
      60,
      66,
      66,
      60,
      0,
      32,
      16,
      0,
      60,
      66,
      66,
      60,
      0,
      24,
      36,
      0,
      66,
      66,
      66,
      60,
      0,
      32,
      16,
      0,
      66,
      66,
      66,
      60,
      0,
      0,
      66,
      0,
      66,
      66,
      62,
      2,
      60,
      66,
      24,
      36,
      66,
      66,
      36,
      24,
      0,
      66,
      0,
      66,
      66,
      66,
      66,
      60,
      0,
      8,
      8,
      62,
      64,
      64,
      62,
      8,
      8,
      24,
      36,
      32,
      112,
      32,
      66,
      124,
      0,
      68,
      40,
      124,
      16,
      124,
      16,
      16,
      0,
      248,
      76,
      120,
      68,
      79,
      68,
      69,
      230,
      28,
      18,
      16,
      124,
      16,
      16,
      144,
      96,
      12,
      0,
      56,
      4,
      60,
      68,
      62,
      0,
      12,
      0,
      24,
      8,
      8,
      8,
      28,
      0,
      4,
      8,
      0,
      60,
      66,
      66,
      60,
      0,
      0,
      4,
      8,
      66,
      66,
      66,
      60,
      0,
      50,
      76,
      0,
      124,
      66,
      66,
      66,
      0,
      52,
      76,
      0,
      98,
      82,
      74,
      70,
      0,
      60,
      68,
      68,
      62,
      0,
      126,
      0,
      0,
      56,
      68,
      68,
      56,
      0,
      124,
      0,
      0,
      16,
      0,
      16,
      32,
      64,
      66,
      60,
      0,
      0,
      0,
      0,
      126,
      64,
      64,
      0,
      0,
      0,
      0,
      0,
      126,
      2,
      2,
      0,
      0,
      66,
      196,
      72,
      246,
      41,
      67,
      140,
      31,
      66,
      196,
      74,
      246,
      42,
      95,
      130,
      2,
      0,
      16,
      0,
      16,
      16,
      16,
      16,
      0,
      0,
      18,
      36,
      72,
      36,
      18,
      0,
      0,
      0,
      72,
      36,
      18,
      36,
      72,
      0,
      0,
      34,
      136,
      34,
      136,
      34,
      136,
      34,
      136,
      85,
      170,
      85,
      170,
      85,
      170,
      85,
      170,
      219,
      119,
      219,
      238,
      219,
      119,
      219,
      238,
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      240,
      16,
      16,
      16,
      16,
      16,
      240,
      16,
      240,
      16,
      16,
      16,
      20,
      20,
      20,
      20,
      244,
      20,
      20,
      20,
      0,
      0,
      0,
      0,
      252,
      20,
      20,
      20,
      0,
      0,
      240,
      16,
      240,
      16,
      16,
      16,
      20,
      20,
      244,
      4,
      244,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      0,
      0,
      252,
      4,
      244,
      20,
      20,
      20,
      20,
      20,
      244,
      4,
      252,
      0,
      0,
      0,
      20,
      20,
      20,
      20,
      252,
      0,
      0,
      0,
      16,
      16,
      240,
      16,
      240,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      240,
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      31,
      0,
      0,
      0,
      16,
      16,
      16,
      16,
      255,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      255,
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      31,
      16,
      16,
      16,
      0,
      0,
      0,
      0,
      255,
      0,
      0,
      0,
      16,
      16,
      16,
      16,
      255,
      16,
      16,
      16,
      16,
      16,
      31,
      16,
      31,
      16,
      16,
      16,
      20,
      20,
      20,
      20,
      23,
      20,
      20,
      20,
      20,
      20,
      23,
      16,
      31,
      0,
      0,
      0,
      0,
      0,
      31,
      16,
      23,
      20,
      20,
      20,
      20,
      20,
      247,
      0,
      255,
      0,
      0,
      0,
      0,
      0,
      255,
      0,
      247,
      20,
      20,
      20,
      20,
      20,
      23,
      16,
      23,
      20,
      20,
      20,
      0,
      0,
      255,
      0,
      255,
      0,
      0,
      0,
      20,
      20,
      247,
      0,
      247,
      20,
      20,
      20,
      16,
      16,
      255,
      0,
      255,
      0,
      0,
      0,
      20,
      20,
      20,
      20,
      255,
      0,
      0,
      0,
      0,
      0,
      255,
      0,
      255,
      16,
      16,
      16,
      0,
      0,
      0,
      0,
      255,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      31,
      0,
      0,
      0,
      16,
      16,
      31,
      16,
      31,
      0,
      0,
      0,
      0,
      0,
      31,
      16,
      31,
      16,
      16,
      16,
      0,
      0,
      0,
      0,
      31,
      20,
      20,
      20,
      20,
      20,
      20,
      20,
      255,
      20,
      20,
      20,
      16,
      16,
      255,
      16,
      255,
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      240,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      31,
      16,
      16,
      16,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      0,
      0,
      0,
      0,
      255,
      255,
      255,
      255,
      240,
      240,
      240,
      240,
      240,
      240,
      240,
      240,
      15,
      15,
      15,
      15,
      15,
      15,
      15,
      15,
      255,
      255,
      255,
      255,
      0,
      0,
      0,
      0,
      0,
      0,
      49,
      74,
      68,
      74,
      49,
      0,
      0,
      60,
      66,
      124,
      66,
      124,
      64,
      64,
      0,
      126,
      66,
      64,
      64,
      64,
      64,
      0,
      0,
      63,
      84,
      20,
      20,
      20,
      20,
      0,
      126,
      66,
      32,
      24,
      32,
      66,
      126,
      0,
      0,
      0,
      62,
      72,
      72,
      72,
      48,
      0,
      0,
      68,
      68,
      68,
      122,
      64,
      64,
      128,
      0,
      51,
      76,
      8,
      8,
      8,
      8,
      0,
      124,
      16,
      56,
      68,
      68,
      56,
      16,
      124,
      24,
      36,
      66,
      126,
      66,
      36,
      24,
      0,
      24,
      36,
      66,
      66,
      36,
      36,
      102,
      0,
      28,
      32,
      24,
      60,
      66,
      66,
      60,
      0,
      0,
      98,
      149,
      137,
      149,
      98,
      0,
      0,
      2,
      4,
      60,
      74,
      82,
      60,
      64,
      128,
      12,
      16,
      32,
      60,
      32,
      16,
      12,
      0,
      60,
      66,
      66,
      66,
      66,
      66,
      66,
      0,
      0,
      126,
      0,
      126,
      0,
      126,
      0,
      0,
      16,
      16,
      124,
      16,
      16,
      0,
      124,
      0,
      16,
      8,
      4,
      8,
      16,
      0,
      126,
      0,
      8,
      16,
      32,
      16,
      8,
      0,
      126,
      0,
      12,
      18,
      18,
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      144,
      144,
      96,
      24,
      24,
      0,
      126,
      0,
      24,
      24,
      0,
      0,
      50,
      76,
      0,
      50,
      76,
      0,
      0,
      48,
      72,
      72,
      48,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      24,
      24,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      24,
      0,
      0,
      0,
      15,
      8,
      8,
      8,
      8,
      200,
      40,
      24,
      120,
      68,
      68,
      68,
      68,
      0,
      0,
      0,
      48,
      72,
      16,
      32,
      120,
      0,
      0,
      0,
      0,
      0,
      60,
      60,
      60,
      60,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      126,
      129,
      165,
      129,
      189,
      153,
      129,
      126,
      126,
      255,
      219,
      255,
      195,
      231,
      255,
      126,
      108,
      254,
      254,
      254,
      124,
      56,
      16,
      0,
      16,
      56,
      124,
      254,
      124,
      56,
      16,
      0,
      56,
      124,
      56,
      254,
      254,
      214,
      16,
      56,
      16,
      16,
      56,
      124,
      254,
      124,
      16,
      56,
      0,
      0,
      24,
      60,
      60,
      24,
      0,
      0,
      255,
      255,
      231,
      195,
      195,
      231,
      255,
      255,
      0,
      60,
      102,
      66,
      66,
      102,
      60,
      0,
      255,
      195,
      153,
      189,
      189,
      153,
      195,
      255,
      15,
      7,
      15,
      125,
      204,
      204,
      204,
      120,
      60,
      102,
      102,
      102,
      60,
      24,
      126,
      24,
      63,
      51,
      63,
      48,
      48,
      112,
      240,
      224,
      127,
      99,
      127,
      99,
      99,
      103,
      230,
      192,
      24,
      219,
      60,
      231,
      231,
      60,
      219,
      24,
      128,
      224,
      248,
      254,
      248,
      224,
      128,
      0,
      2,
      14,
      62,
      254,
      62,
      14,
      2,
      0,
      24,
      60,
      126,
      24,
      24,
      126,
      60,
      24,
      102,
      102,
      102,
      102,
      102,
      0,
      102,
      0,
      127,
      219,
      219,
      123,
      27,
      27,
      27,
      0,
      62,
      99,
      56,
      108,
      108,
      56,
      204,
      120,
      0,
      0,
      0,
      0,
      126,
      126,
      126,
      0,
      24,
      60,
      126,
      24,
      126,
      60,
      24,
      255,
      24,
      60,
      126,
      24,
      24,
      24,
      24,
      0,
      24,
      24,
      24,
      24,
      126,
      60,
      24,
      0,
      0,
      24,
      12,
      254,
      12,
      24,
      0,
      0,
      0,
      48,
      96,
      254,
      96,
      48,
      0,
      0,
      0,
      0,
      192,
      192,
      192,
      254,
      0,
      0,
      0,
      36,
      102,
      255,
      102,
      36,
      0,
      0,
      0,
      24,
      60,
      126,
      255,
      255,
      0,
      0,
      0,
      255,
      255,
      126,
      60,
      24,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      48,
      120,
      120,
      48,
      48,
      0,
      48,
      0,
      108,
      108,
      108,
      0,
      0,
      0,
      0,
      0,
      108,
      108,
      254,
      108,
      254,
      108,
      108,
      0,
      48,
      124,
      192,
      120,
      12,
      248,
      48,
      0,
      0,
      198,
      204,
      24,
      48,
      102,
      198,
      0,
      56,
      108,
      56,
      118,
      220,
      204,
      118,
      0,
      96,
      96,
      192,
      0,
      0,
      0,
      0,
      0,
      24,
      48,
      96,
      96,
      96,
      48,
      24,
      0,
      96,
      48,
      24,
      24,
      24,
      48,
      96,
      0,
      0,
      102,
      60,
      255,
      60,
      102,
      0,
      0,
      0,
      48,
      48,
      252,
      48,
      48,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      48,
      48,
      96,
      0,
      0,
      0,
      252,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      48,
      48,
      0,
      6,
      12,
      24,
      48,
      96,
      192,
      128,
      0,
      124,
      198,
      206,
      222,
      246,
      230,
      124,
      0,
      48,
      112,
      48,
      48,
      48,
      48,
      252,
      0,
      120,
      204,
      12,
      56,
      96,
      204,
      252,
      0,
      120,
      204,
      12,
      56,
      12,
      204,
      120,
      0,
      28,
      60,
      108,
      204,
      254,
      12,
      30,
      0,
      252,
      192,
      248,
      12,
      12,
      204,
      120,
      0,
      56,
      96,
      192,
      248,
      204,
      204,
      120,
      0,
      252,
      204,
      12,
      24,
      48,
      48,
      48,
      0,
      120,
      204,
      204,
      120,
      204,
      204,
      120,
      0,
      120,
      204,
      204,
      124,
      12,
      24,
      112,
      0,
      0,
      48,
      48,
      0,
      0,
      48,
      48,
      0,
      0,
      48,
      48,
      0,
      0,
      48,
      48,
      96,
      24,
      48,
      96,
      192,
      96,
      48,
      24,
      0,
      0,
      0,
      252,
      0,
      0,
      252,
      0,
      0,
      96,
      48,
      24,
      12,
      24,
      48,
      96,
      0,
      120,
      204,
      12,
      24,
      48,
      0,
      48,
      0,
      124,
      198,
      222,
      222,
      222,
      192,
      120,
      0,
      48,
      120,
      204,
      204,
      252,
      204,
      204,
      0,
      252,
      102,
      102,
      124,
      102,
      102,
      252,
      0,
      60,
      102,
      192,
      192,
      192,
      102,
      60,
      0,
      248,
      108,
      102,
      102,
      102,
      108,
      248,
      0,
      254,
      98,
      104,
      120,
      104,
      98,
      254,
      0,
      254,
      98,
      104,
      120,
      104,
      96,
      240,
      0,
      60,
      102,
      192,
      192,
      206,
      102,
      62,
      0,
      204,
      204,
      204,
      252,
      204,
      204,
      204,
      0,
      120,
      48,
      48,
      48,
      48,
      48,
      120,
      0,
      30,
      12,
      12,
      12,
      204,
      204,
      120,
      0,
      230,
      102,
      108,
      120,
      108,
      102,
      230,
      0,
      240,
      96,
      96,
      96,
      98,
      102,
      254,
      0,
      198,
      238,
      254,
      254,
      214,
      198,
      198,
      0,
      198,
      230,
      246,
      222,
      206,
      198,
      198,
      0,
      56,
      108,
      198,
      198,
      198,
      108,
      56,
      0,
      252,
      102,
      102,
      124,
      96,
      96,
      240,
      0,
      120,
      204,
      204,
      204,
      220,
      120,
      28,
      0,
      252,
      102,
      102,
      124,
      108,
      102,
      230,
      0,
      120,
      204,
      96,
      48,
      24,
      204,
      120,
      0,
      252,
      180,
      48,
      48,
      48,
      48,
      120,
      0,
      204,
      204,
      204,
      204,
      204,
      204,
      252,
      0,
      204,
      204,
      204,
      204,
      204,
      120,
      48,
      0,
      198,
      198,
      198,
      214,
      254,
      238,
      198,
      0,
      198,
      198,
      108,
      56,
      56,
      108,
      198,
      0,
      204,
      204,
      204,
      120,
      48,
      48,
      120,
      0,
      254,
      198,
      140,
      24,
      50,
      102,
      254,
      0,
      120,
      96,
      96,
      96,
      96,
      96,
      120,
      0,
      192,
      96,
      48,
      24,
      12,
      6,
      2,
      0,
      120,
      24,
      24,
      24,
      24,
      24,
      120,
      0,
      16,
      56,
      108,
      198,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      255,
      48,
      48,
      24,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      120,
      12,
      124,
      204,
      118,
      0,
      224,
      96,
      96,
      124,
      102,
      102,
      220,
      0,
      0,
      0,
      120,
      204,
      192,
      204,
      120,
      0,
      28,
      12,
      12,
      124,
      204,
      204,
      118,
      0,
      0,
      0,
      120,
      204,
      252,
      192,
      120,
      0,
      56,
      108,
      96,
      240,
      96,
      96,
      240,
      0,
      0,
      0,
      118,
      204,
      204,
      124,
      12,
      248,
      224,
      96,
      108,
      118,
      102,
      102,
      230,
      0,
      48,
      0,
      112,
      48,
      48,
      48,
      120,
      0,
      12,
      0,
      12,
      12,
      12,
      204,
      204,
      120,
      224,
      96,
      102,
      108,
      120,
      108,
      230,
      0,
      112,
      48,
      48,
      48,
      48,
      48,
      120,
      0,
      0,
      0,
      204,
      254,
      254,
      214,
      198,
      0,
      0,
      0,
      248,
      204,
      204,
      204,
      204,
      0,
      0,
      0,
      120,
      204,
      204,
      204,
      120,
      0,
      0,
      0,
      220,
      102,
      102,
      124,
      96,
      240,
      0,
      0,
      118,
      204,
      204,
      124,
      12,
      30,
      0,
      0,
      220,
      118,
      102,
      96,
      240,
      0,
      0,
      0,
      124,
      192,
      120,
      12,
      248,
      0,
      16,
      48,
      124,
      48,
      48,
      52,
      24,
      0,
      0,
      0,
      204,
      204,
      204,
      204,
      118,
      0,
      0,
      0,
      204,
      204,
      204,
      120,
      48,
      0,
      0,
      0,
      198,
      214,
      254,
      254,
      108,
      0,
      0,
      0,
      198,
      108,
      56,
      108,
      198,
      0,
      0,
      0,
      204,
      204,
      204,
      124,
      12,
      248,
      0,
      0,
      252,
      152,
      48,
      100,
      252,
      0,
      28,
      48,
      48,
      224,
      48,
      48,
      28,
      0,
      24,
      24,
      24,
      0,
      24,
      24,
      24,
      0,
      224,
      48,
      48,
      28,
      48,
      48,
      224,
      0,
      118,
      220,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      16,
      56,
      108,
      198,
      198,
      254,
      0,
      120,
      204,
      192,
      204,
      120,
      24,
      12,
      120,
      0,
      204,
      0,
      204,
      204,
      204,
      126,
      0,
      28,
      0,
      120,
      204,
      252,
      192,
      120,
      0,
      126,
      195,
      60,
      6,
      62,
      102,
      63,
      0,
      204,
      0,
      120,
      12,
      124,
      204,
      126,
      0,
      224,
      0,
      120,
      12,
      124,
      204,
      126,
      0,
      48,
      48,
      120,
      12,
      124,
      204,
      126,
      0,
      0,
      0,
      120,
      192,
      192,
      120,
      12,
      56,
      126,
      195,
      60,
      102,
      126,
      96,
      60,
      0,
      204,
      0,
      120,
      204,
      252,
      192,
      120,
      0,
      224,
      0,
      120,
      204,
      252,
      192,
      120,
      0,
      204,
      0,
      112,
      48,
      48,
      48,
      120,
      0,
      124,
      198,
      56,
      24,
      24,
      24,
      60,
      0,
      224,
      0,
      112,
      48,
      48,
      48,
      120,
      0,
      198,
      56,
      108,
      198,
      254,
      198,
      198,
      0,
      48,
      48,
      0,
      120,
      204,
      252,
      204,
      0,
      28,
      0,
      252,
      96,
      120,
      96,
      252,
      0,
      0,
      0,
      127,
      12,
      127,
      204,
      127,
      0,
      62,
      108,
      204,
      254,
      204,
      204,
      206,
      0,
      120,
      204,
      0,
      120,
      204,
      204,
      120,
      0,
      0,
      204,
      0,
      120,
      204,
      204,
      120,
      0,
      0,
      224,
      0,
      120,
      204,
      204,
      120,
      0,
      120,
      204,
      0,
      204,
      204,
      204,
      126,
      0,
      0,
      224,
      0,
      204,
      204,
      204,
      126,
      0,
      0,
      204,
      0,
      204,
      204,
      124,
      12,
      248,
      195,
      24,
      60,
      102,
      102,
      60,
      24,
      0,
      204,
      0,
      204,
      204,
      204,
      204,
      120,
      0,
      24,
      24,
      126,
      192,
      192,
      126,
      24,
      24,
      56,
      108,
      100,
      240,
      96,
      230,
      252,
      0,
      204,
      204,
      120,
      252,
      48,
      252,
      48,
      48,
      248,
      204,
      204,
      250,
      198,
      207,
      198,
      199,
      14,
      27,
      24,
      60,
      24,
      24,
      216,
      112,
      28,
      0,
      120,
      12,
      124,
      204,
      126,
      0,
      56,
      0,
      112,
      48,
      48,
      48,
      120,
      0,
      0,
      28,
      0,
      120,
      204,
      204,
      120,
      0,
      0,
      28,
      0,
      204,
      204,
      204,
      126,
      0,
      0,
      248,
      0,
      248,
      204,
      204,
      204,
      0,
      252,
      0,
      204,
      236,
      252,
      220,
      204,
      0,
      60,
      108,
      108,
      62,
      0,
      126,
      0,
      0,
      56,
      108,
      108,
      56,
      0,
      124,
      0,
      0,
      48,
      0,
      48,
      96,
      192,
      204,
      120,
      0,
      0,
      0,
      0,
      252,
      192,
      192,
      0,
      0,
      0,
      0,
      0,
      252,
      12,
      12,
      0,
      0,
      195,
      198,
      204,
      222,
      51,
      102,
      204,
      15,
      195,
      198,
      204,
      219,
      55,
      111,
      207,
      3,
      24,
      24,
      0,
      24,
      24,
      24,
      24,
      0,
      0,
      51,
      102,
      204,
      102,
      51,
      0,
      0,
      0,
      204,
      102,
      51,
      102,
      204,
      0,
      0,
      34,
      136,
      34,
      136,
      34,
      136,
      34,
      136,
      85,
      170,
      85,
      170,
      85,
      170,
      85,
      170,
      219,
      119,
      219,
      238,
      219,
      119,
      219,
      238,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      248,
      24,
      24,
      24,
      24,
      24,
      248,
      24,
      248,
      24,
      24,
      24,
      54,
      54,
      54,
      54,
      246,
      54,
      54,
      54,
      0,
      0,
      0,
      0,
      254,
      54,
      54,
      54,
      0,
      0,
      248,
      24,
      248,
      24,
      24,
      24,
      54,
      54,
      246,
      6,
      246,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      0,
      0,
      254,
      6,
      246,
      54,
      54,
      54,
      54,
      54,
      246,
      6,
      254,
      0,
      0,
      0,
      54,
      54,
      54,
      54,
      254,
      0,
      0,
      0,
      24,
      24,
      248,
      24,
      248,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      248,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      31,
      0,
      0,
      0,
      24,
      24,
      24,
      24,
      255,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      255,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      31,
      24,
      24,
      24,
      0,
      0,
      0,
      0,
      255,
      0,
      0,
      0,
      24,
      24,
      24,
      24,
      255,
      24,
      24,
      24,
      24,
      24,
      31,
      24,
      31,
      24,
      24,
      24,
      54,
      54,
      54,
      54,
      55,
      54,
      54,
      54,
      54,
      54,
      55,
      48,
      63,
      0,
      0,
      0,
      0,
      0,
      63,
      48,
      55,
      54,
      54,
      54,
      54,
      54,
      247,
      0,
      255,
      0,
      0,
      0,
      0,
      0,
      255,
      0,
      247,
      54,
      54,
      54,
      54,
      54,
      55,
      48,
      55,
      54,
      54,
      54,
      0,
      0,
      255,
      0,
      255,
      0,
      0,
      0,
      54,
      54,
      247,
      0,
      247,
      54,
      54,
      54,
      24,
      24,
      255,
      0,
      255,
      0,
      0,
      0,
      54,
      54,
      54,
      54,
      255,
      0,
      0,
      0,
      0,
      0,
      255,
      0,
      255,
      24,
      24,
      24,
      0,
      0,
      0,
      0,
      255,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      63,
      0,
      0,
      0,
      24,
      24,
      31,
      24,
      31,
      0,
      0,
      0,
      0,
      0,
      31,
      24,
      31,
      24,
      24,
      24,
      0,
      0,
      0,
      0,
      63,
      54,
      54,
      54,
      54,
      54,
      54,
      54,
      255,
      54,
      54,
      54,
      24,
      24,
      255,
      24,
      255,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      248,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      31,
      24,
      24,
      24,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      0,
      0,
      0,
      0,
      255,
      255,
      255,
      255,
      240,
      240,
      240,
      240,
      240,
      240,
      240,
      240,
      15,
      15,
      15,
      15,
      15,
      15,
      15,
      15,
      255,
      255,
      255,
      255,
      0,
      0,
      0,
      0,
      0,
      0,
      118,
      220,
      200,
      220,
      118,
      0,
      0,
      120,
      204,
      248,
      204,
      248,
      192,
      192,
      0,
      252,
      204,
      192,
      192,
      192,
      192,
      0,
      0,
      254,
      108,
      108,
      108,
      108,
      108,
      0,
      252,
      204,
      96,
      48,
      96,
      204,
      252,
      0,
      0,
      0,
      126,
      216,
      216,
      216,
      112,
      0,
      0,
      102,
      102,
      102,
      102,
      124,
      96,
      192,
      0,
      118,
      220,
      24,
      24,
      24,
      24,
      0,
      252,
      48,
      120,
      204,
      204,
      120,
      48,
      252,
      56,
      108,
      198,
      254,
      198,
      108,
      56,
      0,
      56,
      108,
      198,
      198,
      108,
      108,
      238,
      0,
      28,
      48,
      24,
      124,
      204,
      204,
      120,
      0,
      0,
      0,
      126,
      219,
      219,
      126,
      0,
      0,
    ])
    .concat([
      6,
      12,
      126,
      219,
      219,
      126,
      96,
      192,
      56,
      96,
      192,
      248,
      192,
      96,
      56,
      0,
      120,
      204,
      204,
      204,
      204,
      204,
      204,
      0,
      0,
      252,
      0,
      252,
      0,
      252,
      0,
      0,
      48,
      48,
      252,
      48,
      48,
      0,
      252,
      0,
      96,
      48,
      24,
      48,
      96,
      0,
      252,
      0,
      24,
      48,
      96,
      48,
      24,
      0,
      252,
      0,
      14,
      27,
      27,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      216,
      216,
      112,
      48,
      48,
      0,
      252,
      0,
      48,
      48,
      0,
      0,
      118,
      220,
      0,
      118,
      220,
      0,
      0,
      56,
      108,
      108,
      56,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      24,
      24,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      24,
      0,
      0,
      0,
      15,
      12,
      12,
      12,
      236,
      108,
      60,
      28,
      120,
      108,
      108,
      108,
      108,
      0,
      0,
      0,
      112,
      24,
      48,
      96,
      120,
      0,
      0,
      0,
      0,
      0,
      60,
      60,
      60,
      60,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      99,
      111,
      108,
      111,
      114,
      95,
      110,
      111,
      114,
      109,
      97,
      108,
      0,
      0,
      0,
      0,
      103,
      114,
      101,
      101,
      110,
      0,
      0,
      0,
      77,
      79,
      86,
      83,
      87,
      0,
      0,
      0,
      105,
      111,
      0,
      0,
      0,
      0,
      0,
      0,
      77,
      79,
      85,
      84,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      83,
      84,
      48,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      83,
      84,
      49,
      61,
      37,
      48,
      50,
      88,
      10,
      0,
      0,
      42,
      42,
      42,
      32,
      111,
      112,
      101,
      110,
      105,
      110,
      103,
      32,
      102,
      105,
      108,
      101,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      0,
      83,
      116,
      97,
      114,
      116,
      82,
      105,
      103,
      104,
      116,
      0,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      108,
      111,
      97,
      100,
      105,
      110,
      103,
      32,
      67,
      71,
      65,
      32,
      102,
      111,
      110,
      116,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      32,
      32,
      65,
      61,
      79,
      91,
      37,
      48,
      50,
      88,
      93,
      0,
      0,
      0,
      0,
      0,
      67,
      77,
      80,
      83,
      66,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      97,
      108,
      108,
      111,
      99,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      83,
      117,
      112,
      101,
      114,
      82,
      105,
      103,
      104,
      116,
      0,
      0,
      0,
      0,
      0,
      0,
      32,
      32,
      65,
      61,
      73,
      91,
      37,
      48,
      50,
      88,
      93,
      0,
      0,
      0,
      0,
      0,
      102,
      105,
      108,
      101,
      61,
      37,
      115,
      32,
      109,
      111,
      100,
      101,
      61,
      37,
      115,
      32,
      112,
      99,
      109,
      61,
      37,
      100,
      32,
      102,
      105,
      108,
      116,
      101,
      114,
      61,
      37,
      100,
      32,
      112,
      111,
      115,
      61,
      37,
      108,
      117,
      32,
      97,
      112,
      112,
      101,
      110,
      100,
      61,
      37,
      100,
      10,
      0,
      0,
      0,
      0,
      0,
      77,
      101,
      116,
      97,
      82,
      105,
      103,
      104,
      116,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      105,
      111,
      0,
      0,
      0,
      0,
      0,
      0,
      77,
      79,
      68,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      77,
      79,
      68,
      65,
      61,
      37,
      117,
      32,
      32,
      77,
      79,
      68,
      66,
      61,
      37,
      117,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      115,
      58,
      32,
      117,
      110,
      107,
      110,
      111,
      119,
      110,
      32,
      102,
      117,
      110,
      99,
      116,
      105,
      111,
      110,
      58,
      32,
      65,
      88,
      61,
      37,
      48,
      52,
      88,
      10,
      0,
      67,
      77,
      80,
      83,
      87,
      0,
      0,
      0,
      98,
      108,
      0,
      0,
      0,
      0,
      0,
      0,
      67,
      65,
      83,
      83,
      69,
      84,
      84,
      69,
      58,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      65,
      108,
      116,
      82,
      105,
      103,
      104,
      116,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      56,
      50,
      53,
      53,
      45,
      80,
      80,
      73,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      83,
      84,
      79,
      83,
      66,
      0,
      0,
      0,
      112,
      99,
      109,
      0,
      0,
      0,
      0,
      0,
      83,
      112,
      97,
      99,
      101,
      0,
      0,
      0,
      91,
      37,
      115,
      37,
      48,
      52,
      88,
      93,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      105,
      111,
      0,
      0,
      0,
      0,
      0,
      0,
      32,
      32,
      78,
      37,
      117,
      61,
      37,
      48,
      52,
      108,
      88,
      0,
      0,
      0,
      0,
      0,
      32,
      32,
      37,
      117,
      58,
      32,
      37,
      108,
      117,
      75,
      32,
      32,
      108,
      111,
      99,
      107,
      61,
      37,
      100,
      10,
      0,
      0,
      0,
      0,
      83,
      84,
      79,
      83,
      87,
      0,
      0,
      0,
      102,
      105,
      108,
      116,
      101,
      114,
      0,
      0,
      65,
      108,
      116,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      101,
      120,
      105,
      116,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      78,
      48,
      61,
      37,
      48,
      52,
      108,
      88,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      114,
      111,
      109,
      115,
      47,
      112,
      99,
      101,
      45,
      99,
      111,
      110,
      102,
      105,
      103,
      46,
      99,
      102,
      103,
      0,
      0,
      0,
      0,
      0,
      76,
      79,
      68,
      83,
      66,
      0,
      0,
      0,
      97,
      112,
      112,
      101,
      110,
      100,
      0,
      0,
      65,
      108,
      116,
      76,
      101,
      102,
      116,
      0,
      73,
      67,
      87,
      61,
      91,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      50,
      88,
      93,
      32,
      32,
      79,
      67,
      87,
      61,
      91,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      50,
      88,
      93,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      105,
      111,
      0,
      0,
      0,
      0,
      0,
      0,
      76,
      79,
      68,
      83,
      87,
      0,
      0,
      0,
      104,
      109,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      101,
      120,
      105,
      116,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      112,
      111,
      115,
      105,
      116,
      105,
      111,
      110,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      77,
      111,
      100,
      101,
      0,
      0,
      0,
      0,
      70,
      57,
      0,
      0,
      0,
      0,
      0,
      0,
      33,
      61,
      0,
      0,
      0,
      0,
      0,
      0,
      73,
      83,
      82,
      61,
      0,
      0,
      0,
      0,
      123,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      104,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      98,
      105,
      110,
      0,
      0,
      0,
      0,
      0,
      109,
      111,
      117,
      115,
      101,
      95,
      109,
      117,
      108,
      95,
      120,
      0,
      0,
      0,
      0,
      0,
      97,
      100,
      100,
      114,
      61,
      48,
      120,
      37,
      48,
      56,
      108,
      120,
      32,
      115,
      105,
      122,
      101,
      61,
      37,
      108,
      117,
      32,
      102,
      105,
      108,
      101,
      61,
      37,
      115,
      10,
      0,
      0,
      104,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      45,
      45,
      37,
      115,
      0,
      0,
      0,
      0,
      101,
      120,
      112,
      101,
      99,
      116,
      105,
      110,
      103,
      32,
      101,
      120,
      112,
      114,
      101,
      115,
      115,
      105,
      111,
      110,
      0,
      0,
      0,
      0,
      118,
      51,
      48,
      0,
      0,
      0,
      0,
      0,
      83,
      67,
      65,
      83,
      66,
      0,
      0,
      0,
      116,
      100,
      48,
      58,
      32,
      100,
      114,
      111,
      112,
      112,
      105,
      110,
      103,
      32,
      112,
      104,
      97,
      110,
      116,
      111,
      109,
      32,
      115,
      101,
      99,
      116,
      111,
      114,
      32,
      37,
      117,
      47,
      37,
      117,
      47,
      37,
      117,
      10,
      0,
      0,
      82,
      101,
      108,
      101,
      97,
      115,
      101,
      32,
      51,
      46,
      48,
      55,
      36,
      48,
      0,
      0,
      46,
      116,
      100,
      48,
      0,
      0,
      0,
      0,
      79,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      108,
      111,
      97,
      100,
      0,
      0,
      0,
      0,
      87,
      105,
      110,
      100,
      111,
      119,
      115,
      76,
      101,
      102,
      116,
      0,
      0,
      0,
      0,
      0,
      82,
      69,
      71,
      58,
      32,
      77,
      79,
      68,
      69,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      67,
      83,
      69,
      76,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      83,
      84,
      65,
      84,
      85,
      83,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      80,
      65,
      76,
      61,
      91,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      50,
      88,
      93,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      67,
      82,
      84,
      0,
      0,
      0,
      0,
      0,
      67,
      82,
      84,
      67,
      61,
      91,
      37,
      48,
      50,
      88,
      0,
      0,
      0,
      0,
      0,
      0,
      67,
      82,
      84,
      67,
      61,
      91,
      37,
      48,
      50,
      88,
      0,
      0,
      0,
      0,
      0,
      0,
      32,
      32,
      73,
      78,
      84,
      82,
      61,
      37,
      100,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      105,
      111,
      0,
      0,
      0,
      0,
      0,
      0,
      83,
      67,
      65,
      83,
      87,
      0,
      0,
      0,
      109,
      111,
      100,
      101,
      0,
      0,
      0,
      0,
      83,
      116,
      97,
      114,
      116,
      76,
      101,
      102,
      116,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      73,
      77,
      82,
      61,
      0,
      0,
      0,
      0,
      112,
      99,
      109,
      47,
      102,
      0,
      0,
      0,
      99,
      111,
      108,
      111,
      114,
      95,
      98,
      97,
      99,
      107,
      103,
      114,
      111,
      117,
      110,
      100,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      99,
      111,
      108,
      111,
      114,
      95,
      103,
      114,
      97,
      112,
      104,
      105,
      99,
      115,
      0,
      0,
      82,
      69,
      84,
      78,
      0,
      0,
      0,
      0,
      67,
      76,
      75,
      58,
      32,
      67,
      76,
      75,
      61,
      37,
      108,
      117,
      32,
      32,
      72,
      84,
      61,
      37,
      108,
      117,
      32,
      72,
      68,
      61,
      37,
      108,
      117,
      32,
      32,
      86,
      84,
      61,
      37,
      108,
      117,
      32,
      86,
      68,
      61,
      37,
      108,
      117,
      10,
      0,
      0,
      0,
      0,
      0,
      102,
      105,
      108,
      101,
      0,
      0,
      0,
      0,
      83,
      117,
      112,
      101,
      114,
      76,
      101,
      102,
      116,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      60,
      110,
      111,
      110,
      101,
      62,
      0,
      0,
      32,
      32,
      80,
      82,
      73,
      79,
      61,
      37,
      117,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      69,
      56,
      50,
      55,
      50,
      58,
      32,
      67,
      77,
      68,
      61,
      37,
      48,
      50,
      88,
      32,
      68,
      61,
      63,
      32,
      73,
      78,
      86,
      65,
      76,
      73,
      68,
      10,
      0,
      0,
      0,
      0,
      101,
      110,
      97,
      98,
      108,
      101,
      0,
      0,
      77,
      101,
      116,
      97,
      0,
      0,
      0,
      0,
      73,
      82,
      82,
      61,
      0,
      0,
      0,
      0,
      99,
      97,
      115,
      115,
      101,
      116,
      116,
      101,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      77,
      101,
      116,
      97,
      76,
      101,
      102,
      116,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      32,
      32,
      37,
      117,
      58,
      32,
      37,
      117,
      32,
      112,
      97,
      103,
      101,
      115,
      10,
      0,
      100,
      108,
      0,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      115,
      101,
      116,
      116,
      105,
      110,
      103,
      32,
      115,
      111,
      117,
      110,
      100,
      32,
      100,
      114,
      105,
      118,
      101,
      114,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      0,
      67,
      116,
      114,
      108,
      0,
      0,
      0,
      0,
      73,
      78,
      80,
      61,
      0,
      0,
      0,
      0,
      69,
      78,
      84,
      69,
      82,
      0,
      0,
      0,
      118,
      111,
      108,
      117,
      109,
      101,
      61,
      37,
      117,
      32,
      115,
      114,
      97,
      116,
      101,
      61,
      37,
      108,
      117,
      32,
      108,
      111,
      119,
      112,
      97,
      115,
      115,
      61,
      37,
      108,
      117,
      32,
      100,
      114,
      105,
      118,
      101,
      114,
      61,
      37,
      115,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      67,
      116,
      114,
      108,
      76,
      101,
      102,
      116,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      66,
      89,
      84,
      69,
      32,
      0,
      0,
      0,
      56,
      50,
      53,
      57,
      65,
      45,
      80,
      73,
      67,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      69,
      77,
      66,
      58,
      32,
      98,
      108,
      107,
      61,
      37,
      117,
      32,
      117,
      115,
      101,
      100,
      61,
      37,
      108,
      117,
      32,
      109,
      97,
      120,
      61,
      37,
      108,
      117,
      10,
      0,
      0,
      0,
      101,
      56,
      50,
      53,
      57,
      58,
      32,
      73,
      78,
      84,
      65,
      32,
      119,
      105,
      116,
      104,
      111,
      117,
      116,
      32,
      73,
      82,
      81,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      76,
      69,
      65,
      86,
      69,
      0,
      0,
      0,
      83,
      80,
      69,
      65,
      75,
      69,
      82,
      58,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      47,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      100,
      105,
      115,
      107,
      46,
      105,
      110,
      115,
      101,
      114,
      116,
      0,
      67,
      72,
      78,
      32,
      37,
      117,
      58,
      32,
      77,
      79,
      68,
      69,
      61,
      37,
      48,
      50,
      88,
      32,
      65,
      68,
      68,
      82,
      61,
      37,
      48,
      52,
      88,
      91,
      37,
      48,
      52,
      88,
      93,
      32,
      67,
      78,
      84,
      61,
      37,
      48,
      52,
      88,
      91,
      37,
      48,
      52,
      88,
      93,
      32,
      68,
      82,
      69,
      81,
      61,
      37,
      100,
      32,
      83,
      82,
      69,
      81,
      61,
      37,
      100,
      32,
      77,
      65,
      83,
      75,
      61,
      37,
      100,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      118,
      103,
      97,
      0,
      0,
      0,
      0,
      0,
      82,
      69,
      84,
      70,
      0,
      0,
      0,
      0,
      108,
      111,
      119,
      112,
      97,
      115,
      115,
      0,
      83,
      108,
      97,
      115,
      104,
      0,
      0,
      0,
      67,
      77,
      68,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      80,
      82,
      73,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      67,
      72,
      75,
      61,
      37,
      100,
      10,
      0,
      0,
      0,
      0,
      0,
      73,
      78,
      84,
      51,
      0,
      0,
      0,
      0,
      103,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      115,
      100,
      108,
      58,
      32,
      98,
      108,
      105,
      116,
      32,
      101,
      114,
      114,
      111,
      114,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      48,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      115,
      97,
      109,
      112,
      108,
      101,
      95,
      114,
      97,
      116,
      101,
      0,
      0,
      0,
      0,
      0,
      46,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      70,
      56,
      0,
      0,
      0,
      0,
      0,
      0,
      61,
      61,
      0,
      0,
      0,
      0,
      0,
      0,
      56,
      50,
      51,
      55,
      45,
      68,
      77,
      65,
      67,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      115,
      101,
      99,
      116,
      105,
      111,
      110,
      0,
      102,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      115,
      114,
      101,
      99,
      0,
      0,
      0,
      0,
      115,
      99,
      97,
      108,
      101,
      0,
      0,
      0,
      82,
      65,
      77,
      58,
      0,
      0,
      0,
      0,
      99,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      32,
      32,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      120,
      112,
      101,
      99,
      116,
      105,
      110,
      103,
      32,
      111,
      102,
      102,
      115,
      101,
      116,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      56,
      48,
      49,
      56,
      56,
      0,
      0,
      0,
      116,
      100,
      48,
      58,
      32,
      99,
      114,
      99,
      32,
      101,
      114,
      114,
      111,
      114,
      32,
      97,
      116,
      32,
      115,
      101,
      99,
      116,
      111,
      114,
      32,
      37,
      117,
      47,
      37,
      117,
      47,
      37,
      117,
      32,
      40,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      52,
      88,
      32,
      37,
      48,
      52,
      88,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      82,
      101,
      108,
      101,
      97,
      115,
      101,
      32,
      51,
      46,
      48,
      50,
      36,
      48,
      0,
      0,
      46,
      116,
      99,
      0,
      0,
      0,
      0,
      0,
      78,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      118,
      111,
      108,
      117,
      109,
      101,
      0,
      0,
      80,
      101,
      114,
      105,
      111,
      100,
      0,
      0,
      104,
      100,
      99,
      58,
      32,
      102,
      111,
      114,
      109,
      97,
      116,
      32,
      101,
      114,
      114,
      111,
      114,
      32,
      40,
      100,
      61,
      37,
      117,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      67,
      71,
      65,
      58,
      32,
      79,
      70,
      83,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      80,
      79,
      83,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      66,
      71,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      80,
      65,
      76,
      61,
      37,
      117,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      77,
      79,
      85,
      84,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      83,
      84,
      48,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      83,
      84,
      49,
      61,
      37,
      48,
      50,
      88,
      10,
      0,
      0,
      82,
      69,
      71,
      58,
      32,
      77,
      79,
      68,
      69,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      67,
      83,
      69,
      76,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      83,
      84,
      65,
      84,
      85,
      83,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      83,
      80,
      69,
      67,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      80,
      65,
      76,
      61,
      91,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      50,
      88,
      93,
      10,
      0,
      0,
      0,
      82,
      69,
      71,
      58,
      32,
      77,
      79,
      68,
      69,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      67,
      83,
      69,
      76,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      83,
      84,
      65,
      84,
      85,
      83,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      83,
      80,
      69,
      67,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      80,
      65,
      76,
      61,
      91,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      50,
      88,
      93,
      10,
      0,
      0,
      0,
      80,
      67,
      32,
      77,
      69,
      77,
      0,
      0,
      73,
      78,
      84,
      79,
      0,
      0,
      0,
      0,
      115,
      112,
      101,
      97,
      107,
      101,
      114,
      0,
      44,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      80,
      67,
      32,
      80,
      79,
      82,
      84,
      83,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      60,
      110,
      111,
      110,
      101,
      62,
      0,
      0,
      103,
      114,
      101,
      101,
      110,
      0,
      0,
      0,
      99,
      111,
      108,
      111,
      114,
      95,
      98,
      114,
      105,
      103,
      104,
      116,
      0,
      0,
      0,
      0,
      73,
      82,
      69,
      84,
      0,
      0,
      0,
      0,
      69,
      71,
      65,
      58,
      32,
      65,
      68,
      68,
      82,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      82,
      79,
      70,
      83,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      67,
      85,
      82,
      83,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      76,
      67,
      77,
      80,
      61,
      37,
      48,
      52,
      88,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      86,
      71,
      65,
      32,
      105,
      114,
      113,
      61,
      37,
      117,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      67,
      111,
      109,
      109,
      97,
      0,
      0,
      0,
      67,
      71,
      65,
      32,
      105,
      111,
      61,
      48,
      120,
      37,
      48,
      52,
      108,
      120,
      32,
      97,
      100,
      100,
      114,
      61,
      48,
      120,
      37,
      48,
      53,
      108,
      120,
      32,
      115,
      105,
      122,
      101,
      61,
      48,
      120,
      37,
      48,
      53,
      108,
      120,
      32,
      102,
      111,
      110,
      116,
      61,
      37,
      117,
      32,
      102,
      105,
      108,
      101,
      61,
      37,
      115,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      73,
      79,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      37,
      108,
      117,
      32,
      37,
      117,
      37,
      99,
      37,
      117,
      32,
      32,
      68,
      84,
      82,
      61,
      37,
      100,
      32,
      32,
      82,
      84,
      83,
      61,
      37,
      100,
      32,
      32,
      32,
      68,
      83,
      82,
      61,
      37,
      100,
      32,
      32,
      67,
      84,
      83,
      61,
      37,
      100,
      32,
      32,
      68,
      67,
      68,
      61,
      37,
      100,
      32,
      32,
      82,
      73,
      61,
      37,
      100,
      10,
      84,
      120,
      68,
      61,
      37,
      48,
      50,
      88,
      37,
      99,
      32,
      82,
      120,
      68,
      61,
      37,
      48,
      50,
      88,
      37,
      99,
      32,
      83,
      67,
      82,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      68,
      73,
      86,
      61,
      37,
      48,
      52,
      88,
      10,
      73,
      69,
      82,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      73,
      73,
      82,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      76,
      67,
      82,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      76,
      83,
      82,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      77,
      67,
      82,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      77,
      83,
      82,
      61,
      37,
      48,
      50,
      88,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      100,
      105,
      115,
      97,
      98,
      108,
      101,
      100,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      109,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      99,
      111,
      112,
      121,
      32,
      109,
      101,
      109,
      111,
      114,
      121,
      0,
      0,
      0,
      0,
      0,
      56,
      50,
      53,
      48,
      45,
      85,
      65,
      82,
      84,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      56,
      50,
      53,
      48,
      0,
      0,
      0,
      0,
      83,
      65,
      82,
      0,
      0,
      0,
      0,
      0,
      101,
      110,
      97,
      98,
      108,
      101,
      100,
      0,
      110,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      115,
      114,
      99,
      32,
      100,
      115,
      116,
      32,
      99,
      110,
      116,
      0,
      0,
      0,
      0,
      0,
      69,
      77,
      83,
      0,
      0,
      0,
      0,
      0,
      63,
      63,
      63,
      0,
      0,
      0,
      0,
      0,
      32,
      32,
      109,
      97,
      112,
      112,
      105,
      110,
      103,
      58,
      32,
      91,
      37,
      117,
      47,
      37,
      117,
      32,
      37,
      117,
      47,
      37,
      117,
      32,
      37,
      117,
      47,
      37,
      117,
      32,
      37,
      117,
      47,
      37,
      117,
      93,
      10,
      0,
      0,
      0,
      99,
      108,
      0,
      0,
      0,
      0,
      0,
      0,
      69,
      71,
      65,
      32,
      105,
      114,
      113,
      61,
      37,
      117,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      98,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      118,
      97,
      108,
      117,
      97,
      116,
      101,
      32,
      101,
      120,
      112,
      114,
      101,
      115,
      115,
      105,
      111,
      110,
      115,
      0,
      0,
      0,
      0,
      88,
      77,
      83,
      0,
      0,
      0,
      0,
      0,
      83,
      72,
      82,
      0,
      0,
      0,
      0,
      0,
      101,
      110,
      97,
      98,
      108,
      101,
      95,
      105,
      114,
      113,
      0,
      0,
      0,
      0,
      0,
      0,
      118,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      91,
      101,
      120,
      112,
      114,
      46,
      46,
      46,
      93,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      87,
      79,
      82,
      68,
      32,
      0,
      0,
      0,
      117,
      110,
      107,
      110,
      111,
      119,
      110,
      32,
      99,
      111,
      109,
      112,
      111,
      110,
      101,
      110,
      116,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      88,
      77,
      83,
      58,
      32,
      69,
      77,
      66,
      58,
      32,
      37,
      108,
      117,
      75,
      47,
      37,
      108,
      117,
      75,
      32,
      32,
      85,
      77,
      66,
      58,
      32,
      37,
      108,
      117,
      75,
      47,
      37,
      108,
      117,
      75,
      32,
      32,
      72,
      77,
      65,
      58,
      32,
      37,
      108,
      117,
      75,
      47,
      37,
      108,
      117,
      75,
      10,
      0,
      0,
      0,
      0,
      83,
      72,
      76,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      115,
      101,
      116,
      116,
      105,
      110,
      103,
      32,
      117,
      112,
      32,
      118,
      105,
      100,
      101,
      111,
      32,
      100,
      101,
      118,
      105,
      99,
      101,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      10,
      0,
      0,
      0,
      0,
      0,
      99,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      110,
      97,
      109,
      101,
      32,
      91,
      102,
      93,
      32,
      91,
      97,
      32,
      110,
      46,
      46,
      46,
      93,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      100,
      105,
      115,
      107,
      46,
      101,
      106,
      101,
      99,
      116,
      0,
      0,
      120,
      109,
      115,
      0,
      0,
      0,
      0,
      0,
      82,
      67,
      82,
      0,
      0,
      0,
      0,
      0,
      37,
      115,
      58,
      32,
      117,
      110,
      107,
      110,
      111,
      119,
      110,
      32,
      111,
      112,
      116,
      105,
      111,
      110,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      117,
      110,
      107,
      110,
      111,
      119,
      110,
      32,
      118,
      105,
      100,
      101,
      111,
      32,
      100,
      101,
      118,
      105,
      99,
      101,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      120,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      113,
      117,
      105,
      116,
      0,
      0,
      0,
      0,
      101,
      109,
      115,
      0,
      0,
      0,
      0,
      0,
      82,
      67,
      76,
      0,
      0,
      0,
      0,
      0,
      115,
      100,
      108,
      58,
      32,
      107,
      101,
      121,
      32,
      61,
      32,
      48,
      120,
      37,
      48,
      52,
      120,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      99,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      116,
      101,
      114,
      109,
      46,
      102,
      117,
      108,
      108,
      115,
      99,
      114,
      101,
      101,
      110,
      0,
      119,
      121,
      55,
      48,
      48,
      0,
      0,
      0,
      122,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      115,
      101,
      110,
      100,
      32,
      97,
      32,
      109,
      101,
      115,
      115,
      97,
      103,
      101,
      32,
      116,
      111,
      32,
      116,
      104,
      101,
      32,
      101,
      109,
      117,
      108,
      97,
      116,
      111,
      114,
      32,
      99,
      111,
      114,
      101,
      0,
      0,
      0,
      0,
      0,
      70,
      55,
      0,
      0,
      0,
      0,
      0,
      0,
      38,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      34,
      37,
      115,
      34,
      0,
      0,
      0,
      0,
      118,
      105,
      100,
      101,
      111,
      0,
      0,
      0,
      101,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      105,
      104,
      120,
      0,
      0,
      0,
      0,
      0,
      109,
      105,
      110,
      95,
      104,
      0,
      0,
      0,
      100,
      101,
      102,
      97,
      117,
      108,
      116,
      0,
      111,
      102,
      102,
      115,
      101,
      116,
      0,
      0,
      44,
      32,
      0,
      0,
      0,
      0,
      0,
      0,
      115,
      121,
      110,
      116,
      97,
      120,
      32,
      101,
      114,
      114,
      111,
      114,
      0,
      0,
      0,
      0,
      58,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      56,
      48,
      49,
      56,
      54,
      0,
      0,
      0,
      82,
      79,
      82,
      0,
      0,
      0,
      0,
      0,
      116,
      100,
      48,
      58,
      32,
      115,
      101,
      99,
      116,
      111,
      114,
      32,
      99,
      114,
      99,
      32,
      111,
      118,
      101,
      114,
      32,
      104,
      101,
      97,
      100,
      101,
      114,
      43,
      100,
      97,
      116,
      97,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      99,
      112,
      50,
      58,
      32,
      119,
      97,
      114,
      110,
      105,
      110,
      103,
      58,
      32,
      117,
      110,
      107,
      110,
      111,
      119,
      110,
      32,
      67,
      80,
      50,
      32,
      118,
      101,
      114,
      115,
      105,
      111,
      110,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      46,
      114,
      97,
      119,
      0,
      0,
      0,
      0,
      108,
      111,
      103,
      0,
      0,
      0,
      0,
      0,
      119,
      121,
      115,
      101,
      0,
      0,
      0,
      0,
      60,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      109,
      115,
      103,
      32,
      91,
      118,
      97,
      108,
      93,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      104,
      100,
      99,
      58,
      32,
      102,
      111,
      114,
      109,
      97,
      116,
      32,
      116,
      114,
      97,
      99,
      107,
      32,
      101,
      114,
      114,
      111,
      114,
      32,
      40,
      100,
      61,
      37,
      117,
      41,
      10,
      0,
      68,
      69,
      86,
      58,
      32,
      87,
      121,
      115,
      101,
      32,
      55,
      48,
      48,
      10,
      0,
      0,
      67,
      76,
      75,
      58,
      32,
      67,
      76,
      75,
      61,
      37,
      108,
      117,
      32,
      32,
      72,
      84,
      61,
      37,
      108,
      117,
      32,
      72,
      68,
      61,
      37,
      108,
      117,
      32,
      32,
      86,
      84,
      61,
      37,
      108,
      117,
      32,
      86,
      68,
      61,
      37,
      108,
      117,
      10,
      0,
      0,
      0,
      0,
      0,
      67,
      71,
      65,
      58,
      32,
      79,
      70,
      83,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      80,
      79,
      83,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      66,
      71,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      80,
      65,
      76,
      61,
      37,
      117,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      67,
      71,
      65,
      58,
      32,
      79,
      70,
      83,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      80,
      79,
      83,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      66,
      71,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      80,
      65,
      76,
      61,
      37,
      117,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      117,
      97,
      114,
      116,
      0,
      0,
      0,
      0,
      82,
      79,
      76,
      0,
      0,
      0,
      0,
      0,
      76,
      101,
      115,
      115,
      0,
      0,
      0,
      0,
      112,
      108,
      97,
      110,
      116,
      114,
      111,
      110,
      105,
      99,
      115,
      0,
      0,
      0,
      0,
      0,
      114,
      101,
      97,
      100,
      32,
      97,
      32,
      102,
      105,
      108,
      101,
      32,
      105,
      110,
      116,
      111,
      32,
      109,
      101,
      109,
      111,
      114,
      121,
      0,
      112,
      111,
      114,
      116,
      115,
      0,
      0,
      0,
      111,
      102,
      102,
      0,
      0,
      0,
      0,
      0,
      99,
      111,
      108,
      111,
      114,
      0,
      0,
      0,
      99,
      111,
      108,
      111,
      114,
      95,
      110,
      111,
      114,
      109,
      97,
      108,
      0,
      0,
      0,
      0,
      68,
      69,
      86,
      58,
      32,
      69,
      71,
      65,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      83,
      104,
      105,
      102,
      116,
      0,
      0,
      0,
      111,
      108,
      105,
      118,
      101,
      116,
      116,
      105,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      110,
      97,
      109,
      101,
      32,
      91,
      102,
      93,
      32,
      91,
      97,
      32,
      91,
      110,
      93,
      93,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      86,
      73,
      68,
      69,
      79,
      58,
      0,
      0,
      109,
      101,
      109,
      0,
      0,
      0,
      0,
      0,
      88,
      76,
      65,
      84,
      0,
      0,
      0,
      0,
      83,
      104,
      105,
      102,
      116,
      76,
      101,
      102,
      116,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      109,
      100,
      97,
      0,
      0,
      0,
      0,
      0,
      112,
      114,
      105,
      110,
      116,
      32,
      104,
      101,
      108,
      112,
      0,
      0,
      0,
      0,
      0,
      0,
      100,
      109,
      97,
      0,
      0,
      0,
      0,
      0,
      74,
      67,
      88,
      90,
      0,
      0,
      0,
      0,
      92,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      104,
      103,
      99,
      0,
      0,
      0,
      0,
      0,
      102,
      105,
      110,
      100,
      32,
      98,
      121,
      116,
      101,
      115,
      32,
      105,
      110,
      32,
      109,
      101,
      109,
      111,
      114,
      121,
      0,
      0,
      0,
      0,
      112,
      105,
      99,
      0,
      0,
      0,
      0,
      0,
      76,
      79,
      79,
      80,
      0,
      0,
      0,
      0,
      97,
      108,
      0,
      0,
      0,
      0,
      0,
      0,
      69,
      77,
      83,
      58,
      32,
      37,
      117,
      47,
      37,
      117,
      32,
      112,
      97,
      103,
      101,
      115,
      32,
      32,
      37,
      108,
      117,
      75,
      47,
      37,
      108,
      117,
      75,
      32,
      32,
      37,
      117,
      32,
      104,
      97,
      110,
      100,
      108,
      101,
      115,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      66,
      97,
      99,
      107,
      115,
      108,
      97,
      115,
      104,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      103,
      97,
      0,
      0,
      0,
      0,
      0,
      97,
      100,
      100,
      114,
      32,
      99,
      110,
      116,
      32,
      91,
      118,
      97,
      108,
      46,
      46,
      46,
      93,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      112,
      112,
      105,
      0,
      0,
      0,
      0,
      0,
      76,
      79,
      79,
      80,
      90,
      0,
      0,
      0,
      39,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      118,
      103,
      97,
      0,
      0,
      0,
      0,
      0,
      101,
      110,
      116,
      101,
      114,
      32,
      98,
      121,
      116,
      101,
      115,
      32,
      105,
      110,
      116,
      111,
      32,
      109,
      101,
      109,
      111,
      114,
      121,
      0,
      80,
      85,
      83,
      72,
      0,
      0,
      0,
      0,
      112,
      105,
      116,
      0,
      0,
      0,
      0,
      0,
      114,
      101,
      115,
      101,
      116,
      32,
      120,
      109,
      115,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      76,
      79,
      79,
      80,
      78,
      90,
      0,
      0,
      65,
      112,
      111,
      115,
      116,
      114,
      111,
      112,
      104,
      101,
      0,
      0,
      0,
      0,
      0,
      0,
      100,
      101,
      118,
      105,
      99,
      101,
      61,
      37,
      115,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      97,
      100,
      100,
      114,
      32,
      91,
      118,
      97,
      108,
      124,
      115,
      116,
      114,
      105,
      110,
      103,
      46,
      46,
      46,
      93,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      100,
      105,
      115,
      107,
      46,
      99,
      111,
      109,
      109,
      105,
      116,
      0,
      116,
      105,
      109,
      101,
      0,
      0,
      0,
      0,
      105,
      112,
      0,
      0,
      0,
      0,
      0,
      0,
      74,
      77,
      80,
      78,
      0,
      0,
      0,
      0,
      99,
      112,
      117,
      46,
      115,
      112,
      101,
      101,
      100,
      32,
      61,
      32,
      0,
      0,
      0,
      0,
      81,
      117,
      111,
      116,
      101,
      0,
      0,
      0,
      86,
      73,
      68,
      69,
      79,
      58,
      0,
      0,
      100,
      117,
      109,
      112,
      32,
      109,
      101,
      109,
      111,
      114,
      121,
      0,
      0,
      0,
      0,
      0,
      66,
      79,
      85,
      78,
      68,
      32,
      69,
      65,
      32,
      105,
      115,
      32,
      114,
      101,
      103,
      105,
      115,
      116,
      101,
      114,
      10,
      0,
      0,
      0,
      99,
      112,
      117,
      0,
      0,
      0,
      0,
      0,
      37,
      48,
      52,
      88,
      58,
      37,
      48,
      52,
      88,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      115,
      116,
      111,
      112,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      59,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      99,
      103,
      97,
      0,
      0,
      0,
      0,
      0,
      98,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      91,
      97,
      100,
      100,
      114,
      32,
      91,
      99,
      110,
      116,
      93,
      93,
      0,
      0,
      0,
      0,
      70,
      54,
      0,
      0,
      0,
      0,
      0,
      0,
      94,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      48,
      120,
      37,
      108,
      120,
      0,
      0,
      0,
      112,
      99,
      0,
      0,
      0,
      0,
      0,
      0,
      60,
      110,
      108,
      62,
      0,
      0,
      0,
      0,
      100,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      105,
      104,
      101,
      120,
      0,
      0,
      0,
      0,
      109,
      105,
      110,
      95,
      119,
      0,
      0,
      0,
      115,
      105,
      122,
      101,
      0,
      0,
      0,
      0,
      97,
      117,
      116,
      111,
      0,
      0,
      0,
      0,
      32,
      32,
      45,
      37,
      99,
      0,
      0,
      0,
      115,
      116,
      114,
      105,
      110,
      103,
      32,
      116,
      111,
      111,
      32,
      108,
      111,
      110,
      103,
      0,
      101,
      120,
      112,
      101,
      99,
      116,
      105,
      110,
      103,
      32,
      97,
      100,
      100,
      114,
      101,
      115,
      115,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      56,
      48,
      56,
      56,
      0,
      0,
      0,
      0,
      74,
      77,
      80,
      83,
      0,
      0,
      0,
      0,
      116,
      100,
      48,
      58,
      32,
      117,
      110,
      107,
      110,
      111,
      119,
      110,
      32,
      99,
      111,
      109,
      112,
      114,
      101,
      115,
      115,
      105,
      111,
      110,
      32,
      40,
      37,
      117,
      47,
      37,
      117,
      47,
      37,
      117,
      32,
      37,
      117,
      41,
      10,
      0,
      99,
      112,
      50,
      58,
      32,
      110,
      111,
      116,
      32,
      97,
      32,
      67,
      80,
      50,
      32,
      102,
      105,
      108,
      101,
      10,
      0,
      0,
      0,
      0,
      46,
      105,
      109,
      103,
      0,
      0,
      0,
      0,
      119,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      121,
      100,
      105,
      118,
      0,
      0,
      0,
      0,
      83,
      101,
      109,
      105,
      99,
      111,
      108,
      111,
      110,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      100,
      101,
      118,
      105,
      99,
      101,
      0,
      0,
      115,
      101,
      116,
      32,
      97,
      110,
      32,
      101,
      120,
      112,
      114,
      101,
      115,
      115,
      105,
      111,
      110,
      32,
      98,
      114,
      101,
      97,
      107,
      112,
      111,
      105,
      110,
      116,
      32,
      91,
      112,
      97,
      115,
      115,
      61,
      49,
      32,
      114,
      101,
      115,
      101,
      116,
      61,
      48,
      93,
      0,
      0,
      0,
      104,
      100,
      99,
      58,
      32,
      114,
      101,
      97,
      100,
      32,
      101,
      114,
      114,
      111,
      114,
      32,
      40,
      100,
      61,
      37,
      117,
      41,
      10,
      0,
      87,
      89,
      55,
      48,
      48,
      58,
      32,
      117,
      110,
      107,
      110,
      111,
      119,
      110,
      32,
      109,
      111,
      100,
      101,
      32,
      40,
      37,
      48,
      50,
      88,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      86,
      71,
      65,
      58,
      32,
      65,
      68,
      68,
      82,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      76,
      79,
      70,
      83,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      67,
      85,
      82,
      83,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      76,
      67,
      77,
      80,
      61,
      37,
      48,
      52,
      88,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      68,
      69,
      86,
      58,
      32,
      80,
      108,
      97,
      110,
      116,
      114,
      111,
      110,
      105,
      99,
      115,
      32,
      67,
      111,
      108,
      111,
      114,
      112,
      108,
      117,
      115,
      10,
      0,
      0,
      0,
      0,
      0,
      68,
      69,
      86,
      58,
      32,
      79,
      108,
      105,
      118,
      101,
      116,
      116,
      105,
      32,
      77,
      50,
      52,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      37,
      115,
      44,
      32,
      37,
      115,
      0,
      0,
      73,
      78,
      0,
      0,
      0,
      0,
      0,
      0,
      108,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      120,
      112,
      114,
      32,
      91,
      112,
      97,
      115,
      115,
      32,
      91,
      114,
      101,
      115,
      101,
      116,
      93,
      93,
      0,
      0,
      0,
      0,
      0,
      118,
      105,
      100,
      101,
      111,
      0,
      0,
      0,
      111,
      110,
      32,
      0,
      0,
      0,
      0,
      0,
      79,
      108,
      105,
      118,
      101,
      116,
      116,
      105,
      32,
      105,
      111,
      61,
      48,
      120,
      37,
      48,
      52,
      108,
      120,
      32,
      97,
      100,
      100,
      114,
      61,
      48,
      120,
      37,
      48,
      53,
      108,
      120,
      32,
      115,
      105,
      122,
      101,
      61,
      48,
      120,
      37,
      48,
      53,
      108,
      120,
      10,
      0,
      0,
      77,
      68,
      65,
      32,
      105,
      111,
      61,
      48,
      120,
      37,
      48,
      52,
      108,
      120,
      32,
      97,
      100,
      100,
      114,
      61,
      48,
      120,
      37,
      48,
      53,
      108,
      120,
      32,
      115,
      105,
      122,
      101,
      61,
      48,
      120,
      37,
      48,
      53,
      108,
      120,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      99,
      111,
      108,
      111,
      114,
      95,
      98,
      97,
      99,
      107,
      103,
      114,
      111,
      117,
      110,
      100,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      69,
      71,
      65,
      32,
      105,
      111,
      61,
      48,
      120,
      37,
      48,
      52,
      108,
      120,
      32,
      97,
      100,
      100,
      114,
      61,
      48,
      120,
      37,
      48,
      53,
      108,
      120,
      32,
      115,
      119,
      105,
      116,
      99,
      104,
      101,
      115,
      61,
      37,
      48,
      50,
      88,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      107,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      108,
      111,
      97,
      100,
      105,
      110,
      103,
      32,
      100,
      114,
      105,
      118,
      101,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      98,
      115,
      120,
      0,
      0,
      0,
      0,
      0,
      102,
      105,
      108,
      101,
      0,
      0,
      0,
      0,
      32,
      37,
      48,
      52,
      88,
      0,
      0,
      0,
      76,
      79,
      67,
      75,
      32,
      0,
      0,
      0,
      106,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      100,
      105,
      115,
      107,
      0,
      0,
      0,
      0,
      115,
      101,
      116,
      32,
      97,
      110,
      32,
      97,
      100,
      100,
      114,
      101,
      115,
      115,
      32,
      98,
      114,
      101,
      97,
      107,
      112,
      111,
      105,
      110,
      116,
      32,
      91,
      112,
      97,
      115,
      115,
      61,
      49,
      32,
      114,
      101,
      115,
      101,
      116,
      61,
      48,
      93,
      0,
      0,
      0,
      0,
      0,
      0,
      115,
      105,
      122,
      101,
      107,
      0,
      0,
      0,
      82,
      69,
      80,
      78,
      69,
      32,
      0,
      0,
      104,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      99,
      114,
      101,
      97,
      116,
      105,
      110,
      103,
      32,
      102,
      100,
      99,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      97,
      100,
      100,
      114,
      32,
      91,
      112,
      97,
      115,
      115,
      32,
      91,
      114,
      101,
      115,
      101,
      116,
      93,
      93,
      0,
      0,
      0,
      0,
      0,
      32,
      37,
      48,
      50,
      88,
      0,
      0,
      0,
      82,
      69,
      80,
      32,
      0,
      0,
      0,
      0,
      100,
      115,
      0,
      0,
      0,
      0,
      0,
      0,
      80,
      114,
      105,
      110,
      116,
      32,
      118,
      101,
      114,
      115,
      105,
      111,
      110,
      32,
      105,
      110,
      102,
      111,
      114,
      109,
      97,
      116,
      105,
      111,
      110,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      114,
      101,
      115,
      101,
      116,
      32,
      101,
      109,
      115,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      103,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      97,
      100,
      100,
      114,
      61,
      48,
      120,
      37,
      48,
      56,
      108,
      120,
      32,
      105,
      114,
      113,
      61,
      37,
      117,
      32,
      97,
      99,
      99,
      117,
      114,
      97,
      116,
      101,
      61,
      37,
      100,
      32,
      101,
      111,
      116,
      61,
      37,
      100,
      32,
      100,
      114,
      118,
      61,
      91,
      37,
      117,
      32,
      37,
      117,
      32,
      37,
      117,
      32,
      37,
      117,
      93,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      98,
      115,
      0,
      0,
      0,
      0,
      0,
      0,
      37,
      48,
      50,
      88,
      0,
      0,
      0,
      0,
      118,
      101,
      114,
      115,
      105,
      111,
      110,
      0,
      102,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      70,
      68,
      67,
      58,
      0,
      0,
      0,
      0,
      108,
      105,
      115,
      116,
      32,
      98,
      114,
      101,
      97,
      107,
      112,
      111,
      105,
      110,
      116,
      115,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      74,
      77,
      80,
      70,
      0,
      0,
      0,
      0,
      37,
      48,
      52,
      88,
      58,
      37,
      48,
      52,
      88,
      32,
      32,
      37,
      115,
      10,
      0,
      0,
      69,
      77,
      66,
      61,
      37,
      108,
      117,
      91,
      37,
      108,
      117,
      77,
      93,
      32,
      85,
      77,
      66,
      61,
      37,
      108,
      117,
      91,
      37,
      108,
      117,
      75,
      93,
      32,
      97,
      116,
      32,
      48,
      120,
      37,
      48,
      52,
      120,
      32,
      72,
      77,
      65,
      61,
      37,
      100,
      10,
      0,
      0,
      0,
      83,
      101,
      116,
      32,
      116,
      104,
      101,
      32,
      108,
      111,
      103,
      32,
      108,
      101,
      118,
      101,
      108,
      32,
      116,
      111,
      32,
      100,
      101,
      98,
      117,
      103,
      32,
      91,
      110,
      111,
      93,
      0,
      100,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      100,
      114,
      105,
      118,
      101,
      51,
      0,
      0,
      98,
      108,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      100,
      105,
      115,
      107,
      46,
      98,
      111,
      111,
      116,
      0,
      0,
      0,
      100,
      105,
      115,
      97,
      115,
      115,
      101,
      109,
      98,
      108,
      101,
      0,
      0,
      0,
      0,
      0,
      37,
      48,
      50,
      88,
      0,
      0,
      0,
      0,
      34,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      118,
      101,
      114,
      98,
      111,
      115,
      101,
      0,
      109,
      50,
      52,
      32,
      114,
      116,
      99,
      32,
      103,
      101,
      116,
      32,
      112,
      111,
      114,
      116,
      32,
      56,
      32,
      37,
      48,
      52,
      108,
      88,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      115,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      100,
      114,
      105,
      118,
      101,
      50,
      0,
      0,
      99,
      108,
      101,
      97,
      114,
      32,
      97,
      32,
      98,
      114,
      101,
      97,
      107,
      112,
      111,
      105,
      110,
      116,
      32,
      111,
      114,
      32,
      97,
      108,
      108,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      91,
      97,
      100,
      100,
      114,
      32,
      91,
      99,
      110,
      116,
      32,
      91,
      109,
      111,
      100,
      101,
      93,
      93,
      93,
      0,
      0,
      0,
      0,
      0,
      37,
      48,
      52,
      88,
      0,
      0,
      0,
      0,
      83,
      101,
      116,
      32,
      116,
      104,
      101,
      32,
      116,
      101,
      114,
      109,
      105,
      110,
      97,
      108,
      32,
      100,
      101,
      118,
      105,
      99,
      101,
      0,
      49,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      116,
      101,
      114,
      109,
      46,
      114,
      101,
      108,
      101,
      97,
      115,
      101,
      0,
      0,
      0,
      0,
      97,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      105,
      103,
      110,
      111,
      114,
      101,
      95,
      101,
      111,
      116,
      0,
      0,
      0,
      0,
      0,
      0,
      91,
      105,
      110,
      100,
      101,
      120,
      93,
      0,
      70,
      53,
      0,
      0,
      0,
      0,
      0,
      0,
      98,
      111,
      111,
      116,
      0,
      0,
      0,
      0,
      94,
      94,
      0,
      0,
      0,
      0,
      0,
      0,
      37,
      115,
      32,
      61,
      32,
      0,
      0,
      0,
      101,
      120,
      101,
      99,
      117,
      116,
      101,
      32,
      99,
      110,
      116,
      32,
      105,
      110,
      115,
      116,
      114,
      117,
      99,
      116,
      105,
      111,
      110,
      115,
      32,
      91,
      49,
      93,
      0,
      0,
      0,
      0,
      60,
      101,
      111,
      102,
      62,
      0,
      0,
      0,
      115,
      97,
      118,
      101,
      0,
      0,
      0,
      0,
      97,
      117,
      116,
      111,
      0,
      0,
      0,
      0,
      97,
      115,
      112,
      101,
      99,
      116,
      95,
      121,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      115,
      105,
      122,
      101,
      107,
      0,
      0,
      0,
      116,
      121,
      112,
      101,
      0,
      0,
      0,
      0,
      37,
      115,
      58,
      32,
      109,
      105,
      115,
      115,
      105,
      110,
      103,
      32,
      111,
      112,
      116,
      105,
      111,
      110,
      32,
      97,
      114,
      103,
      117,
      109,
      101,
      110,
      116,
      32,
      40,
      45,
      37,
      99,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      105,
      100,
      101,
      110,
      116,
      105,
      102,
      105,
      101,
      114,
      32,
      116,
      111,
      111,
      32,
      108,
      111,
      110,
      103,
      0,
      0,
      0,
      0,
      0,
      120,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      110,
      111,
      0,
      0,
      0,
      0,
      0,
      0,
      56,
      48,
      56,
      54,
      0,
      0,
      0,
      0,
      73,
      68,
      73,
      86,
      0,
      0,
      0,
      0,
      116,
      100,
      48,
      58,
      32,
      122,
      101,
      114,
      111,
      32,
      100,
      97,
      116,
      97,
      32,
      108,
      101,
      110,
      103,
      116,
      104,
      32,
      40,
      37,
      117,
      47,
      37,
      117,
      47,
      37,
      117,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      116,
      101,
      114,
      109,
      105,
      110,
      97,
      108,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      46,
      105,
      109,
      100,
      0,
      0,
      0,
      0,
      115,
      101,
      114,
      99,
      111,
      110,
      0,
      0,
      115,
      116,
      100,
      105,
      111,
      0,
      0,
      0,
      121,
      109,
      117,
      108,
      0,
      0,
      0,
      0,
      100,
      105,
      115,
      107,
      32,
      37,
      117,
      58,
      32,
      119,
      114,
      105,
      116,
      105,
      110,
      103,
      32,
      98,
      97,
      99,
      107,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      10,
      0,
      0,
      0,
      67,
      97,
      112,
      115,
      76,
      111,
      99,
      107,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      97,
      99,
      99,
      117,
      114,
      97,
      116,
      101,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      98,
      99,
      0,
      0,
      0,
      0,
      0,
      0,
      104,
      100,
      99,
      58,
      32,
      119,
      114,
      105,
      116,
      101,
      32,
      101,
      114,
      114,
      111,
      114,
      32,
      40,
      100,
      61,
      37,
      117,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      87,
      89,
      45,
      55,
      48,
      48,
      32,
      105,
      111,
      61,
      48,
      120,
      37,
      48,
      52,
      108,
      120,
      32,
      97,
      100,
      100,
      114,
      61,
      48,
      120,
      37,
      48,
      53,
      108,
      120,
      32,
      115,
      105,
      122,
      101,
      61,
      48,
      120,
      37,
      48,
      53,
      108,
      120,
      10,
      0,
      0,
      0,
      0,
      68,
      69,
      86,
      58,
      32,
      86,
      71,
      65,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      80,
      108,
      97,
      110,
      116,
      114,
      111,
      110,
      105,
      99,
      115,
      32,
      105,
      111,
      61,
      48,
      120,
      37,
      48,
      52,
      108,
      120,
      32,
      97,
      100,
      100,
      114,
      61,
      48,
      120,
      37,
      48,
      53,
      108,
      120,
      32,
      115,
      105,
      122,
      101,
      61,
      48,
      120,
      37,
      48,
      53,
      108,
      120,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      112,
      114,
      105,
      110,
      116,
      32,
      115,
      116,
      97,
      116,
      117,
      115,
      32,
      40,
      112,
      99,
      124,
      99,
      112,
      117,
      124,
      109,
      101,
      109,
      124,
      112,
      105,
      116,
      124,
      112,
      112,
      105,
      124,
      112,
      105,
      99,
      124,
      116,
      105,
      109,
      101,
      124,
      117,
      97,
      114,
      116,
      124,
      118,
      105,
      100,
      101,
      111,
      124,
      120,
      109,
      115,
      41,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      83,
      101,
      116,
      32,
      116,
      104,
      101,
      32,
      67,
      80,
      85,
      32,
      115,
      112,
      101,
      101,
      100,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      82,
      101,
      116,
      117,
      114,
      110,
      0,
      0,
      102,
      100,
      99,
      0,
      0,
      0,
      0,
      0,
      91,
      119,
      104,
      97,
      116,
      93,
      0,
      0,
      99,
      97,
      115,
      115,
      101,
      116,
      116,
      101,
      32,
      109,
      111,
      116,
      111,
      114,
      32,
      37,
      115,
      32,
      97,
      116,
      32,
      37,
      108,
      117,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      86,
      73,
      68,
      69,
      79,
      58,
      0,
      0,
      86,
      73,
      68,
      69,
      79,
      58,
      0,
      0,
      73,
      77,
      85,
      76,
      0,
      0,
      0,
      0,
      97,
      109,
      98,
      101,
      114,
      0,
      0,
      0,
      115,
      112,
      101,
      101,
      100,
      0,
      0,
      0,
      86,
      73,
      68,
      69,
      79,
      58,
      0,
      0,
      93,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      99,
      114,
      101,
      97,
      116,
      105,
      110,
      103,
      32,
      104,
      100,
      99,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      98,
      108,
      105,
      110,
      107,
      0,
      0,
      0,
      115,
      101,
      116,
      32,
      97,
      32,
      114,
      101,
      103,
      105,
      115,
      116,
      101,
      114,
      0,
      0,
      78,
      101,
      118,
      101,
      114,
      32,
      115,
      116,
      111,
      112,
      32,
      114,
      117,
      110,
      110,
      105,
      110,
      103,
      32,
      91,
      110,
      111,
      93,
      0,
      82,
      105,
      103,
      104,
      116,
      66,
      114,
      97,
      99,
      107,
      101,
      116,
      0,
      0,
      0,
      0,
      97,
      100,
      100,
      114,
      61,
      48,
      120,
      37,
      48,
      56,
      108,
      120,
      32,
      105,
      114,
      113,
      61,
      37,
      117,
      32,
      100,
      114,
      118,
      61,
      91,
      37,
      117,
      32,
      37,
      117,
      93,
      32,
      115,
      101,
      99,
      116,
      111,
      114,
      115,
      61,
      37,
      117,
      32,
      115,
      119,
      105,
      116,
      99,
      104,
      101,
      115,
      61,
      48,
      120,
      37,
      48,
      50,
      120,
      32,
      105,
      100,
      61,
      34,
      37,
      115,
      34,
      10,
      0,
      0,
      0,
      0,
      0,
      91,
      114,
      101,
      103,
      32,
      118,
      97,
      108,
      93,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      110,
      111,
      45,
      109,
      111,
      110,
      105,
      116,
      111,
      114,
      0,
      0,
      0,
      0,
      0,
      0,
      91,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      72,
      68,
      67,
      58,
      0,
      0,
      0,
      0,
      120,
      109,
      115,
      95,
      115,
      105,
      122,
      101,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      120,
      101,
      99,
      117,
      116,
      101,
      32,
      99,
      110,
      116,
      32,
      105,
      110,
      115,
      116,
      114,
      117,
      99,
      116,
      105,
      111,
      110,
      115,
      44,
      32,
      119,
      105,
      116,
      104,
      111,
      117,
      116,
      32,
      116,
      114,
      97,
      99,
      101,
      32,
      105,
      110,
      32,
      99,
      97,
      108,
      108,
      115,
      32,
      91,
      49,
      93,
      0,
      0,
      0,
      0,
      115,
      115,
      0,
      0,
      0,
      0,
      0,
      0,
      83,
      116,
      97,
      114,
      116,
      32,
      114,
      117,
      110,
      110,
      105,
      110,
      103,
      32,
      105,
      109,
      109,
      101,
      100,
      105,
      97,
      116,
      101,
      108,
      121,
      32,
      91,
      110,
      111,
      93,
      0,
      0,
      76,
      101,
      102,
      116,
      66,
      114,
      97,
      99,
      107,
      101,
      116,
      0,
      0,
      0,
      0,
      0,
      115,
      105,
      122,
      101,
      61,
      37,
      108,
      117,
      75,
      32,
      40,
      37,
      108,
      117,
      32,
      112,
      97,
      103,
      101,
      115,
      41,
      32,
      115,
      101,
      103,
      109,
      101,
      110,
      116,
      61,
      48,
      120,
      37,
      48,
      52,
      120,
      10,
      0,
      0,
      0,
      115,
      119,
      105,
      116,
      99,
      104,
      101,
      115,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      98,
      108,
      111,
      99,
      107,
      95,
      99,
      111,
      117,
      110,
      116,
      0,
      0,
      0,
      0,
      0,
      112,
      114,
      101,
      102,
      101,
      116,
      99,
      104,
      32,
      113,
      117,
      101,
      117,
      101,
      32,
      99,
      108,
      101,
      97,
      114,
      47,
      102,
      105,
      108,
      108,
      47,
      115,
      116,
      97,
      116,
      117,
      115,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      84,
      69,
      83,
      84,
      0,
      0,
      0,
      0,
      114,
      117,
      110,
      0,
      0,
      0,
      0,
      0,
      112,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      98,
      108,
      111,
      99,
      107,
      95,
      115,
      116,
      97,
      114,
      116,
      0,
      0,
      0,
      0,
      0,
      91,
      99,
      124,
      102,
      124,
      115,
      93,
      0,
      88,
      77,
      83,
      58,
      0,
      0,
      0,
      0,
      83,
      84,
      68,
      0,
      0,
      0,
      0,
      0,
      83,
      101,
      116,
      32,
      116,
      104,
      101,
      32,
      108,
      111,
      103,
      32,
      108,
      101,
      118,
      101,
      108,
      32,
      116,
      111,
      32,
      101,
      114,
      114,
      111,
      114,
      32,
      91,
      110,
      111,
      93,
      0,
      111,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      99,
      111,
      110,
      102,
      105,
      103,
      95,
      105,
      100,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      100,
      114,
      105,
      118,
      101,
      61,
      37,
      117,
      32,
      118,
      99,
      104,
      115,
      61,
      37,
      108,
      117,
      47,
      37,
      108,
      117,
      47,
      37,
      108,
      117,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      99,
      112,
      117,
      46,
      115,
      112,
      101,
      101,
      100,
      46,
      115,
      116,
      101,
      112,
      0,
      0,
      0,
      0,
      0,
      0,
      111,
      117,
      116,
      112,
      117,
      116,
      32,
      97,
      32,
      98,
      121,
      116,
      101,
      32,
      111,
      114,
      32,
      119,
      111,
      114,
      100,
      32,
      116,
      111,
      32,
      97,
      32,
      112,
      111,
      114,
      116,
      0,
      67,
      76,
      68,
      0,
      0,
      0,
      0,
      0,
      99,
      112,
      117,
      46,
      109,
      111,
      100,
      101,
      108,
      32,
      61,
      32,
      34,
      0,
      0,
      0,
      113,
      117,
      105,
      101,
      116,
      0,
      0,
      0,
      115,
      119,
      105,
      116,
      99,
      104,
      101,
      115,
      48,
      61,
      48,
      120,
      37,
      48,
      50,
      88,
      32,
      115,
      119,
      105,
      116,
      99,
      104,
      101,
      115,
      49,
      61,
      48,
      120,
      37,
      48,
      50,
      88,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      73,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      115,
      101,
      99,
      116,
      111,
      114,
      115,
      0,
      118,
      105,
      115,
      105,
      98,
      108,
      101,
      95,
      115,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      91,
      98,
      124,
      119,
      93,
      32,
      112,
      111,
      114,
      116,
      32,
      118,
      97,
      108,
      0,
      0,
      83,
      84,
      73,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      99,
      111,
      109,
      109,
      105,
      116,
      32,
      101,
      114,
      114,
      111,
      114,
      32,
      102,
      111,
      114,
      32,
      100,
      114,
      105,
      118,
      101,
      32,
      37,
      117,
      10,
      0,
      0,
      83,
      101,
      116,
      32,
      116,
      104,
      101,
      32,
      67,
      80,
      85,
      32,
      109,
      111,
      100,
      101,
      108,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      101,
      120,
      105,
      116,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      116,
      101,
      114,
      109,
      46,
      115,
      99,
      114,
      101,
      101,
      110,
      115,
      104,
      111,
      116,
      0,
      117,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      100,
      114,
      105,
      118,
      101,
      49,
      0,
      0,
      118,
      105,
      115,
      105,
      98,
      108,
      101,
      95,
      104,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      70,
      52,
      0,
      0,
      0,
      0,
      0,
      0,
      124,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      125,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      72,
      65,
      76,
      84,
      61,
      49,
      10,
      0,
      115,
      101,
      116,
      32,
      105,
      110,
      116,
      101,
      114,
      114,
      117,
      112,
      116,
      32,
      110,
      32,
      108,
      111,
      103,
      32,
      101,
      120,
      112,
      114,
      101,
      115,
      115,
      105,
      111,
      110,
      32,
      116,
      111,
      32,
      101,
      120,
      112,
      114,
      0,
      0,
      58,
      32,
      0,
      0,
      0,
      0,
      0,
      0,
      108,
      111,
      97,
      100,
      0,
      0,
      0,
      0,
      102,
      105,
      108,
      101,
      61,
      37,
      115,
      32,
      102,
      111,
      114,
      109,
      97,
      116,
      61,
      98,
      105,
      110,
      97,
      114,
      121,
      32,
      97,
      100,
      100,
      114,
      61,
      48,
      120,
      37,
      48,
      56,
      108,
      120,
      10,
      0,
      0,
      0,
      0,
      0,
      97,
      115,
      112,
      101,
      99,
      116,
      95,
      120,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      115,
      105,
      122,
      101,
      109,
      0,
      0,
      0,
      100,
      114,
      105,
      118,
      101,
      0,
      0,
      0,
      37,
      115,
      58,
      32,
      117,
      110,
      107,
      110,
      111,
      119,
      110,
      32,
      111,
      112,
      116,
      105,
      111,
      110,
      32,
      40,
      45,
      37,
      99,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      37,
      115,
      32,
      91,
      37,
      115,
      93,
      10,
      0,
      0,
      0,
      0,
      98,
      58,
      32,
      117,
      110,
      107,
      110,
      111,
      119,
      110,
      32,
      99,
      111,
      109,
      109,
      97,
      110,
      100,
      0,
      0,
      0,
      0,
      0,
      0,
      102,
      97,
      108,
      115,
      101,
      0,
      0,
      0,
      115,
      100,
      108,
      0,
      0,
      0,
      0,
      0,
      114,
      101,
      115,
      101,
      116,
      32,
      112,
      99,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      67,
      76,
      73,
      0,
      0,
      0,
      0,
      0,
      116,
      100,
      48,
      58,
      32,
      99,
      114,
      99,
      32,
      101,
      114,
      114,
      111,
      114,
      32,
      97,
      116,
      32,
      115,
      101,
      99,
      116,
      111,
      114,
      32,
      37,
      117,
      47,
      37,
      117,
      47,
      37,
      117,
      32,
      40,
      110,
      111,
      32,
      100,
      97,
      116,
      97,
      41,
      10,
      0,
      0,
      0,
      0,
      99,
      111,
      109,
      109,
      105,
      116,
      0,
      0,
      32,
      37,
      48,
      50,
      88,
      0,
      0,
      0,
      99,
      112,
      117,
      0,
      0,
      0,
      0,
      0,
      46,
      105,
      109,
      97,
      0,
      0,
      0,
      0,
      45,
      45,
      0,
      0,
      0,
      0,
      0,
      0,
      112,
      116,
      121,
      0,
      0,
      0,
      0,
      0,
      120,
      100,
      105,
      118,
      0,
      0,
      0,
      0,
      113,
      101,
      100,
      58,
      32,
      117,
      110,
      107,
      110,
      111,
      119,
      110,
      32,
      102,
      101,
      97,
      116,
      117,
      114,
      101,
      115,
      32,
      40,
      48,
      120,
      37,
      48,
      56,
      108,
      108,
      120,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      100,
      105,
      115,
      107,
      32,
      37,
      117,
      58,
      32,
      119,
      114,
      105,
      116,
      105,
      110,
      103,
      32,
      98,
      97,
      99,
      107,
      32,
      102,
      100,
      99,
      32,
      105,
      109,
      97,
      103,
      101,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      121,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      100,
      114,
      105,
      118,
      101,
      48,
      0,
      0,
      118,
      105,
      115,
      105,
      98,
      108,
      101,
      95,
      99,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      105,
      110,
      105,
      116,
      32,
      100,
      114,
      105,
      118,
      101,
      32,
      37,
      117,
      32,
      40,
      99,
      61,
      37,
      117,
      32,
      104,
      61,
      37,
      117,
      32,
      115,
      61,
      37,
      117,
      32,
      114,
      99,
      61,
      37,
      117,
      32,
      119,
      112,
      61,
      37,
      117,
      32,
      101,
      99,
      99,
      61,
      37,
      117,
      32,
      115,
      105,
      122,
      101,
      61,
      37,
      108,
      117,
      46,
      37,
      117,
      75,
      41,
      10,
      0,
      86,
      73,
      68,
      69,
      79,
      58,
      0,
      0,
      86,
      71,
      65,
      32,
      105,
      111,
      61,
      48,
      120,
      37,
      48,
      52,
      108,
      120,
      32,
      97,
      100,
      100,
      114,
      61,
      48,
      120,
      37,
      48,
      53,
      108,
      120,
      10,
      0,
      0,
      0,
      0,
      86,
      73,
      68,
      69,
      79,
      58,
      0,
      0,
      105,
      110,
      116,
      32,
      110,
      32,
      91,
      101,
      120,
      112,
      114,
      93,
      0,
      0,
      0,
      0,
      83,
      84,
      67,
      0,
      0,
      0,
      0,
      0,
      99,
      111,
      109,
      109,
      105,
      116,
      105,
      110,
      103,
      32,
      100,
      114,
      105,
      118,
      101,
      32,
      37,
      117,
      10,
      0,
      0,
      0,
      0,
      0,
      83,
      101,
      116,
      32,
      116,
      104,
      101,
      32,
      108,
      111,
      103,
      32,
      102,
      105,
      108,
      101,
      32,
      110,
      97,
      109,
      101,
      32,
      91,
      110,
      111,
      110,
      101,
      93,
      0,
      0,
      0,
      0,
      116,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      104,
      100,
      99,
      0,
      0,
      0,
      0,
      0,
      108,
      105,
      115,
      116,
      32,
      105,
      110,
      116,
      101,
      114,
      114,
      117,
      112,
      116,
      32,
      108,
      111,
      103,
      32,
      101,
      120,
      112,
      114,
      101,
      115,
      115,
      105,
      111,
      110,
      115,
      0,
      0,
      46,
      99,
      97,
      115,
      0,
      0,
      0,
      0,
      98,
      108,
      105,
      110,
      107,
      0,
      0,
      0,
      98,
      108,
      105,
      110,
      107,
      0,
      0,
      0,
      67,
      76,
      67,
      0,
      0,
      0,
      0,
      0,
      99,
      111,
      108,
      111,
      114,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      99,
      111,
      109,
      109,
      105,
      116,
      32,
      101,
      114,
      114,
      111,
      114,
      58,
      32,
      98,
      97,
      100,
      32,
      100,
      114,
      105,
      118,
      101,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      108,
      111,
      103,
      0,
      0,
      0,
      0,
      0,
      98,
      108,
      105,
      110,
      107,
      0,
      0,
      0,
      114,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      117,
      110,
      107,
      110,
      111,
      119,
      110,
      32,
      85,
      65,
      82,
      84,
      32,
      99,
      104,
      105,
      112,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      108,
      111,
      97,
      100,
      105,
      110,
      103,
      32,
      100,
      114,
      105,
      118,
      101,
      32,
      48,
      120,
      37,
      48,
      50,
      120,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      32,
      40,
      99,
      111,
      119,
      41,
      10,
      0,
      0,
      102,
      111,
      110,
      116,
      0,
      0,
      0,
      0,
      105,
      110,
      116,
      32,
      108,
      0,
      0,
      0,
      83,
      80,
      0,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      99,
      111,
      109,
      109,
      105,
      116,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      32,
      102,
      111,
      114,
      32,
      97,
      116,
      32,
      108,
      101,
      97,
      115,
      116,
      32,
      111,
      110,
      101,
      32,
      100,
      105,
      115,
      107,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      65,
      100,
      100,
      32,
      97,
      110,
      32,
      105,
      110,
      105,
      32,
      115,
      116,
      114,
      105,
      110,
      103,
      32,
      97,
      102,
      116,
      101,
      114,
      32,
      116,
      104,
      101,
      32,
      99,
      111,
      110,
      102,
      105,
      103,
      32,
      102,
      105,
      108,
      101,
      0,
      101,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      99,
      97,
      110,
      39,
      116,
      32,
      111,
      112,
      101,
      110,
      32,
      108,
      111,
      103,
      32,
      102,
      105,
      108,
      101,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      0,
      115,
      105,
      109,
      117,
      108,
      97,
      116,
      101,
      32,
      112,
      114,
      101,
      115,
      115,
      105,
      110,
      103,
      32,
      111,
      114,
      32,
      114,
      101,
      108,
      101,
      97,
      115,
      105,
      110,
      103,
      32,
      107,
      101,
      121,
      115,
      0,
      0,
      0,
      0,
      0,
      68,
      88,
      0,
      0,
      0,
      0,
      0,
      0,
      99,
      111,
      109,
      109,
      105,
      116,
      105,
      110,
      103,
      32,
      97,
      108,
      108,
      32,
      100,
      114,
      105,
      118,
      101,
      115,
      10,
      0,
      0,
      0,
      105,
      110,
      105,
      45,
      97,
      112,
      112,
      101,
      110,
      100,
      0,
      0,
      0,
      0,
      0,
      0,
      119,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      115,
      101,
      114,
      105,
      97,
      108,
      32,
      112,
      111,
      114,
      116,
      32,
      115,
      101,
      116,
      117,
      112,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      32,
      91,
      37,
      48,
      52,
      88,
      47,
      37,
      117,
      32,
      45,
      62,
      32,
      37,
      115,
      93,
      10,
      0,
      0,
      0,
      114,
      119,
      0,
      0,
      0,
      0,
      0,
      0,
      91,
      91,
      43,
      124,
      45,
      93,
      107,
      101,
      121,
      46,
      46,
      46,
      93,
      0,
      0,
      0,
      67,
      88,
      0,
      0,
      0,
      0,
      0,
      0,
      97,
      108,
      108,
      0,
      0,
      0,
      0,
      0,
      99,
      115,
      0,
      0,
      0,
      0,
      0,
      0,
      65,
      100,
      100,
      32,
      97,
      110,
      32,
      105,
      110,
      105,
      32,
      115,
      116,
      114,
      105,
      110,
      103,
      32,
      98,
      101,
      102,
      111,
      114,
      101,
      32,
      116,
      104,
      101,
      32,
      99,
      111,
      110,
      102,
      105,
      103,
      32,
      102,
      105,
      108,
      101,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      113,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      67,
      79,
      77,
      37,
      117,
      32,
      100,
      114,
      105,
      118,
      101,
      114,
      61,
      37,
      115,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      114,
      111,
      0,
      0,
      0,
      0,
      0,
      0,
      69,
      77,
      83,
      58,
      0,
      0,
      0,
      0,
      105,
      110,
      112,
      117,
      116,
      32,
      97,
      32,
      98,
      121,
      116,
      101,
      32,
      111,
      114,
      32,
      119,
      111,
      114,
      100,
      32,
      102,
      114,
      111,
      109,
      32,
      97,
      32,
      112,
      111,
      114,
      116,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      65,
      88,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      106,
      101,
      99,
      116,
      105,
      110,
      103,
      32,
      100,
      114,
      105,
      118,
      101,
      32,
      37,
      108,
      117,
      10,
      0,
      0,
      0,
      0,
      0,
      105,
      110,
      105,
      45,
      112,
      114,
      101,
      102,
      105,
      120,
      0,
      0,
      0,
      0,
      0,
      0,
      84,
      97,
      98,
      0,
      0,
      0,
      0,
      0,
      67,
      79,
      77,
      37,
      117,
      32,
      97,
      100,
      100,
      114,
      61,
      48,
      120,
      37,
      48,
      52,
      108,
      120,
      32,
      105,
      114,
      113,
      61,
      37,
      117,
      32,
      109,
      117,
      108,
      116,
      105,
      99,
      104,
      97,
      114,
      61,
      114,
      61,
      37,
      117,
      47,
      119,
      61,
      37,
      117,
      32,
      117,
      97,
      114,
      116,
      61,
      37,
      115,
      10,
      0,
      0,
      100,
      114,
      105,
      118,
      101,
      61,
      37,
      117,
      32,
      116,
      121,
      112,
      101,
      61,
      37,
      115,
      32,
      98,
      108,
      111,
      99,
      107,
      115,
      61,
      37,
      108,
      117,
      32,
      99,
      104,
      115,
      61,
      37,
      108,
      117,
      47,
      37,
      108,
      117,
      47,
      37,
      108,
      117,
      32,
      37,
      115,
      32,
      102,
      105,
      108,
      101,
      61,
      37,
      115,
      10,
      0,
      67,
      65,
      76,
      76,
      70,
      0,
      0,
      0,
      91,
      98,
      124,
      119,
      93,
      32,
      112,
      111,
      114,
      116,
      0,
      0,
      0,
      0,
      0,
      0,
      91,
      37,
      48,
      52,
      88,
      58,
      37,
      48,
      52,
      88,
      93,
      32,
      0,
      0,
      0,
      0,
      104,
      109,
      97,
      0,
      0,
      0,
      0,
      0,
      66,
      72,
      0,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      100,
      105,
      115,
      107,
      32,
      101,
      106,
      101,
      99,
      116,
      32,
      101,
      114,
      114,
      111,
      114,
      58,
      32,
      110,
      111,
      32,
      115,
      117,
      99,
      104,
      32,
      100,
      105,
      115,
      107,
      32,
      40,
      37,
      108,
      117,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      83,
      101,
      116,
      32,
      116,
      104,
      101,
      32,
      118,
      105,
      100,
      101,
      111,
      32,
      100,
      101,
      118,
      105,
      99,
      101,
      0,
      0,
      0,
      0,
      66,
      97,
      99,
      107,
      115,
      112,
      97,
      99,
      101,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      83,
      69,
      82,
      80,
      79,
      82,
      84,
      58,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      108,
      111,
      97,
      100,
      105,
      110,
      103,
      32,
      100,
      114,
      105,
      118,
      101,
      32,
      48,
      120,
      37,
      48,
      50,
      120,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      99,
      112,
      117,
      46,
      115,
      112,
      101,
      101,
      100,
      0,
      0,
      0,
      112,
      114,
      105,
      110,
      116,
      32,
      104,
      101,
      108,
      112,
      32,
      111,
      110,
      32,
      109,
      101,
      115,
      115,
      97,
      103,
      101,
      115,
      0,
      0,
      68,
      72,
      0,
      0,
      0,
      0,
      0,
      0,
      37,
      115,
      58,
      32,
      101,
      114,
      114,
      111,
      114,
      32,
      112,
      97,
      114,
      115,
      105,
      110,
      103,
      32,
      105,
      110,
      105,
      32,
      115,
      116,
      114,
      105,
      110,
      103,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      100,
      105,
      115,
      107,
      32,
      101,
      106,
      101,
      99,
      116,
      32,
      101,
      114,
      114,
      111,
      114,
      58,
      32,
      98,
      97,
      100,
      32,
      100,
      114,
      105,
      118,
      101,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      0,
      118,
      105,
      100,
      101,
      111,
      0,
      0,
      0,
      77,
      50,
      52,
      58,
      0,
      0,
      0,
      0,
      61,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      108,
      111,
      103,
      0,
      0,
      0,
      0,
      0,
      116,
      101,
      108,
      101,
      100,
      105,
      115,
      107,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      114,
      117,
      110,
      0,
      0,
      0,
      0,
      0,
      109,
      50,
      52,
      0,
      0,
      0,
      0,
      0,
      67,
      72,
      0,
      0,
      0,
      0,
      0,
      0,
      68,
      105,
      115,
      97,
      98,
      108,
      105,
      110,
      103,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      65,
      100,
      100,
      32,
      97,
      32,
      100,
      105,
      114,
      101,
      99,
      116,
      111,
      114,
      121,
      32,
      116,
      111,
      32,
      116,
      104,
      101,
      32,
      115,
      101,
      97,
      114,
      99,
      104,
      32,
      112,
      97,
      116,
      104,
      0,
      0,
      0,
      0,
      0,
      0,
      107,
      101,
      121,
      109,
      97,
      112,
      0,
      0,
      116,
      101,
      114,
      109,
      46,
      101,
      115,
      99,
      97,
      112,
      101,
      0,
      0,
      0,
      0,
      0,
      69,
      113,
      117,
      97,
      108,
      0,
      0,
      0,
      109,
      117,
      108,
      116,
      105,
      99,
      104,
      97,
      114,
      95,
      119,
      114,
      105,
      116,
      101,
      0,
      112,
      102,
      100,
      99,
      45,
      97,
      117,
      116,
      111,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      70,
      51,
      0,
      0,
      0,
      0,
      0,
      0,
      38,
      38,
      0,
      0,
      0,
      0,
      0,
      0,
      37,
      115,
      32,
      123,
      10,
      0,
      0,
      0,
      37,
      115,
      58,
      37,
      108,
      117,
      58,
      32,
      37,
      115,
      0,
      0,
      0,
      0,
      0,
      0,
      32,
      32,
      73,
      37,
      99,
      32,
      68,
      37,
      99,
      32,
      79,
      37,
      99,
      32,
      83,
      37,
      99,
      32,
      90,
      37,
      99,
      32,
      65,
      37,
      99,
      32,
      80,
      37,
      99,
      32,
      67,
      37,
      99,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      102,
      105,
      108,
      101,
      61,
      37,
      115,
      32,
      102,
      111,
      114,
      109,
      97,
      116,
      61,
      115,
      114,
      101,
      99,
      10,
      0,
      0,
      0,
      0,
      101,
      115,
      99,
      97,
      112,
      101,
      0,
      0,
      98,
      97,
      115,
      101,
      0,
      0,
      0,
      0,
      100,
      114,
      105,
      118,
      101,
      61,
      37,
      117,
      32,
      116,
      121,
      112,
      101,
      61,
      99,
      111,
      119,
      32,
      102,
      105,
      108,
      101,
      61,
      37,
      115,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
    ])
    .concat([
      37,
      115,
      58,
      32,
      109,
      105,
      115,
      115,
      105,
      110,
      103,
      32,
      111,
      112,
      116,
      105,
      111,
      110,
      32,
      97,
      114,
      103,
      117,
      109,
      101,
      110,
      116,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      99,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      48,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      119,
      97,
      118,
      0,
      0,
      0,
      0,
      0,
      112,
      97,
      116,
      99,
      104,
      105,
      110,
      103,
      32,
      116,
      104,
      101,
      32,
      98,
      105,
      111,
      115,
      32,
      40,
      48,
      120,
      37,
      48,
      52,
      120,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      65,
      72,
      0,
      0,
      0,
      0,
      0,
      0,
      116,
      100,
      48,
      58,
      32,
      116,
      114,
      97,
      99,
      107,
      32,
      99,
      114,
      99,
      32,
      40,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      52,
      88,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      100,
      99,
      52,
      50,
      58,
      32,
      116,
      97,
      103,
      32,
      99,
      104,
      101,
      99,
      107,
      115,
      117,
      109,
      32,
      101,
      114,
      114,
      111,
      114,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      69,
      110,
      97,
      98,
      108,
      105,
      110,
      103,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      46,
      105,
      109,
      97,
      103,
      101,
      0,
      0,
      119,
      98,
      0,
      0,
      0,
      0,
      0,
      0,
      112,
      97,
      116,
      104,
      0,
      0,
      0,
      0,
      45,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      115,
      101,
      114,
      99,
      111,
      110,
      0,
      0,
      120,
      109,
      117,
      108,
      0,
      0,
      0,
      0,
      99,
      111,
      109,
      109,
      105,
      116,
      0,
      0,
      99,
      111,
      109,
      109,
      105,
      116,
      0,
      0,
      99,
      111,
      109,
      109,
      105,
      116,
      0,
      0,
      45,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      48,
      98,
      0,
      0,
      0,
      0,
      0,
      0,
      109,
      117,
      108,
      116,
      105,
      99,
      104,
      97,
      114,
      95,
      114,
      101,
      97,
      100,
      0,
      0,
      112,
      102,
      100,
      99,
      0,
      0,
      0,
      0,
      115,
      101,
      116,
      32,
      109,
      111,
      100,
      101,
      32,
      100,
      114,
      105,
      118,
      101,
      32,
      37,
      117,
      32,
      40,
      99,
      61,
      37,
      117,
      32,
      104,
      61,
      37,
      117,
      32,
      115,
      61,
      37,
      117,
      32,
      114,
      99,
      61,
      37,
      117,
      32,
      119,
      112,
      61,
      37,
      117,
      32,
      101,
      99,
      99,
      61,
      37,
      117,
      32,
      115,
      114,
      61,
      37,
      117,
      32,
      115,
      105,
      122,
      101,
      61,
      37,
      108,
      117,
      46,
      37,
      117,
      75,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      98,
      108,
      105,
      110,
      107,
      0,
      0,
      0,
      86,
      73,
      68,
      69,
      79,
      58,
      0,
      0,
      98,
      108,
      105,
      110,
      107,
      0,
      0,
      0,
      114,
      117,
      110,
      32,
      117,
      110,
      116,
      105,
      108,
      32,
      67,
      83,
      32,
      99,
      104,
      97,
      110,
      103,
      101,
      115,
      0,
      0,
      0,
      0,
      114,
      101,
      115,
      101,
      116,
      32,
      107,
      101,
      121,
      98,
      111,
      97,
      114,
      100,
      10,
      0,
      66,
      76,
      0,
      0,
      0,
      0,
      0,
      0,
      37,
      115,
      32,
      116,
      104,
      101,
      32,
      70,
      68,
      67,
      32,
      97,
      99,
      99,
      117,
      114,
      97,
      116,
      101,
      32,
      109,
      111,
      100,
      101,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      83,
      101,
      116,
      32,
      116,
      104,
      101,
      32,
      99,
      111,
      110,
      102,
      105,
      103,
      32,
      102,
      105,
      108,
      101,
      32,
      110,
      97,
      109,
      101,
      32,
      91,
      110,
      111,
      110,
      101,
      93,
      0,
      77,
      105,
      110,
      117,
      115,
      0,
      0,
      0,
      48,
      120,
      0,
      0,
      0,
      0,
      0,
      0,
      109,
      117,
      108,
      116,
      105,
      99,
      104,
      97,
      114,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      105,
      109,
      100,
      0,
      0,
      0,
      0,
      0,
      102,
      97,
      114,
      0,
      0,
      0,
      0,
      0,
      46,
      114,
      97,
      119,
      0,
      0,
      0,
      0,
      115,
      105,
      122,
      101,
      0,
      0,
      0,
      0,
      115,
      105,
      122,
      101,
      0,
      0,
      0,
      0,
      68,
      76,
      0,
      0,
      0,
      0,
      0,
      0,
      98,
      108,
      105,
      110,
      107,
      0,
      0,
      0,
      32,
      9,
      0,
      0,
      0,
      0,
      0,
      0,
      115,
      116,
      114,
      105,
      110,
      103,
      0,
      0,
      115,
      119,
      105,
      116,
      99,
      104,
      101,
      115,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      48,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      102,
      97,
      108,
      115,
      101,
      0,
      0,
      0,
      56,
      50,
      53,
      48,
      0,
      0,
      0,
      0,
      105,
      109,
      97,
      103,
      101,
      100,
      105,
      115,
      107,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      115,
      105,
      122,
      101,
      0,
      0,
      0,
      0,
      114,
      117,
      110,
      32,
      119,
      105,
      116,
      104,
      32,
      98,
      114,
      101,
      97,
      107,
      112,
      111,
      105,
      110,
      116,
      115,
      0,
      0,
      0,
      0,
      67,
      76,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      56,
      50,
      53,
      57,
      58,
      32,
      115,
      112,
      101,
      99,
      105,
      97,
      108,
      32,
      109,
      97,
      115,
      107,
      32,
      109,
      111,
      100,
      101,
      32,
      101,
      110,
      97,
      98,
      108,
      101,
      100,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      58,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      99,
      111,
      110,
      102,
      105,
      103,
      0,
      0,
      57,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      116,
      114,
      117,
      101,
      0,
      0,
      0,
      0,
      117,
      97,
      114,
      116,
      0,
      0,
      0,
      0,
      100,
      99,
      52,
      50,
      0,
      0,
      0,
      0,
      91,
      97,
      100,
      100,
      114,
      46,
      46,
      46,
      93,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      56,
      50,
      53,
      48,
      58,
      32,
      111,
      118,
      101,
      114,
      119,
      114,
      105,
      116,
      101,
      32,
      116,
      120,
      100,
      32,
      32,
      116,
      120,
      100,
      61,
      37,
      48,
      50,
      88,
      32,
      108,
      115,
      114,
      61,
      37,
      48,
      50,
      88,
      32,
      105,
      105,
      114,
      61,
      37,
      48,
      50,
      88,
      32,
      118,
      97,
      108,
      61,
      37,
      48,
      50,
      88,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      65,
      76,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      110,
      100,
      0,
      0,
      0,
      0,
      0,
      83,
      101,
      116,
      32,
      116,
      104,
      101,
      32,
      98,
      111,
      111,
      116,
      32,
      100,
      114,
      105,
      118,
      101,
      0,
      0,
      0,
      0,
      0,
      0,
      56,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      100,
      101,
      102,
      105,
      110,
      101,
      100,
      0,
      105,
      114,
      113,
      0,
      0,
      0,
      0,
      0,
      99,
      112,
      50,
      0,
      0,
      0,
      0,
      0,
      103,
      98,
      0,
      0,
      0,
      0,
      0,
      0,
      66,
      80,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      116,
      97,
      112,
      101,
      46,
      115,
      116,
      97,
      116,
      101,
      0,
      0,
      101,
      115,
      0,
      0,
      0,
      0,
      0,
      0,
      105,
      110,
      116,
      0,
      0,
      0,
      0,
      0,
      43,
      49,
      0,
      0,
      0,
      0,
      0,
      0,
      55,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      41,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      105,
      111,
      0,
      0,
      0,
      0,
      0,
      0,
      97,
      110,
      97,
      100,
      105,
      115,
      107,
      0,
      115,
      101,
      103,
      109,
      101,
      110,
      116,
      0,
      99,
      108,
      111,
      99,
      107,
      32,
      91,
      49,
      93,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      66,
      88,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      116,
      97,
      112,
      101,
      46,
      115,
      97,
      118,
      101,
      0,
      0,
      0,
      98,
      111,
      111,
      116,
      0,
      0,
      0,
      0,
      45,
      49,
      0,
      0,
      0,
      0,
      0,
      0,
      54,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      40,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      115,
      101,
      114,
      105,
      97,
      108,
      0,
      0,
      112,
      97,
      114,
      116,
      105,
      116,
      105,
      111,
      110,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      32,
      32,
      0,
      0,
      0,
      0,
      0,
      0,
      91,
      99,
      110,
      116,
      93,
      0,
      0,
      0,
      67,
      65,
      76,
      76,
      0,
      0,
      0,
      0,
      117,
      109,
      98,
      95,
      115,
      101,
      103,
      109,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      68,
      73,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      116,
      97,
      112,
      101,
      46,
      114,
      101,
      119,
      105,
      110,
      100,
      0,
      80,
      114,
      105,
      110,
      116,
      32,
      117,
      115,
      97,
      103,
      101,
      32,
      105,
      110,
      102,
      111,
      114,
      109,
      97,
      116,
      105,
      111,
      110,
      0,
      101,
      109,
      117,
      46,
      99,
      112,
      117,
      46,
      115,
      112,
      101,
      101,
      100,
      46,
      115,
      116,
      101,
      112,
      0,
      0,
      0,
      0,
      0,
      0,
      53,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      99,
      97,
      110,
      39,
      116,
      32,
      111,
      112,
      101,
      110,
      32,
      100,
      114,
      105,
      118,
      101,
      114,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      113,
      101,
      100,
      0,
      0,
      0,
      0,
      0,
      32,
      32,
      32,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      99,
      112,
      117,
      46,
      109,
      111,
      100,
      101,
      108,
      0,
      0,
      0,
      115,
      101,
      116,
      32,
      116,
      104,
      101,
      32,
      98,
      111,
      111,
      116,
      32,
      100,
      114,
      105,
      118,
      101,
      0,
      0,
      0,
      0,
      0,
      0,
      83,
      73,
      0,
      0,
      0,
      0,
      0,
      0,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      102,
      117,
      108,
      108,
      115,
      99,
      114,
      101,
      101,
      110,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      116,
      97,
      112,
      101,
      46,
      112,
      99,
      109,
      0,
      0,
      0,
      0,
      104,
      101,
      108,
      112,
      0,
      0,
      0,
      0,
      115,
      119,
      105,
      116,
      99,
      104,
      101,
      115,
      49,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      114,
      101,
      115,
      101,
      116,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      52,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      33,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      112,
      97,
      114,
      112,
      111,
      114,
      116,
      32,
      37,
      117,
      32,
      115,
      101,
      116,
      117,
      112,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      10,
      0,
      0,
      0,
      0,
      112,
      99,
      101,
      0,
      0,
      0,
      0,
      0,
      32,
      37,
      48,
      50,
      88,
      0,
      0,
      0,
      107,
      101,
      121,
      98,
      111,
      97,
      114,
      100,
      32,
      98,
      117,
      102,
      102,
      101,
      114,
      32,
      111,
      118,
      101,
      114,
      102,
      108,
      111,
      119,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      91,
      100,
      114,
      105,
      118,
      101,
      93,
      0,
      101,
      109,
      117,
      46,
      118,
      105,
      100,
      101,
      111,
      46,
      98,
      108,
      105,
      110,
      107,
      0,
      112,
      99,
      101,
      37,
      48,
      52,
      117,
      46,
      112,
      112,
      109,
      0,
      0,
      0,
      0,
      0,
      66,
      80,
      43,
      68,
      73,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      116,
      97,
      112,
      101,
      46,
      108,
      111,
      97,
      100,
      0,
      0,
      0,
      117,
      115,
      97,
      103,
      101,
      58,
      32,
      112,
      99,
      101,
      45,
      105,
      98,
      109,
      112,
      99,
      32,
      91,
      111,
      112,
      116,
      105,
      111,
      110,
      115,
      93,
      0,
      0,
      0,
      0,
      0,
      0,
      114,
      101,
      112,
      111,
      114,
      116,
      95,
      107,
      101,
      121,
      115,
      0,
      0,
      0,
      0,
      0,
      80,
      54,
      10,
      37,
      117,
      32,
      37,
      117,
      10,
      37,
      117,
      10,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      112,
      97,
      117,
      115,
      101,
      46,
      116,
      111,
      103,
      103,
      108,
      101,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      51,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      126,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      110,
      111,
      32,
      116,
      101,
      114,
      109,
      105,
      110,
      97,
      108,
      32,
      102,
      111,
      117,
      110,
      100,
      10,
      0,
      0,
      60,
      110,
      111,
      110,
      101,
      62,
      0,
      0,
      100,
      111,
      115,
      101,
      109,
      117,
      0,
      0,
      70,
      50,
      0,
      0,
      0,
      0,
      0,
      0,
      60,
      45,
      0,
      0,
      0,
      0,
      0,
      0,
      99,
      111,
      109,
      109,
      105,
      116,
      0,
      0,
      124,
      124,
      0,
      0,
      0,
      0,
      0,
      0,
      112,
      97,
      116,
      99,
      104,
      105,
      110,
      103,
      32,
      105,
      110,
      116,
      32,
      49,
      57,
      32,
      40,
      48,
      120,
      37,
      48,
      52,
      120,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      93,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      60,
      110,
      111,
      110,
      101,
      62,
      0,
      0,
      32,
      9,
      0,
      0,
      0,
      0,
      0,
      0,
      37,
      45,
      57,
      115,
      32,
      0,
      0,
      0,
      102,
      105,
      108,
      101,
      61,
      37,
      115,
      32,
      102,
      111,
      114,
      109,
      97,
      116,
      61,
      105,
      104,
      101,
      120,
      10,
      0,
      0,
      0,
      0,
      67,
      83,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      68,
      83,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      69,
      83,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      83,
      83,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      73,
      80,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      70,
      32,
      61,
      37,
      48,
      52,
      88,
      0,
      0,
      0,
      0,
      110,
      117,
      108,
      108,
      0,
      0,
      0,
      0,
      97,
      100,
      100,
      114,
      101,
      115,
      115,
      0,
      42,
      42,
      42,
      32,
      99,
      111,
      119,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      32,
      40,
      100,
      114,
      105,
      118,
      101,
      61,
      37,
      117,
      32,
      102,
      105,
      108,
      101,
      61,
      37,
      115,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      37,
      115,
      58,
      32,
      117,
      110,
      107,
      110,
      111,
      119,
      110,
      32,
      111,
      112,
      116,
      105,
      111,
      110,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      100,
      105,
      0,
      0,
      0,
      0,
      0,
      0,
      115,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      121,
      101,
      115,
      0,
      0,
      0,
      0,
      0,
      110,
      117,
      108,
      108,
      0,
      0,
      0,
      0,
      115,
      116,
      100,
      105,
      111,
      58,
      102,
      105,
      108,
      101,
      61,
      0,
      0,
      0,
      0,
      0,
      116,
      100,
      48,
      58,
      32,
      104,
      101,
      97,
      100,
      101,
      114,
      32,
      99,
      114,
      99,
      32,
      40,
      37,
      48,
      52,
      88,
      32,
      37,
      48,
      52,
      88,
      41,
      10,
      0,
      0,
      0,
      0,
      66,
      80,
      43,
      83,
      73,
      0,
      0,
      0,
      109,
      102,
      109,
      0,
      0,
      0,
      0,
      0,
      112,
      102,
      100,
      99,
      58,
      32,
      117,
      110,
      107,
      110,
      111,
      119,
      110,
      32,
      118,
      101,
      114,
      115,
      105,
      111,
      110,
      32,
      40,
      37,
      108,
      117,
      41,
      10,
      0,
      0,
      0,
      0,
      50,
      48,
      49,
      51,
      48,
      53,
      48,
      56,
      45,
      51,
      55,
      101,
      54,
      98,
      55,
      56,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      100,
      99,
      52,
      50,
      58,
      32,
      100,
      97,
      116,
      97,
      32,
      99,
      104,
      101,
      99,
      107,
      115,
      117,
      109,
      32,
      101,
      114,
      114,
      111,
      114,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      32,
      45,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      116,
      97,
      112,
      101,
      46,
      102,
      105,
      108,
      101,
      0,
      0,
      0,
      46,
      99,
      112,
      50,
      0,
      0,
      0,
      0,
      45,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      99,
      104,
      97,
      114,
      45,
      112,
      116,
      121,
      58,
      32,
      37,
      115,
      10,
      0,
      0,
      0,
      112,
      99,
      101,
      45,
      105,
      98,
      109,
      112,
      99,
      58,
      32,
      73,
      66,
      77,
      32,
      80,
      67,
      32,
      53,
      49,
      53,
      48,
      32,
      101,
      109,
      117,
      108,
      97,
      116,
      111,
      114,
      0,
      119,
      114,
      105,
      116,
      101,
      0,
      0,
      0,
      69,
      83,
      67,
      0,
      0,
      0,
      0,
      0,
      112,
      111,
      115,
      105,
      120,
      0,
      0,
      0,
      114,
      98,
      0,
      0,
      0,
      0,
      0,
      0,
      109,
      115,
      121,
      115,
      0,
      0,
      0,
      0,
      119,
      98,
      0,
      0,
      0,
      0,
      0,
      0,
      114,
      43,
      98,
      0,
      0,
      0,
      0,
      0,
      114,
      98,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      115,
      116,
      111,
      112,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      50,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      37,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      114,
      43,
      98,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      117,
      110,
      107,
      110,
      111,
      119,
      110,
      32,
      116,
      101,
      114,
      109,
      105,
      110,
      97,
      108,
      32,
      100,
      114,
      105,
      118,
      101,
      114,
      58,
      32,
      37,
      115,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      105,
      109,
      97,
      103,
      101,
      0,
      0,
      0,
      76,
      80,
      84,
      37,
      117,
      32,
      97,
      100,
      100,
      114,
      61,
      48,
      120,
      37,
      48,
      52,
      108,
      120,
      32,
      100,
      114,
      105,
      118,
      101,
      114,
      61,
      37,
      115,
      10,
      0,
      0,
      0,
      45,
      62,
      0,
      0,
      0,
      0,
      0,
      0,
      72,
      68,
      67,
      58,
      0,
      0,
      0,
      0,
      115,
      105,
      122,
      101,
      0,
      0,
      0,
      0,
      98,
      108,
      105,
      110,
      107,
      0,
      0,
      0,
      115,
      105,
      122,
      101,
      0,
      0,
      0,
      0,
      37,
      48,
      52,
      88,
      58,
      37,
      48,
      52,
      88,
      58,
      32,
      105,
      110,
      116,
      32,
      37,
      48,
      50,
      88,
      32,
      91,
      65,
      88,
      61,
      37,
      48,
      52,
      88,
      32,
      66,
      88,
      61,
      37,
      48,
      52,
      88,
      32,
      67,
      88,
      61,
      37,
      48,
      52,
      88,
      32,
      68,
      88,
      61,
      37,
      48,
      52,
      88,
      32,
      68,
      83,
      61,
      37,
      48,
      52,
      88,
      32,
      69,
      83,
      61,
      37,
      48,
      52,
      88,
      93,
      10,
      0,
      0,
      37,
      48,
      50,
      88,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      118,
      105,
      100,
      101,
      111,
      46,
      98,
      108,
      105,
      110,
      107,
      0,
      101,
      109,
      117,
      46,
      118,
      105,
      100,
      101,
      111,
      46,
      98,
      108,
      105,
      110,
      107,
      0,
      63,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      35,
      32,
      71,
      101,
      110,
      101,
      114,
      97,
      116,
      101,
      100,
      32,
      97,
      117,
      116,
      111,
      109,
      97,
      116,
      105,
      99,
      97,
      108,
      108,
      121,
      32,
      98,
      121,
      32,
      108,
      105,
      98,
      105,
      110,
      105,
      10,
      10,
      0,
      0,
      0,
      115,
      105,
      0,
      0,
      0,
      0,
      0,
      0,
      66,
      88,
      43,
      68,
      73,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      116,
      97,
      112,
      101,
      46,
      102,
      105,
      108,
      116,
      101,
      114,
      0,
      112,
      99,
      101,
      45,
      105,
      98,
      109,
      112,
      99,
      32,
      118,
      101,
      114,
      115,
      105,
      111,
      110,
      32,
      50,
      48,
      49,
      51,
      48,
      53,
      48,
      56,
      45,
      51,
      55,
      101,
      54,
      98,
      55,
      56,
      10,
      10,
      67,
      111,
      112,
      121,
      114,
      105,
      103,
      104,
      116,
      32,
      40,
      67,
      41,
      32,
      49,
      57,
      57,
      53,
      45,
      50,
      48,
      49,
      50,
      32,
      72,
      97,
      109,
      112,
      97,
      32,
      72,
      117,
      103,
      32,
      60,
      104,
      97,
      109,
      112,
      97,
      64,
      104,
      97,
      109,
      112,
      97,
      46,
      99,
      104,
      62,
      10,
      0,
      116,
      101,
      114,
      109,
      46,
      103,
      114,
      97,
      98,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      49,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      47,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      115,
      101,
      116,
      116,
      105,
      110,
      103,
      32,
      117,
      112,
      32,
      110,
      117,
      108,
      108,
      32,
      116,
      101,
      114,
      109,
      105,
      110,
      97,
      108,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      10,
      0,
      0,
      0,
      0,
      114,
      97,
      109,
      0,
      0,
      0,
      0,
      0,
      80,
      65,
      82,
      80,
      79,
      82,
      84,
      58,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      37,
      115,
      32,
      37,
      48,
      50,
      88,
      0,
      114,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      37,
      48,
      52,
      88,
      58,
      37,
      48,
      52,
      88,
      58,
      32,
      117,
      110,
      100,
      101,
      102,
      105,
      110,
      101,
      100,
      32,
      111,
      112,
      101,
      114,
      97,
      116,
      105,
      111,
      110,
      32,
      91,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      50,
      120,
      93,
      10,
      0,
      0,
      0,
      0,
      0,
      46,
      112,
      99,
      109,
      0,
      0,
      0,
      0,
      93,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      97,
      100,
      100,
      114,
      101,
      115,
      115,
      0,
      101,
      109,
      117,
      46,
      118,
      105,
      100,
      101,
      111,
      46,
      98,
      108,
      105,
      110,
      107,
      0,
      93,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      112,
      97,
      114,
      115,
      101,
      32,
      101,
      114,
      114,
      111,
      114,
      32,
      98,
      101,
      102,
      111,
      114,
      101,
      0,
      0,
      0,
      0,
      0,
      0,
      97,
      100,
      100,
      114,
      101,
      115,
      115,
      0,
      98,
      112,
      0,
      0,
      0,
      0,
      0,
      0,
      114,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      66,
      88,
      43,
      83,
      73,
      0,
      0,
      0,
      97,
      100,
      100,
      114,
      101,
      115,
      115,
      0,
      101,
      109,
      117,
      46,
      116,
      97,
      112,
      101,
      46,
      97,
      112,
      112,
      101,
      110,
      100,
      0,
      116,
      114,
      117,
      101,
      0,
      0,
      0,
      0,
      112,
      99,
      101,
      45,
      105,
      98,
      109,
      112,
      99,
      32,
      118,
      101,
      114,
      115,
      105,
      111,
      110,
      32,
      50,
      48,
      49,
      51,
      48,
      53,
      48,
      56,
      45,
      51,
      55,
      101,
      54,
      98,
      55,
      56,
      10,
      67,
      111,
      112,
      121,
      114,
      105,
      103,
      104,
      116,
      32,
      40,
      67,
      41,
      32,
      49,
      57,
      57,
      53,
      45,
      50,
      48,
      49,
      50,
      32,
      72,
      97,
      109,
      112,
      97,
      32,
      72,
      117,
      103,
      32,
      60,
      104,
      97,
      109,
      112,
      97,
      64,
      104,
      97,
      109,
      112,
      97,
      46,
      99,
      104,
      62,
      10,
      0,
      0,
      97,
      100,
      100,
      114,
      101,
      115,
      115,
      0,
      116,
      101,
      114,
      109,
      46,
      102,
      117,
      108,
      108,
      115,
      99,
      114,
      101,
      101,
      110,
      46,
      116,
      111,
      103,
      103,
      108,
      101,
      0,
      0,
      96,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      42,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      115,
      101,
      116,
      116,
      105,
      110,
      103,
      32,
      117,
      112,
      32,
      115,
      100,
      108,
      32,
      116,
      101,
      114,
      109,
      105,
      110,
      97,
      108,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      10,
      0,
      0,
      0,
      0,
      0,
      114,
      98,
      0,
      0,
      0,
      0,
      0,
      0,
      100,
      114,
      105,
      118,
      101,
      114,
      0,
      0,
      45,
      45,
      32,
      37,
      115,
      61,
      37,
      100,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      97,
      100,
      100,
      114,
      101,
      115,
      115,
      0,
      117,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      37,
      48,
      50,
      88,
      0,
      0,
      0,
      0,
      93,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      37,
      48,
      50,
      88,
      0,
      0,
      0,
      0,
      115,
      112,
      0,
      0,
      0,
      0,
      0,
      0,
      68,
      83,
      58,
      0,
      0,
      0,
      0,
      0,
      101,
      56,
      50,
      53,
      57,
      58,
      32,
      112,
      111,
      108,
      108,
      32,
      99,
      111,
      109,
      109,
      97,
      110,
      100,
      10,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      115,
      116,
      111,
      112,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      108,
      111,
      97,
      100,
      105,
      110,
      103,
      32,
      99,
      111,
      110,
      102,
      105,
      103,
      32,
      102,
      105,
      108,
      101,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      10,
      0,
      56,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      97,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      66,
      97,
      99,
      107,
      113,
      117,
      111,
      116,
      101,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      37,
      108,
      117,
      0,
      0,
      0,
      0,
      0,
      115,
      100,
      108,
      0,
      0,
      0,
      0,
      0,
      102,
      105,
      108,
      101,
      0,
      0,
      0,
      0,
      97,
      100,
      100,
      114,
      101,
      115,
      115,
      0,
      82,
      73,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      118,
      105,
      100,
      101,
      111,
      46,
      98,
      108,
      105,
      110,
      107,
      0,
      114,
      98,
      0,
      0,
      0,
      0,
      0,
      0,
      116,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      67,
      82,
      84,
      67,
      61,
      91,
      37,
      48,
      50,
      88,
      0,
      0,
      0,
      0,
      0,
      0,
      37,
      48,
      50,
      88,
      0,
      0,
      0,
      0,
      49,
      54,
      52,
      53,
      48,
      0,
      0,
      0,
      116,
      101,
      114,
      109,
      105,
      110,
      97,
      108,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      98,
      120,
      0,
      0,
      0,
      0,
      0,
      0,
      114,
      97,
      109,
      0,
      0,
      0,
      0,
      0,
      83,
      83,
      58,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      115,
      101,
      114,
      112,
      111,
      114,
      116,
      46,
      102,
      105,
      108,
      101,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      102,
      105,
      108,
      101,
      61,
      34,
      37,
      115,
      34,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      112,
      99,
      101,
      0,
      0,
      0,
      0,
      0,
      55,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      80,
      97,
      117,
      115,
      101,
      0,
      0,
      0,
      45,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      108,
      115,
      101,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      116,
      101,
      114,
      109,
      105,
      110,
      97,
      108,
      32,
      100,
      114,
      105,
      118,
      101,
      114,
      32,
      39,
      120,
      49,
      49,
      39,
      32,
      110,
      111,
      116,
      32,
      115,
      117,
      112,
      112,
      111,
      114,
      116,
      101,
      100,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      111,
      112,
      116,
      105,
      111,
      110,
      97,
      108,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      112,
      97,
      114,
      112,
      111,
      114,
      116,
      0,
      67,
      68,
      0,
      0,
      0,
      0,
      0,
      0,
      93,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      99,
      111,
      119,
      0,
      0,
      0,
      0,
      0,
      115,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      82,
      69,
      71,
      58,
      32,
      67,
      82,
      84,
      67,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      77,
      79,
      68,
      69,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      83,
      84,
      65,
      84,
      85,
      83,
      61,
      37,
      48,
      50,
      88,
      10,
      0,
      37,
      115,
      10,
      10,
      0,
      0,
      0,
      0,
      100,
      120,
      0,
      0,
      0,
      0,
      0,
      0,
      67,
      83,
      58,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      115,
      101,
      114,
      112,
      111,
      114,
      116,
      46,
      100,
      114,
      105,
      118,
      101,
      114,
      0,
      0,
      0,
      0,
      0,
      0,
      102,
      108,
      97,
      103,
      115,
      0,
      0,
      0,
      67,
      79,
      78,
      70,
      73,
      71,
      58,
      0,
      114,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      116,
      101,
      114,
      109,
      46,
      102,
      117,
      108,
      108,
      115,
      99,
      114,
      101,
      101,
      110,
      0,
      54,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      83,
      99,
      114,
      76,
      107,
      0,
      0,
      0,
      43,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      59,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      108,
      111,
      97,
      100,
      105,
      110,
      103,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      120,
      49,
      49,
      0,
      0,
      0,
      0,
      0,
      114,
      101,
      97,
      100,
      111,
      110,
      108,
      121,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      115,
      0,
      0,
      0,
      0,
      0,
      37,
      52,
      117,
      32,
      32,
      0,
      0,
      0,
      68,
      83,
      82,
      0,
      0,
      0,
      0,
      0,
      37,
      48,
      50,
      88,
      0,
      0,
      0,
      0,
      49,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      56,
      48,
      56,
      54,
      0,
      0,
      0,
      0,
      67,
      76,
      75,
      58,
      32,
      67,
      76,
      75,
      61,
      37,
      108,
      117,
      32,
      32,
      72,
      84,
      61,
      37,
      108,
      117,
      32,
      72,
      68,
      61,
      37,
      108,
      117,
      32,
      32,
      86,
      84,
      61,
      37,
      108,
      117,
      32,
      86,
      68,
      61,
      37,
      108,
      117,
      10,
      0,
      0,
      0,
      0,
      0,
      67,
      82,
      84,
      67,
      61,
      91,
      37,
      48,
      50,
      88,
      0,
      0,
      0,
      0,
      0,
      0,
      67,
      82,
      84,
      67,
      61,
      91,
      37,
      48,
      50,
      88,
      0,
      0,
      0,
      0,
      0,
      0,
      119,
      97,
      118,
      0,
      0,
      0,
      0,
      0,
      115,
      105,
      122,
      101,
      0,
      0,
      0,
      0,
      115,
      110,
      100,
      45,
      115,
      100,
      108,
      58,
      32,
      101,
      114,
      114,
      111,
      114,
      32,
      105,
      110,
      105,
      116,
      105,
      97,
      108,
      105,
      122,
      105,
      110,
      103,
      32,
      97,
      117,
      100,
      105,
      111,
      32,
      115,
      117,
      98,
      115,
      121,
      115,
      116,
      101,
      109,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      119,
      97,
      118,
      102,
      105,
      108,
      116,
      101,
      114,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      99,
      120,
      0,
      0,
      0,
      0,
      0,
      0,
      69,
      83,
      58,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      114,
      101,
      115,
      101,
      116,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      112,
      99,
      101,
      45,
      105,
      98,
      109,
      112,
      99,
      58,
      32,
      115,
      105,
      103,
      105,
      110,
      116,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      112,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      116,
      101,
      114,
      109,
      46,
      102,
      117,
      108,
      108,
      115,
      99,
      114,
      101,
      101,
      110,
      46,
      116,
      111,
      103,
      103,
      108,
      101,
      0,
      0,
      53,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      83,
      99,
      114,
      111,
      108,
      108,
      76,
      111,
      99,
      107,
      0,
      0,
      0,
      0,
      0,
      0,
      62,
      62,
      0,
      0,
      0,
      0,
      0,
      0,
      99,
      97,
      110,
      39,
      116,
      32,
      111,
      112,
      101,
      110,
      32,
      105,
      110,
      99,
      108,
      117,
      100,
      101,
      32,
      102,
      105,
      108,
      101,
      58,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      98,
      97,
      115,
      101,
      0,
      0,
      0,
      0,
      69,
      83,
      67,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      108,
      111,
      97,
      100,
      105,
      110,
      103,
      32,
      114,
      111,
      109,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      0,
      0,
      115,
      105,
      122,
      101,
      103,
      0,
      0,
      0,
      120,
      109,
      115,
      0,
      0,
      0,
      0,
      0,
      82,
      84,
      83,
      0,
      0,
      0,
      0,
      0,
      116,
      99,
      58,
      32,
      117,
      110,
      107,
      110,
      111,
      119,
      110,
      32,
      109,
      97,
      114,
      107,
      32,
      48,
      120,
      37,
      48,
      50,
      120,
      32,
      40,
      37,
      115,
      44,
      32,
      99,
      61,
      37,
      117,
      44,
      32,
      104,
      61,
      37,
      117,
      44,
      32,
      98,
      105,
      116,
      61,
      37,
      108,
      117,
      47,
      37,
      108,
      117,
      41,
      10,
      0,
      0,
      93,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      116,
      101,
      114,
      109,
      46,
      116,
      105,
      116,
      108,
      101,
      0,
      0,
      0,
      0,
      0,
      0,
      80,
      85,
      83,
      72,
      65,
      0,
      0,
      0,
      99,
      97,
      115,
      115,
      101,
      116,
      116,
      101,
      32,
      69,
      79,
      70,
      32,
      97,
      116,
      32,
      37,
      108,
      117,
      10,
      0,
      0,
      0,
      0,
      112,
      102,
      100,
      99,
      58,
      32,
      99,
      114,
      99,
      32,
      101,
      114,
      114,
      111,
      114,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      77,
      68,
      65,
      58,
      32,
      79,
      70,
      83,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      80,
      79,
      83,
      61,
      37,
      48,
      52,
      88,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      82,
      69,
      71,
      58,
      32,
      67,
      82,
      84,
      67,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      77,
      79,
      68,
      69,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      83,
      84,
      65,
      84,
      85,
      83,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      67,
      79,
      78,
      70,
      61,
      37,
      48,
      50,
      88,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      37,
      115,
      61,
      91,
      37,
      48,
      50,
      88,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      112,
      102,
      100,
      99,
      58,
      32,
      119,
      97,
      114,
      110,
      105,
      110,
      103,
      58,
      32,
      108,
      111,
      97,
      100,
      105,
      110,
      103,
      32,
      100,
      101,
      112,
      114,
      101,
      99,
      97,
      116,
      101,
      100,
      32,
      118,
      101,
      114,
      115,
      105,
      111,
      110,
      32,
      50,
      32,
      102,
      105,
      108,
      101,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      82,
      69,
      71,
      58,
      32,
      77,
      79,
      68,
      69,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      67,
      83,
      69,
      76,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      83,
      84,
      65,
      84,
      85,
      83,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      80,
      65,
      76,
      61,
      91,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      50,
      88,
      93,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      80,
      79,
      80,
      65,
      0,
      0,
      0,
      0,
      112,
      102,
      100,
      99,
      58,
      32,
      119,
      97,
      114,
      110,
      105,
      110,
      103,
      58,
      32,
      108,
      111,
      97,
      100,
      105,
      110,
      103,
      32,
      100,
      101,
      112,
      114,
      101,
      99,
      97,
      116,
      101,
      100,
      32,
      118,
      101,
      114,
      115,
      105,
      111,
      110,
      32,
      49,
      32,
      102,
      105,
      108,
      101,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      66,
      79,
      85,
      78,
      68,
      0,
      0,
      0,
      112,
      102,
      100,
      99,
      58,
      32,
      119,
      97,
      114,
      110,
      105,
      110,
      103,
      58,
      32,
      108,
      111,
      97,
      100,
      105,
      110,
      103,
      32,
      100,
      101,
      112,
      114,
      101,
      99,
      97,
      116,
      101,
      100,
      32,
      118,
      101,
      114,
      115,
      105,
      111,
      110,
      32,
      48,
      32,
      102,
      105,
      108,
      101,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      105,
      110,
      116,
      49,
      53,
      58,
      32,
      99,
      111,
      112,
      121,
      32,
      37,
      48,
      56,
      120,
      32,
      45,
      62,
      32,
      37,
      48,
      56,
      120,
      44,
      32,
      37,
      48,
      52,
      120,
      10,
      0,
      68,
      66,
      0,
      0,
      0,
      0,
      0,
      0,
      117,
      109,
      98,
      95,
      115,
      105,
      122,
      101,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      120,
      112,
      101,
      99,
      116,
      105,
      110,
      103,
      32,
      98,
      111,
      111,
      116,
      32,
      100,
      114,
      105,
      118,
      101,
      0,
      0,
      0,
      0,
      80,
      67,
      69,
      72,
      0,
      0,
      0,
      0,
      97,
      120,
      0,
      0,
      0,
      0,
      0,
      0,
      98,
      111,
      111,
      116,
      32,
      100,
      114,
      105,
      118,
      101,
      32,
      105,
      115,
      32,
      48,
      120,
      37,
      48,
      50,
      120,
      10,
      0,
      0,
      0,
      73,
      78,
      83,
      66,
      0,
      0,
      0,
      0,
      69,
      120,
      116,
      114,
      97,
      49,
      54,
      0,
      101,
      120,
      112,
      101,
      99,
      116,
      105,
      110,
      103,
      32,
      111,
      102,
      102,
      115,
      101,
      116,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      73,
      78,
      83,
      87,
      0,
      0,
      0,
      0,
      99,
      112,
      50,
      58,
      32,
      37,
      117,
      47,
      37,
      117,
      47,
      37,
      117,
      58,
      32,
      115,
      101,
      99,
      116,
      111,
      114,
      32,
      100,
      97,
      116,
      97,
      32,
      116,
      111,
      111,
      32,
      98,
      105,
      103,
      32,
      40,
      37,
      117,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      69,
      120,
      116,
      114,
      97,
      49,
      53,
      0,
      101,
      109,
      117,
      46,
      112,
      97,
      117,
      115,
      101,
      46,
      116,
      111,
      103,
      103,
      108,
      101,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      58,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      79,
      85,
      84,
      83,
      66,
      0,
      0,
      0,
      112,
      99,
      101,
      45,
      105,
      98,
      109,
      112,
      99,
      58,
      32,
      115,
      105,
      103,
      116,
      101,
      114,
      109,
      10,
      0,
      0,
      0,
      0,
      0,
      69,
      120,
      116,
      114,
      97,
      49,
      52,
      0,
      112,
      113,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      99,
      111,
      110,
      102,
      105,
      103,
      46,
      115,
      97,
      118,
      101,
      32,
      32,
      32,
      32,
      32,
      32,
      60,
      102,
      105,
      108,
      101,
      110,
      97,
      109,
      101,
      62,
      10,
      101,
      109,
      117,
      46,
      101,
      120,
      105,
      116,
      10,
      101,
      109,
      117,
      46,
      115,
      116,
      111,
      112,
      10,
      101,
      109,
      117,
      46,
      112,
      97,
      117,
      115,
      101,
      32,
      32,
      32,
      32,
      32,
      32,
      32,
      32,
      32,
      32,
      32,
      32,
      34,
      48,
      34,
      32,
      124,
      32,
      34,
      49,
      34,
      10,
      101,
      109,
      117,
      46,
      112,
      97,
      117,
      115,
      101,
      46,
      116,
      111,
      103,
      103,
      108,
      101,
      10,
      101,
      109,
      117,
      46,
      114,
      101,
      115,
      101,
      116,
      10,
      10,
      101,
      109,
      117,
      46,
      99,
      112,
      117,
      46,
      109,
      111,
      100,
      101,
      108,
      32,
      32,
      32,
      32,
      32,
      32,
      32,
      32,
      34,
      56,
      48,
      56,
      54,
      34,
      32,
      124,
      32,
      34,
      56,
      48,
      56,
      56,
      34,
      32,
      124,
      32,
      34,
      56,
      48,
      49,
      56,
      54,
      34,
      32,
      124,
      32,
      34,
      56,
      48,
      49,
      56,
      56,
      34,
      10,
      101,
      109,
      117,
      46,
      99,
      112,
      117,
      46,
      115,
      112,
      101,
      101,
      100,
      32,
      32,
      32,
      32,
      32,
      32,
      32,
      32,
      60,
      102,
      97,
      99,
      116,
      111,
      114,
      62,
      10,
      101,
      109,
      117,
      46,
      99,
      112,
      117,
      46,
      115,
      112,
      101,
      101,
      100,
      46,
      115,
      116,
      101,
      112,
      32,
      32,
      32,
      60,
      97,
      100,
      106,
      117,
      115,
      116,
      109,
      101,
      110,
      116,
      62,
      10,
      10,
      101,
      109,
      117,
      46,
      100,
      105,
      115,
      107,
      46,
      98,
      111,
      111,
      116,
      32,
      32,
      32,
      32,
      32,
      32,
      32,
      32,
      60,
      98,
      111,
      111,
      116,
      100,
      114,
      105,
      118,
      101,
      62,
      10,
      101,
      109,
      117,
      46,
      100,
      105,
      115,
      107,
      46,
      99,
      111,
      109,
      109,
      105,
      116,
      32,
      32,
      32,
      32,
      32,
      32,
      91,
      60,
      100,
      114,
      105,
      118,
      101,
      62,
      93,
      10,
      101,
      109,
      117,
      46,
      100,
      105,
      115,
      107,
      46,
      101,
      106,
      101,
      99,
      116,
      32,
      32,
      32,
      32,
      32,
      32,
      32,
      60,
      100,
      114,
      105,
      118,
      101,
      62,
      10,
      101,
      109,
      117,
      46,
      100,
      105,
      115,
      107,
      46,
      105,
      110,
      115,
      101,
      114,
      116,
      32,
      32,
      32,
      32,
      32,
      32,
      60,
      100,
      114,
      105,
      118,
      101,
      62,
      58,
      60,
      102,
      110,
      97,
      109,
      101,
      62,
      10,
      10,
      101,
      109,
      117,
      46,
      102,
      100,
      99,
      46,
      97,
      99,
      99,
      117,
      114,
      97,
      116,
      101,
      32,
      32,
      32,
      32,
      32,
      34,
      48,
      34,
      32,
      124,
      32,
      34,
      49,
      34,
      10,
      10,
      101,
      109,
      117,
      46,
      112,
      97,
      114,
      112,
      111,
      114,
      116,
      46,
      100,
      114,
      105,
      118,
      101,
      114,
      32,
      32,
      32,
      60,
      100,
      114,
      105,
      118,
      101,
      114,
      62,
      10,
      101,
      109,
      117,
      46,
      112,
      97,
      114,
      112,
      111,
      114,
      116,
      46,
      102,
      105,
      108,
      101,
      32,
      32,
      32,
      32,
      32,
      60,
      102,
      105,
      108,
      101,
      110,
      97,
      109,
      101,
      62,
      10,
      10,
      101,
      109,
      117,
      46,
      115,
      101,
      114,
      112,
      111,
      114,
      116,
      46,
      100,
      114,
      105,
      118,
      101,
      114,
      32,
      32,
      32,
      60,
      100,
      114,
      105,
      118,
      101,
      114,
      62,
      10,
      101,
      109,
      117,
      46,
      115,
      101,
      114,
      112,
      111,
      114,
      116,
      46,
      102,
      105,
      108,
      101,
      32,
      32,
      32,
      32,
      32,
      60,
      102,
      105,
      108,
      101,
      110,
      97,
      109,
      101,
      62,
      10,
      10,
      101,
      109,
      117,
      46,
      116,
      97,
      112,
      101,
      46,
      97,
      112,
      112,
      101,
      110,
      100,
      10,
      101,
      109,
      117,
      46,
      116,
      97,
      112,
      101,
      46,
      102,
      105,
      108,
      101,
      32,
      32,
      32,
      32,
      32,
      32,
      32,
      32,
      60,
      102,
      105,
      108,
      101,
      110,
      97,
      109,
      101,
      62,
      10,
      101,
      109,
      117,
      46,
      116,
      97,
      112,
      101,
      46,
      108,
      111,
      97,
      100,
      32,
      32,
      32,
      32,
      32,
      32,
      32,
      32,
      91,
      60,
      112,
      111,
      115,
      105,
      116,
      105,
      111,
      110,
      62,
      32,
      124,
      32,
      34,
      101,
      110,
      100,
      34,
      93,
      10,
      101,
      109,
      117,
      46,
      116,
      97,
      112,
      101,
      46,
      114,
      101,
      119,
      105,
      110,
      100,
      10,
      101,
      109,
      117,
      46,
      116,
      97,
      112,
      101,
      46,
      115,
      97,
      118,
      101,
      32,
      32,
      32,
      32,
      32,
      32,
      32,
      32,
      91,
      60,
      112,
      111,
      115,
      105,
      116,
      105,
      111,
      110,
      62,
      32,
      124,
      32,
      34,
      101,
      110,
      100,
      34,
      93,
      10,
      101,
      109,
      117,
      46,
      116,
      97,
      112,
      101,
      46,
      115,
      116,
      97,
      116,
      101,
      10,
      10,
      101,
      109,
      117,
      46,
      116,
      101,
      114,
      109,
      46,
      102,
      117,
      108,
      108,
      115,
      99,
      114,
      101,
      101,
      110,
      32,
      32,
      34,
      48,
      34,
      32,
      124,
      32,
      34,
      49,
      34,
      10,
      101,
      109,
      117,
      46,
      116,
      101,
      114,
      109,
      46,
      102,
      117,
      108,
      108,
      115,
      99,
      114,
      101,
      101,
      110,
      46,
      116,
      111,
      103,
      103,
      108,
      101,
      10,
      101,
      109,
      117,
      46,
      116,
      101,
      114,
      109,
      46,
      103,
      114,
      97,
      98,
      10,
      101,
      109,
      117,
      46,
      116,
      101,
      114,
      109,
      46,
      114,
      101,
      108,
      101,
      97,
      115,
      101,
      10,
      101,
      109,
      117,
      46,
      116,
      101,
      114,
      109,
      46,
      115,
      99,
      114,
      101,
      101,
      110,
      115,
      104,
      111,
      116,
      32,
      32,
      91,
      60,
      102,
      105,
      108,
      101,
      110,
      97,
      109,
      101,
      62,
      93,
      10,
      101,
      109,
      117,
      46,
      116,
      101,
      114,
      109,
      46,
      116,
      105,
      116,
      108,
      101,
      32,
      32,
      32,
      32,
      32,
      32,
      32,
      60,
      116,
      105,
      116,
      108,
      101,
      62,
      10,
      10,
      101,
      109,
      117,
      46,
      118,
      105,
      100,
      101,
      111,
      46,
      98,
      108,
      105,
      110,
      107,
      32,
      32,
      32,
      32,
      32,
      32,
      60,
      98,
      108,
      105,
      110,
      107,
      45,
      114,
      97,
      116,
      101,
      62,
      10,
      101,
      109,
      117,
      46,
      118,
      105,
      100,
      101,
      111,
      46,
      114,
      101,
      100,
      114,
      97,
      119,
      32,
      32,
      32,
      32,
      32,
      91,
      34,
      110,
      111,
      119,
      34,
      93,
      10,
      0,
      0,
      0,
      0,
      79,
      85,
      84,
      83,
      87,
      0,
      0,
      0,
      116,
      101,
      114,
      109,
      46,
      115,
      101,
      116,
      95,
      98,
      111,
      114,
      100,
      101,
      114,
      95,
      121,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      52,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      69,
      120,
      116,
      114,
      97,
      49,
      51,
      0,
      80,
      114,
      116,
      83,
      99,
      110,
      0,
      0,
      60,
      60,
      0,
      0,
      0,
      0,
      0,
      0,
      37,
      48,
      52,
      88,
      58,
      32,
      37,
      48,
      50,
      88,
      10,
      0,
      0,
      0,
      0,
      0,
      105,
      110,
      99,
      108,
      117,
      100,
      101,
      0,
      97,
      100,
      100,
      114,
      101,
      115,
      115,
      0,
      100,
      114,
      105,
      118,
      101,
      114,
      61,
      37,
      115,
      32,
      69,
      83,
      67,
      61,
      37,
      115,
      32,
      97,
      115,
      112,
      101,
      99,
      116,
      61,
      37,
      117,
      47,
      37,
      117,
      32,
      109,
      105,
      110,
      95,
      115,
      105,
      122,
      101,
      61,
      37,
      117,
      42,
      37,
      117,
      32,
      115,
      99,
      97,
      108,
      101,
      61,
      37,
      117,
      32,
      109,
      111,
      117,
      115,
      101,
      61,
      91,
      37,
      117,
      47,
      37,
      117,
      32,
      37,
      117,
      47,
      37,
      117,
      93,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      82,
      79,
      77,
      58,
      0,
      0,
      0,
      0,
      115,
      105,
      122,
      101,
      109,
      0,
      0,
      0,
      104,
      111,
      115,
      116,
      32,
      115,
      121,
      115,
      116,
      101,
      109,
      32,
      116,
      111,
      111,
      32,
      115,
      108,
      111,
      119,
      44,
      32,
      115,
      107,
      105,
      112,
      112,
      105,
      110,
      103,
      32,
      49,
      32,
      115,
      101,
      99,
      111,
      110,
      100,
      46,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      74,
      71,
      0,
      0,
      0,
      0,
      0,
      0,
      68,
      84,
      82,
      0,
      0,
      0,
      0,
      0,
      69,
      120,
      116,
      114,
      97,
      49,
      50,
      0,
      37,
      48,
      50,
      88,
      0,
      0,
      0,
      0,
      37,
      48,
      52,
      88,
      58,
      32,
      37,
      48,
      52,
      88,
      10,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      99,
      111,
      110,
      102,
      105,
      103,
      46,
      115,
      97,
      118,
      101,
      0,
      74,
      76,
      69,
      0,
      0,
      0,
      0,
      0,
      69,
      120,
      116,
      114,
      97,
      49,
      49,
      0,
      45,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      108,
      111,
      97,
      100,
      0,
      0,
      0,
      0,
      68,
      69,
      86,
      58,
      32,
      77,
      68,
      65,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      67,
      76,
      75,
      58,
      32,
      67,
      76,
      75,
      61,
      37,
      108,
      117,
      32,
      32,
      72,
      84,
      61,
      37,
      108,
      117,
      32,
      72,
      68,
      61,
      37,
      108,
      117,
      32,
      32,
      86,
      84,
      61,
      37,
      108,
      117,
      32,
      86,
      68,
      61,
      37,
      108,
      117,
      10,
      0,
      0,
      0,
      0,
      0,
      74,
      71,
      69,
      0,
      0,
      0,
      0,
      0,
      71,
      82,
      67,
      0,
      0,
      0,
      0,
      0,
      69,
      120,
      116,
      114,
      97,
      49,
      48,
      0,
      67,
      76,
      75,
      58,
      32,
      67,
      76,
      75,
      61,
      37,
      108,
      117,
      32,
      32,
      72,
      84,
      61,
      37,
      108,
      117,
      32,
      72,
      68,
      61,
      37,
      108,
      117,
      32,
      32,
      86,
      84,
      61,
      37,
      108,
      117,
      32,
      86,
      68,
      61,
      37,
      108,
      117,
      10,
      0,
      0,
      0,
      0,
      0,
      43,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      74,
      76,
      0,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      117,
      110,
      107,
      110,
      111,
      119,
      110,
      32,
      109,
      111,
      100,
      101,
      108,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      69,
      120,
      116,
      114,
      97,
      57,
      0,
      0,
      107,
      101,
      121,
      58,
      32,
      37,
      115,
      37,
      115,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      102,
      105,
      108,
      101,
      0,
      0,
      0,
      0,
      74,
      80,
      79,
      0,
      0,
      0,
      0,
      0,
      109,
      50,
      52,
      0,
      0,
      0,
      0,
      0,
      69,
      120,
      116,
      114,
      97,
      56,
      0,
      0,
      115,
      121,
      109,
      108,
      105,
      110,
      107,
      0,
      117,
      110,
      107,
      110,
      111,
      119,
      110,
      32,
      107,
      101,
      121,
      58,
      32,
      37,
      115,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      74,
      80,
      69,
      0,
      0,
      0,
      0,
      0,
      98,
      104,
      0,
      0,
      0,
      0,
      0,
      0,
      102,
      105,
      108,
      101,
      0,
      0,
      0,
      0,
      53,
      49,
      54,
      48,
      0,
      0,
      0,
      0,
      69,
      120,
      116,
      114,
      97,
      55,
      0,
      0,
      37,
      48,
      50,
      88,
      58,
      32,
      37,
      115,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      74,
      78,
      83,
      0,
      0,
      0,
      0,
      0,
      109,
      111,
      100,
      101,
      108,
      61,
      37,
      115,
      32,
      102,
      108,
      111,
      112,
      112,
      105,
      101,
      115,
      61,
      37,
      117,
      32,
      112,
      97,
      116,
      99,
      104,
      45,
      105,
      110,
      105,
      116,
      61,
      37,
      100,
      32,
      112,
      97,
      116,
      99,
      104,
      45,
      105,
      110,
      116,
      49,
      57,
      61,
      37,
      100,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      69,
      120,
      116,
      114,
      97,
      54,
      0,
      0,
      60,
      98,
      97,
      100,
      62,
      0,
      0,
      0,
      115,
      121,
      115,
      116,
      101,
      109,
      46,
      98,
      111,
      111,
      116,
      32,
      61,
      32,
      0,
      0,
      110,
      101,
      101,
      100,
      32,
      97,
      110,
      32,
      101,
      120,
      112,
      114,
      101,
      115,
      115,
      105,
      111,
      110,
      0,
      0,
      0,
      0,
      0,
      0,
      74,
      83,
      0,
      0,
      0,
      0,
      0,
      0,
      83,
      89,
      83,
      84,
      69,
      77,
      58,
      0,
      69,
      120,
      116,
      114,
      97,
      53,
      0,
      0,
      101,
      109,
      117,
      46,
      112,
      97,
      117,
      115,
      101,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      37,
      48,
      50,
      88,
      58,
      32,
      60,
      100,
      101,
      108,
      101,
      116,
      101,
      100,
      62,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      74,
      65,
      0,
      0,
      0,
      0,
      0,
      0,
      112,
      99,
      101,
      45,
      105,
      98,
      109,
      112,
      99,
      58,
      32,
      115,
      101,
      103,
      109,
      101,
      110,
      116,
      97,
      116,
      105,
      111,
      110,
      32,
      102,
      97,
      117,
      108,
      116,
      10,
      0,
      0,
      109,
      101,
      109,
      116,
      101,
      115,
      116,
      0,
      69,
      120,
      116,
      114,
      97,
      52,
      0,
      0,
      115,
      119,
      105,
      116,
      99,
      104,
      101,
      115,
      48,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      110,
      101,
      101,
      100,
      32,
      97,
      110,
      32,
      105,
      110,
      116,
      101,
      114,
      114,
      117,
      112,
      116,
      32,
      110,
      117,
      109,
      98,
      101,
      114,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      111,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      74,
      66,
      69,
      0,
      0,
      0,
      0,
      0,
      116,
      101,
      114,
      109,
      46,
      115,
      101,
      116,
      95,
      98,
      111,
      114,
      100,
      101,
      114,
      95,
      120,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      51,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      112,
      97,
      116,
      99,
      104,
      95,
      98,
      105,
      111,
      115,
      95,
      105,
      110,
      116,
      49,
      57,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      69,
      120,
      116,
      114,
      97,
      51,
      0,
      0,
      80,
      114,
      105,
      110,
      116,
      83,
      99,
      114,
      101,
      101,
      110,
      0,
      0,
      0,
      0,
      0,
      62,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      108,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      105,
      102,
      0,
      0,
      0,
      0,
      0,
      0,
      121,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      102,
      105,
      108,
      101,
      0,
      0,
      0,
      0,
      109,
      111,
      117,
      115,
      101,
      0,
      0,
      0,
      84,
      69,
      82,
      77,
      58,
      0,
      0,
      0,
      114,
      111,
      109,
      0,
      0,
      0,
      0,
      0,
      115,
      105,
      122,
      101,
      107,
      0,
      0,
      0,
      115,
      101,
      116,
      116,
      105,
      110,
      103,
      32,
      115,
      112,
      101,
      101,
      100,
      32,
      116,
      111,
      32,
      37,
      117,
      88,
      10,
      0,
      0,
      0,
      74,
      78,
      90,
      0,
      0,
      0,
      0,
      0,
      67,
      84,
      83,
      0,
      0,
      0,
      0,
      0,
      112,
      97,
      116,
      99,
      104,
      95,
      98,
      105,
      111,
      115,
      95,
      105,
      110,
      105,
      116,
      0,
      69,
      120,
      116,
      114,
      97,
      50,
      0,
      0,
      37,
      115,
      61,
      91,
      37,
      48,
      50,
      88,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      93,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      93,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      117,
      110,
      104,
      97,
      110,
      100,
      108,
      101,
      100,
      32,
      109,
      97,
      103,
      105,
      99,
      32,
      107,
      101,
      121,
      32,
      40,
      37,
      117,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      108,
      111,
      103,
      32,
      119,
      104,
      97,
      116,
      63,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      112,
      114,
      111,
      116,
      111,
      99,
      111,
      108,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      74,
      90,
      0,
      0,
      0,
      0,
      0,
      0,
      114,
      98,
      0,
      0,
      0,
      0,
      0,
      0,
      114,
      116,
      99,
      0,
      0,
      0,
      0,
      0,
      69,
      120,
      116,
      114,
      97,
      49,
      0,
      0,
      105,
      110,
      116,
      0,
      0,
      0,
      0,
      0,
      115,
      97,
      118,
      101,
      0,
      0,
      0,
      0,
      103,
      114,
      97,
      121,
      0,
      0,
      0,
      0,
      72,
      71,
      67,
      58,
      32,
      80,
      65,
      71,
      69,
      61,
      37,
      100,
      32,
      32,
      79,
      70,
      83,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      80,
      79,
      83,
      61,
      37,
      48,
      52,
      88,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      74,
      78,
      67,
      0,
      0,
      0,
      0,
      0,
      114,
      98,
      0,
      0,
      0,
      0,
      0,
      0,
      83,
      69,
      81,
      0,
      0,
      0,
      0,
      0,
      102,
      108,
      111,
      112,
      112,
      121,
      95,
      100,
      105,
      115,
      107,
      95,
      100,
      114,
      105,
      118,
      101,
      115,
      0,
      0,
      0,
      0,
      0,
      0,
      82,
      105,
      103,
      104,
      116,
      0,
      0,
      0,
      67,
      71,
      65,
      58,
      32,
      79,
      70,
      83,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      80,
      79,
      83,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      66,
      71,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      80,
      65,
      76,
      61,
      37,
      117,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      110,
      101,
      101,
      100,
      32,
      97,
      32,
      118,
      97,
      108,
      117,
      101,
      0,
      0,
      0,
      0,
      114,
      98,
      0,
      0,
      0,
      0,
      0,
      0,
      74,
      67,
      0,
      0,
      0,
      0,
      0,
      0,
      98,
      111,
      111,
      116,
      0,
      0,
      0,
      0,
      68,
      111,
      119,
      110,
      0,
      0,
      0,
      0,
      110,
      101,
      101,
      100,
      32,
      97,
      32,
      112,
      111,
      114,
      116,
      32,
      97,
      100,
      100,
      114,
      101,
      115,
      115,
      0,
      0,
      0,
      0,
      0,
      68,
      79,
      83,
      69,
      77,
      85,
      0,
      0,
      74,
      78,
      79,
      0,
      0,
      0,
      0,
      0,
      53,
      49,
      53,
      48,
      0,
      0,
      0,
      0,
      76,
      101,
      102,
      116,
      0,
      0,
      0,
      0,
      119,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      74,
      79,
      0,
      0,
      0,
      0,
      0,
      0,
      100,
      104,
      0,
      0,
      0,
      0,
      0,
      0,
      115,
      121,
      115,
      116,
      101,
      109,
      0,
      0,
      85,
      112,
      0,
      0,
      0,
      0,
      0,
      0,
      80,
      81,
      58,
      0,
      0,
      0,
      0,
      0,
      67,
      77,
      80,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      108,
      111,
      97,
      100,
      105,
      110,
      103,
      32,
      110,
      118,
      114,
      97,
      109,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      80,
      97,
      103,
      101,
      68,
      111,
      119,
      110,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      91,
      37,
      115,
      37,
      115,
      37,
      99,
      37,
      48,
      52,
      88,
      93,
      0,
      0,
      0,
      0,
      112,
      113,
      58,
      32,
      117,
      110,
      107,
      110,
      111,
      119,
      110,
      32,
      99,
      111,
      109,
      109,
      97,
      110,
      100,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      120,
      109,
      115,
      58,
      32,
      117,
      110,
      107,
      110,
      111,
      119,
      110,
      32,
      102,
      117,
      110,
      99,
      116,
      105,
      111,
      110,
      32,
      40,
      37,
      120,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      88,
      79,
      82,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      99,
      114,
      101,
      97,
      116,
      105,
      110,
      103,
      32,
      110,
      118,
      114,
      97,
      109,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      69,
      110,
      100,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      112,
      97,
      114,
      112,
      111,
      114,
      116,
      46,
      102,
      105,
      108,
      101,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      102,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      83,
      85,
      66,
      0,
      0,
      0,
      0,
      0,
      105,
      110,
      116,
      118,
      0,
      0,
      0,
      0,
      98,
      111,
      114,
      100,
      101,
      114,
      0,
      0,
      99,
      111,
      109,
      109,
      105,
      116,
      0,
      0,
      60,
      62,
      0,
      0,
      0,
      0,
      0,
      0,
      68,
      101,
      108,
      101,
      116,
      101,
      0,
      0,
      109,
      105,
      115,
      115,
      105,
      110,
      103,
      32,
      118,
      97,
      108,
      117,
      101,
      10,
      0,
      0,
      119,
      98,
      0,
      0,
      0,
      0,
      0,
      0,
      108,
      111,
      103,
      0,
      0,
      0,
      0,
      0,
      65,
      78,
      68,
      0,
      0,
      0,
      0,
      0,
      116,
      101,
      114,
      109,
      46,
      116,
      105,
      116,
      108,
      101,
      0,
      0,
      0,
      0,
      0,
      0,
      50,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      97,
      100,
      100,
      114,
      61,
      48,
      120,
      37,
      48,
      56,
      108,
      120,
      32,
      115,
      105,
      122,
      101,
      61,
      37,
      108,
      117,
      32,
      102,
      105,
      108,
      101,
      61,
      37,
      115,
      10,
      0,
      0,
      80,
      97,
      103,
      101,
      85,
      112,
      0,
      0,
      70,
      49,
      50,
      0,
      0,
      0,
      0,
      0,
      60,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      37,
      48,
      52,
      108,
      88,
      10,
      0,
      0,
      61,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      118,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      102,
      111,
      114,
      109,
      97,
      116,
      0,
      0,
      109,
      111,
      117,
      115,
      101,
      95,
      100,
      105,
      118,
      95,
      121,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      108,
      111,
      97,
      100,
      105,
      110,
      103,
      32,
      114,
      97,
      109,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      0,
      0,
      115,
      105,
      122,
      101,
      0,
      0,
      0,
      0,
      114,
      98,
      0,
      0,
      0,
      0,
      0,
      0,
      67,
      80,
      85,
      58,
      0,
      0,
      0,
      0,
      65,
      32,
      32,
      37,
      48,
      56,
      108,
      88,
      32,
      32,
      37,
      48,
      52,
      88,
      32,
      32,
      37,
      48,
      52,
      88,
      10,
      0,
      0,
      0,
      83,
      66,
      66,
      0,
      0,
      0,
      0,
      0,
      82,
      101,
      108,
      101,
      97,
      115,
      101,
      32,
      54,
      46,
      48,
      10,
      36,
      48,
      0,
      0,
      119,
      98,
      0,
      0,
      0,
      0,
      0,
      0,
      70,
      49,
      0,
      0,
      0,
      0,
      0,
      0,
      45,
      45,
      32,
      37,
      108,
      117,
      32,
      37,
      117,
      37,
      115,
      37,
      117,
      10,
      0,
      0,
      78,
      86,
      82,
      65,
      77,
      58,
      0,
      0,
      114,
      43,
      98,
      0,
      0,
      0,
      0,
      0,
      72,
      111,
      109,
      101,
      0,
      0,
      0,
      0,
      119,
      43,
      98,
      0,
      0,
      0,
      0,
      0,
      71,
      82,
      67,
      0,
      0,
      0,
      0,
      0,
      37,
      48,
      50,
      88,
      0,
      0,
      0,
      0,
      37,
      48,
      50,
      88,
      0,
      0,
      0,
      0,
      98,
      97,
      100,
      32,
      114,
      101,
      103,
      105,
      115,
      116,
      101,
      114,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      58,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      119,
      98,
      0,
      0,
      0,
      0,
      0,
      0,
      65,
      68,
      67,
      0,
      0,
      0,
      0,
      0,
      115,
      105,
      122,
      101,
      0,
      0,
      0,
      0,
      73,
      110,
      115,
      101,
      114,
      116,
      0,
      0,
      109,
      105,
      115,
      115,
      105,
      110,
      103,
      32,
      114,
      101,
      103,
      105,
      115,
      116,
      101,
      114,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      99,
      97,
      115,
      115,
      101,
      116,
      116,
      101,
      32,
      37,
      115,
      32,
      37,
      115,
      32,
      97,
      116,
      32,
      37,
      108,
      117,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      114,
      98,
      0,
      0,
      0,
      0,
      0,
      0,
      97,
      109,
      98,
      101,
      114,
      0,
      0,
      0,
      68,
      69,
      86,
      58,
      32,
      72,
      101,
      114,
      99,
      117,
      108,
      101,
      115,
      32,
      71,
      114,
      97,
      112,
      104,
      105,
      99,
      115,
      32,
      67,
      97,
      114,
      100,
      10,
      0,
      0,
      0,
      0,
      79,
      82,
      0,
      0,
      0,
      0,
      0,
      0,
      112,
      97,
      116,
      104,
      0,
      0,
      0,
      0,
      102,
      97,
      108,
      115,
      101,
      0,
      0,
      0,
      65,
      84,
      67,
      0,
      0,
      0,
      0,
      0,
      98,
      97,
      115,
      101,
      0,
      0,
      0,
      0,
      75,
      80,
      95,
      80,
      101,
      114,
      105,
      111,
      100,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      68,
      69,
      86,
      58,
      32,
      67,
      71,
      65,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      67,
      80,
      73,
      61,
      37,
      46,
      52,
      102,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      65,
      68,
      68,
      0,
      0,
      0,
      0,
      0,
      114,
      43,
      98,
      0,
      0,
      0,
      0,
      0,
      110,
      118,
      114,
      97,
      109,
      0,
      0,
      0,
      75,
      80,
      95,
      48,
      0,
      0,
      0,
      0,
      76,
      111,
      97,
      100,
      58,
      0,
      0,
      0,
      79,
      80,
      83,
      61,
      37,
      108,
      108,
      117,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      100,
      114,
      105,
      118,
      101,
      114,
      0,
      0,
      45,
      37,
      48,
      50,
      88,
      0,
      0,
      0,
      102,
      105,
      108,
      101,
      0,
      0,
      0,
      0,
      67,
      76,
      75,
      61,
      37,
      108,
      108,
      117,
      32,
      43,
      32,
      37,
      108,
      117,
      10,
      0,
      42,
      42,
      42,
      32,
      117,
      110,
      107,
      110,
      111,
      119,
      110,
      32,
      99,
      112,
      117,
      32,
      109,
      111,
      100,
      101,
      108,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      75,
      80,
      95,
      69,
      110,
      116,
      101,
      114,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      68,
      73,
      83,
      75,
      58,
      0,
      0,
      0,
      65,
      88,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      66,
      88,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      67,
      88,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      68,
      88,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      83,
      80,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      66,
      80,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      83,
      73,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      68,
      73,
      61,
      37,
      48,
      52,
      88,
      32,
      73,
      78,
      84,
      61,
      37,
      48,
      50,
      88,
      37,
      99,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      43,
      37,
      48,
      50,
      88,
      0,
      0,
      0,
      99,
      104,
      0,
      0,
      0,
      0,
      0,
      0,
      109,
      111,
      100,
      101,
      108,
      61,
      37,
      115,
      32,
      115,
      112,
      101,
      101,
      100,
      61,
      37,
      117,
      88,
      10,
      0,
      0,
      0,
      0,
      0,
      75,
      80,
      95,
      51,
      0,
      0,
      0,
      0,
      108,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      116,
      114,
      117,
      101,
      0,
      0,
      0,
      0,
      84,
      73,
      77,
      69,
      0,
      0,
      0,
      0,
      119,
      98,
      0,
      0,
      0,
      0,
      0,
      0,
      115,
      110,
      100,
      45,
      115,
      100,
      108,
      58,
      32,
      101,
      114,
      114,
      111,
      114,
      32,
      111,
      112,
      101,
      110,
      105,
      110,
      103,
      32,
      111,
      117,
      116,
      112,
      117,
      116,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      0,
      0,
      0,
      0,
      108,
      111,
      119,
      112,
      97,
      115,
      115,
      0,
      115,
      112,
      101,
      101,
      100,
      0,
      0,
      0,
      75,
      80,
      95,
      50,
      0,
      0,
      0,
      0,
      112,
      99,
      101,
      45,
      105,
      98,
      109,
      112,
      99,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      116,
      100,
      48,
      58,
      32,
      97,
      100,
      118,
      97,
      110,
      99,
      101,
      100,
      32,
      99,
      111,
      109,
      112,
      114,
      101,
      115,
      115,
      105,
      111,
      110,
      32,
      110,
      111,
      116,
      32,
      115,
      117,
      112,
      112,
      111,
      114,
      116,
      101,
      100,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      102,
      109,
      0,
      0,
      0,
      0,
      0,
      0,
      91,
      37,
      115,
      37,
      115,
      37,
      99,
      37,
      48,
      50,
      88,
      93,
      0,
      0,
      0,
      0,
      112,
      102,
      100,
      99,
      58,
      32,
      111,
      114,
      112,
      104,
      97,
      110,
      101,
      100,
      32,
      97,
      108,
      116,
      101,
      114,
      110,
      97,
      116,
      101,
      32,
      115,
      101,
      99,
      116,
      111,
      114,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      79,
      76,
      48,
      0,
      0,
      0,
      0,
      0,
      112,
      99,
      101,
      58,
      32,
      104,
      111,
      111,
      107,
      32,
      91,
      37,
      48,
      50,
      120,
      32,
      37,
      48,
      50,
      120,
      93,
      32,
      65,
      88,
      61,
      37,
      48,
      52,
      88,
      32,
      66,
      88,
      61,
      37,
      48,
      52,
      88,
      32,
      67,
      88,
      61,
      37,
      48,
      52,
      88,
      32,
      68,
      88,
      61,
      37,
      48,
      52,
      88,
      10,
      0,
      0,
      32,
      32,
      37,
      117,
      58,
      32,
      48,
      120,
      37,
      48,
      52,
      120,
      58,
      48,
      120,
      48,
      48,
      48,
      48,
      32,
      43,
      32,
      48,
      120,
      37,
      48,
      53,
      120,
      32,
      32,
      97,
      108,
      108,
      111,
      99,
      61,
      37,
      100,
      10,
      0,
      73,
      77,
      68,
      32,
      49,
      46,
      49,
      55,
      58,
      32,
      37,
      50,
      100,
      47,
      37,
      50,
      100,
      47,
      37,
      52,
      100,
      32,
      37,
      48,
      50,
      100,
      58,
      37,
      48,
      50,
      100,
      58,
      37,
      48,
      50,
      100,
      0,
      0,
      0,
      0,
      6,
      78,
      111,
      110,
      97,
      109,
      101,
      0,
      68,
      83,
      0,
      0,
      0,
      0,
      0,
      0,
      99,
      112,
      50,
      58,
      32,
      37,
      117,
      47,
      37,
      117,
      47,
      37,
      117,
      58,
      0,
      0,
      109,
      111,
      100,
      101,
      108,
      0,
      0,
      0,
      75,
      80,
      95,
      49,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      112,
      97,
      114,
      112,
      111,
      114,
      116,
      46,
      100,
      114,
      105,
      118,
      101,
      114,
      0,
      0,
      0,
      0,
      0,
      0,
      111,
      108,
      48,
      0,
      0,
      0,
      0,
      0,
      46,
      97,
      110,
      97,
      0,
      0,
      0,
      0,
      102,
      108,
      117,
      115,
      104,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      101,
      114,
      114,
      111,
      114,
      32,
      99,
      114,
      101,
      97,
      116,
      105,
      110,
      103,
      32,
      115,
      121,
      109,
      108,
      105,
      110,
      107,
      32,
      37,
      115,
      32,
      45,
      62,
      32,
      37,
      115,
      10,
      0,
      0,
      0,
      0,
      114,
      101,
      97,
      100,
      0,
      0,
      0,
      0,
      83,
      83,
      0,
      0,
      0,
      0,
      0,
      0,
      99,
      112,
      117,
      0,
      0,
      0,
      0,
      0,
      75,
      80,
      95,
      54,
      0,
      0,
      0,
      0,
      110,
      117,
      108,
      108,
      0,
      0,
      0,
      0,
      109,
      105,
      99,
      114,
      111,
      115,
      111,
      102,
      116,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      114,
      43,
      98,
      0,
      0,
      0,
      0,
      0,
      79,
      76,
      49,
      0,
      0,
      0,
      0,
      0,
      114,
      43,
      98,
      0,
      0,
      0,
      0,
      0,
      114,
      43,
      98,
      0,
      0,
      0,
      0,
      0,
      114,
      98,
      0,
      0,
      0,
      0,
      0,
      0,
      66,
      76,
      75,
      32,
      37,
      48,
      52,
      88,
      58,
      32,
      65,
      49,
      61,
      37,
      48,
      56,
      108,
      88,
      32,
      65,
      50,
      61,
      37,
      48,
      56,
      108,
      88,
      32,
      83,
      61,
      37,
      48,
      56,
      108,
      88,
      32,
      82,
      79,
      61,
      37,
      100,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      107,
      101,
      121,
      0,
      0,
      0,
      0,
      0,
      67,
      83,
      0,
      0,
      0,
      0,
      0,
      0,
      116,
      101,
      114,
      109,
      46,
      114,
      101,
      108,
      101,
      97,
      115,
      101,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      99,
      112,
      117,
      46,
      115,
      112,
      101,
      101,
      100,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      97,
      108,
      108,
      111,
      99,
      97,
      116,
      105,
      110,
      103,
      32,
      68,
      77,
      65,
      67,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      10,
      0,
      0,
      0,
      0,
      0,
      75,
      80,
      95,
      53,
      0,
      0,
      0,
      0,
      114,
      43,
      98,
      0,
      0,
      0,
      0,
      0,
      70,
      49,
      49,
      0,
      0,
      0,
      0,
      0,
      62,
      61,
      0,
      0,
      0,
      0,
      0,
      0,
      111,
      108,
      49,
      0,
      0,
      0,
      0,
      0,
      63,
      61,
      0,
      0,
      0,
      0,
      0,
      0,
      113,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      119,
      43,
      98,
      0,
      0,
      0,
      0,
      0,
      108,
      111,
      97,
      100,
      0,
      0,
      0,
      0,
      109,
      111,
      117,
      115,
      101,
      95,
      109,
      117,
      108,
      95,
      121,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      109,
      101,
      109,
      111,
      114,
      121,
      32,
      98,
      108,
      111,
      99,
      107,
      32,
      99,
      114,
      101,
      97,
      116,
      105,
      111,
      110,
      32,
      102,
      97,
      105,
      108,
      101,
      100,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      98,
      108,
      111,
      99,
      107,
      115,
      0,
      0,
      83,
      32,
      32,
      37,
      48,
      52,
      88,
      58,
      37,
      48,
      52,
      108,
      88,
      32,
      32,
      37,
      48,
      52,
      88,
      32,
      32,
      37,
      48,
      52,
      88,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      56,
      48,
      50,
      56,
      54,
      0,
      0,
      0,
      69,
      83,
      0,
      0,
      0,
      0,
      0,
      0,
      116,
      100,
      48,
      58,
      32,
      99,
      111,
      109,
      109,
      101,
      110,
      116,
      32,
      99,
      114,
      99,
      32,
      40,
      37,
      48,
      52,
      88,
      32,
      37,
      48,
      52,
      88,
      41,
      10,
      0,
      0,
      0,
      82,
      101,
      108,
      101,
      97,
      115,
      101,
      32,
      53,
      46,
      48,
      49,
      36,
      48,
      0,
      0,
      114,
      98,
      0,
      0,
      0,
      0,
      0,
      0,
      63,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      68,
      77,
      65,
      67,
      58,
      0,
      0,
      0,
      75,
      80,
      95,
      52,
      0,
      0,
      0,
      0,
      67,
      82,
      84,
      67,
      61,
      91,
      37,
      48,
      50,
      88,
      0,
      0,
      0,
      0,
      0,
      0,
      83,
      69,
      81,
      0,
      0,
      0,
      0,
      0,
      67,
      82,
      48,
      0,
      0,
      0,
      0,
      0,
      72,
      68,
      67,
      58,
      32,
      67,
      77,
      68,
      61,
      37,
      48,
      50,
      88,
      32,
      68,
      61,
      42,
      32,
      32,
      117,
      110,
      107,
      110,
      111,
      119,
      110,
      32,
      99,
      111,
      109,
      109,
      97,
      110,
      100,
      32,
      91,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      50,
      88,
      32,
      37,
      48,
      50,
      88,
      93,
      10,
      0,
      0,
      0,
      0,
      0,
      97,
      100,
      100,
      114,
      101,
      115,
      115,
      0,
      100,
      109,
      97,
      99,
      0,
      0,
      0,
      0,
      97,
      100,
      100,
      114,
      101,
      115,
      115,
      0,
      75,
      80,
      95,
      80,
      108,
      117,
      115,
      0,
      97,
      100,
      100,
      114,
      101,
      115,
      115,
      0,
      99,
      114,
      48,
      0,
      0,
      0,
      0,
      0,
      99,
      97,
      115,
      0,
      0,
      0,
      0,
      0,
      99,
      111,
      108,
      111,
      114,
      95,
      98,
      114,
      105,
      103,
      104,
      116,
      0,
      0,
      0,
      0,
      103,
      114,
      97,
      121,
      0,
      0,
      0,
      0,
      67,
      82,
      84,
      0,
      0,
      0,
      0,
      0,
      80,
      73,
      67,
      58,
      0,
      0,
      0,
      0,
      75,
      80,
      95,
      57,
      0,
      0,
      0,
      0,
      114,
      98,
      0,
      0,
      0,
      0,
      0,
      0,
      72,
      68,
      67,
      58,
      32,
      117,
      110,
      107,
      110,
      111,
      119,
      110,
      32,
      114,
      101,
      97,
      100,
      58,
      32,
      37,
      48,
      52,
      108,
      88,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      67,
      82,
      49,
      0,
      0,
      0,
      0,
      0,
      88,
      67,
      72,
      71,
      0,
      0,
      0,
      0,
      112,
      105,
      99,
      0,
      0,
      0,
      0,
      0,
      75,
      80,
      95,
      56,
      0,
      0,
      0,
      0,
      99,
      114,
      49,
      0,
      0,
      0,
      0,
      0,
      102,
      100,
      99,
      0,
      0,
      0,
      0,
      0,
      97,
      100,
      100,
      114,
      61,
      48,
      120,
      37,
      48,
      56,
      108,
      120,
      32,
      115,
      105,
      122,
      101,
      61,
      48,
      120,
      37,
      48,
      52,
      120,
    ])
    .concat([
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      75,
      80,
      95,
      55,
      0,
      0,
      0,
      0,
      67,
      37,
      100,
      58,
      32,
      83,
      82,
      61,
      37,
      48,
      50,
      88,
      32,
      77,
      61,
      37,
      117,
      32,
      82,
      87,
      61,
      37,
      100,
      32,
      32,
      67,
      69,
      61,
      37,
      48,
      52,
      88,
      32,
      32,
      37,
      115,
      61,
      37,
      48,
      50,
      88,
      32,
      37,
      115,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      37,
      115,
      61,
      37,
      48,
      50,
      88,
      32,
      37,
      115,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      71,
      61,
      37,
      117,
      32,
      79,
      61,
      37,
      117,
      32,
      82,
      61,
      37,
      100,
      10,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      115,
      58,
      32,
      117,
      110,
      107,
      110,
      111,
      119,
      110,
      32,
      115,
      117,
      98,
      102,
      117,
      110,
      99,
      116,
      105,
      111,
      110,
      58,
      32,
      65,
      88,
      61,
      37,
      48,
      52,
      88,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      97,
      104,
      0,
      0,
      0,
      0,
      0,
      0,
      80,
      73,
      84,
      58,
      0,
      0,
      0,
      0,
      75,
      80,
      95,
      77,
      105,
      110,
      117,
      115,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      105,
      111,
      0,
      0,
      0,
      0,
      0,
      0,
      56,
      50,
      53,
      51,
      45,
      80,
      73,
      84,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      87,
      65,
      73,
      84,
      0,
      0,
      0,
      0,
      112,
      105,
      116,
      0,
      0,
      0,
      0,
      0,
      75,
      80,
      95,
      83,
      116,
      97,
      114,
      0,
      91,
      37,
      115,
      37,
      115,
      93,
      0,
      0,
      32,
      32,
      67,
      72,
      61,
      73,
      91,
      37,
      88,
      93,
      32,
      32,
      67,
      76,
      61,
      79,
      91,
      37,
      88,
      93,
      0,
      0,
      0,
      0,
      85,
      77,
      66,
      58,
      32,
      98,
      108,
      107,
      61,
      37,
      117,
      32,
      117,
      115,
      101,
      100,
      61,
      37,
      108,
      117,
      32,
      109,
      97,
      120,
      61,
      37,
      108,
      117,
      10,
      0,
      0,
      0,
      80,
      85,
      83,
      72,
      70,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      118,
      105,
      100,
      101,
      111,
      46,
      114,
      101,
      100,
      114,
      97,
      119,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      97,
      100,
      100,
      114,
      61,
      48,
      120,
      37,
      48,
      56,
      120,
      32,
      115,
      105,
      122,
      101,
      61,
      48,
      120,
      37,
      48,
      52,
      120,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      75,
      80,
      95,
      83,
      108,
      97,
      115,
      104,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      101,
      109,
      117,
      46,
      102,
      100,
      99,
      46,
      97,
      99,
      99,
      117,
      114,
      97,
      116,
      101,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      32,
      32,
      67,
      72,
      61,
      79,
      91,
      37,
      88,
      93,
      32,
      32,
      67,
      76,
      61,
      73,
      91,
      37,
      88,
      93,
      0,
      0,
      0,
      0,
      112,
      99,
      0,
      0,
      0,
      0,
      0,
      0,
      80,
      79,
      80,
      70,
      0,
      0,
      0,
      0,
      80,
      80,
      73,
      58,
      0,
      0,
      0,
      0,
      78,
      117,
      109,
      76,
      111,
      99,
      107,
      0,
      32,
      32,
      67,
      61,
      79,
      91,
      37,
      48,
      50,
      88,
      93,
      0,
      0,
      0,
      0,
      0,
      105,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      83,
      65,
      72,
      70,
      0,
      0,
      0,
      0,
      116,
      101,
      114,
      109,
      46,
      103,
      114,
      97,
      98,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      49,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      112,
      112,
      105,
      0,
      0,
      0,
      0,
      0,
      67,
      116,
      114,
      108,
      82,
      105,
      103,
      104,
      116,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      105,
      111,
      0,
      0,
      0,
      0,
      0,
      0,
      70,
      49,
      48,
      0,
      0,
      0,
      0,
      0,
      60,
      61,
      0,
      0,
      0,
      0,
      0,
      0,
      32,
      32,
      67,
      61,
      73,
      91,
      37,
      48,
      50,
      88,
      93,
      0,
      0,
      0,
      0,
      0,
      125,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      109,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      98,
      105,
      110,
      97,
      114,
      121,
      0,
      0,
      109,
      111,
      117,
      115,
      101,
      95,
      100,
      105,
      118,
      95,
      120,
      0,
      0,
      0,
      0,
      0,
      60,
      110,
      111,
      110,
      101,
      62,
      0,
      0,
      115,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      32,
      37,
      115,
      0,
      0,
      0,
      0,
      0,
      69,
      32,
      32,
      34,
      37,
      115,
      34,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      118,
      50,
      48,
      0,
      0,
      0,
      0,
      0,
      76,
      65,
      72,
      70,
      0,
      0,
      0,
      0,
      116,
      100,
      48,
      58,
      32,
      114,
      101,
      97,
      100,
      32,
      101,
      114,
      114,
      111,
      114,
      10,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      82,
      101,
      108,
      101,
      97,
      115,
      101,
      32,
      52,
      46,
      48,
      48,
      36,
      48,
      0,
      0,
      46,
      120,
      100,
      102,
      0,
      0,
      0,
      0,
      69,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      42,
      42,
      42,
      32,
      117,
      110,
      107,
      110,
      111,
      119,
      110,
      32,
      99,
      97,
      115,
      115,
      101,
      116,
      116,
      101,
      32,
      109,
      111,
      100,
      101,
      32,
      40,
      37,
      115,
      41,
      10,
      0,
      77,
      101,
      110,
      117,
      0,
      0,
      0,
      0,
      82,
      69,
      71,
      58,
      32,
      67,
      84,
      76,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      66,
      65,
      78,
      75,
      32,
      79,
      70,
      83,
      61,
      37,
      48,
      50,
      88,
      32,
      32,
      66,
      65,
      78,
      75,
      32,
      66,
      65,
      83,
      61,
      37,
      48,
      50,
      88,
      10,
      0,
      0,
      0,
      0,
      65,
      84,
      67,
      0,
      0,
      0,
      0,
      0,
      32,
      32,
      66,
      61,
      79,
      91,
      37,
      48,
      50,
      88,
      93,
      0,
      0,
      0,
      0,
      0,
      105,
      111,
      0,
      0,
      0,
      0,
      0,
      0,
      77,
      79,
      86,
      83,
      66,
      0,
      0,
      0,
      115,
      97,
      118,
      101,
      0,
      0,
      0,
      0,
      87,
      105,
      110,
      100,
      111,
      119,
      115,
      82,
      105,
      103,
      104,
      116,
      0,
      0,
      0,
      0,
      32,
      32,
      66,
      61,
      73,
      91,
      37,
      48,
      50,
      88,
      93,
      0,
      0,
      0,
      0,
      0,
      112,
      99,
      109,
      47,
      114,
      0,
      0,
      0,
      119,
      43,
      98,
      0,
      0,
      0,
      0,
      0,
      114,
      43,
      98,
      0,
      0,
      0,
      0,
      0,
    ]),
  'i8',
  ALLOC_NONE,
  Runtime.GLOBAL_BASE
);
var tempDoublePtr = Runtime.alignMemory(allocate(12, 'i8', ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) {
  // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr + 1] = HEAP8[ptr + 1];
  HEAP8[tempDoublePtr + 2] = HEAP8[ptr + 2];
  HEAP8[tempDoublePtr + 3] = HEAP8[ptr + 3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr + 1] = HEAP8[ptr + 1];
  HEAP8[tempDoublePtr + 2] = HEAP8[ptr + 2];
  HEAP8[tempDoublePtr + 3] = HEAP8[ptr + 3];
  HEAP8[tempDoublePtr + 4] = HEAP8[ptr + 4];
  HEAP8[tempDoublePtr + 5] = HEAP8[ptr + 5];
  HEAP8[tempDoublePtr + 6] = HEAP8[ptr + 6];
  HEAP8[tempDoublePtr + 7] = HEAP8[ptr + 7];
}
var ERRNO_CODES = {
  EPERM: 1,
  ENOENT: 2,
  ESRCH: 3,
  EINTR: 4,
  EIO: 5,
  ENXIO: 6,
  E2BIG: 7,
  ENOEXEC: 8,
  EBADF: 9,
  ECHILD: 10,
  EAGAIN: 11,
  EWOULDBLOCK: 11,
  ENOMEM: 12,
  EACCES: 13,
  EFAULT: 14,
  ENOTBLK: 15,
  EBUSY: 16,
  EEXIST: 17,
  EXDEV: 18,
  ENODEV: 19,
  ENOTDIR: 20,
  EISDIR: 21,
  EINVAL: 22,
  ENFILE: 23,
  EMFILE: 24,
  ENOTTY: 25,
  ETXTBSY: 26,
  EFBIG: 27,
  ENOSPC: 28,
  ESPIPE: 29,
  EROFS: 30,
  EMLINK: 31,
  EPIPE: 32,
  EDOM: 33,
  ERANGE: 34,
  ENOMSG: 35,
  EIDRM: 36,
  ECHRNG: 37,
  EL2NSYNC: 38,
  EL3HLT: 39,
  EL3RST: 40,
  ELNRNG: 41,
  EUNATCH: 42,
  ENOCSI: 43,
  EL2HLT: 44,
  EDEADLK: 45,
  ENOLCK: 46,
  EBADE: 50,
  EBADR: 51,
  EXFULL: 52,
  ENOANO: 53,
  EBADRQC: 54,
  EBADSLT: 55,
  EDEADLOCK: 56,
  EBFONT: 57,
  ENOSTR: 60,
  ENODATA: 61,
  ETIME: 62,
  ENOSR: 63,
  ENONET: 64,
  ENOPKG: 65,
  EREMOTE: 66,
  ENOLINK: 67,
  EADV: 68,
  ESRMNT: 69,
  ECOMM: 70,
  EPROTO: 71,
  EMULTIHOP: 74,
  ELBIN: 75,
  EDOTDOT: 76,
  EBADMSG: 77,
  EFTYPE: 79,
  ENOTUNIQ: 80,
  EBADFD: 81,
  EREMCHG: 82,
  ELIBACC: 83,
  ELIBBAD: 84,
  ELIBSCN: 85,
  ELIBMAX: 86,
  ELIBEXEC: 87,
  ENOSYS: 88,
  ENMFILE: 89,
  ENOTEMPTY: 90,
  ENAMETOOLONG: 91,
  ELOOP: 92,
  EOPNOTSUPP: 95,
  EPFNOSUPPORT: 96,
  ECONNRESET: 104,
  ENOBUFS: 105,
  EAFNOSUPPORT: 106,
  EPROTOTYPE: 107,
  ENOTSOCK: 108,
  ENOPROTOOPT: 109,
  ESHUTDOWN: 110,
  ECONNREFUSED: 111,
  EADDRINUSE: 112,
  ECONNABORTED: 113,
  ENETUNREACH: 114,
  ENETDOWN: 115,
  ETIMEDOUT: 116,
  EHOSTDOWN: 117,
  EHOSTUNREACH: 118,
  EINPROGRESS: 119,
  EALREADY: 120,
  EDESTADDRREQ: 121,
  EMSGSIZE: 122,
  EPROTONOSUPPORT: 123,
  ESOCKTNOSUPPORT: 124,
  EADDRNOTAVAIL: 125,
  ENETRESET: 126,
  EISCONN: 127,
  ENOTCONN: 128,
  ETOOMANYREFS: 129,
  EPROCLIM: 130,
  EUSERS: 131,
  EDQUOT: 132,
  ESTALE: 133,
  ENOTSUP: 134,
  ENOMEDIUM: 135,
  ENOSHARE: 136,
  ECASECLASH: 137,
  EILSEQ: 138,
  EOVERFLOW: 139,
  ECANCELED: 140,
  ENOTRECOVERABLE: 141,
  EOWNERDEAD: 142,
  ESTRPIPE: 143,
};
var ___errno_state = 0;
function ___setErrNo(value) {
  // For convenient setting and returning of errno.
  HEAP32[___errno_state >> 2] = value;
  return value;
}
var _stdin = allocate(1, 'i32*', ALLOC_STATIC);
var _stdout = allocate(1, 'i32*', ALLOC_STATIC);
var _stderr = allocate(1, 'i32*', ALLOC_STATIC);
var __impure_ptr = allocate(1, 'i32*', ALLOC_STATIC);
var FS = {
  currentPath: '/',
  nextInode: 2,
  streams: [null],
  ignorePermissions: true,
  createFileHandle: function(stream, fd) {
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
    if (
      FS.streams[fd] &&
      FS.streams[fd].socket &&
      FS.streams[fd].socket.close
    ) {
      FS.streams[fd].socket.close();
    }
    FS.streams[fd] = stream;
    return fd;
  },
  removeFileHandle: function(fd) {
    FS.streams[fd] = null;
  },
  joinPath: function(parts, forceRelative) {
    var ret = parts[0];
    for (var i = 1; i < parts.length; i++) {
      if (ret[ret.length - 1] != '/') ret += '/';
      ret += parts[i];
    }
    if (forceRelative && ret[0] == '/') ret = ret.substr(1);
    return ret;
  },
  absolutePath: function(relative, base) {
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
  },
  analyzePath: function(path, dontResolveLastLink, linksVisited) {
    var ret = {
      isRoot: false,
      exists: false,
      error: 0,
      name: null,
      path: null,
      object: null,
      parentExists: false,
      parentPath: null,
      parentObject: null,
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
          if (linksVisited > 40) {
            // Usual Linux SYMLOOP_MAX.
            ret.error = ERRNO_CODES.ELOOP;
            break;
          }
          var link = FS.absolutePath(current.link, traversed.join('/'));
          ret = FS.analyzePath(
            [link].concat(path).join('/'),
            dontResolveLastLink,
            linksVisited + 1
          );
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
  },
  findObject: function(path, dontResolveLastLink) {
    FS.ensureRoot();
    var ret = FS.analyzePath(path, dontResolveLastLink);
    if (ret.exists) {
      return ret.object;
    } else {
      ___setErrNo(ret.error);
      return null;
    }
  },
  createObject: function(parent, name, properties, canRead, canWrite) {
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
      inodeNumber: FS.nextInode++,
    };
    for (var key in properties) {
      if (properties.hasOwnProperty(key)) {
        parent.contents[name][key] = properties[key];
      }
    }
    return parent.contents[name];
  },
  createFolder: function(parent, name, canRead, canWrite) {
    var properties = {isFolder: true, isDevice: false, contents: {}};
    return FS.createObject(parent, name, properties, canRead, canWrite);
  },
  createPath: function(parent, path, canRead, canWrite) {
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
  },
  createFile: function(parent, name, properties, canRead, canWrite) {
    properties.isFolder = false;
    return FS.createObject(parent, name, properties, canRead, canWrite);
  },
  createDataFile: function(parent, name, data, canRead, canWrite) {
    if (typeof data === 'string') {
      var dataArray = new Array(data.length);
      for (var i = 0, len = data.length; i < len; ++i)
        dataArray[i] = data.charCodeAt(i);
      data = dataArray;
    }
    var properties = {
      isDevice: false,
      contents: data.subarray ? data.subarray(0) : data, // as an optimization, create a new array wrapper (not buffer) here, to help JS engines understand this object
    };
    return FS.createFile(parent, name, properties, canRead, canWrite);
  },
  createLazyFile: function(parent, name, url, canRead, canWrite) {
    if (typeof XMLHttpRequest !== 'undefined') {
      if (!ENVIRONMENT_IS_WORKER)
        throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
      // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
      var LazyUint8Array = function() {
        this.lengthKnown = false;
        this.chunks = []; // Loaded chunks. Index is the chunk number
      };
      LazyUint8Array.prototype.get = function(idx) {
        if (idx > this.length - 1 || idx < 0) {
          return undefined;
        }
        var chunkOffset = idx % this.chunkSize;
        var chunkNum = Math.floor(idx / this.chunkSize);
        return this.getter(chunkNum)[chunkOffset];
      };
      LazyUint8Array.prototype.setDataGetter = function(getter) {
        this.getter = getter;
      };
      LazyUint8Array.prototype.cacheLength = function() {
        // Find length
        var xhr = new XMLHttpRequest();
        xhr.open('HEAD', url, false);
        xhr.send(null);
        if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
          throw new Error("Couldn't load " + url + '. Status: ' + xhr.status);
        var datalength = Number(xhr.getResponseHeader('Content-length'));
        var header;
        var hasByteServing =
          (header = xhr.getResponseHeader('Accept-Ranges')) &&
          header === 'bytes';
        var chunkSize = 1024 * 1024; // Chunk size in bytes
        if (!hasByteServing) chunkSize = datalength;
        // Function to get a range from the remote URL.
        var doXHR = function(from, to) {
          if (from > to)
            throw new Error(
              'invalid range (' + from + ', ' + to + ') or no bytes requested!'
            );
          if (to > datalength - 1)
            throw new Error(
              'only ' + datalength + ' bytes available! programmer error!'
            );
          // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, false);
          if (datalength !== chunkSize)
            xhr.setRequestHeader('Range', 'bytes=' + from + '-' + to);
          // Some hints to the browser that we want binary data.
          if (typeof Uint8Array != 'undefined')
            xhr.responseType = 'arraybuffer';
          if (xhr.overrideMimeType) {
            xhr.overrideMimeType('text/plain; charset=x-user-defined');
          }
          xhr.send(null);
          if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
            throw new Error("Couldn't load " + url + '. Status: ' + xhr.status);
          if (xhr.response !== undefined) {
            return new Uint8Array(xhr.response || []);
          } else {
            return intArrayFromString(xhr.responseText || '', true);
          }
        };
        var lazyArray = this;
        lazyArray.setDataGetter(function(chunkNum) {
          var start = chunkNum * chunkSize;
          var end = (chunkNum + 1) * chunkSize - 1; // including this byte
          end = Math.min(end, datalength - 1); // if datalength-1 is selected, this is the last block
          if (typeof lazyArray.chunks[chunkNum] === 'undefined') {
            lazyArray.chunks[chunkNum] = doXHR(start, end);
          }
          if (typeof lazyArray.chunks[chunkNum] === 'undefined')
            throw new Error('doXHR failed!');
          return lazyArray.chunks[chunkNum];
        });
        this._length = datalength;
        this._chunkSize = chunkSize;
        this.lengthKnown = true;
      };
      var lazyArray = new LazyUint8Array();
      Object.defineProperty(lazyArray, 'length', {
        get: function() {
          if (!this.lengthKnown) {
            this.cacheLength();
          }
          return this._length;
        },
      });
      Object.defineProperty(lazyArray, 'chunkSize', {
        get: function() {
          if (!this.lengthKnown) {
            this.cacheLength();
          }
          return this._chunkSize;
        },
      });
      var properties = {isDevice: false, contents: lazyArray};
    } else {
      var properties = {isDevice: false, url: url};
    }
    return FS.createFile(parent, name, properties, canRead, canWrite);
  },
  createPreloadedFile: function(
    parent,
    name,
    url,
    canRead,
    canWrite,
    onload,
    onerror,
    dontCreateFile
  ) {
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
      Browser.asyncLoad(
        url,
        function(byteArray) {
          processData(byteArray);
        },
        onerror
      );
    } else {
      processData(url);
    }
  },
  createLink: function(parent, name, target, canRead, canWrite) {
    var properties = {isDevice: false, link: target};
    return FS.createFile(parent, name, properties, canRead, canWrite);
  },
  createDevice: function(parent, name, input, output) {
    if (!(input || output)) {
      throw new Error('A device must have at least one callback defined.');
    }
    var ops = {isDevice: true, input: input, output: output};
    return FS.createFile(parent, name, ops, Boolean(input), Boolean(output));
  },
  forceLoadFile: function(obj) {
    if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
    var success = true;
    if (typeof XMLHttpRequest !== 'undefined') {
      throw new Error(
        'Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.'
      );
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
  },
  ensureRoot: function() {
    if (FS.root) return;
    // The main file system tree. All the contents are inside this.
    FS.root = {
      read: true,
      write: true,
      isFolder: true,
      isDevice: false,
      timestamp: Date.now(),
      inodeNumber: 1,
      contents: {},
    };
  },
  init: function(input, output, error) {
    // Make sure we initialize only once.
    assert(
      !FS.init.initialized,
      'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)'
    );
    FS.init.initialized = true;
    FS.ensureRoot();
    // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
    input = input || Module['stdin'];
    output = output || Module['stdout'];
    error = error || Module['stderr'];
    // Default handlers.
    var stdinOverridden = true,
      stdoutOverridden = true,
      stderrOverridden = true;
    if (!input) {
      stdinOverridden = false;
      input = function() {
        if (!input.cache || !input.cache.length) {
          var result;
          if (
            typeof window != 'undefined' &&
            typeof window.prompt == 'function'
          ) {
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
    } catch (e) {}
    // Create the I/O devices.
    var devFolder = FS.createFolder('/', 'dev', true, true);
    var stdin = FS.createDevice(devFolder, 'stdin', input);
    stdin.isTerminal = !stdinOverridden;
    var stdout = FS.createDevice(devFolder, 'stdout', null, output);
    stdout.isTerminal = !stdoutOverridden;
    var stderr = FS.createDevice(devFolder, 'stderr', null, error);
    stderr.isTerminal = !stderrOverridden;
    FS.createDevice(devFolder, 'tty', input, output);
    FS.createDevice(
      devFolder,
      'null',
      function() {},
      function() {}
    );
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
      ungotten: [],
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
      ungotten: [],
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
      ungotten: [],
    };
    // TODO: put these low in memory like we used to assert on: assert(Math.max(_stdin, _stdout, _stderr) < 15000); // make sure these are low, we flatten arrays with these
    HEAP32[_stdin >> 2] = 1;
    HEAP32[_stdout >> 2] = 2;
    HEAP32[_stderr >> 2] = 3;
    // Other system paths
    FS.createPath('/', 'dev/shm/tmp', true, true); // temp files
    // Newlib initialization
    for (
      var i = FS.streams.length;
      i < Math.max(_stdin, _stdout, _stderr) + 4;
      i++
    ) {
      FS.streams[i] = null; // Make sure to keep FS.streams dense
    }
    FS.streams[_stdin] = FS.streams[1];
    FS.streams[_stdout] = FS.streams[2];
    FS.streams[_stderr] = FS.streams[3];
    allocate(
      [
        allocate(
          [0, 0, 0, 0, _stdin, 0, 0, 0, _stdout, 0, 0, 0, _stderr, 0, 0, 0],
          'void*',
          ALLOC_NORMAL
        ),
      ],
      'void*',
      ALLOC_NONE,
      __impure_ptr
    );
  },
  quit: function() {
    if (!FS.init.initialized) return;
    // Flush any partially-printed lines in stdout and stderr. Careful, they may have been closed
    if (FS.streams[2] && FS.streams[2].object.output.buffer.length > 0)
      FS.streams[2].object.output(10);
    if (FS.streams[3] && FS.streams[3].object.output.buffer.length > 0)
      FS.streams[3].object.output(10);
  },
  standardizePath: function(path) {
    if (path.substr(0, 2) == './') path = path.substr(2);
    return path;
  },
  deleteFile: function(path) {
    path = FS.analyzePath(path);
    if (!path.parentExists || !path.exists) {
      throw 'Invalid path ' + path;
    }
    delete path.parentObject.contents[path.name];
  },
};
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
}
function _fclose(stream) {
  // int fclose(FILE *stream);
  // http://pubs.opengroup.org/onlinepubs/000095399/functions/fclose.html
  _fsync(stream);
  return _close(stream);
}
var ___dirent_struct_layout = {
  __size__: 1040,
  d_ino: 0,
  d_name: 4,
  d_off: 1028,
  d_reclen: 1032,
  d_type: 1036,
};
function _open(path, oflag, varargs) {
  // int open(const char *path, int oflag, ...);
  // http://pubs.opengroup.org/onlinepubs/009695399/functions/open.html
  // NOTE: This implementation tries to mimic glibc rather than strictly
  // following the POSIX standard.
  var mode = HEAP32[varargs >> 2];
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
    if ((isRead && !target.read) || (isWrite && !target.write)) {
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
    target = FS.createDataFile(
      path.parentObject,
      path.name,
      [],
      mode & 0x100,
      mode & 0x80
    ); // S_IRUSR, S_IWUSR.
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
      currentEntry: entryBuffer,
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
      ungotten: [],
    });
  }
  return id;
}
function _fopen(filename, mode) {
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
  var ret = _open(
    filename,
    flags,
    allocate([0x1ff, 0, 0, 0], 'i32', ALLOC_STACK)
  ); // All creation permissions.
  return ret == -1 ? 0 : ret;
}
Module['_strlen'] = _strlen;
Module['_memcpy'] = _memcpy;
var _llvm_memcpy_p0i8_p0i8_i32 = _memcpy;
function _strncmp(px, py, n) {
  var i = 0;
  while (i < n) {
    var x = HEAPU8[(px + i) | 0];
    var y = HEAPU8[(py + i) | 0];
    if (x == y && x == 0) return 0;
    if (x == 0) return -1;
    if (y == 0) return 1;
    if (x == y) {
      i++;
      continue;
    } else {
      return x > y ? 1 : -1;
    }
  }
  return 0;
}
function _strcmp(px, py) {
  return _strncmp(px, py, TOTAL_MEMORY);
}
function _fflush(stream) {
  // int fflush(FILE *stream);
  // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
  var flush = function(filedes) {
    // Right now we write all data directly, except for output devices.
    if (FS.streams[filedes] && FS.streams[filedes].object.output) {
      if (!FS.streams[filedes].object.isTerminal) {
        // don't flush terminals, it would cause a \n to also appear
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
function _lseek(fildes, offset, whence) {
  // off_t lseek(int fildes, off_t offset, int whence);
  // http://pubs.opengroup.org/onlinepubs/000095399/functions/lseek.html
  if (FS.streams[fildes] && !FS.streams[fildes].object.isDevice) {
    var stream = FS.streams[fildes];
    var position = offset;
    if (whence === 1) {
      // SEEK_CUR.
      position += stream.position;
    } else if (whence === 2) {
      // SEEK_END.
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
}
function _fseek(stream, offset, whence) {
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
function _rewind(stream) {
  // void rewind(FILE *stream);
  // http://pubs.opengroup.org/onlinepubs/000095399/functions/rewind.html
  _fseek(stream, 0, 0); // SEEK_SET.
  if (FS.streams[stream]) FS.streams[stream].error = false;
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
function _feof(stream) {
  // int feof(FILE *stream);
  // http://pubs.opengroup.org/onlinepubs/000095399/functions/feof.html
  return Number(FS.streams[stream] && FS.streams[stream].eof);
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
      HEAP8[buf++ | 0] = stream.ungotten.pop();
      nbyte--;
      bytesRead++;
    }
    var contents = stream.object.contents;
    var size = Math.min(contents.length - offset, nbyte);
    if (contents.subarray) {
      // typed array
      HEAPU8.set(contents.subarray(offset, offset + size), buf);
    } else if (contents.slice) {
      // normal array
      for (var i = 0; i < size; i++) {
        HEAP8[(buf + i) | 0] = contents[offset + i];
      }
    } else {
      for (var i = 0; i < size; i++) {
        // LazyUint8Array from sync binary XHR
        HEAP8[(buf + i) | 0] = contents.get(offset + i);
      }
    }
    bytesRead += size;
    return bytesRead;
  }
}
function _read(fildes, buf, nbyte) {
  // ssize_t read(int fildes, void *buf, size_t nbyte);
  // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
  var stream = FS.streams[fildes];
  if (stream && 'socket' in stream) {
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
          HEAP8[buf++ | 0] = stream.ungotten.pop();
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
          HEAP8[(buf + i) | 0] = result;
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
        stream.position += stream.ungotten.length - ungotSize + bytesRead;
      }
      return bytesRead;
    }
  }
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
    return HEAPU8[_fgetc.ret | 0];
  }
}
function _send(fd, buf, len, flags) {
  var info = FS.streams[fd];
  if (!info) return -1;
  info.sender(HEAPU8.subarray(buf, buf + len));
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
      contents[offset + i] = HEAPU8[(buf + i) | 0];
    }
    stream.object.timestamp = Date.now();
    return i;
  }
}
function _write(fildes, buf, nbyte) {
  // ssize_t write(int fildes, const void *buf, size_t nbyte);
  // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
  var stream = FS.streams[fildes];
  if (stream && 'socket' in stream) {
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
            stream.object.output(HEAP8[(buf + i) | 0]);
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
}
function _fputc(c, stream) {
  // int fputc(int c, FILE *stream);
  // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
  var chr = unSign(c & 0xff);
  HEAP8[_fputc.ret | 0] = chr;
  var ret = _write(stream, _fputc.ret, 1);
  if (ret == -1) {
    if (FS.streams[stream]) FS.streams[stream].error = true;
    return -1;
  } else {
    return chr;
  }
}
Module['_memset'] = _memset;
var _llvm_memset_p0i8_i64 = _memset;
function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop) {
  Module['noExitRuntime'] = true;
  Browser.mainLoop.runner = function() {
    if (ABORT) return;
    if (Browser.mainLoop.queue.length > 0) {
      var start = Date.now();
      var blocker = Browser.mainLoop.queue.shift();
      blocker.func(blocker.arg);
      if (Browser.mainLoop.remainingBlockers) {
        var remaining = Browser.mainLoop.remainingBlockers;
        var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
        if (blocker.counted) {
          Browser.mainLoop.remainingBlockers = next;
        } else {
          // not counted, but move the progress along a tiny bit
          next = next + 0.5; // do not steal all the next one's progress
          Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9;
        }
      }
      console.log(
        'main loop blocker "' +
          blocker.name +
          '" took ' +
          (Date.now() - start) +
          ' ms'
      ); //, left: ' + Browser.mainLoop.remainingBlockers);
      Browser.mainLoop.updateStatus();
      setTimeout(Browser.mainLoop.runner, 0);
      return;
    }
    if (Browser.mainLoop.shouldPause) {
      // catch pauses from non-main loop sources
      Browser.mainLoop.paused = true;
      Browser.mainLoop.shouldPause = false;
      return;
    }
    if (Module['preMainLoop']) {
      Module['preMainLoop']();
    }
    Runtime.dynCall('v', func);
    if (Module['postMainLoop']) {
      Module['postMainLoop']();
    }
    if (Browser.mainLoop.shouldPause) {
      // catch pauses from the main loop itself
      Browser.mainLoop.paused = true;
      Browser.mainLoop.shouldPause = false;
      return;
    }
    Browser.mainLoop.scheduler();
  };
  if (fps && fps > 0) {
    Browser.mainLoop.scheduler = function() {
      setTimeout(Browser.mainLoop.runner, 1000 / fps); // doing this each time means that on exception, we stop
    };
  } else {
    Browser.mainLoop.scheduler = function() {
      Browser.requestAnimationFrame(Browser.mainLoop.runner);
    };
  }
  Browser.mainLoop.scheduler();
  if (simulateInfiniteLoop) {
    throw 'SimulateInfiniteLoop';
  }
}
function _emscripten_cancel_main_loop() {
  Browser.mainLoop.scheduler = null;
  Browser.mainLoop.shouldPause = true;
}
function __reallyNegative(x) {
  return x < 0 || (x === 0 && 1 / x === -Infinity);
}
function __formatString(format, varargs) {
  var textIndex = format;
  var argIndex = 0;
  function getNextArg(type) {
    // NOTE: Explicitly ignoring type safety. Otherwise this fails:
    //       int x = 4; printf("%c\n", (char)x);
    var ret;
    if (type === 'double') {
      ret = HEAPF64[(varargs + argIndex) >> 3];
    } else if (type == 'i64') {
      ret = [
        HEAP32[(varargs + argIndex) >> 2],
        HEAP32[(varargs + (argIndex + 8)) >> 2],
      ];
      argIndex += 8; // each 32-bit chunk is in a 64-bit block
    } else {
      type = 'i32'; // varargs are always i32, i64, or double
      ret = HEAP32[(varargs + argIndex) >> 2];
    }
    argIndex += Math.max(
      Runtime.getNativeFieldSize(type),
      Runtime.getAlignSize(type, null, true)
    );
    return ret;
  }
  var ret = [];
  var curr, next, currArg;
  while (1) {
    var startTextIndex = textIndex;
    curr = HEAP8[textIndex];
    if (curr === 0) break;
    next = HEAP8[(textIndex + 1) | 0];
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
        next = HEAP8[(textIndex + 1) | 0];
      }
      // Handle width.
      var width = 0;
      if (next == 42) {
        width = getNextArg('i32');
        textIndex++;
        next = HEAP8[(textIndex + 1) | 0];
      } else {
        while (next >= 48 && next <= 57) {
          width = width * 10 + (next - 48);
          textIndex++;
          next = HEAP8[(textIndex + 1) | 0];
        }
      }
      // Handle precision.
      var precisionSet = false;
      if (next == 46) {
        var precision = 0;
        precisionSet = true;
        textIndex++;
        next = HEAP8[(textIndex + 1) | 0];
        if (next == 42) {
          precision = getNextArg('i32');
          textIndex++;
        } else {
          while (1) {
            var precisionChr = HEAP8[(textIndex + 1) | 0];
            if (precisionChr < 48 || precisionChr > 57) break;
            precision = precision * 10 + (precisionChr - 48);
            textIndex++;
          }
        }
        next = HEAP8[(textIndex + 1) | 0];
      } else {
        var precision = 6; // Standard default.
      }
      // Handle integer sizes. WARNING: These assume a 32-bit architecture!
      var argSize;
      switch (String.fromCharCode(next)) {
        case 'h':
          var nextNext = HEAP8[(textIndex + 2) | 0];
          if (nextNext == 104) {
            textIndex++;
            argSize = 1; // char (actually i32 in varargs)
          } else {
            argSize = 2; // short (actually i32 in varargs)
          }
          break;
        case 'l':
          var nextNext = HEAP8[(textIndex + 2) | 0];
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
      next = HEAP8[(textIndex + 1) | 0];
      // Handle type specifier.
      switch (String.fromCharCode(next)) {
        case 'd':
        case 'i':
        case 'u':
        case 'o':
        case 'x':
        case 'X':
        case 'p': {
          // Integer.
          var signed = next == 100 || next == 105;
          argSize = argSize || 4;
          var currArg = getNextArg('i' + argSize * 8);
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
            if (argSize == 8 && i64Math)
              argText = i64Math.stringify(origArg[0], origArg[1], null);
            else argText = reSign(currArg, 8 * argSize, 1).toString(10);
          } else if (next == 117) {
            if (argSize == 8 && i64Math)
              argText = i64Math.stringify(origArg[0], origArg[1], true);
            else argText = unSign(currArg, 8 * argSize, 1).toString(10);
            currArg = Math.abs(currArg);
          } else if (next == 111) {
            argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
          } else if (next == 120 || next == 88) {
            prefix = flagAlternative && currArg != 0 ? '0x' : '';
            if (argSize == 8 && i64Math) {
              if (origArg[1]) {
                argText = (origArg[1] >>> 0).toString(16);
                var lower = (origArg[0] >>> 0).toString(16);
                while (lower.length < 8) lower = '0' + lower;
                argText += lower;
              } else {
                argText = (origArg[0] >>> 0).toString(16);
              }
            } else if (currArg < 0) {
              // Represent negative numbers in hex as 2's complement.
              currArg = -currArg;
              argText = (currAbsArg - 1).toString(16);
              var buffer = [];
              for (var i = 0; i < argText.length; i++) {
                buffer.push((0xf - parseInt(argText[i], 16)).toString(16));
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
        case 'f':
        case 'F':
        case 'e':
        case 'E':
        case 'g':
        case 'G': {
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
              var exponent = parseInt(
                currArg.toExponential(effectivePrecision).split('e')[1],
                10
              );
              if (precision > exponent && exponent >= -4) {
                next = (next == 103 ? 'f' : 'F').charCodeAt(0);
                precision -= exponent + 1;
              } else {
                next = (next == 103 ? 'e' : 'E').charCodeAt(0);
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
              while (
                parts[0].length > 1 &&
                parts[0].indexOf('.') != -1 &&
                (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')
              ) {
                parts[0] = parts[0].slice(0, -1);
              }
            } else {
              // Make sure we have a period in alternative mode.
              if (flagAlternative && argText.indexOf('.') == -1)
                parts[0] += '.';
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
              ret.push(HEAPU8[arg++ | 0]);
            }
          } else {
            ret = ret.concat(
              intArrayFromString('(null)'.substr(0, argLength), true)
            );
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
          HEAP32[ptr >> 2] = ret.length;
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
            ret.push(HEAP8[i]);
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
}
function _snprintf(s, n, format, varargs) {
  // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
  // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
  var result = __formatString(format, varargs);
  var limit =
    n === undefined
      ? result.length
      : Math.min(result.length, Math.max(n - 1, 0));
  if (s < 0) {
    s = -s;
    var buf = _malloc(limit + 1);
    HEAP32[s >> 2] = buf;
    s = buf;
  }
  for (var i = 0; i < limit; i++) {
    HEAP8[(s + i) | 0] = result[i];
  }
  if (limit < n || n === undefined) HEAP8[(s + i) | 0] = 0;
  return result.length;
}
function _sprintf(s, format, varargs) {
  // int sprintf(char *restrict s, const char *restrict format, ...);
  // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
  return _snprintf(s, undefined, format, varargs);
}
Module['_strcpy'] = _strcpy;
var _llvm_memset_p0i8_i32 = _memset;
function _llvm_lifetime_start() {}
function _llvm_lifetime_end() {}
function _time(ptr) {
  var ret = Math.floor(Date.now() / 1000);
  if (ptr) {
    HEAP32[ptr >> 2] = ret;
  }
  return ret;
}
var ___tm_struct_layout = {
  __size__: 44,
  tm_sec: 0,
  tm_min: 4,
  tm_hour: 8,
  tm_mday: 12,
  tm_mon: 16,
  tm_year: 20,
  tm_wday: 24,
  tm_yday: 28,
  tm_isdst: 32,
  tm_gmtoff: 36,
  tm_zone: 40,
};
var ___tm_current = allocate(4 * 26, 'i8', ALLOC_STATIC);
var ___tm_timezones = {};
var __tzname = allocate(8, 'i32*', ALLOC_STATIC);
var __daylight = allocate(1, 'i32*', ALLOC_STATIC);
var __timezone = allocate(1, 'i32*', ALLOC_STATIC);
function _tzset() {
  // TODO: Use (malleable) environment variables instead of system settings.
  if (_tzset.called) return;
  _tzset.called = true;
  HEAP32[__timezone >> 2] = -new Date().getTimezoneOffset() * 60;
  var winter = new Date(2000, 0, 1);
  var summer = new Date(2000, 6, 1);
  HEAP32[__daylight >> 2] = Number(
    winter.getTimezoneOffset() != summer.getTimezoneOffset()
  );
  var winterName = 'GMT'; // XXX do not rely on browser timezone info, it is very unpredictable | winter.toString().match(/\(([A-Z]+)\)/)[1];
  var summerName = 'GMT'; // XXX do not rely on browser timezone info, it is very unpredictable | summer.toString().match(/\(([A-Z]+)\)/)[1];
  var winterNamePtr = allocate(
    intArrayFromString(winterName),
    'i8',
    ALLOC_NORMAL
  );
  var summerNamePtr = allocate(
    intArrayFromString(summerName),
    'i8',
    ALLOC_NORMAL
  );
  HEAP32[__tzname >> 2] = winterNamePtr;
  HEAP32[(__tzname + 4) >> 2] = summerNamePtr;
}
function _localtime_r(time, tmPtr) {
  _tzset();
  var offsets = ___tm_struct_layout;
  var date = new Date(HEAP32[time >> 2] * 1000);
  HEAP32[(tmPtr + offsets.tm_sec) >> 2] = date.getSeconds();
  HEAP32[(tmPtr + offsets.tm_min) >> 2] = date.getMinutes();
  HEAP32[(tmPtr + offsets.tm_hour) >> 2] = date.getHours();
  HEAP32[(tmPtr + offsets.tm_mday) >> 2] = date.getDate();
  HEAP32[(tmPtr + offsets.tm_mon) >> 2] = date.getMonth();
  HEAP32[(tmPtr + offsets.tm_year) >> 2] = date.getFullYear() - 1900;
  HEAP32[(tmPtr + offsets.tm_wday) >> 2] = date.getDay();
  var start = new Date(date.getFullYear(), 0, 1);
  var yday = Math.floor(
    (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  HEAP32[(tmPtr + offsets.tm_yday) >> 2] = yday;
  HEAP32[(tmPtr + offsets.tm_gmtoff) >> 2] = start.getTimezoneOffset() * 60;
  var dst = Number(start.getTimezoneOffset() != date.getTimezoneOffset());
  HEAP32[(tmPtr + offsets.tm_isdst) >> 2] = dst;
  var timezone = 'GMT'; // XXX do not rely on browser timezone info, it is very unpredictable | date.toString().match(/\(([A-Z]+)\)/)[1];
  if (!(timezone in ___tm_timezones)) {
    ___tm_timezones[timezone] = allocate(
      intArrayFromString(timezone),
      'i8',
      ALLOC_NORMAL
    );
  }
  HEAP32[(tmPtr + offsets.tm_zone) >> 2] = ___tm_timezones[timezone];
  return tmPtr;
}
function _localtime(time) {
  return _localtime_r(time, ___tm_current);
}
function _gettimeofday(ptr) {
  // %struct.timeval = type { i32, i32 }
  var now = Date.now();
  HEAP32[ptr >> 2] = Math.floor(now / 1000); // seconds
  HEAP32[(ptr + 4) >> 2] = Math.floor(
    (now - 1000 * Math.floor(now / 1000)) * 1000
  ); // microseconds
  return 0;
}
var _llvm_va_start = undefined;
function _llvm_va_end() {}
function _fwrite(ptr, size, nitems, stream) {
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
function _fprintf(stream, format, varargs) {
  // int fprintf(FILE *restrict stream, const char *restrict format, ...);
  // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
  var result = __formatString(format, varargs);
  var stack = Runtime.stackSave();
  var ret = _fwrite(
    allocate(result, 'i8', ALLOC_STACK),
    1,
    result.length,
    stream
  );
  Runtime.stackRestore(stack);
  return ret;
}
function _atexit(func, arg) {
  __ATEXIT__.unshift({func: func, arg: arg});
}
var Browser = {
  mainLoop: {
    scheduler: null,
    shouldPause: false,
    paused: false,
    queue: [],
    pause: function() {
      Browser.mainLoop.shouldPause = true;
    },
    resume: function() {
      if (Browser.mainLoop.paused) {
        Browser.mainLoop.paused = false;
        Browser.mainLoop.scheduler();
      }
      Browser.mainLoop.shouldPause = false;
    },
    updateStatus: function() {
      if (Module['setStatus']) {
        var message = Module['statusMessage'] || 'Please wait...';
        var remaining = Browser.mainLoop.remainingBlockers;
        var expected = Browser.mainLoop.expectedBlockers;
        if (remaining) {
          if (remaining < expected) {
            Module['setStatus'](
              message + ' (' + (expected - remaining) + '/' + expected + ')'
            );
          } else {
            Module['setStatus'](message);
          }
        } else {
          Module['setStatus']('');
        }
      }
    },
  },
  isFullScreen: false,
  pointerLock: false,
  moduleContextCreatedCallbacks: [],
  workers: [],
  init: function() {
    if (!Module['preloadPlugins']) Module['preloadPlugins'] = []; // needs to exist even in workers
    if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
    Browser.initted = true;
    try {
      new Blob();
      Browser.hasBlobConstructor = true;
    } catch (e) {
      Browser.hasBlobConstructor = false;
      console.log(
        'warning: no blob constructor, cannot create blobs with mimetypes'
      );
    }
    Browser.BlobBuilder =
      typeof MozBlobBuilder != 'undefined'
        ? MozBlobBuilder
        : typeof WebKitBlobBuilder != 'undefined'
        ? WebKitBlobBuilder
        : !Browser.hasBlobConstructor
        ? console.log('warning: no BlobBuilder')
        : null;
    Browser.URLObject =
      typeof window != 'undefined'
        ? window.URL
          ? window.URL
          : window.webkitURL
        : console.log('warning: cannot create object URLs');
    // Support for plugins that can process preloaded files. You can add more of these to
    // your app by creating and appending to Module.preloadPlugins.
    //
    // Each plugin is asked if it can handle a file based on the file's name. If it can,
    // it is given the file's raw data. When it is done, it calls a callback with the file's
    // (possibly modified) data. For example, a plugin might decompress a file, or it
    // might create some side data structure for use later (like an Image element, etc.).
    function getMimetype(name) {
      return {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        bmp: 'image/bmp',
        ogg: 'audio/ogg',
        wav: 'audio/wav',
        mp3: 'audio/mpeg',
      }[name.substr(name.lastIndexOf('.') + 1)];
    }
    var imagePlugin = {};
    imagePlugin['canHandle'] = function(name) {
      return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
    };
    imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
      var b = null;
      if (Browser.hasBlobConstructor) {
        try {
          b = new Blob([byteArray], {type: getMimetype(name)});
          if (b.size !== byteArray.length) {
            // Safari bug #118630
            // Safari's Blob can only take an ArrayBuffer
            b = new Blob([new Uint8Array(byteArray).buffer], {
              type: getMimetype(name),
            });
          }
        } catch (e) {
          Runtime.warnOnce(
            'Blob constructor present but fails: ' +
              e +
              '; falling back to blob builder'
          );
        }
      }
      if (!b) {
        var bb = new Browser.BlobBuilder();
        bb.append(new Uint8Array(byteArray).buffer); // we need to pass a buffer, and must copy the array to get the right data range
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
        Module['preloadedImages'][name] = canvas;
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
      return (
        !Module.noAudioDecoding &&
        name.substr(-4) in {'.ogg': 1, '.wav': 1, '.mp3': 1}
      );
    };
    audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
      var done = false;
      function finish(audio) {
        if (done) return;
        done = true;
        Module['preloadedAudios'][name] = audio;
        if (onload) onload(byteArray);
      }
      function fail() {
        if (done) return;
        done = true;
        Module['preloadedAudios'][name] = new Audio(); // empty shim
        if (onerror) onerror();
      }
      if (Browser.hasBlobConstructor) {
        try {
          var b = new Blob([byteArray], {type: getMimetype(name)});
        } catch (e) {
          return fail();
        }
        var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
        var audio = new Audio();
        audio.addEventListener(
          'canplaythrough',
          function() {
            finish(audio);
          },
          false
        ); // use addEventListener due to chromium bug 124926
        audio.onerror = function(event) {
          if (done) return;
          console.log(
            'warning: browser could not fully decode audio ' +
              name +
              ', trying slower base64 approach'
          );
          function encode64(data) {
            var BASE =
              'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
            var PAD = '=';
            var ret = '';
            var leftchar = 0;
            var leftbits = 0;
            for (var i = 0; i < data.length; i++) {
              leftchar = (leftchar << 8) | data[i];
              leftbits += 8;
              while (leftbits >= 6) {
                var curr = (leftchar >> (leftbits - 6)) & 0x3f;
                leftbits -= 6;
                ret += BASE[curr];
              }
            }
            if (leftbits == 2) {
              ret += BASE[(leftchar & 3) << 4];
              ret += PAD + PAD;
            } else if (leftbits == 4) {
              ret += BASE[(leftchar & 0xf) << 2];
              ret += PAD;
            }
            return ret;
          }
          audio.src =
            'data:audio/x-' +
            name.substr(-3) +
            ';base64,' +
            encode64(byteArray);
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
    canvas.requestPointerLock =
      canvas['requestPointerLock'] ||
      canvas['mozRequestPointerLock'] ||
      canvas['webkitRequestPointerLock'];
    canvas.exitPointerLock =
      document['exitPointerLock'] ||
      document['mozExitPointerLock'] ||
      document['webkitExitPointerLock'] ||
      function() {}; // no-op if function does not exist
    canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
    function pointerLockChange() {
      Browser.pointerLock =
        document['pointerLockElement'] === canvas ||
        document['mozPointerLockElement'] === canvas ||
        document['webkitPointerLockElement'] === canvas;
    }
    document.addEventListener('pointerlockchange', pointerLockChange, false);
    document.addEventListener('mozpointerlockchange', pointerLockChange, false);
    document.addEventListener(
      'webkitpointerlockchange',
      pointerLockChange,
      false
    );
    if (Module['elementPointerLock']) {
      canvas.addEventListener(
        'click',
        function(ev) {
          if (!Browser.pointerLock && canvas.requestPointerLock) {
            canvas.requestPointerLock();
            ev.preventDefault();
          }
        },
        false
      );
    }
  },
  createContext: function(canvas, useWebGL, setInModule) {
    var ctx;
    try {
      if (useWebGL) {
        ctx = canvas.getContext('experimental-webgl', {
          alpha: false,
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
      canvas.style.backgroundColor = 'black';
      // Warn on context loss
      canvas.addEventListener(
        'webglcontextlost',
        function(event) {
          alert('WebGL context lost. You will need to reload the page.');
        },
        false
      );
    }
    if (setInModule) {
      Module.ctx = ctx;
      Module.useWebGL = useWebGL;
      Browser.moduleContextCreatedCallbacks.forEach(function(callback) {
        callback();
      });
      Browser.init();
    }
    return ctx;
  },
  destroyContext: function(canvas, useWebGL, setInModule) {},
  fullScreenHandlersInstalled: false,
  lockPointer: undefined,
  resizeCanvas: undefined,
  requestFullScreen: function(lockPointer, resizeCanvas) {
    Browser.lockPointer = lockPointer;
    Browser.resizeCanvas = resizeCanvas;
    if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
    if (typeof Browser.resizeCanvas === 'undefined')
      Browser.resizeCanvas = false;
    var canvas = Module['canvas'];
    function fullScreenChange() {
      Browser.isFullScreen = false;
      if (
        (document['webkitFullScreenElement'] ||
          document['webkitFullscreenElement'] ||
          document['mozFullScreenElement'] ||
          document['mozFullscreenElement'] ||
          document['fullScreenElement'] ||
          document['fullscreenElement']) === canvas
      ) {
        canvas.cancelFullScreen =
          document['cancelFullScreen'] ||
          document['mozCancelFullScreen'] ||
          document['webkitCancelFullScreen'];
        canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
        if (Browser.lockPointer) canvas.requestPointerLock();
        Browser.isFullScreen = true;
        if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
      } else if (Browser.resizeCanvas) {
        Browser.setWindowedCanvasSize();
      }
      if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
    }
    if (!Browser.fullScreenHandlersInstalled) {
      Browser.fullScreenHandlersInstalled = true;
      document.addEventListener('fullscreenchange', fullScreenChange, false);
      document.addEventListener('mozfullscreenchange', fullScreenChange, false);
      document.addEventListener(
        'webkitfullscreenchange',
        fullScreenChange,
        false
      );
    }
    canvas.requestFullScreen =
      canvas['requestFullScreen'] ||
      canvas['mozRequestFullScreen'] ||
      (canvas['webkitRequestFullScreen']
        ? function() {
            canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']);
          }
        : null);
    canvas.requestFullScreen();
  },
  requestAnimationFrame: function(func) {
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame =
        window['requestAnimationFrame'] ||
        window['mozRequestAnimationFrame'] ||
        window['webkitRequestAnimationFrame'] ||
        window['msRequestAnimationFrame'] ||
        window['oRequestAnimationFrame'] ||
        window['setTimeout'];
    }
    window.requestAnimationFrame(func);
  },
  safeCallback: function(func) {
    return function() {
      if (!ABORT) return func.apply(null, arguments);
    };
  },
  safeRequestAnimationFrame: function(func) {
    return Browser.requestAnimationFrame(function() {
      if (!ABORT) func();
    });
  },
  safeSetTimeout: function(func, timeout) {
    return setTimeout(function() {
      if (!ABORT) func();
    }, timeout);
  },
  safeSetInterval: function(func, timeout) {
    return setInterval(function() {
      if (!ABORT) func();
    }, timeout);
  },
  getUserMedia: function(func) {
    if (!window.getUserMedia) {
      window.getUserMedia =
        navigator['getUserMedia'] || navigator['mozGetUserMedia'];
    }
    window.getUserMedia(func);
  },
  getMovementX: function(event) {
    return (
      event['movementX'] ||
      event['mozMovementX'] ||
      event['webkitMovementX'] ||
      0
    );
  },
  getMovementY: function(event) {
    return (
      event['movementY'] ||
      event['mozMovementY'] ||
      event['webkitMovementY'] ||
      0
    );
  },
  mouseX: 0,
  mouseY: 0,
  mouseMovementX: 0,
  mouseMovementY: 0,
  calculateMouseEvent: function(event) {
    // event should be mousemove, mousedown or mouseup
    if (Browser.pointerLock) {
      // When the pointer is locked, calculate the coordinates
      // based on the movement of the mouse.
      // Workaround for Firefox bug 764498
      if (event.type != 'mousemove' && 'mozMovementX' in event) {
        Browser.mouseMovementX = Browser.mouseMovementY = 0;
      } else {
        Browser.mouseMovementX = Browser.getMovementX(event);
        Browser.mouseMovementY = Browser.getMovementY(event);
      }
      // check if SDL is available
      if (typeof SDL != 'undefined') {
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
      if (Module['canvasFront']) {
        var rect = Module['canvasFront'].getBoundingClientRect();
      } else {
        var rect = Module['canvas'].getBoundingClientRect();
      }
      var x = event.pageX - (window.scrollX + rect.left);
      var y = event.pageY - (window.scrollY + rect.top);
      // the canvas might be CSS-scaled compared to its backbuffer;
      // SDL-using content will want mouse coordinates in terms
      // of backbuffer units.
      var cw = Module['canvas'].width;
      var ch = Module['canvas'].height;
      x = x * (cw / rect.width);
      y = y * (ch / rect.height);
      Browser.mouseMovementX = x - Browser.mouseX;
      Browser.mouseMovementY = y - Browser.mouseY;
      Browser.mouseX = x;
      Browser.mouseY = y;
    }
  },
  xhrLoad: function(url, onload, onerror) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function() {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
        // file URLs can return 0
        onload(xhr.response);
      } else {
        onerror();
      }
    };
    xhr.onerror = onerror;
    xhr.send(null);
  },
  asyncLoad: function(url, onload, onerror, noRunDep) {
    Browser.xhrLoad(
      url,
      function(arrayBuffer) {
        assert(
          arrayBuffer,
          'Loading data file "' + url + '" failed (no arrayBuffer).'
        );
        onload(new Uint8Array(arrayBuffer));
        if (!noRunDep) removeRunDependency('al ' + url);
      },
      function(event) {
        if (onerror) {
          onerror();
        } else {
          throw 'Loading data file "' + url + '" failed.';
        }
      }
    );
    if (!noRunDep) addRunDependency('al ' + url);
  },
  resizeListeners: [],
  updateResizeListeners: function() {
    var canvas = Module['canvas'];
    Browser.resizeListeners.forEach(function(listener) {
      listener(canvas.width, canvas.height);
    });
  },
  setCanvasSize: function(width, height, noUpdates) {
    var canvas = Module['canvas'];
    canvas.width = width;
    canvas.height = height;
    if (!noUpdates) Browser.updateResizeListeners();
  },
  windowedWidth: 0,
  windowedHeight: 0,
  setFullScreenCanvasSize: function() {
    var canvas = Module['canvas'];
    this.windowedWidth = canvas.width;
    this.windowedHeight = canvas.height;
    canvas.width = screen.width;
    canvas.height = screen.height;
    // check if SDL is available
    if (typeof SDL != 'undefined') {
      var flags = HEAPU32[(SDL.screen + Runtime.QUANTUM_SIZE * 0) >> 2];
      flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
      HEAP32[(SDL.screen + Runtime.QUANTUM_SIZE * 0) >> 2] = flags;
    }
    Browser.updateResizeListeners();
  },
  setWindowedCanvasSize: function() {
    var canvas = Module['canvas'];
    canvas.width = this.windowedWidth;
    canvas.height = this.windowedHeight;
    // check if SDL is available
    if (typeof SDL != 'undefined') {
      var flags = HEAPU32[(SDL.screen + Runtime.QUANTUM_SIZE * 0) >> 2];
      flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
      HEAP32[(SDL.screen + Runtime.QUANTUM_SIZE * 0) >> 2] = flags;
    }
    Browser.updateResizeListeners();
  },
};
var SDL = {
  defaults: {width: 320, height: 200, copyOnLock: true},
  version: null,
  surfaces: {},
  canvasPool: [],
  events: [],
  fonts: [null],
  audios: [null],
  music: {audio: null, volume: 1},
  mixerFrequency: 22050,
  mixerFormat: 32784,
  mixerNumChannels: 2,
  mixerChunkSize: 1024,
  channelMinimumNumber: 0,
  GL: false,
  keyboardState: null,
  keyboardMap: {},
  textInput: false,
  startTime: null,
  buttonState: 0,
  modState: 0,
  DOMButtons: [0, 0, 0],
  DOMEventToSDLEvent: {},
  keyCodes: {
    16: 1249,
    17: 1248,
    18: 1250,
    33: 1099,
    34: 1102,
    37: 1104,
    38: 1106,
    39: 1103,
    40: 1105,
    46: 127,
    96: 1112,
    97: 1113,
    98: 1114,
    99: 1115,
    100: 1116,
    101: 1117,
    102: 1118,
    103: 1119,
    104: 1120,
    105: 1121,
    112: 1082,
    113: 1083,
    114: 1084,
    115: 1085,
    116: 1086,
    117: 1087,
    118: 1088,
    119: 1089,
    120: 1090,
    121: 1091,
    122: 1092,
    123: 1093,
    173: 45,
    188: 44,
    190: 46,
    191: 47,
    192: 96,
  },
  scanCodes: {
    9: 43,
    13: 40,
    27: 41,
    32: 44,
    44: 54,
    46: 55,
    47: 56,
    48: 39,
    49: 30,
    50: 31,
    51: 32,
    52: 33,
    53: 34,
    54: 35,
    55: 36,
    56: 37,
    57: 38,
    92: 49,
    97: 4,
    98: 5,
    99: 6,
    100: 7,
    101: 8,
    102: 9,
    103: 10,
    104: 11,
    105: 12,
    106: 13,
    107: 14,
    108: 15,
    109: 16,
    110: 17,
    111: 18,
    112: 19,
    113: 20,
    114: 21,
    115: 22,
    116: 23,
    117: 24,
    118: 25,
    119: 26,
    120: 27,
    121: 28,
    122: 29,
    305: 224,
    308: 226,
  },
  structs: {
    Rect: {__size__: 16, x: 0, y: 4, w: 8, h: 12},
    PixelFormat: {
      __size__: 36,
      format: 0,
      palette: 4,
      BitsPerPixel: 8,
      BytesPerPixel: 9,
      padding1: 10,
      padding2: 11,
      Rmask: 12,
      Gmask: 16,
      Bmask: 20,
      Amask: 24,
      Rloss: 28,
      Gloss: 29,
      Bloss: 30,
      Aloss: 31,
      Rshift: 32,
      Gshift: 33,
      Bshift: 34,
      Ashift: 35,
    },
    KeyboardEvent: {
      __size__: 16,
      type: 0,
      windowID: 4,
      state: 8,
      repeat: 9,
      padding2: 10,
      padding3: 11,
      keysym: 12,
    },
    keysym: {__size__: 16, scancode: 0, sym: 4, mod: 8, unicode: 12},
    TextInputEvent: {__size__: 264, type: 0, windowID: 4, text: 8},
    MouseMotionEvent: {
      __size__: 28,
      type: 0,
      windowID: 4,
      state: 8,
      padding1: 9,
      padding2: 10,
      padding3: 11,
      x: 12,
      y: 16,
      xrel: 20,
      yrel: 24,
    },
    MouseButtonEvent: {
      __size__: 20,
      type: 0,
      windowID: 4,
      button: 8,
      state: 9,
      padding1: 10,
      padding2: 11,
      x: 12,
      y: 16,
    },
    ResizeEvent: {__size__: 12, type: 0, w: 4, h: 8},
    AudioSpec: {
      __size__: 24,
      freq: 0,
      format: 4,
      channels: 6,
      silence: 7,
      samples: 8,
      size: 12,
      callback: 16,
      userdata: 20,
    },
    version: {__size__: 3, major: 0, minor: 1, patch: 2},
  },
  loadRect: function(rect) {
    return {
      x: HEAP32[(rect + SDL.structs.Rect.x) >> 2],
      y: HEAP32[(rect + SDL.structs.Rect.y) >> 2],
      w: HEAP32[(rect + SDL.structs.Rect.w) >> 2],
      h: HEAP32[(rect + SDL.structs.Rect.h) >> 2],
    };
  },
  loadColorToCSSRGB: function(color) {
    var rgba = HEAP32[color >> 2];
    return (
      'rgb(' +
      (rgba & 255) +
      ',' +
      ((rgba >> 8) & 255) +
      ',' +
      ((rgba >> 16) & 255) +
      ')'
    );
  },
  loadColorToCSSRGBA: function(color) {
    var rgba = HEAP32[color >> 2];
    return (
      'rgba(' +
      (rgba & 255) +
      ',' +
      ((rgba >> 8) & 255) +
      ',' +
      ((rgba >> 16) & 255) +
      ',' +
      ((rgba >> 24) & 255) / 255 +
      ')'
    );
  },
  translateColorToCSSRGBA: function(rgba) {
    return (
      'rgba(' +
      (rgba & 0xff) +
      ',' +
      ((rgba >> 8) & 0xff) +
      ',' +
      ((rgba >> 16) & 0xff) +
      ',' +
      (rgba >>> 24) / 0xff +
      ')'
    );
  },
  translateRGBAToCSSRGBA: function(r, g, b, a) {
    return (
      'rgba(' +
      (r & 0xff) +
      ',' +
      (g & 0xff) +
      ',' +
      (b & 0xff) +
      ',' +
      (a & 0xff) / 255 +
      ')'
    );
  },
  translateRGBAToColor: function(r, g, b, a) {
    return r | (g << 8) | (b << 16) | (a << 24);
  },
  makeSurface: function(
    width,
    height,
    flags,
    usePageCanvas,
    source,
    rmask,
    gmask,
    bmask,
    amask
  ) {
    flags = flags || 0;
    var surf = _malloc(14 * Runtime.QUANTUM_SIZE); // SDL_Surface has 14 fields of quantum size
    var buffer = _malloc(width * height * 4); // TODO: only allocate when locked the first time
    var pixelFormat = _malloc(18 * Runtime.QUANTUM_SIZE);
    flags |= 1; // SDL_HWSURFACE - this tells SDL_MUSTLOCK that this needs to be locked
    //surface with SDL_HWPALETTE flag is 8bpp surface (1 byte)
    var is_SDL_HWPALETTE = flags & 0x00200000;
    var bpp = is_SDL_HWPALETTE ? 1 : 4;
    HEAP32[(surf + Runtime.QUANTUM_SIZE * 0) >> 2] = flags; // SDL_Surface.flags
    HEAP32[(surf + Runtime.QUANTUM_SIZE * 1) >> 2] = pixelFormat; // SDL_Surface.format TODO
    HEAP32[(surf + Runtime.QUANTUM_SIZE * 2) >> 2] = width; // SDL_Surface.w
    HEAP32[(surf + Runtime.QUANTUM_SIZE * 3) >> 2] = height; // SDL_Surface.h
    HEAP32[(surf + Runtime.QUANTUM_SIZE * 4) >> 2] = width * bpp; // SDL_Surface.pitch, assuming RGBA or indexed for now,
    // since that is what ImageData gives us in browsers
    HEAP32[(surf + Runtime.QUANTUM_SIZE * 5) >> 2] = buffer; // SDL_Surface.pixels
    HEAP32[(surf + Runtime.QUANTUM_SIZE * 6) >> 2] = 0; // SDL_Surface.offset
    HEAP32[(pixelFormat + SDL.structs.PixelFormat.format) >> 2] = -2042224636; // SDL_PIXELFORMAT_RGBA8888
    HEAP32[(pixelFormat + SDL.structs.PixelFormat.palette) >> 2] = 0; // TODO
    HEAP8[(pixelFormat + SDL.structs.PixelFormat.BitsPerPixel) | 0] = bpp * 8;
    HEAP8[(pixelFormat + SDL.structs.PixelFormat.BytesPerPixel) | 0] = bpp;
    HEAP32[(pixelFormat + SDL.structs.PixelFormat.Rmask) >> 2] =
      rmask || 0x000000ff;
    HEAP32[(pixelFormat + SDL.structs.PixelFormat.Gmask) >> 2] =
      gmask || 0x0000ff00;
    HEAP32[(pixelFormat + SDL.structs.PixelFormat.Bmask) >> 2] =
      bmask || 0x00ff0000;
    HEAP32[(pixelFormat + SDL.structs.PixelFormat.Amask) >> 2] =
      amask || 0xff000000;
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
      isFlagSet: function(flag) {
        return flags & flag;
      },
    };
    return surf;
  },
  copyIndexedColorData: function(surfData, rX, rY, rW, rH) {
    // HWPALETTE works with palette
    // setted by SDL_SetColors
    if (!surfData.colors) {
      return;
    }
    var fullWidth = Module['canvas'].width;
    var fullHeight = Module['canvas'].height;
    var startX = rX || 0;
    var startY = rY || 0;
    var endX = (rW || fullWidth - startX) + startX;
    var endY = (rH || fullHeight - startY) + startY;
    var buffer = surfData.buffer;
    var data = surfData.image.data;
    var colors = surfData.colors;
    for (var y = startY; y < endY; ++y) {
      var indexBase = y * fullWidth;
      var colorBase = indexBase * 4;
      for (var x = startX; x < endX; ++x) {
        // HWPALETTE have only 256 colors (not rgba)
        var index = HEAPU8[(buffer + indexBase + x) | 0] * 3;
        var colorOffset = colorBase + x * 4;
        data[colorOffset] = colors[index];
        data[colorOffset + 1] = colors[index + 1];
        data[colorOffset + 2] = colors[index + 2];
        //unused: data[colorOffset +3] = color[index +3];
      }
    }
  },
  freeSurface: function(surf) {
    var info = SDL.surfaces[surf];
    if (!info) return; // surface has already been freed
    if (!info.usePageCanvas && info.canvas) SDL.canvasPool.push(info.canvas);
    _free(info.buffer);
    _free(info.pixelFormat);
    _free(surf);
    SDL.surfaces[surf] = null;
  },
  touchX: 0,
  touchY: 0,
  receiveEvent: function(event) {
    switch (event.type) {
      case 'touchstart':
        event.preventDefault();
        var touch = event.touches[0];
        touchX = touch.pageX;
        touchY = touch.pageY;
        var event = {
          type: 'mousedown',
          button: 0,
          pageX: touchX,
          pageY: touchY,
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
          pageY: touchY,
        };
        SDL.events.push(event);
        break;
      case 'touchend':
        event.preventDefault();
        event = {
          type: 'mouseup',
          button: 0,
          pageX: touchX,
          pageY: touchY,
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
      case 'keydown':
      case 'keyup':
      case 'keypress':
      case 'mousedown':
      case 'mouseup':
      case 'DOMMouseScroll':
      case 'mousewheel':
        if (event.type == 'DOMMouseScroll' || event.type == 'mousewheel') {
          var button =
            (event.type == 'DOMMouseScroll'
              ? event.detail
              : -event.wheelDelta) > 0
              ? 4
              : 3;
          var event2 = {
            type: 'mousedown',
            button: button,
            pageX: event.pageX,
            pageY: event.pageY,
          };
          SDL.events.push(event2);
          event = {
            type: 'mouseup',
            button: button,
            pageX: event.pageX,
            pageY: event.pageY,
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
              pageY: event.pageY,
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
            keyCode: SDL.keyboardMap[code],
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
  },
  makeCEvent: function(event, ptr) {
    if (typeof event === 'number') {
      // This is a pointer to a native C event that was SDL_PushEvent'ed
      _memcpy(ptr, event, SDL.structs.KeyboardEvent.__size__); // XXX
      return;
    }
    switch (event.type) {
      case 'keydown':
      case 'keyup': {
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
        HEAP8[(SDL.keyboardState + code) | 0] = down;
        if (down) {
          SDL.keyboardMap[code] = event.keyCode; // save the DOM input, which we can use to unpress it during blur
        } else {
          delete SDL.keyboardMap[code];
        }
        // TODO: lmeta, rmeta, numlock, capslock, KMOD_MODE, KMOD_RESERVED
        SDL.modState =
          (HEAP8[(SDL.keyboardState + 1248) | 0] ? 0x0040 | 0x0080 : 0) | // KMOD_LCTRL & KMOD_RCTRL
          (HEAP8[(SDL.keyboardState + 1249) | 0] ? 0x0001 | 0x0002 : 0) | // KMOD_LSHIFT & KMOD_RSHIFT
          (HEAP8[(SDL.keyboardState + 1250) | 0] ? 0x0100 | 0x0200 : 0); // KMOD_LALT & KMOD_RALT
        HEAP32[(ptr + SDL.structs.KeyboardEvent.type) >> 2] =
          SDL.DOMEventToSDLEvent[event.type];
        HEAP8[(ptr + SDL.structs.KeyboardEvent.state) | 0] = down ? 1 : 0;
        HEAP8[(ptr + SDL.structs.KeyboardEvent.repeat) | 0] = 0; // TODO
        HEAP32[
          (ptr +
            (SDL.structs.KeyboardEvent.keysym + SDL.structs.keysym.scancode)) >>
            2
        ] = scan;
        HEAP32[
          (ptr + (SDL.structs.KeyboardEvent.keysym + SDL.structs.keysym.sym)) >>
            2
        ] = key;
        HEAP32[
          (ptr + (SDL.structs.KeyboardEvent.keysym + SDL.structs.keysym.mod)) >>
            2
        ] = SDL.modState;
        HEAP32[
          (ptr +
            (SDL.structs.KeyboardEvent.keysym + SDL.structs.keysym.unicode)) >>
            2
        ] = key;
        break;
      }
      case 'keypress': {
        HEAP32[(ptr + SDL.structs.TextInputEvent.type) >> 2] =
          SDL.DOMEventToSDLEvent[event.type];
        // Not filling in windowID for now
        var cStr = intArrayFromString(String.fromCharCode(event.charCode));
        for (var i = 0; i < cStr.length; ++i) {
          HEAP8[(ptr + (SDL.structs.TextInputEvent.text + i)) | 0] = cStr[i];
        }
        break;
      }
      case 'mousedown':
      case 'mouseup':
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
          HEAP32[(ptr + SDL.structs.MouseButtonEvent.type) >> 2] =
            SDL.DOMEventToSDLEvent[event.type];
          HEAP8[(ptr + SDL.structs.MouseButtonEvent.button) | 0] =
            event.button + 1; // DOM buttons are 0-2, SDL 1-3
          HEAP8[(ptr + SDL.structs.MouseButtonEvent.state) | 0] = down ? 1 : 0;
          HEAP32[(ptr + SDL.structs.MouseButtonEvent.x) >> 2] = Browser.mouseX;
          HEAP32[(ptr + SDL.structs.MouseButtonEvent.y) >> 2] = Browser.mouseY;
        } else {
          HEAP32[(ptr + SDL.structs.MouseMotionEvent.type) >> 2] =
            SDL.DOMEventToSDLEvent[event.type];
          HEAP8[(ptr + SDL.structs.MouseMotionEvent.state) | 0] =
            SDL.buttonState;
          HEAP32[(ptr + SDL.structs.MouseMotionEvent.x) >> 2] = Browser.mouseX;
          HEAP32[(ptr + SDL.structs.MouseMotionEvent.y) >> 2] = Browser.mouseY;
          HEAP32[(ptr + SDL.structs.MouseMotionEvent.xrel) >> 2] =
            Browser.mouseMovementX;
          HEAP32[(ptr + SDL.structs.MouseMotionEvent.yrel) >> 2] =
            Browser.mouseMovementY;
        }
        break;
      }
      case 'unload': {
        HEAP32[(ptr + SDL.structs.KeyboardEvent.type) >> 2] =
          SDL.DOMEventToSDLEvent[event.type];
        break;
      }
      case 'resize': {
        HEAP32[(ptr + SDL.structs.KeyboardEvent.type) >> 2] =
          SDL.DOMEventToSDLEvent[event.type];
        HEAP32[(ptr + SDL.structs.ResizeEvent.w) >> 2] = event.w;
        HEAP32[(ptr + SDL.structs.ResizeEvent.h) >> 2] = event.h;
        break;
      }
      default:
        throw 'Unhandled SDL event: ' + event.type;
    }
  },
  estimateTextWidth: function(fontData, text) {
    var h = fontData.size;
    var fontString = h + 'px ' + fontData.name;
    var tempCtx = SDL.ttfContext;
    tempCtx.save();
    tempCtx.font = fontString;
    var ret = tempCtx.measureText(text).width | 0;
    tempCtx.restore();
    return ret;
  },
  allocateChannels: function(num) {
    // called from Mix_AllocateChannels and init
    if (SDL.numChannels && SDL.numChannels >= num) return;
    SDL.numChannels = num;
    SDL.channels = [];
    for (var i = 0; i < num; i++) {
      SDL.channels[i] = {
        audio: null,
        volume: 1.0,
      };
    }
  },
  setGetVolume: function(info, volume) {
    if (!info) return 0;
    var ret = info.volume * 128; // MIX_MAX_VOLUME
    if (volume != -1) {
      info.volume = volume / 128;
      if (info.audio) info.audio.volume = info.volume;
    }
    return ret;
  },
  debugSurface: function(surfData) {
    console.log(
      'dumping surface ' +
        [surfData.surf, surfData.source, surfData.width, surfData.height]
    );
    var image = surfData.ctx.getImageData(
      0,
      0,
      surfData.width,
      surfData.height
    );
    var data = image.data;
    var num = Math.min(surfData.width, surfData.height);
    for (var i = 0; i < num; i++) {
      console.log(
        '   diagonal ' +
          i +
          ':' +
          [
            data[i * surfData.width * 4 + i * 4 + 0],
            data[i * surfData.width * 4 + i * 4 + 1],
            data[i * surfData.width * 4 + i * 4 + 2],
            data[i * surfData.width * 4 + i * 4 + 3],
          ]
      );
    }
  },
};
function _SDL_Init(what) {
  SDL.startTime = Date.now();
  // capture all key events. we just keep down and up, but also capture press to prevent default actions
  if (!Module['doNotCaptureKeyboard']) {
    document.addEventListener('keydown', SDL.receiveEvent);
    document.addEventListener('keyup', SDL.receiveEvent);
    document.addEventListener('keypress', SDL.receiveEvent);
    document.addEventListener('blur', SDL.receiveEvent);
    document.addEventListener('visibilitychange', SDL.receiveEvent);
  }
  window.addEventListener('unload', SDL.receiveEvent);
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
  SDL.DOMEventToSDLEvent[
    'resize'
  ] = 0x7001 /* SDL_VIDEORESIZE/SDL_EVENT_COMPAT2 */;
  return 0; // success
}
function _signal(sig, func) {
  // TODO
  return 0;
}
function __exit(status) {
  // void _exit(int status);
  // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
  function ExitStatus() {
    this.name = 'ExitStatus';
    this.message = 'Program terminated with exit(' + status + ')';
    this.status = status;
    Module.print('Exit Status: ' + status);
  }
  ExitStatus.prototype = new Error();
  ExitStatus.prototype.constructor = ExitStatus;
  exitRuntime();
  ABORT = true;
  throw new ExitStatus();
}
function _exit(status) {
  __exit(status);
}
Module['_strcat'] = _strcat;
function _fread(ptr, size, nitems, stream) {
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
var _sin = Math.sin;
var _cos = Math.cos;
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
}
function _ftruncate(fildes, length) {
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
Module['_memcmp'] = _memcmp;
var ___pollfd_struct_layout = {__size__: 8, fd: 0, events: 4, revents: 6};
function _poll(fds, nfds, timeout) {
  // int poll(struct pollfd fds[], nfds_t nfds, int timeout);
  // http://pubs.opengroup.org/onlinepubs/009695399/functions/poll.html
  // NOTE: This is pretty much a no-op mimicking glibc.
  var offsets = ___pollfd_struct_layout;
  var nonzero = 0;
  for (var i = 0; i < nfds; i++) {
    var pollfd = fds + ___pollfd_struct_layout.__size__ * i;
    var fd = HEAP32[(pollfd + offsets.fd) >> 2];
    var events = HEAP16[(pollfd + offsets.events) >> 1];
    var revents = 0;
    if (FS.streams[fd]) {
      var stream = FS.streams[fd];
      if (events & 1) revents |= 1;
      if (events & 2) revents |= 2;
    } else {
      if (events & 4) revents |= 4;
    }
    if (revents) nonzero++;
    HEAP16[(pollfd + offsets.revents) >> 1] = revents;
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
  Module['printErr']('missing function: posix_openpt');
  abort(-1);
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
    FS.createLink(
      path.parentPath,
      path.name,
      Pointer_stringify(path1),
      true,
      true
    );
    return 0;
  }
}
function _tcgetattr() {
  Module['printErr']('missing function: tcgetattr');
  abort(-1);
}
function _tcsetattr() {
  Module['printErr']('missing function: tcsetattr');
  abort(-1);
}
function _tcflush() {
  Module['printErr']('missing function: tcflush');
  abort(-1);
}
var ___flock_struct_layout = {
  __size__: 16,
  l_type: 0,
  l_whence: 2,
  l_start: 4,
  l_len: 8,
  l_pid: 12,
  l_xxx: 14,
};
function _fcntl(fildes, cmd, varargs, dup2) {
  // int fcntl(int fildes, int cmd, ...);
  // http://pubs.opengroup.org/onlinepubs/009695399/functions/fcntl.html
  if (!FS.streams[fildes]) {
    ___setErrNo(ERRNO_CODES.EBADF);
    return -1;
  }
  var stream = FS.streams[fildes];
  switch (cmd) {
    case 0:
      var arg = HEAP32[varargs >> 2];
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
      return 0; // FD_CLOEXEC makes no sense for a single process.
    case 3:
      var flags = 0;
      if (stream.isRead && stream.isWrite) flags = 2;
      else if (!stream.isRead && stream.isWrite) flags = 1;
      else if (stream.isRead && !stream.isWrite) flags = 0;
      if (stream.isAppend) flags |= 8;
      // Synchronization and blocking flags are irrelevant to us.
      return flags;
    case 4:
      var arg = HEAP32[varargs >> 2];
      stream.isAppend = Boolean(arg | 8);
      // Synchronization and blocking flags are irrelevant to us.
      return 0;
    case 7:
    case 20:
      var arg = HEAP32[varargs >> 2];
      var offset = ___flock_struct_layout.l_type;
      // We're always unlocked.
      HEAP16[(arg + offset) >> 1] = 3;
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
  Module['printErr']('missing function: grantpt');
  abort(-1);
}
function _unlockpt() {
  Module['printErr']('missing function: unlockpt');
  abort(-1);
}
function _ptsname() {
  Module['printErr']('missing function: ptsname');
  abort(-1);
}
function _strdup(ptr) {
  var len = _strlen(ptr);
  var newStr = _malloc(len + 1);
  _memcpy(newStr, ptr, len) | 0;
  HEAP8[(newStr + len) | 0] = 0;
  return newStr;
}
Module['_tolower'] = _tolower;
Module['_strncasecmp'] = _strncasecmp;
Module['_strcasecmp'] = _strcasecmp;
function _gmtime_r(time, tmPtr) {
  var date = new Date(HEAP32[time >> 2] * 1000);
  var offsets = ___tm_struct_layout;
  HEAP32[(tmPtr + offsets.tm_sec) >> 2] = date.getUTCSeconds();
  HEAP32[(tmPtr + offsets.tm_min) >> 2] = date.getUTCMinutes();
  HEAP32[(tmPtr + offsets.tm_hour) >> 2] = date.getUTCHours();
  HEAP32[(tmPtr + offsets.tm_mday) >> 2] = date.getUTCDate();
  HEAP32[(tmPtr + offsets.tm_mon) >> 2] = date.getUTCMonth();
  HEAP32[(tmPtr + offsets.tm_year) >> 2] = date.getUTCFullYear() - 1900;
  HEAP32[(tmPtr + offsets.tm_wday) >> 2] = date.getUTCDay();
  HEAP32[(tmPtr + offsets.tm_gmtoff) >> 2] = 0;
  HEAP32[(tmPtr + offsets.tm_isdst) >> 2] = 0;
  var start = new Date(date.getFullYear(), 0, 1);
  var yday = Math.round(
    (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  HEAP32[(tmPtr + offsets.tm_yday) >> 2] = yday;
  var timezone = 'GMT';
  if (!(timezone in ___tm_timezones)) {
    ___tm_timezones[timezone] = allocate(
      intArrayFromString(timezone),
      'i8',
      ALLOC_NORMAL
    );
  }
  HEAP32[(tmPtr + offsets.tm_zone) >> 2] = ___tm_timezones[timezone];
  return tmPtr;
}
function _gmtime(time) {
  return _gmtime_r(time, ___tm_current);
}
var _tan = Math.tan;
function _SDL_PauseAudio(pauseOn) {
  if (SDL.audio.paused !== pauseOn) {
    SDL.audio.timer = pauseOn
      ? SDL.audio.timer && clearInterval(SDL.audio.timer)
      : Browser.safeSetInterval(SDL.audio.caller, 1 / 35);
  }
  SDL.audio.paused = pauseOn;
}
function _SDL_CloseAudio() {
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
function _SDL_InitSubSystem(flags) {
  return 0;
}
function _SDL_GetError() {
  if (!SDL.errorMessage) {
    SDL.errorMessage = allocate(
      intArrayFromString('unknown SDL-emscripten error'),
      'i8',
      ALLOC_NORMAL
    );
  }
  return SDL.errorMessage;
}
function _SDL_OpenAudio(desired, obtained) {
  SDL.allocateChannels(32);
  SDL.audio = {
    freq: HEAPU32[(desired + SDL.structs.AudioSpec.freq) >> 2],
    format: HEAPU16[(desired + SDL.structs.AudioSpec.format) >> 1],
    channels: HEAPU8[(desired + SDL.structs.AudioSpec.channels) | 0],
    samples: HEAPU16[(desired + SDL.structs.AudioSpec.samples) >> 1],
    callback: HEAPU32[(desired + SDL.structs.AudioSpec.callback) >> 2],
    userdata: HEAPU32[(desired + SDL.structs.AudioSpec.userdata) >> 2],
    paused: true,
    timer: null,
  };
  if (obtained) {
    HEAP32[(obtained + SDL.structs.AudioSpec.freq) >> 2] = SDL.audio.freq; // no good way for us to know if the browser can really handle this
    HEAP16[(obtained + SDL.structs.AudioSpec.format) >> 1] = 33040; // float, signed, 16-bit
    HEAP8[(obtained + SDL.structs.AudioSpec.channels) | 0] = SDL.audio.channels;
    HEAP8[(obtained + SDL.structs.AudioSpec.silence) | 0] =
      HEAPU8[(desired + SDL.structs.AudioSpec.silence) | 0]; // unclear if browsers can provide this
    HEAP16[(obtained + SDL.structs.AudioSpec.samples) >> 1] = SDL.audio.samples;
    HEAP32[(obtained + SDL.structs.AudioSpec.callback) >> 2] =
      SDL.audio.callback;
    HEAP32[(obtained + SDL.structs.AudioSpec.userdata) >> 2] =
      SDL.audio.userdata;
  }
  var totalSamples = SDL.audio.samples * SDL.audio.channels;
  SDL.audio.bufferSize = totalSamples * 2; // hardcoded 16-bit audio
  SDL.audio.buffer = _malloc(SDL.audio.bufferSize);
  SDL.audio.caller = function() {
    Runtime.dynCall('viii', SDL.audio.callback, [
      SDL.audio.userdata,
      SDL.audio.buffer,
      SDL.audio.bufferSize,
    ]);
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
        mozBuffer[i] = HEAP16[(ptr + i * 2) >> 1] / 0x8000; // hardcoded 16-bit audio, signed (TODO: reSign if not ta2?)
      }
      SDL.audio.mozOutput['mozWriteAudio'](mozBuffer);
    };
  } catch (e) {
    SDL.audio = null;
  }
  if (!SDL.audio) return -1;
  return 0;
}
function _SDL_LockAudio() {}
function _SDL_UnlockAudio() {}
function _isspace(chr) {
  return chr in {32: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0};
}
function __parseInt(str, endptr, base, min, max, bits, unsign) {
  // Skip space.
  while (_isspace(HEAP8[str])) str++;
  // Check for a plus/minus sign.
  var multiplier = 1;
  if (HEAP8[str] == 45) {
    multiplier = -1;
    str++;
  } else if (HEAP8[str] == 43) {
    str++;
  }
  // Find base.
  var finalBase = base;
  if (!finalBase) {
    if (HEAP8[str] == 48) {
      if (HEAP8[(str + 1) | 0] == 120 || HEAP8[(str + 1) | 0] == 88) {
        finalBase = 16;
        str += 2;
      } else {
        finalBase = 8;
        str++;
      }
    }
  } else if (finalBase == 16) {
    if (HEAP8[str] == 48) {
      if (HEAP8[(str + 1) | 0] == 120 || HEAP8[(str + 1) | 0] == 88) {
        str += 2;
      }
    }
  }
  if (!finalBase) finalBase = 10;
  // Get digits.
  var chr;
  var ret = 0;
  while ((chr = HEAP8[str]) != 0) {
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
    HEAP32[endptr >> 2] = str;
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
    return (
      (asm['setTempRet0'](
        (Math.min(+Math.floor(ret / +4294967296), +4294967295) | 0) >>> 0
      ),
      ret >>> 0) | 0
    );
  }
  return ret;
}
function _strtoul(str, endptr, base) {
  return __parseInt(str, endptr, base, 0, 4294967295, 32, true); // ULONG_MAX.
}
function _strtol(str, endptr, base) {
  return __parseInt(str, endptr, base, -2147483648, 2147483647, 32); // LONG_MIN, LONG_MAX.
}
function _printf(format, varargs) {
  // int printf(const char *restrict format, ...);
  // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
  var stdout = HEAP32[_stdout >> 2];
  return _fprintf(stdout, format, varargs);
}
function _fputs(s, stream) {
  // int fputs(const char *restrict s, FILE *restrict stream);
  // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputs.html
  return _write(stream, s, _strlen(s));
}
function _vfprintf(s, f, va_arg) {
  return _fprintf(s, f, HEAP32[va_arg >> 2]);
}
function _puts(s) {
  // int puts(const char *s);
  // http://pubs.opengroup.org/onlinepubs/000095399/functions/puts.html
  // NOTE: puts() always writes an extra newline.
  var stdout = HEAP32[_stdout >> 2];
  var ret = _fputs(s, stdout);
  if (ret < 0) {
    return ret;
  } else {
    var newlineRet = _fputc(10, stdout);
    return newlineRet < 0 ? -1 : ret + 1;
  }
}
function _strchr(ptr, chr) {
  ptr--;
  do {
    ptr++;
    var val = HEAP8[ptr];
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
var ___timespec_struct_layout = {__size__: 8, tv_sec: 0, tv_nsec: 4};
function _nanosleep(rqtp, rmtp) {
  // int nanosleep(const struct timespec  *rqtp, struct timespec *rmtp);
  var seconds = HEAP32[(rqtp + ___timespec_struct_layout.tv_sec) >> 2];
  var nanoseconds = HEAP32[(rqtp + ___timespec_struct_layout.tv_nsec) >> 2];
  HEAP32[(rmtp + ___timespec_struct_layout.tv_sec) >> 2] = 0;
  HEAP32[(rmtp + ___timespec_struct_layout.tv_nsec) >> 2] = 0;
  return _usleep(seconds * 1e6 + nanoseconds / 1000);
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
      if (Browser.isFullScreen) {
        // only try to lock the pointer when in full screen mode
        Module['canvas'].requestPointerLock();
        return 0;
      } else {
        // else return SDL_ENABLE to indicate the failure
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
      console.log(
        'SDL_ShowCursor called with unknown toggle parameter value: ' +
          toggle +
          '.'
      );
      break;
  }
}
function _SDL_WM_GrabInput() {}
function _SDL_GetMouseState(x, y) {
  if (x) HEAP32[x >> 2] = Browser.mouseX;
  if (y) HEAP32[y >> 2] = Browser.mouseY;
  return SDL.buttonState;
}
function _SDL_WM_ToggleFullScreen(surf) {
  if (Browser.isFullScreen) {
    Module['canvas'].cancelFullScreen();
    return 1;
  } else {
    return 0;
  }
}
function _SDL_CreateRGBSurfaceFrom(
  pixels,
  width,
  height,
  depth,
  pitch,
  rmask,
  gmask,
  bmask,
  amask
) {
  // TODO: Take into account depth and pitch parameters.
  var surface = SDL.makeSurface(
    width,
    height,
    0,
    false,
    'CreateRGBSurfaceFrom',
    rmask,
    gmask,
    bmask,
    amask
  );
  var surfaceData = SDL.surfaces[surface];
  var surfaceImageData = surfaceData.ctx.getImageData(0, 0, width, height);
  var surfacePixelData = surfaceImageData.data;
  // Fill pixel data to created surface.
  // Supports SDL_PIXELFORMAT_RGBA8888 and SDL_PIXELFORMAT_RGB888
  var channels = amask ? 4 : 3; // RGBA8888 or RGB888
  for (var pixelOffset = 0; pixelOffset < width * height; pixelOffset++) {
    surfacePixelData[pixelOffset * 4 + 0] =
      HEAPU8[pixels + (pixelOffset * channels + 0)]; // R
    surfacePixelData[pixelOffset * 4 + 1] =
      HEAPU8[pixels + (pixelOffset * channels + 1)]; // G
    surfacePixelData[pixelOffset * 4 + 2] =
      HEAPU8[pixels + (pixelOffset * channels + 2)]; // B
    surfacePixelData[pixelOffset * 4 + 3] = amask
      ? HEAPU8[pixels + (pixelOffset * channels + 3)]
      : 0xff; // A
  }
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
    sr = {x: 0, y: 0, w: srcData.width, h: srcData.height};
  }
  if (dstrect) {
    dr = SDL.loadRect(dstrect);
  } else {
    dr = {x: 0, y: 0, w: -1, h: -1};
  }
  dstData.ctx.drawImage(
    srcData.canvas,
    sr.x,
    sr.y,
    sr.w,
    sr.h,
    dr.x,
    dr.y,
    sr.w,
    sr.h
  );
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
  [
    'mousedown',
    'mouseup',
    'mousemove',
    'DOMMouseScroll',
    'mousewheel',
    'mouseout',
  ].forEach(function(event) {
    if (Module['canvasFront']) {
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
        h: h,
      });
    });
  }
  return SDL.screen;
}
function _SDL_WM_SetCaption(title, icon) {
  title = title && Pointer_stringify(title);
  icon = icon && Pointer_stringify(icon);
}
function _SDL_GetVideoInfo() {
  // %struct.SDL_VideoInfo = type { i32, i32, %struct.SDL_PixelFormat*, i32, i32 } - 5 fields of quantum size
  var ret = _malloc(5 * Runtime.QUANTUM_SIZE);
  HEAP32[(ret + Runtime.QUANTUM_SIZE * 0) >> 2] = 0; // TODO
  HEAP32[(ret + Runtime.QUANTUM_SIZE * 1) >> 2] = 0; // TODO
  HEAP32[(ret + Runtime.QUANTUM_SIZE * 2) >> 2] = 0;
  HEAP32[(ret + Runtime.QUANTUM_SIZE * 3) >> 2] = Module['canvas'].width;
  HEAP32[(ret + Runtime.QUANTUM_SIZE * 4) >> 2] = Module['canvas'].height;
  return ret;
}
function _SDL_EnableKeyRepeat(delay, interval) {
  // TODO
}
function _SDL_EventState() {}
function _abort() {
  ABORT = true;
  throw 'abort() at ' + new Error().stack;
}
function ___errno_location() {
  return ___errno_state;
}
var ___errno = ___errno_location;
function _sysconf(name) {
  // long sysconf(int name);
  // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
  switch (name) {
    case 8:
      return PAGE_SIZE;
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
    case 0:
      return 2097152;
    case 3:
      return 65536;
    case 14:
      return 32768;
    case 73:
      return 32767;
    case 39:
      return 16384;
    case 60:
      return 1000;
    case 106:
      return 700;
    case 52:
      return 256;
    case 62:
      return 255;
    case 2:
      return 100;
    case 65:
      return 64;
    case 36:
      return 20;
    case 100:
      return 16;
    case 20:
      return 6;
    case 53:
      return 4;
    case 10:
      return 1;
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
    Runtime.dynamicAlloc = function() {
      abort('cannot dynamically allocate, sbrk now has control');
    };
  }
  var ret = DYNAMICTOP;
  if (bytes != 0) self.alloc(bytes);
  return ret; // Previous break location.
}
__ATINIT__.unshift({
  func: function() {
    if (!Module['noFSInit'] && !FS.init.initialized) FS.init();
  },
});
__ATMAIN__.push({
  func: function() {
    FS.ignorePermissions = false;
  },
});
__ATEXIT__.push({
  func: function() {
    FS.quit();
  },
});
Module['FS_createFolder'] = FS.createFolder;
Module['FS_createPath'] = FS.createPath;
Module['FS_createDataFile'] = FS.createDataFile;
Module['FS_createPreloadedFile'] = FS.createPreloadedFile;
Module['FS_createLazyFile'] = FS.createLazyFile;
Module['FS_createLink'] = FS.createLink;
Module['FS_createDevice'] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4);
HEAP32[___errno_state >> 2] = 0;
_fgetc.ret = allocate([0], 'i8', ALLOC_STATIC);
_fputc.ret = allocate([0], 'i8', ALLOC_STATIC);
Module['requestFullScreen'] = function(lockPointer, resizeCanvas) {
  Browser.requestFullScreen(lockPointer, resizeCanvas);
};
Module['requestAnimationFrame'] = function(func) {
  Browser.requestAnimationFrame(func);
};
Module['pauseMainLoop'] = function() {
  Browser.mainLoop.pause();
};
Module['resumeMainLoop'] = function() {
  Browser.mainLoop.resume();
};
Module['getUserMedia'] = function() {
  Browser.getUserMedia();
};
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var ctlz_i8 = allocate(
  [
    8,
    7,
    6,
    6,
    5,
    5,
    5,
    5,
    4,
    4,
    4,
    4,
    4,
    4,
    4,
    4,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
  ],
  'i8',
  ALLOC_DYNAMIC
);
var cttz_i8 = allocate(
  [
    8,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    4,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    5,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    4,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    6,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    4,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    5,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    4,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    7,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    4,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    5,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    4,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    6,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    4,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    5,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    4,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
    3,
    0,
    1,
    0,
    2,
    0,
    1,
    0,
  ],
  'i8',
  ALLOC_DYNAMIC
);
var Math_min = Math.min;
function invoke_ii(index, a1) {
  try {
    return Module['dynCall_ii'](index, a1);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm['setThrew'](1, 0);
  }
}
function invoke_vi(index, a1) {
  try {
    Module['dynCall_vi'](index, a1);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm['setThrew'](1, 0);
  }
}
function invoke_vii(index, a1, a2) {
  try {
    Module['dynCall_vii'](index, a1, a2);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm['setThrew'](1, 0);
  }
}
function invoke_iiii(index, a1, a2, a3) {
  try {
    return Module['dynCall_iiii'](index, a1, a2, a3);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm['setThrew'](1, 0);
  }
}
function invoke_viii(index, a1, a2, a3) {
  try {
    Module['dynCall_viii'](index, a1, a2, a3);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm['setThrew'](1, 0);
  }
}
function invoke_v(index) {
  try {
    Module['dynCall_v'](index);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm['setThrew'](1, 0);
  }
}
function invoke_iiiii(index, a1, a2, a3, a4) {
  try {
    return Module['dynCall_iiiii'](index, a1, a2, a3, a4);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm['setThrew'](1, 0);
  }
}
function invoke_iii(index, a1, a2) {
  try {
    return Module['dynCall_iii'](index, a1, a2);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm['setThrew'](1, 0);
  }
}
function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
  try {
    return Module['dynCall_iiiiii'](index, a1, a2, a3, a4, a5);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm['setThrew'](1, 0);
  }
}
function invoke_viiii(index, a1, a2, a3, a4) {
  try {
    Module['dynCall_viiii'](index, a1, a2, a3, a4);
  } catch (e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm['setThrew'](1, 0);
  }
}
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y); // + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y); // + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm = (function(global, env, buffer) {
  'use asm';
  var a = new global.Int8Array(buffer);
  var b = new global.Int16Array(buffer);
  var c = new global.Int32Array(buffer);
  var d = new global.Uint8Array(buffer);
  var e = new global.Uint16Array(buffer);
  var f = new global.Uint32Array(buffer);
  var g = new global.Float32Array(buffer);
  var h = new global.Float64Array(buffer);
  var i = env.STACKTOP | 0;
  var j = env.STACK_MAX | 0;
  var k = env.tempDoublePtr | 0;
  var l = env.ABORT | 0;
  var m = env.cttz_i8 | 0;
  var n = env.ctlz_i8 | 0;
  var o = env._stdout | 0;
  var p = env._stdin | 0;
  var q = env._stderr | 0;
  var r = +env.NaN;
  var s = +env.Infinity;
  var t = 0;
  var u = 0;
  var v = 0;
  var w = 0;
  var x = 0,
    y = 0,
    z = 0,
    A = 0,
    B = 0.0,
    C = 0,
    D = 0,
    E = 0,
    F = 0.0;
  var G = 0;
  var H = 0;
  var I = 0;
  var J = 0;
  var K = 0;
  var L = 0;
  var M = 0;
  var N = 0;
  var O = 0;
  var P = 0;
  var Q = global.Math.floor;
  var R = global.Math.abs;
  var S = global.Math.sqrt;
  var T = global.Math.pow;
  var U = global.Math.cos;
  var V = global.Math.sin;
  var W = global.Math.tan;
  var X = global.Math.acos;
  var Y = global.Math.asin;
  var Z = global.Math.atan;
  var _ = global.Math.atan2;
  var $ = global.Math.exp;
  var aa = global.Math.log;
  var ab = global.Math.ceil;
  var ac = global.Math.imul;
  var ad = env.abort;
  var ae = env.assert;
  var af = env.asmPrintInt;
  var ag = env.asmPrintFloat;
  var ah = env.min;
  var ai = env.invoke_ii;
  var aj = env.invoke_vi;
  var ak = env.invoke_vii;
  var al = env.invoke_iiii;
  var am = env.invoke_viii;
  var an = env.invoke_v;
  var ao = env.invoke_iiiii;
  var ap = env.invoke_iii;
  var aq = env.invoke_iiiiii;
  var ar = env.invoke_viiii;
  var as = env._llvm_lifetime_end;
  var at = env._lseek;
  var au = env._fclose;
  var av = env._SDL_EventState;
  var aw = env._strtoul;
  var ax = env._fflush;
  var ay = env._SDL_GetMouseState;
  var az = env._strtol;
  var aA = env._fputc;
  var aB = env._fwrite;
  var aC = env._ptsname;
  var aD = env._send;
  var aE = env._tcflush;
  var aF = env._fputs;
  var aG = env._emscripten_cancel_main_loop;
  var aH = env._localtime;
  var aI = env._SDL_WasInit;
  var aJ = env._read;
  var aK = env._fileno;
  var aL = env._fsync;
  var aM = env._signal;
  var aN = env._SDL_PauseAudio;
  var aO = env._SDL_LockAudio;
  var aP = env._strcmp;
  var aQ = env._strncmp;
  var aR = env._snprintf;
  var aS = env._fgetc;
  var aT = env._atexit;
  var aU = env._close;
  var aV = env._tcsetattr;
  var aW = env._strchr;
  var aX = env._tcgetattr;
  var aY = env._poll;
  var aZ = env.___setErrNo;
  var a_ = env._grantpt;
  var a$ = env._ftell;
  var a0 = env._exit;
  var a1 = env._sprintf;
  var a2 = env._fcntl;
  var a3 = env._SDL_ShowCursor;
  var a4 = env._gmtime;
  var a5 = env._localtime_r;
  var a6 = env._symlink;
  var a7 = env._ftruncate;
  var a8 = env._recv;
  var a9 = env._cos;
  var ba = env._SDL_PollEvent;
  var bb = env._SDL_Init;
  var bc = env.__exit;
  var bd = env._SDL_WM_GrabInput;
  var be = env._llvm_va_end;
  var bf = env._tzset;
  var bg = env._SDL_CreateRGBSurfaceFrom;
  var bh = env._printf;
  var bi = env._unlockpt;
  var bj = env._pread;
  var bk = env._SDL_SetVideoMode;
  var bl = env._fopen;
  var bm = env._open;
  var bn = env._usleep;
  var bo = env._SDL_EnableKeyRepeat;
  var bp = env._puts;
  var bq = env._SDL_GetVideoInfo;
  var br = env._nanosleep;
  var bs = env._SDL_Flip;
  var bt = env._SDL_InitSubSystem;
  var bu = env._strdup;
  var bv = env._SDL_GetError;
  var bw = env.__formatString;
  var bx = env._gettimeofday;
  var by = env._vfprintf;
  var bz = env._SDL_WM_SetCaption;
  var bA = env._sbrk;
  var bB = env.___errno_location;
  var bC = env._SDL_CloseAudio;
  var bD = env._isspace;
  var bE = env._llvm_lifetime_start;
  var bF = env.__parseInt;
  var bG = env._SDL_OpenAudio;
  var bH = env._SDL_UnlockAudio;
  var bI = env._gmtime_r;
  var bJ = env._sysconf;
  var bK = env._fread;
  var bL = env._SDL_WM_ToggleFullScreen;
  var bM = env._abort;
  var bN = env._fprintf;
  var bO = env._tan;
  var bP = env.__reallyNegative;
  var bQ = env._posix_openpt;
  var bR = env._feof;
  var bS = env._fseek;
  var bT = env._write;
  var bU = env._SDL_UpperBlit;
  var bV = env._rewind;
  var bW = env._sin;
  var bX = env._truncate;
  var bY = env._emscripten_set_main_loop;
  var bZ = env._unlink;
  var b_ = env._pwrite;
  var b$ = env._SDL_FreeSurface;
  var b0 = env._time;
  // EMSCRIPTEN_START_FUNCS
  function cb(a) {
    a = a | 0;
    var b = 0;
    b = i;
    i = (i + a) | 0;
    i = ((i + 7) >> 3) << 3;
    return b | 0;
  }
  function cc() {
    return i | 0;
  }
  function cd(a) {
    a = a | 0;
    i = a;
  }
  function ce(a, b) {
    a = a | 0;
    b = b | 0;
    if ((t | 0) == 0) {
      t = a;
      u = b;
    }
  }
  function cf(b) {
    b = b | 0;
    a[k] = a[b];
    a[(k + 1) | 0] = a[(b + 1) | 0];
    a[(k + 2) | 0] = a[(b + 2) | 0];
    a[(k + 3) | 0] = a[(b + 3) | 0];
  }
  function cg(b) {
    b = b | 0;
    a[k] = a[b];
    a[(k + 1) | 0] = a[(b + 1) | 0];
    a[(k + 2) | 0] = a[(b + 2) | 0];
    a[(k + 3) | 0] = a[(b + 3) | 0];
    a[(k + 4) | 0] = a[(b + 4) | 0];
    a[(k + 5) | 0] = a[(b + 5) | 0];
    a[(k + 6) | 0] = a[(b + 6) | 0];
    a[(k + 7) | 0] = a[(b + 7) | 0];
  }
  function ch(a) {
    a = a | 0;
    G = a;
  }
  function ci(a) {
    a = a | 0;
    H = a;
  }
  function cj(a) {
    a = a | 0;
    I = a;
  }
  function ck(a) {
    a = a | 0;
    J = a;
  }
  function cl(a) {
    a = a | 0;
    K = a;
  }
  function cm(a) {
    a = a | 0;
    L = a;
  }
  function cn(a) {
    a = a | 0;
    M = a;
  }
  function co(a) {
    a = a | 0;
    N = a;
  }
  function cp(a) {
    a = a | 0;
    O = a;
  }
  function cq(a) {
    a = a | 0;
    P = a;
  }
  function cr() {}
  function cs(b) {
    b = b | 0;
    return a[(b + 17) | 0] | 0;
  }
  function ct() {
    var a = 0,
      b = 0;
    a = zH(168) | 0;
    if ((a | 0) == 0) {
      b = 0;
      return b | 0;
    }
    zP(a | 0, 0, 18);
    c[(a + 20) >> 2] = 64;
    c[(a + 160) >> 2] = 0;
    c[(a + 164) >> 2] = 0;
    c[(a + 24) >> 2] = 0;
    zP((a + 124) | 0, 0, 5);
    zP((a + 132) | 0, 0, 6);
    zP((a + 140) | 0, 0, 17);
    c[(a + 28) >> 2] = 569;
    c[(a + 32) >> 2] = 1139;
    c[(a + 36) >> 2] = 569;
    c[(a + 40) >> 2] = 16384;
    c[(a + 44) >> 2] = -23060;
    c[(a + 48) >> 2] = 8956;
    zP((a + 52) | 0, 0, 24);
    c[(a + 76) >> 2] = 569;
    c[(a + 80) >> 2] = 1139;
    c[(a + 84) >> 2] = 569;
    c[(a + 88) >> 2] = 16384;
    c[(a + 92) >> 2] = -23060;
    c[(a + 96) >> 2] = 8956;
    zP((a + 100) | 0, 0, 24);
    b = a;
    return b | 0;
  }
  function cu(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0,
      H = 0;
    e = (b + 156) | 0;
    f = (b + 164) | 0;
    if ((a[e] | 0) != 0) {
      g = c[f >> 2] | 0;
      au(g | 0) | 0;
    }
    a[e] = 0;
    c[f >> 2] = 0;
    g = (b + 160) | 0;
    zI(c[g >> 2] | 0);
    c[g >> 2] = 0;
    h = (b + 4) | 0;
    c[h >> 2] = 0;
    i = (b + 8) | 0;
    c[i >> 2] = 0;
    c[(b + 12) >> 2] = 0;
    if ((d | 0) == 0) {
      j = 0;
      return j | 0;
    }
    k = bl(d | 0, 41872) | 0;
    c[f >> 2] = k;
    do {
      if ((k | 0) == 0) {
        l = bl(d | 0, 41864) | 0;
        c[f >> 2] = l;
        if ((l | 0) == 0) {
          j = 1;
        } else {
          m = l;
          break;
        }
        return j | 0;
      } else {
        m = k;
      }
    } while (0);
    a[e] = 1;
    bS(m | 0, 0, 2) | 0;
    m = a$(c[f >> 2] | 0) | 0;
    c[h >> 2] = m;
    e = (b + 144) | 0;
    c[e >> 2] = 0;
    k = (b + 140) | 0;
    l = (b + 148) | 0;
    c[l >> 2] = c[k >> 2];
    n = (b + 152) | 0;
    c[n >> 2] = 0;
    o = (b + 24) | 0;
    c[o >> 2] = 0;
    p = (b + 124) | 0;
    c[p >> 2] = 0;
    q = (b + 128) | 0;
    a[q] = 0;
    r = (b + 132) | 0;
    c[r >> 2] = 0;
    s = (b + 136) | 0;
    a[s] = 0;
    t = (b + 137) | 0;
    a[t] = 0;
    u = (b + 28) | 0;
    c[u >> 2] = 569;
    v = (b + 32) | 0;
    c[v >> 2] = 1139;
    w = (b + 36) | 0;
    c[w >> 2] = 569;
    x = (b + 40) | 0;
    c[x >> 2] = 16384;
    y = (b + 44) | 0;
    c[y >> 2] = -23060;
    z = (b + 48) | 0;
    c[z >> 2] = 8956;
    A = (b + 52) | 0;
    zP(A | 0, 0, 24);
    B = (b + 76) | 0;
    c[B >> 2] = 569;
    C = (b + 80) | 0;
    c[C >> 2] = 1139;
    D = (b + 84) | 0;
    c[D >> 2] = 569;
    E = (b + 88) | 0;
    c[E >> 2] = 16384;
    F = (b + 92) | 0;
    c[F >> 2] = -23060;
    G = (b + 96) | 0;
    c[G >> 2] = 8956;
    H = (b + 100) | 0;
    zP(H | 0, 0, 24);
    c[i >> 2] = m;
    do {
      if ((a[b | 0] | 0) == 0) {
        m = c[f >> 2] | 0;
        if ((m | 0) == 0) {
          break;
        }
        if ((bS(m | 0, 0, 0) | 0) != 0) {
          break;
        }
        c[h >> 2] = 0;
        c[e >> 2] = 0;
        c[l >> 2] = c[k >> 2];
        c[n >> 2] = 0;
        c[o >> 2] = 0;
        c[p >> 2] = 0;
        a[q] = 0;
        c[r >> 2] = 0;
        a[s] = 0;
        a[t] = 0;
        c[u >> 2] = 569;
        c[v >> 2] = 1139;
        c[w >> 2] = 569;
        c[x >> 2] = 16384;
        c[y >> 2] = -23060;
        c[z >> 2] = 8956;
        zP(A | 0, 0, 24);
        c[B >> 2] = 569;
        c[C >> 2] = 1139;
        c[D >> 2] = 569;
        c[E >> 2] = 16384;
        c[F >> 2] = -23060;
        c[G >> 2] = 8956;
        zP(H | 0, 0, 24);
      }
    } while (0);
    h = zN(d | 0) | 0;
    f = (h + 1) | 0;
    m = zH(f) | 0;
    c[g >> 2] = m;
    if ((m | 0) != 0) {
      zO(m | 0, d | 0, f) | 0;
    }
    if (h >>> 0 <= 4) {
      j = 0;
      return j | 0;
    }
    f = (d + (h - 4)) | 0;
    if ((aP(f | 0, 33672) | 0) == 0) {
      a[(b + 1) | 0] = 1;
      c[e >> 2] = 0;
      c[l >> 2] = c[k >> 2];
      c[n >> 2] = 0;
      c[o >> 2] = 0;
      c[p >> 2] = 0;
      a[q] = 0;
      c[r >> 2] = 0;
      a[s] = 0;
      a[t] = 0;
      c[u >> 2] = 569;
      c[v >> 2] = 1139;
      c[w >> 2] = 569;
      c[x >> 2] = 16384;
      c[y >> 2] = -23060;
      c[z >> 2] = 8956;
      zP(A | 0, 0, 24);
      c[B >> 2] = 569;
      c[C >> 2] = 1139;
      c[D >> 2] = 569;
      c[E >> 2] = 16384;
      c[F >> 2] = -23060;
      c[G >> 2] = 8956;
      zP(H | 0, 0, 24);
      j = 0;
      return j | 0;
    }
    if ((aP(f | 0, 31288) | 0) == 0) {
      a[(b + 1) | 0] = 1;
      c[e >> 2] = 0;
      c[l >> 2] = c[k >> 2];
      c[n >> 2] = 0;
      c[o >> 2] = 0;
      c[p >> 2] = 0;
      a[q] = 0;
      c[r >> 2] = 0;
      a[s] = 0;
      a[t] = 0;
      c[u >> 2] = 569;
      c[v >> 2] = 1139;
      c[w >> 2] = 569;
      c[x >> 2] = 16384;
      c[y >> 2] = -23060;
      c[z >> 2] = 8956;
      zP(A | 0, 0, 24);
      c[B >> 2] = 569;
      c[C >> 2] = 1139;
      c[D >> 2] = 569;
      c[E >> 2] = 16384;
      c[F >> 2] = -23060;
      c[G >> 2] = 8956;
      zP(H | 0, 0, 24);
      j = 0;
      return j | 0;
    }
    if ((aP(f | 0, 29232) | 0) != 0) {
      j = 0;
      return j | 0;
    }
    a[(b + 1) | 0] = 0;
    c[e >> 2] = 0;
    c[l >> 2] = c[k >> 2];
    c[n >> 2] = 0;
    c[o >> 2] = 0;
    c[p >> 2] = 0;
    a[q] = 0;
    c[r >> 2] = 0;
    a[s] = 0;
    a[t] = 0;
    c[u >> 2] = 569;
    c[v >> 2] = 1139;
    c[w >> 2] = 569;
    c[x >> 2] = 16384;
    c[y >> 2] = -23060;
    c[z >> 2] = 8956;
    zP(A | 0, 0, 24);
    c[B >> 2] = 569;
    c[C >> 2] = 1139;
    c[D >> 2] = 569;
    c[E >> 2] = 16384;
    c[F >> 2] = -23060;
    c[G >> 2] = 8956;
    zP(H | 0, 0, 24);
    j = 0;
    return j | 0;
  }
  function cv(b) {
    b = b | 0;
    var d = 0,
      e = 0;
    d = (b + 164) | 0;
    e = c[d >> 2] | 0;
    if ((e | 0) != 0) {
      bS(e | 0, 0, 2) | 0;
      c[(b + 4) >> 2] = a$(c[d >> 2] | 0) | 0;
    }
    c[(b + 144) >> 2] = 0;
    c[(b + 148) >> 2] = c[(b + 140) >> 2];
    c[(b + 152) >> 2] = 0;
    c[(b + 24) >> 2] = 0;
    c[(b + 124) >> 2] = 0;
    a[(b + 128) | 0] = 0;
    c[(b + 132) >> 2] = 0;
    a[(b + 136) | 0] = 0;
    a[(b + 137) | 0] = 0;
    c[(b + 28) >> 2] = 569;
    c[(b + 32) >> 2] = 1139;
    c[(b + 36) >> 2] = 569;
    c[(b + 40) >> 2] = 16384;
    c[(b + 44) >> 2] = -23060;
    c[(b + 48) >> 2] = 8956;
    zP((b + 52) | 0, 0, 24);
    c[(b + 76) >> 2] = 569;
    c[(b + 80) >> 2] = 1139;
    c[(b + 84) >> 2] = 569;
    c[(b + 88) >> 2] = 16384;
    c[(b + 92) >> 2] = -23060;
    c[(b + 96) >> 2] = 8956;
    zP((b + 100) | 0, 0, 24);
    return;
  }
  function cw(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0;
    e = c[(b + 164) >> 2] | 0;
    if ((e | 0) == 0) {
      f = 1;
      return f | 0;
    }
    if ((bS(e | 0, d | 0, 0) | 0) != 0) {
      f = 1;
      return f | 0;
    }
    c[(b + 4) >> 2] = d;
    c[(b + 144) >> 2] = 0;
    c[(b + 148) >> 2] = c[(b + 140) >> 2];
    c[(b + 152) >> 2] = 0;
    c[(b + 24) >> 2] = 0;
    c[(b + 124) >> 2] = 0;
    a[(b + 128) | 0] = 0;
    c[(b + 132) >> 2] = 0;
    a[(b + 136) | 0] = 0;
    a[(b + 137) | 0] = 0;
    c[(b + 28) >> 2] = 569;
    c[(b + 32) >> 2] = 1139;
    c[(b + 36) >> 2] = 569;
    c[(b + 40) >> 2] = 16384;
    c[(b + 44) >> 2] = -23060;
    c[(b + 48) >> 2] = 8956;
    zP((b + 52) | 0, 0, 24);
    c[(b + 76) >> 2] = 569;
    c[(b + 80) >> 2] = 1139;
    c[(b + 84) >> 2] = 569;
    c[(b + 88) >> 2] = 16384;
    c[(b + 92) >> 2] = -23060;
    c[(b + 96) >> 2] = 8956;
    zP((b + 100) | 0, 0, 24);
    f = 0;
    return f | 0;
  }
  function cx(b, d) {
    b = b | 0;
    d = d | 0;
    a[(b + 1) | 0] = ((d | 0) != 0) | 0;
    c[(b + 144) >> 2] = 0;
    c[(b + 148) >> 2] = c[(b + 140) >> 2];
    c[(b + 152) >> 2] = 0;
    c[(b + 24) >> 2] = 0;
    c[(b + 124) >> 2] = 0;
    a[(b + 128) | 0] = 0;
    c[(b + 132) >> 2] = 0;
    a[(b + 136) | 0] = 0;
    a[(b + 137) | 0] = 0;
    c[(b + 28) >> 2] = 569;
    c[(b + 32) >> 2] = 1139;
    c[(b + 36) >> 2] = 569;
    c[(b + 40) >> 2] = 16384;
    c[(b + 44) >> 2] = -23060;
    c[(b + 48) >> 2] = 8956;
    zP((b + 52) | 0, 0, 24);
    c[(b + 76) >> 2] = 569;
    c[(b + 80) >> 2] = 1139;
    c[(b + 84) >> 2] = 569;
    c[(b + 88) >> 2] = 16384;
    c[(b + 92) >> 2] = -23060;
    c[(b + 96) >> 2] = 8956;
    zP((b + 100) | 0, 0, 24);
    return;
  }
  function cy(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0;
    e = (d | 0) != 0;
    d = b | 0;
    f = a[d] | 0;
    if ((((f << 24) >> 24) | 0) == ((e & 1) | 0)) {
      return;
    }
    g = (b + 4) | 0;
    h = c[g >> 2] | 0;
    if ((f << 24) >> 24 == 0) {
      c[(b + 12) >> 2] = h;
      i = (b + 8) | 0;
    } else {
      c[(b + 8) >> 2] = h;
      i = (b + 12) | 0;
    }
    c[g >> 2] = c[i >> 2];
    a[d] = e & 1;
    e = (b + 164) | 0;
    d = c[e >> 2] | 0;
    do {
      if ((d | 0) != 0) {
        ax(d | 0) | 0;
        i = c[g >> 2] | 0;
        h = c[e >> 2] | 0;
        if ((h | 0) == 0) {
          break;
        }
        if ((bS(h | 0, i | 0, 0) | 0) != 0) {
          break;
        }
        c[g >> 2] = i;
        c[(b + 144) >> 2] = 0;
        c[(b + 148) >> 2] = c[(b + 140) >> 2];
        c[(b + 152) >> 2] = 0;
        c[(b + 24) >> 2] = 0;
        c[(b + 124) >> 2] = 0;
        a[(b + 128) | 0] = 0;
        c[(b + 132) >> 2] = 0;
        a[(b + 136) | 0] = 0;
        a[(b + 137) | 0] = 0;
        c[(b + 28) >> 2] = 569;
        c[(b + 32) >> 2] = 1139;
        c[(b + 36) >> 2] = 569;
        c[(b + 40) >> 2] = 16384;
        c[(b + 44) >> 2] = -23060;
        c[(b + 48) >> 2] = 8956;
        zP((b + 52) | 0, 0, 24);
        c[(b + 76) >> 2] = 569;
        c[(b + 80) >> 2] = 1139;
        c[(b + 84) >> 2] = 569;
        c[(b + 88) >> 2] = 16384;
        c[(b + 92) >> 2] = -23060;
        c[(b + 96) >> 2] = 8956;
        zP((b + 100) | 0, 0, 24);
      }
    } while (0);
    c[(b + 144) >> 2] = 0;
    c[(b + 148) >> 2] = c[(b + 140) >> 2];
    c[(b + 152) >> 2] = 0;
    c[(b + 24) >> 2] = 0;
    c[(b + 124) >> 2] = 0;
    a[(b + 128) | 0] = 0;
    c[(b + 132) >> 2] = 0;
    a[(b + 136) | 0] = 0;
    a[(b + 137) | 0] = 0;
    c[(b + 28) >> 2] = 569;
    c[(b + 32) >> 2] = 1139;
    c[(b + 36) >> 2] = 569;
    c[(b + 40) >> 2] = 16384;
    c[(b + 44) >> 2] = -23060;
    c[(b + 48) >> 2] = 8956;
    zP((b + 52) | 0, 0, 24);
    c[(b + 76) >> 2] = 569;
    c[(b + 80) >> 2] = 1139;
    c[(b + 84) >> 2] = 569;
    c[(b + 88) >> 2] = 16384;
    c[(b + 92) >> 2] = -23060;
    c[(b + 96) >> 2] = 8956;
    zP((b + 100) | 0, 0, 24);
    return;
  }
  function cz(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0;
    e = (d | 0) != 0;
    a[(b + 2) | 0] = e & 1;
    c[(b + 20) >> 2] = e ? 128 : 64;
    c[(b + 144) >> 2] = 0;
    c[(b + 148) >> 2] = c[(b + 140) >> 2];
    c[(b + 152) >> 2] = 0;
    c[(b + 24) >> 2] = 0;
    c[(b + 124) >> 2] = 0;
    a[(b + 128) | 0] = 0;
    c[(b + 132) >> 2] = 0;
    a[(b + 136) | 0] = 0;
    a[(b + 137) | 0] = 0;
    c[(b + 28) >> 2] = 569;
    c[(b + 32) >> 2] = 1139;
    c[(b + 36) >> 2] = 569;
    c[(b + 40) >> 2] = 16384;
    c[(b + 44) >> 2] = -23060;
    c[(b + 48) >> 2] = 8956;
    zP((b + 52) | 0, 0, 24);
    c[(b + 76) >> 2] = 569;
    c[(b + 80) >> 2] = 1139;
    c[(b + 84) >> 2] = 569;
    c[(b + 88) >> 2] = 16384;
    c[(b + 92) >> 2] = -23060;
    c[(b + 96) >> 2] = 8956;
    zP((b + 100) | 0, 0, 24);
    return;
  }
  function cA(b) {
    b = b | 0;
    var d = 0;
    d = c[(b + 164) >> 2] | 0;
    if ((d | 0) != 0) {
      bV(d | 0);
      c[(b + 4) >> 2] = 0;
    }
    c[(b + 144) >> 2] = 0;
    c[(b + 148) >> 2] = c[(b + 140) >> 2];
    c[(b + 152) >> 2] = 0;
    c[(b + 24) >> 2] = 0;
    c[(b + 124) >> 2] = 0;
    a[(b + 128) | 0] = 0;
    c[(b + 132) >> 2] = 0;
    a[(b + 136) | 0] = 0;
    a[(b + 137) | 0] = 0;
    c[(b + 28) >> 2] = 569;
    c[(b + 32) >> 2] = 1139;
    c[(b + 36) >> 2] = 569;
    c[(b + 40) >> 2] = 16384;
    c[(b + 44) >> 2] = -23060;
    c[(b + 48) >> 2] = 8956;
    zP((b + 52) | 0, 0, 24);
    c[(b + 76) >> 2] = 569;
    c[(b + 80) >> 2] = 1139;
    c[(b + 84) >> 2] = 569;
    c[(b + 88) >> 2] = 16384;
    c[(b + 92) >> 2] = -23060;
    c[(b + 96) >> 2] = 8956;
    zP((b + 100) | 0, 0, 24);
    return;
  }
  function cB(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0,
      j = 0,
      k = 0;
    f = i;
    g = (e << 24) >> 24 != 0;
    e = (b + 3) | 0;
    if (((g & 1) | 0) == (d[e] | 0 | 0)) {
      i = f;
      return;
    }
    h = (b + 4) | 0;
    j = c[h >> 2] | 0;
    k = c[(b + 160) >> 2] | 0;
    w2(
      27504,
      ((x = i),
      (i = (i + 24) | 0),
      (c[x >> 2] = g ? 25888 : 24680),
      (c[(x + 8) >> 2] = j),
      (c[(x + 16) >> 2] = (k | 0) == 0 ? 23120 : k),
      x) | 0
    );
    a[e] = g & 1;
    g = (b + 164) | 0;
    e = c[g >> 2] | 0;
    do {
      if ((e | 0) != 0) {
        ax(e | 0) | 0;
        k = c[h >> 2] | 0;
        j = c[g >> 2] | 0;
        if ((j | 0) == 0) {
          break;
        }
        if ((bS(j | 0, k | 0, 0) | 0) != 0) {
          break;
        }
        c[h >> 2] = k;
        c[(b + 144) >> 2] = 0;
        c[(b + 148) >> 2] = c[(b + 140) >> 2];
        c[(b + 152) >> 2] = 0;
        c[(b + 24) >> 2] = 0;
        c[(b + 124) >> 2] = 0;
        a[(b + 128) | 0] = 0;
        c[(b + 132) >> 2] = 0;
        a[(b + 136) | 0] = 0;
        a[(b + 137) | 0] = 0;
        c[(b + 28) >> 2] = 569;
        c[(b + 32) >> 2] = 1139;
        c[(b + 36) >> 2] = 569;
        c[(b + 40) >> 2] = 16384;
        c[(b + 44) >> 2] = -23060;
        c[(b + 48) >> 2] = 8956;
        zP((b + 52) | 0, 0, 24);
        c[(b + 76) >> 2] = 569;
        c[(b + 80) >> 2] = 1139;
        c[(b + 84) >> 2] = 569;
        c[(b + 88) >> 2] = 16384;
        c[(b + 92) >> 2] = -23060;
        c[(b + 96) >> 2] = 8956;
        zP((b + 100) | 0, 0, 24);
      }
    } while (0);
    c[(b + 144) >> 2] = 0;
    c[(b + 148) >> 2] = c[(b + 140) >> 2];
    c[(b + 152) >> 2] = 0;
    c[(b + 24) >> 2] = 0;
    c[(b + 124) >> 2] = 0;
    a[(b + 128) | 0] = 0;
    c[(b + 132) >> 2] = 0;
    a[(b + 136) | 0] = 0;
    a[(b + 137) | 0] = 0;
    c[(b + 28) >> 2] = 569;
    c[(b + 32) >> 2] = 1139;
    c[(b + 36) >> 2] = 569;
    c[(b + 40) >> 2] = 16384;
    c[(b + 44) >> 2] = -23060;
    c[(b + 48) >> 2] = 8956;
    zP((b + 52) | 0, 0, 24);
    c[(b + 76) >> 2] = 569;
    c[(b + 80) >> 2] = 1139;
    c[(b + 84) >> 2] = 569;
    c[(b + 88) >> 2] = 16384;
    c[(b + 92) >> 2] = -23060;
    c[(b + 96) >> 2] = 8956;
    zP((b + 100) | 0, 0, 24);
    i = f;
    return;
  }
  function cC(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0,
      i = 0;
    f = (e << 24) >> 24 != 0;
    e = f & 1;
    if ((a[(b + 3) | 0] | 0) == 0) {
      a[(b + 17) | 0] = e;
      return;
    }
    g = (b + 16) | 0;
    if ((d[g] | 0) == ((f & 1) | 0)) {
      return;
    }
    a[g] = e;
    if ((a[(b + 1) | 0] | 0) != 0) {
      e = c[(b + 20) >> 2] | 0;
      c[(b + 24) >> 2] = f ? -e | 0 : e;
      return;
    }
    if (((a[b | 0] | 0) == 0) | (f ^ 1)) {
      return;
    }
    f = c[(b + 140) >> 2] | 0;
    e = (b + 148) | 0;
    g = (f - (c[e >> 2] | 0)) | 0;
    c[e >> 2] = f;
    if (g >>> 0 < 298) {
      return;
    }
    if (g >>> 0 < 894) {
      f = (b + 124) | 0;
      e = ((c[f >> 2] | 0) + 1) | 0;
      c[f >> 2] = e;
      if (e >>> 0 <= 7) {
        return;
      }
      e = c[(b + 164) >> 2] | 0;
      h = (b + 128) | 0;
      if ((e | 0) != 0) {
        i = d[h] | 0;
        aA(i | 0, e | 0) | 0;
        e = (b + 4) | 0;
        c[e >> 2] = (c[e >> 2] | 0) + 1;
      }
      a[h] = 0;
      c[f >> 2] = 0;
      return;
    }
    if (g >>> 0 >= 1491) {
      return;
    }
    g = (b + 124) | 0;
    f = c[g >> 2] | 0;
    h = (b + 128) | 0;
    e = d[h] | (128 >>> (f >>> 0));
    a[h] = e & 255;
    i = (f + 1) | 0;
    c[g >> 2] = i;
    if (i >>> 0 <= 7) {
      return;
    }
    i = c[(b + 164) >> 2] | 0;
    if ((i | 0) != 0) {
      f = e & 255;
      aA(f | 0, i | 0) | 0;
      i = (b + 4) | 0;
      c[i >> 2] = (c[i >> 2] | 0) + 1;
    }
    a[h] = 0;
    c[g >> 2] = 0;
    return;
  }
  function cD(b) {
    b = b | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0;
    d = i;
    if ((a[(b + 1) | 0] | 0) == 0) {
      e = 40800;
    } else {
      e = (a[(b + 2) | 0] | 0) != 0 ? 21824 : 41856;
    }
    f = c[(b + 4) >> 2] | 0;
    g = c[(b + 160) >> 2] | 0;
    w2(
      39200,
      ((x = i),
      (i = (i + 32) | 0),
      (c[x >> 2] = (a[b | 0] | 0) != 0 ? 38176 : 37192),
      (c[(x + 8) >> 2] = e),
      (c[(x + 16) >> 2] = f),
      (c[(x + 24) >> 2] = (g | 0) == 0 ? 23120 : g),
      x) | 0
    );
    i = d;
    return;
  }
  function cE(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0;
    e = i;
    f = (b + 140) | 0;
    c[f >> 2] = (c[f >> 2] | 0) + d;
    if ((a[(b + 3) | 0] | 0) == 0) {
      i = e;
      return;
    }
    if ((a[(b + 1) | 0] | 0) == 0) {
      if ((a[b | 0] | 0) != 0) {
        i = e;
        return;
      }
      f = (b + 152) | 0;
      g = c[f >> 2] | 0;
      if (g >>> 0 > d >>> 0) {
        c[f >> 2] = g - d;
        i = e;
        return;
      }
      h = (d - g) | 0;
      g = (b + 17) | 0;
      j = (a[g] | 0) == 0;
      a[g] = j & 1;
      L137: do {
        if (j) {
          g = (b + 132) | 0;
          k = c[g >> 2] | 0;
          do {
            if ((k | 0) == 0) {
              l = (b + 164) | 0;
              m = c[l >> 2] | 0;
              if ((m | 0) == 0) {
                break L137;
              }
              if ((bR(m | 0) | 0) != 0) {
                break L137;
              }
              m = aS(c[l >> 2] | 0) | 0;
              l = (b + 4) | 0;
              n = c[l >> 2] | 0;
              if ((m | 0) == -1) {
                w2(35248, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = n), x) | 0);
                break L137;
              } else {
                c[l >> 2] = n + 1;
                c[g >> 2] = 8;
                n = m & 255;
                a[(b + 136) | 0] = n;
                o = 7;
                p = n;
                break;
              }
            } else {
              o = (k - 1) | 0;
              p = a[(b + 136) | 0] | 0;
            }
          } while (0);
          a[(b + 137) | 0] = (p & 255) >>> 7;
          a[(b + 136) | 0] = p << 1;
          c[g >> 2] = o;
        }
      } while (0);
      o = (a[(b + 137) | 0] | 0) == 0 ? 298 : 596;
      c[f >> 2] = o;
      if (o >>> 0 <= h >>> 0) {
        i = e;
        return;
      }
      c[f >> 2] = o - h;
      i = e;
      return;
    }
    h = (b + 144) | 0;
    o = ((c[h >> 2] | 0) + ((d * 44100) | 0)) | 0;
    c[h >> 2] = (o >>> 0) % 1193182 | 0;
    h = ((o >>> 0) / 1193182) | 0;
    if (o >>> 0 < 1193182) {
      i = e;
      return;
    }
    if ((a[b | 0] | 0) == 0) {
      o = (b + 164) | 0;
      d = (b + 4) | 0;
      f = (b + 104) | 0;
      p = (b + 108) | 0;
      j = (b + 100) | 0;
      k = (b + 116) | 0;
      n = (b + 120) | 0;
      m = (b + 112) | 0;
      l = (b + 76) | 0;
      q = (b + 80) | 0;
      r = (b + 84) | 0;
      s = (b + 92) | 0;
      t = (b + 96) | 0;
      u = 0;
      do {
        do {
          if ((bR(c[o >> 2] | 0) | 0) == 0) {
            v = aS(c[o >> 2] | 0) | 0;
            w = c[d >> 2] | 0;
            if ((v | 0) == -1) {
              w2(35248, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = w), x) | 0);
              y = 1;
              break;
            } else {
              c[d >> 2] = w + 1;
              w = c[f >> 2] | 0;
              c[p >> 2] = w;
              z = c[j >> 2] | 0;
              c[f >> 2] = z;
              A = (((v & 128) | 0) != 0 ? (v - 256) | 0 : v) << 5;
              c[j >> 2] = A;
              v = c[k >> 2] | 0;
              c[n >> 2] = v;
              B = c[m >> 2] | 0;
              c[k >> 2] = B;
              C = ac(c[l >> 2] | 0, A) | 0;
              A = ac(c[q >> 2] | 0, z) | 0;
              z = (A + C + (ac(c[r >> 2] | 0, w) | 0)) | 0;
              w = ac(c[s >> 2] | 0, B) | 0;
              B = (z - w - (ac(c[t >> 2] | 0, v) | 0)) | 0;
              c[m >> 2] = ((B | 0) / 16384) | 0;
              y = (((((B | 0) / 524288) | 0) >>> 31) & 255) ^ 1;
              break;
            }
          } else {
            y = 1;
          }
        } while (0);
        u = (u + 1) | 0;
      } while (u >>> 0 < h >>> 0);
      a[(b + 17) | 0] = y;
      i = e;
      return;
    }
    y = (b + 24) | 0;
    u = (b + 2) | 0;
    m = (b + 164) | 0;
    t = (b + 4) | 0;
    s = (b + 56) | 0;
    r = (b + 60) | 0;
    q = (b + 52) | 0;
    l = (b + 68) | 0;
    k = (b + 72) | 0;
    n = (b + 64) | 0;
    j = (b + 28) | 0;
    f = (b + 32) | 0;
    p = (b + 36) | 0;
    d = (b + 44) | 0;
    o = (b + 48) | 0;
    b = 1;
    g = a[u] | 0;
    while (1) {
      B = c[y >> 2] | 0;
      if ((g << 24) >> 24 == 0) {
        D = B;
      } else {
        v = c[s >> 2] | 0;
        c[r >> 2] = v;
        w = c[q >> 2] | 0;
        c[s >> 2] = w;
        z = B << 5;
        c[q >> 2] = z;
        B = c[l >> 2] | 0;
        c[k >> 2] = B;
        C = c[n >> 2] | 0;
        c[l >> 2] = C;
        A = ac(c[j >> 2] | 0, z) | 0;
        z = ac(c[f >> 2] | 0, w) | 0;
        w = (z + A + (ac(c[p >> 2] | 0, v) | 0)) | 0;
        v = ac(c[d >> 2] | 0, C) | 0;
        C = (w - v - (ac(c[o >> 2] | 0, B) | 0)) | 0;
        c[n >> 2] = ((C | 0) / 16384) | 0;
        D = ((C | 0) / 524288) | 0;
      }
      if ((D | 0) < 0) {
        E = (D | 0) < -127 ? -128 : D & 255;
      } else {
        E = (D | 0) > 127 ? 127 : D & 255;
      }
      aA((E & 255) | 0, c[m >> 2] | 0) | 0;
      c[t >> 2] = (c[t >> 2] | 0) + 1;
      C = a[u] | 0;
      if ((C << 24) >> 24 != 0) {
        c[y >> 2] = ((((c[y >> 2] | 0) * 15) | 0 | 0) / 16) | 0;
      }
      if (b >>> 0 >= h >>> 0) {
        break;
      }
      b = (b + 1) | 0;
      g = C;
    }
    i = e;
    return;
  }
  function cF(b) {
    b = b | 0;
    var d = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0;
    d = i;
    w3(34760);
    f = e[(b + 10) >> 1] | 0;
    g = e[(b + 6) >> 1] | 0;
    h = e[(b + 8) >> 1] | 0;
    j = e[(b + 12) >> 1] | 0;
    k = e[(b + 14) >> 1] | 0;
    l = e[(b + 16) >> 1] | 0;
    m = e[(b + 18) >> 1] | 0;
    n = c[((c[10742] | 0) + 3140) >> 2] | 0;
    w2(
      39520,
      ((x = i),
      (i = (i + 80) | 0),
      (c[x >> 2] = e[(b + 4) >> 1] | 0),
      (c[(x + 8) >> 2] = f),
      (c[(x + 16) >> 2] = g),
      (c[(x + 24) >> 2] = h),
      (c[(x + 32) >> 2] = j),
      (c[(x + 40) >> 2] = k),
      (c[(x + 48) >> 2] = l),
      (c[(x + 56) >> 2] = m),
      (c[(x + 64) >> 2] = n & 255),
      (c[(x + 72) >> 2] = ((n & 256) | 0) != 0 ? 42 : 32),
      x) | 0
    );
    n = e[(b + 26) >> 1] | 0;
    m = e[(b + 20) >> 1] | 0;
    l = e[(b + 24) >> 1] | 0;
    k = e[(b + 28) >> 1] | 0;
    j = (b + 30) | 0;
    h = e[j >> 1] | 0;
    w2(
      32592,
      ((x = i),
      (i = (i + 48) | 0),
      (c[x >> 2] = e[(b + 22) >> 1] | 0),
      (c[(x + 8) >> 2] = n),
      (c[(x + 16) >> 2] = m),
      (c[(x + 24) >> 2] = l),
      (c[(x + 32) >> 2] = k),
      (c[(x + 40) >> 2] = h),
      x) | 0
    );
    h = e[j >> 1] | 0;
    j = a[(768 + ((h >>> 10) & 1)) | 0] | 0;
    k = a[(768 + ((h >>> 11) & 1)) | 0] | 0;
    l = a[(768 + ((h >>> 7) & 1)) | 0] | 0;
    m = a[(768 + ((h >>> 6) & 1)) | 0] | 0;
    n = a[(768 + ((h >>> 4) & 1)) | 0] | 0;
    g = a[(768 + ((h >>> 2) & 1)) | 0] | 0;
    f = a[(768 + (h & 1)) | 0] | 0;
    w2(
      30616,
      ((x = i),
      (i = (i + 64) | 0),
      (c[x >> 2] = a[(768 + ((h >>> 9) & 1)) | 0] | 0),
      (c[(x + 8) >> 2] = j),
      (c[(x + 16) >> 2] = k),
      (c[(x + 24) >> 2] = l),
      (c[(x + 32) >> 2] = m),
      (c[(x + 40) >> 2] = n),
      (c[(x + 48) >> 2] = g),
      (c[(x + 56) >> 2] = f),
      x) | 0
    );
    if ((c[(b + 152) >> 2] | 0) == 0) {
      i = d;
      return;
    }
    w2(
      28528,
      ((x = i),
      (i = (i + 1) | 0),
      (i = ((i + 7) >> 3) << 3),
      (c[x >> 2] = 0),
      x) | 0
    );
    i = d;
    return;
  }
  function cG(b) {
    b = b | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0;
    d = (b + 3168) | 0;
    xM(d);
    dh(b);
    if ((c[d >> 2] | 0) == 0) {
      e = (b + 3172) | 0;
      f = (b + 3128) | 0;
      g = (b + 3028) | 0;
      do {
        if ((a[e] | 0) == 0) {
          di(b, c[f >> 2] << 2);
        } else {
          xU(1e5) | 0;
          zt(c[g >> 2] | 0);
        }
      } while ((c[d >> 2] | 0) == 0);
    }
    d = (b + 3140) | 0;
    c[d >> 2] = c[d >> 2] & 255;
    xL();
    return;
  }
  function cH(a) {
    a = a | 0;
    var b = 0;
    c[11094] = a;
    xM((a + 3168) | 0);
    dh(a);
    bY(4, 100, 1) | 0;
    b = (a + 3140) | 0;
    c[b >> 2] = c[b >> 2] & 255;
    return;
  }
  function cI() {
    var a = 0,
      b = 0,
      d = 0;
    a = 0;
    while (1) {
      if ((a | 0) >= 1e4) {
        b = 163;
        break;
      }
      d = c[11094] | 0;
      di(d, c[(d + 3128) >> 2] << 2);
      if ((c[((c[11094] | 0) + 3168) >> 2] | 0) == 0) {
        a = (a + 1) | 0;
      } else {
        break;
      }
    }
    if ((b | 0) == 163) {
      return;
    }
    xL();
    aG() | 0;
    return;
  }
  function cJ(f, g) {
    f = f | 0;
    g = g | 0;
    var j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      H = 0,
      I = 0,
      J = 0,
      K = 0,
      L = 0,
      M = 0,
      N = 0,
      O = 0,
      P = 0,
      Q = 0,
      R = 0,
      S = 0,
      T = 0,
      U = 0,
      V = 0,
      W = 0,
      X = 0,
      Y = 0,
      Z = 0,
      _ = 0,
      $ = 0,
      aa = 0,
      ab = 0,
      ac = 0,
      ad = 0,
      ae = 0,
      af = 0,
      ag = 0,
      ah = 0,
      ai = 0.0,
      aj = 0,
      ak = 0,
      al = 0.0;
    j = i;
    i = (i + 2496) | 0;
    k = j | 0;
    l = (j + 8) | 0;
    m = (j + 16) | 0;
    n = (j + 24) | 0;
    p = (j + 32) | 0;
    q = (j + 264) | 0;
    r = (j + 496) | 0;
    s = (j + 504) | 0;
    t = (j + 736) | 0;
    u = (j + 744) | 0;
    v = (j + 976) | 0;
    w = (j + 984) | 0;
    y = (j + 1240) | 0;
    z = (j + 1472) | 0;
    A = (j + 1480) | 0;
    B = (j + 1712) | 0;
    C = (j + 1720) | 0;
    D = (j + 1728) | 0;
    E = (j + 1736) | 0;
    F = (j + 1744) | 0;
    H = (j + 1976) | 0;
    I = (j + 1984) | 0;
    J = (j + 1992) | 0;
    K = (j + 2224) | 0;
    L = (j + 2480) | 0;
    M = (j + 2488) | 0;
    N = c[(f + 3028) >> 2] | 0;
    if ((N | 0) != 0) {
      zt(N);
    }
    if ((wM(g, 26872) | 0) != 0) {
      if ((wL(g) | 0) != 0) {
        N = c7(f) | 0;
        w2(35752, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = N), x) | 0);
        O = 0;
        i = j;
        return O | 0;
      }
      if ((wS(g, M) | 0) == 0) {
        wK(g, 35712);
        O = 0;
        i = j;
        return O | 0;
      }
      if ((wP(g) | 0) == 0) {
        O = 0;
        i = j;
        return O | 0;
      }
      c6(f, e[M >> 1] | 0);
      O = 0;
      i = j;
      return O | 0;
    }
    if ((wM(g, 25336) | 0) != 0) {
      wI(g, (f + 3068) | 0);
      O = 0;
      i = j;
      return O | 0;
    }
    if ((wM(g, 24088) | 0) != 0) {
      c[L >> 2] = 1;
      wT(g, L) | 0;
      if ((wP(g) | 0) == 0) {
        O = 0;
        i = j;
        return O | 0;
      }
      dh(f);
      if ((c[L >> 2] | 0) != 0) {
        do {
          di(f, 1);
          M = ((c[L >> 2] | 0) - 1) | 0;
          c[L >> 2] = M;
        } while ((M | 0) != 0);
      }
      L = K | 0;
      M = f | 0;
      eI(c[M >> 2] | 0, J);
      cP(L, J);
      cF(c[M >> 2] | 0);
      J = c[M >> 2] | 0;
      M = e[(J + 28) >> 1] | 0;
      w2(
        26496,
        ((x = i),
        (i = (i + 24) | 0),
        (c[x >> 2] = e[(J + 22) >> 1] | 0),
        (c[(x + 8) >> 2] = M),
        (c[(x + 16) >> 2] = L),
        x) | 0
      );
      O = 0;
      i = j;
      return O | 0;
    }
    if ((wM(g, 22512) | 0) != 0) {
      if ((wM(g, 25336) | 0) == 0) {
        L = (wM(g, 31280) | 0) == 0;
        M = (wP(g) | 0) == 0;
        if (L) {
          if (M) {
            O = 0;
            i = j;
            return O | 0;
          }
          cG(f);
          O = 0;
          i = j;
          return O | 0;
        }
        if (M) {
          O = 0;
          i = j;
          return O | 0;
        }
        M = f | 0;
        L = b[((c[M >> 2] | 0) + 22) >> 1] | 0;
        J = (f + 3168) | 0;
        xM(J);
        dh(f);
        N = (f + 3140) | 0;
        P = (f + 3068) | 0;
        Q = L & 65535;
        do {
          c[N >> 2] = c[N >> 2] & 255;
          R = hX(c[M >> 2] | 0) | 0;
          S = G;
          do {
            T = hX(c[M >> 2] | 0) | 0;
            if (!(((T | 0) == (R | 0)) & ((G | 0) == (S | 0)))) {
              break;
            }
            di(f, 1);
          } while ((c[J >> 2] | 0) == 0);
          U = c[M >> 2] | 0;
          if ((b[(U + 22) >> 1] | 0) != (L << 16) >> 16) {
            V = 205;
            break;
          }
          if ((wH(P, Q, e[(U + 28) >> 1] | 0, c[o >> 2] | 0) | 0) != 0) {
            break;
          }
        } while ((c[J >> 2] | 0) == 0);
        if ((V | 0) == 205) {
          J = K | 0;
          eI(U, F);
          cP(J, F);
          cF(c[M >> 2] | 0);
          F = c[M >> 2] | 0;
          M = e[(F + 28) >> 1] | 0;
          w2(
            26496,
            ((x = i),
            (i = (i + 24) | 0),
            (c[x >> 2] = e[(F + 22) >> 1] | 0),
            (c[(x + 8) >> 2] = M),
            (c[(x + 16) >> 2] = J),
            x) | 0
          );
        }
        xL();
        O = 0;
        i = j;
        return O | 0;
      }
      L269: do {
        if ((wT(g, H) | 0) != 0) {
          J = (f + 3068) | 0;
          while (1) {
            if ((wM(g, 35904) | 0) == 0) {
              W = wx(c[H >> 2] | 0) | 0;
            } else {
              if ((wT(g, I) | 0) == 0) {
                break;
              }
              W = wA(c[H >> 2] & 65535, c[I >> 2] & 65535) | 0;
            }
            wG(J, W) | 0;
            if ((wT(g, H) | 0) == 0) {
              break L269;
            }
          }
          wK(g, 35792);
          O = 0;
          i = j;
          return O | 0;
        }
      } while (0);
      if ((wP(g) | 0) == 0) {
        O = 0;
        i = j;
        return O | 0;
      }
      H = (f + 3168) | 0;
      xM(H);
      dh(f);
      W = (f + 3140) | 0;
      I = f | 0;
      J = (f + 3068) | 0;
      do {
        c[W >> 2] = c[W >> 2] & 255;
        M = hX(c[I >> 2] | 0) | 0;
        F = G;
        do {
          U = hX(c[I >> 2] | 0) | 0;
          if (!(((U | 0) == (M | 0)) & ((G | 0) == (F | 0)))) {
            break;
          }
          di(f, 1);
        } while ((c[H >> 2] | 0) == 0);
        F = c[I >> 2] | 0;
        if (
          (wH(J, e[(F + 22) >> 1] | 0, e[(F + 28) >> 1] | 0, c[o >> 2] | 0) |
            0) !=
          0
        ) {
          break;
        }
      } while ((c[H >> 2] | 0) == 0);
      xL();
      O = 0;
      i = j;
      return O | 0;
    }
    if ((wM(g, 21352) | 0) != 0) {
      w1(35960);
      O = 0;
      i = j;
      return O | 0;
    }
    if ((wM(g, 41432) | 0) != 0) {
      if ((wM(g, 38440) | 0) == 0) {
        wM(g, 25336) | 0;
        X = 0;
      } else {
        X = 1;
      }
      if ((wS(g, E) | 0) == 0) {
        wK(g, 38384);
        O = 0;
        i = j;
        return O | 0;
      }
      if ((wP(g) | 0) == 0) {
        O = 0;
        i = j;
        return O | 0;
      }
      H = e[E >> 1] | 0;
      E = c[f >> 2] | 0;
      if ((X | 0) == 0) {
        X = (b8[c[(E + 56) >> 2] & 255](c[(E + 52) >> 2] | 0, H) | 0) & 255;
        w2(
          36928,
          ((x = i),
          (i = (i + 16) | 0),
          (c[x >> 2] = H),
          (c[(x + 8) >> 2] = X),
          x) | 0
        );
        O = 0;
        i = j;
        return O | 0;
      } else {
        X = (b8[c[(E + 64) >> 2] & 255](c[(E + 52) >> 2] | 0, H) | 0) & 65535;
        w2(
          37136,
          ((x = i),
          (i = (i + 16) | 0),
          (c[x >> 2] = H),
          (c[(x + 8) >> 2] = X),
          x) | 0
        );
        O = 0;
        i = j;
        return O | 0;
      }
    }
    if ((wM(g, 40304) | 0) != 0) {
      X = K | 0;
      if ((wO(g, X, 256) | 0) != 0) {
        H = (f + 564) | 0;
        do {
          E = a[X] | 0;
          if ((E << 24) >> 24 == 43) {
            Y = 1;
            Z = 1;
          } else {
            J = (E << 24) >> 24 == 45;
            Y = J & 1;
            Z = J ? 2 : 1;
          }
          J = (K + Y) | 0;
          E = zg(J) | 0;
          if ((E | 0) == 0) {
            w2(37440, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = X), x) | 0);
          } else {
            w2(
              37384,
              ((x = i),
              (i = (i + 16) | 0),
              (c[x >> 2] = (Z | 0) == 1 ? 37336 : 37184),
              (c[(x + 8) >> 2] = J),
              x) | 0
            );
            dL(H, Z, E);
          }
        } while ((wO(g, X, 256) | 0) != 0);
      }
      wP(g) | 0;
      O = 0;
      i = j;
      return O | 0;
    }
    if ((wM(g, 38776) | 0) != 0) {
      if ((wM(g, 38168) | 0) == 0) {
        wK(g, 38104);
        O = 0;
        i = j;
        return O | 0;
      }
      X = K | 0;
      if ((wL(g) | 0) != 0) {
        Z = 0;
        while (1) {
          H = c4(f, Z) | 0;
          if ((H | 0) != 0) {
            w2(
              37504,
              ((x = i),
              (i = (i + 16) | 0),
              (c[x >> 2] = Z),
              (c[(x + 8) >> 2] = H),
              x) | 0
            );
          }
          H = (Z + 1) | 0;
          if (H >>> 0 < 256) {
            Z = H;
          } else {
            O = 0;
            break;
          }
        }
        i = j;
        return O | 0;
      }
      if ((wM(g, 37912) | 0) != 0) {
        Z = 0;
        while (1) {
          H = c4(f, Z) | 0;
          if ((H | 0) != 0) {
            w2(
              37504,
              ((x = i),
              (i = (i + 16) | 0),
              (c[x >> 2] = Z),
              (c[(x + 8) >> 2] = H),
              x) | 0
            );
          }
          H = (Z + 1) | 0;
          if (H >>> 0 < 256) {
            Z = H;
          } else {
            O = 0;
            break;
          }
        }
        i = j;
        return O | 0;
      }
      if ((wS(g, D) | 0) == 0) {
        wK(g, 37776);
        O = 0;
        i = j;
        return O | 0;
      }
      if ((wL(g) | 0) != 0) {
        dc(f, e[D >> 1] | 0, 0);
        w2(
          37680,
          ((x = i), (i = (i + 8) | 0), (c[x >> 2] = e[D >> 1] | 0), x) | 0
        );
        O = 0;
        i = j;
        return O | 0;
      }
      if ((wO(g, X, 256) | 0) == 0) {
        wK(g, 37616);
        O = 0;
        i = j;
        return O | 0;
      } else {
        w2(
          37504,
          ((x = i),
          (i = (i + 16) | 0),
          (c[x >> 2] = e[D >> 1] | 0),
          (c[(x + 8) >> 2] = X),
          x) | 0
        );
        dc(f, e[D >> 1] | 0, X);
        O = 0;
        i = j;
        return O | 0;
      }
    }
    if ((wM(g, 37808) | 0) != 0) {
      if ((wM(g, 38440) | 0) == 0) {
        wM(g, 25336) | 0;
        _ = 0;
      } else {
        _ = 1;
      }
      if ((wS(g, B) | 0) == 0) {
        wK(g, 38384);
        O = 0;
        i = j;
        return O | 0;
      }
      if ((wS(g, C) | 0) == 0) {
        wK(g, 38336);
        O = 0;
        i = j;
        return O | 0;
      }
      if ((wP(g) | 0) == 0) {
        O = 0;
        i = j;
        return O | 0;
      }
      X = c[f >> 2] | 0;
      if ((_ | 0) == 0) {
        b5[c[(X + 60) >> 2] & 255](
          c[(X + 52) >> 2] | 0,
          e[B >> 1] | 0,
          b[C >> 1] & 255
        );
        O = 0;
        i = j;
        return O | 0;
      } else {
        b5[c[(X + 68) >> 2] & 255](
          c[(X + 52) >> 2] | 0,
          e[B >> 1] | 0,
          b[C >> 1] | 0
        );
        O = 0;
        i = j;
        return O | 0;
      }
    }
    if ((wM(g, 35952) | 0) != 0) {
      if ((wM(g, 24088) | 0) != 0) {
        if ((wP(g) | 0) == 0) {
          O = 0;
          i = j;
          return O | 0;
        }
        mj(c[f >> 2] | 0);
        O = 0;
        i = j;
        return O | 0;
      }
      if ((wM(g, 38696) | 0) != 0) {
        if ((wP(g) | 0) == 0) {
          O = 0;
          i = j;
          return O | 0;
        }
        mH(c[f >> 2] | 0);
        O = 0;
        i = j;
        return O | 0;
      }
      if ((wM(g, 34496) | 0) != 0) {
        if ((wP(g) | 0) == 0) {
          O = 0;
          i = j;
          return O | 0;
        }
        w1(38480);
        C = f | 0;
        B = c[C >> 2] | 0;
        if ((c[(B + 124) >> 2] | 0) != 0) {
          X = 0;
          _ = B;
          do {
            w2(
              26280,
              ((x = i),
              (i = (i + 8) | 0),
              (c[x >> 2] = d[(_ + 128 + X) | 0] | 0),
              x) | 0
            );
            X = (X + 1) | 0;
            _ = c[C >> 2] | 0;
          } while (X >>> 0 < (c[(_ + 124) >> 2] | 0) >>> 0);
        }
        w1(22064);
        O = 0;
        i = j;
        return O | 0;
      }
      if ((wL(g) | 0) == 0) {
        wK(g, 38560);
        O = 0;
        i = j;
        return O | 0;
      }
      if ((wP(g) | 0) == 0) {
        O = 0;
        i = j;
        return O | 0;
      }
      w1(38480);
      _ = f | 0;
      X = c[_ >> 2] | 0;
      if ((c[(X + 124) >> 2] | 0) != 0) {
        C = 0;
        B = X;
        do {
          w2(
            26280,
            ((x = i),
            (i = (i + 8) | 0),
            (c[x >> 2] = d[(B + 128 + C) | 0] | 0),
            x) | 0
          );
          C = (C + 1) | 0;
          B = c[_ >> 2] | 0;
        } while (C >>> 0 < (c[(B + 124) >> 2] | 0) >>> 0);
      }
      w1(22064);
      O = 0;
      i = j;
      return O | 0;
    }
    if ((wM(g, 34992) | 0) != 0) {
      c[z >> 2] = 1;
      wT(g, z) | 0;
      if ((wP(g) | 0) == 0) {
        O = 0;
        i = j;
        return O | 0;
      }
      B = (f + 3168) | 0;
      xM(B);
      C = (f + 3140) | 0;
      c[C >> 2] = c[C >> 2] & 255;
      dh(f);
      C = f | 0;
      _ = (f + 3068) | 0;
      X = A | 0;
      D = (A + 12) | 0;
      Z = 0;
      L435: while (1) {
        if (Z >>> 0 >= (c[z >> 2] | 0) >>> 0) {
          break;
        }
        eI(c[C >> 2] | 0, A);
        H = c[C >> 2] | 0;
        Y = b[(H + 22) >> 1] | 0;
        E = b[(H + 28) >> 1] | 0;
        J = H;
        H = E;
        while (1) {
          if ((H << 16) >> 16 != (E << 16) >> 16) {
            $ = Y;
            aa = J;
            break;
          }
          di(f, 1);
          I = c[C >> 2] | 0;
          if (
            (wH(_, e[(I + 22) >> 1] | 0, e[(I + 28) >> 1] | 0, c[o >> 2] | 0) |
              0) !=
            0
          ) {
            break L435;
          }
          if ((c[B >> 2] | 0) != 0) {
            break L435;
          }
          I = c[C >> 2] | 0;
          W = b[(I + 22) >> 1] | 0;
          if ((W << 16) >> 16 != (Y << 16) >> 16) {
            $ = W;
            aa = I;
            break;
          }
          J = I;
          H = b[(I + 28) >> 1] | 0;
        }
        L445: do {
          if (((c[X >> 2] & 768) | 0) == 0) {
            ab = $;
            ac = b[(aa + 28) >> 1] | 0;
          } else {
            H = ((c[D >> 2] | 0) + (E & 65535)) & 65535;
            J = aa;
            I = $;
            while (1) {
              if ((I << 16) >> 16 == (Y << 16) >> 16) {
                if ((b[(J + 28) >> 1] | 0) == (H << 16) >> 16) {
                  ab = Y;
                  ac = H;
                  break L445;
                }
              }
              di(f, 1);
              W = c[C >> 2] | 0;
              if (
                (wH(
                  _,
                  e[(W + 22) >> 1] | 0,
                  e[(W + 28) >> 1] | 0,
                  c[o >> 2] | 0
                ) |
                  0) !=
                0
              ) {
                break L435;
              }
              if ((c[B >> 2] | 0) != 0) {
                break L435;
              }
              W = c[C >> 2] | 0;
              J = W;
              I = b[(W + 22) >> 1] | 0;
            }
          }
        } while (0);
        if ((wH(_, ab & 65535, ac & 65535, c[o >> 2] | 0) | 0) != 0) {
          break;
        }
        if ((c[B >> 2] | 0) == 0) {
          Z = (Z + 1) | 0;
        } else {
          break;
        }
      }
      xL();
      Z = K | 0;
      eI(c[C >> 2] | 0, y);
      cP(Z, y);
      cF(c[C >> 2] | 0);
      y = c[C >> 2] | 0;
      C = e[(y + 28) >> 1] | 0;
      w2(
        26496,
        ((x = i),
        (i = (i + 24) | 0),
        (c[x >> 2] = e[(y + 22) >> 1] | 0),
        (c[(x + 8) >> 2] = C),
        (c[(x + 16) >> 2] = Z),
        x) | 0
      );
      O = 0;
      i = j;
      return O | 0;
    }
    if ((wM(g, 34608) | 0) != 0) {
      Z = w | 0;
      if ((wL(g) | 0) != 0) {
        cF(c[f >> 2] | 0);
        O = 0;
        i = j;
        return O | 0;
      }
      if ((wN(g, Z, 256) | 0) == 0) {
        w2(
          39176,
          ((x = i),
          (i = (i + 1) | 0),
          (i = ((i + 7) >> 3) << 3),
          (c[x >> 2] = 0),
          x) | 0
        );
        O = 0;
        i = j;
        return O | 0;
      }
      w = f | 0;
      if ((hV(c[w >> 2] | 0, Z, v) | 0) != 0) {
        w2(39112, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = Z), x) | 0);
        O = 0;
        i = j;
        return O | 0;
      }
      if ((wL(g) | 0) != 0) {
        w2(38872, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = c[v >> 2]), x) | 0);
        O = 0;
        i = j;
        return O | 0;
      }
      if ((wT(g, v) | 0) == 0) {
        w2(
          38752,
          ((x = i),
          (i = (i + 1) | 0),
          (i = ((i + 7) >> 3) << 3),
          (c[x >> 2] = 0),
          x) | 0
        );
        O = 0;
        i = j;
        return O | 0;
      }
      if ((wP(g) | 0) == 0) {
        O = 0;
        i = j;
        return O | 0;
      }
      C = c[w >> 2] | 0;
      y = c[v >> 2] | 0;
      ic(C, Z, y) | 0;
      y = K | 0;
      eI(c[w >> 2] | 0, u);
      cP(y, u);
      cF(c[w >> 2] | 0);
      u = c[w >> 2] | 0;
      w = e[(u + 28) >> 1] | 0;
      w2(
        26496,
        ((x = i),
        (i = (i + 24) | 0),
        (c[x >> 2] = e[(u + 22) >> 1] | 0),
        (c[(x + 8) >> 2] = w),
        (c[(x + 16) >> 2] = y),
        x) | 0
      );
      O = 0;
      i = j;
      return O | 0;
    }
    if ((wM(g, 34496) | 0) == 0) {
      if ((wM(g, 34240) | 0) != 0) {
        c[r >> 2] = 1;
        wT(g, r) | 0;
        if ((wP(g) | 0) == 0) {
          O = 0;
          i = j;
          return O | 0;
        }
        y = (f + 3168) | 0;
        xM(y);
        dh(f);
        w = (f + 3140) | 0;
        u = f | 0;
        Z = (f + 3068) | 0;
        C = 0;
        while (1) {
          if (C >>> 0 >= (c[r >> 2] | 0) >>> 0) {
            break;
          }
          c[w >> 2] = c[w >> 2] & 255;
          v = hX(c[u >> 2] | 0) | 0;
          B = G;
          do {
            ac = hX(c[u >> 2] | 0) | 0;
            if (!(((ac | 0) == (v | 0)) & ((G | 0) == (B | 0)))) {
              break;
            }
            di(f, 1);
          } while ((c[y >> 2] | 0) == 0);
          B = c[u >> 2] | 0;
          if (
            (wH(Z, e[(B + 22) >> 1] | 0, e[(B + 28) >> 1] | 0, c[o >> 2] | 0) |
              0) !=
            0
          ) {
            break;
          }
          if ((c[y >> 2] | 0) == 0) {
            C = (C + 1) | 0;
          } else {
            break;
          }
        }
        xL();
        C = K | 0;
        eI(c[u >> 2] | 0, q);
        cP(C, q);
        cF(c[u >> 2] | 0);
        q = c[u >> 2] | 0;
        u = e[(q + 28) >> 1] | 0;
        w2(
          26496,
          ((x = i),
          (i = (i + 24) | 0),
          (c[x >> 2] = e[(q + 22) >> 1] | 0),
          (c[(x + 8) >> 2] = u),
          (c[(x + 16) >> 2] = C),
          x) | 0
        );
        O = 0;
        i = j;
        return O | 0;
      }
      if ((wM(g, 34024) | 0) == 0) {
        O = 1;
        i = j;
        return O | 0;
      }
      C = K | 0;
      if (a[864] | 0) {
        ad = b[21468] | 0;
        ae = b[21472] | 0;
      } else {
        a[864] = 1;
        u = c[f >> 2] | 0;
        q = b[(u + 22) >> 1] | 0;
        b[21468] = q;
        y = b[(u + 28) >> 1] | 0;
        b[21472] = y;
        ad = q;
        ae = y;
      }
      b[k >> 1] = ad;
      b[l >> 1] = ae;
      b[m >> 1] = 16;
      b[n >> 1] = 0;
      if ((wU(g, k, l) | 0) != 0) {
        wS(g, m) | 0;
      }
      wS(g, n) | 0;
      if ((wP(g) | 0) == 0) {
        O = 0;
        i = j;
        return O | 0;
      }
      L518: do {
        if ((b[m >> 1] | 0) == 0) {
          af = b[l >> 1] | 0;
        } else {
          ae = f | 0;
          ad = (p + 12) | 0;
          y = b[l >> 1] | 0;
          while (1) {
            eH(c[ae >> 2] | 0, p, b[k >> 1] | 0, y);
            cP(C, p);
            q = e[l >> 1] | 0;
            w2(
              26496,
              ((x = i),
              (i = (i + 24) | 0),
              (c[x >> 2] = e[k >> 1] | 0),
              (c[(x + 8) >> 2] = q),
              (c[(x + 16) >> 2] = C),
              x) | 0
            );
            q = c[ad >> 2] | 0;
            ag = ((e[l >> 1] | 0) + q) & 65535;
            b[l >> 1] = ag;
            u = b[m >> 1] | 0;
            Z = u & 65535;
            if ((b[n >> 1] | 0) == 0) {
              ah = (u - 1) & 65535;
            } else {
              if (Z >>> 0 < q >>> 0) {
                break;
              }
              ah = (Z - q) & 65535;
            }
            b[m >> 1] = ah;
            if ((ah << 16) >> 16 == 0) {
              af = ag;
              break L518;
            } else {
              y = ag;
            }
          }
          b[m >> 1] = 0;
          af = ag;
        }
      } while (0);
      b[21468] = b[k >> 1] | 0;
      b[21472] = af;
      O = 0;
      i = j;
      return O | 0;
    }
    if ((wL(g) | 0) != 0) {
      af = K | 0;
      K = f | 0;
      eI(c[K >> 2] | 0, s);
      cP(af, s);
      cF(c[K >> 2] | 0);
      s = c[K >> 2] | 0;
      K = e[(s + 28) >> 1] | 0;
      w2(
        26496,
        ((x = i),
        (i = (i + 24) | 0),
        (c[x >> 2] = e[(s + 22) >> 1] | 0),
        (c[(x + 8) >> 2] = K),
        (c[(x + 16) >> 2] = af),
        x) | 0
      );
      O = 0;
      i = j;
      return O | 0;
    }
    if ((wL(g) | 0) != 0) {
      O = 0;
      i = j;
      return O | 0;
    }
    af = (f + 3024) | 0;
    K = (f + 3020) | 0;
    s = (f + 4) | 0;
    k = (f + 24) | 0;
    ag = (f + 16) | 0;
    m = (f + 32) | 0;
    ah = (f + 488) | 0;
    n = (f + 424) | 0;
    l = (f + 340) | 0;
    C = f | 0;
    L539: while (1) {
      do {
        if ((wM(g, 25384) | 0) == 0) {
          if ((wM(g, 25280) | 0) != 0) {
            cF(c[C >> 2] | 0);
            break;
          }
          if ((wM(g, 25184) | 0) != 0) {
            p = c[C >> 2] | 0;
            w3(39672);
            y = (p + 1216) | 0;
            ad = c[y >> 2] | 0;
            ae = c[(y + 4) >> 2] | 0;
            q = (p + 1208) | 0;
            Z = c[q >> 2] | 0;
            u = c[(q + 4) >> 2] | 0;
            if (((ad | 0) == 0) & ((ae | 0) == 0)) {
              ai = 0.0;
            } else {
              ai =
                (+(Z >>> 0) + +(u >>> 0) * 4294967296.0) /
                (+(ad >>> 0) + +(ae >>> 0) * 4294967296.0);
            }
            ae = c[(p + 1200) >> 2] | 0;
            w2(
              39448,
              ((x = i),
              (i = (i + 24) | 0),
              (c[x >> 2] = Z),
              (c[(x + 8) >> 2] = u),
              (c[(x + 16) >> 2] = ae),
              x) | 0
            );
            ae = c[(y + 4) >> 2] | 0;
            w2(
              39408,
              ((x = i),
              (i = (i + 16) | 0),
              (c[x >> 2] = c[y >> 2]),
              (c[(x + 8) >> 2] = ae),
              x) | 0
            );
            w2(39352, ((x = i), (i = (i + 8) | 0), (h[x >> 3] = ai), x) | 0);
            break;
          }
          if ((wM(g, 25080) | 0) != 0) {
            cQ(l);
            break;
          }
          if ((wM(g, 25016) | 0) != 0) {
            cR(n);
            break;
          }
          if ((wM(g, 24896) | 0) != 0) {
            cS(ah);
            break;
          }
          if ((wM(g, 24840) | 0) != 0) {
            cT(m);
            break;
          }
          if ((wM(g, 24784) | 0) != 0) {
            w3(23072);
            r6(c[ag >> 2] | 0, c[o >> 2] | 0);
            break;
          }
          if ((wM(g, 24672) | 0) != 0) {
            w3(23104);
            r6(c[k >> 2] | 0, c[o >> 2] | 0);
            break;
          }
          if ((wM(g, 24608) | 0) == 0) {
            if ((wM(g, 24192) | 0) != 0) {
              ae = c[s >> 2] | 0;
              w3(24192);
              qM(ae, w$() | 0);
              y = w_() | 0;
              if ((y | 0) == 0) {
                break;
              }
              qM(ae, y);
              break;
            }
            if ((wM(g, 24048) | 0) != 0) {
              y = c[K >> 2] | 0;
              w3(23592);
              c_(y);
              break;
            }
            if ((wM(g, 23952) | 0) == 0) {
              break L539;
            }
            y = c[af >> 2] | 0;
            w3(23712);
            ez(y);
            break;
          }
          if ((wS(g, t) | 0) == 0) {
            b[t >> 1] = 0;
            aj = 0;
          } else {
            y = b[t >> 1] | 0;
            if ((y & 65535) < 4) {
              aj = y;
            } else {
              break;
            }
          }
          y = c[(f + 3032 + ((aj & 65535) << 2)) >> 2] | 0;
          if ((y | 0) == 0) {
            break;
          }
          ae = (y + 48) | 0;
          u = c[(y + 688) >> 2] | 0;
          Z = ne(ae) | 0;
          p = nf(ae) | 0;
          ad = m1(ae) | 0;
          if ((ad | 0) == 3) {
            ak = 69;
          } else if ((ad | 0) == 1) {
            ak = 79;
          } else if ((ad | 0) == 5) {
            ak = 77;
          } else if ((ad | 0) == 7) {
            ak = 83;
          } else if ((ad | 0) == 0) {
            ak = 78;
          } else {
            ak = 63;
          }
          w3(23528);
          ad = m_(ae) | 0;
          q = m$(ae) | 0;
          w = m0(ae) | 0;
          r = m2(ae) | 0;
          B = m3(ae) | 0;
          ae = p & 255;
          p = d[(y + 588) | 0] | 0;
          v = Z & 255;
          Z = d[(y + 589) | 0] | 0;
          ac = d[(y + 596) | 0] | 0;
          ab = e[(y + 642) >> 1] | 0;
          _ = d[(y + 590) | 0] | 0;
          $ = d[(y + 591) | 0] | 0;
          aa = d[(y + 592) | 0] | 0;
          D = d[(y + 594) | 0] | 0;
          w2(
            23312,
            ((x = i),
            (i = (i + 184) | 0),
            (c[x >> 2] = u),
            (c[(x + 8) >> 2] = ad),
            (c[(x + 16) >> 2] = q),
            (c[(x + 24) >> 2] = ak),
            (c[(x + 32) >> 2] = w),
            (c[(x + 40) >> 2] = r),
            (c[(x + 48) >> 2] = B),
            (c[(x + 56) >> 2] = (ae >>> 5) & 1),
            (c[(x + 64) >> 2] = (ae >>> 4) & 1),
            (c[(x + 72) >> 2] = ae >>> 7),
            (c[(x + 80) >> 2] = (ae >>> 6) & 1),
            (c[(x + 88) >> 2] = p),
            (c[(x + 96) >> 2] = ((v & 32) | 0) != 0 ? 32 : 42),
            (c[(x + 104) >> 2] = Z),
            (c[(x + 112) >> 2] = ((v & 1) | 0) != 0 ? 42 : 32),
            (c[(x + 120) >> 2] = ac),
            (c[(x + 128) >> 2] = ab),
            (c[(x + 136) >> 2] = _),
            (c[(x + 144) >> 2] = $),
            (c[(x + 152) >> 2] = aa),
            (c[(x + 160) >> 2] = v),
            (c[(x + 168) >> 2] = D),
            (c[(x + 176) >> 2] = ae),
            x) | 0
          );
        } else {
          ae = c[s >> 2] | 0;
          w3(24192);
          qM(ae, w$() | 0);
          D = w_() | 0;
          if ((D | 0) != 0) {
            qM(ae, D);
          }
          cR(n);
          cQ(l);
          cS(ah);
          cT(m);
          D = c[C >> 2] | 0;
          w3(39672);
          ae = (D + 1216) | 0;
          v = c[ae >> 2] | 0;
          aa = c[(ae + 4) >> 2] | 0;
          $ = (D + 1208) | 0;
          _ = c[$ >> 2] | 0;
          ab = c[($ + 4) >> 2] | 0;
          if (((v | 0) == 0) & ((aa | 0) == 0)) {
            al = 0.0;
          } else {
            al =
              (+(_ >>> 0) + +(ab >>> 0) * 4294967296.0) /
              (+(v >>> 0) + +(aa >>> 0) * 4294967296.0);
          }
          aa = c[(D + 1200) >> 2] | 0;
          w2(
            39448,
            ((x = i),
            (i = (i + 24) | 0),
            (c[x >> 2] = _),
            (c[(x + 8) >> 2] = ab),
            (c[(x + 16) >> 2] = aa),
            x) | 0
          );
          aa = c[(ae + 4) >> 2] | 0;
          w2(
            39408,
            ((x = i),
            (i = (i + 16) | 0),
            (c[x >> 2] = c[ae >> 2]),
            (c[(x + 8) >> 2] = aa),
            x) | 0
          );
          w2(39352, ((x = i), (i = (i + 8) | 0), (h[x >> 3] = al), x) | 0);
          cF(c[C >> 2] | 0);
        }
      } while (0);
      if ((wL(g) | 0) != 0) {
        O = 0;
        V = 443;
        break;
      }
    }
    if ((V | 0) == 443) {
      i = j;
      return O | 0;
    }
    wK(g, 23776);
    O = 0;
    i = j;
    return O | 0;
  }
  function cK(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0;
    if (d >>> 0 > 65535) {
      e = -1;
      return e | 0;
    }
    f = d >>> 14;
    g = c[(b + 1032 + (f << 2)) >> 2] | 0;
    if ((g | 0) == 0) {
      e = -1;
      return e | 0;
    }
    e =
      a[
        ((c[(g + 8) >> 2] | 0) +
          ((c[(b + 1048 + (f << 2)) >> 2] << 14) | (d & 16383))) |
          0
      ] | 0;
    return e | 0;
  }
  function cL(a, b) {
    a = a | 0;
    b = b | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0;
    do {
      if (b >>> 0 > 65535) {
        e = 255;
      } else {
        f = b >>> 14;
        g = c[(a + 1032 + (f << 2)) >> 2] | 0;
        if ((g | 0) == 0) {
          e = 255;
          break;
        }
        e =
          d[
            ((c[(g + 8) >> 2] | 0) +
              ((c[(a + 1048 + (f << 2)) >> 2] << 14) | (b & 16383))) |
              0
          ] | 0;
      }
    } while (0);
    f = (b + 1) | 0;
    if (f >>> 0 > 65535) {
      h = -256;
      i = h | e;
      return i | 0;
    }
    b = f >>> 14;
    g = c[(a + 1032 + (b << 2)) >> 2] | 0;
    if ((g | 0) == 0) {
      h = -256;
      i = h | e;
      return i | 0;
    }
    h =
      (d[
        ((c[(g + 8) >> 2] | 0) +
          ((c[(a + 1048 + (b << 2)) >> 2] << 14) | (f & 16383))) |
          0
      ] |
        0) <<
      8;
    i = h | e;
    return i | 0;
  }
  function cM(a, b) {
    a = a | 0;
    b = b | 0;
    xx(b, 1336, 17) | 0;
    xy(b) | 0;
    b = a | 0;
    c[((c[b >> 2] | 0) + 108) >> 2] = 466;
    c[((c[b >> 2] | 0) + 104) >> 2] = 136;
    return;
  }
  function cN(d, f) {
    d = d | 0;
    f = f | 0;
    var g = 0,
      h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0;
    g = i;
    h = d;
    j = f & 255;
    c[(d + 3140) >> 2] = j | 256;
    if ((dd(h, j) | 0) != 0) {
      k = c[d >> 2] | 0;
      l = e[(k + 112) >> 1] | 0;
      m = e[(k + 4) >> 1] | 0;
      n = e[(k + 10) >> 1] | 0;
      o = e[(k + 6) >> 1] | 0;
      p = e[(k + 8) >> 1] | 0;
      q = e[(k + 26) >> 1] | 0;
      r = e[(k + 20) >> 1] | 0;
      w2(
        33232,
        ((x = i),
        (i = (i + 72) | 0),
        (c[x >> 2] = e[(k + 22) >> 1] | 0),
        (c[(x + 8) >> 2] = l),
        (c[(x + 16) >> 2] = j),
        (c[(x + 24) >> 2] = m),
        (c[(x + 32) >> 2] = n),
        (c[(x + 40) >> 2] = o),
        (c[(x + 48) >> 2] = p),
        (c[(x + 56) >> 2] = q),
        (c[(x + 64) >> 2] = r),
        x) | 0
      );
    }
    if ((((f << 24) >> 24) | 0) == 19) {
      r = (d + 12) | 0;
      q = c[r >> 2] | 0;
      if ((q | 0) == 0) {
        i = g;
        return;
      }
      p = c[d >> 2] | 0;
      if (((b[(p + 4) >> 1] & -256) << 16) >> 16 != 512) {
        i = g;
        return;
      }
      if ((b[(p + 8) >> 1] & 255) == 0) {
        i = g;
        return;
      }
      p = c[(d + 8) >> 2] | 0;
      ty(p, q) | 0;
      c[r >> 2] = 0;
      i = g;
      return;
    } else if ((((f << 24) >> 24) | 0) == 25) {
      do {
        if ((c[(d + 3076) >> 2] | 0) != 0) {
          f = (d + 12) | 0;
          if ((c[f >> 2] | 0) != 0) {
            break;
          }
          r = (d + 8) | 0;
          q = ts(c[r >> 2] | 0, 0) | 0;
          c[f >> 2] = q;
          f = c[r >> 2] | 0;
          tr(f, q) | 0;
        }
      } while (0);
      if ((a[(d + 3099) | 0] | 0) == 0) {
        i = g;
        return;
      }
      if ((a[(d + 3098) | 0] | 0) != 0) {
        i = g;
        return;
      }
      q = de(h) | 0;
      if ((q | 0) == 0) {
        i = g;
        return;
      }
      dP(32504, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = q), x) | 0);
      h = d;
      d = c[h >> 2] | 0;
      f = c[(d + 80) >> 2] & 100;
      r = f | 1;
      if (r >>> 0 < (c[(d + 76) >> 2] | 0) >>> 0) {
        p = (d + 72) | 0;
        a[((c[p >> 2] | 0) + f) | 0] = 16;
        a[((c[p >> 2] | 0) + r) | 0] = 0;
      } else {
        b5[c[(d + 48) >> 2] & 255](c[(d + 32) >> 2] | 0, f, 16);
      }
      f = c[h >> 2] | 0;
      h = q & 65535;
      d = c[(f + 80) >> 2] & 102;
      r = d | 1;
      if (r >>> 0 < (c[(f + 76) >> 2] | 0) >>> 0) {
        p = (f + 72) | 0;
        a[((c[p >> 2] | 0) + d) | 0] = q & 255;
        a[((c[p >> 2] | 0) + r) | 0] = ((h & 65535) >>> 8) & 255;
        i = g;
        return;
      } else {
        b5[c[(f + 48) >> 2] & 255](c[(f + 32) >> 2] | 0, d, h);
        i = g;
        return;
      }
    } else {
      i = g;
      return;
    }
  }
  function cO(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    var f = 0,
      g = 0,
      h = 0;
    f = i;
    g = c[a >> 2] | 0;
    h = e[(g + 28) >> 1] | 0;
    xt(
      3,
      33624,
      ((x = i),
      (i = (i + 32) | 0),
      (c[x >> 2] = e[(g + 22) >> 1] | 0),
      (c[(x + 8) >> 2] = h),
      (c[(x + 16) >> 2] = b & 255),
      (c[(x + 24) >> 2] = d & 255),
      x) | 0
    );
    xU(1e5) | 0;
    zt(c[(a + 3028) >> 2] | 0);
    i = f;
    return;
  }
  function cP(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0;
    f = i;
    a1(
      b | 0,
      26432,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[(e + 16) | 0] | 0), x) | 0
    ) | 0;
    g = (e + 12) | 0;
    h = (b + 2) | 0;
    if ((c[g >> 2] | 0) >>> 0 > 1) {
      j = 1;
      k = 2;
      l = h;
      while (1) {
        a1(
          l | 0,
          26280,
          ((x = i),
          (i = (i + 8) | 0),
          (c[x >> 2] = d[(e + 16 + j) | 0] | 0),
          x) | 0
        ) | 0;
        m = (k + 3) | 0;
        n = (j + 1) | 0;
        o = (b + m) | 0;
        if (n >>> 0 < (c[g >> 2] | 0) >>> 0) {
          j = n;
          k = m;
          l = o;
        } else {
          break;
        }
      }
      a[o] = 32;
      o = (k + 4) | 0;
      if (o >>> 0 < 20) {
        p = m;
        q = o;
        r = 503;
      } else {
        s = m;
        t = o;
      }
    } else {
      a[h] = 32;
      p = 2;
      q = 3;
      r = 503;
    }
    if ((r | 0) == 503) {
      zP((b + q) | 0, 32, (19 - p) | 0);
      s = 19;
      t = 20;
    }
    p = e | 0;
    q = c[p >> 2] | 0;
    if (((q & -769) | 0) == 0) {
      u = t;
    } else {
      r = (s + 2) | 0;
      a[(b + t) | 0] = 91;
      if (((q & 1) | 0) == 0) {
        v = q;
        w = r;
      } else {
        t = (b + r) | 0;
        y = 3553329;
        a[t] = y & 255;
        y = y >> 8;
        a[(t + 1) | 0] = y & 255;
        y = y >> 8;
        a[(t + 2) | 0] = y & 255;
        y = y >> 8;
        a[(t + 3) | 0] = y & 255;
        v = q & -2;
        w = (s + 5) | 0;
      }
      if ((v | 0) == 0) {
        z = w;
      } else {
        if ((v | 0) == (c[p >> 2] | 0)) {
          A = w;
        } else {
          a[(b + w) | 0] = 32;
          A = (w + 1) | 0;
        }
        z =
          ((a1(
            (b + A) | 0,
            26120,
            ((x = i), (i = (i + 8) | 0), (c[x >> 2] = v), x) | 0
          ) |
            0) +
            A) |
          0;
      }
      a[(b + z) | 0] = 93;
      a[(b + (z + 1)) | 0] = 32;
      u = (z + 2) | 0;
    }
    zQ((b + u) | 0, (e + 32) | 0) | 0;
    z = u;
    A = 0;
    while (1) {
      B = (b + z) | 0;
      C = (z + 1) | 0;
      if ((a[B] | 0) == 0) {
        break;
      } else {
        z = C;
        A = (A + 1) | 0;
      }
    }
    v = (e + 96) | 0;
    if ((c[v >> 2] | 0) == 0) {
      D = z;
      E = (b + D) | 0;
      a[E] = 0;
      i = f;
      return;
    }
    a[B] = 32;
    if (C >>> 0 < 26) {
      zP((b + (u + 1 + A)) | 0, 32, (25 - u - A) | 0);
      F = 26;
    } else {
      F = C;
    }
    C = c[v >> 2] | 0;
    if ((C | 0) == 1) {
      v = (b + F) | 0;
      A = (e + 100) | 0;
      u = zN(A | 0) | 0;
      B = (u + 1) | 0;
      zO(v | 0, A | 0, B) | 0;
      D = (u + F) | 0;
      E = (b + D) | 0;
      a[E] = 0;
      i = f;
      return;
    } else if ((C | 0) == 2) {
      D =
        ((a1(
          (b + F) | 0,
          25832,
          ((x = i),
          (i = (i + 16) | 0),
          (c[x >> 2] = e + 100),
          (c[(x + 8) >> 2] = e + 164),
          x) | 0
        ) |
          0) +
          F) |
        0;
      E = (b + D) | 0;
      a[E] = 0;
      i = f;
      return;
    } else {
      D = F;
      E = (b + D) | 0;
      a[E] = 0;
      i = f;
      return;
    }
  }
  function cQ(a) {
    a = a | 0;
    var b = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0;
    b = i;
    w3(41152);
    f = 0;
    do {
      g = d[(a + ((f * 28) | 0) + 7) | 0] | 0;
      h = d[(a + ((f * 28) | 0) + 9) | 0] | 0;
      j = d[(a + ((f * 28) | 0) + 8) | 0] | 0;
      k = e[(a + ((f * 28) | 0) + 26) >> 1] | 0;
      l = d[(a + ((f * 28) | 0) + 2) | 0] | 0;
      m = d[(a + ((f * 28) | 0) + 1) | 0] | 0;
      n = d[(a + ((f * 28) | 0)) | 0] | 0;
      o = d[(a + ((f * 28) | 0) + 5) | 0] | 0;
      p = d[(a + ((f * 28) | 0) + 4) | 0] | 0;
      q = d[(a + ((f * 28) | 0) + 3) | 0] | 0;
      r = d[(a + ((f * 28) | 0) + 12) | 0] | 0;
      s = d[(a + ((f * 28) | 0) + 24) | 0] | 0;
      t = d[(a + ((f * 28) | 0) + 11) | 0] | 0;
      w2(
        40984,
        ((x = i),
        (i = (i + 128) | 0),
        (c[x >> 2] = f),
        (c[(x + 8) >> 2] = g),
        (c[(x + 16) >> 2] = h),
        (c[(x + 24) >> 2] = j),
        (c[(x + 32) >> 2] = k),
        (c[(x + 40) >> 2] = ((l & 2) | 0) != 0 ? 40928 : 40896),
        (c[(x + 48) >> 2] = m),
        (c[(x + 56) >> 2] = ((l & 1) | 0) != 0 ? 40792 : 40672),
        (c[(x + 64) >> 2] = n),
        (c[(x + 72) >> 2] = ((o & 2) | 0) != 0 ? 40416 : 40224),
        (c[(x + 80) >> 2] = p),
        (c[(x + 88) >> 2] = ((o & 1) | 0) != 0 ? 40096 : 39880),
        (c[(x + 96) >> 2] = q),
        (c[(x + 104) >> 2] = r),
        (c[(x + 112) >> 2] = s),
        (c[(x + 120) >> 2] = t),
        x) | 0
      );
      f = (f + 1) | 0;
    } while (f >>> 0 < 3);
    i = b;
    return;
  }
  function cR(b) {
    b = b | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0;
    e = i;
    w3(21072);
    f = d[b | 0] | 0;
    g = d[(b + 1) | 0] | 0;
    w2(
      20960,
      ((x = i),
      (i = (i + 24) | 0),
      (c[x >> 2] = d[(b + 2) | 0] | 0),
      (c[(x + 8) >> 2] = f),
      (c[(x + 16) >> 2] = g),
      x) | 0
    );
    if ((a[(b + 6) | 0] | 0) == 0) {
      g = (nw(b, 0) | 0) & 255;
      w2(20800, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = g), x) | 0);
    } else {
      g = (nI(b, 0) | 0) & 255;
      w2(20864, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = g), x) | 0);
    }
    if ((a[(b + 26) | 0] | 0) == 0) {
      g = (nw(b, 1) | 0) & 255;
      w2(41784, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = g), x) | 0);
    } else {
      g = (nI(b, 1) | 0) & 255;
      w2(41840, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = g), x) | 0);
    }
    g = d[(b + 46) | 0] | 0;
    if ((g | 0) == 240) {
      f = ((nI(b, 2) | 0) & 255) >>> 4;
      h = (nw(b, 2) | 0) & 15;
      w2(
        41200,
        ((x = i),
        (i = (i + 16) | 0),
        (c[x >> 2] = f),
        (c[(x + 8) >> 2] = h),
        x) | 0
      );
      w1(22064);
      i = e;
      return;
    } else if ((g | 0) == 255) {
      h = (nI(b, 2) | 0) & 255;
      w2(41520, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = h), x) | 0);
      w1(22064);
      i = e;
      return;
    } else if ((g | 0) == 0) {
      h = (nw(b, 2) | 0) & 255;
      w2(41416, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = h), x) | 0);
      w1(22064);
      i = e;
      return;
    } else if ((g | 0) == 15) {
      g = ((nw(b, 2) | 0) & 255) >>> 4;
      h = (nI(b, 2) | 0) & 15;
      w2(
        41360,
        ((x = i),
        (i = (i + 16) | 0),
        (c[x >> 2] = g),
        (c[(x + 8) >> 2] = h),
        x) | 0
      );
      w1(22064);
      i = e;
      return;
    } else {
      w1(22064);
      i = e;
      return;
    }
  }
  function cS(b) {
    b = b | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0;
    d = i;
    i = (i + 16) | 0;
    e = d | 0;
    w3(22232);
    w1(22144);
    f = a[(b + 10) | 0] | 0;
    g = e | 0;
    a[g] = ((f & 255) >>> 7) | 48;
    h = (e + 1) | 0;
    a[h] = (((f & 255) >>> 6) & 1) | 48;
    j = (e + 2) | 0;
    a[j] = (((f & 255) >>> 5) & 1) | 48;
    k = (e + 3) | 0;
    a[k] = (((f & 255) >>> 4) & 1) | 48;
    l = (e + 4) | 0;
    a[l] = (((f & 255) >>> 3) & 1) | 48;
    m = (e + 5) | 0;
    a[m] = (((f & 255) >>> 2) & 1) | 48;
    n = (e + 6) | 0;
    a[n] = (((f & 255) >>> 1) & 1) | 48;
    o = (e + 7) | 0;
    a[o] = (f & 1) | 48;
    f = (e + 8) | 0;
    a[f] = 0;
    w1(g);
    w1(22064);
    w1(22024);
    e = nO(b) | 0;
    a[g] = ((e & 255) >>> 7) | 48;
    a[h] = (((e & 255) >>> 6) & 1) | 48;
    a[j] = (((e & 255) >>> 5) & 1) | 48;
    a[k] = (((e & 255) >>> 4) & 1) | 48;
    a[l] = (((e & 255) >>> 3) & 1) | 48;
    a[m] = (((e & 255) >>> 2) & 1) | 48;
    a[n] = (((e & 255) >>> 1) & 1) | 48;
    a[o] = (e & 1) | 48;
    a[f] = 0;
    w1(g);
    w2(
      21960,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = c[(b + 24) >> 2]), x) | 0
    );
    w1(21816);
    e = nP(b) | 0;
    a[g] = ((e & 255) >>> 7) | 48;
    a[h] = (((e & 255) >>> 6) & 1) | 48;
    a[j] = (((e & 255) >>> 5) & 1) | 48;
    a[k] = (((e & 255) >>> 4) & 1) | 48;
    a[l] = (((e & 255) >>> 3) & 1) | 48;
    a[m] = (((e & 255) >>> 2) & 1) | 48;
    a[n] = (((e & 255) >>> 1) & 1) | 48;
    a[o] = (e & 1) | 48;
    a[f] = 0;
    w1(g);
    w2(
      21760,
      ((x = i),
      (i = (i + 8) | 0),
      (c[x >> 2] = (a[(b + 72) | 0] | 0) != 0),
      x) | 0
    );
    w1(21416);
    e = nQ(b) | 0;
    a[g] = ((e & 255) >>> 7) | 48;
    a[h] = (((e & 255) >>> 6) & 1) | 48;
    a[j] = (((e & 255) >>> 5) & 1) | 48;
    a[k] = (((e & 255) >>> 4) & 1) | 48;
    a[l] = (((e & 255) >>> 3) & 1) | 48;
    a[m] = (((e & 255) >>> 2) & 1) | 48;
    a[n] = (((e & 255) >>> 1) & 1) | 48;
    a[o] = (e & 1) | 48;
    a[f] = 0;
    w1(g);
    w1(22064);
    g = (nR(b, 0) | 0) & 255;
    f = (nR(b, 1) | 0) & 255;
    e = (nR(b, 2) | 0) & 255;
    o = (nR(b, 3) | 0) & 255;
    n = (nS(b, 0) | 0) & 255;
    m = (nS(b, 1) | 0) & 255;
    l = (nS(b, 2) | 0) & 255;
    w2(
      21280,
      ((x = i),
      (i = (i + 56) | 0),
      (c[x >> 2] = g),
      (c[(x + 8) >> 2] = f),
      (c[(x + 16) >> 2] = e),
      (c[(x + 24) >> 2] = o),
      (c[(x + 32) >> 2] = n),
      (c[(x + 40) >> 2] = m),
      (c[(x + 48) >> 2] = l),
      x) | 0
    );
    w2(
      21216,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = c[(b + 32) >> 2]), x) | 0
    );
    l = c[(b + 36) >> 2] | 0;
    w2(
      21136,
      ((x = i), (i = (i + 16) | 0), (c[x >> 2] = 1), (c[(x + 8) >> 2] = l), x) |
        0
    );
    l = c[(b + 40) >> 2] | 0;
    w2(
      21136,
      ((x = i), (i = (i + 16) | 0), (c[x >> 2] = 2), (c[(x + 8) >> 2] = l), x) |
        0
    );
    l = c[(b + 44) >> 2] | 0;
    w2(
      21136,
      ((x = i), (i = (i + 16) | 0), (c[x >> 2] = 3), (c[(x + 8) >> 2] = l), x) |
        0
    );
    l = c[(b + 48) >> 2] | 0;
    w2(
      21136,
      ((x = i), (i = (i + 16) | 0), (c[x >> 2] = 4), (c[(x + 8) >> 2] = l), x) |
        0
    );
    l = c[(b + 52) >> 2] | 0;
    w2(
      21136,
      ((x = i), (i = (i + 16) | 0), (c[x >> 2] = 5), (c[(x + 8) >> 2] = l), x) |
        0
    );
    l = c[(b + 56) >> 2] | 0;
    w2(
      21136,
      ((x = i), (i = (i + 16) | 0), (c[x >> 2] = 6), (c[(x + 8) >> 2] = l), x) |
        0
    );
    l = c[(b + 60) >> 2] | 0;
    w2(
      21136,
      ((x = i), (i = (i + 16) | 0), (c[x >> 2] = 7), (c[(x + 8) >> 2] = l), x) |
        0
    );
    w1(22064);
    i = d;
    return;
  }
  function cT(b) {
    b = b | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0;
    d = i;
    w3(22592);
    e = (mn(b) | 0) & 255;
    f = (mo(b) | 0) & 255;
    g = ((a[(b + 288) | 0] | 0) != 0) | 0;
    w2(
      22472,
      ((x = i),
      (i = (i + 24) | 0),
      (c[x >> 2] = e),
      (c[(x + 8) >> 2] = f),
      (c[(x + 16) >> 2] = g),
      x) | 0
    );
    g = 0;
    do {
      f = mq(b, g) | 0;
      e = (mp(b, g) | 0) & 252;
      h = (mr(b, g) | 0) & 65535;
      j = (ms(b, g) | 0) & 65535;
      k = (mt(b, g) | 0) & 65535;
      l = (mu(b, g) | 0) & 65535;
      m = f & 65535;
      w2(
        22360,
        ((x = i),
        (i = (i + 72) | 0),
        (c[x >> 2] = g),
        (c[(x + 8) >> 2] = e),
        (c[(x + 16) >> 2] = h),
        (c[(x + 24) >> 2] = j),
        (c[(x + 32) >> 2] = k),
        (c[(x + 40) >> 2] = l),
        (c[(x + 48) >> 2] = m & 1),
        (c[(x + 56) >> 2] = (m >>> 1) & 1),
        (c[(x + 64) >> 2] = (m >>> 4) & 1),
        x) | 0
      );
      g = (g + 1) | 0;
    } while (g >>> 0 < 4);
    i = d;
    return;
  }
  function cU(d) {
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0;
    e = i;
    i = (i + 16) | 0;
    f = e | 0;
    g = (e + 8) | 0;
    if ((yi(d, 26200, f, 0) | 0) == 0) {
      h = c[f >> 2] << 10;
      c[f >> 2] = h;
      j = h;
    } else {
      yi(d, 34856, f, 0) | 0;
      j = c[f >> 2] | 0;
    }
    c[f >> 2] = ((j + 16383) | 0) >>> 14;
    yj(d, 31768, g, 57344) | 0;
    d = zH(1068) | 0;
    j = d;
    if ((d | 0) == 0) {
      k = 0;
      i = e;
      return k | 0;
    }
    zP(d | 0, 0, 1024);
    h = zH(48) | 0;
    l = h;
    do {
      if ((h | 0) == 0) {
        m = 0;
      } else {
        b[h >> 1] = 0;
        c[(h + 4) >> 2] = 4;
        n = zH(65536) | 0;
        c[(h + 8) >> 2] = n;
        if ((n | 0) == 0) {
          zI(h);
          m = 0;
          break;
        } else {
          c[(h + 12) >> 2] = 0;
          n = (h + 40) | 0;
          o = n | 0;
          y = 0;
          a[o] = y & 255;
          y = y >> 8;
          a[(o + 1) | 0] = y & 255;
          y = y >> 8;
          a[(o + 2) | 0] = y & 255;
          y = y >> 8;
          a[(o + 3) | 0] = y & 255;
          o = (n + 4) | 0;
          y = 0;
          a[o] = y & 255;
          y = y >> 8;
          a[(o + 1) | 0] = y & 255;
          y = y >> 8;
          a[(o + 2) | 0] = y & 255;
          y = y >> 8;
          a[(o + 3) | 0] = y & 255;
          m = l;
          break;
        }
      }
    } while (0);
    c[d >> 2] = m;
    m = (d + 1024) | 0;
    c[m >> 2] = c[f >> 2];
    c[(d + 1028) >> 2] = 0;
    c[(d + 1032) >> 2] = 0;
    c[(d + 1048) >> 2] = 0;
    c[(d + 1036) >> 2] = 0;
    c[(d + 1052) >> 2] = 0;
    c[(d + 1040) >> 2] = 0;
    c[(d + 1056) >> 2] = 0;
    c[(d + 1044) >> 2] = 0;
    c[(d + 1060) >> 2] = 0;
    l = r0(c[g >> 2] << 4, 65536, 0) | 0;
    c[(d + 1064) >> 2] = l;
    rJ(l, d, 106, 14, 0, 14, 90, 0);
    d = c[m >> 2] | 0;
    m = c[g >> 2] | 0;
    xv(
      2,
      29840,
      27936,
      ((x = i),
      (i = (i + 24) | 0),
      (c[x >> 2] = c[f >> 2] << 4),
      (c[(x + 8) >> 2] = d),
      (c[(x + 16) >> 2] = m),
      x) | 0
    );
    k = j;
    i = e;
    return k | 0;
  }
  function cV(b, d, e) {
    b = b | 0;
    d = d | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    if (d >>> 0 > 65535) {
      return;
    }
    f = d >>> 14;
    g = c[(b + 1032 + (f << 2)) >> 2] | 0;
    if ((g | 0) == 0) {
      return;
    }
    a[
      ((c[(g + 8) >> 2] | 0) +
        ((c[(b + 1048 + (f << 2)) >> 2] << 14) | (d & 16383))) |
        0
    ] = e;
    return;
  }
  function cW(b, d, e) {
    b = b | 0;
    d = d | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0;
    f = e & 255;
    do {
      if (d >>> 0 <= 65535) {
        g = d >>> 14;
        h = c[(b + 1032 + (g << 2)) >> 2] | 0;
        if ((h | 0) == 0) {
          break;
        }
        a[
          ((c[(h + 8) >> 2] | 0) +
            ((c[(b + 1048 + (g << 2)) >> 2] << 14) | (d & 16383))) |
            0
        ] = f;
      }
    } while (0);
    f = (d + 1) | 0;
    if (f >>> 0 > 65535) {
      return;
    }
    d = f >>> 14;
    g = c[(b + 1032 + (d << 2)) >> 2] | 0;
    if ((g | 0) == 0) {
      return;
    }
    a[
      ((c[(g + 8) >> 2] | 0) +
        ((c[(b + 1048 + (d << 2)) >> 2] << 14) | (f & 16383))) |
        0
    ] = ((e & 65535) >>> 8) & 255;
    return;
  }
  function cX(a) {
    a = a | 0;
    return c[(a + 1064) >> 2] | 0;
  }
  function cY(a, d) {
    a = a | 0;
    d = d | 0;
    var e = 0;
    e = (d + 4) | 0;
    if ((a | 0) == 0) {
      b[e >> 1] = 0;
      b[(d + 8) >> 1] = 0;
      return;
    } else {
      b[e >> 1] = 1;
      b[(d + 8) >> 1] = (c[(a + 1024) >> 2] << 4) & 65535;
      return;
    }
  }
  function cZ(a) {
    a = a | 0;
    var b = 0,
      d = 0,
      e = 0,
      f = 0;
    b = i;
    dP(
      26336,
      ((x = i),
      (i = (i + 1) | 0),
      (i = ((i + 7) >> 3) << 3),
      (c[x >> 2] = 0),
      x) | 0
    );
    d = 1;
    do {
      e = (a + (d << 2)) | 0;
      f = c[e >> 2] | 0;
      if ((f | 0) != 0) {
        zI(c[(f + 8) >> 2] | 0);
        zI(f);
      }
      c[e >> 2] = 0;
      d = (d + 1) | 0;
    } while (d >>> 0 < 256);
    zP((a + 1028) | 0, 0, 36);
    i = b;
    return;
  }
  function c_(a) {
    a = a | 0;
    var b = 0,
      d = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0;
    b = i;
    d = 1;
    f = 0;
    do {
      f = (((c[(a + (d << 2)) >> 2] | 0) != 0) + f) | 0;
      d = (d + 1) | 0;
    } while (d >>> 0 < 255);
    d = c[(a + 1028) >> 2] | 0;
    g = c[(a + 1024) >> 2] | 0;
    w2(
      24920,
      ((x = i),
      (i = (i + 40) | 0),
      (c[x >> 2] = d),
      (c[(x + 8) >> 2] = g),
      (c[(x + 16) >> 2] = d << 4),
      (c[(x + 24) >> 2] = g << 4),
      (c[(x + 32) >> 2] = f),
      x) | 0
    );
    f = c[(a + 1032) >> 2] | 0;
    if ((f | 0) == 0) {
      h = 4095;
    } else {
      h = e[f >> 1] | 0;
    }
    f = c[(a + 1048) >> 2] | 0;
    g = c[(a + 1036) >> 2] | 0;
    if ((g | 0) == 0) {
      j = 4095;
    } else {
      j = e[g >> 1] | 0;
    }
    g = c[(a + 1052) >> 2] | 0;
    d = c[(a + 1040) >> 2] | 0;
    if ((d | 0) == 0) {
      k = 4095;
    } else {
      k = e[d >> 1] | 0;
    }
    d = c[(a + 1056) >> 2] | 0;
    l = c[(a + 1044) >> 2] | 0;
    if ((l | 0) == 0) {
      m = 4095;
    } else {
      m = e[l >> 1] | 0;
    }
    l = c[(a + 1060) >> 2] | 0;
    w2(
      23608,
      ((x = i),
      (i = (i + 64) | 0),
      (c[x >> 2] = h),
      (c[(x + 8) >> 2] = f),
      (c[(x + 16) >> 2] = j),
      (c[(x + 24) >> 2] = g),
      (c[(x + 32) >> 2] = k),
      (c[(x + 40) >> 2] = d),
      (c[(x + 48) >> 2] = m),
      (c[(x + 56) >> 2] = l),
      x) | 0
    );
    l = 0;
    do {
      m = c[(a + (l << 2)) >> 2] | 0;
      if ((m | 0) != 0) {
        d = c[(m + 4) >> 2] | 0;
        w2(
          22072,
          ((x = i),
          (i = (i + 16) | 0),
          (c[x >> 2] = l),
          (c[(x + 8) >> 2] = d),
          x) | 0
        );
      }
      l = (l + 1) | 0;
    } while (l >>> 0 < 256);
    i = b;
    return;
  }
  function c$(f, g) {
    f = f | 0;
    g = g | 0;
    var h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0,
      H = 0,
      I = 0,
      J = 0,
      K = 0,
      L = 0,
      M = 0,
      N = 0,
      O = 0,
      P = 0,
      Q = 0,
      R = 0,
      S = 0,
      T = 0,
      U = 0,
      V = 0,
      W = 0,
      X = 0,
      Y = 0;
    h = i;
    if ((f | 0) == 0) {
      i = h;
      return;
    }
    j = (g + 4) | 0;
    k = b[j >> 1] | 0;
    l = k & 65535;
    m = l >>> 8;
    if ((m | 0) == 64) {
      b[j >> 1] = k & 255;
      i = h;
      return;
    } else if ((m | 0) == 78) {
      n = l & 255;
      if ((n | 0) == 2) {
        o = (e[(g + 20) >> 1] | 0) << 4;
        p = (g + 80) | 0;
        q = (g + 76) | 0;
        r = (g + 72) | 0;
        s = (g + 48) | 0;
        t = (g + 32) | 0;
        u = e[(g + 18) >> 1] | 0;
        v = 0;
        while (1) {
          w = c[(f + 1032 + (v << 2)) >> 2] | 0;
          if ((w | 0) == 0) {
            z = -1;
            A = 0;
          } else {
            z = c[(f + 1048 + (v << 2)) >> 2] & 65535;
            A = b[w >> 1] | 0;
          }
          w = c[p >> 2] & ((u & 65535) + o);
          B = (w + 1) | 0;
          if (B >>> 0 < (c[q >> 2] | 0) >>> 0) {
            a[((c[r >> 2] | 0) + w) | 0] = A & 255;
            a[((c[r >> 2] | 0) + B) | 0] = ((A & 65535) >>> 8) & 255;
          } else {
            b5[c[s >> 2] & 255](c[t >> 2] | 0, w, A);
          }
          w = c[p >> 2] & (((u + 2) & 65535) + o);
          B = (w + 1) | 0;
          if (B >>> 0 < (c[q >> 2] | 0) >>> 0) {
            a[((c[r >> 2] | 0) + w) | 0] = z & 255;
            a[((c[r >> 2] | 0) + B) | 0] = ((z & 65535) >>> 8) & 255;
          } else {
            b5[c[s >> 2] & 255](c[t >> 2] | 0, w, z);
          }
          w = (v + 1) | 0;
          if (w >>> 0 < 4) {
            u = (u + 4) | 0;
            v = w;
          } else {
            break;
          }
        }
        v = (g + 4) | 0;
        u = (e[(g + 26) >> 1] | 0) << 4;
        z = (g + 44) | 0;
        s = e[(g + 16) >> 1] | 0;
        o = 0;
        while (1) {
          A = c[p >> 2] | 0;
          w = ((s & 65535) + u) & A;
          B = (w + 1) | 0;
          C = c[q >> 2] | 0;
          if (B >>> 0 < C >>> 0) {
            D = c[r >> 2] | 0;
            E = ((d[(D + B) | 0] | 0) << 8) | (d[(D + w) | 0] | 0);
            F = A;
            G = C;
          } else {
            C = b8[c[z >> 2] & 255](c[t >> 2] | 0, w) | 0;
            E = C;
            F = c[p >> 2] | 0;
            G = c[q >> 2] | 0;
          }
          C = F & (((s + 2) & 65535) + u);
          w = (C + 1) | 0;
          if (w >>> 0 < G >>> 0) {
            A = c[r >> 2] | 0;
            H = ((d[(A + w) | 0] | 0) << 8) | (d[(A + C) | 0] | 0);
          } else {
            H = b8[c[z >> 2] & 255](c[t >> 2] | 0, C) | 0;
          }
          C = H & 65535;
          A = (f + 1032 + (o << 2)) | 0;
          c[A >> 2] = 0;
          w = (f + 1048 + (o << 2)) | 0;
          c[w >> 2] = 0;
          D = E & 65535;
          if (!(((E << 16) >> 16 == 0) | ((H << 16) >> 16 == -1))) {
            if ((E & 65535) > 255) {
              I = 754;
              break;
            }
            B = c[(f + (D << 2)) >> 2] | 0;
            if ((B | 0) == 0) {
              I = 754;
              break;
            }
            if ((c[(B + 4) >> 2] | 0) >>> 0 <= C >>> 0) {
              I = 754;
              break;
            }
            c[A >> 2] = B;
            c[w >> 2] = C;
          }
          C = (o + 1) | 0;
          if (C >>> 0 < 4) {
            s = (s + 4) | 0;
            o = C;
          } else {
            I = 756;
            break;
          }
        }
        if ((I | 0) == 754) {
          o = v | 0;
          b[o >> 1] = (b[o >> 1] & 255) | -23808;
          i = h;
          return;
        } else if ((I | 0) == 756) {
          o = v | 0;
          b[o >> 1] = b[o >> 1] & 255;
          i = h;
          return;
        }
      } else if ((n | 0) == 0) {
        o = (e[(g + 20) >> 1] | 0) << 4;
        v = (g + 80) | 0;
        s = (g + 76) | 0;
        E = (g + 72) | 0;
        H = (g + 48) | 0;
        t = (g + 32) | 0;
        z = e[(g + 18) >> 1] | 0;
        r = 0;
        while (1) {
          G = c[(f + 1032 + (r << 2)) >> 2] | 0;
          if ((G | 0) == 0) {
            J = -1;
            K = 0;
          } else {
            J = c[(f + 1048 + (r << 2)) >> 2] & 65535;
            K = b[G >> 1] | 0;
          }
          G = c[v >> 2] & ((z & 65535) + o);
          u = (G + 1) | 0;
          if (u >>> 0 < (c[s >> 2] | 0) >>> 0) {
            a[((c[E >> 2] | 0) + G) | 0] = K & 255;
            a[((c[E >> 2] | 0) + u) | 0] = ((K & 65535) >>> 8) & 255;
          } else {
            b5[c[H >> 2] & 255](c[t >> 2] | 0, G, K);
          }
          G = c[v >> 2] & (((z + 2) & 65535) + o);
          u = (G + 1) | 0;
          if (u >>> 0 < (c[s >> 2] | 0) >>> 0) {
            a[((c[E >> 2] | 0) + G) | 0] = J & 255;
            a[((c[E >> 2] | 0) + u) | 0] = ((J & 65535) >>> 8) & 255;
          } else {
            b5[c[H >> 2] & 255](c[t >> 2] | 0, G, J);
          }
          G = (r + 1) | 0;
          if (G >>> 0 < 4) {
            z = (z + 4) | 0;
            r = G;
          } else {
            break;
          }
        }
        b[j >> 1] = b[j >> 1] & 255;
        i = h;
        return;
      } else if ((n | 0) == 3) {
        b[j >> 1] = 16;
        i = h;
        return;
      } else if ((n | 0) == 1) {
        n = (g + 4) | 0;
        r = (e[(g + 26) >> 1] | 0) << 4;
        z = (g + 80) | 0;
        J = (g + 76) | 0;
        t = (g + 72) | 0;
        H = (g + 44) | 0;
        E = (g + 32) | 0;
        s = e[(g + 16) >> 1] | 0;
        o = 0;
        while (1) {
          v = c[z >> 2] | 0;
          K = ((s & 65535) + r) & v;
          G = (K + 1) | 0;
          u = c[J >> 2] | 0;
          if (G >>> 0 < u >>> 0) {
            F = c[t >> 2] | 0;
            L = ((d[(F + G) | 0] | 0) << 8) | (d[(F + K) | 0] | 0);
            M = v;
            N = u;
          } else {
            u = b8[c[H >> 2] & 255](c[E >> 2] | 0, K) | 0;
            L = u;
            M = c[z >> 2] | 0;
            N = c[J >> 2] | 0;
          }
          u = M & (((s + 2) & 65535) + r);
          K = (u + 1) | 0;
          if (K >>> 0 < N >>> 0) {
            v = c[t >> 2] | 0;
            O = ((d[(v + K) | 0] | 0) << 8) | (d[(v + u) | 0] | 0);
          } else {
            O = b8[c[H >> 2] & 255](c[E >> 2] | 0, u) | 0;
          }
          u = O & 65535;
          v = (f + 1032 + (o << 2)) | 0;
          c[v >> 2] = 0;
          K = (f + 1048 + (o << 2)) | 0;
          c[K >> 2] = 0;
          F = L & 65535;
          if (!(((L << 16) >> 16 == 0) | ((O << 16) >> 16 == -1))) {
            if ((L & 65535) > 255) {
              I = 729;
              break;
            }
            G = c[(f + (F << 2)) >> 2] | 0;
            if ((G | 0) == 0) {
              I = 729;
              break;
            }
            if ((c[(G + 4) >> 2] | 0) >>> 0 <= u >>> 0) {
              I = 729;
              break;
            }
            c[v >> 2] = G;
            c[K >> 2] = u;
          }
          u = (o + 1) | 0;
          if (u >>> 0 < 4) {
            s = (s + 4) | 0;
            o = u;
          } else {
            I = 731;
            break;
          }
        }
        if ((I | 0) == 729) {
          o = n | 0;
          b[o >> 1] = (b[o >> 1] & 255) | -23808;
          i = h;
          return;
        } else if ((I | 0) == 731) {
          o = n | 0;
          b[o >> 1] = b[o >> 1] & 255;
          i = h;
          return;
        }
      } else {
        xt(1, 41072, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = l), x) | 0);
        b[j >> 1] = (b[j >> 1] & 255) | -28928;
        i = h;
        return;
      }
    } else if ((m | 0) == 72) {
      o = (g + 4) | 0;
      n = b[(g + 8) >> 1] | 0;
      do {
        if ((n & 65535) <= 255) {
          s = c[(f + ((n & 65535) << 2)) >> 2] | 0;
          if ((s | 0) == 0) {
            break;
          }
          L = (s + 12) | 0;
          if ((c[L >> 2] | 0) == 0) {
            b[o >> 1] = (k & 255) | -29184;
            i = h;
            return;
          }
          O = b[(s + 16) >> 1] | 0;
          E = c[(s + 24) >> 2] | 0;
          H = (f + 1032) | 0;
          c[H >> 2] = 0;
          t = (f + 1048) | 0;
          c[t >> 2] = 0;
          do {
            if (
              !(
                ((O << 16) >> 16 == 0) |
                ((E | 0) == 65535) |
                ((O & 65535) > 255)
              )
            ) {
              N = c[(f + ((O & 65535) << 2)) >> 2] | 0;
              if ((N | 0) == 0) {
                break;
              }
              if ((c[(N + 4) >> 2] | 0) >>> 0 <= E >>> 0) {
                break;
              }
              c[H >> 2] = N;
              c[t >> 2] = E;
            }
          } while (0);
          E = b[(s + 18) >> 1] | 0;
          t = c[(s + 28) >> 2] | 0;
          H = (f + 1036) | 0;
          c[H >> 2] = 0;
          O = (f + 1052) | 0;
          c[O >> 2] = 0;
          do {
            if (
              !(
                ((E << 16) >> 16 == 0) |
                ((t | 0) == 65535) |
                ((E & 65535) > 255)
              )
            ) {
              N = c[(f + ((E & 65535) << 2)) >> 2] | 0;
              if ((N | 0) == 0) {
                break;
              }
              if ((c[(N + 4) >> 2] | 0) >>> 0 <= t >>> 0) {
                break;
              }
              c[H >> 2] = N;
              c[O >> 2] = t;
            }
          } while (0);
          t = b[(s + 20) >> 1] | 0;
          O = c[(s + 32) >> 2] | 0;
          H = (f + 1040) | 0;
          c[H >> 2] = 0;
          E = (f + 1056) | 0;
          c[E >> 2] = 0;
          do {
            if (
              !(
                ((t << 16) >> 16 == 0) |
                ((O | 0) == 65535) |
                ((t & 65535) > 255)
              )
            ) {
              N = c[(f + ((t & 65535) << 2)) >> 2] | 0;
              if ((N | 0) == 0) {
                break;
              }
              if ((c[(N + 4) >> 2] | 0) >>> 0 <= O >>> 0) {
                break;
              }
              c[H >> 2] = N;
              c[E >> 2] = O;
            }
          } while (0);
          O = b[(s + 22) >> 1] | 0;
          E = c[(s + 36) >> 2] | 0;
          H = (f + 1044) | 0;
          c[H >> 2] = 0;
          t = (f + 1060) | 0;
          c[t >> 2] = 0;
          do {
            if (
              !(
                ((O << 16) >> 16 == 0) |
                ((E | 0) == 65535) |
                ((O & 65535) > 255)
              )
            ) {
              N = c[(f + ((O & 65535) << 2)) >> 2] | 0;
              if ((N | 0) == 0) {
                break;
              }
              if ((c[(N + 4) >> 2] | 0) >>> 0 <= E >>> 0) {
                break;
              }
              c[H >> 2] = N;
              c[t >> 2] = E;
            }
          } while (0);
          c[L >> 2] = 0;
          E = o | 0;
          b[E >> 1] = b[E >> 1] & 255;
          i = h;
          return;
        }
      } while (0);
      b[o >> 1] = (k & 255) | -32e3;
      i = h;
      return;
    } else if ((m | 0) == 75) {
      o = 0;
      n = 0;
      do {
        o = (((c[(f + (n << 2)) >> 2] | 0) != 0) + o) | 0;
        n = (n + 1) | 0;
      } while (n >>> 0 < 255);
      b[j >> 1] = k & 255;
      b[(g + 10) >> 1] = o & 65535;
      i = h;
      return;
    } else if ((m | 0) == 81) {
      o = (g + 4) | 0;
      n = b[(g + 8) >> 1] | 0;
      E = (g + 10) | 0;
      t = b[E >> 1] | 0;
      H = t & 65535;
      do {
        if ((n & 65535) <= 255) {
          O = c[(f + ((n & 65535) << 2)) >> 2] | 0;
          if ((O | 0) == 0) {
            break;
          }
          s = c[(f + 1024) >> 2] | 0;
          if (H >>> 0 > s >>> 0) {
            b[o >> 1] = (k & 255) | -30976;
            i = h;
            return;
          }
          N = (f + 1028) | 0;
          r = (O + 4) | 0;
          if ((((c[N >> 2] | 0) + H - (c[r >> 2] | 0)) | 0) >>> 0 > s >>> 0) {
            b[o >> 1] = (k & 255) | -30720;
            i = h;
            return;
          }
          s = (O + 8) | 0;
          M = c[s >> 2] | 0;
          do {
            if ((t << 16) >> 16 == 0) {
              zI(M);
              P = 0;
            } else {
              J = zJ(M, H << 14) | 0;
              if ((J | 0) != 0) {
                P = J;
                break;
              }
              J = o | 0;
              b[J >> 1] = (b[J >> 1] & 255) | -30720;
              i = h;
              return;
            }
          } while (0);
          c[N >> 2] = H - (c[r >> 2] | 0) + (c[N >> 2] | 0);
          c[s >> 2] = P;
          c[r >> 2] = H;
          M = (f + 1032) | 0;
          do {
            if ((c[M >> 2] | 0) == (O | 0)) {
              L = (f + 1048) | 0;
              if ((c[L >> 2] | 0) >>> 0 < H >>> 0) {
                break;
              }
              c[M >> 2] = 0;
              c[L >> 2] = 0;
            }
          } while (0);
          M = (f + 1036) | 0;
          do {
            if ((c[M >> 2] | 0) == (O | 0)) {
              s = (f + 1052) | 0;
              if ((c[s >> 2] | 0) >>> 0 < (c[r >> 2] | 0) >>> 0) {
                break;
              }
              c[M >> 2] = 0;
              c[s >> 2] = 0;
            }
          } while (0);
          M = (f + 1040) | 0;
          do {
            if ((c[M >> 2] | 0) == (O | 0)) {
              s = (f + 1056) | 0;
              if ((c[s >> 2] | 0) >>> 0 < (c[r >> 2] | 0) >>> 0) {
                break;
              }
              c[M >> 2] = 0;
              c[s >> 2] = 0;
            }
          } while (0);
          M = (f + 1044) | 0;
          do {
            if ((c[M >> 2] | 0) == (O | 0)) {
              s = (f + 1060) | 0;
              if ((c[s >> 2] | 0) >>> 0 < (c[r >> 2] | 0) >>> 0) {
                break;
              }
              c[M >> 2] = 0;
              c[s >> 2] = 0;
            }
          } while (0);
          M = o | 0;
          b[M >> 1] = b[M >> 1] & 255;
          b[E >> 1] = t;
          i = h;
          return;
        }
      } while (0);
      b[o >> 1] = (k & 255) | -32e3;
      i = h;
      return;
    } else if ((m | 0) == 83) {
      o = l & 255;
      if ((o | 0) == 0) {
        t = (g + 4) | 0;
        E = b[(g + 8) >> 1] | 0;
        do {
          if ((E & 65535) <= 255) {
            H = c[(f + ((E & 65535) << 2)) >> 2] | 0;
            if ((H | 0) == 0) {
              break;
            }
            P = e[(g + 18) >> 1] | 0;
            n = (e[(g + 20) >> 1] | 0) << 4;
            M = (g + 80) | 0;
            r = (g + 76) | 0;
            O = (g + 72) | 0;
            s = (g + 40) | 0;
            N = (g + 32) | 0;
            L = 0;
            do {
              J = a[(H + 40 + L) | 0] | 0;
              z = (((L + P) & 65535) + n) & c[M >> 2];
              if (z >>> 0 < (c[r >> 2] | 0) >>> 0) {
                a[((c[O >> 2] | 0) + z) | 0] = J;
              } else {
                b5[c[s >> 2] & 255](c[N >> 2] | 0, z, J);
              }
              L = (L + 1) | 0;
            } while (L >>> 0 < 8);
            L = t | 0;
            b[L >> 1] = b[L >> 1] & 255;
            i = h;
            return;
          }
        } while (0);
        b[t >> 1] = (k & 255) | -32e3;
        i = h;
        return;
      } else if ((o | 0) == 1) {
        o = (g + 4) | 0;
        t = b[(g + 8) >> 1] | 0;
        do {
          if ((t & 65535) <= 255) {
            E = c[(f + ((t & 65535) << 2)) >> 2] | 0;
            if ((E | 0) == 0) {
              break;
            }
            L = e[(g + 16) >> 1] | 0;
            N = (e[(g + 20) >> 1] | 0) << 4;
            s = (g + 80) | 0;
            O = (g + 76) | 0;
            r = (g + 72) | 0;
            M = (g + 36) | 0;
            n = (g + 32) | 0;
            P = 0;
            do {
              H = (((P + L) & 65535) + N) & c[s >> 2];
              if (H >>> 0 < (c[O >> 2] | 0) >>> 0) {
                Q = a[((c[r >> 2] | 0) + H) | 0] | 0;
              } else {
                Q = b8[c[M >> 2] & 255](c[n >> 2] | 0, H) | 0;
              }
              a[(E + 40 + P) | 0] = Q;
              P = (P + 1) | 0;
            } while (P >>> 0 < 8);
            P = o | 0;
            b[P >> 1] = b[P >> 1] & 255;
            i = h;
            return;
          }
        } while (0);
        b[o >> 1] = (k & 255) | -32e3;
        i = h;
        return;
      } else {
        xt(1, 41072, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = l), x) | 0);
        b[j >> 1] = (b[j >> 1] & 255) | -28928;
        i = h;
        return;
      }
    } else if ((m | 0) == 69) {
      o = (g + 4) | 0;
      Q = b[(g + 8) >> 1] | 0;
      do {
        if ((Q & 65535) <= 255) {
          t = (f + ((Q & 65535) << 2)) | 0;
          P = c[t >> 2] | 0;
          if ((P | 0) == 0) {
            break;
          }
          if ((c[(P + 12) >> 2] | 0) != 0) {
            b[o >> 1] = (k & 255) | -31232;
            i = h;
            return;
          }
          E = (f + 1032) | 0;
          if ((c[E >> 2] | 0) == (P | 0)) {
            c[E >> 2] = 0;
            c[(f + 1048) >> 2] = 0;
          }
          E = (f + 1036) | 0;
          if ((c[E >> 2] | 0) == (P | 0)) {
            c[E >> 2] = 0;
            c[(f + 1052) >> 2] = 0;
          }
          E = (f + 1040) | 0;
          if ((c[E >> 2] | 0) == (P | 0)) {
            c[E >> 2] = 0;
            c[(f + 1056) >> 2] = 0;
          }
          E = (f + 1044) | 0;
          if ((c[E >> 2] | 0) == (P | 0)) {
            c[E >> 2] = 0;
            c[(f + 1060) >> 2] = 0;
          }
          E = (f + 1028) | 0;
          c[E >> 2] = (c[E >> 2] | 0) - (c[(P + 4) >> 2] | 0);
          c[t >> 2] = 0;
          zI(c[(P + 8) >> 2] | 0);
          zI(P);
          P = o | 0;
          b[P >> 1] = b[P >> 1] & 255;
          i = h;
          return;
        }
      } while (0);
      b[o >> 1] = (k & 255) | -32e3;
      i = h;
      return;
    } else if ((m | 0) == 70) {
      b[j >> 1] = 50;
      i = h;
      return;
    } else if ((m | 0) == 71) {
      o = (g + 4) | 0;
      Q = b[(g + 8) >> 1] | 0;
      do {
        if ((Q & 65535) <= 255) {
          P = c[(f + ((Q & 65535) << 2)) >> 2] | 0;
          if ((P | 0) == 0) {
            break;
          }
          t = (P + 12) | 0;
          if ((c[t >> 2] | 0) != 0) {
            b[o >> 1] = (k & 255) | -29440;
            i = h;
            return;
          }
          E = (P + 16) | 0;
          n = c[(f + 1032) >> 2] | 0;
          if ((n | 0) == 0) {
            b[E >> 1] = 0;
            R = 65535;
          } else {
            b[E >> 1] = b[n >> 1] | 0;
            R = c[(f + 1048) >> 2] | 0;
          }
          c[(P + 24) >> 2] = R;
          n = (P + 18) | 0;
          E = c[(f + 1036) >> 2] | 0;
          if ((E | 0) == 0) {
            b[n >> 1] = 0;
            S = 65535;
          } else {
            b[n >> 1] = b[E >> 1] | 0;
            S = c[(f + 1052) >> 2] | 0;
          }
          c[(P + 28) >> 2] = S;
          E = (P + 20) | 0;
          n = c[(f + 1040) >> 2] | 0;
          if ((n | 0) == 0) {
            b[E >> 1] = 0;
            T = 65535;
          } else {
            b[E >> 1] = b[n >> 1] | 0;
            T = c[(f + 1056) >> 2] | 0;
          }
          c[(P + 32) >> 2] = T;
          n = (P + 22) | 0;
          E = c[(f + 1044) >> 2] | 0;
          if ((E | 0) == 0) {
            b[n >> 1] = 0;
            U = 65535;
          } else {
            b[n >> 1] = b[E >> 1] | 0;
            U = c[(f + 1060) >> 2] | 0;
          }
          c[(P + 36) >> 2] = U;
          c[t >> 2] = 1;
          t = o | 0;
          b[t >> 1] = b[t >> 1] & 255;
          i = h;
          return;
        }
      } while (0);
      b[o >> 1] = (k & 255) | -32e3;
      i = h;
      return;
    } else if ((m | 0) == 68) {
      o = l & 255;
      U = b[(g + 10) >> 1] | 0;
      T = U & 65535;
      S = b[(g + 8) >> 1] | 0;
      if (o >>> 0 > 3) {
        b[j >> 1] = (k & 255) | -29952;
        i = h;
        return;
      }
      do {
        if ((S & 65535) <= 255) {
          R = c[(f + ((S & 65535) << 2)) >> 2] | 0;
          if ((R | 0) == 0) {
            break;
          }
          if ((U << 16) >> 16 == -1) {
            c[(f + 1032 + (o << 2)) >> 2] = 0;
            c[(f + 1048 + (o << 2)) >> 2] = 0;
            b[j >> 1] = b[j >> 1] & 255;
            i = h;
            return;
          }
          if (T >>> 0 < (c[(R + 4) >> 2] | 0) >>> 0) {
            c[(f + 1032 + (o << 2)) >> 2] = R;
            c[(f + 1048 + (o << 2)) >> 2] = T;
            b[j >> 1] = b[j >> 1] & 255;
            i = h;
            return;
          } else {
            b[j >> 1] = (k & 255) | -22528;
            i = h;
            return;
          }
        }
      } while (0);
      b[j >> 1] = (k & 255) | -32e3;
      i = h;
      return;
    } else if ((m | 0) == 65) {
      b[j >> 1] = k & 255;
      b[(g + 10) >> 1] = ((rL(c[(f + 1064) >> 2] | 0) | 0) >>> 4) & 65535;
      i = h;
      return;
    } else if ((m | 0) == 67) {
      T = (g + 4) | 0;
      o = b[(g + 10) >> 1] | 0;
      U = o & 65535;
      if ((o << 16) >> 16 == 0) {
        b[T >> 1] = (k & 255) | -30464;
        i = h;
        return;
      }
      o = c[(f + 1024) >> 2] | 0;
      if (U >>> 0 > o >>> 0) {
        b[T >> 1] = (k & 255) | -30976;
        i = h;
        return;
      }
      S = (f + 1028) | 0;
      if ((((c[S >> 2] | 0) + U) | 0) >>> 0 > o >>> 0) {
        b[T >> 1] = (k & 255) | -30720;
        i = h;
        return;
      } else {
        V = 1;
      }
      while (1) {
        if (V >>> 0 >= 255) {
          I = 623;
          break;
        }
        W = (f + (V << 2)) | 0;
        if ((c[W >> 2] | 0) == 0) {
          break;
        } else {
          V = (V + 1) | 0;
        }
      }
      if ((I | 0) == 623) {
        b[T >> 1] = (k & 255) | -31488;
        i = h;
        return;
      }
      I = zH(48) | 0;
      o = I;
      R = V & 65535;
      do {
        if ((I | 0) == 0) {
          X = 0;
        } else {
          b[I >> 1] = R;
          c[(I + 4) >> 2] = U;
          V = zH(U << 14) | 0;
          c[(I + 8) >> 2] = V;
          if ((V | 0) == 0) {
            zI(I);
            X = 0;
            break;
          } else {
            c[(I + 12) >> 2] = 0;
            V = (I + 40) | 0;
            Q = V | 0;
            y = 0;
            a[Q] = y & 255;
            y = y >> 8;
            a[(Q + 1) | 0] = y & 255;
            y = y >> 8;
            a[(Q + 2) | 0] = y & 255;
            y = y >> 8;
            a[(Q + 3) | 0] = y & 255;
            Q = (V + 4) | 0;
            y = 0;
            a[Q] = y & 255;
            y = y >> 8;
            a[(Q + 1) | 0] = y & 255;
            y = y >> 8;
            a[(Q + 2) | 0] = y & 255;
            y = y >> 8;
            a[(Q + 3) | 0] = y & 255;
            X = o;
            break;
          }
        }
      } while (0);
      c[W >> 2] = X;
      c[S >> 2] = (c[S >> 2] | 0) + U;
      U = T | 0;
      b[U >> 1] = b[U >> 1] & 255;
      b[(g + 8) >> 1] = R;
      i = h;
      return;
    } else if ((m | 0) == 66) {
      b[j >> 1] = k & 255;
      R = (f + 1024) | 0;
      b[(g + 10) >> 1] = ((c[R >> 2] | 0) - (c[(f + 1028) >> 2] | 0)) & 65535;
      b[(g + 8) >> 1] = c[R >> 2] & 65535;
      i = h;
      return;
    } else if ((m | 0) == 76) {
      R = (g + 4) | 0;
      U = b[(g + 8) >> 1] | 0;
      do {
        if ((U & 65535) <= 255) {
          T = (f + ((U & 65535) << 2)) | 0;
          if ((c[T >> 2] | 0) == 0) {
            break;
          }
          b[R >> 1] = k & 255;
          b[(g + 10) >> 1] = c[((c[T >> 2] | 0) + 4) >> 2] & 65535;
          i = h;
          return;
        }
      } while (0);
      b[R >> 1] = (k & 255) | -32e3;
      i = h;
      return;
    } else if ((m | 0) == 77) {
      m = e[(g + 18) >> 1] | 0;
      k = (e[(g + 20) >> 1] | 0) << 4;
      R = (g + 80) | 0;
      U = (g + 76) | 0;
      T = (g + 72) | 0;
      S = (g + 48) | 0;
      X = (g + 32) | 0;
      W = 0;
      o = 0;
      while (1) {
        I = (f + (o << 2)) | 0;
        do {
          if ((c[I >> 2] | 0) == 0) {
            Y = W;
          } else {
            Q = (W + 1) | 0;
            V = ((o << 2) + m) | 0;
            t = o & 65535;
            P = c[R >> 2] & ((V & 65535) + k);
            E = (P + 1) | 0;
            if (E >>> 0 < (c[U >> 2] | 0) >>> 0) {
              a[((c[T >> 2] | 0) + P) | 0] = o & 255;
              a[((c[T >> 2] | 0) + E) | 0] = ((t & 65535) >>> 8) & 255;
            } else {
              b5[c[S >> 2] & 255](c[X >> 2] | 0, P, t);
            }
            t = c[((c[I >> 2] | 0) + 4) >> 2] | 0;
            P = t & 65535;
            E = c[R >> 2] & (((V + 2) & 65535) + k);
            V = (E + 1) | 0;
            if (V >>> 0 < (c[U >> 2] | 0) >>> 0) {
              a[((c[T >> 2] | 0) + E) | 0] = t & 255;
              a[((c[T >> 2] | 0) + V) | 0] = ((P & 65535) >>> 8) & 255;
              Y = Q;
              break;
            } else {
              b5[c[S >> 2] & 255](c[X >> 2] | 0, E, P);
              Y = Q;
              break;
            }
          }
        } while (0);
        I = (o + 1) | 0;
        if (I >>> 0 < 255) {
          W = Y;
          o = I;
        } else {
          break;
        }
      }
      b[j >> 1] = b[j >> 1] & 255;
      b[(g + 10) >> 1] = Y & 65535;
      i = h;
      return;
    } else {
      xt(1, 20992, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = l), x) | 0);
      b[j >> 1] = (b[j >> 1] & 255) | -31744;
      i = h;
      return;
    }
  }
  function c0(f) {
    f = f | 0;
    var g = 0,
      h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0;
    g = i;
    h = f | 0;
    f = c[h >> 2] | 0;
    j = (f + 4) | 0;
    k = b[j >> 1] | 0;
    l = (k & 65535) >>> 8;
    if ((l | 0) == 136) {
      m = (f + 30) | 0;
      b[m >> 1] = b[m >> 1] & -2;
      b[((c[h >> 2] | 0) + 4) >> 1] = 0;
      m = ((c[h >> 2] | 0) + 30) | 0;
      b[m >> 1] = b[m >> 1] | 1;
      i = g;
      return;
    } else if ((l | 0) == 135) {
      l = b[(f + 16) >> 1] | 0;
      m = (e[(f + 6) >> 1] | 0) << 1;
      n = (e[(f + 20) >> 1] | 0) << 4;
      o = c[(f + 80) >> 2] | 0;
      p = (((l + 18) & 65535) + n) & o;
      q = (p + 1) | 0;
      r = c[(f + 76) >> 2] | 0;
      if (q >>> 0 < r >>> 0) {
        s = c[(f + 72) >> 2] | 0;
        t = ((d[(s + q) | 0] | 0) << 8) | (d[(s + p) | 0] | 0);
        u = f;
        v = o;
        w = r;
      } else {
        r = b8[c[(f + 44) >> 2] & 255](c[(f + 32) >> 2] | 0, p) | 0;
        p = c[h >> 2] | 0;
        t = r;
        u = p;
        v = c[(p + 80) >> 2] | 0;
        w = c[(p + 76) >> 2] | 0;
      }
      p = v & (((l + 20) & 65535) + n);
      if (p >>> 0 < w >>> 0) {
        y = a[((c[(u + 72) >> 2] | 0) + p) | 0] | 0;
        z = u;
        A = v;
        B = w;
      } else {
        w = b8[c[(u + 36) >> 2] & 255](c[(u + 32) >> 2] | 0, p) | 0;
        p = c[h >> 2] | 0;
        y = w;
        z = p;
        A = c[(p + 80) >> 2] | 0;
        B = c[(p + 76) >> 2] | 0;
      }
      p = A & (((l + 26) & 65535) + n);
      w = (p + 1) | 0;
      if (w >>> 0 < B >>> 0) {
        u = c[(z + 72) >> 2] | 0;
        C = ((d[(u + w) | 0] | 0) << 8) | (d[(u + p) | 0] | 0);
        D = z;
        E = A;
        F = B;
      } else {
        B = b8[c[(z + 44) >> 2] & 255](c[(z + 32) >> 2] | 0, p) | 0;
        p = c[h >> 2] | 0;
        C = B;
        D = p;
        E = c[(p + 80) >> 2] | 0;
        F = c[(p + 76) >> 2] | 0;
      }
      p = E & (((l + 28) & 65535) + n);
      if (p >>> 0 < F >>> 0) {
        G = a[((c[(D + 72) >> 2] | 0) + p) | 0] | 0;
      } else {
        G = b8[c[(D + 36) >> 2] & 255](c[(D + 32) >> 2] | 0, p) | 0;
      }
      xt(
        3,
        35656,
        ((x = i),
        (i = (i + 24) | 0),
        (c[x >> 2] = ((y & 255) << 16) | (t & 65535)),
        (c[(x + 8) >> 2] = ((G & 255) << 16) | (C & 65535)),
        (c[(x + 16) >> 2] = m),
        x) | 0
      );
      m = ((c[h >> 2] | 0) + 30) | 0;
      b[m >> 1] = b[m >> 1] | 1;
      m = ((c[h >> 2] | 0) + 4) | 0;
      b[m >> 1] = b[m >> 1] & 255;
      m = ((c[h >> 2] | 0) + 4) | 0;
      b[m >> 1] = b[m >> 1] | -31232;
      i = g;
      return;
    } else {
      b[j >> 1] = k & 255;
      k = ((c[h >> 2] | 0) + 4) | 0;
      b[k >> 1] = b[k >> 1] | -31232;
      k = ((c[h >> 2] | 0) + 30) | 0;
      b[k >> 1] = b[k >> 1] | 1;
      i = g;
      return;
    }
  }
  function c1(f) {
    f = f | 0;
    var g = 0,
      h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0;
    g = i;
    i = (i + 8) | 0;
    h = g | 0;
    j = f | 0;
    k = c[j >> 2] | 0;
    l = (e[(k + 4) >> 1] | 0) >>> 8;
    m = (k + 30) | 0;
    b[m >> 1] = b[m >> 1] | 1;
    if ((l | 0) == 0) {
      m = c[j >> 2] | 0;
      k = c[(m + 80) >> 2] & 1132;
      n = k | 1;
      if (n >>> 0 < (c[(m + 76) >> 2] | 0) >>> 0) {
        o = c[(m + 72) >> 2] | 0;
        p = ((d[(o + n) | 0] | 0) << 8) | (d[(o + k) | 0] | 0);
        q = m;
      } else {
        o = b8[c[(m + 44) >> 2] & 255](c[(m + 32) >> 2] | 0, k) | 0;
        p = o;
        q = c[j >> 2] | 0;
      }
      b[(q + 8) >> 1] = p;
      p = c[j >> 2] | 0;
      q = c[(p + 80) >> 2] & 1134;
      o = q | 1;
      if (o >>> 0 < (c[(p + 76) >> 2] | 0) >>> 0) {
        k = c[(p + 72) >> 2] | 0;
        r = ((d[(k + o) | 0] | 0) << 8) | (d[(k + q) | 0] | 0);
        s = p;
      } else {
        k = b8[c[(p + 44) >> 2] & 255](c[(p + 32) >> 2] | 0, q) | 0;
        r = k;
        s = c[j >> 2] | 0;
      }
      b[(s + 6) >> 1] = r;
      r = c[j >> 2] | 0;
      s = c[(r + 80) >> 2] & 1136;
      if (s >>> 0 < (c[(r + 76) >> 2] | 0) >>> 0) {
        t = a[((c[(r + 72) >> 2] | 0) + s) | 0] | 0;
        u = r;
      } else {
        k = b8[c[(r + 36) >> 2] & 255](c[(r + 32) >> 2] | 0, s) | 0;
        t = k;
        u = c[j >> 2] | 0;
      }
      k = (u + 4) | 0;
      b[k >> 1] = b[k >> 1] & -256;
      k = ((c[j >> 2] | 0) + 4) | 0;
      b[k >> 1] = b[k >> 1] | (t & 255);
      t = c[j >> 2] | 0;
      k = c[(t + 80) >> 2] & 1136;
      if (k >>> 0 < (c[(t + 76) >> 2] | 0) >>> 0) {
        a[((c[(t + 72) >> 2] | 0) + k) | 0] = 0;
      } else {
        b5[c[(t + 40) >> 2] & 255](c[(t + 32) >> 2] | 0, k, 0);
      }
      k = ((c[j >> 2] | 0) + 30) | 0;
      b[k >> 1] = b[k >> 1] & -2;
      i = g;
      return;
    } else if ((l | 0) == 1) {
      k = c[j >> 2] | 0;
      t = b[(k + 8) >> 1] | 0;
      u = c[(k + 80) >> 2] & 1132;
      s = u | 1;
      if (s >>> 0 < (c[(k + 76) >> 2] | 0) >>> 0) {
        r = (k + 72) | 0;
        a[((c[r >> 2] | 0) + u) | 0] = t & 255;
        a[((c[r >> 2] | 0) + s) | 0] = ((t & 65535) >>> 8) & 255;
      } else {
        b5[c[(k + 48) >> 2] & 255](c[(k + 32) >> 2] | 0, u, t);
      }
      t = c[j >> 2] | 0;
      u = b[(t + 6) >> 1] | 0;
      k = c[(t + 80) >> 2] & 1134;
      s = k | 1;
      if (s >>> 0 < (c[(t + 76) >> 2] | 0) >>> 0) {
        r = (t + 72) | 0;
        a[((c[r >> 2] | 0) + k) | 0] = u & 255;
        a[((c[r >> 2] | 0) + s) | 0] = ((u & 65535) >>> 8) & 255;
      } else {
        b5[c[(t + 48) >> 2] & 255](c[(t + 32) >> 2] | 0, k, u);
      }
      u = ((c[j >> 2] | 0) + 30) | 0;
      b[u >> 1] = b[u >> 1] & -2;
      i = g;
      return;
    } else {
      if ((c[(f + 3104) >> 2] | 0) == 0) {
        i = g;
        return;
      }
      if ((l | 0) == 4) {
        c[h >> 2] = b0(0) | 0;
        f = aH(h | 0) | 0;
        u = (f + 20) | 0;
        k = ((((c[u >> 2] | 0) + 1900) | 0) / 100) | 0;
        t = ((c[j >> 2] | 0) + 6) | 0;
        b[t >> 1] = b[t >> 1] & 255;
        t = ((c[j >> 2] | 0) + 6) | 0;
        b[t >> 1] =
          (e[t >> 1] |
            0 |
            ((((((((k >>> 0) / 10) | 0) >>> 0) % 10 | 0) << 4) |
              ((k >>> 0) % 10 | 0)) <<
              8)) &
          65535;
        k = ((c[u >> 2] | 0) + 1900) | 0;
        u = ((c[j >> 2] | 0) + 6) | 0;
        b[u >> 1] = b[u >> 1] & -256;
        u = ((c[j >> 2] | 0) + 6) | 0;
        b[u >> 1] =
          (((((((k >>> 0) / 10) | 0) >>> 0) % 10 | 0) << 4) |
            (((k >>> 0) % 10 | 0) & 15) |
            (e[u >> 1] | 0)) &
          65535;
        u = ((c[(f + 16) >> 2] | 0) + 1) | 0;
        k = ((c[j >> 2] | 0) + 8) | 0;
        b[k >> 1] = b[k >> 1] & 255;
        k = ((c[j >> 2] | 0) + 8) | 0;
        b[k >> 1] =
          (e[k >> 1] |
            0 |
            ((((((((u >>> 0) / 10) | 0) >>> 0) % 10 | 0) << 4) |
              ((u >>> 0) % 10 | 0)) <<
              8)) &
          65535;
        u = c[(f + 12) >> 2] | 0;
        f = ((c[j >> 2] | 0) + 8) | 0;
        b[f >> 1] = b[f >> 1] & -256;
        f = ((c[j >> 2] | 0) + 8) | 0;
        b[f >> 1] =
          (((((((u >>> 0) / 10) | 0) >>> 0) % 10 | 0) << 4) |
            (((u >>> 0) % 10 | 0) & 15) |
            (e[f >> 1] | 0)) &
          65535;
        f = ((c[j >> 2] | 0) + 30) | 0;
        b[f >> 1] = b[f >> 1] & -2;
        i = g;
        return;
      } else if ((l | 0) == 5) {
        f = ((c[j >> 2] | 0) + 30) | 0;
        b[f >> 1] = b[f >> 1] & -2;
        i = g;
        return;
      } else if ((l | 0) == 2) {
        c[h >> 2] = b0(0) | 0;
        f = aH(h | 0) | 0;
        h = c[(f + 8) >> 2] | 0;
        u = ((c[j >> 2] | 0) + 6) | 0;
        b[u >> 1] = b[u >> 1] & 255;
        u = ((c[j >> 2] | 0) + 6) | 0;
        b[u >> 1] =
          (e[u >> 1] |
            0 |
            ((((((((h >>> 0) / 10) | 0) >>> 0) % 10 | 0) << 4) |
              ((h >>> 0) % 10 | 0)) <<
              8)) &
          65535;
        h = c[(f + 4) >> 2] | 0;
        u = ((c[j >> 2] | 0) + 6) | 0;
        b[u >> 1] = b[u >> 1] & -256;
        u = ((c[j >> 2] | 0) + 6) | 0;
        b[u >> 1] =
          (((((((h >>> 0) / 10) | 0) >>> 0) % 10 | 0) << 4) |
            (((h >>> 0) % 10 | 0) & 15) |
            (e[u >> 1] | 0)) &
          65535;
        u = c[f >> 2] | 0;
        f = ((c[j >> 2] | 0) + 8) | 0;
        b[f >> 1] = b[f >> 1] & 255;
        f = ((c[j >> 2] | 0) + 8) | 0;
        b[f >> 1] =
          (e[f >> 1] |
            0 |
            ((((((((u >>> 0) / 10) | 0) >>> 0) % 10 | 0) << 4) |
              ((u >>> 0) % 10 | 0)) <<
              8)) &
          65535;
        u = ((c[j >> 2] | 0) + 30) | 0;
        b[u >> 1] = b[u >> 1] & -2;
        i = g;
        return;
      } else if ((l | 0) == 3) {
        l = ((c[j >> 2] | 0) + 30) | 0;
        b[l >> 1] = b[l >> 1] & -2;
        i = g;
        return;
      } else {
        i = g;
        return;
      }
    }
  }
  function c2(d, f, g) {
    d = d | 0;
    f = f | 0;
    g = g | 0;
    var h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0;
    h = i;
    i = (i + 512) | 0;
    j = h | 0;
    k = (h + 256) | 0;
    l = d;
    m = f & 255;
    if ((m | 0) == 6) {
      b[((c[d >> 2] | 0) + 4) >> 1] = 0;
      if ((g << 24) >> 24 != 19) {
        i = h;
        return;
      }
      dB(l);
      i = h;
      return;
    } else if ((m | 0) == 205) {
      n = 908;
    }
    do {
      if ((n | 0) == 908) {
        if ((((g << 24) >> 24) | 0) == 21) {
          c0(l);
          i = h;
          return;
        } else if ((((g << 24) >> 24) | 0) == 26) {
          c1(l);
          i = h;
          return;
        } else if ((((g << 24) >> 24) | 0) == 19) {
          dC(c[(d + 8) >> 2] | 0, c[d >> 2] | 0);
          i = h;
          return;
        } else {
          break;
        }
      }
    } while (0);
    f = d;
    o = ((c[f >> 2] | 0) + 30) | 0;
    b[o >> 1] = b[o >> 1] & -2;
    o = g & 255;
    g = (o << 8) | m;
    if ((g | 0) == 1538) {
      p = hJ(c[f >> 2] | 0) | 0;
      b[((c[f >> 2] | 0) + 4) >> 1] = p & 65535;
      b[((c[f >> 2] | 0) + 8) >> 1] = (p >>> 16) & 65535;
      i = h;
      return;
    } else if ((g | 0) == 2306) {
      b[((c[f >> 2] | 0) + 4) >> 1] = c[(d + 3108) >> 2] & 65535;
      i = h;
      return;
    } else if ((g | 0) == 2050) {
      b[((c[f >> 2] | 0) + 4) >> 1] = c[(d + 3112) >> 2] & 65535;
      i = h;
      return;
    } else if ((g | 0) == 1537) {
      p = c[f >> 2] | 0;
      hI(p, ((e[(p + 8) >> 1] | 0) << 16) | (e[(p + 4) >> 1] | 0));
      i = h;
      return;
    } else if ((g | 0) == 514) {
      p = c[(d + 3048) >> 2] | 0;
      if ((p | 0) == 0) {
        q = 0;
      } else {
        q = c[(p + 48) >> 2] & 65535;
      }
      b[((c[f >> 2] | 0) + 4) >> 1] = q;
      q = c[(d + 3052) >> 2] | 0;
      if ((q | 0) == 0) {
        r = 0;
      } else {
        r = c[(q + 48) >> 2] & 65535;
      }
      b[((c[f >> 2] | 0) + 10) >> 1] = r;
      r = c[(d + 3056) >> 2] | 0;
      if ((r | 0) == 0) {
        s = 0;
      } else {
        s = c[(r + 48) >> 2] & 65535;
      }
      b[((c[f >> 2] | 0) + 6) >> 1] = s;
      s = c[(d + 3060) >> 2] | 0;
      if ((s | 0) == 0) {
        t = 0;
      } else {
        t = c[(s + 48) >> 2] & 65535;
      }
      b[((c[f >> 2] | 0) + 8) >> 1] = t;
      i = h;
      return;
    } else if ((g | 0) == 4) {
      c$(c[(d + 3020) >> 2] | 0, c[f >> 2] | 0);
      i = h;
      return;
    } else if ((g | 0) == 770) {
      b[((c[f >> 2] | 0) + 4) >> 1] = 0;
      i = h;
      return;
    } else if ((g | 0) == 260) {
      cY(c[(d + 3020) >> 2] | 0, c[f >> 2] | 0);
      i = h;
      return;
    } else if ((g | 0) == 3) {
      eG(c[(d + 3024) >> 2] | 0, c[f >> 2] | 0);
      i = h;
      return;
    } else if ((g | 0) == 259) {
      eC(c[(d + 3024) >> 2] | 0, c[f >> 2] | 0);
      i = h;
      return;
    } else if ((g | 0) == 5) {
      t = j | 0;
      s = k | 0;
      r = ((c[f >> 2] | 0) + 30) | 0;
      b[r >> 1] = b[r >> 1] | 1;
      r = c[f >> 2] | 0;
      q = (e[(r + 26) >> 1] | 0) << 4;
      p = e[(r + 16) >> 1] | 0;
      u = 0;
      v = r;
      while (1) {
        r = ((p & 65535) + q) & c[(v + 80) >> 2];
        if (((r + 1) | 0) >>> 0 < (c[(v + 76) >> 2] | 0) >>> 0) {
          w = a[((c[(v + 72) >> 2] | 0) + r) | 0] | 0;
        } else {
          w = (b8[c[(v + 44) >> 2] & 255](c[(v + 32) >> 2] | 0, r) | 0) & 255;
        }
        a[(j + u) | 0] = w;
        if ((w << 24) >> 24 == 0) {
          break;
        }
        r = (u + 1) | 0;
        if (r >>> 0 >= 256) {
          n = 991;
          break;
        }
        p = (p + 1) | 0;
        u = r;
        v = c[f >> 2] | 0;
      }
      if ((n | 0) == 991) {
        i = h;
        return;
      }
      if (u >>> 0 > 255) {
        i = h;
        return;
      }
      u = c[f >> 2] | 0;
      v = e[(u + 18) >> 1] | 0;
      p = 0;
      w = u;
      while (1) {
        u = ((v & 65535) + q) & c[(w + 80) >> 2];
        if (((u + 1) | 0) >>> 0 < (c[(w + 76) >> 2] | 0) >>> 0) {
          y = a[((c[(w + 72) >> 2] | 0) + u) | 0] | 0;
        } else {
          y = (b8[c[(w + 44) >> 2] & 255](c[(w + 32) >> 2] | 0, u) | 0) & 255;
        }
        a[(k + p) | 0] = y;
        if ((y << 24) >> 24 == 0) {
          break;
        }
        u = (p + 1) | 0;
        if (u >>> 0 >= 256) {
          n = 997;
          break;
        }
        v = (v + 1) | 0;
        p = u;
        w = c[f >> 2] | 0;
      }
      if ((n | 0) == 997) {
        i = h;
        return;
      }
      if (p >>> 0 > 255) {
        i = h;
        return;
      }
      p = (dV(l, t, s) | 0) == 0;
      s = ((c[f >> 2] | 0) + 30) | 0;
      t = b[s >> 1] | 0;
      if (p) {
        b[s >> 1] = t & -2;
        b[((c[f >> 2] | 0) + 4) >> 1] = 0;
        i = h;
        return;
      } else {
        b[s >> 1] = t | 1;
        b[((c[f >> 2] | 0) + 4) >> 1] = 1;
        i = h;
        return;
      }
    } else if (((g | 0) == 1025) | ((g | 0) == 1281)) {
      i = h;
      return;
    } else if ((g | 0) == 1026) {
      b[((c[f >> 2] | 0) + 4) >> 1] = 0;
      i = h;
      return;
    } else if ((g | 0) == 1794) {
      t = c[f >> 2] | 0;
      s = b[(t + 20) >> 1] | 0;
      p = b[(t + 18) >> 1] | 0;
      b[(t + 4) >> 1] = 2;
      b[((c[f >> 2] | 0) + 8) >> 1] = 512;
      if (((p | s) << 16) >> 16 == 0) {
        i = h;
        return;
      }
      t = c[f >> 2] | 0;
      n = (s & 65535) << 4;
      s = c[(t + 80) >> 2] & ((p & 65535) + n);
      w = p;
      p = 32864;
      v = 50;
      y = t;
      k = s;
      q = s >>> 0 < (c[(t + 76) >> 2] | 0) >>> 0;
      do {
        if (q) {
          a[((c[(y + 72) >> 2] | 0) + k) | 0] = v;
        } else {
          b5[c[(y + 40) >> 2] & 255](c[(y + 32) >> 2] | 0, k, v);
        }
        w = (w + 1) & 65535;
        p = (p + 1) | 0;
        v = a[p] | 0;
        y = c[f >> 2] | 0;
        k = c[(y + 80) >> 2] & ((w & 65535) + n);
        q = k >>> 0 < (c[(y + 76) >> 2] | 0) >>> 0;
      } while ((v << 24) >> 24 != 0);
      if (q) {
        a[((c[(y + 72) >> 2] | 0) + k) | 0] = 0;
        i = h;
        return;
      } else {
        b5[c[(y + 40) >> 2] & 255](c[(y + 32) >> 2] | 0, k, 0);
        i = h;
        return;
      }
    } else if ((g | 0) == 2) {
      k = c7(l) | 0;
      y = ((c[f >> 2] | 0) + 4) | 0;
      b[y >> 1] = b[y >> 1] & -256;
      y = ((c[f >> 2] | 0) + 4) | 0;
      b[y >> 1] = (e[y >> 1] | 0 | (k & 255)) & 65535;
      i = h;
      return;
    } else if ((g | 0) == 0) {
      c[(d + 3168) >> 2] = 1;
      i = h;
      return;
    } else if ((g | 0) == 256) {
      c[(d + 3168) >> 2] = 2;
      i = h;
      return;
    } else if ((g | 0) == 1282) {
      b[((c[f >> 2] | 0) + 4) >> 1] = 0;
      i = h;
      return;
    } else if ((g | 0) == 1) {
      c6(l, b[((c[f >> 2] | 0) + 4) >> 1] & 255);
      i = h;
      return;
    } else if ((g | 0) == 258) {
      g = c[(d + 3032) >> 2] | 0;
      if ((g | 0) == 0) {
        z = 0;
      } else {
        z = c[(g + 688) >> 2] & 65535;
      }
      b[((c[f >> 2] | 0) + 4) >> 1] = z;
      z = c[(d + 3036) >> 2] | 0;
      if ((z | 0) == 0) {
        A = 0;
      } else {
        A = c[(z + 688) >> 2] & 65535;
      }
      b[((c[f >> 2] | 0) + 10) >> 1] = A;
      A = c[(d + 3040) >> 2] | 0;
      if ((A | 0) == 0) {
        B = 0;
      } else {
        B = c[(A + 688) >> 2] & 65535;
      }
      b[((c[f >> 2] | 0) + 6) >> 1] = B;
      B = c[(d + 3044) >> 2] | 0;
      if ((B | 0) == 0) {
        C = 0;
      } else {
        C = c[(B + 688) >> 2] & 65535;
      }
      b[((c[f >> 2] | 0) + 8) >> 1] = C;
      i = h;
      return;
    } else {
      C = ((c[f >> 2] | 0) + 30) | 0;
      b[C >> 1] = b[C >> 1] | 1;
      C = c[f >> 2] | 0;
      f = e[(C + 4) >> 1] | 0;
      B = e[(C + 10) >> 1] | 0;
      d = e[(C + 6) >> 1] | 0;
      A = e[(C + 8) >> 1] | 0;
      xt(
        3,
        39888,
        ((x = i),
        (i = (i + 48) | 0),
        (c[x >> 2] = m),
        (c[(x + 8) >> 2] = o),
        (c[(x + 16) >> 2] = f),
        (c[(x + 24) >> 2] = B),
        (c[(x + 32) >> 2] = d),
        (c[(x + 40) >> 2] = A),
        x) | 0
      );
      i = h;
      return;
    }
  }
  function c3(b) {
    b = b | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0,
      H = 0,
      I = 0,
      J = 0,
      K = 0,
      L = 0,
      M = 0,
      N = 0,
      O = 0,
      P = 0,
      Q = 0,
      R = 0,
      S = 0,
      T = 0,
      U = 0,
      V = 0,
      W = 0,
      X = 0,
      Y = 0,
      Z = 0,
      _ = 0,
      $ = 0,
      aa = 0,
      ab = 0,
      ac = 0,
      ad = 0,
      ae = 0,
      af = 0,
      ag = 0,
      ah = 0,
      ai = 0,
      aj = 0,
      ak = 0,
      al = 0,
      am = 0,
      an = 0,
      ao = 0,
      ap = 0,
      aq = 0,
      ar = 0,
      as = 0,
      at = 0,
      au = 0,
      av = 0,
      aw = 0;
    d = i;
    i = (i + 424) | 0;
    e = d | 0;
    f = (d + 8) | 0;
    g = (d + 16) | 0;
    h = (d + 24) | 0;
    j = (d + 32) | 0;
    k = (d + 40) | 0;
    l = (d + 48) | 0;
    m = (d + 56) | 0;
    n = (d + 64) | 0;
    o = (d + 72) | 0;
    p = (d + 80) | 0;
    q = (d + 88) | 0;
    r = (d + 96) | 0;
    s = (d + 104) | 0;
    t = (d + 112) | 0;
    u = (d + 120) | 0;
    v = (d + 128) | 0;
    w = (d + 136) | 0;
    y = (d + 144) | 0;
    z = (d + 152) | 0;
    A = (d + 160) | 0;
    B = (d + 176) | 0;
    C = (d + 184) | 0;
    D = (d + 192) | 0;
    E = (d + 200) | 0;
    F = (d + 208) | 0;
    G = (d + 216) | 0;
    H = (d + 224) | 0;
    I = (d + 232) | 0;
    J = (d + 240) | 0;
    K = (d + 248) | 0;
    L = (d + 256) | 0;
    M = (d + 264) | 0;
    N = (d + 272) | 0;
    O = (d + 280) | 0;
    P = (d + 288) | 0;
    Q = (d + 296) | 0;
    R = (d + 304) | 0;
    S = (d + 312) | 0;
    T = (d + 320) | 0;
    U = (d + 328) | 0;
    V = (d + 336) | 0;
    W = (d + 344) | 0;
    X = (d + 352) | 0;
    Y = (d + 360) | 0;
    Z = (d + 368) | 0;
    _ = (d + 376) | 0;
    $ = (d + 384) | 0;
    aa = (d + 392) | 0;
    ab = (d + 400) | 0;
    ac = (d + 408) | 0;
    ad = (d + 416) | 0;
    ae = zH(3176) | 0;
    af = ae;
    if ((ae | 0) == 0) {
      ag = 0;
      i = d;
      return ag | 0;
    }
    c[(ae + 3064) >> 2] = b;
    wt((ae + 3068) | 0);
    ah = (ae + 3108) | 0;
    c[ah >> 2] = 0;
    ai = (ae + 3112) | 0;
    c[ai >> 2] = 0;
    c[(ae + 3140) >> 2] = 0;
    c[(ae + 3168) >> 2] = 0;
    a[(ae + 3172) | 0] = 0;
    aj = yc(b, 0, 38464) | 0;
    ak = (aj | 0) == 0 ? b : aj;
    ym(ak, 40056, ad, 38424) | 0;
    yj(ak, 38368, (ae + 3076) | 0, 128) | 0;
    yj(ak, 38256, $, 2) | 0;
    yl(ak, 38152, (ae + 3104) | 0, 1) | 0;
    yl(ak, 38016, aa, 1) | 0;
    yl(ak, 37856, ab, 1) | 0;
    yl(ak, 37744, ac, 1) | 0;
    ak = c[$ >> 2] | 0;
    aj = c[aa >> 2] | 0;
    al = c[ab >> 2] | 0;
    xv(
      2,
      37648,
      37528,
      ((x = i),
      (i = (i + 32) | 0),
      (c[x >> 2] = c[ad >> 2]),
      (c[(x + 8) >> 2] = ak),
      (c[(x + 16) >> 2] = aj),
      (c[(x + 24) >> 2] = al),
      x) | 0
    );
    al = c[ad >> 2] | 0;
    do {
      if ((aP(al | 0, 38424) | 0) == 0) {
        c[(ae + 3e3) >> 2] = 1;
        am = 1;
      } else {
        if ((aP(al | 0, 37488) | 0) == 0) {
          c[(ae + 3e3) >> 2] = 2;
          am = 2;
          break;
        }
        if ((aP(al | 0, 37416) | 0) == 0) {
          c[(ae + 3e3) >> 2] = 6;
          am = 6;
          break;
        } else {
          xt(0, 37352, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = al), x) | 0);
          c[(ae + 3e3) >> 2] = 1;
          am = 1;
          break;
        }
      }
    } while (0);
    a[(ae + 3098) | 0] = ((c[aa >> 2] | 0) != 0) | 0;
    a[(ae + 3099) | 0] = ((c[ab >> 2] | 0) != 0) | 0;
    ab = (ae + 3100) | 0;
    a[ab] = ((c[ac >> 2] | 0) != 0) | 0;
    ac = (ae + 3004) | 0;
    a[ac] = 60;
    a[(ae + 3005) | 0] = 0;
    a[(ae + 3006) | 0] = 8;
    aa = (ae + 3007) | 0;
    a[aa] = 0;
    al = (ae + 3008) | 0;
    a[al] = 0;
    ad = ((am & 2) | 0) == 0;
    if (!ad) {
      a[aa] = 1;
    }
    aj = c[$ >> 2] | 0;
    c[ah >> 2] = aj;
    do {
      if (((am & 1) | 0) == 0) {
        if (ad) {
          break;
        }
        a[al] = 0;
        if ((aj | 0) == 0) {
          break;
        }
        a[al] = ((aj << 2) + 12) & 12;
      } else {
        a[ac] = 60;
        if ((aj | 0) == 0) {
          break;
        }
        a[ac] = (((aj << 6) + 192) | 61) & 255;
      }
    } while (0);
    dO(af, b);
    aj = r5() | 0;
    ad = (ae + 16) | 0;
    c[ad >> 2] = aj;
    am = (ae + 20) | 0;
    w9(aj, b, am) | 0;
    xa(c[ad >> 2] | 0, b) | 0;
    aj = c[am >> 2] | 0;
    if ((aj | 0) == 0) {
      an = 65536;
    } else {
      an = rM(aj) | 0;
    }
    aj = (ae + 3e3) | 0;
    ah = c[aj >> 2] | 0;
    do {
      if (((ah & 1) | 0) == 0) {
        if (((ah & 2) | 0) == 0) {
          break;
        }
        $ = an >>> 16;
        if (($ | 0) == 0) {
          ao = 0;
        } else {
          ak = ($ - 1) | 0;
          ao = ak >>> 0 > 3 ? 12 : (ak << 2) & 12;
        }
        a[aa] = ((a[aa] & -13 & 255) | ao) & 255;
      } else {
        if (an >>> 0 < 65536) {
          ap = 0;
        } else {
          ap = ((an - 65536) | 0) >>> 15;
        }
        ak = a[al] & -2;
        a[aa] = ((a[aa] & -16 & 255) | (ap & 15)) & 255;
        a[al] = ((ak & 255) | ((ap >>> 4) & 1)) & 255;
      }
    } while (0);
    do {
      if ((c[am >> 2] | 0) != 0) {
        if ((a[ab] | 0) != 0) {
          break;
        }
        se(c[ad >> 2] | 0, 1138, 4660);
      }
    } while (0);
    ab = r5() | 0;
    ap = (ae + 24) | 0;
    c[ap >> 2] = ab;
    rY(ab, ae, 34, 70, 0, 66, 46, 0);
    ab = (ae + 28) | 0;
    c[ab >> 2] = 0;
    aa = yc(b, 0, 39384) | 0;
    do {
      if ((aa | 0) != 0) {
        ym(aa, 21928, Y, 0) | 0;
        yi(aa, 39312, Z, 0) | 0;
        yi(aa, 39160, _, 65536) | 0;
        an = c[_ >> 2] | 0;
        ao = c[Y >> 2] | 0;
        xv(
          2,
          39056,
          38816,
          ((x = i),
          (i = (i + 24) | 0),
          (c[x >> 2] = c[Z >> 2]),
          (c[(x + 8) >> 2] = an),
          (c[(x + 16) >> 2] = (ao | 0) == 0 ? 38736 : ao),
          x) | 0
        );
        ao = sf(c[Z >> 2] | 0, c[_ >> 2] | 0) | 0;
        c[ab >> 2] = ao;
        if ((ao | 0) == 0) {
          xt(
            0,
            38632,
            ((x = i),
            (i = (i + 1) | 0),
            (i = ((i + 7) >> 3) << 3),
            (c[x >> 2] = 0),
            x) | 0
          );
          break;
        }
        r9(ao, 0);
        ao = c[ad >> 2] | 0;
        r7(ao, sm(c[ab >> 2] | 0) | 0, 0);
        ao = c[Y >> 2] | 0;
        if ((ao | 0) == 0) {
          break;
        }
        if ((sy(c[ab >> 2] | 0, ao) | 0) == 0) {
          break;
        }
        xt(
          0,
          38496,
          ((x = i), (i = (i + 8) | 0), (c[x >> 2] = c[Y >> 2]), x) | 0
        );
      }
    } while (0);
    Y = yc(b, 0, 40176) | 0;
    ym(Y, 40056, W, 25488) | 0;
    yj(Y, 39736, X, 0) | 0;
    Y = c[X >> 2] | 0;
    xv(
      2,
      38968,
      39624,
      ((x = i),
      (i = (i + 16) | 0),
      (c[x >> 2] = c[W >> 2]),
      (c[(x + 8) >> 2] = Y),
      x) | 0
    );
    Y = ae;
    c[Y >> 2] = hU() | 0;
    if ((dj(af, c[W >> 2] | 0) | 0) != 0) {
      xt(
        0,
        39464,
        ((x = i), (i = (i + 8) | 0), (c[x >> 2] = c[W >> 2]), x) | 0
      );
    }
    hM(c[Y >> 2] | 0, c[ad >> 2] | 0, 80, 54, 130, 134);
    hN(c[Y >> 2] | 0, c[ap >> 2] | 0, 80, 54, 130, 134);
    W = c[am >> 2] | 0;
    ab = c[Y >> 2] | 0;
    if ((W | 0) == 0) {
      hL(ab, 0, 0);
    } else {
      hL(ab, c[(W + 44) >> 2] | 0, c[(W + 40) >> 2] | 0);
    }
    c[((c[Y >> 2] | 0) + 92) >> 2] = ae;
    c[((c[Y >> 2] | 0) + 96) >> 2] = 18;
    W = c[X >> 2] | 0;
    c[(ae + 3128) >> 2] = W;
    c[(ae + 3132) >> 2] = W;
    W = (ae + 3136) | 0;
    c[W >> 2] = 0;
    yi(yc(b, 0, 40760) | 0, 34200, V, 0) | 0;
    xv(
      2,
      40632,
      41288,
      ((x = i),
      (i = (i + 16) | 0),
      (c[x >> 2] = c[V >> 2]),
      (c[(x + 8) >> 2] = 16),
      x) | 0
    );
    a[(ae + 3097) | 0] = 0;
    X = (ae + 32) | 0;
    ab = X;
    zP((ae + 3080) | 0, 0, 16);
    mI(ab);
    _ = r0(c[V >> 2] | 0, 16, 0) | 0;
    if ((_ | 0) == 0) {
      xt(
        0,
        40352,
        ((x = i),
        (i = (i + 1) | 0),
        (i = ((i + 7) >> 3) << 3),
        (c[x >> 2] = 0),
        x) | 0
      );
    } else {
      rJ(_, X, 16, 92, 50, 68, 32, 108);
      r7(c[ap >> 2] | 0, _, 1);
      mv(ab, 1);
      ml(ab, 0, ae, 382);
    }
    yi(yc(b, 0, 40912) | 0, 34200, U, 32) | 0;
    xv(
      2,
      40840,
      41288,
      ((x = i),
      (i = (i + 16) | 0),
      (c[x >> 2] = c[U >> 2]),
      (c[(x + 8) >> 2] = 2),
      x) | 0
    );
    _ = (ae + 488) | 0;
    V = _;
    nW(V);
    Z = r0(c[U >> 2] | 0, 2, 0) | 0;
    if ((Z | 0) != 0) {
      rJ(Z, _, 74, 38, 112, 102, 88, 2);
      r7(c[ap >> 2] | 0, Z, 1);
      nN(V, c[Y >> 2] | 0, 160);
      hK(c[Y >> 2] | 0, _, 4);
    }
    yi(yc(b, 0, 41176) | 0, 34200, T, 64) | 0;
    xv(
      2,
      41120,
      40944,
      ((x = i),
      (i = (i + 16) | 0),
      (c[x >> 2] = c[T >> 2]),
      (c[(x + 8) >> 2] = 4),
      x) | 0
    );
    a[(ae + 3096) | 0] = 0;
    Y = (ae + 340) | 0;
    Z = Y;
    nq(Z);
    U = r0(c[T >> 2] | 0, 4, 0) | 0;
    if ((U | 0) != 0) {
      rJ(U, Y, 40, 126, 44, 138, 124, 4);
      r7(c[ap >> 2] | 0, U, 1);
      nr(Z, 0, 1);
      nr(Z, 1, 1);
      nr(Z, 2, 1);
      nk(Z, 0, _, 112);
      nk(Z, 1, ae, 32);
      nk(Z, 2, ae, 174);
    }
    yi(yc(b, 0, 41472) | 0, 34200, S, 96) | 0;
    xv(
      2,
      41400,
      41288,
      ((x = i),
      (i = (i + 16) | 0),
      (c[x >> 2] = c[S >> 2]),
      (c[(x + 8) >> 2] = 4),
      x) | 0
    );
    Z = (ae + 424) | 0;
    U = Z;
    nH(U);
    c[(ae + 432) >> 2] = ae;
    c[(ae + 436) >> 2] = 252;
    c[(ae + 460) >> 2] = ae;
    c[(ae + 464) >> 2] = 262;
    c[(ae + 472) >> 2] = ae;
    c[(ae + 476) >> 2] = 192;
    Y = r0(c[S >> 2] | 0, 4, 0) | 0;
    if ((Y | 0) != 0) {
      rJ(Y, Z, 56, 68, 18, 98, 36, 112);
      r7(c[ap >> 2] | 0, Y, 1);
      nJ(U, 3, -103);
    }
    U = (ae + 564) | 0;
    Y = U;
    dH(Y);
    dE(Y, _, 110);
    Y = (ae + 844) | 0;
    c[Y >> 2] = 0;
    do {
      if (((c[aj >> 2] & 1) | 0) != 0) {
        Z = yc(b, 0, 22032) | 0;
        if ((Z | 0) == 0) {
          break;
        }
        yl(Z, 22008, O, 1) | 0;
        if ((c[O >> 2] | 0) == 0) {
          break;
        }
        ym(Z, 21928, L, 0) | 0;
        ym(Z, 21792, M, 21624) | 0;
        yi(Z, 21376, N, 0) | 0;
        yl(Z, 21264, P, 0) | 0;
        yl(Z, 21184, R, 1) | 0;
        if ((yl(Z, 21096, Q, 0) | 0) == 0) {
          aq = c[Q >> 2] | 0;
        } else {
          c[Q >> 2] = -1;
          aq = -1;
        }
        Z = c[L >> 2] | 0;
        S = c[M >> 2] | 0;
        T = c[R >> 2] | 0;
        aa = c[N >> 2] | 0;
        ao = c[P >> 2] | 0;
        xv(
          2,
          21040,
          20880,
          ((x = i),
          (i = (i + 48) | 0),
          (c[x >> 2] = (Z | 0) != 0 ? Z : 32456),
          (c[(x + 8) >> 2] = S),
          (c[(x + 16) >> 2] = aq),
          (c[(x + 24) >> 2] = T),
          (c[(x + 32) >> 2] = aa),
          (c[(x + 40) >> 2] = ao),
          x) | 0
        );
        ao = ct() | 0;
        c[Y >> 2] = ao;
        if ((ao | 0) == 0) {
          xt(
            0,
            20824,
            ((x = i),
            (i = (i + 1) | 0),
            (i = ((i + 7) >> 3) << 3),
            (c[x >> 2] = 0),
            x) | 0
          );
          break;
        }
        if ((cu(ao, c[L >> 2] | 0) | 0) != 0) {
          xt(
            0,
            20712,
            ((x = i), (i = (i + 8) | 0), (c[x >> 2] = c[L >> 2]), x) | 0
          );
        }
        ao = c[M >> 2] | 0;
        do {
          if ((aP(ao | 0, 21624) | 0) == 0) {
            cy(c[Y >> 2] | 0, 0);
          } else {
            if ((aP(ao | 0, 41816) | 0) == 0) {
              cy(c[Y >> 2] | 0, 1);
              break;
            } else {
              xt(
                0,
                41688,
                ((x = i), (i = (i + 8) | 0), (c[x >> 2] = ao), x) | 0
              );
              break;
            }
          }
        } while (0);
        ao = c[Y >> 2] | 0;
        if ((c[P >> 2] | 0) == 0) {
          aa = c[N >> 2] | 0;
          cw(ao, aa) | 0;
        } else {
          cv(ao);
        }
        ao = c[Q >> 2] | 0;
        if ((ao | 0) > -1) {
          cx(c[Y >> 2] | 0, ao);
        }
        cz(c[Y >> 2] | 0, c[R >> 2] | 0);
      }
    } while (0);
    R = (ae + 848) | 0;
    eq(R);
    d2(R, ae, 460);
    Y = yc(b, 0, 23088) | 0;
    if ((Y | 0) != 0) {
      ym(Y, 33992, H, 0) | 0;
      yj(Y, 22784, I, 500) | 0;
      yi(Y, 22552, J, 44100) | 0;
      yi(Y, 22456, K, 0) | 0;
      Y = c[J >> 2] | 0;
      Q = c[K >> 2] | 0;
      N = c[H >> 2] | 0;
      xv(
        2,
        22320,
        22160,
        ((x = i),
        (i = (i + 32) | 0),
        (c[x >> 2] = c[I >> 2]),
        (c[(x + 8) >> 2] = Y),
        (c[(x + 16) >> 2] = Q),
        (c[(x + 24) >> 2] = (N | 0) != 0 ? N : 32456),
        x) | 0
      );
      N = c[H >> 2] | 0;
      do {
        if ((N | 0) != 0) {
          if ((er(R, N, c[J >> 2] | 0) | 0) == 0) {
            break;
          }
          xt(
            0,
            22096,
            ((x = i), (i = (i + 8) | 0), (c[x >> 2] = c[H >> 2]), x) | 0
          );
        }
      } while (0);
      es(R, c[K >> 2] | 0);
      d1(R, c[I >> 2] | 0);
    }
    I = xb(b, c[10740] | 0) | 0;
    R = (ae + 3028) | 0;
    c[R >> 2] = I;
    if ((I | 0) != 0) {
      y4(I, U, 70);
      y5(c[R >> 2] | 0, ae, 2);
      y3(c[R >> 2] | 0, ae, 112);
    }
    U = (ae + 4) | 0;
    c[U >> 2] = 0;
    I = yc(b, 0, 25880) | 0;
    ym(I, 25608, G, 25328) | 0;
    K = c[10738] | 0;
    L1424: do {
      if ((K | 0) == 0) {
        ar = I;
        as = c[G >> 2] | 0;
      } else {
        if ((I | 0) == 0) {
          at = K;
        } else {
          H = I;
          J = K;
          while (1) {
            N = c[G >> 2] | 0;
            if ((aP(J | 0, N | 0) | 0) == 0) {
              ar = H;
              as = N;
              break L1424;
            }
            N = yc(b, H, 25880) | 0;
            ym(N, 25608, G, 25328) | 0;
            Q = c[10738] | 0;
            if ((N | 0) == 0) {
              at = Q;
              break;
            } else {
              H = N;
              J = Q;
            }
          }
        }
        c[G >> 2] = at;
        ar = 0;
        as = at;
      }
    } while (0);
    xv(2, 25232, 25128, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = as), x) | 0);
    as = c[G >> 2] | 0;
    L1433: do {
      if ((aP(as | 0, 25040) | 0) == 0) {
        G = qF(ar) | 0;
        c[U >> 2] = G;
        if ((G | 0) == 0) {
          au = 1157;
          break;
        }
        yl(ar, 23728, E, 0) | 0;
        yj(ar, 31664, F, 2) | 0;
        G = (c[E >> 2] | 0) != 0 ? 23560 : 23488;
        xv(
          2,
          25232,
          23216,
          ((x = i),
          (i = (i + 16) | 0),
          (c[x >> 2] = c[F >> 2]),
          (c[(x + 8) >> 2] = G),
          x) | 0
        );
        if ((c[E >> 2] | 0) != 0) {
          G = c[((c[U >> 2] | 0) + 32) >> 2] | 0;
          qd(G, _, nM(V, c[F >> 2] | 0) | 0);
        }
        G = c[ad >> 2] | 0;
        r7(G, qK(c[U >> 2] | 0) | 0, 0);
        G = c[ap >> 2] | 0;
        r7(G, qL(c[U >> 2] | 0) | 0, 0);
        G = c[aj >> 2] | 0;
        do {
          if (((G & 1) | 0) == 0) {
            if (((G & 2) | 0) == 0) {
              break;
            }
            a[al] = a[al] & -4;
          } else {
            a[ac] = a[ac] & -49;
          }
        } while (0);
        dG(af, 0);
        au = 1156;
      } else {
        if ((aP(as | 0, 24984) | 0) == 0) {
          G = py(ar) | 0;
          c[U >> 2] = G;
          if ((G | 0) == 0) {
            au = 1157;
            break;
          }
          yl(ar, 23728, C, 0) | 0;
          yj(ar, 31664, D, 2) | 0;
          G = (c[C >> 2] | 0) != 0 ? 23560 : 23488;
          xv(
            2,
            25232,
            23656,
            ((x = i),
            (i = (i + 16) | 0),
            (c[x >> 2] = c[D >> 2]),
            (c[(x + 8) >> 2] = G),
            x) | 0
          );
          if ((c[C >> 2] | 0) != 0) {
            G = c[((c[U >> 2] | 0) + 32) >> 2] | 0;
            pe(G, _, nM(V, c[D >> 2] | 0) | 0);
          }
          G = c[ad >> 2] | 0;
          r7(G, qK(c[U >> 2] | 0) | 0, 0);
          G = c[ap >> 2] | 0;
          r7(G, qL(c[U >> 2] | 0) | 0, 0);
          G = c[aj >> 2] | 0;
          do {
            if (((G & 1) | 0) == 0) {
              if (((G & 2) | 0) == 0) {
                break;
              }
              a[al] = a[al] & -4;
            } else {
              a[ac] = a[ac] & -49;
            }
          } while (0);
          dG(af, 0);
          au = 1156;
          break;
        }
        if ((aP(as | 0, 25328) | 0) == 0) {
          G = pi(ar) | 0;
          c[U >> 2] = G;
          if ((G | 0) == 0) {
            au = 1157;
            break;
          }
          at = c[ad >> 2] | 0;
          r7(at, qK(G) | 0, 0);
          G = c[ap >> 2] | 0;
          r7(G, qL(c[U >> 2] | 0) | 0, 0);
          G = c[aj >> 2] | 0;
          do {
            if (((G & 1) | 0) == 0) {
              if (((G & 2) | 0) == 0) {
                break;
              }
              a[al] = (a[al] & -4) | 2;
            } else {
              a[ac] = (a[ac] & -49) | 32;
            }
          } while (0);
          dG(af, 2);
          au = 1156;
          break;
        }
        if ((aP(as | 0, 24864) | 0) == 0) {
          G = pQ(ar) | 0;
          c[U >> 2] = G;
          if ((G | 0) == 0) {
            au = 1157;
            break;
          }
          at = c[ad >> 2] | 0;
          r7(at, qK(G) | 0, 0);
          G = c[ap >> 2] | 0;
          r7(G, qL(c[U >> 2] | 0) | 0, 0);
          G = c[aj >> 2] | 0;
          do {
            if (((G & 1) | 0) == 0) {
              if (((G & 2) | 0) == 0) {
                break;
              }
              a[al] = a[al] | 3;
            } else {
              a[ac] = a[ac] | 48;
            }
          } while (0);
          dG(af, 3);
          au = 1156;
          break;
        }
        if ((aP(as | 0, 24816) | 0) == 0) {
          G = p7(ar) | 0;
          c[U >> 2] = G;
          if ((G | 0) == 0) {
            au = 1157;
            break;
          }
          at = c[ad >> 2] | 0;
          r7(at, qK(G) | 0, 0);
          G = c[ap >> 2] | 0;
          r7(G, qL(c[U >> 2] | 0) | 0, 0);
          G = c[aj >> 2] | 0;
          do {
            if (((G & 1) | 0) == 0) {
              if (((G & 2) | 0) == 0) {
                break;
              }
              a[al] = a[al] | 3;
            } else {
              a[ac] = a[ac] | 48;
            }
          } while (0);
          dG(af, 3);
          au = 1156;
          break;
        }
        if ((aP(as | 0, 24736) | 0) == 0) {
          G = qg(ar) | 0;
          c[U >> 2] = G;
          if ((G | 0) == 0) {
            au = 1157;
            break;
          }
          at = c[ad >> 2] | 0;
          r7(at, qK(G) | 0, 0);
          G = c[ap >> 2] | 0;
          r7(G, qL(c[U >> 2] | 0) | 0, 0);
          G = c[aj >> 2] | 0;
          do {
            if (((G & 1) | 0) == 0) {
              if (((G & 2) | 0) == 0) {
                break;
              }
              a[al] = (a[al] & -4) | 2;
            } else {
              a[ac] = (a[ac] & -49) | 32;
            }
          } while (0);
          dG(af, 2);
          au = 1156;
          break;
        }
        if ((aP(as | 0, 24632) | 0) == 0) {
          G = qn(ar) | 0;
          c[U >> 2] = G;
          if ((G | 0) == 0) {
            au = 1157;
            break;
          }
          at = c[ad >> 2] | 0;
          r7(at, qK(G) | 0, 0);
          G = c[ap >> 2] | 0;
          r7(G, qL(c[U >> 2] | 0) | 0, 0);
          G = c[aj >> 2] | 0;
          do {
            if (((G & 1) | 0) == 0) {
              if (((G & 2) | 0) == 0) {
                break;
              }
              a[al] = (a[al] & -4) | 2;
            } else {
              a[ac] = (a[ac] & -49) | 32;
            }
          } while (0);
          dG(af, 2);
          au = 1156;
          break;
        }
        do {
          if ((aP(as | 0, 24384) | 0) != 0) {
            if ((aP(as | 0, 24112) | 0) == 0) {
              break;
            }
            xt(0, 24e3, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = as), x) | 0);
            au = 1156;
            break L1433;
          }
        } while (0);
        G = q0(ar) | 0;
        c[U >> 2] = G;
        if ((G | 0) == 0) {
          au = 1157;
          break;
        }
        at = c[ad >> 2] | 0;
        r7(at, qK(G) | 0, 0);
        G = c[ap >> 2] | 0;
        r7(G, qL(c[U >> 2] | 0) | 0, 0);
        G = c[aj >> 2] | 0;
        do {
          if (((G & 1) | 0) == 0) {
            if (((G & 2) | 0) == 0) {
              break;
            }
            a[al] = (a[al] & -4) | 2;
          } else {
            a[ac] = (a[ac] & -49) | 32;
          }
        } while (0);
        dG(af, 2);
        au = 1156;
      }
    } while (0);
    if ((au | 0) == 1156) {
      if ((c[U >> 2] | 0) == 0) {
        au = 1157;
      } else {
        au = 1158;
      }
    }
    if ((au | 0) == 1157) {
      xt(
        0,
        23864,
        ((x = i),
        (i = (i + 1) | 0),
        (i = ((i + 7) >> 3) << 3),
        (c[x >> 2] = 0),
        x) | 0
      );
      if ((c[U >> 2] | 0) != 0) {
        au = 1158;
      }
    }
    do {
      if ((au | 0) == 1158) {
        ac = c[ad >> 2] | 0;
        w9(ac, ar, am) | 0;
        ac = c[ad >> 2] | 0;
        xa(ac, ar) | 0;
        ac = c[ad >> 2] | 0;
        xk(ac, ar) | 0;
        ac = c[R >> 2] | 0;
        if ((ac | 0) == 0) {
          break;
        }
        qJ(c[U >> 2] | 0, ac);
      }
    } while (0);
    U = c[R >> 2] | 0;
    if ((U | 0) != 0) {
      zl(U, 640, 480) | 0;
      U = c[R >> 2] | 0;
      zn(U, 35224, 39752) | 0;
    }
    c[(ae + 12) >> 2] = 0;
    U = (ae + 8) | 0;
    c[U >> 2] = tx() | 0;
    R = yc(b, 0, 26144) | 0;
    if ((R | 0) != 0) {
      ar = R;
      do {
        do {
          if ((w8(ar, B) | 0) == 0) {
            R = c[B >> 2] | 0;
            if ((R | 0) == 0) {
              break;
            }
            am = c[U >> 2] | 0;
            ty(am, R) | 0;
            if ((tg(c[B >> 2] | 0) | 0) >>> 0 <= 127) {
              break;
            }
            c[ai >> 2] = (c[ai >> 2] | 0) + 1;
          } else {
            xt(
              0,
              26072,
              ((x = i),
              (i = (i + 1) | 0),
              (i = ((i + 7) >> 3) << 3),
              (c[x >> 2] = 0),
              x) | 0
            );
          }
        } while (0);
        ar = yc(b, ar, 26144) | 0;
      } while ((ar | 0) != 0);
    }
    ar = (ae + 3012) | 0;
    c[ar >> 2] = 0;
    ai = yc(b, 0, 27488) | 0;
    do {
      if ((ai | 0) != 0) {
        yi(ai, 34200, y, 1008) | 0;
        yj(ai, 31664, z, 6) | 0;
        yl(ai, 27216, v, 0) | 0;
        yl(ai, 26840, w, 0) | 0;
        B = A | 0;
        yj(ai, 28968, B, 65535) | 0;
        R = (A + 4) | 0;
        yj(ai, 28480, R, 65535) | 0;
        am = (A + 8) | 0;
        yj(ai, 26712, am, 65535) | 0;
        au = (A + 12) | 0;
        yj(ai, 26600, au, 65535) | 0;
        ac = c[z >> 2] | 0;
        al = c[v >> 2] | 0;
        aj = ((c[w >> 2] | 0) == 0) | 0;
        as = c[B >> 2] | 0;
        D = c[R >> 2] | 0;
        C = c[am >> 2] | 0;
        F = c[au >> 2] | 0;
        xv(
          2,
          26456,
          26360,
          ((x = i),
          (i = (i + 64) | 0),
          (c[x >> 2] = c[y >> 2]),
          (c[(x + 8) >> 2] = ac),
          (c[(x + 16) >> 2] = al),
          (c[(x + 24) >> 2] = aj),
          (c[(x + 32) >> 2] = as),
          (c[(x + 40) >> 2] = D),
          (c[(x + 48) >> 2] = C),
          (c[(x + 56) >> 2] = F),
          x) | 0
        );
        F = q1(c[y >> 2] | 0) | 0;
        c[ar >> 2] = F;
        if ((F | 0) == 0) {
          xt(
            0,
            26224,
            ((x = i),
            (i = (i + 1) | 0),
            (i = ((i + 7) >> 3) << 3),
            (c[x >> 2] = 0),
            x) | 0
          );
          break;
        } else {
          q5(F, c[ap >> 2] | 0);
          qZ(c[ar >> 2] | 0, c[U >> 2] | 0);
          q_(c[ar >> 2] | 0, 0, c[B >> 2] | 0);
          q_(c[ar >> 2] | 0, 1, c[R >> 2] | 0);
          q_(c[ar >> 2] | 0, 2, c[am >> 2] | 0);
          q_(c[ar >> 2] | 0, 3, c[au >> 2] | 0);
          oc(((c[ar >> 2] | 0) + 28) | 0, 1193182);
          od(((c[ar >> 2] | 0) + 28) | 0, ((c[v >> 2] | 0) != 0) | 0);
          oe(((c[ar >> 2] | 0) + 28) | 0, ((c[w >> 2] | 0) != 0) | 0);
          au = ((c[ar >> 2] | 0) + 28) | 0;
          n9(au, _, nM(V, c[z >> 2] | 0) | 0);
          oa(((c[ar >> 2] | 0) + 28) | 0, X, 284);
          mm(ab, 2, ((c[ar >> 2] | 0) + 28) | 0, 76);
          au = ((c[ar >> 2] | 0) + 28) | 0;
          c[(ae + 240) >> 2] = au;
          c[(ae + 244) >> 2] = 298;
          c[(ae + 232) >> 2] = au;
          c[(ae + 236) >> 2] = 428;
          c[(ae + 224) >> 2] = ae;
          c[(ae + 228) >> 2] = 82;
          c[(ae + 216) >> 2] = ae;
          c[(ae + 220) >> 2] = 132;
          break;
        }
      }
    } while (0);
    ar = (ae + 3016) | 0;
    c[ar >> 2] = 0;
    ab = yc(b, 0, 29192) | 0;
    do {
      if ((ab | 0) != 0) {
        yi(ab, 34200, q, 800) | 0;
        yj(ab, 31664, p, 5) | 0;
        z = r | 0;
        yj(ab, 28968, z, 65535) | 0;
        w = (r + 4) | 0;
        yj(ab, 28480, w, 65535) | 0;
        yj(ab, 28336, t, 17) | 0;
        ym(ab, 28152, u, 44448) | 0;
        yj(ab, 27976, s, 0) | 0;
        v = c[p >> 2] | 0;
        y = c[z >> 2] | 0;
        ai = c[w >> 2] | 0;
        A = c[t >> 2] | 0;
        au = c[s >> 2] | 0;
        am = c[u >> 2] | 0;
        xv(
          2,
          27800,
          27688,
          ((x = i),
          (i = (i + 56) | 0),
          (c[x >> 2] = c[q >> 2]),
          (c[(x + 8) >> 2] = v),
          (c[(x + 16) >> 2] = y),
          (c[(x + 24) >> 2] = ai),
          (c[(x + 32) >> 2] = A),
          (c[(x + 40) >> 2] = au),
          (c[(x + 48) >> 2] = am),
          x) | 0
        );
        am = rh(c[q >> 2] | 0) | 0;
        c[ar >> 2] = am;
        if ((am | 0) == 0) {
          xt(
            0,
            27592,
            ((x = i),
            (i = (i + 1) | 0),
            (i = ((i + 7) >> 3) << 3),
            (c[x >> 2] = 0),
            x) | 0
          );
          break;
        } else {
          rk(am, c[ap >> 2] | 0);
          rf(c[ar >> 2] | 0, c[U >> 2] | 0);
          rg(c[ar >> 2] | 0, 0, c[z >> 2] | 0);
          rg(c[ar >> 2] | 0, 1, c[w >> 2] | 0);
          w = c[ar >> 2] | 0;
          z = c[u >> 2] | 0;
          rl(w, z, zN(z | 0) | 0);
          rd(c[ar >> 2] | 0, c[s >> 2] | 0);
          re(c[ar >> 2] | 0, c[t >> 2] | 0);
          z = c[ar >> 2] | 0;
          rb(z, _, nM(V, c[p >> 2] | 0) | 0);
          rc(c[ar >> 2] | 0, X, 286);
          z = c[ar >> 2] | 0;
          c[(ae + 312) >> 2] = z;
          c[(ae + 316) >> 2] = 550;
          c[(ae + 304) >> 2] = z;
          c[(ae + 308) >> 2] = 184;
          c[(ae + 296) >> 2] = ae;
          c[(ae + 300) >> 2] = 90;
          c[(ae + 288) >> 2] = ae;
          c[(ae + 292) >> 2] = 10;
          break;
        }
      }
    } while (0);
    zP((ae + 3032) | 0, 0, 16);
    ar = yc(b, 0, 31848) | 0;
    L1545: do {
      if ((ar | 0) != 0) {
        X = 0;
        p = ar;
        while (1) {
          t = c[(832 + (X << 2)) >> 2] | 0;
          s = c[(816 + (X << 2)) >> 2] | 0;
          u = (X + 1) | 0;
          U = (af + 3032 + (X << 2)) | 0;
          q = p;
          while (1) {
            if ((yi(q, 34200, g, t) | 0) != 0) {
              yi(q, 31752, g, t) | 0;
            }
            yj(q, 31664, h, s) | 0;
            ym(q, 31512, o, 31376) | 0;
            yj(q, 31256, j, 1) | 0;
            yj(q, 31e3, k, c[j >> 2] | 0) | 0;
            yj(q, 30544, l, c[j >> 2] | 0) | 0;
            ym(q, 33992, m, 0) | 0;
            ym(q, 30408, n, 0) | 0;
            ab = c[g >> 2] | 0;
            r = c[h >> 2] | 0;
            z = c[k >> 2] | 0;
            w = c[l >> 2] | 0;
            am = c[o >> 2] | 0;
            xv(
              2,
              30200,
              29944,
              ((x = i),
              (i = (i + 48) | 0),
              (c[x >> 2] = u),
              (c[(x + 8) >> 2] = ab),
              (c[(x + 16) >> 2] = r),
              (c[(x + 24) >> 2] = z),
              (c[(x + 32) >> 2] = w),
              (c[(x + 40) >> 2] = am),
              x) | 0
            );
            am = c[m >> 2] | 0;
            if ((am | 0) != 0) {
              xv(
                2,
                30200,
                29808,
                ((x = i),
                (i = (i + 16) | 0),
                (c[x >> 2] = u),
                (c[(x + 8) >> 2] = am),
                x) | 0
              );
            }
            av = sM(c[g >> 2] | 0, 0) | 0;
            c[U >> 2] = av;
            if ((av | 0) != 0) {
              break;
            }
            am = c[h >> 2] | 0;
            w = c[m >> 2] | 0;
            xt(
              0,
              29656,
              ((x = i),
              (i = (i + 24) | 0),
              (c[x >> 2] = c[g >> 2]),
              (c[(x + 8) >> 2] = am),
              (c[(x + 16) >> 2] = (w | 0) == 0 ? 32456 : w),
              x) | 0
            );
            w = yc(b, q, 31848) | 0;
            if ((w | 0) == 0) {
              break L1545;
            } else {
              q = w;
            }
          }
          s = c[m >> 2] | 0;
          do {
            if ((s | 0) != 0) {
              if ((sN(av, s) | 0) == 0) {
                break;
              }
              xt(
                0,
                31992,
                ((x = i), (i = (i + 8) | 0), (c[x >> 2] = c[m >> 2]), x) | 0
              );
            }
          } while (0);
          s = c[n >> 2] | 0;
          do {
            if ((s | 0) != 0) {
              if ((sO(c[U >> 2] | 0, s) | 0) == 0) {
                break;
              }
              xt(
                0,
                29528,
                ((x = i), (i = (i + 8) | 0), (c[x >> 2] = c[n >> 2]), x) | 0
              );
            }
          } while (0);
          if ((m9(((c[U >> 2] | 0) + 48) | 0, c[o >> 2] | 0) | 0) != 0) {
            xt(
              0,
              29336,
              ((x = i), (i = (i + 8) | 0), (c[x >> 2] = c[o >> 2]), x) | 0
            );
          }
          mY(((c[U >> 2] | 0) + 48) | 0, c[k >> 2] | 0, c[l >> 2] | 0);
          s = ((c[U >> 2] | 0) + 48) | 0;
          mT(s, _, nM(V, c[h >> 2] | 0) | 0);
          s = c[ap >> 2] | 0;
          r7(s, ss(c[U >> 2] | 0) | 0, 0);
          s = yc(b, q, 31848) | 0;
          if (((s | 0) == 0) | (u >>> 0 > 3)) {
            break;
          } else {
            X = u;
            p = s;
          }
        }
      }
    } while (0);
    zP((ae + 3048) | 0, 0, 16);
    h = yc(b, 0, 34464) | 0;
    L1570: do {
      if ((h | 0) != 0) {
        V = 0;
        _ = h;
        while (1) {
          l = c[(848 + (V << 2)) >> 2] | 0;
          k = (V + 1) | 0;
          o = (af + 3048 + (V << 2)) | 0;
          n = _;
          while (1) {
            yi(n, 34200, e, l) | 0;
            ym(n, 33992, f, 0) | 0;
            m = c[e >> 2] | 0;
            av = c[f >> 2] | 0;
            xv(
              2,
              33592,
              33160,
              ((x = i),
              (i = (i + 24) | 0),
              (c[x >> 2] = k),
              (c[(x + 8) >> 2] = m),
              (c[(x + 16) >> 2] = (av | 0) == 0 ? 32456 : av),
              x) | 0
            );
            aw = sB(c[e >> 2] | 0) | 0;
            c[o >> 2] = aw;
            if ((aw | 0) != 0) {
              break;
            }
            xt(0, 32184, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = k), x) | 0);
            av = yc(b, n, 34464) | 0;
            if ((av | 0) == 0) {
              break L1570;
            } else {
              n = av;
            }
          }
          l = c[f >> 2] | 0;
          do {
            if ((l | 0) != 0) {
              if ((sC(aw, l) | 0) == 0) {
                break;
              }
              xt(
                0,
                31992,
                ((x = i), (i = (i + 8) | 0), (c[x >> 2] = c[f >> 2]), x) | 0
              );
            }
          } while (0);
          l = c[ap >> 2] | 0;
          r7(l, sp(c[o >> 2] | 0) | 0, 0);
          l = yc(b, n, 34464) | 0;
          if (((l | 0) == 0) | (k >>> 0 > 3)) {
            break;
          } else {
            V = k;
            _ = l;
          }
        }
      }
    } while (0);
    ap = (ae + 3020) | 0;
    c[ap >> 2] = 0;
    f = yc(b, 0, 34720) | 0;
    do {
      if ((f | 0) != 0) {
        aw = cU(f) | 0;
        c[ap >> 2] = aw;
        if ((aw | 0) == 0) {
          break;
        }
        e = cX(aw) | 0;
        if ((e | 0) == 0) {
          break;
        }
        r7(c[ad >> 2] | 0, e, 0);
      }
    } while (0);
    ap = (ae + 3024) | 0;
    c[ap >> 2] = 0;
    f = yc(b, 0, 35144) | 0;
    do {
      if ((f | 0) != 0) {
        e = ex(f) | 0;
        c[ap >> 2] = e;
        if ((e | 0) == 0) {
          break;
        }
        aw = d3(e) | 0;
        if ((aw | 0) != 0) {
          r7(c[ad >> 2] | 0, aw, 0);
        }
        aw = d4(c[ap >> 2] | 0) | 0;
        if ((aw | 0) == 0) {
          break;
        }
        r7(c[ad >> 2] | 0, aw, 0);
      }
    } while (0);
    xk(c[ad >> 2] | 0, b) | 0;
    r8(c[ad >> 2] | 0, 1040384);
    zP((ae + 3144) | 0, 0, 16);
    c[(ae + 3116) >> 2] = 0;
    c[(ae + 3120) >> 2] = 0;
    xV((ae + 3124) | 0) | 0;
    c[W >> 2] = 0;
    c[(ae + 3160) >> 2] = 0;
    c[(ae + 3164) >> 2] = 0;
    ag = af;
    i = d;
    return ag | 0;
  }
  function c4(a, b) {
    a = a | 0;
    b = b | 0;
    return c[(43256 + ((b & 255) << 2)) >> 2] | 0;
  }
  function c5(a) {
    a = a | 0;
    return c[(a + 3164) >> 2] | 0;
  }
  function c6(a, b) {
    a = a | 0;
    b = b | 0;
    c[(a + 3076) >> 2] = b;
    return;
  }
  function c7(a) {
    a = a | 0;
    return c[(a + 3076) >> 2] | 0;
  }
  function c8(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0;
    do {
      if (b >>> 0 > 3) {
        e = 1;
      } else {
        f = c[(a + 3032 + (b << 2)) >> 2] | 0;
        if ((f | 0) == 0) {
          e = 1;
          break;
        }
        e = ((sN(f, d) | 0) != 0) | 0;
      }
    } while (0);
    return e | 0;
  }
  function c9(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0;
    e = xP(32768, d) | 0;
    do {
      if (b >>> 0 > 3) {
        f = 1;
      } else {
        d = c[(a + 3032 + (b << 2)) >> 2] | 0;
        if ((d | 0) == 0) {
          f = 1;
          break;
        }
        f = ((sN(d, e) | 0) != 0) | 0;
      }
    } while (0);
    zI(e);
    return f | 0;
  }
  function da(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0;
    do {
      if (b >>> 0 > 3) {
        e = 1;
      } else {
        f = c[(a + 3048 + (b << 2)) >> 2] | 0;
        if ((f | 0) == 0) {
          e = 1;
          break;
        }
        e = ((sC(f, d) | 0) != 0) | 0;
      }
    } while (0);
    return e | 0;
  }
  function db(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0;
    e = xP(32768, d) | 0;
    do {
      if (b >>> 0 > 3) {
        f = 1;
      } else {
        d = c[(a + 3048 + (b << 2)) >> 2] | 0;
        if ((d | 0) == 0) {
          f = 1;
          break;
        }
        f = ((sC(d, e) | 0) != 0) | 0;
      }
    } while (0);
    zI(e);
    return f | 0;
  }
  function dc(b, d, e) {
    b = b | 0;
    d = d | 0;
    e = e | 0;
    var f = 0;
    b = (43256 + ((d & 255) << 2)) | 0;
    zI(c[b >> 2] | 0);
    do {
      if ((e | 0) == 0) {
        f = 0;
      } else {
        if ((a[e] | 0) == 0) {
          f = 0;
          break;
        }
        f = xQ(e) | 0;
      }
    } while (0);
    c[b >> 2] = f;
    return;
  }
  function dd(a, b) {
    a = a | 0;
    b = b | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0;
    a = i;
    i = (i + 272) | 0;
    d = a | 0;
    e = (a + 8) | 0;
    f = c[(43256 + ((b & 255) << 2)) >> 2] | 0;
    if ((f | 0) == 0) {
      g = 0;
      i = a;
      return g | 0;
    }
    wu(e, f);
    f = (wT(e, d) | 0) != 0;
    g = f & ((c[d >> 2] | 0) != 0) & 1;
    i = a;
    return g | 0;
  }
  function de(a) {
    a = a | 0;
    var b = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0;
    b = a | 0;
    a = 0;
    while (1) {
      if (a >>> 0 >= 32) {
        e = 0;
        f = 1256;
        break;
      }
      g = (a >>> 0 < 16 ? 61440 : 49152) | ((a << 8) & 3840);
      h = c[b >> 2] | 0;
      i = g << 4;
      j = c[(h + 80) >> 2] | 0;
      k = j & (i | 4);
      l = k | 1;
      m = c[(h + 76) >> 2] | 0;
      if (l >>> 0 < m >>> 0) {
        n = c[(h + 72) >> 2] | 0;
        o = ((d[(n + l) | 0] | 0) << 8) | (d[(n + k) | 0] | 0);
        p = h;
        q = j;
        r = m;
      } else {
        m = b8[c[(h + 44) >> 2] & 255](c[(h + 32) >> 2] | 0, k) | 0;
        k = c[b >> 2] | 0;
        o = m;
        p = k;
        q = c[(k + 80) >> 2] | 0;
        r = c[(k + 76) >> 2] | 0;
      }
      k = q & (i | 6);
      i = k | 1;
      if (i >>> 0 < r >>> 0) {
        m = c[(p + 72) >> 2] | 0;
        s = ((d[(m + i) | 0] | 0) << 8) | (d[(m + k) | 0] | 0);
      } else {
        s = b8[c[(p + 44) >> 2] & 255](c[(p + 32) >> 2] | 0, k) | 0;
      }
      if (((o << 16) >> 16 == 17232) & ((s << 16) >> 16 == 22597)) {
        e = g;
        f = 1255;
        break;
      } else {
        a = (a + 1) | 0;
      }
    }
    if ((f | 0) == 1255) {
      return e | 0;
    } else if ((f | 0) == 1256) {
      return e | 0;
    }
    return 0;
  }
  function df(b) {
    b = b | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      k = 0;
    e = i;
    if ((a[(b + 3098) | 0] | 0) == 0) {
      i = e;
      return;
    }
    f = b | 0;
    g = c[f >> 2] | 0;
    h = c[(g + 80) >> 2] & 1048560;
    if (h >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
      j = a[((c[(g + 72) >> 2] | 0) + h) | 0] | 0;
    } else {
      j = b8[c[(g + 36) >> 2] & 255](c[(g + 32) >> 2] | 0, h) | 0;
    }
    if ((j << 24) >> 24 != -22) {
      i = e;
      return;
    }
    j = c[f >> 2] | 0;
    f = c[(j + 80) >> 2] & 1048563;
    h = (f + 1) | 0;
    if (h >>> 0 < (c[(j + 76) >> 2] | 0) >>> 0) {
      g = c[(j + 72) >> 2] | 0;
      k = (d[(g + h) | 0] << 8) | d[(g + f) | 0];
    } else {
      k = b8[c[(j + 44) >> 2] & 255](c[(j + 32) >> 2] | 0, f) | 0;
    }
    if ((k << 16) >> 16 != -4096) {
      i = e;
      return;
    }
    k = de(b) | 0;
    if ((k | 0) == 0) {
      i = e;
      return;
    }
    dP(30792, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = k), x) | 0);
    f = (b + 16) | 0;
    sc(c[f >> 2] | 0, 1048561, 12);
    sc(c[f >> 2] | 0, 1048562, 0);
    sc(c[f >> 2] | 0, 1048563, k & 255);
    sc(c[f >> 2] | 0, 1048564, (k >>> 8) & 255);
    i = e;
    return;
  }
  function dg(a) {
    a = a | 0;
    var b = 0,
      d = 0;
    b = i;
    dP(
      28752,
      ((x = i),
      (i = (i + 1) | 0),
      (i = ((i + 7) >> 3) << 3),
      (c[x >> 2] = 0),
      x) | 0
    );
    df(a);
    ig(c[a >> 2] | 0);
    mS((a + 32) | 0);
    nx((a + 340) | 0);
    oi((a + 488) | 0);
    dI((a + 564) | 0);
    d = c[(a + 3032) >> 2] | 0;
    if ((d | 0) != 0) {
      sP(d);
    }
    d = c[(a + 3036) >> 2] | 0;
    if ((d | 0) != 0) {
      sP(d);
    }
    d = c[(a + 3040) >> 2] | 0;
    if ((d | 0) != 0) {
      sP(d);
    }
    d = c[(a + 3044) >> 2] | 0;
    if ((d | 0) != 0) {
      sP(d);
    }
    d = c[(a + 3012) >> 2] | 0;
    if ((d | 0) != 0) {
      q6(d);
    }
    d = c[(a + 3016) >> 2] | 0;
    if ((d | 0) != 0) {
      rm(d);
    }
    d = c[(a + 3024) >> 2] | 0;
    if ((d | 0) != 0) {
      ey(d);
    }
    d = c[(a + 3020) >> 2] | 0;
    if ((d | 0) == 0) {
      i = b;
      return;
    }
    cZ(d);
    i = b;
    return;
  }
  function dh(a) {
    a = a | 0;
    c[(a + 3120) >> 2] = c[(a + 3116) >> 2];
    xV((a + 3124) | 0) | 0;
    c[(a + 3136) >> 2] = 0;
    return;
  }
  function di(a, b) {
    a = a | 0;
    b = b | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      k = 0,
      l = 0;
    d = i;
    e = (b | 0) == 0 ? 4 : b;
    b = (a + 3128) | 0;
    f = c[a >> 2] | 0;
    if ((c[b >> 2] | 0) == 0) {
      ii(f, ((c[(a + 3136) >> 2] | 0) + e) | 0);
      g = 4;
    } else {
      ii(f, e);
      g = c[b >> 2] << 2;
    }
    b = (a + 3160) | 0;
    f = ((c[b >> 2] | 0) + e) | 0;
    c[b >> 2] = f;
    if (f >>> 0 < g >>> 0) {
      i = d;
      return;
    }
    c[b >> 2] = f - g;
    g = (a + 3116) | 0;
    c[g >> 2] = (c[g >> 2] | 0) + 1;
    f = (a + 3164) | 0;
    c[f >> 2] = (c[f >> 2] | 0) + 1;
    f = (a + 4) | 0;
    b = c[f >> 2] | 0;
    e = (b + 36) | 0;
    c[e >> 2] = (c[(b + 40) >> 2] | 0) + 1 + (c[e >> 2] | 0);
    c[((c[f >> 2] | 0) + 40) >> 2] = 0;
    ny((a + 340) | 0, 1);
    e = (a + 3144) | 0;
    b = ((c[e >> 2] | 0) + 1) | 0;
    c[e >> 2] = b;
    if (b >>> 0 <= 7) {
      i = d;
      return;
    }
    h = b & -8;
    j = (a + 3148) | 0;
    c[j >> 2] = (c[j >> 2] | 0) + h;
    c[e >> 2] = b & 7;
    dM((a + 564) | 0, h);
    b = c[(a + 844) >> 2] | 0;
    if ((b | 0) != 0) {
      cE(b, h);
    }
    m7((a + 32) | 0, h);
    qN(c[f >> 2] | 0, 0);
    f = (a + 3032) | 0;
    b = c[f >> 2] | 0;
    if ((b | 0) != 0) {
      no((b + 48) | 0, h);
    }
    b = (a + 3036) | 0;
    e = c[b >> 2] | 0;
    if ((e | 0) != 0) {
      no((e + 48) | 0, h);
    }
    e = (a + 3040) | 0;
    k = c[e >> 2] | 0;
    if ((k | 0) != 0) {
      no((k + 48) | 0, h);
    }
    k = (a + 3044) | 0;
    l = c[k >> 2] | 0;
    if ((l | 0) != 0) {
      no((l + 48) | 0, h);
    }
    h = c[j >> 2] | 0;
    if (h >>> 0 <= 1023) {
      i = d;
      return;
    }
    l = h & -1024;
    c[j >> 2] = h & 1023;
    h = (a + 3152) | 0;
    c[h >> 2] = (c[h >> 2] | 0) + l;
    j = c[(a + 3028) >> 2] | 0;
    if ((j | 0) != 0) {
      zt(j);
    }
    j = c[(a + 3012) >> 2] | 0;
    if ((j | 0) != 0) {
      os((j + 28) | 0, l);
    }
    j = c[(a + 3016) >> 2] | 0;
    if ((j | 0) != 0) {
      rn(j, l);
    }
    ew((a + 848) | 0, l);
    j = c[f >> 2] | 0;
    if ((j | 0) != 0) {
      sQ(j, l);
    }
    j = c[b >> 2] | 0;
    if ((j | 0) != 0) {
      sQ(j, l);
    }
    j = c[e >> 2] | 0;
    if ((j | 0) != 0) {
      sQ(j, l);
    }
    j = c[k >> 2] | 0;
    if ((j | 0) != 0) {
      sQ(j, l);
    }
    l = c[h >> 2] | 0;
    if (l >>> 0 <= 16383) {
      i = d;
      return;
    }
    c[h >> 2] = l & 16383;
    l = c[g >> 2] | 0;
    h = z4(xV((a + 3124) | 0) | 0, 0, 1193182, 0) | 0;
    j = z5(h, G, 1e6, 0) | 0;
    h = (a + 3120) | 0;
    k = (j + (c[h >> 2] | 0)) | 0;
    if (l >>> 0 >= k >>> 0) {
      j = (a + 3136) | 0;
      c[j >> 2] = (c[j >> 2] | 0) + 1;
      j = (l - k) | 0;
      c[g >> 2] = j;
      c[h >> 2] = 0;
      e = z4(j, 0, 1e6, 0) | 0;
      j = z5(e, G, 1193182, 0) | 0;
      e = j;
      if (e >>> 0 <= 25e3) {
        i = d;
        return;
      }
      xU(e) | 0;
      i = d;
      return;
    }
    c[g >> 2] = 0;
    g = (k - l) | 0;
    c[h >> 2] = g;
    l = (a + 3136) | 0;
    a = c[l >> 2] | 0;
    if ((a | 0) != 0) {
      c[l >> 2] = a - 1;
    }
    if (g >>> 0 <= 1193182) {
      i = d;
      return;
    }
    c[h >> 2] = 0;
    xt(
      2,
      37056,
      ((x = i),
      (i = (i + 1) | 0),
      (i = ((i + 7) >> 3) << 3),
      (c[x >> 2] = 0),
      x) | 0
    );
    i = d;
    return;
  }
  function dj(a, b) {
    a = a | 0;
    b = b | 0;
    var d = 0;
    if ((aP(b | 0, 27064) | 0) == 0) {
      hD(c[a >> 2] | 0);
      d = 0;
      return d | 0;
    }
    if ((aP(b | 0, 25488) | 0) == 0) {
      hF(c[a >> 2] | 0);
      d = 0;
      return d | 0;
    }
    if ((aP(b | 0, 24272) | 0) == 0) {
      hm(c[a >> 2] | 0);
      d = 0;
      return d | 0;
    }
    if ((aP(b | 0, 22688) | 0) == 0) {
      hR(c[a >> 2] | 0);
      d = 0;
      return d | 0;
    }
    if ((aP(b | 0, 21536) | 0) == 0) {
      hG(c[a >> 2] | 0);
      d = 0;
      return d | 0;
    }
    if ((aP(b | 0, 41616) | 0) == 0) {
      hH(c[a >> 2] | 0);
      d = 0;
      return d | 0;
    }
    if ((aP(b | 0, 40552) | 0) != 0) {
      d = 1;
      return d | 0;
    }
    hS(c[a >> 2] | 0);
    d = 0;
    return d | 0;
  }
  function dk(a, b) {
    a = a | 0;
    b = b | 0;
    var d = 0;
    d = i;
    c[(a + 3128) >> 2] = b;
    c[(a + 3136) >> 2] = 0;
    xv(2, 38968, 37976, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = b), x) | 0);
    i = d;
    return;
  }
  function dl(a, b) {
    a = a | 0;
    b = b | 0;
    return sa(c[(a + 16) >> 2] | 0, ((c[(a + 3092) >> 2] | 0) + b) | 0) | 0;
  }
  function dm(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    sd(c[(a + 16) >> 2] | 0, ((c[(a + 3092) >> 2] | 0) + b) | 0, d);
    return;
  }
  function dn(a, b) {
    a = a | 0;
    b = b | 0;
    return sa(c[(a + 16) >> 2] | 0, ((c[(a + 3088) >> 2] | 0) + b) | 0) | 0;
  }
  function dp(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    sd(c[(a + 16) >> 2] | 0, ((c[(a + 3088) >> 2] | 0) + b) | 0, d);
    return;
  }
  function dq(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    t6(b, c, d);
    return;
  }
  function dr(b) {
    b = b | 0;
    var c = 0,
      d = 0;
    if ((a[(b + 3006) | 0] | 0) < 0) {
      c = a[(b + 3004) | 0] | 0;
      return c | 0;
    } else {
      d = dF((b + 564) | 0) | 0;
      a[(b + 3005) | 0] = d;
      c = d;
      return c | 0;
    }
    return 0;
  }
  function ds(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0;
    e = (b + 3006) | 0;
    f = a[e] | 0;
    a[e] = d;
    e = (b + 564) | 0;
    dJ(e, d & 64);
    dK(e, ((d & 255) >>> 7) ^ 1);
    nr((b + 340) | 0, 2, d & 1);
    e = (f ^ d) & 255;
    if (((e & 2) | 0) != 0) {
      et((b + 848) | 0, d & 2);
    }
    if (((c[(b + 3e3) >> 2] & 1) | 0) == 0) {
      return;
    }
    if (((e & 8) | 0) == 0) {
      return;
    }
    e = c[(b + 844) >> 2] | 0;
    if ((e | 0) == 0) {
      return;
    }
    f = d & 8;
    cB(e, ((f >>> 3) ^ 1) & 255);
    if ((f | 0) == 0) {
      f = (b + 3128) | 0;
      c[(b + 3132) >> 2] = c[f >> 2];
      c[f >> 2] = 1;
      c[(b + 3136) >> 2] = 0;
      return;
    } else {
      c[(b + 3128) >> 2] = c[(b + 3132) >> 2];
      c[(b + 3136) >> 2] = 0;
      return;
    }
  }
  function dt(a, b) {
    a = a | 0;
    b = b | 0;
    return -1 | 0;
  }
  function du(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    return;
  }
  function dv(b) {
    b = b | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0;
    if (((c[(b + 3e3) >> 2] & 2) | 0) != 0) {
      if ((a[(b + 3006) | 0] & 8) == 0) {
        d = (b + 3007) | 0;
        e = a[d] | 0;
        return e | 0;
      } else {
        d = (b + 3008) | 0;
        e = a[d] | 0;
        return e | 0;
      }
    }
    f = c[(b + 844) >> 2] | 0;
    do {
      if ((f | 0) != 0) {
        g = ((cs(f) | 0) << 24) >> 24 == 0;
        h = (b + 3007) | 0;
        i = a[h] | 0;
        if (g) {
          a[h] = i & -17;
          g = (b + 3008) | 0;
          a[g] = a[g] & -17;
          break;
        } else {
          a[h] = i | 16;
          i = (b + 3008) | 0;
          a[i] = a[i] | 16;
          break;
        }
      }
    } while (0);
    if ((a[(b + 3006) | 0] & 4) == 0) {
      d = (b + 3008) | 0;
      e = a[d] | 0;
      return e | 0;
    } else {
      d = (b + 3007) | 0;
      e = a[d] | 0;
      return e | 0;
    }
    return 0;
  }
  function dw(b, c) {
    b = b | 0;
    c = c | 0;
    var d = 0;
    d = (b + 3096) | 0;
    do {
      if ((a[(b + 3097) | 0] | 0) == 0) {
        if (((a[d] | 0) != 0) | ((c << 24) >> 24 == 0)) {
          break;
        }
        mJ((b + 32) | 0, 1);
      }
    } while (0);
    a[d] = ((c << 24) >> 24 != 0) | 0;
    return;
  }
  function dx(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0;
    do {
      if (((c[(b + 3e3) >> 2] & 1) | 0) != 0) {
        e = (b + 3007) | 0;
        f = a[e] | 0;
        if ((d << 24) >> 24 == 0) {
          a[e] = f & -33;
          g = (b + 3008) | 0;
          a[g] = a[g] & -33;
        } else {
          a[e] = f | 32;
          f = (b + 3008) | 0;
          a[f] = a[f] | 32;
        }
        f = c[(b + 844) >> 2] | 0;
        if ((f | 0) == 0) {
          break;
        }
        cC(f, d);
      }
    } while (0);
    ev((b + 848) | 0, d);
    return;
  }
  function dy(b, c) {
    b = b | 0;
    c = c | 0;
    var d = 0;
    d = (c << 24) >> 24 != 0;
    a[(b + 3097) | 0] = d & 1;
    if (!d) {
      return;
    }
    mJ((b + 32) | 0, 0);
    return;
  }
  function dz(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0;
    e = i;
    i = (i + 8) | 0;
    f = e | 0;
    do {
      if ((dN(b, d, f) | 0) == 0) {
        g = a[f] | 0;
      } else {
        a[f] = -1;
        if ((d | 0) == 130) {
          h = ((c[(b + 3092) >> 2] | 0) >>> 16) & 255;
          a[f] = h;
          g = h;
          break;
        } else if ((d | 0) == 129) {
          h = ((c[(b + 3088) >> 2] | 0) >>> 16) & 255;
          a[f] = h;
          g = h;
          break;
        } else if ((d | 0) == 131) {
          h = ((c[(b + 3084) >> 2] | 0) >>> 16) & 255;
          a[f] = h;
          g = h;
          break;
        } else if ((d | 0) == 135) {
          h = ((c[(b + 3080) >> 2] | 0) >>> 16) & 255;
          a[f] = h;
          g = h;
          break;
        } else {
          g = -1;
          break;
        }
      }
    } while (0);
    i = e;
    return g | 0;
  }
  function dA(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    if ((dD(a, b, d) | 0) == 0) {
      return;
    }
    if ((b | 0) == 129) {
      c[(a + 3088) >> 2] = ((d & 255) << 16) & 983040;
      return;
    } else if ((b | 0) == 130) {
      c[(a + 3092) >> 2] = ((d & 255) << 16) & 983040;
      return;
    } else if ((b | 0) == 131) {
      c[(a + 3084) >> 2] = ((d & 255) << 16) & 983040;
      return;
    } else if ((b | 0) == 135) {
      c[(a + 3080) >> 2] = ((d & 255) << 16) & 983040;
      return;
    } else {
      return;
    }
  }
  function dB(a) {
    a = a | 0;
    var d = 0,
      e = 0,
      f = 0;
    d = c[(a + 3012) >> 2] | 0;
    e = a | 0;
    a = c[e >> 2] | 0;
    if ((d | 0) == 0) {
      b[(a + 4) >> 1] = 1;
      return;
    }
    f = (q$(d, b[(a + 8) >> 1] & 255) | 0) == 65535;
    a = ((c[e >> 2] | 0) + 4) | 0;
    if (f) {
      b[a >> 1] = 1;
      return;
    } else {
      b[a >> 1] = 0;
      return;
    }
  }
  function dC(f, g) {
    f = f | 0;
    g = g | 0;
    var h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0,
      H = 0,
      I = 0,
      J = 0,
      K = 0,
      L = 0,
      M = 0,
      N = 0,
      O = 0,
      P = 0,
      Q = 0,
      R = 0,
      S = 0,
      T = 0,
      U = 0,
      V = 0,
      W = 0,
      X = 0,
      Y = 0,
      Z = 0,
      _ = 0,
      $ = 0,
      aa = 0,
      ab = 0,
      ac = 0,
      ad = 0,
      ae = 0,
      af = 0,
      ag = 0;
    h = i;
    i = (i + 4632) | 0;
    j = h | 0;
    k = (h + 512) | 0;
    l = (h + 520) | 0;
    m = (h + 528) | 0;
    n = (h + 536) | 0;
    o = (g + 4) | 0;
    p = b[o >> 1] | 0;
    q = (p & 65535) >>> 8;
    if ((q | 0) == 8) {
      r = (g + 8) | 0;
      s = e[r >> 1] | 0;
      t = ts(f, s & 255) | 0;
      if ((t | 0) == 0) {
        b[o >> 1] = (b[o >> 1] & 255) | 256;
        u = c[(g + 80) >> 2] & 1089;
        if (u >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
          a[((c[(g + 72) >> 2] | 0) + u) | 0] = 1;
        } else {
          b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, u, 1);
        }
        u = (g + 30) | 0;
        b[u >> 1] = b[u >> 1] | 1;
        i = h;
        return;
      }
      do {
        if (((s & 128) | 0) == 0) {
          if ((c[(t + 44) >> 2] | 0) >>> 0 < 50) {
            break;
          }
          u = c[(t + 52) >> 2] | 0;
          if (u >>> 0 < 12) {
            v = 3;
          } else {
            v = u >>> 0 < 17 ? 2 : 4;
          }
          b[(g + 10) >> 1] = v;
        }
      } while (0);
      v = c[f >> 2] | 0;
      if ((v | 0) == 0) {
        w = 0;
      } else {
        s = c[(f + 4) >> 2] | 0;
        u = 0;
        x = 0;
        do {
          x =
            ((((c[((c[(s + (u << 2)) >> 2] | 0) + 24) >> 2] | 0) >>> 7) & 1) +
              x) |
            0;
          u = (u + 1) | 0;
        } while (u >>> 0 < v >>> 0);
        w = x & 255;
      }
      b[r >> 1] = ((b[r >> 1] & -256 & 65535) | w) & 65535;
      b[r >> 1] = (((c[(t + 48) >> 2] << 8) + 65280) | w) & 65535;
      w = (t + 44) | 0;
      r = (g + 6) | 0;
      x = ((c[w >> 2] << 8) + 65280) | 0;
      b[r >> 1] = ((b[r >> 1] & 255) | x) & 65535;
      b[r >> 1] =
        ((c[(t + 52) >> 2] & 255) |
          x |
          (((((c[w >> 2] | 0) + 1023) | 0) >>> 2) & 192)) &
        65535;
      b[o >> 1] = b[o >> 1] & 255;
      w = c[(g + 80) >> 2] & 1089;
      if (w >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
        a[((c[(g + 72) >> 2] | 0) + w) | 0] = 0;
      } else {
        b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, w, 0);
      }
      w = (g + 30) | 0;
      b[w >> 1] = b[w >> 1] & -2;
      i = h;
      return;
    } else if ((q | 0) == 5) {
      w = j | 0;
      j = (g + 8) | 0;
      x = b[j >> 1] & 255;
      t = ts(f, x) | 0;
      if ((t | 0) == 0) {
        b[o >> 1] = (b[o >> 1] & 255) | 256;
        r = c[(g + 80) >> 2] & 1089;
        if (r >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
          a[((c[(g + 72) >> 2] | 0) + r) | 0] = 1;
        } else {
          b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, r, 1);
        }
        r = (g + 30) | 0;
        b[r >> 1] = b[r >> 1] | 1;
        i = h;
        return;
      }
      r = b[o >> 1] | 0;
      if ((a[(t + 56) | 0] | 0) != 0) {
        b[o >> 1] = (r & 255) | 768;
        v = c[(g + 80) >> 2] & 1089;
        if (v >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
          a[((c[(g + 72) >> 2] | 0) + v) | 0] = 3;
        } else {
          b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, v, 3);
        }
        v = (g + 30) | 0;
        b[v >> 1] = b[v >> 1] | 1;
        i = h;
        return;
      }
      v = r & 255;
      r = e[(g + 6) >> 1] | 0;
      u = r >>> 8;
      if (x >>> 0 > 4) {
        y = ((r << 2) & 768) | u;
      } else {
        y = u;
      }
      u = (e[j >> 1] | 0) >>> 8;
      do {
        if (x >>> 0 < 4) {
          j = (g + 80) | 0;
          r = c[j >> 2] | 0;
          s = r & 120;
          z = s | 1;
          A = (g + 76) | 0;
          B = c[A >> 2] | 0;
          if (z >>> 0 < B >>> 0) {
            C = c[(g + 72) >> 2] | 0;
            D = (d[(C + z) | 0] << 8) | d[(C + s) | 0];
            E = r;
            F = B;
          } else {
            B = b8[c[(g + 44) >> 2] & 255](c[(g + 32) >> 2] | 0, s) | 0;
            D = B;
            E = c[j >> 2] | 0;
            F = c[A >> 2] | 0;
          }
          B = E & 122;
          s = B | 1;
          if (s >>> 0 < F >>> 0) {
            r = c[(g + 72) >> 2] | 0;
            G = (d[(r + s) | 0] << 8) | d[(r + B) | 0];
            H = E;
            I = F;
          } else {
            r = b8[c[(g + 44) >> 2] & 255](c[(g + 32) >> 2] | 0, B) | 0;
            G = r;
            H = c[j >> 2] | 0;
            I = c[A >> 2] | 0;
          }
          A = (((G & 65535) << 4) + ((D + 8) & 65535)) & H;
          if (A >>> 0 < I >>> 0) {
            J = a[((c[(g + 72) >> 2] | 0) + A) | 0] | 0;
            break;
          } else {
            J = b8[c[(g + 36) >> 2] & 255](c[(g + 32) >> 2] | 0, A) | 0;
            break;
          }
        } else {
          J = -10;
        }
      } while (0);
      if (u >>> 0 >= (c[(t + 36) >> 2] | 0) >>> 0) {
        b[o >> 1] = b[o >> 1] & 255;
        I = c[(g + 80) >> 2] & 1089;
        if (I >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
          a[((c[(g + 72) >> 2] | 0) + I) | 0] = 0;
        } else {
          b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, I, 0);
        }
        I = (g + 30) | 0;
        b[I >> 1] = b[I >> 1] & -2;
        i = h;
        return;
      }
      zP(w | 0, J | 0, 512);
      J = 0;
      while (1) {
        if (J >>> 0 >= v >>> 0) {
          K = 1589;
          break;
        }
        I = (J + 1) | 0;
        if ((tw(t, w, y, u, I, 1) | 0) == 0) {
          J = I;
        } else {
          K = 1585;
          break;
        }
      }
      if ((K | 0) == 1589) {
        b[o >> 1] = b[o >> 1] & 255;
        J = c[(g + 80) >> 2] & 1089;
        if (J >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
          a[((c[(g + 72) >> 2] | 0) + J) | 0] = 0;
        } else {
          b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, J, 0);
        }
        J = (g + 30) | 0;
        b[J >> 1] = b[J >> 1] & -2;
        i = h;
        return;
      } else if ((K | 0) == 1585) {
        b[o >> 1] = (b[o >> 1] & 255) | 1024;
        K = c[(g + 80) >> 2] & 1089;
        if (K >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
          a[((c[(g + 72) >> 2] | 0) + K) | 0] = 4;
        } else {
          b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, K, 4);
        }
        K = (g + 30) | 0;
        b[K >> 1] = b[K >> 1] | 1;
        i = h;
        return;
      }
    } else if ((q | 0) == 3) {
      K = n | 0;
      J = (g + 8) | 0;
      u = ts(f, b[J >> 1] & 255) | 0;
      if ((u | 0) == 0) {
        b[o >> 1] = (b[o >> 1] & 255) | 256;
        y = c[(g + 80) >> 2] & 1089;
        if (y >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
          a[((c[(g + 72) >> 2] | 0) + y) | 0] = 1;
        } else {
          b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, y, 1);
        }
        y = (g + 30) | 0;
        b[y >> 1] = b[y >> 1] | 1;
        i = h;
        return;
      }
      y = b[o >> 1] | 0;
      if ((a[(u + 56) | 0] | 0) != 0) {
        b[o >> 1] = (y & 255) | 768;
        w = c[(g + 80) >> 2] & 1089;
        if (w >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
          a[((c[(g + 72) >> 2] | 0) + w) | 0] = 3;
        } else {
          b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, w, 3);
        }
        w = (g + 30) | 0;
        b[w >> 1] = b[w >> 1] | 1;
        i = h;
        return;
      }
      w = y & 255;
      y = e[(g + 6) >> 1] | 0;
      t = ((e[(g + 20) >> 1] << 4) + (e[(g + 10) >> 1] | 0)) | 0;
      if (
        (tq(u, ((y << 2) & 768) | (y >>> 8), (e[J >> 1] | 0) >>> 8, y & 63, l) |
          0) !=
        0
      ) {
        b[o >> 1] = (b[o >> 1] & 255) | 1024;
        y = c[(g + 80) >> 2] & 1089;
        if (y >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
          a[((c[(g + 72) >> 2] | 0) + y) | 0] = 4;
        } else {
          b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, y, 4);
        }
        y = (g + 30) | 0;
        b[y >> 1] = b[y >> 1] | 1;
        i = h;
        return;
      }
      L2007: do {
        if ((w | 0) == 0) {
          L = (g + 80) | 0;
          M = (g + 76) | 0;
        } else {
          y = (g + 76) | 0;
          J = (g + 72) | 0;
          v = (g + 80) | 0;
          I = (g + 44) | 0;
          H = (g + 32) | 0;
          D = t;
          G = w;
          while (1) {
            F = G >>> 0 < 8 ? G : 8;
            E = F << 9;
            x = (E + D) | 0;
            A = c[y >> 2] | 0;
            L2012: do {
              if (x >>> 0 < A >>> 0) {
                j = ((c[J >> 2] | 0) + D) | 0;
                zO(K | 0, j | 0, E) | 0;
                N = x;
              } else {
                if ((E | 0) == 0) {
                  N = D;
                  break;
                } else {
                  O = D;
                  P = 0;
                  Q = A;
                }
                while (1) {
                  j = O & 1048575 & c[v >> 2];
                  r = (j + 1) | 0;
                  if (r >>> 0 < Q >>> 0) {
                    B = c[J >> 2] | 0;
                    R = a[(B + r) | 0] | 0;
                    S = a[(B + j) | 0] | 0;
                  } else {
                    B = b8[c[I >> 2] & 255](c[H >> 2] | 0, j) | 0;
                    R = ((B & 65535) >>> 8) & 255;
                    S = B & 255;
                  }
                  a[(n + P) | 0] = S;
                  a[(n + (P | 1)) | 0] = R;
                  B = (O + 2) | 0;
                  j = (P + 2) | 0;
                  if (j >>> 0 >= E >>> 0) {
                    N = B;
                    break L2012;
                  }
                  O = B;
                  P = j;
                  Q = c[y >> 2] | 0;
                }
              }
            } while (0);
            if ((tv(u, K, c[l >> 2] | 0, F) | 0) != 0) {
              break;
            }
            c[l >> 2] = (c[l >> 2] | 0) + F;
            if ((G | 0) == (F | 0)) {
              L = v;
              M = y;
              break L2007;
            } else {
              D = N;
              G = (G - F) | 0;
            }
          }
          b[o >> 1] = (b[o >> 1] & 255) | 256;
          G = c[v >> 2] & 1089;
          if (G >>> 0 < (c[y >> 2] | 0) >>> 0) {
            a[((c[J >> 2] | 0) + G) | 0] = 1;
          } else {
            b5[c[(g + 40) >> 2] & 255](c[H >> 2] | 0, G, 1);
          }
          G = (g + 30) | 0;
          b[G >> 1] = b[G >> 1] | 1;
          i = h;
          return;
        }
      } while (0);
      b[o >> 1] = b[o >> 1] & 255;
      N = c[L >> 2] & 1089;
      if (N >>> 0 < (c[M >> 2] | 0) >>> 0) {
        a[((c[(g + 72) >> 2] | 0) + N) | 0] = 0;
      } else {
        b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, N, 0);
      }
      N = (g + 30) | 0;
      b[N >> 1] = b[N >> 1] & -2;
      i = h;
      return;
    } else if ((q | 0) == 23) {
      b[o >> 1] = p & 255;
      N = c[(g + 80) >> 2] & 1089;
      if (N >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
        a[((c[(g + 72) >> 2] | 0) + N) | 0] = 0;
      } else {
        b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, N, 0);
      }
      N = (g + 30) | 0;
      b[N >> 1] = b[N >> 1] & -2;
    } else if ((q | 0) == 4) {
      N = n | 0;
      M = (g + 8) | 0;
      L = ts(f, b[M >> 1] & 255) | 0;
      l = b[o >> 1] | 0;
      if ((L | 0) == 0) {
        b[o >> 1] = (l & 255) | 256;
        K = c[(g + 80) >> 2] & 1089;
        if (K >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
          a[((c[(g + 72) >> 2] | 0) + K) | 0] = 1;
        } else {
          b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, K, 1);
        }
        K = (g + 30) | 0;
        b[K >> 1] = b[K >> 1] | 1;
        i = h;
        return;
      }
      K = l & 255;
      l = e[(g + 6) >> 1] | 0;
      if (
        (tq(L, ((l << 2) & 768) | (l >>> 8), (e[M >> 1] | 0) >>> 8, l & 63, k) |
          0) !=
        0
      ) {
        b[o >> 1] = (b[o >> 1] & 255) | 1024;
        l = c[(g + 80) >> 2] & 1089;
        if (l >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
          a[((c[(g + 72) >> 2] | 0) + l) | 0] = 4;
        } else {
          b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, l, 4);
        }
        l = (g + 30) | 0;
        b[l >> 1] = b[l >> 1] | 1;
        i = h;
        return;
      }
      L2058: do {
        if ((K | 0) != 0) {
          l = K;
          M = c[k >> 2] | 0;
          while (1) {
            u = l >>> 0 < 8 ? l : 8;
            if ((tt(L, N, M, u) | 0) != 0) {
              break;
            }
            Q = ((c[k >> 2] | 0) + u) | 0;
            c[k >> 2] = Q;
            if ((l | 0) == (u | 0)) {
              break L2058;
            } else {
              l = (l - u) | 0;
              M = Q;
            }
          }
          b[o >> 1] = (b[o >> 1] & 255) | 256;
          M = c[(g + 80) >> 2] & 1089;
          if (M >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
            a[((c[(g + 72) >> 2] | 0) + M) | 0] = 1;
          } else {
            b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, M, 1);
          }
          M = (g + 30) | 0;
          b[M >> 1] = b[M >> 1] | 1;
          i = h;
          return;
        }
      } while (0);
      b[o >> 1] = b[o >> 1] & 255;
      k = c[(g + 80) >> 2] & 1089;
      if (k >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
        a[((c[(g + 72) >> 2] | 0) + k) | 0] = 0;
      } else {
        b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, k, 0);
      }
      k = (g + 30) | 0;
      b[k >> 1] = b[k >> 1] & -2;
      i = h;
      return;
    } else if ((q | 0) == 2) {
      k = n | 0;
      N = (g + 8) | 0;
      L = ts(f, b[N >> 1] & 255) | 0;
      K = b[o >> 1] | 0;
      if ((L | 0) == 0) {
        b[o >> 1] = (K & 255) | 256;
        M = c[(g + 80) >> 2] & 1089;
        if (M >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
          a[((c[(g + 72) >> 2] | 0) + M) | 0] = 1;
        } else {
          b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, M, 1);
        }
        M = (g + 30) | 0;
        b[M >> 1] = b[M >> 1] | 1;
        i = h;
        return;
      }
      M = K & 255;
      K = e[(g + 6) >> 1] | 0;
      l = ((e[(g + 20) >> 1] << 4) + (e[(g + 10) >> 1] | 0)) | 0;
      if (
        (tq(L, ((K << 2) & 768) | (K >>> 8), (e[N >> 1] | 0) >>> 8, K & 63, m) |
          0) !=
        0
      ) {
        b[o >> 1] = (b[o >> 1] & 255) | 1024;
        K = c[(g + 80) >> 2] & 1089;
        if (K >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
          a[((c[(g + 72) >> 2] | 0) + K) | 0] = 4;
        } else {
          b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, K, 4);
        }
        K = (g + 30) | 0;
        b[K >> 1] = b[K >> 1] | 1;
        i = h;
        return;
      }
      L2092: do {
        if ((M | 0) == 0) {
          T = (g + 80) | 0;
          U = (g + 76) | 0;
        } else {
          K = (g + 76) | 0;
          N = (g + 72) | 0;
          H = (g + 80) | 0;
          J = (g + 48) | 0;
          y = (g + 32) | 0;
          v = M;
          Q = l;
          while (1) {
            u = v >>> 0 < 8 ? v : 8;
            if ((tt(L, k, c[m >> 2] | 0, u) | 0) != 0) {
              break;
            }
            P = (v - u) | 0;
            c[m >> 2] = (c[m >> 2] | 0) + u;
            O = u << 9;
            R = (O + Q) | 0;
            S = c[K >> 2] | 0;
            L2098: do {
              if (R >>> 0 > S >>> 0) {
                if ((O | 0) == 0) {
                  V = Q;
                  break;
                } else {
                  W = Q;
                  X = 0;
                  Y = S;
                }
                while (1) {
                  w = a[(n + X) | 0] | 0;
                  t = a[(n + (X | 1)) | 0] | 0;
                  G = W & 1048575 & c[H >> 2];
                  D = (G + 1) | 0;
                  if (D >>> 0 < Y >>> 0) {
                    a[((c[N >> 2] | 0) + G) | 0] = w;
                    a[((c[N >> 2] | 0) + D) | 0] = t;
                  } else {
                    b5[c[J >> 2] & 255](
                      c[y >> 2] | 0,
                      G,
                      ((t & 255) << 8) | (w & 255)
                    );
                  }
                  w = (W + 2) | 0;
                  t = (X + 2) | 0;
                  if (t >>> 0 >= O >>> 0) {
                    V = w;
                    break L2098;
                  }
                  W = w;
                  X = t;
                  Y = c[K >> 2] | 0;
                }
              } else {
                t = ((c[N >> 2] | 0) + Q) | 0;
                zO(t | 0, k | 0, O) | 0;
                V = R;
              }
            } while (0);
            if ((v | 0) == (u | 0)) {
              T = H;
              U = K;
              break L2092;
            } else {
              v = P;
              Q = V;
            }
          }
          b[o >> 1] = (b[o >> 1] & 255) | 256;
          Q = c[H >> 2] & 1089;
          if (Q >>> 0 < (c[K >> 2] | 0) >>> 0) {
            a[((c[N >> 2] | 0) + Q) | 0] = 1;
          } else {
            b5[c[(g + 40) >> 2] & 255](c[y >> 2] | 0, Q, 1);
          }
          Q = (g + 30) | 0;
          b[Q >> 1] = b[Q >> 1] | 1;
          i = h;
          return;
        }
      } while (0);
      b[o >> 1] = b[o >> 1] & 255;
      V = c[T >> 2] & 1089;
      if (V >>> 0 < (c[U >> 2] | 0) >>> 0) {
        a[((c[(g + 72) >> 2] | 0) + V) | 0] = 0;
      } else {
        b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, V, 0);
      }
      V = (g + 30) | 0;
      b[V >> 1] = b[V >> 1] & -2;
      i = h;
      return;
    } else if ((q | 0) == 12) {
      b[o >> 1] = p & 255;
      V = c[(g + 80) >> 2] & 1089;
      if (V >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
        a[((c[(g + 72) >> 2] | 0) + V) | 0] = 0;
      } else {
        b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, V, 0);
      }
      V = (g + 30) | 0;
      b[V >> 1] = b[V >> 1] & -2;
      i = h;
      return;
    } else if ((q | 0) == 16) {
      V = (ts(f, b[(g + 8) >> 1] & 255) | 0) == 0;
      U = b[o >> 1] & 255;
      if (V) {
        b[o >> 1] = U | 8192;
        V = c[(g + 80) >> 2] & 1089;
        if (V >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
          a[((c[(g + 72) >> 2] | 0) + V) | 0] = 32;
        } else {
          b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, V, 32);
        }
        V = (g + 30) | 0;
        b[V >> 1] = b[V >> 1] | 1;
        i = h;
        return;
      } else {
        b[o >> 1] = U;
        U = c[(g + 80) >> 2] & 1089;
        if (U >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
          a[((c[(g + 72) >> 2] | 0) + U) | 0] = 0;
        } else {
          b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, U, 0);
        }
        U = (g + 30) | 0;
        b[U >> 1] = b[U >> 1] & -2;
        i = h;
        return;
      }
    } else if ((q | 0) == 0) {
      b[o >> 1] = p & 255;
      U = c[(g + 80) >> 2] & 1089;
      if (U >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
        a[((c[(g + 72) >> 2] | 0) + U) | 0] = 0;
      } else {
        b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, U, 0);
      }
      U = (g + 30) | 0;
      b[U >> 1] = b[U >> 1] & -2;
      i = h;
      return;
    } else if ((q | 0) == 1) {
      U = (g + 80) | 0;
      V = c[U >> 2] | 0;
      T = V & 1089;
      k = (g + 76) | 0;
      Y = c[k >> 2] | 0;
      if (T >>> 0 < Y >>> 0) {
        Z = a[((c[(g + 72) >> 2] | 0) + T) | 0] | 0;
        _ = p;
        $ = V;
        aa = Y;
      } else {
        Y = b8[c[(g + 36) >> 2] & 255](c[(g + 32) >> 2] | 0, T) | 0;
        Z = Y;
        _ = b[o >> 1] | 0;
        $ = c[U >> 2] | 0;
        aa = c[k >> 2] | 0;
      }
      b[o >> 1] = (_ & 255) | ((Z & 255) << 8);
      _ = $ & 1089;
      if (_ >>> 0 < aa >>> 0) {
        a[((c[(g + 72) >> 2] | 0) + _) | 0] = Z;
      } else {
        b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, _, Z);
      }
      _ = (g + 30) | 0;
      aa = b[_ >> 1] | 0;
      b[_ >> 1] = (Z << 24) >> 24 == 0 ? aa & -2 : aa | 1;
      i = h;
      return;
    } else if ((q | 0) != 24) {
      b[o >> 1] = (p & 255) | 256;
      p = c[(g + 80) >> 2] & 1089;
      if (p >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
        a[((c[(g + 72) >> 2] | 0) + p) | 0] = 1;
      } else {
        b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, p, 1);
      }
      p = (g + 30) | 0;
      b[p >> 1] = b[p >> 1] | 1;
      i = h;
      return;
    }
    p = ts(f, b[(g + 8) >> 1] & 255) | 0;
    if ((p | 0) == 0) {
      b[o >> 1] = (b[o >> 1] & 255) | 256;
      f = c[(g + 80) >> 2] & 1089;
      if (f >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
        a[((c[(g + 72) >> 2] | 0) + f) | 0] = 1;
      } else {
        b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, f, 1);
      }
      f = (g + 30) | 0;
      b[f >> 1] = b[f >> 1] | 1;
      i = h;
      return;
    }
    f = e[(g + 6) >> 1] | 0;
    do {
      if (
        (((f << 2) & 768) | (f >>> 8)) >>> 0 <=
        (c[(p + 44) >> 2] | 0) >>> 0
      ) {
        if ((f & 63) >>> 0 > (c[(p + 52) >> 2] | 0) >>> 0) {
          break;
        }
        q = (g + 80) | 0;
        aa = c[q >> 2] | 0;
        Z = aa & 122;
        _ = Z | 1;
        $ = (g + 76) | 0;
        k = c[$ >> 2] | 0;
        if (_ >>> 0 < k >>> 0) {
          U = c[(g + 72) >> 2] | 0;
          ab = (d[(U + _) | 0] << 8) | d[(U + Z) | 0];
          ac = aa;
          ad = k;
        } else {
          k = b8[c[(g + 44) >> 2] & 255](c[(g + 32) >> 2] | 0, Z) | 0;
          ab = k;
          ac = c[q >> 2] | 0;
          ad = c[$ >> 2] | 0;
        }
        b[(g + 20) >> 1] = ab;
        k = ac & 120;
        Z = k | 1;
        if (Z >>> 0 < ad >>> 0) {
          aa = c[(g + 72) >> 2] | 0;
          ae = (d[(aa + Z) | 0] << 8) | d[(aa + k) | 0];
          af = ac;
          ag = ad;
        } else {
          aa = b8[c[(g + 44) >> 2] & 255](c[(g + 32) >> 2] | 0, k) | 0;
          ae = aa;
          af = c[q >> 2] | 0;
          ag = c[$ >> 2] | 0;
        }
        b[(g + 18) >> 1] = ae;
        b[o >> 1] = b[o >> 1] & 255;
        $ = af & 1089;
        if ($ >>> 0 < ag >>> 0) {
          a[((c[(g + 72) >> 2] | 0) + $) | 0] = 0;
        } else {
          b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, $, 0);
        }
        $ = (g + 30) | 0;
        b[$ >> 1] = b[$ >> 1] & -2;
        i = h;
        return;
      }
    } while (0);
    b[o >> 1] = (b[o >> 1] & 255) | 3072;
    o = c[(g + 80) >> 2] & 1089;
    if (o >>> 0 < (c[(g + 76) >> 2] | 0) >>> 0) {
      a[((c[(g + 72) >> 2] | 0) + o) | 0] = 12;
    } else {
      b5[c[(g + 40) >> 2] & 255](c[(g + 32) >> 2] | 0, o, 12);
    }
    o = (g + 30) | 0;
    b[o >> 1] = b[o >> 1] | 1;
    i = h;
    return;
  }
  function dD(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    return 1;
  }
  function dE(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    c[(a + 272) >> 2] = b;
    c[(a + 276) >> 2] = d;
    return;
  }
  function dF(b) {
    b = b | 0;
    return a[(b + 4) | 0] | 0;
  }
  function dG(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0;
    if (((c[(b + 3e3) >> 2] & 4) | 0) == 0) {
      return;
    }
    e = (b + 3010) | 0;
    a[e] = ((a[e] & -49 & 255) | ((d << 4) & 48)) & 255;
    return;
  }
  function dH(a) {
    a = a | 0;
    c[a >> 2] = 381;
    c[(a + 272) >> 2] = 0;
    c[(a + 276) >> 2] = 0;
    zP((a + 4) | 0, 0, 12);
    return;
  }
  function dI(b) {
    b = b | 0;
    var d = 0,
      e = 0;
    d = i;
    dP(
      31152,
      ((x = i),
      (i = (i + 1) | 0),
      (i = ((i + 7) >> 3) << 3),
      (c[x >> 2] = 0),
      x) | 0
    );
    if ((c[1862] | 0) != 0) {
      e = 7448;
      do {
        a[(e + 16) | 0] = 0;
        e = (e + 20) | 0;
      } while ((c[e >> 2] | 0) != 0);
    }
    c[b >> 2] = 381;
    a[(b + 4) | 0] = 85;
    c[(b + 8) >> 2] = 0;
    c[(b + 12) >> 2] = 1;
    a[(b + 16) | 0] = -86;
    i = d;
    return;
  }
  function dJ(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    g = (e << 24) >> 24 != 0;
    e = (b + 7) | 0;
    if ((d[e] | 0 | 0) == ((g & 1) | 0)) {
      i = f;
      return;
    }
    a[e] = g & 1;
    if (!g) {
      i = f;
      return;
    }
    dP(
      31152,
      ((x = i),
      (i = (i + 1) | 0),
      (i = ((i + 7) >> 3) << 3),
      (c[x >> 2] = 0),
      x) | 0
    );
    if ((c[1862] | 0) != 0) {
      g = 7448;
      do {
        a[(g + 16) | 0] = 0;
        g = (g + 20) | 0;
      } while ((c[g >> 2] | 0) != 0);
    }
    c[b >> 2] = 381;
    a[(b + 4) | 0] = 85;
    c[(b + 8) >> 2] = 0;
    c[(b + 12) >> 2] = 1;
    a[(b + 16) | 0] = -86;
    i = f;
    return;
  }
  function dK(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (e << 24) >> 24 != 0;
    e = (b + 6) | 0;
    if ((d[e] | 0 | 0) == ((f & 1) | 0)) {
      return;
    }
    a[e] = f & 1;
    if (f) {
      c[b >> 2] = 381;
      return;
    }
    a[(b + 4) | 0] = 0;
    a[(b + 5) | 0] = 0;
    f = c[(b + 276) >> 2] | 0;
    if ((f | 0) == 0) {
      return;
    }
    b3[f & 511](c[(b + 272) >> 2] | 0, 0);
    return;
  }
  function dL(d, e, f) {
    d = d | 0;
    e = e | 0;
    f = f | 0;
    var g = 0,
      h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0;
    g = i;
    if ((e | 0) == 3) {
      xt(2, 38072, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = f), x) | 0);
      i = g;
      return;
    } else {
      h = 7448;
    }
    while (1) {
      j = c[h >> 2] | 0;
      k = (j | 0) == 0;
      if (k | ((j | 0) == (f | 0))) {
        break;
      } else {
        h = (h + 20) | 0;
      }
    }
    if (k) {
      i = g;
      return;
    }
    if ((e | 0) == 2) {
      k = (h + 16) | 0;
      if ((a[k] | 0) == 0) {
        i = g;
        return;
      }
      a[k] = 0;
      k = b[(h + 10) >> 1] | 0;
      f = k & 65535;
      if ((k << 16) >> 16 == 0) {
        i = g;
        return;
      }
      k = (d + 12) | 0;
      j = (d + 8) | 0;
      l = 0;
      m = c[k >> 2] | 0;
      while (1) {
        n = (m + 1) & 255;
        if ((n | 0) == (c[j >> 2] | 0)) {
          break;
        }
        a[(d + 16 + m) | 0] = a[(h + 12 + l) | 0] | 0;
        c[k >> 2] = n;
        o = (l + 1) | 0;
        if (o >>> 0 < f >>> 0) {
          l = o;
          m = n;
        } else {
          p = 1734;
          break;
        }
      }
      if ((p | 0) == 1734) {
        i = g;
        return;
      }
      xt(
        0,
        32232,
        ((x = i),
        (i = (i + 1) | 0),
        (i = ((i + 7) >> 3) << 3),
        (c[x >> 2] = 0),
        x) | 0
      );
      i = g;
      return;
    } else if ((e | 0) == 1) {
      a[(h + 16) | 0] = 1;
      e = b[(h + 4) >> 1] | 0;
      m = e & 65535;
      if ((e << 16) >> 16 == 0) {
        i = g;
        return;
      }
      e = (d + 12) | 0;
      l = (d + 8) | 0;
      f = 0;
      k = c[e >> 2] | 0;
      while (1) {
        j = (k + 1) & 255;
        if ((j | 0) == (c[l >> 2] | 0)) {
          break;
        }
        a[(d + 16 + k) | 0] = a[(h + 6 + f) | 0] | 0;
        c[e >> 2] = j;
        n = (f + 1) | 0;
        if (n >>> 0 < m >>> 0) {
          f = n;
          k = j;
        } else {
          p = 1731;
          break;
        }
      }
      if ((p | 0) == 1731) {
        i = g;
        return;
      }
      xt(
        0,
        32232,
        ((x = i),
        (i = (i + 1) | 0),
        (i = ((i + 7) >> 3) << 3),
        (c[x >> 2] = 0),
        x) | 0
      );
      i = g;
      return;
    } else {
      i = g;
      return;
    }
  }
  function dM(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0;
    e = (b + 8) | 0;
    f = c[e >> 2] | 0;
    if ((f | 0) == (c[(b + 12) >> 2] | 0)) {
      return;
    }
    if ((a[(b + 7) | 0] | 0) == 0) {
      return;
    }
    if ((a[(b + 6) | 0] | 0) == 0) {
      return;
    }
    g = (b + 5) | 0;
    if ((a[g] | 0) != 0) {
      return;
    }
    h = b | 0;
    i = c[h >> 2] | 0;
    if (i >>> 0 > d >>> 0) {
      c[h >> 2] = i - d;
      return;
    }
    c[h >> 2] = 381;
    a[(b + 4) | 0] = a[(b + 16 + f) | 0] | 0;
    a[g] = 1;
    c[e >> 2] = (f + 1) & 255;
    f = c[(b + 276) >> 2] | 0;
    if ((f | 0) == 0) {
      return;
    }
    b3[f & 511](c[(b + 272) >> 2] | 0, 1);
    return;
  }
  function dN(b, d, e) {
    b = b | 0;
    d = d | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0;
    f = i;
    i = (i + 16) | 0;
    g = f | 0;
    h = (f + 8) | 0;
    if (((c[(b + 3e3) >> 2] & 4) | 0) == 0) {
      j = 1;
      i = f;
      return j | 0;
    }
    if (((d - 112) | 0) >>> 0 >= 16) {
      if ((d | 0) == 100) {
        a[e] = 1;
        j = 0;
        i = f;
        return j | 0;
      } else if ((d | 0) == 102) {
        a[e] = a[(b + 3009) | 0] | 0;
        j = 0;
        i = f;
        return j | 0;
      } else if ((d | 0) == 103) {
        a[e] = a[(b + 3010) | 0] | 0;
        j = 0;
        i = f;
        return j | 0;
      } else {
        j = 1;
        i = f;
        return j | 0;
      }
    }
    if ((c[(b + 3104) >> 2] | 0) == 0) {
      k = 0;
      l = 0;
      m = 0;
      n = 0;
      o = 0;
      p = 1;
      q = 1980;
    } else {
      if ((bx(h | 0, 0) | 0) == 0) {
        c[g >> 2] = c[h >> 2];
        r = ((c[(h + 4) >> 2] | 0) / 1e5) | 0;
      } else {
        c[g >> 2] = b0(0) | 0;
        r = 0;
      }
      h = aH(g | 0) | 0;
      k = r;
      l = c[h >> 2] | 0;
      m = c[(h + 4) >> 2] | 0;
      n = c[(h + 8) >> 2] | 0;
      o = c[(h + 12) >> 2] | 0;
      p = ((c[(h + 16) >> 2] | 0) + 1) | 0;
      q = ((c[(h + 20) >> 2] | 0) + 1900) | 0;
    }
    do {
      if ((d | 0) == 116) {
        s = ((m >>> 0) % 10 | 0) & 255;
      } else if ((d | 0) == 117) {
        s = (((m >>> 0) / 10) | 0) & 255;
      } else if ((d | 0) == 114) {
        s = ((l >>> 0) % 10 | 0) & 255;
      } else if ((d | 0) == 115) {
        s = (((l >>> 0) / 10) | 0) & 255;
      } else if ((d | 0) == 124) {
        s = (((p >>> 0) / 10) | 0) & 255;
      } else if ((d | 0) == 127) {
        if (q >>> 0 < 1980) {
          s = 0;
          break;
        }
        s = (q + 4) & 7;
      } else if ((d | 0) == 123) {
        s = ((p >>> 0) % 10 | 0) & 255;
      } else if ((d | 0) == 113) {
        s = ((k >>> 0) % 10 | 0) & 255;
      } else if ((d | 0) == 121) {
        s = (((o >>> 0) / 10) | 0) & 255;
      } else if ((d | 0) == 118) {
        s = ((n >>> 0) % 10 | 0) & 255;
      } else if ((d | 0) == 120) {
        s = ((o >>> 0) % 10 | 0) & 255;
      } else if ((d | 0) == 119) {
        s = (((n >>> 0) / 10) | 0) & 255;
      } else {
        dP(26672, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d), x) | 0);
        s = -1;
      }
    } while (0);
    a[e] = s;
    j = 0;
    i = f;
    return j | 0;
  }
  function dO(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0;
    e = i;
    i = (i + 16) | 0;
    f = e | 0;
    g = (e + 8) | 0;
    h = (b + 3009) | 0;
    a[h] = 0;
    j = (b + 3010) | 0;
    a[j] = 0;
    if (((c[(b + 3e3) >> 2] & 4) | 0) == 0) {
      i = e;
      return;
    }
    b = yc(d, 0, 30440) | 0;
    if ((b | 0) == 0) {
      i = e;
      return;
    }
    yj(b, 37760, f, 0) | 0;
    yj(b, 32136, g, 100) | 0;
    b = c[g >> 2] | 0;
    xv(
      2,
      30392,
      28288,
      ((x = i),
      (i = (i + 16) | 0),
      (c[x >> 2] = c[f >> 2]),
      (c[(x + 8) >> 2] = b),
      x) | 0
    );
    a[h] = c[f >> 2] & 255;
    a[j] = c[g >> 2] & 255;
    i = e;
    return;
  }
  function dP(a, b) {
    a = a | 0;
    b = b | 0;
    var d = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      k = 0;
    d = i;
    i = (i + 16) | 0;
    f = d | 0;
    g = c[10742] | 0;
    if ((g | 0) == 0) {
      h = 0;
      j = 0;
    } else {
      k = c[g >> 2] | 0;
      h = e[(k + 28) >> 1] | 0;
      j = e[(k + 22) >> 1] | 0;
    }
    xt(
      3,
      30080,
      ((x = i), (i = (i + 16) | 0), (c[x >> 2] = j), (c[(x + 8) >> 2] = h), x) |
        0
    );
    h = f;
    c[h >> 2] = b;
    c[(h + 4) >> 2] = 0;
    xu(3, a, f | 0);
    i = d;
    return;
  }
  function dQ() {
    xK(0, 1);
    return;
  }
  function dR(a) {
    a = a | 0;
    aB(34968, 18, 1, c[q >> 2] | 0) | 0;
    ax(c[q >> 2] | 0) | 0;
    a = ((c[10742] | 0) + 3168) | 0;
    c[a >> 2] = (c[a >> 2] | 0) == 0 ? 1 : 2;
    return;
  }
  function dS(a) {
    a = a | 0;
    aB(35920, 19, 1, c[q >> 2] | 0) | 0;
    ax(c[q >> 2] | 0) | 0;
    c[((c[10742] | 0) + 3168) >> 2] = 2;
    return;
  }
  function dT(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    var e = 0;
    if ((hV(c[a >> 2] | 0, b, d) | 0) == 0) {
      e = 0;
      return e | 0;
    }
    if ((aP(b | 0, 38712) | 0) != 0) {
      e = 1;
      return e | 0;
    }
    c[d >> 2] = c[(a + 3140) >> 2];
    e = 0;
    return e | 0;
  }
  function dU(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    return ((ic(c[a >> 2] | 0, b, d) | 0) != 0) | 0;
  }
  function dV(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0;
    e = (a | 0) == 0 ? c[10742] | 0 : a;
    if ((b | 0) == 0) {
      f = 1;
      return f | 0;
    }
    a = (d | 0) == 0 ? 44456 : d;
    d = 552;
    while (1) {
      g = c[d >> 2] | 0;
      if ((g | 0) == 0) {
        break;
      }
      if ((xz(g, b) | 0) == 0) {
        d = (d + 8) | 0;
      } else {
        h = 1816;
        break;
      }
    }
    if ((h | 0) == 1816) {
      f = b4[c[(d + 4) >> 2] & 127](e, b, a) | 0;
      return f | 0;
    }
    d = c[(e + 3028) >> 2] | 0;
    do {
      if ((d | 0) != 0) {
        h = zn(d, b, a) | 0;
        if ((h | 0) > -1) {
          f = h;
        } else {
          break;
        }
        return f | 0;
      }
    } while (0);
    d = c[(e + 4) >> 2] | 0;
    do {
      if ((d | 0) != 0) {
        e = qI(d, b, a) | 0;
        if ((e | 0) > -1) {
          f = e;
        } else {
          break;
        }
        return f | 0;
      }
    } while (0);
    f = 1;
    return f | 0;
  }
  function dW(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    return ((yD(d, c[(a + 3064) >> 2] | 0) | 0) != 0) | 0;
  }
  function dX(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    return ((dj(a, c) | 0) != 0) | 0;
  }
  function dY(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0;
    b = i;
    i = (i + 8) | 0;
    e = b | 0;
    if ((xB(d, e) | 0) == 0) {
      dk(a, c[e >> 2] | 0);
      f = 0;
    } else {
      f = 1;
    }
    i = b;
    return f | 0;
  }
  function dZ(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0;
    b = i;
    i = (i + 8) | 0;
    e = b | 0;
    if ((xC(d, e) | 0) != 0) {
      f = 1;
      i = b;
      return f | 0;
    }
    d = ((c[e >> 2] | 0) + (c[(a + 3128) >> 2] | 0)) | 0;
    g = (d | 0) < 1 ? 1 : d;
    c[e >> 2] = g;
    dk(a, g);
    f = 0;
    i = b;
    return f | 0;
  }
  function d_(a, b) {
    a = a | 0;
    b = b | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      k = 0,
      l = 0;
    d = i;
    i = (i + 8) | 0;
    e = d | 0;
    xc();
    xd(c[q >> 2] | 0, 0, 2) | 0;
    f = ya(0) | 0;
    c[11076] = f;
    if ((f | 0) == 0) {
      g = 1;
      i = d;
      return g | 0;
    }
    yg(44280);
    f = w5(a, b, e, 1544) | 0;
    L2388: do {
      if ((f | 0) != -1) {
        h = f;
        while (1) {
          if ((h | 0) < 0) {
            g = 1;
            j = 1870;
            break;
          }
          if ((h | 0) == 100) {
            k = c[c[e >> 2] >> 2] | 0;
            xH(k) | 0;
          } else if ((h | 0) == 113) {
            xm(c[q >> 2] | 0, 0);
          } else if ((h | 0) == 73) {
            yn(44280, c[c[e >> 2] >> 2] | 0, 32088, 0) | 0;
          } else if ((h | 0) == 0) {
            j = 1857;
            break;
          } else if ((h | 0) == 115) {
            yn(44280, 25208, c[c[e >> 2] >> 2] | 0, 32088) | 0;
          } else if ((h | 0) == 118) {
            xm(c[q >> 2] | 0, 3);
          } else if ((h | 0) == 103) {
            c[10738] = c[c[e >> 2] >> 2];
          } else if ((h | 0) == 116) {
            c[10740] = c[c[e >> 2] >> 2];
          } else if ((h | 0) == 108) {
            xl(c[c[e >> 2] >> 2] | 0, 3) | 0;
          } else if ((h | 0) == 86) {
            j = 1843;
            break;
          } else if ((h | 0) == 112) {
            yn(44280, 28264, c[c[e >> 2] >> 2] | 0, 26656) | 0;
          } else if ((h | 0) == 63) {
            j = 1842;
            break;
          } else if ((h | 0) == 98) {
            yn(44280, 37600, c[c[e >> 2] >> 2] | 0, 32088) | 0;
          } else if ((h | 0) == 105) {
            if ((xW(c[11076] | 0, c[c[e >> 2] >> 2] | 0) | 0) != 0) {
              j = 1848;
              break;
            }
          } else if (!(((h | 0) == 99) | ((h | 0) == 114) | ((h | 0) == 82))) {
            g = 1;
            j = 1866;
            break;
          }
          h = w5(a, b, e, 1544) | 0;
          if ((h | 0) == -1) {
            break L2388;
          }
        }
        if ((j | 0) == 1848) {
          h = c[q >> 2] | 0;
          k = c[b >> 2] | 0;
          l = c[c[e >> 2] >> 2] | 0;
          bN(
            h | 0,
            30304,
            ((x = i),
            (i = (i + 16) | 0),
            (c[x >> 2] = k),
            (c[(x + 8) >> 2] = l),
            x) | 0
          ) | 0;
          g = 1;
          i = d;
          return g | 0;
        } else if ((j | 0) == 1857) {
          l = c[c[e >> 2] >> 2] | 0;
          bN(
            c[q >> 2] | 0,
            23968,
            ((x = i),
            (i = (i + 16) | 0),
            (c[x >> 2] = c[b >> 2]),
            (c[(x + 8) >> 2] = l),
            x) | 0
          ) | 0;
          g = 1;
          i = d;
          return g | 0;
        } else if ((j | 0) == 1866) {
          i = d;
          return g | 0;
        } else if ((j | 0) == 1843) {
          aB(33424, 87, 1, c[o >> 2] | 0) | 0;
          ax(c[o >> 2] | 0) | 0;
          g = 0;
          i = d;
          return g | 0;
        } else if ((j | 0) == 1870) {
          i = d;
          return g | 0;
        } else if ((j | 0) == 1842) {
          w4(32976, 32328, 1544);
          ax(c[o >> 2] | 0) | 0;
          g = 0;
          i = d;
          return g | 0;
        }
      }
    } while (0);
    xm(c[q >> 2] | 0, 3);
    c[10738] = 22440;
    xt(
      1,
      33808,
      ((x = i),
      (i = (i + 1) | 0),
      (i = ((i + 7) >> 3) << 3),
      (c[x >> 2] = 0),
      x) | 0
    );
    xv(
      2,
      34600,
      34344,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = 21232), x) | 0
    );
    if ((x_(c[11076] | 0, 21232) | 0) != 0) {
      xt(
        0,
        34112,
        ((x = i),
        (i = (i + 1) | 0),
        (i = ((i + 7) >> 3) << 3),
        (c[x >> 2] = 0),
        x) | 0
      );
      g = 1;
      i = d;
      return g | 0;
    }
    j = yc(c[11076] | 0, 0, 41384) | 0;
    b = (j | 0) == 0 ? c[11076] | 0 : j;
    if ((yo(44280, b, 1) | 0) == 0) {
      aT(2) | 0;
      bb(0) | 0;
      xJ(b) | 0;
      c[10742] = c3(b) | 0;
      aM(2, 66) | 0;
      aM(15, 168) | 0;
      aM(11, 170) | 0;
      wZ(c[p >> 2] | 0, c[o >> 2] | 0);
      xw(42992);
      xn(42992, 30, c[10742] | 0);
      xo(42992, 112, c[10742] | 0);
      xp(42992, c[((c[10742] | 0) + 16) >> 2] | 0, 80);
      xq(42992, c[((c[10742] | 0) + 16) >> 2] | 0, 54);
      xr(42992, 1);
      wQ(c[10742] | 0, 110, 76);
      cM(c[10742] | 0, 42992);
      dg(c[10742] | 0);
      cH(c[10742] | 0);
      a0(1);
      return 0;
    } else {
      g = 1;
      i = d;
      return g | 0;
    }
    return 0;
  }
  function d$(a) {
    a = a | 0;
    var b = 0;
    aB(37712, 30, 1, c[q >> 2] | 0) | 0;
    ax(c[q >> 2] | 0) | 0;
    a = c[10742] | 0;
    do {
      if ((a | 0) != 0) {
        b = c[a >> 2] | 0;
        if ((b | 0) == 0) {
          break;
        }
        cF(b);
      }
    } while (0);
    xK(0, 1);
    a0(1);
  }
  function d0(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    c[(a + 3168) >> 2] = 1;
    return 0;
  }
  function d1(a, c) {
    a = a | 0;
    c = c | 0;
    var d = 0;
    d = c >>> 0 > 1e3 ? 32767 : ((((c * 32767) | 0) >>> 0) / 1e3) | 0;
    b[(a + 2136) >> 1] = 0;
    b[(a + 2138) >> 1] = (d + 32768) & 65535;
    b[(a + 2140) >> 1] = (32768 - d) & 65535;
    return;
  }
  function d2(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    c[(a + 2144) >> 2] = b;
    c[(a + 2148) >> 2] = d;
    return;
  }
  function d3(a) {
    a = a | 0;
    return c[(a + 32) >> 2] | 0;
  }
  function d4(a) {
    a = a | 0;
    return c[(a + 36) >> 2] | 0;
  }
  function d5(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0;
    b = i;
    i = (i + 8) | 0;
    e = b | 0;
    if ((xB(d, e) | 0) == 0) {
      c[(a + 3076) >> 2] = c[e >> 2];
      f = 0;
    } else {
      f = 1;
    }
    i = b;
    return f | 0;
  }
  function d6(b, d, e) {
    b = b | 0;
    d = d | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0,
      j = 0;
    d = i;
    i = (i + 16) | 0;
    f = d | 0;
    g = (d + 8) | 0;
    c[f >> 2] = e;
    if ((aP(e | 0, 29736) | 0) == 0) {
      xt(
        2,
        29608,
        ((x = i),
        (i = (i + 1) | 0),
        (i = ((i + 7) >> 3) << 3),
        (c[x >> 2] = 0),
        x) | 0
      );
      if ((tz(c[(b + 8) >> 2] | 0) | 0) == 0) {
        h = 0;
        i = d;
        return h | 0;
      }
      xt(
        0,
        29432,
        ((x = i),
        (i = (i + 1) | 0),
        (i = ((i + 7) >> 3) << 3),
        (c[x >> 2] = 0),
        x) | 0
      );
      h = 1;
      i = d;
      return h | 0;
    }
    e = (b + 8) | 0;
    b = 0;
    L2446: while (1) {
      do {
        if ((a[c[f >> 2] | 0] | 0) == 0) {
          h = b;
          j = 1895;
          break L2446;
        }
        if ((xF(f, g, 31480, 31328) | 0) != 0) {
          break L2446;
        }
        xt(
          2,
          29128,
          ((x = i), (i = (i + 8) | 0), (c[x >> 2] = c[g >> 2]), x) | 0
        );
      } while ((tA(c[e >> 2] | 0, c[g >> 2] | 0, 28824, 0) | 0) == 0);
      xt(
        0,
        28384,
        ((x = i), (i = (i + 8) | 0), (c[x >> 2] = c[g >> 2]), x) | 0
      );
      b = 1;
    }
    if ((j | 0) == 1895) {
      i = d;
      return h | 0;
    }
    xt(0, 29272, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = c[f >> 2]), x) | 0);
    h = 1;
    i = d;
    return h | 0;
  }
  function d7(b, d, e) {
    b = b | 0;
    d = d | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0,
      j = 0,
      k = 0;
    d = i;
    i = (i + 16) | 0;
    f = d | 0;
    g = (d + 8) | 0;
    c[f >> 2] = e;
    if ((a[e] | 0) == 0) {
      h = 0;
      i = d;
      return h | 0;
    }
    e = (b + 8) | 0;
    while (1) {
      if ((xF(f, g, 31480, 31328) | 0) != 0) {
        break;
      }
      b = ts(c[e >> 2] | 0, c[g >> 2] | 0) | 0;
      j = c[g >> 2] | 0;
      if ((b | 0) == 0) {
        xt(0, 30112, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = j), x) | 0);
      } else {
        xt(2, 29896, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = j), x) | 0);
        j = c[e >> 2] | 0;
        tr(j, b) | 0;
        tl(b);
      }
      if ((a[c[f >> 2] | 0] | 0) == 0) {
        h = 0;
        k = 1910;
        break;
      }
    }
    if ((k | 0) == 1910) {
      i = d;
      return h | 0;
    }
    xt(0, 30344, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = c[f >> 2]), x) | 0);
    h = 1;
    i = d;
    return h | 0;
  }
  function d8(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    return ((w6(c[(a + 8) >> 2] | 0, d, 1) | 0) != 0) | 0;
  }
  function d9(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    c[(a + 3168) >> 2] = 2;
    xs(42992, 1);
    return 0;
  }
  function ea(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0;
    b = i;
    i = (i + 8) | 0;
    e = b | 0;
    if ((xD(d, e) | 0) != 0) {
      f = 1;
      i = b;
      return f | 0;
    }
    d = (a + 3012) | 0;
    if ((c[d >> 2] | 0) == 0) {
      f = 0;
      i = b;
      return f | 0;
    }
    xt(
      2,
      31176,
      ((x = i),
      (i = (i + 8) | 0),
      (c[x >> 2] = (c[e >> 2] | 0) != 0 ? 30896 : 30456),
      x) | 0
    );
    od(((c[d >> 2] | 0) + 28) | 0, c[e >> 2] | 0);
    f = 0;
    i = b;
    return f | 0;
  }
  function eb(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0;
    b = i;
    i = (i + 16) | 0;
    e = b | 0;
    f = (b + 8) | 0;
    c[e >> 2] = d;
    if ((xF(e, f, 31480, 31328) | 0) != 0) {
      g = 1;
      i = b;
      return g | 0;
    }
    g = ((da(a, c[f >> 2] | 0, c[e >> 2] | 0) | 0) != 0) | 0;
    i = b;
    return g | 0;
  }
  function ec(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0;
    b = i;
    i = (i + 16) | 0;
    e = b | 0;
    f = (b + 8) | 0;
    c[e >> 2] = d;
    if ((xF(e, f, 31480, 31328) | 0) != 0) {
      g = 1;
      i = b;
      return g | 0;
    }
    g = ((db(a, c[f >> 2] | 0, c[e >> 2] | 0) | 0) != 0) | 0;
    i = b;
    return g | 0;
  }
  function ed(b, d, e) {
    b = b | 0;
    d = d | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    d = i;
    i = (i + 8) | 0;
    f = d | 0;
    if ((xD(e, f) | 0) != 0) {
      g = 1;
      i = d;
      return g | 0;
    }
    a[(b + 3172) | 0] = c[f >> 2] & 255;
    dh(b);
    g = 0;
    i = d;
    return g | 0;
  }
  function ee(b, c, d) {
    b = b | 0;
    c = c | 0;
    d = d | 0;
    d = (b + 3172) | 0;
    a[d] = ((a[d] | 0) == 0) | 0;
    dh(b);
    return 0;
  }
  function ef(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    dg(a);
    return 0;
  }
  function eg(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0;
    b = i;
    i = (i + 16) | 0;
    e = b | 0;
    f = (b + 8) | 0;
    c[e >> 2] = d;
    if ((xF(e, f, 31480, 31328) | 0) != 0) {
      g = 1;
      i = b;
      return g | 0;
    }
    g = ((c8(a, c[f >> 2] | 0, c[e >> 2] | 0) | 0) != 0) | 0;
    i = b;
    return g | 0;
  }
  function eh(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0;
    b = i;
    i = (i + 16) | 0;
    e = b | 0;
    f = (b + 8) | 0;
    c[e >> 2] = d;
    if ((xF(e, f, 31480, 31328) | 0) != 0) {
      g = 1;
      i = b;
      return g | 0;
    }
    g = ((c9(a, c[f >> 2] | 0, c[e >> 2] | 0) | 0) != 0) | 0;
    i = b;
    return g | 0;
  }
  function ei(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    var e = 0;
    d = (a + 844) | 0;
    a = c[d >> 2] | 0;
    if ((a | 0) == 0) {
      e = 1;
      return e | 0;
    }
    cv(a);
    cD(c[d >> 2] | 0);
    e = 0;
    return e | 0;
  }
  function ej(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0;
    b = i;
    i = (i + 8) | 0;
    e = b | 0;
    f = (a + 844) | 0;
    do {
      if ((c[f >> 2] | 0) == 0) {
        g = 1;
      } else {
        if ((xD(d, e) | 0) != 0) {
          g = 1;
          break;
        }
        cz(c[f >> 2] | 0, c[e >> 2] | 0);
        cD(c[f >> 2] | 0);
        g = 0;
      }
    } while (0);
    i = b;
    return g | 0;
  }
  function ek(b, d, e) {
    b = b | 0;
    d = d | 0;
    e = e | 0;
    var f = 0;
    d = (b + 844) | 0;
    b = c[d >> 2] | 0;
    if ((b | 0) == 0) {
      f = 1;
      return f | 0;
    }
    if ((cu(b, (a[e] | 0) == 0 ? 0 : e) | 0) != 0) {
      f = 1;
      return f | 0;
    }
    cD(c[d >> 2] | 0);
    f = 0;
    return f | 0;
  }
  function el(b, d, e) {
    b = b | 0;
    d = d | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0;
    d = i;
    i = (i + 8) | 0;
    f = d | 0;
    g = (b + 844) | 0;
    b = c[g >> 2] | 0;
    if ((b | 0) == 0) {
      h = 1;
      i = d;
      return h | 0;
    }
    cy(b, 0);
    do {
      if ((a[e] | 0) != 0) {
        if ((aP(e | 0, 31616) | 0) == 0) {
          cv(c[g >> 2] | 0);
          break;
        }
        if ((xA(e, f) | 0) != 0) {
          h = 1;
          i = d;
          return h | 0;
        }
        if ((cw(c[g >> 2] | 0, c[f >> 2] | 0) | 0) == 0) {
          break;
        } else {
          h = 1;
        }
        i = d;
        return h | 0;
      }
    } while (0);
    cD(c[g >> 2] | 0);
    h = 0;
    i = d;
    return h | 0;
  }
  function em(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0;
    b = i;
    i = (i + 8) | 0;
    e = b | 0;
    f = (a + 844) | 0;
    do {
      if ((c[f >> 2] | 0) == 0) {
        g = 1;
      } else {
        if ((xD(d, e) | 0) != 0) {
          g = 1;
          break;
        }
        cx(c[f >> 2] | 0, c[e >> 2] | 0);
        cD(c[f >> 2] | 0);
        g = 0;
      }
    } while (0);
    i = b;
    return g | 0;
  }
  function en(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    var e = 0;
    d = (a + 844) | 0;
    a = c[d >> 2] | 0;
    if ((a | 0) == 0) {
      e = 1;
      return e | 0;
    }
    cA(a);
    cD(c[d >> 2] | 0);
    e = 0;
    return e | 0;
  }
  function eo(b, d, e) {
    b = b | 0;
    d = d | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0;
    d = i;
    i = (i + 8) | 0;
    f = d | 0;
    g = (b + 844) | 0;
    b = c[g >> 2] | 0;
    if ((b | 0) == 0) {
      h = 1;
      i = d;
      return h | 0;
    }
    cy(b, 1);
    do {
      if ((a[e] | 0) != 0) {
        if ((aP(e | 0, 31616) | 0) == 0) {
          cv(c[g >> 2] | 0);
          break;
        }
        if ((xA(e, f) | 0) != 0) {
          h = 1;
          i = d;
          return h | 0;
        }
        if ((cw(c[g >> 2] | 0, c[f >> 2] | 0) | 0) == 0) {
          break;
        } else {
          h = 1;
        }
        i = d;
        return h | 0;
      }
    } while (0);
    cD(c[g >> 2] | 0);
    h = 0;
    i = d;
    return h | 0;
  }
  function ep(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    var e = 0;
    d = c[(a + 844) >> 2] | 0;
    if ((d | 0) == 0) {
      e = 1;
      return e | 0;
    }
    cD(d);
    e = 0;
    return e | 0;
  }
  function eq(a) {
    a = a | 0;
    c[(a + 12) >> 2] = 0;
    zP(a | 0, 0, 7);
    b[(a + 8) >> 1] = -32768;
    c[(a + 16) >> 2] = 0;
    c[(a + 20) >> 2] = 0;
    c[(a + 24) >> 2] = 32768;
    c[(a + 28) >> 2] = 44100;
    c[(a + 32) >> 2] = 0;
    v2((a + 36) | 0);
    c[(a + 84) >> 2] = 0;
    b[(a + 2136) >> 1] = 0;
    b[(a + 2138) >> 1] = -16385;
    b[(a + 2140) >> 1] = 16385;
    return;
  }
  function er(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0;
    e = a | 0;
    f = c[e >> 2] | 0;
    if ((f | 0) != 0) {
      v7(f);
    }
    f = wa(b) | 0;
    c[e >> 2] = f;
    if ((f | 0) == 0) {
      g = 1;
      return g | 0;
    }
    c[(a + 28) >> 2] = d;
    if ((v9(f, 1, d, 1) | 0) == 0) {
      g = 0;
      return g | 0;
    }
    v7(c[e >> 2] | 0);
    c[e >> 2] = 0;
    g = 1;
    return g | 0;
  }
  function es(a, b) {
    a = a | 0;
    b = b | 0;
    c[(a + 32) >> 2] = b;
    v4((a + 36) | 0, b, c[(a + 28) >> 2] | 0);
    return;
  }
  function et(b, c) {
    b = b | 0;
    c = c | 0;
    eu(b);
    a[(b + 5) | 0] = ((c << 24) >> 24 != 0) | 0;
    return;
  }
  function eu(d) {
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0;
    if ((a[(d + 5) | 0] | 0) == 0) {
      e = -32768;
    } else {
      e =
        b[((a[(d + 6) | 0] | 0) == 0 ? (d + 2140) | 0 : (d + 2138) | 0) >> 1] |
        0;
    }
    f = b1[c[(d + 2148) >> 2] & 1023](c[(d + 2144) >> 2] | 0) | 0;
    g = (d + 16) | 0;
    h = c[g >> 2] | 0;
    i = (f - h) | 0;
    c[g >> 2] = f;
    g = (d + 4) | 0;
    j = (d + 8) | 0;
    k = e & 65535;
    l = (b[j >> 1] | 0) == (e << 16) >> 16;
    if ((a[g] | 0) == 0) {
      if (l) {
        return;
      }
      a[g] = 1;
      b[j >> 1] = -32768;
      c[(d + 12) >> 2] = 0;
      c[(d + 24) >> 2] = 32768;
      c[(d + 20) >> 2] = 0;
      m = (c[(d + 28) >> 2] | 0) >>> 3;
      n = d | 0;
      if ((c[n >> 2] | 0) == 0) {
        return;
      }
      o = (d + 84) | 0;
      p = c[o >> 2] | 0;
      if ((m | 0) == 0) {
        q = p;
      } else {
        r = (d + 88) | 0;
        s = (d + 32) | 0;
        t = (d + 36) | 0;
        u = m;
        m = p;
        while (1) {
          p = (m + 1) | 0;
          b[(d + 88 + (m << 1)) >> 1] = 0;
          if (p >>> 0 > 1023) {
            if ((c[s >> 2] | 0) != 0) {
              vV(t, r, r, p, 1, 1);
            }
            v = c[n >> 2] | 0;
            v8(v, r, p) | 0;
            w = 0;
          } else {
            w = p;
          }
          p = (u - 1) | 0;
          if ((p | 0) == 0) {
            q = w;
            break;
          } else {
            u = p;
            m = w;
          }
        }
      }
      c[o >> 2] = q;
      return;
    }
    do {
      if (l) {
        q = (d + 12) | 0;
        o = ((c[q >> 2] | 0) + i) | 0;
        c[q >> 2] = o;
        if (o >>> 0 <= 2386364) {
          break;
        }
        a[g] = 0;
        o = (d + 84) | 0;
        q = c[o >> 2] | 0;
        if ((q | 0) == 0) {
          return;
        }
        w = (d + 88) | 0;
        m = (d + 36) | 0;
        if ((c[(d + 32) >> 2] | 0) != 0) {
          vV(m, w, w, q, 1, 1);
        }
        u = c[d >> 2] | 0;
        v8(u, w, q) | 0;
        v3(m);
        c[o >> 2] = 0;
        return;
      } else {
        b[j >> 1] = e;
        c[(d + 12) >> 2] = i;
      }
    } while (0);
    e = (d + 24) | 0;
    j = c[e >> 2] | 0;
    if ((f | 0) == (h | 0)) {
      x = j;
    } else {
      h = (d + 28) | 0;
      f = (d + 20) | 0;
      g = d | 0;
      l = (d + 84) | 0;
      o = (d + 88) | 0;
      m = (d + 32) | 0;
      q = (d + 36) | 0;
      w = i;
      i = j;
      j = c[f >> 2] | 0;
      while (1) {
        u = ((((i * 63) | 0) + k) | 0) >>> 6;
        r = (j + (c[h >> 2] | 0)) | 0;
        c[f >> 2] = r;
        if (r >>> 0 > 1193181) {
          if ((c[g >> 2] | 0) == 0) {
            y = r;
          } else {
            n = c[l >> 2] | 0;
            t = (n + 1) | 0;
            b[(d + 88 + (n << 1)) >> 1] = (u ^ 32768) & 65535;
            if (t >>> 0 > 1023) {
              if ((c[m >> 2] | 0) != 0) {
                vV(q, o, o, t, 1, 1);
              }
              n = c[g >> 2] | 0;
              v8(n, o, t) | 0;
              z = 0;
            } else {
              z = t;
            }
            c[l >> 2] = z;
            y = c[f >> 2] | 0;
          }
          t = (y - 1193182) | 0;
          c[f >> 2] = t;
          A = t;
        } else {
          A = r;
        }
        r = (w - 1) | 0;
        if ((r | 0) == 0) {
          x = u;
          break;
        } else {
          w = r;
          i = u;
          j = A;
        }
      }
    }
    c[e >> 2] = x;
    return;
  }
  function ev(b, c) {
    b = b | 0;
    c = c | 0;
    eu(b);
    a[(b + 6) | 0] = ((c << 24) >> 24 != 0) | 0;
    return;
  }
  function ew(a, b) {
    a = a | 0;
    b = b | 0;
    eu(a);
    return;
  }
  function ex(d) {
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0;
    e = i;
    i = (i + 32) | 0;
    f = e | 0;
    g = (e + 8) | 0;
    h = (e + 16) | 0;
    j = (e + 24) | 0;
    yi(d, 27808, f, 0) | 0;
    if ((c[f >> 2] | 0) >>> 0 > 67108863) {
      c[f >> 2] = 67108863;
    }
    yi(d, 35696, g, 0) | 0;
    yi(d, 31896, h, 53248) | 0;
    yl(d, 30096, j, 0) | 0;
    d = (c[g >> 2] | 0) >>> 4;
    c[g >> 2] = d;
    k = ((c[h >> 2] | 0) + 15) & -16;
    c[h >> 2] = k;
    l = zH(44) | 0;
    if ((l | 0) == 0) {
      m = 0;
      i = e;
      return m | 0;
    }
    c[l >> 2] = 0;
    c[(l + 4) >> 2] = 0;
    c[(l + 8) >> 2] = 0;
    c[(l + 12) >> 2] = c[f >> 2];
    n = (l + 32) | 0;
    c[n >> 2] = 0;
    o = (l + 16) | 0;
    zP(o | 0, 0, 14);
    if ((d | 0) != 0) {
      p = r0(k << 4, d << 4, 1) | 0;
      c[n >> 2] = p;
      c[(p + 24) >> 2] = l;
      r3(c[n >> 2] | 0, 0);
      n = c[h >> 2] & 65535;
      b[(l + 24) >> 1] = n;
      p = c[g >> 2] & 65535;
      b[(l + 28) >> 1] = p;
      d = zH(6) | 0;
      c[(l + 20) >> 2] = d;
      c[o >> 2] = 1;
      b[d >> 1] = n;
      b[(d + 2) >> 1] = p;
      a[(d + 4) | 0] = 0;
    }
    if ((c[j >> 2] | 0) == 0) {
      c[(l + 36) >> 2] = 0;
      q = 0;
    } else {
      c[(l + 36) >> 2] = r0(1048576, 65520, 1) | 0;
      q = ((c[j >> 2] | 0) != 0) | 0;
    }
    c[(l + 40) >> 2] = 0;
    j = c[f >> 2] | 0;
    f = c[g >> 2] | 0;
    g = c[h >> 2] | 0;
    xv(
      2,
      28096,
      26512,
      ((x = i),
      (i = (i + 48) | 0),
      (c[x >> 2] = j),
      (c[(x + 8) >> 2] = j >>> 20),
      (c[(x + 16) >> 2] = f << 4),
      (c[(x + 24) >> 2] = f >>> 6),
      (c[(x + 32) >> 2] = g),
      (c[(x + 40) >> 2] = q),
      x) | 0
    );
    m = l;
    i = e;
    return m | 0;
  }
  function ey(d) {
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0;
    e = i;
    dP(
      25088,
      ((x = i),
      (i = (i + 1) | 0),
      (i = ((i + 7) >> 3) << 3),
      (c[x >> 2] = 0),
      x) | 0
    );
    f = d | 0;
    g = c[f >> 2] | 0;
    if ((g | 0) != 0) {
      h = (d + 4) | 0;
      j = 0;
      k = g;
      while (1) {
        g = c[((c[h >> 2] | 0) + (j << 2)) >> 2] | 0;
        if ((g | 0) == 0) {
          l = k;
        } else {
          zI(c[(g + 8) >> 2] | 0);
          zI(g);
          l = c[f >> 2] | 0;
        }
        g = (j + 1) | 0;
        if (g >>> 0 < l >>> 0) {
          j = g;
          k = l;
        } else {
          break;
        }
      }
    }
    l = (d + 28) | 0;
    if ((b[l >> 1] | 0) != 0) {
      r3(c[(d + 32) >> 2] | 0, 0);
      b[(d + 26) >> 1] = 0;
      c[(d + 16) >> 2] = 1;
      k = (d + 20) | 0;
      b[c[k >> 2] >> 1] = b[(d + 24) >> 1] | 0;
      b[((c[k >> 2] | 0) + 2) >> 1] = b[l >> 1] | 0;
      a[((c[k >> 2] | 0) + 4) | 0] = 0;
    }
    k = c[(d + 36) >> 2] | 0;
    if ((k | 0) == 0) {
      c[f >> 2] = 0;
      m = (d + 8) | 0;
      c[m >> 2] = 0;
      n = (d + 40) | 0;
      c[n >> 2] = 0;
      i = e;
      return;
    }
    r3(k, 0);
    c[f >> 2] = 0;
    m = (d + 8) | 0;
    c[m >> 2] = 0;
    n = (d + 40) | 0;
    c[n >> 2] = 0;
    i = e;
    return;
  }
  function ez(b) {
    b = b | 0;
    var d = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0;
    d = i;
    f = (b + 8) | 0;
    g = (b + 12) | 0;
    h = (c[g >> 2] | 0) >>> 10;
    j = (b + 26) | 0;
    k = (e[j >> 1] | 0) >>> 6;
    l = (b + 28) | 0;
    m = (e[l >> 1] | 0) >>> 6;
    n = (c[(b + 36) >> 2] | 0) != 0 ? 63 : 0;
    w2(
      23800,
      ((x = i),
      (i = (i + 48) | 0),
      (c[x >> 2] = (c[f >> 2] | 0) >>> 10),
      (c[(x + 8) >> 2] = h),
      (c[(x + 16) >> 2] = k),
      (c[(x + 24) >> 2] = m),
      (c[(x + 32) >> 2] = n),
      (c[(x + 40) >> 2] = n),
      x) | 0
    );
    n = b | 0;
    m = c[f >> 2] | 0;
    f = c[g >> 2] | 0;
    w2(
      22248,
      ((x = i),
      (i = (i + 24) | 0),
      (c[x >> 2] = c[n >> 2]),
      (c[(x + 8) >> 2] = m),
      (c[(x + 16) >> 2] = f),
      x) | 0
    );
    if ((c[n >> 2] | 0) != 0) {
      f = (b + 4) | 0;
      m = 0;
      do {
        g = c[((c[f >> 2] | 0) + (m << 2)) >> 2] | 0;
        k = (c[g >> 2] | 0) >>> 10;
        h = ((c[(g + 4) >> 2] | 0) != 0) | 0;
        w2(
          21152,
          ((x = i),
          (i = (i + 24) | 0),
          (c[x >> 2] = m),
          (c[(x + 8) >> 2] = k),
          (c[(x + 16) >> 2] = h),
          x) | 0
        );
        m = (m + 1) | 0;
      } while (m >>> 0 < (c[n >> 2] | 0) >>> 0);
    }
    n = (b + 16) | 0;
    m = e[j >> 1] << 4;
    j = e[l >> 1] << 4;
    w2(
      41224,
      ((x = i),
      (i = (i + 24) | 0),
      (c[x >> 2] = c[n >> 2]),
      (c[(x + 8) >> 2] = m),
      (c[(x + 16) >> 2] = j),
      x) | 0
    );
    if ((c[n >> 2] | 0) == 0) {
      i = d;
      return;
    }
    j = (b + 20) | 0;
    b = 0;
    do {
      m = c[j >> 2] | 0;
      l = e[(m + ((b * 6) | 0)) >> 1] | 0;
      f = e[(m + ((b * 6) | 0) + 2) >> 1] << 4;
      h = ((a[(m + ((b * 6) | 0) + 4) | 0] | 0) != 0) | 0;
      w2(
        39944,
        ((x = i),
        (i = (i + 32) | 0),
        (c[x >> 2] = b),
        (c[(x + 8) >> 2] = l),
        (c[(x + 16) >> 2] = f),
        (c[(x + 24) >> 2] = h),
        x) | 0
      );
      b = (b + 1) | 0;
    } while (b >>> 0 < (c[n >> 2] | 0) >>> 0);
    i = d;
    return;
  }
  function eA(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0;
    e = (a + 8) | 0;
    if ((((c[(a + 12) >> 2] | 0) - (c[e >> 2] | 0)) | 0) >>> 0 < b >>> 0) {
      f = 1;
      return f | 0;
    }
    g = a | 0;
    h = c[g >> 2] | 0;
    i = (a + 4) | 0;
    a = 0;
    while (1) {
      if (a >>> 0 >= h >>> 0) {
        j = 2091;
        break;
      }
      k = (a + 1) | 0;
      if ((c[((c[i >> 2] | 0) + (a << 2)) >> 2] | 0) == 0) {
        l = k;
        break;
      } else {
        a = k;
      }
    }
    if ((j | 0) == 2091) {
      l = (a + 1) | 0;
    }
    c[d >> 2] = l;
    d = zH(12) | 0;
    a = d;
    L2696: do {
      if ((d | 0) == 0) {
        m = 0;
      } else {
        do {
          if ((b | 0) == 0) {
            c[(d + 8) >> 2] = 0;
          } else {
            j = zH(b) | 0;
            c[(d + 8) >> 2] = j;
            if ((j | 0) != 0) {
              break;
            }
            zI(d);
            m = 0;
            break L2696;
          }
        } while (0);
        c[d >> 2] = b;
        c[(d + 4) >> 2] = 0;
        m = a;
      }
    } while (0);
    if ((l | 0) != 0) {
      a = c[g >> 2] | 0;
      L2706: do {
        if (a >>> 0 < l >>> 0) {
          c[g >> 2] = l;
          d = zJ(c[i >> 2] | 0, (l * 12) | 0) | 0;
          c[i >> 2] = d;
          j = c[g >> 2] | 0;
          if (a >>> 0 >= j >>> 0) {
            break;
          }
          c[(d + (a << 2)) >> 2] = 0;
          h = (a + 1) | 0;
          if (h >>> 0 < j >>> 0) {
            n = h;
            o = d;
          } else {
            break;
          }
          while (1) {
            c[(o + (n << 2)) >> 2] = 0;
            d = (n + 1) | 0;
            if (d >>> 0 >= (c[g >> 2] | 0) >>> 0) {
              break L2706;
            }
            n = d;
            o = c[i >> 2] | 0;
          }
        }
      } while (0);
      c[((c[i >> 2] | 0) + ((l - 1) << 2)) >> 2] = m;
    }
    c[e >> 2] = (c[e >> 2] | 0) + b;
    f = 0;
    return f | 0;
  }
  function eB(d, e, f) {
    d = d | 0;
    e = e | 0;
    f = f | 0;
    var g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0;
    g = (d + 16) | 0;
    h = c[g >> 2] | 0;
    if ((h | 0) == 0) {
      i = 1;
      return i | 0;
    }
    j = (d + 20) | 0;
    k = c[j >> 2] | 0;
    l = 0;
    while (1) {
      if ((a[(k + ((l * 6) | 0) + 4) | 0] | 0) == 0) {
        m = b[(k + ((l * 6) | 0) + 2) >> 1] | 0;
        if ((m & 65535) >= (e & 65535)) {
          break;
        }
      }
      n = (l + 1) | 0;
      if (n >>> 0 < h >>> 0) {
        l = n;
      } else {
        i = 1;
        o = 2120;
        break;
      }
    }
    if ((o | 0) == 2120) {
      return i | 0;
    }
    if ((m & 65535) > (e & 65535)) {
      m = (h + 1) | 0;
      c[g >> 2] = m;
      h = zJ(k, (m * 6) | 0) | 0;
      c[j >> 2] = h;
      m = c[g >> 2] | 0;
      g = (m - 1) | 0;
      if (g >>> 0 > l >>> 0) {
        o = m;
        m = g;
        g = h;
        while (1) {
          n = (g + ((m * 6) | 0)) | 0;
          p = (g + ((((o - 2) | 0) * 6) | 0)) | 0;
          b[n >> 1] = b[p >> 1] | 0;
          b[(n + 2) >> 1] = b[(p + 2) >> 1] | 0;
          b[(n + 4) >> 1] = b[(p + 4) >> 1] | 0;
          p = (m - 1) | 0;
          n = c[j >> 2] | 0;
          if (p >>> 0 > l >>> 0) {
            o = m;
            m = p;
            g = n;
          } else {
            q = n;
            break;
          }
        }
      } else {
        q = h;
      }
      h = (l + 1) | 0;
      b[(q + ((h * 6) | 0)) >> 1] =
        ((b[(q + ((l * 6) | 0)) >> 1] | 0) + e) & 65535;
      q = c[j >> 2] | 0;
      b[(q + ((h * 6) | 0) + 2) >> 1] =
        ((b[(q + ((l * 6) | 0) + 2) >> 1] | 0) - e) & 65535;
      a[((c[j >> 2] | 0) + ((h * 6) | 0) + 4) | 0] = 0;
      b[((c[j >> 2] | 0) + ((l * 6) | 0) + 2) >> 1] = e;
      r = c[j >> 2] | 0;
    } else {
      r = k;
    }
    a[(r + ((l * 6) | 0) + 4) | 0] = 1;
    r = (d + 26) | 0;
    b[r >> 1] =
      ((b[r >> 1] | 0) + (b[((c[j >> 2] | 0) + ((l * 6) | 0) + 2) >> 1] | 0)) &
      65535;
    c[f >> 2] = l;
    i = 0;
    return i | 0;
  }
  function eC(a, d) {
    a = a | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0;
    if ((a | 0) == 0) {
      e = 0;
      f = (d + 4) | 0;
      b[f >> 1] = e;
      return;
    }
    g = (c[(a + 36) >> 2] | 0) == 0 ? 1 : 3;
    b[(d + 6) >> 1] = b[(a + 28) >> 1] | 0;
    b[(d + 8) >> 1] = ((c[(a + 12) >> 2] | 0) >>> 10) & 65535;
    e = g;
    f = (d + 4) | 0;
    b[f >> 1] = e;
    return;
  }
  function eD(f, g) {
    f = f | 0;
    g = g | 0;
    var h = 0,
      i = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0,
      C = 0,
      D = 0,
      E = 0,
      F = 0,
      G = 0,
      H = 0,
      I = 0,
      J = 0,
      K = 0,
      L = 0,
      M = 0,
      N = 0,
      O = 0,
      P = 0,
      Q = 0;
    h = (g + 4) | 0;
    i = b[(g + 16) >> 1] | 0;
    j = (e[(g + 26) >> 1] | 0) << 4;
    k = (g + 80) | 0;
    l = c[k >> 2] | 0;
    m = (j + (i & 65535)) & l;
    n = (m + 1) | 0;
    o = (g + 76) | 0;
    p = c[o >> 2] | 0;
    if (n >>> 0 < p >>> 0) {
      q = c[(g + 72) >> 2] | 0;
      r = ((d[(q + n) | 0] | 0) << 8) | (d[(q + m) | 0] | 0);
      s = l;
      t = p;
    } else {
      p = b8[c[(g + 44) >> 2] & 255](c[(g + 32) >> 2] | 0, m) | 0;
      r = p;
      s = c[k >> 2] | 0;
      t = c[o >> 2] | 0;
    }
    p = s & (((i + 2) & 65535) + j);
    m = (p + 1) | 0;
    if (m >>> 0 < t >>> 0) {
      l = c[(g + 72) >> 2] | 0;
      u = ((d[(l + m) | 0] | 0) << 8) | (d[(l + p) | 0] | 0);
      v = s;
      w = t;
    } else {
      t = b8[c[(g + 44) >> 2] & 255](c[(g + 32) >> 2] | 0, p) | 0;
      u = t;
      v = c[k >> 2] | 0;
      w = c[o >> 2] | 0;
    }
    t = ((u & 65535) << 16) | (r & 65535);
    r = v & (((i + 4) & 65535) + j);
    u = (r + 1) | 0;
    if (u >>> 0 < w >>> 0) {
      p = c[(g + 72) >> 2] | 0;
      x = ((d[(p + u) | 0] | 0) << 8) | (d[(p + r) | 0] | 0);
      y = v;
      z = w;
    } else {
      w = b8[c[(g + 44) >> 2] & 255](c[(g + 32) >> 2] | 0, r) | 0;
      x = w;
      y = c[k >> 2] | 0;
      z = c[o >> 2] | 0;
    }
    w = x & 65535;
    r = y & (((i + 6) & 65535) + j);
    v = (r + 1) | 0;
    if (v >>> 0 < z >>> 0) {
      p = c[(g + 72) >> 2] | 0;
      A = ((d[(p + v) | 0] | 0) << 8) | (d[(p + r) | 0] | 0);
      B = y;
      C = z;
    } else {
      z = b8[c[(g + 44) >> 2] & 255](c[(g + 32) >> 2] | 0, r) | 0;
      A = z;
      B = c[k >> 2] | 0;
      C = c[o >> 2] | 0;
    }
    z = B & (((i + 8) & 65535) + j);
    r = (z + 1) | 0;
    if (r >>> 0 < C >>> 0) {
      y = c[(g + 72) >> 2] | 0;
      D = ((d[(y + r) | 0] | 0) << 8) | (d[(y + z) | 0] | 0);
      E = B;
      F = C;
    } else {
      C = b8[c[(g + 44) >> 2] & 255](c[(g + 32) >> 2] | 0, z) | 0;
      D = C;
      E = c[k >> 2] | 0;
      F = c[o >> 2] | 0;
    }
    C = ((D & 65535) << 16) | (A & 65535);
    z = E & (((i + 10) & 65535) + j);
    B = (z + 1) | 0;
    if (B >>> 0 < F >>> 0) {
      y = c[(g + 72) >> 2] | 0;
      G = ((d[(y + B) | 0] | 0) << 8) | (d[(y + z) | 0] | 0);
      H = E;
      I = F;
    } else {
      F = b8[c[(g + 44) >> 2] & 255](c[(g + 32) >> 2] | 0, z) | 0;
      G = F;
      H = c[k >> 2] | 0;
      I = c[o >> 2] | 0;
    }
    F = G & 65535;
    z = H & (((i + 12) & 65535) + j);
    E = (z + 1) | 0;
    if (E >>> 0 < I >>> 0) {
      y = c[(g + 72) >> 2] | 0;
      J = ((d[(y + E) | 0] | 0) << 8) | (d[(y + z) | 0] | 0);
      K = H;
      L = I;
    } else {
      I = b8[c[(g + 44) >> 2] & 255](c[(g + 32) >> 2] | 0, z) | 0;
      J = I;
      K = c[k >> 2] | 0;
      L = c[o >> 2] | 0;
    }
    I = K & (((i + 14) & 65535) + j);
    j = (I + 1) | 0;
    if (j >>> 0 < L >>> 0) {
      L = c[(g + 72) >> 2] | 0;
      M = ((d[(L + j) | 0] | 0) << 8) | (d[(L + I) | 0] | 0);
    } else {
      M = b8[c[(g + 44) >> 2] & 255](c[(g + 32) >> 2] | 0, I) | 0;
    }
    I = ((M & 65535) << 16) | (J & 65535);
    L = (G << 16) >> 16 == 0;
    L2773: do {
      if (((G | x) << 16) >> 16 == 0) {
        if ((t | 0) == 0) {
          break;
        }
        j = (g + 72) | 0;
        i = (g + 40) | 0;
        K = (g + 32) | 0;
        z = (g + 36) | 0;
        H = D;
        y = A;
        E = M;
        B = J;
        r = 1;
        while (1) {
          p = c[k >> 2] | 0;
          v = p & (((H & 65535) << 4) + (y & 65535));
          u = c[o >> 2] | 0;
          if (v >>> 0 < u >>> 0) {
            N = a[((c[j >> 2] | 0) + v) | 0] | 0;
            O = p;
            P = u;
          } else {
            u = b8[c[z >> 2] & 255](c[K >> 2] | 0, v) | 0;
            N = u;
            O = c[k >> 2] | 0;
            P = c[o >> 2] | 0;
          }
          u = O & (((E & 65535) << 4) + (B & 65535));
          if (u >>> 0 < P >>> 0) {
            a[((c[j >> 2] | 0) + u) | 0] = N;
          } else {
            b5[c[i >> 2] & 255](c[K >> 2] | 0, u, N);
          }
          u = (y + 1) & 65535;
          v = (B + 1) & 65535;
          if (r >>> 0 >= t >>> 0) {
            break L2773;
          }
          H = (((u & 65535) >>> 4) + H) & 65535;
          y = u & 15;
          E = (((v & 65535) >>> 4) + E) & 65535;
          B = v & 15;
          r = (r + 1) | 0;
        }
      } else {
        r = (x << 16) >> 16 != 0;
        if (r & L) {
          do {
            if ((c[f >> 2] | 0) >>> 0 >= w >>> 0) {
              B = c[((c[(f + 4) >> 2] | 0) + ((w - 1) << 2)) >> 2] | 0;
              if ((B | 0) == 0) {
                break;
              }
              E = c[B >> 2] | 0;
              if (C >>> 0 >= E >>> 0) {
                b[h >> 1] = 0;
                y = (g + 10) | 0;
                b[y >> 1] = (b[y >> 1] & -256) | 164;
                return;
              }
              if (((C + t) | 0) >>> 0 > E >>> 0) {
                b[h >> 1] = 0;
                E = (g + 10) | 0;
                b[E >> 1] = (b[E >> 1] & -256) | 167;
              }
              if ((t | 0) == 0) {
                break L2773;
              }
              E = (B + 8) | 0;
              B = (g + 72) | 0;
              y = (g + 40) | 0;
              H = (g + 32) | 0;
              K = M;
              i = J;
              j = 0;
              while (1) {
                z = a[((c[E >> 2] | 0) + (j + C)) | 0] | 0;
                v = c[k >> 2] & (((K & 65535) << 4) + (i & 65535));
                if (v >>> 0 < (c[o >> 2] | 0) >>> 0) {
                  a[((c[B >> 2] | 0) + v) | 0] = z;
                } else {
                  b5[c[y >> 2] & 255](c[H >> 2] | 0, v, z);
                }
                z = (i + 1) & 65535;
                v = (j + 1) | 0;
                if (v >>> 0 >= t >>> 0) {
                  break L2773;
                }
                K = (((z & 65535) >>> 4) + K) & 65535;
                i = z & 15;
                j = v;
              }
            }
          } while (0);
          b[h >> 1] = 0;
          j = (g + 10) | 0;
          b[j >> 1] = (b[j >> 1] & -256) | 163;
          return;
        }
        if (!(r | L)) {
          do {
            if ((c[f >> 2] | 0) >>> 0 >= F >>> 0) {
              j = c[((c[(f + 4) >> 2] | 0) + ((F - 1) << 2)) >> 2] | 0;
              if ((j | 0) == 0) {
                break;
              }
              i = c[j >> 2] | 0;
              if (I >>> 0 >= i >>> 0) {
                b[h >> 1] = 0;
                K = (g + 10) | 0;
                b[K >> 1] = (b[K >> 1] & -256) | 166;
                return;
              }
              if (((I + t) | 0) >>> 0 > i >>> 0) {
                b[h >> 1] = 0;
                i = (g + 10) | 0;
                b[i >> 1] = (b[i >> 1] & -256) | 167;
                return;
              }
              if ((t | 0) == 0) {
                break L2773;
              }
              i = (g + 72) | 0;
              K = (j + 8) | 0;
              j = (g + 36) | 0;
              H = (g + 32) | 0;
              y = D;
              B = A;
              E = 0;
              while (1) {
                v = c[k >> 2] & (((y & 65535) << 4) + (B & 65535));
                if (v >>> 0 < (c[o >> 2] | 0) >>> 0) {
                  Q = a[((c[i >> 2] | 0) + v) | 0] | 0;
                } else {
                  Q = b8[c[j >> 2] & 255](c[H >> 2] | 0, v) | 0;
                }
                a[((c[K >> 2] | 0) + (E + I)) | 0] = Q;
                v = (B + 1) & 65535;
                z = (E + 1) | 0;
                if (z >>> 0 >= t >>> 0) {
                  break L2773;
                }
                y = (((v & 65535) >>> 4) + y) & 65535;
                B = v & 15;
                E = z;
              }
            }
          } while (0);
          b[h >> 1] = 0;
          r = (g + 10) | 0;
          b[r >> 1] = (b[r >> 1] & -256) | 165;
          return;
        }
        do {
          if ((x << 16) >> 16 != 0) {
            r = f | 0;
            if ((c[r >> 2] | 0) >>> 0 < w >>> 0) {
              break;
            }
            E = (f + 4) | 0;
            B = c[((c[E >> 2] | 0) + ((w - 1) << 2)) >> 2] | 0;
            if ((B | 0) == 0) {
              break;
            }
            y = c[B >> 2] | 0;
            if (C >>> 0 >= y >>> 0) {
              b[h >> 1] = 0;
              K = (g + 10) | 0;
              b[K >> 1] = (b[K >> 1] & -256) | 164;
              return;
            }
            if (((C + t) | 0) >>> 0 > y >>> 0) {
              b[h >> 1] = 0;
              y = (g + 10) | 0;
              b[y >> 1] = (b[y >> 1] & -256) | 167;
            }
            do {
              if (!L) {
                if ((c[r >> 2] | 0) >>> 0 < F >>> 0) {
                  break;
                }
                y = c[((c[E >> 2] | 0) + ((F - 1) << 2)) >> 2] | 0;
                if ((y | 0) == 0) {
                  break;
                }
                K = c[y >> 2] | 0;
                if (I >>> 0 >= K >>> 0) {
                  b[h >> 1] = 0;
                  H = (g + 10) | 0;
                  b[H >> 1] = (b[H >> 1] & -256) | 166;
                  return;
                }
                if (((I + t) | 0) >>> 0 > K >>> 0) {
                  b[h >> 1] = 0;
                  K = (g + 10) | 0;
                  b[K >> 1] = (b[K >> 1] & -256) | 167;
                }
                K = c[(y + 8) >> 2] | 0;
                y = c[(B + 8) >> 2] | 0;
                zO(K | 0, y | 0, t) | 0;
                break L2773;
              }
            } while (0);
            b[h >> 1] = 0;
            B = (g + 10) | 0;
            b[B >> 1] = (b[B >> 1] & -256) | 165;
            return;
          }
        } while (0);
        b[h >> 1] = 0;
        B = (g + 10) | 0;
        b[B >> 1] = (b[B >> 1] & -256) | 163;
        return;
      }
    } while (0);
    b[h >> 1] = 1;
    h = (g + 10) | 0;
    b[h >> 1] = b[h >> 1] & -256;
    return;
  }
  function eE(a, d) {
    a = a | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0;
    e = (d + 4) | 0;
    f = (d + 10) | 0;
    g = b[f >> 1] | 0;
    h = (g & 65535) << 10;
    i = (a + 8) | 0;
    if (h >>> 0 > (((c[(a + 12) >> 2] | 0) - (c[i >> 2] | 0)) | 0) >>> 0) {
      b[e >> 1] = 0;
      b[f >> 1] = (g & -256) | 160;
      return;
    }
    j = b[(d + 8) >> 1] | 0;
    d = j & 65535;
    do {
      if ((j << 16) >> 16 != 0) {
        if ((c[a >> 2] | 0) >>> 0 < d >>> 0) {
          break;
        }
        k = c[((c[(a + 4) >> 2] | 0) + ((d - 1) << 2)) >> 2] | 0;
        if ((k | 0) == 0) {
          break;
        }
        l = (k + 8) | 0;
        m = zJ(c[l >> 2] | 0, h) | 0;
        if ((m | 0) == 0) {
          b[e >> 1] = 0;
          b[f >> 1] = (b[f >> 1] & -256) | 160;
          return;
        } else {
          n = ((c[i >> 2] | 0) + h) | 0;
          c[i >> 2] = n;
          o = k | 0;
          c[i >> 2] = n - (c[o >> 2] | 0);
          c[l >> 2] = m;
          c[o >> 2] = h;
          b[e >> 1] = 1;
          return;
        }
      }
    } while (0);
    b[e >> 1] = 0;
    b[f >> 1] = (g & -256) | 162;
    return;
  }
  function eF(d, e) {
    d = d | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0,
      A = 0,
      B = 0;
    f = (e + 4) | 0;
    g = b[(e + 8) >> 1] | 0;
    h = (d + 16) | 0;
    i = c[h >> 2] | 0;
    j = (d + 20) | 0;
    k = 0;
    while (1) {
      if (k >>> 0 >= i >>> 0) {
        break;
      }
      l = c[j >> 2] | 0;
      if ((b[(l + ((k * 6) | 0)) >> 1] | 0) == (g << 16) >> 16) {
        m = 2239;
        break;
      } else {
        k = (k + 1) | 0;
      }
    }
    do {
      if ((m | 0) == 2239) {
        g = (l + ((k * 6) | 0) + 4) | 0;
        if ((a[g] | 0) == 0) {
          break;
        }
        a[g] = 0;
        g = c[j >> 2] | 0;
        i = (d + 26) | 0;
        b[i >> 1] =
          ((b[i >> 1] | 0) - (b[(g + ((k * 6) | 0) + 2) >> 1] | 0)) & 65535;
        i = c[h >> 2] | 0;
        L2886: do {
          if ((i | 0) == 0) {
            n = 0;
          } else {
            o = 0;
            p = 0;
            q = i;
            r = g;
            while (1) {
              s = (o + 1) | 0;
              L2889: do {
                if (
                  ((a[(r + ((o * 6) | 0) + 4) | 0] | 0) == 0) &
                  (s >>> 0 < q >>> 0)
                ) {
                  if ((a[(r + ((s * 6) | 0) + 4) | 0] | 0) == 0) {
                    t = r;
                    u = s;
                  } else {
                    v = s;
                    w = q;
                    break;
                  }
                  while (1) {
                    x = (t + ((o * 6) | 0) + 2) | 0;
                    b[x >> 1] =
                      ((b[x >> 1] | 0) +
                        (b[(t + ((u * 6) | 0) + 2) >> 1] | 0)) &
                      65535;
                    x = (u + 1) | 0;
                    y = c[h >> 2] | 0;
                    if (x >>> 0 >= y >>> 0) {
                      v = x;
                      w = y;
                      break L2889;
                    }
                    z = c[j >> 2] | 0;
                    if ((a[(z + ((x * 6) | 0) + 4) | 0] | 0) == 0) {
                      t = z;
                      u = x;
                    } else {
                      v = x;
                      w = y;
                      break;
                    }
                  }
                } else {
                  v = s;
                  w = q;
                }
              } while (0);
              if ((o | 0) == (p | 0)) {
                A = w;
              } else {
                s = c[j >> 2] | 0;
                y = (s + ((p * 6) | 0)) | 0;
                x = (s + ((o * 6) | 0)) | 0;
                b[y >> 1] = b[x >> 1] | 0;
                b[(y + 2) >> 1] = b[(x + 2) >> 1] | 0;
                b[(y + 4) >> 1] = b[(x + 4) >> 1] | 0;
                A = c[h >> 2] | 0;
              }
              x = (p + 1) | 0;
              if (v >>> 0 >= A >>> 0) {
                n = x;
                break L2886;
              }
              o = v;
              p = x;
              q = A;
              r = c[j >> 2] | 0;
            }
          }
        } while (0);
        c[h >> 2] = n;
        B = f | 0;
        b[B >> 1] = 1;
        return;
      }
    } while (0);
    n = f | 0;
    b[n >> 1] = 1;
    f = (e + 10) | 0;
    b[f >> 1] = (b[f >> 1] & -256) | 178;
    B = n;
    b[B >> 1] = 1;
    return;
  }
  function eG(d, f) {
    d = d | 0;
    f = f | 0;
    var g = 0,
      h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      y = 0,
      z = 0,
      A = 0;
    g = i;
    i = (i + 16) | 0;
    h = g | 0;
    j = (g + 8) | 0;
    k = (f + 4) | 0;
    do {
      if ((d | 0) == 0) {
        b[k >> 1] = 0;
        l = (f + 10) | 0;
        b[l >> 1] = (b[l >> 1] & -256) | 128;
        m = (f + 4) | 0;
      } else {
        l = (e[k >> 1] | 0) >>> 8;
        n = (f + 4) | 0;
        if ((l | 0) == 0) {
          m = n;
          break;
        } else if ((l | 0) == 13) {
          o = (f + 4) | 0;
          p = b[(f + 8) >> 1] | 0;
          q = p & 65535;
          do {
            if ((p << 16) >> 16 != 0) {
              if ((c[d >> 2] | 0) >>> 0 < q >>> 0) {
                break;
              }
              r = c[((c[(d + 4) >> 2] | 0) + ((q - 1) << 2)) >> 2] | 0;
              if ((r | 0) == 0) {
                break;
              }
              s = (r + 4) | 0;
              r = c[s >> 2] | 0;
              if ((r | 0) == 0) {
                b[o >> 1] = 0;
                t = (f + 10) | 0;
                b[t >> 1] = (b[t >> 1] & -256) | 170;
                i = g;
                return;
              } else {
                c[s >> 2] = r - 1;
                b[o >> 1] = 1;
                i = g;
                return;
              }
            }
          } while (0);
          b[o >> 1] = 0;
          q = (f + 10) | 0;
          b[q >> 1] = (b[q >> 1] & -256) | 162;
          i = g;
          return;
        } else if ((l | 0) == 1) {
          if ((c[(d + 36) >> 2] | 0) == 0) {
            b[n >> 1] = 0;
            q = (f + 10) | 0;
            b[q >> 1] = (b[q >> 1] & -256) | 144;
            i = g;
            return;
          }
          q = (d + 40) | 0;
          if ((c[q >> 2] | 0) == 0) {
            c[q >> 2] = 1;
            b[n >> 1] = 1;
            q = (f + 10) | 0;
            b[q >> 1] = b[q >> 1] & -256;
            i = g;
            return;
          } else {
            b[n >> 1] = 0;
            q = (f + 10) | 0;
            b[q >> 1] = (b[q >> 1] & -256) | 145;
            i = g;
            return;
          }
        } else if ((l | 0) == 17) {
          eF(d, f);
          i = g;
          return;
        } else if ((l | 0) == 6) {
          hI(f, 1048575);
          b[n >> 1] = 1;
          q = (f + 10) | 0;
          b[q >> 1] = b[q >> 1] & -256;
          i = g;
          return;
        } else if ((l | 0) == 7) {
          b[n >> 1] = ((hJ(f) | 0) >>> 20) & 1;
          q = (f + 10) | 0;
          b[q >> 1] = b[q >> 1] & -256;
          i = g;
          return;
        } else if ((l | 0) == 12) {
          q = (f + 4) | 0;
          p = (f + 8) | 0;
          r = b[p >> 1] | 0;
          s = r & 65535;
          do {
            if ((r << 16) >> 16 != 0) {
              if ((c[d >> 2] | 0) >>> 0 < s >>> 0) {
                break;
              }
              t = c[((c[(d + 4) >> 2] | 0) + ((s - 1) << 2)) >> 2] | 0;
              if ((t | 0) == 0) {
                break;
              }
              u = (t + 4) | 0;
              c[u >> 2] = (c[u >> 2] | 0) + 1;
              b[q >> 1] = 1;
              b[(f + 10) >> 1] = 0;
              b[p >> 1] = 1;
              i = g;
              return;
            }
          } while (0);
          b[q >> 1] = 0;
          p = (f + 10) | 0;
          b[p >> 1] = (b[p >> 1] & -256) | 162;
          i = g;
          return;
        } else if ((l | 0) == 3) {
          hI(f, -1);
          b[n >> 1] = 1;
          p = (f + 10) | 0;
          b[p >> 1] = b[p >> 1] & -256;
          i = g;
          return;
        } else if ((l | 0) == 11) {
          eD(d, f);
          i = g;
          return;
        } else if ((l | 0) == 10) {
          p = b[(f + 8) >> 1] | 0;
          s = p & 65535;
          do {
            if ((p << 16) >> 16 != 0) {
              if ((c[d >> 2] | 0) >>> 0 < s >>> 0) {
                break;
              }
              r = (s - 1) | 0;
              o = (d + 4) | 0;
              u = c[o >> 2] | 0;
              t = (u + (r << 2)) | 0;
              v = c[t >> 2] | 0;
              do {
                if ((v | 0) == 0) {
                  w = u;
                } else {
                  y = (d + 8) | 0;
                  c[y >> 2] = (c[y >> 2] | 0) - (c[v >> 2] | 0);
                  y = c[t >> 2] | 0;
                  if ((y | 0) == 0) {
                    w = u;
                    break;
                  }
                  zI(c[(y + 8) >> 2] | 0);
                  zI(y);
                  w = c[o >> 2] | 0;
                }
              } while (0);
              c[(w + (r << 2)) >> 2] = 0;
              b[n >> 1] = 1;
              o = (f + 10) | 0;
              b[o >> 1] = b[o >> 1] & -256;
              i = g;
              return;
            }
          } while (0);
          b[n >> 1] = 0;
          s = (f + 10) | 0;
          b[s >> 1] = (b[s >> 1] & -256) | 162;
          i = g;
          return;
        } else if ((l | 0) == 4) {
          hI(f, 1048575);
          b[n >> 1] = 1;
          s = (f + 10) | 0;
          b[s >> 1] = b[s >> 1] & -256;
          i = g;
          return;
        } else if ((l | 0) == 5) {
          hI(f, -1);
          b[n >> 1] = 1;
          s = (f + 10) | 0;
          b[s >> 1] = b[s >> 1] & -256;
          i = g;
          return;
        } else if ((l | 0) == 15) {
          eE(d, f);
          i = g;
          return;
        } else if ((l | 0) == 16) {
          s = (f + 8) | 0;
          if ((eB(d, b[s >> 1] | 0, j) | 0) == 0) {
            b[n >> 1] = 1;
            p = c[j >> 2] | 0;
            q = (d + 20) | 0;
            b[s >> 1] = b[((c[q >> 2] | 0) + ((p * 6) | 0) + 2) >> 1] | 0;
            b[(f + 10) >> 1] = b[((c[q >> 2] | 0) + ((p * 6) | 0)) >> 1] | 0;
            i = g;
            return;
          }
          b[n >> 1] = 0;
          p = c[(d + 16) >> 2] | 0;
          if ((p | 0) == 0) {
            z = 0;
          } else {
            q = c[(d + 20) >> 2] | 0;
            o = 0;
            u = 0;
            while (1) {
              if ((a[(q + ((o * 6) | 0) + 4) | 0] | 0) == 0) {
                t = b[(q + ((o * 6) | 0) + 2) >> 1] | 0;
                A = (t & 65535) > (u & 65535) ? t : u;
              } else {
                A = u;
              }
              t = (o + 1) | 0;
              if (t >>> 0 < p >>> 0) {
                o = t;
                u = A;
              } else {
                z = A;
                break;
              }
            }
          }
          b[s >> 1] = z;
          u = (f + 10) | 0;
          b[u >> 1] = (b[u >> 1] & -256) | ((z << 16) >> 16 == 0 ? 177 : 176);
          i = g;
          return;
        } else if ((l | 0) == 2) {
          if ((c[(d + 36) >> 2] | 0) == 0) {
            b[n >> 1] = 0;
            u = (f + 10) | 0;
            b[u >> 1] = (b[u >> 1] & -256) | 144;
            i = g;
            return;
          }
          u = (d + 40) | 0;
          if ((c[u >> 2] | 0) == 0) {
            b[n >> 1] = 0;
            o = (f + 10) | 0;
            b[o >> 1] = (b[o >> 1] & -256) | 147;
            i = g;
            return;
          } else {
            c[u >> 2] = 0;
            b[n >> 1] = 1;
            u = (f + 10) | 0;
            b[u >> 1] = b[u >> 1] & -256;
            i = g;
            return;
          }
        } else if ((l | 0) == 8) {
          u = (d + 12) | 0;
          o = (d + 8) | 0;
          b[n >> 1] =
            ((((c[u >> 2] | 0) - (c[o >> 2] | 0)) | 0) >>> 10) & 65535;
          b[(f + 8) >> 1] =
            ((((c[u >> 2] | 0) - (c[o >> 2] | 0)) | 0) >>> 10) & 65535;
          o = (f + 10) | 0;
          b[o >> 1] = b[o >> 1] & -256;
          i = g;
          return;
        } else if ((l | 0) == 9) {
          o = (f + 4) | 0;
          u = (f + 8) | 0;
          p = e[u >> 1] << 10;
          if (
            p >>> 0 >
            (((c[(d + 12) >> 2] | 0) - (c[(d + 8) >> 2] | 0)) | 0) >>> 0
          ) {
            b[o >> 1] = 0;
            q = (f + 10) | 0;
            b[q >> 1] = (b[q >> 1] & -256) | 160;
            i = g;
            return;
          }
          q = o | 0;
          if ((eA(d, p, h) | 0) == 0) {
            b[q >> 1] = 1;
            b[u >> 1] = c[h >> 2] & 65535;
            u = (f + 10) | 0;
            b[u >> 1] = b[u >> 1] & -256;
            i = g;
            return;
          } else {
            b[q >> 1] = 0;
            q = (f + 10) | 0;
            b[q >> 1] = (b[q >> 1] & -256) | 161;
            i = g;
            return;
          }
        } else if ((l | 0) == 14) {
          q = (f + 8) | 0;
          u = b[q >> 1] | 0;
          p = u & 65535;
          do {
            if ((u << 16) >> 16 != 0) {
              if ((c[d >> 2] | 0) >>> 0 < p >>> 0) {
                break;
              }
              o = c[((c[(d + 4) >> 2] | 0) + ((p - 1) << 2)) >> 2] | 0;
              if ((o | 0) == 0) {
                break;
              }
              b[n >> 1] = 1;
              b[(f + 10) >> 1] = ((c[(o + 4) >> 2] << 8) & 65535) | 255;
              b[q >> 1] = ((c[o >> 2] | 0) >>> 10) & 65535;
              i = g;
              return;
            }
          } while (0);
          b[n >> 1] = 0;
          q = (f + 10) | 0;
          b[q >> 1] = (b[q >> 1] & -256) | 162;
          i = g;
          return;
        } else {
          xt(3, 38592, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = l), x) | 0);
          b[n >> 1] = 0;
          q = (f + 10) | 0;
          b[q >> 1] = (b[q >> 1] & -256) | 128;
          i = g;
          return;
        }
      }
    } while (0);
    b[m >> 1] = 768;
    b[(f + 10) >> 1] = 768;
    b[(f + 8) >> 1] = ((c[(d + 36) >> 2] | 0) != 0) | 0;
    i = g;
    return;
  }
  function eH(d, e, f, g) {
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    var h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0;
    h = i;
    i = (i + 16) | 0;
    j = h | 0;
    k = g & 65535;
    l = (f & 65535) << 4;
    f = (d + 80) | 0;
    m = (d + 76) | 0;
    n = (d + 72) | 0;
    o = (d + 36) | 0;
    p = (d + 32) | 0;
    d = 0;
    do {
      q = c[f >> 2] & (((d + k) & 65535) + l);
      if (q >>> 0 < (c[m >> 2] | 0) >>> 0) {
        r = a[((c[n >> 2] | 0) + q) | 0] | 0;
      } else {
        r = b8[c[o >> 2] & 255](c[p >> 2] | 0, q) | 0;
      }
      a[(j + d) | 0] = r;
      d = (d + 1) | 0;
    } while (d >>> 0 < 16);
    d = j | 0;
    c[e >> 2] = 0;
    c[(e + 4) >> 2] = 0;
    b[(e + 8) >> 1] = g;
    b3[c[(14528 + ((a[d] & 255) << 2)) >> 2] & 511](e, d);
    d = (e + 12) | 0;
    if ((c[d >> 2] | 0) == 0) {
      i = h;
      return;
    } else {
      s = 0;
    }
    do {
      a[(e + 16 + s) | 0] = a[(j + s) | 0] | 0;
      s = (s + 1) | 0;
    } while (s >>> 0 < (c[d >> 2] | 0) >>> 0);
    i = h;
    return;
  }
  function eI(d, f) {
    d = d | 0;
    f = f | 0;
    var g = 0,
      h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0;
    g = i;
    i = (i + 16) | 0;
    h = g | 0;
    j = b[(d + 28) >> 1] | 0;
    k = h | 0;
    l = j & 65535;
    m = (e[(d + 22) >> 1] | 0) << 4;
    n = (d + 80) | 0;
    o = (d + 76) | 0;
    p = (d + 72) | 0;
    q = (d + 36) | 0;
    r = (d + 32) | 0;
    d = 0;
    do {
      s = (((d + l) & 65535) + m) & c[n >> 2];
      if (s >>> 0 < (c[o >> 2] | 0) >>> 0) {
        t = a[((c[p >> 2] | 0) + s) | 0] | 0;
      } else {
        t = b8[c[q >> 2] & 255](c[r >> 2] | 0, s) | 0;
      }
      a[(h + d) | 0] = t;
      d = (d + 1) | 0;
    } while (d >>> 0 < 16);
    c[f >> 2] = 0;
    c[(f + 4) >> 2] = 0;
    b[(f + 8) >> 1] = j;
    b3[c[(14528 + ((a[k] & 255) << 2)) >> 2] & 511](f, k);
    k = (f + 12) | 0;
    if ((c[k >> 2] | 0) == 0) {
      i = g;
      return;
    } else {
      u = 0;
    }
    do {
      a[(f + 16 + u) | 0] = a[(h + u) | 0] | 0;
      u = (u + 1) | 0;
    } while (u >>> 0 < (c[k >> 2] | 0) >>> 0);
    i = g;
    return;
  }
  function eJ(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 4473921;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    e = hl(b, (b + 100) | 0, f, 0) | 0;
    zQ((b + 164) | 0, c[(15904 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function eK(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 4473921;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    e = hl(b, (b + 100) | 0, f, 1) | 0;
    zQ((b + 164) | 0, c[(15936 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function eL(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 4473921;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    zQ((b + 100) | 0, c[(15904 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = (hl(b, (b + 164) | 0, f, 0) | 0) + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function eM(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 4473921;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    zQ((b + 100) | 0, c[(15936 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = (hl(b, (b + 164) | 0, f, 1) | 0) + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function eN(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 2;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    y = 4473921;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    g = (b + 100) | 0;
    a[g] = a[31608] | 0;
    a[(g + 1) | 0] = a[31609 | 0] | 0;
    a[(g + 2) | 0] = a[31610 | 0] | 0;
    a1(
      (b + 164) | 0,
      26648,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[(e + 1) | 0] | 0), x) | 0
    ) | 0;
    i = f;
    return;
  }
  function eO(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 3;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    y = 4473921;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    g = (b + 100) | 0;
    a[g] = a[29888] | 0;
    a[(g + 1) | 0] = a[29889 | 0] | 0;
    a[(g + 2) | 0] = a[29890 | 0] | 0;
    a1(
      (b + 164) | 0,
      26776,
      ((x = i),
      (i = (i + 8) | 0),
      (c[x >> 2] = ((d[(e + 2) | 0] | 0) << 8) | (d[(e + 1) | 0] | 0)),
      x) | 0
    ) | 0;
    i = f;
    return;
  }
  function eP(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 1;
    d = (b + 32) | 0;
    a[d] = a[25072] | 0;
    a[(d + 1) | 0] = a[25073 | 0] | 0;
    a[(d + 2) | 0] = a[25074 | 0] | 0;
    a[(d + 3) | 0] = a[25075 | 0] | 0;
    a[(d + 4) | 0] = a[25076 | 0] | 0;
    d = (b + 100) | 0;
    a[d] = a[40560] | 0;
    a[(d + 1) | 0] = a[40561 | 0] | 0;
    a[(d + 2) | 0] = a[40562 | 0] | 0;
    return;
  }
  function eQ(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 1;
    d = (b + 32) | 0;
    y = 5263184;
    a[d] = y & 255;
    y = y >> 8;
    a[(d + 1) | 0] = y & 255;
    y = y >> 8;
    a[(d + 2) | 0] = y & 255;
    y = y >> 8;
    a[(d + 3) | 0] = y & 255;
    d = (b + 100) | 0;
    a[d] = a[40560] | 0;
    a[(d + 1) | 0] = a[40561 | 0] | 0;
    a[(d + 2) | 0] = a[40562 | 0] | 0;
    return;
  }
  function eR(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    a[f] = a[39280] | 0;
    a[(f + 1) | 0] = a[39281 | 0] | 0;
    a[(f + 2) | 0] = a[39282 | 0] | 0;
    f = (e + 1) | 0;
    e = hl(b, (b + 100) | 0, f, 0) | 0;
    zQ((b + 164) | 0, c[(15904 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function eS(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    a[f] = a[39280] | 0;
    a[(f + 1) | 0] = a[39281 | 0] | 0;
    a[(f + 2) | 0] = a[39282 | 0] | 0;
    f = (e + 1) | 0;
    e = hl(b, (b + 100) | 0, f, 1) | 0;
    zQ((b + 164) | 0, c[(15936 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function eT(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    a[f] = a[39280] | 0;
    a[(f + 1) | 0] = a[39281 | 0] | 0;
    a[(f + 2) | 0] = a[39282 | 0] | 0;
    f = (e + 1) | 0;
    zQ((b + 100) | 0, c[(15904 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = (hl(b, (b + 164) | 0, f, 0) | 0) + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function eU(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    a[f] = a[39280] | 0;
    a[(f + 1) | 0] = a[39281 | 0] | 0;
    a[(f + 2) | 0] = a[39282 | 0] | 0;
    f = (e + 1) | 0;
    zQ((b + 100) | 0, c[(15936 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = (hl(b, (b + 164) | 0, f, 1) | 0) + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function eV(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 2;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    a[g] = a[39280] | 0;
    a[(g + 1) | 0] = a[39281 | 0] | 0;
    a[(g + 2) | 0] = a[39282 | 0] | 0;
    g = (b + 100) | 0;
    a[g] = a[31608] | 0;
    a[(g + 1) | 0] = a[31609 | 0] | 0;
    a[(g + 2) | 0] = a[31610 | 0] | 0;
    a1(
      (b + 164) | 0,
      26648,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[(e + 1) | 0] | 0), x) | 0
    ) | 0;
    i = f;
    return;
  }
  function eW(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 3;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    a[g] = a[39280] | 0;
    a[(g + 1) | 0] = a[39281 | 0] | 0;
    a[(g + 2) | 0] = a[39282 | 0] | 0;
    g = (b + 100) | 0;
    a[g] = a[29888] | 0;
    a[(g + 1) | 0] = a[29889 | 0] | 0;
    a[(g + 2) | 0] = a[29890 | 0] | 0;
    a1(
      (b + 164) | 0,
      26776,
      ((x = i),
      (i = (i + 8) | 0),
      (c[x >> 2] = ((d[(e + 2) | 0] | 0) << 8) | (d[(e + 1) | 0] | 0)),
      x) | 0
    ) | 0;
    i = f;
    return;
  }
  function eX(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 1;
    d = (b + 32) | 0;
    a[d] = a[25072] | 0;
    a[(d + 1) | 0] = a[25073 | 0] | 0;
    a[(d + 2) | 0] = a[25074 | 0] | 0;
    a[(d + 3) | 0] = a[25075 | 0] | 0;
    a[(d + 4) | 0] = a[25076 | 0] | 0;
    d = (b + 100) | 0;
    a[d] = a[40312] | 0;
    a[(d + 1) | 0] = a[40313 | 0] | 0;
    a[(d + 2) | 0] = a[40314 | 0] | 0;
    return;
  }
  function eY(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    y = 4276548;
    a[d] = y & 255;
    y = y >> 8;
    a[(d + 1) | 0] = y & 255;
    y = y >> 8;
    a[(d + 2) | 0] = y & 255;
    y = y >> 8;
    a[(d + 3) | 0] = y & 255;
    return;
  }
  function eZ(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    y = 5456196;
    a[d] = y & 255;
    y = y >> 8;
    a[(d + 1) | 0] = y & 255;
    y = y >> 8;
    a[(d + 2) | 0] = y & 255;
    y = y >> 8;
    a[(d + 3) | 0] = y & 255;
    return;
  }
  function e_(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    y = 4276545;
    a[d] = y & 255;
    y = y >> 8;
    a[(d + 1) | 0] = y & 255;
    y = y >> 8;
    a[(d + 2) | 0] = y & 255;
    y = y >> 8;
    a[(d + 3) | 0] = y & 255;
    return;
  }
  function e$(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    y = 5456193;
    a[d] = y & 255;
    y = y >> 8;
    a[(d + 1) | 0] = y & 255;
    y = y >> 8;
    a[(d + 2) | 0] = y & 255;
    y = y >> 8;
    a[(d + 3) | 0] = y & 255;
    return;
  }
  function e0(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 1;
    d = (b + 32) | 0;
    y = 5263184;
    a[d] = y & 255;
    y = y >> 8;
    a[(d + 1) | 0] = y & 255;
    y = y >> 8;
    a[(d + 2) | 0] = y & 255;
    y = y >> 8;
    a[(d + 3) | 0] = y & 255;
    d = (b + 100) | 0;
    a[d] = a[40312] | 0;
    a[(d + 1) | 0] = a[40313 | 0] | 0;
    a[(d + 2) | 0] = a[40314 | 0] | 0;
    return;
  }
  function e1(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 4408385;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    e = hl(b, (b + 100) | 0, f, 0) | 0;
    zQ((b + 164) | 0, c[(15904 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function e2(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 4408385;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    e = hl(b, (b + 100) | 0, f, 1) | 0;
    zQ((b + 164) | 0, c[(15936 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function e3(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 4408385;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    zQ((b + 100) | 0, c[(15904 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = (hl(b, (b + 164) | 0, f, 0) | 0) + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function e4(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 4408385;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    zQ((b + 100) | 0, c[(15936 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = (hl(b, (b + 164) | 0, f, 1) | 0) + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function e5(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 2;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    y = 4408385;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    g = (b + 100) | 0;
    a[g] = a[31608] | 0;
    a[(g + 1) | 0] = a[31609 | 0] | 0;
    a[(g + 2) | 0] = a[31610 | 0] | 0;
    a1(
      (b + 164) | 0,
      26648,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[(e + 1) | 0] | 0), x) | 0
    ) | 0;
    i = f;
    return;
  }
  function e6(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 3;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    y = 4408385;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    g = (b + 100) | 0;
    a[g] = a[29888] | 0;
    a[(g + 1) | 0] = a[29889 | 0] | 0;
    a[(g + 2) | 0] = a[29890 | 0] | 0;
    a1(
      (b + 164) | 0,
      26776,
      ((x = i),
      (i = (i + 8) | 0),
      (c[x >> 2] = ((d[(e + 2) | 0] | 0) << 8) | (d[(e + 1) | 0] | 0)),
      x) | 0
    ) | 0;
    i = f;
    return;
  }
  function e7(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 1;
    d = (b + 32) | 0;
    a[d] = a[25072] | 0;
    a[(d + 1) | 0] = a[25073 | 0] | 0;
    a[(d + 2) | 0] = a[25074 | 0] | 0;
    a[(d + 3) | 0] = a[25075 | 0] | 0;
    a[(d + 4) | 0] = a[25076 | 0] | 0;
    d = (b + 100) | 0;
    a[d] = a[40168] | 0;
    a[(d + 1) | 0] = a[40169 | 0] | 0;
    a[(d + 2) | 0] = a[40170 | 0] | 0;
    return;
  }
  function e8(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 1;
    d = (b + 32) | 0;
    y = 5263184;
    a[d] = y & 255;
    y = y >> 8;
    a[(d + 1) | 0] = y & 255;
    y = y >> 8;
    a[(d + 2) | 0] = y & 255;
    y = y >> 8;
    a[(d + 3) | 0] = y & 255;
    d = (b + 100) | 0;
    a[d] = a[40168] | 0;
    a[(d + 1) | 0] = a[40169 | 0] | 0;
    a[(d + 2) | 0] = a[40170 | 0] | 0;
    return;
  }
  function e9(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 4342355;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    e = hl(b, (b + 100) | 0, f, 0) | 0;
    zQ((b + 164) | 0, c[(15904 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function fa(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 4342355;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    e = hl(b, (b + 100) | 0, f, 1) | 0;
    zQ((b + 164) | 0, c[(15936 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function fb(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 4342355;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    zQ((b + 100) | 0, c[(15904 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = (hl(b, (b + 164) | 0, f, 0) | 0) + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function fc(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 4342355;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    zQ((b + 100) | 0, c[(15936 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = (hl(b, (b + 164) | 0, f, 1) | 0) + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function fd(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 2;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    y = 4342355;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    g = (b + 100) | 0;
    a[g] = a[31608] | 0;
    a[(g + 1) | 0] = a[31609 | 0] | 0;
    a[(g + 2) | 0] = a[31610 | 0] | 0;
    a1(
      (b + 164) | 0,
      26648,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[(e + 1) | 0] | 0), x) | 0
    ) | 0;
    i = f;
    return;
  }
  function fe(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 3;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    y = 4342355;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    g = (b + 100) | 0;
    a[g] = a[29888] | 0;
    a[(g + 1) | 0] = a[29889 | 0] | 0;
    a[(g + 2) | 0] = a[29890 | 0] | 0;
    a1(
      (b + 164) | 0,
      26776,
      ((x = i),
      (i = (i + 8) | 0),
      (c[x >> 2] = ((d[(e + 2) | 0] | 0) << 8) | (d[(e + 1) | 0] | 0)),
      x) | 0
    ) | 0;
    i = f;
    return;
  }
  function ff(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 1;
    d = (b + 32) | 0;
    a[d] = a[25072] | 0;
    a[(d + 1) | 0] = a[25073 | 0] | 0;
    a[(d + 2) | 0] = a[25074 | 0] | 0;
    a[(d + 3) | 0] = a[25075 | 0] | 0;
    a[(d + 4) | 0] = a[25076 | 0] | 0;
    d = (b + 100) | 0;
    a[d] = a[40032] | 0;
    a[(d + 1) | 0] = a[40033 | 0] | 0;
    a[(d + 2) | 0] = a[40034 | 0] | 0;
    return;
  }
  function fg(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 1;
    d = (b + 32) | 0;
    y = 5263184;
    a[d] = y & 255;
    y = y >> 8;
    a[(d + 1) | 0] = y & 255;
    y = y >> 8;
    a[(d + 2) | 0] = y & 255;
    y = y >> 8;
    a[(d + 3) | 0] = y & 255;
    d = (b + 100) | 0;
    a[d] = a[40032] | 0;
    a[(d + 1) | 0] = a[40033 | 0] | 0;
    a[(d + 2) | 0] = a[40034 | 0] | 0;
    return;
  }
  function fh(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 4476481;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    e = hl(b, (b + 100) | 0, f, 0) | 0;
    zQ((b + 164) | 0, c[(15904 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function fi(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 4476481;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    e = hl(b, (b + 100) | 0, f, 1) | 0;
    zQ((b + 164) | 0, c[(15936 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function fj(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 4476481;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    zQ((b + 100) | 0, c[(15904 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = (hl(b, (b + 164) | 0, f, 0) | 0) + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function fk(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 4476481;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    zQ((b + 100) | 0, c[(15936 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = (hl(b, (b + 164) | 0, f, 1) | 0) + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function fl(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 2;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    y = 4476481;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    g = (b + 100) | 0;
    a[g] = a[31608] | 0;
    a[(g + 1) | 0] = a[31609 | 0] | 0;
    a[(g + 2) | 0] = a[31610 | 0] | 0;
    a1(
      (b + 164) | 0,
      26648,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[(e + 1) | 0] | 0), x) | 0
    ) | 0;
    i = f;
    return;
  }
  function fm(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 3;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    y = 4476481;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    g = (b + 100) | 0;
    a[g] = a[29888] | 0;
    a[(g + 1) | 0] = a[29889 | 0] | 0;
    a[(g + 2) | 0] = a[29890 | 0] | 0;
    a1(
      (b + 164) | 0,
      26776,
      ((x = i),
      (i = (i + 8) | 0),
      (c[x >> 2] = ((d[(e + 2) | 0] | 0) << 8) | (d[(e + 1) | 0] | 0)),
      x) | 0
    ) | 0;
    i = f;
    return;
  }
  function fn(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0;
    e = (b + 4) | 0;
    f = c[e >> 2] | 0;
    c[e >> 2] = 1;
    g = (d + 1) | 0;
    b3[c[(14528 + ((a[g] & 255) << 2)) >> 2] & 511](b, g);
    g = (b + 12) | 0;
    if ((c[e >> 2] | 0) == 0) {
      c[g >> 2] = (c[g >> 2] | 0) + 1;
      c[e >> 2] = f;
      return;
    } else {
      c[g >> 2] = 1;
      c[(b + 96) >> 2] = 0;
      g = (b + 32) | 0;
      y = 3822405;
      a[g] = y & 255;
      y = y >> 8;
      a[(g + 1) | 0] = y & 255;
      y = y >> 8;
      a[(g + 2) | 0] = y & 255;
      y = y >> 8;
      a[(g + 3) | 0] = y & 255;
      c[e >> 2] = f;
      return;
    }
  }
  function fo(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 4347219;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    e = hl(b, (b + 100) | 0, f, 0) | 0;
    zQ((b + 164) | 0, c[(15904 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function fp(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 4347219;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    e = hl(b, (b + 100) | 0, f, 1) | 0;
    zQ((b + 164) | 0, c[(15936 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function fq(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 4347219;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    zQ((b + 100) | 0, c[(15904 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = (hl(b, (b + 164) | 0, f, 0) | 0) + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function fr(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 4347219;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    zQ((b + 100) | 0, c[(15936 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = (hl(b, (b + 164) | 0, f, 1) | 0) + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function fs(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 2;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    y = 4347219;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    g = (b + 100) | 0;
    a[g] = a[31608] | 0;
    a[(g + 1) | 0] = a[31609 | 0] | 0;
    a[(g + 2) | 0] = a[31610 | 0] | 0;
    a1(
      (b + 164) | 0,
      26648,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[(e + 1) | 0] | 0), x) | 0
    ) | 0;
    i = f;
    return;
  }
  function ft(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 3;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    y = 4347219;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    g = (b + 100) | 0;
    a[g] = a[29888] | 0;
    a[(g + 1) | 0] = a[29889 | 0] | 0;
    a[(g + 2) | 0] = a[29890 | 0] | 0;
    a1(
      (b + 164) | 0,
      26776,
      ((x = i),
      (i = (i + 8) | 0),
      (c[x >> 2] = ((d[(e + 2) | 0] | 0) << 8) | (d[(e + 1) | 0] | 0)),
      x) | 0
    ) | 0;
    i = f;
    return;
  }
  function fu(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0;
    e = (b + 4) | 0;
    f = c[e >> 2] | 0;
    c[e >> 2] = 2;
    g = (d + 1) | 0;
    b3[c[(14528 + ((a[g] & 255) << 2)) >> 2] & 511](b, g);
    g = (b + 12) | 0;
    if ((c[e >> 2] | 0) == 0) {
      c[g >> 2] = (c[g >> 2] | 0) + 1;
      c[e >> 2] = f;
      return;
    } else {
      c[g >> 2] = 1;
      c[(b + 96) >> 2] = 0;
      g = (b + 32) | 0;
      y = 3822403;
      a[g] = y & 255;
      y = y >> 8;
      a[(g + 1) | 0] = y & 255;
      y = y >> 8;
      a[(g + 2) | 0] = y & 255;
      y = y >> 8;
      a[(g + 3) | 0] = y & 255;
      c[e >> 2] = f;
      return;
    }
  }
  function fv(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 5394264;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    e = hl(b, (b + 100) | 0, f, 0) | 0;
    zQ((b + 164) | 0, c[(15904 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function fw(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 5394264;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    e = hl(b, (b + 100) | 0, f, 1) | 0;
    zQ((b + 164) | 0, c[(15936 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function fx(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 5394264;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    zQ((b + 100) | 0, c[(15904 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = (hl(b, (b + 164) | 0, f, 0) | 0) + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function fy(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 5394264;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    zQ((b + 100) | 0, c[(15936 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = (hl(b, (b + 164) | 0, f, 1) | 0) + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function fz(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 2;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    y = 5394264;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    g = (b + 100) | 0;
    a[g] = a[31608] | 0;
    a[(g + 1) | 0] = a[31609 | 0] | 0;
    a[(g + 2) | 0] = a[31610 | 0] | 0;
    a1(
      (b + 164) | 0,
      26648,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[(e + 1) | 0] | 0), x) | 0
    ) | 0;
    i = f;
    return;
  }
  function fA(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 3;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    y = 5394264;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    g = (b + 100) | 0;
    a[g] = a[29888] | 0;
    a[(g + 1) | 0] = a[29889 | 0] | 0;
    a[(g + 2) | 0] = a[29890 | 0] | 0;
    a1(
      (b + 164) | 0,
      26776,
      ((x = i),
      (i = (i + 8) | 0),
      (c[x >> 2] = ((d[(e + 2) | 0] | 0) << 8) | (d[(e + 1) | 0] | 0)),
      x) | 0
    ) | 0;
    i = f;
    return;
  }
  function fB(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0;
    e = (b + 4) | 0;
    f = c[e >> 2] | 0;
    c[e >> 2] = 3;
    g = (d + 1) | 0;
    b3[c[(14528 + ((a[g] & 255) << 2)) >> 2] & 511](b, g);
    g = (b + 12) | 0;
    if ((c[e >> 2] | 0) == 0) {
      c[g >> 2] = (c[g >> 2] | 0) + 1;
      c[e >> 2] = f;
      return;
    } else {
      c[g >> 2] = 1;
      c[(b + 96) >> 2] = 0;
      g = (b + 32) | 0;
      y = 3822419;
      a[g] = y & 255;
      y = y >> 8;
      a[(g + 1) | 0] = y & 255;
      y = y >> 8;
      a[(g + 2) | 0] = y & 255;
      y = y >> 8;
      a[(g + 3) | 0] = y & 255;
      c[e >> 2] = f;
      return;
    }
  }
  function fC(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 5262659;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    e = hl(b, (b + 100) | 0, f, 0) | 0;
    zQ((b + 164) | 0, c[(15904 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function fD(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 5262659;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    e = hl(b, (b + 100) | 0, f, 1) | 0;
    zQ((b + 164) | 0, c[(15936 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function fE(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 5262659;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    zQ((b + 100) | 0, c[(15904 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = (hl(b, (b + 164) | 0, f, 0) | 0) + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function fF(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 5262659;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    zQ((b + 100) | 0, c[(15936 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = (hl(b, (b + 164) | 0, f, 1) | 0) + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function fG(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 2;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    y = 5262659;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    g = (b + 100) | 0;
    a[g] = a[31608] | 0;
    a[(g + 1) | 0] = a[31609 | 0] | 0;
    a[(g + 2) | 0] = a[31610 | 0] | 0;
    a1(
      (b + 164) | 0,
      26648,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[(e + 1) | 0] | 0), x) | 0
    ) | 0;
    i = f;
    return;
  }
  function fH(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 3;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    y = 5262659;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    g = (b + 100) | 0;
    a[g] = a[29888] | 0;
    a[(g + 1) | 0] = a[29889 | 0] | 0;
    a[(g + 2) | 0] = a[29890 | 0] | 0;
    a1(
      (b + 164) | 0,
      26776,
      ((x = i),
      (i = (i + 8) | 0),
      (c[x >> 2] = ((d[(e + 2) | 0] | 0) << 8) | (d[(e + 1) | 0] | 0)),
      x) | 0
    ) | 0;
    i = f;
    return;
  }
  function fI(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0;
    e = (b + 4) | 0;
    f = c[e >> 2] | 0;
    c[e >> 2] = 4;
    g = (d + 1) | 0;
    b3[c[(14528 + ((a[g] & 255) << 2)) >> 2] & 511](b, g);
    g = (b + 12) | 0;
    if ((c[e >> 2] | 0) == 0) {
      c[g >> 2] = (c[g >> 2] | 0) + 1;
      c[e >> 2] = f;
      return;
    } else {
      c[g >> 2] = 1;
      c[(b + 96) >> 2] = 0;
      g = (b + 32) | 0;
      y = 3822404;
      a[g] = y & 255;
      y = y >> 8;
      a[(g + 1) | 0] = y & 255;
      y = y >> 8;
      a[(g + 2) | 0] = y & 255;
      y = y >> 8;
      a[(g + 3) | 0] = y & 255;
      c[e >> 2] = f;
      return;
    }
  }
  function fJ(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    y = 5263182;
    a[d] = y & 255;
    y = y >> 8;
    a[(d + 1) | 0] = y & 255;
    y = y >> 8;
    a[(d + 2) | 0] = y & 255;
    y = y >> 8;
    a[(d + 3) | 0] = y & 255;
    return;
  }
  function fK(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    y = 5718595;
    a[d] = y & 255;
    y = y >> 8;
    a[(d + 1) | 0] = y & 255;
    y = y >> 8;
    a[(d + 2) | 0] = y & 255;
    y = y >> 8;
    a[(d + 3) | 0] = y & 255;
    return;
  }
  function fL(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    y = 4478787;
    a[d] = y & 255;
    y = y >> 8;
    a[(d + 1) | 0] = y & 255;
    y = y >> 8;
    a[(d + 2) | 0] = y & 255;
    y = y >> 8;
    a[(d + 3) | 0] = y & 255;
    return;
  }
  function fM(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 1;
    e = (b + 32) | 0;
    y = 4410953;
    a[e] = y & 255;
    y = y >> 8;
    a[(e + 1) | 0] = y & 255;
    y = y >> 8;
    a[(e + 2) | 0] = y & 255;
    y = y >> 8;
    a[(e + 3) | 0] = y & 255;
    zQ((b + 100) | 0, c[(15936 + ((a[d] & 7) << 2)) >> 2] | 0) | 0;
    return;
  }
  function fN(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 1;
    e = (b + 32) | 0;
    y = 4408644;
    a[e] = y & 255;
    y = y >> 8;
    a[(e + 1) | 0] = y & 255;
    y = y >> 8;
    a[(e + 2) | 0] = y & 255;
    y = y >> 8;
    a[(e + 3) | 0] = y & 255;
    zQ((b + 100) | 0, c[(15936 + ((a[d] & 7) << 2)) >> 2] | 0) | 0;
    return;
  }
  function fO(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 1;
    e = (b + 32) | 0;
    a[e] = a[25072] | 0;
    a[(e + 1) | 0] = a[25073 | 0] | 0;
    a[(e + 2) | 0] = a[25074 | 0] | 0;
    a[(e + 3) | 0] = a[25075 | 0] | 0;
    a[(e + 4) | 0] = a[25076 | 0] | 0;
    zQ((b + 100) | 0, c[(15936 + ((a[d] & 7) << 2)) >> 2] | 0) | 0;
    return;
  }
  function fP(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 1;
    e = (b + 32) | 0;
    y = 5263184;
    a[e] = y & 255;
    y = y >> 8;
    a[(e + 1) | 0] = y & 255;
    y = y >> 8;
    a[(e + 2) | 0] = y & 255;
    y = y >> 8;
    a[(e + 3) | 0] = y & 255;
    zQ((b + 100) | 0, c[(15936 + ((a[d] & 7) << 2)) >> 2] | 0) | 0;
    return;
  }
  function fQ(b, d) {
    b = b | 0;
    d = d | 0;
    d = b | 0;
    c[d >> 2] = c[d >> 2] | 1;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    a[d] = a[35240] | 0;
    a[(d + 1) | 0] = a[35241 | 0] | 0;
    a[(d + 2) | 0] = a[35242 | 0] | 0;
    a[(d + 3) | 0] = a[35243 | 0] | 0;
    a[(d + 4) | 0] = a[35244 | 0] | 0;
    a[(d + 5) | 0] = a[35245 | 0] | 0;
    return;
  }
  function fR(b, d) {
    b = b | 0;
    d = d | 0;
    d = b | 0;
    c[d >> 2] = c[d >> 2] | 1;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    a[d] = a[35528] | 0;
    a[(d + 1) | 0] = a[35529 | 0] | 0;
    a[(d + 2) | 0] = a[35530 | 0] | 0;
    a[(d + 3) | 0] = a[35531 | 0] | 0;
    a[(d + 4) | 0] = a[35532 | 0] | 0;
    return;
  }
  function fS(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = b | 0;
    c[f >> 2] = c[f >> 2] | 1;
    f = (b + 32) | 0;
    a[f] = a[35592] | 0;
    a[(f + 1) | 0] = a[35593 | 0] | 0;
    a[(f + 2) | 0] = a[35594 | 0] | 0;
    a[(f + 3) | 0] = a[35595 | 0] | 0;
    a[(f + 4) | 0] = a[35596 | 0] | 0;
    a[(f + 5) | 0] = a[35597 | 0] | 0;
    f = (e + 1) | 0;
    zQ((b + 100) | 0, c[(15936 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = (hl(b, (b + 164) | 0, f, 1) | 0) + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function fT(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 1;
    g = (b + 32) | 0;
    a[g] = a[35688] | 0;
    a[(g + 1) | 0] = a[35689 | 0] | 0;
    a[(g + 2) | 0] = a[35690 | 0] | 0;
    a1(
      (b + 100) | 0,
      26648,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[e] | 0), x) | 0
    ) | 0;
    i = f;
    return;
  }
  function fU(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0,
      j = 0;
    f = i;
    g = (b + 12) | 0;
    if ((a[(e + 1) | 0] | 0) == 102) {
      c[g >> 2] = 4;
      c[(b + 96) >> 2] = 2;
      h = (b + 32) | 0;
      a[h] = a[35736] | 0;
      a[(h + 1) | 0] = a[35737 | 0] | 0;
      a[(h + 2) | 0] = a[35738 | 0] | 0;
      a[(h + 3) | 0] = a[35739 | 0] | 0;
      a[(h + 4) | 0] = a[35740 | 0] | 0;
      h = (b + 100) | 0;
      j = d[(e + 2) | 0] | 0;
      a1(h | 0, 26648, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = j), x) | 0) |
        0;
      j = (b + 164) | 0;
      h = d[(e + 3) | 0] | 0;
      a1(j | 0, 26648, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = h), x) | 0) |
        0;
      i = f;
      return;
    } else {
      c[g >> 2] = 1;
      c[(b + 96) >> 2] = 1;
      g = (b + 32) | 0;
      a[g] = a[35688] | 0;
      a[(g + 1) | 0] = a[35689 | 0] | 0;
      a[(g + 2) | 0] = a[35690 | 0] | 0;
      g = (b + 100) | 0;
      b = d[e] | 0;
      a1(g | 0, 26648, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = b), x) | 0) |
        0;
      i = f;
      return;
    }
  }
  function fV(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    g = b | 0;
    c[g >> 2] = c[g >> 2] | 1;
    c[(b + 12) >> 2] = 3;
    c[(b + 96) >> 2] = 1;
    g = (b + 32) | 0;
    a[g] = a[25072] | 0;
    a[(g + 1) | 0] = a[25073 | 0] | 0;
    a[(g + 2) | 0] = a[25074 | 0] | 0;
    a[(g + 3) | 0] = a[25075 | 0] | 0;
    a[(g + 4) | 0] = a[25076 | 0] | 0;
    a1(
      (b + 100) | 0,
      26776,
      ((x = i),
      (i = (i + 8) | 0),
      (c[x >> 2] = ((d[(e + 2) | 0] | 0) << 8) | (d[(e + 1) | 0] | 0)),
      x) | 0
    ) | 0;
    i = f;
    return;
  }
  function fW(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0;
    e = i;
    f = b | 0;
    c[f >> 2] = c[f >> 2] | 1;
    c[(b + 12) >> 2] = 2;
    c[(b + 96) >> 2] = 1;
    f = (b + 32) | 0;
    a[f] = a[25072] | 0;
    a[(f + 1) | 0] = a[25073 | 0] | 0;
    a[(f + 2) | 0] = a[25074 | 0] | 0;
    a[(f + 3) | 0] = a[25075 | 0] | 0;
    a[(f + 4) | 0] = a[25076 | 0] | 0;
    f = (b + 100) | 0;
    b = a[(d + 1) | 0] | 0;
    d = b & 255;
    if ((b << 24) >> 24 > -1) {
      a1(f | 0, 39608, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d), x) | 0) |
        0;
      i = e;
      return;
    } else {
      b = -d & 255;
      a1(f | 0, 39432, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = b), x) | 0) |
        0;
      i = e;
      return;
    }
  }
  function fX(b, d) {
    b = b | 0;
    d = d | 0;
    d = b | 0;
    c[d >> 2] = c[d >> 2] | 1;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    a[d] = a[35776] | 0;
    a[(d + 1) | 0] = a[35777 | 0] | 0;
    a[(d + 2) | 0] = a[35778 | 0] | 0;
    a[(d + 3) | 0] = a[35779 | 0] | 0;
    a[(d + 4) | 0] = a[35780 | 0] | 0;
    return;
  }
  function fY(b, d) {
    b = b | 0;
    d = d | 0;
    d = b | 0;
    c[d >> 2] = c[d >> 2] | 1;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    a[d] = a[35816] | 0;
    a[(d + 1) | 0] = a[35817 | 0] | 0;
    a[(d + 2) | 0] = a[35818 | 0] | 0;
    a[(d + 3) | 0] = a[35819 | 0] | 0;
    a[(d + 4) | 0] = a[35820 | 0] | 0;
    return;
  }
  function fZ(b, d) {
    b = b | 0;
    d = d | 0;
    d = b | 0;
    c[d >> 2] = c[d >> 2] | 1;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    a[d] = a[35912] | 0;
    a[(d + 1) | 0] = a[35913 | 0] | 0;
    a[(d + 2) | 0] = a[35914 | 0] | 0;
    a[(d + 3) | 0] = a[35915 | 0] | 0;
    a[(d + 4) | 0] = a[35916 | 0] | 0;
    a[(d + 5) | 0] = a[35917 | 0] | 0;
    return;
  }
  function f_(b, d) {
    b = b | 0;
    d = d | 0;
    d = b | 0;
    c[d >> 2] = c[d >> 2] | 1;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    a[d] = a[36864] | 0;
    a[(d + 1) | 0] = a[36865 | 0] | 0;
    a[(d + 2) | 0] = a[36866 | 0] | 0;
    a[(d + 3) | 0] = a[36867 | 0] | 0;
    a[(d + 4) | 0] = a[36868 | 0] | 0;
    a[(d + 5) | 0] = a[36869 | 0] | 0;
    return;
  }
  function f$(b, f) {
    b = b | 0;
    f = f | 0;
    var g = 0,
      h = 0,
      j = 0;
    g = i;
    c[(b + 12) >> 2] = 2;
    c[(b + 96) >> 2] = 1;
    h = d[(f + 1) | 0] | 0;
    j =
      ((e[(b + 8) >> 1] | 0) + 2 + (((h & 128) | 0) != 0 ? h | 65280 : h)) | 0;
    zQ((b + 32) | 0, c[(16296 + ((a[f] & 15) << 2)) >> 2] | 0) | 0;
    a1(
      (b + 100) | 0,
      26776,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = j & 65535), x) | 0
    ) | 0;
    i = g;
    return;
  }
  function f0(a, b) {
    a = a | 0;
    b = b | 0;
    var e = 0,
      f = 0,
      g = 0;
    e = i;
    f = (b + 1) | 0;
    zQ((a + 32) | 0, c[(16232 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) | 0;
    g = hl(a, (a + 100) | 0, f, 0) | 0;
    a1(
      (a + 164) | 0,
      26648,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[(b + (g + 1)) | 0] | 0), x) |
        0
    ) | 0;
    c[(a + 12) >> 2] = g + 2;
    c[(a + 96) >> 2] = 2;
    i = e;
    return;
  }
  function f1(a, b) {
    a = a | 0;
    b = b | 0;
    var e = 0,
      f = 0,
      g = 0;
    e = i;
    f = (b + 1) | 0;
    zQ((a + 32) | 0, c[(16232 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) | 0;
    g = hl(a, (a + 100) | 0, f, 1) | 0;
    a1(
      (a + 164) | 0,
      26776,
      ((x = i),
      (i = (i + 8) | 0),
      (c[x >> 2] =
        ((d[(b + (g + 2)) | 0] | 0) << 8) | (d[(b + (g + 1)) | 0] | 0)),
      x) | 0
    ) | 0;
    c[(a + 12) >> 2] = g + 3;
    c[(a + 96) >> 2] = 2;
    i = e;
    return;
  }
  function f2(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0;
    f = i;
    g = (e + 1) | 0;
    zQ((b + 32) | 0, c[(16232 + ((((d[g] | 0) >>> 3) & 7) << 2)) >> 2] | 0) | 0;
    h = hl(b, (b + 100) | 0, g, 1) | 0;
    g = (b + 164) | 0;
    j = a[(e + (h + 1)) | 0] | 0;
    e = j & 255;
    if ((j << 24) >> 24 > -1) {
      a1(g | 0, 39608, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = e), x) | 0) |
        0;
      k = (h + 2) | 0;
      l = (b + 12) | 0;
      c[l >> 2] = k;
      m = (b + 96) | 0;
      c[m >> 2] = 2;
      i = f;
      return;
    } else {
      j = -e & 255;
      a1(g | 0, 39432, ((x = i), (i = (i + 8) | 0), (c[x >> 2] = j), x) | 0) |
        0;
      k = (h + 2) | 0;
      l = (b + 12) | 0;
      c[l >> 2] = k;
      m = (b + 96) | 0;
      c[m >> 2] = 2;
      i = f;
      return;
    }
  }
  function f3(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    a[f] = a[28048] | 0;
    a[(f + 1) | 0] = a[28049 | 0] | 0;
    a[(f + 2) | 0] = a[28050 | 0] | 0;
    a[(f + 3) | 0] = a[28051 | 0] | 0;
    a[(f + 4) | 0] = a[28052 | 0] | 0;
    f = (e + 1) | 0;
    e = hl(b, (b + 100) | 0, f, 0) | 0;
    zQ((b + 164) | 0, c[(15904 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function f4(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    a[f] = a[28048] | 0;
    a[(f + 1) | 0] = a[28049 | 0] | 0;
    a[(f + 2) | 0] = a[28050 | 0] | 0;
    a[(f + 3) | 0] = a[28051 | 0] | 0;
    a[(f + 4) | 0] = a[28052 | 0] | 0;
    f = (e + 1) | 0;
    e = hl(b, (b + 100) | 0, f, 1) | 0;
    zQ((b + 164) | 0, c[(15936 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function f5(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    a[f] = a[40904] | 0;
    a[(f + 1) | 0] = a[40905 | 0] | 0;
    a[(f + 2) | 0] = a[40906 | 0] | 0;
    a[(f + 3) | 0] = a[40907 | 0] | 0;
    a[(f + 4) | 0] = a[40908 | 0] | 0;
    f = (e + 1) | 0;
    e = hl(b, (b + 100) | 0, f, 0) | 0;
    zQ((b + 164) | 0, c[(15904 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function f6(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    a[f] = a[40904] | 0;
    a[(f + 1) | 0] = a[40905 | 0] | 0;
    a[(f + 2) | 0] = a[40906 | 0] | 0;
    a[(f + 3) | 0] = a[40907 | 0] | 0;
    a[(f + 4) | 0] = a[40908 | 0] | 0;
    f = (e + 1) | 0;
    e = hl(b, (b + 100) | 0, f, 1) | 0;
    zQ((b + 164) | 0, c[(15936 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function f7(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 5656397;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    e = hl(b, (b + 100) | 0, f, 0) | 0;
    zQ((b + 164) | 0, c[(15904 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function f8(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 5656397;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    e = hl(b, (b + 100) | 0, f, 1) | 0;
    zQ((b + 164) | 0, c[(15936 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function f9(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 5656397;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    zQ((b + 100) | 0, c[(15904 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = (hl(b, (b + 164) | 0, f, 0) | 0) + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function ga(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 5656397;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    zQ((b + 100) | 0, c[(15936 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = (hl(b, (b + 164) | 0, f, 1) | 0) + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function gb(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 5656397;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    e = hl(b, (b + 100) | 0, f, 1) | 0;
    zQ((b + 164) | 0, c[(15864 + ((((d[f] | 0) >>> 3) & 3) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function gc(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 4277580;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    zQ((b + 100) | 0, c[(15936 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = (hl(b, (b + 164) | 0, f, 1) | 0) + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function gd(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 5656397;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    zQ((b + 100) | 0, c[(15864 + ((((d[f] | 0) >>> 3) & 3) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = (hl(b, (b + 164) | 0, f, 1) | 0) + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function ge(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0;
    e = (b + 32) | 0;
    y = 5263184;
    a[e] = y & 255;
    y = y >> 8;
    a[(e + 1) | 0] = y & 255;
    y = y >> 8;
    a[(e + 2) | 0] = y & 255;
    y = y >> 8;
    a[(e + 3) | 0] = y & 255;
    c[(b + 12) >> 2] = (hl(b, (b + 100) | 0, (d + 1) | 0, 1) | 0) + 1;
    c[(b + 96) >> 2] = 1;
    return;
  }
  function gf(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0;
    e = (b + 32) | 0;
    a[e] = a[40904] | 0;
    a[(e + 1) | 0] = a[40905 | 0] | 0;
    a[(e + 2) | 0] = a[40906 | 0] | 0;
    a[(e + 3) | 0] = a[40907 | 0] | 0;
    a[(e + 4) | 0] = a[40908 | 0] | 0;
    e = (b + 100) | 0;
    a[e] = a[29888] | 0;
    a[(e + 1) | 0] = a[29889 | 0] | 0;
    a[(e + 2) | 0] = a[29890 | 0] | 0;
    zQ((b + 164) | 0, c[(15936 + ((a[d] & 7) << 2)) >> 2] | 0) | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function gg(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    g = b | 0;
    c[g >> 2] = c[g >> 2] | 256;
    c[(b + 12) >> 2] = 5;
    c[(b + 96) >> 2] = 1;
    g = (b + 32) | 0;
    a[g] = a[31888] | 0;
    a[(g + 1) | 0] = a[31889 | 0] | 0;
    a[(g + 2) | 0] = a[31890 | 0] | 0;
    a[(g + 3) | 0] = a[31891 | 0] | 0;
    a[(g + 4) | 0] = a[31892 | 0] | 0;
    g = ((d[(e + 2) | 0] | 0) << 8) | (d[(e + 1) | 0] | 0);
    a1(
      (b + 100) | 0,
      25288,
      ((x = i),
      (i = (i + 16) | 0),
      (c[x >> 2] = ((d[(e + 4) | 0] | 0) << 8) | (d[(e + 3) | 0] | 0)),
      (c[(x + 8) >> 2] = g),
      x) | 0
    ) | 0;
    i = f;
    return;
  }
  function gh(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    a[d] = a[41168] | 0;
    a[(d + 1) | 0] = a[41169 | 0] | 0;
    a[(d + 2) | 0] = a[41170 | 0] | 0;
    a[(d + 3) | 0] = a[41171 | 0] | 0;
    a[(d + 4) | 0] = a[41172 | 0] | 0;
    return;
  }
  function gi(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    a[d] = a[41256] | 0;
    a[(d + 1) | 0] = a[41257 | 0] | 0;
    a[(d + 2) | 0] = a[41258 | 0] | 0;
    a[(d + 3) | 0] = a[41259 | 0] | 0;
    a[(d + 4) | 0] = a[41260 | 0] | 0;
    a[(d + 5) | 0] = a[41261 | 0] | 0;
    return;
  }
  function gj(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    a[d] = a[41392] | 0;
    a[(d + 1) | 0] = a[41393 | 0] | 0;
    a[(d + 2) | 0] = a[41394 | 0] | 0;
    a[(d + 3) | 0] = a[41395 | 0] | 0;
    a[(d + 4) | 0] = a[41396 | 0] | 0;
    return;
  }
  function gk(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    a[d] = a[41440] | 0;
    a[(d + 1) | 0] = a[41441 | 0] | 0;
    a[(d + 2) | 0] = a[41442 | 0] | 0;
    a[(d + 3) | 0] = a[41443 | 0] | 0;
    a[(d + 4) | 0] = a[41444 | 0] | 0;
    return;
  }
  function gl(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    a[d] = a[41624] | 0;
    a[(d + 1) | 0] = a[41625 | 0] | 0;
    a[(d + 2) | 0] = a[41626 | 0] | 0;
    a[(d + 3) | 0] = a[41627 | 0] | 0;
    a[(d + 4) | 0] = a[41628 | 0] | 0;
    return;
  }
  function gm(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0;
    f = i;
    c[(b + 12) >> 2] = 3;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    y = 5656397;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    g = (b + 100) | 0;
    a[g] = a[31608] | 0;
    a[(g + 1) | 0] = a[31609 | 0] | 0;
    a[(g + 2) | 0] = a[31610 | 0] | 0;
    g = (b + 4) | 0;
    h = ((d[(e + 2) | 0] | 0) << 8) | (d[(e + 1) | 0] | 0);
    a1(
      (b + 164) | 0,
      21112,
      ((x = i),
      (i = (i + 16) | 0),
      (c[x >> 2] = c[(15880 + (c[g >> 2] << 2)) >> 2]),
      (c[(x + 8) >> 2] = h),
      x) | 0
    ) | 0;
    c[g >> 2] = 0;
    i = f;
    return;
  }
  function gn(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0;
    f = i;
    c[(b + 12) >> 2] = 3;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    y = 5656397;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    g = (b + 100) | 0;
    a[g] = a[29888] | 0;
    a[(g + 1) | 0] = a[29889 | 0] | 0;
    a[(g + 2) | 0] = a[29890 | 0] | 0;
    g = (b + 4) | 0;
    h = ((d[(e + 2) | 0] | 0) << 8) | (d[(e + 1) | 0] | 0);
    a1(
      (b + 164) | 0,
      21112,
      ((x = i),
      (i = (i + 16) | 0),
      (c[x >> 2] = c[(15880 + (c[g >> 2] << 2)) >> 2]),
      (c[(x + 8) >> 2] = h),
      x) | 0
    ) | 0;
    c[g >> 2] = 0;
    i = f;
    return;
  }
  function go(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0;
    f = i;
    c[(b + 12) >> 2] = 3;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    y = 5656397;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    g = (b + 4) | 0;
    h = ((d[(e + 2) | 0] | 0) << 8) | (d[(e + 1) | 0] | 0);
    a1(
      (b + 100) | 0,
      21112,
      ((x = i),
      (i = (i + 16) | 0),
      (c[x >> 2] = c[(15880 + (c[g >> 2] << 2)) >> 2]),
      (c[(x + 8) >> 2] = h),
      x) | 0
    ) | 0;
    c[g >> 2] = 0;
    g = (b + 164) | 0;
    a[g] = a[31608] | 0;
    a[(g + 1) | 0] = a[31609 | 0] | 0;
    a[(g + 2) | 0] = a[31610 | 0] | 0;
    i = f;
    return;
  }
  function gp(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0;
    f = i;
    c[(b + 12) >> 2] = 3;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    y = 5656397;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    g = (b + 4) | 0;
    h = ((d[(e + 2) | 0] | 0) << 8) | (d[(e + 1) | 0] | 0);
    a1(
      (b + 100) | 0,
      21112,
      ((x = i),
      (i = (i + 16) | 0),
      (c[x >> 2] = c[(15880 + (c[g >> 2] << 2)) >> 2]),
      (c[(x + 8) >> 2] = h),
      x) | 0
    ) | 0;
    c[g >> 2] = 0;
    g = (b + 164) | 0;
    a[g] = a[29888] | 0;
    a[(g + 1) | 0] = a[29889 | 0] | 0;
    a[(g + 2) | 0] = a[29890 | 0] | 0;
    i = f;
    return;
  }
  function gq(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0;
    d = i;
    c[(b + 12) >> 2] = 1;
    e = (b + 96) | 0;
    c[e >> 2] = 0;
    f = (b + 32) | 0;
    a[f] = a[41808] | 0;
    a[(f + 1) | 0] = a[41809 | 0] | 0;
    a[(f + 2) | 0] = a[41810 | 0] | 0;
    a[(f + 3) | 0] = a[41811 | 0] | 0;
    a[(f + 4) | 0] = a[41812 | 0] | 0;
    a[(f + 5) | 0] = a[41813 | 0] | 0;
    f = (b + 4) | 0;
    g = c[f >> 2] | 0;
    if ((g | 0) == 0) {
      i = d;
      return;
    }
    h = (b + 100) | 0;
    j = h | 0;
    y = 978535771;
    a[j] = y & 255;
    y = y >> 8;
    a[(j + 1) | 0] = y & 255;
    y = y >> 8;
    a[(j + 2) | 0] = y & 255;
    y = y >> 8;
    a[(j + 3) | 0] = y & 255;
    j = (h + 4) | 0;
    y = 6113604;
    a[j] = y & 255;
    y = y >> 8;
    a[(j + 1) | 0] = y & 255;
    y = y >> 8;
    a[(j + 2) | 0] = y & 255;
    y = y >> 8;
    a[(j + 3) | 0] = y & 255;
    a1(
      (b + 164) | 0,
      41192,
      ((x = i),
      (i = (i + 16) | 0),
      (c[x >> 2] = c[(15880 + (g << 2)) >> 2]),
      (c[(x + 8) >> 2] = 32080),
      x) | 0
    ) | 0;
    c[e >> 2] = 2;
    c[f >> 2] = 0;
    i = d;
    return;
  }
  function gr(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0;
    d = i;
    c[(b + 12) >> 2] = 1;
    e = (b + 96) | 0;
    c[e >> 2] = 0;
    f = (b + 32) | 0;
    a[f] = a[20664] | 0;
    a[(f + 1) | 0] = a[20665 | 0] | 0;
    a[(f + 2) | 0] = a[20666 | 0] | 0;
    a[(f + 3) | 0] = a[20667 | 0] | 0;
    a[(f + 4) | 0] = a[20668 | 0] | 0;
    a[(f + 5) | 0] = a[20669 | 0] | 0;
    f = (b + 4) | 0;
    g = c[f >> 2] | 0;
    if ((g | 0) == 0) {
      i = d;
      return;
    }
    h = (b + 100) | 0;
    j = h | 0;
    y = 978535771;
    a[j] = y & 255;
    y = y >> 8;
    a[(j + 1) | 0] = y & 255;
    y = y >> 8;
    a[(j + 2) | 0] = y & 255;
    y = y >> 8;
    a[(j + 3) | 0] = y & 255;
    j = (h + 4) | 0;
    y = 6113604;
    a[j] = y & 255;
    y = y >> 8;
    a[(j + 1) | 0] = y & 255;
    y = y >> 8;
    a[(j + 2) | 0] = y & 255;
    y = y >> 8;
    a[(j + 3) | 0] = y & 255;
    a1(
      (b + 164) | 0,
      41192,
      ((x = i),
      (i = (i + 16) | 0),
      (c[x >> 2] = c[(15880 + (g << 2)) >> 2]),
      (c[(x + 8) >> 2] = 32080),
      x) | 0
    ) | 0;
    c[e >> 2] = 2;
    c[f >> 2] = 0;
    i = d;
    return;
  }
  function gs(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0;
    d = i;
    c[(b + 12) >> 2] = 1;
    e = (b + 96) | 0;
    c[e >> 2] = 0;
    f = (b + 32) | 0;
    a[f] = a[20816] | 0;
    a[(f + 1) | 0] = a[20817 | 0] | 0;
    a[(f + 2) | 0] = a[20818 | 0] | 0;
    a[(f + 3) | 0] = a[20819 | 0] | 0;
    a[(f + 4) | 0] = a[20820 | 0] | 0;
    a[(f + 5) | 0] = a[20821 | 0] | 0;
    f = (b + 4) | 0;
    g = c[f >> 2] | 0;
    if ((g | 0) == 0) {
      i = d;
      return;
    }
    h = (b + 100) | 0;
    j = h | 0;
    y = 978535771;
    a[j] = y & 255;
    y = y >> 8;
    a[(j + 1) | 0] = y & 255;
    y = y >> 8;
    a[(j + 2) | 0] = y & 255;
    y = y >> 8;
    a[(j + 3) | 0] = y & 255;
    j = (h + 4) | 0;
    y = 6113604;
    a[j] = y & 255;
    y = y >> 8;
    a[(j + 1) | 0] = y & 255;
    y = y >> 8;
    a[(j + 2) | 0] = y & 255;
    y = y >> 8;
    a[(j + 3) | 0] = y & 255;
    a1(
      (b + 164) | 0,
      41192,
      ((x = i),
      (i = (i + 16) | 0),
      (c[x >> 2] = c[(15880 + (g << 2)) >> 2]),
      (c[(x + 8) >> 2] = 32080),
      x) | 0
    ) | 0;
    c[e >> 2] = 2;
    c[f >> 2] = 0;
    i = d;
    return;
  }
  function gt(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0;
    d = i;
    c[(b + 12) >> 2] = 1;
    e = (b + 96) | 0;
    c[e >> 2] = 0;
    f = (b + 32) | 0;
    a[f] = a[21024] | 0;
    a[(f + 1) | 0] = a[21025 | 0] | 0;
    a[(f + 2) | 0] = a[21026 | 0] | 0;
    a[(f + 3) | 0] = a[21027 | 0] | 0;
    a[(f + 4) | 0] = a[21028 | 0] | 0;
    a[(f + 5) | 0] = a[21029 | 0] | 0;
    f = (b + 4) | 0;
    g = c[f >> 2] | 0;
    if ((g | 0) == 0) {
      i = d;
      return;
    }
    h = (b + 100) | 0;
    j = h | 0;
    y = 978535771;
    a[j] = y & 255;
    y = y >> 8;
    a[(j + 1) | 0] = y & 255;
    y = y >> 8;
    a[(j + 2) | 0] = y & 255;
    y = y >> 8;
    a[(j + 3) | 0] = y & 255;
    j = (h + 4) | 0;
    y = 6113604;
    a[j] = y & 255;
    y = y >> 8;
    a[(j + 1) | 0] = y & 255;
    y = y >> 8;
    a[(j + 2) | 0] = y & 255;
    y = y >> 8;
    a[(j + 3) | 0] = y & 255;
    a1(
      (b + 164) | 0,
      41192,
      ((x = i),
      (i = (i + 16) | 0),
      (c[x >> 2] = c[(15880 + (g << 2)) >> 2]),
      (c[(x + 8) >> 2] = 32080),
      x) | 0
    ) | 0;
    c[e >> 2] = 2;
    c[f >> 2] = 0;
    i = d;
    return;
  }
  function gu(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    y = 5524552;
    a[d] = y & 255;
    y = y >> 8;
    a[(d + 1) | 0] = y & 255;
    y = y >> 8;
    a[(d + 2) | 0] = y & 255;
    y = y >> 8;
    a[(d + 3) | 0] = y & 255;
    return;
  }
  function gv(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    y = 4410691;
    a[d] = y & 255;
    y = y >> 8;
    a[(d + 1) | 0] = y & 255;
    y = y >> 8;
    a[(d + 2) | 0] = y & 255;
    y = y >> 8;
    a[(d + 3) | 0] = y & 255;
    return;
  }
  function gw(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 2;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    a[g] = a[28048] | 0;
    a[(g + 1) | 0] = a[28049 | 0] | 0;
    a[(g + 2) | 0] = a[28050 | 0] | 0;
    a[(g + 3) | 0] = a[28051 | 0] | 0;
    a[(g + 4) | 0] = a[28052 | 0] | 0;
    g = (b + 100) | 0;
    a[g] = a[31608] | 0;
    a[(g + 1) | 0] = a[31609 | 0] | 0;
    a[(g + 2) | 0] = a[31610 | 0] | 0;
    a1(
      (b + 164) | 0,
      26648,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[(e + 1) | 0] | 0), x) | 0
    ) | 0;
    i = f;
    return;
  }
  function gx(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 3;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    a[g] = a[28048] | 0;
    a[(g + 1) | 0] = a[28049 | 0] | 0;
    a[(g + 2) | 0] = a[28050 | 0] | 0;
    a[(g + 3) | 0] = a[28051 | 0] | 0;
    a[(g + 4) | 0] = a[28052 | 0] | 0;
    g = (b + 100) | 0;
    a[g] = a[29888] | 0;
    a[(g + 1) | 0] = a[29889 | 0] | 0;
    a[(g + 2) | 0] = a[29890 | 0] | 0;
    a1(
      (b + 164) | 0,
      26776,
      ((x = i),
      (i = (i + 8) | 0),
      (c[x >> 2] = ((d[(e + 2) | 0] | 0) << 8) | (d[(e + 1) | 0] | 0)),
      x) | 0
    ) | 0;
    i = f;
    return;
  }
  function gy(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    a[d] = a[21088] | 0;
    a[(d + 1) | 0] = a[21089 | 0] | 0;
    a[(d + 2) | 0] = a[21090 | 0] | 0;
    a[(d + 3) | 0] = a[21091 | 0] | 0;
    a[(d + 4) | 0] = a[21092 | 0] | 0;
    a[(d + 5) | 0] = a[21093 | 0] | 0;
    return;
  }
  function gz(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    a[d] = a[21176] | 0;
    a[(d + 1) | 0] = a[21177 | 0] | 0;
    a[(d + 2) | 0] = a[21178 | 0] | 0;
    a[(d + 3) | 0] = a[21179 | 0] | 0;
    a[(d + 4) | 0] = a[21180 | 0] | 0;
    a[(d + 5) | 0] = a[21181 | 0] | 0;
    return;
  }
  function gA(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0;
    d = i;
    c[(b + 12) >> 2] = 1;
    e = (b + 96) | 0;
    c[e >> 2] = 0;
    f = (b + 32) | 0;
    a[f] = a[21256] | 0;
    a[(f + 1) | 0] = a[21257 | 0] | 0;
    a[(f + 2) | 0] = a[21258 | 0] | 0;
    a[(f + 3) | 0] = a[21259 | 0] | 0;
    a[(f + 4) | 0] = a[21260 | 0] | 0;
    a[(f + 5) | 0] = a[21261 | 0] | 0;
    f = (b + 4) | 0;
    g = c[f >> 2] | 0;
    if ((g | 0) == 0) {
      i = d;
      return;
    }
    a1(
      (b + 100) | 0,
      41192,
      ((x = i),
      (i = (i + 16) | 0),
      (c[x >> 2] = c[(15880 + (g << 2)) >> 2]),
      (c[(x + 8) >> 2] = 32080),
      x) | 0
    ) | 0;
    c[e >> 2] = 1;
    c[f >> 2] = 0;
    i = d;
    return;
  }
  function gB(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0;
    d = i;
    c[(b + 12) >> 2] = 1;
    e = (b + 96) | 0;
    c[e >> 2] = 0;
    f = (b + 32) | 0;
    a[f] = a[21344] | 0;
    a[(f + 1) | 0] = a[21345 | 0] | 0;
    a[(f + 2) | 0] = a[21346 | 0] | 0;
    a[(f + 3) | 0] = a[21347 | 0] | 0;
    a[(f + 4) | 0] = a[21348 | 0] | 0;
    a[(f + 5) | 0] = a[21349 | 0] | 0;
    f = (b + 4) | 0;
    g = c[f >> 2] | 0;
    if ((g | 0) == 0) {
      i = d;
      return;
    }
    a1(
      (b + 100) | 0,
      41192,
      ((x = i),
      (i = (i + 16) | 0),
      (c[x >> 2] = c[(15880 + (g << 2)) >> 2]),
      (c[(x + 8) >> 2] = 32080),
      x) | 0
    ) | 0;
    c[e >> 2] = 1;
    c[f >> 2] = 0;
    i = d;
    return;
  }
  function gC(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    a[d] = a[21544] | 0;
    a[(d + 1) | 0] = a[21545 | 0] | 0;
    a[(d + 2) | 0] = a[21546 | 0] | 0;
    a[(d + 3) | 0] = a[21547 | 0] | 0;
    a[(d + 4) | 0] = a[21548 | 0] | 0;
    a[(d + 5) | 0] = a[21549 | 0] | 0;
    return;
  }
  function gD(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    a[d] = a[21784] | 0;
    a[(d + 1) | 0] = a[21785 | 0] | 0;
    a[(d + 2) | 0] = a[21786 | 0] | 0;
    a[(d + 3) | 0] = a[21787 | 0] | 0;
    a[(d + 4) | 0] = a[21788 | 0] | 0;
    a[(d + 5) | 0] = a[21789 | 0] | 0;
    return;
  }
  function gE(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 2;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    y = 5656397;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    zQ((b + 100) | 0, c[(15904 + ((a[e] & 7) << 2)) >> 2] | 0) | 0;
    a1(
      (b + 164) | 0,
      26648,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[(e + 1) | 0] | 0), x) | 0
    ) | 0;
    i = f;
    return;
  }
  function gF(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 3;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    y = 5656397;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    zQ((b + 100) | 0, c[(15936 + ((a[e] & 7) << 2)) >> 2] | 0) | 0;
    a1(
      (b + 164) | 0,
      26776,
      ((x = i),
      (i = (i + 8) | 0),
      (c[x >> 2] = ((d[(e + 2) | 0] | 0) << 8) | (d[(e + 1) | 0] | 0)),
      x) | 0
    ) | 0;
    i = f;
    return;
  }
  function gG(a, b) {
    a = a | 0;
    b = b | 0;
    var e = 0,
      f = 0,
      g = 0;
    e = i;
    f = a | 0;
    c[f >> 2] = c[f >> 2] | 1;
    f = (b + 1) | 0;
    zQ((a + 32) | 0, c[(16200 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) | 0;
    g = hl(a, (a + 100) | 0, f, 0) | 0;
    a1(
      (a + 164) | 0,
      26648,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[(b + (g + 1)) | 0] | 0), x) |
        0
    ) | 0;
    c[(a + 12) >> 2] = g + 2;
    c[(a + 96) >> 2] = 2;
    i = e;
    return;
  }
  function gH(a, b) {
    a = a | 0;
    b = b | 0;
    var e = 0,
      f = 0,
      g = 0;
    e = i;
    f = a | 0;
    c[f >> 2] = c[f >> 2] | 1;
    f = (b + 1) | 0;
    zQ((a + 32) | 0, c[(16200 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) | 0;
    g = hl(a, (a + 100) | 0, f, 1) | 0;
    a1(
      (a + 164) | 0,
      26648,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[(b + (g + 1)) | 0] | 0), x) |
        0
    ) | 0;
    c[(a + 12) >> 2] = g + 2;
    c[(a + 96) >> 2] = 2;
    i = e;
    return;
  }
  function gI(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 3;
    c[(b + 96) >> 2] = 1;
    g = (b + 32) | 0;
    a[g] = a[21872] | 0;
    a[(g + 1) | 0] = a[21873 | 0] | 0;
    a[(g + 2) | 0] = a[21874 | 0] | 0;
    a[(g + 3) | 0] = a[21875 | 0] | 0;
    a[(g + 4) | 0] = a[21876 | 0] | 0;
    a1(
      (b + 100) | 0,
      26776,
      ((x = i),
      (i = (i + 8) | 0),
      (c[x >> 2] = ((d[(e + 2) | 0] | 0) << 8) | (d[(e + 1) | 0] | 0)),
      x) | 0
    ) | 0;
    i = f;
    return;
  }
  function gJ(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    a[d] = a[21872] | 0;
    a[(d + 1) | 0] = a[21873 | 0] | 0;
    a[(d + 2) | 0] = a[21874 | 0] | 0;
    a[(d + 3) | 0] = a[21875 | 0] | 0;
    a[(d + 4) | 0] = a[21876 | 0] | 0;
    return;
  }
  function gK(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 5457228;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    zQ((b + 100) | 0, c[(15936 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = (hl(b, (b + 164) | 0, f, 1) | 0) + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function gL(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (b + 32) | 0;
    y = 5456972;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    y = y >> 8;
    a[(f + 2) | 0] = y & 255;
    y = y >> 8;
    a[(f + 3) | 0] = y & 255;
    f = (e + 1) | 0;
    zQ((b + 100) | 0, c[(15936 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) |
      0;
    c[(b + 12) >> 2] = (hl(b, (b + 164) | 0, f, 1) | 0) + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function gM(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0;
    f = i;
    g = (b + 32) | 0;
    y = 5656397;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    g = hl(b, (b + 100) | 0, (e + 1) | 0, 0) | 0;
    h = (b + 12) | 0;
    c[h >> 2] = g;
    a1(
      (b + 164) | 0,
      26648,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[(e + (g + 1)) | 0] | 0), x) |
        0
    ) | 0;
    c[h >> 2] = (c[h >> 2] | 0) + 2;
    c[(b + 96) >> 2] = 2;
    i = f;
    return;
  }
  function gN(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0;
    f = i;
    g = (b + 32) | 0;
    y = 5656397;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    g = hl(b, (b + 100) | 0, (e + 1) | 0, 1) | 0;
    h = (b + 12) | 0;
    c[h >> 2] = g;
    a1(
      (b + 164) | 0,
      26776,
      ((x = i),
      (i = (i + 8) | 0),
      (c[x >> 2] =
        ((d[(e + (g + 2)) | 0] | 0) << 8) | (d[(e + (g + 1)) | 0] | 0)),
      x) | 0
    ) | 0;
    c[h >> 2] = (c[h >> 2] | 0) + 3;
    c[(b + 96) >> 2] = 2;
    i = f;
    return;
  }
  function gO(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    g = b | 0;
    c[g >> 2] = c[g >> 2] | 1;
    g = (b + 32) | 0;
    a[g] = a[22152] | 0;
    a[(g + 1) | 0] = a[22153 | 0] | 0;
    a[(g + 2) | 0] = a[22154 | 0] | 0;
    a[(g + 3) | 0] = a[22155 | 0] | 0;
    a[(g + 4) | 0] = a[22156 | 0] | 0;
    a[(g + 5) | 0] = a[22157 | 0] | 0;
    a1(
      (b + 100) | 0,
      26776,
      ((x = i),
      (i = (i + 8) | 0),
      (c[x >> 2] = ((d[(e + 2) | 0] | 0) << 8) | (d[(e + 1) | 0] | 0)),
      x) | 0
    ) | 0;
    a1(
      (b + 164) | 0,
      26648,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[(e + 3) | 0] | 0), x) | 0
    ) | 0;
    c[(b + 12) >> 2] = 4;
    c[(b + 96) >> 2] = 2;
    i = f;
    return;
  }
  function gP(b, d) {
    b = b | 0;
    d = d | 0;
    d = b | 0;
    c[d >> 2] = c[d >> 2] | 1;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    a[d] = a[22312] | 0;
    a[(d + 1) | 0] = a[22313 | 0] | 0;
    a[(d + 2) | 0] = a[22314 | 0] | 0;
    a[(d + 3) | 0] = a[22315 | 0] | 0;
    a[(d + 4) | 0] = a[22316 | 0] | 0;
    a[(d + 5) | 0] = a[22317 | 0] | 0;
    return;
  }
  function gQ(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 3;
    c[(b + 96) >> 2] = 1;
    g = (b + 32) | 0;
    a[g] = a[22448] | 0;
    a[(g + 1) | 0] = a[22449 | 0] | 0;
    a[(g + 2) | 0] = a[22450 | 0] | 0;
    a[(g + 3) | 0] = a[22451 | 0] | 0;
    a[(g + 4) | 0] = a[22452 | 0] | 0;
    a1(
      (b + 100) | 0,
      26776,
      ((x = i),
      (i = (i + 8) | 0),
      (c[x >> 2] = ((d[(e + 2) | 0] | 0) << 8) | (d[(e + 1) | 0] | 0)),
      x) | 0
    ) | 0;
    i = f;
    return;
  }
  function gR(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    a[d] = a[22448] | 0;
    a[(d + 1) | 0] = a[22449 | 0] | 0;
    a[(d + 2) | 0] = a[22450 | 0] | 0;
    a[(d + 3) | 0] = a[22451 | 0] | 0;
    a[(d + 4) | 0] = a[22452 | 0] | 0;
    return;
  }
  function gS(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    a[d] = a[22504] | 0;
    a[(d + 1) | 0] = a[22505 | 0] | 0;
    a[(d + 2) | 0] = a[22506 | 0] | 0;
    a[(d + 3) | 0] = a[22507 | 0] | 0;
    a[(d + 4) | 0] = a[22508 | 0] | 0;
    d = b | 0;
    c[d >> 2] = c[d >> 2] | 256;
    return;
  }
  function gT(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    g = b | 0;
    c[g >> 2] = c[g >> 2] | 256;
    c[(b + 12) >> 2] = 2;
    c[(b + 96) >> 2] = 1;
    g = (b + 32) | 0;
    y = 5525065;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    a1(
      (b + 100) | 0,
      26648,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[(e + 1) | 0] | 0), x) | 0
    ) | 0;
    i = f;
    return;
  }
  function gU(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    a[d] = a[23080] | 0;
    a[(d + 1) | 0] = a[23081 | 0] | 0;
    a[(d + 2) | 0] = a[23082 | 0] | 0;
    a[(d + 3) | 0] = a[23083 | 0] | 0;
    a[(d + 4) | 0] = a[23084 | 0] | 0;
    d = b | 0;
    c[d >> 2] = c[d >> 2] | 256;
    return;
  }
  function gV(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    a[d] = a[23152] | 0;
    a[(d + 1) | 0] = a[23153 | 0] | 0;
    a[(d + 2) | 0] = a[23154 | 0] | 0;
    a[(d + 3) | 0] = a[23155 | 0] | 0;
    a[(d + 4) | 0] = a[23156 | 0] | 0;
    return;
  }
  function gW(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (e + 1) | 0;
    zQ((b + 32) | 0, c[(16200 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) | 0;
    e = hl(b, (b + 100) | 0, f, 0) | 0;
    f = (b + 164) | 0;
    y = 49;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function gX(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (e + 1) | 0;
    zQ((b + 32) | 0, c[(16200 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) | 0;
    e = hl(b, (b + 100) | 0, f, 1) | 0;
    f = (b + 164) | 0;
    y = 49;
    a[f] = y & 255;
    y = y >> 8;
    a[(f + 1) | 0] = y & 255;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function gY(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (e + 1) | 0;
    zQ((b + 32) | 0, c[(16200 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) | 0;
    e = hl(b, (b + 100) | 0, f, 0) | 0;
    f = (b + 164) | 0;
    a[f] = a[31432] | 0;
    a[(f + 1) | 0] = a[31433 | 0] | 0;
    a[(f + 2) | 0] = a[31434 | 0] | 0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function gZ(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0;
    f = (e + 1) | 0;
    zQ((b + 32) | 0, c[(16200 + ((((d[f] | 0) >>> 3) & 7) << 2)) >> 2] | 0) | 0;
    e = hl(b, (b + 100) | 0, f, 1) | 0;
    f = (b + 164) | 0;
    a[f] = a[31432] | 0;
    a[(f + 1) | 0] = a[31433 | 0] | 0;
    a[(f + 2) | 0] = a[31434 | 0] | 0;
    c[(b + 12) >> 2] = e + 1;
    c[(b + 96) >> 2] = 2;
    return;
  }
  function g_(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    g = (b + 32) | 0;
    y = 5062977;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    a1(
      (b + 100) | 0,
      26648,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[(e + 1) | 0] | 0), x) | 0
    ) | 0;
    c[(b + 12) >> 2] = 2;
    c[(b + 96) >> 2] = 1;
    i = f;
    return;
  }
  function g$(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 0;
    d = (b + 32) | 0;
    a[d] = a[24792] | 0;
    a[(d + 1) | 0] = a[24793 | 0] | 0;
    a[(d + 2) | 0] = a[24794 | 0] | 0;
    a[(d + 3) | 0] = a[24795 | 0] | 0;
    a[(d + 4) | 0] = a[24796 | 0] | 0;
    return;
  }
  function g0(a, b) {
    a = a | 0;
    b = b | 0;
    var f = 0,
      g = 0,
      h = 0;
    f = i;
    g = a | 0;
    c[g >> 2] = c[g >> 2] | 512;
    c[(a + 12) >> 2] = 2;
    c[(a + 96) >> 2] = 1;
    g = d[(b + 1) | 0] | 0;
    h =
      ((e[(a + 8) >> 1] | 0) + 2 + (((g & 128) | 0) != 0 ? g | 65280 : g)) | 0;
    zQ((a + 32) | 0, c[(16184 + (((d[b] | 0) - 224) << 2)) >> 2] | 0) | 0;
    a1(
      (a + 100) | 0,
      26776,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = h & 65535), x) | 0
    ) | 0;
    i = f;
    return;
  }
  function g1(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 2;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    a[g] = a[25840] | 0;
    a[(g + 1) | 0] = a[25841 | 0] | 0;
    a[(g + 2) | 0] = a[25842 | 0] | 0;
    g = (b + 100) | 0;
    a[g] = a[31608] | 0;
    a[(g + 1) | 0] = a[31609 | 0] | 0;
    a[(g + 2) | 0] = a[31610 | 0] | 0;
    a1(
      (b + 164) | 0,
      26648,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[(e + 1) | 0] | 0), x) | 0
    ) | 0;
    i = f;
    return;
  }
  function g2(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 2;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    a[g] = a[25840] | 0;
    a[(g + 1) | 0] = a[25841 | 0] | 0;
    a[(g + 2) | 0] = a[25842 | 0] | 0;
    g = (b + 100) | 0;
    a[g] = a[29888] | 0;
    a[(g + 1) | 0] = a[29889 | 0] | 0;
    a[(g + 2) | 0] = a[29890 | 0] | 0;
    a1(
      (b + 164) | 0,
      26648,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[(e + 1) | 0] | 0), x) | 0
    ) | 0;
    i = f;
    return;
  }
  function g3(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 2;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    y = 5526863;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    a1(
      (b + 100) | 0,
      26648,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[(e + 1) | 0] | 0), x) | 0
    ) | 0;
    e = (b + 164) | 0;
    a[e] = a[31608] | 0;
    a[(e + 1) | 0] = a[31609 | 0] | 0;
    a[(e + 2) | 0] = a[31610 | 0] | 0;
    i = f;
    return;
  }
  function g4(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 2;
    c[(b + 96) >> 2] = 2;
    g = (b + 32) | 0;
    y = 5526863;
    a[g] = y & 255;
    y = y >> 8;
    a[(g + 1) | 0] = y & 255;
    y = y >> 8;
    a[(g + 2) | 0] = y & 255;
    y = y >> 8;
    a[(g + 3) | 0] = y & 255;
    a1(
      (b + 100) | 0,
      26648,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[(e + 1) | 0] | 0), x) | 0
    ) | 0;
    e = (b + 164) | 0;
    a[e] = a[29888] | 0;
    a[(e + 1) | 0] = a[29889 | 0] | 0;
    a[(e + 2) | 0] = a[29890 | 0] | 0;
    i = f;
    return;
  }
  function g5(e, f) {
    e = e | 0;
    f = f | 0;
    var g = 0,
      h = 0;
    g = i;
    h = e | 0;
    c[h >> 2] = c[h >> 2] | 256;
    c[(e + 12) >> 2] = 3;
    c[(e + 96) >> 2] = 1;
    h =
      ((((b[(e + 8) >> 1] | 0) + 3) & 65535) +
        (((d[(f + 2) | 0] | 0) << 8) | (d[(f + 1) | 0] | 0))) &
      65535;
    f = (e + 32) | 0;
    a[f] = a[31888] | 0;
    a[(f + 1) | 0] = a[31889 | 0] | 0;
    a[(f + 2) | 0] = a[31890 | 0] | 0;
    a[(f + 3) | 0] = a[31891 | 0] | 0;
    a[(f + 4) | 0] = a[31892 | 0] | 0;
    a1(
      (e + 100) | 0,
      26776,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = h & 65535), x) | 0
    ) | 0;
    i = g;
    return;
  }
  function g6(e, f) {
    e = e | 0;
    f = f | 0;
    var g = 0,
      h = 0;
    g = i;
    c[(e + 12) >> 2] = 3;
    c[(e + 96) >> 2] = 1;
    h =
      ((((b[(e + 8) >> 1] | 0) + 3) & 65535) +
        (((d[(f + 2) | 0] | 0) << 8) | (d[(f + 1) | 0] | 0))) &
      65535;
    f = (e + 32) | 0;
    a[f] = a[25200] | 0;
    a[(f + 1) | 0] = a[25201 | 0] | 0;
    a[(f + 2) | 0] = a[25202 | 0] | 0;
    a[(f + 3) | 0] = a[25203 | 0] | 0;
    a[(f + 4) | 0] = a[25204 | 0] | 0;
    a1(
      (e + 100) | 0,
      26776,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = h & 65535), x) | 0
    ) | 0;
    i = g;
    return;
  }
  function g7(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0;
    f = i;
    c[(b + 12) >> 2] = 5;
    c[(b + 96) >> 2] = 1;
    g = (b + 32) | 0;
    a[g] = a[26488] | 0;
    a[(g + 1) | 0] = a[26489 | 0] | 0;
    a[(g + 2) | 0] = a[26490 | 0] | 0;
    a[(g + 3) | 0] = a[26491 | 0] | 0;
    a[(g + 4) | 0] = a[26492 | 0] | 0;
    g = ((d[(e + 2) | 0] | 0) << 8) | (d[(e + 1) | 0] | 0);
    a1(
      (b + 100) | 0,
      25288,
      ((x = i),
      (i = (i + 16) | 0),
      (c[x >> 2] = ((d[(e + 4) | 0] | 0) << 8) | (d[(e + 3) | 0] | 0)),
      (c[(x + 8) >> 2] = g),
      x) | 0
    ) | 0;
    i = f;
    return;
  }
  function g8(b, f) {
    b = b | 0;
    f = f | 0;
    var g = 0,
      h = 0;
    g = i;
    c[(b + 12) >> 2] = 2;
    c[(b + 96) >> 2] = 1;
    h = d[(f + 1) | 0] | 0;
    f =
      ((e[(b + 8) >> 1] | 0) + 2 + (((h & 128) | 0) != 0 ? h | 65280 : h)) | 0;
    h = (b + 32) | 0;
    a[h] = a[25496] | 0;
    a[(h + 1) | 0] = a[25497 | 0] | 0;
    a[(h + 2) | 0] = a[25498 | 0] | 0;
    a[(h + 3) | 0] = a[25499 | 0] | 0;
    a[(h + 4) | 0] = a[25500 | 0] | 0;
    a1(
      (b + 100) | 0,
      26776,
      ((x = i), (i = (i + 8) | 0), (c[x >> 2] = f & 65535), x) | 0
    ) | 0;
    i = g;
    return;
  }
  function g9(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 2;
    d = (b + 32) | 0;
    a[d] = a[25840] | 0;
    a[(d + 1) | 0] = a[25841 | 0] | 0;
    a[(d + 2) | 0] = a[25842 | 0] | 0;
    d = (b + 100) | 0;
    a[d] = a[31608] | 0;
    a[(d + 1) | 0] = a[31609 | 0] | 0;
    a[(d + 2) | 0] = a[31610 | 0] | 0;
    d = (b + 164) | 0;
    a[d] = a[29600] | 0;
    a[(d + 1) | 0] = a[29601 | 0] | 0;
    a[(d + 2) | 0] = a[29602 | 0] | 0;
    return;
  }
  function ha(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 2;
    d = (b + 32) | 0;
    a[d] = a[25840] | 0;
    a[(d + 1) | 0] = a[25841 | 0] | 0;
    a[(d + 2) | 0] = a[25842 | 0] | 0;
    d = (b + 100) | 0;
    a[d] = a[29888] | 0;
    a[(d + 1) | 0] = a[29889 | 0] | 0;
    a[(d + 2) | 0] = a[29890 | 0] | 0;
    d = (b + 164) | 0;
    a[d] = a[29600] | 0;
    a[(d + 1) | 0] = a[29601 | 0] | 0;
    a[(d + 2) | 0] = a[29602 | 0] | 0;
    return;
  }
  function hb(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 2;
    d = (b + 32) | 0;
    y = 5526863;
    a[d] = y & 255;
    y = y >> 8;
    a[(d + 1) | 0] = y & 255;
    y = y >> 8;
    a[(d + 2) | 0] = y & 255;
    y = y >> 8;
    a[(d + 3) | 0] = y & 255;
    d = (b + 100) | 0;
    a[d] = a[29600] | 0;
    a[(d + 1) | 0] = a[29601 | 0] | 0;
    a[(d + 2) | 0] = a[29602 | 0] | 0;
    d = (b + 164) | 0;
    a[d] = a[31608] | 0;
    a[(d + 1) | 0] = a[31609 | 0] | 0;
    a[(d + 2) | 0] = a[31610 | 0] | 0;
    return;
  }
  function hc(b, d) {
    b = b | 0;
    d = d | 0;
    c[(b + 12) >> 2] = 1;
    c[(b + 96) >> 2] = 2;
    d = (b + 32) | 0;
    y = 5526863;
    a[d] = y & 255;
    y = y >> 8;
    a[(d + 1) | 0] = y & 255;
    y = y >> 8;
    a[(d + 2) | 0] = y & 255;
    y = y >> 8;
    a[(d + 3) | 0] = y & 255;
    d = (b + 100) | 0;
    a[d] = a[29600] | 0;
    a[(d + 1) | 0] = a[29601 | 0] | 0;
    a[(d + 2) | 0] = a[29602 | 0] | 0;
    d = (b + 164) | 0;
    a[d] = a[29888] | 0;
    a[(d + 1) | 0] = a[29889 | 0] | 0;
    a[(d + 2) | 0] = a[29890 | 0] | 0;
    return;
  }
  function hd(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0;
    e = i;
    i = (i + 256) | 0;
    f = e | 0;
    g = (d + 1) | 0;
    c[b >> 2] = 0;
    c[(b + 4) >> 2] = 0;
    b3[c[(14528 + ((a[g] & 255) << 2)) >> 2] & 511](b, g);
    g = (b + 12) | 0;
    if ((c[g >> 2] | 0) != 0) {
      h = 0;
      while (1) {
        j = (h + 1) | 0;
        a[(b + 16 + h) | 0] = a[(d + j) | 0] | 0;
        if (j >>> 0 < (c[g >> 2] | 0) >>> 0) {
          h = j;
        } else {
          break;
        }
      }
    }
    h = f | 0;
    f = (b + 32) | 0;
    zQ(h | 0, f | 0) | 0;
    a[f] = a[26128] | 0;
    a[(f + 1) | 0] = a[26129 | 0] | 0;
    a[(f + 2) | 0] = a[26130 | 0] | 0;
    a[(f + 3) | 0] = a[26131 | 0] | 0;
    a[(f + 4) | 0] = a[26132 | 0] | 0;
    a[(f + 5) | 0] = a[26133 | 0] | 0;
    zR(f | 0, h | 0) | 0;
    c[g >> 2] = (c[g >> 2] | 0) + 1;
    i = e;
    return;
  }
  function he(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0;
    e = i;
    i = (i + 256) | 0;
    f = e | 0;
    g = (d + 1) | 0;
    c[b >> 2] = 0;
    c[(b + 4) >> 2] = 0;
    b3[c[(14528 + ((a[g] & 255) << 2)) >> 2] & 511](b, g);
    g = (b + 12) | 0;
    if ((c[g >> 2] | 0) != 0) {
      h = 0;
      while (1) {
        j = (h + 1) | 0;
        a[(b + 16 + h) | 0] = a[(d + j) | 0] | 0;
        if (j >>> 0 < (c[g >> 2] | 0) >>> 0) {
          h = j;
        } else {
          break;
        }
      }
    }
    h = f | 0;
    f = (b + 32) | 0;
    zQ(h | 0, f | 0) | 0;
    a[f] = a[26208] | 0;
    a[(f + 1) | 0] = a[26209 | 0] | 0;
    a[(f + 2) | 0] = a[26210 | 0] | 0;
    a[(f + 3) | 0] = a[26211 | 0] | 0;
    a[(f + 4) | 0] = a[26212 | 0] | 0;
    a[(f + 5) | 0] = a[26213 | 0] | 0;
    a[(f + 6) | 0] = a[26214 | 0] | 0;
    zR(f | 0, h | 0) | 0;
    c[g >> 2] = (c[g >> 2] | 0) + 1;
    i = e;
    return;
  }
  function hf(b, d) {
    b = b | 0;
    d = d | 0;
    var e = 0,
      f = 0,
      g = 0,
      h = 0,
      j = 0;
    e = i;
    i = (i + 256) | 0;
    f = e | 0;
    g = (d + 1) | 0;
    c[b >> 2] = 0;
    c[(b + 4) >> 2] = 0;
    b3[c[(14528 + ((a[g] & 255) << 2)) >> 2] & 511](b, g);
    g = (b + 12) | 0;
    if ((c[g >> 2] | 0) != 0) {
      h = 0;
      while (1) {
        j = (h + 1) | 0;
        a[(b + 16 + h) | 0] = a[(d + j) | 0] | 0;
        if (j >>> 0 < (c[g >> 2] | 0) >>> 0) {
          h = j;
        } else {
          break;
        }
      }
    }
    h = f | 0;
    f = (b + 32) | 0;
    zQ(h | 0, f | 0) | 0;
    a[f] = a[26288] | 0;
    a[(f + 1) | 0] = a[26289 | 0] | 0;
    a[(f + 2) | 0] = a[26290 | 0] | 0;
    a[(f + 3) | 0] = a[26291 | 0] | 0;
    a[(f + 4) | 0] = a[26292 | 0] | 0;
    zR(f | 0, h | 0) | 0;
    c[g >> 2] = (c[g >> 2] | 0) + 1;
    i = e;
    return;
  }
  function hg(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0,
      j = 0;
    f = i;
    g = (e + 1) | 0;
    h = ((d[g] | 0) >>> 3) & 7;
    if ((h | 0) == 7) {
      j = (b + 32) | 0;
      a[j] = a[27072] | 0;
      a[(j + 1) | 0] = a[27073 | 0] | 0;
      a[(j + 2) | 0] = a[27074 | 0] | 0;
      a[(j + 3) | 0] = a[27075 | 0] | 0;
      a[(j + 4) | 0] = a[27076 | 0] | 0;
      c[(b + 12) >> 2] = (hl(b, (b + 100) | 0, g, 0) | 0) + 1;
      c[(b + 96) >> 2] = 1;
      i = f;
      return;
    } else if ((h | 0) == 6) {
      j = (b + 32) | 0;
      y = 5654852;
      a[j] = y & 255;
      y = y >> 8;
      a[(j + 1) | 0] = y & 255;
      y = y >> 8;
      a[(j + 2) | 0] = y & 255;
      y = y >> 8;
      a[(j + 3) | 0] = y & 255;
      c[(b + 12) >> 2] = (hl(b, (b + 100) | 0, g, 0) | 0) + 1;
      c[(b + 96) >> 2] = 1;
      i = f;
      return;
    } else if ((h | 0) == 5) {
      j = (b + 32) | 0;
      a[j] = a[27552] | 0;
      a[(j + 1) | 0] = a[27553 | 0] | 0;
      a[(j + 2) | 0] = a[27554 | 0] | 0;
      a[(j + 3) | 0] = a[27555 | 0] | 0;
      a[(j + 4) | 0] = a[27556 | 0] | 0;
      c[(b + 12) >> 2] = (hl(b, (b + 100) | 0, g, 0) | 0) + 1;
      c[(b + 96) >> 2] = 1;
      i = f;
      return;
    } else if ((h | 0) == 3) {
      j = (b + 32) | 0;
      y = 4670798;
      a[j] = y & 255;
      y = y >> 8;
      a[(j + 1) | 0] = y & 255;
      y = y >> 8;
      a[(j + 2) | 0] = y & 255;
      y = y >> 8;
      a[(j + 3) | 0] = y & 255;
      c[(b + 12) >> 2] = (hl(b, (b + 100) | 0, g, 0) | 0) + 1;
      c[(b + 96) >> 2] = 1;
      i = f;
      return;
    } else if ((h | 0) == 2) {
      j = (b + 32) | 0;
      y = 5525326;
      a[j] = y & 255;
      y = y >> 8;
      a[(j + 1) | 0] = y & 255;
      y = y >> 8;
      a[(j + 2) | 0] = y & 255;
      y = y >> 8;
      a[(j + 3) | 0] = y & 255;
      c[(b + 12) >> 2] = (hl(b, (b + 100) | 0, g, 0) | 0) + 1;
      c[(b + 96) >> 2] = 1;
      i = f;
      return;
    } else if ((h | 0) == 1) {
      c[(b + 12) >> 2] = 1;
      c[(b + 96) >> 2] = 1;
      j = (b + 32) | 0;
      a[j] = a[35688] | 0;
      a[(j + 1) | 0] = a[35689 | 0] | 0;
      a[(j + 2) | 0] = a[35690 | 0] | 0;
      a1(
        (b + 100) | 0,
        26648,
        ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[e] | 0), x) | 0
      ) | 0;
      i = f;
      return;
    } else if ((h | 0) == 0) {
      j = (b + 32) | 0;
      a[j] = a[28048] | 0;
      a[(j + 1) | 0] = a[28049 | 0] | 0;
      a[(j + 2) | 0] = a[28050 | 0] | 0;
      a[(j + 3) | 0] = a[28051 | 0] | 0;
      a[(j + 4) | 0] = a[28052 | 0] | 0;
      j = hl(b, (b + 100) | 0, g, 0) | 0;
      a1(
        (b + 164) | 0,
        26648,
        ((x = i),
        (i = (i + 8) | 0),
        (c[x >> 2] = d[(e + (j + 1)) | 0] | 0),
        x) | 0
      ) | 0;
      c[(b + 12) >> 2] = j + 2;
      c[(b + 96) >> 2] = 2;
      i = f;
      return;
    } else if ((h | 0) == 4) {
      h = (b + 32) | 0;
      y = 5002573;
      a[h] = y & 255;
      y = y >> 8;
      a[(h + 1) | 0] = y & 255;
      y = y >> 8;
      a[(h + 2) | 0] = y & 255;
      y = y >> 8;
      a[(h + 3) | 0] = y & 255;
      c[(b + 12) >> 2] = (hl(b, (b + 100) | 0, g, 0) | 0) + 1;
      c[(b + 96) >> 2] = 1;
      i = f;
      return;
    } else {
      c[(b + 12) >> 2] = 1;
      c[(b + 96) >> 2] = 1;
      g = (b + 32) | 0;
      a[g] = a[35688] | 0;
      a[(g + 1) | 0] = a[35689 | 0] | 0;
      a[(g + 2) | 0] = a[35690 | 0] | 0;
      a1(
        (b + 100) | 0,
        26648,
        ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[e] | 0), x) | 0
      ) | 0;
      i = f;
      return;
    }
  }
  function hh(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0,
      j = 0;
    f = i;
    g = (e + 1) | 0;
    h = ((d[g] | 0) >>> 3) & 7;
    if ((h | 0) == 2) {
      j = (b + 32) | 0;
      y = 5525326;
      a[j] = y & 255;
      y = y >> 8;
      a[(j + 1) | 0] = y & 255;
      y = y >> 8;
      a[(j + 2) | 0] = y & 255;
      y = y >> 8;
      a[(j + 3) | 0] = y & 255;
      c[(b + 12) >> 2] = (hl(b, (b + 100) | 0, g, 1) | 0) + 1;
      c[(b + 96) >> 2] = 1;
      i = f;
      return;
    } else if ((h | 0) == 3) {
      j = (b + 32) | 0;
      y = 4670798;
      a[j] = y & 255;
      y = y >> 8;
      a[(j + 1) | 0] = y & 255;
      y = y >> 8;
      a[(j + 2) | 0] = y & 255;
      y = y >> 8;
      a[(j + 3) | 0] = y & 255;
      c[(b + 12) >> 2] = (hl(b, (b + 100) | 0, g, 1) | 0) + 1;
      c[(b + 96) >> 2] = 1;
      i = f;
      return;
    } else if ((h | 0) == 1) {
      c[(b + 12) >> 2] = 1;
      c[(b + 96) >> 2] = 1;
      j = (b + 32) | 0;
      a[j] = a[35688] | 0;
      a[(j + 1) | 0] = a[35689 | 0] | 0;
      a[(j + 2) | 0] = a[35690 | 0] | 0;
      a1(
        (b + 100) | 0,
        26648,
        ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[e] | 0), x) | 0
      ) | 0;
      i = f;
      return;
    } else if ((h | 0) == 4) {
      j = (b + 32) | 0;
      y = 5002573;
      a[j] = y & 255;
      y = y >> 8;
      a[(j + 1) | 0] = y & 255;
      y = y >> 8;
      a[(j + 2) | 0] = y & 255;
      y = y >> 8;
      a[(j + 3) | 0] = y & 255;
      c[(b + 12) >> 2] = (hl(b, (b + 100) | 0, g, 1) | 0) + 1;
      c[(b + 96) >> 2] = 1;
      i = f;
      return;
    } else if ((h | 0) == 6) {
      j = (b + 32) | 0;
      y = 5654852;
      a[j] = y & 255;
      y = y >> 8;
      a[(j + 1) | 0] = y & 255;
      y = y >> 8;
      a[(j + 2) | 0] = y & 255;
      y = y >> 8;
      a[(j + 3) | 0] = y & 255;
      c[(b + 12) >> 2] = (hl(b, (b + 100) | 0, g, 1) | 0) + 1;
      c[(b + 96) >> 2] = 1;
      i = f;
      return;
    } else if ((h | 0) == 7) {
      j = (b + 32) | 0;
      a[j] = a[27072] | 0;
      a[(j + 1) | 0] = a[27073 | 0] | 0;
      a[(j + 2) | 0] = a[27074 | 0] | 0;
      a[(j + 3) | 0] = a[27075 | 0] | 0;
      a[(j + 4) | 0] = a[27076 | 0] | 0;
      c[(b + 12) >> 2] = (hl(b, (b + 100) | 0, g, 1) | 0) + 1;
      c[(b + 96) >> 2] = 1;
      i = f;
      return;
    } else if ((h | 0) == 0) {
      j = (b + 32) | 0;
      a[j] = a[28048] | 0;
      a[(j + 1) | 0] = a[28049 | 0] | 0;
      a[(j + 2) | 0] = a[28050 | 0] | 0;
      a[(j + 3) | 0] = a[28051 | 0] | 0;
      a[(j + 4) | 0] = a[28052 | 0] | 0;
      j = hl(b, (b + 100) | 0, g, 1) | 0;
      a1(
        (b + 164) | 0,
        26776,
        ((x = i),
        (i = (i + 8) | 0),
        (c[x >> 2] =
          ((d[(e + (j + 2)) | 0] | 0) << 8) | (d[(e + (j + 1)) | 0] | 0)),
        x) | 0
      ) | 0;
      c[(b + 12) >> 2] = j + 3;
      c[(b + 96) >> 2] = 2;
      i = f;
      return;
    } else if ((h | 0) == 5) {
      h = (b + 32) | 0;
      a[h] = a[27552] | 0;
      a[(h + 1) | 0] = a[27553 | 0] | 0;
      a[(h + 2) | 0] = a[27554 | 0] | 0;
      a[(h + 3) | 0] = a[27555 | 0] | 0;
      a[(h + 4) | 0] = a[27556 | 0] | 0;
      c[(b + 12) >> 2] = (hl(b, (b + 100) | 0, g, 1) | 0) + 1;
      c[(b + 96) >> 2] = 1;
      i = f;
      return;
    } else {
      c[(b + 12) >> 2] = 1;
      c[(b + 96) >> 2] = 1;
      g = (b + 32) | 0;
      a[g] = a[35688] | 0;
      a[(g + 1) | 0] = a[35689 | 0] | 0;
      a[(g + 2) | 0] = a[35690 | 0] | 0;
      a1(
        (b + 100) | 0,
        26648,
        ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[e] | 0), x) | 0
      ) | 0;
      i = f;
      return;
    }
  }
  function hi(a, b) {
    a = a | 0;
    b = b | 0;
    c[(a + 12) >> 2] = 1;
    c[(a + 96) >> 2] = 0;
    zQ((a + 32) | 0, c[(15968 + (((d[b] | 0) - 248) << 2)) >> 2] | 0) | 0;
    return;
  }
  function hj(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0,
      j = 0;
    f = i;
    g = (e + 1) | 0;
    h = ((d[g] | 0) >>> 3) & 7;
    if ((h | 0) == 1) {
      j = (b + 32) | 0;
      y = 4408644;
      a[j] = y & 255;
      y = y >> 8;
      a[(j + 1) | 0] = y & 255;
      y = y >> 8;
      a[(j + 2) | 0] = y & 255;
      y = y >> 8;
      a[(j + 3) | 0] = y & 255;
      c[(b + 12) >> 2] = (hl(b, (b + 100) | 0, g, 0) | 0) + 1;
      c[(b + 96) >> 2] = 1;
      i = f;
      return;
    } else if ((h | 0) == 0) {
      h = (b + 32) | 0;
      y = 4410953;
      a[h] = y & 255;
      y = y >> 8;
      a[(h + 1) | 0] = y & 255;
      y = y >> 8;
      a[(h + 2) | 0] = y & 255;
      y = y >> 8;
      a[(h + 3) | 0] = y & 255;
      c[(b + 12) >> 2] = (hl(b, (b + 100) | 0, g, 0) | 0) + 1;
      c[(b + 96) >> 2] = 1;
      i = f;
      return;
    } else {
      c[(b + 12) >> 2] = 1;
      c[(b + 96) >> 2] = 1;
      g = (b + 32) | 0;
      a[g] = a[35688] | 0;
      a[(g + 1) | 0] = a[35689 | 0] | 0;
      a[(g + 2) | 0] = a[35690 | 0] | 0;
      a1(
        (b + 100) | 0,
        26648,
        ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[e] | 0), x) | 0
      ) | 0;
      i = f;
      return;
    }
  }
  function hk(b, e) {
    b = b | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0,
      j = 0;
    f = i;
    g = (e + 1) | 0;
    h = ((d[g] | 0) >>> 3) & 7;
    if ((h | 0) == 1) {
      j = (b + 32) | 0;
      y = 4408644;
      a[j] = y & 255;
      y = y >> 8;
      a[(j + 1) | 0] = y & 255;
      y = y >> 8;
      a[(j + 2) | 0] = y & 255;
      y = y >> 8;
      a[(j + 3) | 0] = y & 255;
      c[(b + 12) >> 2] = (hl(b, (b + 100) | 0, g, 1) | 0) + 1;
      c[(b + 96) >> 2] = 1;
      i = f;
      return;
    } else if ((h | 0) == 2) {
      j = (b + 32) | 0;
      a[j] = a[31888] | 0;
      a[(j + 1) | 0] = a[31889 | 0] | 0;
      a[(j + 2) | 0] = a[31890 | 0] | 0;
      a[(j + 3) | 0] = a[31891 | 0] | 0;
      a[(j + 4) | 0] = a[31892 | 0] | 0;
      c[(b + 12) >> 2] = (hl(b, (b + 100) | 0, g, 1) | 0) + 1;
      c[(b + 96) >> 2] = 1;
      j = b | 0;
      c[j >> 2] = c[j >> 2] | 256;
      i = f;
      return;
    } else if ((h | 0) == 3) {
      j = (b + 32) | 0;
      a[j] = a[30056] | 0;
      a[(j + 1) | 0] = a[30057 | 0] | 0;
      a[(j + 2) | 0] = a[30058 | 0] | 0;
      a[(j + 3) | 0] = a[30059 | 0] | 0;
      a[(j + 4) | 0] = a[30060 | 0] | 0;
      a[(j + 5) | 0] = a[30061 | 0] | 0;
      c[(b + 12) >> 2] = (hl(b, (b + 100) | 0, g, 1) | 0) + 1;
      c[(b + 96) >> 2] = 1;
      j = b | 0;
      c[j >> 2] = c[j >> 2] | 256;
      i = f;
      return;
    } else if ((h | 0) == 5) {
      j = (b + 32) | 0;
      a[j] = a[26488] | 0;
      a[(j + 1) | 0] = a[26489 | 0] | 0;
      a[(j + 2) | 0] = a[26490 | 0] | 0;
      a[(j + 3) | 0] = a[26491 | 0] | 0;
      a[(j + 4) | 0] = a[26492 | 0] | 0;
      c[(b + 12) >> 2] = (hl(b, (b + 100) | 0, g, 1) | 0) + 1;
      c[(b + 96) >> 2] = 1;
      i = f;
      return;
    } else if ((h | 0) == 6) {
      j = (b + 32) | 0;
      a[j] = a[25072] | 0;
      a[(j + 1) | 0] = a[25073 | 0] | 0;
      a[(j + 2) | 0] = a[25074 | 0] | 0;
      a[(j + 3) | 0] = a[25075 | 0] | 0;
      a[(j + 4) | 0] = a[25076 | 0] | 0;
      c[(b + 12) >> 2] = (hl(b, (b + 100) | 0, g, 1) | 0) + 1;
      c[(b + 96) >> 2] = 1;
      i = f;
      return;
    } else if ((h | 0) == 7) {
      c[(b + 12) >> 2] = 1;
      c[(b + 96) >> 2] = 1;
      j = (b + 32) | 0;
      a[j] = a[35688] | 0;
      a[(j + 1) | 0] = a[35689 | 0] | 0;
      a[(j + 2) | 0] = a[35690 | 0] | 0;
      a1(
        (b + 100) | 0,
        26648,
        ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[e] | 0), x) | 0
      ) | 0;
      i = f;
      return;
    } else if ((h | 0) == 0) {
      j = (b + 32) | 0;
      y = 4410953;
      a[j] = y & 255;
      y = y >> 8;
      a[(j + 1) | 0] = y & 255;
      y = y >> 8;
      a[(j + 2) | 0] = y & 255;
      y = y >> 8;
      a[(j + 3) | 0] = y & 255;
      c[(b + 12) >> 2] = (hl(b, (b + 100) | 0, g, 1) | 0) + 1;
      c[(b + 96) >> 2] = 1;
      i = f;
      return;
    } else if ((h | 0) == 4) {
      h = (b + 32) | 0;
      y = 5262666;
      a[h] = y & 255;
      y = y >> 8;
      a[(h + 1) | 0] = y & 255;
      y = y >> 8;
      a[(h + 2) | 0] = y & 255;
      y = y >> 8;
      a[(h + 3) | 0] = y & 255;
      c[(b + 12) >> 2] = (hl(b, (b + 100) | 0, g, 1) | 0) + 1;
      c[(b + 96) >> 2] = 1;
      i = f;
      return;
    } else {
      c[(b + 12) >> 2] = 1;
      c[(b + 96) >> 2] = 1;
      g = (b + 32) | 0;
      a[g] = a[35688] | 0;
      a[(g + 1) | 0] = a[35689 | 0] | 0;
      a[(g + 2) | 0] = a[35690 | 0] | 0;
      a1(
        (b + 100) | 0,
        26648,
        ((x = i), (i = (i + 8) | 0), (c[x >> 2] = d[e] | 0), x) | 0
      ) | 0;
      i = f;
      return;
    }
  }
  function hl(b, e, f, g) {
    b = b | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    var h = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0;
    h = i;
    j = d[f] | 0;
    k = j & 192;
    if ((k | 0) == 192) {
      l = j & 7;
      if ((g | 0) == 0) {
        m = c[(15904 + (l << 2)) >> 2] | 0;
        zQ(e | 0, m | 0) | 0;
        n = 1;
        i = h;
        return n | 0;
      } else {
        m = c[(15936 + (l << 2)) >> 2] | 0;
        zQ(e | 0, m | 0) | 0;
        n = 1;
        i = h;
        return n | 0;
      }
    }
    m = (k >>> 3) | (j & 7);
    j = (b + 4) | 0;
    b = c[(15880 + (c[j >> 2] << 2)) >> 2] | 0;
    c[j >> 2] = 0;
    j = (g | 0) != 0 ? 23768 : 22224;
    a[e] = a[j] | 0;
    a[(e + 1) | 0] = a[(j + 1) | 0] | 0;
    a[(e + 2) | 0] = a[(j + 2) | 0] | 0;
    a[(e + 3) | 0] = a[(j + 3) | 0] | 0;
    a[(e + 4) | 0] = a[(j + 4) | 0] | 0;
    a[(e + 5) | 0] = a[(j + 5) | 0] | 0;
    j = (e + (zN(e | 0) | 0)) | 0;
    e = c[(15996 + (m << 3)) >> 2] | 0;
    if ((m | 0) == 6) {
      g = ((d[(f + 2) | 0] | 0) << 8) | (d[(f + 1) | 0] | 0);
      a1(
        j | 0,
        21112,
        ((x = i),
        (i = (i + 16) | 0),
        (c[x >> 2] = b),
        (c[(x + 8) >> 2] = g),
        x) | 0
      ) | 0;
      n = 3;
      i = h;
      return n | 0;
    }
    g = c[(15992 + (m << 3)) >> 2] | 0;
    if ((g | 0) == 0) {
      a1(
        j | 0,
        41192,
        ((x = i),
        (i = (i + 16) | 0),
        (c[x >> 2] = b),
        (c[(x + 8) >> 2] = e),
        x) | 0
      ) | 0;
    } else if ((g | 0) == 2) {
      m = (d[(f + 2) | 0] | 0) << 8;
      k = m | (d[(f + 1) | 0] | 0);
      l = m & 32768;
      a1(
        j | 0,
        38544,
        ((x = i),
        (i = (i + 32) | 0),
        (c[x >> 2] = b),
        (c[(x + 8) >> 2] = e),
        (c[(x + 16) >> 2] = (l >>> 14) + 43),
        (c[(x + 24) >> 2] = ((l | 0) == 0 ? k : -k | 0) & 65535),
        x) | 0
      ) | 0;
    } else if ((g | 0) == 1) {
      k = d[(f + 1) | 0] | 0;
      f = k & 128;
      a1(
        j | 0,
        39824,
        ((x = i),
        (i = (i + 32) | 0),
        (c[x >> 2] = b),
        (c[(x + 8) >> 2] = e),
        (c[(x + 16) >> 2] = (f >>> 6) + 43),
        (c[(x + 24) >> 2] = ((f | 0) == 0 ? k : -k | 0) & 255),
        x) | 0
      ) | 0;
    } else {
      a[j] = a[37592] | 0;
      a[(j + 1) | 0] = a[37593 | 0] | 0;
      a[(j + 2) | 0] = a[37594 | 0] | 0;
      a[(j + 3) | 0] = a[37595 | 0] | 0;
      a[(j + 4) | 0] = a[37596 | 0] | 0;
      a[(j + 5) | 0] = a[37597 | 0] | 0;
    }
    n = (g + 1) | 0;
    i = h;
    return n | 0;
  }
  function hm(a) {
    a = a | 0;
    var b = 0;
    hD(a);
    b = a | 0;
    c[b >> 2] = (c[b >> 2] & -12) | 10;
    c[(a + 544) >> 2] = 408;
    c[(a + 548) >> 2] = 190;
    c[(a + 552) >> 2] = 194;
    c[(a + 576) >> 2] = 196;
    c[(a + 580) >> 2] = 450;
    c[(a + 584) >> 2] = 170;
    c[(a + 588) >> 2] = 174;
    c[(a + 592) >> 2] = 172;
    c[(a + 596) >> 2] = 166;
    c[(a + 600) >> 2] = 164;
    c[(a + 604) >> 2] = 168;
    c[(a + 928) >> 2] = 352;
    c[(a + 932) >> 2] = 354;
    c[(a + 960) >> 2] = 336;
    c[(a + 964) >> 2] = 448;
    return;
  }
  function hn(a) {
    a = a | 0;
    var d = 0;
    d = b[(a + 12) >> 1] | 0;
    iK(a, b[(a + 4) >> 1] | 0);
    iK(a, b[(a + 6) >> 1] | 0);
    iK(a, b[(a + 8) >> 1] | 0);
    iK(a, b[(a + 10) >> 1] | 0);
    iK(a, d);
    iK(a, b[(a + 14) >> 1] | 0);
    iK(a, b[(a + 16) >> 1] | 0);
    iK(a, b[(a + 18) >> 1] | 0);
    d = (a + 1200) | 0;
    c[d >> 2] = (c[d >> 2] | 0) + 19;
    return 1;
  }
  function ho(a) {
    a = a | 0;
    var d = 0;
    b[(a + 18) >> 1] = iL(a) | 0;
    b[(a + 16) >> 1] = iL(a) | 0;
    b[(a + 14) >> 1] = iL(a) | 0;
    iL(a) | 0;
    b[(a + 10) >> 1] = iL(a) | 0;
    b[(a + 8) >> 1] = iL(a) | 0;
    b[(a + 6) >> 1] = iL(a) | 0;
    b[(a + 4) >> 1] = iL(a) | 0;
    d = (a + 1200) | 0;
    c[d >> 2] = (c[d >> 2] | 0) + 19;
    return 1;
  }
  function hp(a) {
    a = a | 0;
    var f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0;
    f = (a + 129) | 0;
    iD(a, f);
    g = b[(a + 4 + ((((d[f] | 0) >>> 3) & 7) << 1)) >> 1] | 0;
    f = g & 65535;
    if ((c[(a + 1184) >> 2] | 0) == 0) {
      h = c[q >> 2] | 0;
      aB(25256, 21, 1, h | 0) | 0;
      i = ((e[(a + 1196) >> 1] | 0) + 1) | 0;
      return i | 0;
    }
    h = b[(a + 1194) >> 1] | 0;
    j = (e[(a + 1192) >> 1] | 0) << 4;
    k = (a + 80) | 0;
    l = c[k >> 2] | 0;
    m = (j + (h & 65535)) & l;
    n = (m + 1) | 0;
    o = (a + 76) | 0;
    p = c[o >> 2] | 0;
    if (n >>> 0 < p >>> 0) {
      r = c[(a + 72) >> 2] | 0;
      s = ((d[(r + n) | 0] | 0) << 8) | (d[(r + m) | 0] | 0);
      t = l;
      u = p;
    } else {
      p = b8[c[(a + 44) >> 2] & 255](c[(a + 32) >> 2] | 0, m) | 0;
      s = p;
      t = c[k >> 2] | 0;
      u = c[o >> 2] | 0;
    }
    o = s & 65535;
    k = t & (((h + 2) & 65535) + j);
    j = (k + 1) | 0;
    if (j >>> 0 < u >>> 0) {
      u = c[(a + 72) >> 2] | 0;
      v = ((d[(u + j) | 0] | 0) << 8) | (d[(u + k) | 0] | 0);
    } else {
      v = b8[c[(a + 44) >> 2] & 255](c[(a + 32) >> 2] | 0, k) | 0;
    }
    k = v & 65535;
    u = (g << 16) >> 16 < 0 ? f | -65536 : f;
    do {
      if ((u | 0) >= (((s << 16) >> 16 < 0 ? o | -65536 : o) | 0)) {
        if ((u | 0) > ((((v << 16) >> 16 < 0 ? k | -65536 : k) + 2) | 0)) {
          break;
        }
        f = (a + 1200) | 0;
        c[f >> 2] = (c[f >> 2] | 0) + 34;
        i = ((e[(a + 1196) >> 1] | 0) + 1) | 0;
        return i | 0;
      }
    } while (0);
    id(a, 5);
    i = 0;
    return i | 0;
  }
  function hq(a) {
    a = a | 0;
    var b = 0;
    iK(a, ((d[(a + 130) | 0] | 0) << 8) | (d[(a + 129) | 0] | 0));
    b = (a + 1200) | 0;
    c[b >> 2] = (c[b >> 2] | 0) + 3;
    return 3;
  }
  function hr(a) {
    a = a | 0;
    var f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0,
      l = 0;
    f = (a + 129) | 0;
    iD(a, f);
    g = (iF(a) | 0) & 65535;
    h = (a + 1196) | 0;
    i = e[h >> 1] | 0;
    j = (d[(i + 2 + (a + 128)) | 0] | 0) << 8;
    k = j | (d[(i + 1 + (a + 128)) | 0] | 0);
    i =
      ac(
        ((j & 32768) | 0) != 0 ? k | -65536 : k,
        ((g & 32768) | 0) != 0 ? g | -65536 : g
      ) | 0;
    b[(a + 4 + ((((d[f] | 0) >>> 3) & 7) << 1)) >> 1] = i & 65535;
    f = i & -32768;
    i = (a + 30) | 0;
    g = b[i >> 1] | 0;
    if (((f | 0) == (-32768 | 0)) | ((f | 0) == 0)) {
      l = g & -2050;
    } else {
      l = g | 2049;
    }
    b[i >> 1] = (f | 0) == 0 ? l | 64 : l & -65;
    l = (a + 1200) | 0;
    c[l >> 2] = ((c[(a + 1184) >> 2] | 0) != 0 ? 30 : 23) + (c[l >> 2] | 0);
    return ((e[h >> 1] | 0) + 3) | 0;
  }
  function hs(a) {
    a = a | 0;
    var b = 0;
    b = d[(a + 129) | 0] | 0;
    iK(a, (((b & 128) | 0) != 0 ? b | 65280 : b) & 65535);
    b = (a + 1200) | 0;
    c[b >> 2] = (c[b >> 2] | 0) + 3;
    return 2;
  }
  function ht(a) {
    a = a | 0;
    var f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0;
    f = (a + 129) | 0;
    iD(a, f);
    g = (iF(a) | 0) & 65535;
    h = (a + 1196) | 0;
    i = d[((e[h >> 1] | 0) + 1 + (a + 128)) | 0] | 0;
    j = ((i & 128) | 0) != 0 ? i | 65280 : i;
    i =
      ac(
        ((j & 32768) | 0) != 0 ? j | -65536 : j,
        ((g & 32768) | 0) != 0 ? g | -65536 : g
      ) | 0;
    b[(a + 4 + ((((d[f] | 0) >>> 3) & 7) << 1)) >> 1] = i & 65535;
    f = i & -32768;
    i = (a + 30) | 0;
    g = b[i >> 1] | 0;
    if (((f | 0) == (-32768 | 0)) | ((f | 0) == 0)) {
      k = g & -2050;
    } else {
      k = g | 2049;
    }
    b[i >> 1] = (f | 0) == 0 ? k | 64 : k & -65;
    k = (a + 1200) | 0;
    c[k >> 2] = ((c[(a + 1184) >> 2] | 0) != 0 ? 30 : 23) + (c[k >> 2] | 0);
    return ((e[h >> 1] | 0) + 2) | 0;
  }
  function hu(d) {
    d = d | 0;
    var f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0;
    f = (((((e[(d + 30) >> 1] | 0) >>> 9) & 2) ^ 2) - 1) & 65535;
    if (((c[(d + 144) >> 2] & 12) | 0) == 0) {
      g = b[(d + 20) >> 1] | 0;
      h = (d + 18) | 0;
      i = b[h >> 1] | 0;
      j =
        b8[c[(d + 56) >> 2] & 255](c[(d + 52) >> 2] | 0, e[(d + 8) >> 1] | 0) |
        0;
      k = c[(d + 80) >> 2] & (((g & 65535) << 4) + (i & 65535));
      if (k >>> 0 < (c[(d + 76) >> 2] | 0) >>> 0) {
        a[((c[(d + 72) >> 2] | 0) + k) | 0] = j;
      } else {
        b5[c[(d + 40) >> 2] & 255](c[(d + 32) >> 2] | 0, k, j);
      }
      b[h >> 1] = ((b[h >> 1] | 0) + f) & 65535;
      h = (d + 1200) | 0;
      c[h >> 2] = (c[h >> 2] | 0) + 8;
      return 1;
    }
    h = (d + 6) | 0;
    if ((b[h >> 1] | 0) == 0) {
      return 1;
    }
    j = (d + 20) | 0;
    k = (d + 18) | 0;
    i = (d + 56) | 0;
    g = (d + 52) | 0;
    l = (d + 8) | 0;
    m = (d + 80) | 0;
    n = (d + 76) | 0;
    o = (d + 72) | 0;
    p = (d + 1216) | 0;
    q = (d + 1200) | 0;
    r = (d + 40) | 0;
    s = (d + 32) | 0;
    d = b[k >> 1] | 0;
    do {
      t = b[j >> 1] | 0;
      u = b8[c[i >> 2] & 255](c[g >> 2] | 0, e[l >> 1] | 0) | 0;
      v = c[m >> 2] & (((t & 65535) << 4) + (d & 65535));
      if (v >>> 0 < (c[n >> 2] | 0) >>> 0) {
        a[((c[o >> 2] | 0) + v) | 0] = u;
      } else {
        b5[c[r >> 2] & 255](c[s >> 2] | 0, v, u);
      }
      d = ((b[k >> 1] | 0) + f) & 65535;
      b[k >> 1] = d;
      u = ((b[h >> 1] | 0) - 1) & 65535;
      b[h >> 1] = u;
      v = zW(c[p >> 2] | 0, c[(p + 4) >> 2] | 0, 1, 0) | 0;
      c[p >> 2] = v;
      c[(p + 4) >> 2] = G;
      c[q >> 2] = (c[q >> 2] | 0) + 8;
    } while ((u << 16) >> 16 != 0);
    return 1;
  }
  function hv(d) {
    d = d | 0;
    var f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0;
    f = (((((e[(d + 30) >> 1] | 0) >>> 8) & 4) ^ 4) - 2) & 65535;
    if (((c[(d + 144) >> 2] & 12) | 0) == 0) {
      g = b[(d + 20) >> 1] | 0;
      h = (d + 18) | 0;
      i = b[h >> 1] | 0;
      j =
        b8[c[(d + 64) >> 2] & 255](c[(d + 52) >> 2] | 0, e[(d + 8) >> 1] | 0) |
        0;
      k = c[(d + 80) >> 2] & (((g & 65535) << 4) + (i & 65535));
      i = (k + 1) | 0;
      if (i >>> 0 < (c[(d + 76) >> 2] | 0) >>> 0) {
        g = (d + 72) | 0;
        a[((c[g >> 2] | 0) + k) | 0] = j & 255;
        a[((c[g >> 2] | 0) + i) | 0] = ((j & 65535) >>> 8) & 255;
      } else {
        b5[c[(d + 48) >> 2] & 255](c[(d + 32) >> 2] | 0, k, j);
      }
      b[h >> 1] = ((b[h >> 1] | 0) + f) & 65535;
      h = (d + 1200) | 0;
      c[h >> 2] = (c[h >> 2] | 0) + 8;
      return 1;
    }
    h = (d + 6) | 0;
    if ((b[h >> 1] | 0) == 0) {
      return 1;
    }
    j = (d + 20) | 0;
    k = (d + 18) | 0;
    i = (d + 64) | 0;
    g = (d + 52) | 0;
    l = (d + 8) | 0;
    m = (d + 80) | 0;
    n = (d + 76) | 0;
    o = (d + 72) | 0;
    p = (d + 1216) | 0;
    q = (d + 1200) | 0;
    r = (d + 48) | 0;
    s = (d + 32) | 0;
    d = b[k >> 1] | 0;
    do {
      t = b[j >> 1] | 0;
      u = b8[c[i >> 2] & 255](c[g >> 2] | 0, e[l >> 1] | 0) | 0;
      v = c[m >> 2] & (((t & 65535) << 4) + (d & 65535));
      t = (v + 1) | 0;
      if (t >>> 0 < (c[n >> 2] | 0) >>> 0) {
        a[((c[o >> 2] | 0) + v) | 0] = u & 255;
        a[((c[o >> 2] | 0) + t) | 0] = ((u & 65535) >>> 8) & 255;
      } else {
        b5[c[r >> 2] & 255](c[s >> 2] | 0, v, u);
      }
      d = ((b[k >> 1] | 0) + f) & 65535;
      b[k >> 1] = d;
      u = ((b[h >> 1] | 0) - 1) & 65535;
      b[h >> 1] = u;
      v = zW(c[p >> 2] | 0, c[(p + 4) >> 2] | 0, 1, 0) | 0;
      c[p >> 2] = v;
      c[(p + 4) >> 2] = G;
      c[q >> 2] = (c[q >> 2] | 0) + 8;
    } while ((u << 16) >> 16 != 0);
    return 1;
  }
  function hw(d) {
    d = d | 0;
    var f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      x = 0;
    f = c[(d + 144) >> 2] | 0;
    g = b[(((f & 2) | 0) == 0 ? (d + 26) | 0 : (d + 148) | 0) >> 1] | 0;
    h = (((((e[(d + 30) >> 1] | 0) >>> 9) & 2) ^ 2) - 1) & 65535;
    if (((f & 12) | 0) == 0) {
      f = c[(d + 60) >> 2] | 0;
      i = c[(d + 52) >> 2] | 0;
      j = e[(d + 8) >> 1] | 0;
      k = (d + 16) | 0;
      l = ((e[k >> 1] | 0) + ((g & 65535) << 4)) & c[(d + 80) >> 2];
      if (l >>> 0 < (c[(d + 76) >> 2] | 0) >>> 0) {
        m = a[((c[(d + 72) >> 2] | 0) + l) | 0] | 0;
      } else {
        m = b8[c[(d + 36) >> 2] & 255](c[(d + 32) >> 2] | 0, l) | 0;
      }
      b5[f & 255](i, j, m);
      b[k >> 1] = ((b[k >> 1] | 0) + h) & 65535;
      k = (d + 1200) | 0;
      c[k >> 2] = (c[k >> 2] | 0) + 8;
      return 1;
    }
    k = (d + 6) | 0;
    if ((b[k >> 1] | 0) == 0) {
      return 1;
    }
    m = (d + 60) | 0;
    j = (d + 52) | 0;
    i = (d + 8) | 0;
    f = (d + 16) | 0;
    l = (g & 65535) << 4;
    g = (d + 80) | 0;
    n = (d + 76) | 0;
    o = (d + 72) | 0;
    p = (d + 1216) | 0;
    q = (d + 1200) | 0;
    r = (d + 36) | 0;
    s = (d + 32) | 0;
    d = b[f >> 1] | 0;
    do {
      t = c[m >> 2] | 0;
      u = c[j >> 2] | 0;
      v = e[i >> 1] | 0;
      w = ((d & 65535) + l) & c[g >> 2];
      if (w >>> 0 < (c[n >> 2] | 0) >>> 0) {
        x = a[((c[o >> 2] | 0) + w) | 0] | 0;
      } else {
        x = b8[c[r >> 2] & 255](c[s >> 2] | 0, w) | 0;
      }
      b5[t & 255](u, v, x);
      d = ((b[f >> 1] | 0) + h) & 65535;
      b[f >> 1] = d;
      v = ((b[k >> 1] | 0) - 1) & 65535;
      b[k >> 1] = v;
      u = zW(c[p >> 2] | 0, c[(p + 4) >> 2] | 0, 1, 0) | 0;
      c[p >> 2] = u;
      c[(p + 4) >> 2] = G;
      c[q >> 2] = (c[q >> 2] | 0) + 8;
    } while ((v << 16) >> 16 != 0);
    return 1;
  }
  function hx(a) {
    a = a | 0;
    var f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0,
      v = 0,
      w = 0,
      x = 0,
      y = 0,
      z = 0;
    f = c[(a + 144) >> 2] | 0;
    g = b[(((f & 2) | 0) == 0 ? (a + 26) | 0 : (a + 148) | 0) >> 1] | 0;
    h = (((((e[(a + 30) >> 1] | 0) >>> 8) & 4) ^ 4) - 2) & 65535;
    if (((f & 12) | 0) == 0) {
      f = c[(a + 68) >> 2] | 0;
      i = c[(a + 52) >> 2] | 0;
      j = e[(a + 8) >> 1] | 0;
      k = (a + 16) | 0;
      l = ((e[k >> 1] | 0) + ((g & 65535) << 4)) & c[(a + 80) >> 2];
      m = (l + 1) | 0;
      if (m >>> 0 < (c[(a + 76) >> 2] | 0) >>> 0) {
        n = c[(a + 72) >> 2] | 0;
        o = (d[(n + m) | 0] << 8) | d[(n + l) | 0];
      } else {
        o = b8[c[(a + 44) >> 2] & 255](c[(a + 32) >> 2] | 0, l) | 0;
      }
      b5[f & 255](i, j, o);
      b[k >> 1] = ((b[k >> 1] | 0) + h) & 65535;
      k = (a + 1200) | 0;
      c[k >> 2] = (c[k >> 2] | 0) + 8;
      return 1;
    }
    k = (a + 6) | 0;
    if ((b[k >> 1] | 0) == 0) {
      return 1;
    }
    o = (a + 68) | 0;
    j = (a + 52) | 0;
    i = (a + 8) | 0;
    f = (a + 16) | 0;
    l = (g & 65535) << 4;
    g = (a + 80) | 0;
    n = (a + 76) | 0;
    m = (a + 72) | 0;
    p = (a + 1216) | 0;
    q = (a + 1200) | 0;
    r = (a + 44) | 0;
    s = (a + 32) | 0;
    a = b[f >> 1] | 0;
    do {
      t = c[o >> 2] | 0;
      u = c[j >> 2] | 0;
      v = e[i >> 1] | 0;
      w = ((a & 65535) + l) & c[g >> 2];
      x = (w + 1) | 0;
      if (x >>> 0 < (c[n >> 2] | 0) >>> 0) {
        y = c[m >> 2] | 0;
        z = (d[(y + x) | 0] << 8) | d[(y + w) | 0];
      } else {
        z = b8[c[r >> 2] & 255](c[s >> 2] | 0, w) | 0;
      }
      b5[t & 255](u, v, z);
      a = ((b[f >> 1] | 0) + h) & 65535;
      b[f >> 1] = a;
      v = ((b[k >> 1] | 0) - 1) & 65535;
      b[k >> 1] = v;
      u = zW(c[p >> 2] | 0, c[(p + 4) >> 2] | 0, 1, 0) | 0;
      c[p >> 2] = u;
      c[(p + 4) >> 2] = G;
      c[q >> 2] = (c[q >> 2] | 0) + 8;
    } while ((v << 16) >> 16 != 0);
    return 1;
  }
  function hy(f) {
    f = f | 0;
    var g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0;
    g = (f + 129) | 0;
    h = a[g] | 0;
    iD(f, g);
    g = iE(f) | 0;
    i = (f + 1196) | 0;
    j = ((e[i >> 1] | 0) + 1) | 0;
    k = d[(f + 128 + j) | 0] | 0;
    l = ((c[f >> 2] & 2) | 0) == 0 ? k : k & 31;
    if ((l | 0) == 0) {
      m = j;
      return m | 0;
    }
    j = ((h & 255) >>> 3) & 7;
    do {
      if ((j | 0) == 7) {
        h = g & 255;
        k =
          ((((h & 128) | 0) != 0 ? 65280 : 0) | h) >>>
          ((l >>> 0 > 7 ? 7 : (l - 1) | 0) >>> 0);
        h = (f + 30) | 0;
        n = b[h >> 1] | 0;
        b[h >> 1] = ((k & 1) | 0) == 0 ? n & -2 : n | 1;
        n = (k >>> 1) & 255;
        it(f, n);
        b[h >> 1] = b[h >> 1] & -2049;
        o = n;
      } else if ((j | 0) == 2) {
        n = (f + 30) | 0;
        h = b[n >> 1] | 0;
        k = (((h << 8) & 256) | (g & 255)) & 65535;
        p = (l >>> 0) % 9 | 0;
        q = (k << p) | (k >>> (((9 - p) | 0) >>> 0));
        p = ((q & 256) | 0) == 0 ? h & -2 : h | 1;
        b[n >> 1] = p;
        if (((((k << 1) ^ k) & 128) | 0) == 0) {
          b[n >> 1] = p & -2049;
          o = q & 255;
          break;
        } else {
          b[n >> 1] = p | 2048;
          o = q & 255;
          break;
        }
      } else if ((j | 0) == 4) {
        q = g & 255;
        if (l >>> 0 > 8) {
          r = 0;
        } else {
          r = (q << l) & 65535;
        }
        p = r & 255;
        it(f, p);
        n = (f + 30) | 0;
        k = b[n >> 1] | 0;
        h = (r & 256) == 0 ? k & -2 : k | 1;
        b[n >> 1] = h;
        if (((((q << 1) ^ q) & 128) | 0) == 0) {
          b[n >> 1] = h & -2049;
          o = p;
          break;
        } else {
          b[n >> 1] = h | 2048;
          o = p;
          break;
        }
      } else if ((j | 0) == 3) {
        p = (f + 30) | 0;
        h = b[p >> 1] | 0;
        n = (((h << 8) & 256) | (g & 255)) & 65535;
        q = (l >>> 0) % 9 | 0;
        k = (n >>> (q >>> 0)) | (n << (9 - q));
        q = ((k & 256) | 0) == 0 ? h & -2 : h | 1;
        b[p >> 1] = q;
        if (((((k << 1) ^ n) & 128) | 0) == 0) {
          b[p >> 1] = q & -2049;
          o = k & 255;
          break;
        } else {
          b[p >> 1] = q | 2048;
          o = k & 255;
          break;
        }
      } else if ((j | 0) == 5) {
        if (l >>> 0 > 8) {
          s = 0;
        } else {
          s = ((g & 255) >>> (((l - 1) | 0) >>> 0)) & 65535;
        }
        k = (f + 30) | 0;
        q = b[k >> 1] | 0;
        b[k >> 1] = ((s & 1) | 0) == 0 ? q & -2 : q | 1;
        q = (s >>> 1) & 255;
        it(f, q);
        p = b[k >> 1] | 0;
        if ((g << 24) >> 24 < 0) {
          b[k >> 1] = p | 2048;
          o = q;
          break;
        } else {
          b[k >> 1] = p & -2049;
          o = q;
          break;
        }
      } else if ((j | 0) == 0) {
        q = g & 255;
        p = l & 7;
        k = (q >>> (((8 - p) | 0) >>> 0)) | (q << p);
        p = (f + 30) | 0;
        n = b[p >> 1] | 0;
        h = ((k & 1) | 0) == 0 ? n & -2 : n | 1;
        b[p >> 1] = h;
        if (((((q << 1) ^ q) & 128) | 0) == 0) {
          b[p >> 1] = h & -2049;
          o = k & 255;
          break;
        } else {
          b[p >> 1] = h | 2048;
          o = k & 255;
          break;
        }
      } else if ((j | 0) == 1) {
        k = g & 255;
        h = l & 7;
        p = (k << (8 - h)) | (k >>> (h >>> 0));
        h = (f + 30) | 0;
        q = b[h >> 1] | 0;
        n = ((p & 128) | 0) == 0 ? q & -2 : q | 1;
        b[h >> 1] = n;
        if (((((p << 1) ^ k) & 128) | 0) == 0) {
          b[h >> 1] = n & -2049;
          o = p & 255;
          break;
        } else {
          b[h >> 1] = n | 2048;
          o = p & 255;
          break;
        }
      } else {
        o = 0;
      }
    } while (0);
    iG(f, o);
    o = (f + 1200) | 0;
    c[o >> 2] = (c[o >> 2] | 0) + l + ((c[(f + 1184) >> 2] | 0) != 0 ? 17 : 5);
    m = ((e[i >> 1] | 0) + 2) | 0;
    return m | 0;
  }
  function hz(a, b) {
    a = a | 0;
    b = b | 0;
    return -86 | 0;
  }
  function hA(a, b) {
    a = a | 0;
    b = b | 0;
    return -21846 | 0;
  }
  function hB(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    return;
  }
  function hC(a, b, c) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    return;
  }
  function hD(a) {
    a = a | 0;
    var b = 0;
    c[a >> 2] = 1;
    b = 0;
    do {
      c[(a + 160 + (b << 2)) >> 2] = c[(13224 + (b << 2)) >> 2];
      b = (b + 1) | 0;
    } while (b >>> 0 < 256);
    c[(a + 116) >> 2] = 6;
    c[(a + 120) >> 2] = 6;
    c[(a + 124) >> 2] = 0;
    return;
  }
  function hE(a, b) {
    a = a | 0;
    b = b | 0;
    var d = 0;
    d = b >>> 0 > 16 ? 16 : b;
    c[(a + 116) >> 2] = d;
    c[(a + 120) >> 2] = d >>> 0 < 6 ? 6 : d;
    c[(a + 124) >> 2] = 0;
    return;
  }
  function hF(a) {
    a = a | 0;
    var b = 0,
      d = 0;
    b = a | 0;
    c[b >> 2] = 1;
    d = 0;
    do {
      c[(a + 160 + (d << 2)) >> 2] = c[(13224 + (d << 2)) >> 2];
      d = (d + 1) | 0;
    } while (d >>> 0 < 256);
    c[b >> 2] = c[b >> 2] | 64;
    c[(a + 116) >> 2] = 4;
    c[(a + 120) >> 2] = 6;
    c[(a + 124) >> 2] = 0;
    return;
  }
  function hG(a) {
    a = a | 0;
    var b = 0,
      d = 0;
    b = a | 0;
    c[b >> 2] = 1;
    d = 0;
    do {
      c[(a + 160 + (d << 2)) >> 2] = c[(13224 + (d << 2)) >> 2];
      d = (d + 1) | 0;
    } while (d >>> 0 < 256);
    c[(a + 116) >> 2] = 6;
    c[(a + 120) >> 2] = 6;
    c[(a + 124) >> 2] = 0;
    c[b >> 2] = c[b >> 2] & -4;
    return;
  }
  function hH(a) {
    a = a | 0;
    var b = 0,
      d = 0;
    b = a | 0;
    c[b >> 2] = 1;
    d = 0;
    do {
      c[(a + 160 + (d << 2)) >> 2] = c[(13224 + (d << 2)) >> 2];
      d = (d + 1) | 0;
    } while (d >>> 0 < 256);
    d = c[b >> 2] | 0;
    c[(a + 116) >> 2] = 4;
    c[(a + 120) >> 2] = 6;
    c[(a + 124) >> 2] = 0;
    c[b >> 2] = (d & -68) | 64;
    return;
  }
  function hI(a, b) {
    a = a | 0;
    b = b | 0;
    c[(a + 80) >> 2] = b;
    return;
  }
  function hJ(a) {
    a = a | 0;
    return c[(a + 80) >> 2] | 0;
  }
  function hK(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    c[(a + 84) >> 2] = b;
    c[(a + 88) >> 2] = d;
    return;
  }
  function hL(a, b, d) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    c[(a + 72) >> 2] = b;
    c[(a + 76) >> 2] = d;
    return;
  }
  function hM(a, b, d, e, f, g) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    c[(a + 32) >> 2] = b;
    c[(a + 36) >> 2] = d;
    c[(a + 40) >> 2] = e;
    c[(a + 44) >> 2] = f;
    c[(a + 48) >> 2] = g;
    return;
  }
  function hN(a, b, d, e, f, g) {
    a = a | 0;
    b = b | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    g = g | 0;
    c[(a + 52) >> 2] = b;
    c[(a + 56) >> 2] = d;
    c[(a + 60) >> 2] = e;
    c[(a + 64) >> 2] = f;
    c[(a + 68) >> 2] = g;
    return;
  }
  function hO(f) {
    f = f | 0;
    var g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0;
    g = (f + 129) | 0;
    h = a[g] | 0;
    iD(f, g);
    g = (iF(f) | 0) & 65535;
    i = (f + 1196) | 0;
    j = ((e[i >> 1] | 0) + 1) | 0;
    k = d[(f + 128 + j) | 0] | 0;
    l = ((c[f >> 2] & 2) | 0) == 0 ? k : k & 31;
    if ((l | 0) == 0) {
      m = j;
      return m | 0;
    }
    j = ((h & 255) >>> 3) & 7;
    do {
      if ((j | 0) == 4) {
        h = l >>> 0 > 16 ? 0 : g << l;
        k = h & 65535;
        iu(f, k);
        n = (f + 30) | 0;
        o = b[n >> 1] | 0;
        p = ((h & 65536) | 0) == 0 ? o & -2 : o | 1;
        b[n >> 1] = p;
        if (((((g << 1) ^ g) & 32768) | 0) == 0) {
          b[n >> 1] = p & -2049;
          q = k;
          break;
        } else {
          b[n >> 1] = p | 2048;
          q = k;
          break;
        }
      } else if ((j | 0) == 0) {
        k = l & 15;
        p = (g >>> (((16 - k) | 0) >>> 0)) | (g << k);
        k = (f + 30) | 0;
        n = b[k >> 1] | 0;
        o = ((p & 1) | 0) == 0 ? n & -2 : n | 1;
        b[k >> 1] = o;
        if (((((g << 1) ^ g) & 32768) | 0) == 0) {
          b[k >> 1] = o & -2049;
          q = p & 65535;
          break;
        } else {
          b[k >> 1] = o | 2048;
          q = p & 65535;
          break;
        }
      } else if ((j | 0) == 1) {
        p = l & 15;
        o = (g << (16 - p)) | (g >>> (p >>> 0));
        p = (f + 30) | 0;
        k = b[p >> 1] | 0;
        n = ((o & 32768) | 0) == 0 ? k & -2 : k | 1;
        b[p >> 1] = n;
        if (((((o << 1) ^ g) & 32768) | 0) == 0) {
          b[p >> 1] = n & -2049;
          q = o & 65535;
          break;
        } else {
          b[p >> 1] = n | 2048;
          q = o & 65535;
          break;
        }
      } else if ((j | 0) == 5) {
        if (l >>> 0 > 16) {
          r = 0;
        } else {
          r = g >>> (((l - 1) | 0) >>> 0);
        }
        o = (f + 30) | 0;
        n = b[o >> 1] | 0;
        b[o >> 1] = ((r & 1) | 0) == 0 ? n & -2 : n | 1;
        n = (r >>> 1) & 65535;
        iu(f, n);
        p = b[o >> 1] | 0;
        if (((g & 32768) | 0) == 0) {
          b[o >> 1] = p & -2049;
          q = n;
          break;
        } else {
          b[o >> 1] = p | 2048;
          q = n;
          break;
        }
      } else if ((j | 0) == 2) {
        n = (f + 30) | 0;
        p = b[n >> 1] | 0;
        o = (((p & 65535) << 16) & 65536) | g;
        k = (l >>> 0) % 17 | 0;
        h = (o << k) | (o >>> (((17 - k) | 0) >>> 0));
        k = ((h & 65536) | 0) == 0 ? p & -2 : p | 1;
        b[n >> 1] = k;
        if (((((g << 1) ^ g) & 32768) | 0) == 0) {
          b[n >> 1] = k & -2049;
          q = h & 65535;
          break;
        } else {
          b[n >> 1] = k | 2048;
          q = h & 65535;
          break;
        }
      } else if ((j | 0) == 3) {
        h = (f + 30) | 0;
        k = b[h >> 1] | 0;
        n = (((k & 65535) << 16) & 65536) | g;
        p = (l >>> 0) % 17 | 0;
        o = (n >>> (p >>> 0)) | (n << (17 - p));
        p = ((o & 65536) | 0) == 0 ? k & -2 : k | 1;
        b[h >> 1] = p;
        if (((((o << 1) ^ g) & 32768) | 0) == 0) {
          b[h >> 1] = p & -2049;
          q = o & 65535;
          break;
        } else {
          b[h >> 1] = p | 2048;
          q = o & 65535;
          break;
        }
      } else if ((j | 0) == 7) {
        o =
          ((((g & 32768) | 0) != 0 ? -65536 : 0) | g) >>>
          ((l >>> 0 > 15 ? 15 : (l - 1) | 0) >>> 0);
        p = (f + 30) | 0;
        h = b[p >> 1] | 0;
        b[p >> 1] = ((o & 1) | 0) == 0 ? h & -2 : h | 1;
        h = (o >>> 1) & 65535;
        iu(f, h);
        b[p >> 1] = b[p >> 1] & -2049;
        q = h;
      } else {
        q = 0;
      }
    } while (0);
    iH(f, q);
    q = (f + 1200) | 0;
    c[q >> 2] = (c[q >> 2] | 0) + l + ((c[(f + 1184) >> 2] | 0) != 0 ? 17 : 5);
    m = ((e[i >> 1] | 0) + 2) | 0;
    return m | 0;
  }
  function hP(e) {
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0,
      u = 0;
    f = (e + 14) | 0;
    iK(e, b[f >> 1] | 0);
    g = (e + 12) | 0;
    h = b[g >> 1] | 0;
    i = a[(e + 131) | 0] & 31;
    j = i & 255;
    if ((i << 24) >> 24 != 0) {
      if ((i & 255) > 1) {
        i = (h & 65535) << 4;
        k = (e + 80) | 0;
        l = (e + 76) | 0;
        m = (e + 72) | 0;
        n = (e + 44) | 0;
        o = (e + 32) | 0;
        p = 1;
        q = b[f >> 1] | 0;
        do {
          q = (q - 2) & 65535;
          r = c[k >> 2] & ((q & 65535) + i);
          s = (r + 1) | 0;
          if (s >>> 0 < (c[l >> 2] | 0) >>> 0) {
            t = c[m >> 2] | 0;
            u = ((d[(t + s) | 0] | 0) << 8) | (d[(t + r) | 0] | 0);
          } else {
            u = b8[c[n >> 2] & 255](c[o >> 2] | 0, r) | 0;
          }
          iK(e, u);
          p = (p + 1) | 0;
        } while (p >>> 0 < j >>> 0);
      }
      iK(e, h);
    }
    b[f >> 1] = h;
    b[g >> 1] =
      (h - (((d[(e + 130) | 0] | 0) << 8) | (d[(e + 129) | 0] | 0))) & 65535;
    if ((j | 0) == 1) {
      h = (e + 1200) | 0;
      c[h >> 2] = (c[h >> 2] | 0) + 25;
      return 4;
    } else if ((j | 0) == 0) {
      h = (e + 1200) | 0;
      c[h >> 2] = (c[h >> 2] | 0) + 15;
      return 4;
    } else {
      h = (e + 1200) | 0;
      c[h >> 2] = (c[h >> 2] | 0) + ((j << 4) | 6);
      return 4;
    }
    return 0;
  }
  function hQ(a) {
    a = a | 0;
    var d = 0;
    d = (a + 14) | 0;
    b[(a + 12) >> 1] = b[d >> 1] | 0;
    b[d >> 1] = iL(a) | 0;
    d = (a + 1200) | 0;
    c[d >> 2] = (c[d >> 2] | 0) + 8;
    return 1;
  }
  function hR(a) {
    a = a | 0;
    var b = 0,
      d = 0;
    hD(a);
    b = a | 0;
    d = c[b >> 2] & -76;
    c[(a + 544) >> 2] = 408;
    c[(a + 548) >> 2] = 190;
    c[(a + 552) >> 2] = 194;
    c[(a + 576) >> 2] = 196;
    c[(a + 580) >> 2] = 450;
    c[(a + 584) >> 2] = 170;
    c[(a + 588) >> 2] = 174;
    c[(a + 592) >> 2] = 172;
    c[(a + 596) >> 2] = 166;
    c[(a + 600) >> 2] = 164;
    c[(a + 604) >> 2] = 168;
    c[(a + 928) >> 2] = 352;
    c[(a + 932) >> 2] = 354;
    c[(a + 960) >> 2] = 336;
    c[(a + 964) >> 2] = 448;
    c[b >> 2] = d | 74;
    hE(a, 4);
    return;
  }
  function hS(a) {
    a = a | 0;
    var b = 0;
    hm(a);
    b = a | 0;
    c[b >> 2] = c[b >> 2] | 40;
    c[(a + 220) >> 2] = 478;
    return;
  }
  function hT(b) {
    b = b | 0;
    var f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0;
    if ((a[(b + 129) | 0] | 0) != 1) {
      f = ie(b) | 0;
      return f | 0;
    }
    g = (b + 130) | 0;
    h = ((d[g] | 0) >>> 3) & 7;
    if ((h | 0) == 4) {
      iD(b, g);
      iH(b, 0);
      i = (b + 1200) | 0;
      c[i >> 2] = ((c[(b + 1184) >> 2] | 0) != 0 ? 3 : 2) + (c[i >> 2] | 0);
      f = ((e[(b + 1196) >> 1] | 0) + 2) | 0;
      return f | 0;
    } else if ((h | 0) == 0) {
      iD(b, g);
      if ((c[(b + 1184) >> 2] | 0) == 0) {
        f = ie(b) | 0;
        return f | 0;
      } else {
        iH(b, 0);
        i = (b + 1200) | 0;
        c[i >> 2] = (c[i >> 2] | 0) + 11;
        f = ((e[(b + 1196) >> 1] | 0) + 2) | 0;
        return f | 0;
      }
    } else if ((h | 0) == 6) {
      iD(b, g);
      i = ((iF(b) | 0) & 4) == 0;
      j = b | 0;
      k = c[j >> 2] | 0;
      c[j >> 2] = i ? k & -17 : k | 16;
      k = (b + 1200) | 0;
      c[k >> 2] = ((c[(b + 1184) >> 2] | 0) != 0 ? 6 : 3) + (c[k >> 2] | 0);
      f = ((e[(b + 1196) >> 1] | 0) + 2) | 0;
      return f | 0;
    } else if ((h | 0) == 1) {
      iD(b, g);
      if ((c[(b + 1184) >> 2] | 0) == 0) {
        f = ie(b) | 0;
        return f | 0;
      } else {
        iH(b, 0);
        g = (b + 1200) | 0;
        c[g >> 2] = (c[g >> 2] | 0) + 11;
        f = ((e[(b + 1196) >> 1] | 0) + 2) | 0;
        return f | 0;
      }
    } else {
      f = ie(b) | 0;
      return f | 0;
    }
    return 0;
  }
  function hU() {
    var b = 0,
      d = 0,
      e = 0,
      f = 0;
    b = zH(1224) | 0;
    if ((b | 0) == 0) {
      d = 0;
      return d | 0;
    }
    e = b;
    c[b >> 2] = 1;
    c[(b + 32) >> 2] = 0;
    c[(b + 36) >> 2] = 114;
    c[(b + 44) >> 2] = 104;
    c[(b + 40) >> 2] = 52;
    c[(b + 48) >> 2] = 58;
    c[(b + 52) >> 2] = 0;
    c[(b + 56) >> 2] = 114;
    c[(b + 64) >> 2] = 104;
    c[(b + 60) >> 2] = 52;
    c[(b + 68) >> 2] = 58;
    c[(b + 72) >> 2] = 0;
    c[(b + 76) >> 2] = 0;
    c[(b + 80) >> 2] = 1048575;
    zP((b + 84) | 0, 0, 28);
    c[(b + 116) >> 2] = 4;
    c[(b + 120) >> 2] = 6;
    a[(b + 156) | 0] = 0;
    c[(b + 152) >> 2] = 0;
    f = (b + 160) | 0;
    zO(f | 0, 13224, 1024) | 0;
    c[(b + 1200) >> 2] = 0;
    zP((b + 1208) | 0, 0, 16);
    d = e;
    return d | 0;
  }
  function hV(b, d, f) {
    b = b | 0;
    d = d | 0;
    f = f | 0;
    var g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0;
    g = (a[d] | 0) == 37 ? (d + 1) | 0 : d;
    d = 0;
    while (1) {
      if (d >>> 0 >= 8) {
        h = 0;
        i = 2900;
        break;
      }
      if ((aP(g | 0, c[(14496 + (d << 2)) >> 2] | 0) | 0) == 0) {
        i = 2897;
        break;
      }
      if ((aP(g | 0, c[(14464 + (d << 2)) >> 2] | 0) | 0) == 0) {
        i = 2899;
        break;
      } else {
        d = (d + 1) | 0;
      }
    }
    if ((i | 0) == 2897) {
      c[f >> 2] = e[(b + 4 + ((d & 7) << 1)) >> 1] | 0;
      j = 0;
      return j | 0;
    } else if ((i | 0) == 2899) {
      k = e[(b + 4 + ((d & 3) << 1)) >> 1] | 0;
      c[f >> 2] = (((d & 4) | 0) != 0 ? k >>> 8 : k) & 255;
      j = 0;
      return j | 0;
    } else if ((i | 0) == 2900) {
      while (1) {
        i = 0;
        if (h >>> 0 >= 4) {
          break;
        }
        if ((aP(g | 0, c[(472 + (h << 2)) >> 2] | 0) | 0) == 0) {
          i = 2902;
          break;
        } else {
          h = (h + 1) | 0;
          i = 2900;
        }
      }
      if ((i | 0) == 2902) {
        c[f >> 2] = e[(b + 20 + ((h & 3) << 1)) >> 1] | 0;
        j = 0;
        return j | 0;
      }
      if ((aP(g | 0, 25192) | 0) == 0) {
        c[f >> 2] = e[(b + 28) >> 1] | 0;
        j = 0;
        return j | 0;
      }
      if ((aP(g | 0, 34592) | 0) != 0) {
        j = 1;
        return j | 0;
      }
      c[f >> 2] = e[(b + 30) >> 1] | 0;
      j = 0;
      return j | 0;
    }
    return 0;
  }
  function hW(b, c) {
    b = b | 0;
    c = c | 0;
    a[(b + 156) | 0] = ((c << 24) >> 24 != 0) | 0;
    return;
  }
  function hX(a) {
    a = a | 0;
    var b = 0;
    b = (a + 1216) | 0;
    return ((G = c[(b + 4) >> 2] | 0), c[b >> 2] | 0) | 0;
  }
  function hY(a) {
    a = a | 0;
    var d = 0;
    c[(a + 1184) >> 2] = 1;
    b[(a + 1192) >> 1] = b[(a + 26) >> 1] | 0;
    b[(a + 1194) >> 1] =
      ((b[(a + 16) >> 1] | 0) + (b[(a + 10) >> 1] | 0)) & 65535;
    b[(a + 1196) >> 1] = 1;
    d = (a + 1200) | 0;
    c[d >> 2] = (c[d >> 2] | 0) + 7;
    return;
  }
  function hZ(a) {
    a = a | 0;
    var d = 0;
    c[(a + 1184) >> 2] = 1;
    b[(a + 1192) >> 1] = b[(a + 26) >> 1] | 0;
    b[(a + 1194) >> 1] =
      ((b[(a + 18) >> 1] | 0) + (b[(a + 10) >> 1] | 0)) & 65535;
    b[(a + 1196) >> 1] = 1;
    d = (a + 1200) | 0;
    c[d >> 2] = (c[d >> 2] | 0) + 8;
    return;
  }
  function h_(a) {
    a = a | 0;
    var d = 0;
    c[(a + 1184) >> 2] = 1;
    b[(a + 1192) >> 1] = b[(a + 24) >> 1] | 0;
    b[(a + 1194) >> 1] =
      ((b[(a + 16) >> 1] | 0) + (b[(a + 14) >> 1] | 0)) & 65535;
    b[(a + 1196) >> 1] = 1;
    d = (a + 1200) | 0;
    c[d >> 2] = (c[d >> 2] | 0) + 8;
    return;
  }
  function h$(a) {
    a = a | 0;
    var d = 0;
    c[(a + 1184) >> 2] = 1;
    b[(a + 1192) >> 1] = b[(a + 24) >> 1] | 0;
    b[(a + 1194) >> 1] =
      ((b[(a + 18) >> 1] | 0) + (b[(a + 14) >> 1] | 0)) & 65535;
    b[(a + 1196) >> 1] = 1;
    d = (a + 1200) | 0;
    c[d >> 2] = (c[d >> 2] | 0) + 7;
    return;
  }
  function h0(a) {
    a = a | 0;
    var d = 0;
    c[(a + 1184) >> 2] = 1;
    b[(a + 1192) >> 1] = b[(a + 26) >> 1] | 0;
    b[(a + 1194) >> 1] = b[(a + 16) >> 1] | 0;
    b[(a + 1196) >> 1] = 1;
    d = (a + 1200) | 0;
    c[d >> 2] = (c[d >> 2] | 0) + 5;
    return;
  }
  function h1(a) {
    a = a | 0;
    var d = 0;
    c[(a + 1184) >> 2] = 1;
    b[(a + 1192) >> 1] = b[(a + 26) >> 1] | 0;
    b[(a + 1194) >> 1] = b[(a + 18) >> 1] | 0;
    b[(a + 1196) >> 1] = 1;
    d = (a + 1200) | 0;
    c[d >> 2] = (c[d >> 2] | 0) + 5;
    return;
  }
  function h2(a) {
    a = a | 0;
    var e = 0;
    c[(a + 1184) >> 2] = 1;
    b[(a + 1192) >> 1] = b[(a + 26) >> 1] | 0;
    e = c[(a + 1188) >> 2] | 0;
    b[(a + 1194) >> 1] = ((d[(e + 2) | 0] | 0) << 8) | (d[(e + 1) | 0] | 0);
    b[(a + 1196) >> 1] = 3;
    e = (a + 1200) | 0;
    c[e >> 2] = (c[e >> 2] | 0) + 6;
    return;
  }
  function h3(a) {
    a = a | 0;
    var d = 0;
    c[(a + 1184) >> 2] = 1;
    b[(a + 1192) >> 1] = b[(a + 26) >> 1] | 0;
    b[(a + 1194) >> 1] = b[(a + 10) >> 1] | 0;
    b[(a + 1196) >> 1] = 1;
    d = (a + 1200) | 0;
    c[d >> 2] = (c[d >> 2] | 0) + 5;
    return;
  }
  function h4(a) {
    a = a | 0;
    var f = 0;
    c[(a + 1184) >> 2] = 1;
    b[(a + 1192) >> 1] = b[(a + 26) >> 1] | 0;
    f = d[((c[(a + 1188) >> 2] | 0) + 1) | 0] | 0;
    b[(a + 1194) >> 1] =
      ((e[(a + 16) >> 1] | 0) +
        (e[(a + 10) >> 1] | 0) +
        (((f & 128) | 0) != 0 ? f | 65280 : f)) &
      65535;
    b[(a + 1196) >> 1] = 2;
    f = (a + 1200) | 0;
    c[f >> 2] = (c[f >> 2] | 0) + 11;
    return;
  }
  function h5(a) {
    a = a | 0;
    var f = 0;
    c[(a + 1184) >> 2] = 1;
    b[(a + 1192) >> 1] = b[(a + 26) >> 1] | 0;
    f = d[((c[(a + 1188) >> 2] | 0) + 1) | 0] | 0;
    b[(a + 1194) >> 1] =
      ((e[(a + 18) >> 1] | 0) +
        (e[(a + 10) >> 1] | 0) +
        (((f & 128) | 0) != 0 ? f | 65280 : f)) &
      65535;
    b[(a + 1196) >> 1] = 2;
    f = (a + 1200) | 0;
    c[f >> 2] = (c[f >> 2] | 0) + 12;
    return;
  }
  function h6(a) {
    a = a | 0;
    var f = 0;
    c[(a + 1184) >> 2] = 1;
    b[(a + 1192) >> 1] = b[(a + 24) >> 1] | 0;
    f = d[((c[(a + 1188) >> 2] | 0) + 1) | 0] | 0;
    b[(a + 1194) >> 1] =
      ((e[(a + 16) >> 1] | 0) +
        (e[(a + 14) >> 1] | 0) +
        (((f & 128) | 0) != 0 ? f | 65280 : f)) &
      65535;
    b[(a + 1196) >> 1] = 2;
    f = (a + 1200) | 0;
    c[f >> 2] = (c[f >> 2] | 0) + 12;
    return;
  }
  function h7(a) {
    a = a | 0;
    var f = 0;
    c[(a + 1184) >> 2] = 1;
    b[(a + 1192) >> 1] = b[(a + 24) >> 1] | 0;
    f = d[((c[(a + 1188) >> 2] | 0) + 1) | 0] | 0;
    b[(a + 1194) >> 1] =
      ((e[(a + 18) >> 1] | 0) +
        (e[(a + 14) >> 1] | 0) +
        (((f & 128) | 0) != 0 ? f | 65280 : f)) &
      65535;
    b[(a + 1196) >> 1] = 2;
    f = (a + 1200) | 0;
    c[f >> 2] = (c[f >> 2] | 0) + 11;
    return;
  }
  function h8(a) {
    a = a | 0;
    var f = 0;
    c[(a + 1184) >> 2] = 1;
    b[(a + 1192) >> 1] = b[(a + 26) >> 1] | 0;
    f = d[((c[(a + 1188) >> 2] | 0) + 1) | 0] | 0;
    b[(a + 1194) >> 1] =
      ((((f & 128) | 0) != 0 ? f | 65280 : f) + (e[(a + 16) >> 1] | 0)) & 65535;
    b[(a + 1196) >> 1] = 2;
    f = (a + 1200) | 0;
    c[f >> 2] = (c[f >> 2] | 0) + 9;
    return;
  }
  function h9(a) {
    a = a | 0;
    var f = 0;
    c[(a + 1184) >> 2] = 1;
    b[(a + 1192) >> 1] = b[(a + 26) >> 1] | 0;
    f = d[((c[(a + 1188) >> 2] | 0) + 1) | 0] | 0;
    b[(a + 1194) >> 1] =
      ((((f & 128) | 0) != 0 ? f | 65280 : f) + (e[(a + 18) >> 1] | 0)) & 65535;
    b[(a + 1196) >> 1] = 2;
    f = (a + 1200) | 0;
    c[f >> 2] = (c[f >> 2] | 0) + 9;
    return;
  }
  function ia(a) {
    a = a | 0;
    var f = 0;
    c[(a + 1184) >> 2] = 1;
    b[(a + 1192) >> 1] = b[(a + 24) >> 1] | 0;
    f = d[((c[(a + 1188) >> 2] | 0) + 1) | 0] | 0;
    b[(a + 1194) >> 1] =
      ((((f & 128) | 0) != 0 ? f | 65280 : f) + (e[(a + 14) >> 1] | 0)) & 65535;
    b[(a + 1196) >> 1] = 2;
    f = (a + 1200) | 0;
    c[f >> 2] = (c[f >> 2] | 0) + 9;
    return;
  }
  function ib(a) {
    a = a | 0;
    var f = 0;
    c[(a + 1184) >> 2] = 1;
    b[(a + 1192) >> 1] = b[(a + 26) >> 1] | 0;
    f = d[((c[(a + 1188) >> 2] | 0) + 1) | 0] | 0;
    b[(a + 1194) >> 1] =
      ((((f & 128) | 0) != 0 ? f | 65280 : f) + (e[(a + 10) >> 1] | 0)) & 65535;
    b[(a + 1196) >> 1] = 2;
    f = (a + 1200) | 0;
    c[f >> 2] = (c[f >> 2] | 0) + 9;
    return;
  }
  function ic(d, e, f) {
    d = d | 0;
    e = e | 0;
    f = f | 0;
    var g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0;
    g = (a[e] | 0) == 37 ? (e + 1) | 0 : e;
    e = 0;
    while (1) {
      if (e >>> 0 >= 8) {
        h = 0;
        i = 2941;
        break;
      }
      if ((aP(g | 0, c[(14496 + (e << 2)) >> 2] | 0) | 0) == 0) {
        i = 2935;
        break;
      }
      if ((aP(g | 0, c[(14464 + (e << 2)) >> 2] | 0) | 0) == 0) {
        i = 2937;
        break;
      } else {
        e = (e + 1) | 0;
      }
    }
    if ((i | 0) == 2935) {
      b[(d + 4 + ((e & 7) << 1)) >> 1] = f & 65535;
      j = 0;
      return j | 0;
    } else if ((i | 0) == 2937) {
      k = (d + 4 + ((e & 3) << 1)) | 0;
      l = b[k >> 1] | 0;
      if (((e & 4) | 0) == 0) {
        m = ((l & -256 & 65535) | (f & 255)) & 65535;
      } else {
        m = ((l & 255) | (f << 8)) & 65535;
      }
      b[k >> 1] = m;
      j = 0;
      return j | 0;
    } else if ((i | 0) == 2941) {
      while (1) {
        i = 0;
        if (h >>> 0 >= 4) {
          break;
        }
        if ((aP(g | 0, c[(472 + (h << 2)) >> 2] | 0) | 0) == 0) {
          i = 2943;
          break;
        } else {
          h = (h + 1) | 0;
          i = 2941;
        }
      }
      if ((i | 0) == 2943) {
        b[(d + 20 + ((h & 3) << 1)) >> 1] = f & 65535;
        j = 0;
        return j | 0;
      }
      if ((aP(g | 0, 25192) | 0) == 0) {
        b[(d + 28) >> 1] = f & 65535;
        j = 0;
        return j | 0;
      }
      if ((aP(g | 0, 34592) | 0) != 0) {
        j = 1;
        return j | 0;
      }
      b[(d + 30) >> 1] = f & 65535;
      j = 0;
      return j | 0;
    }
    return 0;
  }
  function id(a, e) {
    a = a | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0,
      t = 0;
    f = c[(a + 108) >> 2] | 0;
    if ((f | 0) != 0) {
      b3[f & 511](c[(a + 92) >> 2] | 0, e & 255);
    }
    f = (a + 144) | 0;
    g = c[f >> 2] | 0;
    if (((g & 32) | 0) == 0) {
      h = b[(a + 28) >> 1] | 0;
    } else {
      i = b[(a + 112) >> 1] | 0;
      if (((c[a >> 2] & 1) | 0) == 0) {
        j = i;
      } else {
        j =
          (i +
            ((((((g >>> 1) & 1) ^ 1) & 65535) | (((g & 12) | 0) == 0)) ^ 1)) &
          65535;
      }
      c[f >> 2] = 0;
      h = j;
    }
    j = (a + 30) | 0;
    iK(a, b[j >> 1] | 0);
    f = (a + 22) | 0;
    iK(a, b[f >> 1] | 0);
    iK(a, h);
    h = (e << 2) & 1020;
    e = (a + 80) | 0;
    g = c[e >> 2] | 0;
    i = g & (h & 65535);
    k = i | 1;
    l = (a + 76) | 0;
    m = c[l >> 2] | 0;
    if (k >>> 0 < m >>> 0) {
      n = c[(a + 72) >> 2] | 0;
      o = ((d[(n + k) | 0] | 0) << 8) | (d[(n + i) | 0] | 0);
      p = g;
      q = m;
    } else {
      m = b8[c[(a + 44) >> 2] & 255](c[(a + 32) >> 2] | 0, i) | 0;
      o = m;
      p = c[e >> 2] | 0;
      q = c[l >> 2] | 0;
    }
    b[(a + 28) >> 1] = o;
    o = p & ((h | 2) & 65535);
    h = o | 1;
    if (h >>> 0 < q >>> 0) {
      q = c[(a + 72) >> 2] | 0;
      r = ((d[(q + h) | 0] | 0) << 8) | (d[(q + o) | 0] | 0);
      b[f >> 1] = r;
      s = b[j >> 1] | 0;
      t = s & -769;
      b[j >> 1] = t;
      mj(a);
      return;
    } else {
      r = b8[c[(a + 44) >> 2] & 255](c[(a + 32) >> 2] | 0, o) | 0;
      b[f >> 1] = r;
      s = b[j >> 1] | 0;
      t = s & -769;
      b[j >> 1] = t;
      mj(a);
      return;
    }
  }
  function ie(b) {
    b = b | 0;
    var d = 0,
      e = 0;
    d = c[(b + 104) >> 2] | 0;
    if ((d | 0) != 0) {
      b5[d & 255](
        c[(b + 92) >> 2] | 0,
        a[(b + 128) | 0] | 0,
        a[(b + 129) | 0] | 0
      );
    }
    if (((c[b >> 2] & 8) | 0) == 0) {
      e = 1;
      return e | 0;
    }
    id(b, 6);
    d = (b + 1200) | 0;
    c[d >> 2] = (c[d >> 2] | 0) + 50;
    e = 0;
    return e | 0;
  }
  function ig(d) {
    d = d | 0;
    var e = 0;
    e = (d + 1216) | 0;
    c[e >> 2] = 0;
    c[(e + 4) >> 2] = 0;
    c[(d + 80) >> 2] = 1048575;
    zP((d + 4) | 0, 0, 24);
    b[(d + 22) >> 1] = -4096;
    b[(d + 28) >> 1] = -16;
    b[(d + 30) >> 1] = 0;
    c[(d + 124) >> 2] = 0;
    a[(d + 156) | 0] = 0;
    c[(d + 152) >> 2] = 0;
    c[(d + 144) >> 2] = 0;
    return;
  }
  function ih(d) {
    d = d | 0;
    var f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0,
      q = 0,
      r = 0,
      s = 0;
    f = (d + 152) | 0;
    if ((c[f >> 2] | 0) != 0) {
      g = (d + 1200) | 0;
      c[g >> 2] = (c[g >> 2] | 0) + 2;
      h = (d + 156) | 0;
      if ((a[h] | 0) == 0) {
        return;
      }
      if ((b[(d + 30) >> 1] & 512) == 0) {
        return;
      }
      a[h] = 0;
      c[f >> 2] = 0;
      h = c[(d + 88) >> 2] | 0;
      if ((h | 0) == 0) {
        return;
      }
      i = b1[h & 1023](c[(d + 84) >> 2] | 0) | 0;
      c[g >> 2] = (c[g >> 2] | 0) + 61;
      id(d, i & 255);
      return;
    }
    i = (d + 144) | 0;
    if (((c[i >> 2] & 32) | 0) == 0) {
      c[i >> 2] = 0;
      g = (d + 28) | 0;
      b[(d + 112) >> 1] = b[g >> 1] | 0;
      j = g;
    } else {
      j = (d + 28) | 0;
    }
    g = (d + 30) | 0;
    h = b[g >> 1] | 0;
    k = (d + 156) | 0;
    l = a[k] | 0;
    m = (d + 157) | 0;
    a[m] = 1;
    n = (d + 100) | 0;
    o = (d + 128) | 0;
    p = (d + 1200) | 0;
    q = (d + 92) | 0;
    r = (d + 129) | 0;
    do {
      mH(d);
      c[i >> 2] = c[i >> 2] & -2;
      s = c[n >> 2] | 0;
      if ((s | 0) != 0) {
        b5[s & 255](c[q >> 2] | 0, a[o] | 0, a[r] | 0);
      }
      s = b1[c[(d + 160 + ((a[o] & 255) << 2)) >> 2] & 1023](d) | 0;
      if ((s | 0) == 0) {
        c[p >> 2] = (c[p >> 2] | 0) + 10;
      } else {
        b[j >> 1] = ((e[j >> 1] | 0) + s) & 65535;
        mk(d, s);
      }
    } while (((c[i >> 2] & 1) | 0) != 0);
    i = (d + 1216) | 0;
    j = zW(c[i >> 2] | 0, c[(i + 4) >> 2] | 0, 1, 0) | 0;
    c[i >> 2] = j;
    c[(i + 4) >> 2] = G;
    if ((a[m] | 0) == 0) {
      return;
    }
    m = b[g >> 1] | 0;
    if (((h & 256 & m) << 16) >> 16 != 0) {
      id(d, 1);
      return;
    }
    if ((l << 24) >> 24 == 0) {
      return;
    }
    if ((a[k] | 0) == 0) {
      return;
    }
    if ((m & 512) == 0) {
      return;
    }
    a[k] = 0;
    c[f >> 2] = 0;
    f = c[(d + 88) >> 2] | 0;
    if ((f | 0) == 0) {
      return;
    }
    k = b1[f & 1023](c[(d + 84) >> 2] | 0) | 0;
    c[p >> 2] = (c[p >> 2] | 0) + 61;
    id(d, k & 255);
    return;
  }
  function ii(a, b) {
    a = a | 0;
    b = b | 0;
    var d = 0,
      e = 0,
      f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0;
    d = (a + 1200) | 0;
    e = c[d >> 2] | 0;
    f = (a + 1208) | 0;
    if (e >>> 0 > b >>> 0) {
      g = b;
      h = e;
    } else {
      i = b;
      b = e;
      while (1) {
        e = (i - b) | 0;
        j = zW(c[f >> 2] | 0, c[(f + 4) >> 2] | 0, b, 0) | 0;
        c[f >> 2] = j;
        c[(f + 4) >> 2] = G;
        c[d >> 2] = 0;
        ih(a);
        j = c[d >> 2] | 0;
        if (e >>> 0 < j >>> 0) {
          g = e;
          h = j;
          break;
        } else {
          i = e;
          b = j;
        }
      }
    }
    c[d >> 2] = h - g;
    h = zW(c[f >> 2] | 0, c[(f + 4) >> 2] | 0, g, 0) | 0;
    c[f >> 2] = h;
    c[(f + 4) >> 2] = G;
    return;
  }
  function ij(a) {
    a = a | 0;
    var e = 0,
      f = 0,
      g = 0;
    c[(a + 1184) >> 2] = 1;
    b[(a + 1192) >> 1] = b[(a + 26) >> 1] | 0;
    e = ((b[(a + 16) >> 1] | 0) + (b[(a + 10) >> 1] | 0)) & 65535;
    f = (a + 1194) | 0;
    b[f >> 1] = e;
    g = c[(a + 1188) >> 2] | 0;
    b[f >> 1] =
      ((((d[(g + 2) | 0] | 0) << 8) | (d[(g + 1) | 0] | 0)) + e) & 65535;
    b[(a + 1196) >> 1] = 3;
    e = (a + 1200) | 0;
    c[e >> 2] = (c[e >> 2] | 0) + 11;
    return;
  }
  function ik(a) {
    a = a | 0;
    var e = 0,
      f = 0,
      g = 0;
    c[(a + 1184) >> 2] = 1;
    b[(a + 1192) >> 1] = b[(a + 26) >> 1] | 0;
    e = ((b[(a + 18) >> 1] | 0) + (b[(a + 10) >> 1] | 0)) & 65535;
    f = (a + 1194) | 0;
    b[f >> 1] = e;
    g = c[(a + 1188) >> 2] | 0;
    b[f >> 1] =
      ((((d[(g + 2) | 0] | 0) << 8) | (d[(g + 1) | 0] | 0)) + e) & 65535;
    b[(a + 1196) >> 1] = 3;
    e = (a + 1200) | 0;
    c[e >> 2] = (c[e >> 2] | 0) + 12;
    return;
  }
  function il(a) {
    a = a | 0;
    var e = 0,
      f = 0,
      g = 0;
    c[(a + 1184) >> 2] = 1;
    b[(a + 1192) >> 1] = b[(a + 24) >> 1] | 0;
    e = ((b[(a + 16) >> 1] | 0) + (b[(a + 14) >> 1] | 0)) & 65535;
    f = (a + 1194) | 0;
    b[f >> 1] = e;
    g = c[(a + 1188) >> 2] | 0;
    b[f >> 1] =
      ((((d[(g + 2) | 0] | 0) << 8) | (d[(g + 1) | 0] | 0)) + e) & 65535;
    b[(a + 1196) >> 1] = 3;
    e = (a + 1200) | 0;
    c[e >> 2] = (c[e >> 2] | 0) + 12;
    return;
  }
  function im(a) {
    a = a | 0;
    var e = 0,
      f = 0,
      g = 0;
    c[(a + 1184) >> 2] = 1;
    b[(a + 1192) >> 1] = b[(a + 24) >> 1] | 0;
    e = ((b[(a + 18) >> 1] | 0) + (b[(a + 14) >> 1] | 0)) & 65535;
    f = (a + 1194) | 0;
    b[f >> 1] = e;
    g = c[(a + 1188) >> 2] | 0;
    b[f >> 1] =
      ((((d[(g + 2) | 0] | 0) << 8) | (d[(g + 1) | 0] | 0)) + e) & 65535;
    b[(a + 1196) >> 1] = 3;
    e = (a + 1200) | 0;
    c[e >> 2] = (c[e >> 2] | 0) + 11;
    return;
  }
  function io(a) {
    a = a | 0;
    var e = 0,
      f = 0,
      g = 0;
    c[(a + 1184) >> 2] = 1;
    b[(a + 1192) >> 1] = b[(a + 26) >> 1] | 0;
    e = b[(a + 16) >> 1] | 0;
    f = (a + 1194) | 0;
    b[f >> 1] = e;
    g = c[(a + 1188) >> 2] | 0;
    b[f >> 1] =
      ((((d[(g + 2) | 0] | 0) << 8) | (d[(g + 1) | 0] | 0)) + e) & 65535;
    b[(a + 1196) >> 1] = 3;
    e = (a + 1200) | 0;
    c[e >> 2] = (c[e >> 2] | 0) + 9;
    return;
  }
  function ip(a) {
    a = a | 0;
    var e = 0,
      f = 0,
      g = 0;
    c[(a + 1184) >> 2] = 1;
    b[(a + 1192) >> 1] = b[(a + 26) >> 1] | 0;
    e = b[(a + 18) >> 1] | 0;
    f = (a + 1194) | 0;
    b[f >> 1] = e;
    g = c[(a + 1188) >> 2] | 0;
    b[f >> 1] =
      ((((d[(g + 2) | 0] | 0) << 8) | (d[(g + 1) | 0] | 0)) + e) & 65535;
    b[(a + 1196) >> 1] = 3;
    e = (a + 1200) | 0;
    c[e >> 2] = (c[e >> 2] | 0) + 9;
    return;
  }
  function iq(a) {
    a = a | 0;
    var e = 0,
      f = 0,
      g = 0;
    c[(a + 1184) >> 2] = 1;
    b[(a + 1192) >> 1] = b[(a + 24) >> 1] | 0;
    e = b[(a + 14) >> 1] | 0;
    f = (a + 1194) | 0;
    b[f >> 1] = e;
    g = c[(a + 1188) >> 2] | 0;
    b[f >> 1] =
      ((((d[(g + 2) | 0] | 0) << 8) | (d[(g + 1) | 0] | 0)) + e) & 65535;
    b[(a + 1196) >> 1] = 3;
    e = (a + 1200) | 0;
    c[e >> 2] = (c[e >> 2] | 0) + 9;
    return;
  }
  function ir(a) {
    a = a | 0;
    var e = 0,
      f = 0,
      g = 0;
    c[(a + 1184) >> 2] = 1;
    b[(a + 1192) >> 1] = b[(a + 26) >> 1] | 0;
    e = b[(a + 10) >> 1] | 0;
    f = (a + 1194) | 0;
    b[f >> 1] = e;
    g = c[(a + 1188) >> 2] | 0;
    b[f >> 1] =
      ((((d[(g + 2) | 0] | 0) << 8) | (d[(g + 1) | 0] | 0)) + e) & 65535;
    b[(a + 1196) >> 1] = 3;
    e = (a + 1200) | 0;
    c[e >> 2] = (c[e >> 2] | 0) + 9;
    return;
  }
  function is(d) {
    d = d | 0;
    c[(d + 1184) >> 2] = 0;
    b[(d + 1192) >> 1] = 0;
    b[(d + 1194) >> 1] = a[c[(d + 1188) >> 2] | 0] & 7;
    b[(d + 1196) >> 1] = 1;
    c[(d + 1200) >> 2] = 0;
    return;
  }
  function it(c, d) {
    c = c | 0;
    d = d | 0;
    var e = 0,
      f = 0;
    e = d & 255;
    if ((d << 24) >> 24 == 0) {
      f = 64;
    } else {
      f = ((e & 128) | 0) == 0 ? 0 : 128;
    }
    d = (c + 30) | 0;
    b[d >> 1] = (b[d >> 1] & -197) | ((a[(872 + e) | 0] | 0) == 0 ? f | 4 : f);
    return;
  }
  function iu(c, d) {
    c = c | 0;
    d = d | 0;
    var e = 0,
      f = 0;
    e = d & 65535;
    if ((d << 16) >> 16 == 0) {
      f = 64;
    } else {
      f = ((e & 32768) | 0) == 0 ? 0 : 128;
    }
    d = (c + 30) | 0;
    b[d >> 1] =
      (b[d >> 1] & -197) | ((a[(872 + (e & 255)) | 0] | 0) == 0 ? f | 4 : f);
    return;
  }
  function iv(c, d) {
    c = c | 0;
    d = d | 0;
    var e = 0,
      f = 0;
    e = d & 255;
    if ((d << 24) >> 24 == 0) {
      f = 64;
    } else {
      f = ((e & 128) | 0) == 0 ? 0 : 128;
    }
    d = (c + 30) | 0;
    b[d >> 1] =
      (((a[(872 + e) | 0] | 0) == 0 ? f | 4 : f) & 196) | (b[d >> 1] & -2246);
    return;
  }
  function iw(c, d) {
    c = c | 0;
    d = d | 0;
    var e = 0,
      f = 0;
    e = d & 65535;
    if ((d << 16) >> 16 == 0) {
      f = 64;
    } else {
      f = ((e & 32768) | 0) == 0 ? 0 : 128;
    }
    d = (c + 30) | 0;
    b[d >> 1] =
      (((a[(872 + (e & 255)) | 0] | 0) == 0 ? f | 4 : f) & 196) |
      (b[d >> 1] & -2246);
    return;
  }
  function ix(c, d, e) {
    c = c | 0;
    d = d | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0;
    f = (e + d) & 255;
    g = f & 255;
    if ((f << 24) >> 24 == 0) {
      h = 64;
    } else {
      h = ((g & 128) | 0) == 0 ? 0 : 128;
    }
    f = (c + 30) | 0;
    c = ((e & 255) + (d & 255)) & 65535;
    i = (((c & 65280) | 0) != 0) | 0;
    j = (((c ^ (e & 255)) & 128 & (c ^ (d & 255))) | 0) == 0 ? i : i | 2048;
    b[f >> 1] =
      (b[f >> 1] & -2262) |
      ((((c ^ ((e ^ d) & 255)) & 16) | 0) == 0 ? j : j | 16) |
      (((a[(872 + g) | 0] | 0) == 0 ? h | 4 : h) & 196);
    return;
  }
  function iy(c, d, e) {
    c = c | 0;
    d = d | 0;
    e = e | 0;
    var f = 0,
      g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0,
      l = 0;
    f = d & 65535;
    g = e & 65535;
    h = (e + d) & 65535;
    i = h & 65535;
    if ((h << 16) >> 16 == 0) {
      j = 64;
    } else {
      j = ((i & 32768) | 0) == 0 ? 0 : 128;
    }
    h = (c + 30) | 0;
    c = (g + f) | 0;
    k = (c >>> 0 > 65535) | 0;
    l = (((c ^ g) & 32768 & (c ^ f)) | 0) == 0 ? k : k | 2048;
    b[h >> 1] =
      (b[h >> 1] & -2262) |
      ((((((e ^ d) & 65535) ^ c) & 16) | 0) == 0 ? l : l | 16) |
      (((a[(872 + (i & 255)) | 0] | 0) == 0 ? j | 4 : j) & 196);
    return;
  }
  function iz(c, d, e, f) {
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    var g = 0,
      h = 0,
      i = 0,
      j = 0;
    g = (((e + d) & 255) + f) & 255;
    h = g & 255;
    if ((g << 24) >> 24 == 0) {
      i = 64;
    } else {
      i = ((h & 128) | 0) == 0 ? 0 : 128;
    }
    g = (c + 30) | 0;
    c = ((((e & 255) + (d & 255)) & 65535) + (f & 255)) & 65535;
    f = (((c & 65280) | 0) != 0) | 0;
    j = (((c ^ (e & 255)) & 128 & (c ^ (d & 255))) | 0) == 0 ? f : f | 2048;
    b[g >> 1] =
      (b[g >> 1] & -2262) |
      ((((c ^ ((e ^ d) & 255)) & 16) | 0) == 0 ? j : j | 16) |
      (((a[(872 + h) | 0] | 0) == 0 ? i | 4 : i) & 196);
    return;
  }
  function iA(c, d, e, f) {
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    var g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0,
      l = 0;
    g = d & 65535;
    h = e & 65535;
    i = (((e + d) & 65535) + f) & 65535;
    j = i & 65535;
    if ((i << 16) >> 16 == 0) {
      k = 64;
    } else {
      k = ((j & 32768) | 0) == 0 ? 0 : 128;
    }
    i = (c + 30) | 0;
    c = (h + g + (f & 65535)) | 0;
    f = (c >>> 0 > 65535) | 0;
    l = (((c ^ h) & 32768 & (c ^ g)) | 0) == 0 ? f : f | 2048;
    b[i >> 1] =
      (b[i >> 1] & -2262) |
      ((((c ^ ((e ^ d) & 65535)) & 16) | 0) == 0 ? l : l | 16) |
      (((a[(872 + (j & 255)) | 0] | 0) == 0 ? k | 4 : k) & 196);
    return;
  }
  function iB(c, d, e, f) {
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    var g = 0,
      h = 0,
      i = 0,
      j = 0;
    g = d & 255;
    h = (g - (e & 255) - (f & 255)) | 0;
    if (((h & 255) << 24) >> 24 == 0) {
      i = 64;
    } else {
      i = ((h & 128) | 0) == 0 ? 0 : 128;
    }
    f = (c + 30) | 0;
    c = (((h & 65280) | 0) != 0) | 0;
    j = (e ^ d) & 255;
    d = ((j & 128 & (h ^ g)) | 0) == 0 ? c : c | 2048;
    b[f >> 1] =
      (b[f >> 1] & -2262) |
      ((((h ^ j) & 16) | 0) == 0 ? d : d | 16) |
      (((a[(872 + (h & 255)) | 0] | 0) == 0 ? i | 4 : i) & 196);
    return;
  }
  function iC(c, d, e, f) {
    c = c | 0;
    d = d | 0;
    e = e | 0;
    f = f | 0;
    var g = 0,
      h = 0,
      i = 0,
      j = 0,
      k = 0;
    g = d & 65535;
    h = (d - e) & 65535;
    i = (h - f) & 65535;
    if ((h << 16) >> 16 == (f << 16) >> 16) {
      j = 64;
    } else {
      j = ((i & 32768) | 0) == 0 ? 0 : 128;
    }
    h = (c + 30) | 0;
    c = (g - (e & 65535) - (f & 65535)) | 0;
    f = (c >>> 0 > 65535) | 0;
    k = (e ^ d) & 65535;
    d = ((k & 32768 & (c ^ g)) | 0) == 0 ? f : f | 2048;
    b[h >> 1] =
      (b[h >> 1] & -2262) |
      ((((c ^ k) & 16) | 0) == 0 ? d : d | 16) |
      (((a[(872 + (i & 255)) | 0] | 0) == 0 ? j | 4 : j) & 196);
    return;
  }
  function iD(a, e) {
    a = a | 0;
    e = e | 0;
    var f = 0;
    c[(a + 1188) >> 2] = e;
    f = d[e] | 0;
    b2[c[(14248 + ((((f >>> 3) & 24) | (f & 7)) << 2)) >> 2] & 255](a);
    if (((c[(a + 144) >> 2] & 2) | 0) == 0) {
      return;
    }
    b[(a + 1192) >> 1] = b[(a + 148) >> 1] | 0;
    f = (a + 1200) | 0;
  }
}