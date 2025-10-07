import { faker } from "@faker-js/faker";
import { type GameNote } from "@playnite-insights/lib/client";

export class GameNoteFactory {
  private buildNote = (props: Partial<GameNote> = {}): GameNote => {
    const now = new Date();
    return {
      Id: faker.string.uuid(),
      GameId: faker.helpers.arrayElement([faker.string.uuid(), null]),
      SessionId: faker.helpers.arrayElement([faker.string.uuid(), null]),
      Title: faker.lorem.sentence(),
      Content: faker.lorem.paragraphs({ min: 1, max: 4 }),
      ImagePath: faker.image.url(),
      CreatedAt: now.toISOString(),
      DeletedAt: faker.helpers.arrayElement([null, now.toISOString()]),
      LastUpdatedAt: faker.helpers.arrayElement([
        now.toISOString(),
        faker.date.future().toISOString(),
      ]),
      ...props,
    };
  };

  getNote = (props: Partial<GameNote> = {}): GameNote => {
    return this.buildNote(props);
  };

  getNotes = (count: number, props: Partial<GameNote> = {}): GameNote[] => {
    const notes = Array.from({ length: count }, () => this.buildNote(props));
    return notes;
  };
}
