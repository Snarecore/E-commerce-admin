// seed-policies.mjs
// Seeds comprehensive, realistic policy and info CMS data to the backend API

const API_BASE = "http://localhost:5000/api/v1";

async function login() {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@gmail.com", password: "Password123!" })
    });
    const data = await res.json();
    return data?.data?.accessToken;
}

const policies = [
    {
        endpoint: "policy-one-cms",
        title: "Privacy Policy",
        description: `<h2>Privacy Policy</h2>
<p><strong>Effective Date:</strong> January 1, 2026</p>
<p>Welcome to <strong>Fashion Time</strong>. We are committed to protecting your privacy and ensuring your personal information is handled safely and securely. This policy outlines our practices regarding data collection, usage, and protection.</p>

<h3>1. Information We Collect</h3>
<ul>
    <li><strong>Personal Details:</strong> Name, email address, contact phone number, shipping address, and billing address.</li>
    <li><strong>Transaction Details:</strong> Items purchased, order value, payment method (note: credit card details are handled via secure PCI-DSS payment gateways and are never saved on our servers).</li>
    <li><strong>Device & Usage Data:</strong> IP address, device type, browser, and navigation patterns to optimize your shopping experience.</li>
</ul>

<h3>2. How We Use Your Information</h3>
<ul>
    <li>To process, ship, and deliver your orders accurately.</li>
    <li>To provide live order tracking, delivery SMS notifications, and customer support.</li>
    <li>To detect and prevent fraudulent transactions or unauthorized access.</li>
    <li>To send promotional discounts and seasonal offers (only with your prior consent, with one-click unsubscribe).</li>
</ul>

<h3>3. Information Sharing</h3>
<p>We do not sell or rent your personal data to third parties. We share only necessary information with authorized logistics partners (e.g., Steadfast, Pathao, RedX) and secure payment processors to complete your order fulfillment.</p>

<h3>4. Contact Us</h3>
<p>For any privacy inquiries, reach us at <strong>support@fashiontime.com</strong> or call <strong>+880 1317-020309</strong>.</p>`
    },
    {
        endpoint: "policy-two-cms",
        title: "Refund & Return Policy",
        description: `<h2>Refund &amp; Return Policy</h2>
<p><strong>Effective Date:</strong> January 1, 2026</p>
<p>At <strong>Fashion Time</strong>, customer satisfaction is our highest priority. If you are not completely satisfied with your purchase, we offer a hassle-free <strong>7-Day Easy Return &amp; Exchange Guarantee</strong>.</p>

<h3>1. Eligibility for Returns &amp; Exchanges</h3>
<ul>
    <li>The return request must be initiated within <strong>7 days</strong> of parcel delivery.</li>
    <li>The product must be unused, unwashed, unworn, and in original brand packaging with all tags and barcode labels intact.</li>
    <li>Proof of purchase (invoice or order ID) is required for verification.</li>
</ul>

<h3>2. Non-Returnable Items</h3>
<ul>
    <li>Innerwear, lingerie, socks, and personal hygiene items due to hygiene and health safety standards.</li>
    <li>Customized, tailored, or clearance sale items marked as non-returnable.</li>
</ul>

<h3>3. Exchange &amp; Return Process</h3>
<ol>
    <li>Contact our Customer Care team via WhatsApp/Phone at <strong>+880 1317-020309</strong> or email <strong>support@fashiontime.com</strong> with your Order ID and photo of the issue.</li>
    <li>Our courier partner will pick up the return parcel from your doorstep (Dhaka & major divisional cities), or you may parcel it to our return hub.</li>
    <li>Upon receiving the item at our warehouse, our quality control team will inspect it within 24–48 hours.</li>
</ol>

<h3>4. Refund Methods &amp; Timelines</h3>
<ul>
    <li><strong>bKash / Nagad / Mobile Banking:</strong> Refund processed within 2–4 business days.</li>
    <li><strong>Debit / Credit Cards:</strong> Refund processed to your issuing bank within 5–7 business days.</li>
    <li><strong>Store Credit / Voucher:</strong> Issued instantly for your next shopping checkout.</li>
</ul>

<h3>5. Damaged or Defective Items</h3>
<p>If you receive a damaged, defective, or incorrect size product, please notify us within <strong>24 hours</strong> of delivery. We will arrange a free exchange at zero additional shipping cost.</p>`
    },
    {
        endpoint: "policy-three-cms",
        title: "Shipping & Delivery Policy",
        description: `<h2>Shipping &amp; Delivery Policy</h2>
<p><strong>Effective Date:</strong> January 1, 2026</p>
<p><strong>Fashion Time</strong> provides fast, reliable, and secure nationwide doorstep delivery across all 64 districts in Bangladesh.</p>

<h3>1. Delivery Coverage &amp; Timelines</h3>
<ul>
    <li><strong>Inside Dhaka City:</strong> Delivery within <strong>24 to 48 hours</strong>.</li>
    <li><strong>Dhaka Suburbs (Gazipur, Savar, Narayanganj):</strong> Delivery within <strong>48 to 72 hours</strong>.</li>
    <li><strong>Outside Dhaka (Nationwide):</strong> Delivery within <strong>3 to 5 business days</strong>.</li>
    <li><strong>Express Same-Day Delivery:</strong> Available for select Dhaka zones for orders placed before 12:00 PM.</li>
</ul>

<h3>2. Shipping Charges</h3>
<ul>
    <li><strong>Inside Dhaka:</strong> BDT 60 standard delivery charge.</li>
    <li><strong>Outside Dhaka:</strong> BDT 120 standard delivery charge.</li>
    <li><strong>Free Shipping:</strong> Enjoy FREE shipping on all orders exceeding BDT 2,500!</li>
</ul>

<h3>3. Real-Time Order Tracking</h3>
<p>Once your order is dispatched, you will receive an SMS and email notification containing the courier tracking number and real-time live tracking link.</p>

<h3>4. Cash on Delivery (COD) Inspection</h3>
<p>For Cash on Delivery orders, we encourage you to inspect the external parcel seal before making payment to the delivery rider.</p>`
    },
    {
        endpoint: "policy-four-cms",
        title: "Terms & Conditions",
        description: `<h2>Terms &amp; Conditions</h2>
<p><strong>Effective Date:</strong> January 1, 2026</p>
<p>Welcome to <strong>Fashion Time</strong>. By accessing, browsing, or placing an order on our platform, you agree to comply with and be bound by the following terms and conditions.</p>

<h3>1. Account & Security</h3>
<p>You are responsible for maintaining the confidentiality of your account credentials. Any activity performed under your account is your sole responsibility.</p>

<h3>2. Pricing & Product Accuracy</h3>
<p>All product prices are shown in Bangladeshi Taka (BDT) inclusive of applicable VAT unless stated otherwise. We strive to present accurate colors and descriptions, though slight variations may occur due to photographic lighting.</p>

<h3>3. Order Cancellation</h3>
<p>Orders can be cancelled free of charge prior to warehouse packaging and dispatch. Once dispatched with courier, standard return procedures apply.</p>

<h3>4. Governing Law</h3>
<p>These terms are governed and construed in accordance with the laws of the People's Republic of Bangladesh.</p>`
    },
    {
        endpoint: "policy-five-cms",
        title: "Vendor Agreement",
        description: `<h2>Vendor Agreement &amp; Partnership Policy</h2>
<p><strong>Effective Date:</strong> January 1, 2026</p>
<p>This Vendor Agreement governs the terms of partnership between verified merchants/brands and <strong>Fashion Time</strong> marketplace.</p>

<h3>1. Quality Standards</h3>
<p>All vendors must guarantee 100% authentic, original, and brand-new products. Counterfeit, replica, or substandard goods are strictly prohibited.</p>

<h3>2. Order Fulfillment & SLA</h3>
<p>Vendors must prepare, package, and hand over confirmed orders to our logistics hub within <strong>24 hours</strong> of notification.</p>

<h3>3. Payments & Commission Settlements</h3>
<p>Vendor sales balances are settled on a weekly automated payout cycle directly to the merchant's designated bank account or MFS account.</p>`
    },
    {
        endpoint: "policy-six-cms",
        title: "About Us",
        description: `<h2>About Fashion Time</h2>
<p>Welcome to <strong>Fashion Time</strong> – your premier lifestyle fashion and clothing destination in Bangladesh.</p>

<h3>Our Story & Mission</h3>
<p>Founded with a passion for contemporary trends and timeless elegance, Fashion Time brings you premium quality apparel, western wear, ethnic collections, and everyday essentials crafted with the finest fabrics.</p>

<h3>Why Choose Us?</h3>
<ul>
    <li><strong>100% Quality Assurance:</strong> Premium fabrics, rigorous stitching checks, and authentic designs.</li>
    <li><strong>Fast Nationwide Delivery:</strong> Swift delivery across all 64 districts in Bangladesh.</li>
    <li><strong>7-Day Easy Returns:</strong> Risk-free shopping with our hassle-free return and exchange policy.</li>
    <li><strong>Dedicated 24/7 Support:</strong> Friendly customer assistance to guide your sizing and orders.</li>
</ul>`
    },
    {
        endpoint: "policy-seven-cms",
        title: "Security & Fraud Prevention Policy",
        description: `<h2>Security &amp; Fraud Prevention Policy</h2>
<p><strong>Effective Date:</strong> January 1, 2026</p>
<p>We employ enterprise-grade security protocols, SSL/TLS encryption, and automated fraud prevention filters to ensure 100% safe and secure transactions for all customers.</p>`
    },
    {
        endpoint: "policy-eight-cms",
        title: "Payment Policy",
        description: `<h2>Payment Methods &amp; Policy</h2>
<p>We support multiple convenient, safe payment options:</p>
<ul>
    <li><strong>Cash on Delivery (COD):</strong> Pay cash when your parcel arrives.</li>
    <li><strong>Mobile Financial Services:</strong> bKash, Nagad, Rocket instant payments.</li>
    <li><strong>Credit / Debit Cards:</strong> Visa, Mastercard, AMEX cards processed via secure PCI-DSS gateway.</li>
</ul>`
    },
    {
        endpoint: "policy-nine-cms",
        title: "Cookie Policy",
        description: `<h2>Cookie Policy</h2>
<p>We use essential cookies to maintain your shopping cart, user preferences, and personalized product recommendations. You can manage or disable cookies in your browser settings at any time.</p>`
    },
    {
        endpoint: "policy-ten-cms",
        title: "Disclaimer & Intellectual Property",
        description: `<h2>Disclaimer &amp; Intellectual Property</h2>
<p>All trademarks, logos, brand assets, product photos, and content on this site are the exclusive property of Fashion Time. Any unauthorized copying or commercial redistribution is strictly prohibited.</p>`
    },
    {
        endpoint: "policy-eleven-cms",
        title: "Size Guide & Fitting Policy",
        description: `<h2>Size Guide &amp; Fitting Assistance</h2>
<p>To help you choose the perfect fit, detailed measurement charts (chest, waist, hip, length) in inches and centimeters are provided on every product page. If size adjustment is required, our 7-day exchange is always available.</p>`
    },
    {
        endpoint: "policy-twelve-cms",
        title: "Customer Care & Support",
        description: `<h2>Customer Care &amp; Support</h2>
<p>We are here to assist you every day from 9:00 AM to 11:00 PM:</p>
<ul>
    <li><strong>Hotline:</strong> +880 1317-020309</li>
    <li><strong>WhatsApp:</strong> +880 1317-020309</li>
    <li><strong>Email:</strong> support@fashiontime.com</li>
    <li><strong>Headquarters:</strong> Dhanmondi, Dhaka - 1205, Bangladesh</li>
</ul>`
    }
];

