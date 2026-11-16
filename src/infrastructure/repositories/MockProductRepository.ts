import { IProductRepository, ProductFilterOptions } from './IProductRepository';
import { Product } from '@/core/entities/Product';
import { DatabaseClient } from '../database/DatabaseClient';

/**
 * Mock Product Repository (SADP Repository Pattern)
 * Multi-Category Catalog for Innovative Consultants / AspireV Technologies.
 * Supports Groceries, Household Essentials, Fashion & Apparel, and Electric Vehicles (EV).
 */
export class MockProductRepository implements IProductRepository {
  private static readonly STORAGE_KEY = 'products_store';
  private db: DatabaseClient;

  private static readonly INITIAL_PRODUCTS: Product[] = [
    // ==========================================
    // 1. SMART GADGETS & AUDIO (EARPODS & WIRELESS MICS)
    // ==========================================
    {
      id: 'gadget-01',
      title: 'Pro Sound True Wireless Earbuds with ANC (Earpods)',
      slug: 'pro-sound-tws-wireless-earbuds-anc',
      description: 'Crystal-clear high-definition true wireless earbuds featuring Active Noise Cancellation (ANC), punchy bass, smart touch controls, and 28-hour playtime with USB-C wireless charging case.',
      category: 'Smart Gadgets & Audio',
      subcategory: 'Earbuds & Headphones',
      brand: 'AuraAudio',
      unit: 'set',
      mrp: 6500,
      sellingPrice: 4890,
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=900&auto=format&fit=crop&q=80',
      ],
      variants: [
        {
          size: 'Glacier White',
          sku: 'EAR-ANC-WHT',
          stock: 35,
          image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=900&auto=format&fit=crop&q=80',
          colorHex: '#F8FAFC',
        },
        {
          size: 'Midnight Matte Black',
          sku: 'EAR-ANC-BLK',
          stock: 25,
          image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=900&auto=format&fit=crop&q=80',
          colorHex: '#18181B',
        },
      ],
      attributes: {
        'Connectivity': 'Bluetooth 5.3 Ultra-Low Latency',
        'Battery Life': 'Up to 7 hrs per charge, 28 hrs total with case',
        'Water Resistance': 'IPX5 Sweat & Splash Proof',
        'Noise Cancellation': 'Active Noise Cancellation (ANC) + Environmental ENC Mics',
        'Charging': 'USB-C Fast Charging (10 mins = 2 hrs playtime)',
      },
      rating: 4.9,
      reviewCount: 114,
      isCodAvailable: true,
      isBestSeller: true,
      isNewArrival: true,
      offerPercentage: 25,
    },
    {
      id: 'gadget-02',
      title: 'Dual Wireless Lavalier Lapel Microphone (Plug & Play)',
      slug: 'dual-wireless-lavalier-lapel-microphone',
      description: 'Professional plug-and-play wireless lapel microphone system for content creation, TikTok/Reels, vlogging, and clear voice recording. Omnidirectional noise-reduction pickup with zero app setup needed.',
      category: 'Smart Gadgets & Audio',
      subcategory: 'Microphones & Audio',
      brand: 'StreamClear',
      unit: 'set',
      mrp: 5200,
      sellingPrice: 3890,
      images: [
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1583775253503-68d71fb98f7e?w=900&auto=format&fit=crop&q=80',
      ],
      variants: [
        { size: 'Type-C Receiver (Android/iPhone 15+)', sku: 'MIC-TYP-C', stock: 40 },
        { size: 'Lightning Receiver (iPhone 14 & earlier)', sku: 'MIC-LTG', stock: 30 },
      ],
      attributes: {
        'Transmission Range': 'Up to 20 meters barrier-free',
        'Pickup Pattern': '360° Omnidirectional with DSP Noise Reduction',
        'Battery Life': 'Up to 6 hours continuous recording',
        'Setup': 'Plug & Play (No Bluetooth or App pairing required)',
      },
      rating: 4.8,
      reviewCount: 88,
      isCodAvailable: true,
      isNewArrival: true,
      offerPercentage: 25,
    },

    // ==========================================
    // 2. HOUSEHOLD & KITCHEN ESSENTIALS
    // ==========================================
    {
      id: 'kitchen-01',
      title: 'Heat-Resistant Non-Stick Silicone Kitchen Utensil Set (12 Pcs)',
      slug: 'heat-resistant-silicone-kitchen-utensil-set-12pcs',
      description: 'Food-grade BPA-free heat-resistant silicone cooking utensils with natural anti-scald acacia wood handles. Safe for all non-stick pans. Includes turner, soup ladle, spatula, whisk, tongs, and countertop holder.',
      category: 'Household & Kitchen',
      subcategory: 'Kitchen & Tableware',
      brand: 'ChefCraft',
      unit: 'set',
      mrp: 5800,
      sellingPrice: 4290,
      images: [
        'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=900&auto=format&fit=crop&q=80',
      ],
      variants: [
        {
          size: '12-Piece Mint Green Set',
          sku: 'KTCH-12-MNT',
          stock: 35,
          image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=900&auto=format&fit=crop&q=80',
          colorHex: '#6EE7B7',
        },
        {
          size: '12-Piece Nordic Grey Set',
          sku: 'KTCH-12-GRY',
          stock: 25,
          image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=900&auto=format&fit=crop&q=80',
          colorHex: '#64748B',
        },
      ],
      attributes: {
        'Material': 'Food-Grade Silicone (BPA-Free) + Natural Acacia Wood Handles',
        'Heat Resistance': 'Up to 230°C (446°F) Non-Melting',
        'Non-Scratch': '100% Safe on Teflon and Ceramic Cookware',
      },
      rating: 4.9,
      reviewCount: 94,
      isCodAvailable: true,
      isBestSeller: true,
      isNewArrival: true,
      offerPercentage: 26,
    },

