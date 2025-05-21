import { NavLink } from "react-router-dom";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CoachDashboardPage() {
	return (
		<div className="space-y-6 px-4 py-6 max-w-screen-xl mx-auto">
			<h1 className="text-2xl font-bold">Coach Dashboard</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<ClientOverviewCard />
				<ProgramStatsCard />
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<RecentActivityCard />
				<AlertsCard />
			</div>
		</div>
	);
}

function ClientOverviewCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Clients</CardTitle>
				<CardDescription>Overview of your current clients</CardDescription>
			</CardHeader>
			<CardContent className="space-y-2">
				<div className="text-3xl font-bold">12 Active Clients</div>
				<div className="text-muted-foreground">2 new this week</div>
				<Button variant="outline" asChild>
					<NavLink to="/clients">View Clients</NavLink>
				</Button>
			</CardContent>
		</Card>
	);
}

function ProgramStatsCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Programs</CardTitle>
				<CardDescription>Overview of your active programs</CardDescription>
			</CardHeader>
			<CardContent className="space-y-2">
				<div className="text-3xl font-bold">8 Programs</div>
				<div className="text-muted-foreground">5 active, 3 archived</div>
				<Button variant="outline" asChild>
					<NavLink to="/programs">Manage Programs</NavLink>
				</Button>
			</CardContent>
		</Card>
	);
}

function RecentActivityCard() {
	return (
		<Card className="md:col-span-2">
			<CardHeader>
				<CardTitle>Recent Activity</CardTitle>
				<CardDescription>Latest updates from your clients</CardDescription>
			</CardHeader>
			<CardContent className="space-y-2 text-sm text-muted-foreground">
				<ul className="space-y-1">
					<li>🟢 John logged "Upper Body A" yesterday</li>
					<li>⚠️ Tom hasn’t logged in for 5 days</li>
					<li>🏁 Maria completed her program "Power Split"</li>
				</ul>
			</CardContent>
		</Card>
	);
}

function AlertsCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Alerts</CardTitle>
				<CardDescription>Things needing your attention</CardDescription>
			</CardHeader>
			<CardContent className="space-y-2 text-sm text-muted-foreground">
				<ul className="space-y-1">
					<li>❗ 2 clients are unassigned</li>
					<li>⚠️ Program "Push Pull Legs" expires in 2 days</li>
					<li>📧 Email verification pending: emma@fitmail.com</li>
				</ul>
			</CardContent>
		</Card>
	);
}
