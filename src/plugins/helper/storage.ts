/*
 * @Author       : 晓晓晓晓丶vv
 * @Date         : 2024-07-03 17:46:58
 * @LastEditTime : 2024-07-04 14:58:44
 * @LastEditors  : 晓晓晓晓丶vv
 * @Description  : 缓存多语言内容到storage里
 */

import Localforage, { INDEXEDDB, WEBSQL, LOCALSTORAGE } from 'localforage';
import { STORAGE_NAME } from '@/const';

class I18nCache {
  private storage: typeof Localforage;

  constructor() {
    // 初始化localforage 并且按照indexDB -> webSQL -> localstorage的优先级驱动
    this.storage = Localforage.createInstance({
      name: STORAGE_NAME,
      driver: [INDEXEDDB, WEBSQL, LOCALSTORAGE],
    });
  }

  /**
   * @description: 根据namespace+language组合读对应的语言包内容
   * @param {string} namespace
   * @param {string} language
   * @return {*}
   */
  async get(key: string) {
    const i18nMessage = await this.storage.getItem<Record<string, any>>(key);
    return i18nMessage ?? {};
  }

  /**
   * @description: 根据namespace+language组合写对应的语言包内容
   * @param {string} namespace
   * @param {string} language
   * @param {Record<string, any>} i18nMessage
   * @return {*}
   */
  async set(key: string, i18nMessage: Record<string, any>) {
    // NOTE 要从源数据中读取并合并 不做覆盖
    const targetMessage = await this.get(key);
    const latestMessage = Object.assign(targetMessage, i18nMessage);
    await this.storage.setItem(key, latestMessage);
    return latestMessage;
  }
}

export { I18nCache };
