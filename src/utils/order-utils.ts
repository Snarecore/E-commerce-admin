export const getDisplayCustomerName = (order: any): string => {
  if (!order) return "—";

  // 1. Direct user / customer properties
  if (order.user?.name && order.user.name.trim() && order.user.name !== "—") return order.user.name.trim();
  if (order.user?.fullName && order.user.fullName.trim()) return order.user.fullName.trim();
  if (order.user?.firstName) {
    const full = `${order.user.firstName} ${order.user.lastName || ''}`.trim();
    if (full) return full;
  }

  if (order.customerName && order.customerName.trim()) return order.customerName.trim();
  if (order.customer_name && order.customer_name.trim()) return order.customer_name.trim();
  if (order.name && order.name.trim()) return order.name.trim();
  if (order.guestName && order.guestName.trim()) return order.guestName.trim();

  // 2. Customer object properties
  if (order.customer?.name && order.customer.name.trim()) return order.customer.name.trim();
  if (order.customer?.fullName && order.customer.fullName.trim()) return order.customer.fullName.trim();

  // 3. Shipping / Billing / Address properties
  const addr =
    order.shippingAddress ||
    order.shipping_address ||
    order.address ||
    order.billingAddress ||
    order.billing_address ||
    order.deliveryAddress ||
    order.shipping_info;

  if (addr) {
    if (typeof addr === 'string') return addr;
    if (addr.fullName && addr.fullName.trim()) return addr.fullName.trim();
    if (addr.full_name && addr.full_name.trim()) return addr.full_name.trim();
    if (addr.name && addr.name.trim()) return addr.name.trim();
    if (addr.customerName && addr.customerName.trim()) return addr.customerName.trim();
    if (addr.recipientName && addr.recipientName.trim()) return addr.recipientName.trim();
    if (addr.firstName) {
      const full = `${addr.firstName} ${addr.lastName || ''}`.trim();
      if (full) return full;
    }
  }

  // 4. Fallback to Email username or Phone
  if (order.user?.email && order.user.email.trim()) return order.user.email;
  if (order.customerEmail && order.customerEmail.trim()) return order.customerEmail;
  if (order.email && order.email.trim()) return order.email;
  if (order.user?.phone && order.user.phone.trim()) return order.user.phone.trim();
  if (order.customerPhone && order.customerPhone.trim()) return order.customerPhone.trim();
  if (order.phone && order.phone.trim()) return order.phone.trim();

  return "—";
};

export const getDisplayCustomerContact = (order: any): string => {
  if (!order) return "";

  // 1. Phone numbers
  const phone =
    order.user?.phone ||
    order.customerPhone ||
    order.phone ||
    order.shippingAddress?.phone ||
    order.shippingAddress?.mobile ||
    order.shipping_address?.phone ||
    order.address?.phone ||
    order.billingAddress?.phone ||
    order.shipping_info?.phone;

  if (phone && typeof phone === 'string' && phone.trim()) return phone.trim();

  // 2. Emails
  const email =
    order.user?.email ||
    order.customerEmail ||
    order.email ||
    order.shippingAddress?.email ||
    order.shipping_address?.email ||
    order.address?.email;

  if (email && typeof email === 'string' && email.trim()) return email.trim();

  return "";
};
