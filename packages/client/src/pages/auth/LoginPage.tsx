import { useState } from 'react';
import { Card, Form, Input, Button, Typography, App } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success('Inicio de sesion exitoso');
      navigate('/');
    } catch (error: any) {
      message.error(error.message || 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f0f2f5',
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 4 }}>Gestion de Obras</Title>
          <Text type="secondary">Sistema de Presupuestos de Construccion</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'El email es obligatorio' },
              { type: 'email', message: 'Formato de email invalido' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="correo@ejemplo.com" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Contrasena"
            rules={[{ required: true, message: 'La contrasena es obligatoria' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Contrasena" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Iniciar Sesion
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
