"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeSummarizer = void 0;
function makeSummarizer(options = {}) {
    return {
        summarize(args) {
            // TODO: Actually summarize the input
            return args.input;
        }
    };
}
exports.makeSummarizer = makeSummarizer;
