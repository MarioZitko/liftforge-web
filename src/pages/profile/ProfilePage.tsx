import ClientsApiClient from "@/api/client/client.api";
import CoachesApiClient from "@/api/coach/coach.api";
import UsersApiClient from "@/api/users/users.api";
import { User } from "@/api/users/users.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label >
                E-mail
              </Label>
              <p className="text-base">{user.email}</p>
            </div>

            <div>
              <Label>
                Role
              </Label>
              <p className="text-base">{user.role}</p>
            </div>
            <div>
              <Label>
                User ID
              </Label>
              <p className="text-base">{user.userId}</p>
            </div>
            <div>
              <Label>
                Email Verified
              </Label>
              <p className="text-base">
                {userData?.emailVerified ? "Yes" : "No"}
              </p>
              {userData?.emailVerified === false && (
                <div className="space-y-2">
                  <p className="text-sm text-red-500">
                    Please verify your email to access all features.
                  </p>
                  <Button size="sm" onClick={() => navigate("/verify-email")}>
                    Verify Email
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Client-specific Card */}
        {user.role === "CLIENT" && (
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : clientStore.client ? (
                <div className="space-y-3">
                  <div>
                    <Label>
                      Name
                    </Label>
                    <p className="text-base">
                      {clientStore.client.user?.name || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label>
                      Email
                    </Label>
                    <p className="text-base">
                      {clientStore.client.user?.email || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label>
                      Date of Birth
                    </Label>
                    <p className="text-base">
                      {clientStore.client.dateOfBirth
                        ? new Date(
                            clientStore.client.dateOfBirth
                          ).toLocaleDateString()
                        : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label>
                      Bio
                    </Label>
                    <p className="text-base">
                      {clientStore.client.bio || "No bio available"}
                    </p>
                  </div>
                  <div>
                    <Label>
                      Assigned Coach
                    </Label>
                    <p className="text-base">
                      {clientStore.client.coachId || "No coach assigned"}
                    </p>
                  </div>
                  <div>
                    <Label>
                      Looking for Coach
                    </Label>
                    <p className="text-base">
                      {clientStore.client.lookingForCoach ? "Yes" : "No"}
                    </p>
                  </div>
                  <Button onClick={handleEditClick} className="mt-4">
                    Edit
                  </Button>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  No client data found
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Coach-specific Card */}
        {user.role === "COACH" && (
          <Card>
            <CardHeader>
              <CardTitle>Coach Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : coachStore.coach ? (
                <div className="space-y-3">
                  <div>
                    <Label>
                      Name
                    </Label>
                    <p className="text-base">
                      {coachStore.coach.user?.name || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label>
                      Email
                    </Label>
                    <p className="text-base">
                      {coachStore.coach.user?.email || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label>
                      Bio
                    </Label>
                    <p className="text-base">
                      {coachStore.coach.bio || "No bio available"}
                    </p>
                  </div>
                  <div>
                    <Label>
                      Certification
                    </Label>
                    <p className="text-base">
                      {coachStore.coach.certification || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <Label>
                      Looking for Client
                    </Label>
                    <p className="text-base">
                      {coachStore.coach.lookingForClient ? "Yes" : "No"}
                    </p>
                  </div>
                  <Button onClick={handleEditClick} className="mt-4">
                    Edit
                  </Button>
                </div>
              ) : (
                <div className="text-muted-foreground">No coach data found</div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Admin-specific Card */}
        {user.role === "ADMIN" && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>
                  Access Level
                </Label>
                <p className="text-base">Full System Access</p>
              </div>
              <div>
                <Label>
                  Permissions
                </Label>
                <p className="text-base">
                  Manage Users, Coaches, Clients, and System Settings
                </p>
              </div>
              <div>
                <Label>
                  Last Login
                </Label>
                <p className="text-base">Today</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg border p-6 w-full max-w-md mx-4 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                Edit {user.role === "CLIENT" ? "Client" : "Coach"} Information
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="mb-1">
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="mb-1">
                    Email (Read-only)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={
                      user.role === "CLIENT"
                        ? clientStore.client?.user?.email || ""
                        : coachStore.coach?.user?.email || ""
                    }
                    disabled
                    className="bg-muted text-muted-foreground"
                  />
                </div>

                {user.role === "CLIENT" && (
                  <div>
                    <Label htmlFor="dateOfBirth" className="mb-1">
                      Date of Birth
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={editForm.dateOfBirth}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          dateOfBirth: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="bio" className="mb-1">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {user.role === "COACH" && (
                  <div>
                    <Label htmlFor="certification" className="mb-1">
                      Certification
                    </Label>
                    <Input
                      id="certification"
                      type="text"
                      value={editForm.certification}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          certification: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Input
                    type="checkbox"
                    id={
                      user.role === "CLIENT"
                        ? "lookingForCoach"
                        : "lookingForClient"
                    }
                    checked={
                      user.role === "CLIENT"
                        ? editForm.lookingForCoach
                        : editForm.lookingForClient
                    }
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        [user.role === "CLIENT"
                          ? "lookingForCoach"
                          : "lookingForClient"]: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <Label
                    htmlFor={
                      user.role === "CLIENT"
                        ? "lookingForCoach"
                        : "lookingForClient"
                    }
                    className="text-sm font-medium"
                  >
                    Looking for {user.role === "CLIENT" ? "Coach" : "Client"}
                  </Label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditSubmit}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  {isUpdating ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
