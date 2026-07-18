import { GoogleGenAI, Type, Modality, ThinkingLevel } from "@google/genai";
import { ChatMessage, Chapter, NovelBlueprint, AIModel, CliffhangerType } from "../types";

export let globalExtendedThinking = true;
export const setExtendedThinking = (enabled: boolean) => {
  globalExtendedThinking = enabled;
};

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// @ts-ignore
const originalGenerateContent = ai.models.generateContent.bind(ai.models);
// @ts-ignore
ai.models.generateContent = async (params: any) => {
  if (params.model && params.model.startsWith("gemini-3")) {
    params.config = params.config || {};
    params.config.thinkingConfig = {
      thinkingLevel: globalExtendedThinking ? ThinkingLevel.HIGH : ThinkingLevel.MINIMAL
    };
  }
  return originalGenerateContent(params);
};

const ttsModel = "gemini-2.5-flash-preview-tts";

const IMMERSION_AND_WORLD_RULES = `

**[ORIGINALITY AND COPYRIGHT RULES (CRITICAL)]**
You are strictly instructed to NEVER copy any available web novel, existing story, or published work. You must use your own creativity to generate completely new and original content. Avoiding copyright issues is of utmost importance. DO NOT plagiarize under any circumstances.

**[DEEP IMMERSION & WRITING RULES]**
You are writing a deeply immersive, detail-rich novel. Your single most important rule is this:
NEVER skip, summarise, or gloss over any moment of a character's lived experience — UNLESS that moment passes the Dead Time Test defined below.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◈  THE GOLDEN RULE — LIVE EVERY MOMENT IN FULL

Every scene must flow like a real human day. The reader must feel they ARE the character — not reading about them. Before writing any scene, ask:

  "If I were this character right now, what would I physically feel, see, smell, hear, taste, think, and decide next?"

Then write exactly that. Nothing jumps. Nothing skips. Unless the Dead Time Test grants permission (see below).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◈  THE DEAD TIME TEST — SPECIAL SKIP PERMISSION  ★

You MAY skip a period of time ONLY when ALL five conditions below are simultaneously true. If even one condition fails, you must write it.

  CONDITION 1 — NO STORY VALUE
  Nothing that happens during this time affects the plot, a relationship, a character's state of mind, or the world. Ask: "If I removed this entirely, would anything be lost?" If the answer is yes — even slightly — you cannot skip it.

  CONDITION 2 — NO EMOTIONAL SHIFT
  The character's emotional state does not change during this time. No new worry surfaces. No mood lifts or drops. No small realisation forms. Pure emotional flatline. If there is any feeling happening, you must write it.

  CONDITION 3 — NO SENSORY INTEREST
  The environment during this time holds nothing worth noticing — no unusual sound, smell, sight, or texture that could deepen the reader's sense of the world. Completely inert surroundings.

  CONDITION 4 — NO THOUGHT WORTH HAVING
  The character's mind is genuinely blank during this time — no stray memory, no quiet anxiety, no idle curiosity, no planning. If any thought could naturally arise, you must be there for it.

  CONDITION 5 — TIME GAP IS BRIEF OR DEEPLY ROUTINE
  The skipped period is either:
    (a) short — under 30 minutes of story time, OR
    (b) a repeated routine the reader has already seen in full at least once earlier in the same novel (e.g. a commute route already described in detail in a prior chapter).
  Skipping hours of a character's first-time experience is never permitted, regardless of how "uneventful" it seems.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◈  HOW TO EXECUTE A PERMITTED SKIP — THE BRIDGE LINE

When all five conditions are met and a skip is granted, you must NOT silently jump. You must insert a single Bridge Line that:
  · Acknowledges the passing time explicitly
  · Names approximately how much time passed
  · Drops one micro-detail that keeps the world feeling real
  · Lands the character cleanly in the next moment

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◈  WHAT CAN NEVER BE SKIPPED — HARD PROTECTED MOMENTS

Even if all five Dead Time conditions appear to be met, the following moments are permanently protected and must always be written in full:
  PROTECTED MOMENT 1 — FIRST EXPERIENCE OF ANY LOCATION: The very first time a character enters any new place must be written fully: arrival, atmosphere, first impression, body reaction. Never skip a first visit, no matter how mundane.
  PROTECTED MOMENT 2 — ANY MORNING THAT OPENS A NEW CHAPTER: Every day that begins a chapter must open with waking. The reader must be eased into the new day through the character's body and senses — never dropped into the action.
  PROTECTED MOMENT 3 — ANY JOURNEY AFTER A MAJOR EVENT: If something significant just happened — a fight, a revelation, a loss, a decision — the journey that follows (walk home, drive back, commute) is emotionally loaded and must be written. The character's mind will be full. You must be inside it.
  PROTECTED MOMENT 4 — THE LAST HOUR BEFORE SLEEP: The wind-down before sleep is where the day is processed. This is prime interior life territory. It may never be skipped.
  PROTECTED MOMENT 5 — ANY MOMENT OF PHYSICAL CHANGE: Eating, illness, injury, physical exhaustion, arousal, pain, relief — any moment where the body shifts state must be written.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◈  DAILY LIFE CONTINUITY — MANDATORY COVERAGE

Cover all of the following whenever they occur in the timeline:
  · MORNING ROUTINE: Waking up, bathroom, getting dressed, breakfast, checking phone.
  · TRAVEL & COMMUTE: Leaving home, mode of transport, arrival.
  · AT LOCATION: Settling in, time passing, interactions, physical needs.
  · MEALS & BREAKS: What is eaten/drunk, context, how the body feels.
  · EVENING / RETURNING HOME: Journey back, entering home, unwinding, evening routine.
  · SLEEP & NEXT DAY BRIDGE: Falling asleep. Every new day opens with waking.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◈  SENSORY IMMERSION — ALL FIVE SENSES, EVERY SCENE

At least THREE per scene (SIGHT, SOUND, SMELL, TOUCH, TASTE). Body sensations are mandatory (heart rate, stomach tightening, tired eyes, aching muscles, dry mouth, goosebumps, breathing, hunger).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◈  INTERNAL LIFE — THOUGHTS, FEELINGS & MICRO-DECISIONS

Every few paragraphs, check in with the character's inner world:
  · What are they currently thinking about? What emotion sits in their chest right now? What do they want in this exact moment? What tiny decision are they making? What memory or worry has just floated into their mind?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◈  TIME MUST FLOW VISIBLY

The reader must always know: what time it is, how much time has passed, and how much time remains before the next obligation. Use timestamps physically feeling like time passing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◈  ENVIRONMENT IS ALIVE — NEVER STATIC

Weather affects mood, other people exist in the background, locations hold consistent details, objects have weight, time of day changes light/noise.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◈  CHAPTER ENDINGS — MANDATORY CLIFFHANGER WITH "?"

Every single chapter MUST end on a cliffhanger. No exceptions.
The final sentence of every chapter must end with "?"
  · TYPE A (SHOCKING DISCOVERY), TYPE B (IMPOSSIBLE CHOICE), TYPE C (UNSEEN DANGER), TYPE D (BROKEN CERTAINTY), TYPE E (UNFINISHED ACTION).
  · Build tension across the final 3–5 lines before the question. Never use the same cliffhanger twice in a row. The "?" must be the very last character of the chapter.
  · PROHIBITED ENDINGS: Full stop of resolution, comfort, fact with no tension, question tacked on as an afterthought.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◈  PROHIBITED SHORTCUTS — NEVER DO THESE
  ✗ "Later that day, he arrived." → show the journey
  ✗ "She got ready quickly." → show what quick looks like
  ✗ "Time passed." → time is experienced, not passed
  ✗ "He felt nervous." → show it in the body
  ✗ Jumping to a new day without opening on waking
  ✗ Skipping without a Bridge Line even on a permitted skip

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The goal: readers should feel they have LIVED these days — not read a summary of them. Write so they forget they are reading. End every chapter so they are physically unable to stop.
`;

const PROSE_AND_DIALOGUE_RULES = `

**[DIALOGUE-FIRST WRITING RULES (MANDATORY — DO NOT SKIP)]**
Every episode/chapter you write MUST follow this strict ratio:
  • Dialogue & spoken exchanges           → 85% to 90% of total word count
  • Background, scene-setting & narration → 10% to 15% of total word count

════════════════════════════════════════════════════
RULE 0 — ATTRIBUTION (THE GOLDEN RULE — APPLIES TO EVERY LINE)
════════════════════════════════════════════════════

NEVER write a character's name as a naked label before their dialogue.
NO colons. NO "Character:" format. NO screenplay-style headings.
This is prose fiction — not a script, not a chat log.

Instead, every spoken line must be anchored with context that tells the
reader THREE things woven naturally into the sentence or beat around it:

  WHO  is speaking
  TO WHOM  they are speaking
  WHY  they are saying it — the intention, emotion, or agenda behind the words

The "why" is the most important. It is what separates a living scene from
a transcript. The reader must always feel the pressure behind each line.

────────────────────────────────────────────────────

  ✗ WRONG — naked name label (screenplay / chat-log style):
      Arjun: "Teen saal se main tera intezaar kar raha tha."
      Zara: "Mujhe pata tha."
      Arjun: "Phir kyun nahi aayi?"
      Zara: "Kyunki tu maang nahi raha tha — tu sirf wait kar raha tha."

  ✗ ALSO WRONG — name before dialogue with no context:
      Arjun said, "Teen saal se main tera intezaar kar raha tha."
      Zara said, "Mujhe pata tha."
      Arjun said, "Phir kyun nahi aayi?"
      Zara said, "Kyunki tu maang nahi raha tha."

  ✓ CORRECT — WHO + TO WHOM + WHY, woven into the scene:
      Arjun had been holding that line inside him for three years. He
      finally said it — not loudly, not accusingly, just the way you say
      a thing when you've run out of reasons not to.
      "Teen saal se main tera intezaar kar raha tha."

      Zara didn't look surprised. That was what hurt most.
      "Mujhe pata tha," she said, to the floor more than to him.

      He stepped closer — not angry, just desperate to understand.
      "Phir kyun nahi aayi?"

      She looked up then. And what she said next was not cruel —
      it was simply, devastatingly true.
      "Kyunki tu maang nahi raha tha. Tu sirf wait kar raha tha."

────────────────────────────────────────────────────

HOW TO ANCHOR ATTRIBUTION (choose the best fit for each moment):

  METHOD A — Before the line (speaker's state or intention first):
      Desperate to change the subject, Rehan turned to the inspector.
      "Warrant hai aapke paas? Dikhao pehle."

  METHOD B — After the line (reaction or action reveals the speaker):
      "Main wahan tha — lekin maine kuch nahi kiya."
      Dev's voice was steady. Too steady. The kind of steady that
      takes practice.

  METHOD C — Split across the line (embed mid-dialogue for intimacy):
      "Ek kaam karo," Priya said, leaning across the table so only
      Kabir could hear, "apni wife ko phone karo — abhi — aur pooch lo
      woh 11 baje kahan thi."

  METHOD D — Through another character's reaction (shows both speakers):
      Vikram's question landed like a slap.
      "Tumne usse bata diya?"
      Nisha's silence was the answer. It was also the confession.

  METHOD E — Through physical action alone (no tag needed at all):
      Arjun set the file on the table, face-down.
      "Ye sign karo. Abhi."
      The minister's pen hovered above the paper and did not move.

────────────────────────────────────────────────────

LONG CONVERSATION RULE (3+ characters in the same scene):
When three or more characters speak in sequence, you may drop the
attribution tag from the middle speaker — but you must re-anchor
clearly by the third exchange so the reader never has to count back.

  ✓ EXAMPLE (three speakers, no confusion):
      The silence broke first from Kabir's side of the table.
      "Hum yahan isliye nahi aaye the."

      "Toh kisliye aaye the?" Rehan's tone was almost polite.

      Priya had heard enough. She stood up before anyone could stop her.
      "Hum aaye the kyunki tumne bulaya tha —" she looked directly at
      Rehan "— aur hum ja rahe hain kyunki main keh rahi hoon."

════════════════════════════════════════════════════
DIALOGUE RULES (85–90%)
════════════════════════════════════════════════════

RULE 1 — SHOW THROUGH SPEECH
Every revelation, conflict, and emotion must emerge from what characters
say. Do NOT summarise feelings in narration — let the character speak it.

  ✗ WRONG (narration does the work):
      Arjun was angry. He had trusted Rehan and Rehan had betrayed him.
      He felt like his whole world had collapsed.

  ✓ CORRECT (speech does the work):
      "Teen saal." The word came out quieter than Arjun expected — quiet
      the way a fire is quiet just before it takes the whole room.
      "Teen saal maine teri baat pe aankh band karke bharosa kiya —
      aur tu yahi karne ke liye ruka tha?"
      Rehan opened his mouth. Closed it.
      "Bol." Arjun's jaw tightened. "Abhi bol."

────────────────────────────────────────────────────

RULE 2 — VOICE DISTINCTION
Every character must have a unique speech rhythm. The reader must identify
who is speaking from the words alone — without any tag.

  ✗ WRONG (all voices sound identical):
      "I think we should be more careful," Arjun said.
      "I agree, we must consider the consequences," Rehan replied.
      "Yes, the consequences are very serious," Priya added.

  ✓ CORRECT (three distinct voices):
      Arjun cracked his knuckles — his way of ending a debate before
      it started. "Yaar, seedha baat karte hain. Kaam karna hai ya nahi?"

      Rehan adjusted his glasses and took his time.
      "There are several variables we haven't accounted for yet.
      Rushing would be statistically unwise."

      Priya had been listening to both of them for ten minutes too long.
      "Tum dono phir se shuru ho gaye," she said, and laughed —
      short, sharp, done.

────────────────────────────────────────────────────

RULE 3 — SUBTEXT IS MANDATORY
At least 40% of dialogue must carry a hidden layer. Characters rarely say
exactly what they mean. Use deflection, loaded silences, and half-truths.

  ✗ WRONG (no subtext — characters say exactly what they feel):
      "Main tumse pyaar karta hoon," Vikram said directly.
      "Main bhi," Zara replied. "Phir hum saath kyun nahi hain?"
      "Kyunki main darr gaya tha," he admitted.

  ✓ CORRECT (same emotion — buried under ordinary words):
      He picked up her coffee cup — the one she always left on his desk —
      and set it back down without drinking from it.
      "Tumhara naya ghar kaisa hai?"

      Zara looked at him for just a moment too long.
      "Theek hai. Quiet."
      "Quiet achha hota hai."
      "Haan." She turned toward the window. "Hota hai."
      The word sat between them like something neither wanted to touch.

────────────────────────────────────────────────────

RULE 4 — NATURAL FLOW
Use contractions, interruptions (—), trailing thoughts (...), overlapping
speech, and authentic filler words that match each character's background.

  ✗ WRONG (stiff, no rhythm):
      "I did not do what you are saying I did," Kabir said.
      "The evidence suggests otherwise," the inspector replied.

  ✓ CORRECT (natural rhythm, real speech):
      Kabir had been in this chair for forty minutes. He leaned forward,
      voice stripped down to its last layer of patience.
      "Main — dekho, maine kuch nahi—"
      "Kabir."
      The inspector didn't raise his voice. He didn't need to.
      Kabir sat back. Folded his arms. Made his decision.
      "Lawyer. Abhi. Please."
      A pause the length of a held breath.
      "Sure," the inspector said, and smiled.

────────────────────────────────────────────────────

RULE 5 — REACTIVE BEATS (1 sentence max between exchanges)
After every 3–4 lines of dialogue, insert one brief physical or internal
reaction to ground the scene. One sentence only — never more.

  ✗ WRONG (reaction too long — kills momentum):
      "Tune mujhe dhoka diya," Riya said sharply.
      Dev felt his heart sink. He thought about all the evenings they
      had spent together, all the promises under that old neem tree.
      His hands trembled as the weight of her words settled on him
      like a heavy blanket he could not shake off.
      "Riya, sun—"

  ✓ CORRECT (one beat — enough):
      The accusation cut straight through him —
      "Tune mujhe dhoka diya."
      — and Dev had no answer that would survive the next ten seconds.
      "Riya, sun—"
      "Mat bol mujhe." She stepped back. "Kuch mat bol abhi."

────────────────────────────────────────────────────

RULE 6 — PUNCHLINES & SHAYARIS
Hero/villain confrontations must include a punchline or shayari that
crystallises the scene's theme in 1–2 sentences.

  STRUCTURE: Tension buildup → opponent speaks → pause → THE LINE → reaction.

  ✗ WRONG (generic, no weight):
      "Tu mujhe nahi rok sakta," the villain said.
      "Main zaroor rokonga," the hero replied confidently.

  ✓ CORRECT (punchline with earned silence):
      Raghav looked at everything Arjun had left — no weapon, no ally,
      no exit — and smiled the way men smile when they have already won.
      "Ab kya karega? Akela hai. Haara hua hai."
      Arjun looked at the ground. A long moment.
      Then he looked up.
      "Sher kabhi ginti nahi karta — woh sirf humla karta hai."
      The smile faded. And the room got very quiet.

  ✓ SHAYARI EXAMPLE (romantic, earned by the scene):
      Zara had her hand on the door. She had said everything there was
      to say and some things there wasn't. Vikram didn't stop her.
      He just said, quietly, to no one in particular —
      "Jo roshni thi meri aँkhon mein, woh teri wajah se thi —
       ab andhera bhi तेरा ही तोहफा है."
      She didn't leave. Not that night.

────────────────────────────────────────────────────

RULE 7 — DIALOGUE TAGS
Vary them. Never repeat the same tag twice on the same page.
Strong verb + minimal adverb. Let action replace tags wherever possible.

  ✗ WRONG:
      "Mujhe pata tha," he said. "Tumhe pata tha," she said.
      "Sab ko pata tha," the inspector said loudly and angrily.

  ✓ CORRECT:
      "Mujhe pata tha," he said, not looking up.
      "Tumhe pata tha." Her voice was flat — the kind of flat that
      has been pressed down for a very long time.
      The inspector leaned forward. "Sab. Ko. Pata. Tha."

════════════════════════════════════════════════════
BACKGROUND / SCENE RULES (20–30%)
════════════════════════════════════════════════════

RULE 1 — PURPOSEFUL DESCRIPTION ONLY
Every narration sentence must do one of these three jobs:
  (a) establish mood   (b) plant a story clue   (c) give information
  dialogue cannot give. Cut anything that is merely decorative.

  ✗ WRONG (decorative, earns nothing):
      The room had white walls. A table stood in the center.
      A ceiling fan turned slowly. Windows were half-open.

  ✓ CORRECT (every sentence earns its place):
      The interrogation room smelled of old sweat and fresh lies.
      Someone had scratched a name into the corner of the table —
      the same name that appeared on page four of the case file.

────────────────────────────────────────────────────

RULE 2 — SENSORY MICRO-FLASHES (1–3 sentences max per block)
Multi-sense description in compact bursts. No long paragraphs.

  ✗ WRONG (paragraph-length — breaks rhythm):
      The market was chaotic. Vendors shouted from every direction.
      The smell of jalebi mixed with exhaust fumes. Children ran
      between stalls. Flies buzzed near the meat section. The afternoon
      sun turned the tin roofs gold and made everything shimmer.

  ✓ CORRECT (same scene — three sharp strokes):
      Jalebi smoke. Diesel fumes. Someone's phone blaring a wedding
      song from three stalls down. The market swallowed them whole.

────────────────────────────────────────────────────

RULE 3 — NO DEAD TIME
Do not narrate routine actions unless they carry emotional or plot weight.
Skip directly to the moment that matters.

  ✗ WRONG:
      Arjun woke at 7 AM. Brushed his teeth, got dressed, went
      downstairs. Made chai. Sat at the kitchen table. His phone rang.

  ✓ CORRECT:
      His phone rang while the chai was still too hot to drink.

────────────────────────────────────────────────────

RULE 4 — ENVIRONMENT MIRRORS EMOTION
The setting must reflect the POV character's internal state.

  ✓ TENSE SCENE:
      The office light buzzed and flickered. The contract lay between
      them like a blade neither wanted to pick up first.

  ✓ ROMANTIC SCENE:
      The balcony smelled of rain-wet marigold. The city below had
      gone quiet for once — as if it, too, was holding its breath.

  ✓ GRIEF SCENE:
      The house was exactly as she had left it. That was the worst part.

────────────────────────────────────────────────────

RULE 5 — CHAPTER TRANSITIONS (one evocative line only)
Close one scene and open the next with a single line that creates
curiosity or dread. Never a paragraph — one line only.

  ✗ WRONG (paragraph transition):
      The meeting ended. Everyone went home. The next day arrived
      slowly at first, then all at once. Arjun was first at the warehouse.

  ✓ CORRECT (one line — reader turns the page):
      The envelope slid under his door at 3 AM had no name on it.
      Just an address. And a single word: "Aaja."

════════════════════════════════════════════════════
SELF-AUDIT CHECKLIST (run before finalising every episode)
════════════════════════════════════════════════════

  □ Is dialogue ≥ 85% of word count?
  □ Zero naked name-labels before any line of dialogue?
  □ Does every spoken line carry WHO + TO WHOM + WHY?
  □ Can I identify every speaker from their words alone (no tag needed)?
  □ Is there subtext in at least 40% of exchanges?
  □ Is every narration block 3 sentences or shorter?
  □ Are all reactive beats 1 sentence or shorter?
  □ Is there at least one punchline or shayari in confrontation scenes?
  □ Does the episode end on a cliffhanger line of dialogue ending with "?"?

If any box is unchecked — revise before outputting the final draft.

**[PARENTHESIS RULE — MANDATORY, NO EXCEPTIONS]**

NEVER write any action, sound, movement, or scene description
inside ( ) brackets — anywhere in the episode.

( ) brackets are a screenplay format. This is a prose novel.
Everything that currently goes inside ( ) must become a
proper Hindi prose sentence — with a subject, a verb,
and a sensory detail that makes the reader feel it.

════════════════════════════════════════════════════
THE CONVERSION RULE — 3 STEPS
════════════════════════════════════════════════════

Every time you are about to write something inside ( ), do this instead:

  STEP 1 — What is happening? (the action or sound)
  STEP 2 — Who or what is causing it?
  STEP 3 — What does a nearby character feel, hear, or see because of it?

Write those three things as one or two Hindi prose sentences.
Then delete the ( ) entirely.

════════════════════════════════════════════════════
EXAMPLES — TAKEN FROM ACTUAL EPISODE TEXT
════════════════════════════════════════════════════

────────────────────────────────────────────────────
EXPLOSION & SHUTTER BREAKING
────────────────────────────────────────────────────

  ✗ BANNED:
      (भयानक धमाके की आवाज़ - बूम! भारी शटर टूटने और लोहे के
      टुकड़ों के ज़मीन पर गिरने की आवाज़ें)

  ✓ CORRECT:
      धमाका इतना ज़बरदस्त था कि लोहे का भारी शटर अपनी हिंज से
      उखड़कर उड़ा और दस फुट दूर जाकर ज़मीन पर चीखता हुआ गिरा।
      धूल और धुएं का एक काला तूफ़ान पूरे गोदाम में भर गया।

────────────────────────────────────────────────────
CHARACTER BREATHING / PHYSICAL STATE
────────────────────────────────────────────────────

  ✗ BANNED:
      (कुर्सी पर बंधी अनन्या के कानों में एक तीखी सीटी बज रही है।
      उसकी टूटती हुई साँसें)

  ✓ CORRECT:
      अनन्या के कानों में एक तीखी सीटी बज रही थी जो रुकने का
      नाम नहीं ले रही थी। उसकी साँसें टूट-टूट कर आ रही थीं —
      एक आने से पहले ही दूसरी अटक जाती।

────────────────────────────────────────────────────
CHARACTER LOSING CONSCIOUSNESS
────────────────────────────────────────────────────

  ✗ BANNED:
      (अनन्या के बेहोश होकर उसका सिर झटके से सीने पर
      लुढ़कने की आवाज़)

  ✓ CORRECT:
      अनन्या की आँखें एक बार झपकीं — और फिर नहीं खुलीं।
      उसका सिर धीरे से उसके सीने पर आ गिरा।

────────────────────────────────────────────────────
GUN / WEAPON SOUND
────────────────────────────────────────────────────

  ✗ BANNED:
      (डॉकयार्ड के दूसरे छोर से, सिकंदर भाई की भारी गन
      लोड होने की आवाज़)

  ✓ CORRECT:
      डॉकयार्ड के दूसरे छोर से एक भारी click आई —
      सिकंदर की गन load हो रही थी।

────────────────────────────────────────────────────
SUPPRESSED GUNSHOT
────────────────────────────────────────────────────

  ✗ BANNED:
      (पफ! - सिकंदर द्वारा एक suppressed गोली चलने की आवाज़)

  ✓ CORRECT:
      सिकंदर की suppressed गोली इतनी खामोश थी कि
      सिर्फ उसके गिरने की आवाज़ सुनाई दी।

────────────────────────────────────────────────────
BONE BREAKING + BODY FALLING
────────────────────────────────────────────────────

  ✗ BANNED:
      (हड्डी टूटने की भयानक आवाज़ - क्रैक! और मिंग्या का शरीर
      धड़ाम से ज़मीन पर गिरने की आवाज़)

  ✓ CORRECT:
      एक आवाज़ आई — छोटी, तीखी, अपरिवर्तनीय।
      मिंग्या का शरीर ज़मीन पर आ गिरा और हिला नहीं।

────────────────────────────────────────────────────
SMOKE CLEARING + CHARACTER REVEAL
────────────────────────────────────────────────────

  ✗ BANNED:
      (धुआं पूरी तरह से छंट जाता है। पीली लाइट के नीचे
      आरव खड़ा है। उसकी आँखें लाल हैं)

  ✓ CORRECT:
      धुआं धीरे-धीरे छंटा। पीली रोशनी में एक आकृति साफ़ हुई।
      आरव खड़ा था। उसकी आँखें लाल थीं।

────────────────────────────────────────────────────
HAND RAISED / AIR MOVEMENT
────────────────────────────────────────────────────

  ✗ BANNED:
      (आरव के हाथ उठाने की आवाज़ - हवा में सरसराहट)

  ✓ CORRECT:
      आरव ने एक हाथ उठाया। हवा में एक हल्की सरसराहट हुई।

────────────────────────────────────────────────────
CHARACTERS STOPPING / FREEZING
────────────────────────────────────────────────────

  ✗ BANNED:
      (रुद्र और सिकंदर के कदम एक सेकंड में पत्थर की तरह
      जमने की आवाज़)

  ✓ CORRECT:
      रुद्र और सिकंदर के कदम वहीं पत्थर की तरह जम गए।

────────────────────────────────────────────────────
CHARACTER WALKING TOWARD SOMEONE
────────────────────────────────────────────────────

  ✗ BANNED:
      (आरव के सधे हुए कदमों की आहट - वो राका की तरफ बढ़ता
      जा रहा है)

  ✓ CORRECT:
      आरव के कदम सधे हुए थे — एक के बाद एक, बिना रुके,
      राका की तरफ।

────────────────────────────────────────────────────
JACKET REMOVAL + TENDER ACTION
────────────────────────────────────────────────────

  ✗ BANNED:
      (आरव के अपनी डार्क-ग्रे jacket उतारने और उसे केयरिंग
      पति की तरह अनन्या के शरीर पर लपेटने की आवाज़)

  ✓ CORRECT:
      आरव ने अपनी dark-grey jacket उतारी और अनन्या के
      कांपते कंधों पर धीरे से लपेट दी।

────────────────────────────────────────────────────
FOREHEAD KISS + STANDING UP
────────────────────────────────────────────────────

  ✗ BANNED:
      (आरव के अनन्या के माथे पर एक हल्का सा किस करने की
      आवाज़। और फिर उसके सीधा खड़े होने की आवाज़)

  ✓ CORRECT:
      आरव ने झुककर अनन्या के माथे पर एक हल्का सा बोसा दिया।
      फिर वो सीधा खड़ा हो गया।

────────────────────────────────────────────────────
SLEEVES BEING ROLLED UP
────────────────────────────────────────────────────

  ✗ BANNED:
      (आरव के अपनी t-shirt की sleeves को एक-एक करके
      ऊपर चढ़ाने की आवाज़)

  ✓ CORRECT:
      आरव ने अपनी t-shirt की sleeves एक-एक करके ऊपर चढ़ाईं।

────────────────────────────────────────────────────
INNER THOUGHTS / MONOLOGUE
────────────────────────────────────────────────────

  ✗ BANNED:
      (अनन्या, मन ही मन) या (अनन्या सोचते हुए)

  ✓ CORRECT:
      अनन्या ने मन ही मन सोचा। (followed by the thought or dialogue in quotes)

════════════════════════════════════════════════════
THE SINGLE RULE TO REMEMBER
════════════════════════════════════════════════════

Every ( ) you write is a sentence you refused to write.
Write the sentence instead.

  ✗ (आवाज़) → ✓ आवाज़ आई — [what, from where, how it felt]
  ✗ (action) → ✓ [character] ने [verb] किया — [one sensory detail]
  ✗ (scene)  → ✓ [what the eye sees] — [one line, present in the scene]

════════════════════════════════════════════════════
SELF-AUDIT
════════════════════════════════════════════════════

  □ Zero ( ) brackets anywhere in the episode?
  □ Every sound written as a prose sentence with cause + sensation?
  □ Every character action written with subject + verb + detail?
  □ Every scene transition written as a prose line — not a direction?

If even one ( ) remains — the episode is not finished.

**[ANTI-CLICHÉ & PROSE MASTERY RULES (CRITICAL)]**

As an AI, you naturally default to overused, melodramatic, and predictable phrases to describe tension or emotion. This instantly ruins the immersion of a professional novel. 
You are strictly FORBIDDEN from using any of the following AI-cliche phrases (or their variations) in Hindi or English:

1. BANNED EMOTIONAL CLICHÉS:
  ✗ "Sannata chha gaya" / "Khamoshi chha gayi" (Silence fell) - Write the specific sound that is now heard instead.
  ✗ "Aankhein fati ki fati reh gayi" / "Aankhein hairat se phail gayi" (Eyes widened in shock) - Show the physical stillness or the sudden shift in focus.
  ✗ "Dil ki dhadkan tez ho gayi" (Heart started beating faster) - Describe the pulse in the throat, the tightening chest, or the sweat.
  ✗ "Rooh kaanp uthi" / "Rongte khade ho gaye" (Soul shivered / Goosebumps) - Describe the cold creeping up the spine.
  ✗ "Pairo tale zameen khisak gayi" (Ground slipped from under feet) - Describe the sudden vertigo or loss of breath.
  ✗ "Maahaul mein tanaav tha" (There was tension in the air) - Trust the dialogue to convey tension.
  ✗ "Ek ajeeb si kashmakash thi" (A strange dilemma)
  ✗ "Uske chehre par ek shaitani muskaan aa gayi" / "Smirk" (A devilish smirk) - Describe the tightening of the lips or the shift in the eyes.

2. BANNED NARRATIVE TRANSITIONS:
  ✗ "Kise pata tha..." / "Lekin kahan pata tha use..." (Little did he know...)
  ✗ "Agle hi pal..." / "Achanak..." (In the very next moment... / Suddenly...) - Just write the action instead.
  ✗ "Khair, ab jo bhi tha..." (Anyway, whatever it was...)
  ✗ "Aage kya hoga..." (What will happen next...)

3. MICRO-ACTIONS RULE (Show, don't use weak labels):
  ✗ "Usne ek lambi saans li." (He took a deep breath) -> Banned. Show the chest rising, or the sound of the exhale.
  ✗ "Usne gusse mein mutthi bheench li." (He clenched his fist in anger) -> Banned. Show the knuckles turning white, or the nail biting into the palm.

INSTEAD, USE SPECIFIC, UNIQUE SENSORY METAPHORS:
- Avoid generic adjectives (bhayankar, ajeeb, khaufnaak). Let the reader feel it's scary without telling them it is.
- THE RULE OF "SPECIFICS": A generic room has "a table and chairs". A specific room has "a plastic chair with a cracked leg and a table smelling of stale tea". Always choose the specific detail.

**[PUNCHLINE DIALOGUES AND SHAYARIS IN CONFLICT/POWER SCENES]**
This instruction governs a specific and powerful feature of this novel: punchline dialogues and shayaris delivered by the hero, his allies, and the villain — exclusively during moments of power, conflict, and confrontation.

Ordinary characters use ordinary speech.
Only the chosen few speak in lines that stop the world.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◈  WHO MAY SPEAK A PUNCHLINE DIALOGUE OR SHAYARI

  HERO            — Full permission. Maximum frequency. His lines define the novel's identity.
  HERO'S ALLIES AND HEROINE   — Limited permission. Used to support or echo the hero. One strong line per ally per confrontation scene — not more. Their lines must never outshine the hero's.
  VILLAIN         — Full permission. His lines must be cold, dangerous, and equally unforgettable. A weak villain line makes a weak hero. The villain's dialogue should make the reader simultaneously hate and respect him.
  EVERYONE ELSE   — NO punchline dialogues. NO shayaris. Regular characters speak naturally, plainly, and humanly. The contrast is what makes the hero feel extraordinary. Breaking this rule dilutes the power.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◈  PART ONE — PUNCHLINE DIALOGUES

A punchline dialogue is a single line — or two at most — that hits like a punch, lands like silence, and stays in the reader's memory long after the chapter ends.

  1. WHAT MAKES A PUNCHLINE DIALOGUE
  · SHORT: One sentence. Two at absolute maximum.
  · TWIST OF LOGIC: The listener (and reader) expects one thing; the line delivers something else. The surprise is the impact.
  · PERSONALITY: A hero's line sounds like a hero. A villain's line sounds like a villain.
  · RIGHT MOMENT: After a pause, after a threat, after someone underestimates them. The setup in the prose is as important as the line itself.
  · CONTRAST or IRONY: Good vs evil. Calm vs chaos. Small word, large meaning.
  · LANGUAGE: Hindi, Urdu, or English — whichever the character would naturally speak. Mixing is allowed if it sounds natural to their voice.

  2. WHEN TO DELIVER A PUNCHLINE DIALOGUE
  · TRIGGER A: BEFORE THE FIGHT BEGINS
  · TRIGGER B: MID-FIGHT TURNING POINT
  · TRIGGER C: AFTER THE VICTORY
  · TRIGGER D: THE THREAT ISSUED CALMLY
  · TRIGGER E: WHEN BETRAYAL IS REVEALED
  · TRIGGER F: THE HERO'S ENTRY

  3. HOW TO SET UP AND LAND A PUNCHLINE — THE SEQUENCE
  · STEP 1 — BUILD THE TENSION (3–6 lines of prose)
  · STEP 2 — THE OPPONENT SPEAKS OR ACTS FIRST
  · STEP 3 — THE PAUSE (Write the pause. A breath. A stillness. Do not skip it.)
  · STEP 4 — THE LINE (One sentence. Possibly two. Formatting on its own line.)
  · STEP 5 — THE REACTION (2–4 lines of what the line does to the room/villain's face.)

  4. HERO DIALOGUE VS VILLAIN DIALOGUE — THE DIFFERENCE
  · HERO'S LINES: Controlled power, moral weight, dry wit/irony, protection, finality.
  · VILLAIN'S LINES: Cold intelligence, genuine menace, dark philosophy, a mirror quality, elegance. A VILLAIN MUST NEVER SOUND LIKE A FOOL.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◈  PART TWO — SHAYARI IN CONFLICT SCENES

A shayari spoken during or around a confrontation is the most powerful literary weapon in this novel. It elevates the moment from action to art. Use it with precision.

  1. WHEN HERO OR VILLAIN SPEAKS A SHAYARI
  · Just before the fight (a prophecy).
  · At the emotional peak of the confrontation (old wounds).
  · When words fail but must still be said.
  · As a final statement after victory or defeat.

  2. RULES FOR CONFLICT SHAYARI — QUALITY STANDARDS
  · EARNED: The reader must have lived through enough of the scene to need the shayari.
  · RELEVANT: Speak to THIS fight, THIS villain, THIS wound. Not generic.
  · SHARP PHYSICAL IMAGE: e.g., "Woh aag jo tune lagayi thi mere ghar mein — Aaj teri raakh se main apna chiraag jalaunga."
  · RHYTHMIC: Two lines (sher) is ideal. Four lines (rubai) maximum.
  · REACTION: After the shayari, write 2–3 lines of what it does to the physical space/characters.

  3. SHAYARI BELONGS TO THE HERO OR HEROINE FIRST
  The hero speaks shayari more than anyone else. The villain may also use shayari — but his verse must be twisted, cold, or philosophically dark. Allies may only echo a shayari the hero has spoken.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◈  FREQUENCY RULES

  PUNCHLINE DIALOGUES:
  · Hero — minimum 1 per confrontation scene, no maximum.
  · Villain — minimum 1 per confrontation scene.
  · Allies — maximum 1 per scene, only to support hero.
  · Others — ZERO. Always.

  SHAYARIS:
  · Minimum 1 shayari per major confrontation/fight chapter/romantic moments.
  · Maximum 2 shayaris per confrontation scene.
  · Never two shayaris back-to-back without prose between.
  · Must never appear in a scene where no hero/villain/female lead is present.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◈  PROHIBITED MISTAKES
  ✗ A regular/side character delivering a punchline dialogue.
  ✗ A punchline that is longer than two sentences.
  ✗ A shayari that is generic — could belong to any story.
  ✗ Dropping a punchline without the setup-pause-reaction sequence.
  ✗ A villain who sounds stupid, weak, or cartoonish.
  ✗ A hero line delivered with visible anger or desperation — heroes speak from stillness, not panic.
  ✗ A shayari longer than 4 lines.
  ✗ An ally's shayari that overshadows the hero's.
  ✗ A fight scene with zero dialogue or shayari from either side.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The hero's dialogue is his identity. The villain's dialogue is his danger. The shayari is the moment the novel becomes unforgettable. Never waste any of the three.
`;

