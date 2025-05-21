export interface IMobileNavMenuProps {
	links: { to: string; label: string }[];
	menuOpen: boolean;
	toggleMenu: () => void;
	extras?: React.ReactNode;
}
