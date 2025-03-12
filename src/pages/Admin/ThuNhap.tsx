import { useState, useEffect } from 'react';
import { Table, Tabs, Card, Statistic, Row, Col } from 'antd';

interface Service {
	id: number;
	name: string;
	price: number;
	duration: number;
}

interface lichHenList {
	id: number;
	ngay: string;
	gio: string;
	nhanVien: string;
	dichVu: string;
	trangThai: 'Chờ duyệt' | 'Xác nhận' | 'Hoàn thành' | 'Hủy';
}

const BookingApp = () => {
	const [appointments, setAppointments] = useState<lichHenList[]>([]);
	const [services, setServices] = useState<Service[]>([]);

	useEffect(() => {
		const storedAppointments = localStorage.getItem('lichHenList');
		const storedServices = localStorage.getItem('services');
		console.log(storedAppointments);
		console.log(storedServices);

		if (storedAppointments) {
			setAppointments(JSON.parse(storedAppointments));
		}
		if (storedServices) {
			setServices(JSON.parse(storedServices));
		}
	}, []);

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
	};

	const calculateRevenue = () => {
		const revenueByEmployee: Record<string, Record<string, number>> = {};
		const revenueByService: Record<string, Record<string, number>> = {};

		appointments.forEach((appt) => {
			if (appt.trangThai === 'Hoàn thành') {
				const monthYear = appt.ngay.slice(0, 7); // Lấy "YYYY-MM"
				const service = services.find((s) => s.name === appt.dichVu);
				if (!service) return;

				// Doanh thu theo nhân viên
				if (!revenueByEmployee[appt.nhanVien]) {
					revenueByEmployee[appt.nhanVien] = {};
				}
				if (!revenueByEmployee[appt.nhanVien][monthYear]) {
					revenueByEmployee[appt.nhanVien][monthYear] = 0;
				}
				revenueByEmployee[appt.nhanVien][monthYear] += service.price;

				// Doanh thu theo dịch vụ
				if (!revenueByService[appt.dichVu]) {
					revenueByService[appt.dichVu] = {};
				}
				if (!revenueByService[appt.dichVu][monthYear]) {
					revenueByService[appt.dichVu][monthYear] = 0;
				}
				revenueByService[appt.dichVu][monthYear] += service.price;
			}
		});

		const formattedEmployeeData = [];
		for (const employee in revenueByEmployee) {
			for (const month in revenueByEmployee[employee]) {
				formattedEmployeeData.push({
					nhanVien: employee,
					thang: month,
					total: revenueByEmployee[employee][month],
				});
			}
		}

		const formattedServiceData = [];
		for (const service in revenueByService) {
			for (const month in revenueByService[service]) {
				formattedServiceData.push({
					dichVu: service,
					thang: month,
					total: revenueByService[service][month],
				});
			}
		}

		return {
			revenueByEmployee: formattedEmployeeData.sort((a, b) => b.thang.localeCompare(a.thang)), // Sắp xếp theo tháng giảm dần
			revenueByService: formattedServiceData.sort((a, b) => b.thang.localeCompare(a.thang)),
		};
	};

	const { revenueByEmployee, revenueByService } = calculateRevenue();

	const columnsEmployee = [
		{ title: 'Nhân viên', dataIndex: 'nhanVien', key: 'nhanVien' },
		{ title: 'Tháng', dataIndex: 'thang', key: 'thang' },
		{ title: 'Doanh thu', dataIndex: 'total', key: 'total', render: (value: number) => formatCurrency(value) },
	];

	const columnsService = [
		{ title: 'Dịch vụ', dataIndex: 'dichVu', key: 'dichVu' },
		{ title: 'Tháng', dataIndex: 'thang', key: 'thang' },
		{ title: 'Doanh thu', dataIndex: 'total', key: 'total', render: (value: number) => formatCurrency(value) },
	];

	return (
		<div className='container mx-auto p-4'>
			<Card title='Thống kê doanh thu' bordered={false} style={{ marginBottom: 16 }}>
				<Row gutter={16}>
					<Col span={24}>
						<Statistic
							title='Tổng doanh thu'
							value={formatCurrency(revenueByEmployee.reduce((sum, item) => sum + item.total, 0))}
						/>
					</Col>
				</Row>
			</Card>
			<Tabs defaultActiveKey='1'>
				<Tabs.TabPane tab='Doanh thu theo nhân viên và tháng' key='1'>
					<Table
						dataSource={revenueByEmployee}
						columns={columnsEmployee}
						rowKey={(record) => `${record.nhanVien}-${record.thang}`}
						bordered
					/>
				</Tabs.TabPane>
				<Tabs.TabPane tab='Doanh thu theo dịch vụ và tháng' key='2'>
					<Table
						dataSource={revenueByService}
						columns={columnsService}
						rowKey={(record) => `${record.dichVu}-${record.thang}`}
						bordered
					/>
				</Tabs.TabPane>
			</Tabs>
		</div>
	);
};

export default BookingApp;
