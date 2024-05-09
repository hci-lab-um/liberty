import { Image } from "./image.class";
import { Region } from "./region.class";
import { OptionalSearchParameters } from "./optionalsearchparameters.class";
import { ColorQuery, TextQuery } from "./query.class";
import { ProviderRegistry } from "./provider/provider-registry.class";
import { PointResultFindInput, RegionResultFindInput } from "./screen.class";
export declare class MatchRequest<NEEDLE_TYPE, PROVIDER_DATA_TYPE> {
    readonly haystack: Image;
    readonly needle: NEEDLE_TYPE;
    readonly confidence: number;
    readonly providerData?: PROVIDER_DATA_TYPE | undefined;
    constructor(haystack: Image, needle: NEEDLE_TYPE, confidence: number, providerData?: PROVIDER_DATA_TYPE | undefined);
}
export declare function isImageMatchRequest<PROVIDER_DATA_TYPE>(matchRequest: any): matchRequest is MatchRequest<Image, PROVIDER_DATA_TYPE>;
export declare function isTextMatchRequest<PROVIDER_DATA_TYPE>(matchRequest: any): matchRequest is MatchRequest<TextQuery, PROVIDER_DATA_TYPE>;
export declare function isColorMatchRequest<PROVIDER_DATA_TYPE>(matchRequest: any): matchRequest is MatchRequest<ColorQuery, PROVIDER_DATA_TYPE>;
export declare function createMatchRequest<PROVIDER_DATA_TYPE>(providerRegistry: ProviderRegistry, needle: PointResultFindInput, searchRegion: Region, minMatch: number, screenImage: Image, params?: OptionalSearchParameters<PROVIDER_DATA_TYPE>): MatchRequest<PointResultFindInput, PROVIDER_DATA_TYPE>;
export declare function createMatchRequest<PROVIDER_DATA_TYPE>(providerRegistry: ProviderRegistry, needle: RegionResultFindInput, searchRegion: Region, minMatch: number, screenImage: Image, params?: OptionalSearchParameters<PROVIDER_DATA_TYPE>): MatchRequest<RegionResultFindInput, PROVIDER_DATA_TYPE>;
export declare function createMatchRequest<PROVIDER_DATA_TYPE>(providerRegistry: ProviderRegistry, needle: RegionResultFindInput | PointResultFindInput, searchRegion: Region, minMatch: number, screenImage: Image, params?: OptionalSearchParameters<PROVIDER_DATA_TYPE>): MatchRequest<RegionResultFindInput, PROVIDER_DATA_TYPE> | MatchRequest<PointResultFindInput, PROVIDER_DATA_TYPE>;
//# sourceMappingURL=match-request.class.d.ts.map