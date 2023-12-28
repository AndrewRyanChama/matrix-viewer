'use strict';

const assert = require('assert');

const urlJoin = require('url-join');
const { DIRECTION } = require('matrix-viewer-shared/lib/reference-values');
const { fetchEndpointAsJson } = require('../fetch-endpoint');
const { traceFunction } = require('../../tracing/trace-utilities');

const config = require('../config');
const matrixServerUrl = config.get('matrixServerUrl');
assert(matrixServerUrl);

// The number of requests we should make to try to fill the limit before bailing out
const NUM_MAX_REQUESTS = 10;

async function requestSpaceRooms(
  accessToken,
  { abortSignal } = {},
  roomId
) {
  let qs = new URLSearchParams();

  const hierarchyEndpoint = urlJoin(
    matrixServerUrl,
    `/_matrix/client/v1/rooms/${roomId}/hierarchy?max_depth=1`
  );

  const { data: { rooms: rooms } } = await fetchEndpointAsJson(hierarchyEndpoint, {
    method: 'GET',
    accessToken,
    abortSignal,
  }); 
  //console.log(JSON.stringify(rooms));
  return rooms;
}

module.exports = traceFunction(requestSpaceRooms);
