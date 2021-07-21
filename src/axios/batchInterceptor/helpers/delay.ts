import {UUID, uuidv4} from "./uuid";

export const createDelay = (delayMs: number) => {
    let timeout: any;
    let resolvers: Array<(uuid: UUID) => void> = [];
    let delayUuid = uuidv4();

    return () => {
        const uuid = delayUuid;
        clearTimeout(timeout);

        return new Promise<UUID>((resolve) => {
            resolvers.push(resolve);

            timeout = setTimeout(() => {
                resolvers.forEach(resolve => resolve(uuid))
                delayUuid = uuidv4();

                timeout = null;
                resolvers = [];
            }, delayMs);
        });
    }
};
