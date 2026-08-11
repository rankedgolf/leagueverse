export type FreeAgencyPersonality = {
  moneyWeight: number;
  winningWeight: number;
  roleWeight: number;
  securityWeight: number;
  stabilityWeight: number;
  loyaltyWeight: number;

  riskTolerance:
    | "low"
    | "medium"
    | "high";

  decisionTendency:
    | "fast"
    | "normal"
    | "patient"
    | "market_tester";

  personalitySeed: number;
};

export type FreeAgencyPlayerContext = {
  age: number | null;
  yearsExp: number | null;

  position: string | null;

  searchRank: number | null;
  depthChartOrder: number | null;
};

type PersonalityWeights = {
  moneyWeight: number;
  winningWeight: number;
  roleWeight: number;
  securityWeight: number;
  stabilityWeight: number;
  loyaltyWeight: number;
};

type PlayerArchetype =
  | "elite_young_star"
  | "young_emerging"
  | "prime_star"
  | "prime_starter"
  | "veteran_star"
  | "veteran_role_player"
  | "opportunity_seeker"
  | "developmental"
  | "balanced";

function createSeededRandom(
  seed: number,
) {
  let state = seed >>> 0;

  return function random() {
    state += 0x6d2b79f5;

    let value = state;

    value = Math.imul(
      value ^ (value >>> 15),
      value | 1,
    );

    value ^=
      value +
      Math.imul(
        value ^ (value >>> 7),
        value | 61,
      );

    return (
      ((value ^
        (value >>> 14)) >>>
        0) /
      4294967296
    );
  };
}

function normalizeWeights(
  weights: PersonalityWeights,
): PersonalityWeights {
  const total =
    Object.values(weights).reduce(
      (sum, value) =>
        sum + value,
      0,
    );

  return {
    moneyWeight:
      weights.moneyWeight / total,

    winningWeight:
      weights.winningWeight /
      total,

    roleWeight:
      weights.roleWeight / total,

    securityWeight:
      weights.securityWeight /
      total,

    stabilityWeight:
      weights.stabilityWeight /
      total,

    loyaltyWeight:
      weights.loyaltyWeight /
      total,
  };
}

function getPlayerArchetype(
  context: FreeAgencyPlayerContext,
): PlayerArchetype {
  const age =
    context.age ?? 27;

  const yearsExp =
    context.yearsExp ?? 4;

  const rank =
    context.searchRank ?? 9999;

  const depthChartOrder =
    context.depthChartOrder ?? 99;

  const elite =
    rank <= 25;

  const strongStarter =
    rank <= 100;

  const depthChartStarter =
    depthChartOrder <= 1;

  if (
    age <= 25 &&
    elite
  ) {
    return "elite_young_star";
  }

  if (
    age <= 25 &&
    (strongStarter ||
      depthChartStarter)
  ) {
    return "young_emerging";
  }

  if (
    age >= 26 &&
    age <= 29 &&
    elite
  ) {
    return "prime_star";
  }

  if (
    age >= 26 &&
    age <= 29 &&
    strongStarter
  ) {
    return "prime_starter";
  }

  if (
    age >= 30 &&
    elite
  ) {
    return "veteran_star";
  }

  if (
    age >= 30 &&
    (
      strongStarter ||
      depthChartStarter
    )
  ) {
    return "veteran_role_player";
  }

  if (
    depthChartOrder >= 2 ||
    rank > 250
  ) {
    return "opportunity_seeker";
  }

  if (
    yearsExp <= 2 &&
    rank > 100
  ) {
    return "developmental";
  }

  return "balanced";
}