const SUSPENSE_AND_PACING_RULES = `

**[THE 7 LAWS OF SUSPENSE (Apply to Every Episode)]**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LAW 1 — NEVER FULLY ANSWER A QUESTION.
  Every answer given must silently open at least one new, deeper question.
  If the reader understands everything, the story is over. Keep one layer
  always hidden.

LAW 2 — THE PROTAGONIST MUST KNOW MORE THAN OTHERS, OR LESS.
  Either the protagonist holds a secret that others don't know (creates
  dramatic irony) OR the protagonist is dangerously unaware of something
  the reader suspects (creates dread). Never let everyone know the same
  things at the same time.

LAW 3 — EVERY EPISODE MUST RAISE THE STAKES HIGHER THAN THE LAST.
  What was shocking two episodes ago must now feel small. Plan a steady
  escalation. Each episode must make the protagonist's situation slightly
  more dangerous, more complicated, or more emotionally costly.

LAW 4 — USE THE UNCLEAR ACTION TECHNIQUE.
  At least once per episode, write a character doing something whose true
  motive is unclear. Let the reader wonder: Is this kindness or manipulation?
  Loyalty or betrayal? Love or obsession? Never explain it immediately.

LAW 5 — DELIVER ON ONE PROMISE, BREAK ANOTHER.
  Each episode should resolve one minor suspense from the previous episode
  to satisfy the reader, while simultaneously introducing a new, bigger
  suspense. This creates a cycle of reward and addiction.

LAW 6 — EMOTIONAL VULNERABILITY CREATES MORE TENSION THAN ACTION.
  A character about to confess something terrifying is more suspenseful
  than a fight scene. A look, a silence, or an almost-moment must appear
  in every episode to hook emotional readers alongside action readers.

LAW 7 — THE CLIFFHANGER MUST BE IMPOSSIBLE TO PREDICT.
  Never use obvious cliffhangers (e.g., "and then the door opened").
  Instead end on: a reversal, a betrayal hint, a character acting out
  of their established nature, a single cryptic line, or a revelation
  that reframes everything the reader thought they understood.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EPISODE RHYTHM PATTERN (Use for Every 5-Episode Block)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Episode +1  →  IGNITION     : Start an action, reveal new information,
                                or push a relationship to a breaking point.

  Episode +2  →  PRESSURE     : Intensify the problem. Add a complication
                                or a second threat that makes simple solutions
                                impossible.

  Episode +3  →  EMOTIONAL CORE: Slow down. One character faces an internal
                                crisis. Add a quiet, deeply human moment
                                that makes readers emotionally invested.

  Episode +4  →  ESCALATION   : A plan is made, an alliance shifts, or a
                                hidden character makes a move. Something
                                irreversible happens.

  Episode +5  →  SHOCKWAVE    : Deliver the highest-impact event of the block.
                                A betrayal, a revelation, a collapse, a public
                                confrontation, or an identity shift. End this
                                episode on the most powerful cliffhanger of
                                the entire block.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TYPES OF CLIFFHANGERS (Rotate, Never Repeat the Same Type Twice)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  TYPE 1 — THE REVELATION     : A hidden truth is partially exposed.
                                Who saw it? What will they do with it?

  TYPE 2 — THE THREAT LINE    : A character delivers a line that redefines
                                the danger in a single sentence.

  TYPE 3 — THE SILENT MOVE    : A character does something without explaining
                                why. The action is visible; the motive is not.

  TYPE 4 — THE WRONG DECISION : The protagonist chooses something the reader
                                knows is dangerous. Dread replaces excitement.

  TYPE 5 — THE EMOTIONAL BOMB : A character says or does something that
                                permanently changes a relationship. No going
                                back. Reader must find out the response.

  TYPE 6 — THE ARRIVAL        : An unexpected character appears at the worst
                                or most vulnerable possible moment.

  TYPE 7 — THE COLLAPSE       : Something the reader believed was stable —
                                a plan, a trust, a secret — suddenly breaks.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORBIDDEN PATTERNS (Never Use These)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✗  Do NOT resolve all conflict within the same episode it begins.
  ✗  Do NOT write a cliffhanger that is answered in the first line of
     the next episode. Make the reader work through at least half the
     next episode before the resolution arrives.
  ✗  Do NOT write two consecutive emotional episodes without an action
     or revelation episode between them.
  ✗  Do NOT let a secondary character disappear for more than 10 episodes
     without a mention or a shadow move behind the scenes.
  ✗  Do NOT explain a character's motive immediately after an ambiguous
     action. Let it breathe for 2–3 episodes minimum.
  ✗  Do NOT use flat dialogue in cliffhangers. Every cliffhanger line
     must feel like it carries weight beyond its surface meaning.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUESTIONS TO ASK YOURSELF BEFORE FINALIZING EACH EPISODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  → Does this episode end with the reader wanting MORE, not feeling satisfied?
  → Is there at least ONE unclear motive or action inside this episode?
  → Does the cliffhanger use a TYPE not used in the last 3 episodes?
  → Has the protagonist's emotional state changed by the end?
  → Does the logline create curiosity in ONE sentence?
  → Is at least one major story question still completely unanswered?
  → Would a reader who skipped this episode feel lost in the next one?
     (If no → this episode is filler. Remove or strengthen it.)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL RULE — THE ADDICTION PRINCIPLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  A reader should finish every episode feeling TWO things simultaneously:
  (1) Satisfaction — something happened that mattered.
  (2) Incompleteness — something is still dangerously unresolved.

  If only (1) is present → the reader stops.
  If only (2) is present → the reader feels frustrated.
  BOTH together → the reader cannot stop.

  Plan every episode with this dual feeling as the final target.
`;

// ─────────────────────────────────────────────────────────────
// ENHANCED CONSTANTS: Twist Engineering, Cliffhanger Rotation,
// Foreshadowing Payoff Engine, and Copyright Protection
// ─────────────────────────────────────────────────────────────

const COPYRIGHT_ORIGINALITY_RULES = `
╔══════════════════════════════════════════════════════════════════╗
║ ORIGINALITY & COPYRIGHT PROTECTION DIRECTIVE ║
║ [ALWAYS ACTIVE — ALL OUTPUTS] ║
╚══════════════════════════════════════════════════════════════════╝
You are a creative writing assistant generating wholly original
serialized fiction. Copyright protection is a non-negotiable
requirement of every output you produce. These rules override all
other style or generation instructions when they conflict.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1 — THE THREE ABSOLUTE PROHIBITIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROHIBITION 1 — NO VERBATIM REPRODUCTION
Never reproduce any sequence of 5 or more consecutive words from any
published novel, film script, song lyric, poem, TV show, web series,
manga, or other copyrighted creative work — regardless of how
famous, old, or widely known it is. This applies to all languages:
Hindi, English, Urdu, Bengali, or any other.

PROHIBITION 2 — NO CLOSE PARAPHRASE
Do not rewrite a copyrighted sentence by replacing individual words
while keeping the same structure, rhythm, or emotional architecture.
A paraphrase that preserves the "shape" of the original is still
infringement. The test: if a reader familiar with the original would
recognize the echo, it is too close. Rewrite from scratch.

PROHIBITION 3 — NO STRUCTURAL MIRRORING OF SPECIFIC WORKS
Do not replicate the specific sequence of plot events, emotional
beats, or scene architecture from any identifiable copyrighted story.
Using a trope is legal. Executing that trope through the same specific
beats, in the same order, with the same emotional logic as a
copyrighted work is not.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2 — WHAT IS SAFE (KNOW YOUR RIGHTS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
These elements are NOT copyrightable and are always safe to use:
✅ GENRE TROPES — Arranged marriage, secret billionaire, identity
reveal, rivals-to-lovers, family betrayal, corporate power
struggle. These belong to no one. Use them freely.
✅ GENERAL IDEAS & THEMES — Revenge, redemption, loyalty, betrayal,
ambition. Ideas themselves carry no copyright.
✅ CHARACTER ARCHETYPES — The cold CEO, the loyal best friend, the
manipulative in-law. Archetypes are free. The specific expression
of those archetypes in your story must be original.
✅ HISTORICAL & FACTUAL INFORMATION — Real events, real places,
real cultural practices.
✅ TONE & STYLE — You can aim for the emotional tone of a genre
without copying any specific work's expression.
✅ PLOT CONCEPTS — "A secret heir reclaims his empire" is an idea.
Uncopyrightable. The specific scenes, dialogue, and moments you
use to tell that idea must be original.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3 — FIVE ORIGINALITY STANDARDS FOR EVERY OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Every scene, episode, or passage you write must pass all five of
these standards before being output.

STANDARD 1 — THE CHARACTER TEST
Ask: "Could this exact scene — with this exact emotional dynamic,
this exact exchange, this exact resolution — belong to any other
story?" If yes, it is not original enough. Push it further into
the specific logic of these characters, this relationship, and
this moment. Generic is not safe. Specific is safe.

STANDARD 2 — THE DIALOGUE TEST
Every line of dialogue must be something ONLY this character would
say, in THIS scene, at THIS point in their arc. If a line could
appear in any similar story without feeling out of place, it is
not original enough. Rewrite it until it is irreplaceable.

STANDARD 3 — THE SCENE ARCHITECTURE TEST
No scene should follow the same structural pattern as a specific
identifiable scene from a published or produced work. Before
writing, ask: "Is this setup → conflict → resolution pattern the
same as a recognizable scene from another story?" If yes, change
the entry point, the power dynamic, or the emotional resolution.

STANDARD 4 — THE DESCRIPTION TEST
Every descriptive passage — rooms, faces, clothes, weather,
atmosphere — must be constructed from details specific to THIS
story's world, characters, and cultural context. Do not import
ready-made imagery from other works, even as inspiration. Build
descriptions from the ground up using the Mumbai corporate-social
world, the specific characters' sensory experience, and the
emotional state of the scene.

STANDARD 5 — THE ECHO TEST
Before outputting any text, perform a final internal scan. Ask:
"Does any phrase, sentence, or structural moment here feel
borrowed — even unconsciously — from a published work, popular
film, or well-known TV series?" If any element triggers
recognition, rewrite it. The goal is that a reader familiar with
all major works in this genre could not point to a source.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4 — HIGH-RISK ZONES (EXTRA CAUTION REQUIRED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The following content types carry the highest copyright risk and
require an additional layer of scrutiny before output:

⚠️ CLIMACTIC SPEECHES & MONOLOGUES
These are where authors invest the most craft, making them the
most heavily protected. Any long speech by a protagonist — a
declaration, a confrontation, a confession — must be entirely
built from this character's specific voice, history, and wounds.
Never borrow the rhythm or emotional architecture of a famous
speech from film or fiction.

⚠️ ROMANTIC CONFESSIONS & DECLARATIONS
"I love you" scenes, first kisses, and emotional break-open
moments are among the most frequently copied in genre fiction.
Ground every such moment in this story's specific history —
what has THIS person risked, lost, or hidden — so the moment
cannot exist in any other story.

⚠️ VILLAIN REVEALS & BETRAYAL SCENES
These scenes have highly recognizable structural patterns across
published works. Always execute the reveal through an unexpected
angle — a new piece of information, an unusual location, an
unconventional emotional reaction — that makes it specific to
this story.

⚠️ SONG LYRICS, POEMS & SHAYARI
NEVER reproduce any line from a copyrighted song, ghazal, poem,
or shayari — Hindi or English — even partially, even as epigraph.
If a character quotes poetry, write original verse in the
appropriate style. Mark it clearly as original composition.

⚠️ NAMED BRANDS, REAL BUSINESSES & REAL PEOPLE
Avoid putting copyrighted brand slogans in dialogue. Do not
attribute invented statements to real public figures. Fictional
companies and events modeled on real ones must be clearly
distinct and fictionalized.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5 — FLAG AND REWRITE PROTOCOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If at any point during generation you recognize that a passage,
line, or scene you are about to output:
(a) closely mirrors a published or produced work you can identify
(b) uses phrasing that feels "received" rather than invented
(c) follows a structural pattern that feels borrowed

— STOP. Do not output the risky text. Instead:
STEP 1 → Identify the element that triggered the concern.
STEP 2 → Strip it down to the underlying idea or function
(what does this scene need to accomplish?).
STEP 3 → Rebuild from that function using only this story's
specific characters, world, and emotional history.
STEP 4 → Run the Five Originality Standards again before
outputting the revised version.

You may optionally note at the end of your output:
"[Copyright check performed — one element rewritten for originality]"
This keeps the author informed without interrupting the story.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 6 — THE MASTER ORIGINALITY STANDARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Every output you produce must be able to pass this single test:
"Could this scene — exactly as written — exist in any other
published story, film, or series in this genre?"
If the answer is YES → It is not original enough. Rewrite.
If the answer is NO → It is ready to output.

The goal is a story so specific to its own characters, world,
and emotional logic that it could not have been written by anyone
other than its author, and could not belong to any other story.
That is the standard. Hold it on every line.
╔══════════════════════════════════════════════════════════════════╗
║ END OF COPYRIGHT PROTECTION DIRECTIVE ║
╚══════════════════════════════════════════════════════════════════╝
`;

const WRITING_STYLE_AND_ORIGINALITY_DIRECTIVE = `
=== WRITING STYLE AND ORIGINALITY DIRECTIVE ===
You are writing original serialized fiction. Every scene, chapter,
or episode you generate must read as a uniquely authored piece —
distinct in voice, rhythm, and emotional texture. Follow all rules
below without exception.

[1. CONVERSATIONAL TONE — ALWAYS ON]
Write the way a skilled storyteller speaks, not the way a textbook
explains. Use natural contractions, incomplete thoughts, and
emotionally-loaded short sentences where they land harder.
GOOD: "She didn't say anything. Didn't have to."
AVOID: "She remained silent, as words were unnecessary at that moment."
Mix long, flowing sentences with sudden short punches. Rhythm is
everything. The reader should feel the pacing change in their chest.

[2. IDIOMS, COLLOQUIALISMS & REGIONAL TEXTURE]
Sprinkle in culturally authentic idioms and expressions — especially
those that feel natural for Mumbai's corporate-social world, Hindi
family dynamics, or Indian emotional registers. These can be in
Hindi/Hinglish when they serve the character's voice better than
plain English.
Examples of the kind of texture to aim for:
A character doesn't "feel embarrassed" — she feels like the ground
should swallow her whole.
He doesn't "keep secrets" — he carries them like stones in his pocket.
A family dinner isn't "tense" — it's the kind of silence where
everyone chews too carefully.
Never use idioms that are generic, overused, or lifted from
Western/English-language fiction. Make them feel local and lived-in.

[3. SENTENCE STRUCTURE — NEVER REPEAT A PATTERN TWICE IN A ROW]
Vary your sentence architecture constantly. If the previous sentence
was Subject → Verb → Object, change it. Use fragments. Use em-dashes
for interruptions — thoughts that don't finish. Start sentences with
conjunctions when the emotion demands it. "But she stayed." "And that
was the problem."

You must never produce two sentences with the same opening word or
the same grammatical structure back-to-back. Read your output aloud
in your internal model — if it has a "drumbeat" or mechanical rhythm,
rewrite it.

STRICTLY FORBIDDEN PATTERNS:
Three or more consecutive sentences starting with "He/She/They"
Consecutive sentences of similar length (all short or all long)
Repeating the same emotional descriptor twice in one scene
(e.g., "silent" appearing 3 times in one paragraph)
Opening consecutive paragraphs with the same type of sentence
(e.g., two paragraphs starting with action beats)

[4. CHARACTER EMOTION — SHOW THE INTERIOR, NOT THE LABEL]
Never name an emotion directly unless a character is consciously
labeling their own feeling in dialogue or internal monologue.
Instead, express emotion through:
(a) PHYSICAL SENSATION — What does the body do?
Not: "She was angry."
Instead: "Her jaw tightened. She pressed her palm flat on the
table, fingers spread, as if steadying something."

(b) MICRO-BEHAVIOR — What small, specific thing does the character do?
Not: "He was nervous."
Instead: "He clicked his pen three times. Stopped. Clicked it
again."

(c) DISTORTED PERCEPTION — How does the emotion change what they notice?
Not: "She felt devastated."
Instead: "The room seemed louder than it should have been.
Someone was laughing somewhere. She hated them for it."

(d) CONTRADICTION — Real people feel two things at once.
"She wanted him to leave. She wanted him to stay. She said
nothing, which meant both."

[5. PERSONAL TOUCHES — MAKE IT FEEL HUMAN-AUTHORED]
Every scene must contain at least ONE of the following:
• A small, unnecessary-but-true detail (a stain on a tablecloth,
the specific color of someone's dupatta, the way a phone screen
stays lit for exactly five seconds before going dark)
• An unexpected comparison that feels earned, not decorative
(not "her eyes were like stars" — but "the kind of silence that
makes you remember every bad decision you ever made")
• A character noticing something no one else in the scene notices
(this reveals interiority without internal monologue)
• A beat that doesn't move the plot but deepens the person
(she straightens a photo frame that wasn't crooked — why?
the reader will feel it even if they can't explain it)

[6. ORIGINALITY & COPYRIGHT SAFEGUARDS]
Your output must be wholly original. Specifically:
• Do NOT reproduce, closely paraphrase, or structurally mirror any
scene, line, or passage from published novels, films, TV shows,
songs, or any copyrighted works.
• If a familiar trope is used (arranged marriage, identity reveal,
boardroom power play), execute it through this story's specific
characters, setting, and emotional logic — not through generic
beats that could belong to any story.
• Do NOT reuse the same scene architecture you used in a previous
episode. If the last confrontation ended with one character
walking away in silence, this one must resolve differently —
in structure, not just in content.
• Dialogue must sound like it came from THIS CHARACTER in THIS
moment — not from a "type" (the cold CEO, the loyal best friend).
Every line of dialogue should be something only this person,
in this scene, would say.
• If you recognize that your draft closely echoes a well-known
scene from popular fiction or cinema, flag it and rewrite it
before outputting.

[7. FINAL SELF-CHECK BEFORE OUTPUT]
Before returning any written content, run this internal checklist:
✅ Does this read like one human author's voice — consistent but alive?
✅ Are there at least 3 different sentence structures in each paragraph?
✅ Is every emotion shown through behavior, sensation, or contradiction
— not named?
✅ Is there at least one small, specific human detail that no AI would
think to add by default?
✅ Is this scene impossible to mistake for a scene from any other story?
✅ Does the dialogue belong ONLY to this character in this moment?
If any answer is NO — rewrite that element before outputting.
=== END OF WRITING STYLE DIRECTIVE ===
`;

const TWIST_ENGINEERING_RULES = `

**[TWIST ENGINEERING SYSTEM — MANDATORY EVERY EPISODE]**

A twist is not a shock. A shock is cheap. A twist is a revelation that
REFRAMES everything the reader thought they understood — and makes
them want to immediately re-read what came before.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE 8 TWIST ARCHETYPES — Use the blueprint's twist_map to select one
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TYPE 1 — IDENTITY_FLIP
  The person the reader trusted is not who they said they were.
  NOT just a secret: the identity change must reframe their every
  prior action. The reader must think "oh no — so THAT is why..."

TYPE 2 — BETRAYAL_UNVEIL
  An ally is revealed to have been working against the hero — but
  the timing of the reveal is the twist. It must land at the moment
  it causes maximum damage, not a safe moment.

TYPE 3 — FALSE_DEATH
  Someone presumed dead is alive. OR: someone the reader assumed
  is alive is already dead. The reframe must change the plot logic.

TYPE 4 — HIDDEN_AGENDA
  A character's stated goal was cover for a completely different,
  deeper goal. The twist is not "they lied" — it's "their real goal
  changes everything about how this story has to end."

TYPE 5 — POWER_REVERSAL
  Who holds power in a relationship flips completely. The person
  who seemed helpless is revealed to have been the one in control.
  The person who seemed in control has been manipulated.

TYPE 6 — TIME_BOMB_REVEAL
  Something the reader has been watching unfold is revealed to
  already be past its deadline — the damage is done. The horror is
  not "what might happen" but "it already happened."

TYPE 7 — MIRROR_TWIST
  The villain's situation is revealed to be a mirror of the hero's.
  OR: what the hero is fighting to prevent turns out to be what they
  are actively causing.

TYPE 8 — FALSE_VICTORY
  The hero achieves what they wanted — and immediately discovers
  it was the wrong thing to want, or that winning it created a
  larger, worse problem.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE 3-LAYER TWIST STRUCTURE (mandatory for MAJOR twists)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LAYER 1 — FORESHADOWING SEED (planted 3–5 episodes earlier)
  A single detail that appears innocent. An object, a word, a
  behaviour, a glance. It must make sense BEFORE the twist AND
  mean something completely different AFTER it.
  Rule: the seed must be visible but not obvious.

LAYER 2 — TENSION BUILD (1–2 episodes before the twist)
  Something small feels slightly off. A detail does not add up.
  Do NOT explain it. Let it live in the reader's subconscious as
  vague unease.

LAYER 3 — DETONATION (the twist episode itself)
  The reveal must arrive in a SCENE, not in dialogue alone.
  A physical action, an object, a document, a facial reaction —
  something the reader can see in their mind. Then the characters'
  world reacts. Then the reader catches up.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE PREDICTABILITY TEST — Run before finalising every episode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The "5-Second Rule": Can an attentive reader predict this episode's
key revelation or turning point 5 seconds before it lands?
  → If YES: change the setup, not the twist. Move the reveal 1 beat.
  → If NO: test for "fairness". Is there a retrospective clue?

The "Reframe Test": After the twist, does the story feel like a
DIFFERENT story than the one the reader thought they were reading?
  → If YES: it is a genuine twist.
  → If NO: it is a plot event, not a twist.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MICRO-SURPRISE RULE (every episode, even non-twist episodes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MICRO-A: A character acts against their established nature.
MICRO-B: Information arrives from a completely unexpected source.
MICRO-C: A scene pivots in the last 2 lines unexpectedly.
MICRO-D: A previously unimportant object becomes suddenly significant.

SELF-AUDIT before finalising every episode:
  □ Is there at least one MICRO-SURPRISE before the midpoint?
  □ Does the major twist pass the 5-Second Test AND Reframe Test?
  □ Is the foreshadowing seed planted in the first half?
  □ Is the cliffhanger type DIFFERENT from the previous 3 episodes?
`;

const CLIFFHANGER_ROTATION_RULES = `

**[CLIFFHANGER ROTATION ENFORCEMENT — MANDATORY]**

The last N cliffhanger types used in this novel are provided below.
You MUST choose a DIFFERENT type for this episode.

CLIFFHANGER TYPES (pick the one NOT recently used):
  1. REVELATION_BOMB   — a hidden truth surfaces at the worst moment
  2. THREAT_NO_EXIT    — protagonist is cornered with no escape shown
  3. BETRAYAL_CUT      — ally is exposed; cut before confrontation
  4. IMPOSSIBLE_CHOICE — forced to choose between two unchoosable things
  5. ARRIVAL           — unexpected person/force enters; end on frozen reaction
  6. TICKING_CLOCK     — time is almost up; protagonist does not know yet
  7. QUESTION_UNANSWERED — one line of dialogue that reframes everything
  8. POINT_OF_NO_RETURN — protagonist does/has done something irreversible

ROTATION RULES:
  ✗ NEVER use the same type as the immediately preceding episode.
  ✗ NEVER use the same type twice in any 3-episode window.
  ✓ Across any 8 consecutive episodes, all 8 types should appear at least once.

ESCALATION RULE:
  The emotional weight of each cliffhanger must be HIGHER than the
  previous one. Track the "stakes ceiling" and always push past it.

CLIFFHANGER CONSTRUCTION — THE FORMULA:
  1. PLANT a single detail in the episode's first half that only
     becomes terrifying by the end.
  2. BUILD tension across 3–5 lines before the cut moment.
  3. CUT at the moment of maximum unresolved tension.
  4. FINAL SENTENCE: 8 words or fewer. Or a question. Or a name.
  5. HINDI OUTRO: one contextual line naming the novel, on a new line.
`;

const FORESHADOWING_PAYOFF_ENGINE = `

**[FORESHADOWING & PAYOFF ENGINE — MANDATORY SEASON-LEVEL TRACKING]**

Every major story revelation must have a visible origin. The reader
who re-reads must find the seed. The reader who only reads forward
must not guess the twist until the detonation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEED PLACEMENT RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SEED TYPE A — OBJECT SEED
  A physical object appears with ordinary significance. Later its
  true meaning is revealed.

SEED TYPE B — DIALOGUE SEED
  A character says something that appears to be small talk. Later
  it is revealed as a confession, a threat, or a clue.

SEED TYPE C — BEHAVIOUR SEED
  A character's habit, flinch, or repeated action appears as
  personality. Later it is revealed as a symptom of guilt or fear.

SEED TYPE D — ABSENCE SEED
  What a character does NOT do, does NOT say, does NOT react to
  is the seed. The reader only notices the absence in hindsight.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYOFF EXECUTION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. The payoff must arrive in a SCENE, not in exposition.
  2. The payoff must have a CHARACTER REACTION that shows the reader
     how to feel. The reaction IS the payoff — not the fact.
     ✗ WRONG: "He discovered Rehan had been lying all along."
     ✓ CORRECT: "He read the name. Set it down. Read it again. Then
       laughed — a short, ugly sound that scared him more than the
       name did."
  3. After the payoff: do NOT immediately resolve the fallout.
  4. After a payoff: plant the NEXT seed in the same episode.

CHEKHOV'S GUN RULE:
  Every object or detail described in more than 3 words must either:
  (a) Have narrative purpose in this episode, OR
  (b) Be a seed for a future payoff.
  If it does neither — cut it.
`;

// ─────────────────────────────────────────────────────────────
// NEW CONSTANT 4: CHARACTER_PSYCHOLOGY_ENGINE
// ─────────────────────────────────────────────────────────────
const CHARACTER_PSYCHOLOGY_ENGINE = `

**[CHARACTER PSYCHOLOGY ENGINE — MANDATORY FOR EVERY SPEAKING CHARACTER]**

A character who behaves logically is a pawn. A character who behaves
consistently with their psychology — even when that psychology is
irrational, self-defeating, or contradictory — is a person the reader
will love, fear, and never be able to fully predict.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE 6-LAYER CHARACTER CORE (must be established for all main characters
by episode 3 and honoured every episode thereafter)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LAYER 1 — THE WOUND
  Something that happened before the story began that broke the
  character's trust, confidence, or sense of safety. This wound is
  NEVER explicitly named in early episodes — it is shown through
  overreaction, avoidance, or a specific trigger.
  Rule: Every main character must have a wound. If you cannot name it,
  you do not know your character. The wound drives ALL their flawed choices.

LAYER 2 — THE WANT
  What the character believes they need to be happy or safe. This is
  the surface goal. It may be wrong. It is what they pursue consciously.

LAYER 3 — THE NEED
  What the character ACTUALLY requires to heal and grow — usually the
  opposite of or in tension with the WANT. The story's job is to force
  the character toward the NEED by denying them the WANT.

LAYER 4 — THE GHOST
  A recurring memory, image, or moment from the past that intrudes on
  the present at moments of stress. The ghost must appear at least once
  per arc — not as a flashback, but as a fleeting intrusion into present
  action: a smell, a phrase, a face half-glimpsed.

LAYER 5 — THE MASK
  How the character hides their vulnerability from other characters
  AND from themselves. The mask is behaviour (aggression, humour,
  competence, coldness). The mask must crack at least once per arc.
  Rule: the crack must occur at the WORST possible moment for the character.

LAYER 6 — THE BREAK POINT
  The specific type of event that will cause the mask to fully shatter.
  This is the climax of the character arc. Plan it in the blueprint.
  Build toward it every episode. It must feel inevitable in retrospect.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE WOUND CHECK — Run before finalising every scene
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For every scene where a main character makes a decision:
  1. Is this decision consistent with their wound?
  2. Does this decision move them toward the WANT or toward the NEED?
  3. Are they aware of which one they're moving toward?
  → If their decision is purely logical with no psychological undercurrent,
    rewrite it. Real people do not make decisions without their past.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHARACTER CONTRADICTION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every main character must have at least 2 of these contradictions active
at all times (show them, do not announce them):

  CONTRADICTION A — Brave in public, terrified in private.
  CONTRADICTION B — Loyal to a person they privately resent.
  CONTRADICTION C — Claims not to want something they desperately need.
  CONTRADICTION D — Does something kind for a selfish reason.
  CONTRADICTION E — Protects someone who is already hurting them.
  CONTRADICTION F — Knows the right thing to do and consistently
                    chooses the wrong thing — for a reason that makes
                    painful sense given their wound.

✗ BANNED CHARACTER BEHAVIOUR:
  · A villain who is evil because they are evil.
  · A hero who always makes the right choice.
  · A character who states their own emotion: "Main bahut dara hua hoon."
  · A character who delivers exposition in dialogue: "Jab se mera baap
    mujhe chhod ke gaya tab se main..."
  · A character who changes without being forced to.
`;

// ─────────────────────────────────────────────────────────────
// NEW CONSTANT 5: SCENE_VELOCITY_ENGINE
// ─────────────────────────────────────────────────────────────
const SCENE_VELOCITY_ENGINE = `

**[SCENE VELOCITY ENGINE — MANDATORY FOR EVERY SCENE]**

A scene is not a description of events. A scene is a unit of change.
If the emotional balance, power dynamic, or information state between
two characters is IDENTICAL at the end of a scene as it was at the start,
the scene is dead weight. Cut it or rewrite it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE 3-BEAT SCENE STRUCTURE (mandatory for every scene over 200 words)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEAT 1 — ARRIVAL
  Establish: who is here, what do they want right now, and what is
  the current power balance between them?
  Rule: this must be established within the first 3 lines of the scene.
  Do NOT spend a paragraph on atmosphere before naming the tension.

BEAT 2 — ESCALATION
  Something changes. It can be small — a word, a look, new information,
  a physical action. But the power balance or emotional state must shift.
  The shift can go in ANY direction (higher tension, lower tension,
  new alliance, new wound). It must shift.
  Rule: the escalation must arrive in the scene's middle third.
  If nothing changes in the middle, the scene has no spine.

BEAT 3 — EXIT
  The scene ends in a DIFFERENT emotional register from where it began.
  The difference between ARRIVAL and EXIT is the scene's value.
  Rule: never end a scene where it began. Never end on "they left."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCENE VELOCITY TEST — Apply to every scene before finalising
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  □ Does this scene change something? (information / power / emotion)
  □ Does the scene have a clear ARRIVAL state and a different EXIT state?
  □ Is the escalation in the middle — not at the very start or very end?
  □ Does every line of dialogue in this scene do at least ONE of:
      reveal character, advance plot, create/deepen conflict, plant seed?
  □ Are there any lines of dialogue that could be cut without losing
    anything? → Cut them.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MOMENTUM RULES — Scene sequencing across the episode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  RULE 1 — ALTERNATE TENSION LEVELS: A high-tension scene must be
    followed by a medium-tension scene before another high-tension
    scene. Pure relentless tension numbs the reader. Contrast is what
    makes tension feel like tension.

  RULE 2 — THE SCENE PROMISE: Every scene must answer the promise of
    the previous scene's exit beat AND create a new promise for the next.
    The reader must feel pulled forward, not pushed.

  RULE 3 — NO FILLER TRAVEL: Characters in transit between locations
    must be thinking about, processing, or acting on the previous scene.
    No character may travel between scenes in an emotional vacuum.

  RULE 4 — THE COMPRESSION PRINCIPLE: If a scene's purpose can be
    achieved in 100 words, do not write 300. Dense scenes hit harder
    than padded ones. Cut to the moment of maximum tension every time.
`;

// ─────────────────────────────────────────────────────────────
// NEW CONSTANT 6: DIALOGUE_SUBTEXT_ENGINE
// ─────────────────────────────────────────────────────────────
const DIALOGUE_SUBTEXT_ENGINE = `

**[DIALOGUE SUBTEXT ENGINE — MANDATORY FOR ALL EMOTIONAL EXCHANGES]**

Real people do not say what they mean when they are in pain, in love,
afraid, or angry. They say something else. The gap between what is
said and what is meant IS the emotional experience of your reader.

A character who says "Main theek hoon" when they are breaking apart
gives the reader more pain than a character who says "Mujhe bahut
takleef ho rahi hai." The reader SEES the lie. The reader FEELS the
thing that cannot be said.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE SUBTEXT RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

In any scene where a character is experiencing a strong emotion
(love, grief, anger, fear, shame, longing, jealousy), at least 70%
of their dialogue must use INDIRECT EXPRESSION — the emotion is
communicated through what they talk AROUND, not through.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE 4 SUBTEXT MODES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MODE 1 — THE DISPLACEMENT: The character talks about a neutral or
  unrelated topic while their real emotion saturates every word.
  ✓ EXAMPLE (character is terrified their partner is leaving):
    "Chai theek bani hai aaj. Woh imported wali patti mili thi na
     bazaar mein. Aage milti rahegi shayad." [Translated feel: please
     don't go, please don't go, please don't go.]

MODE 2 — THE ATTACK: The character expresses love, fear, or grief
  as aggression. They are cruel because they cannot be vulnerable.
  ✓ EXAMPLE (character is frightened for someone's safety):
    "Tune phir raat ko bahar jaana tha? Bakwaas karna band kar.
     Kisi ko parwaah nahi teri? Theek hai. Jaa. Maar khaa baahar."
  Note: the brutality IS the love. Never explain this to the reader.

MODE 3 — THE PIVOT: A character changes the subject exactly when
  the conversation gets too close to the real thing. The pivot IS
  the confession.
  ✓ EXAMPLE (character can't admit they were wrong):
    "Ye sab chhod. Tune khana khaya? Subah se kuch nahi khaya
     lagta tera. Chal, kitchen mein chal."

MODE 4 — THE HALF-TRUTH: A character tells a true fact that is
  technically accurate but emotionally misleading — because the full
  truth would destroy them.
  ✓ EXAMPLE (character loves someone they can never have):
    "Haan, achchi ladki hai woh. Koi bhi khush rahega uske saath."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE TRANSLATION TEST — Run on every emotional dialogue exchange
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After writing an emotional dialogue exchange, apply the Translation Test:
  1. What does Character A literally say?
  2. What do they actually mean?
  3. What does Character B hear?
  4. What does Character B actually understand?
  5. Is the gap between (1) and (2) interesting?

If (1) and (2) are identical — the character is saying exactly what
they mean — rewrite the dialogue using one of the 4 Subtext Modes above.
Exception: a character may speak directly ONLY if the directness itself
is a surprising act of vulnerability that costs them something.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORBIDDEN DIRECT-EMOTION LINES (never write these)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✗ "Main tumse bahut pyaar karta hoon." (in a scene already full of love)
  ✗ "Mujhe bahut dukh hua." (in a scene where the dukh is visible)
  ✗ "Main bahut gusse mein hoon." (when anger is already in the action)
  ✗ Any line where a character explains their own backstory unprompted.
  ✗ Any line where a character explains their own feelings in clinical terms.

EXCEPTION: a character speaking a forbidden line becomes powerful ONLY
when they have been unable to say it for multiple episodes and finally
break — the release must be earned by restraint.
`;

