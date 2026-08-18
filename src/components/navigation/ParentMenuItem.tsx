import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import SubMenuItem from "./SubMenuItem";

interface MenuItem {
	id: number;
	name: string;
	path: string;
	icon?: string;
	items?: MenuItem[];
}

interface ParentMenuItemProps {
	menuItems: {
		sectionName: string;
		items: MenuItem[];
	};
}

const ParentMenuItem = ({ menuItems }: ParentMenuItemProps) => {
	return (
		<div className="mb-4">
			<p className="text-sm font-semibold mb-3">{menuItems.sectionName}</p>
			<ul>
				{menuItems.items.map((parentMenu) => (
					<MenuItemComponent key={parentMenu.id} parentMenu={parentMenu} />
				))}
			</ul>
		</div>
	);
};

const MenuItemComponent = ({ parentMenu }: { parentMenu: MenuItem }) => {
	const [isOpen, setIsOpen] = useState(false);
	const location = useLocation();
	const isActive = location.pathname === parentMenu.path;

	return (
		<li className="mb-2">
			{/* If it has sub-items, render a button and nested ul */}
			{parentMenu.items && parentMenu.items.length > 0 ? (
				<>
					<button
						onClick={() => setIsOpen(!isOpen)}
						className={`flex justify-between items-center py-2 px-3 text-sm rounded w-full ${isActive ? "text-orange-500 font-semibold" : "text-gray-600"
							} hover:text-orange-500 transition-all`}
					>
						<span className="flex items-center gap-2">
							<span
								dangerouslySetInnerHTML={{ __html: parentMenu.icon || "" }}
							/>
							{parentMenu.name}
						</span>
						<span>{isOpen ? "▼" : "▶"}</span>
					</button>

					{/* Submenu must be inside a separate <ul> */}
					{isOpen && (
						<ul className="ml-4 border-l pl-2">
							<SubMenuItem menuItem={parentMenu} />
						</ul>
					)}
				</>
			) : (
				<Link
					to={parentMenu.path}
					className={`flex items-center gap-2 text-sm py-2 px-3 rounded ${isActive ? "text-orange-500 font-semibold" : "text-gray-600"
						} hover:text-orange-500 transition-all`}
				>
					<span dangerouslySetInnerHTML={{ __html: parentMenu.icon || "" }} />
					{parentMenu.name}
				</Link>
			)}
		</li>
	);
};

export default ParentMenuItem;
