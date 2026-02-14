import { useEffect, useState } from 'react';
import { Card, Form, Input, Select, InputNumber, Button, Table, Space, Typography, Divider, Row, Col, Statistic, App } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { recipesService } from '../../services/recipes.service';
import { materialsService } from '../../services/materials.service';
import { laborService } from '../../services/labor.service';
import { formatGuaranies } from '../../utils/format';
import { COST_TYPE_LABELS } from '@gestion-obras/shared';

const { Title, Text } = Typography;

interface MaterialRow {
  key: string;
  material_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  material_name?: string;
  unit_code?: string;
}

interface LaborRow {
  key: string;
  labor_type_id: string;
  quantity: number;
  rate_amount: number;
  subtotal: number;
  labor_name?: string;
  rate_unit?: string;
}

export default function RecipeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const isEditing = !!id;

  const [materialRows, setMaterialRows] = useState<MaterialRow[]>([]);
  const [laborRows, setLaborRows] = useState<LaborRow[]>([]);

  const { data: recipe } = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => recipesService.getById(id!),
    enabled: isEditing,
  });

  const { data: units } = useQuery({
    queryKey: ['units'],
    queryFn: () => materialsService.listUnits(),
  });

  const { data: categories } = useQuery({
    queryKey: ['recipe-categories'],
    queryFn: () => recipesService.listCategories(),
  });

  const { data: materialsData } = useQuery({
    queryKey: ['materials-all'],
    queryFn: () => materialsService.list({ limit: 500 }).then((r) => r.data),
  });

  const { data: laborData } = useQuery({
    queryKey: ['labor-all'],
    queryFn: () => laborService.list({ limit: 500 }).then((r) => r.data),
  });

  useEffect(() => {
    if (recipe && isEditing) {
      form.setFieldsValue({
        code: recipe.code,
        name: recipe.name,
        description: recipe.description,
        category_id: recipe.category_id,
        cost_type: recipe.cost_type,
        output_unit_id: recipe.output_unit_id,
        output_quantity: recipe.output_quantity,
        margin_percentage: recipe.margin_percentage,
      });
      setMaterialRows(
        (recipe.materials || []).map((m: any, i: number) => ({
          key: `mat-${i}`,
          material_id: m.material_id,
          quantity: m.quantity,
          unit_price: m.unit_price,
          subtotal: m.subtotal,
          material_name: m.material?.description,
          unit_code: m.material?.recipe_unit?.code,
        }))
      );
      setLaborRows(
        (recipe.labor || []).map((l: any, i: number) => ({
          key: `lab-${i}`,
          labor_type_id: l.labor_type_id,
          quantity: l.quantity,
          rate_amount: l.rate_amount,
          subtotal: l.subtotal,
          labor_name: l.labor_type?.description,
          rate_unit: l.labor_type?.rate_unit,
        }))
      );
    }
  }, [recipe, isEditing, form]);

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      if (isEditing) {
        await recipesService.update(id!, values);
        return;
      }
      await recipesService.create(values);
    },
    onSuccess: () => {
      message.success(isEditing ? 'Receta actualizada' : 'Receta creada');
      navigate('/recetas');
    },
    onError: (error: any) => message.error((error as Error).message || 'Error al guardar'),
  });

  const totalMaterialCost = materialRows.reduce((sum, r) => sum + r.subtotal, 0);
  const totalLaborCost = laborRows.reduce((sum, r) => sum + r.subtotal, 0);
  const totalCost = totalMaterialCost + totalLaborCost;
  const marginPct = form.getFieldValue('margin_percentage') || 0;
  const finalPrice = Math.round(totalCost * (1 + marginPct / 100));

  function addMaterialRow() {
    setMaterialRows([...materialRows, {
      key: `mat-${Date.now()}`, material_id: '', quantity: 0, unit_price: 0, subtotal: 0,
    }]);
  }

  function addLaborRow() {
    setLaborRows([...laborRows, {
      key: `lab-${Date.now()}`, labor_type_id: '', quantity: 0, rate_amount: 0, subtotal: 0,
    }]);
  }

  function updateMaterialRow(key: string, field: string, value: any) {
    setMaterialRows((rows) =>
      rows.map((r) => {
        if (r.key !== key) return r;
        const updated = { ...r, [field]: value };
        if (field === 'material_id' && materialsData) {
          const mat = materialsData.find((m: any) => m.id === value);
          if (mat) {
            updated.unit_price = Math.round(mat.recipe_unit_price);
            updated.material_name = mat.description;
            updated.unit_code = mat.recipe_unit?.code;
            updated.subtotal = Math.round(updated.quantity * updated.unit_price);
          }
        }
        if (field === 'quantity') {
          updated.subtotal = Math.round(value * updated.unit_price);
        }
        return updated;
      })
    );
  }

  function updateLaborRow(key: string, field: string, value: any) {
    setLaborRows((rows) =>
      rows.map((r) => {
        if (r.key !== key) return r;
        const updated = { ...r, [field]: value };
        if (field === 'labor_type_id' && laborData) {
          const lab = laborData.find((l: any) => l.id === value);
          if (lab) {
            updated.rate_amount = lab.rate_amount;
            updated.labor_name = lab.description;
            updated.rate_unit = lab.rate_unit;
            updated.subtotal = Math.round(updated.quantity * updated.rate_amount);
          }
        }
        if (field === 'quantity') {
          updated.subtotal = Math.round(value * updated.rate_amount);
        }
        return updated;
      })
    );
  }

  function onFinish(values: any) {
    saveMutation.mutate({
      ...values,
      materials: materialRows.filter((r) => r.material_id).map((r, i) => ({
        material_id: r.material_id,
        quantity: r.quantity,
        sort_order: i,
      })),
      labor: laborRows.filter((r) => r.labor_type_id).map((r, i) => ({
        labor_type_id: r.labor_type_id,
        quantity: r.quantity,
        sort_order: i,
      })),
    });
  }

  // Flatten categories for Select
  function flattenCategories(cats: any[], prefix = ''): any[] {
    return cats.flatMap((c: any) => [
      { label: prefix + c.name, value: c.id },
      ...flattenCategories(c.children || [], prefix + '  '),
    ]);
  }

  const materialColumns = [
    {
      title: 'Material', dataIndex: 'material_id', width: 300,
      render: (_: any, record: MaterialRow) => (
        <Select value={record.material_id || undefined} placeholder="Seleccione material"
          showSearch optionFilterProp="label" style={{ width: '100%' }}
          onChange={(v) => updateMaterialRow(record.key, 'material_id', v)}
          options={(materialsData || []).map((m: any) => ({
            label: `${m.code} - ${m.description}`, value: m.id,
          }))} />
      ),
    },
    { title: 'Ud.', dataIndex: 'unit_code', width: 60 },
    {
      title: 'Cantidad', dataIndex: 'quantity', width: 120,
      render: (_: any, record: MaterialRow) => (
        <InputNumber value={record.quantity} min={0} step={0.01} style={{ width: '100%' }}
          onChange={(v) => updateMaterialRow(record.key, 'quantity', v || 0)} />
      ),
    },
    {
      title: 'Precio Ud.', dataIndex: 'unit_price', width: 130, align: 'right' as const,
      render: (v: number) => formatGuaranies(v),
    },
    {
      title: 'Subtotal', dataIndex: 'subtotal', width: 130, align: 'right' as const,
      render: (v: number) => formatGuaranies(v),
    },
    {
      title: '', width: 40,
      render: (_: any, record: MaterialRow) => (
        <Button size="small" danger icon={<DeleteOutlined />}
          onClick={() => setMaterialRows((rows) => rows.filter((r) => r.key !== record.key))} />
      ),
    },
  ];

  const laborColumns = [
    {
      title: 'Tipo de Mano de Obra', dataIndex: 'labor_type_id', width: 300,
      render: (_: any, record: LaborRow) => (
        <Select value={record.labor_type_id || undefined} placeholder="Seleccione tipo MO"
          showSearch optionFilterProp="label" style={{ width: '100%' }}
          onChange={(v) => updateLaborRow(record.key, 'labor_type_id', v)}
          options={(laborData || []).map((l: any) => ({
            label: `${l.code} - ${l.description}`, value: l.id,
          }))} />
      ),
    },
    {
      title: 'Cantidad', dataIndex: 'quantity', width: 120,
      render: (_: any, record: LaborRow) => (
        <InputNumber value={record.quantity} min={0} step={0.01} style={{ width: '100%' }}
          onChange={(v) => updateLaborRow(record.key, 'quantity', v || 0)} />
      ),
    },
    {
      title: 'Tarifa', dataIndex: 'rate_amount', width: 130, align: 'right' as const,
      render: (v: number) => formatGuaranies(v),
    },
    {
      title: 'Subtotal', dataIndex: 'subtotal', width: 130, align: 'right' as const,
      render: (v: number) => formatGuaranies(v),
    },
    {
      title: '', width: 40,
      render: (_: any, record: LaborRow) => (
        <Button size="small" danger icon={<DeleteOutlined />}
          onClick={() => setLaborRows((rows) => rows.filter((r) => r.key !== record.key))} />
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/recetas')}>Volver</Button>
          <Title level={3} style={{ margin: 0 }}>{isEditing ? 'Editar Receta' : 'Nueva Receta'}</Title>
        </Space>
        <Button type="primary" onClick={() => form.submit()} loading={saveMutation.isPending}>
          Guardar
        </Button>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Card title="Datos Generales" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={4}>
              <Form.Item name="code" label="Codigo" rules={[{ required: true, message: 'Obligatorio' }]}>
                <Input placeholder="REC-001" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'Obligatorio' }]}>
                <Input placeholder="Nombre de la receta" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="category_id" label="Categoria" rules={[{ required: true, message: 'Obligatorio' }]}>
                <Select placeholder="Seleccione" showSearch optionFilterProp="label"
                  options={flattenCategories(categories || [])} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="cost_type" label="Tipo de Costo" rules={[{ required: true, message: 'Obligatorio' }]}>
                <Select placeholder="Seleccione"
                  options={Object.entries(COST_TYPE_LABELS).map(([k, v]) => ({ label: v, value: k }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="description" label="Descripcion">
                <Input.TextArea rows={2} placeholder="Descripcion opcional" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="output_unit_id" label="Unidad Salida" rules={[{ required: true, message: 'Obligatorio' }]}>
                <Select placeholder="Seleccione" showSearch optionFilterProp="label"
                  options={(units || []).map((u: any) => ({ label: `${u.name} (${u.code})`, value: u.id }))} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="output_quantity" label="Cantidad Salida" rules={[{ required: true, message: 'Obligatorio' }]}>
                <InputNumber min={0.01} step={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="margin_percentage" label="Margen %">
                <InputNumber min={0} max={100} step={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Materiales" size="small" style={{ marginBottom: 16 }}
          extra={<Button size="small" icon={<PlusOutlined />} onClick={addMaterialRow}>Agregar Material</Button>}>
          <Table dataSource={materialRows} columns={materialColumns} rowKey="key"
            pagination={false} size="small" scroll={{ x: 800 }}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}><strong>Total Materiales</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right"><strong>{formatGuaranies(totalMaterialCost)}</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={2} />
              </Table.Summary.Row>
            )} />
        </Card>

        <Card title="Mano de Obra" size="small" style={{ marginBottom: 16 }}
          extra={<Button size="small" icon={<PlusOutlined />} onClick={addLaborRow}>Agregar MO</Button>}>
          <Table dataSource={laborRows} columns={laborColumns} rowKey="key"
            pagination={false} size="small" scroll={{ x: 700 }}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}><strong>Total Mano de Obra</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right"><strong>{formatGuaranies(totalLaborCost)}</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={2} />
              </Table.Summary.Row>
            )} />
        </Card>

        <Card size="small" className="summary-panel">
          <Row gutter={24}>
            <Col span={6}><Statistic title="Total Materiales" value={totalMaterialCost} formatter={(v) => formatGuaranies(Number(v))} /></Col>
            <Col span={6}><Statistic title="Total Mano de Obra" value={totalLaborCost} formatter={(v) => formatGuaranies(Number(v))} /></Col>
            <Col span={4}><Statistic title="Costo Total" value={totalCost} formatter={(v) => formatGuaranies(Number(v))} /></Col>
            <Col span={4}><Statistic title="Margen" value={`${marginPct}%`} /></Col>
            <Col span={4}>
              <Statistic title="Precio Final" value={finalPrice}
                formatter={(v) => formatGuaranies(Number(v))}
                valueStyle={{ color: '#52c41a', fontWeight: 'bold' }} />
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  );
}
