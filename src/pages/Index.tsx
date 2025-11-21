import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Instagram, Heart, PawPrint, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import NovidadesList from "@/components/NovidadesList";
import { AnimatedPetSticker } from "@/components/AnimatedPetSticker";
import PhotoGallery from "@/components/PhotoGallery";
import PetRegistrationForm from "@/components/PetRegistrationForm";

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fallbackSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="100%" height="100%" fill="#f4f4f5"/><circle cx="128" cy="128" r="96" fill="#86efac" stroke="#22c55e"/></svg>';
  const handleImgError: React.ReactEventHandler<HTMLImageElement> = (e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackSvg; };
  const withBase = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//,'')}`;

  return (
    <div className="min-h-screen flex flex-col page-transition">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32 min-h-screen flex items-center justify-center" style={{
          background: "linear-gradient(135deg,#ecfdf5,#ffffff)"
        }}>
          <div className="w-full px-4">
              <p className="text-xl md:text-3xl font-medium text-green-700 mb-8 mt-16 max-w-2xl mx-auto text-justify">
                <span className="text-xl md:text-3xl"><u>História:</u></span> <br /><span className="text-lg md:text-xl">Fundada em 2019, a PriTapia surgiu da paixão de um grupo de voluntários pela causa animal. Iniciamos com resgates emergenciais e hoje somos uma ONG consolidada, atuando em campanhas de castração, adoção responsável e educação comunitária.</span>
              </p>
              <p className="text-xl md:text-3xl font-medium text-green-700 mb-8 mt-16 max-w-2xl mx-auto text-justify">
                <span className="text-xl md:text-3xl"><u>Valores:</u></span> <br /><span className="text-lg md:text-xl">Compromisso com a vida animal, transparência em nossas ações, respeito à comunidade e dedicação à transformação social através do amor aos animais.</span>
              </p>
              <p className="text-xl md:text-3xl font-medium text-green-700 mb-8 mt-16 max-w-2xl mx-auto text-justify">
                <span className="text-xl md:text-3xl"><u>Missão:</u></span> <br /><span className="text-lg md:text-xl">Promovemos campanhas de castração, adoção responsável e ações de proteção animal. <br />Junte-se ao movimento e faça parte da transformação.</span>
              </p>
          </div>
        </section>

        {/* Galeria de Fotos */}
        <section id="apresentacao" className="py-20 bg-green-200">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#2E8B57" }}>
                Galeria de Fotos: Nossa História Visual
              </h2>
              <p className="text-lg max-w-3xl mx-auto" style={{ color: "#14532d" }}>
                Explore nossas ações através de imagens.
              </p>
            </div>
            <PhotoGallery />
          </div>
        </section>


        {/* News & Campaigns Section */}
        <section id="novidades" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#2E8B57" }}>
                Novidades e Campanhas
              </h2>
              <p className="text-green-700 text-lg">
                Atualizações sobre campanhas de castração e eventos
              </p>
            </div>
            <NovidadesList />
          </div>
        </section>

        {/* Pet Registration Section */}
        <section id="formulario" className="py-20" style={{ backgroundColor: "#f0fdf4" }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#2E8B57" }}>
                Cadastro de Animais
              </h2>
              <p className="text-green-700 text-lg max-w-2xl mx-auto">
                Cadastre seu pet na PriTapia e ajude-nos a oferecer os melhores cuidados e serviços para seu companheiro.
              </p>
            </div>
            <PetRegistrationForm />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden bg-green-200">
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center space-y-8 text-green-800">
              <h2 className="text-3xl md:text-4xl font-bold">
                Juntos Podemos Fazer a Diferença
              </h2>
              <p className="text-lg opacity-90">
                Ajude a transformar vidas com ações concretas de proteção e bem-estar animal.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
