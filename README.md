# 介绍

代号**顽皮熊猫(Pancham)**，基于 i18next 二次封装的多语言工具。

## 功能

- [x] 加载本地多语言内容
- [x] 加载远程 cdn 的多语言内容
- [x] localforage 缓存
- [x] keyMissing 功能拓展 - 缺失key上报

# 安装

```bash
# npm
npm i i18n-pancham

# pnpm
pnpm i i18n-pancham

# yarn
yarn add i18n-pancham
```

# 基本使用

```ts
// 导入
import i18nPancham from 'i18n-pancham';

// 初始化
i18nPancham.initialize({
  lng: 'zh-CN',
  fallbackLng: 'en-US',
});
```

# 参数

`i18n-pancham`完全支持 i18next 的参数配置，除此之外，还有一些其他额外增加的参数

## i18nPancham options

| 属性                     | 类型                               | 默认值 | 是否必填 | 描述            |
| ------------------------ | ---------------------------------- | ------ | -------- | --------------- |
| `enableMissingKeyReport` | `false \| IMissingKeyReportConfig` | `null` | 否       | 丢失key上报配置 |

### IMissingKeyReportConfig

| 属性              | 类型                                        | 默认值 | 是否必填 | 描述                    |
| ----------------- | ------------------------------------------- | ------ | -------- | ----------------------- |
| `reportFrequency` | `'high' \| 'hour' \| 'day'`                 | `hour` | 否       | 上报的频次              |
| `ignoreDefaultNs` | `boolean`                                   | `true` | 否       | 是否忽略默认的namespace |
| `reportAction`    | `(keysDto:Record<string,string[]>) => void` | `null` | 否       | 上报处理函数            |

### 示例
```ts
// 基础配置
import i18nPancham from 'i18n-pancham';

i18nPancham.initialize({
  enableMissingKeyReport: {
    reportFrequency: 'high',
    reportAction: (keysDto) => {
      console.log('start report', keysDto);
    }
  },
});

// vue使用
import App from './App.vue'
import i18nPancham from 'i18n-pancham';
import I18NextVue from 'i18next-vue'; // 插件包

const app = createApp(App);
app.use(I18NextVue, { i18next: i18nPancham.i18next })
app.mount('#app')

// react使用
import i18nPancham from '@monsters/i18n-pancham';
import { initReactI18next } from 'react-i18next';

i18nPancham.use(initReactI18next).initialize({
  react: {
    // ... react options 参考文档
  },
  enableMissingKeyReport: {
    reportFrequency: 'high',
    reportAction: (keysDto) => {
      console.log('start report', keysDto);
    }
  },
});
```


## backend options

| 属性             | 类型                                                               | 默认值 | 是否必填 | 描述                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------ | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `localLanguages` | `string[]`                                                         | `[]`   | 是       | 本地拥有的语言清单，`example: ['en-US']`                                                                                               |
| `modules`        | `string[]`                                                         | `[]`   | 是       | 需要加载的多语言模块，比如`app`、`dashboard`等                                                                                         |
| `moduleWithNs`   | `boolean`                                                          | `true` | 否       | 是否要将加载的 module 转成 namespace 加载                                                                                              |
| `dir`            | `((module: string, lang: string) => Promise<Record<string, any>>)` | `null` | 是       | 加载的本地语言内容，可通过`import`动态加载本地语言内容                                                                                 |
| `cdn`            | `string`                                                           | `null` | 否       | 需要加载的远程 cdn 地址，具体到文件，动态参数{namespace}以及{language}表示模块和语种，比如`https://xx.com/{namesapce}/{language}.json` |
| `cdnConf`        | `Record<string,string>`                                            | `null` | 否       | 语言映射远端需要加载的文件名，比如`cndConfig:{'en-US': 'en'}`                                                                          |
| `storage`        | `boolean`                                                          | `true` | 否       | 是否支持缓存读写                                                                                                                       |

### 示例

```ts
import i18nPancham from 'i18n-pancham';

// 初始化
i18nPancham.initialize({
  lng: 'zh-CN',
  fallbackLng: 'en-US',
  backend: {
    dir: async (module: string, lang: string) => {
      try {
        const messages = await import(`./i18n/langs/${module}/${lang}.json`);
        return messages;
      } catch (e) {
        return {};
      }
    },
    localLanguages: ['en-US'],
    modules: ['app', 'dashboard'],
    moduleWithNs: true,
    cdn: 'https://xx.com/{namespace}/{language}.json',
    cdnConf: {
      'en-US': 'en',
      'zh-CN': 'zhCN',
    },
  },
});
```

## detection options

| 属性             | 类型                                        | 默认值     | 是否必填 | 描述                                                                                                                 |
| ---------------- | ------------------------------------------- | ---------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `loader`         | `'cookies' \| 'storage' \| 'custom'`        | `cookies`  | 是       | 设置当前语种的存放位置，`storage`->本地localStorage，`cookies`->Cookie，`custom`->自定义，需搭配`customerLoader`使用 |
| `key`            | `string`                                    | `language` | 是       | `storage\|cookies`中的存放的key值                                                                                    |
| `cookieConfig`   | `CookieAttributes`                          | `null`     | 否       | `cookies`配置                                                                                                        |
| `customerLoader` | `{get:()=>string;set:(value:string)=>void}` | `null`     | 否       | 自定义语种的存取逻辑                                                                                                 |

### 示例
```ts
import i18nPancham from 'i18n-pancham';

i18nPancham.initialize({
  lng: 'zh-CN',
  fallbackLng: 'en-US',
  detection: {
    loader: 'custom', // storage|cookies|custom可选
    key: 'language',
    customerLoader: {
      set: (value: string) => {
        localStorage.setItem('language', value);
      },
      get: () => {
        const d = localStorage.getItem('language22');
        return d;
      }
    }
  }
});
```
