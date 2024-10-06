// eslint-disable-next-line import/no-cycle
import {
  faDownload,
  faInfoCircle,
  faPaintBrush,
  faSave,
  faToggleOff,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ButtonCluster, { ButtonFeature } from "components/button-cluster";
import DropdownPanel from "components/dropdown-panel";
import ExportChecklistItem, {
  ExportChecklistItemTypes,
} from "components/export-checklist-item";
import FallBackImage from "components/fallback-image";
import Modal from "components/modal";
import PageTitle from "components/page-title";
import PanelInput from "components/panel-input";
import Tooltip from "components/tooltip";
import { useServerDetails } from "context/guild-details-context";
import { FinalColor } from "extract-colors/lib/types/Color";
import { motion } from "framer-motion";
import {
  clone,
  constant,
  filter,
  isEmpty,
  isEqual,
  isUndefined,
  map,
  noop,
  size,
  startsWith,
} from "lodash";
import { FC, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { DiscordChannelType } from "utils/discord-utils";
import { getAverageImageColors } from "utils/image-utils";

import { apiRoutes } from "../../apis/api-helper";
import downloadBlob from "../../utils/download-blob";

interface ServerTabSettingsProps {}

interface IBackgroundInputs {
  url: string;
  blur: number;
}
const ServerTabSettings: FC<ServerTabSettingsProps> = () => {
  const guild = useServerDetails();
  const [editBG, setEditBG] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<IBackgroundInputs>();

  const [bgAccents, setBGAccents] = useState<FinalColor[]>([]);

  useEffect(() => {
    const gatherAccent = async () => {
      if (isEmpty(watch(`url`))) {
        setBGAccents([]);
        return;
      }
      setBGAccents(await getAverageImageColors(watch(`url`)));
    };
    gatherAccent();
  }, [watch(`url`)]);
  useEffect(() => {
    setValue(`url`, guild.currentBackground?.url || ``);
  }, [guild.currentBackground?.url]);

  const onSaveBackground: SubmitHandler<IBackgroundInputs> = (data) => {
    if (!guild.currentServerPremium?.premium) return;
    guild.updateGuild(
      {
        name: `Background`,
        oldValue: guild.currentBackground?.enabled
          ? `URL: ${guild.currentBackground?.url || ``}\nBlur: ${
              guild.currentBackground?.blur || 0
            }px`
          : `Disabled`,
        newValue: `URL: ${data.url}\nBlur: ${data.blur}px`,
      },
      undefined,
      {
        url: data.url,
        blur: data.blur,
        enabled: true,
      },
    );
    setEditBG(false);
  };

  const onDisableBackground = () => {
    if (guild.currentBackground?.enabled)
      guild.updateGuild(
        {
          name: `Background`,
          oldValue: `URL: ${guild.currentBackground?.url || ``}\nBlur: ${
            guild.currentBackground?.blur || 0
          }px`,
          newValue: `Disabled`,
        },
        undefined,
        {
          url: guild.currentBackground?.url,
          blur: guild.currentBackground?.blur,
          enabled: false,
        },
      );
    setEditBG(false);
  };

  const onDisableLBMessage = () => {
    if (guild.currentXPGuild?.leaderboard_message.enabled) {
      const g = clone(guild.currentXPGuild);
      g.leaderboard_message.enabled = false;
      guild.updateGuild(
        {
          name: `Dynamic Leaderboard`,
          oldValue: `Enabled`,
          newValue: `Disabled`,
        },
        g,
      );
    }
  };

  const onSetLBMessage = (channelID: string) => {
    if (!guild.currentServerPremium?.premium) return;
    const g = clone(guild.currentXPGuild);
    if (!g) return;
    g.leaderboard_message.enabled = true;
    g.leaderboard_message.channelID = channelID;
    g.leaderboard_message.messageID = "";
    guild.updateGuild(
      {
        name: `Dynamic Leaderboard`,
        oldValue: guild.currentXPGuild?.leaderboard_message.enabled
          ? guild.currentXPGuild.leaderboard_message.channelID
          : `Disabled`,
        newValue: channelID,
      },
      g,
    );
  };

  const prePreviewBackground =
    watch(`url`) || guild.currentBackground?.url || ``;
  const previewBackground =
    startsWith(prePreviewBackground, `https://`) &&
    /(https?:\/\/.*\.(?:png|jpg|jpeg))$/.test(prePreviewBackground)
      ? prePreviewBackground
      : undefined;

  const [downloadedExport, setDownloadedExport] = useState(false);

  const downloadExport = async () => {
    if (downloadedExport) return;
    setDownloadedExport(true);
    const data = await apiRoutes.xp.guild
      .getExport(guild.guildID)
      .then((res) => {
        return res.success ? res.body : {};
      })
      .catch(constant({}));

    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    downloadBlob(blob, "community_export.json");
  };

  return (
    <>
      <div>
        <div className="flex flex-col gap-5">
          <div>
            <PageTitle
              title={`Server Background ${
                guild.currentServerPremium?.premium ? `🔓` : `🔒`
              }`}
            />
            <div
              className={
                guild.currentServerPremium?.premium
                  ? ``
                  : `pointer-events-none opacity-75`
              }
            >
              <ButtonCluster
                buttons={[
                  {
                    text: "Change Server Background",
                    icon: faPaintBrush,
                    onClick: () => {
                      if (guild.currentServerPremium?.premium) setEditBG(true);
                    },
                  },
                ]}
              />
            </div>
          </div>
          <div>
            <PageTitle
              disableArrow
              title={`Discord Leaderboard ${
                guild.currentServerPremium?.premium ? `🔓` : `🔒`
              }`}
            />
            <DropdownPanel
              dropdownName="Discord Leaderboard"
              tooltipText="The leaderboard will be posted around every full hour."
              dropdownDescription="Let XP print the first page of your Leaderboard into a Discord Channel!"
              disabled={!guild.currentServerPremium?.premium}
              onChange={(v) => {
                if (isEqual(v, `0`)) onDisableLBMessage();
                else onSetLBMessage(v);
              }}
              options={[
                {
                  id: `0`,
                  title: "Disabled",
                  selected: !guild.currentXPGuild?.leaderboard_message.enabled,
                },
                ...map(
                  filter(
                    guild.currentDiscordChannels,
                    (channel) =>
                      isEqual(channel.type, DiscordChannelType.news) ||
                      isEqual(channel.type, DiscordChannelType.text),
                  ) || [],
                  (channel) => ({
                    id: channel.id,
                    title: `#${channel.name || "Unknown"}`,
                    selected:
                      guild.currentXPGuild?.leaderboard_message.enabled &&
                      isEqual(
                        guild.currentXPGuild?.leaderboard_message.channelID,
                        channel.id,
                      ),
                  }),
                ),
              ]}
            />
          </div>
          <div>
            <PageTitle title="Community Export" />
            <div
              className={
                !downloadedExport ? `` : `pointer-events-none opacity-75`
              }
            >
              <ButtonCluster
                buttons={[
                  {
                    text: "Export Community",
                    icon: faDownload,
                    disabled: downloadedExport,
                    onClick: downloadExport,
                  },
                ]}
              />
            </div>
          </div>
          {/* <div>
            <PageTitle
              disableArrow
              tooltipText="Export and Import your Server Data. You can also export server's data, and import it to another server."
              title={`Export Server Settings ${
                guild.currentServerPremium?.premium ? `🔓` : `🔒`
              }`}
            />
            <div>
              <ButtonCluster
                buttons={[
                  {
                    text: "Export Server Settings",
                    icon: faDownload,
                    onClick: () => {
                      setExportModalOpen(true);
                    },
                  },
                  { text: "Import Server Settings", icon: faUpload },
                  {
                    disabled: true,
                    text: "Transfer Settings from another Server",
                    icon: faBoxesPacking,
                  },
                ]}
              />
            </div>
          </div> */}
        </div>
      </div>
      <Modal
        isOpen={exportModalOpen}
        title="Export Server Settings"
        requestClose={() => {
          setExportModalOpen(false);
        }}
        customKey="export-server-settings"
      >
        <div className="flex flex-col gap-5">
          <p className="text-lg">
            This is where you can export your server settings.
            <br />
            You will recieve a JSON file that you can keep as a backup, or
            import to another server.
          </p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <p className="text-lg italic opacity-75">
                What will be exported?
              </p>
              <div className="flex flex-col gap-2">
                <ExportChecklistItem
                  text="Modules"
                  type={ExportChecklistItemTypes.CHECK}
                />
                <ExportChecklistItem
                  text="Values"
                  type={ExportChecklistItemTypes.CHECK}
                />
                <ExportChecklistItem
                  text="Loggers"
                  type={ExportChecklistItemTypes.CHECK}
                />
                <ExportChecklistItem
                  text="Level Roles"
                  type={ExportChecklistItemTypes.CHECK}
                />
                <ExportChecklistItem
                  text="Ignores"
                  type={ExportChecklistItemTypes.CHECK}
                />
                <ExportChecklistItem
                  text="Boosts"
                  type={ExportChecklistItemTypes.CHECK}
                />
                <ExportChecklistItem
                  text="Announcement Settings"
                  type={ExportChecklistItemTypes.CHECK}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-lg italic opacity-75">
                What will not be exported?
              </p>
              <div className="flex flex-col gap-2">
                <ExportChecklistItem
                  text="Leaderboards"
                  type={ExportChecklistItemTypes.CROSS}
                />
                <ExportChecklistItem
                  text="Dashboard Background"
                  type={ExportChecklistItemTypes.CROSS}
                />
                <ExportChecklistItem
                  text="Discord Leaderboard"
                  type={ExportChecklistItemTypes.CROSS}
                />
              </div>
            </div>
          </div>
          <ButtonCluster
            isInPanel
            buttons={[
              { text: "Export Settings", icon: faDownload, onClick: noop },
            ]}
          />
        </div>
      </Modal>
      <Modal
        requestClose={() => {
          setEditBG(false);
        }}
        customKey="change-server-bg"
        isOpen={editBG}
        title="Change Server Background"
      >
        <form
          onSubmit={handleSubmit(onSaveBackground)}
          className="flex flex-col gap-5"
        >
          <PanelInput
            registerForm={register(`url`, {
              required: "An URL is required.",
              validate: (value) =>
                !startsWith(value, `https://`)
                  ? `The URL needs to start with "https://"!`
                  : !/(https?:\/\/.*\.(?:png|jpg|jpeg))$/.test(value)
                    ? `The Image must directly lead to an exposed image. (.png / .jpg / .jpeg)`
                    : true,
            })}
            formError={errors.url}
            label="Server Background URL"
            value={guild.currentBackground?.url || ``}
          />
          <PanelInput
            disabled={isUndefined(previewBackground)}
            formError={errors.blur}
            inputProps={{ max: 40, maxLength: 3, min: 0 }}
            type="number"
            registerForm={register(`blur`, {
              valueAsNumber: true,
              max: {
                message: "You cannot blur the image more than 40px.",
                value: 40,
              },
              min: {
                message: "The provided number must be at least 0px.",
                value: 0,
              },
            })}
            label="Server Background Blur (0 = No Blur)"
            value={guild.currentBackground?.blur || 0}
          />
          {previewBackground && (
            <div>
              <h2>Preview:</h2>
              <div className="aspect-[16/9] max-w-3xl overflow-hidden rounded-md border ">
                <div className="relative h-full w-full overflow-hidden rounded-md">
                  <motion.div
                    animate={watch("blur") ? { scale: 1.1 } : { scale: 1 }}
                    style={
                      watch("blur")
                        ? { filter: `blur(${watch("blur")}px)` }
                        : undefined
                    }
                    className="relative h-full w-full"
                  >
                    <div
                      style={
                        size(bgAccents) < 2
                          ? undefined
                          : {
                              background: `linear-gradient(30deg, ${
                                bgAccents[0].hex
                              } 0%, ${
                                bgAccents[size(bgAccents) - 1].hex
                              } 100%)`,
                            }
                      }
                      className="absolute left-0 top-0 h-full w-full opacity-75"
                    />
                    <FallBackImage
                      className="h-full w-full object-cover"
                      src={previewBackground}
                    />
                  </motion.div>

                  {size(bgAccents) >= 2 && (
                    <>
                      <p className="absolute top-0 flex w-full flex-row justify-center gap-2 pt-2 text-center text-lightText opacity-75 dark:text-lightText-darkMode">
                        <span>Accent gradient was applied.</span>
                        <Tooltip text="We automatically apply calculated gradients to your servers banner based on the best matching colors.">
                          <FontAwesomeIcon icon={faInfoCircle} />
                        </Tooltip>
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <ButtonCluster
            isInPanel
            buttons={[
              {
                text: `Disable Custom Background`,
                onClick: onDisableBackground,
                icon: faToggleOff,
              },
              {
                submitType: true,
                text: `Save Settings`,
                icon: faSave,
                feature: ButtonFeature.save,
              },
            ]}
          />
        </form>
      </Modal>
    </>
  );
};

export default ServerTabSettings;
