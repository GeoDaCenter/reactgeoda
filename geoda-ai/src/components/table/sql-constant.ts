export type DuckDBFunctionProps = {
  name: string;
  description: string;
};

export const DUCKDB_NUMERIC_FUNCTIONS = [
  {name: '@(x)', description: 'Absolute value. Parentheses are optional if x is a column name.'},
  {name: 'abs(x)', description: 'Absolute value.'},
  {name: 'acos(x)', description: 'Computes the arccosine of x.'},
  {name: 'add(x, y)', description: 'Alias for x + y.'},
  {name: 'asin(x)', description: 'Computes the arcsine of x.'},
  {name: 'atan(x)', description: 'Computes the arctangent of x.'},
  {name: 'atan2(y, x)', description: 'Computes the arctangent (y, x).'},
  {name: 'bit_count(x)', description: 'Returns the number of bits that are set.'},
  {name: 'cbrt(x)', description: 'Returns the cube root of the number.'},
  {name: 'ceil(x)', description: 'Rounds the number up.'},
  {name: 'ceiling(x)', description: 'Rounds the number up. Alias of ceil.'},
  {name: 'cos(x)', description: 'Computes the cosine of x.'},
  {name: 'cot(x)', description: 'Computes the cotangent of x.'},
  {name: 'degrees(x)', description: 'Converts radians to degrees.'},
  {name: 'divide(x, y)', description: 'Alias for x // y.'},
  {name: 'even(x)', description: 'Round to next even number by rounding away from zero.'},
  {name: 'exp(x)', description: 'Computes e ** x.'},
  {
    name: 'factorial(x)',
    description:
      'See ! operator. Computes the product of the current integer and all integers below it.'
  },
  {
    name: 'fdiv(x, y)',
    description: 'Performs integer division (x // y) but returns a DOUBLE value.'
  },
  {name: 'floor(x)', description: 'Rounds the number down.'},
  {name: 'fmod(x, y)', description: 'Calculates the modulo value. Always returns a DOUBLE value.'},
  {
    name: 'gamma(x)',
    description: 'Interpolation of the factorial of x - 1. Fractional inputs are allowed.'
  },
  {name: 'gcd(x, y)', description: 'Computes the greatest common divisor of x and y.'},
  {
    name: 'greatest_common_divisor(x, y)',
    description: 'Computes the greatest common divisor of x and y.'
  },
  {name: 'greatest(x1, x2, ...)', description: 'Selects the largest value.'},
  {
    name: 'isfinite(x)',
    description: 'Returns true if the floating point value is finite, false otherwise.'
  },
  {
    name: 'isinf(x)',
    description: 'Returns true if the floating point value is infinite, false otherwise.'
  },
  {
    name: 'isnan(x)',
    description: 'Returns true if the floating point value is not a number, false otherwise.'
  },
  {name: 'lcm(x, y)', description: 'Computes the least common multiple of x and y.'},
  {
    name: 'least_common_multiple(x, y)',
    description: 'Computes the least common multiple of x and y.'
  },
  {name: 'least(x1, x2, ...)', description: 'Selects the smallest value.'},
  {name: 'lgamma(x)', description: 'Computes the log of the gamma function.'},
  {name: 'ln(x)', description: 'Computes the natural logarithm of x.'},
  {name: 'log(x)', description: 'Computes the base-10 logarithm of x.'},
  {name: 'log10(x)', description: 'Alias of log. Computes the base-10 logarithm of x.'},
  {name: 'log2(x)', description: 'Computes the base-2 log of x.'},
  {name: 'multiply(x, y)', description: 'Alias for x * y.'},
  {
    name: 'nextafter(x, y)',
    description: 'Return the next floating point value after x in the direction of y.'
  },
  {name: 'pi()', description: 'Returns the value of pi.'},
  {name: 'pow(x, y)', description: 'Computes x to the power of y.'},
  {name: 'power(x, y)', description: 'Alias of pow. computes x to the power of y.'},
  {name: 'radians(x)', description: 'Converts degrees to radians.'},
  {name: 'random()', description: 'Returns a random number between 0 and 1.'},
  {
    name: 'round_even(v NUMERIC, s INTEGER)',
    description:
      'Alias of roundbankers(v, s). Round to s decimal places using the rounding half to even rule. Values s < 0 are allowed.'
  },
  {
    name: 'round(v NUMERIC, s INTEGER)',
    description: 'Round to s decimal places. Values s < 0 are allowed.'
  },
  {name: 'setseed(x)', description: 'Sets the seed to be used for the random function.'},
  {name: 'sign(x)', description: 'Returns the sign of x as -1, 0 or 1.'},
  {name: 'signbit(x)', description: 'Returns whether the signbit is set or not.'},
  {name: 'sin(x)', description: 'Computes the sin of x.'},
  {name: 'sqrt(x)', description: 'Returns the square root of the number.'},
  {name: 'subtract(x, y)', description: 'Alias for x - y.'},
  {name: 'tan(x)', description: 'Computes the tangent of x.'},
  {name: 'trunc(x)', description: 'Truncates the number.'},
  {name: 'xor(x)', description: 'Bitwise XOR.'}
];

