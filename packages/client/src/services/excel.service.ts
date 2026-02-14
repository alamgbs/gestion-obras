import ExcelJS from 'exceljs';
import { supabase } from '../lib/supabase';

export interface ImportedSection {
  name: string;
  items: ImportedItem[];
}

export interface ImportedItem {
  recipe_code?: string;
  description: string;
  unit_code: string;
  quantity: number;
  material_price: number;
  labor_price: number;
}

function fmtGs(amount: number): string {
  return new Intl.NumberFormat('es-PY').format(amount);
}

const BLACK = '000000';
const WHITE = 'FFFFFF';
const GRAY = '4A4A4A';
const LIGHT_GRAY = 'E8E8E8';
const MED_GRAY = 'D0D0D0';

const headerFill: ExcelJS.FillPattern = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLACK } };
const sectionFill: ExcelJS.FillPattern = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRAY } };
const subtotalFill: ExcelJS.FillPattern = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_GRAY } };
const totalFill: ExcelJS.FillPattern = { type: 'pattern', pattern: 'solid', fgColor: { argb: MED_GRAY } };

const whiteFont: Partial<ExcelJS.Font> = { color: { argb: WHITE }, bold: true, size: 11 };
const sectionFont: Partial<ExcelJS.Font> = { color: { argb: WHITE }, bold: true, size: 10 };
const boldFont: Partial<ExcelJS.Font> = { bold: true, size: 10 };
const normalFont: Partial<ExcelJS.Font> = { size: 10 };
const titleFont: Partial<ExcelJS.Font> = { bold: true, size: 14 };

const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'CCCCCC' } },
  bottom: { style: 'thin', color: { argb: 'CCCCCC' } },
  left: { style: 'thin', color: { argb: 'CCCCCC' } },
  right: { style: 'thin', color: { argb: 'CCCCCC' } },
};

function setRowStyle(row: ExcelJS.Row, fill: ExcelJS.FillPattern, font: Partial<ExcelJS.Font>, cols: number) {
  for (let c = 1; c <= cols; c++) {
    const cell = row.getCell(c);
    cell.fill = fill;
    cell.font = font;
    cell.border = thinBorder;
  }
}

