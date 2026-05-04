import {
  Activity,
  Boxes,
  Calendar,
  CreditCard,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  Shield,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";

const iconMap = {
  activity: Activity,
  boxes: Boxes,
  calendar: Calendar,
  creditCard: CreditCard,
  fileText: FileText,
  layout: LayoutDashboard,
  package: Package,
  settings: Settings,
  shield: Shield,
  shoppingCart: ShoppingCart,
  sparkles: Sparkles,
  users: Users,
};

export function PresetIcon({ name = "sparkles", className }) {
  const Icon = iconMap[name] || Sparkles;
  return <Icon className={className} aria-hidden="true" />;
}
