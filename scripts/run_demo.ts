import { accessGaps, guestLane, summary } from "../src/services/entraGuestAccessGovernorService.js";

console.log("entra-guest-access-governor demo");
console.log(summary());
console.log(guestLane().map((lane) => ({ lane: lane.lane, owner: lane.owner, status: lane.status })));
console.log(accessGaps().slice(0, 3));
