import React, { useState, useEffect } from "react";
import { Card, List, Rate, Modal, Input, Button } from "antd";
import { MessageOutlined } from "@ant-design/icons";

interface Review {
    id: number;
    ngay: string;
    gio: string;
    nhanVien: string;
    dichVu: string;
    danhGia?: string;
    soSao?: number;
    response?: string;
}

const EmployeeReviews = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [response, setResponse] = useState<string>("");
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [averageRatings, setAverageRatings] = useState<Record<string, number>>({});

    useEffect(() => {
        const storedData = localStorage.getItem("lichHenList");
        console.log(storedData);
        if (storedData) {
            const parsedData: Review[] = JSON.parse(storedData);
            const filteredReviews = parsedData.filter((review) => review.soSao !== undefined);
            setReviews(filteredReviews);
        }
    }, []);
  
    useEffect(() => {
        if (reviews.length > 0) {
            calculateAverageRatings(reviews);
        }
    }, [reviews]);
  

  const calculateAverageRatings = (reviews: Review[]) => {
    const ratingMap: Record<string, { total: number; count: number }> = {};
    reviews.forEach(({ nhanVien, soSao }) => {
      if (soSao !== undefined) {
        if (!ratingMap[nhanVien]) {
          ratingMap[nhanVien] = { total: 0, count: 0 };
        }
        ratingMap[nhanVien].total += soSao;
        ratingMap[nhanVien].count += 1;
      }
    });

    const averages: Record<string, number> = {};
    Object.keys(ratingMap).forEach((nhanVien) => {
      averages[nhanVien] = ratingMap[nhanVien].total / ratingMap[nhanVien].count;
    });
    setAverageRatings(averages);
  };

  const handleOpenModal = (review: Review) => {
    setSelectedReview(review);
    setResponse(review.response || "");
    setIsModalVisible(true);
  };

  const handleRespond = () => {
    if (selectedReview) {
      const updatedReviews = reviews.map((review) =>
        review.id === selectedReview.id ? { ...review, response } : review
      );
      setReviews(updatedReviews);
      localStorage.setItem("lichHenList", JSON.stringify(updatedReviews));
      setIsModalVisible(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Đánh giá nhân viên</h2>
      <div style={{ marginBottom: 20 }}>
        <h3>Trung bình đánh giá</h3>
        <List
          dataSource={Object.keys(averageRatings)}
          renderItem={(nhanVien) => (
            <List.Item>
              <b>{nhanVien}</b>: <Rate disabled allowHalf value={averageRatings[nhanVien]} /> ({averageRatings[nhanVien].toFixed(1)})
            </List.Item>
          )}
        />
      </div>
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={reviews}
        renderItem={(review) => (
          <List.Item>
            <Card title={`${review.nhanVien} - ${review.dichVu}`}>
              <Rate disabled defaultValue={review.soSao} />
              <p><b>Nhận xét:</b> {review.danhGia}</p>
              {review.response && <p><b>Phản hồi:</b> {review.response}</p>}
              <Button
                type="primary"
                icon={<MessageOutlined />}
                onClick={() => handleOpenModal(review)}
              >
                Phản hồi
              </Button>
            </Card>
          </List.Item>
        )}
      />
      <Modal
        title="Phản hồi đánh giá"
        visible={isModalVisible}
        onOk={handleRespond}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input.TextArea
          rows={3}
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Nhập phản hồi của bạn..."
        />
      </Modal>
    </div>
  );
};

export default EmployeeReviews;
