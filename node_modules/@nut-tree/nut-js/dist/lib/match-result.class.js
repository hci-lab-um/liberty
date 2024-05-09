"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMatchResult = exports.getMatchResults = exports.MatchResult = void 0;
const match_request_class_1 = require("./match-request.class");
class MatchResult {
    constructor(confidence, location, error) {
        this.confidence = confidence;
        this.location = location;
        this.error = error;
    }
}
exports.MatchResult = MatchResult;
async function getMatchResults(providerRegistry, matchRequest) {
    if ((0, match_request_class_1.isImageMatchRequest)(matchRequest)) {
        return providerRegistry.getImageFinder().findMatches(matchRequest);
    }
    else if ((0, match_request_class_1.isTextMatchRequest)(matchRequest)) {
        return providerRegistry.getTextFinder().findMatches(matchRequest);
    }
    else if ((0, match_request_class_1.isColorMatchRequest)(matchRequest)) {
        return providerRegistry.getColorFinder().findMatches(matchRequest);
    }
    throw new Error(`Unknown match request type: ${JSON.stringify(matchRequest.needle)}`);
}
exports.getMatchResults = getMatchResults;
async function getMatchResult(providerRegistry, matchRequest) {
    if ((0, match_request_class_1.isImageMatchRequest)(matchRequest)) {
        return providerRegistry.getImageFinder().findMatch(matchRequest);
    }
    else if ((0, match_request_class_1.isTextMatchRequest)(matchRequest)) {
        return providerRegistry.getTextFinder().findMatch(matchRequest);
    }
    else if ((0, match_request_class_1.isColorMatchRequest)(matchRequest)) {
        return providerRegistry.getColorFinder().findMatch(matchRequest);
    }
    throw new Error("Unknown match request type");
}
exports.getMatchResult = getMatchResult;
//# sourceMappingURL=match-result.class.js.map