/* src/demos/index.js */

import Atsu from "./atsu/Demo";
import Norden from "./norden/Demo";
import PaperCraft from "./paper-craft/Demo";
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
};

export default demos;
