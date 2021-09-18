/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/colorts/lib/colors.js":
/*!********************************************!*\
  !*** ./node_modules/colorts/lib/colors.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
/*

 The MIT License (MIT)

 Original Library
 - Copyright (c) Marak Squires
 - Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

 Additional Functionality
 - Copyright (c) Shadrack Ndacayisenga <shaselloiel@gmail.com> (shaselekings.com)

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */
const system_1 = __webpack_require__(/*! ./system */ "./node_modules/colorts/lib/system.js");
exports.styles = {
    bgBlack: { open: "\u001b[40m", close: "\u001b[49m" },
    bgBlue: { open: "\u001b[44m", close: "\u001b[49m" },
    bgCyan: { open: "\u001b[46m", close: "\u001b[49m" },
    bgGray: { open: "\u001b[90m", close: "\u001b[49m" },
    bgGreen: { open: "\u001b[42m", close: "\u001b[49m" },
    bgGrey: { open: "\u001b[90m", close: "\u001b[49m" },
    bgMagenta: { open: "\u001b[45m", close: "\u001b[49m" },
    bgRed: { open: "\u001b[41m", close: "\u001b[49m" },
    bgWhite: { open: "\u001b[47m", close: "\u001b[49m" },
    bgYellow: { open: "\u001b[43m", close: "\u001b[49m" },
    black: { open: "\u001b[30m", close: "\u001b[39m" },
    blue: { open: "\u001b[34m", close: "\u001b[39m" },
    bold: { open: "\u001b[1m", close: "\u001b[22m" },
    cyan: { open: "\u001b[36m", close: "\u001b[39m" },
    dim: { open: "\u001b[2m", close: "\u001b[22m" },
    gray: { open: "\u001b[90m", close: "\u001b[39m" },
    green: { open: "\u001b[32m", close: "\u001b[39m" },
    grey: { open: "\u001b[90m", close: "\u001b[39m" },
    hidden: { open: "\u001b[8m", close: "\u001b[28m" },
    inverse: { open: "\u001b[7m", close: "\u001b[27m" },
    italic: { open: "\u001b[3m", close: "\u001b[23m" },
    magenta: { open: "\u001b[35m", close: "\u001b[39m" },
    red: { open: "\u001b[31m", close: "\u001b[39m" },
    reset: { open: "\u001b[0m", close: "\u001b[0m" },
    strikethrough: { open: "\u001b[9m", close: "\u001b[29m" },
    underline: { open: "\u001b[4m", close: "\u001b[24m" },
    white: { open: "\u001b[37m", close: "\u001b[39m" },
    yellow: { open: "\u001b[33m", close: "\u001b[39m" },
};
class Colors {
    constructor(str = "") {
        this.str = str;
        this.styles = exports.styles;
        this.init();
    }
    get bgBlack() {
        this.stylize("bgBlack");
        return this;
    }
    get bgBlue() {
        this.stylize("bgBlue");
        return this;
    }
    get bgCyan() {
        this.stylize("bgCyan");
        return this;
    }
    get bgGray() {
        this.stylize("bgGray");
        return this;
    }
    get bgGreen() {
        this.stylize("bgGreen");
        return this;
    }
    get bgGrey() {
        this.stylize("bgGrey");
        return this;
    }
    get bgMagenta() {
        this.stylize("bgMagenta");
        return this;
    }
    get bgRed() {
        this.stylize("bgRed");
        return this;
    }
    get bgWhite() {
        this.stylize("bgWhite");
        return this;
    }
    get bgYellow() {
        this.stylize("bgYellow");
        return this;
    }
    get black() {
        this.stylize("black");
        return this;
    }
    get blue() {
        this.stylize("blue");
        return this;
    }
    get bold() {
        this.stylize("bold");
        return this;
    }
    get cyan() {
        this.stylize("cyan");
        return this;
    }
    get dim() {
        this.stylize("dim");
        return this;
    }
    get gray() {
        this.stylize("gray");
        return this;
    }
    get green() {
        this.stylize("green");
        return this;
    }
    get grey() {
        this.stylize("grey");
        return this;
    }
    get inverse() {
        this.stylize("inverse");
        return this;
    }
    get italic() {
        this.stylize("italic");
        return this;
    }
    get magenta() {
        this.stylize("magenta");
        return this;
    }
    get red() {
        this.stylize("red");
        return this;
    }
    get strikethrough() {
        this.stylize("strikethrough");
        return this;
    }
    get underline() {
        this.stylize("underline");
        return this;
    }
    get yellow() {
        this.stylize("yellow");
        return this;
    }
    get strip() {
        this.str = (`${this.str}`).replace(/\x1B\[\d+m/g, "");
        return this;
    }
    get white() {
        this.stylize("white");
        return this;
    }
    stylize(style) {
        const code = this.styles[style];
        if (this.enabled) {
            this.str = code.open + this.str.replace(code.closeRe, code.open) + code.close;
        }
        return this.str;
    }
    toString() {
        return this.str;
    }
    init() {
        this.enabled = system_1.System.colorSupported();
        this.styleKeys = Object.keys(this.styles);
        this.styleKeys.forEach((key) => {
            this.styles[key].closeRe = new RegExp(this.escapeStringRegexp(this.styles[key].close), "g");
        });
    }
    // noinspection JSMethodCanBeStatic
    escapeStringRegexp(str) {
        if (typeof str !== "string") {
            throw new TypeError("Expected a string.");
        }
        return str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
    }
}
exports.Colors = Colors;
function color(str) {
    return (new Colors(str));
}
exports["default"] = color;
function echo(colorSting) {
    console.log(colorSting.toString());
}
exports.echo = echo;
// print(colors("Shadrack").bgGreen.white.bold.strikethrough);


/***/ }),

