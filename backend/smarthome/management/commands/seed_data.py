"""
Idempotent seed command: ``python manage.py seed_data``.

Creates/updates 6 automation domains, 8 functional solutions and 6 reference
installations (with photo galleries). Records are matched by slug, so running
the command repeatedly never creates duplicates. Use ``--reset`` to wipe the
catalogue (not leads) before seeding.
"""

from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from smarthome.models import ReferenceInstallation, ReferencePhoto, SmartSolution, SolutionDomain


def img(photo_id: str, width: int = 1600) -> str:
    return f"https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w={width}&q=80"


DOMAINS = [
    {
        "slug": "inteligentne-osvetlenie-dali",
        "name": "Inteligentné osvetlenie & DALI scény",
        "short_summary": "Svetlo, ktoré sa prispôsobí dennej dobe, nálade aj prítomnosti osôb – od jemného nočného "
        "orientačného svetla až po slávnostnú večernú scénu jedným dotykom.",
        "icon_name": "lighting",
        "display_order": 1,
    },
    {
        "slug": "automaticke-tienenie",
        "name": "Automatické tienenie a ochrana pred prehrievaním",
        "short_summary": "Žalúzie a rolety riadené polohou slnka, vetrom a teplotou. Dom sa v lete sám chráni pred "
        "prehrievaním a v zime využíva pasívne solárne zisky.",
        "icon_name": "shading",
        "display_order": 2,
    },
    {
        "slug": "zonove-vykurovanie-chladenie",
        "name": "Zónové vykurovanie, chladenie a rekuperácia",
        "short_summary": "Každá miestnosť má vlastnú teplotu podľa rozvrhu a obsadenosti. Tepelné čerpadlo, "
        "podlahové kúrenie aj rekuperácia pracujú ako jeden systém.",
        "icon_name": "climate",
        "display_order": 3,
    },
    {
        "slug": "energeticky-manazment",
        "name": "Energetický manažment (Fotovoltika & Wallbox)",
        "short_summary": "Prebytky z fotovoltiky spotrebujete doma – na ohrev vody, nabíjanie auta či predkúrenie. "
        "Menej energie predávate lacno do siete a menej nakupujete draho.",
        "icon_name": "energy",
        "display_order": 4,
    },
    {
        "slug": "bezpecnost-pristup-kamery",
        "name": "Bezpečnosť, prístupový systém a kamery",
        "short_summary": "Alarm, kamery, video-vrátnik a bezkľúčový prístup prepojené so svetlami a žalúziami. "
        "Dom reaguje na narušenie skôr, než sa niečo stane.",
        "icon_name": "security",
        "display_order": 5,
    },
    {
        "slug": "multi-room-audio-domace-kino",
        "name": "Multi-room audio & Domáce kino",
        "short_summary": "Neviditeľné reproduktory v strope, hudba, ktorá vás sprevádza z kuchyne až na terasu, "
        "a kino scéna, ktorá stiahne žalúzie a stlmí svetlá.",
        "icon_name": "audio",
        "display_order": 6,
    },
]

