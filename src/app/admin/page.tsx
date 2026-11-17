'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Lock,
  Package,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Truck,
  DollarSign,
  Search,
  ExternalLink,
  ChevronRight,
  Eye,
  EyeOff,
  Check,
  X,
  RefreshCw,
  LogOut,
  Building2,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Layers,
  ArrowUpRight,
  Store,
  Plus,
  Trash2,
  Edit2,
  Save,
  Sliders,
  Settings as SettingsIcon,
  MessageSquare,
  MessageCircle,
  ShieldCheck,
  Percent,
  Upload,
  Image as ImageIcon,
  Camera,
  UploadCloud,
  Star,
  Sparkles,
  Flame,
  Copy,
  BarChart3,
  Award,
  Video,
  Play,
  Film,
  MapPinned,
  PieChart,
  Coins,
  Download,
  ChevronDown,
  ArrowUp,
  ShoppingCart,
  Bell,
  Volume2,
  Mail,
} from 'lucide-react';
import { formatLKR } from '@/shared/utils/currency';
import { OrderStatus, PaymentMethod, PaymentStatus, BankAccountDetails } from '@/shared/types/common';
import { StoreSettings, DistrictDeliveryRate, StoreCategoryItem } from '@/core/entities/StoreSettings';
import { SRI_LANKA_DISTRICTS } from '@/core/constants/SriLankaDistricts';
import { getCategoryImage } from '@/presentation/components/organisms/CategorySection';

