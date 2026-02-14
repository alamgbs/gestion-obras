import { useState } from 'react';
import { Table, Button, Input, Space, Typography, Popconfirm, Modal, Form, InputNumber, Select, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { laborService } from '../../services/labor.service';
import { formatGuaranies } from '../../utils/format';
import { RATE_UNIT_LABELS } from '@gestion-obras/shared';

const { Title } = Typography;

export default function LaborPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLabor, setEditingLabor] = useState<any>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const isEditing = !!editingLabor;

  const { data, isLoading } = useQuery({
    queryKey: ['labor', page, search],
    queryFn: () => laborService.list({ page, limit: 20, search: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => laborService.delete(id),
    onSuccess: () => {
      message.success('Tipo de mano de obra eliminado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['labor'] });
    },
    onError: () => message.error('Error al eliminar'),
  });

  const saveMutation = useMutation({
    mutationFn: (values: any) =>
      isEditing ? laborService.update(editingLabor.id, values) : laborService.create(values),
    onSuccess: () => {
      message.success(isEditing ? 'Tipo actualizado' : 'Tipo creado');
      setModalOpen(false);
      setEditingLabor(null);
      queryClient.invalidateQueries({ queryKey: ['labor'] });
    },
    onError: (error: any) => message.error((error as Error).message || 'Error al guardar'),
  });

  const openModal = (labor?: any) => {
    setEditingLabor(labor || null);
    form.resetFields();
    if (labor) form.setFieldsValue(labor);
    setModalOpen(true);
  };

  const columns = [
    { title: 'Codigo', dataIndex: 'code', key: 'code', width: 120 },
    { title: 'Descripcion', dataIndex: 'description', key: 'description' },
    { title: 'Tipo Tarifa', dataIndex: 'rate_unit', key: 'rate_unit',
      render: (v: string) => (RATE_UNIT_LABELS as any)[v] || v },
    { title: 'Monto Tarifa', dataIndex: 'rate_amount', key: 'rate_amount',
      render: (v: number) => formatGuaranies(v), align: 'right' as const },
    {
      title: 'Acciones', key: 'actions', width: 160,
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openModal(record)} />
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
        <Title level={3}>Mano de Obra</Title>
        <Space>
          <Input placeholder="Buscar..." prefix={<SearchOutlined />} value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ width: 250 }} allowClear />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Nuevo Tipo</Button>
        </Space>
      </div>

      <Table dataSource={data?.data || []} columns={columns} rowKey="id" loading={isLoading}
        pagination={{ current: page, total: data?.total || 0, pageSize: 20, onChange: setPage,
          showTotal: (total) => `${total} registros` }}
        size="middle" />

      <Modal title={isEditing ? 'Editar Mano de Obra' : 'Nuevo Tipo de Mano de Obra'}
        open={modalOpen} onCancel={() => { setModalOpen(false); setEditingLabor(null); }}
        onOk={() => form.submit()} confirmLoading={saveMutation.isPending}
        okText="Guardar" cancelText="Cancelar" width={500}>
        <Form form={form} layout="vertical" onFinish={(v) => saveMutation.mutate(v)}>
          <Form.Item name="code" label="Codigo" rules={[{ required: true, message: 'Obligatorio' }]}>
            <Input placeholder="MO-001" />
          </Form.Item>
          <Form.Item name="description" label="Descripcion" rules={[{ required: true, message: 'Obligatorio' }]}>
            <Input placeholder="Descripcion del tipo de mano de obra" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="rate_unit" label="Tipo de Tarifa" rules={[{ required: true, message: 'Obligatorio' }]} style={{ flex: 1 }}>
              <Select placeholder="Seleccione">
                <Select.Option value="hourly">Por Hora</Select.Option>
                <Select.Option value="daily">Por Dia</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="rate_amount" label="Monto Tarifa (Gs)" rules={[{ required: true, message: 'Obligatorio' }]} style={{ flex: 1 }}>
              <InputNumber min={0} step={1000} style={{ width: '100%' }}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                parser={(v) => Number(v!.replace(/\./g, '')) as any} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
