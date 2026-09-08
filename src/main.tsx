// import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import './App.css';
import AppInitializer from "./providers/AppInitializer";
import { SocketProvider } from "./providers/SocketProvider";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			staleTime: 1000 * 60 * 5,
		},
	},
});

ReactDOM.createRoot(document.getElementById("root")!).render(
	// <React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<AppInitializer />
				<SocketProvider>
					<App />
				</SocketProvider>
			</BrowserRouter>
			<ReactQueryDevtools
				initialIsOpen={false}
				position={'bottom'}
				buttonPosition={'bottom-left'}
			/>
		</QueryClientProvider>
	// </React.StrictMode>
);
