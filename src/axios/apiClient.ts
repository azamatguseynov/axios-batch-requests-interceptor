import axios, {AxiosInstance} from "axios";
import {batchInterceptor} from "./batchInterceptor";
import {axiosRequestConfig, mergeRequestConfigs, rejectFn, splitBatchResponse} from "./batchInterceptorConfig";

const configureAxios = (): AxiosInstance => {
    const instance = axios.create(axiosRequestConfig);

    batchInterceptor(instance, { mergeRequestConfigs, splitBatchResponse, rejectFn });

    return instance;
}

export const axiosClient = configureAxios();
