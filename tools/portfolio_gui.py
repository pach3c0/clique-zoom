import argparse
import threading
import time
import tkinter as tk
from tkinter import ttk, messagebox

from playwright.sync_api import sync_playwright


def run_playwright_automation(url, password, headless, step_delay=0.4, log_fn=print):
    log_fn("Iniciando automação...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless, slow_mo=200)
        page = browser.new_page()
        
        # Aceitar todos os alerts automaticamente
        page.on("dialog", lambda dialog: dialog.accept())

        log_fn("Abrindo admin...")
        page.goto(url, wait_until="domcontentloaded", timeout=60000)

        if page.locator("#login-password").is_visible():
            log_fn("Fazendo login...")
            page.fill("#login-password", password)
            page.click("#login-form button[type='submit']")

        page.wait_for_selector("#admin-panel", state="visible", timeout=60000)

        log_fn("Aba Portfolio renderizando...")
        time.sleep(2)
        
        log_fn("Clicando em Portfolio...")
        try:
            page.click("button[data-tab='portfolio']", timeout=10000)
        except Exception as e:
            log_fn(f"Clique falhou, tentando via JS: {e}")
            page.eval_on_selector("button[data-tab='portfolio']", "el => el.click()")
        
        log_fn("Aguardando render do Portfolio...")
        time.sleep(2)
        
        log_fn("Procurando galeria de portfolio...")
        try:
            page.wait_for_selector("#portfolio-grid", state="attached", timeout=10000)
        except Exception as e:
            log_fn(f"Galeria não encontrada: {e}")
            log_fn("Fazendo screenshot para debug...")
            page.screenshot(path="/tmp/debug_portfolio.png")
            raise

        log_fn("Aplicando alterações...")
        log_fn("1. Contando fotos atuais...")
        current_count = page.eval_on_selector(
            "#portfolio-grid",
            "el => el.querySelectorAll('[data-index]').length"
        )
        log_fn(f"   Fotos atuais: {current_count}")
        time.sleep(step_delay)

        log_fn("2. Fazendo upload de 3 imagens de teste...")
        # Fazer upload via input de arquivo
        file_input = page.locator("input[type='file'][accept*='.jpg']").first
        
        # Criar 3 arquivos de teste com cores diferentes
        import tempfile
        from PIL import Image
        
        test_files = []
        colors = [('red', 'Vermelho'), ('blue', 'Azul'), ('green', 'Verde')]
        
        for color, name in colors:
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
                img = Image.new('RGB', (800, 600), color=color)
                img.save(tmp.name)
                test_files.append(tmp.name)
                log_fn(f"   Criado arquivo {name}: {tmp.name}")
        
        log_fn(f"   Enviando {len(test_files)} arquivos...")
        
        # Capturar mensagens do console
        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
        
        file_input.set_input_files(test_files)
        log_fn("   Aguardando processamento do upload...")
        time.sleep(5)  # Aguarda tempo suficiente para upload processar
        
        # Mostrar mensagens do console
        if console_messages:
            log_fn("   Mensagens do console:")
            for msg in console_messages[-10:]:  # Últimas 10 mensagens
                log_fn(f"     {msg}")

        log_fn("3. Aguardando confirmação de upload...")
        time.sleep(2)
        
        # Verificar se nova foto foi adicionada
        new_count = page.eval_on_selector(
            "#portfolio-grid",
            "el => el.querySelectorAll('[data-index]').length"
        )
        log_fn(f"   Fotos após upload: {new_count}")
        time.sleep(step_delay)

        if new_count > current_count:
            log_fn("4. Abrindo editor da nova foto...")
            # Clicar no botão de edição da última foto
            page.click(f"button[onclick*='openPhotoEditor({new_count - 1})']")
            time.sleep(1.5)
            
            log_fn("5. Ajustando posição X...")
            page.fill("#pro-pos-x-slider", "70")
            page.eval_on_selector("#pro-pos-x-slider", "el => el.dispatchEvent(new Event('input', { bubbles: true }))")
            time.sleep(step_delay)
            
            log_fn("6. Ajustando posição Y...")
            page.fill("#pro-pos-y-slider", "40")
            page.eval_on_selector("#pro-pos-y-slider", "el => el.dispatchEvent(new Event('input', { bubbles: true }))")
            time.sleep(step_delay)
            
            log_fn("7. Ajustando zoom...")
            page.fill("#pro-zoom-slider", "1.3")
            page.eval_on_selector("#pro-zoom-slider", "el => el.dispatchEvent(new Event('input', { bubbles: true }))")
            time.sleep(step_delay)
            
            log_fn("8. Aplicando alterações da foto...")
            page.click("button:has-text('Aplicar')")
            time.sleep(1.5)

        log_fn("Aguardando salvar...")
        time.sleep(2)

        log_fn("Pressione Enter para fechar o navegador...")
        input()

        log_fn("Concluído.")
        browser.close()


class PortfolioAutomationGUI(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Portfolio Automation")
        self.geometry("720x400")
        self.resizable(False, False)

        self.url_var = tk.StringVar(value="http://localhost:3000/admin/")
        self.password_var = tk.StringVar(value="")
        self.headless_var = tk.BooleanVar(value=False)
        self.step_delay_var = tk.DoubleVar(value=0.4)

        self._build_ui()

    def _build_ui(self):
        pad = {"padx": 10, "pady": 6}

        header = ttk.Label(self, text="Automação do Portfolio (Login + Upload + Ajustes)", font=("Arial", 14, "bold"))
        header.pack(pady=10)

        form = ttk.Frame(self)
        form.pack(fill="x", padx=12)

        ttk.Label(form, text="URL do Admin").grid(row=0, column=0, sticky="w", **pad)
        ttk.Entry(form, textvariable=self.url_var, width=60).grid(row=0, column=1, sticky="w", **pad)

        ttk.Label(form, text="Senha do Admin").grid(row=1, column=0, sticky="w", **pad)
        ttk.Entry(form, textvariable=self.password_var, show="*", width=30).grid(row=1, column=1, sticky="w", **pad)

        ttk.Checkbutton(form, text="Headless", variable=self.headless_var).grid(row=2, column=1, sticky="w", **pad)
        ttk.Label(form, text="Delay entre ações (s)").grid(row=3, column=0, sticky="w", **pad)
        ttk.Spinbox(form, textvariable=self.step_delay_var, from_=0.1, to=3.0, increment=0.1, width=8).grid(row=3, column=1, sticky="w", **pad)

        sep1 = ttk.Separator(self, orient="horizontal")
        sep1.pack(fill="x", pady=8)

        controls = ttk.Frame(self)
        controls.pack(fill="x", padx=12, pady=8)

        ttk.Button(controls, text="Executar Automação", command=self.run_automation).pack(side="left")
        ttk.Button(controls, text="Limpar Log", command=self.clear_log).pack(side="left", padx=8)

        self.log = tk.Text(self, height=14, wrap="word")
        self.log.pack(fill="both", padx=12, pady=6, expand=True)

    def log_msg(self, msg):
        self.log.insert("end", msg + "\n")
        self.log.see("end")

    def clear_log(self):
        self.log.delete("1.0", "end")

    def run_automation(self):
        if not self.url_var.get().strip() or not self.password_var.get().strip():
            messagebox.showerror("Erro", "Preencha URL e senha.")
            return

        thread = threading.Thread(target=self._automation_worker, daemon=True)
        thread.start()

    def _automation_worker(self):
        url = self.url_var.get().strip()
        password = self.password_var.get().strip()
        headless = self.headless_var.get()
        step_delay = float(self.step_delay_var.get())

        try:
            run_playwright_automation(url, password, headless, step_delay, self.log_msg)
        except Exception as e:
            self.log_msg(f"Erro: {e}")
            import traceback
            self.log_msg(traceback.format_exc())


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Automação do Portfolio (GUI ou CLI).")
    parser.add_argument("--url", help="URL do admin")
    parser.add_argument("--password", help="Senha do admin")
    parser.add_argument("--headless", action="store_true", help="Executa em modo headless")
    parser.add_argument("--headed", action="store_true", help="Executa com navegador visível")
    parser.add_argument("--step-delay", type=float, default=0.4, help="Delay entre ações (s)")
    args = parser.parse_args()

    if args.url and args.password:
        headless = True if args.headless else False
        if args.headed:
            headless = False
        run_playwright_automation(args.url, args.password, headless, args.step_delay)
    else:
        app = PortfolioAutomationGUI()
        app.mainloop()
