import { Program } from "@/api/programs/programs.types";
import { User } from "@/api/users/users.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const mockClients: User[] = [
  {
    id: "1",
    email: "john.doe@email.com",
    name: "John Doe",
    role: "CLIENT",
    emailVerified: true,
    createdAt: "2024-01-10T00:00:00Z",
  },
  {
    id: "2",
    email: "jane.smith@email.com",
    name: "Jane Smith",
    role: "CLIENT",
    emailVerified: true,
    createdAt: "2024-01-12T00:00:00Z",
  },
  {
    id: "3",
    email: "mike.johnson@email.com",
    name: "Mike Johnson",
    role: "CLIENT",
    emailVerified: false,
    createdAt: "2024-01-15T00:00:00Z",
  },
];

const mockPrograms: Program[] = [
  {
    id: "1",
    name: "Beginner Strength Training",
    description: "A comprehensive program for building foundational strength",
    isPublic: false,
    clientProgramId: "1",
    trainingBlockIds: ["tb1", "tb2"],
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
  },
  {
    id: "2",
    name: "Advanced Powerlifting",
    description: "Competition prep program for experienced lifters",
    isPublic: true,
    clientProgramId: "2",
    trainingBlockIds: ["tb3", "tb4", "tb5"],
    createdAt: "2024-02-01",
    updatedAt: "2024-02-05",
  },
  {
    id: "3",
    name: "Weight Loss Circuit",
    description: "High-intensity circuit training for fat loss",
    isPublic: false,
    clientProgramId: "1",
    trainingBlockIds: ["tb6"],
    createdAt: "2024-02-10",
    updatedAt: "2024-02-10",
  },
];
export default function ProgramsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [programs, setPrograms] = useState<Program[]>(mockPrograms);
  const [clients, setClients] = useState<User[]>(mockClients);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    // TODO: Replace with actual API calls
    // fetchPrograms();
    // fetchClients();
  }, []);

  const getClientById = (clientId: string) => {
    return clients.find((client) => client.id === clientId);
  };

  const getClientPrograms = (clientId: string) => {
    return programs.filter((program) => program.clientProgramId === clientId);
  };

  const filteredClients = clients.filter((client) =>
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleClientExpanded = (clientId: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedClients(newExpanded);
  };

  const handleCreateProgram = () => {
    navigate("/programs/create");
  };

  const handleEditProgram = (programId: string) => {
    navigate(`/programs/${programId}/edit`);
  };

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Programs</h1>
          <p className="text-muted-foreground">
            Manage training programs for your clients
          </p>
        </div>
        <Button
          onClick={handleCreateProgram}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Program
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">
                Search clients
              </Label>
              <Input
                id="search"
                placeholder="Search clients by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients and their Programs */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading programs...
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No clients found matching your search.
          </div>
        ) : (
          filteredClients.map((client) => {
            const clientPrograms = getClientPrograms(client.id);
            const isExpanded = expandedClients.has(client.id);

            return (
              <Card key={client.id}>
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleClientExpanded(client.id)}
                >
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {client.email}
                    <Badge variant="secondary" className="ml-auto mr-2">
                      {clientPrograms.length} program
                      {clientPrograms.length !== 1 ? "s" : ""}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </CardTitle>
                </CardHeader>
                {isExpanded && (
                  <CardContent>
                    {/* Add Program Button for existing clients with programs */}
                    {clientPrograms.length > 0 && (
                      <div className="flex justify-end mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCreateProgram}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Program
                        </Button>
                      </div>
                    )}

                    {clientPrograms.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No programs assigned to this client yet.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={handleCreateProgram}
                        >
                          Create First Program
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {clientPrograms.map((program) => (
                          <Card
                            key={program.id}
                            className="hover:shadow-md transition-shadow"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-lg">
                                  {program.name}
                                </CardTitle>
                                {program.isPublic && (
                                  <Badge variant="outline" className="text-xs">
                                    Public
                                  </Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-3">
                              {program.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {program.description}
                                </p>
                              )}

                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {program.trainingBlockIds?.length || 0}{" "}
                                  training block
                                  {program.trainingBlockIds?.length !== 1
                                    ? "s"
                                    : ""}
                                </span>
                              </div>

                              {program.createdAt && (
                                <p className="text-xs text-muted-foreground">
                                  Created:{" "}
                                  {new Date(
                                    program.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              )}

                              <div className="flex gap-2 pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditProgram(program.id)}
                                  className="flex-1"
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    navigate(`/programs/${program.id}`)
                                  }
                                  className="flex-1"
                                >
                                  View
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
