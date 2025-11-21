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

        {/* About Section */}
        <section id="sobre" className="py-20" style={{ backgroundColor: "#f0fdf4" }}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#2E8B57" }}>
                  Sobre a PriTapia
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold" style={{ color: "#2E8B57" }}>Nossa Missão</h3>
                  <p className="text-green-700 text-lg">
                    Trabalhamos pelo bem-estar animal, promovendo ações de proteção, educação e castração para reduzir o abandono e incentivar a adoção responsável.
                  </p>
                  <p className="text-lg text-green-700">
                    Na nossa página do Instagram @pritapia, você acompanha campanhas, resgates e histórias de adoção que inspiram a comunidade.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-6 items-center">
                  <AnimatedPetSticker variant="heart" color="pink" size="md">
                    <div className="text-center">
                      <Heart className="h-8 w-8 mx-auto mb-2" style={{ color: "#2E8B57" }} />
                      <div className="text-2xl font-bold" style={{ color: "#2E8B57" }}>1200+</div>
                      <div className="text-sm text-green-600">Animais Ajudados</div>
                    </div>
                  </AnimatedPetSticker>
                  <AnimatedPetSticker variant="paw" color="blue" size="md">
                    <div className="text-center">
                      <PawPrint className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-800">800+</div>
                      <div className="text-sm text-green-600">Castrações</div>
                    </div>
                  </AnimatedPetSticker>
                  <AnimatedPetSticker variant="star" color="yellow" size="md">
                    <div className="text-center">
                      <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-800">300+</div>
                      <div className="text-sm text-green-600">Adoções</div>
                    </div>
                  </AnimatedPetSticker>
                  <AnimatedPetSticker variant="heart" color="purple" size="md">
                    <div className="text-center">
                      <Heart className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-800">5+</div>
                      <div className="text-sm text-green-600">Anos de Atuação</div>
                    </div>
                  </AnimatedPetSticker>
                </div>
              </div>
            </div>
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

        {/* Contact Section */}
        <section id="contato" className="py-20" style={{ backgroundColor: "#f0fdf4" }}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#2E8B57" }}>
                  Entre em Contato
                </h2>
                <p className="text-green-700 text-lg">
                  Estamos aqui para ajudar você e os animais
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-center">
                  <svg className="w-24 h-24 mx-auto mb-4" style={{ color: "#2E8B57" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-green-700">Preencha o formulário ao lado para nos enviar uma mensagem</p>
                </div>
                <div>
                  <form action="mailto:wexiosolucoes@gmail.com" method="post" encType="text/plain" className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-green-700">Nome</label>
                      <input type="text" id="name" name="name" required className="mt-1 block w-full px-3 py-2 border border-green-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-green-700">Email</label>
                      <input type="email" id="email" name="email" required className="mt-1 block w-full px-3 py-2 border border-green-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-green-700">Mensagem</label>
                      <textarea id="message" name="message" rows={4} required className="mt-1 block w-full px-3 py-2 border border-green-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"></textarea>
                    </div>
                    <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                      Enviar Mensagem
                    </button>
                  </form>
                </div>
              </div>

            </div>
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
