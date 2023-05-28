import dayjs from 'dayjs';
import {
  ApplicationCommand,
  Channel,
  ChannelType,
  Client,
  DiscordAPIError,
  RESTJSONErrorCodes as DiscordApiErrors,
  Guild,
  GuildMember,
  Locale,
  Message,
  NewsChannel,
  Role,
  StageChannel,
  TextChannel,
  User,
  VoiceChannel,
} from 'discord.js';
import { createRequire } from 'node:module';

import { PermissionUtils, RegexUtils } from './index.js';
import { DiscordLimits, Emoji, EmojiType, toAlias } from '../constants/index.js';
import { KintaiRepositoryFactory } from '../factory/kintai-repository-factory.js';
import { Kintai } from '../models/kintai.js';
import { Lang } from '../services/index.js';

const FETCH_MEMBER_LIMIT = 20;
const IGNORED_ERRORS = [
  DiscordApiErrors.UnknownMessage,
  DiscordApiErrors.UnknownChannel,
  DiscordApiErrors.UnknownGuild,
  DiscordApiErrors.UnknownMember,
  DiscordApiErrors.UnknownUser,
  DiscordApiErrors.UnknownInteraction,
  DiscordApiErrors.MissingAccess,
];

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');

export class ClientUtils {
  public static async getGuild(client: Client, discordId: string): Promise<Guild> {
    discordId = RegexUtils.discordId(discordId);
    if (!discordId) {
      return;
    }

    try {
      return await client.guilds.fetch(discordId);
    } catch (error) {
      if (
        error instanceof DiscordAPIError &&
        typeof error.code == 'number' &&
        IGNORED_ERRORS.includes(error.code)
      ) {
        return;
      } else {
        throw error;
      }
    }
  }

  public static async getChannel(client: Client, discordId: string): Promise<Channel> {
    discordId = RegexUtils.discordId(discordId);
    if (!discordId) {
      return;
    }

    try {
      return await client.channels.fetch(discordId);
    } catch (error) {
      if (
        error instanceof DiscordAPIError &&
        typeof error.code == 'number' &&
        IGNORED_ERRORS.includes(error.code)
      ) {
        return;
      } else {
        throw error;
      }
    }
  }

  public static async getUser(client: Client, discordId: string): Promise<User> {
    discordId = RegexUtils.discordId(discordId);
    if (!discordId) {
      return;
    }

    try {
      return await client.users.fetch(discordId);
    } catch (error) {
      if (
        error instanceof DiscordAPIError &&
        typeof error.code == 'number' &&
        IGNORED_ERRORS.includes(error.code)
      ) {
        return;
      } else {
        throw error;
      }
    }
  }

  public static async findAppCommand(client: Client, name: string): Promise<ApplicationCommand> {
    let commands = await client.application.commands.fetch();
    return commands.find(command => command.name === name);
  }

  public static async findMember(guild: Guild, input: string): Promise<GuildMember> {
    try {
      let discordId = RegexUtils.discordId(input);
      if (discordId) {
        return await guild.members.fetch(discordId);
      }

      let tag = RegexUtils.tag(input);
      if (tag) {
        return (await guild.members.fetch({ query: tag.username, limit: FETCH_MEMBER_LIMIT })).find(
          member => member.user.discriminator === tag.discriminator
        );
      }

      return (await guild.members.fetch({ query: input, limit: 1 })).first();
    } catch (error) {
      if (
        error instanceof DiscordAPIError &&
        typeof error.code == 'number' &&
        IGNORED_ERRORS.includes(error.code)
      ) {
        return;
      } else {
        throw error;
      }
    }
  }

  public static async findRole(guild: Guild, input: string): Promise<Role> {
    try {
      let discordId = RegexUtils.discordId(input);
      if (discordId) {
        return await guild.roles.fetch(discordId);
      }

      let search = input.trim().toLowerCase().replace(/^@/, '');
      let roles = await guild.roles.fetch();
      return (
        roles.find(role => role.name.toLowerCase() === search) ??
        roles.find(role => role.name.toLowerCase().includes(search))
      );
    } catch (error) {
      if (
        error instanceof DiscordAPIError &&
        typeof error.code == 'number' &&
        IGNORED_ERRORS.includes(error.code)
      ) {
        return;
      } else {
        throw error;
      }
    }
  }

