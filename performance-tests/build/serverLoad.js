"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = void 0;
var http_1 = __importDefault(require("k6/http"));
var k6_1 = require("k6");
exports.options = {
    vus: 5,
    duration: "60s", // Duration of the test
};
// Used to bypass the WAF
var browserHeaders = {
    authority: "knowledge.staging.corp.mongodb.com",
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "no-cache",
    pragma: "no-cache",
    "sec-ch-ua": '"Chromium";v="116", "Not)A;Brand";v="24", "Google Chrome";v="116"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
};
var baseUrl = __ENV.BASE_URL;
if (baseUrl === undefined) {
    throw new Error("BASE_URL is undefined. You must define BASE_URL in your environment.");
}
function default_1() {
    return __awaiter(this, void 0, void 0, function () {
        var conversationResponse, _id, message, params, messageResponse, message2, messageResponse2;
        return __generator(this, function (_a) {
            conversationResponse = http_1.default.post(baseUrl + "/api/v1/conversations", undefined, {
                headers: browserHeaders,
            });
            // Check the status code for the first request
            (0, k6_1.check)(conversationResponse, {
                "status is 200 (created conversation)": function (r) { return r.status === 200; },
            });
            _id = JSON.parse(conversationResponse.body)._id;
            message = JSON.stringify({
                message: "What is MongoDB?",
            });
            params = {
                headers: __assign({ "Content-Type": "application/json" }, browserHeaders),
            };
            messageResponse = http_1.default.post(baseUrl + "/api/v1/conversations/" + _id + "/messages", message, params);
            // // Check the status code for the second request
            (0, k6_1.check)(messageResponse, {
                "status is 200 (responds with message)": function (r) { return r.status === 200; },
                "contains message": function (r) { return JSON.parse(r.body).content; },
            });
            message2 = JSON.stringify({
                message: "Why use MongoDB?",
            });
            messageResponse2 = http_1.default.post(baseUrl + "/api/v1/conversations/" + _id + "/messages", message2, params);
            // // Check the status code for the second request
            (0, k6_1.check)(messageResponse2, {
                "status is 200 (responds with message)": function (r) { return r.status === 200; },
                "contains message": function (r) { return JSON.parse(r.body).content; },
            });
            return [2 /*return*/];
        });
    });
}
exports.default = default_1;
