import "server-only";

if (typeof window !== "undefined") {
  throw new Error("External activity persistence is available only on the server.");
}

export {};
