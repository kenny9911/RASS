import fs from 'fs/promises';
import path from 'path';
import { ConsultationSession } from './types';

const DB_PATH = path.join(process.cwd(), 'src/data/history.json');

// Ensure DB file exists
async function ensureDb() {
    try {
        await fs.access(DB_PATH);
    } catch {
        await fs.writeFile(DB_PATH, JSON.stringify([]));
    }
}

export async function saveConsultation(session: ConsultationSession): Promise<void> {
    await ensureDb();
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const history: ConsultationSession[] = JSON.parse(data);

    const existingIndex = history.findIndex(h => h.id === session.id);
    if (existingIndex >= 0) {
        history[existingIndex] = session;
    } else {
        history.unshift(session); // Add to beginning
    }

    await fs.writeFile(DB_PATH, JSON.stringify(history, null, 2));
}

export async function getConsultations(): Promise<ConsultationSession[]> {
    await ensureDb();
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
}

export async function getConsultationById(id: string): Promise<ConsultationSession | null> {
    const history = await getConsultations();
    return history.find(h => h.id === id) || null;
}
