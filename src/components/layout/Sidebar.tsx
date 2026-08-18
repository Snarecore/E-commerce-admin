import { useEffect, useState } from "react";
import { TbListDetails, TbLayoutGrid } from "react-icons/tb";
import { BiCube } from "react-icons/bi";
import { RiArrowDropRightLine, RiArrowDropDownLine, RiExchangeBoxFill, RiSeoFill } from "react-icons/ri";
import { Link, useLocation, NavLink } from "react-router-dom";
import { GoDotFill, GoHome } from "react-icons/go";
import { SiPayloadcms } from "react-icons/si";
import { MdAdminPanelSettings, MdContactPage, MdStorefront, MdSubscriptions } from "react-icons/md";
import { FiShoppingCart } from "react-icons/fi";
import { FaBlog, FaFacebookMessenger, FaHandHoldingUsd, FaMoneyBillWave, FaStore, FaTags, FaUser } from "react-icons/fa";
import { IoShareSocialOutline } from "react-icons/io5";
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
					{ id: 4, name: "Third Category", path: "/third-category" },
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
			// {
			// 	id: 4,
			// 	name: "Create Product",
			// 	icon: <TbTablePlus />,
			// 	path: "/create-product",
			// 	subItems: [],
			// },
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
				id: 8,
				name: "Vendors",
				icon: <FaStore />,
				path: "/vendors",
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
					// { id: 1, name: "Exchange & Return", path: "/exchange-policy" },
					// { id: 2, name: "Privacy", path: "/privacy-policy" },
					// { id: 3, name: "Terms & Conditions", path: "/terms-conditions" },
					{ id: 1, name: "Policy 1", path: "/policy-one" },
					{ id: 2, name: "Policy 2", path: "/policy-two" },
					{ id: 3, name: "Policy 3", path: "/policy-three" },
					{ id: 4, name: "Policy 4", path: "/policy-four" },
					{ id: 5, name: "Policy 5", path: "/policy-five" },
					{ id: 6, name: "Policy 6", path: "/policy-six" },
					{ id: 7, name: "Policy 7", path: "/policy-seven" },
					{ id: 8, name: "Policy 8", path: "/policy-eight" },
					{ id: 9, name: "Policy 9", path: "/policy-nine" },
					{ id: 10, name: "Policy 10", path: "/policy-ten" },
					{ id: 11, name: "Policy 11", path: "/policy-eleven" },
					{ id: 12, name: "Policy 12", path: "/policy-twelve" },
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
				id: 17,
				name: "Blogs",
				icon: <FaBlog />,
				path: "/blogs",
				subItems: [],
			},
			// {
			// 	id: 13,
			// 	name: "Reviews",
			// 	icon: <MdRateReview />,
			// 	path: "/review",
			// 	subItems: [],
			// },
			// {
			// 	id: 14,
			// 	name: "FAQ",
			// 	icon: <FaQuestion />,
			// 	path: "/faqs",
			// 	subItems: [],
			// },
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
	{
		sectionName: "Subscription",
		items: [
			{
				id: 20,
				name: "Subscription",
				icon: <MdSubscriptions />,
				path: "/subscription",
				subItems: [],
			},
			{
				id: 21,
				name: "Vendor Subscription",
				icon: <MdSubscriptions />,
				path: "/vendor-subscription",
				subItems: [],
			},
		],
	},
	{
		sectionName: "Commissions",
		items: [
			{
				id: 22,
				name: "Commission Rate",
				icon: <FaMoneyBillWave />,
				path: "/commission-rate",
				subItems: [],
			},
			{
				id: 23,
				name: "Vendor Payouts",
				icon: <FaHandHoldingUsd />,
				path: "/vendor-payouts",
				subItems: [],
			},
		],
	},
];

const Sidebar = () => {
	const [openSubMenu, setOpenSubMenu] = useState<number | null>(null);
	const location = useLocation();

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
		<div className="hidden lg:block w-63 min-h-screen bg-white shadow-md p-2 transition-all ease-in duration-300 border-r border-gray-200">
			<Link to={"/"}>
				<img
					src="/images/BazaarBound_Landscap_Logo.svg"
					alt="company logo"
					className="w-58 fixed"
				/>
			</Link>

			<div className="p-2 mt-14 max-h-[90vh] fixed w-61 overflow-hidden border-t border-gray-200 hover:overflow-y-auto custom-scrollbar">
				{menu.map((section) => (
					<div key={section.sectionName} className="p-2 mb-2">
						<p className="text-[12px] text-[#092c4c] font-bold mb-2">
							{section.sectionName}
						</p>

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
								<div key={item.id}>
									<NavLink
										to={item.subItems.length > 0 ? "#" : item.path}
										className={`w-[200px] group px-[12px] py-[8px] flex items-center justify-between cursor-pointer rounded-md transition-all mb-[2px] 
											${shouldShowActive
												? "bg-[#FFF7F0] text-[var(--color-primary)]"
												: "hover:bg-gray-100"
											}`}
										onClick={() => toggleSubMenu(item.id)}
									>
										<div className="flex items-center gap-2">
											<span
												className={`text-[18px] transition-all ${shouldShowActive
													? "text-[var(--color-primary)]"
													: "text-[#5b6670] group-hover:text-[var(--color-primary)]"
													}`}
											>
												{item.icon}
											</span>
											<span
												className={`text-[14px] font-medium transition-all ${shouldShowActive
													? "text-[var(--color-primary)]"
													: "text-[#5b6670] group-hover:text-[var(--color-primary)]"
													}`}
											>
												{item.name}
											</span>
										</div>

										{item.subItems.length > 0 && (
											<span className="text-xl bg-gray-100 rounded-full">
												{isOpen ? (
													<RiArrowDropDownLine className="text-[var(--color-primary)]" />
												) : (
													<RiArrowDropRightLine className="text-gray-600" />
												)}
											</span>
										)}
									</NavLink>

									{item.subItems.length > 0 && isOpen && (
										<ul>
											{item.subItems.map((subItem) => (
												<NavLink
													key={subItem.id}
													to={subItem.path}
													className={({ isActive }) =>
														`block w-[200px] rounded-md group pl-4 py-2.5 p-2 cursor-pointer text-[13px] transition-all 
														hover:bg-gray-100 hover:text-[var(--color-primary)] 
														${isActive ? "text-[var(--color-primary)] font-medium" : "text-[#646b72]"}`
													}
												>
													<span className="flex justify-start items-center gap-2">
														<GoDotFill className="text-[10px]" />
														{subItem.name}
													</span>
												</NavLink>
											))}
										</ul>
									)}
								</div>
							);
						})}
					</div>
				))}
			</div>
		</div>
	);
};

export default Sidebar;
