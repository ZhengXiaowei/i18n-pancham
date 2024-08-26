import { type II18nLoaderOptions } from '@/types';
import { createFetch } from '@/uitls';

/**
 * @description: 加载本地模块语言
 * @return {*}
 */
export const createLocalAppend = async (
  options: II18nLoaderOptions,
  language: string,
  namespace: string,
) => {
  const { modules, moduleWithNs, dir } = options;
  // 是否模块转成namespace
  if (moduleWithNs) {
    const messages = await dir!(namespace, language);
    return messages;
  } else {
    const messages = (
      await Promise.all(
        modules.map(async n => {
          const ret = await dir!(n, language);
          return { [n]: ret };
        }),
      )
    ).reduce((prev, current) => Object.assign(prev, current), {});
    return messages;
  }
};

/**
 * @description: 远程模块加载的具体实现
 * @return {*}
 */
export const createRemoteReq = async (
  options: II18nLoaderOptions,
  language: string,
  namespace: string,
) => {
  const { modules, moduleWithNs, cdn, cdnConf } = options;
  // 如果cdn地址不存在 就直接返回空对象
  if (!cdn) {
    return {};
  }

  const name = (cdnConf ? cdnConf[language] : language) ?? language;
  // 是否模块转成namespace
  if (moduleWithNs) {
    const reqCdnUri = cdn
      .replace('{namespace}', namespace)
      .replace('{language}', name);
    const messages = await createFetch(reqCdnUri);
    return messages;
  } else {
    const messages = (
      await Promise.all(
        modules.map(async n => {
          const reqCdnUri = cdn
            .replace('{namespace}', n)
            .replace('{language}', name);
          const ret = await createFetch(reqCdnUri);
          return { [n]: ret };
        }),
      )
    ).reduce((prev, current) => Object.assign(prev, current), {});
    return messages;
  }
};
