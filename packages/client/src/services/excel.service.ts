import * as XLSX from 'xlsx';

export function exportBudgetToExcel(budget: any) {
  const wb = XLSX.utils.book_new();
  const rows: any[][] = [];

  // Header info
  rows.push([`Proyecto: ${budget.project_name}`]);
  rows.push([`Cliente: ${budget.client?.name || ''}`]);
  rows.push([`N° Presupuesto: ${budget.budget_number}`, '', `Fecha: ${new Date(budget.created_at).toLocaleDateString('es-PY')}`, '', `Estado: ${budget.status}`]);
  rows.push([]);

  // Column headers
  rows.push(['Seccion / Descripcion', 'Unidad', 'Cantidad', 'P. Material', 'P. Mano Obra', 'P. Unitario', 'Subtotal']);

  for (const section of budget.sections || []) {
    rows.push([section.name]);
    for (const item of section.items || []) {
      rows.push([
        `  ${item.description}`,
        item.unit?.code || '',
        item.quantity,
        item.material_unit_price,
        item.labor_unit_price,
        item.unit_price,
        item.final_price,
      ]);
    }
    rows.push([`Subtotal: ${section.name}`, '', '', '', '', '', section.subtotal]);
  }

  rows.push([]);
  rows.push(['', '', '', '', '', 'Subtotal:', budget.subtotal]);
  if (budget.discount_percentage > 0) {
    rows.push(['', '', '', '', '', `Descuento (${budget.discount_percentage}%):`, -budget.discount_amount]);
  }
  rows.push(['', '', '', '', '', `IVA (${budget.tax_percentage}%):`, budget.tax_amount]);
  rows.push(['', '', '', '', '', 'TOTAL:', budget.total]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 40 }, { wch: 10 }, { wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Presupuesto');

  XLSX.writeFile(wb, `${budget.budget_number}.xlsx`);
}

export function downloadTemplate() {
  const wb = XLSX.utils.book_new();

  const rows: any[][] = [
    ['Proyecto:', ''],
    ['Cliente (RUC/CI):', ''],
    ['Fecha:', ''],
    [],
    ['Seccion', 'Descripcion', 'Unidad', 'Cantidad', 'Precio Material', 'Precio MO'],
    ['Estructura'],
    ['', 'Mamposteria Ladrillo 15cm', 'm2', 150, 45000, 15000],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 20 }, { wch: 40 }, { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Presupuesto');

  // Instructions
  const instrRows = [
    ['INSTRUCCIONES DE USO'],
    [],
    ['1. Complete los datos del proyecto en las filas 1-3 de la hoja "Presupuesto"'],
    ['2. Las filas con solo la columna A rellena se interpretan como SECCIONES'],
    ['3. Las filas con columnas B-F completas se interpretan como ITEMS'],
    ['4. Unidades validas: m2, m3, m, kg, un, gl, etc.'],
    ['5. Los precios deben ser en Guaranies (numeros enteros)'],
    ['6. No modifique la fila de encabezados (fila 5)'],
  ];
  const instrWs = XLSX.utils.aoa_to_sheet(instrRows);
  instrWs['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, instrWs, 'Instrucciones');

  XLSX.writeFile(wb, 'plantilla-presupuesto.xlsx');
}