SOLUTIONS = [
    {
        "slug": "cirkadianne-osvetlenie-a-svetelne-sceny",
        "domain": "inteligentne-osvetlenie-dali",
        "name": "Cirkadiánne osvetlenie a svetelné scény (DALI / Tree)",
        "short_description": "Teplota a intenzita svetla sa počas dňa plynulo mení od teplých 2700K ráno a večer "
        "po sviežich 5000K na pracovnom stole. Scény vyvoláte tlačidlom, hlasom alebo automaticky.",
        "detailed_description": "Cirkadiánne osvetlenie napodobňuje prirodzený priebeh denného svetla a podporuje "
        "zdravý spánkový rytmus. Každé svietidlo je individuálne adresovateľné cez zbernicu DALI-2 alebo Loxone "
        "Tree, takže namiesto desiatok vypínačov stačí jedno elegantné tlačidlo v miestnosti.\n\n"
        "Pohybové a prítomnostné senzory zabezpečia, že svetlo sa rozsvieti len vtedy, keď ho potrebujete – a "
        "zhasne, keď odídete. V noci vás na chodbe privíta tlmené orientačné svetlo na 5 %, ktoré neoslní a "
        "nezobudí zvyšok rodiny.\n\n"
        "Svetelné scény (Varenie, Večera, Kino, Upratovanie) navrhujeme spolu s vami a vaším architektom už vo "
        "fáze projektu, aby osvetlenie podčiarklo architektúru interiéru.",
        "everyday_benefits": [
            "Ráno vás zobudí jemné teplé svetlo a postupne vytiahnuté žalúzie.",
            "V noci sa na chodbe a v kúpeľni rozsvieti len tlmené orientačné svetlo na 5 %.",
            "Scénu „Večera“ vyvoláte jedným dotykom – svetlo nad stolom, stlmená kuchyňa, ambientné LED pásy.",
            "Pri odchode z domu jedno tlačidlo vypne všetky svetlá, ktoré ste zabudli zhasnúť.",
        ],
        "supported_protocols": ["DALI-2", "Loxone Tree / Air", "KNX", "DMX (RGBW)"],
        "energy_saving_note": "Úspora elektrickej energie na osvetlenie až 40 % vďaka prítomnostným senzorom a stmievaniu",
        "starting_price_eur": Decimal("3900"),
        "cover_image_url": img("1540932239986-30128078f3c5"),
        "is_featured": True,
    },
    {
        "slug": "rgbw-ambientne-a-fasadne-osvetlenie",
        "domain": "inteligentne-osvetlenie-dali",
        "name": "Ambientné RGBW a fasádne osvetlenie záhrady",
        "short_description": "Skryté LED línie v podhľadoch, nasvietenie fasády a záhrady, ktoré sa zapína podľa "
        "súmraku a mení sa podľa ročného obdobia či sviatkov.",
        "detailed_description": "Nepriame osvetlenie dáva interiéru hĺbku a večer vytvára príjemnú atmosféru bez "
        "oslnenia. Fasádne a záhradné svetlá ovládané astronomickými hodinami sa zapnú presne pri súmraku a o "
        "polnoci prejdú do úsporného režimu.\n\n"
        "Pri narušení pozemku sa celá záhrada rozsvieti na 100 % – osvetlenie tak plní aj bezpečnostnú funkciu.",
        "everyday_benefits": [
            "Fasáda a chodník sa rozsvietia samé pri súmraku, bez nastavovania časovačov.",
            "Na Vianoce prepnete celý dom do teplej sviatočnej scény jedným dotykom v aplikácii.",
            "Pri pohybe na pozemku v noci sa záhrada rozsvieti a odradí nevítaného návštevníka.",
        ],
        "supported_protocols": ["DALI-2 DT8", "Loxone Tree / Air", "DMX512", "KNX"],
        "energy_saving_note": "Astronomické hodiny a nočný úsporný režim znižujú spotrebu exteriérového osvetlenia o 30 %",
        "starting_price_eur": Decimal("1800"),
        "cover_image_url": img("1600585154340-be6161a56a0c"),
        "is_featured": False,
    },
    {
        "slug": "autonomne-exterierove-zaluzie",
        "domain": "automaticke-tienenie",
        "name": "Autonómne exteriérové žalúzie riadené slnkom a vetrom",
        "short_description": "Žalúzie sledujú polohu slnka na každej fasáde zvlášť, natáčajú lamely a pri silnom "
        "vetre sa automaticky vytiahnu do bezpečnej polohy.",
        "detailed_description": "Exteriérové tienenie je najúčinnejšou ochranou pred letným prehrievaním – zachytí "
        "teplo ešte pred sklom. Systém pozná orientáciu každého okna a podľa aktuálnej polohy slnka natáča lamely "
        "tak, aby ste mali v miestnosti denné svetlo, no bez priameho slnka a oslnenia.\n\n"
        "Meteostanica na streche meria rýchlosť vetra, zrážky a intenzitu slnečného žiarenia. Pri búrke sa "
        "žalúzie vytiahnu skôr, než by sa mohli poškodiť. V zime naopak systém púšťa slnko dnu a znižuje potrebu "
        "vykurovania.",
        "everyday_benefits": [
            "V lete systém automaticky tieni južné okná a znižuje teplotu v interiéri až o 5 °C.",
            "Pri silnom vetre sa žalúzie samé vytiahnu – aj keď ste na dovolenke.",
            "Lamely sa natáčajú tak, aby slnko nesvietilo na televízor ani na monitor v pracovni.",
            "V zime žalúzie púšťajú slnečné lúče dnu a pomáhajú vykurovať zadarmo.",
        ],
        "supported_protocols": ["Loxone Tree / Air", "KNX", "Somfy RTS / io", "Meteostanica Loxone / Elsner"],
        "energy_saving_note": "Zníženie potreby chladenia až o 30 % a pasívne solárne zisky v zime",
        "starting_price_eur": Decimal("2900"),
        "cover_image_url": img("1600607687939-ce8a6c25118c"),
        "is_featured": True,
    },
    {
        "slug": "individualna-regulacia-teploty",
        "domain": "zonove-vykurovanie-chladenie",
        "name": "Individuálna regulácia teploty v každej miestnosti",
        "short_description": "Spálňa na 19 °C, kúpeľňa ráno na 24 °C, obývačka podľa prítomnosti. Systém sa sám "
        "učí, ako rýchlo sa ktorá miestnosť vyhreje, a zapína kúrenie presne včas.",
        "detailed_description": "Inteligentná regulácia riadi termoelektrické hlavice podlahového kúrenia, "
        "fan-coily, tepelné čerpadlo aj rekuperáciu ako jeden celok. Každá miestnosť má vlastný rozvrh a "
        "komfortnú teplotu, ktorú meria dizajnový senzor v tlačidle Loxone Touch alebo KNX ovládači.\n\n"
        "Pri otvorení okna sa vykurovanie v miestnosti okamžite pozastaví. Keď odídete z domu, systém prejde do "
        "útlmového režimu a pred vaším návratom – podľa polohy telefónu – dom opäť vyhreje.\n\n"
        "Kvalita vzduchu (CO₂, vlhkosť) riadi výkon rekuperácie, takže v spálni sa vždy dobre spí.",
        "everyday_benefits": [
            "Ráno je v kúpeľni príjemných 24 °C, v spálni zostáva 19 °C na kvalitný spánok.",
            "Pri vetraní sa kúrenie v miestnosti samo vypne – žiadne vykurovanie ulice.",
            "Rekuperácia pridá výkon, keď senzor CO₂ zistí vydýchaný vzduch v spálni.",
            "Z dovolenky dom na diaľku predkúrite, aby ste prišli do tepla.",
        ],
        "supported_protocols": ["Loxone Tree / Air", "KNX", "Modbus TCP / RTU", "OpenTherm"],
        "energy_saving_note": "Úspora energie na vykurovanie a chladenie až 25 – 35 %",
        "starting_price_eur": Decimal("3400"),
        "cover_image_url": img("1545259741-2ea3ebf61fa3"),
        "is_featured": True,
    },
    {
        "slug": "prebytky-fotovoltiky-a-nabijanie-ev",
        "domain": "energeticky-manazment",
        "name": "Inteligentné využitie prebytkov z fotovoltiky a nabíjanie EV",
        "short_description": "Energetický manažér priebežne rozhoduje, kam pošle vyrobenú energiu: do domácnosti, "
        "batérie, bojlera, tepelného čerpadla alebo do elektromobilu.",
        "detailed_description": "Výkupná cena elektriny je zlomkom ceny, za ktorú ju nakupujete. Preto má zmysel "
        "spotrebovať čo najviac vlastnej energie doma. Loxone energetický manažér komunikuje so striedačom, "
        "batériou aj wallboxom a podľa priorít spína spotrebiče v momente, keď je prebytok.\n\n"
        "Elektromobil sa cez deň nabíja zo slnka, v noci len do minimálnej rezervy za nízku tarifu. Dynamické "
        "riadenie záťaže zároveň chráni hlavný istič – nemusíte navyšovať rezervovanú kapacitu.\n\n"
        "Prehľadné grafy vám v aplikácii ukážu výrobu, spotrebu a ušetrené eurá za každý deň.",
        "everyday_benefits": [
            "Elektromobil sa cez deň nabíja zadarmo z prebytkov vašej fotovoltiky.",
            "Bojler a tepelné čerpadlo sa nahrievajú vtedy, keď svieti slnko – nie v drahej špičke.",
            "Dynamické riadenie záťaže zabráni vypadnutiu hlavného ističa pri súčasnom varení a nabíjaní.",
            "V aplikácii vidíte, koľko eur vám dnes ušetrilo slnko.",
        ],
        "supported_protocols": ["Modbus TCP", "Loxone Tree / Air", "OCPP 1.6", "SunSpec", "KNX"],
        "energy_saving_note": "Zvýšenie vlastnej spotreby FVE zo 30 % až na 75 % a nižšie účty za elektrinu",
        "starting_price_eur": Decimal("2600"),
        "cover_image_url": img("1509391366360-2e959784a276"),
        "is_featured": True,
    },
    {
        "slug": "bezklucovy-pristup-a-video-vratnik",
        "domain": "bezpecnost-pristup-kamery",
        "name": "Bezkľúčový prístup NFC / Code Touch a video-vrátnik",
        "short_description": "Dvere otvoríte NFC čipom, kódom alebo z telefónu. Video-vrátnik vám ukáže "
        "návštevu kdekoľvek na svete a kuriérovi môžete otvoriť bránu na diaľku.",
        "detailed_description": "Prístupový systém nahrádza kľúče bezpečnými NFC čipmi a kódovými klávesnicami. "
        "Každý člen rodiny, upratovačka či servisný technik má vlastný prístup s časovým obmedzením – a vy "
        "presne viete, kto a kedy prišiel.\n\n"
        "Pri odchode jedno tlačidlo „Odchod“ zhasne svetlá, stiahne žalúzie, zníži teplotu a aktivuje alarm. "
        "Pri narušení sa rozsvieti celý dom, rozozvučí sa siréna aj multi-room audio a vy dostanete notifikáciu "
        "so záznamom z kamery.",
        "everyday_benefits": [
            "Jediným stlačením tlačidla pri odchode vypnete všetky svetlá, stiahnete žalúzie a aktivujete alarm.",
            "Deti sa po škole dostanú domov s vlastným kódom – vy dostanete správu, že sú doma.",
            "Kuriérovi otvoríte bránu z telefónu, aj keď ste v práci.",
            "Pri narušení sa rozsvietia všetky svetlá a kamera vám pošle záznam.",
        ],
        "supported_protocols": ["Loxone Intercom / NFC Code Touch", "KNX", "ONVIF / RTSP", "2N IP"],
        "energy_saving_note": "Režim „Odchod“ eliminuje zbytočnú spotrebu zabudnutých svetiel a spotrebičov",
        "starting_price_eur": Decimal("2200"),
        "cover_image_url": img("1558002038-1055907df827"),
        "is_featured": True,
    },
    {
        "slug": "neviditelne-ozvucenie-celeho-domu",
        "domain": "multi-room-audio-domace-kino",
        "name": "Neviditeľné ozvučenie celého domu a terasy",
        "short_description": "Reproduktory zapustené do stropu alebo úplne neviditeľné pod omietkou. V každej "
        "zóne iná hudba, alebo jedna playlista, ktorá vás sprevádza celým domom.",
        "detailed_description": "Multi-room audio prepája kuchyňu, obývačku, kúpeľňu aj terasu do jedného systému. "
        "Spotify, internetové rádiá či vlastná knižnica – všetko ovládate z aplikácie alebo z tlačidla na stene.\n\n"
        "Audio je zároveň súčasťou automatizácie: ranná budiaca scéna spustí obľúbenú stanicu, zvonček zahrá "
        "jemný gong vo všetkých zónach a pri alarme sa ozve siréna z každého reproduktora.",
        "everyday_benefits": [
            "Ráno sa v kúpeľni spustí vaše obľúbené rádio spolu s budiacou svetelnou scénou.",
            "Zvonček pri bráne počujete v každej miestnosti aj na terase.",
            "Na záhradnej párty hrá hudba len vonku a deti v detskej izbe nerušene spia.",
        ],
        "supported_protocols": ["Loxone Audio Server", "AirPlay 2", "Spotify Connect", "Sonos (integrácia)"],
        "energy_saving_note": "Zosilňovače sa automaticky vypínajú, keď v zóne nikto nepočúva",
        "starting_price_eur": Decimal("2400"),
        "cover_image_url": img("1545454675-3531b543be5d"),
        "is_featured": True,
    },
    {
        "slug": "domace-kino-a-kino-scena",
        "domain": "multi-room-audio-domace-kino",
        "name": "Domáce kino s automatickou kino scénou",
        "short_description": "Jedno tlačidlo „Kino“ stiahne zatemňovacie rolety, stlmí svetlá na 5 %, spustí "
        "projektor aj zvukový systém a nastaví ideálnu teplotu.",
        "detailed_description": "Domáce kino navrhujeme ako ucelenú miestnosť – od akustiky a rozmiestnenia "
        "reproduktorov až po zatemnenie a ventiláciu. Automatizácia zabezpečí, že sa nemusíte prehrabávať "
        "piatimi ovládačmi.\n\n"
        "Pri pauze sa rozsvieti tlmené orientačné svetlo, po skončení filmu sa všetko vráti do pôvodného stavu.",
        "everyday_benefits": [
            "Jedno tlačidlo pripraví kino: rolety dole, svetlá na 5 %, projektor a zvuk zapnuté.",
            "Pri pauze sa rozsvieti tlmené svetlo, aby ste nezakopli cestou do kuchyne.",
            "Klimatizácia v kine beží tichšie, aby nerušila dialógy.",
        ],
        "supported_protocols": ["Loxone Tree / Air", "KNX", "HDMI-CEC / IP ovládanie", "IR / RS-232"],
        "energy_saving_note": "Po skončení scény sa všetky komponenty vypnú – žiadny stand-by",
        "starting_price_eur": Decimal("4800"),
        "cover_image_url": img("1478720568477-152d9b164e26"),
        "is_featured": False,
    },
]