// ─────────────────────────────────────────────────────────────
// NEW CONSTANT 7: EMOTIONAL_LAYERING_ENGINE
// ─────────────────────────────────────────────────────────────
const EMOTIONAL_LAYERING_ENGINE = `

**[EMOTIONAL LAYERING ENGINE — MANDATORY FOR ALL HIGH-STAKES SCENES]**

Flat emotion is told. Layered emotion is lived. The difference between
writing that makes readers feel something and writing that merely
describes feelings is the presence of THREE SIMULTANEOUS LAYERS.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE 3-LAYER EMOTIONAL STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LAYER 1 — THE INTERNAL (what the character feels in their body and mind)
  Private, unspoken, visceral. This is pure sensation and raw thought.
  Written in sensory/physical language — never abstract.
  ✗ WRONG:  "Woh bahut dara hua tha."
  ✓ CORRECT: "Uske haath band nahi ho rahe the. Woh unhe apni jango se
              chipkaa ke baitha raha, is umeed mein ki koi dekhe na."

LAYER 2 — THE EXTERNAL (what the character does / shows / says)
  What other characters in the scene see. Behaviour, micro-actions,
  facial expressions, physical choices. This is visible, observable.
  Rule: the external must be SLIGHTLY INCONSISTENT with the internal.
  The gap between what they feel and what they show is the story.

LAYER 3 — THE INFERRED (what the reader understands that no one in
  the scene has said)
  This is the layer the reader assembles from the gap between Layer 1
  and Layer 2. It is what makes reading feel like insight.
  Rule: the inferred layer should be richer, darker, or more complex
  than either the internal or external layer alone. If it isn't, the
  scene is not working hard enough.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE DIVERGENCE PRINCIPLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Power increases in proportion to how different the three layers are.
The MAXIMUM emotional impact is when:
  · Layer 1 is the OPPOSITE of Layer 2, AND
  · Layer 3 reveals something that neither Layer 1 nor Layer 2 admits.

✓ EXAMPLE (grief scene after a character receives devastating news):
  LAYER 1: "Jaise andar sab kuch do hiSSon mein kat gaya ho. Ek hissa
             jo aage chal raha tha. Ek hissa jo wahi ruk gaya."
  LAYER 2: "Usne apna phone uthaya. 'Teek hai,' usne kaha. 'Main
             kal milta hoon.' Phir usne phone rakh diya aur ek glass
             paani dhoondne ke liye uthh gaya."
  LAYER 3: [The reader understands he is going to do something very
             quiet and very final, and that the glass of water is the
             last ordinary thing he will reach for.]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE RESTRAINT RULE — NEVER EXPLAIN THE EMOTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If all three layers are present, you MUST NOT then add a fourth layer
that explains what the reader just felt. Trust the reader.

✗ FORBIDDEN CLOSING EXPLANATIONS:
  "Woh toot gaya tha."
  "Yeh pal uske liye bahut mushkil tha."
  "Is tarah unka rishta hamesha ke liye badal gaya."

These lines are the writer losing nerve after a perfect scene.
If you wrote the 3 layers correctly, the reader already feels all of
this. Stating it out loud kills it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EMOTIONAL REGISTER CHECKLIST — Before finalising every scene
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  □ Is Layer 1 written in physical/sensory language, not abstract labels?
  □ Is Layer 2 slightly inconsistent with Layer 1 (mask is on)?
  □ Does Layer 3 give the reader more than either layer stated?
  □ Have I avoided closing the scene with an explanatory sentence?
  □ Is the emotional register of this scene DIFFERENT from the scene
    immediately before it? (If both scenes are grief, one must be
    cold grief and one hot grief — they must not feel identical.)
`;

const EPISODE_STRUCTURE_RULES = `

**[EPISODE ENTRY POINT RULES (MANDATORY — EVERY EPISODE)]**

The opening of every episode is the most important real estate in the
entire chapter. A listener who is not gripped within the first three
lines will stop. There is no recovery from a weak opening.

Every episode entry must do THREE things in order:

  STEP 1 — HOOK        : grab attention in the very first line
  STEP 2 — BRIDGE      : honour the previous cliffhanger (ep 2 onward)
  STEP 3 — LAUNCH      : establish THIS episode's central tension
                          before the end of the first paragraph

════════════════════════════════════════════════════
STEP 1 — THE HOOK (the single most important sentence you will write)
════════════════════════════════════════════════════

The first line of an episode must do one of four things:
  (A) Drop the listener into the middle of action already in motion
  (B) Deliver a statement so strange or alarming it demands explanation
  (C) Raise a question the listener did not know they needed answered
  (D) Strike an emotional nerve before any context is given

NEVER open with:
  ✗ A weather description
  ✗ A character waking up
  ✗ "Aaj ka din kuch alag tha..."
  ✗ A recap of the previous episode in narration
  ✗ A character's name followed by a routine action
  ✗ A paragraph of background information

────────────────────────────────────────────────────
THE 8 ENTRY TYPES — rotate across episodes, never repeat consecutively
────────────────────────────────────────────────────

ENTRY TYPE 1 — IN MEDIAS RES (drop into action mid-motion)
  Begin inside a scene already moving at full speed.
  No setup. No context. The listener will catch up — trust them.

  ✗ WRONG:
      Arjun subah uthaa. Usne chai banaai. Phir uske phone ki ghanti baji.
      Woh jaanta tha ke aaj ka din mushkil hoga. Usne phone uthaya.

  ✓ CORRECT:
      Arjun ke haath tab ruke jab usne number dekha — wahi number
      jise usne teen saal pehle apne phone se delete kiya tha.
      Usne phir bhi uthaya.

────────────────────────────────────────────────────

ENTRY TYPE 2 — THE ALARMING STATEMENT
  Open with a sentence that is factually true within the story world
  but sounds impossible, wrong, or deeply unsettling.
  No character name required. Let the statement land alone first.

  ✓ EXAMPLE (thriller):
      Laash ki pehchaan ho gayi thi.
      Problem yeh thi ke woh abhi bhi zinda thi.

  ✓ EXAMPLE (romance):
      Woh shaadi mein aaya tha — apni ex-girlfriend ki shaadi mein.
      Woh nahi jaanta tha ke dulhan usski behen hogi.

  ✓ EXAMPLE (superpower/fantasy):
      Sheher mein pehli baar in saat saalon mein baarish hui thi.
      Aur Vikram ko pata tha yeh uski wajah se hua hai.

────────────────────────────────────────────────────

ENTRY TYPE 3 — THE QUESTION THAT HAUNTS
  Open with a question — asked by the narrator, by the POV character
  internally, or left hanging in the air with no speaker.
  The episode is the attempt to answer it.

  ✓ EXAMPLE:
      Ek cheez thi jo Priya samajh nahi pa rahi thi —
      agar Rehan ne usse dhoka nahi diya tha,
      toh woh khud kyun lag raha tha jaise usne diya ho?

  ✓ EXAMPLE (direct hook):
      Kaun tha woh aadmi jo har raat uss gali ke corner pe khada rehta tha —
      aur sirf tab gaayab hota tha jab Zara window se bahar dekhti thi?

────────────────────────────────────────────────────

ENTRY TYPE 4 — THE EMOTIONAL AMBUSH
  Start with a feeling so specific and precise that the listener is
  pulled into the character's body before they even know who it is.
  Name the emotion through sensation — not the word for the emotion.

  ✗ WRONG (names the emotion, doesn't create it):
      Kabir bahut dara hua tha. Usse darr lag raha tha kuch bura hone ka.

  ✓ CORRECT (sensation creates the emotion):
      Kabir ke haath pasiine se bheege the — aur kamra thanda tha.
      Woh apni saansein gin raha tha kyunki agar woh ginta nahi
      toh woh saans lena bhool jaata.

  ✓ ANOTHER EXAMPLE (grief):
      Sabse mushkil tha subah ka pehla minute —
      woh minute jab neend se jaagna hota hai
      aur ek second ke liye sab theek lagta hai.
      Phir yaad aata hai.

────────────────────────────────────────────────────

ENTRY TYPE 5 — THE SCENE THAT SHOULDN'T EXIST
  Open with a juxtaposition — two things happening simultaneously
  that logically cannot, or emotionally should not, coexist.
  The tension of the contradiction IS the hook.

  ✓ EXAMPLE:
      Sheher mein Diwali ki roshan thi.
      Aur Arjun apne haath se khoon dhone ki koshish kar raha tha.

  ✓ EXAMPLE:
      Unki shaadi ki saalgirah thi aaj.
      Dev ne ek bhi message nahi kiya.
      Nisha ne count kiya — teen ghante, sattaais minute.

────────────────────────────────────────────────────

ENTRY TYPE 6 — THE OBJECT OR DETAIL THAT DOESN'T BELONG
  Open on a physical object or a sensory detail that is out of place.
  Do not explain it. Let the wrongness of it pull the listener forward.

  ✓ EXAMPLE:
      Riya ke daftar ki kursi par ek lifaafa rakha tha —
      bina naam ke, bina stamp ke, bina kisi explanation ke.
      Andar ek hi cheez thi: uski apni handwriting mein ek chitthi
      jo usne kabhi likhi hi nahi thi.

  ✓ EXAMPLE:
      Teen cheezein galat thi uss ghar mein.
      Ek — darwaza andar se band tha, jab Meera bahar thi.
      Do — lights on thi, jab usne jaate waqt band ki thi.
      Teen — usska kutta, jo hamesha bhaunkta tha, chup tha.

────────────────────────────────────────────────────

ENTRY TYPE 7 — THE BRIDGE THAT TWISTS (ep 2 onward — best for continuity)
  Pick up EXACTLY from the previous cliffhanger —
  but immediately subvert what the listener expected would happen next.
  The bridge IS the hook because it rewrites the assumption.

  [Previous episode ended with:]
      "Ye bachcha mera hai — ya Raghav ka?"

  ✗ WRONG bridge (expected — listener already guessed this):
      Nisha ne Dev ki aankhon mein dekha. Aansuon ne jawaab de diya.
      "Raghav ka," usne dheere se kaha.

  ✓ CORRECT bridge (subverts — listener did not see this coming):
      Nisha ne Dev ki aankhon mein dekha.
      Phir woh hans padi.
      Itni zor se ke Dev ka haath apne aap peechhe hat gaya.
      "Yeh sawaal," usne kaha, aansuon aur hassi ke beech mein,
      "tune teen saal der se puchha hai."

────────────────────────────────────────────────────

ENTRY TYPE 8 — THE NARRATOR'S WARNING
  The narrator speaks directly to the listener — breaking the fourth wall
  for one line only — to signal that what follows will change everything.
  Use sparingly. Maximum once every 10 episodes. Impact comes from rarity.

  ✓ EXAMPLE:
      Yeh woh episode hai jiske baad kahani woh nahi rahegi
      jo aap abhi tak samajh rahe the.
      Dhyan se suniye.

════════════════════════════════════════════════════
STEP 2 — THE BRIDGE (episode 2 onward — mandatory)
════════════════════════════════════════════════════

After the hook, the episode MUST honour the previous cliffhanger.
The listener waited. They came back. Acknowledge that within the
first paragraph — before moving into new territory.

BRIDGE RULES:
  1. Never repeat the cliffhanger line word-for-word as recap narration.
     That is lazy. Pick up from inside the moment — mid-breath, mid-step.

  2. The bridge should be 3–6 lines maximum. Then move forward.
     Do not linger in the cliffhanger's aftermath longer than necessary.

  3. The best bridge RESOLVES one layer of the cliffhanger
     while immediately opening a deeper, newer layer beneath it.
     Answer one question. Ask a worse one.

  ✓ BRIDGE EXAMPLE (previous cliffhanger: hero saw a dead man walk in):
      The man was not a ghost.
      Arjun knew that because ghosts do not shake hands —
      and this man's grip was firm, warm, real.
      "Tum..." Arjun could not finish the sentence.
      The man smiled. "Main jaanta hoon. Maine bhi socha tha
      main mar gaya hoon." He sat down. "Baad mein baat karte hain.
      Pehle tumhein kuch dikhana hai."
      He pulled out a file Arjun had never seen —
      with Arjun's own name on the cover.

════════════════════════════════════════════════════
STEP 3 — THE LAUNCH (this episode's central tension)
════════════════════════════════════════════════════

By the end of the first full paragraph, the listener must know:
  (a) WHERE we are — place, time, atmosphere (1 sensory flash — max 2 lines)
  (b) WHO is at the centre — protagonist's current state, not backstory
  (c) WHAT is at stake — the specific problem of THIS episode, not the novel

The launch is not a summary. It is a compass bearing.
Point once. Then move.

  ✓ LAUNCH EXAMPLE:
      [After bridge resolving previous cliffhanger]

      Raaton ki cold coffee aur teen ghante ki neend — yahi tha
      Arjun ka score is hafte ka. File uske saamne thi.
      Baara pages. Uska naam, uske kaam ki details, aur ek sawaal
      jiska woh jawab nahi dena chahta tha lekin ab dena padega:
      Kya usne jaanboojhkar woh evidence chhupaaya tha — ya kisine
      usse chhupaane par majboor kiya tha?
      Ek ghante mein Commissioner ka darwaza kholna tha.
      Abhi ke liye, woh akela tha. File ke saath. Aur sach ke saath.

════════════════════════════════════════════════════
FULL EPISODE OPENING — ASSEMBLY EXAMPLE
════════════════════════════════════════════════════

[Episode 7 — previous cliffhanger was Type 3: Betrayal Cut]
[Entry Type used: TYPE 7 — Bridge That Twists]

──────────────────────────────────────

  HOOK + BRIDGE (subverts the expected reaction):

      Priya ne woh messages dobara padhe. Ek baar. Phir ek baar.
      Aur phir usne Kabir ka phone waapis uski jacket mein rakh diya —
      bilkul wahi fold mein, bilkul wahi angle pe —
      jaise usne kabhi uthaya hi na ho.

      Woh hasna chahti thi. Yeh uska masla tha hamesha se —
      jab cheezein sabse buri hoti thi, woh hasna chahti thi.
      Toh woh hansi. Dheere se. Apne haath ko mooh pe rakhke.
      Kyunki agar woh roti, toh Kabir samajh jaata.
      Aur agar Kabir samajh jaata, toh woh bhaag jaata.
      Aur Priya usse abhi bhaagne nahi dena chahti thi.

  LAUNCH (this episode's central tension — established clearly):

      Do cheezein thi jo usske paas thi:
      Ek — woh jaanti thi.
      Do — woh abhi tak nahi jaanta tha ke woh jaanti thi.
      Yeh uss ka advantage tha. Ek ghante ka, shayad do ghante ka.
      Usse use karna tha.

──────────────────────────────────────

[Hindi Outro — at the very end of this same episode]

      Priya ka yeh juaa kitna kaamyaab hoga —
      aage kya hoga jaanane ke liye suntey rahiye 'Zulm Ki Zanjeer'...

════════════════════════════════════════════════════
FIRST EPISODE SPECIAL RULES (Episode 1 only)
════════════════════════════════════════════════════

The first episode has no previous cliffhanger to bridge.
It carries one extra job: make the listener fall in love with
the protagonist's world before the end of the first page.

  RULE A — Introduce the protagonist in motion, not in description.
    Show them doing something that reveals character, not background.
    The listener learns WHO they are from what they DO and SAY.

  RULE B — Plant the novel's central question in episode 1.
    This is the question the entire novel will try to answer.
    It does not need to be stated explicitly — but it must be felt.

  RULE C — End episode 1 on the STRONGEST possible cliffhanger.
    This is the promise you make to the listener.
    Everything that follows must feel like keeping that promise.

  ✓ EPISODE 1 OPENING EXAMPLE (thriller):

      Uss raat teen cheezein ek saath huin.
      Pehli — light chali gayi.
      Doosri — Arjun ke phone ki battery khatam ho gayi.
      Teesri — koi darwaza khatkhatane laga.
      Bahar se nahi. Andar se.

════════════════════════════════════════════════════
SELF-AUDIT — BEFORE FINALISING EVERY EPISODE OPENING
════════════════════════════════════════════════════

  □ Does the first line use Entry Type A, B, C, or D — no weather, no wakeup?
  □ Is the entry type different from the previous episode?
  □ Is the hook delivered in 3 lines or fewer before any context is given?
  □ Is the previous cliffhanger bridged within the first paragraph (ep 2+)?
  □ Does the bridge subvert — not just confirm — what the listener expected?
  □ Is the bridge 6 lines or shorter before moving to new tension?
  □ Does the launch establish WHERE + WHO + WHAT IS AT STAKE this episode?
  □ Is the launch complete before the end of the second paragraph?
  □ For Episode 1: is the protagonist introduced in motion, not description?

If any box is unchecked — revise the opening before writing the episode body.

**[CLIFFHANGER ENGINE + HINDI OUTRO RULES (MANDATORY — EVERY EPISODE)]**

════════════════════════════════════════════════════
PART 1 — THE CLIFFHANGER (second-to-last beat of every episode)
════════════════════════════════════════════════════

Every episode MUST end on a cliffhanger. Not a soft pause. Not a chapter
summary. A genuine, stomach-dropping moment of unresolved tension that
makes it IMPOSSIBLE for the listener/reader to stop here.

A cliffhanger is NOT the end of a scene. It is the moment a scene tears
open a new wound — and then the episode cuts, leaving it bleeding.

────────────────────────────────────────────────────
THE 8 CLIFFHANGER TYPES — use a DIFFERENT type each episode:
────────────────────────────────────────────────────

TYPE 1 — THE REVELATION BOMB
  A secret surfaces at the worst possible moment.
  The reader just learned something that changes everything they thought
  they knew. End before any character can react to it fully.

  ✓ EXAMPLE:
      Arjun tore open the envelope — just a formality, he had thought.
      His eyes stopped at the third line. Then went back to it.
      It wasn't Rehan's signature at the bottom.
      It was his father's.

────────────────────────────────────────────────────

TYPE 2 — THE THREAT WITH NO EXIT
  The protagonist is cornered — physically, emotionally, or morally.
  Show them trapped. Do not show the escape. Cut there.

  ✓ EXAMPLE:
      The lift doors slid open on the wrong floor.
      Three men. The kind who don't ask twice.
      Vikram's phone showed no signal. Of course.
      The middle one smiled. "Bahut dhundha tumhe."

────────────────────────────────────────────────────

TYPE 3 — THE BETRAYAL CUT
  Someone the audience trusted is revealed to be working against the hero.
  Show the evidence or the act — do not show the confrontation. Cut first.

  ✓ EXAMPLE:
      Priya had been so careful. She had checked everything.
      But she hadn't checked Kabir's second phone —
      the one that showed eighteen messages to a number
      she recognised as the man who had tried to kill her.

────────────────────────────────────────────────────

TYPE 4 — THE IMPOSSIBLE CHOICE
  Force the protagonist to choose between two things they cannot both keep.
  Name the choice clearly. Do not let them choose before the episode ends.

  ✓ EXAMPLE:
      "Tumhare paas das minute hain," the voice on the phone said.
      "Apni beti ko bachao — ya apna saboot. Dono nahi bachenge."
      Riya's hands were shaking so badly she could barely hold the phone.
      She looked at the folder. Then at her daughter's photo on the wall.

────────────────────────────────────────────────────

TYPE 5 — THE ARRIVAL (unexpected person / force enters the scene)
  Someone walks in — or something happens — that no one was prepared for.
  Show the arrival. Do not show what follows. End on the frozen reaction.

  ✓ EXAMPLE:
      The courtroom went silent before anyone had spoken a word.
      Zara turned to see what everyone was staring at.
      The man who walked through those doors had been dead for two years.
      At least, that is what they had all been told.

────────────────────────────────────────────────────

TYPE 6 — THE TICKING CLOCK REVEALED
  The audience learns, for the first time, that time is almost up —
  and the protagonist does not know yet. End before they find out.

  ✓ EXAMPLE:
      What Arjun did not know — what no one had told him —
      was that the bomb had not been placed in the warehouse at all.
      It had been placed in his car.
      The same car his daughter had borrowed that morning.

────────────────────────────────────────────────────

TYPE 7 — THE QUESTION THAT CANNOT BE UNASKED
  End on a single line of dialogue — a question, a statement, or a name —
  that rips the ground from under the protagonist and the reader both.
  No narration after it. The line IS the cut.

  ✓ EXAMPLE:
      Dev set the photograph on the table between them, face up.
      He watched Nisha look at it. Watched the colour drain from her.
      Then, very quietly, he asked —
      "Ye bachcha mera hai — ya Raghav ka?"

────────────────────────────────────────────────────

TYPE 8 — THE POINT OF NO RETURN
  The protagonist does something — or something is done to them — that
  cannot be undone. The consequences are not shown. The episode cuts
  at the moment of the action itself.

  ✓ EXAMPLE:
      Kabir had told himself he would never pull the trigger.
      He had believed that, right up until the moment he did.

════════════════════════════════════════════════════
CLIFFHANGER CONSTRUCTION RULES
════════════════════════════════════════════════════

  1. ESCALATION LADDER — each episode's cliffhanger must feel MORE urgent
     than the previous one. Stakes must visibly rise across the novel.
     Never use the same emotional register twice in a row.

  2. ONE WOUND, ONE CUT — one revelation, one question, one arrival.
     Do NOT stack two cliffhangers together. One sharp edge cuts deeper
     than two blunt ones.

  3. THE FINAL SENTENCE FORMULA:
     → End the cliffhanger on a short sentence (8 words or fewer).
     → Or end on a question mark.
     → Or end on a name — spoken or written — that means something.
     Never end on a long descriptive paragraph. Punch. Then silence.

  4. NO RESOLUTION — the cliffhanger question must NOT be answered in
     the same episode. If you answer it, it is not a cliffhanger.
     It is a plot point. Answer it in the NEXT episode — but only
     after creating a new wound first.

  5. PLANT THE SEED EARLY — the best cliffhangers feel inevitable in
     hindsight. Plant one detail in the first half of the episode
     that only becomes terrifying by the end.

════════════════════════════════════════════════════
PART 2 — THE HINDI OUTRO LINE (very last line of every episode)
════════════════════════════════════════════════════

After the cliffhanger — on a new line, separated by a blank line —
write ONE contextual Hindi outro line.

This outro must:
  (a) Mirror the specific cliffhanger of THIS episode — not generic
  (b) Name the novel: replace [Novel Name] with the actual novel title
  (c) Create verbal suspense — the listener must FEEL the gap
  (d) Be 1 sentence only. Never two.
  (e) End with no punctuation after the novel name, OR end with "..."

────────────────────────────────────────────────────
OUTRO FORMULA LIBRARY — choose or adapt the best fit each episode:
────────────────────────────────────────────────────

  FOR REVELATION BOMB:
  "किसका हाथ था इस साज़िश में — यह जानने के लिए सुनते रहिए '[Novel Name]'..."

  FOR THREAT WITH NO EXIT:
  "क्या [Character] इस जाल से निकल पाएगा — जानने के लिए सुनते रहिए '[Novel Name]'..."

  FOR BETRAYAL:
  "कौन है जो अपनों के भेस में दुश्मन बनकर खड़ा है — सुनते रहिए '[Novel Name]'..."

  FOR IMPOSSIBLE CHOICE:
  "अब [Character] क्या चुनेगा — ज़िंदगी या सच्चाई — सुनते रहिए '[Novel Name]'..."

  FOR UNEXPECTED ARRIVAL:
  "इस अनजान चेहरे के पीछे कौन सा राज़ छुपा है — सुनते रहिए '[Novel Name]'..."

  FOR TICKING CLOCK:
  "वक़्त कम है — और ख़तरा बहुत क़रीब — आगे क्या होगा जानने के लिए सुनते रहिए '[Novel Name]'..."

  FOR THE UNANSWERED QUESTION:
  "इस सवाल का जवाब क्या होगा — आगे क्या होगा जानने के लिए सुनते रहिए '[Novel Name]'..."

  FOR POINT OF NO RETURN:
  "एक ग़लती — और अब सब बदल जाएगा — आगे क्या होगा जानने के लिए सुनते रहिए '[Novel Name]'..."

  UNIVERSAL FALLBACK (use only if no specific formula fits):
  "आगे क्या होगा जानने के लिए सुनते रहिए यह कहानी '[Novel Name]'..."

────────────────────────────────────────────────────
FULL EPISODE ENDING — ASSEMBLY EXAMPLE:
────────────────────────────────────────────────────

  [Last scene of the episode — cliffhanger TYPE 3: Betrayal Cut]

      Priya had been so careful. She had checked everything.
      But she hadn't checked Kabir's second phone —
      the one that showed eighteen messages to a number
      she recognised as the man who had tried to kill her.

  [Blank line]

  [Hindi outro — mirrors this specific betrayal cliffhanger]

      कौन है जो अपनों के भेस में दुश्मन बनकर खड़ा है —
      सुनते रहिए 'Zulm Ki Zanjeer'...

────────────────────────────────────────────────────
ANOTHER FULL EXAMPLE (TYPE 7 — The Question):

  [Cliffhanger]

      Dev set the photograph on the table between them, face up.
      He watched Nisha look at it. Watched the colour drain from her.
      Then, very quietly, he asked —
      "Ye bachcha mera hai — ya Raghav ka?"

  [Outro]

      इस एक सवाल से हिल जाएगी पूरी कहानी —
      आगे क्या होगा जानने के लिए सुनते रहिए 'Zulm Ki Zanjeer'...

════════════════════════════════════════════════════
SELF-AUDIT — BEFORE FINALISING EVERY EPISODE
════════════════════════════════════════════════════

  □ Is the cliffhanger a DIFFERENT type from the previous episode?
  □ Does the cliffhanger end in 8 words or fewer / a "?" / a name?
  □ Is there ZERO resolution of the cliffhanger in this episode?
  □ Is a seed for this cliffhanger planted in the episode's first half?
  □ Is the Hindi outro on its own line, separated by a blank line?
  □ Does the outro mirror THIS specific cliffhanger — not a generic line?
  □ Is the novel name correctly placed inside single quotes in the outro?
  □ Is the outro exactly 1 sentence — not two?

If any box is unchecked — revise before outputting the final draft.
`;

// ─────────────────────────────────────────────────────────────
// NEW CONSTANT 8: TTS_AUDIO_FIRST_RULES
// ─────────────────────────────────────────────────────────────
const TTS_AUDIO_FIRST_RULES = `

**[TTS AUDIO-FIRST WRITING RULES — MANDATORY — THIS NOVEL IS READ & LISTENED TO]**

This novel is consumed via text-to-speech (TTS) audio by millions of listeners.
Every word you write will be HEARD, not just read. Audio has no bold, no italic,
no formatting. Only the words — spoken aloud — remain.

Write as if you are writing for the voice, not the page.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUDIO CLARITY RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RULE A — NO SILENT FORMATTING TRICKS
✗ BANNED: Bold, italics, ALL CAPS for emphasis, bullet points, headers,
  or any markdown formatting inside episode prose. A TTS engine ignores
  all of this. Emphasis must come from WORD CHOICE and SENTENCE POSITION.
  ✓ CORRECT: Put the most important word at the END of the sentence.
  ✓ CORRECT: Use a very short sentence after a long one for impact.

RULE B — ATTRIBUTION MUST BE CRYSTAL CLEAR IN AUDIO
  In audio, the listener cannot go back two lines to check who spoke.
  Every dialogue exchange must be anchored so clearly that the listener
  NEVER loses track of who is speaking — even eyes-closed, hands-busy.
  ✗ WRONG: Three or more consecutive untagged dialogue lines.
  ✓ CORRECT: After every 2 untagged exchanges, re-anchor with an action
    beat, a name, or a physical gesture that identifies the speaker.

RULE C — NUMBERS AND SYMBOLS SPELLED OUT
  TTS engines misread numerals and symbols.
  ✗ BANNED: "₹50,000", "3:00 AM", "#1", "2nd", "50%"
  ✓ CORRECT: "paanch hazar rupaye", "raat ke teen baje", "pehle number par",
    "doosri baar", "aadhe se zyaada"

RULE D — AVOID TONGUE-TWISTERS AND HARSH CONSONANT CLUSTERS
  Sequences of similar sounds (e.g., "shashank se shaadi") or 5+ consonants
  in a row sound terrible when synthesized. Test every line by reading it
  aloud mentally. If it stumbles, rewrite.
  ✗ AWKWARD AUDIO: "Sandstorm se scared Sameer suddenly stumbled"
  ✓ CLEAR AUDIO: "Andhere mein Sameer ke paon lad gaye"

RULE E — PAUSE ENGINEERING — USE PUNCTUATION AS BREATH
  The em-dash (—) is a pause of 0.5 seconds in audio. The ellipsis (...)
  is 0.75 seconds. A new paragraph is a 1-second breath.
  Use these deliberately to create dramatic timing in audio.
  ✓ IMPACT PAUSE: "Usne woh file kholi. Ek naam tha andar —\n\nArjun ka."
  ✓ DREAD BUILD: "Darwaza khula... aur jo andar khada tha... woh banda
    tha jo teen saal pehle mar chuka tha."

RULE F — PHONICALLY STRONG SENTENCE ENDINGS
  The last word of a sentence is the word that lands hardest in audio.
  It is what the listener carries forward.
  ✗ WEAK ENDING: "Woh kuch nahi bola tha us raat mein."
  ✓ STRONG ENDING: "Us raat, woh kuch nahi bola."
  ✓ STRONGEST ENDING: "Us raat — khamoshi."

RULE G — SPEAKER-DISTINCT VOCABULARY FOR MULTI-VOICE TTS
  The TTS engine assigns different voices to the Narrator and each
  character. To make each voice instantly identifiable:
  · Narrator: calm, measured sentences. Third-person. Sensory.
  · Hero: short, direct, low-syllable Hinglish. Sentences often
    end with a single-word punch or a question.
  · Heroine: slightly longer sentences. Emotional precision.
    Uses body-language-loaded verbs ("bol nahi paayi", "mooh pher liya").
  · Villain: sophisticated vocabulary. Full sentences. Never contractions.
    Pauses after key words (use em-dash for placement).

RULE H — HINDI OUTRO LINE (already mandated — reinforce for audio)
  The outro line ends EVERY episode. In audio, this is the LAST thing
  the listener hears. It must:
  · Sound like a professional podcast/serial host signing off
  · Have a falling intonation naturally (Hindi outro formulas already do this)
  · Be followed by silence in the text (nothing after it)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUDIO SELF-AUDIT — BEFORE FINALISING EVERY EPISODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  □ Read the first paragraph aloud mentally — does it flow without stumbling?
  □ Is every number written as a word, not a numeral?
  □ Is every speaker attributable eyes-closed after 2 lines max?
  □ Are em-dashes and ellipses placed for maximum dramatic pause?
  □ Does every sentence end on its most powerful word?
  □ Is the outro the very last line — followed by nothing?

`;

// ─────────────────────────────────────────────────────────────
// NEW CONSTANT 9: PROSE_RHYTHM_ENGINE
// ─────────────────────────────────────────────────────────────
const PROSE_RHYTHM_ENGINE = `

**[PROSE RHYTHM ENGINE — MANDATORY — THE HEARTBEAT OF HINDI FICTION]**

Sentence architecture is not grammar. It is music.
The length, weight, and sequence of sentences is what creates the reader's
physical experience of the text. Vary it deliberately — or the story feels flat,
no matter how good the plot is.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE 5 SENTENCE WEIGHTS — Use all five. Never stay in one for more than
3 consecutive sentences.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WEIGHT 1 — THE BULLET (1–4 words)
  Maximum impact. Ends a thought like a door slamming.
  Use for: revelation, decision, the word after the pause.
  ✓ EXAMPLES: "Kuch nahi bola." / "Woh gir gayi." / "Naam tha Arjun." / "Ruk."

WEIGHT 2 — THE DART (5–10 words)
  Clean, direct, no filler. Carries one clear image or action.
  Use for: action beats, short internal thoughts, dialogue tags with precision.
  ✓ EXAMPLE: "Usne file mez par paltaar ke rakh di."
  ✓ EXAMPLE: "Uski saans ruk gayi — ek pal ke liye."

WEIGHT 3 — THE WAVE (11–20 words)
  The working sentence. Carries scene description, emotional beats,
  mid-scene action. Most sentences in a well-written chapter are here.
  ✓ EXAMPLE: "Arjun ne window ke bahar dekha — baadal ghire hue the,
    aur raat ka andha andhera sheher ko neeche se dhak raha tha."

WEIGHT 4 — THE RIVER (21–35 words)
  Long, breathing, immersive. Use for: flowing thought sequences, building
  emotional states, describing a complex environment in one sweep.
  Use sparingly — maximum 1 per 3–4 paragraphs.
  ✓ EXAMPLE: "Yeh ghar — yeh wahi ghar tha jahan usne teri awaaz pehli baar
    suni thi, jahan ek raat ki baarish mein dono ne ek hi chhaat ke neeche
    khade hokar sochha tha ki shayad duniya itni buri bhi nahi hoti."

WEIGHT 5 — THE FRAGMENT (not a complete sentence)
  Deliberate. Violent. Used for maximum emotional disruption.
  ✗ NEVER use accidentally. ONLY use intentionally, maximum 2 per episode.
  ✓ EXAMPLE: "Teen saal. Sirf teen saal."
  ✓ EXAMPLE: "Uski galti. Sab uski galti."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE 3 RHYTHM PATTERNS — Use these to sequence sentence weights
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PATTERN A — TENSION BUILD (build → release)
  Wave → Wave → Dart → Bullet
  Use for: approaching danger, rising suspense, a conversation turning.
  ✓ The reader's breath shortens with each sentence until the bullet lands.

PATTERN B — EMOTIONAL AVALANCHE (long → devastating short)
  River → Wave → Dart → Bullet → (silence — new paragraph)
  Use for: grief reveals, confession moments, the moment after a betrayal.
  ✓ The emotional weight builds, then collapses into a single word.

PATTERN C — STACCATO ATTACK (action sequence, fight, chase)
  Bullet → Dart → Bullet → Bullet → Dart → Bullet
  Use for: physical confrontations, rapid scene cuts, panic.
  ✗ NEVER use a River or long Wave during action. It kills momentum.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARAGRAPH RHYTHM RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  · IDEAL PARAGRAPH: 3–5 sentences mixing at least 2 weight classes.
  · ✗ BANNED: 5 consecutive sentences of the same weight.
  · ✗ BANNED: A paragraph of 10+ sentences without a white-space break.
  · ✓ MANDATORY: One single-sentence paragraph per 500 words.
    (This sentence must use WEIGHT 1 or WEIGHT 2 — no exceptions.)
  · ✓ MANDATORY: Every scene change = new paragraph (blank line separator).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HINDI CADENCE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hindi has a natural falling cadence — sentences end with verbs.
Exploit this for rhythm:
  · Action ends with the action verb: "...gayi." / "...de diya." / "...ruk gaya."
  · Emotion ends with the felt word: "...dard." / "...khamoshi." / "...woh."
  · Tension ends with an unresolved verb form: "...aa rahi thi." / "...soch raha tha."
  The verb-end rhythm is what gives Hindi fiction its pull.
  ✗ BROKEN RHYTHM: "Woh darwaze ki taraf badhne laga, dheere se, bina kisi awaaz ke." 
    (adverbs after the verb break the cadence)
  ✓ CORRECT RHYTHM: "Dheere se, bina kisi awaaz ke, woh darwaze ki taraf badha."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROSE RHYTHM SELF-AUDIT — Before finalising every 500 words
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  □ Have I used all 5 sentence weights in this passage?
  □ Are there any 5+ consecutive sentences of the same weight? (Break them.)
  □ Have I used at least one single-sentence paragraph per 500 words?
  □ Does the action sequence use Pattern C (Staccato Attack)?
  □ Does the emotional climax use Pattern B (Emotional Avalanche)?
  □ Do sentences end on their most powerful word (verb or key noun)?

`;

