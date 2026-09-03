import React from 'react';
import {
  Bot,
  ShieldCheck,
  Radio,
  Calendar,
  History,
  X,
  Menu,
  Search,
  SearchX,
  Trash2,
  LogIn,
  LogOut,
  Circle,
  Square,
  Pause,
  Play,
  Clock,
  Monitor,
  Languages,
  Type,
  Link,
  ExternalLink,
  Copy,
  Check,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Keyboard,
  Lock,
  Star,
  Sparkles,
  Cpu,
  Save,
  Plus,
  FileText,
  Code,
  Users,
  UserPlus,
  Eye,
  EyeOff,
  Mic,
  Subtitles,
  Wifi,
  Zap,
  ChevronsUpDown,
  ArrowDown,
  ArrowRight,
  ListOrdered,
  AlignLeft,
  RotateCcw,
  Video,
  RefreshCw,
  Server,
  AudioLines,
  AudioWaveform,
  Volume2,
  MailCheck,
  Mail,
  DoorOpen,
  Globe,
  Gem,
  Loader2,
  CloudUpload,
  Unlink,
  CloudCog,
  HardDriveUpload,
  CloudOff,
  FlaskConical,
  Verified,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface MaterialIconProps {
  icon: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  filled?: boolean;
  className?: string;
}

// Map pixel sizes for each size variant
const sizeMap: Record<string, number> = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 22,
  xl: 26,
  '2xl': 30,
};

// Comprehensive mapping from Material Symbols names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  // Bot & Admin
  smart_toy: Bot,
  admin_panel_settings: ShieldCheck,

  // Navigation & Layout
  radio: Radio,
  calendar_month: Calendar,
  calendar_today: Calendar,
  event: Calendar,
  history: History,
  close: X,
  menu: Menu,

  // Search
  search: Search,
  search_off: SearchX,

  // Actions
  delete: Trash2,
  delete_sweep: Trash2,
  login: LogIn,
  logout: LogOut,
  save: Save,
  add: Plus,
  refresh: RefreshCw,

  // Media Controls
  fiber_manual_record: Circle,
  stop: Square,
  pause: Pause,
  pause_circle: Pause,
  play_arrow: Play,

  // Time
  timer: Clock,
  schedule: Clock,

  // Input Labels
  devices: Monitor,
  translate: Languages,
  language: Globe,
  title: Type,
  link: Link,
  open_in_new: ExternalLink,
  content_copy: Copy,

  // Status
  check: Check,
  check_circle: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,

  // UI Elements
  keyboard: Keyboard,
  vpn_lock: Lock,
  unfold_more: ChevronsUpDown,
  arrow_downward: ArrowDown,
  arrow_forward: ArrowRight,

  // Feature Icons
  auto_awesome: Sparkles,
  star: Star,
  memory: Cpu,
  description: FileText,
  code: Code,

  // People
  group: Users,
  groups: Users,
  person_add: UserPlus,
  visibility: Eye,
  visibility_off: EyeOff,

  // Auth & Security
  mail: Mail,
  lock: Lock,

  // Audio & Voice
  settings_voice: Mic,
  graphic_eq: AudioLines,
  waveform: AudioWaveform,
  equalizer: AudioLines,
  audio: AudioLines,
  mic: Mic,
  volume_up: Volume2,
  subtitles: Subtitles,
  record_voice_over: AudioLines,
  wifi: Wifi,
  bolt: Zap,
  high_quality: Gem,

  // Lists & Text
  format_list_numbered: ListOrdered,
  text_fields: AlignLeft,
  restart_alt: RotateCcw,

  // Cloud & Drive
  cloud_done: Verified,
  cloud_upload: CloudUpload,
  cloud_sync: CloudCog,
  add_to_drive: HardDriveUpload,
  link_off: Unlink,
  cloud_off: CloudOff,
  sync: RefreshCw,

  // Video
  video_call: Video,
  videocam: Video,

  // Server & Admin
  dns: Server,
  mark_email_read: MailCheck,
  meeting_room: DoorOpen,

  // Testing & Science
  science: FlaskConical,

  // Loading
  progress_activity: Loader2,
};

/**
 * Lucide Icons wrapper — drop-in replacement for Material Symbols.
 * Maps Material icon names to modern Lucide SVG icons.
 *
 * @example <MaterialIcon icon="smart_toy" size="md" />
 * @example <MaterialIcon icon="fiber_manual_record" filled className="text-red-500" />
 */
export const MaterialIcon: React.FC<MaterialIconProps> = ({
  icon,
  size = 'md',
  filled = false,
  className = '',
}) => {
  const IconComponent = iconMap[icon];
  const pixelSize = sizeMap[size] || 18;

  if (!IconComponent) {
    // Fallback: render icon name as text (debugging aid)
    console.warn(`[MaterialIcon] No Lucide mapping for: "${icon}"`);
    return (
      <span
        className={`inline-flex items-center justify-center ${className}`}
        style={{ width: pixelSize, height: pixelSize, fontSize: pixelSize * 0.6 }}
        aria-hidden="true"
      >
        ?
      </span>
    );
  }

  // Special handling for specific icons that look better filled
  const shouldFill = filled && (icon === 'fiber_manual_record' || icon === 'star' || icon === 'stop');

  return (
    <IconComponent
      size={pixelSize}
      strokeWidth={2}
      fill={shouldFill ? 'currentColor' : 'none'}
      className={`inline-flex shrink-0 ${className}`}
      aria-hidden="true"
    />
  );
};
