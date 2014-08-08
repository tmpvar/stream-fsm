var fsm = require('./stream-fsm');

var throughputStream = fsm({
  init: fsm.want(1, function() {})
});

var l = 5000, i=0;
var buffers = Array(l)

for (i=0; i<l; i++) {
  buffers[i] = new Buffer(1024);
}

var microtime = require('microtime');
var start = microtime.nowDouble();

for (i=0; i<l; i++) {
  throughputStream.write(buffers[i]);
}

var time = microtime.nowDouble() - start;
console.log(
  'took %s with a throughput of %s bps',
  time,
   (l*1024) / time
);
