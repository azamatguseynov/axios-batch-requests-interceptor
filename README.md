# Axios batch requests interceptor
An Interceptor that helps to batch simultaneous requests to one.

###How to use:

    const configureAxios = (): AxiosInstance => {
        const instance = axios.create(axiosRequestConfig);
        batchInterceptor(instance, config);

        return instance;
    }

###Config:

    mergeRequestConfigs: (requestConfigs: RequestConfigRecord) => AxiosRequestConfig
    splitBatchResponse: (response: AxiosResponse<T>, requestConfigs: RequestConfigRecord) => BatchRequestResponse<T>
    rejectFn: (response: AxiosResponse<T>) => AxiosResponse<T>;
    delayMs?: number;

## Available Scripts

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
