import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import type { User } from "~/http/auth-api";

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  user: User | null;
}

export function UserAvatarProfile({
  className,
  showInfo = false,
  user,
}: UserAvatarProfileProps) {
  return (
    <div className="flex items-center gap-2">
      <Avatar className={className}>
        <AvatarImage src={"/icons/avatar.png"} alt={user?.email || ""} />
        <AvatarFallback className="rounded-lg">{user?.email}</AvatarFallback>
      </Avatar>

      {showInfo && (
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">{user?.email || ""}</span>
          <span className="truncate text-xs">{user?.email}</span>
        </div>
      )}
    </div>
  );
}
