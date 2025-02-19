import React, { useState, useEffect } from 'react';
import {
	Card,
	Progress,
	Form,
	Input,
	Button,
	Space,
	List,
	Typography,
	Row,
	Col,
	Statistic,
	DatePicker,
	Select,
	Badge,
	Tooltip,
	Popconfirm,
	InputNumber,
	message,
	Switch,
	Modal,
	Empty,
	Upload,
	TimePicker,
} from 'antd';
import {
	ClockCircleOutlined,
	BookOutlined,
	PlusOutlined,
	DeleteOutlined,
	InfoCircleOutlined,
	CheckCircleOutlined,
	WarningOutlined,
	LoadingOutlined,
	BulbOutlined,
	BulbFilled,
	DownloadOutlined,
	UploadOutlined,
	BellOutlined,
	BarChartOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import moment from 'moment';
import type { BadgeProps, ProgressProps } from 'antd';

interface LearningGoal {
	id: number;
	subject: string;
	targetHours: number;
	completedHours: number;
	color: string;
	notes: string;
	startDate: string;
	deadline: string;
	status: 'success' | 'error' | 'warning' | 'processing';
	lastUpdated: string;
	reminderEnabled: boolean;
	reminderTime: string;
}

interface FormValues {
	subject: string;
	targetHours: number;
	notes: string;
	startDate: Dayjs;
	deadline: Dayjs;
	reminderEnabled?: boolean;
	reminderTime?: string;
}

// Theme context
const ThemeContext = React.createContext({ isDarkMode: false, toggleTheme: () => {} });

// Utility functions
const getGoalStatus = (goal: LearningGoal) => {
	const today = moment();
	const deadline = moment(goal.deadline);
	const progress = (goal.completedHours / goal.targetHours) * 100;

	if (goal.completedHours >= goal.targetHours) {
		return {
			status: 'success' as const,
			text: 'Đã hoàn thành',
			color: '#52c41a',
		};
	} else if (deadline.isBefore(today, 'day')) {
		return {
			status: 'error' as const,
			text: 'Quá hạn',
			color: '#f5222d',
		};
	} else if (progress < 30) {
		return {
			status: 'warning' as const,
			text: 'Mới bắt đầu',
			color: '#faad14',
		};
	} else {
		return {
			status: 'processing' as const,
			text: 'Đang thực hiện',
			color: '#1890ff',
		};
	}
};

const exportGoals = (goals: LearningGoal[]) => {
	const dataStr = JSON.stringify(goals, null, 2);
	const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
	const exportFileDefaultName = `learning_goals_${moment().format('YYYY-MM-DD')}.json`;
	const linkElement = document.createElement('a');
	linkElement.setAttribute('href', dataUri);
	linkElement.setAttribute('download', exportFileDefaultName);
	linkElement.click();
};

const importGoals = (file: File): Promise<LearningGoal[]> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const goals = JSON.parse(e.target?.result as string);
				resolve(goals);
			} catch (error) {
				reject(error);
			}
		};
		reader.onerror = (error) => reject(error);
		reader.readAsText(file);
	});
};

