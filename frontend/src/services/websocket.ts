import { WebSocketMessage, PipelineCompletePayload } from '../types';

type MessageHandler = (msg: WebSocketMessage) => void;

class CopilotSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private onMessageCallback: MessageHandler | null = null;
  private onStatusChangeCallback: ((connected: boolean) => void) | null = null;
  private reconnectInterval: any = null;

  private getApiBase(): string {
    const envApi = import.meta.env.VITE_API_URL;
    if (envApi) return envApi.replace(/\/$/, '');
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return `${window.location.protocol}//${window.location.host}`;
    }
    return 'http://localhost:8000';
  }

  constructor(url?: string) {
    if (url) {
      this.url = url;
    } else {
      const envWs = import.meta.env.VITE_WS_URL;
      if (envWs) {
        this.url = envWs;
      } else {
        const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
        const host = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
          ? window.location.host
          : 'localhost:8000';
        this.url = `${isSecure ? 'wss:' : 'ws:'}//${host}/ws/copilot`;
      }
    }
  }

  public connect(onMessage: MessageHandler, onStatusChange: (connected: boolean) => void) {
    this.onMessageCallback = onMessage;
    this.onStatusChangeCallback = onStatusChange;

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('[WebSocket] Terhubung dengan Gateway Copilot:', this.url);
        this.onStatusChangeCallback?.(true);
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          this.onMessageCallback?.(data);
        } catch (e) {
          console.error('[WebSocket] Gagal parse pesan:', e);
        }
      };

      this.socket.onclose = () => {
        console.warn('[WebSocket] Koneksi terputus. Mencoba rekoneksi...');
        this.onStatusChangeCallback?.(false);
        this.scheduleReconnect();
      };

      this.socket.onerror = (err) => {
        console.error('[WebSocket] Error:', err);
        this.onStatusChangeCallback?.(false);
      };
    } catch (err) {
      console.error('[WebSocket] Init error:', err);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (!this.reconnectInterval) {
      this.reconnectInterval = setInterval(() => {
        if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
          if (this.onMessageCallback && this.onStatusChangeCallback) {
            this.connect(this.onMessageCallback, this.onStatusChangeCallback);
          }
        }
      }, 3000);
    }
  }

  public sendAction(action: string, payload: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action, ...payload }));
      return true;
    }
    return false;
  }

  // REST Fallback in case WebSocket is unavailable
  public async runPipelineRestFallback(csvRaw: string, fuelType: string, cngParams: any): Promise<PipelineCompletePayload> {
    const apiBase = this.getApiBase();
    const formData = new FormData();
    const blob = new Blob([csvRaw], { type: 'text/csv' });
    formData.append('file', blob, 'sample_boiler_data.csv');
    formData.append('default_fuel', fuelType);

    // Step 1: Upload & Audit
    const uploadRes = await fetch(`${apiBase}/api/upload-csv`, {
      method: 'POST',
      body: formData
    });
    const qualityReport = await uploadRes.json();

    // Step 2: Baseline
    const baselineRes = await fetch(`${apiBase}/api/calculate-baseline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        normalized_data: qualityReport.normalized_data,
        equipment_id: 'Boiler-01'
      })
    });
    const baselineData = await baselineRes.json();

    // Step 3: CNG Simulation
    cngParams.current_fuel = fuelType;
    const cngRes = await fetch(`${apiBase}/api/simulate-cng`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cngParams)
    });
    const cngData = await cngRes.json();

    return {
      quality: qualityReport,
      baseline: baselineData,
      cng: cngData,
      audit_trail: [...(baselineData.audit_trail || []), ...(cngData.audit_trail || [])]
    };
  }
}

export const copilotSocket = new CopilotSocketService();
