/* eslint-disable @typescript-eslint/ban-types */
import { AxiosRequestConfig } from "axios";
import axiosApp, { axiosIlumApp } from "axios-config";
import {
  IBlogPost,
  IBlogPostComment,
  IBlogPostCommentContent,
  IBlogPostContent,
} from "models/backend/blog-models";
import { IIlumAlivePing, IIlumChart } from "models/backend/ilum-models";
import { IInboxItem } from "models/backend/inbox-interfaces";
import { IIncident, IIncidentContent } from "models/backend/incident-models";
import { RequestInit } from "next/dist/server/web/spec-extension/request";

import { IApiFailure, IApiSuccess } from "../models/api-models";
import {
  IDiscordChannel,
  IDiscordGuildsRequest,
  IDiscordRole,
  IDiscordUser,
  IDiscordUserLookup,
} from "../models/backend/discord-models";
import {
  IServerSettingsBackground,
  IXPAPIGuild,
  IXPAPIUser,
  IXPBackground,
  IXPChangedElements,
  IXPDBLog,
  IXPDBUserBan,
  IXPGuild,
  IXPLeaderboard,
  IXPUser,
  IXPUserBan,
  IXPUserPremium,
  IXPUserPremiumServers, XPCommunityExportData,
} from "../models/backend/xp-models";

const backendFetch = async <Body>(route: string, options?: RequestInit) => {
  const res = await fetch(process.env.BACKEND_DOMAIN + route, options);
  try {
    const data = await res.json();

    if (!data)
      return { message: `Could not fetch.`, success: false } as IApiFailure;

    return data as IApiSuccess<Body>;
  } catch (error) {
    return { message: `Could not fetch.`, success: false } as IApiFailure;
  }
};

const backendAxios = async <Body>(
  route: string,
  options: AxiosRequestConfig
) => {
  try {
    const { data } = await axiosApp<IApiSuccess<Body> | IApiFailure>({
      url: route,

      ...options,
    });
    return data;
  } catch (error) {
    return { message: `Could not fetch.`, success: false } as IApiFailure;
  }
};

const ilumAxios = async <Body>(route: string, options: AxiosRequestConfig) => {
  try {
    const { data } = await axiosIlumApp<Body>({
      url: route,

      ...options,
    });
    return data;
  } catch (error) {
    return undefined;
  }
};

