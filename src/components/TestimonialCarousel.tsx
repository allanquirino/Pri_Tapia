import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Shield, 
  Camera,
  MoreHorizontal,
  Star,
  Quote
} from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";

interface Testimonial {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  timestamp: string;
  text: string;
  expandedText: string;
  photos?: string[];
  likes: number;
  isLiked: boolean;
  isVerified: boolean;
  service: string;
  location?: string;
}

interface TestimonialCarouselProps {
  title?: string;
  subtitle?: string;
  showStats?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({
  title = "Histórias de Adoção PriTapia",
  subtitle = "Relatos reais de resgates e lares amorosos",
  showStats = true,
  autoPlay = true,
  autoPlayInterval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const [hoveredTestimonial, setHoveredTestimonial] = useState<string | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  // Depoimentos voltados a adoção e proteção animal
  const testimonials: Testimonial[] = [
    {
      id: "a1",
      name: "Carlos P.",
      avatar: "/api/placeholder/60/60",
      rating: 5,
      reviewCount: 1,
      timestamp: "2024-10-13",
      text: "Adotamos a Luna através da PriTapia. Processo responsável e transparente.",
      expandedText: "A Luna foi resgatada filhote. Após cuidados e vacinação, encontramos nosso lar através da PriTapia.",
      likes: 3,
      isLiked: false,
      isVerified: true,
      service: "Adoção",
      location: "São Paulo, SP"
    },
    {
      id: "a2",
      name: "Marina R.",
      avatar: "/api/placeholder/60/60",
      rating: 5,
      reviewCount: 2,
      timestamp: "2024-09-02",
      text: "Campanha de castração impecável. Organização e carinho com os animais.",
      expandedText: "Levamos nosso gato Thor para castrar. Equipe acolhedora, tudo gratuito e com orientação pós-operatória.",
      likes: 5,
      isLiked: false,
      isVerified: true,
      service: "Castração",
      location: "Guarulhos, SP"
    },
    {
      id: "a3",
      name: "Renato L.",
      avatar: "/api/placeholder/60/60",
      rating: 5,
      reviewCount: 3,
      timestamp: "2024-07-18",
      text: "Resgate do Simba foi emocionante. Hoje ele está saudável e feliz.",
      expandedText: "PriTapia resgatou o Simba em situação de risco. Após tratamento, pudemos adotá-lo.",
      likes: 4,
      isLiked: false,
      isVerified: true,
      service: "Resgate",
      location: "São Paulo, SP"
    }
  ];

  const totalReviews = testimonials.reduce((acc, t) => acc + t.reviewCount, 0);
  const averageRating = testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "há 1 dia";
    if (diffDays < 7) return `há ${diffDays} dias`;
    if (diffDays < 30) return `há ${Math.ceil(diffDays / 7)} semanas`;
    return `há ${Math.ceil(diffDays / 30)} meses`;
  };

  const handleLike = useCallback((testimonialId: string) => {
    // In a real app, this would update the backend
    console.log(`Liked testimonial: ${testimonialId}`);
  }, []);

  const handleExpandText = useCallback((testimonialId: string) => {
    // In a real app, this would expand the text
    console.log(`Expanded text for testimonial: ${testimonialId}`);
  }, []);

  const handleGoToSlide = useCallback((index: number) => {
    if (carouselApi) {
      carouselApi.scrollTo(index);
      setCurrentIndex(index);
    }
  }, [carouselApi]);

  const StarRating = ({ rating, interactive = false, onRatingChange }: { 
    rating: number; 
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
  }) => {
    const [hoveredRating, setHoveredRating] = useState(0);

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(star)}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
            className={`transition-all duration-200 ${
              interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
            } ${
              star <= (hoveredRating || rating)
                ? 'text-yellow-400 drop-shadow-sm'
                : 'text-gray-300'
            }`}
          >
            <Star 
              className="h-4 w-4" 
              fill={star <= (hoveredRating || rating) ? 'currentColor' : 'none'}
            />
          </button>
        ))}
        <span className="text-sm text-muted-foreground ml-2">({rating}/5)</span>
      </div>
    );
  };

  const PhotoLightbox = ({ photos, testimonialId }: { photos: string[]; testimonialId: string }) => {
    const [selectedPhoto, setSelectedPhoto] = useState(0);

    return (
      <Dialog>
        <div className="flex gap-2 mt-3">
          {photos.map((photo, index) => (
            <DialogTrigger key={index} asChild>
              <div 
                className="relative cursor-pointer group"
                onClick={() => setSelectedPhoto(index)}
              >
                <img
                  src={photo}
                  alt={`Foto do resultado ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border-2 border-muted hover:border-primary/50 transition-colors group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
                  <Camera className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </DialogTrigger>
          ))}
        </div>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <img
            src={photos[selectedPhoto]}
            alt={`Resultado ${selectedPhoto + 1}`}
            className="w-full h-full object-contain"
          />
        </DialogContent>
      </Dialog>
    );
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || !carouselApi) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % testimonials.length;
      carouselApi.scrollTo(nextIndex);
      setCurrentIndex(nextIndex);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, carouselApi, currentIndex, autoPlayInterval, testimonials.length]);

  // Handle carousel events
  useEffect(() => {
    if (!carouselApi) return;

    const handleSelect = (api: CarouselApi) => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    carouselApi.on("select", handleSelect);
    handleSelect(carouselApi);

    return () => {
      carouselApi.off("select", handleSelect);
    };
  }, [carouselApi]);

  return (
    <section className="py-20 bg-background" aria-labelledby="testimonials-heading">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 
            id="testimonials-heading"
            className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Statistics */}
        {showStats && (
          <div className="flex justify-center mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
              <div className="text-center p-6 bg-muted/30 rounded-xl backdrop-blur-sm border border-border/20">
                <div className="text-3xl font-bold text-primary mb-4">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-8 w-8 ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill={star <= Math.round(averageRating) ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">Avaliação média</p>
              </div>
              
              <div className="text-center p-6 bg-muted/30 rounded-xl backdrop-blur-sm border border-border/20">
                <div className="text-3xl font-bold text-primary mb-2">
                  {totalReviews.toLocaleString('pt-BR')}
                </div>
                <p className="text-sm text-muted-foreground">Total de avaliações</p>
              </div>
              
              <div className="text-center p-6 bg-muted/30 rounded-xl backdrop-blur-sm border border-border/20">
                <div className="text-3xl font-bold text-primary mb-2">
                  {testimonials.length}
                </div>
                <p className="text-sm text-muted-foreground">Depoimentos recentes</p>
              </div>
            </div>
          </div>
        )}

        {/* Carousel */}
        <div 
          className="max-w-6xl mx-auto"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(autoPlay)}
        >
          <Carousel
            className="w-full"
            setApi={setCarouselApi}
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                  <Card 
                    className="h-full hover:shadow-xl transition-all duration-300 border border-border/40 hover:border-primary/30 group"
                    onMouseEnter={() => setHoveredTestimonial(testimonial.id)}
                    onMouseLeave={() => setHoveredTestimonial(null)}
                  >
                    <CardContent className="p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                            <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold">
                              {testimonial.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                {testimonial.name}
                              </h3>
                              {testimonial.isVerified && (
                                <Shield className="h-4 w-4 text-green-500" aria-label="Cliente verificada" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="secondary" className="text-xs">
                                #{testimonial.reviewCount} avaliações
                              </Badge>
                              <span>•</span>
                              <span>{formatTimestamp(testimonial.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Service Badge */}
                      <Badge variant="outline" className="w-fit bg-primary/5 border-primary/20">
                        {testimonial.service}
                      </Badge>

                      {/* Rating */}
                      <StarRating rating={testimonial.rating} />

                      {/* Review Text */}
                      <div className="space-y-3">
                        <div className="relative">
                          <Quote className="absolute -top-1 -left-1 h-4 w-4 text-primary/30" />
                          <p className="text-muted-foreground italic pl-4 leading-relaxed">
                            "{testimonial.text}"
                          </p>
                        </div>
                        
                        {testimonial.text !== testimonial.expandedText && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => handleExpandText(testimonial.id)}
                            className="p-0 h-auto text-primary hover:text-primary/80"
                          >
                            Ver mais
                          </Button>
                        )}
                      </div>

                      {/* Photos */}
                      {testimonial.photos && testimonial.photos.length > 0 && (
                        <PhotoLightbox photos={testimonial.photos} testimonialId={testimonial.id} />
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/20">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(testimonial.id)}
                            className={`gap-2 h-8 px-3 transition-all duration-200 ${
                              testimonial.isLiked 
                                ? 'text-red-500 hover:text-red-600' 
                                : 'text-muted-foreground hover:text-red-500'
                            }`}
                          >
                            <Heart 
                              className={`h-4 w-4 ${testimonial.isLiked ? 'fill-current' : ''}`} 
                            />
                            <span className="text-xs">{testimonial.likes}</span>
                          </Button>
                          
                          {testimonial.location && (
                            <div className="text-xs text-muted-foreground">
                              📍 {testimonial.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>

          {/* Pagination Indicators */}
          <div className="flex justify-center mt-8 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => handleGoToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-8 bg-primary' 
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Ir para depoimento ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
