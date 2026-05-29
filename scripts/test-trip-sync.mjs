import { loadTripState, saveTripState, parseDestinations } from "../src/tripSync.js";
import { supabase } from "../src/supabase.js";

const defItin = [{ id: 1, name: "Sync Test" }];
const defExp = [
  {
    id: 1,
    name: "Coffee",
    amount: 10,
    paidBy: "emily",
    splitAmong: ["emily"],
    category: "food",
    city: "brisbane",
    date: "Jul 9",
    emoji: "💸",
    notes: "",
  },
];

const loaded = await loadTripState({ defaultItinerary: defItin, defaultExpenses: defExp });
if (!loaded.tripId) {
  console.error("FAIL: no trip id");
  process.exit(1);
}

const save = await saveTripState(loaded.tripId, {
  itinerary: loaded.itinerary,
  expenses: loaded.expenses,
  settlement: { paidKeys: ["test-key"] },
  trip: loaded.trip,
});
if (!save.ok) {
  console.error("FAIL: save", save.error);
  process.exit(1);
}

const { data, error } = await supabase
  .from("trips")
  .select("destinations")
  .eq("id", loaded.tripId)
  .single();
if (error) {
  console.error("FAIL: read", error.message);
  process.exit(1);
}

const parsed = parseDestinations(data.destinations);
if (!parsed?.itinerary?.length || parsed.settlement.paidKeys[0] !== "test-key") {
  console.error("FAIL: roundtrip payload mismatch");
  process.exit(1);
}

console.log("OK: Supabase trip sync load/save roundtrip");
