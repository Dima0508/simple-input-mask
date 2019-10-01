// Import stylesheets
import $ from "./node_modules/jquery";
import "./style.css";

var patternAlias = {
  9: "[0-9]",
  a: "[a-z]",
  A: "[A-Z]"
};

/**
 * Trim numeric string.
 * @param value
 * @returns {string}
 */
function trimNumeric(value) {
  let trimValue = +value;

  if (new RegExp("^[.]$").test(trimValue) || !+trimValue) {
    trimValue = "";
  }

  return trimValue;
}

/**
 * Parse pattern string.
 * @param {string} regexpString.
 */
function parsePattern(regexpString) {
  let regexpArray = [];

  for (let currentKey = 0; currentKey < regexpString.length; currentKey++) {
    let param = {
      symbol: null,
      isRegexp: false,
      min: 1,
      max: 1
    };

    if (regexpString[currentKey] === "{") {
      let charLimitRegexp = new RegExp("{(\\d*),(\\d*)}", "g");
      charLimitRegexp.lastIndex = currentKey - 1;
      let limit = charLimitRegexp.exec(regexpString);

      if (limit) {
        regexpArray[currentKey - 1].min = +limit[1];
        regexpArray[currentKey - 1].max = +limit[2];
      } else {
        param.symbol = regexpString[currentKey];
        regexpArray[currentKey] = param;
      }

      currentKey = charLimitRegexp.lastIndex - 1;
      continue;
    }

    if (regexpString[currentKey] in patternAlias) {
      param.symbol = patternAlias[regexpString[currentKey]];
      param.isRegexp = true;
    } else {
      param.symbol = regexpString[currentKey];
    }

    regexpArray[currentKey] = param;
  }

  return regexpArray.filter(param => param !== undefined);
}

/**
 * User-input restriction by pattern.
 * Selector input[data-pattern].
 * Add your pattern alias to switch or pas pattern in data attribute.
 */
function inputPattern() {
  $("input[data-pattern]").each(function() {
    const patternData = $(this).data("pattern");
    let patternString;
    let testParams = [];

    /**
     * On blur callback.
     * @param value
     * @returns {*}
     */
    var onBlur = function(value) {
      return value;
    };

    /**
     * Pattern aliases.
     */
    switch (patternData) {
      case "price":
        patternString = "9{1,4}.9{1,2}";
        onBlur = trimNumeric;
        break;

      case "date":
        patternString = "99/99/Aa";
        onBlur = trimNumeric;
        break;

      default:
        patternString = patternData;
    }

    testParams = parsePattern(patternString);

    /**
     * Test input value.
     */
    $(this).on("input paste", function(e) {
      let value = $(this).val();
      let newValue = "";
      let lastIndex = 0;

      testParams.forEach(param => {
        let regexpString;
        if (param.isRegexp) {
          regexpString = `${param.symbol}{${param.min},${param.max}}`;
        } else {
          regexpString = `[${param.symbol}]`;
        }

        const currentRegexp = new RegExp(regexpString, "g");
        currentRegexp.lastIndex = lastIndex;
        const match = currentRegexp.exec(value);
        newValue += match ? match[0] : "";
        lastIndex = currentRegexp.lastIndex
          ? currentRegexp.lastIndex
          : lastIndex + 1;
      });

      $(this).val(newValue);
    });

    /**
     * On blur callback.
     */
    $(this).blur(function() {
      $(this)
        .val(onBlur($(this).val()))
        .trigger("input");
    });
  });
}

$(document).ready(() => {
  inputPattern();
});
