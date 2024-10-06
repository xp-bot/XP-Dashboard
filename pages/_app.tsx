import FallBackImage from "components/fallback-image";
import Modal from "components/modal";
import Tooltip from "components/tooltip";
import { LayoutContextProvider } from "context/layout-context";
import SocketManager from "context/socket-manager";
import { ToastContextProvider } from "context/toast-context";
import { useLocalStorage } from "hooks/use-local-storage";
import { forEach, isEmpty, isNil, keys, last, map, toPairs } from "lodash";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import semver from "semver";

import "@styles/checkmark.scss";
import "@styles/globals.scss";
import "@styles/xp-loading.scss";
import "../styles/markdown.scss";

import { ChangelogUser } from "./changes";
import changelog, { ChangelogType } from "../changelogs";
import MobileNavBar from "../components/mobile/mobile-nav-bar";
import WavePage from "../components/wave-page";
import { UserContextProvider } from "../context/user-context";

const inter = Inter({
  variable: "--inter-font",
  subsets: ["latin", "cyrillic", "greek"],
});

const ChangelogModal = () => {
  const [localStorage, setLocalStorage, isLocalStorageReady] = useLocalStorage([
    `last_version`,
  ]);
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [versionChanges, setVersionChanges] = useState<ChangelogType>({});
  const envVersion = last(keys(changelog)) || "0.0.0";

  useEffect(() => {
    if (!localStorage || !isLocalStorageReady) return;

    const localVersion = localStorage.last_version;

    if (isNil(localVersion) || isEmpty(localVersion)) {
      setLocalStorage(`last_version`, envVersion);
      return;
    }

    if (
      isNil(localStorage.last_version) ||
      (envVersion && localVersion && semver.ltr(localVersion, envVersion))
    ) {
      const visibleChanges: ChangelogType = {};

      forEach(toPairs(changelog), ([version, changes]) => {
        if (semver.ltr(localVersion, version))
          forEach(
            toPairs(changes),
            // eslint-disable-next-line no-return-assign
            ([name, change]) => {
              visibleChanges[name] = [
                ...(visibleChanges ? visibleChanges[name] || [] : []),
                ...change,
              ];
            },
          );
      });

      setVersionChanges(visibleChanges);
      setVersionModalOpen(true);
    } else {
      setVersionModalOpen(false);
    }
  }, [localStorage.last_version, isLocalStorageReady]);

  return (
    <Modal
      customKey="changelog"
      isOpen={versionModalOpen}
      requestClose={() => {
        setLocalStorage("last_version", envVersion);
        setVersionModalOpen(false);
      }}
      title={`Changelog ${
        localStorage.last_version ? `from v${localStorage.last_version} to` : ``
      } v${envVersion}`}
    >
      <div className="flex flex-col gap-5">
        {map(toPairs(versionChanges), ([title, changePart]) => {
          return (
            <div
              className="flex flex-col gap-5"
              key={`changelog-modal-version-${title}`}
            >
              <div>
                <h2>{title}</h2>
                <ul className="flex flex-col gap-2">
                  {map(changePart, (change, idxx) => {
                    return change.type === "image" ? (
                      <div
                        key={`changelog-modal-version-change-${change.type}-${idxx}`}
                        className="my-5 px-5 py-2 pt-0"
                      >
                        <div className="h-fit w-fit overflow-hidden rounded-md drop-shadow-md md:mx-auto">
                          <FallBackImage
                            className="hidden w-fit object-contain md:flex md:max-h-80"
                            src={change.content.pc}
                          />
                          <FallBackImage
                            className="object-contain md:hidden"
                            src={change.content.mobile || change.content.pc}
                          />
                        </div>
                      </div>
                    ) : (
                      <li
                        key={`changelog-modal-version-change-hr-${idxx}`}
                        className="ml-5 list-disc"
                      >
                        <div className="flex flex-col gap-2">
                          <p>{change.content}</p>
                          {change.submitter_id && change.submit_type && (
                            <div className="flex flex-row items-center gap-2">
                              <Tooltip
                                alignLeft
                                showContentOnMobile
                                text="Thank you for submitting this idea!"
                              >
                                <ChangelogUser user_id={change.submitter_id} />
                              </Tooltip>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              {/* {idx + 1 < size(entries(versionChanges)) && (
                <hr className="mx-auto mt-2 w-4/5" />
              )} */}
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <ThemeProvider attribute="class">
        <ToastContextProvider>
          <UserContextProvider>
            {/* {isEqual(router.asPath, `/`) ? (
            <Component {...pageProps} />
          ) : ( */}
            <div
              className={`h-[100vh] ${
                ""
                // isEqual(router.asPath, `/`) || isEqual(router.asPath, `/premium`)
                //   ? `pb-20 lg:pb-0`
                //   : `pb-20`
              } ${inter.variable}`}
            >
              <LayoutContextProvider>
                <SocketManager />
                <WavePage>
                  <Component {...pageProps} />
                  <ChangelogModal />
                </WavePage>
              </LayoutContextProvider>
              <MobileNavBar />
            </div>
            {/* )} */}
          </UserContextProvider>
        </ToastContextProvider>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
