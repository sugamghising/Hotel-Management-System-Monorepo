import { createContext } from "react";

export const NavClickContext = createContext<(() => void) | undefined>(undefined);
