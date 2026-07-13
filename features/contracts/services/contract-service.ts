import type {
  ContractDTO,
  ContractYearDTO,
} from "@/features/contracts/dto/contract-dto";
import { ContractRepository } from "@/features/contracts/repositories/contract-repository";

export const ContractService = {
  async getLeagueContracts(leagueId: string): Promise<ContractDTO[]> {
    const contracts = await ContractRepository.getByLeague(leagueId);

    return contracts.map((contract) => {
      const team = Array.isArray(contract.teams)
        ? contract.teams[0]
        : contract.teams;

      const leaguePlayer = Array.isArray(contract.league_players)
        ? contract.league_players[0]
        : contract.league_players;

      const playerRelation = leaguePlayer?.players;

      const player = Array.isArray(playerRelation)
        ? playerRelation[0]
        : playerRelation;

      const startSeason = Array.isArray(contract.start_season)
        ? contract.start_season[0]
        : contract.start_season;

      const endSeason = Array.isArray(contract.end_season)
        ? contract.end_season[0]
        : contract.end_season;

      const years: ContractYearDTO[] = (contract.contract_years ?? [])
        .map((year) => {
          const season = Array.isArray(year.seasons)
            ? year.seasons[0]
            : year.seasons;

          const salary = Number(year.salary ?? 0);
          const bonus = Number(year.bonus ?? 0);

          return {
            id: year.id,
            seasonId: year.season_id,
            seasonName: season?.name ?? "Unknown Season",
            salary,
            bonus,
            guaranteedAmount: Number(year.guaranteed_amount ?? 0),
            capHit: salary + bonus,
            isOptionYear: year.is_option_year ?? false,
            optionType: year.option_type ?? null,
          };
        })
        .sort((a, b) => a.seasonName.localeCompare(b.seasonName));

      return {
        id: contract.id,
        leagueId: contract.league_id,
        teamId: contract.team_id,
        teamName: team?.name ?? "Unknown Team",
        leaguePlayerId: contract.league_player_id,
        playerId: leaguePlayer?.player_id ?? "",
        playerName:
          player?.display_name ??
          player?.full_name ??
          "Unknown Player",
        position: player?.position ?? null,
        proTeam: player?.pro_team ?? null,
        contractType: contract.contract_type,
        status: contract.status,
        signedAt: contract.signed_at,
        startSeasonId: contract.starts_season_id,
        startSeasonName: startSeason?.name ?? "Unknown Season",
        endSeasonId: contract.ends_season_id,
        endSeasonName: endSeason?.name ?? "Unknown Season",
        totalValue: Number(contract.total_value ?? 0),
        guaranteedValue: Number(contract.guaranteed_value ?? 0),
        notes: contract.notes ?? null,
        years,
      };
    });
  },
};