import { ColorFinderInterface } from "../color-finder.interface";
import { MatchRequest } from "../../match-request.class";
import { ColorQuery } from "../../query.class";
import { MatchResult } from "../../match-result.class";
import { Point } from "../../point.class";
export default class implements ColorFinderInterface {
    findMatch<PROVIDER_DATA_TYPE>(query: MatchRequest<ColorQuery, PROVIDER_DATA_TYPE>): Promise<MatchResult<Point>>;
    findMatches<PROVIDER_DATA_TYPE>(query: MatchRequest<ColorQuery, PROVIDER_DATA_TYPE>): Promise<MatchResult<Point>[]>;
}
//# sourceMappingURL=color-finder.class.d.ts.map