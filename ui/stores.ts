import { writable } from "@dishuostec/svelte-store";
import { getAllDailyNotes } from "obsidian-daily-notes-interface";

export const dailyNotes = createDailyNotesStore();

function createDailyNotesStore() {
    let hasError = false;
    const store = writable<Record<string, TFile>>(null);
    return {
        reindex: () => {
            try {
                const dailyNotes = getAllDailyNotes();
                store.set(dailyNotes);
                hasError = false;
            } catch (err) {
                if (!hasError) {
                    // Avoid error being shown multiple times
                    console.log("[Calendar] Failed to find daily notes folder", err);
                }
                store.set({});
                hasError = true;
            }
        },
        ...store,
    };
}