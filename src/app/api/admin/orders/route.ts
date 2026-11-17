import { NextRequest, NextResponse } from 'next/server';
import { CheckoutFacade } from '@/infrastructure/patterns/structural/CheckoutFacade';
import { MockOrderRepository } from '@/infrastructure/repositories/MockOrderRepository';
import { MockProductRepository } from '@/infrastructure/repositories/MockProductRepository';
import { OrderStatus, PaymentStatus } from '@/shared/types/common';
import { isAuthorizedAdmin } from '@/shared/utils/adminAuth';

/**
 * Seller Admin Order Management Route Handler
 * Allows seller to list orders, verify manual bank deposits, and update courier fulfilment statuses.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized. Admin session required.' }, { status: 401 });
  }

  try {
    const facade = new CheckoutFacade();
    const orders = await facade.getAllOrders();
    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch orders' },
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
    const { orderId, orderStatus, paymentStatus, verificationNotes, trackingNumber } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, message: 'orderId is required' }, { status: 400 });
    }

    const orderRepo = new MockOrderRepository();
    const order = await orderRepo.findById(orderId);

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const previousStatus = order.status;
    if (orderStatus && Object.values(OrderStatus).includes(orderStatus)) {
      order.status = orderStatus;

      // If cancelling an order, automatically restore product variant inventory
      if (orderStatus === OrderStatus.CANCELLED && previousStatus !== OrderStatus.CANCELLED && order.items) {
        const productRepo = new MockProductRepository();
        await productRepo.restoreStock(order.items);
      }
    }

    if (paymentStatus && Object.values(PaymentStatus).includes(paymentStatus)) {
      order.paymentStatus = paymentStatus;
    }

    if (verificationNotes !== undefined) {
      order.verificationNotes = verificationNotes;
    }

    if (trackingNumber) {
      order.verificationNotes = order.verificationNotes
        ? `${order.verificationNotes} | Courier Tracking: ${trackingNumber}`
        : `Courier Tracking: ${trackingNumber}`;
    }

    await orderRepo.update(order);

    return NextResponse.json({
      success: true,
      order,
      message: 'Order updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update order' },
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
    const orderId = searchParams.get('orderId');
    const clearAll = searchParams.get('clearAll') === 'true';

    const orderRepo = new MockOrderRepository();

    if (clearAll) {
      await orderRepo.clearAll();
      return NextResponse.json({ success: true, message: 'All demo and test orders cleared successfully.' });
    }

    if (!orderId) {
      return NextResponse.json({ success: false, message: 'orderId is required' }, { status: 400 });
    }

    const deleted = await orderRepo.delete(orderId);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Order deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete order' },
      { status: 500 }
    );
  }
}
