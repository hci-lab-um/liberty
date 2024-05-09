"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const color_finder_class_1 = __importDefault(require("./color-finder.class"));
const path_1 = require("path");
const index_1 = require("../../../index");
describe("color finder", () => {
    describe("find", () => {
        it("should resolve", async () => {
            // GIVEN
            const screenImage = await (0, index_1.loadImage)((0, path_1.join)(__dirname, `../../../e2e/assets/dot.png`));
            const SUT = new color_finder_class_1.default();
            const colorQuery = {
                id: "colorFinderTest",
                type: "color",
                by: {
                    color: new index_1.RGBA(255, 0, 0, 255),
                },
            };
            const matchRequest = new index_1.MatchRequest(screenImage, colorQuery, 0.9);
            const expectedResult = new index_1.MatchResult(1, new index_1.Point(60, 60));
            // WHEN
            const result = await SUT.findMatch(matchRequest);
            // THEN
            expect(result).toEqual(expectedResult);
        });
    });
    describe("findAll", () => {
        it("should resolve", async () => {
            // GIVEN
            const screenImage = await (0, index_1.loadImage)((0, path_1.join)(__dirname, `../../../e2e/assets/dots.png`));
            const SUT = new color_finder_class_1.default();
            const colorQuery = {
                id: "colorFinderTest",
                type: "color",
                by: {
                    color: new index_1.RGBA(255, 0, 0, 255),
                },
            };
            const matchRequest = new index_1.MatchRequest(screenImage, colorQuery, 0.9);
            const expectedResult = [
                new index_1.MatchResult(1, new index_1.Point(60, 60)),
                new index_1.MatchResult(1, new index_1.Point(60, 80)),
                new index_1.MatchResult(1, new index_1.Point(60, 100)),
            ];
            // WHEN
            const result = await SUT.findMatches(matchRequest);
            // THEN
            expect(result).toEqual(expectedResult);
        });
    });
});
//# sourceMappingURL=color-finder.class.spec.js.map