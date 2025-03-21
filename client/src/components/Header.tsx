import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-primary text-white py-3 px-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">HelpTech</h1>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary-dark text-white">
          <span className="material-icons">account_circle</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