  public static async findTextChannel(
    guild: Guild,
    input: string
  ): Promise<NewsChannel | TextChannel> {
    try {
      let discordId = RegexUtils.discordId(input);
      if (discordId) {
        let channel = await guild.channels.fetch(discordId);
        if (channel instanceof NewsChannel || channel instanceof TextChannel) {
          return channel;
        } else {
          return;
        }
      }

      let search = input.trim().toLowerCase().replace(/^#/, '').replaceAll(' ', '-');
      let channels = [...(await guild.channels.fetch()).values()]
        .filter(channel => channel instanceof NewsChannel || channel instanceof TextChannel)
        .map(channel => channel as NewsChannel | TextChannel);
      return (
        channels.find(channel => channel.name.toLowerCase() === search) ??
        channels.find(channel => channel.name.toLowerCase().includes(search))
      );
    } catch (error) {
      if (
        error instanceof DiscordAPIError &&
        typeof error.code == 'number' &&
        IGNORED_ERRORS.includes(error.code)
      ) {
        return;
      } else {
        throw error;
      }
    }
  }

  public static async findVoiceChannel(
    guild: Guild,
    input: string
  ): Promise<VoiceChannel | StageChannel> {
    try {
      let discordId = RegexUtils.discordId(input);
      if (discordId) {
        let channel = await guild.channels.fetch(discordId);
        if (channel instanceof VoiceChannel || channel instanceof StageChannel) {
          return channel;
        } else {
          return;
        }
      }

      let search = input.trim().toLowerCase().replace(/^#/, '');
      let channels = [...(await guild.channels.fetch()).values()]
        .filter(channel => channel instanceof VoiceChannel || channel instanceof StageChannel)
        .map(channel => channel as VoiceChannel | StageChannel);
      return (
        channels.find(channel => channel.name.toLowerCase() === search) ??
        channels.find(channel => channel.name.toLowerCase().includes(search))
      );
    } catch (error) {
      if (
        error instanceof DiscordAPIError &&
        typeof error.code == 'number' &&
        IGNORED_ERRORS.includes(error.code)
      ) {
        return;
      } else {
        throw error;
      }
    }
  }

  public static async findNotifyChannel(
    guild: Guild,
    langCode: Locale
  ): Promise<TextChannel | NewsChannel> {
    // Prefer the system channel
    let systemChannel = guild.systemChannel;
    if (systemChannel && PermissionUtils.canSend(systemChannel, true)) {
      return systemChannel;
    }

    // Otherwise look for a bot channel
    return (await guild.channels.fetch()).find(
      channel =>
        (channel instanceof TextChannel || channel instanceof NewsChannel) &&
        PermissionUtils.canSend(channel, true) &&
        Lang.getRegex('channelRegexes.bot', langCode).test(channel.name)
    ) as TextChannel | NewsChannel;
  }

  /**
   * 検索対象Messageの一番はじめに出てくるEmojiTypeを返す
   * @param message - 検索対象Message
   * @returns EmojiType | null
   */
  private static getIncludedEmojiType(message: Message): EmojiType | null {
    const emojis = Object.values(Emoji);
    let emojiType: EmojiType | null = null;
    let minIndex = Infinity;
    for (const emoji of emojis) {
      const alias = toAlias(emoji);
      const condition = (e): boolean => {
        return message.content.includes(e);
      };
      if (alias.some(condition)) {
        const aliasIndex = alias.findIndex(condition);
        const contentIndex = message.content.indexOf(alias[aliasIndex]);
        if (minIndex > contentIndex) {
          minIndex = contentIndex;
          emojiType = emoji;
        }
      }
    }
    return emojiType;
  }

  /**
   * 勤怠のキャッシュを作成して保存後、最新の勤怠のリストを返す
   * @param client
   * @returns Promise<Array<Kintai>>
   */
  private static async createKintaisCache(client: Client): Promise<Array<Kintai>> {
    const kintaiRepository = KintaiRepositoryFactory.getInstance();
    let kintaisCache: Array<Kintai> = await kintaiRepository.findAll();
    const dummy = { date: new Date(0), author: '', emoji: 0 };
    let lastKintaiCache: Kintai = kintaisCache.length ? kintaisCache[0] : dummy;

    // Channel取得
    let channel: Channel;
    try {
      channel = client.channels.cache.get(Config.channelId) as TextChannel;
      if (channel.type.valueOf() !== ChannelType.GuildText) {
        throw Error('The specified channel is not text channel.');
      }
    } catch (error) {
      if (
        error instanceof DiscordAPIError &&
        typeof error.code == 'number' &&
        IGNORED_ERRORS.includes(error.code)
      ) {
        return;
      } else {
        console.log(error);
        throw error;
      }
    }

    /** 取得したMessageの中で一番古いもの */
    let before: Message | null = null;
    /** 大域脱出用一時変数 */
    let exitSignal = false;
    let newKintais = [];
    do {
      // MESSAGE_FETCH_LIMIT個のMessageをfetch
      const messages = await channel.messages.fetch({
        limit: DiscordLimits.MESSAGE_FETCH_LIMIT,
        before: before ? before.id : null,
      });
      before = 0 < messages.size ? messages.at(messages.size - 1) : null;

      messages.forEach(message => {
        const emojiType = this.getIncludedEmojiType(message);
        // emojiを含んでいる
        if (Object.values(Emoji).includes(emojiType)) {
          // かつcacheが存在しないならpush
          if (dayjs(message.createdAt).isAfter(lastKintaiCache.date)) {
            newKintais.push({
              date: dayjs.utc(message.createdAt).local().toDate(),
              author: message.author.toString(),
              emoji: emojiType,
            });
          } else {
            exitSignal = true;
          }
        }
        if (exitSignal) {
          return;
        }
      });
      before = 0 < messages.size ? messages.at(messages.size - 1) : null;
      // FIX: 1回余分にループしている
    } while (before && !exitSignal);
    const kintais = newKintais.concat(kintaisCache);
    kintaiRepository.save(kintais);

    return kintais;
  }

  /**
   * authorsに含まれる人物の勤怠をフィルタ O(n)
   * @param kintais - 勤怠のリスト
   * @param authors - authorのリスト
   * @returns Array<Kintai>
   */
  private static filterKintaisByAuthor(
    kintais: Array<Kintai>,
    authors: Array<string>
  ): Array<Kintai> {
    const filtered = kintais.filter(kintai => {
      return authors.includes(kintai.author);
    });
    return filtered;
  }

  /**
   * 指定日以降の勤怠をフィルタ O(logn)
   * @param kintais - 勤怠のリスト
   * @param date - 指定日
   * @returns Array<Kintai>
   */
  private static binarySearchKintaisSince(kintais: Array<Kintai>, date: Date): Array<Kintai> {
    /** 条件に当てはまるKintaiのindex */
    let ok = -1;
    /** 条件に当てはまらないKintaiのindex */
    let ng = kintais.length;
    while (Math.floor((ng - ok) / 2) > 1) {
      let mid = Math.floor((ok + ng) / 2);
      if (dayjs(kintais[mid].date).isAfter(date)) {
        ok = mid;
      } else {
        ng = mid;
      }
    }

    if (ok < 0) {
      return [];
    } else {
      return kintais.slice(0, ok);
    }
  }

  // TODO: 同日内の重複をなくす(:beer:は他のEmojiと重複可能)
  public static async getKintaisSinceDate(
    client: Client,
    date: Date,
    authors: Array<string>
  ): Promise<Array<Kintai>> {
    let kintais = await this.createKintaisCache(client);
    return this.filterKintaisByAuthor(this.binarySearchKintaisSince(kintais, date), authors);
  }
}
