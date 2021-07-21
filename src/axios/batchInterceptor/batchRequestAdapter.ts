import {AxiosAdapter, AxiosResponse} from "axios";
import {UUID, uuidv4} from "./helpers/uuid";
import {delay} from "./helpers/delay";
import {BatchInterceptorConfig, RequestConfigRecord} from "./interceptor";
import {transformResponse} from "./helpers/transformResponse";

export type BatchAdapterConfig<T> = {
    adapter: AxiosAdapter
} & BatchInterceptorConfig<T>;

const DEFAULT_DELAY = 0;

export const batchRequestAdapter = <T>(adapterConfig: BatchAdapterConfig<T>): AxiosAdapter => {
    const { delayMs = DEFAULT_DELAY } = adapterConfig;
    let butchRequestConfigs: RequestConfigRecord = {};
    let butchRequestPromises: Record<UUID, BatchRequestPromise<T>> = {};

    return async (config) => {
        const requestUuid = uuidv4();

        butchRequestConfigs[requestUuid] = config;

        const batchRequestId = await delay(delayMs);

        const onSuccess = (res: any) => {
            delete butchRequestPromises[batchRequestId];

            return res
        }

        if (!butchRequestPromises[batchRequestId]) {
            butchRequestPromises[batchRequestId] = batchRequest(butchRequestConfigs, adapterConfig);
            butchRequestConfigs = {};
        }

        return butchRequestPromises[batchRequestId]
            .then(onSuccess)
            .then(res => res[requestUuid]);
    }
}

export type BatchRequestResponse<T> = Record<UUID, AxiosResponse<T>>;
export type BatchRequestPromise<T> = Promise<BatchRequestResponse<T>>

const batchRequest = <T>(requestConfigs: RequestConfigRecord, adapterConfig: BatchAdapterConfig<T>): BatchRequestPromise<T> => {
    const { adapter, mergeRequestConfigs, splitBatchResponse } = adapterConfig;
    const config = mergeRequestConfigs(requestConfigs);

    return adapter(config)
        .then(transformResponse)
        .then(response => splitBatchResponse(response, requestConfigs));
}
