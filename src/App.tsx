import AppRoutes from "./routes";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/common/ErrorBoundary";

const App = () => {
	return (
		<ErrorBoundary>
			<Toaster position="top-right" reverseOrder={false} />
			<AppRoutes />
		</ErrorBoundary>
	);
};

export default App;

