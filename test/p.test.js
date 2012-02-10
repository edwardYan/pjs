var assert = require('assert')
  , P = require('./../index').P
;

describe('P', function() {
  describe('creating idiomatic classes', function() {
    var MyClass = P(function(p) {
      p.foo = 1
    });

    it('creates functions', function() {
      assert.equal('function', typeof MyClass);
    });

    it('uses the prototype', function() {
      assert.equal(1, MyClass.prototype.foo);
    });

    it('respects instanceof', function() {
      assert.ok(new MyClass instanceof MyClass);
      assert.ok(MyClass() instanceof MyClass);
    });
  });

  describe('init', function() {
    var MyClass = P(function(p) {
      p.init = function() {
        this.initCalled = true;
        this.initArgs = arguments;
      };

      p.initCalled = false;
    });

    it('is called when the class is called plainly', function() {
      assert.ok(MyClass().initCalled);
      assert.equal(3, MyClass(1,2,3).initArgs[2]);
    });

    it('is not called when the new keyword is given', function() {
      assert.ok(!(new MyClass).initCalled);
    });

    it('is called when an argument is passed with `new`', function() {
      var obj = new MyClass([1, 2]);
      assert.ok(obj.initCalled);
      assert.equal(1, obj.initArgs[0]);
      assert.equal(2, obj.initArgs[1]);
    });
  });

  describe('inheritance', function() {
    // see examples/ninja.js
    var Person = P(function(person) {
      person.init = function(isDancing) { this.dancing = isDancing };
      person.dance = function() { return this.dancing };
    });

    var Ninja = P(Person, function(ninja, person) {
      ninja.init = function() { person.init.call(this, false) };
      ninja.swingSword = function() { return 'swinging sword!' };
    });

    var ninja = Ninja();

    it('respects instanceof', function() {
      assert.ok(ninja instanceof Person);
    });

    it('inherits methods (also super)', function() {
      assert.equal(false, ninja.dance());
    });
  });

  describe('inheriting builtins', function() {
    describe('Error', function() {
      var MyError = P(Error, {});

      try {
        throw MyError('o noes');
      } catch(e) {
        assert.ok(e instanceof MyError);
      }
    });

    describe('RegExp', function() {
      var MyRegExp = P(RegExp, {})
        , re = MyRegExp('a(b+)c')
      ;

      assert.ok(re instanceof RegExp);
      // pending: doesn't work yet
      // assert.ok(MyRegExp('a(b+)c').test('abbbbc'))
    });

    describe('String', function() {
      var MyString = P(String, {})
        , str = MyString('foo')
      ;

      assert.ok(str instanceof String);
      // pending: doesn't work yet
      // assert.equal('foo', str.toString());
    });

    describe('Array', function() {
      var MyArray = P(Array, {})
        , ary = MyArray(1,2,3)
      ;

      assert.ok(ary instanceof Array);
      // apparently the Array constructor isn't destructive :(
      // when you `apply` it to an instance of Array, it just creates
      // a new one for you.  Bah.

      // assert.equal(3, ary.length);
      // assert.equal(1, ary[0]);
    });
  });

  describe('definition', function() {
    it('passes the prototype as the first arg', function() {
      var proto;
      var MyClass = P(function(p) { proto = p; });

      assert.equal(proto, MyClass.prototype);
    });

    it('passes the superclass prototype as the second arg', function() {
      var _super;
      P(Error, function(a, b) { _super = b; });
      assert.equal(_super, Error.prototype);
    });

    it('passes the class itself as the third arg', function() {
      var klass;
      var MyClass = P(function(a, b, c) { klass = c; });

      assert.equal(klass, MyClass);
    });

    it('passes the superclass as the fourth argument', function() {
      var sclass;
      var MyClass = P(function(a, b, c, d) { sclass = d; });
      assert.equal(Object, sclass);

      P(MyClass, function(a, b, c, d) { sclass = d; });
      assert.equal(MyClass, sclass);
    });

    it('passes the class itself as `this`', function() {
      var klass;
      var MyClass = P(function() { klass = this; });
      assert.equal(MyClass, klass);
    });

  });
});
