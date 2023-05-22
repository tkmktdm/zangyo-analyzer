export const Emoji = {
  ZANGYO: 0,
  TEIJI: 1,
  YUKYU: 2,
  NOMIKAI: 3,
} as const;

export type EmojiType = (typeof Emoji)[keyof typeof Emoji];
// type Emoji = 0 | 1 | 2 | 3 と同等

export function toAlias(position: EmojiType): string {
  switch (position) {
    case Emoji.ZANGYO:
      return ':zangyo:';
    case Emoji.TEIJI:
      return ':teiji:';
    case Emoji.YUKYU:
      return ':yukyu:';
    case Emoji.NOMIKAI:
      return '🍺';
  }
}
