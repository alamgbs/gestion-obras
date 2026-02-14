import { useState } from 'react';
import { Table, Button, Input, Space, Tag, Typography, Popconfirm, Select, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialsService } from '../../services/materials.service';
import { formatGuaranies } from '../../utils/format';
import MaterialModal from './MaterialModal';

const { Title } = Typography;

export default function MaterialsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const { data, isLoading } = useQuery({
    queryKey: ['materials', page, search, categoryFilter],
    queryFn: () => materialsService.list({ page, limit: 20, search: search || undefined, category_id: categoryFilter }),
  });

  const { data: categories } = useQuery({
    queryKey: ['material-categories'],
    queryFn: () => materialsService.listCategories(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => materialsService.delete(id),
    onSuccess: () => {
      message.success('Material eliminado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
    onError: () => message.error('Error al eliminar'),
  });

  const columns = [
    { title: 'Codigo', dataIndex: 'code', key: 'code', width: 100 },
    { title: 'Descripcion', dataIndex: 'description', key: 'description' },
    { title: 'Categoria', dataIndex: ['category', 'name'], key: 'category' },
    { title: 'Ud. Compra', dataIndex: ['purchase_unit', 'code'], key: 'purchase_unit', width: 90 },
    { title: 'Precio Compra', dataIndex: 'purchase_price', key: 'purchase_price',
      render: (v: number) => formatGuaranies(v), align: 'right' as const },
    { title: 'Ud. Receta', dataIndex: ['recipe_unit', 'code'], key: 'recipe_unit', width: 90 },
    { title: 'Factor', dataIndex: 'conversion_factor', key: 'conversion_factor', width: 80 },
    { title: 'Precio/Ud. Receta', dataIndex: 'recipe_unit_price', key: 'recipe_unit_price',
      render: (v: number) => formatGuaranies(Math.round(v)), align: 'right' as const },
    {
      title: 'Acciones',
      key: 'actions',
      width: 160,
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingMaterial(record); setModalOpen(true); }} />
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
        <Title level={3}>Materiales</Title>
        <Space>
          <Select
            placeholder="Filtrar por categoria"
            allowClear
            style={{ width: 200 }}
            value={categoryFilter}
            onChange={(v) => { setCategoryFilter(v); setPage(1); }}
            options={(categories || []).map((c: any) => ({ label: c.name, value: c.id }))}
          />
          <Input
            placeholder="Buscar..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ width: 250 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingMaterial(null); setModalOpen(true); }}>
            Nuevo Material
          </Button>
        </Space>
      </div>

      <Table
        dataSource={data?.data || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: page, total: data?.total || 0, pageSize: 20, onChange: setPage,
          showTotal: (total) => `${total} registros`,
        }}
        size="middle"
        scroll={{ x: 1200 }}
      />

      <MaterialModal
        open={modalOpen}
        material={editingMaterial}
        onClose={() => { setModalOpen(false); setEditingMaterial(null); }}
        onSuccess={() => {
          setModalOpen(false); setEditingMaterial(null);
          queryClient.invalidateQueries({ queryKey: ['materials'] });
        }}
      />
    </div>
  );
}
