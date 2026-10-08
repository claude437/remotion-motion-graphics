import { Easing, interpolate } from "remotion";
import { CLAMP, EASE } from "./animation";

/**
 * Persistent objects (sun, nerve, cells, morphing panel) live for the whole
 * video. Each one is described as a list of states; a state change happens
 * over a move window, and the object eases from its previous state into the
 * next one. States may be functions of time (e.g. "follow the line tip").
 */
export type Numeric = Record<string, number>;
export type Phase<S extends Numeric> = {
  /** Move window in seconds. The first phase uses [0, 0]. */
  readonly move: readonly [number, number];
  readonly state: S | ((sec: number) => S);
  readonly easing?: (t: number) => number;
};

const resolve = <S extends Numeric>(s: Phase<S>["state"], sec: number): S =>
  typeof s === "function" ? s(sec) : s;

export const morphStates = <S extends Numeric>(
  sec: number,
  phases: readonly Phase<S>[],
): S => {
  let i = 0;
  while (i + 1 < phases.length && sec >= phases[i + 1].move[0]) i++;
  const cur = resolve(phases[i].state, sec);
  if (i === 0) return cur;
  const [a, b] = phases[i].move;
  const p =
    b <= a
      ? 1
      : interpolate(sec, [a, b], [0, 1], {
          ...CLAMP,
          easing: phases[i].easing ?? EASE.inOut,
        });
  if (p >= 1) return cur;
  const prev = resolve(phases[i - 1].state, sec);
  const out = { ...cur };
  for (const key of Object.keys(cur) as (keyof S)[]) {
    (out[key] as number) =
      (prev[key] as number) +
      ((cur[key] as number) - (prev[key] as number)) * p;
  }
  return out;
};

/** Overshooting ease for "pop" entrances inside morphStates. */
export const BACK_OUT = Easing.bezier(0.34, 1.4, 0.64, 1);
