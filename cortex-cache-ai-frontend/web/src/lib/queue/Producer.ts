import { Kafka, Producer } from 'kafkajs';

export class KafkaProducer {
    private static instance: KafkaProducer;
    private _producer = {} as Producer;
    private _isConnected = false;

    private constructor() {
        const kafka = new Kafka({
            clientId: 'quick-recall-ai-service',
            brokers: ['localhost:9092'],
        });
        this._producer = kafka.producer();
    }

    public static getInstance(): KafkaProducer {
        if (!KafkaProducer.instance) {
            KafkaProducer.instance = new KafkaProducer();
        }
        return KafkaProducer.instance;
    }

    public get isConnected() {
        return this._isConnected;
    }

    async connect(): Promise<void> {
        try {
            await this._producer.connect();
            this._isConnected = true;
        } catch (err) {
            console.error(err);
        }
    }

    async sendMessage(topic: string, message: string, apiKey: string): Promise<void> {
        if (!this._isConnected) {
            throw new Error('Producer is not connected');
        }

        try {
            await this._producer.send({
                topic,
                messages: [{ value: message, headers: { 'x-api-key': apiKey } }],
            });
        } catch (err) {
            console.error('Error sending message:', err);
            throw err;
        }
    }

    async disconnect(): Promise<void> {
        if (this._isConnected) {
            await this._producer.disconnect();
            this._isConnected = false;
        }
    }
}