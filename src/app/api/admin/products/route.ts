import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { MockProductRepository } from '@/infrastructure/repositories/MockProductRepository';
import { Product } from '@/core/entities/Product';
import { isAuthorizedAdmin } from '@/shared/utils/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Seller Admin Product Management Route Handler
 * Full CRUD for Products: list, add new, edit details/price/stock, and remove.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized. Admin session required.' }, { status: 401 });
  }

  try {
    const productRepo = new MockProductRepository();
    const products = await productRepo.getAllProducts(true);
    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized. Admin session required.' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const {
      title,
      category,
      brand,
      unit,
      sku,
      sourceType,
      costPrice,
      fabric,
      mrp,
      sellingPrice,
      description,
      images,
      descriptionImages,
      ageGroup,
      gender,
      stock,
      variants,
      offerPercentage,
      isNewArrival,
      isBestSeller,
      sizeChartType,
      sizeChartImage,
      sizeNotes,
      deliveryFeeType,
      customDeliveryFee,
    } = body;

    if (!title || !category || !sellingPrice) {
      return NextResponse.json(
        { success: false, message: 'Title, category, and selling price are required.' },
        { status: 400 }
      );
    }

    const productRepo = new MockProductRepository();
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const newId = `ls-${Date.now().toString(36)}`;

    const numSellingPrice = Number(sellingPrice);
    const numMrp = Number(mrp) || numSellingPrice;

    // Calculate or accept offer percentage
    const computedDiscount =
      numMrp > numSellingPrice ? Math.round(((numMrp - numSellingPrice) / numMrp) * 100) : 0;
    const finalOfferPercentage =
      typeof offerPercentage === 'number' ? offerPercentage : computedDiscount;

    // Variants with individual size & color quantities
    const baseSku = sku || `${slug.substring(0, 5).toUpperCase()}-01`;
    let productVariants = variants && Array.isArray(variants) && variants.length > 0
      ? variants.map((v: any, idx: number) => ({
          size: v.size || 'Standard',
          sku: v.sku || `${baseSku}-${idx + 1}`,
          stock: Number(v.stock) || 0,
          image: v.image || undefined,
          colorHex: v.colorHex || undefined,
        }))
      : [
          { size: 'Standard', sku: baseSku, stock: Number(stock) || 30 },
        ];

    const newProduct: Product = {
      id: newId,
      title,
      slug,
      description: description || `${title} from NookMint.`,
      category,
      brand: brand || 'NookMint',
      unit: unit || 'item',
      sourceType: sourceType === 'own' ? 'own' : 'dropship',
      costPrice: typeof costPrice === 'number' ? costPrice : undefined,
      sku: baseSku,
      ageGroup: ageGroup || ('4-7 Years' as any),
      gender: gender || ('Unisex' as any),
      fabric: fabric || 'Premium Quality',
      mrp: numMrp,
      sellingPrice: numSellingPrice,
      offerPercentage: finalOfferPercentage,
      sizeChartType: sizeChartType || 'toddler',
      sizeChartImage: sizeChartImage || undefined,
      sizeNotes: sizeNotes || undefined,
      deliveryFeeType: deliveryFeeType || 'default',
      customDeliveryFee: typeof customDeliveryFee === 'number' ? customDeliveryFee : undefined,
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=900&auto=format&fit=crop&q=80'],
      descriptionImages: Array.isArray(descriptionImages) ? descriptionImages : [],
      videoUrl: body.videoUrl || undefined,
      variants: productVariants,
      rating: 5.0,
      reviewCount: 1,
      isCodAvailable: true,
      isNewArrival: typeof isNewArrival === 'boolean' ? isNewArrival : true,
      isBestSeller: typeof isBestSeller === 'boolean' ? isBestSeller : false,
    };

    const created = await productRepo.createProduct(newProduct);

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/products/[id]', 'page');
      revalidatePath(`/products/${newProduct.id}`);
      revalidatePath('/admin');
    } catch (e) {
      console.warn('Revalidate warning:', e);
    }

    return NextResponse.json({
      success: true,
      product: created,
      message: 'Product created successfully with sizes & offer percentage',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized. Admin session required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { productId, inStock, ...updates } = body;

    if (!productId) {
      return NextResponse.json({ success: false, message: 'productId is required' }, { status: 400 });
    }

    const productRepo = new MockProductRepository();

    if (typeof inStock === 'boolean') {
      const updated = await productRepo.toggleStock(productId, inStock);
      return NextResponse.json({ success: true, product: updated, message: 'Stock updated' });
    }

    const cleanUpdates: any = {};
    if (typeof updates.sellingPrice === 'number' || typeof updates.sellingPrice === 'string') {
      cleanUpdates.sellingPrice = Number(updates.sellingPrice);
    }
    if (typeof updates.mrp === 'number' || typeof updates.mrp === 'string') {
      cleanUpdates.mrp = Number(updates.mrp);
    }
    if (cleanUpdates.mrp && cleanUpdates.sellingPrice) {
      cleanUpdates.offerPercentage =
        cleanUpdates.mrp > cleanUpdates.sellingPrice
          ? Math.round(((cleanUpdates.mrp - cleanUpdates.sellingPrice) / cleanUpdates.mrp) * 100)
          : 0;
    }
    if (typeof updates.offerPercentage === 'number') {
      cleanUpdates.offerPercentage = updates.offerPercentage;
    }
    if (typeof updates.isHidden === 'boolean') cleanUpdates.isHidden = updates.isHidden;
    if (updates.status === 'active' || updates.status === 'inactive') cleanUpdates.status = updates.status;
    if (typeof updates.isNewArrival === 'boolean') cleanUpdates.isNewArrival = updates.isNewArrival;
    if (typeof updates.isBestSeller === 'boolean') cleanUpdates.isBestSeller = updates.isBestSeller;
    if (updates.sourceType) cleanUpdates.sourceType = updates.sourceType;
    if (updates.sku) cleanUpdates.sku = updates.sku;
    if (typeof updates.costPrice === 'number' || typeof updates.costPrice === 'string') {
      cleanUpdates.costPrice = Number(updates.costPrice);
    }
    if (updates.brand) cleanUpdates.brand = updates.brand;
    if (updates.unit) cleanUpdates.unit = updates.unit;
    if (updates.title) cleanUpdates.title = updates.title;
    if (updates.fabric !== undefined) cleanUpdates.fabric = updates.fabric;
    if (updates.description !== undefined) cleanUpdates.description = updates.description;
    if (updates.videoUrl !== undefined) cleanUpdates.videoUrl = updates.videoUrl;
    if (updates.category) cleanUpdates.category = updates.category;
    if (updates.gender) cleanUpdates.gender = updates.gender;
    if (updates.ageGroup) cleanUpdates.ageGroup = updates.ageGroup;
    if (updates.images && Array.isArray(updates.images)) cleanUpdates.images = updates.images;
    if (updates.descriptionImages && Array.isArray(updates.descriptionImages)) {
      cleanUpdates.descriptionImages = updates.descriptionImages;
    }
    if (updates.variants && Array.isArray(updates.variants)) {
      cleanUpdates.variants = updates.variants;
    }
    if (updates.sizeChartType) cleanUpdates.sizeChartType = updates.sizeChartType;
    if (updates.sizeChartImage !== undefined) cleanUpdates.sizeChartImage = updates.sizeChartImage;
    if (updates.sizeNotes !== undefined) cleanUpdates.sizeNotes = updates.sizeNotes;
    if (updates.deliveryFeeType) cleanUpdates.deliveryFeeType = updates.deliveryFeeType;
    if (updates.customDeliveryFee !== undefined) cleanUpdates.customDeliveryFee = Number(updates.customDeliveryFee);

    const updated = await productRepo.updateProduct(productId, cleanUpdates);

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/products/[id]', 'page');
      revalidatePath(`/products/${productId}`);
      revalidatePath('/admin');
    } catch (e) {
      console.warn('Revalidate warning:', e);
    }

    return NextResponse.json({ success: true, product: updated, message: 'Product updated successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized. Admin session required.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ success: false, message: 'productId is required' }, { status: 400 });
    }

    const productRepo = new MockProductRepository();
    const deleted = await productRepo.deleteProduct(productId);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/products/[id]', 'page');
      revalidatePath(`/products/${productId}`);
      revalidatePath('/admin');
    } catch (e) {
      console.warn('Revalidate warning:', e);
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
