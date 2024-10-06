// eslint-disable-next-line import/no-cycle
import { faInbox, faPeoplePulling } from "@fortawesome/free-solid-svg-icons";
// eslint-disable-next-line import/no-cycle
import { headerGradientTypes } from "components/header";
import { useLayout } from "context/layout-context";
import { motion } from "framer-motion";
import {
  constant,
  filter,
  isEqual,
  isUndefined,
  map,
  reject,
  size,
} from "lodash";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC } from "react";
import { getRouteParts } from "utils/url-utils";

import TabButton, { ITabButton, TabButtonTheme } from "./tab-button";
import FallBackImage from "../fallback-image";
import { XPLogo } from "../svg/logos";
import { useUser } from "../../context/user-context";
import { avatarToURL } from "../../utils/discord-utils";

const NavigationItems: ITabButton[] = [
  {
    text: `XP`,
    isActive: (path: string[]) => isUndefined(path[0]),
    isVisible: (user, path) => (user && !isEqual(path[0], `home`)) || false,
    link: `/home`,
    element: <XPLogo />,
  },
  {
    text: `XP`,
    isActive: (path: string[]) => isUndefined(path[0]),
    isVisible: (user) => !user || false,
    link: `/`,
    element: <XPLogo />,
  },
  {
    text: `Blog`,
    isActive: (path: string[]) => isEqual(path[0], `blog`),
    link: `/blog`,
  },
  {
    text: `Invite`,
    isActive: constant(false),
    link: `https://get.xp-bot.net/`,
  },
  // {
  //   text: `Premium`,
  //   isActive: (path: string[]) => isEqual(path[0], `premium`),
  //   isVisible: (user) => isUndefined(user) || !user?.premium.userPremium,
  //   link: `/premium`,
  // },
  {
    text: `Status`,
    isActive: (path: string[]) => isEqual(path[0], `status`),
    link: `/status`,
  },
  {
    text: `Support`,
    isActive: constant(false),
    link: `https://discord.xp-bot.net/`,
    icon: faPeoplePulling,
  },
  {
    text: `Servers`,
    isActive: (path: string[]) => isEqual(path[0], `servers`),
    isVisible: (user) => !isUndefined(user),
    link: `/servers`,
    marginLeft: true,
  },
];

interface DesktopNavBarProps {
  customImage?: string;
  customBlur?: number;
  customGradient?: typeof headerGradientTypes.premium;
}

const DesktopNavBar: FC<DesktopNavBarProps> = () => {
  const user = useUser();
  const layout = useLayout();
  const router = useRouter();
  const currentPath = getRouteParts(router);
  const useBigHeader =
    isEqual(router.asPath, `/`) || isEqual(router.asPath, `/premium`);

  const { inboxItems } = user.inbox;
  const unreadInboxItems = reject(inboxItems, "read");

  return (
    <div className="relative z-10 -mb-2 hidden h-fit w-full justify-center lg:flex">
      <motion.div
        animate={{
          position: "absolute",
          padding: `0px 2.5rem`,
          backdropFilter: "blur(0px)",
          justifyContent: useBigHeader ? `center` : `end`,
        }}
        className="container top-[27px] flex w-full flex-row items-center rounded-md border-opacity-[.25] font-normal"
      >
        {map(
          filter(
            NavigationItems,
            (item) =>
              isUndefined(item.isVisible) ||
              item.isVisible(user.currentUser, currentPath)
          ),
          (item) => (
            <div
              className="flex items-center"
              key={`${item.text}${item.isActive}`}
            >
              {item.marginLeft && (
                <div className="h-6 w-[1px] bg-white opacity-25" />
              )}
              <TabButton
                layoutId="desktop-nav-bar"
                theme={TabButtonTheme.Title}
                className="p-[12px]"
                button={item}
              />
            </div>
          )
        )}

        {user.isLoggedIn && size(inboxItems) > 0 && (
          <div className="flex items-center" key="Sign Infalse">
            <div className="h-6 w-[1px] bg-white opacity-25" />
            <TabButton
              layoutId="desktop-nav-bar"
              theme={TabButtonTheme.Title}
              className="p-[12px]"
              button={{
                icon: faInbox,
                text: `Inbox${
                  size(unreadInboxItems) > 0
                    ? ` (${size(unreadInboxItems)})`
                    : ``
                }`,
                onClick: () => {
                  layout.toggleInbox();
                },
              }}
            />
          </div>
        )}

        {user.isLoggedIn ? (
          <Link
            href={
              !user.isLoggedIn
                ? `${process.env.BACKEND_DOMAIN}/discord/login`
                : `/me`
            }
          >
            <div className="ml-3 drop-shadow-md transition ease-in-out hover:scale-95 active:scale-90">
              <FallBackImage
                src={avatarToURL(user.currentUser?.discordUser)}
                className="aspect-square w-[37px] rounded-full object-cover"
              />
            </div>
          </Link>
        ) : (
          <>
            <div className="h-6 w-[1px] bg-white opacity-25" />
            <div className="flex items-center" key="Sign Infalse">
              <TabButton
                layoutId="desktop-nav-bar"
                theme={TabButtonTheme.Title}
                className="p-[12px]"
                button={{
                  text: `Sign In`,
                  link: `${process.env.BACKEND_DOMAIN}/discord/login`,
                }}
              />
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default DesktopNavBar;
