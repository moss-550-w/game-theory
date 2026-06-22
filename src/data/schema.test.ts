import { describe, expect, it } from 'vitest';
import { checkIntegrity, validateKnowledgeBase, type KnowledgeBase } from '@/data/schema';
import { knowledgeBase } from '@/data';

/** 构造一份最小合法知识库，供变异测试。 */
function makeValidKB(): KnowledgeBase {
  return {
    theories: [
      {
        id: 'nash',
        name: '纳什均衡',
        quadrant: 'bottom-right',
        themeColor: '#6C3483',
        oneLineDef: 'x',
        coreAssumptions: ['a'],
        equilibriumCondition: 'x',
        tags: ['non-cooperative'],
        scene: 'x',
      },
    ],
    events: [
      {
        id: 'nash-proposal',
        theoryId: 'nash',
        role: 'proposal',
        year: 1950,
        title: '纳什均衡',
        contributor: '纳什',
        contribution: 'x',
      },
    ],
    math: [{ id: 'kakutani', layer: 'core-theorem', name: '角谷', description: 'x' }],
    proofs: [
      {
        id: 'p1',
        conclusionId: 'nash-existence',
        toolId: 'kakutani',
        applicability: 'x',
        prosCons: 'x',
        summary: 'x',
      },
    ],
    relations: [],
    crosslinks: [{ historyNodeId: 'nash-proposal', mathToolId: 'kakutani', label: 'x' }],
    applications: [
      {
        id: 'auction',
        name: '拍卖',
        relatedTheories: ['nash'],
        milestones: [{ year: 1961, title: '维克里' }],
      },
    ],
  };
}

describe('真实知识库', () => {
  it('加载并通过完整校验', () => {
    expect(knowledgeBase.theories).toHaveLength(4);
    expect(checkIntegrity(knowledgeBase)).toEqual([]);
  });
});

describe('引用完整性 checkIntegrity', () => {
  it('合法知识库无错误', () => {
    expect(checkIntegrity(makeValidKB())).toEqual([]);
  });

  it('检出 event 指向不存在的理论', () => {
    const kb = makeValidKB();
    kb.events[0].theoryId = 'minimax';
    const errors = checkIntegrity(kb);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ entity: 'event', field: 'theoryId' });
  });

  it('检出 proof 指向不存在的数学工具', () => {
    const kb = makeValidKB();
    kb.proofs[0].toolId = 'ghost-tool';
    const errors = checkIntegrity(kb);
    expect(errors.some((e) => e.entity === 'proof' && e.field === 'toolId')).toBe(true);
  });

  it('检出 crosslink 断链与重复 id', () => {
    const kb = makeValidKB();
    kb.crosslinks[0].historyNodeId = 'ghost-node';
    kb.theories.push({ ...kb.theories[0] }); // 重复 id
    const errors = checkIntegrity(kb);
    expect(errors.some((e) => e.entity === 'crosslink')).toBe(true);
    expect(errors.some((e) => e.entity === 'theory' && e.message === '重复的 id')).toBe(
      true,
    );
  });
});

describe('validateKnowledgeBase', () => {
  it('断链时抛出聚合错误', () => {
    const kb = makeValidKB();
    kb.applications[0].relatedTheories = ['backward-induction'];
    expect(() => validateKnowledgeBase(kb)).toThrow(/引用完整性校验失败/);
  });
});
