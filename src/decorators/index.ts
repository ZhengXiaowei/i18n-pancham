/**
 * 防抖装饰器
 * 使用 @Debounce(300)
 * @param time
 * @constructor
 */
export const Debounce = (time = 3000) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (
    _target: Record<string, any>,
    _name: string,
    descriptor: TypedPropertyDescriptor<any>,
  ): any => {
    const func = descriptor.value;
    descriptor.value = function (...args: IArguments[]) {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        func.call(this, ...args);
      }, time);
    };
  };
};
