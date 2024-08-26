/*
 * @Author       : 晓晓晓晓丶vv
 * @Date         : 2024-07-03 17:35:56
 * @LastEditTime : 2024-07-11 09:43:32
 * @LastEditors  : 晓晓晓晓丶vv
 * @Description  : 存放一些常量
 */

/* -------------------- localforage存储的名字，可以为indexDB的数据库名字 -------------------- */
export const STORAGE_NAME = 'i18n-language';

export const DEFAULT_JSON_KEY = 'language';

export const DEFAULT_STORAGE_KEY = 'language';

export const DEFAULT_I18N_NAMESPACE = 'translation';

// missing key存储
export const REPORT_FREQUENCE_KEY = 'i18n_report_frequence';
export const REPORT_MISSING_KEY = 'i18n_report_missing_key';
export const REPORT_FREQUENCE_HOUR = 60 * 60 * 1000;
export const REPORT_FREQUENCE_DAY = REPORT_FREQUENCE_HOUR * 24;
