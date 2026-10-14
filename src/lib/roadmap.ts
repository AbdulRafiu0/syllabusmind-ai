import type {
  NodeStatus,
  PracticeQuestion,
  RoadmapEdge,
  RoadmapNode,
} from './types';

const LAYOUT_X = 250;
const LAYOUT_STEP_Y = 120;
const MAX_NODES = 12;
const DEFAULT_URL = 'https://docs.python.org/3/tutorial/';

interface CurriculumItem {
  label: string;
  resourceTitle: string;
  resourceUrl: string;
  practiceQuestion: PracticeQuestion;
}

/** Topics that match the diagnostic quiz, in teaching order. */
const CORE_CURRICULUM: CurriculumItem[] = [
  {
    label: 'Variables',
    resourceTitle: 'Python Tutorial: Numbers, Text and Variables',
    resourceUrl: 'https://docs.python.org/3/tutorial/introduction.html',
    practiceQuestion: {
      question: 'Which of these is a valid Python variable name?',
      options: ['2nd_place', 'user-name', '_user_name', 'class'],
      correctIndex: 2,
    },
  },
  {
    label: 'For/While Loops',
    resourceTitle: 'Python Tutorial: for and while Statements',
    resourceUrl: 'https://docs.python.org/3/tutorial/controlflow.html#for-statements',
    practiceQuestion: {
      question:
        'A while loop uses the condition "i < 3". If i starts at 0 and increases by 1 on every pass, how many times does the loop body run?',
      options: ['2', '3', '4', 'It never stops'],
      correctIndex: 1,
    },
  },
  {
    label: 'Functions & Scope',
    resourceTitle: 'Python Tutorial: Defining Functions',
    resourceUrl: 'https://docs.python.org/3/tutorial/controlflow.html#defining-functions',
    practiceQuestion: {
      question:
        'Which keyword lets a function reassign a variable defined at module level?',
      options: ['local', 'static', 'extern', 'global'],
      correctIndex: 3,
    },
  },
  {
    label: 'Lists & Indexing',
    resourceTitle: 'Python Tutorial: Lists',
    resourceUrl: 'https://docs.python.org/3/tutorial/introduction.html#lists',
    practiceQuestion: {
      question: 'Which index would you use to get the first item in a Python list?',
      options: ['1', '0', '-1', 'first'],
      correctIndex: 1,
    },
  },
  {
    label: 'Dictionaries',
    resourceTitle: 'Python Tutorial: Dictionaries',
    resourceUrl: 'https://docs.python.org/3/tutorial/datastructures.html#dictionaries',
    practiceQuestion: {
      question: 'What type of bracket is used to define a dictionary?',
      options: ['()', '[]', '{}', '<>'],
      correctIndex: 2,
    },
  },
  {
    label: 'Conditionals',
    resourceTitle: 'Python Tutorial: if Statements',
    resourceUrl: 'https://docs.python.org/3/tutorial/controlflow.html#if-statements',
    practiceQuestion: {
      question: 'Which keyword is used to check an additional condition if the previous conditions were false?',
      options: ['else', 'else if', 'elseif', 'elif'],
      correctIndex: 3,
    },
  }
];

/** Follow-up topics suggested after the core curriculum. */
const NEXT_CURRICULUM: CurriculumItem[] = [
  {
    label: 'Lists & Dictionaries',
    resourceTitle: 'Python Tutorial: Data Structures',
    resourceUrl: 'https://docs.python.org/3/tutorial/datastructures.html',
    practiceQuestion: {
      question: "Given d = {'a': 1}, how do you read the value stored under key 'a'?",
      options: ['d.a', "d['a']", 'd(a)', 'd->a'],
      correctIndex: 1,
    },
  },
  {
    label: 'List Comprehensions',
    resourceTitle: 'Python Tutorial: List Comprehensions',
    resourceUrl:
      'https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions',
    practiceQuestion: {
      question: 'What does [x * 2 for x in range(3)] produce?',
      options: ['[0, 2, 4]', '[2, 4, 6]', '[0, 1, 2]', '[1, 2, 3]'],
      correctIndex: 0,
    },
  },
  {
    label: 'Classes & Objects',
    resourceTitle: 'Python Tutorial: Classes',
    resourceUrl: 'https://docs.python.org/3/tutorial/classes.html',
    practiceQuestion: {
      question: 'Which method is called automatically when a new instance of a class is created?',
      options: ['__init__', '__start__', 'constructor', '__create_class__'],
      correctIndex: 0,
    },
  },
];

function normalise(value: string): string {
  return value.trim().toLowerCase();
}

function makeEdge(source: string, target: string, targetStatus: NodeStatus): RoadmapEdge {
  return {
    id: `e${source}-${target}`,
    source,
    target,
    animated: targetStatus !== 'mastered',
  };
}

/**
 * Deterministic demo roadmap used when no API key is configured or when the
 * model response cannot be used.
 */