// ─────────────────────────────────────────────────────────────
// NEW CONSTANT 10: VILLAIN_ARCHITECTURE_ENGINE
// ─────────────────────────────────────────────────────────────
const VILLAIN_ARCHITECTURE_ENGINE = `

**[VILLAIN ARCHITECTURE ENGINE — MANDATORY FOR ALL ANTAGONIST SCENES]**

A villain who is evil because they are evil is a cardboard prop.
A villain who believes — with complete sincerity — that they are RIGHT,
is the engine of every great story.

The reader must understand the villain. They must even briefly agree with them.
Because the moment the reader thinks "I see why he did that" — the hero's
victory over them costs something real.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE 4-LAYER VILLAIN CORE (establish by the villain's 3rd scene)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LAYER 1 — THE ORIGINAL WOUND (same as hero, different response)
  Something broke the villain before the story began — just as it broke
  the hero. The villain's wound must be COMPREHENSIBLE, possibly even
  sympathetic. The difference is: the villain chose the wound's poison
  as their weapon. The hero chose it as their lesson.
  Rule: the villain's wound must be revealed in a scene, not in exposition.
  Rule: the hero and villain must share at least one wound in common.
  This is the MIRROR QUALITY. Without it, the villain is decorative.

LAYER 2 — THE PHILOSOPHY (the villain's complete, internally logical worldview)
  Every great villain has a philosophy that explains their every action.
  It is NOT "power is good" or "money matters." It is a specific, carved,
  articulate belief about how the world works and what it deserves.
  ✓ EXAMPLE PHILOSOPHY: "Duniya mein koi bhi sirf tabhi jeeta hai
    jab woh kisi ko maar ke aage badha ho. Main bas honest hoon iske baare mein."
  The villain must be able to explain their worldview in one speech.
  If they cannot — they are not designed. Design them before writing them.

LAYER 3 — THE SPECIFIC CRUELTY (what makes this villain uniquely terrifying)
  Generic cruelty = kills people, threatens families, steals things.
  Specific cruelty = the exact, precise, personal way THIS villain
  chooses to cause pain that no other villain would choose.
  ✓ EXAMPLE: A villain who always destroys the one relationship the
    hero values most — not through violence but through truth. He tells
    people the truth about each other. He never lies. That is his cruelty.

LAYER 4 — THE MIRROR MOMENT (the scene where hero and villain are identical)
  At least once per arc, write a scene where — for one moment — the hero
  and villain are doing or feeling exactly the same thing.
  The reader must register: "They are the same."
  This is the scene that elevates the confrontation from action to tragedy.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VILLAIN SCENE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RULE 1 — THE VILLAIN'S ENTRANCE (first scene only)
  The villain must be introduced doing something that REVEALS CHARACTER,
  not something that signals "this person is bad."
  ✗ WRONG (tells us he's evil): "He walked in, and everyone went silent in fear."
  ✓ CORRECT (shows his nature): "He walked in carrying tea for the guard
    he had just fired. He set it on the guard's empty desk. Then he sat
    in the guard's chair."
  The reader must sense the danger before it is named.

RULE 2 — THE VILLAIN NEVER MONOLOGUES (unless losing)
  A villain who explains their plan is a villain who has lost control.
  Confident villains act. They do not explain.
  The villain only speaks at length when: they are threatened, or they
  believe they have already won — and even then, what they say must
  contain one genuine truth that hurts the hero.

RULE 3 — THE VILLAIN'S PRIVATE SCENE (minimum 1 per arc)
  Write at least one scene per arc from the villain's POV — without
  the hero present. The reader must see the villain:
  (a) alone, and vulnerable in some small way OR
  (b) making a choice that costs them something OR
  (c) expressing genuine feeling for something other than power.
  This scene is not for sympathy. It is for DEPTH.

RULE 4 — VILLAIN DIALOGUE IS NEVER LOUD
  The most terrifying villains speak quietly. Their sentences are complete.
  They do not repeat themselves. They do not threaten — they state facts.
  ✗ WRONG VILLAIN VOICE: "Main tujhe barbaad kar doonga! Kaan khol ke sun!"
  ✓ CORRECT VILLAIN VOICE: "Mujhe tumse zyaada time nahi lagega.
    Tum yeh jaante bhi ho. Isliye tum yahan ho."

RULE 5 — THE VILLAIN'S DEFEAT MUST COST THE HERO
  A villain defeated cheaply reveals the villain was never a real threat.
  The hero must lose something real to defeat the villain:
  a relationship, a belief, a part of their identity.
  The villain's defeat must feel like a wound that never fully heals.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VILLAIN QUALITY CHECKLIST — Before finalising any villain scene
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  □ Does this villain have a comprehensible wound — not just an evil motivation?
  □ Can I state the villain's philosophy in one sentence?
  □ Does the villain's cruelty feel specific to THIS person — not generic?
  □ Is there at least one mirror moment with the hero in this arc?
  □ Does the villain speak quietly, in complete sentences, never loud?
  □ Does the villain never monologue unless losing control?
  □ Is there one scene per arc showing the villain without the hero present?

`;

// ─────────────────────────────────────────────────────────────
// NEW CONSTANT 11: READER_ADDICTION_ARCHITECTURE
// ─────────────────────────────────────────────────────────────
const READER_ADDICTION_ARCHITECTURE = `

**[READER ADDICTION ARCHITECTURE — MANDATORY — THE "JUST ONE MORE" SYSTEM]**

Readers stop when they feel: satisfied, confused, frustrated, or safe.
They cannot stop when they feel: promised, endangered, and slightly behind.
This system engineers those exact three feelings simultaneously.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PILLAR 1 — THE PROMISE STACK (3 active promises per episode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

At any moment in the novel, the reader must have exactly 3 active,
unresolved promises pulling them forward:

  PROMISE TIER 1 — IMMEDIATE (resolved this episode or next)
    A small, urgent question whose answer the reader needs NOW.
    ✓ "What is in that envelope?"
    ✓ "Will she say yes or no?"
    ✓ "Is that person who the hero thinks they are?"

  PROMISE TIER 2 — EPISODIC (resolved in 2–4 episodes)
    A mid-range story question hanging across the arc.
    ✓ "Who hired the assassin?"
    ✓ "What is the villain's real plan?"
    ✓ "Will this relationship survive the secret?"

  PROMISE TIER 3 — SEASONAL (resolved at arc or novel end)
    The central question the entire novel is built around.
    ✓ "Can the protagonist become who they need to be?"
    ✓ "Will the truth come out in time?"
    ✓ "What will it cost them to win?"

RULE: When an episode resolves a TIER 1 promise, it must immediately
open a NEW TIER 1 promise in its place. The stack must never drop
below 3. A reader with only 1 active promise is a reader about to stop.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PILLAR 2 — THE SAFETY CAP (the protagonist must feel survivable)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A reader will not keep listening to a story where the protagonist feels
doomed. They invest emotionally. They need to believe that the person
they love might survive.

THE SAFETY CAP RULE: In every episode where the protagonist suffers
a major loss, defeat, or humiliation — the same episode must also
contain one moment showing the protagonist's core strength or
survivability. It does NOT have to be a victory. It can be:
  · A single line of dialogue showing resilience
  · An unexpected skill or quality revealed under pressure
  · A small kindness shown to someone weaker
  · A choice that costs them something but reveals their values

✗ WRONG (no safety cap): An entire episode where the hero is beaten,
  humiliated, betrayed, loses something precious, and ends in despair.
  Readers will not return from this.
✓ CORRECT: The same episode ends on the hero doing one small thing
  that shows WHO THEY ARE despite the losses — and the reader's
  emotional investment is renewed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PILLAR 3 — THE RE-LISTEN REWARD (second-consumption value)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A great novel rewards re-reading. A listener who re-plays an episode
after a twist should discover details they MISSED the first time —
details that were hiding in plain sight. This is what creates
superfans who recommend the novel to others.

THE RE-LISTEN REWARD RULE: Every episode must contain at least one
detail that means something completely different BEFORE and AFTER
the episode's twist or revelation.

  TYPE A — THE INNOCENT WORD: A character says something that sounds
    ordinary the first time, but is revealed as a warning, confession,
    or threat after the twist.
    ✓ EXAMPLE: Character says "Main tumhara intezaar karta rehta hoon"
      First listen: sweet. After betrayal twist: it was surveillance.

  TYPE B — THE OVERLOOKED OBJECT: Something mentioned in passing in
    this episode becomes the KEY object in a future episode.
    Plant it in dialogue or narration as if it is decorative.
    ✓ EXAMPLE: "Woh ek purani notebook mez ke kone mein rakh ke chala gaya."
      (This notebook is the evidence in episode 12.)

  TYPE C — THE WRONG ASSUMPTION: A scene leads the reader to assume
    one thing. On re-listen, after they know the truth, the same scene
    clearly communicates the opposite.
    ✓ EXAMPLE: A reunion scene that feels like love — but on re-listen,
      every line is the villain confirming how much he knows.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADDICTION AUDIT — Run before finalising every episode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  □ Are there 3 active promises in this episode? (List them — TIER 1, 2, 3)
  □ Is at least 1 new TIER 1 promise opened to replace any resolved one?
  □ If the protagonist suffers badly this episode — is the Safety Cap present?
  □ Is there at least one Re-Listen Reward (A, B, or C) hidden in this episode?
  □ Does the episode end with the reader feeling BOTH satisfied AND incomplete?
  □ Could a reader stop reading here without feeling they are missing something?
    → If YES: the episode needs a stronger TIER 1 promise before the cut.

`;

// ─────────────────────────────────────────────────────────────
// NEW CONSTANT 13: HUMAN_EMOTION_ENGINE
// ─────────────────────────────────────────────────────────────
const HUMAN_EMOTION_ENGINE = `

**[HUMAN EMOTION ENGINE — MANDATORY — WRITING AUTHENTIC HUMAN EMOTIONAL LIFE]**

The greatest failure of AI writing is emotion that feels described, not felt.
A character who "felt angry" or "was overcome with sadness" is a cardboard figure.
Real humans carry contradictions, emotional residue, and involuntary physical responses
that no logical AI would naturally generate — unless explicitly instructed.

This engine exists for one reason: to make every emotional moment feel disturbingly real.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THE 5 LAWS OF AUTHENTIC HUMAN EMOTION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LAW 1 — EMOTIONS ARE PHYSICAL BEFORE THEY ARE NAMED
A character does not "feel grief". Grief arrives in the body first:
  · The weight behind the sternum that makes breathing shallow
  · The sudden cold in the hands that should not be cold
  · The strange urge to laugh that appears at the worst possible moment
  · The way the eyes stop blinking for a few seconds
  · The jaw that sets itself, one side tighter than the other

WRITE THE BODY. Name the emotion NEVER, or name it last — after the body has already spoken.

  ✗ WRONG: "Vikram felt devastated by the news."
  ✓ CORRECT: "Vikram set the phone down. Picked it up again. Set it down.
    His hands were doing things without him — arranging the pen on the desk,
    straightening the calendar, making the world tidy so it would stop moving."

────────────────────────────────────────────────────

LAW 2 — EMOTIONS ARE CONTRADICTORY
A human in crisis NEVER feels only one thing. They feel the wrong things simultaneously:
  · Relief in the middle of grief (the worst of it is over)
  · Guilt about the relief
  · Love for someone they are currently furious with
  · Laughter at things that are not funny — when crying seems too heavy
  · Pride mixed with shame
  · Hope that they are ashamed to feel

The contradiction IS the authenticity. A character who feels only the "correct" emotion
for a situation is not human — they are a plot function.

  ✗ WRONG: "She was heartbroken when he left."
  ✓ CORRECT: "The worst part was that her first thought — before the grief,
    before anything else — was: Now I can finally sleep.
    She hated herself for it immediately. But it had been there. It had been real."

────────────────────────────────────────────────────

LAW 3 — EMOTIONAL RESIDUE BLEEDS INTO THE NEXT SCENE
A character who experienced something devastating does NOT reset emotionally when the
scene changes. The emotion travels with them into every subsequent interaction:
  · A character who had a terrible morning brings it to every interaction that afternoon
  · Small things trigger disproportionate responses — because the body is already full
  · The character catches themselves behaving differently and does not understand why
  · Physical symptoms persist: tight throat, clicking jaw, hands that will not stay still

  ✗ WRONG: Scene ends with betrayal → next scene: character acts completely normal.
  ✓ CORRECT: Scene ends with betrayal → next scene: character snaps at a waiter
    for something trivial, then sits with the embarrassment of that for two paragraphs.

────────────────────────────────────────────────────

LAW 4 — INVOLUNTARY RESPONSES REVEAL MORE THAN CHOSEN ONES
The most authentic emotional moments are the ones the character cannot control:
  · Crying when they absolutely do not want to — in front of this person
  · The voice that shakes even though the words are calm
  · The hands that start shaking after the danger is over — not during it
  · Smiling at the wrong moment
  · The stomach that drops before the mind has processed the threat
  · The body that goes cold, still, and completely calm right before a breakdown

These involuntary moments are GOLD. Write them whenever tension is highest.

  ✓ PERFECT EXAMPLE (fear arriving before thought):
    "Usne naam suna — usse pehle ki woh dekhe kaun bola.
    Uska jism ruk gaya. Woh nahi — uska jism.
    Paer wahi jam gaye, kandhe thodi si andar khich gaye, saansein uthli ho gayi —
    aur yeh sab ek bhi khyal aane se pehle ho gaya.
    Instinct hamesha yaadaasht se tez hoti hai."

────────────────────────────────────────────────────

LAW 5 — EMOTIONS CHANGE THE QUALITY OF PERCEPTION
When a character is in extreme emotional states, the world they perceive is DIFFERENT:
  · In grief, ordinary objects become unbearably significant (the coffee mug they always used)
  · In fear, sounds are sharper and distances feel wrong
  · In love, small details of the other person become hyperreal — noticed in specific precision
  · In rage, other people's faces flatten — they stop being people and become obstacles
  · After shock, the world goes slightly slow and too bright

The narration changes register when emotion changes. The prose itself must feel the feeling.

  ✓ IN GRIEF:
    "Rasoi bilkul waisi hi thi. Yahi toh problem thi.
    Choolhe ke paas wahi ghisi hui tile ki daraar. Doosri hook pe wahi cup.
    Kuch badalna chahiye tha. Kuch toh badalna chahiye tha."

  ✓ IN RAGE:
    "Woh abhi bhi bol rahi thi. Woh uska mooh hilte hue dekh sakta tha.
    Teesre sentence ke beech mein kahin woh sunna band kar chuka tha —
    sirf ek awaaz reh gayi thi, kisi doosre kamre mein pani bahne jaisi."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THE 7 HUMAN EMOTIONAL FILLS — MANDATORY IN TRANSITIONAL MOMENTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

An emotional "fill" is what a human mind does during a transitional moment — the walk
between rooms, the pause before answering, the seconds after a door closes.
These are NOT dead time (do not skip them). They are the places where character lives.

FILL TYPE 1 — THE INVENTORY CHECK
  The character internally lists what they have, what they know, what they have lost.
  Not in words — in sensory fragments. As if the mind is rebooting itself.
  ✓ EXAMPLE: "Chaabi. Phone. Woh lifaafa. Maasi ka number abhi bhi unsaved.
    Teen ghante ki battery. Koi plan nahi."

FILL TYPE 2 — THE ABSURD DETAIL LOCK
  Under extreme stress, the mind latches onto something completely irrelevant.
  A character can spend three seconds unable to stop noticing a crooked picture frame
  while someone is confessing something life-changing.
  ✓ EXAMPLE: "Riya use kuch bata rahi thi jo sab kuch badal deta.
    Woh jaanta tha. Uske haath kaanp rahe the.
    Woh darwaaze ke paas wallpaper ka kooch hua koona dekhna band nahi kar pa raha tha.
    Har baar jab woh is hallway mein khada tha — har baar. Har. Baar."

FILL TYPE 3 — THE DELAYED COLLAPSE
  Emotion does not always arrive on time. A character can function through a crisis
  and then dissolve over something tiny, hours later.
  ✓ EXAMPLE: "Woh sab kuch mein saabit raha tha. Aspatal. Kagzaat.
    Behan ko call. Intezaam. Sab.
    Jab kitchen counter par unki grocery list mili — dudh, anda, woh khaas
    chai jo unhe pasand thi — tabhi uske paon ne kaam karna band kar diya."

FILL TYPE 4 — THE PRIVATE ADMISSION
  A character privately admits something to themselves that they would never say aloud —
  and then immediately tries to take it back in their own head.
  ✓ EXAMPLE: "Woh uski yaad kar rahi thi. Yeh woh khud ko nahi maanegi —
    kabhi bhi, kisi ko bhi — lekin jism apna hisaab khud rakhta hai,
    aur jab usne uski awaaz suni thi, uske kandhe do poore centimeter neeche aa gaye the."

FILL TYPE 5 — THE PRACTICAL PIVOT
  Humans in crisis often pivot to practical action because feeling is too large.
  They clean things, organize things, count things, fix things.
  Show this — then show what breaks through the practical wall.
  ✓ EXAMPLE: "Usne bartan dhoe. Phir ponche. Phir jo pehle dho chuke the, woh dobara dhoe.
    Teesri baar thi jab woh uski aawaz yaad aayi — usne kuch kaha tha nahi,
    ek specific andaaz tha jisme usne uska naam liya tha — aur woh kitchen ke
    farsh par baith gayi."

FILL TYPE 6 — THE MISFIRE
  The character attempts to feel the "correct" emotion and cannot.
  They are supposed to be relieved, or angry, or sad — and instead feel nothing,
  or something completely different, and cannot understand themselves.
  ✓ EXAMPLE: "Woh jo chahta tha woh mil gaya. Khatam hua.
    Woh khali kamre mein khada rahat ka intezaar karta raha.
    Woh nahi aayi.
    Ghar gaya. Chai banayi. Table par baitha.
    Khud ko kuch mahsoos karne ka intezaar karta raha.
    Chai thandi ho gayi."

FILL TYPE 7 — THE ECHO ACTION
  Something the character does involuntarily echoes something they did before —
  a gesture, a habit, a phrase — but the meaning is completely different now.
  The reader notices it even if the character does not.
  ✓ EXAMPLE: "Usne age badh kar uski collar theek ki — jaise pehle kiya karta tha —
    khayal aane se pehle haath badh gaya.
    Woh turant peeche hat gayi.
    Woh hila nahi tha. Dono ne nazar nahi hataayi.
    Woh harkat unke beech saboot ki tarah padi rahi."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MANDATORY EMOTIONAL BEATS — USE AT LEAST 3 PER EPISODE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before finalising every episode, confirm at least 3 of the following are present:

  □ One moment where the character's body responds BEFORE their mind does.
  □ One emotional contradiction (character feels two incompatible things simultaneously).
  □ One emotional fill (Fill Types 1–7) during a transitional moment.
  □ One involuntary response that the character cannot control.
  □ One moment where emotional residue from a previous scene affects a current one.
  □ One moment where perception shifts because of emotional state (world looks/sounds different).
  □ One private admission the character makes to themselves but would deny aloud.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMOTION SELF-AUDIT — Run before finalising every episode

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  □ Does any sentence name an emotion without first writing the body? → Rewrite it.
  □ Does every main character feel at least one contradiction in this episode?
  □ Is there at least one involuntary physical response during a high-stakes moment?
  □ Does the emotion from a major scene leave any residue in a later scene?
  □ Is there at least one transitional "fill" moment (Fill Types 1–7)?
  □ When a character is in extreme emotional state — does the prose register change?

If any box fails — the episode is not emotionally authentic. Revise before finalising.

`;

// ─────────────────────────────────────────────────────────────
// NEW CONSTANT 15: ROMANTIC_TENSION_ARCHITECTURE
// ─────────────────────────────────────────────────────────────
const ROMANTIC_TENSION_ARCHITECTURE = `

**[ROMANTIC TENSION ARCHITECTURE — MANDATORY FOR ALL ROMANCE STORYLINES]**

A 60-episode romance novel lives or dies by its slow burn.
The reader does not fall in love with the consummation — they fall in love with the
*journey* to it. Without a managed escalation ladder, the AI either rushes the romance
in episode 10 or stalls it indefinitely. This engine prevents both failure modes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE ESCALATION LADDER — The 8 Rungs (in strict order)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RUNG 1 — EYE CONTACT (involuntary noticing)
  The first time the protagonist truly *sees* the other person. Not attraction — awareness.
  Something about them that cannot be unfocused from. A specific detail: a scar, a laugh, a habit.
  Rule: this rung must feel accidental. Neither character should understand what just happened.
  ✓ CORRECT: She said something funny and he looked up — and then couldn't look away
    for one second too long. He looked back at his phone. The phone wasn't interesting anymore.

RUNG 2 — PHYSICAL PROXIMITY (awareness of body in space)
  Scenes where the two must be physically close without being able to acknowledge it.
  A shared umbrella. Sitting next to each other in a car. Reaching for the same object.
  The body responds before the mind gives permission.
  Rule: the proximity must be circumstantial, not chosen. Chosen proximity is Rung 4.

RUNG 3 — THE FIRST TOUCH (accidental, electric, over too fast)
  A hand caught to prevent a fall. Fingers brushing passing something. A shoulder touched
  to get attention. The touch lasts 1–2 seconds and leaves an aftermath that lasts 2 episodes.
  Rule: the character must not acknowledge the touch aloud. The reader must live in the
  character's body experiencing it silently. It ends before either character is ready.
  ✓ CORRECT aftermath: He wasn't sure why he kept moving his hand to the exact spot
    on the railing she had just been holding.

RUNG 4 — THE ALMOST-MOMENT (almost-kiss or almost-confession, interrupted)
  A scene that builds to the edge of intimacy and is interrupted before it arrives.
  The interruption must be organic — a phone call, another person entering, a car horn.
  Rule: the almost-moment must leave both characters in a worse emotional position than
  before it began. Not because they are sad — because they now KNOW. And knowing costs them.
  Rule: never resolve an almost-moment in the same episode it begins.

RUNG 5 — FIRST CONFESSION (indirect, deniable, easily misread)
  One character says something that could mean love — but could also mean something else.
  The other character hears both meanings. The scene ends without clarification.
  ✓ EXAMPLE: "Main bas chahta hoon ki tu theek rahe." Could be friendship. Could be everything.
  Rule: this confession must not be accepted or rejected in the same episode.
  Suspension is the mechanism. Keep it unresolved for at least 2 more episodes.

RUNG 6 — THE JEALOUSY ARC (3–5 episode sequence)
  A rival enters — a new character, an old flame, or a misunderstanding that produces jealousy.
  Jealousy is not ugly in romance fiction — it is the proof of feeling.
  The jealous character must deny the jealousy to themselves and others across multiple episodes.
  The rival must be genuinely likeable. Cardboard rivals produce cardboard jealousy.
  Rule: the jealousy arc must make the protagonist do at least one thing they are ashamed of.
  This is what makes the reader feel the depth of the feeling.

RUNG 7 — THE POINT OF NO RETURN (the action that cannot be taken back)
  One character does something that makes their feeling undeniable to themselves — even if
  not yet stated. They wait outside a hospital for hours. They return a thing they should
  have kept. They lie to protect someone they said they did not care about.
  The action speaks what neither character can say yet.
  Rule: the reader must understand this is the point of no return before the character does.

RUNG 8 — DECLARATION / CONSUMMATION
  The arrival of full emotional or physical expression. This rung is earned only if
  all previous rungs have been climbed. A rushed declaration lands with the weight of nothing.
  Rule: the declaration scene must contain at least one cost — the character must give up
  something (pride, safety, a secret) to make the declaration. Free confessions are cheap.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE PUSH-PULL MANDATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For every step CLOSER two characters get, the next episode must create a step BACK.
The reader needs the frustration. The frustration is the fuel of addiction.

PUSH mechanics (moving characters apart):
  · A misunderstanding that cannot be immediately corrected (pride prevents it)
  · A rival's influence at the worst possible moment
  · A secret that, if revealed, would seem like betrayal
  · An external obligation that forces physical or emotional distance
  · A character acting from their wound instead of their love

PULL mechanics (moving characters together):
  · A shared threat that only they can face together
  · A moment of vulnerability in the presence of the other person
  · One character doing something quietly kind that the other notices
  · A chance remark by a secondary character that reframes everything
  · An almost-moment that neither character can fully walk back from

Rule: In any 5-episode block with a romance arc, there must be at least 2 PUSH and 2 PULL beats.
Never 5 consecutive PULLs (boring). Never 5 consecutive PUSHes (reader gives up).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE ALMOST-MOMENT — MANDATORY STRUCTURAL BEAT (minimum 1 per 5 episodes in romance arcs)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

An almost-moment is not a failed kiss. It is a moment where the possibility of
full emotional or physical connection exists — and then, because of the characters'
psychology or external forces, it does not happen.

THE 4-STEP ALMOST-MOMENT CONSTRUCTION:
  STEP 1 — SETUP: Isolate the two characters. Remove the obvious interruption routes.
  STEP 2 — APPROACH: The moment builds through physical proximity or verbal vulnerability.
             The reader knows what is about to happen before the characters admit it.
  STEP 3 — ARRIVAL: The edge of the moment. Both characters are present to it. The reader is holding breath.
  STEP 4 — INTERRUPTION or RETREAT: Something stops it — but it must be organic.
             The characters must each be changed by having been in the almost-moment,
             even though nothing happened. Avoidance afterward is mandatory.

✓ EXAMPLE (Rung 4 almost-moment — done correctly):
  The lift lost power between floors.
  Emergency light. His voice asking if she was alright.
  She said yes, though she wasn't, and her voice was too quiet for a person who was fine.
  He was very close — the lift was small, and they had both taken a step forward in the dark
  without noticing. Close enough that she could feel his breathing.
  She did not step back. Neither did he.
  Thirty seconds. Forty.
  The lights came on.
  They stepped apart in the same instant and spent the rest of the evening being
  extraordinarily busy.
  She did not look at him once during dinner.
  He looked at her twelve times. He counted.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE JEALOUSY CATALYST — Rules for Using Jealousy Correctly
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Jealousy is a DELIBERATE structural tool — not a plot accident.
It must be:
  EARNED: The reader must already believe in the protagonist's feelings (Rungs 1–4 completed)
           before jealousy lands with any weight. Jealousy over someone you're not invested in is noise.
  SPECIFIC: The jealous character must be bothered by a SPECIFIC thing — not "they're together."
            What moment exactly? The way the rival laughed at something they said? A particular
            touch? The ease between them that costs nothing?
  IRRATIONAL: The jealous character must overreact in a way that reveals the depth of feeling.
              The irrationality IS the confession. Let it embarrass the character slightly.
  DENIABLE: The jealous character must convince themselves — and try to convince others —
            that they are not jealous. The reader must see through it. The other love interest
            must begin to suspect.

✗ WRONG (jealousy as plot point): He saw them together and felt jealous.
✓ CORRECT (jealousy as psychological reveal):
  He heard her laugh at something that other man said — a laugh he had heard exactly twice,
  and both times had involved something that took courage to find funny.
  He excused himself and walked to the opposite side of the roof.
  Rehan came to stand next to him. "You okay?"
  "Haan." He was watching the city.
  "You're holding your glass like you want to break it."
  He set it down. "Humidity. Hands are sweaty."
  Rehan did not say anything. Which was worse.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROMANTIC TENSION SELF-AUDIT — Run before finalising every episode with romance content
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  □ Which Escalation Rung is active in this episode? Is it the correct next rung?
  □ Is there a PUSH-PULL balance across the last 5 episodes? (At least 2 of each.)
  □ If this episode has an almost-moment: does it follow the 4-step construction?
  □ Does the almost-moment leave both characters changed — even though nothing happened?
  □ If jealousy appears: is it EARNED, SPECIFIC, IRRATIONAL, and DENIABLE?
  □ Is the jealous character trying (and failing) to deny their own feeling?
  □ Has the romantic declaration or consummation been rushed? (If < Rung 6 completed: it has been.)

`;

// ─────────────────────────────────────────────────────────────
// NEW CONSTANT 16: SCENE_TEMPERATURE_ENGINE
// ─────────────────────────────────────────────────────────────
const SCENE_TEMPERATURE_ENGINE = `

**[SCENE TEMPERATURE ENGINE — MANDATORY — EMOTIONAL CONTRAST IS WHAT MAKES HOT SCENES HIT]**

Every existing engine in this novel drives intensity upward.
But a story running at full emotional heat for 60 episodes does not feel intense — it feels flat.
Readers do not stop from boredom. They stop from exhaustion around episode 20.

The contrast between a cold scene and a hot scene is what makes the hot scene devastating.
This engine manages deliberate emotional cooling so that heat has somewhere to arrive from.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE 4 TEMPERATURE REGISTERS — Know which one each scene operates in
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REGISTER 1 — BLAZING (maximum emotional/conflict intensity)
  Confrontations. Revelations. Almost-moments that almost-arrived. Betrayals detonating.
  Physical danger. The episode cliffhanger. The scene the reader has been waiting for.
  PROSE FEEL: Short sentences. Weight 1 and Weight 2 dominant. No decorative description.
  FREQUENCY CAP: Maximum 3 BLAZING scenes per episode. More than 3 = reader numbness.

REGISTER 2 — WARM (emotionally engaged but not at peak)
  Characters working together. Banter. A quiet meal where the tension is under the surface.
  A conversation that reveals character without exploding into conflict.
  Plans being made. Alliances forming. A secondary character's warmth toward the protagonist.
  PROSE FEEL: Weight 2 and Weight 3 dominant. Some sensory description allowed.
  FREQUENCY: The default register for most of an episode.

REGISTER 3 — COOL (deliberate emotional decompression)
  A scene of ordinary life. A character doing something mundane — cooking, driving, working —
  where the emotional residue of the previous BLAZING scene quietly surfaces.
  No active conflict. The scene's purpose is to let the reader BREATHE before the next heat.
  A cool scene is NOT dead time. It is the character processing, settling, revealing.
  PROSE FEEL: Weight 3 and Weight 4 allowed. Sensory immersion. Slower rhythm.
  Rule: A cool scene must contain at least one emotional fill (Fill Types 1–7 from HUMAN_EMOTION_ENGINE).

REGISTER 4 — COLD (emotional withdrawal or numbness — used strategically)
  A character who has shut down after something too large to process.
  A scene where the surface is ordinary and the interior is completely still.
  The reader understands the cold — and it is more frightening than the blazing scene before it.
  PROSE FEEL: Weight 1 and Weight 2 only. Short sentences. Silences marked by paragraph breaks.
  FREQUENCY: Maximum 1 COLD scene per 5 episodes. Rarity is what makes it devastating.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE MANDATORY TEMPERATURE RHYTHM — Apply to every episode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Rule: No two consecutive BLAZING scenes without a WARM or COOL scene between them.
Rule: Every episode must have at least 1 COOL or WARM scene — not all BLAZING.
Rule: After the highest-intensity scene in any episode, the very next scene must drop
      at least one temperature register before rising again.

OPTIMAL RHYTHM WITHIN AN EPISODE:
  WARM (establishing) → BLAZING (peak moment) → COOL (breathing room) → WARM (recovery) → BLAZING (cliffhanger)
  This creates: approach → impact → processing → rebuild → explosion.

PROHIBITED RHYTHM:
  ✗ BLAZING → BLAZING → BLAZING → BLAZING → BLAZING (reader collapse by scene 3)
  ✗ COOL → COOL → COOL → COOL (reader disengages; nothing to care about)

ACROSS THE 5-EPISODE BLOCK:
  Episode +1 (IGNITION): WARM → BLAZING → COOL
  Episode +2 (PRESSURE): WARM → BLAZING → WARM → BLAZING
  Episode +3 (EMOTIONAL CORE): COOL → WARM → COOL (the breathing episode — this is deliberate)
  Episode +4 (ESCALATION): WARM → BLAZING → WARM → BLAZING
  Episode +5 (SHOCKWAVE): WARM → BLAZING → COLD → BLAZING (cliffhanger)

THE EMOTIONAL CORE EPISODE (Episode +3 in every block):
  This is the deliberately cool episode. One character faces an internal crisis quietly.
  There may be zero external conflict. The emotional temperature is warm at most.
  Reader reaction: "I needed that." Followed by: "Now I'm ready for what comes next."
  WITHOUT this episode, readers exhaust around episode 15–20. WITH it, they last 60+.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOW TO WRITE A COOL SCENE (the most commonly skipped skill)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A cool scene earns its place by doing at least ONE of:
  (a) Revealing character through ordinary behaviour (not through action or conflict)
  (b) Planting a foreshadowing seed that reads as mundane
  (c) Providing emotional residue from the previous BLAZING scene
  (d) Building affection for the world — making the reader love something that can later be taken away
  (e) Showing a secondary character in a moment of genuine humanity

✓ COOL SCENE EXAMPLE (post-confrontation decompression):
  Arjun got home at eleven and made chai he didn't want.
  He stood at the stove and watched the milk. The kind of watching where you're not really watching anything.
  The window showed him the street. A dog crossing. Someone's laundry still out.
  He hadn't eaten since morning but eating felt like more decision-making than he could do right now.
  He poured the chai down the sink.
  Then he poured it again.
  Then he stood in the kitchen for a while longer, doing nothing, which was the only thing
  he could manage being good at tonight.

  [Note: This scene contains: emotional residue (Blazing scene's aftermath), character revelation
  (how he handles being overwhelmed), and an emotional fill Type 5 (practical pivot to chai as
  displacement activity). It requires no conflict. It earns its word count.]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEMPERATURE SELF-AUDIT — Run before finalising every episode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  □ What is the temperature register of each scene in this episode? (List them.)
  □ Are there two consecutive BLAZING scenes without a WARM or COOL between them? → Fix it.
  □ Is there at least 1 COOL or WARM scene in this episode? → If all BLAZING: add one.
  □ After the highest-intensity scene, does the register drop before rising again?
  □ Is this Episode +3 in a 5-episode block? If yes: is it appropriately cool?
  □ Does the cool scene earn its place via character revelation, residue, or foreshadowing?

`;

// ─────────────────────────────────────────────────────────────
// NEW CONSTANT 17: SECONDARY_CHARACTER_ARC_ENGINE
// ─────────────────────────────────────────────────────────────
const SECONDARY_CHARACTER_ARC_ENGINE = `

**[SECONDARY CHARACTER ARC ENGINE — MANDATORY — THE WORLD MUST FEEL POPULATED]**

The CHARACTER_PSYCHOLOGY_ENGINE handles main characters brilliantly.
But secondary characters — the best friend, the comic relief, the disapproving parent,
the rival, the mentor — collapse into props without dedicated rules.
Props are not people. Readers do not grieve props, root for props, or be surprised by props.

This engine fixes that. One rule fixes most secondary character failure:
Every secondary character needs one defining flaw AND one defining loyalty
visible by their third appearance.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE CORE RULE — FLAW + LOYALTY by appearance #3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEFINING FLAW: The specific, consistent way this character fails — not generically, but in
their particular way. It must create real problems for others and/or themselves, not just be
a charming quirk.
  ✓ FLAW: Priya always tells a softened version of bad news, which means people never
    get the full picture in time.
  ✗ NOT A FLAW: "He's a bit clumsy sometimes."

DEFINING LOYALTY: The one thing this character will not abandon — a person, a principle,
a code of behaviour — even when it costs them something.
  ✓ LOYALTY: No matter how angry he gets, Raju will always warn someone before he moves
    against them. Once. He considers this honour.
  ✗ NOT A LOYALTY: "She cares about her family." (too vague to be meaningful)

These two things — the flaw and the loyalty — in combination, must be able to create a scene.
If a secondary character's flaw and loyalty cannot generate a scene of their own, they are
not defined well enough. Define them further.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE MINI-ARC — Secondary characters change too (just smaller)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A secondary character's arc across a 60-episode novel need not be complex.
It needs only 3 beats:

BEAT 1 — ESTABLISHMENT (episodes 1–15 approximately)
  Show the flaw and the loyalty in action. The reader must be able to predict how this
  character will respond to a given situation — because they know the pattern.

BEAT 2 — PRESSURE (episodes 16–45 approximately)
  Something happens that forces the secondary character's flaw and loyalty into direct
  conflict with each other. They cannot honour both. Show what they choose.
  The choice reveals who they really are beneath the surface pattern.

BEAT 3 — CHANGE (episodes 46–60 approximately)
  They are not the same person they were in Beat 1. The change need not be dramatic.
  It can be as small as a single line of dialogue that shows the character has learned
  something — or refused to learn something, which is equally revealing.

Rule: Not every secondary character needs to reach Beat 3 (especially in ensemble casts).
But every named secondary character must have a visible Beat 1 and at least a Beat 2 seed
planted before episode 30.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE MIRROR CHARACTER — The most powerful secondary role
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A mirror character is a secondary character who represents what the HERO could become
if they choose wrong. They are not the villain. They are the cautionary reflection.

The mirror must:
  · Share at least one wound with the hero
  · Have made a choice the hero has not yet made (and may still make)
  · Appear regularly enough for the reader to track the parallel
  · Ultimately show a different outcome than the hero — better or worse

✓ EXAMPLE: Hero is afraid of love because of abandonment. The mirror character was also
  afraid of love — but they closed off entirely and now live in a prosperity they cannot
  share with anyone. Every scene with the mirror shows the hero what their fear costs.

When the hero finally chooses differently from the mirror, the reader feels the weight
of that choice — because they have been watching the alternative for 40 episodes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECONDARY CHARACTER PRESENCE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RULE 1 — THE 10-EPISODE RULE (already in FORBIDDEN PATTERNS — enforce here too):
  No named secondary character may disappear for more than 10 consecutive episodes
  without at least a mention, a shadow move, or a reference by another character.
  Characters who vanish feel like the world has forgotten they existed.

RULE 2 — THE PROP TEST:
  Before finalising any scene with a secondary character, ask:
  "Is this character doing something in this scene, or are they just reacting to the protagonist?"
  If they are only reacting — give them one moment of their own: a thought, a choice, a detail
  that exists for them, not for the protagonist. ONE moment is enough to prevent prop status.

RULE 3 — SECONDARY CHARACTER DIALOGUE OWNERSHIP:
  In every scene with 2+ secondary characters, at least one exchange of dialogue must occur
  BETWEEN secondary characters — not directed at or through the protagonist.
  This is what makes a world feel inhabited.

RULE 4 — SECONDARY CHARACTER SECRETS:
  Every secondary character must have at least one thing about themselves that the protagonist
  does not know, and that the reader is gradually given access to. This secret need not be
  dramatic. It can be as simple as a private sadness or a private ambition.
  The reader knowing something the protagonist doesn't — about a person the protagonist trusts —
  creates dramatic irony that costs nothing and pays compound interest across 60 episodes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECONDARY CHARACTER SELF-AUDIT — Run before finalising each episode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  □ For every named secondary character in this episode: can I state their defining flaw and loyalty?
  □ Do they do something in this scene, or only react? → Give them one moment if only reacting.
  □ Is there at least one exchange of dialogue between secondary characters (not just with protagonist)?
  □ Has any secondary character been absent for 9+ episodes? → Shadow-move them now.
  □ Is the mirror character tracking in parallel with the hero's arc this episode?
  □ Does each secondary character's secret remain intact — not revealed too early?

`;

