import moment, { Moment } from 'moment';
import { useState } from 'react';
import { Button, Form, Input, Modal, Calendar, List, message, Typography } from 'antd';
import { useModel } from 'umi';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Text } = Typography;

const CalendarComponent = () => {
	const { subjects, addSubject, editSubject, deleteSubject } = useModel('subject');
	const [selectedDate, setSelectedDate] = useState<Moment | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [form] = Form.useForm();
	const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
	const [showSubjectList, setShowSubjectList] = useState(false);
	const [isNavigating, setIsNavigating] = useState(false);
	const [currentMonth, setCurrentMonth] = useState<Moment | null>(moment());

	// Handle date selection
	const onSelect = (date: Moment) => {
		if (!isNavigating && date.month() === currentMonth?.month()) {
			setSelectedDate(date);
			setShowSubjectList(true);
		}
	};

	// Handle month/year changes
	const onPanelChange = (date: Moment) => {
		setIsNavigating(true);
		setCurrentMonth(date);
		setShowSubjectList(false);
		setTimeout(() => setIsNavigating(false), 100);
	};

	const handleSubmit = () => {
		form.validateFields().then((values) => {
			if (editingSubjectId) {
				editSubject(editingSubjectId, { ...values, day: selectedDate?.format('YYYY-MM-DD') });
				message.success('Subject updated successfully!');
			} else {
				addSubject(
					values.subject,
					values.start_time,
					values.end_time,
					selectedDate?.format('YYYY-MM-DD') || '',
					values.content,
					values.note,
				);
				message.success('Subject added successfully!');
			}
			setModalVisible(false);
			setEditingSubjectId(null);
			form.resetFields();
			setShowSubjectList(false);
		});
	};

	const handleEdit = (subjectId: string) => {
		const subject = subjects.find((s) => s.id === subjectId);
		if (subject) {
			form.setFieldsValue(subject);
			setEditingSubjectId(subjectId);
			setModalVisible(true);
		}
	};

	const handleDelete = (subjectId: string) => {
		deleteSubject(subjectId);
		message.success('Subject deleted successfully!');
	};

	const handleAddNew = () => {
		form.resetFields();
		setEditingSubjectId(null);
		setModalVisible(true);
	};

	const dateCellRender = (date: Moment) => {
		const daySubjects = subjects.filter((s) => s.day === date.format('YYYY-MM-DD'));
		if (daySubjects.length > 0) {
			return (
				<div style={{ backgroundColor: '#f6ffed', borderRadius: '4px', padding: '2px' }}>
					<Text type='success'>{daySubjects.length} Subjects</Text>
				</div>
			);
		}
		return null;
	};

	return (
		<>
			<Calendar onSelect={onSelect} onPanelChange={onPanelChange} dateCellRender={dateCellRender} />

			{/* List of subjects for the selected date */}
			<Modal
				title={`Subjects on ${selectedDate?.format('YYYY-MM-DD')}`}
				visible={showSubjectList}
				onCancel={() => setShowSubjectList(false)}
				footer={[
					<Button key='add' type='primary' onClick={handleAddNew} icon={<PlusOutlined />}>
						Add New Subject
					</Button>,
				]}
			>
				{selectedDate ? (
					<>
						{subjects.filter((s) => s.day === selectedDate.format('YYYY-MM-DD')).length > 0 ? (
							<List
								size='small'
								dataSource={subjects.filter((s) => s.day === selectedDate.format('YYYY-MM-DD'))}
								renderItem={(item) => (
									<List.Item
										actions={[
											<EditOutlined onClick={() => handleEdit(item.id)} />,
											<DeleteOutlined onClick={() => handleDelete(item.id)} style={{ color: 'red' }} />,
										]}
										onClick={() => handleEdit(item.id)}
									>
										<Text>{item.subject}</Text>
										<br />
										<Text type='secondary'>
											{item.start_time} - {item.end_time}
										</Text>
									</List.Item>
								)}
							/>
						) : (
							<Text type='secondary'>No subjects on this day.</Text>
						)}
					</>
				) : null}
			</Modal>

			{/* Modal for Adding/Editing Subjects */}
			<Modal
				title={editingSubjectId ? 'Edit Subject' : 'Add Subject'}
				visible={modalVisible}
				onCancel={() => setModalVisible(false)}
				onOk={handleSubmit}
			>
				<Form form={form} layout='vertical'>
					<Form.Item name='subject' label='Subject' rules={[{ required: true }]}>
						<Input />
					</Form.Item>
					<Form.Item name='start_time' label='Start Time' rules={[{ required: true }]}>
						<Input type='time' />
					</Form.Item>
					<Form.Item name='end_time' label='End Time' rules={[{ required: true }]}>
						<Input type='time' />
					</Form.Item>
					<Form.Item name='content' label='Content'>
						<Input.TextArea />
					</Form.Item>
					<Form.Item name='note' label='Note'>
						<Input />
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
};

export default CalendarComponent;
