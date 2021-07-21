import {UUID} from "./helpers/uuid";
import {AxiosRequestConfig, AxiosResponse} from "axios";

export type RequestConfigRecord = Record<UUID, AxiosRequestConfig>;

export type BatchRequestResponse<T> = Record<UUID, AxiosResponse<T>>;

export type BatchRequestPromise<T> = Promise<BatchRequestResponse<T>>
