import i18next, {
  type i18n,
  type Module,
  type NewableModule,
  type Newable,
  use,
} from 'i18next';

import missingKeyReport from '@/core/report';
import { i18nLoaderPlugin } from '@/plugins/loader.plugin';
import { languageDetectorPlugin } from '@/plugins/detect.plugin';

import { type IPanchamOptions } from '@/types';

class I18nPancham {
  public readonly i18next: i18n = i18next;

  public report: typeof missingKeyReport | null = null;

  // 默认配置
  private i18nOptions: IPanchamOptions = {
    partialBundledLanguages: true,
    fallbackLng: 'en-US',
    load: 'currentOnly',
    saveMissingTo: 'fallback',
    returnEmptyString: false,
    returnObjects: true,
    saveMissing: true,
    initImmediate: false,
    interpolation: {
      prefix: '{',
      suffix: '}',
      escapeValue: false, // html元素禁止转义
    },
    // TODO 后续完善，前台展示丢失key的value处理 需要配合missingKeyHandler
    // parseMissingKeyHandler: (key, defaultValue) => {
    //   const { keySeparator } = this.i18next.options;
    //   const keyArrays = (defaultValue || key).split(keySeparator || '.');
    //   return keyArrays.slice(0).pop();
    // },
  };

  // 初始化
  public initialize(i18nOptions: IPanchamOptions) {
    Object.assign(this.i18nOptions, i18nOptions);

    const instance = use(i18nLoaderPlugin)
      .use(languageDetectorPlugin)
      .init(this.i18nOptions)
      .then(err => {
        if (err) {
          console.warn('init i18next error', err);
        }

        // 是否开启上报功能
        const { enableMissingKeyReport } = this.i18nOptions;
        if (enableMissingKeyReport && this.i18next.isInitialized) {
          this.report = missingKeyReport.init(enableMissingKeyReport, i18next);
        }
      });

    return instance;
  }

  public use<T extends Module>(module: T | NewableModule<T> | Newable<T>) {
    use(module);
    return this;
  }

  // 创建一个实例
  static createInstance() {
    return new I18nPancham();
  }
}

const instance = I18nPancham.createInstance();

export default instance;
