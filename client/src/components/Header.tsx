import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-white py-3 px-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-600">HelpTech</h1>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 text-gray-700">
          <span className="material-icons">account_circle</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
