/**
 * A value that either a success (Ok) or an error (Err)
 *
 * Construct a success with { val: ... } and an error with { err: ... }
 */
export type Result<T, E> = Ok<T> | Err<E>;

// If these look weird, it's because TypeScript is weird
// This is to get type narrowing to work most of the time

/** A success value */
export interface Ok<T> {
    val: T;
    err?: never;
}
/** An error value */
export interface Err<E> {
    err: E;
    val?: never;
}

/**
 * A value that is either `void` or an error
 *
 * Construct success with `{}` and an error with `{ err: ... }`
 */
export type Void<E> = { val?: never; err?: never } | { err: E };
/** A value that is a success `void` */
export type VoidOk = Record<string, never>;

// https://github.com/Pistonite/pure/blob/main/src/result/index.ts
/** Try best effort converting an error to a string */
export const errstr = (e: unknown, recursing?: boolean): string => {
    if (typeof e === "string") {
        return e;
    }
    if (!e) {
        return `${e}`;
    }
    if (typeof e === "object" && "message" in e) {
        if (!recursing) {
            return errstr(e.message, true);
        }
        return `${e.message}`;
    }
    if (typeof e === "object" && "toString" in e) {
        const s = e.toString();
        if (!recursing) {
            return errstr(s, true);
        }
        return `${s}`;
    }
    // try less-likely fields
    if (typeof e === "object" && "msg" in e) {
        if (!recursing) {
            return errstr(e.msg, true);
        }
        return `${e.msg}`;
    }
    if (typeof e === "object" && "code" in e) {
        if (!recursing) {
            return `error code: ${errstr(e.code, true)}`;
        }
        return `${e.code}`;
    }
    return `${e}`;
};
