import React, { useState } from "react";
import { useModel } from "umi";
import { Table, Button, Form, Input, InputNumber, Modal, Space, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Subject } from "@/services/Subject/typings";

const MonHoc = () => {
	const { subjects, handleAddSubject,handleEditSubject, handleDeleteSubject } = useModel("subject");
	const [modalVisible, setModalVisible] = useState(false);
	const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
	const [form] = Form.useForm();

	const handleModal = (subject?: Subject) => {
		setEditingSubject(subject || null);
		setModalVisible(true);
		if (subject) {
			form.setFieldsValue(subject);
		} else {
			form.resetFields();
		}
	}

	const onSubmit = () => {
		form.validateFields().then((values) => {
			if (editingSubject) {
				handleEditSubject(editingSubject.id, values);
			} else {
				handleAddSubject(values.subjectId, values.name, values.credits, values.knowledgeBlocks.split(","));
			}
			setModalVisible(false);
		});
	}

	const columns = [
		{
			title: "ID",
			dataIndex: "id",
			key: 'name',
		},
		{
			title: "Mã môn học",
			dataIndex: "subjectId",
			key: 'subjectId',
		},
		{
			title: "Tên môn học",
			dataIndex: " subject name",
			key: "subject name",
		},
		{
			title: "Số tín chỉ",
			dataIndex: "credits",
			key: "credits",
		},
		{
			title: "Khối kiến thức",
			dataIndex: "knowledgeBlocks",
			key: "knowledgeBlocks",
			render: (knowledgeBlocks: { id: string, name: string }[]) => (
				<>
					{knowledgeBlocks.map((block) => (
						<Tag key={block.id} color="blue">
							{block.name}
						</Tag>
					))}
				</>
			),
		},
		{
			title: "",
			key: "action",
			render: (text: any, record: Subject) => (
				<Space>
					<Button icon={<EditOutlined />} onClick={() => handleModal(record)}>
						Edit
					</Button>
					<Button icon={<DeleteOutlined />} onClick={() => handleDeleteSubject(record.id)}>
						Delete
					</Button>
				</Space>
			)
		},
	];

	return (
		<div style={{ padding: 20 }}>
			<h1>Mon Hoc</h1>

			<Button
				type="primary"
				icon={<PlusOutlined />}
				onClick={() => handleModal()}
				style={{ marginBottom: 20 }}
			>
				Add Subject
			</Button>

			<Table
				dataSource={subjects}
				columns={columns}
				rowKey="id"
			/>

			<Modal
				title={editingSubject ? "Edit Subject" : "Add Subject"}
				visible={modalVisible}
				onOk={onSubmit}
				onCancel={() => setModalVisible(false)}
			>
				<Form form={form} layout="vertical">
					<Form.Item name="subjectId" label="Mã môn" rules={[{ required: true, message: "Vui lòng điền mã môn học" }]}>
						<Input />
					</Form.Item>
					<Form.Item name="name" label="Tên môn" rules={[{ required: true, message: "Vui lòng điền tên môn học" }]}>
						<Input />
					</Form.Item>	
					<Form.Item name="credits" label="Số tín chỉ" rules={[{ required: true, message: "Vui lòng điền số tín chỉchỉ" }]}>
						<InputNumber />
					</Form.Item>
					<Form.Item name="knowledgeBlocks" label="Khối kiến thức " rules={[{ required: true, message: "Vui lòng điền khối kiến thức" }]}>
						<Input placeholder="Nhập các khối kiến thức cách nhau bằng dấu phẩy" />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	)
};

export default MonHoc;