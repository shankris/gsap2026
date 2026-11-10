// src/demos/scrollspy-01/Demo.jsx

import styles from "./Demo.module.css";

const sections = [
  {
    id: "section-1",
    title: "Beginnings",
    paragraphs: ["There is a particular feeling that belongs to the printed book and almost nothing else: the weight of the unread pages held under your right thumb. It is a quiet form of knowledge. Without counting, without thinking, you know roughly where you are — a third of the way in, nearly finished, barely begun. The page is not only a surface for words. It is an instrument of orientation.", "When reading moved onto screens, we kept the words and lost the thumb. The scroll bar tried to stand in for that lost sense of place, but it has always been a poor substitute — a thin grey ghost that most readers never consciously see. We gained infinite text and gave up the simple animal certainty of knowing how far we had come.", "This essay is about that trade, and about a small redemption: the navigational aside, the little map in the margin that has lately begun to reappear at the edge of well-made pages."],
  },
  {
    id: "section-2",
    title: "The Scroll and the Page",
    number: "01",
    paragraphs: ["The codex — the bound book of pages — is one of the most successful interfaces ever designed. Its genius is that it makes a long, linear argument feel like a navigable space. You can flip back to a half-remembered passage, dog-ear a turning point, riffle ahead to see how much remains. The book has random access and a built-in sense of scale.", "The scroll, by contrast, is pure sequence. It is honest about one thing — the relentless forward motion of text — and silent about everything else. Where am I? How much is left? Is this a long section or a short one? The scroll shrugs. It hands you the words and withholds the geography."],
    quote: "A reader who cannot see the whole shape of a thing reads more anxiously, and remembers it less.",
    afterQuote: "This is not a small loss. Cognitive scientists who study reading describe a sense called the spatial memory of text — our ability to recall not just what a passage said but where on the page it sat. Strip away the page, and you weaken the hook on which memory hangs.",
  },
  {
    id: "section-3",
    title: "Reading as Navigation",
    number: "02",
    paragraphs: ["If we accept that reading is partly an act of navigation, then a long document is a kind of terrain. And terrain wants a map. Not a turn-by-turn list of instructions, but a small, glanceable picture of the whole — where the peaks are, how far the trail runs, which marker you are standing beside right now.", "The best of these maps do three things at once. They tell you the structure of what you are reading. They tell you your position within it. And they offer passage — the ability to leap, with a single gesture, from where you are to anywhere you would rather be.", "None of this is new. The table of contents has done the first job for five hundred years. What is new is that a screen can do all three at once, continuously, and update itself as your eye moves down the page."],
  },
  {
    id: "section-4",
    title: "Designing the Margins",
    number: "03",
    paragraphs: ["A navigational aside lives in the margin — and the margin is sacred ground. It must never shout. Its whole virtue is that it stays out of the way of the sentence until the moment you look up and want it. Get the volume wrong and you have built a dashboard, not a margin.", "The craft, then, is in restraint. A thin rail. A line that fills as you descend, like ink rising in a thermometer. A quiet marker that slides to keep pace with your reading. Section names that brighten as you reach them and settle into a calm, finished state once you have passed. Nothing blinks. Nothing competes.", "And crucially, the map should answer the thumb's old question without being asked: how much further? A small honest number — minutes remaining, percentage read — restores the certainty the bound page once gave for free."],
  },
  {
    id: "section-5",
    title: "The Return of Slowness",
    number: "04",
    paragraphs: ["There is an irony worth naming. The same screens that fractured our attention are now, slowly, being asked to mend it. A good aside is not a productivity tool. It will not help you read faster. If anything, by showing you the shape of the whole, it gives you permission to slow down — to settle into a long section because you can see that it ends.", "Knowing where the ground falls away makes the walk less anxious. You stop checking how much is left because the question is always quietly answered. Attention, freed from its low-grade worry about duration, can finally do the thing it does best: stay."],
  },
  {
    id: "section-6",
    title: "Coda",
    number: "05",
    paragraphs: ["The thumb under the pages was never really about the pages. It was about trust — a body's quiet confidence that it knew where it stood. We can build that trust back into the screen, not by imitating paper, but by being honest in the way paper was honest: here is the whole, here is your place in it, and here is the way to anywhere else.", "Look to your right. That small rail kept pace with you the entire way down. It is a modest thing. But modest things, placed with care in the margin, are how reading learns to feel like somewhere again."],
  },
];

export default function Demo() {
  return (
    <div className={styles.demo}>
      <div
        className={styles.app}
        id='top'
      ></div>
      <div className={styles.app}>
        <header className={styles.header}>
          <h1>Pure CSS Scroll-Spy Timeline Navigation</h1>
        </header>

        <article className={styles.article}>
          <p className={styles.eyebrow}>Essay · On Reading</p>

          <h2 className={styles.title}>The Geometry of Attention</h2>

          <p className={styles.dek}>We stopped turning pages and started pulling a single, endless one. What did the scroll quietly take from us — and what might a good map give back?</p>

          <div className={styles.byline}>
            <strong>Marguerite Hale</strong>
            <span className={styles.dot} />
            <span>The Margin Notes</span>
            <span className={styles.dot} />
            <span>4 min read</span>
          </div>

          {sections.map((section) => (
            <section
              className={styles.section}
              id={section.id}
              key={section.id}
            >
              {section.number && (
                <h3 className={styles.sectionHeading}>
                  <span className={styles.number}>{section.number}</span>
                  {section.title}
                </h3>
              )}

              {section.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}

              {section.quote && <p className={styles.pullquote}>{section.quote}</p>}

              {section.afterQuote && <p>{section.afterQuote}</p>}
            </section>
          ))}

          <div className={styles.topButton}>
            <a href='#top'>Scroll to top ↑</a>
          </div>
        </article>

        <hr className={styles.vertical} />

        <aside className={styles.aside}>
          <div className={styles.toc}>
            <nav aria-label='Article contents'>
              <div className={styles.tocHead}>
                <p className={styles.tocLabel}>Contents</p>
                <div className={styles.tocMeta}>
                  <span className={styles.percentage} />
                </div>
              </div>

              <div className={styles.tocContainer}>
                <div className={styles.path} />

                <ul className={styles.tocList}>
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a href={`#${section.id}`}>{section.title}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
}
