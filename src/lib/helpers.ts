export const tryCatch = <T>(promise: Promise<T>) =>
  promise
    .then((result) => [result, null] as const)
    .catch((error) => [null, error] as const);
