// Sistema de Níveis baseado em XP
export class NivelHelper {
  // Calcula XP necessário para o próximo nível (progressão exponencial)
  static getXpParaProximoNivel(nivelAtual: number): number {
    return Math.floor(100 * Math.pow(1.5, nivelAtual - 1));
  }

  // Calcula nível baseado no XP total
  static calcularNivel(xpTotal: number): number {
    let nivel = 1;
    let xpAcumulado = 0;

    while (xpAcumulado + this.getXpParaProximoNivel(nivel) <= xpTotal) {
      xpAcumulado += this.getXpParaProximoNivel(nivel);
      nivel++;
    }

    return nivel;
  }

  // Retorna título baseado no nível
  static getTitulo(nivel: number): string {
    if (nivel >= 50) return '🏆 Lenda Eco';
    if (nivel >= 40) return '⭐ Mestre Verde';
    if (nivel >= 30) return '🌟 Guardião da Natureza';
    if (nivel >= 20) return '🌿 Eco Especialista';
    if (nivel >= 10) return '🌱 Defensor Ambiental';
    if (nivel >= 5) return '🍃 Eco Entusiasta';
    return '🌾 Iniciante Verde';
  }

  // Calcula XP atual no nível (progresso dentro do nível)
  static getXpNoNivel(xpTotal: number, nivel: number): number {
    let xpAcumulado = 0;

    for (let i = 1; i < nivel; i++) {
      xpAcumulado += this.getXpParaProximoNivel(i);
    }

    return xpTotal - xpAcumulado;
  }

  // Adiciona XP e retorna se subiu de nível
  static adicionarXp(
    xpAtual: number,
    nivelAtual: number,
    xpGanho: number,
  ): { novoXp: number; novoNivel: number; subiuNivel: boolean } {
    const novoXp = xpAtual + xpGanho;
    const novoNivel = this.calcularNivel(novoXp);
    const subiuNivel = novoNivel > nivelAtual;

    return { novoXp, novoNivel, subiuNivel };
  }
}
