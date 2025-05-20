import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function DarkModeToggle() {
	const [isDark, setIsDark] = useState(
		() => localStorage.getItem("vite-ui-theme") === "dark"
	);

	useEffect(() => {
		document.documentElement.classList.toggle("dark", isDark);
		localStorage.setItem("vite-ui-theme", isDark ? "dark" : "light");
	}, [isDark]);

	return (
		<div className="flex items-center gap-2">
			<Sun className="h-4 w-4" />
			<Switch checked={isDark} onCheckedChange={setIsDark} />
			<Moon className="h-4 w-4" />
		</div>
	);
}
