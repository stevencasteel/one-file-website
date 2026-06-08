const PORTFOLIO_BASE = "https://www.stevencasteel.com/assets/portfolio/";
const INTERESTS_BASE = "https://www.stevencasteel.com/assets/interests/";

const RELATIVE_MISC_ART = [
  "clickbait_thumbnails/clickbait_22.avif",
  "clickbait_thumbnails/clickbait_35.avif",
  "clickbait_thumbnails/clickbait_37.avif",
  "clickbait_thumbnails/clickbait_38.avif",
  "clickbait_thumbnails/clickbait_49.avif",
  "elf_chartreuse/ec_001.avif",
  "elf_chartreuse/ec_002.avif",
  "elf_chartreuse/ec_007.avif",
  "elf_chartreuse/ec_076.avif",
  "elf_chartreuse/ec_089.avif",
  "elf_girls/elf_girl_002.avif",
  "elf_girls/elf_girl_018.avif",
  "elf_girls/elf_girl_035.avif",
  "elf_girls/elf_girl_043.avif",
  "elf_girls/elf_girl_044.avif",
  "elf_girls/elf_girl_045.avif",
  "elf_girls/elf_girl_047.avif",
  "elf_girls/elf_girl_048.avif",
  "elf_girls/elf_girl_057.avif",
  "elf_girls/elf_girl_066.avif",
  "elf_girls/elf_girl_114.avif",
  "elf_girls/elf_girl_116.avif",
  "elf_girls/elf_girl_146.avif",
  "elf_girls/elf_girl_184.avif",
  "elf_girls/elf_girl_207.avif",
  "elf_girls/elf_girl_272.avif",
  "elf_girls/elf_girl_278.avif",
  "elf_girls/elf_girl_296.avif",
  "elf_nocturne/elf_noc_01.avif",
  "elf_nocturne/elf_noc_03.avif",
  "elf_nocturne/elf_noc_08.avif",
  "elf_technomancers/et_007.avif",
  "elf_technomancers/et_023.avif",
  "elf_technomancers/et_037.avif",
  "esper_elfy/anime_screenshot/anime_screenshot_005.avif",
  "esper_elfy/anime_screenshot/anime_screenshot_016.avif",
  "esper_elfy/anime_screenshot/anime_screenshot_028.avif",
  "esper_elfy/anime_screenshot/anime_screenshot_035.avif",
  "esper_elfy/anime_screenshot/anime_screenshot_053.avif",
  "esper_elfy/anime_screenshot/anime_screenshot_058.avif",
  "esper_elfy/anime_screenshot/anime_screenshot_076.avif",
  "esper_elfy/anime_screenshot/anime_screenshot_094.avif",
  "esper_elfy/anime_screenshot/anime_screenshot_128.avif",
  "esper_elfy/anime_screenshot/anime_screenshot_166.avif",
  "esper_elfy/anime_screenshot/anime_screenshot_173.avif",
  "esper_elfy/anime_screenshot/anime_screenshot_175.avif",
  "esper_elfy/elfy_alien_planet/elfy_alien_planet_01.avif",
  "esper_elfy/elfy_alien_planet/elfy_alien_planet_05.avif",
  "esper_elfy/elfy_alien_planet/elfy_alien_planet_25.avif",
  "esper_elfy/elfy_alien_planet/elfy_alien_planet_31.avif",
  "esper_elfy/elfy_alien_planet/elfy_alien_planet_43.avif",
  "esper_elfy/elfy_exploration/elfy_exploration_003.avif",
  "esper_elfy/elfy_exploration/elfy_exploration_059.avif",
  "esper_elfy/elfy_exploration/elfy_exploration_087.avif",
  "esper_elfy/elfy_exploration/elfy_exploration_116.avif",
  "esper_elfy/elfy_exploration/elfy_exploration_119.avif",
  "esper_elfy/elfy_exploration/elfy_exploration_146.avif",
  "esper_elfy/elfy_exploration/elfy_exploration_159.avif",
  "esper_elfy/elfy_exploration/elfy_exploration_200.avif",
  "esper_elfy/elfy_exploration/elfy_exploration_219.avif",
  "esper_elfy/elfy_exploration/elfy_exploration_222.avif",
  "esper_elfy/elfy_sora2/elfy_sora2_25.avif",
  "esper_elfy/elfy_sora2/elfy_sora2_26.avif",
  "esper_elfy/elfy_sora2/elfy_sora2_35.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_001F_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_002_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_042A_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_057A_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_065_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_068_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_070_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_074B_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_078_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_081_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_099A_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_140A_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_141_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_142A_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_144_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_155_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_156_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_158_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_173_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_183_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_187_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_192A_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_200B_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_201_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_206B_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_209_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_216_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_219_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_221A_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_222_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_225_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_232_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_239_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_244_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_245_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_247_sm.avif",
  "esper_elfy/esper_elfy_character/esper_elfy_character_248_sm.avif",
  "frutiger_liminal/fru_lim_001.avif",
  "frutiger_liminal/fru_lim_005.avif",
  "frutiger_liminal/fru_lim_024.avif",
  "frutiger_liminal/fru_lim_026.avif",
  "frutiger_liminal/fru_lim_038.avif",
  "frutiger_liminal/fru_lim_039.avif",
  "frutiger_liminal/fru_lim_043.avif",
  "frutiger_liminal/fru_lim_057.avif",
  "frutiger_liminal/fru_lim_065.avif",
  "frutiger_liminal/fru_lim_109.avif",
  "frutiger_liminal/fru_lim_120.avif",
  "frutiger_liminal/fru_lim_122.avif",
  "frutiger_liminal/fru_lim_123.avif",
  "frutiger_liminal/fru_lim_129.avif",
  "frutiger_liminal/fru_lim_131.avif",
  "frutiger_liminal/fru_lim_132.avif",
  "frutiger_liminal/fru_lim_134.avif",
  "frutiger_liminal/fru_lim_178.avif",
  "frutiger_liminal/fru_lim_194.avif",
  "frutiger_liminal/fru_lim_195.avif",
  "frutiger_liminal/fru_lim_202.avif",
  "frutiger_liminal/fru_lim_217.avif",
  "frutiger_liminal/fru_lim_235.avif",
  "frutiger_liminal/fru_lim_238.avif",
  "frutiger_liminal/fru_lim_250.avif",
  "frutiger_liminal/fru_lim_254.avif",
  "gpt%20_image2_covers/gpt2_001.avif",
  "gpt%20_image2_covers/gpt2_002.avif",
  "gpt%20_image2_covers/gpt2_003.avif",
  "gpt%20_image2_covers/gpt2_004.avif",
  "gpt%20_image2_covers/gpt2_005.avif",
  "gpt%20_image2_covers/gpt2_006.avif",
  "gpt%20_image2_covers/gpt2_007.avif",
  "gpt%20_image2_covers/gpt2_008.avif",
  "gpt%20_image2_covers/gpt2_009.avif",
  "gpt%20_image2_covers/gpt2_016.avif",
  "gpt%20_image2_covers/gpt2_018.avif",
  "gpt%20_image2_covers/gpt2_023.avif",
  "gpt%20_image2_covers/gpt2_026.avif",
  "gpt%20_image2_covers/gpt2_031.avif",
  "gpt%20_image2_covers/gpt2_039.avif",
  "gpt%20_image2_covers/gpt2_062.avif",
  "gpt%20_image2_covers/gpt2_069.avif",
  "gpt%20_image2_covers/gpt2_071.avif",
  "gpt%20_image2_covers/gpt2_072.avif",
  "gpt%20_image2_covers/gpt2_076.avif",
  "gpt%20_image2_covers/gpt2_079.avif",
  "imagen3_business/imgn_bus_004.avif",
  "imagen3_business/imgn_bus_021.avif",
  "imagen3_business/imgn_bus_048.avif",
  "imagen3_product/imgn_pro_012.avif",
  "imagen3_product/imgn_pro_086.avif",
  "imagen3_product/imgn_pro_162.avif",
  "imagen3_product/imgn_pro_229.avif",
  "imagen3_product/imgn_pro_466.avif",
  "imagen3_product/imgn_pro_493.avif",
  "kaiju_cats/kaiju_cat_01.avif",
  "kaiju_cats/kaiju_cat_15.avif",
  "monster_drugs/monster_drugs_02.avif",
  "monster_drugs/monster_drugs_04.avif",
  "mushishi/mushishi_06.avif",
  "mushishi/mushishi_07.avif",
  "mushishi/mushishi_10.avif",
  "mushishi/mushishi_15.avif",
  "mushishi/mushishi_35.avif",
  "mushishi/mushishi_38.avif",
  "mushishi/mushishi_45.avif",
  "mushishi/mushishi_47.avif",
  "seedream3_covers/sc_001.avif",
  "seedream3_covers/sc_002.avif",
  "seedream3_covers/sc_004.avif",
  "seedream3_covers/sc_005.avif",
  "seedream3_covers/sc_008.avif",
  "seedream3_covers/sc_009.avif",
  "seedream3_covers/sc_012.avif",
  "seedream3_covers/sc_013.avif",
  "seedream3_covers/sc_021.avif",
  "seedream3_covers/sc_030.avif",
  "seedream3_covers/sc_042.avif",
  "seedream3_covers/sc_043.avif",
  "seedream3_covers/sc_046.avif",
  "seedream3_covers/sc_049.avif",
  "seedream3_covers/sc_052.avif",
  "seedream3_covers/sc_054.avif",
  "seedream3_covers/sc_057.avif",
  "seedream3_covers/sc_063.avif",
  "seedream3_covers/sc_085.avif"
];

