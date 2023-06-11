import dayjs from 'dayjs';
import { ChatInputCommandInteraction, EmbedBuilder, PermissionsString } from 'discord.js';
import { createRequire } from 'node:module';

import { Emoji, toColors, toOutLabelsColors } from '../../constants/emoji.js';
import { VisualizeOption } from '../../enums/index.js';
import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { ClientUtils, InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';

const require = createRequire(import.meta.url);
const QuickChart = require('quickchart-js');

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
    /** 凡例 */
    const keys: Array<string> = Object.keys(Emoji);
    const colors: Array<string> = Object.values(Emoji).map(toColors);
    const outLabelsColors: Array<string> = Object.values(Emoji).map(toOutLabelsColors);

    switch (args.option) {
      case VisualizeOption.PIE: {
        const chart = new QuickChart();
        let data = {};
        for (const value of Object.values(Emoji)) {
          data[value] = 0;
        }
        let kintais = await ClientUtils.getKintaisSinceDate(
          intr.client,
          // TODO: 期間を引数で変更可能に
          dayjs(new Date()).subtract(12, 'month').toDate(),
          [intr.user.toString()]
        );
        for (const kintai of kintais) {
          data[kintai.emoji]++;
        }
        chart
          .setConfig({
            type: 'outlabeledPie',
            data: {
              labels: keys,
              fontSize: 20,
              datasets: [
                {
                  data: Object.values(data),
                  backgroundColor: colors,
                },
              ],
            },
            options: {
              plugins: {
                legend: false,
                outlabels: {
                  text: '%l %v (%p)',
                  color: outLabelsColors,
                  stretch: 20,
                  font: {
                    resizable: true,
                    minSize: 12,
                    maxSize: 18,
                  },
                },
              },
            },
          })
          .setWidth(400)
          .setHeight(400);

        // TODO: descriptionを期間に
        embed = new EmbedBuilder({
          title: `${intr.user.username}`,
          description: Object.values(data)
            .map((value, index) => `${keys[index]}: ` + `${value}`)
            .join('\n'),
          image: {
            url: chart.getUrl(),
          },
        });
        break;
      }
      case VisualizeOption.BAR: {
        embed = new EmbedBuilder({
          title: 'Sorry...',
          description: 'This feature is under development.',
        });
        break;
      }
      case VisualizeOption.RADAR: {
        embed = new EmbedBuilder({
          title: 'Sorry...',
          description: 'This feature is under development.',
        });
        break;
      }
      default: {
        return;
        /*
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
        */
      }
    }

    await InteractionUtils.send(intr, embed);
  }
}
