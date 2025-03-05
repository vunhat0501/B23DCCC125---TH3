import { useState, useEffect } from 'react';
import { Card, Input, Select, Button, Table, Space, message, Typography, Modal, Form } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FileExcelOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface Question {
	id: number;
	subject: string;
	content: string;
	level: string;
	category: string;
}

const levels: string[] = ['Dễ', 'Trung bình', 'Khó', 'Rất khó'];

export default function QuestionManager() {
	const [questions, setQuestions] = useState<Question[]>(() => {
		const saved = localStorage.getItem('questions');
		return saved ? JSON.parse(saved) : [];
	});
	const [form, setForm] = useState<Omit<Question, 'id'>>({ subject: '', content: '', level: '', category: '' });
	const [editingId, setEditingId] = useState<number | null>(null);
	const [search, setSearch] = useState({ subject: '', level: '', category: '' });
	const [isModalVisible, setIsModalVisible] = useState(false);
    const [subjects, setSubjects] = useState<{ id: number, name: string }[]>([]);
    const [knowledgeBlocks, setKnowledgeBlocks] = useState<{ id: number, name: string }[]>([]);

	useEffect(() => {
		localStorage.setItem('questions', JSON.stringify(questions));
	}, [questions]);

    useEffect(() => {
        const savedSubjects = localStorage.getItem('subjects');
        const savedKnowledgeBlocks = localStorage.getItem('knowledgeBlocks');
        if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
        if (savedKnowledgeBlocks) setKnowledgeBlocks(JSON.parse(savedKnowledgeBlocks));
    }, []);

    useEffect(() => {
        const savedSubjects = localStorage.getItem('subjects');
        if (savedSubjects) {
            const parsedSubjects = JSON.parse(savedSubjects);
            const selectedSubject = parsedSubjects.find((s: { id: number, name: string }) => s.name === form.subject);
            if (selectedSubject) {
                setKnowledgeBlocks(selectedSubject.knowledgeBlocks);
            } else {
                setKnowledgeBlocks([]);
            }
        }
    }, [form.subject]);

	const handleChange = (name: string, value: string) => {
		setForm({ ...form, [name]: value });
	};

	const handleSearchChange = (name: string, value: string) => {
		setSearch({ ...search, [name]: value ? value.trim() : '' });
	};

	const handleAddOrUpdate = () => {
		if (!form.subject.trim() || !form.content.trim() || !form.level || !form.category.trim()) {
			message.warning('Vui lòng điền đầy đủ thông tin câu hỏi.');
			return;
		}
		if (editingId !== null) {
			setQuestions(questions.map((q) => (q.id === editingId ? { ...form, id: editingId } : q)));
			message.success('Cập nhật câu hỏi thành công!');
			setEditingId(null);
		} else {
			setQuestions([...questions, { ...form, id: Date.now() }]);
			message.success('Thêm câu hỏi thành công!');
		}
		setForm({ subject: '', content: '', level: '', category: '' });
		setIsModalVisible(false);
	};

	const handleEdit = (id: number) => {
		const q = questions.find((q) => q.id === id);
		if (q) {
			setForm(q);
			setEditingId(id);
			setIsModalVisible(true);
		}
	};

	const handleDelete = (id: number) => {
		setQuestions(questions.filter((q) => q.id !== id));
		message.success('Xóa câu hỏi thành công!');
	};

	const filteredQuestions = questions.filter(
		(q) =>
			q.subject.toLowerCase().includes(search.subject.toLowerCase()) &&
			q.level.toLowerCase().includes(search.level.toLowerCase()) &&
			q.category.toLowerCase().includes(search.category.toLowerCase()),
	);

	const columns = [
		{ title: 'Mã', dataIndex: 'id', key: 'id' },
		{ title: 'Môn học', dataIndex: 'subject', key: 'subject' },
		{ title: 'Nội dung', dataIndex: 'content', key: 'content' },
		{ title: 'Mức độ', dataIndex: 'level', key: 'level' },
		{ title: 'Khối kiến thức', dataIndex: 'category', key: 'category' },
		{
			title: 'Hành động',
			key: 'actions',
			render: (_: any, record: Question) => (
				<Space>
					<Button icon={<EditOutlined />} onClick={() => handleEdit(record.id)} type='primary' ghost />
					<Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} danger ghost />
				</Space>
			),
		},
	];

	return (
		<div style={{ maxWidth: 900, margin: 'auto', padding: 20 }}>
			<Title level={2} style={{ textAlign: 'center', marginBottom: 20 }}>
				Quản lý Câu hỏi
			</Title>

			<Space style={{ width: '100%', justifyContent: 'space-between' }}>
				<Button type='primary' icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
					Thêm câu hỏi
				</Button>
			</Space>

			<Card style={{ marginTop: 20, padding: 20, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
				<Space direction='vertical' style={{ width: '100%' }}>
					<Input
						placeholder='Tìm theo môn học'
						value={search.subject}
						onChange={(e) => handleSearchChange('subject', e.target.value)}
						prefix={<SearchOutlined />}
					/>
					<Select
						placeholder='Lọc theo mức độ'
						value={search.level}
						onChange={(value) => handleSearchChange('level', value)}
						style={{ width: '100%' }}
						allowClear
					>
						{levels.map((lvl) => (
							<Select.Option key={lvl} value={lvl}>
								{lvl}
							</Select.Option>
						))}
					</Select>
					<Input
						placeholder='Tìm theo khối kiến thức'
						value={search.category}
						onChange={(e) => handleSearchChange('category', e.target.value)}
						prefix={<SearchOutlined />}
					/>
				</Space>
			</Card>

			<Table
				dataSource={filteredQuestions}
				columns={columns}
				rowKey='id'
				pagination={{ pageSize: 5 }}
				bordered
				style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
			/>

			<Modal
				title={editingId ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi'}
				visible={isModalVisible}
				onCancel={() => setIsModalVisible(false)}
				onOk={handleAddOrUpdate}
			>
				<Form layout='vertical'>
					<Form.Item label='Môn học' required>
						<Select value={form.subject} onChange={(value) => handleChange('subject', value)} style={{ width: '100%' }}>
                            {subjects.map((subject) => (
                            <Select.Option key={subject.id} value={subject.name}>
                                {subject.name}
                            </Select.Option>
                            ))}
                        </Select>
					</Form.Item>
					<Form.Item label='Nội dung câu hỏi' required>
						<Input value={form.content} onChange={(e) => handleChange('content', e.target.value)} />
					</Form.Item>
					<Form.Item label='Mức độ' required>
						<Select value={form.level} onChange={(value) => handleChange('level', value)} style={{ width: '100%' }}>
							{levels.map((lvl) => (
								<Select.Option key={lvl} value={lvl}>
									{lvl}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item label='Khối kiến thức' required>
						<Select value={form.category} onChange={(value) => handleChange('category', value)} style={{ width: '100%' }}>
                            {knowledgeBlocks.map((block) => (
                            <Select.Option key={block.id} value={block.name}>
                                {block.name}
                            </Select.Option>
                            ))}
                        </Select>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
