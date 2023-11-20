"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assistantMessage = exports.userMessage = exports.systemMessage = exports.chatMessage = void 0;
function chatMessage(t) {
    return t;
}
exports.chatMessage = chatMessage;
const systemMessage = (content) => chatMessage({ role: "system", content });
exports.systemMessage = systemMessage;
const userMessage = (content) => chatMessage({ role: "user", content });
exports.userMessage = userMessage;
const assistantMessage = (content) => chatMessage({ role: "assistant", content });
exports.assistantMessage = assistantMessage;
