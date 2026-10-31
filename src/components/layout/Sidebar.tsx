import { useEffect, useState } from "react";
import { TbListDetails, TbLayoutGrid, TbTablePlus, TbFileText, TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import { BiCube } from "react-icons/bi";
import { RiArrowDropRightLine, RiArrowDropDownLine, RiExchangeBoxFill, RiSeoFill } from "react-icons/ri";
import { Link, useLocation, NavLink } from "react-router-dom";
import { GoDotFill, GoHome } from "react-icons/go";
import { SiPayloadcms } from "react-icons/si";
import { MdAdminPanelSettings, MdContactPage, MdStorefront, MdOutlinePalette } from "react-icons/md";
import { FiShoppingCart, FiZap, FiShield } from "react-icons/fi";
import { FaFacebookMessenger, FaTags, FaUser } from "react-icons/fa";
import { IoShareSocialOutline } from "react-icons/io5";
import { useUnreadChatCount } from "../../hooks/useUnreadChatCount";
import { useAppearance } from "../../theme";
// import { FaQuestion, FaStore, FaUser } from "react-icons/fa";

const menu = [
	{
		sectionName: "Main",
		items: [
			{
				id: 1,
				name: "Dashboard",
				icon: <TbLayoutGrid />,
				path: "/",
				subItems: [
					// { id: 1, name: "Admin Dashboard", path: "/admin-dashboard" },
					// { id: 2, name: "Sales Dashboard", path: "/sales-dashboard" },
				],
			},
		],
	},
	{
		sectionName: "Inventory",
		items: [
			{
				id: 3,
				name: "Category",
				icon: <TbListDetails />,
				path: "/main-category",
				subItems: [
					{ id: 1, name: "Main Category", path: "/main-category" },
					{ id: 2, name: "First Category", path: "/first-category" },
					{ id: 3, name: "Second Category", path: "/second-category" },
				],
			},
			{
				id: 4,
				name: "Product",
				icon: <BiCube />,
				path: "/products",
				subItems: [],
			},
			{
				id: 5,
				name: "Product Review",
				icon: <BiCube />,
				path: "/product-reviews",
				subItems: [],
			},
			{
				id: 24,
				name: "Create Product",
				icon: <TbTablePlus />,
				path: "/create-product",
				subItems: [],
			},
		],
	},
	{
		sectionName: "Order",
		items: [
			{
				id: 6,
				name: "Orders",
				icon: <FiShoppingCart />,
				path: "/orders",
				subItems: [],
			},
			{
				id: 66,
				name: "Coupons",
				icon: <FaTags />,
				path: "/coupons",
				subItems: [],
			},
			{
				id: 67,
				name: "Mega Discount",
				icon: <FiZap />,
				path: "/mega-discount",
				subItems: [],
			},
		],
	},
	{
		sectionName: "Reports",
		items: [
			{
				id: 68,
				name: "Profit Report",
				icon: <TbFileText />,
				path: "/reports/profit",
				subItems: [],
			},
		],
	},
	{
		sectionName: "People",
		items: [
			{
				id: 7,
				name: "Admins",
				icon: <MdAdminPanelSettings />,
				path: "/admins",
				subItems: [],
			},
			{
				id: 9,
				name: "Users",
				icon: <FaUser />,
				path: "/users",
				subItems: [],
			},
		],
	},
	{
		sectionName: "Chat",
		items: [
			{
				id: 10,
				name: "Chat",
				icon: <FaFacebookMessenger />,
				path: "/chat",
				subItems: [],
			},
		],
	},
	{
		sectionName: "Settings",
		items: [
			{
				id: 11,
				name: "Home",
				icon: <GoHome />,
				path: "/hero-slider",
				subItems: [
					{ id: 1, name: "Hero Slider", path: "/hero-slider" },
					{ id: 2, name: "Promotions", path: "/promotion" },
					{ id: 3, name: "Page CMS", path: "/home-page-cms" },
					{ id: 4, name: "Popup Banner", path: "/popups" },
				],
			},
			{
				id: 12,
				name: "Contact",
				icon: <MdContactPage />,
				path: "/contact-message",
				subItems: [
					{ id: 1, name: "Contact Message", path: "/contact-message" },
					{ id: 2, name: "Contact Page CMS", path: "/contact-page-cms" },
				],
			},
			{
				id: 13,
				name: "Policy",
				icon: <RiExchangeBoxFill />,
				path: "/exchange-policy",
				subItems: [
					{ id: 1, name: "Exchange & Return", path: "/exchange-policy" },
					{ id: 2, name: "Privacy Policy", path: "/privacy-policy" },
					{ id: 3, name: "Terms & Conditions", path: "/terms-conditions" },
					{ id: 4, name: "Policy 1", path: "/policy-one" },
					{ id: 5, name: "Policy 2", path: "/policy-two" },
					{ id: 6, name: "Policy 3", path: "/policy-three" },
					{ id: 7, name: "Policy 4", path: "/policy-four" },
					{ id: 8, name: "Policy 5", path: "/policy-five" },
					{ id: 9, name: "Policy 6", path: "/policy-six" },
					{ id: 10, name: "Policy 7", path: "/policy-seven" },
					{ id: 11, name: "Policy 8", path: "/policy-eight" },
					{ id: 12, name: "Policy 9", path: "/policy-nine" },
					{ id: 13, name: "Policy 10", path: "/policy-ten" },
					{ id: 14, name: "Policy 11", path: "/policy-eleven" },
					{ id: 15, name: "Policy 12", path: "/policy-twelve" },
				],
			},
			{
				id: 14,
				name: "Header Footer CMS",
				icon: <SiPayloadcms />,
				path: "/header-footer-cms",
				subItems: [],
			},
			{
				id: 15,
				name: "Shop Page CMS",
				icon: <MdStorefront />,
				path: "/shop-page-cms",
				subItems: [],
			},
			{
				id: 16,
				name: "Social Links",
				icon: <IoShareSocialOutline />,
				path: "/social-link",
				subItems: [],
			},
			{
				id: 99,
				name: "Risk & Blacklist",
				icon: <FiShield />,
				path: "/blacklist",
				subItems: [],
			},
			{
				id: 17,
				name: "FAQ",
				icon: <RiExchangeBoxFill />,
				path: "/faq",
				subItems: [],
			},
			{
				id: 18,
				name: "Audit Logs",
				icon: <TbFileText />,
				path: "/audit-logs",
				subItems: [],
			},
			{
				id: 100,
				name: "Appearance",
				icon: <MdOutlinePalette />,
				path: "/appearance",
				subItems: [],
			},
		],
	},
	{
		sectionName: "SEO",
		items: [
			{
				id: 18,
				name: "Page Meta",
				icon: <RiSeoFill />,
				path: "/page-meta",
				subItems: [],
			},
			{
				id: 19,
				name: "Product Meta",
				icon: <FaTags />,
				path: "/product-meta",
				subItems: [],
			},
		],
	},
];

const Sidebar = () => {
	const { resolved, setOverrides } = useAppearance();
	const isCollapsed = resolved.sidebarCollapse === 'collapsed';
	const [openSubMenu, setOpenSubMenu] = useState<number | null>(null);
	const location = useLocation();
	const { unreadChatCount } = useUnreadChatCount();

	useEffect(() => {
		menu.forEach((section) => {
			section.items.forEach((item) => {
				if (
					item.subItems.some((sub) => sub.path === location.pathname) ||
					item.path === location.pathname
				) {
					setOpenSubMenu(item.id);
				}
			});
		});
	}, [location.pathname]);

	const toggleSubMenu = (id: number) => {
		setOpenSubMenu(openSubMenu === id ? null : id);
	};

	const isAnySubmenuActive = menu.some(section =>
		section.items.some(menuItem =>
			menuItem.subItems.some(subItem => subItem.path === location.pathname)
		)
	);

	return (
		<aside
			className={`hidden lg:block min-h-screen border-r transition-all ease-in-out duration-300 z-30 select-none shadow-xs border-[var(--ui-sidebar-border,var(--ui-border))] bg-[var(--ui-sidebar-bg,var(--ui-surface))] text-[var(--ui-sidebar-text,var(--ui-text))] ${
				isCollapsed ? "w-[68px]" : "w-63"
			}`}
		>
			<div
				className={`fixed top-0 left-0 h-16 z-20 flex items-center justify-between border-b px-3 py-1 transition-all ease-in-out duration-300 border-[var(--ui-sidebar-border,var(--ui-border))] bg-[var(--ui-sidebar-bg,var(--ui-surface))] ${
					isCollapsed ? "w-[68px]" : "w-63"
				}`}
			>
				<Link to={"/"} className="flex items-center justify-center flex-1 overflow-hidden">
					{isCollapsed ? (
						<span className="font-black text-xl text-[var(--primary-color)]">FT</span>
					) : (
						<img
							src="/images/Admin-logo.png"
							alt="Admin logo"
							className="w-full h-12 object-contain"
						/>
					)}
				</Link>

				<button
					type="button"
					onClick={() =>
						setOverrides({
							sidebarCollapse: isCollapsed ? 'expanded' : 'collapsed',
						})
					}
					className="p-1.5 rounded-lg text-[var(--ui-sidebar-text-muted,var(--ui-text-muted))] hover:text-[var(--primary-color)] hover:bg-[var(--ui-sidebar-active-bg,var(--ui-surface-muted))] transition-colors cursor-pointer"
					title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
				>
					<TbLayoutSidebarLeftCollapse
						size={16}
						className={`transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
					/>
				</button>
			</div>

			<div
				className={`p-2 pb-20 fixed top-16 left-0 h-[calc(100vh-64px)] overflow-y-scroll custom-scrollbar transition-all ease-in-out duration-300 ${
					isCollapsed ? "w-[68px]" : "w-63"
				} pr-1`}
			>
				{menu.map((section) => (
					<div key={section.sectionName} className="mb-2">
						{isCollapsed ? (
							<div className="h-px w-8 mx-auto my-2.5 bg-[var(--ui-sidebar-border,var(--ui-border))]/60" />
						) : (
							<p className="text-[11px] uppercase tracking-wider text-[var(--ui-sidebar-text-muted,var(--ui-text-muted))] font-bold mb-1.5 px-2">
								{section.sectionName}
							</p>
						)}

						{section.items.map((item) => {
							const isParentActive = item.subItems.some(
								(subItem) => subItem.path === location.pathname
							);
							const isItemActive = item.path === location.pathname;
							const isOpen = openSubMenu === item.id;

							const shouldShowActive = item.subItems.length > 0
								? (isOpen || isParentActive)
								: (isItemActive && !isAnySubmenuActive);

							return (
								<div key={item.id} className="relative group">
									<NavLink
										to={item.subItems.length > 0 && !isCollapsed ? "#" : item.path}
										title={isCollapsed ? item.name : undefined}
										className={`flex items-center cursor-pointer rounded-lg transition-colors mb-1 ${
											isCollapsed
												? "justify-center w-11 h-11 mx-auto p-0"
												: "justify-between px-3 py-2 w-full"
										} ${
											shouldShowActive
												? "bg-[var(--ui-sidebar-active-bg,var(--primary-color-light))] text-[var(--ui-sidebar-active-text,var(--primary-color))] font-semibold shadow-2xs"
												: "text-[var(--ui-sidebar-text-muted,var(--ui-text-muted))] hover:bg-[var(--ui-sidebar-active-bg,var(--ui-surface-muted))] hover:text-[var(--ui-sidebar-text,var(--ui-text))]"
										}`}
										onClick={() => {
											if (!isCollapsed) toggleSubMenu(item.id);
										}}
									>
										<div className="flex items-center gap-2.5 min-w-0">
											<span className="text-[18px] shrink-0">
												{item.icon}
											</span>
											{!isCollapsed && (
												<span className="text-[13px] font-medium truncate">
													{item.name}
												</span>
											)}
										</div>

										{!isCollapsed && item.name === "Chat" && unreadChatCount > 0 && (
											<span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-xs animate-pulse">
												{unreadChatCount > 9 ? "9+" : unreadChatCount}
											</span>
										)}

										{!isCollapsed && item.subItems.length > 0 && (
											<span className="text-lg opacity-70">
												{isOpen ? (
													<RiArrowDropDownLine className="text-[var(--primary-color)]" />
												) : (
													<RiArrowDropRightLine />
												)}
											</span>
										)}
									</NavLink>

									{/* Submenu for Expanded View */}
									{!isCollapsed && item.subItems.length > 0 && isOpen && (
										<ul className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-[var(--ui-border)]/60 ml-4 mb-1">
											{item.subItems.map((subItem) => (
												<li key={subItem.id}>
													<NavLink
														to={subItem.path}
														className={({ isActive }) =>
															`block rounded-md px-2.5 py-1.5 text-[12px] transition-colors ${
																isActive
																	? "text-[var(--primary-color)] font-semibold bg-[var(--primary-color-light)]"
																	: "text-[var(--ui-sidebar-text-muted,var(--ui-text-muted))] hover:text-[var(--ui-sidebar-text,var(--ui-text))] hover:bg-[var(--ui-surface-muted)]"
															}`
														}
													>
														<span className="flex items-center gap-2">
															<GoDotFill className="text-[8px] opacity-70" />
															<span className="truncate">{subItem.name}</span>
														</span>
													</NavLink>
												</li>
											))}
										</ul>
									)}
								</div>
							);
						})}
					</div>
				))}
			</div>
		</aside>
	);
};

export default Sidebar;
