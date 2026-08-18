// @ts-ignore
import menu from "../../assets/data/menu";
import ParentMenuItem from "./ParentMenuItem";

const Nav = () => {
	return (
		<div className="w-1/5 h-screen bg-gray-100 p-4 shadow-md">
			<ul className="w-full">
			{/* @ts-ignore */}
				{menu?.map((menuItems) => (
					<li key={menuItems.sectionName}>
						<ParentMenuItem menuItems={menuItems} />
					</li>
				)) || []}
			</ul>
		</div>
	);
};

export default Nav;
