import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { IconX, IconUser } from "@tabler/icons-react";
import { userApi } from "~/http/api-server";
import { UserRole } from "~/types/users";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

interface MemberSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  className?: string;
}

interface UserOption {
  id: string;
  fullName: string;
  email: string;
}

export function MemberSelector({
  selectedIds,
  onChange,
  disabled,
  className,
}: MemberSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["ambulance-users-search", searchTerm],
    queryFn: () =>
      userApi.searchUsers({
        term: searchTerm,
        limit: 20,
        role: [UserRole.AMBULANCE],
      }),
    enabled: searchTerm.length > 0,
  });

  const { data: allAmbulanceUsers = [] } = useQuery({
    queryKey: ["ambulance-users-all"],
    queryFn: () =>
      userApi.searchUsers({
        limit: 50,
        role: [UserRole.AMBULANCE],
      }),
  });

  const selectedUsers = useMemo(() => {
    return selectedIds
      .map((id) => allAmbulanceUsers.find((u) => u.id === id))
      .filter((u): u is UserOption => u !== undefined);
  }, [selectedIds, allAmbulanceUsers]);

  const availableUsers = useMemo(() => {
    const usersToSearch = searchTerm ? searchResults : allAmbulanceUsers;
    return usersToSearch.filter(
      (user) =>
        !selectedIds.includes(user.id) &&
        (user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${user.firstName} ${user.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, searchResults, allAmbulanceUsers, selectedIds]);

  const handleSelect = (userId: string) => {
    onChange([...selectedIds, userId]);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleRemove = (userId: string) => {
    onChange(selectedIds.filter((id) => id !== userId));
  };

  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-sm font-medium">Tripulación</label>

      <div className="relative">
        <Input
          placeholder="Buscar usuario ambulancia..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          className="w-full"
        />

        {isOpen && !disabled && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 text-sm text-muted-foreground">
                Buscando...
              </div>
            ) : availableUsers.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">
                {searchTerm
                  ? "No se encontraron usuarios"
                  : "No hay usuarios disponibles"}
              </div>
            ) : (
              <div className="p-1">
                {availableUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelect(user.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent rounded-sm text-left"
                  >
                    <IconUser className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">
                        {user.fullName || `${user.firstName} ${user.lastName}`}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <Badge key={user.id} variant="secondary" className="pl-2 pr-1 py-1">
              <span className="truncate max-w-[150px]">
                {user.fullName || `${user.firstName} ${user.lastName}`}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent hover:text-destructive"
                onClick={() => handleRemove(user.id)}
                disabled={disabled}
              >
                <IconX className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            setSearchTerm("");
          }}
        />
      )}
    </div>
  );
}