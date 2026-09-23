"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { FAQS } from "~/lib/constants";
import { useGsapReveal } from "~/lib/gsap";

export const FAQ = () => {
  const containerRef = useGsapReveal<HTMLElement>({ stagger: 0.08, y: 15 });

  return (
    <section
      id="faq"
      ref={containerRef}
      className="bg-white dark:bg-slate-900 py-12 sm:py-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-12">
          <h2 className="gsap-fade-up text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Pertanyaan yang Sering Ditanyakan
          </h2>
          <p className="gsap-fade-up mt-2 sm:mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Masih ragu? Berikut beberapa jawaban untuk pertanyaan yang paling
            sering diajukan.
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={faq.question}
                value={`item-${i}`}
                className="gsap-fade-up rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <AccordionTrigger className="text-left text-sm sm:text-base font-semibold hover:text-blue-600 dark:hover:text-blue-400 hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 pb-4 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
