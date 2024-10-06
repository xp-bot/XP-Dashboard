import { faNoteSticky } from "@fortawesome/free-regular-svg-icons";
import {
  faHome,
  faServer,
  faSignIn,
  faUser,
  faWifiStrong,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUser } from "context/user-context";
import { constant, filter, includes, isEqual, isUndefined, map } from "lodash";
import { IXPAPIUser } from "models/backend/xp-models";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC } from "react";

import { getRouteParts } from "../../utils/url-utils";

const NavigationItems: {
  text: string;
  link: string;
  isActive: (path: string[]) => boolean;
  isVisible?: (user: IXPAPIUser | undefined, path: string[]) => boolean;
  icon?: IconDefinition;
  image?: JSX.Element;
}[] = [
  {
    text: `Home`,
    isActive: (path: string[]) => isEqual(path[0], `home`),
    isVisible: (user) => !isUndefined(user),
    link: `/home`,
    icon: faHome,
  },
  {
    text: `Home`,
    isActive: (path: string[]) => isEqual(path[0], `home`),
    isVisible: (user) => isUndefined(user),
    link: `/`,
    icon: faHome,
  },
  {
    text: `Blog`,
    isActive: (path: string[]) => isEqual(path[0], `blog`),
    link: `/blog`,
    icon: faNoteSticky,
  },
  {
    text: `Status`,
    isActive: (path: string[]) => isEqual(path[0], `status`),
    link: `/status`,
    icon: faWifiStrong,
  },
  {
    text: `Servers`,
    isActive: (path: string[]) => isEqual(path[0], `servers`),
    link: `/servers`,
    isVisible: (user) => !isUndefined(user),
    icon: faServer,
  },
  {
    text: `You`,
    isActive: (path: string[]) => includes(path, `me`),
    link: `/me`,
    isVisible: (user) => !isUndefined(user),
    icon: faUser,
  },
  // {
  //   text: `Premium`,
  //   isActive: (path: string[]) => isEqual(path[0], `premium`),
  //   link: `/premium`,
  //   isVisible: (user) => isUndefined(user),
  //   icon: faCrown,
  // },
  {
    text: `Sign In`,
    isActive: constant(false),
    link: `${process.env.BACKEND_DOMAIN}/discord/login`,
    isVisible: (user) => isUndefined(user),
    icon: faSignIn,
  },
];

interface MobileNavBarProps {}

const MobileNavBar: FC<MobileNavBarProps> = () => {
  const router = useRouter();
  const currentPath = getRouteParts(router);
  const user = useUser();
  return (
    <div
      // PB-[32px] / pb-8
      style={{ boxShadow: "0 -2px 8px rgba(0,0,0,0.10)" }}
      className="fixed bottom-0 z-30 w-full border-t border-[#808080] border-opacity-[.25] pt-1 text-center pb-safe ios:bg-navBar-mobile-background/75 ios:backdrop-blur-lg android:bg-navBar-mobile-background ios:dark:bg-navBar-mobile-background-darkMode/90 android:dark:bg-navBar-mobile-background-darkMode md:backdrop-blur-[20px] lg:hidden"
    >
      <div className="flex justify-evenly pb-2 ios:pb-0">
        {map(
          filter(NavigationItems, (item) =>
            item.isVisible
              ? item.isVisible(user.currentUser, currentPath)
              : true,
          ),
          ({ text, link, isActive, icon }, idx) => (
            <Link key={idx} href={link}>
              <div
                className={`flex w-16 flex-col items-center justify-center pt-[9px] transition ease-in-out ${
                  isActive(currentPath)
                    ? `text-navBar-mobile-icons-enabled`
                    : `cursor-pointer text-navBar-mobile-icons-disabled`
                }`}
              >
                {icon && (
                  <FontAwesomeIcon className="mb-1 text-xl" icon={icon} />
                )}
                <p className="text-xs">{text}</p>
              </div>
            </Link>
          ),
        )}
      </div>
    </div>
  );
};

export default MobileNavBar;
