// place files you want to import through the `$lib` alias in this folder.

import { repositories as _repositories } from './repositories';
export const repositories = _repositories;

import { config as _config } from './config';
export const config = _config;

import * as builtServices from './services/setup';

export const services = {
	log: builtServices.logService,
	libraryManifest: builtServices.libraryManifestService,
	playniteLibraryImport: builtServices.playniteLibraryImporterService
};
