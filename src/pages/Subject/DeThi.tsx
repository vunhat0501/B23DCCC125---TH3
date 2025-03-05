import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { Card, Select, Button, Table, Space, message, Typography, Modal, Form, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface Question {
	id: number;
	subject: string;
	content: string;
	level: string;
	category: string;
}

interface Exam {
	id: number;
	subject: string;
	structure: { level: string; category: string; count: number }[];
}

const levels = ['Dễ', 'Trung bình', 'Khó', 'Rất khó'];

type ExamFormState = Omit<Exam, 'id'>;

type ExamAction =
	| { type: 'SET_SUBJECT'; payload: string }
	| { type: 'ADD_STRUCTURE' }
	| { type: 'UPDATE_STRUCTURE'; payload: { index: number; key: string; value: string | number } }
	| { type: 'RESET_FORM' };

const examFormReducer = (state: ExamFormState, action: ExamAction): ExamFormState => {
	switch (action.type) {
		case 'SET_SUBJECT':
			return { ...state, subject: action.payload };
		case 'ADD_STRUCTURE':
			return { ...state, structure: [...state.structure, { level: '', category: '', count: 1 }] };
		case 'UPDATE_STRUCTURE':
			const newStructure = [...state.structure];
			(newStructure[action.payload.index] as any)[action.payload.key] = action.payload.value;
			return { ...state, structure: newStructure };
		case 'RESET_FORM':
			return { subject: '', structure: [{ level: '', category: '', count: 1 }] };
		default:
			return state;
	}
};

const DeThi: React.FC = () => {
	const [questions, setQuestions] = useState<Question[]>([]);
	const [exams, setExams] = useState<Exam[]>([]);
	const [form, dispatch] = useReducer(examFormReducer, {
		subject: '',
		structure: [{ level: '', category: '', count: 1 }],
	});
	const [isModalVisible, setIsModalVisible] = useState(false);

	// Đọc dữ liệu từ localStorage khi component được mount
	useEffect(() => {
		const storedQuestions = localStorage.getItem('questions');
		const storedExams = localStorage.getItem('exams');

		if (storedQuestions) setQuestions(JSON.parse(storedQuestions));
		if (storedExams) setExams(JSON.parse(storedExams));
	}, []);

	// Lưu dữ liệu vào localStorage mỗi khi exams thay đổi
	useEffect(() => {
		localStorage.setItem('exams', JSON.stringify(exams));
	}, [exams]);

	const handleCreateExam = useCallback(() => {
		if (!form.subject.trim() || form.structure.length === 0) {
			message.warning('Vui lòng nhập đủ thông tin đề thi.');
			return;
		}
		const newExam = { ...form, id: Date.now() };
		setExams((prevExams) => [...prevExams, newExam]);
		dispatch({ type: 'RESET_FORM' });
		setIsModalVisible(false);
		message.success('Đã tạo đề thi thành công!');
	}, [form]);

	const handleDeleteExam = useCallback((id: number) => {
		setExams((prevExams) => prevExams.filter((e) => e.id !== id));
		message.success('Xóa đề thi thành công!');
	}, []);

	const columns = [
		{ title: 'Mã đề', dataIndex: 'id', key: 'id', width: 100, align: 'center' },
		{ title: 'Môn học', dataIndex: 'subject', key: 'subject', width: 200 },
		{
			title: 'Cấu trúc',
			key: 'structure',
			render: (_: any, record: Exam) => (
				<ul style={{ paddingLeft: 20 }}>
					{record.structure.map((s, index) => (
						<li key={index}>
							<strong>{s.level}</strong> ({s.category}): {s.count} câu
						</li>
					))}
				</ul>
			),
		},
		{
			title: 'Hành động',
			key: 'actions',
			render: (_: any, record: Exam) => (
				<Button icon={<DeleteOutlined />} onClick={() => handleDeleteExam(record.id)} danger ghost />
			),
		},
	];

	return (
		<div style={{ maxWidth: 900, margin: 'auto', padding: 20 }}>
			<Card>
				<Title level={2} style={{ textAlign: 'center', marginBottom: 20 }}>
					Quản lý Đề thi
				</Title>
				<Button type='primary' icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
					Tạo đề thi
				</Button>
				<Table dataSource={exams} columns={columns} rowKey='id' style={{ marginTop: 20 }} bordered />
			</Card>

			<Modal
				title='Tạo đề thi'
				visible={isModalVisible}
				onCancel={() => setIsModalVisible(false)}
				onOk={handleCreateExam}
			>
				<Form layout='vertical'>
					<Form.Item label='Môn học'>
						<Select value={form.subject} onChange={(value) => dispatch({ type: 'SET_SUBJECT', payload: value })}>
							{[...new Set(questions.map((q) => q.subject))].map((subject) => (
								<Select.Option key={subject} value={subject}>
									{subject}
								</Select.Option>
							))}
						</Select>
					</Form.Item>

					{form.structure.map((s, index) => (
						<Space key={index} style={{ display: 'flex', marginBottom: 8, width: '100%' }}>
							<Select
								value={s.level}
								onChange={(value) => dispatch({ type: 'UPDATE_STRUCTURE', payload: { index, key: 'level', value } })}
							>
								{levels.map((level) => (
									<Select.Option key={level} value={level}>
										{level}
									</Select.Option>
								))}
							</Select>
							<Select
								value={s.category}
								onChange={(value) => dispatch({ type: 'UPDATE_STRUCTURE', payload: { index, key: 'category', value } })}
							>
								{[...new Set(questions.map((q) => q.category))].map((category) => (
									<Select.Option key={category} value={category}>
										{category}
									</Select.Option>
								))}
							</Select>
							<InputNumber
								min={1}
								value={s.count}
								onChange={(value) =>
									dispatch({ type: 'UPDATE_STRUCTURE', payload: { index, key: 'count', value: value || 1 } })
								}
							/>
						</Space>
					))}
					<Button type='dashed' onClick={() => dispatch({ type: 'ADD_STRUCTURE' })} style={{ width: '100%' }}>
						+ Thêm cấu trúc
					</Button>
				</Form>
			</Modal>
		</div>
	);
};

export default DeThi;
