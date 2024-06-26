import {
  ReconnectingWebSocket
} from "./chunk-KZ3GGBVP.mjs";

// src/use-handlers.ts
import { useEffect, useRef } from "react";
var useAttachWebSocketEventHandlers = (socket, options) => {
  const handlersRef = useRef(options);
  handlersRef.current = options;
  useEffect(() => {
    const onOpen = (event) => handlersRef.current?.onOpen?.(event);
    const onMessage = (event) => handlersRef.current?.onMessage?.(event);
    const onClose = (event) => handlersRef.current?.onClose?.(event);
    const onError = (event) => handlersRef.current?.onError?.(event);
    socket.addEventListener("open", onOpen);
    socket.addEventListener("close", onClose);
    socket.addEventListener("error", onError);
    socket.addEventListener("message", onMessage);
    return () => {
      socket.removeEventListener("open", onOpen);
      socket.removeEventListener("close", onClose);
      socket.removeEventListener("error", onError);
      socket.removeEventListener("message", onMessage);
    };
  }, [socket]);
};

// src/use-socket.ts
import { useEffect as useEffect2, useMemo, useRef as useRef2, useState } from "react";
var getOptionsThatShouldCauseRestartWhenChanged = (options) => [
  options.startClosed,
  options.minUptime,
  options.maxRetries,
  options.connectionTimeout,
  options.maxEnqueuedMessages,
  options.maxReconnectionDelay,
  options.minReconnectionDelay,
  options.reconnectionDelayGrowFactor,
  options.debug
];
function useStableSocket({
  options,
  createSocket,
  createSocketMemoKey: createOptionsMemoKey
}) {
  const shouldReconnect = createOptionsMemoKey(options);
  const socketOptions = useMemo(() => {
    return options;
  }, [shouldReconnect]);
  const [socket, setSocket] = useState(
    () => (
      // only connect on first mount
      createSocket({ ...socketOptions, startClosed: true })
    )
  );
  const socketInitializedRef = useRef2(null);
  const createSocketRef = useRef2(createSocket);
  createSocketRef.current = createSocket;
  useEffect2(() => {
    if (socketInitializedRef.current === socket) {
      const newSocket = createSocketRef.current({
        ...socketOptions,
        // when reconnecting because of options change, we always reconnect
        // (startClosed only applies to initial mount)
        startClosed: false
      });
      setSocket(newSocket);
    } else {
      if (!socketInitializedRef.current && socketOptions.startClosed !== true) {
        socket.reconnect();
      }
      socketInitializedRef.current = socket;
      return () => {
        socket.close();
      };
    }
  }, [socket, socketOptions]);
  return socket;
}

// src/use-ws.ts
function useWebSocket(url, protocols, options = {}) {
  const socket = useStableSocket({
    options,
    createSocket: (options2) => new ReconnectingWebSocket(url, protocols, options2),
    createSocketMemoKey: (options2) => JSON.stringify([
      // will reconnect if url or protocols are specified as a string.
      // if they are functions, the WebSocket will handle reconnection
      url,
      protocols,
      ...getOptionsThatShouldCauseRestartWhenChanged(options2)
    ])
  });
  useAttachWebSocketEventHandlers(socket, options);
  return socket;
}

export {
  useAttachWebSocketEventHandlers,
  getOptionsThatShouldCauseRestartWhenChanged,
  useStableSocket,
  useWebSocket
};
