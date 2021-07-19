var chai = require("chai");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var expect = chai.expect;
var abtest = require('../abtest');

chai.use(sinonChai);

describe('Structure', function() {
  let ab = abtest({
    enabled: true,
    name: 'blahblah-11',
    buckets: [
      {variant: 0, weight: 0.40},
      {variant: 1, weight: 0.10}
    ]
  });

  it("should be a function'", function() {
    expect(abtest).to.be.a('function');
  });
  it("should expect 3 arguments'", function() {
    expect(abtest.length).to.equal(1);
  });
});
describe('request handler calling', function() {

  let res = {locals: {}};
  let req = {session: {}, query: {}};

  it('should call next() once', function() {
    let ab = abtest({
      enabled: true,
      name: 'blahblah-11',
      buckets: [
        {variant: 0, weight: 0.40},
        {variant: 1, weight: 0.10}
      ]
    });
    let nextSpy = sinon.spy();
    ab(req, res, nextSpy);
    expect(nextSpy.calledOnce).to.be.true;
  });
});
describe('parameters', function() {

  it('should require options object', function() {
    expect(abtest).to.throw(Error);
  });

  it('should require properly formed options object', function() {
    expect(() => {
      abtest({
        enabled: true,
        buckets: [
          {variant: 0, weight: 0.40},
          {variant: 1, weight: 0.10}
        ]
      })
    }).to.throw(Error);

    expect(() => {
      abtest({
        enabled: true,
        name: 'blah',
      })
    }).to.throw(Error);

    expect(() => {
      abtest({
        enabled: true,
        name: 'blah',
        buckets: [
          {variant: 0, weight: 1.40},
          {variant: 1, weight: 0.10}
        ]
      })
    }).to.throw(Error);


    expect(() => {
      abtest({
        name: 'blah',
        buckets: [
          {variant: 0, weight: 0.40},
          {variant: 1, weight: 0.10}
        ]
      })
    }).to.not.throw();

  });

});
