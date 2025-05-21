import { ThemeProvider } from "@/components/ui/theme-provider";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import { AppRoutes } from "./routes";
import Navbar from "@/components/shared/Navbar/Navbar";
import { Toaster } from "sonner";
import { AuthProvider } from "./hooks/authProvider";

function App() {
	return (
		<BrowserRouter>
			<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
				<AuthProvider>
					<Navbar />
					<AppRoutes />
					<Toaster
						richColors
						position="bottom-right"
						closeButton
						theme="system"
					/>
				</AuthProvider>
			</ThemeProvider>
		</BrowserRouter>
	);
}

export default App;
