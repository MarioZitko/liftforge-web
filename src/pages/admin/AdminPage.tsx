import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const adminSections = [
	{
		label: "Users",
		description: "Manage user accounts, roles, and permissions.",
		path: "/admin/users",
		disabled: false,
	},
	{
		label: "Exercises",
		description: "Manage all exercises in the system.",
		path: "/admin/exercises",
		disabled: false,
	},
	{
		label: "Programs",
		description: "Create and organize training programs.",
		path: "/admin/programs",
		disabled: true,
	},
];

export default function AdminPage() {
	const navigate = useNavigate();

	return (
		<div className="p-6 space-y-6 max-w-screen-xl mx-auto">
			<h1 className="text-3xl font-bold">Admin Dashboard</h1>
			<p className="text-muted-foreground text-sm">
				Select a resource to manage:
			</p>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{adminSections.map((section) => (
					<Card
						key={section.label}
						className={section.disabled ? "opacity-60" : ""}
					>
						<CardHeader>
							<CardTitle>{section.label}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<p className="text-sm text-muted-foreground">
								{section.description}
							</p>
							<Button
								disabled={section.disabled}
								onClick={() => navigate(section.path)}
							>
								Manage {section.label}
							</Button>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