export async function exportBudgetToExcel(budget: any) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'GestionObras';

  // ── Sheet 1: Presupuesto ──
  const ws = wb.addWorksheet('Presupuesto');
  const COLS = 7;

  ws.columns = [
    { width: 42 }, // A - Descripcion
    { width: 10 }, // B - Unidad
    { width: 12 }, // C - Cantidad
    { width: 16 }, // D - P. Material
    { width: 16 }, // E - P. Mano Obra
    { width: 16 }, // F - P. Unitario
    { width: 18 }, // G - Subtotal
  ];

  // Title row (black background)
  const titleRow = ws.addRow(['PRESUPUESTO DE OBRA']);
  ws.mergeCells(`A${titleRow.number}:G${titleRow.number}`);
  titleRow.getCell(1).font = { ...whiteFont, size: 16 };
  titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow.height = 32;
  setRowStyle(titleRow, headerFill, { ...whiteFont, size: 16 }, COLS);

  // Info rows
  const infoData = [
    [`Proyecto: ${budget.project_name}`, '', '', '', `N°: ${budget.budget_number}`],
    [`Cliente: ${budget.client?.name || ''}`, '', '', '', `Fecha: ${new Date(budget.created_at).toLocaleDateString('es-PY')}`],
    [budget.location ? `Ubicacion: ${budget.location}` : '', '', '', '', `Estado: ${budget.status?.toUpperCase()}`],
  ];

  for (const info of infoData) {
    const r = ws.addRow([info[0], '', '', '', info[4]]);
    ws.mergeCells(`A${r.number}:D${r.number}`);
    ws.mergeCells(`E${r.number}:G${r.number}`);
    r.getCell(1).font = boldFont;
    r.getCell(5).font = boldFont;
    r.getCell(5).alignment = { horizontal: 'right' };
    r.height = 18;
  }

  // Empty row
  ws.addRow([]);

  // Column headers (black background, white text)
  const headerRow = ws.addRow(['Descripcion', 'Unidad', 'Cantidad', 'P. Material', 'P. Mano Obra', 'P. Unitario', 'Subtotal']);
  setRowStyle(headerRow, headerFill, whiteFont, COLS);
  headerRow.height = 22;
  headerRow.getCell(3).alignment = { horizontal: 'right' };
  headerRow.getCell(4).alignment = { horizontal: 'right' };
  headerRow.getCell(5).alignment = { horizontal: 'right' };
  headerRow.getCell(6).alignment = { horizontal: 'right' };
  headerRow.getCell(7).alignment = { horizontal: 'right' };

  // Sections and items
  for (const section of budget.sections || []) {
    // Section header (dark gray)
    const secRow = ws.addRow([section.name]);
    ws.mergeCells(`A${secRow.number}:G${secRow.number}`);
    setRowStyle(secRow, sectionFill, sectionFont, COLS);
    secRow.height = 20;

    for (const item of section.items || []) {
      const unitPrice = (item.material_unit_price || 0) + (item.labor_unit_price || 0);
      const r = ws.addRow([
        `  ${item.description}`,
        item.unit?.code || '',
        item.quantity,
        item.material_unit_price || 0,
        item.labor_unit_price || 0,
        unitPrice,
        item.final_price || 0,
      ]);
      r.getCell(1).font = normalFont;
      r.getCell(2).font = normalFont;
      r.getCell(2).alignment = { horizontal: 'center' };
      r.getCell(3).font = normalFont;
      r.getCell(3).alignment = { horizontal: 'right' };
      r.getCell(3).numFmt = '#,##0.00';
      for (let c = 4; c <= 7; c++) {
        r.getCell(c).font = normalFont;
        r.getCell(c).alignment = { horizontal: 'right' };
        r.getCell(c).numFmt = '#,##0';
      }
      for (let c = 1; c <= COLS; c++) {
        r.getCell(c).border = thinBorder;
      }
    }

    // Section subtotal
    const subRow = ws.addRow(['', '', '', '', '', `Subtotal ${section.name}:`, section.subtotal || 0]);
    setRowStyle(subRow, subtotalFill, boldFont, COLS);
    subRow.getCell(6).alignment = { horizontal: 'right' };
    subRow.getCell(7).alignment = { horizontal: 'right' };
    subRow.getCell(7).numFmt = '#,##0';
  }

  // Empty row before totals
  ws.addRow([]);

  // Totals section
  const addTotalRow = (label: string, value: number, isFinal = false) => {
    const r = ws.addRow(['', '', '', '', '', label, value]);
    const fill = isFinal ? headerFill : totalFill;
    const font = isFinal ? whiteFont : boldFont;
    for (let c = 6; c <= 7; c++) {
      r.getCell(c).fill = fill;
      r.getCell(c).font = font;
      r.getCell(c).border = thinBorder;
      r.getCell(c).alignment = { horizontal: 'right' };
    }
    r.getCell(7).numFmt = '#,##0';
    if (isFinal) r.height = 24;
    return r;
  };

  addTotalRow('Subtotal:', budget.subtotal || 0);
  if (budget.discount_percentage > 0) {
    addTotalRow(`Descuento (${budget.discount_percentage}%):`, -(budget.discount_amount || 0));
  }
  addTotalRow(`IVA (${budget.tax_percentage}%):`, budget.tax_amount || 0);
  addTotalRow('TOTAL:', budget.total || 0, true);

  // ── Sheet 2: Detalle de Recetas ──
  const recipeIds = new Set<string>();
  for (const section of budget.sections || []) {
    for (const item of section.items || []) {
      if (item.recipe_id) recipeIds.add(item.recipe_id);
    }
  }

  if (recipeIds.size > 0) {
    const wsDetail = wb.addWorksheet('Detalle Recetas');

    wsDetail.columns = [
      { width: 35 },  // A - Item / Material / MO
      { width: 12 },  // B - Tipo
      { width: 30 },  // C - Componente
      { width: 10 },  // D - Unidad
      { width: 14 },  // E - Cant. Unitaria
      { width: 14 },  // F - Cant. Item
      { width: 14 },  // G - Cant. Total
      { width: 14 },  // H - P. Unitario
      { width: 16 },  // I - Subtotal
    ];

    const DCOLS = 9;

    // Title
    const dTitle = wsDetail.addRow(['DETALLE DE RECETAS POR ITEM']);
    wsDetail.mergeCells(`A${dTitle.number}:I${dTitle.number}`);
    dTitle.getCell(1).font = { ...whiteFont, size: 14 };
    dTitle.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    dTitle.height = 28;
    setRowStyle(dTitle, headerFill, { ...whiteFont, size: 14 }, DCOLS);

    const dInfo = wsDetail.addRow([`Presupuesto: ${budget.budget_number} - ${budget.project_name}`]);
    wsDetail.mergeCells(`A${dInfo.number}:I${dInfo.number}`);
    dInfo.getCell(1).font = boldFont;
    dInfo.height = 18;

    wsDetail.addRow([]);

    // Column headers
    const dHeader = wsDetail.addRow([
      'Item del Presupuesto', 'Tipo', 'Componente', 'Unidad',
      'Cant. Unitaria', 'Cant. Item', 'Cant. Total', 'P. Unitario', 'Subtotal',
    ]);
    setRowStyle(dHeader, headerFill, whiteFont, DCOLS);
    dHeader.height = 22;
    for (let c = 5; c <= 9; c++) {
      dHeader.getCell(c).alignment = { horizontal: 'right' };
    }

    // Fetch recipes
    const { data: recipesRaw } = await supabase.from('recipes')
      .select(`id, code, name, output_unit:units(code),
        materials:recipe_materials(quantity, unit_price, subtotal, material:materials(description, recipe_unit:units!materials_recipe_unit_id_fkey(code))),
        labor:recipe_labor(quantity, rate_amount, subtotal, labor_type:labor_types(description, rate_unit))`)
      .in('id', Array.from(recipeIds));

    const recipesMap = new Map<string, any>();
    for (const r of recipesRaw || []) {
      recipesMap.set(r.id, r);
    }

    for (const section of budget.sections || []) {
      for (const item of section.items || []) {
        if (!item.recipe_id) continue;
        const recipe = recipesMap.get(item.recipe_id);
        if (!recipe) continue;

        const itemQty = item.quantity || 1;

        // Item header row (gray)
        const itemRow = wsDetail.addRow([
          `${item.description} (${recipe.code})`, '', '', item.unit?.code || '', '', itemQty,
        ]);
        setRowStyle(itemRow, sectionFill, sectionFont, DCOLS);
        itemRow.height = 20;
        itemRow.getCell(6).numFmt = '#,##0.00';

        // Materials
        for (const mat of recipe.materials || []) {
          const totalQty = (mat.quantity || 0) * itemQty;
          const r = wsDetail.addRow([
            '', 'Material', mat.material?.description || '', mat.material?.recipe_unit?.code || '',
            mat.quantity || 0, itemQty, totalQty, mat.unit_price || 0, (mat.subtotal || 0) * itemQty,
          ]);
          r.getCell(2).font = { ...normalFont, italic: true, color: { argb: '666666' } };
          r.getCell(3).font = normalFont;
          r.getCell(4).font = normalFont;
          r.getCell(4).alignment = { horizontal: 'center' };
          for (let c = 5; c <= 9; c++) {
            r.getCell(c).font = normalFont;
            r.getCell(c).alignment = { horizontal: 'right' };
            r.getCell(c).numFmt = c <= 7 ? '#,##0.00' : '#,##0';
          }
          for (let c = 1; c <= DCOLS; c++) {
            r.getCell(c).border = thinBorder;
          }
        }

        // Labor
        for (const lab of recipe.labor || []) {
          const totalQty = (lab.quantity || 0) * itemQty;
          const r = wsDetail.addRow([
            '', 'Mano Obra', lab.labor_type?.description || '', lab.labor_type?.rate_unit || '',
            lab.quantity || 0, itemQty, totalQty, lab.rate_amount || 0, (lab.subtotal || 0) * itemQty,
          ]);
          r.getCell(2).font = { ...normalFont, italic: true, color: { argb: '886644' } };
          r.getCell(3).font = normalFont;
          r.getCell(4).font = normalFont;
          r.getCell(4).alignment = { horizontal: 'center' };
          for (let c = 5; c <= 9; c++) {
            r.getCell(c).font = normalFont;
            r.getCell(c).alignment = { horizontal: 'right' };
            r.getCell(c).numFmt = c <= 7 ? '#,##0.00' : '#,##0';
          }
          for (let c = 1; c <= DCOLS; c++) {
            r.getCell(c).border = thinBorder;
          }
        }

        // Blank separator
        wsDetail.addRow([]);
      }
    }
  }

  // Generate and download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${budget.budget_number}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadTemplate() {
  const wb = new ExcelJS.Workbook();

  const ws = wb.addWorksheet('Presupuesto');
  ws.columns = [
    { width: 20 }, { width: 40 }, { width: 12 }, { width: 12 }, { width: 18 }, { width: 18 },
  ];

  // Info
  ws.addRow(['Proyecto:', '']);
  ws.addRow(['Cliente (RUC/CI):', '']);
  ws.addRow(['Fecha:', '']);
  ws.addRow([]);

  // Headers
  const hdr = ws.addRow(['Seccion', 'Descripcion / Codigo Receta', 'Unidad', 'Cantidad', 'Precio Material', 'Precio MO']);
  for (let c = 1; c <= 6; c++) {
    hdr.getCell(c).fill = headerFill;
    hdr.getCell(c).font = whiteFont;
    hdr.getCell(c).border = thinBorder;
  }

  // Example
  const sec = ws.addRow(['Estructura']);
  sec.getCell(1).fill = sectionFill;
  sec.getCell(1).font = sectionFont;
  ws.addRow(['', 'REC-001', 'm2', 150]);

  // Instructions sheet
  const instrWs = wb.addWorksheet('Instrucciones');
  instrWs.columns = [{ width: 80 }];

  const instrTitle = instrWs.addRow(['INSTRUCCIONES DE USO']);
  instrTitle.getCell(1).font = { ...whiteFont, size: 14 };
  instrTitle.getCell(1).fill = headerFill;
  instrTitle.height = 28;

  instrWs.addRow([]);
  instrWs.addRow(['1. Complete los datos del proyecto en las filas 1-3 de la hoja "Presupuesto"']);
  instrWs.addRow(['2. Las filas con solo la columna A rellena se interpretan como SECCIONES']);
  instrWs.addRow(['3. En la columna B puede poner el CODIGO de receta (ej: REC-001) o una descripcion libre']);
  instrWs.addRow(['4. Si usa codigo de receta, los precios se auto-completan al importar']);
  instrWs.addRow(['5. Unidades validas: m2, m3, m, kg, un, gl, etc.']);
  instrWs.addRow(['6. Los precios deben ser en Guaranies (numeros enteros)']);
  instrWs.addRow(['7. No modifique la fila de encabezados (fila 5)']);

  wb.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla-presupuesto.xlsx';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });
}