/***/ "./node_modules/colorts/lib/string.js":
/*!********************************************!*\
  !*** ./node_modules/colorts/lib/string.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const colors_1 = __webpack_require__(/*! ./colors */ "./node_modules/colorts/lib/colors.js");
function stringify(colorStyle, func) {
    return Object.defineProperty(String.prototype, colorStyle, { get: func, configurable: true });
}
stringify("strip", function () {
    return (colors_1.default(this)).strip.toString();
});
stringify("capitalize", function () {
    return this[0].toUpperCase() + this.slice(1);
});
stringify("titleCase", function () {
    return this.split(" ").map((value) => {
        return value[0].toUpperCase() + value.slice(1).toLowerCase();
    }).join(" ");
});
stringify("upperCamelCase", function () {
    return this.titleCase.split(" ").join("");
});
stringify("lowerCamelCase", function () {
    const s = this.upperCamelCase;
    return s[0].toLowerCase() + s.slice(1);
});
stringify("camelCase", function () {
    return this.lowerCamelCase;
});
stringify("snakeCase", function () {
    return this.toLowerCase().split(" ").join("_");
});
stringify("kebabCase", function () {
    return this.toLowerCase().split(" ").join("-");
});
stringify("studlyCaps", function () {
    const s = this.camelCase.replace(" ", "");
    return s.split("").map((letter, index) => {
        if (index % 2 !== 0) {
            return letter.toLowerCase();
        }
        else {
            return letter.toUpperCase();
        }
    }).join("");
});
Object.keys(colors_1.styles).forEach((styleName) => {
    stringify(styleName, function () {
        return colors_1.default(this)[styleName].toString();
    });
});


/***/ }),

/***/ "./node_modules/colorts/lib/system.js":
/*!********************************************!*\
  !*** ./node_modules/colorts/lib/system.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const process_1 = __webpack_require__(/*! process */ "process");
class System {
    static colorSupported() {
        let supported = false;
        if ((process_1.argv.indexOf("--no-color") !== -1) ||
            (process_1.argv.indexOf("--color=false") !== -1) || process.env.TERM === "dumb") {
            supported = false;
        }
        else if (System.colorEnabled() || System.colorAllowed()) {
            supported = true;
        }
        else {
            supported = /^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM);
        }
        return supported;
    }
    static isWin32() {
        return process.platform === "win32";
    }
    static hasColorOutput() {
        return (process.stdout && !process.stdout.isTTY);
    }
    static colorTermEnv() {
        return ("COLORTERM" in process.env);
    }
    static colorAllowed() {
        return process_1.argv.indexOf("--color") !== -1 ||
            process_1.argv.indexOf("--color=true") !== -1 ||
            process_1.argv.indexOf("--color=always") !== -1;
    }
    static colorEnabled() {
        return System.hasColorOutput() || System.isWin32() || System.colorTermEnv();
    }
}
exports.System = System;


