// place files you want to import through the `$lib` alias in this folder.

import { repositories as repos } from './repositories';
export const repositories = repos;

import { config as configuration } from './config';
export const config = { ...configuration };

import * as logService from './services/log';
import * as builtServices from './services/setup';

export const services = {
	log: logService,
	libraryManifest: builtServices.libraryManifestService,
	playniteLibraryImport: builtServices.playniteLibraryImporterService
};
