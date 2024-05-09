import { Region } from "./region.class";
import { MatchRequest } from "./match-request.class";
import { ProviderRegistry } from "./provider/provider-registry.class";
import { Point } from "./point.class";
import { PointResultFindInput, RegionResultFindInput } from "./screen.class";
export declare class MatchResult<LOCATION_TYPE> {
    readonly confidence: number;
    readonly location: LOCATION_TYPE;
    readonly error?: Error | undefined;
    constructor(confidence: number, location: LOCATION_TYPE, error?: Error | undefined);
}
export declare function getMatchResults<PROVIDER_DATA_TYPE>(providerRegistry: ProviderRegistry, matchRequest: MatchRequest<RegionResultFindInput, PROVIDER_DATA_TYPE>): Promise<MatchResult<Region>[]>;
export declare function getMatchResults<PROVIDER_DATA_TYPE>(providerRegistry: ProviderRegistry, matchRequest: MatchRequest<PointResultFindInput, PROVIDER_DATA_TYPE>): Promise<MatchResult<Point>[]>;
export declare function getMatchResult<PROVIDER_DATA_TYPE>(providerRegistry: ProviderRegistry, matchRequest: MatchRequest<RegionResultFindInput, PROVIDER_DATA_TYPE>): Promise<MatchResult<Region>>;
export declare function getMatchResult<PROVIDER_DATA_TYPE>(providerRegistry: ProviderRegistry, matchRequest: MatchRequest<PointResultFindInput, PROVIDER_DATA_TYPE>): Promise<MatchResult<Point>>;
//# sourceMappingURL=match-result.class.d.ts.map