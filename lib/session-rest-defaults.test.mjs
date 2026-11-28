import assert from "node:assert/strict";
import test from "node:test";
import {
  getExerciseGroupRestDefaults,
  resolveSessionRest
} from "./session-rest-defaults.ts";

test("explicit custom rest, including zero, has priority", () => {
  assert.equal(resolveSessionRest({ customRest: "00:00", defaultRest: "02:00", existingRest: "01:00" }), "00:00");
  assert.equal(resolveSessionRest({ customRest: "01:30", defaultRest: "02:00", existingRest: "01:00" }), "01:30");
});

test("default rest is used before a fallback existing value", () => {
  assert.equal(resolveSessionRest({ defaultRest: "02:00", existingRest: "01:00" }), "02:00");
  assert.equal(resolveSessionRest({ existingRest: "01:00" }), "01:00");
  assert.equal(resolveSessionRest({}), "");
});

test("group defaults reuse member rests without inventing values", () => {
  assert.deepEqual(getExerciseGroupRestDefaults(["00:30", "01:00"]), {
    restBetweenExercises: "00:30",
    restBetweenRounds: "01:00"
  });
  assert.deepEqual(getExerciseGroupRestDefaults(["", "00:45", "02:00"]), {
    restBetweenExercises: "00:45",
    restBetweenRounds: "02:00"
  });
  assert.deepEqual(getExerciseGroupRestDefaults(["", ""]), {
    restBetweenExercises: undefined,
    restBetweenRounds: undefined
  });
});

test("a single exercise does not produce group defaults", () => {
  assert.deepEqual(getExerciseGroupRestDefaults(["01:00"]), {});
});
