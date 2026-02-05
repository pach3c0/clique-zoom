import requests
import json

# Configuração
ADMIN_URL = "https://cliquezoom.com.br/admin"
API_URL = "https://cliquezoom.com.br/api/site-data"
PASSWORD = "admin123"

# Dados limpos (sem imagens)
clean_data = {
    "hero": {
        "title": "",
        "subtitle": "",
        "image": "",
        "imageScale": 1,
        "imagePosX": 50,
        "imagePosY": 50,
        "titlePosX": 50,
        "titlePosY": 40,
        "titleSize": 48,
        "subtitlePosX": 50,
        "subtitlePosY": 55,
        "subtitleSize": 18,
        "topBarHeight": 0,
        "bottomBarHeight": 0,
        "overlayOpacity": 30
    },
    "about": {
        "title": "",
        "text": "",
        "image": ""
    }
}

# Fazer login primeiro
session = requests.Session()

print("Fazendo login...")
login_resp = requests.post(
    f"{ADMIN_URL.replace('/admin', '')}/api/auth/login",
    json={"password": PASSWORD}
)

if not login_resp.ok:
    print(f"Erro no login: {login_resp.status_code}")
    print(login_resp.text)
    exit(1)

token = login_resp.json().get("token")
if not token:
    print("Token não retornado")
    exit(1)

print(f"Token obtido: {token[:20]}...")

# Fazer requisição GET para obter dados atuais
print("\nObtendo dados atuais...")
get_resp = requests.get(
    API_URL,
    headers={"Authorization": f"Bearer {token}"}
)

if get_resp.ok:
    current_data = get_resp.json()
    print(f"Dados atuais obtidos")
    
    # Mesclar com dados limpos (mantém outras seções)
    update_data = {
        **current_data,
        "hero": clean_data["hero"],
        "about": clean_data["about"]
    }
else:
    print(f"Erro ao obter dados: {get_resp.status_code}")
    update_data = clean_data

# Fazer PUT para limpar
print("\nLimpando Hero e Sobre no banco de dados...")
put_resp = requests.put(
    API_URL,
    json=update_data,
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
)

if put_resp.ok:
    print("✅ Hero e Sobre limpos com sucesso!")
    print("Agora você pode fazer upload das imagens corretas no painel admin.")
else:
    print(f"❌ Erro ao limpar: {put_resp.status_code}")
    print(put_resp.text)
