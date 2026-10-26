/** STAR-method section. Appended to the evaluation prompt for behavioral questions only. */
export const STAR_INSTRUCTIONS = `STAR analysis (this is a behavioral question, so include "starAnalysis"):
- situation: did the candidate give a specific context (when, where, what project)?
- task: did they state their own responsibility or goal, not just the team's?
- action: did they describe concrete steps THEY took (using "I", not only "we")?
- result: did they state the outcome, ideally measurable, and what they learned?
For each part set "present" (true only if clearly covered) and write one or two sentences of "feedback" that say what is missing or good.
"starScore" is 0-10: how completely and proportionately the answer follows STAR (a result-less story caps at 6).`;

export const STAR_JSON_SHAPE = `"starAnalysis": {
    "situation": { "present": true, "feedback": "string" },
    "task":      { "present": true, "feedback": "string" },
    "action":    { "present": true, "feedback": "string" },
    "result":    { "present": false, "feedback": "string" },
    "starScore": 0
  }`;
