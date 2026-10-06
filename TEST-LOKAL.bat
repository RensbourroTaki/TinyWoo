@echo off
rem Startet die Website lokal zum Testen (Doppelklick). Fenster offen lassen, zum Beenden schliessen.
cd /d "%~dp0"
start "Tiny Woo Testserver" cmd /k python -m http.server 8765 --bind 127.0.0.1
timeout /t 2 >nul
start "" "http://127.0.0.1:8765/#arcade"
