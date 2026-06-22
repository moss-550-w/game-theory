import '@testing-library/jest-dom';

// jsdom 不实现 scrollTo；framer-motion 关键帧解析会调用它。
if (typeof window !== 'undefined' && !window.scrollTo) {
  window.scrollTo = () => {};
}

// jsdom 不实现 matchMedia；framer-motion 的 useReducedMotion 依赖它。
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