    // ==========================================
    // 3. HOME & GARDENING TOOLS & PLANTERS
    // ==========================================
    {
      id: 'garden-01',
      title: 'Heavy-Duty Garden Hand Trowel & Cultivator Fork Set',
      slug: 'heavy-duty-garden-hand-trowel-cultivator-set',
      description: 'Premium rust-resistant stainless steel gardening hand tools with ergonomic soft-grip handles. Ideal for potting, weeding, loosening soil, transplanting seedlings, and household garden care.',
      category: 'Home & Garden',
      subcategory: 'Gardening Tools',
      brand: 'FloraCraft',
      unit: 'set',
      mrp: 3200,
      sellingPrice: 2450,
      images: [
        'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&auto=format&fit=crop&q=80',
      ],
      variants: [
        { size: '2-Piece Set (Trowel + Fork)', sku: 'GDN-TOOL-2PC', stock: 45 },
        { size: '3-Piece Set (+ Transplanter)', sku: 'GDN-TOOL-3PC', stock: 25 },
      ],
      attributes: {
        'Material': 'Polished Stainless Steel + TPR Ergonomic Non-Slip Grip',
        'Rust Resistance': '100% Anti-Corrosion Treated',
      },
      rating: 4.9,
      reviewCount: 62,
      isCodAvailable: true,
      isBestSeller: true,
      isNewArrival: true,
      offerPercentage: 23,
    },
    {
      id: 'garden-02',
      title: 'Nordic Ceramic Succulent Planter Pot with Wooden Stand',
      slug: 'nordic-ceramic-succulent-planter-pot-stand',
      description: 'Minimalist glazed ceramic planter pot with matching natural bamboo/wooden tripod stand. Features bottom drainage hole to promote healthy root growth for indoor succulents, ferns, and herbs.',
      category: 'Home & Garden',
      subcategory: 'Pots & Planters',
      brand: 'NookHome',
      unit: 'piece',
      mrp: 2900,
      sellingPrice: 2190,
      images: [
        'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=900&auto=format&fit=crop&q=80',
      ],
      variants: [
        { size: 'Medium (14 cm Diameter)', sku: 'POT-ND-MED', stock: 30 },
        { size: 'Large (18 cm Diameter)', sku: 'POT-ND-LRG', stock: 20 },
      ],
      attributes: {
        'Material': 'High-Fire Ceramic + Natural Varnished Bamboo Stand',
        'Drainage': 'Bottom drainage hole with removable plug included',
      },
      rating: 4.8,
      reviewCount: 47,
      isCodAvailable: true,
      isNewArrival: true,
      offerPercentage: 24,
    },
    {
      id: 'pop-01',
      title: 'Airtight Cereal & Dry Food Storage Containers (Set of 4)',
      slug: 'airtight-cereal-dry-food-storage-containers-set-of-4',
      description: 'BPA-free food storage containers with 4-side locking silicone sealed lids. Keeps pantry cereals, pasta, flour, and coffee 100% moisture-proof and fresh. Includes reusable chalkboard labels and liquid chalk pen.',
      category: 'Household & Kitchen',
      subcategory: 'Kitchen & Tableware',
      brand: 'ChefLine Pro',
      unit: 'set',
      mrp: 4200,
      sellingPrice: 3450,
      images: [
        'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=900&auto=format&fit=crop&q=80',
      ],
      variants: [
        { size: 'Set of 4 (1.6L Containers)', sku: 'CNT-4PC-16L', stock: 45 },
        { size: 'Set of 6 (+ 2.8L Tall Jars)', sku: 'CNT-6PC-VAR', stock: 20 },
      ],
      attributes: {
        'Material': 'BPA-Free Food Grade Polystyrene + Silicone Ring',
        'Seal Mechanism': '4-Sided Airtight & Leak-Proof Snap Lock',
        'Dishwasher Safe': 'Yes, Removable Silicone Gaskets',
      },
      rating: 4.9,
      reviewCount: 168,
      isCodAvailable: true,
      isBestSeller: true,
      offerPercentage: 18,
    },
    {
      id: 'pop-02',
      title: 'Heavy-Duty Multi-Purpose Stainless Steel Kitchen Shears',
      slug: 'heavy-duty-multipurpose-stainless-steel-kitchen-shears',
      description: 'Ultra-sharp Japanese high-carbon stainless steel multipurpose kitchen scissors with built-in bone notch, bottle opener, nut cracker, and fish scaler. Ergonomic non-slip comfort handle for heavy-duty household use.',
      category: 'Household & Kitchen',
      subcategory: 'Kitchen & Tableware',
      brand: 'ChefCraft',
      unit: 'item',
      mrp: 2600,
      sellingPrice: 1950,
      images: [
        'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=900&auto=format&fit=crop&q=80',
      ],
      variants: [
        { size: 'Standard (Black & Grey Grip)', sku: 'SHR-KTN-BLK', stock: 38 },
        { size: 'Pro Set (+ Magnetic Blade Sheath)', sku: 'SHR-KTN-PRO', stock: 24 },
      ],
      attributes: {
        'Blade Material': 'High Carbon 3Cr14 German Stainless Steel',
        'Handle': 'Ergonomic TPR Non-Slip Grip (Right/Left Handed)',
        'Functions': 'Poultry Shears, Nut Cracker, Bottle Opener, Herb Cutter',
      },
      rating: 4.8,
      reviewCount: 95,
      isCodAvailable: true,
      isBestSeller: true,
      offerPercentage: 25,
    },
    {
      id: 'pop-03',
      title: 'Laundry Detergent – 3 L',
      slug: 'laundry-detergent-3-l',
      description: 'Eco-concentrated liquid laundry detergent with active plant-based stain lifters and fresh floral scent. Tough on dirt, gentle on fabrics.',
      category: 'Household & Kitchen',
      subcategory: 'Cleaning & Care',
      brand: 'PureBreeze',
      unit: 'L',
      mrp: 2250,
      sellingPrice: 1890,
      images: [
        '/images1/pexels-ron-lach-10557898.jpg',
        'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=900&auto=format&fit=crop&q=85',
      ],
      variants: [
        { size: '3 Litre Jug', sku: 'DET-3L', stock: 40 },
        { size: '5 Litre Refill', sku: 'DET-5L', stock: 22 },
      ],
      attributes: {
        'Brand': 'PureBreeze',
        'Volume': '3 Litres',
        'Type': 'Liquid Detergent (HE Compatible)',
      },
      rating: 4.7,
      reviewCount: 78,
      isCodAvailable: true,
      isBestSeller: true,
      offerPercentage: 16,
    },
    {
      id: 'pop-04',
      title: 'Automatic Rechargeable Water Dispenser Pump (USB-C)',
      slug: 'automatic-rechargeable-water-dispenser-pump',
      description: 'Universal electric water dispenser pump fits standard 5-gallon water bottles. Fast one-touch water dispensing with built-in 1200mAh USB rechargeable battery and food-grade silicone hose.',
      category: 'Household & Kitchen',
      subcategory: 'Small Appliances',
      brand: 'AquaFlow',
      unit: 'item',
      mrp: 2990,
      sellingPrice: 2250,
      images: [
        'https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=900&auto=format&fit=crop&q=80',
      ],
      variants: [
        { size: 'Standard (USB-C)', sku: 'PMP-WTR-01', stock: 45 },
      ],
      attributes: {
        'Battery': '1200mAh USB Rechargeable (30-40 Days on Single Charge)',
        'Material': 'BPA-Free Food Grade Silicone & 304 Stainless Steel',
        'Compatibility': 'Fits 2, 3, 4, 5 Gallon Water Bottles',
      },
      rating: 4.8,
      reviewCount: 110,
      isCodAvailable: true,
      isBestSeller: true,
      offerPercentage: 25,
    },
    {
      id: 'pop-05',
      title: 'Ceramic Mug – 350 ml',
      slug: 'ceramic-mug-350-ml',
      description: 'Handcrafted stoneware ceramic mug with smooth ergonomic loop handle and durable chip-resistant matte glaze. Microwave and dishwasher safe.',
      category: 'Household & Kitchen',
      subcategory: 'Kitchen & Tableware',
      brand: 'EarthWare Craft',
      unit: 'item',
      mrp: 850,
      sellingPrice: 690,
      images: [
        '/images1/pexels-ron-lach-10388755.jpg',
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=900&auto=format&fit=crop&q=85',
      ],
      variants: [
        { size: '350 ml (Sage Green)', sku: 'MUG-GRN-350', stock: 50 },
        { size: '350 ml (Matte Black)', sku: 'MUG-BLK-350', stock: 35 },
      ],
      attributes: {
        'Material': 'High-Fired Stoneware Ceramic',
        'Capacity': '350 ml',
      },
      rating: 4.9,
      reviewCount: 88,
      isCodAvailable: true,
      isBestSeller: true,
      offerPercentage: 19,
    },