export function buildMockRoadmap(
  strengths: string[],
  weaknesses: string[],
): { nodes: RoadmapNode[]; edges: RoadmapEdge[] } {
  const strong = new Set(strengths.map(normalise));
  const weak = new Set(weaknesses.map(normalise));

  const entries: Array<{ item: CurriculumItem; status: NodeStatus }> = [];

  for (const item of CORE_CURRICULUM) {
    const key = normalise(item.label);
    let status: NodeStatus = 'next';
    if (weak.has(key)) status = 'weak';
    else if (strong.has(key)) status = 'mastered';
    entries.push({ item, status });
  }

  for (const item of NEXT_CURRICULUM) {
    entries.push({ item, status: 'next' });
  }

  const nodes: RoadmapNode[] = entries.map(({ item, status }, index) => ({
    id: String(index + 1),
    type: 'custom',
    position: { x: LAYOUT_X, y: index * LAYOUT_STEP_Y },
    data: {
      label: item.label,
      status,
      resourceTitle: item.resourceTitle,
      resourceUrl: item.resourceUrl,
      practiceQuestion: item.practiceQuestion,
    },
  }));

  const edges: RoadmapEdge[] = nodes
    .slice(1)
    .map((node, index) => makeEdge(nodes[index].id, node.id, node.data.status));

  return { nodes, edges };
}

/* ------------------------------------------------------------------ */
/* Sanitising model output                                             */
/* ------------------------------------------------------------------ */

const STATUSES: NodeStatus[] = ['mastered', 'weak', 'next'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function safeUrl(value: unknown): string {
  const raw = nonEmptyString(value);
  if (!raw) return DEFAULT_URL;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.toString() : DEFAULT_URL;
  } catch {
    return DEFAULT_URL;
  }
}

function normalisePracticeQuestion(raw: unknown): PracticeQuestion | null {
  if (!isRecord(raw)) return null;
  const question = nonEmptyString(raw.question);
  if (!question || !Array.isArray(raw.options)) return null;

  const options = raw.options as unknown[];
  if (options.length < 2 || !options.every((o) => nonEmptyString(o) !== null)) return null;

  const correctIndex = typeof raw.correctIndex === 'number' ? raw.correctIndex : Number(raw.correctIndex);
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
    return null;
  }

  return {
    question,
    options: (options as string[]).map((o) => o.trim()),
    correctIndex,
  };
}

/**
 * Validates and normalises parsed model output into React Flow nodes/edges.
 * Returns null when the structure cannot be trusted.
 */
export function sanitizeRoadmap(
  raw: unknown,
): { nodes: RoadmapNode[]; edges: RoadmapEdge[] } | null {
  if (!isRecord(raw) || !Array.isArray(raw.nodes) || raw.nodes.length === 0) return null;

  const nodes: RoadmapNode[] = [];
  const seenIds = new Set<string>();

  for (const [index, item] of (raw.nodes as unknown[]).slice(0, MAX_NODES).entries()) {
    if (!isRecord(item) || !isRecord(item.data)) return null;

    const label = nonEmptyString(item.data.label);
    const practiceQuestion = normalisePracticeQuestion(item.data.practiceQuestion);
    if (!label || !practiceQuestion) return null;

    const status = STATUSES.includes(item.data.status as NodeStatus)
      ? (item.data.status as NodeStatus)
      : 'next';

    let id = nonEmptyString(item.id) ?? String(index + 1);
    if (seenIds.has(id)) id = `${id}-${index + 1}`;
    seenIds.add(id);

    const pos = isRecord(item.position) ? item.position : {};
    const x = typeof pos.x === 'number' && Number.isFinite(pos.x) ? pos.x : LAYOUT_X;
    const y = typeof pos.y === 'number' && Number.isFinite(pos.y) ? pos.y : index * LAYOUT_STEP_Y;

    nodes.push({
      id,
      type: 'custom',
      position: { x, y },
      data: {
        label,
        status,
        resourceTitle: nonEmptyString(item.data.resourceTitle) ?? `Learn ${label}`,
        resourceUrl: safeUrl(item.data.resourceUrl),
        practiceQuestion,
      },
    });
  }

  const statusById = new Map(nodes.map((n) => [n.id, n.data.status]));
  const edges: RoadmapEdge[] = [];
  const seenEdges = new Set<string>();

  if (Array.isArray(raw.edges)) {
    for (const item of raw.edges as unknown[]) {
      if (!isRecord(item)) continue;
      const source = nonEmptyString(item.source);
      const target = nonEmptyString(item.target);
      if (!source || !target || source === target) continue;
      if (!statusById.has(source) || !statusById.has(target)) continue;

      const id = `e${source}-${target}`;
      if (seenEdges.has(id)) continue;
      seenEdges.add(id);

      edges.push({
        id,
        source,
        target,
        animated:
          typeof item.animated === 'boolean' ? item.animated : statusById.get(target) !== 'mastered',
      });
    }
  }

  if (edges.length === 0) {
    for (let i = 1; i < nodes.length; i += 1) {
      edges.push(makeEdge(nodes[i - 1].id, nodes[i].id, nodes[i].data.status));
    }
  }

  return { nodes, edges };
}