const RELATIVE_MISC_MEDIA = [
  "books/captain_underpants.avif",
  "books/charlie_and_the_chocolate_factory.avif",
  "books/charlottes_web.avif",
  "books/dragon_ball_vol_1.avif",
  "books/dune.avif",
  "books/his_dark_materials_trilogy.avif",
  "books/mistborn_1_the_final_empire.avif",
  "books/snow_crash.avif",
  "books/steal_like_an_artist.avif",
  "books/the_berenstain_bears_and_the_messy_room.avif",
  "books/the_complete_calvin_and_hobbes.avif",
  "books/the_giver.avif",
  "books/the_hitchhikers_guide_to_the_galaxy.avif",
  "books/the_hobbit.avif",
  "movies/air_bud.avif",
  "movies/alien.avif",
  "movies/american_beauty.avif",
  "movies/august_rush.avif",
  "movies/austin_powers_1.avif",
  "movies/batman_beyond_return_of_the_joker.avif",
  "movies/big_trouble_in_little_china.avif",
  "movies/contact.avif",
  "movies/coraline.avif",
  "movies/dbz_the_history_of_trunks.avif",
  "movies/dogma.avif",
  "movies/dragon_ball_super_broly.avif",
  "movies/dredd.avif",
  "movies/falling_down.avif",
  "movies/fear_and_loathing_in_las_vegas.avif",
  "movies/fight_club.avif",
  "movies/friday.avif",
  "movies/from_dusk_till_dawn.avif",
  "movies/galaxy_quest.avif",
  "movies/ghostbusters_1.avif",
  "movies/highlander.avif",
  "movies/how_the_grinch_stole_christmas_2000.avif",
  "movies/indiana_jones_2.avif",
  "movies/killer_klowns_from_outer_space.avif",
  "movies/limitless.avif",
  "movies/little_shop_of_horrors.avif",
  "movies/megamind.avif",
  "movies/men_in_black_1.avif",
  "movies/muppet_treasure_island.avif",
  "movies/nimona.avif",
  "movies/office_space.avif",
  "movies/pirates_of_silicon_valley.avif",
  "movies/predator_badlands.avif",
  "movies/robocop.avif",
  "movies/rush_hour.avif",
  "movies/scott_pilgrim_vs_the_world.avif",
  "movies/send_help.avif",
  "movies/shrek.avif",
  "movies/signs.avif",
  "movies/smart_house.avif",
  "movies/south_park_bigger_longer_and_uncut.avif",
  "movies/space_jam.avif",
  "movies/spider_man_2.avif",
  "movies/spider_man_no_way_home.avif",
  "movies/star_wars_episode_i_the_phantom_menace.avif",
  "movies/star_wars_episode_vi_return_of_the_jedi.avif",
  "movies/starship_troopers.avif",
  "movies/tenacious_d_in_the_pick_of_destiny.avif",
  "movies/terminator_2.avif",
  "movies/the_amazing_spider_man.avif",
  "movies/the_batman.avif",
  "movies/the_brave_little_toaster.avif",
  "movies/the_fly.avif",
  "movies/the_hudsucker_proxy.avif",
  "movies/the_karate_kid_1984.avif",
  "movies/the_land_before_time.avif",
  "movies/the_matrix.avif",
  "movies/the_princess_bride.avif",
  "movies/the_rescuers.avif",
  "movies/the_rocketeer.avif",
  "movies/the_sixth_sense.avif",
  "movies/the_super_mario_bros_movie.avif",
  "movies/the_time_travelers_wife.avif",
  "movies/the_truman_show.avif",
  "movies/they_live.avif",
  "movies/tombstone.avif",
  "movies/toy_story_2.avif",
  "movies/tremors.avif",
  "movies/twilight_1.avif",
  "movies/uhf.avif",
  "movies/upgrade.avif",
  "movies/walk_hard_the_dewey_cox_story.avif",
  "movies/what_we_do_in_the_shadows_movie.avif",
  "tv/adventure_time.avif",
  "tv/atlanta.avif",
  "tv/avatar_the_last_airbender.avif",
  "tv/batman_1966.avif",
  "tv/doctor_who_10.avif",
  "tv/fargo.avif",
  "tv/firefly.avif",
  "tv/flight_of_the_conchords.avif",
  "tv/freaks_and_geeks.avif",
  "tv/futurama.avif",
  "tv/invader_zim.avif",
  "tv/jonny_quest.avif",
  "tv/malcolm_in_the_middle.avif",
  "tv/mob_psycho_100.avif",
  "tv/pokemon.avif",
  "tv/primal.avif",
  "tv/reboot.avif",
  "tv/smallville.avif",
  "tv/speed_racer.avif",
  "tv/star_trek.avif",
  "tv/star_wars_clone_wars.avif",
  "tv/stargate_sg_1.avif",
  "tv/super_friends.avif",
  "tv/terminator_the_sarah_connor_chronicles.avif",
  "tv/the_twilight_zone.avif",
  "tv/the_venture_bros.avif"
];

