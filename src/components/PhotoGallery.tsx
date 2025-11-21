import { useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const images = [
  { src: "galeria/Pri (1).jpeg", alt: "Pri (1)" },
  { src: "galeria/Pri (2).jpeg", alt: "Pri (2)" },
  { src: "galeria/Pri (3).jpeg", alt: "Pri (3)" },
  { src: "galeria/Pri (4).jpeg", alt: "Pri (4)" },
  { src: "galeria/Pri (5).jpeg", alt: "Pri (5)" },
  { src: "galeria/Pri (6).jpeg", alt: "Pri (6)" },
  { src: "galeria/Pri (7).jpeg", alt: "Pri (7)" },
  { src: "galeria/Pri (8).jpeg", alt: "Pri (8)" },
  { src: "galeria/Pri (9).jpeg", alt: "Pri (9)" },
  { src: "galeria/Pri (10).jpeg", alt: "Pri (10)" },
  { src: "galeria/Pri (11).jpeg", alt: "Pri (11)" },
  { src: "galeria/Pri (12).jpeg", alt: "Pri (12)" },
  { src: "galeria/Pri (13).jpeg", alt: "Pri (13)" },
  { src: "galeria/Pri (14).jpeg", alt: "Pri (14)" },
  { src: "galeria/Pri (15).jpeg", alt: "Pri (15)" },
  { src: "galeria/Pri (16).jpeg", alt: "Pri (16)" },
  { src: "galeria/Pri (17).jpeg", alt: "Pri (17)" },
  { src: "galeria/Pri (18).jpeg", alt: "Pri (18)" },
  { src: "galeria/Pri (19).jpeg", alt: "Pri (19)" },
  { src: "galeria/Pri (20).jpeg", alt: "Pri (20)" },
  { src: "galeria/Pri (21).jpeg", alt: "Pri (21)" },
  { src: "galeria/Pri (22).jpeg", alt: "Pri (22)" },
  { src: "galeria/Pri (23).jpeg", alt: "Pri (23)" },
  { src: "galeria/Pri (24).jpeg", alt: "Pri (24)" },
  { src: "galeria/Pri (25).jpeg", alt: "Pri (25)" },
  { src: "galeria/Pri (26).jpeg", alt: "Pri (26)" },
];

const PhotoGallery = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const openModal = (index: number) => {
    setSelectedIndex(index);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") nextImage();
    else if (e.key === "ArrowLeft") prevImage();
    else if (e.key === "Escape") closeModal();
  };

  return (
    <div className="w-full">
      <Carousel
        opts={{ loop: true }}
        plugins={[Autoplay({ delay: 3000, stopOnInteraction: false })]}
        className="w-full"
      >
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index} className="basis-1/3">
              <div className="p-1 flex justify-center items-center h-64">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  loading="lazy"
                  onClick={() => openModal(index)}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl w-full h-full max-h-screen p-0" onKeyDown={handleKeyDown}>
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={closeModal}
            >
              <X className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 z-10 text-white hover:bg-white/20"
              onClick={prevImage}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 z-10 text-white hover:bg-white/20"
              onClick={nextImage}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            <img
              src={images[selectedIndex].src}
              alt={images[selectedIndex].alt}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotoGallery;