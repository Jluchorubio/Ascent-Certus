const Footer = () => (
  <footer className="border-t border-gray-100 bg-white">
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
      <span>© {new Date().getFullYear()} Preicfes.net</span>
      <span className="mt-2 md:mt-0">Evaluaciones adaptativas para instituciones educativas</span>
    </div>
  </footer>
);

export default Footer;
