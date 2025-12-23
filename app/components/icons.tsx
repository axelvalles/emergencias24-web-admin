import {
  IconUser,
  IconTicket,
  IconDashboard,
  IconUserCog,
  IconPackage,
  IconBuilding,
  IconCreditCard,
  IconMenu,
} from "@tabler/icons-react";
import type { IconProps } from "@tabler/icons-react";

export type Icon = React.ComponentType<IconProps>;

export const SiameLogoLarge = () => {
  return (
    <img
      src="/images/siame-logo-large.svg"
      alt="SIAME Logo"
      style={{ width: "80%" }}
    />
  );
};

export const SiameLogo = () => {
  return <img src="/images/siame-logo.svg" alt="SIAME Logo" />;
};

export const Icons = {
  patient: IconUser,
  ticket: IconTicket,
  dashboard: IconDashboard,
  users: IconUserCog,
  plans: IconPackage,
  companies: IconBuilding,
  subscriptions: IconCreditCard,
  logo: IconMenu,
};
