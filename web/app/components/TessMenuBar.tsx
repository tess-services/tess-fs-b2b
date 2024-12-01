import { NavLink } from "@remix-run/react";
import { Menu, UserCircle } from "lucide-react";
import { useState } from "react";
import { ModeToggle } from "~/components/mode-toggle";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "~/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";

type MenuBarProps = {
  menuItemMeta: {
    url: string;
    label: string;
  }[];
};

const isMenuActive = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm font-medium relative ${
    isActive ? "border-b-2 border-b-indigo-500 " : "text-muted-foreground"
  }`;

export const TessMenuBar = ({ menuItemMeta }: MenuBarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[280px]">
              <nav className="flex flex-col gap-4">
                {menuItemMeta.map((item) => (
                  <NavLink
                    key={item.url}
                    to={item.url}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={isMenuActive}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          {/* Main Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {menuItemMeta.map((item) => (
                <NavigationMenuItem key={item.url}>
                  <NavLink to={item.url} className={isMenuActive}>
                    {item.label}
                  </NavLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Profile Dropdown */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <UserCircle className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <ModeToggle />
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/user/profile" className="w-full">
                    Profile
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <NavLink to="/sign-out" className="w-full">
                    Sign out
                  </NavLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
