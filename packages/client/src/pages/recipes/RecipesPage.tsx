import { useState } from 'react';
import { Table, Button, Input, Space, Typography, Popconfirm, Select, Tag, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CopyOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { recipesService } from '../../services/recipes.service';
import { formatGuaranies } from '../../utils/format';
import { COST_TYPE_LABELS } from '@gestion-obras/shared';

const { Title } = Typography;

export default function RecipesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [costTypeFilter, setCostTypeFilter] = useState<string | undefined>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const { data, isLoading } = useQuery({
    queryKey: ['recipes', page, search, costTypeFilter],
    queryFn: () => recipesService.list({ page, limit: 20, search: search || undefined, cost_type: costTypeFilter }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => recipesService.delete(id),
    onSuccess: () => {
      message.success('Receta eliminada');
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => recipesService.duplicate(id),
    onSuccess: () => {
      message.success('Receta duplicada');
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });

  const columns = [
    { title: 'Codigo', dataIndex: 'code', key: 'code', width: 120 },
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Categoria', dataIndex: ['category', 'name'], key: 'category' },
    { title: 'Tipo Costo', dataIndex: 'cost_type', key: 'cost_type',
      render: (v: string) => <Tag>{(COST_TYPE_LABELS as any)[v] || v}</Tag>, width: 160 },
    { title: 'Costo Material', dataIndex: 'total_material_cost', key: 'mat_cost',
      render: (v: number) => formatGuaranies(v), align: 'right' as const },
    { title: 'Costo MO', dataIndex: 'total_labor_cost', key: 'labor_cost',
      render: (v: number) => formatGuaranies(v), align: 'right' as const },
    { title: 'Costo Total', dataIndex: 'total_cost', key: 'total_cost',
      render: (v: number) => formatGuaranies(v), align: 'right' as const },
    { title: 'Margen %', dataIndex: 'margin_percentage', key: 'margin',
      render: (v: number) => `${v}%`, width: 90 },
    { title: 'Precio Final', dataIndex: 'final_price', key: 'final_price',
      render: (v: number) => <strong>{formatGuaranies(v)}</strong>, align: 'right' as const },
    {
      title: 'Acciones', key: 'actions', width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/recetas/${record.id}`)} />
          <Button size="small" icon={<CopyOutlined />} onClick={() => duplicateMutation.mutate(record.id)} />
          <Popconfirm title="Confirmar eliminacion?" onConfirm={() => deleteMutation.mutate(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={3}>Recetas</Title>
        <Space>
          <Select placeholder="Tipo de costo" allowClear style={{ width: 200 }}
            value={costTypeFilter} onChange={(v) => { setCostTypeFilter(v); setPage(1); }}
            options={Object.entries(COST_TYPE_LABELS).map(([k, v]) => ({ label: v, value: k }))} />
          <Input placeholder="Buscar..." prefix={<SearchOutlined />} value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ width: 250 }} allowClear />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/recetas/nueva')}>
            Nueva Receta
          </Button>
        </Space>
      </div>

      <Table dataSource={data?.data || []} columns={columns} rowKey="id" loading={isLoading}
        pagination={{ current: page, total: data?.total || 0, pageSize: 20, onChange: setPage,
          showTotal: (total) => `${total} registros` }}
        size="middle" scroll={{ x: 1400 }}
        onRow={(record: any) => ({ onClick: () => navigate(`/recetas/${record.id}`), style: { cursor: 'pointer' } })} />
    </div>
  );
}
