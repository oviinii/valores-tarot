/**
 * Importa o /tmp/full.xlsx (baixado da planilha Google) para o SQLite
 * Uso: npx tsx scripts/import-xlsx.ts --email seu@email.com --xlsx /tmp/full.xlsx
 * Cria meses e entries vinculados ao usuário informado.
 */
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const emailIdx = args.indexOf("--email");
  const xlsxIdx = args.indexOf("--xlsx");
  const email = emailIdx >= 0 ? args[emailIdx + 1] : null;
  const xlsxPath = xlsxIdx >= 0 ? args[xlsxIdx + 1] : "/tmp/full.xlsx";
  if (!email) {
    console.error("Uso: npx tsx scripts/import-xlsx.ts --email seu@email.com [--xlsx /tmp/full.xlsx]");
    process.exit(1);
  }
  if (!fs.existsSync(xlsxPath)) {
    console.error("Arquivo não encontrado:", xlsxPath);
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    console.error("Usuário não encontrado, crie conta primeiro em /register com email", email);
    process.exit(1);
  }

  let workbook: any;
  try {
    const mod: any = await import("exceljs");
    const ExcelJS = mod.default || mod;
    workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(xlsxPath);
  } catch (e) {
    console.error("Instale exceljs: npm install exceljs");
    console.error(e);
    process.exit(1);
  }

  // Mapeia Página1..Página11 para meses reais.
  // Planilha: Página11 = mês mais recente (set/2026), Página1 = mais antigo (nov/2025)
  // Para manter fiel, mapeamos de trás pra frente a partir de hoje (ou 2026-09 fixo para reprodutibilidade)
  const sheetNames: string[] = [];
  workbook.eachSheet((ws: any) => sheetNames.push(ws.name));
  console.log("Abas encontradas:", sheetNames);
  const base = new Date(); // hoje = 2026-09 no env atual, mas usa data real para futuro
  // trava base em 2026-09 para compat com histórico atual; se quiser dinâmico, use new Date()
  const baseYear = base.getFullYear();
  const baseMonth = base.getMonth() + 1; // 1-12
  const totalSheets = workbook.worksheets.length;

  for (let idx = 0; idx < workbook.worksheets.length; idx++) {
    const ws = workbook.worksheets[idx];
    const label = ws.name.trim();
    // offset: Página1 (idx0) = base - (total-1) meses, Pagina11 (idx10) = base
    const offset = totalSheets - 1 - idx;
    const total = baseYear * 12 + baseMonth - 1 - offset;
    const year = Math.floor(total / 12);
    const monthNum = (total % 12) + 1;

    // upsert mês
    const month = await prisma.month.upsert({
      where: { userId_year_month: { userId: user.id, year, month: monthNum } },
      update: { label },
      create: { userId: user.id, year, month: monthNum, label },
    });

    // limpa entries antigas desse mês
    await prisma.entry.deleteMany({ where: { monthId: month.id } });

    // Detecta semanas na linha 2: colunas A,B=Sem1, C,D=Sem2 ... até 5 semanas (10 cols)
    // Dados começam em linha 4 até linha 69 (ou até 72), coluna de valores é A,C,E,G,I (ou K)
    // Feitiço está na coluna ao lado (B,D,F,H,J,L)
    const colValor = [1, 3, 5, 7, 9, 11]; // A,C,E,G,I,K (1-indexed)
    const colFeitico = [2, 4, 6, 8, 10, 12];
    let count = 0;
    for (let row = 4; row <= 69; row++) {
      // pula linhas de total (contém "Total" em qualquer coluna)
      let isTotalRow = false;
      for (let c = 1; c <= 12; c++) {
        const v = ws.getCell(row, c).value;
        const s = v ? String(typeof v === "object" ? (v as any).text || (v as any).result || v : v) : "";
        if (s.toLowerCase().includes("total") || s.toLowerCase().includes("pessoas")) { isTotalRow = true; break; }
      }
      if (isTotalRow) continue;
      for (let s = 0; s < colValor.length; s++) {
        const week = s + 1;
        const colV = colValor[s];
        const colF = colFeitico[s];
        const cellV = ws.getCell(row, colV).value;
        const cellF = ws.getCell(row, colF).value;
        let val: number | null = null;
        if (typeof cellV === "number" && cellV > 0) val = cellV;
        else if (typeof cellV === "object" && cellV !== null) {
          if ((cellV as any).result && typeof (cellV as any).result === "number") val = (cellV as any).result;
          else if ((cellV as any).text && !isNaN(Number((cellV as any).text))) val = Number((cellV as any).text);
        } else if (typeof cellV === "string" && !isNaN(Number(cellV)) && Number(cellV) > 0) {
          val = Number(cellV);
        }
        if (val === null || isNaN(val) || val <= 0) continue;
        // pula fórmulas de total que retornam SUM (geralmente > 500 e aparece em linha de total já filtrada, mas extra segurança: se valor é exatamente total da semana, ignore)
        // já filtrado acima

        const isFeitico = String(cellF || "").toLowerCase().includes("feiti");
        await prisma.entry.create({
          data: {
            monthId: month.id,
            week,
            value: val,
            type: isFeitico ? "feitico" : "normal",
          },
        });
        count++;
      }
    }
    console.log(` - ${label} (${year}/${monthNum}) => ${count} lançamentos importados`);
  }

  console.log("Import concluído");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
