export const coachLinks = [
	{ to: "/dashboard", label: "Dashboard" },
	{ to: "/clients", label: "Clients" },
	{ to: "/programs", label: "Programs" },
	{ to: "/coach/exercises", label: "Exercises" },
];

export const clientLinks = [
	{ to: "/dashboard", label: "My Dashboard" },
	{ to: "/my-programs", label: "My Programs" },
	{ to: "/client/exercises", label: "Exercise Library" },
];

export const adminLinks = [
	...coachLinks,
	...clientLinks.filter((link) => link.to !== "/dashboard"), // avoid duplicate dashboard
	{ to: "/admin", label: "Administration" },
];
