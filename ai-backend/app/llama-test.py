import urllib.request
import json

def test_ollama_local():
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": "llama3.2:3b",
        "prompt": "Why is the sky blue?",
        "stream": False
    }
    
    print(f"--- testing local Ollama (llama3.2:3b) ---")
    try:
        data = json.dumps(payload).encode("utf-8")
        headers = {"Content-Type": "application/json"}
        req = urllib.request.Request(url, data=data, headers=headers)
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            print("【Success】Response：")
            print(result.get("response"))
    except Exception as e:
        print(f"【Failed】Connection Issue: {e}")

if __name__ == "__main__":
    test_ollama_local()