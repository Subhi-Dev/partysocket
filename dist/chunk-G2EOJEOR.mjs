import {
  ReconnectingWebSocket
} from "./chunk-KZ3GGBVP.mjs";

// src/index.ts
var valueIsNotNil = (keyValuePair) => keyValuePair[1] !== null && keyValuePair[1] !== void 0;
function generateUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  let d = (/* @__PURE__ */ new Date()).getTime();
  let d2 = typeof performance !== "undefined" && performance.now && performance.now() * 1e3 || 0;
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : r & 3 | 8).toString(16);
  });
}
function getPartyInfo(partySocketOptions, defaultProtocol, defaultParams = {}) {
  const {
    host: rawHost,
    path: rawPath,
    protocol: rawProtocol,
    room,
    party,
    query
  } = partySocketOptions;
  let host = rawHost.replace(/^(http|https|ws|wss):\/\//, "");
  if (host.endsWith("/")) {
    host = host.slice(0, -1);
  }
  if (rawPath && rawPath.startsWith("/")) {
    throw new Error("path must not start with a slash");
  }
  const name = party ?? "main";
  const path = rawPath ? `/${rawPath}` : "";
  const protocol = rawProtocol || (host.startsWith("localhost:") || host.startsWith("127.0.0.1:") || host.startsWith("192.168.") || host.startsWith("10.") || host.startsWith("172.") && host.split(".")[1] >= "16" && host.split(".")[1] <= "31" || host.startsWith("[::ffff:7f00:1]:") ? (
    // http / ws
    defaultProtocol
  ) : (
    // https / wss
    defaultProtocol + "s"
  ));
  const baseUrl = `${protocol}://${host}/${party ? `parties/${party}` : "party"}/${room}${path}`;
  const makeUrl = (query2 = {}) => `${baseUrl}?${new URLSearchParams([
    ...Object.entries(defaultParams),
    ...Object.entries(query2).filter(valueIsNotNil)
  ])}`;
  const urlProvider = typeof query === "function" ? async () => makeUrl(await query()) : makeUrl(query);
  return {
    host,
    path,
    room,
    name,
    protocol,
    partyUrl: baseUrl,
    urlProvider
  };
}
var PartySocket = class extends ReconnectingWebSocket {
  constructor(partySocketOptions) {
    const wsOptions = getWSOptions(partySocketOptions);
    super(wsOptions.urlProvider, wsOptions.protocols, wsOptions.socketOptions);
    this.partySocketOptions = partySocketOptions;
    this.setWSProperties(wsOptions);
  }
  _pk;
  _pkurl;
  name;
  room;
  host;
  path;
  updateProperties(partySocketOptions) {
    const wsOptions = getWSOptions({
      ...this.partySocketOptions,
      ...partySocketOptions,
      host: partySocketOptions.host ?? this.host,
      room: partySocketOptions.room ?? this.room,
      path: partySocketOptions.path ?? this.path
    });
    this._url = wsOptions.urlProvider;
    this._protocols = wsOptions.protocols;
    this._options = wsOptions.socketOptions;
    this.setWSProperties(wsOptions);
  }
  setWSProperties(wsOptions) {
    const { _pk, _pkurl, name, room, host, path } = wsOptions;
    this._pk = _pk;
    this._pkurl = _pkurl;
    this.name = name;
    this.room = room;
    this.host = host;
    this.path = path;
  }
  reconnect(code, reason) {
    if (!this.room || !this.host) {
      throw new Error(
        "The room and host must be set before connecting, use `updateProperties` method to set them or pass them to the constructor."
      );
    }
    super.reconnect(code, reason);
  }
  get id() {
    return this._pk;
  }
  /**
   * Exposes the static PartyKit room URL without applying query parameters.
   * To access the currently connected WebSocket url, use PartySocket#url.
   */
  get roomUrl() {
    return this._pkurl;
  }
  // a `fetch` method that uses (almost) the same options as `PartySocket`
  static async fetch(options, init) {
    const party = getPartyInfo(options, "http");
    const url = typeof party.urlProvider === "string" ? party.urlProvider : await party.urlProvider();
    const doFetch = options.fetch ?? fetch;
    return doFetch(url, init);
  }
};
function getWSOptions(partySocketOptions) {
  const {
    id,
    host: _host,
    path: _path,
    party: _party,
    room: _room,
    protocol: _protocol,
    query: _query,
    protocols,
    ...socketOptions
  } = partySocketOptions;
  const _pk = id || generateUUID();
  const party = getPartyInfo(partySocketOptions, "ws", { _pk });
  return {
    _pk,
    _pkurl: party.partyUrl,
    name: party.name,
    room: party.room,
    host: party.host,
    path: party.path,
    protocols,
    socketOptions,
    urlProvider: party.urlProvider
  };
}

export {
  PartySocket
};
