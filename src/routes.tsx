import { lazy, Suspense } from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { Role } from "./enum/role.enum";
import RoleProtectedRoute from "./providers/RoleProtectedRoute";
import MainLayout from "./layout/MainLayout";

// Auth pages — small, load eagerly
import Signup from "./pages/authentications/signup";
import Login from "./pages/authentications/login";
import ForgotPassword from "./pages/authentications/forgot-password";

// All other pages — lazy loaded for code splitting
//@ts-ignore
const SalesDashboard    = lazy(() => import("./pages/dashboard/sales-dashboard"));
const Products          = lazy(() => import("./pages/inventory/products"));
const CreateProduct     = lazy(() => import("./pages/createProduct"));
const Dashboard         = lazy(() => import("./pages/dashboard/admin-dashboard"));
const HeroSlider        = lazy(() => import("./pages/settings/home/hero-slider"));
const Promotions        = lazy(() => import("./pages/settings/home/promotions"));
const PopupPage         = lazy(() => import("./pages/settings/home/popup"));
const MainCategory      = lazy(() => import("./pages/inventory/category/main-category"));
const FirstCategory     = lazy(() => import("./pages/inventory/category/first-category"));
const SecondCategory    = lazy(() => import("./pages/inventory/category/second-category"));
const HeaderFooterCMS   = lazy(() => import("./pages/settings/header-footer-cms"));
const Review            = lazy(() => import("./pages/inventory/reviews"));
const ProductDetails    = lazy(() => import("./pages/inventory/products/components/ProductDetails"));
const ContactMessage    = lazy(() => import("./pages/settings/contact-us/contact-message"));
const ContactPageCMS    = lazy(() => import("./pages/settings/contact-us/contact-page-cms"));
const HomePageCMS       = lazy(() => import("./pages/settings/home/page-cms"));
const Orders            = lazy(() => import("./pages/orders"));
const OrderDetail       = lazy(() => import("./pages/orders/components/OrderDetail"));
const Admins            = lazy(() => import("./pages/people/admin"));
const Users             = lazy(() => import("./pages/people/user"));
const InvoiceView       = lazy(() => import("./pages/invoice"));
const SocialLinks       = lazy(() => import("./pages/settings/social-links"));
const ShopPageCMS       = lazy(() => import("./pages/settings/shop-page-cms"));
const Chat              = lazy(() => import("./pages/chat"));
const ProductMeta       = lazy(() => import("./pages/seo/product-meta"));
const PageMeta          = lazy(() => import("./pages/seo/page-meta"));
const PolicyOne         = lazy(() => import("./pages/settings/policy/policy-one"));
const PolicyTwo         = lazy(() => import("./pages/settings/policy/policy-two"));
const PolicyThree       = lazy(() => import("./pages/settings/policy/policy-three"));
const PolicyFour        = lazy(() => import("./pages/settings/policy/policy-four"));
const PolicyFive        = lazy(() => import("./pages/settings/policy/policy-five"));
const PolicySix         = lazy(() => import("./pages/settings/policy/policy-six"));
const PolicySeven       = lazy(() => import("./pages/settings/policy/policy-seven"));
const PolicyEight       = lazy(() => import("./pages/settings/policy/policy-eight"));
const PolicyNine        = lazy(() => import("./pages/settings/policy/policy-nine"));
const PolicyTen         = lazy(() => import("./pages/settings/policy/policy-ten"));
const PolicyEleven      = lazy(() => import("./pages/settings/policy/policy-eleven"));
const PolicyTwelve      = lazy(() => import("./pages/settings/policy/policy-twelve"));
const ProductReview     = lazy(() => import("./pages/inventory/product-reviews"));
const CouponsPage       = lazy(() => import("./pages/coupons"));
const MegaDiscountPage  = lazy(() => import("./pages/settings/mega-discount"));
const AuditLogs         = lazy(() => import("./pages/audit-logs"));

const PageLoader = () => (
	<div className="flex items-center justify-center min-h-screen">
		<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
	</div>
);

const AppRoutes = () => {
	return (
		<Suspense fallback={<PageLoader />}>
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
						path="/popups"
						element={
							<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
								<PopupPage />
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
					<Route path="/orders"
						element={
							<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
								<Orders />
							</RoleProtectedRoute>} />
					<Route path="/coupons"
						element={
							<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
								<CouponsPage />
							</RoleProtectedRoute>} />
					<Route path="/mega-discount"
						element={
							<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
								<MegaDiscountPage />
							</RoleProtectedRoute>} />
					<Route path="/order-detail/:id"
						element={
							<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
								<OrderDetail />
							</RoleProtectedRoute>} />
					<Route path="/admins"
						element={
							<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
								<Admins />
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
					<Route path="/audit-logs"
						element={
							<RoleProtectedRoute allowedRoles={[Role.ADMIN]}>
								<AuditLogs />
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
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</Suspense>
	);
};

export default AppRoutes;