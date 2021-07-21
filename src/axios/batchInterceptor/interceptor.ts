import {AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios";
import {batchRequestAdapter} from "./adapter";
import {BatchRequestResponse, RequestConfigRecord} from "./types";

export type BatchInterceptorConfig<T> = {
    mergeRequestConfigs: (requestConfigs: RequestConfigRecord) => AxiosRequestConfig
    splitBatchResponse: (response: AxiosResponse<T>, requestConfigs: RequestConfigRecord) => BatchRequestResponse<T>
    rejectFn: (response: AxiosResponse<T>) => AxiosResponse<T>;
    delayMs?: number;
}

export const batchInterceptor = <T>(instance: AxiosInstance, config: BatchInterceptorConfig<T>) => {
    const adapter = batchRequestAdapter({adapter: instance.defaults.adapter!, ...config});

    instance.interceptors.request.use(config => {
        config.adapter = adapter;

        return config;
    }, error => Promise.reject(error));
}

