/**
 * Math helpers.
 */

var math = {};

/**
 * Simple proportion calculate.
 */
math.simpleProportion = function(x1, x2, y) {
  return (x1 * x2) / y;
};

module.exports = math;
