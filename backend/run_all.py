import subprocess
import sys
import time
import os

def main():
    root = os.path.dirname(os.path.abspath(__file__))
    python_exe = sys.executable

    print("=" * 65)
    print("  INDUSTRIAL ENERGY EFFICIENCY COPILOT - MICROSERVICES RUNNER")
    print("  ANGEL Innovation Hackathon 2026 | PT Indmira & PT Aqua Gas Energy")
    print("=" * 65)

    print("[1/3] Menjalankan Analytics Service (gRPC: 50051)...")
    p1 = subprocess.Popen([python_exe, os.path.join(root, "services", "analytics_service.py")])
    time.sleep(1)

    print("[2/3] Menjalankan CNG Transition Service (gRPC: 50052)...")
    p2 = subprocess.Popen([python_exe, os.path.join(root, "services", "cng_service.py")])
    time.sleep(1)

    print("[3/3] Menjalankan FastAPI Gateway (HTTP & WebSocket: 8000)...")
    p3 = subprocess.Popen([
        python_exe, "-m", "uvicorn", "gateway.app:app", 
        "--host", "0.0.0.0", "--port", "8000"
    ], cwd=root)

    print("\nSeluruh layanan microservices aktif:")
    print(" -> Analytics gRPC:       localhost:50051")
    print(" -> CNG Transition gRPC:  localhost:50052")
    print(" -> Gateway API & WS:     http://localhost:8000 (ws://localhost:8000/ws/copilot)")
    print("\nTekan Ctrl+C untuk menghentikan seluruh layanan.")

    try:
        p3.wait()
    except KeyboardInterrupt:
        print("\nMenghentikan seluruh microservices...")
        p1.terminate()
        p2.terminate()
        p3.terminate()
        print("Selesai.")

if __name__ == "__main__":
    main()
