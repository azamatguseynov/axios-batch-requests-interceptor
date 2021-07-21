import {AxiosResponse} from "axios";

export const transformResponse = (response: AxiosResponse) => {
    if (typeof response.data === 'string') {
        try {
            response.data = JSON.parse(response.data);
        } catch (e) { /* Ignore */
        }
    }
    return response;
}
