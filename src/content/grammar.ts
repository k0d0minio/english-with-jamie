export type GrammarTopic = { slug: string; title: string; group: string; blurb: string };

export const grammarTopics: GrammarTopic[] = [
  { slug: "tenses-overview", title: "The tense system at a glance", group: "Verbs & time", blurb: "All twelve forms on one page, and which ones you actually need." },
  { slug: "present-perfect-vs-past-simple", title: "Present perfect vs past simple", group: "Verbs & time", blurb: "The most common B2 slip. When the past is finished and when it still matters." },
  { slug: "narrative-tenses", title: "Telling stories: narrative tenses", group: "Verbs & time", blurb: "Past simple, past continuous and past perfect working together." },
  { slug: "future-forms", title: "Talking about the future", group: "Verbs & time", blurb: "will, going to, present continuous, present simple: plans, predictions, timetables." },
  { slug: "conditionals", title: "Conditionals", group: "Verbs & time", blurb: "Zero to third, mixed, and the softer forms people actually use." },
  { slug: "modals", title: "Modal verbs", group: "Verbs & time", blurb: "Ability, permission, obligation, advice and guessing." },
  { slug: "passive", title: "The passive", group: "Sentence building", blurb: "When to hide the doer, and how to do it in every tense." },
  { slug: "reported-speech", title: "Reported speech", group: "Sentence building", blurb: "Backshift, pronoun and time changes, and when you can skip them." },
  { slug: "relative-clauses", title: "Relative clauses", group: "Sentence building", blurb: "who, which, that, whose, where; the commas that change meaning." },
  { slug: "questions", title: "Questions, tags and indirect questions", group: "Sentence building", blurb: "Sounding natural and polite when you ask for things." },
  { slug: "articles", title: "Articles: a, an, the, zero", group: "Words & phrases", blurb: "The rules, the exceptions, and the cases French speakers get wrong." },
  { slug: "prepositions-phrasal-verbs", title: "Prepositions and phrasal verbs", group: "Words & phrases", blurb: "Common collocations and the phrasal verbs you hear every day." },
  { slug: "linking-and-register", title: "Linking words and register", group: "Words & phrases", blurb: "Connecting ideas, and choosing formal vs casual language." },
  { slug: "punctuation-and-sentences", title: "Punctuation and sentence structure", group: "Words & phrases", blurb: "Commas, apostrophes, run-on sentences and word order." },
];

export const grammarGroups = [...new Set(grammarTopics.map((t) => t.group))];
