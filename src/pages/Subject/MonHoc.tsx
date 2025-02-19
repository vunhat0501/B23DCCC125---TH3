import { useState, useEffect } from 'react';
import { Layout, Card, Form, Input, Button, List, Modal, message, Tag, Typography, Empty } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, BookOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title } = Typography;

// Enhanced vibrant colors with gradients
const subjectColors = [
	{ color: '#ff4d4f', gradient: 'linear-gradient(45deg, #ff4d4f, #ff7875)' },
	{ color: '#40a9ff', gradient: 'linear-gradient(45deg, #40a9ff, #69c0ff)' },
	{ color: '#52c41a', gradient: 'linear-gradient(45deg, #52c41a, #95de64)' },
	{ color: '#722ed1', gradient: 'linear-gradient(45deg, #722ed1, #b37feb)' },
	{ color: '#13c2c2', gradient: 'linear-gradient(45deg, #13c2c2, #36cfc9)' },
	{ color: '#faad14', gradient: 'linear-gradient(45deg, #faad14, #ffc53d)' },
	{ color: '#eb2f96', gradient: 'linear-gradient(45deg, #eb2f96, #f759ab)' },
	{ color: '#a0d911', gradient: 'linear-gradient(45deg, #a0d911, #bae637)' },
];

function MonHoc() {
	interface Subject {
		id: number;
		name: string;
		description: string;
		color: string;
		gradient: string;
	}

	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
	const [form] = Form.useForm();

	useEffect(() => {
		const savedSubjects = localStorage.getItem('subjects');
		if (savedSubjects) {
			setSubjects(JSON.parse(savedSubjects));
		}
	}, []);

	useEffect(() => {
		localStorage.setItem('subjects', JSON.stringify(subjects));
	}, [subjects]);

	const showModal = (subject: Subject | null = null) => {
		setEditingSubject(subject);
		if (subject) {
			form.setFieldsValue(subject);
		} else {
			form.resetFields();
		}
		setIsModalVisible(true);
	};

	const handleOk = () => {
		form.validateFields().then((values) => {
			if (editingSubject) {
				setSubjects(subjects.map((s) => (s.id === editingSubject.id ? { ...s, ...values } : s)));
				message.success({
					content: 'Môn học đã được cập nhật thành công!',
					style: { marginTop: '20px' },
				});
			} else {
				const colorIndex = Math.floor(Math.random() * subjectColors.length);
				const newSubject = {
					...values,
					id: Date.now(),
					color: subjectColors[colorIndex].color,
					gradient: subjectColors[colorIndex].gradient,
				};
				setSubjects([...subjects, newSubject]);
				message.success({
					content: 'Môn học mới đã được thêm thành công!',
					style: { marginTop: '20px' },
				});
			}
			setIsModalVisible(false);
			form.resetFields();
		});
	};

	const deleteSubject = (id: number) => {
		Modal.confirm({
			title: (
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: '12px',
						padding: '12px 0',
					}}
				>
					<ExclamationCircleOutlined
						style={{
							fontSize: '24px',
							color: '#ff4d4f',
						}}
					/>
					<span
						style={{
							fontSize: '18px',
							fontWeight: 600,
							color: '#262626',
						}}
					>
						Xác nhận xóa môn học
					</span>
				</div>
			),
			content: (
				<div
					style={{
						backgroundColor: '#fff2f0',
						border: '1px solid #ffccc7',
						borderRadius: '8px',
						padding: '16px',
						marginTop: '12px',
					}}
				>
					<p
						style={{
							color: '#434343',
							marginBottom: '8px',
							fontSize: '14px',
						}}
					>
						Bạn có chắc chắn muốn xóa môn học này?
					</p>
					<p
						style={{
							color: '#666',
							fontSize: '13px',
							margin: 0,
						}}
					>
						Hành động này không thể hoàn tác sau khi thực hiện.
					</p>
				</div>
			),
			okText: 'Xóa',
			cancelText: 'Hủy',
			okButtonProps: {
				danger: true,
				style: {
					background: 'linear-gradient(45deg, #ff4d4f, #ff7875)',
					border: 'none',
					boxShadow: '0 2px 8px rgba(255,77,79,0.35)',
					height: '38px',
					padding: '0 24px',
				},
			},
			cancelButtonProps: {
				style: {
					height: '38px',
					padding: '0 24px',
				},
			},
			className: 'delete-modal',
			onOk() {
				const elementToRemove = document.querySelector(`[data-subject-id="${id}"]`) as HTMLElement;
				if (elementToRemove) {
					elementToRemove.style.transform = 'scale(0.8)';
					elementToRemove.style.opacity = '0';
				}

				setTimeout(() => {
					setSubjects(subjects.filter((subject) => subject.id !== id));
					message.success({
						content: 'Môn học đã được xóa thành công!',
						style: { marginTop: '20px' },
					});
				}, 200);
			},
		});
	};

	return (
		<Layout className='min-h-screen'>
			<Header
				style={{
					background: 'linear-gradient(90deg, #1890ff, #69c0ff)',
					padding: '0 20px',
					boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
					display: 'flex',
					alignItems: 'center',
				}}
			>
				<BookOutlined style={{ fontSize: '28px', color: '#fff', marginRight: '12px' }} />
				<Title level={3} style={{ margin: 0, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
					Quản Lý Môn Học
				</Title>
			</Header>

			<Content style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
				<Card
					title={
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<span style={{ fontSize: '18px', fontWeight: 600 }}>Danh Sách Môn Học</span>
							<Button
								type='primary'
								icon={<PlusOutlined />}
								onClick={() => showModal()}
								style={{
									background: 'linear-gradient(45deg, #1890ff, #69c0ff)',
									border: 'none',
									boxShadow: '0 2px 8px rgba(24,144,255,0.3)',
									height: '38px',
									padding: '0 24px',
								}}
							>
								Thêm Môn Học
							</Button>
						</div>
					}
					bordered={false}
					style={{
						boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
						borderRadius: '12px',
					}}
				>
					<List
						grid={{
							gutter: 24,
							xs: 1,
							sm: 2,
							md: 3,
							lg: 3,
							xl: 4,
							xxl: 4,
						}}
						dataSource={subjects}
						locale={{
							emptyText: (
								<Empty
									image={Empty.PRESENTED_IMAGE_SIMPLE}
									description={<span style={{ color: '#666' }}>Chưa có môn học nào. Hãy thêm môn học mới!</span>}
								/>
							),
						}}
						renderItem={(subject) => (
							<List.Item>
								<Card
									hoverable
									data-subject-id={subject.id}
									style={{
										borderRadius: '12px',
										overflow: 'hidden',
										border: 'none',
										background: subject.gradient,
										boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
										transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
										opacity: 1,
										transform: 'scale(1)',
									}}
									bodyStyle={{
										background: '#fff',
										borderTop: `3px solid ${subject.color}`,
									}}
									actions={[
										<EditOutlined
											key='edit'
											onClick={() => showModal(subject)}
											style={{ color: '#1890ff', fontSize: '16px' }}
										/>,
										<DeleteOutlined
											key='delete'
											onClick={() => deleteSubject(subject.id)}
											style={{ color: '#ff4d4f', fontSize: '16px' }}
										/>,
									]}
								>
									<Card.Meta
										title={
											<div
												style={{
													display: 'flex',
													alignItems: 'center',
													gap: '8px',
													marginBottom: '8px',
												}}
											>
												<span
													style={{
														fontSize: '16px',
														fontWeight: 600,
														color: '#262626',
													}}
												>
													{subject.name}
												</span>
												<Tag
													color={subject.color}
													style={{
														borderRadius: '4px',
														margin: 0,
														padding: '0 8px',
													}}
												>
													Môn học
												</Tag>
											</div>
										}
										description={
											<div
												style={{
													color: '#595959',
													fontSize: '14px',
													lineHeight: '1.5',
												}}
											>
												{subject.description}
											</div>
										}
									/>
								</Card>
							</List.Item>
						)}
					/>
				</Card>

				<Modal
					title={
						<div
							style={{
								fontSize: '18px',
								fontWeight: 600,
								color: '#262626',
							}}
						>
							{editingSubject ? 'Sửa Môn Học' : 'Thêm Môn Học Mới'}
						</div>
					}
					visible={isModalVisible}
					onOk={handleOk}
					onCancel={() => {
						setIsModalVisible(false);
						form.resetFields();
					}}
					okText={editingSubject ? 'Cập nhật' : 'Thêm'}
					cancelText='Hủy'
					okButtonProps={{
						style: {
							background: 'linear-gradient(45deg, #1890ff, #69c0ff)',
							border: 'none',
						},
					}}
					style={{ top: 20 }}
				>
					<Form form={form} layout='vertical' style={{ marginTop: '20px' }}>
						<Form.Item
							name='name'
							label={<span style={{ fontSize: '14px', fontWeight: 500 }}>Tên môn học</span>}
							rules={[{ required: true, message: 'Vui lòng nhập tên môn học!' }]}
						>
							<Input placeholder='Nhập tên môn học' style={{ height: '40px', borderRadius: '6px' }} />
						</Form.Item>
						<Form.Item
							name='description'
							label={<span style={{ fontSize: '14px', fontWeight: 500 }}>Mô tả</span>}
							rules={[{ required: true, message: 'Vui lòng nhập mô tả môn học!' }]}
						>
							<Input.TextArea placeholder='Nhập mô tả môn học' rows={4} style={{ borderRadius: '6px' }} />
						</Form.Item>
					</Form>
				</Modal>
			</Content>
		</Layout>
	);
}

export default MonHoc;
