/*
 * @Author       : 晓晓晓晓丶vv
 * @Date         : 2024-06-27 19:05:30
 * @LastEditTime : 2024-08-05 15:07:36
 * @LastEditors  : 晓晓晓晓丶vv
 * @Description  : 加载本地语言的i18next插件
 */

import type {
  BackendModule,
  InitOptions,
  ReadCallback,
  Services,
} from 'i18next';
import { createLocalAppend, createRemoteReq } from './helper/loader';
import { I18nCache } from './helper/storage';
import { genStorageKey } from '@/uitls';
import { type II18nLoaderOptions } from '@/types';

class I18nLoaderPlugin implements BackendModule<II18nLoaderOptions> {
  public type: 'backend' = 'backend';

  protected services?: Services;

  protected options: II18nLoaderOptions = {
    localLanguages: ['en-US'],
    modules: [],
    moduleWithNs: true,
    storage: true,
  };

  protected i18nextOptions?: InitOptions;

  protected storage: I18nCache | null = null;

  public init(
    services: Services,
    backendOptions: II18nLoaderOptions,
    i18nextOptions: InitOptions,
  ): void {
    this.services = services;
    Object.assign(this.options, backendOptions);
    this.i18nextOptions = i18nextOptions;
    // dir字段必传
    if (!this.options.dir) {
      throw Error("Ensure that the parameter of 'dir' is not empty.");
    }

    // 如果要模块转namespace 则模块本身就是ns内容
    if (this.options.moduleWithNs) {
      this.i18nextOptions.ns = this.options.modules;
      // NOTE 在react模式下 会自动把default的也追加到ns中 所以需要处理一下
      this.i18nextOptions.defaultNS = [];
    }

    // 初始化缓存
    if (this.options.storage) {
      this.storage = new I18nCache();
    }
  }

  public async read(
    language: string,
    namespace: string,
    callback: ReadCallback,
  ): Promise<void> {
    const { localLanguages } = this.options;
    // 语言不在本地配置清单上 就直接请求远程
    if (!localLanguages.includes(language)) {
      await this.createRemoteAppended(language, namespace, callback);
    } else {
      // 加载本地语言
      await this.createLocalAppended(language, namespace, callback);
    }
  }

  /**
   * @description: 加载远程模块
   * @param {string} language
   * @param {ReadCallback} cb
   * @return {*}
   */
  private async createRemoteAppended(
    language: string,
    namespace: string,
    cb: ReadCallback,
  ) {
    // NOTE i18next本身有缓存机制，已经加载的内容 并不会触发read函数
    // 优先从缓存读取
    const key = genStorageKey([namespace, language]);
    const cacheMessages = (await this.storage?.get(key)) ?? {};
    // 如果缓存里本身就有 那就先返回缓存里的语言内容
    if (Object.keys(cacheMessages).length) {
      cb(null, { ...cacheMessages });
    }

    const messages = await createRemoteReq(this.options, language, namespace);

    // 将远端请求到的更新到缓存，并从缓存中重新读取
    const mergedMessages = await this.storage?.set(key, messages);

    cb(null, { ...mergedMessages });
  }

  /**
   * @description: 创建本地语言加载
   * @return {*}
   */
  private async createLocalAppended(
    language: string,
    namespace: string,
    cb: ReadCallback,
  ) {
    // 先进性一波加载本地语言
    const locals = await createLocalAppend(this.options, language, namespace);
    cb(null, { ...locals });
    // 同时进行远端读取，覆盖本地
    const remotes = await createRemoteReq(this.options, language, namespace);
    const latest = Object.assign(locals, remotes);
    cb(null, { ...latest });
  }
}

const i18nLoaderPlugin = new I18nLoaderPlugin();

export { i18nLoaderPlugin, I18nLoaderPlugin };
