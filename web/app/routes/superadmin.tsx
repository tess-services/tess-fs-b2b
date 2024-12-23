import { Menu, UserCircle } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router";
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
import { isSuperAdmin } from "~/lib/isSuperAdmin";
import type { Route } from "./+types/superadmin";

const isMenuActive = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm font-medium relative ${isActive ? "border-b-2 border-b-indigo-500 " : "text-muted-foreground"
  }`;

export async function loader({ context }: Route.LoaderArgs) {
  const { user } = context.cloudflare.var;

  if (!user || !isSuperAdmin(user.role)) {
    throw new Error("Unauthorized");
  }

  return null;
}

export default function ProviderLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
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
                  <NavLink
                    to="/superadmin/organizations"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={isMenuActive}
                  >
                    Organizations
                  </NavLink>
                  <NavLink to="/sign-out" className="w-full">
                    Sign out
                  </NavLink>
                  {/* Add more mobile menu items */}
                </nav>
              </SheetContent>
            </Sheet>
            {/* Main Navigation */}

            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavLink
                    to="/superadmin/organizations"
                    className={isMenuActive}
                  >
                    Organizations
                  </NavLink>
                </NavigationMenuItem>
                {/* Add more menu items as needed */}
              </NavigationMenuList>
            </NavigationMenu>
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
      <main className="flex-1 sm:mx-auto sm:w-full md:max-w-7xl lg:w-full md:px-8 lg:px-10 py-6">
        <Outlet />
      </main>
    </div>
  );
}