export interface ImportResult {
  project_name: string;
  client_doc: string;
  sections: ImportedSection[];
}

export async function parseImportExcel(file: File): Promise<ImportResult> {
  const buffer = await file.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);

  const ws = wb.getWorksheet('Presupuesto') || wb.getWorksheet(1);
  if (!ws) throw new Error('No se encontro la hoja "Presupuesto"');

  // Read header info (rows 1-3)
  const projectName = String(ws.getRow(1).getCell(2).value || '').trim();
  const clientDoc = String(ws.getRow(2).getCell(2).value || '').trim();

  // Find header row (row 5 by default, or search for it)
  let headerRowNum = 5;
  for (let r = 1; r <= 10; r++) {
    const val = String(ws.getRow(r).getCell(1).value || '').toLowerCase();
    if (val.includes('seccion')) { headerRowNum = r; break; }
  }

  const sections: ImportedSection[] = [];
  let currentSection: ImportedSection | null = null;

  for (let r = headerRowNum + 1; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const colA = String(row.getCell(1).value || '').trim();
    const colB = String(row.getCell(2).value || '').trim();
    const colC = String(row.getCell(3).value || '').trim();
    const colD = Number(row.getCell(4).value) || 0;
    const colE = Number(row.getCell(5).value) || 0;
    const colF = Number(row.getCell(6).value) || 0;

    if (!colA && !colB) continue; // empty row

    // If only column A has value, it's a section header
    if (colA && !colB && !colC) {
      currentSection = { name: colA, items: [] };
      sections.push(currentSection);
      continue;
    }

    // It's an item row
    if (!currentSection) {
      currentSection = { name: 'General', items: [] };
      sections.push(currentSection);
    }

    // Check if colB looks like a recipe code (e.g. REC-001)
    const isRecipeCode = /^REC-\d+$/i.test(colB);

    currentSection.items.push({
      recipe_code: isRecipeCode ? colB.toUpperCase() : undefined,
      description: isRecipeCode ? '' : colB,
      unit_code: colC,
      quantity: colD,
      material_price: colE,
      labor_price: colF,
    });
  }

  return { project_name: projectName, client_doc: clientDoc, sections };
}
