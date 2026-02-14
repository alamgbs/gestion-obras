import { useState } from 'react';
import { Table, Button, Input, Space, Tag, Typography, Modal, Form, Select, App } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../../services/users.service';
import { ROLE_LABELS } from '@gestion-obras/shared';

const { Title } = Typography;

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const isEditing = !!editingUser;

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => usersService.list({ page, limit: 20, search: search || undefined }),
  });

  const saveMutation = useMutation({
    mutationFn: (values: any) =>
      isEditing ? usersService.update(editingUser.id, values) : usersService.create(values),
    onSuccess: () => {
      message.success(isEditing ? 'Usuario actualizado' : 'Usuario creado');
      setModalOpen(false); setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => message.error((error as Error).message || 'Error al guardar'),
  });

  const openModal = (user?: any) => {
    setEditingUser(user || null);
    form.resetFields();
    if (user) form.setFieldsValue(user);
    setModalOpen(true);
  };

  const columns = [
    { title: 'Nombre', dataIndex: 'full_name', key: 'full_name' },
    { title: 'Rol', dataIndex: 'role', key: 'role',
      render: (v: string) => (ROLE_LABELS as any)[v] || v },
    { title: 'Estado', dataIndex: 'is_active', key: 'is_active',
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Activo' : 'Inactivo'}</Tag> },
    {
      title: 'Acciones', key: 'actions', width: 100,
      render: (_: any, record: any) => (
        <Button size="small" icon={<EditOutlined />} onClick={() => openModal(record)}>Editar</Button>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={3}>Usuarios</Title>
        <Space>
          <Input placeholder="Buscar..." prefix={<SearchOutlined />} value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ width: 250 }} allowClear />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Nuevo Usuario</Button>
        </Space>
      </div>

      <Table dataSource={data?.data || []} columns={columns} rowKey="id" loading={isLoading}
        pagination={{ current: page, total: data?.total || 0, pageSize: 20, onChange: setPage,
          showTotal: (total) => `${total} registros` }}
        size="middle" />

      <Modal title={isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
        open={modalOpen} onCancel={() => { setModalOpen(false); setEditingUser(null); }}
        onOk={() => form.submit()} confirmLoading={saveMutation.isPending}
        okText="Guardar" cancelText="Cancelar" width={500}>
        <Form form={form} layout="vertical" onFinish={(v) => saveMutation.mutate(v)}>
          {!isEditing && (
            <>
              <Form.Item name="email" label="Email" rules={[
                { required: true, message: 'Obligatorio' },
                { type: 'email', message: 'Email invalido' },
              ]}>
                <Input placeholder="correo@ejemplo.com" />
              </Form.Item>
              <Form.Item name="password" label="Contrasena" rules={[
                { required: true, message: 'Obligatorio' },
                { min: 6, message: 'Minimo 6 caracteres' },
              ]}>
                <Input.Password placeholder="Contrasena" />
              </Form.Item>
            </>
          )}
          <Form.Item name="full_name" label="Nombre Completo" rules={[{ required: true, message: 'Obligatorio' }]}>
            <Input placeholder="Nombre completo" />
          </Form.Item>
          <Form.Item name="role" label="Rol" rules={[{ required: true, message: 'Obligatorio' }]}>
            <Select placeholder="Seleccione">
              {Object.entries(ROLE_LABELS).map(([key, label]) => (
                <Select.Option key={key} value={key}>{label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          {isEditing && (
            <Form.Item name="is_active" label="Estado">
              <Select>
                <Select.Option value={true}>Activo</Select.Option>
                <Select.Option value={false}>Inactivo</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