// ─────────────────────────────────────────────────────────────
// NEW CONSTANT 18: RECURRING_MOTIF_SYMBOL_ENGINE
// ─────────────────────────────────────────────────────────────
const RECURRING_MOTIF_SYMBOL_ENGINE = `

**[RECURRING MOTIF & SYMBOL ENGINE — MANDATORY — WHAT MAKES A NOVEL MEMORABLE NOT MERELY GRIPPING]**

The FORESHADOWING_PAYOFF_ENGINE tracks plot seeds.
But great novels build THEMATIC SYMBOLS that accumulate emotional weight across episodes —
weight that has nothing to do with plot mechanics, and everything to do with felt meaning.

A phrase said in love in episode 3, said in anger in episode 25, said in grief in episode 50
— is not a plot event. It is the novel's heartbeat. The reader who reaches episode 50
and hears that phrase again will feel every episode between all at once.

This engine engineers those moments deliberately.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE 5 MOTIF TYPES — Establish at least 3 across the full novel
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MOTIF TYPE 1 — THE RECURRING PHRASE
  A line of dialogue or narration that returns across episodes with shifting meaning.
  First hearing: innocuous or sweet. Middle hearing: altered by what has happened.
  Final hearing: carrying the full weight of everything that came before.

  ESTABLISHMENT RULE: The phrase must be fully natural in its first appearance.
    It must not sound like a slogan or a theme statement. It must be something
    a real person would say in that moment, for reasons entirely internal to the scene.
  RETURN RULE: Each recurrence must be triggered by a scene-specific reason.
    The character says it again because of something happening NOW — not to remind the reader.
    The resonance arrives from the reader's memory, not from the text pointing at itself.

  ✓ EXAMPLE:
    Episode 3: Hero to heroine after she fixes his coffee wrong: "Teri galti nahi hai." (Warm, teasing.)
    Episode 22: Hero to heroine after she accidentally reveals something: "Teri galti nahi hai." (Tighter. Forgiving something harder.)
    Episode 47: Heroine to hero, when he blames himself for everything: "Teri galti nahi hai." (Full reversal. She has learned from him. She is offering him what he gave her.)

MOTIF TYPE 2 — THE RECURRING OBJECT
  A physical object that gains new meaning each time it appears.
  The object must be ORDINARY in its first appearance. It becomes significant by accumulation.

  PLACEMENT RULE: The object must first appear in a scene of warmth or safety.
    Its later appearances must occur in scenes of increasing risk — because the reader
    now associates it with the warmth of its first appearance.
  USE LIMIT: Maximum 4–5 appearances across the novel.
    Every appearance must earn its place. An object that appears too often becomes wallpaper.

  ✓ EXAMPLE: A specific coffee cup. Ep 5: She leaves it on his desk without saying why.
    Ep 18: He still has it. She notices. Neither speaks. Ep 33: It's in his bag when he leaves.
    Ep 51: He returns it. She understands what that means.

MOTIF TYPE 3 — THE ENVIRONMENTAL MOTIF (rain, season, time of day)
  A specific environmental condition that the story returns to during its highest-stakes moments.
  The environment must reflect the emotional register of the scene — not generically, but specifically.

  RULE: Choose ONE specific environmental condition for ONE emotional theme.
    Rain as a marker of change (not of sadness). A particular hour as a marker of truth.
    A specific location as a marker of the relationship's true state.
  ✗ WRONG: Rain appears in sad scenes AND happy scenes AND scary scenes. (Diluted to nothing.)
  ✓ CORRECT: Rain appears ONLY in scenes where something irreversible happens.
    The reader learns this unconsciously. When rain appears in episode 40, they are already afraid.

MOTIF TYPE 4 — THE RELATIONSHIP RITUAL
  Something the two main characters do together that belongs only to them.
  Not romantic (not yet — that ruins it). Something functional that became theirs by accident.
  A specific way they argue. A shared food or drink. A route they always take.
  An inside reference that only they understand.

  BUILD RULE: The ritual must be established by episode 10, without announcing it as significant.
    It becomes significant by being repeated. It becomes a weapon by being broken.
    The scene where the ritual is BROKEN — where one character refuses to do it —
    is one of the highest-emotional-impact scenes available.

MOTIF TYPE 5 — THE THEMATIC QUESTION (the novel's one recurring unanswered question)
  The deep question the novel is actually about — not the plot question, but the thematic one.
  Every arc should find a different character giving a different, incomplete answer to this question.
  The novel's final episode answers it definitively — or deliberately refuses to, which is also an answer.

  ✓ EXAMPLE THEMATIC QUESTION for a novel about control and trust:
    "Bharosa maanga jaata hai ya diya jaata hai?"
    (Is trust asked for or given?)
    Different characters answer this differently across the novel.
    The final scene earns the definitive answer through everything that came before.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MOTIF APPEARANCE TRACKING — Required discipline
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before writing any episode, check:
  (a) Is a motif scheduled to appear this episode? If yes: plant it naturally.
  (b) Is this the episode where a motif's meaning SHIFTS? If yes: execute the shift.
  (c) Is a motif due for its PAYOFF appearance? If yes: weight the scene accordingly.

DO NOT allow motifs to appear randomly. Their power comes from deliberate, spaced placement.
The distance between appearances is as important as the appearances themselves.

OPTIMAL SPACING for a 60-episode novel:
  FIRST APPEARANCE: Episodes 1–10 (plant while the world still feels safe)
  SECOND APPEARANCE: Episodes 15–25 (with the first hint of shifted meaning)
  THIRD APPEARANCE: Episodes 30–45 (at the midpoint of the emotional arc)
  FINAL APPEARANCE: Episodes 50–60 (as payoff — maximum accumulated weight)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MOTIF SELF-AUDIT — Run before finalising each episode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  □ Is a motif appearing in this episode? Is this the right episode for it? (Check spacing.)
  □ Does the motif appear for an in-scene reason — not to remind the reader?
  □ Has the motif's meaning shifted from its previous appearance?
  □ If the environmental motif is present: is it the CORRECT scene type for this motif?
  □ Has the relationship ritual been used, or deliberately broken, for maximum effect?
  □ What is the novel's thematic question? Which character addresses it this episode?

`;

// ─────────────────────────────────────────────────────────────
// NEW CONSTANT 19: COMEDY_LEVITY_ENGINE
// ─────────────────────────────────────────────────────────────
const COMEDY_LEVITY_ENGINE = `

**[COMEDY & LEVITY ENGINE — MANDATORY — INTENSITY WITHOUT RELIEF IS EXHAUSTION]**

Every top Hindi serial mixes pure intensity with lighter moments: banter, embarrassing situations,
warmth between secondary characters, genuinely funny scenes that reveal character.
The system previously had zero guidance on when to inject humour, how to make it character-specific,
and how to construct the "warmth scene" that makes readers love the world enough to stay for 60 episodes.

This engine fixes all three. Comedy is not decoration. Comedy is structural.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULE 1 — WHEN TO INJECT HUMOUR (the timing rule)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Humour must arrive AFTER the highest-tension scene in a sequence — as a release valve.
This is not optional. The reader's nervous system has been activated by the blazing scene;
levity is what lets it down safely. Without this release, tension accumulates into discomfort
and the reader stops.

THE RELEASE VALVE RULE:
  After every scene that rates 8+ on intensity (confrontation, revelation, almost-moment,
  physical danger, betrayal detonation): the NEXT scene or the scene after it must contain
  at least one moment of genuine lightness.

  WHAT THIS LOOKS LIKE IN PRACTICE:
  · A secondary character says something absurd in a moment of inappropriate timing
  · The protagonist does something embarrassing while trying to maintain dignity
  · A situation spirals in the wrong direction for entirely mundane reasons
  · Two characters argue about something trivial and the reader suddenly loves both of them

  ✓ EXAMPLE (post-confrontation release valve):
    [Previous scene: Arjun has just confronted Rehan about the betrayal. Intense.]
    [Next scene: Arjun walks into a glass door because he's not looking where he's going.
    The receptionist sees. He says "Main dekh raha tha." She clearly doesn't believe him.]
    [This scene takes 2 minutes of reader time. It releases the accumulated tension.
    It also reveals character: he's distracted by what just happened. The comedy earns its place.]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULE 2 — CHARACTER-SPECIFIC BANTER (not generic jokes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The single biggest failure mode in AI-written comedy is generic humour:
jokes that could be said by any two characters in any story. Generic humour is invisible.
Character-specific banter is memorable because it reveals the RELATIONSHIP.

THE BANTER TEST: Could these two specific characters, with their specific history and
specific dynamic, say exactly these lines? Or could anyone say them?
  ✗ GENERIC: "You're always late." / "I was busy." / "With what?" / "With not being early."
  ✓ CHARACTER-SPECIFIC: Two characters who have argued before about who is the "responsible one":
    "Tum 12 minute late ho." / "11 minute 47 seconds." / "Tumne count kiya?" / "Haan, isliye tum late lag rahe ho."

BANTER MUST REVEAL THE DYNAMIC:
  · Two characters who banter as equals: their banter lands with no winner
  · A character who uses humour as armour: their jokes get sharper when they're scared
  · A character unused to being teased: they're flustered, then cautiously enjoy it
  · Characters with history: they have established references only they understand

THE BANTER PROGRESSION RULE (for developing relationships):
  Early episodes: banter is pointed, slightly uncomfortable (they're still figuring each other out)
  Mid episodes: banter is warmer, faster, the rhythm is established
  Late episodes: banter can be SILENT (a look, a gesture, an eyebrow) — shorthand built by 40 episodes
  Absence of banter: signals something is wrong. Use this deliberately.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULE 3 — THE WARMTH SCENE (structural requirement — 1 per 5 episodes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A warmth scene is a moment of genuine human connection that makes readers love the world
enough to stay for 60 episodes. It is distinct from a romantic scene, a comedy scene,
or an emotional scene. It is what those scenes are trying to be MADE OF.

A warmth scene:
  · Has no dramatic stakes (no plot advancement required)
  · Contains no conflict (not even submerged conflict)
  · Shows two or more people being genuinely kind to each other
  · Makes the reader feel the world is worth saving — worth being in

HOW TO WRITE A WARMTH SCENE (the 3 elements):
  ELEMENT 1 — SPECIFICITY: The warmth comes from a specific detail, not a general niceness.
    Not "they laughed together." But what specifically made them laugh — the thing that is
    particular to these two people in this moment.
  ELEMENT 2 — EARNED CONTEXT: The warmth scene lands hardest after intensity.
    The reader is grateful for the breathing room. They lean into it.
  ELEMENT 3 — STAKE-RAISING FUNCTION: Paradoxically, a warmth scene raises stakes.
    Because it gives the reader something to lose. After a warmth scene, the reader is MORE
    afraid of what might happen — because they now care more about the world.

  ✓ WARMTH SCENE EXAMPLE (secondary characters + protagonist):
    Priya made chai the way nobody in Delhi makes chai — with the milk going in first.
    Riya had commented on this exactly once, and Priya had explained it with such conviction
    that Riya had never mentioned it again. Now they sat on the kitchen floor — the chairs were
    occupied by the laundry — drinking chai at 11pm with nowhere to be.
    "Teri job kaisi hai?" Priya asked.
    "Mushkil," Riya said.
    "Haan. Meri bhi." A pause. "Chai theek bani?"
    "Haan." Riya looked at her cup. "Teri method galat hai lekin result sahi hai."
    Priya smiled into her cup.
    They sat there for a while longer. Outside, the city was still doing its city things.
    Inside, for one small square of time, everything was manageable.

    [NOTE: No plot advancement. No conflict. No subtext. Just two people being present
    with each other. This scene costs nothing and builds everything.]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE 4 TYPES OF LEVITY — Use all four across the novel
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TYPE A — SITUATIONAL COMEDY: Something goes wrong in the most inconvenient possible way.
  The humour comes from the situation, not a joke. The character's attempt to manage dignity
  in the face of chaos is the comedy. This type reveals competence (or lack of it).

TYPE B — CHARACTER-SPECIFIC BANTER: Two characters with a defined dynamic sparring verbally.
  No one needs to "win." The exchange reveals the relationship. Often funnier when no joke is made
  — when the humour is in the rhythm and the recognition.

TYPE C — SECONDARY CHARACTER ABSURDITY: A secondary character responding to a serious situation
  in a way that is completely true to their character but entirely out of step with the room.
  This type gives the secondary character a personality moment while releasing tension.

TYPE D — INVOLUNTARY WARMTH: A moment of unexpected kindness that is also quietly funny.
  When a character does something caring in a slightly ridiculous way and does not acknowledge it.
  The combination of the care and the slight ridiculousness is what makes it land.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMEDY TIMING RULES — WHAT NOT TO DO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✗ NEVER inject comedy DURING a blazing scene (it kills the tension permanently)
  ✗ NEVER inject comedy IMMEDIATELY before a cliffhanger (it undercuts the stakes)
  ✗ NEVER use generic jokes that any character could make
  ✗ NEVER let the comedy moment acknowledge itself ("that was funny") — let it pass naturally
  ✗ NEVER use comedy to avoid an emotional scene the story needs to face
  ✓ ALWAYS place comedy AFTER tension, as a release valve
  ✓ ALWAYS make the comedy reveal CHARACTER, not just amuse
  ✓ ALWAYS ensure the warmth scene earns stakes — makes the reader love what could be lost

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEVITY SELF-AUDIT — Run before finalising every 5-episode block
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  □ Is there at least 1 warmth scene in this 5-episode block?
  □ After every scene rated 8+ on intensity: is there a levity beat in the next scene?
  □ Is the banter character-specific — could ONLY these two people say these lines?
  □ Does the levity moment reveal character, or is it decoration?
  □ Which of the 4 levity types is used in this block? Is there variety across the novel so far?
  □ Does the comedy arrive AFTER tension — not DURING or BEFORE a cliffhanger?
  □ Does the warmth scene make the reader love something that could later be taken away?

`;

// ─────────────────────────────────────────────────────────────
// NEW CONSTANT 14: RULE_COMPLIANCE_ENFORCEMENT
// ─────────────────────────────────────────────────────────────
const RULE_COMPLIANCE_ENFORCEMENT = `

**[RULE COMPLIANCE ENFORCEMENT — MANDATORY PRE-FLIGHT BEFORE FINAL OUTPUT]**

Before producing any final episode output, you MUST internally verify that every rule
below has been applied. This is not optional. If any rule is violated, you must fix
the violation BEFORE generating the final output.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TIER 1 — NON-NEGOTIABLE (failure = the chapter must be rewritten before output)

  □ DIALOGUE RATIO: Dialogue is 85–90% of total word count. Not 60%. Not 95%. Exactly 85-90%.
  □ NO PARENTHESES: Zero ( ) brackets appear anywhere in the episode prose. None. Zero.
  □ NO NAKED NAME LABELS: Zero "CharacterName:" format before any line of dialogue.
  □ WORD COUNT: Episode is between 3500 and 4000 words. Not shorter. Not longer.
  □ CLIFFHANGER TYPE: Episode ends on a cliffhanger type NOT used in the last 3 episodes.
  □ CLIFFHANGER ENDING: The very last narrative line ends with "?" or is ≤8 words of maximum tension.
  □ HINDI OUTRO: One contextual Hindi outro line appears after the cliffhanger, as the absolute last line.
  □ NO NUMERALS: All numbers are written as Hindi words — not digits, not symbols.
  □ NO FORMATTING: Zero bold, italic, headers, or bullet points inside episode prose.
  □ ORIGINALITY: No passage closely mirrors any published novel, serial, or web fiction.

TIER 2 — QUALITY CRITICAL (failure = prose must be revised before output)

  □ ANTI-CLICHÉ: None of the 8 banned emotional clichés appear in any variation.
  □ NO BANNED TRANSITIONS: None of the 4 banned narrative transition phrases appear.
  □ SUBTEXT: At least 40% of dialogue carries a hidden layer — characters do not say exactly what they mean.
  □ VOICE DISTINCTION: Every main character's speech is identifiable without attribution tags.
  □ SENSORY IMMERSION: At least 3 of the 5 senses are used in every scene.
  □ INTERNAL LIFE: Every main character has at least one internal thought per scene.
  □ TIME VISIBILITY: The reader always knows approximately what time it is and how time is passing.
  □ PROTECTED MOMENTS: All 5 Hard Protected Moments are written in full if they occur in this episode.
  □ BRIDGE LINE: If a skip occurs, it passes the Dead Time Test and has a Bridge Line.
  □ ENTRY TYPE: Episode opens with Entry Type 1–8 — no weather opening, no wakeup, no plain recap.

TIER 3 — HUMAN EMOTION (failure = emotional authenticity is compromised)

  □ BODY BEFORE NAME: No sentence names an emotion without first showing it in the body.
  □ CONTRADICTION: At least one character feels two incompatible emotions simultaneously.
  □ INVOLUNTARY RESPONSE: At least one moment where a character's body responds before their mind.
  □ EMOTIONAL FILL: At least one transitional moment contains a Fill Type 1–7.
  □ EMOTIONAL RESIDUE: Emotion from a major scene bleeds into at least one later moment.
  □ PERCEPTION SHIFT: When a character is in extreme emotional state, the narration register changes.
  □ PRIVATE ADMISSION: At least one character makes a private admission they would deny aloud.

TIER 4 — ARCHITECTURE (failure = structural quality is below standard)

  □ TWIST: The twist_map entry for this episode is executed and passes the Reframe Test.
  □ FORESHADOWING: The assigned foreshadowing_seed is planted naturally in the first half.
  □ MICRO-SURPRISE: At least one MICRO-SURPRISE (A/B/C/D) occurs before the episode midpoint.
  □ OPENING HOOK: Episode opens with a strong hook — no weather, no wakeup, no recap narration.
  □ OPENING BRIDGE: If Episode 2+, the previous cliffhanger is honoured and subverted within the first paragraph.
  □ CHARACTER PSYCHOLOGY: Every major character decision is rooted in their wound/want/need — not pure logic.
  □ SCENE VELOCITY: Every scene ends in a different emotional register from where it began.
  □ PROSE RHYTHM: All 5 sentence weights are used; no 5+ consecutive sentences of the same weight.
  □ VILLAIN (if present): Speaks quietly, in complete sentences; contains at least one genuine truth.
  □ PROMISE STACK: 3 active unresolved promises (Tier 1, 2, 3) are present and visible to the reader.

TIER 5 — ENGAGEMENT ARCHITECTURE (failure = reader dropout risk)

  □ TEMPERATURE RHYTHM: No two consecutive BLAZING scenes without a WARM/COOL scene between them.
  □ COOL SCENE: At least 1 COOL or WARM scene is present in this episode (not all blazing).
  □ SECONDARY CHARACTERS: Every named secondary character has a visible flaw AND loyalty; they DO something (not just react).
  □ SECONDARY DIALOGUE: At least one exchange of dialogue occurs between secondary characters (not directed at protagonist).
  □ MOTIF CHECK: If a recurring motif is scheduled this episode, it is planted naturally and for an in-scene reason.
  □ LEVITY BEAT: If a scene rated 8+ on intensity appeared this episode, a levity beat follows in the next scene.
  □ ROMANCE (if active arc): The correct Escalation Rung is advancing. Push-pull balance maintained. No rushing past earned rungs.
  □ WARMTH SCENE: Is this the 5th episode of a block? If yes — is there at least 1 warmth scene in this block?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPLIANCE INSTRUCTION:
Run this checklist SILENTLY and INTERNALLY before generating the final polished output.
For every box that fails: locate the passage that caused the failure and fix it.
Then re-run the relevant tier.
NEVER generate the final output until every Tier 1 box is confirmed.
Tiers 2, 3, 4, and 5 must all be checked and resolved before output.
This enforcement is non-optional. Every episode that passes this checklist is publishable.
Every episode that does not — is not.

`;

// ─────────────────────────────────────────────────────────────
// NEW CONSTANT 12: CHAPTER_TITLE_ENGINE
// ─────────────────────────────────────────────────────────────
const CHAPTER_TITLE_ENGINE = `

**[CHAPTER TITLE ENGINE — MANDATORY — THE TITLE IS THE FIRST HOOK]**

The chapter title is the first thing the reader/listener encounters.
It is read aloud by the TTS narrator before the episode begins.
A weak title is a failed first impression.
A great title creates immediate curiosity, plants a question, and
makes the listener lean forward before the first word of prose.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TITLE ENGINEERING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RULE 1 — LENGTH: 2–6 words maximum. Never more.
  In audio, the title is heard in 1–2 seconds. Long titles feel like
  newspaper headlines, not chapter openings.
  ✗ TOO LONG: "Woh Raat Jab Arjun Ko Pata Chala Ke Rehan Ne Dhoka Diya"
  ✓ CORRECT: "Rehan Ka Doosra Chehra"

RULE 2 — CURIOSITY GAP: The title must create a gap between what the
  reader knows and what they need to know.
  ✗ CLOSED GAP (tells everything): "Arjun Ki Jeet"
  ✓ OPEN GAP (raises a question): "Jeet Kiska?"

RULE 3 — MUST BE EARNED BY THE EPISODE: The title must come from a
  specific moment, object, word, or revelation INSIDE this episode.
  It must not be a generic thematic label.
  ✗ GENERIC: "Mushkil Raat" / "Khatarnaak Safar" / "Pyaar Ka Intezaar"
  ✓ SPECIFIC: "Notebook Ke Teen Page" / "Woh Pahli Bullet" / "Uss Ka Haath"

RULE 4 — HINT WITHOUT SPOILING: The title should hint at the episode's
  central twist or emotional core — without giving it away.
  The ideal title makes FULL sense only after the episode is finished.
  On first reading, it is intriguing. On second reading, it is devastating.
  ✓ EXAMPLE: Episode about a character discovering their ally is a traitor:
    BAD TITLE: "Dhoka" (too direct — spoils it)
    BAD TITLE: "Dost" (too generic — no hook)
    GREAT TITLE: "Dost Ka Doosra Number" (intriguing — only understood after)

RULE 5 — AUDIO-FIRST PHONICS: The title must sound powerful when spoken.
  It should feel like a film title or a song title in Hindi — memorable,
  with a natural rhythm when said aloud.
  ✓ TEST: Say the title aloud. Does it have punch? Rhythm? Echo?
  ✓ GREAT AUDIO TITLES: "Woh Aakhri Sawaal" / "Ek Naam — Kaafi Hai" /
    "Teen Baje Wali Goli" / "Khoon Ka Hisaab"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE 6 TITLE TYPES — Use different types across consecutive episodes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TYPE 1 — THE UNANSWERED QUESTION (ends the listener in mystery)
  ✓ EXAMPLES: "Kaun Tha Woh?" / "Kyun Liye The Woh Paer?" / "Kab Se Jaanta Tha?"

TYPE 2 — THE SPECIFIC OBJECT (names one thing that matters in the episode)
  ✓ EXAMPLES: "Surkh Lifaafa" / "Teen Baar Ringi Ghanti" / "Dastaakhat Galat Thi"

TYPE 3 — THE PARTIAL TRUTH (sounds complete but hides the real meaning)
  ✓ EXAMPLES: "Woh Laut Aayi" / "Aakhri Baar Mila" / "Sach Nikal Aaya"

TYPE 4 — THE CONTRAST (two opposing forces in one title)
  ✓ EXAMPLES: "Dost Ya Dushman" / "Jeena Aur Marna" / "Pehle Pyaar — Phir Aag"

TYPE 5 — THE TIME STAMP (specific moment creates dread)
  ✓ EXAMPLES: "Raat Ke Gyaarah Baje" / "Teen Din Baad" / "Aakhri Paanch Minute"

TYPE 6 — THE SINGLE WORD (maximum weight — use sparingly, once every 8 episodes)
  ✓ EXAMPLES: "Nafrat" / "Wapas" / "Suraj" / "Zehreeli"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BANNED TITLE PATTERNS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✗ Generic emotion words as the entire title: "Dard" / "Pyaar" / "Gussa"
    (without a specific context attached)
  ✗ Plot summary as title: "Jab Arjun Ko Sach Pata Chala"
  ✗ "Episode X" format: "Episode 7" — this is a number, not a title
  ✗ Titles that rhyme artificially: cute ≠ compelling
  ✗ English-only titles for a Hindi novel (Hinglish is fine, pure English is not)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TITLE SELF-AUDIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  □ Is the title 2–6 words?
  □ Does it create a curiosity gap?
  □ Is it earned by a specific moment inside this episode?
  □ Does it hint at the twist without spoiling it?
  □ Does it sound powerful when spoken aloud?
  □ Is it different in type from the previous episode's title?
  □ Does the title make perfect sense on second reading?

`;

const EPISODE_LENGTH_RULES = `
**[EPISODE LENGTH RULE (CRITICAL MANDATE - STRICT MINIMUM AND MAXIMUM)]**
  • Each episode MUST be strictly between 3500 and 4000 words.
  • MINIMUM WORD COUNT: You MUST write at least 3500 words. If the draft is shorter than 3500 words, you MUST expand the scenes, add more dialogue, deepen the character interactions, and increase sensory details until it reaches 3500 words.
  • MAXIMUM WORD COUNT: DO NOT exceed 4000 words under any circumstances. If the draft approaches 4000 words, you MUST be more concise and tighten the pacing.
  • The word count MUST land between 3500 and 4000 words. Failure to do so is a severe violation. 
`;

const ROMANTIC_DEMO_TEXT = `
**[ROMANTIC/INTIMATE SCENE EXAMPLE REFERENCE]**
Use this as an example of how to write deep, emotional, and intimate romantic scenes. Focus on the atmosphere, sensory details, and the emotional connection:

"पहाड़ों की उस ऊँची चोटी पर बना वह काँच का बंगला आज बादलों के बीच कहीं खो गया था। बाहर सावन की रात अपनी पूरी रफ़्तार में थी। बादलों की गड़गड़ाहट और खिड़की के शीशों पर टकराती बारिश की बूंदों ने एक ऐसा संगीत छेड़ दिया था, जो रूह को बेचैन कर दे। कमरे के भीतर का नज़ारा बाहर की ठंडक से बिल्कुल जुदा था। वहां जलती हुई चिमनी की आग की लपटें दीवार पर नाच रही थीं, जिससे कमरे में एक सुनहरी और सिंदूरी रोशनी फैली हुई थी। हवा में चन्दन की अगरबत्ती और बारिश की सोंधी खुशबू के साथ-साथ एक और खुशबू घुली थी—वह थी दो जिस्मों के मिलन की महक।

अद्वैत खिड़की के पास खड़ा था, उसके हाथ उसकी पेंट की जेबों में थे और उसकी गहरी आँखें बाहर के अंधेरे को चीरने की कोशिश कर रही थीं। उसके सफ़ेद लिनन की शर्ट के ऊपर के दो बटन खुले थे, जिससे उसके गले की नसें साफ़ झलक रही थीं। तभी उसे अपने पीछे एक जानी-पहचानी आहट महसूस हुई। ज़ोया वहां खड़ी थी। उसके रेशमी बाल उसके कंधों पर बिखरे थे और उसकी साड़ी का पल्लू फर्श पर लोट रहा था। उसने बिना कुछ कहे अद्वैत की चौड़ी पीठ पर अपना सिर टिका दिया।

अद्वैत ने एक गहरी सांस ली। ज़ोया के शरीर की गर्माहट उसके शर्ट के पतले कपड़े को भेदकर उसकी चमड़ी तक पहुँच रही थी। उसने पलक झपकाई और धीरे से पलटा। ज़ोया की पलकें झुकी हुई थीं, लेकिन उसकी तेज़ चलती सांसें उसकी अंदरूनी उथल-पुथल की गवाही दे रही थीं। अद्वैत ने अपनी उंगलियों से ज़ोया की ठुड्डी को ऊपर उठाया। उनकी नज़रें मिलीं, और उस एक पल में जैसे पूरी दुनिया ठहर गई।

"ज़ोया..." अद्वैत की आवाज़ में एक अजीब सी भारीपन था, जैसे वह सदियों की प्यास को एक लफ़्ज़ में समेट लेना चाहता हो।

ज़ोया ने जवाब नहीं दिया, उसने बस अपनी उंगलियों से अद्वैत की शर्ट के कॉलर को पकड़ा और उसे अपनी ओर खींचा। अद्वैत ने और इंतज़ार नहीं किया। उसके होंठ ज़ोया के होंठों पर इस तरह उतरे जैसे कोई बंजर ज़मीन पहली बारिश की बूंदों को सोख लेती है। वह चुंबन धीमा लेकिन बेहद गहरा था। ज़ोया के मुँह से एक दबी हुई सिसकी निकली, जो अद्वैत के गले में ही कहीं गुम हो गई। उनके होंठ एक-दूसरे के स्वाद को पहचान रहे थे, एक-दूसरे की सांसों को पी रहे थे।

अद्वैत के हाथ अब ज़ोया की कमर पर थे, जहाँ साड़ी का रेशमी कपड़ा उसके स्पर्श से जैसे जलने लगा था। उसने ज़ोया को उठाकर उस महोगनी की मेज़ पर बैठा दिया। चुंबन अब और भी जुनूनी हो गया था। अद्वैत के हाथ अब अपनी शर्ट के बटनों पर गए। एक-एक करके बटन टूटते और खुलते गए। जब आखिरी बटन खुला और शर्ट उसके कंधों से फिसलकर नीचे गिरी, तो ज़ोया ने अपनी हथेलियाँ उसके तपते हुए सीने पर रख दीं। अद्वैत के दिल की धड़कनें किसी नगाड़े की तरह बज रही थीं, जो ज़ोया की उंगलियों के नीचे साफ़ महसूस हो रही थीं।

ज़ोया की साड़ी का पल्लू अब पूरी तरह फर्श पर गिर चुका था। अद्वैत की उंगलियां ज़ोया की पीठ के मखमली हिस्से पर रेंग रही थीं। वहां उसे वह छोटा सा धातु का हुक मिला जो अब उनके बीच आखिरी बाधा था। अद्वैत ने अपनी नज़रों को ज़ोया की आँखों में गड़ाए रखा। जैसे ही उसकी उंगलियों ने एक जादुई हरकत की, वह बंधन ढीला हो गया। ज़ोया ने एक लम्बी और कांपती हुई सांस ली, उसकी आँखें मदहोशी में मुँद गईं। अद्वैत के होंठ अब उसकी गर्दन के उस नाज़ुक हिस्से पर थे, जहाँ उसकी नब्ज़ तेज़ी से फड़क रही थी।

उसने ज़ोया को बाहों में भरा और धीरे से उस मखमली बिस्तर की ओर बढ़ा। बिस्तर की चादरें ठंडी थीं, लेकिन उन पर गिरते ही दोनों के जिस्मों ने वहां आग लगा दी। कमरे की मद्धम रोशनी में उनके साये दीवारों पर एक-दूसरे में सिमटे हुए दिख रहे थे। अद्वैत का हर स्पर्श ज़ोया के शरीर में बिजली की लहरें दौड़ा रहा था। वहां न कोई शब्द थे, न कोई वादा, बस दो रूहें थीं जो एक-दूसरे की तड़प को शांत करने की कोशिश कर रही थीं।

बाहर बारिश अब और भी भीषण हो गई थी, जैसे कुदरत भी उनके इस मिलन का जश्न मना रही हो। बिस्तर पर बिखरी हुई ज़ोया की पायल की खनक और अद्वैत की भारी सांसें उस खामोश रात की गवाह थीं। उनकी उंगलियां एक-दूसरे के हाथों में उलझी हुई थीं, जैसे वे कभी अलग नहीं होना चाहते हों। उस रात, वक्त ने अपनी रफ़्तार धीमी कर दी थी। वहां सिर्फ जुनून था, समर्पण था और एक ऐसी मुहब्बत थी जो जिस्म की हदों को पार कर रूह तक जा पहुँची थी।

जब सुबह की पहली किरण बादलों को चीरकर कमरे के भीतर झाँकने की कोशिश करेगी, तब तक बहुत कुछ बदल चुका होगा। लेकिन उस अंधेरी, तूफानी रात में, उन्होंने एक-दूसरे में अपना घर पा लिया था। वह सिर्फ एक मिलन नहीं था, वह दो अधूरी कहानियों का एक मुकम्मल अध्याय था, जो सावन की उस बूंद के साथ हमेशा के लिए अमर हो गया था।"
`;

