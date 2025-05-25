import { User } from "@/api/users/users.types";

export interface IAdminUsersPageProps {
	open: boolean;
	onClose: () => void;
	onSuccess: () => void;
	user?: User | null;
}
