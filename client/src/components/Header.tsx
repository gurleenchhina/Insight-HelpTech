import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const Header = () => {
  return (
    <header className="bg-primary text-white py-3 px-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <h1 className="text-xl font-bold cursor-pointer hover:text-opacity-80 transition-opacity">
            HelpTech
          </h1>
        </Link>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary-dark text-white">
          <span className="material-icons">account_circle</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