    // ==========================================
    // 2. NEW ARRIVALS (HIGH-RESOLUTION STUDIO COMMERCIAL PACKSHOTS)
    // ==========================================
    {
      id: 'new-01',
      title: 'Self-Watering Indoor Herb & Flower Planter Pot',
      slug: 'self-watering-indoor-herb-flower-planter-pot',
      description: 'Modern double-layer self-watering planter pot with visual water level gauge and absorbent cotton wick rope. Stores water for 10-14 days so your indoor herbs, flowers, and vegetables never dehydrate.',
      category: 'Home & Garden',
      subcategory: 'Pots & Planters',
      brand: 'FloraCraft',
      unit: 'item',
      mrp: 2450,
      sellingPrice: 1890,
      images: [
        'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=900&auto=format&fit=crop&q=80',
      ],
      variants: [
        { size: 'Medium (15 cm White/Terracotta)', sku: 'POT-SLF-MED', stock: 45 },
        { size: 'Large (20 cm White/Terracotta)', sku: 'POT-SLF-LRG', stock: 25 },
      ],
      attributes: {
        'Material': 'UV-Resistant Virgin Polypropylene (Non-Toxic)',
        'Water Reservoir': 'Holds up to 500ml water (10-14 days auto-watering)',
        'Indicator': 'Transparent floating water level indicator',
      },
      rating: 4.8,
      reviewCount: 42,
      isCodAvailable: true,
      isNewArrival: true,
      offerPercentage: 22,
    },
    {
      id: 'new-02',
      title: 'Facial Tissues – 200 Sheets',
      slug: 'facial-tissues-200-sheets',
      description: '2-ply ultra-soft facial tissues made from 100% virgin wood pulp. Hypoallergenic, lint-free and absorbent for daily delicate skin care.',
      category: 'Household & Kitchen',
      subcategory: 'Paper & Hygiene',
      brand: 'SoftPuff',
      unit: 'box',
      mrp: 580,
      sellingPrice: 490,
      images: [
        '/images1/pexels-vlada-karpovich-3958200.jpg',
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=900&auto=format&fit=crop&q=85',
      ],
      variants: [
        { size: '200 Sheets Box', sku: 'TIS-200S', stock: 60 },
        { size: 'Pack of 3 Boxes', sku: 'TIS-3BOX', stock: 25 },
      ],
      rating: 4.9,
      reviewCount: 56,
      isCodAvailable: true,
      isNewArrival: true,
      offerPercentage: 15,
    },
    {
      id: 'new-03',
      title: 'High-Pressure 8-Pattern Adjustable Garden Hose Spray Nozzle',
      slug: 'high-pressure-adjustable-garden-hose-spray-nozzle',
      description: 'Heavy-duty zinc alloy metal garden hose spray nozzle with ergonomic rubberised pistol grip and 8 versatile spray patterns (mist, shower, jet, cone, flat, soaker, center, flood) for garden watering and car washing.',
      category: 'Home & Garden',
      subcategory: 'Gardening Tools',
      brand: 'FloraCraft',
      unit: 'item',
      mrp: 3250,
      sellingPrice: 2450,
      images: [
        'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&auto=format&fit=crop&q=80',
      ],
      variants: [
        { size: 'Standard Nozzle + 3 Connectors', sku: 'GDN-NZL-8P', stock: 35 },
      ],
      attributes: {
        'Material': 'Solid Zinc Alloy Body + Impact-Resistant TPR Grip',
        'Patterns': '8 Distinct Spray Settings with Thumb Flow Lever',
        'Fitting': 'Universal 3/4" Brass Thread + Quick Hose Connectors',
      },
      rating: 4.8,
      reviewCount: 58,
      isCodAvailable: true,
      isNewArrival: true,
      offerPercentage: 24,
    },
    {
      id: 'new-04',
      title: 'Laundry Basket',
      slug: 'laundry-basket',
      description: 'Ventilated home laundry basket made from durable BPA-free matte polypropylene with built-in ergonomic carry handles. Lightweight and easy to clean.',
      category: 'Household & Kitchen',
      subcategory: 'Storage & Organization',
      brand: 'HomeOrganize',
      unit: 'item',
      mrp: 2450,
      sellingPrice: 1990,
      images: [
        '/images1/pexels-izafi-38539045.jpg',
        'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=900&auto=format&fit=crop&q=85',
      ],
      variants: [
        { size: 'Standard (45 L)', sku: 'BSK-45L', stock: 40 },
        { size: 'Large (65 L)', sku: 'BSK-65L', stock: 20 },
      ],
      rating: 4.7,
      reviewCount: 31,
      isCodAvailable: true,
      isNewArrival: true,
      offerPercentage: 18,
    },

