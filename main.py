from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import os
import json

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

CONFIG_FILE = "config.json"

def get_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE) as f:
            return json.load(f)
    return None

def save_config(root_path: str):
    config = {"root_path": root_path, "indexer": "nyaa"}
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=2)

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    config = get_config()
    if not config:
        return templates.TemplateResponse("setup.html", {"request": request})
    return templates.TemplateResponse("dashboard.html", {"request": request, "config": config})

@app.get("/setup", response_class=HTMLResponse)
async def setup_page(request: Request):
    return templates.TemplateResponse("setup.html", {"request": request})

@app.post("/setup")
async def setup_save(request: Request, root_path: str = Form(...)):
    save_config(root_path)
    return templates.TemplateResponse("dashboard.html", {"request": request, "config": get_config()})

@app.get("/calendar")
async def calendar(request: Request):
    return templates.TemplateResponse("calendar.html", {"request": request})

@app.get("/activity")
async def activity(request: Request):
    return templates.TemplateResponse("activity.html", {"request": request})

@app.get("/wanted")
async def wanted(request: Request):
    return templates.TemplateResponse("wanted.html", {"request": request})

@app.get("/settings")
async def settings(request: Request):
    return templates.TemplateResponse("settings.html", {"request": request})

@app.get("/search")
async def search_modal():
    return """
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" hx-on::click="this.remove()">
      <div class="bg-slate-900 rounded-2xl p-8 max-w-2xl w-full mx-4 border border-slate-700" onclick="event.stopPropagation()">
        <h2 class="text-3xl font-bold text-white mb-6">Buscar en AniList</h2>
        <input 
          type="text" 
          placeholder="Nombre del manga..." 
          class="w-full px-5 py-4 rounded-lg bg-slate-800 border border-slate-600 text-white text-lg focus:outline-none focus:border-cyan-500"
          hx-get="/search-results" 
          hx-trigger="keyup changed delay:500ms" 
          hx-target="#search-results" 
          name="q">
        <div id="search-results" class="mt-6 max-h-96 overflow-y-auto"></div>
      </div>
    </div>
    """

@app.get("/search-results")
async def search_results(q: str = ""):
    if not q or len(q) < 2:
        return """
        <div class="text-center py-32">
          <div class="mx-auto w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center mb-8">
            <svg class="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <p class="text-3xl text-slate-400">Escribe para buscar en AniList</p>
        </div>
        """
    
    # Simulación mientras no tengamos AniList
    return f"""
    <div class="text-center py-24">
      <p class="text-3xl text-cyan-300 mb-4">Buscando: <strong>"{q}"</strong></p>
      <div class="inline-flex items-center gap-4 mt-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-cyan-500"></div>
        <p class="text-xl text-slate-400">Conectando con AniList API...</p>
      </div>
    </div>
    """