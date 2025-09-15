import ClientsApiClient from "@/api/client/client.api";
import CoachesApiClient from "@/api/coach/coach.api";
import UsersApiClient from "@/api/users/users.api";
import { User } from "@/api/users/users.types";
import { useClientStore } from "@/store/clientStore";
import { useCoachStore } from "@/store/coachStore";
import { useUserStore } from "@/store/userStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const user = useUserStore((s) => s.user);
  const coachStore = useCoachStore((s) => s);
  const clientStore = useClientStore((s) => s);
  const navigate = useNavigate();
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    dateOfBirth: "",
    bio: "",
    certification: "",
    lookingForCoach: false,
    lookingForClient: false,
  });

  const handleEditClick = () => {
    if (user?.role === "CLIENT" && clientStore.client) {
      // Format date properly for date input
      let formattedDate = "";
      if (clientStore.client.dateOfBirth) {
        const date = new Date(clientStore.client.dateOfBirth);
        formattedDate = date.toISOString().split("T")[0];
      }

      setEditForm({
        name: clientStore.client.user?.name || "",
        dateOfBirth: formattedDate,
        bio: clientStore.client.bio || "",
        certification: "",
        lookingForCoach: clientStore.client.lookingForCoach || false,
        lookingForClient: false,
      });
      setIsEditModalOpen(true);
    } else if (user?.role === "COACH" && coachStore.coach) {
      setEditForm({
        name: coachStore.coach.user?.name || "",
        dateOfBirth: "",
        bio: coachStore.coach.bio || "",
        certification: coachStore.coach.certification || "",
        lookingForCoach: false,
        lookingForClient: coachStore.coach.lookingForClient || false,
      });
      setIsEditModalOpen(true);
    }
  };

  const handleEditSubmit = async () => {
    if (!user?.userId) return;

    setIsUpdating(true);
    try {
      const usersApi = UsersApiClient.getInstance();

      // Update user name
      await usersApi.update(user.userId, { ...userData, name: editForm.name });

      if (user.role === "CLIENT" && clientStore.client) {
        const clientApi = ClientsApiClient.getInstance();

        // Update client data
        await clientApi.update(clientStore.client.id, {
          dateOfBirth: new Date(editForm.dateOfBirth),
          bio: editForm.bio,
          lookingForCoach: editForm.lookingForCoach,
        });

        // Update the store with new data
        const updatedClient = {
          ...clientStore.client,
          dateOfBirth: editForm.dateOfBirth
            ? new Date(editForm.dateOfBirth)
            : clientStore.client.dateOfBirth,
          bio: editForm.bio,
          lookingForCoach: editForm.lookingForCoach,
          user: {
            ...clientStore.client.user,
            name: editForm.name,
            email: clientStore.client.user?.email || "",
            emailVerified: clientStore.client.user?.emailVerified ?? false,
          },
        };
        clientStore.setClient(updatedClient);
      } else if (user.role === "COACH" && coachStore.coach) {
        const coachApi = CoachesApiClient.getInstance();

        // Update coach data
        await coachApi.update(coachStore.coach.id, {
          bio: editForm.bio,
          certification: editForm.certification,
          lookingForClient: editForm.lookingForClient,
        });

        // Update the store with new data
        const updatedCoach = {
          ...coachStore.coach,
          bio: editForm.bio,
          certification: editForm.certification,
          lookingForClient: editForm.lookingForClient,
          user: {
            ...coachStore.coach.user,
            name: editForm.name,
            email: coachStore.coach.user?.email || "",
            emailVerified: coachStore.coach.user?.emailVerified ?? false,
          },
        };
        coachStore.setCoach(updatedCoach);
      }

      // Refresh userData
      const updatedUser = await usersApi.getMe();
      setUserData(updatedUser);

      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating data:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Fetch role-specific data from API
  useEffect(() => {
    const fetchRoleData = async () => {
      if (!user?.userId) return;

      setIsLoading(true);
      try {
        const usersApi = UsersApiClient.getInstance();
        const fetchedUser = await usersApi.getMe();
        setUserData(fetchedUser);
      } catch (error) {
        console.error("Error fetching role data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoleData();
  }, [user]);

  useEffect(() => {
    const fetchRoleSpecificData = async () => {
      if (!userData || !user) return;

      try {
        if (userData.role === "CLIENT") {
          const clientApi = ClientsApiClient.getInstance();
          let data = await clientApi.getByUserId(user.userId);
          data = {
            ...data,
            user: {
              name: userData.name || "",
              email: userData.email || "",
              emailVerified: userData.emailVerified || false,
            },
          };
          clientStore.setClient(data);
        } else if (userData.role === "COACH") {
          const coachApi = CoachesApiClient.getInstance();
          let data = await coachApi.getByUserId(user.userId);
          data = {
            ...data,
            user: {
              name: userData.name || "",
              email: userData.email || "",
              emailVerified: userData.emailVerified || false,
            },
          };
          coachStore.setCoach(data);
        }
      } catch (error) {
        console.error("Error fetching detailed data:", error);
      }
    };

    fetchRoleSpecificData();
  }, [userData, user]);

  if (!user) return null;

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information Card */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h2 className="text-xl font-semibold">User Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                E-mail
              </label>
              <p className="text-base">{user.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Role
              </label>
              <p className="text-base">{user.role}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                User ID
              </label>
              <p className="text-base">{user.userId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email Verified
              </label>
              <p className="text-base">
                {userData?.emailVerified ? "Yes" : "No"}
              </p>
              {userData?.emailVerified === false && (
                <div className="space-y-2">
                  <p className="text-sm text-red-500">
                    Please verify your email to access all features.
                  </p>
                  <button
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    onClick={() => navigate("/verify-email")}
                  >
                    Verify Email
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Client-specific Card */}
        {user.role === "CLIENT" && (
          <div className="bg-card rounded-lg border p-6 space-y-4">
            <h2 className="text-xl font-semibold">Client Information</h2>
            {isLoading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : clientStore.client ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Name
                  </label>
                  <p className="text-base">
                    {clientStore.client.user?.name || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="text-base">
                    {clientStore.client.user?.email || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Date of Birth
                  </label>
                  <p className="text-base">
                    {clientStore.client.dateOfBirth
                      ? new Date(
                          clientStore.client.dateOfBirth
                        ).toLocaleDateString()
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Bio
                  </label>
                  <p className="text-base">
                    {clientStore.client.bio || "No bio available"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Assigned Coach
                  </label>
                  <p className="text-base">
                    {clientStore.client.coachId || "No coach assigned"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Looking for Coach
                  </label>
                  <p className="text-base">
                    {clientStore.client.lookingForCoach ? "Yes" : "No"}
                  </p>
                </div>
                <button
                  onClick={handleEditClick}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
              </div>
            ) : (
              <div className="text-muted-foreground">No client data found</div>
            )}
          </div>
        )}
        {/* Coach-specific Card */}
        {user.role === "COACH" && (
          <div className="bg-card rounded-lg border p-6 space-y-4">
            <h2 className="text-xl font-semibold">Coach Information</h2>
            {isLoading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : coachStore.coach ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Name
                  </label>
                  <p className="text-base">
                    {coachStore.coach.user?.name || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="text-base">
                    {coachStore.coach.user?.email || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Bio
                  </label>
                  <p className="text-base">
                    {coachStore.coach.bio || "No bio available"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Certification
                  </label>
                  <p className="text-base">
                    {coachStore.coach.certification || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Looking for Client
                  </label>
                  <p className="text-base">
                    {coachStore.coach.lookingForClient ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">No coach data found</div>
            )}
          </div>
        )}
        {/* Admin-specific Card */}
        {user.role === "ADMIN" && (
          <div className="bg-card rounded-lg border p-6 space-y-4">
            <h2 className="text-xl font-semibold">Admin Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Access Level
                </label>
                <p className="text-base">Full System Access</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Permissions
                </label>
                <p className="text-base">
                  Manage Users, Coaches, Clients, and System Settings
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Login
                </label>
                <p className="text-base">Today</p>
              </div>
            </div>
          </div>
        )}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg border p-6 w-full max-w-md mx-4 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                Edit Client Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground border-border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Email (Read-only)
                  </label>
                  <input
                    type="email"
                    value={clientStore.client?.user?.email || ""}
                    disabled
                    className="w-full px-3 py-2 border rounded-md bg-muted text-muted-foreground border-border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) =>
                      setEditForm({ ...editForm, dateOfBirth: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground border-border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground border-border resize-none"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="lookingForCoach"
                    checked={editForm.lookingForCoach}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        lookingForCoach: e.target.checked,
                      })
                    }
                    className="mr-2 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="lookingForCoach"
                    className="text-sm font-medium text-foreground"
                  >
                    Looking for Coach
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50 text-foreground"
                >
                  Back
                </button>
                <button
                  onClick={handleEditSubmit}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isUpdating ? "Updating..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
