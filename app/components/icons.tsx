import {
  IconUser,
  IconTicket,
  IconDashboard,
  IconUserCog,
  IconPackage,
  IconBuilding,
} from "@tabler/icons-react";
import type { IconProps } from "@tabler/icons-react";

export type Icon = React.ComponentType<IconProps>;

export const Icons = {
  patient: IconUser,
  ticket: IconTicket,
  dashboard: IconDashboard,
  users: IconUserCog,
  plans: IconPackage,
  companies: IconBuilding,
};
