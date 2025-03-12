import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, TimePicker, InputNumber, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

interface WorkingHours {
	start: string;
	end: string;
}

interface Employee {
	id: number;
	name: string;
	workingHours: WorkingHours;
	dailyLimit: number;
}
export const saveData = (key: string, data: any) => {
	try {
		localStorage.setItem(key, JSON.stringify(data));
	} catch (error) {
		console.error('Error saving to localStorage:', error);
	}
};

export const getData = (key: string): any => {
	try {
		const data = localStorage.getItem(key);
		return data ? JSON.parse(data) : null;
	} catch (error) {
		console.error('Error reading from localStorage:', error);
		return null;
	}
};

const EmployeeManagement: React.FC = () => {
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	const [form] = Form.useForm();

	useEffect(() => {
		const savedEmployees: Employee[] = getData('employees') || [];
		setEmployees(savedEmployees);
	}, []);

	const columns = [
		{
			title: 'Họ và Tên',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Giờ làm việc',
			dataIndex: 'workingHours',
			key: 'workingHours',
			render: (hours: WorkingHours) =>
				`${dayjs(hours.start, 'HH:mm').format('HH:mm')} - ${dayjs(hours.end, 'HH:mm').format('HH:mm')}`,
		},
		{
			title: 'Giới hạn ngày',
			dataIndex: 'dailyLimit',
			key: 'dailyLimit',
		},
		{
			title: 'Hành động',
			key: 'actions',
			render: (_: any, record: Employee) => (
				<>
					<Button type='link' onClick={() => handleEdit(record)}>
						Sửa
					</Button>
					<Button type='link' danger onClick={() => handleDelete(record.id)}>
						Xóa
					</Button>
				</>
			),
		},
	];

	const handleEdit = (employee: Employee) => {
		form.setFieldsValue({
			...employee,
			workingHours: {
				start: employee.workingHours?.start ? dayjs(employee.workingHours.start, 'HH:mm') : null,
				end: employee.workingHours?.end ? dayjs(employee.workingHours.end, 'HH:mm') : null,
			},
		});
		setIsModalVisible(true);
		console.log(employee.workingHours?.start);
	};

	const handleDelete = (id: number) => {
		const updatedEmployees = employees.filter((emp) => emp.id !== id);
		setEmployees(updatedEmployees);
		saveData('employees', updatedEmployees);
		message.success('Employee deleted successfully');
	};
	console.log(getData('employees'));

	const onFinish = (values: any) => {
		const formattedValues: Employee = {
			...values,
			id: values.id || Date.now(),
			workingHours: {
				start: values.workingHours.start,
				end: values.workingHours.end,
			},
		};

		const updatedEmployees = employees.some((emp) => emp.id === values.id)
			? employees.map((emp) => (emp.id === values.id ? { ...emp, ...formattedValues } : emp))
			: [...employees, formattedValues];

		setEmployees(updatedEmployees);
		saveData('employees', updatedEmployees);
		setIsModalVisible(false);
		form.resetFields();
		message.success('Employee saved successfully');
	};

	return (
		<>
			<Button type='primary' onClick={() => setIsModalVisible(true)} style={{ marginBottom: 16 }}>
				Thêm nhân viên
			</Button>

			<Table columns={columns} dataSource={employees} rowKey='id' />

			<Modal
				title='Chi tiết nhân viên'
				visible={isModalVisible}
				onOk={() => form.submit()}
				onCancel={() => {
					setIsModalVisible(false);
					form.resetFields();
				}}
			>
				<Form form={form} onFinish={onFinish} layout='vertical'>
					<Form.Item name='id' hidden>
						<Input />
					</Form.Item>

					<Form.Item
						name='name'
						label='Họ và tên'
						rules={[{ required: true, message: 'Vui lòng nhập tên nhân viên!' }]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						name={['workingHours', 'start']}
						label='Thời gian bắt đầu làm'
						rules={[{ required: true, message: 'Vui lòng nhập thời gian bắt đầu làm!' }]}
					>
						<TimePicker format='HH:mm' />
					</Form.Item>

					<Form.Item
						name={['workingHours', 'end']}
						label='Thời gian kết thúc làm'
						rules={[{ required: true, message: 'Vui lòng nhập thời gian kết thúc làm!' }]}
					>
						<TimePicker format='HH:mm' />
					</Form.Item>

					<Form.Item
						name='dailyLimit'
						label='Giới hạn khách trong ngày'
						rules={[{ required: true, message: 'Please input daily limit!' }]}
					>
						<InputNumber min={1} />
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
};

export default EmployeeManagement;

