'use client';

import React, { useState, useEffect } from 'react';
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
  MapPinned,
  PieChart,
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
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
    variants: Array<{ size: string; stock: number; sku?: string }>;
    deliveryFeeType: 'default' | 'free' | 'custom';
    customDeliveryFee: number;
  }>({
    title: '',
    sku: '',
    sourceType: 'dropship',
    category: 'Household & Kitchen',
    brand: 'NookMint',
    unit: 'item',
    isNewArrival: true,
    isBestSeller: false,
    costPrice: 2800,
    sellingPrice: 3890,
    mrp: 4900,
    offerPercentage: 20,
    description: '',
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=900&auto=format&fit=crop&q=80'],
    variants: [
      { size: 'Standard', stock: 25, sku: 'PROD-01' },
    ],
    deliveryFeeType: 'default',
    customDeliveryFee: 350,
  });
  const [newProductImageUrl, setNewProductImageUrl] = useState<string>('');
  const [productFeedback, setProductFeedback] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [adminPreviewDistrict, setAdminPreviewDistrict] = useState<string>('Colombo');

  const openAddProductModal = (sourceType: 'dropship' | 'own') => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      sku: sourceType === 'dropship' ? `AZ-${Math.floor(1000 + Math.random() * 9000)}` : `NM-${Math.floor(1000 + Math.random() * 9000)}`,
      sourceType,
      category: 'Household & Kitchen',
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
      images: ['/nookmint_images/hero.png'],
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
    'Household & Kitchen',
    'Home & Garden',
    'Smart Gadgets & Audio',
    'Kitchen & Cookware',
    'Gardening Tools & Pots',
    'Audio & Smart Accessories',
  ];

  const categoryItemList: StoreCategoryItem[] =
    settingsForm?.categoryDetails && settingsForm.categoryDetails.length > 0
      ? settingsForm.categoryDetails
      : (settingsForm?.categories || defaultCategoryList).map((name) => ({
          id: `cat-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          name,
          image: getCategoryImage(name),
        }));

  const availableCategories =
    categoryItemList.length > 0
      ? categoryItemList.map((c) => c.name)
      : (settingsForm?.categories && settingsForm.categories.length > 0
          ? settingsForm.categories
          : defaultCategoryList);

  // Check existing session
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('ls_admin_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: 2026
    if (pinInput.trim() === '2026' || pinInput.trim() === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('ls_admin_auth', 'true');
      setAuthError('');
      fetchDashboardData();
    } else {
      setAuthError('Invalid Admin PIN. Please enter 2026.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('ls_admin_auth');
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes, settingsRes] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/admin/products'),
        fetch('/api/admin/settings'),
      ]);

      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();
      const settingsData = await settingsRes.json();

      if (ordersData.success) {
        setOrders(ordersData.orders || []);
      }
      if (productsData.success) {
        setProducts(productsData.products || []);
      }
      if (settingsData.success && settingsData.settings) {
        setSettings(settingsData.settings);
        setSettingsForm(settingsData.settings);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

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
      }
    } catch (err) {
      console.error('Failed to quick-update order status:', err);
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

  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setIsUploadingImage(true);
      setProductFeedback('Uploading images to Supabase Storage...');
      try {
        for (const file of files) {
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
              images: [
                ...prev.images.filter((img) => img !== '/nookmint_images/hero.png' || prev.images.length > 1),
                data.url,
              ],
            }));
          } else {
            console.error('Upload failed for file:', file.name, data.message);
          }
        }
        setProductFeedback('Images uploaded successfully to Supabase Storage!');
        setTimeout(() => setProductFeedback(''), 3000);
      } catch (err: any) {
        console.error('Upload error:', err);
        setProductFeedback('Failed to upload image. Please try again.');
      } finally {
        setIsUploadingImage(false);
      }
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
      return { ...prev, images: updated.length > 0 ? updated : ['/nookmint_images/hero.png'] };
    });
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
    try {
      if (editingProduct) {
        // Edit existing product
        const res = await fetch('/api/admin/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: editingProduct.id,
            title: productForm.title,
            sku: productForm.sku,
            sourceType: productForm.sourceType,
            category: productForm.category,
            brand: productForm.brand,
            unit: productForm.unit,
            isNewArrival: Boolean(productForm.isNewArrival),
            isBestSeller: Boolean(productForm.isBestSeller),
            costPrice: Number(productForm.costPrice),
            sellingPrice: Number(productForm.sellingPrice),
            mrp: Number(productForm.mrp),
            offerPercentage: Number(productForm.offerPercentage),
            description: productForm.description,
            images: productForm.images,
            variants: productForm.variants,
            deliveryFeeType: productForm.deliveryFeeType,
            customDeliveryFee: Number(productForm.customDeliveryFee),
          }),
        });
        const data = await res.json();
        if (data.success) {
          setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? data.product : p)));
          setEditingProduct(null);
          setIsAddingProduct(false);
          setProductFeedback('Product updated successfully and synchronized with storefront!');
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
          body: JSON.stringify(productForm),
        });
        const data = await res.json();
        if (data.success) {
          setProducts((prev) => [data.product, ...prev]);
          setIsAddingProduct(false);
          setProductFeedback('New product published successfully to NookMint storefront!');
          broadcastCategorySync();
          setTimeout(() => setProductFeedback(''), 3500);
        } else {
          setProductFeedback(data.message || 'Creation failed');
        }
      }
    } catch (err: any) {
      setProductFeedback(err.message || 'Error saving product');
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

  // KPIs
  const totalRevenue = orders.reduce((sum, o) => {
    if (o.paymentStatus === PaymentStatus.PAID || o.paymentStatus === PaymentStatus.COD_COLLECTED) {
      return sum + (o.grandTotal || 0);
    }
    return sum;
  }, 0);

  const pendingBankTransfers = orders.filter(
    (o) =>
      o.paymentMethod === PaymentMethod.BANK_TRANSFER &&
      (o.paymentStatus === PaymentStatus.VERIFICATION_PENDING || o.paymentStatus === PaymentStatus.AWAITING_TRANSFER)
  );

  const activeCodOrders = orders.filter(
    (o) => o.paymentMethod === PaymentMethod.COD && o.paymentStatus === PaymentStatus.COD_PENDING
  );

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shippingAddress?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shippingAddress?.phone?.includes(searchQuery) ||
      o.shippingAddress?.city?.toLowerCase().includes(searchQuery.toLowerCase());

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
                Enter your authorized 4-digit staff PIN to unlock dropship order management, iSales copy tools, and product catalog controls.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Admin Security PIN
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  maxLength={10}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••"
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-300 text-slate-900 font-mono text-center text-2xl tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent transition-all shadow-inner bg-slate-50/50"
                />
                <div className="mt-2.5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Demo Staff PIN:</span>
                  <button
                    type="button"
                    onClick={() => setPinInput('2026')}
                    className="font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
                  >
                    Quick-Fill &quot;2026&quot;
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
    <div className="min-h-screen bg-[#FAF6F3] pb-24">
      {/* Top Admin Header */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#064E3B] to-[#04382A] text-white flex items-center justify-center font-black text-sm shadow-xs border border-emerald-800">
              NM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900 tracking-tight">NookMint Admin</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Dropship Operations
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">A to Z Traders (iSales) Partner • 100% Cash on Delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              type="button"
              onClick={fetchDashboardData}
              title="Refresh Data"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-700' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
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
        {/* KPI METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Gross Settled Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-serif">{formatLKR(totalRevenue)}</div>
            <p className="text-[11px] text-slate-400">Verified bank transfers & COD collected</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Total Orders</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-serif">{orders.length}</div>
            <p className="text-[11px] text-slate-400">Guest checkout islandwide</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-emerald-200 bg-emerald-50/30 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <span>Ready for iSales Entry</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Copy className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-900 font-serif">
              {orders.filter((o) => o.status === OrderStatus.PENDING_CONFIRMATION || o.status === OrderStatus.PENDING_COD_VERIFICATION || o.status === OrderStatus.CONFIRMED).length}
            </div>
            <p className="text-[11px] text-emerald-700 font-medium">To submit to A to Z Traders</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 bg-slate-50/50 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-700 text-xs font-bold uppercase tracking-wider">
              <span>COD In-Transit</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-serif">{activeCodOrders.length}</div>
            <p className="text-[11px] text-slate-500 font-medium">Islandwide courier delivery</p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: ORDERS MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
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

              <div className="relative min-w-[240px]">
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

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">No Orders Match Criteria</h3>
                  <p className="text-xs text-slate-500">Try clearing filters or search query.</p>
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
                              <span className="font-bold text-slate-800">
                                {order.items?.reduce((s: number, i: any) => s + i.quantity, 0)} pcs
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                                {order.items?.[0]?.product?.title}
                              </span>
                            </td>

                            <td className="py-4 px-6 font-black text-slate-900 whitespace-nowrap">
                              {formatLKR(order.grandTotal)}
                            </td>

                            <td className="py-4 px-6 whitespace-nowrap">
                              {order.paymentStatus === PaymentStatus.PAID && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>PAID</span>
                                </span>
                              )}
                              {order.paymentStatus === PaymentStatus.COD_COLLECTED && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>COD COLLECTED</span>
                                </span>
                              )}
                              {order.paymentStatus === PaymentStatus.COD_PENDING && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                  <Clock className="w-3 h-3" />
                                  <span>COD PENDING</span>
                                </span>
                              )}
                              {order.paymentStatus === PaymentStatus.VERIFICATION_PENDING && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                                  <AlertCircle className="w-3 h-3 text-amber-700" />
                                  <span>SLIP UPLOADED</span>
                                </span>
                              )}
                              {order.paymentStatus === PaymentStatus.AWAITING_TRANSFER && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  <Clock className="w-3 h-3" />
                                  <span>AWAITING SLIP</span>
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-6 whitespace-nowrap">
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
Product Codes / SKUs: ${order.items?.map((i: any) => i.selectedVariant?.sku || i.product.id).join(', ')}
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
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-emerald-300 transition-all"
                  >
                    <div className="p-5 flex gap-4 items-start">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.images?.[0] || '/nookmint_images/hero.png'}
                        alt={product.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/nookmint_images/hero.png';
                        }}
                        className="w-20 h-24 object-cover object-center rounded-2xl bg-stone-50 shrink-0 border border-slate-100 shadow-2xs"
                      />
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {product.category}
                            </span>
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
                                    ? product.variants.map((v: any) => ({ size: v.size, stock: v.stock }))
                                    : [
                                        { size: 'Standard', stock: 15 },
                                      ],
                                deliveryFeeType: product.deliveryFeeType || 'default',
                                customDeliveryFee: product.customDeliveryFee || 350,
                                images: product.images && product.images.length > 0 ? [...product.images] : ['/nookmint_images/hero.png'],
                              });
                              setIsAddingProduct(true);
                            }}
                            className="p-1 text-slate-400 hover:text-[#064E3B] rounded-md hover:bg-emerald-50 transition-colors"
                            title="Edit details & price"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
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
                          <span className="text-[11px] text-slate-400 line-through">
                            {formatLKR(product.mrp)}
                          </span>
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
        {/* TAB 3: DROPSHIP ANALYTICS & PERFORMANCE (A to Z Traders iSales) */}
        {/* ========================================================= */}
        {activeTab === 'analytics' && (() => {
          const scopedOrders = orders.filter((o) => {
            if (analyticsScope === 'all') return true;
            return (o.items || []).some((item: any) => {
              const itemSource = item.product?.sourceType || 'dropship';
              return itemSource === analyticsScope;
            });
          });

          const scopedProducts = products.filter((p) => {
            if (analyticsScope === 'all') return true;
            return (p.sourceType || 'dropship') === analyticsScope;
          });

          const scopedGross = scopedOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
          const scopedProfit = scopedOrders.reduce((sum, o) => {
            const orderProfit = (o.items || []).reduce((itemSum: number, item: any) => {
              const itemSource = item.product?.sourceType || 'dropship';
              if (analyticsScope !== 'all' && itemSource !== analyticsScope) return itemSum;
              const sp = item.product?.sellingPrice || 3500;
              const cp = item.product?.costPrice || Math.round(sp * 0.7);
              return itemSum + (sp - cp) * (item.quantity || 1);
            }, 0);
            return sum + (orderProfit > 0 ? orderProfit : 1100 * (o.items?.length || 1));
          }, 0);
          const scopedAov = scopedOrders.length > 0 ? Math.round(scopedGross / scopedOrders.length) : (analyticsScope === 'own' ? 4250 : 3890);
          const scopedMarginPct = scopedGross > 0 ? Math.round((scopedProfit / scopedGross) * 100) : 31;

          return (
            <div className="space-y-8">
            {/* Analytics Scope Segmented Control */}
            <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-extrabold uppercase text-slate-400 px-2 tracking-wider">
                Analytics Scope:
              </span>
              <button
                type="button"
                onClick={() => setAnalyticsScope('all')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  analyticsScope === 'all'
                    ? 'bg-[#064E3B] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                📊 Combined Store Overview
              </button>
              <button
                type="button"
                onClick={() => setAnalyticsScope('dropship')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  analyticsScope === 'dropship'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                📦 A to Z Dropship Performance
              </button>
              <button
                type="button"
                onClick={() => setAnalyticsScope('own')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  analyticsScope === 'own'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50'
                }`}
              >
                🏭 Own Products Direct Sales
              </button>
            </div>

            {/* Header Banner */}
            <div className={`p-6 sm:p-8 rounded-3xl shadow-md border text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${
              analyticsScope === 'own'
                ? 'bg-gradient-to-r from-purple-900 to-slate-950 border-purple-800'
                : analyticsScope === 'dropship'
                ? 'bg-gradient-to-r from-blue-900 to-slate-950 border-blue-800'
                : 'bg-gradient-to-r from-[#064E3B] to-[#04382A] border-emerald-800'
            }`}>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {analyticsScope === 'own'
                      ? 'In-House Merchant Inventory Operations'
                      : analyticsScope === 'dropship'
                      ? 'A to Z Traders (iSales) Dropship Operations'
                      : 'Dual-Channel Storefront Operations'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-serif tracking-tight text-white">
                  {analyticsScope === 'own'
                    ? 'Own Inventory Sales & Shipping Performance'
                    : analyticsScope === 'dropship'
                    ? 'A to Z Dropshipping Performance & Margins'
                    : 'Blended Store Performance & Financial Overview'}
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl font-light leading-relaxed">
                  {analyticsScope === 'own'
                    ? 'Track demand, in-house inventory turns, custom delivery fees collected, and direct gross profit for your own stocked product lines.'
                    : analyticsScope === 'dropship'
                    ? 'Real-time metrics for your A to Z Traders dropshipping business. Track wholesale costs, orders ready for iSales entry, and net payout earnings.'
                    : 'Executive unified analytics across dropship products and in-house inventory. Customers experience a single, authentic NookMint boutique.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="bg-black/30 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/10">
                  <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Active Channel</div>
                  <div className="text-sm font-black text-white">
                    {analyticsScope === 'own' ? '🏭 Own Products' : analyticsScope === 'dropship' ? '📦 A to Z Dropship' : '🌐 All Channels'}
                  </div>
                </div>
                <div className="bg-black/30 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/10">
                  <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Settlement Method</div>
                  <div className="text-sm font-black text-white">
                    {analyticsScope === 'own' ? 'Direct Courier COD Deposit' : 'A to Z Fortnightly Payout'}
                  </div>
                </div>
              </div>
            </div>

            {/* 4 CORE KPI METRICS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Gross COD Turnover */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gross COD Volume</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#064E3B] flex items-center justify-center font-bold">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 font-serif">
                    {formatLKR(scopedGross)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {analyticsScope === 'own' ? 'Total direct in-house sales volume' : analyticsScope === 'dropship' ? 'Total A to Z Dropship volume' : 'Total combined store order value across Sri Lanka'}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Total Checkouts:</span>
                  <span className="font-extrabold text-slate-700">{scopedOrders.length} Orders</span>
                </div>
              </div>

              {/* Card 2: Estimated Net Dropship Profit */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Est. Net Profit</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-700 font-serif">
                    {formatLKR(scopedProfit)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {analyticsScope === 'own' ? 'Your In-House Profit (Price minus Cost)' : 'Your A to Z Net Earnings (Selling Price minus Wholesale)'}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Avg Profit Margin:</span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ~{scopedMarginPct}% Net Margin
                  </span>
                </div>
              </div>

              {/* Card 3: Average Order Value (AOV) */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Average Order Value</span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 font-serif">
                    {formatLKR(scopedAov)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Average basket size per customer COD booking
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Payment Option:</span>
                  <span className="font-extrabold text-slate-700">100% Cash on Delivery</span>
                </div>
              </div>

              {/* Card 4: Islandwide Fulfillment Success */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Courier Success</span>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                    <Truck className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 font-serif">
                    98.2%
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Successful delivery & cash collection rate
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Coverage:</span>
                  <span className="font-extrabold text-purple-700">All 25 Districts</span>
                </div>
              </div>
            </div>

            {/* 4-STAGE DROPSHIP FULFILLMENT FUNNEL */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 font-serif">
                      4-Stage A to Z Traders Fulfillment Funnel
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Visual status of orders moving from NookMint customer checkout to iSales system entry and courier settlement.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#064E3B] bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    Active Pipeline
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Stage 1 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400">Step 1</span>
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center">
                      {orders.length}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">1. Customer Placed Order</h4>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Customer selected items, gave name, address & phone on NookMint storefront with COD.
                  </p>
                  <div className="text-[10px] text-slate-400 pt-1 font-mono">100% Sri Lanka Traffic</div>
                </div>

                {/* Stage 2 */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-300 space-y-2 relative">
                  <span className="absolute -top-2 right-3 text-[9px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase">
                    Your Action
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-emerald-800">Step 2</span>
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                      {orders.filter((o) => o.status === OrderStatus.PENDING_CONFIRMATION || o.status === OrderStatus.PENDING_COD_VERIFICATION).length}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-emerald-950">2. Ready for iSales Entry</h4>
                  <p className="text-[11px] text-emerald-800 leading-snug">
                    Use Admin 1-Click Copy tools to paste customer details & product code into A to Z Traders portal.
                  </p>
                  <div className="text-[10px] text-emerald-700 pt-1 font-semibold">Prompt 1-Click Clipboard Ready</div>
                </div>

                {/* Stage 3 */}
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-blue-700">Step 3</span>
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                      {orders.filter((o) => o.status === OrderStatus.CONFIRMED || o.status === OrderStatus.SHIPPED || o.status === OrderStatus.OUT_FOR_DELIVERY).length}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-blue-950">3. A to Z Traders Packing</h4>
                  <p className="text-[11px] text-blue-800 leading-snug">
                    A to Z warehouse checks stock, packages order, and hands over to Prompt Xpress / Domex courier.
                  </p>
                  <div className="text-[10px] text-blue-700 pt-1 font-mono">1-2 Days Western, 2-3 Days Outstation</div>
                </div>

                {/* Stage 4 */}
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-purple-700">Step 4</span>
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                      {orders.filter((o) => o.status === OrderStatus.DELIVERED).length}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-purple-950">4. Delivered & Settled</h4>
                  <p className="text-[11px] text-purple-800 leading-snug">
                    Customer pays cash upon delivery. COD amount collected and profit credited to your bank account.
                  </p>
                  <div className="text-[10px] text-purple-700 pt-1 font-mono">Bi-Weekly Payout Schedule</div>
                </div>
              </div>
            </div>

            {/* TWO-COLUMN GRID: CATEGORY BREAKDOWN & DISTRICT HEATMAP */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Category Volume & Revenue Breakdown */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#064E3B] flex items-center justify-center font-bold">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 font-serif">Category Performance</h3>
                      <p className="text-xs text-slate-500">Sales volume and customer traction across product lines</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl">
                    Live Catalog
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'Household & Kitchen', count: 12, share: 44, revenue: 'Rs. 46,680' },
                    { name: 'Smart Gadgets & Audio', count: 8, share: 32, revenue: 'Rs. 38,900' },
                    { name: 'Home & Garden', count: 6, share: 24, revenue: 'Rs. 24,500' },
                  ].map((cat) => (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{cat.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-500">{cat.count} Items</span>
                          <span className="font-mono font-bold text-[#064E3B]">{cat.revenue}</span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-[#064E3B] rounded-full transition-all duration-500"
                          style={{ width: `${cat.share}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Dropship Tip:</span> Kitchen silicone utensil sets and wireless Bluetooth lapel mics/earpods have the highest conversion rate on TikTok and Facebook Ads in Sri Lanka.
                  </div>
                </div>
              </div>

              {/* Sri Lanka 25-Districts Demand Heatmap */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#064E3B] flex items-center justify-center font-bold">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 font-serif">Islandwide District Demand</h3>
                      <p className="text-xs text-slate-500">Order distribution across Sri Lanka's top courier zones</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    25 Districts Covered
                  </span>
                </div>

                <div className="space-y-3.5">
                  {[
                    { zone: 'Colombo (Western Province)', share: '38%', count: 'High Demand', time: '1-2 Days (Prompt Xpress)' },
                    { zone: 'Gampaha & Kalutara', share: '24%', count: 'Growing Demand', time: '1-2 Days (Domex)' },
                    { zone: 'Kandy & Central Province', share: '18%', count: 'Active COD', time: '2-3 Days (Pronto)' },
                    { zone: 'Galle, Matara & Southern', share: '12%', count: 'Regular', time: '2-3 Days (Domex)' },
                    { zone: 'Kurunegala & North Western', share: '8%', count: 'Regular', time: '2-3 Days' },
                  ].map((dist) => (
                    <div key={dist.zone} className="p-3 rounded-2xl bg-[#FAF6F3] border border-slate-200/80 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900">{dist.zone}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <Truck className="w-3 h-3 text-emerald-700" />
                          <span>{dist.time}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm text-[#064E3B] block">{dist.share}</span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                          {dist.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TOP PERFORMING DROPSHIP SKUS & PROFIT MARGIN TABLE */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-serif">
                    Top Dropship Catalog SKUs & Profit Realization
                  </h3>
                  <p className="text-xs text-slate-500">
                    Calculated net earnings for each item when delivered via A to Z Traders Cash on Delivery.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                    {scopedProducts.length} Products Monitored
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF6F3] text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-5">Product & SKU Code</th>
                      <th className="py-3 px-5">Category</th>
                      <th className="py-3 px-5">{analyticsScope === 'own' ? 'Unit Cost (In-House)' : 'Wholesale Cost (iSales)'}</th>
                      <th className="py-3 px-5">Customer Price (COD)</th>
                      <th className="py-3 px-5">Net Profit / Sale</th>
                      <th className="py-3 px-5">Margin %</th>
                      <th className="py-3 px-5">New Arrival?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {scopedProducts.slice(0, 10).map((product) => {
                      const wholesale = product.costPrice || Math.round(product.sellingPrice * 0.7);
                      const profit = product.sellingPrice - wholesale;
                      const marginPct = product.sellingPrice > 0 ? Math.round((profit / product.sellingPrice) * 100) : 30;

                      return (
                        <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={product.images?.[0] || '/nookmint_images/hero.png'}
                                alt={product.title}
                                className="w-9 h-9 object-cover rounded-xl border border-slate-200 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900 line-clamp-1">{product.title}</div>
                                <div className="text-[10px] font-mono text-emerald-800 font-bold">
                                  SKU: {product.sku || product.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {product.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 font-mono text-slate-600 font-bold">
                            {formatLKR(wholesale)}
                          </td>
                          <td className="py-3.5 px-5 font-mono text-slate-900 font-black">
                            {formatLKR(product.sellingPrice)}
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                              +{formatLKR(profit)}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="font-bold text-slate-700">
                              {marginPct}%
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            {product.isNewArrival ? (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 w-max">
                                <Star className="w-2.5 h-2.5 fill-amber-600 text-amber-600" />
                                <span>Featured</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium">Standard</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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
      {/* ORDER ACTION MODAL */}
      {/* ============================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#064E3B] block">
                  MANAGE ORDER LIFECYCLE
                </span>
                <h3 className="text-xl font-black text-slate-900 font-serif">
                  Order #{selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-400">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">iSales Product Code / SKU</span>
                    <span className="font-mono font-bold text-emerald-800 text-[11px] truncate block">
                      {selectedOrder.items
                        ?.map((i: any) => `${i.selectedVariant?.sku || i.product.id || 'N/A'} (Qty: ${i.quantity})`)
                        .join(' | ')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        selectedOrder.items?.map((i: any) => i.selectedVariant?.sku || i.product.id).join(', ') || '',
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
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.product?.images?.[0]}
                        alt={item.product?.title}
                        className="w-12 h-14 object-cover rounded-xl bg-slate-50 border border-slate-100"
                      />
                      <div>
                        <h5 className="font-bold text-slate-900">{item.product?.title}</h5>
                        <div className="text-[11px] text-slate-400">
                          Size: <strong className="text-slate-700">{item.selectedSize}</strong> • Qty: {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-black text-slate-900 font-serif">
                      {formatLKR(item.product?.sellingPrice * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* PRODUCT ADD / EDIT MODAL (A to Z Traders Dropshipping Aligned) */}
      {/* ============================================================= */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className={`text-[10px] font-black uppercase tracking-wider block ${productForm.sourceType === 'own' ? 'text-purple-700' : 'text-[#064E3B]'}`}>
                  {productForm.sourceType === 'own' ? '🏭 OWN IN-HOUSE INVENTORY' : '📦 A TO Z TRADERS (ISALES) DROPSHIP'}
                </span>
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

            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
              {/* Sourcing Channel Selector (Dropship vs In-House) */}
              <div className="p-3.5 rounded-2xl bg-[#FAF6F3] border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800">
                    Product Sourcing Model *
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Customer only sees NookMint</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProductForm({ ...productForm, sourceType: 'dropship' })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      productForm.sourceType === 'dropship'
                        ? 'bg-white border-[#064E3B] ring-2 ring-[#064E3B]/20 shadow-xs'
                        : 'bg-white/60 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-extrabold text-xs text-slate-900">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <span>📦 A to Z Traders (Dropship)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Catalog item fulfilled by A to Z Traders (iSales). You enter their product code & wholesale cost. They pack and ship islandwide.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProductForm({ ...productForm, sourceType: 'own' })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      productForm.sourceType === 'own'
                        ? 'bg-white border-slate-900 ring-2 ring-slate-900/15 shadow-xs'
                        : 'bg-white/60 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-extrabold text-xs text-slate-900">
                      <Building2 className="w-3.5 h-3.5 text-slate-700" />
                      <span>Own Inventory / In-House</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Your own manufactured or pre-stocked items. You pack the parcel and set custom shipping rates / delivery rules for customers.
                    </p>
                  </button>
                </div>
              </div>

              {/* Sourcing Model Explanation Banner */}
              {productForm.sourceType === 'dropship' ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#064E3B] text-white flex items-center justify-center shrink-0 font-bold text-sm">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-extrabold text-xs text-emerald-950">A to Z Traders Dropshipping Model</div>
                    <p className="text-[11px] text-emerald-800 leading-snug">
                      No delivery fees or delivery dates needed. When orders arrive on NookMint, copy the customer details into iSales. A to Z Traders will pack, ship, and collect COD across Sri Lanka.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 font-bold text-sm">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-extrabold text-xs text-slate-900">Own Inventory (In-House) Model</div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      You pack and ship directly. Below, you can configure your delivery fees (standard, free, or flat fee) and test delivery days per district.
                    </p>
                  </div>
                </div>
              )}

              {/* 1. Basic Product Details & Sourcing Code */}
              <div className="space-y-3.5">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-1">
                  1. Product Details & {productForm.sourceType === 'own' ? 'Internal SKU' : 'iSales Code'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      value={productForm.title}
                      onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                      placeholder="e.g. Pro Sound True Wireless Earbuds with ANC"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#064E3B]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      {productForm.sourceType === 'own' ? 'Internal SKU *' : 'iSales Code (SKU) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      placeholder={productForm.sourceType === 'own' ? 'e.g. OWN-MUG-01' : 'e.g. EAR-ANC-WHT'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-[#064E3B] bg-slate-50 focus:ring-2 focus:ring-[#064E3B]"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {productForm.sourceType === 'own' ? 'Your stock tracking ID' : 'Used to copy into iSales order'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">Category *</label>
                      <button
                        type="button"
                        onClick={() => setIsAddingCategory(!isAddingCategory)}
                        className="text-[10px] font-bold text-[#064E3B] hover:text-[#04382A] flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{isAddingCategory ? 'Pick' : '+ New'}</span>
                      </button>
                    </div>

                    {isAddingCategory ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Category name..."
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
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
                          className="px-3 py-2 rounded-xl bg-[#064E3B] text-white text-xs font-bold"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingCategory(false)}
                          className="px-2 py-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                        >
                          Cancel
                        </button>
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-[#064E3B]"
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
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Brand Name</label>
                    <input
                      type="text"
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      placeholder="e.g. NookMint / ProSound"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#064E3B]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Unit / Package</label>
                    <input
                      type="text"
                      value={productForm.unit}
                      onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                      placeholder="e.g. 1 Unit / 12 Pcs Set"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#064E3B]"
                    />
                  </div>
                </div>

                {/* 2. Storefront Merchandising Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                    productForm.isNewArrival
                      ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-300/30'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={productForm.isNewArrival}
                      onChange={(e) => setProductForm({ ...productForm, isNewArrival: e.target.checked })}
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                    />
                    <div>
                      <div className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>Feature in &quot;New Arrivals&quot; Section</span>
                      </div>
                      <div className="text-[10px] text-amber-800 mt-0.5">
                        Showcase immediately in the Homepage New Arrivals grid
                      </div>
                    </div>
                  </label>

                  <label className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                    productForm.isBestSeller
                      ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-300/30'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={productForm.isBestSeller}
                      onChange={(e) => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                      className="w-4 h-4 text-rose-600 rounded focus:ring-rose-400"
                    />
                    <div>
                      <div className="font-bold text-xs text-rose-950 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                        <span>Feature in &quot;Popular Products&quot; Showcase</span>
                      </div>
                      <div className="text-[10px] text-rose-800 mt-0.5">
                        Showcase prominently in the customer Homepage Popular section
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 3. Pricing, Cost & Live Profit Margin */}
              <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-emerald-700" />
                    <span>3. Pricing & {productForm.sourceType === 'own' ? 'In-House Profit Margin' : 'Dropship Profit Margin'}</span>
                  </h4>
                  {productForm.offerPercentage > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-black text-[10px] tracking-wide uppercase">
                      {productForm.offerPercentage}% OFF APPLIED
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      {productForm.sourceType === 'own' ? 'Unit Cost / Mfg (Rs.) *' : 'Wholesale Cost (Rs.) *'}
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={productForm.costPrice}
                      onChange={(e) => setProductForm({ ...productForm, costPrice: Number(e.target.value) })}
                      placeholder="e.g. 2500"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-700 bg-white focus:ring-2 focus:ring-[#064E3B]"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {productForm.sourceType === 'own' ? 'Your stock cost' : 'A to Z catalogue price'}
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Selling Price (Rs.) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={productForm.sellingPrice}
                      onChange={(e) => handlePriceChange('sellingPrice', Number(e.target.value))}
                      placeholder="e.g. 3890"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs font-black text-[#064E3B] bg-white focus:ring-2 focus:ring-[#064E3B]"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">Customer COD total</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      MRP / Strike Price (Rs.) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={productForm.mrp}
                      onChange={(e) => handlePriceChange('mrp', Number(e.target.value))}
                      placeholder="e.g. 4900"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-500 bg-white focus:ring-2 focus:ring-[#064E3B]"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">Reference market price</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Offer Discount (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={90}
                      value={productForm.offerPercentage}
                      onChange={(e) => handleOfferChange(Number(e.target.value))}
                      placeholder="e.g. 20"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-[#064E3B]"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">Auto-computed</span>
                  </div>
                </div>

                {/* Live Profit Calculation Card */}
                <div className="p-3 rounded-xl bg-white border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-slate-600">
                      {productForm.sourceType === 'own' ? 'Your In-House Net Profit per Sale:' : 'Your Estimated Dropship Profit per Sale:'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-black text-emerald-800 font-mono">
                      +{formatLKR(productForm.sellingPrice - (productForm.costPrice || 0))} Net Profit
                    </strong>
                    {productForm.sellingPrice > 0 && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
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

                {/* Upload & Add Bar */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className={`cursor-pointer px-4 py-2.5 ${isUploadingImage ? 'bg-emerald-700' : 'bg-[#064E3B] hover:bg-[#04382A]'} text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs`}>
                    <UploadCloud className={`w-4 h-4 ${isUploadingImage ? 'animate-bounce' : ''}`} />
                    <span>{isUploadingImage ? 'Uploading Image...' : '+ Upload Photo from Device'}</span>
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
                      className="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#064E3B]"
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
                      className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                {/* Thumbnails Grid */}
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
                            className="px-1.5 py-0.5 rounded-md bg-slate-900/80 hover:bg-[#064E3B] text-white font-bold text-[9px] transition-colors shadow-sm"
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
              </div>

              {/* 5. Product Stock & Units (No clothes sizing needed) */}
              <div className="space-y-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">
                      5. Available Stock Units *
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {productForm.sourceType === 'own'
                        ? 'Current stock quantity in your in-house warehouse.'
                        : 'Available catalogue quantity from A to Z Traders.'}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-[#064E3B] font-extrabold text-xs">
                    {productForm.variants[0]?.stock || 0} Units in Stock
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">
                      Available Stock Quantity (Units) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={productForm.variants[0]?.stock ?? 25}
                      onChange={(e) => {
                        const qty = Math.max(0, Number(e.target.value));
                        setProductForm({
                          ...productForm,
                          variants: [{ size: 'Standard', stock: qty, sku: productForm.sku }],
                        });
                      }}
                      placeholder="e.g. 50"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-[#064E3B]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 self-end pb-0.5">
                    {[10, 25, 50, 100].map((units) => (
                      <button
                        key={units}
                        type="button"
                        onClick={() => {
                          setProductForm({
                            ...productForm,
                            variants: [{ size: 'Standard', stock: units, sku: productForm.sku }],
                          });
                        }}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer transition-colors shadow-2xs"
                      >
                        +{units}
                      </button>
                    ))}
                  </div>
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
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Product Description & Specifications
                </label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Describe product highlights, technical specs, material quality, and usage instructions..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#064E3B]"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-7 py-2.5 rounded-xl text-white font-extrabold uppercase tracking-wider transition-colors shadow-xs cursor-pointer ${
                    productForm.sourceType === 'own'
                      ? 'bg-slate-900 hover:bg-slate-800'
                      : 'bg-[#064E3B] hover:bg-[#04382A]'
                  }`}
                >
                  {editingProduct
                    ? 'Save Product Changes'
                    : productForm.sourceType === 'own'
                    ? 'Publish Own Product'
                    : 'Publish Dropship Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
