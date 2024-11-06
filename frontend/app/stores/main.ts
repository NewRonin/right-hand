import { defineStore } from "pinia";
type IMainState = {
    host: string;
    port: string;
    protocol: string;
    protocolWS: string;
};
export const useMainStore = defineStore("main", {
    state: (): IMainState => ({
        host: process.env?.PORTAL_API_HOST || "",
        port: process.env?.PORTAL_PORT || "",
        protocol: process.env?.PORTAL_HTTP_PROTOCOL || "",
        protocolWS: process.env?.PORTAL_SOCKETS_PROTOCOL || "",
    }),

    actions: {
        getApi(url: string): string {
            return (
                this.protocol +
                "://" +
                this.host +
                ":" +
                url
            );
        },
    },
});
