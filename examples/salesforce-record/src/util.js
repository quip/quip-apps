// Copyright Quip 2018

/**
 * @param {string[]} keys
 * @param {function(string): T} mapperFunction
 * @return {Object<string, T>}
 * @template T
 */
export function mapKeysToObject(keys, mapperFunction) {
    return keys.reduce((mappedObject, key) => {
        mappedObject[key] = mapperFunction(key);
        return mappedObject;
    }, {});
}

/**
 * @param {Object<string, Promise<T>>} promiseMap
 * @return {Promise<Object<string, T>>}
 * @template T
 */
export function awaitValues(promiseMap) {
    // Call entries once to ensure consistent indices.
    const entries = Object.entries(promiseMap);
    const keys = entries.map(([key, _]) => key);
    const promises = entries.map(([_, valuePromise]) => valuePromise);
    return Promise.all(promises).then(values => {
        return values.reduce((results, resolvedValue, i) => {
            const key = keys[i];
            results[key] = resolvedValue;
            return results;
        }, {});
    });
}