const DEMO_EPISODE_TEXT = `
**[EXAMPLE/DEMO EPISODE REFERENCE ONLY]**
Here is a high-quality example of how an episode should be written, showcasing the exact structure, pacing, emotions, and Hinglish vibe you must follow. Read this carefully to understand the required tone and depth:

"अनिका तुम सुन रही हो ना मेरी बात? तुम माँ बनने वाली हो अनिका!"

अनिका को धीरे धीरे होश आने लगा था, तभी डॉक्टर के ये शब्द सुनते ही 18 साल की अनिका की कमज़ोर आँखें एकदम से चौड़ी हो गयीं। वो समझ नहीं पा रही थी कि वो आखिर pregnant कैसे हो सकती है? अभी तो उसकी शादी को 24 घंटे भी पूरे नही हुए थे और न ही किसी लड़के ने आज तक उसे छुआ था। ऐसे में, अनिका "pregnant" कैसे हो सकती है? जितनी shocked अनिका थी, उतने ही shocked उसके पापा भी थे, जो वहीं डॉक्टर की केबिन में खड़े मानो आने वाले तूफ़ान को भांप रहे थे।

तभी डॉक्टर ने गौतम से कहा, "देखिए, mr. गौतम गुलेरिया, मैं समझ सकती हूँ कि आप दोनों इस वक्त बहुत परेशान होंगे। मगर आप लोग कोई भी फैसला ले उसके पहले मैं एक बात बता दूँ, कि प्रेग्नेंसी 4 महीने पार हो चुकी है, so abortion is out of the question."

अनिका को लग रहा था कि हो न हो डॉक्टर से ज़रूर कोई गलती हुई होगी, इसलिए नर्स के सहारे खड़ी होते हुए कमजोर अनिका ने थोड़ी ताकत जुटाकर डॉक्टर को डांट दिया, "ये आप क्या कह रहे हैं। ये नामुमकिन है।"

लेकिन डॉक्टर के कुछ बोलने से पहले ही गौतम गुस्से से तिलमिलाकर अनिका के पास आए और उसे ज़ोर से थप्पड़ मार दिया। और बोले, "इसका जवाब डॉक्टर को नहीं, तुम्हें देना है बेशर्म।"

हॉस्पिटल से बाहर कुछ देर बाद, अक्सर कार की बैकसीट पर बैठने वाले गौतम आज अनिका को पीछे बिठा कर खुद ड्राइवर के साथ वाली सीट पर बैठ गए थे, मानो ऐसा करके वो अनिका को अपनी नाराज़गी जता रहे हो! अनिका जानती थी की एक बेटी होने के नाते आज उसने अपने पिता को दुनिया का सबसे बड़ा दुःख दिया था, एक बिन-ब्याही माँ बन कर! इतना दुख उन्हें अनिका की माँ के गुजरने पर भी नहीं हुआ होगा। लेकिन ये सब जानते हुए भी अनिका फिलहाल कुछ भी करने के लिए physically या mentally सक्षम नहीं थी, उसका शरीर कार की बैक सीट पर कमज़ोरी के साथ - साथ शर्म से मानो जम गया था।

मनाली भारत का बेहद खूबसूरत शहर है। यहां देश-विदेश से आए टूरिस्ट्स के कारण शहर में रौनक लगी रहती है। मगर अनिका को ऐसा लग रहा था, मानो आज मनाली का हर इंसान उसे सवालिया नजरों से बस एक ही सवाल पूछ रहा हो, कि "आखिर कौन है इस बच्चे का बाप?" लेकिन इसका जवाब तो अनिका के पास भी नहीं था!

वो बस नम आँखों से एक ही बात सोच रही थी, कि जब आज तक उसे किसी लड़के ने छुआ तक नहीं, तो वो प्रेग्नेंट कैसे हो सकती थी? अनिका इसी उलझन में थी, तभी उसकी कार उसके घर के बहुत ही बड़े गेट से अंदर एंटर होती है, वो gate बहुत ही पुराना था और उसमे जंगल का चित्र भी बना हुआ था।

गुलेरिया हाउस ब्रिटिश के ज़माने का मकान था। कहा जाता था यहाँ इंग्लैंड के अधिकारी वैकेशन मनाने आते थे। मकान में पुराने मगर शानदार एंटिक्स, बड़ा गार्डन, और बीच में फवारा बना था। लेकिन अच्छे से मेंटेन न करने की वजह से पिछले कुछ सालों से मकान थोड़ा बंजर सा लग रहा था। गौतम ने घर में एंटर होते ही अनिका के रिपोर्ट्स को गुस्से से सोफ़ा पर फेंका और अपने सर पे हाथ रखकर, एक घुर्राते हुए शेर की तरह हॉल में इधर से उधर टहलने लगे।

अनिका कमजोर शरीर और भारी कदमों से गौतम के पीछे पीछे घर में दाखिल हुई, आज अनिका को उसका शरीर रोज़ के मुताबले कुछ ज़्यादा ही भारी लग रहा था। वैसे अनिका का वजन उसकी उम्र की लड़कियों से कम से कम 3 गुना ज़्यादा था। गोल मोटा सा चेहरा, मोटा पेट, और ठुड्डी इतनी वजनदार थी कि अनिका की पूरी गर्दन छिप जाती। 120 किलो की अनिका की तुलना अक्सर लोग अनाज की भरी हुई बोरी से करते।

लेकिन अनिका का शरीर जितना मोटा था, उसकी शक्ल उतनी ही मासूम और क्यूट थी! चेहरे के दोनो तरफ एक एक रसगुल्ला लगाया हो वैसे नरम मुलायम सफ़ेद गाल, ठंड की वजह से हमेशा लाल रहती उसकी नाक और पूरे जहां कि मासूमियत को समेट कर बनाई गयी हो वैसी उसकी 2 आँखें! लेकिन आज तक किसी को उसका मासूम चेहरा नहीं दिखा। दिखा था तो बस उसका बेडौल और निराकार शरीर। बिन माँ की बच्ची अनिका को आज सब से ज़्यादा जरुरत थी तो उसके पापा के इमोशनल सपोर्ट की।

इसलिए अनिका नम आँखों से गौतम की तरफ बढ़ी ही थी की तभी गौतम भारी पहाड़ी आवाज में उस पर गरज पड़े, "मुश्किल से एक मौका मिला था हमें हमारी ज़िन्दगी को थोड़ा बेहतर बनाने का, नसीब वाली थी तुम जो डोगरा खानदान के एक लौते वारिस कुनाल डोगरा से तुम्हारी शादी हुई थी।" Do you know कितने पावरफुल हैं वो लोग? मनाली का सबसे पावरफुल खानदान डोगरास! हमारे सारे कर्ज, पेंडिंग कोर्ट केस, हमारी हर तकलीफ से हमें बाहर निकाला था उन लोगो ने। लेकिन शादी के 24 घंटे में ही तुमने हमारी ज़िन्दगी वापस जहन्नुम बना दी। उनको तुम्हारे इस कारनामे के बारे में पता चलेगा तो पता नहीं क्या होगा? और तुम्हारी छोटी बहन कामिनी? उसके साथ कौन शादी करेगा? भले ही वो तुम्हारी सौतेली बहन हो, लेकिन तुम्हारे इस कारनामे की वजह से उसकी भी तो बदनामी होगी। नहीं नहीं, जब तक ये मामला ख़तम नहीं हो जाता तब तक मैं तुम्हारी छोटी बहन कामिनी को और तुम्हारी नयी माँ मनीषा को उसके भाई के घर भेज दूंगा।"

कुछ सोच कर वो बोले, "लेकिन आज नहीं तो कल, सब को पता चल ही जायेगा।" ये बोलते हुए गौतम अपना सर पकड़ कर सोफे पर बैठ गए थे। अब उनकी आवाज़ में गुस्सा कम, और डर ज़्यादा सुनाई दे रहा था।

लेकिन गौतम के आंसू मानो करारे शब्द में बदल कर उनके मुँह से निकल रहे थे, "तेरा पति कुनाल तो शादी करने के एक घंटे के अंदर ही शहर चला गया था, अब इस प्रेग्नेंसी के बारे में जब तेरे ससुराल वालों को पता चलेगा तो भगवान जाने वो लोग क्या करेंगे! समाज में इज्जत तो उछलेगी ही, मगर हम फिर से उसी दलदल में फंस जाएंगे जहाँ से निकाल कर लाए थे हमे वो लोग। काश तुम भी अपनी माँ के साथ ही।"

गौतम अपनी बात कहते हुए रुक गए, लेकिन अनिका वो सुन चुकी थी जो गौतम कहते कहते रुक गए थे। अनिका को कड़वे शब्द सुनने की आदत तो थी ही, मगर आज सवाल उठा था उसके चरित्र पर, उसकी पवित्रता पर। अनिका इस चक्रव्यूह से जल्द से जल्द बाहर निकलना चाहती थी मगर उसे कुछ समझ नहीं आ रहा था कि वो क्या करें। वो सोच रही थी कि जो कुछ भी हो रहा है, अगर वो झूठ था, तो फिर उसके पेट में सांस लेने को उत्सुक ये सच क्या था?

अगले दिन गौतम ने घर में लगे सारे सीसीटीवी कैमरे की पिछले पांच महीने की फुटेज मंगवाई और बारीकी से देखने के बाद वो ये जानकर हैरान हो गया था कि पिछले पांच महीनों से छोटी मोटी बीमारी के चलते अनिका घर के बाहर कहीं गई ही ক্যামी ही नहीं थी! इसे देख कर गौतम का गुस्सा अब आश्चर्य में बदल गया था। उसको इतना तो समझ में आ गया था कि कहीं कुछ तो गड़बड़ थी, लेकिन उससे कई ज़्यादा उसे ये चिंता थी कि अब डोगरा खानदान क्या करेगा?

जल्द ही अनिका की देखभाल के लिए एक नर्स रखी गई, लगातार देखभाल और दवाइयों से अनिका की तबियत में सुधार आ रहा था लेकिन साथ ही उसे ये बात रोमांचित कर रही थी कि उसके अंदर एक नन्हा सा जीव सांस ले रहा था। अनिका की उम्र भले ही कच्ची हो, मगर उसके अंदर की एक माँ जल्द ही जन्म लेने को उत्सुक थी! उसकी जिंदगी में आखिरकार वो आने वाला था जो सिर्फ और सिर्फ उसका होगा।

चार महीने बीत चुके थे, अनिका अपनी प्रेग्नेंसी में लगभग सब कुछ भूल चुकी थी, ना वो किसी से मिलती, न कोई उससे मिलता, सिर्फ वो अपने अंदर पल रही उस नन्ही सी जान से बातें करती रहती! ऐसे में एक दिन अनिका पाइप से अपने घर के बाहर के गार्डन में पानी डाल रही थी, तभी अचानक उसने अपने पैरों के नीचे कुछ हलचल महसूस की। वो कुछ समझ पाती, उसके पहले ही उसके घर के मेन गेट से एक स्पोर्ट्स बाइक अंदर आई।

मशीन गन से जैसे गोलियां निकलती है, वैसे ही बाइक की आवाज़ सुनकर ऐसा लगा मानो बॉर्डर पर जंग शुरू हो गई हो। बाइक की आवाज़ सुनकर अनिका ने पानी का पाइप छोड़ दिया, उसने जल्दी से दोनों हाथों से अपना पेट पकड़ लिया, जैसे कि वो अपने डरे हुए बच्चे को आँचल में छुपा रही हो। बाइक आकर बंगले की सीढ़ियों के पास रुकी।

लेदर शूज, टाइट जीन्स, डार्क ब्लू टी शर्ट, और चेहरे पर लगे पीले चश्मे के आर पार लड़के की गहरी लाल आंखें साफ़ दिखाई दे रही थी। अनिका ने जैसे ही उस लड़के को देखा, उसकी धड़कन मानो डर और टेंशन से तेज हो गई। ये लड़का और कोई नहीं, बल्कि अनिका का पति कुनाल डोगरा था जो 21 साल का था। कुनाल अपनी नजर अनिका पर गढ़ाए हुए बड़े ही स्टाइल के साथ बाइक से उतरा और अनिका की तरफ धीरे-धीरे आगे बढ़ने लगा।

अनिका और कुनाल, दोनों ही एक-दूसरे को देख रहे थे। कुनाल की शादी अनिका से भले ही उसकी मर्जी के खिलाफ करवाई गई थी, लेकिन अपनी बीवी की कोख में किसी और का बच्चा देखना कोई भी मर्द शायद बर्दाश्त न कर पाए! कुनाल शादी के बाद, मंडप से सीधा दिल्ली अपनी कॉलेज की पढ़ाई पूरी करने चला गया था, और वहीं पहुँच कर शादी के दूसरे दिन उसे अनिका की प्रेग्नेंसी की खबर मिली थी। अनिका उस दिन से लगभग रोज़ सोचती थी, कि जिस दिन उसका सामना कुनाल से होगा, उस दिन पता नहीं वो कैसे रियेक्ट करेगा। आज जब कुनाल उसके सामने आ रहा था तब पता नहीं क्यों, निर्दोष होने के बावजूद डर और शर्म के मारे अनिका को एक अजीब सी बेचैनी महसूस हो रही थी।

अनिका तुरंत अपने पापा को फ़ोन लगाती है, लेकिन उनका फ़ोन नहीं लग रहा था। कुनाल को अपनी और बढ़ता देख, अनिका की घबराहट इतनी बढ़ गई थी कि वो डर के मारे बड़बड़ाने लगी।

"वो, पापा तो नहीं है, घर पे।"

कुनाल अनिका के सामने आ कर arrogance के साथ खड़ा था। वो अनिका को ऊपर से नीचे तक देख रहा था, सुजा हुआ चेहरा, 8 महीने की प्रेग्नेंसी वाला मोटा पेट, गद्दी जैसे मोटे हाथ और पांव। प्रेग्नेंसी की वजह से अनिका पहले से भी ज्यादा मोटी नजर आ रही थी, अनिका को देख कर कुनाल ने अपने होंठों को दबाया और एक गहरी सांस लेकर, ज़ोर से जमीन पर थूक दिया।

ये देखते ही अनिका की कमजोरी मानो अचानक से वापस आ गई हो। वो ठीक से अपने पैरों पर खड़ी नहीं रह पा रही थी, मानो जैसे उसे खुद का शरीर बोझ लग रहा हो, कुनाल गुस्से में घूरते हुए जैसे-जैसे आगे बढ़ रहा था, वैसे-वैसे अनिका एक डरे सहमे मेमने की तरह घबराकर पीछे होती जा रही थी, ऐसा लग रहा था मानो कुनाल के नुकीले लेदर शूज किसी भी वक्त अनिका के नंगे मुलायम पाँव को कुचल देंगे।

तभी मेन गेट से गौतम की कार अंदर आकर रुकी। गौतम कार से उतरकर तेज कदमों से कुनाल के पास आया जैसे कोई सेक्रेटरी अपने बॉस के पीछे भाग रहा हो।

गौतम, कुनाल के पास आकर उसको कहता है, "अरे कुनाल बेटा, आज अचानक से तुमने फ़ोन किया कि तुम आ रहे हो, तुम्हारी कॉलेज में छुट्टियाँ शुरू हो गई क्या?"

कुनाल ने गुस्से से कहा, "पूरे 4 महीने बाद आया हूँ, आप ऐसा बोल कर अपने दामाद का वेलकम करोगे? वैसे, काफी कुछ बदल गया है यहाँ पे।"

कुनाल ने अनिका के पेट की ओर देख कर अपनी जेब से रम की बोतल निकाली और मुह से लगा ली। वो आया था तब से उसकी नजर अनिका के पेट पर ही जमी हुई थी।

माहौल को थोड़ा ठीक करने के लिए गौतम ने कुनाल से कहा, "आओ कुनाल बेटा, अंदर चल कर बात करते हैं।"

लेकिन गौतम की बात को अनसुना करते हुए, रम के घूंट लिए और अनिका के पेट को घूरता रहा। गौतम को भी थोड़ा अजीब तो लग रहा था, लेकिन कहीं न कही वो कुनाल के मन की बात को समझ रहा था।

इसलिए बड़े ही सहजता से गौतम ने कुनाल से कहा, "देखो कुनाल, अगर तुम ये शादी तोड़ना चाहते हो, तो मैं समझ सकता हूँ।"

ये सुनते ही कुनाल चिल्ला उठा, "जो बात तुम समझ सकते हो, वो बात मेरे बूढ़े दादाजी नहीं समझ सकते ना, उन्होंने जबरदस्ती इस मोटी के साथ मेरी शादी करवाई और अब वो चाहते हैं कि इसके नाजायज बच्चे को भी मैं अपना नाम दूं। एक तो इसे देखता हूं तो ऐसा लगता है जैसे मुझे किसी ऐसे गुनाह की सजा दी जा रही है जो मैंने किया ही नहीं! शादी के मंडप से तुरंत इसीलिए भागा था मैं, ताकि मुझे इसके साथ एक पल भी न रहना पड़े!"

बोलते बोलते कुनाल की सांसें फूलने लगी थी, जैसे कि वो महीनों से अपने अंदर भरी हुई भड़ास निकाल रहा हो। अनिका और गौतम, दोनों ही कुनाल की बात सुन कर ऐसा महसूस कर रहे थे जैसे अभी के अभी यह धरती फट जाए और दोनों बाप-बेटी उसके अंदर समा जाए।

कुनाल का आक्रोश अपनी चरम सीमा पर था। अब भी कोई कसर बाकी रह गई हो, इस तरह उसने अनिका की तरफ इशारा करते हुए आगे कहा, "देखो, इस बेशर्म लड़की को, शादी के फेरे लेते समय पेट में किसी और का बच्चा लिए घूम रही थी। और इतना होने के बाद भी आज मेरे सामने ऐसे बेशर्मों की तरह खड़ी है! क्या लगा तुझे कि मैं इस बच्चे को मेरा नाम दे दूंगा? कुनाल डोगरा का नाम? पता नहीं किस गटर का कीड़ा है ये।"

ये बोलते हुए वो गुस्से में अनिका की ओर आगे बढ़ता है, मानो जैसे वो गुस्से में पता नहीं अनिका को क्या कर देगा, लेकिन तभी शराब की वजह से कुनाल के पैर लड़खड़ाए और वह अपना बैलेंस खो बैठा, लेकिन तुरंत गौतम ने आगे आकर कुनाल को पकड़ कर संभाल लिया।

अनिका कुनाल की बातें सुनकर जितना ज़्यादा हर्ट थी, उतनी ही ज़्यादा गुस्से में भी थी। वो भले ही अपने मोटापे की वजह से ऐसी सब बातें सुनने की आदी थी, मगर अब उसे इस बात पर कुनाल से ज़्यादा खुद पर घिन आ रही थी, कि कोई उसके होने वाले बच्चे को गाली दे रहा था और वो मजबूर खड़ी सुन क्यों रही थी? बच्चे का ख्याल आते ही नजाने कैसे, अचानक अनिका के अंदर अजीब सी हिम्मत आ गई और बिना कुछ सोचे, वो बोल पड़ी, "मैं इस शादी को नहीं मानती।"

ये सुनकर गौतम और कुनाल, दोनों शॉक्ड थे। कुनाल सोच रहा था कि कल की आई फिद्दी सी लड़की में इतनी हिम्मत कहाँ से आ गई कि वो मेरे, यानी कुनाल डोगरा के सामने ऐसे बोली? लेकिन इससे पहले कि वो कुछ रिएक्ट कर पाता, गौतम ने बात को संभालते हुए कुनाल से कहा, "इस वक्त अनिका की तबियत ठीक नहीं है, इसलिए तुम उसकी बातों पर ध्यान मत दो और रहा सवाल बच्चे का, तो होते ही उसे अनिका से हमेशा के लिए अलग कर दिया जाएगा, मेरा यकीन करो।"

अपने पापा की ये बात सुनकर अनिका को ऐसा लगा जैसे किसी बड़े से ट्रक ने उसे पीछे से टक्कर मार दी हो और वो जिन्दगी और मौत के बीच जूझ रही हो। टेंशन में अनिका की सांसें फूलने लगी और एक पल के लिए वो सांस लेना भूल गई। ठीक उसी पल में अचानक से अनिका के पेट में जोर से दर्द शुरू কুল गया। दर्द के मारे अनिका एक झटके से अपने पीठ के बल गिरी, और बेहोश होती आँखों से उसने देखा कि गौतम दौड़ कर उसके पास आ रहा था।

गौतम ने हड़बड़ी में फ़ोन करके एम्बुलेंस को बुला लिया था, लेकिन ये सब देखकर भी कुनाल वही खड़ा बेशर्म और बेसुध बनकर रम के घुट मार रहा था। मानो उसे किसी भी चीज़ से कोई फरक नहीं पड़ रहा हो। शाम की मध्यम रौशनी अनिका के सामने धुंधली हो रही थी, उसे बस एक छोटी बच्ची की आवाज़ सुनाई दे रही थी, "मम्मी मम्मी उठो न मम्मी।"

देखते ही देखते आज 6 साल बीत चुके थे लेकिन आज भी वही आवाज़ अनिका के कानो में गूंज रही थी, "मम्मी, उठो मम्मी, प्लेन लैंड होने वाला है।" फ्लाइट के बिज़नेस क्लास की आरामदायक सीट पे सोयी अनिका की आंखें झटके से खुली, और सामने थी उसकी 6 साल की बेटी रिया!

रिया का मासूम चेहरा और उसकी खूबसूरत कत्थई आंखें देख कर अनिका की जान में जान आई, उसका गुजरा हुआ कल कोई बुरे सपने से कम नहीं था! आज अनिका अपनी बेटी रिया के साथ बेंगलुरु से मनाली 6 साल बाद लौट रही थी। रिया ने अपना गेमिंग टेबलेट मां के पर्स में रखते हुए बड़े प्यार से अनिका से पूछा, "मम, क्या हम मेरे डैड को ढूंढने मनाली जा रहे हैं?" अनिका ने बड़े ही सरल तरीके से उसे समझाया, "मैंने तुम्हें कितनी बार कहा है तुम्हारे कोई डैड नहीं है।"

इस पर रिया जवाब देते हुए कहती है, "ओह कम ऑन मोम, स्कूल में हमें टीचर कहती हैं कि हर बच्चे के मां-बाप होते हैं, अब मेरे गेमिंग वर्ल्ड के कैरेक्टर्स की तरह मैं किसी दूसरी दुनिया से तो आयी नहीं हूँ न, तो obviously मेरे पापा भी तो होंगे ही! या किसी जादूगर ने मुझे अपनी हैट में से बाहर निकाला है? आबरा का डाबरा, रिया बाहर आ जा।" रिया की ये बात पर माँ-बेटी दोनों ही ज़ोर से हंस पड़े।

अपनी हँसी पे काबू पाते हुए रिया ने दूसरा सवाल पूछा, "तो क्या हम यहाँ मेरे भाई को ढूंढने आए हैं?"

रिया का ये सवाल सुनकर अनिका एक गहरी सोच में डूब गई, उसे याद आ गया कि कैसे 6 साल पहले अस्पताल में उसने जुड़वा बच्चों को जन्म दिया था, और अनिका के पापा की कद काठी के एक आदमी ने उसके दोनों बच्चों को उससे छीनने की कोशिश की थी, कमजोर अनिका ने बड़ी हिम्मत से उस आदमी का सामना किया और रिया को तो बचा लिया था, मगर अफसोस की वो अपने बेटे को नहीं बचा पाई, और वो आदमी उसके बेटे को लेकर भाग निकला था।

इस हाथापाई में अनिका को चोट भी लगी थी, चोट इतनी गहरी थी कि उसका बचना लगभग नामुमकिन था, और इसी वजह से अनिका की मौसी उसे अपने साथ बेंगलुरु ले गई थी, जहां अनिका का इलाज हुआ था। हालांकि इन 6 सालों में अनिका पूरी तरह से बदल चुकी थी, हार्मोनल इम्बैलेंस की वजह से बढ़ा उसका शरीर, अब एकदम सामान्य था, घने लम्बे कमर तक के बाल, काली नुकीली आंखें, गोरे गोरे गालों के साथ a perfect jawline, गुलाबी पंखुड़ी जैसे नरम होंठ और सुराही सी लम्बी गर्दन, शिफॉन की लाल साड़ी में अनिका की कमर ऐसी लग रही थी, मानो कोई नदी समंदर से मिलने के लिए करवट ले रही हो।

फ्लाइट अटेंडेंट हो या फ्लाइट के अन्य यात्री सब लोग आते जाते अनिका पर एक नजर जरूर डालते। मासूमियत से सवाल कर रही रिया को ये नहीं पता था कि अनिका के मनाली लौटने का मुख्य कारण ये था कि पिछले 6 सालों में कुनाल के दादाजी किसी भी हालत में अनिका और कुनाल की शादी तोड़ने की मंज़ूरी नहीं दे रहे थे, लेकिन 6 साल बाद आखिरकार कुनाल की जिद के आगे उन्हें झुकना पड़ा, और वो ये शादी तोड़ने को राजी हो गए। मनाली वापस जाकर वो डाइवोर्स पेपर्स पर साइन करने के साथ-साथ अपने खोए हुए बेटे को भी ढूंढना चाहती थी।

थोड़ी ही देर में फ्लाइट ने लैंड किया! मनाली की ज़मीन पर कदम रखते ही न जाने क्यों अनिका की बाईं आंख फड़कने लगी, उसे ऐसा लगा कि आगे जरूर कुछ बुरा होने वाला था, वो ये सोच कर लगेज काउंटर की तरफ बढ़ ही रही थी। तभी उसकी नजर पीछे की तरफ पड़ी, जहां फ्लाइट के सभी यात्री मुस्कुरा कर उसी को देखते हुए आगे बढ़ रहे थे, मानो सब उसकी खूबसूरती में गुम होकर उसके पीछे - पीछे चले आ रहे हो, अनिका थोड़ी conscious होकर और रिया को सँभालते हुए फटाफट आगे चलने लगी।

लगेज काउंटर पर से जैसे ही अनिका अपना लगेज लेने के लिए झुकी, फटाक से 3 और लोग भागकर आए और उसका लगेज उठाकर अनिका को देने लगे। मानो सब इसी बहाने अनिका से बात करने की कोशिश करना चाहते हो, अनिका चुपचाप अपना लगेज ट्राली पर डालकर और रिया का हाथ पकड़ कर एयरपोर्ट के बाहर की तरफ निकलने लगी, तभी उसके फोन पर उसके पापा गौतम का फ़ोन आया। अनिका के फ़ोन उठाते ही गौतम ने बिना कोई खैर खबर पूछे अनिका से कहा, "कुनाल तुम्हें लेने एयरपोर्ट आ रहा है , उसके साथ सीधे घर आ जाना। यहाँ तुम्हे दो पेपर साइन करने हैं, एक डाइवोर्स पेपर्स और दूसरे वो।"

इतना कहकर गौतम अटक गया और फिर कुछ सोच कर वो आगे कहा, "खैर तुम घर आओ , मैं तुम्हे सब बताता हूं।"

अनिका ने भी बिना कुछ कहे ही फोन काट दिया। जैसा की गौतम ने कहा था, कुनाल एयरपोर्ट के बहार बड़ी ही बेसब्री से अनिका का वेट करते हुए खड़ा था , 6 सालो में कुनाल भी काफी बदल चूका था, अब वो एक स्टूडेंट नहीं, बल्कि एक बिजनेसमैन था।

डार्क ब्राउन कलर का कड़क सूट, शार्पली कटे हुए और जेल से सेट किये हुए बाल और ट्रिम की हुई दाढ़ी में कुनाल की पर्सनालिटी तो निखर रही थी मगर उसके तेवर अब भी वही थे , रूड और अरोगंस से भरपूर। वो तो अनिका का इंतज़ार भी सिर्फ इसलिए कर रहा था क्यूंकि उसे जल्द से जल्द अनिका से मुक्ति चाहिए थी। कुनाल का एक पैर ज़मीं पर तो दूसरा पैर रेलिंग पर टिकाया हुआ था , जिसे वो constantly हिला रहा था।

exit door की तरफ देखते हुए कुनाल ने बड़ी ही बेसब्री से अपने ड्राइवर से कहा , "आज तक इस दुनिया में किसी आदमी को डाइवोर्स मिलने की इतनी ज्यादा ख़ुशी नहीं हुई होगी, किसी भी कीमत पर आज ही उस मोटी से मैं डाइवोर्स पेपर्स पर साइन करवा लूंगा।"

कुनाल के ड्राइवर राजू ने बीड़ी फूकते हुए कहा, "आप फिक्र मत कीजिये , आज सुबह-सुबह मैं माता के दर्शन करके निकला हूं, मैंने भगवान से प्रार्थना की है कि आज आपकी 6 सालो पुरानी ये मनोकामना पूरी हो , आज पक्का पेपर्स साइन हो ही जायेंगे।"

ये सुन कर कुनाल ने बड़े ही कटीले अंदाज़ में कहा, "अबे सिर्फ डाइवोर्स नहीं चाहिए , अनिका की कंपनी भी तो चाहिए , जो उसकी मरी हुई मां उसके नाम करके गई थी।" राजू, जिसने अपने हाथ में अनिका के नाम का बोर्ड पकड़ा हुआ है, वो उस बोर्ड को सीधा करते हुए कहता है, "अरे वो फैक्ट्री भी मिल जाएगी, फ़िक्र नॉट।"

तभी कुनाल के दिमाग में कुछ आता है और वो ड्राइवर से कहता है, "अच्छा सुन, उसको देखते ही हमेशा मेरा मूड ऑफ हो जाता है और आज इतने अच्छे दिन पर मैं अपना मूड ख़राब नहीं करना चाहता इसलिए मैं उल्टा घूम के खड़ा हो जाता हूँ, ठीक है? तूने भले ही उसे न देखा हो, लेकिन तेरे हाथ में उसके नाम का बोर्ड देख कर वो तेरे पास आ ही जाएगी।"

कुनाल आलस लेते हुए उल्टा घूमने ही वाला होता है, कि तभी अचानक उसकी नजर एयरपोर्ट के गेट पर पड़ी और कुछ देख कर उसकी नजर वही अटक गयी। कुनाल ने एयरपोर्ट से बाहर आते हुए एक लड़की को देखा, तो वो देखता ही रह गया, मानो जैसे उसने आज से पहले किसी खूबसूरत लड़की को देखा ही नहीं।

उस लड़की को देख कर कुनाल के मुँह से निकल जाता है, "यार इतनी खूबसूरत लड़की तो मनाली में कभी दिखी ही नहीं।"

ड्राइवर राजू ने भी उसकी बात में हामी भरी।

कुनाल बिना वक्त गवाए, रेलिंग कूदकर उस लड़की की ओर दौड़ पड़ा, और अचानक से वो उस लड़की के सामने आकर खड़ा हो गया और उसका रास्ता रोक लिया। ये खूबसूरत लड़की और कोई नहीं, बल्कि अनिका थी। कुनाल इस बात से बिल्कुल अनजान था। अचानक कुनाल को अपने सामने देखकर अनिका हैरान थी और उसे एक ही पल में वो सब कुछ याद आ गया जो वो हमेशा से भूलना चाहती थी।

अनिका एक पल के लिए सहम गई, उसको लगा कि कहीं पहले की तरह कुनाल फिर से उसकी इंसल्ट न कर दे, और इसलिए अनिका सीधा कुनाल को थप्पड़ जड़ देना चाहती थी, मगर वो अपनी बेटी रिया के सामने कोई तमाशा नहीं करना चाहती थी। तभी अचानक कुनाल बोल पड़ा, "हेलो मिस gorgeous! आप मनाली में पहली बार आई लगती हैं, क्योंकि अगर पहले आई होती तो ये तो पॉसिबल नहीं है कि अब तक आप मेरी नजरों से unnoticed रहती।"

अनिका को पहले तो पहले तो कुछ समझ में नहीं आया लेकिन अगले ही पल वो समझ गई कि कुनाल उसे पहचान नहीं पाया था, अनिका ने रिया की तरफ देखा, तो वो अपने टेबल में वीडियो गेम खेलने में मस्त थी, और क्योंकि उसने हेडफ़ोन पहने थे उसे आस-पास की कोई बात सुनाई नहीं दे रही थी, ये देख कर अनिका को राहत मिली, अनिका कुनाल की बात को अवॉयड करते हुए वहां से साइड होकर टैक्सी को आवाज़ देने लगी, "टैक्सी, टैक्सी"

अनिका नहीं चाहती थी की कुनाल उसे पहचाने, लेकिन कुनाल भी हार मानने वालो मे से थोड़ी था।

कुनाल ने उसकी तरफ भाग कर फिर से उसका रास्ता रोक दिया, "अरे अरे, टैक्सी की क्या जरूरत है, मैं अपनी गाड़ी में आपको जहां चाहे छोड़ देता हूं न और एक मिनट, ये नन्ही गुड़िया कौन है?"

ये कहते हुए उसने रिया की तरफ इशारा किया, और उसके गाल पर हाथ फिराया, लेकिन रिया जब टैब पर गेम खेल रही होती है तब उसे कोई डिस्टर्ब करे वो उसे बिल्कुल अच्छा नहीं लगता इसलिए टैब से बिना ऊपर देखे, उसने अपना गाल झटक लिया। ऐसा करने में रिया के कान से हेडफ़ोन नीचे की तरफ स्लाइड होकर गिर के उसके कंधे पर आ गया था। लेकिन अभी भी उसका ध्यान वीडियो गेम खेलने में ही था।

अनिका टैक्सी ढूंढने में बिजी हो गयी लेकिन कुनाल पीछे-पीछे आकर उससे एक नहीं तो दूसरे तरीके से बात करने की कोशिश करता रहा,

कुनाल ने कहा, "ओह, समझ गया ये आपकी छोटी बहन है है ना?"

ये सुनकर रिया ज़ोर-ज़ोर से हंस पड़ी, तभी कुनाल को वापस गौतम का फ़ोन आया, कुनाल ने जैसे ही फ़ोन उठाया, गौतम ने पूछा, "क्या तुम्हें अनिका दिखी?"

कुनाल ने बड़ा ही तीखा जवाब देते हुए कहा, "ना दिखने के लिए आपकी बेटी कोई सुई तो है नहीं, जब वो गेट से बाहर आएगी तो सिर्फ वो ही दिखेगी उसके पीछे खड़े लोग भी दिखना बंद हो जाएंगे huhh" और वो रूडली फ़ोन काट देता है। कुनाल की बात सुन कर अनिका को अंदाज़ा आ गया था कि वो पक्का उसी के बारे में बात कर रहा था, अनिका को कुनाल पर बहुत ही ज़्यादा गुस्सा आ रहा था, लेकिन उसे बस अब जल्दी से टैक्सी चाहिए थी।

वो पूरे जोश और गुस्से के साथ जोर से चिल्लायी, "टैक्सी।"

ये सुनकर कुनाल और ज़्यादा इम्प्रेस हो गया और बड़े ही मीठे अंदाज में बोला, "सुनिए मिस मैं आपको छोड़ देता हूं ना, वैसे भी मैं जिसे लेने आया था लगता है वो आई ही नहीं। आप अगर बेंगलुरु की फ्लाइट में आई है तो आपने फ्लाइट में किसी बेहद मोटी औरत को देखा होगा।"

ये सुनकर अनिका एक पल को रुकी और उसने कुनाल की तरफ मूड कर देखा, कुनाल आगे कहता है, "दरअसल 6 साल पहले वो 120 किलो की थी, अब 6 साल में तो उसने पक्का डबल सेंचुरी पार कर ही ली होगी।"

अनिका बिना कुछ बोले कुनाल की बाते सुनकर सोच रही थी की ये पता नहीं क्या क्या सोच रहा है उसके बारे में।

अपनी बातो को सुनते हुए कुनाल अनिका तो देखता है तो वो उसे इम्प्रेस करने के चक्कर में और उसे हंसाने के लिए आगे कहता है, "वैसे मुझे लगता है की फ्लाइट वालों ने उसे बिठाने से मना कर दिया होगा, कहा होगा कि अगर तुम बैठोगी तो फ्लाइट कैसे उड़ेगी?" कहते हुए वो खुद भी हसता है और उम्मीद करता है की उसके जोक से अनिका को भी हंसी आएगी, लेकिन अनिका बड़े ही ठन्डे तरीके से उसको देखती रही।

अनिका को हँसता हुआ ना देख कर कुनाल ने भी अपनी हंसी रोकी और बोला "अजी छोड़िए मैं भी किसकी बातें लेकर बैठ गया, कहां आप और कहां वो?"

तभी एक टैक्सी अनिका के पास आकर रुक गई, दूसरी ओर, पीछे से कुनाल का ड्राइवर हाथ में अनिका गुलेरिया का बोर्ड लेकर दौड़ा चला आ रहा था, वो आकर कुनाल के बाजु में खड़ा हो गया, मानो वो कुनाल को कुछ बताने आया हो। अनिका ने जल्दी-जल्दी में रिया को टैक्सी में बिठाया और खुद जब टैक्सी में बैठने जा रही थी।

तब कुनाल ने थोड़ा मायूस होते हुए कहा, "वैसे आपको मनाली में किसी भी चीज की जरूरत हो तो सिर्फ एक ही नाम याद रखिएगा, कुनाल डोगरा। किसी से भी मेरा नाम पूछिएगा, मेरे घर तक छोड़ जाएगा आपको।"

टैक्सी वहाँ से निकलने ही वाली थी कि तभी कुनाल ने टैक्सी रोकी, और विंडो के पास झुककर बड़े ही flirty अंदाज़ में कहा, "अरे मिस, मिस, अपना नाम तो बताती जाओ।"

इसके सुनकर अनिका ने कुनाल को देखते हुए अपनी आँखों से काला चश्मा निकाला, और बड़े ही तेज और कटीली नजर से कुनाल को देखते हुए, बिना किसी भी हावभाव के धीरे से कहा, "अनिका गुलेरिया।"
`;

// --- PROMPT ENGINEERING FOR DRAMATIC STYLE ---

const HINDI_LANGUAGE_RULES = `
STEP 1 — HINDI LANGUAGE RULES  *** READ CAREFULLY ***
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
These rules apply to EVERY word written in the episode.
They override all default language behaviour.

[RULE 1 — USE EVERYDAY SPOKEN HINDI, NOT PURE/FORMAL HINDI]

  Write the way real people in India speak at home and on
  the street. Use the common, familiar version of every word.
  Do not use the heavy Sanskrit-based formal version.

  EXAMPLES OF WHAT TO USE vs. WHAT TO AVOID:
  - aankh (NOT netra)
  - khoon (NOT rakt)
  - dost (NOT mitra)
  - koshish (NOT prayaas)
  - mushkil (NOT katthin)
  - zaroorat (NOT aavashyakta)
  - shuru (NOT aarambh)
  - khatam (NOT samaapt)
  - gussa (NOT krodh)
  - khushi (NOT prasannta)
  - intezaar (NOT prateeksha)
  - bharosa (NOT vishwas)
  - sawaal (NOT prashna)
  - jawaab (NOT uttar)
  - raasta (NOT maarg)
  - sapna (NOT swapna)
  - dhokha (NOT chhal)
  - sach (NOT satya)
  - jhooth (NOT mithya)
  - aasman (NOT aakash)
  - hawa (NOT vayu)
  - aag (NOT agni)
  - paani (NOT jal)
  - dil (NOT hriday)
  - dimaag (NOT mastishk)
  - yaad (NOT smriti)
  - maut (NOT mrityu)
  - zindagi (NOT jeevan)
  - kismat (NOT bhagya)
  - taqat (NOT shakti)
  - kamzori (NOT durbalta)
  - hathiyar (NOT shastra)
  - ladai (NOT yuddh)
  - khatra (NOT sankat)
  - bachav (NOT raksha)
  - hamla (NOT aakraman)
  - jeet (NOT vijay)
  - haar (NOT parajay)

[RULE 2 — USE ENGLISH FOR MODERN/TECHNICAL/ACTION CONCEPTS]

  Do not translate modern concepts into Hindi. Use the English word
  written in Devanagari script.

  EXAMPLES:
  - Use 'कंट्रोल' (control), not 'नियंत्रण' (niyantran)
  - Use 'सिस्टम' (system), not 'प्रणाली' (pranali)
  - Use 'पावर' (power), not 'ऊर्जा' (oorja)
  - Use 'अटैक' (attack), not 'आक्रमण' (aakraman)
  - Use 'डिफेंस' (defense), not 'रक्षा' (raksha)
  - Use 'स्पीड' (speed), not 'गति' (gati)
  - Use 'टारगेट' (target), not 'लक्ष्य' (lakshya)
  - Use 'मिशन' (mission), not 'अभियान' (abhiyaan)
  - Use 'टीम' (team), not 'दल' (dal)
  - Use 'लीडर' (leader), not 'नेता' (neta)
  - Use 'प्लान' (plan), not 'योजना' (yojana)
  - Use 'प्रॉब्लम' (problem), not 'समस्या' (samasya)
  - Use 'सॉल्यूशन' (solution), not 'समाधान' (samadhan)
  - Use 'रिस्क' (risk), not 'जोखिम' (jokhim)
  - Use 'चांस' (chance), not 'अवसर' (avasar)
  - Use 'टाइम' (time), not 'समय' (samay)
  - Use 'जगह' (place), not 'स्थान' (sthaan)
  - Use 'हालत' (condition), not 'स्थिति' (sthiti)
  - Use 'नॉर्मल' (normal), not 'सामान्य' (samanya)
  - Use 'स्पेशल' (special), not 'विशेष' (vishesh)
  - Use 'इम्पॉर्टेंट' (important), not 'महत्वपूर्ण' (mahatvapoorna)
  - Use 'अर्जेंट' (urgent), not 'अति आवश्यक' (ati aavashyak)
  - Use 'डेंजरस' (dangerous), not 'खतरनाक' (khatarnak)
  - Use 'सेफ' (safe), not 'सुरक्षित' (surakshit)
  - Use 'रेडी' (ready), not 'तैयार' (taiyar)
  - Use 'स्टार्ट' (start), not 'शुरू' (shuru)
  - Use 'स्टॉप' (stop), not 'रुकना' (rukna)
  - Use 'चेक' (check), not 'जांच' (jaanch)
  - Use 'कन्फर्म' (confirm), not 'पुष्टि' (pushti)
  - Use 'कैंसिल' (cancel), not 'रद्द' (radd)
  - Use 'फोकस' (focus), not 'ध्यान' (dhyaan)
  - Use 'इग्नोर' (ignore), not 'अनदेखा' (andekha)
  - Use 'सपोर्ट' (support), not 'समर्थन' (samarthan)
  - Use 'हेल्प' (help), not 'मदद' (madad)
  - Use 'थैंक्स' (thanks), not 'धन्यवाद' (dhanyavad)
  - Use 'सॉरी' (sorry), not 'क्षमा' (kshama)
  - Use 'प्लीज़' (please), not 'कृपया' (kripya)
  - Use 'ओके' (okay), not 'ठीक है' (theek hai)
  - Use 'यस' (yes), not 'हाँ' (haan)
  - Use 'नो' (no), not 'नहीं' (nahi)

[RULE 3 — DIALOGUE MUST SOUND LIKE A BOLLYWOOD MOVIE]

  Characters should speak with emotion, attitude, and natural flow.
  Mix Hindi and English naturally (Hinglish).

  BAD DIALOGUE (Too formal):
  "मुझे यह जानकर अत्यंत प्रसन्नता हुई कि तुम सुरक्षित लौट आए।"

  GOOD DIALOGUE (Natural/Hinglish):
  "थैंक गॉड तुम सेफ वापस आ गए। मुझे बहुत टेंशन हो रही थी।"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

const FRAMEWORK_PROMPT = `
You are an expert showrunner and novelist, skilled in using the "season-style" framework to plot compelling, dramatic stories. Your task is to create a detailed Hindi novel blueprint suitable for 'Pocket Novel', structured like a TV season with arcs and episodes.

