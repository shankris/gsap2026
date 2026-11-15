/* src/demos/card-stack-03/Demo.jsx */

"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import styles from "./Demo.module.css";

const projects = [
  {
    title: "Matthias Leidinger",
    description: "Originally hailing from Austria, Berlin-based photographer Matthias Leidinger is a young creative brimming with talent and ideas.",
    src: "rock.jpg",
    link: "https://www.ignant.com/2023/03/25/ad2186-matthias-leidingers-photographic-exploration-of-awe-and-wonder/",
    color: "#BBACAF",
  },
  {
    title: "Clément Chapillon",
    description: "This is a story on the border between reality and imaginary, about the contradictory feelings that the insularity of a rocky, arid, and wild territory provokes—so French photographer Clément Chapillon describes his latest highly captivating project Les rochers fauves (French for 'The tawny rocks').",
    src: "tree.jpg",
    link: "https://www.ignant.com/2022/09/30/clement-chapillon-questions-geographical-and-mental-isolation-with-les-rochers-fauves/",
    color: "#977F6D",
  },
  {
    title: "Zissou",
    description: "Though he views photography as a medium for storytelling, Zissou’s images don’t insist on a narrative. Both crisp and ethereal, they’re encoded with an ambiguity—a certain tension—that lets the viewer find their own story within them.",
    src: "water.jpg",
    link: "https://www.ignant.com/2023/10/28/capturing-balis-many-faces-zissou-documents-the-sacred-and-the-mundane-of-a-fragile-island/",
    color: "#C2491D",
  },
  {
    title: "Mathias Svold and Ulrik Hasemann",
    description: "The coastlines of Denmark are documented in tonal colors in a pensive new series by Danish photographers Ulrik Hasemann and Mathias Svold; an ongoing project investigating how humans interact with and disrupt the Danish coast.",
    src: "house.jpg",
    link: "https://www.ignant.com/2019/03/13/a-photographic-series-depicting-the-uncertain-future-of-denmarks-treasured-coastlines/",
    color: "#B62429",
  },
  {
    title: "Mark Rammers",
    description: "Dutch photographer Mark Rammers has shared with IGNANT the first chapter of his latest photographic project, 'all over again'—captured while in residency at Hektor, an old farm in Los Valles, Lanzarote. Titled 'Beginnings', the mesmerizing collection of images is a visual and meditative journey into the origins of regrets and the uncertainty of stepping into new unknowns.",
    src: "cactus.jpg",
    link: "https://www.ignant.com/2023/04/12/mark-rammers-all-over-again-is-a-study-of-regret-and-the-willingness-to-move-forward/",
    color: "#88A28D",
  },
];

function Card({ project, index, progress, range, targetScale }) {
  const container = useRef(null);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "start start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [2, 1]);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      ref={container}
      className={styles.cardContainer}
    >
      <motion.div
        className={styles.card}
        style={{
          backgroundColor: project.color,
          top: `calc(-5vh + ${index * 25}px)`,
          scale,
        }}
      >
        <h2>{project.title}</h2>

        <div className={styles.body}>
          <div className={styles.description}>
            <p>{project.description}</p>

            <a
              href={project.link}
              target='_blank'
              rel='noopener noreferrer'
              className={styles.link}
            >
              See more
              <svg
                width='22'
                height='12'
                viewBox='0 0 22 12'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M21.5303 6.53033C21.8232 6.23744 21.8232 5.76256 21.5303 5.46967L16.7574 0.696699C16.4645 0.403806 15.9896 0.403806 15.6967 0.696699C15.4038 0.989592 15.4038 1.46447 15.6967 1.75736L19.9393 6L15.6967 10.2426C15.4038 10.5355 15.4038 11.0104 15.6967 11.3033L21.5303 6.53033ZM0 6.75L21 6.75V5.25L0 5.25V6.75Z'
                  fill='black'
                />
              </svg>
            </a>
          </div>

          <div className={styles.imageContainer}>
            <motion.div
              className={styles.inner}
              style={{ scale: imageScale }}
            >
              <Image
                src={`/demos/card-stack-03/${project.src}`}
                alt={project.title}
                fill
                sizes='(max-width: 768px) 90vw, 60vw'
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function CardStack03() {
  const container = useRef(null);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  return (
    <main
      ref={container}
      className={styles.main}
    >
      {projects.map((project, index) => {
        const targetScale = 1 - (projects.length - index) * 0.05;

        return (
          <Card
            key={project.title}
            project={project}
            index={index}
            progress={scrollYProgress}
            range={[index * 0.25, 1]}
            targetScale={targetScale}
          />
        );
      })}
    </main>
  );
}
