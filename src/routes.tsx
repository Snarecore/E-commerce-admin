import { Routes, Route, Outlet } from "react-router-dom";
//@ts-ignore
import SalesDashboard from "./pages/dashboard/sales-dashboard";
import Products from "./pages/inventory/products";
import CreateProduct from "./pages/createProduct";
import Dashboard from "./pages/dashboard/admin-dashboard";
import HeroSlider from "./pages/settings/home/hero-slider";
import Promotions from "./pages/settings/home/promotions";
import MainCategory from "./pages/inventory/category/main-category";
import FirstCategory from "./pages/inventory/category/first-category";
import SecondCategory from "./pages/inventory/category/second-category";
import ThirdCategory from "./pages/inventory/category/third-category";
import HeaderFooterCMS from "./pages/settings/header-footer-cms";
import Review from "./pages/inventory/reviews";
import Signup from "./pages/authentications/signup";
import Login from "./pages/authentications/login";
import ForgotPassword from "./pages/authentications/forgot-password";
import ProductDetails from "./pages/inventory/products/components/ProductDetails";
import MainLayout from "./layout/MainLayout";
import ContactMessage from "./pages/settings/contact-us/contact-message";
import ContactPageCMS from "./pages/settings/contact-us/contact-page-cms";
// import ExchangeReturn from "./pages/settings/policy/exchange-return";
// import PrivacyPolicy from "./pages/settings/policy/privacy";
// import TermsConditions from "./pages/settings/policy/terms-conditions";
import HomePageCMS from "./pages/settings/home/page-cms";
import Orders from "./pages/orders";
import OrderDetail from "./pages/orders/components/OrderDetail";
// import Faq from "./pages/settings/faq";
import Admins from "./pages/people/admin";
import Vendors from "./pages/people/vendor";
import Users from "./pages/people/user";
import InvoiceView from "./pages/invoice";
import RoleProtectedRoute from "./providers/RoleProtectedRoute";
import { Role } from "./enum/role.enum";
import SocialLinks from "./pages/settings/social-links";
import ShopPageCMS from "./pages/settings/shop-page-cms";
import Blogs from "./pages/blogs";
import BlogCreation from "./pages/blog-create";
import Chat from "./pages/chat";
import Subscription from "./pages/subscriptions/subscription";
import CommissionRate from "./pages/commission-rate";
import VendorSubscription from "./pages/subscriptions/vendor-subscription";
import VendorInvoiceView from "./pages/subscriptions/vendor-subscription/component/VendorSubscriptionInvoice";
import VendorPayouts from "./pages/vendor-payouts";
import ProductMeta from "./pages/seo/product-meta";
import PageMeta from "./pages/seo/page-meta";
import PolicyOne from "./pages/settings/policy/policy-one";
import PolicyTwo from "./pages/settings/policy/policy-two";
import PolicyThree from "./pages/settings/policy/policy-three";
import PolicySix from "./pages/settings/policy/policy-six";
import PolicyFour from "./pages/settings/policy/policy-four";
import PolicyFive from "./pages/settings/policy/policy-five";
import PolicyEleven from "./pages/settings/policy/policy-eleven";
import PolicyNine from "./pages/settings/policy/policy-nine";
import PolicyEight from "./pages/settings/policy/policy-eight";
import PolicySeven from "./pages/settings/policy/policy-seven";
import PolicyTen from "./pages/settings/policy/policy-ten";
import PolicyTwelve from "./pages/settings/policy/policy-twelve";
import ProductReview from "./pages/inventory/product-reviews";

