# Overview

This is simple server-side ab-testing middleware for use on high traffic Node.JS sites. This middleware lets you create consistent tests that can run both on the backend and the frontend, allowing you to create complex tests across pages.

# Requirements

- Node & Express
- express-session

# Setup

First, install the package.

```bash
npm install solitaired-abtest

```

Then add the package to your `app.js` file:

```js
const abtest = require('solitaired-abtest');
```

If you use static middleware, set up the module afterwards (otherwise it runs on every static call too).

```js
app.use(abtest({
  enabled: true,
  name: 'experiment-ID-here',
  buckets: [
    {variant: 0, weight: 0.40},
    {variant: 1, weight: 0.60}
  ]
}));
```

In the `buckets` property, please use an array of variants, and **the weights must add up to 1.**

The name is your experiment slug. If you use Google Optimize, for example, this should be your Experiment ID.

Once added, the middleware makes available the following properties:

- In your routers: `req.session.test`
- In your views: `abTest`

# Usage

## In your routers

Decide what happens based on the bucket:
```js

  let headline;
  if (req.session.test.bucket == 0) {
    headline = 'Struggling with homework?';
  } else if (req.session.test.bucket == 1) {
    headline = 'Our homework helper can help you now.';
  }

  ...
  return res.render('games', {
    headline: headline
  });
```

## In your views:
```jade
  h1 #{headline}
  if abTest.bucket == 0
    button Click here now
  else if abTest.bucket == 1
    button Start today!
```

You can also tie the test to a reporting system, like Google Optimize & Analytics:

```jade
  script.
    let abTest = !{JSON.stringify(abTest)};
    gtagPayload['experiments'] = [ { id: abTest.name, variant: parseInt(abTest.bucket) } ];

  h1 #{headline}

  if abTest.bucket == 0
    button Click here now
    script.    
      gtag('event', abTest.bucket, {
        'event_category': abTest.name,
        'event_label': 'click here now'
      });

  else if abTest.bucket == 1
    button Start today!
    script.    
      gtag('event', abTest.bucket, {
        'event_category': abTest.name,
        'event_label': 'start today'
      });
```
