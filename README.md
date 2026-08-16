# MindMap — Turn Any Resource Into a Living Story

A premium, cinematic AI mind-map generator with the editorial sophistication of a
luxury brand. Paste notes, upload a document, or name a topic, and watch your
knowledge bloom into a beautiful, interactive mind map — then keep growing it
every day with **Storybook Mode**.

> Live, dependency-free, and fully static. Open `index.html` and go.

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
- **Storybook Mode** — a persistent reading journal. Add a chapter from your own
  resources whenever you learn something; each one merges into your evolving map
  and highlights the new knowledge. Press **Finished** to archive a book into
  your **Finished Storybooks** collection and start the next. Saved in your
  browser between visits.
- **Knowledge Journey dashboard** — daily resource cards and count-up stats.
- **Multi-page experience** — each nav item (Generator, Storybook, Journey,
  Features, About) opens as its own page with its own URL.
- **Luxury motion** — magnetic buttons, custom cursor, scroll-triggered reveals,
  a scroll-driven text-fill "About" section, and parallax statements.
- **Fully responsive** and respects `prefers-reduced-motion`.

## ✦ The "AI" engine

The concept extraction runs **entirely in the browser** — no keys, no network.
`js/generator.js` performs sentence segmentation, stop-word–filtered keyword
scoring, phrase/heading detection, example/definition cue detection, curated
topic templates, and a Storybook merge algorithm that scores label overlap to
decide whether today's themes attach to an existing branch or spawn a new one.

To wire in a real LLM later, replace `MindGen.fromText` / `MindGen.fromTopic`
with an API call that returns the same `{ root, meta }` tree shape.

## ✦ Structure

```
index.html          Page markup, SPA page router shell
css/styles.css      Luxury editorial design system (dark charcoal + gold)
js/generator.js     Client-side content-analysis engine → mind-map tree
js/mindmap.js       Interactive SVG renderer (layouts, zoom, pan, drag, export)
js/storybook.js     Curated daily resources for the example Storybook
js/main.js          Orchestration: animations, canvases, page router, wiring
```

## ✦ Run it

No build step. Any static server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Or simply open `index.html` in a modern browser. It also deploys as-is to any
static host (GitHub Pages, Netlify, Cloudflare Pages, …).

## ✦ Try it

1. Go to **The Studio**, click **Load a sample resource**, then **Generate Mind Map**.
2. Drag nodes, use the **+ / −** badges to collapse branches, scroll to zoom.
3. Cycle **Layout**, then **Export** your map as a PNG.
4. Open **Storybook Mode**, add a chapter from your own notes, add another, and
   watch your knowledge connect and grow — then mark it **Finished**.
