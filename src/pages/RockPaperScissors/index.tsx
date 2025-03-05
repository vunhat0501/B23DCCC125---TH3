import { useState } from "react";
import { Button, Card, List, Typography } from "antd";

const { Title } = Typography;
const choices = ["✌️Kéo", "👊Búa", "🖐Bao"];

type GameResult = {
    player: string;
    computer: string;
    result: string;
};

const getComputerChoice = (): string => {
    return choices[Math.floor(Math.random() * choices.length)];
};

const determineWinner = (player: string, computer: string): string => {
    if (player === computer) return "Hòa";
    if (
        (player === "✌️Kéo" && computer === "🖐Bao") ||
        (player === "👊Búa" && computer === "✌️Kéo") ||
        (player === "🖐Bao" && computer === "👊Búa")
    ) {
        return "Người chơi thắng!";
    }
    return "Máy thắng!";
};

export default function RockPaperScissors() {
    const [history, setHistory] = useState<GameResult[]>([]);
    const [playerChoice, setPlayerChoice] = useState<string | null>(null);
    const [computerChoice, setComputerChoice] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);

    const playGame = (playerChoice: string) => {
        const computerChoice = getComputerChoice();
        const result = determineWinner(playerChoice, computerChoice);

        setPlayerChoice(playerChoice);
        setComputerChoice(computerChoice);
        setResult(result);

        const gameResult: GameResult = {
            player: playerChoice,
            computer: computerChoice,
            result: result,
        };

        setHistory([...history, gameResult]);
    };

    return (
        <Card className="max-w-md mx-auto shadow-lg p-6">
            <Title level={2} className="text-center">Oẳn Tù Tì</Title>
            <div className="flex justify-around mb-4">
                {choices.map((choice) => (
                    <Button key={choice} type="primary" size="large" onClick={() => playGame(choice)}>
                        {choice}
                    </Button>
                ))}
            </div>
            <div className="text-center my-4 bg-gray-100 p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold">👤 Bạn chọn: <span className="text-blue-500">{playerChoice}</span></h2>
                <h2 className="text-lg font-semibold">🤖 Máy chọn: <span className="text-red-500">{computerChoice}</span></h2>
                <h2 className="text-lg font-semibold">🏆 Kết quả: <span className="text-green-500">{result}</span></h2>
            </div>
            <Title level={4}>Lịch sử các ván đấu:</Title>
            <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ccc", padding: "8px", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
                <List
                    bordered
                    dataSource={history}
                    renderItem={(game, index) => (
                        <List.Item>
                            <strong>Ván {index + 1}</strong>: 👤 {game.player} vs 🤖 {game.computer} → <strong>{game.result}</strong>
                        </List.Item>
                    )}
                />
            </div>
        </Card>
    );
}