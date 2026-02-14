import { useState } from 'react';
import { Table, Button, Input, Space, Tag, Typography, Popconfirm, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsService } from '../../services/clients.service';
import { formatDate } from '../../utils/format';
import { CLIENT_TYPE_LABELS } from '@gestion-obras/shared';
import ClientModal from './ClientModal';

const { Title } = Typography;

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const { data, isLoading } = useQuery({
    queryKey: ['clients', page, search],
    queryFn: () => clientsService.list({ page, limit: 20, search: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientsService.delete(id),
    onSuccess: () => {
      message.success('Cliente eliminado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: () => message.error('Error al eliminar el cliente'),
  });

  const columns = [
    { title: 'Documento', dataIndex: 'document_number', key: 'document_number',
      render: (v: string, r: any) => `${r.document_type}: ${v}` },
    { title: 'Nombre', dataIndex: 'name', key: 'name', sorter: true },
    { title: 'Razon Social', dataIndex: 'legal_name', key: 'legal_name' },
    { title: 'Tipo', dataIndex: 'client_type', key: 'client_type',
      render: (v: string) => (CLIENT_TYPE_LABELS as any)[v] || v },
    { title: 'Telefono', dataIndex: 'phone', key: 'phone' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Ciudad', dataIndex: 'city', key: 'city' },
    {
      title: 'Estado',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Activo' : 'Inactivo'}</Tag>,
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingClient(record); setModalOpen(true); }}>
            Editar
          </Button>
          <Popconfirm title="Confirmar eliminacion?" onConfirm={() => deleteMutation.mutate(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>Eliminar</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={3}>Clientes</Title>
        <Space>
          <Input
            placeholder="Buscar por nombre, documento..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ width: 300 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingClient(null); setModalOpen(true); }}>
            Nuevo Cliente
          </Button>
        </Space>
      </div>

      <Table
        dataSource={data?.data || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: page,
          total: data?.total || 0,
          pageSize: 20,
          onChange: setPage,
          showTotal: (total) => `${total} registros`,
        }}
        size="middle"
      />

      <ClientModal
        open={modalOpen}
        client={editingClient}
        onClose={() => { setModalOpen(false); setEditingClient(null); }}
        onSuccess={() => {
          setModalOpen(false);
          setEditingClient(null);
          queryClient.invalidateQueries({ queryKey: ['clients'] });
        }}
      />
    </div>
  );
}
