import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { useAppearance } from "../theme";

interface MainLayoutProps {
	children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
	const { resolved } = useAppearance();
	const isStaticHeader = resolved.headerStyle === 'static';

	return (
		<div className="flex bg-[var(--ui-surface-sunken,#f6f6f6)] min-h-screen text-[var(--ui-text)]">
			<Sidebar />
			<div className="flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out">
				<Header />
				<main
					className={`p-4 sm:p-6 flex-1 bg-[var(--ui-surface-sunken,#f6f6f6)] min-h-screen overflow-y-auto transition-all duration-300 ${
						isStaticHeader ? "mt-0" : "mt-16"
					}`}
				>
					{children}
				</main>
			</div>
		</div>
	);
};

export default MainLayout;
