import { faCrown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BlockButton, { BlockButtonVariant } from "components/block-button";
import FallBackImage from "components/fallback-image";
import { headerGradientTypes } from "components/header";
import HeaderPremium from "components/header-content/header-premium";
import IndexEmpBG from "components/index-emp-bg";
import IndexHighlight from "components/index-panel";
import Modal from "components/modal";
import { ThinArrowDown } from "components/svg/arrows";
import { useLayout } from "context/layout-context";
import useBreakpoints from "hooks/use-breakpoints";
import { isUndefined, map } from "lodash";
// import { useFlags } from 'flags/client';
import type { NextPage } from "next";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";

import HeadSet from "../components/head-set";
import { IPage } from "../models/page";

const highlights: {
  title: string;
  description: string | ReactNode;
  image?: string;
  imageRight?: boolean;
}[] = [
  {
    title: "User Premium",
    description: (
      <div className="flex flex-col gap-5">
        Starting at 2.99 €
        <div className="mx-auto flex w-fit flex-row gap-2">
          <Link href="https://patreon.xp-bot.net/">
            <BlockButton>Get Premium</BlockButton>
          </Link>
        </div>
      </div>
    ),
  },
  {
    title: "Premium Badge",
    description: (
      <>
        You will recieve the <FontAwesomeIcon icon={faCrown} /> badge. It will
        be visible on your Ranking Card for every user to see.
      </>
    ),
    image: "https://qwq.sh/12lk3g",
    imageRight: true,
  },
  {
    title: "Stay Vote Free",
    description:
      "Say goodbye to voting every 12 hours. When you're a premium user you won't have to anymore.",
    image: "https://qwq.sh/1veoki",
  },
  {
    title: "Increased Creativity",
    description:
      "As a premium user, you may customize your Ranking Card even more! You'll have access to Canvas Backgrounds and Blurring!",
    image: "https://qwq.sh/aymj7o",
    imageRight: true,
  },
  {
    title: "Server Premium",
    description: (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-0">
          <span>Starting at 7.99 €</span>
          <span className="text-sm opacity-75">
            Server Premium includes every feature of the "User Premium" Tier for
            the patron.
          </span>
        </div>
        <div className="mx-auto flex w-fit flex-row gap-2">
          <Link href="https://patreon.xp-bot.net/">
            <BlockButton>Get Server Premium</BlockButton>
          </Link>
        </div>
      </div>
    ),
  },
  {
    title: "Discord Leaderboard",
    description:
      "Display your community's leaderboard right in discord. No need to leave the app!",
    image: "https://qwq.sh/ixhm54",
  },
  {
    title: "Server Backgrounds",
    description:
      'Adjust your community\'s public appearance by setting a "Community Background"!',
    image: "https://qwq.sh/affjo7",
    imageRight: true,
  },
  {
    title: "Customize XP even more",
    description:
      "There are many optional but very cool Modules, Values and Features in general available for premium servers.",
    image: "https://qwq.sh/affjo7",
  },
  {
    title: "Vote Free Bundles",
    description: (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-0">
          <span>
            Remove voting on your Servers with our exclusive Premium Bundles.
          </span>
        </div>
        <div className="mx-auto flex w-fit flex-row gap-2">
          <Link href="https://patreon.xp-bot.net/">
            <BlockButton>Get Server Premium</BlockButton>
          </Link>
        </div>
      </div>
    ),
  },
  {
    title: "Intrigued?",
    description: (
      <>
        <span>
          If you're intrigued by any of the features mentioned or simply wish to
          support our goal of delivering the most affordable XP bot, feel free
          to explore the rest of our feature set below.
        </span>
        <br />
        <span className="text-sm opacity-75">
          P.S. Don't worry if you're not ready to commit to premium just yet, XP
          will always be free for you to enjoy, forever and ever! 🤭
        </span>
        <div className="flex w-full flex-row justify-center gap-5 pt-5">
          <Link href="https://patreon.xp-bot.net/">
            <BlockButton variant={BlockButtonVariant.inPanel}>
              Check out Patreon
            </BlockButton>
          </Link>
        </div>
      </>
    ),
  },
];

type PremiumProps = IPage;

const Premium: NextPage<PremiumProps> = () => {
  const layout = useLayout();
  const bp = useBreakpoints();

  const [openImage, setOpenImage] = useState<string | undefined>();

  useEffect(() => {
    layout.changeHeader(
      <HeaderPremium />,
      `premium`,
      undefined,
      undefined,
      headerGradientTypes.premium
    );
  }, []);

  return (
    <div>
      <HeadSet title="Reimagine your Community" />
      {bp.isLg && (
        <div
          onClick={() => {
            document
              .getElementById("index_scroll_target")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          className="FeatureArrow"
        >
          <p>learn more</p>
          <ThinArrowDown />
        </div>
      )}

      <div id="index_scroll_target" />
      <div className="flex flex-col gap-10 pt-5 lg:gap-20">
        {map(highlights, (highlight, idx) => (
          <IndexEmpBG empBG={idx % 2 !== 0}>
            <IndexHighlight
              rightImage={highlight.imageRight}
              requestImageZoom={(image) => {
                setOpenImage(image);
              }}
              description={highlight.description}
              title={highlight.title}
              image={highlight.image}
            />
          </IndexEmpBG>
        ))}

        <div className="flex w-full flex-col items-center justify-center gap-1 text-xs text-darkText opacity-75 dark:text-darkText-darkMode">
          <span>Copyright © 2019 - 2022 XP</span>
          <span className="flex flex-row gap-2">
            <Link href="/legal/privacy">Privacy Policy</Link>
            <span>•</span>
            <Link href="/blog/contributing_to_user_safety_and_service_guidelines_1657056506533">
              Safety Guidelines
            </Link>
          </span>
          <span>❤️ Made with Love ❤️</span>
        </div>
        {bp.isLg && (
          <Modal
            isOpen={!isUndefined(openImage)}
            requestClose={() => {
              setOpenImage(undefined);
            }}
            customKey={`index_image_zoom_${openImage || `closed`}`}
          >
            <div className="aspect-video overflow-hidden rounded-md border border-input-border dark:border-input-border-darkMode lg:max-w-5xl">
              <FallBackImage
                className="h-full w-full object-cover shadow-md"
                src={openImage}
              />
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export async function getStaticProps() {
  // const blogPosts = await apiRoutes.blog.get.posts();
  return {
    redirect: {
      destination: "/",
      permanent: true,
    },
  };
}

export default Premium;
