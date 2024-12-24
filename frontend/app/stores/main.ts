import { defineStore } from "pinia";
type IMainState = {
    host: string;
    port: string;
    protocol: string;
    protocolWS: string;
    db_url: string;
};
export const useMainStore = defineStore("main", {
    state: (): IMainState => ({
        host: process.env?.PORTAL_API_HOST || "",
        port: process.env?.PORTAL_PORT || "",
        protocol: process.env?.PORTAL_HTTP_PROTOCOL || "",
        protocolWS: process.env?.PORTAL_SOCKETS_PROTOCOL || "",
        db_url: process.env?.DATABASE_URL || "",
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
