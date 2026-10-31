import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";

interface MainLayoutProps {
	children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
	return (
		<div className="flex">
			<Sidebar />
			<div className="flex flex-col flex-1 transition-all duration-300 ease-in-out">
				<Header />
				<main className="p-6 flex-1 mt-17 bg-[var(--ui-surface-sunken,#f6f6f6)] min-h-screen overflow-y-auto">
					{children}
				</main>
			</div>
		</div>
	);
};

export default MainLayout;