function getBaseWeights(
  archetype: PlayerArchetype,
): PersonalityWeights {
  switch (archetype) {
    case "elite_young_star":
      return {
        moneyWeight: 0.3,
        winningWeight: 0.17,
        roleWeight: 0.23,
        securityWeight: 0.17,
        stabilityWeight: 0.08,
        loyaltyWeight: 0.05,
      };

    case "young_emerging":
      return {
        moneyWeight: 0.25,
        winningWeight: 0.1,
        roleWeight: 0.35,
        securityWeight: 0.18,
        stabilityWeight: 0.07,
        loyaltyWeight: 0.05,
      };

    case "prime_star":
      return {
        moneyWeight: 0.29,
        winningWeight: 0.27,
        roleWeight: 0.16,
        securityWeight: 0.15,
        stabilityWeight: 0.08,
        loyaltyWeight: 0.05,
      };

    case "prime_starter":
      return {
        moneyWeight: 0.3,
        winningWeight: 0.18,
        roleWeight: 0.22,
        securityWeight: 0.17,
        stabilityWeight: 0.08,
        loyaltyWeight: 0.05,
      };

    case "veteran_star":
      return {
        moneyWeight: 0.2,
        winningWeight: 0.35,
        roleWeight: 0.1,
        securityWeight: 0.2,
        stabilityWeight: 0.1,
        loyaltyWeight: 0.05,
      };

    case "veteran_role_player":
      return {
        moneyWeight: 0.23,
        winningWeight: 0.24,
        roleWeight: 0.17,
        securityWeight: 0.23,
        stabilityWeight: 0.08,
        loyaltyWeight: 0.05,
      };

    case "opportunity_seeker":
      return {
        moneyWeight: 0.24,
        winningWeight: 0.06,
        roleWeight: 0.34,
        securityWeight: 0.24,
        stabilityWeight: 0.07,
        loyaltyWeight: 0.05,
      };

    case "developmental":
      return {
        moneyWeight: 0.2,
        winningWeight: 0.08,
        roleWeight: 0.38,
        securityWeight: 0.22,
        stabilityWeight: 0.07,
        loyaltyWeight: 0.05,
      };

    default:
      return {
        moneyWeight: 0.28,
        winningWeight: 0.18,
        roleWeight: 0.22,
        securityWeight: 0.17,
        stabilityWeight: 0.1,
        loyaltyWeight: 0.05,
      };
  }
}

function applyIndividualVariation(
  base:
    PersonalityWeights,
  random: () => number,
  variation:
    | "low"
    | "medium"
    | "high",
): PersonalityWeights {
  const variance =
    variation === "low"
      ? 0.08
      : variation === "medium"
        ? 0.16
        : 0.25;

  function adjust(
    value: number,
  ) {
    const multiplier =
      1 +
      (random() * 2 - 1) *
        variance;

    return Math.max(
      0.01,
      value * multiplier,
    );
  }

  return normalizeWeights({
    moneyWeight:
      adjust(base.moneyWeight),

    winningWeight:
      adjust(base.winningWeight),

    roleWeight:
      adjust(base.roleWeight),

    securityWeight:
      adjust(base.securityWeight),

    stabilityWeight:
      adjust(base.stabilityWeight),

    loyaltyWeight:
      adjust(base.loyaltyWeight),
  });
}

function chooseRiskTolerance(
  context:
    FreeAgencyPlayerContext,
  random: () => number,
): FreeAgencyPersonality["riskTolerance"] {
  const age =
    context.age ?? 27;

  const roll = random();

  if (age >= 30) {
    if (roll < 0.5) {
      return "low";
    }

    if (roll < 0.9) {
      return "medium";
    }

    return "high";
  }

  if (age <= 24) {
    if (roll < 0.2) {
      return "low";
    }

    if (roll < 0.65) {
      return "medium";
    }

    return "high";
  }

  if (roll < 0.3) {
    return "low";
  }

  if (roll < 0.8) {
    return "medium";
  }

  return "high";
}

function chooseDecisionTendency(
  context:
    FreeAgencyPlayerContext,
  random: () => number,
): FreeAgencyPersonality["decisionTendency"] {
  const rank =
    context.searchRank ?? 9999;

  const roll = random();

  if (rank <= 50) {
    if (roll < 0.1) {
      return "fast";
    }

    if (roll < 0.4) {
      return "normal";
    }

    if (roll < 0.7) {
      return "patient";
    }

    return "market_tester";
  }

  if (rank > 250) {
    if (roll < 0.35) {
      return "fast";
    }

    if (roll < 0.8) {
      return "normal";
    }

    if (roll < 0.95) {
      return "patient";
    }

    return "market_tester";
  }

  if (roll < 0.2) {
    return "fast";
  }

  if (roll < 0.65) {
    return "normal";
  }

  if (roll < 0.85) {
    return "patient";
  }

  return "market_tester";
}

export function generateFreeAgencyPersonality(
  seed: number,
  context: FreeAgencyPlayerContext,
  variation:
    | "low"
    | "medium"
    | "high" = "high",
): FreeAgencyPersonality {
  const random =
    createSeededRandom(seed);

  const archetype =
    getPlayerArchetype(
      context,
    );

  const baseWeights =
    getBaseWeights(
      archetype,
    );

  const weights =
    applyIndividualVariation(
      baseWeights,
      random,
      variation,
    );

  return {
    ...weights,

    riskTolerance:
      chooseRiskTolerance(
        context,
        random,
      ),

    decisionTendency:
      chooseDecisionTendency(
        context,
        random,
      ),

    personalitySeed:
      seed,
  };
}