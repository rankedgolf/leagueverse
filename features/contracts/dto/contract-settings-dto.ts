export type ContractSettingsDTO = {
  id: string;
  leagueId: string;
  salaryCap: number;
  minimumSalary: number;
  maximumContractLength: number;
  maximumContractYearsPerTeam: number;
  annualInflationRate: number;
  freeAgencyMode: string;
  playerPersonalityModeEnabled: boolean;
};