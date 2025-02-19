import React, { useState, useEffect } from 'react';
import { InputNumber, Button, Card, Typography, Alert, Progress, Result, Layout } from 'antd';

const { Title, Paragraph } = Typography;
const { Header, Content, Footer } = Layout;

const GuessTheNumberGame: React.FC = () => {
	const [randomNumber, setRandomNumber] = useState<number | null>(null);
	const [guess, setGuess] = useState<number | null>(null);
	const [message, setMessage] = useState<string>('');
	const [attemptsLeft, setAttemptsLeft] = useState<number>(10);
	const [gameOver, setGameOver] = useState<boolean>(false);
	const [status, setStatus] = useState<'success' | 'error' | 'info'>('info');

	useEffect(() => {
		const storedNumber = localStorage.getItem('randomNumber');
		if (storedNumber) {
			setRandomNumber(parseInt(storedNumber, 10));
		} else {
			const newNumber = Math.floor(Math.random() * 100) + 1;
			localStorage.setItem('randomNumber', newNumber.toString());
			setRandomNumber(newNumber);
		}
	}, []);

	const handleGuess = (): void => {
		if (guess === null || guess < 1 || guess > 100) {
			setMessage('⚠️ Vui lòng nhập số từ 1 đến 100.');
			setStatus('error');
			return;
		}

		console.log('Random number:', randomNumber);

		if (guess === randomNumber) {
			setMessage('🎉 Chúc mừng! Bạn đã đoán đúng!');
			setStatus('success');
			setGameOver(true);
		} else if (guess < randomNumber!) {
			setMessage('📉 Bạn đoán quá thấp!');
			setStatus('info');
		} else {
			setMessage('📈 Bạn đoán quá cao!');
			setStatus('info');
		}

		setAttemptsLeft((prev) => {
			const updated = prev - 1;
			if (updated === 0 && guess !== randomNumber) {
				setMessage(`💥 Bạn đã hết lượt! Số đúng là ${randomNumber}.`);
				setStatus('error');
				setGameOver(true);
			}
			return updated;
		});
	};

	const resetGame = (): void => {
		const newNumber = Math.floor(Math.random() * 100) + 1;
		localStorage.setItem('randomNumber', newNumber.toString());
		setRandomNumber(newNumber);
		setGuess(null);
		setMessage('');
		setAttemptsLeft(10);
		setGameOver(false);
		setStatus('info');
	};

	return (
		<Layout className='min-h-screen bg-gray-100'>
			<Header className='bg-blue-600 text-white text-center text-2xl py-4'>🎯 Trò chơi đoán số</Header>
			<Content className='p-6 flex justify-center items-center'>
				<Card className='w-full max-w-md shadow-lg rounded-2xl'>
					<Title level={3}>🔢 Hãy đoán số từ 1 đến 100</Title>
					<Paragraph>Bạn có 10 lượt đoán. Hãy thử vận may của mình nào!</Paragraph>
					{message && <Alert message={message} type={status} showIcon className='mb-4' />}
					{!gameOver ? (
						<>
							<InputNumber
								min={1}
								max={100}
								value={guess ?? undefined}
								onChange={(value) => setGuess(value)}
								className='w-full mb-3'
								placeholder='Nhập số...'
							/>
							<Button type='primary' block onClick={handleGuess} disabled={gameOver || attemptsLeft === 0}>
								🎯 Đoán
							</Button>
							<Progress
								percent={((10 - attemptsLeft) / 10) * 100}
								status={gameOver ? (status === 'success' ? 'success' : 'exception') : 'active'}
								className='mt-4'
							/>
							<Paragraph className='text-center mt-2'>Lượt còn lại: {attemptsLeft}</Paragraph>
						</>
					) : (
						<Result
							status={status === 'success' ? 'success' : 'error'}
							title={status === 'success' ? '🎉 Chiến thắng!' : '😢 Thua cuộc!'}
							subTitle={status === 'error' ? `Số đúng là ${randomNumber}.` : 'Bạn đã đoán đúng số bí ẩn!'}
							extra={
								<Button type='primary' onClick={resetGame}>
									🔄 Chơi lại
								</Button>
							}
						/>
					)}
				</Card>
			</Content>
			<Footer className='text-center bg-gray-200 py-4'>© 2024 Game đoán số | Sử dụng Ant Design</Footer>
		</Layout>
	);
};

export default GuessTheNumberGame;
