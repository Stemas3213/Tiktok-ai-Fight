# AI FIGHT CLUB – Part 3: Runde 3 – Das Finale – Drehbuch (final, ausgeführt)

Dauer **59.3 s**, 1080×1920, 30 fps. Quelle der Zeilen: `episodes/part3/script.json`.
**Alle 13 Sprachzeilen sind neu erzeugt** (nichts aus Part 1/2 wiederverwendet), nur ElevenLabs, feste Voice-IDs aus `config/voices.json`.

## Spannungsbogen

| Zeit (s) | Wer hat die Oberhand | Ereignis |
|---|---|---|
| 0 – 3 | offen | Part 3 beginnt schwerelos (Cliffhanger aus Part 2): Fighter, Fans, Konfetti schweben. |
| 3 – 10 | **Newton** | Die Schwerkraft schnappt zurück („SNAP“): Einstein knallt flach auf den Rücken, Newton landet auf den Füßen und triumphiert. |
| 10 – 15 | Newton | Schiedsrichter zählt, Ziffern **1 – 6** groß im Bild, Kommentator: „Steht er wieder auf?“ |
| 15 – 21 | **Einstein fast verloren** | **Absolute Stille** (nur Atem + Herzschlag), Zählung 7, 8; Newton flüstert „Bleib liegen … bitte, bleib liegen.“ Einstein regungslos. |
| 21 – 27 | **Gänsehaut-Wendung** | Bei **NEUN** öffnet Einstein die Augen und flüstert: „Du hast eine Sache vergessen, Isaac … Zeit ist relativ.“ Newton: „Das … ist unmöglich!“ |
| 27 – 31 | Einstein | Mühsames Aufstehen (zitternde Beine, Atmen), Musik und Publikum drehen auf. |
| 31 – 41 | Newton wild / Einstein angeschlagen | Letzter Schlagabtausch: drei Treffer, Einstein in die Knie, steht wieder auf, **kurze Stille** – Newtons wilder Haken, Einstein duckt, **entscheidender Konter** (Slow-Motion, Hitstop, Schweiß, Newtons Perücke fliegt). |
| 41 – 49 | **Einstein** | Newton fliegt rückwärts zu Boden; Zählung **5 – 10**, Gong, Konfetti. |
| 49 – 59 | Einstein | Sieger. Newton steht auf: „Gut gekämpft, Albert.“ – Einstein: „Danke, Isaac. Nur relativ knapp.“ Faust-Gruß, Endkarte „EINSTEIN GEWINNT! – DAS FINALE“. |

## Dialog (Ausgabezeit)

| Zeit (s) | Sprecher | Text | Datei |
|---|---|---|---|
|   2.9 –   6.1 | Kommentator (Helmut Stieglbauer) | „Die Schwerkraft ist zurück – und Einstein am Boden!“ | `p3_k01` |
|   6.2 –  11.3 | Newton (Victor Voss) | „Gute Nacht, Albert. Die Schwerkraft gewinnt immer!“ | `p3_n01` |
|  11.4 –  13.8 | Kommentator (Helmut Stieglbauer) | „Er geht zu Boden! Steht er wieder auf?“ | `p3_k02` |
|  13.9 –  16.0 | Kommentator (Helmut Stieglbauer) | „Das Publikum hält den Atem an …“ | `p3_k03` |
|  16.5 –  21.4 | Newton (Victor Voss) | „Bleib liegen … bitte, bleib liegen.“ | `p3_n02` |
|  22.0 –  27.0 | Einstein (Christian Plasa) | „Du hast eine Sache vergessen, Isaac … Zeit ist relativ.“ | `p3_e01` |
|  27.1 –  30.8 | Newton (Victor Voss) | „Das … ist unmöglich!“ | `p3_n03` |
|  31.0 –  33.8 | Kommentator (Helmut Stieglbauer) | „Er steht auf! Einstein steht wieder auf!“ | `p3_k04` |
|  33.9 –  37.1 | Kommentator (Helmut Stieglbauer) | „Newton gibt alles – Einstein geht in die Knie!“ | `p3_k05` |
|  43.2 –  44.5 | Kommentator (Helmut Stieglbauer) | „Unglaublich …“ | `p3_k06` |
|  49.6 –  52.3 | Kommentator (Helmut Stieglbauer) | „Einstein gewinnt! Was für ein Finale!“ | `p3_k07` |
|  53.9 –  56.3 | Newton (Victor Voss) | „Gut gekämpft, Albert.“ | `p3_n04` |
|  56.4 –  58.8 | Einstein (Christian Plasa) | „Danke, Isaac. Nur relativ knapp.“ | `p3_e02` |

Neu erzeugt mit ElevenLabs: 13 Zeilen, ca. 482 Credits (`eleven_multilingual_v2`; die Flüsterzeile `p3_e01` mit `eleven_v3` und `[whispering]`).

## Anker (Ausgabezeit, s)

`{"snap": 2.8, "landN": 3.5, "landE": 3.6, "gloat": 4.3, "count": 10.7, "hush": 15.3, "nine": 21.6, "rise": 26.7, "fight": 31.3, "hit": 40.9, "land": 46.0, "ten": 49.1, "end": 58.8}`
