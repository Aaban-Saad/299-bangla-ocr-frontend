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
import { CopyIcon, XIcon, RotateCcwIcon, RotateCwIcon, CloudUploadIcon, GridIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [showGrid, setShowGrid] = useState(false);
  const [blackLevel, setBlackLevel] = useState(120);
  const [whiteLevel, setWhiteLevel] = useState(130);
  const [gamma, setGamma] = useState(1.0);
  const [saturation, setSaturation] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [microRotation, setMicroRotation] = useState(0);
  const [extractedText, setExtractedText] = useState("");

  const canvasRef = useRef(null);
  const originalImageData = useRef(null);
  const originalImage = useRef(null);

  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          originalImage.current = img;
          drawRotatedImage();
          setImageLoaded(true);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClose = () => {
    setImageLoaded(false);
    setBlackLevel(120);
    setWhiteLevel(130);
    setGamma(1.0);
    setSaturation(0);
    setRotation(0);
    setMicroRotation(0);
    setShowGrid(false);
    setExtractedText("");
  }

  const drawRotatedImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = originalImage.current;

    if (!img) return;

    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 550;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const scale = Math.min(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.rotate(((rotation * 90 + microRotation) * Math.PI) / 180);
    ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
    ctx.restore();

    originalImageData.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyAdjustments();
  };

  const rotateImage = (direction) => {
    setRotation((prevRotation) => (prevRotation + direction + 4) % 4);  // 1 = 90, 4 = 360
    setMicroRotation(0);
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
      const average = (data[i] + data[i + 1] + data[i + 2]) / 3;

      for (let j = 0; j < 3; j++) {
        data[i + j] = average + (data[i + j] - average) * (saturation / 100);
      }

      for (let j = 0; j < 3; j++) {
        let value = data[i + j];
        value = ((value - blackLevel) * (255 / (whiteLevel - blackLevel)));
        value = 255 * Math.pow(value / 255, gamma);
        data[i + j] = Math.min(255, Math.max(0, value));
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };


  const sendImageToServer = async () => {
    if (!imageLoaded) return;

    const canvas = canvasRef.current;

    // Convert canvas content to Blob (image file)
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append("image", blob, "image.png");

      try {
        const response = await fetch("http://127.0.0.1:5000/predict", {
          method: "POST",
          body: formData, // Send the image as multipart/form-data
        });

        if (!response.ok) {
          throw new Error("Failed to extract text.");
        }

        const data = await response.json();
        setExtractedText(data.predicted_text || "No text detected."); // Adjust key to match server response
        console.log(extractedText)
      } catch (error) {
        console.error(error);
        setExtractedText("Error extracting text.");
      }
    }, "image/png");
  };

  const copyToClipboard = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText)
        .then(() => {
          alert("Text copied to clipboard!");
        })
        .catch((err) => {
          console.error("Error copying text: ", err);
        });
    }
  };



  useEffect(() => {
    if (imageLoaded) {
      drawRotatedImage();
    }
  }, [rotation, microRotation, blackLevel, whiteLevel, gamma, saturation]);

  useEffect(() => {
    const card = cardRef.current
    if (card) {
      card.style.setProperty('--mouse-x', `${mousePosition.x}px`)
      card.style.setProperty('--mouse-y', `${mousePosition.y}px`)
    }
  }, [mousePosition])

  return (
    <div className="flex flex-col md:flex-row items-center justify-between h-screen overflow-hidden">
      {/* Grid */}
      {showGrid && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-9/12 h-full grid grid-cols-4 grid-rows-4 border-opacity-0">
            {Array.from({ length: 16 }).map((_, index) => (
              <div key={index} className="border border-muted-foreground/50"></div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-400/10 w-9/12 h-screen">
        <div className="flex items-center justify-between px-1">
          <button onClick={() => handleImageClose()} className="cursor-pointer opacity-40 hover:opacity-100 transition-all rounded-full p-1">
            <XIcon className="w-5 inline" />
          </button>

          <div>
            <button onClick={() => setShowGrid(!showGrid)} disabled={!imageLoaded} className=" cursor-pointer opacity-40 text-muted-foreground hover:opacity-100 transition-all rounded-full p-1">
              <GridIcon className="w-5 inline" />
            </button>
            <button onClick={() => rotateImage(-1)} disabled={!imageLoaded} className="cursor-pointer opacity-40 text-muted-foreground hover:opacity-100 transition-all rounded-full p-1">
              <RotateCcwIcon className="w-5 inline" />
            </button>
            <button onClick={() => rotateImage(1)} disabled={!imageLoaded} className="cursor-pointer opacity-40 text-muted-foreground hover:opacity-100 transition-all rounded-full p-1">
              <RotateCwIcon className="w-5 inline" />
            </button>
          </div>
        </div>

        <div className="h-full w-full flex items-center justify-center pb-20">
          <canvas ref={canvasRef} className={`${!imageLoaded && "hidden"}  px-20 rounded-md cursor-pointer`} />
          {!imageLoaded && (
            <div
              ref={cardRef}
              className={`relative w-[500px] h-52 mb-20 rounded-md cursor-pointer overflow-hidden transition-all duration-300 ${isHovered && 'glow'}`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onMouseMove={handleMouseMove}
            >
              <div className="absolute inset-[2px] hover:bg-gradient-to-r from-slate-500/10 to-slate-500/10 border rounded-md z-10 flex flex-col gap-2 items-center justify-center transition-all duration-500">
                <CloudUploadIcon className="text-muted-foreground h-20 w-20" />
                <p className="text-muted-foreground text-center">
                  Drag and drop an image here or click to upload
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <ScrollArea className="h-screen w-3/12">
        <div className="flex flex-col gap-4 p-5 h-screen">
          <h2 className="font-bold text-sm">Edit</h2>
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>Adjustments</AccordionTrigger>
              <AccordionContent className="py-5 space-y-5">

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

                {/* Rotation Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>Fine Rotation</span>
                    <span>{microRotation}°</span>
                  </div>
                  <Slider
                    value={[microRotation]}
                    min={-45}
                    max={45}
                    step={1}
                    onValueChange={([value]) => {
                      setMicroRotation(value);
                    }}
                  />
                </div>

              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button onClick={() => sendImageToServer()}>Extract Text from Image</Button>

          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm">Output</h2>
            <div onClick={() => copyToClipboard()} className="flex items-center justify-center gap-1 text-muted-foreground text-sm hover:bg-muted p-1 rounded-xl cursor-pointer">
              <span>Copy</span>
              <CopyIcon className="w-4" />
            </div>
          </div>
          <div className="h-full bg-muted rounded-md p-2">
            <pre>{extractedText}</pre>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}