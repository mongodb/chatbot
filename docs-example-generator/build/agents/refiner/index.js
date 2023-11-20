"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRefiner = void 0;
function makeRefiner(options = {}) {
    return {
        refine(args) {
            // TODO: Actually refine the input
            return args.input;
        }
    };
}
exports.makeRefiner = makeRefiner;
