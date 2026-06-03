import {
  Home,
  Sparkles,
  Mic,
  History,
  BarChart3,
  Layers,
  Coins,
  Settings,
} from "lucide-react";

export const sidebarNavItems = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "features", label: "Features", icon: Sparkles, path: "/#features" },
  { id: "practice", label: "Practice", icon: Mic, path: "/interview" },
  { id: "history", label: "History", icon: History, path: "/history" },
  { id: "analytics", label: "Analytics", icon: BarChart3, path: "/#analytics" },
  { id: "modes", label: "Interview Modes", icon: Layers, path: "/#modes" },
  { id: "credits", label: "Credits", icon: Coins, path: "/pricing" },
  { id: "settings", label: "Settings", icon: Settings, path: "/#settings" },
];

export const topNavLinks = [
  { label: "Home", path: "/" },
  { label: "Features", path: "/#features" },
  { label: "Practice", path: "/interview" },
  { label: "History", path: "/history" },
  { label: "Analytics", path: "/#analytics" },
  { label: "Pricing", path: "/pricing" },
];