    // ==========================================
    // 3. MORE HOUSEHOLD & KITCHEN ESSENTIALS
    // ==========================================
    {
      id: 'groc-01',
      title: 'Multi-Blade Stainless Steel Vegetable Mandoline Slicer',
      slug: 'multi-blade-stainless-steel-vegetable-mandoline-slicer',
      description: 'Professional kitchen mandoline slicer with 6 interchangeable stainless steel blades, catch container, non-slip base, and safety food pusher hand guard. Easily julienne, grate, and slice vegetables and fruits in seconds.',
      category: 'Household & Kitchen',
      subcategory: 'Kitchen & Tableware',
      brand: 'ChefCraft',
      unit: 'set',
      mrp: 4200,
      sellingPrice: 3450,
      images: [
        'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=900&auto=format&fit=crop&q=80',
      ],
      variants: [
        { size: '6-in-1 Complete Set (Forest Green)', sku: 'SLC-6IN1-GRN', stock: 42 },
      ],
      attributes: {
        'Blade Material': 'Food-Grade 420 Stainless Steel (Anti-Rust)',
        'Container Capacity': '1.2 Litre Catch Drawer',
        'Safety': 'Includes finger-guard food holder and blade storage case',
      },
      specifications: [
        { name: 'Blade Types', value: 'Thick/Thin Slice, Julienne, Fine Grater, Wavy Cut' },
        { name: 'Cleaning', value: 'Quick-rinse detachable parts (Dishwasher safe top rack)' },
      ],
      rating: 4.9,
      reviewCount: 142,
      isCodAvailable: true,
      isBestSeller: true,
      isNewArrival: false,
      offerPercentage: 18,
    },
    {
      id: 'groc-02',
      title: 'Portable Mini Bluetooth Speaker with Ambient 360 RGB Light',
      slug: 'portable-mini-bluetooth-speaker-ambient-rgb-light',
      description: 'Compact wireless cylinder Bluetooth 5.3 speaker with 360-degree room-filling sound, punchy bass radiator, and beat-synced ambient RGB mood lighting. Features built-in microphone for hands-free speakerphone calls.',
      category: 'Smart Gadgets & Audio',
      subcategory: 'Earbuds & Headphones',
      brand: 'AuraAudio',
      unit: 'item',
      mrp: 4500,
      sellingPrice: 3490,
      images: [
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900&auto=format&fit=crop&q=80',
      ],
      variants: [
        { size: 'Matte Black RGB', sku: 'SPK-RGB-BLK', stock: 35 },
        { size: 'Forest Green RGB', sku: 'SPK-RGB-GRN', stock: 25 },
      ],
      attributes: {
        'Battery Life': 'Up to 10 hours continuous playback (1800mAh)',
        'Connectivity': 'Bluetooth 5.3 + MicroSD / Aux-In support',
        'Water Resistance': 'IPX5 Splashproof & Dustproof',
      },
      specifications: [
        { name: 'Output Power', value: '10W RMS with Dual Passive Bass Radiator' },
        { name: 'Lighting Modes', value: '6 Dynamic RGB Color Flow Animations' },
      ],
      rating: 4.8,
      reviewCount: 89,
      isCodAvailable: true,
      isNewArrival: true,
      offerPercentage: 22,
    },
    {
      id: 'groc-03',
      title: 'Precision Electronic Digital Kitchen & Baking Scale (5kg / 1g)',
      slug: 'precision-electronic-digital-kitchen-scale',
      description: 'Sleek brushed stainless steel digital food kitchen scale with high-precision strain gauge sensors. Instant tare calculation, crisp backlit LCD screen, and multi-unit conversion (g, oz, lb, ml) for cooking and baking.',
      category: 'Household & Kitchen',
      subcategory: 'Kitchen & Tableware',
      brand: 'ChefLine Pro',
      unit: 'item',
      mrp: 2950,
      sellingPrice: 2250,
      images: [
        'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=900&auto=format&fit=crop&q=80',
      ],
      variants: [
        { size: 'Stainless Steel Silver (5kg/1g)', sku: 'SCL-DIG-SS', stock: 45 },
      ],
      attributes: {
        'Capacity': '5000g (11 lbs) with 1g Precision Division',
        'Functions': 'One-Touch Tare, Auto-Off (2 mins), Low Battery Warning',
        'Power': '2x AAA Batteries Included',
      },
      specifications: [
        { name: 'Platform Material', value: 'Anti-Fingerprint 304 Stainless Steel' },
        { name: 'Display', value: 'High-Contrast Blue Backlit LCD' },
      ],
      rating: 4.9,
      reviewCount: 110,
      isCodAvailable: true,
      isBestSeller: true,
      offerPercentage: 24,
    },
    {
      id: 'groc-04',
      title: 'Fast 15W Qi Wireless Charging Desk Stand with LED Indicator',
      slug: 'fast-15w-qi-wireless-charging-desk-stand',
      description: 'Dual-coil ergonomic wireless charging stand. Supports portrait and landscape viewing while charging iPhone, Samsung, and Qi-compatible smartphones and earbuds. Includes smart temperature control and over-voltage protection.',
      category: 'Smart Gadgets & Audio',
      subcategory: 'Smart Accessories',
      brand: 'NookTech',
      unit: 'item',
      mrp: 3600,
      sellingPrice: 2790,
      images: [
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1583775253503-68d71fb98f7e?w=900&auto=format&fit=crop&q=80',
      ],
      variants: [
        { size: 'Matte Black Stand (USB-C Cable Included)', sku: 'CHG-15W-BLK', stock: 38 },
      ],
      attributes: {
        'Max Output': '15W Fast Charge (Adaptive 10W/7.5W/5W)',
        'Coils': 'Dual Inductive Coils for 60° Vertical & Horizontal charging',
        'Safety': 'Foreign Object Detection (FOD) + Overheat Protection',
      },
      specifications: [
        { name: 'Input Port', value: 'Type-C USB Fast Input (QC 3.0 compatible)' },
        { name: 'Compatibility', value: 'Universal Qi Wireless Enabled Devices' },
      ],
      rating: 4.7,
      reviewCount: 54,
      isCodAvailable: true,
      offerPercentage: 22,
    },

