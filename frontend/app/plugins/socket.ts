import { io, Socket } from "socket.io-client";
import { useMainStore } from "@/stores/main";

export default defineNuxtPlugin(() => {
    const store = useMainStore();
    const url = store.protocol + "://" + store.host;
    // const socketConnect: Socket = io(url, {
    //     transports: ["polling", "websocket"],
    // });

    // socketConnect.on("connect_error", (err) => {
    //     console.log(`connect_error due to ${err.message}`)}
    // )

    return {
        // provide: {
        //     socketConnect,
        // },
    };
});
