import { Link, useLocation } from "react-router-dom";

interface SubMenuItemProps {
	menuItem: {
		items?: {
			id: number;
			name: string;
			path: string;
		}[];
	};
}

const SubMenuItem = ({ menuItem }: SubMenuItemProps) => {
	const location = useLocation();

	return (
		<>
			{menuItem.items?.map((dropdown) => (
				<li key={dropdown.id}>
					<Link
						to={dropdown.path}
						className={`flex items-center gap-2 text-sm py-2 px-3 rounded ${location.pathname === dropdown.path
								? "text-orange-500 font-semibold"
								: "text-gray-600"
							} hover:text-orange-500 transition-all`}
					>
						{dropdown.name}
					</Link>
				</li>
			))}
		</>
	);
};

export default SubMenuItem;
