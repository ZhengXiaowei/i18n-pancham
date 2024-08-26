import { type i18n } from 'i18next';

import {
  DEFAULT_I18N_NAMESPACE,
  REPORT_FREQUENCE_DAY,
  REPORT_FREQUENCE_HOUR,
  REPORT_FREQUENCE_KEY,
  REPORT_MISSING_KEY,
} from '@/const';
import { Debounce } from '@/decorators';
import { type IMissingKeyReportConfig } from '@/types';

class MissingKeyReport {
  // 默认的上报配置
  protected defaultReportOptions: Partial<IMissingKeyReportConfig> = {
    reportFrequency: 'hour',
    ignoreDefaultNs: true,
  };

  protected _missingKeys: Map<string, string[]> = new Map([]); // 丢失key缓存 避免重复上报

  get missingKeys(): Record<string, string[]> {
    return this.formatMap2Json();
  }

  init(reportConf: IMissingKeyReportConfig, i18next: i18n) {
    Object.assign(this.defaultReportOptions, reportConf);
    this.initMissingKey();
    // 利用i18next的事件做missing key的监听
    i18next.on('missingKey', (lngs, ns, key) => {
      this.appendMissingKey(lngs, ns, key);
    });

    return this;
  }

  // 初始化missing key的缓存池
  protected initMissingKey() {
    if (this.defaultReportOptions.reportFrequency === 'high') {
      this._missingKeys.clear();
      return;
    }
    const storageKeys = localStorage.getItem(REPORT_MISSING_KEY);
    if (storageKeys) {
      try {
        this._missingKeys = new Map(Object.entries(JSON.parse(storageKeys)));
      } catch {
        this._missingKeys = new Map([]);
      }
    }
    // 检查下是否达到上报频次
    this.checkReportFrequence();
  }

  // 收集丢失的key 并根据频次上报
  protected appendMissingKey(lngs: readonly string[], ns: string, key: string) {
    const { reportFrequency, ignoreDefaultNs } = this.defaultReportOptions;
    const lang = lngs.slice(0).shift();
    // NOTE 避免初始化的时候 就调用了方法，可能会返回undefined 这里做下处理
    if (lang === undefined) {
      return;
    }

    const missKey =
      ignoreDefaultNs && ns === DEFAULT_I18N_NAMESPACE ? key : `${ns}.${key}`;
    // 如果默认为空 就自动生成空数组
    const keyArray = (this._missingKeys.get(lang) as string[]) ?? [];

    // 追加key并上报
    if (!keyArray.includes(missKey)) {
      keyArray.push(missKey);
      this._missingKeys.set(lang, keyArray);
      // NOTE 做个节流
      this.report();
    }

    // 缓存到本地
    if (reportFrequency !== 'high') {
      const missingKeyJson = JSON.stringify(this.formatMap2Json());
      localStorage.setItem(REPORT_MISSING_KEY, missingKeyJson);
    }
  }

  // 根据频次触发上报功能
  protected checkReportFrequence() {
    const { reportFrequency } = this.defaultReportOptions;
    const preReportTime = localStorage.getItem(REPORT_FREQUENCE_KEY);
    const nowReportTime = new Date().valueOf();

    if (!preReportTime) {
      localStorage.setItem(REPORT_FREQUENCE_KEY, nowReportTime.toString());
      return;
    }

    switch (reportFrequency) {
      case 'hour':
        if (nowReportTime - Number(preReportTime) > REPORT_FREQUENCE_HOUR) {
          localStorage.setItem(REPORT_FREQUENCE_KEY, nowReportTime.toString());
          this._missingKeys.clear();
        }
        break;
      case 'day':
        if (nowReportTime - Number(preReportTime) > REPORT_FREQUENCE_DAY) {
          localStorage.setItem(REPORT_FREQUENCE_KEY, nowReportTime.toString());
          this._missingKeys.clear();
        }
        break;
      default:
        break;
    }
  }

  // 上报行为
  @Debounce(500)
  protected report() {
    const { reportAction } = this.defaultReportOptions;
    const reportKeys = this.formatMap2Json();
    reportAction?.(reportKeys);
  }

  // 将map数据转成json
  protected formatMap2Json() {
    return Object.fromEntries(this._missingKeys);
  }
}

export default new MissingKeyReport();
