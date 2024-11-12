import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


export default function Home() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between h-screen overflow-hidden">
      {/* Image viewer */}
      <div className="bg-gray-400/10 w-9/12 h-screen">
        hello
      </div>

      {/* Adjustment Sliders and Output */}
      <ScrollArea className="h-screen w-3/12 p-5">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Adjustments</AccordionTrigger>
            <AccordionContent>
              Yes. It adheres to the WAI-ARIA design pattern.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
    </div>
  );
}
