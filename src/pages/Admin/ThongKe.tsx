import { useState, useEffect } from 'react';
import { Table, Tabs, Input, Tag, Card } from 'antd';

interface LichHen {
	id: number;
	ngay: string;
	gio: string;
	nhanVien: string;
	dichVu: string;
	trangThai: 'Chờ duyệt' | 'Xác nhận' | 'Hoàn thành' | 'Hủy';
}

const statusColors: Record<LichHen['trangThai'], string> = {
	'Chờ duyệt': 'gold',
	'Xác nhận': 'blue',
	'Hoàn thành': 'green',
	Hủy: 'red',
};

const BookingApp = () => {
	const loadAppointments = (): LichHen[] => {
		try {
			const savedData = localStorage.getItem('lichHenList');
			return savedData ? JSON.parse(savedData) : [];
		} catch (error) {
			console.error('Lỗi khi lấy dữ liệu từ localStorage:', error);
			return [];
		}
	};

	const [appointments, setAppointments] = useState<LichHen[]>(loadAppointments);
	const [searchTerm, setSearchTerm] = useState<string>('');

	useEffect(() => {
		localStorage.setItem('lichHenList', JSON.stringify(appointments));
	}, [appointments]);

	useEffect(() => {
		const handleStorageChange = () => {
			setAppointments(loadAppointments());
		};
		window.addEventListener('storage', handleStorageChange);
		return () => window.removeEventListener('storage', handleStorageChange);
	}, []);

	// 🔹 Thống kê số lịch theo ngày
	const countByDate = () => {
		const stats: Record<string, number> = {};
		appointments.forEach((appt) => {
			stats[appt.ngay] = (stats[appt.ngay] || 0) + 1;
		});
		return Object.entries(stats).map(([date, count]) => ({ date, count }));
	};

	// 🔹 Thống kê số lịch theo tháng
	const countByMonth = () => {
		const stats: Record<string, number> = {};
		appointments.forEach((appt) => {
			const month = appt.ngay.slice(0, 7); // YYYY-MM
			stats[month] = (stats[month] || 0) + 1;
		});
		return Object.entries(stats).map(([month, count]) => ({ month, count }));
	};

	// 🔹 Thống kê số lịch theo năm
	const countByYear = () => {
		const stats: Record<string, number> = {};
		appointments.forEach((appt) => {
			const year = appt.ngay.slice(0, 4); // YYYY
			stats[year] = (stats[year] || 0) + 1;
		});
		return Object.entries(stats).map(([year, count]) => ({ year, count }));
	};

	const filteredAppointments = appointments.filter(
		(appt) =>
			(appt.nhanVien?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
			(appt.dichVu?.toLowerCase() || '').includes(searchTerm.toLowerCase()),
	);

	const columns = [
		{ title: 'Ngày', dataIndex: 'ngay', key: 'ngay' },
		{ title: 'Giờ', dataIndex: 'gio', key: 'gio' },
		{ title: 'Nhân viên', dataIndex: 'nhanVien', key: 'nhanVien' },
		{ title: 'Dịch vụ', dataIndex: 'dichVu', key: 'dichVu' },
		{
			title: 'Trạng thái',
			dataIndex: 'trangThai',
			key: 'trangThai',
			render: (status: LichHen['trangThai']) => <Tag color={statusColors[status]}>{status}</Tag>,
		},
	];

	return (
		<div className='container mx-auto p-4'>
			<Card className='shadow-lg'>
				<h1 className='text-2xl font-bold mb-4 text-center'>Quản lý lịch hẹn</h1>

				<Input.Search
					placeholder='🔍 Tìm kiếm nhân viên hoặc dịch vụ...'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					allowClear
					className='mb-4'
					style={{ width: '300px', display: 'block', margin: '0 auto' }}
				/>

				{/* 🔹 Bảng thống kê */}
				<Card className='mb-4 shadow-lg'>
					<h2 className='text-xl font-bold mb-2'>📊 Thống kê lịch hẹn</h2>
					<Tabs defaultActiveKey='1'>
						<Tabs.TabPane tab='Theo ngày' key='1'>
							<Table
								dataSource={countByDate()}
								columns={[
									{ title: 'Ngày', dataIndex: 'date', key: 'date' },
									{ title: 'Số lượng', dataIndex: 'count', key: 'count' },
								]}
								pagination={false}
								rowKey='date'
								bordered
							/>
						</Tabs.TabPane>
						<Tabs.TabPane tab='Theo tháng' key='2'>
							<Table
								dataSource={countByMonth()}
								columns={[
									{ title: 'Tháng', dataIndex: 'month', key: 'month' },
									{ title: 'Số lượng', dataIndex: 'count', key: 'count' },
								]}
								pagination={false}
								rowKey='month'
								bordered
							/>
						</Tabs.TabPane>
						<Tabs.TabPane tab='Theo năm' key='3'>
							<Table
								dataSource={countByYear()}
								columns={[
									{ title: 'Năm', dataIndex: 'year', key: 'year' },
									{ title: 'Số lượng', dataIndex: 'count', key: 'count' },
								]}
								pagination={false}
								rowKey='year'
								bordered
							/>
						</Tabs.TabPane>
					</Tabs>
				</Card>

				{/* 🔹 Danh sách lịch hẹn */}
				<Tabs defaultActiveKey='1' centered>
					<Tabs.TabPane tab='Chờ duyệt' key='1'>
						<Table
							dataSource={filteredAppointments.filter((appt) => appt.trangThai === 'Chờ duyệt')}
							columns={columns}
							rowKey='id'
							bordered
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab='Đã duyệt' key='2'>
						<Table
							dataSource={filteredAppointments.filter((appt) => appt.trangThai === 'Xác nhận')}
							columns={columns}
							rowKey='id'
							bordered
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab='Hoàn thành' key='3'>
						<Table
							dataSource={filteredAppointments.filter((appt) => appt.trangThai === 'Hoàn thành')}
							columns={columns}
							rowKey='id'
							bordered
						/>
					</Tabs.TabPane>
				</Tabs>
			</Card>
		</div>
	);
};

export default BookingApp;