export const MISC_ART = RELATIVE_MISC_ART.map(path => `${PORTFOLIO_BASE}${path}`);
export const MISC_MEDIA = RELATIVE_MISC_MEDIA.map(path => `${INTERESTS_BASE}${path}`);

export const AUDIO_TRACKS = [
  {
    "name": "001_01_Duath_Maethor.mp3",
    "folder": "elf_girl_001",
    "title": "001_01 Duath Maethor"
  },
  {
    "name": "001_02_Falas_Idh.mp3",
    "folder": "elf_girl_001",
    "title": "001_02 Falas Idh"
  },
  {
    "name": "001_04_Golodhram_Sereg.mp3",
    "folder": "elf_girl_001",
    "title": "001_04 Golodhram Sereg"
  },
  {
    "name": "001_05_Pith_Niben.mp3",
    "folder": "elf_girl_001",
    "title": "001_05 Pith Niben"
  },
  {
    "name": "001_12_Nath_Aglar.mp3",
    "folder": "elf_girl_001",
    "title": "001_12 Nath Aglar"
  },
  {
    "name": "002_01_Miltaurath.mp3",
    "folder": "elf_girl_002",
    "title": "002_01 Miltaurath"
  },
  {
    "name": "002_04_Harn_Galu.mp3",
    "folder": "elf_girl_002",
    "title": "002_04 Harn Galu"
  },
  {
    "name": "002_10_Narn_Gwath.mp3",
    "folder": "elf_girl_002",
    "title": "002_10 Narn Gwath"
  },
  {
    "name": "003_01_Edlothiad.mp3",
    "folder": "elf_girl_003",
    "title": "003_01 Edlothiad"
  },
  {
    "name": "003_02_Lach_Gur.mp3",
    "folder": "elf_girl_003",
    "title": "003_02 Lach Gur"
  },
  {
    "name": "003_29_Linnod_Tal_Blendor.mp3",
    "folder": "elf_girl_003",
    "title": "003_29 Linnod Tal Blendor"
  },
  {
    "name": "004_01_Tyalieli_Vende.mp3",
    "folder": "elf_girl_004",
    "title": "004_01 Tyalieli Vende"
  },
  {
    "name": "004_02_Tolo_na_Naur.mp3",
    "folder": "elf_girl_004",
    "title": "004_02 Tolo na Naur"
  },
  {
    "name": "004_05_Edraith_o_Rhach.mp3",
    "folder": "elf_girl_004",
    "title": "004_05 Edraith o Rhach"
  },
  {
    "name": "004_07_Lairelosse_Nith.mp3",
    "folder": "elf_girl_004",
    "title": "004_07 Lairelosse Nith"
  },
  {
    "name": "004_08_Sanga_Ulundo.mp3",
    "folder": "elf_girl_004",
    "title": "004_08 Sanga Ulundo"
  },
  {
    "name": "004_09_Sereg_Glir.mp3",
    "folder": "elf_girl_004",
    "title": "004_09 Sereg Glir"
  },
  {
    "name": "004_11_Thol_Glae.mp3",
    "folder": "elf_girl_004",
    "title": "004_11 Thol Glae"
  },
  {
    "name": "004_12_Vasa_Oiolaire.mp3",
    "folder": "elf_girl_004",
    "title": "004_12 Vasa Oiolaire"
  },
  {
    "name": "004_13_Tul_Pent.mp3",
    "folder": "elf_girl_004",
    "title": "004_13 Tul Pent"
  },
  {
    "name": "004_18_Gonod_Menel.mp3",
    "folder": "elf_girl_004",
    "title": "004_18 Gonod Menel"
  },
  {
    "name": "004_20_Palantir_Mornie.mp3",
    "folder": "elf_girl_004",
    "title": "004_20 Palantir Mornie"
  },
  {
    "name": "005_01_A_Apsene_Te.mp3",
    "folder": "elf_girl_005",
    "title": "005_01 A Apsene Te"
  },
  {
    "name": "005_02_Liquis_Ear.mp3",
    "folder": "elf_girl_005",
    "title": "005_02 Liquis Ear"
  },
  {
    "name": "005_03_Morn_Amloth.mp3",
    "folder": "elf_girl_005",
    "title": "005_03 Morn Amloth"
  },
  {
    "name": "005_05_Hrave_Olori.mp3",
    "folder": "elf_girl_005",
    "title": "005_05 Hrave Olori"
  },
  {
    "name": "005_14_Dram_Lim.mp3",
    "folder": "elf_girl_005",
    "title": "005_14 Dram Lim"
  },
  {
    "name": "005_15_Tulca_Fea.mp3",
    "folder": "elf_girl_005",
    "title": "005_15 Tulca Fea"
  },
  {
    "name": "005_18_A_Mape_Maryat.mp3",
    "folder": "elf_girl_005",
    "title": "005_18 A Mape Maryat"
  },
  {
    "name": "006_01_Glaur_Fuin.mp3",
    "folder": "elf_girl_006",
    "title": "006_01 Glaur Fuin"
  },
  {
    "name": "006_03_Glawar_Uruloke.mp3",
    "folder": "elf_girl_006",
    "title": "006_03 Glawar Uruloke"
  },
  {
    "name": "006_06_Nessima_Tinwe.mp3",
    "folder": "elf_girl_006",
    "title": "006_06 Nessima Tinwe"
  },
  {
    "name": "006_08_Voronda_Estel.mp3",
    "folder": "elf_girl_006",
    "title": "006_08 Voronda Estel"
  },
  {
    "name": "006_11_Estel_Mornie.mp3",
    "folder": "elf_girl_006",
    "title": "006_11 Estel Mornie"
  },
  {
    "name": "006_12_Ondo_Cale.mp3",
    "folder": "elf_girl_006",
    "title": "006_12 Ondo Cale"
  },
  {
    "name": "006_13_Lisse_Lenda.mp3",
    "folder": "elf_girl_006",
    "title": "006_13 Lisse Lenda"
  },
  {
    "name": "006_18_Elen_Sila.mp3",
    "folder": "elf_girl_006",
    "title": "006_18 Elen Sila"
  },
  {
    "name": "006_21_Laire_Mordo.mp3",
    "folder": "elf_girl_006",
    "title": "006_21 Laire Mordo"
  },
  {
    "name": "007_01_Angwedh_Thinnas.mp3",
    "folder": "elf_girl_007",
    "title": "007_01 Angwedh Thinnas"
  },
  {
    "name": "007_03_Bregedur.mp3",
    "folder": "elf_girl_007",
    "title": "007_03 Bregedur"
  },
  {
    "name": "007_06_Raucima_Linde.mp3",
    "folder": "elf_girl_007",
    "title": "007_06 Raucima Linde"
  },
  {
    "name": "007_07_Tuima_More.mp3",
    "folder": "elf_girl_007",
    "title": "007_07 Tuima More"
  },
  {
    "name": "007_08_Lamatyave_Hlapula.mp3",
    "folder": "elf_girl_007",
    "title": "007_08 Lamatyave Hlapula"
  },
  {
    "name": "007_10_Quiesse_Calina.mp3",
    "folder": "elf_girl_007",
    "title": "007_10 Quiesse Calina"
  },
  {
    "name": "007_14_Ea_Lomelinde.mp3",
    "folder": "elf_girl_007",
    "title": "007_14 Ea Lomelinde"
  },
  {
    "name": "007_15_Taur_Gond.mp3",
    "folder": "elf_girl_007",
    "title": "007_15 Taur Gond"
  },
  {
    "name": "007_17_Sure_Mirima.mp3",
    "folder": "elf_girl_007",
    "title": "007_17 Sure Mirima"
  },
  {
    "name": "008_01_Galu_na_Vea.mp3",
    "folder": "elf_girl_008",
    "title": "008_01 Galu na Vea"
  },
  {
    "name": "008_02_Mael_Amarth.mp3",
    "folder": "elf_girl_008",
    "title": "008_02 Mael Amarth"
  },
  {
    "name": "008_03_Celu_Meluina.mp3",
    "folder": "elf_girl_008",
    "title": "008_03 Celu Meluina"
  },
  {
    "name": "008_08_Alcar_mi_More.mp3",
    "folder": "elf_girl_008",
    "title": "008_08 Alcar mi More"
  },
  {
    "name": "008_09_Miw_Wende.mp3",
    "folder": "elf_girl_008",
    "title": "008_09 Miw Wende"
  },
  {
    "name": "008_15_Glawar_Idh.mp3",
    "folder": "elf_girl_008",
    "title": "008_15 Glawar Idh"
  },
  {
    "name": "008_18_Anirog_Aes.mp3",
    "folder": "elf_girl_008",
    "title": "008_18 Anirog Aes"
  },
  {
    "name": "008_22_Na_Ya_Na.mp3",
    "folder": "elf_girl_008",
    "title": "008_22 Na Ya Na"
  }
];
