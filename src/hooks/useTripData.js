import { useState, useEffect, useRef, useCallback } from "react";
import {
  DEFAULT_TRIP_META,
  loadTripState,
  saveTripState,
  subscribeTripUpdates,
} from "../tripSync.js";

const SAVE_DEBOUNCE_MS = 400;

/**
 * Trip data backed by Supabase (`trips.destinations` JSON) with localStorage cache.
 * API matches the former usePersistedState pattern for itinerary / expenses.
 */
export function useTripData({ defaultItinerary, defaultExpenses }) {
  const [itinerary, setItineraryState] = useState(defaultItinerary);
  const [expenses, setExpensesState] = useState(defaultExpenses);
  const [settlementPaid, setSettlementPaidState] = useState([]);
  const [trip, setTripState] = useState(DEFAULT_TRIP_META);
  const [ready, setReady] = useState(false);

  const tripIdRef = useRef(null);
  const saveTimerRef = useRef(null);
  const skipRemoteRef = useRef(false);
  const stateRef = useRef({
    itinerary: defaultItinerary,
    expenses: defaultExpenses,
    settlement: { paidKeys: [] },
    trip: DEFAULT_TRIP_META,
  });

  const flushSave = useCallback(() => {
    const id = tripIdRef.current;
    const s = stateRef.current;
    if (!id) return;
    skipRemoteRef.current = true;
    saveTripState(id, s).finally(() => {
      window.setTimeout(() => {
        skipRemoteRef.current = false;
      }, 800);
    });
  }, []);

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      flushSave();
    }, SAVE_DEBOUNCE_MS);
  }, [flushSave]);

  const syncStateRef = useCallback((partial) => {
    stateRef.current = { ...stateRef.current, ...partial };
    scheduleSave();
  }, [scheduleSave]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const loaded = await loadTripState({ defaultItinerary, defaultExpenses });
      if (cancelled) return;

      tripIdRef.current = loaded.tripId;
      stateRef.current = {
        itinerary: loaded.itinerary,
        expenses: loaded.expenses,
        settlement: loaded.settlement,
        trip: loaded.trip,
      };

      setItineraryState(loaded.itinerary);
      setExpensesState(loaded.expenses);
      setSettlementPaidState(loaded.settlement.paidKeys);
      setTripState(loaded.trip);
      setReady(true);
    })();

    return () => {
      cancelled = true;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [defaultItinerary, defaultExpenses]);

  useEffect(() => {
    if (!ready || !tripIdRef.current) return undefined;

    return subscribeTripUpdates(tripIdRef.current, (remote) => {
      if (skipRemoteRef.current) return;
      stateRef.current = {
        itinerary: remote.itinerary,
        expenses: remote.expenses,
        settlement: remote.settlement,
        trip: remote.trip,
      };
      setItineraryState(remote.itinerary);
      setExpensesState(remote.expenses);
      setSettlementPaidState(remote.settlement.paidKeys);
      setTripState(remote.trip);
    });
  }, [ready]);

  const setItinerary = useCallback((up) => {
    setItineraryState((prev) => {
      const next = typeof up === "function" ? up(prev) : up;
      syncStateRef({ itinerary: next });
      return next;
    });
  }, [syncStateRef]);

  const setExpenses = useCallback((up) => {
    setExpensesState((prev) => {
      const next = typeof up === "function" ? up(prev) : up;
      syncStateRef({ expenses: next });
      return next;
    });
  }, [syncStateRef]);

  const setSettlementPaid = useCallback((up) => {
    setSettlementPaidState((prev) => {
      const next = typeof up === "function" ? up(prev) : up;
      syncStateRef({ settlement: { paidKeys: next } });
      return next;
    });
  }, [syncStateRef]);

  const resetToDefaults = useCallback(async () => {
    const next = {
      itinerary: defaultItinerary,
      expenses: defaultExpenses,
      settlement: { paidKeys: [] },
      trip: DEFAULT_TRIP_META,
    };
    stateRef.current = next;
    setItineraryState(next.itinerary);
    setExpensesState(next.expenses);
    setSettlementPaidState([]);
    setTripState(next.trip);
    if (tripIdRef.current) {
      skipRemoteRef.current = true;
      await saveTripState(tripIdRef.current, next);
      window.setTimeout(() => {
        skipRemoteRef.current = false;
      }, 800);
    }
  }, [defaultItinerary, defaultExpenses]);

  return {
    itinerary,
    setItinerary,
    expenses,
    setExpenses,
    settlementPaid,
    setSettlementPaid,
    trip,
    ready,
    resetToDefaults,
  };
}
