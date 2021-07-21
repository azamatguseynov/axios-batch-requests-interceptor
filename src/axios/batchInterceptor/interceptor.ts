import {AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios";
import {UUID} from "./helpers/uuid";
import {batchRequestAdapter, BatchRequestResponse} from "./batchRequestAdapter";
import {TBatchResponse} from "../batchInterceptorConfig";

export type RequestConfigRecord = Record<UUID, AxiosRequestConfig>;

export type BatchInterceptorConfig<T> = {
    mergeRequestConfigs: (requestConfigs: RequestConfigRecord) => AxiosRequestConfig
    splitBatchResponse: (response: AxiosResponse<TBatchResponse>, requestConfigs: RequestConfigRecord) => BatchRequestResponse<T>
    delayMs?: number;
}

export const batchInterceptor = <T>(instance: AxiosInstance, config: BatchInterceptorConfig<T>) => {
    const adapter = batchRequestAdapter({adapter: instance.defaults.adapter!, ...config});

    instance.interceptors.request.use(config => {
        config.adapter = adapter;

        return config;
    }, error => Promise.reject(error));
}

