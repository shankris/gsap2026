/* src/demos/index.js */

import Atsu from "./atsu/Demo";
import CardStack01 from "./card-stack-01/Demo";
import CardStack02 from "./card-stack-02/Demo";
import ElectricBorder from "./electric-border/Demo";
import Gallery01 from "./gallery-01/Demo";
import Norden from "./norden/Demo";
import PaperCraft from "./paper-craft/Demo";
import Showcase1 from "./showcase1/Demo";
import SkillNexus from "./skill-nexus/Demo";
import SliderNocturne from "./slider-nocturne/Demo";
import WelcomeLoader from "./welcome-loader/Demo";
const demos = {
  "welcome-loader": WelcomeLoader,
  norden: Norden,
  atsu: Atsu,
  "skill-nexus": SkillNexus,
  "slider-nocturne": SliderNocturne,
  "paper-craft": PaperCraft,
  "card-stack-01": CardStack01,
  "card-stack-02": CardStack02,
  "electric-border": ElectricBorder,
  showcase1: Showcase1,
  "gallery-01": Gallery01,
};

export default demos;
