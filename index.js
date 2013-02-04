var through = require('through');

var join = function(a, b) {
  if (!a) {
    return b;
  } else if (!b) {
    return a;
  } else if (Buffer.isBuffer(a)) {
    return Buffer.concat([a,b], a.length + b.length);
  } else {
    return a+b;
  }
};

var slice = function(b, start, end) {
  if (Buffer.isBuffer(b)) {
    return b.slice(start, end);
  } else {
    return b.substring(start, end);
  }
};

module.exports = function(states, callback) {
  var state = Object.keys(states)[0];
  var cache = null;
  var ret = function(data) {

    if (!data) { return; }

    var initialState = state;
    var consumed, totalConsumed = 0;

    // todo: catch infinite loops
    // ie: if you didnt consume any bytes and didn't change state
    do {
      consumed = states[state].call(ret, slice(data, totalConsumed));

      if (typeof consumed === 'function') {
        consumed = consumed.call(ret, slice(data, totalConsumed));
      }

      if (typeof consumed !== 'undefined') {
        totalConsumed += consumed;
      } else {
        throw new Error('Please return the number of bytes consumed');
      }
    } while (totalConsumed < data.length);
  };

  ret.change = function(newState) {
    state = newState;
  };

  ret.done = function() {
    callback && callback.apply(this, arguments);
  };

  if (state === 'init') {
    ret();
  }

  return through(ret);
};


module.exports.want = function(count, fn) {

  fn.callCount = 0;
  var cache = null;
  return function(data) {

    if (cache) {
      data = join(cache, data);
      cache = null;
    }

    if (data.length >= count) {

      var ret = fn.call(this, slice(data, 0, count), fn.callCount);
      fn.callCount++;
      if (typeof ret === 'undefined') {
        return count;
      }
      return ret;

    } else {
      cache = join(cache, data);
      return 0;
    }
  };
};
