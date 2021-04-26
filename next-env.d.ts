/// <reference types="next" />
/// <reference types="next/types/global" />

declare namespace NodeJS {
  export interface ProcessEnv {
    readonly PORT: string;
    readonly SECRET_COOKIE_PASSWORD: string;
    readonly MONGO_URL: string;
  }
}

declare module 'iron-store' {
  interface Store {
    /**
     * Persistent store
     *
     * @type {Record<string, any>}
     */
    persistent: Record<string, any>;
    /**
     * Temporary store (one tine only)
     *
     * @type {Record<string, any>}
     */
    flash: Record<string, any>;
  }

  interface IronStoreOptions {
    /**
     * Previous value obtained from `IronStore.seal()`
     *
     * @type {string}
     */
    sealed?: string;
    /**
     * A pseudo-random long string with at least 32 characters long.
     * Or multiple passwords and ids
     *
     * @type {(string|{id: number, secret: string}[])}
     */
    password: string | Array<{ id: number; secret: string }>;
    /**
     * Sealed object lifetime in milliseconds where 0 means forever. Defaults to 0.
     *
     * @type {number=0}
     */
    ttl?: number;
  }

  interface IronStore {
    set<Value = any>(name: string, value: Value): Value;
    setFlash<Value = any>(name: name, value: Value): Value;
    unset(name: string): void;
    get<Value = unknown>(name?: string): Value | undefined;
    clear(): void;
    seal(): Promise<string>;
  }

  export default async function ironStore(
    options: IronStoreOptions,
  ): Promise<IronStore>;
}
