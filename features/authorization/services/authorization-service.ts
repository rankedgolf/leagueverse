import { createClient } from "@/lib/supabase/server";
import {
  Permissions,
  type Permission,
} from "@/features/authorization/dto/permissions";
import {
  Roles,
  type Role,
} from "@/features/authorization/constants/roles";

export const AuthorizationService = {
  async requirePermission(params: {
    leagueId: string;
    permission: Permission;
  }) {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("You must be signed in.");
    }

    const { data: member, error } = await supabase
      .from("league_members")
      .select("role")
      .eq("league_id", params.leagueId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!member) {
      throw new Error("You are not a member of this league.");
    }

    const rolePermissions: Record<Role, Permission[]> = {
      [Roles.Commissioner]: [
        Permissions.ManageLeague,
        Permissions.ManageMembers,
        Permissions.ManagePlayers,
        Permissions.ManageRosters,
        Permissions.ManageContracts,
        Permissions.ManageSalaryCap,
        Permissions.ManageDraft,
        Permissions.ManageTransactions,
      ],

      [Roles.CoCommissioner]: [
        Permissions.ManagePlayers,
        Permissions.ManageRosters,
        Permissions.ManageContracts,
        Permissions.ManageDraft,
        Permissions.ManageTransactions,
      ],

      [Roles.Owner]: [],

      [Roles.Member]: [],

      [Roles.Viewer]: [],
    };

    const memberRole = member.role as Role;

    const allowed = rolePermissions[memberRole]?.includes(params.permission);

    if (!allowed) {
      throw new Error("You do not have permission to perform this action.");
    }
  },
};