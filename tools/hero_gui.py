import argparse
import threading
import time
import tkinter as tk
from tkinter import ttk, messagebox

from playwright.sync_api import sync_playwright


def _set_text(page, selector, value):
    page.fill(selector, value)
    page.dispatch_event(selector, "input")


def _set_range(page, selector, value):
    page.eval_on_selector(
        selector,
        """
        (el, val) => {
            el.value = val;
            el.dispatchEvent(new Event('input', { bubbles: true }));
        }
        """,
        value,
    )


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

        log_fn("Abrindo aba Hero...")
        page.click("button[data-tab='hero']")
        page.wait_for_selector("#hero-title", timeout=30000)

        def read_value(selector):
            try:
                return page.eval_on_selector(selector, "el => el.value")
            except Exception:
                return None

        current = {
            "title": read_value("#hero-title"),
            "subtitle": read_value("#hero-subtitle"),
            "image": read_value("#hero-image"),
            "scale": read_value("#hero-scale"),
            "img_x": read_value("#hero-img-x"),
            "img_y": read_value("#hero-img-y"),
            "title_x": read_value("#hero-title-x"),
            "title_y": read_value("#hero-title-y"),
            "title_size": read_value("#hero-title-size"),
            "sub_x": read_value("#hero-sub-x"),
            "sub_y": read_value("#hero-sub-y"),
            "sub_size": read_value("#hero-sub-size"),
            "top_bar": read_value("#hero-top-bar"),
            "bottom_bar": read_value("#hero-bot-bar"),
            "overlay": read_value("#hero-overlay"),
        }

        def to_float(v, default=0.0):
            try:
                return float(v)
            except Exception:
                return default

        def ensure_diff(val, cur, step, min_v, max_v):
            try:
                v = float(val)
            except Exception:
                v = float(min_v)
            c = to_float(cur, v)
            if v == c:
                v = min(max_v, c + step)
                if v == c:
                    v = max(min_v, c - step)
            return v

        values_to_apply = {
            "title": values["title"],
            "subtitle": values["subtitle"],
            "image": values["image"],
            "scale": ensure_diff(values["scale"], current["scale"], 0.05, 0.5, 2.0),
            "img_x": ensure_diff(values["img_x"], current["img_x"], 1, 0, 100),
            "img_y": ensure_diff(values["img_y"], current["img_y"], 1, 0, 100),
            "title_x": ensure_diff(values["title_x"], current["title_x"], 1, 0, 100),
            "title_y": ensure_diff(values["title_y"], current["title_y"], 1, 0, 100),
            "title_size": ensure_diff(values["title_size"], current["title_size"], 1, 20, 80),
            "sub_x": ensure_diff(values["sub_x"], current["sub_x"], 1, 0, 100),
            "sub_y": ensure_diff(values["sub_y"], current["sub_y"], 1, 0, 100),
            "sub_size": ensure_diff(values["sub_size"], current["sub_size"], 1, 10, 40),
            "top_bar": ensure_diff(values["top_bar"], current["top_bar"], 1, 0, 25),
            "bottom_bar": ensure_diff(values["bottom_bar"], current["bottom_bar"], 1, 0, 25),
            "overlay": ensure_diff(values["overlay"], current["overlay"], 1, 0, 80),
        }

        if values_to_apply["title"] == current["title"]:
            values_to_apply["title"] = f"{values_to_apply['title']} (auto)"
        if values_to_apply["subtitle"] == current["subtitle"]:
            values_to_apply["subtitle"] = f"{values_to_apply['subtitle']} (auto)"

        log_fn("Aplicando alterações...")
        log_fn("1. Alterando título...")
        _set_text(page, "#hero-title", values_to_apply["title"])
        time.sleep(step_delay)
        log_fn("2. Alterando subtítulo...")
        _set_text(page, "#hero-subtitle", values_to_apply["subtitle"])
        time.sleep(step_delay)
        log_fn("3. Alterando imagem...")
        _set_text(page, "#hero-image", values_to_apply["image"])
        time.sleep(step_delay)

        log_fn("4. Ajustando zoom...")
        _set_range(page, "#hero-scale", values_to_apply["scale"])
        time.sleep(step_delay)
        log_fn("5. Ajustando posição X da imagem...")
        _set_range(page, "#hero-img-x", values_to_apply["img_x"])
        time.sleep(step_delay)
        log_fn("6. Ajustando posição Y da imagem...")
        _set_range(page, "#hero-img-y", values_to_apply["img_y"])
        time.sleep(step_delay)
        log_fn("7. Ajustando posição X do título...")
        _set_range(page, "#hero-title-x", values_to_apply["title_x"])
        time.sleep(step_delay)
        log_fn("8. Ajustando posição Y do título...")
        _set_range(page, "#hero-title-y", values_to_apply["title_y"])
        time.sleep(step_delay)
        log_fn("9. Ajustando tamanho do título...")
        _set_range(page, "#hero-title-size", values_to_apply["title_size"])
        time.sleep(step_delay)
        log_fn("10. Ajustando posição X do subtítulo...")
        _set_range(page, "#hero-sub-x", values_to_apply["sub_x"])
        time.sleep(step_delay)
        log_fn("11. Ajustando posição Y do subtítulo...")
        _set_range(page, "#hero-sub-y", values_to_apply["sub_y"])
        time.sleep(step_delay)
        log_fn("12. Ajustando tamanho do subtítulo...")
        _set_range(page, "#hero-sub-size", values_to_apply["sub_size"])
        time.sleep(step_delay)
        log_fn("13. Ajustando faixa superior...")
        _set_range(page, "#hero-top-bar", values_to_apply["top_bar"])
        time.sleep(step_delay)
        log_fn("14. Ajustando faixa inferior...")
        _set_range(page, "#hero-bot-bar", values_to_apply["bottom_bar"])
        time.sleep(step_delay)
        log_fn("15. Ajustando overlay...")
        _set_range(page, "#hero-overlay", values_to_apply["overlay"])
        time.sleep(step_delay)

        after = {
            "title": read_value("#hero-title"),
            "subtitle": read_value("#hero-subtitle"),
            "image": read_value("#hero-image"),
            "scale": read_value("#hero-scale"),
            "img_x": read_value("#hero-img-x"),
            "img_y": read_value("#hero-img-y"),
            "title_x": read_value("#hero-title-x"),
            "title_y": read_value("#hero-title-y"),
            "title_size": read_value("#hero-title-size"),
            "sub_x": read_value("#hero-sub-x"),
            "sub_y": read_value("#hero-sub-y"),
            "sub_size": read_value("#hero-sub-size"),
            "top_bar": read_value("#hero-top-bar"),
            "bottom_bar": read_value("#hero-bot-bar"),
            "overlay": read_value("#hero-overlay"),
        }

        log_fn(f"Antes: title={current['title']}, subtitle={current['subtitle']}")
        log_fn(f"Depois: title={after['title']}, subtitle={after['subtitle']}")

        log_fn("Aguardando salvar...")
        time.sleep(3)
        
        log_fn("Pressione Enter para fechar o navegador...")
        input()

        log_fn("Concluído.")
        browser.close()


