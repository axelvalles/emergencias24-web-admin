import {
  IconUser,
  IconTicket,
  IconDashboard,
  IconUserCog,
  IconHeartbeat,
  IconPackage,
  IconBuilding,
  IconCreditCard,
  IconMenu,
  IconAmbulance,
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
  benefits: IconHeartbeat,
  plans: IconPackage,
  companies: IconBuilding,
  subscriptions: IconCreditCard,
  logo: IconMenu,
  ambulance: IconAmbulance,
};
