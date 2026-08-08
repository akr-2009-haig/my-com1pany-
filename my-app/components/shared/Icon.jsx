'use client';

import {
  Activity, AlertTriangle, Award, BadgeCheck, Banknote, BarChart3, Bell, Bot, Box, Briefcase,
  Brush, Building2, CalendarDays, Camera, Check, CheckCircle2, ChevronDown, ChevronLeft,
  ChevronRight, ChevronUp, Clock, Cloud, Code, Code2, Cog, Coins, Compass, Contact, Cpu,
  CreditCard, Database, Diamond, Download, Eye, Facebook, FileText, Filter, Flame, Folder,
  Gauge, Gem, Gift, Github, Globe, GraduationCap, HandHeart, Handshake, HardDrive, Headphones,
  Heart, HeartPulse, Home, Image as ImageIcon, Inbox, Info, Instagram, Key, Landmark, Laptop,
  Layers, LayoutDashboard, LifeBuoy, Lightbulb, Link as LinkIcon, Linkedin, List, Lock, Mail,
  Map, MapPin, Megaphone, MessageCircle, MessageSquare, Monitor, Moon, MousePointerClick,
  Newspaper, Package, PaintBucket, Palette, PenTool, Phone, PieChart, Plane, Play, Plug, Plus,
  Printer, Puzzle, QrCode, Quote, Radio, Recycle, Repeat, Rocket, Ruler, Save, Scale, Search,
  Send, Server, Settings, Share2, Shield, ShieldCheck, ShoppingBag, ShoppingCart, Signal,
  Smartphone, Smile, Sparkles, Star, Store, Sun, Table, Tag, Target, Terminal, ThumbsUp, Timer,
  Trash2, TrendingUp, Trophy, Truck, Twitter, Umbrella, Users, Video, Wallet, Wand2, Watch,
  Wifi, Workflow, Wrench, Youtube, Zap,
} from 'lucide-react';

/** Curated icon catalogue – keeps the client bundle small and powers the picker. */
export const ICONS = {
  Activity, AlertTriangle, Award, BadgeCheck, Banknote, BarChart3, Bell, Bot, Box, Briefcase,
  Brush, Building2, CalendarDays, Camera, Check, CheckCircle2, ChevronDown, ChevronLeft,
  ChevronRight, ChevronUp, Clock, Cloud, Code, Code2, Cog, Coins, Compass, Contact, Cpu,
  CreditCard, Database, Diamond, Download, Eye, Facebook, FileText, Filter, Flame, Folder,
  Gauge, Gem, Gift, Github, Globe, GraduationCap, HandHeart, Handshake, HardDrive, Headphones,
  Heart, HeartPulse, Home, ImageIcon, Inbox, Info, Instagram, Key, Landmark, Laptop,
  Layers, LayoutDashboard, LifeBuoy, Lightbulb, LinkIcon, Linkedin, List, Lock, Mail,
  Map, MapPin, Megaphone, MessageCircle, MessageSquare, Monitor, Moon, MousePointerClick,
  Newspaper, Package, PaintBucket, Palette, PenTool, Phone, PieChart, Plane, Play, Plug, Plus,
  Printer, Puzzle, QrCode, Quote, Radio, Recycle, Repeat, Rocket, Ruler, Save, Scale, Search,
  Send, Server, Settings, Share2, Shield, ShieldCheck, ShoppingBag, ShoppingCart, Signal,
  Smartphone, Smile, Sparkles, Star, Store, Sun, Table, Tag, Target, Terminal, ThumbsUp, Timer,
  Trash2, TrendingUp, Trophy, Truck, Twitter, Umbrella, Users, Video, Wallet, Wand2, Watch,
  Wifi, Workflow, Wrench, Youtube, Zap,
};

export const ICON_NAMES = Object.keys(ICONS);

export default function Icon({ name, className = 'w-6 h-6', strokeWidth = 1.9, ...rest }) {
  const Cmp = ICONS[name] || ICONS[String(name || '').replace(/\s/g, '')] || Sparkles;
  return <Cmp className={className} strokeWidth={strokeWidth} {...rest} />;
}
