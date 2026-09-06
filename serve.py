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
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Reconfiguration UTF-8
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Import du pipeline TMDb
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "scripts"))
try:
    from pipeline_core import (
        fetch_tmdb_movie_full,
        load_database,
        save_database,
        search_tmdb_movies,
        get_tmdb_session
    )
except ImportError:
    print("⚠️ Impossible d'importer pipeline_core.py.")


PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class CineChromaHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

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

            results = search_tmdb_movies(query)
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
            movie_id = int(params.get("id"))

            print(f"\n⚡ [Serveur] Demande d'ajout reçu pour film ID {movie_id}...")
            session = get_tmdb_session()
            film_obj = fetch_tmdb_movie_full(movie_id, session)

            if not film_obj:
                self.send_json_error("Impossible de récupérer le film sur TMDb", 400)
                return

            all_films = load_database()
            existing_idx = next((i for i, f in enumerate(all_films) if f.get("id") == movie_id), None)

            if existing_idx is not None:
                all_films[existing_idx] = film_obj
            else:
                all_films.insert(0, film_obj)

            save_database(all_films)
            print(f"🎉 [Serveur] Film '{film_obj.get('titre')}' enregistré sur le disque !")

            response_bytes = json.dumps({"success": True, "film": film_obj}, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(response_bytes)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(response_bytes)

        except Exception as e:
            print(f"❌ [Serveur] Erreur ajout film : {e}")
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
