# stream-fsm

A streaming finite state machine

## Install

`npm install stream-fsm`

## Use

```javascript

var fsm = require('stream-fsm');

var out = {};
var stream = fsm({
  // init is the default state
  init : fsm.want(5, function(data) {
    out.start = data;
    this.change('next');
  }),
  next : fsm.want(4, function(data) {
    out.next = data;
    this.change('last');
  }),
  last : fsm.want(4, function(data) {
    out.last = data;
    this.done();
  })
}, function() {

  console.log(out);

  // outputs: { start: 'start', next: 'next', last: 'last' }

});

stream.write('startnextlast');

```

## License

MIT
