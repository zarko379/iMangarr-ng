from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from markupsafe import Markup   # ← ESTA ES LA CLAVE
import os
import json
import httpx
from datetime import datetime

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

CONFIG_FILE = "config.json"
LIBRARY_FILE = "library.json"

def get_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE) as f:
            return json.load(f)
    return None

def save_config(root_path: str):
    config = {"root_path": root_path, "indexer": "nyaa"}
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=2)

def get_library():
    if os.path.exists(LIBRARY_FILE):
        with open(LIBRARY_FILE) as f:
            return json.load(f)
    return []

def save_library(library):
    with open(LIBRARY_FILE, "w") as f:
        json.dump(library, f, indent=2)

ANILIST_QUERY = """
query ($search: String) {
  Page(page: 1, perPage: 10) {
    media(type: MANGA, search: $search, sort: SEARCH_MATCH) {
      id
      title { romaji english native }
      coverImage { extraLarge }
      status
      chapters
      volumes
    }
  }
}
"""

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    config = get_config()
    if not config:
        return templates.TemplateResponse("setup.html", {"request": request})
    library = get_library()
    return templates.TemplateResponse("dashboard.html", {"request": request, "config": config, "library": library})

@app.get("/setup", response_class=HTMLResponse)
async def setup_page(request: Request):
    return templates.TemplateResponse("setup.html", {"request": request})

@app.post("/setup")
async def setup_save(request: Request, root_path: str = Form(...)):
    save_config(root_path)
    return templates.TemplateResponse("dashboard.html", {"request": request, "config": get_config(), "library": get_library()})

@app.get("/calendar")
async def calendar(request: Request): return templates.TemplateResponse("calendar.html", {"request": request})
@app.get("/activity")
async def activity(request: Request): return templates.TemplateResponse("activity.html", {"request": request})
@app.get("/wanted")
async def wanted(request: Request): return templates.TemplateResponse("wanted.html", {"request": request})
@app.get("/settings")
async def settings(request: Request): return templates.TemplateResponse("settings.html", {"request": request})

# BÚSQUEDA - AHORA SÍ FUNCIONA 100%
@app.get("/search-results", response_class=HTMLResponse)
async def search_results(q: str = ""):
    if len(q) < 3:
        return Markup("<p class='text-center text-slate-400 py-20 text-2xl'>Escribe al menos 3 caracteres...</p>")

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://graphql.anilist.co",
                json={"query": ANILIST_QUERY, "variables": {"search": q}},
                timeout=10.0
            )
            response.raise_for_status()
        except:
            return Markup("<p class='text-center text-red-400 py-20 text-2xl'>Error conectando con AniList</p>")

    data = response.json().get("data", {}).get("Page", {}).get("media", [])
    if not data:
        return Markup(f"<p class='text-center text-slate-400 py-20 text-2xl'>No hay resultados para <strong class='text-cyan-300'>'{q}'</strong></p>")

    library_ids = {m["id"] for m in get_library()}
    results = "<div class='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 py-8'>"

    for manga in data:
        title = manga["title"]["romaji"] or manga["title"]["english"] or manga["title"]["native"]
        cover = manga["coverImage"]["extraLarge"]
        manga_id = str(manga["id"])
        chapters = manga["chapters"] or "?"
        volumes = manga["volumes"] or "?"
        status = manga["status"] or "UNKNOWN"

        status_color = {
            "RELEASING": "bg-green-500/20 text-green-400 border-green-500/50",
            "FINISHED": "bg-blue-500/20 text-blue-400 border-blue-500/50",
            "NOT_YET_RELEASED": "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
            "CANCELLED": "bg-red-500/20 text-red-400 border-red-500/50",
            "HIATUS": "bg-orange-500/20 text-orange-400 border-orange-500/50"
        }.get(status, "bg-slate-500/20 text-slate-400 border-slate-500/50")

        is_added = manga_id in library_ids

        add_button = f'''
        <form hx-post="/add-manga" hx-target="#search-results-container" hx-swap="innerHTML" class="absolute top-3 right-3">
            <input type="hidden" name="manga_id" value="{manga_id}">
            <input type="hidden" name="title" value="{title}">
            <input type="hidden" name="cover" value="{cover}">
            <button class="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-lg font-bold opacity-0 group-hover:opacity-100 transition">
                + Añadir
            </button>
        </form>
        ''' if not is_added else '''
        <div class="absolute top-3 right-3">
            <span class="bg-green-500/20 text-green-400 px-6 py-3 rounded-lg font-bold border border-green-500/50">Añadido</span>
        </div>
        '''

        results += f"""
        <div class="group relative bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700 hover:border-cyan-500 transition-all shadow-lg">
            <img src="{cover}" alt="{title}" class="w-full h-64 object-cover group-hover:scale-110 transition duration-500">
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-5">
                <h3 class="text-white font-bold text-lg line-clamp-2">{title}</h3>
                <div class="flex items-center gap-3 mt-2 text-sm">
                    <span class="px-3 py-1 rounded border {status_color} font-medium">{status.replace('_', ' ')}</span>
                    <span class="text-slate-300">Ch: {chapters} | Vol: {volumes}</span>
                </div>
            </div>
            {add_button}
        </div>
        """
    results += "</div>"
    return Markup(results)  # ← ESTA LÍNEA HACE QUE EL NAVEGADOR CARGUE LAS IMÁGENES DIRECTO

@app.post("/add-manga", response_class=HTMLResponse)
async def add_manga(request: Request, manga_id: str = Form(...), title: str = Form(...), cover: str = Form(...)):
    library = get_library()
    if any(m["id"] == manga_id for m in library):
        return Markup("<p class='text-center text-yellow-400 py-16 text-3xl font-bold'>Ya tienes este manga</p>")

    library.append({
        "id": manga_id,
        "title": title,
        "cover": cover,
        "added_at": datetime.now().isoformat(),
        "chapters_downloaded": 0,
        "volumes_downloaded": 0,
        "status": "monitoring"
    })
    save_library(library)

    return Markup(f"""
    <div class="text-center py-24 bg-green-500/10 border-2 border-green-500/50 rounded-3xl">
        <p class="text-5xl font-black text-green-400">¡AÑADIDO!</p>
        <p class="text-3xl text-white mt-4">"{title}"</p>
        <p class="text-xl text-slate-300 mt-4">Listo para descargar y monitorizar</p>
    </div>
    """)