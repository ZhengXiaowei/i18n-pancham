import { type InitOptions } from 'i18next';
import { type CookieAttributes } from 'js-cookie';
import { STORAGE_LOADER } from '@/enum';

// 基础配置
export interface IPanchamOptions extends InitOptions {
  enableMissingKeyReport?: false | IMissingKeyReportConfig;
}

// 缺少key上报配置
export interface IMissingKeyReportConfig {
  reportFrequency?: 'high' | 'hour' | 'day';
  ignoreDefaultNs?: boolean;
  reportAction: (keyMap: Record<string, string[]>) => void;
}

type LocaleDirFunction = (
  module: string,
  lang: string,
) => Promise<Record<string, any>>;

/* --------------------------------- 加载器的类型 --------------------------------- */
export interface II18nLoaderOptions {
  localLanguages: string[];
  modules: string[];
  moduleWithNs?: boolean; // 模块是否独立出namespace
  dir?: null | LocaleDirFunction;
  cdn?: string; // 需要请求远端的cdn地址
  cdnConf?: Record<string, string>; // cdn的语言映射文件名 如果不配置 默认取lng作为文件名
  storage?: boolean; // 是否开启缓存
}

export interface IDetectorOptions {
  loader: STORAGE_LOADER;
  key: string;
  cookieConfig?: CookieAttributes;
  customerLoader?: {
    get: () => string;
    set: (value: string) => void;
  };
}
