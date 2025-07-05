import * as playniteGameRepo from './playnite-game/playnite-game-repository';
import * as developerRepo from './developer/developer-repository';
import * as genreRepo from './genre/genre-repository';
import * as platformRepo from './platform/platform-repository';
import * as publisherRepo from './publisher/publisher-repository';
import * as playniteLibrarySyncRepo from './playnite-library-sync/playnite-library-sync-repository';

export const repositories = {
	playniteGame: playniteGameRepo,
	developer: developerRepo,
	genre: genreRepo,
	platform: platformRepo,
	publisher: publisherRepo,
	playniteLibrarySync: playniteLibrarySyncRepo
};
