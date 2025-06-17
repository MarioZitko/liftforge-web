import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServerTable } from "@/components/shared/DataTable/ServerTable";
import { useEffect, useState } from "react";
import {
	Column,
	ServerQuery,
	TableFilter,
	PaginatedRequest,
} from "@/components/shared/DataTable/types";
import { User } from "@/api/users/users.types";
import UsersApiClient from "@/api/users/users.api";
import { showError, showSuccess } from "@/components/shared/utils/toast.util";
import UserFormModal from "./UserFormModal";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogCancel,
	AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function AdminUsersPage() {
	const usersApi = UsersApiClient.getInstance();

	const [query, setQuery] = useState<ServerQuery>({
		pageNumber: 1,
		pageSize: 10,
		searchText: "",
		orderByProperty: "email",
		ascending: true,
	});

	const [users, setUsers] = useState<User[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [loading, setLoading] = useState(false);
	const [editUser, setEditUser] = useState<User | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [userToDelete, setUserToDelete] = useState<User | null>(null);

	// Filter states
	const [roleFilter, setRoleFilter] = useState("All");
	const [verifiedFilter, setVerifiedFilter] = useState("All");

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const request: PaginatedRequest = {
				...query,
				filters: {
					role: roleFilter === "All" ? "" : roleFilter,
					verified: verifiedFilter === "All" ? "" : verifiedFilter,
				},
			};

			// This assumes your API now supports server-side pagination
			const response = await usersApi.getPaginated(request);
			setUsers(response.data);
			setTotalCount(response.totalCount);
		} catch (error) {
			showError(`Failed to fetch users: ${error}`);
		} finally {
			setLoading(false);
		}
	};

	// Fetch users whenever query or filters change
	useEffect(() => {
		fetchUsers();
	}, [query, roleFilter, verifiedFilter]);

	const handleDelete = async (id: string) => {
		try {
			await usersApi.delete(id);
			showSuccess("User deleted");
			fetchUsers();
		} catch {
			showError("Failed to delete user");
		}
	};

	const columns: Column<User>[] = [
		{ key: "email", label: "Email", sortable: true },
		{ key: "name", label: "Name", sortable: true },
		{
			key: "role",
			label: "Role",
			sortable: true,
			render: (u) => <Badge variant="secondary">{u.role}</Badge>,
		},
		{
			key: "emailVerified",
			label: "Verified",
			render: (u) => (
				<Badge variant={u.emailVerified ? "default" : "destructive"}>
					{u.emailVerified ? "Yes" : "No"}
				</Badge>
			),
		},
		{
			key: "id",
			label: "Actions",
			render: (u) => (
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							setEditUser(u);
							setShowModal(true);
						}}
					>
						Edit
					</Button>
					<Button
						variant="destructive"
						size="sm"
						onClick={() => setUserToDelete(u)}
					>
						Delete
					</Button>
				</div>
			),
		},
	];

	// Filters
	const filters: TableFilter[] = [
		{
			label: "Role",
			value: roleFilter,
			options: [
				{ label: "All", value: "All" },
				{ label: "Admin", value: "ADMIN" },
				{ label: "Coach", value: "COACH" },
				{ label: "Client", value: "CLIENT" },
			],
			onChange: setRoleFilter,
		},
		{
			label: "Verification",
			value: verifiedFilter,
			options: [
				{ label: "All", value: "All" },
				{ label: "Verified", value: "verified" },
				{ label: "Unverified", value: "unverified" },
			],
			onChange: setVerifiedFilter,
		},
	];

	// Custom mobile card renderer
	const mobileCardRenderer = (user: User) => (
		<div className="space-y-3">
			<div className="flex justify-between items-start">
				<div className="flex-1">
					<h3 className="font-medium">{user.name || "No name"}</h3>
					<p className="text-sm text-muted-foreground">{user.email}</p>
				</div>
				<div className="flex flex-col gap-1 items-end">
					<Badge variant="secondary" className="text-xs">
						{user.role}
					</Badge>
					<Badge
						variant={user.emailVerified ? "default" : "destructive"}
						className="text-xs"
					>
						{user.emailVerified ? "Verified" : "Unverified"}
					</Badge>
				</div>
			</div>
			<div className="flex gap-2 pt-2 border-t">
				<Button
					variant="outline"
					size="sm"
					className="flex-1"
					onClick={() => {
						setEditUser(user);
						setShowModal(true);
					}}
				>
					Edit
				</Button>
				<Button
					variant="destructive"
					size="sm"
					className="flex-1"
					onClick={() => setUserToDelete(user)}
				>
					Delete
				</Button>
			</div>
		</div>
	);

	return (
		<>
			<div className="space-y-6 px-4 py-6 max-w-screen-xl mx-auto">
				<h1 className="text-2xl font-bold">User Administration</h1>

				<Card>
					<CardHeader>
						<CardTitle>All Users</CardTitle>
						<CardDescription>Manage registered users</CardDescription>
					</CardHeader>
					<CardContent>
						<ServerTable<User>
							data={users}
							columns={columns}
							totalCount={totalCount}
							loading={loading}
							query={query}
							setQuery={setQuery}
							getRowId={(row) => row.id}
							onCreate={() => {
								setEditUser(null);
								setShowModal(true);
							}}
							createLabel="Create User"
							filters={filters}
							mobileCardRenderer={mobileCardRenderer}
						/>
					</CardContent>
				</Card>

				<UserFormModal
					open={showModal}
					onClose={() => setShowModal(false)}
					onSuccess={() => {
						fetchUsers();
						setShowModal(false);
					}}
					user={editUser}
				/>
			</div>

			{userToDelete && (
				<AlertDialog
					open={!!userToDelete}
					onOpenChange={() => setUserToDelete(null)}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								Delete user "{userToDelete?.email}"?
							</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. The user and their data will be
								permanently deleted.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel onClick={() => setUserToDelete(null)}>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={async () => {
									if (userToDelete) {
										await handleDelete(userToDelete.id);
										setUserToDelete(null);
									}
								}}
							>
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}
		</>
	);
}
