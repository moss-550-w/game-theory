/**
 * 知识库引用完整性校验脚本（CI 用，plan.md §4.2 / §8）。
 * 以 Node 方式读取并解析 YAML，复用 src/data/schema.ts 的同一套校验逻辑。
 * 断链或形状不符则以非零退出码失败。
 *   运行：npm run data:validate
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parse } from 'yaml';
import { validateKnowledgeBase } from '../src/data/schema';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, '..', 'src', 'data');

const load = (file: string): unknown =>
  parse(readFileSync(join(dataDir, `${file}.yaml`), 'utf8'));

try {
  const kb = validateKnowledgeBase({
    theories: load('theories'),
    events: load('events'),
    math: load('math'),
    proofs: load('proofs'),
    relations: load('relations'),
    crosslinks: load('crosslinks'),
    applications: load('applications'),
  });
  const counts = [
    `theories=${kb.theories.length}`,
    `events=${kb.events.length}`,
    `math=${kb.math.length}`,
    `proofs=${kb.proofs.length}`,
    `relations=${kb.relations.length}`,
    `crosslinks=${kb.crosslinks.length}`,
    `applications=${kb.applications.length}`,
  ].join(', ');
  console.log(`✓ 知识库校验通过：${counts}`);
} catch (err) {
  console.error('✗ 知识库校验失败：');
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