/***/ }),

/***/ "./src/clients/MoonrakerClient.ts":
/*!****************************************!*\
  !*** ./src/clients/MoonrakerClient.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MoonrakerClient": () => (/* binding */ MoonrakerClient)
/* harmony export */ });
/* harmony import */ var _helper_ConsoleLogger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../helper/ConsoleLogger */ "./src/helper/ConsoleLogger.ts");
/* harmony import */ var _helper_ConfigHelper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../helper/ConfigHelper */ "./src/helper/ConfigHelper.ts");


var logger = new _helper_ConsoleLogger__WEBPACK_IMPORTED_MODULE_0__.ConsoleLogger();
var MoonrakerClient = /** @class */ (function () {
    function MoonrakerClient() {
        this.config = new _helper_ConfigHelper__WEBPACK_IMPORTED_MODULE_1__.ConfigHelper();
        logger.logSuccess('connect to MoonRaker...');
    }
    return MoonrakerClient;
}());



/***/ }),

/***/ "./src/helper/ConfigHelper.ts":
/*!************************************!*\
  !*** ./src/helper/ConfigHelper.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ConfigHelper": () => (/* binding */ ConfigHelper)
/* harmony export */ });
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);

var args = process.argv.slice(2);
var ConfigHelper = /** @class */ (function () {
    function ConfigHelper() {
        this.configPath = args[0] + "/mooncord.json";
        this.configRaw = (0,fs__WEBPACK_IMPORTED_MODULE_0__.readFileSync)(this.configPath, { encoding: 'utf8' });
        this.config = JSON.parse(this.configRaw);
    }
    ConfigHelper.prototype.getMoonrakerSocketUrl = function () {
        return this.config.connection.moonraker_socket_url;
    };
    ConfigHelper.prototype.getMoonrakerUrl = function () {
        return this.config.connection.moonraker_url;
    };
    ConfigHelper.prototype.getMoonrakerApiKey = function () {
        return this.config.connection.moonraker_token;
    };
    ConfigHelper.prototype.getDiscordToken = function () {
        return this.config.connection.bot_token;
    };
    ConfigHelper.prototype.getStatusInterval = function () {
        return this.config.status.update_interval;
    };
    ConfigHelper.prototype.getStatusMinInterval = function () {
        return this.config.status.min_interval;
    };
    ConfigHelper.prototype.isStatusPerPercent = function () {
        return this.config.status.use_percent;
    };
    ConfigHelper.prototype.getStatusBeforeTasks = function () {
        return this.config.status.before;
    };
    ConfigHelper.prototype.getStatusAfterTasks = function () {
        return this.config.status.before;
    };
    ConfigHelper.prototype.getLanguage = function () {
        return this.config.language.messages;
    };
    ConfigHelper.prototype.getSyntaxLanguage = function () {
        return this.config.language.command_syntax;
    };
    ConfigHelper.prototype.getController = function () {
        return this.config.permission.controller;
    };
    ConfigHelper.prototype.isGuildAdminAsBotAdmin = function () {
        return this.config.permission.guild_admin_as_bot_admin;
    };
    ConfigHelper.prototype.getWebcamUrl = function () {
        return this.config.webcam.url;
    };
    ConfigHelper.prototype.getWebcamQuality = function () {
        return this.config.webcam.quality;
    };
    ConfigHelper.prototype.getWebcamBrightness = function () {
        return this.config.webcam.brightness;
    };
    ConfigHelper.prototype.getWebcamContrast = function () {
        return this.config.webcam.contrast;
    };
    ConfigHelper.prototype.isWebcamVerticalMirrored = function () {
        return this.config.webcam.vertical_mirror;
    };
    ConfigHelper.prototype.isWebcamHorizontalMirrored = function () {
        return this.config.webcam.horizontal_mirror;
    };
    ConfigHelper.prototype.isWebcamGreyscale = function () {
        return this.config.webcam.greyscale;
    };
    ConfigHelper.prototype.isWebcamSepia = function () {
        return this.config.webcam.sepia;
    };
    ConfigHelper.prototype.notifyOnMoonrakerThrottle = function () {
        return this.config.system_notifications.moonraker_throttle;
    };
    return ConfigHelper;
}());