REFERENCES = [
    {
        "slug": "loxone-vila-pod-kolibou",
        "title": "Kompletná Loxone automatizácia nízkoenergetickej vily pod Kolibou",
        "property_type": "rodinny_dom",
        "location_city": "Bratislava",
        "floor_area_sqm": 285,
        "system_platform": "Loxone Miniserver Gen. 2 + DALI-2",
        "completion_year": 2025,
        "client_vision": "Majitelia chceli dom, ktorý bude technicky na špičke, no nebude pôsobiť technicky. "
        "Architekt trval na čistých stenách bez radov vypínačov a na precíznom svetelnom dizajne. Klient zase "
        "na tom, aby dom fungoval sám – bez nutnosti čokoľvek nastavovať. Výsledkom je vila, kde jedno "
        "dizajnové tlačidlo v miestnosti ovláda svetlá, žalúzie, teplotu aj hudbu.",
        "implemented_features": [
            "38 svetelných okruhov DALI",
            "16 exteriérových žalúzií riadených podľa slnka",
            "Integrácia tepelného čerpadla a rekuperácie",
            "Zónová regulácia v 14 miestnostiach",
            "7 audio zón vrátane terasy",
            "NFC Code Touch a video-vrátnik",
        ],
        "measured_benefit": "32 % zníženie ročných nákladov na energie",
        "cover_image_url": img("1613490493576-7fde63acd811"),
        "is_featured": True,
        "display_order": 1,
        "photos": [
            ("1613490493576-7fde63acd811", "Vila pri súmraku – nasvietenie fasády a bazéna"),
            ("1600210492486-724fe5c67fb0", "Obývacia zóna s cirkadiánnym osvetlením a tienením"),
            ("1600566752355-35792bedcfea", "Kúpeľňa s orientačným nočným svetlom"),
            ("1621905251189-08b45d6a269e", "Prehľadný smart rozvádzač na mieru"),
        ],
    },
    {
        "slug": "penthouse-dali-multiroom-audio",
        "title": "Inteligentný 4-izbový penthouse s DALI osvetlením a multi-room audiom",
        "property_type": "byt_penthouse",
        "location_city": "Bratislava",
        "floor_area_sqm": 168,
        "system_platform": "KNX + Gira G1 + DALI-2",
        "completion_year": 2024,
        "client_vision": "Mladý pár s veľkorysým penthousom v centre mesta si želal interiér ako z galérie: "
        "presne nasvietené umenie, nepriame osvetlenie a hudbu v každej miestnosti. KNX bol podmienkou "
        "developera, my sme ho doplnili o dizajnové ovládače Gira a vlastné svetelné scény.",
        "implemented_features": [
            "24 svetelných okruhov DALI-2 s Tunable White",
            "Ovládanie Gira G1 a tlačidlá Gira E2",
            "5 audio zón so stropnými reproduktormi",
            "Motorické záclony a zatemnenie spálne",
            "Integrácia klimatizácie cez KNX/Modbus",
        ],
        "measured_benefit": "28 % nižšia spotreba elektriny na osvetlenie a klimatizáciu",
        "cover_image_url": img("1600210491892-03d54c0aaf87"),
        "is_featured": True,
        "display_order": 2,
        "photos": [
            ("1600210491892-03d54c0aaf87", "Obývacia zóna so scénou „Večer s hosťami“"),
            ("1618221195710-dd6b41faaea6", "Nepriame ambientné osvetlenie v 2700K"),
            ("1616594039964-ae9021a400a0", "Spálňa s cirkadiánnym osvetlením a zatemnením"),
            ("1617806118233-18e1de247200", "Jedálenská scéna – svetlo cielené na stôl"),
        ],
    },
    {
        "slug": "rodinny-dom-fve-tepelne-cerpadlo-wallbox",
        "title": "Energetický manažment rodinného domu s FVE, tepelným čerpadlom a 2× Wallboxom",
        "property_type": "rodinny_dom",
        "location_city": "Trnava",
        "floor_area_sqm": 210,
        "system_platform": "Loxone Miniserver + Modbus TCP",
        "completion_year": 2025,
        "client_vision": "Rodina so 4 deťmi a dvoma elektromobilmi mala 10 kWp fotovoltiku, no väčšinu energie "
        "predávala lacno do siete. Cieľom bolo maximalizovať vlastnú spotrebu a nenavyšovať hlavný istič.",
        "implemented_features": [
            "Fotovoltika 10 kWp + batéria 10 kWh",
            "2× Wallbox s dynamickým riadením záťaže",
            "Riadenie tepelného čerpadla a bojlera podľa prebytkov",
            "Zónová regulácia podlahového kúrenia v 11 miestnostiach",
            "Prehľad výroby a úspor v aplikácii",
        ],
        "measured_benefit": "Vlastná spotreba FVE zvýšená z 31 % na 74 %",
        "cover_image_url": img("1600047509807-ba8f99d2cdde"),
        "is_featured": True,
        "display_order": 3,
        "photos": [
            ("1600047509807-ba8f99d2cdde", "Moderný rodinný dom s fotovoltikou na streche"),
            ("1593941707882-a5bba14938c7", "Nabíjanie elektromobilu z prebytkov FVE"),
            ("1508514177221-188b1cf16e9d", "Fotovoltické panely s optimalizáciou výroby"),
            ("1600121848594-d8644e57abab", "Obývačka s inteligentnou reguláciou teploty"),
        ],
    },
    {
        "slug": "kancelarska-budova-knx",
        "title": "Automatizácia kancelárskej budovy a zasadacích miestností (KNX)",
        "property_type": "komercny_objekt",
        "location_city": "Žilina",
        "floor_area_sqm": 1450,
        "system_platform": "KNX + DALI-2 + BACnet",
        "completion_year": 2024,
        "client_vision": "Technologická firma potrebovala kancelárie, ktoré šetria energiu bez toho, aby "
        "zamestnanci museli na čokoľvek myslieť. Zasadačky mali byť pripravené na prezentáciu jedným dotykom.",
        "implemented_features": [
            "Konštantná regulácia osvetlenia podľa denného svetla",
            "Prítomnostné senzory v 42 zónach",
            "6 zasadacích miestností so scénami „Prezentácia“ a „Videohovor“",
            "Integrácia VZT a chladenia cez BACnet",
            "Centrálny energetický monitoring",
        ],
        "measured_benefit": "41 % úspora elektriny na osvetlenie oproti pôvodnému stavu",
        "cover_image_url": img("1497366811353-6870744d04b2"),
        "is_featured": True,
        "display_order": 4,
        "photos": [
            ("1497366811353-6870744d04b2", "Open space s konštantnou reguláciou osvetlenia"),
            ("1497366216548-37526070297c", "Chodba s prítomnostnými senzormi"),
            ("1524758631624-e2822e304c36", "Relaxačná zóna so scénovým osvetlením"),
        ],
    },
    {
        "slug": "rekonstrukcia-bytu-loxone-air",
        "title": "Bezdrôtová rekonštrukcia 3-izbového bytu s Loxone Air",
        "property_type": "byt_penthouse",
        "location_city": "Košice",
        "floor_area_sqm": 92,
        "system_platform": "Loxone Miniserver Go + Air",
        "completion_year": 2025,
        "client_vision": "Majitelia nechceli búrať steny ani ťahať nové káble. Chceli však ovládať svetlá, "
        "rolety a kúrenie z mobilu a mať istotu, že keď odídu, je všetko vypnuté.",
        "implemented_features": [
            "Bezdrôtové stmievače a tlačidlá Loxone Air",
            "6 motorických roliet s automatikou podľa slnka",
            "Bezdrôtové hlavice radiátorov v každej izbe",
            "Detektory dymu a zaplavenia",
            "Tlačidlo „Odchod“ pri vchodových dverách",
        ],
        "measured_benefit": "22 % nižšie náklady na vykurovanie už v prvej sezóne",
        "cover_image_url": img("1600607687644-c7171b42498f"),
        "is_featured": False,
        "display_order": 5,
        "photos": [
            ("1600607687644-c7171b42498f", "Spálňa po rekonštrukcii – bez sekania stien"),
            ("1631679706909-1844bbd07221", "Obývačka s bezdrôtovým ovládaním svetiel"),
            ("1600489000022-c2086d79f9d4", "Kuchyňa s pracovným a ambientným osvetlením"),
        ],
    },
    {
        "slug": "moderna-vila-s-bazenom-senec",
        "title": "Moderná vila s bazénom, wellness a domácim kinom",
        "property_type": "rodinny_dom",
        "location_city": "Senec",
        "floor_area_sqm": 340,
        "system_platform": "Loxone Miniserver + KNX + DALI-2",
        "completion_year": 2023,
        "client_vision": "Rozľahlá vila s bazénom, wellness zónou a domácim kinom. Klient chcel všetky "
        "technológie – od bazénovej techniky po saunu – ovládať z jednej aplikácie a mať dlhodobý servis.",
        "implemented_features": [
            "52 svetelných okruhov DALI vrátane záhrady",
            "Riadenie bazénovej techniky a sauny",
            "Domáce kino s automatickou kino scénou",
            "8 audio zón vrátane bazéna",
            "12 IP kamier a perimetrická ochrana",
            "Vzdialená diagnostika a servisná zmluva",
        ],
        "measured_benefit": "35 % úspora energie na ohrev bazéna a vykurovanie",
        "cover_image_url": img("1600596542815-ffad4c1539a9"),
        "is_featured": True,
        "display_order": 6,
        "photos": [
            ("1600596542815-ffad4c1539a9", "Vila s bazénom a nasvietenou terasou"),
            ("1600573472550-8090b5e0745e", "Presklená fasáda s automatickým tienením"),
            ("1478720568477-152d9b164e26", "Domáce kino so scénou „Film“"),
            ("1600566753190-17f0baa2a6c3", "Vstup s video-vrátnikom a NFC prístupom"),
        ],
    },
]


