
Extras

Tillgängliga timeslots skapas med hänsyn till:
- Öppettider och besökslängden definierar vilka timeslots som visas:
  - Öppettider. Öppettider definieras som array av arrays (just nu hårdkodat [11,14],[17,23]) vilket kan lyftas till adminvy och styras därifrån.
  - Besökets längd. Bara om hela valda reserationslängden ryms inom öppettider (både start- och sluttid) visas timesloten.
- Antalet gäster och dagens datum och tid definierar vilka timeslots är valbara (inte "släckta" och överstrukna)
  - Endast timeslots som har plats för vald besökslängd och vald antalet gäster kan väljas för reservation.
  - Om reservationen gäller den aktuella dagen, bara tider som startar om 2 timmar från nu kan väljas för reservation.
Dagar som passerat eller ligger för långt fram i tiden (en månad just nu, även detta kan flyttas till adminvyn och styras därifrån) får inte reserveras och inga timeslots dyker upp.
