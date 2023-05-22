import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';

import { HelpOption, InfoOption, VisualizeOption } from '../enums/index.js';
import { Language } from '../models/enum-helpers/index.js';
import { Lang } from '../services/index.js';

export class Args {
  public static readonly HELP_OPTION: APIApplicationCommandBasicOption = {
    name: Lang.getRef('arguments.option', Language.Default),
    name_localizations: Lang.getRefLocalizationMap('arguments.option'),
    description: Lang.getRef('argDescs.helpOption', Language.Default),
    description_localizations: Lang.getRefLocalizationMap('argDescs.helpOption'),
    type: ApplicationCommandOptionType.String,
    choices: [
      {
        name: Lang.getRef('helpOptionDescs.commands', Language.Default),
        name_localizations: Lang.getRefLocalizationMap('helpOptionDescs.commands'),
        value: HelpOption.COMMANDS,
      },
    ],
  };
  public static readonly INFO_OPTION: APIApplicationCommandBasicOption = {
    name: Lang.getRef('arguments.option', Language.Default),
    name_localizations: Lang.getRefLocalizationMap('arguments.option'),
    description: Lang.getRef('argDescs.helpOption', Language.Default),
    description_localizations: Lang.getRefLocalizationMap('argDescs.helpOption'),
    type: ApplicationCommandOptionType.String,
    choices: [
      {
        name: Lang.getRef('infoOptions.about', Language.Default),
        name_localizations: Lang.getRefLocalizationMap('infoOptions.about'),
        value: InfoOption.ABOUT,
      },
      {
        name: Lang.getRef('infoOptions.dev', Language.Default),
        name_localizations: Lang.getRefLocalizationMap('infoOptions.dev'),
        value: InfoOption.DEV,
      },
    ],
  };
  public static readonly VISUALIZE_OPTION: APIApplicationCommandBasicOption = {
    name: Lang.getRef('arguments.option', Language.Default),
    name_localizations: Lang.getRefLocalizationMap('arguments.option'),
    description: Lang.getRef('argDescs.helpOption', Language.Default),
    description_localizations: Lang.getRefLocalizationMap('argDescs.helpOption'),
    type: ApplicationCommandOptionType.String,
    choices: [
      {
        name: Lang.getRef('visualizeOptions.pie', Language.Default),
        name_localizations: Lang.getRefLocalizationMap('visualizeOptions.pie'),
        value: VisualizeOption.PIE,
      },
      {
        name: Lang.getRef('visualizeOptions.bar', Language.Default),
        name_localizations: Lang.getRefLocalizationMap('visualizeOptions.bar'),
        value: VisualizeOption.BAR,
      },
      {
        name: Lang.getRef('visualizeOptions.radar', Language.Default),
        name_localizations: Lang.getRefLocalizationMap('visualizeOptions.radar'),
        value: VisualizeOption.RADAR,
      },
    ],
  };
}
