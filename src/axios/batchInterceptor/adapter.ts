import {AxiosAdapter, AxiosRequestConfig} from "axios";
import {UUID, uuidv4} from "./helpers/uuid";
import {createDelay} from "./helpers/delay";
import {BatchInterceptorConfig} from "./interceptor";
import {transformResponse} from "./helpers/transformResponse";
import {BatchRequestPromise, BatchRequestResponse, RequestConfigRecord} from "./types";

export type BatchAdapterConfig<T> = {
    adapter: AxiosAdapter
} & BatchInterceptorConfig<T>;

const DEFAULT_DELAY = 0;

export const batchRequestAdapter = <T>(adapterConfig: BatchAdapterConfig<T>): AxiosAdapter => {
    let butchRequestConfigs: RequestConfigRecord = {};
    let butchRequestPromises: Record<UUID, BatchRequestPromise<T>> = {};
    const { delayMs = DEFAULT_DELAY, rejectFn } = adapterConfig;

    const delay = createDelay(delayMs);

    const clearBatchRequestConfigs = () => butchRequestConfigs = {};
    const saveBatchRequestConfig = (requestUuid: UUID, config: AxiosRequestConfig) => butchRequestConfigs[requestUuid] = config;
    const clearBatchRequestByUuid = (batchRequestUuid: UUID) => () => delete butchRequestPromises[batchRequestUuid];
    const getCurrentResponseByUuid = (requestUuid: UUID) => <T>(butchRequestResponse: BatchRequestResponse<T>) => {
        return butchRequestResponse[requestUuid];
    }

    return async (config) => {
        const requestUuid = uuidv4();

        saveBatchRequestConfig(requestUuid, config);

        // will return the same uuid for all requests until timout is triggered
        const batchRequestUuid = await delay();

        if (!butchRequestPromises[batchRequestUuid]) {
            butchRequestPromises[batchRequestUuid] = batchRequest(butchRequestConfigs, adapterConfig);

            clearBatchRequestConfigs();
        }

        return butchRequestPromises[batchRequestUuid]
            .then(getCurrentResponseByUuid(requestUuid))
            .then(rejectFn)
            .finally(clearBatchRequestByUuid(batchRequestUuid));
    }
}

const batchRequest = <T>(requestConfigs: RequestConfigRecord, adapterConfig: BatchAdapterConfig<T>): BatchRequestPromise<T> => {
    const { adapter, mergeRequestConfigs, splitBatchResponse } = adapterConfig;
    const config = mergeRequestConfigs(requestConfigs);

    return adapter(config)
        .then(transformResponse)
        .then(response => splitBatchResponse(response, requestConfigs));
}
