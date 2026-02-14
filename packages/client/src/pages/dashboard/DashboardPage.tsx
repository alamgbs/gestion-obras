import { Card, Col, Row, Statistic, Table, Tag, Button, Space, Typography } from 'antd';
import {
  ProjectOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboard.service';
import { formatGuaranies, formatDate } from '../../utils/format';
import { BUDGET_STATUS_LABELS, BUDGET_STATUS_COLORS } from '@gestion-obras/shared';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const { Title } = Typography;

const COLORS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#d9d9d9'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getStats(),
  });

  const columns = [
    { title: 'N° Presupuesto', dataIndex: 'budget_number', key: 'budget_number' },
    { title: 'Proyecto', dataIndex: 'project_name', key: 'project_name' },
    { title: 'Cliente', dataIndex: 'client_name', key: 'client_name' },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (v: number) => formatGuaranies(v),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => (
        <Tag color={(BUDGET_STATUS_COLORS as any)[s]}>
          {(BUDGET_STATUS_LABELS as any)[s] || s}
        </Tag>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (d: string) => formatDate(d),
    },
  ];

  const chartData = data?.budgets_by_status?.map((b: any) => ({
    name: (BUDGET_STATUS_LABELS as any)[b.status] || b.status,
    value: b.count,
  })) || [];

  return (
    <div>
      <div className="page-header">
        <Title level={3}>Panel de Control</Title>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/presupuestos/nuevo')}>
            Nuevo Presupuesto
          </Button>
          <Button icon={<PlusOutlined />} onClick={() => navigate('/clientes/nuevo')}>
            Nuevo Cliente
          </Button>
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Obras Activas"
              value={data?.active_projects || 0}
              prefix={<ProjectOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Presupuestos Pendientes"
              value={data?.pending_budgets || 0}
              prefix={<FileTextOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Aprobados este Mes"
              value={data?.approved_this_month || 0}
              prefix={<CheckCircleOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Aprobado (Mes)"
              value={data?.total_approved_amount || 0}
              prefix={<DollarOutlined />}
              formatter={(v) => formatGuaranies(Number(v))}
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="Ultimos Presupuestos">
            <Table
              dataSource={data?.recent_budgets || []}
              columns={columns}
              rowKey="id"
              pagination={false}
              loading={isLoading}
              size="small"
              onRow={(record: any) => ({
                onClick: () => navigate(`/presupuestos/${record.id}`),
                style: { cursor: 'pointer' },
              })}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Presupuestos por Estado">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {chartData.map((_: any, index: number) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                Sin datos disponibles
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