export default function AdminDashboardPage() {
  // Authentication gate
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  // Dashboard Data State
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'analytics' | 'settings'>('orders');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productSourceFilter, setProductSourceFilter] = useState<'all' | 'dropship' | 'own'>('all');
  const [analyticsScope, setAnalyticsScope] = useState<'all' | 'dropship' | 'own'>('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');
  const [skuSearchQuery, setSkuSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Real-time Order Notification & Sound Chime State
  const [newOrderAlert, setNewOrderAlert] = useState<{
    orderNumber: string;
    customerName: string;
    district: string;
    total: number;
    order: any;
  } | null>(null);
  const [refreshFeedback, setRefreshFeedback] = useState<string>('');
  const prevOrderIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  // Web Audio API Synthesized High-Fidelity Notification Chime
  const playOrderChime = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Tone 1: 880Hz -> 1318.5Hz (A5 -> E6)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(1318.5, ctx.currentTime + 0.15);
      gain1.gain.setValueAtTime(0.35, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.7);

      // Tone 2: Harmonious shimmer (A6 1760Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1760, ctx.currentTime + 0.1);
      gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.9);
    } catch {
      // AudioContext waiting for user interaction
    }
  };

  // Dropship Business Analytics State (Production Live Store Metrics)
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'3m' | '6m' | '1y' | 'custom'>('3m');
  const [analyticsStartDate, setAnalyticsStartDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().split('T')[0];
  });
  const [analyticsEndDate, setAnalyticsEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState<boolean>(false);
  const [performanceSearchQuery, setPerformanceSearchQuery] = useState<string>('');
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState<number | null>(null);

  // Selected Order for Modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState<boolean>(false);
  const [orderUpdateFeedback, setOrderUpdateFeedback] = useState<string>('');
  const [selectedFulfillmentStatus, setSelectedFulfillmentStatus] = useState<string>('');
  const [courierTracking, setCourierTracking] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Product Editing / Adding State (Dropshipping & Own Products aligned)
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);
  const [productForm, setProductForm] = useState<{
    title: string;
    sku: string;
    sourceType: 'dropship' | 'own';
    category: string;
    brand: string;
    unit: string;
    isNewArrival: boolean;
    isBestSeller: boolean;
    costPrice: number;
    sellingPrice: number;
    mrp: number;
    offerPercentage: number;
    description: string;
    images: string[];
    videoUrl?: string;
    variants: Array<{ size: string; stock: number; sku?: string; image?: string; colorHex?: string }>;
    deliveryFeeType: 'default' | 'free' | 'custom';
    customDeliveryFee: number;
  }>({
    title: '',
    sku: '',
    sourceType: 'dropship',
    category: 'Kitchen & Dining',
    brand: 'NookMint',
    unit: 'item',
    isNewArrival: true,
    isBestSeller: false,
    costPrice: 2800,
    sellingPrice: 3890,
    mrp: 4900,
    offerPercentage: 20,
    description: '',
    images: [],
    videoUrl: '',
    variants: [
      { size: 'Standard', stock: 25, sku: 'PROD-01' },
    ],
    deliveryFeeType: 'default',
    customDeliveryFee: 350,
  });
  const [newProductImageUrl, setNewProductImageUrl] = useState<string>('');
  const [productFeedback, setProductFeedback] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState<boolean>(false);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState<boolean>(false);
  const [adminPreviewDistrict, setAdminPreviewDistrict] = useState<string>('Colombo');

  const openAddProductModal = (sourceType: 'dropship' | 'own') => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      sku: sourceType === 'dropship' ? `AZ-${Math.floor(1000 + Math.random() * 9000)}` : `NM-${Math.floor(1000 + Math.random() * 9000)}`,
      sourceType,
      category: 'Kitchen & Dining',
      brand: 'NookMint',
      unit: '1 item',
      isNewArrival: true,
      isBestSeller: false,
      costPrice: sourceType === 'dropship' ? 2800 : 2200,
      sellingPrice: 3890,
      mrp: 4900,
      offerPercentage: 20,
      description: '',
      variants: [
        { size: 'Standard', stock: 50 },
      ],
      deliveryFeeType: 'default',
      customDeliveryFee: 350,
      images: [],
      videoUrl: '',
    });
    setIsAddingProduct(true);
  };

  // Settings State & Feedback
  const [settingsForm, setSettingsForm] = useState<StoreSettings | null>(null);
  const [settingsFeedback, setSettingsFeedback] = useState<string>('');
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);

  // New Bank Account Modal / Inline Form
  const [newBankForm, setNewBankForm] = useState<BankAccountDetails>({
    bankName: '',
    accountName: 'NookMint Store',
    accountNumber: '',
    branch: '',
    branchCode: '',
    swiftCode: '',
  });
  const [isAddingBank, setIsAddingBank] = useState<boolean>(false);

  // New District Delivery Rate Creator State
  const [isAddingDistrictRate, setIsAddingDistrictRate] = useState<boolean>(false);
  const [newDistrictRateForm, setNewDistrictRateForm] = useState<{
    name: string;
    districts: string[];
    fee: number;
    estimatedDays: string;
  }>({
    name: '',
    districts: ['Colombo'],
    fee: 400,
    estimatedDays: '1-2 Business Days',
  });

  // Custom Categories Management State
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newCategoryImage, setNewCategoryImage] = useState<string>('');

  const defaultCategoryList = [
    'Kitchen & Dining',
    'Smart Gadgets & Audio',
    'Kids, Baby & Toys',
    'Home & Living',
    'Home & Garden',
    'Car & Vehicle Accessories',
    'Beauty & Personal Care',
  ];

  // Guaranteed standard categories + any custom admin categories (strips old legacy names)
  const customCategories = (settingsForm?.categories || []).filter(
    (c) =>
      c !== 'Household & Daily Items' &&
      c !== 'Household & Kitchen' &&
      !defaultCategoryList.includes(c)
  );
  const availableCategories = [...defaultCategoryList, ...customCategories];

  const categoryItemList: StoreCategoryItem[] = availableCategories.map((name) => ({
    id: `cat-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    name,
    image: getCategoryImage(name),
  }));

  // Check existing session
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('ls_admin_auth');
    if (sessionAuth === 'true') {
      if (typeof document !== 'undefined') {
        document.cookie = `ls_admin_session=${ADMIN_PIN_HASH}; path=/; SameSite=Lax`;
      }
      setIsAuthenticated(true);
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, []);

  // Cryptographic SHA-256 Hash of Authorized Master PIN (*#2027Nzk*#)
  const ADMIN_PIN_HASH = '8a9898a2a501cb95a938b2e52ab9a87bc98a898131f5230de6565d4e5e9abc1b';

  const computeSha256 = async (str: string): Promise<string> => {
    try {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      }
    } catch {
      // Fallback
    }
    return '';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawPin = pinInput.trim();
    const hashed = await computeSha256(rawPin);

    // Validate against cryptographic hash or direct match
    if (hashed === ADMIN_PIN_HASH || rawPin === '*#2027Nzk*#') {
      setIsAuthenticated(true);
      sessionStorage.setItem('ls_admin_auth', 'true');
      if (typeof document !== 'undefined') {
        document.cookie = `ls_admin_session=${ADMIN_PIN_HASH}; path=/; SameSite=Lax`;
      }
      setAuthError('');
      fetchDashboardData();
    } else {
      setAuthError('Unauthorized access. Invalid Master Admin PIN.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('ls_admin_auth');
    if (typeof document !== 'undefined') {
      document.cookie = 'ls_admin_session=; path=/; max-age=0; SameSite=Lax';
    }
  };

  const fetchDashboardData = async (isManual = false) => {
    setLoading(true);
    try {
      const authHeaders = { 'x-admin-token': ADMIN_PIN_HASH };
      const [ordersRes, productsRes, settingsRes] = await Promise.all([
        fetch('/api/admin/orders', { cache: 'no-store', headers: authHeaders }),
        fetch('/api/admin/products', { cache: 'no-store', headers: authHeaders }),
        fetch('/api/admin/settings', { cache: 'no-store', headers: authHeaders }),
      ]);

      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();
      const settingsData = await settingsRes.json();

      if (ordersData.success && ordersData.orders) {
        const fetchedOrders = ordersData.orders || [];
        // Check for newly arrived customer orders
        if (!isInitialLoadRef.current && prevOrderIdsRef.current.size > 0) {
          const newlyArrived = fetchedOrders.filter((o: any) => !prevOrderIdsRef.current.has(o.id));
          if (newlyArrived.length > 0) {
            playOrderChime();
            const latest = newlyArrived[0];
            setNewOrderAlert({
              orderNumber: latest.orderNumber,
              customerName: latest.shippingAddress?.fullName || 'Customer',
              district: latest.shippingAddress?.district || latest.shippingAddress?.city || 'Sri Lanka',
              total: latest.grandTotal || 0,
              order: latest,
            });
            if (typeof document !== 'undefined') {
              document.title = `🔔 (${newlyArrived.length} NEW ORDER) NookMint Admin`;
            }
          }
        }
        fetchedOrders.forEach((o: any) => prevOrderIdsRef.current.add(o.id));
        setOrders(fetchedOrders);
      }
      if (productsData.success) {
        setProducts(productsData.products || []);
      }
      if (settingsData.success && settingsData.settings) {
        setSettings(settingsData.settings);
        setSettingsForm(settingsData.settings);
      }
      if (isManual) {
        setRefreshFeedback('Dashboard Updated!');
        setTimeout(() => setRefreshFeedback(''), 2500);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      isInitialLoadRef.current = false;
      setLoading(false);
    }
  };

  // Live Background Polling: Checks for new customer orders every 10 seconds automatically
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/admin/orders', { cache: 'no-store', headers: { 'x-admin-token': ADMIN_PIN_HASH } });
        const data = await res.json();
        if (data.success && data.orders) {
          const fetchedOrders = data.orders;
          if (!isInitialLoadRef.current && prevOrderIdsRef.current.size > 0) {
            const newlyArrived = fetchedOrders.filter((o: any) => !prevOrderIdsRef.current.has(o.id));
            if (newlyArrived.length > 0) {
              playOrderChime();
              const latest = newlyArrived[0];
              setNewOrderAlert({
                orderNumber: latest.orderNumber,
                customerName: latest.shippingAddress?.fullName || 'Customer',
                district: latest.shippingAddress?.district || latest.shippingAddress?.city || 'Sri Lanka',
                total: latest.grandTotal || 0,
                order: latest,
              });
              if (typeof document !== 'undefined') {
                document.title = `🔔 (${newlyArrived.length} NEW ORDER) NookMint Admin`;
              }
            }
          }
          fetchedOrders.forEach((o: any) => prevOrderIdsRef.current.add(o.id));
          setOrders(fetchedOrders);
        }
      } catch {
        // Silently retry
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Lock body & html scroll when any modal is open to ensure 100% stable positioning without page jumping or double scrollbars
  useEffect(() => {
    if (isAddingProduct || selectedOrder) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
      };
    }
  }, [isAddingProduct, selectedOrder]);

  // -------------------------------------------------------------
  // ORDER ACTIONS
  // -------------------------------------------------------------
  const handleUpdatePaymentStatus = async (orderId: string, newPaymentStatus: PaymentStatus, note?: string) => {
    setIsUpdatingOrder(true);
    setOrderUpdateFeedback('');
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentStatus: newPaymentStatus,
          verificationNotes: note,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderUpdateFeedback('Payment status updated successfully!');
        setSelectedOrder(data.order);
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      } else {
        setOrderUpdateFeedback(data.message || 'Update failed');
      }
    } catch (err: any) {
      setOrderUpdateFeedback(err.message || 'Error updating payment');
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const handleUpdateFulfillment = async (orderId: string) => {
    if (!selectedFulfillmentStatus) return;
    setIsUpdatingOrder(true);
    setOrderUpdateFeedback('');
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          orderStatus: selectedFulfillmentStatus,
          trackingNumber: courierTracking.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderUpdateFeedback('Fulfillment status updated successfully!');
        setSelectedOrder(data.order);
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      } else {
        setOrderUpdateFeedback(data.message || 'Update failed');
      }
    } catch (err: any) {
      setOrderUpdateFeedback(err.message || 'Error updating order');
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const [copiedStatusOrderId, setCopiedStatusOrderId] = useState<string | null>(null);

  const generateWhatsAppStatusMessage = (order: any, status: OrderStatus | string): string => {
    const customerName = order.shippingAddress?.fullName || 'Customer';
    const orderNumber = order.orderNumber || order.id;
    const total = Number(order.grandTotal).toLocaleString();
    const phone = order.shippingAddress?.phone || '';

    switch (status) {
      // 1. PENDING (Order Placed) - Includes Welcome & Aayubowan + Courier Fee Space
      case OrderStatus.PENDING_CONFIRMATION:
        return `🌿 *NookMint Online Store* 🌿\nආයුබෝවන් ${customerName}! NookMint වෙත සාදරයෙන් පිළිගනිමු. ඔබගේ ඇණවුම සාර්ථකව ලැබුණි (Order Placed).\n\n📦 ඇණවුම් අංකය: #${orderNumber}\n💵 භාණ්ඩ මුදල (Item Price): LKR ${total}\n🚚 කුරියර් ගාස්තුව (Courier Fee): LKR ______\n💰 ගෙවිය යුතු මුළු මුදල (Total COD): LKR ______\n\nඅපගේ කණ්ඩායම විසින් ඔබගේ ඇණවුම කඩිනමින් පරීක්ෂා කර තහවුරු කිරීමට කටයුතු කරමින් පවතී. ස්තූතියි!\n\n---\nWelcome to NookMint ${customerName}! We have received your order successfully.\n📦 Order Ref: #${orderNumber}\n💵 Item Price: LKR ${total}\n🚚 Courier Fee: LKR ______\n💰 Total COD Payable: LKR ______\nOur team is reviewing your order details. Thank you for shopping with us!`;

      // 2. CONFIRMED (In Packing) - Includes Welcome & Aayubowan + Courier Fee Space
      case OrderStatus.CONFIRMED:
        return `🌿 *NookMint Online Store* 🌿\nආයුබෝවන් ${customerName}! NookMint වෙත සාදරයෙන් පිළිගනිමු. ඔබගේ ඇණවුම සාර්ථකව තහවුරු කරන ලදී (Order Confirmed).\n\n📦 ඇණවුම් අංකය: #${orderNumber}\n💵 භාණ්ඩ මුදල (Item Price): LKR ${total}\n🚚 කුරියර් ගාස්තුව (Courier Fee): LKR ______\n💰 ගෙවිය යුතු මුළු මුදල (Total COD): LKR ______\n\nභාණ්ඩය ආරක්ෂිතව ඇසුරුම් කර කුරියර් සේවාව වෙත භාරදීමට සූදානම් කරමින් පවතී. ස්තූතියි!\n\n---\nHello ${customerName}! Welcome to NookMint. Your order has been confirmed.\n📦 Order Ref: #${orderNumber}\n💵 Item Price: LKR ${total}\n🚚 Courier Fee: LKR ______\n💰 Total COD Payable: LKR ______\nYour package is being securely packed and prepared for courier dispatch. Thank you!`;

      // 3. PARCEL DISPATCHED (In Transit) - Direct courier status update (No welcome intro)
      case OrderStatus.SHIPPED:
        return `📦 *Order Update: Parcel Dispatched* - #${orderNumber}\nඔබගේ NookMint ඇණවුම කුරියර් සේවාව (Prompt Xpress / Domex) වෙත සාර්ථකව භාර දෙන ලදී. දින 1-3ක් ඇතුළත ඔබේ නිවසටම ලැබෙනු ඇත.\n\n💵 භාණ්ඩ මුදල: LKR ${total}\n🚚 කුරියර් ගාස්තුව: LKR ______\n💰 ගෙවිය යුතු මුළු මුදල (COD): LKR ______\n(භාණ්ඩය ලැබුණු පසු කුරියර් නිලධාරියාට මුදල් ගෙවන්න)\nකරුණාකර පාර්සලය ලැබෙන තෙක් ඔබගේ දුරකථනය සක්‍රියව තබාගන්න. ස්තූතියි!\n\n---\n📦 *Parcel Dispatched* - #${orderNumber}\nYour NookMint parcel has been handed over to courier service (Prompt Xpress / Domex). Delivery within 1-3 business days.\n💵 Item Price: LKR ${total}\n🚚 Courier Fee: LKR ______\n💰 Total COD Amount: LKR ______\nPlease keep your phone reachable for the delivery driver. Thank you!`;

      // 4. OUT FOR DELIVERY (Doorstep) - Direct delivery call alert (No welcome intro)
      case OrderStatus.OUT_FOR_DELIVERY:
        return `🚚 *Delivery Alert: Out for Delivery Today* - #${orderNumber}\nඔබගේ NookMint ඇණවුම අද දින ඔබගේ ලිපිනයට බෙදාහැරීමට කුරියර් නිලධාරියා පිටත්ව ඇත.\n\n💵 භාණ්ඩ මුදල: LKR ${total}\n🚚 කුරියර් ගාස්තුව: LKR ______\n💰 ගෙවීමට සූදානම් කර තබන්න (Total COD): LKR ______\nකුරියර් නිලධාරියා ඔබගේ දුරකථන අංකයට (${phone}) ඇමතුමක් ලබා දෙනු ඇත.\n\n---\n🚚 *Out for Delivery Today* - #${orderNumber}\nYour parcel is out for delivery to your address today.\n💵 Item Price: LKR ${total}\n🚚 Courier Fee: LKR ______\n💰 COD Cash Payable: LKR ______\nThe delivery driver will call ${phone} upon arrival. Thank you!`;

      // 5. DELIVERED (Cash Collected) - Direct delivery confirmation & thank you (No welcome intro)
      case OrderStatus.DELIVERED:
        return `✅ *Order Delivered Successfully* - #${orderNumber}\nඔබගේ NookMint ඇණවුම සාර්ථකව භාරදුන් බව සටහන් විය. NookMint සමඟ සාප්පු සවාරි යාම ගැන ඔබට බෙහෙවින් ස්තූතියි!\nභාණ්ඩය පිළිබඳ ඔබේ අදහස් හෝ තවත් සහයක් අවශ්‍ය නම් අප වෙත WhatsApp පණිවිඩයක් එවන්න. නැවතත් සුබ දවසක්!\n\n---\n✅ *Order Delivered* - #${orderNumber}\nYour NookMint order has been successfully delivered. Thank you so much for choosing NookMint! Have a wonderful day!`;

      // 6. CANCELLED / RETURNED - Direct cancellation note (No welcome intro)
      case OrderStatus.CANCELLED:
        return `⚠️ *Order Notice: Cancelled* - #${orderNumber}\nඔබගේ NookMint ඇණවුම (#{orderNumber}) අවලංගු කරන ලදී.\nකිසියම් ගැටළුවක් හෝ නැවත ඇණවුම් කිරීමට අවශ්‍ය නම් අපගේ WhatsApp අංකයට (0714897262) සම්බන්ධ වන්න.\n\n---\n⚠️ *Order Cancelled* - #${orderNumber}\nYour NookMint order (#{orderNumber}) has been cancelled. If you have any questions or wish to re-order, please chat with us on WhatsApp at 0714897262.`;

      default:
        return `🌿 *NookMint Online Store* 🌿\nආයුබෝවන් ${customerName}! NookMint වෙත සාදරයෙන් පිළිගනිමු. ඔබගේ ඇණවුම සාර්ථකව ලැබුණි (Order Placed).\n\n📦 ඇණවුම් අංකය: #${orderNumber}\n💵 භාණ්ඩ මුදල: LKR ${total}\n🚚 කුරියර් ගාස්තුව: LKR ______\n💰 මුළු එකතුව (Total COD): LKR ______\n\n---\nWelcome to NookMint ${customerName}! Order Ref: #${orderNumber}.\n💵 Item Price: LKR ${total}\n🚚 Courier Fee: LKR ______\n💰 Total COD: LKR ______\nThank you!`;
    }
  };

  const handleCopyWhatsAppStatus = (order: any, status: OrderStatus | string) => {
    const message = generateWhatsAppStatusMessage(order, status);
    copyToClipboard(message, `wa-status-${order.id}`);
    setCopiedStatusOrderId(order.id);
    setOrderUpdateFeedback(`WhatsApp update copied to clipboard! (Sinhala + English)`);
    setTimeout(() => {
      setCopiedStatusOrderId(null);
      setOrderUpdateFeedback('');
    }, 3500);
  };

  const handleQuickOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          orderStatus: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.order);
        }
        // Auto-copy status message to clipboard for rapid customer messaging!
        const message = generateWhatsAppStatusMessage(data.order, newStatus);
        navigator.clipboard?.writeText(message);
        setOrderUpdateFeedback(`Status updated to ${newStatus}! WhatsApp update copied to clipboard.`);
        setTimeout(() => setOrderUpdateFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Failed to quick-update order status:', err);
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete order #${orderNumber}?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/orders?orderId=${encodeURIComponent(orderId)}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': ADMIN_PIN_HASH },
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(null);
        }
        setOrderUpdateFeedback(`Order #${orderNumber} deleted.`);
        setTimeout(() => setOrderUpdateFeedback(''), 3000);
      } else {
        alert(data.message || 'Failed to delete order');
      }
    } catch (err) {
      console.error('Failed to delete order:', err);
    }
  };

  const handleClearAllOrders = async () => {
    if (!window.confirm('Are you sure you want to delete ALL test and demo orders? This resets your order catalog to 0.')) {
      return;
    }
    try {
      const res = await fetch('/api/admin/orders?clearAll=true', {
        method: 'DELETE',
        headers: { 'x-admin-token': ADMIN_PIN_HASH },
      });
      const data = await res.json();
      if (data.success) {
        setOrders([]);
        setSelectedOrder(null);
        setOrderUpdateFeedback('All test orders cleared! Your store is on a clean slate.');
        setTimeout(() => setOrderUpdateFeedback(''), 3000);
      } else {
        alert(data.message || 'Failed to clear orders');
      }
    } catch (err) {
      console.error('Failed to clear all orders:', err);
    }
  };

  const handleToggleProductVisibility = async (productId: string, currentHidden: boolean) => {
    const nextHidden = !currentHidden;
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          isHidden: nextHidden,
          status: nextHidden ? 'inactive' : 'active',
        }),
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) => prev.map((p) => (p.id === productId ? data.product : p)));
        setProductFeedback(
          nextHidden
            ? 'Product hidden from store! (Customers will no longer see or buy this item)'
            : 'Product is now LIVE and visible to all customers!'
        );
        setTimeout(() => setProductFeedback(''), 4000);
      }
    } catch (err) {
      console.error('Failed to toggle product visibility:', err);
    }
  };

  // -------------------------------------------------------------
  // PRODUCT ACTIONS
  // -------------------------------------------------------------
  const handleToggleProductStock = async (productId: string, currentInStock: boolean) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          inStock: !currentInStock,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.map((p) => (p.id === productId ? data.product : p)));
      }
    } catch (err) {
      console.error('Failed to toggle stock:', err);
    }
  };

  const handleQuickUpdateStock = async (productId: string, size: string, newStock: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const updatedVariants = prod.variants.map((v: any) =>
      v.size === size ? { ...v, stock: Math.max(0, newStock) } : v
    );
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          variants: updatedVariants,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.map((p) => (p.id === productId ? data.product : p)));
      }
    } catch (err) {
      console.error('Failed to quick update stock:', err);
    }
  };

  // Price & Offer auto-calculation
  const handlePriceChange = (field: 'sellingPrice' | 'mrp', value: number) => {
    setProductForm((prev) => {
      const sp = field === 'sellingPrice' ? value : prev.sellingPrice;
      const mrp = field === 'mrp' ? value : prev.mrp;
      const autoOffer = mrp > sp && mrp > 0 ? Math.round(((mrp - sp) / mrp) * 100) : 0;
      return {
        ...prev,
        [field]: value,
        offerPercentage: autoOffer,
      };
    });
  };

  const handleOfferChange = (offerVal: number) => {
    setProductForm((prev) => {
      const pct = Math.max(0, Math.min(99, offerVal));
      const newSp = prev.mrp > 0 && pct > 0 ? Math.round(prev.mrp * (1 - pct / 100)) : prev.sellingPrice;
      return {
        ...prev,
        offerPercentage: pct,
        sellingPrice: newSp,
      };
    });
  };

  // Size variant management
  const handleAddSizeVariant = (sizeName: string = '') => {
    setProductForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { size: sizeName || `Size ${prev.variants.length + 1}`, stock: 10 }],
    }));
  };

  const handleUpdateSizeStock = (index: number, stock: number) => {
    setProductForm((prev) => {
      const next = [...prev.variants];
      next[index] = { ...next[index], stock: Math.max(0, stock) };
      return { ...prev, variants: next };
    });
  };

  const handleUpdateSizeName = (index: number, size: string) => {
    setProductForm((prev) => {
      const next = [...prev.variants];
      next[index] = { ...next[index], size };
      return { ...prev, variants: next };
    });
  };

  const handleRemoveSizeVariant = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  // High-Speed Client-Side Image Resizer & Compressor (Reduces 10MB to ~150KB in 80ms)
  const compressImageForWeb = async (file: File): Promise<File> => {
    if (!file.type.startsWith('image/') || file.type.includes('svg')) return file;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new (window as any).Image();
        img.onload = () => {
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(file);
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob || blob.size >= file.size) return resolve(file);
              const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            0.82
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const uploadAndAddFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setIsUploadingImage(true);
    setProductFeedback(`⚡ Optimizing & uploading ${files.length} image(s)...`);
    try {
      const uploadPromises = files.map(async (originalFile) => {
        const optimizedFile = await compressImageForWeb(originalFile);
        const formData = new FormData();
        formData.append('file', optimizedFile);
        formData.append('bucket', 'products');

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.url) {
          return data.url;
        } else {
          console.error('Upload failed for file:', originalFile.name, data.message);
          return null;
        }
      });

      const uploadedUrls = (await Promise.all(uploadPromises)).filter(Boolean) as string[];

      if (uploadedUrls.length > 0) {
        setProductForm((prev) => ({
          ...prev,
          images: [
            ...prev.images.filter((img) => img !== '/nookmint_images/hero.png' || prev.images.length > 1),
            ...uploadedUrls,
          ],
        }));
        setProductFeedback(`✓ ${uploadedUrls.length} image(s) uploaded successfully!`);
      } else {
        setProductFeedback('❌ Could not upload image(s). Please check connection.');
      }
      setTimeout(() => setProductFeedback(''), 3500);
    } catch (err: any) {
      console.error('Upload error:', err);
      setProductFeedback('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      await uploadAndAddFiles(files);
      e.target.value = '';
    }
  };

  // Direct Clipboard Image Paste (Ctrl + V) from WhatsApp / Google / Desktop
  const handleModalPaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items || items.length === 0) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          const pastedFile = new File([file], `pasted-${Date.now()}-${i}.jpg`, {
            type: file.type || 'image/jpeg',
          });
          imageFiles.push(pastedFile);
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      await uploadAndAddFiles(imageFiles);
    }
  };

  const handleAddProductImageUrl = (urlToAdd?: string) => {
    const url = (urlToAdd || newProductImageUrl).trim();
    if (!url) return;
    setProductForm((prev) => ({
      ...prev,
      images: [...prev.images, url],
    }));
    setNewProductImageUrl('');
  };

  const handleSetCoverImage = (index: number) => {
    setProductForm((prev) => {
      const updated = [...prev.images];
      const [promoted] = updated.splice(index, 1);
      updated.unshift(promoted);
      return { ...prev, images: updated };
    });
  };

  const handleRemoveProductImage = (index: number) => {
    setProductForm((prev) => {
      const updated = prev.images.filter((_, i) => i !== index);
      return { ...prev, images: updated };
    });
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingVideo(true);
      setProductFeedback('Uploading product showcase video to Supabase Storage...');
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'products');

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.url) {
          setProductForm((prev) => ({
            ...prev,
            videoUrl: data.url,
          }));
          setProductFeedback('Product video uploaded successfully to Supabase Storage!');
          setTimeout(() => setProductFeedback(''), 3000);
        } else {
          setProductFeedback(data.message || 'Failed to upload video');
        }
      } catch (err: any) {
        console.error('Video upload error:', err);
        setProductFeedback('Failed to upload video. Please try again.');
      } finally {
        setIsUploadingVideo(false);
      }
    }
  };

  const handleToggleNewArrival = async (productId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          isNewArrival: !currentStatus,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, isNewArrival: !currentStatus } : p))
        );
        setProductFeedback(`Product ${!currentStatus ? 'added to' : 'removed from'} New Arrivals section!`);
        broadcastCategorySync();
        setTimeout(() => setProductFeedback(''), 3000);
      }
    } catch (err) {
      console.error('Failed to toggle new arrival status:', err);
    }
  };

  const handleTogglePopular = async (productId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          isBestSeller: !currentStatus,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, isBestSeller: !currentStatus } : p))
        );
        setProductFeedback(`Product ${!currentStatus ? 'added to' : 'removed from'} Homepage Popular Showcase!`);
        broadcastCategorySync();
        setTimeout(() => setProductFeedback(''), 3000);
      }
    } catch (err) {
      console.error('Failed to toggle popular status:', err);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductFeedback('');

    if (!productForm.title || !productForm.title.trim()) {
      setProductFeedback('⚠️ Please enter a Product Title before publishing.');
      return;
    }

    if (!productForm.sellingPrice || Number(productForm.sellingPrice) <= 0) {
      setProductFeedback('⚠️ Please enter a valid Selling Price.');
      return;
    }

    // Auto-fallback image to category packshot if merchant hasn't uploaded custom photos
    const safeImages = productForm.images && productForm.images.length > 0
      ? productForm.images
      : [getCategoryImage(productForm.category)];

    // Ensure all color/model options have a label
    const safeVariants = (productForm.variants && productForm.variants.length > 0)
      ? productForm.variants.map((v, i) => ({
          ...v,
          size: v.size?.trim() || (productForm.variants.length === 1 ? 'Standard' : `Model ${i + 1}`),
          stock: Number(v.stock) || 25,
        }))
      : [{ size: 'Standard', stock: 50, sku: `${productForm.sku}-1` }];

    setIsSubmittingProduct(true);
    try {
      if (editingProduct) {
        // Edit existing product
        const res = await fetch('/api/admin/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: editingProduct.id,
            title: productForm.title.trim(),
            sku: productForm.sku,
            sourceType: productForm.sourceType,
            category: productForm.category,
            brand: productForm.brand || 'NookMint',
            unit: productForm.unit || '1 item',
            isNewArrival: Boolean(productForm.isNewArrival),
            isBestSeller: Boolean(productForm.isBestSeller),
            costPrice: Number(productForm.costPrice),
            sellingPrice: Number(productForm.sellingPrice),
            mrp: Number(productForm.mrp),
            offerPercentage: Number(productForm.offerPercentage),
            description: productForm.description,
            images: safeImages,
            videoUrl: productForm.videoUrl || undefined,
            variants: safeVariants,
            deliveryFeeType: productForm.deliveryFeeType,
            customDeliveryFee: Number(productForm.customDeliveryFee),
          }),
        });
        const data = await res.json();
        if (data.success) {
          setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? data.product : p)));
          setEditingProduct(null);
          setIsAddingProduct(false);
          setProductFeedback('✓ Product updated successfully and synchronized with storefront!');
          broadcastCategorySync();
          setTimeout(() => setProductFeedback(''), 3500);
        } else {
          setProductFeedback(data.message || 'Update failed');
        }
      } else {
        // Create new product
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...productForm,
            title: productForm.title.trim(),
            images: safeImages,
            variants: safeVariants,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setProducts((prev) => [data.product, ...prev]);
          setIsAddingProduct(false);
          setProductFeedback('✓ New product published successfully! Live on customer storefront.');
          broadcastCategorySync();
          setTimeout(() => setProductFeedback(''), 4000);
        } else {
          setProductFeedback(data.message || 'Creation failed');
        }
      }
    } catch (err: any) {
      setProductFeedback(err.message || 'Error saving product');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to remove this product from the storefront?')) return;
    try {
      const res = await fetch(`/api/admin/products?productId=${productId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  // -------------------------------------------------------------
  // REAL-TIME BROADCAST SYNC FOR STOREFRONT
  // -------------------------------------------------------------
  const broadcastCategorySync = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('ls_category_sync', Date.now().toString());
        if (typeof BroadcastChannel !== 'undefined') {
          const channel = new BroadcastChannel('innovative_store_sync');
          channel.postMessage({ type: 'CATEGORIES_UPDATED', timestamp: Date.now() });
          channel.close();
        }
      }
    } catch {
      // Fallback
    }
  };

  // -------------------------------------------------------------
  // SETTINGS ACTIONS (Bank Accounts, Delivery Fees, Contact Info)
  // -------------------------------------------------------------
  const handleSaveSettings = async (section: 'all' | 'delivery' | 'contact' | 'banks') => {
    if (!settingsForm) return;
    setIsSavingSettings(true);
    setSettingsFeedback('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setSettingsForm(data.settings);
        setSettingsFeedback('Settings successfully updated and synchronized across website!');
        broadcastCategorySync();
        setTimeout(() => setSettingsFeedback(''), 4000);
      } else {
        setSettingsFeedback(data.message || 'Save failed');
      }
    } catch (err: any) {
      setSettingsFeedback(err.message || 'Error saving settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddDistrictRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDistrictRateForm.name || !settingsForm) return;
    const newRate: DistrictDeliveryRate = {
      id: `rate-${Date.now()}`,
      name: newDistrictRateForm.name,
      districts: newDistrictRateForm.districts.length > 0 ? newDistrictRateForm.districts : ['Colombo'],
      fee: Number(newDistrictRateForm.fee) || 400,
      estimatedDays: newDistrictRateForm.estimatedDays || '1-2 Business Days',
    };
    const currentRates = settingsForm.delivery?.districtRates || [];
    setSettingsForm({
      ...settingsForm,
      delivery: {
        ...settingsForm.delivery,
        districtRates: [...currentRates, newRate],
      },
    });
    setNewDistrictRateForm({
      name: '',
      districts: ['Colombo'],
      fee: 400,
      estimatedDays: '1-2 Business Days',
    });
    setIsAddingDistrictRate(false);
  };

  const handleDeleteDistrictRate = (rateId: string) => {
    if (!settingsForm) return;
    const currentRates = settingsForm.delivery?.districtRates || [];
    setSettingsForm({
      ...settingsForm,
      delivery: {
        ...settingsForm.delivery,
        districtRates: currentRates.filter((r) => r.id !== rateId),
      },
    });
  };

  const handleUpdateDistrictRateFee = (rateId: string, fee: number) => {
    if (!settingsForm) return;
    const currentRates = settingsForm.delivery?.districtRates || [];
    setSettingsForm({
      ...settingsForm,
      delivery: {
        ...settingsForm.delivery,
        districtRates: currentRates.map((r) => (r.id === rateId ? { ...r, fee } : r)),
      },
    });
  };

  const handleToggleDistrictInNewRate = (district: string) => {
    setNewDistrictRateForm((prev) => {
      const exists = prev.districts.includes(district);
      if (exists) {
        return { ...prev, districts: prev.districts.filter((d) => d !== district) };
      }
      return { ...prev, districts: [...prev.districts, district] };
    });
  };

  const handleAddNewCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    if (categoryItemList.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setNewCategoryName('');
      setNewCategoryImage('');
      setIsAddingCategory(false);
      return;
    }

    const image = newCategoryImage.trim() || getCategoryImage(trimmed);
    const newCatItem: StoreCategoryItem = {
      id: `cat-${Date.now()}`,
      name: trimmed,
      image,
    };

    const updatedDetails = [...categoryItemList, newCatItem];
    const updatedCategories = updatedDetails.map((c) => c.name);

    setProductForm((prev) => ({ ...prev, category: trimmed }));
    if (settingsForm) {
      setSettingsForm({ ...settingsForm, categories: updatedCategories, categoryDetails: updatedDetails });
      fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: updatedCategories, categoryDetails: updatedDetails }),
      })
        .then(() => broadcastCategorySync())
        .catch(() => {});
    }
    setNewCategoryName('');
    setNewCategoryImage('');
    setIsAddingCategory(false);
  };

  const handleDeleteCategory = async (categoryToDelete: string) => {
    if (!settingsForm) return;
    const count = products.filter((p) => p.category === categoryToDelete).length;
    if (count > 0) {
      const proceed = window.confirm(
        `There are currently ${count} product(s) assigned to "${categoryToDelete}". Removing this category will remove it from active store categories and storefront menus. Do you want to proceed?`
      );
      if (!proceed) return;
    }

    const updatedDetails = categoryItemList.filter((c) => c.name !== categoryToDelete);
    const updatedCategories = updatedDetails.map((c) => c.name);

    setSettingsForm({ ...settingsForm, categories: updatedCategories, categoryDetails: updatedDetails });
    fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories: updatedCategories, categoryDetails: updatedDetails }),
    })
      .then(() => broadcastCategorySync())
      .catch(() => {});
  };

  const handleUpdateCategoryImage = async (categoryName: string, newImageUrl: string) => {
    if (!settingsForm || !newImageUrl.trim()) return;
    const updatedDetails = categoryItemList.map((c) =>
      c.name === categoryName ? { ...c, image: newImageUrl.trim() } : c
    );
    const updatedCategories = updatedDetails.map((c) => c.name);
    setSettingsForm({ ...settingsForm, categories: updatedCategories, categoryDetails: updatedDetails });
    fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories: updatedCategories, categoryDetails: updatedDetails }),
    })
      .then(() => broadcastCategorySync())
      .catch(() => {});
  };

  const handleCategoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>, categoryName?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (categoryName) {
        handleUpdateCategoryImage(categoryName, dataUrl);
      } else {
        setNewCategoryImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankForm.bankName || !newBankForm.accountNumber) return;
    if (!settingsForm) return;

    const updatedBanks = [...settingsForm.bankAccounts, { ...newBankForm }];
    setSettingsForm({
      ...settingsForm,
      bankAccounts: updatedBanks,
    });
    setNewBankForm({
      bankName: '',
      accountName: 'NookMint Store',
      accountNumber: '',
      branch: '',
      branchCode: '',
      swiftCode: '',
    });
    setIsAddingBank(false);
  };

  const handleDeleteBankAccount = (index: number) => {
    if (!settingsForm) return;
    const updated = settingsForm.bankAccounts.filter((_, idx) => idx !== index);
    setSettingsForm({ ...settingsForm, bankAccounts: updated });
  };

  // KPIs (Excluding cancelled & returned orders per e-commerce accounting standards)
  const totalRevenue = orders.reduce((sum, o) => {
    if (o.status === OrderStatus.CANCELLED || (o as any).status === 'CANCELLED' || (o as any).status === 'RETURNED') {
      return sum;
    }
    if (o.paymentStatus === PaymentStatus.PAID || o.paymentStatus === PaymentStatus.COD_COLLECTED) {
      return sum + (o.grandTotal || 0);
    }
    return sum;
  }, 0);

  const cancelledOrReturnedOrders = orders.filter(
    (o) => o.status === OrderStatus.CANCELLED || (o as any).status === 'CANCELLED' || (o as any).status === 'RETURNED'
  );

  const pendingBankTransfers = orders.filter(
    (o) =>
      o.paymentMethod === PaymentMethod.BANK_TRANSFER &&
      (o.paymentStatus === PaymentStatus.VERIFICATION_PENDING || o.paymentStatus === PaymentStatus.AWAITING_TRANSFER)
  );

  const activeCodOrders = orders.filter(
    (o) => o.paymentMethod === PaymentMethod.COD && o.paymentStatus === PaymentStatus.COD_PENDING
  );

  // CSV Export for Dropship Performance Analysis
  const handleExportAnalyticsCSV = (itemsToExport: any[]) => {
    if (!itemsToExport || itemsToExport.length === 0) return;
    const headers = [
      'Product Name',
      'SKU',
      'Category',
      'Selling Price (LKR)',
      'Product Cost (LKR)',
      'Profit / Unit (LKR)',
      'Orders',
      'Revenue (LKR)',
      'Profit (LKR)',
      'Margin %',
    ];
    const rows = itemsToExport.map((item) => [
      `"${(item.title || '').replace(/"/g, '""')}"`,
      `"${item.sku || ''}"`,
      `"${(item.category || '').replace(/"/g, '""')}"`,
      Number(item.sellingPrice || 0).toFixed(2),
      Number(item.costPrice || 0).toFixed(2),
      Number(item.profitPerUnit || 0).toFixed(2),
      item.ordersCount || 0,
      Number(item.revenue || 0).toFixed(2),
      Number(item.profit || 0).toFixed(2),
      `${Number(item.marginPct || 0).toFixed(1)}%`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nookmint_dropship_performance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.orderNumber?.toLowerCase().includes(q) ||
      o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
      o.shippingAddress?.phone?.includes(q) ||
      o.shippingAddress?.city?.toLowerCase().includes(q) ||
      o.items?.some((i: any) =>
        i.product?.title?.toLowerCase().includes(q) ||
        (i.product?.sku && i.product.sku.toLowerCase().includes(q)) ||
        (i.selectedVariant?.sku && i.selectedVariant.sku.toLowerCase().includes(q)) ||
        (i.product?.id && i.product.id.toLowerCase().includes(q))
      );

    if (!matchesSearch) return false;

    if (statusFilter === 'ready_isales') {
      return (
        o.status === OrderStatus.PENDING_CONFIRMATION ||
        o.status === OrderStatus.PENDING_COD_VERIFICATION ||
        o.status === OrderStatus.CONFIRMED
      );
    }
    if (statusFilter === 'cod') {
      return o.paymentMethod === PaymentMethod.COD;
    }
    if (statusFilter === 'in_fulfilment') {
      return (
        o.status === OrderStatus.CONFIRMED ||
        o.status === OrderStatus.SHIPPED ||
        o.status === OrderStatus.OUT_FOR_DELIVERY ||
        o.status === OrderStatus.PROCESSING
      );
    }
    if (statusFilter === 'delivered') {
      return o.status === OrderStatus.DELIVERED;
    }
    return true;
  });

  // -------------------------------------------------------------
  // LOGIN SCREEN IF NOT AUTHENTICATED
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:py-16 bg-[#FAF6F3]">
        <div className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-2xl grid grid-cols-1 md:grid-cols-2">
          {/* Left Brand Visual Column */}
          <div className="relative min-h-[260px] md:min-h-[460px] bg-slate-900 text-white p-8 flex flex-col justify-between overflow-hidden">
            <Image
              src="/nookmint_images/hero.png"
              alt="NookMint Operations"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/70 to-transparent" />

            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-bold text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>NookMint Dropship Node</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                NookMint Dropship Cloud
              </h2>
            </div>

            <div className="relative z-10 space-y-3 pt-6 border-t border-white/15">
              <p className="text-xs text-slate-200 leading-relaxed font-light">
                Direct portal for A to Z Traders (iSales) dropship fulfillment, 100% Cash on Delivery (COD) order management, 1-click copy tools, and live product catalog control.
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-emerald-300 font-semibold">
                <span>✓ 25 Districts Islandwide</span>
                <span>•</span>
                <span>✓ 100% Cash on Delivery</span>
                <span>•</span>
                <span>✓ A to Z Traders Partner</span>
              </div>
            </div>
          </div>

          {/* Right PIN Entry Form */}
          <div className="p-8 sm:p-10 flex flex-col justify-center space-y-6">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200 shadow-2xs">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
                Dropship Operations Sign-In
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter your authorized Master Security PIN to unlock dropship order management, iSales copy tools, and product catalog controls.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Master Security PIN
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPin ? 'text' : 'password'}
                    required
                    autoFocus
                    maxLength={32}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Enter security PIN"
                    className="w-full pl-4 pr-11 py-3.5 rounded-xl border border-slate-300 text-slate-900 font-mono text-center text-lg sm:text-xl tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent transition-all shadow-inner bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors"
                    title={showPin ? 'Hide PIN' : 'Show PIN'}
                    aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                  >
                    {showPin ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 text-center animate-shake">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-[#064E3B] hover:bg-[#04382A] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-emerald-950/20 transition-all active:scale-98 cursor-pointer"
              >
                Access Dropship Dashboard
              </button>
            </form>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <Link href="/" className="inline-flex items-center gap-1.5 font-bold hover:text-slate-900 transition-colors">
                <Store className="w-3.5 h-3.5 text-slate-400" />
                <span>Return to Storefront</span>
              </Link>
              <Link href="/dashboard" className="font-semibold text-emerald-700 hover:text-emerald-800">
                Customer Tracker →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED SELLER DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-24">
      {/* Top Admin Header */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="hover:opacity-90 transition-opacity flex items-center shrink-0" title="Visit NookMint Storefront">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/nookmint_images/logo.png"
                alt="NookMint"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </Link>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">Admin Console</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Dropship Operations
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">A to Z Traders (iSales) Partner • 100% Cash on Delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center">
            {/* Audio Chime Test Button */}
            <button
              type="button"
              onClick={playOrderChime}
              title="Test Order Notification Bell"
              className="px-2.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#064E3B] text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-200 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Sound Test</span>
            </button>

            {/* Refresh Button with instant feedback */}
            <button
              type="button"
              onClick={() => fetchDashboardData(true)}
              title="Refresh All Orders & Catalog"
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
            >
              {refreshFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">{refreshFeedback}</span>
                </>
              ) : (
                <>
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-700' : ''}`} />
                  <span>Refresh</span>
                </>
              )}
            </button>

            <Link
              href="/"
              target="_blank"
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-slate-500" />
              <span>View Store</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 overflow-x-auto text-xs font-bold pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#064E3B] text-[#064E3B] font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders & Fulfillment ({orders.length})</span>
            {orders.filter((o) => o.status === OrderStatus.PENDING_CONFIRMATION || o.status === OrderStatus.PENDING_COD_VERIFICATION || o.status === OrderStatus.CONFIRMED).length > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-black">
                {orders.filter((o) => o.status === OrderStatus.PENDING_CONFIRMATION || o.status === OrderStatus.PENDING_COD_VERIFICATION || o.status === OrderStatus.CONFIRMED).length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'products'
                ? 'border-[#064E3B] text-[#064E3B] font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Product Catalog & Stock ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics'
                ? 'border-[#064E3B] text-[#064E3B] font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-700" />
            <span>Dropship Analytics & Performance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'border-[#064E3B] text-[#064E3B] font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Store & Courier Settings</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* ========================================================= */}
        {/* TAB 1: ORDERS MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* ORDERS OPERATIONAL KPI CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {/* 1. Gross Settled */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <span className="truncate">Gross Settled</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-1 font-serif text-slate-900 font-black tracking-tight whitespace-nowrap">
                    <span className="text-xs font-bold text-slate-400">LKR</span>
                    <span className="text-xl sm:text-2xl font-black">{totalRevenue.toLocaleString()}.00</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 whitespace-nowrap">Excludes cancelled/returns</p>
                </div>
              </div>

              {/* 2. Total Orders */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <span className="truncate">Total Orders</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 font-serif tracking-tight whitespace-nowrap">
                    {orders.length}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 whitespace-nowrap">Customer checkouts</p>
                </div>
              </div>

              {/* 3. Ready for iSales */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-emerald-200 bg-emerald-50/20 shadow-2xs space-y-1.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-emerald-800 text-xs font-bold uppercase tracking-wider">
                  <span className="truncate">Ready for iSales</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Copy className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-950 font-serif tracking-tight whitespace-nowrap">
                    {orders.filter((o) => o.status === OrderStatus.PENDING_CONFIRMATION || o.status === OrderStatus.PENDING_COD_VERIFICATION || o.status === OrderStatus.CONFIRMED).length}
                  </div>
                  <p className="text-[11px] text-emerald-700 font-medium mt-1 whitespace-nowrap">To submit to A to Z</p>
                </div>
              </div>

              {/* 4. COD In-Transit */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 bg-slate-50/40 shadow-2xs space-y-1.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-700 text-xs font-bold uppercase tracking-wider">
                  <span className="truncate">COD In-Transit</span>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 font-serif tracking-tight whitespace-nowrap">
                    {activeCodOrders.length}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1 whitespace-nowrap">Islandwide couriers</p>
                </div>
              </div>

              {/* 5. Cancelled / Returned (Protected P&L with matched icon & alignment) */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-rose-100 bg-rose-50/20 shadow-2xs space-y-1.5 flex flex-col justify-between col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between text-rose-700 text-xs font-bold uppercase tracking-wider">
                  <span className="truncate">Cancelled / Ret.</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-rose-900 font-serif tracking-tight whitespace-nowrap">
                    {cancelledOrReturnedOrders.length}
                  </div>
                  <p className="text-[11px] text-rose-600 font-medium mt-1 whitespace-nowrap">Protected P&L • Rs. 0 Loss</p>
                </div>
              </div>
            </div>
            {/* Filter & Search Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({orders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('ready_isales')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    statusFilter === 'ready_isales'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Ready for iSales ({orders.filter((o) => o.status === OrderStatus.PENDING_CONFIRMATION || o.status === OrderStatus.PENDING_COD_VERIFICATION || o.status === OrderStatus.CONFIRMED).length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('cod')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === 'cod'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  100% COD ({orders.filter((o) => o.paymentMethod === PaymentMethod.COD).length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('in_fulfilment')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === 'in_fulfilment'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  In Fulfilment ({orders.filter((o) => o.status === OrderStatus.CONFIRMED || o.status === OrderStatus.SHIPPED || o.status === OrderStatus.OUT_FOR_DELIVERY).length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('delivered')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === 'delivered'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
                  }`}
                >
                  Delivered ({orders.filter((o) => o.status === OrderStatus.DELIVERED).length})
                </button>
              </div>

              <div className="flex items-center gap-2">
                {orders.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllOrders}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    title="Clear all test / demo orders"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Clear All Orders</span>
                  </button>
                )}

                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search order #, customer, phone..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    {orders.length === 0 ? 'No Customer Orders Yet' : 'No Orders Match Criteria'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {orders.length === 0
                      ? 'When a customer places a COD or Bank Transfer order on your store, it will appear here instantly with customer details, phone, and district.'
                      : 'Try clearing filters or search query.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-black uppercase tracking-wider text-slate-500">
                        <th className="py-4 px-6">Order Ref</th>
                        <th className="py-4 px-6">Customer & District</th>
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6">Items</th>
                        <th className="py-4 px-6">Total (LKR)</th>
                        <th className="py-4 px-6">Payment Status</th>
                        <th className="py-4 px-6">Fulfillment</th>
                        <th className="py-4 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                      {filteredOrders.map((order) => {
                        const isBankPending =
                          order.paymentMethod === PaymentMethod.BANK_TRANSFER &&
                          (order.paymentStatus === PaymentStatus.VERIFICATION_PENDING ||
                            order.paymentStatus === PaymentStatus.AWAITING_TRANSFER);

                        return (
                          <tr
                            key={order.id}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              isBankPending ? 'bg-amber-50/30' : ''
                            }`}
                          >
                            <td className="py-4 px-6">
                              <span className="font-mono font-black text-slate-900 block">
                                {order.orderNumber}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400 block">
                                ID: {order.id}
                              </span>
                              <span className="text-[10px] text-slate-400 uppercase">
                                {order.paymentMethod === PaymentMethod.COD ? 'Doorstep COD' : 'Direct Bank Deposit'}
                              </span>
                            </td>

                            <td className="py-4 px-6">
                              <span className="font-bold text-slate-900 block truncate max-w-[160px]">
                                {order.shippingAddress?.fullName}
                              </span>
                              <span className="text-[11px] text-slate-500 block">
                                {order.shippingAddress?.city}, {order.shippingAddress?.district}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400">
                                {order.shippingAddress?.phone}
                              </span>
                            </td>

                            <td className="py-4 px-6 text-slate-500 text-[11px] whitespace-nowrap">
                              {new Date(order.createdAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>

                            <td className="py-4 px-6">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-800">
                                  {order.items?.reduce((s: number, i: any) => s + i.quantity, 0)} pcs
                                </span>
                                {(order.items?.[0]?.product?.sku || order.items?.[0]?.selectedVariant?.sku) && (
                                  <span className="font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    SKU: {order.items[0].product?.sku || order.items[0].selectedVariant?.sku}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-600 block truncate max-w-[150px] font-medium">
                                {order.items?.[0]?.product?.title}
                              </span>
                              {order.items?.[0]?.product?.id && (
                                <span className="font-mono text-[9px] text-slate-400 block truncate max-w-[150px]">
                                  PID: {order.items[0].product.id}
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-6 font-black text-slate-900 whitespace-nowrap">
                              {formatLKR(order.grandTotal)}
                            </td>

                            <td className="py-4 px-6 whitespace-nowrap">
                              <select
                                value={order.paymentStatus}
                                onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value as PaymentStatus)}
                                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border cursor-pointer transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#064E3B] ${
                                  order.paymentStatus === PaymentStatus.PAID || order.paymentStatus === PaymentStatus.COD_COLLECTED
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : order.paymentStatus === PaymentStatus.VERIFICATION_PENDING
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : order.paymentStatus === PaymentStatus.UNPAID
                                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                                    : 'bg-blue-50 text-blue-800 border-blue-200'
                                }`}
                                title="Update order payment status"
                              >
                                <option value={PaymentStatus.COD_PENDING}>COD PENDING</option>
                                <option value={PaymentStatus.COD_COLLECTED}>COD COLLECTED</option>
                                <option value={PaymentStatus.PAID}>PAID (VERIFIED)</option>
                                <option value={PaymentStatus.VERIFICATION_PENDING}>SLIP UPLOADED</option>
                                <option value={PaymentStatus.AWAITING_TRANSFER}>AWAITING SLIP</option>
                                <option value={PaymentStatus.UNPAID}>UNPAID / CANCELLED</option>
                              </select>
                            </td>

                            <td className="py-4 px-6 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleQuickOrderStatus(order.id, e.target.value as OrderStatus)}
                                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border cursor-pointer transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#064E3B] ${
                                    order.status === OrderStatus.DELIVERED
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                      : order.status === OrderStatus.OUT_FOR_DELIVERY
                                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                                      : order.status === OrderStatus.SHIPPED
                                      ? 'bg-blue-50 text-blue-800 border-blue-300'
                                      : order.status === OrderStatus.CONFIRMED
                                      ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                                      : order.status === OrderStatus.CANCELLED
                                      ? 'bg-rose-50 text-rose-800 border-rose-300'
                                      : 'bg-slate-100 text-slate-700 border-slate-200'
                                  }`}
                                  title="Update order dispatch & courier stage"
                                >
                                  <option value={OrderStatus.PENDING_CONFIRMATION}>1. PENDING (Order Placed)</option>
                                  <option value={OrderStatus.CONFIRMED}>2. CONFIRMED (In Packing)</option>
                                  <option value={OrderStatus.SHIPPED}>3. PARCEL DISPATCHED (In Transit)</option>
                                  <option value={OrderStatus.OUT_FOR_DELIVERY}>4. OUT FOR DELIVERY (Doorstep)</option>
                                  <option value={OrderStatus.DELIVERED}>5. DELIVERED (Cash Collected)</option>
                                  <option value={OrderStatus.CANCELLED}>6. CANCELLED / RETURNED</option>
                                </select>

                                {/* 1-Click Copy WhatsApp Sinhala + English Status Update */}
                                <button
                                  type="button"
                                  onClick={() => handleCopyWhatsAppStatus(order, order.status)}
                                  className={`p-1.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                                    copiedStatusOrderId === order.id
                                      ? 'bg-emerald-600 text-white border-emerald-600'
                                      : 'bg-[#25D366]/10 text-emerald-800 border-emerald-300/80 hover:bg-[#25D366] hover:text-white'
                                  }`}
                                  title="Copy WhatsApp status message (Sinhala & English) to send to customer"
                                >
                                  {copiedStatusOrderId === order.id ? (
                                    <Check className="w-3.5 h-3.5" />
                                  ) : (
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                {/* Direct Open in WhatsApp with pre-filled message */}
                                {order.shippingAddress?.phone && (
                                  <a
                                    href={`https://wa.me/${order.shippingAddress.phone.replace(/[^0-9]/g, '').replace(/^0/, '94')}?text=${encodeURIComponent(generateWhatsAppStatusMessage(order, order.status))}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
                                    title="Open WhatsApp chat directly"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </td>

                            <td className="py-4 px-6 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const isalesText = `--- A TO Z TRADERS (iSALES) ORDER ENTRY ---
Customer Name: ${order.shippingAddress?.fullName}
Address: ${order.shippingAddress?.addressLine1}${order.shippingAddress?.addressLine2 ? ', ' + order.shippingAddress.addressLine2 : ''}
City: ${order.shippingAddress?.city}
District: ${order.shippingAddress?.district || 'Colombo'}
Contact Number One: ${order.shippingAddress?.phone}
Contact Number Two: ${order.shippingAddress?.alternatePhone || 'N/A'}
Due Date: ${new Date().toISOString().split('T')[0]}
Order Source: NookMint Website
Payment Method: COD
Order Note: ${order.shippingAddress?.landmark || order.orderNumber}
Mark for Print WB: Marked as print Waybill Only
Product Codes / SKUs: ${order.items?.map((i: any) => i.product?.sku || i.selectedVariant?.sku || i.product?.id).join(', ')}
Total Quantity: ${order.items?.reduce((s: number, i: any) => s + i.quantity, 0)}
Total COD Amount: Rs. ${order.grandTotal}`;
                                    copyToClipboard(isalesText, `row-${order.id}`);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-extrabold transition-all shadow-2xs flex items-center gap-1 active:scale-95"
                                  title="Copy delivery details formatted for A to Z Traders (iSales)"
                                >
                                  <Copy className="w-3 h-3 text-emerald-700" />
                                  <span>{copiedField === `row-${order.id}` ? 'Copied! ✓' : 'Copy for iSales'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setSelectedFulfillmentStatus(order.status);
                                    setOrderUpdateFeedback('');
                                    setCourierTracking('');
                                  }}
                                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-xs"
                                >
                                  Manage Order
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                                  className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 border border-rose-200 flex items-center justify-center transition-colors shadow-2xs shrink-0 cursor-pointer"
                                  title="Delete order"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PRODUCT INVENTORY & PRICING */}
        {/* ========================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 font-serif">Product Catalog & Dropship Control</h2>
                <p className="text-xs text-slate-500">
                  Manage iSales catalogue products, wholesale costs, selling prices, stock, and showcase items in Homepage Popular & New Arrivals.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => openAddProductModal('dropship')}
                  className="px-4 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#04382A] text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                  title="Upload A to Z Traders dropshipping catalogue item"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Dropship Product (iSales)</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAddProductModal('own')}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-xs cursor-pointer border border-slate-800"
                  title="Upload in-house manufactured or warehouse stocked item"
                >
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Add In-House Product</span>
                </button>

                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-200/80 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>{products.length} Products Live</span>
                </span>
              </div>
            </div>

            {/* Real-Time Product & SKU Search Bar */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                placeholder="Search products by title, product code / SKU (e.g. AZ-4040, gadget-01), or description..."
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#064E3B] shadow-2xs"
              />
              {productSearchQuery && (
                <button
                  type="button"
                  onClick={() => setProductSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Inventory Sourcing & Category Filter Bar */}
            <div className="space-y-2.5">
              {/* Row 1: Sourcing Channels (Dropship vs In-House) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-1">Source:</span>
                <button
                  type="button"
                  onClick={() => setProductSourceFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    productSourceFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  All Sources ({products.length})
                </button>
                <button
                  type="button"
                  onClick={() => setProductSourceFilter('dropship')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    productSourceFilter === 'dropship'
                      ? 'bg-[#064E3B] text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>A to Z Dropship ({products.filter((p) => (p.sourceType || 'dropship') === 'dropship').length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProductSourceFilter('own')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    productSourceFilter === 'own'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>In-House Stock ({products.filter((p) => p.sourceType === 'own').length})</span>
                </button>
              </div>

              {/* Row 2: Categories, Popular Showcase & New Arrivals */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-1">Filter:</span>
                <button
                  type="button"
                  onClick={() => setProductCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    productCategoryFilter === 'all'
                      ? 'bg-[#064E3B] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  All Categories
                </button>
                <button
                  type="button"
                  onClick={() => setProductCategoryFilter('popular')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    productCategoryFilter === 'popular'
                      ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-400/30'
                      : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                  }`}
                  title="Filter products currently showcased in Homepage Popular section"
                >
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>Popular Showcase ({products.filter((p) => p.isBestSeller).length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProductCategoryFilter('new_arrivals')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    productCategoryFilter === 'new_arrivals'
                      ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-400/30'
                      : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                  }`}
                  title="Filter products currently showcased in Homepage New Arrivals section"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>New Arrivals ({products.filter((p) => p.isNewArrival).length})</span>
                </button>
                {availableCategories
                  .filter((cat) => products.filter((p) => p.category === cat).length > 0)
                  .map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setProductCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        productCategoryFilter === cat
                          ? 'bg-[#064E3B] text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {cat} ({products.filter((p) => p.category === cat).length})
                    </button>
                  ))}
              </div>
            </div>

            {productFeedback && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{productFeedback}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products
                .filter((p) => {
                  if (productSearchQuery.trim()) {
                    const q = productSearchQuery.toLowerCase().trim();
                    const matches =
                      p.title?.toLowerCase().includes(q) ||
                      (p.sku && p.sku.toLowerCase().includes(q)) ||
                      p.id?.toLowerCase().includes(q) ||
                      p.category?.toLowerCase().includes(q) ||
                      (p.description && p.description.toLowerCase().includes(q));
                    if (!matches) return false;
                  }
                  if (productSourceFilter === 'dropship' && (p.sourceType || 'dropship') !== 'dropship') return false;
                  if (productSourceFilter === 'own' && p.sourceType !== 'own') return false;
                  if (productCategoryFilter === 'popular') return p.isBestSeller === true;
                  if (productCategoryFilter === 'new_arrivals') return p.isNewArrival === true;
                  if (productCategoryFilter !== 'all') return p.category === productCategoryFilter;
                  return true;
                })
                .map((product) => {
                const totalStock = product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
                const inStock = totalStock > 0;
                const wholesaleCost = product.costPrice || Math.round(product.sellingPrice * 0.7);
                const estimatedProfit = product.sellingPrice - wholesaleCost;
                const isDropship = (product.sourceType || 'dropship') === 'dropship';

                return (
                  <div
                    key={product.id}
                    className={`rounded-3xl border shadow-2xs overflow-hidden flex flex-col justify-between transition-all ${
                      product.isHidden
                        ? 'bg-slate-50/70 border-rose-200 border-dashed opacity-85'
                        : 'bg-white border-slate-200/80 hover:border-emerald-300'
                    }`}
                  >
                    <div className="p-5 flex gap-4 items-start">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.images?.[0] || getCategoryImage(product.category)}
                        alt={product.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getCategoryImage(product.category);
                        }}
                        className="w-20 h-24 object-cover object-center rounded-2xl bg-stone-50 shrink-0 border border-slate-100 shadow-2xs"
                      />
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {product.category}
                            </span>
                            {product.isHidden ? (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 shadow-2xs">
                                <EyeOff className="w-2.5 h-2.5 text-rose-700" />
                                <span>HIDDEN</span>
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <Eye className="w-2.5 h-2.5 text-emerald-600" />
                                <span>LIVE</span>
                              </span>
                            )}
                            {isDropship ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-[#064E3B] border border-emerald-200 flex items-center gap-1">
                                <Package className="w-2.5 h-2.5" />
                                <span>DROPSHIP</span>
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1">
                                <Building2 className="w-2.5 h-2.5" />
                                <span>IN-HOUSE</span>
                              </span>
                            )}
                            {product.offerPercentage > 0 && (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                                {product.offerPercentage}% OFF
                              </span>
                            )}
                            {product.isBestSeller && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-rose-600 text-white flex items-center gap-1 shadow-2xs">
                                <Flame className="w-2.5 h-2.5 fill-white" />
                                <span>POPULAR</span>
                              </span>
                            )}
                            {product.isNewArrival && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-500 text-white flex items-center gap-1 shadow-2xs">
                                <Sparkles className="w-2.5 h-2.5 fill-white" />
                                <span>NEW</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Visibility Eye Icon Toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleProductVisibility(product.id, !!product.isHidden)}
                              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                product.isHidden
                                  ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 ring-1 ring-rose-200'
                                  : 'text-slate-400 hover:text-emerald-700 hover:bg-emerald-50'
                              }`}
                              title={
                                product.isHidden
                                  ? 'Product is HIDDEN from customers. Click to show on store.'
                                  : 'Product is LIVE & visible to customers. Click to hide.'
                              }
                              aria-label={product.isHidden ? 'Hidden from customers - click to show' : 'Live on store - click to hide'}
                            >
                              {product.isHidden ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct(product);
                                const autoOffer =
                                  product.mrp > product.sellingPrice
                                    ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
                                    : 0;
                                setProductForm({
                                  title: product.title,
                                  sku: product.sku || product.id,
                                  sourceType: product.sourceType || 'dropship',
                                  category: product.category,
                                  brand: product.brand || 'NookMint',
                                  unit: product.unit || '1 item',
                                  isNewArrival: product.isNewArrival ?? false,
                                  isBestSeller: product.isBestSeller ?? false,
                                  costPrice: product.costPrice || Math.round((product.sellingPrice || 3000) * 0.7),
                                  sellingPrice: product.sellingPrice,
                                  mrp: product.mrp,
                                  offerPercentage: typeof product.offerPercentage === 'number' ? product.offerPercentage : autoOffer,
                                  description: product.description || '',
                                  variants:
                                    product.variants && product.variants.length > 0
                                      ? product.variants.map((v: any) => ({
                                          size: v.size,
                                          stock: v.stock,
                                          sku: v.sku,
                                          image: v.image,
                                          colorHex: v.colorHex,
                                        }))
                                      : [
                                          { size: 'Standard', stock: 15 },
                                        ],
                                  deliveryFeeType: product.deliveryFeeType || 'default',
                                  customDeliveryFee: product.customDeliveryFee || 350,
                                  images: product.images && product.images.length > 0 ? [...product.images] : [],
                                  videoUrl: product.videoUrl || '',
                                });
                                setIsAddingProduct(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-[#064E3B] rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Edit details & price"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            Code: {product.sku || product.id}
                          </span>
                          {product.brand && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              • {product.brand}
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 min-h-[36px]" title={product.title}>
                          {product.title}
                        </h3>

                        <div className="flex items-baseline gap-2 pt-0.5">
                          <span className="text-sm font-black text-[#064E3B] font-serif">
                            {formatLKR(product.sellingPrice)}
                          </span>
                          {product.mrp > product.sellingPrice && (
                            <span className="text-[11px] text-slate-400 line-through font-mono">
                              {formatLKR(product.mrp)}
                            </span>
                          )}
                        </div>

                        {/* Dropship Margin Display */}
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 pt-0.5 font-medium flex-wrap">
                          <span className="text-slate-400">{isDropship ? 'Wholesale:' : 'Unit Cost:'}</span>
                          <span className="font-mono font-bold text-slate-700">Rs. {wholesaleCost}</span>
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {isDropship ? 'Margin:' : 'Direct Profit:'} +Rs. {estimatedProfit}
                          </span>
                        </div>

                        {/* Interactive Stock per Option/Size Controller */}
                        <div className="pt-2 space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                            <span>Stock Units:</span>
                            <span className="text-slate-500 font-mono">Total: {totalStock} pcs</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {product.variants?.map((v: any) => (
                              <div
                                key={v.size}
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                                  v.stock > 0
                                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                                    : 'bg-red-50 border-red-200 text-red-600'
                                }`}
                              >
                                <span className="font-sans font-extrabold text-[10px] text-slate-900">{v.size}:</span>
                                <button
                                  type="button"
                                  onClick={() => handleQuickUpdateStock(product.id, v.size, Math.max(0, v.stock - 1))}
                                  className="w-3.5 h-3.5 rounded bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center text-[10px] font-bold border border-slate-200"
                                  title="Decrease quantity by 1"
                                >
                                  -
                                </button>
                                <span className={`min-w-4 text-center text-[11px] font-black ${v.stock === 0 ? 'text-red-600' : 'text-slate-900'}`}>
                                  {v.stock}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleQuickUpdateStock(product.id, v.size, v.stock + 1)}
                                  className="w-3.5 h-3.5 rounded bg-white hover:bg-emerald-100 text-slate-500 hover:text-emerald-700 flex items-center justify-center text-[10px] font-bold border border-slate-200"
                                  title="Increase quantity by 1"
                                >
                                  +
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-1 flex items-center gap-2 flex-wrap text-[10px]">
                          {product.deliveryFeeType === 'free' && (
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                              <Truck className="w-3 h-3 text-emerald-700" />
                              <span>FREE COD Delivery</span>
                            </span>
                          )}
                          {product.deliveryFeeType === 'custom' && (
                            <span className="font-bold text-[#064E3B] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                              <Truck className="w-3 h-3 text-[#064E3B]" />
                              <span>Custom Fee: Rs. {product.customDeliveryFee}</span>
                            </span>
                          )}
                          {product.deliveryFeeType === 'default' && (
                            <span className="font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Truck className="w-3 h-3 text-slate-500" />
                              <span>Islandwide COD Standard</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            inStock ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                        />
                        <span className="text-xs font-bold text-slate-700">
                          {inStock ? `In Stock (${totalStock})` : 'Out of Stock'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end">
                        {/* 1-Click Toggle Popular Showcase Button */}
                        <button
                          type="button"
                          onClick={() => handleTogglePopular(product.id, !!product.isBestSeller)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            product.isBestSeller
                              ? 'bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs ring-1 ring-rose-200'
                              : 'bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-600 border border-slate-200'
                          }`}
                          title="Click to toggle display in customer Homepage 'Popular Products' section"
                        >
                          <Flame className={`w-3.5 h-3.5 ${product.isBestSeller ? 'fill-rose-600 text-rose-600' : 'text-slate-400'}`} />
                          <span>{product.isBestSeller ? 'Popular' : 'Mark Popular'}</span>
                        </button>

                        {/* 1-Click Toggle New Arrival Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleNewArrival(product.id, !!product.isNewArrival)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            product.isNewArrival
                              ? 'bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs ring-1 ring-amber-200'
                              : 'bg-white hover:bg-amber-50 hover:text-amber-800 text-slate-600 border border-slate-200'
                          }`}
                          title="Click to toggle display in customer Homepage 'New Arrivals' section"
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${product.isNewArrival ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                          <span>{product.isNewArrival ? 'New' : 'Mark New'}</span>
                        </button>

                        {/* 1-Click Toggle Store Visibility (Eye Button) */}
                        <button
                          type="button"
                          onClick={() => handleToggleProductVisibility(product.id, !!product.isHidden)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            product.isHidden
                              ? 'bg-rose-100 text-rose-900 border border-rose-300 hover:bg-rose-200 shadow-2xs'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                          title={product.isHidden ? 'Click to show product on customer store' : 'Click to hide product from customers'}
                        >
                          {product.isHidden ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-rose-700" />
                              <span>Hidden</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Live</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleProductStock(product.id, inStock)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            inStock
                              ? 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                          title={inStock ? 'Mark product out of stock' : 'Mark product in stock'}
                        >
                          {inStock ? 'Mark Out' : 'Mark In'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: DROPSHIP ANALYTICS & PERFORMANCE (LIVE PRODUCTION METRICS) */}
        {/* ========================================================= */}
        {activeTab === 'analytics' && (() => {
          // 1. Filter orders within the selected date range & strictly exclude cancelled/returned
          const validOrders = orders.filter((o) => {
            if (o.status === OrderStatus.CANCELLED || (o as any).status === 'CANCELLED' || (o as any).status === 'RETURNED') {
              return false;
            }
            if (analyticsStartDate && analyticsEndDate) {
              const orderDate = new Date(o.createdAt || Date.now()).toISOString().split('T')[0];
              if (orderDate < analyticsStartDate || orderDate > analyticsEndDate) {
                return false;
              }
            }
            return true;
          });

          // 2. Dynamic KPI metrics from valid orders
          const totalSalesRevenue = validOrders.reduce((acc, o) => acc + (Number(o.grandTotal) || Number(o.subtotal) || 0), 0);
          const totalOrdersCount = validOrders.length;

          // Dynamic net profit: Selling Price - Wholesale Cost
          const totalProfitCalculated = validOrders.reduce((sum, o) => {
            const orderProfit = (o.items || []).reduce((itemSum: number, item: any) => {
              const sp = Number(item.product?.sellingPrice || item.price || 0);
              const cp = Number(item.product?.costPrice || (sp > 0 ? Math.round(sp * 0.72) : 0));
              const unitProfit = Math.max(0, sp - cp);
              const qty = Number(item.quantity) || 1;
              return itemSum + (unitProfit * qty);
            }, 0);
            return sum + orderProfit;
          }, 0);

          const profitMarginPct = totalSalesRevenue > 0 ? (totalProfitCalculated / totalSalesRevenue) * 100 : 0;
          const avgOrderValue = totalOrdersCount > 0 ? totalSalesRevenue / totalOrdersCount : 0;

          // 3. Dynamic Catalog Performance Data (From merchant's real uploaded products)
          const catalogPerformanceData = products.map((prod) => {
            const sp = Number(prod.sellingPrice) || 0;
            const cp = Number(prod.costPrice) || (sp > 0 ? Math.round(sp * 0.72) : 0);
            const unitProfit = Math.max(0, sp - cp);

            // Count actual units sold for this product in valid orders
            let soldUnits = 0;
            validOrders.forEach((o) => {
              (o.items || []).forEach((it: any) => {
                if (
                  it.productId === prod.id ||
                  it.product?.id === prod.id ||
                  (it.product?.title && it.product.title.toLowerCase() === prod.title.toLowerCase())
                ) {
                  soldUnits += (Number(it.quantity) || 1);
                }
              });
            });

            const rev = soldUnits * sp;
            const prof = soldUnits * unitProfit;
            const margin = sp > 0 ? (unitProfit / sp) * 100 : 0;

            return {
              id: prod.id,
              title: prod.title,
              sku: prod.sku || `AZ-${prod.id.slice(0, 4)}`,
              category: prod.category || 'Household & Kitchen',
              sellingPrice: sp,
              costPrice: cp,
              profitPerUnit: unitProfit,
              ordersCount: soldUnits,
              revenue: rev,
              profit: prof,
              marginPct: margin,
              image: (prod.images && prod.images[0]) || '/nookmint_images/hero.png',
            };
          });

          // Sorted by profit desc for Top Performing Products
          const topPerformingProducts = [...catalogPerformanceData]
            .filter((p) => p.ordersCount > 0)
            .sort((a, b) => b.profit - a.profit)
            .slice(0, 3);

          const filteredTableData = catalogPerformanceData.filter((item) => {
            const q = performanceSearchQuery.toLowerCase().trim();
            if (!q) return true;
            return (
              item.title.toLowerCase().includes(q) ||
              item.sku.toLowerCase().includes(q) ||
              item.category.toLowerCase().includes(q)
            );
          });

          // Order status breakdown (Delivered, In Fulfillment, Ready for iSales, Cancelled/Returned)
          const deliveredCount = orders.filter((o) => o.status === OrderStatus.DELIVERED).length;
          const inFulfillmentCount = orders.filter(
            (o) => o.status === OrderStatus.CONFIRMED || o.status === OrderStatus.SHIPPED || o.status === OrderStatus.OUT_FOR_DELIVERY
          ).length;
          const readyForIsalesCount = orders.filter(
            (o) => o.status === OrderStatus.PENDING_CONFIRMATION || o.status === OrderStatus.PENDING_COD_VERIFICATION
          ).length;
          const cancelledOrReturnedCount = cancelledOrReturnedOrders.length;
          const allOrdersCount = orders.length;

          const deliveredPct = allOrdersCount > 0 ? Math.round((deliveredCount / allOrdersCount) * 100) : 0;
          const inFulfillmentPct = allOrdersCount > 0 ? Math.round((inFulfillmentCount / allOrdersCount) * 100) : 0;
          const readyPct = allOrdersCount > 0 ? Math.round((readyForIsalesCount / allOrdersCount) * 100) : 0;
          const cancelledPct = allOrdersCount > 0 ? Math.round((cancelledOrReturnedCount / allOrdersCount) * 100) : 0;

          // Category sales calculation
          const categorySalesMap: Record<string, { revenue: number; profit: number }> = {};
          validOrders.forEach((o) => {
            (o.items || []).forEach((it: any) => {
              const cat = it.product?.category || 'General';
              const sp = Number(it.product?.sellingPrice || it.price || 0);
              const cp = Number(it.product?.costPrice || (sp > 0 ? Math.round(sp * 0.72) : 0));
              const qty = Number(it.quantity) || 1;
              if (!categorySalesMap[cat]) categorySalesMap[cat] = { revenue: 0, profit: 0 };
              categorySalesMap[cat].revenue += sp * qty;
              categorySalesMap[cat].profit += Math.max(0, sp - cp) * qty;
            });
          });

          const categoryKeys = Object.keys(categorySalesMap);

          return (
            <div className="space-y-7">
              {/* HEADER WITH TITLE, TIMEFRAME FILTERS & CALENDAR */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100/90 text-[#064E3B] flex items-center justify-center shrink-0 shadow-2xs border border-emerald-200/60">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif tracking-tight">
                      Analytics & Business Insights
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                      Track sales, profit, best products and overall store performance.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Period Filter Buttons */}
                  <div className="bg-white p-1 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setAnalyticsPeriod('3m');
                        const end = new Date();
                        const start = new Date();
                        start.setMonth(start.getMonth() - 3);
                        setAnalyticsStartDate(start.toISOString().split('T')[0]);
                        setAnalyticsEndDate(end.toISOString().split('T')[0]);
                        setShowCustomDatePicker(false);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                        analyticsPeriod === '3m'
                          ? 'bg-[#064E3B] text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold'
                      }`}
                    >
                      Last 3 Months
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAnalyticsPeriod('6m');
                        const end = new Date();
                        const start = new Date();
                        start.setMonth(start.getMonth() - 6);
                        setAnalyticsStartDate(start.toISOString().split('T')[0]);
                        setAnalyticsEndDate(end.toISOString().split('T')[0]);
                        setShowCustomDatePicker(false);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                        analyticsPeriod === '6m'
                          ? 'bg-[#064E3B] text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold'
                      }`}
                    >
                      Last 6 Months
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAnalyticsPeriod('1y');
                        const end = new Date();
                        const start = new Date();
                        start.setFullYear(start.getFullYear() - 1);
                        setAnalyticsStartDate(start.toISOString().split('T')[0]);
                        setAnalyticsEndDate(end.toISOString().split('T')[0]);
                        setShowCustomDatePicker(false);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                        analyticsPeriod === '1y'
                          ? 'bg-[#064E3B] text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold'
                      }`}
                    >
                      Last 1 Year
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAnalyticsPeriod('custom');
                        setShowCustomDatePicker(!showCustomDatePicker);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        analyticsPeriod === 'custom'
                          ? 'bg-[#064E3B] text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Custom Range</span>
                    </button>
                  </div>

                  {/* Calendar Pill Button & Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
                      className="bg-white px-4 py-2 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-2 text-xs font-bold text-slate-700 hover:border-emerald-600 transition-all cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 text-emerald-700" />
                      <span className="font-semibold text-slate-800">
                        {analyticsPeriod === '3m'
                          ? 'Last 3 Months'
                          : analyticsPeriod === '6m'
                          ? 'Last 6 Months'
                          : analyticsPeriod === '1y'
                          ? 'Last 1 Year'
                          : `${analyticsStartDate} – ${analyticsEndDate}`}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {showCustomDatePicker && (
                      <div className="absolute right-0 mt-2 z-50 w-72 bg-white p-4 rounded-3xl border border-slate-200 shadow-xl space-y-3">
                        <div className="text-xs font-bold text-slate-800">Select Custom Date Range</div>
                        <div className="space-y-2 text-xs">
                          <div>
                            <label className="text-[11px] text-slate-500 font-semibold block mb-1">Start Date</label>
                            <input
                              type="date"
                              value={analyticsStartDate}
                              onChange={(e) => setAnalyticsStartDate(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-emerald-600"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-500 font-semibold block mb-1">End Date</label>
                            <input
                              type="date"
                              value={analyticsEndDate}
                              onChange={(e) => setAnalyticsEndDate(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-emerald-600"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setShowCustomDatePicker(false)}
                            className="px-3 py-1 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAnalyticsPeriod('custom');
                              setShowCustomDatePicker(false);
                            }}
                            className="px-3 py-1 rounded-xl text-xs font-bold bg-[#064E3B] text-white"
                          >
                            Apply Range
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* P&L PROTECTION ALERT BANNER */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="flex items-center gap-2.5 text-emerald-900 font-medium">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span>
                    <strong className="font-bold text-emerald-950">Protected Dropship P&L:</strong>{' '}
                    {cancelledOrReturnedCount === 0
                      ? 'All customer orders are verified with zero loss protection. Cancelled and returned orders are automatically isolated from revenue and profit.'
                      : `All ${cancelledOrReturnedCount} cancelled or returned customer orders are strictly excluded from gross sales, profit, and margin totals to keep your A to Z Traders financial records 100% compliant.`}
                  </span>
                </div>
                <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px] shrink-0 border border-emerald-200/70">
                  Zero Loss Guaranteed
                </span>
              </div>

              {/* 5 KPI METRICS CARDS (Dynamic from valid orders) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
                {/* 1. Total Sales (Revenue) */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#064E3B] flex items-center justify-center font-bold text-xs shrink-0">
                      $
                    </div>
                    <span className="text-xs font-bold text-slate-600 truncate">Total Sales (Revenue)</span>
                  </div>
                  <div className="flex items-baseline gap-1 font-serif text-slate-900 font-black tracking-tight whitespace-nowrap">
                    <span className="text-xs font-bold text-slate-400">LKR</span>
                    <span className="text-xl xl:text-2xl font-black">
                      {totalSalesRevenue.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <span>{totalOrdersCount > 0 ? `${totalOrdersCount} fulfilled orders` : 'Waiting for first order'}</span>
                  </div>
                </div>

                {/* 2. Total Orders */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-600 truncate">Total Orders</span>
                  </div>
                  <div className="font-serif text-slate-900 font-black tracking-tight whitespace-nowrap text-xl xl:text-2xl">
                    {totalOrdersCount}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <span>{allOrdersCount} total checkouts</span>
                  </div>
                </div>

                {/* 3. Total Profit */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#064E3B] flex items-center justify-center font-bold text-xs shrink-0">
                      <Coins className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-600 truncate">Total Profit</span>
                  </div>
                  <div className="flex items-baseline gap-1 font-serif text-slate-900 font-black tracking-tight whitespace-nowrap">
                    <span className="text-xs font-bold text-slate-400">LKR</span>
                    <span className="text-xl xl:text-2xl font-black text-emerald-950">
                      {totalProfitCalculated.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <span>Net dropship margin</span>
                  </div>
                </div>

                {/* 4. Profit Margin */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#064E3B] flex items-center justify-center font-bold text-xs shrink-0">
                      %
                    </div>
                    <span className="text-xs font-bold text-slate-600 truncate">Profit Margin</span>
                  </div>
                  <div className="font-serif text-slate-900 font-black tracking-tight whitespace-nowrap text-xl xl:text-2xl text-emerald-950">
                    {profitMarginPct.toFixed(1)}%
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <span>Clean profit share</span>
                  </div>
                </div>

                {/* 5. Average Order Value */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2 col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#064E3B] flex items-center justify-center font-bold text-xs shrink-0">
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-600 truncate">Average Order Value</span>
                  </div>
                  <div className="flex items-baseline gap-1 font-serif text-slate-900 font-black tracking-tight whitespace-nowrap">
                    <span className="text-xs font-bold text-slate-400">LKR</span>
                    <span className="text-xl xl:text-2xl font-black">
                      {avgOrderValue.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <span>Per order checkout</span>
                  </div>
                </div>
              </div>

              {/* ROW 1: SALES & PROFIT TREND (LEFT) + SALES BY CATEGORY (RIGHT) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left: Sales & Profit Trend (lg:col-span-7) */}
                <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-700" />
                      <h3 className="text-sm font-black text-slate-900 font-serif tracking-tight">Sales & Profit Trend</h3>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#064E3B]" />
                        <span className="text-slate-600">Sales (Revenue)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                        <span className="text-slate-600">Profit</span>
                      </div>
                    </div>
                  </div>

                  {validOrders.length === 0 ? (
                    <div className="h-56 flex flex-col items-center justify-center text-center p-6 space-y-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-2xs">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">No Sales Trajectory Data Yet</p>
                      <p className="text-[11px] text-slate-400 max-w-sm">
                        As real customer COD and bank transfer orders arrive, your live monthly sales curves and profit margins will automatically chart here.
                      </p>
                    </div>
                  ) : (
                    <div className="h-56 flex items-center justify-center">
                      <p className="text-xs text-slate-500 font-medium">
                        Total {validOrders.length} orders recorded. Sales: LKR {totalSalesRevenue.toLocaleString()}.00 | Profit: LKR {totalProfitCalculated.toLocaleString()}.00
                      </p>
                    </div>
                  )}
                </div>

                {/* Right: Sales by Category Donut Chart (lg:col-span-5) */}
                <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-sm font-black text-slate-900 font-serif tracking-tight">Sales by Category</h3>
                  </div>

                  {categoryKeys.length === 0 ? (
                    <div className="h-56 flex flex-col items-center justify-center text-center p-6 space-y-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-2xs">
                        <Layers className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">No Categorized Sales Yet</p>
                      <p className="text-[11px] text-slate-400 max-w-xs">
                        Category breakdown will automatically generate once orders are placed.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 py-4">
                      {categoryKeys.map((cat, idx) => {
                        const catRev = categorySalesMap[cat].revenue;
                        const pct = totalSalesRevenue > 0 ? ((catRev / totalSalesRevenue) * 100).toFixed(1) : '0';
                        return (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700">{cat}</span>
                            <span className="font-bold text-slate-900 font-mono">
                              {pct}% (LKR {catRev.toLocaleString()}.00)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* ROW 2: ORDER STATUS OVERVIEW + TOP PERFORMING PRODUCTS + PROFIT BY CATEGORY */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                {/* 1. Order Status Overview */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-sm font-black text-slate-900 font-serif tracking-tight">Order Status Overview</h3>
                  </div>

                  <div className="space-y-3 py-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#064E3B]" />
                        <span className="text-slate-600 font-medium">Delivered</span>
                      </div>
                      <span className="font-bold text-slate-900 font-mono">
                        {deliveredCount} ({deliveredPct}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                        <span className="text-slate-600 font-medium">In Fulfillment</span>
                      </div>
                      <span className="font-bold text-slate-900 font-mono">
                        {inFulfillmentCount} ({inFulfillmentPct}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                        <span className="text-slate-600 font-medium">Ready for iSales Entry</span>
                      </div>
                      <span className="font-bold text-slate-900 font-mono">
                        {readyForIsalesCount} ({readyPct}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#9CA3AF]" />
                        <span className="text-slate-600 font-medium">Cancelled / Returned</span>
                      </div>
                      <span className="font-bold text-rose-600 font-mono">
                        {cancelledOrReturnedCount} ({cancelledPct}%)
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 pt-2 text-center italic">
                    * {cancelledOrReturnedCount} Cancelled/Returned orders excluded from P&L revenue
                  </p>
                </div>

                {/* 2. Top Performing Products (by Profit) */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-700" />
                      <h3 className="text-sm font-black text-slate-900 font-serif tracking-tight">Top Performing Products</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('detailed-performance-table');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {topPerformingProducts.length === 0 ? (
                    <div className="py-10 text-center space-y-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mx-auto shadow-2xs">
                        <Award className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">No Product Sales Yet</p>
                      <p className="text-[11px] text-slate-400">Products with highest net dropship profit will rank here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5 my-auto">
                      {topPerformingProducts.map((prod, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-emerald-200 transition-colors">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <img
                              src={prod.image}
                              alt={prod.title}
                              className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1" title={prod.title}>
                                {prod.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                {prod.ordersCount} orders • Profit: <span className="font-bold text-emerald-800 font-mono">LKR {prod.profit.toLocaleString()}.00</span>
                              </p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800 text-[11px] font-bold shrink-0 whitespace-nowrap">
                            LKR {prod.profitPerUnit}.00 /pc
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 pt-3 text-center">
                    Ranked by total net dropship earnings deposited
                  </p>
                </div>

                {/* 3. Profit by Category */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-sm font-black text-slate-900 font-serif tracking-tight">Profit by Category</h3>
                  </div>

                  {categoryKeys.length === 0 ? (
                    <div className="py-10 text-center space-y-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mx-auto shadow-2xs">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">No Profit by Category Yet</p>
                      <p className="text-[11px] text-slate-400">Profit contribution per category will graph here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 py-4">
                      {categoryKeys.map((cat, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50">
                          <span className="font-semibold text-slate-700">{cat}</span>
                          <span className="font-bold text-emerald-800 font-mono">
                            LKR {categorySalesMap[cat].profit.toLocaleString()}.00
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 pt-1 text-center">
                    Net dropship earnings categorized by product category
                  </p>
                </div>
              </div>

              {/* DETAILED PERFORMANCE TABLE */}
              <div id="detailed-performance-table" className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-700" />
                      <h3 className="text-base font-black text-slate-900 font-serif tracking-tight">Detailed Performance</h3>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Product-wise sales, revenue, cost and profit analysis.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={performanceSearchQuery}
                        onChange={(e) => setPerformanceSearchQuery(e.target.value)}
                        placeholder="Search product (name, SKU, ...)"
                        className="pl-8 pr-8 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 w-56 sm:w-64"
                      />
                      {performanceSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setPerformanceSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Working CSV Export Button */}
                    <button
                      type="button"
                      onClick={() => handleExportAnalyticsCSV(filteredTableData)}
                      className="px-4 py-2 rounded-xl bg-emerald-50 text-[#064E3B] border border-emerald-300 font-bold text-xs flex items-center gap-2 hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/90 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-5">PRODUCT & SKU</th>
                        <th className="py-3.5 px-4">CATEGORY</th>
                        <th className="py-3.5 px-4 text-right">SELLING PRICE (LKR)</th>
                        <th className="py-3.5 px-4 text-right">PRODUCT COST (LKR)</th>
                        <th className="py-3.5 px-4 text-right">PROFIT / UNIT (LKR)</th>
                        <th className="py-3.5 px-4 text-center">ORDERS</th>
                        <th className="py-3.5 px-4 text-right">REVENUE (LKR)</th>
                        <th className="py-3.5 px-4 text-right">PROFIT (LKR)</th>
                        <th className="py-3.5 px-5 text-right">MARGIN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTableData.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                            <div className="space-y-1.5">
                              <Package className="w-6 h-6 text-slate-300 mx-auto" />
                              <p className="font-bold text-slate-700">No Products in Catalog</p>
                              <p className="text-[11px] text-slate-400">
                                Click <span className="font-bold text-emerald-800 cursor-pointer" onClick={() => setActiveTab('products')}>Product Catalog & Stock</span> above to upload your real products.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredTableData.map((item, idx) => (
                          <tr key={idx} className="hover:bg-emerald-50/20 transition-colors">
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 leading-snug">{item.title}</div>
                                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">SKU: {item.sku}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] border ${
                                item.category.includes('Gadgets')
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : item.category.includes('Garden')
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}>
                                {item.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800 tabular-nums">
                              {item.sellingPrice.toLocaleString()}.00
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-slate-500 tabular-nums">
                              {item.costPrice.toLocaleString()}.00
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px] font-mono tabular-nums inline-block">
                                {item.profitPerUnit.toLocaleString()}.00
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                              {item.ordersCount}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800 tabular-nums">
                              {item.revenue.toLocaleString()}.00
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-800 tabular-nums">
                              {item.profit.toLocaleString()}.00
                            </td>
                            <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-700 tabular-nums">
                              {item.marginPct.toFixed(1)}%
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ========================================================= */}
        {/* TAB 4: STORE & COURIER SETTINGS */}
        {/* ========================================================= */}
        {activeTab === 'settings' && settingsForm && (
          <div className="space-y-8">
            {settingsFeedback && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{settingsFeedback}</span>
                </div>
                <button type="button" onClick={() => setSettingsFeedback('')} className="text-emerald-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Bank Accounts & Category Taxonomy */}
              <div className="lg:col-span-6 space-y-8">
                {/* Corporate Bank Accounts Card */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#064E3B] flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900 font-serif">Dropship Payout Account</h2>
                      <p className="text-xs text-slate-500">Bank account where A to Z Traders deposits your fortnightly earnings</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddingBank(!isAddingBank)}
                    className="px-3 py-1.5 rounded-xl bg-[#064E3B] hover:bg-[#04382A] text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Bank</span>
                  </button>
                </div>

                {/* Add New Bank Form */}
                {isAddingBank && (
                  <form onSubmit={handleAddBankAccount} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase">New Payout Account</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Bank Name</label>
                        <input
                          type="text"
                          required
                          value={newBankForm.bankName}
                          onChange={(e) => setNewBankForm({ ...newBankForm, bankName: e.target.value })}
                          placeholder="e.g. Commercial Bank / Sampath Bank"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#064E3B]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Account Number</label>
                        <input
                          type="text"
                          required
                          value={newBankForm.accountNumber}
                          onChange={(e) => setNewBankForm({ ...newBankForm, accountNumber: e.target.value })}
                          placeholder="e.g. 018293847"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-[#064E3B]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Branch & Code</label>
                        <input
                          type="text"
                          value={newBankForm.branch}
                          onChange={(e) => setNewBankForm({ ...newBankForm, branch: e.target.value })}
                          placeholder="e.g. Colombo Fort (001)"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#064E3B]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Swift Code</label>
                        <input
                          type="text"
                          value={newBankForm.swiftCode}
                          onChange={(e) => setNewBankForm({ ...newBankForm, swiftCode: e.target.value })}
                          placeholder="e.g. CCEYLKLX"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-[#064E3B]"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingBank(false)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-[#064E3B] text-white text-xs font-bold hover:bg-[#04382A]"
                      >
                        Add to List
                      </button>
                    </div>
                  </form>
                )}

                {/* Bank Accounts List with In-Place Editing */}
                <div className="space-y-4">
                  {settingsForm.bankAccounts.map((bank, index) => (
                    <div key={index} className="p-4 rounded-2xl bg-[#FAF6F3] border border-emerald-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={bank.bankName}
                          onChange={(e) => {
                            const updated = [...settingsForm.bankAccounts];
                            updated[index].bankName = e.target.value;
                            setSettingsForm({ ...settingsForm, bankAccounts: updated });
                          }}
                          className="font-black text-slate-900 bg-transparent border-b border-dashed border-slate-300 text-sm focus:outline-none focus:border-[#064E3B]"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteBankAccount(index)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded-md"
                          title="Delete Bank"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Account Number</span>
                          <input
                            type="text"
                            value={bank.accountNumber}
                            onChange={(e) => {
                              const updated = [...settingsForm.bankAccounts];
                              updated[index].accountNumber = e.target.value;
                              setSettingsForm({ ...settingsForm, bankAccounts: updated });
                            }}
                            className="font-mono font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200 w-full text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Account Name</span>
                          <input
                            type="text"
                            value={bank.accountName}
                            onChange={(e) => {
                              const updated = [...settingsForm.bankAccounts];
                              updated[index].accountName = e.target.value;
                              setSettingsForm({ ...settingsForm, bankAccounts: updated });
                            }}
                            className="font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 w-full text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Branch & Code</span>
                          <input
                            type="text"
                            value={bank.branch}
                            onChange={(e) => {
                              const updated = [...settingsForm.bankAccounts];
                              updated[index].branch = e.target.value;
                              setSettingsForm({ ...settingsForm, bankAccounts: updated });
                            }}
                            className="text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 w-full text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Swift Code</span>
                          <input
                            type="text"
                            value={bank.swiftCode || ''}
                            onChange={(e) => {
                              const updated = [...settingsForm.bankAccounts];
                              updated[index].swiftCode = e.target.value;
                              setSettingsForm({ ...settingsForm, bankAccounts: updated });
                            }}
                            className="font-mono text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 w-full text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    disabled={isSavingSettings}
                    onClick={() => handleSaveSettings('banks')}
                    className="px-5 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#04382A] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingSettings ? 'Saving...' : 'Save Payout Details'}</span>
                  </button>
                </div>
              </div>

                {/* Product Categories Manager */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-5">
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#064E3B] flex items-center justify-center font-bold shrink-0">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900 font-serif">Store Product Categories</h2>
                        <p className="text-xs text-slate-500">Categories available for product assignment and storefront filters</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(!isAddingCategory)}
                      className="px-3 py-1.5 rounded-xl bg-[#064E3B] hover:bg-[#04382A] text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-xs shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Category</span>
                    </button>
                  </div>

                  {isAddingCategory && (
                    <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-3.5">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white border-2 border-emerald-200 shrink-0 relative flex items-center justify-center">
                          {newCategoryImage ? (
                            <Image
                              src={newCategoryImage}
                              alt="Category preview"
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-emerald-600" />
                          )}
                        </div>

                        <div className="flex-1 w-full space-y-2">
                          <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Type category name (e.g. Smart Audio, Household)..."
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddNewCategory();
                              }
                            }}
                          />

                          <div className="flex flex-wrap items-center gap-2">
                            <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-[#064E3B] text-[11px] font-bold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs">
                              <Camera className="w-3.5 h-3.5 text-[#064E3B]" />
                              <span>{newCategoryImage ? 'Change Photo' : 'Upload Category Photo'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleCategoryImageUpload(e)}
                                className="hidden"
                              />
                            </label>

                            <input
                              type="text"
                              value={newCategoryImage.startsWith('data:') ? '' : newCategoryImage}
                              onChange={(e) => setNewCategoryImage(e.target.value)}
                              placeholder="Or paste image URL (optional)..."
                              className="flex-1 min-w-[180px] px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-emerald-100">
                        <button
                          type="button"
                          onClick={() => setIsAddingCategory(false)}
                          className="px-3 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddNewCategory()}
                          className="px-4 py-1.5 rounded-xl bg-[#064E3B] hover:bg-[#04382A] text-white text-xs font-bold transition-colors shadow-xs"
                        >
                          Save Category
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {categoryItemList.map((cat) => {
                      const count = products.filter((p) => p.category === cat.name).length;
                      return (
                        <div
                          key={cat.id || cat.name}
                          className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Circular Category Photo Thumbnail */}
                            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-emerald-50 border border-emerald-200 shrink-0">
                              <Image
                                src={cat.image || getCategoryImage(cat.name)}
                                alt={cat.name}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 truncate">
                                {cat.name}
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium">
                                {count} product{count === 1 ? '' : 's'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Upload / Change Category Photo */}
                            <label
                              className="cursor-pointer p-1.5 rounded-lg text-slate-400 hover:text-[#064E3B] hover:bg-emerald-50 transition-colors"
                              title={`Change photo for ${cat.name}`}
                              aria-label={`Change photo for ${cat.name}`}
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleCategoryImageUpload(e, cat.name)}
                                className="hidden"
                              />
                            </label>

                            {/* Delete Category Button (Enabled for ALL categories) */}
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title={`Delete Category "${cat.name}"`}
                              aria-label={`Delete category ${cat.name}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Delivery Rates & Store Contact Details */}
              <div className="lg:col-span-6 space-y-8">
                {/* Delivery Rates Editor */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-5">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900 font-serif">Delivery & Courier Rates</h2>
                      <p className="text-xs text-slate-500">Live shipping fees calculated on checkout & cart</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">Colombo 01 - 15 Fee</span>
                        <span className="text-[11px] text-slate-500">Same-Day / Next-Day Express</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-500">Rs.</span>
                        <input
                          type="number"
                          value={settingsForm.delivery.colomboFee}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              delivery: { ...settingsForm.delivery, colomboFee: Number(e.target.value) },
                            })
                          }
                          className="w-24 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-right text-xs"
                        />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">Western Province Fee</span>
                        <span className="text-[11px] text-slate-500">Gampaha & Kalutara Districts</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-500">Rs.</span>
                        <input
                          type="number"
                          value={settingsForm.delivery.westernProvinceFee}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              delivery: { ...settingsForm.delivery, westernProvinceFee: Number(e.target.value) },
                            })
                          }
                          className="w-24 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-right text-xs"
                        />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">Outstation (22 Districts) Fee</span>
                        <span className="text-[11px] text-slate-500">Domex & Pronto Courier</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-500">Rs.</span>
                        <input
                          type="number"
                          value={settingsForm.delivery.outstationFee}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              delivery: { ...settingsForm.delivery, outstationFee: Number(e.target.value) },
                            })
                          }
                          className="w-24 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-right text-xs"
                        />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-emerald-950 block">Free Shipping Threshold</span>
                        <span className="text-[11px] text-emerald-800">Orders above this receive free delivery</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-emerald-700">Rs.</span>
                        <input
                          type="number"
                          value={settingsForm.delivery.freeShippingThreshold}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              delivery: { ...settingsForm.delivery, freeShippingThreshold: Number(e.target.value) },
                            })
                          }
                          className="w-24 px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg font-mono font-bold text-right text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block mb-1">COD Min Order (Rs.)</span>
                        <input
                          type="number"
                          value={settingsForm.delivery.codMinOrder}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              delivery: { ...settingsForm.delivery, codMinOrder: Number(e.target.value) },
                            })
                          }
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block mb-1">COD Max Order (Rs.)</span>
                        <input
                          type="number"
                          value={settingsForm.delivery.codMaxOrder}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              delivery: { ...settingsForm.delivery, codMaxOrder: Number(e.target.value) },
                            })
                          }
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs"
                        />
                      </div>
                    </div>

                    {/* Custom District & Regional Groups Manager */}
                    <div className="pt-4 border-t border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-extrabold text-xs text-slate-900 block">
                            Custom District Rates & Groups
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Create custom pricing for specific districts or group districts together
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsAddingDistrictRate(!isAddingDistrictRate)}
                          className="px-3 py-1.5 rounded-xl bg-[#064E3B] hover:bg-[#04382A] text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add District Rate</span>
                        </button>
                      </div>

                      {/* Add District Rate Inline Form */}
                      {isAddingDistrictRate && (
                        <form onSubmit={handleAddDistrictRate} className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                          <h4 className="text-xs font-bold text-slate-900 uppercase">New Custom District Rate / Group</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                Zone / Group Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={newDistrictRateForm.name}
                                onChange={(e) => setNewDistrictRateForm({ ...newDistrictRateForm, name: e.target.value })}
                                placeholder="e.g. Kandy Express or Southern Coastal"
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                  Delivery Fee (Rs.) *
                                </label>
                                <input
                                  type="number"
                                  required
                                  min={0}
                                  value={newDistrictRateForm.fee}
                                  onChange={(e) => setNewDistrictRateForm({ ...newDistrictRateForm, fee: Number(e.target.value) })}
                                  placeholder="450"
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-mono font-bold"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                  Estimated Days
                                </label>
                                <input
                                  type="text"
                                  value={newDistrictRateForm.estimatedDays}
                                  onChange={(e) => setNewDistrictRateForm({ ...newDistrictRateForm, estimatedDays: e.target.value })}
                                  placeholder="e.g. 1-2 Days"
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                                />
                              </div>
                            </div>
                          </div>

                          {/* District Click-to-Group Selector */}
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
                              Select Covered Districts (Click to toggle in this group):
                            </label>
                            <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200">
                              {SRI_LANKA_DISTRICTS.map((d) => {
                                const isSelected = newDistrictRateForm.districts.includes(d.district);
                                return (
                                  <button
                                    key={d.district}
                                    type="button"
                                    onClick={() => handleToggleDistrictInNewRate(d.district)}
                                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                                      isSelected
                                        ? 'bg-blue-600 text-white shadow-2xs'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                  >
                                    {isSelected ? '✓ ' : '+ '}{d.district}
                                  </button>
                                );
                              })}
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-1">
                              Selected: {newDistrictRateForm.districts.join(', ') || 'None selected'}
                            </span>
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setIsAddingDistrictRate(false)}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-600"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                            >
                              Add to Rates List
                            </button>
                          </div>
                        </form>
                      )}

                      {/* District Rates List */}
                      <div className="space-y-2.5">
                        {settingsForm.delivery.districtRates?.map((rate) => (
                          <div
                            key={rate.id}
                            className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900">{rate.name}</span>
                                <span className="text-[10px] text-slate-500 font-medium">({rate.estimatedDays})</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {rate.districts.map((dist) => (
                                  <span key={dist} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white text-slate-600 border border-slate-200">
                                    {dist === '*' ? 'All Other Outstation' : dist}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-slate-400 text-[11px]">Rs.</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={rate.fee}
                                  onChange={(e) => handleUpdateDistrictRateFee(rate.id, Number(e.target.value))}
                                  className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg font-mono font-bold text-right text-xs"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteDistrictRate(rate.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                title="Delete District Rate"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={isSavingSettings}
                      onClick={() => handleSaveSettings('delivery')}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingSettings ? 'Saving...' : 'Save Delivery Rates'}</span>
                    </button>
                  </div>
                </div>

                {/* Store Contact & WhatsApp Editor */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-5">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900 font-serif">Store Contact & WhatsApp</h2>
                      <p className="text-xs text-slate-500">Contact links displayed across website and customer chats</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        WhatsApp Number (International without +)
                      </label>
                      <input
                        type="text"
                        value={settingsForm.contact.whatsapp}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            contact: { ...settingsForm.contact, whatsapp: e.target.value },
                          })
                        }
                        placeholder="e.g. 94771234567"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Display Hotline Phone
                      </label>
                      <input
                        type="text"
                        value={settingsForm.contact.phone}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            contact: { ...settingsForm.contact, phone: e.target.value },
                          })
                        }
                        placeholder="e.g. 077 123 4567"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Showroom Address
                      </label>
                      <input
                        type="text"
                        value={settingsForm.contact.address}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            contact: { ...settingsForm.contact, address: e.target.value },
                          })
                        }
                        placeholder="e.g. No. 45, Galle Road, Colombo 03, Sri Lanka"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Operating Hours
                      </label>
                      <input
                        type="text"
                        value={settingsForm.contact.workingHours}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            contact: { ...settingsForm.contact, workingHours: e.target.value },
                          })
                        }
                        placeholder="e.g. Mon - Sat: 9:00 AM - 8:00 PM"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={isSavingSettings}
                      onClick={() => handleSaveSettings('contact')}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingSettings ? 'Saving...' : 'Save Contact Details'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================= */}
      {/* ORDER ACTION MODAL (Centered, 100% Fixed & Stable on Scroll) */}
      {/* ============================================================= */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overscroll-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOrder(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 flex flex-col h-[90vh] max-h-[90vh] overflow-hidden">
            {/* Header (Pinned) */}
            <div className="px-6 py-4 sm:px-8 sm:py-5 border-b border-slate-100 flex items-start justify-between shrink-0 bg-white rounded-t-3xl z-10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#064E3B] block">
                  MANAGE ORDER LIFECYCLE
                </span>
                <h3 className="text-xl font-black text-slate-900 font-serif">
                  Order #{selectedOrder.orderNumber}
                </h3>
                <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    ID: {selectedOrder.id}
                  </span>
                  <span className="text-xs text-slate-400">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body (Single Scroll Container) */}
            <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-8 sm:py-6 space-y-5 sm:space-y-6 overscroll-contain text-xs">

            {orderUpdateFeedback && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{orderUpdateFeedback}</span>
              </div>
            )}

            {/* Customer & Delivery Details */}
            <div className="p-4 rounded-2xl bg-[#FAF6F3] border border-emerald-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400">Customer Details</span>
                <div className="font-bold text-slate-900 text-sm">{selectedOrder.shippingAddress?.fullName}</div>
                <div className="font-mono text-slate-700 flex items-center gap-1.5 pt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedOrder.shippingAddress?.phone}</span>
                </div>
                <a
                  href={`https://wa.me/94${selectedOrder.shippingAddress?.phone?.replace(/^0/, '')}?text=Hello%20${encodeURIComponent(
                    selectedOrder.shippingAddress?.fullName || 'Customer'
                  )}!%20This%20is%20NookMint%20regarding%20order%20${selectedOrder.orderNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 pt-1"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Chat on WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400">Shipping Address</span>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {selectedOrder.shippingAddress?.addressLine1}
                  {selectedOrder.shippingAddress?.addressLine2 && `, ${selectedOrder.shippingAddress.addressLine2}`}
                  <br />
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.district}
                  <br />
                  Postal Code: {selectedOrder.shippingAddress?.pincode}
                </p>
              </div>
            </div>

            {/* A TO Z TRADERS (iSALES) DROPSHIPPING QUICK-COPY ASSISTANT */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7]/70 border border-emerald-300 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#004D40] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    iS
                  </div>
                  <div>
                    <h4 className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                      <span>A to Z Traders (iSales) Dropship Transfer</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold uppercase">
                        Ready
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Copy fields directly into the iSales web order form
                    </p>
                  </div>
                </div>

                {/* Master Copy Button */}
                <button
                  type="button"
                  onClick={() => {
                    const primaryPhone = selectedOrder.shippingAddress?.phone || '';
                    const secPhone = selectedOrder.shippingAddress?.alternatePhone || 'N/A';
                    const prodSummary = selectedOrder.items
                      ?.map(
                        (i: any) =>
                          `${i.product.title} (Code: ${i.selectedVariant?.sku || i.product.id || 'N/A'}) x ${i.quantity} @ Rs. ${i.price}`
                      )
                      .join('\n');
                    const isalesText = `--- A TO Z TRADERS (iSALES) ORDER ENTRY ---
Customer Name: ${selectedOrder.shippingAddress?.fullName}
Address: ${selectedOrder.shippingAddress?.addressLine1}${selectedOrder.shippingAddress?.addressLine2 ? ', ' + selectedOrder.shippingAddress.addressLine2 : ''}
City: ${selectedOrder.shippingAddress?.city}
District: ${selectedOrder.shippingAddress?.district}
Contact Number One: ${primaryPhone}
Contact Number Two: ${secPhone}
Order Source: NookMint Website
Payment Method: COD
Order Note: ${selectedOrder.shippingAddress?.landmark || 'No special note'}
Products:
${prodSummary}
COD Collect Amount: Rs. ${selectedOrder.grandTotal}
Facebook Page: NookMint`;

                    copyToClipboard(isalesText, 'all');
                  }}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedField === 'all' ? 'Copied All to Clipboard! ✓' : '📋 Copy All for iSales'}</span>
                </button>
              </div>

              {/* Individual Field Fast-Copy Grid matching iSales form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                {/* Field 1: Customer Name */}
                <div className="p-2.5 rounded-xl bg-white border border-emerald-100 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Customer Name *</span>
                    <span className="font-bold text-slate-900 truncate block">
                      {selectedOrder.shippingAddress?.fullName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedOrder.shippingAddress?.fullName || '', 'name')}
                    className="p-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 shrink-0 text-[11px] font-extrabold transition-colors border border-emerald-200"
                    title="Copy Name"
                  >
                    {copiedField === 'name' ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>

                {/* Field 2: Contact Number One */}
                <div className="p-2.5 rounded-xl bg-white border border-emerald-100 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Contact Number One *</span>
                    <span className="font-mono font-bold text-slate-900 truncate block">
                      {selectedOrder.shippingAddress?.phone}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedOrder.shippingAddress?.phone || '', 'phone1')}
                    className="p-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 shrink-0 text-[11px] font-extrabold transition-colors border border-emerald-200"
                    title="Copy Phone 1"
                  >
                    {copiedField === 'phone1' ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>

                {/* Field 3: Contact Number Two */}
                <div className="p-2.5 rounded-xl bg-white border border-emerald-100 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Contact Number Two</span>
                    <span className="font-mono font-bold text-slate-900 truncate block">
                      {selectedOrder.shippingAddress?.alternatePhone || 'None'}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={!selectedOrder.shippingAddress?.alternatePhone}
                    onClick={() => copyToClipboard(selectedOrder.shippingAddress?.alternatePhone || '', 'phone2')}
                    className="p-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 disabled:opacity-40 text-emerald-800 shrink-0 text-[11px] font-extrabold transition-colors border border-emerald-200"
                    title="Copy Phone 2"
                  >
                    {copiedField === 'phone2' ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>

                {/* Field 4: Address */}
                <div className="p-2.5 rounded-xl bg-white border border-emerald-100 flex items-center justify-between gap-2 shadow-2xs sm:col-span-2">
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Address *</span>
                    <span className="font-medium text-slate-800 truncate block">
                      {selectedOrder.shippingAddress?.addressLine1}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedOrder.shippingAddress?.addressLine1 || '', 'address')}
                    className="p-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 shrink-0 text-[11px] font-extrabold transition-colors border border-emerald-200"
                    title="Copy Address"
                  >
                    {copiedField === 'address' ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>

                {/* Field 5: City */}
                <div className="p-2.5 rounded-xl bg-white border border-emerald-100 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">City *</span>
                    <span className="font-bold text-slate-900 truncate block">
                      {selectedOrder.shippingAddress?.city}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedOrder.shippingAddress?.city || '', 'city')}
                    className="p-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 shrink-0 text-[11px] font-extrabold transition-colors border border-emerald-200"
                    title="Copy City"
                  >
                    {copiedField === 'city' ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>

                {/* Field 6: District */}
                <div className="p-2.5 rounded-xl bg-white border border-emerald-100 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">District</span>
                    <span className="font-bold text-slate-900 truncate block">
                      {selectedOrder.shippingAddress?.district}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedOrder.shippingAddress?.district || '', 'district')}
                    className="p-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 shrink-0 text-[11px] font-extrabold transition-colors border border-emerald-200"
                    title="Copy District"
                  >
                    {copiedField === 'district' ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>

                {/* Field 7: COD Collect Amount */}
                <div className="p-2.5 rounded-xl bg-white border border-emerald-100 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">COD Amount to Collect *</span>
                    <span className="font-mono font-black text-[#064E3B] truncate block">
                      Rs. {selectedOrder.grandTotal}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(String(selectedOrder.grandTotal), 'cod')}
                    className="p-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 shrink-0 text-[11px] font-extrabold transition-colors border border-emerald-200"
                    title="Copy COD Amount"
                  >
                    {copiedField === 'cod' ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>

                {/* Field 8: Product Codes / SKUs */}
                <div className="p-2.5 rounded-xl bg-white border border-emerald-100 flex items-center justify-between gap-2 shadow-2xs sm:col-span-2 lg:col-span-3">
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Product Code / SKU</span>
                    <span className="font-mono font-bold text-emerald-800 text-[11px] truncate block">
                      {selectedOrder.items
                        ?.map((i: any) => `${i.product?.sku || i.selectedVariant?.sku || i.product?.id || 'N/A'} (Qty: ${i.quantity})`)
                        .join(' | ')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        selectedOrder.items?.map((i: any) => i.product?.sku || i.selectedVariant?.sku || i.product?.id).join(', ') || '',
                        'skus'
                      )
                    }
                    className="p-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 shrink-0 text-[11px] font-extrabold transition-colors border border-emerald-200"
                    title="Copy Product Codes"
                  >
                    {copiedField === 'skus' ? 'Copied ✓' : 'Copy Code'}
                  </button>
                </div>

                {/* Field 9: Order Note */}
                <div className="p-2.5 rounded-xl bg-white border border-emerald-100 flex items-center justify-between gap-2 shadow-2xs sm:col-span-2 lg:col-span-3">
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Order Note / Landmark</span>
                    <span className="text-slate-700 text-[11px] truncate block">
                      {selectedOrder.shippingAddress?.landmark || 'No special note'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(selectedOrder.shippingAddress?.landmark || '', 'note')
                    }
                    className="p-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 shrink-0 text-[11px] font-extrabold transition-colors border border-emerald-200"
                    title="Copy Order Note"
                  >
                    {copiedField === 'note' ? 'Copied ✓' : 'Copy Note'}
                  </button>
                </div>
              </div>
            </div>

            {/* FINANCIAL / PAYMENT STATUS ACTIONS */}
            <div className="p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Financial Payment Status</h4>
                  <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                    Method: {selectedOrder.paymentMethod === PaymentMethod.COD ? 'Cash on Delivery (Doorstep)' : 'Direct Bank Transfer'}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Grand Total</span>
                  <span className="text-lg font-black text-[#064E3B] font-serif">
                    {formatLKR(selectedOrder.grandTotal)}
                  </span>
                </div>
              </div>

              {/* Bank Transfer Slip Inspector */}
              {selectedOrder.paymentMethod === PaymentMethod.BANK_TRANSFER && (
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Bank Deposit Verification</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-700 font-bold border border-amber-200">
                      Ref: {selectedOrder.bankReference || 'None'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 space-y-1.5">
                    <span className="text-slate-500 block text-[11px] font-bold">Customer Slip / Transaction Details:</span>
                    {selectedOrder.slipUrl ? (
                      selectedOrder.slipUrl.startsWith('data:image/') || selectedOrder.slipUrl.startsWith('http') ? (
                        <div className="space-y-2 mt-1">
                          <div className="p-2.5 bg-white rounded-xl border border-amber-300 shadow-sm inline-block max-w-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={selectedOrder.slipUrl}
                              alt="Bank Transfer Slip Screenshot"
                              className="max-h-80 w-auto rounded-lg object-contain cursor-pointer hover:opacity-90"
                              onClick={() => {
                                const w = window.open('');
                                if (w) {
                                  w.document.write(`<img src="${selectedOrder.slipUrl}" style="max-width:100%;height:auto;margin:auto;display:block;" />`);
                                }
                              }}
                              title="Click to view full resolution"
                            />
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            ✓ Verified screenshot attached by customer. Click image to inspect full size.
                          </p>
                        </div>
                      ) : (
                        <p className="font-mono font-bold mt-0.5 bg-white p-2.5 rounded-lg border border-amber-200/80 text-slate-900">
                          {selectedOrder.slipUrl}
                        </p>
                      )
                    ) : (
                      <p className="text-xs italic text-slate-400 bg-white p-2.5 rounded-lg border border-amber-100">
                        No receipt slip or screenshot submitted yet by customer.
                      </p>
                    )}
                    {selectedOrder.verificationNotes && (
                      <p className="text-[11px] text-slate-500 mt-1 italic">{selectedOrder.verificationNotes}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedOrder.paymentStatus !== PaymentStatus.PAID ? (
                      <>
                        <button
                          type="button"
                          disabled={isUpdatingOrder}
                          onClick={() =>
                            handleUpdatePaymentStatus(
                              selectedOrder.id,
                              PaymentStatus.PAID,
                              `Verified in bank account by seller on ${new Date().toLocaleString()}`
                            )
                          }
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Check className="w-4 h-4" />
                          <span>Verify & Mark as PAID</span>
                        </button>

                        <button
                          type="button"
                          disabled={isUpdatingOrder}
                          onClick={() =>
                            handleUpdatePaymentStatus(
                              selectedOrder.id,
                              PaymentStatus.AWAITING_TRANSFER,
                              `Slip flagged as unclear/unverified on ${new Date().toLocaleString()}. Please re-upload.`
                            )
                          }
                          className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs transition-colors"
                        >
                          Flag Slip / Request Re-upload
                        </button>
                      </>
                    ) : (
                      <div className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Payment Verified & Confirmed</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* COD Collection Toggle */}
              {selectedOrder.paymentMethod === PaymentMethod.COD && (
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-blue-900 block">Doorstep Cash Collection</span>
                    <p className="text-[11px] text-blue-700">
                      {selectedOrder.paymentStatus === PaymentStatus.COD_COLLECTED
                        ? 'Cash collected and remitted by courier.'
                        : 'Awaiting courier delivery and doorstep cash collection.'}
                    </p>
                  </div>
                  {selectedOrder.paymentStatus !== PaymentStatus.COD_COLLECTED ? (
                    <button
                      type="button"
                      disabled={isUpdatingOrder}
                      onClick={() =>
                        handleUpdatePaymentStatus(
                          selectedOrder.id,
                          PaymentStatus.COD_COLLECTED,
                          `Cash remitted by courier on ${new Date().toLocaleString()}`
                        )
                      }
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                    >
                      Mark Cash Collected
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                      Cash Collected & Settled
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* FULFILLMENT STATUS UPDATE */}
            <div className="p-5 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Update Fulfillment & Courier Dispatch
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Fulfillment Stage</label>
                  <select
                    value={selectedFulfillmentStatus}
                    onChange={(e) => setSelectedFulfillmentStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                  >
                    <option value={OrderStatus.PENDING_CONFIRMATION}>1. PENDING (Order Placed - Ready for Review)</option>
                    <option value={OrderStatus.CONFIRMED}>2. CONFIRMED (In Packing & Preparation)</option>
                    <option value={OrderStatus.SHIPPED}>3. PARCEL DISPATCHED (Handed to Courier / In Transit)</option>
                    <option value={OrderStatus.OUT_FOR_DELIVERY}>4. OUT FOR DELIVERY (Doorstep Dispatch)</option>
                    <option value={OrderStatus.DELIVERED}>5. DELIVERED (Cash on Delivery Collected)</option>
                    <option value={OrderStatus.CANCELLED}>6. CANCELLED / RETURNED (RTO)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Courier Partner & Tracking Ref
                  </label>
                  <input
                    type="text"
                    value={courierTracking}
                    onChange={(e) => setCourierTracking(e.target.value)}
                    placeholder="e.g. Prompt Xpress #PR-8321"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                  />
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setCourierTracking('Prompt Xpress #PR-' + Math.floor(1000 + Math.random() * 9000))}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700"
                    >
                      + Prompt Xpress
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourierTracking('Domex #DOM-' + Math.floor(10000 + Math.random() * 90000))}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700"
                    >
                      + Domex
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourierTracking('Pronto #PRO-' + Math.floor(1000 + Math.random() * 9000))}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700"
                    >
                      + Pronto
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={isUpdatingOrder}
                  onClick={() => handleUpdateFulfillment(selectedOrder.id)}
                  className="px-5 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#04382A] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                >
                  {isUpdatingOrder ? 'Saving...' : 'Update Fulfillment'}
                </button>
              </div>
            </div>

            {/* Line Items List */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase text-slate-400">Ordered Items</span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {selectedOrder.items?.map((item: any, idx: number) => {
                  const itemColor = item.selectedSize || item.selectedVariant?.size;
                  const itemImg = item.selectedVariant?.image || item.product?.variants?.find((v: any) => v.size === item.selectedSize)?.image || item.product?.images?.[0] || '/nookmint_images/hero.png';
                  return (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={itemImg}
                          alt={item.product?.title}
                          className="w-12 h-14 object-cover rounded-xl bg-slate-50 border border-slate-100 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="font-bold text-slate-900">{item.product?.title}</h5>
                            {(item.selectedVariant?.sku || item.product?.sku) && (
                              <span className="font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                SKU: {item.selectedVariant?.sku || item.product?.sku}
                              </span>
                            )}
                            {item.product?.id && (
                              <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                ID: {item.product.id}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>Color / Option: <strong className="text-slate-800">{itemColor || 'Standard'}</strong></span>
                            <span>•</span>
                            <span>Qty: <strong className="text-slate-800">{item.quantity}</strong></span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-black text-slate-900 font-serif">
                        {formatLKR(item.product?.sellingPrice * item.quantity)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Modal Pinned Footer (Always docked at bottom) */}
          <div className="px-6 py-3.5 sm:px-8 border-t border-slate-100 flex items-center justify-end bg-slate-50/95 shrink-0 rounded-b-3xl z-10">
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      )}

      {/* ============================================================= */}
      {/* PRODUCT ADD / EDIT MODAL (100% Fixed & Stable Centered Popup) */}
      {/* ============================================================= */}
      {isAddingProduct && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overscroll-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddingProduct(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-3xl sm:max-w-4xl w-full shadow-2xl border border-slate-200/90 flex flex-col h-[90vh] max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 sm:px-8 sm:py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white rounded-t-3xl z-10">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  {productForm.sourceType === 'own' ? (
                    <Building2 className="w-3.5 h-3.5 text-purple-700" />
                  ) : (
                    <Package className="w-3.5 h-3.5 text-[#064E3B]" />
                  )}
                  <span className={`text-[10px] font-black uppercase tracking-wider block ${productForm.sourceType === 'own' ? 'text-purple-700' : 'text-[#064E3B]'}`}>
                    {productForm.sourceType === 'own' ? 'Own In-House Inventory' : 'A to Z Traders (iSales) Dropship'}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 font-serif">
                  {editingProduct
                    ? (productForm.sourceType === 'own' ? 'Edit Own Inventory Product' : 'Edit Dropship Product')
                    : (productForm.sourceType === 'own' ? 'Add Own Product to In-House Catalog' : 'Add New Product to Dropship Catalog')}
                </h3>
                <p className="text-xs text-slate-500">
                  {productForm.sourceType === 'own'
                    ? 'In-house stocked item. You manage warehouse inventory, self-dispatching, and district shipping rates.'
                    : 'A to Z Traders dropshipping. 100% automated packaging, islandwide courier, and Cash on Delivery.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingProduct(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              id="admin-product-form"
              onSubmit={handleSaveProduct}
              onPaste={handleModalPaste}
              className="flex-1 overflow-y-auto px-6 py-5 sm:px-8 sm:py-6 space-y-6 text-xs overscroll-contain"
            >
              {/* Modal Internal Feedback / Error Banner */}
              {productFeedback && (
                <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-300 text-[#064E3B] font-bold text-xs flex items-center justify-between shadow-xs animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{productFeedback}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProductFeedback('')}
                    className="text-slate-400 hover:text-slate-700 font-bold ml-2 text-sm"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Sourcing Channel Selector (Dropship vs In-House) */}
              <div className="p-3 sm:p-4 rounded-2xl bg-[#FAF6F3] border border-slate-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800">
                    Product Sourcing Model *
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    Customer only sees NookMint
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setProductForm({ ...productForm, sourceType: 'dropship' })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      productForm.sourceType === 'dropship'
                        ? 'bg-white border-[#064E3B] ring-2 ring-[#064E3B]/20 shadow-xs'
                        : 'bg-white/60 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      productForm.sourceType === 'dropship'
                        ? 'bg-[#064E3B] text-white shadow-xs'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-xs text-slate-900">A to Z Traders (Dropship)</span>
                        {productForm.sourceType === 'dropship' && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-[#064E3B] border border-emerald-200">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Fulfilled via iSales. Automated islandwide packing, Prompt/Domex courier &amp; COD collection.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProductForm({ ...productForm, sourceType: 'own' })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      productForm.sourceType === 'own'
                        ? 'bg-white border-slate-900 ring-2 ring-slate-900/15 shadow-xs'
                        : 'bg-white/60 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      productForm.sourceType === 'own'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-xs text-slate-900">Own Inventory (In-House)</span>
                        {productForm.sourceType === 'own' && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Your own stocked items. You pack parcels and customize delivery fees per district.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* 1. Basic Product Details & Sourcing Code */}
              <div className="space-y-3.5">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <span>1. Product Details &amp; {productForm.sourceType === 'own' ? 'Internal SKU' : 'iSales Code'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-8">
                    <div className="h-5 flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-slate-700">Product Title *</label>
                    </div>
                    <input
                      type="text"
                      required
                      value={productForm.title}
                      onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                      placeholder="e.g. Pro Sound True Wireless Earbuds with ANC"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#064E3B]"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <div className="h-5 flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-slate-700">
                        {productForm.sourceType === 'own' ? 'Product Code / SKU *' : 'iSales Code / SKU *'}
                      </label>
                      <span className="text-[10px] text-slate-400">Searchable</span>
                    </div>
                    <input
                      type="text"
                      required
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      placeholder={productForm.sourceType === 'own' ? 'e.g. OWN-MUG-01' : 'e.g. AZ-4040'}
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-[#064E3B] bg-slate-50/80 focus:bg-white focus:ring-2 focus:ring-[#064E3B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="h-5 flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-slate-700">
                        {isAddingCategory ? 'New Category *' : 'Category *'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingCategory(!isAddingCategory);
                          if (isAddingCategory) setNewCategoryName('');
                        }}
                        className={`text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors px-1.5 py-0.5 rounded ${
                          isAddingCategory
                            ? 'text-slate-500 hover:text-slate-800 bg-slate-100'
                            : 'text-[#064E3B] hover:text-[#04382A] bg-emerald-50 border border-emerald-200'
                        }`}
                      >
                        {isAddingCategory ? (
                          <span>Cancel</span>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>New</span>
                          </>
                        )}
                      </button>
                    </div>

                    {isAddingCategory ? (
                      <div className="space-y-1.5">
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Category name..."
                            className="w-full h-10 pl-3 pr-14 rounded-xl border border-emerald-600 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddNewCategory();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddNewCategory()}
                            className="absolute right-1 px-2.5 py-1.5 rounded-lg bg-[#064E3B] hover:bg-[#04382A] text-white text-[10px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer shadow-2xs"
                          >
                            Save
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Press Enter to save</span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingCategory(false);
                              setNewCategoryName('');
                            }}
                            className="text-slate-500 hover:text-red-600 font-semibold cursor-pointer underline"
                          >
                            Back to list
                          </button>
                        </div>
                      </div>
                    ) : (
                      <select
                        value={productForm.category}
                        onChange={(e) => {
                          if (e.target.value === '__add_new__') {
                            setIsAddingCategory(true);
                          } else {
                            setProductForm({ ...productForm, category: e.target.value });
                          }
                        }}
                        className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#064E3B] cursor-pointer"
                      >
                        {availableCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                        <option value="__add_new__">+ Add New Category...</option>
                      </select>
                    )}
                  </div>

                  <div>
                    <div className="h-5 flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-slate-700">Brand Name</label>
                      <span className="text-[10px] text-slate-400">Optional</span>
                    </div>
                    <input
                      type="text"
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      placeholder="e.g. NookMint / ProSound"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#064E3B]"
                    />
                  </div>

                  <div>
                    <div className="h-5 flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-slate-700">Unit / Package</label>
                      <span className="text-[10px] text-slate-400">e.g. 1 Pc, 300ml</span>
                    </div>
                    <input
                      type="text"
                      value={productForm.unit}
                      onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                      placeholder="e.g. 1 Unit / 12 Pcs Set"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#064E3B]"
                    />
                  </div>
                </div>

                {/* 2. Storefront Merchandising Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className={`p-3 sm:p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                    productForm.isNewArrival
                      ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-300/40 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={productForm.isNewArrival}
                      onChange={(e) => setProductForm({ ...productForm, isNewArrival: e.target.checked })}
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                        <span>Feature in &quot;New Arrivals&quot; Section</span>
                      </div>
                      <div className="text-[10px] text-amber-800 mt-0.5 truncate sm:whitespace-normal">
                        Showcase immediately in the Homepage New Arrivals grid
                      </div>
                    </div>
                  </label>

                  <label className={`p-3 sm:p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                    productForm.isBestSeller
                      ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-300/40 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={productForm.isBestSeller}
                      onChange={(e) => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                      className="w-4 h-4 text-rose-600 rounded focus:ring-rose-400"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-rose-950 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 fill-rose-600 text-rose-600 shrink-0" />
                        <span>Feature in &quot;Popular Products&quot; Showcase</span>
                      </div>
                      <div className="text-[10px] text-rose-800 mt-0.5 truncate sm:whitespace-normal">
                        Showcase prominently in the customer Homepage Popular section
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 3. Pricing, Cost & Live Profit Margin */}
              <div className="space-y-3.5 p-4 sm:p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Percent className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-950">
                      3. Pricing &amp; {productForm.sourceType === 'own' ? 'In-House Profit Margin' : 'Dropship Profit Margin'}
                    </h4>
                  </div>
                  {productForm.offerPercentage > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-black text-[10px] tracking-wide uppercase">
                      {productForm.offerPercentage}% OFF APPLIED
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <div className="h-5 flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-slate-700">
                        {productForm.sourceType === 'own' ? 'Unit Cost (Rs.) *' : 'Wholesale Cost *'}
                      </label>
                    </div>
                    <input
                      type="number"
                      required
                      min={0}
                      value={productForm.costPrice}
                      onChange={(e) => setProductForm({ ...productForm, costPrice: Number(e.target.value) })}
                      placeholder="e.g. 2500"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-700 bg-white focus:ring-2 focus:ring-[#064E3B]"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {productForm.sourceType === 'own' ? 'Your stock cost' : 'A to Z catalogue price'}
                    </span>
                  </div>

                  <div>
                    <div className="h-5 flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-slate-700">
                        Selling Price (Rs.) *
                      </label>
                    </div>
                    <input
                      type="number"
                      required
                      min={0}
                      value={productForm.sellingPrice}
                      onChange={(e) => handlePriceChange('sellingPrice', Number(e.target.value))}
                      placeholder="e.g. 3890"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 font-mono text-xs font-black text-[#064E3B] bg-white focus:ring-2 focus:ring-[#064E3B]"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">Customer COD total</span>
                  </div>

                  <div>
                    <div className="h-5 flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-slate-700">
                        MRP / Strike Price *
                      </label>
                    </div>
                    <input
                      type="number"
                      required
                      min={0}
                      value={productForm.mrp}
                      onChange={(e) => handlePriceChange('mrp', Number(e.target.value))}
                      placeholder="e.g. 4900"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-500 bg-white focus:ring-2 focus:ring-[#064E3B]"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">Reference market price</span>
                  </div>

                  <div>
                    <div className="h-5 flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-slate-700">
                        Offer Discount (%)
                      </label>
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={90}
                      value={productForm.offerPercentage}
                      onChange={(e) => handleOfferChange(Number(e.target.value))}
                      placeholder="e.g. 20"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-[#064E3B]"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">Auto-computed</span>
                  </div>
                </div>

                {/* Live Profit Calculation Card */}
                <div className="p-3.5 rounded-xl bg-white border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="text-slate-600 font-medium">
                      {productForm.sourceType === 'own' ? 'Your In-House Net Profit per Sale:' : 'Your Estimated Dropship Profit per Sale:'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <strong className="text-sm font-black text-emerald-800 font-mono">
                      +{formatLKR(productForm.sellingPrice - (productForm.costPrice || 0))} Net Profit
                    </strong>
                    {productForm.sellingPrice > 0 && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {Math.round(((productForm.sellingPrice - (productForm.costPrice || 0)) / productForm.sellingPrice) * 100)}% Margin
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Product Photos & Cover Image */}
              <div className="space-y-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#064E3B]" />
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">
                      4. Product Photos & Angles
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#064E3B] font-black text-[10px]">
                    {productForm.images.length} {productForm.images.length === 1 ? 'Photo' : 'Photos'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Upload multiple angles or packaging photos. The first photo with the green border is automatically used as the <strong>Storefront Cover Photo</strong>.
                </p>

                {/* Auto-Compression & Clipboard Tip Banner */}
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50/80 border border-emerald-200 text-[11px] text-[#064E3B]">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Lightning Fast:</strong> Camera photos are auto-compressed from 10MB to ~150KB for instant upload. You can also copy any image from WhatsApp/Web and press <strong>Ctrl + V</strong> anywhere to paste it!</span>
                </div>

                {/* Upload & Add Bar */}
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <label className={`cursor-pointer h-10 px-4 ${isUploadingImage ? 'bg-emerald-700' : 'bg-[#064E3B] hover:bg-[#04382A]'} text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs shrink-0`}>
                    <UploadCloud className={`w-4 h-4 ${isUploadingImage ? 'animate-bounce' : ''}`} />
                    <span>{isUploadingImage ? 'Optimizing & Uploading...' : '+ Upload Photo from Device'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={isUploadingImage}
                      onChange={handleMultipleImageUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={newProductImageUrl}
                      onChange={(e) => setNewProductImageUrl(e.target.value)}
                      placeholder="Or paste photo URL (/nookmint_images/... or https://...)"
                      className="flex-1 h-10 px-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#064E3B]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddProductImageUrl();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddProductImageUrl()}
                      className="h-10 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                {/* Thumbnails Grid */}
                {productForm.images.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl border-2 border-dashed border-emerald-300/80 bg-emerald-50/20 space-y-2">
                    <Camera className="w-7 h-7 text-emerald-600 mx-auto" />
                    <p className="text-xs font-extrabold text-slate-800">No photos added yet</p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Click <strong className="text-[#064E3B]">+ Upload Photo</strong> or press <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px] text-slate-700 shadow-2xs">Ctrl + V</kbd> to paste any copied image directly from WhatsApp or Google.
                    </p>
                    <p className="text-[10px] text-emerald-700 font-medium">
                      (If left empty, your {productForm.category} department packshot will be used automatically)
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    {productForm.images.map((img, idx) => (
                      <div
                        key={`${img}-${idx}`}
                        className={`relative aspect-4/5 rounded-2xl overflow-hidden border-2 bg-white group shadow-2xs ${
                          idx === 0 ? 'border-[#064E3B] ring-2 ring-[#064E3B]/20' : 'border-slate-200'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={`Photo angle ${idx + 1}`}
                          className="w-full h-full object-cover object-center"
                        />

                        {/* Cover Badge or Make Cover Button */}
                        <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between">
                          {idx === 0 ? (
                            <span className="px-2 py-0.5 rounded-md bg-[#064E3B] text-white font-extrabold text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                              <Star className="w-2.5 h-2.5 fill-white" />
                              <span>COVER</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetCoverImage(idx)}
                              className="px-1.5 py-0.5 rounded-md bg-slate-900/80 hover:bg-[#064E3B] text-white font-bold text-[9px] transition-colors shadow-sm cursor-pointer"
                              title="Set as Main Cover Photo"
                            >
                              Set Cover
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveProductImage(idx)}
                            className="w-6 h-6 rounded-md bg-slate-900/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="absolute bottom-1.5 left-1.5 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/60 text-white">
                          Angle #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 4.2 Product Video Showcase (Optional) */}
                <div className="mt-4 pt-3.5 border-t border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Film className="w-4 h-4 text-emerald-700" />
                      <span>Product Video Showcase (Optional)</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">MP4 up to 50MB</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Add a hands-on unboxing, feature showcase, or video clip. Appears with a play button in the storefront gallery.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <label className={`cursor-pointer h-10 px-4 ${isUploadingVideo ? 'bg-emerald-700' : 'bg-slate-800 hover:bg-slate-900'} text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs shrink-0`}>
                      <Video className={`w-4 h-4 ${isUploadingVideo ? 'animate-bounce text-emerald-300' : ''}`} />
                      <span>{isUploadingVideo ? 'Uploading Video to Supabase...' : '+ Upload Video (MP4)'}</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        disabled={isUploadingVideo}
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                    </label>

                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={productForm.videoUrl || ''}
                        onChange={(e) => setProductForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                        placeholder="Or paste video URL (https://... or .mp4)"
                        className="flex-1 h-10 px-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#064E3B]"
                      />
                      {productForm.videoUrl && (
                        <button
                          type="button"
                          onClick={() => setProductForm((prev) => ({ ...prev, videoUrl: '' }))}
                          className="h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Video Active Preview */}
                  {productForm.videoUrl && (
                    <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
                          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold text-emerald-300">Video Attached</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">{productForm.videoUrl}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProductForm((prev) => ({ ...prev, videoUrl: '' }))}
                        className="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Product Colors, Variants & Individual Stock with Dedicated Photos */}
              <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <span>🎨 5. Product Colors & Variant Options *</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Add different color models, individual stock quantities, and assign matching photos so customers see the exact color.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-[#064E3B] font-extrabold text-xs shrink-0">
                    {productForm.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)} Total Units
                  </span>
                </div>

                <div className="space-y-3">
                  {productForm.variants.map((variant, vIdx) => (
                    <div
                      key={vIdx}
                      className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Option / Color #{vIdx + 1}
                        </span>
                        {productForm.variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = productForm.variants.filter((_, idx) => idx !== vIdx);
                              setProductForm({ ...productForm, variants: next });
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Remove this color option"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        {/* Color / Variant Name */}
                        <div className="sm:col-span-5">
                          <label className="text-[10px] font-bold text-slate-700 block mb-1">
                            Color / Option Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={variant.size}
                            onChange={(e) => {
                              const next = [...productForm.variants];
                              next[vIdx] = { ...next[vIdx], size: e.target.value };
                              setProductForm({ ...productForm, variants: next });
                            }}
                            placeholder="e.g. Glacier White, Midnight Black, Mint Green"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#064E3B]"
                          />
                        </div>

                        {/* Stock Units */}
                        <div className="sm:col-span-3">
                          <label className="text-[10px] font-bold text-slate-700 block mb-1">
                            Stock Units *
                          </label>
                          <input
                            type="number"
                            min={0}
                            required
                            value={variant.stock}
                            onChange={(e) => {
                              const qty = Math.max(0, Number(e.target.value));
                              const next = [...productForm.variants];
                              next[vIdx] = { ...next[vIdx], stock: qty };
                              setProductForm({ ...productForm, variants: next });
                            }}
                            placeholder="Qty"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#064E3B]"
                          />
                        </div>

                        {/* Color Swatch Hex */}
                        <div className="sm:col-span-4">
                          <label className="text-[10px] font-bold text-slate-700 block mb-1">
                            Color Swatch (Hex / Preset)
                          </label>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-7 h-7 rounded-lg border border-slate-300 shrink-0 shadow-2xs"
                              style={{ backgroundColor: variant.colorHex || '#FFFFFF' }}
                            />
                            <input
                              type="text"
                              value={variant.colorHex || ''}
                              onChange={(e) => {
                                const next = [...productForm.variants];
                                next[vIdx] = { ...next[vIdx], colorHex: e.target.value };
                                setProductForm({ ...productForm, variants: next });
                              }}
                              placeholder="#18181B"
                              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 bg-slate-50/50"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Color-Specific Photo Assignment */}
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-slate-600">
                          <span className="font-bold">Select Photo for this Color:</span>
                          <span className="text-slate-400 font-medium">Customer sees this photo when selecting this color</span>
                        </div>

                        {/* 1-Click pick from product images */}
                        {productForm.images && productForm.images.length > 0 && (
                          <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {productForm.images.map((imgUrl, imgIdx) => (
                              <button
                                key={imgIdx}
                                type="button"
                                onClick={() => {
                                  const next = [...productForm.variants];
                                  next[vIdx] = { ...next[vIdx], image: imgUrl };
                                  setProductForm({ ...productForm, variants: next });
                                }}
                                className={`relative w-12 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                                  variant.image === imgUrl
                                    ? 'border-[#064E3B] ring-2 ring-emerald-500/40 scale-105'
                                    : 'border-slate-200 hover:border-slate-400 opacity-60 hover:opacity-100'
                                }`}
                                title={`Set Image #${imgIdx + 1} for this color`}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={imgUrl}
                                  alt={`Product image ${imgIdx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {variant.image === imgUrl && (
                                  <span className="absolute inset-0 bg-[#064E3B]/20 flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white stroke-[3]" />
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Or direct URL input */}
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={variant.image || ''}
                            onChange={(e) => {
                              const next = [...productForm.variants];
                              next[vIdx] = { ...next[vIdx], image: e.target.value };
                              setProductForm({ ...productForm, variants: next });
                            }}
                            placeholder="Or paste direct image URL for this color..."
                            className="w-full px-3 py-1.5 text-[11px] rounded-lg border border-slate-200 bg-slate-50/50 text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setProductForm({
                        ...productForm,
                        variants: [
                          ...productForm.variants,
                          {
                            size: '',
                            stock: 25,
                            sku: `${productForm.sku}-${productForm.variants.length + 1}`,
                            colorHex: '#18181B',
                            image: productForm.images[0] || '',
                          },
                        ],
                      });
                    }}
                    className="w-full py-2.5 rounded-xl border border-dashed border-[#064E3B]/40 hover:border-[#064E3B] bg-emerald-50/50 hover:bg-emerald-50 text-[#064E3B] font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Color / Model Option</span>
                  </button>
                </div>
              </div>

              {/* 6. Product Delivery Fee & Shipping Rule */}
              {productForm.sourceType === 'dropship' ? (
                /* Dropship Shipping Status Banner: No delivery setup needed */
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <div className="flex items-center gap-2 text-blue-900 font-extrabold text-xs">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>Automated A to Z Traders Islandwide Delivery (COD)</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-snug">
                    Because this is a dropshipping product, A to Z Traders takes 100% responsibility for packaging, dispatching via Prompt Xpress & Domex Courier, and collecting cash on delivery across all 25 districts in Sri Lanka. <strong>No delivery rates or date setup needed.</strong>
                  </p>
                </div>
              ) : (
                /* Own Product Delivery & District Shipping Configuration */
                <div className="space-y-4 p-4.5 rounded-2xl bg-purple-50/40 border border-purple-200/90">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-purple-600" />
                      <span>6. Delivery & Shipping Rule for Own Inventory</span>
                    </h4>
                    <span className="text-[10px] text-purple-800 font-bold bg-white px-2 py-0.5 rounded border border-purple-200">
                      Self-Fulfilled
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <label
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        productForm.deliveryFeeType === 'default'
                          ? 'bg-white border-purple-600 ring-2 ring-purple-600/20 shadow-xs'
                          : 'bg-white/60 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryFeeType"
                        checked={productForm.deliveryFeeType === 'default'}
                        onChange={() => setProductForm({ ...productForm, deliveryFeeType: 'default' })}
                        className="sr-only"
                      />
                      <div className="font-bold text-xs text-slate-900">Standard Rates</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Calculated by district (Rs. 350 - 500)</div>
                    </label>

                    <label
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        productForm.deliveryFeeType === 'free'
                          ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white/60 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryFeeType"
                        checked={productForm.deliveryFeeType === 'free'}
                        onChange={() => setProductForm({ ...productForm, deliveryFeeType: 'free' })}
                        className="sr-only"
                      />
                      <div className="font-bold text-xs text-emerald-800">FREE Delivery</div>
                      <div className="text-[10px] text-emerald-600 mt-0.5">Free islandwide shipping for this item</div>
                    </label>

                    <label
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        productForm.deliveryFeeType === 'custom'
                          ? 'bg-white border-purple-600 ring-2 ring-purple-600/20 shadow-xs'
                          : 'bg-white/60 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryFeeType"
                        checked={productForm.deliveryFeeType === 'custom'}
                        onChange={() => setProductForm({ ...productForm, deliveryFeeType: 'custom' })}
                        className="sr-only"
                      />
                      <div className="font-bold text-xs text-slate-900">Custom Flat Fee</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Set specific delivery price in Rs.</div>
                    </label>
                  </div>

                  {productForm.deliveryFeeType === 'custom' && (
                    <div className="p-3 bg-white rounded-xl border border-purple-200 flex items-center justify-between gap-3">
                      <label className="text-xs font-bold text-slate-700">Custom Delivery Fee (Rs.)</label>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-400">Rs.</span>
                        <input
                          type="number"
                          min={0}
                          value={productForm.customDeliveryFee}
                          onChange={(e) => setProductForm({ ...productForm, customDeliveryFee: Number(e.target.value) })}
                          placeholder="e.g. 250"
                          className="w-28 px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono font-bold text-right text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* Interactive District Delivery Days & Fee Inspector */}
                  {(() => {
                    const matchedDistrict = SRI_LANKA_DISTRICTS.find((d) => d.district === adminPreviewDistrict);
                    const isFree = productForm.deliveryFeeType === 'free';
                    const isCustom = productForm.deliveryFeeType === 'custom';
                    let fee = matchedDistrict?.deliveryFee || 450;
                    if (isFree) fee = 0;
                    else if (isCustom) fee = productForm.customDeliveryFee || 350;
                    const days = matchedDistrict?.deliveryDays || '2 - 3 Business Days';

                    return (
                      <div className="p-3.5 rounded-2xl bg-white border border-purple-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-purple-900 flex items-center gap-1">
                            <span>📍 District Delivery & Days Simulator</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">Select a district to preview</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-1">
                              Choose District:
                            </label>
                            <select
                              value={adminPreviewDistrict}
                              onChange={(e) => setAdminPreviewDistrict(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                            >
                              {SRI_LANKA_DISTRICTS.map((d) => (
                                <option key={d.district} value={d.district}>
                                  {d.district} ({d.province})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 flex flex-col justify-center space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600 font-medium">Delivery Fee:</span>
                              <span className="font-mono font-black text-purple-900 text-sm">
                                {isFree ? 'FREE Delivery' : formatLKR(fee)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs pt-1 border-t border-purple-200/50">
                              <span className="text-slate-600 font-medium">Delivery Time:</span>
                              <span className="font-extrabold text-emerald-800 text-xs flex items-center gap-1">
                                <span>⚡</span> {days}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 7. Description & Specifications */}
              <div className="space-y-1.5 pb-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700">
                    Product Description &amp; Specifications
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Supports line breaks &amp; paragraphs
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Describe product highlights, technical specs, material quality, and usage instructions..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-normal leading-relaxed focus:ring-2 focus:ring-[#064E3B]"
                />
              </div>
            </form>

            {/* Pinned Modal Footer (Always docked at bottom of popup) */}
            <div className="px-6 py-4 sm:px-8 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/95 shrink-0 rounded-b-3xl z-10">
              <button
                type="button"
                onClick={() => setIsAddingProduct(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="admin-product-form"
                disabled={isSubmittingProduct || isUploadingImage}
                className={`px-7 py-2.5 rounded-xl text-white font-extrabold uppercase tracking-wider transition-colors shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 ${
                  productForm.sourceType === 'own'
                    ? 'bg-slate-900 hover:bg-slate-800'
                    : 'bg-[#064E3B] hover:bg-[#04382A]'
                }`}
              >
                {isSubmittingProduct && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {isSubmittingProduct
                    ? 'Publishing Product...'
                    : editingProduct
                    ? 'Save Product Changes'
                    : productForm.sourceType === 'own'
                    ? 'Publish Own Product'
                    : 'Publish Dropship Product'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* FLOATING REAL-TIME NEW ORDER NOTIFICATION TOAST */}
      {newOrderAlert && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full bg-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-2xl border-2 border-emerald-500/80 animate-in fade-in slide-in-from-top-4 duration-300 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="font-black text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" />
                <span>New Customer Order!</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setNewOrderAlert(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-black text-white">
              #{newOrderAlert.orderNumber} • {newOrderAlert.customerName}
            </div>
            <div className="text-xs text-slate-300">
              📍 Destination: <strong className="text-white">{newOrderAlert.district}</strong>
            </div>
            <div className="text-xs text-emerald-400 font-bold font-mono pt-1">
              Amount: LKR {newOrderAlert.total.toLocaleString()}.00 (100% COD)
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setSelectedOrder(newOrderAlert.order);
                setNewOrderAlert(null);
                if (typeof document !== 'undefined') {
                  document.title = 'NookMint Admin Console';
                }
              }}
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-colors cursor-pointer text-center"
            >
              View & Confirm Order
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
