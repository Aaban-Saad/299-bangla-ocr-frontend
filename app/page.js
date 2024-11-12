"use client"

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";
import { XIcon } from "lucide-react";
import { GridIcon } from "lucide-react";
import { RotateCcwIcon } from "lucide-react";
import { RotateCwIcon } from "lucide-react";
import { useState } from "react";
import { CloudUploadIcon } from "lucide-react";


export default function Home() {
  const [showGrid, setShowGrid] = useState(false);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between h-screen overflow-hidden">
      {/* Grid */}
      {showGrid && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-9/12 h-full grid grid-cols-3 grid-rows-3 border-opacity-0">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="border border-muted-foreground/50"></div>
            ))}
          </div>
        </div>
      )}

      {/* Image viewer */}
      <div className="bg-gray-400/10 w-9/12 h-screen">
        <div className="flex items-center justify-between px-1">
          <button className="cursor-pointer opacity-40 hover:opacity-100 transition-all rounded-full p-1">
            <XIcon className="w-5 inline" />
          </button>

          <div>
            <button onClick={() => setShowGrid(!showGrid)} className=" cursor-pointer opacity-40 text-muted-foreground hover:opacity-100 transition-all rounded-full p-1">
              <GridIcon className="w-5 inline" />
            </button>
            <button className=" cursor-pointer opacity-40 text-muted-foreground hover:opacity-100 transition-all rounded-full p-1">
              <RotateCcwIcon className="w-5 inline" />
            </button>
            <button className=" cursor-pointer opacity-40 text-muted-foreground hover:opacity-100 transition-all rounded-full p-1">
              <RotateCwIcon className="w-5 inline" />
            </button>
          </div>
        </div>

        <div className="h-full w-full flex items-center justify-center">
          <div className="border mb-20 p-10 px-20 rounded-md flex flex-col gap-2 items-center justify-center cursor-pointer">
            <CloudUploadIcon className="text-muted-foreground h-20 w-20"/>
            <p className="text-muted-foreground text-center">
              Drag and drop an image here
            </p>
          </div>
        </div>

      </div>

      {/* Adjustment Sliders and Output */}
      <ScrollArea className="h-screen w-3/12">
        <div className="flex flex-col gap-4 p-5 h-screen">
          <h2 className="font-bold text-sm">Edit</h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Adjustments</AccordionTrigger>
              <AccordionContent className="py-5 space-y-5">
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>Saturation</span>
                    <span>.5</span>
                  </div>
                  <Slider defaultValue={[33]} max={100} step={1} />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>Highlights</span>
                    <span>12</span>
                  </div>
                  <Slider defaultValue={[33]} max={100} step={1} />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>Shadows</span>
                    <span>.534</span>
                  </div>
                  <Slider defaultValue={[33]} max={100} step={1} />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>Rotation</span>
                    <span>0</span>
                  </div>
                  <Slider defaultValue={[33]} max={100} step={1} />
                </div>

              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button className="">Extract Text from Image</Button>

          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm">Output</h2>
            <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm hover:bg-muted p-1 rounded-xl cursor-pointer">
              <span>Copy</span>
              <CopyIcon className="w-4" />
            </div>
          </div>
          <div className="h-full bg-muted rounded-md">

          </div>
        </div>
      </ScrollArea>
    </div >
  );
}
