/**
 * Wraps a Promise in a try/catch block, returning a tuple for robust error handling.
 *
 * @template T - The expected data type of the resolved Promise.
 * @param promise - The Promise to be wrapped.
 * @returns A tuple of `[data, error]` where:
 *    - `data` is the resolved data of the Promise (or null on error).
 *    - `error` is the error object if the Promise rejected (or null on success).
 */
async function awTry<T>(promise: unknown) {
  try {
    const data = await promise;
    return [data, null] as [T, never];
  } catch (err) {
    console.error(err);
    return [null, err] as [never, unknown];
  }
}
