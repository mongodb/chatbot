"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeTransformer = void 0;
function makeTransformer(options = {}) {
    return {
        transform(args) {
            // TODO: Actually transform the input
            return args.input;
        }
    };
}
exports.makeTransformer = makeTransformer;
