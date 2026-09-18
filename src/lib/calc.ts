// Regra atual (confirmada): 15=1 pessoa, 25=2 pessoas, 35=3 pessoas, demais valores=1 pessoa
export const PESO_POR_VALOR: Record<number, number> = {
  15: 1,
  25: 2,
  35: 3,
};

export function pesoPessoa(valor: number): number {
  if (valor === 15) return 1;
  if (valor === 25) return 2;
  if (valor === 35) return 3;
  return 1; // demais valores = 1 pessoa
}

export function calcPessoas(entries: { value: number }[]): number {
  let total = 0;
  for (const e of entries) {
    total += pesoPessoa(e.value);
  }
  return total;
}

export function calcTotaisPorSemana(entries: { week: number; value: number }[]) {
  const porSemana: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalMes = 0;
  for (const e of entries) {
    if (porSemana[e.week] !== undefined) porSemana[e.week] += e.value;
    else porSemana[e.week] = e.value;
    totalMes += e.value;
  }
  return { porSemana, totalMes, pessoas: calcPessoas(entries) };
}

export const VALORES_PERMITIDOS = [12, 13, 15, 20, 22, 23, 24, 25, 30, 32, 33, 35, 40, 42, 44, 45, 50, 52, 53, 55, 60, 65, 70, 73, 74, 80, 92, 100, 105, 120, 150, 153, 200, 243, 250, 266, 300, 357, 833, 1203] as const;
// mas liberamos qualquer valor >0
