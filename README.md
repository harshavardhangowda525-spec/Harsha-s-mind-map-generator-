# MindMap — Turn Any Resource Into a Living Story

A premium, cinematic AI mind-map generator with the editorial sophistication of a
luxury brand. Paste notes, upload a document, or name a topic, and watch your
knowledge bloom into a beautiful, interactive mind map — then keep growing it
every day with **Storybook Mode**.

> Live, dependency-free, and fully offline-capable. Open `index.html` and go.

---

## ✦ Highlights

- **Cinematic hero** — full-screen animated neural-network canvas, scroll parallax,
  masked line reveals, and large Cormorant Garamond typography.
- **Interactive Mind-Map Studio** — paste text, upload `.txt/.md/.pdf/.csv`, or
  enter a topic. Generates a live SVG map with:
  - Central topic → main branches → subtopics → key points & examples
  - **Zoom & pan**, **drag-and-drop nodes**, **expand / collapse**
  - Three layouts: **radial**, **tree**, **horizontal**
  - Controls: **Regenerate · Expand · Summarize · Explain · Export (PNG) · Save**
- **Storybook Mode** — a growing visual story. Each day's resource is intelligently
  merged into the existing map: connections are detected, new branches are created,
  related concepts merge, and new knowledge is highlighted in gold.
- **Knowledge Journey dashboard** — daily resource cards with date, AI summary,
  concepts added, connected topics, and a "View Mind Map" link.
- **Luxury motion** — magnetic buttons, custom cursor, scroll-triggered reveals,
  a scroll-driven text-fill "About" section, count-up stats, and parallax statements.
- **Fully responsive** and respects `prefers-reduced-motion`.

## ✦ The "AI" engine

The concept extraction runs **entirely in the browser** — no API keys, no network.
`js/generator.js` performs:

- Sentence segmentation and stop-word filtered keyword scoring (frequency +
  position + proper-noun weighting)
- Bigram / phrase detection for readable branch labels
- Heading detection (Markdown, numbered, ALL-CAPS, `Label:` lines)
- Example / definition cue detection
- Curated topic templates for common subjects, with a generic scaffold fallback
- A Storybook merge algorithm that scores label overlap to decide whether today's
  themes attach to an existing branch or spawn a new one

This keeps the experience instant and private. To wire in a real LLM later, replace
`MindGen.fromText` / `MindGen.fromTopic` with an API call that returns the same
`{ root, meta }` tree shape.

## ✦ Structure

```
index.html          Page markup and section scaffolding
css/styles.css      Luxury editorial design system (dark charcoal + gold)
js/generator.js     Client-side content-analysis engine → mind-map tree
js/mindmap.js       Interactive SVG renderer (layouts, zoom, pan, drag, export)
js/storybook.js     Curated daily resources for Storybook + dashboard
js/main.js          Orchestration: animations, canvases, wiring
```

## ✦ Run it

No build step. Any static server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Or simply open `index.html` in a modern browser.

## ✦ Try it

1. Go to **The Studio**, click **Load a sample resource**, then **Generate Mind Map**.
2. Drag nodes, use the **+ / −** badges to collapse branches, scroll to zoom.
3. Cycle **Layout**, then **Export** your map as a PNG.
4. Scroll to **Storybook Mode** and press **Add the next day →** to watch your
   knowledge accumulate and connect over time.
