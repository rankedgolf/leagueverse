export type ContractYearCalculation = {
  yearNumber: number;
  salary: number;
  bonus: number;
  guaranteedAmount: number;
  capHit: number;
};

export type CalculateContractScheduleInput = {
  startingSalary: number;
  lengthYears: number;
  annualInflationRate: number;
  bonusPerYear?: number;
  guaranteedAmountPerYear?: number;
};

export type ContractScheduleCalculation = {
  years: ContractYearCalculation[];
  totalSalary: number;
  totalBonus: number;
  totalGuaranteed: number;
  totalValue: number;
};

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export const ContractCalculationService = {
  calculateSchedule(
    input: CalculateContractScheduleInput
  ): ContractScheduleCalculation {
    const {
      startingSalary,
      lengthYears,
      annualInflationRate,
      bonusPerYear = 0,
      guaranteedAmountPerYear = 0,
    } = input;

    if (!Number.isFinite(startingSalary) || startingSalary < 0) {
      throw new Error("Starting salary must be a non-negative number.");
    }

    if (!Number.isInteger(lengthYears) || lengthYears < 1) {
      throw new Error("Contract length must be at least one year.");
    }

    if (
      !Number.isFinite(annualInflationRate) ||
      annualInflationRate < 0 ||
      annualInflationRate > 1
    ) {
      throw new Error(
        "Annual inflation rate must be between 0 and 1."
      );
    }

    if (!Number.isFinite(bonusPerYear) || bonusPerYear < 0) {
      throw new Error("Annual bonus must be a non-negative number.");
    }

    if (
      !Number.isFinite(guaranteedAmountPerYear) ||
      guaranteedAmountPerYear < 0
    ) {
      throw new Error(
        "Annual guaranteed amount must be a non-negative number."
      );
    }

    const years: ContractYearCalculation[] = [];

    for (let index = 0; index < lengthYears; index += 1) {
      const salary = roundCurrency(
        startingSalary * Math.pow(1 + annualInflationRate, index)
      );

      const bonus = roundCurrency(bonusPerYear);
      const guaranteedAmount = roundCurrency(
        guaranteedAmountPerYear
      );

      years.push({
        yearNumber: index + 1,
        salary,
        bonus,
        guaranteedAmount,
        capHit: roundCurrency(salary + bonus),
      });
    }

    const totalSalary = roundCurrency(
      years.reduce((total, year) => total + year.salary, 0)
    );

    const totalBonus = roundCurrency(
      years.reduce((total, year) => total + year.bonus, 0)
    );

    const totalGuaranteed = roundCurrency(
      years.reduce(
        (total, year) => total + year.guaranteedAmount,
        0
      )
    );

    return {
      years,
      totalSalary,
      totalBonus,
      totalGuaranteed,
      totalValue: roundCurrency(totalSalary + totalBonus),
    };
  },
};