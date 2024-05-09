"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMatchRequest = exports.isColorMatchRequest = exports.isTextMatchRequest = exports.isImageMatchRequest = exports.MatchRequest = void 0;
const image_class_1 = require("./image.class");
const query_class_1 = require("./query.class");
class MatchRequest {
    constructor(haystack, needle, confidence, providerData) {
        this.haystack = haystack;
        this.needle = needle;
        this.confidence = confidence;
        this.providerData = providerData;
    }
}
exports.MatchRequest = MatchRequest;
function isImageMatchRequest(matchRequest) {
    return (0, image_class_1.isImage)(matchRequest.needle);
}
exports.isImageMatchRequest = isImageMatchRequest;
function isTextMatchRequest(matchRequest) {
    return (0, query_class_1.isTextQuery)(matchRequest.needle);
}
exports.isTextMatchRequest = isTextMatchRequest;
function isColorMatchRequest(matchRequest) {
    return (0, query_class_1.isColorQuery)(matchRequest.needle);
}
exports.isColorMatchRequest = isColorMatchRequest;
function createMatchRequest(providerRegistry, needle, searchRegion, minMatch, screenImage, params) {
    if ((0, image_class_1.isImage)(needle)) {
        providerRegistry
            .getLogProvider()
            .info(`Searching for image ${needle.id} in region ${searchRegion.toString()}. Required confidence: ${minMatch}`);
        return new MatchRequest(screenImage, needle, minMatch, params === null || params === void 0 ? void 0 : params.providerData);
    }
    else if ((0, query_class_1.isTextQuery)(needle)) {
        providerRegistry.getLogProvider().info(`Searching for ${(0, query_class_1.isLineQuery)(needle) ? "line" : "word"} {
                        ${(0, query_class_1.isLineQuery)(needle) ? needle.by.line : needle.by.word}
                    } in region ${searchRegion.toString()}. Required confidence: ${minMatch}`);
        return new MatchRequest(screenImage, needle, minMatch, params === null || params === void 0 ? void 0 : params.providerData);
    }
    else if ((0, query_class_1.isColorQuery)(needle)) {
        const color = needle.by.color;
        providerRegistry
            .getLogProvider()
            .info(`Searching for color RGBA(${color.R},${color.G},${color.B},${color.A}) in region ${searchRegion.toString()}.`);
        return new MatchRequest(screenImage, needle, 1, params === null || params === void 0 ? void 0 : params.providerData);
    }
    throw new Error(`Unknown input type: ${JSON.stringify(needle)}`);
}
exports.createMatchRequest = createMatchRequest;
//# sourceMappingURL=match-request.class.js.map