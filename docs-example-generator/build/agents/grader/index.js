"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeGrader = void 0;
function makeGrader(options = {}) {
    return {
        grade(args) {
            // TODO: Actually grade the input
            return {
                grade: 0.67,
                comments: [
                    "This is a comment.",
                    "This is another comment.",
                    "This is a third comment.",
                ],
            };
        },
    };
}
exports.makeGrader = makeGrader;