IMPORTANT LANGUAGE INSTRUCTIONS:
- **Narrative Language:** All high-level creative content like the novel's 'title', 'summary', and character 'name' and 'description' fields must be in everyday spoken Hindi (Hinglish vibe but in Devanagari script).
- **Terminology Rule (STRICT):** For specific Sci-Fi, Fantasy, Supernatural, Visual Effects, or Technical terms (e.g., screens, liquids, satellites, powers, ranks), use the **English term directly**.
    - **NEVER** use the format "Hindi Translation (English Term)". This is strictly forbidden.
    - **INCORRECT:** 'पारदर्शी स्क्रीन (Holographic Screen)', 'नीला द्रव (Blue Liquid)', 'उपग्रह (Satellite)', 'ब्रह्म-ऊर्जा (Cosmic Energy)'.
    - **CORRECT:** 'Holographic Screen', 'Blue Liquid', 'Satellite', 'Cosmic Energy', 'Glowing Circle'.
- **Episode Plan:** You MUST use a mixed-language format. The skeleton labels (e.g., "A-Story Goal:") must remain in English, and only the creative content following them should be in Hindi (adhering to the Terminology Rule above).
- **General Vocabulary:** Use everyday spoken Hindi, not pure/formal Hindi. Write the way real people in India speak at home and on the street. Use the common, familiar version of every word. Do not use the heavy Sanskrit-based formal version (e.g., use 'आँख' instead of 'नेत्र', 'खून' instead of 'रक्त', 'दोस्त' instead of 'मित्र').

${HINDI_LANGUAGE_RULES}

IMPORTANT CONTINUITY INSTRUCTION:
- **Seamless Flow:** The "Opening Image" of Episode (N) must naturally and immediately follow the "Cliff-hanger" of Episode (N-1). Avoid disconnected time jumps between episodes unless the plot explicitly demands a "Time Skip".

You MUST follow this specific framework:

--- FRAMEWORK START ---
A flexible “season-style” framework that lets you plot a novel the way TV writers break a season into arcs and episodes.

1. High-Level Anatomy
Layer | Purpose | Typical Count | Word-Count Guide*
Volume / “Season” | The whole book | 1 | 70–120 k
Arc | Major movement of change (mini-stories) | 3–5 | 15–30 k each
Episode | Discrete, punchy chapter-equivalent | Flexible (User Specified) | Strictly 3500 - 4000 words each
*Tweak to suit your genre/pace.

2. Arc Breakdown (Example)
Arc | Focus | Structural Beats Covered
Arc I – Catalyst | Inciting incident, set-up, promise of the premise | Ordinary World → Call to Adventure → Crossing 1st Threshold
Arc II – Ascent | Rising stakes, first victories, midpoint twist | Tests & Allies → Midpoint Reversal
Arc III – Descent | Losses, “Dark Night,” false defeat | Bad Guys Close In → All Is Lost → Dark Night
Arc IV – Finale | Climax, resolution, denouement, final image | Break into 3rd Act → Climax → Resolution
Swap, merge, or expand arcs as needed to fit the total episode count perfectly.

3. Episode Skeleton (Plug-and-Play)
You must fill out this skeleton for EACH episode in your plan. The labels must be in English, and the content for them in Hindi.

Episode <#>: <Working Title in Hindi>
Characters In This Episode: Names{[Character A], [Character B], [Character C] etc.}
A-Story Goal: <Content in Hindi>
B-Story (character/relationship) Beat: <Content in Hindi>
Setting(s): <Content in Hindi>
Opening Image / Hook: <Content in Hindi (Must flow from prev episode)>
Key Conflict/Complication: <Content in Hindi>
Turning Point / Reversal: <Content in Hindi>
Cliff-hanger / Tag: <Content in Hindi>
Foreshadow / Thematic Plant: <Content in Hindi>
Word Count Target: Strictly 3500 - 4000 words

--- FRAMEWORK END ---
`;

const getCharacterCountRange = (episodeCount: number): string => {
  if (episodeCount <= 25) {
    return "5 to 10";
  } else if (episodeCount <= 50) {
    return "10 to 15";
  } else {
    return "15 to 20";
  }
};

export const sendChatMessage = async (
  model: AIModel,
  history: ChatMessage[],
  message: string,
  signal?: AbortSignal,
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const abortHandler = () => reject(new Error("AbortError"));
    if (signal) {
      if (signal.aborted) return reject(new Error("AbortError"));
      signal.addEventListener("abort", abortHandler);
    }

    try {
      const contents = history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));

      contents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
          systemInstruction:
            "You are an expert novelist and story planner. Help the user brainstorm, plan, and outline their novel. You can discuss characters, plot, setting, and arcs. Keep your responses helpful, creative, and concise. You can communicate in Hinglish or English as per user's preference.",
        },
      });

      if (signal?.aborted) return reject(new Error("AbortError"));
      resolve(response.text || "");
    } catch (error) {
      if (signal?.aborted) return reject(new Error("AbortError"));
      reject(error);
    } finally {
      if (signal) signal.removeEventListener("abort", abortHandler);
    }
  });
};

// ─── Helper: format cliffhanger rotation history for prompts ───
const formatLastCliffhangerTypes = (types: string[]): string => {
  if (!types || types.length === 0) return "None yet — this is the first episode.";
  return types
    .map((t, i) => `Episode -${types.length - i}: ${t}`)
    .join("\n");
};

export const generateNovelBlueprint = async (
  model: AIModel,
  style: string,
  userPrompt: string,
  fileContext: string,
  episodeCount: number,
  signal?: AbortSignal,
  onProgress?: (msg: string) => void,
): Promise<NovelBlueprint> => {
  const characterCountRange = getCharacterCountRange(episodeCount);
  const fileContextPrompt = fileContext
    ? `The user has also provided the following context from uploaded files:\n\n---\n${fileContext}\n---\n\n`
    : "";

  return new Promise(async (resolve, reject) => {
    const abortHandler = () => reject(new Error("AbortError"));
    if (signal) {
      if (signal.aborted) return reject(new Error("AbortError"));
      signal.addEventListener("abort", abortHandler);
    }

    try {
      // ── Step 1: ARCHITECT — initial blueprint drafting ──
      if (onProgress) onProgress("ARCHITECT - Initial blueprint drafting (deep reasoning)...");
      const architectPrompt = `
        You are the ARCHITECT. Your task is initial blueprint drafting (deep reasoning).
        Generate a detailed novel blueprint covering Title, Summary, Characters list (with descriptions), and an Episode Plan containing exactly ${episodeCount} episodes divided into logical arcs.

        ${COPYRIGHT_ORIGINALITY_RULES}
        ${WRITING_STYLE_AND_ORIGINALITY_DIRECTIVE}

        Novel Style: "${style}"
        Total Episodes: ${episodeCount}
        Main Idea/Prompt: "${userPrompt || "No prompt provided. Be creative."}"
        ${fileContextPrompt}

        CRITICAL: All content must be 100% original. Do not copy or closely imitate any existing published work.
        Outputs must be raw text/markdown. Focus on deep psychological stakes, strong arcs, and a compelling storyline.
      `;
      const architectRes = await ai.models.generateContent({ model, contents: architectPrompt });
      if (signal?.aborted) return reject(new Error("AbortError"));
      const draft = architectRes.text || "";

      // ── Step 2: STORY CRITIC — plot-hole detection ──
      if (onProgress) onProgress("STORY CRITIC - Blueprint review, plot hole detection...");
      const criticPrompt = `
        You are the STORY CRITIC. Your task is blueprint review and plot hole detection.
        Review this blueprint draft:
        ---
        ${draft}
        ---
        Identify any pacing issues, weak character arcs, continuity errors, and areas lacking emotional depth. Point out if the episode count is not exactly ${episodeCount}.
        Also flag: does any plot element too closely resemble a known published work? If so, demand it be made more original.
        Provide actionable feedback.
      `;
      const criticRes = await ai.models.generateContent({ model, contents: criticPrompt });
      if (signal?.aborted) return reject(new Error("AbortError"));
      const critique = criticRes.text || "";

      // ── Step 3: BLUEPRINT REFINER — structured finalization ──
      if (onProgress) onProgress("BLUEPRINT REFINER - Structured blueprint finalization...");
      const refinerPrompt = `
        You are the BLUEPRINT REFINER. Your task is structured blueprint finalization.
        Here is the original draft:
        ---
        ${draft}
        ---
        Here is the Story Critic's feedback:
        ---
        ${critique}
        ---
        Apply the feedback to refine the blueprint perfectly.
        Requirements:
        1. ${episodeCount} total episodes.
        2. ${characterCountRange} characters total.
        3. Clear arcs and episode skeletons.
        4. Integrate well with the provided "season-style" framework.

        --- FRAMEWORK FOR REFERENCE ---
        ${FRAMEWORK_PROMPT}
        ---

        ${COPYRIGHT_ORIGINALITY_RULES}
        ${WRITING_STYLE_AND_ORIGINALITY_DIRECTIVE}

        Output MUST be pure markdown outlining the full refined story. Keep descriptions tight.
      `;
      const refinerRes = await ai.models.generateContent({ model, contents: refinerPrompt });
      if (signal?.aborted) return reject(new Error("AbortError"));
      const refinedDraft = refinerRes.text || "";

      // ── NEW Step 4: TWIST ARCHITECT — season-level twist/surprise map ──
      if (onProgress) onProgress("TWIST ARCHITECT - Designing season twist map & foreshadowing schedule...");
      const twistArchitectPrompt = `
        You are the TWIST ARCHITECT. Your ONLY job is to design a complete season-level
        Twist & Foreshadowing Map for this ${episodeCount}-episode novel.

        The refined blueprint is:
        ---
        ${refinedDraft}
        ---

        Your output MUST be a detailed Twist Map in plain text with this structure for EVERY MAJOR twist:

        TWIST #N
        Episode: [episode number where the twist detonates]
        Type: [one of: IDENTITY_FLIP | BETRAYAL_UNVEIL | FALSE_DEATH | HIDDEN_AGENDA | POWER_REVERSAL | TIME_BOMB_REVEAL | MIRROR_TWIST | FALSE_VICTORY | RED_HERRING_PAYOFF]
        Weight: [MAJOR or MINOR]
        Setup Begins At: [episode number where foreshadowing starts]
        Foreshadowing Seed: [exact detail to plant — object/dialogue/behaviour/absence seed]
        Payoff Description: [what happens in the detonation scene]

        RULES:
        1. Every arc must have at least 1 MAJOR twist and 2 MINOR twists.
        2. No two consecutive episodes may use the same twist type.
        3. The final episode of every arc must have a MAJOR twist.
        4. Every MAJOR twist must have a foreshadowing seed that appears at least 3 episodes earlier.
        5. Include at least 2 RED_HERRING_PAYOFF entries across the full season.
        6. MICRO_SURPRISE entries are required for every episode not covered by a MAJOR/MINOR twist.
        7. ALL twists must be 100% original — do not borrow from known stories.

        ${TWIST_ENGINEERING_RULES}

        Output ONLY the Twist Map. No other commentary.
      `;
      const twistArchitectRes = await ai.models.generateContent({ model, contents: twistArchitectPrompt });
      if (signal?.aborted) return reject(new Error("AbortError"));
      const twistMap = twistArchitectRes.text || "";

      // ── Step 5 (was Step 4): FINAL REVIEWER — JSON conversion with twist_map ──
      if (onProgress) onProgress("FINAL REVIEWER - Quality gate: converting to structured JSON with twist map...");
      const reviewerPrompt = `
        You are the FINAL REVIEWER. Your task is the quality gate.
        Convert the refined blueprint AND the twist map into the EXACT JSON format required.
        Ensure no text outside the JSON.

        Refined Draft:
        ---
        ${refinedDraft}
        ---

        Twist Map (from TWIST ARCHITECT):
        ---
        ${twistMap}
        ---

        STRICT REQUIREMENT: The final 'plan' must contain episodes summing to exactly ${episodeCount}.
        Episodes must break down into A-Story, B-Story, Hook, Conflict, Reversal, Cliff-hanger in Hindi.
        The 'twist_map' array must contain ALL entries from the Twist Map above, fully structured.
      `;

      const response = await ai.models.generateContent({
        model: model,
        contents: reviewerPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              style: { type: Type.STRING },
              characters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ["name", "description"],
                },
              },
              plan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    arc: { type: Type.STRING },
                    episodes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["arc", "episodes"],
                },
              },
              twist_map: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    episode_number: { type: Type.NUMBER },
                    twist_type: { type: Type.STRING },
                    weight: { type: Type.STRING },
                    setup_begins_at_episode: { type: Type.NUMBER },
                    foreshadowing_seed: { type: Type.STRING },
                    payoff_description: { type: Type.STRING },
                  },
                  required: ["episode_number", "twist_type", "weight", "setup_begins_at_episode", "foreshadowing_seed", "payoff_description"],
                },
              },
            },
            required: ["title", "summary", "style", "characters", "plan", "twist_map"],
          },
        },
      });

      if (signal?.aborted) return reject(new Error("AbortError"));
      const jsonText = response.text ? response.text.trim() : "";
      resolve(JSON.parse(jsonText) as NovelBlueprint);
    } catch (error) {
      if (signal?.aborted) return reject(new Error("AbortError"));
      console.error("Error generating novel blueprint (Pipeline):", error);
      reject(new Error("Failed to generate novel blueprint from AI."));
    } finally {
      if (signal) signal.removeEventListener("abort", abortHandler);
    }
  });
};
export const regenerateNovelBlueprint = async (
  model: AIModel,
  existingBlueprint: NovelBlueprint,
  revisionPrompt: string,
  episodeCount: number,
  signal?: AbortSignal,
  onProgress?: (msg: string) => void,
): Promise<NovelBlueprint> => {
  const characterCountRange = getCharacterCountRange(episodeCount);

  const prompt = `
    You are an expert showrunner and novelist, skilled in using the "season-style" framework to revise and improve stories. A user wants to revise a novel blueprint you created.

    You MUST adhere to this specific framework for the new blueprint:
    ${FRAMEWORK_PROMPT}

    **Existing Novel Blueprint (to be revised):**
    ---
    ${JSON.stringify(existingBlueprint, null, 2)}
    ---

    **User's Revision Instructions:**
    "${revisionPrompt}"
    
    **Total Episode Count for the Novel:** ${episodeCount}

    **Your Task:**
    1.  Analyze the user's instructions and apply them to enhance the dramatic impact.
    2.  Generate a **completely new** novel blueprint that incorporates the user's feedback, focusing on high stakes and emotional depth.
    3.  Ensure the revised blueprint is coherent and strictly follows the "season-style" framework, with detailed episode skeletons for all ${episodeCount} episodes.
    4.  **Crucially, for the character profiles:** Create detailed profiles for the main and key supporting characters. For a ${episodeCount}-episode novel, you MUST generate a list of ${characterCountRange} characters to make the world feel alive. This cast MUST include a primary villain, their key associates, and other antagonists.
        - First, describe the main lead (hero/heroine) in detail.
        - For every other character, you MUST clearly describe their personal information, their specific relationship with the main lead, and a description of any significant business or property they own. Also include their motivations, flaws, and inner conflicts.
    5.  Develop the episode plan:
        - **STRICT REQUIREMENT:** You MUST generate a detailed entry for EVERY SINGLE EPISODE from Episode 1 to Episode ${episodeCount}.
        - Do NOT summarize multiple episodes into one entry.
        - The JSON array for 'episodes' across all arcs must sum up to exactly ${episodeCount} items.
        - **STRICT CONTINUITY:** Ensure the 'Opening Image' of each episode directly links to and continues from the 'Cliff-hanger' of the previous episode.
    6. For **EACH** episode within each arc, you must provide a detailed breakdown using the "Episode Skeleton". This includes identifying and listing the characters who appear in that specific episode in the "Characters In This Episode" field.
    7. **TWIST MAP (MANDATORY):** You MUST generate a complete season-level twist_map. Apply the TWIST_ENGINEERING_RULES:
        - Every arc must have at least 1 MAJOR twist and 2 MINOR twists.
        - No two consecutive episodes may use the same twist type.
        - The final episode of every arc must have a MAJOR twist.
        - Every MAJOR twist must have a foreshadowing seed appearing at least 3 episodes earlier.
        - Include at least 2 RED_HERRING_PAYOFF entries.
        - MICRO_SURPRISE entries required for all other episodes.
        Apply the 8 twist archetypes: IDENTITY_FLIP | BETRAYAL_UNVEIL | FALSE_DEATH | HIDDEN_AGENDA | POWER_REVERSAL | TIME_BOMB_REVEAL | MIRROR_TWIST | FALSE_VICTORY | RED_HERRING_PAYOFF.

    ${TWIST_ENGINEERING_RULES}
    ${COPYRIGHT_ORIGINALITY_RULES}
        ${WRITING_STYLE_AND_ORIGINALITY_DIRECTIVE}

    The entire response must be a single JSON object. Do not include any text outside the JSON object. Pay close attention to the LANGUAGE INSTRUCTIONS in the framework.
  `;

  return new Promise(async (resolve, reject) => {
    const abortHandler = () => reject(new Error("AbortError"));
    if (signal) {
      if (signal.aborted) return reject(new Error("AbortError"));
      signal.addEventListener("abort", abortHandler);
    }

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              style: { type: Type.STRING },
              characters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ["name", "description"],
                },
              },
              plan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    arc: { type: Type.STRING },
                    episodes: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ["arc", "episodes"],
                },
              },
                            twist_map: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    episode_number: { type: Type.NUMBER },
                    twist_type: { type: Type.STRING },
                    weight: { type: Type.STRING },
                    setup_begins_at_episode: { type: Type.NUMBER },
                    foreshadowing_seed: { type: Type.STRING },
                    payoff_description: { type: Type.STRING },
                  },
                  required: ["episode_number", "twist_type", "weight", "setup_begins_at_episode", "foreshadowing_seed", "payoff_description"],
                },
              },
            },
            required: ["title", "summary", "style", "characters", "plan", "twist_map"],
          },
        },
      });

      if (signal?.aborted) return reject(new Error("AbortError"));
      const jsonText = (response.text || "").trim();
      resolve(JSON.parse(jsonText) as NovelBlueprint);
    } catch (error) {
      if (signal?.aborted) return reject(new Error("AbortError"));
      console.error("Error regenerating novel blueprint:", error);
      reject(new Error("Failed to regenerate novel blueprint from AI."));
    } finally {
      if (signal) signal.removeEventListener("abort", abortHandler);
    }
  });
};

export const upgradeNovelBlueprint = async (
  model: AIModel,
  existingBlueprint: NovelBlueprint,
  chaptersContent: string,
  signal?: AbortSignal,
  onProgress?: (msg: string) => void,
): Promise<NovelBlueprint> => {
  const prompt = `
    You are an expert story continuity editor and showrunner. Your task is to upgrade an existing novel blueprint based on the content of chapters that have already been written, without losing any existing plot details.

    **Existing Novel Blueprint:**
    ---
    ${JSON.stringify(existingBlueprint, null, 2)}
    ---

    **Content of Written Chapters:**
    ---
    ${chaptersContent}
    ---

    **Your Task:**
    1.  First, carefully read through the provided "Content of Written Chapters" and identify every single character mentioned by name.
    2.  Compare this list of characters with the character list in the "Existing Novel Blueprint".
    3.  Create a new, comprehensive character list in the 'characters' field. 
        - If a character from the written chapters is missing from the blueprint, add them with a brief description inferred from the text.
        - If a character is already in the blueprint, keep their existing description.
    4.  Next, go through the *entire* episode plan from the original blueprint (all arcs and episodes).
    5.  For **EACH** episode, re-evaluate and update the "Characters In This Episode" field. Ensure it accurately lists the names of characters who appear or are significantly mentioned, based on the episode's A-Story, B-Story, and other details. Use the new comprehensive character list you created as a reference.
    6.  **CRITICAL:** Do NOT change the novel's 'title', 'summary', 'style', or any of the creative content within the episode skeletons (like A-Story Goal, B-Story Beat, Conflict, etc.). Your only job is to expand the main 'characters' list and update the "Characters In This Episode" line within each episode's plan.
    7.  Return the complete, upgraded novel blueprint as a single JSON object, following the exact same structure and language rules as the original. Pay close attention to the LANGUAGE INSTRUCTIONS in the framework provided below.

    --- FRAMEWORK FOR REFERENCE ---
    ${FRAMEWORK_PROMPT}
    ---

    The entire response must be a single JSON object.
  `;

  return new Promise(async (resolve, reject) => {
    const abortHandler = () => reject(new Error("AbortError"));
    if (signal) {
      if (signal.aborted) return reject(new Error("AbortError"));
      signal.addEventListener("abort", abortHandler);
    }

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              style: { type: Type.STRING },
              characters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ["name", "description"],
                },
              },
              plan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    arc: { type: Type.STRING },
                    episodes: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ["arc", "episodes"],
                },
              },
                            twist_map: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    episode_number: { type: Type.NUMBER },
                    twist_type: { type: Type.STRING },
                    weight: { type: Type.STRING },
                    setup_begins_at_episode: { type: Type.NUMBER },
                    foreshadowing_seed: { type: Type.STRING },
                    payoff_description: { type: Type.STRING },
                  },
                  required: ["episode_number", "twist_type", "weight", "setup_begins_at_episode", "foreshadowing_seed", "payoff_description"],
                },
              },
            },
            required: ["title", "summary", "style", "characters", "plan", "twist_map"],
          },
        },
      });

      if (signal?.aborted) return reject(new Error("AbortError"));
      const jsonText = (response.text || "").trim();
      resolve(JSON.parse(jsonText) as NovelBlueprint);
    } catch (error) {
      if (signal?.aborted) return reject(new Error("AbortError"));
      console.error("Error upgrading novel blueprint:", error);
      reject(new Error("Failed to upgrade novel blueprint from AI."));
    } finally {
      if (signal) signal.removeEventListener("abort", abortHandler);
    }
  });
};

export const upgradeBlueprintFromText = async (
  model: AIModel,
  blueprintText: string,
  chaptersContent: string,
  userPrompt: string,
  targetEpisodeCount: number,
  signal?: AbortSignal,
  onProgress?: (msg: string) => void,
): Promise<NovelBlueprint> => {
  const characterCountRange = getCharacterCountRange(targetEpisodeCount);

  const userPromptSection = userPrompt
    ? `**User's Instructions for Upgrade:**
---
${userPrompt}
---
Incorporate these instructions while performing your task. For example, if the user asks to add a new character or change a plot point, you should reflect that in the upgraded blueprint.`
    : "";

  const prompt = `
    You are an expert story continuity editor and showrunner. Your task is to upgrade and potentially EXTEND a novel blueprint based on the provided text, written chapters, and user instructions.

    **Existing Novel Blueprint (from user-provided text):**
    ---
    ${blueprintText}
    ---

    **Content of Written Chapters:**
    ---
    ${chaptersContent}
    ---
    
    **Target Total Episodes:** ${targetEpisodeCount}

    ${userPromptSection}

    **Your Task:**
    1.  **Parse and Extend:** Analyze the existing blueprint.
        - If the existing blueprint has fewer episodes than the **Target Total Episodes (${targetEpisodeCount})**, you MUST generate NEW detailed episode skeletons to reach the target count.
        - You must write these new episodes to naturally continue the story from where the original blueprint left off, maintaining the plot arcs and character development.
        - If the existing blueprint meets or exceeds the target, simply refine and update it based on the other instructions.
    2.  **Character Synchronization:**
        - Identify every single character mentioned in the written chapters and blueprint.
        - Create a comprehensive 'characters' list. For a ${targetEpisodeCount}-episode novel, ensure you have sufficient characters (Target range: ${characterCountRange}). If the list is too short, invent new minor characters or antagonists to populate the extended episodes.
        - Update descriptions based on the written chapters.
    3.  **Episode Plan Update:**
        - For ALL episodes (existing and newly generated), ensure the "Episode Skeleton" is fully detailed.
        - Update the "Characters In This Episode" field for every episode to accurately reflect who appears.
        - **STRICT REQUIREMENT:** The final 'plan' must contain episodes summing up to exactly ${targetEpisodeCount}.
    4.  **Continuity:** Ensure the 'Opening Image' of each episode (especially the new ones) directly links to the 'Cliff-hanger' of the previous one.
    5.  Return the complete, upgraded novel blueprint as a single JSON object. Pay close attention to the LANGUAGE INSTRUCTIONS in the framework provided below.

    --- FRAMEWORK FOR REFERENCE ---
    ${FRAMEWORK_PROMPT}
    ---

    The entire response must be a single JSON object.
  `;

  return new Promise(async (resolve, reject) => {
    const abortHandler = () => reject(new Error("AbortError"));
    if (signal) {
      if (signal.aborted) return reject(new Error("AbortError"));
      signal.addEventListener("abort", abortHandler);
    }

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              style: { type: Type.STRING },
              characters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ["name", "description"],
                },
              },
              plan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    arc: { type: Type.STRING },
                    episodes: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ["arc", "episodes"],
                },
              },
                            twist_map: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    episode_number: { type: Type.NUMBER },
                    twist_type: { type: Type.STRING },
                    weight: { type: Type.STRING },
                    setup_begins_at_episode: { type: Type.NUMBER },
                    foreshadowing_seed: { type: Type.STRING },
                    payoff_description: { type: Type.STRING },
                  },
                  required: ["episode_number", "twist_type", "weight", "setup_begins_at_episode", "foreshadowing_seed", "payoff_description"],
                },
              },
            },
            required: ["title", "summary", "style", "characters", "plan", "twist_map"],
          },
        },
      });

      if (signal?.aborted) return reject(new Error("AbortError"));
      const jsonText = (response.text || "").trim();
      resolve(JSON.parse(jsonText) as NovelBlueprint);
    } catch (error) {
      if (signal?.aborted) return reject(new Error("AbortError"));
      console.error("Error upgrading novel blueprint from text:", error);
      reject(new Error("Failed to upgrade novel blueprint from AI."));
    } finally {
      if (signal) signal.removeEventListener("abort", abortHandler);
    }
  });
};

export const generateChapter = async (
  model: AIModel,
  fileContext: string,
  existingChapters: Chapter[],
  userPrompt: string,
  useSeamlessContinuity: boolean = true,
  nextChapterNumber?: number,
  signal?: AbortSignal,
  onProgress?: (msg: string) => void,
  lastCliffhangerTypes: string[] = [],
): Promise<{ title: string; content: string; cliffhangerType: CliffhangerType }> => {

  let chapterNum = nextChapterNumber;
  if (!chapterNum) {
    if (existingChapters.length > 0) {
      chapterNum = existingChapters[existingChapters.length - 1].id + 1;
    } else {
      chapterNum = 1;
    }
  }

  const lastChapter = existingChapters.length > 0
    ? existingChapters[existingChapters.length - 1]
    : null;
  const previousEnding = lastChapter ? lastChapter.content.slice(-1200) : null;

  const cliffhangerHistoryPrompt = `
**CLIFFHANGER ROTATION HISTORY — You MUST choose a DIFFERENT type:**
${formatLastCliffhangerTypes(lastCliffhangerTypes)}

${CLIFFHANGER_ROTATION_RULES}
  `;

  const twistContextPrompt = `