const SubjectGoals: React.FC = () => {
	// States
	const [goals, setGoals] = useState<LearningGoal[]>(() => {
		const savedGoals = localStorage.getItem('learningGoals');
		if (savedGoals) {
			const parsedGoals = JSON.parse(savedGoals);
			return parsedGoals.map((goal: LearningGoal) => ({
				...goal,
				status: getGoalStatus(goal).status,
				lastUpdated: goal.lastUpdated || moment().format(),
				reminderEnabled: goal.reminderEnabled || false,
				reminderTime: goal.reminderTime || '09:00',
			}));
		}
		return [];
	});

	const [form] = Form.useForm();
	const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
	const [sortBy, setSortBy] = useState<'progress' | 'deadline'>('progress');
	const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
	const [searchText, setSearchText] = useState('');
	const [loading, setLoading] = useState(false);

	// Effects
	useEffect(() => {
		const goalsWithStatus = goals.map((goal) => ({
			...goal,
			status: getGoalStatus(goal).status,
		}));
		localStorage.setItem('learningGoals', JSON.stringify(goalsWithStatus));
	}, [goals]);

	useEffect(() => {
		localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
		document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
	}, [isDarkMode]);
	// Handlers
	const onFinish = async (values: FormValues) => {
		setLoading(true);
		try {
			const colors = ['#f50', '#2db7f5', '#87d068', '#108ee9', '#722ed1'];
			const newGoal: LearningGoal = {
				id: Date.now(),
				subject: values.subject,
				targetHours: values.targetHours,
				completedHours: 0,
				color: colors[Math.floor(Math.random() * colors.length)],
				notes: values.notes || '',
				startDate: values.startDate.format('YYYY-MM-DD'),
				deadline: values.deadline.format('YYYY-MM-DD'),
				status: 'warning',
				lastUpdated: moment().format(),
				reminderEnabled: values.reminderEnabled || false,
				reminderTime: values.reminderTime || '09:00',
			};
			setGoals((prev) => [...prev, newGoal]);
			form.resetFields();
			message.success('Đã thêm mục tiêu mới!');
		} catch (error) {
			message.error('Có lỗi xảy ra khi thêm mục tiêu!');
		} finally {
			setLoading(false);
		}
	};

	const updateProgress = (id: number, hours: number) => {
		setGoals(
			goals.map((goal) => {
				if (goal.id === id) {
					const updatedGoal = {
						...goal,
						completedHours: Math.min(hours, goal.targetHours),
						lastUpdated: moment().format(),
					};
					return {
						...updatedGoal,
						status: getGoalStatus(updatedGoal).status,
					};
				}
				return goal;
			}),
		);
	};

	const deleteGoal = (id: number) => {
		Modal.confirm({
			title: 'Xác nhận xóa',
			content: 'Bạn có chắc chắn muốn xóa mục tiêu này?',
			okText: 'Xóa',
			cancelText: 'Hủy',
			okButtonProps: { danger: true },
			onOk: () => {
				setGoals(goals.filter((goal) => goal.id !== id));
				message.success('Đã xóa mục tiêu!');
			},
		});
	};

	const handleImport = async (file: File) => {
		try {
			setLoading(true);
			const importedGoals = await importGoals(file);
			setGoals(importedGoals);
			message.success('Đã nhập dữ liệu thành công!');
		} catch (error) {
			message.error('Có lỗi khi nhập dữ liệu!');
		} finally {
			setLoading(false);
		}
	};

	// Calculations
	const statistics = {
		completed: goals.filter((goal) => goal.completedHours >= goal.targetHours).length,
		urgent: goals.filter(
			(goal) => moment(goal.deadline).diff(moment(), 'days') <= 3 && goal.completedHours < goal.targetHours,
		).length,
		inProgress: goals.filter(
			(goal) =>
				goal.completedHours > 0 && // Thêm điều kiện này
				goal.completedHours < goal.targetHours &&
				moment(goal.deadline).diff(moment(), 'days') > 3,
		).length,
	};
	const filteredGoals = goals
		.filter((goal) => {
			const matchesSearch =
				goal.subject.toLowerCase().includes(searchText.toLowerCase()) ||
				goal.notes.toLowerCase().includes(searchText.toLowerCase());
			if (!matchesSearch) return false;

			if (filterStatus === 'completed') return goal.completedHours >= goal.targetHours;
			if (filterStatus === 'active') return goal.completedHours < goal.targetHours;
			return true;
		})
		.sort((a, b) => {
			if (sortBy === 'progress') {
				return b.completedHours / b.targetHours - a.completedHours / a.targetHours;
			}
			return moment(a.deadline).diff(moment(b.deadline));
		});

	// Render
	return (
		<ThemeContext.Provider value={{ isDarkMode, toggleTheme: () => setIsDarkMode(!isDarkMode) }}>
			<div
				style={{
					maxWidth: 1200,
					margin: '0 auto',
					padding: '24px',
					backgroundColor: isDarkMode ? '#141414' : '#ffffff',
					minHeight: '100vh',
				}}
			>
				<div>
					<Row justify='space-between' align='middle' style={{ marginBottom: 24 }}>
						<Typography.Title
							level={2}
							style={{
								margin: 0,
								color: isDarkMode ? '#ffffff' : '#000000',
							}}
						>
							<BookOutlined /> Mục tiêu học tập
						</Typography.Title>
						<Space>
							<Tooltip title='Chuyển đổi giao diện sáng/tối'>
								<Button
									icon={isDarkMode ? <BulbOutlined /> : <BulbFilled />}
									onClick={() => setIsDarkMode(!isDarkMode)}
								/>
							</Tooltip>
							<Tooltip title='Xuất dữ liệu'>
								<Button icon={<DownloadOutlined />} onClick={() => exportGoals(goals)} />
							</Tooltip>
							<Tooltip title='Nhập dữ liệu'>
								<Upload
									accept='.json'
									showUploadList={false}
									beforeUpload={(file) => {
										handleImport(file);
										return false;
									}}
								>
									<Button icon={<UploadOutlined />} />
								</Upload>
							</Tooltip>
						</Space>
					</Row>

					<Row gutter={16} style={{ marginBottom: 24 }}>
						<Col span={6}>
							<Card>
								<Statistic
									title='Đã hoàn thành'
									value={statistics.completed}
									valueStyle={{ color: '#52c41a' }}
									prefix={<CheckCircleOutlined />}
								/>
							</Card>
						</Col>
						<Col span={6}>
							<Card>
								<Statistic
									title='Cần chú ý'
									value={statistics.urgent}
									valueStyle={{ color: '#f5222d' }}
									prefix={<WarningOutlined />}
								/>
							</Card>
						</Col>
						<Col span={6}>
							<Card>
								<Statistic
									title='Đang thực hiện'
									value={statistics.inProgress}
									valueStyle={{ color: '#1890ff' }}
									// Thay đổi từ LoadingOutlined sang BarChartOutlined hoặc một icon khác phù hợp hơn
									prefix={<BarChartOutlined />}
								/>
							</Card>
						</Col>
						<Col span={6}>
							<Card>
								<Statistic title='Tổng số mục tiêu' value={goals.length} prefix={<BookOutlined />} />
							</Card>
							d
						</Col>
					</Row>

					<Card style={{ marginBottom: 24 }}>
						<Form form={form} onFinish={onFinish} layout='vertical'>
							<Row gutter={16}>
								<Col span={8}>
									<Form.Item
										name='subject'
										label='Tên môn học'
										rules={[{ required: true, message: 'Vui lòng nhập tên môn học!' }]}
									>
										<Input prefix={<BookOutlined />} placeholder='Tên môn học' />
									</Form.Item>
								</Col>
								<Col span={4}>
									<Form.Item
										name='targetHours'
										label='Số giờ mục tiêu'
										rules={[{ required: true, message: 'Vui lòng nhập số giờ mục tiêu!' }]}
									>
										<InputNumber min={1} style={{ width: '100%' }} prefix={<ClockCircleOutlined />} />
									</Form.Item>
								</Col>
								<Col span={4}>
									<Form.Item
										name='startDate'
										label='Ngày bắt đầu'
										rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
									>
										<DatePicker style={{ width: '100%' }} />
									</Form.Item>
								</Col>
								<Col span={4}>
									<Form.Item
										name='deadline'
										label='Hạn hoàn thành'
										rules={[
											{ required: true, message: 'Vui lòng chọn hạn hoàn thành!' },
											({ getFieldValue }) => ({
												validator(_, value) {
													if (!value || !getFieldValue('startDate') || getFieldValue('startDate').isBefore(value)) {
														return Promise.resolve();
													}
													return Promise.reject(new Error('Hạn hoàn thành phải sau ngày bắt đầu!'));
												},
											}),
										]}
									>
										<DatePicker style={{ width: '100%' }} />
									</Form.Item>
								</Col>
								<Col span={4} style={{ display: 'flex', alignItems: 'flex-end' }}>
									<Button type='primary' htmlType='submit' block icon={<PlusOutlined />} loading={loading}>
										Thêm mục tiêu
									</Button>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={16}>
									<Form.Item name='notes' label='Ghi chú'>
										<Input.TextArea rows={2} placeholder='Nhập ghi chú cho mục tiêu học tập...' />
									</Form.Item>
								</Col>
								<Col span={8}>
									<Form.Item name='reminderEnabled' label='Bật nhắc nhở'>
										<Switch />
									</Form.Item>
									<Form.Item name='reminderTime' label='Thời gian nhắc' dependencies={['reminderEnabled']}>
										<TimePicker
											format='HH:mm'
											disabled={!Form.useWatch('reminderEnabled', form)}
											style={{ width: '100%' }}
										/>
									</Form.Item>
								</Col>
							</Row>
						</Form>
					</Card>

					<Space style={{ marginBottom: 16 }}>
						<Input.Search
							placeholder='Tìm kiếm mục tiêu...'
							onSearch={(value) => setSearchText(value)}
							style={{ width: 200 }}
						/>
						<Select value={filterStatus} onChange={setFilterStatus} style={{ width: 120 }}>
							<Select.Option value='all'>Tất cả</Select.Option>
							<Select.Option value='active'>Đang học</Select.Option>
							<Select.Option value='completed'>Đã hoàn thành</Select.Option>
						</Select>
						<Select value={sortBy} onChange={setSortBy} style={{ width: 120 }}>
							<Select.Option value='progress'>Theo tiến độ</Select.Option>
							<Select.Option value='deadline'>Theo deadline</Select.Option>
						</Select>
					</Space>

					<List
						grid={{
							gutter: 16,
							xs: 1,
							sm: 1,
							md: 2,
							lg: 2,
							xl: 3,
							xxl: 3,
						}}
						dataSource={filteredGoals}
						locale={{
							emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='Chưa có mục tiêu nào' />,
						}}
						renderItem={(goal) => {
							const goalStatus = getGoalStatus(goal);
							const daysLeft = moment(goal.deadline).diff(moment(), 'days');

							return (
								<List.Item>
									<Card
										title={
											<Space>
												<Badge color={goal.color} />
												{goal.subject}
												<Badge status={goalStatus.status as BadgeProps['status']} text={goalStatus.text} />
											</Space>
										}
										extra={
											<Space>
												<Tooltip title='Thời gian học'>
													<ClockCircleOutlined />
													{goal.completedHours}/{goal.targetHours}h
												</Tooltip>
												<Popconfirm
													title='Bạn có chắc muốn xóa mục tiêu này?'
													onConfirm={() => deleteGoal(goal.id)}
													okText='Có'
													cancelText='Không'
												>
													<Button type='text' danger icon={<DeleteOutlined />} />
												</Popconfirm>
											</Space>
										}
									>
										<Progress
											percent={Math.round((goal.completedHours / goal.targetHours) * 100)}
											status={goalStatus.status as ProgressProps['status']}
											strokeColor={goalStatus.color}
										/>
										<Row gutter={16} style={{ marginTop: 16 }}>
											<Col span={8}>
												<Statistic
													title='Thời gian còn lại'
													value={daysLeft}
													suffix='ngày'
													valueStyle={{
														color: daysLeft <= 3 ? '#f5222d' : undefined,
													}}
												/>
											</Col>
											<Col span={8}>
												<Statistic
													title='Cập nhật lần cuối'
													value={moment(goal.lastUpdated).fromNow()}
													prefix={<ClockCircleOutlined />}
												/>
											</Col>
											<Col span={8}>
												<Statistic
													title='Nhắc nhở'
													value={goal.reminderEnabled ? goal.reminderTime : 'Tắt'}
													prefix={<BellOutlined />}
												/>
											</Col>
										</Row>
										{goal.notes && (
											<Typography.Paragraph type='secondary' style={{ marginTop: 8 }}>
												<InfoCircleOutlined /> {goal.notes}
											</Typography.Paragraph>
										)}
										<div style={{ marginTop: 16 }}>
											<InputNumber
												min={0}
												max={goal.targetHours}
												value={goal.completedHours}
												onChange={(value) => updateProgress(goal.id, Number(value))}
												style={{ width: '100%' }}
												addonBefore='Số giờ đã học'
												addonAfter='giờ'
											/>
										</div>
									</Card>
								</List.Item>
							);
						}}
					/>
				</div>
			</div>
		</ThemeContext.Provider>
	);
};

export default SubjectGoals;
