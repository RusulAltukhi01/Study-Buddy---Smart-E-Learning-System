from pyngrok import ngrok
import time


NGROK_TOKEN = "32VfHWhqbKEI1agqAFdZBOBCnR7_5gVSDVUb19hCBzxkYnPat"

ngrok.set_auth_token(NGROK_TOKEN)


ngrok.kill()
time.sleep(2)


public_url = ngrok.connect(8000).public_url
print(f"AI Service available at: {public_url}")
print(f"Add this to your .env: VITE_AI_SERVICE_URL={public_url}")


try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\n👋 Shutting down ngrok tunnel...")
    ngrok.kill()