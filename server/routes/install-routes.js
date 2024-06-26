'use strict';

const path = require('path');
const express = require('express');
const cors = require('cors');
const asyncHandler = require('../lib/express-async-handler');

const { handleTracingMiddleware } = require('../tracing/tracing-middleware');
const getVersionTags = require('../lib/get-version-tags');
const preventClickjackingMiddleware = require('../middleware/prevent-clickjacking-middleware');
const contentSecurityPolicyMiddleware = require('../middleware/content-security-policy-middleware');
const identifyRoute = require('../middleware/identify-route-middleware');
const clientSideRoomAliasHashRedirectRoute = require('./client-side-room-alias-hash-redirect-route');
const redirectToCorrectRoomUrlIfBadSigil = require('../middleware/redirect-to-correct-room-url-if-bad-sigil-middleware');

function installRoutes(app) {
  app.use(handleTracingMiddleware);
  app.use(preventClickjackingMiddleware);
  app.use(contentSecurityPolicyMiddleware);
  app.use(cors());

  let healthCheckResponse;
  app.get(
    '/health-check',
    identifyRoute('health-check'),
    asyncHandler(async function (req, res) {
      if (!healthCheckResponse) {
        const versionTags = getVersionTags();
        const responseObject = {
          ok: true,
          ...versionTags,
        };
        healthCheckResponse = JSON.stringify(responseObject, null, 2);
      }

      res.set('Content-Type', 'application/json');
      res.send(healthCheckResponse);
    })
  );

  app.get(
    '/faq',
    identifyRoute('faq'),
    asyncHandler(async function (req, res) {
      res.redirect('https://github.com/matrix-org/matrix-viewer/blob/main/docs/faq.md');
    })
  );

  // Our own viewer app styles and scripts
  app.use('/assets', express.static(path.join(__dirname, '../../dist/assets')));

  app.use('/robots.txt', function (req, res, next) {
    res.type('text/plain')
    res.send(
      `User-agent: *
       Disallow: /r*/jump
       Disallow: /r*/date/20*at=`);
  });

  app.use('/', require('./room-directory-routes'));

  // For room aliases (/r) or room ID's (/roomid)
  app.use(
    '/:entityDescriptor(r|roomid)/:roomIdOrAliasDirty',
    require('./room-routes')
  );

  // Since everything after the hash (`#`) won't make it to the server, let's serve a 404
  // page that will potentially redirect them to the correct place if they tried
  // `/r/#room-alias:server/date/2022/10/27` -> `/r/room-alias:server/date/2022/10/27`
  app.get(
    '/:entityDescriptor(r|roomid)',
    identifyRoute('client-side-room-alias-hash-redirect'),
    clientSideRoomAliasHashRedirectRoute
  );

  // Correct any honest mistakes: If someone accidentally put the sigil in the URL, then
  // redirect them to the correct URL without the sigil to the correct path above.
  app.get(
    '/:roomIdOrAliasDirty',
    identifyRoute('redirect-to-correct-room-url-if-bad-sigil'),
    redirectToCorrectRoomUrlIfBadSigil
  );

  app.use((err, req, res, next) => {
    if (!res.headersSent) {
      res.set('Cache-Control', 'public, max-age=0');
    }
    next(err);
  });
}

module.exports = installRoutes;
