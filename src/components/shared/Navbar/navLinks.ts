export const coachLinks = [
	{ to: "/dashboard", label: "Dashboard" },
	{ to: "/clients", label: "Clients" },
	{ to: "/programs", label: "Programs" },
];

export const clientLinks = [
	{ to: "/dashboard", label: "My Dashboard" },
	{ to: "/my-programs", label: "My Programs" },
];

export const adminLinks = [
	...coachLinks,
	...clientLinks.filter((link) => link.to !== "/dashboard"), // avoid duplicate dashboard
	{ to: "/admin", label: "Administration" },
];
