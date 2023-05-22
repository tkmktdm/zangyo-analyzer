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

  private async createMessageCache(client: Client): Promise<void> {
    client;
  }

  private static getIncludedEmojiType(message: Message): EmojiType | null {
    const emojis = Object.values(Emoji);
    let emojiType: EmojiType | null = null;
    let minIndex = Infinity;
    for (const emoji of emojis) {
      const alias = toAlias(emoji);
      if (message.content.includes(alias)) {
        const index = message.content.indexOf(alias);
        if (minIndex > index) {
          minIndex = index;
          emojiType = emoji;
        }
      }
    }
    return emojiType;
  }

  //特定日時以降の[date:(ユーザ、スタンプ)]のarrayがほしい
  public static async getKintaisSinceDate(client: Client, date: Date): Promise<any> {
    //createMessageCache
    date;
    const kintaiRepository = KintaiRepositoryFactory.getInstance();
    console.log(kintaiRepository.findAll());

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
    let kintais: Array<Kintai> = [];
    // 続けるかどうかは、最新のメッセージの日時で比較
    // そのために、シリアライズしたファイルは日時でソートしておく
    let before: Message | null = null;
    // TODO: cache読み込み
    do {
      // MESSAGE_FETCH_LIMIT個messageをfetch
      const messages = await channel.messages.fetch({
        limit: DiscordLimits.MESSAGE_FETCH_LIMIT,
        before: before ? before.id : null,
      });
      before = 0 < messages.size ? messages.at(messages.size - 1) : null;
      console.log(messages.size);

      // emojiを含んでいたらpush
      messages.forEach(message => {
        const emojiType = this.getIncludedEmojiType(message);
        if (Object.values(Emoji).includes(emojiType)) {
          kintais.push({
            date: message.createdAt,
            author: message.author.toString(),
            emoji: emojiType,
          });
        }
      });

      before = 0 < messages.size ? messages.at(messages.size - 1) : null;
      // TODO: cacheの最新日時まで達していたらloop終了してcache作成
      // FIX: 1回余分にループしている
    } while (before);
    //cache作成
    kintaiRepository.save(kintais)

    return kintais.toString().slice(0, DiscordLimits.EMBED_FIELD_VALUE_LENGTH);
  }
}
