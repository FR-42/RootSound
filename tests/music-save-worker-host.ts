import { parentPort, workerData } from 'node:worker_threads';
const host = globalThis as typeof globalThis & { self: { postMessage(value: unknown): void; onmessage?: (event: { data: unknown }) => void } };
host.self = { postMessage: value => parentPort!.postMessage(value) } as typeof host.self;
await import(workerData?.target ?? '../src/workstation/app/music-save-worker.ts');
parentPort!.on('message', data => host.self.onmessage!({ data }));
