module.exports = abtest;

/**
 * @param {Object} [options]
 * @param {String} [options.name] Experiment name
 * @param {Object} [options.buckets] Bucket values (weight, variant)
 * @return {Function} middleware
 * @public
**/

/**@todos
 * Check ab test hash before continuing - still needs fixing
 * Add tests
 */
function abtest(options) {

  let map = [];

  if (options.name == undefined) {
    throw Error('Experiment name is required.');
  }

  mapBuckets();

  validateBuckets(options);

  return function abtest(req, res, next) {

    if (!options.enabled) {
      setSession(req, false);
      setLocal(res, false);
      next();
      return;
    }

    if (req.query.abTestName && req.query.abTestBucket) {
      let abData = {name: req.query.abTestName, bucket: parseInt(req.query.abTestBucket)};
      setSession(req, abData);
      setLocal(res, abData);
      next();
      return;
    }
    if (req.session.test && req.session.test.name == options.name) {
      setLocal(res, req.session.test);
      next();
      return;
    }
    if (!checkHash(req)) {
      console.log('AB Testing error!! Did you modify bucket sizes? If you change bucket sizes you must also update experiment name.');
    }

    let abData = {name: options.name, bucket: assignToBucket(), hash: getHash()};
    setSession(req, abData);
    setLocal(res, abData);
    next();
  };


  function validateBuckets() {
    let last = map[map.length - 1];
    if (last.to > 100) {
      throw Error('Buckets add up to more than 100%');
    }
    for (let i in options.buckets) {
      let b = options.buckets[i];
      if (!b.hasOwnProperty('variant') || !b.hasOwnProperty('weight')) {
        throw Error('All buckets must have name & weight keys');
      }
      if (Number.isNaN(b.weight)) {
        throw Error('All weights must be numeric decimals (e.g. 0.3)'); 
      }
    }
    return true;
  }

  function mapBuckets() {
    let start = 0;
    for (let i in options.buckets) {
      let weight = options.buckets[i].weight * 100;
      let segment = {from: start, to: start+ weight, name: parseInt(options.buckets[i].variant)};
      map.push(segment);
      start = start + weight;
    }
  }

  function assignToBucket () {
    let bucket = parseInt(Date.now().toString().slice(-2));
    //bucket is 00-99 now
    for (let i in map) {
      if (bucket >= map[i].from && bucket < map[i].to) {
        return map[i].name;
      }
    }
  }

  function setSession(req, data) {
    req.session.test = data;
  }

  function setLocal(res, data) {
    res.locals.abTest = data;
  }

  function getHash() {
    let hash = options.name;
    for (let i in options.buckets) {
      hash += options.buckets[i].variant+options.buckets[i].weight;
    }
    return hash;
  }

  function checkHash(req) {
    if (req.session.test && req.session.test.hash !== getHash()) {
      return false;
    }
    return true;
  }
}

