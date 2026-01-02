import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const moduleName = process.argv[2];
if (!moduleName) {
    console.error('Please provide a module name (e.g. ProductManagement)');
    process.exit(1);
}

const targetDir = path.join(__dirname, '../src/pages/Admin', moduleName);
const componentsDir = path.join(targetDir, 'components');

if (fs.existsSync(targetDir)) {
    console.error(`Module ${moduleName} already exists!`);
    process.exit(1);
}

fs.mkdirSync(componentsDir, { recursive: true });

// Templates
const indexTemplate = `import React, { useState } from "react";
import { Space, Button, Popconfirm, Tooltip, Switch } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import DataTable from "@/components/common/DataTable";
import { useModel } from "./model";
import FormModal from "./components/FormModal";

const ${moduleName} = () => {
  const {
    data, loading, pagination, handleTableChange, search,
    create, update, remove, refresh, filters, updateFilters, clearFilters
  } = useModel();

  const [formVisible, setFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleEdit = (record) => {
    setEditingItem(record);
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    await remove(id);
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Name", dataIndex: "name", key: "name", searchable: true },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(record.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <DataTable
        title="${moduleName}"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        onSearch={search}
        onAdd={() => { setEditingItem(null); setFormVisible(true); }}
        onRefresh={refresh}
      />
      <FormModal
        visible={formVisible}
        onCancel={() => setFormVisible(false)}
        item={editingItem}
        onSave={async (values) => {
          if (editingItem) await update(editingItem.id, values);
          else await create(values);
          setFormVisible(false);
        }}
      />
    </div>
  );
};

export default ${moduleName};
`;

const modelTemplate = `import { useMemo } from "react";
import { message } from "antd";
import { useCRUD } from "@/hooks/useCRUD";
// import service from "@/services/${moduleName.toLowerCase()}.service";

// Placeholder service
const service = {
  getAll: async () => ({ data: [], pagination: {} }),
  create: async () => {},
  update: async () => {},
  delete: async () => {},
  getById: async () => ({}),
  batch: async () => {},
  export: async () => new Blob(),
  import: async () => {},
};

export const useModel = () => {
  const crudOptions = useMemo(() => ({
    onError: (action, error) => message.error(\`Failed to \${action}\`),
  }), []);

  return useCRUD(service, crudOptions);
};
`;

const formTemplate = `import React, { useEffect } from "react";
import { Form, Input, Modal } from "antd";

const FormModal = ({ visible, onCancel, item, onSave }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (item) form.setFieldsValue(item);
      else form.resetFields();
    }
  }, [visible, item]);

  return (
    <Modal
      title={item ? "Edit Item" : "Create Item"}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.validateFields().then(onSave)}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormModal;
`;

fs.writeFileSync(path.join(targetDir, 'index.tsx'), indexTemplate);
fs.writeFileSync(path.join(targetDir, 'model.ts'), modelTemplate);
fs.writeFileSync(path.join(componentsDir, 'FormModal.tsx'), formTemplate);

console.log(`Module ${moduleName} created successfully at ${targetDir}`);
