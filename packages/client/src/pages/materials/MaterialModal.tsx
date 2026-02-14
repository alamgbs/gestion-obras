import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Typography, App } from 'antd';
import { useQuery, useMutation } from '@tanstack/react-query';
import { materialsService } from '../../services/materials.service';
import { formatGuaranies } from '../../utils/format';

const { Text } = Typography;

interface Props {
  open: boolean;
  material: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MaterialModal({ open, material, onClose, onSuccess }: Props) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const isEditing = !!material;
  const [livePrice, setLivePrice] = useState<string>('');

  const { data: units } = useQuery({
    queryKey: ['units'],
    queryFn: () => materialsService.listUnits(),
  });

  const { data: categories } = useQuery({
    queryKey: ['material-categories'],
    queryFn: () => materialsService.listCategories(),
  });

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (material) {
        form.setFieldsValue(material);
        updateLivePrice(material.purchase_price, material.conversion_factor);
      } else {
        setLivePrice('');
      }
    }
  }, [open, material, form]);

  function updateLivePrice(price?: number, factor?: number) {
    if (price && factor && factor > 0) {
      setLivePrice(formatGuaranies(Math.round(price / factor)));
    } else {
      setLivePrice('');
    }
  }

  const mutation = useMutation({
    mutationFn: (values: any) =>
      isEditing ? materialsService.update(material.id, values) : materialsService.create(values),
    onSuccess: () => {
      message.success(isEditing ? 'Material actualizado' : 'Material creado');
      onSuccess();
    },
    onError: (error: any) => {
      message.error((error as Error).message || 'Error al guardar');
    },
  });

  const recipeUnit = units?.find((u: any) => u.id === form.getFieldValue('recipe_unit_id'));

  return (
    <Modal
      title={isEditing ? 'Editar Material' : 'Nuevo Material'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={mutation.isPending}
      okText="Guardar"
      cancelText="Cancelar"
      width={700}
    >
      <Form form={form} layout="vertical" onFinish={(v) => mutation.mutate(v)}
        onValuesChange={(_, allValues) => {
          updateLivePrice(allValues.purchase_price, allValues.conversion_factor);
        }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item name="code" label="Codigo" rules={[{ required: true, message: 'Obligatorio' }]} style={{ flex: 1 }}>
            <Input placeholder="MAT-001" />
          </Form.Item>
          <Form.Item name="category_id" label="Categoria" rules={[{ required: true, message: 'Obligatorio' }]} style={{ flex: 2 }}>
            <Select placeholder="Seleccione" showSearch optionFilterProp="label"
              options={(categories || []).map((c: any) => ({ label: c.name, value: c.id }))} />
          </Form.Item>
        </div>

        <Form.Item name="description" label="Descripcion" rules={[{ required: true, message: 'Obligatorio' }]}>
          <Input placeholder="Descripcion del material" />
        </Form.Item>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item name="purchase_unit_id" label="Unidad de Compra" rules={[{ required: true, message: 'Obligatorio' }]} style={{ flex: 1 }}>
            <Select placeholder="Seleccione" showSearch optionFilterProp="label"
              options={(units || []).map((u: any) => ({ label: `${u.name} (${u.code})`, value: u.id }))} />
          </Form.Item>
          <Form.Item name="recipe_unit_id" label="Unidad de Receta" rules={[{ required: true, message: 'Obligatorio' }]} style={{ flex: 1 }}>
            <Select placeholder="Seleccione" showSearch optionFilterProp="label"
              options={(units || []).map((u: any) => ({ label: `${u.name} (${u.code})`, value: u.id }))} />
          </Form.Item>
          <Form.Item name="conversion_factor" label="Factor de Conversion" rules={[{ required: true, message: 'Obligatorio' }]} style={{ flex: 1 }}>
            <InputNumber min={0.000001} step={1} style={{ width: '100%' }} placeholder="Ej: 50" />
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          <Form.Item name="purchase_price" label="Precio de Compra (Gs)" rules={[{ required: true, message: 'Obligatorio' }]} style={{ flex: 1 }}>
            <InputNumber min={0} step={1000} style={{ width: '100%' }} placeholder="0"
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={(v) => Number(v!.replace(/\./g, '')) as any} />
          </Form.Item>
          <div style={{ flex: 1, marginBottom: 24 }}>
            {livePrice && (
              <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6, padding: '8px 12px' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Precio por {recipeUnit?.code || 'ud. receta'}:</Text>
                <br />
                <Text strong style={{ fontSize: 16, color: '#52c41a' }}>{livePrice}</Text>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item name="stock_quantity" label="Stock Actual" style={{ flex: 1 }}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
          </Form.Item>
          <Form.Item name="min_stock" label="Stock Minimo" style={{ flex: 1 }}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
          </Form.Item>
          <Form.Item name="supplier_name" label="Proveedor" style={{ flex: 2 }}>
            <Input placeholder="Nombre del proveedor" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
