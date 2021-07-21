import {AxiosRequestConfig, AxiosResponse} from "axios";
import {BatchRequestResponse, RequestConfigRecord} from "./batchInterceptor";
import {UUID} from "./batchInterceptor/helpers/uuid";

export type TBatchResponse = { items: { id: string }[] };

const apiUrl = "https://europe-west1-quickstart-1573558070219.cloudfunctions.net";

export const axiosRequestConfig: AxiosRequestConfig = {
    baseURL: apiUrl,
    headers: {},
};

export const mergeRequestConfigs = (requestConfigs: Record<UUID, AxiosRequestConfig>): AxiosRequestConfig => {
    const configsParamsEntries = getConfigParamsEntries(requestConfigs)
    const configBase = Object.values(requestConfigs)[0];

    const mergedParams = configsParamsEntries.flatMap(([, ids]) => ids);

    return {...configBase, params: { ids: mergedParams }};
}

export const splitBatchResponse = (response: AxiosResponse<TBatchResponse>, requestConfigs: RequestConfigRecord) => {
    const configsParamsEntries = getConfigParamsEntries(requestConfigs)

    const responseEntries = configsParamsEntries.map(([uuid, ids]) => {
        const respItems = response.data.items.filter(({id}) => ids.includes(id))

        return [uuid, {...response, data: { items: respItems }}];
    })

    return Object.fromEntries(responseEntries) as BatchRequestResponse<TBatchResponse>;
}

export const rejectFn = (response: AxiosResponse<TBatchResponse>): AxiosResponse<TBatchResponse> => {
    if (!response.data.items.length) {
        throw new Error('Requested file not found.');
    }

    return response;
};

const getConfigParamsEntries = (requestConfigs: Record<UUID, AxiosRequestConfig>) => {
    const configsEntries = Object.entries(requestConfigs);
    const configsParamsEntries: [UUID, string[]][] = configsEntries.map(([uuid, {params: {ids}}]) => [uuid, ids]);

    return configsParamsEntries;
}
