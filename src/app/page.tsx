import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingCTAs, ScrollProgress, SectionCounter } from "@/components/layout/ScrollUI";
import { RevealObserver } from "@/components/layout/RevealObserver";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Programs } from "@/components/sections/Programs";
import { Standard } from "@/components/sections/Standard";
import { Trainers } from "@/components/sections/Trainers";
import { Membership } from "@/components/sections/Membership";
import { Gallery } from "@/components/sections/Gallery";
import { Testimonials } from "@/components/sections/Testimonials";
import { Tools } from "@/components/sections/Tools";
import { Visit } from "@/components/sections/Visit";
import { Contact } from "@/components/sections/Contact";
import { site } from "@/config/site";

export default function Home() {
  return (
    <>
      {/* Page-load sequence (pure CSS, lifts automatically) */}
      <div className="loader" aria-hidden="true">
        <div className="flex flex-col items-center gap-4">
          <div className="loader__mark">
            <span className="display text-5xl tracking-[0.08em] text-metal sm:text-7xl">{site.brandMark}</span>
          </div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-mute">{site.brandSub}</p>
          <div className="loader__bar w-40" />
        </div>
      </div>

      <ScrollProgress />
      <Header />
      <SectionCounter />
      <main id="main">
        <Hero />
        <Suspense>
          <About />
        </Suspense>
        <Suspense>
          <Programs />
        </Suspense>
        <Suspense>
          <Standard />
        </Suspense>
        <Suspense>
          <Trainers />
        </Suspense>
        <Suspense>
          <Membership />
        </Suspense>
        <Suspense>
          <Gallery />
        </Suspense>
        <Suspense>
          <Testimonials />
        </Suspense>
        <Suspense>
          <Tools />
        </Suspense>
        <Suspense>
          <Visit />
        </Suspense>
        <Suspense>
          <Contact />
        </Suspense>
      </main>
      <Footer />
      <FloatingCTAs />
      <RevealObserver />
    </>
  );
}
