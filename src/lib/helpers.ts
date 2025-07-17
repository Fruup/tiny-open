export const tryCatch = <T>(
  promise: Promise<T>,
): Promise<readonly [T, null] | readonly [null, Error]> =>
  promise
    .then((result) => [result, null] as const)
    .catch((error) => [null, error] as const);
