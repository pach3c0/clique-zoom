import argparse
import threading
import time
import tkinter as tk
from tkinter import ttk, messagebox

from playwright.sync_api import sync_playwright


def _set_text(page, selector, value):
    page.fill(selector, value)
    page.eval_on_selector(selector, "el => el.dispatchEvent(new Event('input', { bubbles: true }))")


def run_playwright_automation(url, password, headless, values, step_delay=0.4, log_fn=print):
    log_fn("Iniciando automação...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless, slow_mo=200)
        page = browser.new_page()

        log_fn("Abrindo admin...")
        page.goto(url, wait_until="domcontentloaded", timeout=60000)

        if page.locator("#login-password").is_visible():
            log_fn("Fazendo login...")
            page.fill("#login-password", password)
            page.click("#login-form button[type='submit']")

        page.wait_for_selector("#admin-panel", state="visible", timeout=60000)

        log_fn("Aba Sobre renderizando...")
        time.sleep(2)
        
        log_fn("Clicando em Sobre...")
        try:
            page.click("button[data-tab='sobre']", timeout=10000)
        except Exception as e:
            log_fn(f"Clique falhou, tentando via JS: {e}")
            page.eval_on_selector("button[data-tab='sobre']", "el => el.click()")
        
        log_fn("Aguardando render do Sobre...")
        time.sleep(2)
        
        log_fn("Procurando elemento #about-title...")
        try:
            page.wait_for_selector("#about-title", state="attached", timeout=10000)
        except Exception as e:
            log_fn(f"Elemento não encontrado: {e}")
            log_fn("Fazendo screenshot para debug...")
            page.screenshot(path="/tmp/debug.png")
            raise

        def read_value(selector):
            try:
                return page.eval_on_selector(selector, "el => el.value")
            except Exception:
                return None

        current = {
            "title": read_value("#about-title"),
            "text": read_value("#about-text"),
            "image": read_value("#about-image"),
        }

        def ensure_diff_text(val, cur):
            if val == cur:
                return f"{val} (auto)"
            return val

        values_to_apply = {
            "title": ensure_diff_text(values["title"], current["title"]),
            "text": ensure_diff_text(values["text"], current["text"]),
            "image": values["image"],
        }

        log_fn("Aplicando alterações...")
        log_fn("1. Alterando título da seção...")
        _set_text(page, "#about-title", values_to_apply["title"])
        time.sleep(step_delay)

        log_fn("2. Alterando texto...")
        _set_text(page, "#about-text", values_to_apply["text"])
        time.sleep(step_delay)

        log_fn("3. Alterando imagem...")
        _set_text(page, "#about-image", values_to_apply["image"])
        time.sleep(step_delay)

        after = {
            "title": read_value("#about-title"),
            "text": read_value("#about-text"),
            "image": read_value("#about-image"),
        }

        log_fn(f"Antes: title={current['title']}")
        log_fn(f"Depois: title={after['title']}")

        log_fn("Aguardando salvar...")
        time.sleep(2)

        log_fn("Pressione Enter para fechar o navegador...")
        input()

        log_fn("Concluído.")
        browser.close()


class SobreAutomationGUI(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Sobre Automation")
        self.geometry("720x500")
        self.resizable(False, False)

        self.url_var = tk.StringVar(value="http://localhost:3000/admin/")
        self.password_var = tk.StringVar(value="")
        self.headless_var = tk.BooleanVar(value=False)
        self.step_delay_var = tk.DoubleVar(value=0.4)

        self.title_var = tk.StringVar(value="Sobre - Teste Automático")
        self.text_var = tk.StringVar(
            value="Este é um texto de teste automático para a seção sobre. "
            "Pode conter múltiplos parágrafos separados por linhas em branco."
        )
        self.image_var = tk.StringVar(value="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop")

        self._build_ui()

    def _build_ui(self):
        pad = {"padx": 10, "pady": 6}

        header = ttk.Label(self, text="Automação do Sobre (Login + Alterações)", font=("Arial", 14, "bold"))
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

        sobre = ttk.LabelFrame(self, text="Valores do Sobre")
        sobre.pack(fill="x", padx=12)

        ttk.Label(sobre, text="Título").grid(row=0, column=0, sticky="w", **pad)
        ttk.Entry(sobre, textvariable=self.title_var, width=60).grid(row=0, column=1, sticky="w", **pad)

        ttk.Label(sobre, text="Texto").grid(row=1, column=0, sticky="nw", **pad)
        text_frame = ttk.Frame(sobre)
        text_frame.grid(row=1, column=1, sticky="w", **pad)
        text_scroll = ttk.Scrollbar(text_frame)
        text_scroll.pack(side="right", fill="y")
        text_widget = tk.Text(text_frame, height=4, width=50, yscrollcommand=text_scroll.set)
        text_widget.pack(side="left")
        text_scroll.config(command=text_widget.yview)
        text_widget.insert("1.0", self.text_var.get())
        self.text_var_widget = text_widget

        ttk.Label(sobre, text="Imagem (URL)").grid(row=2, column=0, sticky="w", **pad)
        ttk.Entry(sobre, textvariable=self.image_var, width=60).grid(row=2, column=1, sticky="w", **pad)

        controls = ttk.Frame(self)
        controls.pack(fill="x", padx=12, pady=8)

        ttk.Button(controls, text="Executar Automação", command=self.run_automation).pack(side="left")
        ttk.Button(controls, text="Limpar Log", command=self.clear_log).pack(side="left", padx=8)

        self.log = tk.Text(self, height=8, wrap="word")
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
        text = self.text_var_widget.get("1.0", "end-1c")

        values = {
            "title": self.title_var.get(),
            "text": text,
            "image": self.image_var.get(),
        }

        try:
            run_playwright_automation(url, password, headless, values, step_delay, self.log_msg)
        except Exception as e:
            self.log_msg(f"Erro: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Automação do Sobre (GUI ou CLI).")
    parser.add_argument("--url", help="URL do admin")
    parser.add_argument("--password", help="Senha do admin")
    parser.add_argument("--headless", action="store_true", help="Executa em modo headless")
    parser.add_argument("--headed", action="store_true", help="Executa com navegador visível")
    parser.add_argument("--step-delay", type=float, default=0.4, help="Delay entre ações (s)")
    args = parser.parse_args()

    if args.url and args.password:
        values = {
            "title": "Sobre - Teste Automático",
            "text": "Este é um texto de teste automático para a seção sobre.\n\nPode conter múltiplos parágrafos separados por linhas em branco.",
            "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop",
        }
        headless = True if args.headless else False
        if args.headed:
            headless = False
        run_playwright_automation(args.url, args.password, headless, values, args.step_delay)
    else:
        app = SobreAutomationGUI()
        app.mainloop()
