/**
 * Seed script: reads costeo_obra_completo.xlsx and outputs SQL
 * Usage: node seed-from-excel.js > seed.sql
 */
const XLSX = require('xlsx');
const path = require('path');
const crypto = require('crypto');

const wb = XLSX.readFile(path.resolve('C:/Users/alamb/OneDrive/Desktop/costeo_obra_completo.xlsx'));
const ws = wb.Sheets['Costeo de Obra'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

// ── Known unit IDs from DB ──
const UNITS = {
  'm3':     'e71f572e-cb75-4a3e-b0c5-1d67d980ad32',
  'm2':     '16897083-90ba-4ff2-9468-e7ff863fd81a',
  'un':     '51d99af9-d5aa-44a3-98c7-65a115b4bc20',
  'kg':     'e4a1ba17-0f8e-4d48-a7a0-b6aef37f92dc',
  'mlin':   '9c9c48cc-c8f4-4136-86e3-a2f63a891c76',
  'tn':     'd208e1c5-f415-4c93-87e9-e118f43553b7',
  'l':      '95e9967b-f12d-4988-a9af-a4c192d12f22',
  'gl':     '3f57d792-5698-435b-8c72-992cd7885958',
  'pulg':   'cbe2a212-0ac2-4cf0-8c1c-5cfea3f13e37',
  'pulg/m': 'a86bec65-3b37-4098-8e04-e1d0088ea574',
  'ton':    'c5f8896a-bca0-4383-a048-d4cac53ee579',
};

// Excel unit → DB unit code
const UNIT_MAP = {
  'm3': 'm3', 'm2': 'm2', 'un': 'un', 'kg': 'kg',
  'ml': 'mlin', 'tn': 'tn', 'lt': 'l', 'l': 'l',
  'gl': 'gl', 'total': 'gl', 'C/ES': 'un',
  'pulg/': 'pulg', 'pulg/m': 'pulg/m',
};

function unitId(excelUnit) {
  const code = UNIT_MAP[excelUnit] || 'un';
  return UNITS[code] || UNITS['un'];
}

// Material category assignment
function getMatCategoryId(name) {
  const l = name.toLowerCase();
  if (l.includes('cemento') && !l.includes('contacto')) return '3ef9a7aa-cf4a-4c4f-aeca-204a2240955e';
  if (l.includes('arena') || l.includes('piedra') || l.includes('ripio') || l.includes('cascotillo') || l.includes('cal ') || l.includes('cal triturada')) return '3ef9a7aa-cf4a-4c4f-aeca-204a2240955e';
  if (l.includes('ladrillo') || l.includes('bloque') || l.includes('vigueta') || l.includes('baldos')) return '23570590-7689-4c44-aac9-ea494dc32787';
  if (l.includes('varilla') || l.includes('alambre') || l.includes('clavo') || l.includes('caño') || l.includes('perfil') || l.includes('angulo') || l.includes('electrodo') || l.includes('tornillo') || l.includes('gancho') || l.includes('tarugo')) return '1d2bb8d6-9ec8-4faf-93e9-0578a0fcea2a';
  if (l.includes('tirante') || l.includes('machimbre') || l.includes('liston') || l.includes('puntal') || l.includes('cedro') || l.includes('ybyrapyta') || l.includes('madera')) return 'abbebfa5-a504-4d70-9aa0-ecb2c082468f';
  if (l.includes('pintura') || l.includes('antióxido') || l.includes('oxido')) return 'aa4b810c-89e7-4865-91be-af9ab655ca78';
  if (l.includes('negrolin') || l.includes('bitumex') || l.includes('hidrófugo') || l.includes('ceresita') || l.includes('betocem')) return '8da649fe-4551-44c4-bb60-46d8f9861266';
  if (l.includes('chapa') || l.includes('teja') || l.includes('tejuelón') || l.includes('dintel')) return '3c4090e2-bb0a-480b-8d68-65b800075726';
  return '8afd9aa8-b78d-4249-b7d3-de23fa2c0884';
}

// Recipe category
function getRecipeCategory(name) {
  const l = name.toLowerCase();
  if (l.includes('relleno') || l.includes('cartel') || l.includes('vallado')) return 'Preliminares';
  if (l.includes('zapata') || l.includes('columna') || l.includes('viga') || l.includes('losa fck') || l.includes('encadenado') || l.includes('escalera') || l.includes('losa rap') || l.includes('cimiento')) return 'Estructura';
  if (l.includes('mampostería') || l.includes('elevación') || l.includes('ladrillo') || l.includes('aislación') || l.includes('dintel')) return 'Mamposteria';
  if (l.includes('contrapiso') || l.includes('carpeta')) return 'Contrapisos';
  if (l.includes('revoque') || l.includes('salpicado') || l.includes('azotada') || l.includes('cielorraso')) return 'Revoques';
  if (l.includes('teja') || l.includes('chapa') || l.includes('techo') || l.includes('entrepiso')) return 'Techos';
  if (l.includes('piso') || l.includes('cerámica') || l.includes('mosaico') || l.includes('porcelanato') || l.includes('layota') || l.includes('baldos') || l.includes('alisada') || l.includes('alfombra') || l.includes('empedrado') || l.includes('hormigón armado') || l.includes('plancha para') || l.includes('piedra losa')) return 'Pisos';
  if (l.includes('zócalo')) return 'Zocalos';
  return 'Otros';
}

function uuid5(prefix, name) {
  return crypto.createHash('md5').update(prefix + ':' + name).digest('hex')
    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
}

function esc(s) { return String(s).replace(/'/g, "''"); }

// ── Parse Excel ──
const recipesMap = new Map();
const materialsMap = new Map();
const laborMap = new Map();

for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (!row || !row[0]) continue;
  const recipeName = String(row[0]).trim();
  const recipeUnit = String(row[1] || 'un').trim();
  const compName = String(row[2] || '').trim();
  const compUnit = String(row[3] || 'un').trim();
  const qty = Number(row[4]) || 0;
  const price = Number(row[5]) || 0;
  const group = String(row[7] || '').trim();
  const groupCat = String(row[8] || '').trim();
  if (!compName) continue;

  if (!recipesMap.has(recipeName)) {
    recipesMap.set(recipeName, { unit: recipeUnit, materials: [], labor: [] });
  }
  if (group === 'Material') {
    if (!materialsMap.has(compName)) materialsMap.set(compName, { unit: compUnit, price, category: groupCat });
    recipesMap.get(recipeName).materials.push({ name: compName, qty, price });
  } else if (group === 'Mano de Obra') {
    if (!laborMap.has(compName)) laborMap.set(compName, { unit: compUnit, rate: price });
    recipesMap.get(recipeName).labor.push({ name: compName, qty, rate: price });
  }
}

// ── Output SQL ──
const out = [];
out.push('BEGIN;');

// Recipe categories
const rcats = ['Preliminares', 'Estructura', 'Mamposteria', 'Contrapisos', 'Revoques', 'Techos', 'Pisos', 'Zocalos', 'Otros'];
const parentCat = 'a0000000-0000-0000-0000-000000000001';
rcats.forEach((c, i) => {
  out.push(`INSERT INTO recipe_categories (id, parent_id, name, depth, sort_order, is_active) VALUES ('${uuid5('rcat', c)}', '${parentCat}', '${c}', 1, ${10 + i}, true) ON CONFLICT (id) DO NOTHING;`);
});

// Labor types
let li = 1;
for (const [name, info] of laborMap) {
  const id = uuid5('labor', name);
  out.push(`INSERT INTO labor_types (id, code, description, rate_unit, rate_amount, is_active) VALUES ('${id}', 'MO-${String(li++).padStart(3,'0')}', '${esc(name)}', 'hourly', ${info.rate}, true) ON CONFLICT (id) DO NOTHING;`);
}

// Materials
let mi = 1;
for (const [name, info] of materialsMap) {
  const id = uuid5('mat', name);
  const uid = unitId(info.unit);
  const catId = getMatCategoryId(name);
  out.push(`INSERT INTO materials (id, code, description, category_id, purchase_unit_id, recipe_unit_id, conversion_factor, purchase_price, recipe_unit_price, is_active) VALUES ('${id}', 'MAT-${String(mi++).padStart(3,'0')}', '${esc(name)}', '${catId}', '${uid}', '${uid}', 1, ${info.price}, ${info.price}, true) ON CONFLICT (id) DO NOTHING;`);
}

// Recipes - use fn_create_recipe
let ri = 1;
for (const [name, info] of recipesMap) {
  const code = 'REC-' + String(ri++).padStart(3, '0');
  const outUnitId = unitId(info.unit);
  const catName = getRecipeCategory(name);
  const catId = uuid5('rcat', catName);

  const mats = info.materials.map((m, i) => ({
    material_id: uuid5('mat', m.name),
    quantity: m.qty,
    unit_price: m.price,
    subtotal: Math.round(m.qty * m.price),
    sort_order: i + 1,
  }));

  const labs = info.labor.map((l, i) => ({
    labor_type_id: uuid5('labor', l.name),
    quantity: l.qty,
    rate_amount: l.rate,
    subtotal: Math.round(l.qty * l.rate),
    sort_order: i + 1,
  }));

  const input = {
    code,
    name: name,
    category_id: catId,
    cost_type: 'material_and_labor',
    output_unit_id: outUnitId,
    output_quantity: 1,
    margin_percentage: 10,
    materials: mats,
    labor: labs,
  };

  const jsonStr = esc(JSON.stringify(input));
  out.push(`SELECT fn_create_recipe('${jsonStr}'::jsonb);`);
}

// Test client
const clientId = uuid5('client', 'Constructora Guarani');
out.push(`INSERT INTO clients (id, document_type, document_number, name, legal_name, client_type, phone, email, city, address, is_active) VALUES ('${clientId}', 'RUC', '80012345-6', 'Constructora Guarani S.A.', 'Constructora Guarani S.A.', 'juridica', '0981-555-1234', 'info@constructoraguarani.com.py', 'Asuncion', 'Avda. Mariscal Lopez 1234', true) ON CONFLICT (id) DO NOTHING;`);

// Second test client
const client2Id = uuid5('client', 'Maria Lopez');
out.push(`INSERT INTO clients (id, document_type, document_number, name, client_type, phone, email, city, address, is_active) VALUES ('${client2Id}', 'CI', '4567890', 'Maria Lopez Gonzalez', 'fisica', '0971-222-3456', 'maria.lopez@gmail.com', 'San Lorenzo', 'Calle 14 de Mayo 567', true) ON CONFLICT (id) DO NOTHING;`);

out.push('COMMIT;');

console.log(out.join('\n'));
