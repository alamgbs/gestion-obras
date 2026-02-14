import { useEffect } from 'react';
import { Modal, Form, Input, Select, App } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { clientsService } from '../../services/clients.service';

interface Props {
  open: boolean;
  client: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClientModal({ open, client, onClose, onSuccess }: Props) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const isEditing = !!client;

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (client) {
        form.setFieldsValue(client);
      }
    }
  }, [open, client, form]);

  const mutation = useMutation({
    mutationFn: (values: any) =>
      isEditing ? clientsService.update(client.id, values) : clientsService.create(values),
    onSuccess: () => {
      message.success(isEditing ? 'Cliente actualizado' : 'Cliente creado');
      onSuccess();
    },
    onError: (error: any) => {
      const msg = (error as Error).message || 'Error al guardar el cliente';
      message.error(msg);
    },
  });

  return (
    <Modal
      title={isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={mutation.isPending}
      okText="Guardar"
      cancelText="Cancelar"
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={(v) => mutation.mutate(v)}>
        <Form.Item name="client_type" label="Tipo de Cliente" rules={[{ required: true, message: 'Seleccione el tipo' }]}>
          <Select placeholder="Seleccione">
            <Select.Option value="fisica">Persona Fisica</Select.Option>
            <Select.Option value="juridica">Persona Juridica</Select.Option>
          </Select>
        </Form.Item>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item name="document_type" label="Tipo de Documento" rules={[{ required: true, message: 'Seleccione el tipo' }]} style={{ flex: 1 }}>
            <Select placeholder="Seleccione">
              <Select.Option value="RUC">RUC</Select.Option>
              <Select.Option value="CI">Cedula de Identidad</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="document_number" label="N° Documento" rules={[{ required: true, message: 'Ingrese el documento' }]} style={{ flex: 2 }}>
            <Input placeholder="Ej: 1234567-8" />
          </Form.Item>
        </div>

        <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'El nombre es obligatorio' }]}>
          <Input placeholder="Nombre completo o razon social" />
        </Form.Item>

        <Form.Item name="legal_name" label="Razon Social">
          <Input placeholder="Razon social (si aplica)" />
        </Form.Item>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item name="phone" label="Telefono" style={{ flex: 1 }}>
            <Input placeholder="(021) 123-456" />
          </Form.Item>
          <Form.Item name="email" label="Email" style={{ flex: 1 }}
            rules={[{ type: 'email', message: 'Formato de email invalido' }]}>
            <Input placeholder="correo@ejemplo.com" />
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item name="address" label="Direccion" style={{ flex: 2 }}>
            <Input placeholder="Direccion" />
          </Form.Item>
          <Form.Item name="city" label="Ciudad" style={{ flex: 1 }}>
            <Input placeholder="Ciudad" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