class HeroAutomationGUI(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Hero Automation")
        self.geometry("720x640")
        self.resizable(False, False)

        self.url_var = tk.StringVar(value="http://localhost:3000/admin/")
        self.password_var = tk.StringVar(value="")
        self.headless_var = tk.BooleanVar(value=False)
        self.step_delay_var = tk.DoubleVar(value=0.4)

        self.title_var = tk.StringVar(value="Hero - Teste Automático")
        self.subtitle_var = tk.StringVar(value="Subtítulo de teste automático")
        self.image_var = tk.StringVar(value="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1600&auto=format&fit=crop")

        self.scale_var = tk.DoubleVar(value=1.2)
        self.img_x_var = tk.IntVar(value=50)
        self.img_y_var = tk.IntVar(value=50)
        self.title_x_var = tk.IntVar(value=50)
        self.title_y_var = tk.IntVar(value=40)
        self.title_size_var = tk.IntVar(value=48)
        self.sub_x_var = tk.IntVar(value=50)
        self.sub_y_var = tk.IntVar(value=55)
        self.sub_size_var = tk.IntVar(value=18)
        self.top_bar_var = tk.IntVar(value=8)
        self.bottom_bar_var = tk.IntVar(value=8)
        self.overlay_var = tk.IntVar(value=30)

        self._build_ui()

    def _build_ui(self):
        pad = {"padx": 10, "pady": 6}

        header = ttk.Label(self, text="Automação do Hero (Login + Alterações)", font=("Arial", 14, "bold"))
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

        hero = ttk.LabelFrame(self, text="Valores do Hero")
        hero.pack(fill="x", padx=12)

        ttk.Label(hero, text="Título").grid(row=0, column=0, sticky="w", **pad)
        ttk.Entry(hero, textvariable=self.title_var, width=60).grid(row=0, column=1, sticky="w", **pad)

        ttk.Label(hero, text="Subtítulo").grid(row=1, column=0, sticky="w", **pad)
        ttk.Entry(hero, textvariable=self.subtitle_var, width=60).grid(row=1, column=1, sticky="w", **pad)

        ttk.Label(hero, text="Imagem (URL)").grid(row=2, column=0, sticky="w", **pad)
        ttk.Entry(hero, textvariable=self.image_var, width=60).grid(row=2, column=1, sticky="w", **pad)

        sliders = ttk.LabelFrame(self, text="Sliders")
        sliders.pack(fill="x", padx=12, pady=8)

        self._add_slider(sliders, "Zoom", self.scale_var, 0.5, 2.0, 0.05, 0)
        self._add_slider(sliders, "Imagem X", self.img_x_var, 0, 100, 1, 1)
        self._add_slider(sliders, "Imagem Y", self.img_y_var, 0, 100, 1, 2)
        self._add_slider(sliders, "Título X", self.title_x_var, 0, 100, 1, 3)
        self._add_slider(sliders, "Título Y", self.title_y_var, 0, 100, 1, 4)
        self._add_slider(sliders, "Título Size", self.title_size_var, 20, 80, 1, 5)
        self._add_slider(sliders, "Sub X", self.sub_x_var, 0, 100, 1, 6)
        self._add_slider(sliders, "Sub Y", self.sub_y_var, 0, 100, 1, 7)
        self._add_slider(sliders, "Sub Size", self.sub_size_var, 10, 40, 1, 8)
        self._add_slider(sliders, "Faixa Top", self.top_bar_var, 0, 25, 1, 9)
        self._add_slider(sliders, "Faixa Bot", self.bottom_bar_var, 0, 25, 1, 10)
        self._add_slider(sliders, "Overlay", self.overlay_var, 0, 80, 1, 11)

        controls = ttk.Frame(self)
        controls.pack(fill="x", padx=12, pady=8)

        ttk.Button(controls, text="Executar Automação", command=self.run_automation).pack(side="left")
        ttk.Button(controls, text="Limpar Log", command=self.clear_log).pack(side="left", padx=8)

        self.log = tk.Text(self, height=12, wrap="word")
        self.log.pack(fill="both", padx=12, pady=6, expand=True)

    def _add_slider(self, parent, label, var, frm, to, step, row):
        ttk.Label(parent, text=label).grid(row=row, column=0, sticky="w", padx=10, pady=4)
        ttk.Spinbox(parent, textvariable=var, from_=frm, to=to, increment=step, width=8).grid(row=row, column=1, sticky="w", padx=10, pady=4)

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
        values = {
            "title": self.title_var.get(),
            "subtitle": self.subtitle_var.get(),
            "image": self.image_var.get(),
            "scale": self.scale_var.get(),
            "img_x": self.img_x_var.get(),
            "img_y": self.img_y_var.get(),
            "title_x": self.title_x_var.get(),
            "title_y": self.title_y_var.get(),
            "title_size": self.title_size_var.get(),
            "sub_x": self.sub_x_var.get(),
            "sub_y": self.sub_y_var.get(),
            "sub_size": self.sub_size_var.get(),
            "top_bar": self.top_bar_var.get(),
            "bottom_bar": self.bottom_bar_var.get(),
            "overlay": self.overlay_var.get(),
        }

        try:
            run_playwright_automation(url, password, headless, values, step_delay, self.log_msg)
        except Exception as e:
            self.log_msg(f"Erro: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Automação do Hero (GUI ou CLI).")
    parser.add_argument("--url", help="URL do admin")
    parser.add_argument("--password", help="Senha do admin")
    parser.add_argument("--headless", action="store_true", help="Executa em modo headless")
    parser.add_argument("--headed", action="store_true", help="Executa com navegador visível")
    parser.add_argument("--step-delay", type=float, default=0.4, help="Delay entre ações (s)")
    args = parser.parse_args()

    if args.url and args.password:
        values = {
            "title": "Hero - Teste Automático",
            "subtitle": "Subtítulo de teste automático",
            "image": "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1600&auto=format&fit=crop",
            "scale": 1.2,
            "img_x": 50,
            "img_y": 50,
            "title_x": 50,
            "title_y": 40,
            "title_size": 48,
            "sub_x": 50,
            "sub_y": 55,
            "sub_size": 18,
            "top_bar": 8,
            "bottom_bar": 8,
            "overlay": 30,
        }
        headless = True if args.headless else False
        if args.headed:
            headless = False
        run_playwright_automation(args.url, args.password, headless, values, args.step_delay)
    else:
        app = HeroAutomationGUI()
        app.mainloop()