    // ==========================================
    // 2. HOUSEHOLD PRODUCTS & DAILY ITEMS
    // ==========================================
    {
      id: 'house-01',
      title: '7-Piece Tri-Ply Stainless Steel Induction Cookware Set',
      slug: '7-piece-tri-ply-stainless-steel-induction-cookware-set',
      description: 'Professional 18/10 stainless steel cookware with bonded aluminum core for rapid, uniform heat distribution without hot spots. Features stay-cool ergonomic riveted handles and tempered glass steam-vent lids.',
      category: 'Household & Kitchen',
      subcategory: 'Kitchen & Dining',
      brand: 'ChefLine Pro',
      unit: 'set',
      mrp: 34500,
      sellingPrice: 28900,
      images: [
        'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=900&auto=format&fit=crop&q=80',
      ],
      variants: [
        { size: 'Standard 7-Piece Set', sku: 'HSE-CKW-7PC', stock: 12 },
        { size: 'Deluxe 10-Piece Set', sku: 'HSE-CKW-10PC', stock: 8 },
      ],
      attributes: {
        'Brand': 'ChefLine Pro',
        'Material': 'Food-Grade 18/10 Tri-Ply Stainless Steel',
        'Compatibility': 'Induction, Gas, Ceramic, Halogen & Oven Safe to 260°C',
        'Dishwasher Safe': 'Yes, 100% Dishwasher Safe',
        'Warranty': '10 Years Limited Warranty',
      },
      specifications: [
        { name: 'Set Inclusions', value: '1.5L Saucepan, 3L Casserole, 5.5L Stockpot with lids + 24cm Frypan' },
        { name: 'Base Thickness', value: '4.5 mm Encapsulated Thermal Core' },
      ],
      rating: 4.9,
      reviewCount: 38,
      isCodAvailable: true,
      isBestSeller: true,
      offerPercentage: 16,
    },
    {
      id: 'house-02',
      title: 'Multipurpose Natural Bamboo 3-Tier Storage Organizer',
      slug: 'multipurpose-natural-bamboo-3-tier-storage-organizer',
      description: 'Sustainably sourced solid bamboo shelving rack designed for kitchen spices, pantry jars, bathroom essentials, or desktop organization. Water-resistant protective lacquer finish.',
      category: 'Household & Kitchen',
      subcategory: 'Storage & Organization',
      brand: 'EcoLiving',
      unit: 'item',
      mrp: 7500,
      sellingPrice: 5990,
      images: [
        'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=900&auto=format&fit=crop&q=80',
      ],
      variants: [
        { size: '2-Tier Compact', sku: 'HSE-BMB-2T', stock: 24 },
        { size: '3-Tier Standard', sku: 'HSE-BMB-3T', stock: 19 },
      ],
      attributes: {
        'Brand': 'EcoLiving',
        'Dimensions': '42 cm (W) x 18 cm (D) x 48 cm (H)',
        'Material': '100% Natural Moso Bamboo',
        'Assembly': 'Tool-free quick setup (Hardware & hex key included)',
        'Weight Capacity': '15 kg per tier',
      },
      specifications: [
        { name: 'Finish', value: 'Eco UV Lacquer Water Repellent' },
        { name: 'Care', value: 'Wipe clean with a damp microfiber cloth' },
      ],
      rating: 4.8,
      reviewCount: 62,
      isCodAvailable: true,
      isNewArrival: true,
      offerPercentage: 20,
    },
    {
      id: 'house-03',
      title: 'Nordic Minimalist 16-Piece Matte Ceramic Dinnerware Set',
      slug: 'nordic-minimalist-16-piece-matte-ceramic-dinnerware-set',
      description: 'Artisanal stoneware fired at 1280°C for exceptional durability and chip resistance. Matte charcoal and sandstone glaze with tactile organic rim contours. Service for 4 persons.',
      category: 'Household & Kitchen',
      subcategory: 'Kitchen & Dining',
      brand: 'NordicCraft',
      unit: 'set',
      mrp: 19800,
      sellingPrice: 16400,
      images: [
        'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=900&auto=format&fit=crop&q=80',
      ],
      variants: [
        { size: '16-Piece Set (Matte Slate)', sku: 'HSE-DNW-SLT', stock: 14 },
        { size: '16-Piece Set (Ivory Sand)', sku: 'HSE-DNW-IVR', stock: 10 },
      ],
      attributes: {
        'Brand': 'NordicCraft',
        'Includes': '4 Dinner Plates (27cm), 4 Salad Plates (20cm), 4 Soup Bowls (15cm), 4 Mugs (380ml)',
        'Microwave Safe': 'Yes',
        'Dishwasher Safe': 'Yes',
        'Lead & Cadmium': '100% Lead-Free & Non-Toxic',
      },
      specifications: [
        { name: 'Material', value: 'High-Density Vitrified Stoneware' },
        { name: 'Weight', value: '8.6 kg total set' },
      ],
      rating: 4.8,
      reviewCount: 45,
      isCodAvailable: true,
      offerPercentage: 17,
    },

