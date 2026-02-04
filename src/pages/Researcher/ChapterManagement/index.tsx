
import { useState } from "react";
import { Button, Tooltip, Image, Tag } from "antd";
import { NodeIndexOutlined } from "@ant-design/icons";
import DataTable from "@/components/common/DataTable";
// Reuse components from Admin as they are generic forms/details
import ChapterForm from "@/pages/Admin/GameManagement/ChapterManagement/components/Form";
import ChapterDetail from "@/pages/Admin/GameManagement/ChapterManagement/components/Detail";
import ChapterPreview from "@/pages/Admin/GameManagement/ChapterManagement/components/ChapterPreview";
import { useChapterModel } from "./model";
import { getImageUrl } from "@/utils/image.helper";

const ResearcherChapterManagement = () => {
  const {
    // CRUD State
    data,
    loading,
    pagination,
    handleTableChange,
    search,
    selectedIds,
    setSelectedIds,
    refresh,
    deleteItem,
    batchDelete,
    handleSubmit,
    // Filters
    filters: filterValues,
    updateFilters,
    clearFilters: onClearFilters,
    // UI State & Handlers
    currentRecord,
    formVisible,
    detailVisible,
    openCreate,
    openEdit,
    openDetail,
    closeForm,
    closeDetail,
  } = useChapterModel();

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewChapter, setPreviewChapter] = useState<{id: number, name: string} | null>(null);

  const openPreview = (record: any) => {
      setPreviewChapter(record);
      setPreviewVisible(true);
  };

  const handleFilterChange = (key: string, value: any) => {
    updateFilters({ [key]: value });
  };

  const columns = [
    {
      title: "Thứ tự",
      dataIndex: "order",
      key: "order",
      width: 20,
      sorter: true,
    },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      width: 40,
      align: 'center',
      render: (url: string) => (
        <div style={{ margin: '0 auto', width: 60, height: 36, borderRadius: 4, overflow: 'hidden', background: '#f5f5f5', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Image 
            src={getImageUrl(url)} 
            alt="thumbnail" 
            width={60}
            height={36}
            style={{ objectFit: 'cover' }} 
            fallback="https://via.placeholder.com/60x36?text=No+Img"
          />
        </div>
      )
    },
    {
      title: "Tên Chương",
      dataIndex: "name",
      key: "name",
      width: 250,
      align: 'left',
      render: (text: string) => <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>,
    },
    {
      title: "Chủ đề",
      dataIndex: "theme",
      key: "theme",
      align: "left",
      width: 150,
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
      key: "color",
      width: 100,
      render: (color: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 16, height: 16, borderRadius: '2px', backgroundColor: color, border: '1px solid #ddd' }} />
          <span>{color}</span>
        </div>
      )
    },
    {
      title: "Yêu cầu",
      dataIndex: "requiredPetals",
      width: 60,
      render: (val: number) => `${val} cánh hoa`,
    },
    // Removed Author col since it's always "Me"
  ];

  const filterConfig = [
    {
        key: 'name',
        label: 'Tên chương',
        type: 'input' as const,
        placeholder: 'Tìm tên chương...',
        defaultOperator: 'like' as const
    },
    {
        key: 'theme',
        label: 'Chủ đề',
        type: 'input' as const,
        placeholder: 'Lọc theo chủ đề...',
        defaultOperator: 'like' as const
    },
    {
        key: 'petalState',
        label: 'Trạng thái',
        type: 'select' as const,
        options: [
            { label: 'Đang khóa', value: 'locked' },
            { label: 'Đang nụ', value: 'closed' },
            { label: 'Đang nở', value: 'blooming' },
            { label: 'Nở rộ', value: 'full' },
        ]
    }
  ];

  return (
    <>
      <DataTable
        title="Quản lý Chương của tôi"
        // Removed headerContent with Tabs
        loading={loading}
        permissionResource="game_content" // Might need adjustment if generic permission blocks this
        columns={columns}
        dataSource={data}
        pagination={pagination}
        onChange={handleTableChange}
        searchable
        onSearch={search}
        filters={filterConfig}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onClearFilters={onClearFilters}
        onAdd={openCreate}
        onView={openDetail}
        onEdit={openEdit}
        onDelete={deleteItem}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: setSelectedIds,
        }}
        onBatchDelete={batchDelete}
        batchOperations={true}
        onRefresh={refresh}
        customActions={(record) => (
          <Tooltip title="Xem màn chơi (Map/Table)">
            <Button
              className="action-btn-standard"
              onClick={() => openPreview(record)}
              style={{ color: "#722ed1", borderColor: "transparent", background: "transparent", padding: "4px 8px" }}
            >
              <NodeIndexOutlined />
            </Button>
          </Tooltip>
        )}
      />

      <ChapterForm
        key={currentRecord ? `edit-${currentRecord.id}` : "create"}
        open={formVisible}
        onCancel={closeForm}
        onSubmit={handleSubmit}
        initialValues={currentRecord}
        loading={loading}
      />

      <ChapterDetail
        open={detailVisible}
        onClose={closeDetail}
        data={currentRecord}
      />

      {previewChapter && (
          <ChapterPreview 
            chapterId={previewChapter.id}
            chapterName={previewChapter.name}
            visible={previewVisible}
            onClose={() => setPreviewVisible(false)}
          />
      )}
    </>
  ); 
};
export default ResearcherChapterManagement;
