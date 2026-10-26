# Terrible Workout Tracker

A frontend-only React workout tracker. All data lives in your browser's `localStorage`.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (http://localhost:5174).

`npm run build` makes a static build in `dist/`.

## How it works

- **Calendar** – click any date to start a workout. Dates with a workout are highlighted in orange
  and show the exercises logged. Use the month/year dropdowns or ‹ › to jump around.
- **Workout panel** – name the workout (optional), add exercises, add sets, and for each set enter
  reps, weight and kg/lbs. "+ Add set" copies the previous set so you only change what's different.
  Reorder exercises with ↑ ↓ or drag the ⋮⋮ handle. "Delete workout" asks for a second click.
  Opening an empty date and closing without adding anything doesn't keep a blank workout.
- **Compare** – "Compare workouts" (top right) or "Compare…" inside a workout opens two workouts side
  by side. Pick any two dates from the dropdowns. Exercises with the same name in both are lined
  up in a table showing the change in top weight, volume and reps.
- **kg / lbs toggle** (top right) sets the default unit for new sets and the unit totals are shown in.
  Sets keep their own unit, and mixed units are converted when totalling.

Data is stored under the `twt.workouts.v1` key; clearing site data wipes it.
