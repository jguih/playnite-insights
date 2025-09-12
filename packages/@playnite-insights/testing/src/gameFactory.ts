import { faker } from "@faker-js/faker";
import type { FullGame } from "@playnite-insights/lib/client";

export class FullGameFactory {
  private buildGame = ({ ...props }: Partial<FullGame> = {}): FullGame => {
    return {
      Id: props?.Id ?? faker.string.uuid(),
      Name: props?.Name ?? faker.commerce.productName(),
      Description: props?.Description ?? faker.lorem.sentence(),
      ReleaseDate: props?.ReleaseDate ?? faker.date.past().toISOString(),
      Playtime: props?.Playtime ?? faker.number.int({ min: 0, max: 500 }),
      LastActivity: props?.LastActivity ?? faker.date.recent().toISOString(),
      Added: props?.Added ?? faker.date.past().toISOString(),
      InstallDirectory: props?.InstallDirectory ?? faker.system.directoryPath(),
      IsInstalled:
        typeof props?.IsInstalled === "number"
          ? props.IsInstalled
          : faker.helpers.arrayElement([0, 1]),
      BackgroundImage: props?.BackgroundImage ?? faker.image.url(),
      CoverImage: props?.CoverImage ?? faker.image.url(),
      Icon: props?.Icon ?? faker.image.url(),
      ContentHash:
        props?.ContentHash ?? faker.string.hexadecimal({ length: 32 }),
      Developers:
        props?.Developers ??
        Array.from({ length: 5 }, () => faker.company.name()),
      Publishers:
        props?.Publishers ??
        Array.from({ length: 5 }, () => faker.company.name()),
      Genres: props?.Genres ?? [
        ...faker.helpers.arrayElements([
          "Action",
          "RPG",
          "Strategy",
          "Adventure",
        ]),
      ],
      Platforms: props?.Platforms ?? [
        faker.helpers.arrayElement(["PC", "Linux", "Xbox", "PS"]),
      ],
    };
  };

  getGame = ({ ...props }: Partial<FullGame> = {}): FullGame => {
    return this.buildGame({ ...props });
  };

  getGames = (
    count: number,
    { ...props }: Partial<FullGame> = {}
  ): FullGame[] => {
    const games = Array.from({ length: count }, () =>
      this.buildGame({ ...props })
    );
    return games;
  };
}
