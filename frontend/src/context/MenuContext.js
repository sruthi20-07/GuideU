import { createContext } from "react";

export const MenuContext = createContext({
  menuOpen: false,
  toggleMenu: () => {}
});
