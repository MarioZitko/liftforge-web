import { ThemeProvider } from "@/components/ui/theme-provider";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import { AppRoutes } from "./routes";
import Navbar from "@/components/shared/Navbar/Navbar";

function App() {
	return (
		<BrowserRouter>
			<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
				<Navbar />
				<AppRoutes />
			</ThemeProvider>
		</BrowserRouter>
	);
}

export default App;
