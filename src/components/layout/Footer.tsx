const Footer = () => {
  return (
    <footer style={{ backgroundColor: "#FFFFFF" }}>
      <div className="container mx-auto px-4 py-8 relative">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-sm mr-2" style={{ color: "#2E8B57" }}>Site desenvolvido por</span>
            <img src="/wexio.png" alt="Wexio" className="h-8 w-auto" />
          </div>
          <div></div> {/* Empty div for balance */}
        </div>
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <p className="text-sm text-center" style={{ color: "#2E8B57" }}>
            © {new Date().getFullYear()} PriTapia, site em desenvolvimento
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
