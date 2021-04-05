// Pseudo-random number generator from https://github.com/bryc/code/blob/master/jshash/PRNGs.md
// Based on C implementation here: https://gist.github.com/tommyettinger/46a874533244883189143505d203312c


// Takes an unsigned integer (a) to be used as the seed and returns a function that generates numbers from [0 to 1) in a pseudo-random sequence. Functions generated with the same seed number will always generate the same sequence of numbers.
function mulberry32(a) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export default mulberry32;