    // ==========================================
    // 3. CLOTHING & FASHION
    // ==========================================
    {
      id: 'cloth-01',
      title: 'Ergonomic Garden Bypass Pruning Shears (SK5 High Carbon Steel)',
      slug: 'ergonomic-garden-bypass-pruning-shears-sk5',
      description: 'Ultra-sharp Japanese SK5 carbon steel garden pruning shears with anti-rust teflon coating and shock-absorbing ergonomic grip. Cuts branches up to 20mm cleanly without bruising plant stems.',
      category: 'Home & Garden',
      subcategory: 'Gardening Tools',
      brand: 'FloraCraft',
      unit: 'item',
      mrp: 4500,
      sellingPrice: 3250,
      images: [
        'https://images.unsplash.com/photo-1589051039495-eb77714d84e8?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&auto=format&fit=crop&q=80',
      ],
      variants: [
        { size: 'Standard (8-Inch)', sku: 'GDN-SHR-01', stock: 40 },
      ],
      attributes: {
        'Blade Material': 'Japanese SK5 High Carbon Steel with Non-Stick Coating',
        'Cutting Capacity': 'Up to 20mm Diameter Branches',
        'Handle': 'Ergonomic Non-Slip Grip with Safety Lock Catch',
      },
      specifications: [
        { name: 'Spring Type', value: 'Heavy Duty Stainless Coil Spring' },
        { name: 'Warranty', value: '1 Year Manufacturer Warranty' },
      ],
      rating: 4.9,
      reviewCount: 96,
      isCodAvailable: true,
      isBestSeller: true,
      offerPercentage: 28,
    },
    {
      id: 'cloth-02',
      title: 'Multi-Function 4-in-1 Handheld Immersion Stick Blender & Whisk (600W)',
      slug: 'multi-function-4in1-handheld-immersion-stick-blender',
      description: 'Heavy duty 600W multi-speed immersion stick blender set including stainless steel blending wand, 500ml food chopper bowl, balloon whisk attachment, and 600ml measuring beaker for smoothies, soups, and purees.',
      category: 'Household & Kitchen',
      subcategory: 'Kitchen & Dining',
      brand: 'ChefLine Pro',
      unit: 'item',
      mrp: 8900,
      sellingPrice: 6750,
      images: [
        'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=900&auto=format&fit=crop&q=80',
      ],
      variants: [
        { size: 'Complete 4-in-1 Set', sku: 'KTN-BLD-01', stock: 25 },
      ],
      attributes: {
        'Motor Power': '600 Watts Pure Copper Motor',
        'Blades': '304 Food Grade Cross Titanium-Coated Stainless Steel',
        'Speed': 'Turbo Mode + 6 Variable Speed Settings',
      },
      specifications: [
        { name: 'Attachments', value: 'Stick Wand, 500ml Chopper, Whisk, 600ml Beaker' },
        { name: 'Cleaning', value: 'Detachable Dishwasher-Safe Shaft' },
      ],
      rating: 4.8,
      reviewCount: 74,
      isCodAvailable: true,
      isNewArrival: true,
      offerPercentage: 24,
    },
    {
      id: 'cloth-03',
      title: 'Smart WiFi Remote Plug Socket with Real-Time Power Monitoring',
      slug: 'smart-wifi-remote-plug-socket-power-monitoring',
      description: 'Control household appliances from anywhere using your smartphone via Smart Life / Tuya app. Features schedule timers, energy consumption tracking, voice assistant support (Alexa/Google Home), and surge overload protection.',
      category: 'Smart Gadgets & Audio',
      subcategory: 'Smart Accessories',
      brand: 'NookTech',
      unit: 'item',
      mrp: 4200,
      sellingPrice: 3190,
      images: [
        'https://images.unsplash.com/photo-1558002038-1055907df827?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=80',
      ],
      variants: [
        { size: 'Single Pack (16A)', sku: 'SMT-PLG-01', stock: 35 },
      ],
      attributes: {
        'Max Current': '16A Heavy Duty (Supports Heaters & Air Conditioners)',
        'App Compatibility': 'Tuya / Smart Life (iOS & Android)',
        'Voice Assistants': 'Amazon Alexa & Google Assistant Compatible',
      },
      specifications: [
        { name: 'WiFi Standard', value: '2.4 GHz b/g/n' },
        { name: 'Safety', value: 'Flame-Retardant PC Shell with Child Lock Shutter' },
      ],
      rating: 4.7,
      reviewCount: 82,
      isCodAvailable: true,
      offerPercentage: 24,
    },

