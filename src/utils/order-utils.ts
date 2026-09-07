export const getDisplayCustomerName = (order: any): string => {
  if (!order) return "—";

  // Helper to parse JSON if string
  const parseObj = (val: any) => {
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && typeof parsed === "object") return parsed;
        } catch {}
      }
    }
    return val;
  };

  // 1. Shipping / Billing / Address properties (entered by customer at checkout for this specific order)
  const addresses = [
    order.shippingAddress,
    order.shipping_address,
    order.address,
    order.billingAddress,
    order.billing_address,
    order.deliveryAddress,
    order.shipping_info
  ];

  for (let rawAddr of addresses) {
    const addr = parseObj(rawAddr);
    if (addr && typeof addr === "object") {
      const candidate = addr.name || addr.fullName || addr.full_name || addr.customerName || addr.recipientName;
      if (candidate && typeof candidate === "string" && candidate.trim() && candidate.trim() !== "—" && candidate.trim() !== "Customer") {
        return candidate.trim();
      }
      if (addr.firstName) {
        const full = `${addr.firstName} ${addr.lastName || ''}`.trim();
        if (full) return full;
      }
    } else if (typeof addr === "string" && addr.trim()) {
      const trimmed = addr.trim();
      if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
        return trimmed;
      }
    }
  }

  // 2. Direct order customerName / name fields
  const orderNames = [
    order.customerName,
    order.customer_name,
    order.recipientName,
    order.name,
    order.guestName
  ];

  for (let candidate of orderNames) {
    if (candidate && typeof candidate === "string" && candidate.trim() && candidate.trim() !== "—" && candidate.trim() !== "Customer") {
      return candidate.trim();
    }
  }

  // 3. User account profile name (fallback)
  if (order.user?.name && typeof order.user.name === "string" && order.user.name.trim() && order.user.name !== "—") return order.user.name.trim();
  if (order.user?.fullName && typeof order.user.fullName === "string" && order.user.fullName.trim()) return order.user.fullName.trim();
  if (order.user?.firstName) {
    const full = `${order.user.firstName} ${order.user.lastName || ''}`.trim();
    if (full) return full;
  }
  if (order.customer?.name && typeof order.customer.name === "string" && order.customer.name.trim()) return order.customer.name.trim();
  if (order.customer?.fullName && typeof order.customer.fullName === "string" && order.customer.fullName.trim()) return order.customer.fullName.trim();

  // 4. Fallback to Email username or Phone
  if (order.user?.email && order.user.email.trim()) return order.user.email;
  if (order.customerEmail && order.customerEmail.trim()) return order.customerEmail;
  if (order.email && order.email.trim()) return order.email;
  if (order.user?.phone) return String(order.user.phone).trim();
  if (order.customerPhone) return String(order.customerPhone).trim();
  if (order.phone) return String(order.phone).trim();

  return "—";
};

export const getDisplayCustomerPhone = (order: any): string => {
  if (!order) return "";

  const extractFromObj = (raw: any): string => {
    if (!raw) return "";
    let target = raw;

    if (typeof target === "string") {
      const trimmed = target.trim();
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && typeof parsed === "object") target = parsed;
        } catch {}
      } else if (/^[\d\s+\-()]{6,20}$/.test(trimmed)) {
        return trimmed;
      }
    }

    if (typeof target === "object" && target !== null) {
      const candidate =
        target.phone ||
        target.phoneNumber ||
        target.phone_number ||
        target.mobile ||
        target.contact ||
        target.contactNo ||
        target.contact_no ||
        target.phoneNo ||
        target.customerPhone ||
        target.userPhone ||
        target.tel ||
        target.telephone;

      if (candidate !== undefined && candidate !== null) {
        const str = String(candidate).trim();
        if (str && str !== "undefined" && str !== "null" && str !== "N/A" && str !== "—") {
          return str;
        }
      }
    }

    return "";
  };

  // Priority 1: Check Shipping Address / Billing Address (where customer specified phone for order)
  const shippingAddresses = [
    order.shippingAddress,
    order.shipping_address,
    order.address,
    order.billingAddress,
    order.billing_address,
    order.shipping_info,
    order.deliveryAddress,
    order.delivery_address,
  ];

  for (const addr of shippingAddresses) {
    const found = extractFromObj(addr);
    if (found) return found;
  }

  // Priority 2: Direct phone fields on the root order object
  const rootPhones = [
    order.customerPhone,
    order.customer_phone,
    order.phoneNumber,
    order.phone_number,
    order.phone,
    order.mobile,
    order.contact,
  ];

  for (const raw of rootPhones) {
    if (raw !== undefined && raw !== null) {
      const str = String(raw).trim();
      if (str && str !== "undefined" && str !== "null" && str !== "N/A" && str !== "—") {
        return str;
      }
    }
  }

  // Priority 3: Phone from user / customer relationship object
  const userPhones = [
    order.user?.phone,
    order.user?.phoneNumber,
    order.user?.phone_number,
    order.user?.mobile,
    order.customer?.phone,
    order.customer?.phoneNumber,
    order.customer?.mobile,
  ];

  for (const raw of userPhones) {
    if (raw !== undefined && raw !== null) {
      const str = String(raw).trim();
      if (str && str !== "undefined" && str !== "null" && str !== "N/A" && str !== "—") {
        return str;
      }
    }
  }

  return "";
};

export const getDisplayCustomerContact = (order: any): string => {
  const phone = getDisplayCustomerPhone(order);
  if (phone) return phone;

  if (!order) return "";

  let shippingAddr: any =
    order.shippingAddress ||
    order.shipping_address ||
    order.address ||
    order.billingAddress ||
    order.billing_address ||
    order.shipping_info;

  if (typeof shippingAddr === "string") {
    const trimmed = shippingAddr.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === "object") shippingAddr = parsed;
      } catch {}
    }
  }

  const rawEmail =
    order.user?.email ||
    order.customerEmail ||
    order.customer_email ||
    order.email ||
    (typeof shippingAddr === "object" && shippingAddr !== null ? shippingAddr.email : undefined);

  if (rawEmail && typeof rawEmail === "string" && rawEmail.trim()) {
    const trimmed = rawEmail.trim();
    if (trimmed !== "undefined" && trimmed !== "null" && trimmed !== "N/A") {
      return trimmed;
    }
  }

  return "";
};
