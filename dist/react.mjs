import {
  PartySocket
} from "./chunk-G2EOJEOR.mjs";
import {
  getOptionsThatShouldCauseRestartWhenChanged,
  useAttachWebSocketEventHandlers,
  useStableSocket,
  useWebSocket
} from "./chunk-G7CWGN4S.mjs";
import "./chunk-KZ3GGBVP.mjs";

// src/react.ts
function usePartySocket(options) {
  const { host, ...otherOptions } = options;
  const socket = useStableSocket({
    options: {
      host: host || (typeof window !== "undefined" ? window.location.host : "dummy-domain.com"),
      ...otherOptions
    },
    createSocket: (options2) => new PartySocket(options2),
    createSocketMemoKey: (options2) => JSON.stringify([
      // NOTE: if query is defined as a function, the socket
      // won't reconnect when you change the function identity
      options2.query,
      options2.id,
      options2.host,
      options2.room,
      options2.party,
      options2.path,
      options2.protocol,
      options2.protocols,
      ...getOptionsThatShouldCauseRestartWhenChanged(options2)
    ])
  });
  useAttachWebSocketEventHandlers(socket, options);
  return socket;
}
export {
  usePartySocket as default,
  usePartySocket,
  useWebSocket
};
