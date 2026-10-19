/* src/app/gsap/welcomeLoader/page.js */

import WelcomeLoader from "@/components/welcomeLoader/welcomeLoader";

export default function WelcomeLoaderPage() {
  const greetings = ["Hello", "Bonjour", "स्वागत हे", "Ciao", "Olá", "おい", "Hallå", "Guten tag", "Hallo", "স্বাগতম"];

  return (
    <WelcomeLoader
      greetings={greetings}
      title='Make'
      emphasizedText='it'
      finalText='Happen'
    />
  );
}
