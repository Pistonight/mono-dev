/**
 * A value that either a success (Ok) or an error (Err)
 *
 * Construct a success with { val: ... } and an error with { err: ... }
 */
export type Result<T, E> = Ok<T> | Err<E>;
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
export type Void<E> = {
    val?: never;
    err?: never;
} | {
    err: E;
};
/** A value that is a success `void` */
export type VoidOk = Record<string, never>;
/** Try best effort converting an error to a string */
export declare const errstr: (e: unknown, recursing?: boolean) => string;
//# sourceMappingURL=result.d.ts.map