class Command(BaseCommand):
    help = "Naplní databázu ukážkovými oblasťami, riešeniami a realizáciami (idempotentne)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Pred naplnením zmaže existujúci katalóg (riešenia, oblasti, realizácie). Dopyty zostávajú.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["reset"]:
            ReferenceInstallation.objects.all().delete()
            SmartSolution.objects.all().delete()
            SolutionDomain.objects.all().delete()
            self.stdout.write(self.style.WARNING("Katalóg bol vymazaný."))

        domains: dict[str, SolutionDomain] = {}
        for data in DOMAINS:
            data = dict(data)
            slug = data.pop("slug")
            domains[slug], _ = SolutionDomain.objects.update_or_create(slug=slug, defaults=data)

        for data in SOLUTIONS:
            data = dict(data)
            slug = data.pop("slug")
            data["domain"] = domains[data["domain"]]
            SmartSolution.objects.update_or_create(slug=slug, defaults=data)

        for data in REFERENCES:
            data = dict(data)
            slug = data.pop("slug")
            photos = data.pop("photos")
            reference, _ = ReferenceInstallation.objects.update_or_create(slug=slug, defaults=data)
            reference.photos.all().delete()
            ReferencePhoto.objects.bulk_create(
                ReferencePhoto(reference=reference, image_url=img(photo_id), caption=caption, display_order=index)
                for index, (photo_id, caption) in enumerate(photos)
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Hotovo: {SolutionDomain.objects.count()} oblastí, {SmartSolution.objects.count()} riešení, "
                f"{ReferenceInstallation.objects.count()} realizácií, {ReferencePhoto.objects.count()} fotografií."
            )
        )
