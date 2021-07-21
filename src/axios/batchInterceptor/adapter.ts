import {AxiosAdapter} from "axios";
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
    const { delayMs = DEFAULT_DELAY, rejectFn } = adapterConfig;
    let butchRequestConfigs: RequestConfigRecord = {};
    let butchRequestPromises: Record<UUID, BatchRequestPromise<T>> = {};
    const delay = createDelay(delayMs);

    return async (config) => {
        const requestUuid = uuidv4();

        butchRequestConfigs[requestUuid] = config;

        // will return the same uuid for all requests until timout is triggered
        const batchRequestUuid = await delay();

        const onSuccess = <T>(butchRequestResponse: BatchRequestResponse<T>) => {
            delete butchRequestPromises[batchRequestUuid];

            return butchRequestResponse[requestUuid];
        }

        if (!butchRequestPromises[batchRequestUuid]) {
            butchRequestPromises[batchRequestUuid] = batchRequest(butchRequestConfigs, adapterConfig);
            butchRequestConfigs = {};
        }

        return butchRequestPromises[batchRequestUuid]
            .then(onSuccess)
            .then(rejectFn);
    }
}

const batchRequest = <T>(requestConfigs: RequestConfigRecord, adapterConfig: BatchAdapterConfig<T>): BatchRequestPromise<T> => {
    const { adapter, mergeRequestConfigs, splitBatchResponse } = adapterConfig;
    const config = mergeRequestConfigs(requestConfigs);

    return adapter(config)
        .then(transformResponse)
        .then(response => splitBatchResponse(response, requestConfigs));
}
