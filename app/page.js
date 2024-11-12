"use client"

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { CopyIcon, XIcon, RotateCcwIcon, RotateCwIcon, CloudUploadIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [blackLevel, setBlackLevel] = useState(120);
  const [whiteLevel, setWhiteLevel] = useState(130);
  const [gamma, setGamma] = useState(1.0);
  const [saturation, setSaturation] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const canvasRef = useRef(null);
  const originalImageData = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");

          // Set canvas dimensions
          const CANVAS_WIDTH = 800;
          const CANVAS_HEIGHT = 600;
          canvas.width = CANVAS_WIDTH;
          canvas.height = CANVAS_HEIGHT;

          // Scale the image to fit the canvas
          const scale = Math.min(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height);
          const offsetX = (CANVAS_WIDTH - img.width * scale) / 2;
          const offsetY = (CANVAS_HEIGHT - img.height * scale) / 2;
          ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          ctx.drawImage(img, offsetX, offsetY, img.width * scale, img.height * scale);

          // Store the original image data
          originalImageData.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
          setImageLoaded(true);
          applyAdjustments();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const applyAdjustments = () => {
    if (!originalImageData.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageData = new ImageData(
      new Uint8ClampedArray(originalImageData.current.data),
      originalImageData.current.width,
      originalImageData.current.height
    );
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Calculate the grayscale average for the pixel
      const average = (data[i] + data[i + 1] + data[i + 2]) / 3;

      // Apply saturation adjustment
      for (let j = 0; j < 3; j++) {
        // Blend each color channel towards the grayscale average based on saturation
        data[i + j] = average + (data[i + j] - average) * (saturation / 100);
      }

      // Apply black and white level adjustments and gamma correction
      for (let j = 0; j < 3; j++) {
        let value = data[i + j];
        value = ((value - blackLevel) * (255 / (whiteLevel - blackLevel))); // Black/white level adjustment
        value = 255 * Math.pow(value / 255, gamma); // Gamma correction

        // Clamp values between 0 and 255
        data[i + j] = Math.min(255, Math.max(0, value));
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const saveImage = () => {
    if(!imageLoaded) return;

    const canvas = canvasRef.current;
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = "edited_image.png";
    link.click();
  };
  useEffect(() => {
    applyAdjustments();
  });

  return (
    <div className="flex flex-col md:flex-row items-center justify-between h-screen overflow-hidden">
      {/* Image viewer */}
      <div className="bg-gray-400/10 w-9/12 h-screen">
        <div className="flex items-center justify-between px-1">
          <button onClick={() => setImageLoaded(false)} className="cursor-pointer opacity-40 hover:opacity-100 transition-all rounded-full p-1">
            <XIcon className="w-5 inline" />
          </button>

          <div>
            <button className=" cursor-pointer opacity-40 text-muted-foreground hover:opacity-100 transition-all rounded-full p-1">
              <RotateCcwIcon className="w-5 inline" />
            </button>
            <button className=" cursor-pointer opacity-40 text-muted-foreground hover:opacity-100 transition-all rounded-full p-1">
              <RotateCwIcon className="w-5 inline" />
            </button>
          </div>
        </div>

        <div className="h-full w-full flex items-center justify-center pb-20">
          <canvas ref={canvasRef} className={`${!imageLoaded && "hidden"} p-10 px-20 rounded-md cursor-pointer`} />
          {!imageLoaded && (
            <div className="border mb-20 p-10 px-20 rounded-md flex flex-col gap-2 items-center justify-center cursor-pointer">
              <CloudUploadIcon className="text-muted-foreground h-20 w-20" />
              <p className="text-muted-foreground text-center">Drag and drop an image here or click to upload</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          )}
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

                {/* Black Level Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>Black Level</span>
                    <span>{blackLevel}</span>
                  </div>
                  <Slider
                    value={[blackLevel]}
                    max={255}
                    step={1}
                    onValueChange={([value]) => {
                      setBlackLevel(value);
                      // applyAdjustments();
                    }}
                  />
                </div>

                {/* White Level Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>White Level</span>
                    <span>{whiteLevel}</span>
                  </div>
                  <Slider
                    value={[whiteLevel]}
                    max={255}
                    step={1}
                    onValueChange={([value]) => {
                      setWhiteLevel(value);
                    }}
                  />
                </div>


                {/* Gamma Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>Gamma (Midtones)</span>
                    <span>{gamma.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[gamma]}
                    min={0.1}
                    max={3.0}
                    step={0.1}
                    onValueChange={([value]) => {
                      setGamma(value);
                    }}
                  />
                </div>

                {/* Saturation Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>Saturation</span>
                    <span>{saturation}</span>
                  </div>
                  <Slider
                    value={[saturation]}
                    min={0}
                    max={200}
                    step={1}
                    onValueChange={([value]) => {
                      setSaturation(value);
                    }}
                  />
                </div>

              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button onClick={() => saveImage()}>Extract Text from Image</Button>

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
    </div>
  );
}
