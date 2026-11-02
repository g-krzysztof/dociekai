import {
  ArrowLeftRight,
  Blocks,
  Box,
  CheckCircle2,
  Clock,
  Coins,
  Compass,
  FileText,
  Globe,
  Grid3x3,
  HardDrive,
  Hash,
  Leaf,
  Lightbulb,
  ListChecks,
  Palette,
  PenLine,
  Percent,
  PieChart,
  Puzzle,
  Ruler,
  Scale,
  Scissors,
  Shapes,
  Sparkles,
  Square,
  Target,
  Trophy,
  Workflow,
  Fish,
  Flag,
  Flame,
  Hourglass,
  Landmark,
  Pyramid,
  Search,
  Shield,
  type LucideIcon,
} from 'lucide-react';

/**
 * Ikony używane przez moduły kursów — mapowane z nazw w `curriculum.ts`
 * (matematyka, informatyka i historia mają wspólną pulę). Nieznana nazwa spada na `Hash`.
 */
const ICONS: Record<string, LucideIcon> = {
  ArrowLeftRight,
  Blocks,
  Box,
  CheckCircle2,
  Clock,
  Coins,
  Compass,
  FileText,
  Globe,
  Grid3x3,
  HardDrive,
  Hash,
  Leaf,
  Lightbulb,
  ListChecks,
  Palette,
  PenLine,
  Percent,
  PieChart,
  Puzzle,
  Ruler,
  Scale,
  Scissors,
  Shapes,
  Sparkles,
  Square,
  Target,
  Trophy,
  Workflow,
  Fish,
  Flag,
  Flame,
  Hourglass,
  Landmark,
  Pyramid,
  Search,
  Shield,
};

interface ModuleIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ModuleIcon({ name, className, style }: ModuleIconProps) {
  const Icon = ICONS[name] ?? Hash;
  return <Icon className={className} style={style} aria-hidden />;
}
