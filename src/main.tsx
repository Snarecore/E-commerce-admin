// import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./config/query-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import './App.css';
import AppInitializer from "./providers/AppInitializer";
import { SocketProvider } from "./providers/SocketProvider";
import { AppearanceProvider } from "./theme";

ReactDOM.createRoot(document.getElementById("root")!).render(
	// <React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<AppearanceProvider>
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
			</AppearanceProvider>
		</QueryClientProvider>
	// </React.StrictMode>
);
