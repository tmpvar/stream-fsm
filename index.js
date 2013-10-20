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
  var state = typeof states.init !== 'undefined' ?
              'init' :
              Object.keys(states)[0];

  var cache = null, stateFn = states[state];
  var ret = function(data) {

    if (!data) { return; }

    var initialState = state;
    var consumed, totalConsumed = 0;

    if (cache) {
      data = join(cache, data);
      cache = null;
    }

    // todo: catch infinite loops
    // ie: if you didnt consume any bytes and didn't change state
    do {
      consumed = stateFn.call(ret, slice(data, totalConsumed));

      // pending more data
      if (consumed === false) {
        cache = join(cache, data);
        break;
      }

      if (typeof consumed === 'function') {
        stateFn = consumed;
        continue;
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
    stateFn = states[state];
  };

  ret.done = function() {
    callback && callback.apply(this, arguments);
  };

  var t = through(ret);
  ret.queue = t.queue.bind(t);
  return t;
};


module.exports.want = function(count, fn) {

  fn.callCount = 0;

  return function(data) {
    if (data.length >= count) {

      var ret = fn.call(this, slice(data, 0, count), fn.callCount);
      fn.callCount++;
      if (typeof ret === 'undefined') {
        return count;
      }
      return ret;

    } else {
      return false;
    }
  };
};