const AppRoutes = () => {
	return (
		<Routes>
			<Route path="/signup" element={<Signup />} />
			<Route path="/login" element={<Login />} />
			<Route path="/forgot-password" element={<ForgotPassword />} />

			<Route element={<MainLayout><Outlet /></MainLayout>}>
				<Route
					path="/"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<Dashboard />
						</RoleProtectedRoute>
					}
				/>
				<Route path="/sales-dashboard"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<SalesDashboard />
						</RoleProtectedRoute>
					} />
				<Route path="/products"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<Products />
						</RoleProtectedRoute>
					} />
				<Route path="/product-reviews"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<ProductReview />
						</RoleProtectedRoute>
					} />
				<Route path="/product-details/:id"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<ProductDetails />
						</RoleProtectedRoute>
					} />

				<Route path="/create-product"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<CreateProduct />
						</RoleProtectedRoute>
					} />
				<Route path="/edit-product"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<CreateProduct />
						</RoleProtectedRoute>
					} />
				<Route
					path="/main-category"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<MainCategory />
						</RoleProtectedRoute>
					}
				/>
				<Route
					path="/first-category"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<FirstCategory />
						</RoleProtectedRoute>
					}
				/>
				<Route
					path="/second-category"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<SecondCategory />
						</RoleProtectedRoute>
					}
				/>
				<Route
					path="/third-category"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<ThirdCategory />
						</RoleProtectedRoute>
					}
				/>
				<Route
					path="/hero-slider"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<HeroSlider />
						</RoleProtectedRoute>
					}
				/>
				<Route
					path="/promotion"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<Promotions />
						</RoleProtectedRoute>
					}
				/>
				<Route
					path="/home-page-cms"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<HomePageCMS />
						</RoleProtectedRoute>
					}
				/>
				<Route path="/header-footer-cms"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<HeaderFooterCMS />
						</RoleProtectedRoute>} />
				<Route path="/review"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<Review />
						</RoleProtectedRoute>} />
				<Route path="/contact-message"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<ContactMessage />
						</RoleProtectedRoute>} />
				<Route path="/contact-page-cms"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<ContactPageCMS />
						</RoleProtectedRoute>} />
				{/* <Route path="/exchange-policy"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<ExchangeReturn />
						</RoleProtectedRoute>} /> */}
				{/* <Route path="/privacy-policy"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<PrivacyPolicy />
						</RoleProtectedRoute>} /> */}
				{/* <Route path="/terms-conditions"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<TermsConditions />
						</RoleProtectedRoute>} /> */}
				<Route path="/orders"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<Orders />
						</RoleProtectedRoute>} />
				<Route path="/order-detail/:id"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<OrderDetail />
						</RoleProtectedRoute>} />
				<Route path="/blogs"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<Blogs />
						</RoleProtectedRoute>} />
				<Route path="/create-blog"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<BlogCreation />
						</RoleProtectedRoute>} />
				<Route path="/edit-blog"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<BlogCreation />
						</RoleProtectedRoute>} />
				{/* <Route path="/faqs"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<Faq />
						</RoleProtectedRoute>} /> */}
				<Route path="/admins"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<Admins />
						</RoleProtectedRoute>} />
				<Route path="/vendors"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<Vendors />
						</RoleProtectedRoute>} />
				<Route path="/users"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<Users />
						</RoleProtectedRoute>} />
				<Route path="/invoice/:id"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<InvoiceView />
						</RoleProtectedRoute>} />
				<Route path="shop-page-cms"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<ShopPageCMS />
						</RoleProtectedRoute>} />
				<Route path="social-link"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<SocialLinks />
						</RoleProtectedRoute>} />
				<Route path="/chat"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<Chat />
						</RoleProtectedRoute>} />
				<Route path="/page-meta"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<PageMeta />
						</RoleProtectedRoute>} />
				<Route path="/product-meta"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<ProductMeta />
						</RoleProtectedRoute>} />

				<Route path="/subscription"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<Subscription />
						</RoleProtectedRoute>} />
				<Route path="/vendor-subscription"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<VendorSubscription />
						</RoleProtectedRoute>} />
				<Route path="/vendor-invoice/:id"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<VendorInvoiceView />
						</RoleProtectedRoute>} />
				<Route path="/commission-rate"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<CommissionRate />
						</RoleProtectedRoute>} />
				<Route path="/vendor-payouts"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<VendorPayouts />
						</RoleProtectedRoute>} />
				<Route path="/policy-one"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<PolicyOne />
						</RoleProtectedRoute>} />
				<Route path="/policy-two"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<PolicyTwo />
						</RoleProtectedRoute>} />
				<Route path="/policy-three"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<PolicyThree />
						</RoleProtectedRoute>} />
				<Route path="/policy-four"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<PolicyFour />
						</RoleProtectedRoute>} />
				<Route path="/policy-five"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<PolicyFive />
						</RoleProtectedRoute>} />
				<Route path="/policy-six"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<PolicySix />
						</RoleProtectedRoute>} />
				<Route path="/policy-seven"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<PolicySeven />
						</RoleProtectedRoute>} />
				<Route path="/policy-eight"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<PolicyEight />
						</RoleProtectedRoute>} />
				<Route path="/policy-nine"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<PolicyNine />
						</RoleProtectedRoute>} />
				<Route path="/policy-ten"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<PolicyTen />
						</RoleProtectedRoute>} />
				<Route path="/policy-eleven"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<PolicyEleven />
						</RoleProtectedRoute>} />
				<Route path="/policy-twelve"
					element={
						<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
							<PolicyTwelve />
						</RoleProtectedRoute>} />
			</Route>
		</Routes>
	);
};

export default AppRoutes;