export const DUCKDB_DATE_FUNCTIONS = [
  {name: 'current_date', description: 'Current date (at start of current transaction)'},
  {name: 'date_add(date, interval)', description: 'Add the interval to the date'},
  {
    name: 'date_diff(part, startdate, enddate)',
    description: 'The number of partition boundaries between the dates'
  },
  {name: 'date_part(part, date)', description: 'Get the subfield (equivalent to extract)'},
  {
    name: 'date_sub(part, startdate, enddate)',
    description: 'The number of complete partitions between the dates'
  },
  {name: 'date_trunc(part, date)', description: 'Truncate to specified precision'},
  {
    name: 'datediff(part, startdate, enddate)',
    description: 'Alias of date_diff. The number of partition boundaries between the dates'
  },
  {
    name: 'datepart(part, date)',
    description: 'Alias of date_part. Get the subfield (equivalent to extract)'
  },
  {
    name: 'datesub(part, startdate, enddate)',
    description: 'Alias of date_sub. The number of complete partitions between the dates'
  },
  {
    name: 'datetrunc(part, date)',
    description: 'Alias of date_trunc. Truncate to specified precision'
  },
  {name: 'dayname(date)', description: 'The (English) name of the weekday'},
  {name: 'extract(part from date)', description: 'Get subfield from a date'},
  {name: 'greatest(date, date)', description: 'The later of two dates'},
  {name: 'isfinite(date)', description: 'Returns true if the date is finite, false otherwise'},
  {name: 'isinf(date)', description: 'Returns true if the date is infinite, false otherwise'},
  {name: 'last_day(date)', description: 'The last day of the corresponding month in the date'},
  {name: 'least(date, date)', description: 'The earlier of two dates'},
  {name: 'make_date(bigint, bigint, bigint)', description: 'The date for the given parts'},
  {name: 'monthname(date)', description: 'The (English) name of the month'},
  {
    name: 'strftime(date, format)',
    description: 'Converts a date to a string according to the format string'
  },
  {
    name: 'time_bucket(bucket_width, date[, offset])',
    description:
      'Truncate date by the specified interval bucket_width. Buckets are offset by offset interval'
  },
  {
    name: 'time_bucket(bucket_width, date[, origin])',
    description:
      'Truncate date by the specified interval bucket_width. Buckets are aligned relative to origin date. origin defaults to 2000-01-03 for buckets that don’t include a month or year interval, and to 2000-01-01 for month and year buckets'
  },
  {name: 'today()', description: 'Current date (start of current transaction)'}
];

export const DUCKDB_DATE_PART_FUNCTIONS = [
  {name: 'century', description: 'Century'},
  {name: 'day', description: 'Day'},
  {name: 'dayofmonth', description: 'Day (synonym)'},
  {name: 'dayofweek', description: 'Numeric weekday (Sunday = 0, Saturday = 6)'},
  {name: 'dayofyear', description: 'Day of the year (starts from 1, i.e., January 1 = 1)'},
  {name: 'decade', description: 'Decade (year / 10)'},
  {name: 'epoch', description: 'Seconds since 1970-01-01'},
  {name: 'era', description: 'Calendar era'},
  {name: 'hour', description: 'Hours'},
  {name: 'isodow', description: 'Numeric ISO weekday (Monday = 1, Sunday = 7)'},
  {name: 'isoyear', description: 'ISO Year number (Starts on Monday of week containing Jan 4th)'},
  {name: 'microsecond', description: 'Sub-minute microseconds'},
  {name: 'millennium', description: 'Millennium'},
  {name: 'millisecond', description: 'Sub-minute milliseconds'},
  {name: 'minute', description: 'Minutes'},
  {name: 'month', description: 'Month'},
  {name: 'quarter', description: 'Quarter'},
  {name: 'second', description: 'Seconds'},
  {name: 'timezone_hour', description: 'Time zone offset hour portion'},
  {name: 'timezone_minute', description: 'Time zone offset minutes portion'},
  {name: 'timezone', description: 'Time Zone offset in minutes'},
  {name: 'week', description: 'ISO Week'},
  {name: 'weekday', description: 'Numeric weekday synonym (Sunday = 0, Saturday = 6)'},
  {name: 'weekofyear', description: 'ISO Week (synonym)'},
  {name: 'year', description: 'Year'},
  {
    name: 'yearweek',
    description: 'BIGINT of combined ISO Year number and 2-digit version of ISO Week number'
  }
];