const faqs = [
    {
        question: "How do I place an order?",
        answer: "Select your desired product, choose your size and color, click 'Add to Cart' or 'Buy Now', fill in your delivery address and phone number, choose your payment method (Cash on Delivery or bKash/Card), and click 'Confirm Order'."
    },
    {
        question: "How long will delivery take?",
        answer: "Inside Dhaka deliveries take 24 to 48 hours. Outside Dhaka deliveries take 3 to 5 business days across all 64 districts in Bangladesh."
    },
    {
        question: "What is your return and exchange policy?",
        answer: "We offer a 7-day easy return and exchange guarantee. If the product is unused and has original tags attached, contact our support helpline (+880 1317-020309) for a quick doorstep pickup or exchange."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept Cash on Delivery (COD), bKash, Nagad, Rocket, Visa, Mastercard, and American Express cards."
    },
    {
        question: "Can I cancel or modify my order?",
        answer: "Yes! You can cancel or change your order free of charge by calling or WhatsApping us at +880 1317-020309 before your order has been dispatched."
    }
];

async function main() {
    console.log("1. Logging in as Admin...");
    const token = await login();
    if (!token) {
        console.error("Failed to obtain admin token.");
        process.exit(1);
    }
    console.log("Logged in successfully! Token acquired.");

    console.log("\n2. Seeding Policy CMS Data...");
    for (const policy of policies) {
        try {
            const res = await fetch(`${API_BASE}/${policy.endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: policy.title,
                    description: policy.description
                })
            });
            const json = await res.json();
            if (res.ok) {
                console.log(`✓ Seeded ${policy.endpoint} (${policy.title})`);
            } else {
                console.error(`✗ Failed ${policy.endpoint}:`, json?.message || res.statusText);
            }
        } catch (e) {
            console.error(`✗ Error on ${policy.endpoint}:`, e.message);
        }
    }

    console.log("\n3. Seeding FAQs...");
    for (const faq of faqs) {
        try {
            const res = await fetch(`${API_BASE}/faq`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    question: faq.question,
                    answer: faq.answer
                })
            });
            const json = await res.json();
            if (res.ok) {
                console.log(`✓ Seeded FAQ: "${faq.question}"`);
            } else {
                console.error(`✗ Failed FAQ:`, json?.message || res.statusText);
            }
        } catch (e) {
            console.error(`✗ Error on FAQ:`, e.message);
        }
    }

    console.log("\nSeeding completed successfully!");
}

main().catch(console.error);
