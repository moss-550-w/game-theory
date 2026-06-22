/**
 * 不动点求解器（纯函数，claude.md 第 83 行要求）。
 *
 * 几何替身：连续自映射 f:[0,1]→[0,1] 与对角线 y=x 的交点即不动点。
 * 服务证明树四条不动点定理证明路径：
 * - 布劳威尔（brouwer）：单值连续映射，交点恒存在
 * - 角谷（kakutani）：上半连续凸值「带状」对应，带与对角线相交即集值不动点
 * - 塔斯基（tarski）：单调映射，不动点集成格（有最小/最大元）
 * - 范美·格利克斯伯格（fan-glicksberg）：推广到连续策略空间（同样以带状呈现）
 */

export type Variant = 'brouwer' | 'kakutani' | 'tarski' | 'fan-glicksberg';

export interface Pt {
  x: number;
  y: number;
}

/** 集值不动点：带与对角线相交的闭区间。 */
export interface FixedInterval {
  start: number;
  end: number;
}

const EPS = 1e-4;
/** 聚类容差：合并采样间距（1/samples）级别的相邻根，避免恒等线返回大量重复解。 */
const CLUSTER_TOL = 0.02;

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/**
 * 在控制点定义的分段线性曲线上求 f(x)，结果钳制到 [0,1]（保证为自映射）。
 * 控制点按 x 排序后插值；x 越界时取最近端点值。
 */
export function evalCurve(points: Pt[], x: number): number {
  if (points.length === 0) return clamp01(x);
  const pts = [...points].sort((a, b) => a.x - b.x);
  if (x <= pts[0].x) return clamp01(pts[0].y);
  const last = pts[pts.length - 1];
  if (x >= last.x) return clamp01(last.y);
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (x <= b.x) {
      const t = (x - a.x) / (b.x - a.x || 1);
      return clamp01(a.y + t * (b.y - a.y));
    }
  }
  return clamp01(last.y);
}

function bisect(g: (x: number) => number, a: number, b: number): number {
  let lo = a;
  let hi = b;
  let glo = g(lo);
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2;
    const gm = g(mid);
    if (gm === 0) return mid;
    if (Math.sign(gm) === Math.sign(glo)) {
      lo = mid;
      glo = gm;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

/** 把邻近的根聚成一类，返回每类代表值（均值）。 */
function cluster(roots: number[], tol = CLUSTER_TOL): number[] {
  if (roots.length === 0) return [];
  const sorted = [...roots].sort((a, b) => a - b);
  const out: number[] = [];
  let bucket: number[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] <= tol) {
      bucket.push(sorted[i]);
    } else {
      out.push(bucket.reduce((s, v) => s + v, 0) / bucket.length);
      bucket = [sorted[i]];
    }
  }
  out.push(bucket.reduce((s, v) => s + v, 0) / bucket.length);
  return out;
}

/**
 * 求单值映射 f 与对角线的所有不动点（f(x)=x 的解）。
 * 采样 g(x)=f(x)-x，检测变号区间二分细化，并显式捕捉近零样本（处理恒等/贴线情形）。
 */
export function findFixedPoints(points: Pt[], samples = 200): number[] {
  const g = (x: number) => evalCurve(points, x) - x;
  const roots: number[] = [];
  let prevX = 0;
  let prevG = g(0);
  if (Math.abs(prevG) < EPS) roots.push(0);
  for (let i = 1; i <= samples; i++) {
    const x = i / samples;
    const gx = g(x);
    if (Math.abs(gx) < EPS) {
      roots.push(x);
    } else if (Math.abs(prevG) >= EPS && Math.sign(gx) !== Math.sign(prevG)) {
      roots.push(bisect(g, prevX, x));
    }
    prevX = x;
    prevG = gx;
  }
  return cluster(roots);
}

/**
 * 强制控制点的 y 非减（塔斯基：格上单调映射），并钳制到 [0,1]。
 * 用于拖拽时保持单调结构——任何点都不能被拖到比其前驱更低。
 */
export function clampMonotone(points: Pt[]): Pt[] {
  const pts = [...points].sort((a, b) => a.x - b.x);
  let prev = -Infinity;
  return pts.map((p) => {
    const y = Math.max(clamp01(p.y), prev);
    prev = y;
    return { x: p.x, y };
  });
}

/**
 * 求集值（带状）映射的不动点：满足 lower(x) ≤ x ≤ upper(x) 的 x 构成的闭区间。
 * 角谷 / 范美·格利克斯伯格定理的几何呈现。
 */
export function findSetValuedFixedPoints(
  lower: Pt[],
  upper: Pt[],
  samples = 200,
): FixedInterval[] {
  const tol = 1.5 / samples;
  const intervals: FixedInterval[] = [];
  let start: number | null = null;
  let prev = 0;
  for (let i = 0; i <= samples; i++) {
    const x = i / samples;
    const lo = evalCurve(lower, x);
    const up = evalCurve(upper, x);
    const inside = lo <= x + EPS && up >= x - EPS;
    if (inside && start === null) {
      start = x;
    } else if (!inside && start !== null) {
      intervals.push({ start, end: prev });
      start = null;
    }
    prev = x;
  }
  if (start !== null) intervals.push({ start, end: 1 });
  // 合并采样毛刺造成的相邻碎片
  return intervals.filter((iv) => iv.end - iv.start >= -tol);
}

/** 控制点横坐标（均匀锚点，仅纵坐标可拖，保证曲线始终是函数）。 */
export const ANCHOR_XS = [0, 0.25, 0.5, 0.75, 1] as const;

/** 各变体默认纵坐标（band 变体为「中心」高度，上下各扩 BAND_HALF_WIDTH）。 */
export const DEFAULT_YS: Record<Variant, number[]> = {
  // 单次穿越对角线：唯一不动点，演示「拽不掉」
  brouwer: [0.7, 0.75, 0.45, 0.3, 0.25],
  // 单调非减且多次贴/穿对角线：不动点集有最小与最大元
  tarski: [0.2, 0.45, 0.45, 0.75, 0.8],
  // 中心递减穿过对角线：带与对角线相交于一段区间
  kakutani: [0.6, 0.55, 0.45, 0.3, 0.2],
  'fan-glicksberg': [0.65, 0.6, 0.5, 0.35, 0.25],
};

/** band 变体上下半宽。 */
export const BAND_HALF_WIDTH = 0.12;

export const BAND_VARIANTS: Variant[] = ['kakutani', 'fan-glicksberg'];

export function isBandVariant(v: Variant): boolean {
  return BAND_VARIANTS.includes(v);
}
