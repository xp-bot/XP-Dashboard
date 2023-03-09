import { IDiscordGuildsRequest, IDiscordUser } from './discord-models';

export interface IXPGuild {
  values: { [name: string]: number };
  modules: { [name: string]: boolean };
  logs: { [name: string]: string | null };
  firsts: any;
  ignored: {
    roles: string[];
    channels: string[];
    categories: string[];
  };
  boosts: {
    roles: Array<{
      id: string;
      percentage: number;
    }>;
    channels: Array<{
      id: string;
      percentage: number;
    }>;
  };
  levelroles: Array<{
    id: string;
    level: number;
  }>;
  formats: any;
  announce: {
    current: boolean;
    channelID: string | null;
    message: string;
    ping: boolean;
  };
  permissions: {
    channels: Array<{
      id: string;
      allowed: Array<string>;
    }>;
    roles: Array<{
      id: string;
      allowed: Array<string>;
    }>;
  };
  arrows: { [id: string]: number };
  leaderboard_message: {
    enabled: boolean;
    messageID: string;
    channelID: string;
  };
  premiumUser: string;
}

export interface IXPGuildMember {
  xp: number;
  settings: { [name: string]: any };
  streaks: { [name: string]: any };
}

export interface IXPUser {
  badges: any[];
  perks: any[];
  titles: any[];
  settings: {
    background: {
      bg: number;
      blur: number;
      custom: boolean;
      canvas: boolean;
    };
    language: string | null;
  };
  timestamps: any;
}

export interface IXPAPIGuild {
  xpGuild: IXPGuild;
  discordGuild: IDiscordGuildsRequest;
  serverPremium: IXPServersPremium;
}

export interface IXPServersPremium {
  premium: boolean;
  voteFree: boolean;
}

export interface IXPAPIUser {
  xpUser: IXPUser;
  discordUser: IDiscordUser;
  premium: IXPUserPremium;
  developer: boolean;
}

export interface IXPUserPremiumServers {
  servers: string[];
  voteFreeServers: string[];
}

export interface IXPUserPremium extends IXPUserPremiumServers {
  userPremium: boolean;
  serverPremium: number;
  voteFreeCount: number;
}

export interface IXPDBUserPremium {
  userID: String;
  content: IXPUserPremium;
}

export interface IXPModule {
  name: string;
  description: string;
}

export interface IXPLeaderboard {
  discordGuild: IXPLeaderboardGuild;
  isUserAdmin: boolean;
  isServerPremium: boolean;
  leaderboard: IXPLeaderboardContent;
}

export interface IXPLeaderboardGuild {
  id: string;
  icon: string | null;
  name: string;
}

export interface IXPLeaderboardUser {
  id: string;
  xp: number;
  arrowPos: number;
  username: string;
  avatar?: string;
  banner?: string;
}

export interface IXPLeaderboardContent {
  pages: number;
  pageContent: IXPLeaderboardUser[];
}

export interface IXPCommand {
  command: string;
  permissions: string[];
  category: number;
}

export interface IXPCommandNew {
  name: string;
  permissions: string[];
  helpPage: {
    page: number;
    description: string;
    usage: { description?: string; usage: string; permitted?: string };
  };
}

export interface IXPBackground {
  big: {
    top: string;
    bottom: string;
  };
  small: string;
}

export interface IXPVoicetimeLog {
  type: `voicetime`;
  time: number;
  oldXP: number;
  newXP: number;
  username: string;
}

export interface IXPLevelupLog {
  type: `levelup`;
  time: number;
  oldLevel: number;
  newLevel: number;
  username: string;
}

export interface IXPXPChangedLog {
  type: `xpchanged`;
  xpChange: number;
  oldXP: number;
  reason: string;
  username: string;
}

export interface IXPExceptionsLog {
  type: `exceptions`;
  title: string;
  content: string;
}

export interface IXPSettingsLog {
  type: `settings`;
  whatChanged: string;
  oldValue: string;
  newValue: string;
  whoChanged: string;
}

export interface IXPCommandsLog {
  type: `commands`;
  command: string;
  username: string;
}

export interface IXPDBLog {
  totalPages: number;
  page: number;
  hits: IXPLogHit[];
}

export type IXPLogHit =
  | IXPSettingsLogHit
  | IXPExceptionsLogHit
  | IXPChangedLogHit
  | IXPLevelupLogHit
  | IXPVoicetimeLogHit
  | IXPCommandsLogHit;

export interface IXPSettingsLogHit extends IXPSettingsLog {
  id: string;
  createdAt: string;
}

export interface IXPExceptionsLogHit extends IXPExceptionsLog {
  id: string;
  createdAt: string;
}

export interface IXPChangedLogHit extends IXPXPChangedLog {
  id: string;
  createdAt: string;
}

export interface IXPLevelupLogHit extends IXPLevelupLog {
  id: string;
  createdAt: string;
}

export interface IXPVoicetimeLogHit extends IXPVoicetimeLog {
  id: string;
  createdAt: string;
}

export interface IXPCommandsLogHit extends IXPCommandsLog {
  id: string;
  createdAt: string;
}

export interface IServerSettings {
  interface: {
    customBackground: IServerSettingsBackground;
  };
}

export interface IServerSettingsBackground {
  url: string;
  enabled: boolean;
  blur: number;
}

export interface IXPChange {
  name: string;
  oldValue: string;
  newValue: string;
}

export interface IXPChangedElements {
  changes: IXPChange[];
  changedBy: string;
}

export interface IXPDBUserBan {
  userID: string;
  content: IXPUserBan;
}

export interface IXPUserBan {
  types: { [key in XPBanTypes]?: boolean };
  notes?: string;
}

export type XPBanTypes =
  | `rankingcard`
  | `dashboard_login`
  | `dashboard_blog_comment_create`;
