import {UUID, uuidv4} from "./uuid";

export const delay = (() => {
    let timeout: any;
    let resolvers: Array<(uuid: UUID) => void> = [];
    let delayUuid = uuidv4();

    return (delayMs: number) => {
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
})();
