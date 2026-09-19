// Regra atual: 12/13/15=1 pessoa, 22/24/25=2 pessoas, 32/33/35=3 pessoas, 42=4 pessoas, 52/53/55=5 pessoas, demais=1 pessoa
export const PESO_POR_VALOR: Record<number, number> = {
  12: 1,
  13: 1,
  15: 1,
  22: 2,
  24: 2,
  25: 2,
  32: 3,
  33: 3,
  35: 3,
  42: 4,
  52: 5,
  53: 5,
  55: 5,
};

export function pesoPessoa(valor: number): number {
  if (valor === 12 || valor === 13 || valor === 15) return 1;
  if (valor === 22 || valor === 24 || valor === 25) return 2;
  if (valor === 32 || valor === 33 || valor === 35) return 3;
  if (valor === 42) return 4;
  if (valor === 52 || valor === 53 || valor === 55) return 5;
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
