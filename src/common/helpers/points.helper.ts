import { NivelHelper } from '../../users/helpers/nivel.helper';

export interface AwardPointsResult {
  novoXp: number;
  novoNivel: number;
  subiuNivel: boolean;
}

/**
 * Awards points and XP to a user within a Prisma transaction.
 * Updates pontos, xp, and nivel atomically.
 */
export async function awardPointsAndXp(
  tx: any,
  userId: number,
  pontos: number,
): Promise<AwardPointsResult> {
  const currentUser = await tx.user.findUnique({
    where: { id: userId },
    select: { xp: true, nivel: true },
  });

  const xpGanho = pontos * 10;
  const { novoXp, novoNivel, subiuNivel } = NivelHelper.adicionarXp(
    Number(currentUser.xp),
    Number(currentUser.nivel),
    xpGanho,
  );

  await tx.user.update({
    where: { id: userId },
    data: {
      pontos: { increment: pontos },
      xp: novoXp,
      nivel: novoNivel,
    },
  });

  return { novoXp, novoNivel, subiuNivel };
}