/***/ }),

/***/ "./src/helper/ConsoleLogger.ts":
/*!*************************************!*\
  !*** ./src/helper/ConsoleLogger.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ConsoleLogger": () => (/* binding */ ConsoleLogger)
/* harmony export */ });
/* harmony import */ var colorts_lib_string__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! colorts/lib/string */ "./node_modules/colorts/lib/string.js");

var ConsoleLogger = /** @class */ (function () {
    function ConsoleLogger() {
        var _this = this;
        // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
        this.logError = function (message) {
            console.log(_this.getTimeStamp(), message.red);
        };
        // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
        this.logSuccess = function (message) {
            console.log(_this.getTimeStamp(), message.green);
        };
        // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
        this.logRegular = function (message) {
            console.log(_this.getTimeStamp(), message.white);
        };
        this.logEmpty = function () { console.log(''); };
    }
    ConsoleLogger.prototype.getTimeStamp = function () {
        var date = new Date();
        return ("[" + date.toISOString() + "]").grey;
    };
    return ConsoleLogger;
}());



/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "process":
/*!**************************!*\
  !*** external "process" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("process");

/***/ }),

/***/ "./package.json":
/*!**********************!*\
  !*** ./package.json ***!
  \**********************/
/***/ ((module) => {

module.exports = JSON.parse('{"name":"mooncord","version":"0.0.5","description":"Moonraker Discord Bot based on Discord.js","main":"index.js","scripts":{"start":"node dist/mooncord.js","ramdebugstart":"node --trace_gc dist/mooncord.js","checkcodestyle":"npx eslint ./**","autofixcodestyle":"npx eslint ./** --fix","build-dev":"webpack  --mode=development","build":"webpack  --mode=production","watch":"webpack --watch --progress --mode=development"},"repository":{"type":"git","url":"git+https://github.com/eliteSchwein/mooncord.git"},"keywords":[],"author":"eliteSCHW31N","license":"ISC","bugs":{"url":"https://github.com/eliteSchwein/mooncord/issues"},"homepage":"https://github.com/eliteSchwein/mooncord#readme","devDependencies":{"async-wait-until":"^2.0.7","axios":"^0.21.1","colorts":"^0.1.63","discord.js":"^13.1.0","eslint":"^7.32.0","eslint-config-galex":"^2.16.9","eslint-config-standard":"^16.0.3","eslint-plugin-import":"^2.24.1","eslint-plugin-node":"^11.1.0","eslint-plugin-promise":"^5.1.0","form-data":"^4.0.0","sharp":"^0.29.0","shelljs":"^0.8.4","ts-loader":"^9.2.5","typescript":"^4.4.3","webpack":"^5.52.1","webpack-cli":"^4.8.0","websocket":"^1.0.34"},"dependencies":{}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!****************************!*\
  !*** ./src/Application.ts ***!
  \****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _package_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../package.json */ "./package.json");
/* harmony import */ var _helper_ConsoleLogger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helper/ConsoleLogger */ "./src/helper/ConsoleLogger.ts");
/* harmony import */ var _clients_MoonrakerClient__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./clients/MoonrakerClient */ "./src/clients/MoonrakerClient.ts");



var logger = new _helper_ConsoleLogger__WEBPACK_IMPORTED_MODULE_1__.ConsoleLogger();
logger.logSuccess("starting " + _package_json__WEBPACK_IMPORTED_MODULE_0__.name + " " + _package_json__WEBPACK_IMPORTED_MODULE_0__.version + "...");
logger.logEmpty();
var moonrakerClient = new _clients_MoonrakerClient__WEBPACK_IMPORTED_MODULE_2__.MoonrakerClient();

})();

/******/ })()
;
//# sourceMappingURL=mooncord.js.map