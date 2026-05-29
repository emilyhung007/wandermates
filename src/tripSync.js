import { supabase } from "./supabase.js";

const LS_TRIP_ID = "trip_koala_supabase_trip_id";
const LS_ITIN = "trip_koala_itinerary_v6";
const LS_EXP = "trip_koala_expenses_v6";
const LS_SETTLEMENT = "trip_koala_settlement_v1";
const LS_TRIP_META = "trip_koala_trip_meta_v1";
const PAYLOAD_VERSION = 1;

export const DEFAULT_TRIP_META = {
  dateRange: "2026/7/9 – 2026/7/25",
  daysCount: 17,
  segments: [
    { city: "🌴 Brisbane", dates: "7/9 – 7/15", daysLabel: "7 天" },
    { city: "🌊 Sydney", dates: "7/15 – 7/18", daysLabel: "4 天" },
    { city: "☕ Melbourne", dates: "7/18 – 7/25", daysLabel: "8 天" },
  ],
  routeLabel: "Brisbane → Sydney → Melbourne",
  title: "Trip to Australia",
};

const lsRead = (k, fb) => {
  try {
    const r = localStorage.getItem(k);
    return r ? JSON.parse(r) : fb;
  } catch {
    return fb;
  }
};

const lsWrite = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* quota / private mode */
  }
};

export function buildPayload({ itinerary, expenses, settlement, trip }) {
  return {
    v: PAYLOAD_VERSION,
    itinerary,
    expenses,
    settlement: { paidKeys: settlement?.paidKeys ?? [] },
    trip: trip ?? DEFAULT_TRIP_META,
  };
}

export function parseDestinations(raw) {
  if (!raw || typeof raw !== "string") return null;
  try {
    const data = JSON.parse(raw);
    if (data?.v !== PAYLOAD_VERSION) return null;
    return {
      itinerary: Array.isArray(data.itinerary) ? data.itinerary : null,
      expenses: Array.isArray(data.expenses) ? data.expenses : null,
      settlement: {
        paidKeys: Array.isArray(data.settlement?.paidKeys) ? data.settlement.paidKeys : [],
      },
      trip: data.trip && typeof data.trip === "object" ? data.trip : null,
    };
  } catch {
    return null;
  }
}

function readLegacyLocal(defaultItinerary, defaultExpenses) {
  const itinerary = lsRead(LS_ITIN, null);
  const expenses = lsRead(LS_EXP, null);
  const paidKeys = lsRead(LS_SETTLEMENT, []);
  const trip = lsRead(LS_TRIP_META, null);
  return {
    itinerary: Array.isArray(itinerary) ? itinerary : defaultItinerary,
    expenses: Array.isArray(expenses) ? expenses : defaultExpenses,
    settlement: { paidKeys: Array.isArray(paidKeys) ? paidKeys : [] },
    trip: trip && typeof trip === "object" ? trip : DEFAULT_TRIP_META,
  };
}

function cacheLocally(state) {
  lsWrite(LS_ITIN, state.itinerary);
  lsWrite(LS_EXP, state.expenses);
  lsWrite(LS_SETTLEMENT, state.settlement.paidKeys);
  lsWrite(LS_TRIP_META, state.trip);
}

function rowToState(row, defaults) {
  const parsed = parseDestinations(row?.destinations);
  if (parsed?.itinerary && parsed?.expenses) {
    return {
      tripId: row.id,
      itinerary: parsed.itinerary,
      expenses: parsed.expenses,
      settlement: parsed.settlement,
      trip: parsed.trip ?? DEFAULT_TRIP_META,
    };
  }
  const legacy = readLegacyLocal(defaults.defaultItinerary, defaults.defaultExpenses);
  return { tripId: row.id, ...legacy };
}

/** Load trip row from Supabase (create row if missing). Falls back to localStorage then defaults. */
export async function loadTripState(defaults) {
  const fallback = readLegacyLocal(defaults.defaultItinerary, defaults.defaultExpenses);

  let tripId = null;
  try {
    tripId = localStorage.getItem(LS_TRIP_ID);
  } catch {
    /* ignore */
  }

  try {
    if (tripId) {
      const { data, error } = await supabase
        .from("trips")
        .select('id, title, destinations, "start date", "end date", "total spent"')
        .eq("id", tripId)
        .maybeSingle();
      if (!error && data) {
        const state = rowToState(data, defaults);
        cacheLocally(state);
        return state;
      }
    }

    const { data: rows, error: listErr } = await supabase
      .from("trips")
      .select('id, title, destinations, "start date", "end date", "total spent"')
      .order("created_at", { ascending: true })
      .limit(1);

    if (!listErr && rows?.length) {
      const state = rowToState(rows[0], defaults);
      try {
        localStorage.setItem(LS_TRIP_ID, state.tripId);
      } catch {
        /* ignore */
      }
      cacheLocally(state);
      return state;
    }

    const payload = buildPayload(fallback);
    const totalSpent = fallback.expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const { data: created, error: createErr } = await supabase
      .from("trips")
      .insert({
        title: fallback.trip.title,
        destinations: JSON.stringify(payload),
        "start date": null,
        "end date": null,
        "total spent": totalSpent,
      })
      .select("id")
      .single();

    if (!createErr && created?.id) {
      try {
        localStorage.setItem(LS_TRIP_ID, created.id);
      } catch {
        /* ignore */
      }
      cacheLocally(fallback);
      return { tripId: created.id, ...fallback };
    }
  } catch {
    /* network / supabase unavailable */
  }

  return { tripId: null, ...fallback };
}

/** Persist full app state to Supabase + localStorage cache. */
export async function saveTripState(tripId, state) {
  cacheLocally(state);
  if (!tripId) return { ok: false, error: "no_trip_id" };

  const payload = buildPayload(state);
  const totalSpent = state.expenses.reduce((s, e) => s + (e.amount || 0), 0);

  try {
    const { error } = await supabase
      .from("trips")
      .update({
        title: state.trip?.title ?? DEFAULT_TRIP_META.title,
        destinations: JSON.stringify(payload),
        "start date": null,
        "end date": null,
        "total spent": totalSpent,
      })
      .eq("id", tripId);

    return { ok: !error, error: error?.message };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export function subscribeTripUpdates(tripId, onRemote) {
  if (!tripId) return () => {};

  const channel = supabase
    .channel(`trip-sync-${tripId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "trips",
        filter: `id=eq.${tripId}`,
      },
      (payload) => {
        const parsed = parseDestinations(payload.new?.destinations);
        if (parsed?.itinerary && parsed?.expenses) {
          onRemote({
            itinerary: parsed.itinerary,
            expenses: parsed.expenses,
            settlement: parsed.settlement,
            trip: parsed.trip ?? DEFAULT_TRIP_META,
          });
        }
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
