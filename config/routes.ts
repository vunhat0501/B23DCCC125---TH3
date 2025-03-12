import component from '@/locales/en-US/component';
import path from 'path';

export default [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
			{
				path: '/user',
				redirect: '/user/login',
			},
		],
	},

	///////////////////////////////////
	// DEFAULT MENU
	{
		path: '/dashboard',
		name: 'Dashboard',
		component: './TrangChu',
		icon: 'HomeOutlined',
	},
	{
		path: '/gioi-thieu',
		name: 'About',
		component: './TienIch/GioiThieu',
		hideInMenu: true,
	},
	{
		path: '/random-user',
		name: 'RandomUser',
		component: './RandomUser',
		icon: 'ArrowsAltOutlined',
	},
	{
		path: '/khach-hang',
		name: 'Khach Hang',
		icon: 'UserOutlined',
		component: './KhachHang/DatLich',
	},
	{
		path: '/admin',
		name: 'Admin',
		icon: 'SolutionOutlined',
		routes: [
			{
				path: '/admin/nhan-vien',
				name: 'Nhan Vien',
				component: './Admin/NhanVien',
			},
			{
				path: '/admin/dich-vu',
				name: 'Dich Vu',
				component: './Admin/DichVu',
			},
			{
				path: '/admin/lich-hen',
				name: 'Lich Hen',
				component: './Admin/LichHen',
			},
			{
				path: '/admin/rating',
				name: 'Rating',
				component: './Admin/Rating',
			},
			{
				path: '/admin/thong-ke',
				name: 'Thong Ke',
				component: './Admin/ThongKe',
			},
			{
				path: '/admin/thu-nhap',
				name: 'Thu Nhap',
				component: './Admin/ThuNhap',
			},
		],
	},

	// DANH MUC HE THONG
	// {
	// 	name: 'DanhMuc',
	// 	path: '/danh-muc',
	// 	icon: 'copy',
	// 	routes: [
	// 		{
	// 			name: 'ChucVu',
	// 			path: 'chuc-vu',
	// 			component: './DanhMuc/ChucVu',
	// 		},
	// 	],
	// },

	{
		path: '/notification',
		routes: [
			{
				path: './subscribe',
				exact: true,
				component: './ThongBao/Subscribe',
			},
			{
				path: './check',
				exact: true,
				component: './ThongBao/Check',
			},
			{
				path: './',
				exact: true,
				component: './ThongBao/NotifOneSignal',
			},
		],
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/',
	},
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
	{
		component: './exception/404',
	},
];