export const apiRoutes = {
  inbox: {
    getInbox: () => {
      return backendAxios<IInboxItem[]>(`/inbox`, {
        method: `GET`,
      });
    },
    markRead: (inboxItemID: string) => {
      return backendAxios<IInboxItem[]>(`/inbox/${inboxItemID}/read`, {
        method: `PATCH`,
      });
    },
    markAllRead: () => {
      return backendAxios<IInboxItem[]>(`/inbox/*/read`, {
        method: `PATCH`,
      });
    },
    dismissItem: (inboxItemID: string) => {
      return backendAxios<IInboxItem[]>(`/inbox/${inboxItemID}`, {
        method: `DELETE`,
      });
    },
    dismissAllItems: () => {
      return backendAxios<IInboxItem[]>(`/inbox/*`, {
        method: `DELETE`,
      });
    }
  },
  ilum: {
    getIlumAPIPing: (type: `dashboard` | `backend` | `website`) => {
      return ilumAxios<IIlumChart>(`/data/ping/${type}`, {
        method: `GET`,
      });
    },
    getIlumShardAlivePings: () => {
      return ilumAxios<IIlumAlivePing[]>(`/data/shards`, {
        method: `GET`,
      });
    },
  },
  incidents: {
    getActiveIncidents: () => {
      return backendAxios<IIncident[]>(`/incident`, {
        method: `GET`,
      });
    },
    putIncident: (incident: IIncidentContent) => {
      return backendAxios<IIncident>(`/incident`, {
        method: `PUT`,
        data: incident,
      });
    },
    postIncident: (incident: IIncidentContent, incidentID: string) => {
      return backendAxios<IIncident>(`/incident/${incidentID}`, {
        method: `POST`,
        data: incident,
      });
    },
    resolveIncident: (incidentID: string) => {
      return backendAxios<IIncident>(`/incident/${incidentID}`, {
        method: `DELETE`,
      });
    },
  },
  bans: {
    getAllUserBans: () =>
      backendAxios<IXPDBUserBan[]>(`/bans/user`, {
        method: `GET`,
      }),
    getUsersBans: (userID: string) =>
      backendAxios<IXPUserBan>(`/bans/user/${userID}`, {
        method: `GET`,
      }),
    patchUsersBans: (userID: string, content: IXPUserBan) =>
      backendAxios<IXPUserBan>(`/bans/user/${userID}`, {
        method: `PATCH`,
        data: content,
      }),
    deleteUsersBans: (userID: string) =>
      backendAxios<IXPUserBan>(`/bans/user/${userID}`, {
        method: `DELETE`,
      }),
  },
  blog: {
    createPost: (blogPost: IBlogPostContent) => {
      return backendAxios<IBlogPost>(`/blog/post`, {
        method: `PUT`,
        data: blogPost,
      });
    },
    updatePost: (blogPostID: string, blogPost: IBlogPostContent) => {
      return backendAxios<IBlogPost>(`/blog/post/${blogPostID}`, {
        method: `PATCH`,
        data: blogPost,
      });
    },
    deletePost: (blogPostID: string) => {
      return backendAxios<IBlogPost>(`/blog/post/${blogPostID}`, {
        method: `DELETE`,
      });
    },
    deleteComment: (blogPostID: string, commentID: string) => {
      return backendAxios<boolean>(
        `/blog/post/${blogPostID}/comment/${commentID}`,
        {
          method: `DELETE`,
        }
      );
    },
    publishPostToDiscord: (blogPostID: string) => {
      return backendAxios<IBlogPost>(`/blog/post/${blogPostID}/postDiscord`, {
        method: `GET`,
      });
    },
    postComment: (
      blogPostID: string,
      comment: IBlogPostCommentContent,
      parentCommentId?: string
    ) => {
      return backendAxios<IBlogPostComment>(
        `/blog/post/${blogPostID}/comment${parentCommentId ? `?parent_id=${parentCommentId}` : ``
        }`,
        {
          method: `PUT`,
          data: comment,
        }
      );
    },
    get: {
      posts: () => {
        return backendAxios<IBlogPost[]>(`/blog/posts`, {
          method: `GET`,
        });
      },
      postComments: (blogPostID: string) => {
        return backendAxios<IBlogPostComment[]>(
          `/blog/post/${blogPostID}/comments`,
          {
            method: `GET`,
          }
        );
      },
      specificPost: (blogPostID: string) => {
        return backendAxios<IBlogPost>(`/blog/post/${blogPostID}`, {
          method: `GET`,
        });
      },
    },
    guild: {
      get: (guildID: string) =>
        backendAxios<IXPAPIGuild>(`/semi/guild/${guildID}`, {
          method: `GET`,
        }),
    },
  },
  semi: {
    me: () =>
      backendAxios<IXPAPIUser>(`/semi/me`, {
        method: `GET`,
      }),
    guild: {
      get: (guildID: string) =>
        backendAxios<IXPAPIGuild>(`/semi/guild/${guildID}`, {
          method: `GET`,
        }),
      isUserAuthorized: (guildID: string) =>
        backendAxios<boolean>(`/semi/guild/${guildID}/authorized`, {
          method: `GET`,
        }),
    },
  },
  discord: {
    me: () =>
      backendAxios<IDiscordUser>(`/discord/me`, {
        method: `GET`,
      }),
    lookupUser: (userID: string) =>
      backendAxios<IDiscordUserLookup>(`/discord/lookup/${userID}`, {
        method: `GET`,
      }),
    guilds: (allGuilds?: boolean) =>
      backendAxios<IDiscordGuildsRequest[]>(`/discord/guilds`, {
        method: `GET`,
        headers: { allGuilds },
      }),
    guild: {
      channels: (guildID: string) =>
        backendAxios<IDiscordChannel[]>(`/discord/guild/${guildID}/channels`, {
          method: `GET`,
        }),
      textChannels: (guildID: string) =>
        backendAxios<IDiscordChannel[]>(
          `/discord/guild/${guildID}/textchannels`,
          {
            method: `GET`,
          }
        ),
      roles: (guildID: string) =>
        backendAxios<IDiscordRole[]>(`/discord/guild/${guildID}/roles`, {
          method: `GET`,
        }),
    },
  },
  xp: {
    me: {
      background: {
        get: () =>
          backendAxios<IXPBackground>(`/xp/me/background`, {
            method: `GET`,
          }),
        post: (background: { image: string }) =>
          backendAxios<{}>(`/xp/me/background`, {
            method: `POST`,
            data: background,
          }),
      },
      premium: {
        get: () =>
          backendAxios<IXPUserPremium>(`/xp/me/premium`, {
            method: `GET`,
          }),
        postServers: (content: Partial<IXPUserPremiumServers>) =>
          backendAxios<IXPUserPremium>(`/xp/me/premium/servers`, {
            method: `POST`,
            data: content,
          }),
      },
      post: (user: IXPUser) =>
        backendAxios<IXPUser>(`/xp/me`, {
          method: `POST`,
          data: user,
        }),
    },
    leaderboard: {
      getPage: (guildID: string, page: number) =>
        backendAxios<IXPLeaderboard>(
          `/xp/guild/${guildID}/leaderboard?page=${page}`,
          {
            method: `GET`,
          }
        ),
    },
    guild: {
      getExport: (guildID: string) =>
          backendAxios<XPCommunityExportData>(`/xp/guild/${guildID}/export`, {
            method: `GET`,
          }),
      getLogs: (guildID: string, page = 1, query?: string) =>
          backendAxios<IXPDBLog>(`/xp/guild/${guildID}/logs`, {
            method: `GET`,
            params: { query, page },
          }),
      guildMember: {
        setGuildMembersXP: (guildID: string, userID: string, xp: number) =>
          backendAxios<{}>(`/xp/guild/${guildID}/member/${userID}/xp/${xp}`, {
            method: `POST`,
          }),
      },
      settings: {
        background: {
          get: (guildID: string) =>
            backendAxios<IServerSettingsBackground>(
              `/settings/${guildID}/background`,
              {
                method: `GET`,
              }
            ),
          post: (guildID: string, content: IServerSettingsBackground) =>
            backendAxios<IServerSettingsBackground>(
              `/settings/${guildID}/background`,
              {
                method: `POST`,
                data: content,
              }
            ),
        },
      },
      get: (guildID: string, fetch?: boolean) =>
        fetch
          ? backendFetch<IXPGuild>(`/xp/guild/${guildID}`, {
            method: `GET`,
          })
          : backendAxios<IXPGuild>(`/xp/guild/${guildID}`, {
            method: `GET`,
          }),
      update: (
        guildID: string,
        body: Partial<IXPGuild>,
        changes?: IXPChangedElements
      ) =>
        backendAxios<IXPGuild>(`/xp/guild/${guildID}`, {
          method: `POST`,
          data: { ...body, changedElements: changes },
        }),
    },
  },
};
