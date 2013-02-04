var test = require('tap').test,
    fsm = require('./');

test("test want (string)", function(t) {
  var count = 0;
  var res = '';
  var fn = fsm.want(4, function(data) {
    console.log(arguments);
    count++;
    res+=data;
  });

  t.equal(fn('1'), 0, '1/4');
  t.equal(fn('2'), 0, '2/4');
  t.equal(fn('3'), 0, '3/4');
  t.equal(fn('4'), 4, '4/4'); // consumed 4 bytes

  t.equal(count, 1);
  t.equal(res, '1234');
  t.end();
});


test("test want (buffer)", function(t) {
  var count = 0;
  var res;
  var fn = fsm.want(4, function(data) {
    console.log(arguments);
    count++;
    res = data;
  });

  t.equal(fn(new Buffer([1])), 0);
  t.equal(fn(new Buffer([2])), 0);
  t.equal(fn(new Buffer([3])), 0);
  t.equal(fn(new Buffer([4])), 4); // consumed 4 bytes

  t.equal(count, 1);

  t.equal(res[0], 1);
  t.equal(res[1], 2);
  t.equal(res[2], 3);
  t.equal(res[3], 4);

  t.end();
});

test('state change', function(t) {
  var out = {
    start: null,
    next : null,
    last : null
  };

  var stream = fsm({
    start : fsm.want(5, function(data) {
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
    t.equal(out.start, 'start');
    t.equal(out.next, 'next');
    t.equal(out.last, 'last');
    t.end();
  });

  stream.write('startnextlast');
});
