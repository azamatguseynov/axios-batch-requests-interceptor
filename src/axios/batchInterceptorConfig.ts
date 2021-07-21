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

    const mergedParams = configsParamsEntries.flatMap(([, ids]) => ids);

    const configBase = requestConfigs[Object.keys(requestConfigs)[0]];

    return {...configBase, params: {ids: mergedParams}};
}

export const splitBatchResponse = (response: AxiosResponse<TBatchResponse>, requestConfigs: RequestConfigRecord) => {
    const configsParamsEntries = getConfigParamsEntries(requestConfigs)

    const responseEntries = configsParamsEntries.map(([uuid, ids]) => {
        const respItems = response.data.items.filter(({id}) => ids.includes(id))

        return [uuid, {...response, data: respItems}];
    })

    return Object.fromEntries(responseEntries) as BatchRequestResponse<TBatchResponse>;
}

const getConfigParamsEntries = (requestConfigs: Record<UUID, AxiosRequestConfig>) => {
    const configsEntries = Object.entries(requestConfigs);
    const configsParamsEntries: [UUID, string[]][] = configsEntries.map(([uuid, {params: {ids}}]) => [uuid, ids]);

    return configsParamsEntries;
}