    // ==========================================
    // 4. SMART HOME & GARDEN LIGHTING
    // ==========================================
    {
      id: 'ev-01',
      title: 'Ultrasonic Essential Oil Aromatherapy Diffuser & Flame Mist Humidifier',
      slug: 'ultrasonic-essential-oil-aromatherapy-diffuser-flame-mist',
      description: '500ml large-capacity quiet ultrasonic humidifier and essential oil aroma diffuser with soothing realistic LED flame night light simulation. Auto shut-off safety protection when water runs out. Purifies dry home air and creates a relaxing spa ambiance.',
      category: 'Household & Kitchen',
      subcategory: 'Small Appliances',
      brand: 'NookHome',
      unit: 'item',
      mrp: 6200,
      sellingPrice: 4890,
      images: [
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=900&auto=format&fit=crop&q=80',
      ],
      variants: [
        { size: 'Matte Charcoal Grey (500ml)', sku: 'DIF-FLM-GRY', stock: 28 },
        { size: 'Warm Woodgrain Sand (500ml)', sku: 'DIF-FLM-WDG', stock: 22 },
      ],
      attributes: {
        'Tank Capacity': '500 ml (Up to 12 Hours Continuous Mist)',
        'Noise Level': 'Ultra-quiet < 25dB Sleep Mode',
        'Lighting Modes': 'Warm Amber Flame Glow + Gradient Mood Colors',
        'Safety': 'BPA-Free Material with Waterless Auto-Shutoff',
      },
      specifications: [
        { name: 'Timer Settings', value: '1H / 3H / 6H / Continuous ON' },
        { name: 'Power Supply', value: 'DC 24V Quiet Adapter Included' },
      ],
      rating: 4.9,
      reviewCount: 79,
      isCodAvailable: true,
      isNewArrival: true,
      offerPercentage: 21,
    },
    {
      id: 'ev-02',
      title: 'Solar-Powered Outdoor Waterproof LED Motion Sensor Garden Lights (Pack of 2)',
      slug: 'solar-powered-outdoor-waterproof-led-motion-sensor-garden-lights',
      description: 'Eco-friendly high-efficiency solar security wall and garden fence lights with 100 ultra-bright LEDs and 120-degree PIR motion detection up to 5 meters. IP65 waterproof rated for all-weather Sri Lankan tropical monsoon conditions.',
      category: 'Home & Garden',
      subcategory: 'Gardening Tools',
      brand: 'FloraCraft',
      unit: 'set',
      mrp: 5200,
      sellingPrice: 3950,
      images: [
        'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&auto=format&fit=crop&q=80',
      ],
      variants: [
        { size: '2-Pack Solar Sensor Lights', sku: 'SLR-LGT-2PK', stock: 35 },
      ],
      attributes: {
        'Solar Panel': 'High-Efficiency Monocrystalline Silicon (6-8 hrs sunlight)',
        'Battery': 'Built-in 1800mAh Rechargeable Lithium-Ion Battery',
        'Waterproof Grade': 'IP65 Weatherproof & Heat-Resistant',
        'Sensor Angle': '120° Wide Angle Motion Detection (3-5m range)',
      },
      specifications: [
        { name: 'Lighting Modes', value: 'Dim-to-Bright Sensor, Sensor Only, All-Night Medium' },
        { name: 'Installation', value: 'Screw mount or double-sided tape (No wiring needed)' },
      ],
      rating: 4.9,
      reviewCount: 64,
      isCodAvailable: true,
      isBestSeller: true,
      offerPercentage: 24,
    },
  ];

  constructor() {
    this.db = DatabaseClient.getInstance();
    if (!this.db.has(MockProductRepository.STORAGE_KEY)) {
      this.db.set(MockProductRepository.STORAGE_KEY, [...MockProductRepository.INITIAL_PRODUCTS]);
    }
  }

  public static getPopularReferenceProducts(): Product[] {
    return MockProductRepository.INITIAL_PRODUCTS.filter((p) =>
      ['pop-01', 'pop-02', 'pop-03', 'pop-04', 'pop-05'].includes(p.id)
    );
  }

  public static getNewArrivalsReferenceProducts(): Product[] {
    return MockProductRepository.INITIAL_PRODUCTS.filter((p) =>
      ['new-01', 'new-02', 'new-03', 'new-04'].includes(p.id)
    );
  }

  private getStore(): Product[] {
    let list = this.db.get<Product[]>(MockProductRepository.STORAGE_KEY);
    if (!list || list.length === 0) {
      list = [...MockProductRepository.INITIAL_PRODUCTS];
      this.db.set(MockProductRepository.STORAGE_KEY, list);
    }
    return list;
  }

  public async getAllProducts(includeHidden: boolean = false): Promise<Product[]> {
    const products = this.getStore();
    if (includeHidden) {
      return products;
    }
    return products.filter((p) => !p.isHidden && p.status !== 'inactive');
  }

  public async getProductById(id: string): Promise<Product | null> {
    const products = this.getStore();
    return products.find((p) => p.id === id) || null;
  }

  public async getProductBySlug(slug: string): Promise<Product | null> {
    const products = this.getStore();
    return products.find((p) => p.slug === slug) || null;
  }

  public async filterProducts(options: ProductFilterOptions): Promise<Product[]> {
    const products = this.getStore();

    let filtered = products.filter((product) => {
      // 0. Exclude hidden or inactive products for customer storefront
      if (!options.includeHidden && (product.isHidden === true || product.status === 'inactive')) {
        return false;
      }

      // 1. Category Matching (case-insensitive substring or exact)
      if (options.category && options.category !== 'All') {
        const catQuery = options.category.toLowerCase().trim();
        const prodCat = (product.category || '').toLowerCase();
        const prodSub = (product.subcategory || '').toLowerCase();

        const matches =
          prodCat === catQuery ||
          prodCat.includes(catQuery) ||
          prodSub.includes(catQuery) ||
          (catQuery.includes('grocer') && prodCat.includes('grocer')) ||
          (catQuery.includes('house') && prodCat.includes('house')) ||
          (catQuery.includes('cloth') && prodCat.includes('cloth')) ||
          (catQuery.includes('ev') && (prodCat.includes('electric') || prodCat.includes('ev')));

        if (!matches) return false;
      }

      // 2. Promotion / Sale Filter
      if (options.onSaleOnly) {
        const hasDiscount = (product.mrp && product.mrp > product.sellingPrice) || (product.offerPercentage && product.offerPercentage > 0);
        if (!hasDiscount) return false;
      }

      // 3. New Arrivals Filter
      if (options.isNewArrival && !product.isNewArrival) return false;

      // 4. Max Price Filter
      if (options.maxPrice && product.sellingPrice > options.maxPrice) return false;

      // 5. COD availability filter
      if (options.codOnly && !product.isCodAvailable) return false;

      // 6. Search Query (Title, Category, Subcategory, Brand, Description, Attributes)
      if (options.searchQuery && options.searchQuery.trim()) {
        const q = options.searchQuery.toLowerCase().trim();
        const matchesTitle = product.title.toLowerCase().includes(q);
        const matchesCategory = (product.category || '').toLowerCase().includes(q);
        const matchesSubcategory = (product.subcategory || '').toLowerCase().includes(q);
        const matchesBrand = (product.brand || '').toLowerCase().includes(q);
        const matchesDesc = (product.description || '').toLowerCase().includes(q);
        const matchesSku = (product.sku || '').toLowerCase().includes(q) || (product.id || '').toLowerCase().includes(q);
        const matchesVariantSku = product.variants?.some((v) => (v.sku || '').toLowerCase().includes(q));

        if (!matchesTitle && !matchesCategory && !matchesSubcategory && !matchesBrand && !matchesDesc && !matchesSku && !matchesVariantSku) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    if (options.sortBy) {
      if (options.sortBy === 'price-low') {
        filtered = [...filtered].sort((a, b) => a.sellingPrice - b.sellingPrice);
      } else if (options.sortBy === 'price-high') {
        filtered = [...filtered].sort((a, b) => b.sellingPrice - a.sellingPrice);
      } else if (options.sortBy === 'rating') {
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
      } else if (options.sortBy === 'newest') {
        filtered = [...filtered].sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
      }
    }

    return filtered;
  }

  public async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const products = this.getStore();
    const productIndex = products.findIndex((p) => p.id === id);
    if (productIndex === -1) return null;

    products[productIndex] = {
      ...products[productIndex],
      ...updates,
    };
    this.db.set(MockProductRepository.STORAGE_KEY, products);
    return products[productIndex];
  }

  public async toggleStock(id: string, inStock: boolean): Promise<Product | null> {
    const products = this.getStore();
    const product = products.find((p) => p.id === id);
    if (!product) return null;

    product.variants.forEach((v) => {
      v.stock = inStock ? (v.stock > 0 ? v.stock : 10) : 0;
    });

    this.db.set(MockProductRepository.STORAGE_KEY, products);
    return product;
  }

  public async createProduct(newProduct: Product): Promise<Product> {
    const products = this.getStore();
    products.unshift(newProduct);
    this.db.set(MockProductRepository.STORAGE_KEY, products);
    return newProduct;
  }

  public async deleteProduct(id: string): Promise<boolean> {
    const products = this.getStore();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length !== products.length) {
      this.db.set(MockProductRepository.STORAGE_KEY, filtered);
      return true;
    }
    return false;
  }

  /**
   * Validates and deducts stock for purchased cart items
   */
  public async deductStock(
    items: { product: { id: string; title: string }; selectedVariant?: { size: string }; quantity: number }[]
  ): Promise<{ success: boolean; message?: string }> {
    const products = this.getStore();

    for (const item of items) {
      const prod = products.find((p) => p.id === item.product.id);
      if (!prod) {
        return { success: false, message: `Product "${item.product.title}" is no longer available.` };
      }

      const reqSize = item.selectedVariant?.size;
      if (reqSize) {
        const variant = prod.variants.find((v) => v.size === reqSize);
        if (!variant || variant.stock < item.quantity) {
          const avail = variant?.stock ?? 0;
          return {
            success: false,
            message: `Only ${avail} unit(s) left in stock for "${prod.title}" (${reqSize}).`,
          };
        }
      } else {
        const totalStock = prod.variants.reduce((s, v) => s + v.stock, 0);
        if (totalStock < item.quantity) {
          return {
            success: false,
            message: `Insufficient stock for "${prod.title}". Only ${totalStock} available.`,
          };
        }
      }
    }

    for (const item of items) {
      const prod = products.find((p) => p.id === item.product.id);
      if (prod) {
        const reqSize = item.selectedVariant?.size;
        if (reqSize) {
          const variant = prod.variants.find((v) => v.size === reqSize);
          if (variant) {
            variant.stock = Math.max(0, variant.stock - item.quantity);
          }
        } else if (prod.variants.length > 0) {
          prod.variants[0].stock = Math.max(0, prod.variants[0].stock - item.quantity);
        }
      }
    }

    this.db.set(MockProductRepository.STORAGE_KEY, products);
    return { success: true };
  }

  /**
   * Restores stock when an order is cancelled
   */
  public async restoreStock(
    items: { product: { id: string }; selectedVariant?: { size: string }; quantity: number }[]
  ): Promise<void> {
    const products = this.getStore();
    for (const item of items) {
      const prod = products.find((p) => p.id === item.product.id);
      if (prod) {
        const reqSize = item.selectedVariant?.size;
        if (reqSize) {
          const variant = prod.variants.find((v) => v.size === reqSize);
          if (variant) {
            variant.stock += item.quantity;
          }
        } else if (prod.variants.length > 0) {
          prod.variants[0].stock += item.quantity;
        }
      }
    }
    this.db.set(MockProductRepository.STORAGE_KEY, products);
  }
}
