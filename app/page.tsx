import LandingPage from "@/components/landing/landing-page";

// Runs before first paint: lets CSS hold the hero until its entrance animation starts,
// but only for visitors who have scripting and have not asked for reduced motion.
const motionFlag = `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("mk-js")}catch(e){}`;

export default function Home() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: motionFlag }} />
      <LandingPage />
    </>
  );
}
