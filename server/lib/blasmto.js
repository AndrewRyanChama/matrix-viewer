/**
 * terminate all instances of matrix.to
 */

function blastEvts(evts) {
    evts.forEach(evt => {
        if (evt.content?.body) {
            evt.content.body = blast(evt.content.body);
        }
        if (evt.content?.formatted_body) {
            evt.content.formatted_body = blast(evt.content.formatted_body);
        }
    });
}

function blast(mtostring) {
    return mtostring.replace(/matrix\.to\/#\/[^\s)"']+/g, mtoinstance => {
        console.log(mtoinstance);
        const res = parsePermalink(mtoinstance);
        console.log(res);
        return res;
    });
}

// KANGED CODE BELOW

/*
Copyright 2019 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const host = "matrix.to";
const baseUrl = `https://${host}`;
const baseUrlPattern = `^(?:https?://)?${host.replace(".", "\\.")}/#/(.*)`;


// Heavily inspired by/borrowed from the matrix-bot-sdk (with permission):
// https://github.com/turt2live/matrix-js-bot-sdk/blob/7c4665c9a25c2c8e0fe4e509f2616505b5b66a1c/src/Permalinks.ts#L33-L61
function parsePermalink(fullUrl) {
    if (!fullUrl) {
        throw new Error("Does not appear to be a permalink");
    }

    const matches = [...fullUrl.matchAll(new RegExp(baseUrlPattern, "gi"))][0];

    if (!matches || matches.length < 2) {
        throw new Error("Does not appear to be a permalink");
    }

    const parts = matches[1].split("/");

    const entity = parts[0];
    if (entity[0] === "@") {
        // Probably a user, no further parsing needed.
        return fullUrl;
    } else if (entity[0] === "#") {
        if (parts.length === 1) {
            // room without event permalink
            const [roomId, query = ""] = entity.split("?");
            const via = query.split(/&?via=/g).filter((p) => !!p);
            return `view.gaytrix.org/r/${roomId.substring(1)}`;
        }

        // rejoin the rest because v3 events can have slashes (annoyingly)
        const eventIdAndQuery = parts.length > 1 ? parts.slice(1).join("/") : "";
        const [eventId, query = ""] = eventIdAndQuery.split("?");
        const via = query.split(/&?via=/g).filter((p) => !!p);

        return `view.gaytrix.org/r/${entity.substring(1)}/event/${eventId}`;
    } else if (entity[0] === "!") {
        if (parts.length === 1) {
            // room without event permalink
            const [roomId, query = ""] = entity.split("?");
            const via = query.split(/&?via=/g).filter((p) => !!p);
            return `view.gaytrix.org/roomid/${roomId.substring(1)}`;
        }

        // rejoin the rest because v3 events can have slashes (annoyingly)
        const eventIdAndQuery = parts.length > 1 ? parts.slice(1).join("/") : "";
        const [eventId, query = ""] = eventIdAndQuery.split("?");
        const via = query.split(/&?via=/g).filter((p) => !!p);

        return `view.gaytrix.org/roomid/${entity.substring(1)}/event/${eventId}`;
    } else {
        console.log("Unknown entity type in permalink: " + fullUrl);
        return fullUrl;
    }
}

module.exports = blastEvts;