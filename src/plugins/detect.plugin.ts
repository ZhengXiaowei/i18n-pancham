/*
 * @Author       : 晓晓晓晓丶vv
 * @Date         : 2024-07-02 09:38:55
 * @LastEditTime : 2024-07-09 11:37:36
 * @LastEditors  : 晓晓晓晓丶vv
 * @Description  : 语言变化时触发的插件
 */

import Cookies from 'js-cookie';
import { LanguageDetectorAsyncModule, Services } from 'i18next';

import { type IDetectorOptions } from '@/types';
import { DEFAULT_JSON_KEY, DEFAULT_STORAGE_KEY } from '@/const';
import { STORAGE_LOADER } from '@/enum';

class LanguageDetectorPlugin implements LanguageDetectorAsyncModule {
  type: 'languageDetector' = 'languageDetector';

  async: true = true;

  services?: Services;

  // 默认的存储值
  private defaultJsonKey: string = DEFAULT_JSON_KEY;

  private storage: typeof window.localStorage | null = null;

  /* ---------------------------------- 默认的设置 --------------------------------- */
  protected detectorOptions: IDetectorOptions = {
    loader: STORAGE_LOADER.COOKIE, // 默认cookie读取
    key: DEFAULT_STORAGE_KEY,
  };

  init(services: Services, detectorOptions: IDetectorOptions): void {
    this.services = services;
    Object.assign(this.detectorOptions, detectorOptions);
    // NOTE 如果采用storage的方式存储语言 则设置localstorage为stroage驱动
    if (this.detectorOptions.loader === STORAGE_LOADER.STORAGE) {
      this.storage = window.localStorage;
    }
  }

  /* ------------------------------ 根据格式做对应的取值处理 ----------------------------- */
  private getValueByFormat(value: string): string {
    try {
      const json = JSON.parse(value);
      return json[this.defaultJsonKey];
    } catch {
      return value;
    }
  }

  /* ------------------------------ 根据格式做对应的填值处理 ------------------------------ */
  private formatValue(value: string): string {
    return JSON.stringify({ [this.defaultJsonKey]: value });
  }

  /* --------------------------------- 获取存储的语言 -------------------------------- */
  private async getDetectorLanguage() {
    try {
      const { loader, key, customerLoader } = this.detectorOptions;
      if (loader === STORAGE_LOADER.STORAGE) {
        const language = this.storage?.getItem(key) ?? undefined;
        return language;
      } else if (loader === STORAGE_LOADER.COOKIE) {
        const language = Cookies.get(key) || '{}';
        return language;
      } else {
        // 自定义处理，外部传入
        const language = customerLoader?.get() ?? '{}';
        return language;
      }
    } catch (e) {
      return undefined;
    }
  }

  /* --------------------------------- 设置存储的语言 -------------------------------- */
  private async setDetectorLanguage(value: string) {
    try {
      const { loader, key, cookieConfig, customerLoader } =
        this.detectorOptions;
      if (loader === STORAGE_LOADER.STORAGE) {
        this.storage?.setItem(key, value);
      } else if (loader === STORAGE_LOADER.COOKIE) {
        Cookies.set(key, value, cookieConfig ?? {});
      } else {
        // 自定义处理
        customerLoader?.set(value);
      }
    } catch (e) {
      console.warn('set detector language error', e);
    }
  }

  async detect(): Promise<string | readonly string[] | undefined> {
    const detectLangs: string | undefined = await this.getDetectorLanguage();
    if (detectLangs) {
      const language = this.getValueByFormat(detectLangs);
      return language;
    }
    return undefined;
  }

  async cacheUserLanguage?(lng: string): Promise<void> {
    const detectLangs: string | undefined = await this.getDetectorLanguage();
    if (detectLangs) {
      try {
        // 避免json字符串中其他key丢失
        const json = JSON.parse(detectLangs);
        json[this.defaultJsonKey] = lng;
        const langString = JSON.stringify(json);
        await this.setDetectorLanguage(langString);
      } catch {
        console.warn('Cache language error');
      }
    } else {
      const language = this.formatValue(lng);
      await this.setDetectorLanguage(language);
    }
  }
}

const languageDetectorPlugin = new LanguageDetectorPlugin();

export { languageDetectorPlugin, LanguageDetectorPlugin };
