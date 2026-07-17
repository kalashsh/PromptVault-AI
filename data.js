/**
 * data.js
 * Static configuration (categories) + first-visit seed data for PromptVault AI.
 * Nothing in this file touches LocalStorage directly — script.js decides
 * whether to use SAMPLE_PROMPTS (empty vault) or the user's saved data.
 */

// Category metadata: label -> accent color (used for card dot / badge)
const CATEGORIES = [
  { name: 'ChatGPT',      color: '#22D3AA' },
  { name: 'Claude',       color: '#7C5CFC' },
  { name: 'Gemini',       color: '#4F9BFF' },
  { name: 'Coding',       color: '#F5A623' },
  { name: 'Writing',      color: '#F06AAE' },
  { name: 'Business',     color: '#5AC8FA' },
  { name: 'Productivity', color: '#8BD450' },
  { name: 'Marketing',    color: '#FF8A65' },
  { name: 'Interview',    color: '#C792EA' }
];

// Helper to build a stable-ish id
function seedId(n) {
  return 'seed-' + String(n).padStart(3, '0');
}

// 20 sample prompts shown on first visit (empty LocalStorage)
const SAMPLE_PROMPTS = [
  {
    id: seedId(1),
    title: 'Professional Resume Bullet Rewriter',
    category: 'Writing',
    tags: ['resume', 'career', 'rewrite'],
    prompt: 'Rewrite the following resume bullet points to be achievement-focused, using strong action verbs and quantifiable results where possible. Keep each bullet under 20 words:\n\n[PASTE BULLET POINTS]',
    favorite: true,
    copyCount: 14,
    createdAt: '2025-01-04T09:00:00Z'
  },
  {
    id: seedId(2),
    title: 'React Interview Question Generator',
    category: 'Interview',
    tags: ['react', 'frontend', 'interview'],
    prompt: 'Act as a senior frontend interviewer. Generate 8 React interview questions ranging from beginner to advanced, covering hooks, performance optimization, and state management. Include a one-line answer hint for each.',
    favorite: true,
    copyCount: 21,
    createdAt: '2025-01-05T10:30:00Z'
  },
  {
    id: seedId(3),
    title: 'JavaScript Bug Explainer',
    category: 'Coding',
    tags: ['javascript', 'debugging', 'explain'],
    prompt: 'Here is a piece of JavaScript code that isn\'t working as expected. Explain what is wrong, why it happens, and provide a corrected version with comments:\n\n[PASTE CODE]',
    favorite: false,
    copyCount: 9,
    createdAt: '2025-01-06T11:15:00Z'
  },
  {
    id: seedId(4),
    title: 'Cold Outreach Email to a Client',
    category: 'Business',
    tags: ['sales', 'email', 'outreach'],
    prompt: 'Write a short, friendly cold outreach email to a potential client in the [INDUSTRY] industry, introducing [PRODUCT/SERVICE]. Keep it under 120 words, end with a soft call to action, avoid sounding salesy.',
    favorite: false,
    copyCount: 17,
    createdAt: '2025-01-06T14:00:00Z'
  },
  {
    id: seedId(5),
    title: 'ChatGPT System Persona Builder',
    category: 'ChatGPT',
    tags: ['persona', 'system-prompt', 'roleplay'],
    prompt: 'Create a detailed system prompt that turns ChatGPT into a [ROLE, e.g. "senior UX researcher"]. Include tone, expertise level, things it should always do, and things it should never do.',
    favorite: false,
    copyCount: 12,
    createdAt: '2025-01-07T08:45:00Z'
  },
  {
    id: seedId(6),
    title: 'Claude Long-Document Summarizer',
    category: 'Claude',
    tags: ['summary', 'documents', 'claude'],
    prompt: 'Summarize the following document in 3 sections: (1) a 2-sentence TL;DR, (2) key takeaways as bullet points, (3) any risks or open questions. Keep the whole summary under 200 words:\n\n[PASTE DOCUMENT]',
    favorite: true,
    copyCount: 26,
    createdAt: '2025-01-08T09:20:00Z'
  },
  {
    id: seedId(7),
    title: 'Gemini Multi-Step Trip Planner',
    category: 'Gemini',
    tags: ['travel', 'planning', 'gemini'],
    prompt: 'Plan a 5-day trip to [DESTINATION] for a traveler who likes [INTERESTS]. Include a day-by-day itinerary, estimated budget in USD, and 2 backup activities in case of bad weather.',
    favorite: false,
    copyCount: 8,
    createdAt: '2025-01-08T13:10:00Z'
  },
  {
    id: seedId(8),
    title: 'Weekly Priorities Planner',
    category: 'Productivity',
    tags: ['planning', 'weekly', 'focus'],
    prompt: 'I will list my open tasks for the week. Group them into "Must do", "Should do", and "Could wait", then suggest which 3 tasks to tackle first based on impact vs effort:\n\n[PASTE TASK LIST]',
    favorite: false,
    copyCount: 11,
    createdAt: '2025-01-09T07:50:00Z'
  },
  {
    id: seedId(9),
    title: 'Instagram Caption Generator',
    category: 'Marketing',
    tags: ['social-media', 'instagram', 'copywriting'],
    prompt: 'Write 5 Instagram caption variations for a post about [TOPIC/PRODUCT]. Each should have a different hook style (question, bold statement, story, stat, humor), include relevant emojis, and end with a call to action.',
    favorite: true,
    copyCount: 19,
    createdAt: '2025-01-09T15:30:00Z'
  },
  {
    id: seedId(10),
    title: 'Behavioral Interview Answer (STAR)',
    category: 'Interview',
    tags: ['star-method', 'behavioral', 'career'],
    prompt: 'Help me structure an answer to the interview question "[QUESTION]" using the STAR method (Situation, Task, Action, Result), based on this experience:\n\n[PASTE EXPERIENCE NOTES]',
    favorite: false,
    copyCount: 15,
    createdAt: '2025-01-10T10:00:00Z'
  },
  {
    id: seedId(11),
    title: 'Code Refactor for Readability',
    category: 'Coding',
    tags: ['refactor', 'clean-code', 'review'],
    prompt: 'Refactor the following code for readability and maintainability without changing its behavior. Explain each change in a short comment above it:\n\n[PASTE CODE]',
    favorite: false,
    copyCount: 13,
    createdAt: '2025-01-10T16:45:00Z'
  },
  {
    id: seedId(12),
    title: 'Business Plan Executive Summary',
    category: 'Business',
    tags: ['startup', 'pitch', 'summary'],
    prompt: 'Write a one-page executive summary for a business plan for [BUSINESS IDEA]. Include the problem, solution, target market, revenue model, and a one-sentence vision statement.',
    favorite: false,
    copyCount: 6,
    createdAt: '2025-01-11T09:15:00Z'
  },
  {
    id: seedId(13),
    title: 'ChatGPT Socratic Tutor',
    category: 'ChatGPT',
    tags: ['learning', 'tutor', 'socratic'],
    prompt: 'Act as a Socratic tutor teaching me [TOPIC]. Never give me the answer directly — instead ask me guiding questions one at a time until I arrive at the answer myself.',
    favorite: false,
    copyCount: 22,
    createdAt: '2025-01-11T12:40:00Z'
  },
  {
    id: seedId(14),
    title: 'Claude Contract Clause Explainer',
    category: 'Claude',
    tags: ['legal', 'contracts', 'plain-english'],
    prompt: 'Explain the following contract clause in plain English, then list any red flags a non-lawyer should be aware of before signing:\n\n[PASTE CLAUSE]',
    favorite: false,
    copyCount: 7,
    createdAt: '2025-01-12T08:00:00Z'
  },
  {
    id: seedId(15),
    title: 'Gemini Recipe from Leftover Ingredients',
    category: 'Gemini',
    tags: ['cooking', 'recipe', 'food'],
    prompt: 'I have the following ingredients at home: [LIST INGREDIENTS]. Suggest 3 recipes I could make, ranked by how few extra ingredients they need, with rough cook time for each.',
    favorite: false,
    copyCount: 10,
    createdAt: '2025-01-12T18:20:00Z'
  },
  {
    id: seedId(16),
    title: 'Daily Standup Note Formatter',
    category: 'Productivity',
    tags: ['standup', 'agile', 'work'],
    prompt: 'Turn these rough notes into a clean daily standup update with three sections — Yesterday, Today, Blockers. Keep it concise and professional:\n\n[PASTE ROUGH NOTES]',
    favorite: true,
    copyCount: 18,
    createdAt: '2025-01-13T07:30:00Z'
  },
  {
    id: seedId(17),
    title: 'SEO Blog Title Brainstorm',
    category: 'Marketing',
    tags: ['seo', 'blog', 'titles'],
    prompt: 'Generate 10 SEO-friendly blog post titles about [TOPIC], optimized for the keyword "[KEYWORD]". Mix listicles, how-tos, and question-based titles.',
    favorite: false,
    copyCount: 24,
    createdAt: '2025-01-13T14:10:00Z'
  },
  {
    id: seedId(18),
    title: 'System Design Interview Warmup',
    category: 'Interview',
    tags: ['system-design', 'architecture', 'senior'],
    prompt: 'Ask me a system design interview question appropriate for a [SENIORITY] engineer role (e.g. design a URL shortener). After I answer, critique my design and point out what I missed.',
    favorite: false,
    copyCount: 16,
    createdAt: '2025-01-14T09:50:00Z'
  },
  {
    id: seedId(19),
    title: 'Unit Test Generator',
    category: 'Coding',
    tags: ['testing', 'unit-tests', 'quality'],
    prompt: 'Write unit tests for the following function, covering typical inputs, edge cases, and invalid inputs. Use clear, descriptive test names:\n\n[PASTE FUNCTION]',
    favorite: false,
    copyCount: 20,
    createdAt: '2025-01-14T17:05:00Z'
  },
  {
    id: seedId(20),
    title: 'Career Change Pitch',
    category: 'Business',
    tags: ['career', 'pitch', 'networking'],
    prompt: 'Help me write a short elevator pitch (under 60 words) explaining my career change from [OLD FIELD] to [NEW FIELD], for use in networking conversations and LinkedIn messages.',
    favorite: false,
    copyCount: 5,
    createdAt: '2025-01-15T10:25:00Z'
  }
];
