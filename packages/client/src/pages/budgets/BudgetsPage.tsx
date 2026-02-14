import { useRef, useState } from 'react';
import { Table, Button, Input, Space, Tag, Typography, Tabs, Popconfirm, App } from 'antd';
import { PlusOutlined, SearchOutlined, FilePdfOutlined, FileExcelOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { budgetsService } from '../../services/budgets.service';
import { exportBudgetToExcel, downloadTemplate as downloadTemplateFile, parseImportExcel } from '../../services/excel.service';
import { formatGuaranies, formatDate } from '../../utils/format';
import { BUDGET_STATUS_LABELS, BUDGET_STATUS_COLORS } from '@gestion-obras/shared';

const { Title } = Typography;

const statusTabs = [
  { key: '', label: 'Todos' },
  { key: 'borrador', label: 'Borradores' },
  { key: 'enviado', label: 'Enviados' },
  { key: 'aprobado', label: 'Aprobados' },
  { key: 'rechazado', label: 'Rechazados' },
];

export default function BudgetsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['budgets', page, search, statusFilter],
    queryFn: () => budgetsService.list({
      page, limit: 20,
      search: search || undefined,
      status: statusFilter || undefined,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => budgetsService.delete(id),
    onSuccess: () => {
      message.success('Presupuesto eliminado');
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  async function downloadPdf(id: string, budgetNumber: string) {
    try {
      const blob = await budgetsService.getPdf(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${budgetNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      message.error('Error al descargar PDF');
    }
  }

  async function downloadExcel(id: string, budgetNumber: string) {
    try {
      const budget = await budgetsService.getById(id);
      await exportBudgetToExcel(budget);
    } catch {
      message.error('Error al descargar Excel');
    }
  }

  function downloadTemplate() {
    downloadTemplateFile();
  }

  async function handleImportExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await parseImportExcel(file);
      message.success(`Importado: ${result.sections.length} secciones`);
      navigate('/presupuestos/nuevo', { state: { importData: result } });
    } catch (err: any) {
      message.error(err.message || 'Error al importar Excel');
    }
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const columns = [
    { title: 'N° Presupuesto', dataIndex: 'budget_number', key: 'budget_number', width: 150 },
    { title: 'Proyecto', dataIndex: 'project_name', key: 'project_name' },
    { title: 'Cliente', dataIndex: ['client', 'name'], key: 'client' },
    {
      title: 'Estado', dataIndex: 'status', key: 'status', width: 110,
      render: (s: string) => <Tag color={(BUDGET_STATUS_COLORS as any)[s]}>{(BUDGET_STATUS_LABELS as any)[s]}</Tag>,
    },
    {
      title: 'Total', dataIndex: 'total', key: 'total', align: 'right' as const,
      render: (v: number) => formatGuaranies(v),
    },
    { title: 'V.', dataIndex: 'version', key: 'version', width: 40 },
    {
      title: 'Fecha', dataIndex: 'created_at', key: 'created_at', width: 100,
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Acciones', key: 'actions', width: 140,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button size="small" icon={<FilePdfOutlined />} onClick={(e) => { e.stopPropagation(); downloadPdf(record.id, record.budget_number); }} />
          <Button size="small" icon={<FileExcelOutlined />} onClick={(e) => { e.stopPropagation(); downloadExcel(record.id, record.budget_number); }} />
          {record.status !== 'aprobado' && (
            <Popconfirm title="Eliminar presupuesto?" onConfirm={() => deleteMutation.mutate(record.id)}>
              <Button size="small" danger onClick={(e) => e.stopPropagation()}>X</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <input type="file" ref={fileInputRef} accept=".xlsx,.xls" style={{ display: 'none' }}
        onChange={handleImportExcel} />

      <div className="page-header">
        <Title level={3}>Presupuestos</Title>
        <Space>
          <Input placeholder="Buscar..." prefix={<SearchOutlined />} value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ width: 250 }} allowClear />
          <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>Plantilla</Button>
          <Button icon={<UploadOutlined />} onClick={() => fileInputRef.current?.click()}>Importar Excel</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/presupuestos/nuevo')}>
            Nuevo Presupuesto
          </Button>
        </Space>
      </div>

      <Tabs activeKey={statusFilter} onChange={(k) => { setStatusFilter(k); setPage(1); }}
        items={statusTabs.map((t) => ({ key: t.key, label: t.label }))} />

      <Table dataSource={data?.data || []} columns={columns} rowKey="id" loading={isLoading}
        pagination={{ current: page, total: data?.total || 0, pageSize: 20, onChange: setPage,
          showTotal: (total) => `${total} registros` }}
        size="middle" scroll={{ x: 1200 }}
        onRow={(record: any) => ({ onClick: () => navigate(`/presupuestos/${record.id}`), style: { cursor: 'pointer' } })} />
    </div>
  );
}
