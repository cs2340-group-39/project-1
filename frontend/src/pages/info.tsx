import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "../index.css";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Link } from "@radix-ui/react-navigation-menu";
import { Home, Info } from "lucide-react";

function InfoPage(): JSX.Element {
  return (
    <>
      <header>
        <div className="container mx-auto px-4">
          <NavigationMenu>
            <NavigationMenuList className="flex items-center justify-between py-4">
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/"
                  className="text-xl font-bold flex items-center"
                >
                  <Home className="mr-2" size={24} />
                  Atlanta Food Finder
                </NavigationMenuLink>
              </NavigationMenuItem>
              <div className="flex items-center space-x-4">
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <Info className="mr-2" size={18} />
                    About
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 w-[200px]">
                      <li>
                        <NavigationMenuLink
                          href="/about/team"
                          className="block py-2 px-4"
                        >
                          Our Team
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button>
                    <Link href="/accounts/">Log In or Sign Up</Link>
                  </Button>
                </NavigationMenuItem>
              </div>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </header>
    </>
  );
}

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <StrictMode>
    <InfoPage />
  </StrictMode>
);
