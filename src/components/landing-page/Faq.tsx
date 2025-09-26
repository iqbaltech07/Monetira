"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { FAQS } from "~/lib/constants";

export const FAQ = () => {
  return (
    <section id="faq" className="bg-primary/5 dark:bg-gray-950 py-20">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            Pertanyaan yang Sering Ditanyakan
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Masih ragu? Berikut beberapa hal yang sering ditanyakan pengguna.
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <Accordion type="single" collapsible className="space-y-4">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base sm:text-lg font-medium hover:text-primary text hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400">
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
