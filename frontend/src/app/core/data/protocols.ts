/** Short Slovak explanations of common building-automation protocols. */
const PROTOCOL_NOTES: [RegExp, string][] = [
  [/loxone tree|loxone air|^loxone/i, 'Zbernica Loxone Tree (káblová) a Air (bezdrôtová) – rýchla, spoľahlivá a jednoducho rozšíriteľná.'],
  [/knx/i, 'Otvorený svetový štandard pre automatizáciu budov (ISO/IEC 14543) s produktmi od 500+ výrobcov.'],
  [/dali/i, 'Digitálne rozhranie pre riadenie osvetlenia – individuálne adresovanie, stmievanie aj Tunable White.'],
  [/dmx/i, 'Protokol pre presné riadenie RGBW a efektového osvetlenia.'],
  [/modbus/i, 'Priemyselný štandard pre komunikáciu so striedačmi, tepelnými čerpadlami a elektromermi.'],
  [/somfy/i, 'Rádiové riadenie motorov žalúzií a roliet Somfy.'],
  [/meteostanica|elsner/i, 'Meranie vetra, zrážok, teploty a intenzity slnka pre automatiku tienenia.'],
  [/ocpp/i, 'Otvorený protokol pre riadenie nabíjacích staníc elektromobilov.'],
  [/sunspec/i, 'Štandardizovaná komunikácia s fotovoltickými striedačmi a batériami.'],
  [/opentherm/i, 'Modulované riadenie kotlov a zdrojov tepla.'],
  [/bacnet/i, 'Štandard pre integráciu VZT, chladenia a systémov riadenia budov (BMS).'],
  [/onvif|rtsp/i, 'Otvorený štandard pre IP kamery a prenos videa.'],
  [/2n|intercom|nfc|code touch/i, 'Prístupové systémy, video-vrátniky a NFC čítačky s integráciou do automatizácie.'],
  [/airplay|spotify|sonos|audio server/i, 'Streamovanie hudby z obľúbených služieb priamo do audio zón domu.'],
  [/hdmi|ir|rs-232/i, 'Ovládanie TV, projektorov a AV techniky v rámci scén.'],
];

export function describeProtocol(protocol: string): string {
  return (
    PROTOCOL_NOTES.find(([pattern]) => pattern.test(protocol))?.[1] ??
    'Overený komunikačný štandard s plnou integráciou do riadiaceho systému.'
  );
}
