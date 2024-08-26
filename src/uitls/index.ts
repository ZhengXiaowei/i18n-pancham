/**
 * @description: 创建请求 去远端请求cdn资源
 * @param {string} url
 * @param {string} target
 * @param {*} ext
 * @return {*}
 */
export const createFetch = (url: string) => {
  const reqTimestamp = new Date().valueOf();
  const reqUri = `${url}?t=${reqTimestamp}`;
  return fetch(reqUri)
    .then(res => res.json())
    .catch(e => {
      console.log('request module failed:', url, e);
      return {};
    });
};

/**
 * @description: 生成storage缓存的key
 * @param {string} fields
 * @return {*}
 */
export const genStorageKey = (fields: string[]) => {
  return fields.join('_');
};
