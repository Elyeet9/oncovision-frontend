export default function Footer() {
  return (
    <footer className="navbar-custom py-3 mt-auto shadow-inner">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="text-white text-sm">
            OncoVision &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </footer>
  );
}