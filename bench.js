var fsm = require('./stream-fsm');

var throughputStream = fsm({
  init: fsm.want(1, function() {})
});

var l = 50000000;
var buffers = Array(l).map(function() { return new Buffer(1024); });

var microtime = require('microtime');
var start = microtime.nowDouble();

for (var i=0; i<l; i++) {
  throughputStream.write(buffers[i]);
}

console.log(
  'took %s with a throughput of %s bytes',
  microtime.nowDouble() - start,
  l*1024
);
