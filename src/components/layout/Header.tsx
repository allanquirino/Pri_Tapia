import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "INICIO", isRoute: true },
    { path: "https://www.instagram.com/pritapia", label: "INSTAGRAM", isExternal: true },
    { path: "#contato", label: "CONTATO" },
    { path: "#novidades", label: "NOVIDADES" },
    { path: "/registration", label: "CADASTRO", isRoute: true },
    { path: "/admin", label: "ADMINISTRAÇÃO", isRoute: true },
  ];

  const scrollToSection = (href: string) => {
    if (href === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b" style={{ borderColor: "#e5e7eb", backgroundColor: "#ffffff" }}>
      <div className="container mx-auto px-4">
        <div className="relative flex h-16 items-center justify-center">
           <div className="flex items-center gap-8">
             {/* Logo */}
             <Link to="/" className="flex items-center">
               <img src="/logo_novo.png" alt="PriTapia" className="h-14 w-30 rounded-full" />
             </Link>

             {/* Desktop Navigation */}
             <nav className="hidden md:flex items-center gap-4">
               {navItems.map((item) => (
                 item.isExternal ? (
                   <a key={item.path} href={item.path} target="_blank" rel="noopener noreferrer">
                     <Button variant="ghost" className="bg-[#d4edda] text-green-700 hover:text-green-800 hover:bg-green-100 transition-all duration-300 rounded-lg">
                       {item.label}
                     </Button>
                   </a>
                 ) : item.isRoute ? (
                   <Link key={item.path} to={item.path}>
                     <Button variant="ghost" className="bg-[#d4edda] text-green-700 hover:text-green-800 hover:bg-green-100 transition-all duration-300 rounded-lg">
                       {item.label}
                     </Button>
                   </Link>
                 ) : (
                   <Button key={item.path} variant="ghost" className="bg-[#d4edda] text-green-700 hover:text-green-800 hover:bg-green-100 transition-all duration-300 rounded-lg" onClick={() => scrollToSection(item.path)}>
                     {item.label}
                   </Button>
                 )
               ))}
             </nav>
           </div>

           {/* Mobile Menu Button */}
           <Button
             variant="ghost"
             size="icon"
             className="md:hidden absolute right-4"
             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
           >
             {mobileMenuOpen ? (
               <X className="h-5 w-5" />
             ) : (
               <Menu className="h-5 w-5" />
             )}
           </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t animate-in slide-in-from-top" style={{ borderColor: "#e5e7eb" }}>
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                item.isExternal ? (
                  <a key={item.path} href={item.path} target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button variant="ghost" className="w-full justify-start bg-[#d4edda] text-green-700 hover:text-green-800 hover:bg-green-100 transition-all duration-300 rounded-lg">
                      {item.label}
                    </Button>
                  </a>
                ) : item.isRoute ? (
                  <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button variant="ghost" className="w-full justify-start bg-[#d4edda] text-green-700 hover:text-green-800 hover:bg-green-100 transition-all duration-300 rounded-lg">
                      {item.label}
                    </Button>
                  </Link>
                ) : (
                  <Button key={item.path} variant="ghost" className="w-full justify-start bg-[#d4edda] text-green-700 hover:text-green-800 hover:bg-green-100 transition-all duration-300 rounded-lg" onClick={() => { scrollToSection(item.path); setMobileMenuOpen(false); }}>
                    {item.label}
                  </Button>
                )
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
