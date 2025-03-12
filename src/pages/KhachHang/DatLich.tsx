import React, { useState, useEffect } from "react";
import { DatePicker, TimePicker, Select, Button, Table, Input, Modal, Rate, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

interface Employee {
  id: number;
  name: string;
}

interface Service {
  id: number;
  name: string;
  duration: number;
}

interface LichHen {
  id: number;
  ngay: string;
  gio: string;
  nhanVien: string;
  dichVu: string;
  trangThai: string;
  danhGia?: string;
  soSao?: number;
}

const trangThaiList = ["Chờ duyệt", "Xác nhận", "Hủy", "Hoàn thành"];

const TrangDatLich: React.FC = () => {
  const [ngay, setNgay] = useState<string>("");
  const [gio, setGio] = useState<string>("");
  const [nhanVien, setNhanVien] = useState<string>("");
  const [dichVu, setDichVu] = useState<string>("");
  const [lichHenList, setLichHenList] = useState<LichHen[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLich, setSelectedLich] = useState<LichHen | null>(null);
  const [danhGia, setDanhGia] = useState<string>("");
  const [soSao, setSoSao] = useState<number>(3);

  useEffect(() => {
    const savedData = localStorage.getItem("lichHenList");
    if (savedData) {
      setLichHenList(JSON.parse(savedData));
    }

    const storedEmployees = localStorage.getItem("employees");
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    }

    const storedServices = localStorage.getItem("services");
    if (storedServices) {
      setServices(JSON.parse(storedServices));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("lichHenList", JSON.stringify(lichHenList));
  }, [lichHenList]);

  const handleDatLich = () => {
    if (!ngay || !gio || !nhanVien || !dichVu) {
      message.error("Vui lòng chọn đầy đủ thông tin");
      return;
    }
  
    const selectedService = services.find((s) => s.name === dichVu);
    if (!selectedService) {
      message.error("Dịch vụ không hợp lệ");
      return;
    }
  
    const startTime = dayjs(`${ngay} ${gio}`, "YYYY-MM-DD HH:mm");
    const endTime = startTime.add(selectedService.duration, "minute");
  
    // Kiểm tra xem lịch có trùng không
    const isTrungLich = lichHenList.some((lich) => {
      if (lich.ngay !== ngay || lich.nhanVien !== nhanVien) return false;
  
      const lichStartTime = dayjs(`${lich.ngay} ${lich.gio}`, "YYYY-MM-DD HH:mm");
      const lichEndTime = lichStartTime.add(
        services.find((s) => s.name === lich.dichVu)?.duration || 0,
        "minute"
      );
  
      // Trùng khi khoảng thời gian giao nhau
      return !(endTime.isBefore(lichStartTime) || startTime.isAfter(lichEndTime));
    });
  
    if (isTrungLich) {
      message.error("Nhân viên đã có lịch trong thời gian này, vui lòng chọn thời gian khác");
      return;
    }
  
    const lichMoi: LichHen = {
      id: Date.now(),
      ngay,
      gio,
      nhanVien,
      dichVu,
      trangThai: "Chờ duyệt",
    };
  
    setLichHenList([...lichHenList, lichMoi]);
    message.success("Đặt lịch thành công!");
  };
  

  const handleCapNhatTrangThai = (id: number, newStatus: string) => {
    const updatedList = lichHenList.map((lich) =>
      lich.id === id ? { ...lich, trangThai: newStatus } : lich
    );
    setLichHenList(updatedList);
    message.success("Cập nhật trạng thái thành công!");
  };

  const handleDanhGia = (lich: LichHen) => {
    if (lich.trangThai !== "Hoàn thành") {
      message.error("Chỉ có thể đánh giá khi lịch hẹn đã hoàn thành");
      return;
    }
    setSelectedLich(lich);
    setDanhGia(lich.danhGia || "");
    setSoSao(lich.soSao || 3);
    setIsModalVisible(true);
  };

  const handleSubmitDanhGia = () => {
    if (selectedLich) {
      const updatedList = lichHenList.map((lich) =>
        lich.id === selectedLich.id ? { ...lich, danhGia, soSao } : lich
      );
      setLichHenList(updatedList);
      message.success("Đánh giá thành công!");
      setIsModalVisible(false);
    }
  };

  const filteredLichHenList = lichHenList.filter(
    (lich) =>
      lich.nhanVien.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lich.dichVu.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnsType<LichHen> = [
    { title: "Ngày", dataIndex: "ngay" },
    { title: "Giờ", dataIndex: "gio" },
    { title: "Nhân viên", dataIndex: "nhanVien" },
    { title: "Dịch vụ", dataIndex: "dichVu" },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      render: (_, lich) => (
        <Select
          value={lich.trangThai}
          onChange={(value) => handleCapNhatTrangThai(lich.id, value)}
        >
          {trangThaiList.map((status) => (
            <Select.Option key={status} value={status}>
              {status}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Hành động",
      render: (_, lich) => (
        <Button type="link" onClick={() => handleDanhGia(lich)}>Đánh giá</Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h1>Đặt Lịch Hẹn</h1>
      <DatePicker onChange={(date) => setNgay(date ? date.format("YYYY-MM-DD") : "")} />
      <TimePicker onChange={(time) => setGio(time ? time.format("HH:mm") : "")} format="HH:mm" />
      
      <Select placeholder="Chọn nhân viên" value={nhanVien} onChange={setNhanVien} style={{ width: 200}}>
        {employees.map((emp) => (
          <Select.Option key={emp.id} value={emp.name}>
            {emp.name}
          </Select.Option>
        ))}
      </Select>

      <Select placeholder="Chọn dịch vụ" value={dichVu} onChange={setDichVu} style={{ width: 200 }}>
        {services.map((srv) => (
          <Select.Option key={srv.id} value={srv.name}>
            {srv.name}
          </Select.Option>
        ))}
      </Select>

      <Button type="primary" onClick={handleDatLich}>Đặt lịch</Button>

      <Input
        placeholder="Tìm kiếm theo nhân viên hoặc dịch vụ"
        style={{ marginTop: 10, marginBottom: 10 }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <h2 style={{ marginTop: 20 }}>Danh sách lịch hẹn</h2>
      <Table dataSource={filteredLichHenList} columns={columns} rowKey="id" />

      <Modal
        title="Đánh giá dịch vụ"
        visible={isModalVisible}
        onOk={handleSubmitDanhGia}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input.TextArea value={danhGia} onChange={(e) => setDanhGia(e.target.value)} placeholder="Nhập đánh giá" />
        <Rate value={soSao} onChange={setSoSao} style={{ marginTop: 10 }} />
      </Modal>
    </div>
  );
};

export default TrangDatLich;
