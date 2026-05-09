import { beforeEach, describe, expect, it } from "vitest";
import { testApi } from "../../../../vitest.global.setup";

describe.skip("Run Based Score Engine / Evidence Extractor", () => {
	beforeEach(() => {
		testApi.seed.seedGameRelationships(testApi.data.getGameRelationshipOptions());
	});

	// Used for manual output inspection (for now)
	it("extract evidences from text", () => {
		// Arrange
		const playniteSnapshot = testApi.factory.getGameFactory().buildPlayniteSnapshot({
			description: `<p class="bb_paragraph"><span class="bb_img_ctn"><img src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2444750/extras/7a29bbf561bbd655cacc43402ea00a94.poster.avif?t=1766041884"></span></p><p class="bb_paragraph"><strong>Seja, você, o pesadelo. Domine o sonho. Quebre a realidade.</strong></p><p class="bb_paragraph"><strong>Shape of Dreams</strong> é um roguelite de ação que combina combates hack and slash, jogabilidade em equipe estilo MOBA e infinitas mudanças estratégicas.</p><p class="bb_paragraph">Viajando pelo mundo surreal dos sonhos, cada batalha testa seus reflexos e cada escolha determina seu destino.</p><p class="bb_paragraph">Enfrente um desafio técnico intenso sozinho ou lute em cooperação em tempo real com até 3 amigos, improvisando diferentes estilos de combate e completando configurações poderosas para se tornar o pesadelo que seus inimigos temem.</p><p class="bb_paragraph">Os sonhos deste lugar curvam-se apenas àqueles que têm o poder de moldar formas.</p><p class="bb_paragraph">Crie combinações devastadoras usando habilidades em constante mudança e efeitos de fortalecimento, supere desafios aparentemente impossíveis e desbrave seu próprio caminho da evolução.</p><p class="bb_paragraph">Nenhum desafio é igual ao outro e nenhuma "meta" única pode levá-lo à vitória.</p><h2 class="bb_tag">Por que jogar</h2><p class="bb_paragraph"><strong>Ponto de partida profundo</strong> | 8 viajantes, 8 mundos e batalhas contra chefes únicos.</p><p class="bb_paragraph"><span class="bb_img_ctn"><img class="bb_img" src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2444750/extras/6f0d88b9f7d49ab8f762b267e64868fd.avif?t=1766041884"></span></p><p class="bb_paragraph"><span class="bb_img_ctn"><img class="bb_img" src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2444750/extras/1cabaf844da4bc73e0345c5b16dbcd08.avif?t=1766041884"></span></p><p class="bb_paragraph"><strong>Vale a pena jogar de novo</strong> | A cada novo jogo, você precisará adaptar suas táticas a uma progressão completamente diferente. Você pode experimentar uma diversão repaginada a cada partida com quatro níveis de dificuldade, elementos do Sonho Lúcido e infinitas combinações de configurações.</p><p class="bb_paragraph"><span class="bb_img_ctn"><img class="bb_img" src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2444750/extras/90707798ad5333e2ecc3fc0908242cb7.avif?t=1766041884"></span></p><p class="bb_paragraph"><span class="bb_img_ctn"><img src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2444750/extras/f790da434d21d2e0f229703ed30ef5ff.poster.avif?t=1766041884"></span></p><p class="bb_paragraph"><strong>Jogo Solo &amp; Cooperação disponíveis</strong> | Combates intensos baseados em habilidade no modo solo, e jogos caóticos com sinergia explosiva ao cooperar com até 4 jogadores.</p><p class="bb_paragraph"><span class="bb_img_ctn"><img class="bb_img" src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2444750/extras/a2eba3d3a102533b5d178eb72082a9f7.avif?t=1766041884"></span></p><p class="bb_paragraph"></p><p class="bb_paragraph"><strong>Mais do que um simples roguelite</strong> | Experimente a experiência roguelite única de Shape of Dreams com combates de miras precisas, personalização livre e emocionante jogabilidade cooperativa.</p><h2 class="bb_tag">Experiência de Jogar Shape of Dreams</h2><ul class="bb_ul"><li><p class="bb_paragraph">8 viajantes jogáveis com mecânicas de combate e rotas de desenvolvimento originais</p></li><li><p class="bb_paragraph">Mais de 150 memórias e Essências para personalizar personagens e modificar habilidades</p></li><li><p class="bb_paragraph">9 Sonhos Lúcidos que reinventam níveis de dificuldade</p></li><li><p class="bb_paragraph">Mais de 50 Emotes &amp; Insígnias para personalizar seu viajante de forma única</p></li><li><p class="bb_paragraph">8 mundos com segredos e chefes e monstros meticulosamente planejados</p></li></ul><p class="bb_paragraph"><strong>O sonho te aguarda. Seja, você, o pesadelo.</strong></p>`,
		});
		const game = testApi.factory.getGameFactory().build({ playniteSnapshot });

		testApi.seed.seedGame(game);

		// Act
		const evidences = testApi.gameLibrary.scoreEngine.evidenceExtractors
			.getRunBasedEvidenceExtractor()
			.extract(game, { genres: new Map(), tags: new Map() });

		// Assert
		console.log(evidences);
		expect(true).toBe(true);
	});
});
