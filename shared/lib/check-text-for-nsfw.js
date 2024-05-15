'use strict';

const escapeStringRegexp = require('escape-string-regexp');

const NSFW_WORDS = ['nsfw', 'porn', 'nudes', 'sex', '18+', 'anal', 'cp', 'erica', 'cum', 'teen', 'zoo', 'hardcore', 'nude', 'boy', 'boys', 'rape', 'tween', 'ericas', 'hentai', 'gay', 'gays', 'kid', 'kids', 'child', 'childs', 'pedo.*', 'loli.*', 'nfsw'];
const NSFW_REGEXES = NSFW_WORDS.map(
  // We use `(\b|_|-|\s|^)` instead of just `(\b|_)` because the word boundary doesn't
  // match next to the `+` sign in `18+`
  (word) => new RegExp(`(\\b|_|-|\\s|^)${word}(,|\\b|_|-|\\s|$)`, 'i')
);

// A very basic check for NSFW content that just looks for some keywords in the given
// text
function checkTextForNsfw(text) {
  console.log(text);
  let normalized = text.normalize("NFKD");
  const isNsfw = NSFW_REGEXES.some((regex) => regex.test(text) || regex.test(normalized));

  return isNsfw;
}

module.exports = checkTextForNsfw;