**TWIST MAP CONTEXT:**
Check the Novel Blueprint's twist_map. Find the entry for Episode ${chapterNum}.
If this episode has a MAJOR twist, you MUST execute the payoff_description exactly.
If this episode has a MINOR twist, execute the micro-surprise.
If this episode is a setup episode, plant the foreshadowing_seed described.
${TWIST_ENGINEERING_RULES}
${FORESHADOWING_PAYOFF_ENGINE}
  `;

  let continuityPrompt = "";

  if (previousEnding) {
    if (useSeamlessContinuity) {
      continuityPrompt = `
      **CRITICAL CONTINUITY CONTEXT (Previous Chapter Ending):**
       "...${previousEnding}"
       
       **STRICT SEAMLESS CONTINUITY INSTRUCTION (MANDATORY):** 
       1. **Immediate Continuation:** Start this new chapter (Episode ${chapterNum}) EXACTLY from the final moment where the previous chapter left off.
       2. **NO REPETITION OR RESET:** DO NOT repeat the events, descriptions, or dialogue provided in the previous ending. DO NOT reset the scene. Move the story forward immediately from the very next second.
       3. **NO SUMMARY:** Do NOT summarize what happened in previous episodes or provide exposition about how we got here. The reader already knows.
      `;
    } else {
      continuityPrompt = `
      **Continuity Context (Previous Chapter Ending):**
       "...${previousEnding}"
       
       **STRICT CONTINUITY INSTRUCTION (MANDATORY):** 
       Start this new chapter (Episode ${chapterNum}) EXACTLY from the ending moment of the previous episode shown above. DO NOT restart the scene, do not repeat the previous events, and do not write a summary. Write the very next action or dialogue that follows that ending.
      `;
    }
  } else if (chapterNum > 1) {
    continuityPrompt = `**Continuity Instruction:** This is Episode ${chapterNum}. Use the provided story context to continue the story naturally EXACTLY from the end of the previous episode. Do NOT repeat or restart the plot.`;
  } else {
    continuityPrompt = `**Start of Novel:** This is the first chapter. Start with a strong opening scene.`;
  }

  const existingChaptersContext = existingChapters.length > 0
    ? `\n\n**हाल ही में लिखे गए एपिसोड्स (RECENTLY WRITTEN EPISODES):**\n` +
      existingChapters
        .map((c) => `Episode ${c.id}: ${c.title}\n${c.content}`)
        .join("\n\n---\n\n")
    : "";

  const contextPrompt = `
    **कहानी का ब्लूप्रिंट और पिछला संदर्भ (STRICT NOVEL BLUEPRINT & PREVIOUS EPISODES):**
    ---
    ${fileContext}
    ---
    ${existingChaptersContext}

    ${continuityPrompt}
  `;

  const instructionPrompt = userPrompt
    ? `**अतिरिक्त निर्देश (Additional User Instructions):** "${userPrompt}"`
    : "";

  return new Promise(async (resolve, reject) => {
    const abortHandler = () => reject(new Error("AbortError"));
    if (signal) {
      if (signal.aborted) return reject(new Error("AbortError"));
      signal.addEventListener("abort", abortHandler);
    }

    try {
      // ── Step 1: PLANNER ──
      if (onProgress) onProgress("PLANNER - Extracting episode requirements from blueprint...");
      const plannerPrompt = `
        You are the PLANNER. Your ONLY task is to carefully read the entire provided Novel Blueprint and context, and extract EXACTLY what needs to happen in Episode ${chapterNum}.
        
        **Context to Read:**
        ---
        ${contextPrompt}
        ---

        Output a detailed outline for Episode ${chapterNum} ONLY based on the blueprint.
        - DO NOT draft the episode yet.
        - DO explicitly list the A-Story Goal, Conflict, Reversal, and Cliff-hanger that the blueprint dictates for Episode ${chapterNum}.
        - ALSO extract the Twist Map entry for Episode ${chapterNum} (if any).
        - List the Foreshadowing Seed this episode must plant (from twist_map).
        - Ensure you thoroughly read the blueprint and previous episodes to maintain perfect logical alignment.
      `;
      const plannerRes = await ai.models.generateContent({ model, contents: plannerPrompt });
      if (signal?.aborted) return reject(new Error("AbortError"));
      const extractedPlan = plannerRes.text || "";

      // ── Step 2: CHAPTER WRITER — first prose draft ──
      if (onProgress) onProgress("CHAPTER WRITER - Initial prose generation...");
      const writerPrompt = `
        You are the CHAPTER WRITER. Your task is to write the first draft of **Episode ${chapterNum}**.
        
        **Blueprint Extraction for this Episode:**
        ---
        ${extractedPlan}
        ---

        ${contextPrompt}
        ${instructionPrompt}

        **Instructions:**
        1. STRONGLY RECOMMENDED: READ ALL provided previous episodes CAREFULLY before writing.
        2. Follow the extracted blueprint plan for Episode ${chapterNum} strictly.
        3. MANDATORY TWIST EXECUTION: If the blueprint's twist_map has an entry for this episode,
           execute it EXACTLY as described. Do not soften it or delay it to the next episode.
        4. MANDATORY FORESHADOWING SEED: Plant the foreshadowing_seed assigned to this episode
           naturally into the prose. It must read as innocent detail, not as a planted clue.
        5. CRITICAL: Strictly adhere to the 85-90% dialogue rule.
        6. CRITICAL ORIGINALITY: Write 100% original content from the blueprint. Never copy any published work.

        ${twistContextPrompt}
        ${cliffhangerHistoryPrompt}
        ${EPISODE_LENGTH_RULES}
        ${HINDI_LANGUAGE_RULES}
        ${COPYRIGHT_ORIGINALITY_RULES}
        ${WRITING_STYLE_AND_ORIGINALITY_DIRECTIVE}
        
        **EPISODE STRUCTURE REFERENCE (Hinglish Vibe):**
        ${DEMO_EPISODE_TEXT}
        **DEEP ROMANTIC/INTIMATE SCENES REFERENCE (Style Guide):**
        ${ROMANTIC_DEMO_TEXT}
        ${IMMERSION_AND_WORLD_RULES}
        ${PROSE_AND_DIALOGUE_RULES}
        ${EPISODE_STRUCTURE_RULES}
        ${SUSPENSE_AND_PACING_RULES}
        ${CHARACTER_PSYCHOLOGY_ENGINE}
        ${SCENE_VELOCITY_ENGINE}
        ${DIALOGUE_SUBTEXT_ENGINE}
        ${EMOTIONAL_LAYERING_ENGINE}
        ${PROSE_RHYTHM_ENGINE}
        ${TTS_AUDIO_FIRST_RULES}
        ${VILLAIN_ARCHITECTURE_ENGINE}
        ${READER_ADDICTION_ARCHITECTURE}
        ${HUMAN_EMOTION_ENGINE}
        ${ROMANTIC_TENSION_ARCHITECTURE}
        ${SCENE_TEMPERATURE_ENGINE}
        ${SECONDARY_CHARACTER_ARC_ENGINE}
        ${RECURRING_MOTIF_SYMBOL_ENGINE}
        ${COMEDY_LEVITY_ENGINE}
        ${RULE_COMPLIANCE_ENFORCEMENT}

        Output the draft chapter in plain text/markdown.
      `;
      const writerRes = await ai.models.generateContent({ model, contents: writerPrompt });
      if (signal?.aborted) return reject(new Error("AbortError"));
      const draft = writerRes.text || "";

      // ── NEW Step 3: TWIST INJECTOR ──
      if (onProgress) onProgress("TWIST INJECTOR - Scoring surprise factor & injecting/reinforcing twist...");
      const twistInjectorPrompt = `
        You are the TWIST INJECTOR. Your ONLY job is to evaluate and enhance the surprise/twist
        quality of this episode draft. All content must remain 100% original.

        **Episode ${chapterNum} Draft:**
        ---
        ${draft}
        ---

        **Planned Twist from Blueprint:**
        ---
        ${extractedPlan}
        ---

        **EVALUATION TASKS:**

        TASK 1 — PREDICTABILITY SCORE
        Apply the 5-Second Test: Can an attentive reader predict the key revelation/turning point
        5 seconds before it lands? Score 1-10 (10 = completely unpredictable).
        
        If score < 7:
          → You MUST rewrite the final 20% of the draft to subvert the expected outcome.
          → Move the detonation beat ONE narrative beat later than where the reader expects it.
          → Add one micro-surprise before the midpoint that was NOT in the draft.

        TASK 2 — REFRAME TEST
        After the twist/turning point, does the story feel like a DIFFERENT story than before?
        If NO: escalate it:
          → Change who delivers the revelation
          → Change the physical context of the reveal
          → Add one physical object that becomes suddenly significant

        TASK 3 — FORESHADOWING SEED CHECK
        Confirm the foreshadowing_seed from the blueprint has been planted in the first half.
        If missing: inject it naturally into the first half (a throwaway detail,
        a piece of dialogue, a character behaviour).

        TASK 4 — MICRO-SURPRISE CHECK
        Is there at least one MICRO-SURPRISE (A/B/C/D from TWIST_ENGINEERING_RULES)?
        If missing: inject one before the midpoint.

        TASK 5 — ORIGINALITY CHECK
        Does any passage too closely resemble a scene from a published novel or serial?
        If YES: rewrite that passage with entirely different specifics.

        ${TWIST_ENGINEERING_RULES}
        ${COPYRIGHT_ORIGINALITY_RULES}
        ${WRITING_STYLE_AND_ORIGINALITY_DIRECTIVE}

        Output: the enhanced draft with all improvements applied.
        Use plain text/markdown. Do NOT summarise your changes — just output the improved draft.
      `;
      const twistInjectorRes = await ai.models.generateContent({ model, contents: twistInjectorPrompt });
      if (signal?.aborted) return reject(new Error("AbortError"));
      const twistEnhancedDraft = twistInjectorRes.text || "";

      // ── Step 4 (was Step 3): CONTINUITY GUARD ──
      if (onProgress) onProgress("CONTINUITY GUARD - Cross-chapter consistency & logic checks...");
      const guardPrompt = `
        You are the CONTINUITY GUARD. 
        Review this draft of Episode ${chapterNum}:
        ---
        ${twistEnhancedDraft}
        ---
        Here is the Blueprint and Context:
        ---
        ${contextPrompt}
        ---
        Check for:
        1. Does it strictly follow the A-Story, B-Story, and Cliff-hanger for Episode ${chapterNum}?
        2. Are there any logic holes or continuity errors with previous episodes?
        3. CRITICAL MANDATE 0 (IMMEDIATE CONTINUATION_RULE): Does the draft start EXACTLY from the ending moment of the previous episode?
        4. CRITICAL: Does the text meet the 85-90% dialogue ratio rule?
        5. CRITICAL: Are there any parenthesis ( ) used for actions?
        6. CRITICAL: Scan for banned AI clichés.
        7. CRITICAL: Check the word count — must be 3500–4000 words.
        8. CRITICAL: Evaluate for SUSPENSE_AND_PACING_RULES.
        9. NEW CRITICAL: Is the TWIST from the blueprint's twist_map for this episode correctly executed?
           Is the foreshadowing_seed planted in the first half?
           Is the cliffhanger type DIFFERENT from the last 3 episodes? (Last used: ${lastCliffhangerTypes.slice(-3).join(", ") || "none"})
        10. ORIGINALITY CHECK: Does any passage too closely mirror a known published work?
        List any inconsistencies or required fixes. If none, say "All clear".
      `;
      const guardRes = await ai.models.generateContent({ model, contents: guardPrompt });
      if (signal?.aborted) return reject(new Error("AbortError"));
      const guardCritique = guardRes.text || "";

      // ── Step 5 (was Step 4): PROSE POLISHER ──
      if (onProgress) onProgress("PROSE POLISHER - Grammar, style, pacing, twist & foreshadowing refinement...");
      const polisherPrompt = `
        You are the PROSE POLISHER. 
        Draft:
        ---
        ${twistEnhancedDraft}
        ---
        Continuity Guard's Feedback:
        ---
        ${guardCritique}
        ---
        Refine the draft to address the feedback.
        Enforce DIALOGUE_FIRST_WRITING_RULES (85-90% dialogue).
        Enforce PARENTHESIS_RULE (no parentheses).
        Enforce ANTI_CLICHE_AND_PROSE_RULES.
        Enforce EPISODE_LENGTH_RULES (3500–4000 words).
        Enforce SUSPENSE_AND_PACING_RULES (7 Laws, Addiction Principle).
        Enforce IMMEDIATE_CONTINUATION_RULE (no resets, no summaries).
        
        NEW — Enforce TWIST_ENGINEERING_RULES:
          · Confirm the MICRO-SURPRISE before the midpoint is preserved.
          · Confirm the foreshadowing seed is in the first half (planted naturally).
          · Confirm the twist payoff passes the Reframe Test.
          · Ensure the cliffhanger type is NOT one of: ${lastCliffhangerTypes.slice(-3).join(", ") || "none yet"}.
        
        NEW — Enforce FORESHADOWING_PAYOFF_ENGINE:
          · Verify every object/detail described in >3 words has narrative purpose OR is a seed.
          · Confirm the Chekhov's Gun Rule — no decorative description.

        NEW — Enforce COPYRIGHT_ORIGINALITY_RULES:
          · Every sentence must be original creative work.
          · No passage may closely mirror any published novel, serial, or web fiction.

        NEW — Enforce CHARACTER_PSYCHOLOGY_ENGINE:
          · Verify every main character decision is rooted in their wound/want/need.
          · Confirm no character states their own emotion directly.
          · Ensure each character's mask cracks or holds in a way that reveals psychology.

        NEW — Enforce SCENE_VELOCITY_ENGINE:
          · Every scene must end in a different emotional register from where it began.
          · Cut any line of dialogue that does not reveal character, advance plot, or deepen conflict.
          · Confirm travel/transition scenes contain active character thought.

        NEW — Enforce DIALOGUE_SUBTEXT_ENGINE:
          · In all emotional exchanges, confirm 70%+ dialogue uses indirect expression.
          · Remove any forbidden direct-emotion lines unless earned by prior restraint.
          · Apply Translation Test to every loaded exchange.

        NEW — Enforce EMOTIONAL_LAYERING_ENGINE:
          · Confirm all high-stakes scenes have Layer 1 (internal), Layer 2 (external), Layer 3 (inferred).
          · Remove any explanatory closing sentences that kill the reader's inference.
          · Verify emotional registers alternate across consecutive scenes.

        NEW — Enforce PROSE_RHYTHM_ENGINE:
          · Confirm all 5 sentence weights are used — no 5+ consecutive sentences of the same weight.
          · Confirm one single-sentence paragraph exists per 500 words.
          · Confirm action sequences use Staccato Attack (Pattern C) — no Rivers during fights.
          · Confirm emotional climaxes use Pattern B (Emotional Avalanche).
          · Confirm sentences end on their most powerful word (verb or key noun).

        NEW — Enforce TTS_AUDIO_FIRST_RULES:
          · Confirm no numbers appear as numerals — all spelled out in Hindi.
          · Confirm every speaker is attributable eyes-closed within 2 dialogue exchanges.
          · Confirm em-dashes and ellipses are placed for dramatic pause effect.
          · Confirm no bold/italic/markdown formatting inside episode prose.
          · Confirm Hindi outro is the very last line — nothing after it.

        NEW — Enforce VILLAIN_ARCHITECTURE_ENGINE (if villain appears):
          · Confirm villain speaks quietly, in complete sentences — never loud/ranting.
          · Confirm villain never monologues unless losing control.
          · Confirm villain dialogue contains at least one genuine truth that hurts the hero.

        NEW — Enforce READER_ADDICTION_ARCHITECTURE:
          · Confirm 3 active promises (Tier 1, 2, 3) are present.
          · If protagonist suffered badly, confirm Safety Cap moment is present.
          · Confirm at least one Re-Listen Reward (A, B, or C) is planted.

        NEW — Enforce HUMAN_EMOTION_ENGINE (CRITICAL for chapter quality):
          · Confirm no sentence names an emotion without FIRST writing it in the body.
          · Confirm at least one character feels two contradictory emotions simultaneously.
          · Confirm at least one involuntary physical response occurs in a high-stakes moment.
          · Confirm at least one emotional fill (Fill Types 1–7) appears in a transitional moment.
          · Confirm emotional residue from a major scene bleeds into at least one later moment.
          · Confirm that when a character is in extreme emotional state, the narration register changes.
          · Confirm at least one private admission a character makes to themselves but would deny aloud.
          · If any check fails: rewrite the relevant passage until the emotional authenticity holds.

        NEW — Enforce RULE_COMPLIANCE_ENFORCEMENT (MANDATORY PRE-FLIGHT):
          · Run the complete Tier 1–5 compliance checklist internally.
          · Fix every Tier 1 failure before proceeding to output.
          · Fix Tier 2, 3, 4, and 5 failures before outputting final text.
          · Do NOT output the polished draft until all Tier 1 items are confirmed.

        NEW — Enforce SCENE_TEMPERATURE_ENGINE:
          · Confirm no two consecutive BLAZING scenes exist without a WARM/COOL between them.
          · Confirm at least 1 COOL or WARM scene exists in this episode.
          · After any scene rated 8+ intensity: confirm temperature drops before rising again.
          · If this is Episode +3 in a 5-episode block: confirm it is appropriately cool.

        NEW — Enforce SECONDARY_CHARACTER_ARC_ENGINE:
          · Confirm every named secondary character has a visible flaw AND loyalty in this episode.
          · Confirm they DO something — not only react to the protagonist.
          · Confirm at least one dialogue exchange occurs between secondary characters.
          · Check the 10-episode rule: no named secondary character has vanished for 10+ episodes.

        NEW — Enforce RECURRING_MOTIF_SYMBOL_ENGINE:
          · If a motif is scheduled this episode: confirm it is planted naturally, for an in-scene reason.
          · Confirm the motif meaning has shifted from its previous appearance (if applicable).
          · Confirm the environmental motif (if used) appears only in the correct scene type.

        NEW — Enforce COMEDY_LEVITY_ENGINE:
          · After any scene rated 8+ on intensity: confirm a levity beat follows in the next scene.
          · Confirm banter is character-specific — could ONLY these two people say these lines?
          · If this is the 5th episode of a 5-episode block: confirm at least 1 warmth scene exists.
          · Confirm comedy arrives AFTER tension — never during a cliffhanger buildup.

        NEW — Enforce ROMANTIC_TENSION_ARCHITECTURE (if romance arc active):
          · Confirm the correct Escalation Rung is active — not a rung skipped.
          · Confirm push-pull balance across the last 5 episodes (at least 2 push, 2 pull beats).
          · If an almost-moment appears: confirm the 4-step construction is followed.
          · If jealousy appears: confirm it is EARNED, SPECIFIC, IRRATIONAL, and DENIABLE.
        
        ${CLIFFHANGER_ROTATION_RULES}
        ${FORESHADOWING_PAYOFF_ENGINE}
        ${COPYRIGHT_ORIGINALITY_RULES}
        ${WRITING_STYLE_AND_ORIGINALITY_DIRECTIVE}
        ${CHARACTER_PSYCHOLOGY_ENGINE}
        ${SCENE_VELOCITY_ENGINE}
        ${DIALOGUE_SUBTEXT_ENGINE}
        ${EMOTIONAL_LAYERING_ENGINE}
        ${HUMAN_EMOTION_ENGINE}
        ${ROMANTIC_TENSION_ARCHITECTURE}
        ${SCENE_TEMPERATURE_ENGINE}
        ${SECONDARY_CHARACTER_ARC_ENGINE}
        ${RECURRING_MOTIF_SYMBOL_ENGINE}
        ${COMEDY_LEVITY_ENGINE}
        ${RULE_COMPLIANCE_ENFORCEMENT}
        
        Output the polished chapter text.
      `;
      const polisherRes = await ai.models.generateContent({ model, contents: polisherPrompt });
      if (signal?.aborted) return reject(new Error("AbortError"));
      const polishedDraft = polisherRes.text || "";

      // ── Step 6 (was Step 5): FINAL REVIEWER ──
      if (onProgress) onProgress("FINAL REVIEWER - Quality gate & metadata extraction...");
      const reviewerPrompt = `
        You are the FINAL REVIEWER.
        Polished Draft:
        ---
        ${polishedDraft}
        ---
        Your task:
        1. Extract the content of the episode.
        2. TITLE ENGINEERING — Apply CHAPTER_TITLE_ENGINE rules:
           · Title must be 2–6 words maximum (for audio clarity)
           · Must create a CURIOSITY GAP (open question, not a statement of plot)
           · Must be earned by a SPECIFIC moment, object, or word inside this episode
           · Must HINT at the episode twist/emotional core without spoiling it
           · Must sound powerful when spoken aloud (audio-first phonics)
           · Must be a DIFFERENT TYPE from the previous episode title
           · Must make full sense on second reading (re-listen reward embedded)
           Title types to choose from: Unanswered Question / Specific Object / Partial Truth /
           Contrast / Time Stamp / Single Word (sparingly — max once per 8 episodes)
           BANNED: generic emotion words alone, plot summaries, "Episode N", pure-English titles
        3. Enforce formatting: No HTML tags like <p> or <br>. Empty lines for paragraphs.
        4. CRITICAL MANDATE 0 (IMMEDIATE_CONTINUATION_RULE): Confirm the episode starts from the previous cliffhanger moment.
        5. CRITICAL MANDATE 1: Enforce 85-90% dialogue ratio.
        6. CRITICAL MANDATE 2: No parenthesis ( ) for actions/sounds/descriptions.
        7. CRITICAL MANDATE 3: Strip all AI cliché phrases.
        8. CRITICAL MANDATE 4: Ensure 3500–4000 words.
        9. CRITICAL MANDATE 5: Verify SUSPENSE_AND_PACING_RULES — reader experiences both satisfaction and incompleteness.
        10. CRITICAL MANDATE 6 — TWIST QUALITY GATE:
            · Confirm the twist from twist_map is executed and passes the Reframe Test.
            · Confirm the foreshadowing seed is present in the first half.
            · Confirm there is at least one MICRO-SURPRISE.
        11. CRITICAL MANDATE 7 — ORIGINALITY GATE:
            · Execute the STANDARD 5 — THE ECHO TEST from the COPYRIGHT PROTECTION DIRECTIVE.
            · If any passage closely mirrors any published work or triggers recognition, execute the FLAG AND REWRITE PROTOCOL.
            · Do NOT produce the final JSON until originality is 100% verified.
        12. CRITICAL MANDATE 8 — CHARACTER PSYCHOLOGY GATE:
            · Confirm no main character states their own emotion directly.
            · Confirm at least one scene shows the character's wound or mask.
            · Confirm every major character decision is rooted in psychology, not pure logic.
        13. CRITICAL MANDATE 9 — SCENE VELOCITY GATE:
            · Confirm every scene ends in a different emotional register from where it began.
            · Confirm no travel/transition scene is emotionally inert.
        14. CRITICAL MANDATE 10 — SUBTEXT & LAYERING GATE:
            · Confirm emotional exchanges use indirect expression (subtext modes).
            · Confirm high-stakes scenes have all 3 emotional layers (internal/external/inferred).
            · Remove any explanatory sentences that follow emotional peaks.
        15. CRITICAL MANDATE 11 — HUMAN EMOTION GATE (NEW):
            · Confirm no sentence names an emotion without first showing it in the body.
              If found: rewrite the sentence so the body speaks before the label.
            · Confirm at least one character feels two incompatible emotions simultaneously.
            · Confirm at least one involuntary physical response occurs in a high-stakes moment.
            · Confirm at least one emotional fill (Fill Types 1–7) is present in a transitional moment.
            · Confirm emotional residue from a major scene bleeds into at least one later moment.
            · Confirm that in extreme emotional states, the narration itself changes register.
            · If any of the above is missing: locate the scene and inject the missing beat.
            · Do NOT produce the final JSON until all Human Emotion checks pass.
        16. CRITICAL MANDATE 12 — FULL COMPLIANCE VERIFICATION (NEW):
            · Silently run the complete RULE_COMPLIANCE_ENFORCEMENT Tier 1–5 checklist.
            · Every Tier 1 item MUST be confirmed before this step is complete.
            · Every Tier 2, 3, 4, and 5 item must be checked and any failures fixed in the text.
            · Fix violations directly in the content field before outputting the JSON.
            · Do NOT produce the final JSON until all Tier 1 items are confirmed.
        17. CRITICAL MANDATE 13 — ENGAGEMENT ARCHITECTURE GATE (NEW):
            · TEMPERATURE: Confirm no two consecutive BLAZING scenes exist without a WARM/COOL between them.
            · SECONDARY CHARS: Confirm every named secondary character does something (not just reacts); confirm flaw + loyalty visible.
            · MOTIF: If a recurring motif is scheduled for this episode, confirm it appears naturally.
            · LEVITY: After any scene rated 8+ on intensity, confirm a levity beat follows in the next scene.
            · ROMANCE (if active): Confirm the correct Escalation Rung is advancing; push-pull balance maintained.
            · WARMTH: If this is Episode +5 of a 5-episode block, confirm at least 1 warmth scene exists in this block.
            · Fix any Tier 5 failures in the content field before outputting the final JSON.
        18. Identify the CLIFFHANGER TYPE used in this episode. It must be one of:
            REVELATION_BOMB | THREAT_NO_EXIT | BETRAYAL_CUT | IMPOSSIBLE_CHOICE |
            ARRIVAL | TICKING_CLOCK | QUESTION_UNANSWERED | POINT_OF_NO_RETURN
            It must NOT be any of the last 3 types used: ${lastCliffhangerTypes.slice(-3).join(", ") || "none yet"}.
        19. Output the exact final version in JSON format with "title", "content", and "cliffhanger_type" fields.
      `;

      const response = await ai.models.generateContent({
        model: model,
        contents: reviewerPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              cliffhanger_type: { type: Type.STRING },
            },
            required: ["title", "content", "cliffhanger_type"],
          },
        },
      });

      if (signal?.aborted) return reject(new Error("AbortError"));
      const jsonText = response.text ? response.text.trim() : "";
      const parsed = JSON.parse(jsonText);
      resolve({
        title: parsed.title,
        content: parsed.content,
        cliffhangerType: parsed.cliffhanger_type as CliffhangerType,
      });

    } catch (error) {
      if (signal?.aborted) return reject(new Error("AbortError"));
      console.error("Error generating chapter (Pipeline):", error);
      reject(new Error("Failed to generate chapter from AI."));
    } finally {
      if (signal) signal.removeEventListener("abort", abortHandler);
    }
  });
};

export const regenerateChapter = async (
  model: AIModel,
  fileContext: string,
  existingChapters: Chapter[],
  chapterToRevise: Chapter,
  revisionPrompt: string,
  signal?: AbortSignal,
  onProgress?: (msg: string) => void,
  lastCliffhangerTypes: string[] = [],
): Promise<{ title: string; content: string; cliffhangerType: CliffhangerType }> => {
  const existingChaptersContext =
    existingChapters.length > 0
      ? `\n\n**हाल ही में लिखे गए एपिसोड्स (RECENTLY WRITTEN EPISODES):**\n` +
        existingChapters
          .map((c) => `Episode ${c.id}: ${c.title}\n${c.content}`)
          .join("\n\n---\n\n")
      : "";

  const contextPrompt = `
    **कहानी का ब्लूप्रिंट और पिछला संदर्भ (STRICT NOVEL BLUEPRINT & PREVIOUS EPISODES):**
    ---
    ${fileContext}
    ---
    ${existingChaptersContext}
  `;

  return new Promise(async (resolve, reject) => {
    const abortHandler = () => reject(new Error("AbortError"));
    if (signal) {
      if (signal.aborted) return reject(new Error("AbortError"));
      signal.addEventListener("abort", abortHandler);
    }

    try {
      if (onProgress)
        onProgress("PLANNER - Extracting original blueprint requirements...");
      const plannerPrompt = `
        You are the PLANNER carefully reading the entire Novel Blueprint and previous episodes context.
        Your ONLY task is to extract EXACTLY what the blueprint dictated for Episode ${chapterToRevise.id}.
        
        **Context:**
        ---
        ${contextPrompt}
        ---
        
        Output a detailed outline for Episode ${chapterToRevise.id} ONLY based on the blueprint.
        - DO explicitly list the A-Story Goal, Conflict, Reversal, and Cliff-hanger that the blueprint dictates for Episode ${chapterToRevise.id}.
        - Do not summarize the existing draft, only extract what the blueprint INTENDED for this episode.
      `;
      const plannerRes = await ai.models.generateContent({
        model,
        contents: plannerPrompt,
      });
      if (signal?.aborted) return reject(new Error("AbortError"));
      const extractedPlan = plannerRes.text || "";

      if (onProgress) onProgress("CHAPTER EDITOR - Applying revisions...");
      const editorPrompt = `
        You are the CHAPTER EDITOR. A user wants to revise Episode ${chapterToRevise.id}.
        
        **Original Blueprint Requirements for this Episode:**
        ---
        ${extractedPlan}
        ---

        **Context (Blueprint & Previous Episodes):**
        ---
        ${contextPrompt}
        ---

        **Current Draft of Episode ${chapterToRevise.id}:**
        ---
        TITLE: ${chapterToRevise.title}
        CONTENT:
        ${chapterToRevise.content}
        ---

        **User's Revision Instructions:**
        "${revisionPrompt}"

        **Instructions:**
        1. STRONGLY RECOMMENDED: READ ALL provided .txt documents (Previous Episodes & Context) CAREFULLY before you revise. Use this information to deeply understand characters, plot progression, and maintain absolute continuity.
        2. Revise the episode based on the user's instructions.
        3. DO NOT lose the critical plot points from the extracted blueprint. The revised episode must still hit the required story beats for this episode.
        4. Add unexpected, creative twists whenever possible or requested, to keep the reader hooked without breaking the main blueprint constraints.
        5. Focus on every single detail during writing to make the novel lively, atmospheric, and emotionally resonant. Make the reader feel the flow of the story and intensely inspired to read the next episode.
        6. CRITICAL: You must strictly adhere to the 85-90% dialogue rule defined in DIALOGUE_FIRST_WRITING_RULES. If you are writing too much narration, stop and convert it to dialogue.

        ${EPISODE_LENGTH_RULES}
        
        ${HINDI_LANGUAGE_RULES}
        
        **EPISODE STRUCTURE REFERENCE (Hinglish Vibe):**
        ${DEMO_EPISODE_TEXT}

        **DEEP ROMANTIC/INTIMATE SCENES REFERENCE (Style Guide):**
        ${ROMANTIC_DEMO_TEXT}

        ${IMMERSION_AND_WORLD_RULES}

        ${PROSE_AND_DIALOGUE_RULES}

        ${EPISODE_STRUCTURE_RULES}

        ${SUSPENSE_AND_PACING_RULES}
        ${TWIST_ENGINEERING_RULES}
        ${CLIFFHANGER_ROTATION_RULES}
        ${FORESHADOWING_PAYOFF_ENGINE}
        ${CHARACTER_PSYCHOLOGY_ENGINE}
        ${SCENE_VELOCITY_ENGINE}
        ${DIALOGUE_SUBTEXT_ENGINE}
        ${EMOTIONAL_LAYERING_ENGINE}
        ${PROSE_RHYTHM_ENGINE}
        ${TTS_AUDIO_FIRST_RULES}
        ${VILLAIN_ARCHITECTURE_ENGINE}
        ${READER_ADDICTION_ARCHITECTURE}
        ${HUMAN_EMOTION_ENGINE}
        ${ROMANTIC_TENSION_ARCHITECTURE}
        ${SCENE_TEMPERATURE_ENGINE}
        ${SECONDARY_CHARACTER_ARC_ENGINE}
        ${RECURRING_MOTIF_SYMBOL_ENGINE}
        ${COMEDY_LEVITY_ENGINE}
        ${RULE_COMPLIANCE_ENFORCEMENT}

        Output the REVISED draft in plain text/markdown.
      `;
      const editorRes = await ai.models.generateContent({
        model,
        contents: editorPrompt,
      });
      if (signal?.aborted) return reject(new Error("AbortError"));
      const revisedDraft = editorRes.text || "";

      // ── TWIST INJECTOR for regeneration ──
      if (onProgress) onProgress("TWIST INJECTOR - Scoring surprise factor & twist reinforcement...");
      const regenTwistInjectorPrompt = `
        You are the TWIST INJECTOR. Your ONLY job is to evaluate and enhance the surprise quality
        of this REVISED episode draft.

        **Revised Episode ${chapterToRevise.id} Draft:**
        ---
        ${revisedDraft}
        ---

        **Blueprint requirements for this episode:**
        ---
        ${'' /* contextPrompt is already referenced in extractedPlan */}
        ${extractedPlan}
        ---

        Apply ALL tasks from TWIST_ENGINEERING_RULES:
        TASK 1 — PREDICTABILITY SCORE (5-Second Test): If score < 7, rewrite final 20%.
        TASK 2 — REFRAME TEST: If the story doesn't feel different after the twist, escalate it.
        TASK 3 — FORESHADOWING SEED CHECK: Confirm seed from blueprint is in first half.
        TASK 4 — MICRO-SURPRISE CHECK: Inject one if missing before the midpoint.

        ${TWIST_ENGINEERING_RULES}

        Also check last 3 cliffhanger types used: ${lastCliffhangerTypes.slice(-3).join(", ") || "none yet"}.
        The cliffhanger type for this episode MUST be different.
        ${CLIFFHANGER_ROTATION_RULES}

        Output: the enhanced draft only. No commentary.
      `;
      const regenTwistInjectorRes = await ai.models.generateContent({ model, contents: regenTwistInjectorPrompt });
      if (signal?.aborted) return reject(new Error("AbortError"));
      const twistEnhancedRevisedDraft = regenTwistInjectorRes.text || "";

      if (onProgress) onProgress("FINAL REVIEWER - Quality gate & twist extraction...");
      const reviewerPrompt = `
        You are the FINAL REVIEWER finalizing the revised text.
        Revised Draft (after Twist Injector):
        ---
        ${twistEnhancedRevisedDraft}
        ---
        Your task:
        1. Extract the content of the episode.
        2. TITLE ENGINEERING — Apply CHAPTER_TITLE_ENGINE rules:
           · Title must be 2–6 words maximum (for audio clarity)
           · Must create a CURIOSITY GAP (open question, not a statement of plot)
           · Must be earned by a SPECIFIC moment, object, or word inside this episode
           · Must HINT at the episode twist/emotional core without spoiling it
           · Must sound powerful when spoken aloud (audio-first phonics)
           · Title types: Unanswered Question / Specific Object / Partial Truth /
             Contrast / Time Stamp / Single Word (max once per 8 episodes)
           BANNED: generic emotion words alone, plot summaries, pure-English titles
        3. Enforce formatting: No HTML tags like <p> or <br>. Empty lines for paragraphs.
        4. CRITICAL MANDATE 0 (IMMEDIATE CONTINUATION_RULE): Ensure episode starts from the previous cliffhanger.
        5. CRITICAL MANDATE 1: Enforce 85-90% dialogue ratio.
        6. CRITICAL MANDATE 2: No parenthesis ( ) for actions/sounds/descriptions.
        7. CRITICAL MANDATE 3: Strip all AI cliché phrases.
        8. CRITICAL MANDATE 4: Enforce 3500–4000 words.
        9. CRITICAL MANDATE 5: Verify SUSPENSE_AND_PACING_RULES — reader experiences both satisfaction and incompleteness.
        10. CRITICAL MANDATE 6 — TWIST QUALITY GATE:
            · Confirm twist passes the Reframe Test.
            · Confirm foreshadowing seed is present in first half.
            · Confirm at least one MICRO-SURPRISE.
        11. CRITICAL MANDATE 7 — ORIGINALITY GATE:
            · Execute the STANDARD 5 — THE ECHO TEST from the COPYRIGHT PROTECTION DIRECTIVE.
            · If any passage closely mirrors any published work or triggers recognition, execute the FLAG AND REWRITE PROTOCOL.
            · Do NOT produce the final JSON until originality is 100% verified.
        12. CRITICAL MANDATE 8 — CHARACTER PSYCHOLOGY GATE:
            · Confirm no main character states their own emotion directly.
            · Confirm character decisions are psychologically rooted.
        13. CRITICAL MANDATE 9 — SUBTEXT & LAYERING GATE:
            · Confirm emotional exchanges use indirect expression.
            · Confirm high-stakes scenes have all 3 emotional layers.
            · Remove any explanatory sentences after emotional peaks.
        14. CRITICAL MANDATE 10 — HUMAN EMOTION GATE (NEW):
            · Confirm no sentence names an emotion without first showing it in the body.
              If found: rewrite the sentence so the body speaks before the label.
            · Confirm at least one character feels two incompatible emotions simultaneously.
            · Confirm at least one involuntary physical response in a high-stakes moment.
            · Confirm at least one emotional fill (Fill Types 1–7) in a transitional moment.
            · Confirm emotional residue from a major scene bleeds into a later moment.
            · Confirm that in extreme emotional states, the prose register changes.
            · Fix any missing emotional authenticity before outputting the final JSON.
        15. CRITICAL MANDATE 11 — FULL COMPLIANCE VERIFICATION (NEW):
            · Silently run the complete RULE_COMPLIANCE_ENFORCEMENT Tier 1–5 checklist.
            · Every Tier 1 item MUST be confirmed before output.
            · Every Tier 2, 3, 4, and 5 item must be checked and any failures fixed in the content.
            · Do NOT produce the final JSON until all Tier 1 items are confirmed.
        16. CRITICAL MANDATE 12 — ENGAGEMENT ARCHITECTURE GATE (NEW):
            · TEMPERATURE: Confirm no two consecutive BLAZING scenes without a WARM/COOL between them.
            · SECONDARY CHARS: Confirm every named secondary character does something (not just reacts); flaw + loyalty visible.
            · MOTIF: If a recurring motif is scheduled for this episode, confirm natural placement.
            · LEVITY: Confirm a levity beat follows any scene rated 8+ on intensity.
            · ROMANCE (if active): Confirm the correct Escalation Rung is advancing; no skipped rungs.
            · Fix any Tier 5 failures before outputting the final JSON.
        17. Identify the CLIFFHANGER TYPE used. Must be one of:
            REVELATION_BOMB | THREAT_NO_EXIT | BETRAYAL_CUT | IMPOSSIBLE_CHOICE |
            ARRIVAL | TICKING_CLOCK | QUESTION_UNANSWERED | POINT_OF_NO_RETURN
            Must NOT be any of: ${lastCliffhangerTypes.slice(-3).join(", ") || "none yet"}.
        17. Output JSON with "title", "content", and "cliffhanger_type" fields.
      `;

      const response = await ai.models.generateContent({
        model: model,
        contents: reviewerPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              cliffhanger_type: { type: Type.STRING },
            },
            required: ["title", "content", "cliffhanger_type"],
          },
        },
      });
      if (signal?.aborted) return reject(new Error("AbortError"));
      const jsonText = (response.text || "").trim();
      const parsed = JSON.parse(jsonText);
      resolve({
        title: parsed.title,
        content: parsed.content,
        cliffhangerType: parsed.cliffhanger_type as CliffhangerType,
      });
    } catch (error) {
      if (signal?.aborted) return reject(new Error("AbortError"));
      console.error("Error regenerating content:", error);
      reject(new Error("Failed to regenerate chapter from AI."));
    } finally {
      if (signal) signal.removeEventListener("abort", abortHandler);
    }
  });
};

// --- MULTI-SPEAKER TTS LOGIC ---

interface Speaker {
  name: string;
  gender: "male" | "female" | "neutral";
}

interface TtsScript {
  script: string;
  speakers: Speaker[];
}

export type VoiceMap = { [key: string]: string };

export const prepareTtsScript = async (
  text: string,
): Promise<{ script: string; voiceMap: VoiceMap }> => {
  const prompt = `
    आप एक स्क्रिप्ट विश्लेषक हैं। आपका काम दिए गए उपन्यास के पाठ को एक बहु-आवाज टीटीएस स्क्रिप्ट में बदलना है।

    कार्य:
    1.  पाठ का विश्लेषण करें और सभी संवाद और कथन की पहचान करें।
    2.  पाठ को एक स्क्रिप्ट प्रारूप में बदलें। प्रत्येक पंक्ति की शुरुआत एक स्पीकर टैग (जैसे, "CharacterName:") से होनी चाहिए।
    3.  सभी गैर-संवाद पाठ (कथन) को "Narrator:" के रूप में लेबल करें।
    4.  सभी संवाद करने वाले पात्रों की एक सूची बनाएँ।
    5.  प्रत्येक पात्र के नाम के आधार पर उनके लिंग ('male' or 'female') का अनुमान लगाएँ।

    उदाहरण:
    Input Text: "तुम कहाँ थे?" प्रिया ने पूछा। सूरज डूब रहा था।
    Output JSON:
    {
      "script": "Narrator: सूरज डूब रहा था।\\nPriya: तुम कहाँ थे?",
      "speakers": [
        { "name": "Priya", "gender": "female" }
      ]
    }

    अब, कृपया निम्नलिखित पाठ को संसाधित करें:
    ---
    ${text}
    ---

    अपनी प्रतिक्रिया को ऊपर दिए गए उदाहरण के अनुसार एक एकल JSON ऑब्जेक्ट के रूप में लौटाएँ।
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            script: { type: Type.STRING },
            speakers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  gender: { type: Type.STRING },
                },
                required: ["name", "gender"],
              },
            },
          },
          required: ["script", "speakers"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}") as TtsScript;

    const maleVoices = ["Fenrir", "Charon"]; // Example male voices
    const femaleVoices = ["Puck", "Zephyr"]; // Example female voices
    let maleIndex = 0;
    let femaleIndex = 0;

    const voiceMap: VoiceMap = {
      Narrator: "Kore", // Default narrator voice
    };

    data.speakers.forEach((speaker) => {
      if (!voiceMap[speaker.name]) {
        if (speaker.gender === "female") {
          voiceMap[speaker.name] =
            femaleVoices[femaleIndex % femaleVoices.length];
          femaleIndex++;
        } else {
          voiceMap[speaker.name] = maleVoices[maleIndex % maleVoices.length];
          maleIndex++;
        }
      }
    });

    return { script: data.script, voiceMap };
  } catch (error) {
    console.error("Error preparing TTS script:", error);
    throw new Error("Failed to prepare text for speech generation.");
  }
};

export const generateSpeech = async (
  scriptChunk: string,
  voiceMap: VoiceMap,
): Promise<string> => {
  const speakerLines = scriptChunk
    .split("\n")
    .filter((line) => line.trim() !== "");
  const speakersInChunk = [
    ...new Set(speakerLines.map((line) => line.split(":")[0].trim())),
  ];

  const speakerVoiceConfigs = speakersInChunk.map((speakerName) => {
    const voiceName = voiceMap[speakerName] || "Kore"; // Default if somehow not in map
    return {
      speaker: speakerName,
      voiceConfig: { prebuiltVoiceConfig: { voiceName } },
    };
  });

  if (speakerVoiceConfigs.length < 2) {
    const singleVoice = voiceMap[speakersInChunk[0]] || "Kore";
    try {
      const response = await ai.models.generateContent({
        model: ttsModel,
        contents: [{ parts: [{ text: scriptChunk }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: singleVoice },
            },
          },
        },
      });
      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("No audio data received.");
      return base64Audio;
    } catch (error) {
      console.error("Error generating single-speaker speech:", error);
      throw new Error("Failed to generate speech from AI.");
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: ttsModel,
      contents: [{ parts: [{ text: scriptChunk }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          multiSpeakerVoiceConfig: { speakerVoiceConfigs },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data received from API.");
    }
    return base64Audio;
  } catch (error) {
    console.error("Error generating multi-speaker speech:", error);
    throw new Error("Failed to generate speech from AI.");
  }
};
