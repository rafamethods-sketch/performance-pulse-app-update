import assert from "node:assert/strict";
import test from "node:test";
import {
  cleanupOrphanGroups,
  getExerciseGroupMethodLabel,
  groupExercises,
  isExerciseGroupCardinalityValid,
  ungroupExercises,
  validateExerciseGroups
} from "./session-exercise-groups.ts";

const exercises = ["one", "two", "three", "four", "five"].map((id) => ({
  id,
  name: id,
  sessionBlock: "main"
}));

function conventionalGroup(memberCount) {
  return {
    id: `group-${memberCount}`,
    method: "series",
    restBetweenExercises: "00:00",
    restBetweenExercisesSource: "custom",
    restBetweenRounds: "02:00",
    restBetweenRoundsSource: "custom",
    sessionBlock: "main"
  };
}

test("conventional group names are derived from cardinality", () => {
  assert.equal(getExerciseGroupMethodLabel("series", 2), "Biserie");
  assert.equal(getExerciseGroupMethodLabel("series", 3), "Triserie");
  assert.equal(getExerciseGroupMethodLabel("series", 4), "Circuito");
  assert.equal(getExerciseGroupMethodLabel("series", 5), "Circuito");
});

test("special methods retain their restrictions", () => {
  assert.equal(isExerciseGroupCardinalityValid("contrast", 2), true);
  assert.equal(isExerciseGroupCardinalityValid("contrast", 3), false);
  assert.equal(isExerciseGroupCardinalityValid("alternating", 2), true);
  assert.equal(isExerciseGroupCardinalityValid("alternating", 4), true);
});

test("historical superset and circuit semantics stay unchanged", () => {
  assert.equal(getExerciseGroupMethodLabel("superset", 2), "Biserie");
  assert.equal(isExerciseGroupCardinalityValid("superset", 2), true);
  assert.equal(getExerciseGroupMethodLabel("circuit", 2), "Circuito");
  assert.equal(getExerciseGroupMethodLabel("circuit", 3), "Circuito");
  assert.equal(isExerciseGroupCardinalityValid("circuit", 2), true);
  assert.equal(isExerciseGroupCardinalityValid("circuit", 3), true);
});

test("grouping preserves member order, identifiers and custom rests", () => {
  const group = conventionalGroup(3);
  const result = groupExercises(exercises, [], group, ["two", "three", "four"]);

  assert.deepEqual(result.exercises.map((exercise) => exercise.id), ["one", "two", "three", "four", "five"]);
  assert.deepEqual(result.exercises.filter((exercise) => exercise.exerciseGroupId === group.id).map((exercise) => exercise.id), ["two", "three", "four"]);
  assert.deepEqual(result.groups, [group]);
  assert.equal(validateExerciseGroups(result.exercises, result.groups), true);
});

test("ungrouping removes only membership data", () => {
  const group = conventionalGroup(3);
  const grouped = groupExercises(exercises, [], group, ["one", "two", "three"]);
  const ungrouped = ungroupExercises(grouped.exercises, grouped.groups, group.id);

  assert.deepEqual(ungrouped.exercises.map((exercise) => ({ id: exercise.id, name: exercise.name, sessionBlock: exercise.sessionBlock })), exercises);
  assert.deepEqual(ungrouped.groups, []);
});

test("conventional labels follow edited cardinality while special groups are not converted", () => {
  const group = conventionalGroup(4);
  const grouped = groupExercises(exercises, [], group, ["one", "two", "three", "four"]);
  const reducedExercises = grouped.exercises.filter((exercise) => exercise.id !== "four");
  const cleaned = cleanupOrphanGroups(reducedExercises, grouped.groups);

  assert.equal(cleaned.groups[0].method, "series");
  assert.equal(getExerciseGroupMethodLabel(cleaned.groups[0].method, 3), "Triserie");

  const historicalCircuit = { ...group, id: "historical-circuit", method: "circuit" };
  assert.equal(getExerciseGroupMethodLabel(historicalCircuit.method, 3), "Circuito");
});

test("saved groups round-trip without losing type, identifiers or explicit zero rest", () => {
  const group = conventionalGroup(2);
  const grouped = groupExercises(exercises, [], group, ["one", "two"]);
  const restored = JSON.parse(JSON.stringify(grouped));

  assert.equal(restored.groups[0].method, "series");
  assert.equal(restored.groups[0].restBetweenExercises, "00:00");
  assert.equal(restored.groups[0].restBetweenRounds, "02:00");
  assert.deepEqual(restored.exercises.map((exercise) => exercise.id), grouped.exercises.map((exercise) => exercise.id));
  assert.equal(validateExerciseGroups(restored.exercises, restored.groups), true);
});
