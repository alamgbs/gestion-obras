import { Card, Descriptions, Table, Tag, Button, Space, Typography, Row, Col, Statistic, Divider, Popconfirm, App } from 'antd';
import { ArrowLeftOutlined, EditOutlined, CheckOutlined, CloseOutlined, CopyOutlined, FilePdfOutlined, FileExcelOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { budgetsService } from '../../services/budgets.service';
import { exportBudgetToExcel } from '../../services/excel.service';
import { formatGuaranies, formatDate } from '../../utils/format';
import { BUDGET_STATUS_LABELS, BUDGET_STATUS_COLORS, COST_TYPE_LABELS } from '@gestion-obras/shared';
import { useAuth } from '../../contexts/AuthContext';

const { Title } = Typography;

export default function BudgetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();
  const { message } = App.useApp();

  const { data: budget, isLoading } = useQuery({
    queryKey: ['budget', id],
    queryFn: () => budgetsService.getById(id!),
    enabled: !!id,
  });

  const approveMutation = useMutation({
    mutationFn: () => budgetsService.changeStatus(id!, 'aprobado', user!.id),
    onSuccess: () => { message.success('Presupuesto aprobado'); queryClient.invalidateQueries({ queryKey: ['budget', id] }); },
    onError: (error: any) => message.error(error?.message || 'Error al aprobar'),
  });

  const rejectMutation = useMutation({
    mutationFn: () => budgetsService.changeStatus(id!, 'rechazado', user!.id),
    onSuccess: () => { message.success('Presupuesto rechazado'); queryClient.invalidateQueries({ queryKey: ['budget', id] }); },
    onError: (error: any) => message.error(error?.message || 'Error al rechazar'),
  });

  const duplicateMutation = useMutation({
    mutationFn: () => budgetsService.duplicate(id!, user!.id),
    onSuccess: (newId) => { message.success('Presupuesto duplicado'); navigate(`/presupuestos/${newId}`); },
    onError: (error: any) => message.error(error?.message || 'Error al duplicar'),
  });

  const newVersionMutation = useMutation({
    mutationFn: () => budgetsService.newVersion(id!, user!.id),
    onSuccess: (newId) => { message.success('Nueva version creada'); navigate(`/presupuestos/${newId}`); },
    onError: (error: any) => message.error(error?.message || 'Error al crear version'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => budgetsService.delete(id!),
    onSuccess: () => { message.success('Presupuesto eliminado'); navigate('/presupuestos'); },
    onError: (error: any) => message.error(error?.message || 'Error al eliminar'),
  });

  async function downloadPdf() {
    try {
      const blob = await budgetsService.getPdf(id!);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${budget?.budget_number || 'presupuesto'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      message.error('Error al descargar PDF');
    }
  }

  async function downloadExcel() {
    try {
      exportBudgetToExcel(budget);
    } catch {
      message.error('Error al descargar Excel');
    }
  }

  if (isLoading || !budget) return <div>Cargando...</div>;

  const canApprove = ['admin', 'gerencia'].includes(profile?.role || '');
  const canDelete = budget.status !== 'aprobado';

  const itemColumns = [
    { title: 'Descripcion', dataIndex: 'description', key: 'description' },
    { title: 'Unidad', dataIndex: ['unit', 'code'], key: 'unit', width: 70 },
    { title: 'Cantidad', dataIndex: 'quantity', key: 'quantity', width: 90, align: 'right' as const },
    { title: 'P. Material', dataIndex: 'material_unit_price', key: 'mat_price',
      render: (v: number) => formatGuaranies(v), align: 'right' as const },
    { title: 'P. MO', dataIndex: 'labor_unit_price', key: 'labor_price',
      render: (v: number) => formatGuaranies(v), align: 'right' as const },
    { title: 'P. Unitario', dataIndex: 'unit_price', key: 'unit_price',
      render: (v: number) => formatGuaranies(v), align: 'right' as const },
    { title: 'Subtotal', dataIndex: 'final_price', key: 'final_price',
      render: (v: number) => <strong>{formatGuaranies(v)}</strong>, align: 'right' as const },
  ];

  return (
    <div>
      <div className="page-header">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/presupuestos')}>Volver</Button>
          <Title level={3} style={{ margin: 0 }}>{budget.budget_number}</Title>
          <Tag color={(BUDGET_STATUS_COLORS as any)[budget.status]} style={{ fontSize: 14, padding: '2px 12px' }}>
            {(BUDGET_STATUS_LABELS as any)[budget.status]}
          </Tag>
        </Space>
        <Space>
          {budget.status === 'borrador' && (
            <Button icon={<EditOutlined />} onClick={() => navigate(`/presupuestos/${id}/editar`)}>Editar</Button>
          )}
          {['borrador', 'enviado'].includes(budget.status) && canApprove && (
            <>
              <Popconfirm title="Aprobar presupuesto?" onConfirm={() => approveMutation.mutate()}>
                <Button type="primary" icon={<CheckOutlined />} style={{ background: '#52c41a' }}
                  loading={approveMutation.isPending}>Aprobar</Button>
              </Popconfirm>
              <Popconfirm title="Rechazar presupuesto?" onConfirm={() => rejectMutation.mutate()}>
                <Button danger icon={<CloseOutlined />} loading={rejectMutation.isPending}>Rechazar</Button>
              </Popconfirm>
            </>
          )}
          <Button icon={<CopyOutlined />} onClick={() => duplicateMutation.mutate()}
            loading={duplicateMutation.isPending}>Duplicar</Button>
          <Button onClick={() => newVersionMutation.mutate()}
            loading={newVersionMutation.isPending}>Nueva Version</Button>
          <Button icon={<FilePdfOutlined />} onClick={downloadPdf}>PDF</Button>
          <Button icon={<FileExcelOutlined />} onClick={downloadExcel}>Excel</Button>
          {canDelete && (
            <Popconfirm title="Eliminar presupuesto?" description="Esta accion no se puede deshacer"
              onConfirm={() => deleteMutation.mutate()}>
              <Button danger icon={<DeleteOutlined />} loading={deleteMutation.isPending}>Eliminar</Button>
            </Popconfirm>
          )}
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Card size="small">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Proyecto">{budget.project_name}</Descriptions.Item>
              <Descriptions.Item label="Cliente">{budget.client?.name}</Descriptions.Item>
              <Descriptions.Item label="Ubicacion">{budget.location || '-'}</Descriptions.Item>
              <Descriptions.Item label="Tipo">{(COST_TYPE_LABELS as any)[budget.budget_type]}</Descriptions.Item>
              <Descriptions.Item label="Version">{budget.version}</Descriptions.Item>
              <Descriptions.Item label="Validez">{budget.valid_until ? formatDate(budget.valid_until) : '-'}</Descriptions.Item>
              <Descriptions.Item label="Creado por">{budget.creator?.full_name}</Descriptions.Item>
              <Descriptions.Item label="Fecha">{formatDate(budget.created_at)}</Descriptions.Item>
              {budget.description && <Descriptions.Item label="Descripcion" span={2}>{budget.description}</Descriptions.Item>}
              {budget.notes && <Descriptions.Item label="Notas" span={2}>{budget.notes}</Descriptions.Item>}
            </Descriptions>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic title="Subtotal" value={budget.subtotal} formatter={(v) => formatGuaranies(Number(v))} />
            {budget.discount_percentage > 0 && (
              <Statistic title={`Descuento (${budget.discount_percentage}%)`}
                value={budget.discount_amount} formatter={(v) => `- ${formatGuaranies(Number(v))}`} />
            )}
            <Statistic title={`IVA (${budget.tax_percentage}%)`} value={budget.tax_amount} formatter={(v) => formatGuaranies(Number(v))} />
            <Divider style={{ margin: '8px 0' }} />
            <Statistic title="TOTAL" value={budget.total} formatter={(v) => formatGuaranies(Number(v))}
              valueStyle={{ fontSize: 24, fontWeight: 'bold', color: '#1677ff' }} />
          </Card>
        </Col>
      </Row>

      {budget.sections?.map((section: any) => (
        <Card key={section.id} title={section.name} size="small" style={{ marginBottom: 12 }}
          extra={<strong>{formatGuaranies(section.subtotal)}</strong>}>
          <Table dataSource={section.items || []} columns={itemColumns} rowKey="id"
            pagination={false} size="small" />
        </Card>
      ))}
    </div>
  );
}
