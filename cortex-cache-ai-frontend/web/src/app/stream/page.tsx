'use client';

import { useState } from 'react';

export default function StreamingComponent() {
    const [response, setResponse] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);

    const fetchStream = async () => {
        setResponse('');
        setIsStreaming(true);

        try {
            const res = await fetch('/api/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: "What did federated learning and blockchain?",
                    metadata: {
                        user_id: "soham"
                    },
                    number: 0,
                    is_pro: true
                }),
            });

            if (!res.body) {
                throw new Error('Response body is null');
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                lines.forEach((line) => {
                    if (line.startsWith('data: ')) {
                        const token = line.slice(6);
                        console.log(token);
                        setResponse((prev) => prev + token);
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching stream:', error);
        } finally {
            setIsStreaming(false);
        }
    };

    return (
        <div>
            <h1>Streaming Response:</h1>
            <button onClick={fetchStream} disabled={isStreaming}>
                {isStreaming ? 'Streaming...' : 'Start Stream'}
            </button>
            <p>{response}</p>
        </div>
    );
}