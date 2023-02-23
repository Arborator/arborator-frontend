import io from "socket.io-client";

const socket = io(process.env.DEV ? '' : `${process.env.API}`);

export {socket}
