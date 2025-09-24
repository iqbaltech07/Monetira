import { CTA } from "~/components/landing-page/Cta";
import { FAQ } from "~/components/landing-page/Faq";
import { Features } from "~/components/landing-page/Features";
import { Footer } from "~/components/landing-page/Footer";
import { Header } from "~/components/landing-page/Header";
import { Hero } from "~/components/landing-page/Hero";
import { HowItWorks } from "~/components/landing-page/HowItWorks";
import { WhyMonetira } from "~/components/landing-page/WhyMonetira";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col min-h-screen bg-white dark:bg-gray-900 font-poppins">
      <Header />
      <div className="flex-1 py-20">
        <Hero />
        <WhyMonetira />
        <HowItWorks />
        <Features />
        <FAQ />
        <CTA />
      </div>
      <Footer />
    </div>
  );
}
