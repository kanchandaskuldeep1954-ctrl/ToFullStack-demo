import { Lesson, Badge, RoadmapStage } from './types';

export const SYSTEM_PROMPT = `
You are "Vibe" - a 22-year-old coding mentor who's already built 3 startups. 

PERSONALITY TRAITS:
- You say "bet" when users do something right
- You say "W" (win) for big accomplishments  
- You say "cooking" when they're making progress
- You roast gently: "That div is more lost than me at 3am"
- You celebrate: "YOOO THAT'S CRAZY GOOD" (caps for excitement)
- You relate everything to real life: "This is like... [analogy]"

RESPONSE RULES:
- MAX 15 words normally, 25 when explaining
- Use lowercase for chill vibes, CAPS for hype
- Ask questions: "why'd you choose a div there?" 
- Give specific praise: "that semantic HTML is chef's kiss"
- Drop hints, don't give full answers: "what if you tried..."

CATCHPHRASES (use sparingly):
- "We cooking now"
- "That's fire ngl"  
- "Different breed"
- "Understood the assignment"
- "No cap"

NEVER be formal. Never say "Great job!" Say "yooo this goes hard" instead.
`;

export const DEMO_RESPONSES: Record<string, string> = {
  default: "Yo! I'm in Demo Mode. Connect your API key to hear my real voice! For now: Try typing <h1>Hello</h1> and hit Run.",
  start: "Let's get it! First mission: Create a header. Delete the code and type <h1>My Vibe</h1>.",
  help: "An <h1> tag is for your main title. Just wrap your text like this: <h1>Your Title</h1>.",
  run: "I see you! Code looks interesting. (Set up API key for real feedback!)",
};

export const BADGES: Badge[] = [
  { id: 'b1', name: 'HTML Rookie', icon: '🐣', description: 'Wrote your first tag', unlocked: false },
  { id: 'b2', name: 'Tag Master', icon: '🏷️', description: 'Mastered the basics', unlocked: false },
  { id: 'b3', name: 'Vibe Coder', icon: '✨', description: 'Completed Level 3', unlocked: false },
  { id: 'b4', name: 'Full Stack Future', icon: '🚀', description: 'Ready for the big leagues', unlocked: false },
];

export const ROADMAP: RoadmapStage[] = [
  {
    id: 'html',
    title: 'HTML: The Skeleton',
    description: 'Structure your content so the world can see it.',
    duration: '1 Week',
    status: 'active',
    topics: ['Tags', 'Forms', 'SEO Basics']
  },
  {
    id: 'css',
    title: 'CSS: The Drip',
    description: 'Make it look fire. Colors, layouts, animations.',
    duration: '2 Weeks',
    status: 'locked',
    topics: ['Flexbox', 'Grid', 'Responsive']
  },
  {
    id: 'js',
    title: 'JS: The Brains',
    description: 'Make it interactive. Logic, data, and magic.',
    duration: '3 Weeks',
    status: 'locked',
    topics: ['Variables', 'Functions', 'DOM']
  },
  {
    id: 'react',
    title: 'React: The Power',
    description: 'Build massive apps like a pro.',
    duration: '4 Weeks',
    status: 'locked',
    topics: ['Components', 'Hooks', 'State']
  },
  {
    id: 'backend',
    title: 'Backend: The Soul',
    description: 'Databases, servers, and real user data.',
    duration: '4 Weeks',
    status: 'locked',
    topics: ['Node.js', 'SQL', 'API']
  }
];

export const LESSONS: Lesson[] = [
  {
    id: 1,
    title: "The Headline",
    objective: "Create an <h1> tag with your name or nickname inside it.",
    initialCode: "<!-- Delete this and start cooking! -->\n",
    validationCriteria: "Code must contain a valid <h1> tag with some text content.",
    xpReward: 100,
    badgeReward: 'b1',
    why: "The <h1> tag is the most important title on your page. Search engines use it to understand what your website is about."
  },
  {
    id: 2,
    title: "The Bio",
    objective: "Add a <p> tag below the header to describe your vibe.",
    initialCode: "<h1>My Vibe</h1>\n",
    validationCriteria: "Code must contain a <p> tag with text, after the <h1>.",
    xpReward: 150,
    badgeReward: 'b2',
    why: "Paragraphs (<p>) organize your text so it's readable. Nobody likes reading a messy wall of text!"
  },
  {
    id: 3,
    title: "Interaction",
    objective: "Add a <button> tag that says 'Click Me'.",
    initialCode: "<h1>My Vibe</h1>\n<p>Just coding things.</p>\n",
    validationCriteria: "Code must contain a <button> element with text content.",
    xpReward: 200,
    badgeReward: 'b3',
    why: "Buttons are how users take action—buying, subscribing, or liking. They turn a document into an app."
  }
];
