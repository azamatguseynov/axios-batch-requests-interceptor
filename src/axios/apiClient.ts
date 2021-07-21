import axios, {AxiosInstance} from "axios";
import {batchInterceptor} from "./batchInterceptor";
import {axiosRequestConfig, mergeRequestConfigs, splitBatchResponse} from "./batchInterceptorConfig";

const configureAxios = (): AxiosInstance => {
    const instance = axios.create(axiosRequestConfig);

    batchInterceptor(instance, { mergeRequestConfigs, splitBatchResponse });

    return instance;
}

export const axiosClient = configureAxios();
