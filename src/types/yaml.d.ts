/** @rollup/plugin-yaml 将 .yaml 文件作为已解析的 JS 对象导入。 */
declare module '*.yaml' {
  const data: unknown;
  export default data;
}
