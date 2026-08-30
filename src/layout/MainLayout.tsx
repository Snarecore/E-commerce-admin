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
				<main className="p-6 flex-1 mt-17 bg-[#F6F6F6] h-screen">
					{children}
				</main>
			</div>
		</div>
	);
};

export default MainLayout;
