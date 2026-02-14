import { useEffect, useState } from 'react';
import { Card, Form, Input, Select, InputNumber, Button, Table, Space, Typography, Row, Col, Statistic, DatePicker, Divider, App } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { budgetsService } from '../../services/budgets.service';
import { clientsService } from '../../services/clients.service';
import { recipesService } from '../../services/recipes.service';
import { materialsService } from '../../services/materials.service';
import { useAuth } from '../../contexts/AuthContext';
import { formatGuaranies } from '../../utils/format';
import { COST_TYPE_LABELS } from '@gestion-obras/shared';
import type { ImportResult } from '../../services/excel.service';

const { Title } = Typography;

interface BudgetItemRow {
  key: string;
  recipe_id?: string;
  description: string;
  unit_id: string;
  quantity: number;
  material_unit_price: number;
  labor_unit_price: number;
  margin_percentage: number;
}

interface SectionState {
  key: string;
  name: string;
  items: BudgetItemRow[];
}

export default function BudgetFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { user } = useAuth();
  const isEditing = !!id;

  const importData = (location.state as any)?.importData as ImportResult | undefined;

  const [sections, setSections] = useState<SectionState[]>([
    { key: 'sec-0', name: 'General', items: [] },
  ]);
  const [importApplied, setImportApplied] = useState(false);

  const { data: budget } = useQuery({
    queryKey: ['budget', id],
    queryFn: () => budgetsService.getById(id!),
    enabled: isEditing,
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients-all'],
    queryFn: () => clientsService.list({ limit: 500 }).then((r) => r.data),
  });

  const { data: recipesData } = useQuery({
    queryKey: ['recipes-all'],
    queryFn: () => recipesService.list({ limit: 500 }).then((r) => r.data),
  });

  const { data: units } = useQuery({
    queryKey: ['units'],
    queryFn: () => materialsService.listUnits(),
  });

  // Apply import data when recipes and units are loaded
  useEffect(() => {
    if (importData && recipesData && units && clientsData && !importApplied) {
      setImportApplied(true);

      // Set project name
      if (importData.project_name) {
        form.setFieldValue('project_name', importData.project_name);
      }

      // Try to match client by document number
      if (importData.client_doc && clientsData) {
        const client = clientsData.find((c: any) =>
          c.document_number === importData.client_doc
        );
        if (client) {
          form.setFieldValue('client_id', client.id);
        }
      }

      // Build sections from import data
      const newSections: SectionState[] = importData.sections.map((sec, si) => ({
        key: `sec-import-${si}`,
        name: sec.name,
        items: sec.items.map((item, ii) => {
          const row: BudgetItemRow = {
            key: `item-import-${si}-${ii}`,
            description: item.description,
            unit_id: '',
            quantity: item.quantity || 1,
            material_unit_price: item.material_price || 0,
            labor_unit_price: item.labor_price || 0,
            margin_percentage: 0,
          };

          // Match unit code
          if (item.unit_code && units) {
            const unit = units.find((u: any) => u.code.toLowerCase() === item.unit_code.toLowerCase());
            if (unit) row.unit_id = unit.id;
          }

          // Match recipe code
          if (item.recipe_code && recipesData) {
            const recipe = recipesData.find((r: any) => r.code.toUpperCase() === item.recipe_code!.toUpperCase());
            if (recipe) {
              row.recipe_id = recipe.id;
              row.description = recipe.name;
              row.unit_id = recipe.output_unit?.id || row.unit_id;
              row.material_unit_price = recipe.total_material_cost || 0;
              row.labor_unit_price = recipe.total_labor_cost || 0;
              row.margin_percentage = recipe.margin_percentage || 0;
            }
          }

          return row;
        }),
      }));

      if (newSections.length > 0) {
        setSections(newSections);
      }
    }
  }, [importData, recipesData, units, clientsData, importApplied, form]);

  useEffect(() => {
    if (budget && isEditing) {
      form.setFieldsValue({
        client_id: budget.client_id,
        project_name: budget.project_name,
        description: budget.description,
        location: budget.location,
        budget_type: budget.budget_type,
        valid_until: budget.valid_until ? dayjs(budget.valid_until) : null,
        notes: budget.notes,
        discount_percentage: budget.discount_percentage,
        tax_percentage: budget.tax_percentage,
      });
      setSections(
        (budget.sections || []).map((s: any, si: number) => ({
          key: `sec-${si}`,
          name: s.name,
          items: (s.items || []).map((item: any, ii: number) => ({
            key: `item-${si}-${ii}`,
            recipe_id: item.recipe_id,
            description: item.description,
            unit_id: item.unit_id || item.unit?.id,
            quantity: item.quantity,
            material_unit_price: item.material_unit_price,
            labor_unit_price: item.labor_unit_price,
            margin_percentage: item.margin_percentage,
          })),
        }))
      );
    }
  }, [budget, isEditing, form]);

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isEditing) {
        await budgetsService.update(id!, payload, user!.id);
        return id!;
      }
      return budgetsService.create(payload, user!.id);
    },
    onSuccess: (result) => {
      message.success(isEditing ? 'Presupuesto actualizado' : 'Presupuesto creado');
      navigate(`/presupuestos/${result}`);
    },
    onError: (error: any) => message.error((error as Error).message || 'Error al guardar'),
  });

  function addSection() {
    setSections([...sections, { key: `sec-${Date.now()}`, name: '', items: [] }]);
  }

  function removeSection(key: string) {
    setSections(sections.filter((s) => s.key !== key));
  }

  function updateSectionName(key: string, name: string) {
    setSections(sections.map((s) => s.key === key ? { ...s, name } : s));
  }

  function addItem(sectionKey: string) {
    setSections(sections.map((s) =>
      s.key === sectionKey
        ? {
            ...s,
            items: [...s.items, {
              key: `item-${Date.now()}`, description: '', unit_id: '', quantity: 1,
              material_unit_price: 0, labor_unit_price: 0, margin_percentage: 0,
            }],
          }
        : s
    ));
  }

  function removeItem(sectionKey: string, itemKey: string) {
    setSections(sections.map((s) =>
      s.key === sectionKey ? { ...s, items: s.items.filter((i) => i.key !== itemKey) } : s
    ));
  }

  function updateItem(sectionKey: string, itemKey: string, field: string, value: any) {
    setSections(sections.map((s) => {
      if (s.key !== sectionKey) return s;
      return {
        ...s,
        items: s.items.map((item) => {
          if (item.key !== itemKey) return item;
          const updated = { ...item, [field]: value };

          // If selecting a recipe, auto-fill
          if (field === 'recipe_id' && recipesData) {
            const recipe = recipesData.find((r: any) => r.id === value);
            if (recipe) {
              updated.description = recipe.name;
              updated.unit_id = recipe.output_unit?.id || '';
              updated.material_unit_price = recipe.total_material_cost;
              updated.labor_unit_price = recipe.total_labor_cost;
              updated.margin_percentage = recipe.margin_percentage;
            }
          }
          return updated;
        }),
      };
    }));
  }

  // Calculate totals
  function getItemTotal(item: BudgetItemRow) {
    const unitPrice = item.material_unit_price + item.labor_unit_price;
    const subtotal = item.quantity * unitPrice;
    return Math.round(subtotal * (1 + item.margin_percentage / 100));
  }

  const subtotal = sections.reduce((sum, s) =>
    sum + s.items.reduce((isum, item) => isum + getItemTotal(item), 0), 0);
  const discountPct = form.getFieldValue('discount_percentage') || 0;
  const taxPct = form.getFieldValue('tax_percentage') ?? 10;
  const discountAmount = Math.round(subtotal * discountPct / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = Math.round(afterDiscount * taxPct / 100);
  const total = afterDiscount + taxAmount;

  function onFinish(values: any) {
    const payload = {
      ...values,
      valid_until: values.valid_until?.format('YYYY-MM-DD'),
      sections: sections.map((s, si) => ({
        name: s.name || `Seccion ${si + 1}`,
        sort_order: si,
        items: s.items.map((item, ii) => ({
          recipe_id: item.recipe_id || undefined,
          description: item.description,
          unit_id: item.unit_id,
          quantity: item.quantity,
          material_unit_price: item.material_unit_price,
          labor_unit_price: item.labor_unit_price,
          margin_percentage: item.margin_percentage,
          sort_order: ii,
        })),
      })),
    };
    saveMutation.mutate(payload);
  }

  const itemColumns = (sectionKey: string) => [
    {
      title: 'Receta', width: 200,
      render: (_: any, record: BudgetItemRow) => (
        <Select value={record.recipe_id || undefined} placeholder="Seleccionar receta (opcional)"
          allowClear showSearch optionFilterProp="label" style={{ width: '100%' }}
          onChange={(v) => updateItem(sectionKey, record.key, 'recipe_id', v)}
          options={(recipesData || []).map((r: any) => ({ label: `${r.code} - ${r.name}`, value: r.id }))} />
      ),
    },
    {
      title: 'Descripcion', width: 200,
      render: (_: any, record: BudgetItemRow) => (
        <Input value={record.description} placeholder="Descripcion"
          onChange={(e) => updateItem(sectionKey, record.key, 'description', e.target.value)} />
      ),
    },
    {
      title: 'Ud.', width: 100,
      render: (_: any, record: BudgetItemRow) => (
        <Select value={record.unit_id || undefined} placeholder="Ud." showSearch optionFilterProp="label"
          style={{ width: '100%' }}
          onChange={(v) => updateItem(sectionKey, record.key, 'unit_id', v)}
          options={(units || []).map((u: any) => ({ label: u.code, value: u.id }))} />
      ),
    },
    {
      title: 'Cant.', width: 90,
      render: (_: any, record: BudgetItemRow) => (
        <InputNumber value={record.quantity} min={0.01} step={1} style={{ width: '100%' }}
          onChange={(v) => updateItem(sectionKey, record.key, 'quantity', v || 0)} />
      ),
    },
    {
      title: 'P. Material', width: 120,
      render: (_: any, record: BudgetItemRow) => (
        <InputNumber value={record.material_unit_price} min={0} step={1000} style={{ width: '100%' }}
          onChange={(v) => updateItem(sectionKey, record.key, 'material_unit_price', v || 0)} />
      ),
    },
    {
      title: 'P. MO', width: 120,
      render: (_: any, record: BudgetItemRow) => (
        <InputNumber value={record.labor_unit_price} min={0} step={1000} style={{ width: '100%' }}
          onChange={(v) => updateItem(sectionKey, record.key, 'labor_unit_price', v || 0)} />
      ),
    },
    {
      title: 'Total', width: 120, align: 'right' as const,
      render: (_: any, record: BudgetItemRow) => formatGuaranies(getItemTotal(record)),
    },
    {
      title: '', width: 40,
      render: (_: any, record: BudgetItemRow) => (
        <Button size="small" danger icon={<DeleteOutlined />}
          onClick={() => removeItem(sectionKey, record.key)} />
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/presupuestos')}>Volver</Button>
          <Title level={3} style={{ margin: 0 }}>{isEditing ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}</Title>
        </Space>
        <Button type="primary" onClick={() => form.submit()} loading={saveMutation.isPending}>
          Guardar Borrador
        </Button>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ tax_percentage: 10, discount_percentage: 0 }}>
        <Card title="Datos del Presupuesto" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="client_id" label="Cliente" rules={[{ required: true, message: 'Seleccione un cliente' }]}>
                <Select placeholder="Buscar cliente..." showSearch optionFilterProp="label"
                  options={(clientsData || []).map((c: any) => ({
                    label: `${c.name} (${c.document_number})`, value: c.id,
                  }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="project_name" label="Nombre del Proyecto" rules={[{ required: true, message: 'Obligatorio' }]}>
                <Input placeholder="Nombre del proyecto" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="budget_type" label="Tipo" rules={[{ required: true, message: 'Obligatorio' }]}>
                <Select placeholder="Seleccione"
                  options={Object.entries(COST_TYPE_LABELS).map(([k, v]) => ({ label: v, value: k }))} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="valid_until" label="Valido Hasta">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Fecha" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="location" label="Ubicacion">
                <Input placeholder="Ubicacion del proyecto" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="description" label="Descripcion">
                <Input.TextArea rows={1} placeholder="Descripcion" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="discount_percentage" label="Descuento %">
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="tax_percentage" label="IVA %">
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label="Notas">
            <Input.TextArea rows={2} placeholder="Notas o condiciones" />
          </Form.Item>
        </Card>

        {sections.map((section, si) => (
          <Card key={section.key} size="small" style={{ marginBottom: 12 }}
            title={
              <Input value={section.name} placeholder={`Seccion ${si + 1}`} bordered={false}
                style={{ fontWeight: 'bold', fontSize: 14, width: 300 }}
                onChange={(e) => updateSectionName(section.key, e.target.value)} />
            }
            extra={
              <Space>
                <Button size="small" icon={<PlusOutlined />} onClick={() => addItem(section.key)}>Agregar Item</Button>
                {sections.length > 1 && (
                  <Button size="small" danger onClick={() => removeSection(section.key)}>Eliminar Seccion</Button>
                )}
              </Space>
            }>
            <Table dataSource={section.items} columns={itemColumns(section.key)} rowKey="key"
              pagination={false} size="small" scroll={{ x: 1000 }}
              summary={() => {
                const sectionTotal = section.items.reduce((sum, item) => sum + getItemTotal(item), 0);
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={6}><strong>Subtotal Seccion</strong></Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right"><strong>{formatGuaranies(sectionTotal)}</strong></Table.Summary.Cell>
                    <Table.Summary.Cell index={2} />
                  </Table.Summary.Row>
                );
              }} />
          </Card>
        ))}

        <Button type="dashed" block onClick={addSection} style={{ marginBottom: 16 }} icon={<PlusOutlined />}>
          Agregar Seccion
        </Button>

        <Card size="small" className="summary-panel">
          <Row gutter={24} justify="end">
            <Col span={4}><Statistic title="Subtotal" value={subtotal} formatter={(v) => formatGuaranies(Number(v))} /></Col>
            {discountPct > 0 && (
              <Col span={4}><Statistic title={`Descuento (${discountPct}%)`} value={discountAmount} formatter={(v) => `- ${formatGuaranies(Number(v))}`} /></Col>
            )}
            <Col span={4}><Statistic title={`IVA (${taxPct}%)`} value={taxAmount} formatter={(v) => formatGuaranies(Number(v))} /></Col>
            <Col span={4}>
              <Statistic title="TOTAL" value={total} formatter={(v) => formatGuaranies(Number(v))}
                valueStyle={{ fontSize: 24, fontWeight: 'bold', color: '#1677ff' }} />
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  );
}
