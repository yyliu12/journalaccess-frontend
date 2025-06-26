export const apiUrl = "http://localhost:8080/api"
export const staticUrl = "http://localhost:8080/static";
export const dateFormat = "YYYY-MM-DD";

export type Tag = {
    id: number;
    text: string;
    folder: number;
    container: number;
    hasChildren: boolean;
}
export type Location = {
    coordinate: string;
    address: string;
}
export type BacklinkFile = {
    id: number;
    path: string;
    date: string;
}
export type SearchApiResponseFile = { // fileSearchDto
    id: number;
    date: string;
    path: string;
    highlight: string;
    locations: Location[];
    tags: number[];
    backlinks: BacklinkFile[];
}
export type SearchApiResponse = {
    files: SearchApiResponseFile[];
    numFound: number;
    error: string | null;
};
export type ByDateApiResponse = SearchApiResponseFile[];
export type FileApiResponse = { // fileModifyDto
    id: number;
    path: string;
    date: string;
    uuid: string;
    content: string;
    locations: Location[];
    tags: number[];
}

export type Backlink = {
    id: number;
    from: number;
    to: number;
    toFile: FileApiResponse;
}

export type TagSearchQuery = {
    tags: number[];
    includeFolders: boolean;
    recursivelySearch: boolean;
    combiningTerm: "AND" | "OR";
}

export type SearchQuery = {
    query: string;
    sort: string;
    tags: TagSearchQuery;
}

export const defaultSearchQuery: SearchQuery = {
    query: "",
    sort: "score desc",
    tags: {
        tags: [],
        includeFolders: false,
        recursivelySearch: false,
        combiningTerm: "AND"
    }
};