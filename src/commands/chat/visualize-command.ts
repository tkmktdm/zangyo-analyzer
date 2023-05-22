import dayjs from 'dayjs';
import { ChatInputCommandInteraction, EmbedBuilder, PermissionsString } from 'discord.js';

import { VisualizeOption } from '../../enums/index.js';
import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { ClientUtils, InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';

export class VisualizeCommand implements Command {
  public names = [Lang.getRef('chatCommands.visualize', Language.Default)];
  public deferType = CommandDeferType.PUBLIC;
  public requireClientPerms: PermissionsString[] = [];
  public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
    let args = {
      option: intr.options.getString(
        Lang.getRef('arguments.option', Language.Default)
      ) as VisualizeOption,
    };

    let embed: EmbedBuilder;
    switch (args.option) {
      case VisualizeOption.STRICT: {
        // TODO:

        embed = new EmbedBuilder({
          title: 'hoge',
          description: 'fuga',
          fields: [
            {
              name: 'test',
              value: await ClientUtils.getKintaisSinceDate(
                intr.client,
                dayjs(new Date()).subtract(1, 'month').toDate(),
                [intr.user.toString()]
              ),
            },
          ],
        });
        break;
      }
      default: {
        // TODO:
        embed = new EmbedBuilder({
          title: 'hoge',
          description: 'fuga',
          fields: [
            {
              name: 'test',
              value: await ClientUtils.getKintaisSinceDate(
                intr.client,
                dayjs(new Date()).subtract(1, 'month').toDate(),
                [intr.user.toString()]
              ),
            },
          ],
        });
      }
    }

    await InteractionUtils.send(intr, embed);
  }
}
