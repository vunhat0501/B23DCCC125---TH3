import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message } from 'antd';

interface Service {
	id: number;
	name: string;
	price: number;
	duration: number;
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

const ServiceManagement: React.FC = () => {
	const [services, setServices] = useState<Service[]>([]);
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	const [form] = Form.useForm<Service>();

	useEffect(() => {
		const savedServices: Service[] = getData('services') || [];
		setServices(savedServices);
	}, []);

	const columns = [
		{
			title: 'Tên dịch vụ',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Giá tiền',
			dataIndex: 'price',
			key: 'price',
			render: (price: number) => `${price} VND`,
		},
		{
			title: 'Thời lượng (phút)',
			dataIndex: 'duration',
			key: 'duration',
		},
		{
			title: 'Actions',
			key: 'actions',
			render: (_: any, record: Service) => (
				<>
					<Button type='link' onClick={() => handleEdit(record)}>
						Sửa
					</Button>
					<Button type='link' danger onClick={() => handleDelete(record.id)}>
						xóa
					</Button>
				</>
			),
		},
	];

	const handleEdit = (service: Service) => {
		form.setFieldsValue(service);
		setIsModalVisible(true);
	};

	const handleDelete = (id: number) => {
		const updatedServices = services.filter((service) => service.id !== id);
		setServices(updatedServices);
		saveData('services', updatedServices);
		message.success('Đã xóa dịch vụ thành công');
	};

	const onFinish = (values: Service) => {
		const updatedServices = services.map((service) => (service.id === values.id ? { ...service, ...values } : service));

		if (!values.id) {
			updatedServices.push({
				...values,
				id: Date.now(),
			});
		}

		setServices(updatedServices);
		saveData('services', updatedServices);
		setIsModalVisible(false);
		form.resetFields();
		message.success('Đã lưu dịch vụ thành công');
	};

	return (
		<>
			<Button type='primary' onClick={() => setIsModalVisible(true)} style={{ marginBottom: 16 }}>
				Thêm dịch vụ
			</Button>

			<Table columns={columns} dataSource={services} rowKey='id' />

			<Modal
				title='Chi tiết dịch vụ'
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
						label='Tên dịch vụ'
						rules={[{ required: true, message: 'Please input service name!' }]}
					>
						<Input />
					</Form.Item>

					<Form.Item name='price' label='Giá tiền' rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}>
						<InputNumber min={0} prefix='VND' step={1000} style={{ width: '100%' }} />
					</Form.Item>

					<Form.Item
						name='duration'
						label='Thời lượng (phút)'
						rules={[{ required: true, message: 'Vui lòng nhập thời lượng' }]}
					>
						<InputNumber min={1} style={{ width: '100%' }} />
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
};

export default ServiceManagement;