export const DUCKDB_OPERATORS = [
  {name: '+', description: 'Addition'},
  {name: '-', description: 'Subtraction'},
  {name: '*', description: 'Multiplication'},
  {name: '/', description: 'Float Division'},
  {name: '//', description: 'Division'},
  {name: '%', description: 'Modulo'},
  {name: '^', description: 'Power'},
  {name: '&', description: 'Bitwise AND'},
  {name: '|', description: 'Bitwise OR'},
  {name: '<<', description: 'Bitwise Shift Left'},
  {name: '>>', description: 'Bitwise Shift Right'},
  {name: '~', description: 'Bitwise Negation'},
  {name: '!', description: 'Factorial of x'}
];

export const DUCKDB_AGGREGATE_FUNCTIONS = [
  {
    name: 'any_value',
    description: 'Returns the first non-null value from arg. This function is affected by ordering.'
  },
  {
    name: 'arbitrary',
    description:
      'Returns the first value (null or non-null) from arg. This function is affected by ordering.'
  },
  {
    name: 'arg_max',
    description:
      'Finds the row with the maximum val. Calculates the arg expression at that row. This function is affected by ordering.'
  },
  {
    name: 'arg_min',
    description:
      'Finds the row with the minimum val. Calculates the arg expression at that row. This function is affected by ordering.'
  },
  {name: 'avg', description: 'Calculates the average value for all tuples in arg.'},
  {name: 'bit_and', description: 'Returns the bitwise AND of all bits in a given expression.'},
  {name: 'bit_or', description: 'Returns the bitwise OR of all bits in a given expression.'},
  {name: 'bit_xor', description: 'Returns the bitwise XOR of all bits in a given expression.'},
  {
    name: 'bitstring_agg',
    description: 'Returns a bitstring with bits set for each distinct value.'
  },
  {name: 'bool_and', description: 'Returns true if every input value is true, otherwise false.'},
  {name: 'bool_or', description: 'Returns true if any input value is true, otherwise false.'},
  {name: 'count', description: 'Calculates the number of tuples in arg.'},
  {
    name: 'favg',
    description:
      'Calculates the average using a more accurate floating point summation (Kahan Sum).'
  },
  {
    name: 'first',
    description:
      'Returns the first value (null or non-null) from arg. This function is affected by ordering.'
  },
  {
    name: 'fsum',
    description: 'Calculates the sum using a more accurate floating point summation (Kahan Sum).'
  },
  {name: 'geomean', description: 'Calculates the geometric mean for all tuples in arg.'},
  {
    name: 'histogram',
    description: 'Returns a MAP of key-value pairs representing buckets and counts.'
  },
  {
    name: 'last',
    description: 'Returns the last value of a column. This function is affected by ordering.'
  },
  {
    name: 'list',
    description:
      'Returns a LIST containing all the values of a column. This function is affected by ordering.'
  },
  {name: 'max', description: 'Returns the maximum value present in arg.'},
  {
    name: 'max_by',
    description:
      'Finds the row with the maximum val. Calculates the arg expression at that row. This function is affected by ordering.'
  },
  {name: 'min', description: 'Returns the minimum value present in arg.'},
  {
    name: 'min_by',
    description:
      'Finds the row with the minimum val. Calculates the arg expression at that row. This function is affected by ordering.'
  },
  {name: 'product', description: 'Calculates the product of all tuples in arg.'},
  {
    name: 'string_agg',
    description:
      'Concatenates the column string values with a separator. This function is affected by ordering.'
  },
  {name: 'sum', description: 'Calculates the sum value for all tuples in arg.'},
  {
    name: 'sum_no_overflow',
    description:
      'Calculates the sum value for all tuples in arg without overflow checks. Unlike sum, which works on floating-point values, sum_no_overflow only accepts INTEGER and DECIMAL values.'
  }
];
