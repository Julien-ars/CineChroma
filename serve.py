#!/usr/bin/env python3
"""
CineChroma — serve.py
Serveur web local avec API d'administration pour ajouter et actualiser des films en direct sur le disque.

Usage:
  python serve.py
  (Ouvrir ensuite http://localhost:3000 dans votre navigateur)
"""

import os
import sys
import json
import gzip
import io
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Cache mémoire pour les fichiers gzippés avec mtime
_GZIP_CACHE = {}

# Reconfiguration UTF-8
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Import du pipeline TMDb
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "scripts"))
try:
    from pipeline_core import (
        fetch_tmdb_media_full,
        load_database,
        save_database,
        search_tmdb_media,
        get_tmdb_session
    )
except ImportError:
    print("⚠️ Impossible d'importer pipeline_core.py.")


PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class CineChromaHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Gzip compression on-the-fly for heavy JSON / JS / CSS assets
        accept_encoding = self.headers.get("Accept-Encoding", "")
        clean_path = self.path.split("?")[0].lstrip("/")
        file_path = os.path.join(DIRECTORY, clean_path)

        if "gzip" in accept_encoding and os.path.isfile(file_path) and clean_path.endswith(('.json', '.js', '.css', '.html')):
            try:
                mtime = os.path.getmtime(file_path)
                cached = _GZIP_CACHE.get(clean_path)

                if cached and cached.get("mtime") == mtime:
                    gzipped_data = cached["data"]
                else:
                    with open(file_path, "rb") as f:
                        content = f.read()
                    out = io.BytesIO()
                    with gzip.GzipFile(fileobj=out, mode="wb", compresslevel=6) as gz:
                        gz.write(content)
                    gzipped_data = out.getvalue()
                    _GZIP_CACHE[clean_path] = {"mtime": mtime, "data": gzipped_data}

                content_type = self.guess_type(file_path)
                self.send_response(200)
                self.send_header("Content-Type", f"{content_type}; charset=utf-8" if content_type.startswith("text/") or "json" in content_type else content_type)
                self.send_header("Content-Encoding", "gzip")
                self.send_header("Content-Length", str(len(gzipped_data)))
                self.send_header("Vary", "Accept-Encoding")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Cache-Control", "no-cache" if clean_path.endswith('.json') else "public, max-age=3600")
                self.end_headers()
                self.wfile.write(gzipped_data)
                return
            except Exception as e:
                pass

        super().do_GET()

    def do_POST(self):
        if self.path == "/api/add-film":
            self.handle_add_film()
        elif self.path == "/api/search-tmdb":
            self.handle_search_tmdb()
        else:
            self.send_error(404, "Endpoint inconnu")

    def handle_search_tmdb(self):
        try:
            content_len = int(self.headers.get('Content-Length', 0))
            post_body = self.rfile.read(content_len)
            params = json.loads(post_body.decode('utf-8'))
            query = params.get("query", "").strip()
            media_type = params.get("type", "all")

            results = search_tmdb_media(query, media_type=media_type)
            response_bytes = json.dumps({"success": True, "results": results[:10]}, ensure_ascii=False).encode('utf-8')

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(response_bytes)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(response_bytes)
        except Exception as e:
            self.send_json_error(str(e))

    def handle_add_film(self):
        try:
            content_len = int(self.headers.get('Content-Length', 0))
            post_body = self.rfile.read(content_len)
            params = json.loads(post_body.decode('utf-8'))
            media_id = int(params.get("id"))
            media_type = params.get("media_type") or params.get("type") or "movie"

            print(f"\n⚡ [Serveur] Demande d'ajout reçu pour {media_type.upper()} ID {media_id}...")
            session = get_tmdb_session()
            media_obj = fetch_tmdb_media_full(media_id, media_type, session)

            if not media_obj:
                self.send_json_error("Impossible de récupérer l'œuvre sur TMDb", 400)
                return

            all_films = load_database()
            existing_idx = next((i for i, f in enumerate(all_films) if f.get("id") == media_id and f.get("type_media", "movie") == media_type), None)

            if existing_idx is not None:
                all_films[existing_idx] = media_obj
            else:
                all_films.insert(0, media_obj)

            save_database(all_films)
            print(f"🎉 [Serveur] Œuvre '{media_obj.get('titre')}' enregistrée sur le disque !")

            # Évaluation du filtre de qualité
            vote_count = media_obj.get("vote_count", 0)
            is_qualified = vote_count >= 50 and not media_obj.get("adult", False) and len(media_obj.get("affiches_globales", [])) > 0
            reason = "Critères de qualité validés (≥50 votes TMDb)" if is_qualified else f"Notoriété restreinte ({vote_count} votes TMDb)"

            response_bytes = json.dumps({
                "success": True, 
                "film": media_obj,
                "qualified_for_global": is_qualified,
                "quality_reason": reason
            }, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(response_bytes)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(response_bytes)

        except Exception as e:
            print(f"❌ [Serveur] Erreur ajout : {e}")
            self.send_json_error(str(e))

    def send_json_error(self, message: str, code: int = 500):
        response_bytes = json.dumps({"success": False, "error": message}, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(response_bytes)


def run_server():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, CineChromaHandler)
    print("=" * 60)
    print(f"🎬 Serveur CineChroma actif sur : http://localhost:{PORT}")
    print("✨ L'ajout et la synchronisation de films sont activés en direct !")
    print("=" * 60)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nArrêt du serveur.")
        httpd.server_close()


if __name__ == "__main__":
    run_server()
